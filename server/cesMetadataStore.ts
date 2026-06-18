import fs from 'node:fs';
import path from 'node:path';
import { env } from './env.js';
import { log } from './logger.js';
import { ApiError } from './errors.js';

/* ═══════════════════════════════════════════════════════════════
   CES metadata store — the NON-PHI operational metadata backend.

   This is the single seam for CES execution/evidence METADATA:
     - DynamoDB in production  (CES_METADATA_PROVIDER=dynamodb_metadata)
     - file-backed locally     (CES_METADATA_PROVIDER=file_local, default)

   Stores ONLY metadata + pointers + status — NEVER file bytes, NEVER PHI.
   File bodies live in Google Drive; Calendar indexes them; this store keeps
   the operational truth (event/task/form/signature/evidence-pointer state).

   There is intentionally NO localStorage path here. The browser persists
   nothing for CES — it loads/saves through this backend.
   ═══════════════════════════════════════════════════════════════ */

/** Field names that signal a file body / blob — forbidden in metadata. */
const FORBIDDEN_METADATA_FIELDS = [
  'localDataUrl', 'base64', 'rawBytes', 'pdfBlob',
  'signedPacketBlob', 'certificateHtml', 'htmlSnapshot',
];

export interface CesEvidenceRef {
  storageProvider: 'google_drive_calendar';
  evidenceId: string;
  eventId: string;
  workflowId?: string;
  taskId: string;
  formId?: string;
  formInstanceId?: string;
  evidenceRequirementId?: string;
  supportTaskId?: string;
  calendarEventId?: string;
  driveFileId: string;
  driveFileUrl: string;
  driveFolderId?: string;
  mimeType?: string;
  fileName: string;
  uploadedAt: string;
  uploadedBy?: string;
  attachmentStatus: 'attached' | 'pending_attach' | 'attach_failed' | 'not_attached' | 'removed';
  contentStatus: 'available' | 'metadata_only' | 'missing';
  hash?: string;
  artifactId?: string;
  pdfVersion?: number;
  status?: string;
  signerSlotOrder?: number;
  signerUserId?: string;
  signerRole?: string;
  signerTier?: number;
  signerDomain?: string;
  signedAt?: string;
  priorDocumentHash?: string;
  finalDocumentHash?: string;
  auditEventIds?: string[];
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Opaque, non-PHI CES metadata snapshot (mirrors the FE execution metadata). */
export interface CesSnapshot {
  schemaVersion: number;
  workspaceId: string;
  updatedAt: string;
  [key: string]: unknown;
}

export interface CesMetadataStore {
  readonly provider: 'dynamodb_metadata' | 'file_local';
  getSnapshot(workspaceId: string): Promise<CesSnapshot | null>;
  putSnapshot(snapshot: CesSnapshot): Promise<CesSnapshot>;
  listEvidence(eventId: string): Promise<CesEvidenceRef[]>;
  upsertEvidence(ref: CesEvidenceRef): Promise<CesEvidenceRef>;
  health(): Promise<{ ok: boolean; provider: string; error?: string }>;
}

/**
 * Reject any object that smuggles a file body / blob into metadata. Throws so
 * the route returns a typed validation error rather than silently persisting
 * bytes.
 */
export function assertNoFileBytes(obj: unknown, context: string): void {
  const seen = new Set<unknown>();
  const walk = (node: unknown) => {
    if (node == null || typeof node !== 'object') return;
    if (seen.has(node)) return;
    seen.add(node);
    if (Array.isArray(node)) { node.forEach(walk); return; }
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      if (FORBIDDEN_METADATA_FIELDS.includes(k) && v != null && v !== '') {
        throw new ApiError('validation_error', `CES metadata may not contain file bytes ("${k}") in ${context}.`, 400);
      }
      walk(v);
    }
  };
  walk(obj);
}

/* ─── File-backed implementation (local/dev — no AWS needed) ─────── */

class FileCesMetadataStore implements CesMetadataStore {
  readonly provider = 'file_local' as const;
  private dir = path.join(env.repoRoot, '.cache', 'ces-metadata');
  private snapDir = path.join(this.dir, 'snapshots');
  private evDir = path.join(this.dir, 'evidence');

  private ensure() {
    for (const d of [this.dir, this.snapDir, this.evDir]) {
      if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    }
  }
  private readJson<T>(file: string, fallback: T): T {
    try {
      if (!fs.existsSync(file)) return fallback;
      return JSON.parse(fs.readFileSync(file, 'utf8')) as T;
    } catch (e) {
      log.warn('ces_metadata.read.failed', { file, error: (e as Error).message });
      return fallback;
    }
  }
  private writeJson(file: string, value: unknown) {
    this.ensure();
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2), 'utf8');
    fs.renameSync(tmp, file);
  }
  private safe(id: string) { return id.replace(/[^A-Za-z0-9._-]/g, '_'); }

  async getSnapshot(workspaceId: string): Promise<CesSnapshot | null> {
    this.ensure();
    return this.readJson<CesSnapshot | null>(path.join(this.snapDir, `${this.safe(workspaceId)}.json`), null);
  }
  async putSnapshot(snapshot: CesSnapshot): Promise<CesSnapshot> {
    assertNoFileBytes(snapshot, 'putSnapshot');
    const next = { ...snapshot, updatedAt: new Date().toISOString() };
    this.writeJson(path.join(this.snapDir, `${this.safe(snapshot.workspaceId)}.json`), next);
    return next;
  }
  async listEvidence(eventId: string): Promise<CesEvidenceRef[]> {
    this.ensure();
    return this.readJson<CesEvidenceRef[]>(path.join(this.evDir, `${this.safe(eventId)}.json`), []);
  }
  async upsertEvidence(ref: CesEvidenceRef): Promise<CesEvidenceRef> {
    assertNoFileBytes(ref, 'upsertEvidence');
    const file = path.join(this.evDir, `${this.safe(ref.eventId)}.json`);
    const rows = this.readJson<CesEvidenceRef[]>(file, []);
    // Dedupe by eventId + driveFileId (and logical evidenceId).
    const next = rows.filter(r => r.driveFileId !== ref.driveFileId && r.evidenceId !== ref.evidenceId);
    next.push(ref);
    this.writeJson(file, next);
    return ref;
  }
  async health() { return { ok: true, provider: this.provider }; }
}

