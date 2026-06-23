/**
 * eCIgn Path B — Phase 2A: byte-freeze service.
 *
 * Captures the EXACT presented/signed PDF bytes, computes sha256, and persists
 * them WRITE-ONCE to the canonical store, then emits the Phase-1 version record
 * with a real `canonicalStorageLocator`/`sha256`/`byteLength`.
 *
 * Scope (2A): stores bytes HANDED to it. It does NOT generate PDFs, apply
 * signatures, sequence signers, publish to Drive, or write Evidence — those are
 * later phases. A defective-but-real PDF (valid container, bad layout) is
 * preserved as-is; only the `%PDF-` magic header is checked.
 */
import type { ProductionSignerTier } from '../signerAuthority';
import type { SignerRole } from '../types';
import type {
  ArtifactId,
  ArtifactVersionId,
  FormInstanceId,
  HierarchySnapshotId,
  IsoTimestamp,
  SignerId,
} from '../ids';
import { CANONICAL_ARTIFACT_MIME } from '../ids';
import type { PresentedArtifactVersion, SignedArtifactVersion } from '../artifactContracts';
import type { CanonicalArtifactStore } from './canonicalArtifactStore';
import { sha256Hex } from './hash';

export type FreezeErrorCode = 'not_pdf' | 'changed_bytes_same_version' | 'presented_not_frozen';

export class FreezeError extends Error {
  readonly code: FreezeErrorCode;
  constructor(code: FreezeErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'FreezeError';
  }
}

const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46, 0x2d]; // "%PDF-"

/** Cheap container check: a real PDF starts with the `%PDF-` magic. Layout/logo
 * defects are NOT inspected — a defective-but-real PDF is still the record. */
export function looksLikePdf(bytes: Uint8Array): boolean {
  if (bytes.length < PDF_MAGIC.length) return false;
  return PDF_MAGIC.every((b, i) => bytes[i] === b);
}

export interface FreezePresentedInput {
  readonly artifactId: ArtifactId;
  readonly presentationArtifactVersionId: ArtifactVersionId;
  readonly formInstanceId: FormInstanceId;
  readonly derivedFromSignedVersionId: ArtifactVersionId | null;
  readonly presentedToSignerId: SignerId;
  readonly signerTier: ProductionSignerTier;
  readonly signerHierarchySnapshotId: HierarchySnapshotId;
  readonly presentedAt: IsoTimestamp;
  readonly bytes: Uint8Array;
}

/**
 * Persist the exact presented bytes write-once and return the presented version.
 * Idempotent: re-freezing the SAME id with byte-identical content returns the
 * same record; different bytes for the same id throw `changed_bytes_same_version`.
 */
export function freezePresented(
  store: CanonicalArtifactStore,
  input: FreezePresentedInput,
): PresentedArtifactVersion {
  if (!looksLikePdf(input.bytes)) {
    throw new FreezeError('not_pdf', 'presented bytes are not a PDF (missing %PDF- header)');
  }
  const meta = persistIdempotent(store, input.presentationArtifactVersionId, input.bytes);
  return {
    kind: 'presented',
    artifactId: input.artifactId,
    formInstanceId: input.formInstanceId,
    presentationArtifactVersionId: input.presentationArtifactVersionId,
    derivedFromSignedVersionId: input.derivedFromSignedVersionId,
    canonicalStorageLocator: meta.locator,
    sha256: meta.sha256,
    byteLength: meta.byteLength,
    mimeType: CANONICAL_ARTIFACT_MIME,
    presentedAt: input.presentedAt,
    presentedToSignerId: input.presentedToSignerId,
    signerTier: input.signerTier,
    signerHierarchySnapshotId: input.signerHierarchySnapshotId,
  };
}

export interface FreezeSignedInput {
  readonly artifactId: ArtifactId;
  readonly artifactVersionId: ArtifactVersionId;
  readonly presentedArtifactVersionId: ArtifactVersionId;
  readonly previousSignedArtifactVersionId: ArtifactVersionId | null;
  readonly formInstanceId: FormInstanceId;
  readonly signerId: SignerId;
  readonly signerRole: SignerRole;
  readonly signerTier: ProductionSignerTier;
  readonly signatureSequence: number;
  readonly signedAt: IsoTimestamp;
  readonly immutableAt: IsoTimestamp;
  readonly bytes: Uint8Array;
}

/**
 * Persist the exact signed bytes write-once and return the signed version. The
 * referenced presentation MUST already be frozen (ordering invariant). Idempotent
 * on identical re-freeze; conflicting bytes for the same id are rejected.
 */
export function freezeSigned(
  store: CanonicalArtifactStore,
  input: FreezeSignedInput,
): SignedArtifactVersion {
  if (!looksLikePdf(input.bytes)) {
    throw new FreezeError('not_pdf', 'signed bytes are not a PDF (missing %PDF- header)');
  }
  if (!store.exists(input.presentedArtifactVersionId)) {
    throw new FreezeError('presented_not_frozen', 'cannot sign a presentation that was never frozen');
  }
  const meta = persistIdempotent(store, input.artifactVersionId, input.bytes);
  return {
    kind: 'signed',
    artifactId: input.artifactId,
    formInstanceId: input.formInstanceId,
    artifactVersionId: input.artifactVersionId,
    presentedArtifactVersionId: input.presentedArtifactVersionId,
    previousSignedArtifactVersionId: input.previousSignedArtifactVersionId,
    signerId: input.signerId,
    signerRole: input.signerRole,
    signerTier: input.signerTier,
    signatureSequence: input.signatureSequence,
    canonicalStorageLocator: meta.locator,
    sha256: meta.sha256,
    byteLength: meta.byteLength,
    mimeType: CANONICAL_ARTIFACT_MIME,
    signedAt: input.signedAt,
    immutableAt: input.immutableAt,
  };
}

/**
 * Integrity check: the bytes currently in the store for `versionId` must hash to
 * `expectedSha256` (the value recorded at freeze time). True == intact.
 */
export function verifyStoredIntegrity(
  store: CanonicalArtifactStore,
  versionId: ArtifactVersionId,
  expectedSha256: string,
): boolean {
  return store.recomputeSha256(versionId) === expectedSha256;
}

function persistIdempotent(store: CanonicalArtifactStore, versionId: ArtifactVersionId, bytes: Uint8Array) {
  if (store.exists(versionId)) {
    const existing = store.getMeta(versionId);
    if (existing.sha256 === sha256Hex(bytes)) return existing; // idempotent retry
    throw new FreezeError('changed_bytes_same_version', `different bytes for existing version ${versionId}`);
  }
  return store.putOnce(versionId, bytes);
}
