/**
 * COG-2 hotfix — server-authoritative authority to manage user *status*
 * (suspend / reactivate), reconciled with account status.
 *
 * Wraps the pure {@link evaluateUserStatusAuthority} algorithm with the impure
 * seams (verified Cognito identity + canonical registry lookup) and exposes:
 *  - resolveUserStatusAuthority(): used by the route handlers, returns the
 *    verified actor + authority result (or throws a typed 401/403);
 *  - requireUserStatusAuthority(): the Express PEP for the mount, which runs
 *    before the /api boundary and therefore self-resolves the actor.
 *
 * Authority may originate from an approved administrator email (even when the
 * canonical record is pending/absent) OR an active canonical administrator
 * group — but a suspended/disabled canonical record is ALWAYS denied. Identity
 * is only ever the verified token: never body actor data, headers, storage, or
 * client role values.
 */
import type { RequestHandler } from 'express';
import { ApiError } from '../errors.js';
import type { Actor } from '../identity/session.js';
import { findCanonicalUser, activeRoleGroupIds } from './actorResolver.js';
import { resolveVerifiedIdentity, mergeAuthDeps, type RequireAuthDeps } from './requireCognitoAuth.js';
import { buildDemoAuthServiceFromEnv } from './service.js';
import { evaluateUserStatusAuthority, type UserStatusAuthorityResult } from './userStatusAuthorityCore.js';

export type { UserStatusAuthorityResult, UserStatusAuthoritySource } from './userStatusAuthorityCore.js';

/** Build a minimal audit actor from an allowed authority result. */
function actorFromAuthority(result: UserStatusAuthorityResult): Actor {
  return {
    type: 'user',
    user_id: result.actorUserId!,
    display_name: result.actorEmail!,
    email: result.actorEmail!,
    roles: [],
    attributes: { branches: [], service_lines: [], access_classes: [] },
    mfa_enrolled: false,
    identity_assurance: 1,
  };
}

/**
 * Resolve + authorize the caller for user-status administration. Returns the
 * verified actor and the authority result (with source + canonical status), or
 * throws a typed ApiError (401 for auth failures, 403 for denied authority).
 */
export async function resolveUserStatusAuthority(
  authorizationHeader: string | undefined,
  deps: RequireAuthDeps,
  isApprovedAdminEmail: (email?: string | null) => boolean,
): Promise<{ actor: Actor; result: UserStatusAuthorityResult }> {
  const { sub, email } = await resolveVerifiedIdentity(authorizationHeader, deps);
  const registry = await deps.loadRegistry();
  const canonicalUser = findCanonicalUser(registry, { sub, email });
  const canonicalRoles = canonicalUser ? activeRoleGroupIds(registry, canonicalUser.id, deps.nowIso()) : [];
  const result = evaluateUserStatusAuthority({
    verifiedEmail: email,
    isApprovedAdminEmail: isApprovedAdminEmail(email),
    canonicalUser: canonicalUser
      ? { id: canonicalUser.id, email: canonicalUser.email, status: canonicalUser.status }
      : null,
    canonicalRoles,
  });
  if (!result.allowed) {
    throw new ApiError('permission_denied', result.denyReason ?? 'You do not have permission to manage user status.', 403);
  }
  return { actor: actorFromAuthority(result), result };
}

/** PEP for the user-access mount: verify the actor, then require status authority. */
export function requireUserStatusAuthority(depsOverride?: Partial<RequireAuthDeps>): RequestHandler {
  return (req, _res, next) => {
    let deps: RequireAuthDeps;
    try { deps = mergeAuthDeps(depsOverride); } catch (e) { return next(e); }
    const service = buildDemoAuthServiceFromEnv(process.env);
    resolveUserStatusAuthority(req.header('authorization'), deps, (e) => service.isAdminEmail(e ?? ''))
      .then(({ actor, result }) => {
        req.actor = actor;
        req.userStatusAuthority = result;
        if (req.session) { req.session.actor = actor; req.session.authenticated = true; }
        next();
      })
      .catch(next);
  };
}
