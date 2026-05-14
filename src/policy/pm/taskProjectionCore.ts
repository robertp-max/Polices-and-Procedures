/**
 * taskProjectionCore — PURE projection logic.
 *
 * No React imports. No store imports.
 * Imports only pure id helpers from `compliance-execution/cesFormInstanceId`.
 * Suitable for tsx scripts and unit verification.
 *
 * The React-bound hook lives in `taskProjection.ts`.
 */

import {
  deriveEcignPacketStatus,
  derivePmTaskStatus,
  inferEcignInternalFromCesFormStatus,
} from './ecignStatusMap';
import { FORMS_DATASET } from '../data/formsLibraryDataset';
import { FORMS_CATALOG } from '../data/formsCatalog';
import type { PmOverlay } from './pmOverlayStore.types';
import { inferSprintIdFromDate } from './sprintId';
import type {
  EcignPacket,
  EcignSubmissionTask,
  NonFormCesTask,
  PacketSnapshot,
  PmTaskStatus,
  Task,
} from './types';
import { formatCesFormInstanceId } from '../compliance-execution/cesFormInstanceId';

/* ─── Minimal external shapes used by the projector ─────────────────── */
export interface ProjectorFormState {
  status: 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';
}

export interface ProjectorEventForm {
  id: string;
  label: string;
  formId?: string;
}

export interface ProjectorEventStep {
  id: string;
  label: string;
  description?: string;
  status: 'complete' | 'in-progress' | 'pending';
  dueOffsetDays?: number;
  requiredFormIds?: string[];
  storyPoints?: 1 | 2 | 3 | 5 | 8;
}

export interface ProjectorEvent {
  id: string;
  title?: string;
  workflowId?: string;
  workflowTitle?: string;
  policyRefs?: string[];
  complianceFlags?: { auditRisk?: 'low' | 'medium' | 'high' | 'critical' };
  /** Calendar date for the event (YYYY-MM-DD). Used as default task due_date. */
  date?: string;
  /** Optional end date (YYYY-MM-DD). Preferred over `date` for due-date default. */
  endDate?: string;
  requiredForms: ProjectorEventForm[];
  processFlow: ProjectorEventStep[];
}

/** Per-event allocator: sequences match `regulatoryExecutionStore.getOrCreateFormInstance`. */
function createFormInstanceIdAllocator(eventId: string): (formId: string) => string {
  const seqByForm = new Map<string, number>();
  return (formId: string) => {
    const next = (seqByForm.get(formId) ?? 0) + 1;
    seqByForm.set(formId, next);
    return formatCesFormInstanceId(eventId, formId, next);
  };
}

const TEMPLATE_FORMS = new Set<string>([
  ...FORMS_DATASET.map(f => f.id),
  ...Object.keys(FORMS_CATALOG),
]);

function resolveTemplateFormId(form: ProjectorEventForm): string | undefined {
  const candidate = form.formId ?? form.id;
  return TEMPLATE_FORMS.has(candidate) ? candidate : undefined;
}

function riskFromEvent(event: ProjectorEvent): 'low' | 'medium' | 'high' | 'critical' {
  return event.complianceFlags?.auditRisk ?? 'medium';
}

function priorityFromRisk(risk: 'low' | 'medium' | 'high' | 'critical'): 'low' | 'medium' | 'high' | 'critical' {
  return risk;
}

export interface ProjectorInput {
  events: ProjectorEvent[];
  /** Flat key = `${eventId}::${formId}` (matches CES store). */
  formStates: Record<string, ProjectorFormState>;
  /** Flat key = `${eventId}::${stepId}`. Overrides processFlow step status when present. */
  stepStates?: Record<string, string>;
  overlays: Record<string, PmOverlay>;
}

const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));
const formKey = (eventId: string, formId: string) => `${eventId}::${formId}`;
const stepKey = (eventId: string, stepId: string) => `${eventId}::${stepId}`;

/** task_id format: "{event.id}-{NN}" */
function makeCesTaskId(eventId: string, ordinal: number): string {
  return `${eventId}-${pad2(ordinal)}`;
}

