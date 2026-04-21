import { randomUUID } from 'node:crypto';
import type {
  AvailableAction,
  Citation,
  CorpusDoc,
  EnforcementLevel,
  IntentKind,
  LifecycleAlert,
  LinkedReference,
  OperationalGap,
  PhaseStatus,
  RegulatoryAlert,
  RequirementSnapshotItem,
  StructuredResponse,
  StudioOutputType,
} from './types.js';
import type { ScoredChunk } from './index/search.js';
import type { OllamaClient } from './ollama.js';
import { buildPrompt, studioOutputForIntent } from './prompt.js';
import { log } from '../logger.js';

/* ═══════════════════════════════════════════════════════════════
   Structured response generator.

   Orchestrates:
     1) prompt assembly (retrieval hits → CORPUS block)
     2) local LLM call (JSON-mode)
     3) schema repair / validation (the model can drift)
     4) materialization of:
          - citations           (from passageId → real chunk metadata)
          - linkedReferences    (policies/forms referenced by doc graph)
          - availableActions    (open_* + generate_* triggers)

   The model is NEVER allowed to name a document that isn't in the
   passage map; linkedReferences are constructed from the corpus
   graph, not from free-form LLM text.
   ═══════════════════════════════════════════════════════════════ */

export interface RespondInput {
  input: string;
  intent: IntentKind;
  hits: ScoredChunk[];
  directMatchDocIds: string[];
  docs: Map<string, CorpusDoc>;
  ollama: OllamaClient;
  activeDocId?: string;
  /** Pre-computed operational context string for prompt injection. */
  operationalContext?: string;
  /** Pre-computed regulatory context string for prompt injection. */
  regulatoryContext?: string;
  /** Structured operational gaps for deterministic response attachment. */
  operationalGaps?: OperationalGap[];
  /** Structured lifecycle alerts for deterministic response attachment. */
  lifecycleAlerts?: LifecycleAlert[];
  /** Structured regulatory alerts for deterministic response attachment. */
  regulatoryAlerts?: RegulatoryAlert[];
}

