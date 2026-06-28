import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  listEvents, pingCalendar, resolveCalendarEvent,
} from '../googleCalendar.js';
import {
  buildEnrichedPlannerPayloadLive,
  getCesEnrichment,
  parseCesHubMeta,
} from '../cesCalendarEventBuilder.js';
import { dedupePlannerEvents } from '../cesCalendarDedup.js';
import { ApiError } from '../errors.js';
import { log } from '../logger.js';
import type { PlannerEventPayload } from '../mappers.js';
import {
  syncEvent, syncEvents, deleteSyncedEvent, cleanupDuplicates,
} from '../sync/eventSync.js';
import { listRows, getRow } from '../sync/eventStore.js';
import { tailAudit } from '../sync/auditLog.js';
import { tailNotifications } from '../sync/bradNotifier.js';
import { env } from '../env.js';
import { pingDrive, ensureFolderPath, listFolderChildren, driveFolderUrl } from '../googleDrive.js';
import {
  uploadEventEvidence,
  uploadIntakeEvidence,
  savePacketToEvent,
  saveAdmissionPacket,
  resolvePacketLibraryRoot,
  copyEvidenceToPacketFolder,
  buildEvidenceFolderSegments,
  evidenceFolderUrl,
  type EvidenceCategory,
  type GoogleCalendarDriveEvidenceRef,
} from '../googleEvidence.js';
import { transcribeAudio } from '../transcription.js';
import { getCesMetadataStore, type CesEvidenceRef } from '../cesMetadataStore.js';
import { store as ecignStore } from '../ecign/store.js';

/* ═══════════════════════════════════════════════════════════════
   Calendar API routes — thin HTTP layer around the sync engine.
   All event writes go through `eventSync` so idempotency, hashing,
   version control, audit, and Brad notifications are guaranteed.
   ═══════════════════════════════════════════════════════════════ */

export const calendarRouter: Router = Router();

/** GET /api/calendar/events?start=YYYY-MM-DD&end=YYYY-MM-DD&q=... */
calendarRouter.get('/events', asyncHandler(async (req, res) => {
  const { start, end, q } = req.query as Record<string, string | undefined>;
  validateISODate(start, 'start');
  validateISODate(end, 'end');
  const items = await listEvents({ start, end, q });
  const deduped = dedupePlannerEvents(items);
  res.json({ items: deduped.items, suppressed: deduped.suppressed });
}));

/**
 * GET /api/calendar/events/by-app/:eventId
 * Strict event_id lookup. Path name kept for backward-compat with existing
 * frontends that hit `/by-app/:appEventId`; the parameter is treated as
 * `event_id`.
 */
calendarRouter.get('/events/by-app/:eventId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const enrichment = getCesEnrichment(eventId);
  let resolved;
  const live = enrichment ? await buildEnrichedPlannerPayloadLive(enrichment) : null;
  const payloadHint = live?.payload;
  const snapshot = live?.snapshot;
  try {
    resolved = await resolveCalendarEvent(eventId, payloadHint);
  } catch (e) {
    const err = e instanceof ApiError ? e : new ApiError('internal_error', (e as Error).message, 500);
    if (err.code === 'calendar_not_found') {
      throw new ApiError(
        'calendar_not_found',
        'Configured Google Calendar is unreachable. Verify GOOGLE_CALENDAR_ID and service-account sharing.',
        404,
        { eventId },
      );
    }
    throw err;
  }
  if (!resolved) throw new ApiError('event_not_found', 'No Google event maps to this event_id.', 404);

  if (enrichment && payloadHint) {
    await syncEvent(payloadHint, {
      trigger: 'api:GET /events/by-app/:eventId',
      actor: resolveActor(req),
      env: enrichment.env ?? 'SANDBOX',
    });
    const refreshed = await resolveCalendarEvent(eventId, payloadHint);
    if (refreshed) resolved = refreshed;
  }

  const hub = enrichment
    ? parseCesHubMeta(enrichment, {
        ...(snapshot ? {
          completionPercent: String(snapshot.completionPercent),
          evidenceCount: String(snapshot.evidenceCount),
          evidenceAttachedCount: String(snapshot.evidenceAttachedCount),
          ecignStatus: snapshot.ecignStatus,
          calendarAttachmentStatus: snapshot.calendarAttachmentStatus,
          eventStatus: snapshot.statusLabel,
          auditReadyPct: String(snapshot.auditReadyPercent),
          workflowId: enrichment.workflowId,
          policyRefs: (enrichment.policyRefs ?? []).map(p => p.id).join(','),
          driveFolderId: enrichment.driveFolderId,
          driveFolderUrl: enrichment.driveFolderUrl,
        } : {}),
      })
    : undefined;

  res.json({
    ...resolved.event,
    _hub: hub ?? null,
    _completion: snapshot ? {
      percent: snapshot.completionPercent,
      formula: 'tasks35+evidence25+forms15+ecign15+audit10',
      breakdown: snapshot.breakdown,
      evidenceCount: snapshot.evidenceCount,
      evidenceAttachedCount: snapshot.evidenceAttachedCount,
      ecignStatus: snapshot.ecignStatus,
      calendarAttachmentStatus: snapshot.calendarAttachmentStatus,
      statusLabel: snapshot.statusLabel,
    } : null,
    _resolve: {
      action: resolved.action,
      healed: resolved.healed,
      staleGoogleId: resolved.staleGoogleId ?? null,
      duplicateAvoided: resolved.duplicateAvoided,
    },
  });
}));

