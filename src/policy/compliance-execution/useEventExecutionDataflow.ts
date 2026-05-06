import { useMemo } from 'react';
import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { frameworkPolicies } from '@/policy/data/frameworkSeed.generated';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { useRegulatoryExecutionStore, type ApprovalRequest, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import type { MergedExecutionUnit } from './complianceExecutionTypes';
import { buildEventInstanceIndex } from './eventInstanceId';
import { resolveEventFolder } from './eventFolders';
import { deriveDefaultEventTasks } from './eventTaskAdapter';
import type { EventTask, EventExecutionAuditEvent, EventFormInstance, EventInstance } from './types';
import { isEvidenceUsable } from '@/policy/evidence/evidenceModel';
import { buildCesTaskRequirements } from '@/policy/evidence/cesEvidenceHierarchy';
import type { Task as PmTask } from '@/policy/pm/types';

const EVENT_INSTANCE_INDEX = buildEventInstanceIndex(REGULATORY_EVENTS);

export interface EventExecutionDataflow {
  event: RegulatoryEvent;
  eventId: string;
  eventInstance: EventInstance;
  folder: ReturnType<typeof resolveEventFolder>;
  policies: { id: string; title: string }[];
  workflows: { id: string; title: string }[];
  requiredForms: Array<RegulatoryEvent['requiredForms'][number] & { formPath: string }>;
  tasks: EventTask[];
  evidence: EvidenceDoc[];
  approvals: ApprovalRequest[];
  auditReadiness: {
    isCertified: boolean;
    isComplete: boolean;
    blockers: number;
  };
  auditReadinessScore: number;
  cesExecutionUnits: MergedExecutionUnit[];
  auditTrail: EventExecutionAuditEvent[];
  generatedFormInstances: EventFormInstance[];
  sourceEventId: string;
}

function toPmTask(task: EventTask, event: RegulatoryEvent): PmTask {
  const primaryFormId = task.formIds[0] ?? '';
  return {
    task_id: task.id,
    source: 'CES',
    task_type: task.taskSourceType === 'approval' ? 'approval' : task.taskSourceType === 'requiredForm' ? 'form_completion' : 'workflow_step',
    event_id: task.eventId,
    event_title: event.title,
    workflow_id: task.workflowId ?? event.workflowId ?? '',
    workflow_title: event.title,
    policy_id: task.policyIds[0],
    policy_refs: task.policyIds,
    form_refs: task.formIds,
    generated_form_instance_ids: [],
    source_form_id: primaryFormId || undefined,
    priority: 'medium',
    risk: 'medium',
    blockers: task.blockedReason ? [task.blockedReason] : [],
    step_id: task.taskSourceType === 'processFlow' ? task.taskSourceId.replace(/^processFlow:/, '') : undefined,
    form_id: primaryFormId,
    form_ids: task.formIds,
    title: task.title,
    description: task.description,
    status: task.status === 'completed' ? 'done' : task.status === 'in_progress' ? 'in_progress' : task.status === 'blocked' ? 'blocked' : 'todo',
    packet_status: task.status === 'awaiting_signature' ? 'awaiting_signature' : task.status === 'completed' ? 'completed' : 'draft',
    start_date: task.createdAt.slice(0, 10),
    due_date: task.dueDate ?? event.date,
    sprint_id: 'EVENT',
    story_points: 1,
    depends_on: [],
    dependencies: [],
    required_signers: [],
    approvers: [],
    audit_log_refs: [],
    assignee: task.ownerUserId,
    owner: task.ownerRole,
  };
}

export function buildEventExecutionDataflow(
  event: RegulatoryEvent,
  store: ReturnType<typeof useRegulatoryExecutionStore.getState>,
): EventExecutionDataflow {
  const instance = store.ensureEventInstance(event);
  const eventId = instance.eventId ?? EVENT_INSTANCE_INDEX.bySourceEventId[event.id] ?? event.id;
  const folder = resolveEventFolder(eventId);

  const stepStatusById = Object.fromEntries(
    event.processFlow.map(step => [step.id, store.effectiveStepStatus(event, step.id)]),
  );
  const formStatusById = Object.fromEntries(
    event.requiredForms.map(form => [form.id, store.effectiveFormStatus(event, form.id)]),
  );
  const approvals = store.approvals.filter(approval => approval.eventId === event.id || approval.eventId === eventId);
  const approvalsById = Object.fromEntries(approvals.map(ap => [ap.id, ap.status]));

  const derived = deriveDefaultEventTasks(event, eventId, { stepStatusById, formStatusById, approvalsById });
  const overrides = (store.taskOverridesByEventId[eventId] ?? []).map(task => ({ ...task, eventId }));
  const mergedBySource = new Map<string, EventTask>();
  const mergedById = new Map<string, EventTask>();
  for (const task of derived) {
    mergedBySource.set(task.taskSourceId, task);
    mergedById.set(task.id, task);
  }
  for (const task of overrides) {
    const sourceKey = task.taskSourceId;
    if (sourceKey && mergedBySource.has(sourceKey)) {
      mergedBySource.set(sourceKey, { ...mergedBySource.get(sourceKey)!, ...task });
      continue;
    }
    if (mergedById.has(task.id)) {
      mergedById.set(task.id, { ...mergedById.get(task.id)!, ...task });
      continue;
    }
    if (sourceKey) {
      mergedBySource.set(sourceKey, task);
    } else {
      mergedById.set(task.id, task);
    }
  }
  const tasks = [...mergedBySource.values(), ...Array.from(mergedById.values()).filter(task => !task.taskSourceId)];

  const policies = event.policyRefs.map(policyId => {
    const policy = frameworkPolicies.find(p => p.id === policyId);
    return { id: policyId, title: policy?.title ?? policyId };
  });

  const workflows = [event.workflowId, ...tasks.map(t => t.workflowId)]
    .filter((id): id is string => Boolean(id))
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .map(id => ({ id, title: WORKFLOWS[id]?.title ?? id }));

  const requiredForms = event.requiredForms.map(form => ({
    ...form,
    formPath: `${folder.paths.formsRequiredDir}/${form.formId ?? form.id}.json`,
  }));

  const evidence = store.evidence[eventId] ?? store.evidence[event.id] ?? [];
  const tasksWithRollup: EventTask[] = tasks.map(task => {
    const taskEvidence = evidence.filter(item => item.taskId === task.id && isEvidenceUsable(item.status));
    const evidenceIds = taskEvidence.map(item => item.id);
    const requiredFormsSatisfied = task.formIds.length === 0
      ? true
      : task.formIds.every(formId => {
          const req = event.requiredForms.find(form => (form.formId ?? form.id) === formId || form.id === formId);
          if (!req) return false;
          const hasGeneratedInstance = (store.generatedFormInstancesByEventId[eventId] ?? []).some(inst => inst.formId === formId || inst.formId === (req.formId ?? req.id));
          return hasGeneratedInstance || store.effectiveFormStatus(event, req.id) === 'complete';
        });
    const requiredEvidenceSatisfied = task.source === 'approval' || task.source === 'generated'
      ? evidenceIds.length > 0
      : true;
    const completionBlockedReason = task.status === 'blocked'
      ? (task.blockedReason ?? 'Blocked')
      : !requiredFormsSatisfied
        ? 'Missing required form completion'
        : !requiredEvidenceSatisfied
          ? 'Missing required evidence'
          : undefined;
    return {
      ...task,
      evidenceIds,
      evidenceCount: evidenceIds.length,
      requiredFormsSatisfied,
      requiredEvidenceSatisfied,
      completionBlockedReason,
    };
  });
  const validation = store.validateEvent(event);
  const hierarchyTaskProjections = tasksWithRollup
    .filter(task => !task.isDeleted)
    .map(task => buildCesTaskRequirements(
      toPmTask(task, event),
      eventId,
      task.policyIds[0] ?? event.policyRefs[0] ?? '',
      task.workflowId ?? event.workflowId ?? '',
      task.dueDate,
      evidence.filter(item => item.taskId === task.id),
      approvals,
      (store.taskAuditByEventId[eventId] ?? []).slice(0, 20).map(item => item.auditId),
    ));
  const totalWeight = hierarchyTaskProjections.reduce((sum, task) => sum + Math.max(1, task.storyPoints), 0);
  const weightedOperational = hierarchyTaskProjections.reduce(
    (sum, task) => sum + (task.weightedCompletionPercentage * Math.max(1, task.storyPoints)),
    0,
  );
  const weightedAudit = hierarchyTaskProjections.reduce(
    (sum, task) => sum + (task.auditReadinessPercentage * Math.max(1, task.storyPoints)),
    0,
  );
  const completionScore = totalWeight > 0 ? Math.round(weightedOperational / totalWeight) : 0;
  const auditReadinessScore = totalWeight > 0 ? Math.round(weightedAudit / totalWeight) : 0;

  const cesExecutionUnits: MergedExecutionUnit[] = tasksWithRollup
    .filter(task => !task.isDeleted)
    .map(task => ({
      id: task.id,
      title: task.title,
      parentEventId: event.id,
      workflowId: task.workflowId ?? event.workflowId ?? `wf:${event.id}`,
      workflowPhase: task.status === 'awaiting_signature' ? 'signature' : task.status === 'completed' ? 'audit' : 'documentation',
      complianceState:
        task.status === 'completed' ? 'completed'
        : task.status === 'blocked' ? 'blocked'
        : task.status === 'awaiting_signature' ? 'awaiting_signature'
        : task.status === 'in_progress' ? 'in_progress'
        : 'ready',
      auditReadiness: task.status === 'completed' ? 'ready' : 'not_ready',
      owner: {
        userId: task.ownerUserId ?? `owner:${event.owner.replace(/\s+/g, '_').toLowerCase()}`,
        name: task.ownerUserId ?? event.owner,
        initials: event.owner.split(/\s+/).slice(0, 2).map(v => v[0] ?? '').join('').toUpperCase() || 'EV',
        role: task.ownerRole ?? event.ownerRole,
      },
      approver: {
        userId: `role:${(task.ownerRole ?? event.ownerRole).replace(/\s+/g, '_').toLowerCase()}`,
        name: task.ownerRole ?? event.ownerRole,
        initials: (task.ownerRole ?? event.ownerRole).slice(0, 2).toUpperCase(),
        role: task.ownerRole ?? event.ownerRole,
      },
      signatureOwner: {
        userId: `role:${(task.ownerRole ?? event.ownerRole).replace(/\s+/g, '_').toLowerCase()}`,
        name: task.ownerRole ?? event.ownerRole,
        initials: (task.ownerRole ?? event.ownerRole).slice(0, 2).toUpperCase(),
        role: task.ownerRole ?? event.ownerRole,
      },
      requiredSigners: [],
      dueDate: task.dueDate ?? event.date,
      evidenceStatus: {
        requiredFormsTotal: task.formIds.length,
        requiredFormsComplete: task.formIds.filter(formId =>
          requiredForms.some(form => (form.formId ?? form.id) === formId && store.effectiveFormStatus(event, form.id) === 'complete'),
        ).length,
        missingFormIds: task.formIds.filter(formId =>
          !requiredForms.some(form => (form.formId ?? form.id) === formId && store.effectiveFormStatus(event, form.id) === 'complete'),
        ),
        signaturesRequired: task.status === 'awaiting_signature' ? 1 : 0,
        signaturesComplete: task.status === 'completed' ? 1 : 0,
        auditIndexCreated: store.isCertified(event.id),
      },
      domain:
        event.domain === 'Governance' ? 'governance'
        : event.domain === 'Clinical' || event.domain === 'QAPI' ? 'clinical'
        : 'compliance',
      source: 'regulatory',
      sourceType: 'REGULATORY_EVENT',
      sourcePolicyIds: task.policyIds,
      sourceWorkflowIds: task.workflowId ? [task.workflowId] : [],
      sourceFormIds: task.formIds,
      sourceEvidenceIds: task.evidenceIds ?? [],
      sourceEventId: event.id,
      taskSourceId: task.taskSourceId,
      folderPath: task.folderPath,
      auditReadinessScore: completionScore,
      regulatoryRef: event,
    }));

  return {
    event,
    eventId,
    eventInstance: instance,
    folder,
    policies,
    workflows,
    requiredForms,
    tasks: tasksWithRollup,
    evidence,
    approvals,
    auditReadiness: {
      isCertified: instance.lockState === 'certified' || store.isCertified(event.id),
      isComplete: store.isEventComplete(event.id),
      blockers: validation.blockers.length,
    },
    auditReadinessScore,
    cesExecutionUnits,
    auditTrail: store.taskAuditByEventId[eventId] ?? [],
    generatedFormInstances: store.generatedFormInstancesByEventId[eventId] ?? [],
    sourceEventId: event.id,
  };
}

export function useEventExecutionDataflow(event: RegulatoryEvent | null): EventExecutionDataflow | null {
  const store = useRegulatoryExecutionStore();
  return useMemo(() => (event ? buildEventExecutionDataflow(event, store) : null), [event, store]);
}