export async function generateStructuredResponse(
  args: RespondInput,
): Promise<StructuredResponse> {
  const startedAt = Date.now();
  const { input, intent, hits, docs, ollama, directMatchDocIds } = args;

  if (hits.length === 0 && directMatchDocIds.length === 0) {
    return emptyNoAnswer({
      id: newId(),
      input,
      intent,
      reason:
        'No passages in the internal corpus matched this request. Rephrase, reference a specific policy or form ID, or broaden the query.',
      model: ollama ? 'ollama' : 'none',
      elapsedMs: Date.now() - startedAt,
    });
  }

  const prompt = buildPrompt({
    input,
    intent,
    hits,
    docs,
    operationalContext: args.operationalContext,
    regulatoryContext: args.regulatoryContext,
  });

  let llmJson: RawLLMJson;
  let modelName = 'unknown';
  try {
    const reply = await ollama.chat({
      system: prompt.system,
      user: prompt.user,
      temperature: 0.15,
      format: 'json',
    });
    modelName = reply.model;
    llmJson = parseLLMJson(reply.content);
  } catch (err) {
    log.warn('responder.llm.failed', { message: (err as Error).message });
    return emptyNoAnswer({
      id: newId(),
      input,
      intent,
      reason:
        'Local reasoning model is unavailable right now. Retrieval is working; retry shortly or run `npm run ia:check-model`.',
      model: 'ollama-error',
      elapsedMs: Date.now() - startedAt,
    });
  }

  const passageById = new Map(prompt.passageMap.map(p => [p.passageId, p]));
  const citations = materializeCitations(llmJson, passageById);
  const requirementsSnapshot = sanitizeRequirements(llmJson.requirementsSnapshot, passageById);
  const studioOutputType = studioOutputForIntent(intent);

  const requiredArtifactIds = dedupeIds(llmJson.requiredArtifacts ?? []);

  const linkedReferences = buildLinkedReferences({
    intent,
    hits,
    directMatchDocIds,
    docs,
    requiredArtifactIds,
    requirementsSnapshot,
  });

  const availableActions = buildAvailableActions({
    intent,
    linkedReferences,
    hits,
    directMatchDocIds,
    studioOutputType,
  });

  const retrievedChunkIds = hits.map(h => h.chunk.id);

  // Detect when the LLM hedged instead of declaring noAnswerFound properly.
  const hedgedAnswer = /not (explicitly|directly|specifically) (stated|addressed|covered|supported|mentioned)/i
    .test(llmJson.directAnswer ?? '');
  const noAnswerFound = Boolean(llmJson.noAnswerFound) || hedgedAnswer;

  // Auto-elevate riskLevel when retrieved chunks carry CoP/regulatory tags.
  const regulatoryTagsInHits = new Set(hits.flatMap(h => h.chunk.regulatoryTags ?? []));
  const hasCoPTag = regulatoryTagsInHits.has('CoP') ||
    regulatoryTagsInHits.has('42 CFR 484') ||
    regulatoryTagsInHits.has('42 CFR 484.105') ||
    regulatoryTagsInHits.has('HIPAA') ||
    regulatoryTagsInHits.has('False Claims Act');

  const baseRisk = coerceRiskLevel(llmJson.riskLevel, intent);
  const riskLevel = elevateRisk(baseRisk, hasCoPTag, intent);

  // Determine governing policy — prefer LLM's nomination, fall back to top citation.
  const governingPolicyId = resolveGoverningPolicyId(
    llmJson.governingPolicyId ?? null,
    citations,
    directMatchDocIds,
  );

  const enforcementLevel = coerceEnforcementLevel(
    llmJson.enforcementLevel,
    riskLevel,
    hasCoPTag,
  );

  const systemConfidenceScore = computeConfidenceScore({
    hits,
    citations,
    governingPolicyId,
    noAnswerFound,
    embeddingsPresent: hits.some(h => Array.isArray(h.chunk.embedding)),
  });

  const response: StructuredResponse = {
    id: newId(),
    responseType: 'compliance_answer',
    directAnswer: sanitizeString(llmJson.directAnswer ?? '', 800),
    operationalRequirement: sanitizeString(llmJson.operationalRequirement ?? '', 600),
    requiredArtifacts: requiredArtifactIds,
    complianceRisk: sanitizeString(llmJson.complianceRisk ?? '', 500),
    riskLevel,
    confidence: coerceConfidence(llmJson.confidence, hits),
    systemConfidenceScore,
    governingPolicyId,
    enforcementLevel,
    complianceImpact: sanitizeString(llmJson.complianceImpact ?? '', 600),
    surveyFocus: sanitizeStringArray(llmJson.surveyFocus, 180, 5),
    commonFailurePoints: sanitizeStringArray(llmJson.commonFailurePoints, 180, 5),
    requirementsSnapshot,
    citations,
    linkedReferences,
    availableActions,
    studioOutputType,
    noAnswerFound,
    noAnswerReason: noAnswerFound
      ? sanitizeString(llmJson.noAnswerReason ?? (hedgedAnswer ? 'The corpus does not directly address this topic.' : 'No corpus support.'), 300)
      : '',
    // ── Operational intelligence (deterministic, not LLM-generated) ──
    operationalGaps: args.operationalGaps,
    lifecycleAlerts: args.lifecycleAlerts,
    regulatoryAlerts: args.regulatoryAlerts,
    phaseStatus: buildPhaseStatus(),
    meta: {
      intent,
      retrievedChunkIds,
      model: modelName,
      elapsedMs: Date.now() - startedAt,
    },
  };

  return response;
}

/** Phase availability flags — honest about data source. */
function buildPhaseStatus(): PhaseStatus {
  return {
    phase1: {
      available: true,
      label: 'Operational Assessment',
      dataSource: 'Phase 1 — Seed Data (pre-production demonstration)',
    },
    phase2: {
      available: true,
      label: 'Regulatory Update Awareness',
      dataSource: 'Phase 2 — Curated CMS/OIG seed feed (live feed adapter pending)',
    },
    phase3: {
      available: false,
      label: 'EHR-Derived Assessment',
      dataSource: 'Phase 3 — Not yet integrated (EHR adapter required)',
    },
  };
}

/* ─────────────────────────────────────────────────────────────
   Raw LLM JSON shape + parsing.
   ───────────────────────────────────────────────────────────── */