/** POST /api/calendar/events — create/upsert (deterministic via eventSync). */
calendarRouter.post('/events', asyncHandler(async (req, res) => {
  const payload = validatePayload(req.body);
  const result = await syncEvent(payload, {
    trigger: 'api:POST /events',
    actor: resolveActor(req),
  });
  res.status(result.action === 'created' ? 201 : 200).json(result);
}));

/**
 * PUT /api/calendar/events/:eventId — update by event_id (NOT by Google id).
 * Using event_id makes the route idempotent against any frontend confusion:
 * even if the client loses the google_event_id, the sync engine recovers.
 */
calendarRouter.put('/events/:eventId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const payload = validatePayload({ ...req.body, event_id: eventId });
  const result = await syncEvent(payload, {
    trigger: 'api:PUT /events/:eventId',
    actor: resolveActor(req),
  });
  res.json(result);
}));

/**
 * DELETE /api/calendar/events/:eventId
 *   ?cancelOnly=1        → soft-cancel (safe for PROD)
 *   ?adminOverride=1     → hard-delete PROD event (REQUIRED for PROD)
 *   X-Admin-Reason: ...  → free-form reason, written to audit
 */
calendarRouter.delete('/events/:eventId', asyncHandler(async (req, res) => {
  const eventId       = String(req.params.eventId);
  const cancelOnly    = req.query.cancelOnly === '1' || req.query.cancelOnly === 'true';
  const adminOverride = req.query.adminOverride === '1' || req.query.adminOverride === 'true';
  const reason = (req.header('x-admin-reason') ?? (req.query.reason as string | undefined)) ?? undefined;

  if (cancelOnly) {
    // Soft cancel runs through legacy path — it does NOT remove the row.
    const row = getRow(eventId);
    if (!row?.google_event_id) {
      throw new ApiError('event_not_found', 'No google_event_id known for that event_id.', 404);
    }
    const { deleteEvent } = await import('../googleCalendar.js');
    await deleteEvent(row.google_event_id, { cancelOnly: true, reason });
    res.status(204).end();
    return;
  }

  await deleteSyncedEvent({
    event_id: eventId,
    adminOverride,
    reason,
    actor: resolveActor(req),
    trigger: 'api:DELETE /events/:eventId',
  });
  res.status(204).end();
}));

/**
 * POST /api/calendar/sync — bulk deterministic upsert.
 * Body: { events: PlannerEventPayload[], env?: "SANDBOX"|"PROD" }
 *
 * Each payload is synced through the engine:
 *   - matched strictly by event_id
 *   - skipped when hash is unchanged
 *   - retried up to 3 times on transient failure
 *   - audited and Brad-notified on material changes
 */
calendarRouter.post('/sync', asyncHandler(async (req, res) => {
  const body = req.body as { events?: unknown; env?: 'SANDBOX' | 'PROD' };
  if (!Array.isArray(body.events)) {
    throw new ApiError('validation_error', 'Body must be { events: PlannerEventPayload[] }.', 400);
  }
  const payloads = body.events.map((raw, idx) => {
    try { return validatePayload(raw); }
    catch (e) {
      const err = e as ApiError;
      log.warn('sync.validate.failed', { idx, code: err.code, message: err.message });
      throw new ApiError('validation_error', `events[${idx}]: ${err.message}`, 400);
    }
  });
  const report = await syncEvents(payloads, {
    trigger: 'api:POST /sync',
    actor: resolveActor(req),
    env: body.env,
  });
  res.json(report);
}));

