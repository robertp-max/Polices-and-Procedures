// THE authoritative Governing Body tabletop LAUNCH GATE.
//
// Exactly one selector decides whether a tabletop attempt may start, resume, or
// restore. No button, card, route, deep link, or history-restore path may
// recompute eligibility independently — they all call `resolveTabletopLaunchGate`
// (or the `useTabletopLaunchGate` hook that wraps it). Duplicated eligibility
// logic is how a "locked" exercise becomes launchable from a second entry point.
//
// SCOPE NOTE — this is a LAUNCH standard, not a scoring change. The tabletop
// engine's own scoring model is untouched: quarterly 950/1000, annual 970/1000,
// and the critical-error override all still decide whether an ATTEMPT passes.
// This gate only decides whether the attempt may begin.

import {
  isPrivilegedAccessMode,
  type PrivilegedAccessMode,
  type TabletopAccessMode,
} from '../compliance/accessMode';
import { MODULE_MASTERY_STANDARD } from '../compliance/complianceCatalog';
import { isLocalDemoLearnerId } from '../compliance/complianceIdentity';
import type {
  ComplianceAssignment,
  ComplianceAssignmentView,
  ComplianceEvidenceRecord,
} from '../compliance/complianceTypes';

/** Required Governing Body training modules. */
export const REQUIRED_TRAINING_COUNT = 13 as const;

/**
 * Every PREREQUISITE assessment must be a perfect score before an official
 * tabletop may start.
 *
 * The catalog and assessment players use the same 100% prerequisite standard,
 * so completion copy and launch eligibility cannot contradict one another.
 */
export const LAUNCH_ASSESSMENT_STANDARD_PERCENT = 100 as const;

/** Sanity reference used by tests to keep the catalog and launch gate aligned. */
export const CONFLICTING_MODULE_COMPLETION_STANDARD = MODULE_MASTERY_STANDARD;

export type TabletopLaunchBlockerType =
  | 'training'
  | 'training_assessment'
  | 'policy'
  | 'policy_assessment'
  | 'acknowledgment'
  | 'attestation'
  | 'evidence';

export interface TabletopLaunchBlocker {
  id: string;
  type: TabletopLaunchBlockerType;
  title: string;
  currentStatus: string;
  requiredStatus: string;
  /** Canonical governance hash route so the modal can deep-link. */
  destination: string;
}

export interface TabletopLaunchGate {
  allowed: boolean;
  accessMode: TabletopAccessMode;
  completedTrainingCount: number;
  requiredTrainingCount: typeof REQUIRED_TRAINING_COUNT;
  completedPolicyCount: number;
  requiredPolicyCount: number;
  /** Prerequisite assessments (training + course) scored at exactly 100%. */
  perfectAssessmentCount: number;
  requiredAssessmentCount: number;
  evidenceVerified: boolean;
  blockers: TabletopLaunchBlocker[];
}

export interface TabletopLaunchGateInput {
  /** Resolved compliance views for the AUTHENTICATED learner. */
  views: ComplianceAssignmentView[];
  /** Official evidence snapshot (identity-bound records only are counted). */
  officialEvidence: readonly ComplianceEvidenceRecord[];
  learnerId: string;
  /** False when the evidence service is disconnected (preview build). */
  evidenceConnected: boolean;
  /** Privileged tier held by the authenticated identity, if any. */
  privilegedMode?: PrivilegedAccessMode | null;
}

const BLOCKER_ORDER: TabletopLaunchBlockerType[] = [
  'evidence',
  'training',
  'training_assessment',
  'policy',
  'acknowledgment',
  'attestation',
  'policy_assessment',
];

// ---------------------------------------------------------------------------
// Canonical destinations
// ---------------------------------------------------------------------------

/** `gb:policy:REQ-123` → `REQ-123`. */
function requirementIdOf(assignment: ComplianceAssignment): string {
  return assignment.assignmentId.replace(/^gb:policy:/, '');
}

export function destinationFor(assignment: ComplianceAssignment): string {
  switch (assignment.type) {
    case 'training_module':
      return `#compliance/training/module/${assignment.sourceId}`;
    case 'policy_reading':
      return `#compliance/policies/requirement/${requirementIdOf(assignment)}`;
    case 'course_assessment':
      return `#compliance/policies/assessment/${assignment.sourceId}`;
    default:
      return '#compliance/required';
  }
}

// ---------------------------------------------------------------------------
// Identity-bound evidence resolution
// ---------------------------------------------------------------------------

/**
 * The latest OFFICIAL, identity-bound, non-privileged completion record for an
 * assignment. Preview/demo/privileged/cross-user/failed records are excluded —
 * they must never count toward a launch prerequisite.
 */
