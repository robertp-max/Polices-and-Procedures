/// <reference types="node" />
/**
 * eCIgn Path B — Phase 2-live B tests (REQUIRED GREEN, fake client only).
 * NO network, NO real upload, NO secrets. Exercises the Drive sandbox publisher
 * + async parity + live selector with an in-memory fake DriveClient. Run via tsx --test.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { ArtifactVersionId, IsoTimestamp } from '../ids';
import { parityRequiresRecovery, validateReplicaParityRecord } from '../validators';
import { ReplicaPublishError } from '../replicas/replicaPublisher';
import { sha256Hex } from '../storage/hash';
import {
  DriveSandboxPublisher,
  SANDBOX_FILE_PREFIX,
  buildSandboxUploadResult,
  publishAndVerifyAsync,
  type DriveClient,
  type DriveSandboxUploadInput,
  type DriveSandboxUploadResult,
} from './driveSandboxPublisher';
import { SANDBOX_ENV, resolveSandboxConfig } from './sandboxConfig';
import { LiveSandboxNotReadyError, selectLiveDrivePublisher } from './replicaSelector';

class FakeDriveClient implements DriveClient {
  private readonly store = new Map<string, { folderId: string; name: string; bytes: Uint8Array }>();
  private seq = 0;
  failUpload = false;
  permissionDenied = false;
  corruptOnStore = false;
  readonly uploads: { folderId: string; name: string }[] = [];

  async uploadToFolder(input: DriveSandboxUploadInput): Promise<DriveSandboxUploadResult> {
    if (this.permissionDenied) throw new ReplicaPublishError('permission_denied');
    if (this.failUpload) throw new ReplicaPublishError('publish_failed');
    const fileId = `fake-drive-${++this.seq}`;
    const bytes = Uint8Array.from(input.bytes);
    if (this.corruptOnStore && bytes.length > 0) bytes[0] = bytes[0] ^ 0xff;
    this.store.set(fileId, { folderId: input.folderId, name: input.name, bytes });
    this.uploads.push({ folderId: input.folderId, name: input.name });
    return { fileId, webViewLink: `https://drive.example/training/${fileId}` };
  }
  async downloadBytes(fileId: string): Promise<Uint8Array> {
    const r = this.store.get(fileId);
    if (!r) throw new ReplicaPublishError('not_found');
    return Uint8Array.from(r.bytes);
  }
}

const FOLDER = 'SANDBOX_FOLDER_TRAINING_1';
const VAT = '2026-06-22T21:42:50.000Z' as IsoTimestamp;
const vid = (s: string) => s as ArtifactVersionId;
const pdf = (s: string) => new TextEncoder().encode(`%PDF-1.7\n${s}\n%%EOF\n`);
const readyEnv = {
  [SANDBOX_ENV.enable]: '1',
  [SANDBOX_ENV.driveFolder]: FOLDER,
  [SANDBOX_ENV.credentials]: '/secure/creds.json',
};

describe('Phase 2-live B — Drive sandbox publisher (fake client)', () => {
  it('uploads only to the approved sandbox folder with a TRAINING-labeled name', async () => {
    const client = new FakeDriveClient();
    const pub = new DriveSandboxPublisher({ client, sandboxFolderId: FOLDER });
    const v = vid('AVS-1');
    const res = await pub.publish(v, pdf('doc'));
    assert.equal(res.replicaKind, 'drive');
    assert.equal(pub.exists(v), true);
    assert.equal(client.uploads.length, 1);
    assert.equal(client.uploads[0].folderId, FOLDER); // only the approved folder
    assert.ok(client.uploads[0].name.startsWith(SANDBOX_FILE_PREFIX)); // TRAINING-labeled
  });

  it('verifies sha256 parity on read-back', async () => {
    const client = new FakeDriveClient();
    const pub = new DriveSandboxPublisher({ client, sandboxFolderId: FOLDER });
    const bytes = pdf('doc');
    const rec = await publishAndVerifyAsync(pub, { versionId: vid('AVS-1'), canonicalSha256: sha256Hex(bytes), bytes, verifiedAt: VAT });
    assert.equal(rec.status, 'verified');
    assert.equal(rec.replicaSha256, sha256Hex(bytes));
    assert.equal(validateReplicaParityRecord(rec).ok, true);
  });

  it('corrupted upload → mismatch + recovery required', async () => {
    const client = new FakeDriveClient();
    client.corruptOnStore = true;
    const pub = new DriveSandboxPublisher({ client, sandboxFolderId: FOLDER });
    const bytes = pdf('doc');
    const rec = await publishAndVerifyAsync(pub, { versionId: vid('AVS-1'), canonicalSha256: sha256Hex(bytes), bytes, verifiedAt: VAT });
    assert.equal(rec.status, 'mismatch');
    assert.equal(parityRequiresRecovery(rec), true);
  });

  it('upload failure / permission denial → failed parity (never claims success)', async () => {
    const fail = new FakeDriveClient(); fail.failUpload = true;
    const r1 = await publishAndVerifyAsync(new DriveSandboxPublisher({ client: fail, sandboxFolderId: FOLDER }), { versionId: vid('AVS-1'), canonicalSha256: 'x', bytes: pdf('d'), verifiedAt: VAT });
    assert.equal(r1.status, 'failed');
    const denied = new FakeDriveClient(); denied.permissionDenied = true;
    const r2 = await publishAndVerifyAsync(new DriveSandboxPublisher({ client: denied, sandboxFolderId: FOLDER }), { versionId: vid('AVS-1'), canonicalSha256: 'x', bytes: pdf('d'), verifiedAt: VAT });
    assert.equal(r2.status, 'failed');
    assert.equal(r2.failureReason, 'permission_denied');
  });

  it('publish is idempotent per version (no duplicate upload)', async () => {
    const client = new FakeDriveClient();
    const pub = new DriveSandboxPublisher({ client, sandboxFolderId: FOLDER });
    const v = vid('AVS-1');
    const a = await pub.publish(v, pdf('doc'));
    const b = await pub.publish(v, pdf('doc'));
    assert.equal(a.ref, b.ref);
    assert.equal(client.uploads.length, 1);
  });

  it('constructor rejects an empty sandbox folder id', () => {
    assert.throws(() => new DriveSandboxPublisher({ client: new FakeDriveClient(), sandboxFolderId: '' }));
  });

  it('buildSandboxUploadResult captures the audit-friendly fields', async () => {
    const client = new FakeDriveClient();
    const pub = new DriveSandboxPublisher({ client, sandboxFolderId: FOLDER });
    const bytes = pdf('doc');
    const v = vid('AVS-1');
    const parity = await publishAndVerifyAsync(pub, { versionId: v, canonicalSha256: sha256Hex(bytes), bytes, verifiedAt: VAT });
    const result = buildSandboxUploadResult({ publisher: pub, versionId: v, bytes, sandboxFolderId: FOLDER, uploadedAt: VAT, parity });
    assert.equal(result.artifactVersionId, v);
    assert.ok(result.driveFileId.length > 0);
    assert.equal(result.sha256, sha256Hex(bytes));
    assert.equal(result.byteLength, bytes.byteLength);
    assert.equal(result.sandboxFolderId, FOLDER);
    assert.equal(result.label, 'TRAINING');
    assert.equal(result.parityStatus, 'verified');
    assert.ok(result.webViewLink && !result.webViewLink.includes('anyone'));
  });
});

describe('Phase 2-live B — live selector (Gate B)', () => {
  it('not-ready config throws LiveSandboxNotReadyError', () => {
    const cfg = resolveSandboxConfig({ [SANDBOX_ENV.enable]: '1' }); // missing folder + creds
    assert.throws(() => selectLiveDrivePublisher(cfg, { client: new FakeDriveClient() }),
      (e: unknown) => e instanceof LiveSandboxNotReadyError && e.issues.length > 0);
  });
  it('fake-mode config (default) is not live → throws', () => {
    assert.throws(() => selectLiveDrivePublisher(resolveSandboxConfig({}), { client: new FakeDriveClient() }),
      (e: unknown) => e instanceof LiveSandboxNotReadyError);
  });
  it('ready config + injected client returns a Drive sandbox publisher (no upload yet)', async () => {
    const client = new FakeDriveClient();
    const pub = selectLiveDrivePublisher(resolveSandboxConfig(readyEnv), { client });
    assert.equal(pub.replicaKind, 'drive');
    assert.equal(client.uploads.length, 0); // selection performs no upload
    await pub.publish(vid('AVS-1'), pdf('doc'));
    assert.equal(client.uploads[0].folderId, FOLDER);
  });
});
