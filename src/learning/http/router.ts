/**
 * Care Indeed LMS — provider-neutral HTTP router for /api/training/* (architecture §15).
 *
 * Framework-agnostic: it maps an ApiRequest (already authenticated by the host — the
 * existing Care Indeed auth / Cognito) to the application service, enforcing capability
 * checks, self-only object-level authorization, idempotency, and the stable error model.
 * A thin Express/Cloud-Run adapter converts real req/res to this shape.
 */
import type { TrainingService } from '../app/trainingService';
import type { Capability } from './authz';
import { requireCapability, requireSelf } from './authz';

export interface AuthContext {
  subjectId: string; // authenticated subject (never client-chosen)
  capabilities: Set<Capability>;
  suspended?: boolean;
  terminated?: boolean;
}

export interface ApiRequest {
  method: 'GET' | 'POST';
  path: string;
  auth?: AuthContext; // absent for public endpoints
  idempotencyKey?: string;
  body?: Record<string, unknown>;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

function err(status: number, code: string, message: string, correlationId = 'n/a'): ApiResponse {
  return { status, body: { error: { code, message, correlationId } } };
}

/** Mutations must carry an Idempotency-Key (architecture §15). */
function requireIdempotency(req: ApiRequest): ApiResponse | null {
  if (req.method === 'POST' && !req.idempotencyKey) {
    return err(400, 'IDEMPOTENCY_KEY_REQUIRED', 'POST requests require an Idempotency-Key header.');
  }
  return null;
}

function match(path: string, pattern: string): Record<string, string> | null {
  const pp = pattern.split('/');
  const ap = path.split('/');
  if (pp.length !== ap.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(':')) params[pp[i].slice(1)] = decodeURIComponent(ap[i]);
    else if (pp[i] !== ap[i]) return null;
  }
  return params;
}

export function createRouter(svc: TrainingService) {
  return async function handle(req: ApiRequest): Promise<ApiResponse> {
    const idem = requireIdempotency(req);
    if (idem) return idem;

    // ---- Public verification (no auth, data-minimized) ----
    let p = match(req.path, '/api/public/certificates/:publicId');
    if (p && req.method === 'GET') {
      const view = await svc.publicVerify(p.publicId, String(req.body?.title ?? 'Certificate'), 'Care Indeed', String(req.body?.name ?? 'Learner'));
      return view ? { status: 200, body: view } : err(404, 'CERTIFICATE_NOT_FOUND', 'No certificate with that public id.');
    }

    // ---- Everything else requires auth ----
    if (!req.auth) return err(401, 'UNAUTHENTICATED', 'Authentication required.');
    if (req.auth.suspended) return err(403, 'USER_SUSPENDED', 'This account is suspended.');

    // ---- Learner (self-only) ----
    p = match(req.path, '/api/training/me/assignments');
    if (p && req.method === 'GET') {
      const guard = requireCapability(req.auth, 'training.self.read');
      if (guard) return guard;
      const assignments = await svc.listAssignments(req.auth.subjectId);
      return { status: 200, body: { assignments } };
    }

    p = match(req.path, '/api/training/me/assignments/:assignmentId/start');
    if (p && req.method === 'POST') {
      if (req.auth.terminated) return err(403, 'USER_TERMINATED', 'Terminated users have read-only historical access.');
      const guard = requireCapability(req.auth, 'training.self.attempt.submit');
      if (guard) return guard;
      const own = await svc.getAssignment(req.auth.subjectId, p.assignmentId);
      const selfGuard = requireSelf(req.auth, own?.subjectId);
      if (selfGuard) return selfGuard;
      const res = await svc.startAttempt(req.auth.subjectId, p.assignmentId);
      return res.attempt ? { status: 201, body: { attempt: res.attempt } } : err(409, res.refused ?? 'ATTEMPT_REFUSED', 'Attempt not permitted.');
    }

    p = match(req.path, '/api/training/me/sessions/:sessionId/events');
    if (p && req.method === 'POST') {
      const guard = requireCapability(req.auth, 'training.self.activity.write');
      if (guard) return guard;
      const hb = req.body as unknown;
      const decision = await svc.heartbeat({ sessionId: p.sessionId, ...(hb as object) } as never);
      return { status: 200, body: decision };
    }

    p = match(req.path, '/api/training/me/certificates');
    if (p && req.method === 'GET') {
      const guard = requireCapability(req.auth, 'training.self.read');
      if (guard) return guard;
      const certs = await svc.listCertificatesFor(req.auth.subjectId);
      return { status: 200, body: { certificates: certs } };
    }

    // ---- Admin ----
    p = match(req.path, '/api/training/admin/plans/resolve');
    if (p && req.method === 'POST') {
      const guard = requireCapability(req.auth, 'training.hr.assign');
      if (guard) return guard;
      const subjectId = String(req.body?.subjectId ?? '');
      if (!subjectId) return err(400, 'SUBJECT_REQUIRED', 'subjectId is required.');
      await svc.provisionAssignments(subjectId);
      return { status: 200, body: { subjectId, assignments: await svc.listAssignments(subjectId) } };
    }

    return err(404, 'ROUTE_NOT_FOUND', `No handler for ${req.method} ${req.path}.`);
  };
}
