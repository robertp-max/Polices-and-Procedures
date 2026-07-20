import {
  buildWorkflowActivationKey,
  type Fr015DeterminationOption,
  type PacketFinding,
  type PipEvaluationFactors,
  type WorkflowDecisionState,
} from '@/policy/packets/contracts';

export const PIP_CANONICAL_WORKFLOW_ID = 'QA-WF-04' as const;

export const EXISTING_WORKFLOW_STATUSES = ['active', 'sustainment', 'closed'] as const;

export type ExistingWorkflowStatus = (typeof EXISTING_WORKFLOW_STATUSES)[number];

export interface ExistingWorkflowRecord {
  instanceId: string;
  agencyId: string;
  reportingPeriod: string;
  findingId: string;
  triggerRuleId: string;
  canonicalWorkflowId: string;
  rootIssueKey: string;
  status: ExistingWorkflowStatus;
}

export interface PipActivationPreconditions {
  agencyValidated: boolean;
  periodValidated: boolean;
  evidenceSupportsFinding: boolean;
  canonicalTriggerResolved: boolean;
  requiredValuesAndRecurrenceAvailable: boolean;
  sourceConflictsInvalidateTrigger: boolean;
  requiredHumanConfirmationExists: boolean;
  activatingUserHasAuthority: boolean;
}

export interface PipDecisionInput {
  agencyId: string;
  reportingPeriod: string;
  finding: PacketFinding;
  triggerRuleId: string;
  canonicalWorkflowId: string;
  rootIssueKey: string;
  factors: PipEvaluationFactors;
  existingWorkflows: ExistingWorkflowRecord[];
  preconditions: PipActivationPreconditions;
  requestedDetermination: Fr015DeterminationOption | null;
}

export interface PipDecision {
  findingId: string;
  rootIssueKey: string;
  determination: Fr015DeterminationOption;
  decisionState: WorkflowDecisionState;
  activationKey: string | null;
  existingWorkflowInstanceId: string | null;
  newWorkflowRequired: boolean;
  rationale: string;
  factors: PipEvaluationFactors;
}

function hasSubstantiveText(value: string | null): value is string {
  return value !== null && value.trim().length > 0;
}

function isAffirmativeAuthorization(value: string | null): boolean {
  if (!hasSubstantiveText(value)) {
    return false;
  }
  const normalized = value.toLowerCase();
  return !/(unknown|pending|absent|missing|not authorized|unauthorized|no approval|none)/.test(
    normalized,
  );
}

function hasMaterialPipFactors(finding: PacketFinding, factors: PipEvaluationFactors): boolean {
  return (
    hasSubstantiveText(finding.materiality) ||
    hasSubstantiveText(factors.materiality) ||
    hasSubstantiveText(factors.patientSafetyImpact) ||
    hasSubstantiveText(factors.regulatoryImpact) ||
    hasSubstantiveText(factors.financialImpact) ||
    hasSubstantiveText(factors.crossPatientStaffLocationScope)
  );
}

function hasRecurringPattern(finding: PacketFinding, factors: PipEvaluationFactors): boolean {
  return (
    hasSubstantiveText(finding.recurrence) ||
    hasSubstantiveText(factors.recurrence) ||
    hasSubstantiveText(factors.trendDuration) ||
    hasSubstantiveText(factors.controlLimitBehavior)
  );
}

function findExistingActiveWorkflow(
  input: PipDecisionInput,
): ExistingWorkflowRecord | null {
  return (
    input.existingWorkflows.find(
      (workflow) =>
        workflow.agencyId === input.agencyId &&
        workflow.canonicalWorkflowId === input.canonicalWorkflowId &&
        workflow.rootIssueKey === input.rootIssueKey &&
        workflow.status !== 'closed',
    ) ?? null
  );
}

function activationBlockers(input: PipDecisionInput): string[] {
  const blockers: string[] = [];
  if (!input.preconditions.agencyValidated) {
    blockers.push('Agency is not validated.');
  }
  if (!input.preconditions.periodValidated) {
    blockers.push('Reporting period is not validated.');
  }
  if (!input.preconditions.evidenceSupportsFinding) {
    blockers.push('Evidence does not yet support the finding.');
  }
  if (!input.preconditions.canonicalTriggerResolved) {
    blockers.push('Canonical trigger is unresolved.');
  }
  if (!input.preconditions.requiredValuesAndRecurrenceAvailable) {
    blockers.push('Required values or recurrence conditions are unavailable.');
  }
  if (input.preconditions.sourceConflictsInvalidateTrigger) {
    blockers.push('Source conflicts invalidate the trigger.');
  }
  if (!input.preconditions.requiredHumanConfirmationExists) {
    blockers.push('Required human confirmation is missing.');
  }
  if (!input.preconditions.activatingUserHasAuthority) {
    blockers.push('Activating user lacks authority.');
  }
  return blockers;
}

function buildActivationKey(input: PipDecisionInput): string {
  return buildWorkflowActivationKey({
    agency_id: input.agencyId,
    reporting_period: input.reportingPeriod,
    finding_id: input.finding.findingId,
    trigger_rule_id: input.triggerRuleId,
    canonical_workflow_id: input.canonicalWorkflowId,
  });
}

