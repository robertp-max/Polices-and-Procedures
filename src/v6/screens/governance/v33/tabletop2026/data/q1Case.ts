// CasePack: Q1 2026 — "Baseline Under Pressure"
//
// The first quarterly Governing Body boardroom simulation of FY2026. Q1 is
// SVHHA's baseline quarter (census grows 105→120); every one of the 8 PIP
// triggers and 5 disciplinary triggers required by the source template
// (Sections 9-10 of qapi/source/MOCK_2026_QAPI.txt) is freshly opened this
// quarter, not carried forward. The Board's job tonight is NOT to close
// anything — nothing is old enough to be closure-eligible yet — it is to
// correctly classify evidence, compute quorum/recusal, structure the session
// around two critical restricted personnel matters, activate every
// governance workflow this packet actually triggers, and direct proportional,
// authority-respecting action on real, unresolved risk (a sepsis
// hospitalization, a GB-escalated interpreter-failure complaint, a
// documentation-to-claim mismatch with an overpayment already refunded).
//
// EVIDENTIARY POSTURE — READ BEFORE AUTHORING/CHANGING EXHIBITS:
// QAPI_2026.quarters.Q1 (../../qapi/data/qapi2026.normalized.ts) is the
// checked-in NORMALIZED fixture and is itself only a partial projection of
// the full raw fixture (qapi/source/MOCK_2026_QAPI.txt Sections 1-12) — the
// normalized layer keeps only 2 of 40 feeder audits, 3 of 8 PIP triggers, and
// none of the 5 disciplinary triggers verbatim. This pack goes back to the
// raw source file for the material the normalized layer omitted (all 8 PIP
// triggers, all 5 disciplinary triggers, the CAP register, the meeting
// source records in Section 12) because those ARE real recovered source
// content — omission from the normalized fixture is a normalization gap, not
// a reason to treat the content as unrecovered. Every such exhibit still
// carries posture 'recovered' with its real Section/record id. Only content
// with no source counterpart at all — the Governing Body's OWN roster,
// attendance, and quorum (the raw source's Section 12 attendance/quorum
// records are the QAPI COMMITTEE's, a different, larger body — see EX-Q1-002
// vs EX-Q1-003 below) plus the vendor conflict-of-interest, budget-
// resourcing, media-incident, and GB motion-shell items — is authored, and
// carries posture 'supplemental_uat' with the standard label, reusing
// ../data/qapi2026Supplemental.ts records where one already exists.
//
// SOURCE CUTOFF: 2026-04-09 (the Q1 QAPI/GB meeting date). Nothing dated in
// Q2 2026 or later appears in this pack. Where the recovered record itself
// sets a forward date (a CAP due date, a PIP return date), that date is
// authored/set BY the Board tonight or already on file as a commitment, never
// evidence that the future event has already occurred — consistent with
// engine/sourceCutoff.ts.
//
// VOLUME: 45 exhibits (10 decoys, ~22%), 18 decision nodes (round 0-6), 7
// injects, 6 surveyor questions, 4 transfer questions. Per-dimension point
// tally (engine/scoring.ts dimensionForKind) — every dimension sums exactly
// to its SCORE_DIMENSION_WEIGHTS budget so the case is mathematically
// passable at 950/1000 with room only for the automatic 100-point
// surveyor/transfer component:
//   evidence_integrity      (150): DN-01, DN-06                = 75+75
//   meeting_legality        (150): DN-02, DN-03, DN-16          = 50+50+50
//   qapi_judgment           (200): DN-05, DN-07, DN-08, DN-09, DN-15 = 40*5
//   workflow_authority      (150): DN-04, DN-10                 = 75+75
//   decision_proportionality(150): DN-11, DN-12, DN-13, DN-14   = 40+40+35+35
//   records_forms           (100): DN-17, DN-18                 = 50+50
//   surveyor_transfer       (100): automatic from 6 surveyor + 4 transfer items

import type {
  CasePack,
  DecisionNode,
  Exhibit,
  GvWorkflowId,
  Inject,
  SurveyorQuestion,
  TransferQuestion,
} from '../engine/caseTypes';
import {
  GB_SUP_BUDGET_001,
  GB_SUP_COI_001,
  GB_SUP_MEDIA_001,
  GB_SUP_PACKET_001,
  GB_SUP_ROSTER_2026,
  SUPPLEMENTAL_SOURCE_LABEL,
  toExhibit,
} from './qapi2026Supplemental';
import { Q1_PACKET_CONFLICT_GROUPS } from './packetConflictGroups';

// ---------------------------------------------------------------------------
// Exhibits — the Q1 2026 Board Book
// ---------------------------------------------------------------------------

/** Exhibits projected from the raw recovered source (qapi/source/MOCK_2026_QAPI.txt,
 *  Q1 section) or the normalized QAPI_2026.Q1 fixture. Never carries a sourceLabel. */
function recovered(input: Omit<Exhibit, 'posture' | 'sourceLabel'>): Exhibit {
  return { ...input, posture: 'recovered' };
}

/** Exhibits with no counterpart anywhere in the source — the Governing Body's
 *  own roster/attendance/quorum layer and the GB decision-motion shell.
 *  Always posture 'supplemental_uat' with the standard label. */
function authored(input: Omit<Exhibit, 'posture' | 'sourceLabel'>): Exhibit {
  return { ...input, posture: 'supplemental_uat', sourceLabel: SUPPLEMENTAL_SOURCE_LABEL };
}

