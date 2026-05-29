import type { RegulatoryEvent, EventProcessStep } from '@/policy/data/regulatoryEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { inferPhaseTemplate } from './phaseTemplates';
import { normalizeRole, roleKey } from './roleNormalizer';
import { buildSwimlaneFromWorkflow } from './buildSwimlaneFromWorkflow';
import { resolveSwimlaneFormInstances } from './formInstanceResolver';
import { buildCanonicalEventSwimlaneNodeId, buildCanonicalEventSwimlaneTaskId } from './eventSwimlaneIdentity';
import { buildSwimlaneInstructions, inferSwimlaneTaskPurpose } from './swimlaneInstructions';
import type { SwimlaneBuildContext, SwimlaneLane, SwimlaneModel, SwimlaneNode, SwimlaneStatus } from './types';
import { resolveCanonicalSignaturePath } from '@/policy/ecign/signaturePathResolver';

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

function statusForEventStep(step: Pick<EventProcessStep, 'status' | 'requiredFormIds'>): SwimlaneStatus {
  if (step.status === 'complete') return 'complete';
  if (step.status === 'in-progress') return 'in_progress';
  if (step.requiredFormIds?.length) return 'needs_evidence';
  return 'pending';
}

function phaseIndexForEventStep(step: EventProcessStep, index: number, phaseCount: number): number {
  const text = `${step.label} ${step.description}`.toLowerCase();
  if (/sign|approve|attest|review/.test(text)) return Math.min(phaseCount, Math.max(1, phaseCount - 2));
  if (/evidence|file|lock|archive|package|submit/.test(text)) return phaseCount;
  if (/meeting|conduct|execute|drill/.test(text)) return Math.min(phaseCount, Math.max(2, Math.ceil(phaseCount / 2)));
  return Math.min(phaseCount, index + 1);
}

function requiredFormIds(event: RegulatoryEvent): string[] {
  return unique(event.requiredForms.map(form => form.formId ?? form.id));
}

function evidenceLabels(event: RegulatoryEvent): string[] {
  return unique([
    ...event.requiredForms.map(form => form.label || form.formId || form.id),
    ...(event.minutes ? ['Finalized minutes'] : []),
    ...(event.approvals ?? []).map(rule => `${rule.targetLabel} approval by ${rule.approverRole}`),
  ]);
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
  input.finalApproverRoles?.forEach(role => {
    reasons.push(`Final approval path required: ${role}`);
  });
  if (input.governingBodyRequired) reasons.push('Governing Body review required before final lock.');
  if (input.requiredEvidence.length > 0 && input.supportingDocumentationTasks.length === 0 && input.formInstances?.length === 0 && input.signatureTasks?.length === 0) {
    reasons.push('Required artifact links must resolve before lock.');
  }
  return unique(reasons);
}

function statusWithSignaturePath(baseStatus: SwimlaneStatus, signatureCount: number, reviewerCount: number) {
  if (baseStatus === 'complete' || baseStatus === 'locked') return baseStatus;
  if (signatureCount > 0) return reviewerCount > 0 ? 'awaiting_reviewer' : 'needs_signature';
  return baseStatus;
}

function buildMinimalEventSteps(event: RegulatoryEvent): EventProcessStep[] {
  const forms = requiredFormIds(event);
  if (forms.length > 0) {
    return [
      { id: 'event-prep', label: 'Event preparation', description: 'Open event requirement and confirm owner context.', status: 'pending', dueOffsetDays: -7 },
      { id: 'complete-forms', label: 'Complete required forms', description: 'Complete all required forms tied to the mandated event.', requiredFormIds: forms, status: 'pending', dueOffsetDays: -3 },
      { id: 'review-forms', label: 'Review forms', description: 'Assigned reviewer validates form completeness and supporting context.', status: 'pending', dueOffsetDays: -1 },
      { id: 'sign-approve', label: 'Sign or approve required artifacts', description: 'Route required signatures and approvals without creating duplicates.', requiredFormIds: forms.slice(0, 1), status: 'pending', dueOffsetDays: 0 },
      { id: 'upload-evidence', label: 'Upload supporting evidence', description: 'Attach supporting evidence with event, task, workflow, and form context.', status: 'pending', dueOffsetDays: 1 },
      { id: 'lock-package', label: 'Lock evidence package', description: 'Lock package only after forms, evidence, signatures, and approvals are satisfied.', status: 'pending', dueOffsetDays: 2 },
    ];
  }

  return [
    { id: 'event-opened', label: 'Event opened', description: 'Mandated event opened from calendar context.', status: 'pending', dueOffsetDays: 0 },
    { id: 'owner-review', label: 'Responsible owner reviews requirement', description: 'Assigned owner confirms the obligation and missing source data.', status: 'pending', dueOffsetDays: 1 },
    { id: 'evidence-collected', label: 'Evidence collected', description: 'Collect available evidence or document why evidence is unavailable.', status: 'pending', dueOffsetDays: 2 },
    { id: 'review-approval', label: 'Review / approval', description: 'Reviewer validates completion criteria where available.', status: 'pending', dueOffsetDays: 3 },
    { id: 'lock-complete', label: 'Lock or mark complete', description: 'Close the event with honest missing-context indicators.', status: 'pending', dueOffsetDays: 4 },
  ];
}

