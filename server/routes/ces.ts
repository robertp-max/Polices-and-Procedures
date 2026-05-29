import { Router, type Request, type Response, type NextFunction } from 'express';
import { ApiError } from '../errors.js';
import { env } from '../env.js';
import { getCesMetadataStore, type CesSnapshot } from '../cesMetadataStore.js';

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

/* ── helpers ─────────────────────────────────────────── */

function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => { fn(req, res, next).catch(next); };
}
