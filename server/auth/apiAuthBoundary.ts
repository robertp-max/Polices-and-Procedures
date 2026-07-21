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
import { authenticationModeForActor } from './requestAuthenticationContext.js';
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
  const raw = String(value ?? '').split(',')[0].trim().toLowerCase();
  // Bracketed IPv6, with or without a port: [::1] / [::1]:5180 → ::1
  const bracket = raw.match(/^\[([^\]]+)\]/);
  if (bracket) return bracket[1];
  // Bare IPv6 (more than one colon, e.g. ::1) — never strip a "port".
  if ((raw.match(/:/g) ?? []).length > 1) return raw;
  // hostname[:port] → hostname
  return raw.split(':')[0];
}

function isLoopbackHostname(value: string | undefined): boolean {
  const h = hostPart(value);
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

function isLoopbackAddress(value: string | undefined): boolean {
  const a = String(value ?? '').trim().toLowerCase();
  return a === '127.0.0.1' || a === '::1' || a.startsWith('::ffff:127.');
}

/**
 * Strict request locality: BOTH the canonical request host AND the actual
 * network peer must be loopback. Caller-influenceable evidence — `Origin`,
 * `X-Forwarded-Host`, `Forwarded`, and similar proxy headers — is NEVER positive
 * proof of locality (a public request can spoof them). A non-loopback peer
 * presenting a `localhost` Host is not local. A trusted-proxy/CIDR path for
 * Docker or reverse proxies would be a separate, explicit design — not headers.
 */
function isLocalDemoRequest(req: Parameters<RequestHandler>[0]): boolean {
  const canonicalHost = req.hostname || hostPart(req.header('host'));
  const remoteAddress = req.socket?.remoteAddress;
  return isLoopbackHostname(canonicalHost) && isLoopbackAddress(remoteAddress);
}

/**
 * The local demo actor is DENIED unless every condition holds:
 *   - explicit opt-in: ENABLE_LOCAL_DEMO_AUTH === "true" (exact; malformed → deny)
 *   - NODE_ENV !== "production"
 *   - no injected auth deps and the fallback is not disabled by the caller
 *   - Cognito configuration is absent — EITHER pool or client present → deny
 *     (a partial config is a configuration error, not permission to fall back)
 *   - the request is proven-local: loopback host AND loopback network peer
 * Missing/absent Cognito configuration alone NEVER activates it — the opt-in
 * flag is required. Fail-closed on any error.
 */
function shouldUseLocalDemoFallback(req: Parameters<RequestHandler>[0], options: ApiAuthBoundaryOptions): boolean {
  if (options.disableLocalDemoFallback || options.deps) return false;
  // Explicit opt-in is mandatory — never activated by missing configuration.
  if (process.env.ENABLE_LOCAL_DEMO_AUTH !== 'true') return false;
  if (process.env.NODE_ENV === 'production') return false;
  // Partial Cognito configuration fails closed: pool OR client present → no demo.
  const hasPool = Boolean(process.env.COGNITO_USER_POOL_ID?.trim());
  const hasClient = Boolean(process.env.COGNITO_CLIENT_ID?.trim());
  if (hasPool || hasClient) return false;
  try {
    return isLocalDemoRequest(req);
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
        // The boundary — and only the boundary — decides local-demo authority,
        // after all host / Cognito-config / injected-deps checks.
        req.authenticationContext = { mode: 'local_demo' };
        attachActor(req, LOCAL_DEMO_ACTOR);
        return next();
      }
      return next(e);
    }
    resolveVerifiedActor(req.header('authorization'), deps)
      .then((actor) => {
        req.authenticationContext = { mode: authenticationModeForActor(actor) };
        attachActor(req, actor);
        next();
      })
      .catch(next);
  };
}

export { requireRole } from './requireCognitoAuth.js';
