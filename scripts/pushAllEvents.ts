/**
 * pushAllEvents.ts
 * ─────────────────────────────────────────────────────────────
 * Standalone script: pushes ALL regulatory compliance events
 * from the Care Indeed Home Health Regulatory Planner to the
 * configured Google Calendar using the service-account credentials.
 *
 * HOW TO RUN:
 *   1. Place your service-account JSON at:
 *      server/credentials/service-account.json
 *   2. Ensure .env has the correct GOOGLE_CALENDAR_ID
 *   3. Run:
 *      npx tsx scripts/pushAllEvents.ts
 *
 * The script is IDEMPOTENT — safe to re-run. Events are matched
 * by appEventId stored in extendedProperties.private.appEventId.
 * Existing events will be UPDATED; new ones will be CREATED.
 * ─────────────────────────────────────────────────────────────
 */

import { google, calendar_v3 } from 'googleapis';
import dotenv from 'dotenv';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(repoRoot, '.env') });

/* ─── Config ─────────────────────────────────────────────────── */

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID ?? '';
const TIMEZONE    = process.env.DEFAULT_TIMEZONE ?? 'America/Los_Angeles';
const CRED_RAW    = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? './server/credentials/service-account.json';
const CRED_PATH   = path.isAbsolute(CRED_RAW) ? CRED_RAW : path.resolve(repoRoot, CRED_RAW);

if (!CALENDAR_ID) {
  console.error('❌  GOOGLE_CALENDAR_ID not set in .env');
  process.exit(1);
}
if (!fs.existsSync(CRED_PATH)) {
  console.error(`❌  Service-account JSON not found at: ${CRED_PATH}`);
  console.error('    Place your downloaded key file there and re-run.');
  process.exit(1);
}

/* ─── Event catalogue ────────────────────────────────────────── */

interface EventEntry {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time?: string;
  timeEnd?: string;
  allDay?: boolean;
  domain: string;
  cadence: string;
  mandateType?: string;
  owner: string;
  ownerRole: string;
  policyRefs: string[];
  summary: string;
  regulatoryDriver?: string;
  auditRisk?: string;
  category?: string;
  location?: string;
}

