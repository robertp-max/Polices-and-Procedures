/**
 * COG-2 — server-authoritative user-access management (pure registry ops).
 *
 * Each operation takes the current AppIdentityRegistry plus the acting Actor
 * and returns a new registry + an audit-friendly change record, or throws a
 * typed ApiError. Purity keeps every rule (self-escalation denial, last-admin
 * protection, role-removal semantics) unit-testable. Persistence + audit are
 * the caller's responsibility (route layer).
 */
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import type { AppIdentityRegistry, AppIdentityUser, AppRoleAssignment } from './appIdentityPersistence.js';
import {
  PRIVILEGED_GROUP_IDS, SUPER_ADMIN_GROUP_ID, activeRoleGroupIds, actorHasAnyRole,
} from './actorResolver.js';

export interface AccessStateRow {
  userId: string;
  email: string;
  name: string;
  status: AppIdentityUser['status'];
  authSubject?: string;
  provider?: string;
  roles: string[];
  privileged: boolean;
}

export interface AccessChange {
  action: string;
  targetUserId: string;
  before: Partial<AccessStateRow>;
  after: Partial<AccessStateRow>;
  registry: AppIdentityRegistry;
}

const ADMIN_ROLES = ['grp-super-admin', 'grp-admin', 'grp-user-access-admin'];

function clone(registry: AppIdentityRegistry): AppIdentityRegistry {
  return {
    users: registry.users.map((u) => ({ ...u })),
    assignments: registry.assignments.map((a) => ({ ...a, scope: { ...a.scope } })),
    syncedCount: registry.syncedCount,
  };
}

function requireUser(registry: AppIdentityRegistry, userId: string): AppIdentityUser {
  const u = registry.users.find((x) => x.id === userId);
  if (!u) throw new ApiError('validation_error', `User ${userId} not found.`, 404);
  return u;
}

/** Read-only projection of every user's access state. */
export function listAccessState(registry: AppIdentityRegistry, nowIso: string): AccessStateRow[] {
  return registry.users.map((u) => {
    const roles = activeRoleGroupIds(registry, u.id, nowIso);
    return {
      userId: u.id,
      email: u.email,
      name: u.name,
      status: u.status,
      authSubject: u.authSubject,
      provider: u.provider,
      roles,
      privileged: roles.some((r) => PRIVILEGED_GROUP_IDS.has(r)),
    };
  });
}

function countActivePrivilegedAdmins(registry: AppIdentityRegistry, nowIso: string): number {
  return registry.users.filter((u) => {
    if (u.status !== 'active') return false;
    return activeRoleGroupIds(registry, u.id, nowIso).includes(SUPER_ADMIN_GROUP_ID);
  }).length;
}

/**
 * Guard: may this actor suspend this target? Blocks self-suspension and
 * suspending the last active super-admin. Pure (throws or returns). Shared by
 * the pure canonical mutation AND the durable lifecycle transition (Phase 2E),
 * so both enforce identical policy.
 */
export function assertCanSuspend(
  registry: AppIdentityRegistry,
  actorUserId: string | undefined,
  targetUserId: string,
  nowIso: string,
): void {
  requireUser(registry, targetUserId);
  if (actorUserId === targetUserId) {
    throw new ApiError('validation_error', 'You cannot suspend your own account.', 400);
  }
  const targetRoles = activeRoleGroupIds(registry, targetUserId, nowIso);
  if (targetRoles.includes(SUPER_ADMIN_GROUP_ID) && countActivePrivilegedAdmins(registry, nowIso) <= 1) {
    throw new ApiError('validation_error', 'Cannot suspend the last active super-admin.', 400);
  }
}

/** Guard: may this target be reactivated? (Existence check; reactivation
 *  restores access, never privilege.) */
export function assertCanReactivate(registry: AppIdentityRegistry, targetUserId: string): void {
  requireUser(registry, targetUserId);
}

/** Suspend a user. Blocks self-suspension and suspending the last super-admin. */
export function suspendUser(
  registry: AppIdentityRegistry,
  actor: Actor,
  targetUserId: string,
  nowIso: string,
): AccessChange {
  const next = clone(registry);
  assertCanSuspend(next, actor.user_id, targetUserId, nowIso);
  const target = requireUser(next, targetUserId);
  const before = { status: target.status };
  target.status = 'suspended';
  return {
    action: 'user_access.suspend',
    targetUserId,
    before,
    after: { status: 'suspended' },
    registry: next,
  };
}

