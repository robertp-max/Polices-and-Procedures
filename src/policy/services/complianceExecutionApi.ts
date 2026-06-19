import { REGULATORY_EVENTS, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { buildEventExecutionDataflow, type EventExecutionDataflow } from '@/policy/compliance-execution/useEventExecutionDataflow';
import type { EventExecutionAuditEvent, EventFormInstance, EventInstance, EventTask } from '@/policy/compliance-execution/types';
import { useRegulatoryExecutionStore, type EvidenceDoc } from '@/policy/stores/regulatoryExecutionStore';
import { isEvidenceUsable, logEvidenceDevWarning } from '@/policy/evidence/evidenceModel';

export type ComplianceExecutionApiMode = 'demoLocal' | 'awsRemote';

export interface ComplianceActor {
  actorId?: string;
  actorRole?: string;
}

export interface MutationOptions extends ComplianceActor {
  adminOverride?: boolean;
  reason?: string;
}

export interface InitEvidenceUploadInput {
  filename: string;
  mimeType: string;
  fileSize: number;
  checksum: string;
  policyIds?: string[];
  workflowId?: string;
  formIds?: string[];
}

export interface InitEvidenceUploadResult {
  evidenceId: string;
  uploadUrl: string;
  objectPath: string;
}

export interface ComplianceExecutionApi {
  mode: ComplianceExecutionApiMode;
  listEvents: (query?: { from?: string; to?: string; status?: string }) => Promise<EventExecutionDataflow[]>;
  getEvent: (eventId: string) => Promise<EventExecutionDataflow | null>;
  ensureEventInstance: (sourceEventId: string) => Promise<EventInstance | null>;
  createManualEventInstance: (input: {
    sourceEventId: string;
    scheduledDate: string;
    generatedFrom?: EventInstance['generatedFrom'];
    createdBy?: string;
  }) => Promise<EventInstance | null>;
  patchEventInstance: (eventId: string, patch: Partial<EventInstance>) => Promise<EventInstance | null>;
  cancelEventInstance: (eventId: string, reason: string, opts?: MutationOptions) => Promise<EventInstance | null>;
  certifyEventInstance: (eventId: string, input?: { certifiedBy?: string; certificationId?: string; reason?: string }) => Promise<EventInstance | null>;

  listTasks: (eventId: string) => Promise<EventTask[]>;
  createTask: (eventId: string, task: Partial<EventTask>, opts?: MutationOptions) => Promise<string>;
  patchTask: (eventId: string, taskId: string, patch: Partial<EventTask>, opts?: MutationOptions) => Promise<boolean>;
  cancelTask: (eventId: string, taskId: string, reason: string, opts?: MutationOptions) => Promise<boolean>;
  restoreTask: (eventId: string, taskId: string, opts?: MutationOptions) => Promise<boolean>;

  listForms: (eventId: string) => Promise<EventFormInstance[]>;
  generateFormInstance: (eventId: string, formId: string, policyIds: string[], workflowId?: string) => Promise<EventFormInstance | null>;
  patchFormInstance: (eventId: string, formInstanceId: string, patch: Partial<EventFormInstance>) => Promise<boolean>;

  initEvidenceUpload: (eventId: string, taskId: string, input: InitEvidenceUploadInput) => Promise<InitEvidenceUploadResult>;
  completeEvidenceUpload: (eventId: string, taskId: string, evidenceId: string, opts?: MutationOptions) => Promise<EvidenceDoc | null>;
  listEvidence: (eventId: string, taskId: string) => Promise<EvidenceDoc[]>;
  getEvidenceDownloadUrl: (evidenceId: string) => Promise<{ downloadUrl: string }>;

  getEventAudit: (eventId: string) => Promise<EventExecutionAuditEvent[]>;
  getRecentAudit: () => Promise<EventExecutionAuditEvent[]>;
  verifyAuditHashChain: (eventId?: string) => Promise<{ ok: boolean; checked: number; errors: string[] }>;

  getEventsByPolicyId: (policyId: string) => Promise<EventExecutionDataflow[]>;
  getEventsByWorkflowId: (workflowId: string) => Promise<EventExecutionDataflow[]>;
  getEventsByDateRange: (from: string, to: string) => Promise<EventExecutionDataflow[]>;
  getIncompleteEvents: () => Promise<EventExecutionDataflow[]>;
}

function resolveRegulatoryEventByAnyId(inputId: string): RegulatoryEvent | null {
  const direct = REGULATORY_EVENTS.find(event => event.id === inputId);
  if (direct) return direct;
  const store = useRegulatoryExecutionStore.getState();
  const instance = store.eventInstancesById[inputId];
  if (!instance) return null;
  return REGULATORY_EVENTS.find(event => event.id === instance.sourceEventId) ?? null;
}

function requireRegulatoryEvent(inputId: string): RegulatoryEvent {
  const event = resolveRegulatoryEventByAnyId(inputId);
  if (!event) {
    throw new Error(`No RegulatoryEvent found for id: ${inputId}`);
  }
  return event;
}

function buildLocalDataflow(event: RegulatoryEvent): EventExecutionDataflow {
  const store = useRegulatoryExecutionStore.getState();
  return buildEventExecutionDataflow(event, store);
}

function listAllLocalDataflows(): EventExecutionDataflow[] {
  return REGULATORY_EVENTS.map(buildLocalDataflow);
}

const LocalComplianceExecutionApi: ComplianceExecutionApi = {
  mode: 'demoLocal',

  async listEvents(query) {
    const rows = REGULATORY_EVENTS.map(buildLocalDataflow);
    return rows.filter(row => {
      if (query?.status && row.eventInstance.status !== query.status) return false;
      if (query?.from && row.event.date < query.from) return false;
      if (query?.to && row.event.date > query.to) return false;
      return true;
    });
  },

  async getEvent(eventId) {
    const event = resolveRegulatoryEventByAnyId(eventId);
    return event ? buildLocalDataflow(event) : null;
  },

  async ensureEventInstance(sourceEventId) {
    const event = requireRegulatoryEvent(sourceEventId);
    return useRegulatoryExecutionStore.getState().ensureEventInstance(event);
  },

  async createManualEventInstance(input) {
    return useRegulatoryExecutionStore.getState().createManualEventInstance(input);
  },

  async patchEventInstance(eventId, patch) {
    return useRegulatoryExecutionStore.getState().updateEventInstance(eventId, patch);
  },

  async cancelEventInstance(eventId, reason) {
    return useRegulatoryExecutionStore.getState().cancelEventInstance(eventId, reason);
  },

  async certifyEventInstance(eventId, input) {
    return useRegulatoryExecutionStore.getState().certifyEventInstance(eventId, input ?? {});
  },

  async listTasks(eventId) {
    const event = requireRegulatoryEvent(eventId);
    return buildLocalDataflow(event).tasks;
  },

  async createTask(eventId, task, opts) {
    return useRegulatoryExecutionStore.getState().createTask(eventId, task, { adminOverride: opts?.adminOverride, reason: opts?.reason });
  },

  async patchTask(eventId, taskId, patch, opts) {
    return useRegulatoryExecutionStore.getState().updateTask(eventId, taskId, patch, { adminOverride: opts?.adminOverride, reason: opts?.reason });
  },

  async cancelTask(eventId, taskId, reason, opts) {
    return useRegulatoryExecutionStore.getState().updateTask(eventId, taskId, { status: 'cancelled' }, {
      adminOverride: opts?.adminOverride,
      reason: reason || opts?.reason,
    });
  },

  async restoreTask(eventId, taskId, opts) {
    return useRegulatoryExecutionStore.getState().restoreTask(eventId, taskId, { adminOverride: opts?.adminOverride, reason: opts?.reason });
  },

  async listForms(eventId) {
    const store = useRegulatoryExecutionStore.getState();
    return store.generatedFormInstancesByEventId[eventId] ?? [];
  },

  async generateFormInstance(eventId, formId, policyIds, workflowId) {
    return useRegulatoryExecutionStore.getState().generateFormInstance(eventId, formId, policyIds, workflowId);
  },

  async patchFormInstance(eventId, formInstanceId, patch) {
    const store = useRegulatoryExecutionStore.getState();
    const existing = (store.generatedFormInstancesByEventId[eventId] ?? []).find(item => item.id === formInstanceId);
    if (!existing) return false;
    if (patch.formId) {
      store.setFormStatus(eventId, patch.formId, 'in-progress');
    }
    return true;
  },

  async initEvidenceUpload(eventId, taskId, input) {
    const store = useRegulatoryExecutionStore.getState();
    const evidenceId = store.uploadEvidence(eventId, {
      taskId,
      policyIds: input.policyIds,
      workflowId: input.workflowId,
      formIds: input.formIds,
      name: input.filename,
      kind: 'attachment',
      sizeLabel: `${Math.max(1, Math.round(input.fileSize / 1024))} KB`,
    }, 'Current User');
    const policyToken = input.policyIds?.[0] ?? 'UNASSIGNED-POLICY';
    const workflowToken = input.workflowId ?? 'UNASSIGNED-WORKFLOW';
    const objectPath = `evidence/${policyToken}/${workflowToken}/${eventId}/${evidenceId}/${input.filename}`;
    return { evidenceId, uploadUrl: `local://evidence/${evidenceId}`, objectPath };
  },

  async completeEvidenceUpload(eventId, taskId, evidenceId) {
    const row = (useRegulatoryExecutionStore.getState().evidence[eventId] ?? []).find(item => item.id === evidenceId);
    if (!row || row.taskId !== taskId) return null;
    return row;
  },

  async listEvidence(eventId, taskId) {
    return (useRegulatoryExecutionStore.getState().evidence[eventId] ?? []).filter(item => item.taskId === taskId && isEvidenceUsable(item.status));
  },

  async getEvidenceDownloadUrl(evidenceId) {
    return { downloadUrl: `local://evidence/${evidenceId}` };
  },

  async getEventAudit(eventId) {
    return useRegulatoryExecutionStore.getState().taskAuditByEventId[eventId] ?? [];
  },

  async getRecentAudit() {
    const all = Object.values(useRegulatoryExecutionStore.getState().taskAuditByEventId).flat();
    return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 100);
  },

  async verifyAuditHashChain(eventId) {
    const all = eventId
      ? (useRegulatoryExecutionStore.getState().taskAuditByEventId[eventId] ?? [])
      : Object.values(useRegulatoryExecutionStore.getState().taskAuditByEventId).flat();
    const errors: string[] = [];
    let checked = 0;
    for (let i = 0; i < all.length; i += 1) {
      const item = all[i];
      if (!item.currentHash) errors.push(`Missing currentHash for ${item.auditId}`);
      if (i > 0 && item.prevHash !== all[i - 1].currentHash) {
        errors.push(`Broken hash link for ${item.auditId}`);
      }
      checked += 1;
    }
    return { ok: errors.length === 0, checked, errors };
  },

  async getEventsByPolicyId(policyId) {
    const needle = policyId.toUpperCase();
    return listAllLocalDataflows().filter(item =>
      item.event.policyRefs.some(ref => ref.toUpperCase() === needle),
    );
  },

  async getEventsByWorkflowId(workflowId) {
    return listAllLocalDataflows().filter(item =>
      item.event.workflowId === workflowId || item.tasks.some(task => task.workflowId === workflowId),
    );
  },

  async getEventsByDateRange(from, to) {
    return listAllLocalDataflows().filter(item => item.event.date >= from && item.event.date <= to);
  },

  async getIncompleteEvents() {
    return listAllLocalDataflows().filter(item =>
      item.eventInstance.status !== 'certified' &&
      item.tasks.some(task => task.isRequired && task.status !== 'completed' && !task.isDeleted),
    );
  },
};

