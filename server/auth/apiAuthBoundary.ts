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
import type { Actor } from '../identity/session.js';

/** Exact paths that bypass the boundary (health checks). */
const PUBLIC_PATHS = new Set(publicApiPaths());

const LOCAL_DEMO_ACTOR: Actor = {
  type: 'user',
  user_id: 'demo-user-careindeed',
  display_name: 'TJ Padilla',
  email: 'robertp@careindeed.com',
  roles: ['grp-super-admin', 'grp-admin', 'grp-user-access-admin'],
  attributes: { branches: [], service_lines: [], access_classes: [] },
  mfa_enrolled: false,
  identity_assurance: 1,
};

export interface ApiAuthBoundaryOptions {
  /** Additional exact public paths (tests). */
  extraPublicPaths?: string[];
  /** Dependency overrides for verification (tests). */
  deps?: Partial<RequireAuthDeps>;
  /** Disable the localhost demo fallback in tests. */
  disableLocalDemoFallback?: boolean;
}

function hostPart(value: string | undefined): string {
  return String(value ?? '').split(',')[0].trim().split(':')[0].toLowerCase();
}

function isLocalDevHost(req: Parameters<RequestHandler>[0]): boolean {
  const hosts = [
    req.hostname,
    req.header('host'),
    req.header('x-forwarded-host'),
    req.header('origin') ? new URL(req.header('origin') as string).hostname : '',
  ].map(hostPart);
  return hosts.some((host) => host === 'localhost' || host === '127.0.0.1' || host === '::1');
}

function shouldUseLocalDemoFallback(req: Parameters<RequestHandler>[0], options: ApiAuthBoundaryOptions): boolean {
  if (options.disableLocalDemoFallback || options.deps) return false;
  if (process.env.NODE_ENV === 'production') return false;
  if (process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID) return false;
  try {
    return isLocalDevHost(req);
  } catch {
    return false;
  }
}

function attachActor(req: Parameters<RequestHandler>[0], actor: Actor): void {
  req.actor = actor;
  if (req.session) {
    req.session.actor = actor;
    req.session.authenticated = true;
  }
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
      if (shouldUseLocalDemoFallback(req, options)) {
        attachActor(req, LOCAL_DEMO_ACTOR);
        return next();
      }
      return next(e);
    }
    resolveVerifiedActor(req.header('authorization'), deps)
      .then((actor) => {
        attachActor(req, actor);
        next();
      })
      .catch(next);
  };
}

export { requireRole } from './requireCognitoAuth.js';
