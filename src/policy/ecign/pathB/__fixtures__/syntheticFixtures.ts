/**
 * eCIgn Path B — Phase 1 SYNTHETIC fixtures.
 *
 * TRAINING/TEST DATA ONLY. Contains NO real patient/staff data, NO real form
 * contents, NO signature images, NO PHI. Hashes/byte lengths are tiny synthetic
 * descriptors. Never reads server/ecign/data/*.jsonl. Used only by contract tests.
 */
import type { ECIgnPermissionRole, SignerRole } from '../../types';
import type { ProductionSignerTier } from '../../signerAuthority';
import type {
  ArtifactFamily,
  CanonicalStorageLocator,
  LockEligibilityMetadata,
  PresentedArtifactVersion,
  ReplicaParityRecord,
  RetentionContract,
  SignedArtifactVersion,
} from '../artifactContracts';
import { CANONICAL_ARTIFACT_KIND } from '../artifactContracts';
import { CANONICAL_ARTIFACT_MIME } from '../ids';
import type {
  ArtifactId,
  ArtifactVersionId,
  AuditChainId,
  EventId,
  EvidenceRecordId,
  DriveFileId,
  FormId,
  FormInstanceId,
  HierarchySnapshotId,
  IdempotencyKey,
  IsoTimestamp,
  PolicyId,
  RetentionPolicyId,
  SignerId,
} from '../ids';
import type { AuditEnvelope } from '../auditContracts';
import type { HierarchySnapshot } from '../hierarchySnapshot';

export const TRAINING_MARKER = 'TRAINING/TEST — SYNTHETIC NON-PHI FIXTURE' as const;

const SHA_PRESENTED_1 = 'a'.repeat(64);
const SHA_SIGNED_1 = 'b'.repeat(64);
const SHA_SIGNED_2 = 'c'.repeat(64);
const TS = '2026-06-22T13:31:29.000Z' as IsoTimestamp;

function merge<T>(base: T, over?: Partial<T>): T {
  return over ? { ...base, ...over } : base;
}

export function makeCanonicalLocator(over?: Partial<CanonicalStorageLocator>): CanonicalStorageLocator {
  return merge<CanonicalStorageLocator>({ store: 'canonical', ref: 'canonical://train/artifact/AVP-1' }, over);
}

export function makeArtifactFamily(over?: Partial<ArtifactFamily>): ArtifactFamily {
  return merge<ArtifactFamily>(
    {
      artifactId: 'ART-TRAIN-1' as ArtifactId,
      formId: 'GV-FM-003' as FormId,
      formInstanceId: 'FI-TRAIN-1' as FormInstanceId,
      eventId: 'EV-TRAIN-1' as EventId,
      policyId: 'GV-COI-003' as PolicyId,
      artifactKind: CANONICAL_ARTIFACT_KIND,
      mimeType: CANONICAL_ARTIFACT_MIME,
      signerHierarchySnapshotId: 'HS-TRAIN-1' as HierarchySnapshotId,
      retentionPolicyId: 'RP-TRAIN-1' as RetentionPolicyId,
      createdAt: TS,
      createdBy: 'USER-TRAIN-OWNER' as SignerId,
    },
    over,
  );
}

export function makePresented(over?: Partial<PresentedArtifactVersion>): PresentedArtifactVersion {
  return merge<PresentedArtifactVersion>(
    {
      kind: 'presented',
      artifactId: 'ART-TRAIN-1' as ArtifactId,
      formInstanceId: 'FI-TRAIN-1' as FormInstanceId,
      presentationArtifactVersionId: 'AVP-1' as ArtifactVersionId,
      derivedFromSignedVersionId: null,
      canonicalStorageLocator: makeCanonicalLocator(),
      sha256: SHA_PRESENTED_1,
      byteLength: 2048,
      mimeType: CANONICAL_ARTIFACT_MIME,
      presentedAt: TS,
      presentedToSignerId: 'USER-TRAIN-1' as SignerId,
      signerTier: 1 as ProductionSignerTier,
      signerHierarchySnapshotId: 'HS-TRAIN-1' as HierarchySnapshotId,
    },
    over,
  );
}

export function makeSigned(over?: Partial<SignedArtifactVersion>): SignedArtifactVersion {
  return merge<SignedArtifactVersion>(
    {
      kind: 'signed',
      artifactId: 'ART-TRAIN-1' as ArtifactId,
      formInstanceId: 'FI-TRAIN-1' as FormInstanceId,
      artifactVersionId: 'AVS-1' as ArtifactVersionId,
      presentedArtifactVersionId: 'AVP-1' as ArtifactVersionId,
      previousSignedArtifactVersionId: null,
      signerId: 'USER-TRAIN-1' as SignerId,
      signerRole: 'Compliance Officer' as SignerRole,
      signerTier: 1 as ProductionSignerTier,
      signatureSequence: 1,
      canonicalStorageLocator: makeCanonicalLocator({ ref: 'canonical://train/artifact/AVS-1' }),
      sha256: SHA_SIGNED_1,
      byteLength: 2100,
      mimeType: CANONICAL_ARTIFACT_MIME,
      signedAt: TS,
      immutableAt: TS,
    },
    over,
  );
}

