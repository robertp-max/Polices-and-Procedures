/* ═══════════════════════════════════════════════════════════════
   verifyJourneyCorrections.ts — asserts the Master Correction §5/§6/§7/§8
   data-layer invariants. Runnable, deterministic, no build required:

     npm run journey:verify:corrections   (from apps/employee-journey)

   Exits non-zero on the first failed invariant so it can gate CI.
   ═══════════════════════════════════════════════════════════════ */

import { ACHC_CLINICAL_AUDIENCE, ANNUAL_ASSIGNMENT_MAP } from '../app/journey/_generated/annualAssignmentMap.generated';
import { getAdvancedTraining, ADVANCED_TRAINING_MODULE_IDS } from '../app/journey/_data/advancedTraining';
import { getModulePlayerEntry } from '../app/journey/_generated/modulePlayerMap.generated';
import {
  getAnnualRequirements,
  ANNUAL_DEDUP_OBJECTIVES,
  ANNUAL_EQUIVALENCY_RECORDS,
  ANNUAL_PARTIAL_RESIDUALS,
} from '../app/journey/_data/annualRequirements';
import { getMainAppOrigin, resolveMainAppHref } from '../app/journey/_lib/mainAppUrl';
import { getOigSamStatus, getRoleOversight } from '../app/journey/_data/supervisedVisitation';
import {
  WORKFLOW_LIBRARY,
  WORKFLOW_LIBRARY_COUNT,
  FEATURED_WORKFLOW_SIMULATION,
  assignedWorkflowsForPersona,
  getTrainingAssignments,
  getPersona,
} from '../app/journey/_data/fixtures';
import { CL_WF_26_DEFINITION, validateStage, completionPreview } from '../app/journey/_data/workflowTraining';

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

console.log('Advanced Training strict projection (§3/§4)');
const ADV_ROLES = ['PT', 'RN', 'DON', 'ADM'];
const ADV_HIDDEN = ['LVN', 'HHA', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'GAO'];
const ADV_EXPECTED = ['cms-485', 'qapi', 'oasis-e2-soc', 'documentation-matters'];
check('ADVANCED_TRAINING_MODULE_IDS is exactly the 4 modules in order',
  ADVANCED_TRAINING_MODULE_IDS.join(',') === ADV_EXPECTED.join(','));
check('Advanced visible with exactly 4 ordered modules for PT/RN/DON/ADM',
  ADV_ROLES.every((r) => {
    const v = getAdvancedTraining(r);
    return v.visible && v.modules.length === 4 && v.modules.map((m) => m.id).join(',') === ADV_EXPECTED.join(',');
  }));
check('Advanced hidden (0 modules) for all non-Advanced roles',
  ADV_HIDDEN.every((r) => { const v = getAdvancedTraining(r); return !v.visible && v.modules.length === 0; }));
check('every Advanced card launches a canonical player route',
  getAdvancedTraining('RN').modules.every((m) => m.playerAvailable && !!m.launchRef));

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

console.log('Mandated workflow library (§2/§3/§4/§5)');
check('workflow catalog generated from canonical registry (206 workflows)', WORKFLOW_LIBRARY_COUNT === 206, `got ${WORKFLOW_LIBRARY_COUNT}`);
check('CL-WF-26 IS a canonical workflow in the registry-backed catalog',
  WORKFLOW_LIBRARY.some((w) => w.id === 'CL-WF-26'));
check('featured simulation is training-namespaced and teaches canonical CL-WF-26',
  FEATURED_WORKFLOW_SIMULATION.id === 'TRAIN-CL-WF-26' && FEATURED_WORKFLOW_SIMULATION.teaches_workflow_id === 'CL-WF-26');
check('all 10 workflow domains present in the catalog',
  new Set(WORKFLOW_LIBRARY.map((w) => w.domain)).size === 10);
const officeWf = getTrainingAssignments(getPersona('jamie-office')).filter((a) => a.category === 'Workflows');
check('general office employee is NOT assigned the enterprise library (only the featured sim)',
  officeWf.length === 1 && officeWf[0].id === 'TRAIN-CL-WF-26', `got ${officeWf.length} workflow cards`);
const rnWf = getTrainingAssignments(getPersona('taylor-rn')).filter((a) => a.category === 'Workflows');
check('RN workflow set is role-scoped (featured + Clinical only), not all 166',
  rnWf.length > 1 && rnWf.length < WORKFLOW_LIBRARY_COUNT &&
  rnWf.filter((a) => a.id !== 'TRAIN-CL-WF-26').every((a) => a.workflowDomain === 'Clinical'));
check('every workflow card has a real primary action href (no toast-only)',
  rnWf.every((a) => typeof a.href === 'string' && a.href.length > 0) &&
  officeWf.every((a) => typeof a.href === 'string' && a.href.length > 0));
check('assigned workflow cards link to a real detail/simulation route',
  rnWf.every((a) => a.href!.startsWith('/journey/workflows/') || a.href === FEATURED_WORKFLOW_SIMULATION.href));
check('ADM gets governance/ops/compliance/finance domains (not clinical)',
  assignedWorkflowsForPersona(getPersona('riley-administrator')).every((w) =>
    ['Governance', 'Operations', 'Compliance', 'Finance'].includes(w.domain)));

console.log('CL-WF-26 gated simulation (§7)');
{
  const empty: Record<string, 'NOT_STARTED'> = {};
  for (const s of CL_WF_26_DEFINITION.stages) empty[s.id] = 'NOT_STARTED';
  const openedNothing = completionPreview(CL_WF_26_DEFINITION, empty as never);
  check('opening stages without input yields 0% (cannot jump to 100%)', openedNothing.percent === 0 && openedNothing.allValid === false);

  const last = CL_WF_26_DEFINITION.stages[CL_WF_26_DEFINITION.stages.length - 1];
  check('final stage is NOT valid with no input (gate blocks advancement)',
    validateStage(last, {}).status !== 'VALID');

  // Fully satisfy every stage → then and only then allValid is true.
  const filled: Record<string, Record<string, unknown>> = {};
  for (const s of CL_WF_26_DEFINITION.stages) {
    filled[s.id] = {};
    for (const f of s.fields) {
      filled[s.id][f.id] = f.kind === 'multiselect' ? [f.options![0].value]
        : f.kind === 'checkbox' ? true
        : f.kind === 'select' || f.kind === 'radiogroup' ? f.options![0].value
        : 'x';
    }
  }
  const allStatuses: Record<string, 'VALID'> = {} as never;
  let allValidComputed = true;
  for (const s of CL_WF_26_DEFINITION.stages) {
    const st = validateStage(s, filled[s.id] as never).status;
    (allStatuses as Record<string, string>)[s.id] = st;
    if (st !== 'VALID') allValidComputed = false;
  }
  check('every stage becomes VALID only when its required inputs are satisfied', allValidComputed);
  check('completion is 100% only when all six stages are VALID',
    completionPreview(CL_WF_26_DEFINITION, allStatuses as never).allValid === true);
}

console.log('');
if (failures > 0) {
  console.error(`FAILED — ${failures} invariant(s) broken.`);
  process.exit(1);
}
console.log('All journey-correction invariants hold.');