/**
 * POST /api/calendar/cleanup — one-time (or periodic) duplicate sweep.
 * Body: { dryRun?: boolean, adminOverride?: boolean }
 *
 * Default is dry-run. PROD duplicates are NOT deleted unless
 * `adminOverride` is true; they are reported under `needs_review`.
 */
calendarRouter.post('/cleanup', asyncHandler(async (req, res) => {
  const body = (req.body ?? {}) as { dryRun?: boolean; adminOverride?: boolean };
  const report = await cleanupDuplicates({
    dryRun: body.dryRun ?? true,
    adminOverride: !!body.adminOverride,
    trigger: 'api:POST /cleanup',
    actor: resolveActor(req),
  });
  res.json(report);
}));

/** GET /api/calendar/audit?limit=100 — tail of the append-only audit log. */
calendarRouter.get('/audit', asyncHandler(async (req, res) => {
  const limit = clampInt(req.query.limit as string | undefined, 1, 1000, 100);
  res.json({ records: tailAudit(limit) });
}));

/** GET /api/calendar/notifications?limit=50 — recent Brad notifications. */
calendarRouter.get('/notifications', asyncHandler(async (req, res) => {
  const limit = clampInt(req.query.limit as string | undefined, 1, 500, 50);
  res.json({ notifications: tailNotifications(limit) });
}));

/** GET /api/calendar/store?status=sync_failed — local store rows (dashboard). */
calendarRouter.get('/store', asyncHandler(async (req, res) => {
  const env = (req.query.env as string | undefined);
  const status = (req.query.status as string | undefined);
  const rows = listRows({
    env:    (env === 'SANDBOX' || env === 'PROD') ? env : undefined,
    status: (status === 'synced' || status === 'pending' || status === 'sync_failed' || status === 'deleted') ? status : undefined,
  });
  res.json({ rows, count: rows.length });
}));

/** GET /api/healthz — liveness + calendar reachability. */
calendarRouter.get('/healthz', asyncHandler(async (_req, res) => {
  const ping = await pingCalendar();
  res.status(ping.reachable ? 200 : 503).json({ ok: ping.reachable, calendar: ping });
}));

/**
 * GET /api/calendar/evidence/health — Drive evidence reachability + config.
 * Reports whether the evidence provider is enabled and the Shared Drive root
 * is reachable using the SAME service-account auth as Calendar.
 */
calendarRouter.get('/evidence/health', asyncHandler(async (_req, res) => {
  if (!env.calendarEvidenceEnabled) {
    res.json({ ok: false, enabled: false, provider: env.evidenceStorageProvider, drive: { reachable: false, error: 'disabled' } });
    return;
  }
  const drive = await pingDrive();
  res.status(drive.reachable ? 200 : 503).json({
    ok: drive.reachable,
    enabled: true,
    provider: env.evidenceStorageProvider,
    sharedDriveId: env.driveEvidenceSharedDriveId,
    rootFolderId: env.driveEvidenceRootFolderId,
    drive,
  });
}));

/**
 * POST /api/calendar/events/:eventId/evidence/upload
 *
 * Uploads an evidence file to the event's auto-created Drive folder and
 * attaches it to the matching Google Calendar event. Uses the existing JSON
 * body parser (base64 file content) — no new upload middleware/dependency.
 *
 * Body: {
 *   workflowId?, taskId, formId?, formInstanceId?,
 *   evidenceRequirementId?, supportTaskId?, category?,
 *   title, fileName, mimeType, contentBase64,
 *   domain?, eventDate?, uploadedBy?, attachToCalendar?
 * }
 */