interface RawLLMJson {
  governingPolicyId?: string | null;
  directAnswer?: string;
  operationalRequirement?: string;
  requiredArtifacts?: string[];
  complianceRisk?: string;
  riskLevel?: string;
  confidence?: string;
  complianceImpact?: string;
  enforcementLevel?: string;
  surveyFocus?: string[];
  commonFailurePoints?: string[];
  requirementsSnapshot?: Array<{
    label?: string;
    status?: string;
    sourcePolicyId?: string;
    sourceSection?: string;
  }>;
  citations?: Array<{
    passageId?: number | string;
    excerpt?: string;
  }>;
  noAnswerFound?: boolean;
  noAnswerReason?: string;
}

function parseLLMJson(raw: string): RawLLMJson {
  const text = raw.trim();
  try {
    return JSON.parse(text) as RawLLMJson;
  } catch {
    // Attempt to strip markdown fences / extract the first JSON object.
    const jsonFence = text.match(/```(?:json)?\s*([\s\S]+?)\s*```/i);
    if (jsonFence) {
      try { return JSON.parse(jsonFence[1]) as RawLLMJson; } catch {}
    }
    const brace = text.match(/\{[\s\S]+\}$/);
    if (brace) {
      try { return JSON.parse(brace[0]) as RawLLMJson; } catch {}
    }
    log.warn('responder.llm.json_parse_failed', { preview: text.slice(0, 160) });
    return {
      directAnswer: '',
      noAnswerFound: true,
      noAnswerReason:
        'Model response was not valid JSON. The retrieval result is still available; consider retrying.',
    };
  }
}

/* ─────────────────────────────────────────────────────────────
   Materialization helpers.
   ───────────────────────────────────────────────────────────── */

type PassageMap = Map<number, {
  passageId: number;
  chunkId: string;
  docId: string;
  title: string;
  sectionId: string;
  sectionTitle: string;
  accessTier: string;
  domain: string;
  subdomain: string;
}>;

// Only valid enterprise taxonomy IDs appear in citations or linked refs.
const VALID_DOC_ID = /^[A-Z]{2}-[A-Z]{1,3}-\d{3,4}$/;

