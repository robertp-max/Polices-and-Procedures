import { describe, it, expect } from 'vitest';
import {
  APPROVED_PNP_ATTEMPT_POLICY,
  assignAttemptNumber,
  attemptPassed,
  canStartAttemptNow,
  consumeReattemptAuthorization,
  decideGrade,
  fingerprintQuestionSet,
  isReattemptAuthorizationValid,
  ladderAfterFailure,
  scoreResponses,
  selectQuestionSet,
  type ReattemptAuthState,
} from './assessment';
import type { GradableAttempt } from './invariants';

const P = APPROVED_PNP_ATTEMPT_POLICY;
const now = new Date('2026-07-27T12:00:00.000Z');

describe('post-failure ladder (10q/80%/3 attempts)', () => {
  it('fail 1 → immediate retake', () => {
    expect(ladderAfterFailure(1, P).action).toBe('IMMEDIATE_RETAKE');
  });
  it('fail 2 → 24h cooldown + supervisor notice + remediation', () => {
    const d = ladderAfterFailure(2, P);
    expect(d.action).toBe('COOLDOWN');
    expect(d.cooldownSeconds).toBe(86_400);
    expect(d.notifySupervisor && d.openRemediation).toBe(true);
  });
  it('fail 3 → training hold + review + 1:1 + no further ordinary attempts', () => {
    const d = ladderAfterFailure(3, P);
    expect(d.action).toBe('TRAINING_HOLD');
    expect(d.requireReview && d.require1to1 && d.noFurtherOrdinaryAttempts).toBe(true);
  });
});

describe('start gate (limit + cooldown + reauthorization)', () => {
  it('allows within the ordinary limit', () => {
    expect(canStartAttemptNow({ policy: P, usedOrdinaryAttempts: 1, activeReattemptAuthorization: false, now }).allowed).toBe(true);
  });
  it('blocks during an active cooldown', () => {
    expect(
      canStartAttemptNow({ policy: P, usedOrdinaryAttempts: 2, cooldownUntil: '2099-01-01T00:00:00.000Z', activeReattemptAuthorization: false, now }),
    ).toEqual({ allowed: false, reason: 'COOLDOWN_ACTIVE' });
  });
  it('blocks a 4th ordinary attempt but allows it with a reauthorization', () => {
    expect(canStartAttemptNow({ policy: P, usedOrdinaryAttempts: 3, activeReattemptAuthorization: false, now }))
      .toEqual({ allowed: false, reason: 'ATTEMPT_LIMIT_REACHED' });
    expect(canStartAttemptNow({ policy: P, usedOrdinaryAttempts: 3, activeReattemptAuthorization: true, now }).allowed).toBe(true);
  });
  it('attempt numbering never resets', () => {
    expect(assignAttemptNumber([{ attemptNumber: 1 }, { attemptNumber: 2 }, { attemptNumber: 3 }])).toBe(4);
  });
});

describe('server-side question-set selection', () => {
  const pool = Array.from({ length: 40 }, (_, i) => `q${i}`);
  it('selects exactly the requested count from the pool', () => {
    const sel = selectQuestionSet(pool, 10, 123);
    expect(sel.questionIds).toHaveLength(10);
    expect(new Set(sel.questionIds).size).toBe(10);
    sel.questionIds.forEach((id) => expect(pool).toContain(id));
  });
  it('varies from the previous set when the pool allows', () => {
    const first = selectQuestionSet(pool, 10, 123);
    const second = selectQuestionSet(pool, 10, 123, first.fingerprint);
    expect(second.fingerprint).not.toBe(first.fingerprint);
  });
  it('throws when the bank is too small', () => {
    expect(() => selectQuestionSet(['q1', 'q2'], 10, 1)).toThrow(/TOO_SMALL/);
  });
  it('is deterministic for a given seed', () => {
    expect(fingerprintQuestionSet(selectQuestionSet(pool, 10, 7).questionIds)).toBe(selectQuestionSet(pool, 10, 7).fingerprint);
  });
});

