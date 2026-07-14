import { spawn, type StdioOptions } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { randomUUID } from 'node:crypto';
import { log } from './logger.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Source extraction — BRAD's reading step. Brand/naming: user-facing this is
   always "Brad". The underlying inference engine is provider-selected
   server-side plumbing (Codex CLI primary, Claude CLI backup), never surfaced
   as a packet author (engine id is reported as 'brad').

   Reads the EXTRACTED source text (see pdfText.ts) and maps it to a packet's
   required fields. Per the verification-first spec:
     • read the source 3× (independent passes),
     • reconcile by agreement + confidence,
     • NEVER invent — missing/uncertain fields are returned for user review,
     • every value carries a verbatim source snippet (source→field mapping).

   PHI boundary: live CLI providers are for NON-PHI mock/training data only.
   Production PHI remains gated to an approved in-perimeter provider.
   ═══════════════════════════════════════════════════════════════════════════ */

const CLAUDE_BIN = process.env.BRAD_CLAUDE_BIN || 'claude';
const CODEX_BIN = process.env.BRAD_CODEX_BIN || 'codex';
const USE_SHELL = process.platform === 'win32';
const CLAUDE_MODEL_ID = process.env.BRAD_CLAUDE_MODEL || 'claude-opus-4-8';
const CODEX_MODEL_ID = process.env.BRAD_CODEX_MODEL || process.env.BRAD_MODEL_ID || 'gpt-5.5';
const CODEX_REASONING_EFFORT = process.env.BRAD_CODEX_REASONING_EFFORT || 'xhigh';
const READ_PASSES = 3;
const PASS_TIMEOUT_MS = Number(process.env.BRAD_CLAUDE_TIMEOUT_MS ?? 240_000);
const SOURCE_CHAR_LIMIT = Number(process.env.BRAD_SOURCE_CHAR_LIMIT ?? 120_000);
const QAPI_MASTER_PROMPT_PATH = process.env.BRAD_QAPI_MASTER_PROMPT_PATH
  || path.join(os.homedir(), 'Documents', 'BRAD_QAPI_QUARTERLY_PACKET_MASTER_PROMPT.md');

export type BradReaderLogic = 'claude' | 'gpt' | 'qapi-master-claude' | 'qapi-raw-claude';

function spawnClaude(args: string[], stdio: StdioOptions) {
  return spawn(CLAUDE_BIN, args, { stdio, shell: USE_SHELL });
}

function spawnCodex(args: string[], stdio: StdioOptions) {
  return spawn(CODEX_BIN, args, { stdio, shell: USE_SHELL });
}

export async function claudeAvailable(): Promise<boolean> {
  if ((process.env.BRAD_PROVIDER || '') !== 'claude') return false;
  return claudeCliAvailable();
}

async function claudeCliAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const p = spawnClaude(['--version'], ['ignore', 'pipe', 'ignore']);
      const t = setTimeout(() => { p.kill(); resolve(false); }, 8000);
      p.on('error', () => { clearTimeout(t); resolve(false); });
      p.on('close', (code) => { clearTimeout(t); resolve(code === 0); });
    } catch { resolve(false); }
  });
}

async function codexCliAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const p = spawnCodex(['login', 'status'], ['ignore', 'pipe', 'ignore']);
      let out = '', err = '';
      const t = setTimeout(() => { p.kill(); resolve(false); }, 8000);
      p.stdout?.on('data', (d) => { out += d.toString(); });
      p.stderr?.on('data', (d) => { err += d.toString(); });
      p.on('error', () => { clearTimeout(t); resolve(false); });
      p.on('close', (code) => { clearTimeout(t); resolve(code === 0 && /Logged in/i.test(`${out}\n${err}`)); });
    } catch { resolve(false); }
  });
}

async function codexAvailable(): Promise<boolean> {
  if ((process.env.BRAD_PROVIDER || '') !== 'codex') return false;
  return codexCliAvailable();
}

export async function bradReaderAvailable(logic?: BradReaderLogic): Promise<boolean> {
  if (logic === 'claude') return (await claudeCliAvailable()) || (await codexCliAvailable());
  if (logic === 'gpt') return (await codexCliAvailable()) || (await claudeCliAvailable());
  if (logic === 'qapi-master-claude' || logic === 'qapi-raw-claude') return claudeCliAvailable();
  if (await codexAvailable()) return true;
  if (process.env.BRAD_CLAUDE_MODEL && await claudeCliAvailable()) return true;
  return false;
}

