import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import { AuthApi, type AuthSession, type DemoUser } from './api';

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
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
}

const STORAGE_KEY = 'ci_demo_auth_v1';
const BYPASS_LOGGED_OUT_KEY = 'ci_demo_bypass_logged_out_v1';
const REFRESH_WINDOW_MS = 60_000;
const LOCAL_DEMO_AUTH_BYPASS = import.meta.env.VITE_LOCAL_DEMO_AUTH_BYPASS === 'true';
const LOCAL_DEMO_USER: DemoUser = {
  id: 'demo-user-careindeed',
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
    return sessionStorage.getItem(BYPASS_LOGGED_OUT_KEY) === '1';
  } catch {
    return false;
  }
}

function setBypassLoggedOut(next: boolean): void {
  try {
    if (next) {
      sessionStorage.setItem(BYPASS_LOGGED_OUT_KEY, '1');
    } else {
      sessionStorage.removeItem(BYPASS_LOGGED_OUT_KEY);
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

  const writeAuth = useCallback((next: StoredAuth, nextUser?: DemoUser | null) => {
    const resolvedUser = typeof nextUser !== 'undefined' ? nextUser : (next.user ?? user ?? null);
    const persisted = { ...next, user: resolvedUser };
    setStored(persisted);
    setUser(resolvedUser);
    saveStoredAuth(persisted);
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
  }, [clearAuth, stored, writeAuth]);

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

  const login = useCallback(async (email: string, password: string) => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setBypassLoggedOut(false);
      setUser(LOCAL_DEMO_USER);
      setLoading(false);
      return;
    }

    const result = await AuthApi.login(email, password);
    writeAuth({ ...toStored(result.session), user: result.user }, result.user);
  }, [writeAuth]);

  const logout = useCallback(async () => {
    if (LOCAL_DEMO_AUTH_BYPASS) {
      setBypassLoggedOut(true);
      setUser(null);
      setLoading(false);
      return;
    }

    const accessToken = stored?.session.accessToken;
    clearAuth();
    if (accessToken) {
      try {
        await AuthApi.logout(accessToken);
      } catch {
        // no-op for demo
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
    logout,
    getAccessToken,
  }), [getAccessToken, loading, login, logout, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
