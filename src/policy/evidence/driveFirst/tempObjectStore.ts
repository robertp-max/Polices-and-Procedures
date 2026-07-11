/**
 * Drive-first evidence architecture — TEMPORARY object store contract.
 *
 * Google Cloud Storage, when used, is temporary processing infrastructure:
 * upload staging, quarantine, scanning, hashing, packet builds. There is NO
 * permanent evidence bucket — an object that outlives its processing job is
 * an architecture defect. The in-memory implementation is a deterministic
 * mock; the live implementation is a lifecycle-cleaned GCS bucket
 * (TEMP_UPLOAD_BUCKET).
 */

export interface TempObject {
  path: string;
  bytes: Uint8Array;
  mimeType: string;
}

export interface TempObjectStore {
  put(path: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  get(path: string): Promise<TempObject | null>;
  exists(path: string): Promise<boolean>;
  delete(path: string): Promise<void>;
  /** Count of live temporary objects — used to prove cleanup happened. */
  objectCount(): Promise<number>;
  list(prefix?: string): Promise<string[]>;
}

/** Approved temporary path builders. IDs only — never PHI in paths. */
export function tempUploadPath(uid: string, uploadSessionId: string, safeFileName: string): string {
  return `temporary-uploads/${uid}/${uploadSessionId}/${safeFileName}`;
}

export function quarantinePath(uploadSessionId: string, safeFileName: string): string {
  return `quarantine/${uploadSessionId}/${safeFileName}`;
}

export function packetBuildPath(exportId: string, safeFileName: string): string {
  return `packet-build/${exportId}/${safeFileName}`;
}

export class InMemoryTempObjectStore implements TempObjectStore {
  private objects = new Map<string, TempObject>();

  async put(path: string, bytes: Uint8Array, mimeType: string): Promise<void> {
    this.objects.set(path, { path, bytes: bytes.slice(), mimeType });
  }

  async get(path: string): Promise<TempObject | null> {
    const o = this.objects.get(path);
    return o ? { ...o, bytes: o.bytes.slice() } : null;
  }

  async exists(path: string): Promise<boolean> {
    return this.objects.has(path);
  }

  async delete(path: string): Promise<void> {
    this.objects.delete(path);
  }

  async objectCount(): Promise<number> {
    return this.objects.size;
  }

  async list(prefix = ''): Promise<string[]> {
    return [...this.objects.keys()].filter((p) => p.startsWith(prefix));
  }
}
