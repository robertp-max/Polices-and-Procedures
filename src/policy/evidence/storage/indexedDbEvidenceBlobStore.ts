/**
 * IndexedDB persistence layer for evidence blobs.
 *
 * Single object store `evidence_blobs` keyed by `evidenceId`.
 * Designed as a pure read/write seam — no business logic lives here.
 *
 * Feature detection: all exported functions check `idbIsAvailable()` internally
 * and return safe defaults when IDB is absent (SSR, older browsers, private mode
 * with storage blocked). Callers never need to guard.
 *
 * Schema version is imported from EVIDENCE_BLOB_VERSION.ts so a single
 * constant bump triggers migration across the whole pipeline.
 */

import { EVIDENCE_BLOB_DB_VERSION } from './EVIDENCE_BLOB_VERSION';

export const EVIDENCE_BLOB_DB_NAME = 'ci_evidence_blobs';
export { EVIDENCE_BLOB_DB_VERSION };

const STORE_NAME = 'evidence_blobs';

export interface EvidenceBlobRecord {
  evidenceId: string;
  dataUrl: string;
  createdAt: string; // ISO 8601
}

// ---------------------------------------------------------------------------
// Internal DB handle (module-level singleton; lazily opened)
// ---------------------------------------------------------------------------

let _dbPromise: Promise<IDBDatabase> | null = null;

function _openDb(): Promise<IDBDatabase> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(EVIDENCE_BLOB_DB_NAME, EVIDENCE_BLOB_DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'evidenceId' });
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // When another tab/window opens a newer version, close this handle so
      // the upgrade can proceed without being blocked.
      db.onversionchange = () => {
        db.close();
        _dbPromise = null;
      };

      resolve(db);
    };

    request.onerror = () => {
      _dbPromise = null;
      reject(request.error);
    };

    request.onblocked = () => {
      // Another tab holds an older version open; resolve with null sentinel
      // by rejecting so callers fall back gracefully.
      _dbPromise = null;
      reject(new DOMException('IDB open blocked', 'AbortError'));
    };
  });

  return _dbPromise;
}

// ---------------------------------------------------------------------------
// Feature detection
// ---------------------------------------------------------------------------

/**
 * Returns true if IndexedDB is available and functional in this environment.
 * Performs a lightweight probe open so that private-mode browsers that
 * expose `indexedDB` but throw on use are also detected correctly.
 */
export async function idbIsAvailable(): Promise<boolean> {
  if (typeof indexedDB === 'undefined') return false;
  try {
    await _openDb();
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

/**
 * Persist a blob data URL keyed by `evidenceId`.
 * Silently no-ops when IDB is unavailable or the write fails (e.g. quota).
 */
export async function idbPutEvidenceBlob(evidenceId: string, dataUrl: string): Promise<void> {
  if (!evidenceId || !dataUrl) return;
  try {
    const db = await _openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const record: EvidenceBlobRecord = {
        evidenceId,
        dataUrl,
        createdAt: new Date().toISOString(),
      };
      const req = tx.objectStore(STORE_NAME).put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // IDB unavailable, quota exceeded, or version conflict — silent fallback
  }
}

/**
 * Retrieve a blob data URL by `evidenceId`.
 * Returns `undefined` when the record is absent or IDB is unavailable.
 */
export async function idbGetEvidenceBlob(evidenceId: string): Promise<string | undefined> {
  if (!evidenceId) return undefined;
  try {
    const db = await _openDb();
    return await new Promise<string | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(evidenceId);
      req.onsuccess = () => {
        const record = req.result as EvidenceBlobRecord | undefined;
        resolve(record?.dataUrl);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

/**
 * Remove a single blob record by `evidenceId`.
 * Silent no-op when IDB is unavailable.
 */
export async function idbDeleteEvidenceBlob(evidenceId: string): Promise<void> {
  if (!evidenceId) return;
  try {
    const db = await _openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const req = tx.objectStore(STORE_NAME).delete(evidenceId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // silent
  }
}

/**
 * Return all stored evidence IDs.
 * Returns an empty array when IDB is unavailable.
 */
export async function idbListEvidenceBlobIds(): Promise<string[]> {
  try {
    const db = await _openDb();
    return await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAllKeys();
      req.onsuccess = () => resolve((req.result as string[]) ?? []);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}
