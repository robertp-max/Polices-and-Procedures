/**
 * Supervised visitation & clinical oversight reference (Master Correction §13).
 *
 * Role- and assignment-specific oversight cadences. Regulatory cadences are the
 * actual CMS 42 CFR 484.80 / California rules cited in the correction prompt —
 * reference data, not fabricated patient data. Where the current agency policy
 * does not specify a cadence, this says so rather than inventing one.
 *
 * OIG/SAM is HR/Compliance-owned: the employee sees a status only, never the raw
 * screening result.
 */

import { asJourneyRole } from "./annualAdvancedCatalog";

export interface OversightClock {
  label: string;
  cadence: string;
  detail: string;
  basis: string;
  /** Only shown when the persona's assignment matches (e.g. HHA skilled vs aide-only). */
  scenario?: "skilled" | "aide-only" | "all";
}

export interface RoleOversight {
  roleLabel: string;
  intro: string;
  clocks: OversightClock[];
  notes: string[];
}

const HHA_OVERSIGHT: RoleOversight = {
  roleLabel: "Home Health Aide",
  intro:
    "Aide oversight cadence depends on whether the patient also receives skilled services. These clocks run independently — they are never merged into one interval.",
  clocks: [
    {
      label: "RN supervisory assessment — patient also receives skilled services",
      cadence: "At least every 14 days",
      detail:
        "The aide need not be present for the routine assessment. A limited virtual option applies per the current rule.",
      basis: "42 CFR 484.80(h)(1)",
      scenario: "skilled",
    },
    {
      label: "RN on-site assessment — aide-only patient",
      cadence: "Every 60 days",
      detail: "On-site RN assessment when the patient receives aide services only.",
      basis: "42 CFR 484.80(h)(2)",
      scenario: "aide-only",
    },
    {
      label: "Direct observation — skilled-service aide",
      cadence: "Annually, on-site",
      detail: "On-site direct observation of each aide performing care.",
      basis: "42 CFR 484.80(h)(1)(iii)",
      scenario: "skilled",
    },
    {
      label: "Direct observation — aide-only service",
      cadence: "Semiannually, on-site",
      detail: "On-site direct observation of the aide performing care.",
      basis: "42 CFR 484.80(h)(2)",
      scenario: "aide-only",
    },
    {
      label: "In-service education",
      cadence: "12 hours per 12-month period",
      detail: "Tracked in the HR training record; also shown on the Annual page.",
      basis: "42 CFR 484.80(d)",
      scenario: "all",
    },
  ],
  notes: [
    "Deficiency path: concern identified → on-site observation → retraining → competency re-evaluation → follow-up/closure.",
  ],
};

const LVN_OVERSIGHT: RoleOversight = {
  roleLabel: "Licensed Vocational Nurse",
  intro: "LVNs practice under RN oversight per the current agency policy and California scope.",
  clocks: [
    {
      label: "RN oversight",
      cadence: "Per current agency RN-supervision policy",
      detail: "Documentation and co-sign review where required; assignment-specific observation.",
      basis: "Agency RN-supervision policy · CA LVN scope",
      scenario: "all",
    },
  ],
  notes: [
    "An LVN may not perform the initial comprehensive assessment or OASIS.",
    "No cadence is invented where the current policy does not specify one — escalation/retraining follows the deficiency path.",
  ],
};

const THERAPY_ASSISTANT_OVERSIGHT: RoleOversight = {
  roleLabel: "Therapy Assistant (PTA / COTA)",
  intro:
    "The assistant works under the supervising therapist's plan of care; supervisory visit and reassessment cadence follow the current PT/OT policy.",
  clocks: [
    {
      label: "Supervising therapist reassessment",
      cadence: "Per plan of care (verify against current PT/OT policy)",
      detail: "Supervisor, reassessment deadline, and any visit-count trigger per the current cadence.",
      basis: "Agency PT/OT supervisory & reassessment policy",
      scenario: "all",
    },
  ],
  notes: ["Documentation review by the supervising therapist; current status tracked per assignment."],
};

