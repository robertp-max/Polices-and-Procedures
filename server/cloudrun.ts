import express, { type Request, type Response, type NextFunction, type ErrorRequestHandler } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { authRouter } from './routes/auth.js';
import { identityMiddleware } from './identity/middleware.js';
import { createBradRouter } from './routes/brad.js';
import { createNolanRouter } from './routes/nolan.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Care Indeed HH V2 — combined Cloud Run entry (same-origin).

   Serves the built SPA (../dist) AND the canonical auth API (AWS Cognito +
   DynamoDB) under /api/auth on a single origin, so the browser registration /
   login / session / logout flow runs without CORS.

   This entry mounts ONLY the auth router on purpose — the registration release
   gate does not need the calendar / eCIgn / RAG / audit subsystems, and leaving
   them out keeps startup fast and free of optional-integration failures.

   AWS credentials come from the standard provider chain (AWS_ACCESS_KEY_ID /
   AWS_SECRET_ACCESS_KEY env, injected from Secret Manager by Cloud Run). No
   secrets are read from disk or logged here.
   ═══════════════════════════════════════════════════════════════════════════ */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const INDEX = path.join(DIST, 'index.html');
const PORT = Number(process.env.PORT) || 8080;
const HOST = '0.0.0.0';

const app = express();
app.disable('x-powered-by');

// Same-origin in deployment; reflecting the origin is harmless and avoids any
// dev-origin friction. Credentials are not used (bearer tokens in JS, not cookies).
const allowedOrigin = process.env.ALLOWED_ORIGIN;
app.use(cors(allowedOrigin ? { origin: allowedOrigin, credentials: false } : { origin: true, credentials: false }));

// Health endpoint (note: the literal /healthz is shadowed by Google Front End).
app.get('/_health', (_req: Request, res: Response) => { res.type('text/plain').send('ok'); });

// Brad document uploads carry a base64-encoded file in a JSON body — allow a
// larger limit on that route only (must be registered before the 2mb parser).
app.use('/api/brad/upload', express.json({ limit: '32mb' }));

// Parse JSON for the API only (keeps static asset serving lean).
app.use('/api', express.json({ limit: '2mb' }));

// Identity / session context (header-based) — must run before any router that
// reads req.session / req.actor (Brad's guarded endpoints fail closed without it).
app.use('/api', identityMiddleware);

// Canonical auth API — AWS Cognito + DynamoDB.
app.use('/api/auth', authRouter);

// Brad assistant + Super Admin guarded-action layer. Wrapped so an optional-
// integration failure can never take down auth/SPA serving.
try {
  app.use('/api/brad', createBradRouter());
} catch (err) {
  console.error(JSON.stringify({ event: 'cloudrun.brad_mount_failed', message: (err as Error)?.message }));
}

// Nolan tutor — Nurse Onboarding & Learning Assistant (Training module,
// deterministic; no model call, no internet). Same isolation wrapper.
try {
  app.use('/api/nolan', createNolanRouter());
} catch (err) {
  console.error(JSON.stringify({ event: 'cloudrun.nolan_mount_failed', message: (err as Error)?.message }));
}

// Any other /api path → clean JSON 404 (must not fall through to the SPA).
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ error: { code: 'not_found', message: 'Unknown API route.' } });
});

// Static SPA assets (hashed filenames; index served via the fallback below).
if (existsSync(DIST)) {
  app.use(express.static(DIST, { index: false, maxAge: '1h' }));
}

// Stable training narration/audio is mounted from GCS in Cloud Run so deploys
// do not need to upload unchanged advanced-training WAV files.
const narrationDir = process.env.NARRATION_ASSETS_DIR || '/mnt/narration';
if (existsSync(narrationDir)) {
  app.use(express.static(narrationDir, { index: false, maxAge: '1d' }));
  console.log(JSON.stringify({ event: 'cloudrun.narration_static.enabled', narrationDir }));
}

// SPA history fallback: client-side routes (e.g. /login, /register, /dashboard)
// and browser refresh return index.html. GET only.
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.method !== 'GET') return next();
  res.set('Cache-Control', 'no-cache');
  res.sendFile(INDEX);
});

// Centralized error handler — returns the typed ApiError shape, never leaks
// internals or credentials.
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const code = typeof err?.code === 'string' ? err.code : 'internal_error';
  const message = typeof err?.message === 'string' ? err.message : 'Internal error';
  res.status(status).json({ error: { code, message } });
};
app.use(errorHandler);

const server = app.listen(PORT, HOST, () => {
  // No secrets in logs.
  console.log(JSON.stringify({ event: 'cloudrun.started', port: PORT, host: HOST, dist: DIST, hasDist: existsSync(DIST) }));
});

for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, () => {
    console.log(JSON.stringify({ event: 'cloudrun.shutdown', signal: sig }));
    server.close(() => process.exit(0));
  });
}
