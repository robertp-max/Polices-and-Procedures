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
import { resolveVerifiedActor, type RequireAuthDeps } from '../auth/requireCognitoAuth.js';
import { buildDemoAuthServiceFromEnv } from '../auth/service.js';
import { expectedIssuer } from '../auth/accessTokenClaims.js';
import { env } from '../env.js';
import { actorMayManageUserStatus } from '../auth/userStatusAuthority.js';
import {
  listAccessState, suspendUser, reactivateUser, assignRole, removeRole,
  type AccessChange,
} from '../auth/userAccessAdmin.js';

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

/** Resolve + gate the caller by the unified user-status authority, or throw 401/403. */
async function requireUserAccessAdmin(req: Request): Promise<Actor> {
  const actor = await resolveVerifiedActor(req.header('authorization'), authDeps());
  const service = buildDemoAuthServiceFromEnv(process.env);
  if (!actorMayManageUserStatus(actor, (e) => service.isAdminEmail(e ?? ''))) {
    throw new ApiError('permission_denied', 'You do not have permission to manage user status.', 403);
  }
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

function targetId(req: Request): string {
  const id = String(req.body?.userId || '').trim();
  if (!id) throw new ApiError('validation_error', 'userId is required.', 400);
  return id;
}

async function applyChange(req: Request, actor: Actor, change: AccessChange): Promise<void> {
  await getAppIdentityPersistence().putAll(change.registry);
  await auditAccess(actor, req, change, 'permit');
}

userAccessRouter.post('/suspend', asyncHandler(async (req, res) => {
  let actor: Actor;
  const id = targetId(req);
  try {
    actor = await requireUserAccessAdmin(req);
  } catch (e) {
    await auditDenied(req, 'user_access.suspend', id, (e as Error).message);
    throw e;
  }
  const registry = await getAppIdentityPersistence().getAll();
  const change = suspendUser(registry, actor, id, new Date().toISOString());
  await applyChange(req, actor, change);
  res.json({ ok: true, targetUserId: id, after: change.after });
}));

userAccessRouter.post('/reactivate', asyncHandler(async (req, res) => {
  const id = targetId(req);
  const actor = await requireUserAccessAdmin(req);
  const registry = await getAppIdentityPersistence().getAll();
  const change = reactivateUser(registry, actor, id);
  await applyChange(req, actor, change);
  res.json({ ok: true, targetUserId: id, after: change.after });
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