const EXHIBITS: Exhibit[] = [
  // --- Group A: Meeting & Governance Control (Section 12 + GB layer) ---
  recovered({
    id: 'EX-Q1-001', sourceId: 'QA-WF-03 Q1 Meeting Control', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-05'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PACKET-READINESS'],
    relevance: 'decision_relevant', section: 'Meeting & Governance Control',
    title: 'QAPI Meeting Control Record — Q1 2026',
    summary: 'Feeder-audit deadline 2026-04-02, GB package deadline 2026-04-02, QAPI meeting 2026-04-09, minutes due 2026-04-16 (owner: Clinical Manager). Policy basis QA-PG-001, QA-PG-002, GV-GB-001.',
    details: [
      'Required sign-offs: Administrator, Clinical Manager, QAPI Committee Chair (see EX-Q1-004).',
      'Population context: census grew 105 (Jan 1) to 120 (Mar 31); 22 new SOC, 14 discharged, 3 transferred, 127 episodes tracked, 28 clinicians on staff.',
      '5 hospitalizations and 3 ED-visits-without-hospitalization occurred this quarter (see EX-Q1-017/018/019).',
      'This is the baseline quarter of SVHHA\'s FY2026 QAPI cycle — nothing carried forward predates it.',
    ],
  }),
  recovered({
    id: 'EX-Q1-002', sourceId: 'ATT-Q1-001 / QUO-Q1-001', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Meeting & Governance Control',
    title: 'QAPI Committee Attendance & Quorum (Feeder Body)',
    summary: '9 of 9 QAPI Committee members present; committee quorum = 5; quorum confirmed 9:02 AM by the QAPI Committee Chair.',
    details: [
      'This is the QAPI COMMITTEE\'s own attendance/quorum record — a clinical-operations feeder body, not the Governing Body board.',
      'Citing this record as evidence of Governing Body quorum conflates two different bodies with two different rosters and thresholds — see EX-Q1-003.',
    ],
  }),
  authored({
    id: 'EX-Q1-003', sourceId: 'GB-SUP-Q1-ATTENDANCE', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-01', 'GV-WF-02'],
    formIds: ['GB-FORM-ROSTER-ATTEST'],
    relevance: 'decision_relevant', section: 'Meeting & Governance Control',
    title: 'Governing Body Attendance & Quorum — Q1 Meeting',
    summary: '7 total board seats (clinical/community/financial composition mix); 1 vacant as of tonight\'s meeting (see EX-Q1-045); 6 seated directors, all present.',
    details: [
      'Board composition: 7 total seats. 1 vacant — the community-member director\'s term expired 2026-01-31 (EX-Q1-045); replacement not yet seated.',
      '6 seated directors present tonight. No absences among seated directors.',
      'One seated director has filed a conflict-of-interest disclosure on tonight\'s vendor-contract matter (EX-Q1-042) and must recuse from that vote.',
      'Authored because the Governing Body\'s own roster/attendance/quorum has no counterpart in the recovered QAPI source (Section 12 covers the QAPI Committee only — see EX-Q1-002).',
    ],
  }),
  recovered({
    id: 'EX-Q1-004', sourceId: 'SGN-Q1-ADM-001 / SGN-Q1-CM-001 / SGN-Q1-CHAIR-001', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-05'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    relevance: 'decision_relevant', section: 'Meeting & Governance Control',
    title: 'Required Packet Sign-offs — Signed',
    summary: 'Administrator, Clinical Manager, and QAPI Committee Chair all signed 2026-04-09.',
    details: ['All 3 required sign-offs present and dated the meeting date.', 'No sign-off is missing or dated after the meeting.'],
  }),
  recovered({
    id: 'EX-Q1-005', sourceId: 'GB-Q1-001', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06', 'GV-WF-08', 'GV-WF-09'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    relevance: 'decision_relevant', section: 'Meeting & Governance Control',
    title: 'GB Escalation Items — 4 Items Escalated',
    summary: 'The QAPI Committee escalated 4 items to the Governing Body: the sepsis case (AE-Q1-004), the interpreter-failure complaint (COMP-Q1-005), the OASIS accuracy trend (PIP-TRIG-Q1-001), and the doc-to-claim mismatch findings (PIP-TRIG-Q1-008).',
    details: [
      'Escalation record confirms these 4 items are properly before the Board tonight, not merely a QAPI Committee matter.',
      'See EX-Q1-041 — the source contains this escalation log entry but NO Board motion/vote/directive record for any of the 4 items.',
    ],
  }),
  toExhibit(GB_SUP_PACKET_001, {
    exhibitId: 'EX-Q1-006', quarter: 'Q1', section: 'Meeting & Governance Control',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-PACKET-READINESS'],
  }),
  authored({
    id: 'EX-Q1-007', sourceId: 'GB-SUP-Q1-MOTION-SHELL', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'provisional', workflowIds: ['GV-WF-05', 'GV-WF-06', 'GV-WF-08', 'GV-WF-09'],
    formIds: [],
    relevance: 'decision_relevant', section: 'Meeting & Governance Control',
    title: 'GB Decision Motion Shell — Q1 Escalated Matters',
    summary: 'A blank motion-record scaffold for tonight\'s 4 escalated items, authored because the source has no GB motion/vote/directive record for GB-Q1-001 (see EX-Q1-041).',
    details: [
      'Exists solely to let the Board record its actual motion/vote/directive for each escalated matter tonight.',
      'Never a substitute for the Board\'s own deliberation — it carries no pre-filled outcome.',
      'Treat as a UAT workflow-completeness supplement only; a real Board decision record is required for production per DQ-2026-003.',
    ],
  }),

  // --- Group B: Q1 Quality Metrics (Section 4 / QAPI_2026.Q1.metrics) ---
  recovered({
    id: 'EX-Q1-008', sourceId: 'QM-Q1-007..009, 013..015, 019..024', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    relevance: 'decision_relevant', section: 'Q1 Quality Metrics',
    title: 'Critical-Status Quality Metrics — Q1 2026',
    summary: 'Four metrics closed the quarter in critical status: Medication Reconciliation (72.7% -> 79.2%, target >=95%), Missed Visit Rate (3.8% -> 4.6%, target <=2%), Wound Infection Rate (0.7% -> 3.3% -> 2.9%, target <=5%, PIP-trigger spike), and Complaint Resolution Timeliness (66.7% -> 62.5%, target >=90%).',
    details: [
      'Medication Reconciliation at SOC/ROC: Jan 72.7% (16/22), Feb 78.3% (18/23), Mar 79.2% (19/24). Status: critical.',
      'Missed Visit Rate: Jan 3.8% (7/185), Feb 4.2% (8/190), Mar 4.6% (9/195). Status: critical.',
      'Wound Infection Rate: Jan 0.7%, Feb 3.3%, Mar 2.9%. Status: critical (PIP-trigger spike). The recovered source gives these rates without a clean separable monthly numerator/denominator — see DQ note on EX-Q1-024/029.',
      'Complaint Resolution Timeliness (<=5 days): Jan 66.7% (4/6), Feb 71.4% (5/7), Mar 62.5% (5/8). Status: critical.',
    ],
  }),
  recovered({
    id: 'EX-Q1-009', sourceId: 'QM-Q1-001..003, 004..006, 010..012', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    relevance: 'decision_relevant', section: 'Q1 Quality Metrics',
    title: 'Below-Target Quality Metrics — Q1 2026',
    summary: 'Three metrics closed below target but not critical: OASIS Accuracy (82.2% -> 84.2%, target >=90%), Visit Documentation Timeliness (85.6% -> 86.9%, target >=95%), and POC Goal Documentation Completeness (80.0% -> 80.0%, target >=92%).',
    details: [
      'OASIS Accuracy Rate: Jan 82.2% (74/90), Feb 83.7% (77/92), Mar 84.2% (80/95). Status: below target, PIP trigger.',
      'Visit Documentation Timeliness (<24h): Jan 85.6% (101/118), Feb 86.7% (104/120), Mar 86.9% (106/122). Status: below target, PIP trigger.',
      'POC Goal Documentation Completeness: Jan 80.0% (88/110), Feb 80.4% (90/112), Mar 80.0% (92/115). Status: below target, PIP trigger — flat, no improvement across the quarter.',
    ],
  }),
  recovered({
    id: 'EX-Q1-010', sourceId: 'QM-Q1-016..018', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Q1 Quality Metrics',
    title: 'Hospitalization Rate — Within Target',
    summary: 'Jan 1.9%, Feb 1.8%, Mar 0.8% — all within the <=3% target and improving.',
    details: ['The only Q1 metric that is fully within target all three months.', 'Not a PIP trigger; not itself controlling for any decision this meeting.'],
  }),

  // --- Group C: Feeder Audit Findings (Section 5 — 40 audits; relevant excerpts) ---
  recovered({
    id: 'EX-Q1-011', sourceId: 'AUD-Q1-CL-003', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: [],
    relevance: 'contextual', section: 'Feeder Audit Findings',
    title: 'Feeder Audit — Visit Note Timeliness',
    summary: 'Visit note timeliness: 13.1% late beyond 24 hours.',
    details: ['Reviewer: MOCK-CLIN-0017. Signed 2026-03-31.', 'Corroborates the recommended-action link between PIP-TRIG-Q1-003 and DISC-TRIG-Q1-001 (EX-Q1-026, EX-Q1-032).'],
  }),
  recovered({
    id: 'EX-Q1-012', sourceId: 'AUD-Q1-CL-004', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: [],
    relevance: 'contextual', section: 'Feeder Audit Findings',
    title: 'Feeder Audit — Medication Reconciliation Completion',
    summary: 'Med rec completed at SOC 79.2% — flagged as a critical gap.',
    details: ['Reviewer: MOCK-CLIN-0002. Signed 2026-03-31.', 'Corroborates PIP-TRIG-Q1-004 (EX-Q1-027).'],
  }),
  recovered({
    id: 'EX-Q1-013', sourceId: 'AUD-Q1-CL-008', quarter: 'Q1', asOfDate: '2026-04-02',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06', 'GV-WF-08'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'Feeder Audit Findings',
    title: 'Feeder Audit — Wound Infection Cluster',
    summary: 'Wound infection cluster: 4 infections in February across 3 different clinicians.',
    details: [
      'Reviewer: MOCK-CLIN-0017 (also the Infection Control Coordinator and CAP-Q1-003 owner — see EX-Q1-038).',
      'The 3-clinician spread is what makes this a systemic (not single-clinician) pattern — directly grounds PIP-TRIG-Q1-006 (EX-Q1-029).',
    ],
  }),
  recovered({
    id: 'EX-Q1-014', sourceId: 'AUD-Q1-CO-001', quarter: 'Q1', asOfDate: '2026-03-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: [],
    relevance: 'decision_relevant', section: 'Feeder Audit Findings',
    title: 'Feeder Audit — Documentation-to-Claim Mismatch',
    summary: 'Doc-to-claim mismatch on 6 claim lines (LVN visit billed as RN).',
    details: ['Reviewer: MOCK-CLIN-0025 (Compliance Officer). Signed 2026-03-30.', 'Grounds PIP-TRIG-Q1-008 (EX-Q1-031) together with EX-Q1-015.'],
  }),
  recovered({
    id: 'EX-Q1-015', sourceId: 'AUD-Q1-CO-005', quarter: 'Q1', asOfDate: '2026-04-01',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: [],
    relevance: 'decision_relevant', section: 'Feeder Audit Findings',
    title: 'Feeder Audit — Overpayment Identified',
    summary: 'Overpayment check: $1,200 identified — voluntary refund initiated.',
    details: ['Reviewer: MOCK-CLIN-0025. Signed 2026-04-01.', 'The refund being "initiated" is a management action already taken; it is not itself a completed CAP-effectiveness fact.'],
  }),
  recovered({
    id: 'EX-Q1-016', sourceId: 'AUD-Q1-QA-003', quarter: 'Q1', asOfDate: '2026-04-01',
    confidentiality: 'public', validationState: 'conflicting', workflowIds: ['GV-WF-07'], formIds: [],
    relevance: 'decision_relevant', section: 'Feeder Audit Findings',
    title: 'Feeder Audit — CAP Tracker Status Note',
    summary: 'CAP tracker updated; 4 items open, 2 overdue (remediated by 2026-04-02).',
    details: [
      'Reviewer: MOCK-CLIN-0026 (QAPI Committee Chair). Signed 2026-04-01.',
      'This note is about audit-tracking timeliness, not CAP closure — see EX-Q1-037/038, which both still show status "Open" with due dates in late April.',
      'Reading "remediated" as "CAP closed" is a genuine reconciliation trap this exhibit is built to test (see DN-06).',
    ],
  }),

  // --- Group D: Adverse Events & RCA (Section 6) ---
  recovered({
    id: 'EX-Q1-017', sourceId: 'AE-Q1-001', quarter: 'Q1', asOfDate: '2026-01-18',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08'],
    formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'decoy', section: 'Adverse Events & RCA',
    title: 'Adverse Event — CHF Exacerbation Hospitalization (RCA Complete)',
    summary: 'High-severity CHF exacerbation hospitalization; RCA complete (missed weight-gain documentation, delayed escalation); CAP assigned.',
    details: ['Status: RCA Complete — CAP assigned.', 'Already closed out procedurally this quarter — not the open risk the Board must act on tonight (contrast EX-Q1-018).'],
  }),
  recovered({
    id: 'EX-Q1-018', sourceId: 'AE-Q1-004', quarter: 'Q1', asOfDate: '2026-03-03',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08', 'GV-WF-09'],
    formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'decision_relevant', section: 'Adverse Events & RCA',
    title: 'Adverse Event — Sepsis Hospitalization (RCA In Progress)',
    summary: 'Critical-severity sepsis hospitalization. RCA-Q1-003 finding: infection signs present on a prior visit note but not escalated for 36 hours. Status: RCA In Progress.',
    details: [
      'Linked CAP: CAP-Q1-003 (EX-Q1-038). Linked disciplinary matter: DISC-TRIG-Q1-005 (EX-Q1-036).',
      'One of the 4 items escalated to the Governing Body this quarter (EX-Q1-005).',
      'Status is explicitly "In Progress" — not yet closed; do not treat as resolved.',
    ],
  }),
  recovered({
    id: 'EX-Q1-019', sourceId: 'AE-Q1-005', quarter: 'Q1', asOfDate: '2026-03-19',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-08'], formIds: [],
    relevance: 'decoy', section: 'Adverse Events & RCA',
    title: 'Adverse Event — Pneumonia Hospitalization (No RCA Required)',
    summary: 'High-severity pneumonia hospitalization; rapid deterioration with no prior warning signs documented. Closed — no systemic finding.',
    details: ['RCA required: No.', 'Included to test whether every hospitalization is mistaken for an escalation-worthy systemic event.'],
  }),

  // --- Group E: Infection Surveillance (Section 7) ---
  recovered({
    id: 'EX-Q1-020', sourceId: 'INF-Q1-001..004', quarter: 'Q1', asOfDate: '2026-03-05',
    confidentiality: 'public', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Infection Surveillance',
    title: 'Infection Line List — 4 Resolved Wound Infections',
    summary: '4 wound infections (surgical site, DM foot, pressure injury, post-surgical), all resolved by early March with antibiotic/protocol interventions.',
    details: ['All 4 marked Resolved.', 'The live, unresolved risk this quarter is the 5th, ongoing case — see EX-Q1-021.'],
  }),
  recovered({
    id: 'EX-Q1-021', sourceId: 'INF-Q1-005', quarter: 'Q1', asOfDate: '2026-03-02',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08'],
    formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'decision_relevant', section: 'Infection Surveillance',
    title: 'Infection Line List — Sepsis Secondary to Wound (Ongoing)',
    summary: 'Sepsis secondary to wound infection; onset 2026-03-02; hospitalized; RCA initiated. Status: Under Investigation.',
    details: ['Directly linked to AE-Q1-004 (EX-Q1-018) and DISC-TRIG-Q1-005 (EX-Q1-036).', 'No resolution date — still open as of the meeting.'],
  }),

  // --- Group F: Complaints (Section 8) ---
  recovered({
    id: 'EX-Q1-022', sourceId: 'COMP-Q1-005', quarter: 'Q1', asOfDate: '2026-03-07',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: [],
    relevance: 'decision_relevant', section: 'Complaints',
    title: 'Complaint — Interpreter Not Arranged Despite Request',
    summary: 'Communication complaint; interpreter not arranged despite request; resolved in 12 days against a <=5-day policy target; closed — escalated to Governing Body.',
    details: ['One of the 4 items escalated to the Governing Body this quarter (EX-Q1-005).', 'A 48-hour media inquiry about a related patient-care incident has since been received (EX-Q1-044).'],
  }),
  recovered({
    id: 'EX-Q1-023', sourceId: 'COMP-Q1-006', quarter: 'Q1', asOfDate: '2026-03-22',
    confidentiality: 'public', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Complaints',
    title: 'Complaint — Consistent Late Arrivals by HHA',
    summary: 'Scheduling complaint; consistent late arrivals by a home health aide; open — CAP initiated; not escalated to the Governing Body.',
    details: ['Not one of the 4 GB-escalated items — do not conflate with EX-Q1-022.'],
  }),

  // --- Group G: PIP Triggers — all 8 required (Section 9) ---
  recovered({
    id: 'EX-Q1-024', sourceId: 'PIP-TRIG-Q1-001', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-001 — OASIS Accuracy Below Threshold',
    summary: 'OASIS accuracy 82-84% vs >=90% for 3 consecutive months; M/GG item support gaps. Severity: High. Status: Active — PIP-Q1-001 initiated.',
    details: ['Source records: QM-Q1-001/002/003, AUD-Q1-CL-001, AUD-Q1-CL-009.', 'One of the 4 items escalated to the Governing Body this quarter (EX-Q1-005).'],
  }),
  recovered({
    id: 'EX-Q1-025', sourceId: 'PIP-TRIG-Q1-002', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-002 — POC Goal Documentation Deficiency',
    summary: 'POC missing patient-specific goals in 20% of charts; discipline justification absent in 18% of OT/SLP charts. Severity: High. Status: Active — PIP-Q1-002 initiated.',
    details: ['Source records: QM-Q1-010/011/012, AUD-Q1-CL-002, AUD-Q1-CL-012.'],
  }),
  recovered({
    id: 'EX-Q1-026', sourceId: 'PIP-TRIG-Q1-003', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-003 — Visit Documentation Timeliness Below Target',
    summary: '13.1% of visit notes late beyond 24h; persistent 3-month trend. Severity: High. Recommended action: PIP + disciplinary review (DISC-TRIG-Q1-001). Status: Active.',
    details: [
      'Source records: QM-Q1-004/005/006, AUD-Q1-CL-003.',
      'The recommended-action note names DISC-TRIG-Q1-001 (EX-Q1-032), which is itself only "Referred to HR," not yet adjudicated — do not treat the disciplinary review as already concluded.',
    ],
  }),
  recovered({
    id: 'EX-Q1-027', sourceId: 'PIP-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-004 — Medication Reconciliation Gap at SOC/ROC',
    summary: 'Med rec rate 72-79% vs >=95% threshold; systemic process gap identified. Severity: Critical. Status: Active — PIP-Q1-004 initiated.',
    details: ['Source records: QM-Q1-007/008/009, AUD-Q1-CL-004.', 'CAP-Q1-002 already opened against this trigger (EX-Q1-037).'],
  }),
  recovered({
    id: 'EX-Q1-028', sourceId: 'PIP-TRIG-Q1-005', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-005 — Missed Visit Rate Above Threshold',
    summary: 'Missed visit rate increased from 3.8% to 4.6%; physician/patient notification incomplete in 5 of 24 cases. Severity: High. Status: Active — PIP-Q1-005 initiated.',
    details: ['Source records: QM-Q1-013/014/015, AUD-Q1-CL-007.', 'Recommended action ties loosely to DISC-TRIG-Q1-003 (EX-Q1-034) via the missed-visit pattern, not a formal linkage on the trigger record itself.'],
  }),
  recovered({
    id: 'EX-Q1-029', sourceId: 'PIP-TRIG-Q1-006', quarter: 'Q1', asOfDate: '2026-03-15',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06', 'GV-WF-08'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-006 — Wound Infection Surveillance Spike',
    summary: 'Wound infection rate 10-13% vs <=5% threshold; repeat wound infections across 3 clinicians; sepsis event. Severity: Critical. Recommended action: PIP + infection control protocol review. Status: Active — PIP-Q1-006 initiated.',
    details: ['Source records: QM-Q1-019/020/021, AUD-Q1-CL-008, INF-Q1-001 through 005.', 'The most severe Q1 signal: it is the only trigger directly linked to a hospitalization (AE-Q1-004/EX-Q1-018) and a critical disciplinary hold (DISC-TRIG-Q1-005/EX-Q1-036).'],
  }),
  recovered({
    id: 'EX-Q1-030', sourceId: 'PIP-TRIG-Q1-007', quarter: 'Q1', asOfDate: '2026-03-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-007 — Complaint/Grievance Communication Trend',
    summary: '3 of 6 complaints involved communication failures; resolution rate 62-67% vs >=90% threshold. Severity: Critical. Status: Active — PIP-Q1-007 initiated.',
    details: ['Source records: QM-Q1-022/023/024, COMP-Q1-001/003/005, AUD-Q1-RM-004.', 'COMP-Q1-005 (EX-Q1-022), the GB-escalated interpreter complaint, is one of the 3 named communication-failure complaints.'],
  }),
  recovered({
    id: 'EX-Q1-031', sourceId: 'PIP-TRIG-Q1-008', quarter: 'Q1', asOfDate: '2026-03-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06', 'GV-WF-07'],
    formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'PIP Triggers',
    title: 'PIP-TRIG-Q1-008 — Documentation-to-Claim Mismatch',
    summary: '6 claim lines with doc-to-claim mismatch; $1,200 overpayment identified; voluntary refund initiated. Severity: High. Recommended action: PIP + compliance review. Status: Active — PIP-Q1-008 initiated.',
    details: ['Source records: AUD-Q1-CO-001, AUD-Q1-CO-005.', 'One of the 4 items escalated to the Governing Body this quarter (EX-Q1-005). CAP-Q1-005 opened against this trigger (EX-Q1-039).'],
  }),

  // --- Group H: Disciplinary Action Triggers — all 5 required (Section 10, restricted) ---
  recovered({
    id: 'EX-Q1-032', sourceId: 'DISC-TRIG-Q1-001', quarter: 'Q1', asOfDate: '2026-03-15',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Disciplinary Matters',
    title: 'Disciplinary Matter — Repeated Late Documentation After Prior Coaching',
    summary: 'Clinician reference MOCK-CLIN-0018 (RN). 18 late visit notes in Q1 despite Q4 2025 coaching. Severity: High. Recommended action: written warning. Status: Referred to HR.',
    details: ['This is an HR-level (not GB executive-session) matter — severity is High, not Critical, and it is not patient-safety-linked.', 'Do not conflate with the two Critical, GB-level matters (EX-Q1-035/036).'],
  }),
  recovered({
    id: 'EX-Q1-033', sourceId: 'DISC-TRIG-Q1-002', quarter: 'Q1', asOfDate: '2026-03-22',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Disciplinary Matters',
    title: 'Disciplinary Matter — Copy-Forward / Cloned Visit Narratives',
    summary: 'Clinician reference MOCK-CLIN-0016 (HHA). 8 consecutive visit notes for 2 patients contain identical narrative text. Severity: High. Recommended action: education + monitoring plan. Status: Referred to HR.',
    details: ['HR-level matter — High severity, not escalated to the Governing Body.'],
  }),
  recovered({
    id: 'EX-Q1-034', sourceId: 'DISC-TRIG-Q1-003', quarter: 'Q1', asOfDate: '2026-02-21',
    confidentiality: 'restricted', validationState: 'conflicting', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Disciplinary Matters',
    title: 'Disciplinary Matter — Missed Visit Not Reported Timely',
    summary: 'Clinician reference MOCK-CLIN-0019 (LVN). 3 missed visits not reported within the required 2-hour window. Severity: High. Recommended action: performance improvement plan. Status: In Progress.',
    details: [
      'Source record ids include COMP-Q1-004 — that underlying complaint\'s own status is "Closed," while this disciplinary review remains "In Progress." Track each record by its own status; a closed complaint does not mean the linked disciplinary review is also closed.',
      'HR-level matter — High severity, not escalated to the Governing Body.',
    ],
  }),
  recovered({
    id: 'EX-Q1-035', sourceId: 'DISC-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-03-28',
    confidentiality: 'executive_session', validationState: 'validated', workflowIds: ['GV-WF-09'],
    formIds: ['GB-FORM-RESTRICTED-MATTER'],
    relevance: 'decision_relevant', section: 'Disciplinary Matters',
    title: 'Disciplinary Matter — Unauthorized Documentation Change After Chart Review',
    summary: 'Clinician reference MOCK-CLIN-0003 (RN). Visit note amended 11 days after entry without documented clinical reason; amendment not countersigned. Severity: Critical. Recommended action: suspension pending investigation. Status: Under Investigation.',
    details: [
      'Critical severity + a record-integrity finding (a retroactive, uncountersigned amendment) — this is a Governing-Body-level restricted matter requiring executive session (GV-WF-09).',
      'A different clinician and a different matter than DISC-TRIG-Q1-005 (EX-Q1-036) — do not conflate the two critical matters.',
    ],
  }),
  recovered({
    id: 'EX-Q1-036', sourceId: 'DISC-TRIG-Q1-005', quarter: 'Q1', asOfDate: '2026-03-04',
    confidentiality: 'executive_session', validationState: 'validated', workflowIds: ['GV-WF-09', 'GV-WF-08'],
    formIds: ['GB-FORM-RESTRICTED-MATTER'],
    relevance: 'decision_relevant', section: 'Disciplinary Matters',
    title: 'Disciplinary Matter — Failure to Follow Escalation/Reporting Chain (Patient Safety)',
    summary: 'Clinician reference MOCK-CLIN-0004 (LVN). Signs of wound infection/sepsis documented 2026-03-02 but not escalated for 36 hours; patient hospitalized with sepsis. Severity: Critical. Recommended action: immediate retraining + supervision. Status: RCA pending — disciplinary hold.',
    details: [
      'Directly linked to AE-Q1-004/EX-Q1-018 (sepsis hospitalization) and INF-Q1-005/EX-Q1-021.',
      'Patient-safety-linked and Critical — requires executive session (GV-WF-09); the systemic corrective action is owned separately from the individual disciplinary review (see DN-12).',
    ],
  }),

  // --- Group I: Corrective Action Plans (Section 11) ---
  recovered({
    id: 'EX-Q1-037', sourceId: 'CAP-Q1-002', quarter: 'Q1', asOfDate: '2026-04-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'],
    formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'decision_relevant', section: 'Corrective Action Plans',
    title: 'CAP-Q1-002 — Medication Reconciliation Corrective Action',
    summary: 'Med rec protocol re-education + checklist implementation at SOC/ROC. Owner: Clinical Manager. Due 2026-04-30. Status: Open.',
    details: ['Source trigger: PIP-TRIG-Q1-004.', 'Status is Open, not Closed — see EX-Q1-016 for a note this exhibit disambiguates.'],
  }),
  recovered({
    id: 'EX-Q1-038', sourceId: 'CAP-Q1-003', quarter: 'Q1', asOfDate: '2026-04-23',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'],
    formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'decision_relevant', section: 'Corrective Action Plans',
    title: 'CAP-Q1-003 — Wound Infection Protocol Revision + Mandatory In-Service',
    summary: 'Protocol revision + mandatory in-service for field clinicians. Owner: MOCK-CLIN-0017 (also the auditor who found the cluster — see EX-Q1-013). Due 2026-04-23. Status: Open.',
    details: ['Source trigger: PIP-TRIG-Q1-006 + AE-Q1-004.', 'Same individual both identified and owns the fix for this finding — a self-review tension worth naming, though not itself disqualifying without more.'],
  }),
  recovered({
    id: 'EX-Q1-039', sourceId: 'CAP-Q1-005', quarter: 'Q1', asOfDate: '2026-04-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: [],
    relevance: 'decoy', section: 'Corrective Action Plans',
    title: 'CAP-Q1-005 — Billing Alignment Review',
    summary: 'Retrain LVN/RN staff on visit-type documentation matching billed service. Owner: Compliance Officer. Due 2026-04-30. Status: Open.',
    details: ['Source trigger: PIP-TRIG-Q1-008.', 'Not the CAP the budget-resourcing request (EX-Q1-043) is written against — see DN-10/DN-11.'],
  }),

  // --- Group J: Data-Quality Findings (QAPI_2026.validationFindings) ---
  recovered({
    id: 'EX-Q1-040', sourceId: 'DQ-2026-001', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'conflicting', workflowIds: [], formIds: [],
    relevance: 'conflicting', section: 'Data-Quality Findings',
    title: 'Data-Quality Finding — Clinician IDs Reassigned Across Quarters',
    summary: 'The MOCK-CLIN-* roster is fully reassigned between Q1 and Q2; the same raw id will denote a different person next quarter.',
    details: ['Critical-severity finding, affects Q1 and Q2.', 'Not itself a controlling fact for any Q1 decision — flagged so Q1-scoped clinician references (EX-Q1-032 through 036) are never later merged across quarters on raw id.'],
  }),
  recovered({
    id: 'EX-Q1-041', sourceId: 'DQ-2026-003', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'conflicting', workflowIds: ['GV-WF-05'], formIds: [],
    relevance: 'decision_relevant', section: 'Data-Quality Findings',
    title: 'Data-Quality Finding — No GB Motion/Vote Record for Escalated Matters',
    summary: 'GB-Q1-001 (EX-Q1-005) records that 4 items were escalated; the source contains no Board motion/vote/directive record for the Board\'s actual decision on any of them.',
    details: ['Warning-severity finding.', 'This is exactly why EX-Q1-007 (the motion shell) exists — a labeled UAT supplement only, not a stand-in for a real decision record.'],
  }),

  // --- Group K: Supplemental Governance Items (workflow coverage) ---
  toExhibit(GB_SUP_COI_001, {
    exhibitId: 'EX-Q1-042', quarter: 'Q1', section: 'Governance — Conflicts & Recusals',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
  }),
  toExhibit(GB_SUP_BUDGET_001, {
    exhibitId: 'EX-Q1-043', quarter: 'Q1', section: 'Governance — CAP Resourcing',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
  }),
  toExhibit(GB_SUP_MEDIA_001, {
    exhibitId: 'EX-Q1-044', quarter: 'Q1', section: 'Governance — Media & Privacy',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-MEDIA-INCIDENT'],
  }),
  toExhibit(GB_SUP_ROSTER_2026, {
    exhibitId: 'EX-Q1-045', quarter: 'Q1', section: 'Governance — Roster & Attestation',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
  }),
];

