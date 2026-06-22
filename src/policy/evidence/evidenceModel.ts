export const EVIDENCE_STATUSES = [
  'PENDING_UPLOAD',
  'UPLOADED',
  'VALIDATING',
  'VALIDATED',
  'REJECTED',
  'PROMOTED',
  'EVIDENCE_LOCKED',
  'SUPERSEDED',
  'EXPORTED',
  'RETAINED',
] as const;

export type EvidenceStatus = typeof EVIDENCE_STATUSES[number];

export const EVIDENCE_IMMUTABLE_STATUSES = new Set<EvidenceStatus>([
  'EVIDENCE_LOCKED',
  'SUPERSEDED',
  'EXPORTED',
  'RETAINED',
]);

export const EVIDENCE_USABLE_STATUSES = new Set<EvidenceStatus>([
  'UPLOADED',
  'VALIDATING',
  'VALIDATED',
  'PROMOTED',
  'EVIDENCE_LOCKED',
  'EXPORTED',
]);

export function isEvidenceImmutable(status: EvidenceStatus): boolean {
  return EVIDENCE_IMMUTABLE_STATUSES.has(status);
}

export function isEvidenceUsable(status: EvidenceStatus): boolean {
  return EVIDENCE_USABLE_STATUSES.has(status);
}

export const EVIDENCE_AUDIT_EVENTS = [
  'UPLOAD_INITIATED',
  'FILE_UPLOADED',
  'FILE_VALIDATED',
  'FILE_REJECTED',
  'EVIDENCE_PROMOTED',
  'EVIDENCE_LOCKED',
  'EVIDENCE_SUPERSEDED',
  'DOWNLOAD_URL_CREATED',
  'EXPORT_CREATED',
  'VALIDATION_FAILED',
  'ACCESS_DENIED',
] as const;

export type EvidenceAuditEvent = typeof EVIDENCE_AUDIT_EVENTS[number];

export type EvidenceMode = 'BACKEND_LIVE'; // DEMO_LOCAL removed from CES/eCign/evidence runtime; real Drive persistence required

export interface EvidenceValidationInput {
  policyId: string;
  workflowId: string;
  eventId: string;
  eventExists: boolean;
  requiredFormBinding?: boolean;
  formId?: string;
  requiredTaskBinding?: boolean;
  taskId?: string;
}

export interface EvidenceValidationResult {
  ok: boolean;
  message?: string;
}

export function validateEvidenceUploadInput(input: EvidenceValidationInput): EvidenceValidationResult {
  if (!input.policyId.trim()) {
    return { ok: false, message: 'Evidence upload requires a policy ID.' };
  }
  if (!input.workflowId.trim()) {
    return { ok: false, message: 'Evidence upload requires a workflow ID.' };
  }
  if (!input.eventId.trim()) {
    return { ok: false, message: 'Evidence upload requires an event ID.' };
  }
  if (!input.eventExists) {
    return { ok: false, message: 'The selected event ID does not exist in the current execution context.' };
  }
  if (input.requiredFormBinding && !input.formId?.trim()) {
    return { ok: false, message: 'A form ID is required when evidence is tied to a required form.' };
  }
  if (input.requiredTaskBinding && !input.taskId?.trim()) {
    return { ok: false, message: 'A task ID is required when evidence is tied to a task.' };
  }
  if (!input.formId?.trim() && !input.taskId?.trim()) {
    return { ok: false, message: 'Orphan evidence is not allowed. Link evidence to a form and/or task.' };
  }
  return { ok: true };
}

export function toEvidenceModeLabel(_mode: EvidenceMode): string {
  return 'BACKEND_LIVE'; // no DEMO_LOCAL label in CES/eCign evidence path
}

export function logEvidenceDevWarning(message: string, details?: unknown): void {
  const env = (import.meta as unknown as { env?: Record<string, string | boolean> }).env;
  if (!env?.DEV) return;
  console.warn(`[evidence] ${message}`, details ?? '');
}
