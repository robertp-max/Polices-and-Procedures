import { env } from './env.js';
import { log } from './logger.js';
import { ApiError } from './errors.js';
import {
  ensureFolderPath, uploadFile, uploadOrReplaceFile, copyFile, driveFileUrl, driveFolderUrl,
} from './googleDrive.js';
import {
  attachDriveFileToEvent, findByEventId, setEvidenceExtendedProperties,
  type CalendarAttachmentStatus,
} from './googleCalendar.js';
import { getRow } from './sync/eventStore.js';
import { htmlToPdf } from './htmlToPdf.js';

/* ═══════════════════════════════════════════════════════════════
   Google Calendar + Drive evidence orchestration.

   Architecture:
     Google Calendar event = CES event shell + attachment index
     Google Drive          = actual file/document storage
     App                   = task/form/evidence/signature/audit logic

   Pure helpers (folder path, sanitize, PHI guard, ref builder,
   extendedProperties allowlist, dedupe) are exported separately so
   they can be unit-validated without any network call.
   ═══════════════════════════════════════════════════════════════ */

export type EvidenceCategory =
  | 'overview'
  | 'form_instance'
  | 'supporting_documentation'
  | 'signed_artifact'
  | 'ecign_certificate'
  | 'final_package';

/** Stable, non-PHI subfolder names under each event folder. */
export const EVIDENCE_SUBFOLDERS: Record<EvidenceCategory, string> = {
  overview: '00-event-overview',
  form_instance: '01-form-instances',
  supporting_documentation: '02-supporting-documentation',
  signed_artifact: '03-signed-artifacts',
  ecign_certificate: '04-ecign-certificates',
  final_package: '05-final-evidence-package',
};

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
  contentStatus: 'available' | 'metadata_only' | 'missing';
  // CES routing extras (populated at upload time for downstream evidence center / folder validation; non-PHI)
  drivePath?: string;
  driveEventFolderId?: string;
  driveEventFolderPath?: string;
  driveEventFolderUrl?: string;
}

/* ─── Pure helpers ─────────────────────────────────────────────── */

/** Sanitize a folder/file segment: keep IDs, drop unsafe characters. */
export function sanitizeName(input: string): string {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[/\\?%*:|"<>]/g, '-')   // unsafe filename characters
    // eslint-disable-next-line no-control-regex -- intentional control-char stripping for Drive folder/file names
    .replace(new RegExp('[\x00-\x1f\x7f]', 'g'), '')  // control chars
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 120)
    || 'unspecified';
}

/** Sanitize a filename while preserving a single extension. */
export function sanitizeFileName(name: string): string {
  const raw = String(name ?? 'file');
  const dot = raw.lastIndexOf('.');
  const ext = dot > 0 ? raw.slice(dot + 1).replace(/[^A-Za-z0-9]/g, '').slice(0, 8) : '';
  const stem = sanitizeName(dot > 0 ? raw.slice(0, dot) : raw);
  return ext ? `${stem}.${ext.toLowerCase()}` : stem;
}

export function yearFromDate(dateISO?: string): string {
  const d = dateISO && /^\d{4}-\d{2}-\d{2}/.test(dateISO) ? dateISO : new Date().toISOString();
  return d.slice(0, 4);
}

export function quarterFromDate(dateISO?: string): string {
  const d = dateISO && /^\d{4}-\d{2}-\d{2}/.test(dateISO) ? dateISO : new Date().toISOString().slice(0, 10);
  const month = Number(d.slice(5, 7));
  return `Q${Math.floor((month - 1) / 3) + 1}`;
}

export function fullMonthName(dateISO?: string): string {
  const d = dateISO && /^\d{4}-\d{2}-\d{2}/.test(dateISO) ? new Date(dateISO) : new Date();
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return months[d.getUTCMonth()] || 'Unknown';
}

/**
 * Heuristic PHI guard for names. Returns true when a folder/file name looks
 * like it could contain patient identifiers (SSN, MRN, DOB, "patient <name>").
 * The builders always construct names from system IDs, so this is a defensive
 * tripwire — not the primary control.
 */
