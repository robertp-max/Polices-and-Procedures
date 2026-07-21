/**
 * E2E TEST-ONLY authentication harness (COG — local Playwright QA).
 *
 * Purpose: let the local Playwright suite reach protected LEARNER routes without
 * a live Cognito pool, by recognizing two synthetic bearer tokens. This is a
 * SEPARATE, STRICTER path than the localhost demo-admin fallback in
 * apiAuthBoundary — it never touches production Cognito verification and is
 * production-inert by construction.
 *
 * Activation requires EVERY condition (fail-closed on any doubt):
 *   1. explicit opt-in: process.env.E2E_TEST_AUTH === "true" (exact string)
 *   2. NODE_ENV is exactly "test" or "development" (production/staging/unset → deny)
 *   3. the request is proven-local: loopback canonical host AND loopback peer
 *   4. the request host is NOT a known deployed host (*.run.app, *.cloudfront.net,
 *      careindeed.com/*) — belt-and-suspenders even if a peer check were fooled
 *
 * It issues exactly two deterministic synthetic learners:
 *   - ACTIVE   (token "e2e-active-learner")   — a standard learner (grp-user),
 *     reaches protected learner routes, DENIED on admin-role routes.
 *   - SUSPENDED (token "e2e-suspended-learner") — /me denies it (mirrors the
 *     fail-closed suspended-registration rejection), so the SPA stays logged out.
 *
 * NO real credential, token, or PHI is involved. Emails use the reserved
 * `.test` TLD. This module must never be reachable in production.
 */
import type { Actor } from '../identity/session.js';

export const E2E_ACTIVE_TOKEN = 'e2e-active-learner';
export const E2E_SUSPENDED_TOKEN = 'e2e-suspended-learner';

/** Minimal shape of the `/api/auth/me` user object the SPA consumes. */
export interface E2eMeUser {
  id: string;
  authSubject: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  provider: string;
}

export const ACTIVE_USER: E2eMeUser = {
  id: 'e2e-active-learner',
  authSubject: 'e2e-active-learner-sub',
  email: 'e2e.active.learner@example.test',
  name: 'Evelyn Active (E2E)',
  firstName: 'Evelyn',
  lastName: 'Active',
  role: 'RN',
  emailVerified: true,
  provider: 'e2e-test',
};

export const SUSPENDED_USER: E2eMeUser = {
  id: 'e2e-suspended-learner',
  authSubject: 'e2e-suspended-learner-sub',
  email: 'e2e.suspended.learner@example.test',
  name: 'Sam Suspended (E2E)',
  firstName: 'Sam',
  lastName: 'Suspended',
  role: 'RN',
  emailVerified: true,
  provider: 'e2e-test',
};

/** Deterministic non-admin learner actor for the protected-route boundary. */
const ACTIVE_ACTOR: Actor = {
  type: 'user',
  user_id: 'e2e-active-learner',
  display_name: 'Evelyn Active (E2E)',
  email: 'e2e.active.learner@example.test',
  roles: ['grp-user'],
  attributes: { branches: ['e2e-branch'], service_lines: ['RN'], access_classes: [] },
  mfa_enrolled: false,
  identity_assurance: 1,
};

/* ─── request-locality (self-contained; mirrors apiAuthBoundary) ───────────── */

function hostPart(value: string | undefined): string {
  const raw = String(value ?? '').split(',')[0].trim().toLowerCase();
  const bracket = raw.match(/^\[([^\]]+)\]/);
  if (bracket) return bracket[1];
  if ((raw.match(/:/g) ?? []).length > 1) return raw;
  return raw.split(':')[0];
}
function isLoopbackHostname(value: string | undefined): boolean {
  const h = hostPart(value);
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}
function isLoopbackAddress(value: string | undefined): boolean {
  const a = String(value ?? '').trim().toLowerCase();
  return a === '127.0.0.1' || a === '::1' || a.startsWith('::ffff:127.');
}
/** Hosts that are unmistakably deployed — never eligible, defense in depth. */
function isKnownDeployedHost(value: string | undefined): boolean {
  const h = hostPart(value);
  return /\.run\.app$/.test(h) || /\.cloudfront\.net$/.test(h) || h === 'careindeed.com' || h.endsWith('.careindeed.com');
}

/** Minimal request view so this is unit-testable without Express. */
export interface E2eRequestView {
  hostname?: string;
  hostHeader?: string;
  remoteAddress?: string;
}

/**
 * True ONLY when the strict test-auth gate is satisfied. Fail-closed on error.
 */
export function isE2eTestAuthAllowed(req: E2eRequestView, env: NodeJS.ProcessEnv = process.env): boolean {
  try {
    if (env.E2E_TEST_AUTH !== 'true') return false;
    if (env.NODE_ENV !== 'test' && env.NODE_ENV !== 'development') return false;
    const canonicalHost = req.hostname || hostPart(req.hostHeader);
    if (isKnownDeployedHost(canonicalHost) || isKnownDeployedHost(req.hostHeader)) return false;
    return isLoopbackHostname(canonicalHost) && isLoopbackAddress(req.remoteAddress);
  } catch {
    return false;
  }
}

export type E2eMeResolution =
  | { status: 'active'; user: E2eMeUser }
  | { status: 'suspended' }
  | { status: 'none' };

/** Resolve a synthetic `/me` outcome for a bearer token (gate checked by caller). */
export function resolveE2eMeUser(token: string): E2eMeResolution {
  if (token === E2E_ACTIVE_TOKEN) return { status: 'active', user: ACTIVE_USER };
  if (token === E2E_SUSPENDED_TOKEN) return { status: 'suspended' };
  return { status: 'none' };
}

/** Boundary actor for a synthetic token: active learner only; suspended/other → null. */
export function e2eActorForToken(token: string | undefined | null): Actor | null {
  return token === E2E_ACTIVE_TOKEN ? ACTIVE_ACTOR : null;
}