function materializeCitations(
  llm: RawLLMJson,
  passageById: PassageMap,
): Citation[] {
  const raw = llm.citations ?? [];
  const out: Citation[] = [];
  const seen = new Set<string>();

  raw.forEach((c, i) => {
    const pid = typeof c.passageId === 'string' ? Number(c.passageId) : c.passageId;
    if (!pid || !passageById.has(pid)) return;
    const p = passageById.get(pid)!;
    // Filter out malformed IDs (bundled markdown files ingested with filenames).
    if (!VALID_DOC_ID.test(p.docId)) return;
    const excerpt = sanitizeString(c.excerpt ?? '', 260) || truncate(p.sectionTitle, 220);
    const key = `${p.docId}::${p.sectionId}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push({
      id: `c-${i + 1}`,
      policyId: p.docId,
      title: p.title,
      section: p.sectionTitle,
      excerpt,
      relevance: i === 0 ? 'primary' : 'secondary',
    });
  });

  // If the LLM omitted citations, fall back to the top 3 valid passages.
  if (out.length === 0) {
    let i = 0;
    for (const p of passageById.values()) {
      if (!VALID_DOC_ID.test(p.docId)) continue;
      out.push({
        id: `c-${++i}`,
        policyId: p.docId,
        title: p.title,
        section: p.sectionTitle,
        excerpt: truncate(p.sectionTitle, 220),
        relevance: i === 1 ? 'primary' : 'secondary',
      });
      if (i >= 3) break;
    }
  }

  return out;
}

function sanitizeRequirements(
  raw: RawLLMJson['requirementsSnapshot'] | undefined,
  passageById: PassageMap,
): RequirementSnapshotItem[] {
  if (!raw) return [];
  const policyIds = new Set(Array.from(passageById.values()).map(p => p.docId));
  return raw
    .map<RequirementSnapshotItem>(r => ({
      label: sanitizeString(r?.label ?? '', 160),
      status: coerceStatus(r?.status),
      sourcePolicyId:
        r?.sourcePolicyId && policyIds.has(r.sourcePolicyId.toUpperCase())
          ? r.sourcePolicyId.toUpperCase()
          : '',
      sourceSection: sanitizeString(r?.sourceSection ?? '', 120),
    }))
    .filter(r => r.label.length > 0)
    .slice(0, 12);
}

function coerceStatus(raw: string | undefined): RequirementSnapshotItem['status'] {
  const s = (raw ?? '').toLowerCase();
  if (s === 'required' || s === 'recommended' || s === 'warning') return s;
  return 'recommended';
}

function coerceRiskLevel(raw: string | undefined, intent: IntentKind): StructuredResponse['riskLevel'] {
  const r = (raw ?? '').toLowerCase();
  if (r === 'none' || r === 'low' || r === 'moderate' || r === 'high' || r === 'critical') return r;
  // Audit/action-plan queries inherently raise the floor to moderate.
  if (intent === 'pre_survey_audit' || intent === 'action_plan') return 'moderate';
  return 'low';
}

function coerceConfidence(raw: string | undefined, hits: ScoredChunk[]) {
  const c = (raw ?? '').toLowerCase();
  if (c === 'high' || c === 'medium' || c === 'low') return c as 'high' | 'medium' | 'low';
  // Derive from retrieval strength when the model omitted it.
  const top = hits[0]?.score ?? 0;
  if (top >= 0.55) return 'high';
  if (top >= 0.3) return 'medium';
  return 'low';
}

/* ─────────────────────────────────────────────────────────────
   Linked references + actions — built from the corpus graph,
   NOT from free-form LLM output. This is the guardrail that
   keeps the "execution workspace" safe.
   ───────────────────────────────────────────────────────────── */

function buildLinkedReferences(args: {
  intent: IntentKind;
  hits: ScoredChunk[];
  directMatchDocIds: string[];
  docs: Map<string, CorpusDoc>;
  requiredArtifactIds: string[];
  requirementsSnapshot: RequirementSnapshotItem[];
}): LinkedReference[] {
  const { intent, hits, docs, requiredArtifactIds, requirementsSnapshot, directMatchDocIds } = args;

  // Rank: direct hits first, then retrieved docs, then docs named in
  // requiredArtifactIds / requirementsSnapshot. Cap at 8 items.
  const ranking = new Map<string, number>();
  const bump = (id: string, weight: number) => {
    ranking.set(id, (ranking.get(id) ?? 0) + weight);
  };

  for (const id of directMatchDocIds) bump(id, 10);
  hits.forEach((h, i) => bump(h.chunk.docId, 5 - i * 0.25));
  requiredArtifactIds.forEach(id => bump(id.toUpperCase(), 8));
  requirementsSnapshot.forEach(r => { if (r.sourcePolicyId) bump(r.sourcePolicyId, 3); });

  const primaryChunkByDoc = new Map<string, ScoredChunk>();
  for (const h of hits) {
    if (!primaryChunkByDoc.has(h.chunk.docId)) primaryChunkByDoc.set(h.chunk.docId, h);
  }

  // Only surface docs with a valid enterprise taxonomy ID (XX-XX-NNN).
  // This filters out large catch-all markdown files that got ingested with
  // their full filename as the ID (e.g. CIHHPP's.md, domain policy bundles).
  const VALID_ID = /^[A-Z]{2}-[A-Z]{1,3}-\d{3,4}$/;

  const ids = Array.from(ranking.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter(id => docs.has(id) && VALID_ID.test(id))
    .slice(0, 8);

  return ids.map<LinkedReference>(id => {
    const doc = docs.get(id)!;
    const firstHit = primaryChunkByDoc.get(id);
    const isDirect = directMatchDocIds.includes(id);
    const isRequired = requiredArtifactIds.some(a => a.toUpperCase() === id);
    const isControl = requirementsSnapshot.some(r => r.sourcePolicyId === id);
    const intentKind: LinkedReference['intent'] = isDirect
      ? 'required'
      : isRequired
        ? intentAwareArtifactRole(intent)
        : isControl
          ? 'supporting'
          : 'related';

    return {
      id,
      type: doc.type,
      title: doc.title,
      intent: intentKind,
      required: isRequired || isDirect,
      description:
        doc.description ?? `${doc.type.toUpperCase()} · ${doc.domain}${doc.subdomain ? '-' + doc.subdomain : ''}`,
      policyId: id,
      section: firstHit?.chunk.sectionTitle ?? (doc.sections[0]?.title ?? ''),
      accessTier: doc.accessTier || 'Tier 2 - Restricted',
      domain: doc.domain,
      subdomain: doc.subdomain,
      previewMode: doc.type === 'form' ? 'form' : doc.type === 'workflow' ? 'workflow' : 'document',
    };
  });
}

function intentAwareArtifactRole(intent: IntentKind): LinkedReference['intent'] {
  switch (intent) {
    case 'pre_survey_audit': return 'required_for_audit';
    case 'action_plan':
    case 'missing_items':
      return 'required_for_completion';
    case 'governing_body_brief':
      return 'required_for_review';
    case 'qapi_digest':
      return 'required_for_review';
    default:
      return 'required';
  }
}

function buildAvailableActions(args: {
  intent: IntentKind;
  linkedReferences: LinkedReference[];
  hits: ScoredChunk[];
  directMatchDocIds: string[];
  studioOutputType: StudioOutputType | null;
}): AvailableAction[] {
  const out: AvailableAction[] = [];

  // Primary action: open the most-relevant reference (if any).
  const primary = args.linkedReferences[0];
  if (primary) {
    out.push({
      id: `a-open-${primary.id}`,
      type: openActionFor(primary.type),
      label: `Open ${primary.id}`,
      targetId: primary.id,
      targetType: primary.type,
      studioOutputType: null,
      priority: 'primary',
    });
  }

  // Secondary: open next two references.
  for (const ref of args.linkedReferences.slice(1, 3)) {
    out.push({
      id: `a-open-${ref.id}`,
      type: openActionFor(ref.type),
      label: `Open ${ref.id}`,
      targetId: ref.id,
      targetType: ref.type,
      studioOutputType: null,
      priority: 'secondary',
    });
  }

  // Studio generators — offered based on intent and available context.
  const generators: Array<{ type: AvailableAction['type']; so: StudioOutputType; label: string }> = [
    { type: 'generate_action_plan', so: 'action_plan', label: 'Generate action plan' },
    { type: 'generate_audit_checklist', so: 'audit_checklist', label: 'Generate pre-survey audit' },
    { type: 'generate_governing_body_brief', so: 'governing_body_brief', label: 'Generate governing body brief' },
    { type: 'generate_qapi_digest', so: 'qapi_digest', label: 'Generate QAPI digest' },
    { type: 'generate_knowledge_article', so: 'knowledge_article', label: 'Generate knowledge article' },
  ];

  for (const g of generators) {
    // Skip the one that matches the current output to avoid "regenerate" suggestion.
    if (g.so === args.studioOutputType) continue;
    out.push({
      id: `a-${g.so}`,
      type: g.type,
      label: g.label,
      targetId: primary?.id ?? '',
      targetType: primary?.type ?? 'policy',
      studioOutputType: g.so,
      priority: 'secondary',
    });
  }

  return out;
}

function openActionFor(type: LinkedReference['type']): AvailableAction['type'] {
  switch (type) {
    case 'form': return 'open_form';
    case 'appendix': return 'open_appendix';
    case 'workflow': return 'open_workflow';
    case 'policy':
    default: return 'open_policy';
  }
}

/* ─────────────────────────────────────────────────────────────
   New authority + credibility helpers.
   ───────────────────────────────────────────────────────────── */

/** Resolve the governing policy ID from multiple candidate sources. */
function resolveGoverningPolicyId(
  llmNomination: string | null,
  citations: Citation[],
  directMatchDocIds: string[],
): string | null {
  const candidates = [
    llmNomination,
    directMatchDocIds[0],
    citations[0]?.policyId,
  ];
  for (const c of candidates) {
    if (c && VALID_DOC_ID.test(c)) return c;
  }
  return null;
}

/** Auto-elevate riskLevel when CoP/regulatory tags are present. */
function elevateRisk(
  base: StructuredResponse['riskLevel'],
  hasCoPTag: boolean,
  intent: IntentKind,
): StructuredResponse['riskLevel'] {
  if (base === 'critical') return 'critical';
  if (hasCoPTag) {
    // CoP-tagged content with a gap is at minimum high.
    if (base === 'none' || base === 'low') return 'moderate';
    if (base === 'moderate') return 'high';
  }
  // Audit/action queries floor at moderate.
  if ((intent === 'pre_survey_audit' || intent === 'action_plan') && base === 'none') {
    return 'moderate';
  }
  return base;
}

/** Derive CMS enforcement tier from risk + regulatory context. */
function coerceEnforcementLevel(
  raw: string | undefined,
  riskLevel: StructuredResponse['riskLevel'],
  hasCoPTag: boolean,
): EnforcementLevel {
  const r = (raw ?? '').toLowerCase();
  if (r === 'condition_level') return 'condition_level';
  if (r === 'standard_level') return 'standard_level';
  // Derive from context.
  if (hasCoPTag || riskLevel === 'critical' || riskLevel === 'high') {
    return 'condition_level';
  }
  if (riskLevel === 'moderate' || riskLevel === 'low') return 'standard_level';
  return 'none';
}

/**
 * System confidence score (0–100). Factors:
 *  - top retrieval score (0–40 pts)
 *  - citation count (0–25 pts)
 *  - governing policy present (0–20 pts)
 *  - embeddings present (0–10 pts)
 *  - no answer penalty (-40 pts)
 */
function computeConfidenceScore(args: {
  hits: ScoredChunk[];
  citations: Citation[];
  governingPolicyId: string | null;
  noAnswerFound: boolean;
  embeddingsPresent: boolean;
}): number {
  if (args.noAnswerFound) return 0;
  const topScore = args.hits[0]?.score ?? 0;
  const retrievalPts = Math.round(topScore * 40);
  const citePts = Math.min(args.citations.length * 8, 25);
  const govPts = args.governingPolicyId ? 20 : 0;
  const embedPts = args.embeddingsPresent ? 10 : 0;
  return Math.min(retrievalPts + citePts + govPts + embedPts, 100);
}

/** Sanitize and cap a string array from LLM output. */
function sanitizeStringArray(raw: unknown, maxItemLen: number, maxItems: number): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item => sanitizeString(String(item ?? ''), maxItemLen))
    .filter(s => s.length > 3)
    .slice(0, maxItems);
}

/* ─────────────────────────────────────────────────────────────
   Misc helpers.
   ───────────────────────────────────────────────────────────── */
function emptyNoAnswer(args: {
  id: string;
  input: string;
  intent: IntentKind;
  reason: string;
  model: string;
  elapsedMs: number;
}): StructuredResponse {
  return {
    id: args.id,
    responseType: 'compliance_answer',
    directAnswer: '',
    operationalRequirement: '',
    requiredArtifacts: [],
    complianceRisk: '',
    riskLevel: 'none',
    confidence: 'low',
    systemConfidenceScore: 0,
    governingPolicyId: null,
    enforcementLevel: 'none',
    complianceImpact: '',
    surveyFocus: [],
    commonFailurePoints: [],
    requirementsSnapshot: [],
    citations: [],
    linkedReferences: [],
    availableActions: [],
    studioOutputType: studioOutputForIntent(args.intent),
    noAnswerFound: true,
    noAnswerReason: args.reason,
    operationalGaps: [],
    lifecycleAlerts: [],
    regulatoryAlerts: [],
    phaseStatus: buildPhaseStatus(),
    meta: {
      intent: args.intent,
      retrievedChunkIds: [],
      model: args.model,
      elapsedMs: args.elapsedMs,
    },
  };
}

function newId(): string {
  return `ia_${randomUUID()}`;
}

function sanitizeString(s: string, max: number): string {
  if (!s) return '';
  return s.replace(/\s+/g, ' ').trim().slice(0, max);
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n) + '…';
}

function dedupeIds(ids: string[]): string[] {
  const set = new Set<string>();
  for (const raw of ids) {
    const id = raw?.trim().toUpperCase();
    if (id && /^[A-Z]{2}-[A-Z]{2,3}-\d{3,4}$/.test(id)) set.add(id);
  }
  return Array.from(set);
}
