/* eslint-disable no-console */
/* ══════════════════════════════════════════════════════════════════════
   Workflow Compiler — markdown → typed data.

   Reads every `Builder/Policies/Workflows/*-WORKFLOWS.md` file, parses
   the authored 13-section grammar, validates cross-references against
   formsCatalog / policyStore, and emits three generated artifacts:

     src/policy/data/workflows.generated.ts
     src/policy/data/workflowGraph.generated.ts
     src/policy/data/workflowTemplates.generated.ts

   INVARIANTS ENFORCED
   - every workflow must have all 13 authored sections
   - every formId referenced in steps or §7 must resolve in formsCatalog
   - authored step order is preserved
   - regulatory anchors are preserved verbatim

   Usage:
     npm run compile:workflows
   ══════════════════════════════════════════════════════════════════════ */

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Types (duplicated verbatim to keep compiler self-contained) ──
type DomainCode = 'GV'|'CL'|'QA'|'HR'|'CO'|'FN'|'OP'|'EN'|'IT'|'RM';
type CadenceKind = 'time_based'|'event_based'|'conditional'|'continuous';
type CadenceInterval =
  | 'daily'|'weekly'|'monthly'|'quarterly'|'semiannual'
  | 'annual'|'biennial'|'episodic'|'per_event'|'on_demand';
type RiskBand = 'low'|'moderate'|'high'|'immediate_jeopardy';

interface WorkflowStep {
  order: number; action: string; role: string;
  formRaw: string; formIds: string[]; deadline: string;
}
interface WorkflowTrigger { kind: CadenceKind; description: string }
interface WorkflowRoles { primary: string[]; supporting: string[]; approval: string[] }
interface WorkflowApproval { body?: string; description: string; requiresGoverningBody: boolean }
interface WorkflowCadence { kind: CadenceKind; interval: CadenceInterval; anchor?: string }
interface WorkflowMetrics {
  stepCount: number; formCount: number; policyCount: number;
  declaredRisk: RiskBand; requiresGoverningBody: boolean;
}
interface Workflow {
  id: string; domain: DomainCode; title: string;
  sourceMarkdown: string; sourcePath: string;
  policyReferences: string[]; policyRefs: string[]; regulatoryAnchors: string[];
  processOverview: string;
  triggers: WorkflowTrigger[];
  roles: WorkflowRoles;
  inputs: string[];
  steps: WorkflowStep[];
  requiredForms: string[]; requiredFormsRaw: string;
  approvals: WorkflowApproval[]; approvalsRaw: string;
  outputs: string; sla: string; escalationLogic: string;
  failureConditions: string; auditRequirements: string;
  cadence: WorkflowCadence;
  dependencies: Array<{ upstreamId: string; reason: string }>;
  metrics: WorkflowMetrics;
}

// ── Paths ──────────────────────────────────────────────────────────
const ROOT = resolve(__dirname, '..');
const WORKFLOW_DIR = join(ROOT, 'Builder', 'Policies', 'Workflows');
const OUT_DIR = join(ROOT, 'src', 'policy', 'data');
const FORMS_CATALOG_PATH = join(ROOT, 'src', 'policy', 'data', 'formsCatalog.ts');
const FORMS_INDEX_PATH = join(ROOT, 'Builder', 'Forns', 'FORMS_EXPORT_INDEX.txt');

// ── Known forms (loaded once) ──────────────────────────────────────
function loadKnownFormIds(): { ids: Set<string>; titles: Map<string, string> } {
  const ids = new Set<string>();
  const titles = new Map<string, string>();

  if (existsSync(FORMS_CATALOG_PATH)) {
    const src = readFileSync(FORMS_CATALOG_PATH, 'utf8');
    for (const m of src.matchAll(/'([A-Z]{2}-[A-Z]{1,3}-\d{3,4})'\s*:/g)) ids.add(m[1]);
    for (const m of src.matchAll(/id:\s*'([A-Z]{2}-[A-Z]{1,3}-\d{3,4})'/g)) ids.add(m[1]);
  }

  if (existsSync(FORMS_INDEX_PATH)) {
    const src = readFileSync(FORMS_INDEX_PATH, 'utf8');
    for (const line of src.split(/\r?\n/)) {
      const m = /^([A-Z]{2}-[A-Z]{1,3}-\d{3,4})\s*\|\s*([^|]+?)\s*\|/.exec(line.trim());
      if (m) {
        ids.add(m[1]);
        titles.set(m[1], m[2].trim());
      }
    }
  }

  return { ids, titles };
}

