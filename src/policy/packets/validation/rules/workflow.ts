import type { PacketValidationFinding, ValidationSeverity, WorkflowTriggerEvaluation } from '@/policy/packets/contracts';

import type { RuleContext } from '../validatePacket';

const EVIDENCE_DETERMINATIONS = [
  'Open CAP',
  'Initiate RCA',
  'New PIP',
  'Continue existing PIP',
  'Revise existing PIP',
] as const;

export function validateWorkflow(context: RuleContext): PacketValidationFinding[] {
  const findings: PacketValidationFinding[] = [];
  const identity = context.model.identity;

  if (isMissing(identity.workflowId) || isMissing(identity.workflowInstanceId)) {
    findings.push(finding({
      id: 'workflow-primary-missing',
      severity: 'blocker',
      code: 'missing-primary-workflow',
      path: 'model.identity.workflowId',
      message: 'Missing primary workflow: packet identity does not carry a workflow ID and workflow instance ID.',
      remediation: 'Bind the packet to its originating workflow before approval readiness review.',
      relatedWorkflowId: null,
    }));
  }

  if (context.expectedWorkflowId !== null && identity.workflowId !== context.expectedWorkflowId) {
    findings.push(finding({
      id: `workflow-primary-mismatch-${slug(identity.workflowId)}-${slug(context.expectedWorkflowId)}`,
      severity: 'blocker',
      code: 'missing-primary-workflow',
      path: 'model.identity.workflowId',
      message: `Missing primary workflow: packet workflow "${identity.workflowId}" does not match expected workflow "${context.expectedWorkflowId}".`,
      remediation: 'Use the packet generated for the expected originating workflow.',
      relatedWorkflowId: identity.workflowId,
    }));
  }

  if (context.instance !== null && context.instance.workflowInstanceId !== identity.workflowInstanceId) {
    findings.push(finding({
      id: 'workflow-instance-identity-mismatch',
      severity: 'blocker',
      code: 'missing-primary-workflow',
      path: 'instance.workflowInstanceId',
      message: `Missing primary workflow: PacketModel workflow instance "${identity.workflowInstanceId}" differs from PacketInstance workflow instance "${context.instance.workflowInstanceId}".`,
      remediation: 'Reconcile the workflow identity before review, approval, or lock.',
      relatedWorkflowId: identity.workflowId,
    }));
  }

  const availableWorkflowIds = collectAvailableWorkflowIds(context);
  for (const requiredWorkflowId of context.requiredWorkflowIds) {
    if (!availableWorkflowIds.has(requiredWorkflowId)) {
      findings.push(finding({
        id: `workflow-required-feeder-missing-${slug(requiredWorkflowId)}`,
        severity: 'blocker',
        code: 'missing-required-feeder-workflow',
        path: 'requiredWorkflowIds',
        message: `Missing required feeder workflow "${requiredWorkflowId}".`,
        remediation: 'Activate, link, or document the required feeder workflow before packet lock.',
        relatedWorkflowId: requiredWorkflowId,
      }));
    }
  }

  context.workflowEvaluations.forEach((evaluation, index) => {
    if (evaluation.decisionState === 'WORKFLOW UNRESOLVED') {
      findings.push(finding({
        id: `workflow-unresolved-${slug(evaluation.evaluationId)}`,
        severity: 'blocker',
        code: 'missing-required-feeder-workflow',
        path: `workflowEvaluations.${index}.decisionState`,
        message: `Missing required feeder workflow: ${evaluation.decisionRationale}`,
        remediation: 'Resolve the canonical workflow mapping before the packet can be approved or locked.',
        relatedWorkflowId: evaluation.canonicalWorkflowId,
      }));
    }

    if (evaluation.decisionState === 'BLOCKED') {
      findings.push(finding({
        id: `workflow-blocked-${slug(evaluation.evaluationId)}`,
        severity: 'blocker',
        code: 'missing-required-feeder-workflow',
        path: `workflowEvaluations.${index}.decisionState`,
        message: `Workflow activation is blocked: ${evaluation.decisionRationale}`,
        remediation: 'Resolve the workflow activation blocker before packet approval readiness review.',
        relatedWorkflowId: evaluation.canonicalWorkflowId,
      }));
    }

    if (
      evaluation.decisionState === 'CANDIDATE — NEEDS VALIDATION' ||
      evaluation.decisionState === 'PENDING AUTHORIZED REVIEW'
    ) {
      findings.push(finding({
        id: `workflow-review-warning-${slug(evaluation.evaluationId)}`,
        severity: 'warning',
        code: 'workflow-review-not-complete',
        path: `workflowEvaluations.${index}.decisionState`,
        message: `Workflow candidate "${evaluation.evaluationId}" remains in state "${evaluation.decisionState}".`,
        remediation: 'Acknowledge the pending workflow review or complete the authorized workflow decision before lock.',
        relatedWorkflowId: evaluation.canonicalWorkflowId,
      }));
    }

    evaluation.dependencyWorkflowIds.forEach((dependencyWorkflowId) => {
      if (!availableWorkflowIds.has(dependencyWorkflowId)) {
        findings.push(finding({
          id: `workflow-dependency-missing-${slug(evaluation.evaluationId)}-${slug(dependencyWorkflowId)}`,
          severity: 'blocker',
          code: 'missing-required-feeder-workflow',
          path: `workflowEvaluations.${index}.dependencyWorkflowIds`,
          message: `Missing required feeder workflow "${dependencyWorkflowId}" for evaluation "${evaluation.evaluationId}".`,
          remediation: 'Link or activate the feeder workflow required by the trigger evaluation.',
          relatedWorkflowId: dependencyWorkflowId,
        }));
      }
    });

    if (evaluation.blockerIds.length > 0) {
      findings.push(finding({
        id: `workflow-engine-blocker-${slug(evaluation.evaluationId)}`,
        severity: 'blocker',
        code: 'workflow-engine-blocker',
        path: `workflowEvaluations.${index}.blockerIds`,
        message: `Workflow evaluation "${evaluation.evaluationId}" carries unresolved blocker IDs: ${evaluation.blockerIds.join(', ')}.`,
        remediation: 'Resolve the workflow engine blockers before approval or lock.',
        relatedWorkflowId: evaluation.canonicalWorkflowId,
      }));
    }

    if (requiresPipCapRcaEvidence(evaluation) && evaluation.sourceRecordIds.length === 0) {
      findings.push(finding({
        id: `workflow-required-evidence-missing-${slug(evaluation.evaluationId)}`,
        severity: 'blocker',
        code: 'missing-required-pip-cap-rca-evidence',
        path: `workflowEvaluations.${index}.sourceRecordIds`,
        message: `Missing required PIP/CAP/RCA evidence for determination "${evaluation.determination}".`,
        remediation: 'Attach the source records and generated PIP/CAP/RCA evidence supporting this determination.',
        relatedWorkflowId: evaluation.canonicalWorkflowId,
      }));
    }

    if (isPipDetermination(evaluation.determination) && evaluation.pipEvaluationFactors === null) {
      findings.push(finding({
        id: `workflow-pip-factors-missing-${slug(evaluation.evaluationId)}`,
        severity: 'blocker',
        code: 'missing-required-pip-cap-rca-evidence',
        path: `workflowEvaluations.${index}.pipEvaluationFactors`,
        message: `Missing required PIP evidence factors for determination "${evaluation.determination}".`,
        remediation: 'Record materiality, recurrence, trend, patient-safety, prior-action, and QAPI authorization evidence.',
        relatedWorkflowId: evaluation.canonicalWorkflowId,
      }));
    }
  });

  duplicateWorkflowInstanceFindings(context.workflowEvaluations).forEach((duplicateFinding) => {
    findings.push(duplicateFinding);
  });

  context.requiredEvidence.forEach((requirement, index) => {
    if (isMissing(requirement.evidenceId)) {
      findings.push(finding({
        id: `workflow-required-evidence-explicit-missing-${slug(requirement.workflowId)}-${index + 1}`,
        severity: 'blocker',
        code: 'missing-required-pip-cap-rca-evidence',
        path: `requiredEvidence.${index}.evidenceId`,
        message: `Missing required PIP/CAP/RCA evidence "${requirement.evidenceLabel}" for workflow "${requirement.workflowId}".`,
        remediation: 'Attach or generate the required PIP/CAP/RCA evidence before lock.',
        relatedWorkflowId: requirement.workflowId,
      }));
    }
  });

  return findings;
}