const CLINICIAN_OVERSIGHT: RoleOversight = {
  roleLabel: "Clinician / Leadership",
  intro: "Role-development oversight for RN / PT / OT / SLP / MSW / DON.",
  clocks: [
    {
      label: "Initial supervised practice",
      cadence: "During onboarding",
      detail: "Supervised practice, record review, and skill checkoff during the first assignments.",
      basis: "Agency onboarding & competency policy",
      scenario: "all",
    },
    {
      label: "Competency re-evaluation",
      cadence: "Annually or triggered",
      detail: "Annual competency plus any triggered re-evaluation (deficiency, new skill, corrective action).",
      basis: "HR-TD-003 competency policy",
      scenario: "all",
    },
  ],
  notes: ["DON additionally performs leadership review of clinical oversight. No patient-level data / PHI is shown."],
};

export function getRoleOversight(roleCode: string): RoleOversight | null {
  const role = asJourneyRole(roleCode);
  if (!role) return null;
  if (role === "HHA") return HHA_OVERSIGHT;
  if (role === "LVN") return LVN_OVERSIGHT;
  if (role === "PTA" || role === "COTA") return THERAPY_ASSISTANT_OVERSIGHT;
  if (["RN", "PT", "OT", "SLP", "MSW", "DON"].includes(role)) return CLINICIAN_OVERSIGHT;
  return null;
}

// ── OIG/SAM monthly exclusion status (HR/Compliance-owned; employee-safe) ──────
//
// Applicability is NOT inferred from clinical-vs-nonclinical role (§4). Federal OIG
// guidance imposes no single universal statutory interval; monthly screening is the
// recommended practice for anyone whose items/services may be payable by a federal
// health-care program. The current Care Indeed forms corpus (HR-FM-005) screens the
// workforce monthly, so employees default to APPLICABLE. Applicability is classified
// by actual job / program-billing exposure / contractor status / agency policy, and
// any "Not applicable" requires an APPROVED determination — otherwise REVIEW_REQUIRED.
export type OigSamState =
  | "current"
  | "under-review"
  | "waiting-hr"
  | "action-required"
  | "not-applicable-approved"
  | "review-required";

export type OigSamApplicability = "APPLICABLE" | "NOT_APPLICABLE_APPROVED" | "REVIEW_REQUIRED";

export interface OigSamStatus {
  applicability: OigSamApplicability;
  state: OigSamState;
  label: string;
  note: string;
  basis: string;
}

/** Roles the agency workforce-screening policy covers by default (clinical field
 * workers + clinical leadership). Membership here means APPLICABLE, not a due date. */
const OIG_SAM_COVERED_ROLES = new Set(["RN", "LVN", "HHA", "PT", "PTA", "OT", "COTA", "SLP", "MSW", "DON", "ADM"]);

/** Employee-safe OIG/SAM status. Never exposes the raw screening result. A role that
 * is not a recognized covered role is NOT auto-marked N/A — its applicability is
 * unresolved (REVIEW_REQUIRED), because a defensible N/A needs an approved basis. */
export function getOigSamStatus(roleCode: string): OigSamStatus {
  const role = asJourneyRole(roleCode);
  if (role && OIG_SAM_COVERED_ROLES.has(role)) {
    return {
      applicability: "APPLICABLE",
      state: "current",
      label: "Current",
      note: "Screened at least monthly under the agency workforce-screening policy. You see status only — HR/Compliance owns the raw screening result and the master log.",
      basis: "HR-FM-005 (OIG/SAM Monthly Exclusion Verification Log) · OIG recommended monthly cadence for federal-program-payable staff.",
    };
  }
  // Nonclinical / unrecognized synthetic roles: applicability depends on actual job
  // duties, federal-program billing exposure, and contractor/vendor status — which
  // are not resolved in this synthetic persona. Do NOT infer N/A from non-clinical.
  return {
    applicability: "REVIEW_REQUIRED",
    state: "review-required",
    label: "Review required",
    note: "Screening applicability for this role is determined by HR/Compliance from job duties, federal health-care-program billing/service exposure, and contractor/vendor status — not by clinical vs nonclinical. No approved 'not applicable' determination is on file.",
    basis: "Agency screening-applicability matrix (HR/Compliance-owned); REVIEW_REQUIRED until an approved determination exists.",
  };
}
