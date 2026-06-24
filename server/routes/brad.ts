import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { getBradRuntime } from '../ia/harness/BradRuntime.js';
import { BradActionService } from '../ia/brad/bradActionService.js';
import { getGeneratedObjectStore } from '../ia/brad/generatedObjects.js';
import { verifySuperAdmin } from '../ia/brad/superadminPolicy.js';
import { approvalRegistry } from '../ia/brad/superadminApprovals.js';
import { superAdminAudit } from '../ia/brad/superadminAudit.js';
import { planCloudChangeSet } from '../ia/brad/cloudChangeSets.js';
import { getDemoSnapshot, listDemoEventIds } from '../ia/brad/demoSnapshot.js';
import type { BradObjectType, CloudChangeOp, SuperAdminPermission } from '../ia/brad/types.js';

/* ═══════════════════════════════════════════════════════════════════════════
   /api/brad/* — Brad assistant + Super Admin guarded-action surface.
   Identity comes from the global identity middleware (req.actor). Super Admin
   status is verified SERVER-SIDE on every guarded endpoint — client role claims
   are never trusted, and a regular user can never self-promote.
   ═══════════════════════════════════════════════════════════════════════════ */

function asyncH(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => fn(req, res, next).catch(next);
}

/** Resolve the authenticated actor; throws if not an authenticated user. */
function requireActor(req: Request): { userId: string } {
  const a = req.actor;
  if (!req.session?.authenticated || a?.type !== 'user' || !a.user_id) {
    throw new ApiError('auth_error', 'Authenticated user required.', 401);
  }
  return { userId: a.user_id };
}

function superAdminOf(req: Request) {
  const a = req.actor;
  return verifySuperAdmin({
    userId: a?.user_id,
    email: req.header('x-user-email') ?? undefined,
    authenticated: !!req.session?.authenticated,
    actorType: (a?.type ?? 'system') as 'user' | 'service' | 'system',
  });
}

export function createBradRouter(): Router {
  const router = Router();
  const svc = new BradActionService();
  const store = getGeneratedObjectStore();

  // Runtime badge state for the UI (server-verified; never hardcodes PHI Enabled).
  router.get('/runtime', asyncH(async (_req, res) => {
    const rt = getBradRuntime();
    const desc = await rt.describe();
    res.json({
      configuredMode: desc.configuredMode,
      effectiveMode: desc.effectiveMode,
      badge: desc.badge,
      phiPermitted: desc.phiPermitted,
      modelId: desc.modelId,
      canReachInternet: rt.canReachInternet,
      nolanEnabled: desc.nolanEnabled,
    });
  }));

  // Current actor's Super Admin status (for UI gating only — re-checked on writes).
  router.get('/superadmin/me', asyncH(async (req, res) => {
    res.json(superAdminOf(req));
  }));

  router.get('/events', asyncH(async (_req, res) => {
    res.json({ events: listDemoEventIds() });
  }));

  // Brad chat / answer (PHI-blocked in non-PHI modes by the runtime).
  router.post('/ask', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const text = (req.body?.input ?? '').toString();
    if (!text.trim()) throw new ApiError('validation_error', 'Field `input` is required.', 400);
    if (text.length > 4000) throw new ApiError('validation_error', '`input` exceeds 4000 characters.', 400);
    const ans = await getBradRuntime().answer(text, actor.userId, 'user');
    res.json(ans);
  }));

  // Run a report (append-only; read-only — no approval required).
  router.post('/report', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const kind = (req.body?.kind ?? 'event-readiness') as 'event-readiness' | 'qapi-packet';
    const snapshot = getDemoSnapshot(req.body?.eventId);
    const object = kind === 'qapi-packet'
      ? svc.runQapiPacketReport(snapshot, actor)
      : svc.runEventReadinessReport(snapshot, actor);
    res.json({ object });
  }));

  // Generate an event packet (+ append-only event metadata).
  router.post('/event-packet', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const kind = (req.body?.kind ?? 'general') as 'general' | 'qapi';
    const snapshot = getDemoSnapshot(req.body?.eventId);
    const out = svc.generateEventPacket(snapshot, actor, kind);
    res.json(out);
  }));

  // Generate a QAPI minutes DRAFT (+ append-only event metadata).
  router.post('/qapi-minutes', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const snapshot = getDemoSnapshot(req.body?.eventId);
    const out = svc.generateQapiMinutesDraft(snapshot, actor);
    res.json(out);
  }));

  // List / view generated objects.
  router.get('/objects', asyncH(async (req, res) => {
    requireActor(req);
    const objectType = req.query.type as BradObjectType | undefined;
    res.json({ objects: store.list(objectType ? { objectType } : undefined) });
  }));

  router.get('/objects/:id', asyncH(async (req, res) => {
    requireActor(req);
    const id = String(req.params.id);
    const obj = store.get(id);
    if (!obj) throw new ApiError('event_not_found', `Object not found: ${id}`, 404);
    res.json({ object: obj, integrityVerified: store.verifyIntegrity(id) });
  }));

  // Propose a Google Cloud change set (safe dry-run; pending approval).
  router.post('/cloud-change-set', asyncH(async (req, res) => {
    const actor = requireActor(req);
    const ops = (req.body?.ops ?? []) as CloudChangeOp[];
    if (!Array.isArray(ops) || ops.length === 0) throw new ApiError('validation_error', '`ops` is required.', 400);
    const snapshot = getDemoSnapshot(req.body?.eventId);
    const permission = (req.body?.requiredPermission ?? 'approve.cloud_change.low_risk') as SuperAdminPermission;
    const out = svc.proposeCloudChangeSet({ actor, snapshot, ops, requiredPermission: permission });
    res.json({ object: out.object, plan: out.plan, approvalId: out.approval?.approvalId ?? null });
  }));

  // Dry-run preview only (no object persisted) — for the change-set composer.
  router.post('/cloud-change-set/dry-run', asyncH(async (req, res) => {
    requireActor(req);
    const ops = (req.body?.ops ?? []) as CloudChangeOp[];
    res.json({ plan: planCloudChangeSet(ops) });
  }));

  // ── Super Admin approval surface (server-verified) ────────────────────────
  router.get('/approvals', asyncH(async (req, res) => {
    const sa = superAdminOf(req);
    if (!sa.isSuperAdmin) throw new ApiError('permission_denied', 'Super Admin required.', 403);
    res.json({ pending: approvalRegistry.listPending(), identity: sa });
  }));

  router.post('/approvals/:id/decide', asyncH(async (req, res) => {
    const sa = superAdminOf(req);
    if (!sa.isSuperAdmin) throw new ApiError('permission_denied', 'Super Admin required.', 403);
    const decision = (req.body?.decision === 'approved' ? 'approved' : 'denied') as 'approved' | 'denied';
    const reason = req.body?.reason ? String(req.body.reason).slice(0, 500) : undefined;
    const out = approvalRegistry.decide(String(req.params.id), sa, decision, reason);
    res.json(out);
  }));

  router.get('/audit', asyncH(async (req, res) => {
    const sa = superAdminOf(req);
    if (!sa.isSuperAdmin) throw new ApiError('permission_denied', 'Super Admin required.', 403);
    res.json({ audit: superAdminAudit.list() });
  }));

  return router;
}
