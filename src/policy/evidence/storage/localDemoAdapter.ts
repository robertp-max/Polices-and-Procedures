/**
 * Local-demo evidence storage adapter.
 *
 * Wraps the existing `demoEvidenceRuntimeCache` (per-tab Map +
 * localStorage bridge) so demo flows continue to work unchanged.
 *
 * No network calls. Bytes never leave the browser.
 */

import {
  peekDemoEvidenceDataUrl,
  stashDemoEvidenceDataUrl,
} from '../demoEvidenceRuntimeCache';
import type {
  ArtifactRef,
  EvidenceStorageAdapter,
  PromoteInput,
  UploadInitInput,
  UploadInitResult,
} from '../storageMode';

const newId = (prefix: string): string =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const localDemoAdapter: EvidenceStorageAdapter = {
  mode: 'local-demo',

  async initUpload(input: UploadInitInput): Promise<UploadInitResult> {
    const uploadId = newId('demo-up');
    const cacheKey = `${input.eventId}__${uploadId}`;
    return {
      uploadId,
      // In demo mode the "PUT URL" is a synthetic marker. Callers that
      // already write directly into demoEvidenceRuntimeCache should keep
      // doing so; this adapter exists so AWS staging can drop in cleanly.
      putUrl: `demo://${cacheKey}`,
      locator: { kind: 'local-cache', cacheKey },
      expiresIn: 0,
    };
  },

  async validate(_uploadId: string): Promise<void> {
    // No-op in demo mode — bytes are already in the cache.
  },

  async promote(input: PromoteInput): Promise<ArtifactRef> {
    const evidenceId = newId('demo-ev');
    return {
      evidenceId,
      filename: 'demo-artifact',
      contentType: 'application/octet-stream',
      policyId:   '__demo__',
      workflowId: '__demo__',
      eventId:    input.eventId,
      source: 'local-demo',
      locator: { kind: 'local-cache', cacheKey: `${input.eventId}__${input.uploadId}` },
      createdAt: new Date().toISOString(),
    };
  },

  async resolvePreviewUrl(ref: ArtifactRef): Promise<string | undefined> {
    if (ref.locator.kind !== 'local-cache') return undefined;
    return peekDemoEvidenceDataUrl(ref.evidenceId);
  },

  async listEventArtifacts(_eventId: string): Promise<ArtifactRef[]> {
    // Demo mode reads metadata directly from regulatoryExecutionStore;
    // this adapter does not duplicate that listing. Returning an empty
    // array is safe — call sites that need the live demo list should
    // continue to subscribe to the store.
    return [];
  },
};

/** Convenience helper for demo-only flows: stash bytes against an evidenceId. */
export const stashDemoArtifact = (
  evidenceId: string,
  dataUrl: string | undefined,
): void => {
  stashDemoEvidenceDataUrl(evidenceId, dataUrl);
};
