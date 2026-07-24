/**
 * Annual & Recurring Requirements — deduplicated requirement projection.
 *
 * Hand-written editorial/regulatory layer (NOT auto-generated). It only joins
 * rows that already exist in app/journey/_generated/*.generated.ts and the
 * annualAdvancedCatalog.ts view-model. It never invents a module id, policy id,
 * quarter, audience, or player route.
 *
 * Implements Master Correction Prompt §5 (dedup + correct IA), §6 (ACHC), §7
 * (Advanced onboarding+annual), §13 (HHA in-service clock) and §17 (visual
 * cleanup: one summary strip, no rolled-up count cards, truthful durations).
 *
 * DEDUPLICATION RULE (§5.4): when an ACHC clinical module and an ANN-* module
 * cover the SAME approved learning objective, the employee gets ONE assignment
 * (the ACHC module, which has a canonical main-app player), and the superseded
 * ANN module is recorded as an additional policy/basis reference — not a second
 * card. A requirement is kept SEPARATE only when it has a distinct obligation
 * (different legal duration, different audience, a live/drill activity, a skills
 * checkoff, a role-specific assessment, an HHA hour requirement, or a biennial
 * rather than annual cadence).
 */

import {
  getAchcBundle,
  getAdvancedCollection,
  getEmergencyDrills,
  getPolicyUpdates,
  getAnnualCompetency,
  asJourneyRole,
  type AchcBundle,
  type AnnualModuleView,
  type AdvancedModuleView,
  type PolicyUpdateView,
} from "./annualAdvancedCatalog";
import {
  ANNUAL_ASSIGNMENT_MAP,
} from "../_generated/annualAssignmentMap.generated";
import { getGeneratedModule } from "../_generated/moduleCatalog.generated";
import { getModulePlayerEntry } from "../_generated/modulePlayerMap.generated";
import { getGeneratedPolicy } from "../_generated/policyCatalog.generated";
import type { PolicyRefChip } from "./annualAdvancedCatalog";

// ── Dedup table: one canonical (player-backed) objective ← superseded ANN ids ──
export interface DedupObjective {
  objective: string;
  achcModuleId: string;
  achcTitle: string;
  supersededAnnIds: string[];
  basis: string;
}

export const ANNUAL_DEDUP_OBJECTIVES: DedupObjective[] = [
  {
    objective: "HIPAA Privacy & Security",
    achcModuleId: "ACHC-ART-M04",
    achcTitle: "HIPAA Privacy & Security",
    supersededAnnIds: ["ANN-003"],
    basis:
      "ACHC-ART-M04 teaches the same HIPAA privacy/security objective as ANN-003. One assignment, one completion; both policy bases (CO-HP-001, CO-HP-002) are retained on the ACHC card.",
  },
  {
    objective: "Infection Prevention & Control",
    achcModuleId: "ACHC-ART-M05",
    achcTitle: "Infection Control",
    supersededAnnIds: ["ANN-006"],
    basis:
      "ACHC-ART-M05 (Infection Control) covers the ANN-006 Infection Prevention objective. Kept as one clinical module with a return-demonstration checkoff carried on the competency track, not two cards.",
  },
  {
    objective: "Bloodborne Pathogens / TB",
    achcModuleId: "ACHC-ART-M11",
    achcTitle: "TB & Blood Borne Pathogens",
    supersededAnnIds: ["ANN-007"],
    basis:
      "ACHC-ART-M11 (TB & Blood Borne Pathogens) covers ANN-007. Bloodborne-pathogen training remains an at-least-annual obligation for occupationally-exposed staff — the annual cadence is preserved on the single ACHC card.",
  },
  {
    objective: "Patient Rights & Responsibilities",
    achcModuleId: "ACHC-ART-M08",
    achcTitle: "Patient Rights & Responsibilities",
    supersededAnnIds: ["ANN-004"],
    basis:
      "ACHC-ART-M08 (Patient Rights) covers the ANN-004 Patient Rights read-and-acknowledge objective. Abuse/neglect mandated-reporting (ANN-005) is kept SEPARATE — it is a distinct legal duty.",
  },
  {
    objective: "Workplace & Patient Safety (OSHA)",
    achcModuleId: "ACHC-ART-M07",
    achcTitle: "Workplace & Patient Safety (OSHA)",
    supersededAnnIds: ["ANN-009"],
    basis:
      "ACHC-ART-M07 (Workplace & Patient Safety / OSHA) covers the ANN-009 Workplace Safety objective.",
  },
  {
    objective: "Corporate Compliance / Code of Conduct / Fraud-Waste-Abuse",
    achcModuleId: "ACHC-ART-M09",
    achcTitle: "Corporate Compliance",
    supersededAnnIds: ["ANN-001", "ANN-002"],
    basis:
      "ACHC-ART-M09 (Corporate Compliance) covers both ANN-001 (Compliance / Code of Conduct) and ANN-002 (Fraud/Waste/Abuse) — a single compliance objective, one assignment.",
  },
];

