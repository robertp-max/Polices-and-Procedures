import type { RequestHandler } from 'express';
import { ApiError } from '../errors.js';
import { permissionsForGroups } from './authorization/catalog.js';
import { GOVERNANCE_ENTRY_ROLES } from '../governance/routes.js';

/**
 * Permission-first PEP for the Governing Body Portal API (`/api/governance`).
 *
 * Primary gate: the verified actor's groups must expand to `governance.portal.access`
 * (see src/policy/security/identity/userGroups.ts). This is portal ENTRY only — every
 * mutation and classified record delivery inside the router is separately authorized
 * against active appointment, role term, committee charter, delegation, conflict state,
 * and record-access class.
 *
 * Compatibility fallback: the ZIP's hard-coded `GOVERNANCE_ENTRY_ROLES` group list is kept
 * as an OR fallback so canonical governance groups that predate the permission still resolve.
 *
 * Fail-closed: unauthenticated or non-user actors are rejected 401; suspended/inactive users
 * never reach here because `requireApiAuth` already denies them 403 at the boundary.
 */
export function requireGovernancePortalAccess(): RequestHandler {
  return (req, _res, next) => {
    try {
      const actor = req.actor;
      if (!actor || actor.type !== 'user') {
        throw new ApiError('auth_error', 'Not authenticated.', 401);
      }
      const groups = actor.roles ?? [];
      const permissions = permissionsForGroups(groups);
      const hasPermission = permissions.has('governance.portal.access');
      const fallbackRoles = GOVERNANCE_ENTRY_ROLES as readonly string[];
      const hasFallbackRole = groups.some((g) => fallbackRoles.includes(g));
      if (!hasPermission && !hasFallbackRole) {
        throw new ApiError(
          'permission_denied',
          'Governing Body Portal access requires the governance.portal.access permission.',
          403,
        );
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
