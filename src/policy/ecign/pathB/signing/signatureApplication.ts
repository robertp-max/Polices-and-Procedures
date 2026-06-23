/**
 * eCIgn Path B — Phase 2 (runtime reference): signature APPLICATION.
 *
 * Produces a NEW immutable signed version from a presented version WITHOUT
 * re-rendering the source: the presented bytes are preserved as a prefix and the
 * signature is appended, then frozen write-once.
 *
 * REFERENCE applicator only — it does not do real PDF/crypto signing (that needs a
 * PDF/crypto library or the server PDF path, deferred to the live phase). It exists
 * to prove the lineage/immutability invariants with no new dependency.
 */
import type { ProductionSignerTier } from '../signerAuthority';
import type { SignerRole } from '../types';
import type { ArtifactVersionId, IsoTimestamp, SignerId } from '../ids';
import type { PresentedArtifactVersion, SignedArtifactVersion } from '../artifactContracts';
import type { CanonicalArtifactStore } from '../storage/canonicalArtifactStore';
import { freezeSigned } from '../storage/byteFreeze';

export interface SignatureDescriptor {
  readonly artifactVersionId: ArtifactVersionId;
  readonly previousSignedArtifactVersionId: ArtifactVersionId | null;
  readonly signerId: SignerId;
  readonly signerRole: SignerRole;
  readonly signerTier: ProductionSignerTier;
  readonly signatureSequence: number;
  readonly signedAt: IsoTimestamp;
  readonly immutableAt: IsoTimestamp;
  /** Synthetic signature token (production: signature image / certificate ref). */
  readonly signatureToken: string;
}

export interface SignatureApplicator {
  /** Return NEW signed bytes derived from the presented bytes (source preserved). */
  apply(presentedBytes: Uint8Array, descriptor: SignatureDescriptor): Uint8Array;
}

/**
 * Reference applicator: appends a signature block. The presented bytes are an
 * exact prefix of the output (no re-render); output differs from input.
 */
export const passthroughSignatureApplicator: SignatureApplicator = {
  apply(presentedBytes, descriptor) {
    const marker = new TextEncoder().encode(`\n%%eCIgn-signature seq=${descriptor.signatureSequence} ${descriptor.signatureToken}\n`);
    const out = new Uint8Array(presentedBytes.length + marker.length);
    out.set(presentedBytes, 0);
    out.set(marker, presentedBytes.length);
    return out;
  },
};

/**
 * Apply a signature to a frozen presented version, producing a new immutable
 * signed version. Reads the EXACT presented bytes from the canonical store (never
 * re-renders the form), applies the signature, and freezes the result write-once.
 */
export function applySignature(
  store: CanonicalArtifactStore,
  presented: PresentedArtifactVersion,
  descriptor: SignatureDescriptor,
  applicator: SignatureApplicator = passthroughSignatureApplicator,
): SignedArtifactVersion {
  const presentedBytes = store.getBytes(presented.presentationArtifactVersionId);
  const signedBytes = applicator.apply(presentedBytes, descriptor);
  return freezeSigned(store, {
    artifactId: presented.artifactId,
    artifactVersionId: descriptor.artifactVersionId,
    presentedArtifactVersionId: presented.presentationArtifactVersionId,
    previousSignedArtifactVersionId: descriptor.previousSignedArtifactVersionId,
    formInstanceId: presented.formInstanceId,
    signerId: descriptor.signerId,
    signerRole: descriptor.signerRole,
    signerTier: descriptor.signerTier,
    signatureSequence: descriptor.signatureSequence,
    signedAt: descriptor.signedAt,
    immutableAt: descriptor.immutableAt,
    bytes: signedBytes,
  });
}
