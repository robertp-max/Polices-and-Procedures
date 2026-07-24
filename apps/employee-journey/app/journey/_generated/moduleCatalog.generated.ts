/* ═══════════════════════════════════════════════════════════════
   AUTO-GENERATED — DO NOT EDIT
   File: moduleCatalog.generated.ts
   Generator: apps/employee-journey/scripts/generateJourneyMappings.ts
   Source branch: feature/governing-body-portal
   Schema version: 1.0.0
   Regenerate with: npm run journey:map:generate (from apps/employee-journey)
   Source: src/policy/journey/data/modules.ts (ALL_MODULES, 202 records)
   Family counts: {"GAO":28,"ADM":15,"DON":16,"RN":16,"LVN":13,"PT":11,"PTA":11,"OT":11,"COTA":11,"SLP":9,"MSW":9,"HHA":15,"ANN":18,"COMP":3,"ACHC-ART":12,"ADV":4}
   ═══════════════════════════════════════════════════════════════ */

import type { JourneyRole, EvidenceAppendix } from './sharedTypes.generated';

export type ModuleFamily = 'GAO' | 'ADM' | 'DON' | 'RN' | 'LVN' | 'PT' | 'PTA' | 'OT' | 'COTA' | 'SLP' | 'MSW' | 'HHA' | 'ANN' | 'COMP' | 'ACHC-ART' | 'ADV';

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

