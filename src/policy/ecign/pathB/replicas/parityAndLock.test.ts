/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2B parity + lock tests (REQUIRED GREEN).
 *
 * Eager per-version replication to Drive + Evidence (reference/fake adapters, no
 * Google calls), parity by independent sha recompute (link alone is never parity),
 * recovery after failure, lock-eligibility assembly, and multi-signer byte lineage
 * retrievability. Synthetic non-PHI bytes. Run via tsx --test.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ArtifactId, ArtifactVersionId, DriveFileId, FormInstanceId, HierarchySnapshotId, IsoTimestamp, SignerId } from '../ids';
import type { ProductionSignerTier } from '../signerAuthority';
import type { SignerRole } from '../types';
import type { ReplicaParityRecord } from '../artifactContracts';
import { parityRequiresRecovery, validateReplicaParityRecord, validateVersionLinkage } from '../validators';
import { InMemoryWriteOnceStore } from '../storage/inMemoryWriteOnceStore';
import { freezePresented, freezeSigned } from '../storage/byteFreeze';
import { sha256Hex } from '../storage/hash';
import { FakeReplicaPublisher } from './fakeReplicaPublisher';
import { publishAndVerify, replicateSignedVersion } from './parity';
import { assembleLockEligibility, canLock, type LockInputs } from './lockAssembly';

const enc = new TextEncoder();
const VAT = '2026-06-22T13:31:29.000Z' as IsoTimestamp;
const vid = (s: string) => s as ArtifactVersionId;
const bytes = (s: string) => enc.encode(`%PDF-1.7\n${s}`);

function verifyInput(b: Uint8Array, id = 'AVS-1') {
  return { versionId: vid(id), canonicalSha256: sha256Hex(b), bytes: b, verifiedAt: VAT };
}

describe('Phase 2B — replica parity (independent sha recompute)', () => {
  it('Drive parity is verified when replica bytes hash equal to canonical', () => {
    const drive = new FakeReplicaPublisher('drive');
    const rec = publishAndVerify(drive, verifyInput(bytes('doc')));
    assert.equal(rec.status, 'verified');
    assert.equal(rec.replicaSha256, sha256Hex(bytes('doc')));
    assert.equal(validateReplicaParityRecord(rec).ok, true);
  });

  it('Evidence Center parity is verified the same way', () => {
    const evidence = new FakeReplicaPublisher('evidence_center');
    const rec = publishAndVerify(evidence, verifyInput(bytes('doc')));
    assert.equal(rec.status, 'verified');
    assert.ok(rec.evidenceRecordId);
  });

  it('a corrupted replica yields mismatch + recovery-required (not verified)', () => {
    const drive = new FakeReplicaPublisher('drive', { corruptOnStore: true });
    const rec = publishAndVerify(drive, verifyInput(bytes('doc')));
    assert.equal(rec.status, 'mismatch');
    assert.equal(rec.failureReason, 'sha_mismatch');
    assert.equal(parityRequiresRecovery(rec), true);
  });

  it('a link/id ALONE never satisfies parity', () => {
    const linkOnly: ReplicaParityRecord = {
      replicaKind: 'drive',
      artifactVersionId: vid('AVS-1'),
      canonicalSha256: sha256Hex(bytes('doc')),
      driveFileId: 'DRIVE-1' as DriveFileId,
      status: 'verified', // claims verified but has no recomputed replicaSha256
      verifiedAt: VAT,
    };
    assert.ok(validateReplicaParityRecord(linkOnly).issues.includes('parity_link_without_sha'));
  });
});

describe('Phase 2B — failure & idempotent recovery', () => {
  it('publish failure → failed parity; recover + retry → verified; idempotent ref', () => {
    const drive = new FakeReplicaPublisher('drive', { failPublish: true });
    const failed = publishAndVerify(drive, verifyInput(bytes('doc')));
    assert.equal(failed.status, 'failed');
    assert.equal(parityRequiresRecovery(failed), true);

    drive.recover();
    const ok1 = publishAndVerify(drive, verifyInput(bytes('doc')));
    const ok2 = publishAndVerify(drive, verifyInput(bytes('doc'))); // retry same version
    assert.equal(ok1.status, 'verified');
    assert.equal(ok2.status, 'verified');
    assert.equal(ok1.driveFileId, ok2.driveFileId); // idempotent: same ref, same version
  });

  it('permission denial surfaces permission_denied without claiming parity', () => {
    const drive = new FakeReplicaPublisher('drive', { permissionDenied: true });
    const rec = publishAndVerify(drive, verifyInput(bytes('doc')));
    assert.equal(rec.status, 'failed');
    assert.equal(rec.failureReason, 'permission_denied');
  });
});