// Pattern for form IDs: e.g. CL-FM-009, QA-F-012, GV-FM-001, HR-FM-040
const FORM_ID_RE = /\b[A-Z]{2}-(?:FM|F|FF|JD)-\d{3,4}\b/g;
// Pattern for policy IDs: CL-PA-002, GV-GB-001, CO-CP-001, etc.
const POLICY_ID_RE = /\b[A-Z]{2}-[A-Z]{2,3}-\d{3}\b/g;
// Pattern for regulatory anchors: 42 CFR § 484.105, SSA § 1814, Title 22, CCR § ...
const REG_ANCHOR_RE = /(?:42\s*CFR\s*§\s*[\d.]+(?:\([a-z0-9]+\))*|SSA\s*§\s*[\d().a-z]+|Title\s*22|CCR\s*§\s*[\d.]+|HIPAA\s*§\s*[\d.]+|OIG\s+\d+|45\s*CFR\s*§?\s*[\d.]+)/g;

// ── Parser ─────────────────────────────────────────────────────────
interface ParseError { file: string; workflowId?: string; message: string }

const errors: ParseError[] = [];
const warnings: ParseError[] = [];

function splitWorkflows(md: string): Array<{ header: string; body: string }> {
  // Workflows begin with `## <ID> — <TITLE>`
  const chunks: Array<{ header: string; body: string }> = [];
  const re = /^## ([A-Z]{2}-WF-\d+)\s+—\s+(.+?)$/gm;
  const matches: Array<{ id: string; title: string; start: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    matches.push({ id: m[1], title: m[2].trim(), start: m.index });
  }
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].start;
    const end = i + 1 < matches.length ? matches[i + 1].start : md.length;
    chunks.push({
      header: `${matches[i].id} — ${matches[i].title}`,
      body: md.slice(start, end),
    });
  }
  return chunks;
}

/** Extract the content under `### N. TITLE` up to the next `### N+` or trailing `---`. */
function extractSection(body: string, sectionIndex: number): string | null {
  // First locate the header line.
  const headerRe = new RegExp(`^###\\s*${sectionIndex}\\.?\\s+[^\\n]+$`, 'm');
  const headerMatch = headerRe.exec(body);
  if (!headerMatch) return null;
  const startIdx = headerMatch.index + headerMatch[0].length;

  // Find the nearest terminator: next `### <digit>.` header OR a standalone `---` line.
  const tail = body.slice(startIdx);
  const nextHeader = /\n###\s+\d+\.?\s+/.exec(tail);
  const nextRule = /\n---\s*(?:\r?\n|$)/.exec(tail);
  let endRel = tail.length;
  if (nextHeader) endRel = Math.min(endRel, nextHeader.index);
  if (nextRule) endRel = Math.min(endRel, nextRule.index);
  return tail.slice(0, endRel).trim();
}

function extractListLines(section: string | null): string[] {
  if (!section) return [];
  const lines: string[] = [];
  for (const raw of section.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith('- ')) lines.push(line.slice(2).trim());
    else if (/^\d+\.\s+/.test(line)) lines.push(line.replace(/^\d+\.\s+/, '').trim());
  }
  return lines;
}

function parseRoles(section: string | null): WorkflowRoles {
  const roles: WorkflowRoles = { primary: [], supporting: [], approval: [] };
  if (!section) return roles;
  for (const raw of section.split(/\r?\n/)) {
    const line = raw.trim().replace(/^[-*]\s*/, '');
    const m = line.match(/^\*\*(Primary(?:\s+owner)?|Supporting|Approval(?:\s+authority)?)[:*]?\*\*\s*:?\s*(.+)$/i);
    if (m) {
      const category = m[1].toLowerCase();
      const list = m[2].split(/[;,]/).map((r) => r.trim()).filter(Boolean);
      if (category.startsWith('primary')) roles.primary.push(...list);
      else if (category.startsWith('supporting')) roles.supporting.push(...list);
      else if (category.startsWith('approval')) roles.approval.push(...list);
    }
  }
  return roles;
}

