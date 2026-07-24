/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: appendixFormCrosswalk.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   15 EvidenceAppendix keys classified (full EvidenceAppendix union from src/policy/journey/types/journey.ts).
   Classification counts: {"COMPOSITE_PACKET":1,"EXACT_FORM":8,"FORM_MAPPING_REVIEW_REQUIRED":4,"QUIZ_NOT_FORM":1,"NO_FORM_REQUIRED":1}
   Every formId referenced here is verified present in src/policy/data/formsLibraryDataset.ts FORMS_DATASET (build fails otherwise).
   ═══════════════════════════════════════════════════════════════ */

export type AppendixClassification = 'EXACT_FORM' | 'COMPOSITE_PACKET' | 'QUIZ_NOT_FORM' | 'NO_FORM_REQUIRED' | 'FORM_MAPPING_REVIEW_REQUIRED';

export interface AppendixCrosswalkEntry {
  appendixKey: string;
  label: string;
  classification: AppendixClassification;
  formIds: string[];
  note: string;
}

export const APPENDIX_FORM_CROSSWALK: AppendixCrosswalkEntry[] = [
  {
    "appendixKey": "F",
    "label": "HR-TA-001 Appendix F — Pre-Employment Screening Checklist",
    "classification": "COMPOSITE_PACKET",
    "formIds": [
      "HR-FM-018",
      "HR-FM-005",
      "HR-FM-006",
      "HR-FM-007"
    ],
    "note": "Pre-employment screening bundles background check, OIG/SAM exclusion check, license/cert verification, and the onboarding checklist. No single \"Appendix F\" form exists in FORMS_DATASET; composite of 4 real constituent forms."
  },
  {
    "appendixKey": "A",
    "label": "HR-TA-003 Appendix A — OIG/SAM Screening Result Form",
    "classification": "EXACT_FORM",
    "formIds": [
      "HR-FM-005"
    ],
    "note": "HR-FM-005 = OIG/SAM Monthly Exclusion Verification Log."
  },
  {
    "appendixKey": "B",
    "label": "HR-TA-004 Appendix B — Licensure Verification Record",
    "classification": "EXACT_FORM",
    "formIds": [
      "HR-FM-006"
    ],
    "note": "HR-FM-006 = License & Cert Primary Source Verification."
  },
  {
    "appendixKey": "HRTA005_A",
    "label": "HR-TA-005 Appendix A — General Orientation sign-off",
    "classification": "EXACT_FORM",
    "formIds": [
      "HR-FM-007"
    ],
    "note": "HR-FM-007 = New Hire Onboarding & Orientation Checklist."
  },
  {
    "appendixKey": "HRTA005_B",
    "label": "HR-TA-005 Appendix B — Role-specific sign-off / clearance",
    "classification": "FORM_MAPPING_REVIEW_REQUIRED",
    "formIds": [],
    "note": "No exact role-specific clearance/sign-off form found in FORMS_DATASET. Do not force a mapping."
  },
  {
    "appendixKey": "HRTA005_D",
    "label": "HR-TA-005 Appendix D — General Orientation Quiz",
    "classification": "QUIZ_NOT_FORM",
    "formIds": [],
    "note": "This appendix is the GAO-EXAM quiz itself (see policyQuizMap G-01 bundle), not a fillable form."
  },
  {
    "appendixKey": "HRTA005_E",
    "label": "HR-TA-005 Appendix E — Supervised Visit Form (new-hire clearance)",
    "classification": "FORM_MAPPING_REVIEW_REQUIRED",
    "formIds": [],
    "note": "CL-FM-042 (\"Supervisory Visit Documentation (RN)\") documents an RN supervising a PATIENT visit, not a supervisor evaluating a new-hire during onboarding supervised visits. Semantics do not match closely enough to force; flagged for review."
  },
  {
    "appendixKey": "HRTD003_A",
    "label": "HR-TD-003 Appendix A — Annual Competency Evaluation",
    "classification": "EXACT_FORM",
    "formIds": [
      "HR-FM-016"
    ],
    "note": "HR-FM-016 = Clinical Staff Competency Validation Checklist."
  },
  {
    "appendixKey": "HRTD003_C",
    "label": "HR-TD-003 Appendix C — Remediation Plan",
    "classification": "EXACT_FORM",
    "formIds": [
      "HR-FM-038"
    ],
    "note": "HR-FM-038 = Competency Remediation Plan."
  },
  {
    "appendixKey": "HRTD003_D",
    "label": "HR-TD-003 Appendix D — HHA-specific competency (9 areas)",
    "classification": "EXACT_FORM",
    "formIds": [
      "CL-FM-016"
    ],
    "note": "CL-FM-016 = HHA Competency Evaluation Checklist."
  },
  {
    "appendixKey": "HRTD003_E",
    "label": "HR-TD-003 Appendix E — HHA Supervisory Visit (14/60-day)",
    "classification": "EXACT_FORM",
    "formIds": [
      "CL-FM-042"
    ],
    "note": "CL-FM-042 = Supervisory Visit Documentation (RN) — RN supervising an HHA is exactly this appendix's subject."
  },
  {
    "appendixKey": "HRER001_C",
    "label": "HR-ER-001 Appendix C — 90-day introductory evaluation",
    "classification": "FORM_MAPPING_REVIEW_REQUIRED",
    "formIds": [],
    "note": "HR-FM-008 (\"Annual Performance Evaluation Form\") is the ANNUAL review, wrong cadence for a 90-day introductory eval. No dedicated 90-day form exists in FORMS_DATASET; not forced."
  },
  {
    "appendixKey": "HRTD001_B",
    "label": "HR-TD-001 Appendix B — Annual training dashboard",
    "classification": "FORM_MAPPING_REVIEW_REQUIRED",
    "formIds": [],
    "note": "HR-FM-017 (\"Training Attendance & Completion Roster\") is a roster, not a dashboard/summary artifact. Not forced."
  },
  {
    "appendixKey": "HRTD005_B",
    "label": "HR-TD-005 Appendix B — Emergency drill AAR",
    "classification": "EXACT_FORM",
    "formIds": [
      "RM-FM-005"
    ],
    "note": "RM-FM-005 = After-Action Review (AAR) Form (policies include OP-FM-005, matching ANN-008/ANN-016)."
  },
  {
    "appendixKey": "NONE",
    "label": "No evidence appendix required",
    "classification": "NO_FORM_REQUIRED",
    "formIds": [],
    "note": "Applies to ADV modules (cms-485, qapi, oasis-e2-soc, documentation-matters)."
  }
];

export function getAppendixCrosswalk(appendixKey: string): AppendixCrosswalkEntry | undefined {
  return APPENDIX_FORM_CROSSWALK.find((e) => e.appendixKey === appendixKey);
}