calendarRouter.post('/events/:eventId/evidence/upload', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Calendar/Drive evidence is disabled.', 400);
  }
  const eventId = String(req.params.eventId);
  const b = (req.body ?? {}) as Record<string, unknown>;

  const taskId = strOrEmpty(b.taskId);
  if (!taskId) throw new ApiError('validation_error', '`taskId` is required.', 400);
  const title = strOrEmpty(b.title) || strOrEmpty(b.fileName) || 'evidence';
  const contentBase64 = strOrEmpty(b.contentBase64);
  if (!contentBase64) throw new ApiError('validation_error', '`contentBase64` (file content) is required.', 400);
  const evidenceRequirementId = strOrUndef(b.evidenceRequirementId);
  const supportTaskId = strOrUndef(b.supportTaskId);

  const result = await uploadEventEvidence({
    eventId,
    workflowId: strOrUndef(b.workflowId),
    taskId,
    formId: strOrUndef(b.formId),
    formInstanceId: strOrUndef(b.formInstanceId),
    evidenceRequirementId,
    supportTaskId,
    category: strOrUndef(b.category) as EvidenceCategory | undefined,
    title,
    fileName: strOrEmpty(b.fileName) || `${title}`,
    mimeType: strOrEmpty(b.mimeType) || 'application/octet-stream',
    contentBase64,
    domain: strOrUndef(b.domain),
    eventDate: strOrUndef(b.eventDate),
    uploadedBy: strOrUndef(b.uploadedBy) ?? resolveActor(req),
    attachToCalendar: b.attachToCalendar !== false,
  });

  const { ref } = result;

  // Persist the NON-PHI pointer to the CES metadata backend so the Evidence
  // Center / Artifact Viewer can list it WITHOUT any localStorage. File bytes
  // already live in Drive — only the pointer is recorded here.
  await persistEvidenceRef(result.evidenceId, ref);

  res.status(201).json({
    evidenceId: result.evidenceId,
    eventId: ref.eventId,
    workflowId: ref.workflowId,
    taskId: ref.taskId,
    formId: ref.formId,
    formInstanceId: ref.formInstanceId,
    evidenceRequirementId: ref.evidenceRequirementId,
    supportTaskId: ref.supportTaskId,
    calendarEventId: ref.calendarEventId,
    driveFolderId: ref.driveFolderId,
    driveFileId: ref.driveFileId,
    driveFileUrl: ref.driveFileUrl,
    calendarAttachmentStatus: ref.attachmentStatus,
    contentStatus: ref.contentStatus,
    storageProvider: ref.storageProvider,
  });
}));

/**
 * GET /api/calendar/events/:eventId/evidence
 * Lists the NON-PHI evidence pointers recorded in the CES metadata backend for
 * an event. Returns metadata + Drive links only — never file bytes.
 */
calendarRouter.get('/events/:eventId/evidence', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const items = await getCesMetadataStore().listEvidence(eventId);
  res.json({ eventId, items, count: items.length });
}));

/**
 * POST /api/calendar/intake/evidence/upload
 *
 * Brad Evidence Intake — upload a CANONICAL evidence file filed by its resolved
 * SOURCE-SYSTEM CREATED date (Section 9 + 3A). The filing month/quarter come
 * from filingPeriodKey (e.g. "2026-03"), NEVER from the occurrence/event/upload
 * date. Returns a REAL driveFileId; honest failure when Drive is unreachable.
 *
 * Body: { canonicalEvidenceId, filingPeriodKey, filingQuarterKey?, classification,
 *         title, fileName, mimeType, contentBase64, eventId?, uploadedBy? }
 */
calendarRouter.post('/intake/evidence/upload', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  const driveHealth = await pingDrive();
  if (!driveHealth.reachable) {
    throw new ApiError('validation_error', 'Intake upload blocked: Google Drive evidence persistence is not reachable.', 503);
  }
  const b = (req.body ?? {}) as Record<string, unknown>;
  const canonicalEvidenceId = strOrEmpty(b.canonicalEvidenceId);
  const filingPeriodKey = strOrEmpty(b.filingPeriodKey);
  const classification = strOrEmpty(b.classification) || 'unknown_needs_review';
  const contentBase64 = strOrEmpty(b.contentBase64);
  if (!canonicalEvidenceId) throw new ApiError('validation_error', '`canonicalEvidenceId` is required.', 400);
  if (!filingPeriodKey) throw new ApiError('validation_error', '`filingPeriodKey` (resolved created-date period) is required.', 400);
  if (!contentBase64) throw new ApiError('validation_error', '`contentBase64` is required.', 400);

  const result = await uploadIntakeEvidence({
    canonicalEvidenceId,
    filingPeriodKey,
    filingQuarterKey: strOrUndef(b.filingQuarterKey),
    classification,
    title: strOrEmpty(b.title) || canonicalEvidenceId,
    fileName: strOrEmpty(b.fileName) || `${canonicalEvidenceId}.txt`,
    mimeType: strOrEmpty(b.mimeType) || 'application/octet-stream',
    contentBase64,
    eventId: strOrUndef(b.eventId),
    uploadedBy: strOrUndef(b.uploadedBy) ?? resolveActor(req),
  });

  res.status(201).json({
    canonicalEvidenceId,
    driveFileId: result.driveFileId,
    driveFolderId: result.driveFolderId,
    driveFolderPath: result.driveFolderPath,
    driveWebViewLink: result.driveFileUrl,
    driveUploadStatus: 'uploaded',
    contentStatus: result.contentStatus,
    filingPeriodKey,
    storageProvider: env.evidenceStorageProvider,
  });
}));

