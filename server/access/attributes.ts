/**
 * ABAC predicates and constraint evaluators
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure functions used by the PDP after RBAC permission resolution.
 */
import type { AccessRequest } from './pdp.js';

export interface ConstraintViolation {
  predicate: string;
  reason: string;
}

/** Evaluate the standard ABAC predicates against an AccessRequest. */
export function evaluateAbac(req: AccessRequest): ConstraintViolation[] {
  const violations: ConstraintViolation[] = [];
  const ra = req.resource_attributes ?? {};
  const a = req.actor;

  // Branch scope: if resource declares a branch, actor must include it.
  const resBranch = ra.branch as string | undefined;
  if (resBranch && a.attributes.branches.length > 0) {
    if (!a.attributes.branches.includes(resBranch)) {
      violations.push({
        predicate: 'subject.scope.branch ∈ user.attributes.branches',
        reason: `actor not in branch ${resBranch}`,
      });
    }
  }

  // Service line scope.
  const resSL = ra.service_line as string | undefined;
  if (resSL && a.attributes.service_lines.length > 0) {
    if (!a.attributes.service_lines.includes(resSL)) {
      violations.push({
        predicate: 'subject.service_line ∈ user.attributes.service_lines',
        reason: `actor not in service line ${resSL}`,
      });
    }
  }

  // Self-action exclusion when resource declares an owner_user_id and the
  // request is a sensitive verb. SoD covers most cases; this is a defensive
  // catch-all.
  const ownerId = ra.owner_user_id as string | undefined;
  const sensitive = new Set(['approve', 'sign', 'countersign', 'override', 'attest']);
  if (sensitive.has(req.action) && ownerId && a.user_id && ownerId === a.user_id) {
    violations.push({
      predicate: 'resource.owner_user_id != user.user_id (sensitive action)',
      reason: 'self_action_on_owned_resource',
    });
  }

  // PHI gating
  if (req.action === 'view' || req.action === 'export' || req.action === 'phi_access' ||
      req.resource.type === 'PHIRecord' || ra.contains_phi === true) {
    if (ra.contains_phi === true && !a.mfa_enrolled) {
      violations.push({ predicate: 'mfa required for PHI', reason: 'mfa_not_enrolled' });
    }
    if (ra.contains_phi === true && (req.environment?.auth_age_seconds ?? 0) > 30 * 60) {
      violations.push({ predicate: 'session.auth_age <= 30m for PHI', reason: 'step_up_required' });
    }
  }

  // Step-up for sensitive actions
  const stepUpActions = new Set(['approve', 'sign', 'countersign', 'override', 'export', 'publish']);
  if (stepUpActions.has(req.action) && (req.environment?.auth_age_seconds ?? 0) > 5 * 60) {
    violations.push({ predicate: 'auth_age <= 5m for sensitive actions', reason: 'step_up_required' });
  }

  return violations;
}
