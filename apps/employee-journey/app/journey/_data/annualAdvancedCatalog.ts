/**
 * Annual / ACHC / Advanced training view-model.
 *
 * Hand-written data layer (NOT auto-generated). It only joins rows that already
 * exist in app/journey/_generated/*.generated.ts (built from the xlsx matrix +
 * main-app canonical sources by scripts/generateJourneyMappings.ts). It never
 * invents a module id, policy id, quarter, audience, or player route.
 *
 * Consumed by AnnualWorkspace.tsx and AdvancedWorkspace.tsx.
 */

import {
  getGeneratedModule,
  type ModuleFamily,
} from "../_generated/moduleCatalog.generated";
import { getModulePlayerEntry } from "../_generated/modulePlayerMap.generated";
import {
  ANNUAL_ASSIGNMENT_MAP,
  ACHC_CLINICAL_AUDIENCE,
  type AnnualModuleAssignment,
} from "../_generated/annualAssignmentMap.generated";
import {
  ADVANCED_ASSIGNMENT_MAP,
} from "../_generated/advancedAssignmentMap.generated";
import {
  getPolicyAssignmentsForPathway,
} from "../_generated/policyAssignmentMap.generated";
import { getGeneratedPolicy } from "../_generated/policyCatalog.generated";
import { getAppendixCrosswalk } from "../_generated/appendixFormCrosswalk.generated";
import type { JourneyRole, EvidenceAppendix } from "../_generated/sharedTypes.generated";

const JOURNEY_ROLES: readonly JourneyRole[] = [
  "ADM", "DON", "RN", "LVN", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "HHA",
];

/** Narrows a persona.roleCode (a free-form fixture string, e.g. "GAO" for office/driver
 * personas) to the JourneyRole union used by the generated audience arrays. Returns
 * null for roles the generated data has no concept of (office/driver/GB personas). */
export function asJourneyRole(roleCode: string): JourneyRole | null {
  return (JOURNEY_ROLES as readonly string[]).includes(roleCode)
    ? (roleCode as JourneyRole)
    : null;
}

const KNOWN_POLICY_PATHWAYS = [
  "General", "LVN", "RN", "HHA", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "ADM", "DON", "GB",
];

/** Policy_Assignments.aoa.json pathway names match JourneyRole strings 1:1 for
 * clinical/leadership roles. Office/driver/returning/separating personas (roleCode
 * "GAO" in fixtures.ts) only ever inherit the General pathway. */
export function pathwayForRoleCode(roleCode: string): string {
  return KNOWN_POLICY_PATHWAYS.includes(roleCode) ? roleCode : "General";
}

export interface PolicyRefChip {
  id: string;
  title: string | null;
}

function resolvePolicyRefs(ids: string[]): PolicyRefChip[] {
  return ids.map((id) => ({ id, title: getGeneratedPolicy(id)?.title ?? null }));
}

export type AnnualCategory =
  | "online-training"
  | "policy-learning"
  | "competency"
  | "drill-live"
  | "achc-bundle";

export interface AnnualModuleView {
  moduleId: string;
  title: string;
  quarter: string | null;
  category: AnnualCategory;
  family: ModuleFamily;
  method: string;
  durationMinutes: number | null;
  passThreshold: number | null;
  policyRefs: PolicyRefChip[];
  cmsRefs: string[];
  evidenceAppendix: EvidenceAppendix | null;
  evidenceLabel: string | null;
  supervisorSignature: boolean;
  launchRef: string | null;
  playerAvailable: boolean;
  assignedToRole: boolean;
  admSecondaryOnly: boolean;
}

function buildAnnualModuleView(
  entry: AnnualModuleAssignment,
  roleCode: string,
): AnnualModuleView | null {
  const mod = getGeneratedModule(entry.moduleId);
  if (!mod) return null;
  const player = getModulePlayerEntry(entry.moduleId);
  const role = asJourneyRole(roleCode);
  const assignedToRole = role ? entry.audience.includes(role) : false;

  const category: AnnualCategory =
    mod.family === "ACHC-ART"
      ? "achc-bundle"
      : mod.family === "COMP"
        ? "competency"
        : mod.group === "DRILL"
          ? "drill-live"
          : mod.method === "None"
            ? "policy-learning"
            : "online-training";

  const evidenceLabel =
    mod.evidenceAppendix && mod.evidenceAppendix !== "NONE"
      ? (getAppendixCrosswalk(mod.evidenceAppendix)?.label ?? null)
      : null;

  return {
    moduleId: mod.id,
    title: mod.title,
    quarter: entry.quarter,
    category,
    family: mod.family,
    method: mod.method,
    durationMinutes: mod.durationMinutes,
    passThreshold: mod.passThreshold,
    policyRefs: resolvePolicyRefs(mod.policyRefs),
    cmsRefs: mod.cmsRefs,
    evidenceAppendix: mod.evidenceAppendix,
    evidenceLabel,
    supervisorSignature: mod.supervisorSignature,
    launchRef: player?.launchRef ?? null,
    playerAvailable: player?.playerAvailable ?? false,
    assignedToRole,
    admSecondaryOnly: entry.admSecondaryOnly,
  };
}

