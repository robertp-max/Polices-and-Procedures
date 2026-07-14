/**
 * AuthProvider — Phase COG-1 (Cognito-backed real authentication).
 *
 * The authenticated identity comes from the existing Cognito auth API
 * (src/auth/api.ts → server/routes/auth.ts → Cognito). Downstream consumers
 * keep the existing useAuth() contract: `user` remains DemoUser-shape
 * compatible (id/name/email/role/emailVerified) with COG-1 fields added
 * (userId/cognitoSub/appRole/session timestamps). No consumer parses raw
 * Cognito tokens — token handling is isolated in ./session.ts and here.
 *
 * Demo bypass: on local/dev hosts ONLY (see ./bypass.ts — CloudFront
 * production is explicitly excluded), an unauthenticated visitor gets the
 * labeled demo identity so existing local flows keep working. In
 * production-shaped hosting there is NO demo fallback: unauthenticated users
 * stay unauthenticated and route guards send them to /login.
 *
 * The provider interface is deliberately IdP-agnostic (login/logout/challenge/
 * refreshUser/getAccessToken) so a later Firebase migration replaces this file
 * and ./api.ts, not every consumer.
 */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthApi, AuthApiError, type AuthSession, type DemoUser } from './api';
import {
  clearSession, getRefreshToken, isSessionExpired, loadSession, saveSession,
  type StoredSessionEnvelope,
} from './session';
import { isDemoAuthBypassEnabled } from './bypass';
import { upsertAuthenticatedAppUser } from '@/policy/security/identity/userAssignmentsStore';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'demo';

export interface AuthUser {
  /** Canonical CIHHC userId (identity registry id once bound; Cognito sub otherwise). */
  userId: string;
  cognitoSub: string;
  email: string;
  displayName: string;
  status: 'active';
  /** Server-provided role (authoritative for access decisions). */
  appRole?: string;
  sessionIssuedAt?: string;
  sessionExpiresAt?: string;
  /** True only for the local-development demo identity. */
  isDemo: boolean;
  /* ── Legacy DemoUser-compatible aliases (existing consumers) ── */
  id: string;
  name?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  provider?: string;
  authSubject?: string;
}

/** Typed internal challenge model — raw Cognito challenge objects stay inside. */
export interface AuthChallenge {
  type: 'NEW_PASSWORD_REQUIRED';
  email: string;
}

export type LoginOutcome = 'ok' | 'challenge';

