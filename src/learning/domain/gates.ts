/**
 * Care Indeed LMS — Wave 5: gate engine.
 *
 * Pure evaluation of a versioned Boolean rule tree over a state vector
 * (architecture §10). Produces an unsigned decision; the caller signs the
 * stateVectorSha256 with the Cloud KMS Signer port (ADR-005). Overrides never
 * mutate the underlying failure (§10.4).
 */
import type { AssignmentStatus, GateOutcome, GateType, VersionRef } from './types';
import { canonicalJson, sha256Hex } from './hash';

export type GateRule =
  | { kind: 'ASSIGNMENT_STATUS'; assignmentSelector: string; allowed: AssignmentStatus[] }
  | { kind: 'GRADE_OUTCOME'; assignmentSelector: string; allowed: string[] }
  | { kind: 'EVIDENCE_VALID'; evidenceSpecRef: VersionRef }
  | { kind: 'SIGNOFF_PRESENT'; signerSlot: string; distinctHumanGroup?: string }
  | { kind: 'ACCUMULATED_VALUE'; ledgerType: string; minimum: number; unit: string }
  | { kind: 'NO_OPEN_REMEDIATION'; scope: string }
  | { kind: 'CREDENTIAL_CURRENT'; credentialType: string }
  | { kind: 'NO_ACTIVE_HOLD'; holdType: string };

export interface GateDefinition {
  id: string;
  version: number;
  gateType: GateType;
  allOf: GateRule[];
  anyOf?: GateRule[];
  effectiveFrom: string;
  status: 'DRAFT' | 'PUBLISHED' | 'RETIRED';
}

/** Facts the gate evaluates against — assembled server-side from the record store. */
export interface GateStateVector {
  assignmentStatuses: Record<string, AssignmentStatus>; // selector -> status
  gradeOutcomes: Record<string, string>; // selector -> outcome
  validEvidenceSpecIds: Set<string>; // evidenceSpecRef.id present & VALID
  presentSignoffSlots: Set<string>; // slots with an APPROVE signoff (distinct-human already enforced)
  ledgerTotals: Record<string, number>; // ledgerType -> accepted total
  openRemediationScopes: Set<string>;
  currentCredentials: Set<string>;
  activeHolds: Set<string>;
}

function evaluateRule(rule: GateRule, s: GateStateVector): { pass: boolean; reason: string } {
  switch (rule.kind) {
    case 'ASSIGNMENT_STATUS': {
      const st = s.assignmentStatuses[rule.assignmentSelector];
      const pass = st !== undefined && rule.allowed.includes(st);
      return { pass, reason: pass ? '' : `ASSIGNMENT_STATUS:${rule.assignmentSelector}=${st ?? 'MISSING'}` };
    }
    case 'GRADE_OUTCOME': {
      const g = s.gradeOutcomes[rule.assignmentSelector];
      const pass = g !== undefined && rule.allowed.includes(g);
      return { pass, reason: pass ? '' : `GRADE_OUTCOME:${rule.assignmentSelector}=${g ?? 'MISSING'}` };
    }
    case 'EVIDENCE_VALID': {
      const pass = s.validEvidenceSpecIds.has(rule.evidenceSpecRef.id);
      return { pass, reason: pass ? '' : `EVIDENCE_MISSING:${rule.evidenceSpecRef.id}` };
    }
    case 'SIGNOFF_PRESENT': {
      const pass = s.presentSignoffSlots.has(rule.signerSlot);
      return { pass, reason: pass ? '' : `SIGNOFF_MISSING:${rule.signerSlot}` };
    }
    case 'ACCUMULATED_VALUE': {
      const total = s.ledgerTotals[rule.ledgerType] ?? 0;
      const pass = total >= rule.minimum;
      return { pass, reason: pass ? '' : `ACCUMULATED_SHORT:${rule.ledgerType}=${total}/${rule.minimum}${rule.unit}` };
    }
    case 'NO_OPEN_REMEDIATION': {
      const pass = !s.openRemediationScopes.has(rule.scope);
      return { pass, reason: pass ? '' : `OPEN_REMEDIATION:${rule.scope}` };
    }
    case 'CREDENTIAL_CURRENT': {
      const pass = s.currentCredentials.has(rule.credentialType);
      return { pass, reason: pass ? '' : `CREDENTIAL_NOT_CURRENT:${rule.credentialType}` };
    }
    case 'NO_ACTIVE_HOLD': {
      const pass = !s.activeHolds.has(rule.holdType);
      return { pass, reason: pass ? '' : `ACTIVE_HOLD:${rule.holdType}` };
    }
    default:
      return { pass: false, reason: 'UNKNOWN_RULE' };
  }
}

/** Stable SHA-256 fingerprint of the evaluated state vector. */
export function stateVectorFingerprint(s: GateStateVector): string {
  const canonical = canonicalJson({
    a: s.assignmentStatuses,
    g: s.gradeOutcomes,
    e: [...s.validEvidenceSpecIds].sort(),
    so: [...s.presentSignoffSlots].sort(),
    l: s.ledgerTotals,
    r: [...s.openRemediationScopes].sort(),
    c: [...s.currentCredentials].sort(),
    h: [...s.activeHolds].sort(),
  });
  return `sv_${sha256Hex(canonical)}`;
}

export interface GateEvaluation {
  outcome: GateOutcome;
  reasonCodes: string[];
  stateVectorFingerprint: string;
}

/**
 * Evaluates the rule tree. allOf must all pass; when anyOf is present at least one
 * must pass. A published, active override converts a FAIL to CONDITIONAL without
 * changing the recorded failure reasons.
 */
export function evaluateGate(
  def: GateDefinition,
  state: GateStateVector,
  hasActiveOverride = false,
): GateEvaluation {
  const reasons: string[] = [];
  for (const rule of def.allOf) {
    const r = evaluateRule(rule, state);
    if (!r.pass) reasons.push(r.reason);
  }
  if (def.anyOf && def.anyOf.length > 0) {
    const anyPass = def.anyOf.some((rule) => evaluateRule(rule, state).pass);
    if (!anyPass) reasons.push('ANY_OF_UNSATISFIED');
  }

  const fingerprint = stateVectorFingerprint(state);
  if (reasons.length === 0) return { outcome: 'PASS', reasonCodes: [], stateVectorFingerprint: fingerprint };
  if (hasActiveOverride) return { outcome: 'CONDITIONAL', reasonCodes: reasons, stateVectorFingerprint: fingerprint };
  return { outcome: 'FAIL', reasonCodes: reasons, stateVectorFingerprint: fingerprint };
}

/** Downstream consumers accept only a signed, non-stale PASS (§10.2). */
export function acceptGateForConsumption(input: {
  outcome: GateOutcome;
  signature: string;
  currentStateFingerprint: string;
  decisionStateFingerprint: string;
  expiresAt?: string;
  now: Date;
}): { accepted: boolean; reason?: string } {
  if (input.outcome !== 'PASS') return { accepted: false, reason: 'NOT_PASS' };
  if (!input.signature) return { accepted: false, reason: 'UNSIGNED' };
  if (input.currentStateFingerprint !== input.decisionStateFingerprint) return { accepted: false, reason: 'STALE_STATE' };
  if (input.expiresAt && new Date(input.expiresAt).getTime() < input.now.getTime()) return { accepted: false, reason: 'EXPIRED' };
  return { accepted: true };
}
