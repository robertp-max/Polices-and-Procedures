import { POLICY_CORPUS, getCorpusPolicy } from '@/policy/data/policyCorpus';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { FORMS_DATASET } from '@/policy/data/formsLibraryDataset';
import { HELP_ARTICLES } from '@/policy/data/helpArticles';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';

/* ═══════════════════════════════════════════════════════════════════════════
   Brad reference resolver.
   ----------------------------------------------------------------------------
   Brad emits internal references with representative IDs + titles. This resolver
   maps each to a REAL, openable document in the app data so the chat UI can
   render it as an interactive link that opens in the right-side panel.

   Resolution order: exact ID → exact title → distinctive-token title match,
   searched within the reference's own family first, then across families.
   Anything that doesn't resolve is returned as `resolvable:false` so the UI can
   render it as plain text ("reference unavailable") rather than a dead link.
   Pure data lookups — no network, no PHI.
   ═══════════════════════════════════════════════════════════════════════════ */

export type BradReferenceType = 'policy' | 'workflow' | 'form' | 'help' | 'event';

/** Typed, kind-discriminated open target. The right-panel renderer dispatches on `kind`. */
export type BradReferenceTarget =
  | { kind: 'policy'; policyId: string; title: string; sectionId?: string }
  | { kind: 'workflow'; workflowId: string; title: string; stepId?: string }
  | { kind: 'form'; formId: string; title: string; formInstanceId?: string }
  | { kind: 'help'; helpId: string; title: string }
  | { kind: 'event'; eventId: string; title: string };

export interface BradReferenceInput {
  type: BradReferenceType;
  id: string;
  title: string;
  section?: string;
  family?: string;
}

export interface ResolvedBradReference {
  input: BradReferenceInput;
  resolvable: boolean;
  /** Resolved real document type (may differ from the requested type). */
  type: BradReferenceType;
  /** Resolved real document ID. */
  id: string;
  /** Resolved real document title. */
  title: string;
  section?: string;
  /** Navigation target for "open full document" (when a route exists). */
  routePath?: string;
  /** Stable resolver key the UI can pass back to re-open the exact item. */
  resolverKey: string;
  /** Typed open target — the right-panel renderer dispatches on `target.kind`. */
  target?: BradReferenceTarget;
  /** Right-panel preview content. */
  preview: { heading: string; subheading?: string; lines: string[] };
  matchKind: 'exact-id' | 'exact-title' | 'fuzzy-title' | 'none';
}

/* ─── Indexable document record ─────────────────────────────────────────────*/
interface DocRecord {
  type: BradReferenceType;
  id: string;
  title: string;
}

const STOPWORDS = new Set([
  'and', 'or', 'the', 'of', 'a', 'an', 'to', 'for', 'in', 'on', 'with', 'by',
  'requirements', 'requirement', 'policy', 'policies', 'procedure', 'procedures',
  'program', 'plan', 'management', 'process', 'standards', 'standard', '&', '/',
  'compliance', 'general', 'comprehensive', 'services', 'service',
]);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/* Build a flat searchable index across every document family (lazy + cached). */
let INDEX: DocRecord[] | null = null;
function buildIndex(): DocRecord[] {
  if (INDEX) return INDEX;
  const out: DocRecord[] = [];
  for (const p of POLICY_CORPUS) out.push({ type: 'policy', id: p.id, title: p.title });
  for (const id of Object.keys(WORKFLOWS)) {
    const w = WORKFLOWS[id] as { title?: string };
    out.push({ type: 'workflow', id, title: w?.title ?? id });
  }
  for (const f of FORMS_DATASET) out.push({ type: 'form', id: f.id, title: f.name });
  for (const id of Object.keys(HELP_ARTICLES)) {
    const a = HELP_ARTICLES[id] as { title?: string };
    out.push({ type: 'help', id, title: a?.title ?? id });
  }
  for (const e of REGULATORY_EVENTS as ReadonlyArray<{ id: string; title: string }>) {
    out.push({ type: 'event', id: e.id, title: e.title });
  }
  INDEX = out;
  return out;
}

