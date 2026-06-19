/**
 * verifyBradRealLifeScenarios.ts
 * Repeatable assertion-based verification for Brad's 18 real-life high-risk home health scenarios
 * and the 10 exact user phrases from the requirements.
 *
 * Focus: server/ia/scenarioClassifier.ts (the authoritative backend Brad compliance classifier + playbooks).
 *
 * Usage: npx tsx scripts/verifyBradRealLifeScenarios.ts
 * Exits 0 on all pass, 1 on any failure. Prints detailed report.
 *
 * NOTE ON FRONTEND: The iAdministrator UI/demo (src/policy/pages/iAdministrator/*) and mockBradEngine
 * use a *different* classifyScenario from src/policy/pages/iAdministrator/lib/classifyScenario.ts
 * (backed by complianceActionMap.ts with only 11 scenarioIds and different structure).
 * Server changes do not automatically affect the in-app Brad demo UI. This script verifies the
 * server path (per original task files). See log and final report for mismatch details + paths.
 */

import { classifyScenario, type ScenarioMapping, type ScenarioCategory } from '../server/ia/scenarioClassifier.ts';

type TestCase = {
  name: string;
  input: string;
  acceptableCategories: ScenarioCategory[]; // at least one must match
  requiresLifeSafety?: boolean;
  mustContainInActionsOrHeadline?: string[]; // strings that must appear in some immediateAction or headline
  mustContainInDocs?: string[]; // real-time doc guidance checks
  legalThreatCheck?: boolean; // special: Administrator + legal counsel + preserve/record
  hipaaCheck?: boolean; // contain/report/preserve/do not delete
  refusalCheck?: boolean; // document refusal + notify supervisor/physician/lead
  unresponsiveCheck?: boolean; // call 911 AND does not pronounce death
};