export function evaluatePipDecision(input: PipDecisionInput): PipDecision {
  const blockers = activationBlockers(input);
  if (blockers.length > 0) {
    return {
      findingId: input.finding.findingId,
      rootIssueKey: input.rootIssueKey,
      determination: 'Monitor',
      decisionState: 'BLOCKED',
      activationKey: null,
      existingWorkflowInstanceId: null,
      newWorkflowRequired: false,
      rationale: blockers.join(' '),
      factors: input.factors,
    };
  }

  const existingWorkflow = findExistingActiveWorkflow(input);
  if (existingWorkflow !== null) {
    const determination: Fr015DeterminationOption =
      existingWorkflow.status === 'sustainment'
        ? 'Move to sustainment'
        : 'Continue existing PIP';
    return {
      findingId: input.finding.findingId,
      rootIssueKey: input.rootIssueKey,
      determination,
      decisionState:
        existingWorkflow.status === 'sustainment'
          ? 'SUSTAINMENT MONITORING'
          : 'LINKED TO EXISTING ACTIVE WORKFLOW',
      activationKey: null,
      existingWorkflowInstanceId: existingWorkflow.instanceId,
      newWorkflowRequired: false,
      rationale: 'Existing active workflow covers the same root issue; no new PIP is created.',
      factors: input.factors,
    };
  }

  if (input.requestedDetermination === 'Escalate to Governing Body') {
    return {
      findingId: input.finding.findingId,
      rootIssueKey: input.rootIssueKey,
      determination: 'Escalate to Governing Body',
      decisionState: 'ESCALATED',
      activationKey: null,
      existingWorkflowInstanceId: null,
      newWorkflowRequired: false,
      rationale: 'Material issue requires Governing Body escalation before PIP activation.',
      factors: input.factors,
    };
  }

  const qapiAuthorized = isAffirmativeAuthorization(
    input.factors.qapiCommitteeAuthorization,
  );
  if (!qapiAuthorized) {
    const determination: Fr015DeterminationOption =
      hasMaterialPipFactors(input.finding, input.factors) ||
      hasRecurringPattern(input.finding, input.factors)
        ? 'Initiate RCA'
        : 'Monitor';
    return {
      findingId: input.finding.findingId,
      rootIssueKey: input.rootIssueKey,
      determination,
      decisionState: 'PENDING AUTHORIZED REVIEW',
      activationKey: null,
      existingWorkflowInstanceId: null,
      newWorkflowRequired: false,
      rationale: 'PIP factors require QAPI Committee authorization before a new PIP may be created.',
      factors: input.factors,
    };
  }

  if (
    input.requestedDetermination === 'Move to sustainment' ||
    input.requestedDetermination === 'Close'
  ) {
    return {
      findingId: input.finding.findingId,
      rootIssueKey: input.rootIssueKey,
      determination: input.requestedDetermination,
      decisionState:
        input.requestedDetermination === 'Close' ? 'CLOSED' : 'SUSTAINMENT MONITORING',
      activationKey: null,
      existingWorkflowInstanceId: null,
      newWorkflowRequired: false,
      rationale: 'Authorized QAPI determination does not require a new PIP workflow.',
      factors: input.factors,
    };
  }

  const pipWarranted =
    input.requestedDetermination === 'New PIP' ||
    (hasMaterialPipFactors(input.finding, input.factors) &&
      hasRecurringPattern(input.finding, input.factors));

  if (!pipWarranted) {
    return {
      findingId: input.finding.findingId,
      rootIssueKey: input.rootIssueKey,
      determination: 'Open CAP',
      decisionState: 'CONFIRMED — NOT YET ACTIVATED',
      activationKey: null,
      existingWorkflowInstanceId: null,
      newWorkflowRequired: false,
      rationale: 'Corrective action is warranted, but PIP threshold factors are not established.',
      factors: input.factors,
    };
  }

  return {
    findingId: input.finding.findingId,
    rootIssueKey: input.rootIssueKey,
    determination: 'New PIP',
    decisionState: 'CONFIRMED — NOT YET ACTIVATED',
    activationKey: buildActivationKey(input),
    existingWorkflowInstanceId: null,
    newWorkflowRequired: true,
    rationale: 'QAPI Committee authorization and PIP factors support a new PIP activation key.',
    factors: input.factors,
  };
}

export function evaluatePipDecisionBatch(inputs: PipDecisionInput[]): PipDecision[] {
  const virtualExistingWorkflows: ExistingWorkflowRecord[] = [];
  const decisions: PipDecision[] = [];

  for (const input of inputs) {
    const decision = evaluatePipDecision({
      ...input,
      existingWorkflows: [...input.existingWorkflows, ...virtualExistingWorkflows],
    });
    decisions.push(decision);

    if (decision.newWorkflowRequired && decision.activationKey !== null) {
      virtualExistingWorkflows.push({
        instanceId: decision.activationKey,
        agencyId: input.agencyId,
        reportingPeriod: input.reportingPeriod,
        findingId: input.finding.findingId,
        triggerRuleId: input.triggerRuleId,
        canonicalWorkflowId: input.canonicalWorkflowId,
        rootIssueKey: input.rootIssueKey,
        status: 'active',
      });
    }
  }

  return decisions;
}