function collectAvailableWorkflowIds(context: RuleContext): Set<string> {
  const ids = new Set<string>();
  addIfPresent(ids, context.model.identity.workflowId);
  if (context.instance !== null) addIfPresent(ids, context.instance.workflowId);
  for (const evaluation of context.workflowEvaluations) {
    addIfPresent(ids, evaluation.canonicalWorkflowId);
    evaluation.sourceWorkflowIds.forEach((workflowId) => addIfPresent(ids, workflowId));
  }
  return ids;
}

function duplicateWorkflowInstanceFindings(
  evaluations: readonly WorkflowTriggerEvaluation[],
): PacketValidationFinding[] {
  const byInstanceId = new Map<string, string[]>();
  for (const evaluation of evaluations) {
    addWorkflowInstance(byInstanceId, evaluation.newWorkflowInstanceId, evaluation.evaluationId);
    addWorkflowInstance(byInstanceId, evaluation.existingWorkflowInstanceId, evaluation.evaluationId);
  }

  const findings: PacketValidationFinding[] = [];
  byInstanceId.forEach((evaluationIds, workflowInstanceId) => {
    if (evaluationIds.length < 2) return;
    findings.push(finding({
      id: `workflow-duplicate-instance-${slug(workflowInstanceId)}`,
      severity: 'blocker',
      code: 'duplicate-workflow-instance',
      path: 'workflowEvaluations.workflowInstanceId',
      message: `Duplicate workflow instance "${workflowInstanceId}" is referenced by evaluations: ${evaluationIds.join(', ')}.`,
      remediation: 'Deduplicate workflow activations or link one canonical active workflow instance.',
      relatedWorkflowId: workflowInstanceId,
    }));
  });
  return findings;
}

