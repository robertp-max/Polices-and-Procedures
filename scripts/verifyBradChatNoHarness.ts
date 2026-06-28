/**
 * verifyBradChatNoHarness.ts
 * Validates the fix for Brad's chat path:
 *   1. Zero user-facing MVP/mock/harness/stub/debug language.
 *   2. Both abuse prompts get real internal policy-grounded guidance.
 *   3. No internet for either prompt (Brad.canReachInternet === false).
 *   4. Abuse scenario is treated as urgent mandatory reporting.
 *
 * Runs the REAL runtime path: getBradRuntime().answer() in default (mock) mode.
 * Usage: npx tsx scripts/verifyBradChatNoHarness.ts   (exit 0 pass, 1 fail)
 */
import { BradRuntime } from '../server/ia/harness/BradRuntime.js';
import { readHarnessConfig } from '../server/ia/harness/config.js';
import { classifyScenario } from '../server/ia/scenarioClassifier.js';

const PROMPTS = [
  'caregiver reported seeing son abusing her patient',
  'what do i do if i see my patient being abused?',
];

/** User-facing test-harness language that must NEVER appear in a chat bubble. */
const FORBIDDEN = [
  /MVP/i,
  /\bmock\b/i,
  /mock data/i,
  /mock mode/i,
  /harness/i,
  /\bstub\b/i,
  /placeholder/i,
  /would answer/i,
  /live model not invoked/i,
  /not invoked/i,
  /no internet/i,
  /synthetic/i,
];

/** Beats that prove real, mandatory-reporting abuse guidance (case-insensitive). */
const REQUIRED_BEATS = [
  /911/,
  /\b(supervisor|administrator|don|compliance)\b/i,
  /\b(do not|don.t)\b[^.]*\b(interrogate|investigat)/i,
  /\b(aps|adult protective services)\b/i,
  /document/i,
  /\bincident\b/i,
];

const failures: string[] = [];
let passed = 0;

// Default mock mode (no BRAD_* env). Explicit config keeps the run deterministic.
const cfg = readHarnessConfig({ BRAD_RUNTIME_MODE: 'mock' } as NodeJS.ProcessEnv);
const brad = new BradRuntime(cfg);

function check(cond: unknown, msg: string): void {
  if (cond) { passed++; } else { failures.push(msg); }
}

async function main() {
  console.log('=== Brad chat — no-harness + real-answer verification ===\n');

  // No-internet guarantee (type + runtime).
  check(brad.canReachInternet === false, 'Brad.canReachInternet must be false (no internet)');

  for (const prompt of PROMPTS) {
    console.log(`PROMPT: "${prompt}"`);
    const scenario = classifyScenario(prompt);
    const ans = await brad.answer(prompt, 'verify-script', 'user');

    console.log(`  category=${scenario.category} lifeSafety=${scenario.lifeSafetyFlag} blocked=${ans.blocked}`);
    console.log('  ─ Brad ─────────────────────────────────────────');
    console.log(ans.text.split('\n').map((l) => `  ${l}`).join('\n'));
    console.log('  ─────────────────────────────────────────────────\n');

    check(scenario.category === 'ABUSE_NEGLECT', `${prompt}: expected ABUSE_NEGLECT, got ${scenario.category}`);
    check(ans.blocked === false, `${prompt}: answer was blocked (should not be)`);

    for (const re of FORBIDDEN) {
      check(!re.test(ans.text), `${prompt}: forbidden harness/test language present (${re})`);
    }
    for (const re of REQUIRED_BEATS) {
      check(re.test(ans.text), `${prompt}: missing required mandatory-reporting beat (${re})`);
    }
    check(ans.text.length > 200, `${prompt}: answer too short to be real guidance`);
  }

  // Fallback path is professional (not harness text) when context is insufficient.
  const vague = await brad.answer('zorp flibbertigibbet quux', 'verify-script', 'user');
  check(/escalate this to your supervisor or the Compliance Officer/i.test(vague.text),
    'insufficient-context fallback must be the professional escalation message');
  for (const re of FORBIDDEN) {
    check(!re.test(vague.text), `fallback: forbidden harness/test language present (${re})`);
  }

  console.log(`=== RESULT: ${passed} checks passed, ${failures.length} failed ===`);
  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('\nALL CHECKS PASSED — chat is harness-free, internal, no internet, abuse handled.');
}

main().catch((e) => { console.error(e); process.exit(1); });