const QUARTER_ORDER = ["Q1", "Q2", "Q3", "Q4"];

export function sortByQuarterThenId(a: AnnualModuleView, b: AnnualModuleView): number {
  const qa = a.quarter ? QUARTER_ORDER.indexOf(a.quarter) : 99;
  const qb = b.quarter ? QUARTER_ORDER.indexOf(b.quarter) : 99;
  if (qa !== qb) return qa - qb;
  return a.moduleId.localeCompare(b.moduleId);
}

/** All ANN-group modules assigned to this role, excluding COMP-90DAY (the 90-day
 * introductory evaluation — phase "ROLE" in MODULE_CATALOG, not a true annual-cadence
 * item, even though the source pipeline's ANNUAL_ASSIGNMENT_MAP groups it alongside
 * ANN/ACHC-ART because Course_Catalog lists it as one of the 3 "non-quarterly" rows). */
function allAnnualViews(roleCode: string): AnnualModuleView[] {
  return ANNUAL_ASSIGNMENT_MAP.map((entry) => buildAnnualModuleView(entry, roleCode))
    .filter((v): v is AnnualModuleView => v !== null)
    .filter((v) => v.assignedToRole && v.moduleId !== "COMP-90DAY")
    .sort(sortByQuarterThenId);
}

export interface AnnualBucketSummary {
  count: number;
  totalMinutes: number;
  itemsWithUnknownDuration: number;
}

function summarize(items: AnnualModuleView[]): AnnualBucketSummary {
  const known = items.filter((i) => typeof i.durationMinutes === "number");
  return {
    count: items.length,
    totalMinutes: known.reduce((sum, i) => sum + (i.durationMinutes ?? 0), 0),
    itemsWithUnknownDuration: items.length - known.length,
  };
}

export interface AgencyAnnualPlan {
  onlineTraining: AnnualModuleView[];
  onlineTrainingSummary: AnnualBucketSummary;
  policyLearning: AnnualModuleView[];
  policyLearningSummary: AnnualBucketSummary;
  competencySummary: AnnualBucketSummary;
  drillLiveSummary: AnnualBucketSummary;
}

/** Agency Annual Plan: ANN- / COMP- prefixed modules by role, broken into 4
 * independently-counted buckets (never a single rolled-up "100%" figure). */
export function getAgencyAnnualPlan(roleCode: string): AgencyAnnualPlan {
  const all = allAnnualViews(roleCode);
  const onlineTraining = all.filter((i) => i.category === "online-training");
  const policyLearning = all.filter((i) => i.category === "policy-learning");
  const competency = all.filter((i) => i.category === "competency");
  const drillLive = all.filter((i) => i.category === "drill-live");
  return {
    onlineTraining,
    onlineTrainingSummary: summarize(onlineTraining),
    policyLearning,
    policyLearningSummary: summarize(policyLearning),
    competencySummary: summarize(competency),
    drillLiveSummary: summarize(drillLive),
  };
}

export function getAnnualCompetency(roleCode: string): AnnualModuleView[] {
  return allAnnualViews(roleCode).filter((i) => i.category === "competency");
}

export function getEmergencyDrills(roleCode: string): AnnualModuleView[] {
  return allAnnualViews(roleCode).filter((i) => i.category === "drill-live");
}

export interface AchcBundle {
  assignedToRole: boolean;
  admSecondaryOnly: boolean;
  modules: AnnualModuleView[];
  totalCount: number;
}

/** ACHC Clinical Field Worker Bundle: the 12 ACHC-ART modules, Q1-Q4, using
 * ACHC_CLINICAL_AUDIENCE (fixes the M04/M07/M09 roles:'ALL' leak from the raw
 * canonical modules.ts data — see annualAssignmentMap.generated.ts header). */
