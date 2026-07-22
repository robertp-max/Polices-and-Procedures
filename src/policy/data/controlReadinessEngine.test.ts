import { describe, it, expect } from 'vitest';
import { deriveControlReadiness, type ControlReadinessInput } from './controlReadinessEngine';

const ready: ControlReadinessInput = {
  definitionApproved: true,
  applicable: true,
  hasRequiredDocs: true,
  hasEvidenceRequirements: true,
  hasSignoffRequirements: true,
  requiredDocsPresentAndCurrent: true,
  requiredEvidencePresentAndAccepted: true,
  anyRequiredEvidenceExpired: false,
  requiredVerificationComplete: true,
  verificationOverdue: false,
  requiredSignoffsComplete: true,
  openCriticalDeficiency: false,
  overdueRequiredAction: false,
  implementationComplete: true,
};

describe('controlReadinessEngine — deterministic, honest states', () => {
  it('fully complete → OK', () => {
    expect(deriveControlReadiness(ready).state).toBe('OK');
    expect(deriveControlReadiness(ready).legacy).toBe('OK');
  });
  it('not applicable → NOT_APPLICABLE', () => {
    expect(deriveControlReadiness({ ...ready, applicable: false }).state).toBe('NOT_APPLICABLE');
  });
  it('definition not approved → NOT_CONFIGURED', () => {
    expect(deriveControlReadiness({ ...ready, definitionApproved: false }).state).toBe('NOT_CONFIGURED');
  });
  it('requirements not configured → NOT_CONFIGURED', () => {
    expect(deriveControlReadiness({ ...ready, hasEvidenceRequirements: false }).state).toBe('NOT_CONFIGURED');
  });
  it('open critical deficiency → OPEN_CRITICAL_DEFICIENCY (blocked)', () => {
    const r = deriveControlReadiness({ ...ready, openCriticalDeficiency: true });
    expect(r.state).toBe('OPEN_CRITICAL_DEFICIENCY');
    expect(r.legacy).toBe('BLOCKED');
  });
  it('documentation not current → DOCUMENTATION_MISSING', () => {
    expect(deriveControlReadiness({ ...ready, requiredDocsPresentAndCurrent: false }).state).toBe('DOCUMENTATION_MISSING');
  });
  it('expired evidence → EVIDENCE_EXPIRED (blocked)', () => {
    expect(deriveControlReadiness({ ...ready, anyRequiredEvidenceExpired: true }).state).toBe('EVIDENCE_EXPIRED');
  });
  it('no accepted evidence → EVIDENCE_MISSING (blocked) — a blank template is never OK', () => {
    const r = deriveControlReadiness({ ...ready, requiredEvidencePresentAndAccepted: false });
    expect(r.state).toBe('EVIDENCE_MISSING');
    expect(r.legacy).toBe('BLOCKED');
  });
  it('sign-off pending → SIGNOFF_PENDING (blocked)', () => {
    expect(deriveControlReadiness({ ...ready, requiredSignoffsComplete: false }).state).toBe('SIGNOFF_PENDING');
  });
  it('verification overdue → VERIFICATION_OVERDUE (blocked)', () => {
    expect(deriveControlReadiness({ ...ready, verificationOverdue: true }).state).toBe('VERIFICATION_OVERDUE');
  });
  it('verification not yet done → READY_FOR_VERIFICATION', () => {
    expect(deriveControlReadiness({ ...ready, requiredVerificationComplete: false }).state).toBe('READY_FOR_VERIFICATION');
  });
});
