/**
 * COG-2 — resolve a verified Cognito identity to the canonical CIHHC actor.
 *
 * The resulting Actor's identity, roles, and status come ONLY from the
 * server-side AppIdentityRegistry (canonical User + role assignments) keyed by
 * the verified Cognito `sub`. Client-supplied x-user-* headers are never
 * consulted. Pure over an injected registry so every denial path is
 * unit-testable without a live backend.
 */
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import type { AppIdentityRegistry, AppIdentityUser, AppRoleAssignment } from './appIdentityPersistence.js';

/** Role/group ids that carry privileged (admin) authority. */
export const PRIVILEGED_GROUP_IDS = new Set([
  'grp-super-admin',
  'grp-admin',
  'grp-system',
  'grp-user-access-admin',
]);
export const SUPER_ADMIN_GROUP_ID = 'grp-super-admin';

export interface VerifiedIdentity {
  sub: string;
  email: string;
}

function normalizeEmail(email: string | null | undefined): string {
  return String(email ?? '').trim().toLowerCase();
}

/** Active (non-revoked, in-window) role group ids for a user. */
export function activeRoleGroupIds(
  registry: AppIdentityRegistry,
  userId: string,
  nowIso: string,
): string[] {
  return registry.assignments
    .filter((a: AppRoleAssignment) => a.userId === userId)
    .filter((a) => !a.revokedAt)
    .filter((a) => !a.effectiveFrom || a.effectiveFrom <= nowIso)
    .filter((a) => !a.effectiveTo || a.effectiveTo > nowIso)
    .map((a) => a.groupId);
}

/** Find the canonical user for a verified token: by Cognito sub, else email. */
export function findCanonicalUser(
  registry: AppIdentityRegistry,
  identity: VerifiedIdentity,
): AppIdentityUser | null {
  const bySub = registry.users.find((u) => u.authSubject && u.authSubject === identity.sub);
  if (bySub) return bySub;
  const email = normalizeEmail(identity.email);
  if (!email) return null;
  return registry.users.find((u) => normalizeEmail(u.email) === email) ?? null;
}

/**
 * Resolve a verified identity to a server-authoritative Actor.
 * Fail-closed: throws 403 for an unknown sub or a non-active (suspended/
 * pending/disabled) canonical user.
 */
export function resolveServerActor(
  identity: VerifiedIdentity,
  registry: AppIdentityRegistry,
  nowIso: string,
): Actor {
  const user = findCanonicalUser(registry, identity);
  if (!user) {
    throw new ApiError('permission_denied', 'No canonical user is bound to this identity.', 403);
  }
  if (user.status !== 'active') {
    throw new ApiError('permission_denied', `Account is ${user.status}.`, 403);
  }
  const roles = activeRoleGroupIds(registry, user.id, nowIso);
  return {
    type: 'user',
    user_id: user.id,
    display_name: user.name || user.email,
    roles,
    attributes: { branches: [], service_lines: [], access_classes: [] },
    // MFA/IAL are NOT derived from client headers. Until a verified-token
    // signal exists they are conservative defaults (COG-2 does not enable MFA).
    mfa_enrolled: false,
    identity_assurance: 1,
  };
}

export function actorHasAnyRole(actor: Actor, groupIds: Iterable<string>): boolean {
  const want = new Set(groupIds);
  return actor.roles.some((r) => want.has(r));
}

export function actorIsPrivileged(actor: Actor): boolean {
  return actor.roles.some((r) => PRIVILEGED_GROUP_IDS.has(r));
}

/** Throw 403 unless the actor holds at least one of the required roles. */
export function assertActorRole(actor: Actor, groupIds: Iterable<string>): void {
  if (!actorHasAnyRole(actor, groupIds)) {
    throw new ApiError('permission_denied', 'You do not have permission to perform this action.', 403);
  }
}