function addWorkflowInstance(map: Map<string, string[]>, workflowInstanceId: string | null, evaluationId: string): void {
  if (!isPresent(workflowInstanceId)) return;
  const current = map.get(workflowInstanceId) ?? [];
  current.push(evaluationId);
  map.set(workflowInstanceId, current);
}

function addIfPresent(ids: Set<string>, value: string | null): void {
  if (isPresent(value)) ids.add(value);
}

function requiresPipCapRcaEvidence(evaluation: WorkflowTriggerEvaluation): boolean {
  return EVIDENCE_DETERMINATIONS.some((determination) => determination === evaluation.determination);
}

function isPipDetermination(determination: string | null): boolean {
  return determination === 'New PIP' ||
    determination === 'Continue existing PIP' ||
    determination === 'Revise existing PIP';
}

function finding(args: {
  id: string;
  severity: ValidationSeverity;
  code: string;
  path: string;
  message: string;
  remediation: string;
  relatedWorkflowId: string | null;
}): PacketValidationFinding {
  return {
    findingId: args.id,
    severity: args.severity,
    code: args.code,
    path: args.path,
    message: args.message,
    remediation: args.remediation,
    requiresAcknowledgment: args.severity === 'warning',
    acknowledgedAt: null,
    acknowledgedBy: null,
    relatedModuleId: null,
    relatedFormId: null,
    relatedWorkflowId: args.relatedWorkflowId,
  };
}

function isMissing(value: string | null): boolean {
  const trimmed = (value ?? '').trim();
  return trimmed.length === 0 || trimmed === '—';
}

function isPresent(value: string | null): value is string {
  return !isMissing(value);
}

function slug(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return normalized.length > 0 ? normalized : 'unknown';
}
