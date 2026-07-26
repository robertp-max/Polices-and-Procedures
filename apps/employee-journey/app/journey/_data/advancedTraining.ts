/**
 * Advanced Training — strict UI projection (§3/§4/§9).
 *
 * The learner-facing "Advanced Training" collection is EXACTLY four modules for EXACTLY
 * four roles (PT, RN, DON, ADM). This is a UI projection — it does not alter canonical
 * module role assignments; OASIS/Documentation content that canonically applies to other
 * roles stays in Role-Specific / Annual, not under the Advanced label.
 */

import { getGeneratedModule } from "../_generated/moduleCatalog.generated";
import { getModulePlayerEntry } from "../_generated/modulePlayerMap.generated";
import { getGeneratedPolicy } from "../_generated/policyCatalog.generated";
import { asJourneyRole, type PolicyRefChip } from "./annualAdvancedCatalog";

export const ADVANCED_TRAINING_PERSONAS = ["PT", "RN", "DON", "ADM"] as const;
export const ADVANCED_TRAINING_MODULE_IDS = [
  "cms-485",
  "qapi",
  "oasis-e2-soc",
  "documentation-matters",
] as const;

const ROLE_SCOPE_NOTES: Record<string, string> = {
  RN: "Clinical assessment, Plan of Care, OASIS, QAPI, and documentation application within RN scope and agency assignment.",
  DON: "Clinical oversight, survey readiness, QAPI leadership, Plan of Care governance, OASIS oversight, and documentation defensibility.",
  PT: "Therapy assessment and Plan of Care application. OASIS activity remains limited to authorized therapy assessors and applicable episodes.",
  ADM: "Leadership / oversight learning. Completion does not expand clinical scope, authorize OASIS assessment, or replace the DON/qualified clinician.",
};

const MODULE_PURPOSE: Record<string, string> = {
  "cms-485": "Build and defend the CMS-485 Plan of Care and its compliance linkages.",
  qapi: "Lead and take part in Quality Assessment & Performance Improvement.",
  "oasis-e2-soc": "Complete an OASIS-E2 Start of Care assessment accurately.",
  "documentation-matters": "Apply CMS documentation-defensibility standards to your notes.",
};

export interface AdvancedTrainingCard {
  id: string;
  title: string;
  purpose: string;
  durationMinutes: number | null;
  passThreshold: number | null;
  prerequisites: string[];
  policyRefs: PolicyRefChip[];
  launchRef: string | null;
  playerAvailable: boolean;
  scopeNote: string;
}

export interface AdvancedTrainingView {
  visible: boolean;
  role: string | null;
  scopeNote: string;
  modules: AdvancedTrainingCard[];
  totalMinutes: number | null;
}

/** True only for the four Advanced-Training roles. */
export function isAdvancedTrainingRole(roleCode: string): boolean {
  const role = asJourneyRole(roleCode);
  return role !== null && (ADVANCED_TRAINING_PERSONAS as readonly string[]).includes(role);
}

/** The exactly-four Advanced modules for the persona, or an empty/hidden view. */
export function getAdvancedTraining(roleCode: string): AdvancedTrainingView {
  const role = asJourneyRole(roleCode);
  if (!isAdvancedTrainingRole(roleCode)) {
    return { visible: false, role, scopeNote: "", modules: [], totalMinutes: null };
  }
  const scopeNote = ROLE_SCOPE_NOTES[role!] ?? "";
  const modules: AdvancedTrainingCard[] = ADVANCED_TRAINING_MODULE_IDS.map((id) => {
    const mod = getGeneratedModule(id);
    const player = getModulePlayerEntry(id);
    return {
      id,
      title: mod?.title ?? id,
      purpose: MODULE_PURPOSE[id] ?? "",
      durationMinutes: mod?.durationMinutes ?? null,
      passThreshold: mod?.passThreshold ?? null,
      prerequisites: mod?.prerequisites ?? [],
      policyRefs: (mod?.policyRefs ?? []).map((pid) => ({ id: pid, title: getGeneratedPolicy(pid)?.title ?? null })),
      launchRef: player?.launchRef ?? null,
      playerAvailable: player?.playerAvailable ?? false,
      scopeNote,
    };
  });
  const known = modules.filter((m) => typeof m.durationMinutes === "number");
  const totalMinutes = known.length ? known.reduce((s, m) => s + (m.durationMinutes ?? 0), 0) : null;
  return { visible: true, role, scopeNote, modules, totalMinutes };
}