function existsExactId(type: BradReferenceType, id: string): DocRecord | null {
  if (type === 'policy') return getCorpusPolicy(id) ? { type, id, title: getCorpusPolicy(id)!.title } : null;
  if (type === 'workflow') {
    const w = (WORKFLOWS as Record<string, { title?: string }>)[id];
    return w ? { type, id, title: w.title ?? id } : null;
  }
  if (type === 'form') {
    const f = FORMS_DATASET.find((x) => x.id === id);
    return f ? { type, id: f.id, title: f.name } : null;
  }
  if (type === 'help') {
    const a = (HELP_ARTICLES as Record<string, { title?: string }>)[id];
    return a ? { type, id, title: a.title ?? id } : null;
  }
  const e = (REGULATORY_EVENTS as ReadonlyArray<{ id: string; title: string }>).find((x) => x.id === id);
  return e ? { type, id: e.id, title: e.title } : null;
}

/** Number of reference tokens present in a candidate title. */
function matchedTokens(refTokens: string[], candidateTitle: string): number {
  const cand = new Set(tokens(candidateTitle));
  let hit = 0;
  for (const t of refTokens) if (cand.has(t)) hit += 1;
  return hit;
}

/** Whether a (matched, total) pair is a strong enough title match to link. */
function isStrongMatch(matched: number, total: number): boolean {
  if (total <= 0) return false;
  if (total === 1) return matched === 1;          // single distinctive token must hit
  return matched >= 2 && matched / total >= 0.6;  // multi-token needs ≥2 hits and ≥60%
}

const ROUTE_BY_TYPE: Record<BradReferenceType, (id: string) => string> = {
  policy: (id) => `/library/${id}`,
  workflow: (id) => `/workflows/${id}`,
  form: (id) => `/forms/${id}`,
  help: (id) => `/help/${id}`,
  event: () => `/ces/events`,
};

function buildPreview(rec: DocRecord): ResolvedBradReference['preview'] {
  switch (rec.type) {
    case 'policy': {
      const content = getPolicyContent(rec.id);
      const corpus = getCorpusPolicy(rec.id);
      const lines = (content?.sections ?? []).slice(0, 4).map((s) => {
        const body = (s.body ?? '').replace(/\s+/g, ' ').trim();
        return body ? `${s.title}: ${body.slice(0, 180)}${body.length > 180 ? '…' : ''}` : s.title;
      });
      return {
        heading: rec.title,
        subheading: corpus ? `Policy · ${corpus.domainCode}-${corpus.subdomainCode} · ${rec.id}` : `Policy · ${rec.id}`,
        lines: lines.length ? lines : ['Open the full policy for the complete text.'],
      };
    }
    case 'workflow': {
      const w = (WORKFLOWS as Record<string, { processOverview?: string; steps?: unknown[]; domain?: string }>)[rec.id];
      const lines: string[] = [];
      if (w?.processOverview) lines.push(w.processOverview.replace(/\s+/g, ' ').slice(0, 240));
      if (w?.steps?.length) lines.push(`${w.steps.length} steps in this workflow.`);
      return { heading: rec.title, subheading: `Workflow · ${w?.domain ?? ''} · ${rec.id}`, lines: lines.length ? lines : ['Open the full workflow for steps and roles.'] };
    }
    case 'form': {
      const f = FORMS_DATASET.find((x) => x.id === rec.id);
      return {
        heading: rec.title,
        subheading: f ? `Form · ${f.type} · ${rec.id}` : `Form · ${rec.id}`,
        lines: f ? [`Usage: ${f.usage}`, `Frequency: ${f.frequency}`, f.policies?.length ? `Linked policies: ${f.policies.slice(0, 4).join(', ')}` : 'Open the form for fields and print-safe preview.'] : ['Open the form for details.'],
      };
    }
    case 'help': {
      const a = (HELP_ARTICLES as Record<string, { purpose?: string; overview?: string; estimatedMinutes?: number }>)[rec.id];
      const lines: string[] = [];
      if (a?.overview) lines.push(a.overview.replace(/\s+/g, ' ').slice(0, 240));
      else if (a?.purpose) lines.push(a.purpose.replace(/\s+/g, ' ').slice(0, 240));
      if (a?.estimatedMinutes) lines.push(`~${a.estimatedMinutes} min read.`);
      return { heading: rec.title, subheading: `Help article · ${rec.id}`, lines: lines.length ? lines : ['Open the full help article.'] };
    }
    case 'event': {
      const e = (REGULATORY_EVENTS as ReadonlyArray<{ id: string; title: string; domain?: string }>).find((x) => x.id === rec.id);
      return { heading: rec.title, subheading: `Regulatory event · ${rec.id}`, lines: [e?.domain ? `Domain: ${e.domain}` : 'Open the events board for details.'] };
    }
  }
}

