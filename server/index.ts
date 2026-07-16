import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { env, assertDriveEvidenceLock } from './env.js';
import { log } from './logger.js';
import { ApiError } from './errors.js';
import { calendarRouter } from './routes/calendar.js';
import { cesRouter } from './routes/ces.js';
import { hubstaffRouter } from './routes/hubstaff.js';
import { ecignRouter } from './routes/ecign.js';
import { auditRouter } from './routes/audit.js';
import { complianceRouter } from './routes/compliance.js';
import { IaService } from './ia/service.js';
import { createIaRouter } from './ia/routes.js';
import { identityMiddleware } from './identity/middleware.js';
import { auditV2Router } from './audit/routes.js';
import { ceuRouter } from './ceu/routes.js';
import { startAnomalyScheduler } from './audit/anomaly.js';
import { authRouter } from './routes/auth.js';
import { userAccessRouter } from './routes/userAccess.js';
import { requireApiAuth, requireRole } from './auth/apiAuthBoundary.js';
import { ADMIN_ROLE_GROUPS, AUDIT_ADMIN_ROLES } from './auth/routeAccessMatrix.js';
import { pmRouter } from './routes/pm.js';
import { createBradRouter } from './routes/brad.js';
import { createNolanRouter } from './routes/nolan.js';
import { packetTemplatesRouter, packetsRouter } from './packets/routes/index.js';

/* ═══════════════════════════════════════════════════════════════
   Care Indeed — Backend API (Express)

   Mounts two independent subsystems:
     /api/calendar/*     → Regulatory Planner Google Calendar bridge
     /api/ia/*           → Compliance Intelligence (iAdministrator)
                           local RAG over the internal corpus
   ═══════════════════════════════════════════════════════════════ */

const app = express();

app.disable('x-powered-by');
app.use(cors({ origin: env.allowedOrigin, credentials: false }));

// Signed-artifact publish carries a FULLY self-contained signed package (signed
// form HTML + embedded eCIgn certificate + signature images + audit metadata)
// base64-encoded into a JSON body, which routinely exceeds the 4mb default. Mount
// a larger JSON parser for ONLY this endpoint, BEFORE the global parser below:
// body-parser sets `req._body` once it parses, so the global 4mb parser then
// short-circuits and does not re-reject this route. The global limit (and every
// other endpoint) is unchanged.
app.use(
  '/api/calendar/events/:eventId/signed-artifact/publish',
  express.json({ limit: '32mb' }),
);

// Brad document uploads carry a base64-encoded file in a JSON body — allow a
// larger limit on ONLY this route (mounted before the global 4mb parser).
app.use('/api/brad/upload', express.json({ limit: '32mb' }));

// Call-recording transcription carries a base64 audio file — allow a larger
// limit on ONLY this route (mounted before the global 4mb parser).
app.use('/api/calendar/intake/transcribe', express.json({ limit: '64mb' }));

// Generated packet HTML is a rich, multi-page, self-contained document with
// embedded fonts + a per-page logo data URI, which routinely exceeds the 4mb
// default. Allow a larger limit on ONLY this route (before the global parser).
app.use('/api/calendar/intake/packet', express.json({ limit: '32mb' }));

// Packet Studio source dumps can be large. This route must parse the uploaded
// source before the global 4mb parser so Brad can read the full document.
app.use('/api/calendar/intake/extract-source', express.json({ limit: '32mb' }));

app.use(express.json({ limit: '4mb' })); // signature PNG payloads

// Identity / session must run BEFORE the PEP, the bearer gate, and any
// route handler so every request has `req.session` and `req.actor`.
app.use('/api', identityMiddleware);

// Optional shared-secret gate. In local dev we leave it disabled.
app.use('/api', (req, _res, next) => {
  if (!env.apiSharedSecret) return next();
  const auth = req.header('authorization') ?? '';
  if (auth === `Bearer ${env.apiSharedSecret}`) return next();
  return next(new ApiError('auth_error', 'Missing or invalid Authorization header.', 401));
});

// Request log middleware (best-effort; filtered by level).
app.use('/api', (req, _res, next) => {
  log.debug('http.in', { method: req.method, path: req.path });
  next();
});

// ── Authentication surface (mounted BEFORE the boundary) ──────────────────
// The login/session lifecycle is public-capable and self-verifies its own
// protected endpoints (/me, /logout, /refresh, /admin/* via
// assertAdminAccessToken); it therefore lives OUTSIDE the boundary. The COG-2
// admin user-access router resolves the verified actor and role-gates each
// endpoint internally; it is additionally role-gated at the mount below.
app.use('/api/auth', authRouter);
app.use('/api/admin/user-access', requireRole(ADMIN_ROLE_GROUPS), userAccessRouter);

