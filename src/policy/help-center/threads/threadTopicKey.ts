/* ═══════════════════════════════════════════════════════════════════════════
   Topic key + normalization for Help Center threads.
   ----------------------------------------------------------------------------
   The topicKey is a stable, dotted slug used for duplicate detection and Brad
   organization, e.g.:
     - guided-tour.generate-event-packet
     - evidence.upload-drive-metadata
     - ecign.second-signer-same-form-instance
     - help-center.feature-requests-upvotes
     - brad.weekly-rating-modal

   All functions here are PURE and deterministic — no clock, no randomness — so
   the same thread always normalizes to the same key (so Brad can recompute keys
   on change without drift).
   ═══════════════════════════════════════════════════════════════════════════ */

import type { HelpThreadCategory, HelpThreadSource } from './types';

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'of', 'to', 'in', 'on', 'for', 'with',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'do', 'does', 'did', 'how',
  'what', 'why', 'when', 'where', 'which', 'who', 'whom', 'can', 'could', 'should',
  'would', 'will', 'shall', 'i', 'you', 'we', 'they', 'it', 'this', 'that', 'these',
  'those', 'my', 'our', 'your', 'their', 'about', 'from', 'into', 'as', 'at', 'by',
  'not', 'no', 'so', 'if', 'then', 'than', 'there', 'here', 'get', 'getting',
  'please', 'help', 'issue', 'problem', 'question',
]);

