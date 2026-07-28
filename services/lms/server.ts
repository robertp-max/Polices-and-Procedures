/**
 * Care Indeed LMS — Cloud Run entrypoint.
 *
 * Wires the live GCP LearningEnv into the framework-agnostic training router.
 *
 * Auth: the host's verified-JWT middleware must populate req.user; without it every
 * protected route fails closed (401). There is NO debug/header auth path — the former
 * LMS_DEV_AUTH X-Debug-* shim was removed after a security review (it let any caller
 * self-grant capabilities). Dev access goes through Cloud Run IAM identity tokens.
 *
 * /jobs/:queue only accepts Cloud Tasks deliveries carrying a Google OIDC token whose
 * signature, audience, and service-account identity all verify.
 */
import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { makeGcpEnv, gcpConfigFromEnv } from '../../src/learning/adapters/gcp/index';
import { TrainingService } from '../../src/learning/app/trainingService';
import { mountTrainingApi, authContextFromClaims } from '../../src/learning/http/express';
import type { AuthContext } from '../../src/learning/http/router';

const app = express();
const svc = new TrainingService(makeGcpEnv(gcpConfigFromEnv()));

function authFromRequest(req: express.Request): AuthContext | null {
  // Only a host-middleware-verified principal is trusted. Never headers, never the body.
  const hostUser = (req as unknown as { user?: { sub: string; capabilities?: string[]; status?: string } }).user;
  if (hostUser?.sub) return authContextFromClaims(hostUser);
  return null; // fail closed → protected routes 401
}

// Health at several paths — the exact `/healthz` is swallowed by the Google Frontend
// edge (reserved), so `/` and `/health` are the reliable liveness endpoints.
app.get(['/', '/health', '/healthz', '/livez'], (_req, res) => {
  res.status(200).json({ ok: true, service: 'lms-backend', ts: new Date().toISOString() });
});

// Cloud Tasks delivery target. Requires a valid Google OIDC token minted for our
// handler audience by our own service account; anything else is rejected before the
// body is touched. Still an ack stub until the certificate/evidence workers land.
const ALLOWED_QUEUES = new Set(['certificate-render', 'evidence-validate', 'notifications', 'projections']);
const oidcVerifier = new OAuth2Client();
const jobsAudience = process.env.LMS_JOBS_HANDLER_URL ?? '';
const jobsServiceAccount = process.env.LMS_JOBS_OIDC_SA ?? '';

app.post('/jobs/:queue', express.json({ limit: '256kb' }), async (req, res) => {
  const deny = (status: number, code: string) => res.status(status).json({ error: { code } });
  if (!jobsAudience || !jobsServiceAccount) return deny(503, 'JOBS_NOT_CONFIGURED');
  if (!ALLOWED_QUEUES.has(req.params.queue)) return deny(404, 'UNKNOWN_QUEUE');
  const header = req.header('Authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length) : '';
  if (!token) return deny(401, 'UNAUTHENTICATED');
  try {
    const ticket = await oidcVerifier.verifyIdToken({ idToken: token, audience: jobsAudience });
    const claims = ticket.getPayload();
    if (!claims?.email_verified || claims.email !== jobsServiceAccount) return deny(403, 'FORBIDDEN_CALLER');
  } catch {
    return deny(401, 'INVALID_OIDC_TOKEN');
  }
  // Log metadata only — never the payload body (may contain sensitive references).
  console.log(JSON.stringify({ job: req.params.queue, idem: req.header('Idempotency-Key') ?? null }));
  res.status(200).json({ accepted: true, queue: req.params.queue });
});

app.use(mountTrainingApi(svc, authFromRequest));

const port = Number(process.env.PORT ?? 8080);
app.listen(port, () => console.log(`lms-backend listening on :${port}`));
