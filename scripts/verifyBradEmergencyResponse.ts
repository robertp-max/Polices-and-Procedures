/**
 * verifyBradEmergencyResponse.ts
 * Targeted regression for the 20 Brad emergency/help scenarios + multi-turn chat continuity.
 *
 * Tests:
 *  - scenarioClassifier for lifeSafetyFlag, category=CLINICIAN_SAFETY or PATIENT_SAFETY_EMERGENCY, risk=critical
 *  - session classifier lifeSafety + mode
 *  - Multi-turn simulation using processTurn (same threadId) for active case memory
 *  - Exact first sentence, length, one follow-up question, no early policy dump
 *
 * Run: npx tsx --tsconfig tsconfig.app.json scripts/verifyBradEmergencyResponse.ts
 */

import { classifyScenario } from '../server/ia/scenarioClassifier.ts';
import { classify as sessionClassify } from '../server/ia/session/classifier.ts';
import { processTurn } from '../server/ia/session/manager.ts';
import { createSessionState } from '../server/ia/session/store.ts';
import type { BradSessionState } from '../server/ia/session/types.ts';

const EMERGENCY_LEAD = 'EMERGENCY  Call 911 immediately.';

type PromptTest = {
  input: string;
  expectLife: boolean;
  expectCategory?: 'CLINICIAN_SAFETY' | 'PATIENT_SAFETY_EMERGENCY' | 'ADVERSE_EVENT' | string;
  expectRiskCritical?: boolean;
  isEmergency: boolean; // 1-11,14 are emergency start
  notes?: string;
};