export function looksLikePhiName(value: string): boolean {
  const s = String(value ?? '');
  if (/\b\d{3}-\d{2}-\d{4}\b/.test(s)) return true;                 // SSN
  if (/\bmrn[-_ ]?\d{3,}\b/i.test(s)) return true;                  // MRN
  if (/\bdob\b/i.test(s)) return true;                              // date of birth label
  if (/\b\d{2}[/-]\d{2}[/-]\d{4}\b/.test(s)) return true;           // date-like (possible DOB)
  if (/\bpatient[-_ ]+[a-z]+[-_ ]+[a-z]+/i.test(s)) return true;    // "patient first last"
  return false;
}

/**
 * Build the sanitized Drive folder segments for an evidence upload.
 *
 * Event-level:  {year}/{quarter}/{domain}/{eventId}/{category}
 * Task/form:    .../{category}/{taskId}/{formId}/{formInstanceId}/{evidenceRequirementId}
 *
 * All segments are derived from IDs and sanitized — never PHI/patient names.
 */
export function buildEvidenceFolderSegments(input: {
  eventId: string;
  domain?: string;
  eventDate?: string;
  category: EvidenceCategory;
  taskId?: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
}): string[] {
  // Harden for CES task evidence: always route to 01_CES/Evidence/YEAR/MONTH/EVENT/
  // regardless of artifact type (eCign signed, form, supporting, final package, etc.).
  // Files land directly under the event folder (or task sub if present).
  // This ensures CES events land under the canonical CES evidence tree and not category folders.
  const segments: string[] = [
    '01_CES',
    'Evidence',
    sanitizeName(yearFromDate(input.eventDate)),
    sanitizeName(fullMonthName(input.eventDate)),
    sanitizeName(input.eventId),
  ];
  // Task/form-specific deepening (only the segments that are present). No category sub to keep under event.
  for (const part of [input.taskId, input.formId, input.formInstanceId, input.evidenceRequirementId ?? input.supportTaskId]) {
    if (part) segments.push(sanitizeName(part));
  }
  return segments;
}

/** Build a lightweight, NON-PHI extendedProperties bag for the Calendar event. */
export function buildLightweightExtendedProperties(input: {
  eventId: string;
  workflowId?: string;
  evidencePackageId?: string;
  swimlaneRoute?: string;
  evidenceRoute?: string;
  artifactRoute?: string;
  eventStatus?: string;
  auditReadyPct?: number;
  driveFolderId?: string;
  attachmentCount?: number;
}): Record<string, string> {
  const out: Record<string, string> = {};
  const set = (k: string, v?: string) => { if (v != null && v !== '') out[k] = v; };
  set('event_id', input.eventId);
  set('workflowId', input.workflowId);
  set('evidencePackageId', input.evidencePackageId);
  set('swimlaneRoute', input.swimlaneRoute);
  set('evidenceRoute', input.evidenceRoute);
  set('artifactRoute', input.artifactRoute);
  set('eventStatus', input.eventStatus);
  set('auditReadyPct', input.auditReadyPct != null ? String(input.auditReadyPct) : undefined);
  set('lastEvidenceSyncAt', new Date().toISOString());
  set('evidenceDriveFolderId', input.driveFolderId);
  set('evidenceAttachmentCount', input.attachmentCount != null ? String(input.attachmentCount) : undefined);
  return out;
}

/** Stable id for an evidence reference (used for dedupe). */
export function buildEvidenceId(input: {
  eventId: string;
  taskId: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  driveFileId: string;
}): string {
  const parts = [
    'GEV',
    sanitizeName(input.eventId),
    sanitizeName(input.taskId),
    sanitizeName(input.formInstanceId ?? 'NOFI'),
    sanitizeName(input.evidenceRequirementId ?? input.supportTaskId ?? 'NOREQ'),
    sanitizeName(input.driveFileId),
  ];
  return parts.join('-');
}

