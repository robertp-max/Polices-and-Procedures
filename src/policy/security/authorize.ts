// Authorization service.
// See Builder/Security-Execution-Audit/01 §2 and 05 §1.

import type {
  ActorContext, Decision, Obligation, PermissionId, ResourceRef,
  RoleAssignment, UserGroup, User, UserId,
} from './types';
import { GROUP_DEFAULT_PERMISSIONS, PERMISSION_INDEX, SOD_RULES } from './permissions';
import type { SodInput } from './permissions';
import { emit } from './auditLog';

export interface IdentityProvider {
  getUser(userId: UserId): User | undefined;
  getGroups(): UserGroup[];
  getActiveAssignments(userId: UserId, at?: string): RoleAssignment[];
  // History of completed permission usages for SoD rules; bounded retrieval.
  getPermissionHistory(userId: UserId, since?: string): SodInput['history'];
}

const REAUTH_REQUIRED_ACTIONS: ReadonlySet<PermissionId> = new Set([
  'ceu.override',
  'audit.export',
  'phi.write',
]);
const REAUTH_MAX_AGE_MS = 5 * 60 * 1000;

export async function authorize(
  identity: IdentityProvider,
  actor: ActorContext,
  permission: PermissionId,
  resource: ResourceRef,
): Promise<Decision> {
  const decision = decide(identity, actor, permission, resource);

  // Mandatory audit of every authorization decision (Doc 04 §3).
  await emit({
    actor: {
      kind: actor.kind,
      userId: actor.userId,
      integrationId: actor.integrationId,
      onBehalfOf: actor.onBehalfOf,
    },
    action: decision.allow ? 'ACCESS_DECISION' : 'ACCESS_DECISION',
    category: 'access',
    target: { kind: resource.kind, id: resource.id },
    context: {
      sessionId: actor.sessionId,
      requestId: actor.requestId,
      correlationId: actor.correlationId,
      ipAddress: actor.ipAddress,
      userAgent: actor.userAgent,
      phi: PERMISSION_INDEX[permission]?.phi ?? false,
      reasonCode: decision.reasonCode,
    },
    after: { allow: decision.allow, permission, obligations: decision.obligations },
  });

  if (!decision.allow && decision.reasonCode.startsWith('sod.')) {
    await emit({
      actor: { kind: actor.kind, userId: actor.userId },
      action: 'SOD_VIOLATION',
      category: 'security',
      target: { kind: resource.kind, id: resource.id },
      context: {
        sessionId: actor.sessionId,
        requestId: actor.requestId,
        correlationId: actor.correlationId,
        phi: PERMISSION_INDEX[permission]?.phi ?? false,
        reasonCode: decision.reasonCode,
      },
      after: { permission },
    });
  }

  return decision;
}

function decide(
  identity: IdentityProvider,
  actor: ActorContext,
  permission: PermissionId,
  resource: ResourceRef,
): Decision {
  const obligations: Obligation[] = [];
  const permMeta = PERMISSION_INDEX[permission];
  if (!permMeta) return deny('permission.unknown');

  // System actor: explicit allowlist via system group.
  if (actor.kind === 'system') {
    if (permission === 'system.replay') return allow('allow.system', obligations);
    return deny('deny.system.unscoped');
  }
  if (actor.kind === 'integration') {
    // Integrations operate under a configured service identity; treated as user-equivalent
    // here, but in production they would have their own group + scope.
    if (!actor.userId) return deny('integration.no_identity');
  }
  if (!actor.userId) return deny('actor.unauthenticated');

  const user = identity.getUser(actor.userId);
  if (!user) return deny('user.unknown');
  if (user.status !== 'active') return deny('user.suspended');

  const assignments = identity.getActiveAssignments(actor.userId, new Date().toISOString());
  if (assignments.length === 0) return deny('user.no_active_assignment');

  // Scope check: resource must be reachable from at least one assignment scope.
  const inScope = assignments.some(a => scopeCovers(a.scope, resource));
  if (!inScope) return deny('scope.mismatch');

  // Permission check via group catalog.
  const groups = identity.getGroups();
  const groupById = new Map(groups.map(g => [g.id, g]));
  const userPerms = new Set<PermissionId>();
  for (const a of assignments) {
    const g = groupById.get(a.groupId);
    if (!g) continue;
    // Use catalog default if group's own permissions array is empty.
    const perms = g.permissions.length > 0 ? g.permissions : (GROUP_DEFAULT_PERMISSIONS[g.name] ?? []);
    for (const p of perms) userPerms.add(p);
  }
  if (!userPerms.has(permission)) return deny('permission.not_granted');

  // PHI obligation.
  if (permMeta.phi || resource.phi) obligations.push({ code: 'log_phi_access' });

  // Re-auth obligation.
  if (REAUTH_REQUIRED_ACTIONS.has(permission)) {
    const reauthFresh = actor.reauthAt
      ? Date.now() - new Date(actor.reauthAt).getTime() <= REAUTH_MAX_AGE_MS
      : false;
    if (!reauthFresh) return denyWithObligation('reauth.required', { code: 'require_reauth' });
  }

  // Override obligation.
  if (permission === 'ceu.override') {
    obligations.push({ code: 'require_dual_signature' });
    obligations.push({ code: 'record_reason' });
  }

  // Separation of duties.
  const history = identity.getPermissionHistory(actor.userId);
  for (const rule of SOD_RULES) {
    const code = rule.evaluate({ actorUserId: actor.userId, permission, resource, history });
    if (code) return deny(code);
  }

  return allow('allow.granted', obligations);
}

function allow(reasonCode: string, obligations: Obligation[]): Decision {
  return { allow: true, reasonCode, obligations };
}
function deny(reasonCode: string): Decision {
  return { allow: false, reasonCode, obligations: [] };
}
function denyWithObligation(reasonCode: string, ob: Obligation): Decision {
  return { allow: false, reasonCode, obligations: [ob] };
}

function scopeCovers(assignmentScope: { organizationId: string; branchId?: string; patientId?: string; programId?: string }, resource: ResourceRef): boolean {
  // Organization is always implicit; per-resource branch/patient narrowing optional.
  const meta = (resource.meta ?? {}) as { branchId?: string; patientId?: string; programId?: string };
  if (assignmentScope.branchId && meta.branchId && assignmentScope.branchId !== meta.branchId) return false;
  if (assignmentScope.patientId && meta.patientId && assignmentScope.patientId !== meta.patientId) return false;
  if (assignmentScope.programId && meta.programId && assignmentScope.programId !== meta.programId) return false;
  return true;
}
