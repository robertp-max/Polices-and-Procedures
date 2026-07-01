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

/** Hard ceiling so a hung server/Drive call can never block the UI forever. */
const REQUEST_TIMEOUT_MS = 45_000;
/** Longer ceiling for source extraction: server runs 3 sequential Brad reads
 * (~90s each worst case = ~270s) plus PDF parse + overhead — 330s leaves margin. */
const EXTRACT_TIMEOUT_MS = 330_000;

async function request<T>(method: string, path: string, body?: unknown, timeoutMs = REQUEST_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...AUTH_HEADER,
      },
      body: body == null ? undefined : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    const aborted = e instanceof DOMException && e.name === 'AbortError';
    const err: CalendarApiError = {
      code: aborted ? 'throttled' : 'network_error',
      message: aborted
        ? `Request timed out after ${Math.round(timeoutMs / 1000)}s (the API or Google Drive did not respond).`
        : (e instanceof Error ? e.message : 'Network request failed'),
      status: 0,
    };
    throw err;
  } finally {
    clearTimeout(timer);
  }
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

  /* ─── Brad Evidence Intake (created-date filing; real Drive) ─── */

  /**
   * Upload a CANONICAL intake evidence file filed by its resolved source-system
   * created date (filingPeriodKey). Returns a REAL driveFileId from the server;
   * the server fails closed when Drive is unreachable (no simulated success).
   */
  async intakeUploadEvidence(input: IntakeUploadEvidenceInput): Promise<IntakeUploadEvidenceResponse> {
    return request('POST', '/intake/evidence/upload', input);
  },

  /** Create a physical Drive copy of canonical evidence into a packet folder. */
  async intakeCopyEvidence(input: IntakeCopyEvidenceInput): Promise<IntakeCopyEvidenceResponse> {
    return request('POST', '/intake/evidence/copy', input);
  },

  /**
   * Save a generated packet to its event's Drive folder (upload-or-replace by a
   * stable per-event filename — a new packet for the same event replaces it).
   */
  async savePacket(input: SavePacketInput): Promise<SavePacketResponse> {
    return request('POST', '/intake/packet', input);
  },

  /** Render standalone packet HTML to a faithful multi-page Letter PDF (Playwright,
   * server-side). Used for the admission form template so it paginates to its true
   * page count instead of one on-screen block. Longer timeout — headless render. */
  async renderPdf(html: string): Promise<{ pdfBase64?: string; byteSize?: number }> {
    return request('POST', '/intake/render-pdf', { html }, EXTRACT_TIMEOUT_MS);
  },

  /** Render the full 63-page admission FORM template server-side from verified
   * fields (Playwright, preferCSSPageSize). Returns the faithful multi-page PDF. */
  async renderAdmission(fields: Record<string, string>): Promise<{ pdfBase64?: string; pageCount?: number; filled?: number }> {
    return request('POST', '/intake/render-admission', { fields }, EXTRACT_TIMEOUT_MS);
  },

  /** Distinct Drive folders from the CSV manifest (source of truth for the Evidence Drive grid). */
  async manifestFolders(): Promise<ManifestFoldersResponse> {
    return request('GET', '/manifest/folders');
  },

  /** Read-only enriched manifest rows (files + folders) for CES Evidence Drive search. */
  async manifestRows(): Promise<ManifestRowsResponse> {
    return request('GET', '/manifest/rows');
  },

  /** Verification-first source extraction: PDF/text -> 3x-read field map (no invention).
   * Uses a longer timeout — the server runs 3 sequential Brad reads. */
  async extractSource(input: { fileName: string; mimeType: string; fileBase64: string; template: SourceTemplateKind }): Promise<SourceExtractionApiResult> {
    return request('POST', '/intake/extract-source', input, EXTRACT_TIMEOUT_MS);
  },
  /** Convenience: extract directly from a File using a binary-safe base64 encode. */
  async extractSourceFile(file: File, template: SourceTemplateKind): Promise<SourceExtractionApiResult> {
    const fileBase64 = await fileToBase64(file);
    return request('POST', '/intake/extract-source', { fileName: file.name, mimeType: file.type || 'application/octet-stream', fileBase64, template }, EXTRACT_TIMEOUT_MS);
  },

  /**
   * Seed the Brad Training library from the real "2026 Brad Training" Drive
   * folder — URL/metadata only (no document bytes). Returns the immediate
   * children (subfolders + files) of `folderId` (defaults to the root) so the
   * UI can navigate the tree folder-by-folder. The viewer renders each file
   * directly from Drive; users without shared-drive access cannot see it.
   */
  async bradTrainingDocs(folderId?: string): Promise<BradTrainingResponse> {
    const q = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
    return request('GET', `/intake/brad-training${q}`);
  },

  /**
   * Browse a packet library Drive folder live (URL/metadata only): the Mock
   * Event Packets folder (01_CES/Evidence/Mock/Packets) or the Patient
   * Admission Packets folder (01_CES/Evidence/Admission/Packets). Returns the
   * immediate children of `folderId` (defaults to the library root).
   */
  async packetLibraryDocs(kind: 'mock' | 'admission', folderId?: string): Promise<BradTrainingResponse> {
    const params = new URLSearchParams({ kind });
    if (folderId) params.set('folderId', folderId);
    return request('GET', `/intake/packet-library?${params.toString()}`);
  },

  /**
   * Save a generated Patient Admission packet to the Admission Packets Drive
   * folder (upload-or-replace by the patient's packet id). Fails closed when
   * Drive is unreachable — never simulated.
   */
  async saveAdmissionPacket(input: SaveAdmissionPacketInput): Promise<SavePacketResponse> {
    return request('POST', '/intake/admission-packet', input);
  },
};

