/**
 * eCIgn Path B — Phase 1 contracts: branded identifiers + canonical primitives.
 *
 * CONTRACTS + PURE GUARDS ONLY. No runtime wiring, no I/O, no storage, no fetch,
 * no PDF generation, no signature application. See
 * docs/v6/V6_Final/QA13b/ECIGN_PATH_B_ARCHITECTURE_READINESS_PLAN_20260622.md.
 *
 * Branded (nominal) string ids prevent accidental cross-assignment of unrelated
 * identifiers at compile time while remaining plain strings at runtime.
 */

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ArtifactId = Brand<string, 'ArtifactId'>;
export type ArtifactVersionId = Brand<string, 'ArtifactVersionId'>;
export type FormInstanceId = Brand<string, 'FormInstanceId'>;
export type FormId = Brand<string, 'FormId'>;
export type EventId = Brand<string, 'EventId'>;
export type WorkflowId = Brand<string, 'WorkflowId'>;
export type PolicyId = Brand<string, 'PolicyId'>;
export type SignerId = Brand<string, 'SignerId'>;
export type EvidenceRecordId = Brand<string, 'EvidenceRecordId'>;
export type AuditChainId = Brand<string, 'AuditChainId'>;
export type RetentionPolicyId = Brand<string, 'RetentionPolicyId'>;
export type DriveFileId = Brand<string, 'DriveFileId'>;
export type HierarchySnapshotId = Brand<string, 'HierarchySnapshotId'>;
export type IdempotencyKey = Brand<string, 'IdempotencyKey'>;

/** ISO-8601 UTC instant (branded string), e.g. `2026-06-22T13:31:29.000Z`. */
export type IsoTimestamp = Brand<string, 'IsoTimestamp'>;

/**
 * The ONLY accepted canonical signable artifact MIME type. The signable artifact
 * is the actual filled Care Indeed form rendered to PDF — never Markdown/HTML/text.
 */
export const CANONICAL_ARTIFACT_MIME = 'application/pdf' as const;
export type CanonicalArtifactMime = typeof CANONICAL_ARTIFACT_MIME;

// Lowercase hex SHA-256 (exactly 64 hex chars). Recomputed server-side over the
// canonical bytes in real Path B; here we only validate the SHAPE of the value.
const SHA256_RE = /^[0-9a-f]{64}$/;
const ISO_UTC_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;

export function isValidSha256(value: unknown): value is string {
  return typeof value === 'string' && SHA256_RE.test(value);
}

export function isCanonicalMimeType(value: unknown): value is CanonicalArtifactMime {
  return value === CANONICAL_ARTIFACT_MIME;
}

export function isIsoTimestamp(value: unknown): value is string {
  return typeof value === 'string' && ISO_UTC_RE.test(value);
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
