/* ═══════════════════════════════════════════════════════════════
   verifyJourneyMappings.ts — drift + integrity gate for _generated/

   Run with:
     npx tsx --tsconfig ../../tsconfig.json scripts/verifyJourneyMappings.ts

   (wired as `npm run journey:map:verify`). Exits non-zero on ANY failure.
   ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Canonical source, imported directly so verify can cross-check the
// generated snapshot against the live main-app catalog (drift detector).
import { ALL_MODULES } from '../../../src/policy/journey/data/modules';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(APP_ROOT, '../..');
const OUT_DIR = path.join(APP_ROOT, 'app/journey/_generated');

const failures: string[] = [];
const warnings: string[] = [];

function fail(msg: string) {
  failures.push(msg);
}
function warn(msg: string) {
  warnings.push(msg);
}

function sha256File(absPath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(absPath)).digest('hex');
}

// ── 1. Manifest presence + drift check ──────────────────────────
const manifestPath = path.join(OUT_DIR, 'journeySourceManifest.generated.json');
if (!fs.existsSync(manifestPath)) {
  fail(`Missing ${manifestPath}. Run journey:map:generate first.`);
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  for (const entry of [...manifest.matrixInputs, ...manifest.canonicalSourceInputs]) {
    const abs = path.join(REPO_ROOT, entry.path);
    if (!fs.existsSync(abs)) {
      fail(`Manifest references missing input file: ${entry.path}`);
      continue;
    }
    const current = sha256File(abs);
    if (current !== entry.sha256) {
      fail(`DRIFT: ${entry.path} has changed since last generate (sha256 mismatch). Re-run journey:map:generate.`);
    }
  }

  // ── 2. Canonical module count parity ──
  if (manifest.counts.modules !== ALL_MODULES.length) {
    fail(`Module count drift: manifest says ${manifest.counts.modules}, live ALL_MODULES has ${ALL_MODULES.length}.`);
  }
}

// ── 3. Duplicate id / one-appearance checks ──────────────────────
function loadGenerated<T = unknown>(fileName: string): Promise<T> {
  return import(pathToFileURL(path.join(OUT_DIR, fileName)).href) as Promise<T>;
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fail(`_generated directory missing: ${OUT_DIR}`);
    reportAndExit();
    return;
  }

  const requiredFiles = [
    'journeySourceManifest.generated.json',
    'sharedTypes.generated.ts',
    'moduleCatalog.generated.ts',
    'modulePlayerMap.generated.ts',
    'moduleAssignmentMap.generated.ts',
    'policyCatalog.generated.ts',
    'policyAssignmentMap.generated.ts',
    'policyQuizMap.generated.ts',
    'appendixFormCrosswalk.generated.ts',
    'appendixForms.generated.ts',
    'annualAssignmentMap.generated.ts',
    'advancedAssignmentMap.generated.ts',
  ];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(OUT_DIR, f))) fail(`Missing generated file: ${f}`);
  }
  if (failures.length > 0) {
    reportAndExit();
    return;
  }

  const moduleCatalogMod = await loadGenerated<{ MODULE_CATALOG: { id: string }[] }>('moduleCatalog.generated.ts');
  const modulePlayerMapMod = await loadGenerated<{ MODULE_PLAYER_MAP: { moduleId: string; playerType: string }[] }>('modulePlayerMap.generated.ts');
  const moduleAssignmentMapMod = await loadGenerated<{ MODULE_ASSIGNMENT_MAP: { role: string; allModuleIds: string[] }[] }>('moduleAssignmentMap.generated.ts');
  const policyCatalogMod = await loadGenerated<{ POLICY_CATALOG: { policyId: string; policyRefStatus: string }[] }>('policyCatalog.generated.ts');
  const policyAssignmentMapMod = await loadGenerated<{ POLICY_ASSIGNMENT_MAP: { assignmentId: string; policyId: string; pathway: string; blocked: boolean }[] }>('policyAssignmentMap.generated.ts');
  const appendixCrosswalkMod = await loadGenerated<{ APPENDIX_FORM_CROSSWALK: { appendixKey: string; classification: string; formIds: string[] }[] }>('appendixFormCrosswalk.generated.ts');
  const appendixFormsMod = await loadGenerated<{ APPENDIX_FORMS: { id: string }[] }>('appendixForms.generated.ts');
  const annualMapMod = await loadGenerated<{ ANNUAL_ASSIGNMENT_MAP: { moduleId: string; family: string; audience: string[] }[]; ACHC_CLINICAL_AUDIENCE: string[] }>('annualAssignmentMap.generated.ts');
  const advancedMapMod = await loadGenerated<{ ADVANCED_ASSIGNMENT_MAP: { moduleId: string; canonical: string[]; effective: string[] }[] }>('advancedAssignmentMap.generated.ts');

  // ── every canonical module appears exactly once ──
  const catalogIds = moduleCatalogMod.MODULE_CATALOG.map((m) => m.id);
  const catalogIdSet = new Set(catalogIds);
  if (catalogIds.length !== catalogIdSet.size) {
    const seen = new Set<string>();
    const dupes = new Set<string>();
    for (const id of catalogIds) {
      if (seen.has(id)) dupes.add(id);
      seen.add(id);
    }
    fail(`Duplicate module ids in moduleCatalog.generated.ts: ${[...dupes].join(', ')}`);
  }
  const canonicalIds = new Set(ALL_MODULES.map((m) => m.id));
  for (const id of canonicalIds) {
    if (!catalogIdSet.has(id)) fail(`Canonical module "${id}" missing from generated moduleCatalog.`);
  }
  for (const id of catalogIdSet) {
    if (!canonicalIds.has(id)) fail(`Generated moduleCatalog has an id "${id}" not present in canonical ALL_MODULES.`);
  }

  // ── modulePlayerMap covers every module exactly once ──
  const playerIds = modulePlayerMapMod.MODULE_PLAYER_MAP.map((e) => e.moduleId);
  if (new Set(playerIds).size !== playerIds.length) fail('Duplicate ids in modulePlayerMap.generated.ts.');
  if (playerIds.length !== catalogIds.length) fail(`modulePlayerMap has ${playerIds.length} entries, expected ${catalogIds.length}.`);

  // ── moduleAssignmentMap covers all 11 roles ──
  const EXPECTED_ROLES = ['ADM', 'DON', 'RN', 'LVN', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'HHA'];
  const gotRoles = moduleAssignmentMapMod.MODULE_ASSIGNMENT_MAP.map((r) => r.role);
  for (const r of EXPECTED_ROLES) if (!gotRoles.includes(r)) fail(`moduleAssignmentMap missing role "${r}".`);

  // ── every policy assignment resolves a policyId present in policyCatalog ──
  const policyIdsInCatalog = new Set(policyCatalogMod.POLICY_CATALOG.map((p) => p.policyId));
  let unresolvedAssignments = 0;
  for (const a of policyAssignmentMapMod.POLICY_ASSIGNMENT_MAP) {
    if (!a.policyId || !policyIdsInCatalog.has(a.policyId)) {
      unresolvedAssignments++;
      fail(`Policy assignment "${a.assignmentId}" references policyId "${a.policyId}" not present in policyCatalog.`);
    }
  }
  const heldCount = policyAssignmentMapMod.POLICY_ASSIGNMENT_MAP.filter((a) => a.blocked).length;
  if (heldCount === 0) warn('No policy assignments are flagged blocked:true — verify this is expected (Hold rows exist in the source matrix).');

  // ── every EvidenceAppendix key has a classification ──
  const EXPECTED_APPENDIX_KEYS = ['F', 'A', 'B', 'HRTA005_A', 'HRTA005_B', 'HRTA005_D', 'HRTA005_E', 'HRTD003_A', 'HRTD003_C', 'HRTD003_D', 'HRTD003_E', 'HRER001_C', 'HRTD001_B', 'HRTD005_B', 'NONE'];
  const gotAppendixKeys = new Set(appendixCrosswalkMod.APPENDIX_FORM_CROSSWALK.map((e) => e.appendixKey));
  for (const k of EXPECTED_APPENDIX_KEYS) if (!gotAppendixKeys.has(k)) fail(`appendixFormCrosswalk missing classification for EvidenceAppendix key "${k}".`);

  // every formId referenced by the crosswalk must have baked FormContent
  const bakedFormIds = new Set(appendixFormsMod.APPENDIX_FORMS.map((f) => f.id));
  for (const e of appendixCrosswalkMod.APPENDIX_FORM_CROSSWALK) {
    for (const fid of e.formIds) {
      if (!bakedFormIds.has(fid)) fail(`appendixForms.generated.ts is missing baked FormContent for "${fid}" (referenced by appendix "${e.appendixKey}").`);
    }
  }

  // ── ACHC audience excludes non-clinical / office roles and ADM as primary ──
  const achcAudience = annualMapMod.ACHC_CLINICAL_AUDIENCE;
  const EXPECTED_ACHC_AUDIENCE = ['DON', 'RN', 'LVN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW'];
  if (achcAudience.includes('ADM' as any)) fail('ACHC_CLINICAL_AUDIENCE must not include ADM as a primary audience member.');
  if (achcAudience.includes('GB' as any) || achcAudience.includes('General' as any) || achcAudience.includes('GEN' as any)) {
    fail('ACHC_CLINICAL_AUDIENCE must not include GB/General/GEN (office/administrative pathway).');
  }
  const achcSorted = [...achcAudience].sort();
  const expectedSorted = [...EXPECTED_ACHC_AUDIENCE].sort();
  if (JSON.stringify(achcSorted) !== JSON.stringify(expectedSorted)) {
    fail(`ACHC_CLINICAL_AUDIENCE mismatch. Expected [${expectedSorted.join(',')}], got [${achcSorted.join(',')}].`);
  }
  const achcModules = annualMapMod.ANNUAL_ASSIGNMENT_MAP.filter((m) => m.family === 'ACHC-ART');
  if (achcModules.length !== 12) fail(`Expected 12 ACHC-ART modules in annualAssignmentMap, found ${achcModules.length}.`);
  for (const m of achcModules) {
    const sorted = [...m.audience].sort();
    if (JSON.stringify(sorted) !== JSON.stringify(expectedSorted)) {
      fail(`ACHC module "${m.moduleId}" audience does not match ACHC_CLINICAL_AUDIENCE exactly.`);
    }
  }

  // ── advanced modules: minimum audience is a floor, canonical never dropped ──
  for (const m of advancedMapMod.ADVANCED_ASSIGNMENT_MAP) {
    for (const r of m.canonical) {
      if (!m.effective.includes(r)) fail(`Advanced module "${m.moduleId}" dropped canonical role "${r}" from effective audience.`);
    }
    for (const r of ['PT', 'RN', 'DON', 'ADM']) {
      if (!m.effective.includes(r)) fail(`Advanced module "${m.moduleId}" effective audience missing minimum role "${r}".`);
    }
  }
  if (advancedMapMod.ADVANCED_ASSIGNMENT_MAP.length !== 4) fail(`Expected 4 advanced modules, found ${advancedMapMod.ADVANCED_ASSIGNMENT_MAP.length}.`);

  reportAndExit();
}

function reportAndExit() {
  console.log(`[journey:map:verify] ${failures.length} failure(s), ${warnings.length} warning(s).`);
  if (warnings.length) {
    console.log('\nWARNINGS:');
    for (const w of warnings) console.log('  - ' + w);
  }
  if (failures.length) {
    console.log('\nFAILURES:');
    for (const f of failures) console.log('  - ' + f);
    process.exitCode = 1;
  } else {
    console.log('OK — journey mapping generated artifacts are internally consistent and match live canonical sources.');
  }
}

main();
