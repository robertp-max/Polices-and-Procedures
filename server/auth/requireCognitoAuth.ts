/**
 * COG-2 — protected-route PEP middleware.
 *
 * Establishes a SERVER-AUTHORITATIVE actor on the request from a verified
 * Cognito bearer token, ignoring all client-supplied identity headers:
 *
 *   1. Extract the Bearer access token (Authorization header only).
 *   2. Validate its claims (issuer / client / token_use / exp) — pure.
 *   3. Prove authenticity + liveness + active-account via the auth service's
 *      Cognito GetUser path (COG-1 active-registration gate included).
 *   4. Resolve the verified sub → canonical CIHHC actor from the server
 *      identity registry (roles + status from the server, never the client).
 *   5. Overwrite req.actor / req.session.actor with the verified actor.
 *
 * Any failure denies (401/403); the request never proceeds on a header-derived
 * or anonymous identity. Dependencies are injectable for deterministic tests.
 */
import type { RequestHandler } from 'express';
import { ApiError } from '../errors.js';
import { env } from '../env.js';
import type { Actor } from '../identity/session.js';
import { buildDemoAuthServiceFromEnv } from './service.js';
import type { DemoUser } from './types.js';
import { getAppIdentityPersistence, type AppIdentityRegistry } from './appIdentityPersistence.js';
import {
  decodeJwtPayload, expectedIssuer, validateAccessTokenClaims,
} from './accessTokenClaims.js';
import { assertActorRole, resolveServerActor } from './actorResolver.js';

export interface RequireAuthDeps {
  /** Proves authenticity + returns the verified Cognito user (sub, email). */
  getCurrentUser: (accessToken: string) => Promise<DemoUser>;
  /** Loads the canonical server identity registry. */
  loadRegistry: () => Promise<AppIdentityRegistry>;
  issuer: string;
  clientId: string;
  nowSeconds: () => number;
  nowIso: () => string;
}

function defaultDeps(): RequireAuthDeps {
  const service = buildDemoAuthServiceFromEnv(process.env);
  return {
    getCurrentUser: (t) => service.getCurrentUser(t),
    loadRegistry: () => getAppIdentityPersistence().getAll(),
    issuer: expectedIssuer(env.awsRegion, env.cognitoUserPoolId),
    clientId: env.cognitoClientId,
    nowSeconds: () => Math.floor(Date.now() / 1000),
    nowIso: () => new Date().toISOString(),
  };
}

function extractBearer(header: string | undefined): string {
  const h = header ?? '';
  if (!h.startsWith('Bearer ')) {
    throw new ApiError('auth_error', 'Missing bearer token.', 401);
  }
  return h.slice('Bearer '.length).trim();
}

/**
 * Resolve the verified server actor for a request, or throw. Exposed for reuse
 * and testing; the middleware is a thin wrapper that also mutates the request.
 */
export async function resolveVerifiedActor(
  authorizationHeader: string | undefined,
  deps: RequireAuthDeps,
): Promise<Actor> {
  const token = extractBearer(authorizationHeader);
  // (2) cheap, deterministic claim checks first.
  const payload = decodeJwtPayload(token);
  validateAccessTokenClaims(payload, { issuer: deps.issuer, clientId: deps.clientId }, deps.nowSeconds());
  // (3) authenticity + liveness + active-account (Cognito GetUser + COG-1 gate).
  const verified = await deps.getCurrentUser(token);
  const sub = verified.authSubject || verified.id || '';
  if (!sub) throw new ApiError('auth_error', 'Verified token has no subject.', 401);
  // (4) canonical resolution — roles + status from the server registry.
  const registry = await deps.loadRegistry();
  return resolveServerActor({ sub, email: verified.email }, registry, deps.nowIso());
}

/** Middleware factory: attaches the verified server actor or denies. */
export function requireCognitoAuth(depsOverride?: Partial<RequireAuthDeps>): RequestHandler {
  return (req, _res, next) => {
    const deps = { ...defaultDeps(), ...depsOverride };
    resolveVerifiedActor(req.header('authorization'), deps)
      .then((actor) => {
        req.actor = actor;
        if (req.session) {
          req.session.actor = actor;
          req.session.authenticated = true;
        }
        next();
      })
      .catch(next);
  };
}

/** Role PEP: requires the (already verified) actor to hold one of `roles`. */
export function requireRole(roles: string[]): RequestHandler {
  return (req, _res, next) => {
    try {
      if (!req.actor || req.actor.type !== 'user') {
        throw new ApiError('auth_error', 'Not authenticated.', 401);
      }
      assertActorRole(req.actor, roles);
      next();
    } catch (e) {
      next(e);
    }
  };
}
