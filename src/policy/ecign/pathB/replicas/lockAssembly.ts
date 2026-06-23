/**
 * eCIgn Path B — Phase 2B: lock-eligibility assembly (pure).
 *
 * Locking requires canonical persistence + Drive parity + Evidence parity +
 * metadata attach + audit append — never a link alone. Reuses the Phase-1
 * `validateLockEligibilityMetadata` invariant; `locked` is terminal.
 */
import type { LockEligibilityMetadata, ReplicaParityRecord } from '../artifactContracts';
import type { ArtifactId, ArtifactVersionId, IsoTimestamp } from '../ids';
import { validateLockEligibilityMetadata, type ValidationResult } from '../validators';

export interface LockInputs {
  readonly artifactId: ArtifactId;
  readonly artifactVersionId: ArtifactVersionId;
  readonly canonicalPersistVerified: boolean;
  readonly driveParity: ReplicaParityRecord;
  readonly evidenceParity: ReplicaParityRecord;
  readonly metadataAttachComplete: boolean;
  readonly auditAppendComplete: boolean;
  readonly lockedAt: IsoTimestamp;
}

export function assembleLockEligibility(inputs: LockInputs): LockEligibilityMetadata {
  return {
    kind: 'locked',
    artifactId: inputs.artifactId,
    artifactVersionId: inputs.artifactVersionId,
    canonicalPersistVerified: inputs.canonicalPersistVerified,
    driveParity: inputs.driveParity,
    evidenceParity: inputs.evidenceParity,
    metadataAttachComplete: inputs.metadataAttachComplete,
    auditAppendComplete: inputs.auditAppendComplete,
    lockedAt: inputs.lockedAt,
  };
}

/** True-eligibility check for locking; returns the structured validation result. */
export function canLock(inputs: LockInputs): ValidationResult {
  return validateLockEligibilityMetadata(assembleLockEligibility(inputs));
}
