/* ═══════════════════════════════════════════════════════════════
   CANONICAL MODULE CATALOG
   Every row traces to the source table in
   "ROLE-BASED ONBOARDING & COMPETENCY JOURNEY" (Care Indeed HHC).
   HR-TA-005 = Employee Orientation & Onboarding. NOTHING HAS BEEN REMOVED, SIMPLIFIED OR RESEQUENCED.
   ═══════════════════════════════════════════════════════════════ */

import type { JourneyModule, JourneyRole } from '@/policy/journey/types/journey';

const ALL_CLINICAL: JourneyRole[] = ['DON', 'RN', 'LVN', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'HHA'];

/* ───────────────────────────────────────────────────────────────
   PHASE 1 — GENERAL AGENCY ORIENTATION (Days 1-5)
   Source: HR-TA-005 (Employee Orientation & Onboarding) § 6.2 + Section II of the master framework.
   ───────────────────────────────────────────────────────────── */
const GAO: JourneyModule[] = [
  { id: 'GAO-001', group: 'GAO', phase: 'GAO', title: 'Agency mission, vision, values', roles: 'ALL', policyRefs: ['EN-CM-001'], cmsRefs: [], method: 'None' },
  { id: 'GAO-002', group: 'GAO', phase: 'GAO', title: 'Organizational Structure & Reporting Lines', roles: 'ALL', policyRefs: ['GV-OG-001'], cmsRefs: ['42 CFR 484.105(c)'], method: 'None' },
  { id: 'GAO-003', group: 'GAO', phase: 'GAO', title: 'Scope of Services', roles: 'ALL', policyRefs: ['GV-OG-003'], cmsRefs: [], method: 'None' },
  { id: 'GAO-004', group: 'GAO', phase: 'GAO', title: 'Corporate Compliance Program', roles: 'ALL', policyRefs: ['CO-CP-001', 'CO-CP-004'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-005', group: 'GAO', phase: 'GAO', title: 'Compliance Hotline & Reporting', roles: 'ALL', policyRefs: ['CO-CP-006'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-006', group: 'GAO', phase: 'GAO', title: 'Abuse, Neglect & Exploitation Prevention', roles: 'ALL', policyRefs: ['Abuse Prevention Policy'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-007', group: 'GAO', phase: 'GAO', title: 'Infection Control & Safety', roles: 'ALL', policyRefs: ['Infection Control Policy'], cmsRefs: ['42 CFR 484.70'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-008', group: 'GAO', phase: 'GAO', title: 'Emergency Preparedness', roles: 'ALL', policyRefs: ['Emergency Preparedness Plan'], cmsRefs: ['42 CFR 484.102'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-009', group: 'GAO', phase: 'GAO', title: 'Body Mechanics & Injury Prevention', roles: 'ALL', policyRefs: ['Workplace Safety Policy'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-010', group: 'GAO', phase: 'GAO', title: 'Vital Signs & Health Monitoring', roles: 'ALL', policyRefs: [], cmsRefs: [], method: 'None' },
  { id: 'GAO-011', group: 'GAO', phase: 'GAO', title: 'Communication Skills', roles: 'ALL', policyRefs: [], cmsRefs: [], method: 'None' },
  { id: 'GAO-012', group: 'GAO', phase: 'GAO', title: 'Cultural Competency & Sensitivity', roles: 'ALL', policyRefs: [], cmsRefs: ['42 CFR 484.50'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-013', group: 'GAO', phase: 'GAO', title: 'Documentation & Reporting', roles: 'ALL', policyRefs: ['CL-CD-001'], cmsRefs: ['42 CFR 484.110'], method: 'ReturnDemo' },
  { id: 'GAO-014', group: 'GAO', phase: 'GAO', title: 'Time Management & Professional Boundaries', roles: 'ALL', policyRefs: [], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-015', group: 'GAO', phase: 'GAO', title: 'Emergency Preparedness — Plan, Role & Communications', roles: 'ALL', policyRefs: ['OP-FM-005', 'CL-PR-005'], cmsRefs: ['42 CFR 484.102'], method: 'None' },
  { id: 'GAO-016', group: 'GAO', phase: 'GAO', title: 'Personal Safety During Home Visits', roles: 'ALL', policyRefs: ['RM-SS-001'], cmsRefs: [], method: 'None' },
  { id: 'GAO-017', group: 'GAO', phase: 'GAO', title: 'Workplace Violence Prevention', roles: 'ALL', policyRefs: ['RM-SS-002'], cmsRefs: [], method: 'None' },
  { id: 'GAO-018', group: 'GAO', phase: 'GAO', title: 'Workplace Injury Reporting', roles: 'ALL', policyRefs: ['HR-WM-004'], cmsRefs: [], method: 'None' },
  { id: 'GAO-019', group: 'GAO', phase: 'GAO', title: 'Anti-Harassment & Non-Discrimination', roles: 'ALL', policyRefs: ['HR-ER-004'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'GAO-020', group: 'GAO', phase: 'GAO', title: 'Substance Abuse / Drug-Free Workplace', roles: 'ALL', policyRefs: ['HR-ER-005'], cmsRefs: [], method: 'None' },
  { id: 'GAO-021', group: 'GAO', phase: 'GAO', title: 'Disciplinary Process Overview', roles: 'ALL', policyRefs: ['HR-ER-002'], cmsRefs: [], method: 'None' },
  { id: 'GAO-022', group: 'GAO', phase: 'GAO', title: 'Employee Grievance Process', roles: 'ALL', policyRefs: ['HR-ER-003'], cmsRefs: [], method: 'None' },
  { id: 'GAO-023', group: 'GAO', phase: 'GAO', title: 'IT Acceptable Use — Email & Social Media', roles: 'ALL', policyRefs: ['IT-UP-001', 'IT-UP-002', 'IT-UP-003'], cmsRefs: [], method: 'None' },
  { id: 'GAO-024', group: 'GAO', phase: 'GAO', title: 'Security Awareness — Phishing & Passwords', roles: 'ALL', policyRefs: ['IT-UP-004'], cmsRefs: [], method: 'PhishingSim' },
  { id: 'GAO-025', group: 'GAO', phase: 'GAO', title: 'Documentation Standards Overview', roles: 'ALL', policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'None' },
  { id: 'GAO-026', group: 'GAO', phase: 'GAO', title: 'Time & Attendance', roles: 'ALL', policyRefs: ['HR-ER-001'], cmsRefs: [], method: 'None' },
  { id: 'GAO-027', group: 'GAO', phase: 'GAO', title: 'Benefits Overview & Enrollment', roles: 'ALL', policyRefs: ['HR-ER-001'], cmsRefs: [], method: 'None' },
  {
    id: 'GAO-EXAM', group: 'GAO', phase: 'GAO',
    title: 'General Orientation Competency Quiz',
    roles: 'ALL',
    policyRefs: ['HR-TA-005'], cmsRefs: [],
    method: 'Quiz', passThreshold: 0.8,
    prerequisites: [
      'GAO-001','GAO-002','GAO-003','GAO-004','GAO-005','GAO-006','GAO-007','GAO-008','GAO-009','GAO-010',
      'GAO-011','GAO-012','GAO-013','GAO-014','GAO-015','GAO-016','GAO-017','GAO-018','GAO-019','GAO-020',
      'GAO-021','GAO-022','GAO-023','GAO-024','GAO-025','GAO-026','GAO-027',
    ],
    evidenceAppendix: 'HRTA005_D',  // HR-TA-005 Appendix D - General Orientation Quiz (internal key preserved)
    supervisorSignature: true,
  },
];

/* ───────────────────────────────────────────────────────────────
   PHASE 2 — ROLE-SPECIFIC ONBOARDING (Days 1-30)
   Source: Section III of the master framework (HR-JD-001..HR-JD-011).
   ───────────────────────────────────────────────────────────── */

const ADM: JourneyModule[] = [
  { id: 'ADM-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Governing Body structure, authority, bylaws', roles: ['ADM'], policyRefs: ['GV-GB-001'], cmsRefs: ['42 CFR 484.105(b)'], method: 'Quiz', passThreshold: 0.8, deliveryMethod: 'Classroom' },
  { id: 'ADM-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Administrator authorities & delegations', roles: ['ADM'], policyRefs: ['GV-GB-001 §6.2.2'], cmsRefs: [], method: 'CaseStudy', deliveryMethod: 'Classroom' },
  { id: 'ADM-003', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Corporate compliance program — detailed', roles: ['ADM'], policyRefs: ['CO-CP-001', 'CO-CP-002'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ADM-004', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Compliance Officer role & coordination', roles: ['ADM'], policyRefs: ['CO-CP-002'], cmsRefs: [], method: 'None' },
  { id: 'ADM-005', group: 'ROLE', phase: 'ROLE', week: 2, title: 'QAPI program governance', roles: ['ADM'], policyRefs: ['QA-PG-001'], cmsRefs: ['42 CFR 484.65'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ADM-006', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Financial management & billing compliance', roles: ['ADM'], policyRefs: ['FN-BC-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'ADM-007', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Risk management program', roles: ['ADM'], policyRefs: ['RM-ER-001'], cmsRefs: [], method: 'None' },
  { id: 'ADM-008', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Emergency operations plan', roles: ['ADM'], policyRefs: ['OP-FM-005'], cmsRefs: ['42 CFR 484.102'], method: 'Tabletop' },
  { id: 'ADM-009', group: 'ROLE', phase: 'ROLE', week: 3, title: 'HR oversight — recruitment, discipline, separation', roles: ['ADM'], policyRefs: ['HR-TA-001', 'HR-ER-002', 'HR-ER-006'], cmsRefs: [], method: 'Scenario' },
  { id: 'ADM-010', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Patient referral & intake management', roles: ['ADM'], policyRefs: ['OP-IM-001'], cmsRefs: [], method: 'Observation' },
  { id: 'ADM-011', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Plan of care oversight', roles: ['ADM'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'RecordReview' },
  { id: 'ADM-012', group: 'ROLE', phase: 'ROLE', week: 3, title: 'IT security program oversight', roles: ['ADM'], policyRefs: ['IT-SC-001'], cmsRefs: [], method: 'None' },
  { id: 'ADM-013', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Survey readiness & deficiency response', roles: ['ADM'], policyRefs: ['QA-AE-002', 'QA-AE-003'], cmsRefs: [], method: 'MockSurvey' },
  { id: 'ADM-014', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Privacy program oversight', roles: ['ADM'], policyRefs: ['CO-HP-001'], cmsRefs: [], method: 'None' },
  { id: 'ADM-015', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Enterprise policy taxonomy & governance', roles: ['ADM'], policyRefs: ['EN-TG-001'], cmsRefs: [], method: 'None' },
];

const DON: JourneyModule[] = [
  { id: 'DON-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'DON Role, Authority & Regulatory Mandate', roles: ['DON'], policyRefs: ['EN-CM-001', 'HR-TA-005'], cmsRefs: ['42 CFR 484.105(c)', '42 CFR 484.115'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'DON-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'California Home Health Licensing & Conditions of Participation', roles: ['DON'], policyRefs: ['HR-TA-005'], cmsRefs: ['42 CFR 484.115'], method: 'Scenario' },
  { id: 'DON-003', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Clinical Supervision Framework', roles: ['DON'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'DON-004', group: 'ROLE', phase: 'ROLE', week: 1, title: 'OASIS Oversight & Accuracy Program', roles: ['DON'], policyRefs: ['CL-CP-001','CL-CP-002','CL-CP-003','CL-CP-004','CL-CP-005','CL-CP-006','CL-CP-007','CL-CP-008','CL-CP-009'], cmsRefs: [], method: 'RecordReview' },
  { id: 'DON-005', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Plan of Care Management', roles: ['DON'], policyRefs: ['CL-OA-006'], cmsRefs: [], method: 'CodingExercise', passThreshold: 0.8 },
  { id: 'DON-006', group: 'ROLE', phase: 'ROLE', week: 2, title: 'QAPI Program Leadership', roles: ['DON'], policyRefs: ['CL-CD-001','CL-CD-002','CL-CD-003','CL-CD-004'], cmsRefs: [], method: 'RecordReview' },
  { id: 'DON-007', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Infection Prevention Program Oversight', roles: ['DON'], policyRefs: ['CL-OA-006'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'DON-008', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Emergency Preparedness — Clinical Operations Leadership', roles: ['DON'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'DON-009', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Patient Assessment Oversight', roles: ['DON'], policyRefs: ['QA-PG-001'], cmsRefs: ['42 CFR 484.65'], method: 'CaseStudy' },
  { id: 'DON-010', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Clinical Documentation Standards & Audit', roles: ['DON'], policyRefs: ['CL-SD-016'], cmsRefs: ['42 CFR 484.70'], method: 'None' },
  { id: 'DON-011', group: 'ROLE', phase: 'ROLE', week: 3, title: 'HHA Supervisory Visit Program', roles: ['DON'], policyRefs: ['CL-SD-012','CL-SD-013'], cmsRefs: [], method: 'Scenario' },
  { id: 'DON-012', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Competency Program Leadership', roles: ['DON'], policyRefs: ['QA-AE-001','QA-AE-002'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'DON-013', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Staff Development & In-Service Training', roles: ['DON'], policyRefs: ['OP-IM-001'], cmsRefs: [], method: 'Observation' },
  { id: 'DON-014', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Discharge planning & transfer coordination', roles: ['DON'], policyRefs: ['CL-CP-006','CL-CP-007'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'DON-015', group: 'ROLE', phase: 'ROLE', week: 4, title: 'EHR system — clinical management functions', roles: ['DON'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'DON-016', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Preceptor program management', roles: ['DON'], policyRefs: ['HR-TA-005 §6.1.2'], cmsRefs: [], method: 'None' },
];

const RN: JourneyModule[] = [
  { id: 'RN-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR system — full navigation and documentation', roles: ['RN'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'RN-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'OASIS training — item-level, completion, timing', roles: ['RN'], policyRefs: ['CL-OA-001'], cmsRefs: [], method: 'CodingExercise', passThreshold: 0.8 },
  { id: 'RN-003', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Evidence hierarchy for OASIS/documentation', roles: ['RN'], policyRefs: ['CL-OA-006'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'RN-004', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Clinical documentation standards', roles: ['RN'], policyRefs: ['CL-CD-001','CL-CD-002','CL-CD-003','CL-CD-004'], cmsRefs: [], method: 'RecordReview' },
  { id: 'RN-005', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Plan of care — development, physician orders', roles: ['RN'], policyRefs: ['CL-CP-001','CL-CP-002','CL-CP-003','CL-CP-004','CL-CP-005'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'RN-006', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Homebound status determination & documentation', roles: ['RN'], policyRefs: ['CL-CA-005'], cmsRefs: [], method: 'Scenario', passThreshold: 0.8 },
  { id: 'RN-007', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Face-to-face encounter compliance', roles: ['RN'], policyRefs: ['CL-CA-006','CL-CA-007'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'RN-008', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Medication management & reconciliation', roles: ['RN'], policyRefs: ['CL-SD-012','CL-SD-013'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'RN-009', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Fall risk assessment & prevention', roles: ['RN'], policyRefs: ['CL-SD-015'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'RN-010', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Wound care standards', roles: ['RN'], policyRefs: ['CL-SD-011'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'RN-011', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Pain assessment & management', roles: ['RN'], policyRefs: ['CL-SD-014'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'RN-012', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Infection prevention — clinical application', roles: ['RN'], policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'RN-013', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Patient identification & verification', roles: ['RN'], policyRefs: ['OP-PA-002'], cmsRefs: [], method: 'Observation' },
  { id: 'RN-014', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Discharge planning & transfer', roles: ['RN'], policyRefs: ['CL-CP-006','CL-CP-007'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'RN-015', group: 'ROLE', phase: 'ROLE', week: 4, title: 'HHA supervision responsibilities (RN role)', roles: ['RN'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTA005_E' },
  {
    id: 'RN-SUP', group: 'ROLE', phase: 'SUPERVISED',
    title: 'Supervised patient visits (min 2 exp / min 5 new grad)',
    roles: ['RN'],
    policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [],
    method: 'SupervisedVisit',
    supervisedVisitsRequired: 2,
    evidenceAppendix: 'HRTA005_E',
    supervisorSignature: true,
  },
];

/** LVN track titles aligned to standalone V5 players in modules/lvn. */
const LVN: JourneyModule[] = [
  { id: 'LVN-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR System — LVN Documentation Module', roles: ['LVN'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: ['42 CFR 484.115(c)'], method: 'ReturnDemo' },
  { id: 'LVN-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'LVN Scope of Practice — CA B&P § 2859', roles: ['LVN'], policyRefs: ['CO-RA-001'], cmsRefs: ['CA B&P §2859'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'LVN-003', group: 'ROLE', phase: 'ROLE', week: 1, title: 'RN Co-Signature & Supervision Requirements', roles: ['LVN'], policyRefs: ['HR-TD-003', 'CL-CS-001'], cmsRefs: ['42 CFR 484.115(c)'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'LVN-004', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Clinical Documentation Standards', roles: ['LVN'], policyRefs: ['CL-CD-001', 'CL-CD-002'], cmsRefs: ['42 CFR 484.110(a)'], method: 'RecordReview' },
  { id: 'LVN-005', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Plan of Care: Working Under RN/Physician POC', roles: ['LVN'], policyRefs: ['CL-CP-001'], cmsRefs: ['42 CFR 484.60'], method: 'CaseStudy' },
  { id: 'LVN-006', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Medication Management & Reconciliation', roles: ['LVN'], policyRefs: ['CL-SD-012', 'CL-SD-013'], cmsRefs: ['42 CFR 484.60(a)(2)'], method: 'SkillsCheckoff' },
  { id: 'LVN-007', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Wound Care: LVN Scope', roles: ['LVN'], policyRefs: ['CL-SD-011'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'LVN-008', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Fall Risk Assessment & Prevention', roles: ['LVN'], policyRefs: ['CL-SD-015'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'LVN-009', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Pain Assessment & Management', roles: ['LVN'], policyRefs: ['CL-SD-014'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'LVN-010', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Infection Prevention — Clinical Application', roles: ['LVN'], policyRefs: ['CL-SD-016'], cmsRefs: ['42 CFR 484.70'], method: 'ReturnDemo' },
  { id: 'LVN-011', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Patient Identification & Verification', roles: ['LVN'], policyRefs: ['OP-PA-002'], cmsRefs: ['42 CFR 484.60'], method: 'Scenario' },
  { id: 'LVN-012', group: 'ROLE', phase: 'ROLE', week: 4, title: 'LVN-Specific Skills Check-offs per CA Practice Act', roles: ['LVN'], policyRefs: ['HR-TC-001', 'HR-TD-003'], cmsRefs: ['CA B&P §2859'], method: 'SkillsCheckoff' },
  { id: 'LVN-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised Patient Visits', roles: ['LVN'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: ['42 CFR 484.115(c)'], method: 'SupervisedVisit', evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const PT: JourneyModule[] = [
  { id: 'PT-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR — therapy documentation module', roles: ['PT'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'PT-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'OASIS training (PT is OASIS-authorized)', roles: ['PT'], policyRefs: ['CL-OA-001'], cmsRefs: [], method: 'CodingExercise', passThreshold: 0.8 },
  { id: 'PT-003', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Therapy POC/plan development & goals', roles: ['PT'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'PT-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Homebound status (PT role in determining)', roles: ['PT'], policyRefs: ['CL-CA-005'], cmsRefs: [], method: 'Scenario' },
  { id: 'PT-005', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Fall risk — PT clinical application (Tinetti/Berg)', roles: ['PT'], policyRefs: ['CL-SD-015'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'PT-006', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Pain assessment — functional', roles: ['PT'], policyRefs: ['CL-SD-014'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'PT-007', group: 'ROLE', phase: 'ROLE', week: 4, title: 'PTA supervision requirements per CA practice act', roles: ['PT'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.115(e)'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'PT-008', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Therapy discharge & transfer', roles: ['PT'], policyRefs: ['CL-CP-006','CL-CP-007'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'PT-009', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Infection prevention — therapy application', roles: ['PT'], policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'PT-010', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Therapy documentation standards', roles: ['PT'], policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'RecordReview' },
  { id: 'PT-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised PT visits (min 2)', roles: ['PT'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [], method: 'SupervisedVisit', supervisedVisitsRequired: 2, evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const PTA: JourneyModule[] = [
  { id: 'PTA-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR — therapy documentation module (PTA)', roles: ['PTA'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'PTA-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'PTA scope of practice & supervision by PT', roles: ['PTA'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.115(e)'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'PTA-003', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Therapy POC execution (PTA)', roles: ['PTA'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'PTA-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Homebound observation (PTA)', roles: ['PTA'], policyRefs: ['CL-CA-005'], cmsRefs: [], method: 'Scenario' },
  { id: 'PTA-005', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Fall-risk interventions (PTA)', roles: ['PTA'], policyRefs: ['CL-SD-015'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'PTA-006', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Pain assessment — functional (PTA)', roles: ['PTA'], policyRefs: ['CL-SD-014'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'PTA-007', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Transfer & body mechanics (PTA)', roles: ['PTA'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'PTA-008', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Documentation — PTA visit notes', roles: ['PTA'], policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'RecordReview' },
  { id: 'PTA-009', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Infection prevention — therapy', roles: ['PTA'], policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'PTA-010', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Reporting to PT — escalation & co-sign', roles: ['PTA'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'Scenario' },
  { id: 'PTA-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised PTA visits (min 3)', roles: ['PTA'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [], method: 'SupervisedVisit', supervisedVisitsRequired: 3, evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const OT: JourneyModule[] = [
  { id: 'OT-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR — OT documentation module', roles: ['OT'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'OT-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'OASIS training (OT is OASIS-authorized)', roles: ['OT'], policyRefs: ['CL-OA-001'], cmsRefs: [], method: 'CodingExercise', passThreshold: 0.8 },
  { id: 'OT-003', group: 'ROLE', phase: 'ROLE', week: 2, title: 'OT POC & goal development', roles: ['OT'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'OT-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'ADL assessment & intervention', roles: ['OT'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'OT-005', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Home safety evaluation', roles: ['OT'], policyRefs: ['RM-SS-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'OT-006', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Adaptive equipment training', roles: ['OT'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'OT-007', group: 'ROLE', phase: 'ROLE', week: 4, title: 'COTA supervision per CA B&P §2570', roles: ['OT'], policyRefs: ['HR-TD-003'], cmsRefs: ['CA B&P §2570'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'OT-008', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Homebound status — OT role', roles: ['OT'], policyRefs: ['CL-CA-005'], cmsRefs: [], method: 'Scenario' },
  { id: 'OT-009', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Infection prevention — OT application', roles: ['OT'], policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'OT-010', group: 'ROLE', phase: 'ROLE', week: 4, title: 'OT documentation standards', roles: ['OT'], policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'RecordReview' },
  { id: 'OT-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised OT visits (min 2)', roles: ['OT'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [], method: 'SupervisedVisit', supervisedVisitsRequired: 2, evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const COTA: JourneyModule[] = [
  { id: 'COTA-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR — COTA documentation', roles: ['COTA'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'COTA-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'COTA scope & OT supervision', roles: ['COTA'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.115(g)', 'CA B&P §2570'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'COTA-003', group: 'ROLE', phase: 'ROLE', week: 2, title: 'ADL intervention execution', roles: ['COTA'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'COTA-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Home safety observation', roles: ['COTA'], policyRefs: ['RM-SS-001'], cmsRefs: [], method: 'Observation' },
  { id: 'COTA-005', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Adaptive equipment — COTA role', roles: ['COTA'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'COTA-006', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Transfer & body mechanics', roles: ['COTA'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'COTA-007', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Documentation — COTA visit notes', roles: ['COTA'], policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'RecordReview' },
  { id: 'COTA-008', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Reporting to OT — escalation & co-sign', roles: ['COTA'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'Scenario' },
  { id: 'COTA-009', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Infection prevention — OT application', roles: ['COTA'], policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'COTA-010', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Homebound observation (COTA)', roles: ['COTA'], policyRefs: ['CL-CA-005'], cmsRefs: [], method: 'Scenario' },
  { id: 'COTA-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised COTA visits (min 3)', roles: ['COTA'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [], method: 'SupervisedVisit', supervisedVisitsRequired: 3, evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const SLP: JourneyModule[] = [
  { id: 'SLP-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'EHR — SLP documentation', roles: ['SLP'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'SLP-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'OASIS training (SLP is OASIS-authorized)', roles: ['SLP'], policyRefs: ['CL-OA-001'], cmsRefs: [], method: 'CodingExercise', passThreshold: 0.8 },
  { id: 'SLP-003', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Dysphagia assessment & management', roles: ['SLP'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'SkillsCheckoff' },
  { id: 'SLP-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Cognitive-linguistic assessment', roles: ['SLP'], policyRefs: ['HR-TD-003'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'SLP-005', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Patient/caregiver education documentation', roles: ['SLP'], policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'RecordReview' },
  { id: 'SLP-006', group: 'ROLE', phase: 'ROLE', week: 3, title: 'SLP POC development', roles: ['SLP'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'SLP-007', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Infection prevention — SLP practice', roles: ['SLP'], policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'SLP-008', group: 'ROLE', phase: 'ROLE', week: 4, title: 'Homebound status — SLP role', roles: ['SLP'], policyRefs: ['CL-CA-005'], cmsRefs: [], method: 'Scenario' },
  { id: 'SLP-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised SLP visits (min 2)', roles: ['SLP'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [], method: 'SupervisedVisit', supervisedVisitsRequired: 2, evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const MSW: JourneyModule[] = [
  { id: 'MSW-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Psychosocial assessment', roles: ['MSW'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'MSW-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Community resource coordination', roles: ['MSW'], policyRefs: ['CL-CP-002'], cmsRefs: [], method: 'None' },
  { id: 'MSW-003', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Advance directives counseling', roles: ['MSW'], policyRefs: ['CL-PR-002'], cmsRefs: [], method: 'Scenario' },
  { id: 'MSW-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Abuse/neglect — extended mandatory reporter', roles: ['MSW'], policyRefs: ['CL-PR-006','HR-ER-009'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'MSW-005', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Discharge planning — social determinants', roles: ['MSW'], policyRefs: ['CL-CP-006'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'MSW-006', group: 'ROLE', phase: 'ROLE', week: 3, title: 'PHI & confidentiality — social work context', roles: ['MSW'], policyRefs: ['CO-HP-001'], cmsRefs: ['42 CFR Part 2'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'MSW-007', group: 'ROLE', phase: 'ROLE', week: 4, title: 'EHR — MSW documentation', roles: ['MSW'], policyRefs: ['CL-CD-001', 'IT-UP-001'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'MSW-008', group: 'ROLE', phase: 'ROLE', week: 4, title: 'MSW POC contribution', roles: ['MSW'], policyRefs: ['CL-CP-001'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'MSW-SUP', group: 'ROLE', phase: 'SUPERVISED', title: 'Supervised MSW visits (min 2)', roles: ['MSW'], policyRefs: ['HR-TA-005 §6.3'], cmsRefs: [], method: 'SupervisedVisit', supervisedVisitsRequired: 2, evidenceAppendix: 'HRTA005_E', supervisorSignature: true },
];

const HHA: JourneyModule[] = [
  { id: 'HHA-PRE-1', group: 'ROLE', phase: 'PRE_DAY_1', title: 'HHA training program completion verified', roles: ['HHA'], policyRefs: ['HR-TA-004'], cmsRefs: ['42 CFR 484.80(b)'], method: 'RecordReview', evidenceAppendix: 'B' },
  { id: 'HHA-PRE-2', group: 'ROLE', phase: 'PRE_DAY_1', title: 'Prior competency evaluation verified (if prior HHA)', roles: ['HHA'], policyRefs: ['HR-TA-004'], cmsRefs: ['42 CFR 484.80(c)'], method: 'RecordReview', evidenceAppendix: 'B' },
  { id: 'HHA-001', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Communication skills', roles: ['HHA'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)(1)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-002', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Observation, reporting, documentation of patient status', roles: ['HHA'], policyRefs: ['CL-CD-001', 'HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)(2)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-003', group: 'ROLE', phase: 'ROLE', week: 1, title: 'Reading & recording vital signs', roles: ['HHA'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)(3)'], method: 'SkillsCheckoff', passThreshold: 1.0, evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-004', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Basic infection control procedures', roles: ['HHA'], policyRefs: ['CL-SD-016'], cmsRefs: ['42 CFR 484.80(h)(4)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-005', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Basic body mechanics & safe transfers', roles: ['HHA'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)(5)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-006', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Basic nutrition & meal preparation', roles: ['HHA'], policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(h)(6)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-007', group: 'ROLE', phase: 'ROLE', week: 2, title: 'Maintenance of clean, safe, healthy environment', roles: ['HHA'], policyRefs: ['RM-SS-001'], cmsRefs: ['42 CFR 484.80(h)(7)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-008', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Patient emotional, spiritual, cultural needs', roles: ['HHA'], policyRefs: ['CL-PR-001'], cmsRefs: ['42 CFR 484.80(h)(8)'], method: 'Observation', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-009', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Patient-specific competencies per care plan', roles: ['HHA'], policyRefs: ['CL-CP-001'], cmsRefs: ['42 CFR 484.80(h)(9)'], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-010', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Personal care — bathing, grooming, toileting', roles: ['HHA'], policyRefs: ['CL-SD-003'], cmsRefs: [], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-011', group: 'ROLE', phase: 'ROLE', week: 3, title: 'Range of motion / ambulation assistance', roles: ['HHA'], policyRefs: ['CL-SD-003'], cmsRefs: [], method: 'SkillsCheckoff', evidenceAppendix: 'HRTD003_D' },
  { id: 'HHA-012', group: 'ROLE', phase: 'ROLE', week: 4, title: 'HHA documentation — visit notes, reporting to RN', roles: ['HHA'], policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'RecordReview' },
  {
    id: 'HHA-SUP', group: 'ROLE', phase: 'SUPERVISED',
    title: 'RN Supervised Visit — 14-day / 60-day cycle',
    roles: ['HHA'],
    policyRefs: ['HR-TD-003 Appendix E'], cmsRefs: ['42 CFR 484.80(h)'],
    method: 'SupervisedVisit',
    supervisedVisitsRequired: 1,
    evidenceAppendix: 'HRTD003_E',
    supervisorSignature: true,
  },
];

/* ───────────────────────────────────────────────────────────────
   ANNUAL MANDATORY TRAINING — HR-TD-001 § 6.2
   ───────────────────────────────────────────────────────────── */
const ANN: JourneyModule[] = [
  { id: 'ANN-001', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Compliance / Code of Conduct', roles: 'ALL', policyRefs: ['CO-CP-001'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ANN-002', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Fraud / Waste / Abuse', roles: 'ALL', policyRefs: ['CO-CP-001', 'CO-CP-004'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ANN-003', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'HIPAA Privacy & Security', roles: 'ALL', policyRefs: ['CO-HP-001','CO-HP-002'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ANN-004', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Patient Rights', roles: 'ALL', policyRefs: ['CL-PR-001'], cmsRefs: [], method: 'None' },
  { id: 'ANN-005', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Abuse / Neglect Reporting', roles: 'ALL', policyRefs: ['CL-PR-006'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ANN-006', group: 'ANN', phase: 'ANN', annualQuarter: 'Q2', title: 'Infection Prevention', roles: ALL_CLINICAL, policyRefs: ['CL-SD-016'], cmsRefs: [], method: 'ReturnDemo' },
  { id: 'ANN-007', group: 'ANN', phase: 'ANN', annualQuarter: 'Q2', title: 'Bloodborne Pathogen', roles: ALL_CLINICAL, policyRefs: ['RM-OS-001'], cmsRefs: ['OSHA 29 CFR 1910.1030'], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ANN-008', group: 'DRILL', phase: 'DRILL', annualQuarter: 'Q2', title: 'Emergency Prep Drill #1', roles: 'ALL', policyRefs: ['OP-FM-005'], cmsRefs: ['42 CFR 484.102'], method: 'Tabletop', evidenceAppendix: 'HRTD005_B' },
  { id: 'ANN-009', group: 'ANN', phase: 'ANN', annualQuarter: 'Q2', title: 'Workplace Safety', roles: 'ALL', policyRefs: ['RM-SS-001','RM-SS-002'], cmsRefs: [], method: 'None' },
  { id: 'ANN-010', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Anti-Harassment (2 hrs CA law)', roles: 'ALL', policyRefs: ['HR-ER-004'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8, durationMinutes: 120 },
  { id: 'ANN-011', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Pain Assessment', roles: ALL_CLINICAL, policyRefs: ['CL-SD-014'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'ANN-012', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Fall Risk Prevention', roles: ALL_CLINICAL, policyRefs: ['CL-SD-015'], cmsRefs: [], method: 'CaseStudy' },
  { id: 'ANN-013', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Medication Safety', roles: ALL_CLINICAL, policyRefs: ['CL-SD-012','CL-SD-013'], cmsRefs: [], method: 'Quiz', passThreshold: 0.8 },
  { id: 'ANN-014', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'OASIS Updates', roles: ['RN','PT','OT','SLP','DON'], policyRefs: ['CL-OA-001'], cmsRefs: [], method: 'CodingExercise', passThreshold: 0.8 },
  { id: 'ANN-015', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'IT Security Awareness', roles: 'ALL', policyRefs: ['IT-UP-004'], cmsRefs: [], method: 'PhishingSim' },
  { id: 'ANN-016', group: 'DRILL', phase: 'DRILL', annualQuarter: 'Q4', title: 'Emergency Prep Drill #2', roles: 'ALL', policyRefs: ['OP-FM-005'], cmsRefs: ['42 CFR 484.102'], method: 'Tabletop', evidenceAppendix: 'HRTD005_B' },
  { id: 'ANN-017', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'Documentation Standards', roles: ALL_CLINICAL, policyRefs: ['CL-CD-001'], cmsRefs: [], method: 'None' },
  { id: 'ANN-018', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'Advance Directives', roles: ALL_CLINICAL, policyRefs: ['CL-PR-002'], cmsRefs: [], method: 'None' },
];

/* ───────────────────────────────────────────────────────────────
   COMPETENCY / ANNUAL RE-EVAL — HR-TD-003 Appendix A & D (HR-TA-005 orients to competency per role)
   ───────────────────────────────────────────────────────────── */
const COMP: JourneyModule[] = [
  {
    id: 'COMP-ANN-A', group: 'COMP', phase: 'ANN',
    title: 'Annual Competency Evaluation (HR-TD-003 App. A)',
    roles: ALL_CLINICAL.filter(r => r !== 'HHA'),
    policyRefs: ['HR-TD-003'], cmsRefs: [],
    method: 'SkillsCheckoff',
    evidenceAppendix: 'HRTD003_A',
    supervisorSignature: true,
  },
  {
    id: 'COMP-ANN-D', group: 'COMP', phase: 'ANN',
    title: 'Annual HHA Competency Re-Eval (HR-TD-003 App. D — all 9 areas)',
    roles: ['HHA'],
    policyRefs: ['HR-TD-003'], cmsRefs: ['42 CFR 484.80(c)'],
    method: 'SkillsCheckoff',
    evidenceAppendix: 'HRTD003_D',
    supervisorSignature: true,
  },
  {
    id: 'COMP-90DAY', group: 'COMP', phase: 'ROLE',
    title: '90-Day Introductory Evaluation (HR-ER-001 App. C)',
    roles: 'ALL',
    policyRefs: ['HR-ER-001'], cmsRefs: [],
    method: 'Observation',
    evidenceAppendix: 'HRER001_C',
    supervisorSignature: true,
  },
];

/* ───────────────────────────────────────────────────────────────
   ACHC REQUIRED ANNUAL TRAINING — Field Worker Edition
   Source: ACHC Training Module for Field Worker Employees (PDF)
   Architecture: Care Indeed LMS Flow v2.0
   Frequency: On hire + Annual  |  Passing Threshold: 80%
   ───────────────────────────────────────────────────────────── */
const ALL_FIELD_WORKERS: JourneyRole[] = ['RN', 'LVN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW'];

const ACHC_ART: JourneyModule[] = [
  { id: 'ACHC-ART-M01', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Cultural Awareness', roles: ALL_FIELD_WORKERS, policyRefs: ['HR-TD-001', 'CL-PR-001'], cmsRefs: ['CLAS Standards', '42 CFR 484.50'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
  { id: 'ACHC-ART-M02', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Emergency & Disaster Preparedness', roles: ALL_FIELD_WORKERS, policyRefs: ['OP-FM-005'], cmsRefs: ['42 CFR 484.102', 'ACHC EM.1'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
  { id: 'ACHC-ART-M03', group: 'ANN', phase: 'ANN', annualQuarter: 'Q1', title: 'Complaints & Grievances', roles: ALL_FIELD_WORKERS, policyRefs: ['CL-PR-004'], cmsRefs: ['42 CFR 484.50(c)', 'ACHC'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 40 },
  { id: 'ACHC-ART-M04', group: 'ANN', phase: 'ANN', annualQuarter: 'Q2', title: 'HIPAA Privacy & Security', roles: 'ALL', policyRefs: ['CO-HP-001', 'CO-HP-002', 'CO-HP-003'], cmsRefs: ['45 CFR 164', 'HIPAA Privacy Rule'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 50 },
  { id: 'ACHC-ART-M05', group: 'ANN', phase: 'ANN', annualQuarter: 'Q2', title: 'Infection Control', roles: ALL_FIELD_WORKERS, policyRefs: ['CL-SD-016'], cmsRefs: ['CDC', 'OSHA 29 CFR 1910.1030', '42 CFR 484.70'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 50 },
  { id: 'ACHC-ART-M06', group: 'ANN', phase: 'ANN', annualQuarter: 'Q2', title: 'Communication Barriers', roles: ALL_FIELD_WORKERS, policyRefs: ['CL-PR-001', 'CL-CD-001'], cmsRefs: ['Title VI', '42 CFR 484.50'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
  { id: 'ACHC-ART-M07', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Workplace & Patient Safety (OSHA)', roles: 'ALL', policyRefs: ['RM-OS-001', 'RM-SS-001', 'RM-SS-002'], cmsRefs: ['OSH Act', 'OSHA 29 CFR 1910', '21 CFR 803'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
  { id: 'ACHC-ART-M08', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Patient Rights & Responsibilities', roles: ALL_FIELD_WORKERS, policyRefs: ['CL-PR-001', 'CL-PR-002', 'CL-PR-006'], cmsRefs: ['42 CFR 484.50', 'CMS CoP'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
  { id: 'ACHC-ART-M09', group: 'ANN', phase: 'ANN', annualQuarter: 'Q3', title: 'Corporate Compliance', roles: 'ALL', policyRefs: ['CO-CP-001', 'CO-CP-004', 'CO-CP-005', 'CO-CP-006'], cmsRefs: ['OIG', 'False Claims Act', 'Anti-Kickback Statute'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
  { id: 'ACHC-ART-M10', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'Ethics in Healthcare', roles: ALL_FIELD_WORKERS, policyRefs: ['CL-PR-002', 'CL-PR-001'], cmsRefs: ['42 CFR 489.100', 'CMS CoP'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 50 },
  { id: 'ACHC-ART-M11', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'TB & Blood Borne Pathogens', roles: ALL_FIELD_WORKERS, policyRefs: ['RM-OS-001', 'HR-WM-002'], cmsRefs: ['OSHA 29 CFR 1910.1030', 'CDC', '42 CFR 484.70'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 50 },
  { id: 'ACHC-ART-M12', group: 'ANN', phase: 'ANN', annualQuarter: 'Q4', title: 'Medical Device Act', roles: ALL_FIELD_WORKERS, policyRefs: ['RM-MD-001'], cmsRefs: ['21 CFR 803', 'FDA MDR'], method: 'Quiz', passThreshold: 0.8, durationMinutes: 45 },
];

const ADV: JourneyModule[] = [
  {
    id: 'cms-485',
    group: 'ADV',
    phase: 'ANN',
    title: 'CMS-485 Plan of Care and Compliance Integration',
    roles: ['RN', 'DON'],
    policyRefs: ['CL-CP-001'],
    cmsRefs: ['42 CFR 484.60'],
    method: 'CaseStudy',
    passThreshold: 0.8,
    evidenceAppendix: 'NONE',
    durationMinutes: 120,
  },
  {
    id: 'qapi',
    group: 'ADV',
    phase: 'ANN',
    title: 'Quality Assessment and Performance Improvement Training',
    roles: ['RN', 'DON'],
    policyRefs: ['QA-PG-001'],
    cmsRefs: ['42 CFR 484.65'],
    method: 'Quiz',
    passThreshold: 0.8,
    evidenceAppendix: 'NONE',
    durationMinutes: 180,
  },
  {
    id: 'oasis-e2-soc',
    group: 'ADV',
    phase: 'ANN',
    title: 'OASIS-E2 Start of Care Assessment',
    roles: ['RN', 'DON', 'PT', 'OT', 'SLP'],
    policyRefs: ['CL-OA-001', 'CL-OA-006'],
    cmsRefs: ['OASIS-E2 CMS Guidance', '42 CFR 484'],
    method: 'CodingExercise',
    passThreshold: 0.8,
    evidenceAppendix: 'NONE',
    durationMinutes: 150,
  },
  {
    id: 'documentation-matters',
    group: 'ADV',
    phase: 'ANN',
    title: 'CMS Documentation Matters / Documentation Defensibility',
    roles: ALL_CLINICAL,
    policyRefs: ['CL-CD-001'],
    cmsRefs: ['42 CFR 484.60'],
    method: 'CaseStudy',
    passThreshold: 0.8,
    evidenceAppendix: 'NONE',
    durationMinutes: 120,
  },
];

export const ALL_MODULES: JourneyModule[] = [
  ...GAO,
  ...ADM, ...DON, ...RN, ...LVN,
  ...PT, ...PTA, ...OT, ...COTA,
  ...SLP, ...MSW, ...HHA,
  ...ANN, ...COMP,
  ...ACHC_ART,
  ...ADV,
];

export { ACHC_ART };

export function modulesForRole(role: JourneyRole): JourneyModule[] {
  return ALL_MODULES.filter(m => m.roles === 'ALL' || m.roles.includes(role));
}

export function moduleById(id: string): JourneyModule | undefined {
  return ALL_MODULES.find(m => m.id === id);
}
