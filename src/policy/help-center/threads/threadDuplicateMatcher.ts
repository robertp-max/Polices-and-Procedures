/* ═══════════════════════════════════════════════════════════════════════════
   Duplicate detection / matching for Help Center threads.
   ----------------------------------------------------------------------------
   Given a NEW (draft) thread and the set of existing threads, produce ranked
   match results with a confidence and a reason, and decide whether each match
   should auto-merge or merely be suggested.

   Auto-merge rules (spec):
     - Same source object + same normalized topic        → auto-merge
     - Same feature request                              → always use existing
     - Same help article + same topicKey + conf ≥ 0.92   → auto-merge
     - Same error signature + same page/feature + ≥ 0.90 → auto-merge
     - Same normalized title + same category + ≥ 0.90    → auto-merge
   Suggest-merge:
     - confidence 0.75–0.89                              → suggest

   Do-not-auto-merge guards (spec): PHI threads, admin-only/restricted threads,
   security/legal/patient-safety threads, threads the current user cannot access,
   "do not merge" threads, and threads with conflicting resolved/admin decisions.
   ═══════════════════════════════════════════════════════════════════════════ */

import type { HelpThread, ThreadMatchResult, ThreadVisibility } from './types';
import { sourceObjectKey } from './threadTopicKey';

const SUGGEST_MIN = 0.75;
const SUGGEST_MAX = 0.89;
const AUTOMERGE_HELP_ARTICLE_MIN = 0.92;
const AUTOMERGE_ERROR_MIN = 0.9;
const AUTOMERGE_TITLE_MIN = 0.9;

/** The minimal shape needed to match a draft thread against existing ones. */
export type ThreadMatchInput = {
  normalizedTitle: string;
  topicKey: string;
  category: HelpThread['category'];
  source: HelpThread['source'];
  /** Free text of the opening message, for semantic matching. */
  body?: string;
  /** Tags/entities already extracted from the draft. */
  tags?: string[];
  /**
   * Normalized error signature, set ONLY when the draft genuinely reports an
   * error (e.g. a guided-tour failure). Gates the "same_error_signature" rule
   * so ordinary threads never trip the error-based auto-merge.
   */
  errorSignature?: string;
};

export type MatchContext = {
  /** Roles the current user holds — used to honor role-restricted access. */
  accessibleVisibilities?: ThreadVisibility[];
  /** When true, the current user is an admin and can see admin-only threads. */
  isAdmin?: boolean;
};

const RESTRICTED_VISIBILITIES: readonly ThreadVisibility[] = ['admin_only', 'role_restricted', 'hidden'];

/**
 * True when `candidate` must never be auto-merged into, per the safety guards.
 * It may still be *suggested* only if the user can access it.
 */
export function isMergeProtected(candidate: HelpThread): boolean {
  if (candidate.doNotMerge) return true;
  if (candidate.containsPhiWarningShown) return true;
  if (candidate.status === 'needs_human_review') return true;
  if (candidate.visibility === 'admin_only' || candidate.visibility === 'hidden') return true;
  // Conflicting resolved/admin decision: a thread an admin already resolved/closed
  // should not silently absorb new threads.
  if (candidate.status === 'resolved' || candidate.status === 'closed') return true;
  return false;
}

/** True when the current user is allowed to even SEE the candidate thread. */
function canAccess(candidate: HelpThread, ctx: MatchContext): boolean {
  if (ctx.isAdmin) return true;
  if (candidate.visibility === 'all_staff' || candidate.visibility === 'team') return true;
  if (candidate.visibility === 'private_to_user') return false; // matcher never crosses user boundary
  if (RESTRICTED_VISIBILITIES.includes(candidate.visibility)) {
    return (ctx.accessibleVisibilities ?? []).includes(candidate.visibility);
  }
  return true;
}

/** Token Jaccard similarity over normalized title + tags. Range 0..1. */
function semanticSimilarity(a: ThreadMatchInput, b: HelpThread): number {
  const tokA = new Set(
    `${a.normalizedTitle} ${(a.tags ?? []).join(' ')}`.split(' ').filter(Boolean),
  );
  const tokB = new Set(
    `${b.normalizedTitle} ${(b.tags ?? []).join(' ')}`.split(' ').filter(Boolean),
  );
  if (tokA.size === 0 || tokB.size === 0) return 0;
  let inter = 0;
  for (const t of tokA) if (tokB.has(t)) inter++;
  const union = tokA.size + tokB.size - inter;
  return union === 0 ? 0 : inter / union;
}

function featureRequestId(source: HelpThread['source']): string | null {
  return source.kind === 'feature_request' ? source.featureRequestId : null;
}

function helpArticleId(source: HelpThread['source']): string | null {
  return source.kind === 'help_article' ? source.articleId : null;
}

