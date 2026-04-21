import type { CorpusChunk } from '../types.js';

/* ═══════════════════════════════════════════════════════════════
   In-memory hybrid search over the loaded chunk array.

   Modes:
     - vector:  dot product on pre-normalized embeddings (cosine)
     - lexical: lightweight BM25 over token arrays
     - hybrid:  weighted sum of the two, bounded [0,1]

   Supports metadata filters so the UI / retrieval layer can restrict
   candidates to e.g. "type=policy" or a specific regulatory tag.
   ═══════════════════════════════════════════════════════════════ */

export interface SearchFilter {
  type?: Array<'policy' | 'form' | 'appendix' | 'workflow'>;
  domain?: string[];
  subdomain?: string[];
  regulatoryTag?: string[];
  docId?: string[];        // restrict to specific docs
  excludeDocId?: string[]; // drop specific docs
}

export interface ScoredChunk {
  chunk: CorpusChunk;
  score: number;
  vectorScore: number;
  lexicalScore: number;
}

export interface SearchOptions {
  k?: number;
  filter?: SearchFilter;
  weights?: { vector: number; lexical: number };
}

/** Pre-normalized dot product. Assumes both vectors are L2-normalized. */
export function dot(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

/* ─────────────────────────────────────────────────────────────
   BM25 index built lazily over the chunk set. Cached by length
   to avoid recomputing idf on every query.
   ───────────────────────────────────────────────────────────── */
export class LexicalIndex {
  readonly N: number;
  readonly avgdl: number;
  private readonly docLen: number[] = [];
  private readonly termDocs = new Map<string, number>();
  private readonly k1 = 1.5;
  private readonly b = 0.75;

  constructor(private readonly chunks: CorpusChunk[]) {
    this.N = chunks.length;
    let total = 0;
    for (const c of chunks) {
      const tokens = c.tokens ?? [];
      this.docLen.push(tokens.length);
      total += tokens.length;
      const seen = new Set<string>();
      for (const t of tokens) {
        if (seen.has(t)) continue;
        seen.add(t);
        this.termDocs.set(t, (this.termDocs.get(t) ?? 0) + 1);
      }
    }
    this.avgdl = this.N > 0 ? total / this.N : 1;
  }

  /** BM25 score for a parsed query against a specific chunk. */
  score(queryTokens: string[], idx: number): number {
    const c = this.chunks[idx];
    const tokens = c.tokens ?? [];
    if (tokens.length === 0) return 0;

    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    const dl = this.docLen[idx] || 1;
    let s = 0;
    for (const q of queryTokens) {
      const df = this.termDocs.get(q);
      if (!df) continue;
      const idf = Math.log(1 + (this.N - df + 0.5) / (df + 0.5));
      const f = tf.get(q) ?? 0;
      if (f === 0) continue;
      const denom = f + this.k1 * (1 - this.b + (this.b * dl) / this.avgdl);
      s += idf * ((f * (this.k1 + 1)) / denom);
    }
    return s;
  }
}

export function tokenizeQuery(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s§.-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2);
}

/* ─────────────────────────────────────────────────────────────
   Top-K hybrid search.
   ───────────────────────────────────────────────────────────── */
export function search(args: {
  chunks: CorpusChunk[];
  lexical: LexicalIndex;
  queryVector: number[] | null;
  queryTokens: string[];
  options?: SearchOptions;
}): ScoredChunk[] {
  const { chunks, lexical, queryVector, queryTokens, options = {} } = args;
  const weights = options.weights ?? { vector: 0.65, lexical: 0.35 };
  const k = options.k ?? 8;
  const filter = options.filter ?? {};

  // 1) Compute lexical scores (cheap; always available).
  const lexScores: number[] = new Array(chunks.length).fill(0);
  let maxLex = 0;
  for (let i = 0; i < chunks.length; i++) {
    if (!passFilter(chunks[i], filter)) continue;
    const s = lexical.score(queryTokens, i);
    lexScores[i] = s;
    if (s > maxLex) maxLex = s;
  }

  // 2) Compute vector scores if embeddings are present.
  const vecScores: number[] = new Array(chunks.length).fill(0);
  if (queryVector) {
    for (let i = 0; i < chunks.length; i++) {
      const emb = chunks[i].embedding;
      if (!emb || !passFilter(chunks[i], filter)) continue;
      const s = dot(queryVector, emb);
      // Map [-1,1] to [0,1] for a stable blend.
      vecScores[i] = (s + 1) / 2;
    }
  }

  // 3) Normalize lexical scores to [0,1] and blend.
  //    Section-title boost: +0.05 per query token that appears in the
  //    section title. This surfaces heading chunks ahead of body text
  //    when the user's query names a specific topic.
  const scored: ScoredChunk[] = [];
  for (let i = 0; i < chunks.length; i++) {
    if (!passFilter(chunks[i], filter)) continue;
    const vec = vecScores[i];
    const lex = maxLex > 0 ? lexScores[i] / maxLex : 0;
    if (vec === 0 && lex === 0) continue;

    const stLower = (chunks[i].sectionTitle ?? '').toLowerCase();
    const titleBoost = queryTokens.reduce(
      (acc, t) => acc + (stLower.includes(t) ? 0.05 : 0),
      0,
    );

    const score =
      (queryVector ? weights.vector * vec : 0) +
      weights.lexical * lex +
      Math.min(titleBoost, 0.2); // cap at 0.2 so it nudges, not dominates
    scored.push({
      chunk: chunks[i],
      score,
      vectorScore: vec,
      lexicalScore: lex,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}

function passFilter(c: CorpusChunk, f: SearchFilter): boolean {
  if (f.type && f.type.length > 0 && !f.type.includes(c.type)) return false;
  if (f.domain && f.domain.length > 0 && !f.domain.includes(c.domain)) return false;
  if (f.subdomain && f.subdomain.length > 0 && !f.subdomain.includes(c.subdomain)) return false;
  if (f.docId && f.docId.length > 0 && !f.docId.includes(c.docId)) return false;
  if (f.excludeDocId && f.excludeDocId.includes(c.docId)) return false;
  if (f.regulatoryTag && f.regulatoryTag.length > 0) {
    const has = f.regulatoryTag.some(tag => c.regulatoryTags.includes(tag));
    if (!has) return false;
  }
  return true;
}
