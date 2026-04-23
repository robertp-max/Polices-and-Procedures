/**
 * pushToHubstaff.ts
 * ─────────────────────────────────────────────────────────────
 * Standalone script: pushes ALL regulatory compliance events
 * from the Care Indeed Home Health Regulatory Planner to the
 * configured Hubstaff project as tasks.
 *
 * HOW TO RUN:
 *   1. Generate a Personal Access Token at:
 *      https://developer.hubstaff.com/  →  Personal access tokens
 *   2. Add to .env:
 *      HUBSTAFF_PAT=your_personal_access_token
 *      HUBSTAFF_PROJECT_ID=3988878
 *   3. Run:
 *      npx tsx scripts/pushToHubstaff.ts
 *
 * The script is IDEMPOTENT — safe to re-run. Existing tasks are
 * matched by their [EVT-ID] tag embedded in the task summary.
 * Existing tasks will be SKIPPED; new ones will be CREATED.
 * ─────────────────────────────────────────────────────────────
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const repoRoot   = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(repoRoot, '.env') });

/* ─── Config ─────────────────────────────────────────────────── */

const PAT        = process.env.HUBSTAFF_PAT ?? '';
const PROJECT_ID = process.env.HUBSTAFF_PROJECT_ID ?? '3988878';
const BASE_URL   = 'https://api.hubstaff.com/v2';

if (!PAT) {
  console.error('\n❌  HUBSTAFF_PAT not set in .env');
  console.error('    Generate one at https://developer.hubstaff.com/ → Personal access tokens');
  console.error('    Then add:  HUBSTAFF_PAT=your_token_here\n');
  process.exit(1);
}

/* ─── Hubstaff API helpers ───────────────────────────────────── */

async function hubstaffRequest<T>(
  method: string,
  endpoint: string,
  body?: unknown,
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': `ApiToken ${PAT}`,
      'Content-Type':  'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('Retry-After') ?? 60);
    console.warn(`  ⚠  Rate limited — waiting ${retryAfter}s...`);
    await sleep(retryAfter * 1000);
    return hubstaffRequest(method, endpoint, body);
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }

  return res.json() as Promise<T>;
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms));
}

/* ─── Task catalogue (same events as pushAllEvents.ts) ─────── */

interface EventEntry {
  id: string;
  title: string;
  date: string;
  endDate?: string;
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
}