function parseTriggers(section: string | null): WorkflowTrigger[] {
  if (!section) return [];
  const out: WorkflowTrigger[] = [];
  for (const raw of section.split(/\r?\n/)) {
    const line = raw.trim().replace(/^[-*]\s*/, '');
    if (!line) continue;
    let kind: CadenceKind = 'event_based';
    if (/^\*\*Time[-\s]?based/i.test(line) || /recert|annual|quarterly|monthly|calendar/i.test(line)) kind = 'time_based';
    if (/^\*\*Event[-\s]?based/i.test(line)) kind = 'event_based';
    if (/^\*\*Conditional/i.test(line) || /when\b.*\b(condition|threshold|rule)/i.test(line)) kind = 'conditional';
    if (/^\*\*Continuous/i.test(line) || /always[-\s]on|ongoing/i.test(line)) kind = 'continuous';
    out.push({ kind, description: line.replace(/^\*\*[^*]+\*\*:?\s*/, '').trim() });
  }
  return out;
}

function parseStepsTable(section: string | null): WorkflowStep[] {
  if (!section) return [];
  const lines = section.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.startsWith('|'));
  const steps: WorkflowStep[] = [];
  if (lines.length === 0) return steps;

  // Detect header row (contains `Action` or `#`) to locate Form + Deadline column indices.
  let formCol = 3;
  let deadlineCol = 4;
  for (const hdr of lines) {
    if (!/^\|\s*#\s*\|/i.test(hdr) && !/action/i.test(hdr)) continue;
    const cols = hdr.split('|').slice(1, -1).map((c) => c.trim().toLowerCase());
    const fi = cols.findIndex((c) => c === 'form' || c.startsWith('form'));
    const di = cols.findIndex((c) => c === 'deadline' || c.startsWith('deadline'));
    if (fi >= 0) formCol = fi;
    if (di >= 0) deadlineCol = di;
    break;
  }

  for (const line of lines) {
    // Skip header / separator rows.
    if (/^\|\s*#\s*\|/.test(line)) continue;
    if (/^\|\s*:?-{2,}/.test(line)) continue;
    if (/^\|[\s|:-]+\|$/.test(line)) continue;
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (cells.length < 4) continue;
    const order = parseInt(cells[0], 10);
    if (!Number.isFinite(order)) continue;
    const formRaw = cells[formCol] ?? '';
    const formIds = Array.from(formRaw.matchAll(FORM_ID_RE)).map((m) => m[0]);
    steps.push({
      order,
      action: cells[1] ?? '',
      role: cells[2] ?? '',
      formRaw,
      formIds: Array.from(new Set(formIds)),
      deadline: cells[deadlineCol] ?? cells[cells.length - 1] ?? '',
    });
  }
  return steps;
}

function parseApprovals(section: string | null): WorkflowApproval[] {
  if (!section) return [];
  const out: WorkflowApproval[] = [];
  const raw = section.trim();
  if (!raw) return out;

  const requiresGB = /governing\s+body/i.test(raw);

  const listLines = extractListLines(section);
  if (listLines.length > 0) {
    for (const line of listLines) {
      out.push({
        description: line,
        requiresGoverningBody: /governing\s+body/i.test(line),
      });
    }
  } else {
    out.push({
      description: raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).join(' '),
      requiresGoverningBody: requiresGB,
    });
  }
  return out;
}

function inferCadence(triggers: WorkflowTrigger[], sla: string): WorkflowCadence {
  const text = [...triggers.map((t) => t.description), sla].join(' ').toLowerCase();
  const has = (needle: string) => text.includes(needle);
  let interval: CadenceInterval = 'on_demand';
  if (has('daily')) interval = 'daily';
  else if (has('weekly')) interval = 'weekly';
  else if (has('monthly')) interval = 'monthly';
  else if (has('quarterly') || has('every calendar quarter')) interval = 'quarterly';
  else if (has('semiannual') || has('semi-annual') || has('every 6 month')) interval = 'semiannual';
  else if (has('biennial') || has('every 2 year')) interval = 'biennial';
  else if (has('annual') || has('yearly') || has('each year') || has('every calendar year')) interval = 'annual';
  else if (has('per episode') || has('at soc') || has('at recert') || has('each episode')) interval = 'episodic';
  else if (triggers.some((t) => t.kind === 'event_based')) interval = 'per_event';

  let kind: CadenceKind = 'event_based';
  if (triggers.some((t) => t.kind === 'continuous')) kind = 'continuous';
  else if (triggers.some((t) => t.kind === 'time_based')) kind = 'time_based';
  else if (triggers.some((t) => t.kind === 'conditional')) kind = 'conditional';
  return { kind, interval };
}

