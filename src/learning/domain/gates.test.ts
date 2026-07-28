import { describe, it, expect } from 'vitest';
import {
  acceptGateForConsumption,
  evaluateGate,
  stateVectorFingerprint,
  type GateDefinition,
  type GateStateVector,
} from './gates';

const now = new Date('2026-07-27T00:00:00.000Z');

function emptyState(over: Partial<GateStateVector> = {}): GateStateVector {
  return {
    assignmentStatuses: {},
    gradeOutcomes: {},
    validEvidenceSpecIds: new Set(),
    presentSignoffSlots: new Set(),
    ledgerTotals: {},
    openRemediationScopes: new Set(),
    currentCredentials: new Set(),
    activeHolds: new Set(),
    ...over,
  };
}

const fieldClearance: GateDefinition = {
  id: 'GATE-HHA-FIELD',
  version: 1,
  gateType: 'FIELD_CLEARANCE',
  status: 'PUBLISHED',
  effectiveFrom: '2026-01-01T00:00:00.000Z',
  allOf: [
    { kind: 'ASSIGNMENT_STATUS', assignmentSelector: 'GAO', allowed: ['COMPLETED'] },
    { kind: 'GRADE_OUTCOME', assignmentSelector: 'HHA-SUP', allowed: ['PASSED'] },
    { kind: 'EVIDENCE_VALID', evidenceSpecRef: { id: 'EV-SUP-VISIT', version: 1 } },
    { kind: 'SIGNOFF_PRESENT', signerSlot: 'rn-clearance', distinctHumanGroup: 'clinical' },
    { kind: 'ACCUMULATED_VALUE', ledgerType: 'HHA_INSERVICE_HOUR', minimum: 12, unit: 'h' },
    { kind: 'NO_OPEN_REMEDIATION', scope: 'hha' },
    { kind: 'CREDENTIAL_CURRENT', credentialType: 'HHA_CERT' },
    { kind: 'NO_ACTIVE_HOLD', holdType: 'training' },
  ],
};

const passingState = () =>
  emptyState({
    assignmentStatuses: { GAO: 'COMPLETED' },
    gradeOutcomes: { 'HHA-SUP': 'PASSED' },
    validEvidenceSpecIds: new Set(['EV-SUP-VISIT']),
    presentSignoffSlots: new Set(['rn-clearance']),
    ledgerTotals: { HHA_INSERVICE_HOUR: 12 },
    currentCredentials: new Set(['HHA_CERT']),
  });

describe('gate evaluation over a rule tree', () => {
  it('PASS when every allOf rule is satisfied', () => {
    const e = evaluateGate(fieldClearance, passingState());
    expect(e.outcome).toBe('PASS');
    expect(e.reasonCodes).toHaveLength(0);
  });

  it('FAIL with reason codes when a rule is unmet', () => {
    const s = passingState();
    s.ledgerTotals.HHA_INSERVICE_HOUR = 6;
    s.currentCredentials.delete('HHA_CERT');
    const e = evaluateGate(fieldClearance, s);
    expect(e.outcome).toBe('FAIL');
    expect(e.reasonCodes).toContain('ACCUMULATED_SHORT:HHA_INSERVICE_HOUR=6/12h');
    expect(e.reasonCodes).toContain('CREDENTIAL_NOT_CURRENT:HHA_CERT');
  });

  it('an active override converts FAIL to CONDITIONAL without hiding the reasons', () => {
    const s = passingState();
    s.activeHolds.add('training');
    const e = evaluateGate(fieldClearance, s, true);
    expect(e.outcome).toBe('CONDITIONAL');
    expect(e.reasonCodes).toContain('ACTIVE_HOLD:training');
  });

  it('anyOf requires at least one branch', () => {
    const def: GateDefinition = { ...fieldClearance, allOf: [], anyOf: [{ kind: 'NO_ACTIVE_HOLD', holdType: 'x' }] };
    expect(evaluateGate(def, emptyState()).outcome).toBe('PASS');
    expect(evaluateGate(def, emptyState({ activeHolds: new Set(['x']) })).reasonCodes).toContain('ANY_OF_UNSATISFIED');
  });
});

describe('downstream consumption of a gate decision', () => {
  const fp = stateVectorFingerprint(passingState());
  it('accepts only a signed, non-stale, non-expired PASS', () => {
    expect(acceptGateForConsumption({ outcome: 'PASS', signature: 'kms:s', currentStateFingerprint: fp, decisionStateFingerprint: fp, now }).accepted).toBe(true);
    expect(acceptGateForConsumption({ outcome: 'FAIL', signature: 'kms:s', currentStateFingerprint: fp, decisionStateFingerprint: fp, now })).toEqual({ accepted: false, reason: 'NOT_PASS' });
    expect(acceptGateForConsumption({ outcome: 'PASS', signature: '', currentStateFingerprint: fp, decisionStateFingerprint: fp, now })).toEqual({ accepted: false, reason: 'UNSIGNED' });
    expect(acceptGateForConsumption({ outcome: 'PASS', signature: 'kms:s', currentStateFingerprint: 'DIFFERENT', decisionStateFingerprint: fp, now })).toEqual({ accepted: false, reason: 'STALE_STATE' });
    expect(acceptGateForConsumption({ outcome: 'PASS', signature: 'kms:s', currentStateFingerprint: fp, decisionStateFingerprint: fp, expiresAt: '2000-01-01T00:00:00.000Z', now })).toEqual({ accepted: false, reason: 'EXPIRED' });
  });
});
