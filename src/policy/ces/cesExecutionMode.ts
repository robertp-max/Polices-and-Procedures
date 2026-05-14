/* ═══════════════════════════════════════════════════════════════
   CES Execution Mode — Centralized date classification
   --------------------------------------------------------------
   Single source of truth for CES task / event period rules:

     'future_locked'  Jul 1 2026 +    visible for planning only;
                                       no edits, completions, signs,
                                       uploads, or certifications.
                                       Excluded from ALL metrics.

     'sandbox'        Jan 1–Jun 30 2026  Q1/Q2 playground.
                                       Freely simulate everything.
                                       Not treated as production evidence.

     'production'     All other dates.  Normal compliance operation.

   Use isCesSandboxDate / isCesFutureLockedDate / getCesExecutionMode
   everywhere instead of scattered date comparisons.
   ═══════════════════════════════════════════════════════════════ */

export type CesExecutionMode = 'sandbox' | 'future_locked' | 'production';

/* ── Boundaries (UTC midnight) ─────────────────────────────── */
/** Q1/Q2 2026 sandbox start: 2026-01-01 */
const SANDBOX_START_MS = Date.UTC(2026, 0, 1);
/** Q1/Q2 2026 sandbox end (inclusive): 2026-06-30 */
const SANDBOX_END_MS   = Date.UTC(2026, 5, 30);
/** Future lock boundary: 2026-07-01 and later */
const FUTURE_LOCK_MS   = Date.UTC(2026, 6, 1);

/** Normalises any date value to UTC midnight milliseconds. */
function toUTCDayMs(value: Date | string): number {
  const s = typeof value === 'string'
    ? value.slice(0, 10)
    : value.toISOString().slice(0, 10);
  const [y, m, d] = s.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/* ── Predicates ─────────────────────────────────────────────── */

/**
 * Returns `true` when `value` falls in the Q1/Q2 2026 sandbox
 * window (Jan 1 – Jun 30, 2026, inclusive).
 *
 * Sandbox tasks may be freely completed, signed, uploaded, and reset.
 * Activity must NOT be treated as production compliance evidence.
 */
export function isCesSandboxDate(value: Date | string): boolean {
  const ms = toUTCDayMs(value);
  return ms >= SANDBOX_START_MS && ms <= SANDBOX_END_MS;
}

/**
 * Returns `true` when `value` falls in the locked-future window
 * (Jul 1, 2026 or later).
 *
 * Future-locked tasks are visible for planning but must not be
 * edited, completed, signed, uploaded, certified, or included in
 * any active metrics.
 */
export function isCesFutureLockedDate(value: Date | string): boolean {
  return toUTCDayMs(value) >= FUTURE_LOCK_MS;
}

/**
 * Returns the CES execution mode for a given date.
 *
 * Evaluation order:
 *   1. `'future_locked'` — Jul 1 2026+
 *   2. `'sandbox'`       — Jan 1–Jun 30 2026
 *   3. `'production'`    — all other dates
 */
export function getCesExecutionMode(value: Date | string): CesExecutionMode {
  if (isCesFutureLockedDate(value)) return 'future_locked';
  if (isCesSandboxDate(value))      return 'sandbox';
  return 'production';
}

/* ── UI labels ───────────────────────────────────────────────── */

/** Human-readable badge label for each execution mode. */
export const CES_EXECUTION_MODE_LABEL: Record<CesExecutionMode, string> = {
  future_locked: 'Locked \u2014 Future Period',
  sandbox:       'Sandbox / Training Playground',
  production:    'Active',
};

/** Short guard message returned from store mutations on future-locked events. */
export const FUTURE_LOCKED_GUARD_MSG =
  'Locked \u2014 Future Period. This event is not part of the active compliance period.';
