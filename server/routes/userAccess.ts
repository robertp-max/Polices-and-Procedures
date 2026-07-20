/**
 * COG-2 — Admin user-access management API.
 *
 * Every endpoint is server-authoritative: it resolves a verified Cognito actor
 * (no client identity headers), enforces the user-access admin role from the
 * server registry, performs a pure registry mutation, persists it, and writes
 * an append-only audit event. Denied privileged attempts are also audited.
 */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { appendEvent } from '../audit/writer.js';
import type { Actor } from '../identity/session.js';
import { getAppIdentityPersistence } from '../auth/appIdentityPersistence.js';
import { type RequireAuthDeps } from '../auth/requireCognitoAuth.js';
import { buildDemoAuthServiceFromEnv } from '../auth/service.js';
import { expectedIssuer } from '../auth/accessTokenClaims.js';
import { env } from '../env.js';
import { resolveUserStatusAuthority } from '../auth/userStatusAuthority.js';
import { randomUUID } from 'node:crypto';
import {
  listAccessState, assignRole, removeRole,
  type AccessChange,
} from '../auth/userAccessAdmin.js';
import { activeRoleGroupIds } from '../auth/actorResolver.js';
import { computeEffectiveAccess } from '../auth/authorization/evaluator.js';
import { computePageAccessProjection, parseOverrideRecord } from '../auth/authorization/pageAccess.js';
import { getPageAccessPersistence } from '../auth/pageAccessPersistence.js';
import { computeAccessChangeImpact } from '../auth/authorization/impactPreview.js';
import { getAccountLifecycleService } from '../auth/accountLifecycle/serviceFactory.js';
import { performAdminLifecycleTransition } from '../auth/accountLifecycle/adminTransition.js';
import type { LifecycleAction } from '../auth/accountLifecycle/service.js';

export const userAccessRouter: Router = Router();

function authDeps(): RequireAuthDeps {
  const service = buildDemoAuthServiceFromEnv(process.env);
  return {
    getCurrentUser: (t) => service.getCurrentUser(t),
    loadRegistry: () => getAppIdentityPersistence().getAll(),
    issuer: expectedIssuer(env.awsRegion, env.cognitoUserPoolId),
    clientId: env.cognitoClientId,
    nowSeconds: () => Math.floor(Date.now() / 1000),
    nowIso: () => new Date().toISOString(),
  };
}

/** Resolve + gate the caller by the shared user-status authority, or throw 401/403. */
async function requireUserAccessAdmin(req: Request): Promise<Actor> {
  const service = buildDemoAuthServiceFromEnv(process.env);
  const { actor, result } = await resolveUserStatusAuthority(
    req.header('authorization'),
    authDeps(),
    (e) => service.isAdminEmail(e ?? ''),
  );
  // Preserve the authority source for the audit trail (approved_admin_email |
  // canonical_admin_group). The mount PEP may already have set this; either way
  // it now reflects the authority actually used by this handler.
  req.userStatusAuthority = result;
  return actor;
}

async function auditAccess(
  actor: Actor,
  req: Request,
  change: Pick<AccessChange, 'action' | 'targetUserId' | 'before' | 'after'>,
  decision: 'permit' | 'deny',
  reason?: string,
): Promise<void> {
  await appendEvent({
    event_type: 'user_access',
    stream: 'user-access',
    actor,
    action: change.action,
    resource: { type: 'user', id: change.targetUserId },
    decision,
    decision_reason: reason,
    before: change.before,
    after: change.after,
    correlation_id: req.session?.correlation_id,
    request_id: req.session?.request_id,
    session_id: req.session?.session_id,
  });
}

async function auditDenied(req: Request, action: string, targetUserId: string, reason: string): Promise<void> {
  // Best-effort denial audit; the resolved actor may be unavailable on auth failure.
  try {
    await appendEvent({
      event_type: 'user_access',
      stream: 'user-access',
      actor: req.actor,
      action,
      resource: { type: 'user', id: targetUserId },
      decision: 'deny',
      decision_reason: reason,
      correlation_id: req.session?.correlation_id,
      request_id: req.session?.request_id,
      session_id: req.session?.session_id,
    });
  } catch {
    // Never let an audit failure mask the original denial.
  }
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };
}

/** GET /admin/user-access — full access-state projection. */
userAccessRouter.get('/', asyncHandler(async (req, res) => {
  await requireUserAccessAdmin(req);
  const registry = await getAppIdentityPersistence().getAll();
  res.json({ users: listAccessState(registry, new Date().toISOString()) });
}));

