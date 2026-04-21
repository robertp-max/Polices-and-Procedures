import type { OllamaClient } from '../ollama.js';
import type { CorpusChunk } from '../types.js';

/* ═══════════════════════════════════════════════════════════════
   Embedding helper.

   Responsible for:
     - calling the Ollama embedding model
     - filling `chunk.embedding` in place
     - L2-normalizing each vector so retrieval can use plain dot
       product for cosine similarity

   Embeddings are OPTIONAL at runtime. If the embed model is
   unavailable we fall back to BM25-only retrieval and still return
   structured answers — just with lower semantic recall.
   ═══════════════════════════════════════════════════════════════ */

export function normalize(vec: number[]): number[] {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  const out = new Array<number>(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
  return out;
}

export async function embedChunks(
  client: OllamaClient,
  chunks: CorpusChunk[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ embedDim: number }> {
  let dim = 0;
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const vec = normalize(await client.embed(chunk.text));
    chunk.embedding = vec;
    if (dim === 0) dim = vec.length;
    if (onProgress) onProgress(i + 1, chunks.length);
  }
  return { embedDim: dim };
}

export async function embedQuery(
  client: OllamaClient,
  text: string,
): Promise<number[]> {
  return normalize(await client.embed(text));
}
