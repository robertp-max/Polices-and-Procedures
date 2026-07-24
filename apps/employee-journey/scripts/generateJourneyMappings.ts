/* ═══════════════════════════════════════════════════════════════
   generateJourneyMappings.ts — BUILD-TIME PIPELINE (run via tsx)

   Reads:
     - the xlsx-derived matrix (REVIEW_OUTPUTS/employee-journey-mapping/_sources/matrix/*.aoa.json)
     - the main-app canonical sources (../../../src/policy/**) via RELATIVE import
       (never imported from journey UI at runtime — see app/journey/_generated/README below)

   Writes (deterministic, re-runnable):
     apps/employee-journey/app/journey/_generated/*.generated.{ts,json}

   Usage (from apps/employee-journey, tsconfig must resolve the main app's
   @ alias so the imported canonical files can resolve their OWN internal
   "@/policy/..." imports — that requires the ROOT tsconfig, not this app's):

     npx tsx --tsconfig ../../tsconfig.json scripts/generateJourneyMappings.ts

   (wired as `npm run journey:map:generate`).
   ═══════════════════════════════════════════════════════════════ */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

import {
  readCourseCatalog,
  readPolicyAssignments,
  readRolePolicyMatrix,
  readPathwaySummary,
  readReleaseBlockers,
  readAllPolicyReview,
  readSourcesMethod,
  ROLE_MATRIX_COLUMNS,
  type CourseCatalogRow,
  type PolicyAssignmentRow,
  type RolePolicyMatrixRow,
  type RoleMatrixColumn,
} from './lib/matrixReader';

// ── Canonical main-app sources (relative import — see ARCHITECTURE note in task) ──
import { ALL_MODULES, modulesForRole } from '../../../src/policy/journey/data/modules';
import type { JourneyModule, JourneyRole, EvidenceAppendix } from '../../../src/policy/journey/types/journey';
import { resolvePolicyId, getPolicyTextForReading } from '../../../src/policy/journey/policyReading/policyResolver';
import { getCorpusPolicy } from '../../../src/policy/data/policyCorpus';
import { FORMS_DATASET } from '../../../src/policy/data/formsLibraryDataset';
import { buildFormContent } from '../../../src/policy/data/formsLibraryContent';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.resolve(__dirname, '..'); // apps/employee-journey
const REPO_ROOT = path.resolve(APP_ROOT, '../..');
const MATRIX_DIR = path.join(APP_ROOT, 'REVIEW_OUTPUTS/employee-journey-mapping/_sources/matrix');
const OUT_DIR = path.join(APP_ROOT, 'app/journey/_generated');
const SOURCE_BRANCH = 'feature/governing-body-portal';
const SCHEMA_VERSION = '1.0.0';

fs.mkdirSync(OUT_DIR, { recursive: true });

function sha256File(absPath: string): string {
  const buf = fs.readFileSync(absPath);
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function relFromRepoRoot(absPath: string): string {
  return path.relative(REPO_ROOT, absPath).split(path.sep).join('/');
}

const GENERATED_HEADER = (fileLabel: string, extra: string[] = []) => `/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: ${fileLabel}
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: ${SOURCE_BRANCH}
   Schema version: ${SCHEMA_VERSION}
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
${extra.map((l) => '   ' + l).join('\n')}
   ═══════════════════════════════════════════════════════════════ */
`;

function writeGeneratedTs(fileName: string, header: string, body: string) {
  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, header + '\n' + body + '\n', 'utf8');
  return outPath;
}

function writeGeneratedJson(fileName: string, data: unknown) {
  const outPath = path.join(OUT_DIR, fileName);
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  return outPath;
}

// ═══════════════════════════════════════════════════════════════
// 0. LOAD MATRIX + INPUT HASHES
// ═══════════════════════════════════════════════════════════════

const courseCatalog: CourseCatalogRow[] = readCourseCatalog(MATRIX_DIR);
const policyAssignments: PolicyAssignmentRow[] = readPolicyAssignments(MATRIX_DIR);
const rolePolicyMatrix: RolePolicyMatrixRow[] = readRolePolicyMatrix(MATRIX_DIR);
const pathwaySummary = readPathwaySummary(MATRIX_DIR);
const releaseBlockers = readReleaseBlockers(MATRIX_DIR);
const allPolicyReview = readAllPolicyReview(MATRIX_DIR);
const sourcesMethod = readSourcesMethod(MATRIX_DIR);

const MATRIX_INPUT_FILES = [
  'Course_Catalog.aoa.json',
  'Policy_Assignments.aoa.json',
  'Role_Policy_Matrix.aoa.json',
  'Pathway_Summary.aoa.json',
  'Release_Blockers.aoa.json',
  'All_Policy_Review.aoa.json',
  'Sources_Method.aoa.json',
];

const CANONICAL_SOURCE_FILES = [
  path.resolve(REPO_ROOT, 'src/policy/journey/data/modules.ts'),
  path.resolve(REPO_ROOT, 'src/policy/journey/types/journey.ts'),
  path.resolve(REPO_ROOT, 'src/policy/journey/policyReading/policyResolver.ts'),
  path.resolve(REPO_ROOT, 'src/policy/data/allPoliciesContent.generated.ts'),
  path.resolve(REPO_ROOT, 'src/policy/data/policyCorpus.ts'),
  path.resolve(REPO_ROOT, 'src/policy/data/formsLibraryDataset.ts'),
  path.resolve(REPO_ROOT, 'src/policy/data/formsLibraryContent.ts'),
];

// ═══════════════════════════════════════════════════════════════
// 0b. sharedTypes.generated.ts
// The journey app must import ONLY from _generated at runtime — it cannot
// reach across to the main app's src/policy/** (separate app/deployment).
// This file mirrors the small, stable canonical type shapes (JourneyRole,
// EvidenceAppendix, FormContent + its sub-types) so every OTHER generated
// file can stay self-contained within _generated/ instead of importing
// type-only from the main app (which would resolve to a nonexistent path
// once copied into this app's own module graph for type-checking tools).
// ═══════════════════════════════════════════════════════════════

