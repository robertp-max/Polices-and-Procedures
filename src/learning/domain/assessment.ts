/**
 * Care Indeed LMS — Wave 3: assessment, scoring, grade, cooldown/lockout,
 * remediation, and identity-bound reattempt authorization.
 *
 * Pure server-side logic (architecture §8; ADR-LEARNING-003). Answer keys never
 * leave the server; scores/grades are server-computed and append-only; the
 * post-third-failure ladder requires a hold + review + single-use reauthorization.
 */
import { isPass, nextAttemptNumber, selectGradedAttempt, type GradableAttempt } from './invariants';
import type { AttemptSelectionPolicy, GradeOutcomeKind } from './types';
import { sha256Hex } from './hash';

/* ------------------------------------------------------------------ *
 * Policies (versioned, pinned into assignments).
 * ------------------------------------------------------------------ */

export interface AttemptPolicy {
  id: string;
  version: number;
  ordinaryAttemptLimit: number; // 3 for approved P&P
  passThresholdPct: number; // 80
  questionCount: number; // 10
  cooldownSecondsAfterAttempt: Record<number, number>; // e.g. { 2: 86400 } (24h after 2nd fail)
}

export interface GradePolicy {
  id: string;
  version: number;
  selectionPolicy: AttemptSelectionPolicy; // LATEST_PASS default for P&P
}

export const APPROVED_PNP_ATTEMPT_POLICY: AttemptPolicy = {
  id: 'ATTEMPT-PNP',
  version: 1,
  ordinaryAttemptLimit: 3,
  passThresholdPct: 80,
  questionCount: 10,
  cooldownSecondsAfterAttempt: { 2: 86_400 },
};

/* ------------------------------------------------------------------ *
 * Post-failure ladder (§8.6 / ADR-003).
 * ------------------------------------------------------------------ */

export type LadderAction = 'IMMEDIATE_RETAKE' | 'COOLDOWN' | 'TRAINING_HOLD';

export interface LadderDecision {
  action: LadderAction;
  cooldownSeconds?: number;
  notifySupervisor: boolean;
  openRemediation: boolean;
  requireReview: boolean;
  require1to1: boolean;
  noFurtherOrdinaryAttempts: boolean;
}

/** Decides what happens after a FAILED ordinary attempt number `failedAttemptNumber`. */
export function ladderAfterFailure(failedAttemptNumber: number, policy: AttemptPolicy): LadderDecision {
  if (failedAttemptNumber >= policy.ordinaryAttemptLimit) {
    return {
      action: 'TRAINING_HOLD',
      notifySupervisor: true,
      openRemediation: true,
      requireReview: true,
      require1to1: true,
      noFurtherOrdinaryAttempts: true,
    };
  }
  const cooldown = policy.cooldownSecondsAfterAttempt[failedAttemptNumber];
  if (cooldown) {
    return {
      action: 'COOLDOWN',
      cooldownSeconds: cooldown,
      notifySupervisor: true,
      openRemediation: true,
      requireReview: false,
      require1to1: false,
      noFurtherOrdinaryAttempts: false,
    };
  }
  return {
    action: 'IMMEDIATE_RETAKE',
    notifySupervisor: false,
    openRemediation: false,
    requireReview: false,
    require1to1: false,
    noFurtherOrdinaryAttempts: false,
  };
}

/* ------------------------------------------------------------------ *
 * Start gate (limit + cooldown + reattempt authorization).
 * ------------------------------------------------------------------ */

export interface StartGateInput {
  policy: AttemptPolicy;
  usedOrdinaryAttempts: number;
  cooldownUntil?: string; // ISO
  activeReattemptAuthorization: boolean;
  now: Date;
}

export function canStartAttemptNow(input: StartGateInput): { allowed: boolean; reason?: string } {
  if (input.cooldownUntil && new Date(input.cooldownUntil).getTime() > input.now.getTime()) {
    return { allowed: false, reason: 'COOLDOWN_ACTIVE' };
  }
  if (input.usedOrdinaryAttempts < input.policy.ordinaryAttemptLimit) return { allowed: true };
  if (input.activeReattemptAuthorization) return { allowed: true };
  return { allowed: false, reason: 'ATTEMPT_LIMIT_REACHED' };
}

/** The attempt number the server will assign next (never resets; §3.3). */
export function assignAttemptNumber(existing: { attemptNumber: number }[]): number {
  return nextAttemptNumber(existing);
}

/* ------------------------------------------------------------------ *
 * Server-side question-set selection (§8.7) — answer keys stay server-side.
 * ------------------------------------------------------------------ */

