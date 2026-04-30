import type { FormStatus } from '../stores/regulatoryExecutionStore';

export type FormInstanceStatus = 'not_started' | 'in_progress' | 'submitted' | 'reviewed' | 'approved';

export interface FormInstanceRecord {
  form_instance_id: string;
  source_form_id: string;
  event_id: string;
  workflow_id?: string;
  policy_refs: string[];
  status: FormInstanceStatus;
  assigned_to?: string;
  created_at: string;
  due_date?: string;
}

const key = (eventId: string, formId: string): string => `${eventId}::${formId}`;

function mapStatus(status?: FormStatus): FormInstanceStatus {
  if (!status || status === 'missing' || status === 'pending') return 'not_started';
  if (status === 'in-progress') return 'in_progress';
  if (status === 'requires-review') return 'reviewed';
  return 'approved';
}

export function resolveFormInstances(
  events: Array<{
    id: string;
    date?: string;
    workflowId?: string;
    owner?: string;
    policyRefs?: string[];
    requiredForms: Array<{ id: string; formId?: string }>;
  }>,
  formStates: Record<string, { status: FormStatus; completedAt?: string; completedBy?: string; reviewer?: string }>,
): Record<string, FormInstanceRecord> {
  const out: Record<string, FormInstanceRecord> = {};
  for (const event of events) {
    for (const form of event.requiredForms) {
      const sourceFormId = form.formId ?? form.id;
      const formState = formStates[key(event.id, form.id)];
      const instanceId = `${event.id}--${sourceFormId}`;
      out[instanceId] = {
        form_instance_id: instanceId,
        source_form_id: sourceFormId,
        event_id: event.id,
        workflow_id: event.workflowId,
        policy_refs: event.policyRefs ?? [],
        status: mapStatus(formState?.status),
        assigned_to: formState?.reviewer ?? formState?.completedBy ?? event.owner,
        created_at: formState?.completedAt ?? `${(event.date ?? new Date().toISOString()).slice(0, 10)}T00:00:00.000Z`,
        due_date: event.date,
      };
    }
  }
  return out;
}
