/**
 * ADR-0002 Phase 5C — server-owned verified-signer resolution tests.
 * Default (no assignments) must stay least-privilege / fail-closed; authority
 * appears ONLY from explicit assignments via the provider.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { productionTierForRole } from '@/policy/ecign/signerAuthority';
import type { Actor } from '../../identity/session.ts';
import {
  resolveVerifiedSigner, resetSignatureAssignmentProvider, setSignatureAssignmentProvider,
} from './signerResolution.ts';
import type { SignatureAuthorityAssignment } from './signatureAuthority.ts';

const NOW = '2027-06-01T00:00:00.000Z';
const actor = { user_id: 'usr-1', display_name: 'Nurse Joy', email: 'joy@careindeed.com', type: 'user' } as unknown as Actor;

const assign = (over: Partial<SignatureAuthorityAssignment> = {}): SignatureAuthorityAssignment => ({
  assignmentId: 'sa-1', userId: 'usr-1', signatureRoleId: 'Director of Nursing',
  authorityBasis: 'job_appointment', scope: { organizationId: 'org-1' },
  effectiveFrom: '2027-01-01T00:00:00.000Z', grantedBy: 'admin-1', reason: 'appointment',
  status: 'active', version: 1, ...over,
});

afterEach(() => resetSignatureAssignmentProvider());

describe('resolveVerifiedSigner', () => {
  it('defaults to least-privilege when no assignment provider is set (fail-closed)', () => {
    const s = resolveVerifiedSigner(actor, NOW);
    expect(s).toMatchObject({ user_id: 'usr-1', role: 'unknown', tier: 1, authorityDomains: [], mfaVerified: false });
  });

  it('carries identity from the verified actor only', () => {
    const s = resolveVerifiedSigner(actor, NOW);
    expect(s.name).toBe('Nurse Joy');
    expect(s.email).toBe('joy@careindeed.com');
  });

  it('resolves real authority from an explicit active assignment', () => {
    setSignatureAssignmentProvider(() => [assign()]);
    const s = resolveVerifiedSigner(actor, NOW);
    expect(s.role).toBe('Director of Nursing');
    expect(s.tier).toBe(productionTierForRole('Director of Nursing'));
    expect(s.authorityDomains.length).toBeGreaterThan(0);
    expect(s.mfaVerified).toBe(false);
  });

  it('stays least-privilege when assignments are revoked/expired (fail-closed)', () => {
    setSignatureAssignmentProvider(() => [assign({ status: 'revoked' }), assign({ status: 'expired' })]);
    const s = resolveVerifiedSigner(actor, NOW);
    expect(s).toMatchObject({ role: 'unknown', tier: 1, authorityDomains: [] });
  });

  it('picks the highest-tier capacity as the representative role', () => {
    setSignatureAssignmentProvider(() => [assign({ signatureRoleId: 'Employee' }), assign({ signatureRoleId: 'Governing Body Chair' })]);
    const s = resolveVerifiedSigner(actor, NOW);
    const gbcTier = productionTierForRole('Governing Body Chair');
    expect(s.tier).toBe(gbcTier);
    expect(s.role).toBe('Governing Body Chair');
  });

  it('never resolves authority from an unknown role label', () => {
    setSignatureAssignmentProvider(() => [assign({ signatureRoleId: 'Supreme Wizard' })]);
    const s = resolveVerifiedSigner(actor, NOW);
    expect(s).toMatchObject({ role: 'unknown', tier: 1 });
  });
});