writeGeneratedTs(
  'sharedTypes.generated.ts',
  GENERATED_HEADER('sharedTypes.generated.ts', [
    'Mirrors src/policy/journey/types/journey.ts (JourneyRole, EvidenceAppendix)',
    'and src/policy/data/formsLibraryContent.ts (FormField/FormSection/FormContent/etc).',
    'Kept in sync manually when the canonical shapes change (they are stable enums/interfaces).',
  ]),
  `export type JourneyRole = 'ADM' | 'DON' | 'RN' | 'LVN' | 'PT' | 'PTA' | 'OT' | 'COTA' | 'SLP' | 'MSW' | 'HHA';

export type EvidenceAppendix =
  | 'F' | 'A' | 'B'
  | 'HRTA005_A' | 'HRTA005_B' | 'HRTA005_D' | 'HRTA005_E'
  | 'HRTD003_A' | 'HRTD003_C' | 'HRTD003_D' | 'HRTD003_E'
  | 'HRER001_C' | 'HRTD001_B' | 'HRTD005_B'
  | 'NONE';

export type FieldType = 'text' | 'date' | 'select' | 'checkbox' | 'radio' | 'textarea' | 'number' | 'signature' | 'email' | 'tel';

export interface FormField {
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  col?: 1 | 2 | 3 | 4;
  placeholder?: string;
  help?: string;
}

export type SectionLayout = 'grid' | 'table' | 'checklist' | 'attestation' | 'narrative' | 'matrix' | 'signature' | 'image';

export interface FormSection {
  title: string;
  description?: string;
  layout: SectionLayout;
  fields?: FormField[];
  columns?: string[];
  rowCount?: number;
  items?: string[];
  body?: string;
  acknowledgments?: string[];
  matrixRows?: string[];
  matrixCols?: string[];
  sectionAck?: boolean;
  image?: { src: string; alt?: string; caption?: string };
}

export interface FormSignerSlot {
  field_id: string;
  role: string;
  tier: number;
  required: boolean;
  resolver: string | { role_id: string };
  sequence_group: number;
}

export interface SignatureBlock {
  role: string;
  includeName?: boolean;
  includeTitle?: boolean;
  includeDate?: boolean;
}

export interface FormContent {
  id: string;
  title: string;
  type: string;
  domainCode: string;
  policies: string[];
  purpose: string;
  instructions: string;
  version: string;
  effectiveDate: string;
  revisionDate: string;
  orientation: 'portrait' | 'landscape';
  sections: FormSection[];
  signatures?: SignatureBlock[];
  signerSlots?: FormSignerSlot[];
  footerNotes?: string[];
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 1. moduleCatalog.generated.ts
// ═══════════════════════════════════════════════════════════════

type ModuleFamily =
  | 'GAO' | 'ADM' | 'DON' | 'RN' | 'LVN' | 'PT' | 'PTA' | 'OT' | 'COTA' | 'SLP' | 'MSW' | 'HHA'
  | 'ANN' | 'COMP' | 'ACHC-ART' | 'ADV';

const ADV_IDS = new Set(['cms-485', 'qapi', 'oasis-e2-soc', 'documentation-matters']);

function deriveFamily(mod: JourneyModule): ModuleFamily {
  if (mod.id.toUpperCase().startsWith('ACHC-ART')) return 'ACHC-ART';
  if (ADV_IDS.has(mod.id)) return 'ADV';
  if (mod.group === 'ANN' || mod.group === 'DRILL') return 'ANN';
  if (mod.group === 'COMP') return 'COMP';
  if (mod.group === 'GAO') return 'GAO';
  const prefix = mod.id.split('-')[0];
  return prefix as ModuleFamily;
}

interface GeneratedModule {
  id: string;
  title: string;
  group: string;
  phase: string;
  week: number | null;
  roles: JourneyRole[] | 'ALL';
  policyRefs: string[];
  cmsRefs: string[];
  method: string;
  passThreshold: number | null;
  durationMinutes: number | null;
  prerequisites: string[];
  evidenceAppendix: EvidenceAppendix | null;
  supervisorSignature: boolean;
  family: ModuleFamily;
  supervisedVisitsRequired: number | null;
  annualQuarter: string | null;
}

const moduleCatalog: GeneratedModule[] = ALL_MODULES.map((m) => ({
  id: m.id,
  title: m.title,
  group: m.group,
  phase: m.phase,
  week: m.week ?? null,
  roles: m.roles,
  policyRefs: m.policyRefs,
  cmsRefs: m.cmsRefs,
  method: m.method,
  passThreshold: m.passThreshold ?? null,
  durationMinutes: m.durationMinutes ?? null,
  prerequisites: m.prerequisites ?? [],
  evidenceAppendix: m.evidenceAppendix ?? null,
  supervisorSignature: Boolean(m.supervisorSignature),
  family: deriveFamily(m),
  supervisedVisitsRequired: m.supervisedVisitsRequired ?? null,
  annualQuarter: m.annualQuarter ?? null,
}));

const familyCounts: Record<string, number> = {};
for (const m of moduleCatalog) familyCounts[m.family] = (familyCounts[m.family] ?? 0) + 1;

writeGeneratedTs(
  'moduleCatalog.generated.ts',
  GENERATED_HEADER('moduleCatalog.generated.ts', [
    `Source: src/policy/journey/data/modules.ts (ALL_MODULES, ${ALL_MODULES.length} records)`,
    `Family counts: ${JSON.stringify(familyCounts)}`,
  ]),
  `import type { JourneyRole, EvidenceAppendix } from './sharedTypes.generated';

export type ModuleFamily = ${(['GAO','ADM','DON','RN','LVN','PT','PTA','OT','COTA','SLP','MSW','HHA','ANN','COMP','ACHC-ART','ADV'] as const).map((f) => `'${f}'`).join(' | ')};

export interface GeneratedModule {
  id: string;
  title: string;
  group: string;
  phase: string;
  week: number | null;
  roles: JourneyRole[] | 'ALL';
  policyRefs: string[];
  cmsRefs: string[];
  method: string;
  passThreshold: number | null;
  durationMinutes: number | null;
  prerequisites: string[];
  evidenceAppendix: EvidenceAppendix | null;
  supervisorSignature: boolean;
  family: ModuleFamily;
  supervisedVisitsRequired: number | null;
  annualQuarter: string | null;
}

export const MODULE_CATALOG: GeneratedModule[] = ${JSON.stringify(moduleCatalog, null, 2)};

export function getGeneratedModule(id: string): GeneratedModule | undefined {
  return MODULE_CATALOG.find((m) => m.id === id);
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 2. modulePlayerMap.generated.ts
// ═══════════════════════════════════════════════════════════════
/*
 * Classification mirrors the EXACT dispatch order in
 * src/v6/screens/pageviews/ModulePlayerScreen.tsx (verified by reading
 * the file, not guessed) and the id-registries in
 * src/policy/journey/modules/{rn,adm,don,lvn,achc}/index.ts and
 * src/policy/journey/data/advancedTraining/advancedTrainingContract.ts +
 * src/policy/journey/components/advanced/oasisSocModule.ts.
 *
 * These id predicates are reimplemented here (not imported) because the
 * real registries transitively import React component trees with
 * bundler-only asset imports that cannot load under a plain tsx/Node
 * script. The pipeline records CLASSIFICATION + a same-tab launchRef;
 * it does not reimplement or duplicate the player UI itself.
 */

type PlayerType = 'STANDALONE_PLAYER' | 'CANONICAL_GENERIC_PLAYER' | 'EXTERNAL_CANONICAL_PLAYER' | 'UNAVAILABLE' | 'IDENTITY_MISMATCH';

function isRnStandalone(id: string): boolean {
  return /^RN-(00[1-9]|01[0-5])$/.test(id) || id === 'RN-SUP';
}
function isAdmStandalone(id: string): boolean {
  return /^ADM-(00[1-9]|01[0-5])$/.test(id);
}
function isDonStandalone(id: string): boolean {
  return /^DON-(00[1-9]|01[0-3])$/.test(id);
}
function isLvnStandalone(id: string): boolean {
  return /^LVN-(00[1-9]|01[0-2])$/.test(id) || id === 'LVN-SUP';
}
function isAchcStandalone(id: string): boolean {
  return /^ACHC-ART-M(0[1-9]|1[0-2])$/.test(id);
}
function isOasisSoc(id: string): boolean {
  return id === 'oasis-e2-soc';
}
function isAdvanced(id: string): boolean {
  return id === 'cms-485' || id === 'qapi' || id === 'documentation-matters';
}

interface ModulePlayerEntry {
  moduleId: string;
  playerType: PlayerType;
  playerAvailable: boolean;
  launchRef: string | null;
  note: string;
}

const modulePlayerMap: ModulePlayerEntry[] = ALL_MODULES.map((m) => {
  const id = m.id;
  if (isOasisSoc(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'OasisSocTrainingPanel (dispatched first, independent of advanced-training contract).' };
  }
  if (isAdvanced(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'AdvancedTrainingPlayer via isAdvancedModule/getAdvancedVariant.' };
  }
  if (isAchcStandalone(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'ACHC standalone PASS5 module (src/policy/journey/modules/achc).' };
  }
  if (isRnStandalone(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'RN standalone corrected module (src/policy/journey/modules/rn).' };
  }
  if (isAdmStandalone(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'ADM standalone corrected module (src/policy/journey/modules/adm).' };
  }
  if (isDonStandalone(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'DON standalone corrected module (src/policy/journey/modules/don).' };
  }
  if (isLvnStandalone(id)) {
    return { moduleId: id, playerType: 'STANDALONE_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'LVN standalone V5 module (src/policy/journey/modules/lvn).' };
  }
  // Remaining dispatch: courseModules in contentV2Adapter.ts excludes group === 'ANN'
  // (but NOT 'DRILL') and group === 'ADV'. Everything else gets a ModuleDef and
  // renders via the generic Module1OverviewPage / LessonPlayerPage contentV2 player.
  if (m.group === 'ANN') {
    return { moduleId: id, playerType: 'UNAVAILABLE', playerAvailable: false, launchRef: null, note: 'contentV2Adapter.ts courseModules filters out group==="ANN" (mappedCanonicalOnboardingModules excludes it) and no other registry covers this id; ModulePlayerScreen renders "Module content unavailable". Confirmed gap — not fixable from this app (main-app player wiring is out of scope for the journey pipeline).' };
  }
  return { moduleId: id, playerType: 'CANONICAL_GENERIC_PLAYER', playerAvailable: true, launchRef: `/journey/module/${id}`, note: 'Generic contentV2 lesson player (mappedCanonicalOnboardingModules / mappedACHCModules in contentV2Adapter.ts).' };
});

const playerTypeCounts: Record<string, number> = {};
for (const e of modulePlayerMap) playerTypeCounts[e.playerType] = (playerTypeCounts[e.playerType] ?? 0) + 1;

writeGeneratedTs(
  'modulePlayerMap.generated.ts',
  GENERATED_HEADER('modulePlayerMap.generated.ts', [
    `playerType counts: ${JSON.stringify(playerTypeCounts)}`,
    `EXTERNAL_CANONICAL_PLAYER and IDENTITY_MISMATCH are reserved enum members; 0 modules currently classify as either.`,
  ]),
  `export type PlayerType = 'STANDALONE_PLAYER' | 'CANONICAL_GENERIC_PLAYER' | 'EXTERNAL_CANONICAL_PLAYER' | 'UNAVAILABLE' | 'IDENTITY_MISMATCH';

export interface ModulePlayerEntry {
  moduleId: string;
  playerType: PlayerType;
  playerAvailable: boolean;
  /** Same-tab main-app route (react-router), or null when unavailable. */
  launchRef: string | null;
  note: string;
}

export const MODULE_PLAYER_MAP: ModulePlayerEntry[] = ${JSON.stringify(modulePlayerMap, null, 2)};

export function getModulePlayerEntry(id: string): ModulePlayerEntry | undefined {
  return MODULE_PLAYER_MAP.find((e) => e.moduleId === id);
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 3. moduleAssignmentMap.generated.ts
// ═══════════════════════════════════════════════════════════════

const ALL_ROLES: JourneyRole[] = ['ADM', 'DON', 'RN', 'LVN', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'HHA'];

interface RoleModuleAssignment {
  role: JourneyRole;
  primaryModuleIds: string[];
  secondaryModuleIds: string[];
  allModuleIds: string[];
}

const moduleAssignmentMap: RoleModuleAssignment[] = ALL_ROLES.map((role) => {
  const mods = modulesForRole(role);
  const primary = mods.filter((m) => m.roles !== 'ALL').map((m) => m.id);
  const secondary = mods.filter((m) => m.roles === 'ALL').map((m) => m.id);
  const all = Array.from(new Set([...primary, ...secondary]));
  return { role, primaryModuleIds: primary, secondaryModuleIds: secondary, allModuleIds: all };
});

writeGeneratedTs(
  'moduleAssignmentMap.generated.ts',
  GENERATED_HEADER('moduleAssignmentMap.generated.ts', [
    `Built from src/policy/journey/data/modules.ts modulesForRole(role); primary = role-specific (roles !== 'ALL'), secondary = shared (roles === 'ALL').`,
    ...ALL_ROLES.map((r) => {
      const rec = moduleAssignmentMap.find((x) => x.role === r)!;
      return `${r}: ${rec.allModuleIds.length} modules (${rec.primaryModuleIds.length} primary + ${rec.secondaryModuleIds.length} secondary)`;
    }),
  ]),
  `import type { JourneyRole } from './sharedTypes.generated';

export interface RoleModuleAssignment {
  role: JourneyRole;
  primaryModuleIds: string[];
  secondaryModuleIds: string[];
  allModuleIds: string[];
}

export const MODULE_ASSIGNMENT_MAP: RoleModuleAssignment[] = ${JSON.stringify(moduleAssignmentMap, null, 2)};

export function getModuleIdsForRole(role: JourneyRole): string[] {
  return MODULE_ASSIGNMENT_MAP.find((r) => r.role === role)?.allModuleIds ?? [];
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 4. policyCatalog.generated.ts
// ═══════════════════════════════════════════════════════════════

const referencedPolicyIds = Array.from(
  new Set([
    ...policyAssignments.map((r) => r.policyId),
    ...rolePolicyMatrix.map((r) => r.policyId),
  ].filter(Boolean)),
).sort();

interface GeneratedPolicySection {
  sectionId: string;
  title: string;
  text: string;
}

interface GeneratedPolicy {
  policyId: string;
  title: string | null;
  policyRefStatus: 'verified' | 'needs_review' | 'invalid';
  fullTextAvailable: boolean;
  sectionCount: number;
  versionDate: string | null;
  domainCode: string | null;
  subdomainCode: string | null;
  tier: string | null;
  ownerSteward: string | null;
  sections: GeneratedPolicySection[];
}

let verifiedCount = 0, needsReviewCount = 0, invalidCount = 0;

const policyCatalog: GeneratedPolicy[] = referencedPolicyIds.map((policyId) => {
  const resolution = resolvePolicyId(policyId);
  if (resolution.policyRefStatus === 'verified') verifiedCount++;
  else if (resolution.policyRefStatus === 'needs_review') needsReviewCount++;
  else invalidCount++;

  const corpus = getCorpusPolicy(policyId);
  let sections: GeneratedPolicySection[] = [];
  if (resolution.resolvedPolicyId) {
    const reading = getPolicyTextForReading(policyId);
    sections = reading.sections;
  }

  return {
    policyId,
    title: resolution.policyTitle,
    policyRefStatus: resolution.policyRefStatus,
    fullTextAvailable: resolution.fullTextAvailable,
    sectionCount: resolution.sectionCount,
    versionDate: resolution.policyVersionDate,
    domainCode: corpus?.domainCode ?? null,
    subdomainCode: corpus?.subdomainCode ?? null,
    tier: corpus?.tier ?? null,
    ownerSteward: corpus?.ownerSteward ?? null,
    sections,
  };
});

writeGeneratedTs(
  'policyCatalog.generated.ts',
  GENERATED_HEADER('policyCatalog.generated.ts', [
    `${referencedPolicyIds.length} unique policy IDs referenced across Policy_Assignments.aoa.json + Role_Policy_Matrix.aoa.json.`,
    `Resolved via src/policy/journey/policyReading/policyResolver.ts against src/policy/data/allPoliciesContent.generated.ts.`,
    `verified: ${verifiedCount} | needs_review: ${needsReviewCount} | invalid: ${invalidCount}`,
    `Policies with policyRefStatus !== 'verified' carry NO fabricated section text (sections: []).`,
  ]),
  `export interface GeneratedPolicySection {
  sectionId: string;
  title: string;
  text: string;
}

export interface GeneratedPolicy {
  policyId: string;
  title: string | null;
  policyRefStatus: 'verified' | 'needs_review' | 'invalid';
  fullTextAvailable: boolean;
  sectionCount: number;
  versionDate: string | null;
  domainCode: string | null;
  subdomainCode: string | null;
  tier: string | null;
  ownerSteward: string | null;
  sections: GeneratedPolicySection[];
}

export const POLICY_CATALOG: GeneratedPolicy[] = ${JSON.stringify(policyCatalog, null, 2)};

export function getGeneratedPolicy(policyId: string): GeneratedPolicy | undefined {
  return POLICY_CATALOG.find((p) => p.policyId === policyId);
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 5. policyAssignmentMap.generated.ts
// ═══════════════════════════════════════════════════════════════

const EMPLOYEE_PATHWAYS = ['LVN', 'RN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'ADM', 'DON']; // GB excluded from General inheritance

function matrixCellFor(policyId: string, column: RoleMatrixColumn): string {
  const row = rolePolicyMatrix.find((r) => r.policyId === policyId);
  return row ? row.cells[column] : '';
}

function inferTier(cellValue: string, pathway: string): string {
  if (cellValue === 'G') return 'TIER1';
  if (cellValue === 'R') return pathway === 'ADM' || pathway === 'DON' || pathway === 'GB' ? 'TIER4' : 'TIER3';
  if (cellValue === 'C') return 'TIER3';
  return 'UNSPECIFIED'; // '' or 'H' (Hold/correction required — not safe to assign a tier)
}

function relatedModuleIdsFor(policyId: string): string[] {
  return ALL_MODULES.filter((m) => m.policyRefs.some((ref) => ref === policyId || ref.startsWith(policyId + ' ') || ref.startsWith(policyId + ' §'))).map((m) => m.id);
}

interface GeneratedPolicyAssignment {
  assignmentId: string;
  pathway: string;
  policyId: string;
  policyTitle: string;
  courseId: string;
  courseTitle: string;
  assignmentType: string; // Core | Conditional | Hold
  tier: string;
  matrixCellValue: string;
  required: boolean;
  awarenessReferenceOnly: boolean;
  quizRequired: boolean;
  quizBundle: string;
  attestationRequired: boolean;
  initialDue: string;
  recurrence: string;
  releaseStatus: string;
  blocked: boolean;
  relatedModuleIds: string[];
  sourceMatrixRow: number;
  estMinutes: null;
  inherited: boolean;
  scopeRationale: string;
  internalSource: string;
  externalAuthorityUrl: string;
  sourceNotes: string;
}

function buildAssignment(row: PolicyAssignmentRow, pathwayOverride: string, inherited: boolean): GeneratedPolicyAssignment {
  const column = pathwayOverride as RoleMatrixColumn;
  const cellValue = ROLE_MATRIX_COLUMNS.includes(column) ? matrixCellFor(row.policyId, column) : '';
  return {
    assignmentId: `${pathwayOverride}__${row.courseId}__${row.policyId}`,
    pathway: pathwayOverride,
    policyId: row.policyId,
    policyTitle: row.policyTitle,
    courseId: row.courseId,
    courseTitle: row.quizBundle,
    assignmentType: row.assignmentType,
    tier: inferTier(cellValue, pathwayOverride),
    matrixCellValue: cellValue,
    required: row.assignmentType === 'Core',
    awarenessReferenceOnly: row.assignmentType === 'Conditional',
    quizRequired: row.scoredQuiz.startsWith('Yes'),
    quizBundle: row.quizBundle,
    attestationRequired: row.assignmentType !== 'Hold' && row.readFullPolicy === 'Yes',
    initialDue: row.initialDue,
    recurrence: row.recurrence,
    releaseStatus: row.releaseStatus,
    blocked: row.assignmentType === 'Hold' || row.releaseStatus === 'Hold',
    relatedModuleIds: relatedModuleIdsFor(row.policyId),
    sourceMatrixRow: row.sourceMatrixRow,
    estMinutes: null,
    inherited,
    scopeRationale: row.scopeRationale,
    internalSource: row.internalSource,
    externalAuthorityUrl: row.externalAuthorityUrl,
    sourceNotes: row.sourceNotes,
  };
}

const generalRows = policyAssignments.filter((r) => r.pathway === 'General');
const policyAssignmentMap: GeneratedPolicyAssignment[] = [];

for (const row of policyAssignments) {
  policyAssignmentMap.push(buildAssignment(row, row.pathway, false));
}
// Explicit General inheritance for every employee pathway except GB (GB does not inherit General).
for (const pathway of EMPLOYEE_PATHWAYS) {
  for (const row of generalRows) {
    policyAssignmentMap.push(buildAssignment(row, pathway, true));
  }
}

const assignmentCountsByPathway: Record<string, number> = {};
for (const a of policyAssignmentMap) assignmentCountsByPathway[a.pathway] = (assignmentCountsByPathway[a.pathway] ?? 0) + 1;

writeGeneratedTs(
  'policyAssignmentMap.generated.ts',
  GENERATED_HEADER('policyAssignmentMap.generated.ts', [
    `${policyAssignments.length} own-pathway rows + ${EMPLOYEE_PATHWAYS.length} x ${generalRows.length} inherited-General rows = ${policyAssignmentMap.length} total assignment records.`,
    `Inheritance: every employee pathway (${EMPLOYEE_PATHWAYS.join(', ')}) inherits the ${generalRows.length} General policy rows (inherited:true). GB does NOT inherit General (per Role_Policy_Matrix note).`,
    `tier inferred from Role_Policy_Matrix G/R/C/H cell for (policyId, pathway); '' or 'H' -> UNSPECIFIED (Hold/correction-required rows are never assigned a tier).`,
    `Counts by pathway: ${JSON.stringify(assignmentCountsByPathway)}`,
  ]),
  `export interface GeneratedPolicyAssignment {
  assignmentId: string;
  pathway: string;
  policyId: string;
  policyTitle: string;
  courseId: string;
  courseTitle: string;
  assignmentType: string;
  tier: string;
  matrixCellValue: string;
  required: boolean;
  awarenessReferenceOnly: boolean;
  quizRequired: boolean;
  quizBundle: string;
  attestationRequired: boolean;
  initialDue: string;
  recurrence: string;
  releaseStatus: string;
  blocked: boolean;
  relatedModuleIds: string[];
  sourceMatrixRow: number;
  estMinutes: null;
  inherited: boolean;
  scopeRationale: string;
  internalSource: string;
  externalAuthorityUrl: string;
  sourceNotes: string;
}

export const POLICY_ASSIGNMENT_MAP: GeneratedPolicyAssignment[] = ${JSON.stringify(policyAssignmentMap, null, 2)};

export function getPolicyAssignmentsForPathway(pathway: string): GeneratedPolicyAssignment[] {
  return POLICY_ASSIGNMENT_MAP.filter((a) => a.pathway === pathway);
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 6. policyQuizMap.generated.ts
// ═══════════════════════════════════════════════════════════════

interface GeneratedQuizBundle {
  bundleId: string;
  courseId: string;
  pathway: string;
  title: string;
  policyIds: string[];
  passScore: number;
  maxAttempts: number;
  questionCount: number;
  bankStatus: 'APPROVED' | 'DRAFT_REVIEW_REQUIRED' | 'MISSING';
  draftQuestions?: { id: string; stem: string; options: string[]; correctIndex: number; policyId: string }[];
  note: string;
}

const GAO_DRAFT_SAMPLE_QUESTIONS: GeneratedQuizBundle['draftQuestions'] = [
  {
    id: 'G-01-DRAFT-Q1',
    stem: 'DRAFT SAMPLE — Who is responsible for verifying an employee has read and attested to every policy assigned under General Orientation?',
    options: ['The employee only', 'The employee and their supervisor/HR per HR-TA-005', 'No one — attestation is optional', 'The Governing Body only'],
    correctIndex: 1,
    policyId: 'HR-TA-005',
  },
  {
    id: 'G-01-DRAFT-Q2',
    stem: 'DRAFT SAMPLE — General Orientation acknowledgments are due by:',
    options: ['Day 90', 'Day 5 for orientation / Day 14 for all acknowledgments', 'End of first year', 'There is no deadline'],
    correctIndex: 1,
    policyId: 'HR-TA-005',
  },
  {
    id: 'G-01-DRAFT-Q3',
    stem: 'DRAFT SAMPLE — What passing score is required for the General Orientation quiz?',
    options: ['60%', '70%', '80%', '100%'],
    correctIndex: 2,
    policyId: 'HR-TA-005',
  },
];

const policyQuizMap: GeneratedQuizBundle[] = courseCatalog.map((c) => {
  const policyIds = Array.from(new Set(policyAssignments.filter((r) => r.courseId === c.courseId).map((r) => r.policyId)));
  const isDraftPilot = c.courseId === 'G-01';
  return {
    bundleId: c.courseId,
    courseId: c.courseId,
    pathway: c.pathway,
    title: c.courseTitle,
    policyIds,
    passScore: Math.round(c.passScore * 100),
    maxAttempts: 3,
    questionCount: 10,
    bankStatus: isDraftPilot ? 'DRAFT_REVIEW_REQUIRED' : 'MISSING',
    ...(isDraftPilot ? { draftQuestions: GAO_DRAFT_SAMPLE_QUESTIONS } : {}),
    note: isDraftPilot
      ? 'DRAFT sample bank only (3 of 10 required items) — pilot alignment with GAO-001. NOT an approved bank; quiz UI must still block completion until an approved 10-item bank ships.'
      : 'No approved question bank exists yet. Quiz UI must render "Quiz not yet published" and block completion.',
  };
});

const bankStatusCounts: Record<string, number> = {};
for (const q of policyQuizMap) bankStatusCounts[q.bankStatus] = (bankStatusCounts[q.bankStatus] ?? 0) + 1;

writeGeneratedTs(
  'policyQuizMap.generated.ts',
  GENERATED_HEADER('policyQuizMap.generated.ts', [
    `${policyQuizMap.length} course quiz bundles from Course_Catalog.aoa.json, cross-joined to Policy_Assignments.aoa.json by Course ID.`,
    `passScore taken directly from Course_Catalog "Pass score" column (already 85 for the 5 OASIS-titled courses, 80 otherwise).`,
    `bankStatus counts: ${JSON.stringify(bankStatusCounts)}`,
  ]),
  `export interface GeneratedQuizBundle {
  bundleId: string;
  courseId: string;
  pathway: string;
  title: string;
  policyIds: string[];
  passScore: number;
  maxAttempts: number;
  questionCount: number;
  bankStatus: 'APPROVED' | 'DRAFT_REVIEW_REQUIRED' | 'MISSING';
  draftQuestions?: { id: string; stem: string; options: string[]; correctIndex: number; policyId: string }[];
  note: string;
}

export const POLICY_QUIZ_MAP: GeneratedQuizBundle[] = ${JSON.stringify(policyQuizMap, null, 2)};

export function getQuizBundle(courseId: string): GeneratedQuizBundle | undefined {
  return POLICY_QUIZ_MAP.find((q) => q.courseId === courseId);
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 7. appendixFormCrosswalk.generated.ts + 8. appendixForms.generated.ts
// ═══════════════════════════════════════════════════════════════

type AppendixClassification = 'EXACT_FORM' | 'COMPOSITE_PACKET' | 'QUIZ_NOT_FORM' | 'NO_FORM_REQUIRED' | 'FORM_MAPPING_REVIEW_REQUIRED';

interface AppendixCrosswalkEntry {
  appendixKey: string;
  label: string;
  classification: AppendixClassification;
  formIds: string[];
  note: string;
}

const APPENDIX_CROSSWALK: AppendixCrosswalkEntry[] = [
  { appendixKey: 'F', label: 'HR-TA-001 Appendix F — Pre-Employment Screening Checklist', classification: 'COMPOSITE_PACKET', formIds: ['HR-FM-018', 'HR-FM-005', 'HR-FM-006', 'HR-FM-007'], note: 'Pre-employment screening bundles background check, OIG/SAM exclusion check, license/cert verification, and the onboarding checklist. No single "Appendix F" form exists in FORMS_DATASET; composite of 4 real constituent forms.' },
  { appendixKey: 'A', label: 'HR-TA-003 Appendix A — OIG/SAM Screening Result Form', classification: 'EXACT_FORM', formIds: ['HR-FM-005'], note: 'HR-FM-005 = OIG/SAM Monthly Exclusion Verification Log.' },
  { appendixKey: 'B', label: 'HR-TA-004 Appendix B — Licensure Verification Record', classification: 'EXACT_FORM', formIds: ['HR-FM-006'], note: 'HR-FM-006 = License & Cert Primary Source Verification.' },
  { appendixKey: 'HRTA005_A', label: 'HR-TA-005 Appendix A — General Orientation sign-off', classification: 'EXACT_FORM', formIds: ['HR-FM-007'], note: 'HR-FM-007 = New Hire Onboarding & Orientation Checklist.' },
  { appendixKey: 'HRTA005_B', label: 'HR-TA-005 Appendix B — Role-specific sign-off / clearance', classification: 'FORM_MAPPING_REVIEW_REQUIRED', formIds: [], note: 'No exact role-specific clearance/sign-off form found in FORMS_DATASET. Do not force a mapping.' },
  { appendixKey: 'HRTA005_D', label: 'HR-TA-005 Appendix D — General Orientation Quiz', classification: 'QUIZ_NOT_FORM', formIds: [], note: 'This appendix is the GAO-EXAM quiz itself (see policyQuizMap G-01 bundle), not a fillable form.' },
  { appendixKey: 'HRTA005_E', label: 'HR-TA-005 Appendix E — Supervised Visit Form (new-hire clearance)', classification: 'FORM_MAPPING_REVIEW_REQUIRED', formIds: [], note: 'CL-FM-042 ("Supervisory Visit Documentation (RN)") documents an RN supervising a PATIENT visit, not a supervisor evaluating a new-hire during onboarding supervised visits. Semantics do not match closely enough to force; flagged for review.' },
  { appendixKey: 'HRTD003_A', label: 'HR-TD-003 Appendix A — Annual Competency Evaluation', classification: 'EXACT_FORM', formIds: ['HR-FM-016'], note: 'HR-FM-016 = Clinical Staff Competency Validation Checklist.' },
  { appendixKey: 'HRTD003_C', label: 'HR-TD-003 Appendix C — Remediation Plan', classification: 'EXACT_FORM', formIds: ['HR-FM-038'], note: 'HR-FM-038 = Competency Remediation Plan.' },
  { appendixKey: 'HRTD003_D', label: 'HR-TD-003 Appendix D — HHA-specific competency (9 areas)', classification: 'EXACT_FORM', formIds: ['CL-FM-016'], note: 'CL-FM-016 = HHA Competency Evaluation Checklist.' },
  { appendixKey: 'HRTD003_E', label: 'HR-TD-003 Appendix E — HHA Supervisory Visit (14/60-day)', classification: 'EXACT_FORM', formIds: ['CL-FM-042'], note: 'CL-FM-042 = Supervisory Visit Documentation (RN) — RN supervising an HHA is exactly this appendix\'s subject.' },
  { appendixKey: 'HRER001_C', label: 'HR-ER-001 Appendix C — 90-day introductory evaluation', classification: 'FORM_MAPPING_REVIEW_REQUIRED', formIds: [], note: 'HR-FM-008 ("Annual Performance Evaluation Form") is the ANNUAL review, wrong cadence for a 90-day introductory eval. No dedicated 90-day form exists in FORMS_DATASET; not forced.' },
  { appendixKey: 'HRTD001_B', label: 'HR-TD-001 Appendix B — Annual training dashboard', classification: 'FORM_MAPPING_REVIEW_REQUIRED', formIds: [], note: 'HR-FM-017 ("Training Attendance & Completion Roster") is a roster, not a dashboard/summary artifact. Not forced.' },
  { appendixKey: 'HRTD005_B', label: 'HR-TD-005 Appendix B — Emergency drill AAR', classification: 'EXACT_FORM', formIds: ['RM-FM-005'], note: 'RM-FM-005 = After-Action Review (AAR) Form (policies include OP-FM-005, matching ANN-008/ANN-016).' },
  { appendixKey: 'NONE', label: 'No evidence appendix required', classification: 'NO_FORM_REQUIRED', formIds: [], note: 'Applies to ADV modules (cms-485, qapi, oasis-e2-soc, documentation-matters).' },
];

// Verify every formId referenced actually exists in FORMS_DATASET (fail loudly if not).
const formsById = new Map(FORMS_DATASET.map((f) => [f.id, f]));
for (const entry of APPENDIX_CROSSWALK) {
  for (const fid of entry.formIds) {
    if (!formsById.has(fid)) {
      throw new Error(`appendixFormCrosswalk: form id "${fid}" referenced by appendix "${entry.appendixKey}" does not exist in FORMS_DATASET.`);
    }
  }
}

const classificationCounts: Record<string, number> = {};
for (const e of APPENDIX_CROSSWALK) classificationCounts[e.classification] = (classificationCounts[e.classification] ?? 0) + 1;

writeGeneratedTs(
  'appendixFormCrosswalk.generated.ts',
  GENERATED_HEADER('appendixFormCrosswalk.generated.ts', [
    `${APPENDIX_CROSSWALK.length} EvidenceAppendix keys classified (full EvidenceAppendix union from src/policy/journey/types/journey.ts).`,
    `Classification counts: ${JSON.stringify(classificationCounts)}`,
    `Every formId referenced here is verified present in src/policy/data/formsLibraryDataset.ts FORMS_DATASET (build fails otherwise).`,
  ]),
  `export type AppendixClassification = 'EXACT_FORM' | 'COMPOSITE_PACKET' | 'QUIZ_NOT_FORM' | 'NO_FORM_REQUIRED' | 'FORM_MAPPING_REVIEW_REQUIRED';

export interface AppendixCrosswalkEntry {
  appendixKey: string;
  label: string;
  classification: AppendixClassification;
  formIds: string[];
  note: string;
}

export const APPENDIX_FORM_CROSSWALK: AppendixCrosswalkEntry[] = ${JSON.stringify(APPENDIX_CROSSWALK, null, 2)};

export function getAppendixCrosswalk(appendixKey: string): AppendixCrosswalkEntry | undefined {
  return APPENDIX_FORM_CROSSWALK.find((e) => e.appendixKey === appendixKey);
}
`,
);

// 8. appendixForms.generated.ts — baked FormContent for every EXACT_FORM / COMPOSITE_PACKET constituent.
const neededFormIds = Array.from(new Set(APPENDIX_CROSSWALK.flatMap((e) => e.formIds))).sort();
const bakedForms = neededFormIds.map((id) => {
  const rec = formsById.get(id)!;
  return buildFormContent(rec);
});

writeGeneratedTs(
  'appendixForms.generated.ts',
  GENERATED_HEADER('appendixForms.generated.ts', [
    `Baked FormContent (buildFormContent) for the ${bakedForms.length} form ids referenced by appendixFormCrosswalk.generated.ts: ${neededFormIds.join(', ')}.`,
    `Source: src/policy/data/formsLibraryDataset.ts (FORMS_DATASET) + src/policy/data/formsLibraryContent.ts (buildFormContent).`,
  ]),
  `import type { FormContent } from './sharedTypes.generated';

export const APPENDIX_FORMS: FormContent[] = ${JSON.stringify(bakedForms, null, 2)};

export function getAppendixForm(formId: string): FormContent | undefined {
  return APPENDIX_FORMS.find((f) => f.id === formId);
}
`,
);

// ═══════════════════════════════════════════════════════════════
// 9. annualAssignmentMap.generated.ts
// ═══════════════════════════════════════════════════════════════

const ACHC_CLINICAL_AUDIENCE: JourneyRole[] = ['DON', 'RN', 'LVN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW'];

interface AnnualModuleAssignment {
  moduleId: string;
  title: string;
  family: 'ANN' | 'ACHC-ART';
  quarter: string | null;
  audience: JourneyRole[];
  admSecondaryOnly: boolean;
  note: string;
}

const annModules = ALL_MODULES.filter((m) => m.group === 'ANN' || m.group === 'DRILL' || m.group === 'COMP');
const annualAssignmentMap: AnnualModuleAssignment[] = [];

for (const m of annModules) {
  const isAchc = m.id.toUpperCase().startsWith('ACHC-ART');
  let audience: JourneyRole[];
  let admSecondaryOnly = false;
  let note = '';
  if (isAchc) {
    audience = ACHC_CLINICAL_AUDIENCE;
    admSecondaryOnly = true; // ADM only with a clinical secondary role, never primary ACHC audience
    note = `ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field ("${JSON.stringify(m.roles)}") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded.`;
  } else {
    audience = m.roles === 'ALL' ? ALL_ROLES : m.roles;
    note = 'Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules).';
  }
  annualAssignmentMap.push({
    moduleId: m.id,
    title: m.title,
    family: isAchc ? 'ACHC-ART' : 'ANN',
    quarter: m.annualQuarter ?? null,
    audience,
    admSecondaryOnly,
    note,
  });
}

const quarterGroups: Record<string, string[]> = { Q1: [], Q2: [], Q3: [], Q4: [], NONE: [] };
for (const a of annualAssignmentMap) quarterGroups[a.quarter ?? 'NONE'].push(a.moduleId);

writeGeneratedTs(
  'annualAssignmentMap.generated.ts',
  GENERATED_HEADER('annualAssignmentMap.generated.ts', [
    `${annualAssignmentMap.length} ANN/DRILL/COMP-group modules mapped.`,
    `ACHC_CLINICAL_AUDIENCE = [${ACHC_CLINICAL_AUDIENCE.join(', ')}] applied to all 12 ACHC-ART modules (fixes M04/M07/M09 roles:'ALL' leak; ADM excluded from primary audience, admSecondaryOnly:true).`,
    `Quarter groups: Q1=${quarterGroups.Q1.length} Q2=${quarterGroups.Q2.length} Q3=${quarterGroups.Q3.length} Q4=${quarterGroups.Q4.length} (non-quarterly=${quarterGroups.NONE.length}, e.g. COMP-90DAY).`,
  ]),
  `import type { JourneyRole } from './sharedTypes.generated';

export const ACHC_CLINICAL_AUDIENCE: JourneyRole[] = ${JSON.stringify(ACHC_CLINICAL_AUDIENCE)};

export interface AnnualModuleAssignment {
  moduleId: string;
  title: string;
  family: 'ANN' | 'ACHC-ART';
  quarter: string | null;
  audience: JourneyRole[];
  admSecondaryOnly: boolean;
  note: string;
}

export const ANNUAL_ASSIGNMENT_MAP: AnnualModuleAssignment[] = ${JSON.stringify(annualAssignmentMap, null, 2)};
`,
);

// ═══════════════════════════════════════════════════════════════
// 10. advancedAssignmentMap.generated.ts
// ═══════════════════════════════════════════════════════════════

const ADVANCED_PORTAL_MINIMUM_AUDIENCE: JourneyRole[] = ['PT', 'RN', 'DON', 'ADM'];

interface AdvancedModuleAudience {
  moduleId: string;
  title: string;
  canonical: JourneyRole[];
  ownerAdded: JourneyRole[];
  effective: JourneyRole[];
  scopeWarning: boolean;
}

const advModules = ALL_MODULES.filter((m) => ADV_IDS.has(m.id));
const advancedAssignmentMap: AdvancedModuleAudience[] = advModules.map((m) => {
  const canonical = (m.roles === 'ALL' ? ALL_ROLES : m.roles) as JourneyRole[];
  const canonicalSet = new Set(canonical);
  const ownerAdded = ADVANCED_PORTAL_MINIMUM_AUDIENCE.filter((r) => !canonicalSet.has(r));
  const effective = Array.from(new Set([...canonical, ...ADVANCED_PORTAL_MINIMUM_AUDIENCE]));
  return { moduleId: m.id, title: m.title, canonical, ownerAdded, effective, scopeWarning: ownerAdded.length > 0 };
});

writeGeneratedTs(
  'advancedAssignmentMap.generated.ts',
  GENERATED_HEADER('advancedAssignmentMap.generated.ts', [
    `ADVANCED_PORTAL_MINIMUM_AUDIENCE = [${ADVANCED_PORTAL_MINIMUM_AUDIENCE.join(', ')}] applied as a MINIMUM floor, unioned with each module's canonical modules.ts roles (never dropping canonical OT/SLP where required).`,
    ...advancedAssignmentMap.map((a) => `${a.moduleId}: canonical=[${a.canonical.join(',')}] ownerAdded=[${a.ownerAdded.join(',')}] scopeWarning=${a.scopeWarning}`),
  ]),
  `import type { JourneyRole } from './sharedTypes.generated';

export const ADVANCED_PORTAL_MINIMUM_AUDIENCE: JourneyRole[] = ${JSON.stringify(ADVANCED_PORTAL_MINIMUM_AUDIENCE)};

export interface AdvancedModuleAudience {
  moduleId: string;
  title: string;
  canonical: JourneyRole[];
  ownerAdded: JourneyRole[];
  effective: JourneyRole[];
  scopeWarning: boolean;
}

export const ADVANCED_ASSIGNMENT_MAP: AdvancedModuleAudience[] = ${JSON.stringify(advancedAssignmentMap, null, 2)};
`,
);

// ═══════════════════════════════════════════════════════════════
// 11. journeySourceManifest.generated.json
// ═══════════════════════════════════════════════════════════════

const manifest = {
  schemaVersion: SCHEMA_VERSION,
  generatedAt: 'GENERATED_AT_BUILD',
  sourceBranch: SOURCE_BRANCH,
  generator: 'apps/employee-journey/scripts/generateJourneyMappings.ts',
  matrixInputs: MATRIX_INPUT_FILES.map((f) => {
    const abs = path.join(MATRIX_DIR, f);
    return {
      path: relFromRepoRoot(abs),
      sha256: sha256File(abs),
    };
  }),
  canonicalSourceInputs: CANONICAL_SOURCE_FILES.map((abs) => ({
    path: relFromRepoRoot(abs),
    sha256: sha256File(abs),
  })),
  counts: {
    modules: ALL_MODULES.length,
    coursesInCatalog: courseCatalog.length,
    policyAssignmentRowsRaw: policyAssignments.length,
    policyAssignmentRecordsGenerated: policyAssignmentMap.length,
    uniquePoliciesInRolePolicyMatrix: rolePolicyMatrix.length,
    uniquePoliciesReferenced: referencedPolicyIds.length,
    policiesVerified: verifiedCount,
    policiesNeedsReview: needsReviewCount,
    policiesInvalid: invalidCount,
    pathwaysInSummary: pathwaySummary.length,
    releaseBlockers: releaseBlockers.length,
    allPolicyReviewRows: allPolicyReview.length,
    sourcesMethodRows: sourcesMethod.length,
    quizBundles: policyQuizMap.length,
    appendixKeysClassified: APPENDIX_CROSSWALK.length,
    appendixFormsBaked: bakedForms.length,
    annualDrillCompModules: annualAssignmentMap.length,
    achcClinicalAudienceSize: ACHC_CLINICAL_AUDIENCE.length,
    advancedModules: advancedAssignmentMap.length,
    modulePlayerTypeCounts: playerTypeCounts,
    moduleFamilyCounts: familyCounts,
  },
  unresolved: {
    policiesNeedsReviewOrInvalid: policyCatalog.filter((p) => p.policyRefStatus !== 'verified').map((p) => ({ policyId: p.policyId, status: p.policyRefStatus })),
    appendixKeysNeedingReview: APPENDIX_CROSSWALK.filter((e) => e.classification === 'FORM_MAPPING_REVIEW_REQUIRED').map((e) => e.appendixKey),
    modulesWithoutPlayer: modulePlayerMap.filter((e) => e.playerType === 'UNAVAILABLE').map((e) => e.moduleId),
    heldPolicyAssignments: policyAssignmentMap.filter((a) => a.blocked).length,
  },
};

writeGeneratedJson('journeySourceManifest.generated.json', manifest);

// ═══════════════════════════════════════════════════════════════
// DONE
// ═══════════════════════════════════════════════════════════════

console.log('[journey:map:generate] wrote', OUT_DIR);
console.log(JSON.stringify(manifest.counts, null, 2));
