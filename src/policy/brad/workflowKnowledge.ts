/* ══════════════════════════════════════════════════════════════════════
   Brad — Workflow Knowledge Service.

   Deterministic retrieval over the compiled workflow corpus. This module
   guarantees that when a user asks a workflow question, Brad responds
   with the EXACT authored workflow content — authored order preserved,
   required forms preserved, escalations preserved, deadlines preserved.

   Brad MAY freely summarize non-workflow questions upstream (that's the
   server's job), but any query that classifies as workflow-related here
   is answered from this source of truth — not from LLM paraphrase.

   Contract:
     classifyWorkflowQuery(q)  → which workflow(s) / which section(s)
     answerWorkflowQuery(q, s) → grounded, structured answer
     renderWorkflowAnswer(a)   → markdown output matching the Brad format
   ══════════════════════════════════════════════════════════════════════ */

import { WORKFLOWS, WORKFLOW_LIST } from '@/policy/data/workflows.generated';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import { formTitle } from '@/policy/data/formTitles.generated';
import type { Workflow, WorkflowStep } from '@/policy/types/workflow';

/* ── Section keys match the authored 13 sections ─────────────────── */
export type WorkflowSection =
  | 'full'
  | 'overview'     // §2
  | 'triggers'     // §3
  | 'roles'        // §4
  | 'inputs'       // §5
  | 'steps'        // §6
  | 'forms'        // §7
  | 'approvals'    // §8
  | 'outputs'      // §9
  | 'sla'          // §10
  | 'escalation'   // §11
  | 'failure'      // §12
  | 'audit';       // §13

export interface WorkflowIntent {
  workflowIds: string[];
  section: WorkflowSection;
  /** Step index (1-based) if the user asked about a specific step. */
  stepHint?: number;
  /** Why the classifier decided this — useful for Brad telemetry. */
  reason: string;
}

export interface RuntimeState {
  /** Active instance, if the user is inside one. */
  instanceId?: string;
  /** Current step order (1-based). 0 = not started. */
  currentStep?: number;
  /** Missing form ids at query time. */
  missingForms?: string[];
  /** Pending approval labels. */
  pendingApprovals?: string[];
  /** True if the event is overdue. */
  overdue?: boolean;
  /** One of the 8 audit states. Fed from classifyAuditState. */
  auditState?:
    | 'audit-ready'
    | 'complete-missing-evidence'
    | 'complete-pending-approval'
    | 'at-risk'
    | 'in-progress'
    | 'blocked'
    | 'overdue'
    | 'not-certifiable'
    | 'certified-locked';
  /** True when the instance has been formally certified and locked. */
  isCertified?: boolean;
  /** Count of missing/pending evidence items (forms + minutes). */
  missingEvidenceCount?: number;
  /** Days past due (0 if on time or future). */
  slaDaysPastDue?: number;
  /** True if the completion checklist currently passes. */
  readyForCertification?: boolean;
  /** Human-readable list of blockers preventing certification. */
  certificationBlockers?: string[];
  /** Optional risk band override from the compliance engine. */
  risk?: 'low' | 'moderate' | 'high' | 'immediate_jeopardy';
}

export interface WorkflowAnswer {
  intent: WorkflowIntent;
  workflows: Workflow[];
  /** Markdown-formatted answer body, already section-structured. */
  markdown: string;
  /** Raw source citations (sourcePath + headings) for Brad references. */
  citations: Array<{ workflowId: string; sourcePath: string; section: string }>;
  /** True when answer reflects a live instance (state-aware). */
  stateAware: boolean;
}

/* ══════════════════════════════════════════════════════════════════
   1. Classification
   ══════════════════════════════════════════════════════════════════ */

const WORKFLOW_ID_RE  = /\b([A-Z]{2}-WF-\d+)\b/i;
const POLICY_ID_RE_IN = /\b([A-Z]{2}-[A-Z]{2,3}-\d{3})\b/;
const FORM_ID_RE_IN   = /\b([A-Z]{2}-(?:FM|F|FF|JD)-\d{3,4})\b/i;
const STEP_RE         = /\bstep\s*#?\s*(\d+)\b/i;

