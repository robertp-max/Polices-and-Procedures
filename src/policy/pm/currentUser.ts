/**
 * currentUser — demo/local user identity.
 *
 * Returns a stable user ID for the current session. In production this will
 * be replaced by a Cognito/Auth0 identity resolve, but for the local PM demo
 * it returns a fixed placeholder so all My Tasks filters, watch/unwatch, and
 * notifications work consistently without a real auth layer.
 *
 * Usage:
 *   import { getCurrentUserId } from '@/policy/pm/currentUser';
 *   const uid = getCurrentUserId();
 */

const LOCAL_STORAGE_KEY = 'hhc_actor_id';
const DEMO_USER_ID = 'demo-user-careindeed';

/**
 * Returns the current actor user ID.
 *
 * Priority:
 *   1. localStorage `hhc_actor_id` (allows overriding in dev tools)
 *   2. `DEMO_USER_ID` constant
 */
export function getCurrentUserId(): string {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored && stored.trim()) return stored.trim();
  }
  return DEMO_USER_ID;
}

/**
 * Sets the current actor ID in localStorage (dev/demo only).
 * Triggers a page reload so stores re-hydrate with the new identity.
 */
export function setCurrentUserId(userId: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, userId);
  }
}