/**
 * POST /api/calendar/intake/evidence/copy
 *
 * Create a physical Drive copy of canonical evidence into a packet folder
 * (Section 10). Preserves canonicalEvidenceId + copiedFromDriveFileId
 * provenance; never overwrites the canonical original.
 *
 * Body: { canonicalEvidenceId, copiedFromDriveFileId, packetId, eventId,
 *         filingPeriodKey, classification, name?, packetFolderName? }
 */
calendarRouter.post('/intake/evidence/copy', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  const b = (req.body ?? {}) as Record<string, unknown>;
  const canonicalEvidenceId = strOrEmpty(b.canonicalEvidenceId);
  const copiedFromDriveFileId = strOrEmpty(b.copiedFromDriveFileId);
  const packetId = strOrEmpty(b.packetId);
  if (!canonicalEvidenceId) throw new ApiError('validation_error', '`canonicalEvidenceId` is required.', 400);
  if (!copiedFromDriveFileId) throw new ApiError('validation_error', '`copiedFromDriveFileId` is required.', 400);
  if (!packetId) throw new ApiError('validation_error', '`packetId` is required.', 400);

  const result = await copyEvidenceToPacketFolder({
    canonicalEvidenceId,
    copiedFromDriveFileId,
    packetId,
    eventId: strOrEmpty(b.eventId),
    filingPeriodKey: strOrEmpty(b.filingPeriodKey),
    classification: strOrEmpty(b.classification) || 'unknown_needs_review',
    name: strOrUndef(b.name),
    packetFolderName: strOrUndef(b.packetFolderName),
  });

  res.status(201).json({
    canonicalEvidenceId,
    copiedFromDriveFileId,
    packetId,
    driveCopyFileId: result.driveCopyFileId,
    driveFolderId: result.driveFolderId,
    driveFolderPath: result.driveFolderPath,
    driveWebViewLink: result.driveFileUrl,
  });
}));

/**
 * POST /api/calendar/intake/packet
 * Save a generated packet to its event's Drive folder (upload-or-replace by a
 * stable per-event filename, so a new packet for the same event replaces the
 * prior one). Fails closed when Drive is unreachable — no simulated success.
 * Body: { eventId, packetId, title, html, eventDate?, domain? }
 */
calendarRouter.post('/intake/packet', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  const driveHealth = await pingDrive();
  if (!driveHealth.reachable) {
    throw new ApiError('validation_error', 'Packet save blocked: Google Drive is not reachable.', 503);
  }
  const b = (req.body ?? {}) as Record<string, unknown>;
  const eventId = strOrEmpty(b.eventId);
  const html = strOrEmpty(b.html);
  if (!eventId) throw new ApiError('validation_error', '`eventId` is required.', 400);
  if (!html) throw new ApiError('validation_error', '`html` is required.', 400);
  const result = await savePacketToEvent({
    eventId,
    packetId: strOrEmpty(b.packetId) || eventId,
    title: strOrEmpty(b.title) || eventId,
    html,
    eventDate: strOrUndef(b.eventDate),
    domain: strOrUndef(b.domain),
  });
  res.status(201).json(result);
}));

/**
 * GET /api/calendar/intake/brad-training
 *
 * Seeds the "Brad Training" library from the real Drive folder "2026 Brad
 * Training" — URL/metadata ONLY (no bytes are read or stored). Returns the
 * IMMEDIATE children (subfolders + files) of the requested folder so the UI
 * can navigate the tree folder-by-folder (the tree holds 2k+ files).
 * The in-app viewer renders each file directly from Drive via its preview URL;
 * an end user without Care Indeed shared-drive access cannot see the content.
 *
 * Query: folderId? (defaults to the configured 2026 Brad Training root)
 */
const BRAD_TRAINING_FOLDER_ID = process.env.DRIVE_BRAD_TRAINING_FOLDER_ID || '17_JEnmxL0HDxpj7SM0ZEmhOCDUc5xYfu';
calendarRouter.get('/intake/brad-training', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    res.json({ enabled: false, rootId: null, folderId: null, folderUrl: null, folders: [], files: [] });
    return;
  }
  const requested = strOrEmpty(req.query.folderId);
  const folderId = requested || BRAD_TRAINING_FOLDER_ID;
  const { folders, files } = await listFolderChildren(folderId);
  res.json({
    enabled: true,
    rootId: BRAD_TRAINING_FOLDER_ID,
    folderId,
    folderUrl: driveFolderUrl(folderId),
    folders,
    files,
  });
}));

