/**
 * Security containment (ADR-0002 Phase 1) — verified signer identity.
 *
 * Proves: identity comes only from the verified actor; signer tier is never
 * defaulted to a privileged value; MFA is truthful; the demo-runtime gate is
 * fail-closed (production never demo); and an empty required-signer set is
 * refused.
 */
import { describe, expect, it, afterEach } from 'vitest';
import {
  isDemoIdentityRuntime,
  verifiedActor,
  signerFromVerifiedActor,
  requiredSignersMissing,
  authenticationModeForActor,
  requestIsLocalDemo,
} from './verifiedSignerIdentity.js';
import type { Actor } from '../identity/session.js';

const actor = (over: Partial<Actor> = {}): Actor => ({
  type: 'user',
  user_id: 'usr-1',
  display_name: 'Nora Nurse',
  email: 'nurse@careindeed.com',
  roles: ['grp-rn'],
  mfa_enrolled: false,
  identity_assurance: 1,
  ...over,
} as Actor);

const ENV = { ...process.env };
afterEach(() => { process.env = { ...ENV }; });

describe('isDemoIdentityRuntime', () => {
  it('true only with the exact opt-in flag AND non-production NODE_ENV', () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true'; process.env.NODE_ENV = 'development';
    expect(isDemoIdentityRuntime()).toBe(true);
  });
  it('false in production even with the flag set', () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true'; process.env.NODE_ENV = 'production';
    expect(isDemoIdentityRuntime()).toBe(false);
  });
  it('false without the flag', () => {
    delete process.env.ENABLE_LOCAL_DEMO_AUTH; process.env.NODE_ENV = 'development';
    expect(isDemoIdentityRuntime()).toBe(false);
  });
  it('false for a malformed flag value', () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'TRUE'; process.env.NODE_ENV = 'development';
    expect(isDemoIdentityRuntime()).toBe(false);
  });
});

describe('verifiedActor', () => {
  it('returns the actor when a verified user_id is present', () => {
    const a = actor();
    expect(verifiedActor({ actor: a })).toBe(a);
  });
  it('returns null for an anonymous actor (no user_id)', () => {
    expect(verifiedActor({ actor: actor({ user_id: undefined }) })).toBeNull();
  });
  it('returns null when no actor is attached', () => {
    expect(verifiedActor({})).toBeNull();
  });
});

describe('signerFromVerifiedActor', () => {
  it('derives identity only; never a privileged tier and never an invented authority', () => {
    const s = signerFromVerifiedActor(actor({ roles: ['grp-admin', 'grp-super-admin'] }));
    expect(s.user_id).toBe('usr-1');
    expect(s.email).toBe('nurse@careindeed.com');
    // A security group is NOT a signature capacity; no capacity/domain is implied.
    expect(s.role).toBe('unknown');
    expect(s.authorityDomains).toEqual([]);
    expect(s.tier).toBe(1);              // least-privilege, NOT the old default of 4
  });
  it('never treats MFA enrollment as current-session MFA verification', () => {
    // Enrollment is not proof the current session completed step-up.
    expect(signerFromVerifiedActor(actor({ mfa_enrolled: true })).mfaVerified).toBe(false);
    expect(signerFromVerifiedActor(actor({ mfa_enrolled: false })).mfaVerified).toBe(false);
  });
  it('falls back name → email → user_id', () => {
    const s = signerFromVerifiedActor(actor({ display_name: undefined }));
    expect(s.name).toBe('nurse@careindeed.com');
  });
});

describe('authenticationModeForActor', () => {
  it('maps a verified user actor to cognito', () => {
    expect(authenticationModeForActor(actor({ type: 'user' }))).toBe('cognito');
  });
  it('maps a verified service actor to service', () => {
    expect(authenticationModeForActor(actor({ type: 'service' } as Partial<Actor>))).toBe('service');
  });
});

describe('requestIsLocalDemo (request-scoped, not env)', () => {
  it('true only when the boundary marked the request local_demo', () => {
    expect(requestIsLocalDemo({ authenticationContext: { mode: 'local_demo' } })).toBe(true);
  });
  it('false for cognito / service / missing context', () => {
    expect(requestIsLocalDemo({ authenticationContext: { mode: 'cognito' } })).toBe(false);
    expect(requestIsLocalDemo({ authenticationContext: { mode: 'service' } })).toBe(false);
    expect(requestIsLocalDemo({})).toBe(false);
  });
  it('is not influenced by environment variables', () => {
    process.env.ENABLE_LOCAL_DEMO_AUTH = 'true'; process.env.NODE_ENV = 'development';
    expect(requestIsLocalDemo({})).toBe(false); // no boundary context → never demo
  });
});

describe('requiredSignersMissing (fail-closed)', () => {
  it('true for zero / negative / non-finite', () => {
    expect(requiredSignersMissing(0)).toBe(true);
    expect(requiredSignersMissing(-1)).toBe(true);
    expect(requiredSignersMissing(Number.NaN)).toBe(true);
  });
  it('false when at least one required signer is defined', () => {
    expect(requiredSignersMissing(1)).toBe(false);
    expect(requiredSignersMissing(3)).toBe(false);
  });
});
