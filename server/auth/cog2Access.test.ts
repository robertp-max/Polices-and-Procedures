/**
 * COG-2 — server-authoritative user access. Deterministic unit coverage of the
 * verify → resolve → enforce seams and the admin access operations. No live
 * Cognito/DynamoDB: the authenticity step and registry are injected mocks.
 */
import { describe, expect, it } from 'vitest';
import { ApiError } from '../errors.js';
import {
  decodeJwtPayload, expectedIssuer, validateAccessTokenClaims,
} from './accessTokenClaims.js';
import {
  resolveServerActor, activeRoleGroupIds, actorHasAnyRole, assertActorRole,
} from './actorResolver.js';
import { resolveVerifiedActor, type RequireAuthDeps } from './requireCognitoAuth.js';
import {
  listAccessState, suspendUser, reactivateUser, assignRole, removeRole,
} from './userAccessAdmin.js';
import type { AppIdentityRegistry } from './appIdentityPersistence.js';
import type { Actor } from '../identity/session.js';
import type { DemoUser } from './types.js';

const REGION = 'us-west-1';
const POOL = 'us-west-1_XMOyEsbe6';
const CLIENT = 'test-client-id';
const ISSUER = expectedIssuer(REGION, POOL);
const NOW_S = 1_800_000_000;
const NOW_ISO = '2027-01-15T00:00:00.000Z';

/** Minimal base64url JWT with the given payload (signature not used). */
function makeToken(payload: Record<string, unknown>): string {
  const enc = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  return `${enc({ alg: 'RS256', typ: 'JWT' })}.${enc(payload)}.sig`;
}
function accessPayload(over: Record<string, unknown> = {}) {
  return { token_use: 'access', iss: ISSUER, client_id: CLIENT, exp: NOW_S + 3600, sub: 'sub-nurse', ...over };
}