/** One Claude CLI call; prompt on STDIN (no shell-injection surface). */
function runClaude(system: string, user: string, timeoutMs = 120_000): Promise<string> {
  return new Promise((resolve, reject) => {
    const p = spawnClaude(['--model', CLAUDE_MODEL_ID, '--print', '--system-prompt', system], ['pipe', 'pipe', 'pipe']);
    let out = '', err = '';
    const t = setTimeout(() => { p.kill(); reject(new Error(`claude CLI timed out after ${Math.round(timeoutMs / 1000)}s`)); }, timeoutMs);
    p.stdout?.on('data', (d) => { out += d.toString(); });
    p.stderr?.on('data', (d) => { err += d.toString(); });
    p.on('error', (e) => { clearTimeout(t); reject(e); });
    p.on('close', (code) => {
      clearTimeout(t);
      if (code === 0) resolve(out.trim());
      else reject(new Error(`claude CLI exit ${code}: ${err.slice(0, 200)}`));
    });
    p.stdin?.write(user);
    p.stdin?.end();
  });
}

/** One Codex CLI call through the user's ChatGPT subscription. */
function runCodex(system: string, user: string, timeoutMs = 120_000): Promise<string> {
  const prompt = `${system}\n\n${user}`;
  const outputPath = path.join(os.tmpdir(), `brad-source-review-${randomUUID()}.txt`);
  return new Promise((resolve, reject) => {
    const p = spawnCodex([
      'exec',
      '--model', CODEX_MODEL_ID,
      '-c', `model_reasoning_effort="${CODEX_REASONING_EFFORT}"`,
      '--sandbox', 'read-only',
      '--ask-for-approval', 'never',
      '--ephemeral',
      '--ignore-rules',
      '--output-last-message', outputPath,
      '-',
    ], ['pipe', 'pipe', 'pipe']);
    let out = '', err = '';
    const cleanup = () => {
      try { fs.rmSync(outputPath, { force: true }); } catch { /* best effort */ }
    };
    const t = setTimeout(() => { p.kill(); cleanup(); reject(new Error(`codex CLI timed out after ${Math.round(timeoutMs / 1000)}s`)); }, timeoutMs);
    p.stdout?.on('data', (d) => { out += d.toString(); });
    p.stderr?.on('data', (d) => { err += d.toString(); });
    p.on('error', (e) => { clearTimeout(t); cleanup(); reject(e); });
    p.on('close', (code) => {
      clearTimeout(t);
      try {
        if (code === 0) {
          const finalMessage = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, 'utf8').trim() : '';
          resolve(finalMessage || out.trim());
        } else {
          reject(new Error(`codex CLI exit ${code}: ${err.slice(0, 200)}`));
        }
      } finally {
        cleanup();
      }
    });
    p.stdin?.write(prompt);
    p.stdin?.end();
  });
}

async function runBradRead(system: string, user: string, timeoutMs: number, logic?: BradReaderLogic): Promise<string> {
  if (logic === 'qapi-master-claude' || logic === 'qapi-raw-claude') {
    if (await claudeCliAvailable()) return runClaude(system, user, timeoutMs);
    throw new Error('Brad reader unavailable');
  }
  if (logic === 'claude') {
    if (await claudeCliAvailable()) return runClaude(system, user, timeoutMs);
    if (await codexCliAvailable()) return runCodex(system, user, timeoutMs);
    throw new Error('Brad reader unavailable');
  }
  if (logic === 'gpt') {
    if (await codexCliAvailable()) return runCodex(system, user, timeoutMs);
    if (await claudeCliAvailable()) return runClaude(system, user, timeoutMs);
    throw new Error('Brad reader unavailable');
  }
  if (await codexAvailable()) {
    return runCodex(system, user, timeoutMs);
  }
  if (await claudeCliAvailable()) {
    return runClaude(system, user, timeoutMs);
  }
  throw new Error('Brad reader unavailable');
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
  'For count fields, return only the explicit count stated by the source. Never convert record IDs, patient IDs, form IDs, or dates into counts.',
  'For QAPI packets, treat PIP trigger count, PIP source-record count, ED-without-hospitalization count, policy references, action items, and Part A narrative as critical accuracy fields.',
  'Work in exactly three review intents: 1) find missing values and verify accuracy, 2) identify source-backed narrative material for Part A, 3) preserve clean professional presentation without truncating source meaning.',
  'Return STRICT JSON only — no prose, no markdown fences.',
].join(' ');

