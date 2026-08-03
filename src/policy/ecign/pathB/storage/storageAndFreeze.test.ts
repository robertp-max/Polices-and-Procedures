/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2A storage & byte-freeze tests (REQUIRED GREEN).
 *
 * Reference in-memory write-once store + freeze service. Synthetic non-PHI bytes
 * only. Implements the 3 previously-TODO runtime specs: write-once enforcement,
 * presentation->storage byte-freeze, and server-side hash recompute.
 * Run: npx tsx --test src/policy/ecign/pathB/storage/storageAndFreeze.test.ts
 */
import assert from 'node:assert/strict';
import { describe, it } from 'vitest';

import type {
  ArtifactId,
  ArtifactVersionId,
  FormInstanceId,
  HierarchySnapshotId,
  IsoTimestamp,
  SignerId,
} from '../ids';
import type { ProductionSignerTier } from '../signerAuthority';
import type { SignerRole } from '../types';
import { validatePresentedArtifactVersion, validateSignedArtifactVersion } from '../validators';
import { InMemoryWriteOnceStore } from './inMemoryWriteOnceStore';
import { CanonicalStoreError } from './canonicalArtifactStore';
import { sha256Hex } from './hash';
import {
  FreezeError,
  freezePresented,
  freezeSigned,
  looksLikePdf,
  verifyStoredIntegrity,
  type FreezePresentedInput,
  type FreezeSignedInput,
} from './byteFreeze';

const enc = new TextEncoder();
const PDF = enc.encode('%PDF-1.7\n1 0 obj<<>>endobj\n%%EOF'); // synthetic valid-ish PDF
const PDF_DEFECTIVE = enc.encode('%PDF-1.7\nGARBAGE-BAD-LAYOUT-MISSING-LOGO'); // valid container, bad content
const NOT_PDF = enc.encode('this is not a pdf');
const TS = '2026-06-22T13:31:29.000Z' as IsoTimestamp;
const vid = (s: string) => s as ArtifactVersionId;

function presentedInput(over?: Partial<FreezePresentedInput>): FreezePresentedInput {
  return {
    artifactId: 'ART-1' as ArtifactId,
    presentationArtifactVersionId: vid('AVP-1'),
    formInstanceId: 'FI-1' as FormInstanceId,
    derivedFromSignedVersionId: null,
    presentedToSignerId: 'USER-1' as SignerId,
    signerTier: 1 as ProductionSignerTier,
    signerHierarchySnapshotId: 'HS-1' as HierarchySnapshotId,
    presentedAt: TS,
    bytes: PDF,
    ...over,
  };
}

function signedInput(over?: Partial<FreezeSignedInput>): FreezeSignedInput {
  return {
    artifactId: 'ART-1' as ArtifactId,
    artifactVersionId: vid('AVS-1'),
    presentedArtifactVersionId: vid('AVP-1'),
    previousSignedArtifactVersionId: null,
    formInstanceId: 'FI-1' as FormInstanceId,
    signerId: 'USER-1' as SignerId,
    signerRole: 'Compliance Officer' as SignerRole,
    signerTier: 1 as ProductionSignerTier,
    signatureSequence: 1,
    signedAt: TS,
    immutableAt: TS,
    bytes: PDF,
    ...over,
  };
}

