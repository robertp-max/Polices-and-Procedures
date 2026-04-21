import type { CorpusChunk, CorpusDoc, SectionRef } from '../types.js';

/* ═══════════════════════════════════════════════════════════════
   Section-aware semantic chunker.

   Approach:
     - iterate sections in document order
     - emit one chunk per section when it fits within the budget
     - split long sections on paragraph boundaries with small overlap
     - keep every chunk tagged with its section for citation rendering

   Budgets are expressed in CHARACTERS (approximate 1 token ≈ 4 chars
   for English prose). This is sufficient for an MVP and avoids a
   tokenizer dependency. Real boundaries land around paragraph edges.
   ═══════════════════════════════════════════════════════════════ */

const TOK_CHAR = 4;
export const CHUNK_TARGET_TOKENS = 750;
export const CHUNK_MAX_TOKENS = 1000;
export const CHUNK_OVERLAP_TOKENS = 80;

export interface ChunkerOptions {
  targetTokens?: number;
  maxTokens?: number;
  overlapTokens?: number;
}

export function chunkDoc(doc: CorpusDoc, opts: ChunkerOptions = {}): CorpusChunk[] {
  const target = (opts.targetTokens ?? CHUNK_TARGET_TOKENS) * TOK_CHAR;
  const max = (opts.maxTokens ?? CHUNK_MAX_TOKENS) * TOK_CHAR;
  const overlap = (opts.overlapTokens ?? CHUNK_OVERLAP_TOKENS) * TOK_CHAR;

  const out: CorpusChunk[] = [];
  for (const section of doc.sections) {
    const body = doc.content.slice(section.start, section.end).trim();
    if (!body) continue;

    const pieces = splitSection(body, { target, max, overlap });
    pieces.forEach((text, i) => {
      const clean = text.trim();
      if (!clean) return;
      out.push(buildChunk(doc, section, clean, i));
    });
  }

  return out;
}

function buildChunk(
  doc: CorpusDoc,
  section: SectionRef,
  text: string,
  ordinal: number,
): CorpusChunk {
  // Prepend a tiny contextual header so retrieval & the LLM know where
  // each passage came from even when shown out of order.
  const contextHeader =
    `[${doc.id} — ${doc.title}] ${section.title}\n`;
  const body = `${contextHeader}${text}`;

  return {
    id: `${doc.id}#${section.id}#${ordinal}`,
    docId: doc.id,
    title: doc.title,
    type: doc.type,
    domain: doc.domain,
    subdomain: doc.subdomain,
    accessTier: doc.accessTier,
    regulatoryTags: doc.regulatoryTags,
    sectionId: section.id,
    sectionTitle: section.title,
    ordinal,
    text: body,
    tokens: tokenize(body),
  };
}

interface SplitOpts {
  target: number;
  max: number;
  overlap: number;
}

function splitSection(text: string, { target, max, overlap }: SplitOpts): string[] {
  if (text.length <= max) return [text];

  // First cut into paragraphs (double newline). Then pack them greedily
  // up to `target` characters, only exceeding when a single paragraph
  // is already larger than `max`.
  const paragraphs = text.split(/\n{2,}/);
  const out: string[] = [];
  let buf = '';

  for (const para of paragraphs) {
    const next = buf ? `${buf}\n\n${para}` : para;
    if (next.length <= target) {
      buf = next;
      continue;
    }

    if (buf) {
      out.push(buf);
      buf = overlapTail(buf, overlap) + (overlap ? '\n\n' : '') + para;
    } else {
      buf = para;
    }

    while (buf.length > max) {
      // Paragraph itself too big — fall back to sentence packing.
      const { head, rest } = splitAtSentence(buf, target, max);
      out.push(head);
      buf = overlapTail(head, overlap) + (overlap ? ' ' : '') + rest;
    }
  }

  if (buf.trim()) out.push(buf);
  return out;
}

function splitAtSentence(text: string, target: number, max: number) {
  const slice = text.slice(0, Math.min(max, text.length));
  // Find the last sentence boundary at or before `target`.
  const boundary = Math.max(
    slice.lastIndexOf('. ', target),
    slice.lastIndexOf('.\n', target),
    slice.lastIndexOf('? ', target),
    slice.lastIndexOf('! ', target),
  );
  const cut = boundary > target * 0.5 ? boundary + 1 : target;
  return { head: text.slice(0, cut).trim(), rest: text.slice(cut).trim() };
}

function overlapTail(text: string, overlap: number): string {
  if (overlap <= 0) return '';
  if (text.length <= overlap) return text;
  return text.slice(text.length - overlap);
}

const STOP = new Set([
  'the','a','an','of','and','or','for','to','in','on','at','by','with','is','are',
  'be','been','was','were','as','that','this','it','its','from','but','not','no',
  'we','our','they','their','he','she','them','his','her','i','you','your',
  'may','shall','will','must','can','should','would','policy','section','form',
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s§.-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}
