/**
 * Shared SERVER TEST auth harness (test-only; never imported by production).
 *
 * Packet route tests run behind the SAME production authentication boundary
 * (`requireApiAuth`) as the live server. Instead of forging identity headers
 * (which COG-2 correctly ignores), a test mounts this harness and sends a real
 * Bearer token; the boundary validates the token's claims and resolves a
 * verified actor through INJECTED verification dependencies — the exact
 * production contract, minus the live Cognito/registry network calls.
 *
 * This file adds NO bypass to production code: production `requireApiAuth`
 * still runs, token claims are still validated, and denials (missing / invalid
 * / expired / wrong-issuer / suspended / insufficient-role) still occur. Only
 * the two impure dependencies (Cognito GetUser, registry load) are swapped for
 * deterministic in-memory equivalents.
 */
import type { Express } from 'express';
import { requireApiAuth } from './apiAuthBoundary.js';
import { expectedIssuer } from './accessTokenClaims.js';
import type { RequireAuthDeps } from './requireCognitoAuth.js';
import type { AppIdentityRegistry } from './appIdentityPersistence.js';
import type { DemoUser } from './types.js';

export const TEST_REGION = 'us-west-1';
export const TEST_POOL_ID = 'us-west-1_TESTPOOL';
export const TEST_CLIENT_ID = 'test-client-id';
export const TEST_ISSUER = expectedIssuer(TEST_REGION, TEST_POOL_ID);
/** Fixed clock: well inside the default token lifetime below. */
const TEST_NOW_SECONDS = 1_800_000_000;
const TEST_NOW_ISO = '2027-01-15T00:00:00.000Z';

interface TestUserProfile {
  sub: string;
  email: string;
  name: string;
  status: 'active' | 'suspended' | 'pending';
  roles: string[];
}

/**
 * Canonical test users. `sub` selects the profile via the bearer token; the
 * injected registry resolves status + roles from here — exactly as production
 * resolves from the AppIdentityRegistry.
 */
export const TEST_USERS: Record<string, TestUserProfile> = {
  authorized: {
    sub: 'sub-packet-authorized',
    email: 'packet-authorized@careindeed.com',
    name: 'Packet Authorized',
    status: 'active',
    // compliance_officer + qapi_chair satisfy packet + trigger authority.
    roles: ['compliance_officer', 'qapi_chair'],
  },
  viewer: {
    sub: 'sub-packet-viewer',
    email: 'packet-viewer@careindeed.com',
    name: 'Packet Viewer',
    status: 'active',
    roles: ['viewer'],
  },
  suspended: {
    sub: 'sub-packet-suspended',
    email: 'packet-suspended@careindeed.com',
    name: 'Packet Suspended',
    status: 'suspended',
    roles: ['compliance_officer'],
  },
};

function base64url(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

/** Build a signed-shape JWT (signature unused — authenticity is proven by the
 *  injected getCurrentUser, mirroring the Cognito GetUser step). */
export function makeTestToken(payload: Record<string, unknown>): string {
  return `${base64url({ alg: 'RS256', typ: 'JWT' })}.${base64url(payload)}.test-signature`;
}

function accessTokenClaims(sub: string, over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    token_use: 'access',
    iss: TEST_ISSUER,
    client_id: TEST_CLIENT_ID,
    exp: TEST_NOW_SECONDS + 3600,
    sub,
    ...over,
  };
}

/** Canonical CIHHC user id the boundary resolves for a named profile
 *  (mirrors the registry rule `usr-<sub>`). Use in audit-attribution asserts. */
export function canonicalUserId(profile: keyof typeof TEST_USERS = 'authorized'): string {
  return `usr-${TEST_USERS[profile].sub}`;
}
export const AUTHORIZED_USER_ID = canonicalUserId('authorized');