/**
 * POST /api/calendar/intake/transcribe
 * Transcribe a call recording (or any audio) to text using the configured
 * provider (local ASR for MVP, Vertex in production). Body:
 * { filename, mimeType, dataBase64 }. Returns { text, provider }.
 * No bytes are stored — the audio is transcribed and discarded.
 */
calendarRouter.post('/intake/transcribe', asyncHandler(async (req, res) => {
  const b = (req.body ?? {}) as Record<string, unknown>;
  const dataBase64 = strOrEmpty(b.dataBase64);
  if (!dataBase64) throw new ApiError('validation_error', '`dataBase64` is required.', 400);
  const filename = strOrEmpty(b.filename) || 'recording.wav';
  const mimeType = strOrEmpty(b.mimeType) || 'audio/wav';
  const buffer = Buffer.from(dataBase64, 'base64');
  if (!buffer.length) throw new ApiError('validation_error', 'Empty audio payload.', 400);
  const result = await transcribeAudio(buffer, filename, mimeType);
  res.json(result);
}));

/**
 * GET /api/calendar/intake/packet-library?kind=mock|admission&folderId=
 * Browse a packet-library Drive folder live (URL/metadata only): Mock Event
 * Packets (01_CES/Evidence/Mock/Packets) or Patient Admission Packets
 * (01_CES/Evidence/Admission/Packets). Returns immediate children.
 */
calendarRouter.get('/intake/packet-library', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    res.json({ enabled: false, rootId: null, folderId: null, folderUrl: null, folders: [], files: [] });
    return;
  }
  const kind = strOrEmpty(req.query.kind) === 'admission' ? 'admission' : 'mock';
  const rootId = await resolvePacketLibraryRoot(kind);
  const folderId = strOrEmpty(req.query.folderId) || rootId;
  const { folders, files } = await listFolderChildren(folderId);
  res.json({ enabled: true, rootId, folderId, folderUrl: driveFolderUrl(folderId), folders, files });
}));

/**
 * POST /api/calendar/intake/admission-packet
 * Save a Patient Admission packet to the Admission Packets Drive folder.
 * Body: { packetId, title, html, patientRef? }. Fails closed if Drive is down.
 */
calendarRouter.post('/intake/admission-packet', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Drive evidence is disabled.', 400);
  }
  const driveHealth = await pingDrive();
  if (!driveHealth.reachable) {
    throw new ApiError('validation_error', 'Packet save blocked: Google Drive is not reachable.', 503);
  }
  const b = (req.body ?? {}) as Record<string, unknown>;
  const packetId = strOrEmpty(b.packetId);
  const html = strOrEmpty(b.html);
  if (!packetId) throw new ApiError('validation_error', '`packetId` is required.', 400);
  if (!html) throw new ApiError('validation_error', '`html` is required.', 400);
  const result = await saveAdmissionPacket({
    packetId,
    title: strOrEmpty(b.title) || packetId,
    html,
    patientRef: strOrUndef(b.patientRef),
  });
  res.status(201).json(result);
}));

/**
 * GET /api/calendar/events/:eventId/drive-folder
 * Resolves (auto-creating if needed) the event's base Drive folder and returns
 * its id + link. Query: domain?, eventDate?
 */
calendarRouter.get('/events/:eventId/drive-folder', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Calendar/Drive evidence is disabled.', 400);
  }
  const eventId = String(req.params.eventId);
  const domain = strOrUndef(req.query.domain);
  const eventDate = strOrUndef(req.query.eventDate);
  validateISODate(eventDate, 'eventDate');
  const segments = buildEvidenceFolderSegments({ eventId, domain, eventDate, category: 'overview' })
    .slice(0, 4); // {year}/{quarter}/{domain}/{eventId} — base event folder
  const folderId = await ensureFolderPath(segments);
  res.json({ eventId, driveFolderId: folderId, driveFolderUrl: evidenceFolderUrl(folderId) });
}));

/**
 * POST /api/calendar/events/:eventId/signed-artifact/publish
 *
 * Publishes a FULLY COMPLETED, signed artifact (signed form PDF, eCIgn
 * certificate PDF, or final evidence package) to Google Drive and indexes it on
 * the Calendar event. Per the form lifecycle rule, the caller must assert the
 * artifact is complete — drafts/in-progress instances are NOT published here.
 *
 * Body: { workflowId?, taskId, formId?, formInstanceId?, artifactType,
 *         title, fileName, mimeType, contentBase64, domain?, eventDate?,
 *         completed: true, uploadedBy? }
 */
