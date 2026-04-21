import fs from 'node:fs';
import path from 'node:path';
import type {
  CorpusChunk,
  CorpusDoc,
  IndexManifest,
} from '../types.js';

/* ═══════════════════════════════════════════════════════════════
   JSON-persisted local vector store.

   The store keeps three files under the configured index root:
     - manifest.json  — metadata, model, source fingerprints
     - docs.json      — CorpusDoc[] (sans `content`; content is huge
                        so it's loaded on demand from docs-content.json)
     - docs-content.json — { [docId]: string } the full normalized text
     - chunks.json    — CorpusChunk[] with embedding vectors inlined

   This is intentionally simple. At MVP scale (~300 docs, ~2000
   chunks, 768-dim vectors) the total footprint stays well under
   50 MB and in-memory cosine search finishes in single-digit ms.
   ═══════════════════════════════════════════════════════════════ */

const MANIFEST = 'manifest.json';
const DOCS = 'docs.json';
const DOCS_CONTENT = 'docs-content.json';
const CHUNKS = 'chunks.json';

export interface IndexSnapshot {
  manifest: IndexManifest;
  docs: Map<string, CorpusDoc>;
  chunks: CorpusChunk[];
}

export class IndexStore {
  constructor(private readonly root: string) {}

  ensureDir(): void {
    fs.mkdirSync(this.root, { recursive: true });
  }

  exists(): boolean {
    return (
      fs.existsSync(path.join(this.root, MANIFEST)) &&
      fs.existsSync(path.join(this.root, DOCS)) &&
      fs.existsSync(path.join(this.root, CHUNKS))
    );
  }

  /** Load everything into memory. Intended for the API process boot. */
  load(): IndexSnapshot | null {
    if (!this.exists()) return null;
    const manifest = this.readJson<IndexManifest>(MANIFEST);
    const docsArr = this.readJson<CorpusDoc[]>(DOCS);
    const contentMap = this.readJsonOptional<Record<string, string>>(DOCS_CONTENT) ?? {};
    const chunks = this.readJson<CorpusChunk[]>(CHUNKS);

    const docs = new Map<string, CorpusDoc>();
    for (const d of docsArr) {
      // Rehydrate full content onto doc records.
      docs.set(d.id, { ...d, content: contentMap[d.id] ?? d.content ?? '' });
    }

    return { manifest, docs, chunks };
  }

  /** Persist a full snapshot atomically (tmp → rename). */
  save(snapshot: IndexSnapshot): void {
    this.ensureDir();

    const docsOnly: CorpusDoc[] = [];
    const contentMap: Record<string, string> = {};
    for (const doc of snapshot.docs.values()) {
      contentMap[doc.id] = doc.content;
      // Store a slim doc record (content is loaded from contentMap).
      const { content: _content, ...slim } = doc;
      docsOnly.push({ ...(slim as CorpusDoc), content: '' });
    }

    this.writeJsonAtomic(MANIFEST, snapshot.manifest);
    this.writeJsonAtomic(DOCS, docsOnly);
    this.writeJsonAtomic(DOCS_CONTENT, contentMap);
    this.writeJsonAtomic(CHUNKS, snapshot.chunks);
  }

  /** Return the persisted manifest without loading the full index. */
  peekManifest(): IndexManifest | null {
    if (!fs.existsSync(path.join(this.root, MANIFEST))) return null;
    try {
      return this.readJson<IndexManifest>(MANIFEST);
    } catch {
      return null;
    }
  }

  private readJson<T>(name: string): T {
    const raw = fs.readFileSync(path.join(this.root, name), 'utf8');
    return JSON.parse(raw) as T;
  }

  private readJsonOptional<T>(name: string): T | null {
    const p = path.join(this.root, name);
    if (!fs.existsSync(p)) return null;
    try {
      return JSON.parse(fs.readFileSync(p, 'utf8')) as T;
    } catch {
      return null;
    }
  }

  private writeJsonAtomic(name: string, data: unknown): void {
    const full = path.join(this.root, name);
    const tmp = `${full}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(data), 'utf8');
    fs.renameSync(tmp, full);
  }
}
