/* ═══════════════════════════════════════════════════════════════
   verifyJourneyCorrections.ts — asserts the Master Correction §5/§6/§7/§8
   data-layer invariants. Runnable, deterministic, no build required:

     npm run journey:verify:corrections   (from apps/employee-journey)

   Exits non-zero on the first failed invariant so it can gate CI.
   ═══════════════════════════════════════════════════════════════ */

import { ACHC_CLINICAL_AUDIENCE, ANNUAL_ASSIGNMENT_MAP } from '../app/journey/_generated/annualAssignmentMap.generated';
import { ADVANCED_ASSIGNMENT_MAP, ADVANCED_PORTAL_MINIMUM_AUDIENCE } from '../app/journey/_generated/advancedAssignmentMap.generated';
import { getModulePlayerEntry } from '../app/journey/_generated/modulePlayerMap.generated';
import {
  getAnnualRequirements,
  ANNUAL_DEDUP_OBJECTIVES,
  ANNUAL_EQUIVALENCY_RECORDS,
  ANNUAL_PARTIAL_RESIDUALS,
} from '../app/journey/_data/annualRequirements';
import { getMainAppOrigin, resolveMainAppHref } from '../app/journey/_lib/mainAppUrl';
import { getOigSamStatus, getRoleOversight } from '../app/journey/_data/supervisedVisitation';

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

console.log('Main-app origin (§2)');
const devOrigin = getMainAppOrigin();
check('dev main-app origin is the main app (5188), not the journey app (5190)',
  devOrigin === 'http://localhost:5188', `got ${devOrigin}`);
check('journey origin (5190) !== resolved main-app origin', devOrigin !== 'http://localhost:5190');
const modHref = resolveMainAppHref('/journey/module/GAO-001');
check('module links resolve to the main app', modHref.ok && modHref.href.startsWith('http://localhost:5188/'));
const formHref = resolveMainAppHref('/forms/HR-FM-005');
check('form links resolve to the main app', formHref.ok && formHref.href.startsWith('http://localhost:5188/'));
const prevEnv = process.env.NODE_ENV;
const prevUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL;
process.env.NODE_ENV = 'production';
delete process.env.NEXT_PUBLIC_MAIN_APP_URL;
check('production never falls back to localhost (fails closed)', getMainAppOrigin() === null);
process.env.NODE_ENV = prevEnv;
if (prevUrl !== undefined) process.env.NEXT_PUBLIC_MAIN_APP_URL = prevUrl;

console.log('OIG/SAM applicability (§4)');
check('covered clinical role → APPLICABLE / Current (not hard-coded N/A)',
  getOigSamStatus('RN').applicability === 'APPLICABLE' && getOigSamStatus('RN').state === 'current');
check('nonclinical/unresolved role → REVIEW_REQUIRED, never auto Not-applicable',
  getOigSamStatus('GAO').applicability === 'REVIEW_REQUIRED' && getOigSamStatus('GAO').state !== 'not-applicable-approved');

console.log('HHA supervised visitation is scenario-tagged (§5)');
const hhaClocks = getRoleOversight('HHA')?.clocks ?? [];
check('HHA clocks are scenario-differentiated (skilled + aide-only present)',
  hhaClocks.some((c) => c.scenario === 'skilled') && hhaClocks.some((c) => c.scenario === 'aide-only'));
check('in-service clock applies to all HHA scenarios',
  hhaClocks.some((c) => /in-service/i.test(c.label) && (c.scenario ?? 'all') === 'all'));

console.log('Annual equivalency gating (§6)');
check('ANN-006 (return demo) is PARTIALLY_EQUIVALENT, not a full collapse',
  ANNUAL_EQUIVALENCY_RECORDS.find((r) => r.sourceAnnIds.includes('ANN-006'))?.decision === 'PARTIALLY_EQUIVALENT');
check('PARTIALLY/REVIEW ids are NOT superseded (only EQUIVALENT collapse)',
  !new Set(ANNUAL_DEDUP_OBJECTIVES.flatMap((d) => d.supersededAnnIds)).has('ANN-006'));
const hhaReq = getAnnualRequirements('HHA');
check('ANN-006 residual return-demo obligation is retained as a role-specific card',
  hhaReq.roleSpecific.some((i) => i.moduleId === 'ANN-006' && !!i.residualNote));
check('every partial residual carries a residual obligation string',
  ANNUAL_PARTIAL_RESIDUALS.every((r) => r.residual.length > 0));

console.log('');
if (failures > 0) {
  console.error(`FAILED — ${failures} invariant(s) broken.`);
  process.exit(1);
}
console.log('All journey-correction invariants hold.');
