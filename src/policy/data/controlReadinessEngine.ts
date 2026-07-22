/* ═══════════════════════════════════════════════════════════════════════════
   CONTROL READINESS ENGINE (P4) — one deterministic source of readiness truth.
   ----------------------------------------------------------------------------
   Pure function over the full operational contract. Every screen/report must
   consume this — no surface may compute its own readiness. A control is OK ONLY
   when it is genuinely complete; a blank template / metadata-only definition /
   self-declared "compliant" status NEVER counts as executed evidence.

   The rich `ControlReadinessState` is a superset of the legacy 5-value UI status
   (`MasterControlReadinessStatus`); `legacy` maps down so existing consumers keep
   working while the operational states drive the new dossier/reports.
   ═══════════════════════════════════════════════════════════════════════════ */
import type { MasterControlReadinessStatus } from '@/policy/types/masterControlInventory';

export type ControlReadinessState =
  | 'NOT_APPLICABLE'
  | 'NOT_CONFIGURED'
  | 'DOCUMENTATION_MISSING'
  | 'OPEN_CRITICAL_DEFICIENCY'
  | 'EVIDENCE_EXPIRED'
  | 'EVIDENCE_MISSING'
  | 'SIGNOFF_PENDING'
  | 'VERIFICATION_OVERDUE'
  | 'READY_FOR_VERIFICATION'
  | 'BLOCKED'
  | 'NEEDS_ATTENTION'
  | 'OK';

export interface ControlReadinessInput {
  /** Definition state must be APPROVED. */
  definitionApproved: boolean;
  /** Applicability decision — false = explicitly NOT_APPLICABLE. */
  applicable: boolean;
  /** Requirements configured at all (definition completeness). */
  hasRequiredDocs: boolean;
  hasEvidenceRequirements: boolean;
  hasSignoffRequirements: boolean;
  /** Documentation: every required doc present + APPROVED body. */
  requiredDocsPresentAndCurrent: boolean;
  /** Evidence: every required artifact present + accepted + not expired. */
  requiredEvidencePresentAndAccepted: boolean;
  anyRequiredEvidenceExpired: boolean;
  /** Verification: required verification complete + not overdue. */
  requiredVerificationComplete: boolean;
  verificationOverdue: boolean;
  /** Sign-offs: all required executed. */
  requiredSignoffsComplete: boolean;
  /** Deficiencies / actions. */
  openCriticalDeficiency: boolean;
  overdueRequiredAction: boolean;
  /** Implementation. */
  implementationComplete: boolean;
}

export interface ControlReadinessResult {
  state: ControlReadinessState;
  legacy: MasterControlReadinessStatus;
  blockers: string[];
}

const LEGACY: Record<ControlReadinessState, MasterControlReadinessStatus> = {
  NOT_APPLICABLE: 'NOT_CONFIGURED',
  NOT_CONFIGURED: 'NOT_CONFIGURED',
  DOCUMENTATION_MISSING: 'DOCUMENTATION_MISSING',
  OPEN_CRITICAL_DEFICIENCY: 'BLOCKED',
  EVIDENCE_EXPIRED: 'BLOCKED',
  EVIDENCE_MISSING: 'BLOCKED',
  SIGNOFF_PENDING: 'BLOCKED',
  VERIFICATION_OVERDUE: 'BLOCKED',
  READY_FOR_VERIFICATION: 'NEEDS_ATTENTION',
  BLOCKED: 'BLOCKED',
  NEEDS_ATTENTION: 'NEEDS_ATTENTION',
  OK: 'OK',
};

/** Deterministic readiness. Ordered from hardest blocker to OK. */
export function deriveControlReadiness(i: ControlReadinessInput): ControlReadinessResult {
  const blockers: string[] = [];
  const done = (state: ControlReadinessState): ControlReadinessResult => ({ state, legacy: LEGACY[state], blockers });

  if (!i.applicable) return done('NOT_APPLICABLE');
  if (!i.definitionApproved) { blockers.push('Control definition is not APPROVED'); return done('NOT_CONFIGURED'); }
  if (!i.hasRequiredDocs || !i.hasEvidenceRequirements || !i.hasSignoffRequirements) {
    blockers.push('Documentation, evidence, or sign-off requirements not fully configured');
    return done('NOT_CONFIGURED');
  }
  if (i.openCriticalDeficiency) { blockers.push('Open critical/high deficiency'); return done('OPEN_CRITICAL_DEFICIENCY'); }
  if (!i.requiredDocsPresentAndCurrent) { blockers.push('Required documentation missing or not current/approved'); return done('DOCUMENTATION_MISSING'); }
  if (i.anyRequiredEvidenceExpired) { blockers.push('Required evidence expired'); return done('EVIDENCE_EXPIRED'); }
  if (!i.requiredEvidencePresentAndAccepted) { blockers.push('Required evidence missing or not accepted'); return done('EVIDENCE_MISSING'); }
  if (!i.requiredSignoffsComplete) { blockers.push('Required sign-off pending'); return done('SIGNOFF_PENDING'); }
  if (i.verificationOverdue) { blockers.push('Verification overdue'); return done('VERIFICATION_OVERDUE'); }
  if (!i.requiredVerificationComplete) return done('READY_FOR_VERIFICATION');
  if (!i.implementationComplete) { blockers.push('Implementation incomplete'); return done('NEEDS_ATTENTION'); }
  if (i.overdueRequiredAction) { blockers.push('Overdue required action'); return done('NEEDS_ATTENTION'); }
  return done('OK');
}
