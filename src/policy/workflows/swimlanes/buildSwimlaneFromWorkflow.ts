import { resolveFormTitle } from '@/policy/data/formIdAliases';
import type { Workflow, WorkflowStep } from '@/policy/types/workflow';
import { inferPhaseTemplate } from './phaseTemplates';
import { normalizeRole, roleKey } from './roleNormalizer';
import { resolveSwimlaneFormInstances } from './formInstanceResolver';
import { buildCanonicalEventSwimlaneNodeId, buildCanonicalEventSwimlaneTaskId } from './eventSwimlaneIdentity';
import { buildSwimlaneInstructions, inferSwimlaneTaskPurpose } from './swimlaneInstructions';
import type { SwimlaneBuildContext, SwimlaneLane, SwimlaneModel, SwimlaneNode, SwimlaneSourceType, SwimlaneStatus } from './types';
import { resolveCanonicalSignaturePath } from '@/policy/ecign/signaturePathResolver';
import { getEventDisplayModel } from '@/policy/data/eventDisplayModel';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { getEventById } from './swimlaneRegistry';

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

function statusForStep(step: WorkflowStep, index: number, exec: Record<string, unknown>, liveEvent: unknown): SwimlaneStatus {
  // For event mode use live store status if available
  const ex = exec as { effectiveStepStatus?: (ev: unknown, key: string | number) => string | undefined };
  if (liveEvent && ex.effectiveStepStatus) {
    const liveS = ex.effectiveStepStatus(liveEvent, `STEP-${String(step.order).padStart(2,'0')}`) || ex.effectiveStepStatus(liveEvent, String(step.order));
    if (liveS === 'complete') return 'complete';
    if (liveS === 'in-progress') return 'in_progress';
  }
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

function phaseForQapiCommitteeStep(step: WorkflowStep, fallbackIndex: number, stepCount: number, phaseCount: number): number {
  const action = step.action.toLowerCase();
  if (/lock|archive|final evidence/.test(action)) return phaseCount;
  if (/governing body|board/.test(action)) return Math.min(phaseCount, 6);
  if (/minutes|sign|signature|attest/.test(action)) return Math.min(phaseCount, 5);
  if (/decide|priority action|new pip|cap\b|vote/.test(action)) return Math.min(phaseCount, 4);
  if (/adverse event|rca|pip status|infection|surveillance|complaint/.test(action)) return Math.min(phaseCount, 3);
  if (/aggregate quality|compliance\/billing|hr audit|risk\/safety|it\/security|qapi-layer|kpi|indicator|trend|validation|policy effectiveness/.test(action)) return Math.min(phaseCount, 2);
  if (/verify pre-input|pre-input|agenda|pre-read|packet|distribute/.test(action)) return 1;
  return phaseForStep(step, fallbackIndex, stepCount, phaseCount);
}

function phaseForWorkflowStep(workflowId: string, step: WorkflowStep, index: number, stepCount: number, phaseCount: number): number {
  if (workflowId === 'QA-WF-03') return phaseForQapiCommitteeStep(step, index, stepCount, phaseCount);
  return phaseForStep(step, index, stepCount, phaseCount);
}

function formEvidence(formIds: string[]): string[] {
  return formIds.map(formId => `${formId} ${resolveFormTitle(formId)}`);
}

function buildArtifactBlockedReasons(input: Pick<SwimlaneNode, 'formInstances' | 'supportingDocumentationTasks' | 'signatureTasks' | 'requiredEvidence' | 'finalApproverRoles' | 'governingBodyRequired'>) {
  const reasons: string[] = [];
  input.formInstances?.forEach(form => {
    if (form.missing || !form.formInstanceId) reasons.push(`Missing form instance: ${form.formId}`);
    if (form.status !== 'complete' && form.status !== 'locked') reasons.push(`Form incomplete: ${form.formId}`);
  });
  input.supportingDocumentationTasks?.forEach(task => {
    if (task.required && task.status !== 'complete' && task.status !== 'locked') reasons.push(`Supporting documentation pending: ${task.title}`);
  });
  input.signatureTasks?.forEach(task => {
    if (task.required && task.status !== 'signed') reasons.push(`Signature pending: ${task.signerRole} (${task.signatureSlot})`);
  });
  input.finalApproverRoles?.forEach(role => reasons.push(`Final approval path required: ${role}`));
  if (input.governingBodyRequired) reasons.push('Governing Body review required before final lock.');
  return unique(reasons);
}

function statusWithSignaturePath(baseStatus: SwimlaneStatus, signatureCount: number, reviewerCount: number) {
  if (baseStatus === 'complete' || baseStatus === 'locked') return baseStatus;
  if (signatureCount > 0) return reviewerCount > 0 ? 'awaiting_reviewer' : 'needs_signature';
  return baseStatus;
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
  const mode = context.mode ?? (context.eventId ? 'event_execution' : 'template');
  const sequenceByEventForm = new Map<string, number>();
  const canonicalFormInstanceIds = new Map<string, string>();
  const primaryOwner = normalizeRole(workflow.roles.primary[0] ?? workflow.roles.supporting[0] ?? workflow.roles.approval[0]);
  if (primaryOwner === 'Assigned Owner') missingContext.push('Primary owner role could not be inferred from workflow roles.');

  const hasAuthoredSteps = workflow.steps.length > 0;
  const fallback = hasAuthoredSteps ? null : buildFallbackSteps(workflow, primaryOwner);
  if (fallback) missingContext.push(fallback.reason);
  const sourceSteps = hasAuthoredSteps ? workflow.steps : fallback!.steps;
  const baseSourceType: SwimlaneSourceType = hasAuthoredSteps ? 'workflow' : fallback!.sourceType;

  // Live data + design #4 display for event-backed workflows (calendar/swimlane parity)
  const exec = useRegulatoryExecutionStore.getState();
  const liveEvent = context.eventId ? getEventById(context.eventId) : undefined;
  const display = liveEvent ? getEventDisplayModel(liveEvent) : null;
  const canonicalPolicyRefs = display?.canonicalPolicyRefs?.length ? display.canonicalPolicyRefs : workflow.policyRefs;

  const nodes: SwimlaneNode[] = sourceSteps.map((step, index) => {
    const ownerRole = normalizeRole(step.role || workflow.roles.primary[0]);
    if (ownerRole === 'Assigned Owner') missingContext.push(`Role inference gap at step ${step.order}: ${step.action}`);
    const lane = laneForRole(ownerRole, lanes);
    const phaseOrder = phaseForWorkflowStep(workflowId, step, index, sourceSteps.length, phases.length);
    const phase = phases[phaseOrder - 1] ?? phases[Math.min(index, phases.length - 1)];
    const sourceStepId = `workflow-step:${String(step.order).padStart(2, '0')}`;
    const eventTaskId = context.eventId
      ? buildCanonicalEventSwimlaneTaskId({
        eventId: context.eventId,
        workflowId,
        sourceStepId: `STEP-${String(step.order).padStart(2, '0')}`,
        stepOrder: step.order,
        taskPurpose: inferSwimlaneTaskPurpose(step.action),
      })
      : `${workflowId}-STEP-${String(step.order).padStart(2, '0')}`;
    const nodeId = context.eventId
      ? buildCanonicalEventSwimlaneNodeId({
        eventId: context.eventId,
        workflowId,
        sourceStepId: `STEP-${String(step.order).padStart(2, '0')}`,
        stepOrder: step.order,
      })
      : `${workflowId}-node-${step.order}`;
    const signerRole = /sign|attest/i.test(step.action) ? ownerRole : workflow.approvals[0]?.description && /sign|approve/i.test(step.action) ? ownerRole : undefined;
    const reviewerRole = /review|validate|audit|approve/i.test(step.action) ? ownerRole : undefined;

    const requiredEvidence = formEvidence(step.formIds);
    const { formInstances, supportingDocumentationTasks } = resolveSwimlaneFormInstances({
      mode,
      eventId: context.eventId,
      workflowId,
      taskId: eventTaskId,
      title: step.action,
      formIds: step.formIds,
      evidence: requiredEvidence,
      signerRole,
      reviewerRole,
      sequenceByEventForm,
      canonicalFormInstanceIds,
    });
    const signaturePath = resolveCanonicalSignaturePath({
      domain: workflow.domain,
      workflowId,
      eventId: context.eventId ?? workflowId,
      parentTaskId: eventTaskId,
      title: step.action,
      description: step.deadline,
      ownerRole,
      taskPurpose: inferSwimlaneTaskPurpose(step.action),
      forms: formInstances.map(form => ({ formId: form.formId, formInstanceId: form.formInstanceId })),
      approvals: workflow.approvals.map((approval, approvalIndex) => ({
        id: `${workflowId}-approval-${approvalIndex + 1}`,
        targetKind: approval.requiresGoverningBody ? 'event' : 'report',
        targetLabel: approval.description,
        approverRole: workflow.roles.approval[approvalIndex] ?? workflow.roles.approval[0] ?? ownerRole,
        required: true,
      })),
    });
    const artifactBlockedReasons = buildArtifactBlockedReasons({
      formInstances,
      supportingDocumentationTasks,
      signatureTasks: signaturePath.signatureTasks,
      requiredEvidence,
      finalApproverRoles: signaturePath.finalApproverRoles,
      governingBodyRequired: signaturePath.governingBodyRequired,
    });
    const instructions = buildSwimlaneInstructions({
      title: step.action,
      description: step.deadline ? `${step.action} Deadline: ${step.deadline}.` : step.action,
      formInstructions: step.formIds.map(formId => `Complete ${formId} ${resolveFormTitle(formId)} for this workflow step.`),
      evidenceDescriptions: supportingDocumentationTasks.map(task => task.title),
      auditPurpose: workflow.auditRequirements || workflow.outputs,
      regulatoryDriver: workflow.processOverview,
      taskPurpose: inferSwimlaneTaskPurpose(step.action),
    });

    return {
      nodeId,
      taskId: eventTaskId,
      workflowId,
      eventId: context.eventId,
      sourceStepId,
      phaseId: phase.id,
      laneId: lane.id,
      title: step.action,
      shortDescription: step.deadline ? `${step.action} Deadline: ${step.deadline}.` : step.action,
      ownerRole,
      status: statusWithSignaturePath(statusForStep(step, index, exec, liveEvent), signaturePath.signatureTasks.length, signaturePath.reviewerRoles.length),
      requiredForms: step.formIds,
      formInstances,
      requiredEvidence,
      supportingDocumentationTasks,
      instructions,
      signatureRequirements: signaturePath.signatureRequirements,
      signatureTasks: signaturePath.signatureTasks,
      signerRole: signaturePath.signerRoles[0] ?? signerRole,
      reviewerRole: signaturePath.reviewerRoles[0] ?? reviewerRole,
      reviewerRoles: signaturePath.reviewerRoles,
      finalApproverRoles: signaturePath.finalApproverRoles,
      governingBodyRequired: signaturePath.governingBodyRequired,
      artifactBlockedReasons,
      dependencies: index > 0
        ? [context.eventId
          ? buildCanonicalEventSwimlaneNodeId({
            eventId: context.eventId,
            workflowId,
            sourceStepId: `STEP-${String(sourceSteps[index - 1].order).padStart(2, '0')}`,
            stepOrder: sourceSteps[index - 1].order,
          })
          : `${workflowId}-node-${sourceSteps[index - 1].order}`]
        : [],
      nextNodeIds: index < sourceSteps.length - 1
        ? [context.eventId
          ? buildCanonicalEventSwimlaneNodeId({
            eventId: context.eventId,
            workflowId,
            sourceStepId: `STEP-${String(sourceSteps[index + 1].order).padStart(2, '0')}`,
            stepOrder: sourceSteps[index + 1].order,
          })
          : `${workflowId}-node-${sourceSteps[index + 1].order}`]
        : [],
      auditPurpose: workflow.auditRequirements || workflow.outputs || 'Preserves an auditable workflow execution step.',
      policyRefs: canonicalPolicyRefs,
      regulatoryRefs: workflow.regulatoryAnchors,
      sourceType: baseSourceType,
    };
  });

  if (workflow.approvals.length > 0 && !nodes.some(node => node.signerRole || node.reviewerRole)) {
    const last = nodes[nodes.length - 1];
    const lane = laneForRole(approvalRoleFor(workflow), lanes);
    const phase = phases[Math.max(0, phases.length - 2)];
    const taskId = context.eventId
      ? buildCanonicalEventSwimlaneTaskId({
        eventId: context.eventId,
        workflowId,
        sourceStepId: 'APPROVAL',
        stepOrder: nodes.length + 1,
        taskPurpose: 'approval',
      })
      : `${workflowId}-APPROVAL`;
    const nodeId = context.eventId
      ? buildCanonicalEventSwimlaneNodeId({
        eventId: context.eventId,
        workflowId,
        sourceStepId: 'APPROVAL',
        stepOrder: nodes.length + 1,
        taskPurpose: 'approval',
      })
      : `${workflowId}-approval-review`;
    nodes.push({
      nodeId,
      taskId,
      workflowId,
      eventId: context.eventId,
      sourceStepId: 'generated:approval',
      phaseId: phase.id,
      laneId: lane.id,
      title: workflow.approvals[0]?.requiresGoverningBody ? 'Governing Body approval path reviewed' : 'Approval/signature path reviewed',
      shortDescription: workflow.approvalsRaw || 'Workflow approval requirements are reviewed before evidence lock.',
      ownerRole: lane.title,
      status: mode === 'event_execution' ? 'needs_signature' : 'awaiting_reviewer',
      requiredForms: [],
      formInstances: [],
      requiredEvidence: unique(workflow.approvals.map(approval => approval.description)),
      supportingDocumentationTasks: [],
      instructions: buildSwimlaneInstructions({
        title: workflow.approvals[0]?.requiresGoverningBody ? 'Governing Body approval path reviewed' : 'Approval/signature path reviewed',
        description: workflow.approvalsRaw || 'Workflow approval requirements are reviewed before evidence lock.',
        auditPurpose: 'Documents the required approval or signature path without creating signer tasks in template mode.',
        regulatoryDriver: workflow.processOverview,
        taskPurpose: 'approval',
      }),
      signatureRequirements: [],
      signatureTasks: [],
      signerRole: /sign|attest/i.test(workflow.approvalsRaw) ? lane.title : undefined,
      reviewerRole: lane.title,
      reviewerRoles: [lane.title],
      finalApproverRoles: workflow.approvals[0]?.requiresGoverningBody ? ['Governing Body'] : [lane.title],
      governingBodyRequired: workflow.approvals[0]?.requiresGoverningBody ?? false,
      artifactBlockedReasons: workflow.approvals[0]?.requiresGoverningBody ? ['Governing Body approval required before evidence lock.'] : ['Approval path must be completed before evidence lock.'],
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      auditPurpose: 'Documents the required approval or signature path without creating signer tasks in template mode.',
      policyRefs: canonicalPolicyRefs,
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
    const taskId = context.eventId
      ? buildCanonicalEventSwimlaneTaskId({
        eventId: context.eventId,
        workflowId,
        sourceStepId: 'LOCK',
        stepOrder: nodes.length + 1,
        taskPurpose: 'evidence_lock',
      })
      : `${workflowId}-LOCK`;
    const nodeId = context.eventId
      ? buildCanonicalEventSwimlaneNodeId({
        eventId: context.eventId,
        workflowId,
        sourceStepId: 'LOCK',
        stepOrder: nodes.length + 1,
        taskPurpose: 'evidence_lock',
      })
      : `${workflowId}-evidence-lock`;
    nodes.push({
      nodeId,
      taskId,
      workflowId,
      eventId: context.eventId,
      sourceStepId: 'generated:lock',
      phaseId: phase.id,
      laneId: evidenceLane.id,
      title: 'Lock evidence package',
      shortDescription: mode === 'event_execution'
        ? 'Requires forms, evidence, signatures, and approvals before package lock.'
        : 'Template requirement only; no execution records are created from this route.',
      ownerRole: 'Evidence / eCIgn System',
      status: mode === 'event_execution' ? 'blocked' : 'unavailable',
      requiredForms: [],
      formInstances: [],
      requiredEvidence: unique([
        ...workflow.requiredForms.map(formId => `${formId} ${resolveFormTitle(formId)}`),
        workflow.outputs,
        workflow.auditRequirements,
      ]),
      supportingDocumentationTasks: [],
      instructions: buildSwimlaneInstructions({
        title: 'Lock evidence package',
        description: mode === 'event_execution'
          ? 'Requires forms, evidence, signatures, and approvals before package lock.'
          : 'Template requirement only; no execution records are created from this route.',
        auditPurpose: 'Creates the final survey-ready package boundary.',
        regulatoryDriver: workflow.processOverview,
        taskPurpose: 'evidence_lock',
        finalEvidenceLock: mode === 'event_execution',
      }),
      signatureRequirements: [],
      signatureTasks: [],
      reviewerRoles: [],
      finalApproverRoles: unique(nodes.flatMap(node => node.finalApproverRoles ?? [])),
      governingBodyRequired: nodes.some(node => node.governingBodyRequired),
      artifactBlockedReasons: buildArtifactBlockedReasons({
        formInstances: nodes.flatMap(node => node.formInstances ?? []),
        supportingDocumentationTasks: nodes.flatMap(node => node.supportingDocumentationTasks ?? []),
        signatureTasks: nodes.flatMap(node => node.signatureTasks ?? []),
        requiredEvidence: unique([
          ...workflow.requiredForms.map(formId => `${formId} ${resolveFormTitle(formId)}`),
          workflow.outputs,
          workflow.auditRequirements,
        ]),
        finalApproverRoles: unique(nodes.flatMap(node => node.finalApproverRoles ?? [])),
        governingBodyRequired: nodes.some(node => node.governingBodyRequired),
      }),
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      auditPurpose: 'Creates the final survey-ready package boundary.',
      policyRefs: canonicalPolicyRefs,
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

  const unresolvedForms = unique(nodes.flatMap(node => node.requiredForms)).filter(formId => !resolveFormTitle(formId) || resolveFormTitle(formId) === formId);
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
    policyRefs: canonicalPolicyRefs,
    evidenceRequirements: unique(nodes.flatMap(node => node.requiredEvidence)),
    missingContext,
  };
}

// Re-export the pure card adapter (implementation lives in dedicated pure module to avoid side-effect chains for verification + script isolation).
export { buildWorkflowSwimlaneCardsForEvent } from './buildWorkflowSwimlaneCardsForCes';
