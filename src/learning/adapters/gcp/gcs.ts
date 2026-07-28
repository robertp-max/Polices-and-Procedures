/**
 * Care Indeed LMS — Google Cloud Storage artifact adapter (ADR-LEARNING-005).
 *
 * ⚠️ UNVERIFIED. Requires `@google-cloud/storage` + credentials. Implements the
 * ArtifactStore port: staging bucket for pending uploads, artifacts bucket for
 * validated evidence / certificate PDFs / signed manifests. Use bucket versioning +
 * Object Lock (retention) for immutability where the approved retention design permits.
 */
// @ts-nocheck — depends on @google-cloud/storage
import { Storage } from '@google-cloud/storage';
import { createHash } from 'node:crypto';
import type { ArtifactStore } from '../../domain/ports';

export class GcsArtifactStore implements ArtifactStore {
  constructor(
    private storage: Storage,
    private stagingBucket: string, // cihh-learning-upload-staging-{env}
    private artifactsBucket: string, // cihh-learning-artifacts-{env}
  ) {}

  private sha256(bytes: Uint8Array): string {
    return `sha256:${createHash('sha256').update(Buffer.from(bytes)).digest('hex')}`;
  }

  async putStaging(key: string, bytes: Uint8Array, contentType: string): Promise<{ locator: string; sha256: string }> {
    const file = this.storage.bucket(this.stagingBucket).file(key);
    await file.save(Buffer.from(bytes), { contentType, resumable: false });
    return { locator: `gs://${this.stagingBucket}/${key}`, sha256: this.sha256(bytes) };
  }

  async promote(stagingLocator: string): Promise<{ locator: string; versionId: string; sha256: string }> {
    const key = stagingLocator.replace(`gs://${this.stagingBucket}/`, '');
    const src = this.storage.bucket(this.stagingBucket).file(key);
    const dst = this.storage.bucket(this.artifactsBucket).file(key);
    await src.copy(dst);
    const [metadata] = await dst.getMetadata();
    const [bytes] = await dst.download();
    return {
      locator: `gs://${this.artifactsBucket}/${key}`,
      versionId: String(metadata.generation),
      sha256: this.sha256(bytes),
    };
  }

  async signedDownloadUrl(locator: string, ttlSeconds: number): Promise<string> {
    const [bucket, ...rest] = locator.replace('gs://', '').split('/');
    const [url] = await this.storage
      .bucket(bucket)
      .file(rest.join('/'))
      .getSignedUrl({ action: 'read', expires: Date.now() + ttlSeconds * 1000 });
    return url;
  }
}
