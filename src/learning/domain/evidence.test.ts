import { describe, it, expect } from 'vitest';
import {
  addSignoff,
  canTransitionEvidence,
  personnelFileRouting,
  recordCompetencyObservation,
  rejectEvidence,
  requiredSignoffsPresent,
  supersedeEvidence,
  validateEvidence,
} from './evidence';
import type { CompletionEvidence, SignoffRecord } from './types';

const now = new Date('2026-07-27T00:00:00.000Z');

function ev(over: Partial<CompletionEvidence> = {}): CompletionEvidence {
  return {
    id: 'e1',
    subjectId: 's1',
    evidenceType: 'COMPETENCY_FORM',
    policyVersionRefs: [],
    workflowRefs: [],
    status: 'PENDING',
    createdAt: now.toISOString(),
    createdBy: 'u1',
    retentionClass: 'standard',
    legalHold: false,
    ...over,
  };
}

function sign(over: Partial<SignoffRecord> = {}): SignoffRecord {
  return {
    id: 's-1',
    subjectId: 's1',
    assignmentId: 'as1',
    signerSubjectId: 'u2',
    actingRoleAssignmentId: 'ra2',
    signerSlot: 'supervisor',
    distinctHumanGroup: 'clinical',
    attestationTextVersion: 'v1',
    decision: 'APPROVE',
    signedAt: now.toISOString(),
    evidenceId: 'e1',
    signatureServiceRef: 'ecign:abc',
    ...over,
  };
}

describe('evidence lifecycle is append-only + artifact-backed', () => {
  it('only permits legal transitions', () => {
    expect(canTransitionEvidence('PENDING', 'VALID')).toBe(true);
    expect(canTransitionEvidence('REJECTED', 'VALID')).toBe(false);
    expect(canTransitionEvidence('VALID', 'SUPERSEDED')).toBe(true);
  });
  it('validates PENDING → VALID only with a real hashed artifact (local image is not one)', () => {
    expect(validateEvidence({ evidence: ev(), validatedBy: 'r1', hasArtifact: true, now }).status).toBe('VALID');
    expect(() => validateEvidence({ evidence: ev(), validatedBy: 'r1', hasArtifact: false, now })).toThrow(/ARTIFACT_REQUIRED/);
  });
  it('allows a SYSTEM_ASSERTION without a file artifact', () => {
    expect(validateEvidence({ evidence: ev({ evidenceType: 'SYSTEM_ASSERTION' }), validatedBy: 'r1', hasArtifact: false, now }).status).toBe('VALID');
  });
  it('supersede/reject never overwrite — they create new statuses', () => {
    expect(supersedeEvidence(ev({ status: 'VALID' }), now).status).toBe('SUPERSEDED');
    expect(rejectEvidence(ev(), 'r1', now).status).toBe('REJECTED');
  });
});

describe('competency observation (§8.5)', () => {
  it('validates only with a qualified, non-self evaluator + observation evidence', () => {
    expect(
      recordCompetencyObservation({ evaluatorSubjectId: 'u2', learnerSubjectId: 's1', evaluatorQualified: true, hasObservationEvidence: true, outcome: 'VALIDATED' }).outcome,
    ).toBe('VALIDATED');
  });
  it('holds as PENDING_EVALUATOR on self-evaluation or missing evidence/qualification', () => {
    expect(recordCompetencyObservation({ evaluatorSubjectId: 's1', learnerSubjectId: 's1', evaluatorQualified: true, hasObservationEvidence: true, outcome: 'VALIDATED' }).reasonCodes).toContain('SELF_EVALUATION_FORBIDDEN');
    expect(recordCompetencyObservation({ evaluatorSubjectId: 'u2', learnerSubjectId: 's1', evaluatorQualified: false, hasObservationEvidence: true, outcome: 'VALIDATED' }).outcome).toBe('PENDING_EVALUATOR');
    expect(recordCompetencyObservation({ evaluatorSubjectId: 'u2', learnerSubjectId: 's1', evaluatorQualified: true, hasObservationEvidence: false, outcome: 'VALIDATED' }).outcome).toBe('PENDING_EVALUATOR');
  });
});

describe('signoff with distinct-human enforcement', () => {
  it('rejects an APPROVE without a signature-service reference', () => {
    expect(addSignoff({ existing: [], candidate: sign({ signatureServiceRef: undefined }) })).toEqual({ accepted: false, reason: 'SIGNATURE_SERVICE_REF_REQUIRED' });
  });
  it('rejects the same human filling two slots in one distinct-human group', () => {
    const first = sign({ id: 'a', signerSubjectId: 'u2', signerSlot: 'supervisor' });
    const second = sign({ id: 'b', signerSubjectId: 'u2', signerSlot: 'don' });
    expect(addSignoff({ existing: [first], candidate: second }).accepted).toBe(false);
  });
  it('accepts two distinct humans and reports required slots present', () => {
    const a = sign({ id: 'a', signerSubjectId: 'u2', signerSlot: 'supervisor' });
    const b = sign({ id: 'b', signerSubjectId: 'u3', signerSlot: 'don' });
    const res = addSignoff({ existing: [a], candidate: b });
    expect(res.accepted).toBe(true);
    expect(requiredSignoffsPresent(['supervisor', 'don'], res.signoffs!)).toBe(true);
    expect(requiredSignoffsPresent(['supervisor', 'don', 'hr'], res.signoffs!)).toBe(false);
  });
});

describe('personnel-file routing', () => {
  it('mirrors validated, non-hold evidence to Drive; canonical stays GCS', () => {
    expect(personnelFileRouting(ev({ status: 'VALID' }))).toEqual({ canonical: 'GCS', mirror: 'DRIVE' });
    expect(personnelFileRouting(ev({ status: 'VALID', legalHold: true })).mirror).toBeNull();
    expect(personnelFileRouting(ev({ status: 'PENDING' })).mirror).toBeNull();
  });
});
