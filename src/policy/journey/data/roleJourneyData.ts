// Role-Based Onboarding & Competency Journey — source data
// Derived from "ROLE-BASED ONBOARDING & COMPETENCY JOURNEY" (42 CFR Part 484 | CMS CoP alignment)
// Policy mappings: HR-JD-001..011, HR-TA-001..006, HR-TD-001..005, HR-ER series.

export type CompetencyKind =
  | 'quiz'
  | 'return-demo'
  | 'case-study'
  | 'scenario'
  | 'skills-checkoff'
  | 'exercise'
  | 'observation'
  | 'drill'
  | 'none';

export interface RoleModuleRow {
  id: string;
  phase: string; // e.g. 'Week 1'
  title: string;
  policy: string;
  method?: string;
  competency: string;
  competencyKind: CompetencyKind;
}

export interface RoleDef {
  id: string; // 'JD-003'
  jdPolicy: string; // 'HR-JD-001'
  title: string;
  short: string;
  tag: string;
  cfr: string;
  licensure: string;
  reportsTo: string;
  description: string;
  moduleCountLabel: string;
  lmsPrefix: string;
  supervisedVisits: string | null;
  clearance: string;
  managerNotes: string[];
  derivedNote?: string;
  modules: RoleModuleRow[];
}

export interface RoleOnboardingPathDef {
  id: string;
  label: string;
  title: string;
  description: string;
  roleShorts: string[];
}

export interface PreHireStep {
  step: string;
  action: string;
  policy: string;
  evidence: string;
}

export interface GaoModuleRow {
  n: number;
  id: string;
  topic: string;
  policy: string;
  assessment: string;
  hasQuiz: boolean;
}

export interface AnnualTrainingRow {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  training: string;
  staff: string;
  assessment: string;
  lms: string;
}

export interface MonitoringRow {
  activity: string;
  frequency: string;
  policy: string;
  evidence: string;
}

export interface EvidenceMapRow {
  surveyorAction: string;
  lookFor: string;
  evidence: string;
}

export interface EscalationRow {
  trigger: string;
  timeline: string;
  action: string;
  policy: string;
  severity: 'critical' | 'escalating' | 'monitor';
}

export interface SupervisionRow {
  roleId: string;
  role: string;
  requirement: string;
  evaluator: string;
  form: string;
}

// ---------------------------------------------------------------------------
// Phase 0 — Universal Pre-Day-1 Clearance (HR-TA-001 §§ 6.4–6.5)
// ---------------------------------------------------------------------------

export const PRE_HIRE_STEPS: PreHireStep[] = [
  { step: '0.1', action: 'Criminal background check COMPLETED & CLEARED', policy: 'HR-TA-002', evidence: 'Appendix F — Pre-Employment Screening Checklist PASS' },
  { step: '0.2', action: 'OIG LEIE + SAM exclusion screening CLEARED', policy: 'HR-TA-003', evidence: 'Appendix A — OIG/SAM Screening Result Form' },
  { step: '0.3', action: 'Primary source licensure verification COMPLETED', policy: 'HR-TA-004', evidence: 'Appendix B — Licensure Verification Record + screenshot' },
  { step: '0.4', action: 'References verified (minimum 2)', policy: 'HR-TA-001 § 6.4.3(d)', evidence: 'Appendix F items 6–7 documented' },
  { step: '0.5', action: 'I-9 employment eligibility completed', policy: 'HR-TA-001 § 6.4.3(e)', evidence: 'Appendix F item 8' },
  { step: '0.6', action: 'Health screening & immunizations', policy: 'HR-WM-003', evidence: 'Appendix F items 9–10' },
  { step: '0.7', action: 'Drug screening (if applicable)', policy: 'HR-ER-005', evidence: 'Appendix F item 11' },
  { step: '0.8', action: 'Driving record check (if driving)', policy: 'RM-SS-003', evidence: 'Appendix F item 13' },
  { step: '0.9', action: 'All Appendix F items PASS / N/A — signed by HR Director', policy: 'HR-TA-001 § 6.4.4', evidence: 'Signed Appendix F in personnel file' },
];

// ---------------------------------------------------------------------------
// Phase 1 — General Agency Orientation, Days 1–5 (HR-TA-005 § 6.2)
// ---------------------------------------------------------------------------

export const GAO_MODULES: GaoModuleRow[] = [
  { n: 1, id: 'GAO-001', topic: 'Agency mission, vision, values', policy: '—', assessment: '—', hasQuiz: false },
  { n: 2, id: 'GAO-002', topic: 'Organizational structure & reporting', policy: 'GV-OG-001', assessment: '—', hasQuiz: false },
  { n: 3, id: 'GAO-003', topic: 'Scope of Services', policy: 'GV-OG-003', assessment: '—', hasQuiz: false },
  { n: 4, id: 'GAO-004', topic: 'Corporate Compliance Program', policy: 'CO-CP-001, CO-CP-004', assessment: 'Quiz (80%)', hasQuiz: true },
  { n: 5, id: 'GAO-005', topic: 'Compliance Hotline & Reporting', policy: 'CO-CP-006', assessment: 'Quiz', hasQuiz: true },
  { n: 6, id: 'GAO-006', topic: 'Whistleblower protection', policy: 'CO-CP-005', assessment: 'Quiz', hasQuiz: true },
  { n: 7, id: 'GAO-007', topic: 'HIPAA privacy — PHI handling, minimum necessary', policy: 'CO-HP-001, CO-HP-004', assessment: 'Quiz (80%)', hasQuiz: true },
  { n: 8, id: 'GAO-008', topic: 'HIPAA security — passwords, devices, data', policy: 'CO-HP-002', assessment: 'Quiz (80%)', hasQuiz: true },
  { n: 9, id: 'GAO-009', topic: 'HIPAA breach reporting', policy: 'CO-HP-003', assessment: 'Quiz', hasQuiz: true },
  { n: 10, id: 'GAO-010', topic: 'Vital Signs & Health Monitoring', policy: 'CL-PR-001', assessment: '—', hasQuiz: false },
  { n: 11, id: 'GAO-011', topic: 'Communication Skills', policy: 'CL-PR-002', assessment: '—', hasQuiz: false },
  { n: 12, id: 'GAO-012', topic: 'Cultural Competency & Sensitivity', policy: 'CL-PR-006, HR-ER-009', assessment: 'Quiz (80%)', hasQuiz: true },
  { n: 13, id: 'GAO-013', topic: 'Documentation & Reporting', policy: 'CL-SD-016', assessment: 'Return demo', hasQuiz: false },
  { n: 14, id: 'GAO-014', topic: 'Time Management & Professional Boundaries', policy: 'OSHA 29 CFR 1910.1030', assessment: 'Quiz (80%)', hasQuiz: true },
  { n: 15, id: 'GAO-015', topic: 'Emergency Preparedness — Plan, Role & Communications', policy: 'OP-FM-005, CL-PR-005', assessment: '—', hasQuiz: false },
  { n: 16, id: 'GAO-016', topic: 'Personal Safety During Home Visits', policy: 'RM-SS-001', assessment: '—', hasQuiz: false },
  { n: 17, id: 'GAO-017', topic: 'Workplace Violence Prevention', policy: 'RM-SS-002', assessment: '—', hasQuiz: false },
  { n: 18, id: 'GAO-018', topic: 'Workplace Injury Reporting', policy: 'HR-WM-004', assessment: '—', hasQuiz: false },
  { n: 19, id: 'GAO-019', topic: 'Anti-Harassment & Non-Discrimination', policy: 'HR-ER-004', assessment: 'Quiz (80%)', hasQuiz: true },
  { n: 20, id: 'GAO-020', topic: 'Substance Abuse / Drug-Free Workplace', policy: 'HR-ER-005', assessment: '—', hasQuiz: false },
  { n: 21, id: 'GAO-021', topic: 'Disciplinary Process Overview', policy: 'HR-ER-002', assessment: '—', hasQuiz: false },
  { n: 22, id: 'GAO-022', topic: 'Employee Grievance Process', policy: 'HR-ER-003', assessment: '—', hasQuiz: false },
  { n: 23, id: 'GAO-023', topic: 'IT Acceptable Use — Email & Social Media', policy: 'IT-UP-001, IT-UP-002, IT-UP-003', assessment: '—', hasQuiz: false },
  { n: 24, id: 'GAO-024', topic: 'Security Awareness — Phishing & Passwords', policy: 'IT-UP-004', assessment: 'Phishing sim', hasQuiz: false },
  { n: 25, id: 'GAO-025', topic: 'Documentation Standards Overview', policy: 'CL-CD-001', assessment: '—', hasQuiz: false },
  { n: 26, id: 'GAO-026', topic: 'Time & Attendance', policy: '—', assessment: '—', hasQuiz: false },
  { n: 27, id: 'GAO-027', topic: 'Benefits Overview & Enrollment', policy: '—', assessment: '—', hasQuiz: false },
  { n: 28, id: 'GAO-EXAM', topic: 'General Orientation Competency Quiz', policy: 'HR-TA-005 Appendix D', assessment: '80% pass (16/20)', hasQuiz: true },
];

