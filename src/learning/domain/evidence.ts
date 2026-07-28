/**
 * Care Indeed LMS — Wave 4: evidence, attestation, competency, and signoff.
 *
 * Pure server-side rules (architecture §5.7, §6.8, §8.5, §10.3; ADR-005). Evidence
 * is append-only and only counts when server-VALIDATED; a browser signature image is
 * never a valid signoff; distinct-human signer slots cannot be filled by one person.
 */
import { distinctHumanViolated } from './invariants';
import type { CompletionEvidence, EvidenceStatus, SignoffRecord } from './types';

/* ------------------------------------------------------------------ *
 * Evidence lifecycle: upload-init → validate/promote (§5.7).
 * ------------------------------------------------------------------ */

const EVIDENCE_TRANSITIONS: Record<EvidenceStatus, EvidenceStatus[]> = {
  PENDING: ['VALID', 'REJECTED'],
  VALID: ['SUPERSEDED', 'REVOKED'],
  REJECTED: [],
  SUPERSEDED: [],
  REVOKED: [],
};

export function canTransitionEvidence(from: EvidenceStatus, to: EvidenceStatus): boolean {
  return EVIDENCE_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface ValidateEvidenceInput {
  evidence: CompletionEvidence;
  validatedBy: string; // reviewer subject id
  hasArtifact: boolean; // a promoted, hashed artifact exists (not a local image)
  now: Date;
}

/** Promotes PENDING evidence to VALID only when a real hashed artifact is present. */
export function validateEvidence(input: ValidateEvidenceInput): CompletionEvidence {
  if (input.evidence.status !== 'PENDING') throw new Error('EVIDENCE_NOT_PENDING');
  if (!input.hasArtifact && input.evidence.evidenceType !== 'SYSTEM_ASSERTION') {
    throw new Error('EVIDENCE_ARTIFACT_REQUIRED'); // a local signature image is not an artifact
  }
  return {
    ...input.evidence,
    status: 'VALID',
    validatedAt: input.now.toISOString(),
    validatedBy: input.validatedBy,
  };
}

export function rejectEvidence(evidence: CompletionEvidence, reviewer: string, now: Date): CompletionEvidence {
  if (!canTransitionEvidence(evidence.status, 'REJECTED')) throw new Error('EVIDENCE_NOT_REJECTABLE');
  return { ...evidence, status: 'REJECTED', validatedAt: now.toISOString(), validatedBy: reviewer };
}

/** New evidence supersedes prior VALID evidence rather than overwriting it (append-only). */
export function supersedeEvidence(prior: CompletionEvidence, now: Date): CompletionEvidence {
  if (!canTransitionEvidence(prior.status, 'SUPERSEDED')) throw new Error('EVIDENCE_NOT_SUPERSEDABLE');
  return { ...prior, status: 'SUPERSEDED', validatedAt: now.toISOString() };
}

/* ------------------------------------------------------------------ *
 * Competency outcomes (§8.5) — not a percentage quiz.
 * ------------------------------------------------------------------ */

export type CompetencyOutcome =
  | 'VALIDATED'
  | 'VALIDATED_WITH_CONDITION'
  | 'NEEDS_IMPROVEMENT'
  | 'FAILED'
  | 'PENDING_EVALUATOR';

export interface CompetencyObservationInput {
  evaluatorSubjectId: string;
  learnerSubjectId: string;
  evaluatorQualified: boolean;
  hasObservationEvidence: boolean;
  outcome: Exclude<CompetencyOutcome, 'PENDING_EVALUATOR'>;
}

/** A competency requires a qualified evaluator (not the learner) + observation evidence. */
export function recordCompetencyObservation(input: CompetencyObservationInput): { outcome: CompetencyOutcome; reasonCodes: string[] } {
  const reasons: string[] = [];
  if (input.evaluatorSubjectId === input.learnerSubjectId) reasons.push('SELF_EVALUATION_FORBIDDEN');
  if (!input.evaluatorQualified) reasons.push('EVALUATOR_NOT_QUALIFIED');
  if (!input.hasObservationEvidence) reasons.push('OBSERVATION_EVIDENCE_MISSING');
  if (reasons.length > 0) return { outcome: 'PENDING_EVALUATOR', reasonCodes: reasons };
  return { outcome: input.outcome, reasonCodes: [] };
}

/* ------------------------------------------------------------------ *
 * Signoff with distinct-human enforcement (§10.3, ADR-005).
 * ------------------------------------------------------------------ */

export interface AddSignoffInput {
  existing: SignoffRecord[];
  candidate: SignoffRecord;
}

/**
 * Adds a signoff, rejecting it when it would let one human fill two slots in the same
 * distinct-human group, or when it lacks a real signature-service reference (a local
 * image is not acceptable).
 */
export function addSignoff(input: AddSignoffInput): { accepted: boolean; reason?: string; signoffs?: SignoffRecord[] } {
  if (input.candidate.decision === 'APPROVE' && !input.candidate.signatureServiceRef) {
    return { accepted: false, reason: 'SIGNATURE_SERVICE_REF_REQUIRED' };
  }
  const combined = [...input.existing, input.candidate];
  if (distinctHumanViolated(combined)) {
    return { accepted: false, reason: 'DISTINCT_HUMAN_VIOLATION' };
  }
  return { accepted: true, signoffs: combined };
}

/** Whether every required signer slot has an APPROVE signoff (for gate consumption). */
export function requiredSignoffsPresent(required: string[], signoffs: SignoffRecord[]): boolean {
  const approved = new Set(signoffs.filter((s) => s.decision === 'APPROVE').map((s) => s.signerSlot));
  return required.every((slot) => approved.has(slot));
}

/* ------------------------------------------------------------------ *
 * Personnel-file routing (§4.1, ADR-005) — Drive mirror is non-authoritative.
 * ------------------------------------------------------------------ */

export function personnelFileRouting(evidence: CompletionEvidence): { canonical: 'GCS'; mirror: 'DRIVE' | null } {
  // Canonical record is always the GCS artifact + Firestore metadata; Drive is an
  // optional approved copy for validated evidence only.
  const mirror = evidence.status === 'VALID' && !evidence.legalHold ? 'DRIVE' : null;
  return { canonical: 'GCS', mirror };
}