function systemPromptForLogic(logic?: BradReaderLogic): string {
  if (logic === 'qapi-raw-claude') return 'You are Brad. Follow the user message exactly.';
  if (logic !== 'qapi-master-claude') return SYSTEM;
  return 'You are Brad running the Quarterly QAPI packet master prompt supplied in the user message. Follow that prompt and the supplied PDF design template exactly.';
}

function isQapiPromptOnlyLogic(logic?: BradReaderLogic): boolean {
  return logic === 'qapi-master-claude' || logic === 'qapi-raw-claude';
}

function buildUserPrompt(
  fields: FieldSpec[],
  sourceText: string,
  formFields: Record<string, string>,
  logic?: BradReaderLogic,
): string {
  // Structured admission field schema grouped by section — NOT a generic
  // "find patient details" prompt. Each field is listed under its packet section
  // so the model extracts against a known schema.
  const byGroup = new Map<string, FieldSpec[]>();
  for (const f of fields) { const g = f.group || 'Other'; (byGroup.get(g) || byGroup.set(g, []).get(g)!).push(f); }
  const fieldList = [...byGroup.entries()].map(([group, gf]) =>
    `[${group}]\n` + gf.map((f) => `  - ${f.key}: ${f.label}${f.hint ? ` (${f.hint})` : ''}`).join('\n'),
  ).join('\n');
  const form = Object.keys(formFields).length ? `\nPRE-FILLED FORM FIELDS (authoritative when present):\n${JSON.stringify(formFields)}\n` : '';
  if (sourceText.length > SOURCE_CHAR_LIMIT) {
    throw new Error(`source text is ${sourceText.length.toLocaleString()} characters; Brad source reading limit is ${SOURCE_CHAR_LIMIT.toLocaleString()} characters. Split the dump or raise BRAD_SOURCE_CHAR_LIMIT so source meaning is not silently truncated.`);
  }
  if (logic === 'qapi-raw-claude') {
    return [
      readQapiMasterPrompt(),
      '',
      sourceText,
    ].join('\n');
  }
  if (logic === 'qapi-master-claude') {
    return [
      'QUARTERLY QAPI MASTER PROMPT',
      readQapiMasterPrompt(),
      '',
      'PDF DESIGN TEMPLATE — VISUAL AUTHORITY ONLY',
      QAPI_PDF_DESIGN_TEMPLATE,
      '',
      'SELECTED EVENT AND SOURCE BUNDLE',
      'The source bundle begins with Packet Studio selected-event context when available.',
      'Use the master prompt above. Do not use any other harness instructions.',
      '',
      'SOURCE BUNDLE:',
      '"""',
      sourceText,
      '"""',
    ].join('\n');
  }
  const basePrompt = [
    'Run this as a three-intent review:',
    '1. Missing and accuracy: recover explicit values and mark absent/uncertain fields null.',
    '2. Part A expansion: prefer complete source-backed facts, record families, decisions, risks, and limitations that can support narrative analysis later.',
    '3. Presentation readiness: keep every value concise, readable, and evidence-linked; do not summarize away material distinctions.',
    'For QAPI counts, use integer counts only when the source explicitly gives the count or a clearly bounded source-record list. Do not use patient IDs such as MOCK-PT-0033 as counts.',
    'For QAPI Part A, produce narrative-ready facts and decisions from the document itself; keep limitations/unknowns visible instead of smoothing them away.',
    `Extract these fields, organized by packet section:\n${fieldList}`,
    form,
    'SOURCE:\n"""',
    sourceText,
    '"""',
    'Respond with JSON: {"fields":[{"key","value","confidence","sourceSnippet"}]}.',
    'value is a string or null. confidence is 0..1. sourceSnippet is verbatim from SOURCE (or "").',
  ].join('\n');
  return basePrompt;
}

