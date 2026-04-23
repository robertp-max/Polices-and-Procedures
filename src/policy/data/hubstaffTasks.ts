/* ═══════════════════════════════════════════════════════════════
   Hubstaff push catalogue — single source of truth for all tasks
   across all 4 Hubstaff projects.
   ═══════════════════════════════════════════════════════════════ */

export type ProjectKey = 'main' | 'cms485' | 'oasis' | 'qapi' | 'versions';
export type RiskLevel  = 'critical' | 'high' | 'medium' | 'low';

export interface HubTask {
  id:          string;
  title:       string;
  description: string;
  dueDate?:    string;
  project:     ProjectKey;
  category:    string;
  risk?:       RiskLevel;
  cfr?:        string;
}

export interface HubProject {
  key:         ProjectKey;
  label:       string;
  shortLabel:  string;
  description: string;
  hubstaffId?: string;     // blank = auto-create
  script:      string;
  categories:  string[];
}

export const HUBSTAFF_PROJECTS: HubProject[] = [
  {
    key: 'main', label: 'Regulatory Calendar Events', shortLabel: 'Reg. Calendar',
    description: 'All 100 regulatory compliance events for 2026 — Governance, QAPI, Clinical, Risk, Finance, HR, IT, Survey.',
    hubstaffId: '3988878', script: 'npm run push-hubstaff',
    categories: ['Governance','QAPI','Clinical','Compliance','Risk','Survey','Finance'],
  },
  {
    key: 'cms485', label: 'CMS-485 Plan of Care Documentation', shortLabel: 'CMS-485',
    description: '42 CFR §484.60 — Plan of care, physician orders, verbal orders, F2F encounter, recertification workflows.',
    hubstaffId: '', script: 'npm run push:cms485',
    categories: ['Form Setup','Workflow','Calendar','Survey'],
  },
  {
    key: 'oasis', label: 'OASIS-E1 Assessment & Submission', shortLabel: 'OASIS',
    description: '42 CFR §484.55 — OASIS-E1 assessment forms, QA checklists, transmission audits, clinician competency.',
    hubstaffId: '', script: 'npm run push:oasis',
    categories: ['Form Setup','Workflow','Calendar','Survey'],
  },
  {
    key: 'qapi', label: 'QAPI Program — Quality & Performance', shortLabel: 'QAPI',
    description: '42 CFR §484.65 — QAPI forms, quarterly reviews, PIP lifecycle, annual evaluation, survey evidence bundle.',
    hubstaffId: '', script: 'npm run push:qapi',
    categories: ['Form Setup','Quarterly','PIP Lifecycle','Annual','Survey'],
  },
  {
    key: 'versions', label: 'CI-ION App — Version History & Dev', shortLabel: 'Versions',
    description: 'All 5 app versions (v1 Mar 2026 → v5 Current) plus older copies: CIHHC_PP, ci-policy-app, CI-ION-HHPP. Migration tasks, feature audit, and codebase health.',
    hubstaffId: '', script: 'npm run push:versions',
    categories: ['v1 Origin','v2 Foundation','v3 First App','v4 Rebrand','v5 Current','Older Copies','Migration','Maintenance'],
  },
];

/* ─── Main project tasks (regulatory calendar events) ───────── */

