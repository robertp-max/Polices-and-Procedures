/* Safe post-login redirect resolution.
   ----------------------------------------------------------------------------
   When an unauthenticated user is bounced to /login, the intended destination
   may be carried as ?returnTo=<path> (or the legacy ?from=). After a successful
   login we return the user there — but ONLY if it is a safe, internal,
   same-origin path. Everything else falls back to Brad (the authenticated
   default landing page). This prevents open-redirect / login-loop bugs. */

export const BRAD_DEFAULT_ROUTE = '/iadministrator';

/**
 * Validate a candidate redirect target. Returns the candidate if it is a safe
 * internal path, otherwise the fallback. Safe means: an absolute internal path
 * ("/something"), not protocol-relative ("//evil"), not an absolute URL
 * ("http://"), not back to the login screen, and free of control characters or
 * backslashes that browsers may normalize into a host.
 */
export function safeReturnTo(raw: string | null | undefined, fallback: string = BRAD_DEFAULT_ROUTE): string {
  if (!raw) return fallback;
  const candidate = raw.trim();
  if (candidate === '') return fallback;

  // Must be an absolute internal path.
  if (!candidate.startsWith('/')) return fallback;
  // Reject protocol-relative ("//host") and backslash tricks ("/\host").
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return fallback;

  // Reject control characters (0x00–0x1F, 0x7F) and backslashes, which browsers
  // can normalize into a host/scheme — checked by char code to stay lint-clean.
  for (let i = 0; i < candidate.length; i += 1) {
    const code = candidate.charCodeAt(i);
    if (code < 0x20 || code === 0x7f || code === 0x5c) return fallback;
  }

  // Don't loop back to the auth screens.
  const pathOnly = candidate.split(/[?#]/)[0];
  if (pathOnly === '/login' || pathOnly.startsWith('/login/')) return fallback;

  return candidate;
}