describe('Phase 2A — canonical write-once store', () => {
  it('putOnce stores bytes with a recomputable sha256 + non-public canonical locator', () => {
    const store = new InMemoryWriteOnceStore();
    const meta = store.putOnce(vid('V1'), PDF);
    assert.equal(meta.sha256, sha256Hex(PDF));
    assert.equal(meta.byteLength, PDF.length);
    assert.equal(meta.locator.store, 'canonical');
    assert.ok(!/^https?:|drive\.google\.com/.test(meta.locator.ref));
  });

  it('enforces write-once: a second putOnce for the same id throws overwrite_forbidden', () => {
    const store = new InMemoryWriteOnceStore();
    store.putOnce(vid('V1'), PDF);
    assert.throws(
      () => store.putOnce(vid('V1'), PDF_DEFECTIVE),
      (e: unknown) => e instanceof CanonicalStoreError && e.code === 'overwrite_forbidden',
    );
  });

  it('rejects empty bytes', () => {
    const store = new InMemoryWriteOnceStore();
    assert.throws(
      () => store.putOnce(vid('V1'), new Uint8Array(0)),
      (e: unknown) => e instanceof CanonicalStoreError && e.code === 'empty_bytes',
    );
  });

  it('throws not_found for unknown ids', () => {
    const store = new InMemoryWriteOnceStore();
    for (const fn of [() => store.getBytes(vid('X')), () => store.getMeta(vid('X')), () => store.recomputeSha256(vid('X'))]) {
      assert.throws(fn, (e: unknown) => e instanceof CanonicalStoreError && e.code === 'not_found');
    }
    assert.equal(store.exists(vid('X')), false);
  });

  it('recompute-on-read equals the recorded sha (server-side integrity)', () => {
    const store = new InMemoryWriteOnceStore();
    const meta = store.putOnce(vid('V1'), PDF);
    assert.equal(store.recomputeSha256(vid('V1')), meta.sha256);
  });

  it('returns byte COPIES so external mutation cannot tamper the stored artifact', () => {
    const store = new InMemoryWriteOnceStore();
    const meta = store.putOnce(vid('V1'), PDF);
    const out = store.getBytes(vid('V1'));
    out[0] = 0; // mutate the returned copy
    assert.equal(store.recomputeSha256(vid('V1')), meta.sha256); // store intact
  });
});

describe('Phase 2A — byte-freeze (presented)', () => {
  it('freezes presented PDF bytes into a contract-valid PresentedArtifactVersion', () => {
    const store = new InMemoryWriteOnceStore();
    const v = freezePresented(store, presentedInput());
    assert.equal(validatePresentedArtifactVersion(v).ok, true);
    assert.equal(v.sha256, sha256Hex(PDF));
    assert.equal(v.mimeType, 'application/pdf');
    assert.equal(store.exists(vid('AVP-1')), true);
  });

  it('rejects non-PDF bytes but PRESERVES a defective-but-real PDF', () => {
    assert.equal(looksLikePdf(NOT_PDF), false);
    assert.equal(looksLikePdf(PDF_DEFECTIVE), true);
    const store = new InMemoryWriteOnceStore();
    assert.throws(() => freezePresented(store, presentedInput({ bytes: NOT_PDF })), (e: unknown) => e instanceof FreezeError && e.code === 'not_pdf');
    const v = freezePresented(store, presentedInput({ bytes: PDF_DEFECTIVE }));
    assert.equal(v.sha256, sha256Hex(PDF_DEFECTIVE)); // defective bytes preserved exactly
  });

  it('is idempotent on identical re-freeze and rejects changed bytes for the same id', () => {
    const store = new InMemoryWriteOnceStore();
    const a = freezePresented(store, presentedInput());
    const b = freezePresented(store, presentedInput()); // same id + same bytes
    assert.equal(a.sha256, b.sha256);
    assert.equal(a.canonicalStorageLocator.ref, b.canonicalStorageLocator.ref);
    assert.throws(
      () => freezePresented(store, presentedInput({ bytes: PDF_DEFECTIVE })),
      (e: unknown) => e instanceof FreezeError && e.code === 'changed_bytes_same_version',
    );
  });
});

describe('Phase 2A — byte-freeze (signed) + integrity', () => {
  it('signs only after the presentation is frozen, producing a contract-valid SignedArtifactVersion', () => {
    const store = new InMemoryWriteOnceStore();
    // presented must be frozen first
    assert.throws(() => freezeSigned(store, signedInput()), (e: unknown) => e instanceof FreezeError && e.code === 'presented_not_frozen');
    freezePresented(store, presentedInput());
    const signed = freezeSigned(store, signedInput());
    assert.equal(validateSignedArtifactVersion(signed).ok, true);
    assert.equal(signed.sha256, sha256Hex(PDF));
    assert.notEqual(signed.artifactVersionId, signed.presentedArtifactVersionId);
    assert.equal(store.exists(vid('AVS-1')), true);
  });

  it('verifyStoredIntegrity is true for the recorded sha and false for a mismatched claim', () => {
    const store = new InMemoryWriteOnceStore();
    const v = freezePresented(store, presentedInput());
    assert.equal(verifyStoredIntegrity(store, vid('AVP-1'), v.sha256), true);
    assert.equal(verifyStoredIntegrity(store, vid('AVP-1'), 'f'.repeat(64)), false);
  });
});
