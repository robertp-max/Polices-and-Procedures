import { REGULATORY_EVENTS } from '../src/policy/data/regulatoryEvents';
import { FORMS_DATASET } from '../src/policy/data/formsLibraryDataset';
import { resolveCanonicalFormId } from '../src/policy/data/formIdAliases';
import { deriveDefaultEventTasks } from '../src/policy/compliance-execution/eventTaskAdapter';

const Q1_EVENT_IDS = [
  'governance_packet_review-20260108-01',
  'ep_plan_review-20260115-01',
  'ep_staff_training-20260122-01',
  'qapi_meeting-20260205-04',
  'hha_aide_inservice-20260209-01',
  'hha_skill_observation-20260225-01',
  'hha_aide_observation-20260311-01',
  'ep_exercise-20260318-01',
  'hhcahps_filing-20260331-01',
] as const;

const formIds = new Set(FORMS_DATASET.map(form => form.id));
const failures: string[] = [];

for (const eventId of Q1_EVENT_IDS) {
  const event = REGULATORY_EVENTS.find(item => item.id === eventId);
  if (!event) {
    failures.push(`${eventId}: event missing`);
    continue;
  }

  const missingForms = event.requiredForms
    .map(form => form.formId || form.id)
    .map(formId => ({ formId, canonicalId: resolveCanonicalFormId(formId) }))
    .filter(form => !form.canonicalId || !formIds.has(form.canonicalId));
  if (missingForms.length) {
    failures.push(`${eventId}: unresolved forms ${missingForms.map(form => form.formId).join(', ')}`);
  }

  const tasks = deriveDefaultEventTasks(event, event.id);
  const requiredApprovalRules = (event.approvals ?? []).filter(rule => rule.required);
  const approvalTasks = tasks.filter(task => task.taskSourceType === 'approval' && task.isRequired);
  if (approvalTasks.length !== requiredApprovalRules.length) {
    failures.push(`${eventId}: approval task count ${approvalTasks.length} does not match required rule count ${requiredApprovalRules.length}`);
  }

  const reviewTaskWithoutRole = approvalTasks.find(task => !task.ownerRole && !task.approverRole && !task.canApproveRoles?.length);
  if (reviewTaskWithoutRole) {
    failures.push(`${eventId}: approval task ${reviewTaskWithoutRole.id} has no review/approval role`);
  }
}

if (failures.length) {
  console.error('[FAIL] Q1 CES readiness');
  failures.forEach(failure => console.error(`  ${failure}`));
  process.exitCode = 1;
} else {
  const q1Events = Q1_EVENT_IDS.length;
  const q1Forms = Q1_EVENT_IDS.reduce((sum, eventId) => {
    const event = REGULATORY_EVENTS.find(item => item.id === eventId);
    return sum + (event?.requiredForms.length ?? 0);
  }, 0);
  const q1ApprovalTasks = Q1_EVENT_IDS.reduce((sum, eventId) => {
    const event = REGULATORY_EVENTS.find(item => item.id === eventId);
    return sum + (event ? deriveDefaultEventTasks(event, event.id).filter(task => task.taskSourceType === 'approval' && task.isRequired).length : 0);
  }, 0);
  console.log(`[PASS] Q1 CES readiness: ${q1Events} events, ${q1Forms} required forms, ${q1ApprovalTasks} required approval tasks`);
}

