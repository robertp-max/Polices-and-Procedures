/**
 * Care Indeed LMS — Cloud Run entrypoint.
 *
 * Wires the live GCP LearningEnv into the framework-agnostic training router.
 * Auth: production expects the host's Cognito/JWT middleware to populate req.user.
 * For dev smoke only, when LMS_DEV_AUTH=1, an AuthContext is read from X-Debug-*
 * headers so the deployed API can be exercised end-to-end. This is OFF by default.
 */
import express from 'express';
import { makeGcpEnv, gcpConfigFromEnv } from '../../src/learning/adapters/gcp/index';
import { TrainingService } from '../../src/learning/app/trainingService';
import { mountTrainingApi } from '../../src/learning/http/express';
import type { AuthContext } from '../../src/learning/http/router';
import type { Capability } from '../../src/learning/http/authz';

const app = express();
const svc = new TrainingService(makeGcpEnv(gcpConfigFromEnv()));
const devAuth = process.env.LMS_DEV_AUTH === '1';

function authFromRequest(req: express.Request): AuthContext | null {
  // Production: return authContextFromClaims((req as any).user) once the host auth
  // middleware is mounted ahead of this. Dev-only header shim below.
  const hostUser = (req as unknown as { user?: { sub: string; capabilities?: string[]; status?: string } }).user;
  if (hostUser?.sub) {
    return {
      subjectId: hostUser.sub,
      capabilities: new Set((hostUser.capabilities ?? []) as Capability[]),
      suspended: hostUser.status === 'SUSPENDED',
      terminated: hostUser.status === 'TERMINATED',
    };
  }
  if (devAuth) {
    const sub = req.header('X-Debug-Subject');
    if (!sub) return null;
    const caps = (req.header('X-Debug-Caps') ?? '').split(',').map((c) => c.trim()).filter(Boolean);
    return { subjectId: sub, capabilities: new Set(caps as Capability[]) };
  }
  return null; // fail closed → protected routes 401
}

// Health at several paths — the exact `/healthz` is swallowed by the Google Frontend
// edge (reserved), so `/` and `/health` are the reliable liveness endpoints.
app.get(['/', '/health', '/healthz', '/livez'], (_req, res) => {
  res.status(200).json({ ok: true, service: 'lms-backend', devAuth, ts: new Date().toISOString() });
});

// Cloud Tasks delivery target (OIDC-authenticated in prod). Ack stub until the
// certificate/evidence workers are implemented (Wave 6/7 live layer).
app.post('/jobs/:queue', express.json({ limit: '256kb' }), (req, res) => {
  console.log(JSON.stringify({ job: req.params.queue, idem: req.header('Idempotency-Key'), body: req.body }));
  res.status(200).json({ accepted: true, queue: req.params.queue });
});

app.use(mountTrainingApi(svc, authFromRequest));

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`lms-backend listening on :${port} (devAuth=${devAuth})`));
