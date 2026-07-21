/**
 * Identity middleware: attach a request-scoped SessionContext to req.
 *
 * COG-2 SECURITY CHANGE: this middleware NO LONGER derives an authenticated
 * actor, roles, MFA, or identity assurance from client-supplied `x-user-*`
 * headers. Those headers are forgeable and must never confer identity or
 * privilege. Every request starts ANONYMOUS here; a protected route attaches a
 * real, server-authoritative actor only after `requireCognitoAuth` verifies a
 * Cognito bearer token and resolves it against the canonical identity
 * registry. Only non-identity request plumbing (correlation/session/request
 * ids, ip, user-agent) is derived from the request.
 */
import type { RequestHandler } from 'express';
import { ANONYMOUS_ACTOR, ulid } from './session.js';
import type { Actor, SessionContext } from './session.js';

declare global {
  // Express request augmentation
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session: SessionContext;
      actor: Actor;
      /** Set by requireUserStatusAuthority — the authority verdict + source. */
      userStatusAuthority?: import('../auth/userStatusAuthorityCore.js').UserStatusAuthorityResult;
    }
  }
}

export const identityMiddleware: RequestHandler = (req, _res, next) => {
  const sessionId = req.header('x-session-id') ?? `sess_${ulid()}`;
  const correlationId = req.header('x-correlation-id') ?? ulid();
  const requestId = ulid();

  // Always anonymous until a verified bearer token upgrades the actor.
  // Client identity/role/mfa headers are intentionally ignored (forgeable).
  const actor: Actor = ANONYMOUS_ACTOR;

  const session: SessionContext = {
    session_id: sessionId,
    request_id: requestId,
    correlation_id: correlationId,
    actor,
    authenticated: false,
    auth_age_seconds: 0,
    ip: (req.ip ?? undefined) as string | undefined,
    user_agent: req.header('user-agent') ?? undefined,
    device_id: req.header('x-device-id') ?? undefined,
  };

  req.session = session;
  req.actor = actor;
  next();
};