interface AuthContextType {
  user: AuthUser | null;
  status: AuthStatus;
  /** True until the initial session restoration resolves. Guards must wait on this. */
  loading: boolean;
  challenge: AuthChallenge | null;
  error: string | null;
  isDemo: boolean;
  login: (email: string, password: string) => Promise<LoginOutcome>;
  completeNewPassword: (newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  /** Access token for authorized API calls — auth layer only concern. */
  getAccessToken: () => string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Generic credential error — never discloses whether the account exists. */
const GENERIC_LOGIN_ERROR = 'Incorrect email or password.';
const SERVICE_ERROR = 'Sign-in is temporarily unavailable. Please try again shortly.';

const DEMO_BYPASS_USER: AuthUser = {
  userId: 'demo-user',
  cognitoSub: 'demo-user',
  email: 'demo@example.com',
  displayName: 'Demo User',
  status: 'active',
  appRole: 'Administrator',
  isDemo: true,
  id: 'demo-user',
  name: 'Demo User',
  role: 'Administrator',
  firstName: 'Demo',
  lastName: 'User',
  emailVerified: true,
  provider: 'demo-bypass',
};

function toAuthUser(me: DemoUser, envelope: StoredSessionEnvelope | null): AuthUser {
  const cognitoSub = me.authSubject || me.id || '';
  // Bind to the canonical identity-registry User (matched/created by
  // normalized email; records authSubject/provider). userId stays stable.
  let canonicalId = cognitoSub;
  try {
    const bound = upsertAuthenticatedAppUser(me);
    if (bound?.id) canonicalId = bound.id;
  } catch {
    // Registry binding is best-effort; the session itself is still valid.
  }
  const displayName = me.name || [me.firstName, me.lastName].filter(Boolean).join(' ') || me.email;
  return {
    userId: canonicalId,
    cognitoSub,
    email: me.email,
    displayName,
    status: 'active',
    appRole: me.role,
    sessionIssuedAt: envelope ? new Date(envelope.issuedAt).toISOString() : undefined,
    sessionExpiresAt: envelope ? new Date(envelope.expiresAt).toISOString() : undefined,
    isDemo: false,
    id: canonicalId,
    name: displayName,
    role: me.role,
    firstName: me.firstName,
    lastName: me.lastName,
    emailVerified: me.emailVerified,
    provider: me.provider ?? 'cognito',
    authSubject: cognitoSub,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [challenge, setChallenge] = useState<AuthChallenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const envelopeRef = useRef<StoredSessionEnvelope | null>(null);
  // Raw Cognito challenge session string never leaves the provider.
  const challengeSessionRef = useRef<{ email: string; session: string } | null>(null);

  const settleUnauthenticated = useCallback(() => {
    clearSession();
    envelopeRef.current = null;
    if (isDemoAuthBypassEnabled()) {
      setUser(DEMO_BYPASS_USER);
      setStatus('demo');
    } else {
      setUser(null);
      setStatus('unauthenticated');
    }
  }, []);

  const adoptSession = useCallback(async (session: AuthSession, meFromLogin?: DemoUser) => {
    const envelope = saveSession(session);
    envelopeRef.current = envelope;
    const me = meFromLogin ?? (await AuthApi.getCurrentUser(session.accessToken)).user;
    setUser(toAuthUser(me, envelope));
    setStatus('authenticated');
    setChallenge(null);
    challengeSessionRef.current = null;
  }, []);

  /** Try in-memory refresh token; returns true when a new session was adopted. */
  const tryRefresh = useCallback(async (): Promise<boolean> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    try {
      const { session } = await AuthApi.refresh(refreshToken);
      await adoptSession(session);
      return true;
    } catch {
      return false;
    }
  }, [adoptSession]);

  // Initial session restoration — status stays 'loading' until this settles,
  // so protected pages never flash as authenticated (or as login) early.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const envelope = loadSession();
      if (!envelope) {
        if (!cancelled) settleUnauthenticated();
        return;
      }
      if (isSessionExpired(envelope)) {
        if (!(await tryRefresh()) && !cancelled) settleUnauthenticated();
        return;
      }
      try {
        envelopeRef.current = envelope;
        const { user: me } = await AuthApi.getCurrentUser(envelope.accessToken);
        if (!cancelled) {
          setUser(toAuthUser(me, envelope));
          setStatus('authenticated');
        }
      } catch {
        // Expired/revoked/disabled → attempt refresh once, else sign out state.
        if (!(await tryRefresh()) && !cancelled) settleUnauthenticated();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only restoration
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<LoginOutcome> => {
    setError(null);
    try {
      const result = await AuthApi.login(email, password);
      if ('challenge' in result && result.challenge === 'NEW_PASSWORD_REQUIRED') {
        challengeSessionRef.current = { email: result.email || email, session: result.session };
        setChallenge({ type: 'NEW_PASSWORD_REQUIRED', email: result.email || email });
        return 'challenge';
      }
      if ('user' in result) {
        await adoptSession(result.session, result.user);
        return 'ok';
      }
      setError(SERVICE_ERROR);
      throw new AuthApiError(SERVICE_ERROR, 500);
    } catch (e) {
      if (e instanceof AuthApiError) {
        // Generic message for credential/authorization failures — no account
        // enumeration; pass through only safe non-credential service errors.
        const message = e.status === 401 || e.status === 403 || e.status === 400
          ? GENERIC_LOGIN_ERROR
          : SERVICE_ERROR;
        setError(message);
        throw new AuthApiError(message, e.status, e.code);
      }
      setError(SERVICE_ERROR);
      throw e;
    }
  }, [adoptSession]);

  const completeNewPassword = useCallback(async (newPassword: string) => {
    const pending = challengeSessionRef.current;
    if (!pending) {
      setError('Your sign-in session expired. Please sign in again.');
      throw new AuthApiError('No pending challenge.', 400);
    }
    setError(null);
    try {
      const result = await AuthApi.respondChallenge(pending.email, pending.session, newPassword);
      await adoptSession(result.session, result.user);
    } catch (e) {
      const message = e instanceof AuthApiError && e.status === 400
        ? 'That password does not meet the password policy. Try a longer password with upper/lower case letters, a number, and a symbol.'
        : SERVICE_ERROR;
      setError(message);
      throw e;
    }
  }, [adoptSession]);

  const logout = useCallback(async () => {
    const accessToken = envelopeRef.current?.accessToken ?? loadSession()?.accessToken ?? '';
    try {
      if (accessToken) await AuthApi.logout(accessToken);
    } catch {
      // Server-side revocation is best-effort; local session is cleared regardless.
    } finally {
      setChallenge(null);
      challengeSessionRef.current = null;
      settleUnauthenticated();
    }
  }, [settleUnauthenticated]);

  const refreshUser = useCallback(async () => {
    const envelope = envelopeRef.current ?? loadSession();
    if (!envelope) return;
    try {
      const { user: me } = await AuthApi.getCurrentUser(envelope.accessToken);
      setUser(toAuthUser(me, envelope));
      setStatus('authenticated');
    } catch {
      // Disabled/revoked on the server → next check denies access.
      if (!(await tryRefresh())) settleUnauthenticated();
    }
  }, [settleUnauthenticated, tryRefresh]);

  const getAccessToken = useCallback((): string | null => {
    const envelope = envelopeRef.current ?? loadSession();
    if (!envelope || isSessionExpired(envelope)) return null;
    return envelope.accessToken;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo<AuthContextType>(() => ({
    user,
    status,
    loading: status === 'loading',
    challenge,
    error,
    isDemo: status === 'demo',
    login,
    completeNewPassword,
    logout,
    refreshUser,
    getAccessToken,
    clearError,
  }), [user, status, challenge, error, login, completeNewPassword, logout, refreshUser, getAccessToken, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    // Headless/test environments without the provider: behave as an
    // unauthenticated context on production hosts and as demo only where the
    // local bypass explicitly allows it. Never a silent production demo user.
    const bypass = isDemoAuthBypassEnabled();
    return {
      user: bypass ? DEMO_BYPASS_USER : null,
      status: bypass ? 'demo' : 'unauthenticated',
      loading: false,
      challenge: null,
      error: null,
      isDemo: bypass,
      login: async () => { throw new AuthApiError('AuthProvider is not mounted.', 500); },
      completeNewPassword: async () => { throw new AuthApiError('AuthProvider is not mounted.', 500); },
      logout: async () => {},
      refreshUser: async () => {},
      getAccessToken: () => null,
      clearError: () => {},
    };
  }
  return context;
};