/** Deterministic, seedable Fisher–Yates (Math.random is unavailable/forbidden). */
function shuffle<T>(items: T[], seed: number): T[] {
  const a = [...items];
  let s = seed >>> 0;
  const rand = () => {
    // xorshift32
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 0xffffffff;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Stable SHA-256 fingerprint of an ordered id set. */
export function fingerprintQuestionSet(ids: string[]): string {
  return `qs_${sha256Hex(ids.join('|'))}`;
}

export interface QuestionSetSelection {
  questionIds: string[];
  fingerprint: string;
}

/**
 * Selects `count` question ids from the approved pool, server-randomized by `seed`.
 * When the pool is larger than `count`, avoids reproducing the immediately previous
 * set fingerprint (retries with a perturbed seed) so consecutive P&P attempts vary.
 */
export function selectQuestionSet(
  poolIds: string[],
  count: number,
  seed: number,
  previousFingerprint?: string,
): QuestionSetSelection {
  if (poolIds.length < count) {
    throw new Error('QUESTION_BANK_TOO_SMALL');
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    const ids = shuffle(poolIds, seed + attempt * 2654435761).slice(0, count);
    const fp = fingerprintQuestionSet(ids);
    if (poolIds.length === count || fp !== previousFingerprint) {
      return { questionIds: ids, fingerprint: fp };
    }
  }
  const ids = shuffle(poolIds, seed).slice(0, count);
  return { questionIds: ids, fingerprint: fingerprintQuestionSet(ids) };
}

/* ------------------------------------------------------------------ *
 * Scoring (server-only key) + grade decision.
 * ------------------------------------------------------------------ */

export interface ScoreInput {
  responses: Record<string, string>; // questionId -> chosenOptionId (learner)
  answerKey: Record<string, string>; // questionId -> correctOptionId (SERVER ONLY)
  criticalQuestionIds?: string[]; // missing/incorrect => critical failure
}

export interface RawScore {
  rawEarned: number;
  rawPossible: number;
  percentage: number; // 4dp
  criticalFailureCodes: string[];
}

export function scoreResponses(input: ScoreInput): RawScore {
  const questionIds = Object.keys(input.answerKey);
  if (questionIds.length === 0) throw new Error('SCORE_DENOMINATOR_MISSING');
  let earned = 0;
  const critical: string[] = [];
  for (const qid of questionIds) {
    const correct = input.responses[qid] === input.answerKey[qid];
    if (correct) earned += 1;
    if (input.criticalQuestionIds?.includes(qid) && !correct) {
      critical.push(`CRITICAL_MISS:${qid}`);
    }
  }
  const possible = questionIds.length;
  const percentage = Math.round((earned / possible) * 1_000_000) / 10_000; // 4dp
  return { rawEarned: earned, rawPossible: possible, percentage, criticalFailureCodes: critical };
}

export function attemptPassed(raw: RawScore, thresholdPct: number): boolean {
  return isPass(
    { rawEarned: raw.rawEarned, rawPossible: raw.rawPossible, criticalFailureCodes: raw.criticalFailureCodes },
    thresholdPct,
  );
}

/** Selects the official graded attempt per policy and returns the grade outcome. */
export function decideGrade(
  attempts: GradableAttempt[],
  policy: GradePolicy,
): { outcome: GradeOutcomeKind; selectedAttemptId?: string; displayedScore?: number } {
  const selected = selectGradedAttempt(attempts, policy.selectionPolicy);
  if (!selected) {
    const anyAttempted = attempts.length > 0;
    return { outcome: anyAttempted ? 'FAILED' : 'NOT_GRADED' };
  }
  return {
    outcome: selected.passed ? 'PASSED' : 'FAILED',
    selectedAttemptId: selected.attemptId,
    displayedScore: Math.round(selected.percentage * 10) / 10, // 1dp display
  };
}

/* ------------------------------------------------------------------ *
 * Identity-bound reattempt authorization (§8.6 / ADR-003).
 * ------------------------------------------------------------------ */

export interface ReattemptAuthState {
  id: string;
  subjectId: string;
  assignmentId: string;
  remediationCaseId: string;
  expiresAt: string;
  consumedByAttemptId?: string;
  status: 'ACTIVE' | 'CONSUMED' | 'EXPIRED' | 'REVOKED';
}

/** A reauthorization is valid to open a new attempt only when active, bound, and unexpired. */
export function isReattemptAuthorizationValid(
  auth: ReattemptAuthState,
  ctx: { subjectId: string; assignmentId: string; now: Date },
): { valid: boolean; reason?: string } {
  if (auth.status !== 'ACTIVE') return { valid: false, reason: `AUTH_${auth.status}` };
  if (auth.subjectId !== ctx.subjectId || auth.assignmentId !== ctx.assignmentId) {
    return { valid: false, reason: 'AUTH_NOT_BOUND' };
  }
  if (new Date(auth.expiresAt).getTime() < ctx.now.getTime()) return { valid: false, reason: 'AUTH_EXPIRED' };
  return { valid: true };
}

/** Consuming an authorization is single-use — it does not alter prior attempts. */
export function consumeReattemptAuthorization(auth: ReattemptAuthState, attemptId: string): ReattemptAuthState {
  if (auth.status !== 'ACTIVE') throw new Error('AUTH_NOT_ACTIVE');
  return { ...auth, status: 'CONSUMED', consumedByAttemptId: attemptId };
}