const EVENTS: EventEntry[] = [
  /* ══════════════════════════════════════════════════════════
     GOVERNANCE
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-GV-2026-0108-ANNPKT', title: 'Annual Governance Packet Review', date: '2026-01-08', domain: 'Governance', cadence: 'Annual', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001', 'GV-GB-002'], summary: 'Annual board review of institutional plan, budget, acceptance-to-service criteria, and public service information.', regulatoryDriver: '42 CFR §484.105(b) — Governing Body CoP', auditRisk: 'critical', category: 'board-annual' },
  { id: 'EVT-GV-Q1-2026', title: 'Q1 2026 Governing Body Meeting', date: '2026-02-12', domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001'], summary: 'Quarterly governing body meeting covering QAPI results, budget review, and organizational oversight.', regulatoryDriver: '42 CFR §484.105 — Governing Body', auditRisk: 'critical', category: 'governing-body' },
  { id: 'EVT-GV-Q2-2026', title: 'Q2 2026 Governing Body Meeting', date: '2026-05-14', domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001'], summary: 'Quarterly governing body meeting — Q2 QAPI review, financial oversight, clinical outcomes.', regulatoryDriver: '42 CFR §484.105 — Governing Body', auditRisk: 'critical', category: 'governing-body' },
  { id: 'EVT-GV-Q3-2026', title: 'Q3 2026 Governing Body Meeting', date: '2026-08-13', domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001'], summary: 'Quarterly governing body meeting — Q3 QAPI, risk management review, mid-year budget variance.', regulatoryDriver: '42 CFR §484.105 — Governing Body', auditRisk: 'critical', category: 'governing-body' },
  { id: 'EVT-GV-Q4-2026', title: 'Q4 2026 Governing Body Meeting', date: '2026-11-12', domain: 'Governance', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001'], summary: 'Quarterly governing body meeting — annual review, Q4 QAPI, FY27 planning.', regulatoryDriver: '42 CFR §484.105 — Governing Body', auditRisk: 'critical', category: 'governing-body' },

  /* ══════════════════════════════════════════════════════════
     QAPI
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-QA-2026-0205-QAPI-Q1', title: 'Q1 QAPI Review + Annual PIP Kickoff', date: '2026-02-05', domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Clinical Manager', ownerRole: 'QAPI Lead', policyRefs: ['QA-PG-001', 'QA-PIP-001'], summary: 'Q1 policy-driven QAPI governance review and annual Performance Improvement Project kickoff.', regulatoryDriver: '42 CFR §484.65 — QAPI. At least one PIP required per calendar year.', auditRisk: 'high', category: 'qapi-quarterly' },
  { id: 'EVT-QA-2026-Q2', title: 'Q2 QAPI Review', date: '2026-05-07', domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Clinical Manager', ownerRole: 'QAPI Lead', policyRefs: ['QA-PG-001'], summary: 'Q2 policy-driven QAPI governance review — PIP remeasurement, dashboard review, action log.', regulatoryDriver: '42 CFR §484.65 — QAPI ongoing program', auditRisk: 'high', category: 'qapi-quarterly' },
  { id: 'EVT-QA-2026-Q3', title: 'Q3 QAPI Review', date: '2026-08-06', domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Clinical Manager', ownerRole: 'QAPI Lead', policyRefs: ['QA-PG-001'], summary: 'Q3 policy-driven QAPI governance review — PIP sustainment check, adverse event analysis.', regulatoryDriver: '42 CFR §484.65 — QAPI ongoing program', auditRisk: 'high', category: 'qapi-quarterly' },
  { id: 'EVT-QA-2026-Q4', title: 'Q4 QAPI Review + Annual PIP Close', date: '2026-11-05', domain: 'QAPI', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Clinical Manager', ownerRole: 'QAPI Lead', policyRefs: ['QA-PG-001', 'QA-PIP-001'], summary: 'Q4 QAPI review — annual PIP closure, sustainment plan, governing body packet preparation.', regulatoryDriver: '42 CFR §484.65 — QAPI annual PIP requirement', auditRisk: 'high', category: 'qapi-quarterly' },

  /* ══════════════════════════════════════════════════════════
     EMERGENCY PREPAREDNESS
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-RM-2026-0115-EP-REVIEW', title: 'Biennial Emergency Preparedness Review / Update', date: '2026-01-15', domain: 'Risk', cadence: 'Biennial', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator', policyRefs: ['EP-100', 'EP-110', 'EP-120', 'EP-130'], summary: 'Full biennial review and update of emergency plan, policies/procedures, communications plan, and training/testing program.', regulatoryDriver: '42 CFR §484.102(a)-(d) — Emergency Preparedness', auditRisk: 'critical', category: 'emergency-preparedness' },
  { id: 'EVT-RM-2026-0122-EP-TRAIN', title: 'Biennial Emergency Preparedness Staff Training', date: '2026-01-22', domain: 'Risk', cadence: 'Biennial', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator', policyRefs: ['EP-130', 'EP-140'], summary: 'Biennial emergency-preparedness training for all required staff. Role-based curriculum.', regulatoryDriver: '42 CFR §484.102(d)(1) — EP training biennial requirement', auditRisk: 'critical', category: 'emergency-preparedness' },
  { id: 'EVT-RM-2026-0318-EP-EXERCISE', title: 'Annual Emergency Exercise (Tabletop)', date: '2026-03-18', domain: 'Risk', cadence: 'Annual', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator', policyRefs: ['EP-140', 'EP-150'], summary: 'Annual emergency exercise — tabletop scenario, debrief, after-action report, corrective actions.', regulatoryDriver: '42 CFR §484.102(d)(2) — Annual EP exercise', auditRisk: 'critical', category: 'emergency-preparedness' },

  /* ══════════════════════════════════════════════════════════
     AIDE COMPLIANCE
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CL-2026-0209-AIDE-INSERVICE', title: 'Annual Aide In-Service Training Campaign (12 hrs)', date: '2026-02-09', endDate: '2026-02-20', domain: 'Clinical', cadence: 'Annual', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Staff Development RN', policyRefs: ['AIDE-100', 'AIDE-101'], summary: 'Annual 12-hour in-service training campaign for all home health aides. RN supervised.', regulatoryDriver: '42 CFR §484.80(d) — At least 12 hours of in-service training per 12-month period', auditRisk: 'critical', category: 'aide-training' },
  { id: 'EVT-CL-2026-0225-AIDE-OBS-SKILLED', title: 'Annual Skilled-Patient Aide Direct Observation', date: '2026-02-25', domain: 'Clinical', cadence: 'Annual', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'RN Supervisor', policyRefs: ['AIDE-110'], summary: 'Annual onsite direct observation of each aide serving a patient also receiving skilled nursing/PT/OT/SLP services.', regulatoryDriver: '42 CFR §484.80(h)(1)(iv) — Annual aide observation (skilled-patient assignment)', auditRisk: 'critical', category: 'aide-supervision' },
  { id: 'EVT-CL-2026-0311-AIDE-OBS-AIDEONLY', title: 'Semiannual Aide-Only Patient Observation (Cycle 1)', date: '2026-03-11', domain: 'Clinical', cadence: 'Semiannual', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'RN Supervisor', policyRefs: ['AIDE-120', 'AIDE-121'], summary: 'Semiannual onsite observation of each aide serving aide-only patients (no concurrent skilled services). Cycle 1.', regulatoryDriver: '42 CFR §484.80(h)(2)(ii) — Semiannual aide observation (aide-only assignment)', auditRisk: 'critical', category: 'aide-supervision' },
  { id: 'EVT-CL-2026-0911-AIDE-OBS-AIDEONLY-C2', title: 'Semiannual Aide-Only Patient Observation (Cycle 2)', date: '2026-09-11', domain: 'Clinical', cadence: 'Semiannual', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'RN Supervisor', policyRefs: ['AIDE-120', 'AIDE-121'], summary: 'Semiannual onsite observation of each aide serving aide-only patients. Cycle 2.', regulatoryDriver: '42 CFR §484.80(h)(2)(ii) — Semiannual aide observation (aide-only assignment)', auditRisk: 'critical', category: 'aide-supervision' },

  /* ══════════════════════════════════════════════════════════
     HHCAHPS
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CO-2026-0331-HHCAHPS', title: 'HHCAHPS Annual Exemption Decision / Participation Filing', date: '2026-03-31', domain: 'Compliance', cadence: 'Annual', mandateType: 'conditional-federal', owner: 'Administrator', ownerRole: 'HHCAHPS Coordinator', policyRefs: ['QRP-100', 'VEND-120'], summary: 'Annual determination: if <60 eligible unique patients → file Patient Exemption Request. Otherwise confirm active vendor and submission status.', regulatoryDriver: '42 CFR §484.245(b)(1)(iii)(A)-(B) — HH QRP HHCAHPS participation', auditRisk: 'high', category: 'hhcahps' },

  /* ══════════════════════════════════════════════════════════
     COMPLIANCE REPORTS
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CO-2026-JAN-WEEKLY-01', title: 'Weekly Compliance Report (Jan Wk 1)', date: '2026-01-05', domain: 'Compliance', cadence: 'Weekly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Weekly compliance reporting: claims status, outstanding signatures, OASIS submission, outstanding items.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-JAN-MONTHLY', title: 'Monthly Compliance Report — January 2026', date: '2026-01-30', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: OIG exclusions, documentation compliance %, outstanding physician orders, denial review.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-FEB-MONTHLY', title: 'Monthly Compliance Report — February 2026', date: '2026-02-27', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: February claims, signatures, denials, OIG.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-MAR-MONTHLY', title: 'Monthly Compliance Report — March 2026', date: '2026-03-31', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: March claims, signatures, Q1 trend analysis.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-APR-MONTHLY', title: 'Monthly Compliance Report — April 2026', date: '2026-04-30', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: April claims, signatures, denials.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-MAY-MONTHLY', title: 'Monthly Compliance Report — May 2026', date: '2026-05-29', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: May claims, signatures, denials.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-JUN-MONTHLY', title: 'Monthly Compliance Report — June 2026', date: '2026-06-30', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: June / mid-year variance.', auditRisk: 'medium', category: 'compliance-report' },

  /* ══════════════════════════════════════════════════════════
     CLINICAL / PLAN OF CARE (Jan–May)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CL-2026-JAN-60DAY', title: '60-Day Episode Review — January 2026 Cycle', date: '2026-01-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Review and update plan of care for all patients at the 60-day episode mark. Physician re-certification.', regulatoryDriver: '42 CFR §484.60(c) — Plan of care review at least every 60 days', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-FEB-60DAY', title: '60-Day Episode Review — February 2026 Cycle', date: '2026-02-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: all active patients at 60-day mark. Re-certification and physician signatures.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-MAR-60DAY', title: '60-Day Episode Review — March 2026 Cycle', date: '2026-03-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: March cycle. Physician re-certification.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-APR-60DAY', title: '60-Day Episode Review — April 2026 Cycle', date: '2026-04-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: April cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-MAY-60DAY', title: '60-Day Episode Review — May 2026 Cycle', date: '2026-05-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: May cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },

  /* ══════════════════════════════════════════════════════════
     INFECTION CONTROL (Quarterly)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CL-2026-IC-Q1', title: 'Q1 Infection Control Review', date: '2026-03-25', domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse', policyRefs: ['CL-IC-001', 'QA-PG-001'], summary: 'Q1 infection surveillance review: infection event counts, HAI trends, PPE compliance audit, exposure incidents, and QAPI data feed.', regulatoryDriver: '42 CFR §484.70 — Infection prevention and control', auditRisk: 'high', category: 'infection-control' },
  { id: 'EVT-CL-2026-IC-Q2', title: 'Q2 Infection Control Review', date: '2026-06-24', domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse', policyRefs: ['CL-IC-001', 'QA-PG-001'], summary: 'Q2 infection surveillance review: Q1-Q2 trend analysis, PPE compliance audit, exposure incident review, and QAPI feed.', regulatoryDriver: '42 CFR §484.70', auditRisk: 'high', category: 'infection-control' },
  { id: 'EVT-CL-2026-IC-Q3', title: 'Q3 Infection Control Review', date: '2026-09-24', domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse', policyRefs: ['CL-IC-001', 'QA-PG-001'], summary: 'Q3 infection surveillance review: mid-year trend analysis, PPE audit, exposure incidents, QAPI feed.', regulatoryDriver: '42 CFR §484.70', auditRisk: 'high', category: 'infection-control' },
  { id: 'EVT-CL-2026-IC-Q4', title: 'Q4 Infection Control Review', date: '2026-12-17', domain: 'Clinical', cadence: 'Quarterly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse', policyRefs: ['CL-IC-001', 'QA-PG-001'], summary: 'Q4 infection surveillance: annual IC trend close-out, PPE audit, annual IC program evaluation prep, QAPI feed.', regulatoryDriver: '42 CFR §484.70', auditRisk: 'high', category: 'infection-control' },

  /* ══════════════════════════════════════════════════════════
     RISK MANAGEMENT (Quarterly)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-RM-2026-Q1-RISK', title: 'Q1 Risk Management Committee Meeting', date: '2026-03-19', domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Administrator', ownerRole: 'Risk Manager', policyRefs: ['RM-RP-001'], summary: 'Q1 risk management review: incident reports, adverse events, sentinel events, corrective actions.', auditRisk: 'high', category: 'risk-committee' },
  { id: 'EVT-RM-2026-Q2-RISK', title: 'Q2 Risk Management Committee Meeting', date: '2026-06-18', domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Administrator', ownerRole: 'Risk Manager', policyRefs: ['RM-RP-001'], summary: 'Q2 risk management review.', auditRisk: 'high', category: 'risk-committee' },
  { id: 'EVT-RM-2026-Q3-RISK', title: 'Q3 Risk Management Committee Meeting', date: '2026-09-17', domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Administrator', ownerRole: 'Risk Manager', policyRefs: ['RM-RP-001'], summary: 'Q3 risk management review: incident reports, adverse events, sentinel events, corrective actions, post-survey findings follow-up.', auditRisk: 'high', category: 'risk-committee' },
  { id: 'EVT-RM-2026-Q4-RISK', title: 'Q4 Risk Management Committee Meeting', date: '2026-12-10', domain: 'Risk', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Administrator', ownerRole: 'Risk Manager', policyRefs: ['RM-RP-001'], summary: 'Q4 / year-end risk management review: annual risk assessment, open corrective actions, FY27 risk priorities.', auditRisk: 'high', category: 'risk-committee' },

  /* ══════════════════════════════════════════════════════════
     IT / SECURITY (Quarterly)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-IT-2026-Q1-SYSREVIEW', title: 'Q1 System Activity & Security Review', date: '2026-03-27', domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'IT Director', ownerRole: 'IT Security Officer', policyRefs: ['IT-SA-001'], summary: 'Quarterly review of system access logs, security incidents, user permissions, and HIPAA audit trail.', regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308 — Security Management Process', auditRisk: 'high', category: 'it-security' },
  { id: 'EVT-IT-2026-Q2-SYSREVIEW', title: 'Q2 System Activity & Security Review', date: '2026-06-26', domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'IT Director', ownerRole: 'IT Security Officer', policyRefs: ['IT-SA-001'], summary: 'Q2 system security review.', regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308', auditRisk: 'high', category: 'it-security' },
  { id: 'EVT-IT-2026-Q3-SYSREVIEW', title: 'Q3 System Activity & Security Review', date: '2026-09-25', domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'IT Director', ownerRole: 'IT Security Officer', policyRefs: ['IT-SA-001'], summary: 'Q3 system access logs, security incidents, user permissions, and HIPAA audit trail review.', regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308', auditRisk: 'high', category: 'it-security' },
  { id: 'EVT-IT-2026-Q4-SYSREVIEW', title: 'Q4 System Activity & Security Review', date: '2026-12-18', domain: 'IT/Security', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'IT Director', ownerRole: 'IT Security Officer', policyRefs: ['IT-SA-001'], summary: 'Q4 / year-end system security review: annual access audit, HIPAA risk analysis update.', regulatoryDriver: 'HIPAA Security Rule 45 CFR §164.308', auditRisk: 'high', category: 'it-security' },

  /* ══════════════════════════════════════════════════════════
     FINANCE / BILLING (Monthly Jan–Dec)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-FN-2026-JAN-CLAIMS', title: 'January 2026 Claims Submission Cycle', date: '2026-01-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission: review scrubber, submit clean claims, resolve rejections.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-FEB-CLAIMS', title: 'February 2026 Claims Submission Cycle', date: '2026-02-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-MAR-CLAIMS', title: 'March 2026 Claims Submission Cycle', date: '2026-03-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-APR-CLAIMS', title: 'April 2026 Claims Submission Cycle', date: '2026-04-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-MAY-CLAIMS', title: 'May 2026 Claims Submission Cycle', date: '2026-05-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-JUN-CLAIMS', title: 'June 2026 Claims Submission Cycle', date: '2026-06-22', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-JUL-CLAIMS', title: 'July 2026 Claims Submission Cycle', date: '2026-07-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-AUG-CLAIMS', title: 'August 2026 Claims Submission Cycle', date: '2026-08-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-SEP-CLAIMS', title: 'September 2026 Claims Submission Cycle', date: '2026-09-21', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-OCT-CLAIMS', title: 'October 2026 Claims Submission Cycle', date: '2026-10-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-NOV-CLAIMS', title: 'November 2026 Claims Submission Cycle', date: '2026-11-20', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission.', auditRisk: 'critical', category: 'billing-cycle' },
  { id: 'EVT-FN-2026-DEC-CLAIMS', title: 'December 2026 Claims Submission Cycle', date: '2026-12-21', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Billing Coordinator', ownerRole: 'Billing Manager', policyRefs: ['FN-BC-001'], summary: 'Monthly Medicare claims submission — year-end close.', auditRisk: 'critical', category: 'billing-cycle' },

  /* ── Denial Management (Quarterly) ─────────────────────── */
  { id: 'EVT-FN-2026-Q1-DENIAL', title: 'Q1 Denial Management Review', date: '2026-04-07', domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Billing Manager', ownerRole: 'Billing Manager', policyRefs: ['FN-DM-001'], summary: 'Q1 denial analysis: denial categories, root causes, appeals status, process improvement.', auditRisk: 'high', category: 'denial-management' },
  { id: 'EVT-FN-2026-Q2-DENIAL', title: 'Q2 Denial Management Review', date: '2026-07-07', domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Billing Manager', ownerRole: 'Billing Manager', policyRefs: ['FN-DM-001'], summary: 'Q2 denial analysis: denial categories, root causes, appeals status, process improvement.', auditRisk: 'high', category: 'denial-management' },
  { id: 'EVT-FN-2026-Q3-DENIAL', title: 'Q3 Denial Management Review', date: '2026-10-06', domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Billing Manager', ownerRole: 'Billing Manager', policyRefs: ['FN-DM-001'], summary: 'Q3 denial analysis.', auditRisk: 'high', category: 'denial-management' },
  { id: 'EVT-FN-2026-Q4-DENIAL', title: 'Q4 Denial Management Review', date: '2026-12-08', domain: 'Finance', cadence: 'Quarterly', mandateType: 'policy-driven', owner: 'Billing Manager', ownerRole: 'Billing Manager', policyRefs: ['FN-DM-001'], summary: 'Q4 / year-end denial analysis: annual denial rate, write-off review, FY27 billing improvement plan.', auditRisk: 'high', category: 'denial-management' },

  /* ── Physician Signature Tracking (Monthly) ────────────── */
  { id: 'EVT-FN-2026-Q1-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — January', date: '2026-01-28', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track and follow up on outstanding physician signatures for plan of care, orders, and certifications.', regulatoryDriver: '42 CFR §484.60 — Plan of care requires physician signature', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-FEB-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — February', date: '2026-02-27', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-MAR-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — March', date: '2026-03-31', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-APR-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — April', date: '2026-04-30', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-MAY-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — May', date: '2026-05-29', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-JUN-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — June', date: '2026-06-30', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-JUL-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — July', date: '2026-07-31', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-AUG-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — August', date: '2026-08-31', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-SEP-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — September', date: '2026-09-30', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-OCT-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — October', date: '2026-10-30', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-NOV-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — November', date: '2026-11-30', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures.', auditRisk: 'critical', category: 'physician-signatures' },
  { id: 'EVT-FN-2026-DEC-PHYSICIAN-SIG', title: 'Monthly Physician Signature Tracking — December', date: '2026-12-31', domain: 'Finance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'FN-BC-001'], summary: 'Track outstanding physician signatures — year-end clearance.', auditRisk: 'critical', category: 'physician-signatures' },

  /* ══════════════════════════════════════════════════════════
     HR / OIG EXCLUSION CHECKS (Monthly)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-HR-2026-OIG-Q1', title: 'Q1 OIG Exclusion Check', date: '2026-01-02', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Run monthly OIG exclusion screening for all employees, contractors, and vendors.', regulatoryDriver: 'OIG Exclusion Screening — CMS Conditions of Participation', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-FEB', title: 'February OIG Exclusion Check', date: '2026-02-02', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-MAR', title: 'March OIG Exclusion Check', date: '2026-03-02', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-APR', title: 'April OIG Exclusion Check', date: '2026-04-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-MAY', title: 'May OIG Exclusion Check', date: '2026-05-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-JUN', title: 'June OIG Exclusion Check', date: '2026-06-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-JUL', title: 'July OIG Exclusion Check', date: '2026-07-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-AUG', title: 'August OIG Exclusion Check', date: '2026-08-03', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-SEP', title: 'September OIG Exclusion Check', date: '2026-09-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-OCT', title: 'October OIG Exclusion Check', date: '2026-10-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-NOV', title: 'November OIG Exclusion Check', date: '2026-11-02', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening.', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-HR-2026-OIG-DEC', title: 'December OIG Exclusion Check', date: '2026-12-01', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Monthly OIG exclusion screening — year-end verification.', auditRisk: 'critical', category: 'oig-screening' },

  /* ══════════════════════════════════════════════════════════
     COMPLIANCE REPORTS (Jul–Dec)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CO-2026-JUL-MONTHLY', title: 'Monthly Compliance Report — July 2026', date: '2026-07-31', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: post-survey remediation tracking, claims status, OIG, outstanding physician orders, denial trends.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-AUG-MONTHLY', title: 'Monthly Compliance Report — August 2026', date: '2026-08-31', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-SEP-MONTHLY', title: 'Monthly Compliance Report — September 2026', date: '2026-09-30', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: September claims, Q3 variance, aide supervision cycle 2 status.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-OCT-MONTHLY', title: 'Monthly Compliance Report — October 2026', date: '2026-10-30', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: October claims, Q4 open items.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-NOV-MONTHLY', title: 'Monthly Compliance Report — November 2026', date: '2026-11-30', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary: November claims, year-end readiness.', auditRisk: 'medium', category: 'compliance-report' },
  { id: 'EVT-CO-2026-DEC-MONTHLY', title: 'Monthly Compliance Report — December 2026', date: '2026-12-31', domain: 'Compliance', cadence: 'Monthly', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Monthly compliance summary — year-end: annual compliance review, FY26 audit readiness.', auditRisk: 'medium', category: 'compliance-report' },

  /* ══════════════════════════════════════════════════════════
     CLINICAL / 60-DAY REVIEWS (Jun–Dec)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-CL-2026-JUN-60DAY', title: '60-Day Episode Review — June 2026 Cycle', date: '2026-06-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review and physician re-certification for all patients at 60-day episode mark.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-JUL-60DAY', title: '60-Day Episode Review — July 2026 Cycle', date: '2026-07-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: July cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-AUG-60DAY', title: '60-Day Episode Review — August 2026 Cycle', date: '2026-08-17', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: August cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-SEP-60DAY', title: '60-Day Episode Review — September 2026 Cycle', date: '2026-09-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: September cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-OCT-60DAY', title: '60-Day Episode Review — October 2026 Cycle', date: '2026-10-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: October cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-NOV-60DAY', title: '60-Day Episode Review — November 2026 Cycle', date: '2026-11-16', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: November cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },
  { id: 'EVT-CL-2026-DEC-60DAY', title: '60-Day Episode Review — December 2026 Cycle', date: '2026-12-15', domain: 'Clinical', cadence: 'Monthly', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001'], summary: 'Plan of care review: December / year-end cycle.', regulatoryDriver: '42 CFR §484.60(c)', auditRisk: 'critical', category: 'plan-of-care' },

  /* ══════════════════════════════════════════════════════════
     ANNUAL EVALUATIONS
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-QAPI-2026-ANNUAL-EVAL', title: 'Annual QAPI Program Evaluation', date: '2026-12-10', domain: 'QAPI', cadence: 'Annual', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'QAPI Lead', policyRefs: ['QA-PG-001', 'QA-PIP-001'], summary: 'Annual evaluation of the full QAPI program: all four quarterly cycles, PIP completion and effectiveness, corrective action closure rates, FY27 priorities, and annual report to Governing Body.', regulatoryDriver: '42 CFR §484.65(b)-(d)', auditRisk: 'critical', category: 'annual-evaluation' },
  { id: 'EVT-CO-2026-ANNUAL-EFFECTIVENESS', title: 'Annual Compliance Program Effectiveness Review', date: '2026-11-19', domain: 'Compliance', cadence: 'Annual', mandateType: 'policy-driven', owner: 'Compliance Officer', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001'], summary: 'Annual evaluation of compliance program effectiveness per OIG 7-element model: training completion, OIG screening results, hotline usage, audit findings, FY27 work plan creation.', auditRisk: 'high', category: 'annual-evaluation' },
  { id: 'EVT-CO-2026-PP-ANNUAL', title: 'Annual Policy & Procedure Enterprise Review', date: '2026-10-15', domain: 'Compliance', cadence: 'Annual', mandateType: 'policy-driven', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['CO-CP-001', 'GV-GB-001'], summary: 'Annual review of the complete enterprise P&P library across all domains. Each domain lead attests currency. Governing Body approves final P&P library version.', regulatoryDriver: '42 CFR §484.105(i)(1)-(2)', auditRisk: 'critical', category: 'annual-evaluation' },
  { id: 'EVT-HR-2026-ANNUAL-TRAINING', title: 'Annual Employee Compliance Training (HIPAA, OSHA, Abuse Prevention)', date: '2026-09-01', endDate: '2026-09-30', domain: 'Compliance', cadence: 'Annual', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'Staff Development RN', policyRefs: ['HR-OIG-001', 'CO-CP-001'], summary: 'Annual training campaign: HIPAA Privacy & Security, OSHA Bloodborne Pathogens, Abuse/Neglect/Exploitation Prevention, Corporate Compliance, and Infection Control.', regulatoryDriver: 'HIPAA 45 CFR §164.530(b); OSHA 29 CFR §1910.1030; 42 CFR §484.80', auditRisk: 'critical', category: 'annual-training' },

  /* ══════════════════════════════════════════════════════════
     MEDICARE CERTIFICATION SURVEY READINESS (July 13-17)
  ══════════════════════════════════════════════════════════ */
  { id: 'EVT-SURVEY-2026-0713-MOCK', title: 'Medicare Certification Survey — Internal Mock Survey', date: '2026-07-13', domain: 'Compliance', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Compliance Officer', policyRefs: ['CO-CP-001', 'GV-GB-001', 'QA-PG-001'], summary: 'Full-day internal mock CMS survey drill. Simulates surveyor walkthrough across all Conditions of Participation.', regulatoryDriver: '42 CFR Part 484 — All Conditions of Participation; CMS SOM Appendix B', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0713-QAPI-EVIDENCE', title: 'QAPI Evidence Bundle Compilation — Pre-Survey Final Review', date: '2026-07-13', domain: 'QAPI', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'QAPI Lead', policyRefs: ['QA-PG-001', 'QA-PIP-001'], summary: 'Compile and finalize the complete QAPI evidence bundle for survey.', regulatoryDriver: '42 CFR §484.65(b)-(d)', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0714-GB-AUTH', title: 'Governing Body Emergency Session — Medicare Certification Survey Authorization', date: '2026-07-14', domain: 'Governance', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Governing Body Chair', policyRefs: ['GV-GB-001', 'GV-GB-002'], summary: 'Special governing body session to formally certify organizational readiness for Medicare certification survey.', regulatoryDriver: '42 CFR §484.105 — Governing Body CoP', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0714-CLINICAL-AUDIT', title: 'Clinical Records Sample Audit — Pre-Survey Compliance Review', date: '2026-07-14', domain: 'Clinical', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Clinical Manager', policyRefs: ['CL-POC-001', 'CL-OA-006'], summary: 'Stratified sample audit of clinical records against all CoP requirements.', regulatoryDriver: '42 CFR §484.55, §484.60, §484.110', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0715-PP-REVIEW', title: 'Policy & Procedure Library Final Review — All Domains', date: '2026-07-15', domain: 'Compliance', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001', 'CO-CP-001', 'QA-PG-001'], summary: 'Comprehensive review of all agency policies and procedures across every domain.', regulatoryDriver: '42 CFR §484.105(i)(1)-(2)', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0715-EP-PACKET', title: 'Emergency Preparedness Survey Documentation Packet — Final Review', date: '2026-07-15', domain: 'Risk', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Emergency Preparedness Coordinator', policyRefs: ['EP-100', 'EP-110', 'EP-120', 'EP-130'], summary: 'Final pre-survey review of the complete Emergency Preparedness documentation packet.', regulatoryDriver: '42 CFR §484.102(a)-(d)(2)', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0716-STAFF-AUDIT', title: 'Staff Credential & Training Records Compliance Audit', date: '2026-07-16', domain: 'Compliance', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001', 'AIDE-100', 'AIDE-101', 'AIDE-110'], summary: 'Comprehensive HR compliance audit for survey: credentials, OIG screenings, aide in-service completion.', regulatoryDriver: '42 CFR §484.80(a)-(d); §484.115', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0716-IC-EVIDENCE', title: 'Infection Control Program Pre-Survey Evidence Compilation', date: '2026-07-16', domain: 'Clinical', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Clinical Manager', ownerRole: 'Infection Control Nurse', policyRefs: ['CL-IC-001'], summary: 'Compile infection control program survey documentation bundle.', regulatoryDriver: '42 CFR §484.70', auditRisk: 'critical', category: 'survey-readiness' },
  { id: 'EVT-SURVEY-2026-0717-OIG-FINAL', title: 'OIG Exclusion Pre-Survey Final Verification — July 2026', date: '2026-07-17', domain: 'Compliance', cadence: 'Monthly', mandateType: 'federal-required', owner: 'HR Director', ownerRole: 'HR Director', policyRefs: ['HR-OIG-001'], summary: 'Final pre-survey OIG/SAM.gov exclusion screening for all employees, contractors, and vendors.', regulatoryDriver: 'OIG Exclusion Screening — CMS CoP; Social Security Act §1128', auditRisk: 'critical', category: 'oig-screening' },
  { id: 'EVT-SURVEY-2026-0717-SIGNOFF', title: 'Medicare Certification Survey Readiness Final Sign-Off', date: '2026-07-17', domain: 'Governance', cadence: 'Ad-hoc', mandateType: 'federal-required', owner: 'Administrator', ownerRole: 'Administrator', policyRefs: ['GV-GB-001', 'CO-CP-001'], summary: 'Administrator and Governing Body Chair formally sign the Medicare certification survey readiness attestation.', regulatoryDriver: '42 CFR Part 484 — Medicare certification requires all CoPs to be in substantial compliance', auditRisk: 'critical', category: 'survey-readiness' },
];

/* ─── Hubstaff task types ─────────────────────────────────── */

interface HubstaffTask {
  id: number;
  summary: string;
  description?: string;
  due_date?: string;
  status?: string;
}

interface HubstaffTasksResponse {
  tasks: HubstaffTask[];
  pagination?: { next_page_start_id?: number };
}

/* ─── Fetch all existing tasks (paginated) ───────────────── */

async function fetchExistingTasks(): Promise<Map<string, HubstaffTask>> {
  const taskMap = new Map<string, HubstaffTask>();
  let pageStartId: number | undefined;

  do {
    const params = new URLSearchParams({ page_limit: '100' });
    if (pageStartId) params.set('page_start_id', String(pageStartId));

    const data = await hubstaffRequest<HubstaffTasksResponse>(
      'GET',
      `/projects/${PROJECT_ID}/tasks?${params}`,
    );

    for (const task of data.tasks ?? []) {
      // Extract our EVT-ID tag from the title — format: "[EVT-ID] Title"
      const match = task.summary.match(/^\[([A-Z0-9\-]+)\]/);
      if (match) taskMap.set(match[1], task);
    }

    pageStartId = data.pagination?.next_page_start_id;
  } while (pageStartId);

  return taskMap;
}

/* ─── Build task payload ─────────────────────────────────── */

function buildDescription(e: EventEntry): string {
  const lines: string[] = [
    `Domain     : ${e.domain}`,
    `Cadence    : ${e.cadence}`,
    `Due Date   : ${e.date}${e.endDate ? ` → ${e.endDate}` : ''}`,
    `Owner      : ${e.owner} (${e.ownerRole})`,
    `Audit Risk : ${(e.auditRisk ?? 'N/A').toUpperCase()}`,
    `Policy Refs: ${e.policyRefs.join(', ')}`,
    '',
    e.summary,
  ];
  if (e.regulatoryDriver) lines.push('', `Regulatory Driver: ${e.regulatoryDriver}`);
  if (e.mandateType) lines.push(`Mandate Type     : ${e.mandateType}`);
  return lines.join('\n');
}

/* ─── Main push logic ────────────────────────────────────── */

async function pushToHubstaff() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  Care Indeed — Regulatory Planner → Hubstaff Tasks');
  console.log('══════════════════════════════════════════════════════');
  console.log(`  Project  : ${PROJECT_ID}`);
  console.log(`  Events   : ${EVENTS.length}`);
  console.log('──────────────────────────────────────────────────────\n');

  // Verify auth first
  try {
    await hubstaffRequest('GET', '/users/me');
    console.log('✅  Authenticated to Hubstaff API\n');
  } catch (err) {
    console.error('❌  Authentication failed. Check your HUBSTAFF_PAT.');
    console.error('   ', err instanceof Error ? err.message : err);
    process.exit(1);
  }

  // Fetch existing tasks to avoid duplicates
  console.log('  Fetching existing tasks...');
  const existing = await fetchExistingTasks();
  console.log(`  Found ${existing.size} existing task(s) with EVT-IDs\n`);

  let created = 0;
  let skipped = 0;
  let failed  = 0;

  for (const e of EVENTS) {
    if (existing.has(e.id)) {
      console.log(`  =  SKIPPED  ${e.date}  ${e.title}`);
      skipped++;
      continue;
    }

    try {
      await hubstaffRequest('POST', `/projects/${PROJECT_ID}/tasks`, {
        summary:     `[${e.id}] ${e.title}`,
        description: buildDescription(e),
        due_date:    e.date,
        status:      'open',
      });

      console.log(`  +  CREATED  ${e.date}  ${e.title}`);
      created++;

      // Polite delay to stay well under the 1000 req/hr rate limit
      await sleep(200);
    } catch (err) {
      console.error(`  ✗  FAILED   ${e.date}  ${e.title} — ${err instanceof Error ? err.message : err}`);
      failed++;
    }
  }

  console.log('\n──────────────────────────────────────────────────────');
  console.log(`  ✅ Created : ${created}`);
  console.log(`  =  Skipped : ${skipped}`);
  console.log(`  ❌ Failed  : ${failed}`);
  console.log('══════════════════════════════════════════════════════\n');

  if (failed > 0) process.exit(1);
}

pushToHubstaff().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
