/* ═══════════════════════════════════════════════════════════════
   auditJourneyMappings.ts — human-readable summary of _generated/

   Run with:
     npx tsx --tsconfig ../../tsconfig.json scripts/auditJourneyMappings.ts

   (wired as `npm run journey:map:audit`). Writes a markdown report to
   REVIEW_OUTPUTS/employee-journey-mapping/JOURNEY_MAPPING_AUDIT.md.
   Never modifies policy or app source — read + report only.
   ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(APP_ROOT, 'app/journey/_generated');
const REPORT_DIR = path.join(APP_ROOT, 'REVIEW_OUTPUTS/employee-journey-mapping');
const REPORT_PATH = path.join(REPORT_DIR, 'JOURNEY_MAPPING_AUDIT.md');

function load<T = unknown>(fileName: string): Promise<T> {
  return import(pathToFileURL(path.join(OUT_DIR, fileName)).href) as Promise<T>;
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'journeySourceManifest.generated.json'), 'utf8'));
  const { MODULE_CATALOG } = await load<{ MODULE_CATALOG: any[] }>('moduleCatalog.generated.ts');
  const { MODULE_PLAYER_MAP } = await load<{ MODULE_PLAYER_MAP: any[] }>('modulePlayerMap.generated.ts');
  const { MODULE_ASSIGNMENT_MAP } = await load<{ MODULE_ASSIGNMENT_MAP: any[] }>('moduleAssignmentMap.generated.ts');
  const { POLICY_CATALOG } = await load<{ POLICY_CATALOG: any[] }>('policyCatalog.generated.ts');
  const { POLICY_ASSIGNMENT_MAP } = await load<{ POLICY_ASSIGNMENT_MAP: any[] }>('policyAssignmentMap.generated.ts');
  const { POLICY_QUIZ_MAP } = await load<{ POLICY_QUIZ_MAP: any[] }>('policyQuizMap.generated.ts');
  const { APPENDIX_FORM_CROSSWALK } = await load<{ APPENDIX_FORM_CROSSWALK: any[] }>('appendixFormCrosswalk.generated.ts');
  const { APPENDIX_FORMS } = await load<{ APPENDIX_FORMS: any[] }>('appendixForms.generated.ts');
  const { ANNUAL_ASSIGNMENT_MAP, ACHC_CLINICAL_AUDIENCE } = await load<{ ANNUAL_ASSIGNMENT_MAP: any[]; ACHC_CLINICAL_AUDIENCE: string[] }>('annualAssignmentMap.generated.ts');
  const { ADVANCED_ASSIGNMENT_MAP } = await load<{ ADVANCED_ASSIGNMENT_MAP: any[] }>('advancedAssignmentMap.generated.ts');

  const needsReview = POLICY_CATALOG.filter((p) => p.policyRefStatus !== 'verified');
  const unavailableModules = MODULE_PLAYER_MAP.filter((m) => m.playerType === 'UNAVAILABLE');
  const reviewRequiredAppendices = APPENDIX_FORM_CROSSWALK.filter((e) => e.classification === 'FORM_MAPPING_REVIEW_REQUIRED');
  const heldAssignments = POLICY_ASSIGNMENT_MAP.filter((a) => a.blocked);
  const draftQuizBundles = POLICY_QUIZ_MAP.filter((q) => q.bankStatus === 'DRAFT_REVIEW_REQUIRED');
  const missingQuizBundles = POLICY_QUIZ_MAP.filter((q) => q.bankStatus === 'MISSING');

  const lines: string[] = [];
  lines.push('# Journey Mapping Pipeline — Audit Summary');
  lines.push('');
  lines.push(`Generated: ${manifest.generatedAt} (schema v${manifest.schemaVersion}, source branch \`${manifest.sourceBranch}\`)`);
  lines.push('');
  lines.push('This is a read-only summary of `app/journey/_generated/*`. It does not modify policy bodies, modules, or forms.');
  lines.push('');

  lines.push('## Record counts');
  lines.push('');
  lines.push('| Artifact | Count |');
  lines.push('| --- | --- |');
  lines.push(`| Training modules (moduleCatalog) | ${MODULE_CATALOG.length} |`);
  lines.push(`| Module player entries | ${MODULE_PLAYER_MAP.length} |`);
  lines.push(`| Roles with assignment maps | ${MODULE_ASSIGNMENT_MAP.length} |`);
  lines.push(`| Unique policies (policyCatalog) | ${POLICY_CATALOG.length} |`);
  lines.push(`| Policy assignment records (incl. General inheritance) | ${POLICY_ASSIGNMENT_MAP.length} |`);
  lines.push(`| Course quiz bundles | ${POLICY_QUIZ_MAP.length} |`);
  lines.push(`| EvidenceAppendix keys classified | ${APPENDIX_FORM_CROSSWALK.length} |`);
  lines.push(`| Forms baked (appendixForms) | ${APPENDIX_FORMS.length} |`);
  lines.push(`| Annual/DRILL/COMP modules mapped | ${ANNUAL_ASSIGNMENT_MAP.length} |`);
  lines.push(`| ACHC clinical audience size | ${ACHC_CLINICAL_AUDIENCE.length} |`);
  lines.push(`| Advanced portal modules | ${ADVANCED_ASSIGNMENT_MAP.length} |`);
  lines.push('');

  lines.push('## Module player availability');
  lines.push('');
  const playerCounts: Record<string, number> = {};
  for (const m of MODULE_PLAYER_MAP) playerCounts[m.playerType] = (playerCounts[m.playerType] ?? 0) + 1;
  lines.push('| playerType | count |');
  lines.push('| --- | --- |');
  for (const [k, v] of Object.entries(playerCounts)) lines.push(`| ${k} | ${v} |`);
  lines.push('');
  if (unavailableModules.length) {
    lines.push(`### REVIEW_REQUIRED — ${unavailableModules.length} module(s) with NO player wired in the main app`);
    lines.push('');
    for (const m of unavailableModules) lines.push(`- \`${m.moduleId}\` — ${m.note}`);
    lines.push('');
  }

  lines.push('## Policy resolution');
  lines.push('');
  const policyCounts: Record<string, number> = {};
  for (const p of POLICY_CATALOG) policyCounts[p.policyRefStatus] = (policyCounts[p.policyRefStatus] ?? 0) + 1;
  lines.push('| policyRefStatus | count |');
  lines.push('| --- | --- |');
  for (const [k, v] of Object.entries(policyCounts)) lines.push(`| ${k} | ${v} |`);
  lines.push('');
  if (needsReview.length) {
    lines.push(`### REVIEW_REQUIRED — ${needsReview.length} polic${needsReview.length === 1 ? 'y' : 'ies'} not fully verified`);
    lines.push('');
    lines.push('| policyId | status |');
    lines.push('| --- | --- |');
    for (const p of needsReview) lines.push(`| ${p.policyId} | ${p.policyRefStatus} |`);
    lines.push('');
  }

  lines.push('## Held / blocked policy assignments (must not be published)');
  lines.push('');
  lines.push(`${heldAssignments.length} assignment record(s) carry \`blocked: true\` (Assignment type = Hold, or Release status = Hold).`);
  lines.push('');

  lines.push('## Appendix -> form crosswalk');
  lines.push('');
  lines.push('| appendixKey | classification | formIds |');
  lines.push('| --- | --- | --- |');
  for (const e of APPENDIX_FORM_CROSSWALK) lines.push(`| ${e.appendixKey} | ${e.classification} | ${e.formIds.join(', ') || '—'} |`);
  lines.push('');
  if (reviewRequiredAppendices.length) {
    lines.push(`### REVIEW_REQUIRED — ${reviewRequiredAppendices.length} appendix key(s) with no exact form match`);
    lines.push('');
    for (const e of reviewRequiredAppendices) lines.push(`- \`${e.appendixKey}\` (${e.label}) — ${e.note}`);
    lines.push('');
  }

  lines.push('## Quiz bundles');
  lines.push('');
  lines.push(`${draftQuizBundles.length} bundle(s) DRAFT_REVIEW_REQUIRED (pilot sample only), ${missingQuizBundles.length} MISSING (no approved bank — UI must block completion).`);
  lines.push('');

  lines.push('## ACHC annual training audience');
  lines.push('');
  lines.push(`ACHC_CLINICAL_AUDIENCE = [${ACHC_CLINICAL_AUDIENCE.join(', ')}] applied uniformly to all 12 ACHC-ART modules (fixes the raw modules.ts M04/M07/M09 \`roles:'ALL'\` leak and the field-worker set that previously omitted DON).`);
  lines.push('');

  lines.push('## Advanced portal audience');
  lines.push('');
  lines.push('| moduleId | canonical | ownerAdded | effective |');
  lines.push('| --- | --- | --- | --- |');
  for (const m of ADVANCED_ASSIGNMENT_MAP) lines.push(`| ${m.moduleId} | ${m.canonical.join(',')} | ${m.ownerAdded.join(',') || '—'} | ${m.effective.join(',')} |`);
  lines.push('');

  lines.push('## Unresolved / gaps carried in the manifest');
  lines.push('');
  lines.push('```json');
  lines.push(JSON.stringify(manifest.unresolved, null, 2));
  lines.push('```');
  lines.push('');

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n', 'utf8');
  console.log('[journey:map:audit] wrote', REPORT_PATH);
}

main();
