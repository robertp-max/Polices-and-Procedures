/**
 * Care Indeed LMS — domain invariants (Wave 1).
 *
 * Pure, side-effect-free enforcement of the architecture's non-negotiable rules
 * (§3, §8, §9, §10.3, §11). These functions are the server's authority; the browser
 * cannot reproduce them. Exercised by invariants.test.ts (the §24.2 property tests).
 */
import type {
  AssessmentAttempt,
  AttemptSelectionPolicy,
  CompletionEvidence,
  GateDecision,
  GradeOutcomeKind,
  ScoreResult,
  SignoffRecord,
} from './types';

/* ------------------------------------------------------------------ *
 * Completion is DERIVED — never a standalone boolean (§3.4, §9).
 * ------------------------------------------------------------------ */

export interface CompletionInputs {
  requiredGradeOutcome: GradeOutcomeKind | null; // null => no assessment required
  requiredEvidenceIds: string[]; // evidence specs that must be VALID
  validEvidenceIds: Set<string>;
  requiredSignoffSlots: string[]; // signer slots that must be APPROVE
  approvedSignoffSlots: Set<string>;
  hasOpenRemediation: boolean;
  minActiveSeconds?: number; // when the requirement says active time matters
  acceptedActiveSeconds?: number;
}

/**
 * Returns the derived completion decision. COMPLETED requires: passing grade (when
 * an assessment is required), every required evidence VALID, every required signoff
 * APPROVE, no open remediation, and active-time minimum met when defined.
 * Opening the last page or a client boolean can NEVER satisfy this.
 */
export function deriveCompletion(input: CompletionInputs): {
  completed: boolean;
  reasonCodes: string[];
} {
  const reasons: string[] = [];

  if (input.requiredGradeOutcome !== null && input.requiredGradeOutcome !== 'PASSED') {
    reasons.push('GRADE_NOT_PASSED');
  }
  for (const evId of input.requiredEvidenceIds) {
    if (!input.validEvidenceIds.has(evId)) reasons.push(`EVIDENCE_MISSING:${evId}`);
  }
  for (const slot of input.requiredSignoffSlots) {
    if (!input.approvedSignoffSlots.has(slot)) reasons.push(`SIGNOFF_MISSING:${slot}`);
  }
  if (input.hasOpenRemediation) reasons.push('OPEN_REMEDIATION');
  if (
    input.minActiveSeconds !== undefined &&
    (input.acceptedActiveSeconds ?? 0) < input.minActiveSeconds
  ) {
    reasons.push('ACTIVE_TIME_NOT_MET');
  }

  return { completed: reasons.length === 0, reasonCodes: reasons };
}

/* ------------------------------------------------------------------ *
 * Attempts are append-only; numbering never resets (§3.3, §8.6, ADR-003).
 * ------------------------------------------------------------------ */

/**
 * The next attempt number is strictly max(existing)+1. A reattempt authorization
 * opens a NEW cycle by continuing the numbering — it never rewrites or resets the
 * original attempts.
 */
export function nextAttemptNumber(existing: Pick<AssessmentAttempt, 'attemptNumber'>[]): number {
  return existing.reduce((max, a) => Math.max(max, a.attemptNumber), 0) + 1;
}

export interface AttemptGateInput {
  ordinaryAttemptLimit: number; // 3 for approved P&P
  usedOrdinaryAttempts: number;
  activeReattemptAuthorization: boolean;
}

/** Whether a new attempt may be started right now. */
export function canStartAttempt(input: AttemptGateInput): { allowed: boolean; reason?: string } {
  if (input.usedOrdinaryAttempts < input.ordinaryAttemptLimit) return { allowed: true };
  if (input.activeReattemptAuthorization) return { allowed: true };
  return { allowed: false, reason: 'ATTEMPT_LIMIT_REACHED' };
}

/* ------------------------------------------------------------------ *
 * Pass/fail on UNROUNDED percentage + critical errors (§8.3, §8.4).
 * ------------------------------------------------------------------ */

