/* ═══════════════════════════════════════════════════════════════
   verifyJourneyCorrections.ts — asserts the Master Correction §5/§6/§7/§8
   data-layer invariants. Runnable, deterministic, no build required:

     npm run journey:verify:corrections   (from apps/employee-journey)

   Exits non-zero on the first failed invariant so it can gate CI.
   ═══════════════════════════════════════════════════════════════ */

import { ACHC_CLINICAL_AUDIENCE, ANNUAL_ASSIGNMENT_MAP } from '../app/journey/_generated/annualAssignmentMap.generated';
import { ADVANCED_ASSIGNMENT_MAP, ADVANCED_PORTAL_MINIMUM_AUDIENCE } from '../app/journey/_generated/advancedAssignmentMap.generated';
import { getModulePlayerEntry } from '../app/journey/_generated/modulePlayerMap.generated';
import { getAnnualRequirements, ANNUAL_DEDUP_OBJECTIVES } from '../app/journey/_data/annualRequirements';

let failures = 0;
function check(name: string, cond: boolean, detail = '') {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.error(`  ✗ ${name}${detail ? ' — ' + detail : ''}`);
  }
}

console.log('ACHC audience (§6)');
const achcEntries = ANNUAL_ASSIGNMENT_MAP.filter((e) => e.moduleId.startsWith('ACHC-ART-'));
check('all 12 ACHC modules present', achcEntries.length === 12, `found ${achcEntries.length}`);
check('audience = clinical field-worker set (DON..MSW), ADM excluded',
  ACHC_CLINICAL_AUDIENCE.length === 10 && !ACHC_CLINICAL_AUDIENCE.includes('ADM' as never) && ACHC_CLINICAL_AUDIENCE.includes('DON'));
check("no ACHC module leaks roles:'ALL' (M04/M07/M09 fixed)",
  achcEntries.every((e) => e.audience.length === ACHC_CLINICAL_AUDIENCE.length && !e.audience.includes('ADM' as never)));
check('every ACHC module has a canonical player (no false Unavailable)',
  achcEntries.every((e) => getModulePlayerEntry(e.moduleId)?.playerAvailable === true));

console.log('Advanced audience floor (§7)');
check('PT/RN/DON/ADM floor present', ADVANCED_PORTAL_MINIMUM_AUDIENCE.join(',') === 'PT,RN,DON,ADM');
check('every advanced module effective audience ⊇ floor',
  ADVANCED_ASSIGNMENT_MAP.every((m) => ADVANCED_PORTAL_MINIMUM_AUDIENCE.every((r) => m.effective.includes(r))));
check('canonical roles never dropped from effective',
  ADVANCED_ASSIGNMENT_MAP.every((m) => m.canonical.every((r) => m.effective.includes(r))));

console.log('Dedup (§5)');
const rnReq = getAnnualRequirements('RN');
const supersededIds = new Set(ANNUAL_DEDUP_OBJECTIVES.flatMap((d) => d.supersededAnnIds));
check('superseded ANN ids never appear as their own role-specific card',
  rnReq.roleSpecific.every((i) => !supersededIds.has(i.moduleId)));
check('each dedup target ACHC module carries its Also-satisfies provenance',
  ANNUAL_DEDUP_OBJECTIVES.every((d) => (rnReq.achcAlsoSatisfies[d.achcModuleId] ?? []).length === d.supersededAnnIds.length));
check('ADM is not assigned the ACHC bundle (secondary-only)', getAnnualRequirements('ADM').achc.assignedToRole === false);
check('HHA gets the 12h in-service clock', getAnnualRequirements('HHA').hhaInService?.requiredHours === 12);

console.log('');
if (failures > 0) {
  console.error(`FAILED — ${failures} invariant(s) broken.`);
  process.exit(1);
}
console.log('All journey-correction invariants hold.');