export function getAchcBundle(roleCode: string): AchcBundle {
  const role = asJourneyRole(roleCode);
  const assignedToRole = role
    ? (ACHC_CLINICAL_AUDIENCE as readonly string[]).includes(role)
    : false;
  const modules = ANNUAL_ASSIGNMENT_MAP.filter((e) => e.moduleId.startsWith("ACHC-ART-"))
    .map((entry) => buildAnnualModuleView(entry, roleCode))
    .filter((v): v is AnnualModuleView => v !== null)
    .sort(sortByQuarterThenId);
  return {
    assignedToRole,
    admSecondaryOnly: role === "ADM",
    modules,
    totalCount: modules.length,
  };
}

export interface AdvancedModuleView {
  moduleId: string;
  title: string;
  canonical: JourneyRole[];
  ownerAdded: JourneyRole[];
  effective: JourneyRole[];
  scopeWarning: boolean;
  assignedToRole: boolean;
  method: string;
  durationMinutes: number | null;
  passThreshold: number | null;
  policyRefs: PolicyRefChip[];
  cmsRefs: string[];
  launchRef: string | null;
  playerAvailable: boolean;
}

/** Advanced Training collection: PT/RN/DON/ADM minimum floor, unioned per-module
 * with each module's canonical modules.ts roles (never dropping canonical OT/SLP
 * where required) — see advancedAssignmentMap.generated.ts header. */
export function getAdvancedCollection(roleCode: string): AdvancedModuleView[] {
  const role = asJourneyRole(roleCode);
  const out: AdvancedModuleView[] = [];
  for (const entry of ADVANCED_ASSIGNMENT_MAP) {
    const mod = getGeneratedModule(entry.moduleId);
    if (!mod) continue;
    const player = getModulePlayerEntry(entry.moduleId);
    out.push({
      moduleId: entry.moduleId,
      title: entry.title,
      canonical: entry.canonical,
      ownerAdded: entry.ownerAdded,
      effective: entry.effective,
      scopeWarning: entry.scopeWarning,
      assignedToRole: role ? entry.effective.includes(role) : false,
      method: mod.method,
      durationMinutes: mod.durationMinutes,
      passThreshold: mod.passThreshold,
      policyRefs: resolvePolicyRefs(mod.policyRefs),
      cmsRefs: mod.cmsRefs,
      launchRef: player?.launchRef ?? null,
      playerAvailable: player?.playerAvailable ?? false,
    });
  }
  return out;
}

export interface PolicyUpdateView {
  policyId: string;
  policyTitle: string;
  courseId: string;
  courseTitle: string;
  recurrence: string;
  tier: string;
  quizRequired: boolean;
  attestationRequired: boolean;
  scopeRationale: string;
}

/** Policy Updates: policy assignments whose recurrence cadence includes an annual
 * review/re-attestation cycle (Policy_Assignments.aoa.json "Recurrence" column),
 * scoped to the persona's pathway. This is a distinct data source from the ANN/
 * ACHC-ART training modules above — it reflects policy-level re-attestation
 * cadence, not module completion. */
export function getPolicyUpdates(roleCode: string): PolicyUpdateView[] {
  const pathway = pathwayForRoleCode(roleCode);
  const rows = getPolicyAssignmentsForPathway(pathway).filter((row) =>
    /annual/i.test(row.recurrence),
  );
  const seen = new Set<string>();
  const out: PolicyUpdateView[] = [];
  for (const row of rows) {
    const key = `${row.policyId}__${row.courseId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      policyId: row.policyId,
      policyTitle: row.policyTitle,
      courseId: row.courseId,
      courseTitle: row.courseTitle,
      recurrence: row.recurrence,
      tier: row.tier,
      quizRequired: row.quizRequired,
      attestationRequired: row.attestationRequired,
      scopeRationale: row.scopeRationale,
    });
  }
  return out.sort((a, b) => a.policyId.localeCompare(b.policyId));
}

export function formatDuration(minutes: number | null): string {
  if (minutes == null) return "Not specified";
  if (minutes < 60) return `${minutes} min`;
  const hrs = minutes / 60;
  return Number.isInteger(hrs) ? `${hrs}h` : `${hrs.toFixed(1)}h`;
}

export function formatBucketHours(summary: AnnualBucketSummary): string {
  const hrs = summary.totalMinutes / 60;
  const label = hrs === 0 ? "0h" : Number.isInteger(hrs) ? `${hrs}h` : `${hrs.toFixed(1)}h`;
  return summary.itemsWithUnknownDuration > 0
    ? `${label} (+${summary.itemsWithUnknownDuration} unspecified)`
    : label;
}