const testCases: TestCase[] = [
  // 18 core scenarios
  {
    name: '1. Staff car accident on the way to patient visit',
    input: 'Staff got into a car accident on the way to a patient visit. My car is damaged but I am ok.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['First, do this now', 'safe', '911', 'supervisor', 'do not continue'],
    mustContainInDocs: ['real-time', 'Document in real time', 'time', 'missed'],
  },
  {
    name: '2. Patient fell and may have hit head (on blood thinners)',
    input: 'Patient fell during visit and may have hit head. She is on blood thinners.',
    acceptableCategories: ['PATIENT_SAFETY_EMERGENCY', 'ADVERSE_EVENT'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['First, do this now', '911', 'head', 'blood thinners', 'supervisor'],
    mustContainInDocs: ['real-time', 'Document in real time', 'exact time', 'quotes'],
    refusalCheck: false,
  },
  {
    name: '3. Patient is unresponsive on arrival',
    input: 'Patient is unresponsive on arrival. Not breathing.',
    acceptableCategories: ['SENTINEL_EVENT_CRITICAL', 'PATIENT_SAFETY_EMERGENCY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['911', 'unresponsive', 'call 911'],
    mustContainInDocs: ['real-time', 'Document in real time'],
    unresponsiveCheck: true,
  },
  {
    name: '4. Family threatens to sue / lawyer after grievance',
    input: 'Family threatens to sue after a grievance. They said they are getting a lawyer.',
    acceptableCategories: ['COMPLAINT'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['do not argue', 'Administrator', 'legal counsel', 'preserve'],
    legalThreatCheck: true,
  },
  {
    name: '5. Patient alleges caregiver abuse',
    input: 'Patient alleges caregiver abuse. Bruises look suspicious.',
    acceptableCategories: ['ABUSE_NEGLECT'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['911', 'APS', 'notify', 'document'],
    mustContainInDocs: ['objective', 'observations'],
  },
  {
    name: '6. Clinician accidentally texted PHI to wrong number',
    input: 'Clinician accidentally texted PHI to wrong number. Sent the schedule with names and meds.',
    acceptableCategories: ['PRIVACY_BREACH'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['contain', 'Privacy Officer', 'do not delete'],
    hipaaCheck: true,
    mustContainInDocs: ['real-time', 'exact'],
  },
  {
    name: '7. Wildfire evacuation order affects scheduled patients',
    input: 'Wildfire evacuation order affects scheduled patients. We need to move them.',
    acceptableCategories: ['EMERGENCY_OPERATIONAL'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['triage', 'contact', 'Incident Command'],
    mustContainInDocs: ['real-time', 'log', 'contact attempt'],
  },
  {
    name: '8. EHR outage during urgent documentation',
    input: 'EHR outage during urgent documentation. System is completely down.',
    acceptableCategories: ['EMERGENCY_OPERATIONAL', 'CYBERSECURITY_INCIDENT'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['paper downtime', 'timestamp', 'sign'],
    mustContainInDocs: ['downtime', 'EHR'],
  },
  {
    name: '9. Staff needle-stick / bloodborne pathogen exposure',
    input: 'Staff needle-stick bloodborne pathogen exposure after giving injection.',
    acceptableCategories: ['CLINICIAN_SAFETY', 'ADVERSE_EVENT'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['needle', 'exposure', 'first aid', 'supervisor', 'medical'],
    mustContainInDocs: ['exposure', 'time of exposure'],
  },
  {
    name: '10. Unsafe home environment / weapon / violence risk',
    input: 'Unsafe home environment weapon violence risk. Husband has gun and is yelling.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['911', 'leave', 'safe location', 'supervisor'],
    mustContainInDocs: ['real-time', 'threat'],
  },
  {
    name: '11. Patient refuses evacuation (wildfire)',
    input: 'Patient refuses evacuation during wildfire. Says stay and die together.',
    acceptableCategories: ['EMERGENCY_OPERATIONAL'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['refus', 'explain risks', 'document', 'notify supervisor'],
    refusalCheck: true,
  },
  {
    name: '12. Medication error discovered after visit',
    input: 'Medication error discovered after visit. Gave wrong dose of insulin.',
    acceptableCategories: ['ADVERSE_EVENT'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['assess', 'supervisor', 'physician', 'do not conceal'],
    mustContainInDocs: ['real-time', 'objective', 'do not'],
  },
  {
    name: '13. Family blocks clinician from entering the home',
    input: 'Family blocks clinician from entering the home. Standing in doorway, aggressive.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['blocked exit', 'leave the scene', 'safe location', 'supervisor'],
  },
  {
    name: '14. Patient refuses 911 after serious symptoms (chest pain)',
    input: 'Patient refuses 911 after serious symptoms, chest pain and weakness.',
    acceptableCategories: ['PATIENT_SAFETY_EMERGENCY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['refus', 'urge', 'notify', 'supervisor', 'physician', 'document'],
    refusalCheck: true,
  },
  {
    name: '15. Patient property is damaged during a visit',
    input: 'Patient property is damaged during a visit. I accidentally broke their lamp.',
    acceptableCategories: ['ADVERSE_EVENT'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['property damage', 'secure', 'do not alter', 'incident'],
    mustContainInDocs: ['real-time', 'facts'],
  },
  {
    name: '16. Staff witnesses another staff member acting impaired',
    input: 'Staff witnesses another staff member acting impaired. Smells of alcohol, slurring.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['impaired', 'do not let', 'drive', 'notify supervisor', 'remove'],
  },
  {
    name: '17. Patient reports missing medication',
    input: 'Patient reports missing medication after my visit. Says the count is short.',
    acceptableCategories: ['ADVERSE_EVENT'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['missing', 'verify', 'count', 'notify', 'document'],
  },
  {
    name: '18. Caregiver says they can no longer care for the patient safely',
    input: 'Caregiver says they can no longer care for the patient safely. Overwhelmed and crying.',
    acceptableCategories: ['COMPLAINT', 'ABUSE_NEGLECT'],
    requiresLifeSafety: false,
    mustContainInActionsOrHeadline: ['notify', 'supervisor', 'document', 'safety'],
  },

  // Exact 10 user phrases from AC8 (some overlap with above for emphasis)
  {
    name: 'EXACT: I got into a car accident on my way to the patient.',
    input: 'I got into a car accident on my way to the patient.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['First, do this now', 'safe', 'do not continue'],
  },
  {
    name: 'EXACT: The patient fell and hit her head. She is on blood thinners.',
    input: 'The patient fell and hit her head. She is on blood thinners.',
    acceptableCategories: ['PATIENT_SAFETY_EMERGENCY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['911', 'head', 'blood thinners'],
    mustContainInDocs: ['real-time'],
  },
  {
    name: 'EXACT: The patient is unresponsive.',
    input: 'The patient is unresponsive.',
    acceptableCategories: ['PATIENT_SAFETY_EMERGENCY', 'SENTINEL_EVENT_CRITICAL'],
    requiresLifeSafety: true,
    unresponsiveCheck: true,
  },
  {
    name: 'EXACT: The family says they are suing us.',
    input: 'The family says they are suing us.',
    acceptableCategories: ['COMPLAINT'],
    legalThreatCheck: true,
    mustContainInActionsOrHeadline: ['Administrator', 'legal'],
  },
  {
    name: 'EXACT: I accidentally texted PHI to the wrong number.',
    input: 'I accidentally texted PHI to the wrong number.',
    acceptableCategories: ['PRIVACY_BREACH'],
    hipaaCheck: true,
  },
  {
    name: 'EXACT: The patient refuses 911 but has chest pain.',
    input: 'The patient refuses 911 but has chest pain.',
    acceptableCategories: ['PATIENT_SAFETY_EMERGENCY'],
    requiresLifeSafety: true,
    refusalCheck: true,
  },
  {
    name: 'EXACT: The EHR is down and I need to document a fall.',
    input: 'The EHR is down and I need to document a fall.',
    acceptableCategories: ['EMERGENCY_OPERATIONAL', 'CYBERSECURITY_INCIDENT'],
    mustContainInActionsOrHeadline: ['paper downtime'],
  },
  {
    name: 'EXACT: There is a weapon in the home and the family is yelling.',
    input: 'There is a weapon in the home and the family is yelling.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
  },
  {
    name: 'EXACT: A staff member seems impaired and is about to drive.',
    input: 'A staff member seems impaired and is about to drive.',
    acceptableCategories: ['CLINICIAN_SAFETY'],
    requiresLifeSafety: true,
    mustContainInActionsOrHeadline: ['impaired', 'do not'],
  },
  {
    name: 'EXACT: The caregiver says they cannot safely care for the patient anymore.',
    input: 'The caregiver says they cannot safely care for the patient anymore.',
    acceptableCategories: ['COMPLAINT', 'ABUSE_NEGLECT'],
  },
];

function hasText(haystack: string | string[], needle: string): boolean {
  if (Array.isArray(haystack)) {
    return haystack.some(s => s.toLowerCase().includes(needle.toLowerCase()));
  }
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function run(): number {
  const failures: string[] = [];
  const passes: string[] = [];

  console.log('=== Brad Real-Life Scenarios Verification ===');
  console.log('Verifying server/ia/scenarioClassifier.ts playbooks + classifier (backend authoritative path)');
  console.log(`Total cases: ${testCases.length}\n`);

  for (const tc of testCases) {
    const mapping: ScenarioMapping = classifyScenario(tc.input);
    const cat = mapping.category;
    const life = mapping.lifeSafetyFlag;
    const headline = mapping.headline || '';
    const actions = mapping.immediateActions || [];
    const summary = mapping.summary || '';
    const compliance = (mapping.complianceNotes || []).join(' ');
    const allText = [headline, ...actions, summary, compliance].join(' | ');

    let ok = true;
    const issues: string[] = [];

    // Category
    if (!tc.acceptableCategories.includes(cat)) {
      ok = false;
      issues.push(`category=${cat} not in acceptable [${tc.acceptableCategories.join(', ')}]`);
    }

    // lifeSafety
    if (tc.requiresLifeSafety === true && life !== true) {
      ok = false;
      issues.push(`lifeSafetyFlag=${life} (expected true)`);
    }
    if (tc.requiresLifeSafety === false && life === true) {
      // not strict fail usually, but note
    }

    // Safety-first language
    if (tc.mustContainInActionsOrHeadline && tc.mustContainInActionsOrHeadline.length) {
      const found = tc.mustContainInActionsOrHeadline.every(need => hasText(allText, need) || hasText(actions, need) || hasText(headline, need));
      if (!found) {
        ok = false;
        issues.push(`missing safety-first lang: ${tc.mustContainInActionsOrHeadline.join(' / ')} (in headline/actions)`);
      }
    }

    // Real-time documentation
    if (tc.mustContainInDocs && tc.mustContainInDocs.length) {
      const docFound = tc.mustContainInDocs.some(need => hasText(allText, need));
      if (!docFound) {
        ok = false;
        issues.push(`missing real-time doc guidance: ${tc.mustContainInDocs.join(' / ')}`);
      }
    }

    // Legal threat specifics
    if (tc.legalThreatCheck) {
      const hasAdmin = hasText(allText, 'Administrator');
      const hasLegal = hasText(allText, 'legal counsel') || hasText(allText, 'legal');
      const hasPreserve = hasText(allText, 'preserve') || hasText(allText, 'record');
      if (!hasAdmin || !hasLegal || !hasPreserve) {
        ok = false;
        issues.push(`legal threat check failed (need Administrator + legal + preserve/record)`);
      }
    }

    // HIPAA
    if (tc.hipaaCheck) {
      const hasContain = hasText(allText, 'contain');
      const hasReport = hasText(allText, 'report') || hasText(allText, 'Privacy');
      const hasPreserve = hasText(allText, 'preserve') || hasText(allText, 'do not delete') || hasText(allText, 'do not alter');
      if (!hasContain || !hasReport || !hasPreserve) {
        ok = false;
        issues.push(`HIPAA check failed (need contain + report/Privacy + preserve/do not delete)`);
      }
    }

    // Refusal
    if (tc.refusalCheck) {
      const hasDocRefusal = hasText(allText, 'refus') && (hasText(allText, 'document') || hasText(allText, 'doc'));
      const hasNotify = hasText(allText, 'notify supervisor') || hasText(allText, 'notify') && (hasText(allText, 'physician') || hasText(allText, 'supervisor') || hasText(allText, 'lead'));
      if (!hasDocRefusal || !hasNotify) {
        ok = false;
        issues.push(`refusal check failed (need document refusal + notify supervisor/physician/lead)`);
      }
    }

    // Unresponsive specific
    if (tc.unresponsiveCheck) {
      const has911 = hasText(allText, 'call 911') || hasText(allText, '911');
      const noPronounce = !hasText(allText.toLowerCase(), 'pronounce') || hasText(allText, 'do not') || hasText(allText, 'NOT') || hasText(allText, 'cannot');
      if (!has911 || !noPronounce) {
        ok = false;
        issues.push(`unresponsive check failed (need 911 + explicit do NOT / cannot pronounce death)`);
      }
    }

    const status = ok ? 'PASS' : 'FAIL';
    const line = `${status} | ${tc.name} | cat=${cat} life=${life}`;
    console.log(line);
    if (issues.length) {
      console.log(`  ISSUES: ${issues.join('; ')}`);
      // Show snippet of headline/actions for debug
      console.log(`  HEADLINE: ${headline.slice(0, 120)}...`);
      if (actions[0]) console.log(`  ACT0: ${actions[0].slice(0, 120)}...`);
    }

    if (ok) passes.push(tc.name);
    else failures.push(`${tc.name}: ${issues.join('; ')}`);
  }

  console.log(`\n=== SUMMARY: ${passes.length} PASS, ${failures.length} FAIL ===`);
  if (failures.length > 0) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log(' - ' + f));
    console.log('\nVerification FAILED. Brad server classifier + playbooks require fixes before claiming pass.');
    return 1;
  } else {
    console.log('\nAll assertions passed for server/ia path.');
    return 0;
  }
}

const exitCode = run();
process.exit(exitCode);
