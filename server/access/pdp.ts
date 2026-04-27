/**
 * Policy Decision Point (PDP)
 * ─────────────────────────────────────────────────────────────────────────────
 * Pure function over (Actor, Action, Resource, Environment) → Decision.
 * No I/O. Inputs are gathered by the PEP middleware via PIP loaders.
 *
 * Implements:
 *   - RBAC permission resolution from `bundles.ts`.
 *   - SoD rules from `sod.ts` (hard fail).
 *   - ABAC predicates from `attributes.ts` (hard fail unless `step_up_required`,
 *     which surfaces as a typed deny reason for the UI to handle).
 *   - Default-deny.
 *   - Always returns a structured decision with reason codes.
 */
import { ACCESS_POLICY_VERSION, effectivePermissions } from './bundles.js';
import { SOD_RULES } from './sod.js';
import { evaluateAbac } from './attributes.js';
import type { Actor } from '../identity/session.js';

export interface AccessRequest {
  actor: Actor;
  permission: string; // "<resource_type>:<action>"
  action: string;
  resource: { type: string; id: string };
  resource_attributes?: Record<string, unknown>;
  environment?: {
    ip?: string;
    user_agent?: string;
    auth_age_seconds?: number;
    device_id?: string;
  };
}

export type Decision = 'permit' | 'deny';

export interface AccessDecision {
  decision: Decision;
  reason: string;            // closed-set reason code
  detail?: string;           // human-readable explanation (audited)
  policy_version: number;
  matched_role?: string;
  sod_violations?: string[];
  abac_violations?: string[];
}

export function decide(req: AccessRequest): AccessDecision {
  const policy_version = ACCESS_POLICY_VERSION;

  // 0. Authentication check (via actor type)
  if (req.actor.type === 'system' && req.actor.service_id === 'anonymous') {
    return { decision: 'deny', reason: 'not_authenticated', policy_version };
  }

  // 1. RBAC: do any of the actor's roles grant this permission?
  const perms = effectivePermissions(req.actor.roles);
  const [rt, act] = req.permission.split(':');
  const wildcard = `${rt}:*`;
  if (!perms.has(req.permission) && !perms.has(wildcard)) {
    return {
      decision: 'deny',
      reason: 'not_authorized',
      detail: `no role grants ${req.permission}`,
      policy_version,
    };
  }

  // 2. SoD rules (hard fail)
  const sod_violations: string[] = [];
  for (const rule of SOD_RULES) {
    if (!rule.applies_to(req)) continue;
    const v = rule.evaluate(req);
    if (v) sod_violations.push(`${rule.id}:${v}`);
  }
  if (sod_violations.length > 0) {
    return {
      decision: 'deny',
      reason: 'sod_violation',
      detail: sod_violations.join('; '),
      sod_violations,
      policy_version,
    };
  }

  // 3. ABAC predicates
  const abac = evaluateAbac(req);
  if (abac.length > 0) {
    // Differentiate step-up from hard deny
    const stepUp = abac.find(v => v.reason === 'step_up_required' || v.reason === 'mfa_not_enrolled');
    return {
      decision: 'deny',
      reason: stepUp ? stepUp.reason : 'abac_violation',
      detail: abac.map(v => `${v.predicate}: ${v.reason}`).join('; '),
      abac_violations: abac.map(v => v.reason),
      policy_version,
    };
  }

  return { decision: 'permit', reason: 'allowed', policy_version, matched_role: req.actor.roles[0] };
}

// Re-export action verbs as a closed set (mirrors documents 01 / 03)
export const CANONICAL_ACTIONS = new Set([
  'view', 'list', 'search', 'export', 'create', 'update', 'withdraw',
  'assign', 'reassign', 'approve', 'sign', 'countersign', 'reject',
  'override', 'revoke', 'suppress', 'activate', 'deactivate',
  'acknowledge', 'attest', 'dispatch', 'ingest', 'replay', 'audit',
  'authenticate', 'session_start', 'session_end', 'access_decision', 'phi_access',
  'finalize', 'request', 'engage', 'execute', 'publish', 'evaluate',
]);
