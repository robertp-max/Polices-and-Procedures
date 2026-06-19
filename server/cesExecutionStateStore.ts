import fs from 'node:fs';
import path from 'node:path';
import { ApiError } from './errors.js';
import { env } from './env.js';
import { log } from './logger.js';
import type { CesEvidenceRef } from './cesMetadataStore.js';

export type CesExecutionStatus = 'not_started' | 'in_progress' | 'complete' | 'blocked';
export type CesApprovalStatus = 'not_requested' | 'pending' | 'approved' | 'rejected' | 'blocked';
export type CesAuditCloseoutStatus = 'not_started' | 'ready' | 'certified' | 'blocked';

export interface CesExecutionRequirement {
  id: string;
  label?: string;
  aliases?: string[];
  required?: boolean;
}

export interface CesApprovalRequirement extends CesExecutionRequirement {
  targetKind: 'event' | 'minutes' | 'report' | 'form';
  approverRole: string;
}

export interface CesExecutionDefinition {
  eventId: string;
  workflowId?: string;
  requiredTasks?: CesExecutionRequirement[];
  requiredForms?: CesExecutionRequirement[];
  requiredApprovals?: CesApprovalRequirement[];
}

export interface CesExecutionSupportRef {
  evidenceId?: string;
  artifactId?: string;
  driveFileId?: string;
  fileName?: string;
  taskId?: string;
  formId?: string;
  formInstanceId?: string;
}

export interface CesExecutionUpdateMetadata {
  updatedBy?: string;
  source?: string;
  note?: string;
  supportingEvidence?: CesExecutionSupportRef[];
  dependencyVerified?: boolean;
}

export interface CesExecutionTaskRecord {
  id: string;
  label?: string;
  status: CesExecutionStatus;
  updatedAt: string;
  updatedBy: string;
  source: string;
  note?: string;
  supportingEvidence?: CesExecutionSupportRef[];
}

export interface CesExecutionFormRecord extends CesExecutionTaskRecord {
  formId?: string;
  formInstanceId?: string;
}

export interface CesExecutionApprovalRecord {
  id: string;
  targetKind: 'event' | 'minutes' | 'report' | 'form';
  targetLabel: string;
  approverRole: string;
  status: CesApprovalStatus;
  updatedAt: string;
  updatedBy: string;
  source: string;
  note?: string;
  supportingEvidence?: CesExecutionSupportRef[];
}

export interface CesAuditCloseoutRecord {
  status: CesAuditCloseoutStatus;
  certifiedBy?: string;
  certifiedRole?: string;
  certifiedAt?: string;
  updatedAt: string;
  updatedBy: string;
  source: string;
  note?: string;
  supportingEvidence?: CesExecutionSupportRef[];
}

export interface CesExecutionAuditEvent {
  action: 'task.update' | 'form.update' | 'approval.update' | 'audit_closeout.update';
  eventId: string;
  targetId: string;
  status: string;
  occurredAt: string;
  actor: string;
  source: string;
  note?: string;
}

export interface CesExecutionState {
  schemaVersion: 1;
  eventId: string;
  workflowId?: string;
  tasks: Record<string, CesExecutionTaskRecord>;
  forms: Record<string, CesExecutionFormRecord>;
  approvals: Record<string, CesExecutionApprovalRecord>;
  auditCloseout?: CesAuditCloseoutRecord;
  updatedAt: string;
  updatedBy: string;
  source: string;
  auditTrail: CesExecutionAuditEvent[];
}

export interface CesDerivedCompletionState {
  taskStatuses: Array<CesExecutionRequirement & { status: CesExecutionStatus; record?: CesExecutionTaskRecord }>;
  formStatuses: Array<CesExecutionRequirement & { status: CesExecutionStatus; record?: CesExecutionFormRecord }>;
  approvalStatuses: Array<CesApprovalRequirement & { status: CesApprovalStatus; record?: CesExecutionApprovalRecord }>;
  tasksCompleteCount: number;
  tasksTotalCount: number;
  formsCompleteCount: number;
  formsTotalCount: number;
  approvalsCompleteCount: number;
  approvalsTotalCount: number;
  auditReadyPercent: number;
  blockers: string[];
}

const STATE_SCHEMA_VERSION = 1;
const DEFAULT_ACTOR = 'system';
const STORE_DIR = path.join(env.repoRoot, '.cache', 'ces-execution-state');
const EVENT_DIR = path.join(STORE_DIR, 'events');

const TASK_STATUSES = new Set<CesExecutionStatus>(['not_started', 'in_progress', 'complete', 'blocked']);
const APPROVAL_STATUSES = new Set<CesApprovalStatus>(['not_requested', 'pending', 'approved', 'rejected', 'blocked']);
const AUDIT_STATUSES = new Set<CesAuditCloseoutStatus>(['not_started', 'ready', 'certified', 'blocked']);