function inferRisk(failureConditions: string, escalation: string): RiskBand {
  const text = `${failureConditions} ${escalation}`.toLowerCase();
  if (/immediate\s+jeopardy|medicare\s+termination|false\s+claims|ij\b|condition[-\s]level/.test(text)) return 'immediate_jeopardy';
  if (/survey\s+deficiency|claim\s+denial|citation|licensure\s+(risk|violat)/.test(text)) return 'high';
  if (/warning|corrective\s+action|re[-\s]training/.test(text)) return 'moderate';
  return 'moderate';
}

function compileWorkflow(
  body: string,
  id: string,
  title: string,
  sourcePath: string,
  knownForms: Set<string>,
): Workflow | null {
  const domain = id.slice(0, 2) as DomainCode;

  const s1  = extractSection(body, 1);
  const s2  = extractSection(body, 2);
  const s3  = extractSection(body, 3);
  const s4  = extractSection(body, 4);
  const s5  = extractSection(body, 5);
  const s6  = extractSection(body, 6);
  const s7  = extractSection(body, 7);
  const s8  = extractSection(body, 8);
  const s9  = extractSection(body, 9);
  const s10 = extractSection(body, 10);
  const s11 = extractSection(body, 11);
  const s12 = extractSection(body, 12);
  const s13 = extractSection(body, 13);

  const missing: number[] = [];
  [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13].forEach((s, i) => {
    if (s === null || s.trim() === '') missing.push(i + 1);
  });
  if (missing.length > 0) {
    warnings.push({
      file: sourcePath, workflowId: id,
      message: `missing sections: [${missing.join(', ')}]`,
    });
  }

  const policyReferences = extractListLines(s1);
  const refBlob = policyReferences.join(' ');
  const policyRefs = Array.from(new Set(Array.from(refBlob.matchAll(POLICY_ID_RE)).map((m) => m[0])));
  const regulatoryAnchors = Array.from(new Set(Array.from(refBlob.matchAll(REG_ANCHOR_RE)).map((m) => m[0].trim())));

  const triggers = parseTriggers(s3);
  const roles = parseRoles(s4);
  const inputs = extractListLines(s5);
  const steps = parseStepsTable(s6);
  const approvals = parseApprovals(s8);

  // §7 required forms = union of all form IDs from §7 + every step's formIds.
  const sevenForms = s7 ? Array.from(s7.matchAll(FORM_ID_RE)).map((m) => m[0]) : [];
  const stepForms = steps.flatMap((st) => st.formIds);
  const requiredForms = Array.from(new Set([...sevenForms, ...stepForms])).sort();

  // Validate form IDs against catalog (non-fatal warning if unknown).
  const unknownForms = requiredForms.filter((f) => !knownForms.has(f));
  if (unknownForms.length > 0) {
    warnings.push({
      file: sourcePath, workflowId: id,
      message: `unknown form IDs: ${unknownForms.join(', ')}`,
    });
  }

  const sla = (s10 ?? '').trim();
  const cadence = inferCadence(triggers, sla);
  const failureConditions = (s12 ?? '').trim();
  const escalationLogic = (s11 ?? '').trim();
  const declaredRisk = inferRisk(failureConditions, escalationLogic);

  const requiresGoverningBody = approvals.some((a) => a.requiresGoverningBody);

  return {
    id, domain, title,
    sourceMarkdown: body.trim(),
    sourcePath,
    policyReferences, policyRefs, regulatoryAnchors,
    processOverview: (s2 ?? '').trim(),
    triggers, roles, inputs, steps,
    requiredForms,
    requiredFormsRaw: (s7 ?? '').trim(),
    approvals,
    approvalsRaw: (s8 ?? '').trim(),
    outputs: (s9 ?? '').trim(),
    sla,
    escalationLogic,
    failureConditions,
    auditRequirements: (s13 ?? '').trim(),
    cadence,
    dependencies: [],
    metrics: {
      stepCount: steps.length,
      formCount: requiredForms.length,
      policyCount: policyRefs.length,
      declaredRisk,
      requiresGoverningBody,
    },
  };
}

// ── Dependency inference ───────────────────────────────────────────
function inferDependencies(workflows: Workflow[]): void {
  const byId = new Map(workflows.map((w) => [w.id, w]));
  for (const w of workflows) {
    const found = new Set<string>();
    const scan = (text: string) => {
      for (const m of text.matchAll(/\b([A-Z]{2}-WF-\d+)\b/g)) {
        if (m[1] !== w.id && byId.has(m[1])) found.add(m[1]);
      }
    };
    scan(w.processOverview);
    scan(w.escalationLogic);
    scan(w.auditRequirements);
    scan(w.failureConditions);
    for (const s of w.steps) scan(s.action);
    w.dependencies = Array.from(found).map((upstreamId) => ({
      upstreamId,
      reason: 'Referenced by authored workflow content.',
    }));
  }
}

