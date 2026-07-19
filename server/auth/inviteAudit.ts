import type { AuditEventInput } from '../audit/writer.js';
import type { AdminInviteResult } from './service.js';

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
    payload: { status: result.status, delivered: result.emailDelivered },
  };
}
