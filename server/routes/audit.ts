/** /api/audit/* — read & verify the immutable audit chain. */
import { Router } from 'express';
import { store } from '../ecign/store.js';
import { verifyChain } from '../ecign/hashChain.js';

export const auditRouter: Router = Router();

auditRouter.get('/events', async (req, res, next) => {
  try {
    const subject_id = (req.query.subject_id as string) || undefined;
    const events = await store.listAudit(subject_id);
    res.json(events);
  } catch (e) { next(e); }
});

auditRouter.post('/verify-chain', async (req, res, next) => {
  try {
    const subject_id = (req.query.subject_id as string) || undefined;
    res.json(await verifyChain(subject_id));
  } catch (e) { next(e); }
});
