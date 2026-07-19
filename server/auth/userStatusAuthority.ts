/**
 * COG-2 hotfix — server-authoritative authority to manage user *status*
 * (suspend / reactivate).
 *
 * Reconciles the two admin authority sources so they agree: the approved
 * administrator email allowlist (the same source behind `manageUsers` /
 * `assertAdminAccessToken`) AND a canonical administrator group in the server
 * identity registry. Either grants the authority; neither is ever derived from
 * client headers, localStorage, query params, or a request-body actor.
 *
 * The middleware self-resolves the verified Cognito actor (it is mounted before
 * the `/api` boundary, so `req.actor` is not yet populated), authorizes, then
 * attaches the verified actor for the downstream router.
 */
import type { RequestHandler } from 'express';
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import { actorHasAnyRole, PRIVILEGED_GROUP_IDS } from './actorResolver.js';
import { resolveVerifiedActor, mergeAuthDeps, type RequireAuthDeps } from './requireCognitoAuth.js';
import { buildDemoAuthServiceFromEnv } from './service.js';

/**
 * True when the verified actor may manage user status: an approved-admin email
 * OR a canonical administrator group. `isAdminEmail` is injected (the same
 * server allowlist predicate used for `manageUsers`) so the algorithm is not
 * duplicated.
 */
export function actorMayManageUserStatus(
  actor: Actor,
  isAdminEmail: (email?: string | null) => boolean,
): boolean {
  return isAdminEmail(actor.email) || actorHasAnyRole(actor, PRIVILEGED_GROUP_IDS);
}

/** PEP for the user-access mount: verify the actor, then require status authority. */
export function requireUserStatusAuthority(depsOverride?: Partial<RequireAuthDeps>): RequestHandler {
  return (req, _res, next) => {
    let deps: RequireAuthDeps;
    try { deps = mergeAuthDeps(depsOverride); } catch (e) { return next(e); }
    const service = buildDemoAuthServiceFromEnv(process.env);
    resolveVerifiedActor(req.header('authorization'), deps)
      .then((actor) => {
        if (!actorMayManageUserStatus(actor, (e) => service.isAdminEmail(e ?? ''))) {
          throw new ApiError('permission_denied', 'You do not have permission to manage user status.', 403);
        }
        req.actor = actor;
        if (req.session) { req.session.actor = actor; req.session.authenticated = true; }
        next();
      })
      .catch(next);
  };
}
