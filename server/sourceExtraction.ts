import { spawn, type StdioOptions } from 'node:child_process';
import { log } from './logger.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Source extraction — BRAD's reading step. Brand/naming: user-facing this is
   always "Brad". The underlying inference engine is the Claude CLI; "Claude"
   appears only in the technical engine plumbing below (binary, env, PHI note),
   never in anything surfaced to the user (engine id is reported as 'brad').

   Reads the EXTRACTED source text (see pdfText.ts) and maps it to a packet's
   required fields. Per the verification-first spec:
     • read the source 3× (independent passes),
     • reconcile by agreement + confidence,
     • NEVER invent — missing/uncertain fields are returned for user review,
     • every value carries a verbatim source snippet (source→field mapping).

   PHI boundary: the Claude CLI reaches the Anthropic API (no BAA), so this path
   is for NON-PHI mock/training data only. Gated by BRAD_PROVIDER==='claude' and
   the caller's mock context, mirroring ClaudeCliBradAdapter.
   ═══════════════════════════════════════════════════════════════════════════ */

const CLAUDE_BIN = process.env.BRAD_CLAUDE_BIN || 'claude';
const USE_SHELL = process.platform === 'win32';
const MODEL_ID = process.env.BRAD_CLAUDE_MODEL || 'claude-opus-4-8';
const READ_PASSES = 3;

function spawnClaude(args: string[], stdio: StdioOptions) {
  return spawn(CLAUDE_BIN, args, { stdio, shell: USE_SHELL });
}

export async function claudeAvailable(): Promise<boolean> {
  if ((process.env.BRAD_PROVIDER || '') !== 'claude') return false;
  return new Promise((resolve) => {
    try {
      const p = spawnClaude(['--version'], ['ignore', 'pipe', 'ignore']);
      const t = setTimeout(() => { p.kill(); resolve(false); }, 8000);
      p.on('error', () => { clearTimeout(t); resolve(false); });
      p.on('close', (code) => { clearTimeout(t); resolve(code === 0); });
    } catch { resolve(false); }
  });
}

/** One Claude CLI call; prompt on STDIN (no shell-injection surface). */
function runClaude(system: string, user: string, timeoutMs = 120_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawnClaude(['--model', MODEL_ID, '--print'], ['pipe', 'pipe', 'pipe']);
    let out = '', err = '';
    const t = setTimeout(() => { p.kill(); reject(new Error('claude CLI timed out')); }, timeoutMs);
    p.stdout?.on('data', (d) => { out += d.toString(); });
    p.stderr?.on('data', (d) => { err += d.toString(); });
    p.on('error', (e) => { clearTimeout(t); reject(e); });
    p.on('close', (code) => {
      clearTimeout(t);
      if (code === 0) resolve(out.trim());
      else reject(new Error(`claude CLI exit ${code}: ${err.slice(0, 200)}`));
    });
    p.stdin?.write(`${system}\n\n${user}`);
    p.stdin?.end();
  });
}

/** Pull the first JSON object/array out of a model response (handles ```json fences). */
export function parseJsonLoose<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenced ? fenced[1] : text;
  const start = body.search(/[[{]/);
  if (start < 0) return null;
  for (let end = body.length; end > start; end--) {
    const slice = body.slice(start, end);
    if (!/[\]}]$/.test(slice.trim())) continue;
    try { return JSON.parse(slice.trim()) as T; } catch { /* keep shrinking */ }
  }
  return null;
}

export interface FieldSpec { key: string; label: string; hint?: string; group?: string }

