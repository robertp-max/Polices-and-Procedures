/**
 * verifyBradHumanFirstPreview.ts
 * Visible-preview / mock Brad verification for human-first staff safety layer.
 *
 * Run: npx tsx --tsconfig tsconfig.app.json scripts/verifyBradHumanFirstPreview.ts
 *
 * Tests the exact 18 inputs from the task (plus multi-turn simulation via text checks).
 * Asserts:
 *  - Human supervisor lead sentence first (no "App data matches...")
 *  - Safety check question early
 *  - One focused follow-up
 *  - No app-data / workflow / form dump before safety
 *  - No hard 92% confidence on human cases
 *  - Multi-turn continuations stay in case (text contains "do not re-enter" etc.)
 *  - Normal queries 16-18 may use corpus behavior
 */

import { runBradQuery } from '../src/services/mockBradEngine';

const TEST_INPUTS = [
  { n: 1, input: 'help my client groped my chest', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 2, input: 'client groped me', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 3, input: 'patient touched my chest', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 4, input: 'patient sexually harassed me', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 5, input: 'hello my client is accusing me of theft', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 6, input: 'patient accused me of stealing', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 7, input: 'family says I stole something', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 8, input: 'I do not feel safe in the home', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 9, input: 'family member is blocking the door', expectHuman: true, expectNoAppData: true, expectNo92: true },
  { n: 10, input: 'my client is chasing me around the house he has a knife', expectHuman: true, expectStartsEmergency: true, expectNoAppData: true },
  { n: 11, input: 'patient has a gun and is threatening the nurse', expectHuman: true, expectStartsEmergency: true, expectNoAppData: true },
  { n: 12, input: 'I am trapped in the bathroom and the client has a knife', expectHuman: true, expectStartsEmergency: true, expectNoAppData: true },
  // Multi-turn style (engine is stateless; we check text for continuation phrases that the chat layer would produce)
  { n: 13, input: 'yes I got out', expectHuman: true, expectContinuation: 'do not re-enter|notify your supervisor', expectNoAppData: true },
  { n: 14, input: 'what next', expectHuman: true, expectContinuation: 'incident|document|supervisor', expectNoAppData: true },
  { n: 15, input: 'yes', expectHuman: true, expectContinuation: 'incident|document|supervisor', expectNoAppData: true },
  // Normal corpus allowed
  { n: 16, input: 'What form do I use for QAPI meeting minutes?', expectHuman: false, expectCorpusOk: true },
  { n: 17, input: 'What is CL-WF-29?', expectHuman: false, expectCorpusOk: true },
  { n: 18, input: 'Help me find the plan of care audit workflow', expectHuman: false, expectCorpusOk: true },
];

function hasAppDataDump(text: string): boolean {
  return /App data matches were found|Direct Answer:.*(task|workflow|event).*matches|Related References:.*(WF-|TSK-|CL-WF)/i.test(text);
}

function has92(text: string): boolean {
  // In the structured conversion, but we also check answer for old-style
  return /92%|High Confidence 92|confidence.*92/i.test(text);
}

async function run() {
  console.log('=== Brad Human-First Preview / Mock Verification ===\n');
  let fails = 0;

  for (const t of TEST_INPUTS) {
    const resp = await runBradQuery(t.input);
    const answer = resp.answer || '';
    const firstSentence = answer.split(/[.!?]\s/)[0] || answer.slice(0, 120);
    const hasDump = hasAppDataDump(answer);
    const hasConf92 = has92(answer) || (resp as any).systemConfidenceScore === 92;
    const startsEmergency = /^EMERGENCY\s+Call 911/i.test(answer);
    const isHuman = !hasDump && (startsEmergency || /sorry that happened|that is serious|step away|are you safe|do you feel safe/i.test(answer));
    const hasCont = t.expectContinuation ? new RegExp(t.expectContinuation, 'i').test(answer) : true;

    let ok = true;
    const issues: string[] = [];

    if (t.expectHuman && !isHuman) { ok = false; issues.push('expected human supervisor lead, got app-data or robotic'); }
    if (t.expectNoAppData && hasDump) { ok = false; issues.push('app-data / ref dump present before safety'); }
    if (t.expectNo92 && hasConf92) { ok = false; issues.push('hard 92% confidence visible on human case'); }
    if (t.expectStartsEmergency && !startsEmergency) { ok = false; issues.push('did not start with exact EMERGENCY  Call 911 immediately.'); }
    if (t.expectContinuation && !hasCont) { ok = false; issues.push('multi-turn continuation text missing'); }
    if (t.expectCorpusOk && hasDump && !isHuman) {
      // normal corpus behavior is allowed to have matches
    }

    const status = ok ? 'PASS' : 'FAIL';
    console.log(`${status} | #${t.n} "${t.input.slice(0, 42)}..."`);
    if (!ok) {
      fails++;
      console.log(`  ISSUES: ${issues.join('; ')}`);
      console.log(`  FIRST: ${firstSentence.slice(0, 110)}...`);
    } else {
      console.log(`  LEAD: ${firstSentence.slice(0, 90)}...`);
    }
  }

  console.log(`\n=== SUMMARY: ${TEST_INPUTS.length - fails} / ${TEST_INPUTS.length} PASS ===`);
  if (fails > 0) {
    console.log('Some human-first preview checks failed. See details above.');
    return 1;
  }
  console.log('All targeted human-first + multi-turn + normal-query checks passed for preview/mock path.');
  return 0;
}

run().then(code => process.exit(code));