/**
 * GET /admin/user-access/:userId/effective-access — server-computed effective
 * access for a TARGET user (ADR-0002 Phase 3/4 read API). The evaluator expands
 * the target's active groups into permissions with provenance; a non-active
 * account yields the empty fail-closed set. The admin UI renders this and never
 * reconstructs the permission decision locally.
 */
userAccessRouter.get('/:userId/effective-access', asyncHandler(async (req, res) => {
  await requireUserAccessAdmin(req);
  const userId = String(req.params.userId || '').trim();
  if (!userId) throw new ApiError('validation_error', 'userId is required.', 400);
  const registry = await getAppIdentityPersistence().getAll();
  const nowIso = new Date().toISOString();
  const user = registry.users.find((u) => u.id === userId);
  if (!user) throw new ApiError('user_not_found', 'User not found.', 404);
  const groupIds = activeRoleGroupIds(registry, userId, nowIso);
  const effectiveAccess = computeEffectiveAccess({
    principalUserId: userId,
    accountStatus: user.status,
    assignments: groupIds.map((groupId) => ({ groupId, scope: { organizationId: '' } })),
    nowIso,
  });
  res.json({ effectiveAccess });
}));

/**
 * GET /admin/user-access/:userId/page-access — server-authoritative page-
 * VISIBILITY projection for a target user (ADR-0002 Phase 4, non-authorizing).
 * Derived from account status + privilege + explicit overrides; a non-active
 * account hides every page. This never authorizes an operation — every API
 * still authorizes independently via the Phase-3 evaluator.
 */
userAccessRouter.get('/:userId/page-access', asyncHandler(async (req, res) => {
  await requireUserAccessAdmin(req);
  const userId = String(req.params.userId || '').trim();
  if (!userId) throw new ApiError('validation_error', 'userId is required.', 400);
  const registry = await getAppIdentityPersistence().getAll();
  const nowIso = new Date().toISOString();
  const user = registry.users.find((u) => u.id === userId);
  if (!user) throw new ApiError('user_not_found', 'User not found.', 404);
  const groupIds = activeRoleGroupIds(registry, userId, nowIso);
  const ea = computeEffectiveAccess({
    principalUserId: userId,
    accountStatus: user.status,
    assignments: groupIds.map((groupId) => ({ groupId, scope: { organizationId: '' } })),
    nowIso,
  });
  let override = null;
  try {
    const map = await getPageAccessPersistence().getAll();
    const emailKey = typeof user.email === 'string' ? user.email.toLowerCase() : '';
    override = parseOverrideRecord(map[userId] ?? map[emailKey], userId);
  } catch {
    override = null; // overrides are best-effort; fail closed to defaults.
  }
  const pageAccess = computePageAccessProjection({
    principalUserId: userId,
    accountActive: ea.accountActive,
    privileged: ea.privileged,
    override,
    nowIso,
  });
  res.json({ pageAccess });
}));

/**
 * POST /admin/user-access/:userId/impact-preview — server-derived before/after
 * effective-access diff for a proposed group change (ADR §B10). MUTATION-FREE:
 * it never persists. Body: { addGroupIds?: string[], removeGroupIds?: string[] }.
 */
userAccessRouter.post('/:userId/impact-preview', asyncHandler(async (req, res) => {
  await requireUserAccessAdmin(req);
  const userId = String(req.params.userId || '').trim();
  if (!userId) throw new ApiError('validation_error', 'userId is required.', 400);
  const registry = await getAppIdentityPersistence().getAll();
  const nowIso = new Date().toISOString();
  const user = registry.users.find((u) => u.id === userId);
  if (!user) throw new ApiError('user_not_found', 'User not found.', 404);
  const strArr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
  const addGroupIds = strArr((req.body as { addGroupIds?: unknown })?.addGroupIds);
  const removeGroupIds = new Set(strArr((req.body as { removeGroupIds?: unknown })?.removeGroupIds));
  const currentGroupIds = activeRoleGroupIds(registry, userId, nowIso);
  const proposedGroupIds = [...new Set([...currentGroupIds.filter((id) => !removeGroupIds.has(id)), ...addGroupIds])];
  const toAssign = (ids: string[]) => ids.map((groupId) => ({ groupId, scope: { organizationId: '' } }));
  const impact = computeAccessChangeImpact({
    principalUserId: userId,
    accountStatus: user.status,
    currentAssignments: toAssign(currentGroupIds),
    proposedAssignments: toAssign(proposedGroupIds),
    nowIso,
  });
  res.json({ impact });
}));

