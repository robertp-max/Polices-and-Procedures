/**
 * /api/ceu/* — global CEU read API.
 * ─────────────────────────────────────────────────────────────────────────────
 * All routes are PEP-protected with `execution_unit:view` / `execution_batch:view`.
 * Domain-specific mutations remain on the domain engine routers.
 */
import { Router } from 'express';
import { requirePermission } from '../access/pep.js';
import { getBatch, getCeu, listAllBatches, listAllCeus } from './registry.js';
import { ApiError } from '../errors.js';
import type { CeuDomain } from './types.js';

export const ceuRouter: Router = Router();

const ALLOWED_DOMAINS = new Set<CeuDomain>([
  'onboarding','qapi','policy','incident','training','vendor',
  'governance','it_security','clinical','audit','compliance',
]);

function parseDomain(v: unknown): CeuDomain | undefined {
  if (typeof v !== 'string') return undefined;
  return ALLOWED_DOMAINS.has(v as CeuDomain) ? (v as CeuDomain) : undefined;
}

ceuRouter.get('/',
  requirePermission('execution_unit:list'),
  async (req, res, next) => {
    try {
      const domain = parseDomain(req.query.domain);
      const result = await listAllCeus({
        domain,
        state: req.query.state as string | undefined,
        subject_user_id: req.query.subject_user_id as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 200,
      });
      res.json({ items: result, count: result.length });
    } catch (e) { next(e); }
  });

ceuRouter.get('/batches',
  requirePermission('execution_batch:list'),
  async (req, res, next) => {
    try {
      const domain = parseDomain(req.query.domain);
      const result = await listAllBatches({
        domain,
        state: req.query.state as string | undefined,
        subject_user_id: req.query.subject_user_id as string | undefined,
        limit: req.query.limit ? Number(req.query.limit) : 200,
      });
      res.json({ items: result, count: result.length });
    } catch (e) { next(e); }
  });

ceuRouter.get('/batches/:id',
  requirePermission('execution_batch:view',
    async (req) => ({ type: 'ExecutionBatch', id: String(req.params.id) })),
  async (req, res, next) => {
    try {
      const b = await getBatch(String(req.params.id));
      if (!b) throw new ApiError('event_not_found', `batch ${req.params.id} not found`, 404);
      res.json(b);
    } catch (e) { next(e); }
  });

ceuRouter.get('/:id',
  requirePermission('execution_unit:view',
    async (req) => ({ type: 'ExecutionUnit', id: String(req.params.id) })),
  async (req, res, next) => {
    try {
      const c = await getCeu(String(req.params.id));
      if (!c) throw new ApiError('event_not_found', `ceu ${req.params.id} not found`, 404);
      res.json(c);
    } catch (e) { next(e); }
  });