/** A valid two-signer signed chain (tier 1 then tier 2). */
export function makeSignedChain(): SignedArtifactVersion[] {
  const first = makeSigned();
  const second = makeSigned({
    artifactVersionId: 'AVS-2' as ArtifactVersionId,
    presentedArtifactVersionId: 'AVP-2' as ArtifactVersionId,
    previousSignedArtifactVersionId: 'AVS-1' as ArtifactVersionId,
    signerId: 'USER-TRAIN-2' as SignerId,
    signerRole: 'Administrator' as SignerRole,
    signerTier: 2 as ProductionSignerTier,
    signatureSequence: 2,
    sha256: SHA_SIGNED_2,
  });
  return [first, second];
}

export function makeReplicaParity(over?: Partial<ReplicaParityRecord>): ReplicaParityRecord {
  return merge<ReplicaParityRecord>(
    {
      replicaKind: 'drive',
      artifactVersionId: 'AVS-1' as ArtifactVersionId,
      canonicalSha256: SHA_SIGNED_1,
      replicaSha256: SHA_SIGNED_1,
      driveFileId: 'DRIVE-TRAIN-1' as DriveFileId,
      status: 'verified',
      verifiedAt: TS,
    },
    over,
  );
}

export function makeLockEligibility(over?: Partial<LockEligibilityMetadata>): LockEligibilityMetadata {
  return merge<LockEligibilityMetadata>(
    {
      kind: 'locked',
      artifactId: 'ART-TRAIN-1' as ArtifactId,
      artifactVersionId: 'AVS-1' as ArtifactVersionId,
      canonicalPersistVerified: true,
      driveParity: makeReplicaParity({ replicaKind: 'drive' }),
      evidenceParity: makeReplicaParity({
        replicaKind: 'evidence_center',
        evidenceRecordId: 'EVR-TRAIN-1' as EvidenceRecordId,
      }),
      metadataAttachComplete: true,
      auditAppendComplete: true,
      lockedAt: TS,
    },
    over,
  );
}

export function makeAuditEnvelope(over?: Partial<AuditEnvelope>): AuditEnvelope {
  return merge<AuditEnvelope>(
    {
      auditChainId: 'AC-TRAIN-1' as AuditChainId,
      sequence: 1,
      action: 'signed',
      actorId: 'USER-TRAIN-1' as SignerId,
      actorRole: 'Compliance Officer' as SignerRole,
      timestamp: TS,
      result: 'ok',
      artifactId: 'ART-TRAIN-1' as ArtifactId,
      artifactVersionId: 'AVS-1' as ArtifactVersionId,
      previousAuditHash: null,
      currentAuditHash: SHA_SIGNED_1,
    },
    over,
  );
}

export function makeHierarchySnapshot(over?: Partial<HierarchySnapshot>): HierarchySnapshot {
  return merge<HierarchySnapshot>(
    {
      snapshotId: 'HS-TRAIN-1' as HierarchySnapshotId,
      domain: 'Governance',
      eventId: 'EV-TRAIN-1' as EventId,
      orderedRequiredTiers: [1, 2, 3] as ProductionSignerTier[],
      requiredRolesByTier: { 1: ['Compliance Officer'], 2: ['Administrator'], 3: ['Governing Body'] },
      requiredPermissionByTier: { 1: 'eCIgner', 2: 'eCIgn Reviewer', 3: 'eCIgn Final Approver' },
      governingBodyRequired: true,
      blocksSelfApproval: true,
      capturedAt: TS,
    },
    over,
  );
}

export function makeRetention(over?: Partial<RetentionContract>): RetentionContract {
  return merge<RetentionContract>(
    {
      retentionPolicyId: 'RP-TRAIN-1' as RetentionPolicyId,
      policySnapshotRef: 'policy-snapshot://train/retention/v1',
      dispositionState: 'retained',
    },
    over,
  );
}

export function makeIdempotency(over?: Partial<{ operation: string; idempotencyKey: IdempotencyKey; artifactVersionId: ArtifactVersionId }>) {
  return merge(
    {
      operation: 'signature_append',
      idempotencyKey: 'IDK-TRAIN-1' as IdempotencyKey,
      artifactVersionId: 'AVS-1' as ArtifactVersionId,
    },
    over,
  );
}

export const TRAINING_PERMISSIONS_BASE: readonly ECIgnPermissionRole[] = ['eCIgner'];
