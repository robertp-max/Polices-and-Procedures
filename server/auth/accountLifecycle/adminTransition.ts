/**
 * Admin-initiated lifecycle transition core (ADR-0002 Phase 2E).
 *
 * The testable seam between the HTTP route and the orchestration service: it
 * enforces the admin policy guards (self-suspension, last-super-admin) against
 * the canonical registry FIRST, then delegates the durable, multi-plane
 * transition to AccountLifecycleService. Keeping this pure of Express makes the
 * hard-cut wiring unit-testable without HTTP machinery.
 *
 * Policy separation: guards live here (registry-derived); the mechanical
 * multi-plane transition + fail-closed durability live in the service. Under the
 * hard-cut policy the service 503s when the durable store is unconfigured — a
 * suspend is never silently downgraded to a canonical-only mutation.
 */
import { ApiError } from '../../errors.js';
import type { AppIdentityRegistry } from '../appIdentityPersistence.js';
import { assertCanSuspend, assertCanReactivate } from '../userAccessAdmin.js';
import type { AccountLifecycleService, LifecycleAction, LifecycleTransitionResult } from './service.js';

export interface AdminLifecycleTransitionInput {
  service: AccountLifecycleService;
  registry: AppIdentityRegistry;
  action: LifecycleAction;
  actorUserId: string | undefined;
  actorEmail: string | undefined;
  targetUserId: string;
  reason: string;
  idempotencyKey: string;
  nowIso: string;
}

export async function performAdminLifecycleTransition(input: AdminLifecycleTransitionInput): Promise<LifecycleTransitionResult> {
  const { service, registry, action, actorUserId, actorEmail, targetUserId, reason, idempotencyKey, nowIso } = input;
  if (!actorUserId) throw new ApiError('auth_error', 'A verified administrator identity is required.', 401);

  // (1) Policy guards against the canonical registry — before any durable work.
  if (action === 'suspend') assertCanSuspend(registry, actorUserId, targetUserId, nowIso);
  else assertCanReactivate(registry, targetUserId);

  // (2) Durable, multi-plane transition (fail-closed; global-deny before Cognito).
  const req = {
    canonicalUserId: targetUserId,
    actorUserId,
    actorEmailSnapshot: actorEmail ?? actorUserId,
    reason,
    idempotencyKey,
  };
  return action === 'suspend' ? service.suspend(req) : service.reactivate(req);
}
