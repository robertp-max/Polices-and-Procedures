import { describe, it, expect } from 'vitest';
import {
  annualLapseAffectsHistoricalCertificate,
  assertCertificateEligible,
  buildCertificateManifest,
  issuanceKey,
  manifestFingerprint,
  manifestsReproduceIdentically,
  publicVerificationView,
  resolveIdempotentIssuance,
  revokeCertificate,
  supersedeCertificate,
  type BuildManifestInput,
} from './certificates';
import type { CertificateRecord, GateDecision } from './types';

const now = new Date('2026-07-27T00:00:00.000Z');

function gate(over: Partial<GateDecision> = {}): GateDecision {
  return {
    id: 'gd1',
    gateDefinitionRef: { id: 'GATE-CERT', version: 1 },
    gateType: 'CERTIFICATE_ELIGIBILITY',
    subjectId: 's1',
    evaluatedAt: now.toISOString(),
    inputAssignmentIds: [],
    inputEvidenceIds: [],
    inputSignoffIds: [],
    inputGradeIds: [],
    stateVectorSha256: 'sv',
    outcome: 'PASS',
    reasonCodes: [],
    assertionSignature: 'kms:sig',
    evaluatorVersion: '1',
    ...over,
  };
}

function cert(over: Partial<CertificateRecord> = {}): CertificateRecord {
  return {
    id: 'c1',
    publicId: 'PUB-1',
    certificateDefinitionRef: { id: 'CD', version: 1 },
    subjectId: 's1',
    roleAssignmentIds: [],
    gateDecisionId: 'gd1',
    eligibilitySnapshotSha256: 'snap',
    assignmentIds: [],
    policyVersions: [],
    gradeIds: [],
    evidenceIds: [],
    signoffIds: [],
    issuedAt: now.toISOString(),
    issuedBy: 'SYSTEM',
    artifactEvidenceId: 'a1',
    manifestArtifactEvidenceId: 'm1',
    templateId: 'T',
    templateVersion: '1',
    status: 'ACTIVE',
    ...over,
  };
}

const manifestInput: BuildManifestInput = {
  publicId: 'PUB-1',
  certificateDefinitionRef: { id: 'CD', version: 1 },
  subjectId: 's1',
  gateDecisionId: 'gd1',
  eligibilitySnapshotSha256: 'snap',
  templateId: 'T',
  templateVersion: '1',
  approvedLogoSha256: 'logo',
  rendererVersion: 'r1',
  assignmentIds: ['a2', 'a1'],
  gradeIds: ['g1'],
  evidenceIds: ['e1'],
  signoffIds: ['s1'],
  policyVersions: [],
  issuedAt: now.toISOString(),
};

describe('certificate eligibility', () => {
  it('eligible only from a signed PASS eligibility gate', () => {
    expect(assertCertificateEligible(gate(), now).ok).toBe(true);
    expect(assertCertificateEligible(gate({ outcome: 'FAIL' }), now)).toEqual({ ok: false, reason: 'GATE_NOT_PASS' });
    expect(assertCertificateEligible(gate({ assertionSignature: '' }), now).reason).toBe('GATE_UNSIGNED');
    expect(assertCertificateEligible(gate({ gateType: 'FIELD_CLEARANCE' }), now).reason).toBe('WRONG_GATE_TYPE');
  });
});

describe('idempotent issuance', () => {
  it('same key returns the existing certificate rather than duplicating', () => {
    const key = issuanceKey({ subjectId: 's1', certificateDefinitionId: 'CD', certificateDefinitionVersion: 1, cycleOrPlanId: '', eligibilitySnapshotSha256: 'snap' });
    const map = new Map([[key, cert()]]);
    expect(resolveIdempotentIssuance(key, map).action).toBe('RETURN_EXISTING');
    expect(resolveIdempotentIssuance('other', map).action).toBe('CREATE');
  });
});

describe('manifest is deterministic + the source of truth', () => {
  it('reproduces an identical fingerprint from the same inputs (order-independent)', () => {
    const m1 = buildCertificateManifest(manifestInput);
    const m2 = buildCertificateManifest({ ...manifestInput, assignmentIds: ['a1', 'a2'] });
    expect(manifestFingerprint(m1)).toBe(manifestFingerprint(m2));
    expect(manifestsReproduceIdentically(m1, m2)).toBe(true);
  });
  it('a different logo/template changes the fingerprint', () => {
    const m1 = buildCertificateManifest(manifestInput);
    const m2 = buildCertificateManifest({ ...manifestInput, approvedLogoSha256: 'DIFFERENT' });
    expect(manifestsReproduceIdentically(m1, m2)).toBe(false);
  });
});

describe('public verification is data-minimized', () => {
  it('exposes only safe fields', () => {
    const v = publicVerificationView({ record: cert(), title: 'RN Onboarding', issuer: 'Care Indeed', learnerDisplayName: 'Taylor D.' });
    expect(v).toEqual({ publicId: 'PUB-1', status: 'ACTIVE', title: 'RN Onboarding', issueDate: cert().issuedAt, issuer: 'Care Indeed', learnerDisplayName: 'Taylor D.' });
    expect(JSON.stringify(v)).not.toMatch(/employeeId|snap|score|remediation/i);
  });
});

describe('revocation/supersession never delete + history is immutable', () => {
  it('revokes and supersedes without deleting', () => {
    expect(revokeCertificate(cert(), 'fraud').status).toBe('REVOKED');
    expect(() => revokeCertificate(cert({ status: 'REVOKED' }), 'x')).toThrow(/ALREADY_REVOKED/);
    expect(supersedeCertificate(cert(), 'c2').supersedesCertificateId).toBe('c2');
  });
  it('an annual lapse never rewrites a historical onboarding certificate', () => {
    expect(annualLapseAffectsHistoricalCertificate()).toBe(false);
  });
});
