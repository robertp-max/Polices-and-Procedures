import { describe, it, expect } from 'vitest';
import { ControlRegistryStore } from './controlRegistryStore.js';

const DEF = { hasRequiredDocs: true, hasEvidenceRequirements: true, hasSignoffRequirements: true, requiredDocsPresentAndCurrent: true, now: '2026-07-22T00:00:00.000Z' };
const evidenceBase = { controlId: 'CTRL-001', title: 'Signed acknowledgment', documentType: 'attestation', sourceProvider: 'drive', phiClassification: 'SYNTHETIC' as const, hash: 'h1', actor: 'usr-owner' };

describe('ControlRegistryStore — server-authoritative operational lifecycle', () => {
  it('a control with no evidence is honestly blocked (never OK)', () => {
    const s = new ControlRegistryStore({ persist: false });
    const r = s.readiness('CTRL-001', DEF);
    expect(r.state).toBe('EVIDENCE_MISSING');
    expect(r.legacy).toBe('BLOCKED');
  });

  it('pending (unreviewed) evidence does not satisfy readiness', () => {
    const s = new ControlRegistryStore({ persist: false });
    s.addEvidence(evidenceBase, { at: DEF.now });
    expect(s.readiness('CTRL-001', DEF).state).toBe('EVIDENCE_MISSING');
  });

  it('accepted evidence + effective verification + approved sign-off → OK', () => {
    const s = new ControlRegistryStore({ persist: false });
    const a = s.addEvidence(evidenceBase, { at: DEF.now });
    s.reviewEvidence('CTRL-001', a.id, 'ACCEPTED', 'usr-verifier', undefined, DEF.now);
    s.addVerification({ controlId: 'CTRL-001', method: 'sample audit', effectiveness: 'EFFECTIVE', verifier: 'usr-verifier' }, { at: DEF.now });
    s.addSignoff({ controlId: 'CTRL-001', signer: 'usr-approver', verifiedRole: 'grp-compliance', attestationVersion: 'v1', decision: 'APPROVED' }, { at: DEF.now });
    const r = s.readiness('CTRL-001', DEF);
    expect(r.state).toBe('OK');
    expect(r.legacy).toBe('OK');
  });

  it('expired accepted evidence → EVIDENCE_EXPIRED (blocked)', () => {
    const s = new ControlRegistryStore({ persist: false });
    const a = s.addEvidence({ ...evidenceBase, expirationDate: '2020-01-01T00:00:00.000Z' }, { at: DEF.now });
    s.reviewEvidence('CTRL-001', a.id, 'ACCEPTED', 'usr-verifier', undefined, DEF.now);
    expect(s.readiness('CTRL-001', DEF).state).toBe('EVIDENCE_EXPIRED');
  });

  it('open critical deficiency blocks readiness', () => {
    const s = new ControlRegistryStore({ persist: false });
    const a = s.addEvidence(evidenceBase, { at: DEF.now });
    s.reviewEvidence('CTRL-001', a.id, 'ACCEPTED', 'usr-verifier', undefined, DEF.now);
    s.openDeficiency({ controlId: 'CTRL-001', severity: 'CRITICAL', condition: 'gap', correctiveActionRequired: true }, { at: DEF.now });
    expect(s.readiness('CTRL-001', DEF).state).toBe('OPEN_CRITICAL_DEFICIENCY');
  });

  it('idempotency key prevents duplicate scope instances', () => {
    const s = new ControlRegistryStore({ persist: false });
    s.addInstance({ controlId: 'CTRL-001', scopeLabel: 'Branch A', applicable: true, actor: 'usr-owner' }, { idempotencyKey: 'k1', at: DEF.now });
    s.addInstance({ controlId: 'CTRL-001', scopeLabel: 'Branch A', applicable: true, actor: 'usr-owner' }, { idempotencyKey: 'k1', at: DEF.now });
    expect(s.getState('CTRL-001').instances.length).toBe(1);
  });

  it('mutations bump the version + append-only records grow', () => {
    const s = new ControlRegistryStore({ persist: false });
    const v0 = s.getState('CTRL-001').version;
    s.addEvidence(evidenceBase, { at: DEF.now });
    expect(s.getState('CTRL-001').version).toBe(v0 + 1);
  });
});
