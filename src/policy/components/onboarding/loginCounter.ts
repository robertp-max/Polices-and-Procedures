/**
 * Login-count tracking for the guided onboarding tour.
 *
 * Persisted (across reloads/sessions): localStorage `careindeed.guidedTour.loginCount.v1`.
 * Per browser-session guard so a refresh does not double-increment:
 *   sessionStorage `careindeed.guidedTour.countIncremented.session.v1`.
 */

const COUNT_KEY = 'careindeed.guidedTour.loginCount.v1';
const SESSION_GUARD_KEY = 'careindeed.guidedTour.countIncremented.session.v1';
const TOUR_DONE_PREFIX = 'careindeed.guidedTour.completed.v1.';

export type TourStage = 'first' | 'second' | 'returning' | 'none';

export function readLoginCount(): number {
  try {
    const raw = localStorage.getItem(COUNT_KEY);
    if (!raw) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeLoginCount(n: number): void {
  try {
    localStorage.setItem(COUNT_KEY, String(n));
  } catch {
    /* storage may be disabled — gate is non-critical */
  }
}

/**
 * Increments login count exactly once per browser tab/session.
 * Returns the resulting count.
 */
export function incrementLoginCountOncePerSession(): number {
  let count = readLoginCount();
  try {
    const already = sessionStorage.getItem(SESSION_GUARD_KEY);
    if (already === '1') return count;
    sessionStorage.setItem(SESSION_GUARD_KEY, '1');
  } catch {
    /* if sessionStorage unavailable, still increment but only this call site */
  }
  count += 1;
  writeLoginCount(count);
  return count;
}

export function stageForCount(count: number): TourStage {
  if (count <= 1) return 'first';
  if (count === 2) return 'second';
  if (count >= 3) return 'returning';
  return 'none';
}

/**
 * Per-login completion marker so the user is not re-prompted again
 * within the same authenticated session if they close + reopen the overlay.
 */
export function markTourCompletedForCount(count: number): void {
  try {
    sessionStorage.setItem(TOUR_DONE_PREFIX + String(count), '1');
  } catch {
    /* ignore */
  }
}

export function isTourCompletedForCount(count: number): boolean {
  try {
    return sessionStorage.getItem(TOUR_DONE_PREFIX + String(count)) === '1';
  } catch {
    return false;
  }
}