const SECTION_CUES: Array<{ section: WorkflowSection; re: RegExp }> = [
  { section: 'overview',   re: /\b(what is|process overview|summary|describe)\b/i },
  { section: 'triggers',   re: /\b(trigger|when (?:does|is)|kicks off|fires when)\b/i },
  { section: 'roles',      re: /\b(who (?:does|owns|is responsible)|responsible roles?|role\b)/i },
  { section: 'inputs',     re: /\binput(s)?\b/i },
  { section: 'steps',      re: /\b(step(s)?|how (?:do|to)|walk(?: me)? through|procedure|process steps|what comes next|next step)\b/i },
  { section: 'forms',      re: /\b(form(s)? (?:needed|required)|what forms?|documents? (?:needed|required))\b/i },
  { section: 'approvals',  re: /\b(approve|approval|who signs|sign-off|governing body approve)\b/i },
  { section: 'outputs',    re: /\b(output(s)?|deliverables?|what (?:do we|you) produce)\b/i },
  { section: 'sla',        re: /\b(deadline(s)?|sla|turnaround|due (?:date|by)|when (?:must|is it) (?:completed|due))\b/i },
  { section: 'escalation', re: /\b(escalat|blocked|blocker|stuck|overdue|missed|delay(ed)?)\b/i },
  { section: 'failure',    re: /\b(fail|consequence|penalty|risk (?:of )?(?:missing|skipping)|happens if)\b/i },
  { section: 'audit',      re: /\b(audit|surveyor|survey|evidence|documentation requirement)\b/i },
];

/**
 * Resolve a free-text query to one or more workflows + a target section.
 * Returns null if the query doesn't appear to be a workflow question
 * (Brad should then fall through to normal server-side retrieval).
 */
export function classifyWorkflowQuery(query: string): WorkflowIntent | null {
  const q = query.trim();
  if (!q) return null;

  const reasons: string[] = [];

  // 1. Direct workflow ID mention — highest precedence.
  const idMatch = WORKFLOW_ID_RE.exec(q);
  let workflowIds: string[] = [];
  if (idMatch) {
    const id = idMatch[1].toUpperCase();
    if (WORKFLOWS[id]) {
      workflowIds = [id];
      reasons.push(`direct ID match: ${id}`);
    }
  }

  // 2. Policy ref → workflows referencing it.
  if (workflowIds.length === 0) {
    const pm = POLICY_ID_RE_IN.exec(q);
    if (pm) {
      const hits = WORKFLOW_GRAPH.byPolicy[pm[1]] ?? [];
      if (hits.length > 0) {
        workflowIds = hits;
        reasons.push(`policy ref ${pm[1]} → ${hits.length} workflow(s)`);
      }
    }
  }

  // 3. Form ref → workflows referencing it.
  if (workflowIds.length === 0) {
    const fm = FORM_ID_RE_IN.exec(q);
    if (fm) {
      const fid = fm[1].toUpperCase();
      const hits = WORKFLOW_GRAPH.byForm[fid] ?? [];
      if (hits.length > 0) {
        workflowIds = hits;
        reasons.push(`form ${fid} → ${hits.length} workflow(s)`);
      }
    }
  }

  // 4. Title / keyword match — scoring-based.
  if (workflowIds.length === 0) {
    workflowIds = titleSearch(q).slice(0, 5);
    if (workflowIds.length > 0) reasons.push(`title match: ${workflowIds[0]}`);
  }

  if (workflowIds.length === 0) return null;

  // 5. Section inference.
  let section: WorkflowSection = 'full';
  for (const cue of SECTION_CUES) {
    if (cue.re.test(q)) { section = cue.section; reasons.push(`section cue → ${cue.section}`); break; }
  }

  // 6. Step hint.
  let stepHint: number | undefined;
  const sm = STEP_RE.exec(q);
  if (sm) stepHint = parseInt(sm[1], 10);

  return { workflowIds, section, stepHint, reason: reasons.join('; ') };
}

