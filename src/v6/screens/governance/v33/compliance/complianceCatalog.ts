// Derives the Governing Body compliance assignment set from the generated
// REQUIREMENT data (academy modules + policy-journey), with no learner state.
// Learner state is layered on afterwards from drafts + official evidence.

import { MODULES } from '../gb-academy/academyData';
import { getPolicyJourney } from '../generated/policyJourney.generated';
import type {
  ComplianceAssignment,
  ComplianceCourseGroup,
} from './complianceTypes';

export const DEFAULT_LEARNER_ID = 'gb-chair-local';
export const MODULE_MASTERY_STANDARD = 92;
export const TABLETOP_ASSIGNMENT_IDS = [
  'gb:tabletop2026:tabletop2026-q1',
  'gb:tabletop2026:tabletop2026-q2',
  'gb:tabletop2026:tabletop2026-q3',
  'gb:tabletop2026:tabletop2026-q4',
  'gb:tabletop2026:tabletop2026-annual',
] as const;
export const TABLETOP_ASSIGNMENT_ID = TABLETOP_ASSIGNMENT_IDS[0];
export const TABLETOP_PASS_STANDARD = 95;

export interface DeriveOptions {
  learnerId?: string;
  /** ISO timestamp used for assignedAt; injectable for deterministic tests. */
  now?: string;
}

function nowIso(opts: DeriveOptions): string {
  return opts.now ?? new Date().toISOString();
}

function baseAssignment(
  learnerId: string,
  assignedAt: string,
): Pick<ComplianceAssignment, 'learnerId' | 'role' | 'required' | 'assignedAt' | 'progressPercent' | 'attemptCount' | 'lastActivityAt'> {
  return {
    learnerId,
    role: 'GB',
    required: true,
    assignedAt,
    progressPercent: 0,
    attemptCount: 0,
    lastActivityAt: null,
  };
}

/** Training-module assignments, one per academy module (capstone included). */
export function deriveModuleAssignments(opts: DeriveOptions = {}): ComplianceAssignment[] {
  const learnerId = opts.learnerId ?? DEFAULT_LEARNER_ID;
  const assignedAt = nowIso(opts);
  return MODULES.map((module) => ({
    ...baseAssignment(learnerId, assignedAt),
    assignmentId: `gb:module:${module.id}`,
    type: 'training_module',
    sourceId: module.id,
    title: module.title,
    dueAt: null,
    recurrence: null,
    status: module.available === false ? 'blocked' : 'not_started',
    passStandard: MODULE_MASTERY_STANDARD,
    blockerReason: module.available === false ? 'Module source not yet released for official completion.' : null,
  }));
}

/**
 * Policy-reading + course-assessment assignments, grouped course-first.
 * Held/blocked courses keep visible assignments with a plain-language reason.
 */
export function derivePolicyAssignments(opts: DeriveOptions = {}): {
  assignments: ComplianceAssignment[];
  courseGroups: ComplianceCourseGroup[];
} {
  const learnerId = opts.learnerId ?? DEFAULT_LEARNER_ID;
  const assignedAt = nowIso(opts);
  const journey = getPolicyJourney('GB');

  const assignments: ComplianceAssignment[] = [];
  const groupsByCourse = new Map<string, ComplianceCourseGroup>();

  for (const req of journey.requirements) {
    const blocked = req.release.state === 'hold' || req.release.state === 'partial_hold' || req.activation.mode === 'blocked';
    const blockerReason = blocked
      ? req.activation.mode === 'blocked'
        ? 'Assignment activates only when its triggering condition applies.'
        : 'Course is held pending source or owner-approval reconciliation.'
      : null;

    const policyAssignment: ComplianceAssignment = {
      ...baseAssignment(learnerId, assignedAt),
      assignmentId: `gb:policy:${req.requirementId}`,
      type: 'policy_reading',
      sourceId: req.policyId,
      title: req.policyTitle.replace(' (absent from generated library)', ''),
      dueAt: null,
      recurrence: req.schedule.recurrenceRaw || null,
      status: blocked ? 'blocked' : 'not_started',
      passStandard: null,
      blockerReason,
    };
    assignments.push(policyAssignment);

    let group = groupsByCourse.get(req.courseId);
    if (!group) {
      group = {
        courseId: req.courseId,
        courseTitle: req.courseTitle,
        passStandard: req.evidenceRequirements.passScorePercent || null,
        recurrence: req.schedule.recurrenceRaw || null,
        policyAssignmentIds: [],
        courseAssessmentId: `gb:course-assessment:${req.courseId}`,
      };
      groupsByCourse.set(req.courseId, group);
    }
    group.policyAssignmentIds.push(policyAssignment.assignmentId);
  }

  // One course assessment per course; unlocks only after its policies complete.
  for (const group of groupsByCourse.values()) {
    assignments.push({
      ...baseAssignment(learnerId, assignedAt),
      assignmentId: group.courseAssessmentId,
      type: 'course_assessment',
      sourceId: group.courseId,
      title: `${group.courseTitle} — course assessment`,
      dueAt: null,
      recurrence: group.recurrence,
      status: 'not_started',
      passStandard: group.passStandard,
      blockerReason: null,
    });
  }

  return { assignments, courseGroups: [...groupsByCourse.values()] };
}

