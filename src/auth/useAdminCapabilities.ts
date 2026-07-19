/**
 * Server-authoritative capability gate for admin-only surfaces (COG).
 *
 * Fetches `GET /api/auth/capabilities` with the current access token and exposes
 * `manageUsers` as DISPLAY / NAVIGATION state only — every protected server
 * mutation independently re-authorizes the token, so this hook is never the
 * security boundary. The capability is:
 *   - derived from the server, never from a client role/header/query value;
 *   - never read from or persisted to localStorage/sessionStorage (in-memory);
 *   - cleared when the session ends (status → unauthenticated);
 *   - refetched when a session is (re)established or restored.
 *
 * States: idle → loading → allowed | denied | error.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { AuthApi } from './api';
import { useAuth } from './AuthProvider';

export type CapabilityState = 'idle' | 'loading' | 'allowed' | 'denied' | 'error';

export interface ManageUsersCapability {
  state: CapabilityState;
  /** True only when the server has resolved the actor as an admin. */
  manageUsers: boolean;
  refetch: () => void;
}

export function useManageUsersCapability(): ManageUsersCapability {
  const { status, getAccessToken, isDemo } = useAuth();
  const [state, setState] = useState<CapabilityState>('idle');
  // Monotonic request id so a slow in-flight response cannot overwrite a newer
  // one (e.g. after logout or a fast re-auth).
  const reqId = useRef(0);

  const resolveCapability = useCallback(async () => {
    // Invalidate any in-flight response so a stale resolve cannot overwrite a
    // newer auth state (e.g. after logout).
    const id = ++reqId.current;
    if (status === 'loading') { setState('loading'); return; }
    if (status === 'unauthenticated') { setState('denied'); return; } // cleared on de-auth
    // Local demo bypass (dev hosts only) is the labeled Administrator identity
    // with no real token to present; grant the DISPLAY capability without a
    // server round-trip. Production (Cognito) always resolves server-side.
    if (isDemo) { setState('allowed'); return; }
    const token = getAccessToken();
    if (!token) { setState('denied'); return; }
    setState('loading');
    try {
      const res = await AuthApi.getCapabilities(token);
      if (id !== reqId.current) return; // superseded by a newer request
      setState(res.authorization?.capabilities?.manageUsers ? 'allowed' : 'denied');
    } catch {
      if (id !== reqId.current) return;
      // Do NOT treat an error as authorization — surface a retryable error state.
      setState('error');
    }
  }, [status, getAccessToken, isDemo]);

  // The effect body only kicks off the async resolver; all state transitions
  // happen inside it, so auth changes (login/logout/restore) re-resolve.
  useEffect(() => { void resolveCapability(); }, [resolveCapability]);

  return {
    state,
    manageUsers: state === 'allowed',
    refetch: () => { void resolveCapability(); },
  };
}
