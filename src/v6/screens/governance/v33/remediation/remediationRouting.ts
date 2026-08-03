// Shared first-failure remediation routing contract (§6).
//
// This is the ONE place that names the three post-failure paths a learner can
// take after not meeting the standard on a first attempt — a training module
// challenge, a course assessment, or the final tabletop. Callers in each of
// those engines show RemediationChoiceModal, then call openRemediation() to
// decide which surface to mount; none of them re-invent this contract.
//
// Note on evidence typing: the canonical ComplianceEvidenceRecord enum
// (see ../compliance/complianceTypes.ts) only names 'true_false_forensic' for
// a True/False remediation path — it predates this low-friction guided path.
// GuidedTrueFalsePlayer intentionally records the more precise
// 'guided_true_false' value and passes the evidence payload through the same
// `as never` cast already used at every commitEvidence() call site in this
// codebase (see CourseAssessmentPlayer / TrueFalseForensicPlayer). This keeps
// the audit trail honest about which remediation actually ran without
// requiring an edit to the compliance layer, which is out of scope here.

/** The choice offered to a learner who did not meet the standard on attempt 1. */
export type RemediationPath = 'try_again' | 'guided_true_false' | 'review_sections';

/** Which surface the host screen should mount for a given choice. */
export type RemediationSurface =
  | 'primary_retry'
  | 'guided_true_false_player'
  | 'controlling_sections';

export interface RemediationChoiceContext {
  path: RemediationPath;
  assignmentId: string;
  sourceId: string;
  /** Concept ids the primary attempt missed, used to target the guided set. */
  missedConceptIds: string[];
}

/** Pure mapping from a learner's choice to the surface a host screen shows. */
export function openRemediation(context: RemediationChoiceContext): RemediationSurface {
  switch (context.path) {
    case 'try_again':
      return 'primary_retry';
    case 'guided_true_false':
      return 'guided_true_false_player';
    case 'review_sections':
      return 'controlling_sections';
    default:
      return 'primary_retry';
  }
}

/**
 * Outcome record for a completed guided True/False remediation session.
 * This is a routing/analytics-shape record, distinct from (and narrower than)
 * the authoritative ComplianceEvidenceRecord that GuidedTrueFalsePlayer commits
 * via complianceStore — it is what a host screen can log or display inline
 * without reaching into the evidence snapshot.
 */
export interface RemediationResult {
  remediationPath: 'guided_true_false';
  /** Score (0–100) on the primary attempt that triggered remediation. */
  primaryAttemptScore: number;
  /** Ids of every guided item assigned this session. */
  remediationItemsAssigned: string[];
  /** Ids of assigned items the learner got wrong on the first pass but then corrected. */
  remediationItemsCorrected: string[];
  /** Whether the single final changed-facts transfer item was answered correctly. */
  transferPassed: boolean;
}
