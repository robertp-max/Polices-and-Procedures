import { Router } from 'express';
import { ApiError } from '../errors.js';
import type { IaService, Phase1Event } from './service.js';
import type { QueryRequest } from './types.js';
import { operationalService } from './operational/service.js';
import { regulatoryMatcher } from './regulatory/matcher.js';

/* ═══════════════════════════════════════════════════════════════
   /api/ia/* HTTP surface.

   Endpoints:
     GET    /api/ia/health                    — index + ollama status
     POST   /api/ia/query                     — run a compliance command
     GET    /api/ia/references                — list docs (optional filters)
     GET    /api/ia/references/:id            — preview a document
     POST   /api/ia/index/rebuild             — rebuild the local index
     GET    /api/ia/operational/summary       — operational compliance summary
     GET    /api/ia/operational/gaps          — operational gap list (filtered)
     GET    /api/ia/operational/lifecycle     — policy lifecycle alert list
     GET    /api/ia/regulatory/updates        — regulatory update feed
     GET    /api/ia/regulatory/updates/:id    — single regulatory update
   ═══════════════════════════════════════════════════════════════ */

export function createIaRouter(service: IaService): Router {
  const router = Router();

  router.get('/health', async (_req, res, next) => {
    try {
      const status = service.status();
      const ollama = await service.pingOllama();
      res.json({ status, ollama });
    } catch (err) {
      next(err);
    }
  });

  router.post('/query', async (req, res, next) => {
    try {
      const body = req.body as Partial<QueryRequest>;
      if (!body?.input || typeof body.input !== 'string' || body.input.trim().length === 0) {
        throw new ApiError('validation_error', 'Field `input` is required.', 400);
      }
      if (body.input.length > 2000) {
        throw new ApiError('validation_error', 'Field `input` exceeds 2000 characters.', 400);
      }
      const sanitizedReq: QueryRequest = {
        input: body.input,
        intent: body.intent,
        activeDocId: body.activeDocId,
        k: typeof body.k === 'number' ? Math.min(Math.max(body.k, 1), 20) : undefined,
      };

      // ── SSE streaming: emit retrieval metadata immediately, then full response.
      //    Triggered when client sends Accept: text/event-stream.
      if (req.headers.accept?.includes('text/event-stream')) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const sendEvent = (event: string, data: unknown) => {
          res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        try {
          const response = await service.answer(sanitizedReq, (phase1: Phase1Event) => {
            sendEvent('phase1', phase1);
          });
          sendEvent('complete', response);
        } catch (sseErr) {
          sendEvent('error', { message: (sseErr as Error)?.message ?? 'Internal error' });
        } finally {
          res.end();
        }
        return;
      }

      // ── Regular JSON response.
      const response = await service.answer(sanitizedReq);
      res.json(response);
    } catch (err) {
      if ((err as { code?: string })?.code === 'not_ready') {
        return next(new ApiError(
          'internal_error',
          'Compliance index is not built yet. Run `npm run ia:index`.',
          503,
        ));
      }
      next(err);
    }
  });

  router.get('/references', (req, res, next) => {
    try {
      const domain = typeof req.query.domain === 'string' ? req.query.domain : undefined;
      const type = typeof req.query.type === 'string'
        ? (req.query.type as 'policy' | 'form' | 'appendix')
        : undefined;
      const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : undefined;
      res.json({ items: service.listReferences({ domain, type, limit }) });
    } catch (err) {
      next(err);
    }
  });

  router.get('/references/:id', (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      if (!id) throw new ApiError('validation_error', 'Missing reference id.', 400);
      const ref = service.getReference(id);
      if (!ref) throw new ApiError('event_not_found', `Reference not found: ${id}`, 404);
      res.json(ref);
    } catch (err) {
      next(err);
    }
  });

  router.post('/index/rebuild', async (_req, res, next) => {
    try {
      const status = await service.rebuild();
      res.json({ status });
    } catch (err) {
      if (/rebuild_in_progress/.test((err as Error)?.message ?? '')) {
        return next(new ApiError('rate_limited', 'Index rebuild already in progress.', 429));
      }
      next(err);
    }
  });

  /* ── Operational Assessment endpoints (Phase 1+) ──────────────── */

  router.get('/operational/summary', (_req, res, next) => {
    try {
      res.json(operationalService.getSummary());
    } catch (err) {
      next(err);
    }
  });

  router.get('/operational/gaps', (req, res, next) => {
    try {
      const severity = typeof req.query.severity === 'string' ? req.query.severity : undefined;
      const source = typeof req.query.source === 'string' ? req.query.source : undefined;
      const type = typeof req.query.type === 'string' ? req.query.type : undefined;
      const gaps = operationalService.getGapsFiltered({ severity: severity as never, source, type });
      res.json({ items: gaps, count: gaps.length });
    } catch (err) {
      next(err);
    }
  });

  router.get('/operational/lifecycle', (req, res, next) => {
    try {
      const state = typeof req.query.state === 'string' ? req.query.state : undefined;
      const alerts = operationalService.getLifecycleFiltered(state);
      res.json({ items: alerts, count: alerts.length });
    } catch (err) {
      next(err);
    }
  });

  /* ── Regulatory Update endpoints (Phase 2+) ──────────────────── */

  router.get('/regulatory/updates', (_req, res, next) => {
    try {
      const updates = regulatoryMatcher.getAllUpdates();
      res.json({ items: updates, count: updates.length });
    } catch (err) {
      next(err);
    }
  });

  router.get('/regulatory/updates/:id', (req, res, next) => {
    try {
      const id = String(req.params.id ?? '').trim();
      const update = regulatoryMatcher.getUpdate(id);
      if (!update) throw new ApiError('event_not_found', `Regulatory update not found: ${id}`, 404);
      res.json(update);
    } catch (err) {
      next(err);
    }
  });

  router.get('/regulatory/policy/:policyId', (req, res, next) => {
    try {
      const policyId = String(req.params.policyId ?? '').trim().toUpperCase();
      const updates = regulatoryMatcher.getUpdatesForPolicy(policyId);
      res.json({ policyId, items: updates, count: updates.length });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