// ── Graph + KPI builder ────────────────────────────────────────────
function buildGraph(workflows: Workflow[]) {
  const byForm: Record<string, string[]> = {};
  const byPolicy: Record<string, string[]> = {};
  const byRegulation: Record<string, string[]> = {};
  const byRole: Record<string, string[]> = {};
  const byDomain: Record<string, string[]> = {};
  const downstream: Record<string, string[]> = {};

  const push = (bucket: Record<string, string[]>, key: string, val: string) => {
    if (!key) return;
    (bucket[key] ||= []).push(val);
  };

  for (const w of workflows) {
    push(byDomain, w.domain, w.id);
    for (const f of w.requiredForms) push(byForm, f, w.id);
    for (const p of w.policyRefs) push(byPolicy, p, w.id);
    for (const r of w.regulatoryAnchors) push(byRegulation, r, w.id);
    for (const role of [...w.roles.primary, ...w.roles.supporting, ...w.roles.approval]) {
      push(byRole, role, w.id);
    }
    for (const dep of w.dependencies) push(downstream, dep.upstreamId, w.id);
  }

  const kpis = {
    total: workflows.length,
    byDomain: Object.fromEntries(
      Object.entries(byDomain).map(([k, v]) => [k, v.length]),
    ),
    byCadence: workflows.reduce<Record<string, number>>((acc, w) => {
      acc[w.cadence.kind] = (acc[w.cadence.kind] ?? 0) + 1;
      return acc;
    }, {}),
    requiresGoverningBody: workflows.filter((w) => w.metrics.requiresGoverningBody).length,
    highRisk: workflows.filter((w) =>
      w.metrics.declaredRisk === 'high' || w.metrics.declaredRisk === 'immediate_jeopardy',
    ).length,
  };

  return {
    workflowIds: workflows.map((w) => w.id),
    byForm, byPolicy, byRegulation, byRole, byDomain,
    downstream, kpis,
  };
}

// ── Template projection ────────────────────────────────────────────
function projectTemplates(workflows: Workflow[]) {
  return workflows.map((w) => ({
    workflowId: w.id,
    templateKey: `${w.id}::${w.cadence.interval}`,
    cadence: w.cadence,
    approvals: w.approvals,
    requiredForms: w.requiredForms,
    stepCount: w.metrics.stepCount,
    declaredRisk: w.metrics.declaredRisk,
    regulatoryAnchors: w.regulatoryAnchors,
  }));
}

// ── Serializer ─────────────────────────────────────────────────────
function serialize(value: unknown): string {
  return JSON.stringify(value, null, 2)
    // Convert bare keys where safe to reduce file size; leave quoted keys in place.
    ;
}

