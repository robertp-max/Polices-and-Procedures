/**
 * Policy Enforcement Point (PEP) — Express middleware factory.
 * ─────────────────────────────────────────────────────────────────────────────
 * Usage:
 *   router.get('/protected',
 *     requirePermission('execution_unit:view', loadResource),
 *     handler);
 *
 * - Resolves the resource (via the optional loader) for ABAC.
 * - Calls the PDP.
 * - Emits an `access.decision.*` audit event for every decision.
 * - On Deny, responds 403 with a typed error and closed-set reason code.
 */
import type { RequestHandler, Request } from 'express';
import { ApiError } from '../errors.js';
import { decide, type AccessRequest } from './pdp.js';
import { appendEvent } from '../audit/writer.js';

export type ResourceLoader = (req: Request) => Promise<{
  type: string;
  id: string;
  attributes?: Record<string, unknown>;
}> | { type: string; id: string; attributes?: Record<string, unknown> };

export interface PepOptions {
  /** If true, do not 403 on deny; just attach `req.accessDecision` for soft checks. */
  softMode?: boolean;
  /** Override the action implied by permission (e.g., for batch verbs). */
  actionOverride?: string;
}

export function requirePermission(
  permission: string,
  loader?: ResourceLoader,
  opts: PepOptions = {},
): RequestHandler {
  const [resourceType, action] = permission.split(':');
  if (!resourceType || !action) {
    throw new Error(`requirePermission: invalid permission "${permission}"`);
  }
  return async (req, _res, next) => {
    try {
      let resource = { type: resourceType, id: 'unspecified' } as { type: string; id: string; attributes?: Record<string, unknown> };
      if (loader) {
        resource = await loader(req);
      }

      const accessReq: AccessRequest = {
        actor: req.actor,
        permission,
        action: opts.actionOverride ?? action,
        resource: { type: resource.type, id: resource.id },
        resource_attributes: resource.attributes,
        environment: {
          ip: req.session.ip,
          user_agent: req.session.user_agent,
          auth_age_seconds: req.session.auth_age_seconds,
          device_id: req.session.device_id,
        },
      };

      const decision = decide(accessReq);

      // Audit the decision (every decision; sampling can be added later).
      await appendEvent({
        event_type: decision.decision === 'permit' ? 'access.decision.permit' : 'access.decision.deny',
        stream: `user:${req.actor.user_id ?? 'anonymous'}`,
        actor: {
          type: req.actor.type,
          user_id: req.actor.user_id,
          service_id: req.actor.service_id,
          display_name: req.actor.display_name,
        },
        action: 'access_decision',
        resource: { type: accessReq.resource.type, id: accessReq.resource.id },
        decision: decision.decision,
        decision_reason: decision.reason,
        authz_policy_ver: decision.policy_version,
        correlation_id: req.session.correlation_id,
        request_id: req.session.request_id,
        session_id: req.session.session_id,
        environment: { ip: req.session.ip, user_agent: req.session.user_agent, device_id: req.session.device_id },
        severity: decision.reason === 'sod_violation' ? 'high'
          : decision.decision === 'deny' ? 'warning' : 'info',
        payload: {
          permission,
          detail: decision.detail,
          sod_violations: decision.sod_violations,
          abac_violations: decision.abac_violations,
          path: req.path,
          method: req.method,
        },
      }).catch(() => undefined); // never fail the request because audit failed

      // Attach for downstream introspection
      (req as Request & { accessDecision?: typeof decision }).accessDecision = decision;

      if (decision.decision === 'permit' || opts.softMode) {
        return next();
      }
      return next(new ApiError(
        'permission_denied',
        `Permission denied: ${decision.reason}${decision.detail ? ` (${decision.detail})` : ''}`,
        403,
        { reason: decision.reason },
      ));
    } catch (e) {
      return next(e);
    }
  };
}

/** Direct (non-middleware) authorize call for engine-internal handlers. */
export async function authorize(req: AccessRequest, ctx: {
  correlation_id: string;
  request_id?: string;
  session_id?: string;
}): Promise<{ permit: boolean; decision: ReturnType<typeof decide> }> {
  const decision = decide(req);
  await appendEvent({
    event_type: decision.decision === 'permit' ? 'access.decision.permit' : 'access.decision.deny',
    stream: `user:${req.actor.user_id ?? 'anonymous'}`,
    actor: {
      type: req.actor.type,
      user_id: req.actor.user_id,
      service_id: req.actor.service_id,
      display_name: req.actor.display_name,
    },
    action: 'access_decision',
    resource: { type: req.resource.type, id: req.resource.id },
    decision: decision.decision,
    decision_reason: decision.reason,
    authz_policy_ver: decision.policy_version,
    correlation_id: ctx.correlation_id,
    request_id: ctx.request_id,
    session_id: ctx.session_id,
    severity: decision.reason === 'sod_violation' ? 'high'
      : decision.decision === 'deny' ? 'warning' : 'info',
    payload: { permission: req.permission, detail: decision.detail },
  }).catch(() => undefined);
  return { permit: decision.decision === 'permit', decision };
}
