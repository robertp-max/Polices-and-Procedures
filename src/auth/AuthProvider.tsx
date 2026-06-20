import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AuthApi, type AuthSession, type DemoUser, type LoginChallengeResponse } from './api';
import { isDemoAuthBypassEnabled } from './bypass';
import { hydrateIdentityRegistry, upsertAuthenticatedAppUser } from '@/policy/security/identity/userAssignmentsStore';

interface StoredAuth {
  session: AuthSession;
  expiresAt: number;
  user?: DemoUser | null;
}

interface AuthContextValue {
  user: DemoUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  completeNewPassword: (email: string, session: string, newPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const STORAGE_KEY = 'ci_demo_auth_v1';
const BYPASS_LOGGED_OUT_KEY = 'ci_demo_bypass_logged_out_v1';
const LOGOUT_BROADCAST_KEY = 'ci_demo_auth_logout_broadcast_v1';
const REFRESH_WINDOW_MS = 60_000;
const LOGIN_PATH = '/login';

function broadcastLogout(): void {
  try {
    localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
  } catch {
    /* noop */
  }
}

function redirectToLogin(): void {
  try {
    if (typeof window === 'undefined') return;
    const path = window.location.pathname;
    if (path === LOGIN_PATH || path.startsWith('/login') || path === '/' || path.startsWith('/setup-account') || path.startsWith('/forgot-password') || path.startsWith('/reset-password') || path.startsWith('/check-email') || path.startsWith('/register') || path.startsWith('/set-new-password')) {
      return;
    }
    window.location.assign(LOGIN_PATH);
  } catch {
    /* noop */
  }
}
const LOCAL_DEMO_AUTH_BYPASS = isDemoAuthBypassEnabled();
const LOCAL_DEMO_USER: DemoUser = {
  id: 'demo-user-careindeed',
  authSubject: 'demo-user-careindeed',
  provider: 'local-demo',
  email: 'robertp@careindeed.com',
  name: 'TJ Padilla',
  role: 'super_admin',
  firstName: 'TJ',
  lastName: 'Padilla',
  emailVerified: true,
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isBypassLoggedOut(): boolean {
  try {
    return localStorage.getItem(BYPASS_LOGGED_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

function setBypassLoggedOut(next: boolean): void {
  try {
    if (next) {
      localStorage.setItem(BYPASS_LOGGED_OUT_KEY, '1');
    } else {
      localStorage.removeItem(BYPASS_LOGGED_OUT_KEY);
    }
  } catch {
    /* noop */
  }
}

function loadStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredAuth;
    if (!parsed?.session?.refreshToken || !parsed?.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveStoredAuth(stored: StoredAuth | null): void {
  if (!stored) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

function toStored(session: AuthSession): StoredAuth {
  return {
    session,
    expiresAt: Date.now() + session.expiresIn * 1000,
  };
}

async function syncAuthenticatedRegistry(accessToken: string | null): Promise<void> {
  if (!accessToken || LOCAL_DEMO_AUTH_BYPASS) return;
  try {
    const registry = await AuthApi.syncCurrentIdentity(accessToken);
    hydrateIdentityRegistry({
      users: registry.users,
      assignments: registry.assignments,
    });
  } catch {
    // Local upsert keeps the session usable if the registry API is unavailable.
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [stored, setStored] = useState<StoredAuth | null>(() => (LOCAL_DEMO_AUTH_BYPASS ? null : loadStoredAuth()));
  const [user, setUser] = useState<DemoUser | null>(() => {
    if (LOCAL_DEMO_AUTH_BYPASS) return isBypassLoggedOut() ? null : LOCAL_DEMO_USER;
    return loadStoredAuth()?.user ?? null;
  });
  const [loading, setLoading] = useState(false);
  const hasBootstrappedRef = useRef(false);

  const clearAuth = useCallback(() => {
    setStored(null);
    setUser(null);
    saveStoredAuth(null);
  }, []);

  const forceLogout = useCallback((opts?: { redirect?: boolean; broadcast?: boolean }) => {
    const redirect = opts?.redirect !== false;
    const broadcast = opts?.broadcast === true;
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setBypassLoggedOut(true);
    }
    clearAuth();
    setLoading(false);
    if (broadcast) broadcastLogout();
    if (redirect) redirectToLogin();
  }, [clearAuth]);

  const writeAuth = useCallback((next: StoredAuth, nextUser?: DemoUser | null) => {
    const resolvedUser = typeof nextUser !== 'undefined' ? nextUser : (next.user ?? user ?? null);
    const persisted = { ...next, user: resolvedUser };
    upsertAuthenticatedAppUser(resolvedUser);
    setStored(persisted);
    setUser(resolvedUser);
    saveStoredAuth(persisted);
  }, [user]);

  useEffect(() => {
    upsertAuthenticatedAppUser(user);
  }, [user]);

  const refreshIfNeeded = useCallback(async (force = false): Promise<StoredAuth | null> => {
    const current = stored ?? loadStoredAuth();
    if (!current) return null;

    if (!force && current.expiresAt - Date.now() > REFRESH_WINDOW_MS) {
      if (!stored) {
        setStored(current);
        setUser(current.user ?? null);
      }
      return current;
    }

    try {
      const refreshed = await AuthApi.refresh(current.session.refreshToken);
      const next = { ...toStored(refreshed.session), user: current.user ?? user ?? null };
      writeAuth(next, next.user ?? null);
      return next;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth, stored, user, writeAuth]);

  const bootstrap = useCallback(async () => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setUser(isBypassLoggedOut() ? null : LOCAL_DEMO_USER);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const next = await refreshIfNeeded();
      if (!next) {
        clearAuth();
        return;
      }
      const me = await AuthApi.getCurrentUser(next.session.accessToken);
      writeAuth(next, me.user);
      await syncAuthenticatedRegistry(next.session.accessToken);
    } catch {
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, [clearAuth, refreshIfNeeded, writeAuth]);

  useEffect(() => {
    if (hasBootstrappedRef.current) return;
    hasBootstrappedRef.current = true;
    void bootstrap();
  }, [bootstrap]);

  // Cross-tab logout sync. When another tab broadcasts a logout (or clears the
  // stored auth blob, or sets the bypass-logged-out flag), this tab also force-
  // logs out and redirects to /login. Tokens are wiped from localStorage and
  // React state in all tabs without requiring a manual refresh.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (event: StorageEvent) => {
      if (!event.key) {
        // entire storage cleared from another tab
        forceLogout({ redirect: true, broadcast: false });
        return;
      }
      if (event.key === LOGOUT_BROADCAST_KEY) {
        forceLogout({ redirect: true, broadcast: false });
        return;
      }
      if (event.key === STORAGE_KEY && event.newValue === null) {
        forceLogout({ redirect: true, broadcast: false });
        return;
      }
      if (event.key === BYPASS_LOGGED_OUT_KEY && event.newValue === '1') {
        forceLogout({ redirect: true, broadcast: false });
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [forceLogout]);

  // Re-validate session on tab focus. If the refresh token has been revoked
  // (e.g. logout from another tab/device), this clears local state and
  // redirects to login.
  useEffect(() => {
    if (LOCAL_DEMO_AUTH_BYPASS) return;
    if (typeof window === 'undefined') return;
    const onFocus = async () => {
      const current = stored ?? loadStoredAuth();
      if (!current) return;
      try {
        const next = await refreshIfNeeded();
        if (!next) {
          forceLogout({ redirect: true, broadcast: false });
        }
      } catch {
        forceLogout({ redirect: true, broadcast: false });
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [forceLogout, refreshIfNeeded, stored]);

  const login = useCallback(async (email: string, password: string) => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setBypassLoggedOut(false);
      setUser(LOCAL_DEMO_USER);
      setLoading(false);
      return;
    }

    const result = await AuthApi.login(email, password);
    if ('challenge' in result) {
      // Cognito requires a new password — throw a typed error for the UI to handle
      const err = new Error('NEW_PASSWORD_REQUIRED') as Error & { challenge: LoginChallengeResponse };
      err.challenge = result as LoginChallengeResponse;
      throw err;
    }
    writeAuth({ ...toStored(result.session), user: result.user }, result.user);
    await syncAuthenticatedRegistry(result.session.accessToken);
  }, [writeAuth]);

  const completeNewPassword = useCallback(async (email: string, session: string, newPassword: string) => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setBypassLoggedOut(false);
      setUser(LOCAL_DEMO_USER);
      setLoading(false);
      return;
    }

    const result = await AuthApi.respondChallenge(email, session, newPassword);
    writeAuth({ ...toStored(result.session), user: result.user }, result.user);
    await syncAuthenticatedRegistry(result.session.accessToken);
  }, [writeAuth]);

  const logout = useCallback(async () => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setBypassLoggedOut(true);
      setUser(null);
      setLoading(false);
      broadcastLogout();
      return;
    }

    const accessToken = stored?.session.accessToken;
    clearAuth();
    broadcastLogout();
    if (accessToken) {
      try {
        await AuthApi.logout(accessToken);
      } catch {
        // best-effort: tokens are already cleared locally
      }
    }
  }, [clearAuth, stored?.session.accessToken]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      return null;
    }

    const next = await refreshIfNeeded();
    return next?.session.accessToken ?? null;
  }, [refreshIfNeeded]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    login,
    completeNewPassword,
    logout,
    getAccessToken,
  }), [completeNewPassword, getAccessToken, loading, login, logout, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Defensive: do not crash the shell if rendered outside provider (e.g. standalone demos, HMR, or mis-wrapped routes).
    // Return a safe unauthenticated default. Real usage is always under the provider in the main tree.
    if (import.meta.env.DEV) {
      console.warn('[useAuth] called outside AuthProvider — returning demo default. Ensure AuthProvider wraps the tree.');
    }
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      login: async () => {},
      completeNewPassword: async () => {},
      logout: async () => {},
      getAccessToken: async () => null,
    };
  }
  return ctx;
}
