/**
 * COG-2 hotfix — unified user-status authority.
 *
 * Covers the authoritative rule end to end:
 *   - status deny FIRST: a suspended/disabled canonical record is ALWAYS denied,
 *     even for an approved administrator email (suspension is never overridden);
 *   - approved-admin-email path authorizes when canonical is missing/pending/
 *     active (this is the regression: pending canonical no longer 403s);
 *   - canonical admin-group path requires an ACTIVE canonical record;
 *   - the audit-facing source is reported correctly.
 *
 * Both the pure evaluator and the full middleware-path resolver are exercised,
 * so an isolated-predicate pass can't hide a gate that rejects before it.
 */
import { describe, expect, it } from 'vitest';
import { ApiError } from '../errors.js';
import { evaluateUserStatusAuthority } from './userStatusAuthorityCore.js';
import { resolveUserStatusAuthority } from './userStatusAuthority.js';
import { expectedIssuer } from './accessTokenClaims.js';
import type { RequireAuthDeps } from './requireCognitoAuth.js';
import type { AppIdentityRegistry } from './appIdentityPersistence.js';
import type { DemoUser } from './types.js';

const REGION = 'us-west-1';
const POOL = 'us-west-1_XMOyEsbe6';
const CLIENT = 'test-client-id';
const ISSUER = expectedIssuer(REGION, POOL);
const NOW_S = 1_800_000_000;
const NOW_ISO = '2027-01-15T00:00:00.000Z';
const APPROVED = 'boss@careindeed.com';

const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
const makeToken = (payload: Record<string, unknown>) =>
  `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc({ token_use: 'access', iss: ISSUER, client_id: CLIENT, exp: NOW_S + 3600, ...payload })}.sig`;
const bearer = (t: string) => `Bearer ${t}`;

/* ─── pure evaluator: the full operator matrix ───────────────────────────── */
describe('evaluateUserStatusAuthority (pure rule)', () => {
  const base = { verifiedEmail: 'x@careindeed.com', isApprovedAdminEmail: false, canonicalUser: null, canonicalRoles: [] as string[] };

  it('approved email + missing canonical → allowed (approved_admin_email)', () => {
    const r = evaluateUserStatusAuthority({ ...base, verifiedEmail: APPROVED, isApprovedAdminEmail: true });
    expect(r.allowed).toBe(true);
    expect(r.source).toBe('approved_admin_email');
    expect(r.canonicalStatus).toBe('missing');
  });

  it('approved email + pending canonical → allowed (the regression)', () => {
    const r = evaluateUserStatusAuthority({
      ...base, verifiedEmail: APPROVED, isApprovedAdminEmail: true,
      canonicalUser: { id: 'u1', email: APPROVED, status: 'pending' },
    });
    expect(r.allowed).toBe(true);
    expect(r.source).toBe('approved_admin_email');
    expect(r.actorUserId).toBe('u1');
  });

  it('approved email + active canonical → allowed', () => {
    const r = evaluateUserStatusAuthority({
      ...base, verifiedEmail: APPROVED, isApprovedAdminEmail: true,
      canonicalUser: { id: 'u1', email: APPROVED, status: 'active' },
    });
    expect(r.allowed).toBe(true);
  });

  it('approved email + SUSPENDED canonical → DENIED (suspension wins)', () => {
    const r = evaluateUserStatusAuthority({
      ...base, verifiedEmail: APPROVED, isApprovedAdminEmail: true,
      canonicalUser: { id: 'u1', email: APPROVED, status: 'suspended' },
    });
    expect(r.allowed).toBe(false);
    expect(r.canonicalStatus).toBe('suspended');
  });

  it('approved email + DISABLED canonical → DENIED', () => {
    const r = evaluateUserStatusAuthority({
      ...base, verifiedEmail: APPROVED, isApprovedAdminEmail: true,
      canonicalUser: { id: 'u1', email: APPROVED, status: 'disabled' },
    });
    expect(r.allowed).toBe(false);
  });

  it('canonical admin-group + active → allowed (canonical_admin_group)', () => {
    const r = evaluateUserStatusAuthority({
      ...base, canonicalUser: { id: 'g1', email: 'grp@careindeed.com', status: 'active' },
      canonicalRoles: ['grp-user-access-admin'],
    });
    expect(r.allowed).toBe(true);
    expect(r.source).toBe('canonical_admin_group');
  });

  it('canonical admin-group + suspended → denied', () => {
    const r = evaluateUserStatusAuthority({
      ...base, canonicalUser: { id: 'g1', email: 'grp@careindeed.com', status: 'suspended' },
      canonicalRoles: ['grp-user-access-admin'],
    });
    expect(r.allowed).toBe(false);
  });

  it('admin group but only PENDING canonical → denied (group path needs active)', () => {
    const r = evaluateUserStatusAuthority({
      ...base, canonicalUser: { id: 'g1', email: 'grp@careindeed.com', status: 'pending' },
      canonicalRoles: ['grp-user-access-admin'],
    });
    expect(r.allowed).toBe(false);
  });

  it('ordinary active user → denied', () => {
    const r = evaluateUserStatusAuthority({
      ...base, canonicalUser: { id: 'n1', email: 'nurse@careindeed.com', status: 'active' },
      canonicalRoles: ['grp-rn'],
    });
    expect(r.allowed).toBe(false);
  });
});