describe('server scoring + grade decision', () => {
  const key = { q1: 'a', q2: 'b', q3: 'c', q4: 'd', q5: 'a' };
  it('scores against the server key with a 4dp percentage', () => {
    const raw = scoreResponses({ responses: { q1: 'a', q2: 'b', q3: 'c', q4: 'x', q5: 'a' }, answerKey: key });
    expect(raw.rawEarned).toBe(4);
    expect(raw.rawPossible).toBe(5);
    expect(raw.percentage).toBe(80);
    expect(attemptPassed(raw, 80)).toBe(true);
  });
  it('a critical miss fails despite a high percentage', () => {
    const raw = scoreResponses({ responses: { q1: 'a', q2: 'b', q3: 'c', q4: 'd', q5: 'x' }, answerKey: key, criticalQuestionIds: ['q5'] });
    expect(raw.criticalFailureCodes).toContain('CRITICAL_MISS:q5');
    expect(attemptPassed(raw, 80)).toBe(false);
  });
  it('throws on an empty key (missing denominator)', () => {
    expect(() => scoreResponses({ responses: {}, answerKey: {} })).toThrow(/DENOMINATOR/);
  });
  it('decideGrade LATEST_PASS picks the most recent passing attempt', () => {
    const attempts: GradableAttempt[] = [
      { attemptId: 'a1', attemptNumber: 1, passed: false, percentage: 70 },
      { attemptId: 'a2', attemptNumber: 2, passed: true, percentage: 82.5 },
      { attemptId: 'a3', attemptNumber: 3, passed: true, percentage: 90 },
    ];
    const g = decideGrade(attempts, { id: 'G', version: 1, selectionPolicy: 'LATEST_PASS' });
    expect(g.outcome).toBe('PASSED');
    expect(g.selectedAttemptId).toBe('a3');
    expect(g.displayedScore).toBe(90);
  });
  it('decideGrade returns FAILED when attempts exist but none passed, NOT_GRADED when none exist', () => {
    expect(decideGrade([{ attemptId: 'a1', attemptNumber: 1, passed: false, percentage: 10 }], { id: 'G', version: 1, selectionPolicy: 'LATEST_PASS' }).outcome).toBe('FAILED');
    expect(decideGrade([], { id: 'G', version: 1, selectionPolicy: 'LATEST_PASS' }).outcome).toBe('NOT_GRADED');
  });
});

describe('identity-bound reattempt authorization', () => {
  const auth: ReattemptAuthState = {
    id: 'auth1',
    subjectId: 's1',
    assignmentId: 'as1',
    remediationCaseId: 'rc1',
    expiresAt: '2099-01-01T00:00:00.000Z',
    status: 'ACTIVE',
  };
  it('valid only when active, bound to subject+assignment, and unexpired', () => {
    expect(isReattemptAuthorizationValid(auth, { subjectId: 's1', assignmentId: 'as1', now }).valid).toBe(true);
    expect(isReattemptAuthorizationValid(auth, { subjectId: 'OTHER', assignmentId: 'as1', now })).toEqual({ valid: false, reason: 'AUTH_NOT_BOUND' });
    expect(isReattemptAuthorizationValid({ ...auth, expiresAt: '2000-01-01T00:00:00.000Z' }, { subjectId: 's1', assignmentId: 'as1', now }).reason).toBe('AUTH_EXPIRED');
    expect(isReattemptAuthorizationValid({ ...auth, status: 'CONSUMED' }, { subjectId: 's1', assignmentId: 'as1', now }).valid).toBe(false);
  });
  it('is single-use — consuming marks it CONSUMED and records the attempt', () => {
    const consumed = consumeReattemptAuthorization(auth, 'attempt-4');
    expect(consumed.status).toBe('CONSUMED');
    expect(consumed.consumedByAttemptId).toBe('attempt-4');
    expect(() => consumeReattemptAuthorization(consumed, 'attempt-5')).toThrow(/NOT_ACTIVE/);
  });
});
