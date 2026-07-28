/**
 * Care Indeed LMS — authorization primitives (architecture §16).
 *
 * Capability checks + self-only / distinct-human enforcement helpers used by the
 * HTTP router. Capabilities are granted by the host identity system; the router
 * never derives them from the request body.
 */
import type { ApiResponse, AuthContext } from './router';

export type Capability =
  | 'training.self.read'
  | 'training.self.activity.write'
  | 'training.self.attempt.submit'
  | 'training.self.evidence.submit'
  | 'training.supervisor.read'
  | 'training.supervisor.review'
  | 'training.evaluator.observe'
  | 'training.evaluator.sign'
  | 'training.hr.assign'
  | 'training.hr.waive'
  | 'training.hr.screening-status'
  | 'training.don.clearance'
  | 'training.don.remediation'
  | 'training.compliance.audit.read'
  | 'training.compliance.evidence.review'
  | 'training.certificate.issue'
  | 'training.certificate.revoke'
  | 'training.definition.manage';

function forbidden(code: string, message: string): ApiResponse {
  return { status: 403, body: { error: { code, message, correlationId: 'n/a' } } };
}

export function requireCapability(auth: AuthContext, cap: Capability): ApiResponse | null {
  return auth.capabilities.has(cap) ? null : forbidden('MISSING_CAPABILITY', `Requires capability ${cap}.`);
}

/** Self-only: a learner may only act on their own subject-scoped resource. */
export function requireSelf(auth: AuthContext, resourceSubjectId: string | undefined): ApiResponse | null {
  if (!resourceSubjectId) return { status: 404, body: { error: { code: 'NOT_FOUND', message: 'Resource not found.', correlationId: 'n/a' } } };
  return resourceSubjectId === auth.subjectId ? null : forbidden('OBJECT_SCOPE_DENIED', 'You may only access your own records.');
}