export function buildSwimlaneFromEvent(event: RegulatoryEvent, context: SwimlaneBuildContext = {}): SwimlaneModel {
  const workflow = event.workflowId ? WORKFLOWS[event.workflowId] : undefined;
  if (workflow && event.processFlow.length === 0) {
    return buildSwimlaneFromWorkflow(workflow, {
      eventId: context.eventId ?? event.id,
      taskId: context.taskId,
      mode: 'event_execution',
    });
  }

  const phases = inferPhaseTemplate({ event, workflow });
  const lanes: SwimlaneLane[] = [];
  const missingContext: string[] = [];
  if (!event.workflowId) missingContext.push('Missing workflowId; generated from event metadata.');
  if (!event.processFlow.length) missingContext.push('Missing processFlow; minimal fallback sequence used.');
  if (!event.requiredForms.length) missingContext.push('No requiredForms listed on event.');

  const sourceSteps = event.processFlow.length ? event.processFlow : buildMinimalEventSteps(event);
  const mode = 'event_execution';
  const workflowId = event.workflowId;
  const eventId = context.eventId ?? event.id;
  const allForms = requiredFormIds(event);
  const approvalRoles = (event.approvals ?? []).map(rule => normalizeRole(rule.approverRole));
  const minuteSignerRoles = event.minutes?.signOffRoles?.map(normalizeRole) ?? [];
  const sequenceByEventForm = new Map<string, number>();
  const canonicalFormInstanceIds = new Map<string, string>();

  const nodes: SwimlaneNode[] = sourceSteps.map((step, index) => {
    const roleFromAgenda = event.agenda?.standingTopics.find(topic => topic.id === step.id || step.label.includes(topic.title))?.owner;
    const approvalRole = /sign|approve|review/i.test(step.label) ? approvalRoles[0] ?? minuteSignerRoles[0] : undefined;
    const ownerRole = normalizeRole(roleFromAgenda ?? approvalRole ?? event.ownerRole ?? event.owner);
    const lane = laneForRole(ownerRole, lanes);
    const phase = phases[phaseIndexForEventStep(step, index, phases.length) - 1] ?? phases[0];
    const sourceStepId = `processFlow:${step.id}`;
    const nodeId = buildCanonicalEventSwimlaneNodeId({
      eventId,
      workflowId,
      sourceStepId: step.id,
      stepOrder: index + 1,
    });
    const stepForms = unique([...(step.requiredFormIds ?? []), ...(index === 1 && allForms.length ? allForms : [])]);

    const requiredEvidence = unique([
      step.expectedOutput,
      ...stepForms.map(formId => FORM_TITLES[formId] ? `${formId} ${FORM_TITLES[formId]}` : `Unresolved form ${formId}`),
    ]);
    const taskId = buildCanonicalEventSwimlaneTaskId({
      eventId,
      workflowId,
      sourceStepId: step.id,
      stepOrder: index + 1,
      taskPurpose: inferSwimlaneTaskPurpose(step.label, step.description),
    });
    const signerRole = /sign|attest/i.test(step.label) ? approvalRole ?? minuteSignerRoles[0] : undefined;
    const reviewerRole = /review|approve|validate/i.test(step.label) ? approvalRole ?? ownerRole : undefined;
    const { formInstances, supportingDocumentationTasks } = resolveSwimlaneFormInstances({
      mode,
      eventId,
      workflowId,
      taskId,
      title: step.label,
      formIds: stepForms,
      evidence: requiredEvidence,
      signerRole,
      reviewerRole,
      sequenceByEventForm,
      canonicalFormInstanceIds,
    });
    const signaturePath = resolveCanonicalSignaturePath({
      domain: event.domain,
      workflowId,
      eventId,
      parentTaskId: taskId,
      title: step.label,
      description: step.description || step.onCompleteText,
      ownerRole,
      taskPurpose: inferSwimlaneTaskPurpose(step.label, step.description),
      forms: formInstances.map(form => ({ formId: form.formId, formInstanceId: form.formInstanceId })),
      approvals: (event.approvals ?? []).map(approval => ({
        id: approval.id,
        targetKind: approval.targetKind,
        targetLabel: approval.targetLabel,
        approverRole: approval.approverRole,
        required: approval.required,
      })),
      minutesSignOffRoles: event.minutes?.signOffRoles,
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
      title: step.label,
      description: step.description || step.onCompleteText,
      explicitInstructions: step.instructions,
      formInstructions: stepForms.map(formId => `Complete ${formId} ${FORM_TITLES[formId] ?? 'required form'} for this event task.`),
      evidenceDescriptions: supportingDocumentationTasks.map(task => task.title),
      auditPurpose: event.regulatoryDriver ?? event.complianceFlags?.surveyorNote,
      regulatoryDriver: event.regulatoryDriver,
      taskPurpose: inferSwimlaneTaskPurpose(step.label, step.description),
    });

    return {
      nodeId,
      taskId,
      workflowId,
      eventId,
      sourceStepId,
      processFlowStepId: step.id,
      phaseId: phase.id,
      laneId: lane.id,
      title: step.label,
      shortDescription: step.description || step.instructions || 'Generated event execution step.',
      ownerRole,
      status: statusWithSignaturePath(statusForEventStep(step), signaturePath.signatureTasks.length, signaturePath.reviewerRoles.length),
      requiredForms: stepForms,
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
      dependencies: index > 0 ? [buildCanonicalEventSwimlaneNodeId({
        eventId,
        workflowId,
        sourceStepId: sourceSteps[index - 1]?.id,
        stepOrder: index,
      })] : [],
      nextNodeIds: index < sourceSteps.length - 1 ? [buildCanonicalEventSwimlaneNodeId({
        eventId,
        workflowId,
        sourceStepId: sourceSteps[index + 1]?.id,
        stepOrder: index + 2,
      })] : [],
      auditPurpose: event.regulatoryDriver ?? event.complianceFlags?.surveyorNote ?? 'Maintains an auditable mandated-event execution trail.',
      policyRefs: event.policyRefs,
      regulatoryRefs: unique([event.complianceFlags?.citation, ...(workflow?.regulatoryAnchors ?? [])]),
      sourceType: event.processFlow.length ? 'event' : 'generated',
    };
  });

  const needsEvidenceLane = allForms.length > 0 || event.requiredForms.length > 0 || (event.approvals?.length ?? 0) > 0 || Boolean(event.minutes);
  if (needsEvidenceLane) {
    const lane = laneForRole('Evidence / eCIgn System', lanes);
    const last = nodes[nodes.length - 1];
    const phase = phases[phases.length - 1];
    const taskId = buildCanonicalEventSwimlaneTaskId({
      eventId,
      workflowId,
      sourceStepId: 'final-evidence-lock',
      stepOrder: nodes.length + 1,
      taskPurpose: 'evidence_lock',
    });
    const nodeId = buildCanonicalEventSwimlaneNodeId({
      eventId,
      workflowId,
      sourceStepId: 'final-evidence-lock',
      stepOrder: nodes.length + 1,
      taskPurpose: 'evidence_lock',
    });
    nodes.push({
      nodeId,
      taskId,
      workflowId,
      eventId,
      sourceStepId: 'generated:final-evidence-lock',
      phaseId: phase.id,
      laneId: lane.id,
      title: 'Final evidence package locked',
      shortDescription: 'Forms, evidence, signatures, approvals, and artifact links must be complete before lock.',
      ownerRole: 'Evidence / eCIgn System',
      status: 'blocked',
      requiredForms: [],
      formInstances: [],
      requiredEvidence: evidenceLabels(event),
      supportingDocumentationTasks: [],
      instructions: buildSwimlaneInstructions({
        title: 'Final evidence package locked',
        description: 'Forms, evidence, signatures, approvals, and artifact links must be complete before lock.',
        auditPurpose: 'Creates the final locked evidence package for survey defensibility.',
        regulatoryDriver: event.regulatoryDriver,
        taskPurpose: 'evidence_lock',
        finalEvidenceLock: true,
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
        requiredEvidence: evidenceLabels(event),
        finalApproverRoles: unique(nodes.flatMap(node => node.finalApproverRoles ?? [])),
        governingBodyRequired: nodes.some(node => node.governingBodyRequired),
      }),
      dependencies: last ? [last.nodeId] : [],
      nextNodeIds: [],
      auditPurpose: 'Creates the final locked evidence package for survey defensibility.',
      policyRefs: event.policyRefs,
      regulatoryRefs: unique([event.complianceFlags?.citation, ...(workflow?.regulatoryAnchors ?? [])]),
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
    id: `${event.id}-swimlane`,
    workflowId,
    eventId,
    title: event.title,
    description: event.summary ?? event.regulatoryDriver ?? workflow?.processOverview,
    sourceType: event.processFlow.length ? 'event' : 'generated',
    mode,
    phases,
    lanes: lanes.sort((a, b) => a.order - b.order),
    nodes,
    edges,
    requiredForms: allForms,
    policyRefs: event.policyRefs,
    evidenceRequirements: evidenceLabels(event),
    missingContext,
  };
}
