/**
 * Care Indeed LMS — Wave 8: legacy migration from ci-journey-v1.
 *
 * Pure classification (architecture §21). Legacy browser records are untrusted
 * claims: no boolean-to-pass conversion, unknown modules are quarantined, a local
 * signature image is never a valid signoff, and `clearedForIndependentWork` never
 * creates a signed GateDecision. Reruns are idempotent (same input → same output).
 */

export type ImportState = 'MAPPED' | 'AMBIGUOUS' | 'QUARANTINED' | 'REJECTED';

export interface LegacyRecord {
  moduleId: string;
  moduleVersion?: string;
  scorePct?: number;
  hasValidatedEvidence?: boolean;
  scormInProgress?: boolean;
  localSignatureImage?: boolean; // a browser-drawn signature — NOT a valid signoff
  appendixFCleared?: boolean;
  clearedForIndependentWork?: boolean;
}

export interface ImportDecision {
  moduleId: string;
  state: ImportState;
  reasonCodes: string[];
  importAsProgressOnly: boolean;
  createsGateDecision: false; // migration NEVER creates a signed gate decision
  createsSignoff: boolean;
  producesHistoricalClaim: boolean;
}

const ALIAS_PREFIXES = ['CORE-', 'ROLE-'];

export function classifyLegacyRecord(record: LegacyRecord, knownModuleIds: Set<string>): ImportDecision {
  const reasons: string[] = [];
  const base = {
    moduleId: record.moduleId,
    createsGateDecision: false as const,
    createsSignoff: false,
    importAsProgressOnly: false,
    producesHistoricalClaim: false,
  };

  // Alias namespaces are not accepted as new canonical IDs (§21.2).
  if (ALIAS_PREFIXES.some((p) => record.moduleId.toUpperCase().startsWith(p))) {
    return { ...base, state: 'REJECTED', reasonCodes: ['ALIAS_NOT_CANONICAL'] };
  }

  // Unknown module IDs are quarantined for review (§21.2).
  if (!knownModuleIds.has(record.moduleId)) {
    return { ...base, state: 'QUARANTINED', reasonCodes: ['UNKNOWN_MODULE_ID'] };
  }

  // A local signature image is not a valid signoff.
  if (record.localSignatureImage) {
    reasons.push('LOCAL_SIGNATURE_NOT_VALID');
  }

  // In-progress SCORM imports as progress only — never completion.
  if (record.scormInProgress) {
    return { ...base, state: 'MAPPED', reasonCodes: [...reasons, 'SCORM_PROGRESS_ONLY'], importAsProgressOnly: true };
  }

  // clearedForIndependentWork never becomes a signed GateDecision (§21.2).
  if (record.clearedForIndependentWork) {
    reasons.push('CLEARANCE_CLAIM_REQUIRES_EVIDENCE');
  }
  // appendixFCleared becomes a historical claim pending evidence review.
  if (record.appendixFCleared) {
    reasons.push('APPENDIX_F_HISTORICAL_CLAIM');
  }
  if (record.clearedForIndependentWork || record.appendixFCleared) {
    return { ...base, state: 'AMBIGUOUS', reasonCodes: reasons, producesHistoricalClaim: true };
  }

  // Exact module id + version + score + valid evidence may be reconciled — but the
  // score is carried as data, never auto-converted into a PASS boolean.
  if (record.moduleVersion && record.scorePct !== undefined && record.hasValidatedEvidence) {
    return { ...base, state: 'MAPPED', reasonCodes: [...reasons, 'RECONCILABLE_WITH_EVIDENCE'] };
  }

  // Otherwise there is not enough to reconcile — ambiguous, needs review.
  return { ...base, state: 'AMBIGUOUS', reasonCodes: [...reasons, 'INSUFFICIENT_FOR_RECONCILIATION'] };
}

/** Reruns are idempotent: classifying the same input twice yields identical output. */
export function classifyBatch(records: LegacyRecord[], knownModuleIds: Set<string>): ImportDecision[] {
  return records.map((r) => classifyLegacyRecord(r, knownModuleIds));
}
