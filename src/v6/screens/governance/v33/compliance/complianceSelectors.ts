// Unified compliance selectors. Single source of truth for "what must I do
// now?", summary cards, and completion — combining the derived catalog with
// local drafts and OFFICIAL evidence. Completion is decided only by a passing,
// complete official evidence record; a local (even "submitted") draft never
// counts.

import { getOfficialEvidence, readDraft } from './complianceStore';
import type {
  ComplianceAssignment,
  ComplianceAssignmentView,
  ComplianceCourseGroup,
  ComplianceEvidenceRecord,
  UserFacingStatus,
} from './complianceTypes';
import { USER_FACING_STATUS_LABEL } from './complianceTypes';

/** Ordering used by "Continue next requirement" and the Required Now list. */
const PRIORITY_ORDER: UserFacingStatus[] = [
  'overdue',
  'due_soon',
  'in_progress',
  'required_not_started',
  'additional_validation_pending',
  'remediation_required',
  'blocked',
  'completed',
];

function officialRecordFor(assignmentId: string): ComplianceEvidenceRecord | undefined {
  // The latest completed record for this assignment, if any.
  return getOfficialEvidence()
    .filter((r) => r.assignmentId === assignmentId && r.completedAt !== null)
    .sort((a, b) => (a.completedAt! < b.completedAt! ? 1 : -1))[0];
}

/**
 * Authoritative completion test. Requires a connected-service record that is
 * read/attested, meets the pass standard, and has zero critical errors.
 * NEVER derived from a submitted draft.
 */
export function isOfficiallyComplete(assignment: ComplianceAssignment): boolean {
  const record = officialRecordFor(assignment.assignmentId);
  if (!record || record.completedAt === null) return false;
  if (record.criticalErrors.length > 0) return false;
  if (record.attestedAt === null) return false;
  if (assignment.passStandard !== null) {
    if (record.score === null || record.score < assignment.passStandard) return false;
  }
  return true;
}

function isDueSoon(dueAt: string | null, now: number): boolean {
  if (!dueAt) return false;
  const due = Date.parse(dueAt);
  if (Number.isNaN(due)) return false;
  const days = (due - now) / 86_400_000;
  return days >= 0 && days <= 7;
}

export function deriveUserFacingStatus(assignment: ComplianceAssignment, now = Date.now()): UserFacingStatus {
  if (isOfficiallyComplete(assignment)) return 'completed';
  if (assignment.status === 'blocked') return 'blocked';
  if (assignment.status === 'remediation_required') return 'remediation_required';

  const draft = readDraft(assignment.assignmentId);
  // Submitted locally but no official record yet → honest "validation pending".
  if (draft?.submittedLocally) return 'additional_validation_pending';
  if (assignment.status === 'overdue') return 'overdue';
  if (isDueSoon(assignment.dueAt, now)) return 'due_soon';
  if (assignment.status === 'in_progress' || (draft && draft.progressPercent > 0)) return 'in_progress';
  return 'required_not_started';
}

export function resolveAssignmentView(assignment: ComplianceAssignment, now = Date.now()): ComplianceAssignmentView {
  const officiallyComplete = isOfficiallyComplete(assignment);
  const userFacingStatus = deriveUserFacingStatus(assignment, now);
  return {
    assignment,
    userFacingStatus,
    statusLabel: USER_FACING_STATUS_LABEL[userFacingStatus],
    officiallyComplete,
    hasLocalDraft: readDraft(assignment.assignmentId) !== null,
  };
}

export function resolveViews(assignments: ComplianceAssignment[], now = Date.now()): ComplianceAssignmentView[] {
  return assignments.map((a) => resolveAssignmentView(a, now));
}

/** The single highest-priority requirement to resume, or null if all complete. */
export function nextRequirement(views: ComplianceAssignmentView[]): ComplianceAssignmentView | null {
  const actionable = views.filter((v) => v.userFacingStatus !== 'completed' && v.userFacingStatus !== 'blocked');
  if (!actionable.length) return null;
  actionable.sort((a, b) => PRIORITY_ORDER.indexOf(a.userFacingStatus) - PRIORITY_ORDER.indexOf(b.userFacingStatus));
  return actionable[0];
}

export function requiredNow(views: ComplianceAssignmentView[], limit = 5): ComplianceAssignmentView[] {
  return views
    .filter((v) => v.userFacingStatus !== 'completed')
    .sort((a, b) => PRIORITY_ORDER.indexOf(a.userFacingStatus) - PRIORITY_ORDER.indexOf(b.userFacingStatus))
    .slice(0, limit);
}

export interface ComplianceTypeSummary {
  completed: number;
  assigned: number;
}

export type TabletopSummary = 'locked' | 'available' | 'passed' | 'remediation_required';

export interface ComplianceSummary {
  training: ComplianceTypeSummary;
  policies: ComplianceTypeSummary; // policy readings + course assessments
  tabletop: TabletopSummary;
  overall: 'incomplete' | 'complete';
}

export function summarize(views: ComplianceAssignmentView[]): ComplianceSummary {
  const count = (pred: (v: ComplianceAssignmentView) => boolean): ComplianceTypeSummary => {
    const scoped = views.filter(pred);
    return { completed: scoped.filter((v) => v.officiallyComplete).length, assigned: scoped.length };
  };
  const training = count((v) => v.assignment.type === 'training_module');
  const policies = count((v) => v.assignment.type === 'policy_reading' || v.assignment.type === 'course_assessment');
  const tabletopView = views.find((v) => v.assignment.type === 'tabletop');

  let tabletop: TabletopSummary = 'locked';
  if (tabletopView) {
    if (tabletopView.officiallyComplete) tabletop = 'passed';
    else if (tabletopView.userFacingStatus === 'remediation_required') tabletop = 'remediation_required';
    // Available only once every non-tabletop required item is officially complete.
    else if (views.filter((v) => v.assignment.type !== 'tabletop').every((v) => v.officiallyComplete)) tabletop = 'available';
    else tabletop = 'locked';
  }

  const overall: ComplianceSummary['overall'] = views.every((v) => v.officiallyComplete) ? 'complete' : 'incomplete';
  return { training, policies, tabletop, overall };
}

// ---- Course-first completion ----------------------------------------------

export interface CourseProgress {
  courseId: string;
  courseTitle: string;
  policiesComplete: number;
  policiesTotal: number;
  attestationsComplete: number; // mirrors reading completion in this model
  assessmentComplete: boolean;
  /** Course assessment unlocks only when all required policies are complete. */
  assessmentUnlocked: boolean;
  complete: boolean;
}

export function courseProgress(
  group: ComplianceCourseGroup,
  viewById: Map<string, ComplianceAssignmentView>,
): CourseProgress {
  const policyViews = group.policyAssignmentIds.map((id) => viewById.get(id)).filter(Boolean) as ComplianceAssignmentView[];
  const policiesComplete = policyViews.filter((v) => v.officiallyComplete).length;
  const assessmentView = viewById.get(group.courseAssessmentId);
  const assessmentComplete = Boolean(assessmentView?.officiallyComplete);
  const assessmentUnlocked = policyViews.length > 0 && policiesComplete === policyViews.length;
  return {
    courseId: group.courseId,
    courseTitle: group.courseTitle,
    policiesComplete,
    policiesTotal: policyViews.length,
    attestationsComplete: policiesComplete,
    assessmentComplete,
    assessmentUnlocked,
    complete: assessmentUnlocked && assessmentComplete,
  };
}
