import type { CorpusChunk, CorpusDoc } from '../types.js';
import { discoverSources, fingerprint } from './sources.js';
import { extractText, hashContent } from './parsers.js';
import { normalizeText } from './normalize.js';
import {
  buildCorpusDoc,
  parseFormHeader,
  parsePolicyHeader,
} from './metadata.js';
import { chunkDoc } from './chunker.js';

/* ═══════════════════════════════════════════════════════════════
   Ingestion orchestrator.

   Pipeline (per source file):
     discover → extractText → normalize → parse header → build doc
             → section-aware chunk

   The caller is responsible for dispatching chunks to the embedder
   and persistence layer. Keeping those steps out of this module lets
   us unit-test ingestion without touching disk for embeddings.
   ═══════════════════════════════════════════════════════════════ */

export interface IngestResult {
  docs: CorpusDoc[];
  chunks: CorpusChunk[];
  sources: Record<string, string>; // sourcePath -> fingerprint
  skipped: Array<{ path: string; reason: string }>;
}

export async function ingestCorpus(repoRoot: string): Promise<IngestResult> {
  const sources = discoverSources(repoRoot);

  const docs: CorpusDoc[] = [];
  const chunks: CorpusChunk[] = [];
  const fp: Record<string, string> = {};
  const skipped: IngestResult['skipped'] = [];

  for (const src of sources) {
    try {
      const raw = await extractText(src.path, src.kind);
      const content = normalizeText(raw);
      if (content.trim().length < 120) {
        skipped.push({ path: src.path, reason: 'content-too-short' });
        continue;
      }

      const header = src.docType === 'form' ? null : parsePolicyHeader(content);
      const formHeader = src.docType === 'form' ? parseFormHeader(content) : null;

      const doc = buildCorpusDoc({
        docType: src.docType,
        filePath: src.path,
        fileHash: hashContent(content),
        content,
        header,
        formHeader,
      });

      const docChunks = chunkDoc(doc);
      if (docChunks.length === 0) {
        skipped.push({ path: src.path, reason: 'no-chunks-produced' });
        continue;
      }

      docs.push(doc);
      chunks.push(...docChunks);
      fp[src.path] = fingerprint(src.path);
    } catch (err) {
      skipped.push({
        path: src.path,
        reason: (err as Error)?.message ?? 'unknown-error',
      });
    }
  }

  return { docs, chunks, sources: fp, skipped };
}
