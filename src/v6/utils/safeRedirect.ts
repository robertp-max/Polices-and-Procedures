/* Safe post-login redirect resolution.
   ----------------------------------------------------------------------------
   When an unauthenticated user is bounced to /login, the intended destination
   may be carried as ?returnTo=<path> (or the legacy ?from=). After a successful
   login we return the user there — but ONLY if it is a safe, internal,
   same-origin path. Everything else falls back to Brad (the authenticated
   default landing page). This prevents open-redirect / login-loop bugs. */

export const BRAD_DEFAULT_ROUTE = '/compliance';

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

/** Canonical Governing Body group ids (portal-scoped). */
export const GOVERNANCE_GROUP_IDS: readonly string[] = [
  'grp-leadership-governing-body',
  'grp-governance-board-chair',
  'grp-governance-board-secretary',
  'grp-governance-committee-member',
  'grp-governance-legal-counsel',
  'grp-governance-cfo',
  'grp-governance-risk-manager',
  'grp-governance-privacy-security-officer',
];

/** Minimal server-authoritative access shape needed to resolve the landing page. */
export interface PostLoginUserAccess {
  permissions?: string[];
  groupIds?: string[];
}

/**
 * Governance-only = the user can enter the portal (`governance.portal.access`) AND belongs
 * only to Governing Body groups — i.e. no other primary application workspace grant. A
 * technical Super Admin (who also holds an admin group) is therefore NOT governance-only.
 * Definition is by server-authoritative group membership, never a display role or localStorage.
 */
export function isGovernanceOnly(userAccess: PostLoginUserAccess | null | undefined): boolean {
  const permissions = userAccess?.permissions ?? [];
  const groupIds = userAccess?.groupIds ?? [];
  if (!permissions.includes('governance.portal.access')) return false;
  if (groupIds.length === 0) return false;
  const govSet = new Set(GOVERNANCE_GROUP_IDS);
  // Governance-only when every group the user holds is a governance group.
  return groupIds.every((g) => govSet.has(g));
}

/**
 * Resolve the post-login landing destination. Precedence (per spec §7):
 *   1. a valid, safe, internal `returnTo` (deep link the user asked for);
 *   2. Governance-only users → `/governance`;
 *   3. the normal application default (`/compliance`).
 * Unsafe/external/unauthorized returnTo values are ignored (fall through to 2/3).
 */
export function resolvePostLoginDestination(
  userAccess: PostLoginUserAccess | null | undefined,
  requestedReturnTo: string | null | undefined,
): string {
  const explicit = safeReturnTo(requestedReturnTo, '');
  if (explicit) return explicit;
  if (isGovernanceOnly(userAccess)) return '/governance';
  return BRAD_DEFAULT_ROUTE;
}