export const MODULE_CATALOG: GeneratedModule[] = [
  {
    "id": "GAO-001",
    "title": "Agency mission, vision, values",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "EN-CM-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-002",
    "title": "Organizational Structure & Reporting Lines",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "GV-OG-001"
    ],
    "cmsRefs": [
      "42 CFR 484.105(c)"
    ],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-003",
    "title": "Scope of Services",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "GV-OG-003"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-004",
    "title": "Corporate Compliance Program",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-CP-001",
      "CO-CP-004"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-005",
    "title": "Compliance Hotline & Reporting",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-CP-006"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-006",
    "title": "Abuse, Neglect & Exploitation Prevention",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "Abuse Prevention Policy"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-007",
    "title": "Infection Control & Safety",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "Infection Control Policy"
    ],
    "cmsRefs": [
      "42 CFR 484.70"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-008",
    "title": "Emergency Preparedness",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "Emergency Preparedness Plan"
    ],
    "cmsRefs": [
      "42 CFR 484.102"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-009",
    "title": "Body Mechanics & Injury Prevention",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "Workplace Safety Policy"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-010",
    "title": "Vital Signs & Health Monitoring",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-011",
    "title": "Communication Skills",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-012",
    "title": "Cultural Competency & Sensitivity",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [],
    "cmsRefs": [
      "42 CFR 484.50"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-013",
    "title": "Documentation & Reporting",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [
      "42 CFR 484.110"
    ],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-014",
    "title": "Time Management & Professional Boundaries",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-015",
    "title": "Emergency Preparedness — Plan, Role & Communications",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "OP-FM-005",
      "CL-PR-005"
    ],
    "cmsRefs": [
      "42 CFR 484.102"
    ],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-016",
    "title": "Personal Safety During Home Visits",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "RM-SS-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-017",
    "title": "Workplace Violence Prevention",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "RM-SS-002"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-018",
    "title": "Workplace Injury Reporting",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-WM-004"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-019",
    "title": "Anti-Harassment & Non-Discrimination",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-004"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-020",
    "title": "Substance Abuse / Drug-Free Workplace",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-005"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-021",
    "title": "Disciplinary Process Overview",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-002"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-022",
    "title": "Employee Grievance Process",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-003"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-023",
    "title": "IT Acceptable Use — Email & Social Media",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "IT-UP-001",
      "IT-UP-002",
      "IT-UP-003"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-024",
    "title": "Security Awareness — Phishing & Passwords",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "IT-UP-004"
    ],
    "cmsRefs": [],
    "method": "PhishingSim",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-025",
    "title": "Documentation Standards Overview",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-026",
    "title": "Time & Attendance",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-027",
    "title": "Benefits Overview & Enrollment",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "GAO-EXAM",
    "title": "General Orientation Competency Quiz",
    "group": "GAO",
    "phase": "GAO",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-TA-005"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [
      "GAO-001",
      "GAO-002",
      "GAO-003",
      "GAO-004",
      "GAO-005",
      "GAO-006",
      "GAO-007",
      "GAO-008",
      "GAO-009",
      "GAO-010",
      "GAO-011",
      "GAO-012",
      "GAO-013",
      "GAO-014",
      "GAO-015",
      "GAO-016",
      "GAO-017",
      "GAO-018",
      "GAO-019",
      "GAO-020",
      "GAO-021",
      "GAO-022",
      "GAO-023",
      "GAO-024",
      "GAO-025",
      "GAO-026",
      "GAO-027"
    ],
    "evidenceAppendix": "HRTA005_D",
    "supervisorSignature": true,
    "family": "GAO",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-001",
    "title": "Governing Body structure, authority, bylaws",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "GV-GB-001"
    ],
    "cmsRefs": [
      "42 CFR 484.105(b)"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-002",
    "title": "Administrator authorities & delegations",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "GV-GB-001 §6.2.2"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-003",
    "title": "Corporate compliance program — detailed",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "CO-CP-001",
      "CO-CP-002"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-004",
    "title": "Compliance Officer role & coordination",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "CO-CP-002"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-005",
    "title": "QAPI program governance",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "QA-PG-001"
    ],
    "cmsRefs": [
      "42 CFR 484.65"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-006",
    "title": "Financial management & billing compliance",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "FN-BC-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-007",
    "title": "Risk management program",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "RM-ER-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-008",
    "title": "Emergency operations plan",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "OP-FM-005"
    ],
    "cmsRefs": [
      "42 CFR 484.102"
    ],
    "method": "Tabletop",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-009",
    "title": "HR oversight — recruitment, discipline, separation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "HR-TA-001",
      "HR-ER-002",
      "HR-ER-006"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-010",
    "title": "Patient referral & intake management",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "OP-IM-001"
    ],
    "cmsRefs": [],
    "method": "Observation",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-011",
    "title": "Plan of care oversight",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-012",
    "title": "IT security program oversight",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "IT-SC-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-013",
    "title": "Survey readiness & deficiency response",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "QA-AE-002",
      "QA-AE-003"
    ],
    "cmsRefs": [],
    "method": "MockSurvey",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-014",
    "title": "Privacy program oversight",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "CO-HP-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ADM-015",
    "title": "Enterprise policy taxonomy & governance",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "ADM"
    ],
    "policyRefs": [
      "EN-TG-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ADM",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-001",
    "title": "DON Role, Authority & Regulatory Mandate",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "EN-CM-001",
      "HR-TA-005"
    ],
    "cmsRefs": [
      "42 CFR 484.105(c)",
      "42 CFR 484.115"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-002",
    "title": "California Home Health Licensing & Conditions of Participation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "HR-TA-005"
    ],
    "cmsRefs": [
      "42 CFR 484.115"
    ],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-003",
    "title": "Clinical Supervision Framework",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-004",
    "title": "OASIS Oversight & Accuracy Program",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-CP-001",
      "CL-CP-002",
      "CL-CP-003",
      "CL-CP-004",
      "CL-CP-005",
      "CL-CP-006",
      "CL-CP-007",
      "CL-CP-008",
      "CL-CP-009"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-005",
    "title": "Plan of Care Management",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-OA-006"
    ],
    "cmsRefs": [],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-006",
    "title": "QAPI Program Leadership",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-CD-001",
      "CL-CD-002",
      "CL-CD-003",
      "CL-CD-004"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-007",
    "title": "Infection Prevention Program Oversight",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-OA-006"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-008",
    "title": "Emergency Preparedness — Clinical Operations Leadership",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-009",
    "title": "Patient Assessment Oversight",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "QA-PG-001"
    ],
    "cmsRefs": [
      "42 CFR 484.65"
    ],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-010",
    "title": "Clinical Documentation Standards & Audit",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [
      "42 CFR 484.70"
    ],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-011",
    "title": "HHA Supervisory Visit Program",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-SD-012",
      "CL-SD-013"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-012",
    "title": "Competency Program Leadership",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "QA-AE-001",
      "QA-AE-002"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-013",
    "title": "Staff Development & In-Service Training",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "OP-IM-001"
    ],
    "cmsRefs": [],
    "method": "Observation",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-014",
    "title": "Discharge planning & transfer coordination",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-CP-006",
      "CL-CP-007"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-015",
    "title": "EHR system — clinical management functions",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "DON-016",
    "title": "Preceptor program management",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "DON"
    ],
    "policyRefs": [
      "HR-TA-005 §6.1.2"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "DON",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-001",
    "title": "EHR system — full navigation and documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-002",
    "title": "OASIS training — item-level, completion, timing",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-OA-001"
    ],
    "cmsRefs": [],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-003",
    "title": "Evidence hierarchy for OASIS/documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-OA-006"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-004",
    "title": "Clinical documentation standards",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-CD-001",
      "CL-CD-002",
      "CL-CD-003",
      "CL-CD-004"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-005",
    "title": "Plan of care — development, physician orders",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-CP-001",
      "CL-CP-002",
      "CL-CP-003",
      "CL-CP-004",
      "CL-CP-005"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-006",
    "title": "Homebound status determination & documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-CA-005"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-007",
    "title": "Face-to-face encounter compliance",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-CA-006",
      "CL-CA-007"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-008",
    "title": "Medication management & reconciliation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-SD-012",
      "CL-SD-013"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-009",
    "title": "Fall risk assessment & prevention",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-SD-015"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-010",
    "title": "Wound care standards",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-SD-011"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-011",
    "title": "Pain assessment & management",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-SD-014"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-012",
    "title": "Infection prevention — clinical application",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-013",
    "title": "Patient identification & verification",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "OP-PA-002"
    ],
    "cmsRefs": [],
    "method": "Observation",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-014",
    "title": "Discharge planning & transfer",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "CL-CP-006",
      "CL-CP-007"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-015",
    "title": "HHA supervision responsibilities (RN role)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": false,
    "family": "RN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "RN-SUP",
    "title": "Supervised patient visits (min 2 exp / min 5 new grad)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "RN"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "RN",
    "supervisedVisitsRequired": 2,
    "annualQuarter": null
  },
  {
    "id": "LVN-001",
    "title": "EHR System — LVN Documentation Module",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [
      "42 CFR 484.115(c)"
    ],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-002",
    "title": "LVN Scope of Practice — CA B&P § 2859",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CO-RA-001"
    ],
    "cmsRefs": [
      "CA B&P §2859"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-003",
    "title": "RN Co-Signature & Supervision Requirements",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "HR-TD-003",
      "CL-CS-001"
    ],
    "cmsRefs": [
      "42 CFR 484.115(c)"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-004",
    "title": "Clinical Documentation Standards",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-CD-001",
      "CL-CD-002"
    ],
    "cmsRefs": [
      "42 CFR 484.110(a)"
    ],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-005",
    "title": "Plan of Care: Working Under RN/Physician POC",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [
      "42 CFR 484.60"
    ],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-006",
    "title": "Medication Management & Reconciliation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-SD-012",
      "CL-SD-013"
    ],
    "cmsRefs": [
      "42 CFR 484.60(a)(2)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-007",
    "title": "Wound Care: LVN Scope",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-SD-011"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-008",
    "title": "Fall Risk Assessment & Prevention",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-SD-015"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-009",
    "title": "Pain Assessment & Management",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-SD-014"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-010",
    "title": "Infection Prevention — Clinical Application",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [
      "42 CFR 484.70"
    ],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-011",
    "title": "Patient Identification & Verification",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "OP-PA-002"
    ],
    "cmsRefs": [
      "42 CFR 484.60"
    ],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-012",
    "title": "LVN-Specific Skills Check-offs per CA Practice Act",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "HR-TC-001",
      "HR-TD-003"
    ],
    "cmsRefs": [
      "CA B&P §2859"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "LVN-SUP",
    "title": "Supervised Patient Visits",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "LVN"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [
      "42 CFR 484.115(c)"
    ],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "LVN",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-001",
    "title": "EHR — therapy documentation module",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-002",
    "title": "OASIS training (PT is OASIS-authorized)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-OA-001"
    ],
    "cmsRefs": [],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-003",
    "title": "Therapy POC/plan development & goals",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-004",
    "title": "Homebound status (PT role in determining)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-CA-005"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-005",
    "title": "Fall risk — PT clinical application (Tinetti/Berg)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-SD-015"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-006",
    "title": "Pain assessment — functional",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-SD-014"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-007",
    "title": "PTA supervision requirements per CA practice act",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.115(e)"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-008",
    "title": "Therapy discharge & transfer",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-CP-006",
      "CL-CP-007"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-009",
    "title": "Infection prevention — therapy application",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-010",
    "title": "Therapy documentation standards",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PT-SUP",
    "title": "Supervised PT visits (min 2)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "PT"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "PT",
    "supervisedVisitsRequired": 2,
    "annualQuarter": null
  },
  {
    "id": "PTA-001",
    "title": "EHR — therapy documentation module (PTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-002",
    "title": "PTA scope of practice & supervision by PT",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.115(e)"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-003",
    "title": "Therapy POC execution (PTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-004",
    "title": "Homebound observation (PTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-CA-005"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-005",
    "title": "Fall-risk interventions (PTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-SD-015"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-006",
    "title": "Pain assessment — functional (PTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-SD-014"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-007",
    "title": "Transfer & body mechanics (PTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-008",
    "title": "Documentation — PTA visit notes",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-009",
    "title": "Infection prevention — therapy",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-010",
    "title": "Reporting to PT — escalation & co-sign",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "PTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "PTA-SUP",
    "title": "Supervised PTA visits (min 3)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "PTA"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "PTA",
    "supervisedVisitsRequired": 3,
    "annualQuarter": null
  },
  {
    "id": "OT-001",
    "title": "EHR — OT documentation module",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-002",
    "title": "OASIS training (OT is OASIS-authorized)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "CL-OA-001"
    ],
    "cmsRefs": [],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-003",
    "title": "OT POC & goal development",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-004",
    "title": "ADL assessment & intervention",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-005",
    "title": "Home safety evaluation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "RM-SS-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-006",
    "title": "Adaptive equipment training",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-007",
    "title": "COTA supervision per CA B&P §2570",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "CA B&P §2570"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-008",
    "title": "Homebound status — OT role",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "CL-CA-005"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-009",
    "title": "Infection prevention — OT application",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-010",
    "title": "OT documentation standards",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "OT",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "OT-SUP",
    "title": "Supervised OT visits (min 2)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "OT"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "OT",
    "supervisedVisitsRequired": 2,
    "annualQuarter": null
  },
  {
    "id": "COTA-001",
    "title": "EHR — COTA documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-002",
    "title": "COTA scope & OT supervision",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.115(g)",
      "CA B&P §2570"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-003",
    "title": "ADL intervention execution",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-004",
    "title": "Home safety observation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "RM-SS-001"
    ],
    "cmsRefs": [],
    "method": "Observation",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-005",
    "title": "Adaptive equipment — COTA role",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-006",
    "title": "Transfer & body mechanics",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-007",
    "title": "Documentation — COTA visit notes",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-008",
    "title": "Reporting to OT — escalation & co-sign",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-009",
    "title": "Infection prevention — OT application",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-010",
    "title": "Homebound observation (COTA)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "CL-CA-005"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "COTA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COTA-SUP",
    "title": "Supervised COTA visits (min 3)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "COTA"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "COTA",
    "supervisedVisitsRequired": 3,
    "annualQuarter": null
  },
  {
    "id": "SLP-001",
    "title": "EHR — SLP documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-002",
    "title": "OASIS training (SLP is OASIS-authorized)",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "CL-OA-001"
    ],
    "cmsRefs": [],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-003",
    "title": "Dysphagia assessment & management",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-004",
    "title": "Cognitive-linguistic assessment",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-005",
    "title": "Patient/caregiver education documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-006",
    "title": "SLP POC development",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-007",
    "title": "Infection prevention — SLP practice",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-008",
    "title": "Homebound status — SLP role",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "CL-CA-005"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "SLP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "SLP-SUP",
    "title": "Supervised SLP visits (min 2)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "SLP"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "SLP",
    "supervisedVisitsRequired": 2,
    "annualQuarter": null
  },
  {
    "id": "MSW-001",
    "title": "Psychosocial assessment",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-002",
    "title": "Community resource coordination",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-CP-002"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-003",
    "title": "Advance directives counseling",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-PR-002"
    ],
    "cmsRefs": [],
    "method": "Scenario",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-004",
    "title": "Abuse/neglect — extended mandatory reporter",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-PR-006",
      "HR-ER-009"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-005",
    "title": "Discharge planning — social determinants",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-CP-006"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-006",
    "title": "PHI & confidentiality — social work context",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CO-HP-001"
    ],
    "cmsRefs": [
      "42 CFR Part 2"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-007",
    "title": "EHR — MSW documentation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-CD-001",
      "IT-UP-001"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-008",
    "title": "MSW POC contribution",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "MSW",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "MSW-SUP",
    "title": "Supervised MSW visits (min 2)",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "MSW"
    ],
    "policyRefs": [
      "HR-TA-005 §6.3"
    ],
    "cmsRefs": [],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTA005_E",
    "supervisorSignature": true,
    "family": "MSW",
    "supervisedVisitsRequired": 2,
    "annualQuarter": null
  },
  {
    "id": "HHA-PRE-1",
    "title": "HHA training program completion verified",
    "group": "ROLE",
    "phase": "PRE_DAY_1",
    "week": null,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TA-004"
    ],
    "cmsRefs": [
      "42 CFR 484.80(b)"
    ],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "B",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-PRE-2",
    "title": "Prior competency evaluation verified (if prior HHA)",
    "group": "ROLE",
    "phase": "PRE_DAY_1",
    "week": null,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TA-004"
    ],
    "cmsRefs": [
      "42 CFR 484.80(c)"
    ],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "B",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-001",
    "title": "Communication skills",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(1)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-002",
    "title": "Observation, reporting, documentation of patient status",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-CD-001",
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(2)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-003",
    "title": "Reading & recording vital signs",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 1,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(3)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": 1,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-004",
    "title": "Basic infection control procedures",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(4)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-005",
    "title": "Basic body mechanics & safe transfers",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(5)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-006",
    "title": "Basic nutrition & meal preparation",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(6)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-007",
    "title": "Maintenance of clean, safe, healthy environment",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 2,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "RM-SS-001"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(7)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-008",
    "title": "Patient emotional, spiritual, cultural needs",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-PR-001"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(8)"
    ],
    "method": "Observation",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-009",
    "title": "Patient-specific competencies per care plan",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)(9)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-010",
    "title": "Personal care — bathing, grooming, toileting",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-SD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-011",
    "title": "Range of motion / ambulation assistance",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 3,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-SD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-012",
    "title": "HHA documentation — visit notes, reporting to RN",
    "group": "ROLE",
    "phase": "ROLE",
    "week": 4,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "RecordReview",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "HHA",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "HHA-SUP",
    "title": "RN Supervised Visit — 14-day / 60-day cycle",
    "group": "ROLE",
    "phase": "SUPERVISED",
    "week": null,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TD-003 Appendix E"
    ],
    "cmsRefs": [
      "42 CFR 484.80(h)"
    ],
    "method": "SupervisedVisit",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_E",
    "supervisorSignature": true,
    "family": "HHA",
    "supervisedVisitsRequired": 1,
    "annualQuarter": null
  },
  {
    "id": "ANN-001",
    "title": "Compliance / Code of Conduct",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-CP-001"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ANN-002",
    "title": "Fraud / Waste / Abuse",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-CP-001",
      "CO-CP-004"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ANN-003",
    "title": "HIPAA Privacy & Security",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-HP-001",
      "CO-HP-002"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ANN-004",
    "title": "Patient Rights",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CL-PR-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ANN-005",
    "title": "Abuse / Neglect Reporting",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CL-PR-006"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ANN-006",
    "title": "Infection Prevention",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [],
    "method": "ReturnDemo",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ANN-007",
    "title": "Bloodborne Pathogen",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "RM-OS-001"
    ],
    "cmsRefs": [
      "OSHA 29 CFR 1910.1030"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ANN-008",
    "title": "Emergency Prep Drill #1",
    "group": "DRILL",
    "phase": "DRILL",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "OP-FM-005"
    ],
    "cmsRefs": [
      "42 CFR 484.102"
    ],
    "method": "Tabletop",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD005_B",
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ANN-009",
    "title": "Workplace Safety",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "RM-SS-001",
      "RM-SS-002"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ANN-010",
    "title": "Anti-Harassment (2 hrs CA law)",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-004"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 120,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ANN-011",
    "title": "Pain Assessment",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-SD-014"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ANN-012",
    "title": "Fall Risk Prevention",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-SD-015"
    ],
    "cmsRefs": [],
    "method": "CaseStudy",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ANN-013",
    "title": "Medication Safety",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-SD-012",
      "CL-SD-013"
    ],
    "cmsRefs": [],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ANN-014",
    "title": "OASIS Updates",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
      "RN",
      "PT",
      "OT",
      "SLP",
      "DON"
    ],
    "policyRefs": [
      "CL-OA-001"
    ],
    "cmsRefs": [],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "ANN-015",
    "title": "IT Security Awareness",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "IT-UP-004"
    ],
    "cmsRefs": [],
    "method": "PhishingSim",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "ANN-016",
    "title": "Emergency Prep Drill #2",
    "group": "DRILL",
    "phase": "DRILL",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "OP-FM-005"
    ],
    "cmsRefs": [
      "42 CFR 484.102"
    ],
    "method": "Tabletop",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD005_B",
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "ANN-017",
    "title": "Documentation Standards",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "ANN-018",
    "title": "Advance Directives",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-PR-002"
    ],
    "cmsRefs": [],
    "method": "None",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ANN",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "COMP-ANN-A",
    "title": "Annual Competency Evaluation (HR-TD-003 App. A)",
    "group": "COMP",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_A",
    "supervisorSignature": true,
    "family": "COMP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COMP-ANN-D",
    "title": "Annual HHA Competency Re-Eval (HR-TD-003 App. D — all 9 areas)",
    "group": "COMP",
    "phase": "ANN",
    "week": null,
    "roles": [
      "HHA"
    ],
    "policyRefs": [
      "HR-TD-003"
    ],
    "cmsRefs": [
      "42 CFR 484.80(c)"
    ],
    "method": "SkillsCheckoff",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRTD003_D",
    "supervisorSignature": true,
    "family": "COMP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "COMP-90DAY",
    "title": "90-Day Introductory Evaluation (HR-ER-001 App. C)",
    "group": "COMP",
    "phase": "ROLE",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "HR-ER-001"
    ],
    "cmsRefs": [],
    "method": "Observation",
    "passThreshold": null,
    "durationMinutes": null,
    "prerequisites": [],
    "evidenceAppendix": "HRER001_C",
    "supervisorSignature": true,
    "family": "COMP",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "ACHC-ART-M01",
    "title": "Cultural Awareness",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "HR-TD-001",
      "CL-PR-001"
    ],
    "cmsRefs": [
      "CLAS Standards",
      "42 CFR 484.50"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ACHC-ART-M02",
    "title": "Emergency & Disaster Preparedness",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "OP-FM-005"
    ],
    "cmsRefs": [
      "42 CFR 484.102",
      "ACHC EM.1"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ACHC-ART-M03",
    "title": "Complaints & Grievances",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-PR-004"
    ],
    "cmsRefs": [
      "42 CFR 484.50(c)",
      "ACHC"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 40,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q1"
  },
  {
    "id": "ACHC-ART-M04",
    "title": "HIPAA Privacy & Security",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-HP-001",
      "CO-HP-002",
      "CO-HP-003"
    ],
    "cmsRefs": [
      "45 CFR 164",
      "HIPAA Privacy Rule"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 50,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ACHC-ART-M05",
    "title": "Infection Control",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-SD-016"
    ],
    "cmsRefs": [
      "CDC",
      "OSHA 29 CFR 1910.1030",
      "42 CFR 484.70"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 50,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ACHC-ART-M06",
    "title": "Communication Barriers",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-PR-001",
      "CL-CD-001"
    ],
    "cmsRefs": [
      "Title VI",
      "42 CFR 484.50"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q2"
  },
  {
    "id": "ACHC-ART-M07",
    "title": "Workplace & Patient Safety (OSHA)",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "RM-OS-001",
      "RM-SS-001",
      "RM-SS-002"
    ],
    "cmsRefs": [
      "OSH Act",
      "OSHA 29 CFR 1910",
      "21 CFR 803"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ACHC-ART-M08",
    "title": "Patient Rights & Responsibilities",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-PR-001",
      "CL-PR-002",
      "CL-PR-006"
    ],
    "cmsRefs": [
      "42 CFR 484.50",
      "CMS CoP"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ACHC-ART-M09",
    "title": "Corporate Compliance",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": "ALL",
    "policyRefs": [
      "CO-CP-001",
      "CO-CP-004",
      "CO-CP-005",
      "CO-CP-006"
    ],
    "cmsRefs": [
      "OIG",
      "False Claims Act",
      "Anti-Kickback Statute"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q3"
  },
  {
    "id": "ACHC-ART-M10",
    "title": "Ethics in Healthcare",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-PR-002",
      "CL-PR-001"
    ],
    "cmsRefs": [
      "42 CFR 489.100",
      "CMS CoP"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 50,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "ACHC-ART-M11",
    "title": "TB & Blood Borne Pathogens",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "RM-OS-001",
      "HR-WM-002"
    ],
    "cmsRefs": [
      "OSHA 29 CFR 1910.1030",
      "CDC",
      "42 CFR 484.70"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 50,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "ACHC-ART-M12",
    "title": "Medical Device Act",
    "group": "ANN",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "RM-MD-001"
    ],
    "cmsRefs": [
      "21 CFR 803",
      "FDA MDR"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 45,
    "prerequisites": [],
    "evidenceAppendix": null,
    "supervisorSignature": false,
    "family": "ACHC-ART",
    "supervisedVisitsRequired": null,
    "annualQuarter": "Q4"
  },
  {
    "id": "cms-485",
    "title": "CMS-485 Plan of Care and Compliance Integration",
    "group": "ADV",
    "phase": "ANN",
    "week": null,
    "roles": [
      "RN",
      "DON"
    ],
    "policyRefs": [
      "CL-CP-001"
    ],
    "cmsRefs": [
      "42 CFR 484.60"
    ],
    "method": "CaseStudy",
    "passThreshold": 0.8,
    "durationMinutes": 120,
    "prerequisites": [],
    "evidenceAppendix": "NONE",
    "supervisorSignature": false,
    "family": "ADV",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "qapi",
    "title": "Quality Assessment and Performance Improvement Training",
    "group": "ADV",
    "phase": "ANN",
    "week": null,
    "roles": [
      "RN",
      "DON"
    ],
    "policyRefs": [
      "QA-PG-001"
    ],
    "cmsRefs": [
      "42 CFR 484.65"
    ],
    "method": "Quiz",
    "passThreshold": 0.8,
    "durationMinutes": 180,
    "prerequisites": [],
    "evidenceAppendix": "NONE",
    "supervisorSignature": false,
    "family": "ADV",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "oasis-e2-soc",
    "title": "OASIS-E2 Start of Care Assessment",
    "group": "ADV",
    "phase": "ANN",
    "week": null,
    "roles": [
      "RN",
      "DON",
      "PT",
      "OT",
      "SLP"
    ],
    "policyRefs": [
      "CL-OA-001",
      "CL-OA-006"
    ],
    "cmsRefs": [
      "OASIS-E2 CMS Guidance",
      "42 CFR 484"
    ],
    "method": "CodingExercise",
    "passThreshold": 0.8,
    "durationMinutes": 150,
    "prerequisites": [],
    "evidenceAppendix": "NONE",
    "supervisorSignature": false,
    "family": "ADV",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  },
  {
    "id": "documentation-matters",
    "title": "CMS Documentation Matters / Documentation Defensibility",
    "group": "ADV",
    "phase": "ANN",
    "week": null,
    "roles": [
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
    "policyRefs": [
      "CL-CD-001"
    ],
    "cmsRefs": [
      "42 CFR 484.60"
    ],
    "method": "CaseStudy",
    "passThreshold": 0.8,
    "durationMinutes": 120,
    "prerequisites": [],
    "evidenceAppendix": "NONE",
    "supervisorSignature": false,
    "family": "ADV",
    "supervisedVisitsRequired": null,
    "annualQuarter": null
  }
];

export function getGeneratedModule(id: string): GeneratedModule | undefined {
  return MODULE_CATALOG.find((m) => m.id === id);
}

