import type { IntentKind } from './types.js';
import type { OllamaClient } from './ollama.js';
import {
  LexicalIndex,
  search,
  tokenizeQuery,
  type ScoredChunk,
  type SearchFilter,
} from './index/search.js';
import { embedQuery } from './index/embeddings.js';
import type { CorpusChunk, CorpusDoc } from './types.js';
import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Intent classification + retrieval.

   Intent classification is deliberately rule-based for MVP speed
   and determinism. The local LLM is reserved for the expensive
   step (structured response generation). If intent is ambiguous we
   fall back to `question`.

   Retrieval boosts exact document-ID mentions to the top and
   applies mode-aware filters so an audit query doesn't get swamped
   with tangential marketing material, for example.
   ═══════════════════════════════════════════════════════════════ */

export interface ClassifiedQuery {
  intent: IntentKind;
  explicitIds: string[];   // document IDs mentioned verbatim in the input
  keywords: string[];      // lowered tokens passed to lexical search
  domainHint: string | null;
  emphasisArtifacts: boolean; // "show me forms / missing forms" style query
}

const INTENT_PATTERNS: Array<{ intent: IntentKind; match: RegExp }> = [
  { intent: 'pre_survey_audit', match: /\b(pre[-\s]?survey|survey readiness|survey audit|audit checklist|readiness audit)\b/i },
  { intent: 'action_plan', match: /\b(action plan|corrective action|plan of correction|remediation plan|next steps)\b/i },
  { intent: 'governing_body_brief', match: /\b(governing body brief|board brief|executive brief|governance brief)\b/i },
  { intent: 'qapi_digest', match: /\b(qapi digest|qapi report|qapi summary|quality digest)\b/i },
  { intent: 'knowledge_article', match: /\b(knowledge article|explainer|training article)\b/i },
  { intent: 'missing_items', match: /\b(missing (forms?|artifacts?|documents?)|gaps?|what('?s)? missing|show (me )?gaps)\b/i },
  { intent: 'artifact_lookup', match: /\b(open|show|fetch|preview|load)\b[\s\S]{0,40}\b([A-Z]{2}-[A-Z]{2,3}-\d{3,4})\b/i },
];

const DOMAIN_HINTS: Array<{ code: string; match: RegExp }> = [
  { code: 'GV', match: /\b(governing body|gover(n|nance)|board|administrator|authority|appointment)\b/i },
  { code: 'CO', match: /\b(hipaa|privacy|cmia|compliance officer|regulatory|credential(ing)?)\b/i },
  { code: 'QA', match: /\b(qapi|quality|indicator|performance improvement|pi project)\b/i },
  { code: 'CL', match: /\b(plan of care|soc|oasis|start of care|clinical|wound|infection)\b/i },
  { code: 'HR', match: /\b(hr|employee|hiring|orientation|onboarding|per diem|contractor)\b/i },
  { code: 'FN', match: /\b(billing|claim(s)?|medicare|pdgm|revenue|finance)\b/i },
  { code: 'IT', match: /\b(it|security|ransomware|data breach|electronic|ehr)\b/i },
  { code: 'OP', match: /\b(operations|intake|scheduling|dispatch|field)\b/i },
  { code: 'RM', match: /\b(risk|safety|incident|emergency|disaster|osha)\b/i },
  { code: 'EN', match: /\b(enterprise|taxonomy|governance framework|policy library|exception|waiver)\b/i },
];

/** Parse free-form command text into structured retrieval parameters. */
export function classifyQuery(input: string, explicit?: IntentKind): ClassifiedQuery {
  const text = input.trim();
  const explicitIds = Array.from(
    new Set(
      (text.match(/\b[A-Z]{2}-[A-Z]{2,3}-\d{3,4}\b/g) ?? []).map(s => s.toUpperCase()),
    ),
  );

  let intent: IntentKind = explicit ?? 'question';
  if (!explicit) {
    for (const { intent: kind, match } of INTENT_PATTERNS) {
      if (match.test(text)) {
        intent = kind;
        break;
      }
    }
    // If the user explicitly references an artifact ID with no other
    // instruction words, treat it as an artifact lookup.
    if (intent === 'question' && explicitIds.length > 0 && text.split(/\s+/).length <= 6) {
      intent = 'artifact_lookup';
    }
  }

  const keywords = tokenizeQuery(text);
  const domainHint = DOMAIN_HINTS.find(h => h.match.test(text))?.code ?? null;
  const emphasisArtifacts =
    /\b(forms?|checklists?|register|log|worksheet|template)\b/i.test(text) ||
    intent === 'missing_items';

  return { intent, explicitIds, keywords, domainHint, emphasisArtifacts };
}

/* ─────────────────────────────────────────────────────────────
   Top-level retrieval.
   ───────────────────────────────────────────────────────────── */
export interface RetrievalInput {
  input: string;
  intent?: IntentKind;
  k?: number;
  activeDocId?: string;
}

export interface RetrievalOutput {
  query: ClassifiedQuery;
  hits: ScoredChunk[];
  directMatches: CorpusChunk[]; // chunks from explicit-ID docs
}

export async function retrieve(args: {
  input: RetrievalInput;
  chunks: CorpusChunk[];
  lexical: LexicalIndex;
  docs: Map<string, CorpusDoc>;
  ollama: OllamaClient | null;
  embeddingsReady: boolean;
}): Promise<RetrievalOutput> {
  const query = classifyQuery(args.input.input, args.input.intent);
  const k = args.input.k ?? chunkBudgetForIntent(query.intent);

  let queryVector: number[] | null = null;
  if (args.embeddingsReady && args.ollama) {
    try {
      queryVector = await embedQuery(args.ollama, args.input.input);
    } catch (err) {
      log.warn('retrieve.embed.failed', { message: (err as Error).message });
      queryVector = null;
    }
  }

  const filter: SearchFilter = {};

  // Hard-filter by domain for focused intents where wrong-domain noise
  // would dilute the answer. We do NOT filter for audit/brief/QAPI
  // because those need cross-domain coverage.
  const canDomainFilter =
    query.domainHint &&
    (query.intent === 'question' ||
      query.intent === 'artifact_lookup' ||
      query.intent === 'knowledge_article');
  if (canDomainFilter) {
    filter.domain = [query.domainHint!];
  }

  if (query.intent === 'missing_items' || query.emphasisArtifacts) {
    filter.type = ['form', 'policy'];
  }

  const hits = search({
    chunks: args.chunks,
    lexical: args.lexical,
    queryVector,
    queryTokens: query.keywords,
    options: { k, filter },
  });

  // Pin chunks from explicitly referenced docs to the front.
  const directMatches: CorpusChunk[] = [];
  if (query.explicitIds.length > 0) {
    const explicitSet = new Set(query.explicitIds);
    for (const chunk of args.chunks) {
      if (explicitSet.has(chunk.docId)) directMatches.push(chunk);
    }
    // Prepend direct matches, then dedupe by id.
    const seen = new Set<string>();
    const merged: ScoredChunk[] = [];
    for (const chunk of directMatches) {
      if (seen.has(chunk.id)) continue;
      seen.add(chunk.id);
      merged.push({ chunk, score: 1, vectorScore: 1, lexicalScore: 1 });
    }
    for (const h of hits) {
      if (seen.has(h.chunk.id)) continue;
      seen.add(h.chunk.id);
      merged.push(h);
    }
    return { query, hits: merged.slice(0, k), directMatches };
  }

  // Optional active-doc bias: nudge chunks from the currently-open doc up.
  if (args.input.activeDocId) {
    for (const h of hits) {
      if (h.chunk.docId === args.input.activeDocId) h.score += 0.1;
    }
    hits.sort((a, b) => b.score - a.score);
  }

  return { query, hits, directMatches };
}

function chunkBudgetForIntent(intent: IntentKind): number {
  switch (intent) {
    // Wide queries need broader corpus coverage to surface gaps.
    case 'pre_survey_audit': return 14;
    case 'action_plan':
    case 'governing_body_brief':
    case 'qapi_digest': return 12;
    case 'knowledge_article': return 10;
    case 'missing_items': return 10;
    // Focused queries stay tight to keep the prompt small.
    case 'artifact_lookup': return 4;
    default: return 7;
  }
}
