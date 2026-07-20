/**
 * Legacy-plane projections for the account-lifecycle orchestrator (ADR-0002
 * Phase 2E).
 *
 * The durable lifecycle record is the AUTHORITY; these projections keep the two
 * legacy planes consistent with it so existing readers also honor the decision:
 *   - registration plane (DynamoDB) gates login/refresh/`/me` via
 *     assertRegistrationActiveForSession — 'disabled' denies, 'active' restores.
 *   - canonical plane (AppIdentityRegistry) gates business routes via the
 *     user-status authority — 'suspended' denies, 'active' restores.
 *
 * Both projections are IDEMPOTENT (projecting the same status twice is a no-op),
 * which the orchestrator's crash-resume + recovery rely on. They are pure of
 * business policy: the admin route enforces the guards (self-suspension,
 * last-super-admin) BEFORE the transition; a projection only mirrors state. All
 * substrate access is injected, so this module is unit-tested without live AWS.
 */
import { ApiError } from '../../errors.js';
import type { AppIdentityRegistry } from '../appIdentityPersistence.js';
import type { LifecycleProjections } from './service.js';

export interface LifecycleProjectionDeps {
  /** Flip the registration access plane (keyed by email). Idempotent. */
  setRegistrationAccess: (email: string, access: 'active' | 'disabled') => Promise<void>;
  /** Read/write the canonical registry (business-route plane). */
  getCanonicalRegistry: () => Promise<AppIdentityRegistry>;
  putCanonicalRegistry: (registry: AppIdentityRegistry) => Promise<unknown>;
}

export function createLifecycleProjections(deps: LifecycleProjectionDeps): LifecycleProjections {
  return {
    async projectCanonicalStatus({ canonicalUserId, denied }) {
      const registry = await deps.getCanonicalRegistry();
      const user = registry.users.find((u) => u.id === canonicalUserId);
      if (!user) throw new ApiError('validation_error', 'No canonical user for lifecycle projection.', 404);
      const desired: 'suspended' | 'active' = denied ? 'suspended' : 'active';
      if (user.status === desired) return; // idempotent no-op
      // Never resurrect a 'pending' canonical user to active via reactivation.
      if (desired === 'active' && user.status !== 'suspended') return;
      const next: AppIdentityRegistry = {
        ...registry,
        users: registry.users.map((u) => (u.id === canonicalUserId ? { ...u, status: desired } : u)),
      };
      await deps.putCanonicalRegistry(next);
    },

    async projectRegistrationStatus({ normalizedEmail, disabled }) {
      await deps.setRegistrationAccess(normalizedEmail, disabled ? 'disabled' : 'active');
    },
  };
}
