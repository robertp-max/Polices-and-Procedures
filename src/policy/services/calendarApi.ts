import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════
   Calendar API client
   ----------------------------------------------------------------
   Thin, typed wrapper around the backend /api/calendar/* routes.
   The frontend NEVER speaks to Google directly — all traffic is
   mediated server-side so the service-account key stays private.
   ═══════════════════════════════════════════════════════════════ */

/* ─── Transport types (mirror server/mappers.ts PlannerEventPayload) ─── */

export interface PlannerEventPayload {
  event_id?: string;
  appEventId: string;
  title: string;
  summary?: string;
  description?: string;
  date: string;         // YYYY-MM-DD
  endDate?: string;     // YYYY-MM-DD
  time?: string;        // HH:mm (24h)
  timeEnd?: string;     // HH:mm (24h)
  allDay?: boolean;
  timezone?: string;    // IANA, e.g. "America/Los_Angeles"

  domain?: string;
  category?: string;
  cadence?: string;
  /** Mandate classification — federal-required | conditional-federal | policy-driven | state-required */
  mandateType?: string;
  policyRefs?: string[];
  owner?: string;
  ownerRole?: string;
  status?: string;
  evidenceStatus?: string;
  regulatoryDriver?: string;
  auditRisk?: string;
  completionState?: string;
  location?: string;
}

export interface CesCalendarHubMeta {
  completionPercent: number;
  evidenceCount: number;
  evidenceAttachedCount: number;
  ecignStatus: string;
  ecignDetail?: string;
  calendarAttachmentStatus: string;
  driveLinked: boolean;
  statusLabel: string;
  auditReadyPercent: number;
  workflowId?: string;
  policyRefs?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  swimlanePath?: string;
  eventWorkspacePath?: string;
  workflowPath?: string;
  evidenceCenterPath?: string;
  auditModePath?: string;
  requiredForms?: string;
  requiredSignerRoles?: string;
  requiredEvidence?: string;
  agenda?: string;
}

export interface PlannerEventResponse extends PlannerEventPayload {
  event_id: string;
  googleEventId: string;
  htmlLink?: string;
  createdAt?: string;
  updatedAt?: string;
  source: 'google';
  action?: 'created' | 'updated' | 'skipped' | 'deleted' | 'failed';
  _hub?: CesCalendarHubMeta | null;
  _completion?: {
    percent: number;
    formula: string;
    breakdown: Record<string, number>;
    evidenceCount: number;
    evidenceAttachedCount: number;
    ecignStatus: string;
    calendarAttachmentStatus: string;
    statusLabel: string;
  } | null;
}

export interface BulkSyncResultItem {
  event_id: string;
  ok: boolean;
  google_event_id?: string | null;
  action: 'created' | 'updated' | 'skipped' | 'failed';
  error?: string;
  skipped_reason?: 'hash_unchanged' | 'stale_version';
}

export interface BulkSyncResult {
  results: BulkSyncResultItem[];
  count: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
}

export interface CalendarApiError {
  code: string;
  message: string;
  status: number;
}

/* ─── Google Calendar + Drive evidence types ─────────────────────
   Mirrors server/googleEvidence.ts. Drive stores files; Calendar
   attaches/indexes them. The frontend never speaks to Google
   directly — all traffic flows through /api/calendar/*. */

export type CalendarAttachmentStatus = 'attached' | 'pending_attach' | 'attach_failed' | 'removed';
export type EvidenceContentStatus = 'available' | 'metadata_only' | 'missing';
export type GoogleEvidenceCategory =
  | 'overview'
  | 'form_instance'
  | 'supporting_documentation'
  | 'signed_artifact'
  | 'ecign_certificate'
  | 'final_package';

export interface GoogleCalendarDriveEvidenceRef {
  storageProvider: 'google_drive_calendar';
  eventId: string;
  workflowId?: string;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  calendarEventId: string;
  driveFileId: string;
  driveFileUrl: string;
  driveFolderId?: string;
  mimeType?: string;
  title: string;
  uploadedAt: string;
  uploadedBy?: string;
  attachmentStatus: CalendarAttachmentStatus;
  contentStatus: EvidenceContentStatus;
}

