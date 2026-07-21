/**
 * Shared authenticated API client helpers (frontend).
 *
 * Purpose: give same-origin business surfaces (Brad, Nolan) ONE canonical way to
 *   (a) resolve the API root, and
 *   (b) attach the current Cognito bearer token,
 * reusing the existing auth/session abstraction — NOT a second auth system.
 *
 * The access token lives in sessionStorage only and is kept current by
 * AuthProvider.adoptSession (login AND refresh both call saveSession), so reading
 * it here via loadSession() is refresh-safe and equivalent to getAccessToken().
 * localStorage is never read. No token is ever logged or placed in a URL.
 */
import { loadSession, isSessionExpired } from './session';

/**
 * Canonical API root. Derived from the auth base so a single env override
 * (VITE_AUTH_API_BASE_URL) moves auth AND every same-origin business surface
 * together. Defaults to same-origin '/api' (the combined Cloud Run topology).
 *
 *   VITE_AUTH_API_BASE_URL="/api/auth"                  → "/api"
 *   VITE_AUTH_API_BASE_URL="https://x.example.com/api/auth" → "https://x.example.com/api"
 *   (unset)                                             → "/api"
 */
export function apiRoot(): string {
  const authBase = (import.meta.env.VITE_AUTH_API_BASE_URL as string | undefined)?.replace(/\/$/, '');
  if (!authBase) return '/api';
  return authBase.replace(/\/auth$/, '');
}

/**
 * Authorization header for the current, non-expired session. Empty object when
 * unauthenticated (or on any read error) so the server's own local/demo/e2e
 * fallbacks are unaffected and the request simply arrives anonymous. The server
 * boundary is always the security authority — this only forwards a real token.
 */
export function bearerAuthHeader(): Record<string, string> {
  try {
    const envelope = loadSession();
    if (!envelope || isSessionExpired(envelope)) return {};
    return { Authorization: `Bearer ${envelope.accessToken}` };
  } catch {
    return {};
  }
}
