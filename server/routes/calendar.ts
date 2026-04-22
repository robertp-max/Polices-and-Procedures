import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  listEvents, findByEventId, pingCalendar,
} from '../googleCalendar.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';
import type { PlannerEventPayload } from '../mappers.js';
import {
  syncEvent, syncEvents, deleteSyncedEvent, cleanupDuplicates,
} from '../sync/eventSync.js';
import { listRows, getRow } from '../sync/eventStore.js';
import { tailAudit } from '../sync/auditLog.js';
import { tailNotifications } from '../sync/bradNotifier.js';

/* ═══════════════════════════════════════════════════════════════
   Calendar API routes — thin HTTP layer around the sync engine.
   All event writes go through `eventSync` so idempotency, hashing,
   version control, audit, and Brad notifications are guaranteed.
   ═══════════════════════════════════════════════════════════════ */

export const calendarRouter: Router = Router();

/** GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD&q=... */
calendarRouter.get('/events', asyncHandler(async (req, res) => {
  const { start, end, q } = req.query as Record<string, string | undefined>;
  validateISODate(start, 'start');
  validateISODate(end, 'end');
  const items = await listEvents({ start, end, q });
  res.json({ items });
}));

/**
 * GET /api/calendar/events/by-app/:eventId
 * Strict event_id lookup. Path name kept for backward-compat with existing
 * frontends that hit `/by-app/:appEventId`; the parameter is treated as
 * `event_id`.
 */
calendarRouter.get('/events/by-app/:eventId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const ev = await findByEventId(eventId);
  if (!ev) throw new ApiError('event_not_found', 'No Google event maps to this event_id.', 404);
  res.json(ev);
}));

/** POST /api/calendar/events — create/upsert (deterministic via eventSync). */
calendarRouter.post('/events', asyncHandler(async (req, res) => {
  const payload = validatePayload(req.body);
  const result = await syncEvent(payload, {
    trigger: 'api:POST /events',
    actor: resolveActor(req),
  });
  res.status(result.action === 'created' ? 201 : 200).json(result);
}));

/**
 * PUT /api/calendar/events/:eventId — update by event_id (NOT by Google id).
 * Using event_id makes the route idempotent against any frontend confusion:
 * even if the client loses the google_event_id, the sync engine recovers.
 */
calendarRouter.put('/events/:eventId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const payload = validatePayload({ ...req.body, event_id: eventId });
  const result = await syncEvent(payload, {
    trigger: 'api:PUT /events/:eventId',
    actor: resolveActor(req),
  });
  res.json(result);
}));

/**
 * DELETE /api/calendar/events/:eventId
 *   ?cancelOnly=1        → soft-cancel (safe for PROD)
 *   ?adminOverride=1     → hard-delete PROD event (REQUIRED for PROD)
 *   X-Admin-Reason: ...  → free-form reason, written to audit
 */
calendarRouter.delete('/events/:eventId', asyncHandler(async (req, res) => {
  const eventId       = String(req.params.eventId);
  const cancelOnly    = req.query.cancelOnly === '1' || req.query.cancelOnly === 'true';
  const adminOverride = req.query.adminOverride === '1' || req.query.adminOverride === 'true';
  const reason = (req.header('x-admin-reason') ?? (req.query.reason as string | undefined)) ?? undefined;

  if (cancelOnly) {
    // Soft cancel runs through legacy path — it does NOT remove the row.
    const row = getRow(eventId);
    if (!row?.google_event_id) {
      throw new ApiError('event_not_found', 'No google_event_id known for that event_id.', 404);
    }
    const { deleteEvent } = await import('../googleCalendar.js');
    await deleteEvent(row.google_event_id, { cancelOnly: true, reason });
    res.status(204).end();
    return;
  }

  await deleteSyncedEvent({
    event_id: eventId,
    adminOverride,
    reason,
    actor: resolveActor(req),
    trigger: 'api:DELETE /events/:eventId',
  });
  res.status(204).end();
}));

/**
 * POST /api/calendar/sync — bulk deterministic upsert.
 * Body: { events: PlannerEventPayload[], env?: "SANDBOX"|"PROD" }
 *
 * Each payload is synced through the engine:
 *   - matched strictly by event_id
 *   - skipped when hash is unchanged
 *   - retried up to 3 times on transient failure
 *   - audited and Brad-notified on material changes
 */
calendarRouter.post('/sync', asyncHandler(async (req, res) => {
  const body = req.body as { events?: unknown; env?: 'SANDBOX' | 'PROD' };
  if (!Array.isArray(body.events)) {
    throw new ApiError('validation_error', 'Body must be { events: PlannerEventPayload[] }.', 400);
  }
  const payloads = body.events.map((raw, idx) => {
    try { return validatePayload(raw); }
    catch (e) {
      const err = e as ApiError;
      log.warn('sync.validate.failed', { idx, code: err.code, message: err.message });
      throw new ApiError('validation_error', `events[${idx}]: ${err.message}`, 400);
    }
  });
  const report = await syncEvents(payloads, {
    trigger: 'api:POST /sync',
    actor: resolveActor(req),
    env: body.env,
  });
  res.json(report);
}));

