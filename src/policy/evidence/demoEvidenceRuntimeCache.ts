/**
 * Cross-tab evidence data cache.
 *
 * Problem solved: Artifact Viewer opens in a new browser tab, but uploaded
 * file bytes (data URLs) were stored in a per-tab Map that the new tab
 * cannot access. This module now writes to localStorage (shared across
 * all tabs from the same origin) so signed forms and uploaded documents
 * are viewable, downloadable, and printable from any tab.
 *
 * Persist layer still strips localDataUrl from the zustand store to keep
 * the main store lean. This cache is the cross-tab bridge.
 */

const STORAGE_PREFIX = 'ces_ev_data_';
const MAX_ITEM_BYTES = 4_000_000; // skip localStorage for items > 4MB

const memCache = new Map<string, string>();

export function stashDemoEvidenceDataUrl(evidenceId: string, dataUrl: string | undefined): void {
  if (!evidenceId || !dataUrl) return;
  memCache.set(evidenceId, dataUrl);
  if (dataUrl.length <= MAX_ITEM_BYTES) {
    try {
      localStorage.setItem(STORAGE_PREFIX + evidenceId, dataUrl);
    } catch {
      // quota exceeded — memory cache still works for same-tab
    }
  }
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