function targetId(req: Request): string {
  const id = String(req.body?.userId || '').trim();
  if (!id) throw new ApiError('validation_error', 'userId is required.', 400);
  return id;
}

async function applyChange(req: Request, actor: Actor, change: AccessChange): Promise<void> {
  await getAppIdentityPersistence().putAll(change.registry);
  // Record which authority granted the mutation (approved_admin_email |
  // canonical_admin_group) so the audit trail is self-explaining.
  const source = req.userStatusAuthority?.source;
  await auditAccess(actor, req, change, 'permit', source ? `authority:${source}` : undefined);
}

/** Reason falls back to a non-empty audit string when the admin UI omits one. */
function normalizeReason(raw: unknown, action: LifecycleAction): string {
  const r = String(raw ?? '').trim();
  return r || `Administrative ${action} via user-access console`;
}

/**
 * Suspend/reactivate via the durable global-deny lifecycle (ADR-0002 Phase 2E,
 * hard cut). Policy guards run first; the transition is a durable, multi-plane
 * operation (durable deny → Cognito disable+sign-out → plane projections →
 * complete). If the durable store is unavailable the service returns 503 — this
 * route NEVER falls back to a canonical-only mutation (the two-plane defect).
 */
async function handleLifecycleTransition(req: Request, res: Response, action: LifecycleAction): Promise<void> {
  const id = targetId(req);
  let actor: Actor;
  try {
    actor = await requireUserAccessAdmin(req);
  } catch (e) {
    await auditDenied(req, `user_access.${action}`, id, (e as Error).message);
    throw e;
  }
  const registry = await getAppIdentityPersistence().getAll();
  const beforeStatus = registry.users.find((u) => u.id === id)?.status;
  const reason = normalizeReason(req.body?.reason, action);
  const idempotencyKey = String(req.header('idempotency-key') || '').trim() || randomUUID();

  try {
    const result = await performAdminLifecycleTransition({
      service: getAccountLifecycleService(),
      registry, action, actorUserId: actor.user_id, actorEmail: actor.email,
      targetUserId: id, reason, idempotencyKey, nowIso: new Date().toISOString(),
    });
    const afterStatus = action === 'suspend' ? 'suspended' : 'active';
    await auditAccess(
      actor, req,
      { action: `user_access.${action}`, targetUserId: id, before: { status: beforeStatus }, after: { status: afterStatus } },
      'permit',
      req.userStatusAuthority?.source ? `authority:${req.userStatusAuthority.source}` : undefined,
    );
    res.json({ ok: true, targetUserId: id, after: { status: afterStatus }, operationId: result.operationId, postCommitAudit: result.postCommitAudit });
  } catch (e) {
    await auditDenied(req, `user_access.${action}`, id, (e as Error).message);
    throw e;
  }
}

userAccessRouter.post('/suspend', asyncHandler(async (req, res) => {
  await handleLifecycleTransition(req, res, 'suspend');
}));

userAccessRouter.post('/reactivate', asyncHandler(async (req, res) => {
  await handleLifecycleTransition(req, res, 'reactivate');
}));

userAccessRouter.post('/assign-role', asyncHandler(async (req, res) => {
  const id = targetId(req);
  const groupId = String(req.body?.groupId || '').trim();
  if (!groupId) throw new ApiError('validation_error', 'groupId is required.', 400);
  let actor: Actor;
  try {
    actor = await requireUserAccessAdmin(req);
  } catch (e) {
    await auditDenied(req, 'user_access.assign_role', id, (e as Error).message);
    throw e;
  }
  const registry = await getAppIdentityPersistence().getAll();
  let change: AccessChange;
  try {
    change = assignRole(registry, actor, id, groupId, new Date().toISOString());
  } catch (e) {
    await auditDenied(req, 'user_access.assign_role', id, (e as Error).message);
    throw e;
  }
  await applyChange(req, actor, change);
  res.json({ ok: true, targetUserId: id, after: change.after });
}));

userAccessRouter.post('/remove-role', asyncHandler(async (req, res) => {
  const id = targetId(req);
  const groupId = String(req.body?.groupId || '').trim();
  if (!groupId) throw new ApiError('validation_error', 'groupId is required.', 400);
  const actor = await requireUserAccessAdmin(req);
  const registry = await getAppIdentityPersistence().getAll();
  const change = removeRole(registry, actor, id, groupId, new Date().toISOString());
  await applyChange(req, actor, change);
  res.json({ ok: true, targetUserId: id, after: change.after });
}));
