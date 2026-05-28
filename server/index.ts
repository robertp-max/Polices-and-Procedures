import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';
import { env } from './env.js';
import { log } from './logger.js';
import { ApiError } from './errors.js';
import { calendarRouter } from './routes/calendar.js';
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
import { pmRouter } from './routes/pm.js';

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

app.use('/api/calendar', calendarRouter);
app.use('/api/hubstaff', hubstaffRouter);
app.use('/api/ecign', ecignRouter);
app.use('/api/audit', auditRouter);
app.use('/api/audit/v2', auditV2Router);
app.use('/api/ceu', ceuRouter);
app.use('/api/compliance', complianceRouter);
app.use('/api/auth', authRouter);
app.use('/api/pm', pmRouter);

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

// 404 for unknown routes under /api.
app.use('/api', (req, _res, next) => {
  next(new ApiError('event_not_found', `Unknown route: ${req.method} ${req.path}`, 404));
});

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