/** Lowercase, strip punctuation, collapse whitespace. Stable + idempotent. */
export function normalizeText(input: string): string {
  // NFKD decomposes accented chars (é → e + combining mark); the [^a-z0-9]
  // pass below then drops the combining marks, so diacritics are normalized away.
  return (input ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalized form of a title used for `same_normalized_title` matching. */
export function normalizeTitle(title: string): string {
  return normalizeText(title);
}

/**
 * A short, kebab slug of the most meaningful tokens (stop-words removed).
 * The kept tokens are SORTED so two phrasings of the same topic (e.g.
 * "feature requests upvotes" vs "upvotes feature requests") collide on the
 * same key — this is what makes topicKey-based duplicate detection robust.
 */
function slugifyIntent(text: string, maxTokens = 4): string {
  const tokens = normalizeText(text)
    .split(' ')
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
  // De-dup while preserving order, keep the first N most-meaningful tokens…
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const t of tokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    kept.push(t);
    if (kept.length >= maxTokens) break;
  }
  // …then sort for order-insensitive collision.
  return kept.sort().join('-');
}

/** Maps a thread source kind to the leading namespace of the topic key. */
function sourceNamespace(source: HelpThreadSource, category: HelpThreadCategory): string {
  switch (source.kind) {
    case 'guided_tour':
      return 'guided-tour';
    case 'help_article':
      return 'help-center';
    case 'feature_request':
      return 'feature-request';
    case 'brad_response':
      return 'brad';
    case 'workflow':
      return 'workflow';
    case 'form':
      return 'forms';
    case 'event':
      return 'event';
    case 'general':
    default:
      return categoryNamespace(category);
  }
}

function categoryNamespace(category: HelpThreadCategory): string {
  switch (category) {
    case 'brad_ai': return 'brad';
    case 'guided_tours': return 'guided-tour';
    case 'help_center': return 'help-center';
    case 'feature_requests': return 'feature-request';
    case 'evidence_center': return 'evidence';
    case 'ecign': return 'ecign';
    case 'ces_events': return 'ces';
    case 'qapi_packets': return 'qapi';
    case 'admission_packets': return 'admission-packet';
    case 'forms': return 'forms';
    case 'policy_library': return 'policy-viewer';
    case 'onboarding_journey': return 'journey';
    case 'reports_dashboards': return 'reports';
    case 'ui_accessibility': return 'ui';
    case 'performance': return 'performance';
    case 'bug': return 'bug';
    case 'other':
    default:
      return 'general';
  }
}

export type TopicKeyInput = {
  title: string;
  body?: string;
  category: HelpThreadCategory;
  source: HelpThreadSource;
  /** Optional explicit signature (e.g. a normalized error message) that dominates the slug. */
  errorSignature?: string;
};

/**
 * Build the dotted topic key. Namespace is derived from source/category; the
 * intent slug is derived from an error signature if present, else the title,
 * falling back to a stable source identifier so two threads on the SAME object
 * with empty titles still collide.
 */
export function buildTopicKey(input: TopicKeyInput): string {
  const ns = sourceNamespace(input.source, input.category);
  const intentSource =
    input.errorSignature?.trim() ||
    input.title?.trim() ||
    input.body?.trim() ||
    sourceIntentFallback(input.source);
  const intent = slugifyIntent(intentSource) || 'general';
  return `${ns}.${intent}`;
}

function sourceIntentFallback(source: HelpThreadSource): string {
  switch (source.kind) {
    case 'help_article': return source.articleId;
    case 'feature_request': return source.featureRequestId;
    case 'brad_response': return source.bradResponseId;
    case 'guided_tour': return [source.tourId, source.stepId].filter(Boolean).join(' ');
    case 'workflow': return [source.workflowId, source.stepId].filter(Boolean).join(' ');
    case 'form': return [source.formId, source.sectionId].filter(Boolean).join(' ');
    case 'event': return [source.eventId, source.taskId].filter(Boolean).join(' ');
    case 'general':
    default:
      return 'general';
  }
}

/** Stable identity string for the source OBJECT (ignores title/body). */
export function sourceObjectKey(source: HelpThreadSource): string {
  switch (source.kind) {
    case 'help_article': return `help_article:${source.articleId}`;
    case 'feature_request': return `feature_request:${source.featureRequestId}`;
    case 'brad_response': return `brad_response:${source.bradResponseId}`;
    case 'guided_tour': return `guided_tour:${source.tourId}:${source.stepId ?? ''}`;
    case 'workflow': return `workflow:${source.workflowId}:${source.stepId ?? ''}`;
    case 'form': return `form:${source.formId}:${source.sectionId ?? ''}`;
    case 'event': return `event:${source.eventId}:${source.taskId ?? ''}`;
    case 'general':
    default:
      return 'general';
  }
}

export type ExtractedEntities = {
  featureNames: string[];
  workflowIds: string[];
  formIds: string[];
  policyIds: string[];
  eventTypes: string[];
  routes: string[];
  errorSignatures: string[];
  tags: string[];
};

const ROUTE_RE = /(?:^|\s)(\/[a-z0-9][a-z0-9/_-]*)/gi;
const FORM_RE = /\b(?:form[-\s]?)?(485|OASIS[- ]?E\d?|CMS[-\s]?\d{3,4}|HRTA\d{3}[A-Z]?)\b/gi;
const WORKFLOW_RE = /\b(WF[-_][A-Z0-9-]+)\b/gi;
const POLICY_RE = /\b((?:POL|KB|GAO|RN)[-_][A-Z0-9-]+)\b/gi;
const ERROR_RE = /\b(error|failed|cannot|can't|exception|timeout|undefined|null|crash|stuck|blank|missing)\b[^.!?\n]{0,80}/gi;

/** Extract tags/entities from free text. Used for auto-tagging + error-signature matching. */
export function extractEntities(text: string): ExtractedEntities {
  const raw = text ?? '';
  const out: ExtractedEntities = {
    featureNames: [],
    workflowIds: [],
    formIds: [],
    policyIds: [],
    eventTypes: [],
    routes: [],
    errorSignatures: [],
    tags: [],
  };

  const pushUnique = (arr: string[], v: string) => {
    const t = v.trim();
    if (t && !arr.includes(t)) arr.push(t);
  };

  for (const m of raw.matchAll(ROUTE_RE)) pushUnique(out.routes, m[1]);
  for (const m of raw.matchAll(FORM_RE)) pushUnique(out.formIds, m[1].toUpperCase());
  for (const m of raw.matchAll(WORKFLOW_RE)) pushUnique(out.workflowIds, m[1].toUpperCase());
  for (const m of raw.matchAll(POLICY_RE)) pushUnique(out.policyIds, m[1].toUpperCase());
  for (const m of raw.matchAll(ERROR_RE)) pushUnique(out.errorSignatures, normalizeText(m[0]));

  // Tags = top meaningful tokens + structured entities.
  const tokens = normalizeText(raw).split(' ').filter(t => t.length > 2 && !STOP_WORDS.has(t));
  for (const t of tokens.slice(0, 8)) pushUnique(out.tags, t);
  for (const id of [...out.formIds, ...out.workflowIds, ...out.policyIds]) {
    pushUnique(out.tags, id.toLowerCase());
  }

  return out;
}

/**
 * Stable normalized signature for an error message. Two threads reporting the
 * "same" error (after stripping ids/numbers) produce the same signature.
 */
export function errorSignature(text: string): string {
  return normalizeText(text)
    .replace(/\b\d+\b/g, '#') // collapse numbers so "step 3" / "step 7" match
    .trim();
}
