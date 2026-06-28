/* ═══════════════════════════════════════════════════════════════════════════
   Brad notification truthfulness.
   ----------------------------------------------------------------------------
   Brad must NEVER claim it notified anyone unless a notification action actually
   ran and returned a confirmed success. By default (no action performed) Brad
   instructs the user to contact their supervisor themselves. A later automation
   can pass a real NotificationResult here to render a truthful confirmation.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface NotificationResult {
  /** True only when a notification was actually delivered AND confirmed. */
  delivered: boolean;
  recipient?: string;
  /** Confirmed delivery timestamp (ISO). Required for a "notified at" statement. */
  confirmedAt?: string;
}

/** Default instruction when no notification action has been performed. */
export const CONTACT_SUPERVISOR_INSTRUCTION = 'Contact your supervisor immediately.';

/**
 * Truthful supervisor-notification line.
 *  - undefined        → instruct the user to contact their supervisor (no claim).
 *  - delivered+confirmed → state recipient + confirmed timestamp.
 *  - failed/unconfirmed  → tell the user to call their supervisor now.
 */
export function describeSupervisorNotification(result?: NotificationResult): string {
  if (!result) return CONTACT_SUPERVISOR_INSTRUCTION;
  if (result.delivered && result.confirmedAt) {
    const who = result.recipient ?? 'Your immediate supervisor';
    return `${who} was notified at ${result.confirmedAt}.`;
  }
  return 'I couldn’t confirm that the notification was delivered. Please call your supervisor now.';
}
