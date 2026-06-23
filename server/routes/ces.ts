import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { env } from '../env.js';
import { getCesMetadataStore, type CesSnapshot } from '../cesMetadataStore.js';
import {
  getCesExecutionState,
  updateCesApprovalStatus,
  updateCesAuditCloseoutStatus,
  updateCesFormStatus,
  updateCesTaskStatus,
  type CesApprovalStatus,
  type CesAuditCloseoutStatus,
  type CesExecutionStatus,
  type CesExecutionUpdateMetadata,
} from '../cesExecutionStateStore.js';
import { buildCesExecutionDefinition, loadCesExecutionSnapshot } from '../cesCalendarCompletion.js';
import { getCesEnrichment } from '../cesCalendarEventBuilder.js';

/* ═══════════════════════════════════════════════════════════════
   CES metadata API — the backend source of truth for NON-PHI CES
   operational metadata (event execution / task / form / signature /
   evidence-pointer / completion / certification state).

   The browser persists NOTHING for CES; it loads/saves through here.
   File bodies never pass through this router — they go to Google Drive.
   ═══════════════════════════════════════════════════════════════ */

export const cesRouter: Router = Router();

const SCHEMA_VERSION = 1;

/** GET /api/ces/health — provider + reachability. */
cesRouter.get('/health', asyncHandler(async (_req, res) => {
  const store = getCesMetadataStore();
  const health = await store.health();
  res.status(health.ok ? 200 : 503).json({
    ...health,
    cesStorageProvider: env.evidenceStorageProvider,
    metadataProvider: env.cesMetadataProvider,
  });
}));

/** GET /api/ces/snapshot/:workspaceId — load CES metadata snapshot. */
cesRouter.get('/snapshot/:workspaceId', asyncHandler(async (req, res) => {
  const workspaceId = String(req.params.workspaceId);
  const store = getCesMetadataStore();
  const snapshot = await store.getSnapshot(workspaceId);
  if (!snapshot) { res.status(200).json({ status: 'empty', workspaceId }); return; }
  res.json({ status: 'ok', snapshot });
}));

/** PUT /api/ces/snapshot/:workspaceId — save CES metadata snapshot (no bytes). */
cesRouter.put('/snapshot/:workspaceId', asyncHandler(async (req, res) => {
  const workspaceId = String(req.params.workspaceId);
  const body = (req.body ?? {}) as Partial<CesSnapshot>;
  if (!body || typeof body !== 'object') {
    throw new ApiError('validation_error', 'Snapshot body must be an object.', 400);
  }
  const snapshot: CesSnapshot = {
    ...(body as CesSnapshot),
    schemaVersion: SCHEMA_VERSION,
    workspaceId,
    updatedAt: new Date().toISOString(),
  };
  const store = getCesMetadataStore();
  // putSnapshot enforces the no-file-bytes guard and throws on violation.
  const saved = await store.putSnapshot(snapshot);
  res.json({ status: 'ok', snapshot: saved });
}));

/** GET /api/ces/events/:eventId/evidence — evidence pointer metadata. */
cesRouter.get('/events/:eventId/evidence', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const store = getCesMetadataStore();
  const items = await store.listEvidence(eventId);
  res.json({ eventId, items, count: items.length });
}));

/** GET /api/ces/events/:eventId/execution-state — backend task/form/audit state. */
cesRouter.get('/events/:eventId/execution-state', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const state = await getCesExecutionState(eventId);
  res.json({ status: state ? 'ok' : 'empty', eventId, state });
}));

/** GET /api/ces/events/:eventId/completion — live completion snapshot. */
cesRouter.get('/events/:eventId/completion', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const enrichment = requireEnrichment(eventId);
  const snapshot = await loadCesExecutionSnapshot(enrichment);
  res.json({ status: 'ok', eventId, snapshot });
}));

/** PATCH /api/ces/events/:eventId/execution-state/tasks/:taskId */
cesRouter.patch('/events/:eventId/execution-state/tasks/:taskId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const taskId = String(req.params.taskId);
  const body = req.body as Record<string, unknown>;
  const enrichment = requireEnrichment(eventId);
  const state = await updateCesTaskStatus(
    eventId,
    taskId,
    parseTaskStatus(body.status),
    parseMetadata(body),
    buildCesExecutionDefinition(enrichment),
  );
  res.json({ status: 'ok', eventId, state });
}));

