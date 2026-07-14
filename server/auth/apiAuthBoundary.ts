/**
 * COG-2 — the single API authentication boundary.
 *
 * Mounted once at `/api`, AFTER the public/self-guarded login surface and
 * BEFORE every business router. It is the ONE authentication path for business
 * operations: a request either matches a narrow explicit public allowlist, or
 * it must present a verified Cognito bearer that resolves to an active
 * canonical user — otherwise it is denied (401/403) and never reaches a
 * business handler on an anonymous actor.
 */
import type { RequestHandler } from 'express';
import { resolveVerifiedActor, mergeAuthDeps, type RequireAuthDeps } from './requireCognitoAuth.js';
import { publicApiPaths } from './routeAccessMatrix.js';

/** Exact paths that bypass the boundary (health checks). */
const PUBLIC_PATHS = new Set(publicApiPaths());

export interface ApiAuthBoundaryOptions {
  /** Additional exact public paths (tests). */
  extraPublicPaths?: string[];
  /** Dependency overrides for verification (tests). */
  deps?: Partial<RequireAuthDeps>;
}

/**
 * Build the boundary middleware. `req.path` here is relative to the mount
 * (`/api`), so we match against both the mount-relative and full `/api`-
 * prefixed forms of the public allowlist for safety.
 */
export function requireApiAuth(options: ApiAuthBoundaryOptions = {}): RequestHandler {
  const publicExact = new Set<string>([...PUBLIC_PATHS, ...(options.extraPublicPaths ?? [])]);
  return (req, _res, next) => {
    // CORS preflight carries no credentials and mutates nothing.
    if (req.method === 'OPTIONS') return next();

    const fullPath = req.originalUrl.split('?')[0];
    const relPath = req.path.startsWith('/api') ? req.path : `/api${req.path}`;
    if (publicExact.has(fullPath) || publicExact.has(relPath)) return next();

    let deps: RequireAuthDeps;
    try {
      deps = mergeAuthDeps(options.deps);
    } catch (e) {
      return next(e);
    }
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

export { requireRole } from './requireCognitoAuth.js';