calendarRouter.post('/events/:eventId/signed-artifact/publish', asyncHandler(async (req, res) => {
  if (!env.calendarEvidenceEnabled) {
    throw new ApiError('validation_error', 'Google Calendar/Drive evidence is disabled.', 400);
  }
  // Dynamic capability check: backend must report Drive healthy before accepting a finalized signed package.
  const driveHealth = await pingDrive();
  if (!driveHealth.reachable) {
    throw new ApiError('validation_error', 'Evidence finalization blocked: Google Drive evidence persistence is not configured.', 400);
  }
  const eventId = String(req.params.eventId);
  const b = (req.body ?? {}) as Record<string, unknown>;

  if (b.completed !== true) {
    throw new ApiError('validation_error', 'signed-artifact/publish requires `completed: true`. Drafts/in-progress instances stay in CES metadata only.', 400);
  }
  const taskId = strOrEmpty(b.taskId);
  if (!taskId) throw new ApiError('validation_error', '`taskId` is required.', 400);
  const contentBase64 = strOrEmpty(b.contentBase64);
  if (!contentBase64) throw new ApiError('validation_error', '`contentBase64` (artifact content) is required.', 400);
  const formInstanceId = strOrUndef(b.formInstanceId);

  const artifactType = strOrEmpty(b.artifactType);
  const category: EvidenceCategory =
    artifactType === 'ecign_certificate' ? 'ecign_certificate'
    : artifactType === 'final_package' ? 'final_package'
    : 'signed_artifact';
  if (category === 'final_package') {
    if (!formInstanceId) {
      throw new ApiError('validation_error', 'final package publication requires `formInstanceId`.', 400);
    }
    const instance = await ecignStore.getInstance(formInstanceId);
    if (!instance) {
      throw new ApiError('validation_error', 'final package publication requires an existing eCIgn form instance.', 400);
    }
    const signatures = await ecignStore.listSignatures(formInstanceId);
    const signedFields = new Set(signatures.map(signature => signature.field_id));
    const missingFinalSignerFields = instance.required_signers
      .filter(signer => signer.required !== false && signer.required_for_final_package !== false)
      .map(signer => signer.field_id)
      .filter(fieldId => !signedFields.has(fieldId));
    if (missingFinalSignerFields.length > 0 || instance.state !== 'signed_locked') {
      throw new ApiError('validation_error', 'final package publication requires a locked eCIgn instance with all required signer slots complete.', 400);
    }
  } else if (b.signerSlotsComplete !== true) {
    throw new ApiError('validation_error', 'signed-artifact/publish requires all required signer slots to be complete.', 400);
  }

  const title = strOrEmpty(b.title) || strOrEmpty(b.fileName) || 'signed-artifact';
  const result = await uploadEventEvidence({
    eventId,
    workflowId: strOrUndef(b.workflowId),
    taskId,
    formId: strOrUndef(b.formId),
    formInstanceId,
    category,
    title,
    fileName: strOrEmpty(b.fileName) || `${title}`,
    mimeType: strOrEmpty(b.mimeType) || 'application/pdf',
    contentBase64,
    domain: strOrUndef(b.domain),
    eventDate: strOrUndef(b.eventDate),
    uploadedBy: strOrUndef(b.uploadedBy) ?? resolveActor(req),
    attachToCalendar: b.attachToCalendar !== false,
  });

  const now = new Date().toISOString();
  const extraMetadata = {
    artifactId: strOrUndef(b.artifactId),
    pdfVersion: numOrUndef(b.pdfVersion),
    status: 'final_locked',
    hash: strOrUndef(b.sha256),
    signerSlotOrder: numOrUndef(b.signerSlotOrder),
    signerUserId: strOrUndef(b.signerUserId),
    signerRole: strOrUndef(b.signerRole),
    signerTier: numOrUndef(b.signerTier),
    signerDomain: strOrUndef(b.signerDomain),
    signedAt: now,
    priorDocumentHash: strOrUndef(b.priorDocumentHash),
    finalDocumentHash: strOrUndef(b.finalDocumentHash),
    auditEventIds: Array.isArray(b.auditEventIds) ? b.auditEventIds.filter((value): value is string => typeof value === 'string') : undefined,
    createdBy: strOrUndef(b.uploadedBy) ?? resolveActor(req),
    createdAt: now,
    updatedAt: now,
  };

  await persistEvidenceRef(result.evidenceId, result.ref, extraMetadata);

  res.status(201).json({
    evidenceId: result.evidenceId,
    artifactType: category,
    eventId: result.ref.eventId,
    driveFileId: result.ref.driveFileId,
    driveFileUrl: result.ref.driveFileUrl,
    driveFolderId: result.ref.driveFolderId,
    calendarEventId: result.ref.calendarEventId,
    calendarAttachmentStatus: result.ref.attachmentStatus,
    storageProvider: result.ref.storageProvider,
    ...extraMetadata,
  });
}));

