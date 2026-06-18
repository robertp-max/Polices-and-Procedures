import { env } from './env.js';
import { log } from './logger.js';
import { ApiError } from './errors.js';
import {
  ensureFolderPath, uploadFile, driveFileUrl, driveFolderUrl,
} from './googleDrive.js';
import {
  attachDriveFileToEvent, findByEventId, setEvidenceExtendedProperties,
  type CalendarAttachmentStatus,
} from './googleCalendar.js';
import { getRow } from './sync/eventStore.js';

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
  storageProvider: 'google_calendar_drive';
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
}

/* ─── Pure helpers ─────────────────────────────────────────────── */

/** Sanitize a folder/file segment: keep IDs, drop unsafe characters. */
export function sanitizeName(input: string): string {
  return String(input ?? '')
    .normalize('NFKD')
    .replace(/[/\\?%*:|"<>]/g, '-')   // unsafe filename characters
    .replace(/[\x00-\x1f\x7f]/g, '')  // control chars
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.\-]+|[.\-]+$/g, '')
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
  if (ref.storageProvider !== 'google_calendar_drive') problems.push('storageProvider must be "google_calendar_drive".');
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
    storageProvider: 'google_calendar_drive',
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
