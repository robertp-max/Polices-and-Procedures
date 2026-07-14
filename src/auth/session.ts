/**
 * Auth session containment — Phase COG-1.
 *
 * The deployed auth API returns Cognito tokens directly, so token handling is
 * isolated HERE and in AuthProvider; no other module touches tokens.
 *
 * Storage policy:
 *  - access token: sessionStorage only (per-tab, cleared on browser close).
 *    Narrowly contained so the session survives an F5 refresh. Documented
 *    residual risk: any same-origin XSS could read it — same exposure class
 *    as the token living in JS memory at all.
 *  - refresh token: IN MEMORY ONLY. Never localStorage, never sessionStorage,
 *    never cookies set by JS. After a full page reload the refresh token is
 *    gone by design; if the access token has also expired the user signs in
 *    again.
 *  - Nothing here is ever logged; see redactForLog().
 */
import type { AuthSession } from './api';

const SESSION_KEY = 'ci.authSession.v1';

/** Refresh token lives only in module memory — wiped on reload/tab close. */
let refreshTokenMemory: string | null = null;

export interface StoredSessionEnvelope {
  accessToken: string;
  /** Epoch ms when the access token expires. */
  expiresAt: number;
  issuedAt: number;
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.sessionStorage : null;
  } catch {
    return null;
  }
}

/** Persist the access-token envelope (session-scoped) + hold refresh in memory. */
export function saveSession(session: AuthSession): StoredSessionEnvelope {
  const issuedAt = Date.now();
  const envelope: StoredSessionEnvelope = {
    accessToken: session.accessToken,
    expiresAt: issuedAt + Math.max(60, session.expiresIn || 3600) * 1000,
    issuedAt,
  };
  refreshTokenMemory = session.refreshToken || null;
  storage()?.setItem(SESSION_KEY, JSON.stringify(envelope));
  return envelope;
}

export function loadSession(): StoredSessionEnvelope | null {
  const raw = storage()?.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredSessionEnvelope;
    if (!parsed.accessToken || !parsed.expiresAt) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  refreshTokenMemory = null;
  storage()?.removeItem(SESSION_KEY);
}

export function getRefreshToken(): string | null {
  return refreshTokenMemory;
}

export function isSessionExpired(envelope: StoredSessionEnvelope, skewMs = 30_000): boolean {
  return Date.now() >= envelope.expiresAt - skewMs;
}

/** Invariant check used by tests: no token material may reach localStorage. */
export function localStorageHasNoTokens(): boolean {
  try {
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);
      const value = key ? window.localStorage.getItem(key) ?? '' : '';
      if (/refreshToken|accessToken|idToken/i.test(value) || key === SESSION_KEY) return false;
    }
    return true;
  } catch {
    return true;
  }
}

/** Strip anything token/secret-shaped before a value may be logged/shown. */
export function redactForLog(value: unknown): string {
  const s = typeof value === 'string' ? value : JSON.stringify(value ?? '');
  return s
    .replace(/("?(?:access|id|refresh)Token"?\s*[:=]\s*")[^"]+(")/gi, '$1[redacted]$2')
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/g, '$1[redacted]')
    .replace(/(token=)[^&\s"]+/gi, '$1[redacted]')
    .replace(/("(?:password|newPassword|code)"\s*:\s*")[^"]+(")/gi, '$1[redacted]$2');
}
