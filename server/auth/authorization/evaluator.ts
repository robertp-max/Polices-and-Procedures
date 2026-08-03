/**
 * ADR-0002 Phase 3B — server-authoritative effective-access evaluator.
 *
 * Pure functions (no I/O), mirroring the Phase-2 semantic-core pattern so the
 * evaluation is deterministic and unit-testable. Enforces the ADR §B5 precedence
 * for every decision:
 *
 *   account-status / global deny
 *     → policy / separation-of-duties deny
 *       → scoped security-permission allow
 *         → (page-visibility projection lives in Phase 4, not here)
 *
 * `computeEffectiveAccess` produces the full explained permission set for the
 * admin UI; `authorizeAction` renders a single precedence-ordered decision.
 */
import {
  POLICY_VERSION, USER_GROUP_BY_ID, groupsGranting, hasPrivilegedGroup,
  permissionsForGroups, type PermissionId, type Scope,
} from './catalog.js';
import type {
  AuthorizationDecision, AuthorizationReasonCode, AuthorizationResourceRef,
  AuthorizationScopeRef, AuthorizationSource,
} from './decision.js';

export interface EffectiveAccessAssignment {
  groupId: string;
  scope: Scope;
}

export interface EffectiveAccessInput {
  principalUserId: string;
  /** Canonical/lifecycle status. Only 'active' permits any permission. */
  accountStatus: string;
  assignments: readonly EffectiveAccessAssignment[];
  nowIso: string;
  policyVersion?: string;
}

export interface EffectiveAccess {
  principalUserId: string;
  accountActive: boolean;
  accountStatus: string;
  groupIds: string[];
  privileged: boolean;
  permissions: PermissionId[];
  /** group→permission provenance (or the account-status withholding reason). */
  sources: AuthorizationSource[];
  evaluatedAt: string;
  policyVersion: string;
}

/** Full explained effective-access projection for a principal. Account-status
 *  deny withholds ALL permissions (fail-closed), never a partial set. */
export function computeEffectiveAccess(input: EffectiveAccessInput): EffectiveAccess {
  const policyVersion = input.policyVersion ?? POLICY_VERSION;
  const groupIds = [...new Set(input.assignments.map((a) => a.groupId))];
  const active = input.accountStatus === 'active';
  const permissions = active ? [...permissionsForGroups(groupIds)].sort() : [];
  const sources: AuthorizationSource[] = active
    ? permissions.map((p) => ({ type: 'group', id: groupsGranting(p, groupIds)[0] ?? 'unknown', detail: p }))
    : [{ type: 'account_status', id: input.accountStatus, detail: 'account not active — all permissions withheld' }];
  return {
    principalUserId: input.principalUserId,
    accountActive: active,
    accountStatus: input.accountStatus,
    groupIds,
    privileged: active && hasPrivilegedGroup(groupIds),
    permissions,
    sources,
    evaluatedAt: input.nowIso,
    policyVersion,
  };
}

export interface AuthorizeRequest {
  action: PermissionId;
  resource: AuthorizationResourceRef;
  scope?: AuthorizationScopeRef;
  /** Resource-specific separation-of-duties rules live at the call site; when a
   *  conflict is detected there, it is passed in and denies here (precedence 2). */
  separationOfDutiesConflict?: { rule: string; conflictingActorId?: string } | null;
}

function scopeMatches(assignmentScope: Scope, requested?: AuthorizationScopeRef): boolean {
  if (!requested) return true;
  if (requested.organizationId && assignmentScope.organizationId !== requested.organizationId) return false;
  if (requested.branchId && assignmentScope.branchId && assignmentScope.branchId !== requested.branchId) return false;
  return true;
}

/** Single authorization decision with the ADR §B5 precedence and full explanation. */
export function authorizeAction(
  input: EffectiveAccessInput,
  request: AuthorizeRequest,
  newDecisionId: () => string,
): AuthorizationDecision {
  const policyVersion = input.policyVersion ?? POLICY_VERSION;
  const base = {
    decisionId: newDecisionId(),
    principalUserId: input.principalUserId,
    action: request.action,
    resource: request.resource,
    scope: request.scope,
    evaluatedAt: input.nowIso,
    policyVersion,
  };
  const settle = (allowed: boolean, reasonCode: AuthorizationReasonCode, sources: AuthorizationSource[]): AuthorizationDecision =>
    ({ ...base, allowed, reasonCode, sources });

  // 1 — global / account-status deny (fail-closed)
  if (input.accountStatus !== 'active') {
    return settle(false, 'ACCOUNT_NOT_ACTIVE', [{ type: 'account_status', id: input.accountStatus }]);
  }

  // 2 — policy / separation-of-duties deny
  if (request.separationOfDutiesConflict) {
    return settle(false, 'SEPARATION_OF_DUTIES', [{
      type: 'separation_of_duties',
      id: request.separationOfDutiesConflict.rule,
      detail: request.separationOfDutiesConflict.conflictingActorId,
    }]);
  }

  // 3 — scoped security-permission allow
  const grantingAssignments = input.assignments.filter(
    (a) => USER_GROUP_BY_ID[a.groupId]?.permissions.includes(request.action),
  );
  if (grantingAssignments.length === 0) {
    return settle(false, 'MISSING_PERMISSION', [{ type: 'group', id: 'none', detail: request.action }]);
  }
  const scoped = grantingAssignments.filter((a) => scopeMatches(a.scope, request.scope));
  if (scoped.length === 0) {
    return settle(false, 'SCOPE_MISMATCH', grantingAssignments.map((a) => ({ type: 'group', id: a.groupId, detail: request.action })));
  }
  return settle(true, 'ALLOWED_BY_GROUP', scoped.map((a) => ({ type: 'group', id: a.groupId, detail: request.action })));
}