const SUPERSEDED_ANN_IDS = new Set(
  ANNUAL_DEDUP_OBJECTIVES.flatMap((d) => d.supersededAnnIds),
);

/** ANN ids that are DISTINCT obligations and therefore kept as their own
 * requirement even after dedup (documented in ANNUAL_REQUIREMENT_DEDUPLICATION_REPORT.md). */
export interface DistinctAnnReason {
  annId: string;
  reason: string;
}
export const ANNUAL_DISTINCT_KEPT: DistinctAnnReason[] = [
  { annId: "ANN-005", reason: "Abuse / neglect mandated reporting — distinct legal duty, not the same as Patient Rights awareness." },
  { annId: "ANN-010", reason: "California anti-harassment — statutory 2-hour supervisory / biennial cadence, not the annual clinical cadence." },
  { annId: "ANN-011", reason: "Pain assessment — role-specific clinical case study." },
  { annId: "ANN-012", reason: "Fall-risk prevention — role-specific clinical case study." },
  { annId: "ANN-013", reason: "Medication safety — role-specific graded module." },
  { annId: "ANN-014", reason: "OASIS updates — role-specific coding exercise (assessing disciplines only)." },
  { annId: "ANN-015", reason: "IT security awareness — phishing simulation, distinct delivery method." },
  { annId: "ANN-017", reason: "Documentation standards — role-specific read & acknowledge." },
  { annId: "ANN-018", reason: "Advance directives — distinct clinical read & acknowledge." },
];

// ── Requirement view types ──────────────────────────────────────────────────
export type RequirementState =
  | "player-ready" // canonical main-app player exists → launch it
  | "in-development" // real obligation, module content not yet wired in the main app
  | "supervisor-checkoff" // competency-style, evaluated by a supervisor
  | "reference"; // policy-cadence / link-out, no personal completion state

export interface AnnualRequirementItem {
  moduleId: string;
  title: string;
  quarter: string | null;
  method: string;
  durationMinutes: number | null;
  passThreshold: number | null;
  policyRefs: PolicyRefChip[];
  cmsRefs: string[];
  launchRef: string | null;
  state: RequirementState;
  /** ANN objectives this single card also satisfies (dedup provenance). */
  alsoSatisfies: string[];
}

/** Role-specific distinct ANN requirements (after dedup), assigned to this role. */
function roleSpecificItems(roleCode: string): AnnualRequirementItem[] {
  const role = asJourneyRole(roleCode);
  if (!role) return [];
  const out: AnnualRequirementItem[] = [];
  for (const entry of ANNUAL_ASSIGNMENT_MAP) {
    if (entry.family !== "ANN") continue;
    if (SUPERSEDED_ANN_IDS.has(entry.moduleId)) continue; // deduped into ACHC
    if (!entry.audience.includes(role)) continue;
    const mod = getGeneratedModule(entry.moduleId);
    if (!mod) continue;
    if (mod.group === "DRILL") continue; // drills rendered in their own section
    const player = getModulePlayerEntry(entry.moduleId);
    out.push({
      moduleId: mod.id,
      title: mod.title,
      quarter: entry.quarter,
      method: mod.method,
      durationMinutes: mod.durationMinutes,
      passThreshold: mod.passThreshold,
      policyRefs: mod.policyRefs.map((id) => ({ id, title: getGeneratedPolicy(id)?.title ?? null })),
      cmsRefs: mod.cmsRefs,
      launchRef: player?.launchRef ?? null,
      state: player?.playerAvailable ? "player-ready" : "in-development",
      alsoSatisfies: [],
    });
  }
  return out.sort((a, b) => (a.quarter ?? "Z").localeCompare(b.quarter ?? "Z") || a.moduleId.localeCompare(b.moduleId));
}

