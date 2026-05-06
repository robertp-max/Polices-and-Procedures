import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { EventTask, EventTaskStatus } from './types';
import { resolveEventFolder } from './eventFolders';

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

  const requiredFormCovered = new Set<string>();
  event.processFlow.forEach(step => {
    (step.requiredFormIds ?? []).forEach(fid => requiredFormCovered.add(fid));
    const taskSourceId = `processFlow:${step.id}`;
    tasks.push({
      id: buildDeterministicTaskId(eventId, taskSourceId),
      eventId,
      taskSourceId,
      taskSourceType: 'processFlow',
      workflowId: event.workflowId,
      isRequired: true,
      requirementSource: event.workflowId ? 'workflow' : 'regulation',
      policyIds: event.policyRefs,
      formIds: step.requiredFormIds ?? [],
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
    });
  });

  event.requiredForms.forEach(form => {
    const represented = requiredFormCovered.has(form.id) || (form.formId ? requiredFormCovered.has(form.formId) : false);
    if (represented) return;
    const formId = form.formId ?? form.id;
    const taskSourceId = `form:${formId}`;
    tasks.push({
      id: buildDeterministicTaskId(eventId, taskSourceId),
      eventId,
      taskSourceId,
      taskSourceType: 'requiredForm',
      workflowId: event.workflowId,
      isRequired: true,
      requirementSource: 'policy',
      policyIds: event.policyRefs,
      formIds: [formId],
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
    });
  });

  if (event.minutes) {
    const taskSourceId = `minutes:${eventId}`;
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
    });
  }

  (event.approvals ?? []).forEach(approval => {
    const taskSourceId = `approval:${approval.id ?? `${approval.targetKind}:${approval.targetLabel}`}`;
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
    });
  });

  return tasks;
}

function dueDateFromOffset(baseDate: string, offsetDays: number): string {
  const d = new Date(`${baseDate}T00:00:00`);
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toISOString().slice(0, 10);
}

function buildDeterministicTaskId(eventId: string, taskSourceId: string): string {
  const slug = taskSourceId
    .replace(/[^A-Za-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
    .toUpperCase();
  return `TASK-${eventId}-${slug}`;
}