const QAPI_PDF_DESIGN_TEMPLATE = [
  'Use the Care Indeed packet PDF shell as the visual system: clean white pages, teal/orange accents, Roboto Light header/footer treatment, restrained status badges, thin rules, compact source references, and professional table hierarchy.',
  'Every major section and subsection starts on a new page. Wide evidence tables may use US Letter landscape pages; narrative and cover/control pages remain portrait.',
  'Headers/footers must not show browser URL, about:blank, timestamps, debug text, or duplicate generated headers. Use logo placement on each page through the packet renderer.',
  'No giant diagonal watermarks. Synthetic/UAT status remains visible but must not obscure data, signatures, tables, or narrative.',
  'No clipped, truncated, overlapping, or horizontally scrolling content. Repeat table headers on continuation pages and keep record IDs/dates readable.',
].join('\n');

function readQapiMasterPrompt(): string {
  try {
    if (fs.existsSync(QAPI_MASTER_PROMPT_PATH)) {
      return fs.readFileSync(QAPI_MASTER_PROMPT_PATH, 'utf8');
    }
  } catch {
    // Fall through to the compact built-in guard if the local prompt file is not readable.
  }
  return [
    'Quarterly QAPI master rules: read the selected event-bound source directly, isolate the selected quarter, do not invent values, do not turn unknowns into zero, keep Part B as factual authority, derive Part A only from reconciled evidence, separate PIP triggers/CAPs/RCAs/action items/signatures, and never label a draft or blocked packet as final.',
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
  logic?: BradReaderLogic,
): Promise<SourceExtractionResult> {
  if (!(await bradReaderAvailable(logic))) {
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
  const system = systemPromptForLogic(logic);
  const user = buildUserPrompt(fields, sourceText, formFields, logic);
  if (isQapiPromptOnlyLogic(logic)) {
    try {
      await runBradRead(system, user, PASS_TIMEOUT_MS, logic);
      return {
        engine: 'brad',
        passes: 1,
        fields: fields.map((f) => ({
          key: f.key,
          value: null,
          confidence: 0,
          sourceSnippet: '',
          agreement: 0,
          needsReview: true,
          group: f.group,
          label: f.label,
        })),
        missing: fields.map((f) => f.key),
        mapping: [],
        conflicts: [],
        validationSummary: logic === 'qapi-raw-claude'
          ? 'Brad Logic D received the QAPI master prompt exactly as written plus the selected event/source bundle; Packet Studio will render from the selected source bundle without using extraction-harness fields.'
          : 'Brad Logic C received the QAPI master prompt and PDF design template; Packet Studio will render from the selected source bundle without using extraction-harness fields.',
      };
    } catch (e) {
      const error = e instanceof Error ? e.message : String(e);
      log.warn(logic === 'qapi-raw-claude' ? 'sourceExtraction.logicD.failed' : 'sourceExtraction.logicC.failed', { error });
      const logicLabel = logic === 'qapi-raw-claude' ? 'Logic D' : 'Logic C';
      return {
        engine: 'brad',
        passes: 0,
        fields: fields.map((f) => ({
          key: f.key,
          value: null,
          confidence: 0,
          sourceSnippet: '',
          agreement: 0,
          needsReview: true,
          group: f.group,
          label: f.label,
        })),
        missing: fields.map((f) => f.key),
        mapping: [],
        conflicts: [],
        validationSummary: `Brad ${logicLabel} prompt read did not complete (${error}); Packet Studio will use the selected-source parser fallback without invented values.`,
      };
    }
  }
  // Run the 3 reads in PARALLEL — they are independent cross-checks, so wall time
  // is ~one pass (not 3×). Opus can need several minutes on long QAPI dumps.
  const failedReads: string[] = [];
  const raws = await Promise.all(
    Array.from({ length: READ_PASSES }, (_, i) =>
      runBradRead(system, user, PASS_TIMEOUT_MS, logic).catch((e) => {
        const error = e instanceof Error ? e.message : String(e);
        failedReads.push(error);
        log.warn('sourceExtraction.pass.failed', { pass: i + 1, error });
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
    const timedOut = failedReads.some((error) => /timed out/i.test(error));
    return {
      engine: 'brad', passes: 0, fields: fields.map((f) => ({ key: f.key, value: null, confidence: 0, sourceSnippet: '', agreement: 0, needsReview: true, group: f.group, label: f.label })),
      missing: fields.map((f) => f.key), mapping: [], conflicts: [],
      validationSummary: timedOut
        ? `Brad’s source read timed out after ${Math.round(PASS_TIMEOUT_MS / 1000)} seconds before a parseable extraction was returned; no fields were invented.`
        : 'All read passes failed to return parseable JSON; no fields extracted (nothing invented).',
    };
  }
  return reconcile(fields, passes);
}