// ---------------------------------------------------------------------------
// Decision nodes
// ---------------------------------------------------------------------------

const DECISION_NODES: DecisionNode[] = [
  // ===================== ROUND 0 — Pre-meeting intake =====================
  {
    id: 'DN-01', matterId: 'M-INTAKE', round: 0, kind: 'classify_evidence',
    title: 'Classify the CAP Tracker Note Before the Meeting Opens',
    prompt: 'Before the Board convenes, classify EX-Q1-016 (feeder audit AUD-Q1-QA-003: "CAP tracker updated; 4 items open, 2 overdue (remediated by 2026-04-02)") against the CAP register (EX-Q1-037/038), which lists every Q1 CAP as status "Open."',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-05'], pointsAvailable: 75,
    options: [
      { id: 'DN-01-A', text: 'Decision-relevant proof that 2 of the 5 CAPs are now fully closed.' },
      { id: 'DN-01-B', text: 'Contextual only: the note describes an audit-tracking deficiency being cured before the feeder-audit deadline, not a CAP being closed. Every CAP in the register still shows status Open and none may be treated as resolved on this note alone.', correct: true },
      { id: 'DN-01-C', text: 'Approve tonight\'s packet on the understanding that all CAP deficiencies are already resolved.', criticalFailure: true },
      { id: 'DN-01-D', text: 'Decoy — the note is unrelated to any Q1 CAP and can be disregarded.' },
    ],
    requiredEvidenceIds: ['EX-Q1-016', 'EX-Q1-037', 'EX-Q1-038'],
    modelAction: 'DN-01-B',
    rationale: 'Posture and status are facts about a record, not inferences from adjacent language. "Remediated by 04-02" describes the audit-tracking deficiency (2 items were overdue for the feeder-audit review itself) being cured in time for the feeder-audit deadline — it says nothing about the underlying CAPs themselves, which the CAP register independently and unambiguously shows as still Open.',
    alternativesWhyFail: [
      'Treating the note as proof of CAP closure lets an ambiguous audit remark substitute for the CAP register\'s own explicit status.',
      'Approving the packet on an assumed-resolved basis adopts an unverified inference as the official record before the meeting even opens.',
      'Dismissing the note as unrelated ignores a genuine reconciliation question the Board must still resolve at DN-06.',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS'],
    deadlineExplanation: 'Packet readiness (source integrity, feeder audits complete, sign-offs, no unresolved critical data-quality defect) must be confirmed before the Board takes up the substance of any matter.',
    consequences: {
      patientSafety: 'Wrongly treating open corrective actions as resolved lets real unresolved risk (wound infection, medication reconciliation) fall out of Board attention.',
      regulatory: 'A survey review would treat an unverified closure inference as a records-integrity defect.',
      financial: 'No direct cost; misallocated oversight attention is the real cost.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The minutes must reflect that the tracker note was correctly scoped, not read as a closure record.',
    },
  },
  {
    id: 'DN-02', matterId: 'M-GOVERNANCE', round: 1, kind: 'quorum_calc',
    title: 'Quorum Check — General Session and the Vendor Matter',
    prompt: 'Compute quorum for tonight\'s general session and separately for the vendor conflict-of-interest matter (EX-Q1-042), where the disclosing director must recuse.',
    competencyIds: ['quorum-recusal'], workflowIds: ['GV-WF-02'], pointsAvailable: 50,
    requiredEvidenceIds: ['EX-Q1-003', 'EX-Q1-042'],
    modelAction: {
      totalSeats: 7,
      vacantSeats: 1,
      seatedEligible: 6,
      quorumThresholdGeneral: 4,
      presentGeneral: 6,
      quorumMetGeneral: true,
      vendorMatterRecusals: 1,
      vendorMatterEligibleVoters: 5,
      vendorMatterQuorumThreshold: 3,
      quorumMetVendorMatter: true,
    },
    rationale: 'One seat is vacant (the community-member director\'s term expired 2026-01-31, replacement not yet seated), leaving 6 eligible directors; a majority of 6 is 4, and all 6 are present, so general quorum is met. For the vendor matter, the disclosing director recuses, dropping the eligible-voter pool to 5; a majority of 5 is 3, and 5 remain present and eligible, so quorum is still met for that specific vote.',
    alternativesWhyFail: [
      'Counting the vacant seat toward the eligible total overstates the quorum base.',
      'Counting the recused director toward the vendor-matter quorum, rather than removing them from that denominator, would let a conflicted member\'s mere presence help manufacture a quorum they are not entitled to help form.',
    ],
    formsRequired: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
    deadlineExplanation: 'Quorum must be established and recorded before any vote is taken, general or matter-specific.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'A vote taken without a properly computed quorum is not a valid governance action and would not withstand review.',
      financial: 'The vendor contract renewal itself carries budget exposure decided later in the process.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'Quorum computation, including the recusal-adjusted denominator, must be recorded in the minutes.',
    },
  },
  {
    id: 'DN-03', matterId: 'M-GOVERNANCE', round: 1, kind: 'session_classification',
    title: 'Classify Tonight\'s Session Structure',
    prompt: 'Given the two critical restricted personnel matters on tonight\'s agenda (EX-Q1-035, EX-Q1-036), how should the meeting be structured between public and executive session?',
    competencyIds: ['executive-session'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-03-A', text: 'Open in public session; move to executive session by recorded motion for the two restricted personnel matters only; return to public session by recorded motion to close with any authorized public action.', correct: true },
      { id: 'DN-03-B', text: 'Discuss the personnel matters\' clinical and identifying detail in public session so all stakeholders are informed.', criticalFailure: true },
      { id: 'DN-03-C', text: 'Hold the entire meeting in executive session with no public record at all.', criticalFailure: true },
      { id: 'DN-03-D', text: 'Skip executive session and handle both personnel matters entirely by email between meetings.' },
    ],
    requiredEvidenceIds: ['EX-Q1-035', 'EX-Q1-036'],
    modelAction: 'DN-03-A',
    rationale: 'Confidentiality protects the substance of a restricted personnel deliberation, not the fact that governance occurred. The correct structure isolates the two restricted matters in a properly gated executive session while keeping the rest of the meeting, and the fact/outcome of the executive session itself, on the public record.',
    alternativesWhyFail: [
      'Discussing identifying/clinical personnel detail in public session is a privacy failure with no policy basis.',
      'Holding the whole meeting in executive session with no public record breaks public accountability for every other matter decided that night.',
      'Handling both matters by email outside a recorded session leaves no defensible governance record at all.',
    ],
    formsRequired: ['GB-FORM-EXEC-SESSION-MINUTES', 'GB-FORM-PUBLIC-MINUTES'],
    deadlineExplanation: 'The motion to enter and exit executive session must be recorded at the time it occurs, not reconstructed afterward.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'Improperly structured executive session is a governance-process defect a surveyor or plaintiff\'s counsel would flag.',
      financial: 'Not implicated at this node.',
      privacy: 'Public disclosure of personnel/clinical detail would be a direct privacy failure.',
      recordIntegrity: 'Both the public and confidential minutes must independently reflect what actually happened.',
    },
  },
  {
    id: 'DN-04', matterId: 'M-GOVERNANCE', round: 1, kind: 'workflow_select',
    title: 'Select Every Governance Workflow This Q1 Packet Must Activate',
    prompt: 'Given the roster change (EX-Q1-045), the vendor COI (EX-Q1-042), the packet/PIP portfolio (EX-Q1-006, EX-Q1-024 through 031), the sepsis adverse event (EX-Q1-018), and the two critical personnel matters (EX-Q1-035/036), select every Governing Body workflow this Q1 packet must activate tonight.',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-01', 'GV-WF-02', 'GV-WF-05', 'GV-WF-06', 'GV-WF-08', 'GV-WF-09'], pointsAvailable: 75,
    options: [
      { id: 'DN-04-01', text: 'GV-WF-01 — Board Roster & Composition Change', correct: true },
      { id: 'DN-04-02', text: 'GV-WF-02 — Conflict of Interest Disclosure & Recusal', correct: true },
      { id: 'DN-04-03', text: 'GV-WF-03 — Administrator Appointment or Change' },
      { id: 'DN-04-04', text: 'GV-WF-04 — Clinical Manager Appointment or Change' },
      { id: 'DN-04-05', text: 'GV-WF-05 — Quarterly QAPI Packet Review & Decision', correct: true },
      { id: 'DN-04-06', text: 'GV-WF-06 — PIP Authorization, Sustainability Review & Closure', correct: true },
      { id: 'DN-04-07', text: 'GV-WF-07 — Corrective Action Plan & Budget/Resource Authorization' },
      { id: 'DN-04-08', text: 'GV-WF-08 — Adverse Event Root-Cause Escalation', correct: true },
      { id: 'DN-04-09', text: 'GV-WF-09 — Restricted Personnel Matter (Executive Session)', correct: true },
      { id: 'DN-04-10', text: 'GV-WF-13 — Media / Public Incident & Privacy Breach Response' },
    ],
    requiredEvidenceIds: ['EX-Q1-045', 'EX-Q1-042', 'EX-Q1-006', 'EX-Q1-018', 'EX-Q1-035', 'EX-Q1-036'],
    modelAction: ['DN-04-01', 'DN-04-02', 'DN-04-05', 'DN-04-06', 'DN-04-08', 'DN-04-09'],
    rationale: 'As of this point in the meeting, six workflows are already squarely triggered by exhibits already on the table: the roster vacancy (GV-WF-01), the disclosed vendor conflict (GV-WF-02), the quarterly packet itself (GV-WF-05), the 8 active PIP triggers (GV-WF-06), the sepsis adverse event (GV-WF-08), and the two critical personnel matters (GV-WF-09). GV-WF-07 (CAP/budget authorization) and GV-WF-13 (media incident) are triggered later this meeting, once the budget-resourcing request and the media inquiry are actually introduced — selecting them here would be getting ahead of the evidence.',
    alternativesWhyFail: [
      'Omitting GV-WF-01 or GV-WF-02 misses the two governance-composition items already on the table before any quality discussion begins.',
      'Including GV-WF-03/04/07/13 at this point in the meeting is not supported by evidence introduced yet — no Administrator or Clinical Manager change, no budget request, and no media inquiry have been raised at this stage.',
    ],
    formsRequired: [
      'GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT', 'GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG',
      'GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PACKET-READINESS', 'GB-FORM-PIP-AUTHORIZATION',
      'GB-FORM-RCA-ESCALATION', 'GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES',
    ],
    deadlineExplanation: 'Workflow activation must track the evidence actually before the Board at each point in the meeting, not be pre-declared for the whole agenda in advance.',
    consequences: {
      patientSafety: 'Missing GV-WF-08/09 activation would leave the sepsis case and the two critical personnel matters without their required governance forms.',
      regulatory: 'Under- or over-selecting activated workflows misstates which forms and records this meeting actually requires.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The minutes must reflect the workflows actually activated, tied to the evidence that activated each one.',
    },
  },

  // ===================== ROUND 2 — Quality metrics & evidence discipline =====================
  {
    id: 'DN-05', matterId: 'M-QUALITY', round: 2, kind: 'denominator',
    title: 'Confirm the Denominator Behind the Wound-Infection Rate',
    prompt: 'EX-Q1-008 reports the Q1 wound-infection rate as 0.7% (Jan), 3.3% (Feb), 2.9% (Mar). What numerator/denominator basis may the Board cite for the February figure?',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    requiredEvidenceIds: ['EX-Q1-008'],
    modelAction: {
      numerator: null,
      denominator: null,
      note: 'Not separately computable from the recovered source at the monthly level. The Board may cite the recovered rate (3.3%) and its PIP-trigger status, but must not fabricate a specific numerator/denominator the source does not actually provide.',
    },
    rationale: 'The recovered source gives a quarter-level trend and rate for wound infection but does not cleanly separate a monthly numerator/denominator the way it does for the other seven Q1 metrics. Citing the rate and its critical/PIP-trigger status is fully supported; inventing a specific case count to sound more precise is not.',
    alternativesWhyFail: [
      'Citing a specific numerator/denominator not actually in the recovered record fabricates a precision the source does not support.',
      'Ignoring the metric entirely because the denominator is ambiguous would drop a genuine, critical PIP-trigger signal from Board attention.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Not applicable — this is an evidence-discipline check, not a scheduled action.',
    consequences: {
      patientSafety: 'Silently dropping an ambiguous-denominator metric would remove a real, critical signal (linked to a sepsis hospitalization) from oversight.',
      regulatory: 'Fabricated precision in a governance record is itself a records-integrity defect on survey.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The minutes must reflect what the source actually supports, not an invented level of precision.',
    },
  },
  {
    id: 'DN-06', matterId: 'M-QUALITY', round: 2, kind: 'reconcile_conflict',
    title: 'Reconcile the CAP Tracker Note Against the CAP Register',
    prompt: 'EX-Q1-016 (AUD-Q1-QA-003) states the CAP tracker shows "4 items open, 2 overdue (remediated by 04-02)." EX-Q1-037/038 (CAP-Q1-002, CAP-Q1-003) both still show status "Open," due 2026-04-30 and 2026-04-23 respectively. Reconcile the two records.',
    competencyIds: ['record-integrity'], workflowIds: ['GV-WF-07'], pointsAvailable: 75,
    options: [
      { id: 'DN-06-A', text: 'The audit note describes an audit-tracking deficiency (2 items overdue for the feeder-audit review) that was cured by 04-02 — it is not evidence any underlying CAP was closed. CAP-Q1-002 and CAP-Q1-003 remain open per the CAP register and must be tracked to their own due dates and effectiveness attestation.', correct: true },
      { id: 'DN-06-B', text: 'The two records are inconsistent; hold both CAPs entirely until the discrepancy is formally resolved.' },
      { id: 'DN-06-C', text: 'The CAP register is outdated; rely on the audit note\'s "remediated" language as the current status.' },
      { id: 'DN-06-D', text: 'Treat both CAP-Q1-002 and CAP-Q1-003 as closed, since the tracker note says the overdue items were remediated.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-016', 'EX-Q1-037', 'EX-Q1-038'],
    modelAction: 'DN-06-A',
    rationale: 'The two records are not actually in conflict once each is read for what it covers: the audit note is about tracking timeliness, and the CAP register is about substantive CAP status. Both can be true at once, and the CAP register — the more specific, purpose-built record — controls on CAP status.',
    alternativesWhyFail: [
      'Holding both CAPs over a misreading of the audit note delays legitimate corrective action without cause.',
      'Preferring the audit note\'s informal language over the CAP register\'s explicit status inverts which record is authoritative for CAP status.',
      'Treating either CAP as closed on this basis lets real, unresolved risk (medication reconciliation, wound infection) drop from oversight.',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: 'CAP status must be reconciled before the Board relies on either record for a downstream decision (see DN-10/DN-11/DN-13).',
    consequences: {
      patientSafety: 'Misreading either CAP as closed would suspend oversight of an unresolved medication-reconciliation or wound-infection risk.',
      regulatory: 'A CAP register status inconsistent with the Board\'s own understanding is not defensible on survey.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The minutes must show the reconciliation reasoning, not just a picked side.',
    },
  },
  {
    id: 'DN-07', matterId: 'M-QUALITY', round: 2, kind: 'eligibility',
    title: 'PIP-Q1-004 (Medication Reconciliation) Closure Eligibility',
    prompt: 'Is PIP-Q1-004 eligible for closure at this, its first (baseline), quarter?',
    competencyIds: ['pip-closure-sustainability'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    options: [
      { id: 'DN-07-A', text: 'No — hold open. This is the baseline quarter (72.7% -> 79.2%, vs >=95% target); the approved sustainability criterion requires two consecutive quarters at or above 95%, which cannot yet exist after only one quarter.', correct: true },
      { id: 'DN-07-B', text: 'Yes — March (79.2%) is the best month of the quarter, and the trend is improving.' },
      { id: 'DN-07-C', text: 'Yes — close it, since a CAP (CAP-Q1-002) has already been opened, and that is itself sufficient.', criticalFailure: true },
      { id: 'DN-07-D', text: 'Defer the decision indefinitely with no return date.' },
    ],
    requiredEvidenceIds: ['EX-Q1-027', 'EX-Q1-037'],
    modelAction: 'DN-07-A',
    rationale: 'Sustainability by definition cannot be demonstrated in a single baseline quarter — the Board\'s own criterion requires two consecutive qualifying quarters, and Q1 is the first quarter this PIP has existed.',
    alternativesWhyFail: [
      'Anchoring on the best single month within the quarter ignores that the criterion is quarter-level and requires two consecutive qualifying quarters, not a favorable month.',
      'Treating a CAP\'s mere existence as sufficient for closure conflates opening a corrective action with demonstrating its sustained result.',
      'Indefinite deferral without a stated return date is not a defensible monitoring posture.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'Closure decisions are made at the quarterly review once that quarter\'s evidence is available; see DN-14 for the return date.',
    consequences: {
      patientSafety: 'Premature closure would suspend oversight of a still-critical (72-79% vs >=95%) medication-reconciliation gap.',
      regulatory: 'A closure decision inconsistent with the Board\'s own approved sustainability criterion is not defensible on survey.',
      financial: 'Continued oversight carries the resourcing cost addressed at DN-11/DN-13.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The hold decision and its return date must be recorded, not left implicit.',
    },
  },

  // ===================== ROUND 3 — PIP risk & CAP forms =====================
  {
    id: 'DN-08', matterId: 'M-PIP-RISK', round: 3, kind: 'proceed_decision',
    title: 'Proceed Decision — Wound-Infection PIP Given the Sepsis Event',
    prompt: 'PIP-Q1-006 (wound infection, EX-Q1-029) is at a 10-13% baseline against a <=5% target, with a documented 3-clinician cluster (EX-Q1-013) and a sepsis hospitalization (EX-Q1-018/021) linked to the same infection-control gap. How should the Board proceed?',
    competencyIds: ['aggregate-vs-subgroup'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    options: [
      { id: 'DN-08-A', text: 'Authorize PIP-Q1-006 and CAP-Q1-003 (protocol revision, mandatory in-service) to proceed as the systemic corrective response; hold closure open pending two consecutive qualifying quarters at <=5% in every stratum; direct the sepsis RCA (RCA-Q1-003) to completion with its findings returned to the Board.', correct: true },
      { id: 'DN-08-B', text: 'Take no additional Board-level action beyond the CAP management has already opened.' },
      { id: 'DN-08-C', text: 'Direct that the specific clinician linked to the sepsis case (MOCK-CLIN-0004) be immediately terminated.', overreach: true },
      { id: 'DN-08-D', text: 'Accept management\'s assurance that the cluster is resolved and take no Board-level action, given the quarter is only establishing baseline.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-029', 'EX-Q1-013', 'EX-Q1-018', 'EX-Q1-038'],
    modelAction: 'DN-08-A',
    rationale: 'A 3-clinician cluster plus a linked hospitalization is precisely the systemic pattern QAPI oversight exists to catch, regardless of which quarter it appears in — "baseline" describes when the PIP started, not how seriously the signal should be taken.',
    alternativesWhyFail: [
      'Taking no additional action leaves the Board\'s oversight role indistinguishable from simply rubber-stamping management\'s existing CAP.',
      'Directing a specific clinician\'s termination is a Board overreach into an individual personnel action still under active investigation and disciplinary hold.',
      'Accepting an unverified assurance of resolution when the quarter has not even completed its own baseline measurement ignores the evidence already on the table.',
    ],
    formsRequired: ['GB-FORM-PIP-AUTHORIZATION', 'GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: 'PIP authorization and CAP oversight decisions are made at the quarterly review as the triggering evidence is presented.',
    consequences: {
      patientSafety: 'Failing to direct sustained oversight risks a repeat or worsening wound-infection/sepsis event.',
      regulatory: 'A documented Board authorization and hold decision is defensible on survey; silence or an unverified acceptance is not.',
      financial: 'Continued CAP oversight carries the resourcing need addressed at DN-11.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The Board\'s authorization, hold, and RCA-completion directive must all be recorded distinctly.',
    },
  },
  {
    id: 'DN-09', matterId: 'M-PIP-RISK', round: 3, kind: 'risk_rank',
    title: 'Rank This Quarter\'s Top Risk Signals for Board Attention',
    prompt: 'Select the top 3 Q1 signals for Board oversight priority this quarter: medication reconciliation, wound infection/sepsis cluster, missed visits, complaint resolution, OASIS accuracy, POC goal documentation.',
    competencyIds: ['aggregate-vs-subgroup'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    options: [
      { id: 'DN-09-01', text: 'Wound infection / sepsis cluster (critical, 3-clinician spread, linked hospitalization and disciplinary hold)', correct: true },
      { id: 'DN-09-02', text: 'Medication reconciliation (critical, most severe rate gap: 72-79% vs >=95%)', correct: true },
      { id: 'DN-09-03', text: 'Complaint resolution (critical, includes the GB-escalated interpreter-failure complaint)', correct: true },
      { id: 'DN-09-04', text: 'Missed visit rate (critical status, but with no linked adverse event this quarter)' },
      { id: 'DN-09-05', text: 'OASIS accuracy (below target, not critical)' },
      { id: 'DN-09-06', text: 'POC goal documentation (below target, not critical)' },
    ],
    requiredEvidenceIds: ['EX-Q1-008', 'EX-Q1-009'],
    modelAction: ['DN-09-01', 'DN-09-02', 'DN-09-03'],
    rationale: 'Four metrics are critical-status this quarter, so severity alone does not distinguish them; weighing patient-safety linkage (wound infection/sepsis), gap magnitude (medication reconciliation), and legal/reputational exposure via Board escalation (complaint resolution) separates the top 3 from missed visits, which is real but has no linked adverse event yet this quarter.',
    alternativesWhyFail: [
      'Ranking either below-target (not critical) metric into the top 3 understates the four genuinely critical signals.',
      'Treating all four critical metrics as equally top-priority ignores the additional patient-safety, escalation, and severity distinctions the evidence actually supports.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Not applicable — this informs how the Board allocates its own attention across the packet, not a scheduled action.',
    consequences: {
      patientSafety: 'Under-prioritizing the wound-infection/sepsis signal risks the Board spending limited attention on lower-severity items.',
      regulatory: 'Not implicated at this node.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The minutes should reflect a reasoned prioritization, not an unweighted list.',
    },
  },
  {
    id: 'DN-10', matterId: 'M-CAP-BUDGET', round: 3, kind: 'forms_select',
    title: 'Select the Forms the CAP/Budget-Resourcing Decision Requires',
    prompt: 'The Board is about to authorize resourcing for CAP-Q1-002 and CAP-Q1-003 per the budget-authorization request (EX-Q1-043). Select every form this action requires.',
    competencyIds: ['record-integrity'], workflowIds: ['GV-WF-07'], pointsAvailable: 75,
    options: [
      { id: 'DN-10-01', text: 'GB-FORM-CAP-EFFECTIVENESS', correct: true },
      { id: 'DN-10-02', text: 'GB-FORM-BUDGET-AUTHORIZATION', correct: true },
      { id: 'DN-10-03', text: 'GB-FORM-PIP-AUTHORIZATION' },
      { id: 'DN-10-04', text: 'GB-FORM-RESTRICTED-MATTER' },
      { id: 'DN-10-05', text: 'GB-FORM-ROSTER-ATTEST' },
      { id: 'DN-10-06', text: 'GB-FORM-PACKET-READINESS' },
    ],
    requiredEvidenceIds: ['EX-Q1-043', 'EX-Q1-037', 'EX-Q1-038'],
    modelAction: ['DN-10-01', 'DN-10-02'],
    rationale: 'This is a CAP-effectiveness/resourcing action, not a new PIP authorization, a personnel matter, a roster action, or a packet-readiness check — only the two forms that govern CAP effectiveness and budget authorization apply.',
    alternativesWhyFail: [
      'PIP-Q1-004 and PIP-Q1-006 are already authorized (EX-Q1-024 through 031); this action does not re-authorize either PIP.',
      'Restricted-matter, roster, and packet-readiness forms belong to unrelated workflows already handled elsewhere this meeting (DN-03/04, DN-01).',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    deadlineExplanation: 'The correct forms must accompany the resourcing motion at the time it is recorded (see DN-11).',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'Attaching the wrong forms to a governance action misstates its own record.',
      financial: 'The budget-authorization form is the specific record of the resourcing commitment.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'Form selection must track the actual workflow being exercised, not a generic bundle.',
    },
  },

  // ===================== ROUND 4 — Motions, ownership, effectiveness =====================
  {
    id: 'DN-11', matterId: 'M-CAP-BUDGET', round: 4, kind: 'motion_builder',
    title: 'Draft the Motion Authorizing CAP Resourcing',
    prompt: 'Draft the Board\'s motion authorizing the resources CAP-Q1-002 and CAP-Q1-003 need per EX-Q1-043 — not CAP-Q1-005 (billing, EX-Q1-039), which was not the subject of a resourcing request.',
    competencyIds: ['budget-cap-resources'], workflowIds: ['GV-WF-07'], pointsAvailable: 40,
    requiredEvidenceIds: ['EX-Q1-043', 'EX-Q1-037', 'EX-Q1-038'],
    modelAction: {
      motionType: 'authorize_resources',
      capIds: ['CAP-Q1-002', 'CAP-Q1-003'],
      resources: '0.5 FTE quality-review staffing + a documentation-audit tool license',
      authorizedBy: 'Governing Body',
      linkedForms: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    },
    rationale: 'The budget request (EX-Q1-043) is explicit that these resources are what the CAPs\' own effectiveness criteria assume will be in place — the motion must name both CAPs it actually supports and the specific resources requested, not a vaguer or broader authorization.',
    alternativesWhyFail: [
      'A motion that also names CAP-Q1-005 would authorize resourcing for a CAP that never requested it.',
      'A vague motion ("approve additional resources") without naming the specific CAPs and resources fails to create a traceable authorization record.',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    deadlineExplanation: 'The motion should be recorded before CAP-Q1-002/003\'s own due dates (2026-04-30 / 2026-04-23) so the resourcing is actually in place to support them.',
    consequences: {
      patientSafety: 'Under-resourcing the med-rec and wound-infection CAPs risks their corrective actions not sustaining.',
      regulatory: 'A CAP marked effective without its own required resourcing in place is not defensible on survey.',
      financial: 'This is the specific budget commitment the Board is authorizing tonight.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The motion must name the specific CAPs and resources it authorizes.',
    },
  },
  {
    id: 'DN-12', matterId: 'M-CAP-BUDGET', round: 4, kind: 'owner_assign',
    title: 'Assign System Ownership for the Sepsis RCA Systemic Corrective Action',
    prompt: 'RCA-Q1-003 (sepsis, EX-Q1-018) is still in progress; disciplinary review of the individual clinician (EX-Q1-036) proceeds separately. Assign the Board-directed owner for the SYSTEMIC corrective action arising from the RCA.',
    competencyIds: ['board-vs-management'], workflowIds: ['GV-WF-08'], pointsAvailable: 40,
    options: [
      { id: 'DN-12-A', text: 'Clinical Manager — the system-level role accountable for the infection-control/escalation-protocol fix, distinct from the individual clinician under disciplinary review.', correct: true },
      { id: 'DN-12-B', text: 'The individual clinician under investigation (MOCK-CLIN-0004) — they caused the failure, so they should own its fix.', criticalFailure: true },
      { id: 'DN-12-C', text: 'Administrator — not the role that owns clinical-protocol execution here.' },
      { id: 'DN-12-D', text: 'No owner assigned; defer ownership until the RCA closes.' },
    ],
    requiredEvidenceIds: ['EX-Q1-018', 'EX-Q1-021', 'EX-Q1-036'],
    modelAction: 'DN-12-A',
    rationale: 'The Board directs systemic accountability to the management role that owns the process, not to the individual under active disciplinary review — conflating the two would let a personnel action stand in for the systemic fix the RCA actually calls for.',
    alternativesWhyFail: [
      'Naming the individual under investigation as the systemic-fix owner is both a due-process problem and a category error — a personnel outcome is not a protocol fix.',
      'Naming the Administrator misassigns a clinical-protocol fix to a non-clinical operational role.',
      'Deferring ownership indefinitely leaves the systemic gap unassigned while the RCA remains open.',
    ],
    formsRequired: ['GB-FORM-RCA-ESCALATION'],
    deadlineExplanation: 'Ownership of the systemic corrective action should be assigned as soon as the RCA identifies a systemic root cause, not held until the RCA formally closes.',
    consequences: {
      patientSafety: 'An unassigned or misassigned systemic fix leaves the escalation-protocol gap unaddressed.',
      regulatory: 'Assigning a personnel target instead of a systemic owner is a governance-authority defect.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The RCA-escalation record must show system ownership separate from the disciplinary record.',
    },
  },
  {
    id: 'DN-13', matterId: 'M-CAP-BUDGET', round: 4, kind: 'effectiveness',
    title: 'CAP-Q1-003 Effectiveness — Can It Be Attested This Quarter?',
    prompt: 'CAP-Q1-003 (wound-infection protocol revision + mandatory in-service) was opened this quarter with a due date of 2026-04-23. Can the Board attest its effectiveness tonight?',
    competencyIds: ['budget-cap-resources'], workflowIds: ['GV-WF-07'], pointsAvailable: 35,
    options: [
      { id: 'DN-13-A', text: 'No — the CAP was only just opened this quarter; effectiveness requires demonstrated sustained results (the two-consecutive-quarter wound-infection criterion), which cannot exist in the same quarter the CAP itself was opened.', correct: true },
      { id: 'DN-13-B', text: 'Yes — the protocol revision and in-service have been designed and scheduled, so effectiveness may be attested now.', criticalFailure: true },
      { id: 'DN-13-C', text: 'Effectiveness cannot be assessed at all until CAP-Q1-003\'s own due date; no interim monitoring is needed until then.' },
      { id: 'DN-13-D', text: 'Defer effectiveness review to the annual report only.' },
    ],
    requiredEvidenceIds: ['EX-Q1-038', 'EX-Q1-029'],
    modelAction: 'DN-13-A',
    rationale: 'Designing and scheduling a corrective activity is not the same as demonstrating its sustained result — effectiveness for this CAP is tied to the same two-consecutive-quarter wound-infection criterion the Board holds PIP-Q1-006 to, which cannot be met in the CAP\'s opening quarter.',
    alternativesWhyFail: [
      'Attesting effectiveness from planned activity alone lets a CAP\'s design stand in for its result.',
      'Waiting until only the due date with no interim monitoring risks missing a completion gap until it is too late to correct.',
      'Deferring to the annual report removes quarterly oversight the Board is directly responsible for.',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: 'CAP-Q1-003 is due 2026-04-23; effectiveness attestation depends on evidence not yet available this quarter.',
    consequences: {
      patientSafety: 'A premature effectiveness attestation would let CAP-Q1-003 be treated as sufficient before the underlying risk is actually controlled.',
      regulatory: 'Attesting effectiveness without the required sustained evidence is not defensible on survey.',
      financial: 'The resourcing authorized at DN-11 supports this CAP through to a genuine effectiveness determination.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The record must show effectiveness pending, not attested, this quarter.',
    },
  },
  {
    id: 'DN-14', matterId: 'M-CAP-BUDGET', round: 4, kind: 'return_date',
    title: 'Set the Return Date for the Med-Rec & Wound-Infection PIP Portfolio',
    prompt: 'Set the date PIP-Q1-004 and PIP-Q1-006 return to the Board with their next quarterly sustainability evidence.',
    competencyIds: ['pip-closure-sustainability'], workflowIds: ['GV-WF-06'], pointsAvailable: 35,
    requiredEvidenceIds: ['EX-Q1-027', 'EX-Q1-029', 'EX-Q1-001'],
    modelAction: '2026-07-10',
    rationale: 'Consistent with this agency\'s quarterly meeting cadence (the second week of the month following quarter close, as set on this quarter\'s own meeting control record), the Q2 quarterly meeting — and therefore both PIPs\' return date — falls on 2026-07-10, once Q2\'s monthly evidence is available.',
    alternativesWhyFail: [
      'Leaving the return date open-ended repeats the same forcing-function gap this quarter\'s CAP register (EX-Q1-016 reconciliation) already warns against.',
      'Setting a return date before a full subsequent quarter\'s monthly data would exist defeats the purpose of the two-consecutive-quarter test.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'The return date must fall at the next quarterly meeting, after a full quarter\'s monthly data is available.',
    consequences: {
      patientSafety: 'A concrete return date keeps med-rec and wound-infection oversight active rather than letting it lapse silently.',
      regulatory: 'An open-ended hold with no return date is not a defensible monitoring posture.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The return date must be recorded as a forward commitment, not a completed fact.',
    },
  },

  // ===================== ROUND 5 — Complaint disposition & personnel authority =====================
  {
    id: 'DN-15', matterId: 'M-COMPLAINT', round: 5, kind: 'disposition',
    title: 'Disposition — Interpreter-Failure Complaint Escalated to the Board',
    prompt: 'COMP-Q1-005 (EX-Q1-022) — an interpreter was not arranged despite request, resolved in 12 days against the <=5-day policy target, and escalated to the Governing Body. A media inquiry (EX-Q1-044) about a related patient-care incident has also been received. Disposition this matter.',
    competencyIds: ['board-vs-management'], workflowIds: ['GV-WF-06', 'GV-WF-13'], pointsAvailable: 40,
    options: [
      { id: 'DN-15-A', text: 'Direct management to correct the systemic interpreter-services scheduling/request process and report a compliance update at the Q2 meeting; coordinate a single factual, RCA-consistent public response to the media inquiry that does not disclose clinical detail ahead of RCA completion.', correct: true },
      { id: 'DN-15-B', text: 'No further action — the complaint is already closed procedurally.' },
      { id: 'DN-15-C', text: 'Direct that the specific scheduler responsible be reprimanded by name.', overreach: true },
      { id: 'DN-15-D', text: 'Authorize a detailed public statement describing the clinical specifics of the incident to satisfy the media inquiry\'s 48-hour request.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-022', 'EX-Q1-030', 'EX-Q1-044'],
    modelAction: 'DN-15-A',
    rationale: 'The Board directs a systemic process fix and a properly bounded public response; it does not treat the complaint\'s procedural closure as the end of the matter, does not name an individual for discipline, and does not authorize disclosing clinical detail ahead of RCA completion.',
    alternativesWhyFail: [
      'Treating the complaint as fully resolved ignores that it was specifically escalated to the Board because of a systemic communication-access gap (also reflected in PIP-TRIG-Q1-007).',
      'Naming a specific employee for reprimand is a Board overreach into an individual personnel action.',
      'Disclosing clinical specifics to satisfy a media deadline risks disclosing unverified findings ahead of RCA completion and is a privacy/record-integrity failure.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-MEDIA-INCIDENT'],
    deadlineExplanation: 'The media inquiry requested a response within 48 hours; the compliance-process fix is tracked to the Q2 meeting.',
    consequences: {
      patientSafety: 'Interpreter-access failures directly affect a patient\'s ability to participate in their own care decisions.',
      regulatory: 'An escalated complaint left without a systemic response is a governance-follow-through gap.',
      financial: 'Not implicated at this node.',
      privacy: 'Premature clinical disclosure to the media would be a privacy and record-integrity failure.',
      recordIntegrity: 'The disposition and the media response must both be recorded as directed Board actions.',
    },
  },
  {
    id: 'DN-16', matterId: 'M-PERSONNEL', round: 5, kind: 'board_vs_management',
    title: 'Board Authority — the Unauthorized Documentation-Change Matter',
    prompt: 'DISC-TRIG-Q1-004 (EX-Q1-035): a visit note was amended 11 days after entry without documented reason or countersignature; suspension pending investigation is management\'s recommended action. What is the Board\'s role?',
    competencyIds: ['board-vs-management'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-16-A', text: 'Direct management to complete the investigation and report the systemic finding and corrective action to the Board; the Board holds management accountable for the outcome, it does not itself order the suspension.', correct: true },
      { id: 'DN-16-B', text: 'Directly order the clinician\'s suspension as a Board action.', criticalFailure: true },
      { id: 'DN-16-C', text: 'Take no position and leave the matter entirely to management with no reporting requirement back to the Board.' },
      { id: 'DN-16-D', text: 'Identify the clinician by name in the public record of tonight\'s meeting.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-035'],
    modelAction: 'DN-16-A',
    rationale: 'The Board directs systemic accountability and holds management to it; it does not itself execute an individual personnel action, and it never discloses an individual\'s identity in the public record.',
    alternativesWhyFail: [
      'Ordering the suspension directly is a Board action outside its authority — that is management\'s function to execute, not the Board\'s.',
      'Taking no position at all abandons the Board\'s oversight duty to ensure the investigation and its systemic finding actually come back to the Board.',
      'Naming the clinician publicly is a privacy and record-integrity failure with no policy basis.',
    ],
    formsRequired: ['GB-FORM-RESTRICTED-MATTER'],
    deadlineExplanation: 'The Board\'s directive to management should be recorded in this meeting\'s executive session, with a required report-back date.',
    consequences: {
      patientSafety: 'A record-integrity failure of this kind (a retroactive, uncountersigned amendment) can mask an undocumented care event if not investigated.',
      regulatory: 'A Board that directs individual personnel action is acting outside its governance authority and outside a defensible record.',
      financial: 'Not implicated at this node.',
      privacy: 'Public identification of the individual would be a direct privacy failure.',
      recordIntegrity: 'The Board\'s directive, not a personnel order, is what belongs in the governance record.',
    },
  },

  // ===================== ROUND 6 — Documentation & the public/confidential record =====================
  {
    id: 'DN-17', matterId: 'M-PERSONNEL', round: 6, kind: 'public_minutes',
    title: 'Draft the Public-Minutes Entry for Tonight\'s Executive Session',
    prompt: 'Draft the public-minutes entry covering tonight\'s executive session on the two restricted personnel matters (EX-Q1-035, EX-Q1-036).',
    competencyIds: ['executive-session'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-17-A', text: 'The Board convened in executive session to review two restricted personnel matters linked to patient-safety and documentation-integrity findings; the Board directed management to complete both investigations and report systemic corrective action at the next quarterly meeting. No further detail is part of the public record.', correct: true },
      { id: 'DN-17-B', text: 'Include the clinician reference ids and specific findings in the public minutes for full transparency.', criticalFailure: true },
      { id: 'DN-17-C', text: 'Omit any mention that an executive session occurred at all.', criticalFailure: true },
      { id: 'DN-17-D', text: 'State only "executive session held" with no reference to the authorized public action that resulted.' },
    ],
    requiredEvidenceIds: ['EX-Q1-035', 'EX-Q1-036'],
    modelAction: 'DN-17-A',
    rationale: 'The public minutes must show that governance occurred and what public action resulted, without disclosing the restricted substance itself.',
    alternativesWhyFail: [
      'Including clinician-identifying detail in the public minutes is a privacy failure the confidentiality rule exists to prevent.',
      'Omitting the fact of the executive session entirely breaks public accountability for that portion of the meeting.',
      'Recording only "executive session held" with no authorized public action leaves the public record incomplete about what the Board actually decided.',
    ],
    formsRequired: ['GB-FORM-PUBLIC-MINUTES'],
    deadlineExplanation: 'Public minutes are due 2026-04-16, consistent with this quarter\'s meeting control record (EX-Q1-001).',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'An incomplete or over-disclosing public record is a governance-process defect on survey.',
      financial: 'Not implicated at this node.',
      privacy: 'This is the primary privacy control point for the public record.',
      recordIntegrity: 'The public minutes must independently reflect the fact and authorized outcome of the executive session.',
    },
  },
  {
    id: 'DN-18', matterId: 'M-PERSONNEL', round: 6, kind: 'confidential_minutes',
    title: 'Draft the Confidential Executive-Session Minutes Entry',
    prompt: 'Draft the confidential executive-session minutes entry capturing the substantive deliberation on DISC-TRIG-Q1-004 and DISC-TRIG-Q1-005.',
    competencyIds: ['executive-session', 'record-integrity'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-18-A', text: 'Record the clinician references by id (MOCK-CLIN-0003, MOCK-CLIN-0004), the finding summaries, the Board\'s directive to management, and the required return date — using de-identified references consistent with the record\'s own convention, never a patient or staff name.', correct: true },
      { id: 'DN-18-B', text: 'Record the clinicians\' and patients\' full names to ensure a complete historical record.', criticalFailure: true },
      { id: 'DN-18-C', text: 'Record only that "a personnel matter was discussed," with no finding, directive, or return date captured.' },
      { id: 'DN-18-D', text: 'Do not create confidential minutes at all, since the matter is restricted.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-035', 'EX-Q1-036'],
    modelAction: 'DN-18-A',
    rationale: 'Confidential minutes must capture enough substance (finding, directive, return date) to be a real governance record, using the same de-identified reference convention this system uses everywhere else — confidentiality protects the record\'s distribution, not its accuracy or completeness.',
    alternativesWhyFail: [
      'Recording real names exceeds this system\'s own de-identification convention and creates unnecessary disclosure risk even within a restricted record.',
      'Recording only that a matter was discussed, with no finding or directive, fails to create a usable governance record at all.',
      'Failing to create confidential minutes leaves the executive session with no record whatsoever, restricted or otherwise.',
    ],
    formsRequired: ['GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'Confidential minutes are due on the same 2026-04-16 cycle as the public minutes, restricted to authorized recipients.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'An unusable or over-disclosing confidential record fails governance record-keeping requirements either way.',
      financial: 'Not implicated at this node.',
      privacy: 'Even within a restricted record, real names exceed this system\'s de-identification convention.',
      recordIntegrity: 'This is the authoritative internal record of what the Board actually decided in executive session.',
    },
  },
];

// ---------------------------------------------------------------------------
// Injects
// ---------------------------------------------------------------------------

const INJECTS: Inject[] = [
  {
    id: 'INJ-01', round: 0, title: 'Packet Note — No GB Motion Record on File',
    body: 'The Compliance Officer notes for the record: the source shows GB-Q1-001 (4 items escalated) but no Board motion/vote/directive record for any of them (EX-Q1-041). Tonight\'s packet includes a blank motion shell (EX-Q1-007) for the Board to complete as it actually deliberates — it is not a pre-filled outcome.',
    workflowIds: ['GV-WF-05'],
  },
  {
    id: 'INJ-02', round: 1, title: 'Governance Inject — Vendor Conflict-of-Interest Disclosure Filed',
    body: 'A director discloses a financial interest in a vendor whose contract renewal is on tonight\'s agenda (EX-Q1-042) and requests to recuse from that vote.',
    workflowIds: ['GV-WF-02'],
  },
  {
    id: 'INJ-03', round: 1, releaseAfterNodeId: 'DN-03',
    title: 'Governance Inject — Board Roster Change Proposed',
    body: 'The Administrator presents a proposed replacement for the community-member seat vacated when the outgoing director\'s term expired 2026-01-31 (EX-Q1-045), for the Board\'s consideration tonight.',
    workflowIds: ['GV-WF-01'],
  },
  {
    id: 'INJ-04', round: 2, releaseAfterNodeId: 'DN-06',
    title: 'Late Inject — CAP Tracker Clarification',
    body: 'The QAPI Committee Chair confirms in writing: the "2 overdue" items in EX-Q1-016 were audit-submission timeliness items, not CAP closures. Both CAP-Q1-002 and CAP-Q1-003 remain open per the CAP register.',
    workflowIds: ['GV-WF-07'],
  },
  {
    id: 'INJ-05', round: 3, releaseAfterNodeId: 'DN-08',
    title: 'Late Inject — Budget/Resourcing Request Filed',
    body: 'Management formally requests Board authorization of 0.5 FTE quality-review staffing and a documentation-audit tool license, stating both CAP-Q1-002 and CAP-Q1-003\'s own effectiveness criteria assume these resources are in place by next quarter close (EX-Q1-043).',
    workflowIds: ['GV-WF-07'],
  },
  {
    id: 'INJ-06', round: 4, releaseAfterNodeId: 'DN-12',
    title: 'Late Inject — Media Inquiry Received',
    body: 'A local news outlet requests comment within 48 hours regarding a patient-care incident already under internal review (EX-Q1-044); the underlying RCA (RCA-Q1-003, EX-Q1-018) is not yet complete.',
    workflowIds: ['GV-WF-13'],
  },
  {
    id: 'INJ-07', round: 5, releaseAfterNodeId: 'DN-16',
    title: 'Monitor Inject — Q2 Meeting Calendar Confirmed',
    body: 'The Clinical Manager confirms the Q2 quarterly meeting date is 2026-07-10, consistent with EX-Q1-001. Every return-to-Board item set tonight (PIP-Q1-004, PIP-Q1-006, the interpreter-services compliance update) will be due at that meeting.',
    workflowIds: [],
  },
];

// ---------------------------------------------------------------------------
// Surveyor & transfer mini-assessment
// ---------------------------------------------------------------------------

const SURVEYOR: SurveyorQuestion[] = [
  {
    id: 'SQ-01',
    prompt: 'A surveyor asks: "Show me the record proving the Q1 feeder audits were complete before the Governing Body package deadline."',
    options: [
      { id: 'SQ-01-A', text: 'EX-Q1-001 — the meeting control record (feeder-audit deadline 2026-04-02, GB package deadline 2026-04-02)' },
      { id: 'SQ-01-B', text: 'EX-Q1-002 — the QAPI Committee attendance/quorum record' },
      { id: 'SQ-01-C', text: 'EX-Q1-006 — the packet readiness confirmation' },
      { id: 'SQ-01-D', text: 'EX-Q1-004 — the required packet sign-offs' },
    ],
    correctId: 'SQ-01-A',
    requiresEvidenceIds: ['EX-Q1-001'],
  },
  {
    id: 'SQ-02',
    prompt: 'A surveyor asks: "Show me the record establishing the wound-infection PIP trigger was based on a documented multi-clinician cluster, not a single incident."',
    options: [
      { id: 'SQ-02-A', text: 'EX-Q1-013 — the feeder audit documenting 4 infections across 3 clinicians' },
      { id: 'SQ-02-B', text: 'EX-Q1-020 — the line list of 4 already-resolved wound infections' },
      { id: 'SQ-02-C', text: 'EX-Q1-017 — the CHF adverse event' },
      { id: 'SQ-02-D', text: 'EX-Q1-010 — the hospitalization rate, within target' },
    ],
    correctId: 'SQ-02-A',
    requiresEvidenceIds: ['EX-Q1-013'],
  },
  {
    id: 'SQ-03',
    prompt: 'A surveyor asks: "Show me the Governing Body\'s own escalation-log entry for the interpreter-failure complaint."',
    options: [
      { id: 'SQ-03-A', text: 'EX-Q1-005 — the GB escalation record naming the interpreter complaint as one of 4 items escalated' },
      { id: 'SQ-03-B', text: 'EX-Q1-022 — the complaint record itself' },
      { id: 'SQ-03-C', text: 'EX-Q1-023 — a different, non-escalated complaint' },
      { id: 'SQ-03-D', text: 'EX-Q1-030 — the underlying PIP trigger for complaint communication trends' },
    ],
    correctId: 'SQ-03-A',
    requiresEvidenceIds: ['EX-Q1-005'],
  },
  {
    id: 'SQ-04',
    prompt: 'A surveyor asks: "Show me the record showing the sepsis adverse event\'s RCA remained open, not closed, as of the Q1 meeting."',
    options: [
      { id: 'SQ-04-A', text: 'EX-Q1-017 — the CHF adverse event, RCA complete' },
      { id: 'SQ-04-B', text: 'EX-Q1-018 — the sepsis adverse event, RCA In Progress' },
      { id: 'SQ-04-C', text: 'EX-Q1-021 — the sepsis infection line list alone' },
      { id: 'SQ-04-D', text: 'EX-Q1-036 — the linked disciplinary matter alone' },
    ],
    correctId: 'SQ-04-B',
    requiresEvidenceIds: ['EX-Q1-018'],
  },
  {
    id: 'SQ-05',
    prompt: 'A surveyor asks: "Show me the record proving the doc-to-claim mismatch finding already had a voluntary refund initiated."',
    options: [
      { id: 'SQ-05-A', text: 'EX-Q1-015 — the feeder audit documenting the $1,200 overpayment and voluntary refund' },
      { id: 'SQ-05-B', text: 'EX-Q1-014 — the doc-to-claim mismatch finding alone, with no refund detail' },
      { id: 'SQ-05-C', text: 'EX-Q1-031 — the PIP trigger record alone' },
      { id: 'SQ-05-D', text: 'EX-Q1-039 — the billing-alignment CAP' },
    ],
    correctId: 'SQ-05-A',
    requiresEvidenceIds: ['EX-Q1-015'],
  },
  {
    id: 'SQ-06',
    prompt: 'A surveyor asks: "Show me the record establishing the Governing Body\'s own board-level quorum for tonight\'s meeting, as distinct from the QAPI Committee\'s."',
    options: [
      { id: 'SQ-06-A', text: 'EX-Q1-003 — the Governing Body attendance & quorum record (7 seats, 1 vacant, 6 present)' },
      { id: 'SQ-06-B', text: 'EX-Q1-002 — the QAPI Committee\'s own attendance/quorum record' },
      { id: 'SQ-06-C', text: 'EX-Q1-004 — the packet sign-offs' },
      { id: 'SQ-06-D', text: 'EX-Q1-045 — the board roster change record alone' },
    ],
    correctId: 'SQ-06-A',
    requiresEvidenceIds: ['EX-Q1-003'],
  },
];

const TRANSFERS: TransferQuestion[] = [
  {
    id: 'TQ-01',
    changedFacts: [
      'Suppose 5 of the 7 board seats were present tonight (not 6), with 2 directors recused from a different, unrelated matter (not the vendor COI).',
    ],
    prompt: 'Is general quorum still met, and how many eligible voters remain for that unrelated matter?',
    options: [
      { id: 'TQ-01-A', text: 'General quorum (majority of 6 seated-eligible = 4) is still met with 5 present; for the unrelated matter, the 2 recused directors are removed from that matter\'s denominator, leaving 3 eligible voters — still enough to meet a 3-vote majority-of-that-denominator threshold only if no further recusal occurs.' },
      { id: 'TQ-01-B', text: 'Quorum is automatically lost whenever any director recuses from any matter, regardless of how many remain present and eligible.' },
    ],
    correctId: 'TQ-01-A',
    rationale: 'The controlling principle is recomputing the eligible-voter denominator for the SPECIFIC matter after recusals, not assuming any recusal breaks quorum outright.',
  },
  {
    id: 'TQ-02',
    changedFacts: [
      'Suppose PIP-Q1-004 had scored 96% in every month of Q1 instead of 72-79%, but this is still its first (baseline) quarter.',
    ],
    prompt: 'Would PIP-Q1-004 be eligible for closure this quarter under those changed facts?',
    options: [
      { id: 'TQ-02-A', text: 'No — regardless of how favorable a single quarter\'s numbers are, the approved sustainability criterion requires two consecutive qualifying quarters, which cannot exist after only one.' },
      { id: 'TQ-02-B', text: 'Yes — a fully passing baseline quarter is sufficient on its own to authorize closure.' },
    ],
    correctId: 'TQ-02-A',
    rationale: 'The transfer tests whether the learner generalized "two consecutive qualifying quarters required" or over-generalized to "any single good quarter is enough," which would misapply the sustainability standard.',
  },
  {
    id: 'TQ-03',
    changedFacts: [
      'Suppose the wound-infection cluster had involved only 1 clinician instead of 3, with the same infection rate.',
    ],
    prompt: 'Does that change how the Board should weigh the finding?',
    options: [
      { id: 'TQ-03-A', text: 'Yes — a single-clinician pattern is still a real risk but points more toward an individual performance/competency response; the 3-clinician spread in the actual Q1 case is specifically what supports treating it as a systemic, agency-wide protocol gap requiring a PIP/CAP response.' },
      { id: 'TQ-03-B', text: 'No — the rate alone determines the response regardless of how many clinicians are involved.' },
    ],
    correctId: 'TQ-03-A',
    rationale: 'The transfer tests whether the learner understood WHY the multi-clinician spread mattered (it is the systemic signal), not just memorized "wound infection = PIP."',
  },
  {
    id: 'TQ-04',
    changedFacts: [
      'Suppose the unauthorized documentation-change matter (DISC-TRIG-Q1-004) involved a non-clinical administrative employee altering a billing record, rather than a clinician altering a visit note.',
    ],
    prompt: 'Does the Board\'s authority boundary change in that scenario?',
    options: [
      { id: 'TQ-04-A', text: 'No — the same board-directs-system/management-executes-individual-action boundary applies regardless of whether the employee is clinical or administrative.' },
      { id: 'TQ-04-B', text: 'Yes — a non-clinical employee\'s discipline is an operational matter the Board may order directly, unlike a clinician\'s.' },
    ],
    correctId: 'TQ-04-A',
    rationale: 'The authority boundary attaches to the Board\'s own governance role, not to whether the underlying employee happens to be clinical or administrative.',
  },
];

// ---------------------------------------------------------------------------
// CasePack
// ---------------------------------------------------------------------------

const REQUIRED_WORKFLOWS: GvWorkflowId[] = [
  'GV-WF-01', 'GV-WF-02', 'GV-WF-05', 'GV-WF-06', 'GV-WF-07', 'GV-WF-08', 'GV-WF-09', 'GV-WF-13',
];

export const Q1_CASE_PACK: CasePack = {
  id: 'tabletop2026-q1',
  quarter: 'Q1',
  title: 'Q1 2026 — Baseline Under Pressure',
  subtitle: 'Every one of this quarter\'s risks is new — that is a reason to get the record right from the start, not a reason to wait and see.',
  estMinutes: 105,
  sourceCutoff: '2026-04-09',
  exhibits: EXHIBITS,
  packetConflictGroups: Q1_PACKET_CONFLICT_GROUPS,
  decisionNodes: DECISION_NODES,
  injects: INJECTS,
  surveyor: SURVEYOR,
  transfers: TRANSFERS,
  requiredWorkflows: REQUIRED_WORKFLOWS,
  passScore: 950,
  passStandardNote: 'Quarterly pass requires >=950/1000 with zero critical errors. Critical failures in this case include: approving the packet on an assumed-resolved CAP status; treating a CAP\'s mere existence, or a favorable single baseline month, as sufficient for PIP closure; ignoring a documented multi-clinician wound-infection cluster linked to a hospitalization; directing a named individual\'s discipline as a Board action; disclosing restricted personnel or clinical detail in public session or to the media ahead of RCA completion; and recording real names in place of this system\'s de-identified reference convention, even in confidential minutes. Because this is the baseline quarter, "no later-quarter evidence" is enforced as: nothing dated in Q2 2026 (2026-04-01) or later may be treated as an already-settled fact — forward dates set tonight (a CAP due date, a PIP return date) are commitments, not completions.',
};

export default Q1_CASE_PACK;
