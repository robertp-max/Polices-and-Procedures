/**
 * Drive-first evidence architecture — canonical Drive repository contract.
 *
 * The interface below is the boundary a Google Drive adapter must satisfy.
 * The LIVE adapter is the existing `server/googleDrive.ts` (service-account
 * auth, Shared-Drive aware, find-or-create folders); this contract adds the
 * idempotency and verification semantics Phase 2F requires. The in-memory
 * implementation here is a deterministic mock for tests and local/emulator
 * runs — it performs no network I/O and creates no cloud resources.
 */

export type DriveRepositoryErrorCode =
  | 'not_found'
  | 'access_denied'
  | 'validation_error'
  | 'upstream_error';

export class DriveRepositoryError extends Error {
  readonly code: DriveRepositoryErrorCode;
  constructor(code: DriveRepositoryErrorCode, message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = 'DriveRepositoryError';
  }
}

export interface DriveFileMetadata {
  fileId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  webViewLink: string;
  revisionId: string;
  modifiedTime: string;
  parentFolderId: string;
  trashed: boolean;
  /**
   * Custom key/value properties on the Drive file. The live adapter maps this
   * to Drive `appProperties` — the reconciliation key (`commandId`) lives here
   * so a retry can find an already-created file without duplicating it.
   */
  appProperties: Record<string, string>;
}

export interface CreateDriveFileInput {
  /** Idempotency key (commandId). Same key → same file, never a duplicate. */
  idempotencyKey: string;
  parentFolderId: string;
  name: string;
  mimeType: string;
  bytes: Uint8Array;
}

export interface DriveEvidenceRepository {
  /**
   * Create a file idempotently. If a non-trashed file already exists for
   * `idempotencyKey`, return its metadata instead of creating a duplicate.
   */
  createFile(input: CreateDriveFileInput): Promise<DriveFileMetadata>;
  /** Locate a previously created file by idempotency key (reconciliation). */
  findByIdempotencyKey(key: string): Promise<DriveFileMetadata | null>;
  /** Retrieve metadata. Throws not_found / access_denied. */
  getFileMetadata(fileId: string): Promise<DriveFileMetadata>;
  /** Retrieve raw bytes (server-side only). Throws not_found / access_denied. */
  getFileBytes(fileId: string): Promise<Uint8Array>;
  /** Update descriptive metadata without ever changing the fileId. */
  updateFileMetadata(fileId: string, patch: { name?: string; appProperties?: Record<string, string> }): Promise<DriveFileMetadata>;
  /** Stable canonical link for a file id. */
  fileUrl(fileId: string): string;
  /** All non-trashed file ids (orphan scans / test assertions). */
  listAllFileIds(): Promise<string[]>;
  /** Count of live (non-trashed) files — test/verification helper. */
  fileCount(): Promise<number>;
}

/* ─── Deterministic in-memory adapter ────────────────────────────────────── */

interface StoredFile {
  meta: DriveFileMetadata;
  bytes: Uint8Array;
  accessRevoked: boolean;
}

/** Deterministic mock Drive. No wall-clock, no randomness. */
export class InMemoryDriveEvidenceRepository implements DriveEvidenceRepository {
  private files = new Map<string, StoredFile>();
  private byIdempotencyKey = new Map<string, string>();
  private seq = 0;
  private tick = 0;

  private nextTimestamp(): string {
    this.tick += 1;
    return `2026-01-01T00:00:${String(this.tick % 60).padStart(2, '0')}.${String(this.tick).padStart(3, '0')}Z`;
  }

