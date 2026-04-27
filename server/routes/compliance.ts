/** /api/compliance/* — read compliance object state + history. */
import { Router } from 'express';
import { store } from '../ecign/store.js';
import { currentState } from '../ecign/compliance.js';

export const complianceRouter: Router = Router();

complianceRouter.get('/objects/:kind/:id', async (req, res, next) => {
  try { res.json(await currentState(req.params.kind, req.params.id)); }
  catch (e) { next(e); }
});

complianceRouter.get('/blocked', async (_req, res, next) => {
  try {
    const all = await store.listComplianceTransitions();
    const blocked = all.filter(t => t.dependencies.some(d => !d.ok));
    res.json(blocked);
  } catch (e) { next(e); }
});

complianceRouter.get('/transitions', async (req, res, next) => {
  try {
    const kind = req.query.kind as string | undefined;
    const id = req.query.id as string | undefined;
    res.json(await store.listComplianceTransitions(kind, id));
  } catch (e) { next(e); }
});