function registry(): AppIdentityRegistry {
  return {
    users: [
      { id: 'usr-nurse', email: 'nurse@careindeed.com', name: 'Nora Nurse', status: 'active', authSubject: 'sub-nurse' },
      { id: 'usr-admin', email: 'admin@careindeed.com', name: 'Ada Admin', status: 'active', authSubject: 'sub-admin' },
      { id: 'usr-susp', email: 'susp@careindeed.com', name: 'Sam Suspended', status: 'suspended', authSubject: 'sub-susp' },
    ],
    assignments: [
      { id: 'a1', userId: 'usr-nurse', groupId: 'grp-rn', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
      { id: 'a2', userId: 'usr-admin', groupId: 'grp-super-admin', scope: { organizationId: 'o' }, effectiveFrom: '2020-01-01T00:00:00Z' },
    ],
  };
}

function depsFor(sub: string, email: string, reg = registry()): RequireAuthDeps {
  return {
    getCurrentUser: async (): Promise<DemoUser> => ({ id: sub, authSubject: sub, email, emailVerified: true, provider: 'cognito' }),
    loadRegistry: async () => reg,
    issuer: ISSUER,
    clientId: CLIENT,
    nowSeconds: () => NOW_S,
    nowIso: () => NOW_ISO,
  };
}
const bearer = (t: string) => `Bearer ${t}`;
const adminActor = (): Actor => resolveServerActor({ sub: 'sub-admin', email: 'admin@careindeed.com' }, registry(), NOW_ISO);
const nurseActor = (): Actor => resolveServerActor({ sub: 'sub-nurse', email: 'nurse@careindeed.com' }, registry(), NOW_ISO);

/* ─── token claim validation ─────────────────────────────────────────────── */
describe('access-token claim validation', () => {
  it('accepts a well-formed access token for the configured pool/client', () => {
    const claims = validateAccessTokenClaims(accessPayload(), { issuer: ISSUER, clientId: CLIENT }, NOW_S);
    expect(claims.sub).toBe('sub-nurse');
  });
  it('denies a wrong issuer', () => {
    expect(() => validateAccessTokenClaims(accessPayload({ iss: 'https://evil/pool' }), { issuer: ISSUER, clientId: CLIENT }, NOW_S)).toThrow(ApiError);
  });
  it('denies a wrong client id', () => {
    expect(() => validateAccessTokenClaims(accessPayload({ client_id: 'other' }), { issuer: ISSUER, clientId: CLIENT }, NOW_S)).toThrow(ApiError);
  });
  it('denies a non-access token type (e.g. id token)', () => {
    expect(() => validateAccessTokenClaims(accessPayload({ token_use: 'id' }), { issuer: ISSUER, clientId: CLIENT }, NOW_S)).toThrow(/token type/);
  });
  it('denies an expired token', () => {
    expect(() => validateAccessTokenClaims(accessPayload({ exp: NOW_S - 1 }), { issuer: ISSUER, clientId: CLIENT }, NOW_S)).toThrow(/expired/);
  });
  it('denies a malformed token', () => {
    expect(() => decodeJwtPayload('not-a-jwt')).toThrow(ApiError);
    expect(() => decodeJwtPayload('')).toThrow(ApiError);
  });
});

/* ─── actor resolution ───────────────────────────────────────────────────── */
describe('resolveServerActor', () => {
  it('resolves a verified sub to the canonical user with server roles', () => {
    const actor = resolveServerActor({ sub: 'sub-nurse', email: 'nurse@careindeed.com' }, registry(), NOW_ISO);
    expect(actor.user_id).toBe('usr-nurse');
    expect(actor.roles).toEqual(['grp-rn']);
  });
  it('denies an unknown Cognito sub (no bound canonical user)', () => {
    expect(() => resolveServerActor({ sub: 'sub-ghost', email: 'ghost@nowhere.com' }, registry(), NOW_ISO)).toThrow(/No canonical user/);
  });
  it('denies a suspended user even with a valid identity', () => {
    expect(() => resolveServerActor({ sub: 'sub-susp', email: 'susp@careindeed.com' }, registry(), NOW_ISO)).toThrow(/suspended/);
  });
  it('does not derive roles/mfa from anything but the registry', () => {
    const actor = resolveServerActor({ sub: 'sub-admin', email: 'admin@careindeed.com' }, registry(), NOW_ISO);
    expect(actor.mfa_enrolled).toBe(false);
    expect(actor.identity_assurance).toBe(1);
    expect(actor.roles).toEqual(['grp-super-admin']);
  });
});

/* ─── end-to-end PEP (mocked authenticity + registry) ────────────────────── */
describe('resolveVerifiedActor (PEP)', () => {
  it('allows a valid active user with a valid bearer token', async () => {
    const actor = await resolveVerifiedActor(bearer(makeToken(accessPayload())), depsFor('sub-nurse', 'nurse@careindeed.com'));
    expect(actor.user_id).toBe('usr-nurse');
  });
  it('denies a missing bearer token', async () => {
    await expect(resolveVerifiedActor(undefined, depsFor('sub-nurse', 'nurse@careindeed.com'))).rejects.toMatchObject({ status: 401 });
  });
  it('denies a wrong-issuer token before any network call', async () => {
    await expect(resolveVerifiedActor(bearer(makeToken(accessPayload({ iss: 'https://evil/x' }))), depsFor('sub-nurse', 'nurse@careindeed.com'))).rejects.toMatchObject({ status: 401 });
  });
  it('denies when authenticity check (getCurrentUser) rejects the token', async () => {
    const deps = depsFor('sub-nurse', 'nurse@careindeed.com');
    deps.getCurrentUser = async () => { throw new ApiError('auth_error', 'Cognito rejected token.', 401); };
    await expect(resolveVerifiedActor(bearer(makeToken(accessPayload())), deps)).rejects.toMatchObject({ status: 401 });
  });
  it('denies a suspended user even with a valid, authentic token', async () => {
    await expect(resolveVerifiedActor(bearer(makeToken(accessPayload({ sub: 'sub-susp' }))), depsFor('sub-susp', 'susp@careindeed.com'))).rejects.toMatchObject({ status: 403 });
  });
  it('ignores forged x-user-* intent — identity comes only from the verified token', async () => {
    // The PEP never reads headers other than Authorization; a forged id/roles
    // header is structurally impossible to pass in (only the token is used).
    const actor = await resolveVerifiedActor(bearer(makeToken(accessPayload())), depsFor('sub-nurse', 'nurse@careindeed.com'));
    expect(actor.roles).toEqual(['grp-rn']); // registry-derived, not header-derived
    expect(actor.user_id).toBe('usr-nurse'); // not any forged x-user-id
  });
});

/* ─── role enforcement ───────────────────────────────────────────────────── */
describe('role enforcement', () => {
  it('permits an admin and denies a standard user for admin roles', () => {
    expect(actorHasAnyRole(adminActor(), ['grp-super-admin'])).toBe(true);
    expect(() => assertActorRole(nurseActor(), ['grp-super-admin', 'grp-user-access-admin'])).toThrow(/permission/);
    expect(() => assertActorRole(adminActor(), ['grp-super-admin'])).not.toThrow();
  });
});

/* ─── admin access operations ────────────────────────────────────────────── */
describe('user-access admin operations', () => {
  it('lists access state with privileged flags', () => {
    const rows = listAccessState(registry(), NOW_ISO);
    expect(rows.find((r) => r.userId === 'usr-admin')?.privileged).toBe(true);
    expect(rows.find((r) => r.userId === 'usr-nurse')?.privileged).toBe(false);
  });

  it('suspends and reactivates a user', () => {
    const s = suspendUser(registry(), adminActor(), 'usr-nurse', NOW_ISO);
    expect(s.registry.users.find((u) => u.id === 'usr-nurse')?.status).toBe('suspended');
    const r = reactivateUser(s.registry, adminActor(), 'usr-nurse');
    expect(r.registry.users.find((u) => u.id === 'usr-nurse')?.status).toBe('active');
  });

  it('blocks self-suspension and suspending the last super-admin', () => {
    expect(() => suspendUser(registry(), adminActor(), 'usr-admin', NOW_ISO)).toThrow(/your own account/);
    // Give a second user super-admin, then removing the sole one is still blocked when only one active.
    expect(() => suspendUser(registry(), { ...adminActor(), user_id: 'usr-other' } as Actor, 'usr-admin', NOW_ISO)).toThrow(/last active super-admin/);
  });

  it('denies self-escalation: an actor cannot grant themselves a privileged role', () => {
    const reg = registry();
    // Even a super-admin cannot self-grant a privileged role.
    expect(() => assignRole(reg, adminActor(), 'usr-admin', 'grp-user-access-admin', NOW_ISO)).toThrow(/yourself a privileged role/);
  });

  it('denies a non-super-admin granting a privileged role to another user', () => {
    // uaAdmin (user-access-admin, not super-admin) grants to a DIFFERENT user,
    // so the super-admin requirement — not the self-grant guard — is exercised.
    const uaAdmin: Actor = { ...nurseActor(), roles: ['grp-user-access-admin'] };
    expect(() => assignRole(registry(), uaAdmin, 'usr-susp', 'grp-admin', NOW_ISO)).toThrow(/super-admin/);
  });

  it('allows a super-admin to assign a non-privileged role and a privileged role to another user', () => {
    const nonPriv = assignRole(registry(), adminActor(), 'usr-nurse', 'grp-lvn', NOW_ISO);
    expect(nonPriv.after.roles).toContain('grp-lvn');
    const priv = assignRole(registry(), adminActor(), 'usr-nurse', 'grp-user-access-admin', NOW_ISO);
    expect(priv.after.roles).toContain('grp-user-access-admin');
  });

  it('role removal is effective immediately for the next resolution', () => {
    const reg = registry();
    const withRole = assignRole(reg, adminActor(), 'usr-nurse', 'grp-user-access-admin', NOW_ISO).registry;
    expect(activeRoleGroupIds(withRole, 'usr-nurse', NOW_ISO)).toContain('grp-user-access-admin');
    const removed = removeRole(withRole, adminActor(), 'usr-nurse', 'grp-user-access-admin', NOW_ISO).registry;
    // Next-request resolution sees the role gone.
    const nextActor = resolveServerActor({ sub: 'sub-nurse', email: 'nurse@careindeed.com' }, removed, '2027-02-01T00:00:00.000Z');
    expect(nextActor.roles).not.toContain('grp-user-access-admin');
  });

  it('blocks removing the last active super-admin role', () => {
    expect(() => removeRole(registry(), adminActor(), 'usr-admin', 'grp-super-admin', NOW_ISO)).toThrow(/last active super-admin/);
  });
});
