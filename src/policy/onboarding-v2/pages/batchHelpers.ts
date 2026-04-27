import type { OnboardingExecutionBatch, RoleId } from '../types';

/** OnboardingExecutionBatch stores trigger details inside triggerPayload.
 *  These helpers extract role IDs and effective date safely from any trigger shape. */

export function batchRoleIds(b: OnboardingExecutionBatch): RoleId[] {
  const p = b.triggerPayload as Record<string, unknown>;
  if (Array.isArray(p['roleIds'])) return p['roleIds'] as RoleId[];
  if (Array.isArray(p['newRoleIds'])) return p['newRoleIds'] as RoleId[];
  if (Array.isArray(p['affectedRoles'])) return p['affectedRoles'] as RoleId[];
  if (typeof p['roleId'] === 'string') return [p['roleId'] as RoleId];
  return [];
}

export function batchEffective(b: OnboardingExecutionBatch): string | undefined {
  const p = b.triggerPayload as Record<string, unknown>;
  if (typeof p['effectiveDate'] === 'string') return p['effectiveDate'];
  return b.createdAt;
}
