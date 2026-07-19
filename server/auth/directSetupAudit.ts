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
  | 'setup_started'
  | 'setup_complete'
  | 'setup_denied'
  | 'setup_replay_denied';

export function buildDirectSetupAuditEvent(
  emailNormalized: string,
  outcome: DirectSetupOutcome,
  correlationId?: string,
): AuditEventInput {
  const denied = outcome.endsWith('_denied');
  const action = outcome.startsWith('verify')
    ? 'auth.direct_setup.verify'
    : outcome === 'setup_started'
      ? 'auth.direct_setup.start'
      : 'auth.direct_setup.complete';
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

/** Interleaved, required audit for the two reconciliation checkpoints. */
export type DirectSetupAuditSink = (phase: 'setup_started' | 'setup_complete') => Promise<void>;

/**
 * Build a phase-aware, REQUIRED audit sink for direct setup so activation cannot
 * become usable while its audit evidence is permanently absent:
 *
 *  - `setup_started` (intent) is written BEFORE any irreversible mutation. A
 *    failure throws 503 and no Cognito mutation occurs.
 *  - `setup_complete` is written AFTER the Cognito mutation but BEFORE the
 *    registration is marked active. A failure throws a classified 500; the
 *    account stays non-active (login gate denies it) and a retry reconciles.
 *
 * No activation code, password, token, cookie, or Cognito subject is recorded.
 */
export function makeDirectSetupAuditSink(
  emailNormalized: string,
  correlationId: string | undefined,
  append: (event: AuditEventInput) => Promise<unknown>,
): DirectSetupAuditSink {
  return async (phase) => {
    try {
      await append(buildDirectSetupAuditEvent(emailNormalized, phase, correlationId));
    } catch (auditErr) {
      log.error('auth.direct_setup.audit_write_failed', {
        email: emailNormalized,
        phase,
        errMessage: (auditErr as Error)?.message || 'unknown',
      });
      if (phase === 'setup_started') {
        throw new ApiError(
          'internal_error',
          'Account setup is temporarily unavailable (audit subsystem). No changes were made — please try again.',
          503,
        );
      }
      throw new ApiError(
        'internal_error',
        'Your account activation could not be finalized because its audit record failed to write. '
        + 'The account is not yet usable; please retry — retrying is safe and will not create a duplicate.',
        500,
      );
    }
  };
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