/* ── helpers ─────────────────────────────────────────── */

/**
 * Map a Drive/Calendar evidence ref to the canonical CES pointer shape and
 * persist it to the CES metadata backend. NON-PHI metadata only — never bytes.
 */
async function persistEvidenceRef(
  evidenceId: string,
  ref: GoogleCalendarDriveEvidenceRef,
  extra: Partial<CesEvidenceRef> = {},
): Promise<void> {
  const cesRef: CesEvidenceRef = {
    storageProvider: 'google_drive_calendar',
    evidenceId,
    eventId: ref.eventId,
    workflowId: ref.workflowId,
    taskId: ref.taskId,
    formId: ref.formId,
    formInstanceId: ref.formInstanceId,
    evidenceRequirementId: ref.evidenceRequirementId,
    supportTaskId: ref.supportTaskId,
    calendarEventId: ref.calendarEventId,
    driveFileId: ref.driveFileId,
    driveFileUrl: ref.driveFileUrl,
    driveFolderId: ref.driveFolderId,
    mimeType: ref.mimeType,
    fileName: ref.title,
    uploadedAt: ref.uploadedAt,
    uploadedBy: ref.uploadedBy,
    attachmentStatus: ref.attachmentStatus,
    contentStatus: ref.contentStatus,
    ...extra,
  };
  try {
    await getCesMetadataStore().upsertEvidence(cesRef);
  } catch (e) {
    // Drive upload already succeeded; surface a non-fatal warning rather than
    // losing the file. The pointer can be reconciled later.
    log.warn('ces_metadata.evidence.persist_failed', { evidenceId, eventId: ref.eventId, error: (e as Error).message });
  }
}

function validateISODate(v: string | undefined, name: string) {
  if (v == null) return;
  if (!/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(v)) {
    throw new ApiError('validation_error', `Invalid ${name} date. Expected YYYY-MM-DD.`, 400);
  }
}

function validatePayload(raw: unknown): PlannerEventPayload {
  if (!raw || typeof raw !== 'object') {
    throw new ApiError('validation_error', 'Request body must be an object.', 400);
  }
  const p = raw as Partial<PlannerEventPayload>;
  const id = p.event_id || p.appEventId;
  if (!id)           throw new ApiError('validation_error', '`event_id` is required.', 400);
  if (!p.title)      throw new ApiError('validation_error', '`title` is required.', 400);
  if (!p.date || !/^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    throw new ApiError('validation_error', '`date` is required and must be YYYY-MM-DD.', 400);
  }
  if (p.time && !/^\d{2}:\d{2}$/.test(p.time)) {
    throw new ApiError('validation_error', '`time` must be HH:mm (24h).', 400);
  }
  if (p.timeEnd && !/^\d{2}:\d{2}$/.test(p.timeEnd)) {
    throw new ApiError('validation_error', '`timeEnd` must be HH:mm (24h).', 400);
  }
  if (p.endDate && !/^\d{4}-\d{2}-\d{2}$/.test(p.endDate)) {
    throw new ApiError('validation_error', '`endDate` must be YYYY-MM-DD.', 400);
  }
  if (p.allDay && (p.time || p.timeEnd)) {
    throw new ApiError('validation_error', 'All-day events cannot specify time/timeEnd.', 400);
  }
  if (p.env && p.env !== 'SANDBOX' && p.env !== 'PROD') {
    throw new ApiError('validation_error', '`env` must be SANDBOX or PROD.', 400);
  }
  if (p.version != null && (!Number.isInteger(p.version) || p.version < 0)) {
    throw new ApiError('validation_error', '`version` must be a non-negative integer.', 400);
  }
  // Canonicalize: always populate event_id from whichever field was sent.
  return { ...(p as PlannerEventPayload), event_id: id, appEventId: id };
}

function resolveActor(req: Request): string {
  return (req.header('x-actor')
       ?? req.header('x-user-id')
       ?? 'service-account');
}

function strOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function strOrUndef(v: unknown): string | undefined {
  const s = strOrEmpty(v);
  return s ? s : undefined;
}

function numOrUndef(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

function clampInt(raw: string | undefined, min: number, max: number, dflt: number): number {
  if (!raw) return dflt;
  const n = Number(raw);
  if (!Number.isFinite(n)) return dflt;
  return Math.min(max, Math.max(min, Math.floor(n)));
}

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
