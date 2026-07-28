// Runtime compliance contract for the Governing Body portal (V3).
//
// This layer is intentionally SEPARATE from the generated policy-journey and
// academy data. Generated files describe REQUIREMENTS only and carry no learner
// state. Learner assignment + evidence state lives here, at runtime, and the
// authoritative evidence record is produced only by a connected evidence
// service (see complianceEvidenceAdapter.ts). localStorage may hold an
// unfinished draft/resume state but is never the authoritative record.

export type ComplianceRole = 'GB';

export type ComplianceAssignmentType =
  | 'training_module'
  | 'policy_reading'
  | 'course_assessment'
  | 'tabletop';

/**
 * Stored assignment status. Matches the delivered contract exactly.
 * Note `due_soon` and `additional_validation_pending` are DERIVED user-facing
 * states (see UserFacingStatus) and are not persisted here.
 */
export type ComplianceAssignmentStatus =
  | 'not_started'
  | 'in_progress'
  | 'overdue'
  | 'blocked'
  | 'remediation_required'
  | 'completed';

/** The only states shown to the user. Superset of the stored status. */
export type UserFacingStatus =
  | 'required_not_started'
  | 'in_progress'
  | 'due_soon'
  | 'overdue'
  | 'additional_validation_pending'
  | 'blocked'
  | 'remediation_required'
  | 'completed';

export const USER_FACING_STATUS_LABEL: Record<UserFacingStatus, string> = {
  required_not_started: 'Required — not started',
  in_progress: 'In progress',
  due_soon: 'Due soon',
  overdue: 'Overdue',
  additional_validation_pending: 'Additional validation pending',
  blocked: 'Blocked — source or approval issue',
  remediation_required: 'Remediation required',
  completed: 'Completed',
};

export interface ComplianceAssignment {
  assignmentId: string;
  learnerId: string;
  role: ComplianceRole;
  type: ComplianceAssignmentType;
  sourceId: string;
  title: string;
  required: boolean;
  assignedAt: string;
  dueAt: string | null;
  recurrence: string | null;
  status: ComplianceAssignmentStatus;
  progressPercent: number;
  passStandard: number | null;
  attemptCount: number;
  lastActivityAt: string | null;
  blockerReason: string | null;
}

export type ComplianceSourceType = 'module' | 'policy' | 'course_quiz' | 'tabletop';

export type RemediationPath = 'none' | 'primary_retry' | 'true_false_forensic' | 'guided_true_false';

/**
 * Explicit attempt outcome, decided BY THE SCORING ENGINE at submit time in the
 * engine's own scoring unit. A failed attempt is preserved as evidence and
 * remediation history, but it must NEVER satisfy completion — completion
 * requires `outcome === 'passed'` (see complianceSelectors.isOfficiallyComplete).
 */
export type EvidenceOutcome = 'passed' | 'failed';

export interface ComplianceEvidenceRecord {
  evidenceId: string;
  assignmentId: string;
  learnerId: string;
  role: ComplianceRole;
  sourceId: string;
  sourceType: ComplianceSourceType;
  sourceVersion: string | null;
  effectiveDate: string | null;
  readCompletedAt: string | null;
  attestedAt: string | null;
  answersSnapshot: unknown;
  score: number | null;
  /**
   * The engine-decided pass/fail result. Required. `score` alone is not a
   * completion decision — scales differ per source type (percent for modules
   * and course quizzes, points-of-1000 for tabletops).
   */
  outcome: EvidenceOutcome;
  criticalErrors: string[];
  attemptNumber: number;
  remediationPath: RemediationPath;
  activeTimeSeconds: number;
  completedAt: string | null;
  integrityHash: string | null;
}

/**
 * Grouping used by the course-first "Policies & Procedures" experience.
 * Derived at runtime; not persisted.
 */
export interface ComplianceCourseGroup {
  courseId: string;
  courseTitle: string;
  passStandard: number | null;
  recurrence: string | null;
  policyAssignmentIds: string[];
  courseAssessmentId: string;
}

/** A convenience view combining an assignment with its derived display state. */
export interface ComplianceAssignmentView {
  assignment: ComplianceAssignment;
  userFacingStatus: UserFacingStatus;
  statusLabel: string;
  /** True only when a connected evidence service holds a passing, complete record. */
  officiallyComplete: boolean;
  /** A locally-saved draft exists (resume state), which is NOT completion. */
  hasLocalDraft: boolean;
}
