/**
 * Cross-tab evidence data cache — triple-channel write strategy.
 *
 * ## Problem solved
 * Artifact Viewer opens in a new browser tab, but uploaded file bytes
 * (data URLs) were stored in a per-tab Map that the new tab cannot access.
 * This module writes to localStorage (shared across same-origin tabs) so
 * signed forms and uploaded documents are viewable/downloadable from any tab.
 *
 * ## Triple-channel write (memory + localStorage + IndexedDB)
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  Channel        │  Limit      │  Scope          │  Durability    │
 * │─────────────────┼─────────────┼─────────────────┼────────────────│
 * │  memory Map     │  unbounded  │  current tab     │  none (reset)  │
 * │  localStorage   │  ~4 MB/item │  all same-origin │  session/perm  │
 * │  IndexedDB      │  disk quota │  all same-origin │  persistent    │
 * └──────────────────────────────────────────────────────────────────┘
 *
 * Writes go to all three channels simultaneously (IDB is fire-and-forget).
 * Reads prefer the fastest available channel: memory → localStorage → IDB.
 * Synchronous callers use peekDemoEvidenceDataUrl / resolveEvidenceDataUrl
 * (unchanged API); async callers can use the new *Async siblings which also
 * check IDB.
 *
 * ## Consumer page warm-up
 * For files >4 MB that bypass localStorage, call
 *   `await prefetchDemoEvidenceFromIdb([...evidenceIds])`
 * on component mount to load IDB blobs into the memory cache before any
 * synchronous peekDemoEvidenceDataUrl calls happen.
 *
 * Persist layer still strips localDataUrl from the zustand store to keep
 * the main store lean. This cache is the cross-tab bridge.
 *
 * Schema version: imported from EVIDENCE_BLOB_VERSION.ts so future IDB
 * schema bumps are co-located with the cache logic.
 */

import {
  idbPutEvidenceBlob,
  idbGetEvidenceBlob,
  idbDeleteEvidenceBlob,
} from './storage/indexedDbEvidenceBlobStore';
// Re-export so callers can reference the version without a separate import.
export { EVIDENCE_BLOB_DB_VERSION as STORAGE_VERSION } from './storage/EVIDENCE_BLOB_VERSION';

const STORAGE_PREFIX = 'ces_ev_data_';
const MAX_ITEM_BYTES = 4_000_000; // skip localStorage for items > 4MB

const memCache = new Map<string, string>();

export function stashDemoEvidenceDataUrl(evidenceId: string, dataUrl: string | undefined): void {
  if (!evidenceId || !dataUrl) return;
  // Channel 1 — memory (synchronous, same-tab)
  memCache.set(evidenceId, dataUrl);
  // Channel 2 — localStorage (≤4 MB; cross-tab; synchronous write)
  if (dataUrl.length <= MAX_ITEM_BYTES) {
    try {
      localStorage.setItem(STORAGE_PREFIX + evidenceId, dataUrl);
    } catch {
      // quota exceeded — memory cache still works for same-tab
    }
  }
  // Channel 3 — IndexedDB (unbounded; cross-tab; fire-and-forget async write)
  void idbPutEvidenceBlob(evidenceId, dataUrl);
}

export function peekDemoEvidenceDataUrl(evidenceId: string): string | undefined {
  const mem = memCache.get(evidenceId);
  if (mem) return mem;
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + evidenceId);
    if (stored) {
      memCache.set(evidenceId, stored);
      return stored;
    }
  } catch {
    // localStorage unavailable
  }
  return undefined;
}

export function clearDemoEvidenceDataUrl(evidenceId: string): void {
  memCache.delete(evidenceId);
  try {
    localStorage.removeItem(STORAGE_PREFIX + evidenceId);
  } catch {
    // ignore
  }
  // Remove from IDB (fire-and-forget)
  void idbDeleteEvidenceBlob(evidenceId);
}

/**
 * Wipe every entry from both the in-memory cache and localStorage.
 * Call this on a full sandbox/store reset so stale evidence blobs
 * don't survive in memory across the same browser session.
 */
