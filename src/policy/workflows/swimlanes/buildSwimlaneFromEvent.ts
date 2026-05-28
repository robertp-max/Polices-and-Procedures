import type { RegulatoryEvent, EventProcessStep } from '@/policy/data/regulatoryEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { inferPhaseTemplate } from './phaseTemplates';
import { normalizeRole, roleKey } from './roleNormalizer';
import { buildSwimlaneFromWorkflow } from './buildSwimlaneFromWorkflow';
import type { SwimlaneBuildContext, SwimlaneLane, SwimlaneModel, SwimlaneNode, SwimlaneStatus } from './types';

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

  const nodes: SwimlaneNode[] = sourceSteps.map((step, index) => {
    const roleFromAgenda = event.agenda?.standingTopics.find(topic => topic.id === step.id || step.label.includes(topic.title))?.owner;
    const approvalRole = /sign|approve|review/i.test(step.label) ? approvalRoles[0] ?? minuteSignerRoles[0] : undefined;
    const ownerRole = normalizeRole(roleFromAgenda ?? approvalRole ?? event.ownerRole ?? event.owner);
    const lane = laneForRole(ownerRole, lanes);
    const phase = phases[phaseIndexForEventStep(step, index, phases.length) - 1] ?? phases[0];
    const nodeId = `${event.id}-node-${index + 1}`;
    const previous = index > 0 ? `${event.id}-node-${index}` : undefined;
    const next = index < sourceSteps.length - 1 ? `${event.id}-node-${index + 2}` : undefined;
    const stepForms = unique([...(step.requiredFormIds ?? []), ...(index === 1 && allForms.length ? allForms : [])]);

    return {
      nodeId,
      taskId: context.taskId && index === 0 ? context.taskId : `${event.id}-${step.id}`,
      workflowId,
      eventId,
      phaseId: phase.id,
      laneId: lane.id,
      title: step.label,
      shortDescription: step.description || step.instructions || 'Generated event execution step.',
      ownerRole,
      status: statusForEventStep(step),
      requiredForms: stepForms,
      requiredEvidence: unique([
        step.expectedOutput,
        ...stepForms.map(formId => FORM_TITLES[formId] ? `${formId} ${FORM_TITLES[formId]}` : `Unresolved form ${formId}`),
      ]),
      signerRole: /sign|attest/i.test(step.label) ? approvalRole ?? minuteSignerRoles[0] : undefined,
      reviewerRole: /review|approve|validate/i.test(step.label) ? approvalRole ?? ownerRole : undefined,
      dependencies: previous ? [previous] : [],
      nextNodeIds: next ? [next] : [],
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
    const nodeId = `${event.id}-evidence-lock`;
    nodes.push({
      nodeId,
      taskId: `${event.id}-LOCK`,
      workflowId,
      eventId,
      phaseId: phase.id,
      laneId: lane.id,
      title: 'Final evidence package locked',
      shortDescription: 'Forms, evidence, signatures, approvals, and artifact links must be complete before lock.',
      ownerRole: 'Evidence / eCIgn System',
      status: 'blocked',
      requiredForms: [],
      requiredEvidence: evidenceLabels(event),
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
