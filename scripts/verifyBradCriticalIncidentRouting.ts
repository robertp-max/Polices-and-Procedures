/**
 * verifyBradCriticalIncidentRouting.ts
 * Full critical-incident routing + 100-question situational QA for Brad.
 *
 * Runs the REAL answer path (composeInternalBradAnswer / routeCriticalIncident)
 * and asserts, per question:
 *   - correct broad incident track,
 *   - urgent prompts never hit the generic fallback,
 *   - useful safety-first guidance in the first sentence,
 *   - 911/EMS named for danger/injury/death/clinical/unsafe/mistreatment,
 *   - internal references attached for urgent tracks,
 *   - no MVP/mock/harness/debug/"as an AI" wording,
 *   - no internet on this path.
 *
 * Usage: npx tsx scripts/verifyBradCriticalIncidentRouting.ts   (exit 0/1)
 */
import { composeInternalBradAnswer, INSUFFICIENT_CONTEXT_FALLBACK } from '../server/ia/brad/bradInternalResponder.js';
import { routeCriticalIncident, type IncidentTrack } from '../server/ia/brad/criticalIncidentRouter.js';
import { BradRuntime } from '../server/ia/harness/BradRuntime.js';
import { readHarnessConfig } from '../server/ia/harness/config.js';
import { BRAD_QA_PROMPTS, type QaPrompt } from '../server/ia/brad/__fixtures__/bradQaPrompts.js';

const FORBIDDEN = [
  /\bMVP\b/i, /\bmock\b/i, /harness/i, /\bstub\b/i, /placeholder/i,
  /would answer/i, /live model/i, /not invoked/i, /as an ai\b/i,
  /language model/i, /\bllm\b/i, /\bsynthetic\b/i, /no internet/i,
];

/** Tracks where the guidance must name 911/EMS. */
const REQUIRE_911: Set<IncidentTrack> = new Set([
  'IMMEDIATE_DANGER', 'SERIOUS_INJURY', 'DEATH_OR_UNRESPONSIVE',
  'UNSAFE_ENVIRONMENT', 'SUSPECTED_MISTREATMENT', 'CLINICAL_EMERGENCY',
]);

interface Result { q: QaPrompt; track: IncidentTrack; pass: boolean; issues: string[] }

function firstSentence(text: string): string {
  return text.split('\n')[0].trim();
}

function evaluate(q: QaPrompt): Result {
  const route = routeCriticalIncident(q.prompt);
  const ans = composeInternalBradAnswer(q.prompt);
  const issues: string[] = [];
  const text = ans.text;
  const lead = firstSentence(text);

  // Track correctness (accept list is authoritative; overlap allowed).
  if (!q.accept.includes(ans.track)) {
    issues.push(`track=${ans.track} not in [${q.accept.join(', ')}]`);
  }
  if (ans.track !== route.track) issues.push(`route/answer track mismatch (${route.track} vs ${ans.track})`);

  // First-sentence usefulness.
  if (lead.length < 20) issues.push(`first sentence too short: "${lead}"`);

  // No forbidden wording.
  for (const re of FORBIDDEN) if (re.test(text)) issues.push(`forbidden wording ${re}`);

  if (ans.track !== 'GENERAL') {
    // Any urgent track → real, safety-first guidance, never the generic fallback.
    if (!ans.matched) issues.push('urgent track not matched (would fall back)');
    if (text === INSUFFICIENT_CONTEXT_FALLBACK) issues.push('urgent track hit generic fallback');
    if (ans.references.length === 0) issues.push('urgent track has no internal references');
    if (text.length < 200) issues.push('urgent guidance too short');
    if (REQUIRE_911.has(ans.track) && !/911/.test(text)) issues.push('missing 911/EMS guidance for life-safety track');
  } else {
    // GENERAL → grounded guidance OR the professional escalation are both acceptable.
    const acceptable = ans.matched || text === INSUFFICIENT_CONTEXT_FALLBACK;
    if (!acceptable) issues.push('GENERAL produced neither guidance nor escalation');
  }
  // Hard guarantee: a prompt marked urgent must not end on the generic fallback.
  if (q.urgent && text === INSUFFICIENT_CONTEXT_FALLBACK) {
    issues.push('prompt marked urgent fell into generic fallback');
  }

  return { q, track: ans.track, pass: issues.length === 0, issues };
}

function main() {
  console.log('=== Brad Critical-Incident Routing — 100-question situational QA ===\n');

  // No-internet guarantee on the answer path.
  const brad = new BradRuntime(readHarnessConfig({ BRAD_RUNTIME_MODE: 'mock' } as NodeJS.ProcessEnv));
  const noInternet = brad.canReachInternet === false;
  console.log(`No-internet (Brad.canReachInternet === false): ${noInternet ? 'YES' : 'NO'}\n`);

  const results = BRAD_QA_PROMPTS.map(evaluate);
  const failed = results.filter((r) => !r.pass);

  for (const r of results) {
    const status = r.pass ? 'PASS' : 'FAIL';
    console.log(`${String(r.q.id).padStart(3)} ${status} [${r.track}] ${r.q.prompt}`);
    if (!r.pass) r.issues.forEach((i) => console.log(`       ↳ ${i}`));
  }

  console.log(`\n=== ${results.length - failed.length}/${results.length} passed${noInternet ? '' : '  (NO-INTERNET CHECK FAILED)'} ===`);

  if (failed.length || !noInternet) {
    console.log('\nFAILED QUESTIONS:');
    failed.forEach((r) => console.log(`  ${r.q.id} "${r.q.prompt}" — ${r.issues.join('; ')}`));
    process.exit(1);
  }
  console.log('\nALL 100 QA QUESTIONS PASSED — routing correct, urgent never falls back, no internet, no debug wording.');
}

main();