  async createFile(input: CreateDriveFileInput): Promise<DriveFileMetadata> {
    if (!input.idempotencyKey) throw new DriveRepositoryError('validation_error', 'idempotencyKey is required.');
    if (!input.bytes || input.bytes.length === 0) throw new DriveRepositoryError('validation_error', 'empty file bytes.');
    const existingId = this.byIdempotencyKey.get(input.idempotencyKey);
    if (existingId) {
      const existing = this.files.get(existingId);
      if (existing && !existing.meta.trashed) return { ...existing.meta };
    }
    this.seq += 1;
    const fileId = `drive-file-${String(this.seq).padStart(4, '0')}`;
    const meta: DriveFileMetadata = {
      fileId,
      name: input.name,
      mimeType: input.mimeType,
      sizeBytes: input.bytes.length,
      webViewLink: this.fileUrl(fileId),
      revisionId: `rev-${fileId}-1`,
      modifiedTime: this.nextTimestamp(),
      parentFolderId: input.parentFolderId,
      trashed: false,
      appProperties: { commandId: input.idempotencyKey },
    };
    this.files.set(fileId, { meta, bytes: input.bytes.slice(), accessRevoked: false });
    this.byIdempotencyKey.set(input.idempotencyKey, fileId);
    return { ...meta };
  }

  async findByIdempotencyKey(key: string): Promise<DriveFileMetadata | null> {
    const id = this.byIdempotencyKey.get(key);
    if (!id) return null;
    const f = this.files.get(id);
    return f ? { ...f.meta } : null;
  }

  async getFileMetadata(fileId: string): Promise<DriveFileMetadata> {
    const f = this.files.get(fileId);
    if (!f) throw new DriveRepositoryError('not_found', `Drive file ${fileId} not found.`);
    if (f.accessRevoked) throw new DriveRepositoryError('access_denied', `Access to Drive file ${fileId} denied.`);
    return { ...f.meta };
  }

  async getFileBytes(fileId: string): Promise<Uint8Array> {
    const f = this.files.get(fileId);
    if (!f) throw new DriveRepositoryError('not_found', `Drive file ${fileId} not found.`);
    if (f.accessRevoked) throw new DriveRepositoryError('access_denied', `Access to Drive file ${fileId} denied.`);
    return f.bytes.slice();
  }

  async updateFileMetadata(
    fileId: string,
    patch: { name?: string; appProperties?: Record<string, string> },
  ): Promise<DriveFileMetadata> {
    const f = this.files.get(fileId);
    if (!f) throw new DriveRepositoryError('not_found', `Drive file ${fileId} not found.`);
    if (f.accessRevoked) throw new DriveRepositoryError('access_denied', `Access to Drive file ${fileId} denied.`);
    if (patch.name) f.meta.name = patch.name;
    if (patch.appProperties) f.meta.appProperties = { ...f.meta.appProperties, ...patch.appProperties };
    f.meta.modifiedTime = this.nextTimestamp();
    return { ...f.meta };
  }

  fileUrl(fileId: string): string {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  async listAllFileIds(): Promise<string[]> {
    return [...this.files.values()].filter((f) => !f.meta.trashed).map((f) => f.meta.fileId);
  }

  async fileCount(): Promise<number> {
    return (await this.listAllFileIds()).length;
  }

  /* ── Test/simulation controls (mirror real-world Drive failure modes) ── */

  /** Simulate a user trashing the file in Drive. */
  simulateTrash(fileId: string): void {
    const f = this.files.get(fileId);
    if (f) f.meta.trashed = true;
  }

  /** Simulate the service identity losing access. */
  simulateAccessLoss(fileId: string): void {
    const f = this.files.get(fileId);
    if (f) f.accessRevoked = true;
  }

  /** Simulate the file being moved to another folder. */
  simulateMove(fileId: string, newParentFolderId: string): void {
    const f = this.files.get(fileId);
    if (f) f.meta.parentFolderId = newParentFolderId;
  }

  /** Simulate an out-of-band content edit (revision bump + byte change). */
  simulateContentTamper(fileId: string, newBytes: Uint8Array): void {
    const f = this.files.get(fileId);
    if (!f) return;
    f.bytes = newBytes.slice();
    f.meta.sizeBytes = newBytes.length;
    const revisionNumber = Number(f.meta.revisionId.split('-').pop() ?? '1') + 1;
    f.meta.revisionId = `rev-${fileId}-${revisionNumber}`;
    f.meta.modifiedTime = this.nextTimestamp();
  }

  /** Simulate the file being deleted entirely (missing). */
  simulateHardDelete(fileId: string): void {
    this.files.delete(fileId);
  }
}
