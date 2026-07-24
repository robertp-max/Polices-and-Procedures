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
export const TABLETOP_ASSIGNMENT_ID = 'gb:tabletop:GB-FINAL-TABLETOP';
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

/** The single required final tabletop capstone. */
export function deriveTabletopAssignment(opts: DeriveOptions = {}): ComplianceAssignment {
  const learnerId = opts.learnerId ?? DEFAULT_LEARNER_ID;
  return {
    ...baseAssignment(learnerId, nowIso(opts)),
    assignmentId: TABLETOP_ASSIGNMENT_ID,
    type: 'tabletop',
    sourceId: 'GB-FINAL-TABLETOP',
    title: 'Final Governing Body Tabletop — Integrated Governance Under Pressure',
    dueAt: null,
    recurrence: null,
    status: 'not_started',
    passStandard: TABLETOP_PASS_STANDARD,
    blockerReason: null,
  };
}

export interface GbComplianceCatalog {
  assignments: ComplianceAssignment[];
  courseGroups: ComplianceCourseGroup[];
}

/** Full GB assignment catalog: modules + policies + course assessments + tabletop. */
export function deriveGbCatalog(opts: DeriveOptions = {}): GbComplianceCatalog {
  // The Boardroom Simulation (tabletop) is an OVERSIGHT exercise, not required
  // training — it is intentionally NOT part of the compliance catalog.
  const modules = deriveModuleAssignments(opts);
  const { assignments: policies, courseGroups } = derivePolicyAssignments(opts);
  return {
    assignments: [...modules, ...policies],
    courseGroups,
  };
}