function parseIsoDate(date?: string): Date | null {
  if (!date) return null;
  const d = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function isWeekendUtc(date: Date): boolean {
  const day = date.getUTCDay();
  return day === 0 || day === 6;
}

function shiftToBusinessDay(date: Date, direction: 1 | -1): Date {
  const out = new Date(date.getTime());
  while (isWeekendUtc(out)) out.setUTCDate(out.getUTCDate() + direction);
  return out;
}

function addDays(date: Date, days: number): Date {
  const out = new Date(date.getTime());
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

function maxIsoDate(values: Array<string | undefined>): string | undefined {
  const filtered = values.filter(Boolean) as string[];
  if (filtered.length === 0) return undefined;
  return filtered.reduce((a, b) => (a > b ? a : b));
}

function snapshotFromFormState(formState: ProjectorFormState | undefined): PacketSnapshot {
  const cesStatus = formState?.status ?? 'missing';
  const internal = inferEcignInternalFromCesFormStatus(cesStatus, Boolean(formState));
  return {
    internal,
    requiredSignersCount: 1,
    signedCount: cesStatus === 'complete' ? 1 : 0,
    approvalRequired: cesStatus === 'requires-review' || cesStatus === 'complete',
    approvalDecision: cesStatus === 'complete' ? 'approved' : undefined,
    hasValidatedEvidence: cesStatus === 'complete',
  };
}

function packetFromSnapshot(formId: string, snap: PacketSnapshot): EcignPacket {
  return {
    packet_id: `pkt:${formId}`,
    form_id: formId,
    internal: snap.internal,
    packet_status: deriveEcignPacketStatus(snap),
    signers: [],
    approvals: [],
    evidence: snap.hasValidatedEvidence
      ? {
          evidence_id: `ev:${formId}`,
          status: 'validated',
          created_at: new Date().toISOString(),
        }
      : undefined,
    recent_audit_refs: [],
  };
}

function applyOverlay<T extends EcignSubmissionTask | NonFormCesTask>(
  task: T,
  overlay: PmOverlay | undefined,
): T {
  const mergedDeps = Array.from(
    new Set([...(task.depends_on ?? task.dependencies ?? []), ...overlay?.dependencies ?? []]),
  );
  const dueDate = overlay?.due_date ?? task.due_date;
  const sprintId = overlay?.sprint_id ?? task.sprint_id ?? inferSprintIdFromDate(dueDate);
  if (!overlay) return task;
  return {
    ...task,
    assigned_user_id: overlay.assigned_user_id ?? task.assigned_user_id,
    assignee: overlay.assigned_user_id ?? task.assignee,
    story_points: overlay.story_points ?? task.story_points,
    due_date: overlay.due_date ?? task.due_date,
    depends_on: mergedDeps,
    dependencies: mergedDeps,
    // Apply overlay start_date if provided, otherwise keep task's computed start;
    // clamp so start never exceeds due_date.
    start_date: (() => {
      const base = overlay.start_date ?? task.start_date;
      return base > dueDate ? dueDate : base;
    })(),
    sprint_id: sprintId,
    weekend_override: overlay.weekend_override ?? task.weekend_override,
  };
}

export function projectTasks(input: ProjectorInput): Task[] {
  const tasks: Task[] = [];
  const firstTaskByEvent = new Map<string, string>();
  const lastTaskByEvent = new Map<string, string>();

  const taskById = new Map<string, EcignSubmissionTask | NonFormCesTask>();

  for (const event of input.events) {
    let ordinal = 1;
    const nextFormInstanceId = createFormInstanceIdAllocator(event.id);
    const eventDueDate = (event.endDate ?? event.date ?? new Date().toISOString().slice(0, 10)).slice(0, 10);
    const eventDue = shiftToBusinessDay(parseIsoDate(eventDueDate) ?? new Date(), 1);
    const defaultDue = toIsoDate(eventDue);
    const eventRisk = riskFromEvent(event);
    const eventPriority = priorityFromRisk(eventRisk);
    const eventTitle = event.title ?? event.id;
    const workflowTitle = event.workflowTitle ?? event.workflowId ?? 'Unlinked workflow';

    const formMetaById = new Map<string, ProjectorEventForm>();
    for (const form of event.requiredForms) formMetaById.set(form.id, form);
    const formsConsumedBySteps = new Set<string>();
    const eventTaskIds: string[] = [];

    const pushTask = (task: EcignSubmissionTask | NonFormCesTask): void => {
      const projected = applyOverlay(task, input.overlays[task.task_id]);
      tasks.push(projected);
      taskById.set(projected.task_id, projected);
      eventTaskIds.push(projected.task_id);
    };

    for (const step of event.processFlow) {
      const stepTaskId = makeCesTaskId(event.id, ordinal++);
      const linkedForms = (step.requiredFormIds ?? [])
        .map(id => formMetaById.get(id))
        .filter((f): f is ProjectorEventForm => Boolean(f));
      for (const lf of linkedForms) formsConsumedBySteps.add(lf.id);

      const stepDue = step.dueOffsetDays !== undefined
        ? toIsoDate(shiftToBusinessDay(addDays(eventDue, step.dueOffsetDays), 1))
        : defaultDue;

      const previousTaskId = eventTaskIds[eventTaskIds.length - 1];
      const stepDependsOn = previousTaskId ? [previousTaskId] : [];

      // If stepStates dict was provided, it is the authority. Source
      // event processFlow status is treated as a static template hint
      // only when no store-managed state is available at all.
      const sk = stepKey(event.id, step.id);
      const storeVal = input.stepStates?.[sk];
      const useStoreBased = input.stepStates !== undefined;
      const effectiveStepSrc = useStoreBased
        ? (storeVal === 'complete' ? 'complete' : storeVal === 'in-progress' ? 'in-progress' : 'pending')
        : step.status;
      const stepStatus: PmTaskStatus =
        effectiveStepSrc === 'complete'
          ? 'done'
          : effectiveStepSrc === 'in-progress'
            ? 'in_progress'
            : 'todo';

      const nominalStart = toIsoDate(shiftToBusinessDay(addDays(parseIsoDate(stepDue) ?? eventDue, -1), -1));

      const linkedFormInstanceIds = linkedForms.map(form => {
        const fid = resolveTemplateFormId(form) ?? (form.formId ?? form.id);
        return nextFormInstanceId(fid);
      });

      const stepTask: NonFormCesTask = {
        task_id: stepTaskId,
        source: 'CES',
        task_type: 'workflow_step',
        event_id: event.id,
        event_title: eventTitle,
        workflow_id: event.workflowId ?? '',
        workflow_title: workflowTitle,
        policy_id: event.policyRefs?.[0],
        policy_refs: event.policyRefs ?? [],
        form_refs: linkedForms.map(resolveTemplateFormId).filter((x): x is string => Boolean(x)),
        generated_form_instance_ids: linkedFormInstanceIds,
        source_form_id: linkedForms.map(resolveTemplateFormId).find(Boolean),
        priority: eventPriority,
        risk: eventRisk,
        blockers: [],
        policyRefs: event.policyRefs,
        step_id: step.id,
        title: step.label,
        description: step.description,
        status: stepStatus,
        start_date: nominalStart,
        assigned_user_id: undefined,
        assignee: undefined,
        owner: undefined,
        due_date: stepDue,
        sprint_id: inferSprintIdFromDate(stepDue),
        story_points: step.storyPoints,
        depends_on: stepDependsOn,
        dependencies: stepDependsOn,
      };
      pushTask(stepTask);

      for (let formIdx = 0; formIdx < linkedForms.length; formIdx += 1) {
        const form = linkedForms[formIdx];
        const resolvedFormId = resolveTemplateFormId(form) ?? (form.formId ?? form.id);
        const instanceId = linkedFormInstanceIds[formIdx] ?? nextFormInstanceId(resolvedFormId);
        const completionTaskId = makeCesTaskId(event.id, ordinal++);
        const reviewTaskId = makeCesTaskId(event.id, ordinal++);

        const formState = input.formStates[formKey(event.id, form.id)];
        const snap = snapshotFromFormState(formState);
        const packet = resolvedFormId ? packetFromSnapshot(resolvedFormId, snap) : undefined;

        const completionBase: EcignSubmissionTask = {
          task_id: completionTaskId,
          source: 'CES',
          task_type: 'form_completion',
          event_id: event.id,
          event_title: eventTitle,
          workflow_id: event.workflowId ?? '',
          workflow_title: workflowTitle,
          policy_id: event.policyRefs?.[0],
          policy_refs: event.policyRefs ?? [],
          form_refs: resolveTemplateFormId(form) ? [resolvedFormId] : [],
          generated_form_instance_ids: [instanceId],
          source_form_id: resolveTemplateFormId(form),
          priority: eventPriority,
          risk: eventRisk,
          blockers: [],
          policyRefs: event.policyRefs,
          step_id: step.id,
          form_id: resolvedFormId,
          form_ids: [resolvedFormId],
          ecign_packet_id: packet?.packet_id,
          packet,
          packets: packet ? [packet] : [],
          title: `Complete ${form.label}`,
          description: `Fill event-specific form instance ${instanceId}.`,
          status: derivePmTaskStatus(snap),
          packet_status: deriveEcignPacketStatus(snap),
          start_date: nominalStart,
          due_date: stepDue,
          sprint_id: inferSprintIdFromDate(stepDue),
          assigned_user_id: undefined,
          assignee: undefined,
          owner: undefined,
          required_signers: [],
          approvers: [],
          depends_on: [stepTaskId],
          dependencies: [stepTaskId],
          story_points: 1,
          evidence_id: packet?.evidence?.evidence_id,
          audit_log_refs: [],
        };
        pushTask(completionBase);

        const reviewBase: EcignSubmissionTask = {
          task_id: reviewTaskId,
          source: 'CES',
          task_type: 'form_review',
          event_id: event.id,
          event_title: eventTitle,
          workflow_id: event.workflowId ?? '',
          workflow_title: workflowTitle,
          policy_id: event.policyRefs?.[0],
          policy_refs: event.policyRefs ?? [],
          form_refs: resolveTemplateFormId(form) ? [resolvedFormId] : [],
          generated_form_instance_ids: [instanceId],
          source_form_id: resolveTemplateFormId(form),
          priority: eventPriority,
          risk: eventRisk,
          blockers: [],
          policyRefs: event.policyRefs,
          step_id: step.id,
          form_id: resolvedFormId,
          form_ids: [resolvedFormId],
          ecign_packet_id: packet?.packet_id,
          packet,
          packets: packet ? [packet] : [],
          title: `Review ${form.label}`,
          description: `Review submission for instance ${instanceId}.`,
          status: completionBase.status === 'done' ? 'in_review' : 'todo',
          packet_status: deriveEcignPacketStatus(snap),
          start_date: stepDue,
          due_date: stepDue,
          sprint_id: inferSprintIdFromDate(stepDue),
          assigned_user_id: undefined,
          assignee: undefined,
          owner: undefined,
          required_signers: [],
          approvers: [],
          depends_on: [completionTaskId],
          dependencies: [completionTaskId],
          story_points: 1,
          evidence_id: packet?.evidence?.evidence_id,
          audit_log_refs: [],
        };
        pushTask(reviewBase);
      }

      if (linkedForms.length === 0) {
        const evidenceTaskId = makeCesTaskId(event.id, ordinal++);
        const evidenceBase: NonFormCesTask = {
          task_id: evidenceTaskId,
          source: 'CES',
          task_type: 'evidence',
          event_id: event.id,
          event_title: eventTitle,
          workflow_id: event.workflowId ?? '',
          workflow_title: workflowTitle,
          policy_id: event.policyRefs?.[0],
          policy_refs: event.policyRefs ?? [],
          form_refs: [],
          generated_form_instance_ids: [],
          priority: eventPriority,
          risk: eventRisk,
          blockers: [],
          policyRefs: event.policyRefs,
          step_id: step.id,
          title: `Evidence for ${step.label}`,
          description: 'Attach supporting evidence for this workflow step.',
          status: stepStatus,
          start_date: nominalStart,
          assigned_user_id: undefined,
          assignee: undefined,
          owner: undefined,
          due_date: stepDue,
          sprint_id: inferSprintIdFromDate(stepDue),
          story_points: 1,
          depends_on: [stepTaskId],
          dependencies: [stepTaskId],
        };
        pushTask(evidenceBase);
      }
    }

    for (const form of event.requiredForms) {
      if (formsConsumedBySteps.has(form.id)) continue;
      const formState = input.formStates[formKey(event.id, form.id)];
      const snap = snapshotFromFormState(formState);
      const packet = form.formId ? packetFromSnapshot(form.formId, snap) : undefined;
      const task_id = makeCesTaskId(event.id, ordinal++);

      const previousTaskId = eventTaskIds[eventTaskIds.length - 1];
      const dependsOn = previousTaskId ? [previousTaskId] : [];
      const startDate = toIsoDate(shiftToBusinessDay(addDays(eventDue, -1), -1));
      const templateFormId = resolveTemplateFormId(form);
      const resolvedFormId = templateFormId ?? (form.formId ?? form.id);
      const instanceId = nextFormInstanceId(resolvedFormId);

      const base: EcignSubmissionTask = {
        task_id,
        source: 'CES',
        task_type: 'form_completion',
        event_id: event.id,
        event_title: eventTitle,
        workflow_id: event.workflowId ?? '',
        workflow_title: workflowTitle,
        policy_id: event.policyRefs?.[0],
        policy_refs: event.policyRefs ?? [],
        form_refs: templateFormId ? [resolvedFormId] : [],
        generated_form_instance_ids: [instanceId],
        source_form_id: templateFormId,
        priority: eventPriority,
        risk: eventRisk,
        blockers: [],
        policyRefs: event.policyRefs,
        form_id: resolvedFormId,
        form_ids: [resolvedFormId],
        ecign_packet_id: packet?.packet_id,
        packet,
        packets: packet ? [packet] : [],
        title: `Complete form ${form.label}`,
        status: derivePmTaskStatus(snap),
        packet_status: deriveEcignPacketStatus(snap),
        start_date: startDate,
        assignee: undefined,
        owner: undefined,
        required_signers: [],
        approvers: [],
        depends_on: dependsOn,
        dependencies: dependsOn,
        due_date: defaultDue,
        sprint_id: inferSprintIdFromDate(defaultDue),
        evidence_id: packet?.evidence?.evidence_id,
        audit_log_refs: [],
      };
      pushTask(base);
    }

    const approvalTaskId = makeCesTaskId(event.id, ordinal++);
    const certificationTaskId = makeCesTaskId(event.id, ordinal++);
    const approvalDue = toIsoDate(shiftToBusinessDay(addDays(eventDue, -1), -1));

    pushTask({
      task_id: approvalTaskId,
      source: 'CES',
      task_type: 'approval',
      event_id: event.id,
      event_title: eventTitle,
      workflow_id: event.workflowId ?? '',
      workflow_title: workflowTitle,
      policy_id: event.policyRefs?.[0],
      policy_refs: event.policyRefs ?? [],
      form_refs: [],
      generated_form_instance_ids: [],
      priority: eventPriority,
      risk: eventRisk,
      blockers: [],
      policyRefs: event.policyRefs,
      step_id: 'approval',
      title: 'Approval Gate',
      description: 'Approve forms and evidence before certification.',
      status: 'todo',
      start_date: approvalDue,
      assigned_user_id: undefined,
      assignee: undefined,
      owner: undefined,
      due_date: approvalDue,
      sprint_id: inferSprintIdFromDate(approvalDue),
      story_points: 1,
      depends_on: eventTaskIds.length > 0 ? [eventTaskIds[eventTaskIds.length - 1]] : [],
      dependencies: eventTaskIds.length > 0 ? [eventTaskIds[eventTaskIds.length - 1]] : [],
    });

    pushTask({
      task_id: certificationTaskId,
      source: 'CES',
      task_type: 'certification',
      event_id: event.id,
      event_title: eventTitle,
      workflow_id: event.workflowId ?? '',
      workflow_title: workflowTitle,
      policy_id: event.policyRefs?.[0],
      policy_refs: event.policyRefs ?? [],
      form_refs: [],
      generated_form_instance_ids: [],
      priority: eventPriority,
      risk: eventRisk,
      blockers: [],
      policyRefs: event.policyRefs,
      step_id: 'certification',
      title: 'Certification',
      description: 'Certify event completion after approvals and evidence closure.',
      status: 'todo',
      start_date: defaultDue,
      assigned_user_id: undefined,
      assignee: undefined,
      owner: undefined,
      due_date: defaultDue,
      sprint_id: inferSprintIdFromDate(defaultDue),
      story_points: 1,
      depends_on: [approvalTaskId],
      dependencies: [approvalTaskId],
    });

    if (eventTaskIds.length > 0) {
      firstTaskByEvent.set(event.id, eventTaskIds[0]);
      lastTaskByEvent.set(event.id, eventTaskIds[eventTaskIds.length - 1]);
    }
  }

  // Event-level dependency stitching: upstream event's final task -> this event's first task.
  for (const event of input.events) {
    const upstream = (event as unknown as { dependencies?: { dependsOn?: string[] } }).dependencies?.dependsOn ?? [];
    if (upstream.length === 0) continue;
    const firstTaskId = firstTaskByEvent.get(event.id);
    if (!firstTaskId) continue;
    const firstTask = taskById.get(firstTaskId);
    if (!firstTask) continue;
    const additional = upstream
      .map(id => lastTaskByEvent.get(id))
      .filter((id): id is string => Boolean(id));
    if (additional.length === 0) continue;
    const merged = Array.from(new Set([...(firstTask.depends_on ?? firstTask.dependencies ?? []), ...additional]));
    firstTask.depends_on = merged;
    firstTask.dependencies = merged;
  }

  // Final start-date inference pass using dependency order and due date.
  const dueByTask = new Map<string, string>();
  for (const t of tasks) {
    dueByTask.set(t.task_id, t.due_date);
  }
  for (const t of tasks) {
    const preds = t.depends_on ?? t.dependencies ?? [];
    const maxPredDue = maxIsoDate(preds.map(dep => dueByTask.get(dep)));
    if (maxPredDue) {
      const predStart = shiftToBusinessDay(addDays(parseIsoDate(maxPredDue) ?? new Date(`${maxPredDue}T00:00:00Z`), 1), 1);
      const predStartIso = toIsoDate(predStart);
      t.start_date = t.start_date && t.start_date > predStartIso ? t.start_date : predStartIso;
    }
    if (!t.start_date || t.start_date > t.due_date) {
      t.start_date = toIsoDate(shiftToBusinessDay(addDays(parseIsoDate(t.due_date) ?? new Date(), -1), -1));
    }
    if (!t.sprint_id) t.sprint_id = inferSprintIdFromDate(t.due_date);
  }

  const isProd =
    typeof globalThis !== 'undefined' &&
    (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV === 'production';
  if (!isProd) {
    assertNoDuplicateTaskIds(tasks);
  }

  return tasks;
}

/** Dev-mode guard. Throws if any duplicate task_ids are detected. */
export function assertNoDuplicateTaskIds(tasks: ReadonlyArray<Task>): void {
  const seen = new Set<string>();
  const dupes: string[] = [];
  for (const t of tasks) {
    if (seen.has(t.task_id)) dupes.push(t.task_id);
    seen.add(t.task_id);
  }
  if (dupes.length > 0) {
    throw new Error(
      `[taskProjection] Duplicate task_ids detected: ${dupes.join(', ')}. ` +
        `task_ids must be unique across all PM views.`,
    );
  }
}
