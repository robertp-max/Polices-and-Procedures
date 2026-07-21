/* ─────────────────────────────────────────────────────────────────────────
   Brad Scenario Safety-Routing Verifier
   ---------------------------------------------------------------------------
   Retargeted (2026-07) to the CANONICAL production path. The previous version
   imported src/policy/pages/iAdministrator/lib/{classifyScenario,
   complianceActionMap} — an "action layer" subsystem that has since been
   removed from this branch (the whole iAdministrator/lib directory is gone),
   so the verifier failed at module resolution before running a single check.

   The live scenario/safety path the application actually uses is:
     classifyScenario()      server/ia/scenarioClassifier.ts   (ScenarioMapping)
     routeCriticalIncident() server/ia/brad/criticalIncidentRouter.ts
     composeInternalBradAnswer() server/ia/brad/bradInternalResponder.ts
     composeNolanTutorAnswer()   server/ia/nolan/nolanTutorResponder.ts

   This verifier exercises that path across immediate-danger, clinical-emergency,
   worker-safety, false-positive-guard, and non-emergency scenarios and asserts
   the safety contract: danger outranks catalog/module search, worker safety is
   handled urgently, emergency guidance carries no PHI, false positives do not
   escalate, and Brad's response contract stays intact.
   ───────────────────────────────────────────────────────────────────────── */

import { classifyScenario } from '../server/ia/scenarioClassifier';
import { routeCriticalIncident } from '../server/ia/brad/criticalIncidentRouter';
import { composeInternalBradAnswer } from '../server/ia/brad/bradInternalResponder';
import { composeNolanTutorAnswer } from '../server/ia/nolan/nolanTutorResponder';

type Check = { name: string; ok: boolean; detail?: string };
const checks: Check[] = [];
const add = (name: string, ok: boolean, detail?: string) => checks.push({ name, ok, detail });

const IMMEDIATE_DANGER = [
  'help my client got shot', 'shots fired outside the home', 'someone stabbed the nurse',
  'there is a person with a gun', 'drive-by shooting',
];
const CLINICAL_EMERGENCY = [
  'patient is not breathing', 'patient has crushing chest pain', 'patient is unresponsive',
  'possible stroke symptoms',
];
const WORKER_SAFETY = [
  'a nurse was attacked', 'the caregiver is being threatened',
  'the worker is injured and the patient is still inside',
];
const FALSE_POSITIVE_GUARDS = [
  'flu shot', 'shooting pain down the leg', 'stabbing pain in the back', 'photo shoot', 'knife-like pain',
];
const NON_EMERGENCY = [
  'patient wants to reschedule', 'caregiver has a routine documentation question', 'employee asks about training',
];