export function officialLaunchRecordFor(
  assignment: ComplianceAssignment,
  officialEvidence: readonly ComplianceEvidenceRecord[],
  learnerId: string,
): ComplianceEvidenceRecord | undefined {
  if (isLocalDemoLearnerId(learnerId)) return undefined;
  return officialEvidence
    .filter(
      (r) =>
        r.assignmentId === assignment.assignmentId &&
        // Cross-user evidence never satisfies another learner's requirement.
        r.learnerId === learnerId &&
        !isLocalDemoLearnerId(r.learnerId) &&
        // A privileged preview attempt is not official evidence.
        !isPrivilegedAccessMode(r.privilegedAccessMode) &&
        r.completedAt !== null &&
        r.attestedAt !== null &&
        r.criticalErrors.length === 0 &&
        (r.outcome === 'passed' || r.outcome === 'completed'),
    )
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))[0];
}

/** Percent score of a record whose scale is percentage-based, else null. */
function percentScore(record: ComplianceEvidenceRecord | undefined): number | null {
  if (!record || record.score === null) return null;
  if (record.scoreScale === 'points_1000') {
    if (!record.scoreMaximum) return null;
    return (record.score / record.scoreMaximum) * 100;
  }
  if (record.scoreMaximum && record.scoreMaximum !== 100) {
    return (record.score / record.scoreMaximum) * 100;
  }
  return record.score;
}

function isPerfect(record: ComplianceEvidenceRecord | undefined): boolean {
  const pct = percentScore(record);
  return pct !== null && pct >= LAUNCH_ASSESSMENT_STANDARD_PERCENT;
}

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

/**
 * Official launch requires ALL of the following, verified for the AUTHENTICATED
 * learner against identity-bound official evidence:
 *   1. all 13 required training modules complete;
 *   2. every required training assessment passed at 100%;
 *   3. all assigned Governing Body policies read;
 *   4. every required acknowledgment complete;
 *   5. every required policy (course) assessment passed at 100%;
 *   6. required attestations complete;
 *   7. official, identity-bound evidence exists for every prerequisite; and
 *   8. NO preview / demo / local-only / disconnected / failed / privileged /
 *      cross-user evidence counted toward any of the above.
 *
 * A privileged tier short-circuits to `allowed: true` — but remains preview
 * access everywhere else (see compliance/accessMode.ts).
 */
