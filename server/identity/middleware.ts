/**
 * Identity middleware: attach SessionContext to req.
 *
 * Mounted globally under /api so every downstream handler and PEP has access
 * to a stable `req.session` and `req.actor`.
 */
import type { RequestHandler } from 'express';
import { ANONYMOUS_ACTOR, parseList, ulid } from './session.js';
import type { Actor, SessionContext } from './session.js';

declare global {
  // Express request augmentation
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session: SessionContext;
      actor: Actor;
    }
  }
}

function asIal(v: string | undefined): 1 | 2 | 3 {
  if (v === '3') return 3;
  if (v === '2') return 2;
  return 1;
}

export const identityMiddleware: RequestHandler = (req, _res, next) => {
  const userId = req.header('x-user-id') ?? '';
  const sessionId = req.header('x-session-id') ?? `sess_${ulid()}`;
  const correlationId = req.header('x-correlation-id') ?? ulid();
  const requestId = ulid();

  let actor: Actor;
  let authenticated = false;

  if (userId) {
    actor = {
      type: 'user',
      user_id: userId,
      display_name: req.header('x-user-display-name') ?? userId,
      roles: parseList(req.header('x-user-roles')),
      attributes: {
        branches: parseList(req.header('x-user-branches')),
        service_lines: parseList(req.header('x-user-service-lines')),
        access_classes: parseList(req.header('x-user-access-classes')),
      },
      mfa_enrolled: (req.header('x-user-mfa') ?? 'false').toLowerCase() === 'true',
      identity_assurance: asIal(req.header('x-user-ial') ?? undefined),
    };
    authenticated = true;
  } else {
    actor = ANONYMOUS_ACTOR;
  }

  const session: SessionContext = {
    session_id: sessionId,
    request_id: requestId,
    correlation_id: correlationId,
    actor,
    authenticated,
    auth_age_seconds: Number(req.header('x-auth-age-seconds') ?? 0) || 0,
    ip: (req.ip ?? undefined) as string | undefined,
    user_agent: req.header('user-agent') ?? undefined,
    device_id: req.header('x-device-id') ?? undefined,
  };

  req.session = session;
  req.actor = actor;
  next();
};
