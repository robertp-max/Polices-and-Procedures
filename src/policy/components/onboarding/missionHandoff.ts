/**
 * Mission-prompt handoff bridge.
 *
 * The mission overlay stores the user's pending query in sessionStorage,
 * navigates to /iadministrator, and the iAdministrator page consumes it
 * exactly once on mount and submits via the existing query infrastructure.
 */

const PENDING_KEY = 'careindeed.brad.pendingMissionQuery.v1';

export function setPendingMissionQuery(q: string): void {
  try {
    sessionStorage.setItem(PENDING_KEY, q);
  } catch {
    /* ignore */
  }
}

export function consumePendingMissionQuery(): string | null {
  try {
    const v = sessionStorage.getItem(PENDING_KEY);
    if (!v) return null;
    sessionStorage.removeItem(PENDING_KEY);
    return v;
  } catch {
    return null;
  }
}
