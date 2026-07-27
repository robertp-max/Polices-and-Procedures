/**
 * Care Indeed LMS — Wave 1 invariant/property tests (architecture §24.2).
 * These encode the non-negotiable server-authority guarantees.
 */
import { describe, it, expect } from 'vitest';
import {
  canIssueCertificate,
  canStartAttempt,
  certificateGrantsClearance,
  deriveCompletion,
  distinctHumanViolated,
  isEvidenceCountable,
  isPass,
  nextAttemptNumber,
  selectGradedAttempt,
  type CompletionInputs,
  type GradableAttempt,
} from './invariants';

const baseCompletion = (): CompletionInputs => ({
  requiredGradeOutcome: 'PASSED',
  requiredEvidenceIds: ['ev-spec-1'],
  validEvidenceIds: new Set(['ev-spec-1']),
  requiredSignoffSlots: ['supervisor'],
  approvedSignoffSlots: new Set(['supervisor']),
  hasOpenRemediation: false,
});

describe('completion is derived, never standalone', () => {
  it('completes only when every requirement is satisfied', () => {
    expect(deriveCompletion(baseCompletion()).completed).toBe(true);
  });

  it('never completes with missing required evidence', () => {
    const input = { ...baseCompletion(), validEvidenceIds: new Set<string>() };
    const r = deriveCompletion(input);
    expect(r.completed).toBe(false);
    expect(r.reasonCodes).toContain('EVIDENCE_MISSING:ev-spec-1');
  });

  it('never completes with a non-passing grade', () => {
    const input = { ...baseCompletion(), requiredGradeOutcome: 'FAILED' as const };
    expect(deriveCompletion(input).completed).toBe(false);
  });

  it('never completes with an open remediation or unmet active time', () => {
    expect(deriveCompletion({ ...baseCompletion(), hasOpenRemediation: true }).completed).toBe(false);
    expect(
      deriveCompletion({ ...baseCompletion(), minActiveSeconds: 600, acceptedActiveSeconds: 120 }).completed,
    ).toBe(false);
  });

  it('never completes when a required signoff is absent', () => {
    expect(
      deriveCompletion({ ...baseCompletion(), approvedSignoffSlots: new Set<string>() }).completed,
    ).toBe(false);
  });
});

describe('attempts are append-only; numbering never resets', () => {
  it('next number is strictly max+1', () => {
    expect(nextAttemptNumber([])).toBe(1);
    expect(nextAttemptNumber([{ attemptNumber: 1 }, { attemptNumber: 2 }, { attemptNumber: 3 }])).toBe(4);
  });

  it('a reattempt continues numbering rather than resetting to 1', () => {
    // After 3 ordinary attempts + a reauthorization, the 4th continues numbering.
    expect(nextAttemptNumber([{ attemptNumber: 1 }, { attemptNumber: 2 }, { attemptNumber: 3 }])).toBe(4);
  });

  it('blocks a 4th ordinary attempt without reauthorization; allows it with one', () => {
    expect(canStartAttempt({ ordinaryAttemptLimit: 3, usedOrdinaryAttempts: 3, activeReattemptAuthorization: false }))
      .toEqual({ allowed: false, reason: 'ATTEMPT_LIMIT_REACHED' });
    expect(canStartAttempt({ ordinaryAttemptLimit: 3, usedOrdinaryAttempts: 3, activeReattemptAuthorization: true }).allowed)
      .toBe(true);
  });
});

describe('scoring: unrounded threshold + critical errors', () => {
  it('passes on unrounded percentage at/above threshold', () => {
    expect(isPass({ rawEarned: 8, rawPossible: 10, criticalFailureCodes: [] }, 80)).toBe(true);
    expect(isPass({ rawEarned: 7, rawPossible: 10, criticalFailureCodes: [] }, 80)).toBe(false);
  });

  it('a critical error fails despite a high percentage', () => {
    expect(isPass({ rawEarned: 94, rawPossible: 100, criticalFailureCodes: ['NO_ABUSE_REPORT'] }, 80)).toBe(false);
  });

  it('throws when the denominator is missing (release gate)', () => {
    expect(() => isPass({ rawEarned: 5, rawPossible: 0, criticalFailureCodes: [] }, 80)).toThrow(/DENOMINATOR/);
  });
});

