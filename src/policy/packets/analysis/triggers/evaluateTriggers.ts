import {
  WORKFLOW_UNRESOLVED_BANNER,
  type Fr015DeterminationOption,
  type PipEvaluationFactors,
  type ThresholdOperator,
  type TriggerLifecycleStatus,
  type TriggerType,
  type TriggerValidationStatus,
  type WorkflowDecisionState,
  type WorkflowTriggerEvaluation,
} from '@/policy/packets/contracts';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { WORKFLOWS } from '@/policy/data/workflows.generated';

export const WORKFLOW_CANDIDATE_CONFIDENCE_LEVELS = [
  'none',
  'low',
  'medium',
  'high',
] as const;

export type WorkflowCandidateConfidence =
  (typeof WORKFLOW_CANDIDATE_CONFIDENCE_LEVELS)[number];

export interface CanonicalWorkflowResolution {
  resolved: boolean;
  workflowId: string | null;
  workflowTitle: string | null;
  workflowVersion: string | null;
  requiredFormIds: string[];
  dependencyWorkflowIds: string[];
  ownerRole: string | null;
  approverRoles: string[];
  rationale: string;
}

export interface TriggerActivationPreconditions {
  agencyValidated: boolean;
  periodValidated: boolean;
  evidenceSupportsFinding: boolean;
  requiredValuesAvailable: boolean;
  recurrenceConditionsAvailable: boolean;
  recurrenceSatisfied: boolean | null;
  sourceConflictsInvalidateTrigger: boolean;
  requiredHumanConfirmationExists: boolean;
  activatingUserHasAuthority: boolean;
}

export interface WorkflowTriggerInput {
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
  candidateWorkflowId: string | null;
  candidateConfidence: WorkflowCandidateConfidence;
  triggerMet: boolean | null;
  preconditions: TriggerActivationPreconditions;
  ownerRole: string | null;
  assignedUserId: string | null;
  approverRoles: string[];
  dueDate: string | null;
  requiredFormIds: string[];
  dependencyWorkflowIds: string[];
  blockerIds: string[];
  existingWorkflowInstanceId: string | null;
  carryForwardWorkflowInstanceId: string | null;
  newWorkflowInstanceId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  overrideReason: string | null;
  determination: Fr015DeterminationOption | null;
  pipEvaluationFactors: PipEvaluationFactors | null;
}