export function resolveTabletopLaunchGate(input: TabletopLaunchGateInput): TabletopLaunchGate {
  const { views, officialEvidence, learnerId, evidenceConnected } = input;
  const privilegedMode = input.privilegedMode ?? null;

  const nonTabletop = views.filter((v) => v.assignment.type !== 'tabletop' && v.assignment.required);
  const trainingViews = nonTabletop.filter((v) => v.assignment.type === 'training_module');
  const policyViews = nonTabletop.filter((v) => v.assignment.type === 'policy_reading');
  const courseAssessmentViews = nonTabletop.filter((v) => v.assignment.type === 'course_assessment');

  const previewOnly = !evidenceConnected || isLocalDemoLearnerId(learnerId) || !learnerId;

  const recordOf = (v: ComplianceAssignmentView): ComplianceEvidenceRecord | undefined =>
    previewOnly ? undefined : officialLaunchRecordFor(v.assignment, officialEvidence, learnerId);

  const blockers: TabletopLaunchBlocker[] = [];
  const push = (b: TabletopLaunchBlocker): void => {
    blockers.push(b);
  };

  // 8 / 7 — evidence boundary first: without a connected, identity-bound
  // evidence service nothing below can be officially verified.
  if (!evidenceConnected) {
    push({
      id: 'evidence:service',
      type: 'evidence',
      title: 'Official compliance evidence service',
      currentStatus: 'Not connected — preview only',
      requiredStatus: 'Connected, with an official record for every prerequisite',
      destination: '#compliance/required',
    });
  } else if (previewOnly) {
    push({
      id: 'evidence:identity',
      type: 'evidence',
      title: 'Authenticated Governing Body identity',
      currentStatus: 'Local preview identity — evidence cannot be identity-bound',
      requiredStatus: 'Signed in as your own Governing Body account',
      destination: '#compliance/required',
    });
  }

  // 1 & 2 — training modules and their assessments.
  let completedTrainingCount = 0;
  let perfectAssessmentCount = 0;
  for (const v of trainingViews) {
    const record = recordOf(v);
    const complete = v.officiallyComplete && Boolean(record);
    if (complete) completedTrainingCount += 1;
    if (!complete) {
      push({
        id: v.assignment.assignmentId,
        type: 'training',
        title: v.assignment.title,
        currentStatus: v.statusLabel,
        requiredStatus: 'Completed with official evidence',
        destination: destinationFor(v.assignment),
      });
      continue;
    }
    if (v.assignment.passStandard !== null) {
      if (isPerfect(record)) perfectAssessmentCount += 1;
      else {
        const pct = percentScore(record);
        push({
          id: `${v.assignment.assignmentId}:assessment`,
          type: 'training_assessment',
          title: `${v.assignment.title} — module assessment`,
          currentStatus: pct === null ? 'No official score recorded' : `Scored ${Math.round(pct)}%`,
          requiredStatus: `${LAUNCH_ASSESSMENT_STANDARD_PERCENT}%`,
          destination: destinationFor(v.assignment),
        });
      }
    }
  }
  if (trainingViews.length < REQUIRED_TRAINING_COUNT) {
    push({
      id: 'training:catalog',
      type: 'training',
      title: 'Required Governing Body training modules',
      currentStatus: `${trainingViews.length} of ${REQUIRED_TRAINING_COUNT} assigned`,
      requiredStatus: `${REQUIRED_TRAINING_COUNT} assigned and complete`,
      destination: '#compliance/training',
    });
  }

  // 3, 4 & 6 — policy readings, their acknowledgments, and attestations.
  let completedPolicyCount = 0;
  for (const v of policyViews) {
    const record = recordOf(v);
    const complete = v.officiallyComplete && Boolean(record);
    if (complete) completedPolicyCount += 1;
    if (!complete) {
      push({
        id: v.assignment.assignmentId,
        type: 'policy',
        title: v.assignment.title,
        currentStatus: v.statusLabel,
        requiredStatus: 'Read, acknowledged, and attested with official evidence',
        destination: destinationFor(v.assignment),
      });
      continue;
    }
    if (record && record.readCompletedAt === null) {
      push({
        id: `${v.assignment.assignmentId}:acknowledgment`,
        type: 'acknowledgment',
        title: `${v.assignment.title} — acknowledgment`,
        currentStatus: 'Not acknowledged',
        requiredStatus: 'Acknowledged',
        destination: destinationFor(v.assignment),
      });
    }
    if (record && record.attestedAt === null) {
      push({
        id: `${v.assignment.assignmentId}:attestation`,
        type: 'attestation',
        title: `${v.assignment.title} — attestation`,
        currentStatus: 'Not attested',
        requiredStatus: 'Attested',
        destination: destinationFor(v.assignment),
      });
    }
  }

  // 5 — course (policy) assessments at 100%.
  for (const v of courseAssessmentViews) {
    const record = recordOf(v);
    const complete = v.officiallyComplete && Boolean(record);
    if (complete && isPerfect(record)) {
      perfectAssessmentCount += 1;
      continue;
    }
    const pct = complete ? percentScore(record) : null;
    push({
      id: `${v.assignment.assignmentId}:assessment`,
      type: 'policy_assessment',
      title: v.assignment.title,
      currentStatus: complete
        ? pct === null
          ? 'No official score recorded'
          : `Scored ${Math.round(pct)}%`
        : v.statusLabel,
      requiredStatus: `${LAUNCH_ASSESSMENT_STANDARD_PERCENT}%`,
      destination: destinationFor(v.assignment),
    });
  }

  const requiredAssessmentCount =
    trainingViews.filter((v) => v.assignment.passStandard !== null).length + courseAssessmentViews.length;

  blockers.sort((a, b) => BLOCKER_ORDER.indexOf(a.type) - BLOCKER_ORDER.indexOf(b.type));

  const evidenceVerified =
    evidenceConnected &&
    !previewOnly &&
    nonTabletop.length > 0 &&
    nonTabletop.every((v) => Boolean(recordOf(v)));

  const prerequisitesMet =
    blockers.length === 0 &&
    evidenceVerified &&
    completedTrainingCount >= REQUIRED_TRAINING_COUNT &&
    completedPolicyCount === policyViews.length &&
    perfectAssessmentCount === requiredAssessmentCount;

  const accessMode: TabletopAccessMode = privilegedMode ?? (prerequisitesMet ? 'official' : 'blocked');

  return {
    // A privileged tier bypasses prerequisites for LAUNCH only.
    allowed: privilegedMode !== null || prerequisitesMet,
    accessMode,
    completedTrainingCount,
    requiredTrainingCount: REQUIRED_TRAINING_COUNT,
    completedPolicyCount,
    requiredPolicyCount: policyViews.length,
    perfectAssessmentCount,
    requiredAssessmentCount,
    evidenceVerified,
    blockers,
  };
}