/** Bearer header value for a named test profile (default: authorized). */
export function bearerFor(profile: keyof typeof TEST_USERS = 'authorized'): string {
  return `Bearer ${makeTestToken(accessTokenClaims(TEST_USERS[profile].sub))}`;
}

/* ── Ready-made bearers for the standard positive/negative cases ─────────── */
export const AUTHORIZED_BEARER = bearerFor('authorized');
export const VIEWER_BEARER = bearerFor('viewer');
export const SUSPENDED_BEARER = bearerFor('suspended');
export const EXPIRED_BEARER = `Bearer ${makeTestToken(accessTokenClaims(TEST_USERS.authorized.sub, { exp: TEST_NOW_SECONDS - 60 }))}`;
export const WRONG_ISSUER_BEARER = `Bearer ${makeTestToken(accessTokenClaims(TEST_USERS.authorized.sub, { iss: 'https://cognito-idp.us-west-1.amazonaws.com/us-west-1_EVILPOOL' }))}`;
export const WRONG_CLIENT_BEARER = `Bearer ${makeTestToken(accessTokenClaims(TEST_USERS.authorized.sub, { client_id: 'some-other-client' }))}`;
export const ID_TOKEN_BEARER = `Bearer ${makeTestToken(accessTokenClaims(TEST_USERS.authorized.sub, { token_use: 'id' }))}`;
export const MALFORMED_BEARER = 'Bearer not-a-jwt';

function testRegistry(): AppIdentityRegistry {
  const users = Object.values(TEST_USERS).map((u) => ({
    id: `usr-${u.sub}`,
    email: u.email,
    name: u.name,
    status: u.status,
    authSubject: u.sub,
    provider: 'cognito' as const,
  }));
  const assignments = Object.values(TEST_USERS).flatMap((u) =>
    u.roles.map((groupId, i) => ({
      id: `asg-${u.sub}-${i}`,
      userId: `usr-${u.sub}`,
      groupId,
      scope: { organizationId: 'careindeed-test' },
      effectiveFrom: '2020-01-01T00:00:00.000Z',
    })),
  );
  return { users, assignments };
}

/** Look up a profile by the sub embedded in a verified token. */
function profileBySub(sub: string): TestUserProfile | undefined {
  return Object.values(TEST_USERS).find((u) => u.sub === sub);
}

/**
 * Complete (production-shaped) RequireAuthDeps with the two impure steps
 * swapped for deterministic equivalents. Because every field is provided,
 * `mergeAuthDeps` never touches the real Cognito service.
 */
export const testAuthDeps: RequireAuthDeps = {
  getCurrentUser: async (token: string): Promise<DemoUser> => {
    // Mirror Cognito GetUser: decode the (already claim-validated) token and
    // return the verified subject/email. An unknown sub still resolves to a
    // subject; registry resolution then denies it (unknown/ suspended).
    const payloadB64 = token.split('.')[1] ?? '';
    const claims = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as { sub?: string };
    const sub = claims.sub ?? '';
    const profile = profileBySub(sub);
    return {
      id: sub,
      authSubject: sub,
      email: profile?.email ?? 'unknown@careindeed.com',
      emailVerified: true,
      provider: 'cognito',
    };
  },
  loadRegistry: async () => testRegistry(),
  issuer: TEST_ISSUER,
  clientId: TEST_CLIENT_ID,
  nowSeconds: () => TEST_NOW_SECONDS,
  nowIso: () => TEST_NOW_ISO,
};

/**
 * Mount the production auth boundary with injected test verification.
 * Call AFTER identityMiddleware and BEFORE the packet routers, exactly as
 * production mounts `requireApiAuth()`.
 */
export function mountTestAuthBoundary(app: Express): void {
  app.use('/api', requireApiAuth({ deps: testAuthDeps }));
}

/** Standard JSON headers authenticated as the authorized packet actor. */
export function testAuthHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'content-type': 'application/json',
    authorization: AUTHORIZED_BEARER,
    ...extra,
  };
}
