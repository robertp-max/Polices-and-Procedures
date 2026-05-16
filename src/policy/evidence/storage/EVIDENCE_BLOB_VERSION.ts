/**
 * Evidence blob IndexedDB schema version.
 *
 * Per MVP plan L1208 ("EVIDENCE-001 — cache version bump; old browsers
 * re-init; no data loss"): bump this constant when the IDB schema changes.
 * Old browsers without IDB silently fall back to memory + localStorage
 * (no data loss because writes are dual-channel — see demoEvidenceRuntimeCache.ts).
 *
 * Bump to 2 when adding new object stores or indexes.
 */
export const EVIDENCE_BLOB_DB_VERSION = 1;