/** Remove duplicate evidence refs (same eventId + driveFileId). */
export function dedupeEvidenceRefs(refs: GoogleCalendarDriveEvidenceRef[]): GoogleCalendarDriveEvidenceRef[] {
  const seen = new Set<string>();
  return refs.filter(ref => {
    const key = `${ref.eventId}::${ref.driveFileId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Keys that must NEVER appear in Calendar extendedProperties. */
const FORBIDDEN_EXT_PROP_KEYS = [
  'patient', 'patientName', 'mrn', 'ssn', 'dob', 'formAnswers',
  'auditTrail', 'certificateText', 'signedPdf', 'fullPayload',
];

/** True when an extendedProperties bag carries PHI-like keys or values. */
export function extendedPropertiesHavePhi(props: Record<string, string>): boolean {
  for (const [k, v] of Object.entries(props)) {
    if (FORBIDDEN_EXT_PROP_KEYS.some(bad => k.toLowerCase().includes(bad.toLowerCase()))) return true;
    if (looksLikePhiName(String(v))) return true;
  }
  return false;
}

/**
 * Validate a Google-backed evidence ref. Returns a list of human-readable
 * problems (empty = valid). Enforces required IDs, form/support binding, and
 * honest attachment/content status (no faking "attached" without a file).
 */
export function validateEvidenceRef(ref: Partial<GoogleCalendarDriveEvidenceRef>): string[] {
  const problems: string[] = [];
  if (ref.storageProvider !== 'google_drive_calendar') problems.push('storageProvider must be "google_drive_calendar".');
  if (!ref.eventId) problems.push('missing eventId.');
  if (!ref.calendarEventId) problems.push('missing calendarEventId.');
  if (!ref.driveFileId) problems.push('missing driveFileId.');
  if (!ref.taskId) problems.push('missing taskId.');

  // Form evidence must carry both formId and formInstanceId.
  if (ref.formId && !ref.formInstanceId) problems.push('form evidence is missing formInstanceId.');
  if (ref.formInstanceId && !ref.formId) problems.push('form evidence is missing formId.');

  // Supporting documentation must carry a requirement or support task id.
  const isSupport = ref.title?.toLowerCase().includes('support')
    || (!ref.formInstanceId && (ref.supportTaskId != null || ref.evidenceRequirementId != null));
  if (isSupport && !ref.supportTaskId && !ref.evidenceRequirementId) {
    problems.push('supporting documentation evidence needs supportTaskId or evidenceRequirementId.');
  }

  // Honesty: "attached" requires a real Drive file; metadata-only/missing must say so.
  const validAttach = ['attached', 'pending_attach', 'attach_failed', 'removed'];
  const validContent = ['available', 'metadata_only', 'missing'];
  if (ref.attachmentStatus && !validAttach.includes(ref.attachmentStatus)) problems.push(`invalid attachmentStatus "${ref.attachmentStatus}".`);
  if (ref.contentStatus && !validContent.includes(ref.contentStatus)) problems.push(`invalid contentStatus "${ref.contentStatus}".`);
  if (ref.attachmentStatus === 'attached' && (!ref.driveFileId || ref.contentStatus === 'missing')) {
    problems.push('attachmentStatus "attached" requires a real Drive file (dishonest status).');
  }
  return problems;
}

/* ─── Impure orchestration ─────────────────────────────────────── */

function resolveCalendarEventId(eventId: string): string | null {
  const row = getRow(eventId);
  return row?.google_event_id ?? null;
}

export interface UploadEvidenceInput {
  eventId: string;
  workflowId?: string;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  category?: EvidenceCategory;
  title: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  domain?: string;
  eventDate?: string;
  uploadedBy?: string;
  /** Default true. When false, file lands in Drive but is not attached. */
  attachToCalendar?: boolean;
}

export interface UploadEvidenceResult {
  evidenceId: string;
  ref: GoogleCalendarDriveEvidenceRef;
}

/**
 * Upload an evidence file to Drive (auto-creating the event-derived folder
 * path) and attach it to the matching Calendar event. Never fabricates
 * evidence: contentStatus reflects whether real bytes were stored.
 */
export async function uploadEventEvidence(input: UploadEvidenceInput): Promise<UploadEvidenceResult> {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Calendar/Drive evidence is disabled (GOOGLE_CALENDAR_EVIDENCE_ENABLED=false).', 400);
  }
  if (!input.eventId) throw new ApiError('validation_error', 'eventId is required.', 400);
  if (!input.taskId) throw new ApiError('validation_error', 'taskId is required.', 400);
  if (!input.contentBase64) throw new ApiError('validation_error', 'File content is required.', 400);

  const safeFileName = sanitizeFileName(input.fileName || input.title || 'evidence');
  // Defense-in-depth: refuse names that smell like PHI.
  if (looksLikePhiName(safeFileName) || looksLikePhiName(input.title)) {
    throw new ApiError('validation_error', 'Evidence name appears to contain PHI/patient identifiers. Use system IDs only.', 400);
  }

  const category: EvidenceCategory = input.category
    ?? (input.evidenceRequirementId || input.supportTaskId ? 'supporting_documentation'
      : input.formInstanceId ? 'form_instance' : 'overview');

  const segments = buildEvidenceFolderSegments({
    eventId: input.eventId,
    domain: input.domain,
    eventDate: input.eventDate,
    category,
    taskId: input.taskId,
    formId: input.formId,
    formInstanceId: input.formInstanceId,
    evidenceRequirementId: input.evidenceRequirementId,
    supportTaskId: input.supportTaskId,
  });

  const buffer = Buffer.from(input.contentBase64, 'base64');
  if (buffer.length === 0) throw new ApiError('validation_error', 'Decoded file is empty.', 400);

  const folderId = await ensureFolderPath(segments);
  const uploaded = await uploadFile({
    parentId: folderId,
    name: safeFileName,
    mimeType: input.mimeType || 'application/octet-stream',
    buffer,
  });

  const fileUrl = uploaded.webViewLink ?? driveFileUrl(uploaded.fileId);

  // Resolve the Calendar google_event_id (cached store first, then live lookup).
  let calendarEventId = resolveCalendarEventId(input.eventId);
  if (!calendarEventId) {
    const live = await findByEventId(input.eventId);
    calendarEventId = live?.googleEventId ?? '';
  }

  let attachmentStatus: CalendarAttachmentStatus = 'pending_attach';
  if (input.attachToCalendar !== false && calendarEventId) {
    const result = await attachDriveFileToEvent(input.eventId, {
      fileId: uploaded.fileId,
      fileUrl,
      title: input.title || safeFileName,
      mimeType: uploaded.mimeType,
    });
    attachmentStatus = result.status;
    // Lightweight, NON-PHI status only.
    await setEvidenceExtendedProperties(input.eventId, {
      ...buildLightweightExtendedProperties({
        eventId: input.eventId,
        workflowId: input.workflowId,
        driveFolderId: folderId,
        attachmentCount: result.attachmentCount,
      }),
    });
  } else if (!calendarEventId) {
    attachmentStatus = 'attach_failed';
    log.warn('google.evidence.no_calendar_event', { eventId: input.eventId });
  }

  const ref: GoogleCalendarDriveEvidenceRef = {
    storageProvider: 'google_drive_calendar',
    eventId: input.eventId,
    workflowId: input.workflowId,
    taskId: input.taskId,
    formId: input.formId,
    formInstanceId: input.formInstanceId,
    evidenceRequirementId: input.evidenceRequirementId,
    supportTaskId: input.supportTaskId,
    calendarEventId: calendarEventId || '',
    driveFileId: uploaded.fileId,
    driveFileUrl: fileUrl,
    driveFolderId: folderId,
    mimeType: uploaded.mimeType,
    title: input.title || safeFileName,
    uploadedAt: new Date().toISOString(),
    uploadedBy: input.uploadedBy,
    attachmentStatus,
    contentStatus: 'available',
    // Additional for CES routing validation
    drivePath: segments.join('/'),
    driveEventFolderId: folderId, // the event level folder
    driveEventFolderPath: segments.slice(0, 5).join('/'), // up to event
    driveEventFolderUrl: evidenceFolderUrl ? evidenceFolderUrl(folderId) : undefined,
  };

  // Enforce Drive metadata honesty on every upload path. No faked "attached" or missing file refs allowed.
  const validationProblems = validateEvidenceRef(ref);
  if (validationProblems.length > 0) {
    throw new ApiError('validation_error', `Dishonest evidence metadata: ${validationProblems.join('; ')}`, 400);
  }

  const evidenceId = buildEvidenceId({
    eventId: input.eventId,
    taskId: input.taskId,
    formInstanceId: input.formInstanceId,
    evidenceRequirementId: input.evidenceRequirementId,
    supportTaskId: input.supportTaskId,
    driveFileId: uploaded.fileId,
  });

  log.info('google.evidence.upload.ok', {
    evidenceId, eventId: input.eventId, taskId: input.taskId,
    driveFileId: uploaded.fileId, attachmentStatus,
  });

  return { evidenceId, ref };
}

/** Folder link helper re-exported for route/UI convenience. */
export function evidenceFolderUrl(folderId: string): string {
  return driveFolderUrl(folderId);
}

/* ═══════════════════════════════════════════════════════════════
   Brad Evidence Intake — created-date filing (Section 9 + 3A).

   Intake canonical evidence is filed by the resolved SOURCE-SYSTEM
   CREATED date (the filing period), NOT the event/occurrence/upload
   date. The folder convention extends the existing 01_CES/Evidence
   tree with a dedicated Intake branch keyed to the filing period:

     01_CES/Evidence/Intake/{filingYear}/{filingMonthName}/{classification}/{leaf}

   This preserves the established Drive root + 01_CES/Evidence prefix
   while making created-date filing explicit and auditable.
   ═══════════════════════════════════════════════════════════════ */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Parse a "YYYY-MM" filing-period key into year + month name. */
function partsFromFilingPeriodKey(filingPeriodKey: string): { year: string; monthName: string } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(String(filingPeriodKey ?? '').trim());
  if (!m) return null;
  const month = Number(m[2]);
  if (month < 1 || month > 12) return null;
  return { year: m[1], monthName: MONTH_NAMES[month - 1] };
}

/**
 * Build the sanitized Drive folder segments for an intake canonical-evidence
 * upload, filed by the resolved created-date filing period.
 */
/** The single Drive folder that ALL mock/training evidence is filed under. */
export const MOCK_EVENT_ID = 'mock-training';
export const MOCK_EVIDENCE_SEGMENTS = ['01_CES', 'Evidence', 'Mock'];

export function buildIntakeEvidenceFolderSegments(input: {
  filingPeriodKey: string;
  classification: string;
  leaf?: string;
  eventId?: string;
}): string[] | null {
  // Mock/training packets all land in one folder — no period/classification split.
  if (input.eventId === MOCK_EVENT_ID) {
    const segments = [...MOCK_EVIDENCE_SEGMENTS];
    if (input.leaf) segments.push(sanitizeName(input.leaf));
    return segments;
  }
  const parts = partsFromFilingPeriodKey(input.filingPeriodKey);
  if (!parts) return null; // never guess a period
  const segments = [
    '01_CES',
    'Evidence',
    'Intake',
    sanitizeName(parts.year),
    sanitizeName(parts.monthName),
    sanitizeName(input.classification || 'unclassified'),
  ];
  if (input.leaf) segments.push(sanitizeName(input.leaf));
  return segments;
}

export interface IntakeUploadInput {
  canonicalEvidenceId: string;
  filingPeriodKey: string;   // YYYY-MM (resolved created-date period)
  filingQuarterKey?: string; // YYYY-Qn
  classification: string;
  title: string;
  fileName: string;
  mimeType: string;
  contentBase64: string;
  eventId?: string;
  uploadedBy?: string;
}

export interface IntakeUploadResult {
  driveFileId: string;
  driveFolderId: string;
  driveFolderPath: string;
  driveFileUrl: string;
  contentStatus: 'available';
}

/**
 * Upload a canonical intake evidence file to its created-date filing folder in
 * Drive. Returns a REAL driveFileId — never a simulated id. Throws (fail-closed)
 * when the integration is disabled, the filing period is unresolved, or the
 * name looks like PHI.
 */
export async function uploadIntakeEvidence(input: IntakeUploadInput): Promise<IntakeUploadResult> {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled (GOOGLE_CALENDAR_EVIDENCE_ENABLED=false).', 400);
  }
  if (!input.canonicalEvidenceId) throw new ApiError('validation_error', 'canonicalEvidenceId is required.', 400);
  if (!input.contentBase64) throw new ApiError('validation_error', 'File content is required.', 400);

  const segments = buildIntakeEvidenceFolderSegments({
    filingPeriodKey: input.filingPeriodKey,
    classification: input.classification,
    eventId: input.eventId,
    leaf: input.eventId === MOCK_EVENT_ID ? undefined : input.eventId,
  });
  if (!segments) {
    // Never silently upload to a generic root after a folder-resolution failure.
    throw new ApiError('validation_error', `Unresolved filing period "${input.filingPeriodKey}"; refusing to file evidence without a resolved created-date period.`, 400);
  }

  const safeFileName = sanitizeFileName(input.fileName || input.title || input.canonicalEvidenceId);
  if (looksLikePhiName(safeFileName) || looksLikePhiName(input.title)) {
    throw new ApiError('validation_error', 'Evidence name appears to contain PHI/patient identifiers. Use system IDs only.', 400);
  }

  const buffer = Buffer.from(input.contentBase64, 'base64');
  if (buffer.length === 0) throw new ApiError('validation_error', 'Decoded file is empty.', 400);

  const folderId = await ensureFolderPath(segments);
  const uploaded = await uploadFile({
    parentId: folderId,
    name: safeFileName,
    mimeType: input.mimeType || 'application/octet-stream',
    buffer,
  });

  log.info('google.evidence.intake.upload.ok', {
    canonicalEvidenceId: input.canonicalEvidenceId,
    driveFileId: uploaded.fileId,
    filingPeriodKey: input.filingPeriodKey,
    classification: input.classification,
  });

  return {
    driveFileId: uploaded.fileId,
    driveFolderId: folderId,
    driveFolderPath: segments.join('/'),
    driveFileUrl: uploaded.webViewLink ?? driveFileUrl(uploaded.fileId),
    contentStatus: 'available',
  };
}

export interface SavePacketInput {
  eventId: string;
  packetId: string;
  title: string;
  html: string;
  eventDate?: string;
  domain?: string;
}
export interface SavePacketResult {
  driveFileId: string;
  driveFolderId: string;
  driveFolderPath: string;
  driveFileUrl: string;
  replaced: boolean;
}

/**
 * Save a generated packet to its event's Drive folder. Uses a STABLE per-event
 * filename ({eventId}-packet.html) and upload-or-replace, so generating a new
 * packet for the same event REPLACES the prior version (stable link/file id).
 * Mock/training packets all land in the single Mock/Packets folder.
 */
export async function savePacketToEvent(input: SavePacketInput): Promise<SavePacketResult> {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  if (!input.eventId) throw new ApiError('validation_error', 'eventId is required.', 400);
  if (!input.html) throw new ApiError('validation_error', 'Packet html is required.', 400);

  const segments = input.eventId === MOCK_EVENT_ID
    ? [...MOCK_EVIDENCE_SEGMENTS, 'Packets']
    : buildEvidenceFolderSegments({ eventId: input.eventId, domain: input.domain, eventDate: input.eventDate, category: 'overview' }).slice(0, 4).concat('Packets');

  // TEMP override: send all packets to a single folder (easy cleanup) when set.
  const folderId = env.packetOverrideFolderId || await ensureFolderPath(segments);
  // Render to a real PDF when a browser is available; fall back to HTML otherwise.
  const pdf = await htmlToPdf(input.html);
  const safeName = sanitizeFileName(`${input.eventId}-packet.${pdf ? 'pdf' : 'html'}`);
  const res = await uploadOrReplaceFile({
    parentId: folderId, name: safeName,
    mimeType: pdf ? 'application/pdf' : 'text/html',
    buffer: pdf ?? Buffer.from(input.html, 'utf8'),
  });
  log.info('google.packet.saved', { eventId: input.eventId, packetId: input.packetId, fileId: res.fileId, replaced: res.replaced, format: pdf ? 'pdf' : 'html' });
  return {
    driveFileId: res.fileId,
    driveFolderId: folderId,
    driveFolderPath: env.packetOverrideFolderId ? `(override folder ${folderId})` : segments.join('/'),
    driveFileUrl: res.webViewLink ?? driveFileUrl(res.fileId),
    replaced: res.replaced,
  };
}

/** Drive folders that back the Evidence-Drive packet libraries. */
export const MOCK_PACKET_SEGMENTS = [...MOCK_EVIDENCE_SEGMENTS, 'Packets'];
export const ADMISSION_PACKET_SEGMENTS = ['01_CES', 'Evidence', 'Admission', 'Packets'];

/** Resolve (auto-create) the root folder id for a packet library. */
export async function resolvePacketLibraryRoot(kind: 'mock' | 'admission'): Promise<string> {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  const segments = kind === 'admission' ? ADMISSION_PACKET_SEGMENTS : MOCK_PACKET_SEGMENTS;
  return ensureFolderPath(segments);
}

export interface SaveAdmissionPacketInput {
  packetId: string;
  title: string;
  html: string;
  patientRef?: string;
}

/**
 * Save a Patient Admission packet into 01_CES/Evidence/Admission/Packets, using
 * a stable per-packet filename so re-generating the same packet id replaces it.
 */
export async function saveAdmissionPacket(input: SaveAdmissionPacketInput): Promise<SavePacketResult> {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  if (!input.packetId) throw new ApiError('validation_error', 'packetId is required.', 400);
  if (!input.html) throw new ApiError('validation_error', 'Packet html is required.', 400);
  // TEMP override: send all packets to a single folder (easy cleanup) when set.
  const folderId = env.packetOverrideFolderId || await ensureFolderPath(ADMISSION_PACKET_SEGMENTS);
  // Render to a real PDF when a browser is available; fall back to HTML otherwise.
  const pdf = await htmlToPdf(input.html);
  const safeName = sanitizeFileName(`${input.packetId}.${pdf ? 'pdf' : 'html'}`);
  const res = await uploadOrReplaceFile({
    parentId: folderId, name: safeName,
    mimeType: pdf ? 'application/pdf' : 'text/html',
    buffer: pdf ?? Buffer.from(input.html, 'utf8'),
  });
  log.info('google.admission-packet.saved', { packetId: input.packetId, fileId: res.fileId, replaced: res.replaced, format: pdf ? 'pdf' : 'html' });
  return {
    driveFileId: res.fileId,
    driveFolderId: folderId,
    driveFolderPath: env.packetOverrideFolderId ? `(override folder ${folderId})` : ADMISSION_PACKET_SEGMENTS.join('/'),
    driveFileUrl: res.webViewLink ?? driveFileUrl(res.fileId),
    replaced: res.replaced,
  };
}

export interface IntakeCopyInput {
  canonicalEvidenceId: string;
  copiedFromDriveFileId: string;
  packetId: string;
  eventId: string;
  filingPeriodKey: string;
  classification: string;
  packetFolderName?: string;
  name?: string;
}

export interface IntakeCopyResult {
  driveCopyFileId: string;
  driveFolderId: string;
  driveFolderPath: string;
  driveFileUrl: string;
}

/**
 * Create a physical Drive copy of canonical evidence into a packet folder
 * (Section 10). Uses the Drive copy API, preserves canonicalEvidenceId
 * provenance (recorded by the caller), and never overwrites the original.
 */
export async function copyEvidenceToPacketFolder(input: IntakeCopyInput): Promise<IntakeCopyResult> {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  if (!input.copiedFromDriveFileId) throw new ApiError('validation_error', 'copiedFromDriveFileId is required for a packet copy.', 400);

  const parts = partsFromFilingPeriodKey(input.filingPeriodKey);
  const segments = [
    '01_CES', 'Evidence', 'Packets',
    sanitizeName(parts?.year ?? 'unknown'),
    sanitizeName(input.packetId),
    sanitizeName(input.packetFolderName ?? input.classification),
  ];
  const folderId = await ensureFolderPath(segments);
  const copied = await copyFile({
    sourceFileId: input.copiedFromDriveFileId,
    destFolderId: folderId,
    name: input.name,
  });

  log.info('google.evidence.intake.copy.ok', {
    canonicalEvidenceId: input.canonicalEvidenceId,
    packetId: input.packetId,
    driveCopyFileId: copied.fileId,
    copiedFromDriveFileId: input.copiedFromDriveFileId,
  });

  return {
    driveCopyFileId: copied.fileId,
    driveFolderId: folderId,
    driveFolderPath: segments.join('/'),
    driveFileUrl: copied.webViewLink ?? driveFileUrl(copied.fileId),
  };
}
