import type { AuditEventInput } from '../audit/writer.js';
import type { AdminInviteResult } from './service.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';

/**
 * Build the audit event for an administrator-initiated invitation.
 *
 * The actor is the VERIFIED administrator (resolved from the bearer token by
 * `adminInviteUser`, never from the request body), the resource is the target
 * user, and the payload carries only non-sensitive outcome fields — never a
 * setup token, setup link, password, or any credential. Kept as a pure function
 * so the attribution + no-leak contract is unit-testable without a live route.
 */
export function buildInviteAuditEvent(result: AdminInviteResult, correlationId?: string): AuditEventInput {
  return {
    event_type: 'admin_user_access',
    stream: `admin-user-access:${result.actorEmail}`,
    actor: { type: 'user', user_id: result.actorEmail, display_name: result.actorEmail },
    action: 'admin.user.invite',
    resource: { type: 'user', id: result.targetEmail },
    decision: 'permit',
    severity: 'info',
    correlation_id: correlationId,
    request_id: correlationId,
    payload: { status: result.status, delivered: result.emailDelivered, provisioned: result.provisioned },
  };
}

/**
 * Durably record the invitation audit event, or fail the request.
 *
 * For an administrator-controlled identity mutation the audit evidence is NOT
 * optional: if provisioning already occurred but the audit write fails, we
 * surface a classified partial-failure (500) that contains no secrets rather
 * than returning a success the audit trail cannot corroborate. Retrying is safe
 * — `adminInviteUser` re-ensures (never duplicates) the Cognito user and writes
 * the reconciling audit event on the retry.
 */
export async function recordInviteAudit(
  result: AdminInviteResult,
  correlationId: string | undefined,
  append: (event: AuditEventInput) => Promise<unknown>,
): Promise<void> {
  try {
    await append(buildInviteAuditEvent(result, correlationId));
  } catch (auditErr) {
    log.error('auth.admin_invite.audit_write_failed', {
      actorEmail: result.actorEmail,
      targetEmail: result.targetEmail,
      errMessage: (auditErr as Error)?.message || 'unknown',
    });
    throw new ApiError(
      'internal_error',
      'The account was provisioned but its audit record could not be written. '
      + 'Please retry — retrying is safe and will not create a duplicate account.',
      500,
    );
  }
}

/** Operator-facing, non-sensitive message for each invitation outcome. */
export function inviteResultMessage(result: AdminInviteResult): string {
  switch (result.status) {
    case 'invited_and_delivered':
      return 'Invitation sent. The user will receive a setup link to finish creating their account.';
    case 'created_delivery_pending':
      return 'Account created, but the setup-link email could not be delivered. '
        + 'The user has no activation link yet — resend once email delivery is available.';
    case 'already_pending':
      return result.emailDelivered
        ? 'A pending invitation already existed; a fresh setup link was sent.'
        : 'A pending invitation already existed; a new setup link was prepared but could not be delivered.';
    case 'already_active':
      return 'An active account already exists for that email.';
  }
}
