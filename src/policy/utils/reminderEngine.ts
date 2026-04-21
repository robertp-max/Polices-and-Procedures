/**
 * Reminder Engine
 * Computes the active reminder window for a compliance event based on
 * how many days remain until the due date.
 *
 * Reminder windows (per mandated-events blueprint):
 *   60 days  → info / early-planning
 *   30 days  → low  / pre-work should start
 *   14 days  → medium / active preparation required
 *    7 days  → high  / urgent — must act now
 *    1 day   → critical / due tomorrow
 *    0 days  → critical / due today
 *
 * Only the NEAREST triggered window is returned.
 * If the event is overdue (negative days), returns null
 * — the urgency engine handles the overdue state.
 */

/* ─── Types ──────────────────────────────────────────────────── */

export type ReminderWindowDays = 60 | 30 | 14 | 7 | 1;
export type ReminderUrgency = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface ActiveReminder {
  /** Days remaining until the event is due */
  daysRemaining: number;
  /** The reminder window that was triggered (60/30/14/7/1) */
  nearestWindow: ReminderWindowDays;
  /** Severity of this reminder */
  urgencyLevel: ReminderUrgency;
  /** Short human-readable label: "Due today", "Due in 5d", etc. */
  label: string;
  /** Longer helper message suitable for a tooltip or row subtitle */
  message: string;
}

/* ─── Ordered reminder windows (tightest first) ─────────────── */

const REMINDER_WINDOWS: ReminderWindowDays[] = [1, 7, 14, 30, 60];

/* ─── Core computation ───────────────────────────────────────── */

/**
 * Compute the active reminder status for an event.
 * @param daysUntilDue  Positive = future, 0 = today, negative = overdue.
 * @returns ActiveReminder or null (not yet in a reminder window / already overdue).
 */
export function computeActiveReminder(daysUntilDue: number): ActiveReminder | null {
  if (daysUntilDue < 0) return null; // overdue — handled by urgency engine

  // Find the tightest window the event falls within
  const triggeredWindow = REMINDER_WINDOWS.find(w => daysUntilDue <= w);
  if (!triggeredWindow) return null; // more than 60 days out

  const urgencyLevel: ReminderUrgency =
    daysUntilDue === 0 ? 'critical' :
    daysUntilDue <= 1  ? 'critical' :
    daysUntilDue <= 7  ? 'high' :
    daysUntilDue <= 14 ? 'medium' :
    daysUntilDue <= 30 ? 'low' :
    'info';

  const label =
    daysUntilDue === 0 ? 'Due today' :
    daysUntilDue === 1 ? 'Due tomorrow' :
    `Due in ${daysUntilDue}d`;

  const message =
    urgencyLevel === 'critical' ? 'Action required immediately — event closes today or tomorrow.' :
    urgencyLevel === 'high'     ? 'Final preparation window. All pre-work must be complete.' :
    urgencyLevel === 'medium'   ? 'Two-week window. Assign tasks and confirm evidence readiness.' :
    urgencyLevel === 'low'      ? '30-day reminder. Pre-work and scheduling should begin.' :
    '60-day reminder. Begin planning and resource allocation.';

  return {
    daysRemaining: daysUntilDue,
    nearestWindow: triggeredWindow,
    urgencyLevel,
    label,
    message,
  };
}

/* ─── Color helpers ──────────────────────────────────────────── */

export const REMINDER_COLORS: Record<ReminderUrgency, { fg: string; bg: string; border: string }> = {
  critical: { fg: '#EF4444', bg: 'rgba(239,68,68,0.10)',  border: 'rgba(239,68,68,0.35)' },
  high:     { fg: '#F97316', bg: 'rgba(249,115,22,0.10)', border: 'rgba(249,115,22,0.35)' },
  medium:   { fg: '#FBBF24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
  low:      { fg: '#A3A3A3', bg: 'rgba(163,163,163,0.08)', border: 'rgba(163,163,163,0.25)' },
  info:     { fg: '#6B7280', bg: 'rgba(107,114,128,0.08)', border: 'rgba(107,114,128,0.20)' },
};

/**
 * Returns the reminder window label text for a given window days value.
 * Used in tooltip / detail display.
 */
export function reminderWindowLabel(window: ReminderWindowDays): string {
  return {
    60: '60-day reminder',
    30: '30-day reminder',
    14: '14-day reminder',
     7: '7-day reminder',
     1: '1-day reminder',
  }[window] ?? '';
}