export interface UploadEvidenceInput {
  workflowId?: string;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  category?: GoogleEvidenceCategory;
  title: string;
  domain?: string;
  eventDate?: string;
  uploadedBy?: string;
  attachToCalendar?: boolean;
}

export interface UploadEvidenceResponse {
  evidenceId: string;
  eventId: string;
  workflowId?: string;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  calendarEventId: string;
  driveFolderId?: string;
  driveFileId: string;
  driveFileUrl: string;
  calendarAttachmentStatus: CalendarAttachmentStatus;
  contentStatus: EvidenceContentStatus;
  storageProvider: 'google_drive_calendar';
}

export interface EvidenceHealthResponse {
  ok: boolean;
  enabled: boolean;
  provider: string;
  sharedDriveId?: string;
  rootFolderId?: string;
  drive: { reachable: boolean; rootId?: string; error?: string };
}

/* ─── Config ───────────────────────────────────────────── */

const BASE = '/api/calendar';

/** Optional shared secret (only used if VITE_API_SHARED_SECRET is set). */
const AUTH_HEADER: Record<string, string> = (() => {
  const token = import.meta.env.VITE_API_SHARED_SECRET as string | undefined;
  return token ? { Authorization: `Bearer ${token}` } : ({} as Record<string, string>);
})();

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...AUTH_HEADER,
    },
    body: body == null ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const json = text ? safeJson(text) : null;
  if (!res.ok) {
    const err: CalendarApiError = {
      code: (json && json.error?.code) || 'network_error',
      message: (json && json.error?.message) || res.statusText || 'Request failed',
      status: res.status,
    };
    throw err;
  }
  return (json as T) ?? ({} as T);
}

function safeJson(s: string): { error?: { code?: string; message?: string } } & Record<string, unknown> {
  try { return JSON.parse(s); } catch { return {}; }
}

/* ─── API surface ──────────────────────────────────────── */

export const CalendarApi = {
  async health(): Promise<{ ok: boolean; calendar: { reachable: boolean; summary?: string; error?: string } }> {
    return request('GET', '/healthz');
  },
  async list(params: { start?: string; end?: string; q?: string }): Promise<{ items: PlannerEventResponse[] }> {
    const qs = new URLSearchParams();
    if (params.start) qs.set('start', params.start);
    if (params.end)   qs.set('end', params.end);
    if (params.q)     qs.set('q', params.q);
    return request('GET', `/events?${qs.toString()}`);
  },
  async findByAppId(appEventId: string): Promise<PlannerEventResponse> {
    return request('GET', `/events/by-app/${encodeURIComponent(appEventId)}`);
  },
  async create(payload: PlannerEventPayload): Promise<PlannerEventResponse> {
    return request('POST', '/events', payload);
  },
  async update(appEventId: string, payload: PlannerEventPayload): Promise<PlannerEventResponse> {
    return request('PUT', `/events/${encodeURIComponent(appEventId)}`, payload);
  },
  async remove(appEventId: string, opts: { cancelOnly?: boolean } = {}): Promise<void> {
    const qs = opts.cancelOnly ? '?cancelOnly=1' : '';
    await request<void>('DELETE', `/events/${encodeURIComponent(appEventId)}${qs}`);
  },
  async sync(events: PlannerEventPayload[]): Promise<BulkSyncResult> {
    return request('POST', '/sync', { events });
  },

  /* ─── Google Drive evidence (extends Calendar; no second auth) ─── */

  /** Drive evidence reachability + provider/config status. */
  async evidenceHealth(): Promise<EvidenceHealthResponse> {
    return request('GET', '/evidence/health');
  },

  /**
   * Upload an evidence file for a CES event/task/form. The file is stored in
   * Drive (auto-created event folder) and attached to the matching Calendar
   * event. The file is sent as base64 over the existing JSON transport.
   */
  async uploadEvidence(eventId: string, file: File, meta: UploadEvidenceInput): Promise<UploadEvidenceResponse> {
    const contentBase64 = await fileToBase64(file);
    return request('POST', `/events/${encodeURIComponent(eventId)}/evidence/upload`, {
      ...meta,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      contentBase64,
    });
  },
};