/** Life-safety tracks that must lead with 911 / safety guidance. */
const URGENT_TRACKS = new Set(['IMMEDIATE_DANGER', 'SERIOUS_INJURY', 'DEATH_OR_UNRESPONSIVE', 'CLINICAL_EMERGENCY', 'UNSAFE_ENVIRONMENT', 'SUSPECTED_MISTREATMENT']);
/** PHI / identifier patterns that must never appear in a canned safety reply. */
const PHI_PATTERNS = [/\b\d{3}-\d{2}-\d{4}\b/, /\b\d{10,}\b/, /[\w.+-]+@[\w-]+\.[\w.-]+/, /\bMRN[:#]?\s*\d+/i];
/** Attestation/acknowledgment wording is banned everywhere (state-write separation). */
const FORBIDDEN_WORDING = /\b(attest\w*|acknowledg\w*|signed[- ]off|sign[- ]off|certif\w*)\b/i;

const hasPHI = (t: string) => PHI_PATTERNS.some((re) => re.test(t));

// ── Canonical classifier is reachable and returns a category ───────────────
{
  const m = classifyScenario('help my client got shot');
  add('canonical classifyScenario() reachable + returns a category',
    !!m && typeof m.category === 'string' && m.category.length > 0,
    m ? `category=${m.category} life=${m.lifeSafetyFlag}` : 'null');
}

// ── Immediate danger: urgent, never a catalog/module search ────────────────
for (const q of IMMEDIATE_DANGER) {
  const r = routeCriticalIncident(q);
  const b = composeInternalBradAnswer(q);
  const n = composeNolanTutorAnswer(q);
  add(`[danger] "${q}" → IMMEDIATE_DANGER + urgent`, r.track === 'IMMEDIATE_DANGER' && r.urgent, `track=${r.track} urgent=${r.urgent}`);
  add(`[danger] "${q}" outranks catalog search (Brad matched, not fallback, names 911)`,
    b.matched && b.diagnostics.path !== 'fallback' && /911/.test(b.text),
    `path=${b.diagnostics.path}`);
  add(`[danger] "${q}" outranks module retrieval (Nolan urgent-passthrough)`,
    n.path === 'urgent-passthrough', `nolanPath=${n.path}`);
  add(`[danger] "${q}" reply carries no PHI`, !hasPHI(b.text));
  add(`[danger] "${q}" reply uses safe wording (no attestation)`, !FORBIDDEN_WORDING.test(b.text));
  add(`[danger] "${q}" Brad contract intact (text, references[], track)`,
    typeof b.text === 'string' && b.text.length > 0 && Array.isArray(b.references) && typeof b.track === 'string');
}

// ── Clinical emergency: urgent, 911, never fallback ────────────────────────
for (const q of CLINICAL_EMERGENCY) {
  const r = routeCriticalIncident(q);
  const b = composeInternalBradAnswer(q);
  add(`[clinical] "${q}" → urgent life-safety track`, r.urgent && URGENT_TRACKS.has(r.track), `track=${r.track}`);
  add(`[clinical] "${q}" names 911, not fallback`, b.matched && b.diagnostics.path !== 'fallback' && /911/.test(b.text), `path=${b.diagnostics.path}`);
  add(`[clinical] "${q}" reply carries no PHI`, !hasPHI(b.text));
}

// ── Worker safety: handled urgently with 911, never a catalog lookup ───────
//    (The mixed "worker injured + patient inside" case routes SERIOUS_INJURY;
//     all worker scenarios stay urgent life-safety — never demoted to search.)
for (const q of WORKER_SAFETY) {
  const r = routeCriticalIncident(q);
  const b = composeInternalBradAnswer(q);
  add(`[worker] "${q}" prioritized: urgent + life-safety`, r.urgent && r.lifeSafety, `track=${r.track} urgent=${r.urgent} life=${r.lifeSafety}`);
  add(`[worker] "${q}" names 911, not fallback`, b.matched && b.diagnostics.path !== 'fallback' && /911/.test(b.text), `path=${b.diagnostics.path}`);
  add(`[worker] "${q}" reply carries no PHI`, !hasPHI(b.text));
}

// ── False-positive guards: clinical/benign phrasing must NOT escalate ──────
for (const q of FALSE_POSITIVE_GUARDS) {
  const r = routeCriticalIncident(q);
  const n = composeNolanTutorAnswer(q);
  add(`[guard] "${q}" does NOT route to IMMEDIATE_DANGER`, r.track !== 'IMMEDIATE_DANGER', `track=${r.track}`);
  add(`[guard] "${q}" is not flagged urgent`, r.urgent === false, `urgent=${r.urgent}`);
  add(`[guard] "${q}" Nolan does not pass through to safety`, n.path !== 'urgent-passthrough', `nolanPath=${n.path}`);
}

// ── Non-emergency: routine questions stay non-urgent ───────────────────────
for (const q of NON_EMERGENCY) {
  const r = routeCriticalIncident(q);
  const n = composeNolanTutorAnswer(q);
  add(`[routine] "${q}" is not urgent`, r.urgent === false, `track=${r.track} urgent=${r.urgent}`);
  add(`[routine] "${q}" Nolan does not pass through to safety`, n.path !== 'urgent-passthrough', `nolanPath=${n.path}`);
}

// ── Report ─────────────────────────────────────────────────────────────────
console.log('Brad Scenario Safety-Routing Verifier');
console.log('=====================================');
let fails = 0;
for (const c of checks) {
  if (c.ok) { console.log(`PASS  ${c.name}`); }
  else { fails++; console.error(`FAIL  ${c.name}${c.detail ? ` :: ${c.detail}` : ''}`); }
}
console.log('---');
console.log(`${checks.length} checks, ${fails} failed`);
if (fails === 0) { console.log('Verifier result: PASS'); process.exit(0); }
console.error(`Verifier result: FAIL (${fails})`);
process.exit(1);