const TABLETOP_PACKS: Array<{ assignmentId: string; sourceId: string; title: string; passStandard: number }> = [
  { assignmentId: TABLETOP_ASSIGNMENT_IDS[0], sourceId: 'tabletop2026-q1', title: 'Q1 2026 Governing Body tabletop — synthetic QAPI readiness exercise', passStandard: TABLETOP_PASS_STANDARD },
  { assignmentId: TABLETOP_ASSIGNMENT_IDS[1], sourceId: 'tabletop2026-q2', title: 'Q2 2026 Governing Body tabletop — synthetic QAPI readiness exercise', passStandard: TABLETOP_PASS_STANDARD },
  { assignmentId: TABLETOP_ASSIGNMENT_IDS[2], sourceId: 'tabletop2026-q3', title: 'Q3 2026 Governing Body tabletop — synthetic QAPI readiness exercise', passStandard: TABLETOP_PASS_STANDARD },
  { assignmentId: TABLETOP_ASSIGNMENT_IDS[3], sourceId: 'tabletop2026-q4', title: 'Q4 2026 Governing Body tabletop — synthetic QAPI readiness exercise', passStandard: TABLETOP_PASS_STANDARD },
  { assignmentId: TABLETOP_ASSIGNMENT_IDS[4], sourceId: 'tabletop2026-annual', title: 'Annual 2026 Governing Body tabletop — synthetic QAPI readiness capstone', passStandard: TABLETOP_PASS_STANDARD },
];

/** Required 2026 synthetic QAPI tabletop packs. */
export function deriveTabletopAssignments(opts: DeriveOptions = {}): ComplianceAssignment[] {
  const learnerId = opts.learnerId ?? DEFAULT_LEARNER_ID;
  const assignedAt = nowIso(opts);
  return TABLETOP_PACKS.map((pack) => ({
    ...baseAssignment(learnerId, nowIso(opts)),
    assignedAt,
    assignmentId: pack.assignmentId,
    type: 'tabletop',
    sourceId: pack.sourceId,
    title: pack.title,
    dueAt: null,
    recurrence: 'Required before Agency Readiness Date',
    status: 'not_started',
    passStandard: pack.passStandard,
    blockerReason: null,
  }));
}

/** Backward-compatible helper for older callers that expected one tabletop. */
export function deriveTabletopAssignment(opts: DeriveOptions = {}): ComplianceAssignment {
  return deriveTabletopAssignments(opts)[0];
}

export interface GbComplianceCatalog {
  assignments: ComplianceAssignment[];
  courseGroups: ComplianceCourseGroup[];
}

/** Full GB assignment catalog: modules + policies + course assessments + tabletop. */
export function deriveGbCatalog(opts: DeriveOptions = {}): GbComplianceCatalog {
  const modules = deriveModuleAssignments(opts);
  const { assignments: policies, courseGroups } = derivePolicyAssignments(opts);
  const tabletop = deriveTabletopAssignments(opts);
  return {
    assignments: [...modules, ...policies, ...tabletop],
    courseGroups,
  };
}