/** Reactivate a suspended user. */
export function reactivateUser(
  registry: AppIdentityRegistry,
  _actor: Actor,
  targetUserId: string,
): AccessChange {
  const next = clone(registry);
  assertCanReactivate(next, targetUserId);
  const target = requireUser(next, targetUserId);
  const before = { status: target.status };
  target.status = 'active';
  return {
    action: 'user_access.reactivate',
    targetUserId,
    before,
    after: { status: 'active' },
    registry: next,
  };
}

/**
 * Assign a role group to a user. Enforces:
 *  - only a privileged admin may assign any role (checked at route via requireRole);
 *  - only a super-admin may grant a PRIVILEGED role;
 *  - an actor may not grant a privileged role to THEMSELVES (self-escalation).
 */
export function assignRole(
  registry: AppIdentityRegistry,
  actor: Actor,
  targetUserId: string,
  groupId: string,
  nowIso: string,
): AccessChange {
  const next = clone(registry);
  requireUser(next, targetUserId); // existence guard (throws 404 if missing)
  const grantingPrivileged = PRIVILEGED_GROUP_IDS.has(groupId);

  if (grantingPrivileged) {
    if (actor.user_id === targetUserId) {
      throw new ApiError('permission_denied', 'You cannot grant yourself a privileged role.', 403);
    }
    if (!actorHasAnyRole(actor, [SUPER_ADMIN_GROUP_ID])) {
      throw new ApiError('permission_denied', 'Only a super-admin may grant privileged roles.', 403);
    }
  }

  const before = { roles: activeRoleGroupIds(next, targetUserId, nowIso) };
  const already = next.assignments.find(
    (a) => a.userId === targetUserId && a.groupId === groupId && !a.revokedAt,
  );
  if (!already) {
    const assignment: AppRoleAssignment = {
      id: `asg_${targetUserId}_${groupId}_${nowIso}`,
      userId: targetUserId,
      groupId,
      scope: { organizationId: 'careindeed-demo' },
      effectiveFrom: nowIso,
    };
    next.assignments.push(assignment);
  }
  return {
    action: 'user_access.assign_role',
    targetUserId,
    before,
    after: { roles: activeRoleGroupIds(next, targetUserId, nowIso) },
    registry: next,
  };
}

/**
 * Remove (revoke) a role group from a user. A revoked assignment stops being
 * effective immediately, so the next request resolves without that role.
 * Blocks removing the last super-admin's super-admin role.
 */
export function removeRole(
  registry: AppIdentityRegistry,
  actor: Actor,
  targetUserId: string,
  groupId: string,
  nowIso: string,
): AccessChange {
  const next = clone(registry);
  requireUser(next, targetUserId);
  if (PRIVILEGED_GROUP_IDS.has(groupId) && !actorHasAnyRole(actor, [SUPER_ADMIN_GROUP_ID])) {
    throw new ApiError('permission_denied', 'Only a super-admin may remove privileged roles.', 403);
  }
  if (groupId === SUPER_ADMIN_GROUP_ID && countActivePrivilegedAdmins(next, nowIso) <= 1) {
    const targetHas = activeRoleGroupIds(next, targetUserId, nowIso).includes(SUPER_ADMIN_GROUP_ID);
    if (targetHas) {
      throw new ApiError('validation_error', 'Cannot remove the last active super-admin.', 400);
    }
  }
  const before = { roles: activeRoleGroupIds(next, targetUserId, nowIso) };
  for (const a of next.assignments) {
    if (a.userId === targetUserId && a.groupId === groupId && !a.revokedAt) {
      a.revokedAt = nowIso;
    }
  }
  return {
    action: 'user_access.remove_role',
    targetUserId,
    before,
    after: { roles: activeRoleGroupIds(next, targetUserId, nowIso) },
    registry: next,
  };
}

export const USER_ACCESS_ADMIN_ROLES = ADMIN_ROLES;