describe('grade selection honors the versioned policy (no global highest)', () => {
  const attempts: GradableAttempt[] = [
    { attemptId: 'a1', attemptNumber: 1, passed: false, percentage: 70 },
    { attemptId: 'a2', attemptNumber: 2, passed: true, percentage: 82 },
    { attemptId: 'a3', attemptNumber: 3, passed: true, percentage: 88 },
  ];
  it('LATEST_PASS selects the most recent passing attempt (P&P default)', () => {
    expect(selectGradedAttempt(attempts, 'LATEST_PASS')?.attemptId).toBe('a3');
  });
  it('FIRST_PASS selects the earliest passing attempt', () => {
    expect(selectGradedAttempt(attempts, 'FIRST_PASS')?.attemptId).toBe('a2');
  });
  it('returns null when no attempt passes under a pass-based policy', () => {
    expect(selectGradedAttempt([{ attemptId: 'x', attemptNumber: 1, passed: false, percentage: 10 }], 'LATEST_PASS')).toBeNull();
  });
});

describe('distinct-human signoff (§10.3)', () => {
  it('flags the same human filling two slots in one distinct group', () => {
    expect(
      distinctHumanViolated([
        { signerSubjectId: 'u1', signerSlot: 'supervisor', distinctHumanGroup: 'g', decision: 'APPROVE' },
        { signerSubjectId: 'u1', signerSlot: 'don', distinctHumanGroup: 'g', decision: 'APPROVE' },
      ]),
    ).toBe(true);
  });
  it('allows two distinct humans in the same group', () => {
    expect(
      distinctHumanViolated([
        { signerSubjectId: 'u1', signerSlot: 'supervisor', distinctHumanGroup: 'g', decision: 'APPROVE' },
        { signerSubjectId: 'u2', signerSlot: 'don', distinctHumanGroup: 'g', decision: 'APPROVE' },
      ]),
    ).toBe(false);
  });
});

describe('certificate issuance & clearance separation', () => {
  const now = new Date('2026-07-27T00:00:00.000Z');
  const passGate = {
    gateType: 'CERTIFICATE_ELIGIBILITY' as const,
    outcome: 'PASS' as const,
    assertionSignature: 'kms:sig',
    expiresAt: undefined,
  };
  it('issues only from a signed, PASS, non-expired eligibility gate', () => {
    expect(canIssueCertificate(passGate, now).allowed).toBe(true);
    expect(canIssueCertificate({ ...passGate, outcome: 'FAIL' }, now)).toEqual({ allowed: false, reason: 'GATE_NOT_PASS' });
    expect(canIssueCertificate({ ...passGate, outcome: 'CONDITIONAL' }, now).allowed).toBe(false);
    expect(canIssueCertificate({ ...passGate, assertionSignature: '' }, now)).toEqual({ allowed: false, reason: 'GATE_UNSIGNED' });
    expect(canIssueCertificate({ ...passGate, expiresAt: '2020-01-01T00:00:00.000Z' }, now)).toEqual({ allowed: false, reason: 'GATE_EXPIRED' });
    expect(canIssueCertificate({ ...passGate, gateType: 'FIELD_CLEARANCE' }, now)).toEqual({ allowed: false, reason: 'WRONG_GATE_TYPE' });
  });
  it('a certificate never grants clearance by itself', () => {
    expect(certificateGrantsClearance()).toBe(false);
  });
});

describe('evidence must be server-validated', () => {
  it('only VALID evidence is countable (a local image is not)', () => {
    expect(isEvidenceCountable({ status: 'VALID' })).toBe(true);
    expect(isEvidenceCountable({ status: 'PENDING' })).toBe(false);
    expect(isEvidenceCountable({ status: 'REJECTED' })).toBe(false);
  });
});