// ---------------------------------------------------------------------------
// Phase 2 — Role-specific journeys (Days 1–30)
// ---------------------------------------------------------------------------

const ADM_MODULES: RoleModuleRow[] = [
  { id: 'ADM-001', phase: 'Week 1', title: 'Governing Body structure, authority, bylaws', policy: 'GV-GB-001', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'ADM-002', phase: 'Week 1', title: 'Administrator authorities & delegations', policy: 'GV-GB-001 § 6.2.2', method: 'Classroom', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'ADM-003', phase: 'Week 1', title: 'Corporate compliance program — detailed', policy: 'CO-CP-001, CO-CP-002', method: 'Classroom', competency: 'Quiz (80%)', competencyKind: 'quiz' },
  { id: 'ADM-004', phase: 'Week 1', title: 'Compliance Officer role & coordination', policy: 'CO-CP-002', method: 'Classroom', competency: '—', competencyKind: 'none' },
  { id: 'ADM-005', phase: 'Week 2', title: 'QAPI program governance', policy: 'QA-PG-001', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'ADM-006', phase: 'Week 2', title: 'Financial management & billing compliance', policy: 'FN-BC-001', method: 'Classroom + review', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'ADM-007', phase: 'Week 2', title: 'Risk management program', policy: 'RM-ER-001', method: 'Classroom', competency: '—', competencyKind: 'none' },
  { id: 'ADM-008', phase: 'Week 2', title: 'Emergency operations plan', policy: 'OP-FM-005', method: 'Classroom + walkthrough', competency: 'Tabletop drill', competencyKind: 'drill' },
  { id: 'ADM-009', phase: 'Week 3', title: 'HR oversight — recruitment, discipline, separation', policy: 'HR-TA-001, HR-ER-002, HR-ER-006', method: 'Classroom', competency: 'Scenario', competencyKind: 'scenario' },
  { id: 'ADM-010', phase: 'Week 3', title: 'Patient referral & intake management', policy: 'OP-RI-001', method: 'Process observation', competency: '—', competencyKind: 'none' },
  { id: 'ADM-011', phase: 'Week 3', title: 'Plan of care oversight', policy: 'CL-CP-001', method: 'Record review', competency: '—', competencyKind: 'none' },
  { id: 'ADM-012', phase: 'Week 3', title: 'IT security program oversight', policy: 'IT-SC-001', method: 'Briefing', competency: '—', competencyKind: 'none' },
  { id: 'ADM-013', phase: 'Week 4', title: 'Survey readiness & deficiency response', policy: 'QA-AE-002, QA-AE-003', method: 'Classroom + mock survey', competency: 'Mock survey exercise', competencyKind: 'exercise' },
  { id: 'ADM-014', phase: 'Week 4', title: 'Privacy program oversight', policy: 'CO-HP-001', method: 'Classroom', competency: '—', competencyKind: 'none' },
  { id: 'ADM-015', phase: 'Week 4', title: 'Enterprise policy taxonomy & governance', policy: 'EN-TG-001', method: 'Classroom', competency: '—', competencyKind: 'none' },
];