describe('Phase 2B — lock-eligibility assembly', () => {
  function lockInputs(over?: Partial<LockInputs>): LockInputs {
    const drive = new FakeReplicaPublisher('drive');
    const evidence = new FakeReplicaPublisher('evidence_center');
    const b = bytes('final');
    return {
      artifactId: 'ART-1' as ArtifactId,
      artifactVersionId: vid('AVS-1'),
      canonicalPersistVerified: true,
      driveParity: publishAndVerify(drive, verifyInput(b)),
      evidenceParity: publishAndVerify(evidence, verifyInput(b)),
      metadataAttachComplete: true,
      auditAppendComplete: true,
      lockedAt: VAT,
      ...over,
    };
  }

  it('all verified + complete → lockable', () => {
    assert.equal(canLock(lockInputs()).ok, true);
    assert.equal(assembleLockEligibility(lockInputs()).kind, 'locked');
  });

  it('blocks lock when Drive parity is not verified', () => {
    const notVerified = { ...lockInputs().driveParity, status: 'pending' as const };
    assert.ok(canLock(lockInputs({ driveParity: notVerified })).issues.includes('lock_missing_drive_parity'));
  });
});

describe('Phase 2B — eager replication + multi-signer byte lineage', () => {
  const snap = 'HS-1' as HierarchySnapshotId;
  const fi = 'FI-1' as FormInstanceId;
  const aid = 'ART-1' as ArtifactId;

  function freezeChain(store: InMemoryWriteOnceStore) {
    const sign = (n: number, prev: string | null) => {
      const pv = vid(`AVP-${n}`);
      const sv = vid(`AVS-${n}`);
      freezePresented(store, {
        artifactId: aid, presentationArtifactVersionId: pv, formInstanceId: fi,
        derivedFromSignedVersionId: prev ? (prev as ArtifactVersionId) : null,
        presentedToSignerId: `U${n}` as SignerId, signerTier: n as ProductionSignerTier,
        signerHierarchySnapshotId: snap, presentedAt: VAT, bytes: bytes(`P${n}`),
      });
      return freezeSigned(store, {
        artifactId: aid, artifactVersionId: sv, presentedArtifactVersionId: pv,
        previousSignedArtifactVersionId: prev ? (prev as ArtifactVersionId) : null,
        formInstanceId: fi, signerId: `U${n}` as SignerId, signerRole: 'Administrator' as SignerRole,
        signerTier: n as ProductionSignerTier, signatureSequence: n, signedAt: VAT, immutableAt: VAT,
        bytes: bytes(`S${n}`),
      });
    };
    const s1 = sign(1, null);
    const s2 = sign(2, 'AVS-1');
    const s3 = sign(3, 'AVS-2');
    return [s1, s2, s3];
  }

  it('eager replication of a freshly-frozen version verifies on both replicas', () => {
    const store = new InMemoryWriteOnceStore();
    const [s1] = freezeChain(store);
    const meta = store.getMeta(s1.artifactVersionId);
    const { driveParity, evidenceParity } = replicateSignedVersion(
      new FakeReplicaPublisher('drive'),
      new FakeReplicaPublisher('evidence_center'),
      { versionId: s1.artifactVersionId, canonicalSha256: meta.sha256, bytes: store.getBytes(s1.artifactVersionId), verifiedAt: VAT },
    );
    assert.equal(driveParity.status, 'verified');
    assert.equal(evidenceParity.status, 'verified');
  });

  it('A->B->C lineage preserves every prior signed version retrievably', () => {
    const store = new InMemoryWriteOnceStore();
    const chain = freezeChain(store);
    for (const v of chain) {
      assert.equal(store.exists(v.artifactVersionId), true);
      assert.equal(store.recomputeSha256(v.artifactVersionId), v.sha256); // intact
    }
    assert.equal(validateVersionLinkage(chain).ok, true); // valid append-only chain
    assert.equal(chain[1].previousSignedArtifactVersionId, 'AVS-1');
    assert.equal(chain[2].previousSignedArtifactVersionId, 'AVS-2');
  });
});
