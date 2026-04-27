import type {
  GateEvaluation, GateId, GateOutcome, OnboardingSnapshot, RoleRequirement,
} from '../types';
import { REQUIREMENTS } from '../catalog/requirements';
import { appendAudit } from './audit';
import { nextUlid } from './hash';

export interface GateResult {
  gateId: GateId;
  outcome: GateOutcome;
  reasons: string[];
  missingRequirementIds: string[];
}

/** Read-only computation: does the subject pass the named gate today? */
export function evaluateGate(
  snap: OnboardingSnapshot,
  subjectId: string,
  gateId: GateId,
  caller = 'engine',
  now: string = new Date().toISOString(),
): GateResult {
  const required = REQUIREMENTS.filter(r => r.gateContributions.some(g => g.gateId === gateId && g.weight === 'Required'));
  const subjectUnits = snap.units.filter(u => snap.batches.find(b => b.id === u.batchId)?.subjectId === subjectId);

  const missing: RoleRequirement[] = [];
  const reasons: string[] = [];
  for (const req of required) {
    const unit = subjectUnits.find(u => u.requirementId === req.id);
    if (!unit) continue;                              // requirement not in scope for this subject
    if (unit.status !== 'Completed' && unit.status !== 'Suppressed') {
      missing.push(req);
      reasons.push(`${req.id} ${unit.status}`);
    }
  }

  // Active override check
  const activeOverride = snap.overrides.find(o =>
    o.subjectId === subjectId && o.gateOrRuleId === gateId && o.status === 'Active' &&
    o.validFrom <= now && o.validTo >= now);

  const outcome: GateOutcome = activeOverride
    ? 'Conditional'
    : missing.length === 0 ? 'Pass' : 'Fail';

  // Persist GateEvaluation + audit
  const inputs = {
    unitIds: subjectUnits.map(u => u.id),
    evidenceIds: subjectUnits.flatMap(u => u.evidenceObjectIds),
  };
  const evalRecord: GateEvaluation = {
    id: nextUlid('GE'),
    gateId, subjectId, evaluatedAt: now,
    outcome, reasons, caller, inputs,
  };
  snap.gateEvaluations.push(evalRecord);
  appendAudit(snap, {
    eventType: 'GATE_EVALUATED', subjectId,
    payload: { gateId, outcome, reasons, caller, override: activeOverride?.id ?? null },
  }, now);

  return { gateId, outcome, reasons, missingRequirementIds: missing.map(m => m.id) };
}

export const GATE_LABEL: Record<GateId, string> = {
  FieldClearance:        'Field Clearance',
  BillingClearance:      'Billing Clearance',
  SystemAccessClearance: 'System Access Clearance',
  VendorEngagement:      'Vendor Engagement',
  GovernanceActive:      'Governance Active',
};
