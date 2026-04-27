/**
 * /api/audit/* — extended audit read API (additive over existing routes).
 * ─────────────────────────────────────────────────────────────────────────────
 * The existing `server/routes/audit.ts` (eCIgn chain) remains mounted under
 * `/api/audit/events` and `/api/audit/verify-chain`. This router introduces:
 *
 *   GET /api/audit/v2/events
 *   GET /api/audit/v2/events/:event_id
 *   GET /api/audit/v2/users/:user_id/activity
 *   GET /api/audit/v2/sessions/:session_id
 *   GET /api/audit/v2/resources/:type/:id
 *   GET /api/audit/v2/phi-access
 *   POST /api/audit/v2/verify-chain
 *   POST /api/audit/v2/anomaly-scan
 */
import { Router } from 'express';
import { requirePermission } from '../access/pep.js';
import { ApiError } from '../errors.js';
import { getEvent, queryEvents, verifyChains } from './writer.js';
import { phiAccess, resourceActivity, sessionActivity, userActivity } from './projections.js';
import { runAnomalyScan } from './anomaly.js';

export const auditV2Router: Router = Router();

auditV2Router.get('/events',
  requirePermission('audit:list'),
  async (req, res, next) => {
    try {
      const result = await queryEvents({
        stream: req.query.stream as string | undefined,
        actor_user_id: req.query.actor_user_id as string | undefined,
        resource_type: req.query.resource_type as string | undefined,
        resource_id: req.query.resource_id as string | undefined,
        action: req.query.action as string | undefined,
        event_type: req.query.event_type as string | undefined,
        since: req.query.since as string | undefined,
        until: req.query.until as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 200,
        offset: req.query.offset ? Number(req.query.offset) : 0,
      });
      res.json({ items: result, count: result.length });
    } catch (e) { next(e); }
  });

auditV2Router.get('/events/:event_id',
  requirePermission('audit:view',
    async (req) => ({ type: 'AuditEvent', id: String(req.params.event_id) })),
  async (req, res, next) => {
    try {
      const evt = await getEvent(String(req.params.event_id));
      if (!evt) throw new ApiError('event_not_found', `event ${req.params.event_id} not found`, 404);
      res.json(evt);
    } catch (e) { next(e); }
  });

auditV2Router.get('/users/:user_id/activity',
  requirePermission('audit:view',
    async (req) => ({ type: 'User', id: String(req.params.user_id) })),
  async (req, res, next) => {
    try {
      const summary = await userActivity(String(req.params.user_id), {
        since: req.query.since as string | undefined,
        until: req.query.until as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 500,
      });
      res.json(summary);
    } catch (e) { next(e); }
  });

auditV2Router.get('/sessions/:session_id',
  requirePermission('audit:view',
    async (req) => ({ type: 'Session', id: String(req.params.session_id) })),
  async (req, res, next) => {
    try {
      const events = await sessionActivity(String(req.params.session_id));
      res.json({ items: events, count: events.length });
    } catch (e) { next(e); }
  });

auditV2Router.get('/resources/:type/:id',
  requirePermission('audit:view',
    async (req) => ({ type: String(req.params.type), id: String(req.params.id) })),
  async (req, res, next) => {
    try {
      const events = await resourceActivity(String(req.params.type), String(req.params.id), {
        limit: req.query.limit ? Number(req.query.limit) : 500,
      });
      res.json({ items: events, count: events.length });
    } catch (e) { next(e); }
  });

auditV2Router.get('/phi-access',
  requirePermission('phi:view',
    async (req) => ({
      type: 'PHIRecord',
      id: (req.query.patient_id as string) ?? 'all',
      attributes: { contains_phi: true },
    })),
  async (req, res, next) => {
    try {
      const events = await phiAccess({
        patient_id: req.query.patient_id as string | undefined,
        user_id: req.query.user_id as string | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 500,
      });
      res.json({ items: events, count: events.length });
    } catch (e) { next(e); }
  });

auditV2Router.post('/verify-chain',
  requirePermission('audit:replay'),
  async (req, res, next) => {
    try {
      const stream = (req.query.stream as string | undefined) ??
        (req.body?.stream as string | undefined);
      const result = await verifyChains(stream);
      res.json(result);
    } catch (e) { next(e); }
  });

auditV2Router.post('/anomaly-scan',
  requirePermission('audit:replay'),
  async (_req, res, next) => {
    try {
      const result = await runAnomalyScan();
      res.json(result);
    } catch (e) { next(e); }
  });
