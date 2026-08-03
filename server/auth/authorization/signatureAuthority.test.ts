/**
 * ADR-0002 Phase 5B — signature-authority resolver + coverage tests.
 * Tier/domain expectations are derived from the same source functions so a
 * catalog/tier change stays consistent.
 */
import { describe, expect, it } from 'vitest';
import { productionTierForRole } from '@/policy/ecign/signerAuthority';
import {
  resolveSignerAuthority, signatureCoverage,
  type SignatureAuthorityAssignment,
} from './signatureAuthority.ts';

const NOW = '2027-06-01T00:00:00.000Z';
let n = 0;
const assign = (over: Partial<SignatureAuthorityAssignment> = {}): SignatureAuthorityAssignment => ({
  assignmentId: `sa-${++n}`,
  userId: 'usr-1',
  signatureRoleId: 'Director of Nursing',
  authorityBasis: 'job_appointment',
  scope: { organizationId: 'org-1' },
  effectiveFrom: '2027-01-01T00:00:00.000Z',
  grantedBy: 'admin-1',
  reason: 'appointment',
  status: 'active',
  version: 1,
  ...over,
});

describe('resolveSignerAuthority (fail-closed)', () => {
  it('non-active account yields no capacities, tier 1, no domains', () => {
    const r = resolveSignerAuthority({ userId: 'usr-1', accountActive: false, assignments: [assign()], nowIso: NOW });
    expect(r.capacities).toEqual([]);
    expect(r.tier).toBe(1);
    expect(r.domains).toEqual([]);
    expect(r.mfaVerified).toBe(false);
  });

  it('resolves an active assignment to its capacity + tier + domains', () => {
    const r = resolveSignerAuthority({ userId: 'usr-1', accountActive: true, assignments: [assign()], nowIso: NOW });
    expect(r.capacities).toEqual(['Director of Nursing']);
    expect(r.tier).toBe(productionTierForRole('Director of Nursing'));
    expect(r.domains.length).toBeGreaterThan(0);
    expect(r.assignmentIds.length).toBe(1);
    expect(r.mfaVerified).toBe(false);
  });

  it('excludes revoked, expired, and future assignments', () => {
    const r = resolveSignerAuthority({
      userId: 'usr-1', accountActive: true, nowIso: NOW,
      assignments: [
        assign({ status: 'revoked' }),
        assign({ status: 'expired' }),
        assign({ effectiveUntil: '2027-03-01T00:00:00.000Z' }), // ended before NOW
        assign({ effectiveFrom: '2028-01-01T00:00:00.000Z' }),  // not yet effective
      ],
    });
    expect(r.capacities).toEqual([]);
    expect(r.tier).toBe(1);
  });

  it('drops an assignment whose role fails catalog reconciliation (never coerced)', () => {
    const r = resolveSignerAuthority({ userId: 'usr-1', accountActive: true, nowIso: NOW, assignments: [assign({ signatureRoleId: 'Supreme Wizard' })] });
    expect(r.capacities).toEqual([]);
    expect(r.unresolvedRoleIds).toEqual(['Supreme Wizard']);
  });

  it('takes the max tier and the union of domains across assignments', () => {
    const r = resolveSignerAuthority({
      userId: 'usr-1', accountActive: true, nowIso: NOW,
      assignments: [assign({ signatureRoleId: 'Compliance Officer' }), assign({ signatureRoleId: 'Governing Body Chair' })],
    });
    expect(new Set(r.capacities)).toEqual(new Set(['Compliance Officer', 'Governing Body Chair']));
    expect(r.tier).toBe(Math.max(productionTierForRole('Compliance Officer'), productionTierForRole('Governing Body Chair')) as typeof r.tier);
  });

  it('resolves aliases too (don -> Director of Nursing)', () => {
    const r = resolveSignerAuthority({ userId: 'usr-1', accountActive: true, nowIso: NOW, assignments: [assign({ signatureRoleId: 'don' })] });
    expect(r.capacities).toEqual(['Director of Nursing']);
  });
});

describe('signatureCoverage', () => {
  it('reports satisfied + missing capacities', () => {
    const c = signatureCoverage(['Director of Nursing', 'Administrator'], ['Director of Nursing']);
    expect(c.satisfied).toEqual(['Director of Nursing']);
    expect(c.missing).toEqual(['Administrator']);
    expect(c.covered).toBe(false);
  });

  it('covered when all required capacities are held', () => {
    const c = signatureCoverage(['Director of Nursing'], ['Director of Nursing', 'Administrator']);
    expect(c.covered).toBe(true);
    expect(c.missing).toEqual([]);
  });
});