function normalizeWorkflowReference(reference: string | null): string | null {
  if (reference === null) {
    return null;
  }
  const normalized = reference.trim();
  return normalized.length > 0 ? normalized : null;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function workflowExistsInLibraryAndGraph(workflowId: string): boolean {
  return WORKFLOWS[workflowId] !== undefined && WORKFLOW_GRAPH.workflowIds.includes(workflowId);
}

export function resolveCanonicalWorkflow(
  workflowReference: string | null,
): CanonicalWorkflowResolution {
  const normalized = normalizeWorkflowReference(workflowReference);
  if (normalized === null) {
    return {
      resolved: false,
      workflowId: null,
      workflowTitle: null,
      workflowVersion: null,
      requiredFormIds: [],
      dependencyWorkflowIds: [],
      ownerRole: null,
      approverRoles: [],
      rationale: WORKFLOW_UNRESOLVED_BANNER,
    };
  }

  const idMatch = workflowExistsInLibraryAndGraph(normalized) ? WORKFLOWS[normalized] : undefined;
  const titleMatch =
    idMatch ??
    Object.values(WORKFLOWS).find(
      (workflow) =>
        workflow.title === normalized && workflowExistsInLibraryAndGraph(workflow.id),
    );
  const workflow = titleMatch;

  if (workflow === undefined) {
    return {
      resolved: false,
      workflowId: null,
      workflowTitle: null,
      workflowVersion: null,
      requiredFormIds: [],
      dependencyWorkflowIds: [],
      ownerRole: null,
      approverRoles: [],
      rationale: WORKFLOW_UNRESOLVED_BANNER,
    };
  }

  return {
    resolved: true,
    workflowId: workflow.id,
    workflowTitle: workflow.title,
    workflowVersion: workflow.sourcePath,
    requiredFormIds: unique(workflow.requiredForms),
    dependencyWorkflowIds: unique(workflow.dependencies.map((dependency) => dependency.upstreamId)),
    ownerRole: workflow.roles.primary[0] ?? null,
    approverRoles: unique(workflow.roles.approval),
    rationale: `Resolved from canonical workflow library and graph: ${workflow.id} / ${workflow.title}.`,
  };
}

function compareValues(
  observedValue: number | string,
  threshold: number | string,
  operator: ThresholdOperator,
): boolean | null {
  if (typeof observedValue === 'number' && typeof threshold === 'number') {
    if (operator === '>=') {
      return observedValue >= threshold;
    }
    if (operator === '<=') {
      return observedValue <= threshold;
    }
    if (operator === '>') {
      return observedValue > threshold;
    }
    if (operator === '<') {
      return observedValue < threshold;
    }
    return observedValue === threshold;
  }

  if (operator === '=' && typeof observedValue === 'string' && typeof threshold === 'string') {
    return observedValue.trim() === threshold.trim();
  }

  return null;
}

export function evaluateThreshold(input: WorkflowTriggerInput): boolean | null {
  if (input.triggerMet !== null) {
    return input.triggerMet;
  }
  if (
    input.observedValue === null ||
    input.threshold === null ||
    input.thresholdOperator === null
  ) {
    return null;
  }
  return compareValues(input.observedValue, input.threshold, input.thresholdOperator);
}

function lifecycleForDecisionState(
  decisionState: WorkflowDecisionState,
): TriggerLifecycleStatus {
  switch (decisionState) {
    case 'ACTIVATED':
      return 'ACTIVATED';
    case 'LINKED TO EXISTING ACTIVE WORKFLOW':
    case 'CONTINUED FROM PRIOR PERIOD':
      return 'IN_PROGRESS';
    case 'ESCALATED':
      return 'ESCALATION';
    case 'SUSTAINMENT MONITORING':
      return 'SUSTAINMENT';
    case 'CLOSED':
      return 'CLOSED';
    case 'PENDING AUTHORIZED REVIEW':
      return 'AUTHORIZED';
    case 'CONFIRMED — NOT YET ACTIVATED':
      return 'VALIDATED';
    case 'BLOCKED':
    case 'CANDIDATE — NEEDS VALIDATION':
    case 'NOT TRIGGERED':
    case 'WORKFLOW UNRESOLVED':
      return 'CANDIDATE';
  }
}

function validationForDecisionState(
  decisionState: WorkflowDecisionState,
  input: WorkflowTriggerInput,
): TriggerValidationStatus {
  if (decisionState === 'WORKFLOW UNRESOLVED') {
    return 'unknown';
  }
  if (input.preconditions.sourceConflictsInvalidateTrigger) {
    return 'conflicted';
  }
  if (decisionState === 'BLOCKED') {
    return 'unknown';
  }
  if (
    decisionState === 'CANDIDATE — NEEDS VALIDATION' ||
    decisionState === 'PENDING AUTHORIZED REVIEW'
  ) {
    return 'provisional';
  }
  return 'validated';
}

function selectDecisionState(
  input: WorkflowTriggerInput,
  resolution: CanonicalWorkflowResolution,
  thresholdMet: boolean | null,
): WorkflowDecisionState {
  if (!resolution.resolved) {
    return 'WORKFLOW UNRESOLVED';
  }
  if (!input.preconditions.agencyValidated || !input.preconditions.periodValidated) {
    return 'BLOCKED';
  }
  if (!input.preconditions.evidenceSupportsFinding) {
    return 'CANDIDATE — NEEDS VALIDATION';
  }
  if (
    !input.preconditions.requiredValuesAvailable ||
    !input.preconditions.recurrenceConditionsAvailable ||
    thresholdMet === null
  ) {
    return 'BLOCKED';
  }
  if (input.preconditions.sourceConflictsInvalidateTrigger) {
    return 'BLOCKED';
  }
  if (!thresholdMet) {
    return 'NOT TRIGGERED';
  }
  if (input.preconditions.recurrenceSatisfied === false) {
    return 'NOT TRIGGERED';
  }
  if (input.existingWorkflowInstanceId !== null) {
    return 'LINKED TO EXISTING ACTIVE WORKFLOW';
  }
  if (input.carryForwardWorkflowInstanceId !== null) {
    return 'CONTINUED FROM PRIOR PERIOD';
  }
  if (
    !input.preconditions.requiredHumanConfirmationExists ||
    !input.preconditions.activatingUserHasAuthority
  ) {
    return 'PENDING AUTHORIZED REVIEW';
  }
  if (input.blockerIds.length > 0) {
    return 'BLOCKED';
  }
  if (input.determination === 'Escalate to Governing Body') {
    return 'ESCALATED';
  }
  if (input.determination === 'Move to sustainment') {
    return 'SUSTAINMENT MONITORING';
  }
  if (input.determination === 'Close') {
    return 'CLOSED';
  }
  if (input.newWorkflowInstanceId !== null) {
    return 'ACTIVATED';
  }
  return 'CONFIRMED — NOT YET ACTIVATED';
}

function buildDecisionRationale(
  input: WorkflowTriggerInput,
  resolution: CanonicalWorkflowResolution,
  decisionState: WorkflowDecisionState,
): string {
  if (decisionState === 'WORKFLOW UNRESOLVED') {
    const candidate =
      input.candidateWorkflowId === null
        ? ''
        : ` Candidate ${input.candidateWorkflowId} (${input.candidateConfidence} confidence) requires human configuration.`;
    return `${WORKFLOW_UNRESOLVED_BANNER}.${candidate}`;
  }
  if (decisionState === 'NOT TRIGGERED') {
    return input.preconditions.recurrenceSatisfied === false
      ? 'Trigger threshold was met, but recurrence condition was not met.'
      : 'Trigger rule evaluated below threshold; material non-trigger decisions still require rationale when applicable.';
  }
  if (decisionState === 'BLOCKED') {
    if (!input.preconditions.requiredValuesAvailable) {
      return 'Required trigger values are unavailable; workflow activation is held for validation.';
    }
    if (!input.preconditions.recurrenceConditionsAvailable) {
      return 'Required recurrence evidence is unavailable; workflow activation is held for validation.';
    }
    if (input.preconditions.sourceConflictsInvalidateTrigger) {
      return 'Source conflicts invalidate the trigger until reconciled.';
    }
    return 'Workflow activation preconditions are not fully satisfied.';
  }
  if (decisionState === 'LINKED TO EXISTING ACTIVE WORKFLOW') {
    return 'Deduplicated against an existing active workflow covering the same issue.';
  }
  if (decisionState === 'CONTINUED FROM PRIOR PERIOD') {
    return 'Carried forward from a prior reporting period instead of creating a new workflow.';
  }
  if (decisionState === 'PENDING AUTHORIZED REVIEW') {
    return 'Trigger is supported but requires authorized human confirmation before activation.';
  }
  return resolution.rationale;
}

export function evaluateWorkflowTrigger(
  input: WorkflowTriggerInput,
): WorkflowTriggerEvaluation {
  const resolution = resolveCanonicalWorkflow(input.canonicalWorkflowId);
  const thresholdMet = evaluateThreshold(input);
  const decisionState = selectDecisionState(input, resolution, thresholdMet);
  const requiredFormIds = unique([...resolution.requiredFormIds, ...input.requiredFormIds]);
  const dependencyWorkflowIds = unique([
    ...resolution.dependencyWorkflowIds,
    ...input.dependencyWorkflowIds,
  ]);

  return {
    evaluationId: input.evaluationId,
    packetId: input.packetId,
    parentEventId: input.parentEventId,
    reportingPeriod: input.reportingPeriod,
    findingId: input.findingId,
    sourceRecordIds: [...input.sourceRecordIds],
    sourceFormIds: [...input.sourceFormIds],
    sourceWorkflowIds: [...input.sourceWorkflowIds],
    triggerRuleId: input.triggerRuleId,
    triggerType: input.triggerType,
    observedValue: input.observedValue,
    numerator: input.numerator,
    denominator: input.denominator,
    threshold: input.threshold,
    thresholdOperator: input.thresholdOperator,
    recurrenceWindow: input.recurrenceWindow,
    canonicalWorkflowId: resolution.workflowId,
    canonicalWorkflowTitle: resolution.workflowTitle,
    workflowVersion: resolution.workflowVersion,
    decisionState,
    decisionRationale: buildDecisionRationale(input, resolution, decisionState),
    validationStatus: validationForDecisionState(decisionState, input),
    ownerRole: input.ownerRole ?? resolution.ownerRole,
    assignedUserId: input.assignedUserId,
    approverRoles: unique([...resolution.approverRoles, ...input.approverRoles]),
    dueDate: input.dueDate,
    requiredFormIds,
    dependencyWorkflowIds,
    blockerIds: [...input.blockerIds],
    existingWorkflowInstanceId: input.existingWorkflowInstanceId,
    newWorkflowInstanceId:
      decisionState === 'ACTIVATED' ? input.newWorkflowInstanceId : null,
    reviewedBy: input.reviewedBy,
    reviewedAt: input.reviewedAt,
    overrideReason: input.overrideReason,
    lifecycleStatus: lifecycleForDecisionState(decisionState),
    determination: input.determination,
    pipEvaluationFactors: input.pipEvaluationFactors,
  };
}
