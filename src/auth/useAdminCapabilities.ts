/**
 * Server-authoritative capability gate for admin-only surfaces (COG).
 *
 * Fetches `GET /api/auth/capabilities` with the current access token and exposes
 * `manageUsers` as DISPLAY / NAVIGATION state only — every protected server
 * mutation independently re-authorizes the token, so this hook is never the
 * security boundary. Race-safety guarantees:
 *   - Server-derived only; never a client role/header/query/storage value.
 *   - The async result is tagged with a `sessionKey` (status + principal id) and
 *     is applied ONLY while it still matches the current session — a delayed
 *     prior-admin response can never restore privileged UI after logout or an
 *     account switch.
 *   - A monotonic request sequence drops out-of-order and superseded responses
 *     (request B finishing before A cannot be overwritten by A).
 *   - A mounted guard prevents any state update after unmount.
 *   - Synchronous states (loading/denied/allowed) are DERIVED during render, so
 *     the effect only ever starts async work (no setState in the effect body).
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthApi } from './api';
import { useAuth } from './AuthProvider';

export type CapabilityState = 'idle' | 'loading' | 'allowed' | 'denied' | 'error';

export interface ManageUsersCapability {
  state: CapabilityState;
  /** True only when the server has resolved the current principal as an admin. */
  manageUsers: boolean;
  refetch: () => void;
}

type FetchedResult = { key: string; state: 'allowed' | 'denied' | 'error' };

export function useManageUsersCapability(): ManageUsersCapability {
  const { status, getAccessToken, isDemo, user } = useAuth();
  const [fetched, setFetched] = useState<FetchedResult | null>(null);
  const [nonce, setNonce] = useState(0);
  const reqSeq = useRef(0);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // Identity of the current authenticated session. Changes on login, logout,
  // account switch, or session replacement, so a fetched result tied to a prior
  // principal is never applied to the current one.
  const principal = isDemo ? 'demo' : (user?.userId ?? user?.cognitoSub ?? 'anon');
  const sessionKey = `${status}|${principal}`;
  const needsFetch = status === 'authenticated' && !isDemo;

  useEffect(() => {
    if (!needsFetch) return;                 // non-fetch states are derived below
    const token = getAccessToken();
    if (!token) return;                       // derived state → denied
    const seq = ++reqSeq.current;
    const key = sessionKey;
    void (async () => {
      try {
        const res = await AuthApi.getCapabilities(token);
        if (mounted.current && seq === reqSeq.current) {
          setFetched({ key, state: res.authorization?.capabilities?.manageUsers ? 'allowed' : 'denied' });
        }
      } catch {
        // An error is NEVER treated as authorization — it surfaces as a retryable error.
        if (mounted.current && seq === reqSeq.current) setFetched({ key, state: 'error' });
      }
    })();
    // Any dependency change (auth change, retry) invalidates the request above.
    return () => { reqSeq.current += 1; };
  }, [sessionKey, needsFetch, nonce, getAccessToken]);

  // Synchronous, render-time authority dominates. The fetched async result is
  // honored ONLY when it belongs to the current session identity; otherwise the
  // gate shows 'loading' until the current session's fetch resolves.
  let state: CapabilityState;
  if (status === 'loading') state = 'loading';
  else if (status === 'unauthenticated') state = 'denied';
  else if (isDemo) state = 'allowed';
  else if (!getAccessToken()) state = 'denied';
  else state = fetched && fetched.key === sessionKey ? fetched.state : 'loading';

  const refetch = useCallback(() => setNonce((n) => n + 1), []);

  return { state, manageUsers: state === 'allowed', refetch };
}