/**
 * POST /api/calendar/cleanup — one-time (or periodic) duplicate sweep.
 * Body: { dryRun?: boolean, adminOverride?: boolean }
 *
 * Default is dry-run. PROD duplicates are NOT deleted unless
 * `adminOverride` is true; they are reported under `needs_review`.
 */
calendarRouter.post('/cleanup', asyncHandler(async (req, res) => {
  const body = (req.body ?? {}) as { dryRun?: boolean; adminOverride?: boolean };
  const report = await cleanupDuplicates({
    dryRun: body.dryRun ?? true,
    adminOverride: !!body.adminOverride,
    trigger: 'api:POST /cleanup',
    actor: resolveActor(req),
  });
  res.json(report);
}));

/** GET /api/calendar/audit?limit=100 — tail of the append-only audit log. */
calendarRouter.get('/audit', asyncHandler(async (req, res) => {
  const limit = clampInt(req.query.limit as string | undefined, 1, 1000, 100);
  res.json({ records: tailAudit(limit) });
}));

/** GET /api/calendar/notifications?limit=50 — recent Brad notifications. */
calendarRouter.get('/notifications', asyncHandler(async (req, res) => {
  const limit = clampInt(req.query.limit as string | undefined, 1, 500, 50);
  res.json({ notifications: tailNotifications(limit) });
}));

/** GET /api/calendar/store?status=sync_failed — local store rows (dashboard). */
calendarRouter.get('/store', asyncHandler(async (req, res) => {
  const env = (req.query.env as string | undefined);
  const status = (req.query.status as string | undefined);
  const rows = listRows({
    env:    (env === 'SANDBOX' || env === 'PROD') ? env : undefined,
    status: (status === 'synced' || status === 'pending' || status === 'sync_failed' || status === 'deleted') ? status : undefined,
  });
  res.json({ rows, count: rows.length });
}));

/** GET /api/healthz — liveness + calendar reachability. */
calendarRouter.get('/healthz', asyncHandler(async (_req, res) => {
  const ping = await pingCalendar();
  res.status(ping.reachable ? 200 : 503).json({ ok: ping.reachable, calendar: ping });
}));

/* ── helpers ─────────────────────────────────────────── */

function validateISODate(v: string | undefined, name: string) {
  if (v == null) return;
  if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) {
    throw new ApiError('validation_error', `Invalid ${name} date. Expected YYYY-MM-DD.`, 400);
  }
}

function validatePayload(raw: unknown): PlannerEventPayload {
  if (!raw || typeof raw !== 'object') {
    throw new ApiError('validation_error', 'Request body must be an object.', 400);
  }
  const p = raw as Partial<PlannerEventPayload>;
  const id = p.event_id || p.appEventId;
  if (!id)           throw new ApiError('validation_error', '`event_id` is required.', 400);
  if (!p.title)      throw new ApiError('validation_error', '`title` is required.', 400);
  if (!p.date || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    throw new ApiError('validation_error', '`date` is required and must be YYYY-MM-DD.', 400);
  }
  if (p.time && !/^\d{2}:\d{2}$/.test(p.time)) {
    throw new ApiError('validation_error', '`time` must be HH:mm (24h).', 400);
  }
  if (p.timeEnd && !/^\d{2}:\d{2}$/.test(p.timeEnd)) {
    throw new ApiError('validation_error', '`timeEnd` must be HH:mm (24h).', 400);
  }
  if (p.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.endDate)) {
    throw new ApiError('validation_error', '`endDate` must be YYYY-MM-DD.', 400);
  }
  if (p.allDay && (p.time || p.timeEnd)) {
    throw new ApiError('validation_error', 'All-day events cannot specify time/timeEnd.', 400);
  }
  if (p.env && p.env !== 'SANDBOX' && p.env !== 'PROD') {
    throw new ApiError('validation_error', '`env` must be SANDBOX or PROD.', 400);
  }
  if (p.version != null && (!Number.isInteger(p.version) || p.version < 0)) {
    throw new ApiError('validation_error', '`version` must be a non-negative integer.', 400);
  }
  // Canonicalize: always populate event_id from whichever field was sent.
  return { ...(p as PlannerEventPayload), event_id: id, appEventId: id };
}

function resolveActor(req: Request): string {
  return (req.header('x-actor')
       ?? req.header('x-user-id')
       ?? 'service-account');
}

function clampInt(raw: string | undefined, min: number, max: number, dflt: number): number {
  if (!raw) return dflt;
  const n = Number(raw);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
