/**
 * eCIgn Path B — Phase 1 contracts: canonical artifact family, the presented-vs-
 * signed version distinction, the version discriminated union, canonical storage
 * locator, replica parity, retention/disposition.
 *
 * CONTRACTS ONLY. No runtime behavior. The canonical signable artifact is the
 * actual filled Care Indeed form as application/pdf — never Markdown/HTML/text/
 * metadata/summary/regenerated PDF.
 */
import type { SignerRole } from '../types';
import type { ProductionSignerTier } from '../signerAuthority';
import type {
  ArtifactId,
  ArtifactVersionId,
  CanonicalArtifactMime,
  DriveFileId,
  EventId,
  EvidenceRecordId,
  FormId,
  FormInstanceId,
  HierarchySnapshotId,
  IsoTimestamp,
  PolicyId,
  RetentionPolicyId,
  SignerId,
  WorkflowId,
} from './ids';

/** The single accepted canonical signable artifact kind: the real Care Indeed form PDF. */
export type CanonicalArtifactKind = 'care_indeed_form_pdf';

/** Kinds explicitly REJECTED as the canonical signable artifact (support-only at most). */
export type RejectedArtifactKind =
  | 'markdown'
  | 'html'
  | 'plain_text'
  | 'metadata_only'
  | 'generic_template'
  | 'regenerated_pdf'
  | 'summary';

export type ArtifactKind = CanonicalArtifactKind | RejectedArtifactKind;

export const CANONICAL_ARTIFACT_KIND: CanonicalArtifactKind = 'care_indeed_form_pdf';

/**
 * Opaque, vendor-agnostic pointer to the CANONICAL immutable artifact bytes.
 * Path B must not pick a storage vendor in Phase 1, and the canonical locator
 * must NEVER be a public Drive/HTTP URL — Drive/Evidence are replicas only.
 */
export interface CanonicalStorageLocator {
  /** Discriminant marking this as the canonical (not replica) store reference. */
  readonly store: 'canonical';
  /** Opaque reference resolved by the (future) canonical store. Not a public URL. */
  readonly ref: string;
}

/** Artifact family — identity shared by every version in one signing lineage. */
export interface ArtifactFamily {
  readonly artifactId: ArtifactId;
  readonly formId: FormId;
  readonly formInstanceId: FormInstanceId;
  readonly eventId: EventId;
  readonly workflowId?: WorkflowId;
  readonly policyId: PolicyId;
  readonly artifactKind: ArtifactKind;
  readonly mimeType: CanonicalArtifactMime;
  readonly signerHierarchySnapshotId: HierarchySnapshotId;
  readonly retentionPolicyId: RetentionPolicyId;
  readonly createdAt: IsoTimestamp;
  readonly createdBy: SignerId;
}

/**
 * A — PRESENTED artifact version: the EXACT PDF bytes shown to signer N BEFORE
 * signature. Immutable once presented. Has NO signed-only fields.
 */
export interface PresentedArtifactVersion {
  readonly kind: 'presented';
  readonly artifactId: ArtifactId;
  readonly formInstanceId: FormInstanceId;
  readonly presentationArtifactVersionId: ArtifactVersionId;
  /** For signers after #1, the presentation derives from the prior signed tip. */
  readonly derivedFromSignedVersionId: ArtifactVersionId | null;
  readonly canonicalStorageLocator: CanonicalStorageLocator;
  readonly sha256: string;
  readonly byteLength: number;
  readonly mimeType: CanonicalArtifactMime;
  readonly presentedAt: IsoTimestamp;
  readonly presentedToSignerId: SignerId;
  readonly signerTier: ProductionSignerTier;
  readonly signerHierarchySnapshotId: HierarchySnapshotId;
}

/**
 * B — SIGNED artifact version: the EXACT PDF bytes AFTER signer N's signature is
 * applied. Links to the exact presented input and to the prior signed chain tip.
 */
