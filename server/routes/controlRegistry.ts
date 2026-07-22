/* Control Registry — protected operational API (P5).
   Mounted at /api/master-controls BEHIND the canonical requireApiAuth boundary,
   so every request carries a verified, active Cognito actor (never x-user-*).
   Privileged actions (evidence review, sign-off, waiver) additionally require a
   compliance/admin role — a basic segregation-of-duties gate. */
import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { ControlRegistryStore } from '../controlRegistry/controlRegistryStore.js';
import type { Actor } from '../identity/session.js';

const PRIVILEGED_ROLES = new Set([
  'grp-super-admin', 'grp-admin', 'grp-user-access-admin',
  'grp-leadership-compliance-officer', 'grp-office-compliance',
]);

const store = new ControlRegistryStore();

const asyncH = (fn: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => { fn(req, res).catch(next); };

function actorOf(req: Request): Actor {
  const a = (req as Request & { actor?: Actor }).actor;
  if (!a) throw new ApiError('auth_error', 'Verified actor required.', 401);
  return a;
}
function requirePrivileged(req: Request): Actor {
  const a = actorOf(req);
  if (!a.roles?.some((r) => PRIVILEGED_ROLES.has(r))) {
    throw new ApiError('forbidden', 'This action requires a compliance/admin role.', 403);
  }
  return a;
}
const cid = (req: Request): string => String(req.params.controlId);
/** Verified actor id (the boundary always sets user_id for a verified actor). */
const uid = (a: Actor): string => uid(a) ?? 'unknown';

export function createControlRegistryRouter(): Router {
  const r = Router();

  r.get('/:controlId/state', asyncH(async (req, res) => { actorOf(req); res.json(store.getState(cid(req))); }));

  r.post('/:controlId/instances', asyncH(async (req, res) => {
    const a = actorOf(req); const b = req.body ?? {};
    res.status(201).json(store.addInstance(
      { controlId: cid(req), scopeLabel: String(b.scopeLabel ?? ''), applicable: b.applicable !== false, actor: uid(a) },
      { idempotencyKey: req.header('idempotency-key') || undefined },
    ));
  }));

  r.post('/:controlId/evidence', asyncH(async (req, res) => {
    const a = actorOf(req); const b = req.body ?? {};
    res.status(201).json(store.addEvidence({
      controlId: cid(req), title: String(b.title ?? ''), documentType: String(b.documentType ?? 'document'),
      sourceProvider: String(b.sourceProvider ?? 'manual'), sourceRecordId: b.sourceRecordId, requirementId: b.requirementId,
      instanceId: b.instanceId, effectiveDate: b.effectiveDate, expirationDate: b.expirationDate,
      hash: String(b.hash ?? ''), phiClassification: 'SYNTHETIC', actor: uid(a),
    }));
  }));

  r.post('/:controlId/evidence/:artifactId/review', asyncH(async (req, res) => {
    const a = requirePrivileged(req); const decision = String(req.body?.decision ?? 'ACCEPTED');
    const rec = store.reviewEvidence(cid(req), String(req.params.artifactId), decision as never, uid(a), req.body?.reason);
    if (!rec) throw new ApiError('not_found', 'Evidence artifact not found.', 404);
    res.json(rec);
  }));

  r.post('/:controlId/verifications', asyncH(async (req, res) => {
    const a = actorOf(req); const b = req.body ?? {};
    res.status(201).json(store.addVerification({
      controlId: cid(req), method: String(b.method ?? 'document review'), period: b.period, sampleSize: b.sampleSize,
      findings: b.findings, effectiveness: b.effectiveness ?? 'NOT_TESTED', nextDueDate: b.nextDueDate, verifier: uid(a),
    }));
  }));

  r.post('/:controlId/signoffs', asyncH(async (req, res) => {
    const a = requirePrivileged(req); const b = req.body ?? {};
    res.status(201).json(store.addSignoff({
      controlId: cid(req), signer: uid(a), verifiedRole: a.roles?.[0] ?? 'unknown',
      attestationVersion: String(b.attestationVersion ?? 'v1'), decision: b.decision === 'DECLINED' ? 'DECLINED' : 'APPROVED',
      requirementId: b.requirementId, artifactHash: b.artifactHash,
    }));
  }));

  r.post('/:controlId/deficiencies', asyncH(async (req, res) => {
    const a = actorOf(req); const b = req.body ?? {};
    res.status(201).json(store.openDeficiency({
      controlId: cid(req), severity: b.severity ?? 'MEDIUM', condition: String(b.condition ?? ''),
      correctiveActionRequired: b.correctiveActionRequired !== false, owner: uid(a), dueDate: b.dueDate,
    }));
  }));

  r.post('/:controlId/waivers', asyncH(async (req, res) => {
    const a = requirePrivileged(req); const b = req.body ?? {};
    res.status(201).json(store.addWaiver({
      controlId: cid(req), requirementId: b.requirementId, reason: String(b.reason ?? ''),
      approver: uid(a), effectiveFrom: new Date().toISOString(), effectiveTo: b.effectiveTo,
    }));
  }));

  return r;
}
