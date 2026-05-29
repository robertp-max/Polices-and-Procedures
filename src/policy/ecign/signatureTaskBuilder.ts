import { signerRoleSlug } from './signerHierarchy';
import type { SignatureRequirement, SignatureTaskRecord } from './types';

function normalizeSegment(value?: string) {
  return String(value ?? '')
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'UNSPECIFIED';
}

export function buildSignatureRequirementId(input: {
  eventId: string;
  workflowId?: string;
  parentTaskId: string;
  formId?: string;
  signatureSlot: string;
  signerRole: string;
}) {
  return [
    'SIGREQ',
    normalizeSegment(input.eventId),
    normalizeSegment(input.workflowId ?? 'EVENT'),
    normalizeSegment(input.parentTaskId),
    normalizeSegment(input.formId ?? 'NOFORM'),
    normalizeSegment(input.signatureSlot),
    signerRoleSlug(input.signerRole),
  ].join('-');
}

export function buildDeterministicSignatureTaskId(input: {
  eventId: string;
  workflowId?: string;
  parentTaskId: string;
  formId?: string;
  signatureSlot: string;
  signerRole: string;
}) {
  return [
    'SIGN',
    normalizeSegment(input.eventId),
    normalizeSegment(input.workflowId ?? 'EVENT'),
    normalizeSegment(input.parentTaskId),
    normalizeSegment(input.formId ?? 'NOFORM'),
    normalizeSegment(input.signatureSlot),
    signerRoleSlug(input.signerRole),
  ].join('-');
}

export function buildSignatureTaskRecord(requirement: SignatureRequirement): SignatureTaskRecord {
  return {
    taskId: buildDeterministicSignatureTaskId({
      eventId: requirement.eventId,
      workflowId: requirement.workflowId,
      parentTaskId: requirement.parentTaskId,
      formId: requirement.formId,
      signatureSlot: requirement.signatureSlot,
      signerRole: requirement.signerRole,
    }),
    parentTaskId: requirement.parentTaskId,
    eventId: requirement.eventId,
    workflowId: requirement.workflowId,
    formId: requirement.formId,
    formInstanceId: requirement.formInstanceId,
    signatureSlot: requirement.signatureSlot,
    signerRole: requirement.signerRole,
    reviewerRole: requirement.reviewerRole,
    order: requirement.order,
    status: requirement.status,
    required: requirement.required,
  };
}

export function dedupeSignatureRequirements(requirements: SignatureRequirement[]) {
  const seen = new Set<string>();
  return requirements.filter(requirement => {
    if (seen.has(requirement.signatureRequirementId)) return false;
    seen.add(requirement.signatureRequirementId);
    return true;
  });
}

export function dedupeSignatureTasks(tasks: SignatureTaskRecord[]) {
  const seen = new Set<string>();
  return tasks.filter(task => {
    if (seen.has(task.taskId)) return false;
    seen.add(task.taskId);
    return true;
  });
}
