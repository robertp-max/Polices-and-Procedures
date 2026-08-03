// Builds the official compliance evidence payload for a completed tabletop
// attempt and commits it through the shared complianceStore. If the
// compliance evidence service is disconnected, commitEvidence's own contract
// applies: nothing is recorded as official completion (see
// ../../compliance/complianceEvidenceAdapter.ts) — this module never works
// around that; it only assembles the payload faithfully.

import { commitEvidence } from '../../compliance/complianceStore';
import type { EvidenceSaveResult } from '../../compliance/complianceEvidenceAdapter';
import { COMPLIANCE_EVIDENCE_SCHEMA_VERSION, type ComplianceRole, type RemediationPath } from '../../compliance/complianceTypes';
import {
  isPrivilegedAccessMode,
  type TabletopAccessMode,
} from '../../compliance/accessMode';
import { integrityHash } from '../../assessments/assessmentUtils';
import { TOTAL_POSSIBLE_SCORE, type AttemptScore, type AttemptSelections, type CasePack } from './caseTypes';

export interface EvidenceSnapshotInput {
  learnerId: string;
  assignmentId: string;
  role: ComplianceRole;
  casePack: CasePack;
  attemptNumber: number;
  selections: AttemptSelections;
  score: AttemptScore;
  activeTimeSeconds: number;
  attestedAt: string | null;
  remediationPath: RemediationPath;
  /** Immutable access tier resolved from the authenticated session. */
  accessMode: TabletopAccessMode;
  /** Authenticated actor subject, distinct from any namespaced participant id. */
  authenticatedSubjectId: string;
  /** Defaults to casePack.sourceCutoff when omitted. */
  sourceVersion?: string | null;
  /** Defaults to now() when omitted. */
  completedAtIso?: string;
}

/**
 * Assembles the answers snapshot + score + attempt metadata into the shape
 * the compliance evidence service expects, then commits it. Returns the
 * service's result untouched so callers can render the disconnected-preview
 * state exactly as complianceEvidenceAdapter defines it.
 */
export async function commitTabletopEvidence(input: EvidenceSnapshotInput): Promise<EvidenceSaveResult> {
  const answersSnapshot = {
    nodeSelections: input.selections.nodeSelections,
    surveyorSelections: input.selections.surveyorSelections,
    transferSelections: input.selections.transferSelections,
    injectsAcknowledged: input.selections.injectsAcknowledged,
    casePackId: input.casePack.id,
    quarter: input.casePack.quarter,
  };

  const payloadCore = {
    schemaVersion: COMPLIANCE_EVIDENCE_SCHEMA_VERSION,
    assignmentId: input.assignmentId,
    learnerId: input.learnerId,
    role: input.role,
    sourceId: input.casePack.id,
    sourceType: 'tabletop' as const,
    sourceVersion: input.sourceVersion ?? input.casePack.sourceCutoff,
    effectiveDate: input.casePack.sourceCutoff,
    readCompletedAt: null,
    attestedAt: input.attestedAt,
    answersSnapshot,
    // Raw engine score in the ENGINE'S OWN unit (points of 1000) + the
    // engine-decided outcome and the exact threshold it applied. The outcome —
    // not the raw number — is what completion selectors require, so a failed
    // attempt is preserved as evidence/remediation history without ever
    // counting as complete.
    score: input.score.total,
    scoreMaximum: TOTAL_POSSIBLE_SCORE,
    passThreshold: input.casePack.passScore,
    scoreScale: 'points_1000' as const,
    outcome: input.score.passed ? ('passed' as const) : ('failed' as const),
    criticalErrors: input.score.criticalErrors,
    attemptNumber: input.attemptNumber,
    remediationPath: input.remediationPath,
    activeTimeSeconds: input.activeTimeSeconds,
    completedAt: input.completedAtIso ?? new Date().toISOString(),
    privilegedAccessMode: isPrivilegedAccessMode(input.accessMode) ? input.accessMode : null,
  };

  const hash = integrityHash(payloadCore);

  // EvidenceSaveInput's declared type omits integrityHash; the evidence
  // service is expected to stamp its own. We still compute and attach it
  // here as a client-side fingerprint of what was submitted, bypassing the
  // excess-property check via `as never` per the shared adapter contract.
  // The learner id here comes from the session's authenticated identity —
  // commitEvidence re-checks it against the same subject.
  return commitEvidence(input.assignmentId, { ...payloadCore, integrityHash: hash } as never, {
    authenticatedSubjectId: input.authenticatedSubjectId,
    accessMode: input.accessMode,
  });
}