const EVENTS: EventEntry[] = [
  /* ══════════════════════════════════════════════════════════
     GOVERNANCE
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-GV-2026-0108-ANNPKT',
    title: 'Annual Governance Packet Review',
    date: '2026-01-08', time: '09:00', timeEnd: '11:00',
    domain: 'Governance', cadence: 'Annual', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001', 'GV-GB-002'],
    summary: 'Annual board review of institutional plan, budget, acceptance-to-service criteria, and public service information.',
    regulatoryDriver: '42 CFR §484.105(b) — Governing Body CoP',
    auditRisk: 'critical', category: 'board-annual',
  },
  {
    id: 'EVT-GV-Q1-2026',
    title: 'Q1 2026 Governing Body Meeting',
    date: '2026-02-12', time: '10:00', timeEnd: '12:00',
    domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001'],
    summary: 'Quarterly governing body meeting covering QAPI results, budget review, and organizational oversight.',
    regulatoryDriver: '42 CFR §484.105 — Governing Body',
    auditRisk: 'critical', category: 'governing-body',
  },
  {
    id: 'EVT-GV-Q2-2026',
    title: 'Q2 2026 Governing Body Meeting',
    date: '2026-05-14', time: '10:00', timeEnd: '12:00',
    domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001'],
    summary: 'Quarterly governing body meeting — Q2 QAPI review, financial oversight, clinical outcomes.',
    regulatoryDriver: '42 CFR §484.105 — Governing Body',
    auditRisk: 'critical', category: 'governing-body',
  },
  {
    id: 'EVT-GV-Q3-2026',
    title: 'Q3 2026 Governing Body Meeting',
    date: '2026-08-13', time: '10:00', timeEnd: '12:00',
    domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001'],
    summary: 'Quarterly governing body meeting — Q3 QAPI, risk management review, mid-year budget variance.',
    regulatoryDriver: '42 CFR §484.105 — Governing Body',
    auditRisk: 'critical', category: 'governing-body',
  },
  {
    id: 'EVT-GV-Q4-2026',
    title: 'Q4 2026 Governing Body Meeting',
    date: '2026-11-12', time: '10:00', timeEnd: '12:00',
    domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001'],
    summary: 'Quarterly governing body meeting — annual review, Q4 QAPI, FY27 planning.',
    regulatoryDriver: '42 CFR §484.105 — Governing Body',
    auditRisk: 'critical', category: 'governing-body',
  },

  /* ══════════════════════════════════════════════════════════
     QAPI
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-QA-2026-0205-QAPI-Q1',
    title: 'Q1 QAPI Review + Annual PIP Kickoff',
    date: '2026-02-05', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Q1 policy-driven QAPI governance review and annual Performance Improvement Project kickoff.',
    regulatoryDriver: '42 CFR §484.65 — QAPI. At least one PIP required per calendar year.',
    auditRisk: 'high', category: 'qapi-quarterly',
  },
  {
    id: 'EVT-QA-2026-Q2',
    title: 'Q2 QAPI Review',
    date: '2026-05-07', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001'],
    summary: 'Q2 policy-driven QAPI governance review — PIP remeasurement, dashboard review, action log.',
    regulatoryDriver: '42 CFR §484.65 — QAPI ongoing program',
    auditRisk: 'high', category: 'qapi-quarterly',
  },
  {
    id: 'EVT-QA-2026-Q3',
    title: 'Q3 QAPI Review',
    date: '2026-08-06', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001'],
    summary: 'Q3 policy-driven QAPI governance review — PIP sustainment check, adverse event analysis.',
    regulatoryDriver: '42 CFR §484.65 — QAPI ongoing program',
    auditRisk: 'high', category: 'qapi-quarterly',
  },
  {
    id: 'EVT-QA-2026-Q4',
    title: 'Q4 QAPI Review + Annual PIP Close',
    date: '2026-11-05', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Q4 QAPI review — annual PIP closure, sustainment plan, governing body packet preparation.',
    regulatoryDriver: '42 CFR §484.65 — QAPI annual PIP requirement',
    auditRisk: 'high', category: 'qapi-quarterly',
  },

  /* ══════════════════════════════════════════════════════════
     EMERGENCY PREPAREDNESS
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-RM-2026-0115-EP-REVIEW',
    title: 'Biennial Emergency Preparedness Review / Update',
    date: '2026-01-15', time: '09:00', timeEnd: '17:00',
    domain: 'Risk', cadence: 'Biennial', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator',
    policyRefs: ['EP-100', 'EP-110', 'EP-120', 'EP-130'],
    summary: 'Full biennial review and update of emergency plan, policies/procedures, communications plan, and training/testing program.',
    regulatoryDriver: '42 CFR §484.102(a)-(d) — Emergency Preparedness',
    auditRisk: 'critical', category: 'emergency-preparedness',
  },
  {
    id: 'EVT-RM-2026-0122-EP-TRAIN',
    title: 'Biennial Emergency Preparedness Staff Training',
    date: '2026-01-22', time: '09:00', timeEnd: '11:30',
    domain: 'Risk', cadence: 'Biennial', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator',
    policyRefs: ['EP-130', 'EP-140'],
    summary: 'Biennial emergency-preparedness training for all required staff. Role-based curriculum.',
    regulatoryDriver: '42 CFR §484.102(d)(1) — EP training biennial requirement',
    auditRisk: 'critical', category: 'emergency-preparedness',
  },
  {
    id: 'EVT-RM-2026-0318-EP-EXERCISE',
    title: 'Annual Emergency Exercise (Tabletop)',
    date: '2026-03-18', time: '09:00', timeEnd: '12:00',
    domain: 'Risk', cadence: 'Annual', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator',
    policyRefs: ['EP-140', 'EP-150'],
    summary: 'Annual emergency exercise — tabletop scenario, debrief, after-action report, corrective actions.',
    regulatoryDriver: '42 CFR §484.102(d)(2) — Annual EP exercise',
    auditRisk: 'critical', category: 'emergency-preparedness',
  },

  /* ══════════════════════════════════════════════════════════
     AIDE COMPLIANCE
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-CL-2026-0209-AIDE-INSERVICE',
    title: 'Annual Aide In-Service Training Campaign (12 hrs)',
    date: '2026-02-09', endDate: '2026-02-20', allDay: true,
    domain: 'Clinical', cadence: 'Annual', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Staff Development RN',
    policyRefs: ['AIDE-100', 'AIDE-101'],
    summary: 'Annual 12-hour in-service training campaign for all home health aides. RN supervised.',
    regulatoryDriver: '42 CFR §484.80(d) — At least 12 hours of in-service training per 12-month period',
    auditRisk: 'critical', category: 'aide-training',
  },
  {
    id: 'EVT-CL-2026-0225-AIDE-OBS-SKILLED',
    title: 'Annual Skilled-Patient Aide Direct Observation',
    date: '2026-02-25', time: '08:00', timeEnd: '16:00',
    domain: 'Clinical', cadence: 'Annual', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'RN Supervisor',
    policyRefs: ['AIDE-110'],
    summary: 'Annual onsite direct observation of each aide serving a patient also receiving skilled nursing/PT/OT/SLP services.',
    regulatoryDriver: '42 CFR §484.80(h)(1)(iv) — Annual aide observation (skilled-patient assignment)',
    auditRisk: 'critical', category: 'aide-supervision',
  },
  {
    id: 'EVT-CL-2026-0311-AIDE-OBS-AIDEONLY',
    title: 'Semiannual Aide-Only Patient Observation (Cycle 1)',
    date: '2026-03-11', time: '08:00', timeEnd: '16:00',
    domain: 'Clinical', cadence: 'Semiannual', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'RN Supervisor',
    policyRefs: ['AIDE-120', 'AIDE-121'],
    summary: 'Semiannual onsite observation of each aide serving aide-only patients (no concurrent skilled services). Cycle 1.',
    regulatoryDriver: '42 CFR §484.80(h)(2)(ii) — Semiannual aide observation (aide-only assignment)',
    auditRisk: 'critical', category: 'aide-supervision',
  },
  {
    id: 'EVT-CL-2026-0911-AIDE-OBS-AIDEONLY-C2',
    title: 'Semiannual Aide-Only Patient Observation (Cycle 2)',
    date: '2026-09-11', time: '08:00', timeEnd: '16:00',
    domain: 'Clinical', cadence: 'Semiannual', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'RN Supervisor',
    policyRefs: ['AIDE-120', 'AIDE-121'],
    summary: 'Semiannual onsite observation of each aide serving aide-only patients. Cycle 2.',
    regulatoryDriver: '42 CFR §484.80(h)(2)(ii) — Semiannual aide observation (aide-only assignment)',
    auditRisk: 'critical', category: 'aide-supervision',
  },

  /* ══════════════════════════════════════════════════════════
     HHCAHPS
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-CO-2026-0331-HHCAHPS',
    title: 'HHCAHPS Annual Exemption Decision / Participation Filing',
    date: '2026-03-31', time: '09:00', timeEnd: '10:30',
    domain: 'Compliance', cadence: 'Annual', mandateType: 'conditional-federal',
    owner: 'Administrator', ownerRole: 'HHCAHPS Coordinator',
    policyRefs: ['QRP-100', 'VEND-120'],
    summary: 'Annual determination: if <60 eligible unique patients → file Patient Exemption Request. Otherwise confirm active vendor and submission status.',
    regulatoryDriver: '42 CFR §484.245(b)(1)(iii)(A)-(B) — HH QRP HHCAHPS participation',
    auditRisk: 'high', category: 'hhcahps',
  },

  /* ══════════════════════════════════════════════════════════
     COMPLIANCE REPORTS
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-CO-2026-JAN-WEEKLY-01',
    title: 'Weekly Compliance Report (Jan Wk 1)',
    date: '2026-01-05', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Weekly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Weekly compliance reporting: claims status, outstanding signatures, OASIS submission, outstanding items.',
    regulatoryDriver: 'CO-CP-001 — Corporate Compliance Program',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-JAN-MONTHLY',
    title: 'Monthly Compliance Report — January 2026',
    date: '2026-01-30', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: OIG exclusions, documentation compliance %, outstanding physician orders, denial review.',
    regulatoryDriver: 'CO-CP-001 — Corporate Compliance Program',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-FEB-MONTHLY',
    title: 'Monthly Compliance Report — February 2026',
    date: '2026-02-27', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: February claims, signatures, denials, OIG.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-MAR-MONTHLY',
    title: 'Monthly Compliance Report — March 2026',
    date: '2026-03-31', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: March claims, signatures, Q1 trend analysis.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-APR-MONTHLY',
    title: 'Monthly Compliance Report — April 2026',
    date: '2026-04-30', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: April claims, signatures, denials.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-MAY-MONTHLY',
    title: 'Monthly Compliance Report — May 2026',
    date: '2026-05-29', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: May claims, signatures, denials.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-JUN-MONTHLY',
    title: 'Monthly Compliance Report — June 2026',
    date: '2026-06-30', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: June / mid-year variance.',
    auditRisk: 'medium', category: 'compliance-report',
  },

  /* ══════════════════════════════════════════════════════════
     CLINICAL / PLAN OF CARE
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-CL-2026-JAN-60DAY',
    title: '60-Day Episode Review — January 2026 Cycle',
    date: '2026-01-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Review and update plan of care for all patients at the 60-day episode mark. Physician re-certification.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care review at least every 60 days',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-FEB-60DAY',
    title: '60-Day Episode Review — February 2026 Cycle',
    date: '2026-02-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: all active patients at 60-day mark. Re-certification and physician signatures.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-MAR-60DAY',
    title: '60-Day Episode Review — March 2026 Cycle',
    date: '2026-03-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: March cycle. Physician re-certification.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-APR-60DAY',
    title: '60-Day Episode Review — April 2026 Cycle',
    date: '2026-04-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: April cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-MAY-60DAY',
    title: '60-Day Episode Review — May 2026 Cycle',
    date: '2026-05-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: May cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-INFECTION-Q1',
    title: 'Q1 Infection Control Review',
    date: '2026-03-25', time: '10:00', timeEnd: '11:00',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001'],
    summary: 'Quarterly infection surveillance review: infection event counts, HAI trends, QAPI feed.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control',
    auditRisk: 'high', category: 'infection-control',
  },
  {
    id: 'EVT-CL-2026-INFECTION-Q2',
    title: 'Q2 Infection Control Review',
    date: '2026-06-24', time: '10:00', timeEnd: '11:00',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001'],
    summary: 'Q2 infection surveillance review. Feed to QAPI dashboard.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control',
    auditRisk: 'high', category: 'infection-control',
  },

  /* ══════════════════════════════════════════════════════════
     RISK MANAGEMENT
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-RM-2026-Q1-RISK',
    title: 'Q1 Risk Management Committee Meeting',
    date: '2026-03-19', time: '13:00', timeEnd: '14:30',
    domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Administrator', ownerRole: 'Risk Manager',
    policyRefs: ['RM-RP-001'],
    summary: 'Q1 risk management review: incident reports, adverse events, sentinel events, corrective actions.',
    regulatoryDriver: 'RM-RP-001 — Risk Management Program',
    auditRisk: 'high', category: 'risk-committee',
  },
  {
    id: 'EVT-RM-2026-Q2-RISK',
    title: 'Q2 Risk Management Committee Meeting',
    date: '2026-06-18', time: '13:00', timeEnd: '14:30',
    domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Administrator', ownerRole: 'Risk Manager',
    policyRefs: ['RM-RP-001'],
    summary: 'Q2 risk management review.',
    auditRisk: 'high', category: 'risk-committee',
  },

  /* ══════════════════════════════════════════════════════════
     IT / SECURITY
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-IT-2026-Q1-SYSREVIEW',
    title: 'Q1 System Activity & Security Review',
    date: '2026-03-27', time: '14:00', timeEnd: '15:00',
    domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'IT Director', ownerRole: 'IT Security Officer',
    policyRefs: ['IT-SA-001'],
    summary: 'Quarterly review of system access logs, security incidents, user permissions, and HIPAA audit trail.',
    regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308 — Security Management Process',
    auditRisk: 'high', category: 'it-security',
  },
  {
    id: 'EVT-IT-2026-Q2-SYSREVIEW',
    title: 'Q2 System Activity & Security Review',
    date: '2026-06-26', time: '14:00', timeEnd: '15:00',
    domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'IT Director', ownerRole: 'IT Security Officer',
    policyRefs: ['IT-SA-001'],
    summary: 'Q2 system security review.',
    regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308',
    auditRisk: 'high', category: 'it-security',
  },

  /* ══════════════════════════════════════════════════════════
     FINANCE / BILLING
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-FN-2026-JAN-CLAIMS',
    title: 'January 2026 Claims Submission Cycle',
    date: '2026-01-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission: review scrubber, submit clean claims, resolve rejections.',
    regulatoryDriver: 'FN-BC-001 — Medicare Billing & Claims Submission',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-FEB-CLAIMS',
    title: 'February 2026 Claims Submission Cycle',
    date: '2026-02-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-MAR-CLAIMS',
    title: 'March 2026 Claims Submission Cycle',
    date: '2026-03-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-APR-CLAIMS',
    title: 'April 2026 Claims Submission Cycle',
    date: '2026-04-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-MAY-CLAIMS',
    title: 'May 2026 Claims Submission Cycle',
    date: '2026-05-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-Q1-DENIAL',
    title: 'Q1 Denial Management Review',
    date: '2026-04-07', time: '10:00', timeEnd: '11:00',
    domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Billing Manager', ownerRole: 'Billing Manager',
    policyRefs: ['FN-DM-001'],
    summary: 'Q1 denial analysis: denial categories, root causes, appeals status, process improvement.',
    auditRisk: 'high', category: 'denial-management',
  },
  {
    id: 'EVT-FN-2026-Q1-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — January',
    date: '2026-01-28', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track and follow up on outstanding physician signatures for plan of care, orders, and certifications.',
    regulatoryDriver: '42 CFR §484.60 — Plan of care requires physician signature',
    auditRisk: 'critical', category: 'physician-signatures',
  },

  /* ══════════════════════════════════════════════════════════
     HR / TRAINING
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-HR-2026-OIG-Q1',
    title: 'Q1 OIG Exclusion Check',
    date: '2026-01-02', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Run monthly OIG exclusion screening for all employees, contractors, and vendors.',
    regulatoryDriver: 'OIG Exclusion Screening — CMS Conditions of Participation',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-FEB',
    title: 'February OIG Exclusion Check',
    date: '2026-02-02', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-MAR',
    title: 'March OIG Exclusion Check',
    date: '2026-03-02', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-APR',
    title: 'April OIG Exclusion Check',
    date: '2026-04-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-MAY',
    title: 'May OIG Exclusion Check',
    date: '2026-05-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
];

/* ─── Google Calendar client ─────────────────────────────────── */

async function getCalendar(): Promise<calendar_v3.Calendar> {
  const auth = new google.auth.GoogleAuth({
    keyFile: CRED_PATH,
    scopes: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });
  const authClient = await auth.getClient();
  // Quick pre-flight: verify the calendar is reachable before attempting bulk push
  const cal = google.calendar({ version: 'v3', auth: authClient as never });
  try {
    await cal.calendars.get({ calendarId: CALENDAR_ID });
  } catch {
    console.error('\n❌  Calendar not accessible. The service account needs "Make changes to events" permission.');
    console.error('    In Google Calendar → "Home Health Compliance" → Settings & sharing');
    console.error('    → Share with: hh-enterprise-policy-architect@orbital-stage-443721-v1.iam.gserviceaccount.com');
    console.error('    → Permission: Make changes to events\n');
    process.exit(1);
  }
  return cal;
}

/* ─── Find existing event by appEventId ─────────────────────── */

async function findByAppEventId(
  cal: calendar_v3.Calendar,
  appEventId: string,
): Promise<calendar_v3.Schema$Event | null> {
  const res = await cal.events.list({
    calendarId: CALENDAR_ID,
    privateExtendedProperty: [`appEventId=${appEventId}`],
    singleEvents: true,
    maxResults: 2,
  });
  return res.data.items?.[0] ?? null;
}

/* ─── Build Google Calendar event body ───────────────────────── */

function buildGoogleEvent(e: EventEntry): calendar_v3.Schema$Event {
  const tz = TIMEZONE;
  const allDay = !!e.allDay || (!e.time && !e.timeEnd);

  const descriptionParts = [e.summary];
  const meta: string[] = [];
  if (e.domain)       meta.push(`Domain: ${e.domain}`);
  if (e.cadence)      meta.push(`Frequency: ${e.cadence}`);
  if (e.mandateType)  meta.push(`Mandate: ${formatMandate(e.mandateType)}`);
  if (e.policyRefs?.length) meta.push(`Policy: ${e.policyRefs.join(', ')}`);
  if (e.owner)        meta.push(`Owner: ${e.owner} (${e.ownerRole})`);
  if (e.regulatoryDriver) meta.push(`Regulatory basis: ${e.regulatoryDriver}`);
  if (e.auditRisk)    meta.push(`Audit risk: ${e.auditRisk}`);
  if (meta.length) descriptionParts.push('\n— Care Indeed Regulatory Planner —\n' + meta.join('\n'));
  descriptionParts.push(`\n(app event: ${e.id})`);

  const description = descriptionParts.filter(Boolean).join('\n\n');

  const base: calendar_v3.Schema$Event = {
    summary: e.title,
    description,
    location: e.location,
    extendedProperties: {
      private: {
        appEventId: e.id,
        domain: e.domain,
        cadence: e.cadence,
        mandateType: e.mandateType ?? '',
        owner: e.owner,
        ownerRole: e.ownerRole,
        policyRefs: e.policyRefs.join(','),
        auditRisk: e.auditRisk ?? '',
        category: e.category ?? '',
        source: 'ci-regulatory-planner',
      },
    },
  };

  if (allDay) {
    const endDate = e.endDate ?? e.date;
    base.start = { date: e.date };
    base.end   = { date: addDay(endDate) };
  } else {
    const pad = (t?: string) => t ? `${e.date}T${t}:00` : `${e.date}T00:00:00`;
    base.start = { dateTime: pad(e.time),    timeZone: tz };
    base.end   = { dateTime: pad(e.timeEnd ?? e.time), timeZone: tz };
  }
  return base;
}

function addDay(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

function formatMandate(m?: string): string {
  if (!m) return '';
  return {
    'federal-required':    'Federal Required',
    'conditional-federal': 'Conditional Federal',
    'policy-driven':       'Policy-Driven',
    'state-required':      'State Required',
  }[m] ?? m;
}

/* ─── Main push logic ────────────────────────────────────────── */

async function pushAllEvents() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Care Indeed — Regulatory Planner → Google Calendar');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Calendar : ${CALENDAR_ID}`);
  console.log(`  Timezone : ${TIMEZONE}`);
  console.log(`  Events   : ${EVENTS.length}`);
  console.log(`  Creds    : ${CRED_PATH}`);
  console.log('──────────────────────────────────────────────────────\n');

  const cal = await getCalendar();
  console.log('✅  Authenticated to Google Calendar\n');

  let created = 0;
  let updated = 0;
  let failed  = 0;

  for (const ev of EVENTS) {
    try {
      const body = buildGoogleEvent(ev);
      const existing = await findByAppEventId(cal, ev.id);

      if (existing?.id) {
        await cal.events.update({ calendarId: CALENDAR_ID, eventId: existing.id, requestBody: body });
        console.log(`  ↻  UPDATED  ${ev.date}  ${ev.title}`);
        updated++;
      } else {
        await cal.events.insert({ calendarId: CALENDAR_ID, requestBody: body });
        console.log(`  +  CREATED  ${ev.date}  ${ev.title}`);
        created++;
      }
      // Small delay to avoid quota errors
      await sleep(120);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`  ✗  FAILED   ${ev.date}  ${ev.title} — ${msg}`);
      failed++;
    }
  }

  console.log('\n──────────────────────────────────────────────────────');
  console.log(`  ✅ Created : ${created}`);
  console.log(`  ↻  Updated : ${updated}`);
  console.log(`  ❌ Failed  : ${failed}`);
  console.log('══════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms));
}

pushAllEvents().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
