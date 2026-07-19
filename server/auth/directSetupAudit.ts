import type { AuditEventInput } from '../audit/writer.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';

/**
 * Audit events for the allowlist-gated direct account-setup flow
 * (verify-registration → setup-account-direct).
 *
 * The subject is the self-activating user (identified by normalized email — the
 * canonical registry id is bound on first login). Events carry NO activation
 * code, password, setup token, JWT, cookie, or Cognito subject — only the
 * outcome and provider. Kept pure so attribution + no-leak are unit-testable
 * without a live route.
 */
export type DirectSetupOutcome =
  | 'verify_approved'
  | 'verify_denied'
  | 'setup_complete'
  | 'setup_denied'
  | 'setup_replay_denied';

export function buildDirectSetupAuditEvent(
  emailNormalized: string,
  outcome: DirectSetupOutcome,
  correlationId?: string,
): AuditEventInput {
  const denied = outcome.endsWith('_denied');
  const action = outcome.startsWith('verify') ? 'auth.direct_setup.verify' : 'auth.direct_setup.complete';
  return {
    event_type: 'account_activation',
    stream: `account-activation:${emailNormalized}`,
    actor: { type: 'user', user_id: emailNormalized, display_name: emailNormalized },
    action,
    resource: { type: 'user', id: emailNormalized },
    decision: denied ? 'deny' : 'permit',
    decision_reason: outcome,
    severity: denied ? 'notice' : 'info',
    correlation_id: correlationId,
    request_id: correlationId,
    payload: { outcome, provider: 'cognito' },
  };
}

/**
 * Durably record a SUCCESSFUL activation, or fail the request. Activation is an
 * identity mutation, so its audit evidence is not optional: if the account was
 * activated but the audit write fails, surface a classified 500 (no secret)
 * rather than a silent success. The account is already active (Cognito password
 * set), so the operator must reconcile — re-running setup would be rejected as a
 * duplicate.
 */
export async function recordSetupSuccessAudit(
  emailNormalized: string,
  correlationId: string | undefined,
  append: (event: AuditEventInput) => Promise<unknown>,
): Promise<void> {
  try {
    await append(buildDirectSetupAuditEvent(emailNormalized, 'setup_complete', correlationId));
  } catch (auditErr) {
    log.error('auth.direct_setup.audit_write_failed', {
      email: emailNormalized,
      errMessage: (auditErr as Error)?.message || 'unknown',
    });
    throw new ApiError(
      'internal_error',
      'Your account was activated, but its activation audit record could not be written. '
      + 'Please contact your administrator — do not re-run setup.',
      500,
    );
  }
}

/**
 * Best-effort audit for a verification or a denied setup: these must never block
 * or alter the user-facing response, so a write failure is swallowed (logged
 * upstream by the store). Returns a promise the caller may ignore.
 */
export async function recordDirectSetupAuditBestEffort(
  emailNormalized: string,
  outcome: DirectSetupOutcome,
  correlationId: string | undefined,
  append: (event: AuditEventInput) => Promise<unknown>,
): Promise<void> {
  try {
    await append(buildDirectSetupAuditEvent(emailNormalized, outcome, correlationId));
  } catch {
    /* best-effort: never block/alter the response on an audit write failure */
  }
}
