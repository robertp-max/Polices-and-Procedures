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

  /* ══════════════════════════════════════════════════════════
     ██  MEDICARE CERTIFICATION SURVEY READINESS
         TARGET: July 2026 — 2nd Week (July 13–17)
     All events below represent the real operational sprint
     that must be completed before / during survey week.
     Per 42 CFR Part 484 Conditions of Participation.
  ══════════════════════════════════════════════════════════ */

  // ── MONDAY JULY 13 — Survey Week Day 1 ───────────────────
  {
    id: 'EVT-SURVEY-2026-0713-MOCK',
    title: 'Medicare Certification Survey — Internal Mock Survey',
    date: '2026-07-13', time: '08:00', timeEnd: '17:00',
    domain: 'Compliance', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001', 'GV-GB-001', 'QA-PG-001', 'CL-IC-001', 'EP-100'],
    summary: 'Full-day internal mock CMS survey drill. Simulates surveyor walkthrough across all Conditions of Participation: governance, QAPI, clinical records, aide supervision, emergency preparedness, infection control, and billing compliance. All evidence bundles must be staged.',
    regulatoryDriver: '42 CFR Part 484 — All Conditions of Participation; CMS SOM Appendix B',
    auditRisk: 'critical', category: 'survey-readiness',
  },
  {
    id: 'EVT-SURVEY-2026-0713-QAPI-EVIDENCE',
    title: 'QAPI Evidence Bundle Compilation — Pre-Survey Final Review',
    date: '2026-07-13', time: '09:00', timeEnd: '11:30',
    domain: 'QAPI', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Compile and finalize the complete QAPI evidence bundle for survey: PIP charter, baseline/target/result data, governing body review records, adverse event log, meeting minutes, action log, and sustainment plan. Confirm at least one PIP per 42 CFR §484.65(d). Bundle must be export-ready.',
    regulatoryDriver: '42 CFR §484.65(b)-(d) — QAPI: PIP, data-driven review, governing body oversight',
    auditRisk: 'critical', category: 'survey-readiness',
  },

  // ── TUESDAY JULY 14 — Survey Week Day 2 ──────────────────
  {
    id: 'EVT-SURVEY-2026-0714-GB-AUTH',
    title: 'Governing Body Emergency Session — Medicare Certification Survey Authorization',
    date: '2026-07-14', time: '10:00', timeEnd: '12:00',
    domain: 'Governance', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Governing Body Chair',
    policyRefs: ['GV-GB-001', 'GV-GB-002'],
    summary: 'Special governing body session to formally certify organizational readiness for Medicare certification survey. Agenda: review of all CoP evidence bundles, confirmation of policies/procedures currency, budget/staffing adequacy sign-off, administrator authority delegation, and governing body resolution authorizing survey participation. Minutes required.',
    regulatoryDriver: '42 CFR §484.105 — Governing Body CoP: administrative authority, policy approval, oversight',
    auditRisk: 'critical', category: 'survey-readiness',
  },
  {
    id: 'EVT-SURVEY-2026-0714-CLINICAL-AUDIT',
    title: 'Clinical Records Sample Audit — Pre-Survey Compliance Review',
    date: '2026-07-14', time: '13:00', timeEnd: '16:30',
    domain: 'Clinical', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'CL-OA-006'],
    summary: 'Stratified sample audit of clinical records against all CoP requirements: comprehensive assessment completeness (OASIS), plan of care currency and physician signatures, medication reconciliation, advance directive documentation, patient rights notifications, 60-day episode certifications, and skilled visit documentation. Deficiencies identified must be corrected before survey.',
    regulatoryDriver: '42 CFR §484.55, §484.60, §484.110 — Comprehensive assessment, plan of care, clinical records',
    auditRisk: 'critical', category: 'survey-readiness',
  },

  // ── WEDNESDAY JULY 15 — Survey Week Day 3 ────────────────
  {
    id: 'EVT-SURVEY-2026-0715-PP-REVIEW',
    title: 'Policy & Procedure Library Final Review — All Domains',
    date: '2026-07-15', time: '09:00', timeEnd: '12:00',
    domain: 'Compliance', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001', 'CO-CP-001', 'QA-PG-001', 'CL-IC-001', 'AIDE-100', 'EP-100', 'HR-OIG-001', 'IT-SA-001'],
    summary: 'Comprehensive review of all agency policies and procedures across every domain: Governance, Clinical, QAPI, Infection Control, Aide Services, Emergency Preparedness, HR, IT/Security, Billing. Verify each policy references the correct CFR citation, is signed by governing body, has a current effective date within the required review cycle, and is accessible to staff. Each domain lead attests policy currency.',
    regulatoryDriver: '42 CFR §484.105(i)(1)-(2) — Governing body must establish, review, and approve all policies',
    auditRisk: 'critical', category: 'survey-readiness',
  },
  {
    id: 'EVT-SURVEY-2026-0715-EP-PACKET',
    title: 'Emergency Preparedness Survey Documentation Packet — Final Review',
    date: '2026-07-15', time: '13:00', timeEnd: '15:00',
    domain: 'Risk', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator',
    policyRefs: ['EP-100', 'EP-110', 'EP-120', 'EP-130', 'EP-140', 'EP-150'],
    summary: 'Final pre-survey review of the complete Emergency Preparedness documentation packet: current biennial EP review (Jan 2026), staff training rosters (Jan 2026), annual exercise after-action report (Mar 2026), all four EP components (risk assessment, policies/procedures, communications plan, training/testing program), patient emergency categorization, and corrective action closure confirmation.',
    regulatoryDriver: '42 CFR §484.102(a)-(d)(2) — Emergency preparedness: all 4 components + annual exercise + biennial training',
    auditRisk: 'critical', category: 'survey-readiness',
  },

  // ── THURSDAY JULY 16 — Survey Week Day 4 ─────────────────
  {
    id: 'EVT-SURVEY-2026-0716-STAFF-AUDIT',
    title: 'Staff Credential & Training Records Compliance Audit',
    date: '2026-07-16', time: '09:00', timeEnd: '12:00',
    domain: 'Compliance', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001', 'AIDE-100', 'AIDE-101', 'AIDE-110'],
    summary: 'Comprehensive HR compliance audit for survey: (1) Active license/certification verification for all clinical staff. (2) Current OIG/SAM exclusion screenings on file. (3) Aide annual in-service completion (12-hour minimum per 42 CFR §484.80(d)) — all aides in scope. (4) Aide competency evaluations current. (5) Background check documentation. (6) TB screening. (7) CPR certification. Any gap must have a corrective action plan before survey.',
    regulatoryDriver: '42 CFR §484.80(a)-(d) — Aide training/competency; §484.115 — Personnel qualifications',
    auditRisk: 'critical', category: 'survey-readiness',
  },
  {
    id: 'EVT-SURVEY-2026-0716-IC-EVIDENCE',
    title: 'Infection Control Program Pre-Survey Evidence Compilation',
    date: '2026-07-16', time: '13:00', timeEnd: '15:00',
    domain: 'Clinical', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001'],
    summary: 'Compile infection control program survey documentation: (1) IC policy signed and current. (2) Q1 and Q2 2026 infection surveillance reports. (3) HAI event log with investigation outcomes. (4) Hand hygiene and PPE compliance audit results. (5) IC findings fed into QAPI dashboard. (6) Staff IC training records current. (7) IC nurse designation documented. Evidence bundle must be export-ready for surveyor review.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control; integrated with QAPI under §484.65',
    auditRisk: 'critical', category: 'survey-readiness',
  },

  // ── FRIDAY JULY 17 — Survey Week Day 5 ───────────────────
  {
    id: 'EVT-SURVEY-2026-0717-OIG-FINAL',
    title: 'OIG Exclusion Pre-Survey Final Verification — July 2026',
    date: '2026-07-17', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Final pre-survey OIG/SAM.gov exclusion screening for all employees, contractors, and vendors. Screenshot and timestamp documentation required. No excluded individuals may provide services to Medicare beneficiaries. Results documented in personnel files and compliance log.',
    regulatoryDriver: 'OIG Exclusion Screening — CMS CoP; Social Security Act §1128',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-SURVEY-2026-0717-SIGNOFF',
    title: 'Medicare Certification Survey Readiness Final Sign-Off',
    date: '2026-07-17', time: '09:00', timeEnd: '10:30',
    domain: 'Governance', cadence: 'Ad-hoc', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['GV-GB-001', 'CO-CP-001'],
    summary: 'Administrator and Governing Body Chair formally sign the Medicare certification survey readiness attestation. All pre-survey checklists reviewed and signed: clinical records audit clear, staff credentials current, QAPI evidence bundle complete, EP documentation ready, infection control evidence compiled, P&P library current. Official point-of-contact and survey logistics confirmed with state survey agency.',
    regulatoryDriver: '42 CFR Part 484 — Medicare certification requires all CoPs to be in substantial compliance',
    auditRisk: 'critical', category: 'survey-readiness',
  },

  /* ══════════════════════════════════════════════════════════
     MONTHLY CONTINUATIONS — JUNE THROUGH DECEMBER 2026
     Operational events that must run without interruption
     through and after the Medicare certification survey.
  ══════════════════════════════════════════════════════════ */

  // ── CLAIMS (Jun–Dec) ──────────────────────────────────────
  {
    id: 'EVT-FN-2026-JUN-CLAIMS',
    title: 'June 2026 Claims Submission Cycle',
    date: '2026-06-22', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission: review scrubber, submit clean claims, resolve rejections.',
    regulatoryDriver: 'FN-BC-001 — Medicare Billing & Claims Submission',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-JUL-CLAIMS',
    title: 'July 2026 Claims Submission Cycle',
    date: '2026-07-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    regulatoryDriver: 'FN-BC-001 — Medicare Billing & Claims Submission',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-AUG-CLAIMS',
    title: 'August 2026 Claims Submission Cycle',
    date: '2026-08-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-SEP-CLAIMS',
    title: 'September 2026 Claims Submission Cycle',
    date: '2026-09-21', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-OCT-CLAIMS',
    title: 'October 2026 Claims Submission Cycle',
    date: '2026-10-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-NOV-CLAIMS',
    title: 'November 2026 Claims Submission Cycle',
    date: '2026-11-20', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission.',
    auditRisk: 'critical', category: 'billing-cycle',
  },
  {
    id: 'EVT-FN-2026-DEC-CLAIMS',
    title: 'December 2026 Claims Submission Cycle',
    date: '2026-12-21', time: '08:00', timeEnd: '09:00',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Billing Coordinator', ownerRole: 'Billing Manager',
    policyRefs: ['FN-BC-001'],
    summary: 'Monthly Medicare claims submission — year-end close.',
    auditRisk: 'critical', category: 'billing-cycle',
  },

  // ── 60-DAY EPISODE REVIEWS (Jun–Dec) ─────────────────────
  {
    id: 'EVT-CL-2026-JUN-60DAY',
    title: '60-Day Episode Review — June 2026 Cycle',
    date: '2026-06-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review and physician re-certification for all patients at 60-day episode mark.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care review at least every 60 days',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-JUL-60DAY',
    title: '60-Day Episode Review — July 2026 Cycle',
    date: '2026-07-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: July cycle. Physician re-certification and order renewal.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-AUG-60DAY',
    title: '60-Day Episode Review — August 2026 Cycle',
    date: '2026-08-17', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: August cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-SEP-60DAY',
    title: '60-Day Episode Review — September 2026 Cycle',
    date: '2026-09-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: September cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-OCT-60DAY',
    title: '60-Day Episode Review — October 2026 Cycle',
    date: '2026-10-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: October cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-NOV-60DAY',
    title: '60-Day Episode Review — November 2026 Cycle',
    date: '2026-11-16', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: November cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },
  {
    id: 'EVT-CL-2026-DEC-60DAY',
    title: '60-Day Episode Review — December 2026 Cycle',
    date: '2026-12-15', time: '08:00', timeEnd: '09:30',
    domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001'],
    summary: 'Plan of care review: December / year-end cycle.',
    regulatoryDriver: '42 CFR §484.60(c) — Plan of care 60-day review',
    auditRisk: 'critical', category: 'plan-of-care',
  },

  // ── OIG EXCLUSION CHECKS (Jun–Dec) ───────────────────────
  {
    id: 'EVT-HR-2026-OIG-JUN',
    title: 'June OIG Exclusion Check',
    date: '2026-06-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG/SAM.gov exclusion screening for all employees, contractors, and vendors.',
    regulatoryDriver: 'OIG Exclusion Screening — CMS Conditions of Participation',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-JUL',
    title: 'July OIG Exclusion Check',
    date: '2026-07-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-AUG',
    title: 'August OIG Exclusion Check',
    date: '2026-08-03', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-SEP',
    title: 'September OIG Exclusion Check',
    date: '2026-09-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-OCT',
    title: 'October OIG Exclusion Check',
    date: '2026-10-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-NOV',
    title: 'November OIG Exclusion Check',
    date: '2026-11-02', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening.',
    auditRisk: 'critical', category: 'oig-screening',
  },
  {
    id: 'EVT-HR-2026-OIG-DEC',
    title: 'December OIG Exclusion Check',
    date: '2026-12-01', time: '08:00', timeEnd: '08:30',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'HR Director',
    policyRefs: ['HR-OIG-001'],
    summary: 'Monthly OIG exclusion screening — year-end verification.',
    auditRisk: 'critical', category: 'oig-screening',
  },

  // ── MONTHLY COMPLIANCE REPORTS (Jul–Dec) ─────────────────
  {
    id: 'EVT-CO-2026-JUL-MONTHLY',
    title: 'Monthly Compliance Report — July 2026',
    date: '2026-07-31', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: post-survey remediation tracking, claims status, OIG, outstanding physician orders, denial trends.',
    regulatoryDriver: 'CO-CP-001 — Corporate Compliance Program',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-AUG-MONTHLY',
    title: 'Monthly Compliance Report — August 2026',
    date: '2026-08-31', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: claims, signatures, denials, OIG.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-SEP-MONTHLY',
    title: 'Monthly Compliance Report — September 2026',
    date: '2026-09-30', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: September claims, Q3 variance, aide supervision cycle 2 status.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-OCT-MONTHLY',
    title: 'Monthly Compliance Report — October 2026',
    date: '2026-10-30', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: October claims, Q4 open items.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-NOV-MONTHLY',
    title: 'Monthly Compliance Report — November 2026',
    date: '2026-11-30', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary: November claims, year-end readiness.',
    auditRisk: 'medium', category: 'compliance-report',
  },
  {
    id: 'EVT-CO-2026-DEC-MONTHLY',
    title: 'Monthly Compliance Report — December 2026',
    date: '2026-12-31', time: '09:00', timeEnd: '10:00',
    domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Monthly compliance summary — year-end: annual compliance review, FY26 audit readiness.',
    auditRisk: 'medium', category: 'compliance-report',
  },

  // ── PHYSICIAN SIGNATURE TRACKING (Feb–Dec) ───────────────
  {
    id: 'EVT-FN-2026-FEB-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — February',
    date: '2026-02-27', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track and follow up on outstanding physician signatures for plan of care, orders, and certifications.',
    regulatoryDriver: '42 CFR §484.60 — Plan of care requires physician signature',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-MAR-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — March',
    date: '2026-03-31', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-APR-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — April',
    date: '2026-04-30', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-MAY-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — May',
    date: '2026-05-29', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-JUN-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — June',
    date: '2026-06-30', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-JUL-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — July',
    date: '2026-07-31', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-AUG-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — August',
    date: '2026-08-31', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-SEP-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — September',
    date: '2026-09-30', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-OCT-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — October',
    date: '2026-10-30', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-NOV-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — November',
    date: '2026-11-30', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures.',
    auditRisk: 'critical', category: 'physician-signatures',
  },
  {
    id: 'EVT-FN-2026-DEC-PHYSICIAN-SIG',
    title: 'Monthly Physician Signature Tracking — December',
    date: '2026-12-31', time: '08:00', timeEnd: '08:30',
    domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Clinical Manager',
    policyRefs: ['CL-POC-001', 'FN-BC-001'],
    summary: 'Track outstanding physician signatures — year-end clearance.',
    auditRisk: 'critical', category: 'physician-signatures',
  },

  /* ══════════════════════════════════════════════════════════
     Q3 + Q4 QUARTERLY EVENTS
  ══════════════════════════════════════════════════════════ */

  // ── Q3 Infection Control (Sep) ────────────────────────────
  {
    id: 'EVT-CL-2026-INFECTION-Q3',
    title: 'Q3 Infection Control Review',
    date: '2026-09-24', time: '10:00', timeEnd: '11:00',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001'],
    summary: 'Q3 infection surveillance review: infection event counts, HAI trends, aide-only visit IC incidents, QAPI feed. Results reported to Q3 QAPI review.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control',
    auditRisk: 'high', category: 'infection-control',
  },
  {
    id: 'EVT-CL-2026-INFECTION-Q4',
    title: 'Q4 Infection Control Review',
    date: '2026-12-17', time: '10:00', timeEnd: '11:00',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001'],
    summary: 'Q4 infection surveillance review — year-end: annual IC program assessment, trends, QAPI packet prep.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control',
    auditRisk: 'high', category: 'infection-control',
  },

  // ── Q3 + Q4 Risk Management ───────────────────────────────
  {
    id: 'EVT-RM-2026-Q3-RISK',
    title: 'Q3 Risk Management Committee Meeting',
    date: '2026-09-17', time: '13:00', timeEnd: '14:30',
    domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Administrator', ownerRole: 'Risk Manager',
    policyRefs: ['RM-RP-001'],
    summary: 'Q3 risk management review: incident reports, adverse events, sentinel events, corrective actions, post-survey findings follow-up.',
    regulatoryDriver: 'RM-RP-001 — Risk Management Program',
    auditRisk: 'high', category: 'risk-committee',
  },
  {
    id: 'EVT-RM-2026-Q4-RISK',
    title: 'Q4 Risk Management Committee Meeting',
    date: '2026-12-10', time: '13:00', timeEnd: '14:30',
    domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Administrator', ownerRole: 'Risk Manager',
    policyRefs: ['RM-RP-001'],
    summary: 'Q4 / year-end risk management review: annual risk assessment, open corrective actions, FY27 risk priorities.',
    auditRisk: 'high', category: 'risk-committee',
  },

  // ── Q3 + Q4 IT / Security ─────────────────────────────────
  {
    id: 'EVT-IT-2026-Q3-SYSREVIEW',
    title: 'Q3 System Activity & Security Review',
    date: '2026-09-25', time: '14:00', timeEnd: '15:00',
    domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'IT Director', ownerRole: 'IT Security Officer',
    policyRefs: ['IT-SA-001'],
    summary: 'Q3 system access logs, security incidents, user permissions, and HIPAA audit trail review.',
    regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308 — Security Management Process',
    auditRisk: 'high', category: 'it-security',
  },
  {
    id: 'EVT-IT-2026-Q4-SYSREVIEW',
    title: 'Q4 System Activity & Security Review',
    date: '2026-12-18', time: '14:00', timeEnd: '15:00',
    domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'IT Director', ownerRole: 'IT Security Officer',
    policyRefs: ['IT-SA-001'],
    summary: 'Q4 / year-end system security review: annual access audit, HIPAA risk analysis update.',
    regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308',
    auditRisk: 'high', category: 'it-security',
  },

  // ── Q3 + Q4 Denial Management ─────────────────────────────
  {
    id: 'EVT-FN-2026-Q3-DENIAL',
    title: 'Q3 Denial Management Review',
    date: '2026-10-06', time: '10:00', timeEnd: '11:00',
    domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Billing Manager', ownerRole: 'Billing Manager',
    policyRefs: ['FN-DM-001'],
    summary: 'Q3 denial analysis: denial categories, root causes, appeals status, process improvement actions.',
    auditRisk: 'high', category: 'denial-management',
  },
  {
    id: 'EVT-FN-2026-Q4-DENIAL',
    title: 'Q4 Denial Management Review',
    date: '2026-12-08', time: '10:00', timeEnd: '11:00',
    domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Billing Manager', ownerRole: 'Billing Manager',
    policyRefs: ['FN-DM-001'],
    summary: 'Q4 / year-end denial analysis: annual denial rate, write-off review, FY27 billing improvement plan.',
    auditRisk: 'high', category: 'denial-management',
  },

  // ── Q2 Denial Management (missing from initial push) ─────
  {
    id: 'EVT-FN-2026-Q2-DENIAL',
    title: 'Q2 Denial Management Review',
    date: '2026-07-07', time: '10:00', timeEnd: '11:00',
    domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Billing Manager', ownerRole: 'Billing Manager',
    policyRefs: ['FN-DM-001'],
    summary: 'Q2 denial analysis: denial categories, root causes, appeals status, process improvement.',
    auditRisk: 'high', category: 'denial-management',
  },

  /* ══════════════════════════════════════════════════════════
     NEW — Q1-Q4 INFECTION CONTROL REVIEWS
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-CL-2026-IC-Q1',
    title: 'Q1 Infection Control Review',
    date: '2026-03-25', time: '10:00', timeEnd: '11:30',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001', 'QA-PG-001'],
    summary: 'Q1 infection surveillance review: infection event counts, HAI trends, PPE compliance audit, exposure incidents, and QAPI data feed preparation.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control; integrated with QAPI per §484.65',
    auditRisk: 'high', category: 'infection-control',
  },
  {
    id: 'EVT-CL-2026-IC-Q2',
    title: 'Q2 Infection Control Review',
    date: '2026-06-24', time: '10:00', timeEnd: '11:30',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001', 'QA-PG-001'],
    summary: 'Q2 infection surveillance review: Q1-Q2 trend analysis, PPE compliance audit, exposure incident review, and QAPI feed for Q2 quarterly review.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control; integrated with QAPI',
    auditRisk: 'high', category: 'infection-control',
  },
  {
    id: 'EVT-CL-2026-IC-Q3',
    title: 'Q3 Infection Control Review',
    date: '2026-09-24', time: '10:00', timeEnd: '11:30',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001', 'QA-PG-001'],
    summary: 'Q3 infection surveillance review: mid-year trend analysis, PPE audit, exposure incidents, QAPI feed for Q3 review.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control',
    auditRisk: 'high', category: 'infection-control',
  },
  {
    id: 'EVT-CL-2026-IC-Q4',
    title: 'Q4 Infection Control Review',
    date: '2026-12-17', time: '10:00', timeEnd: '11:30',
    domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse',
    policyRefs: ['CL-IC-001', 'QA-PG-001'],
    summary: 'Q4 infection surveillance: annual IC trend close-out, PPE audit, annual IC program evaluation prep, QAPI feed for Q4 PIP close.',
    regulatoryDriver: '42 CFR §484.70 — Infection prevention and control',
    auditRisk: 'high', category: 'infection-control',
  },

  /* ══════════════════════════════════════════════════════════
     NEW — QUARTERLY QAPI REVIEWS (Q2, Q3, Q4)
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-QAPI-2026-Q2',
    title: 'Q2 QAPI Review',
    date: '2026-05-07', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Q2 policy-driven QAPI governance review: PIP Q2 remeasurement, dashboard review, incident & adverse event analysis, infection control integration, action plan update, and Governing Body report preparation.',
    regulatoryDriver: '42 CFR §484.65 — QAPI CoP: ongoing data-driven quality program. Agency policy requires quarterly review cadence.',
    auditRisk: 'critical', category: 'qapi-quarterly-governance',
  },
  {
    id: 'EVT-QAPI-2026-Q3',
    title: 'Q3 QAPI Review',
    date: '2026-08-06', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Q3 QAPI governance review: PIP Q3 remeasurement and sustainment decision, mid-year performance analysis, adverse event trending, infection surveillance integration, corrective action tracking.',
    regulatoryDriver: '42 CFR §484.65 — QAPI CoP. Q3 is the critical sustainment checkpoint for the annual PIP.',
    auditRisk: 'critical', category: 'qapi-quarterly-governance',
  },
  {
    id: 'EVT-QAPI-2026-Q4',
    title: 'Q4 QAPI Review + Annual PIP Close',
    date: '2026-11-05', time: '13:00', timeEnd: '15:00',
    domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Q4 QAPI governance review with mandatory annual PIP formal closure. Includes Q4 remeasurement, sustainment plan or carry-forward documentation, annual QAPI program evaluation kickoff, and Governing Body annual report preparation.',
    regulatoryDriver: '42 CFR §484.65(d) — At least one PIP per calendar year must be documented with baseline, target, interventions, remeasurement, and sustainment. Q4 is the annual close.',
    auditRisk: 'critical', category: 'qapi-quarterly-governance',
  },

  /* ══════════════════════════════════════════════════════════
     NEW — ANNUAL EVALUATIONS
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-QAPI-2026-ANNUAL-EVAL',
    title: 'Annual QAPI Program Evaluation',
    date: '2026-12-10', time: '09:00', timeEnd: '12:00',
    domain: 'QAPI', cadence: 'Annual', mandateType: 'federal-required',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'QA-PIP-001'],
    summary: 'Annual evaluation of the full QAPI program: all four quarterly cycles, PIP completion and effectiveness, corrective action closure rates, FY27 priorities, and annual report to Governing Body.',
    regulatoryDriver: '42 CFR §484.65(b)-(d) — QAPI CoP requires ongoing HHA-wide data-driven quality program with at least one PIP per year and systematic evaluation of program effectiveness.',
    auditRisk: 'critical', category: 'annual-evaluation',
  },
  {
    id: 'EVT-CO-2026-ANNUAL-EFFECTIVENESS',
    title: 'Annual Compliance Program Effectiveness Review',
    date: '2026-11-19', time: '09:00', timeEnd: '12:00',
    domain: 'Compliance', cadence: 'Annual', mandateType: 'policy-driven',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001'],
    summary: 'Annual evaluation of compliance program effectiveness per OIG 7-element model: training completion, OIG screening results, hotline usage, audit findings, FY27 work plan creation.',
    regulatoryDriver: 'OIG Compliance Program Guidance for Home Health Agencies; CO-CP-001',
    auditRisk: 'high', category: 'annual-evaluation',
  },
  {
    id: 'EVT-CO-2026-PP-ANNUAL',
    title: 'Annual Policy & Procedure Enterprise Review',
    date: '2026-10-15', time: '09:00', timeEnd: '17:00',
    domain: 'Compliance', cadence: 'Annual', mandateType: 'policy-driven',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['CO-CP-001', 'GV-GB-001'],
    summary: 'Annual review of the complete enterprise P&P library across all domains. Each domain lead attests currency. Governing Body approves final P&P library version.',
    regulatoryDriver: '42 CFR §484.105(i)(1)-(2) — Governing Body must review and approve all policies.',
    auditRisk: 'critical', category: 'annual-evaluation',
  },
  {
    id: 'EVT-HR-2026-ANNUAL-TRAINING',
    title: 'Annual Employee Compliance Training (HIPAA, OSHA, Abuse Prevention)',
    date: '2026-09-01', endDate: '2026-09-30', allDay: true,
    domain: 'Compliance', cadence: 'Annual', mandateType: 'federal-required',
    owner: 'HR Director', ownerRole: 'Staff Development RN',
    policyRefs: ['HR-OIG-001', 'CO-CP-001'],
    summary: 'Annual training campaign: all employees must complete HIPAA Privacy & Security, OSHA Bloodborne Pathogens, Abuse/Neglect/Exploitation Prevention, Corporate Compliance, and Infection Control. 100% completion required before survey.',
    regulatoryDriver: 'HIPAA 45 CFR §164.530(b); OSHA 29 CFR §1910.1030; 42 CFR §484.80; OIG Compliance Guidance',
    auditRisk: 'critical', category: 'annual-training',
  },

  /* ══════════════════════════════════════════════════════════
     NEW — EVENT-DRIVEN COMPLIANCE EVENTS
  ══════════════════════════════════════════════════════════ */
  {
    id: 'EVT-TRIGGER-INCIDENT-TEMPLATE',
    title: 'Incident / Adverse Event Review [Template]',
    date: '2026-01-01', time: '09:00', timeEnd: '10:30',
    domain: 'QAPI', cadence: 'Trigger-based', mandateType: 'policy-driven',
    owner: 'Clinical Manager', ownerRole: 'QAPI Lead',
    policyRefs: ['QA-PG-001', 'RM-RP-001'],
    summary: 'Triggered by any reportable incident, adverse event, near miss, or sentinel event. Requires 24-hr incident report, 72-hr RCA, corrective action plan, and QAPI integration. All incidents must be tracked.',
    regulatoryDriver: '42 CFR §484.65(b)(3) — QAPI must track adverse patient events and analyze causes',
    auditRisk: 'critical', category: 'event-driven',
  },
  {
    id: 'EVT-TRIGGER-COMPLAINT-TEMPLATE',
    title: 'Complaint / Grievance Investigation [Template]',
    date: '2026-01-01', time: '10:00', timeEnd: '11:00',
    domain: 'Compliance', cadence: 'Trigger-based', mandateType: 'federal-required',
    owner: 'Compliance Officer', ownerRole: 'Compliance Officer',
    policyRefs: ['CO-CP-001', 'CL-POC-001'],
    summary: 'Triggered by any patient, family, or staff complaint or grievance. Requires written acknowledgment within 5 business days and written resolution within 30 days per 42 CFR §484.50.',
    regulatoryDriver: '42 CFR §484.50 — Patient Rights: written complaint acknowledgment within 5 days; resolution within 30 days',
    auditRisk: 'critical', category: 'event-driven',
  },
  {
    id: 'EVT-TRIGGER-SURVEY-ACTIVATION',
    title: 'Medicare Certification Survey Readiness Activation',
    date: '2026-07-13', time: '08:00', timeEnd: '17:00',
    domain: 'Compliance', cadence: 'Trigger-based', mandateType: 'federal-required',
    owner: 'Administrator', ownerRole: 'Administrator',
    policyRefs: ['CO-CP-001', 'GV-GB-001'],
    summary: 'Activated when CMS survey notification received. Full agency mobilization: all-staff notification, role assignments, evidence staging, surveyor liaison, request log, opening/exit conference protocol.',
    regulatoryDriver: '42 CFR Part 484 — All Conditions of Participation. CMS SOM Appendix B survey procedures.',
    auditRisk: 'critical', category: 'event-driven',
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
