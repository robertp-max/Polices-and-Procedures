import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  createEvent, updateEvent, deleteEvent, listEvents, findByAppEventId, pingCalendar,
} from '../googleCalendar.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';
import type { PlannerEventPayload } from '../mappers.js';

/* ═══════════════════════════════════════════════════════════════
   Calendar API routes — thin HTTP layer around the service.
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

/** GET /api/calendar/events/by-app/:appEventId */
calendarRouter.get('/events/by-app/:appEventId', asyncHandler(async (req, res) => {
  const ev = await findByAppEventId(req.params.appEventId);
  if (!ev) throw new ApiError('event_not_found', 'No Google event maps to this appEventId.', 404);
  res.json(ev);
}));

/** POST /api/calendar/events — create (idempotent by appEventId). */
calendarRouter.post('/events', asyncHandler(async (req, res) => {
  const payload = validatePayload(req.body);
  const ev = await createEvent(payload);
  res.status(201).json(ev);
}));

/** PUT /api/calendar/events/:googleEventId — update by Google event ID. */
calendarRouter.put('/events/:googleEventId', asyncHandler(async (req, res) => {
  const payload = validatePayload(req.body);
  const ev = await updateEvent(req.params.googleEventId, payload);
  res.json(ev);
}));

/** DELETE /api/calendar/events/:googleEventId?cancelOnly=1 */
calendarRouter.delete('/events/:googleEventId', asyncHandler(async (req, res) => {
  const cancelOnly = req.query.cancelOnly === '1' || req.query.cancelOnly === 'true';
  await deleteEvent(req.params.googleEventId, { cancelOnly });
  res.status(204).end();
}));

/** POST /api/calendar/sync — bulk upsert (create-or-update by appEventId). */
calendarRouter.post('/sync', asyncHandler(async (req, res) => {
  const body = req.body as { events?: unknown };
  if (!Array.isArray(body.events)) {
    throw new ApiError('validation_error', 'Body must be { events: PlannerEventPayload[] }.', 400);
  }
  const results: Array<{
    appEventId: string;
    ok: boolean;
    googleEventId?: string;
    action?: 'created' | 'updated';
    error?: string;
  }> = [];
  for (const raw of body.events) {
    try {
      const payload = validatePayload(raw);
      // createEvent is idempotent by extendedProperties.private.appEventId —
      // it will UPDATE on hit, CREATE otherwise, and tag the response accordingly.
      const ev = await createEvent(payload);
      results.push({
        appEventId: payload.appEventId,
        ok: true,
        googleEventId: ev.googleEventId,
        action: ev.action ?? 'created',
      });
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError('internal_error', (e as Error).message, 500);
      log.warn('sync.item.failed', { code: err.code, message: err.message });
      const appEventId = (raw as { appEventId?: string })?.appEventId ?? '(unknown)';
      results.push({ appEventId, ok: false, error: err.code });
    }
  }
  const createdCount = results.filter(r => r.ok && r.action === 'created').length;
  const updatedCount = results.filter(r => r.ok && r.action === 'updated').length;
  const failedCount  = results.filter(r => !r.ok).length;
  res.json({
    results,
    count: results.length,
    okCount: results.filter(r => r.ok).length,
    createdCount,
    updatedCount,
    failedCount,
  });
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
  if (!p.appEventId) throw new ApiError('validation_error', '`appEventId` is required.', 400);
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
  // All-day events cannot have times; enforce that here rather than at the Google call.
  if (p.allDay && (p.time || p.timeEnd)) {
    throw new ApiError('validation_error', 'All-day events cannot specify time/timeEnd.', 400);
  }
  return p as PlannerEventPayload;
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