export interface FieldCandidate {
  key: string;
  value: string | null;
  confidence: number;       // 0..1
  sourceSnippet: string;    // verbatim evidence from the source (empty if none)
}
export interface ReconciledField extends FieldCandidate {
  agreement: number;        // how many of the READ_PASSES agreed (0..READ_PASSES)
  needsReview: boolean;     // true when missing / low-confidence / conflicting
  group?: string;           // review-UI section grouping (e.g. 'Patient', 'Payer / Billing Route')
  label?: string;           // human label from the spec (for grouped review)
}
export interface SourceExtractionResult {
  engine: 'brad' | 'unavailable';  // 'brad' = Brad's reader (Claude CLI engine internally)
  passes: number;
  fields: ReconciledField[];
  missing: string[];          // field keys with no confident value
  mapping: { key: string; sourceSnippet: string }[]; // source→field evidence
  conflicts: { key: string; values: string[] }[];
  validationSummary: string;
}

const SYSTEM = [
  'You are a clinical evidence extraction agent for a home-health compliance app.',
  'Extract ONLY values explicitly present in the SOURCE text. NEVER guess, infer, or fabricate.',
  'If a field is not clearly stated in the source, return value:null.',
  'For every non-null value include a short VERBATIM snippet copied from the source as evidence.',
  'Return STRICT JSON only — no prose, no markdown fences.',
].join(' ');

function buildUserPrompt(fields: FieldSpec[], sourceText: string, formFields: Record<string, string>): string {
  // Structured admission field schema grouped by section — NOT a generic
  // "find patient details" prompt. Each field is listed under its packet section
  // so the model extracts against a known schema.
  const byGroup = new Map<string, FieldSpec[]>();
  for (const f of fields) { const g = f.group || 'Other'; (byGroup.get(g) || byGroup.set(g, []).get(g)!).push(f); }
  const fieldList = [...byGroup.entries()].map(([group, gf]) =>
    `[${group}]\n` + gf.map((f) => `  - ${f.key}: ${f.label}${f.hint ? ` (${f.hint})` : ''}`).join('\n'),
  ).join('\n');
  const form = Object.keys(formFields).length ? `\nPRE-FILLED FORM FIELDS (authoritative when present):\n${JSON.stringify(formFields)}\n` : '';
  // Cap source text so the prompt stays well within limits; extraction targets
  // demographics/admin fields which appear early, plus we include the form fields.
  const clipped = sourceText.length > 24_000 ? sourceText.slice(0, 24_000) + '\n…[truncated]' : sourceText;
  return [
    `Extract these fields, organized by admission-packet section:\n${fieldList}`,
    form,
    'SOURCE:\n"""',
    clipped,
    '"""',
    'Respond with JSON: {"fields":[{"key","value","confidence","sourceSnippet"}]}.',
    'value is a string or null. confidence is 0..1. sourceSnippet is verbatim from SOURCE (or "").',
  ].join('\n');
}

const norm = (v: string | null) => (v ?? '').trim().toLowerCase();

/** Reconcile READ_PASSES candidate sets by agreement + confidence. */
function reconcile(fields: FieldSpec[], passes: FieldCandidate[][]): SourceExtractionResult {
  const reconciled: ReconciledField[] = [];
  const conflicts: { key: string; values: string[] }[] = [];
  for (const spec of fields) {
    const cands = passes.map((p) => p.find((c) => c.key === spec.key)).filter(Boolean) as FieldCandidate[];
    const nonNull = cands.filter((c) => norm(c.value) !== '');
    // Tally values by normalized equality.
    const tally = new Map<string, { value: string; count: number; conf: number; snippet: string }>();
    for (const c of nonNull) {
      const k = norm(c.value);
      const cur = tally.get(k);
      if (cur) { cur.count++; cur.conf = Math.max(cur.conf, c.confidence); if (!cur.snippet) cur.snippet = c.sourceSnippet; }
      else tally.set(k, { value: c.value as string, count: 1, conf: c.confidence, snippet: c.sourceSnippet || '' });
    }
    const ranked = [...tally.values()].sort((a, b) => b.count - a.count || b.conf - a.conf);
    const top = ranked[0];
    const distinct = ranked.length;
    if (distinct > 1) conflicts.push({ key: spec.key, values: ranked.map((r) => r.value) });
    const agreement = top?.count ?? 0;
    // Confident when a majority of passes agree on the same value.
    const needsReview = !top || agreement < Math.ceil(READ_PASSES / 2) || (top.conf < 0.5);
    reconciled.push({
      key: spec.key,
      value: top ? top.value : null,
      confidence: top ? top.conf : 0,
      sourceSnippet: top ? top.snippet : '',
      agreement,
      needsReview,
      group: spec.group,
      label: spec.label,
    });
  }
  const missing = reconciled.filter((f) => !f.value || f.needsReview).map((f) => f.key);
  const mapping = reconciled.filter((f) => f.value && f.sourceSnippet).map((f) => ({ key: f.key, sourceSnippet: f.sourceSnippet }));
  const filled = reconciled.filter((f) => f.value && !f.needsReview).length;
  const validationSummary = `${filled}/${fields.length} fields filled with majority agreement across ${READ_PASSES} reads; ${missing.length} need review; ${conflicts.length} conflicts.`;
  return { engine: 'brad', passes: READ_PASSES, fields: reconciled, missing, mapping, conflicts, validationSummary };
}

