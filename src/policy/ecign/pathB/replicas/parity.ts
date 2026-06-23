/**
 * eCIgn Path B — Phase 2B: replica parity (EAGER, per-version).
 *
 * Per the approved "Option A" decision, each signed version is published to its
 * replicas as soon as it is frozen. Parity is proven by reading the replica back
 * and recomputing its sha256 server-side — a link/id alone is NEVER parity.
 */
import type { ReplicaParityRecord } from '../artifactContracts';
import type { ArtifactVersionId, DriveFileId, EvidenceRecordId, IsoTimestamp } from '../ids';
import { sha256Hex } from '../storage/hash';
import { ReplicaPublishError, type ReplicaPublisher } from './replicaPublisher';

export interface VerifyParityInput {
  readonly versionId: ArtifactVersionId;
  readonly canonicalSha256: string;
  /** Canonical bytes to replicate (read from the canonical store). */
  readonly bytes: Uint8Array;
  /** Injected timestamp (pure/deterministic). */
  readonly verifiedAt: IsoTimestamp;
}

/**
 * Publish canonical bytes to the replica, read them back, recompute the replica
 * sha, and produce a parity record. `verified` ONLY when the recomputed replica
 * sha equals the canonical sha; publish/permission failures yield `failed`.
 */
export function publishAndVerify(publisher: ReplicaPublisher, input: VerifyParityInput): ReplicaParityRecord {
  const base = {
    replicaKind: publisher.replicaKind,
    artifactVersionId: input.versionId,
    canonicalSha256: input.canonicalSha256,
    verifiedAt: input.verifiedAt,
  } as const;
  const refField = (ref: string) =>
    publisher.replicaKind === 'drive'
      ? { driveFileId: ref as DriveFileId }
      : { evidenceRecordId: ref as EvidenceRecordId };
  try {
    const { ref } = publisher.publish(input.versionId, input.bytes);
    const replicaSha256 = sha256Hex(publisher.readBack(input.versionId));
    if (replicaSha256 === input.canonicalSha256) {
      return { ...base, ...refField(ref), replicaSha256, status: 'verified' };
    }
    return { ...base, ...refField(ref), replicaSha256, status: 'mismatch', failureReason: 'sha_mismatch' };
  } catch (e) {
    const failureReason =
      e instanceof ReplicaPublishError && e.code === 'permission_denied' ? 'permission_denied' : 'replica_unreadable';
    return { ...base, status: 'failed', failureReason };
  }
}

export interface ReplicateResult {
  readonly driveParity: ReplicaParityRecord;
  readonly evidenceParity: ReplicaParityRecord;
}

/** Eager per-version replication to BOTH replicas (Drive + Evidence). */
export function replicateSignedVersion(
  drive: ReplicaPublisher,
  evidence: ReplicaPublisher,
  input: VerifyParityInput,
): ReplicateResult {
  return {
    driveParity: publishAndVerify(drive, input),
    evidenceParity: publishAndVerify(evidence, input),
  };
}