export interface SignedArtifactVersion {
  readonly kind: 'signed';
  readonly artifactId: ArtifactId;
  readonly formInstanceId: FormInstanceId;
  readonly artifactVersionId: ArtifactVersionId;
  /** The exact presentation snapshot this signature was applied to. */
  readonly presentedArtifactVersionId: ArtifactVersionId;
  /** Prior signed chain node; null only for the first signature. */
  readonly previousSignedArtifactVersionId: ArtifactVersionId | null;
  readonly signerId: SignerId;
  readonly signerRole: SignerRole;
  readonly signerTier: ProductionSignerTier;
  /** 1-based, strictly increasing, gap-free, unique across the chain. */
  readonly signatureSequence: number;
  readonly canonicalStorageLocator: CanonicalStorageLocator;
  readonly sha256: string;
  readonly byteLength: number;
  readonly mimeType: CanonicalArtifactMime;
  readonly signedAt: IsoTimestamp;
  readonly immutableAt: IsoTimestamp;
}

/** Tier-5 final validation over an already-signed version. */
export interface FinalValidatedArtifactVersion {
  readonly kind: 'final_validated';
  readonly artifactId: ArtifactId;
  readonly artifactVersionId: ArtifactVersionId;
  readonly validatedBySignerId: SignerId;
  readonly signerTier: 5;
  readonly finalValidatedAt: IsoTimestamp;
}

export type ReplicaKind = 'drive' | 'evidence_center';
export type ParityStatus = 'pending' | 'verified' | 'failed' | 'mismatch';
export type ParityFailureReason =
  | 'replica_missing'
  | 'sha_mismatch'
  | 'replica_unreadable'
  | 'permission_denied';

/**
 * Replica parity record. A link/id ALONE never means parity: `verified` requires
 * an independently recomputed `replicaSha256` equal to `canonicalSha256`.
 */
export interface ReplicaParityRecord {
  readonly replicaKind: ReplicaKind;
  readonly artifactVersionId: ArtifactVersionId;
  readonly canonicalSha256: string;
  readonly replicaSha256?: string;
  readonly driveFileId?: DriveFileId;
  readonly evidenceRecordId?: EvidenceRecordId;
  readonly status: ParityStatus;
  readonly verifiedAt?: IsoTimestamp;
  readonly failureReason?: ParityFailureReason;
}

/**
 * Metadata required before an artifact version may enter the `locked` state.
 * Locking requires canonical persistence + both replica parities + metadata +
 * audit completion — never a link alone.
 */
export interface LockEligibilityMetadata {
  readonly kind: 'locked';
  readonly artifactId: ArtifactId;
  readonly artifactVersionId: ArtifactVersionId;
  readonly canonicalPersistVerified: boolean;
  readonly driveParity: ReplicaParityRecord;
  readonly evidenceParity: ReplicaParityRecord;
  readonly metadataAttachComplete: boolean;
  readonly auditAppendComplete: boolean;
  readonly lockedAt: IsoTimestamp;
}

/** Discriminated union over artifact version states (`kind` discriminant). */
export type ArtifactVersion =
  | PresentedArtifactVersion
  | SignedArtifactVersion
  | FinalValidatedArtifactVersion
  | LockEligibilityMetadata;

export type DispositionState = 'retained' | 'eligible_for_disposition' | 'disposed';

/**
 * Retention/disposition contract. Duration is policy-configured and confirmed —
 * NEVER a hardcoded "5 years"/"7 years" substitute baked into the id/snapshot.
 */
export interface RetentionContract {
  readonly retentionPolicyId: RetentionPolicyId;
  /** Reference/snapshot of the governing policy source — not a literal duration. */
  readonly policySnapshotRef: string;
  readonly dispositionState: DispositionState;
  /** Required to advance to `disposed` — an approved, append-only workflow ref. */
  readonly approvedDispositionWorkflowRef?: string;
}
