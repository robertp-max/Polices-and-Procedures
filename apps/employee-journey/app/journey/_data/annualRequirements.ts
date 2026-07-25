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

// ── Annual equivalency records (§6) ──────────────────────────────────────────
// Title similarity is NOT enough to prove equivalence. Each collapse is an APPROVED
// equivalency record with an explicit decision. Only EQUIVALENT collapses to one
// employee card; PARTIALLY_EQUIVALENT keeps the residual skill/live/checkoff
// obligation; REVIEW_REQUIRED must not silently deduplicate. (This synthetic dataset
// stands in for the reviewer-signed record; reviewer/approvalDate are marked SYNTHETIC.)
export type EquivalencyDecision =
  | "EQUIVALENT"
  | "PARTIALLY_EQUIVALENT"
  | "NOT_EQUIVALENT"
  | "REVIEW_REQUIRED";

export interface EquivalencyRecord {
  sourceAnnIds: string[];
  sourceLabel: string;
  achcModuleId: string;
  achcTitle: string;
  /** Short employee-friendly meaning of what the ACHC card also covers. */
  friendly: string;
  objectiveComparison: string;
  audienceMatch: boolean;
  deliveryMethod: string;
  assessment: string;
  liveOrSkillsComponent: string;
  policyBasis: string;
  reviewer: string;
  approvalDate: string;
  version: string;
  decision: EquivalencyDecision;
  /** Present only for PARTIALLY_EQUIVALENT: the obligation that is NOT absorbed. */
  residualObligation?: string;
}

export const ANNUAL_EQUIVALENCY_RECORDS: EquivalencyRecord[] = [
  {
    sourceAnnIds: ["ANN-003"], sourceLabel: "HIPAA Privacy & Security", achcModuleId: "ACHC-ART-M04", achcTitle: "HIPAA Privacy & Security",
    friendly: "your annual HIPAA privacy & security training", objectiveComparison: "Same privacy/security objective and policy basis (CO-HP-001/002).",
    audienceMatch: true, deliveryMethod: "Quiz = Quiz", assessment: "Scored quiz both", liveOrSkillsComponent: "None either",
    policyBasis: "CO-HP-001, CO-HP-002", reviewer: "SYNTHETIC (pending Compliance sign-off)", approvalDate: "SYNTHETIC", version: "v1", decision: "EQUIVALENT",
  },
  {
    sourceAnnIds: ["ANN-006"], sourceLabel: "Infection Prevention", achcModuleId: "ACHC-ART-M05", achcTitle: "Infection Control",
    friendly: "the knowledge portion of infection prevention", objectiveComparison: "Knowledge objective overlaps, but ANN-006 requires a RETURN DEMONSTRATION; ACHC-ART-M05 is quiz-only.",
    audienceMatch: true, deliveryMethod: "ReturnDemo vs Quiz — DIFFERENT", assessment: "ANN-006 skills checkoff vs M05 scored quiz", liveOrSkillsComponent: "ANN-006 has a hands-on return demonstration; M05 does not",
    policyBasis: "CL-SD-016", reviewer: "SYNTHETIC (pending Clinical/Compliance sign-off)", approvalDate: "SYNTHETIC", version: "v1", decision: "PARTIALLY_EQUIVALENT",
    residualObligation: "Return demonstration / skills checkoff of infection-control technique (retained — the quiz does not satisfy the hands-on competency).",
  },
  {
    sourceAnnIds: ["ANN-007"], sourceLabel: "Bloodborne Pathogen", achcModuleId: "ACHC-ART-M11", achcTitle: "TB & Blood Borne Pathogens",
    friendly: "your annual TB / bloodborne-pathogen training", objectiveComparison: "Same BBP/TB knowledge objective; both quiz-based; at-least-annual cadence preserved.",
    audienceMatch: true, deliveryMethod: "Quiz = Quiz", assessment: "Scored quiz both", liveOrSkillsComponent: "None either",
    policyBasis: "RM-OS-001", reviewer: "SYNTHETIC (pending Compliance sign-off)", approvalDate: "SYNTHETIC", version: "v1", decision: "EQUIVALENT",
  },
  {
    sourceAnnIds: ["ANN-004"], sourceLabel: "Patient Rights", achcModuleId: "ACHC-ART-M08", achcTitle: "Patient Rights & Responsibilities",
    friendly: "your patient-rights requirement", objectiveComparison: "M08 (scored) subsumes the ANN-004 read-and-acknowledge objective. Abuse/neglect reporting (ANN-005) stays separate.",
    audienceMatch: true, deliveryMethod: "Quiz subsumes Read&Ack", assessment: "M08 scored quiz ≥ read-and-acknowledge", liveOrSkillsComponent: "None either",
    policyBasis: "CL-PR-001", reviewer: "SYNTHETIC (pending Compliance sign-off)", approvalDate: "SYNTHETIC", version: "v1", decision: "EQUIVALENT",
  },
  {
    sourceAnnIds: ["ANN-009"], sourceLabel: "Workplace Safety", achcModuleId: "ACHC-ART-M07", achcTitle: "Workplace & Patient Safety (OSHA)",
    friendly: "your workplace-safety (OSHA) requirement", objectiveComparison: "M07 (scored OSHA) subsumes the ANN-009 read-and-acknowledge workplace-safety objective.",
    audienceMatch: true, deliveryMethod: "Quiz subsumes Read&Ack", assessment: "M07 scored quiz ≥ read-and-acknowledge", liveOrSkillsComponent: "None either",
    policyBasis: "RM-SS-001, RM-SS-002", reviewer: "SYNTHETIC (pending Safety/Compliance sign-off)", approvalDate: "SYNTHETIC", version: "v1", decision: "EQUIVALENT",
  },
  {
    sourceAnnIds: ["ANN-001", "ANN-002"], sourceLabel: "Compliance / Code of Conduct + Fraud/Waste/Abuse", achcModuleId: "ACHC-ART-M09", achcTitle: "Corporate Compliance",
    friendly: "your corporate-compliance & FWA training", objectiveComparison: "M09 covers both Code of Conduct and Fraud/Waste/Abuse objectives; both quiz-based.",
    audienceMatch: true, deliveryMethod: "Quiz = Quiz", assessment: "Scored quiz all", liveOrSkillsComponent: "None either",
    policyBasis: "CO-CP-001, CO-CP-004", reviewer: "SYNTHETIC (pending Compliance sign-off)", approvalDate: "SYNTHETIC", version: "v1", decision: "EQUIVALENT",
  },
];

