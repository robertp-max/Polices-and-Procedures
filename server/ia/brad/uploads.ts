import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad document uploads (MVP, local disk).
   ----------------------------------------------------------------------------
   Users "dump" documents here; Brad uses them to assemble evidence packets.
   Key rule: `dateCreatedInSystem` = the moment the document ENTERS Care Indeed
   (ingest time), NOT the document's own/historical date. So a late-reported
   event (e.g. an assault from last year reported today) is dated TODAY and
   therefore falls within the CURRENT compliance scope (next QAPI, etc.).
   Stored as bytes on disk + an append-only JSONL metadata index. No new deps
   (payload arrives base64 in JSON). Google Drive push is a later phase that
   reuses server/googleDrive.ts + server/googleEvidence.ts.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface UploadMeta {
  id: string;
  filename: string;
  mime: string;
  size: number;                 // bytes
  contentHash: string;          // sha256 of the bytes
  dateCreatedInSystem: string;  // ISO — ingest time (authoritative for scope)
  uploadedByUserId: string;
  eventId?: string;
  storedPath: string;
}

function baseDir(): string {
  const dir = process.env.BRAD_OBJECT_STORE_DIR || path.join(process.cwd(), 'data', 'brad');
  return path.join(dir, 'uploads');
}
function indexPath(): string {
  return path.join(baseDir(), '_index.jsonl');
}
function safeName(name: string): string {
  return name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 120) || 'document';
}

export class UploadStore {
  private readonly metas: UploadMeta[] = [];

  constructor() {
    const idx = indexPath();
    if (fs.existsSync(idx)) {
      for (const line of fs.readFileSync(idx, 'utf8').split('\n')) {
        const t = line.trim();
        if (t) this.metas.push(JSON.parse(t) as UploadMeta);
      }
    }
  }

  save(params: { filename: string; mime?: string; contentBase64: string; uploadedByUserId: string; eventId?: string }): UploadMeta {
    const bytes = Buffer.from(params.contentBase64, 'base64');
    const id = `bup-${crypto.randomUUID()}`;
    const stored = path.join(baseDir(), `${id}__${safeName(params.filename)}`);
    fs.mkdirSync(baseDir(), { recursive: true });
    fs.writeFileSync(stored, bytes);
    const meta: UploadMeta = {
      id,
      filename: params.filename,
      mime: params.mime || 'application/octet-stream',
      size: bytes.length,
      contentHash: crypto.createHash('sha256').update(bytes).digest('hex'),
      dateCreatedInSystem: new Date().toISOString(),
      uploadedByUserId: params.uploadedByUserId,
      eventId: params.eventId,
      storedPath: stored,
    };
    fs.appendFileSync(indexPath(), JSON.stringify(meta) + '\n', 'utf8');
    this.metas.push(meta);
    return meta;
  }

  list(eventId?: string): UploadMeta[] {
    return this.metas.filter((m) => !eventId || m.eventId === eventId).slice().reverse();
  }
  get(id: string): UploadMeta | undefined {
    return this.metas.find((m) => m.id === id);
  }
}

let singleton: UploadStore | null = null;
export function getUploadStore(): UploadStore {
  if (!singleton) singleton = new UploadStore();
  return singleton;
}