// ── HHA in-service clock (§13.1: 12 hours per 12-month period, 42 CFR 484.80(d)) ──
export interface HhaInServiceClock {
  requiredHours: number;
  loggedHours: number; // no live record in preview → 0, tracked in the HR training record
  note: string;
}

// ── Summary strip (§17) ───────────────────────────────────────────────────────
export interface SummaryChip {
  label: string;
  value: string;
}

export interface AnnualRequirementsView {
  roleCode: string;
  isHHA: boolean;
  isClinical: boolean;
  achc: AchcBundle;
  achcAlsoSatisfies: Record<string, string[]>; // achc moduleId → ANN ids it absorbs
  advanced: AdvancedModuleView[];
  roleSpecific: AnnualRequirementItem[];
  competencyCount: number; // stays in the Competencies workspace; count only
  drills: AnnualModuleView[];
  policyUpdates: PolicyUpdateView[];
  hhaInService: HhaInServiceClock | null;
  summary: SummaryChip[];
  dedupObjectives: DedupObjective[];
}

export function getAnnualRequirements(roleCode: string): AnnualRequirementsView {
  const role = asJourneyRole(roleCode);
  const isHHA = role === "HHA";
  const isClinical = role !== null && role !== "ADM"; // ADM is leadership; ACHC only via secondary

  const achc = getAchcBundle(roleCode);
  const advancedAll = getAdvancedCollection(roleCode);
  const advanced = advancedAll.filter((a) => a.assignedToRole);
  const roleSpecific = roleSpecificItems(roleCode);
  const competency = getAnnualCompetency(roleCode);
  const drills = getEmergencyDrills(roleCode);
  const policyUpdates = getPolicyUpdates(roleCode);

  const achcAlsoSatisfies: Record<string, string[]> = {};
  for (const d of ANNUAL_DEDUP_OBJECTIVES) {
    achcAlsoSatisfies[d.achcModuleId] = d.supersededAnnIds;
  }

  const hhaInService: HhaInServiceClock | null = isHHA
    ? {
        requiredHours: 12,
        loggedHours: 0,
        note:
          "At least 12 hours of in-service education per 12-month period (42 CFR 484.80(d)). Hours are logged in the agency HR training record; this preview does not hold a live total.",
      }
    : null;

  const summary: SummaryChip[] = [];
  if (achc.assignedToRole) summary.push({ label: "ACHC", value: `0/${achc.totalCount}` });
  if (advanced.length) summary.push({ label: "Advanced", value: `0/${advanced.length}` });
  if (hhaInService) summary.push({ label: "HHA in-service", value: `${hhaInService.loggedHours}/${hhaInService.requiredHours}h` });
  if (drills.length) summary.push({ label: "Drills", value: `0/${drills.length}` });
  if (roleSpecific.length) summary.push({ label: "Role-specific", value: String(roleSpecific.length) });
  if (policyUpdates.length) summary.push({ label: "Policy actions", value: String(policyUpdates.length) });

  return {
    roleCode,
    isHHA,
    isClinical,
    achc,
    achcAlsoSatisfies,
    advanced,
    roleSpecific,
    competencyCount: competency.length,
    drills,
    policyUpdates,
    hhaInService,
    summary,
    dedupObjectives: ANNUAL_DEDUP_OBJECTIVES,
  };
}
