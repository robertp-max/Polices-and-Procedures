/**
 * Request authentication context (ADR-0002 Phase 1).
 *
 * The single source of truth for a request's authentication mode. The central
 * `requireApiAuth` boundary decides it and attaches it; downstream routers
 * (eCIgn, Calendar) consume it and must never re-derive demo authority from
 * environment variables or caller-supplied headers.
 *
 * This is a neutral auth module — it intentionally does not depend on any
 * feature helper (e.g. eCIgn signer identity), because the contract is shared by
 * the central boundary, eCIgn, and Calendar.
 */
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';

export type AuthenticationMode = 'cognito' | 'service' | 'local_demo';
export interface RequestAuthenticationContext { mode: AuthenticationMode }

declare module 'express-serve-static-core' {
  interface Request { authenticationContext?: RequestAuthenticationContext }
}

/**
 * Map a verified actor to its non-demo authentication mode. Exhaustive and
 * fail-closed: a `system`/anonymous (or any unsupported) actor is never labeled
 * as Cognito-authenticated.
 */
export function authenticationModeForActor(actor: Actor): 'cognito' | 'service' {
  if (actor.type === 'user') return 'cognito';
  if (actor.type === 'service') return 'service';
  throw new ApiError('auth_error', 'Unsupported authenticated actor type.', 401);
}

/**
 * Request-scoped demo authority. The central requireApiAuth boundary is the SOLE
 * decider and sets `req.authenticationContext`. A Cognito- or service-
 * authenticated request is never demo; a request that never passed the boundary
 * (e.g. a direct router mount in a test) is never demo — regardless of env vars
 * or request headers.
 */
export function requestIsLocalDemo(req: { authenticationContext?: RequestAuthenticationContext }): boolean {
  return req.authenticationContext?.mode === 'local_demo';
}
