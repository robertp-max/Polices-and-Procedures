import { TEMPLATE_REGISTRY } from '@/policy/autogen/templateRegistry';
import type { EventTemplate } from '@/policy/autogen/types';
import { resolveFormTitle } from '@/policy/data/formIdAliases';
import type { EventEvidenceItem, EventProcessStep, RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import type { CesCalendarHubMeta } from '@/policy/services/calendarApi';
import { formatCesFormInstanceId } from '@/policy/compliance-execution/cesFormInstanceId';
import { buildCanonicalEventSwimlaneNodeId, buildCanonicalEventSwimlaneTaskId } from '@/policy/workflows/swimlanes/eventSwimlaneIdentity';
import type { SwimlaneLane, SwimlaneModel, SwimlaneNode, SwimlaneStatus } from '@/policy/workflows/swimlanes/types';

type RawStepStatus = EventProcessStep['status'] | 'ready' | 'blocked';

export type CesEventExecutionTaskStatus =
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'needs_evidence'
  | 'needs_signature'
  | 'awaiting_reviewer'
  | 'complete'
  | 'locked'
  | 'blocked';

export interface CesEventExecutionForm {
  id: string;
  title: string;
  formId?: string;
  status: EventEvidenceItem['status'];
  dueDate?: string;
  formInstanceId?: string;
}

export interface CesEventExecutionPhase {
  id: string;
  title: string;
  order: number;
}

export interface CesEventExecutionTask {
  id: string;
  sourceStepId: string;
  title: string;
  description: string;
  ownerRole: string;
  dueDate?: string;
  status: CesEventExecutionTaskStatus;
  progress: number;
  phaseId: string;
  phaseTitle: string;
  requiredForms: CesEventExecutionForm[];
  requiredEvidence: string[];
  requiredSignerRoles: string[];
  dependencyIds: string[];
  nextTaskIds: string[];
  blockerText?: string;
}

export interface CesEventExecutionRoutes {
  eventWorkspace: string;
  fullSwimlane: string;
  evidenceCenter: string;
  auditMode: string;
  ecignSigning: string;
  packetPreview: string;
  driveFolder?: string;
}

export interface CesEventExecutionViewModel {
  eventId: string;
  title: string;
  date: string;
  timeLabel: string;
  domain: string;
  category?: string;
  cadence?: string;
  owner: string;
  ownerRole: string;
  workflowId?: string;
  workflowTitle: string;
  policyRefs: string[];
  requiredForms: CesEventExecutionForm[];
  requiredEvidence: string[];
  requiredSignerRoles: string[];
  phases: CesEventExecutionPhase[];
  tasks: CesEventExecutionTask[];
  evidenceCount: number;
  attachedDriveEvidenceCount: number;
  driveLinked: boolean;
  driveFolderUrl?: string;
  googleCalendarEventId?: string;
  calendarAttachmentStatus: string;
  calendarAttachmentCount: number;
  ecignStatus: string;
  ecignDisplayStatus: string;
  signedPackageStatus: string;
  blockerText?: string;
  completionPercent: number;
  auditReadinessPercent: number;
  completionBreakdown: {
    tasks: number;
    evidence: number;
    forms: number;
    signatures: number;
    auditCloseout: number;
  };
  statusLabel: string;
  routes: CesEventExecutionRoutes;
}

export interface CesEventExecutionStoreSnapshot {
  effectiveStepStatus?: (event: RegulatoryEvent, stepId: string) => string | undefined;
  effectiveFormStatus?: (event: RegulatoryEvent, formId: string) => string | undefined;
  isCertified?: (eventId: string) => boolean;
}

export interface BuildCesEventExecutionViewModelInput {
  eventId: string;
  workflowId?: string | null;
  regulatoryEvent?: RegulatoryEvent | null;
  hub?: CesCalendarHubMeta | null;
  executionState?: CesEventExecutionStoreSnapshot | null;
  googleCalendarEventId?: string;
}

interface SourceStep {
  id: string;
  label: string;
  description: string;
  dueOffsetDays?: number;
  status?: RawStepStatus;
  requiredFormIds?: string[];
  ownerRole?: string;
  expectedOutput?: string;
}

function unique(values: Array<string | undefined | null>): string[] {
  return Array.from(new Set(values.map(value => value?.trim()).filter((value): value is string => Boolean(value))));
}

function splitMetaList(value?: string | null): string[] {
  return unique((value ?? '').split(/[|,]/).map(item => item.trim()));
}

function toIsoDate(date: string, offsetDays = 0): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function timeLabel(event?: RegulatoryEvent | null): string {
  if (!event) return 'All day';
  if (event.allDay || !event.time) return 'All day';
  return `${event.time}${event.timeEnd ? ` - ${event.timeEnd}` : ''}`;
}

function normalizeStatus(value?: string | null): CesEventExecutionTaskStatus {
  const key = (value ?? '').toLowerCase().replace(/[-\s]+/g, '_');
  if (key === 'complete' || key === 'completed') return 'complete';
  if (key === 'locked') return 'locked';
  if (key === 'in_progress') return 'in_progress';
  if (key === 'ready') return 'ready';
  if (key === 'blocked') return 'blocked';
  if (key === 'missing' || key === 'needs_evidence') return 'needs_evidence';
  if (key === 'needs_signature') return 'needs_signature';
  if (key === 'awaiting_reviewer') return 'awaiting_reviewer';
  return 'pending';
}

function progressForStatus(status: CesEventExecutionTaskStatus): number {
  if (status === 'complete' || status === 'locked') return 100;
  if (status === 'in_progress') return 50;
  if (status === 'awaiting_reviewer' || status === 'needs_signature') return 40;
  if (status === 'needs_evidence') return 25;
  if (status === 'ready') return 10;
  return 0;
}

function normalizeEcignStatus(status?: string | null, requiredSignerRoles: string[] = []): { key: string; label: string; blockerText?: string } {
  const label = status?.trim() || (requiredSignerRoles.length ? 'Not started' : 'Not required');
  const lowered = label.toLowerCase();
  if (lowered.includes('missing canonical form instance')) {
    return {
      key: 'not_started_missing_canonical_form_instance',
      label,
      blockerText: 'eCign is blocked until the canonical form instance exists.',
    };
  }
  if (lowered.includes('complete') || lowered.includes('signed')) return { key: 'complete', label };
  if (lowered.includes('not required')) return { key: 'not_required', label };
  if (lowered.includes('started')) return { key: 'not_started', label };
  return {
    key: lowered.replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'unknown',
    label,
  };
}

function statusLabelFor(completionPercent: number, blockerText?: string): string {
  if (completionPercent >= 100) return 'Complete';
  if (blockerText) return 'Blocked';
  if (completionPercent > 0) return 'In progress';
  return 'Ready';
}

function findTemplate(workflowId?: string | null): EventTemplate | undefined {
  if (!workflowId) return undefined;
  return TEMPLATE_REGISTRY.find(template => template.id === workflowId);
}

function templateForms(template?: EventTemplate): EventEvidenceItem[] {
  return (template?.requiredForms ?? []).map(form => ({
    id: form.id,
    label: form.label,
    formId: form.formId,
    status: 'pending',
    dueOffsetDays: form.dueOffsetDays,
  }));
}

function eventForms(event?: RegulatoryEvent | null, template?: EventTemplate, workflowId?: string): EventEvidenceItem[] {
  if (event?.requiredForms?.length) return event.requiredForms;
  const fromTemplate = templateForms(template);
  if (fromTemplate.length) return fromTemplate;
  const workflow = workflowId ? WORKFLOWS[workflowId] : undefined;
  return (workflow?.requiredForms ?? []).map(formId => ({
    id: formId,
    label: resolveFormTitle(formId),
    formId,
    status: 'pending',
  }));
}

function eventSteps(event?: RegulatoryEvent | null, template?: EventTemplate, workflowId?: string): SourceStep[] {
  if (event?.processFlow?.length) {
    return event.processFlow.map(step => ({
      id: step.id,
      label: step.label,
      description: step.description,
      dueOffsetDays: step.dueOffsetDays,
      status: step.status,
      requiredFormIds: step.requiredFormIds,
      expectedOutput: step.expectedOutput,
    }));
  }

  if (template?.processFlow?.length) {
    return template.processFlow.map(step => ({
      id: step.id,
      label: step.label,
      description: step.description,
      dueOffsetDays: step.dueOffsetDays,
      requiredFormIds: step.requiredFormIds,
      expectedOutput: step.expectedOutput,
      ownerRole: template.ownerRole,
    }));
  }

  const workflow = workflowId ? WORKFLOWS[workflowId] : undefined;
  if (workflow?.steps?.length) {
    return workflow.steps.map(step => ({
      id: `STEP-${String(step.order).padStart(2, '0')}`,
      label: step.action,
      description: step.deadline ? `${step.action}. Deadline: ${step.deadline}.` : step.action,
      requiredFormIds: step.formIds,
      ownerRole: step.role,
    }));
  }

  return [{
    id: 'event-opened',
    label: 'Event opened',
    description: event?.summary ?? 'Event execution workspace opened.',
    dueOffsetDays: 0,
    status: 'ready',
    ownerRole: event?.ownerRole,
  }];
}

function formVm(form: EventEvidenceItem, event?: RegulatoryEvent | null, executionState?: CesEventExecutionStoreSnapshot | null): CesEventExecutionForm {
  const formId = form.formId ?? form.id;
  const live = event && executionState?.effectiveFormStatus ? executionState.effectiveFormStatus(event, formId) : undefined;
  const status: EventEvidenceItem['status'] = live === 'in-progress' || live === 'requires-review'
    ? 'in-progress'
    : live === 'missing'
      ? 'missing'
      : live === 'complete'
        ? 'complete'
        : form.status;
  return {
    id: form.id,
    title: form.label || resolveFormTitle(formId) || formId,
    formId,
    status,
    dueDate: event ? toIsoDate(event.date, form.dueOffsetDays ?? 0) : undefined,
  };
}

function taskStatus(step: SourceStep, index: number, event?: RegulatoryEvent | null, executionState?: CesEventExecutionStoreSnapshot | null): CesEventExecutionTaskStatus {
  const live = event && executionState?.effectiveStepStatus
    ? executionState.effectiveStepStatus(event, step.id)
    : undefined;
  if (live) return normalizeStatus(live);
  if (step.status) return normalizeStatus(step.status);
  return index === 0 ? 'ready' : 'pending';
}

function buildRoutes(
  eventId: string,
  workflowId: string | undefined,
  hub?: CesCalendarHubMeta | null,
  firstForm?: {
    formId: string;
    taskId: string;
    formInstanceId: string;
    requirementId: string;
    policyId?: string;
  },
): CesEventExecutionRoutes {
  const event = encodeURIComponent(eventId);
  const workflowQuery = workflowId ? `?workflowId=${encodeURIComponent(workflowId)}` : '';
  const formQuery = new URLSearchParams();
  formQuery.set('event_id', eventId);
  if (workflowId) formQuery.set('workflow_id', workflowId);
  if (firstForm) {
    formQuery.set('task_id', firstForm.taskId);
    formQuery.set('form_id', firstForm.formId);
    formQuery.set('form_instance_id', firstForm.formInstanceId);
    formQuery.set('requirement_id', firstForm.requirementId);
    if (firstForm.policyId) formQuery.set('policy_id', firstForm.policyId);
  }

  return {
    eventWorkspace: hub?.eventWorkspacePath ?? `/calendar/event/${event}`,
    fullSwimlane: hub?.swimlanePath ?? `/events/${event}/swimlane${workflowQuery}`,
    evidenceCenter: hub?.evidenceCenterPath ?? `/evidence?eventId=${event}`,
    auditMode: hub?.auditModePath ?? `/audit?eventId=${event}`,
    ecignSigning: firstForm?.formId ? `/forms/${encodeURIComponent(firstForm.formId)}?${formQuery.toString()}` : `/forms?eventId=${event}`,
    packetPreview: `/audit?eventId=${event}&packet=preview`,
    driveFolder: hub?.driveFolderUrl,
  };
}

function weightedCompletion(input: {
  taskRatio: number;
  evidenceRatio: number;
  formRatio: number;
  signatureRatio: number;
  auditCloseoutRatio: number;
}) {
  const breakdown = {
    tasks: Math.round(input.taskRatio * 35),
    evidence: Math.round(input.evidenceRatio * 25),
    forms: Math.round(input.formRatio * 15),
    signatures: Math.round(input.signatureRatio * 15),
    auditCloseout: Math.round(input.auditCloseoutRatio * 10),
  };
  return {
    percent: Math.min(100, Math.max(0, breakdown.tasks + breakdown.evidence + breakdown.forms + breakdown.signatures + breakdown.auditCloseout)),
    breakdown,
  };
}

export function buildCesEventExecutionViewModel(input: BuildCesEventExecutionViewModelInput): CesEventExecutionViewModel {
  const event = input.regulatoryEvent ?? null;
  const workflowId = input.workflowId ?? input.hub?.workflowId ?? event?.workflowId;
  const template = findTemplate(workflowId);
  const workflow = workflowId ? WORKFLOWS[workflowId] : undefined;
  const forms = eventForms(event, template, workflowId).map(form => formVm(form, event, input.executionState));
  const steps = eventSteps(event, template, workflowId);
  const requiredEvidence = unique([
    ...splitMetaList(input.hub?.requiredEvidence),
    ...forms.map(form => form.title),
    ...(event?.minutes ? ['Finalized minutes'] : []),
    ...(template?.minutes ? ['Finalized minutes'] : []),
    ...(event?.approvals ?? []).map(approval => `${approval.targetLabel} approval by ${approval.approverRole}`),
    ...(template?.approvals ?? []).map(approval => `${approval.targetLabel} approval by ${approval.approverRole}`),
  ]);
  const requiredSignerRoles = unique([
    ...splitMetaList(input.hub?.requiredSignerRoles),
    ...(event?.minutes?.signOffRoles ?? []),
    ...(template?.minutes?.signOffRoles ?? []),
    ...(event?.approvals ?? []).map(approval => approval.approverRole),
    ...(template?.approvals ?? []).map(approval => approval.approverRole),
  ]);
  const phases = steps.map((step, index) => ({
    id: `phase-${index + 1}`,
    title: step.label,
    order: index + 1,
  }));
  const formById = new Map(forms.flatMap(form => [form.id, form.formId].filter(Boolean).map(id => [id, form] as const)));
  const tasks = steps.map((step, index): CesEventExecutionTask => {
    const phase = phases[index];
    const status = taskStatus(step, index, event, input.executionState);
    const taskForms = unique(step.requiredFormIds ?? []).map(formId => formById.get(formId) ?? {
      id: formId,
      title: resolveFormTitle(formId) ?? formId,
      formId,
      status: 'pending' as const,
    });
    const taskEvidence = unique([
      step.expectedOutput,
      ...taskForms.map(form => form.title),
    ]);
    const id = `${input.eventId}-${step.id}`;
    return {
      id,
      sourceStepId: step.id,
      title: step.label,
      description: step.description,
      ownerRole: step.ownerRole ?? event?.ownerRole ?? template?.ownerRole ?? workflow?.roles.primary[0] ?? 'Assigned Owner',
      dueDate: event ? toIsoDate(event.date, step.dueOffsetDays ?? 0) : undefined,
      status,
      progress: progressForStatus(status),
      phaseId: phase.id,
      phaseTitle: phase.title,
      requiredForms: taskForms,
      requiredEvidence: taskEvidence,
      requiredSignerRoles: index === steps.length - 1 ? requiredSignerRoles : [],
      dependencyIds: index > 0 ? [`${input.eventId}-${steps[index - 1].id}`] : [],
      nextTaskIds: index < steps.length - 1 ? [`${input.eventId}-${steps[index + 1].id}`] : [],
    };
  });

  const completeTaskCount = tasks.filter(task => task.status === 'complete' || task.status === 'locked').length;
  const completeFormCount = forms.filter(form => form.status === 'complete').length;
  const evidenceCount = input.hub?.evidenceCount ?? requiredEvidence.length;
  const attachedDriveEvidenceCount = Math.min(evidenceCount, input.hub?.evidenceAttachedCount ?? 0);
  const ecign = normalizeEcignStatus(input.hub?.ecignStatus, requiredSignerRoles);
  const taskRatio = tasks.length ? completeTaskCount / tasks.length : 0;
  const evidenceRatio = evidenceCount ? attachedDriveEvidenceCount / evidenceCount : 0;
  const formRatio = forms.length ? completeFormCount / forms.length : 0;
  const signatureRatio = requiredSignerRoles.length ? (ecign.key === 'complete' ? 1 : 0) : 1;
  const auditCloseoutRatio = event && input.executionState?.isCertified?.(event.id) ? 1 : event?.urgency === 'complete' ? 1 : 0;
  const completion = weightedCompletion({ taskRatio, evidenceRatio, formRatio, signatureRatio, auditCloseoutRatio });
  const blockerText = ecign.blockerText ?? (forms.some(form => form.status === 'missing') ? 'Required form evidence is missing.' : undefined);
  const firstTaskWithForm = tasks.find(task => task.requiredForms.some(form => form.formId || form.id));
  const firstTaskForm = firstTaskWithForm?.requiredForms.find(form => form.formId || form.id);
  const firstFormId = firstTaskForm ? (firstTaskForm.formId ?? firstTaskForm.id) : undefined;
  const firstFormRouteContext = firstTaskWithForm && firstFormId ? {
    formId: firstFormId,
    taskId: firstTaskWithForm.id,
    formInstanceId: firstTaskForm?.formInstanceId ?? formatCesFormInstanceId(input.eventId, firstFormId, 1),
    requirementId: `${firstTaskWithForm.id}::FORM_COMPLETION::${firstFormId}`,
    policyId: event?.policyRefs?.[0],
  } : undefined;
  const routes = buildRoutes(input.eventId, workflowId ?? undefined, input.hub, firstFormRouteContext);
  const statusLabel = input.hub?.statusLabel ?? statusLabelFor(completion.percent, blockerText);
  const policyRefs = event?.policyRefs?.length
    ? unique([...event.policyRefs, ...splitMetaList(input.hub?.policyRefs)])
    : unique([
      ...(template?.policyRefs ?? []),
      ...(workflow?.policyRefs ?? []),
      ...splitMetaList(input.hub?.policyRefs),
    ]);

  return {
    eventId: input.eventId,
    title: event?.title ?? template?.title ?? workflow?.title ?? input.eventId,
    date: event?.date ?? '',
    timeLabel: timeLabel(event),
    domain: event?.domain ?? template?.domain ?? workflow?.domain ?? 'Compliance',
    category: event?.category ?? template?.category,
    cadence: event?.cadence ?? template?.cadence,
    owner: event?.owner ?? template?.owner ?? 'Assigned Owner',
    ownerRole: event?.ownerRole ?? template?.ownerRole ?? workflow?.roles.primary[0] ?? 'Assigned Owner',
    workflowId: workflowId ?? undefined,
    workflowTitle: template?.title ?? workflow?.title ?? workflowId ?? 'No workflow mapped',
    policyRefs,
    requiredForms: forms,
    requiredEvidence,
    requiredSignerRoles,
    phases,
    tasks,
    evidenceCount,
    attachedDriveEvidenceCount,
    driveLinked: input.hub?.driveLinked ?? Boolean(input.hub?.driveFolderUrl),
    driveFolderUrl: input.hub?.driveFolderUrl,
    googleCalendarEventId: input.googleCalendarEventId,
    calendarAttachmentStatus: input.hub?.calendarAttachmentStatus ?? 'Unknown',
    calendarAttachmentCount: input.hub?.calendarAttachmentStatus ? 1 : 0,
    ecignStatus: ecign.key,
    ecignDisplayStatus: ecign.label,
    signedPackageStatus: completion.percent >= 100 && ecign.key === 'complete' ? 'complete' : 'pending',
    blockerText,
    completionPercent: completion.percent,
    auditReadinessPercent: completion.percent,
    completionBreakdown: completion.breakdown,
    statusLabel,
    routes,
  };
}

function laneForRole(role: string, lanes: SwimlaneLane[]): SwimlaneLane {
  const existing = lanes.find(lane => lane.title === role);
  if (existing) return existing;
  const lane: SwimlaneLane = {
    id: `lane-${lanes.length + 1}`,
    title: role,
    roleKey: role.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    order: lanes.length + 1,
  };
  lanes.push(lane);
  return lane;
}

function toSwimlaneStatus(status: CesEventExecutionTaskStatus): SwimlaneStatus {
  if (status === 'in_progress') return 'in_progress';
  if (status === 'needs_evidence') return 'needs_evidence';
  if (status === 'needs_signature') return 'needs_signature';
  if (status === 'awaiting_reviewer') return 'awaiting_reviewer';
  if (status === 'complete') return 'complete';
  if (status === 'locked') return 'locked';
  if (status === 'blocked') return 'blocked';
  if (status === 'ready') return 'ready';
  return 'pending';
}

export function buildReadonlyCesSwimlaneModel(viewModel: CesEventExecutionViewModel): SwimlaneModel {
  const lanes: SwimlaneLane[] = [];
  const phases = viewModel.phases.map(phase => ({ id: phase.id, title: phase.title, order: phase.order }));
  const nodeIdByTaskId = new Map<string, string>();

  viewModel.tasks.forEach((task, index) => {
    nodeIdByTaskId.set(task.id, buildCanonicalEventSwimlaneNodeId({
      eventId: viewModel.eventId,
      workflowId: viewModel.workflowId,
      sourceStepId: task.sourceStepId,
      stepOrder: index + 1,
    }));
  });

  const nodes: SwimlaneNode[] = viewModel.tasks.map((task, index) => {
    const lane = laneForRole(task.ownerRole, lanes);
    const nodeId = nodeIdByTaskId.get(task.id)!;
    const taskId = buildCanonicalEventSwimlaneTaskId({
      eventId: viewModel.eventId,
      workflowId: viewModel.workflowId,
      sourceStepId: task.sourceStepId,
      stepOrder: index + 1,
    });
    const requiredFormIds = unique(task.requiredForms.map(form => form.formId ?? form.id));
    return {
      nodeId,
      taskId,
      workflowId: viewModel.workflowId,
      eventId: viewModel.eventId,
      sourceStepId: task.sourceStepId,
      processFlowStepId: task.sourceStepId,
      phaseId: task.phaseId,
      laneId: lane.id,
      title: task.title,
      shortDescription: task.description,
      ownerRole: task.ownerRole,
      status: toSwimlaneStatus(task.status),
      requiredForms: requiredFormIds,
      formInstances: task.requiredForms.map(form => ({
        formId: form.formId ?? form.id,
        formTitle: form.title,
        formInstanceId: form.formInstanceId,
        status: form.status === 'complete' ? 'complete' : form.status === 'missing' ? 'blocked' : 'pending',
        missing: !form.formInstanceId,
        requiredAdditionalDocumentation: false,
        supportingDocumentation: [],
      })),
      requiredEvidence: task.requiredEvidence,
      supportingDocumentationTasks: [],
      instructions: [
        task.description,
        `Progress: ${task.progress}%`,
        `Completion source: shared CES event execution adapter (${viewModel.completionPercent}%).`,
      ],
      signerRole: task.requiredSignerRoles[0],
      reviewerRole: task.requiredSignerRoles[1],
      reviewerRoles: task.requiredSignerRoles.slice(1),
      finalApproverRoles: task.requiredSignerRoles,
      artifactBlockedReasons: unique([viewModel.blockerText, task.blockerText]),
      dependencies: task.dependencyIds.map(id => nodeIdByTaskId.get(id)).filter((id): id is string => Boolean(id)),
      nextNodeIds: task.nextTaskIds.map(id => nodeIdByTaskId.get(id)).filter((id): id is string => Boolean(id)),
      auditPurpose: viewModel.blockerText ?? 'Read-only process visualization from canonical CES event execution view model.',
      policyRefs: viewModel.policyRefs,
      sourceType: 'generated',
    };
  });

  return {
    id: `${viewModel.eventId}-readonly-ces-swimlane`,
    workflowId: viewModel.workflowId,
    eventId: viewModel.eventId,
    title: viewModel.title,
    description: `${viewModel.workflowTitle} - read-only process visualization.`,
    sourceType: 'generated',
    mode: 'event_execution',
    phases,
    lanes,
    nodes,
    edges: nodes.flatMap(node => node.nextNodeIds.map(toNodeId => ({
      fromNodeId: node.nodeId,
      toNodeId,
      route: 'orthogonal' as const,
    }))),
    requiredForms: unique(viewModel.requiredForms.map(form => form.formId ?? form.id)),
    policyRefs: viewModel.policyRefs,
    evidenceRequirements: viewModel.requiredEvidence,
    missingContext: viewModel.blockerText ? [viewModel.blockerText] : [],
    routePath: viewModel.routes.fullSwimlane,
    readOnly: true,
    completionPercent: viewModel.completionPercent,
    auditReadinessPercent: viewModel.auditReadinessPercent,
    evidenceAttachedCount: viewModel.attachedDriveEvidenceCount,
    evidenceCount: viewModel.evidenceCount,
    ecignStatus: viewModel.ecignStatus,
    ecignDisplayStatus: viewModel.ecignDisplayStatus,
    calendarAttachmentStatus: viewModel.calendarAttachmentStatus,
    driveLinked: viewModel.driveLinked,
    driveFolderUrl: viewModel.driveFolderUrl,
    blockerText: viewModel.blockerText,
  };
}