const DON_MODULES: RoleModuleRow[] = [
  { id: 'DON-001', phase: 'Week 1', title: 'Clinical Manager CMS CoP requirements', policy: '§ 484.105(c), § 484.115', method: 'Classroom', competency: 'Quiz (80%)', competencyKind: 'quiz' },
  { id: 'DON-002', phase: 'Week 1', title: 'Clinical supervision framework — RN, LVN, PT, OT, SLP, MSW, HHA', policy: 'All § 484.115 subsections', method: 'Classroom', competency: 'Scenario', competencyKind: 'scenario' },
  { id: 'DON-003', phase: 'Week 1', title: 'HHA supervision requirements — 14-day / 60-day cycle', policy: '§ 484.80(h)', method: 'Classroom + forms review', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'DON-004', phase: 'Week 1', title: 'Plan of care development & physician order management', policy: 'CL-CP-001 through CL-CP-009', method: 'Case study + record review', competency: 'Record audit exercise', competencyKind: 'exercise' },
  { id: 'DON-005', phase: 'Week 2', title: 'OASIS oversight & accuracy', policy: 'CL-OA series, CL-OA-006', method: 'Classroom + coding exercise', competency: 'Coding assessment (80%)', competencyKind: 'exercise' },
  { id: 'DON-006', phase: 'Week 2', title: 'Clinical documentation standards & audit', policy: 'CL-CD-001 through CL-CD-004', method: 'Record review exercise', competency: 'Documentation audit', competencyKind: 'exercise' },
  { id: 'DON-007', phase: 'Week 2', title: 'Evidence hierarchy for documentation', policy: 'CL-OA-006', method: 'Classroom', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'DON-008', phase: 'Week 2', title: 'Competency evaluation program management', policy: 'HR-TD-003', method: 'Classroom + tool review', competency: 'Appendix A completion exercise', competencyKind: 'exercise' },
  { id: 'DON-009', phase: 'Week 3', title: 'QAPI — clinical quality measures, HHQRP', policy: 'QA-PG-001, QA-PI series', method: 'Classroom + data review', competency: 'Data analysis exercise', competencyKind: 'exercise' },
  { id: 'DON-010', phase: 'Week 3', title: 'Infection prevention program oversight', policy: 'CL-SD-016, § 484.70', method: 'Classroom', competency: '—', competencyKind: 'none' },
  { id: 'DON-011', phase: 'Week 3', title: 'Medication management oversight', policy: 'CL-SD-012, CL-SD-013', method: 'Case study', competency: 'Scenario', competencyKind: 'scenario' },
  { id: 'DON-012', phase: 'Week 3', title: 'Patient safety events — identification, reporting, RCA', policy: 'QA-AE-001, QA-AE-002', method: 'Classroom + case study', competency: 'RCA exercise', competencyKind: 'exercise' },
  { id: 'DON-013', phase: 'Week 4', title: 'Referral & intake — clinical screening', policy: 'OP-RI-001', method: 'Process observation', competency: '—', competencyKind: 'none' },
  { id: 'DON-014', phase: 'Week 4', title: 'Discharge planning & transfer coordination', policy: 'CL-CP-006, CL-CP-007', method: 'Case study', competency: '—', competencyKind: 'none' },
  { id: 'DON-015', phase: 'Week 4', title: 'EHR system — clinical management functions', policy: '—', method: 'Hands-on', competency: 'Proficiency demo', competencyKind: 'return-demo' },
  { id: 'DON-016', phase: 'Week 4', title: 'Preceptor program management', policy: 'HR-TA-005 § 6.1.2', method: 'Classroom', competency: '—', competencyKind: 'none' },
];

