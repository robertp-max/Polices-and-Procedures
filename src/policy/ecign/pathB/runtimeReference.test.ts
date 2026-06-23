/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2 runtime-reference tests (REQUIRED GREEN).
 *
 * Implements the last 3 runtime specs as reference (no real PDF/crypto, no
 * filesystem, no Google): signature application (new immutable version, source
 * not re-rendered), restart/reconstruction from a durable journal, and survey
 * packet export of real signed artifacts + audit. Run via tsx --test.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ArtifactId, ArtifactVersionId, FormInstanceId, HierarchySnapshotId, IsoTimestamp, SignerId } from './ids';
import type { ProductionSignerTier } from './signerAuthority';
import type { SignerRole } from './types';
import type { PresentedArtifactVersion } from './artifactContracts';
import { validateSignedArtifactVersion, validateVersionLinkage } from './validators';
import { InMemoryWriteOnceStore } from './storage/inMemoryWriteOnceStore';
import { JournaledWriteOnceStore } from './storage/journaledWriteOnceStore';
import { CanonicalStoreError } from './storage/canonicalArtifactStore';
import { freezePresented } from './storage/byteFreeze';
import { applySignature, type SignatureDescriptor } from './signing/signatureApplication';
import { buildSurveyPacketExport } from './export/surveyPacketExport';
import { makeAuditEnvelope } from './__fixtures__/syntheticFixtures';

const enc = new TextEncoder();
const TS = '2026-06-22T13:31:29.000Z' as IsoTimestamp;
const vid = (s: string) => s as ArtifactVersionId;
const pdf = (s: string) => enc.encode(`%PDF-1.7\n${s}`);
const aid = 'ART-1' as ArtifactId;
const fi = 'FI-1' as FormInstanceId;
const snap = 'HS-1' as HierarchySnapshotId;

function presented(store: InMemoryWriteOnceStore, pid: string, bytes: Uint8Array, tier: number, derived: string | null): PresentedArtifactVersion {
  return freezePresented(store, {
    artifactId: aid, presentationArtifactVersionId: vid(pid), formInstanceId: fi,
    derivedFromSignedVersionId: derived ? vid(derived) : null,
    presentedToSignerId: `U${tier}` as SignerId, signerTier: tier as ProductionSignerTier,
    signerHierarchySnapshotId: snap, presentedAt: TS, bytes,
  });
}
function descriptor(svid: string, prev: string | null, tier: number, token: string): SignatureDescriptor {
  return {
    artifactVersionId: vid(svid), previousSignedArtifactVersionId: prev ? vid(prev) : null,
    signerId: `U${tier}` as SignerId, signerRole: 'Administrator' as SignerRole,
    signerTier: tier as ProductionSignerTier, signatureSequence: tier, signedAt: TS, immutableAt: TS,
    signatureToken: token,
  };
}

describe('Phase 2 ref — signature application (new immutable version, source not re-rendered)', () => {
  it('applies a signature producing a new signed version; presented source is untouched', () => {
    const store = new InMemoryWriteOnceStore();
    const p1 = presented(store, 'AVP-1', pdf('form-body'), 1, null);
    const presentedShaBefore = store.recomputeSha256(vid('AVP-1'));
    const s1 = applySignature(store, p1, descriptor('AVS-1', null, 1, 'tok1'));

    assert.equal(validateSignedArtifactVersion(s1).ok, true);
    assert.notEqual(s1.sha256, p1.sha256); // new bytes
    // source NOT re-rendered: presented bytes unchanged, and are a prefix of signed bytes
    assert.equal(store.recomputeSha256(vid('AVP-1')), presentedShaBefore);
    const signedBytes = store.getBytes(vid('AVS-1'));
    const presentedBytes = store.getBytes(vid('AVP-1'));
    assert.deepEqual(signedBytes.slice(0, presentedBytes.length), presentedBytes);
  });

  it('chains multiple signers (S1 then S2 over S1) keeping every prior version intact', () => {
    const store = new InMemoryWriteOnceStore();
    const p1 = presented(store, 'AVP-1', pdf('form-body'), 1, null);
    const s1 = applySignature(store, p1, descriptor('AVS-1', null, 1, 'tok1'));
    const s1Sha = store.recomputeSha256(vid('AVS-1'));
    // signer 2's presentation is signer 1's signed output
    const p2 = presented(store, 'AVP-2', store.getBytes(vid('AVS-1')), 2, 'AVS-1');
    const s2 = applySignature(store, p2, descriptor('AVS-2', 'AVS-1', 2, 'tok2'));

    assert.equal(validateVersionLinkage([s1, s2]).ok, true);
    assert.equal(store.recomputeSha256(vid('AVS-1')), s1Sha); // S1 immutable after S2
    assert.equal(s2.previousSignedArtifactVersionId, 'AVS-1');
  });
});

describe('Phase 2 ref — restart/reconstruction from durable journal', () => {
  it('rebuilds the store from its journal with bytes/hashes intact', () => {
    const store = new JournaledWriteOnceStore();
    const m1 = store.putOnce(vid('V1'), pdf('a'));
    const m2 = store.putOnce(vid('V2'), pdf('b'));
    const journal = store.exportJournal();
    assert.equal(journal.length, 2);

    const rebuilt = JournaledWriteOnceStore.fromJournal(journal);
    assert.equal(rebuilt.exists(vid('V1')), true);
    assert.equal(rebuilt.exists(vid('V2')), true);
    assert.equal(rebuilt.recomputeSha256(vid('V1')), m1.sha256);
    assert.equal(rebuilt.recomputeSha256(vid('V2')), m2.sha256);
  });

  it('still enforces write-once after reconstruction', () => {
    const store = new JournaledWriteOnceStore();
    store.putOnce(vid('V1'), pdf('a'));
    const rebuilt = JournaledWriteOnceStore.fromJournal(store.exportJournal());
    assert.throws(() => rebuilt.putOnce(vid('V1'), pdf('a')), (e: unknown) => e instanceof CanonicalStoreError && e.code === 'overwrite_forbidden');
  });
});

describe('Phase 2 ref — survey packet export', () => {
  it('exports real signed artifacts + audit for a COMPLETE (locked) packet', () => {
    const store = new InMemoryWriteOnceStore();
    const p1 = presented(store, 'AVP-1', pdf('form'), 1, null);
    const s1 = applySignature(store, p1, descriptor('AVS-1', null, 1, 'tok1'));
    const audit = [makeAuditEnvelope({ sequence: 1 }), makeAuditEnvelope({ sequence: 2 })];

    const out = buildSurveyPacketExport({ artifactId: aid, state: 'locked', signedChain: [s1], store, auditEnvelopes: audit, generatedAt: TS });
    assert.equal(out.complete, true);
    assert.equal(out.versions.length, 1);
    assert.equal(out.versions[0].sha256, store.recomputeSha256(vid('AVS-1'))); // REAL artifact, not metadata-only
    assert.deepEqual(out.auditSequence, [1, 2]);
  });

  it('refuses to export artifacts for an INCOMPLETE packet ("as good as not signed")', () => {
    const store = new InMemoryWriteOnceStore();
    const p1 = presented(store, 'AVP-1', pdf('form'), 1, null);
    const s1 = applySignature(store, p1, descriptor('AVS-1', null, 1, 'tok1'));
    const out = buildSurveyPacketExport({ artifactId: aid, state: 'signed_by_tier_1', signedChain: [s1], store, auditEnvelopes: [], generatedAt: TS });
    assert.equal(out.complete, false);
    assert.equal(out.versions.length, 0);
  });
});