function ensureStore(): void {
  if (!fs.existsSync(EVENT_DIR)) fs.mkdirSync(EVENT_DIR, { recursive: true });
}

function safeId(id: string): string {
  return id.replace(/[^A-Za-z0-9._-]/g, '_');
}

function fileFor(eventId: string): string {
  return path.join(EVENT_DIR, `${safeId(eventId)}.json`);
}

function nowIso(): string {
  return new Date().toISOString();
}

function normalize(value: string | undefined): string {
  return (value ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function isProbeEvidence(ref: CesExecutionSupportRef): boolean {
  const fields = [ref.evidenceId, ref.fileName, ref.taskId, ref.artifactId].filter(Boolean).join(' ').toLowerCase();
  return fields.includes('credential alignment probe')
    || fields.includes('_credential_alignment_probe')
    || fields.includes('drive + calendar alignment probe');
}

function hasNonProbeSupport(metadata: CesExecutionUpdateMetadata): boolean {
  const refs = metadata.supportingEvidence ?? [];
  return refs.some(ref => !isProbeEvidence(ref) && (ref.driveFileId || ref.artifactId || ref.evidenceId));
}

function assertDependencySupport(
  status: string,
  metadata: CesExecutionUpdateMetadata,
  context: string,
): void {
  if (status !== 'complete' && status !== 'approved' && status !== 'certified') return;
  if (metadata.dependencyVerified === true || hasNonProbeSupport(metadata)) return;
  throw new ApiError(
    'validation_error',
    `${context} cannot be marked ${status} without non-probe supporting evidence/signature metadata.`,
    400,
  );
}

function makeInitialState(eventId: string, workflowId?: string): CesExecutionState {
  const ts = nowIso();
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    eventId,
    workflowId,
    tasks: {},
    forms: {},
    approvals: {},
    updatedAt: ts,
    updatedBy: DEFAULT_ACTOR,
    source: 'ces-execution-state-store',
    auditTrail: [],
  };
}

function readState(eventId: string): CesExecutionState | null {
  ensureStore();
  const file = fileFor(eventId);
  if (!fs.existsSync(file)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as CesExecutionState;
    return {
      ...makeInitialState(eventId, parsed.workflowId),
      ...parsed,
      tasks: parsed.tasks ?? {},
      forms: parsed.forms ?? {},
      approvals: parsed.approvals ?? {},
      auditTrail: parsed.auditTrail ?? [],
    };
  } catch (e) {
    log.warn('ces_execution_state.read.failed', { eventId, error: (e as Error).message });
    return null;
  }
}

function writeState(state: CesExecutionState): CesExecutionState {
  ensureStore();
  const file = fileFor(state.eventId);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf8');
  fs.renameSync(tmp, file);
  return state;
}

function loadOrCreate(eventId: string, workflowId?: string): CesExecutionState {
  const current = readState(eventId);
  return current ?? makeInitialState(eventId, workflowId);
}

function requirementMatches(req: CesExecutionRequirement, candidateId: string, candidateLabel?: string): boolean {
  const accepted = [req.id, req.label, ...(req.aliases ?? [])].map(normalize).filter(Boolean);
  return accepted.includes(normalize(candidateId)) || accepted.includes(normalize(candidateLabel));
}

function findRequirement(
  requirements: CesExecutionRequirement[] | undefined,
  id: string,
  label?: string,
): CesExecutionRequirement | null {
  if (!requirements?.length) return null;
  return requirements.find(req => requirementMatches(req, id, label)) ?? null;
}

function assertEvent(eventId: string, definition?: CesExecutionDefinition): void {
  if (!eventId.trim()) throw new ApiError('validation_error', 'eventId is required.', 400);
  if (definition && definition.eventId !== eventId) {
    throw new ApiError('validation_error', `Execution definition does not match event ${eventId}.`, 400);
  }
}

function actor(metadata: CesExecutionUpdateMetadata): string {
  return metadata.updatedBy?.trim() || DEFAULT_ACTOR;
}

function source(metadata: CesExecutionUpdateMetadata): string {
  return metadata.source?.trim() || 'backend';
}

function appendAudit(
  state: CesExecutionState,
  action: CesExecutionAuditEvent['action'],
  targetId: string,
  status: string,
  metadata: CesExecutionUpdateMetadata,
): void {
  state.auditTrail.push({
    action,
    eventId: state.eventId,
    targetId,
    status,
    occurredAt: nowIso(),
    actor: actor(metadata),
    source: source(metadata),
    note: metadata.note,
  });
}

export function evidenceToSupportRef(ref: CesEvidenceRef): CesExecutionSupportRef {
  return {
    evidenceId: ref.evidenceId,
    artifactId: ref.artifactId,
    driveFileId: ref.driveFileId,
    fileName: ref.fileName,
    taskId: ref.taskId,
    formId: ref.formId,
    formInstanceId: ref.formInstanceId,
  };
}

export async function getCesExecutionState(eventId: string): Promise<CesExecutionState | null> {
  assertEvent(eventId);
  return readState(eventId);
}

export async function updateCesTaskStatus(
  eventId: string,
  taskId: string,
  status: CesExecutionStatus,
  metadata: CesExecutionUpdateMetadata = {},
  definition?: CesExecutionDefinition,
): Promise<CesExecutionState> {
  assertEvent(eventId, definition);
  if (!TASK_STATUSES.has(status)) throw new ApiError('validation_error', `Invalid task status: ${status}`, 400);
  const req = findRequirement(definition?.requiredTasks, taskId, metadata.note);
  if (definition?.requiredTasks?.length && !req) {
    throw new ApiError('validation_error', `Task ${taskId} does not belong to event ${eventId}.`, 400);
  }
  assertDependencySupport(status, metadata, `Task ${taskId}`);
  const state = loadOrCreate(eventId, definition?.workflowId);
  const id = req?.id ?? taskId;
  const ts = nowIso();
  state.tasks[id] = {
    id,
    label: req?.label ?? metadata.note ?? taskId,
    status,
    updatedAt: ts,
    updatedBy: actor(metadata),
    source: source(metadata),
    note: metadata.note,
    supportingEvidence: metadata.supportingEvidence,
  };
  state.updatedAt = ts;
  state.updatedBy = actor(metadata);
  state.source = source(metadata);
  appendAudit(state, 'task.update', id, status, metadata);
  return writeState(state);
}

export async function updateCesFormStatus(
  eventId: string,
  formId: string,
  status: CesExecutionStatus,
  metadata: CesExecutionUpdateMetadata = {},
  definition?: CesExecutionDefinition,
): Promise<CesExecutionState> {
  assertEvent(eventId, definition);
  if (!TASK_STATUSES.has(status)) throw new ApiError('validation_error', `Invalid form status: ${status}`, 400);
  const req = findRequirement(definition?.requiredForms, formId, metadata.note);
  if (definition?.requiredForms?.length && !req) {
    throw new ApiError('validation_error', `Form ${formId} does not belong to event ${eventId}.`, 400);
  }
  assertDependencySupport(status, metadata, `Form ${formId}`);
  const state = loadOrCreate(eventId, definition?.workflowId);
  const id = req?.id ?? formId;
  const ts = nowIso();
  state.forms[id] = {
    id,
    formId,
    formInstanceId: metadata.supportingEvidence?.find(ref => ref.formInstanceId)?.formInstanceId,
    label: req?.label ?? metadata.note ?? formId,
    status,
    updatedAt: ts,
    updatedBy: actor(metadata),
    source: source(metadata),
    note: metadata.note,
    supportingEvidence: metadata.supportingEvidence,
  };
  state.updatedAt = ts;
  state.updatedBy = actor(metadata);
  state.source = source(metadata);
  appendAudit(state, 'form.update', id, status, metadata);
  return writeState(state);
}

export async function updateCesApprovalStatus(
  eventId: string,
  approvalId: string,
  status: CesApprovalStatus,
  metadata: CesExecutionUpdateMetadata & {
    targetKind: CesApprovalRequirement['targetKind'];
    targetLabel: string;
    approverRole: string;
  },
  definition?: CesExecutionDefinition,
): Promise<CesExecutionState> {
  assertEvent(eventId, definition);
  if (!APPROVAL_STATUSES.has(status)) throw new ApiError('validation_error', `Invalid approval status: ${status}`, 400);
  const req = findRequirement(definition?.requiredApprovals, approvalId, metadata.targetLabel) as CesApprovalRequirement | null;
  if (definition?.requiredApprovals?.length && !req) {
    throw new ApiError('validation_error', `Approval ${approvalId} does not belong to event ${eventId}.`, 400);
  }
  assertDependencySupport(status, metadata, `Approval ${approvalId}`);
  const state = loadOrCreate(eventId, definition?.workflowId);
  const id = req?.id ?? approvalId;
  const ts = nowIso();
  state.approvals[id] = {
    id,
    targetKind: req?.targetKind ?? metadata.targetKind,
    targetLabel: req?.label ?? metadata.targetLabel,
    approverRole: req?.approverRole ?? metadata.approverRole,
    status,
    updatedAt: ts,
    updatedBy: actor(metadata),
    source: source(metadata),
    note: metadata.note,
    supportingEvidence: metadata.supportingEvidence,
  };
  state.updatedAt = ts;
  state.updatedBy = actor(metadata);
  state.source = source(metadata);
  appendAudit(state, 'approval.update', id, status, metadata);
  return writeState(state);
}

export async function updateCesAuditCloseoutStatus(
  eventId: string,
  status: CesAuditCloseoutStatus,
  metadata: CesExecutionUpdateMetadata & {
    certifiedBy?: string;
    certifiedRole?: string;
  } = {},
  definition?: CesExecutionDefinition,
): Promise<CesExecutionState> {
  assertEvent(eventId, definition);
  if (!AUDIT_STATUSES.has(status)) throw new ApiError('validation_error', `Invalid audit closeout status: ${status}`, 400);
  assertDependencySupport(status, metadata, `Audit closeout for ${eventId}`);
  const state = loadOrCreate(eventId, definition?.workflowId);
  const ts = nowIso();
  state.auditCloseout = {
    status,
    certifiedBy: metadata.certifiedBy,
    certifiedRole: metadata.certifiedRole,
    certifiedAt: status === 'certified' ? ts : undefined,
    updatedAt: ts,
    updatedBy: actor(metadata),
    source: source(metadata),
    note: metadata.note,
    supportingEvidence: metadata.supportingEvidence,
  };
  state.updatedAt = ts;
  state.updatedBy = actor(metadata);
  state.source = source(metadata);
  appendAudit(state, 'audit_closeout.update', eventId, status, metadata);
  return writeState(state);
}

function findTaskRecord(state: CesExecutionState | null, req: CesExecutionRequirement): CesExecutionTaskRecord | undefined {
  if (!state) return undefined;
  return Object.values(state.tasks).find(record => requirementMatches(req, record.id, record.label));
}

function findFormRecord(state: CesExecutionState | null, req: CesExecutionRequirement): CesExecutionFormRecord | undefined {
  if (!state) return undefined;
  return Object.values(state.forms).find(record => requirementMatches(req, record.id, record.label) || requirementMatches(req, record.formId ?? '', record.label));
}

function findApprovalRecord(state: CesExecutionState | null, req: CesApprovalRequirement): CesExecutionApprovalRecord | undefined {
  if (!state) return undefined;
  return Object.values(state.approvals).find(record => requirementMatches(req, record.id, record.targetLabel));
}

export function deriveCesCompletionState(
  definition: CesExecutionDefinition,
  state: CesExecutionState | null,
): CesDerivedCompletionState {
  const requiredTasks = (definition.requiredTasks ?? []).filter(req => req.required !== false);
  const requiredForms = (definition.requiredForms ?? []).filter(req => req.required !== false);
  const requiredApprovals = (definition.requiredApprovals ?? []).filter(req => req.required !== false);

  const taskStatuses = requiredTasks.map(req => {
    const record = findTaskRecord(state, req);
    return { ...req, status: record?.status ?? 'not_started' as const, record };
  });
  const formStatuses = requiredForms.map(req => {
    const record = findFormRecord(state, req);
    return { ...req, status: record?.status ?? 'not_started' as const, record };
  });
  const approvalStatuses = requiredApprovals.map(req => {
    const record = findApprovalRecord(state, req);
    return { ...req, status: record?.status ?? 'not_requested' as const, record };
  });

  const tasksCompleteCount = taskStatuses.filter(item => item.status === 'complete').length;
  const formsCompleteCount = formStatuses.filter(item => item.status === 'complete').length;
  const approvalsCompleteCount = approvalStatuses.filter(item => item.status === 'approved').length;

  const blockers = [
    ...taskStatuses.filter(item => item.status !== 'complete').map(item => `Task incomplete: ${item.label ?? item.id}`),
    ...formStatuses.filter(item => item.status !== 'complete').map(item => `Form incomplete: ${item.label ?? item.id}`),
    ...approvalStatuses.filter(item => item.status !== 'approved').map(item => `Approval incomplete: ${item.label ?? item.id}`),
  ];

  const auditStatus = state?.auditCloseout?.status ?? 'not_started';
  const auditReadyPercent = auditStatus === 'certified' ? 100 : auditStatus === 'ready' ? 75 : 0;
  if (auditReadyPercent < 100) blockers.push('Audit closeout/certification incomplete');

  return {
    taskStatuses,
    formStatuses,
    approvalStatuses,
    tasksCompleteCount,
    tasksTotalCount: requiredTasks.length,
    formsCompleteCount,
    formsTotalCount: requiredForms.length,
    approvalsCompleteCount,
    approvalsTotalCount: requiredApprovals.length,
    auditReadyPercent,
    blockers,
  };
}