const RN_MODULES: RoleModuleRow[] = [
  { id: 'RN-001', phase: 'Week 1', title: 'EHR system — full navigation and documentation', policy: '—', method: 'Classroom + demo', competency: 'Return demo (mock note)', competencyKind: 'return-demo' },
  { id: 'RN-002', phase: 'Week 1', title: 'OASIS training — item-level, completion, timing', policy: 'CL-OA series', method: 'Classroom + e-learning', competency: 'Coding exercise (80%)', competencyKind: 'exercise' },
  { id: 'RN-003', phase: 'Week 1', title: 'Evidence hierarchy for OASIS / documentation', policy: 'CL-OA-006', method: 'Classroom', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'RN-004', phase: 'Week 1', title: 'Clinical documentation standards', policy: 'CL-CD-001 to CL-CD-004', method: 'Classroom', competency: 'Record review exercise', competencyKind: 'exercise' },
  { id: 'RN-005', phase: 'Week 2', title: 'Plan of care — development, physician orders', policy: 'CL-CP-001 to CL-CP-005', method: 'Classroom + case study', competency: 'POC completion exercise', competencyKind: 'exercise' },
  { id: 'RN-006', phase: 'Week 2', title: 'Homebound status determination & documentation', policy: 'CL-CA-005', method: 'Case study', competency: 'Scenario (80%)', competencyKind: 'scenario' },
  { id: 'RN-007', phase: 'Week 2', title: 'Face-to-face encounter compliance', policy: 'CL-CA-006, CL-CA-007', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'RN-008', phase: 'Week 2', title: 'Medication management & reconciliation', policy: 'CL-SD-012, CL-SD-013', method: 'Classroom + demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'RN-009', phase: 'Week 3', title: 'Fall risk assessment & prevention', policy: 'CL-SD-015', method: 'Case study', competency: 'Case study assessment', competencyKind: 'case-study' },
  { id: 'RN-010', phase: 'Week 3', title: 'Wound care standards', policy: 'CL-SD-011', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'RN-011', phase: 'Week 3', title: 'Pain assessment & management', policy: 'CL-SD-014', method: 'Case study', competency: 'Case study assessment', competencyKind: 'case-study' },
  { id: 'RN-012', phase: 'Week 3', title: 'Infection prevention — clinical application', policy: 'CL-SD-016', method: 'Demo + return demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'RN-013', phase: 'Week 3', title: 'Patient identification & verification', policy: 'OP-PA-002', method: 'Observation', competency: '—', competencyKind: 'none' },
  { id: 'RN-014', phase: 'Week 4', title: 'Discharge planning & transfer', policy: 'CL-CP-006, CL-CP-007', method: 'Case study', competency: '—', competencyKind: 'none' },
  { id: 'RN-015', phase: 'Week 4', title: 'HHA supervision responsibilities (RN role)', policy: '§ 484.80(h)', method: 'Classroom + form review', competency: 'Appendix E completion', competencyKind: 'exercise' },
  { id: 'RN-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 2 experienced RN; min 5 new grads / new to HH)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

// LVN V5 track — titles aligned to standalone modules in modules/lvn.
const LVN_MODULES: RoleModuleRow[] = [
  { id: 'LVN-001', phase: 'Week 1', title: 'EHR System — LVN Documentation Module', policy: 'CL-CD-001, IT-UP-001', method: 'Classroom + demo', competency: 'Return demo (mock note)', competencyKind: 'return-demo' },
  { id: 'LVN-002', phase: 'Week 1', title: 'LVN Scope of Practice — CA B&P § 2859', policy: 'CA B&P Code § 2859', method: 'Classroom', competency: 'Quiz (80%)', competencyKind: 'quiz' },
  { id: 'LVN-003', phase: 'Week 1', title: 'RN Co-Signature & Supervision Requirements', policy: 'HR-TD-003 / CL-CS-001', method: 'Classroom + form review', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'LVN-004', phase: 'Week 1', title: 'Clinical Documentation Standards', policy: 'CL-CD-001 to CL-CD-002', method: 'Classroom', competency: 'Record review exercise', competencyKind: 'exercise' },
  { id: 'LVN-005', phase: 'Week 2', title: 'Plan of Care: Working Under RN/Physician POC', policy: 'CL-CP-001', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'LVN-006', phase: 'Week 2', title: 'Medication Management & Reconciliation', policy: 'CL-SD-012, CL-SD-013', method: 'Classroom + demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'LVN-007', phase: 'Week 3', title: 'Wound Care: LVN Scope', policy: 'CL-SD-011', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'LVN-008', phase: 'Week 3', title: 'Fall Risk Assessment & Prevention', policy: 'CL-SD-015', method: 'Case study', competency: 'Case study assessment', competencyKind: 'case-study' },
  { id: 'LVN-009', phase: 'Week 3', title: 'Pain Assessment & Management', policy: 'CL-SD-014', method: 'Case study', competency: 'Case study assessment', competencyKind: 'case-study' },
  { id: 'LVN-010', phase: 'Week 3', title: 'Infection Prevention — Clinical Application', policy: 'CL-SD-016', method: 'Demo + return demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'LVN-011', phase: 'Week 4', title: 'Patient Identification & Verification', policy: 'OP-PA-002', method: 'Observation', competency: 'Scenario', competencyKind: 'scenario' },
  { id: 'LVN-012', phase: 'Week 4', title: 'LVN-Specific Skills Check-offs per CA Practice Act', policy: 'CA B&P Code § 2859 / HR-TC-001', method: 'Skills lab', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'LVN-SUP', phase: 'Weeks 2–4', title: 'Supervised Patient Visits', policy: 'HR-TA-005 § 6.3 — number required by current agency policy', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const PT_MODULES: RoleModuleRow[] = [
  { id: 'PT-001', phase: 'Week 1', title: 'EHR — therapy documentation module', policy: '—', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'PT-002', phase: 'Week 1', title: 'OASIS training (PT is OASIS-authorized)', policy: 'CL-OA series', method: 'Classroom + e-learning', competency: 'Coding exercise (80%)', competencyKind: 'exercise' },
  { id: 'PT-003', phase: 'Week 2', title: 'Therapy POC / plan development & goals', policy: 'CL-CP-001, discipline-specific', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'PT-004', phase: 'Week 2', title: 'Homebound status (PT role in determining)', policy: 'CL-CA-005', method: 'Case study', competency: 'Scenario', competencyKind: 'scenario' },
  { id: 'PT-005', phase: 'Week 3', title: 'Fall risk — PT clinical application', policy: 'CL-SD-015', method: 'Demo', competency: 'Return demo (Tinetti / Berg)', competencyKind: 'return-demo' },
  { id: 'PT-006', phase: 'Week 3', title: 'Pain assessment — functional', policy: 'CL-SD-014', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'PT-007', phase: 'Week 4', title: 'PTA supervision requirements per CA practice act', policy: '§ 484.115(e)', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'PT-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 2)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const PTA_MODULES: RoleModuleRow[] = [
  { id: 'PTA-001', phase: 'Week 1', title: 'EHR — therapy documentation module', policy: '—', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'PTA-002', phase: 'Week 2', title: 'Therapy POC implementation & goal tracking', policy: 'CL-CP-001, discipline-specific', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'PTA-003', phase: 'Week 3', title: 'Fall risk — clinical application', policy: 'CL-SD-015', method: 'Demo', competency: 'Return demo (Tinetti / Berg)', competencyKind: 'return-demo' },
  { id: 'PTA-004', phase: 'Week 3', title: 'Pain assessment — functional', policy: 'CL-SD-014', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'PTA-005', phase: 'Week 4', title: 'Working under PT direct supervision per CA practice act', policy: '§ 484.115(e)', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'PTA-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 3)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const OT_MODULES: RoleModuleRow[] = [
  { id: 'OT-001', phase: 'Week 1', title: 'EHR — therapy documentation module', policy: '—', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'OT-002', phase: 'Week 1', title: 'OASIS training (OT is OASIS-authorized)', policy: 'CL-OA series', method: 'Classroom + e-learning', competency: 'Coding exercise (80%)', competencyKind: 'exercise' },
  { id: 'OT-003', phase: 'Week 2', title: 'Therapy POC / plan development & goals', policy: 'CL-CP-001, discipline-specific', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'OT-004', phase: 'Week 2', title: 'ADL assessment & intervention competencies', policy: 'Discipline-specific', method: 'Demo + case study', competency: 'Skills demo', competencyKind: 'skills-checkoff' },
  { id: 'OT-005', phase: 'Week 3', title: 'Home safety evaluation', policy: 'Discipline-specific', method: 'Field observation', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'OT-006', phase: 'Week 3', title: 'Adaptive equipment training', policy: 'Discipline-specific', method: 'Demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'OT-007', phase: 'Week 4', title: 'COTA supervision requirements', policy: 'CA B&P Code § 2570', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'OT-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 2)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const COTA_MODULES: RoleModuleRow[] = [
  { id: 'COTA-001', phase: 'Week 1', title: 'EHR — therapy documentation module', policy: '—', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'COTA-002', phase: 'Week 2', title: 'Therapy POC implementation & goal tracking', policy: 'CL-CP-001, discipline-specific', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'COTA-003', phase: 'Week 2', title: 'ADL intervention delivery', policy: 'Discipline-specific', method: 'Demo + case study', competency: 'Skills demo', competencyKind: 'skills-checkoff' },
  { id: 'COTA-004', phase: 'Week 3', title: 'Adaptive equipment training', policy: 'Discipline-specific', method: 'Demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'COTA-005', phase: 'Week 4', title: 'Working under OT supervision', policy: 'CA B&P Code § 2570', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'COTA-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 3)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const SLP_MODULES: RoleModuleRow[] = [
  { id: 'SLP-001', phase: 'Week 1', title: 'EHR — SLP documentation', policy: '—', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'SLP-002', phase: 'Week 1', title: 'OASIS training (SLP is OASIS-authorized)', policy: 'CL-OA series', method: 'Classroom + e-learning', competency: 'Coding exercise (80%)', competencyKind: 'exercise' },
  { id: 'SLP-003', phase: 'Week 2', title: 'Dysphagia assessment & management', policy: 'Discipline-specific', method: 'Case study + demo', competency: 'Case study + skills demo', competencyKind: 'skills-checkoff' },
  { id: 'SLP-004', phase: 'Week 3', title: 'Cognitive-linguistic assessment', policy: 'Discipline-specific', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'SLP-005', phase: 'Week 4', title: 'Patient / caregiver education documentation', policy: 'CL-CD-001', method: 'Record review', competency: 'Record review', competencyKind: 'exercise' },
  { id: 'SLP-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 2)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const MSW_MODULES: RoleModuleRow[] = [
  { id: 'MSW-001', phase: 'Week 1', title: 'Psychosocial assessment', policy: 'Discipline-specific', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'MSW-002', phase: 'Week 1', title: 'Community resource coordination', policy: 'Discipline-specific', method: 'Classroom', competency: '—', competencyKind: 'none' },
  { id: 'MSW-003', phase: 'Week 2', title: 'Advance directives counseling', policy: 'CL-PR-002', method: 'Scenario', competency: 'Scenario', competencyKind: 'scenario' },
  { id: 'MSW-004', phase: 'Week 2', title: 'Abuse / neglect — extended mandatory reporter training', policy: 'CL-PR-006, HR-ER-009', method: 'Classroom', competency: 'Quiz (80%)', competencyKind: 'quiz' },
  { id: 'MSW-005', phase: 'Week 3', title: 'Discharge planning — social determinants', policy: 'CL-CP-006', method: 'Case study', competency: 'Case study', competencyKind: 'case-study' },
  { id: 'MSW-006', phase: 'Week 3', title: 'PHI & confidentiality — social work context', policy: 'CO-HP-001, 42 CFR Part 2', method: 'Classroom', competency: 'Quiz', competencyKind: 'quiz' },
  { id: 'MSW-007', phase: 'Week 4', title: 'EHR — MSW documentation', policy: '—', method: 'Classroom + demo', competency: 'Return demo', competencyKind: 'return-demo' },
  { id: 'MSW-SUP', phase: 'Weeks 2–4', title: 'Supervised patient visits (min 2)', policy: 'HR-TA-005 § 6.3', method: 'Direct supervision', competency: 'HR-TA-005 Appendix E per visit', competencyKind: 'observation' },
];

const HHA_MODULES: RoleModuleRow[] = [
  { id: 'HHA-PRE-1', phase: 'Pre-hire', title: 'HHA training program completion verified', policy: '§ 484.80(b)', method: 'Document verification', competency: 'HR-TA-004 Appendix B', competencyKind: 'exercise' },
  { id: 'HHA-PRE-2', phase: 'Pre-hire', title: 'Prior competency evaluation verified (if prior HHA)', policy: '§ 484.80(c)', method: 'Prior employer verification', competency: '—', competencyKind: 'none' },
  { id: 'HHA-001', phase: 'Week 1', title: 'Communication skills', policy: '§ 484.80(h)(1)', method: 'Observation', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-002', phase: 'Week 1', title: 'Observation, reporting, documentation of patient status', policy: '§ 484.80(h)(2)', method: 'Written + observation', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-003', phase: 'Week 1', title: 'Reading & recording vital signs', policy: '§ 484.80(h)(3)', method: 'Return demo', competency: 'Skills check-off (100%)', competencyKind: 'skills-checkoff' },
  { id: 'HHA-004', phase: 'Week 2', title: 'Basic infection control procedures', policy: '§ 484.80(h)(4)', method: 'Return demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-005', phase: 'Week 2', title: 'Basic body mechanics & safe transfers', policy: '§ 484.80(h)(5)', method: 'Return demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-006', phase: 'Week 2', title: 'Basic nutrition & meal preparation', policy: '§ 484.80(h)(6)', method: 'Written + demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-007', phase: 'Week 2', title: 'Maintenance of clean, safe, healthy environment', policy: '§ 484.80(h)(7)', method: 'Observation', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-008', phase: 'Week 3', title: 'Patient emotional, spiritual, cultural needs', policy: '§ 484.80(h)(8)', method: 'Discussion', competency: 'Observation rating', competencyKind: 'observation' },
  { id: 'HHA-009', phase: 'Week 3', title: 'Patient-specific competencies per care plan', policy: '§ 484.80(h)(9)', method: 'Per patient assignment', competency: 'Per-patient skills demo', competencyKind: 'skills-checkoff' },
  { id: 'HHA-010', phase: 'Week 3', title: 'Personal care assistance — bathing, grooming, toileting', policy: 'Discipline-specific', method: 'Return demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-011', phase: 'Week 3', title: 'Range of motion / ambulation assistance', policy: 'Discipline-specific', method: 'Return demo', competency: 'Skills check-off', competencyKind: 'skills-checkoff' },
  { id: 'HHA-012', phase: 'Week 4', title: 'HHA documentation — visit notes, reporting to RN', policy: 'CL-CD-001', method: 'Classroom + demo', competency: 'Mock documentation', competencyKind: 'exercise' },
];

export const ROLES: RoleDef[] = [
  {
    id: 'JD-001', jdPolicy: 'HR-JD-001', title: 'Administrator', short: 'ADM', tag: 'Governance',
    cfr: '42 CFR § 484.105(b)', licensure: 'Per state law', reportsTo: 'Governing Body',
    description: 'Appointed by the Governing Body and responsible for day-to-day agency operations, compliance, and survey readiness.',
    moduleCountLabel: '15 modules', lmsPrefix: 'ADM', supervisedVisits: null,
    clearance: 'Competency Validation: HR-TD-003 Appendix A (administrative) • 90-Day Evaluation: HR-ER-001 Appendix C',
    managerNotes: ['Evaluated by Governing Body per GV-GB-001 § 6.2.2.4', '90-day introductory evaluation via HR-ER-001 Appendix C'],
    modules: ADM_MODULES,
  },
  {
    id: 'JD-002', jdPolicy: 'HR-JD-002', title: 'Director of Nursing', short: 'DON', tag: 'Clinical Mgmt',
    cfr: '42 CFR § 484.105(c)', licensure: 'RN (CA BRN)', reportsTo: 'Administrator',
    description: 'Clinical Manager responsible for all patient care services and supervision of every clinical discipline.',
    moduleCountLabel: '16 modules', lmsPrefix: 'DON', supervisedVisits: null,
    clearance: 'Supervised Period: min 2 weeks overlap with outgoing DON or Administrator • Competency Validation: HR-TD-003 Appendix A (DON-specific)',
    managerNotes: ['Minimum 2-week supervised overlap with outgoing DON or Administrator', 'Owns HHA 14/60-day supervision program and competency evaluation program (HR-TD-003)'],
    modules: DON_MODULES,
  },
  {
    id: 'JD-003', jdPolicy: 'HR-JD-003', title: 'Registered Nurse (RN)', short: 'RN', tag: 'Clinical Field',
    cfr: '42 CFR § 484.115(a)', licensure: 'RN (CA BRN)', reportsTo: 'DON / Clinical Manager',
    description: 'Core clinical staff. OASIS-authorized, plan-of-care development, and RN supervisory duties for HHAs.',
    moduleCountLabel: '15 modules + supervised visits', lmsPrefix: 'RN',
    supervisedVisits: 'Min 2 (experienced RN) • Min 5 (new grads / new to home health)',
    clearance: 'Competency Validation: HR-TD-003 Appendix A (12 core + RN-specific) • Gate: DON signs HR-TA-005 Appendix B "SATISFACTORY" before independent visits',
    managerNotes: ['DON must sign HR-TA-005 Appendix B before independent visits', 'Each supervised visit documented on HR-TA-005 Appendix E'],
    modules: RN_MODULES,
  },
  {
    id: 'JD-004', jdPolicy: 'HR-JD-004', title: 'Licensed Vocational Nurse', short: 'LVN', tag: 'Clinical Field',
    cfr: '42 CFR § 484.115(c)', licensure: 'LVN (CA BVNPT)', reportsTo: 'DON • supervised by RN',
    description: 'Works under an RN / physician plan of care. No OASIS authorization; RN co-signature and supervision requirements apply.',
    moduleCountLabel: '12 modules + supervised visits', lmsPrefix: 'LVN',
    supervisedVisits: 'Min 3 (experienced) • Min 5 (new to home health)',
    clearance: 'RN sign-off required • Competency Validation: HR-TD-003 Appendix A',
    managerNotes: ['RN co-signature requirements per CA B&P Code § 2859', 'Excluded from OASIS completion per CMS'],
    derivedNote: 'Track derived from the RN journey per HR-JD-004: minus OASIS, HHA supervision, and POC initiation; plus LVN scope-of-practice items.',
    modules: LVN_MODULES,
  },
  {
    id: 'JD-005', jdPolicy: 'HR-JD-005', title: 'Physical Therapist (PT)', short: 'PT', tag: 'Therapy',
    cfr: '42 CFR § 484.115(d)', licensure: 'PT (CA PT Board)', reportsTo: 'DON / Clinical Manager',
    description: 'Therapy evaluation, POC development, OASIS-authorized, and direct supervision of PTAs.',
    moduleCountLabel: '10 modules (PT-001…PT-010)', lmsPrefix: 'PT',
    supervisedVisits: 'Min 2 supervised visits',
    clearance: 'Competency Validation: HR-TD-003 Appendix A + supervised visit Appendix E records',
    managerNotes: ['PT provides direct supervision for PTA per CA practice act', 'OASIS-authorized discipline'],
    modules: PT_MODULES,
  },
  {
    id: 'JD-006', jdPolicy: 'HR-JD-006', title: 'PT Assistant (PTA)', short: 'PTA', tag: 'Therapy',
    cfr: '42 CFR § 484.115(e)', licensure: 'PTA (CA PT Board)', reportsTo: 'PT (direct supervision) + DON',
    description: 'Delivers therapy under PT direct supervision. Not OASIS-authorized.',
    moduleCountLabel: '10 modules (PTA-001…PTA-010)', lmsPrefix: 'PTA',
    supervisedVisits: 'Min 3 supervised visits',
    clearance: 'Competency Validation: HR-TD-003 Appendix A + PT supervision documentation',
    managerNotes: ['Works only under PT direct supervision per CA practice act'],
    derivedNote: 'Mirrors the PT structure minus OASIS authorization and PTA-supervision duties.',
    modules: PTA_MODULES,
  },
  {
    id: 'JD-007', jdPolicy: 'HR-JD-007', title: 'Occupational Therapist (OT)', short: 'OT', tag: 'Therapy',
    cfr: '42 CFR § 484.115(f)', licensure: 'OT (CA OT Board)', reportsTo: 'DON / Clinical Manager',
    description: 'ADL assessment and intervention, home safety evaluation, adaptive equipment, and COTA supervision.',
    moduleCountLabel: '10 modules (OT-001…OT-010)', lmsPrefix: 'OT',
    supervisedVisits: 'Min 2 supervised visits',
    clearance: 'Competency Validation: HR-TD-003 Appendix A + supervised visit Appendix E records',
    managerNotes: ['Supervises COTA per CA B&P Code § 2570', 'OASIS-authorized discipline'],
    derivedNote: 'Mirrors the PT/PTA structure with OT-specific competencies per the source framework.',
    modules: OT_MODULES,
  },
  {
    id: 'JD-008', jdPolicy: 'HR-JD-008', title: 'OT Assistant (COTA)', short: 'COTA', tag: 'Therapy',
    cfr: '42 CFR § 484.115(g)', licensure: 'COTA (CA OT Board)', reportsTo: 'OT (supervision) + DON',
    description: 'Delivers occupational therapy interventions under OT supervision per CA B&P Code § 2570.',
    moduleCountLabel: '10 modules (COTA-001…COTA-010)', lmsPrefix: 'COTA',
    supervisedVisits: 'Min 3 supervised visits',
    clearance: 'Competency Validation: HR-TD-003 Appendix A + OT supervision documentation',
    managerNotes: ['Works under OT supervision per CA B&P Code § 2570'],
    derivedNote: 'Mirrors the OT structure minus OASIS authorization and COTA-supervision duties.',
    modules: COTA_MODULES,
  },
  {
    id: 'JD-009', jdPolicy: 'HR-JD-009', title: 'Speech-Language Pathologist', short: 'SLP', tag: 'Therapy',
    cfr: '42 CFR § 484.115(h)', licensure: 'SLP (CA SLP Board)', reportsTo: 'DON / Clinical Manager',
    description: 'Dysphagia and cognitive-linguistic assessment, OASIS-authorized, patient/caregiver education.',
    moduleCountLabel: '8 modules (SLP-001…SLP-008)', lmsPrefix: 'SLP',
    supervisedVisits: 'Min 2 supervised visits',
    clearance: 'Competency Validation: HR-TD-003 Appendix A + supervised visit Appendix E records',
    managerNotes: ['OASIS-authorized discipline'],
    modules: SLP_MODULES,
  },
  {
    id: 'JD-010', jdPolicy: 'HR-JD-010', title: 'Medical Social Worker', short: 'MSW', tag: 'Psychosocial',
    cfr: '42 CFR § 484.115(i)', licensure: 'MSW Degree', reportsTo: 'DON / Clinical Manager',
    description: 'Psychosocial assessment, community resource coordination, and extended mandatory-reporter obligations.',
    moduleCountLabel: '8 modules (MSW-001…MSW-008)', lmsPrefix: 'MSW',
    supervisedVisits: 'Min 2 supervised visits',
    clearance: 'Competency Validation: HR-TD-003 Appendix A + supervised visit Appendix E records',
    managerNotes: ['Extended mandatory reporter training (CL-PR-006, HR-ER-009)'],
    modules: MSW_MODULES,
  },
  {
    id: 'JD-011', jdPolicy: 'HR-JD-011', title: 'Home Health Aide (HHA)', short: 'HHA', tag: 'Direct Care',
    cfr: '42 CFR § 484.80', licensure: 'HHA Certification', reportsTo: 'RN (supervision) + DON',
    description: 'The most heavily surveyed role. All nine § 484.80(h) competency areas plus a strict 14-day / 60-day RN supervision cycle.',
    moduleCountLabel: '12 modules + § 484.80 skills', lmsPrefix: 'HHA',
    supervisedVisits: 'RN supervised visit every 14 days for first 60 days, then every 60 days',
    clearance: 'Annual Re-evaluation: HR-TD-003 Appendix D (all 9 competency areas) • Supervisory visits on HR-TD-003 Appendix E',
    managerNotes: [
      'RN supervisory visit every 14 days for first 60 days, every 60 days thereafter (§ 484.80(h))',
      'Annual in-service: 12 hours minimum per § 484.80(d), tracked via HR-TD-001',
      'Annual competency re-evaluation: HR-TD-003 Appendix D covering ALL 9 competency areas',
    ],
    modules: HHA_MODULES,
  },
];

export const ROLE_ONBOARDING_PATHS: RoleOnboardingPathDef[] = [
  {
    id: 'lvn',
    label: 'LVN',
    title: 'Licensed Vocational Nurse',
    description: 'Scope, supervision, documentation, medication, wound care, safety, and supervised-visit competency.',
    roleShorts: ['LVN'],
  },
  {
    id: 'rn',
    label: 'RN',
    title: 'Registered Nurse',
    description: 'Comprehensive assessment, OASIS, plan of care, care coordination, supervision, documentation, and clinical leadership.',
    roleShorts: ['RN'],
  },
  {
    id: 'adm',
    label: 'ADM',
    title: 'Agency Administrator',
    description: 'Governance, CMS Conditions of Participation, compliance, QAPI, operations, personnel, and agency oversight.',
    roleShorts: ['ADM'],
  },
  {
    id: 'don',
    label: 'DON',
    title: 'Director of Nursing / Clinical Manager',
    description: 'Clinical supervision, competency management, QAPI oversight, documentation audit, and patient-care governance.',
    roleShorts: ['DON'],
  },
  {
    id: 'hha',
    label: 'HHA',
    title: 'Home Health Aide',
    description: 'Personal care, observation, infection control, documentation, patient-specific skills, and supervision readiness.',
    roleShorts: ['HHA'],
  },
  {
    id: 'pt-pta',
    label: 'PT/PTA',
    title: 'Physical Therapy',
    description: 'Therapy evaluation, plan implementation, fall-risk intervention, homebound status, documentation, and supervised visits.',
    roleShorts: ['PT', 'PTA'],
  },
  {
    id: 'ot-cota',
    label: 'OT/COTA',
    title: 'Occupational Therapy',
    description: 'ADL assessment, home safety, adaptive equipment, OT/COTA supervision, documentation, and supervised visits.',
    roleShorts: ['OT', 'COTA'],
  },
  {
    id: 'slp',
    label: 'SLP',
    title: 'Speech-Language Pathology',
    description: 'Dysphagia, cognitive-linguistic assessment, OASIS-authorized duties, education documentation, and supervised visits.',
    roleShorts: ['SLP'],
  },
  {
    id: 'msw',
    label: 'MSW',
    title: 'Medical Social Worker',
    description: 'Psychosocial assessment, community resources, advance directives, mandatory reporting, and social-work documentation.',
    roleShorts: ['MSW'],
  },
];

// ---------------------------------------------------------------------------
// Phase 3 — Ongoing competency & compliance lifecycle
// ---------------------------------------------------------------------------

export const ANNUAL_TRAINING: AnnualTrainingRow[] = [
  { quarter: 'Q1', training: 'Compliance / Code of Conduct', staff: 'All', assessment: 'Quiz 80%', lms: 'ANN-001' },
  { quarter: 'Q1', training: 'Fraud / Waste / Abuse', staff: 'All', assessment: 'Quiz 80%', lms: 'ANN-002' },
  { quarter: 'Q1', training: 'HIPAA Privacy & Security', staff: 'All', assessment: 'Quiz 80%', lms: 'ANN-003' },
  { quarter: 'Q1', training: 'Patient Rights', staff: 'All', assessment: '—', lms: 'ANN-004' },
  { quarter: 'Q1', training: 'Abuse / Neglect Reporting', staff: 'All', assessment: 'Quiz 80%', lms: 'ANN-005' },
  { quarter: 'Q2', training: 'Infection Prevention', staff: 'Clinical', assessment: 'Return demo', lms: 'ANN-006' },
  { quarter: 'Q2', training: 'Bloodborne Pathogen', staff: 'Exposure staff', assessment: 'Quiz 80%', lms: 'ANN-007' },
  { quarter: 'Q2', training: 'Emergency Prep Drill #1', staff: 'All', assessment: 'Participation', lms: 'ANN-008' },
  { quarter: 'Q2', training: 'Workplace Safety', staff: 'All', assessment: '—', lms: 'ANN-009' },
  { quarter: 'Q3', training: 'Anti-Harassment (2 hrs CA law)', staff: 'All', assessment: 'Quiz 80%', lms: 'ANN-010' },
  { quarter: 'Q3', training: 'Pain Assessment', staff: 'Clinical', assessment: 'Case study', lms: 'ANN-011' },
  { quarter: 'Q3', training: 'Fall Risk Prevention', staff: 'Clinical', assessment: 'Case study', lms: 'ANN-012' },
  { quarter: 'Q3', training: 'Medication Safety', staff: 'Clinical', assessment: 'Quiz 80%', lms: 'ANN-013' },
  { quarter: 'Q4', training: 'OASIS Updates', staff: 'OASIS clinicians', assessment: 'Coding exercise 80%', lms: 'ANN-014' },
  { quarter: 'Q4', training: 'IT Security Awareness', staff: 'All', assessment: 'Phishing sim', lms: 'ANN-015' },
  { quarter: 'Q4', training: 'Emergency Prep Drill #2', staff: 'All', assessment: 'Participation', lms: 'ANN-016' },
  { quarter: 'Q4', training: 'Documentation Standards', staff: 'Clinical', assessment: '—', lms: 'ANN-017' },
  { quarter: 'Q4', training: 'Advance Directives', staff: 'Clinical', assessment: '—', lms: 'ANN-018' },
];

export const ONGOING_MONITORING: MonitoringRow[] = [
  { activity: 'Licensure verification', frequency: 'Primary source at hire, renewal, annual re-verification', policy: 'HR-TA-004', evidence: 'Appendix B per cycle' },
  { activity: 'CE tracking', frequency: 'Ongoing, 120-day pre-renewal check', policy: 'HR-TD-002', evidence: 'Appendix A' },
  { activity: 'Background re-screening', frequency: 'Every 3 years', policy: 'HR-TA-002', evidence: 'Appendix A tracking log' },
  { activity: 'Annual competency evaluation', frequency: 'Feb 1 – Oct 31', policy: 'HR-TD-003', evidence: 'Appendix A per employee' },
  { activity: 'Performance evaluation', frequency: 'Anniversary date + 30 days', policy: 'HR-ER-001', evidence: 'Appendix A' },
  { activity: '90-day introductory evaluation', frequency: 'Before Day 90', policy: 'HR-ER-001', evidence: 'Appendix C' },
  { activity: 'HHA in-service training', frequency: '12 hours / year', policy: '§ 484.80(d), HR-TD-001', evidence: 'Training attendance records' },
  { activity: 'Emergency drill participation', frequency: '2x / year', policy: 'HR-TD-005, § 484.102', evidence: 'Appendix B + AAR' },
];

// ---------------------------------------------------------------------------
// Manager view — audit evidence map & escalation matrix
// ---------------------------------------------------------------------------

export const EVIDENCE_MAP: EvidenceMapRow[] = [
  { surveyorAction: 'Pull 5–10 personnel files randomly', lookFor: 'Pre-employment screening complete before start date', evidence: 'HR-TA-001 Appendix F — all PASS, signed, dated before Day 1' },
  { surveyorAction: 'Verify qualifications match JD', lookFor: 'License type matches position requirements', evidence: 'HR-TA-004 Appendix B + HR-JD series JD on file' },
  { surveyorAction: 'Check OIG / SAM exclusion', lookFor: 'No excluded individuals employed', evidence: 'HR-TA-003 Appendix A (pre-hire) + Appendix C (monthly logs with CO co-sign)' },
  { surveyorAction: 'Verify orientation completion', lookFor: 'All orientation topics covered, documented', evidence: 'HR-TA-005 Appendix A (general) + Appendix B (role-specific) — dual signed' },
  { surveyorAction: 'Check competency evaluations', lookFor: 'Initial + annual competency on file', evidence: 'HR-TD-003 Appendix A per employee per year' },
  { surveyorAction: 'HHA-specific deep dive', lookFor: '42 CFR § 484.80 competencies, supervision schedule', evidence: 'HR-TD-003 Appendix D + Appendix E per visit cycle' },
  { surveyorAction: 'Annual training compliance', lookFor: 'All required topics completed per year', evidence: 'HR-TD-001 Appendix B dashboard + Appendix C attendance records' },
  { surveyorAction: 'Job descriptions current', lookFor: 'JD on file, signed acknowledgment', evidence: 'HR-TA-006 Appendix A (JD) + Appendix C (acknowledgment)' },
];

export const ESCALATION_MATRIX: EscalationRow[] = [
  { trigger: 'Employee starts before screening complete', timeline: 'Immediate', action: 'Admin leave, incident documented, supervisor counseled', policy: 'HR-TA-001 § 6.7', severity: 'critical' },
  { trigger: 'Clinical staff assigned before orientation complete', timeline: 'Immediate', action: 'Removed from schedule, DON notified', policy: 'HR-TA-005 § 8.2', severity: 'critical' },
  { trigger: 'Annual training 30 days overdue', timeline: 'Day 30', action: 'Written reminder to employee + supervisor', policy: 'HR-TD-001 § 4.6', severity: 'monitor' },
  { trigger: 'Annual training 45 days overdue', timeline: 'Day 45', action: 'Second notice, supervisor meeting', policy: 'HR-TD-001 § 4.6', severity: 'escalating' },
  { trigger: 'Annual training 60 days overdue', timeline: 'Day 60', action: 'Clinical: suspended from patient care. All: HR-ER-002', policy: 'HR-TD-001 § 4.6', severity: 'critical' },
  { trigger: 'Competency deficit identified', timeline: 'Within 7 days', action: 'Remediation plan (HR-TD-003 Appendix C), max 60-day resolution', policy: 'HR-TD-003 § 6.3', severity: 'escalating' },
  { trigger: 'Competency failure after remediation', timeline: 'Within 5 days', action: 'Employment action per HR-ER-002', policy: 'HR-TD-003 § 6.3.4', severity: 'critical' },
  { trigger: 'License expires', timeline: 'Expiration date', action: 'Immediate removal from clinical duties, unpaid leave', policy: 'HR-TA-004 § 6.2.5', severity: 'critical' },
  { trigger: 'OIG / SAM exclusion confirmed', timeline: 'Immediate', action: 'Remove from all duties, terminate, Compliance Officer notified < 24 hrs', policy: 'HR-TA-003 § 6.3', severity: 'critical' },
];

export const SUPERVISION_SCHEDULE: SupervisionRow[] = [
  { roleId: 'JD-001', role: 'Administrator', requirement: '90-day introductory evaluation; annual evaluation by Governing Body', evaluator: 'Governing Body', form: 'HR-ER-001 Appendix C / GV-GB-001 § 6.2.2.4' },
  { roleId: 'JD-002', role: 'Director of Nursing', requirement: 'Min 2-week supervised overlap; DON-specific competency validation', evaluator: 'Administrator / outgoing DON', form: 'HR-TD-003 Appendix A' },
  { roleId: 'JD-003', role: 'Registered Nurse', requirement: 'Min 2 supervised visits (experienced) / 5 (new grad or new to HH)', evaluator: 'DON / preceptor RN', form: 'HR-TA-005 Appendix E + Appendix B gate' },
  { roleId: 'JD-004', role: 'LVN', requirement: 'Min 3 supervised visits (experienced) / 5 (new to HH); RN co-signature', evaluator: 'RN / DON', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-005', role: 'Physical Therapist', requirement: 'Min 2 supervised visits', evaluator: 'DON / therapy lead', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-006', role: 'PTA', requirement: 'Min 3 supervised visits; PT direct supervision ongoing', evaluator: 'Supervising PT', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-007', role: 'Occupational Therapist', requirement: 'Min 2 supervised visits', evaluator: 'DON / therapy lead', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-008', role: 'COTA', requirement: 'Min 3 supervised visits; OT supervision per CA B&P § 2570', evaluator: 'Supervising OT', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-009', role: 'SLP', requirement: 'Min 2 supervised visits', evaluator: 'DON / therapy lead', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-010', role: 'MSW', requirement: 'Min 2 supervised visits', evaluator: 'DON / Clinical Manager', form: 'HR-TA-005 Appendix E' },
  { roleId: 'JD-011', role: 'Home Health Aide', requirement: 'RN visit every 14 days (first 60 days), then every 60 days; 12 hrs in-service / yr', evaluator: 'Supervising RN', form: 'HR-TD-003 Appendix D + E' },
];

export const COMPLETION_GATES = [
  { gate: 'GAO series complete', unlocks: 'Role-specific training may begin', policy: 'HR-TA-005 § 6.2' },
  { gate: 'Role-specific series complete', unlocks: 'Independent practice / duties', policy: 'HR-TA-005 § 6.3' },
  { gate: 'Annual series complete by Dec 31', unlocks: 'Continued assignment (escalation at 30/45/60 days overdue)', policy: 'HR-TD-001 § 4.6' },
] as const;
