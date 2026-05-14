/**
 * Storage-mode boundary for evidence artifacts.
 *
 * Why this exists
 * ───────────────
 * The app currently runs in **local/demo** mode: artifact bytes are kept
 * in IndexedDB-equivalent localStorage keys (`ces_ev_data_*`) and the
 * `regulatoryExecutionStore` (`reg-execution-v2`) keeps **metadata only**
 * (per the in-store strip-on-persist guard introduced earlier).
 *
 * AWS staging mode (Phase 1 plan) replaces the byte-storage path with:
 *   - presigned PUT to S3                  (`uploads/raw/...`)
 *   - server-side validate + promote       (Lambdas)
 *   - presigned GET for downloads          (2-min TTL)
 *
 * This module is the single seam between the two modes. Existing call
 * sites continue to work unchanged in `local-demo` mode. Wiring the
 * `aws-staging` adapter into `regulatoryExecutionStore.uploadEvidence`
 * is a **separate follow-up pass** — this file deliberately does NOT
 * change product behavior.
 *
 * Hard rules (enforced by the contract):
 *   - `reg-execution-v2` (the persisted zustand store) must hold
 *     metadata references only — no `localDataUrl`, no base64,
 *     no certificate HTML blobs, no signed-package blobs.
 *   - `aws-staging` mode never round-trips artifact bytes through
 *     localStorage.
 *   - `local-demo` mode is allowed to use IndexedDB / blob URLs for
 *     in-tab previews, but should NOT use plain localStorage for
 *     bytes > 4 MB (already enforced in `demoEvidenceRuntimeCache.ts`).
 */

export type EvidenceStorageMode = 'local-demo' | 'aws-staging';

export interface ArtifactRef {
  /** Server-assigned ID (or local UUID in demo mode). */
  evidenceId: string;
  /** Sanitized display filename. */
  filename: string;
  /** MIME from the Lambda allowlist. */
  contentType: string;
  /** Phase-1 traceability triple — required on every artifact. */
  policyId:   string;
  workflowId: string;
  eventId:    string;
  /** Storage backend that produced this ref. */
  source: EvidenceStorageMode;
  /** Where to find the bytes. Demo mode: localStorage key. AWS mode: opaque. */
  locator: { kind: 'local-cache'; cacheKey: string }
         | { kind: 'aws-evidence'; evidenceId: string };
  createdAt: string;
}

export interface UploadInitInput {
  policyId: string;
  workflowId: string;
  eventId: string;
  filename: string;
  contentType: string;
}

export interface UploadInitResult {
  uploadId: string;
  /** Presigned PUT URL in `aws-staging`; data URL passthrough in `local-demo`. */
  putUrl: string;
  /** Where the byte stream will end up. */
  locator: ArtifactRef['locator'];
  /** TTL for the put URL (seconds). */
  expiresIn: number;
}

export interface PromoteInput {
  uploadId: string;
  eventId: string;
}

export interface EvidenceStorageAdapter {
  readonly mode: EvidenceStorageMode;

  /** Reserve an upload slot + return a put target. */
  initUpload(input: UploadInitInput): Promise<UploadInitResult>;

  /** Validate the bytes (size, mime, hash) — no-op in demo. */
  validate(uploadId: string): Promise<void>;

  /** Promote validated bytes to immutable evidence. */
  promote(input: PromoteInput): Promise<ArtifactRef>;

  /** Resolve a short-lived URL the browser can render/download. */
  resolvePreviewUrl(ref: ArtifactRef): Promise<string | undefined>;

  /** List artifact metadata for a given event. */
  listEventArtifacts(eventId: string): Promise<ArtifactRef[]>;
}

// ───────────────────────────────────────────────────────────────
// Mode selection
// ───────────────────────────────────────────────────────────────

const RAW_MODE = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_EVIDENCE_STORAGE_MODE) || 'local-demo';
const VALID_MODES: ReadonlySet<EvidenceStorageMode> = new Set(['local-demo', 'aws-staging']);

export const EVIDENCE_STORAGE_MODE: EvidenceStorageMode =
  VALID_MODES.has(RAW_MODE as EvidenceStorageMode)
    ? (RAW_MODE as EvidenceStorageMode)
    : 'local-demo';

/**
 * Returns true when the current mode is allowed to hold artifact bytes
 * in the browser (IndexedDB / per-tab blob URLs). Used by call sites that
 * need to decide between embedding a preview locally vs. requesting a
 * presigned URL from the server.
 */
export const isLocalDemoMode = (): boolean => EVIDENCE_STORAGE_MODE === 'local-demo';
export const isAwsStagingMode = (): boolean => EVIDENCE_STORAGE_MODE === 'aws-staging';

// ───────────────────────────────────────────────────────────────
// Persisted-store guard — single source of truth for what is allowed
// inside `reg-execution-v2`.
// ───────────────────────────────────────────────────────────────

/**
 * Field names the persisted regulatoryExecutionStore must NEVER serialize.
 * Used by the persist middleware's `partialize` and by the runtime
 * `assertNoArtifactPayload()` guard below.
 */
export const FORBIDDEN_PERSIST_FIELDS = [
  'localDataUrl',
  'base64',
  'rawBytes',
  'pdfBlob',
  'signedPacketBlob',
  'certificateHtml',
  'htmlSnapshot',
] as const;

export type ForbiddenPersistField = typeof FORBIDDEN_PERSIST_FIELDS[number];

/**
 * Dev-time guard: throws (in dev) or warns (in prod) when an object
 * about to be written into the persisted store carries an artifact
 * payload field. Cheap to call; safe in hot paths because it only
 * iterates a small constant list.
 */
export function assertNoArtifactPayload(
  obj: unknown,
  context: string,
): void {
  if (!obj || typeof obj !== 'object') return;
  const rec = obj as Record<string, unknown>;
  for (const k of FORBIDDEN_PERSIST_FIELDS) {
    if (k in rec && rec[k] != null && rec[k] !== '') {
      const msg = `[storageMode] Persisted-store guard tripped: field "${k}" is not allowed in ${context}.`;
      if (import.meta.env?.DEV) throw new Error(msg);
      // eslint-disable-next-line no-console
      console.warn(msg);
      return;
    }
  }
}

// ───────────────────────────────────────────────────────────────
// Adapter resolution
// ───────────────────────────────────────────────────────────────

import { localDemoAdapter } from './storage/localDemoAdapter';
import { awsStagingAdapter } from './storage/awsStagingAdapter';

let cached: EvidenceStorageAdapter | null = null;

export function getEvidenceStorageAdapter(): EvidenceStorageAdapter {
  if (cached) return cached;
  cached = isAwsStagingMode() ? awsStagingAdapter : localDemoAdapter;
  return cached;
}

/** Test-only: reset the cached adapter so a different mode can be picked. */
export function __resetStorageAdapterForTests(): void {
  cached = null;
}
