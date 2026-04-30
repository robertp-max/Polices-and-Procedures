import type { DemoUser as AuthDemoUser } from '@/auth/api';
import { getDemoUserById, resolveUserIdFromAuth } from './demoUsers';
import { PERMISSION_BY_ID } from './permissionCatalog';
import { getActiveAssignments } from './roleAssignments';
import { evaluateSeparationOfDuties } from './separationOfDuties';
import { USER_GROUP_BY_ID } from './userGroups';
import type { AccessDecisionEvent, Decision, PermissionId, ResourceRef, RoleAssignment, Scope, UserGroup } from './types';

const ACCESS_DECISION_EVENTS: AccessDecisionEvent[] = [];

function deny(reasonCode: string, reason: string): Decision {
  return { allow: false, reasonCode, reason, obligations: [] };
}

function allow(reason: string, obligations: Decision['obligations'] = []): Decision {
  return { allow: true, reasonCode: 'allow.granted', reason, obligations };
}

function scopeMatches(assignmentScope: Scope, resourceScope?: Scope): boolean {
  if (!resourceScope) return true;
  if (assignmentScope.organizationId !== resourceScope.organizationId) return false;
  if (assignmentScope.branchId && resourceScope.branchId && assignmentScope.branchId !== resourceScope.branchId) return false;
  if (assignmentScope.programId && resourceScope.programId && assignmentScope.programId !== resourceScope.programId) return false;
  if (assignmentScope.patientId && resourceScope.patientId && assignmentScope.patientId !== resourceScope.patientId) return false;
  return true;
}

function collectGroups(assignments: RoleAssignment[]): UserGroup[] {
  const groups: UserGroup[] = [];
  assignments.forEach((assignment) => {
    const group = USER_GROUP_BY_ID[assignment.groupId];
    if (group) groups.push(group);
  });
  return groups;
}

function pushAccessDecision(actorUserId: string, permission: PermissionId, resource: ResourceRef, decision: Decision): void {
  ACCESS_DECISION_EVENTS.push({
    timestamp: new Date().toISOString(),
    actorUserId,
    permission,
    resourceKind: resource.kind,
    resourceId: resource.id,
    allow: decision.allow,
    reasonCode: decision.reasonCode,
  });
}

export function emitAccessDecision(event: AccessDecisionEvent): void {
  ACCESS_DECISION_EVENTS.push(event);
}

export function listAccessDecisionEvents(): AccessDecisionEvent[] {
  return [...ACCESS_DECISION_EVENTS];
}

export function authorize(userId: string, permission: PermissionId, resource: ResourceRef, atIso = new Date().toISOString()): Decision {
  const permissionMeta = PERMISSION_BY_ID[permission];
  if (!permissionMeta) {
    const decision = deny('permission.unknown', 'Permission is not defined in the Phase A catalog.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  const user = getDemoUserById(userId);
  if (!user) {
    const decision = deny('user.unknown', 'User identity was not found in the Phase A demo dataset.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  if (user.status !== 'active') {
    const decision = deny('user.suspended', 'User is suspended and cannot execute access-controlled actions.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  const assignments = getActiveAssignments(userId, atIso);
  if (assignments.length === 0) {
    const decision = deny('user.no_assignment', 'User has no active role assignment for this environment.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  const inScope = assignments.some(assignment => scopeMatches(assignment.scope, resource.scope));
  if (!inScope) {
    const decision = deny('scope.mismatch', 'Role assignment scope does not cover the requested resource scope.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  const groups = collectGroups(assignments);
  const granted = groups.some(group => group.permissions.includes(permission));
  if (!granted) {
    const decision = deny('permission.not_granted', 'No active group assignment grants this permission.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  if (permission === 'policy.publish' && resource.meta?.isApprovedVersion !== true) {
    const decision = deny('policy.publish.requires_approved_version', 'Policy publish requires an approved policy version.');
    pushAccessDecision(userId, permission, resource, decision);
    return decision;
  }

  const sodDecision = evaluateSeparationOfDuties({
    actorUserId: userId,
    groups,
    permission,
    resource,
  });
  if (sodDecision) {
    pushAccessDecision(userId, permission, resource, sodDecision);
    return sodDecision;
  }

  const obligations: Decision['obligations'] = [];
  if (permissionMeta.phi || resource.containsPhi) {
    obligations.push({ code: 'log_phi_access', detail: 'Record PHI access marker in event stream.' });
  }
  if (permission === 'ceu.override') {
    obligations.push({ code: 'require_dual_approval', detail: 'Override flow requires two distinct approvers.' });
    obligations.push({ code: 'require_reason', detail: 'Override reason must be captured for traceability.' });
  }

  const decision = allow('Permission granted by deterministic Phase A authorize evaluation.', obligations);
  pushAccessDecision(userId, permission, resource, decision);
  return decision;
}

export function authorizeForAuthUser(
  authUser: AuthDemoUser | null,
  permission: PermissionId,
  resource: ResourceRef,
  atIso = new Date().toISOString(),
): Decision {
  const userId = resolveUserIdFromAuth(authUser);
  return authorize(userId, permission, resource, atIso);
}
