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
  it('derives identity from the verified actor and never defaults a privileged tier', () => {
    const s = signerFromVerifiedActor(actor());
    expect(s.user_id).toBe('usr-1');
    expect(s.email).toBe('nurse@careindeed.com');
    expect(s.role).toBe('grp-rn');
    expect(s.tier).toBe(1);              // least-privilege, NOT the old default of 4
    expect(s.authorityDomains).toEqual(['operations']);
  });
  it('reports MFA truthfully (only when the provider enrolled it)', () => {
    expect(signerFromVerifiedActor(actor({ mfa_enrolled: false })).mfaVerified).toBe(false);
    expect(signerFromVerifiedActor(actor({ mfa_enrolled: true })).mfaVerified).toBe(true);
  });
  it('falls back name → email → user_id and role → unknown', () => {
    const s = signerFromVerifiedActor(actor({ display_name: undefined, roles: [] }));
    expect(s.name).toBe('nurse@careindeed.com');
    expect(s.role).toBe('unknown');
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