/* ─── DynamoDB implementation (production metadata backend) ──────── */

class DynamoCesMetadataStore implements CesMetadataStore {
  readonly provider = 'dynamodb_metadata' as const;
  private table = env.cesMetadataTableName;
  // Lazily-created DynamoDB document client (kept untyped to avoid a hard SDK
  // type dependency in file-local mode / validators).
  private doc: { send: (cmd: unknown) => Promise<unknown> } | null = null;
  private cmds: Record<string, new (i: unknown) => unknown> | null = null;

  private async client() {
    if (this.doc && this.cmds) return { doc: this.doc, cmds: this.cmds };
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const lib = await import('@aws-sdk/lib-dynamodb');
    const base = new DynamoDBClient({ region: env.awsRegion || 'us-west-1' });
    this.doc = lib.DynamoDBDocumentClient.from(base) as unknown as { send: (cmd: unknown) => Promise<unknown> };
    this.cmds = {
      Get: lib.GetCommand as unknown as new (i: unknown) => unknown,
      Put: lib.PutCommand as unknown as new (i: unknown) => unknown,
      Query: lib.QueryCommand as unknown as new (i: unknown) => unknown,
    };
    return { doc: this.doc, cmds: this.cmds };
  }

  async getSnapshot(workspaceId: string): Promise<CesSnapshot | null> {
    if (!this.table) throw new ApiError('validation_error', 'CES_METADATA_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    const res = (await doc.send(new cmds.Get({
      TableName: this.table,
      Key: { pk: `WS#${workspaceId}`, sk: 'SNAPSHOT' },
    }))) as { Item?: { snapshot?: CesSnapshot } };
    return res.Item?.snapshot ?? null;
  }
  async putSnapshot(snapshot: CesSnapshot): Promise<CesSnapshot> {
    assertNoFileBytes(snapshot, 'putSnapshot');
    if (!this.table) throw new ApiError('validation_error', 'CES_METADATA_TABLE_NAME is not configured.', 500);
    const next = { ...snapshot, updatedAt: new Date().toISOString() };
    const { doc, cmds } = await this.client();
    await doc.send(new cmds.Put({
      TableName: this.table,
      Item: { pk: `WS#${snapshot.workspaceId}`, sk: 'SNAPSHOT', updatedAt: next.updatedAt, snapshot: next },
    }));
    return next;
  }
  async listEvidence(eventId: string): Promise<CesEvidenceRef[]> {
    if (!this.table) throw new ApiError('validation_error', 'CES_METADATA_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    const res = (await doc.send(new cmds.Query({
      TableName: this.table,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
      ExpressionAttributeValues: { ':pk': `EVT#${eventId}`, ':sk': 'EVREF#' },
    }))) as { Items?: Array<{ ref?: CesEvidenceRef }> };
    return (res.Items ?? []).map(i => i.ref).filter((r): r is CesEvidenceRef => !!r);
  }
  async upsertEvidence(ref: CesEvidenceRef): Promise<CesEvidenceRef> {
    assertNoFileBytes(ref, 'upsertEvidence');
    if (!this.table) throw new ApiError('validation_error', 'CES_METADATA_TABLE_NAME is not configured.', 500);
    const { doc, cmds } = await this.client();
    // Deterministic SK by driveFileId guarantees no duplicate for the same file.
    await doc.send(new cmds.Put({
      TableName: this.table,
      Item: { pk: `EVT#${ref.eventId}`, sk: `EVREF#${ref.driveFileId}`, evidenceId: ref.evidenceId, ref },
    }));
    return ref;
  }
  async health() {
    try {
      await this.client();
      return { ok: !!this.table, provider: this.provider, error: this.table ? undefined : 'no_table' };
    } catch (e) {
      return { ok: false, provider: this.provider, error: (e as Error).message };
    }
  }
}

/* ─── Factory ───────────────────────────────────────────────────── */

let _store: CesMetadataStore | null = null;

export function getCesMetadataStore(): CesMetadataStore {
  if (_store) return _store;
  _store = env.cesMetadataProvider === 'dynamodb_metadata'
    ? new DynamoCesMetadataStore()
    : new FileCesMetadataStore();
  log.info('ces_metadata.provider.ready', { provider: _store.provider });
  return _store;
}

/** Test hook — clears the cached store so a different provider can be picked. */
export function _resetCesMetadataStore(): void { _store = null; }