function buildTarget(rec: DocRecord, section?: string): BradReferenceTarget {
  switch (rec.type) {
    case 'policy': return { kind: 'policy', policyId: rec.id, title: rec.title, sectionId: section };
    case 'workflow': return { kind: 'workflow', workflowId: rec.id, title: rec.title, stepId: section };
    case 'form': return { kind: 'form', formId: rec.id, title: rec.title };
    case 'help': return { kind: 'help', helpId: rec.id, title: rec.title };
    case 'event': return { kind: 'event', eventId: rec.id, title: rec.title };
  }
}

function resolved(rec: DocRecord, input: BradReferenceInput, matchKind: ResolvedBradReference['matchKind']): ResolvedBradReference {
  return {
    input,
    resolvable: true,
    type: rec.type,
    id: rec.id,
    title: rec.title,
    section: input.section,
    routePath: ROUTE_BY_TYPE[rec.type](rec.id),
    resolverKey: `${rec.type}:${rec.id}`,
    target: buildTarget(rec, input.section),
    preview: buildPreview(rec),
    matchKind,
  };
}

/** Resolve one Brad reference to a real, openable document (or mark unresolved). */
export function resolveBradReference(input: BradReferenceInput): ResolvedBradReference {
  // 1) Exact ID within the requested family.
  const byId = existsExactId(input.type, input.id);
  if (byId) return resolved(byId, input, 'exact-id');

  const index = buildIndex();
  const refTitleNorm = input.title.trim().toLowerCase();

  // 2) Exact title — same family first, then any family.
  const exactSame = index.find((d) => d.type === input.type && d.title.trim().toLowerCase() === refTitleNorm);
  if (exactSame) return resolved(exactSame, input, 'exact-title');
  const exactAny = index.find((d) => d.title.trim().toLowerCase() === refTitleNorm);
  if (exactAny) return resolved(exactAny, input, 'exact-title');

  // 3) Distinctive-token title match (same family weighted first).
  const refTokens = tokens(input.title);
  if (refTokens.length) {
    let best: { rec: DocRecord; matched: number; rank: number } | null = null;
    for (const d of index) {
      const matched = matchedTokens(refTokens, d.title);
      if (!isStrongMatch(matched, refTokens.length)) continue;
      // Rank by matched count, then same-family preference, then shorter title.
      const rank = matched * 100 + (d.type === input.type ? 10 : 0) - tokens(d.title).length;
      if (!best || rank > best.rank) best = { rec: d, matched, rank };
    }
    if (best) return resolved(best.rec, input, 'fuzzy-title');
  }

  // 4) Unresolved — UI must render as plain text, not a clickable link.
  return {
    input,
    resolvable: false,
    type: input.type,
    id: input.id,
    title: input.title,
    section: input.section,
    resolverKey: `${input.type}:${input.id}`,
    preview: { heading: input.title, lines: ['This reference isn’t available to open.'] },
    matchKind: 'none',
  };
}

export function resolveBradReferences(inputs: BradReferenceInput[]): ResolvedBradReference[] {
  return inputs.map(resolveBradReference);
}
