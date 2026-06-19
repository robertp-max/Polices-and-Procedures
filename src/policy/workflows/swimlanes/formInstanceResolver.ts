import { FORM_TITLES } from '@/policy/data/formTitles.generated';
import { formatCesFormInstanceId } from '@/policy/compliance-execution/cesFormInstanceId';
import type { SwimlaneFormInstance, SwimlaneMode, SwimlaneSupportingDocumentationTask, SwimlaneStatus } from './types';
import { buildSwimlaneSupportTaskId } from './eventSwimlaneIdentity';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { getEventById } from './swimlaneRegistry';

type SequenceMap = Map<string, number>;
type CanonicalFormInstanceMap = Map<string, string>;

function formTitle(formId: string) {
  return FORM_TITLES[formId] ?? 'Unresolved Forms Library ID';
}

function slugify(value: string) {
  return value
    .trim()
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toUpperCase();
}

function evidenceRequirementId(parentTaskId: string, formId: string, evidenceKey: string) {
  return `${parentTaskId}::SUPPORTING_DOCUMENTATION::${formId}::${evidenceKey}`;
}

function isFormDerivedEvidence(formId: string, label: string) {
  const normalized = label.toLowerCase();
  return normalized.includes(formId.toLowerCase()) || normalized.includes(formTitle(formId).toLowerCase());
}

function isSignatureOnly(input: { title: string; signerRole?: string; reviewerRole?: string; evidence: string[] }) {
  const text = `${input.title} ${input.evidence.join(' ')}`.toLowerCase();
  return Boolean(input.signerRole) && !input.reviewerRole && /sign|signature|acknowledg|attest/.test(text);
}

function nextInstanceId(eventId: string, formId: string, sequenceByEventForm: SequenceMap) {
  const key = `${eventId}::${formId}`;
  const sequence = (sequenceByEventForm.get(key) ?? 0) + 1;
  sequenceByEventForm.set(key, sequence);
  return formatCesFormInstanceId(eventId, formId, sequence);
}

function taskFormKey(taskId: string, formId: string) {
  return `${taskId}::${formId}`;
}

function stableFormInstanceId(
  mode: SwimlaneMode,
  eventId: string | undefined,
  taskId: string,
  formId: string,
  sequenceByEventForm: SequenceMap,
  canonicalFormInstanceIds: CanonicalFormInstanceMap,
) {
  if (mode !== 'event_execution' || !eventId) return undefined;
  const key = taskFormKey(taskId, formId);
  const existing = canonicalFormInstanceIds.get(key);
  if (existing) return existing;
  const next = nextInstanceId(eventId, formId, sequenceByEventForm);
  canonicalFormInstanceIds.set(key, next);
  return next;
}

function supportDocumentationRequired(label: string, title: string) {
  const normalized = `${title} ${label}`.toLowerCase();
  if (!label.trim()) return false;
  if (/signed .*artifact|signature artifact|signature path|approval path/.test(normalized)) return false;
  return true;
}

function resolveSupportAssignment(formIds: string[], label: string) {
  const matches = formIds.filter(formId => isFormDerivedEvidence(formId, label));
  if (matches.length > 0) return matches;
  if (formIds.length === 1) return formIds;
  return formIds.slice(0, 1);
}

function supportTaskDescription(label: string, formId: string, title: string) {
  return `Attach or validate the supporting documentation required for ${formId} during "${title}". Evidence target: ${label}`;
}

export interface ResolvedSwimlaneFormArtifacts {
  formInstances: SwimlaneFormInstance[];
  supportingDocumentationTasks: SwimlaneSupportingDocumentationTask[];
}

export function resolveSwimlaneFormInstances({
  mode,
  eventId,
  workflowId,
  taskId,
  title,
  formIds,
  evidence,
  signerRole,
  reviewerRole,
  sequenceByEventForm,
  canonicalFormInstanceIds,
}: {
  mode: SwimlaneMode;
  eventId?: string;
  workflowId?: string;
  taskId: string;
  title: string;
  formIds: string[];
  evidence: string[];
  signerRole?: string;
  reviewerRole?: string;
  sequenceByEventForm: SequenceMap;
  canonicalFormInstanceIds: CanonicalFormInstanceMap;
}): ResolvedSwimlaneFormArtifacts {
  const signatureOnly = isSignatureOnly({ title, signerRole, reviewerRole, evidence });
  const formInstancesById = new Map<string, SwimlaneFormInstance>();
  const supportingDocumentationTasks: SwimlaneSupportingDocumentationTask[] = [];

  for (const formId of formIds) {
    const formInstanceId = stableFormInstanceId(mode, eventId, taskId, formId, sequenceByEventForm, canonicalFormInstanceIds);
    let initialStatus: any = formInstanceId ? 'pending' : mode === 'event_execution' ? 'blocked' : 'pending';
    let isMissing = mode === 'event_execution' && !formInstanceId;
    // Use actual live data from store when event known (fixes status mismatch between calendar & swimlane)
    if (eventId && mode === 'event_execution') {
      try {
        const exec = useRegulatoryExecutionStore.getState();
        const ev = getEventById(eventId);
        if (ev && exec.effectiveFormStatus) {
          const live = exec.effectiveFormStatus(ev, formId);
          if (live) {
            initialStatus = live === 'complete' ? 'complete' : live === 'in-progress' ? 'in_progress' : live === 'missing' ? 'blocked' : 'needs_evidence';
            isMissing = live === 'missing';
          }
        }
      } catch {}
    }
    formInstancesById.set(formId, {
      formId,
      formTitle: formTitle(formId),
      formInstanceId,
      status: initialStatus,
      missing: isMissing,
      requiredAdditionalDocumentation: false,
      supportingDocumentation: [],
    });
  }

  if (!signatureOnly) {
    const supportLabels = evidence.filter(label => {
      if (!supportDocumentationRequired(label, title)) return false;
      return !formIds.some(formId => isFormDerivedEvidence(formId, label));
    });

    supportLabels.forEach((label, index) => {
      const evidenceKey = slugify(label) || String(index + 1).padStart(2, '0');
      const assignedFormIds = resolveSupportAssignment(formIds, label);
      for (const formId of assignedFormIds) {
        const formInstance = formInstancesById.get(formId);
        if (!formInstance) continue;
        const supportTaskId = buildSwimlaneSupportTaskId(taskId, assignedFormIds.length > 1 ? `${evidenceKey}-${formId}` : evidenceKey);
        const evidenceRequirement = evidenceRequirementId(taskId, formId, evidenceKey);
        const task: SwimlaneSupportingDocumentationTask = {
          id: supportTaskId,
          supportTaskId,
          parentTaskId: taskId,
          eventId,
          workflowId,
          formId,
          formInstanceId: formInstance.formInstanceId,
          evidenceRequirementId: evidenceRequirement,
          title: label,
          description: supportTaskDescription(label, formId, title),
          status: 'pending' as SwimlaneStatus,
          required: true,
        };
        formInstance.supportingDocumentation.push(task);
        formInstance.requiredAdditionalDocumentation = true;
        formInstance.status = 'needs_evidence';
        supportingDocumentationTasks.push(task);
      }
    });
  }

  return {
    formInstances: formIds.map(formId => formInstancesById.get(formId)!).filter(Boolean),
    supportingDocumentationTasks,
  };
}