/** Simple inverted-keyword title matcher. */
function titleSearch(query: string): string[] {
  const tokens = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2)
    .filter((t) => !/^(the|and|for|are|how|who|what|when|does|this|that|with|from|your|must|will|should)$/.test(t));
  if (tokens.length === 0) return [];

  const scored: Array<{ id: string; score: number }> = [];
  for (const w of WORKFLOW_LIST) {
    const haystack = `${w.title} ${w.processOverview} ${w.roles.primary.join(' ')}`.toLowerCase();
    let score = 0;
    for (const t of tokens) if (haystack.includes(t)) score += haystack === w.title.toLowerCase() ? 3 : 1;
    if (score > 0) scored.push({ id: w.id, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.id);
}

/* ══════════════════════════════════════════════════════════════════
   2. Answer assembly
   ══════════════════════════════════════════════════════════════════ */

export function answerWorkflowQuery(
  query: string,
  runtime?: RuntimeState,
): WorkflowAnswer | null {
  const intent = classifyWorkflowQuery(query);
  if (!intent) return null;

  const workflows = intent.workflowIds
    .map((id) => WORKFLOWS[id])
    .filter((w): w is Workflow => Boolean(w));
  if (workflows.length === 0) return null;

  // Primary = first match. If multiple, we emit a disambiguation header.
  const primary = workflows[0];
  const sections = intent.section === 'full'
    ? (['overview','triggers','roles','inputs','steps','forms','approvals','outputs','sla','escalation','failure','audit'] as WorkflowSection[])
    : [intent.section];

  const parts: string[] = [];
  parts.push(renderHeader(primary));

  if (workflows.length > 1) {
    parts.push(renderDisambiguation(workflows));
  }

  for (const s of sections) {
    parts.push(renderSection(primary, s, intent.stepHint));
  }

  // If a live runtime instance is attached, emit a state-aware block.
  const stateAware = Boolean(runtime?.instanceId);
  if (stateAware && runtime) {
    parts.push(renderRuntimeState(primary, runtime));
  }

  // Cross-reference footer.
  parts.push(renderCrossReferences(primary));

  const citations = workflows.map((w) => ({
    workflowId: w.id,
    sourcePath: w.sourcePath,
    section: intent.section,
  }));

  return {
    intent,
    workflows,
    markdown: parts.filter(Boolean).join('\n\n'),
    citations,
    stateAware,
  };
}

/* ── Renderers (preserve authored order / language verbatim) ────── */

function renderHeader(w: Workflow): string {
  return `### ${w.id} — ${w.title}`;
}

function renderDisambiguation(workflows: Workflow[]): string {
  const list = workflows.slice(0, 5).map((w) => `- **${w.id}** — ${w.title}`).join('\n');
  return `> Multiple workflows matched. Showing **${workflows[0].id}** first. Other candidates:\n${list}`;
}

function renderSection(w: Workflow, section: WorkflowSection, stepHint?: number): string {
  switch (section) {
    case 'overview':
      return `**Process overview**\n\n${w.processOverview}`;
    case 'triggers':
      if (w.triggers.length === 0) return '**Triggers**\n\n_None declared._';
      return `**Triggers**\n\n${w.triggers.map((t) => `- _${t.kind.replace('_','-')}_ — ${t.description}`).join('\n')}`;
    case 'roles':
      return [
        `**Responsible roles**`,
        w.roles.primary.length    ? `- **Primary:** ${w.roles.primary.join(', ')}`         : '',
        w.roles.supporting.length ? `- **Supporting:** ${w.roles.supporting.join(', ')}`   : '',
        w.roles.approval.length   ? `- **Approval:** ${w.roles.approval.join(', ')}`       : '',
      ].filter(Boolean).join('\n');
    case 'inputs':
      if (w.inputs.length === 0) return '**Inputs**\n\n_None declared._';
      return `**Inputs**\n\n${w.inputs.map((i) => `- ${i}`).join('\n')}`;
    case 'steps':
      return renderSteps(w, stepHint);
    case 'forms':
      if (w.requiredForms.length === 0) return '**Required forms**\n\n_None referenced._';
      return `**Required forms**\n\n${w.requiredForms.map((f) => `- **${f}** — ${formTitle(f)}`).join('\n')}`;
    case 'approvals':
      if (w.approvals.length === 0) return '**Approvals**\n\n_None declared._';
      return `**Approvals**\n\n${w.approvals.map((a) => `- ${a.requiresGoverningBody ? '**GB** — ' : ''}${a.description}`).join('\n')}`;
    case 'outputs':
      return `**Outputs**\n\n${w.outputs || '_Not declared._'}`;
    case 'sla':
      return `**SLA / deadlines**\n\n${w.sla || '_Not declared._'}`;
    case 'escalation':
      return `**Escalation logic**\n\n${w.escalationLogic || '_Not declared._'}`;
    case 'failure':
      return `**Failure conditions**\n\n${w.failureConditions || '_Not declared._'}`;
    case 'audit':
      return `**Audit requirements**\n\n${w.auditRequirements || '_Not declared._'}`;
    case 'full':
      // Handled upstream by expanding into all sections.
      return '';
  }
}

function renderSteps(w: Workflow, stepHint?: number): string {
  if (w.steps.length === 0) return '**Step-by-step execution**\n\n_Step table not authored for this workflow._';
  if (stepHint !== undefined) {
    const s = w.steps.find((x) => x.order === stepHint);
    if (s) return renderSingleStep(s);
    return `**Step ${stepHint}**\n\n_Not authored. This workflow has ${w.steps.length} step(s)._`;
  }
  const rows = w.steps.map((s) =>
    `${String(s.order).padStart(2, ' ')}. **${s.action}**\n   _Role:_ ${s.role} · _Form:_ ${s.formIds.join(', ') || s.formRaw || '—'} · _Deadline:_ ${s.deadline || '—'}`,
  ).join('\n');
  return `**Step-by-step execution** _(authored order preserved)_\n\n${rows}`;
}

function renderSingleStep(s: WorkflowStep): string {
  return [
    `**Step ${s.order}**`,
    '',
    s.action,
    '',
    `- **Role:** ${s.role || '—'}`,
    `- **Forms:** ${s.formIds.length ? s.formIds.map((f) => `${f} — ${formTitle(f)}`).join('; ') : (s.formRaw || '—')}`,
    `- **Deadline:** ${s.deadline || '—'}`,
  ].join('\n');
}

function renderRuntimeState(w: Workflow, runtime: RuntimeState): string {
  const lines: string[] = ['**Live status for this instance**'];
  const current = runtime.currentStep ?? 0;
  if (current > 0 && current <= w.steps.length) {
    const cur = w.steps[current - 1];
    lines.push(`- **Current step:** ${cur.order}. ${cur.action} _(role: ${cur.role})_`);
  } else {
    lines.push('- **Current step:** _Not started._');
  }
  const next = current < w.steps.length ? w.steps[current] : null;
  if (next) lines.push(`- **Next step:** ${next.order}. ${next.action} _(due: ${next.deadline || '—'})_`);
  else if (current >= w.steps.length && w.steps.length > 0) lines.push('- **Next step:** _All authored steps complete._');
  if (runtime.missingForms?.length) lines.push(`- **Missing forms:** ${runtime.missingForms.join(', ')}`);
  if (runtime.pendingApprovals?.length) lines.push(`- **Pending approvals:** ${runtime.pendingApprovals.join('; ')}`);
  if (runtime.overdue) lines.push('- **Status:** OVERDUE — escalation path applies (see §11).');
  if (runtime.slaDaysPastDue && runtime.slaDaysPastDue > 0) lines.push(`- **SLA:** ${runtime.slaDaysPastDue} day(s) past due.`);
  if (runtime.risk) lines.push(`- **Risk:** ${runtime.risk}`);
  if (runtime.auditState) {
    const label: Record<NonNullable<RuntimeState['auditState']>, string> = {
      'audit-ready':               'Audit Ready — eligible for certification.',
      'complete-missing-evidence': 'Complete but missing evidence — cannot certify.',
      'complete-pending-approval': 'Complete but pending approval — cannot certify.',
      'in-progress':               'In progress — execution underway.',
      'blocked':                   'Blocked — upstream dependency or hard blocker.',
      'overdue':                   'Overdue — past due date, not yet complete.',
      'not-certifiable':           'Not certifiable — validation regressed.',
      'certified-locked':          'Certified & locked — immutable record.',
    };
    lines.push(`- **Audit state:** ${label[runtime.auditState]}`);
  }
  if (runtime.isCertified) lines.push('- **Certification:** Record sealed. Changes require administrative revoke.');
  else if (runtime.readyForCertification) lines.push('- **Certification:** Ready — all checklist items pass.');
  else if (runtime.certificationBlockers?.length) {
    lines.push(`- **Cannot certify — blockers:**`);
    for (const b of runtime.certificationBlockers) lines.push(`  - ${b}`);
  }
  return lines.join('\n');
}

function renderCrossReferences(w: Workflow): string {
  const downstream = WORKFLOW_GRAPH.downstream[w.id] ?? [];
  const parts: string[] = [];
  if (w.policyRefs.length) parts.push(`_Policies:_ ${w.policyRefs.join(', ')}`);
  if (w.regulatoryAnchors.length) parts.push(`_Regulatory:_ ${w.regulatoryAnchors.join(' · ')}`);
  if (downstream.length) parts.push(`_Downstream workflows:_ ${downstream.slice(0, 5).join(', ')}${downstream.length > 5 ? ` (+${downstream.length - 5})` : ''}`);
  parts.push(`_Source:_ ${w.sourcePath}`);
  return parts.length > 0 ? `---\n\n${parts.join('  \n')}` : '';
}

/* ══════════════════════════════════════════════════════════════════
   3. Utility surfaces for the Brad UI and server.
   ══════════════════════════════════════════════════════════════════ */

/** Quick lookup by any of: workflow ID, policy ID, form ID, role, regulation. */
export function lookupWorkflows(key: string): Workflow[] {
  const ids = new Set<string>();
  const upper = key.toUpperCase().trim();
  if (WORKFLOWS[upper]) ids.add(upper);
  for (const id of WORKFLOW_GRAPH.byPolicy[upper] ?? []) ids.add(id);
  for (const id of WORKFLOW_GRAPH.byForm[upper] ?? []) ids.add(id);
  for (const id of WORKFLOW_GRAPH.byRegulation[upper] ?? []) ids.add(id);
  for (const id of WORKFLOW_GRAPH.byRole[key] ?? []) ids.add(id);
  return Array.from(ids).map((id) => WORKFLOWS[id]).filter(Boolean);
}

/** Returns true if Brad should route this query through the workflow service. */
export function isWorkflowQuery(query: string): boolean {
  return classifyWorkflowQuery(query) !== null;
}

export function renderWorkflowAnswer(a: WorkflowAnswer): string {
  return a.markdown;
}
