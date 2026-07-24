/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: annualAssignmentMap.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   33 ANN/DRILL/COMP-group modules mapped.
   ACHC_CLINICAL_AUDIENCE = [DON, RN, LVN, HHA, PT, PTA, OT, COTA, SLP, MSW] applied to all 12 ACHC-ART modules (fixes M04/M07/M09 roles:'ALL' leak; ADM excluded from primary audience, admSecondaryOnly:true).
   Quarter groups: Q1=8 Q2=7 Q3=7 Q4=8 (non-quarterly=3, e.g. COMP-90DAY).
   ═══════════════════════════════════════════════════════════════ */

import type { JourneyRole } from './sharedTypes.generated';

export const ACHC_CLINICAL_AUDIENCE: JourneyRole[] = ["DON","RN","LVN","HHA","PT","PTA","OT","COTA","SLP","MSW"];

export interface AnnualModuleAssignment {
  moduleId: string;
  title: string;
  family: 'ANN' | 'ACHC-ART';
  quarter: string | null;
  audience: JourneyRole[];
  admSecondaryOnly: boolean;
  note: string;
}

export const ANNUAL_ASSIGNMENT_MAP: AnnualModuleAssignment[] = [
  {
    "moduleId": "ANN-001",
    "title": "Compliance / Code of Conduct",
    "family": "ANN",
    "quarter": "Q1",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-002",
    "title": "Fraud / Waste / Abuse",
    "family": "ANN",
    "quarter": "Q1",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-003",
    "title": "HIPAA Privacy & Security",
    "family": "ANN",
    "quarter": "Q1",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-004",
    "title": "Patient Rights",
    "family": "ANN",
    "quarter": "Q1",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-005",
    "title": "Abuse / Neglect Reporting",
    "family": "ANN",
    "quarter": "Q1",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-006",
    "title": "Infection Prevention",
    "family": "ANN",
    "quarter": "Q2",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-007",
    "title": "Bloodborne Pathogen",
    "family": "ANN",
    "quarter": "Q2",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-008",
    "title": "Emergency Prep Drill #1",
    "family": "ANN",
    "quarter": "Q2",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-009",
    "title": "Workplace Safety",
    "family": "ANN",
    "quarter": "Q2",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-010",
    "title": "Anti-Harassment (2 hrs CA law)",
    "family": "ANN",
    "quarter": "Q3",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-011",
    "title": "Pain Assessment",
    "family": "ANN",
    "quarter": "Q3",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-012",
    "title": "Fall Risk Prevention",
    "family": "ANN",
    "quarter": "Q3",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-013",
    "title": "Medication Safety",
    "family": "ANN",
    "quarter": "Q3",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-014",
    "title": "OASIS Updates",
    "family": "ANN",
    "quarter": "Q4",
    "audience": [
      "RN",
      "PT",
      "OT",
      "SLP",
      "DON"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-015",
    "title": "IT Security Awareness",
    "family": "ANN",
    "quarter": "Q4",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-016",
    "title": "Emergency Prep Drill #2",
    "family": "ANN",
    "quarter": "Q4",
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-017",
    "title": "Documentation Standards",
    "family": "ANN",
    "quarter": "Q4",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ANN-018",
    "title": "Advance Directives",
    "family": "ANN",
    "quarter": "Q4",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "COMP-ANN-A",
    "title": "Annual Competency Evaluation (HR-TD-003 App. A)",
    "family": "ANN",
    "quarter": null,
    "audience": [
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "COMP-ANN-D",
    "title": "Annual HHA Competency Re-Eval (HR-TD-003 App. D — all 9 areas)",
    "family": "ANN",
    "quarter": null,
    "audience": [
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "COMP-90DAY",
    "title": "90-Day Introductory Evaluation (HR-ER-001 App. C)",
    "family": "ANN",
    "quarter": null,
    "audience": [
      "ADM",
      "DON",
      "RN",
      "LVN",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW",
      "HHA"
    ],
    "admSecondaryOnly": false,
    "note": "Direct from modules.ts (no override needed for non-ACHC annual/drill/competency modules)."
  },
  {
    "moduleId": "ACHC-ART-M01",
    "title": "Cultural Awareness",
    "family": "ACHC-ART",
    "quarter": "Q1",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M02",
    "title": "Emergency & Disaster Preparedness",
    "family": "ACHC-ART",
    "quarter": "Q1",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M03",
    "title": "Complaints & Grievances",
    "family": "ACHC-ART",
    "quarter": "Q1",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M04",
    "title": "HIPAA Privacy & Security",
    "family": "ACHC-ART",
    "quarter": "Q2",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"\"ALL\"\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M05",
    "title": "Infection Control",
    "family": "ACHC-ART",
    "quarter": "Q2",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M06",
    "title": "Communication Barriers",
    "family": "ACHC-ART",
    "quarter": "Q2",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M07",
    "title": "Workplace & Patient Safety (OSHA)",
    "family": "ACHC-ART",
    "quarter": "Q3",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"\"ALL\"\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M08",
    "title": "Patient Rights & Responsibilities",
    "family": "ACHC-ART",
    "quarter": "Q3",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M09",
    "title": "Corporate Compliance",
    "family": "ACHC-ART",
    "quarter": "Q3",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"\"ALL\"\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M10",
    "title": "Ethics in Healthcare",
    "family": "ACHC-ART",
    "quarter": "Q4",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M11",
    "title": "TB & Blood Borne Pathogens",
    "family": "ACHC-ART",
    "quarter": "Q4",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  },
  {
    "moduleId": "ACHC-ART-M12",
    "title": "Medical Device Act",
    "family": "ACHC-ART",
    "quarter": "Q4",
    "audience": [
      "DON",
      "RN",
      "LVN",
      "HHA",
      "PT",
      "PTA",
      "OT",
      "COTA",
      "SLP",
      "MSW"
    ],
    "admSecondaryOnly": true,
    "note": "ACHC_CLINICAL_AUDIENCE applied explicitly, overriding the raw modules.ts roles field (\"[\"RN\",\"LVN\",\"HHA\",\"PT\",\"PTA\",\"OT\",\"COTA\",\"SLP\",\"MSW\"]\") — fixes the M04/M07/M09 roles:'ALL' leak and the field-worker set omitting DON. GB/office/finance/HR/driver excluded."
  }
];

