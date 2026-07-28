/**
 * Care Indeed LMS — Express / Cloud Run mount for the /api/training router.
 *
 * ⚠️ UNVERIFIED. Requires `express` (+ the host's existing Cognito/JWT auth middleware).
 * This is a thin transport shim: it converts Express req/res to the framework-agnostic
 * ApiRequest/ApiResponse and delegates to createRouter(). Authentication + capability
 * derivation are the host's responsibility — this shim only reads what the auth
 * middleware already placed on the request. It never derives identity from the body.
 */
// @ts-nocheck — depends on express + host auth middleware
import express from 'express';
import type { TrainingService } from '../app/trainingService';
import { createRouter, type ApiRequest, type AuthContext } from './router';
import type { Capability } from './authz';

/**
 * `authFromRequest` must be provided by the host — it reads the verified JWT/session the
 * upstream auth middleware attached (e.g. req.user) and returns the AuthContext, or null
 * for public routes. It MUST NOT trust anything in the request body.
 */
export function mountTrainingApi(
  svc: TrainingService,
  authFromRequest: (req: express.Request) => AuthContext | null,
): express.Router {
  const handle = createRouter(svc);
  const api = express.Router();
  api.use(express.json({ limit: '256kb' }));

  api.all('/api/*', async (req, res) => {
    const apiReq: ApiRequest = {
      method: req.method as 'GET' | 'POST',
      path: req.path,
      auth: authFromRequest(req) ?? undefined,
      idempotencyKey: req.header('Idempotency-Key') ?? undefined,
      body: (req.body ?? {}) as Record<string, unknown>,
    };
    const result = await handle(apiReq);
    res.status(result.status).json(result.body);
  });

  return api;
}

/** Convenience: derive capabilities from JWT claims (host claim shape varies). */
export function authContextFromClaims(claims: {
  sub: string;
  capabilities?: string[];
  status?: string;
}): AuthContext {
  return {
    subjectId: claims.sub,
    capabilities: new Set((claims.capabilities ?? []) as Capability[]),
    suspended: claims.status === 'SUSPENDED',
    terminated: claims.status === 'TERMINATED',
  };
}