export function isPass(score: Pick<ScoreResult, 'rawEarned' | 'rawPossible' | 'criticalFailureCodes'>, thresholdPct: number): boolean {
  if (score.criticalFailureCodes.length > 0) return false; // critical error fails regardless of %
  if (score.rawPossible <= 0) throw new Error('SCORE_DENOMINATOR_MISSING');
  const pct = (score.rawEarned / score.rawPossible) * 100; // unrounded
  return pct >= thresholdPct;
}

/* ------------------------------------------------------------------ *
 * Grade selection by versioned policy (§8.2) — no global "highest".
 * ------------------------------------------------------------------ */

export interface GradableAttempt {
  attemptId: string;
  attemptNumber: number;
  passed: boolean;
  percentage: number;
}

export function selectGradedAttempt(
  attempts: GradableAttempt[],
  policy: AttemptSelectionPolicy,
): GradableAttempt | null {
  if (attempts.length === 0) return null;
  const byNumber = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const passes = byNumber.filter((a) => a.passed);
  switch (policy) {
    case 'FIRST_PASS':
      return passes[0] ?? null;
    case 'LATEST_PASS':
      return passes.length ? passes[passes.length - 1] : null;
    case 'HIGHEST_SCORE':
      return [...byNumber].sort((a, b) => b.percentage - a.percentage)[0];
    case 'LATEST_ATTEMPT':
      return byNumber[byNumber.length - 1];
    case 'EVALUATOR_DECISION':
    case 'ALL_COMPONENTS_REQUIRED':
      // Requires external evaluator/component inputs; not auto-selectable here.
      return null;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ *
 * Distinct-human signoff (§10.3): one human cannot fill two slots in a group.
 * ------------------------------------------------------------------ */

export function distinctHumanViolated(
  signoffs: Pick<SignoffRecord, 'signerSubjectId' | 'signerSlot' | 'distinctHumanGroup' | 'decision'>[],
): boolean {
  const seen = new Map<string, Set<string>>(); // group -> set of signerSubjectIds
  for (const s of signoffs) {
    if (s.decision !== 'APPROVE' || !s.distinctHumanGroup) continue;
    const set = seen.get(s.distinctHumanGroup) ?? new Set<string>();
    if (set.has(s.signerSubjectId)) return true; // same human, second slot in group
    set.add(s.signerSubjectId);
    seen.set(s.distinctHumanGroup, set);
  }
  return false;
}

/* ------------------------------------------------------------------ *
 * Certificate issuance requires a signed PASS gate (§11, §12, §24.2).
 * ------------------------------------------------------------------ */

export function canIssueCertificate(
  gate: Pick<GateDecision, 'gateType' | 'outcome' | 'assertionSignature' | 'expiresAt'>,
  now: Date,
): { allowed: boolean; reason?: string } {
  if (gate.gateType !== 'CERTIFICATE_ELIGIBILITY') return { allowed: false, reason: 'WRONG_GATE_TYPE' };
  if (gate.outcome !== 'PASS') return { allowed: false, reason: 'GATE_NOT_PASS' };
  if (!gate.assertionSignature) return { allowed: false, reason: 'GATE_UNSIGNED' };
  if (gate.expiresAt && new Date(gate.expiresAt).getTime() < now.getTime()) {
    return { allowed: false, reason: 'GATE_EXPIRED' };
  }
  return { allowed: true };
}

/**
 * A certificate must NEVER, on its own, be accepted as clearance (ADR-004/§3.5).
 * Clearance consumers must require a FIELD/SYSTEM clearance gate PASS instead.
 */
export function certificateGrantsClearance(): false {
  return false;
}

/** Evidence is only counted when server-VALIDATED (§3.1) — a local image is not valid. */
export function isEvidenceCountable(e: Pick<CompletionEvidence, 'status'>): boolean {
  return e.status === 'VALID';
}