export interface SaveAdmissionPacketInput {
  packetId: string;
  title: string;
  html: string;
  patientRef?: string;
}

export interface SavePacketInput {
  eventId: string;
  packetId: string;
  title: string;
  html: string;
  /** Pre-rendered PDF bytes (base64). When present, the server saves them directly — no HTML→PDF render. */
  pdfBase64?: string;
  eventDate?: string;
  domain?: string;
}
export interface SavePacketResponse {
  driveFileId: string;
  driveFolderId: string;
  driveFolderPath: string;
  driveFileUrl: string;
  rawFileName?: string;
  fileType?: string;
  replaced: boolean;
  /** Drive CSV manifest write-back status (see server/manifest.ts). */
  manifestSyncStatus?: 'synced' | 'failed';
  manifestSyncError?: string;
  manifestLastSyncedAt?: string;
  manifestAction?: 'updated' | 'appended';
}

export interface ManifestFolder {
  section: string;
  folderName: string;
  fullFolderPath: string;
  folderId: string;
  folderUrl: string;
  folderDepth: number;
  count: number;
  lastUpdated: string;
}
export interface ManifestFoldersResponse {
  enabled: boolean;
  folders: ManifestFolder[];
  error?: string;
}

export interface ManifestSearchRow {
  kind: 'file' | 'folder';
  rawFileName: string;
  displayName: string;
  fullFolderPath: string;
  parentFolderPath: string;
  folderName: string;
  folderId: string;
  folderUrl: string;
  fileType: string;
  fileId: string;
  driveLink: string;
  lastUpdated: string;
  notes: string;
  eventId: string;
  workflowId: string;
  policyId: string;
  formId: string;
  packetName: string;
  signerName: string;
  createdBy: string;
  evidenceStatus: string;
}
export interface ManifestRowsResponse {
  enabled: boolean;
  rows: ManifestSearchRow[];
  rootFolderId: string;
  error?: string;
}

export type SourceTemplateKind = 'admission' | 'qapi' | 'event' | 'generic';
export interface ExtractionReconciledField {
  key: string;
  value: string | null;
  confidence: number;     // 0..1
  sourceSnippet: string;  // verbatim evidence from the source
  agreement: number;      // how many of the 3 reads agreed
  needsReview: boolean;
  group?: string;         // review-UI section grouping
  label?: string;         // human label from the extraction schema
}
export interface SourceMetadata {
  sourceId: string;
  fileName: string;
  mimeType: string;
  byteSize: number;
  contentHash: string;
  format: 'pdf' | 'text' | 'unknown';
  pageCount?: number;
  charCount?: number;
  hasText?: boolean;
  localPath: string;
  extractionPath: string;
  driveFileId: string | null;
  driveUrl: string | null;
  createdAtNote: string;
}
export interface SourceExtractionApiResult {
  template: SourceTemplateKind;
  metadata: SourceMetadata;
  extraction: {
    engine: 'brad' | 'unavailable';
    passes: number;
    fields: ExtractionReconciledField[];
    missing: string[];
    mapping: { key: string; sourceSnippet: string }[];
    conflicts: { key: string; values: string[] }[];
    validationSummary: string;
  };
}

export interface BradTrainingFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  path: string;
}

export interface BradTrainingFolderRef {
  id: string;
  name: string;
}

export interface BradTrainingResponse {
  enabled: boolean;
  rootId: string | null;
  folderId: string | null;
  folderUrl: string | null;
  folders: BradTrainingFolderRef[];
  files: BradTrainingFile[];
}

export interface IntakeUploadEvidenceInput {
  canonicalEvidenceId: string;
  filingPeriodKey: string;   // YYYY-MM (resolved created-date period)
  filingQuarterKey?: string;
  classification: string;
  title: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  eventId?: string;
  uploadedBy?: string;
}

export interface IntakeUploadEvidenceResponse {
  canonicalEvidenceId: string;
  driveFileId: string;
  driveFolderId: string;
  driveFolderPath: string;
  driveWebViewLink: string;
  driveUploadStatus: 'uploaded';
  contentStatus: 'available';
  filingPeriodKey: string;
  storageProvider: string;
}

export interface IntakeCopyEvidenceInput {
  canonicalEvidenceId: string;
  copiedFromDriveFileId: string;
  packetId: string;
  eventId: string;
  filingPeriodKey: string;
  classification: string;
  name?: string;
  packetFolderName?: string;
}

export interface IntakeCopyEvidenceResponse {
  canonicalEvidenceId: string;
  copiedFromDriveFileId: string;
  packetId: string;
  driveCopyFileId: string;
  driveFolderId: string;
  driveFolderPath: string;
  driveWebViewLink: string;
}

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