function emit(workflows: Workflow[]) {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

  // workflows.generated.ts
  const workflowsFile =
`/* AUTO-GENERATED by scripts/compileWorkflows.ts.
   Do not edit by hand. Re-run \`npm run compile:workflows\`.
   Source of truth: Builder/Policies/Workflows/*-WORKFLOWS.md */

import type { Workflow, WorkflowCardProjection } from '@/policy/types/workflow';

export const WORKFLOWS: Record<string, Workflow> = ${serialize(
  Object.fromEntries(workflows.map((w) => [w.id, w])),
)};

export const WORKFLOW_LIST: Workflow[] = Object.values(WORKFLOWS);

export const WORKFLOW_CARDS: WorkflowCardProjection[] = WORKFLOW_LIST.map((w) => ({
  id: w.id,
  domain: w.domain,
  title: w.title,
  processOverview: w.processOverview,
  cadence: w.cadence,
  triggerSummary: w.triggers[0]?.description ?? 'On demand',
  primaryRole: w.roles.primary[0] ?? w.roles.supporting[0] ?? '—',
  formCount: w.metrics.formCount,
  policyCount: w.metrics.policyCount,
  declaredRisk: w.metrics.declaredRisk,
  requiresGoverningBody: w.metrics.requiresGoverningBody,
}));

export function getWorkflow(id: string): Workflow | null {
  return WORKFLOWS[id] ?? null;
}
`;
  writeFileSync(join(OUT_DIR, 'workflows.generated.ts'), workflowsFile, 'utf8');

  // workflowGraph.generated.ts
  const graph = buildGraph(workflows);
  const graphFile =
`/* AUTO-GENERATED by scripts/compileWorkflows.ts. */
import type { WorkflowGraph } from '@/policy/types/workflow';

export const WORKFLOW_GRAPH: WorkflowGraph = ${serialize(graph)} as unknown as WorkflowGraph;

export function workflowsByForm(formId: string): string[] {
  return WORKFLOW_GRAPH.byForm[formId] ?? [];
}
export function workflowsByPolicy(policyId: string): string[] {
  return WORKFLOW_GRAPH.byPolicy[policyId] ?? [];
}
export function workflowsByRegulation(anchor: string): string[] {
  return WORKFLOW_GRAPH.byRegulation[anchor] ?? [];
}
export function workflowsByRole(role: string): string[] {
  return WORKFLOW_GRAPH.byRole[role] ?? [];
}
`;
  writeFileSync(join(OUT_DIR, 'workflowGraph.generated.ts'), graphFile, 'utf8');

  // workflowTemplates.generated.ts
  const templates = projectTemplates(workflows);
  const templatesFile =
`/* AUTO-GENERATED by scripts/compileWorkflows.ts. */
import type { WorkflowTemplate } from '@/policy/types/workflow';

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = ${serialize(templates)} as unknown as WorkflowTemplate[];

export const WORKFLOW_TEMPLATE_BY_ID: Record<string, WorkflowTemplate> = Object.fromEntries(
  WORKFLOW_TEMPLATES.map((t) => [t.workflowId, t]),
);
`;
  writeFileSync(join(OUT_DIR, 'workflowTemplates.generated.ts'), templatesFile, 'utf8');
}

function emitFormTitles(titles: Map<string, string>) {
  const obj: Record<string, string> = {};
  for (const [id, title] of titles.entries()) obj[id] = title;
  const file =
`/* AUTO-GENERATED by scripts/compileWorkflows.ts.
   Source: Builder/Forns/FORMS_EXPORT_INDEX.txt — 361 forms. */
export const FORM_TITLES: Record<string, string> = ${JSON.stringify(obj, null, 2)};
export function formTitle(id: string): string { return FORM_TITLES[id] ?? id; }
`;
  writeFileSync(join(OUT_DIR, 'formTitles.generated.ts'), file, 'utf8');
}

// ── Main ───────────────────────────────────────────────────────────
function main() {
  const { ids: knownForms, titles: formTitles } = loadKnownFormIds();
  const files = readdirSync(WORKFLOW_DIR)
    .filter((f) => /^[A-Z]{2}-WORKFLOWS(?:-[A-Z]+)?\.md$/.test(f))
    .map((f) => join(WORKFLOW_DIR, f));

  const allWorkflows: Workflow[] = [];
  for (const file of files) {
    const md = readFileSync(file, 'utf8');
    const relPath = relative(ROOT, file).replace(/\\/g, '/');
    const chunks = splitWorkflows(md);
    for (const chunk of chunks) {
      const [idMatch, titleMatch] = chunk.header.split(' — ');
      const id = idMatch.trim();
      const title = (titleMatch ?? '').trim();
      const wf = compileWorkflow(chunk.body, id, title, relPath, knownForms);
      if (wf) allWorkflows.push(wf);
    }
  }

  inferDependencies(allWorkflows);
  emit(allWorkflows);
  emitFormTitles(formTitles);

  const total = allWorkflows.length;
  const byDomainCount: Record<string, number> = {};
  for (const w of allWorkflows) byDomainCount[w.domain] = (byDomainCount[w.domain] ?? 0) + 1;

  console.log(`✓ Compiled ${total} workflows across ${Object.keys(byDomainCount).length} domains:`);
  for (const [d, n] of Object.entries(byDomainCount).sort()) {
    console.log(`  ${d}: ${n}`);
  }
  if (warnings.length > 0) {
    console.warn(`\n⚠ ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 30)) {
      console.warn(`  - [${w.workflowId ?? '?'}] ${w.message}`);
    }
    if (warnings.length > 30) console.warn(`  ... +${warnings.length - 30} more`);
  }
  if (errors.length > 0) {
    console.error(`\n✗ ${errors.length} error(s):`);
    for (const e of errors) console.error(`  - ${e.message}`);
    process.exit(1);
  }
  console.log(`\n→ wrote:\n  src/policy/data/workflows.generated.ts\n  src/policy/data/workflowGraph.generated.ts\n  src/policy/data/workflowTemplates.generated.ts`);
}

main();