/* ─── full middleware-path resolver (verify → registry → evaluate) ───────── */
function registry(overrides: Partial<AppIdentityRegistry> = {}): AppIdentityRegistry {
  return {
    users: [
      // Approved-admin email whose canonical record is PENDING (the live bug).
      { id: 'usr-boss', email: APPROVED, name: 'Belinda Boss', status: 'pending', authSubject: 'sub-boss' },
      // Canonical admin group, active.
      { id: 'usr-grp', email: 'grp@careindeed.com', name: 'Gene Grp', status: 'active', authSubject: 'sub-grp' },
      // Approved-admin email that has been SUSPENDED in canonical registry.
      { id: 'usr-sboss', email: 'sboss@careindeed.com', name: 'Sam Boss', status: 'suspended', authSubject: 'sub-sboss' },
      { id: 'usr-nurse', email: 'nurse@careindeed.com', name: 'Nora', status: 'active', authSubject: 'sub-nurse' },
    ],
    assignments: [
      { id: 'a1', userId: 'usr-grp', groupId: 'grp-user-access-admin', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
      { id: 'a2', userId: 'usr-nurse', groupId: 'grp-rn', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
    ],
    ...overrides,
  };
}

function depsFor(sub: string, email: string, reg = registry()): RequireAuthDeps {
  return {
    getCurrentUser: async (): Promise<DemoUser> => ({ id: sub, authSubject: sub, email, emailVerified: true, provider: 'cognito' }),
    loadRegistry: async () => reg,
    issuer: ISSUER, clientId: CLIENT, nowSeconds: () => NOW_S, nowIso: () => NOW_ISO,
  };
}

// Approved allowlist for the resolver: boss@ and sboss@ are approved emails.
const isApprovedMulti = (e?: string | null) => ['boss@careindeed.com', 'sboss@careindeed.com'].includes((e ?? '').toLowerCase());

describe('resolveUserStatusAuthority (full path)', () => {
  it('authorizes an approved-admin email whose canonical record is PENDING', async () => {
    const { actor, result } = await resolveUserStatusAuthority(bearer(makeToken({ sub: 'sub-boss' })), depsFor('sub-boss', APPROVED), isApprovedMulti);
    expect(result.allowed).toBe(true);
    expect(result.source).toBe('approved_admin_email');
    expect(actor.user_id).toBe('usr-boss');
    expect(actor.email).toBe(APPROVED);
  });

  it('authorizes an active canonical admin-group actor', async () => {
    const { result } = await resolveUserStatusAuthority(bearer(makeToken({ sub: 'sub-grp' })), depsFor('sub-grp', 'grp@careindeed.com'), isApprovedMulti);
    expect(result.source).toBe('canonical_admin_group');
  });

  it('DENIES an approved-admin email whose canonical record is SUSPENDED (403)', async () => {
    await expect(
      resolveUserStatusAuthority(bearer(makeToken({ sub: 'sub-sboss' })), depsFor('sub-sboss', 'sboss@careindeed.com'), isApprovedMulti),
    ).rejects.toMatchObject({ status: 403 });
  });

  it('denies an ordinary active user (403)', async () => {
    await expect(
      resolveUserStatusAuthority(bearer(makeToken({ sub: 'sub-nurse' })), depsFor('sub-nurse', 'nurse@careindeed.com'), isApprovedMulti),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it('denies a missing bearer token (401) before any authority check', async () => {
    await expect(
      resolveUserStatusAuthority(undefined, depsFor('sub-boss', APPROVED), isApprovedMulti),
    ).rejects.toMatchObject({ status: 401 });
  });

  it('identity comes only from the verified token — never a forged actor', async () => {
    // The resolver reads the sub/email from the validated token via getCurrentUser;
    // there is no channel to inject a body/header actor.
    const { actor } = await resolveUserStatusAuthority(bearer(makeToken({ sub: 'sub-grp' })), depsFor('sub-grp', 'grp@careindeed.com'), isApprovedMulti);
    expect(actor.user_id).toBe('usr-grp');
  });
});