/** Compute the single best match (if any) of `input` against one candidate. */
function scoreCandidate(input: ThreadMatchInput, candidate: HelpThread): ThreadMatchResult | null {
  const sameSourceObject = sourceObjectKey(input.source) === sourceObjectKey(candidate.source);
  const sameTopicKey = input.topicKey === candidate.topicKey;
  const sameTitle = input.normalizedTitle === candidate.normalizedTitle && input.normalizedTitle !== '';
  const sameCategory = input.category === candidate.category;
  const sim = semanticSimilarity(input, candidate);

  // 1) Same feature request → always use existing thread (highest confidence).
  const frInput = featureRequestId(input.source);
  const frCand = featureRequestId(candidate.source);
  if (frInput && frCand && frInput === frCand) {
    return mk(candidate.id, 1, 'same_feature_request');
  }

  // 2) Same source object + same topic → auto-merge.
  if (sameSourceObject && input.source.kind !== 'general' && sameTopicKey) {
    return mk(candidate.id, 0.98, 'same_source_same_title');
  }

  // 3) Same help article + same topicKey → auto-merge at high confidence.
  const haInput = helpArticleId(input.source);
  const haCand = helpArticleId(candidate.source);
  if (haInput && haCand && haInput === haCand && sameTopicKey) {
    const conf = Math.max(AUTOMERGE_HELP_ARTICLE_MIN, 0.92 + sim * 0.08);
    return mk(candidate.id, conf, 'same_topic_key');
  }

  // 4) Same error signature + same page/feature → auto-merge.
  // Only when the draft genuinely reports an error (errorSignature is set) AND
  // it lands on the same source/topic with strong token overlap. Ordinary
  // threads carry no errorSignature, so they never trip this rule.
  if (
    input.errorSignature &&
    (sameSourceObject || sameTopicKey) &&
    candidate.topicKey === input.topicKey &&
    sim >= 0.4
  ) {
    const conf = Math.max(AUTOMERGE_ERROR_MIN, 0.9 + sim * 0.1);
    return mk(candidate.id, conf, 'same_error_signature');
  }

  // 5) Same normalized title + same category → auto-merge.
  if (sameTitle && sameCategory) {
    const conf = Math.max(AUTOMERGE_TITLE_MIN, 0.9 + sim * 0.1);
    return mk(candidate.id, conf, 'same_source_same_title');
  }

  // 6) Same topic key (different source) → strong suggest.
  if (sameTopicKey) {
    const conf = Math.min(0.89, 0.8 + sim * 0.1);
    return mk(candidate.id, conf, 'same_topic_key');
  }

  // 7) Semantic similarity fallback.
  if (sim >= SUGGEST_MIN) {
    return mk(candidate.id, Math.min(SUGGEST_MAX, sim), 'semantic_similarity');
  }

  return null;
}

function mk(id: string, confidence: number, reason: ThreadMatchResult['reason']): ThreadMatchResult {
  const conf = Math.round(Math.min(1, Math.max(0, confidence)) * 100) / 100;
  return {
    candidateThreadId: id,
    confidence: conf,
    reason,
    shouldAutoMerge: false, // decided in finalize() so guards apply uniformly
    shouldSuggestMerge: false,
  };
}

/**
 * Find duplicate-thread matches for a draft. Returns results sorted by
 * confidence (desc). Auto-merge / suggest flags already account for the safety
 * guards and the current user's access.
 */
export function findThreadMatches(
  input: ThreadMatchInput,
  existing: HelpThread[],
  ctx: MatchContext = {},
): ThreadMatchResult[] {
  const results: ThreadMatchResult[] = [];

  for (const candidate of existing) {
    // Never match a thread against itself or against a duplicate stub.
    if (candidate.canonicalThreadId || candidate.status === 'duplicate' || candidate.status === 'archived') {
      continue;
    }
    if (!canAccess(candidate, ctx)) continue;

    const scored = scoreCandidate(input, candidate);
    if (!scored) continue;

    const protectedThread = isMergeProtected(candidate);
    const autoEligible = !protectedThread && scored.confidence >= AUTOMERGE_ERROR_MIN;
    const suggestEligible =
      !autoEligible && scored.confidence >= SUGGEST_MIN && scored.confidence <= SUGGEST_MAX
        // a protected thread that would otherwise auto-merge is downgraded to a suggestion
        || (protectedThread && scored.confidence >= SUGGEST_MIN);

    results.push({
      ...scored,
      shouldAutoMerge: autoEligible,
      shouldSuggestMerge: Boolean(suggestEligible) && !autoEligible,
    });
  }

  return results.sort((a, b) => b.confidence - a.confidence);
}

/** The single highest-confidence match, if one crosses the suggest threshold. */
export function bestThreadMatch(
  input: ThreadMatchInput,
  existing: HelpThread[],
  ctx: MatchContext = {},
): ThreadMatchResult | null {
  const matches = findThreadMatches(input, existing, ctx);
  const top = matches[0];
  if (!top) return null;
  if (!top.shouldAutoMerge && !top.shouldSuggestMerge) return null;
  return top;
}