/** Read the source 3× via Brad and reconcile into a field map (no invention). */
export async function extractFieldsFromSource(
  fields: FieldSpec[], sourceText: string, formFields: Record<string, string> = {},
): Promise<SourceExtractionResult> {
  if (!(await claudeAvailable())) {
    // Degraded fallback: surface ONLY authoritative pre-filled form values,
    // matching keys like "cover.patient_name" to the spec key "patient_name".
    const formVal = (key: string): string | null => {
      if (formFields[key]) return formFields[key];
      const hit = Object.keys(formFields).find((k) => k.split('.').pop() === key);
      return hit ? formFields[hit] : null;
    };
    return {
      engine: 'unavailable', passes: 0,
      fields: fields.map((f) => { const v = formVal(f.key); return { key: f.key, value: v, confidence: v ? 0.5 : 0, sourceSnippet: v ? '(pre-filled form field)' : '', agreement: 0, needsReview: !v, group: f.group, label: f.label }; }),
      missing: fields.filter((f) => !formVal(f.key)).map((f) => f.key),
      mapping: [],
      conflicts: [],
      validationSummary: 'Brad’s automated reading is offline. Only pre-filled form fields were used; nothing was invented.',
    };
  }
  const user = buildUserPrompt(fields, sourceText, formFields);
  // Run the 3 reads in PARALLEL — they are independent cross-checks, so wall time
  // is ~one pass (not 3×). 90s/pass cap keeps the whole call under the client ceiling.
  const raws = await Promise.all(
    Array.from({ length: READ_PASSES }, (_, i) =>
      runClaude(SYSTEM, user, 90_000).catch((e) => {
        log.warn('sourceExtraction.pass.failed', { pass: i + 1, error: e instanceof Error ? e.message : String(e) });
        return null;
      }),
    ),
  );
  const passes: FieldCandidate[][] = [];
  for (const raw of raws) {
    if (!raw) continue;
    const parsed = parseJsonLoose<{ fields?: FieldCandidate[] }>(raw);
    if (parsed?.fields) passes.push(parsed.fields.map((c) => ({ key: String(c.key), value: c.value ?? null, confidence: Number(c.confidence) || 0, sourceSnippet: String(c.sourceSnippet ?? '') })));
  }
  if (!passes.length) {
    return {
      engine: 'brad', passes: 0, fields: fields.map((f) => ({ key: f.key, value: null, confidence: 0, sourceSnippet: '', agreement: 0, needsReview: true, group: f.group, label: f.label })),
      missing: fields.map((f) => f.key), mapping: [], conflicts: [],
      validationSummary: 'All read passes failed to return parseable JSON; no fields extracted (nothing invented).',
    };
  }
  return reconcile(fields, passes);
}