/** Back-compat shape (EQUIVALENT-only) for the invariant suite + report. */
export interface DedupObjective {
  objective: string;
  achcModuleId: string;
  achcTitle: string;
  supersededAnnIds: string[];
  basis: string;
}
export const ANNUAL_DEDUP_OBJECTIVES: DedupObjective[] = ANNUAL_EQUIVALENCY_RECORDS
  .filter((r) => r.decision === "EQUIVALENT")
  .map((r) => ({
    objective: r.sourceLabel,
    achcModuleId: r.achcModuleId,
    achcTitle: r.achcTitle,
    supersededAnnIds: r.sourceAnnIds,
    basis: r.objectiveComparison,
  }));

// Only fully-EQUIVALENT ANN ids are removed as their own card. PARTIALLY_EQUIVALENT
// and REVIEW_REQUIRED source ids are NOT superseded (their residual obligation stays).
const SUPERSEDED_ANN_IDS = new Set(
  ANNUAL_EQUIVALENCY_RECORDS.filter((r) => r.decision === "EQUIVALENT").flatMap((r) => r.sourceAnnIds),
);

/** achcModuleId → employee-friendly "also satisfies" phrases (EQUIVALENT + PARTIALLY). */
const ACHC_FRIENDLY_SATISFIES: Record<string, string[]> = {};
for (const r of ANNUAL_EQUIVALENCY_RECORDS) {
  if (r.decision === "EQUIVALENT" || r.decision === "PARTIALLY_EQUIVALENT") {
    (ACHC_FRIENDLY_SATISFIES[r.achcModuleId] ??= []).push(
      r.decision === "PARTIALLY_EQUIVALENT" ? `${r.friendly} (skills checkoff stays separate)` : r.friendly,
    );
  }
}

/** ANN ids whose obligation is only PARTIALLY absorbed — they keep a residual card. */
export const ANNUAL_PARTIAL_RESIDUALS = ANNUAL_EQUIVALENCY_RECORDS
  .filter((r) => r.decision === "PARTIALLY_EQUIVALENT")
  .flatMap((r) => r.sourceAnnIds.map((id) => ({ annId: id, residual: r.residualObligation ?? "", achcModuleId: r.achcModuleId })));

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
  /** ANN objectives this single card also satisfies (dedup provenance, ids). */
  alsoSatisfies: string[];
  /** Employee-friendly "also satisfies" phrases (preferred for display). */
  alsoSatisfiesLabels: string[];
  /** Set when this card is the retained residual of a PARTIALLY_EQUIVALENT collapse. */
  residualNote?: string;
}

const RESIDUAL_BY_ANN = new Map(ANNUAL_PARTIAL_RESIDUALS.map((r) => [r.annId, r]));

/** Role-specific distinct ANN requirements (after dedup), assigned to this role.
 * Includes PARTIALLY_EQUIVALENT residuals (e.g. ANN-006 return demonstration), which
 * are NOT collapsed into their ACHC module. */
function roleSpecificItems(roleCode: string): AnnualRequirementItem[] {
  const role = asJourneyRole(roleCode);
  if (!role) return [];
  const out: AnnualRequirementItem[] = [];
  for (const entry of ANNUAL_ASSIGNMENT_MAP) {
    if (entry.family !== "ANN") continue;
    if (SUPERSEDED_ANN_IDS.has(entry.moduleId)) continue; // fully-EQUIVALENT → collapsed into ACHC
    if (!entry.audience.includes(role)) continue;
    const mod = getGeneratedModule(entry.moduleId);
    if (!mod) continue;
    if (mod.group === "DRILL") continue; // drills rendered in their own section
    const player = getModulePlayerEntry(entry.moduleId);
    const residual = RESIDUAL_BY_ANN.get(mod.id);
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
      alsoSatisfiesLabels: [],
      residualNote: residual?.residual,
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
  achcAlsoSatisfies: Record<string, string[]>; // achc moduleId → ANN ids fully absorbed (EQUIVALENT)
  achcAlsoSatisfiesLabels: Record<string, string[]>; // achc moduleId → employee-friendly phrases
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
  const achcAlsoSatisfiesLabels: Record<string, string[]> = { ...ACHC_FRIENDLY_SATISFIES };

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
    achcAlsoSatisfiesLabels,
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