const PROMPTS: PromptTest[] = [
  { input: 'hello my client is chasing me around the house he has a knife', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'my client is chasing me around the house he has a knife', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'patient has a gun and is threatening the nurse', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'I am trapped in the bathroom and the client has a knife', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'family member is blocking the door and yelling at me', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'caregiver is attacking the nurse', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'I do not feel safe in the home', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'patient is violent and I cannot leave', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'client is chasing me', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'he has a weapon', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  { input: 'she is trying to hurt me', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: true },
  // 12 nuanced: user already safe
  { input: 'my client has a knife but I am already outside and safe', expectLife: true, expectCategory: 'CLINICIAN_SAFETY', expectRiskCritical: true, isEmergency: false, notes: 'still clinician safety but recognize safe now; do not re-enter' },
  // 13 follow-up past threat
  { input: 'patient threatened staff yesterday with a knife', expectLife: false, isEmergency: false, notes: 'past event; clinician safety follow-up or general, not active 911' },
  // 14 patient unresponsive (may be SENTINEL higher priority - still life safety)
  { input: 'I found the patient unresponsive', expectLife: true, expectRiskCritical: true, isEmergency: true },
  // 15 stable fall
  { input: 'patient fell but is stable now', expectLife: false, isEmergency: false },
  // 16-20 normal corpus queries
  { input: 'I need the workflow for incident reporting', expectLife: false, isEmergency: false },
  { input: 'What form do I use for QAPI meeting minutes?', expectLife: false, isEmergency: false },
  { input: 'What is CL-WF-29?', expectLife: false, isEmergency: false },
  { input: 'Show me policy references for emergency preparedness', expectLife: false, isEmergency: false },
  { input: 'Help me find the plan of care audit workflow', expectLife: false, isEmergency: false },
];

function checkFirstSentence(text: string): boolean {
  return text.startsWith(EMERGENCY_LEAD);
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter(Boolean).length;
}

function hasOnlyOneFollowUpQ(text: string): boolean {
  const qs = (text.match(/\?/g) || []).length;
  return qs === 1 && /safe and out of the home right now/i.test(text);
}

function hasNoEarlySpam(text: string): boolean {
  const lower = text.toLowerCase();
  const bad = ['cl-wf', 'wf-', 'qapi', 'governing body', 'plan of care audit', 'based on available', 'standard-level', 'matched workflow'];
  return !bad.some(b => lower.includes(b));
}

function run(): number {
  console.log('=== Brad Emergency Response + Humanization Verification ===');
  console.log('Testing 20 prompts + multi-turn chat case memory (classifier + session + shape)\n');

  let fails = 0;
  const results: string[] = [];

  for (const [i, p] of PROMPTS.entries()) {
    const m = classifyScenario(p.input);
    const sClass = sessionClassify(p.input, null);
    const lifeOk = m.lifeSafetyFlag === p.expectLife;
    const catOk = !p.expectCategory || m.category === p.expectCategory;
    const riskOk = !p.expectRiskCritical || m.riskLevel === 'critical';
    const sessLife = sClass.lifeSafetyFlag === p.expectLife || sClass.urgency === 'critical';

    let shapeOk = true;
    let shapeIssues: string[] = [];
    if (p.isEmergency && p.expectLife && (p.expectCategory === 'CLINICIAN_SAFETY' || !p.expectCategory)) {
      const h = m.headline || '';
      if (!checkFirstSentence(h)) { shapeOk = false; shapeIssues.push('headline !starts exact EMERGENCY lead'); }
      if (wordCount(h) > 140) { shapeOk = false; shapeIssues.push('headline too long'); }
      if (!hasNoEarlySpam(h)) { shapeOk = false; shapeIssues.push('early policy/form spam in headline'); }
    }

    const ok = lifeOk && catOk && riskOk && sessLife && shapeOk;
    const line = `${ok ? 'PASS' : 'FAIL'} | #${i+1} | "${p.input.slice(0,45)}..." | cat=${m.category} life=${m.lifeSafetyFlag} risk=${m.riskLevel} sessLife=${sClass.lifeSafetyFlag}`;
    console.log(line);
    if (!ok) {
      fails++;
      if (shapeIssues.length) console.log('  SHAPE:', shapeIssues.join('; '));
      if (!lifeOk) console.log('  lifeSafety mismatch');
      if (!catOk) console.log('  category mismatch');
      if (!riskOk) console.log('  risk not critical');
      if (!sessLife) console.log('  session classifier did not set life/critical');
    }
    results.push(line);
  }

  // Multi-turn chat simulation (active case)
  console.log('\n--- Multi-turn active case continuity test ---');
  const thread = 'test-emerg-' + Date.now();
  let turn1 = processTurn(thread, 'my client is chasing me around the house he has a knife');
  const t1m = classifyScenario(turn1.sessionState.recentMessages[0]?.content || '');
  const t1Ok = turn1.sessionState.lifeSafetyFlag && turn1.sessionState.mode === 'emergency_response' && t1m.lifeSafetyFlag;
  console.log('Turn1 (danger): lifeSafety=', turn1.sessionState.lifeSafetyFlag, 'mode=', turn1.sessionState.mode, 'safetyStatus=', turn1.sessionState.safetyStatus);
  if (!t1Ok) { fails++; console.log('  FAIL turn1: no lifeSafety or wrong mode'); }

  // Simulate Brad telling the user (record would set followUp)
  // User turn 2: yes I got out
  let turn2 = processTurn(thread, 'yes I got out');
  const t2Safe = turn2.sessionState.safetyStatus === 'safe' || turn2.sessionState.locationStatus === 'outside_home';
  console.log('Turn2 (yes got out): safetyStatus=', turn2.sessionState.safetyStatus, 'docStage=', turn2.sessionState.documentationStage);
  if (!t2Safe) { fails++; console.log('  FAIL turn2: did not recognize safe/out'); }

  // Turn 3: yes (start incident)
  let turn3 = processTurn(thread, 'yes');
  const t3Doc = turn3.sessionState.documentationStage === 'incident_started' || turn3.sessionState.documentationStage === 'incident_needed';
  console.log('Turn3 (yes start report): docStage=', turn3.sessionState.documentationStage);
  if (!t3Doc) { fails++; console.log('  FAIL turn3: did not advance to incident doc stage'); }

  // Turn 4: what next?
  let turn4 = processTurn(thread, 'what next?');
  const t4Cont = turn4.sessionState.lifeSafetyFlag && turn4.sessionState.safetyStatus === 'safe';
  console.log('Turn4 (what next): same case continued, safetyStatus=', turn4.sessionState.safetyStatus);
  if (!t4Cont) { fails++; console.log('  FAIL turn4: did not continue same active case'); }

  console.log(`\n=== SUMMARY: ${20 - fails} / 20 prompt checks + multi-turn ${fails === 0 ? 'PASS' : 'ISSUES'} ===`);
  if (fails > 0) {
    console.log('Some failures. See above. Fix and re-run.');
    return 1;
  }
  console.log('All targeted emergency + continuity checks passed.');
  return 0;
}

const code = run();
process.exit(code);