/** PATCH /api/ces/events/:eventId/execution-state/forms/:formId */
cesRouter.patch('/events/:eventId/execution-state/forms/:formId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const formId = String(req.params.formId);
  const body = req.body as Record<string, unknown>;
  const enrichment = requireEnrichment(eventId);
  const state = await updateCesFormStatus(
    eventId,
    formId,
    parseTaskStatus(body.status),
    parseMetadata(body),
    buildCesExecutionDefinition(enrichment),
  );
  res.json({ status: 'ok', eventId, state });
}));

/** PATCH /api/ces/events/:eventId/execution-state/approvals/:approvalId */
cesRouter.patch('/events/:eventId/execution-state/approvals/:approvalId', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const approvalId = String(req.params.approvalId);
  const body = req.body as Record<string, unknown>;
  const enrichment = requireEnrichment(eventId);
  const state = await updateCesApprovalStatus(
    eventId,
    approvalId,
    parseApprovalStatus(body.status),
    {
      ...parseMetadata(body),
      targetKind: parseTargetKind(body.targetKind),
      targetLabel: strOrEmpty(body.targetLabel) || approvalId,
      approverRole: strOrEmpty(body.approverRole) || 'QAPI Committee Chair',
    },
    buildCesExecutionDefinition(enrichment),
  );
  res.json({ status: 'ok', eventId, state });
}));

/** PATCH /api/ces/events/:eventId/execution-state/audit-closeout */
cesRouter.patch('/events/:eventId/execution-state/audit-closeout', asyncHandler(async (req, res) => {
  const eventId = String(req.params.eventId);
  const body = req.body as Record<string, unknown>;
  const enrichment = requireEnrichment(eventId);
  const state = await updateCesAuditCloseoutStatus(
    eventId,
    parseAuditStatus(body.status),
    {
      ...parseMetadata(body),
      certifiedBy: strOrUndef(body.certifiedBy),
      certifiedRole: strOrUndef(body.certifiedRole),
    },
    buildCesExecutionDefinition(enrichment),
  );
  res.json({ status: 'ok', eventId, state });
}));

/* ── helpers ─────────────────────────────────────────── */

function requireEnrichment(eventId: string) {
  const enrichment = getCesEnrichment(eventId);
  if (!enrichment) throw new ApiError('validation_error', `No CES enrichment registry entry for ${eventId}.`, 404);
  return enrichment;
}

function parseMetadata(body: Record<string, unknown>): CesExecutionUpdateMetadata {
  return {
    updatedBy: strOrUndef(body.updatedBy),
    source: strOrUndef(body.source),
    note: strOrUndef(body.note),
    dependencyVerified: body.dependencyVerified === true,
    supportingEvidence: Array.isArray(body.supportingEvidence)
      ? body.supportingEvidence
          .filter((value): value is Record<string, unknown> => !!value && typeof value === 'object')
          .map(value => ({
            evidenceId: strOrUndef(value.evidenceId),
            artifactId: strOrUndef(value.artifactId),
            driveFileId: strOrUndef(value.driveFileId),
            fileName: strOrUndef(value.fileName),
            taskId: strOrUndef(value.taskId),
            formId: strOrUndef(value.formId),
            formInstanceId: strOrUndef(value.formInstanceId),
          }))
      : undefined,
  };
}

function parseTaskStatus(value: unknown): CesExecutionStatus {
  const status = strOrEmpty(value) as CesExecutionStatus;
  if (!['not_started', 'in_progress', 'complete', 'blocked'].includes(status)) {
    throw new ApiError('validation_error', 'Invalid execution status.', 400);
  }
  return status;
}

function parseApprovalStatus(value: unknown): CesApprovalStatus {
  const status = strOrEmpty(value) as CesApprovalStatus;
  if (!['not_requested', 'pending', 'approved', 'rejected', 'blocked'].includes(status)) {
    throw new ApiError('validation_error', 'Invalid approval status.', 400);
  }
  return status;
}

function parseAuditStatus(value: unknown): CesAuditCloseoutStatus {
  const status = strOrEmpty(value) as CesAuditCloseoutStatus;
  if (!['not_started', 'ready', 'certified', 'blocked'].includes(status)) {
    throw new ApiError('validation_error', 'Invalid audit closeout status.', 400);
  }
  return status;
}

function parseTargetKind(value: unknown): 'event' | 'minutes' | 'report' | 'form' {
  const targetKind = strOrEmpty(value);
  if (targetKind === 'event' || targetKind === 'minutes' || targetKind === 'report' || targetKind === 'form') {
    return targetKind;
  }
  throw new ApiError('validation_error', 'Invalid approval target kind.', 400);
}

function strOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function strOrUndef(v: unknown): string | undefined {
  const s = strOrEmpty(v);
  return s ? s : undefined;
}

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };
}