export function clearAllDemoEvidenceDataUrls(): void {
  memCache.clear();
  const keysToRemove: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(STORAGE_PREFIX)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/** Clear all persisted form-field values (ci_form_fields_* keys) for an event's form instances. */
export function clearFormFieldsForIds(formInstanceIds: string[]): void {
  if (!formInstanceIds.length) return;
  const idSet = new Set(formInstanceIds);
  const keysToRemove: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith('ci_form_fields_')) continue;
      const instanceId = k.slice('ci_form_fields_'.length);
      if (idSet.has(instanceId)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/** Clear ALL persisted form-field values from localStorage. */
export function clearAllFormFields(): void {
  const keysToRemove: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ci_form_fields_')) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

/** Prefer in-doc URL, then cross-tab cache (localStorage), then memory cache. */
export function resolveEvidenceDataUrl(doc: { id: string; localDataUrl?: string }): string | undefined {
  if (doc.localDataUrl) return doc.localDataUrl;
  return peekDemoEvidenceDataUrl(doc.id);
}

/**
 * Async variant of `resolveEvidenceDataUrl` that also checks IndexedDB as a
 * final fallback. Use this on pages that need files >4 MB after a page reload
 * when the memory + localStorage channels are cold.
 *
 * Consumer pages that call this in a hot render path should prefer calling
 * `prefetchDemoEvidenceFromIdb([...ids])` on mount to warm the memory cache
 * first, then use the synchronous `resolveEvidenceDataUrl` thereafter.
 */
export async function resolveEvidenceDataUrlAsync(
  doc: { id: string; localDataUrl?: string },
): Promise<string | undefined> {
  const sync = resolveEvidenceDataUrl(doc);
  if (sync) return sync;
  const fromIdb = await idbGetEvidenceBlob(doc.id);
  if (fromIdb) {
    // Warm the memory cache so subsequent sync calls also hit
    memCache.set(doc.id, fromIdb);
  }
  return fromIdb;
}

/**
 * Async variant of `peekDemoEvidenceDataUrl` that checks memory → localStorage
 * → IndexedDB in order. Suitable when the caller can await but needs to
 * handle the large-file case after a hard page reload.
 */
export async function peekDemoEvidenceDataUrlAsync(evidenceId: string): Promise<string | undefined> {
  const sync = peekDemoEvidenceDataUrl(evidenceId);
  if (sync) return sync;
  const fromIdb = await idbGetEvidenceBlob(evidenceId);
  if (fromIdb) {
    memCache.set(evidenceId, fromIdb);
  }
  return fromIdb;
}

/**
 * Warm the in-memory cache from IndexedDB for the given evidence IDs.
 *
 * Call this on component mount when displaying evidence that may exceed the
 * 4 MB localStorage threshold (i.e. large uploaded files or signed PDFs).
 * After this resolves, synchronous `peekDemoEvidenceDataUrl` and
 * `resolveEvidenceDataUrl` calls will hit the memory cache rather than
 * falling back to IDB on every render.
 *
 * IDs already present in memory are skipped. IDs absent from IDB are ignored.
 */
export async function prefetchDemoEvidenceFromIdb(evidenceIds: string[]): Promise<void> {
  const missing = evidenceIds.filter(id => id && !memCache.has(id));
  if (!missing.length) return;
  await Promise.all(
    missing.map(async (id) => {
      const dataUrl = await idbGetEvidenceBlob(id);
      if (dataUrl) memCache.set(id, dataUrl);
    }),
  );
}

/**
 * Very large `data:text/html,...` URLs exceed practical iframe/navigation limits and render blank.
 * Convert to a same-session blob: URL for reliable preview (caller should revoke when discarding).
 */
export function dataUrlToBlobUrlForHtml(dataUrl: string): string | undefined {
  if (!dataUrl.startsWith('data:text/html')) return undefined;
  const comma = dataUrl.indexOf(',');
  if (comma < 0) return undefined;
  const meta = dataUrl.slice(5, comma);
  const payload = dataUrl.slice(comma + 1);
  let html: string;
  if (/;base64/i.test(meta)) {
    try {
      html = atob(payload.replace(/\s/g, ''));
    } catch {
      return undefined;
    }
  } else {
    try {
      html = decodeURIComponent(payload);
    } catch {
      return undefined;
    }
  }
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  return URL.createObjectURL(blob);
}
