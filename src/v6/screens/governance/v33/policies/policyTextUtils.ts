// Shared, dependency-free, purely EXTRACTIVE text helpers for the Governing
// Body policy reading room. Nothing here generates controlling-sounding
// prose — every helper only selects, splits, or cleans substrings that
// already exist in the controlled policy body. That is a deliberate design
// constraint: the Board Lens and Related Forms panels must be concise and
// source-linked, never AI-authored controlled text.

import type { PolicyContentSection } from '../types';

export function cleanTitle(title: string): string {
  return title.replace(/\\\./g, '.').replace(/^\d+(?:\.\d+)*\.?\s*/, '').trim();
}

/**
 * The policy-body generator occasionally leaves build-time artifacts at the
 * tail of a section (a "COMPLETION SUMMARY" delivery table, a trailing
 * "# DOMAIN:" banner, a version footer line). Strip them from DISPLAY only —
 * this never touches the underlying generated data file.
 */
export function stripGeneratorArtifacts(body: string): string {
  return body
    .split(/\n##\s*COMPLETION SUMMARY/i)[0]
    .split(/\n#\s*DOMAIN\s*:/i)[0]
    .replace(/\n###\s*Version\s+\d+(?:\.\d+)?\s*\|\s*Effective Date:[^\n]*/gi, '')
    .trim();
}

export function tableRows(body: string): string[][] | null {
  const lines = body.split('\n').map((line) => line.trim()).filter((line) => line.startsWith('|'));
  if (lines.length < 2) return null;
  const rows = lines
    .filter((line) => !/^\|?\s*:?-{3,}/.test(line))
    .map((line) => line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim()));
  return rows.length ? rows : null;
}

const STOPWORDS = new Set([
  'the', 'and', 'for', 'form', 'template', 'tool', 'log', 'record', 'records', 'policy', 'governing',
  'body', 'agency', 'annual', 'checklist', 'worksheet', 'register', 'matrix', 'assessment', 'appendix',
  'attestation', 'disclosure', 'roster', 'plan', 'report', 'of', 'a', 'an', 'to', 'in', 'on',
]);

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/appendix\s+[a-z0-9]+\s*[—-]?\s*/i, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word));
}

/** True when two titles share enough significant vocabulary to be the same real-world artifact. */
export function titlesLikelySameArtifact(a: string, b: string): boolean {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (!ta.size || !tb.size) return false;
  let overlap = 0;
  ta.forEach((token) => { if (tb.has(token)) overlap += 1; });
  return overlap / Math.min(ta.size, tb.size) >= 0.6;
}

export interface ReferenceBlock {
  id: string;
  heading: string;
  body: string;
}

/**
 * Splits an "Appendices"-style section body into individually titled blocks
 * (the generator writes `### Appendix X — Title`). Blocks whose heading
 * text is recognizably the SAME artifact as one of the caller-supplied
 * `coveredTitles` (i.e. it now has a real canonical form link) are dropped —
 * the real Related Forms panel replaces that dump. Everything else survives
 * as genuine reference material.
 */
export function splitAppendixIntoReferenceBlocks(body: string, coveredTitles: string[]): ReferenceBlock[] {
  const cleaned = stripGeneratorArtifacts(body);
  const parts = cleaned.split(/\n(?=###\s+Appendix\b)/i);
  const blocks: ReferenceBlock[] = [];
  parts.forEach((part, index) => {
    const match = part.match(/^###\s+(Appendix[^\n]*)\n?/i);
    const heading = match ? match[1].trim() : '';
    const rest = (match ? part.slice(match[0].length) : part).trim();
    if (!rest) return;
    if (heading && coveredTitles.some((title) => titlesLikelySameArtifact(heading, title))) return;
    blocks.push({ id: `ref-${index}-${heading || 'note'}`, heading, body: rest });
  });
  return blocks;
}

export interface ExtractedSentence {
  sectionId: string;
  sectionTitle: string;
  text: string;
}

/** Extractive sentence pull: only sentences that already exist verbatim in the controlled body. */
export function extractSentences(sections: readonly PolicyContentSection[], keywordRegex: RegExp, limit = 3): ExtractedSentence[] {
  const out: ExtractedSentence[] = [];
  for (const section of sections) {
    const sentences = stripGeneratorArtifacts(section.body)
      .replace(/\|/g, ' ')
      .split(/(?<=[.!?])\s+/)
      .map((value) => value.replace(/\s+/g, ' ').replace(/^---|---$/g, '').trim());
    for (const sentence of sentences) {
      if (sentence.length < 40 || sentence.length > 420) continue;
      if (!keywordRegex.test(sentence)) continue;
      out.push({ sectionId: section.id, sectionTitle: cleanTitle(section.title), text: sentence });
      if (out.length >= limit) return out;
      break; // at most one pull per section keeps the lens concise
    }
  }
  return out;
}