/** Read a File into a base64 string (strips the data: URL prefix). */
async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

/* ─── Translation: RegulatoryEvent → PlannerEventPayload ── */

/** Optional enforcement context folded into Google Calendar event metadata. */
export interface EnforcementSyncContext {
  riskLevel?: 'low' | 'medium' | 'high' | 'immediate-jeopardy';
  riskScore?: number;
  isLocked?: boolean;
  canComplete?: boolean;
  blockerCount?: number;
  approvalGapCount?: number;
  summary?: string;
}

export function toPlannerPayload(ev: RegulatoryEvent, enforcement?: EnforcementSyncContext): PlannerEventPayload {
  const eventType = deriveEventType(ev);
  const titlePrefix = enforcement?.riskLevel === 'immediate-jeopardy' ? '[Incident/Safety] ' : `[${eventType}] `;
  const appBase = (import.meta.env.VITE_APP_BASE_URL as string | undefined) ?? 'https://dovdry3t4njek.cloudfront.net';
  const normalizedBase = appBase.replace(/\/$/, '');
  const eventUrl = `${normalizedBase}/calendar?event=${encodeURIComponent(ev.id)}`;
  const workflowUrl = ev.workflowId
    ? `${normalizedBase}/calendar?event=${encodeURIComponent(ev.id)}&workflow=1`
    : undefined;

  return {
    event_id: ev.id,
    appEventId: ev.id,
    title: `${titlePrefix}${ev.title}`,
    summary: ev.summary,
    date: ev.date,
    endDate: ev.endDate,
    time: ev.time,
    timeEnd: ev.timeEnd,
    allDay: ev.allDay,
    timezone: ev.timezone ?? 'America/Los_Angeles',
    domain: ev.domain,
    category: ev.category ?? eventType,
    cadence: ev.cadence,
    mandateType: ev.mandateType,
    policyRefs: ev.policyRefs,
    owner: ev.owner,
    ownerRole: ev.ownerRole,
    regulatoryDriver: ev.regulatoryDriver,
    auditRisk: enforcement?.riskLevel === 'immediate-jeopardy' ? 'critical' : (ev.complianceFlags?.auditRisk),
    status: deriveStatus(ev, enforcement),
    completionState: deriveStatus(ev, enforcement),
    evidenceStatus: ev.requiredForms?.some(f => f.status === 'missing')
      ? 'missing'
      : ev.requiredForms?.every(f => f.status === 'complete')
        ? 'complete'
        : 'pending',
    location: ev.location,
    description: [
      'Title:',
      ev.title,
      '',
      'Compliance Event ID:',
      ev.id,
      '',
      'Category:',
      ev.category ?? eventType,
      '',
      'Status:',
      deriveStatus(ev, enforcement),
      '',
      'Owner:',
      ev.owner ? `${ev.owner}${ev.ownerRole ? ` (${ev.ownerRole})` : ''}` : 'Unassigned',
      '',
      'Open in Compliance App:',
      eventUrl,
      '',
      'Related Workflow:',
      workflowUrl ?? 'N/A',
      '',
      'Notes:',
      ev.summary ?? 'No additional description provided.',
      'This calendar entry is synced from the Home Health Compliance Platform. The app remains the source of truth.',
    ].join('\n'),
  };
}

function deriveStatus(ev: RegulatoryEvent, enforcement?: EnforcementSyncContext): string {
  if (enforcement?.isLocked) return 'completed';
  if (ev.urgency === 'complete') return 'completed';
  if (ev.urgency === 'overdue') return 'overdue';
  return 'scheduled';
}

function deriveEventType(ev: RegulatoryEvent): 'Compliance' | 'Audit' | 'Training' | 'Policy' | 'Incident/Safety' {
  const key = `${ev.category ?? ''} ${ev.domain ?? ''} ${ev.title ?? ''}`.toLowerCase();
  if (key.includes('incident') || key.includes('safety') || key.includes('jeopardy')) return 'Incident/Safety';
  if (key.includes('audit')) return 'Audit';
  if (key.includes('training') || key.includes('in-service')) return 'Training';
  if (key.includes('policy')) return 'Policy';
  return 'Compliance';
}

