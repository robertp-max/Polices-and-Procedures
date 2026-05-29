import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventTask, EventTaskStatus } from './types';
import { resolveEventFolder } from './eventFolders';
import { buildCesRoleAssignment } from '@/policy/ces/cesRoles';
import { formatCesFormInstanceId } from './cesFormInstanceId';

const nowISO = () => new Date().toISOString();

const toTaskStatus = (status?: string): EventTaskStatus => {
  if (status === 'complete' || status === 'finalized') return 'completed';
  if (status === 'in-progress' || status === 'draft' || status === 'pending') return 'in_progress';
  return 'not_started';
};

export function deriveDefaultEventTasks(
  event: RegulatoryEvent,
  eventId: string,
  options?: {
    stepStatusById?: Record<string, string>;
    formStatusById?: Record<string, string>;
    approvalsById?: Record<string, string>;
  },
): EventTask[] {
  const timestamp = nowISO();
  const folder = resolveEventFolder(eventId);
  const tasks: EventTask[] = [];
  const formSequenceById = new Map<string, number>();

  const allocateFormInstanceIds = (formIds: string[]) => formIds.map(formId => {
    const sequence = (formSequenceById.get(formId) ?? 0) + 1;
    formSequenceById.set(formId, sequence);
    return formatCesFormInstanceId(eventId, formId, sequence);
  });

  const requiredFormCovered = new Set<string>();
  event.processFlow.forEach(step => {
    (step.requiredFormIds ?? []).forEach(fid => requiredFormCovered.add(fid));
    const taskSourceId = `processFlow:${step.id}`;
    const ra = buildCesRoleAssignment({
      domain:         event.domain,
      taskSourceType: 'processFlow',
      ownerRole:      event.ownerRole,
      title:          step.label,
      workflowId:     event.workflowId,
    });
    const formIds = step.requiredFormIds ?? [];
    tasks.push({
      id: buildDeterministicTaskId(eventId, taskSourceId),
      eventId,
      taskSourceId,
      taskSourceType: 'processFlow',
      workflowId: event.workflowId,
      isRequired: true,
      requirementSource: event.workflowId ? 'workflow' : 'regulation',
      policyIds: event.policyRefs,
      formIds,
      generated_form_instance_ids: allocateFormInstanceIds(formIds),
      title: step.label,
      description: step.description,
      source: 'processFlow',
      status: toTaskStatus(options?.stepStatusById?.[step.id] ?? step.status),
      ownerRole: event.ownerRole,
      dueDate: dueDateFromOffset(event.date, step.dueOffsetDays),
      folderPath: `${folder.paths.tasksDir}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false,
      assignedRole:     ra.assignedRole,
      accountableRole:  ra.accountableRole,
      reviewerRole:     ra.reviewerRole,
      approverRole:     ra.approverRole,
      canCompleteRoles: ra.canCompleteRoles,
      canReviewRoles:   ra.canReviewRoles,
      canApproveRoles:  ra.canApproveRoles,
      escalationRole:   ra.escalationRole,
      blocksOnSignerTasks: (step.requiredFormIds?.length ?? 0) > 0,
    });
  });

  event.requiredForms.forEach(form => {
    const represented = requiredFormCovered.has(form.id) || (form.formId ? requiredFormCovered.has(form.formId) : false);
    if (represented) return;
    const formId = form.formId ?? form.id;
    const taskSourceId = `form:${formId}`;
    const ra = buildCesRoleAssignment({
      domain:         event.domain,
      taskSourceType: 'requiredForm',
      ownerRole:      event.ownerRole,
      title:          form.label,
      workflowId:     event.workflowId,
    });
    const formIds = [formId];
    tasks.push({
      id: buildDeterministicTaskId(eventId, taskSourceId),
      eventId,
      taskSourceId,
      taskSourceType: 'requiredForm',
      workflowId: event.workflowId,
      isRequired: true,
      requirementSource: 'policy',
      policyIds: event.policyRefs,
      formIds,
      generated_form_instance_ids: allocateFormInstanceIds(formIds),
      title: `Complete ${form.label}`,
      description: `Required form ${formId}`,
      source: 'requiredForm',
      status: toTaskStatus(options?.formStatusById?.[form.id] ?? form.status),
      ownerRole: event.ownerRole,
      dueDate: dueDateFromOffset(event.date, form.dueOffsetDays ?? 0),
      folderPath: `${folder.paths.tasksDir}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false,
      assignedRole:     ra.assignedRole,
      accountableRole:  ra.accountableRole,
      reviewerRole:     ra.reviewerRole,
      approverRole:     ra.approverRole,
      canCompleteRoles: ra.canCompleteRoles,
      canReviewRoles:   ra.canReviewRoles,
      canApproveRoles:  ra.canApproveRoles,
      escalationRole:   ra.escalationRole,
      blocksOnSignerTasks: true,
    });
  });

  if (event.minutes) {
    const taskSourceId = `minutes:${eventId}`;
    const ra = buildCesRoleAssignment({
      domain:         event.domain,
      taskSourceType: 'minutes',
      ownerRole:      event.ownerRole,
      title:          'Finalize meeting minutes',
      workflowId:     event.workflowId,
    });
    tasks.push({
      id: buildDeterministicTaskId(eventId, taskSourceId),
      eventId,
      taskSourceId,
      taskSourceType: 'minutes',
      workflowId: event.workflowId,
      isRequired: true,
      requirementSource: 'regulation',
      policyIds: event.policyRefs,
      formIds: [],
      title: 'Finalize meeting minutes',
      description: 'Complete and finalize required minutes evidence.',
      source: 'generated',
      status: toTaskStatus(event.minutes.status),
      ownerRole: event.minutes.assignee ? undefined : event.ownerRole,
      ownerUserId: event.minutes.assignee,
      dueDate: dueDateFromOffset(event.date, event.minutes.dueOffsetDays),
      folderPath: `${folder.paths.tasksDir}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false,
      assignedRole:     ra.assignedRole,
      accountableRole:  ra.accountableRole,
      reviewerRole:     ra.reviewerRole,
      approverRole:     ra.approverRole,
      canCompleteRoles: ra.canCompleteRoles,
      canReviewRoles:   ra.canReviewRoles,
      canApproveRoles:  ra.canApproveRoles,
      escalationRole:   ra.escalationRole,
    });
  }

  (event.approvals ?? []).forEach(approval => {
    const taskSourceId = `approval:${approval.id ?? `${approval.targetKind}:${approval.targetLabel}`}`;
    const ra = buildCesRoleAssignment({
      domain:         event.domain,
      taskSourceType: 'approval',
      ownerRole:      approval.approverRole ?? event.ownerRole,
      title:          `Approval: ${approval.targetLabel}`,
      workflowId:     event.workflowId,
    });
    tasks.push({
      id: buildDeterministicTaskId(eventId, taskSourceId),
      eventId,
      taskSourceId,
      taskSourceType: 'approval',
      workflowId: event.workflowId,
      isRequired: !!approval.required,
      requirementSource: approval.required ? 'regulation' : 'system',
      policyIds: event.policyRefs,
      formIds: [],
      title: `Approval: ${approval.targetLabel}`,
      description: `Required ${approval.targetKind} approval`,
      source: 'approval',
      status: options?.approvalsById?.[approval.id] === 'approved' ? 'completed' : 'awaiting_signature',
      ownerRole: approval.approverRole,
      dueDate: approval.escalationDays != null ? dueDateFromOffset(event.date, approval.escalationDays) : event.date,
      folderPath: `${folder.paths.tasksDir}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      isDeleted: false,
      assignedRole:     ra.assignedRole,
      accountableRole:  ra.accountableRole,
      reviewerRole:     ra.reviewerRole,
      approverRole:     ra.approverRole,
      canCompleteRoles: ra.canCompleteRoles,
      canReviewRoles:   ra.canReviewRoles,
      canApproveRoles:  ra.canApproveRoles,
      escalationRole:   ra.escalationRole,
    });
  });

  return tasks;
}

function dueDateFromOffset(baseDate: string, offsetDays: number): string {
  const d = new Date(`${baseDate}T00:00:00`);
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toISOString().slice(0, 10);
}

/** Stable id for CES event tasks; used by overrides merge and store helpers. */
export function buildDeterministicTaskId(eventId: string, taskSourceId: string): string {
  const hash = stableHash(taskSourceId);
  const slug = taskSourceId
    .replace(/[^A-Za-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42)
    .toUpperCase();
  return `TASK-${eventId}-${slug}-${hash}`;
}

function stableHash(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) + hash) ^ value.charCodeAt(i);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, '0').slice(-6);
}