const MAIN_TASKS: HubTask[] = [
  // Governance
  { id:'EVT-GV-2026-0108-ANNPKT', title:'Annual Governance Packet Review', dueDate:'2026-01-08', project:'main', category:'Governance', risk:'critical', cfr:'42 CFR §484.105(b)', description:'Annual board review of institutional plan, budget, acceptance-to-service criteria, and public service information.\nOwner: Administrator\nRefs: GV-GB-001, GV-GB-002' },
  { id:'EVT-GV-Q1-2026', title:'Q1 2026 Governing Body Meeting', dueDate:'2026-02-12', project:'main', category:'Governance', risk:'critical', cfr:'42 CFR §484.105', description:'Quarterly governing body meeting — QAPI results, budget review, organizational oversight.\nOwner: Administrator' },
  { id:'EVT-GV-Q2-2026', title:'Q2 2026 Governing Body Meeting', dueDate:'2026-05-14', project:'main', category:'Governance', risk:'critical', cfr:'42 CFR §484.105', description:'Quarterly governing body meeting — Q2 QAPI review, financial oversight, clinical outcomes.' },
  { id:'EVT-GV-Q3-2026', title:'Q3 2026 Governing Body Meeting', dueDate:'2026-08-13', project:'main', category:'Governance', risk:'critical', cfr:'42 CFR §484.105', description:'Quarterly governing body meeting — Q3 QAPI, risk management, mid-year budget variance.' },
  { id:'EVT-GV-Q4-2026', title:'Q4 2026 Governing Body Meeting', dueDate:'2026-11-12', project:'main', category:'Governance', risk:'critical', cfr:'42 CFR §484.105', description:'Quarterly governing body meeting — annual review, Q4 QAPI, FY27 planning.' },
  // QAPI
  { id:'EVT-QA-2026-0205-QAPI-Q1', title:'Q1 QAPI Review + Annual PIP Kickoff', dueDate:'2026-02-05', project:'main', category:'QAPI', risk:'high', cfr:'42 CFR §484.65', description:'Q1 QAPI governance review and annual PIP kickoff.\nOwner: Clinical Manager' },
  { id:'EVT-QA-2026-Q2', title:'Q2 QAPI Review', dueDate:'2026-05-07', project:'main', category:'QAPI', risk:'high', cfr:'42 CFR §484.65', description:'Q2 QAPI governance review — PIP remeasurement, dashboard review, action log.' },
  { id:'EVT-QA-2026-Q3', title:'Q3 QAPI Review', dueDate:'2026-08-06', project:'main', category:'QAPI', risk:'high', cfr:'42 CFR §484.65', description:'Q3 QAPI governance review — PIP sustainment check, adverse event analysis.' },
  { id:'EVT-QA-2026-Q4', title:'Q4 QAPI Review + Annual PIP Close', dueDate:'2026-11-05', project:'main', category:'QAPI', risk:'high', cfr:'42 CFR §484.65', description:'Q4 QAPI review — annual PIP closure, sustainment plan, governing body packet.' },
  // Emergency Preparedness
  { id:'EVT-RM-2026-0115-EP-REVIEW', title:'Biennial Emergency Preparedness Review / Update', dueDate:'2026-01-15', project:'main', category:'Risk', risk:'critical', cfr:'42 CFR §484.102', description:'Full biennial review of emergency plan, policies/procedures, communications plan, and training/testing.' },
  { id:'EVT-RM-2026-0122-EP-TRAIN', title:'Biennial EP Staff Training', dueDate:'2026-01-22', project:'main', category:'Risk', risk:'critical', cfr:'42 CFR §484.102(d)(1)', description:'Biennial emergency-preparedness training for all required staff.' },
  { id:'EVT-RM-2026-0318-EP-EXERCISE', title:'Annual Emergency Exercise (Tabletop)', dueDate:'2026-03-18', project:'main', category:'Risk', risk:'critical', cfr:'42 CFR §484.102(d)(2)', description:'Annual emergency exercise — tabletop scenario, debrief, after-action report.' },
  // Clinical
  { id:'EVT-CL-2026-0209-AIDE-INSERVICE', title:'Annual Aide In-Service Training (12 hrs)', dueDate:'2026-02-09', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.80(d)', description:'Annual 12-hour in-service training campaign for all home health aides.' },
  { id:'EVT-CL-2026-0225-AIDE-OBS-SKILLED', title:'Annual Skilled-Patient Aide Direct Observation', dueDate:'2026-02-25', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.80(h)(1)(iv)', description:'Annual onsite direct observation of each aide serving skilled-care patients.' },
  { id:'EVT-CL-2026-0311-AIDE-OBS-AIDEONLY', title:'Semiannual Aide-Only Observation (Cycle 1)', dueDate:'2026-03-11', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.80(h)(2)(ii)', description:'Semiannual onsite observation — aide-only patients, Cycle 1.' },
  { id:'EVT-CL-2026-0911-AIDE-OBS-AIDEONLY-C2', title:'Semiannual Aide-Only Observation (Cycle 2)', dueDate:'2026-09-11', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.80(h)(2)(ii)', description:'Semiannual onsite observation — aide-only patients, Cycle 2.' },
  // Compliance
  { id:'EVT-CO-2026-JAN-WEEKLY-01', title:'Weekly Compliance Report (Jan Wk 1)', dueDate:'2026-01-05', project:'main', category:'Compliance', risk:'medium', description:'Weekly compliance reporting: claims, signatures, OASIS, outstanding items.' },
  { id:'EVT-CO-2026-JAN-MONTHLY', title:'Monthly Compliance Report — January', dueDate:'2026-01-30', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: OIG exclusions, documentation compliance, denials.' },
  { id:'EVT-CO-2026-FEB-MONTHLY', title:'Monthly Compliance Report — February', dueDate:'2026-02-27', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: February claims, signatures, denials, OIG.' },
  { id:'EVT-CO-2026-MAR-MONTHLY', title:'Monthly Compliance Report — March', dueDate:'2026-03-31', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: March claims, Q1 trend analysis.' },
  { id:'EVT-CO-2026-APR-MONTHLY', title:'Monthly Compliance Report — April', dueDate:'2026-04-30', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: April claims.' },
  { id:'EVT-CO-2026-MAY-MONTHLY', title:'Monthly Compliance Report — May', dueDate:'2026-05-29', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: May claims.' },
  { id:'EVT-CO-2026-JUN-MONTHLY', title:'Monthly Compliance Report — June', dueDate:'2026-06-30', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: June / mid-year variance.' },
  // 60-Day Reviews
  { id:'EVT-CL-2026-JAN-60DAY', title:'60-Day Episode Review — January', dueDate:'2026-01-15', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.60(c)', description:'Plan of care review for all patients at 60-day mark. Physician re-certification.' },
  { id:'EVT-CL-2026-FEB-60DAY', title:'60-Day Episode Review — February', dueDate:'2026-02-15', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.60(c)', description:'60-day POC review: February cycle.' },
  { id:'EVT-CL-2026-MAR-60DAY', title:'60-Day Episode Review — March', dueDate:'2026-03-15', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.60(c)', description:'60-day POC review: March cycle.' },
  { id:'EVT-CL-2026-APR-60DAY', title:'60-Day Episode Review — April', dueDate:'2026-04-15', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.60(c)', description:'60-day POC review: April cycle.' },
  { id:'EVT-CL-2026-MAY-60DAY', title:'60-Day Episode Review — May', dueDate:'2026-05-15', project:'main', category:'Clinical', risk:'critical', cfr:'42 CFR §484.60(c)', description:'60-day POC review: May cycle.' },
  // OIG
  { id:'EVT-HR-2026-OIG-Q1', title:'Q1 OIG Exclusion Check', dueDate:'2026-01-02', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening — employees, contractors, vendors.' },
  { id:'EVT-HR-2026-OIG-FEB', title:'February OIG Exclusion Check', dueDate:'2026-02-02', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-MAR', title:'March OIG Exclusion Check', dueDate:'2026-03-02', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-APR', title:'April OIG Exclusion Check', dueDate:'2026-04-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-MAY', title:'May OIG Exclusion Check', dueDate:'2026-05-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-JUN', title:'June OIG Exclusion Check', dueDate:'2026-06-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-JUL', title:'July OIG Exclusion Check', dueDate:'2026-07-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-AUG', title:'August OIG Exclusion Check', dueDate:'2026-08-03', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-SEP', title:'September OIG Exclusion Check', dueDate:'2026-09-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-OCT', title:'October OIG Exclusion Check', dueDate:'2026-10-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-NOV', title:'November OIG Exclusion Check', dueDate:'2026-11-02', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening.' },
  { id:'EVT-HR-2026-OIG-DEC', title:'December OIG Exclusion Check', dueDate:'2026-12-01', project:'main', category:'Compliance', risk:'critical', description:'Monthly OIG exclusion screening — year-end verification.' },
  // Survey Week
  { id:'EVT-SURVEY-2026-0713-MOCK', title:'Medicare Certification — Internal Mock Survey', dueDate:'2026-07-13', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR Part 484', description:'Full-day internal mock CMS survey drill across all Conditions of Participation.' },
  { id:'EVT-SURVEY-2026-0713-QAPI-EVIDENCE', title:'QAPI Evidence Bundle — Pre-Survey Final Review', dueDate:'2026-07-13', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.65', description:'Compile and finalize complete QAPI evidence bundle for survey.' },
  { id:'EVT-SURVEY-2026-0714-GB-AUTH', title:'Governing Body — Survey Authorization Session', dueDate:'2026-07-14', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.105', description:'Emergency GB session to formally certify organizational readiness.' },
  { id:'EVT-SURVEY-2026-0714-CLINICAL-AUDIT', title:'Clinical Records Sample Audit — Pre-Survey', dueDate:'2026-07-14', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.55, §484.60', description:'Stratified sample audit of clinical records against all CoP requirements.' },
  { id:'EVT-SURVEY-2026-0715-PP-REVIEW', title:'P&P Library Final Review — All Domains', dueDate:'2026-07-15', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.105(i)', description:'Comprehensive review of all agency P&Ps across every domain.' },
  { id:'EVT-SURVEY-2026-0715-EP-PACKET', title:'Emergency Preparedness Survey Packet — Final Review', dueDate:'2026-07-15', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.102', description:'Final pre-survey review of the complete Emergency Preparedness documentation packet.' },
  { id:'EVT-SURVEY-2026-0716-STAFF-AUDIT', title:'Staff Credential & Training Records Audit', dueDate:'2026-07-16', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.80, §484.115', description:'Comprehensive HR compliance audit for survey: credentials, OIG screenings, aide in-service completion.' },
  { id:'EVT-SURVEY-2026-0716-IC-EVIDENCE', title:'Infection Control Evidence Compilation — Pre-Survey', dueDate:'2026-07-16', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR §484.70', description:'Compile infection control program survey documentation bundle.' },
  { id:'EVT-SURVEY-2026-0717-OIG-FINAL', title:'OIG Exclusion Pre-Survey Final Verification', dueDate:'2026-07-17', project:'main', category:'Survey', risk:'critical', description:'Final pre-survey OIG/SAM.gov exclusion screening.' },
  { id:'EVT-SURVEY-2026-0717-SIGNOFF', title:'Medicare Certification Survey Readiness Final Sign-Off', dueDate:'2026-07-17', project:'main', category:'Survey', risk:'critical', cfr:'42 CFR Part 484', description:'Administrator and Governing Body Chair sign survey readiness attestation.' },
  // Annual
  { id:'EVT-HR-2026-ANNUAL-TRAINING', title:'Annual Employee Compliance Training (HIPAA, OSHA, Abuse)', dueDate:'2026-09-01', project:'main', category:'Compliance', risk:'critical', cfr:'HIPAA 45 CFR §164.530(b)', description:'Annual training: HIPAA, OSHA, Abuse/Neglect, Corporate Compliance, Infection Control.' },
  { id:'EVT-CO-2026-PP-ANNUAL', title:'Annual Policy & Procedure Enterprise Review', dueDate:'2026-10-15', project:'main', category:'Compliance', risk:'critical', cfr:'42 CFR §484.105(i)', description:'Annual review of complete enterprise P&P library across all domains.' },
  { id:'EVT-CO-2026-ANNUAL-EFFECTIVENESS', title:'Annual Compliance Program Effectiveness Review', dueDate:'2026-11-19', project:'main', category:'Compliance', risk:'high', description:'Annual evaluation of compliance program effectiveness — OIG 7-element model.' },
  { id:'EVT-QAPI-2026-ANNUAL-EVAL', title:'Annual QAPI Program Evaluation', dueDate:'2026-12-10', project:'main', category:'QAPI', risk:'critical', cfr:'42 CFR §484.65', description:'Annual evaluation of full QAPI program, PIP completion, FY27 priorities, Governing Body report.' },
  // Finance
  { id:'EVT-FN-2026-JAN-CLAIMS', title:'January 2026 Claims Submission Cycle', dueDate:'2026-01-20', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission: review scrubber, submit clean claims, resolve rejections.' },
  { id:'EVT-FN-2026-FEB-CLAIMS', title:'February 2026 Claims Submission Cycle', dueDate:'2026-02-20', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission.' },
  { id:'EVT-FN-2026-MAR-CLAIMS', title:'March 2026 Claims Submission Cycle', dueDate:'2026-03-20', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission.' },
  { id:'EVT-FN-2026-APR-CLAIMS', title:'April 2026 Claims Submission Cycle', dueDate:'2026-04-20', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission.' },
  { id:'EVT-FN-2026-MAY-CLAIMS', title:'May 2026 Claims Submission Cycle', dueDate:'2026-05-20', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission.' },
  { id:'EVT-FN-2026-JUN-CLAIMS', title:'June 2026 Claims Submission Cycle', dueDate:'2026-06-22', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission.' },
  { id:'EVT-FN-2026-JUL-CLAIMS', title:'July 2026 Claims Submission Cycle', dueDate:'2026-07-20', project:'main', category:'Finance', risk:'critical', description:'Monthly Medicare claims submission.' },
  { id:'EVT-FN-2026-Q1-DENIAL', title:'Q1 Denial Management Review', dueDate:'2026-04-07', project:'main', category:'Finance', risk:'high', description:'Q1 denial analysis: categories, root causes, appeals status, process improvement.' },
  { id:'EVT-FN-2026-Q2-DENIAL', title:'Q2 Denial Management Review', dueDate:'2026-07-07', project:'main', category:'Finance', risk:'high', description:'Q2 denial analysis.' },
  { id:'EVT-FN-2026-Q1-PHYSICIAN-SIG', title:'Monthly Physician Signature Tracking — January', dueDate:'2026-01-28', project:'main', category:'Finance', risk:'critical', cfr:'42 CFR §484.60', description:'Track and follow up on outstanding physician signatures.' },
  { id:'EVT-FN-2026-FEB-PHYSICIAN-SIG', title:'Monthly Physician Signature Tracking — February', dueDate:'2026-02-27', project:'main', category:'Finance', risk:'critical', description:'Track outstanding physician signatures.' },
  { id:'EVT-FN-2026-MAR-PHYSICIAN-SIG', title:'Monthly Physician Signature Tracking — March', dueDate:'2026-03-31', project:'main', category:'Finance', risk:'critical', description:'Track outstanding physician signatures.' },
  { id:'EVT-FN-2026-APR-PHYSICIAN-SIG', title:'Monthly Physician Signature Tracking — April', dueDate:'2026-04-30', project:'main', category:'Finance', risk:'critical', description:'Track outstanding physician signatures.' },
  { id:'EVT-FN-2026-MAY-PHYSICIAN-SIG', title:'Monthly Physician Signature Tracking — May', dueDate:'2026-05-29', project:'main', category:'Finance', risk:'critical', description:'Track outstanding physician signatures.' },
  // Quarterly / H2
  { id:'EVT-CL-2026-JUN-60DAY', title:'60-Day Episode Review — June', dueDate:'2026-06-15', project:'main', category:'Clinical', risk:'critical', description:'60-day POC review: June cycle.' },
  { id:'EVT-CL-2026-JUL-60DAY', title:'60-Day Episode Review — July', dueDate:'2026-07-15', project:'main', category:'Clinical', risk:'critical', description:'60-day POC review: July cycle.' },
  { id:'EVT-CL-2026-IC-Q1', title:'Q1 Infection Control Review', dueDate:'2026-03-25', project:'main', category:'Clinical', risk:'high', cfr:'42 CFR §484.70', description:'Q1 infection surveillance review: HAI trends, PPE compliance, QAPI feed.' },
  { id:'EVT-CL-2026-IC-Q2', title:'Q2 Infection Control Review', dueDate:'2026-06-24', project:'main', category:'Clinical', risk:'high', cfr:'42 CFR §484.70', description:'Q2 infection surveillance review.' },
  { id:'EVT-CL-2026-IC-Q3', title:'Q3 Infection Control Review', dueDate:'2026-09-24', project:'main', category:'Clinical', risk:'high', cfr:'42 CFR §484.70', description:'Q3 infection surveillance review.' },
  { id:'EVT-CL-2026-IC-Q4', title:'Q4 Infection Control Review', dueDate:'2026-12-17', project:'main', category:'Clinical', risk:'high', cfr:'42 CFR §484.70', description:'Q4 infection surveillance: annual IC trend close-out, QAPI feed.' },
  { id:'EVT-RM-2026-Q1-RISK', title:'Q1 Risk Management Committee Meeting', dueDate:'2026-03-19', project:'main', category:'Risk', risk:'high', description:'Q1 risk management review: incident reports, adverse events, corrective actions.' },
  { id:'EVT-RM-2026-Q2-RISK', title:'Q2 Risk Management Committee Meeting', dueDate:'2026-06-18', project:'main', category:'Risk', risk:'high', description:'Q2 risk management review.' },
  { id:'EVT-RM-2026-Q3-RISK', title:'Q3 Risk Management Committee Meeting', dueDate:'2026-09-17', project:'main', category:'Risk', risk:'high', description:'Q3 risk management review.' },
  { id:'EVT-RM-2026-Q4-RISK', title:'Q4 Risk Management Committee Meeting', dueDate:'2026-12-10', project:'main', category:'Risk', risk:'high', description:'Q4 / year-end risk management review.' },
  { id:'EVT-IT-2026-Q1-SYSREVIEW', title:'Q1 System Activity & Security Review', dueDate:'2026-03-27', project:'main', category:'Compliance', risk:'high', cfr:'HIPAA 45 CFR §164.308', description:'Quarterly review of system access logs, security incidents, user permissions, HIPAA audit trail.' },
  { id:'EVT-IT-2026-Q2-SYSREVIEW', title:'Q2 System Activity & Security Review', dueDate:'2026-06-26', project:'main', category:'Compliance', risk:'high', description:'Q2 system security review.' },
  { id:'EVT-IT-2026-Q3-SYSREVIEW', title:'Q3 System Activity & Security Review', dueDate:'2026-09-25', project:'main', category:'Compliance', risk:'high', description:'Q3 system security review.' },
  { id:'EVT-IT-2026-Q4-SYSREVIEW', title:'Q4 System Activity & Security Review', dueDate:'2026-12-18', project:'main', category:'Compliance', risk:'high', description:'Q4 / year-end system security review.' },
  { id:'EVT-CO-2026-JUL-MONTHLY', title:'Monthly Compliance Report — July', dueDate:'2026-07-31', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary: post-survey remediation tracking.' },
  { id:'EVT-CO-2026-AUG-MONTHLY', title:'Monthly Compliance Report — August', dueDate:'2026-08-31', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary.' },
  { id:'EVT-CO-2026-SEP-MONTHLY', title:'Monthly Compliance Report — September', dueDate:'2026-09-30', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary.' },
  { id:'EVT-CO-2026-OCT-MONTHLY', title:'Monthly Compliance Report — October', dueDate:'2026-10-30', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary.' },
  { id:'EVT-CO-2026-NOV-MONTHLY', title:'Monthly Compliance Report — November', dueDate:'2026-11-30', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary.' },
  { id:'EVT-CO-2026-DEC-MONTHLY', title:'Monthly Compliance Report — December', dueDate:'2026-12-31', project:'main', category:'Compliance', risk:'medium', description:'Monthly compliance summary — year-end: annual compliance review, FY26 audit readiness.' },
  { id:'EVT-CO-2026-0331-HHCAHPS', title:'HHCAHPS Annual Exemption Decision / Participation Filing', dueDate:'2026-03-31', project:'main', category:'Compliance', risk:'high', cfr:'42 CFR §484.245', description:'Annual determination: HHCAHPS exemption or vendor confirmation.' },
];

/* ─── CMS-485 tasks ──────────────────────────────────────────── */

const CMS485_TASKS: HubTask[] = [
  { id:'CMS485-FM-001', title:'Plan of Care (485 Form) — Setup & Validation', project:'cms485', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.60', description:'Form CL-FM-005 | Validate 485 template: physician signature, episode dates, ICD-10, medications, functional limitations.' },
  { id:'CMS485-FM-002', title:'Physician Orders Sheet — Template Verification', project:'cms485', category:'Form Setup', risk:'critical', description:'Form CL-FM-006 | Verify physician orders template: order categories, signature block, nurse authentication.' },
  { id:'CMS485-FM-003', title:'Verbal Order Log — Process Verification', project:'cms485', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.60(b)(2)', description:'Form CL-FM-007 | Verify verbal order receipt, read-back, 24-hr countersignature tracking.' },
  { id:'CMS485-FM-004', title:'Physician Order Signature Tracking Log', project:'cms485', category:'Form Setup', risk:'critical', description:'Form CL-FM-008 | Activate tracking log — 3/7/14-day follow-up cadence, Clinical Manager responsibility.' },
  { id:'CMS485-FM-005', title:'Face-to-Face Encounter Documentation — Audit', project:'cms485', category:'Form Setup', risk:'critical', cfr:'42 CFR §424.22', description:'Form CL-FM-010 | Audit F2F form: encounter date within 90/30-day window, clinical findings, physician/NPP signature.' },
  { id:'CMS485-FM-006', title:'Homebound Status Determination Checklist', project:'cms485', category:'Form Setup', risk:'critical', cfr:'42 CFR §409.42', description:'Form CL-FM-009 | Review homebound criteria per §409.42 and Medicare Benefit Policy Manual Ch. 7.' },
  { id:'CMS485-FM-007', title:'Physician Recertification Tracking Log', project:'cms485', category:'Form Setup', risk:'critical', cfr:'42 CFR §424.22(b)', description:'Form CL-FM-044 | Set up 60-day episode recertification due date tracking.' },
  { id:'CMS485-FM-008', title:'Active POC Change Notification Log', project:'cms485', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.60(d)', description:'Form CL-FM-057 | Implement POC amendment log — physician notification and approval tracking.' },
  { id:'CMS485-FM-009', title:'Episode Management Milestone Tracker', project:'cms485', category:'Form Setup', risk:'critical', description:'Form CL-FM-054 | Configure SOC→30-day→60-day milestones, OASIS submission deadlines, visit frequency checkpoints.' },
  { id:'CMS485-FM-010', title:'Prior Authorization Request Log', project:'cms485', category:'Form Setup', risk:'medium', description:'Form CL-FM-055 | Set up PA request log for applicable payers: auth number, approved services, appeal tracking.' },
  { id:'CMS485-WF-001', title:'CMS-485 Initiation Workflow — SOC to Physician', dueDate:'2026-05-01', project:'cms485', category:'Workflow', risk:'critical', cfr:'42 CFR §484.60', description:'SOC→draft 485 within 5 days→fax to physician→track→follow up every 3 days if unsigned. Target: 100% signed within 14 days.' },
  { id:'CMS485-WF-002', title:'Recertification Workflow — 60-Day Episode Review', dueDate:'2026-05-01', project:'cms485', category:'Workflow', risk:'critical', cfr:'42 CFR §424.22(b)', description:'Identify patients 14 days prior→update POC→new 485→physician signature before episode end. Target: zero late recertifications.' },
  { id:'CMS485-WF-003', title:'Verbal Order Management Workflow', dueDate:'2026-05-15', project:'cms485', category:'Workflow', risk:'critical', cfr:'42 CFR §484.60(b)(2)', description:'Receive→read back→document in 24 hrs→route for countersignature→track. Target: 100% authenticated within 48 hrs.' },
  { id:'CMS485-WF-004', title:'Face-to-Face Encounter Compliance Audit', dueDate:'2026-06-30', project:'cms485', category:'Workflow', risk:'critical', cfr:'42 CFR §424.22', description:'Quarterly: pull admission sample, verify F2F date and clinical findings, report deficiencies.' },
  { id:'CMS485-WF-005', title:'Annual POC Audit — Survey Readiness', dueDate:'2026-07-14', project:'cms485', category:'Workflow', risk:'critical', cfr:'42 CFR §484.60', description:'Pre-survey: 10% patient sample, 485 currency, physician signatures, F2F on file, visit frequency match.' },
  { id:'CMS485-CO-001', title:'January — Physician Signature Follow-Up', dueDate:'2026-01-28', project:'cms485', category:'Calendar', risk:'critical', description:'Pull unsigned 485 report, contact physician offices, escalate >14 days.' },
  { id:'CMS485-CO-002', title:'February — Physician Signature Follow-Up', dueDate:'2026-02-27', project:'cms485', category:'Calendar', risk:'critical', description:'Monthly physician signature tracking — February cycle.' },
  { id:'CMS485-CO-003', title:'March — Physician Signature Follow-Up', dueDate:'2026-03-31', project:'cms485', category:'Calendar', risk:'critical', description:'Monthly physician signature tracking — March cycle.' },
  { id:'CMS485-CO-007', title:'Q1 60-Day Episode Review — Jan Cycle', dueDate:'2026-01-15', project:'cms485', category:'Calendar', risk:'critical', cfr:'42 CFR §484.60(c)', description:'60-day POC review: January cycle. Physician re-certification.' },
  { id:'CMS485-CO-008', title:'Q1 60-Day Episode Review — Feb Cycle', dueDate:'2026-02-15', project:'cms485', category:'Calendar', risk:'critical', description:'60-day POC review: February cycle.' },
  { id:'CMS485-CO-009', title:'Q1 60-Day Episode Review — Mar Cycle', dueDate:'2026-03-15', project:'cms485', category:'Calendar', risk:'critical', description:'60-day POC review: March cycle.' },
  { id:'CMS485-CO-013', title:'Survey Readiness — 485 Pre-Survey Audit', dueDate:'2026-07-14', project:'cms485', category:'Survey', risk:'critical', cfr:'42 CFR §484.55, §484.60', description:'Pre-survey: 10% clinical records audit for 485/POC compliance. Correct all deficiencies.' },
];

/* ─── OASIS tasks ────────────────────────────────────────────── */

const OASIS_TASKS: HubTask[] = [
  { id:'OASIS-FM-001', title:'OASIS-E1 Assessment Form — Template Validation', project:'oasis', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.55', description:'Form CL-FM-002 | Validate all OASIS-E1 M/GG/J-items (effective 1/1/2023), verify SOC/ROC/FU/TRN/DC versions, iQIES compatibility.' },
  { id:'OASIS-FM-002', title:'SOC Comprehensive Assessment — Calibration', project:'oasis', category:'Form Setup', risk:'critical', description:'Form CL-FM-001 | Calibrate SOC assessment: 13 OASIS time points, demographic fields, EHR integration. Deadline: within 5 days of SOC.' },
  { id:'OASIS-FM-003', title:'Recertification / ROC Assessment — Form Review', project:'oasis', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.55(b)(c)', description:'Form CL-FM-003 | Review Recert and ROC forms: required OASIS items, episode transition dates.' },
  { id:'OASIS-FM-004', title:'Discharge / Transfer Assessment — Workflow Setup', project:'oasis', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.55(d)', description:'Form CL-FM-004 | Set up discharge/transfer workflows: 48-hr completion, 30-day transmission deadline.' },
  { id:'OASIS-FM-005', title:'OASIS Pre-Submission QA Checklist', project:'oasis', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.250', description:'Form CL-FM-031 | Mandatory QA step before every OASIS transmission. Clinical Manager sign-off required.' },
  { id:'OASIS-FM-006', title:'OASIS Coding Decision Worksheet — Deployment', project:'oasis', category:'Form Setup', risk:'high', description:'Form CL-FM-032 | Deploy for complex M/GG items: pain, pressure ulcer, dyspnea, self-care, medication mgmt, cognition.' },
  { id:'OASIS-FM-007', title:'OASIS Transmission Confirmation Log', project:'oasis', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.250', description:'Form CL-FM-045 | Record every iQIES submission, CMS acceptance/rejection, correction submissions. Monthly audit.' },
  { id:'OASIS-FM-008', title:'Clinician Competency Validation — OASIS', project:'oasis', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.55(a)(3)', description:'Form CL-FM-051 | Initial and annual competency validation, IRR testing (target ≥85%).' },
  { id:'OASIS-FM-009', title:'Documentation Source Evidence Matrix', project:'oasis', category:'Form Setup', risk:'medium', description:'Form CL-FM-050 | Map each OASIS item to acceptable documentation sources. Train all assessors.' },
  { id:'OASIS-FM-010', title:'Standardized Assessment Tool Administration Checklist', project:'oasis', category:'Form Setup', risk:'high', description:'Form CL-FM-056 | PHQ-2/9 (D0150/160), BIMS (C0200-500), pain tools (J0900). Document tool and score in OASIS.' },
  { id:'OASIS-WF-001', title:'SOC OASIS Workflow — Assessment to Transmission', dueDate:'2026-05-01', project:'oasis', category:'Workflow', risk:'critical', cfr:'42 CFR §484.55; §484.250', description:'SOC→OASIS-E1 within 5 days→QA checklist→Clinical Mgr review→iQIES→confirm→resolve rejections within 72 hrs. Deadline: 30 days from SOC.' },
  { id:'OASIS-WF-002', title:'OASIS QA Review Process — Monthly Audits', dueDate:'2026-05-31', project:'oasis', category:'Workflow', risk:'high', description:'Monthly: 10% sample, coding worksheets, IRR score (target ≥85%), top 3 discrepancies, feedback, report to QAPI.' },
  { id:'OASIS-WF-003', title:'Annual OASIS Clinician Competency Program', dueDate:'2026-09-30', project:'oasis', category:'Workflow', risk:'critical', description:'Annual: schedule all assessors, IRR case studies, score CL-FM-051, re-train <85%, document in personnel files.' },
  { id:'OASIS-WF-004', title:'OASIS Submission Compliance — Pre-Survey Evidence Bundle', dueDate:'2026-07-15', project:'oasis', category:'Survey', risk:'critical', description:'Pre-survey: transmission logs, QA checklists, competency records, IRR results, rejection/correction log. Target: ≥95% clean submission.' },
  { id:'OASIS-CO-001', title:'Q1 2026 — OASIS Transmission Audit', dueDate:'2026-03-31', project:'oasis', category:'Calendar', risk:'high', cfr:'42 CFR §484.250', description:'Verify all Q1 assessments transmitted within 30-day deadline, no outstanding rejections.' },
  { id:'OASIS-CO-002', title:'Q2 2026 — OASIS Transmission Audit', dueDate:'2026-06-30', project:'oasis', category:'Calendar', risk:'high', description:'Q2 audit of all OASIS submissions.' },
  { id:'OASIS-CO-003', title:'Q3 2026 — OASIS Transmission Audit', dueDate:'2026-09-30', project:'oasis', category:'Calendar', risk:'high', description:'Q3 audit of all OASIS submissions.' },
  { id:'OASIS-CO-004', title:'Q4 2026 — OASIS Transmission Audit + Annual Review', dueDate:'2026-12-31', project:'oasis', category:'Calendar', risk:'high', description:'Q4 and annual OASIS audit. Annual accuracy rate for QAPI reporting.' },
  { id:'OASIS-CO-005', title:'OASIS-E1 Version Check — Annual Update Review', dueDate:'2026-01-31', project:'oasis', category:'Calendar', risk:'medium', description:'Annual check for CMS OASIS-E1 item changes. Update forms and training materials if needed.' },
  { id:'OASIS-CO-006', title:'HHCAHPS / HH QRP — OASIS Alignment Review', dueDate:'2026-03-31', project:'oasis', category:'Calendar', risk:'high', cfr:'42 CFR §484.245', description:'Annual: verify OASIS items for public reporting captured, review quality measure rates in iQIES, compare to benchmarks.' },
];

/* ─── QAPI tasks ─────────────────────────────────────────────── */

const QAPI_TASKS: HubTask[] = [
  { id:'QAPI-FM-001', title:'QAPI Committee Meeting Minutes Template', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65', description:'Form QA-FM-001 | Set up minutes template: quorum log, agenda (data/PIP/adverse events/CAPs), action items, GB report prep. Retain 5 years.' },
  { id:'QAPI-FM-002', title:'PIP Charter Template — Review & Configure', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65(d)', description:'Form QA-FM-002 | Problem statement, SMART goal, root cause, intervention plan, measurement plan, remeasurement schedule, sustainment plan.' },
  { id:'QAPI-FM-003', title:'Quality Indicator Monthly Dashboard', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65(b)', description:'Form QA-FM-003 | OASIS outcomes, process measures, infection control, HHCAHPS, staff satisfaction, adverse event count. Monthly entry, quarterly trend analysis.' },
  { id:'QAPI-FM-004', title:'Adverse Event RCA Worksheet — Deployment', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65(b)(3)', description:'Form QA-FM-004 | Triggered by: hospitalizations, falls, med errors, infections, complaints, unexpected deaths. 5-Why analysis.' },
  { id:'QAPI-FM-005', title:'Corrective Action Plan Tracking Tool', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65', description:'Form QA-FM-005 | Link each CAP to triggering event, owner, due date, escalation >30 days, QAPI monthly review.' },
  { id:'QAPI-FM-006', title:'Infection Control Surveillance Log', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.70', description:'Form QA-FM-006 | Track patient infections by type, HAI flagging, IC Nurse sign-off, monthly aggregate to QAPI dashboard.' },
  { id:'QAPI-FM-007', title:'LUPA Prevention & Visit Utilization Log', project:'qapi', category:'Form Setup', risk:'high', description:'Form QA-FM-007 | Track patients at risk of LUPA (<6 visits/episode), clinical justification documentation, monthly billing-clinical review.' },
  { id:'QAPI-FM-008', title:'Patient Satisfaction Survey Proxy (HHCAHPS)', project:'qapi', category:'Form Setup', risk:'high', cfr:'42 CFR §484.245', description:'Form QA-FM-008 | Internal proxy survey: communication, professional care, overall rating. Monthly sample ≥5 patients.' },
  { id:'QAPI-FM-009', title:'Star Rating Improvement Action Plan', project:'qapi', category:'Form Setup', risk:'high', description:'Form QA-FM-009 | Bottom-quartile CMS Care Compare measures, 12-month improvement targets, domain owner per measure, monthly progress tracking.' },
  { id:'QAPI-FM-010', title:'QAPI Self-Assessment Annual Checklist', dueDate:'2026-12-10', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65(b)-(d)', description:'Form QA-FM-010 | 7 QAPI dimensions per §484.65, PIP completion, data adequacy, GB oversight, staff engagement.' },
  { id:'QAPI-FM-011', title:'Outcome Benchmarking Comparison Report', project:'qapi', category:'Form Setup', risk:'high', cfr:'42 CFR §484.65(b)(1)', description:'Form QA-FM-011 | Quarterly: compare OASIS outcomes vs. state/national averages from CMS iQIES Provider Preview.' },
  { id:'QAPI-FM-012', title:'Policy Effectiveness Monitoring Worksheet', dueDate:'2026-10-15', project:'qapi', category:'Form Setup', risk:'high', cfr:'42 CFR §484.105(i)', description:'Form QA-FM-012 | Annual: audit 10% of policies for compliance rate, identify gaps, feed to annual P&P review.' },
  { id:'QAPI-FM-013', title:'Patient Safety Event Communication Log', project:'qapi', category:'Form Setup', risk:'critical', cfr:'42 CFR §484.65(b)(3)', description:'Form QA-FM-013 | Log all safety events, 24-hr reporting for serious events, escalation to Risk Manager for sentinel events.' },
  { id:'QAPI-QTR-Q1-2026', title:'Q1 2026 QAPI Review + Annual PIP Kickoff', dueDate:'2026-02-05', project:'qapi', category:'Quarterly', risk:'critical', cfr:'42 CFR §484.65', description:'Q1 meeting: QI data review, PIP selection and charter, adverse events, infection control report, OASIS accuracy, CAP status.' },
  { id:'QAPI-QTR-Q2-2026', title:'Q2 2026 QAPI Review — PIP Remeasurement', dueDate:'2026-05-07', project:'qapi', category:'Quarterly', risk:'critical', cfr:'42 CFR §484.65', description:'Q2 meeting: QI dashboard, PIP Q2 remeasurement, star rating comparison, open CAPs, infection control, LUPA metrics.' },
  { id:'QAPI-QTR-Q3-2026', title:'Q3 2026 QAPI Review — PIP Sustainment Check', dueDate:'2026-08-06', project:'qapi', category:'Quarterly', risk:'critical', cfr:'42 CFR §484.65', description:'Q3 meeting: PIP sustainment decision, mid-year benchmarking, post-survey corrective actions, annual training status.' },
  { id:'QAPI-QTR-Q4-2026', title:'Q4 2026 QAPI Review + Annual PIP Formal Close', dueDate:'2026-11-05', project:'qapi', category:'Quarterly', risk:'critical', cfr:'42 CFR §484.65(d)', description:'Q4 meeting: PIP formal closure, annual self-assessment, FY27 priorities, GB annual report.' },
  { id:'QAPI-PIP-001', title:'Annual PIP — Topic Selection & Charter (Q1)', dueDate:'2026-02-05', project:'qapi', category:'PIP Lifecycle', risk:'critical', cfr:'42 CFR §484.65(d)', description:'Select PIP topic from bottom-quartile measures. Complete PIP Charter (QA-FM-002) with baseline, goal, interventions, measurement plan.' },
  { id:'QAPI-PIP-002', title:'Annual PIP — Q2 Remeasurement', dueDate:'2026-05-07', project:'qapi', category:'PIP Lifecycle', risk:'critical', description:'Q2 remeasurement: collect data per charter, calculate improvement vs. baseline, adjust interventions if not on track.' },
  { id:'QAPI-PIP-003', title:'Annual PIP — Q3 Sustainment Check', dueDate:'2026-08-06', project:'qapi', category:'PIP Lifecycle', risk:'critical', description:'Q3: third remeasurement, sustainment decision, restart interventions if not sustained.' },
  { id:'QAPI-PIP-004', title:'Annual PIP — Formal Closure & Sustainment Plan', dueDate:'2026-11-05', project:'qapi', category:'PIP Lifecycle', risk:'critical', cfr:'42 CFR §484.65(d)', description:'Formal closure: final remeasurement, sustainment plan, signed by Clinical Manager and Administrator, filed in QAPI binder.' },
  { id:'QAPI-ANNUAL-001', title:'Annual QAPI Program Evaluation', dueDate:'2026-12-10', project:'qapi', category:'Annual', risk:'critical', cfr:'42 CFR §484.65(b)-(d)', description:'Review all 4 quarterly cycles, PIP completion, CAP closure rates, OASIS accuracy, IC integration, staff participation, FY27 work plan.' },
  { id:'QAPI-ANNUAL-002', title:'Annual Outcome Benchmarking — Year-End Report', dueDate:'2026-12-10', project:'qapi', category:'Annual', risk:'high', description:'Full-year OASIS outcome data from iQIES, all 7 Home Health Compare measures vs. state/national, year-over-year improvement.' },
  { id:'QAPI-SURVEY-001', title:'QAPI Evidence Bundle — Pre-Survey Compilation', dueDate:'2026-07-13', project:'qapi', category:'Survey', risk:'critical', cfr:'42 CFR §484.65', description:'Pre-survey: PIP Charter + 4 remeasurements, all 4 quarterly minutes, QI Dashboard history, adverse event log, CAP tracker, IC logs, GB report.' },
  { id:'QAPI-SURVEY-002', title:'QAPI Staff Knowledge Verification — Pre-Survey', dueDate:'2026-07-13', project:'qapi', category:'Survey', risk:'critical', description:'Brief staff: Clinical Manager articulates PIP baseline/goal/result, prepare evidence binder with tabs, mock Q&A, confirm document access.' },
];

/* ─── Version History tasks ─────────────────────────────────── */

const VERSION_TASKS: HubTask[] = [
  // ── v1: CIHHC_PP_CC-IBM-Watson-FM (Mar 26, 2026) ──
  { id:'VER-V1-AUDIT-001', title:'v1 Codebase Audit — CIHHC_PP_CC-IBM-Watson-FM', project:'versions', category:'v1 Origin', risk:'medium', description:'Path: C:\\AI\\Git\\training\\CIHHC_PP_CC-IBM-Watson-FM\nModified: 2026-03-26\nPages: 12 | Routes: 13 | Git: Yes\nAudit all 12 pages, document unique features not in later versions, identify anything lost during migration.' },
  { id:'VER-V1-FEAT-001', title:'v1 Feature Documentation — IBM Watson Framework Integration', project:'versions', category:'v1 Origin', risk:'medium', description:'Document the IBM Watson FM integration in v1 (app/ + Builder/ directories). Capture API endpoints, model configs, any fine-tuning artifacts in CIHHC_PP_CC-IBM-Watson-FM.' },
  { id:'VER-V1-MIGRATE-001', title:'v1 → v5 Feature Gap Analysis', project:'versions', category:'v1 Origin', risk:'low', description:'Compare v1 (12 pages) to v5 (43 pages). Identify any deprecated features worth reinstating. Document in HUBSTAFF_MIGRATION_NOTES.md.' },

  // ── v2: Polices-and-Procedures (Apr 6, 2026) ──
  { id:'VER-V2-AUDIT-001', title:'v2 Codebase Audit — Polices-and-Procedures', project:'versions', category:'v2 Foundation', risk:'medium', description:'Path: C:\\AI\\Git\\training\\Polices-and-Procedures\nModified: 2026-04-06\nPages: 20 | Routes: 19 | Git: Yes (2 commits)\nAudit all 20 pages vs v5. Verify no unique policy content exists only here.' },
  { id:'VER-V2-CONTENT-001', title:'v2 Policy Content Preservation Check', project:'versions', category:'v2 Foundation', risk:'high', description:'Scan Polices-and-Procedures/Builder/ for any form templates, policy documents, or workflow configs that are NOT present in v5 (Policies_and_Procedures). Migrate if found.' },
  { id:'VER-V2-CLEANUP-001', title:'v2 Archive or Delete — Post-Audit Decision', project:'versions', category:'v2 Foundation', risk:'low', description:'After VER-V2-CONTENT-001: if no unique content, archive to C:\\AI\\Git\\training\\_ARCHIVED\\v2-Polices-and-Procedures.zip and remove live copy to prevent confusion.' },

  // ── v3: ci-policy-app (Apr 6, 2026) ──
  { id:'VER-V3-AUDIT-001', title:'v3 Codebase Audit — ci-policy-app', project:'versions', category:'v3 First App', risk:'medium', description:'Path: C:\\AI\\Git\\training\\ci-policy-app\nModified: 2026-04-06\nPages: 20 | Routes: 19 | Git: Yes\nLast commit: "fix: resolve 17 TypeScript build errors for Vercel deployment"\nDocument Vercel deployment config differences vs v5.' },
  { id:'VER-V3-VERCEL-001', title:'v3 Vercel Deployment Config Review', project:'versions', category:'v3 First App', risk:'medium', description:'ci-policy-app has vercel.json. Compare to v5 vercel.json. Document any routing or build config differences worth carrying forward. Check if ci-policy-app was ever live on Vercel.' },
  { id:'VER-V3-BUILDER-001', title:'v3 Builder/ Artifacts Inventory', project:'versions', category:'v3 First App', risk:'medium', description:'Inventory C:\\AI\\Git\\training\\ci-policy-app\\Builder\\ — all form templates, HTML exports, policy documents. Cross-reference with v5 Builder/ to identify any missing assets.' },
  { id:'VER-V3-CLEANUP-001', title:'v3 Archive Decision — ci-policy-app', project:'versions', category:'v3 First App', risk:'low', description:'After audit: if no unique content not in v5, archive to _ARCHIVED and remove. If Vercel config is unique, port to v5 and then archive.' },

  // ── v4: CI-ION-Home-Health-Polices-and-Procedures (Apr 14, 2026) ──
  { id:'VER-V4-AUDIT-001', title:'v4 Codebase Audit — CI-ION-Home-Health-Polices-and-Procedures', project:'versions', category:'v4 Rebrand', risk:'high', description:'Path: C:\\AI\\Git\\training\\CI-ION-Home-Health-Polices-and-Procedures\nModified: 2026-04-14\nPages: 22 | Routes: 20 | Git: Yes\nThis is the most recent non-current version. Do a full diff vs v5.' },
  { id:'VER-V4-REBRANDING-001', title:'v4 CI-ION Rebranding Artifacts Review', project:'versions', category:'v4 Rebrand', risk:'medium', description:'v4 contains a "CI-ION Rebranding" directory. Audit all branding assets, color tokens, logo variants, typography. Confirm all have been incorporated into v5 design system.' },
  { id:'VER-V4-FEAT-DIFF-001', title:'v4 → v5 Feature Diff (22 pages vs 43 pages)', project:'versions', category:'v4 Rebrand', risk:'high', description:'v4 has 22 pages; v5 has 43. The 21 pages added between v4→v5 include: Hubstaff Staging, Brad Robot, Journey/Onboarding, Workflow Library, Form Viewer, Audit Mode, iAdministrator, Demo, etc. Document complete feature delta.' },
  { id:'VER-V4-DIST-001', title:'v4 dist/ Build Output — Archive or Delete', project:'versions', category:'v4 Rebrand', risk:'low', description:'v4 has a dist/ folder with a built artifact. Determine if this was ever deployed. Archive or delete the stale build.' },

  // ── v5: Current (HomeHealth/Policies_and_Procedures) ──
  { id:'VER-V5-INVENTORY-001', title:'v5 CURRENT — Full Page Inventory (43 pages)', project:'versions', category:'v5 Current', risk:'high', description:'Path: C:\\AI\\Git\\training\\HomeHealth\\Policies_and_Procedures\nModified: 2026-04-21 (latest)\nPages: 43 | Routes: 31 | Git: Yes (5 commits)\nCreate definitive inventory of all 43 pages with status: Complete / In-Progress / Stub.' },
  { id:'VER-V5-FEATURES-001', title:'v5 — Feature Completeness Checklist', project:'versions', category:'v5 Current', risk:'high', description:'Audit all 31 routes in v5 App.tsx. For each route: confirm the page is fully implemented, not just a placeholder. Priority routes: /forms, /workflows, /audit, /governance, /calendar, /hubstaff.' },
  { id:'VER-V5-SERVER-001', title:'v5 — Express Server Health Check', project:'versions', category:'v5 Current', risk:'critical', description:'Verify all server routes are functional:\n- /api/calendar/* (Google Calendar sync)\n- /api/ia/* (iAdministrator RAG)\n- /api/hubstaff/* (NEW — Hubstaff proxy)\nTest each endpoint. Document required env vars.' },
  { id:'VER-V5-ENV-001', title:'v5 — .env Completeness Audit', project:'versions', category:'v5 Current', risk:'critical', description:'Audit .env file. Required vars:\n- HUBSTAFF_PAT (Hubstaff integration)\n- HUBSTAFF_ORG_ID\n- GOOGLE_CALENDAR_ID\n- GOOGLE_APPLICATION_CREDENTIALS\n- IA_CORPUS_ROOT, IA_INDEX_ROOT\nDocument which are set vs. missing.' },
  { id:'VER-V5-BUILD-001', title:'v5 — Production Build Verification', project:'versions', category:'v5 Current', risk:'high', description:'Run npm run build. Verify zero TypeScript errors, zero build warnings. Check dist/ output size. Test production preview with npm run preview.' },
  { id:'VER-V5-GIT-001', title:'v5 — Git History & Commit Quality Review', project:'versions', category:'v5 Current', risk:'low', description:'Review 5 git commits. Confirm all major features are committed. Identify any staged/unstaged work that should be committed. Add .gitignore entries if needed for .cache/, dist/, node_modules/.' },

  // ── Older Copies (non-git, informational) ──
  { id:'VER-COPY-CI-ION-001', title:'CI-ION Folder Audit — C:\\AI\\Git\\training\\CI-ION', project:'versions', category:'Older Copies', risk:'medium', description:'Path: C:\\AI\\Git\\training\\CI-ION\nModified: 2026-04-20 | Items: 23 | No git, no package.json\nThis appears to be a raw content/asset folder. Audit all 23 items. Identify any policy documents, HTML templates, or Builder artifacts not in v5.' },
  { id:'VER-COPY-LMS-001', title:'CI-ION LMS Folder Audit', project:'versions', category:'Older Copies', risk:'medium', description:'Path: C:\\AI\\Git\\training\\CI-ION LMS\nModified: 2026-04-15 | Items: 2\nSmall folder — likely an LMS export. Audit 2 items. If SCORM/xAPI content, document and integrate with v5 Journey/Onboarding module.' },
  { id:'VER-COPY-CIION-OLD-001', title:'CI-ION_Old Folder Audit', project:'versions', category:'Older Copies', risk:'low', description:'Path: C:\\AI\\Git\\training\\CI-ION_Old\nModified: 2026-04-14 | Items: 12 | No git\nOlder version before rebranding. Quick audit for any unique assets. Archive if nothing unique.' },
  { id:'VER-COPY-BUILDER-001', title:'Builder Folder Audit — C:\\AI\\Git\\training\\Builder', project:'versions', category:'Older Copies', risk:'medium', description:'Path: C:\\AI\\Git\\training\\Builder\nModified: 2026-04-06 | Items: 37 | No git\n37 items — significant Builder artifact folder. Cross-reference all forms/policies with v5 Builder/. This may be the source-of-truth for all form templates.' },
  { id:'VER-COPY-HH-BKP3-001', title:'HomeHealth-backup-3 Audit', project:'versions', category:'Older Copies', risk:'low', description:'Path: C:\\AI\\Git\\training\\HomeHealth-backup-3\nModified: 2026-02-26 | Items: 10\nFebruary 2026 backup. Oldest snapshot. Check for any policy content from before the React app era. Archive after audit.' },
  { id:'VER-COPY-POLICIES-TSX-001', title:'"Policies tsx" Folder Audit', project:'versions', category:'Older Copies', risk:'medium', description:'Path: C:\\AI\\Git\\training\\Policies tsx\nModified: 2026-03-26 | Items: 12 | No git\nContains .tsx files without a full project setup. Audit for any unique page components or policy content not in v5.' },
  { id:'VER-COPY-CIHHC-IBM-001', title:'CIHHC-IBM-Frawmework_PPs Audit', project:'versions', category:'Older Copies', risk:'medium', description:'Path: C:\\AI\\Git\\training\\CIHHC-IBM-Frawmework_PPs (+ Copy)\nModified: 2026-04-06 | Git: Yes\nIBM Framework P&P version. Audit for any policy templates or IBM Watson integration code unique to this branch. Has a full copy.' },

  // ── Migration / Maintenance ──
  { id:'VER-MIG-001', title:'Create Unified _ARCHIVED Folder Structure', project:'versions', category:'Migration', risk:'medium', description:'Create C:\\AI\\Git\\training\\_ARCHIVED\\ with subfolders per version. Move all non-current, post-audit copies. Keep v5 (HomeHealth/Policies_and_Procedures) as the single canonical source.' },
  { id:'VER-MIG-002', title:'Port All Unique Assets to v5', project:'versions', category:'Migration', risk:'high', description:'After all version audits: consolidate any unique form templates, policy content, branding assets, or IBM Watson integration code into v5. Update v5 Builder/ accordingly.' },
  { id:'VER-MIG-003', title:'Hubstaff Project ID Registry — Save All IDs', project:'versions', category:'Migration', risk:'critical', description:'After Hubstaff push: save all auto-created project IDs to C:\\AI\\Git\\training\\HomeHealth\\Policies_and_Procedures\\.env:\n- HUBSTAFF_PROJECT_VERSIONS=<id>\n- HUBSTAFF_PROJECT_CMS485=<id>\n- HUBSTAFF_PROJECT_OASIS=<id>\n- HUBSTAFF_PROJECT_QAPI=<id>\n- HUBSTAFF_ORG_ID=<id>' },
  { id:'VER-MAINT-001', title:'Weekly v5 Git Commit Cadence', project:'versions', category:'Maintenance', risk:'medium', description:'Establish weekly git commit in v5. Every Friday: git status, add all changed files, commit with message format "chore(YYYY-WW): weekly snapshot — [summary]".' },
  { id:'VER-MAINT-002', title:'Monthly Dependency Audit', project:'versions', category:'Maintenance', risk:'medium', description:'Monthly: run npm outdated in v5. Update non-breaking minor/patch versions. Document major version upgrades in CHANGELOG. Check for security advisories with npm audit.' },
  { id:'VER-MAINT-003', title:'Desktop Shortcut & Launch Script Verification', project:'versions', category:'Maintenance', risk:'low', description:'Verify the CI-ION Policy App desktop shortcut launches correctly. The shortcut runs: C:\\AI\\Git\\training\\HomeHealth\\Policies_and_Procedures\\Launch-CI-ION.bat\nConfirm server starts on port 8787 and Vite on 5173.' },
];

export const ALL_TASKS: HubTask[] = [...MAIN_TASKS, ...CMS485_TASKS, ...OASIS_TASKS, ...QAPI_TASKS, ...VERSION_TASKS];