const API_BASE = '/api/compliance-execution';
const REMOTE_ALLOWED = ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ENABLE_COMPLIANCE_EXECUTION_REMOTE ?? 'false') === 'true';
let remoteKnownUnavailable = false;

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  if (remoteKnownUnavailable) {
    throw new Error('Compliance execution backend is unavailable. The application is using local execution mode.');
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body == null ? undefined : JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 404 || res.status >= 500) {
      remoteKnownUnavailable = true;
      logEvidenceDevWarning('Remote compliance-execution route unavailable; falling back to local mode.', { status: res.status, path });
      throw new Error('Compliance execution backend is currently unavailable. Please continue in local mode.');
    }
    throw new Error(text || `Request failed: ${method} ${path}`);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

const AwsComplianceExecutionApi: ComplianceExecutionApi = {
  mode: 'awsRemote',

  listEvents: (query) => {
    const qs = new URLSearchParams();
    if (query?.from) qs.set('from', query.from);
    if (query?.to) qs.set('to', query.to);
    if (query?.status) qs.set('status', query.status);
    const queryString = qs.toString();
    return request('GET', `/events${queryString ? `?${queryString}` : ''}`);
  },
  getEvent: (eventId) => request('GET', `/events/${encodeURIComponent(eventId)}`),
  ensureEventInstance: (sourceEventId) => request('POST', '/events/ensure-instance', { sourceEventId }),
  createManualEventInstance: (input) => request('POST', '/events/manual', input),
  patchEventInstance: (eventId, patch) => request('PATCH', `/events/${encodeURIComponent(eventId)}`, patch),
  cancelEventInstance: (eventId, reason, opts) => request('POST', `/events/${encodeURIComponent(eventId)}/cancel`, { reason, ...opts }),
  certifyEventInstance: (eventId, input) => request('POST', `/events/${encodeURIComponent(eventId)}/certify`, input ?? {}),

  listTasks: (eventId) => request('GET', `/events/${encodeURIComponent(eventId)}/tasks`),
  createTask: (eventId, task, opts) => request('POST', `/events/${encodeURIComponent(eventId)}/tasks`, { ...task, ...opts }),
  patchTask: (eventId, taskId, patch, opts) => request('PATCH', `/events/${encodeURIComponent(eventId)}/tasks/${encodeURIComponent(taskId)}`, { ...patch, ...opts }),
  cancelTask: (eventId, taskId, reason, opts) => request('POST', `/events/${encodeURIComponent(eventId)}/tasks/${encodeURIComponent(taskId)}/cancel`, { reason, ...opts }),
  restoreTask: (eventId, taskId, opts) => request('POST', `/events/${encodeURIComponent(eventId)}/tasks/${encodeURIComponent(taskId)}/restore`, opts ?? {}),

  listForms: (eventId) => request('GET', `/events/${encodeURIComponent(eventId)}/forms`),
  generateFormInstance: (eventId, formId, policyIds, workflowId) =>
    request('POST', `/events/${encodeURIComponent(eventId)}/forms/${encodeURIComponent(formId)}/generate`, { policyIds, workflowId }),
  patchFormInstance: (eventId, formInstanceId, patch) =>
    request('PATCH', `/events/${encodeURIComponent(eventId)}/forms/${encodeURIComponent(formInstanceId)}`, patch),

  initEvidenceUpload: (eventId, taskId, input) =>
    request('POST', `/events/${encodeURIComponent(eventId)}/tasks/${encodeURIComponent(taskId)}/evidence/init-upload`, input),
  completeEvidenceUpload: (eventId, taskId, evidenceId, opts) =>
    request('POST', `/events/${encodeURIComponent(eventId)}/tasks/${encodeURIComponent(taskId)}/evidence/${encodeURIComponent(evidenceId)}/complete-upload`, opts ?? {}),
  listEvidence: (eventId, taskId) =>
    request('GET', `/events/${encodeURIComponent(eventId)}/tasks/${encodeURIComponent(taskId)}/evidence`),
  getEvidenceDownloadUrl: (evidenceId) => request('GET', `/evidence/${encodeURIComponent(evidenceId)}/download`),

  getEventAudit: (eventId) => request('GET', `/events/${encodeURIComponent(eventId)}/audit`),
  getRecentAudit: () => request('GET', '/audit/recent'),
  verifyAuditHashChain: (eventId) => {
    const qs = eventId ? `?eventId=${encodeURIComponent(eventId)}` : '';
    return request('GET', `/audit/hash-chain/verify${qs}`);
  },

  getEventsByPolicyId: (policyId) => request('GET', `/policies/${encodeURIComponent(policyId)}/events`),
  getEventsByWorkflowId: (workflowId) => request('GET', `/workflows/${encodeURIComponent(workflowId)}/events`),
  getEventsByDateRange: (from, to) => request('GET', `/events?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
  getIncompleteEvents: () => request('GET', '/events/incomplete'),
};

let currentMode: ComplianceExecutionApiMode = 'demoLocal';

export function setComplianceExecutionApiMode(mode: ComplianceExecutionApiMode): void {
  currentMode = mode;
}

export function getComplianceExecutionApiMode(): ComplianceExecutionApiMode {
  return currentMode;
}

export function getComplianceExecutionApi(mode: ComplianceExecutionApiMode = currentMode): ComplianceExecutionApi {
  if (mode !== 'awsRemote') return LocalComplianceExecutionApi;
  if (!REMOTE_ALLOWED || remoteKnownUnavailable) {
    if (mode === 'awsRemote') {
      logEvidenceDevWarning('awsRemote mode requested but unavailable. Returning demoLocal API client.');
    }
    return LocalComplianceExecutionApi;
  }
  return AwsComplianceExecutionApi;
}