// ── COG-2 authentication boundary ─────────────────────────────────────────
// One consistent authentication path for every business router: a verified,
// active canonical actor from a Cognito bearer, or a denial. Narrow public
// exceptions (health checks) pass through via the route access matrix.
app.use('/api', requireApiAuth());

// ── Protected business routers (verified actor required) ──────────────────
app.use('/api/calendar', calendarRouter);
app.use('/api/ces', cesRouter);
app.use('/api/hubstaff', hubstaffRouter);
app.use('/api/ecign', ecignRouter);
app.use('/api/audit', requireRole(AUDIT_ADMIN_ROLES), auditRouter);
app.use('/api/audit/v2', requireRole(AUDIT_ADMIN_ROLES), auditV2Router);
app.use('/api/ceu', ceuRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/pm', pmRouter);
app.use('/api/packet-templates', packetTemplatesRouter);
app.use('/api/packets', packetsRouter);

// Compliance Intelligence (iAdministrator) — local RAG engine.
const iaService = new IaService({
  repoRoot: env.iaCorpusRoot,
  indexRoot: env.iaIndexRoot,
  requireEmbeddings: env.iaRequireEmbeddings,
  ollama: {
    baseUrl: env.ollamaBaseUrl,
    chatModel: env.ollamaChatModel,
    embedModel: env.ollamaEmbedModel,
    timeoutMs: env.ollamaTimeoutMs,
  },
});
const iaLoaded = iaService.loadIfExists();
if (!iaLoaded) {
  log.warn('ia.index.not_found', {
    indexRoot: env.iaIndexRoot,
    hint: 'run `npm run ia:index` to build the local compliance index',
  });
}
app.use('/api/ia', createIaRouter(iaService));

// Brad assistant + Super Admin guarded-action layer (append-only generated objects).
app.use('/api/brad', createBradRouter());

// Nolan tutor (Nurse Onboarding & Learning Assistant) — Training-module chatbot.
// Local dev must match the Cloud Run entry (server/cloudrun.ts) so the tutor
// endpoint is available in development too. No PHI, no internet on this surface.
app.use('/api/nolan', createNolanRouter());

// 404 for unknown routes under /api.
app.use('/api', (req, _res, next) => {
  next(new ApiError('event_not_found', `Unknown route: ${req.method} ${req.path}`, 404));
});

// ── Static SPA (combined image) ───────────────────────────────────────────
// When a built ./dist is present (Cloud Run combined image), serve the SPA and
// fall back to index.html for client-side routes. Non-/api requests only — the
// /api 404 above already handles unknown API paths. No-op in dev (Vite serves).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');
if (fs.existsSync(path.join(distDir, 'index.html'))) {
  app.use(express.static(distDir, { index: false, maxAge: '1h' }));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
  log.info('static.spa.enabled', { distDir });
}

// Centralized error handler.
const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  void _next;
  const apiErr = err instanceof ApiError
    ? err
    : new ApiError('internal_error', (err as Error)?.message ?? 'Internal error', 500);
  log.warn('http.error', {
    method: req.method,
    path: req.path,
    code: apiErr.code,
    status: apiErr.status,
    message: apiErr.message,
  });
  res.status(apiErr.status).json({
    error: { code: apiErr.code, message: apiErr.message, details: apiErr.details },
  });
};
app.use(errorHandler);

// Verify the LOCKED Google Drive evidence identity (service account, project,
// shared drive, provider) BEFORE binding the port. Fail-closed on drift when the
// key is present + evidence is enabled, so a wrong key/drive can never run.
const driveLock = assertDriveEvidenceLock({ throwOnMismatch: true });
log[driveLock.ok ? 'info' : 'warn']('drive.evidence.lock', { ok: driveLock.ok, enforced: driveLock.enforced, problems: driveLock.problems, ...driveLock.info });

const server = app.listen(env.port, () => {
  // Start background anomaly scanner (no-op until events accumulate).
  startAnomalyScheduler(60_000);
  log.info('server.started', {
    port: env.port,
    calendarId: env.calendarId,
    timezone: env.timezone,
    allowedOrigin: env.allowedOrigin,
  });
});

// Graceful shutdown.
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    log.info('server.shutdown', { signal: sig });
    server.close(() => process.exit(0));
  });
}
