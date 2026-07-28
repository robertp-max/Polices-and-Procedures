/**
 * Care Indeed LMS — Wave 6: certificate issuance, manifest, verification, revocation.
 *
 * Pure logic (architecture §11, §12; ADR-004/005). Issuance is idempotent and gated
 * on a signed PASS eligibility decision; the manifest (not the PDF) is the source of
 * truth; public verification is data-minimized; certificates are never deleted.
 */
import { canIssueCertificate } from './invariants';
import { sha256OfJson } from './hash';
import type { CertificateRecord, GateDecision, PolicyVersionRef } from './types';

/* ------------------------------------------------------------------ *
 * Idempotent issuance key (§12.5).
 * ------------------------------------------------------------------ */

export interface IssuanceKeyInput {
  subjectId: string;
  certificateDefinitionId: string;
  certificateDefinitionVersion: number;
  cycleOrPlanId: string; // '' for non-recurring scopes
  eligibilitySnapshotSha256: string;
}

export function issuanceKey(i: IssuanceKeyInput): string {
  return [
    i.subjectId,
    i.certificateDefinitionId,
    `v${i.certificateDefinitionVersion}`,
    i.cycleOrPlanId || 'no-cycle',
    i.eligibilitySnapshotSha256,
  ].join('#');
}

/** A retry with the same key returns the existing certificate rather than duplicating. */
export function resolveIdempotentIssuance(
  key: string,
  existingByKey: Map<string, CertificateRecord>,
): { action: 'RETURN_EXISTING' | 'CREATE'; existing?: CertificateRecord } {
  const existing = existingByKey.get(key);
  return existing ? { action: 'RETURN_EXISTING', existing } : { action: 'CREATE' };
}

/* ------------------------------------------------------------------ *
 * Eligibility (delegates to the signed-PASS-gate invariant).
 * ------------------------------------------------------------------ */

export function assertCertificateEligible(gate: GateDecision, now: Date): { ok: boolean; reason?: string } {
  const r = canIssueCertificate(
    { gateType: gate.gateType, outcome: gate.outcome, assertionSignature: gate.assertionSignature, expiresAt: gate.expiresAt },
    now,
  );
  return { ok: r.allowed, reason: r.reason };
}

/* ------------------------------------------------------------------ *
 * Manifest (source of truth; §12.4 / §27).
 * ------------------------------------------------------------------ */

export interface CertificateManifest {
  publicId: string;
  certificateDefinitionRef: { id: string; version: number };
  subjectId: string;
  gateDecisionId: string;
  eligibilitySnapshotSha256: string;
  templateId: string;
  templateVersion: string;
  approvedLogoSha256: string;
  rendererVersion: string;
  inputs: {
    assignmentIds: string[];
    gradeIds: string[];
    evidenceIds: string[];
    signoffIds: string[];
    policyVersions: PolicyVersionRef[];
  };
  issuedAt: string;
}

export interface BuildManifestInput extends Omit<CertificateManifest, 'inputs'> {
  assignmentIds: string[];
  gradeIds: string[];
  evidenceIds: string[];
  signoffIds: string[];
  policyVersions: PolicyVersionRef[];
}

export function buildCertificateManifest(i: BuildManifestInput): CertificateManifest {
  return {
    publicId: i.publicId,
    certificateDefinitionRef: i.certificateDefinitionRef,
    subjectId: i.subjectId,
    gateDecisionId: i.gateDecisionId,
    eligibilitySnapshotSha256: i.eligibilitySnapshotSha256,
    templateId: i.templateId,
    templateVersion: i.templateVersion,
    approvedLogoSha256: i.approvedLogoSha256,
    rendererVersion: i.rendererVersion,
    inputs: {
      assignmentIds: [...i.assignmentIds].sort(),
      gradeIds: [...i.gradeIds].sort(),
      evidenceIds: [...i.evidenceIds].sort(),
      signoffIds: [...i.signoffIds].sort(),
      policyVersions: i.policyVersions,
    },
    issuedAt: i.issuedAt,
  };
}

/** Deterministic: the same manifest fingerprint must reproduce the same artifact. */
export function manifestFingerprint(m: CertificateManifest): string {
  return `cm_${sha256OfJson(m)}`;
}

/** True when the two manifests would render an identical certificate. */
export function manifestsReproduceIdentically(a: CertificateManifest, b: CertificateManifest): boolean {
  return manifestFingerprint(a) === manifestFingerprint(b);
}

/* ------------------------------------------------------------------ *
 * Public verification — data minimization (§12.3, §23).
 * ------------------------------------------------------------------ */

export interface PublicVerification {
  publicId: string;
  status: 'ACTIVE' | 'SUPERSEDED' | 'REVOKED';
  title: string;
  issueDate: string;
  issuer: string;
  learnerDisplayName: string;
}

/**
 * Returns ONLY safe public fields. Never exposes employeeId, question responses,
 * remediation detail, scores, or artifact paths.
 */
export function publicVerificationView(input: {
  record: Pick<CertificateRecord, 'publicId' | 'status' | 'issuedAt'>;
  title: string;
  issuer: string;
  learnerDisplayName: string;
}): PublicVerification {
  return {
    publicId: input.record.publicId,
    status: input.record.status,
    title: input.title,
    issueDate: input.record.issuedAt,
    issuer: input.issuer,
    learnerDisplayName: input.learnerDisplayName,
  };
}

/* ------------------------------------------------------------------ *
 * Revocation / supersession — never delete (§12.6).
 * ------------------------------------------------------------------ */

export function revokeCertificate(record: CertificateRecord, reason: string): CertificateRecord {
  if (record.status === 'REVOKED') throw new Error('ALREADY_REVOKED');
  return { ...record, status: 'REVOKED', revocationReason: reason };
}

export function supersedeCertificate(prior: CertificateRecord, replacementId: string): CertificateRecord {
  if (prior.status === 'REVOKED') throw new Error('CANNOT_SUPERSEDE_REVOKED');
  return { ...prior, status: 'SUPERSEDED', supersedesCertificateId: replacementId };
}

/**
 * A later annual lapse must not rewrite a historical onboarding certificate
 * (§14.3): historical records are immutable regardless of current readiness.
 */
export function annualLapseAffectsHistoricalCertificate(): false {
  return false;
}
