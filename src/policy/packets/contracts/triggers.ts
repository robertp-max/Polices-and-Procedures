/**
 * Workflow trigger evaluation contracts — §16.4, FR-011, FR-012, FR-015.
 * Pure types only. Zero runtime side effects.
 */

/**
 * FR-012 workflow decision states — EXACT PRD strings (12 states).
 * Em-dashes preserved.
 */
export const WORKFLOW_DECISION_STATES = [
  'NOT TRIGGERED',
  'CANDIDATE — NEEDS VALIDATION',
  'PENDING AUTHORIZED REVIEW',
  'CONFIRMED — NOT YET ACTIVATED',
  'ACTIVATED',
  'LINKED TO EXISTING ACTIVE WORKFLOW',
  'CONTINUED FROM PRIOR PERIOD',
  'BLOCKED',
  'ESCALATED',
  'SUSTAINMENT MONITORING',
  'CLOSED',
  'WORKFLOW UNRESOLVED',
] as const;

export type WorkflowDecisionState = (typeof WORKFLOW_DECISION_STATES)[number];

/** Human-configuration banner when no canonical workflow resolves (FR-012). */
export const WORKFLOW_UNRESOLVED_BANNER =
  'WORKFLOW UNRESOLVED — HUMAN CONFIGURATION REQUIRED' as const;

/**
 * FR-015 determination options — EXACT PRD strings.
 */
export const FR015_DETERMINATION_OPTIONS = [
  'No action',
  'Correct locally',
  'Monitor',
  'Open CAP',
  'Initiate RCA',
  'New PIP',
  'Continue existing PIP',
  'Revise existing PIP',
  'Move to sustainment',
  'Close',
  'Escalate to Governing Body',
] as const;

export type Fr015DeterminationOption = (typeof FR015_DETERMINATION_OPTIONS)[number];

/**
 * FR-015 PIP evaluation factors — each may be present or explicitly unknown.
 * Never coerce missing/unknown to zero.
 */
export interface PipEvaluationFactors {
  materiality: string | null;
  recurrence: string | null;
  trendDuration: string | null;
  controlLimitBehavior: string | null;
  patientSafetyImpact: string | null;
  regulatoryImpact: string | null;
  financialImpact: string | null;
  crossPatientStaffLocationScope: string | null;
  priorCorrectiveActions: string | null;
  existingPipCoverage: string | null;
  rootCauseEvidence: string | null;
  measurementFeasibility: string | null;
  qapiCommitteeAuthorization: string | null;
}

/**
 * FR-011 Finding model — every field required by the PRD.
 */
export interface PacketFinding {
  findingId: string;
  category: string;
  description: string;
  evidence: string[];
  sourceRecordIds: string[];
  sourceFormIds: string[];
  materiality: string | null;
  severity: string | null;
  scope: string | null;
  recurrence: string | null;
  currentState: string | null;
  priorPeriodRelationship: string | null;
  riskType: string | null;
  recommendedDecision: Fr015DeterminationOption | string | null;
  requiredHumanReviewer: string | null;
  relatedWorkflowTriggerEvaluationIds: string[];
  attachmentReferences: string[];
}

/**
 * §17.2 Workflow trigger lifecycle states (machine identity).
 * Distinct from FR-012 decision-state vocabulary on the evaluation record.
 */
export type TriggerLifecycleStatus =
  | 'CANDIDATE'
  | 'VALIDATED'
  | 'AUTHORIZED'
  | 'ACTIVATED'
  | 'IN_PROGRESS'
  | 'REMEASUREMENT'
  | 'SUSTAINMENT'
  | 'ESCALATION'
  | 'CLOSED';

/** Trigger type vocabulary from §16.4. */
export type TriggerType =
  | 'time-based'
  | 'event-based'
  | 'conditional'
  | 'continuous'
  | 'human-directed';

/** Validation status vocabulary from §16.4. */
export type TriggerValidationStatus =
  | 'validated'
  | 'provisional'
  | 'unknown'
  | 'conflicted';

/** Threshold operator vocabulary from §16.4. */
export type ThresholdOperator = '>=' | '<=' | '>' | '<' | '=';

/** §16.4 Workflow trigger evaluation — implement EXACTLY as specified. */
export interface WorkflowTriggerEvaluation {
  evaluationId: string;
  packetId: string;
  parentEventId: string;
  reportingPeriod: string;
  findingId: string;
  sourceRecordIds: string[];
  sourceFormIds: string[];
  sourceWorkflowIds: string[];
  triggerRuleId: string | null;
  triggerType: TriggerType;
  observedValue: number | string | null;
  numerator: number | null;
  denominator: number | null;
  threshold: number | string | null;
  thresholdOperator: ThresholdOperator | null;
  recurrenceWindow: string | null;
  canonicalWorkflowId: string | null;
  canonicalWorkflowTitle: string | null;
  workflowVersion: string | null;
  /** FR-012 decision state — exact vocabulary. */
  decisionState: WorkflowDecisionState;
  decisionRationale: string;
  validationStatus: TriggerValidationStatus;
  ownerRole: string | null;
  assignedUserId: string | null;
  approverRoles: string[];
  dueDate: string | null;
  requiredFormIds: string[];
  dependencyWorkflowIds: string[];
  blockerIds: string[];
  existingWorkflowInstanceId: string | null;
  newWorkflowInstanceId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  overrideReason: string | null;
  /** Implied extension — §17.2 lifecycle progress of this evaluation. */
  lifecycleStatus: TriggerLifecycleStatus;
  /** Implied extension — FR-015 determination when applicable. */
  determination: Fr015DeterminationOption | null;
  /** Implied extension — PIP factors when determination involves PIP. */
  pipEvaluationFactors: PipEvaluationFactors | null;
}
