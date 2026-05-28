import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import type { Workflow, WorkflowStep } from '@/policy/types/workflow';
import { inferPhaseTemplate } from './phaseTemplates';
import { normalizeRole, roleKey } from './roleNormalizer';
import type { SwimlaneBuildContext, SwimlaneLane, SwimlaneModel, SwimlaneNode, SwimlaneSourceType, SwimlaneStatus } from './types';

function unique(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function laneForRole(role: string, lanes: SwimlaneLane[]): SwimlaneLane {
  const title = normalizeRole(role);
  const key = roleKey(title);
  let lane = lanes.find(item => item.roleKey === key);
  if (!lane) {
    lane = { id: `lane-${lanes.length + 1}`, title, roleKey: key, order: lanes.length + 1 };
    lanes.push(lane);
  }
  return lane;
}

function statusForStep(step: WorkflowStep, index: number): SwimlaneStatus {
  if (index === 0) return 'ready';
  if (/sign|approve|attest/i.test(step.action)) return 'needs_signature';
  if (/review|validate|audit|score|verify/i.test(step.action)) return 'awaiting_reviewer';
  if (step.formIds.length > 0) return 'needs_evidence';
  return 'pending';
}

function phaseForStep(step: WorkflowStep, index: number, stepCount: number, phaseCount: number): number {
  const action = step.action.toLowerCase();
  if (/sign|approve|attest/.test(action)) return Math.min(phaseCount, Math.max(1, phaseCount - 2));
  if (/file|evidence|lock|package|archive|submit/.test(action)) return phaseCount;
  if (/review|validate|audit|score|verify|findings|decision/.test(action)) return Math.min(phaseCount, Math.max(2, Math.ceil(phaseCount / 2)));
  if (stepCount <= 1) return 1;
  return Math.min(Math.max(1, phaseCount - 2), Math.floor((index / Math.max(1, stepCount - 1)) * Math.max(1, phaseCount - 2)) + 1);
}

function formEvidence(formIds: string[]): string[] {
  return formIds.map(formId => FORM_TITLES[formId] ? `${formId} ${FORM_TITLES[formId]}` : `Unresolved form ${formId}`);
}

function buildFallbackSteps(workflow: Workflow, ownerRole: string): { steps: WorkflowStep[]; sourceType: SwimlaneSourceType; reason: string } {
  const approvalRole = workflow.roles.approval[0] ?? ownerRole;
  if (workflow.requiredForms.length > 0) {
    return {
      sourceType: 'fallback',
      reason: 'Workflow has no compiled step rows; required-form fallback sequence generated.',
      steps: [
        { order: 1, action: 'Workflow opened', role: ownerRole, formRaw: '', formIds: [], deadline: workflow.cadence.anchor ?? workflow.cadence.interval },
        { order: 2, action: 'Responsible owner reviews requirement', role: ownerRole, formRaw: '', formIds: [], deadline: 'Before execution' },
        { order: 3, action: 'Required forms reviewed', role: ownerRole, formRaw: workflow.requiredForms.join(', '), formIds: workflow.requiredForms, deadline: 'Before execution' },
        { order: 4, action: 'Required evidence identified', role: 'Evidence / eCIgn System', formRaw: workflow.requiredForms.join(', '), formIds: workflow.requiredForms, deadline: 'Before close' },
        { order: 5, action: 'Approval/signature path reviewed', role: approvalRole, formRaw: '', formIds: [], deadline: 'Before lock' },
        { order: 6, action: 'Evidence package requirement documented', role: 'Evidence / eCIgn System', formRaw: '', formIds: [], deadline: 'Close' },
      ],
    };
  }

  return {
    sourceType: 'fallback',
    reason: 'Workflow has limited structured execution data; minimal fallback sequence generated.',
    steps: [
      { order: 1, action: 'Workflow opened', role: ownerRole, formRaw: '', formIds: [], deadline: workflow.cadence.anchor ?? workflow.cadence.interval },
      { order: 2, action: 'Requirement reviewed', role: ownerRole, formRaw: '', formIds: [], deadline: 'Before execution' },
      { order: 3, action: 'Owner assigned', role: ownerRole, formRaw: '', formIds: [], deadline: 'Before execution' },
      { order: 4, action: 'Evidence requirements identified', role: 'Evidence / eCIgn System', formRaw: '', formIds: [], deadline: 'Before close' },
      { order: 5, action: 'Review/approval needed', role: approvalRole, formRaw: '', formIds: [], deadline: 'Before lock' },
      { order: 6, action: 'Workflow ready for event execution', role: 'Evidence / eCIgn System', formRaw: '', formIds: [], deadline: 'Close' },
    ],
  };
}

function approvalRoleFor(workflow: Workflow): string {
  return normalizeRole(workflow.roles.approval[0] ?? (workflow.approvals[0]?.requiresGoverningBody ? 'Governing Body' : workflow.roles.primary[0]));
}

export function buildSwimlaneFromWorkflow(workflow: Workflow, context: SwimlaneBuildContext = {}): SwimlaneModel {
  const phases = inferPhaseTemplate({ workflow });
  const lanes: SwimlaneLane[] = [];
  const missingContext: string[] = [];
  const workflowId = workflow.id;
  const mode = context.mode ?? (context.eventId && context.taskId ? 'event_execution' : 'template');
  const primaryOwner = normalizeRole(workflow.roles.primary[0] ?? workflow.roles.supporting[0] ?? workflow.roles.approval[0]);
  if (primaryOwner === 'Assigned Owner') missingContext.push('Primary owner role could not be inferred from workflow roles.');

  const hasAuthoredSteps = workflow.steps.length > 0;
  const fallback = hasAuthoredSteps ? null : buildFallbackSteps(workflow, primaryOwner);
  if (fallback) missingContext.push(fallback.reason);
  const sourceSteps = hasAuthoredSteps ? workflow.steps : fallback!.steps;
  const baseSourceType: SwimlaneSourceType = hasAuthoredSteps ? 'workflow' : fallback!.sourceType;

  const nodes: SwimlaneNode[] = sourceSteps.map((step, index) => {
    const ownerRole = normalizeRole(step.role || workflow.roles.primary[0]);
    if (ownerRole === 'Assigned Owner') missingContext.push(`Role inference gap at step ${step.order}: ${step.action}`);
    const lane = laneForRole(ownerRole, lanes);
    const phaseOrder = phaseForStep(step, index, sourceSteps.length, phases.length);
    const phase = phases[phaseOrder - 1] ?? phases[Math.min(index, phases.length - 1)];
    const nodeId = `${workflowId}-node-${step.order}`;
    const previous = index > 0 ? `${workflowId}-node-${sourceSteps[index - 1].order}` : undefined;
    const next = index < sourceSteps.length - 1 ? `${workflowId}-node-${sourceSteps[index + 1].order}` : undefined;
    const signerRole = /sign|attest/i.test(step.action) ? ownerRole : workflow.approvals[0]?.description && /sign|approve/i.test(step.action) ? ownerRole : undefined;
    const reviewerRole = /review|validate|audit|approve/i.test(step.action) ? ownerRole : undefined;

    return {
      nodeId,
      taskId: mode === 'event_execution' && context.taskId && index === 0 ? context.taskId : `${workflowId}-STEP-${String(step.order).padStart(2, '0')}`,
      workflowId,
      eventId: context.eventId,
      phaseId: phase.id,
      laneId: lane.id,
      title: step.action,
      shortDescription: step.deadline ? `${step.action} Deadline: ${step.deadline}.` : step.action,
      ownerRole,
      status: statusForStep(step, index),
      requiredForms: step.formIds,
      requiredEvidence: formEvidence(step.formIds),
      signerRole,
      reviewerRole,
      dependencies: previous ? [previous] : [],
      nextNodeIds: next ? [next] : [],
      auditPurpose: workflow.auditRequirements || workflow.outputs || 'Preserves an auditable workflow execution step.',
      policyRefs: workflow.policyRefs,
      regulatoryRefs: workflow.regulatoryAnchors,
      sourceType: baseSourceType,
    };
  });

  if (workflow.approvals.length > 0 && !nodes.some(node => node.signerRole || node.reviewerRole)) {
    const last = nodes[nodes.length - 1];
    const lane = laneForRole(approvalRoleFor(workflow), lanes);
    const phase = phases[Math.max(0, phases.length - 2)];
    const nodeId = `${workflowId}-approval-review`;
    nodes.push({
      nodeId,
      taskId: `${workflowId}-APPROVAL`,
      workflowId,
      eventId: context.eventId,
      phaseId: phase.id,
      laneId: lane.id,
      title: workflow.approvals[0]?.requiresGoverningBody ? 'Governing Body approval path reviewed' : 'Approval/signature path reviewed',
      shortDescription: workflow.approvalsRaw || 'Workflow approval requirements are reviewed before evidence lock.',
      ownerRole: lane.title,
      status: mode === 'event_execution' ? 'needs_signature' : 'awaiting_reviewer',
      requiredForms: [],
      requiredEvidence: unique(workflow.approvals.map(approval => approval.description)),
      signerRole: /sign|attest/i.test(workflow.approvalsRaw) ? lane.title : undefined,
      reviewerRole: lane.title,
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      auditPurpose: 'Documents the required approval or signature path without creating signer tasks in template mode.',
      policyRefs: workflow.policyRefs,
      regulatoryRefs: workflow.regulatoryAnchors,
      sourceType: 'generated',
    });
    if (last) last.nextNodeIds = [nodeId];
  }

  const requiresEvidenceLane = workflow.requiredForms.length > 0
    || workflow.approvals.length > 0
    || Boolean(workflow.outputs?.trim())
    || Boolean(workflow.auditRequirements?.trim());

  if (requiresEvidenceLane) {
    laneForRole('Evidence / eCIgn System', lanes);
    const last = nodes[nodes.length - 1];
    const evidenceLane = lanes.find(lane => lane.roleKey === roleKey('Evidence / eCIgn System'))!;
    const phase = phases[phases.length - 1];
    const nodeId = `${workflowId}-evidence-lock`;
    nodes.push({
      nodeId,
      taskId: `${workflowId}-LOCK`,
      workflowId,
      eventId: context.eventId,
      phaseId: phase.id,
      laneId: evidenceLane.id,
      title: 'Lock evidence package',
      shortDescription: mode === 'event_execution'
        ? 'Requires forms, evidence, signatures, and approvals before package lock.'
        : 'Template requirement only; no execution records are created from this route.',
      ownerRole: 'Evidence / eCIgn System',
      status: mode === 'event_execution' ? 'blocked' : 'unavailable',
      requiredForms: [],
      requiredEvidence: unique([
        ...workflow.requiredForms.map(formId => FORM_TITLES[formId] ? `${formId} ${FORM_TITLES[formId]}` : `Unresolved form ${formId}`),
        workflow.outputs,
        workflow.auditRequirements,
      ]),
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      auditPurpose: 'Creates the final survey-ready package boundary.',
      policyRefs: workflow.policyRefs,
      regulatoryRefs: workflow.regulatoryAnchors,
      sourceType: 'generated',
    });
    if (last) last.nextNodeIds = [nodeId];
  }

  const edges = nodes.flatMap(node => node.nextNodeIds.map(toNodeId => ({
    fromNodeId: node.nodeId,
    toNodeId,
    route: 'orthogonal' as const,
  })));

  const unresolvedForms = unique(nodes.flatMap(node => node.requiredForms)).filter(formId => !FORM_TITLES[formId]);
  if (unresolvedForms.length) missingContext.push(`Unresolved form IDs: ${unresolvedForms.join(', ')}`);

  return {
    id: context.eventId ? `${context.eventId}-${workflowId}-swimlane` : `${workflowId}-swimlane`,
    workflowId,
    eventId: context.eventId,
    title: workflow.title,
    description: workflow.processOverview,
    sourceType: baseSourceType,
    mode,
    phases,
    lanes: lanes.sort((a, b) => a.order - b.order),
    nodes,
    edges,
    requiredForms: workflow.requiredForms,
    policyRefs: workflow.policyRefs,
    evidenceRequirements: unique(nodes.flatMap(node => node.requiredEvidence)),
    missingContext,
  };
}
