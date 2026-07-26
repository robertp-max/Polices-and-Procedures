// FY2026 capstone CasePack — "Annual 2026 — The Year the Board Must Defend".
//
// Reconciles Q1 (baseline QAPI findings), Q2 (the quarter that proves or
// disproves Q1's sustainability claims and surfaces two cross-quarter data-
// quality defects), and Q3/Q4 (normalization-pending in the source fixture —
// see ../../qapi/data/qapi2026.normalized.ts, where Q3/Q4 are stub
// `pendingQuarter()` records with zero recovered evidence). Because the real
// fixture has no recovered Q3/Q4 records, this case treats the Q3 "growth"
// and Q4 "claims" period as management-reported narrative only (posture
// 'unresolved', clearly labeled) rather than fabricating recovered evidence
// that does not exist upstream — consistent with the annual.note warning in
// QAPI_2026: "Zero open PIPs must never be read as zero remaining risk while
// CAPs/complaints/disciplinary matters remain open."
//
// Every one of the 14 GV-WF workflows is activated by at least one decision
// node (see the coverage map at the bottom of this file). At least five
// distinct cross-quarter traps are built in (identity collision, census
// discontinuity, PIP-sustainability-not-met, aggregate-masks-subgroup, and
// Q3/Q4 pending-normalization-treated-as-recovered) — see CROSS_QUARTER_TRAPS.
//
// Read before authoring: ../engine/caseTypes.ts, ./qapi2026Supplemental.ts,
// ./workflowCoverage.ts, ../../qapi/data/qapi2026.normalized.ts (via
// ./qapi2026Normalized.ts). Only this one data file is authored here.
//
// SYNTHETIC UAT DATA — NO REAL PHI — NOT FOR PRODUCTION.

import type {
  CasePack,
  DecisionNode,
  Exhibit,
  Inject,
  SurveyorQuestion,
  TransferQuestion,
} from '../engine/caseTypes';
import { ANNUAL_PASS_SCORE } from '../engine/caseTypes';
import { requiredForAnnual } from './workflowCoverage';
import {
  GB_SUP_ROSTER_2026,
  GB_SUP_COI_001,
  GB_SUP_ADM_001,
  GB_SUP_CM_001,
  GB_SUP_BUDGET_001,
  GB_SUP_SCOPE_001,
  GB_SUP_LIC_001,
  GB_SUP_CHOW_001,
  GB_SUP_MEDIA_001,
  GB_SUP_TRAIN_001,
  GB_SUP_PACKET_001,
  GB_SUP_PHI_001,
  toExhibit,
} from './qapi2026Supplemental';
import { ANNUAL_PACKET_CONFLICT_GROUPS } from './packetConflictGroups';

// ---------------------------------------------------------------------------
// Reusable exhibit-face labels for non-recovered postures
// ---------------------------------------------------------------------------

const CALCULATED_LABEL =
  'CALCULATED DATA-QUALITY FINDING — DERIVED BY CROSS-QUARTER RECONCILIATION, NOT A DIRECT SOURCE RECORD.';

const Q3Q4_PENDING_LABEL =
  'Q3/Q4 NORMALIZATION PENDING — MANAGEMENT-REPORTED SNAPSHOT, NOT YET BOARD-VALIDATED QAPI EVIDENCE.';

const STALE_PRIOR_PERIOD_LABEL =
  'STALE / PRIOR-PERIOD RECORD — DOES NOT DESCRIBE FY2026 EVIDENCE — LIKELY MISFILED.';

const UNADOPTED_DRAFT_LABEL =
  'DRAFT / UNADOPTED — NOT BOARD-APPROVED — MUST NOT BE TREATED AS AUTHORIZING ACTION.';

const EXTERNAL_NONRECORD_LABEL =
  'EXTERNAL / UNOFFICIAL MATERIAL — NOT AN AGENCY QAPI OR GOVERNANCE RECORD.';

const SYNTHETIC_MOTION_LABEL =
  'SYNTHETIC SUPPLEMENT — SOURCE HAS NO GB MOTION/VOTE/DIRECTIVE RECORD FOR GB-Q1-001 — NOT APPROVED FOR PRODUCTION — AUTHORED SOLELY TO EXERCISE THE DECISION-COMPOSER WORKFLOW.';

// ---------------------------------------------------------------------------
// Exhibits — the Board Book
// ---------------------------------------------------------------------------

const Q1_EXHIBITS: Exhibit[] = [
  {
    id: 'EX-Q1-MEETING', sourceId: 'Q1-MEETING-CONTROL', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PACKET-READINESS'],
    relevance: 'decision_relevant', section: 'Q1 — Meeting Control',
    title: 'Q1 QAPI Committee Meeting Control Record',
    summary: 'Meeting control record for the Q1 quarterly QAPI committee review under QA-WF-03.',
    details: [
      'Meeting date 2026-04-09; agenda deadline 2026-04-06; feeder-audit deadline 2026-04-02; GB package deadline 2026-04-02.',
      'Minutes due 2026-04-16, owner Clinical Manager. Policy basis: QA-PG-001, QA-PG-002, GV-GB-001.',
      'Required sign-offs: Administrator, Clinical Manager, QAPI Committee Chair (see EX-Q1-SIGNOFF).',
    ],
  },
  {
    id: 'EX-Q1-POPULATION', sourceId: 'Q1-POPULATION', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-05'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Population',
    title: 'Q1 Population Summary',
    summary: 'Active census grew 105 to 120 across Q1; 127 episodes tracked.',
    details: [
      'Active at start 105; active at close 120; new SOC 22; discharged 14; transferred 3.',
      '127 episodes tracked; 5 hospitalizations; 3 ED visits without hospitalization; 28 clinicians.',
      'Q1 close figure (120) is the number Q2’s opening census must reconcile against — see EX-DQ-002.',
    ],
  },
  {
    id: 'EX-Q1-QM-OASIS', sourceId: 'QM-Q1-001..003', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — Quality Metrics',
    title: 'OASIS Accuracy Rate — Q1',
    summary: 'Below the 90% target every month of Q1; PIP-trigger flagged.',
    details: ['Target ≥90%. Jan 82.2% (74/90), Feb 83.7% (77/92), Mar 84.2% (80/95).', 'Status: below target; pipTrigger true.'],
  },
  {
    id: 'EX-Q1-QM-DOCTIME', sourceId: 'QM-Q1-004..006', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — Quality Metrics',
    title: 'Visit Documentation Timeliness (<24h) — Q1',
    summary: 'Below the 95% target every month of Q1.',
    details: ['Target ≥95%. Jan 85.6% (101/118), Feb 86.7% (104/120), Mar 86.9% (106/122).', 'Status: below target; pipTrigger true.'],
  },
  {
    id: 'EX-Q1-QM-MEDREC', sourceId: 'QM-Q1-007..009', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Quality Metrics',
    title: 'Medication Reconciliation at SOC/ROC — Q1 (PIP-Q1-004 Baseline)',
    summary: 'Critical shortfall against the 95% target; this is the baseline the med-rec PIP must beat for two consecutive quarters.',
    details: ['Target ≥95%. Jan 72.7% (16/22), Feb 78.3% (18/23), Mar 79.2% (19/24).', 'Status: critical; PIP-Q1-004 initiated on this baseline (see EX-Q1-PIP-004).'],
  },
  {
    id: 'EX-Q1-QM-POC', sourceId: 'QM-Q1-010..012', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — Quality Metrics',
    title: 'POC Goal Documentation Completeness — Q1',
    summary: 'Below the 92% target all three months.',
    details: ['Target ≥92%. Jan 80.0% (88/110), Feb 80.4% (90/112), Mar 80.0% (92/115).', 'Status: below target; pipTrigger true.'],
  },
  {
    id: 'EX-Q1-QM-MISSEDVISIT', sourceId: 'QM-Q1-013..015', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — Quality Metrics',
    title: 'Missed Visit Rate — Q1',
    summary: 'Critical — more than double the 2% ceiling every month.',
    details: ['Target ≤2%. Jan 3.8% (7/185), Feb 4.2% (8/190), Mar 4.6% (9/195).', 'Status: critical; pipTrigger true.'],
  },
  {
    id: 'EX-Q1-QM-HOSP', sourceId: 'QM-Q1-016..018', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — Quality Metrics',
    title: 'Hospitalization Rate — Q1',
    summary: 'Within the 3% target every month; no trigger.',
    details: ['Target ≤3%. Jan 1.9% (2/105), Feb 1.8% (2/112), Mar 0.8% (1/118).', 'Status: within target; pipTrigger false.'],
  },
  {
    id: 'EX-Q1-QM-WOUND', sourceId: 'QM-Q1-019..021', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'calculated', confidentiality: 'public', validationState: 'conflicting',
    workflowIds: ['GV-WF-06', 'GV-WF-08'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Quality Metrics',
    title: 'Wound Infection Rate — Q1 (PIP-Q1-006 Baseline)',
    summary: 'Monthly numerator/denominator ambiguous in the concatenated source; quarter status recovered as a critical PIP-trigger spike.',
    sourceLabel: 'DERIVED FROM SOURCE — MEDIUM CONFIDENCE — MONTHLY NUMERATOR/DENOMINATOR AMBIGUOUS; QUARTER-CLOSE STATUS RECOVERED FROM QM-Q1-020/021.',
    details: [
      'Target ≤5%. Monthly rate points recovered: Jan 0.7%, Feb 3.3%, Mar 2.9% — but quarter-close status is recovered as a 10–13% critical spike per QM-Q1-020/021 (see PIP-TRIG-Q1-006).',
      'Status: critical; pipTrigger true; this is the baseline PIP-Q1-006 must beat for two consecutive quarters in every named wound stratum.',
    ],
  },
  {
    id: 'EX-Q1-QM-COMPLAINT', sourceId: 'QM-Q1-022..024', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Quality Metrics',
    title: 'Complaint Resolution Timeliness (≤5 days) — Q1',
    summary: 'Critical shortfall against the 90% target; feeds PIP-TRIG-Q1-007.',
    details: ['Target ≥90%. Jan 66.7% (4/6), Feb 71.4% (5/7), Mar 62.5% (5/8).', 'Status: critical; pipTrigger true.'],
  },
  {
    id: 'EX-Q1-AUD-CL008', sourceId: 'AUD-Q1-CL-008', quarter: 'Q1', asOfDate: '2026-04-02',
    posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
    workflowIds: ['GV-WF-06', 'GV-WF-08'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Feeder Audits',
    title: 'Feeder Audit — Clinical Quality (Wound Cluster)',
    summary: 'Complete audit identifying a wound-infection cluster across three clinicians.',
    details: [
      'Workflow CL-WF-33; reviewer MOCK-CLIN-0017; status Complete; signed by MOCK-CLIN-0027 on 2026-04-02.',
      'Key finding: wound infection cluster — 4 infections in February across 3 clinicians.',
    ],
  },
  {
    id: 'EX-Q1-AUD-CO005', sourceId: 'AUD-Q1-CO-005', quarter: 'Q1', asOfDate: '2026-04-01',
    posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
    workflowIds: ['GV-WF-07'], formIds: [], relevance: 'contextual', section: 'Q1 — Feeder Audits',
    title: 'Feeder Audit — Compliance/Billing',
    summary: 'Overpayment identified and voluntarily refunded before Board review.',
    details: ['Workflow CO-WF-27; reviewer/signer MOCK-CLIN-0025; signed 2026-04-01.', 'Key finding: overpayment of $1,200 identified — voluntary refund initiated.'],
  },
  {
    id: 'EX-Q1-AE-001', sourceId: 'AE-Q1-001', quarter: 'Q1', asOfDate: '2026-01-18',
    posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
    workflowIds: ['GV-WF-08'], formIds: ['GB-FORM-RCA-ESCALATION'], relevance: 'decision_relevant', section: 'Q1 — Adverse Events & RCA',
    title: 'Adverse Event — CHF Exacerbation Hospitalization',
    summary: 'RCA complete; systemic escalation-protocol root cause identified.',
    details: [
      'Event date 2026-01-18; severity High; RCA-Q1-001 complete.',
      'RCA findings: missed weight-gain documentation; delayed escalation. Systemic root cause: escalation protocol adherence.',
      'Status: RCA Complete — CAP assigned. Personnel matter kept separate from the systemic RCA.',
    ],
  },
  {
    id: 'EX-Q1-AE-004', sourceId: 'AE-Q1-004', quarter: 'Q1', asOfDate: '2026-03-03',
    posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
    workflowIds: ['GV-WF-08', 'GV-WF-09'], formIds: ['GB-FORM-RCA-ESCALATION'], relevance: 'decision_relevant', section: 'Q1 — Adverse Events & RCA',
    title: 'Adverse Event — Sepsis Hospitalization (Patient-Safety Escalation)',
    summary: 'Critical severity; RCA in progress; linked to a separated personnel matter (EX-Q1-DISC-005).',
    details: [
      'Event date 2026-03-03; severity Critical; RCA-Q1-003 in progress.',
      'RCA findings: infection signs present on a prior visit note but not escalated for 36 hours. Systemic root cause: escalation/reporting chain failure.',
      'Linked CAP-Q1-003. Personnel matter kept separate from the systemic RCA per policy. Restricted patient reference on file — executive-session/exhibit surfaces only.',
    ],
  },
  {
    id: 'EX-Q1-INF-005', sourceId: 'INF-Q1-005', quarter: 'Q1', asOfDate: '2026-03-02',
    posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
    workflowIds: ['GV-WF-08'], formIds: [], relevance: 'contextual', section: 'Q1 — Infections',
    title: 'Infection — Sepsis Secondary to Wound',
    summary: 'Onset 2026-03-02; still under investigation; linked to AE-Q1-004.',
    details: ['Onset 2026-03-02; resolution not yet recorded.', 'Intervention: hospitalized; RCA initiated (AE-Q1-004). Status: Under Investigation.'],
  },
  {
    id: 'EX-Q1-COMP-005', sourceId: 'COMP-Q1-005', quarter: 'Q1', asOfDate: '2026-03-07',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06', 'GV-WF-09'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Complaints',
    title: 'Complaint — Interpreter Not Arranged',
    summary: 'Communication failure; escalated to the Governing Body.',
    details: ['Filed 2026-03-07; 12 days to resolve (exceeds the 5-day standard).', 'Status: Closed — escalated to Governing Body (see EX-Q1-GBESC-001).'],
  },
  {
    id: 'EX-Q1-COMP-006', sourceId: 'COMP-Q1-006', quarter: 'Q1', asOfDate: '2026-03-22',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — Complaints',
    title: 'Complaint — HHA Scheduling Late Arrivals',
    summary: 'Scheduling complaint; CAP initiated; not escalated to GB.',
    details: ['Filed 2026-03-22; not resolved within 5 days.', 'Status: Open — CAP initiated.'],
  },
  {
    id: 'EX-Q1-TRIG-004', sourceId: 'PIP-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — PIP Triggers',
    title: 'PIP Trigger — Medication Reconciliation Gap',
    summary: 'Critical systemic process gap; initiated PIP-Q1-004.',
    details: ['Severity Critical. Finding: med rec 72–79% vs ≥95% target — systemic process gap. Policy basis QA-PG-001.', 'Recommended action: PIP. Status: Active — PIP-Q1-004 initiated.'],
  },
  {
    id: 'EX-Q1-TRIG-006', sourceId: 'PIP-TRIG-Q1-006', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06', 'GV-WF-08'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — PIP Triggers',
    title: 'PIP Trigger — Wound Infection Surveillance Spike',
    summary: 'Critical spike across three clinicians, linked to a sepsis event; initiated PIP-Q1-006.',
    details: ['Severity Critical. Finding: wound infection 10–13% vs ≤5% target; repeat infections across 3 clinicians; sepsis event.', 'Recommended action: PIP + infection-control protocol review. Status: Active — PIP-Q1-006 initiated.'],
  },
  {
    id: 'EX-Q1-TRIG-007', sourceId: 'PIP-TRIG-Q1-007', quarter: 'Q1', asOfDate: '2026-03-31',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q1 — PIP Triggers',
    title: 'PIP Trigger — Complaint/Grievance Communication Trend',
    summary: 'Three of six Q1 complaints were communication failures; initiated PIP-Q1-007.',
    details: ['Severity Critical. Finding: 3 of 6 Q1 complaints are communication failures; resolution timeliness 62–67% vs ≥90%.', 'Recommended action: PIP. Status: Active — PIP-Q1-007 initiated.'],
  },
  {
    id: 'EX-Q1-PIP-004', sourceId: 'PIP-Q1-004', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-AUTHORIZATION'], relevance: 'decision_relevant', section: 'Q1 — PIPs',
    title: 'PIP-Q1-004 — Medication Reconciliation Improvement',
    summary: 'Baseline 79.2%; sustainability requires two consecutive quarters at or above 95%.',
    details: [
      'Baseline: Q1 close 79.2% (target ≥95%). Approved objective: ≥95% med rec at SOC/ROC.',
      'Sustainability criterion: two consecutive quarters ≥95%. Q1 evidence: baseline established; CAP-Q1-002 opened.',
      'Closure eligible: false. Return date: 2026-07-10.',
    ],
  },
  {
    id: 'EX-Q1-PIP-006', sourceId: 'PIP-Q1-006', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06', 'GV-WF-08'], formIds: ['GB-FORM-PIP-AUTHORIZATION'], relevance: 'decision_relevant', section: 'Q1 — PIPs',
    title: 'PIP-Q1-006 — Wound Infection Control',
    summary: 'Baseline spike 10–13%; sustainability requires two consecutive quarters ≤5% in every named stratum.',
    details: [
      'Baseline: Q1 spike to 10–13% (target ≤5%). Approved objective: ≤5% wound infection rate.',
      'Sustainability criterion: two consecutive quarters ≤5% in every named wound stratum. Q1 evidence: CAP-Q1-003 opened — protocol revision + in-service.',
      'Closure eligible: false. Return date: 2026-07-10.',
    ],
  },
  {
    id: 'EX-Q1-CAP-002', sourceId: 'CAP-Q1-002', quarter: 'Q1', asOfDate: '2026-04-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'], relevance: 'decision_relevant', section: 'Q1 — CAPs',
    title: 'CAP-Q1-002 — Med Rec Protocol Re-Education',
    summary: 'Open; owner MOCK-CLIN-0027; effectiveness not yet demonstrated.',
    details: ['Description: med rec protocol re-education + checklist at SOC/ROC. Owner MOCK-CLIN-0027. Due 2026-04-30.', 'Status: Open. Effectiveness demonstrated: false. Source trigger: PIP-TRIG-Q1-004.'],
  },
  {
    id: 'EX-Q1-CAP-003', sourceId: 'CAP-Q1-003', quarter: 'Q1', asOfDate: '2026-04-23',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-07', 'GV-WF-08'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'], relevance: 'decision_relevant', section: 'Q1 — CAPs',
    title: 'CAP-Q1-003 — Wound Infection Protocol Revision',
    summary: 'Open; owner MOCK-CLIN-0017; effectiveness not yet demonstrated.',
    details: ['Description: wound infection control protocol revision; mandatory in-service. Owner MOCK-CLIN-0017. Due 2026-04-23.', 'Status: Open. Effectiveness demonstrated: false. Source trigger: PIP-TRIG-Q1-006 + AE-Q1-004.'],
  },
  {
    id: 'EX-Q1-DISC-004', sourceId: 'DISC-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-03-20',
    posture: 'recovered', confidentiality: 'executive_session', validationState: 'validated',
    workflowIds: ['GV-WF-09'], formIds: ['GB-FORM-RESTRICTED-MATTER'], relevance: 'decision_relevant', section: 'Q1 — Restricted Personnel Matters',
    title: 'Restricted Personnel Matter — Unauthorized Documentation Change',
    summary: 'Critical severity; potential retroactive record alteration; under investigation.',
    details: [
      'Clinician reference MOCK-CLIN-0003. Severity Critical.',
      'Finding: a visit note was amended 11 days after entry with no documented reason or countersignature — potential retroactive alteration.',
      'Recommended action: suspension pending investigation. Status: Under Investigation.',
    ],
  },
  {
    id: 'EX-Q1-DISC-005', sourceId: 'DISC-TRIG-Q1-005', quarter: 'Q1', asOfDate: '2026-03-04',
    posture: 'recovered', confidentiality: 'executive_session', validationState: 'validated',
    workflowIds: ['GV-WF-09'], formIds: ['GB-FORM-RESTRICTED-MATTER'], relevance: 'decision_relevant', section: 'Q1 — Restricted Personnel Matters',
    title: 'Restricted Personnel Matter — Escalation-Chain Failure',
    summary: 'Critical severity; directly linked to the sepsis adverse event (EX-Q1-AE-004).',
    details: [
      'Clinician reference MOCK-CLIN-0004. Severity Critical.',
      'Finding: sepsis signs documented 2026-03-02 were not escalated for 36 hours before the patient was hospitalized (AE-Q1-004).',
      'Recommended action: immediate retraining + supervision. Status: RCA pending — disciplinary hold.',
    ],
  },
  {
    id: 'EX-Q1-GBESC-001', sourceId: 'GB-Q1-001', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-05', 'GV-WF-09'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — GB Escalations',
    title: 'GB Escalation — Q1 Summary',
    summary: 'Four items escalated from QAPI to the Governing Body.',
    details: ['Escalated: the sepsis case (AE-Q1-004), the interpreter-failure complaint (COMP-Q1-005), the OASIS-accuracy trend, and a documentation-to-claim mismatch finding.'],
  },
  {
    id: 'EX-Q1-SIGNOFF', sourceId: 'SGN-Q1-ADM-001, SGN-Q1-CM-001, SGN-Q1-CHAIR-001', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-05'], formIds: [], relevance: 'decision_relevant', section: 'Q1 — Sign-Offs',
    title: 'Q1 Required Sign-Offs',
    summary: 'All three required Q1 sign-offs are complete.',
    details: [
      'Administrator (MOCK-CLIN-0028) signed 2026-04-09.',
      'Clinical Manager (MOCK-CLIN-0027) signed 2026-04-09.',
      'QAPI Committee Chair (MOCK-CLIN-0026) signed 2026-04-09.',
    ],
  },
  {
    id: 'EX-Q1-SYN-MOTION', sourceId: 'SUPP-GB-MOTION-Q1-001', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'supplemental_uat', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: SYNTHETIC_MOTION_LABEL,
    workflowIds: ['GV-WF-05', 'GV-WF-09'], formIds: [], relevance: 'decoy', section: 'Q1 — GB Escalations',
    title: 'Synthetic GB Motion Shell — Q1 Escalations (UAT Supplement)',
    summary: 'A workflow-completeness placeholder — not a real Board decision record.',
    details: [
      'The source recovers the Q1 escalation (GB-Q1-001) but contains no actual motion/vote/directive record of the Board’s decision on it (see EX-DQ-003).',
      'This shell exists only to exercise the decision-composer workflow in UAT. It must never be cited as if the Board actually voted through it — doing so is an evidence-integrity critical failure.',
    ],
  },
];

const DQ_EXHIBITS: Exhibit[] = [
  {
    id: 'EX-DQ-001', sourceId: 'DQ-2026-001', quarter: 'Q2', asOfDate: '2026-07-10',
    posture: 'calculated', confidentiality: 'restricted', validationState: 'conflicting',
    sourceLabel: CALCULATED_LABEL, workflowIds: ['GV-WF-03', 'GV-WF-04'], formIds: [],
    relevance: 'decision_relevant', section: 'Data-Quality Findings',
    title: 'Data-Quality Finding — Clinician-ID Identity Collision',
    summary: 'The MOCK-CLIN-* roster is fully reassigned between Q1 and Q2 — the same raw IDs denote different people.',
    details: [
      'Q1 MOCK-CLIN-0027 = the Q1 Clinical Manager incumbent. Q2 MOCK-CLIN-0026 = a different person, also titled Clinical Manager.',
      'Q1 MOCK-CLIN-0028 = the Q1 Administrator incumbent. Q2 MOCK-CLIN-0029 = a different person, also titled Administrator.',
      'Required reviewer decision: approve a versioned alias/reconciliation table before any cross-quarter person-level analysis. Never merge on raw ID.',
    ],
  },
  {
    id: 'EX-DQ-002', sourceId: 'DQ-2026-002', quarter: 'Q2', asOfDate: '2026-07-10',
    posture: 'calculated', confidentiality: 'public', validationState: 'conflicting',
    sourceLabel: CALCULATED_LABEL, workflowIds: ['GV-WF-05'], formIds: [],
    relevance: 'decision_relevant', section: 'Data-Quality Findings',
    title: 'Data-Quality Finding — Census Discontinuity Q1→Q2',
    summary: 'Q1 closes at 120 active patients; Q2 opens at 100 — a 20-patient gap not explained by recorded Q2 activity.',
    details: [
      'Q1 active at close = 120 (EX-Q1-POPULATION). Q2 active at start = 100 (EX-Q2-POPULATION).',
      'The gap is not explained by Q2’s recorded discharges (18) or transfers (4).',
      'Required reviewer decision: confirm the true Q2 opening census; keep both recovered values on file until reconciled — do not silently average or pick one.',
    ],
  },
  {
    id: 'EX-DQ-003', sourceId: 'DQ-2026-003', quarter: 'Q1', asOfDate: '2026-04-09',
    posture: 'calculated', confidentiality: 'public', validationState: 'conflicting',
    sourceLabel: CALCULATED_LABEL, workflowIds: ['GV-WF-05', 'GV-WF-09'], formIds: [],
    relevance: 'decision_relevant', section: 'Data-Quality Findings',
    title: 'Data-Quality Finding — Missing Board Decision Record',
    summary: 'The source records the Q1 escalation but no motion/vote/directive record of the Board’s actual decision.',
    details: [
      'GB-Q1-001 escalation is present; no GB motion/vote record exists in source for it.',
      'The only available record is EX-Q1-SYN-MOTION, a labeled synthetic UAT supplement — treat it as a workflow-completeness placeholder, never as evidence a real vote occurred.',
    ],
  },
];

const Q2_EXHIBITS: Exhibit[] = [
  {
    id: 'EX-Q2-MEETING', sourceId: 'Q2-MEETING-CONTROL', quarter: 'Q2', asOfDate: '2026-07-10',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PACKET-READINESS'],
    relevance: 'decision_relevant', section: 'Q2 — Meeting Control',
    title: 'Q2 QAPI Committee Meeting Control Record',
    summary: 'Meeting control record for the Q2 quarterly QAPI committee review.',
    details: ['Meeting date 2026-07-10; agenda deadline 2026-07-07; feeder-audit deadline 2026-07-02; GB package deadline 2026-07-03.', 'Minutes due 2026-07-17, owner Clinical Manager.'],
  },
  {
    id: 'EX-Q2-POPULATION', sourceId: 'Q2-POPULATION', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'conflicting',
    workflowIds: ['GV-WF-05'], formIds: [], relevance: 'decision_relevant', section: 'Q2 — Population',
    title: 'Q2 Population Summary',
    summary: 'Opens at 100 active — does not reconcile with Q1’s close of 120 (see EX-DQ-002).',
    details: [
      'Active at start 100 (does NOT reconcile with Q1 close of 120). Active at close not recorded this quarter.',
      'New SOC 12; discharged 18; transferred 4; 112 episodes tracked; 7 hospitalizations; 30 clinicians.',
    ],
  },
  {
    id: 'EX-Q2-QM-HOSP', sourceId: 'QM-APR-001..JUN-001', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'conflicting',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'conflicting', section: 'Q2 — Quality Metrics',
    title: 'Acute Care Hospitalization Rate — Q2 (Aggregate Masks Subgroup)',
    summary: 'Within target — but this favorable aggregate masks a worsening subgroup this quarter.',
    details: [
      'Target ≤4%. Apr 3.1% (3/98), May 2.0% (2/99), Jun 2.0% (2/100). Status: within target.',
      'aggregateMasksSubgroup: true — this favorable number masks the worsening documentation/med-rec/complaint subgroup shown in EX-Q2-QM-OASIS, EX-Q2-QM-MEDREC, EX-Q2-QM-POC, and EX-Q2-QM-MISSEDVISIT. The correct board posture is to hold closure and direct further review, not to accept the aggregate as sufficient.',
    ],
  },
  {
    id: 'EX-Q2-QM-OASIS', sourceId: 'QM-APR-002..JUN-002', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q2 — Quality Metrics',
    title: 'OASIS Accuracy Rate — Q2',
    summary: 'Below target every month; part of the subgroup masked by the favorable hospitalization aggregate.',
    details: ['Target ≥90%. Apr 84.8% (78/92), May 82.0% (73/89), Jun 84.1% (74/88).', 'Status: below target.'],
  },
  {
    id: 'EX-Q2-QM-MEDREC', sourceId: 'QM-APR-005..JUN-005', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q2 — Quality Metrics',
    title: 'Medication Reconciliation at SOC/ROC — Q2 (Third Consecutive Below-Target Quarter)',
    summary: 'Worsening, not improving — directly disproves any claim that PIP-Q1-004 is ready for closure.',
    details: ['Target ≥95%. Apr 77.8% (14/18), May 73.3% (11/15), Jun 70.6% (12/17).', 'Status: critical — third consecutive quarter below target, and worsening month over month.'],
  },
  {
    id: 'EX-Q2-QM-POC', sourceId: 'QM-APR-004..JUN-004', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q2 — Quality Metrics',
    title: 'POC Documentation Completeness — Q2',
    summary: 'Below target and deteriorating.',
    details: ['Target ≥90%. Apr 83.7% (82/98), May 79.4% (77/97), Jun 77.1% (74/96).', 'Status: below target, deteriorating trend.'],
  },
  {
    id: 'EX-Q2-QM-MISSEDVISIT', sourceId: 'QM-APR-006..JUN-006', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decision_relevant', section: 'Q2 — Quality Metrics',
    title: 'Missed Visit Rate — Q2',
    summary: 'Below target and worsening.',
    details: ['Target ≤3%. Apr 3.2% (28/876), May 3.8% (34/892), Jun 4.5% (44/979).', 'Status: below target, worsening trend.'],
  },
  {
    id: 'EX-Q2-QM-SATISFACTION', sourceId: 'QM-APR-008..JUN-008', quarter: 'Q2', asOfDate: '2026-06-30',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q2 — Quality Metrics',
    title: 'Patient Satisfaction (Overall) — Q2',
    summary: 'Below target, declining month over month; no PIP trigger flagged in source.',
    details: ['Target ≥85%. Apr 82%, May 80%, Jun 79%.', 'Status: below target; pipTrigger false in source.'],
  },
  {
    id: 'EX-Q2-COMP-004', sourceId: 'MOCK-CMP-004', quarter: 'Q2', asOfDate: '2026-05-14',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q2 — Complaints',
    title: 'Complaint — 3 Consecutive Missed HHA Visits',
    summary: 'Open, under review; not escalated to GB.',
    details: ['Filed 2026-05-14. Status: Open — under review. escalatedToGb: false.'],
  },
  {
    id: 'EX-Q2-COMP-007', sourceId: 'MOCK-CMP-007', quarter: 'Q2', asOfDate: '2026-06-17',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'contextual', section: 'Q2 — Complaints',
    title: 'Complaint — RN Did Not Explain Med Change at SOC',
    summary: 'Open, coaching scheduled; not escalated to GB.',
    details: ['Filed 2026-06-17. Status: Open — coaching scheduled. escalatedToGb: false.'],
  },
  {
    id: 'EX-Q2-PIP-004-STATUS', sourceId: 'PIP-Q1-004 (Q2 carry-forward)', quarter: 'Q2', asOfDate: '2026-07-10',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-CLOSURE'], relevance: 'decision_relevant', section: 'Q2 — PIP Status',
    title: 'PIP-Q1-004 Q2 Status — Medication Reconciliation (Carry-Forward)',
    summary: 'Not improving; closure remains ineligible; return date reset to 2026-10-09.',
    details: [
      'Sustainability criterion: two consecutive quarters ≥95%. Q2 evidence: Jun med rec 70.6% — third consecutive quarter below target, NOT improving.',
      'Closure eligible: false. GB decision: none recorded. Return date: 2026-10-09.',
    ],
  },
];

const SUPPLEMENTAL_EXHIBITS: Exhibit[] = [
  toExhibit(GB_SUP_ROSTER_2026, {
    exhibitId: 'EX-SUP-ROSTER', quarter: 'Q1', section: 'Board Composition & Conflicts',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
  }),
  toExhibit(GB_SUP_COI_001, {
    exhibitId: 'EX-SUP-COI', quarter: 'Q2', section: 'Board Composition & Conflicts',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
  }),
  toExhibit(GB_SUP_ADM_001, {
    exhibitId: 'EX-SUP-ADM', quarter: 'Q2', section: 'Leadership Continuity',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-ADMINISTRATOR-CHANGE'],
  }),
  toExhibit(GB_SUP_CM_001, {
    exhibitId: 'EX-SUP-CM', quarter: 'Q2', section: 'Leadership Continuity',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-CLINICAL-MANAGER-CHANGE'],
  }),
  toExhibit(GB_SUP_BUDGET_001, {
    exhibitId: 'EX-SUP-BUDGET', quarter: 'Q2', section: 'Budget & CAP Resourcing',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
  }),
  toExhibit(GB_SUP_SCOPE_001, {
    exhibitId: 'EX-SUP-SCOPE', quarter: 'Q2', section: 'Scope & Licensure',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-SCOPE-CHANGE'],
  }),
  toExhibit(GB_SUP_LIC_001, {
    exhibitId: 'EX-SUP-LIC', quarter: 'Q1', section: 'Scope & Licensure',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-LICENSURE-RENEWAL'],
  }),
  toExhibit(GB_SUP_CHOW_001, {
    exhibitId: 'EX-SUP-CHOW', quarter: 'Q3', section: 'Change of Ownership',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-CHOW-NOTIFICATION'],
  }),
  toExhibit(GB_SUP_MEDIA_001, {
    exhibitId: 'EX-SUP-MEDIA', quarter: 'Q2', section: 'Media & Privacy',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-MEDIA-INCIDENT'],
  }),
  toExhibit(GB_SUP_TRAIN_001, {
    exhibitId: 'EX-SUP-TRAIN', quarter: 'Q1', section: 'Training & Attestation',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-TRAINING-ATTESTATION'],
  }),
  toExhibit(GB_SUP_PACKET_001, {
    exhibitId: 'EX-SUP-PACKET', quarter: 'Q2', section: 'Packet Readiness',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-PACKET-READINESS'],
  }),
  toExhibit(GB_SUP_PHI_001, {
    exhibitId: 'EX-SUP-PHI', quarter: 'Q2', section: 'Media & Privacy',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-BREACH-RESPONSE', 'GB-FORM-VENDOR-BAA'],
  }),
];

const Q3Q4_ANNUAL_EXHIBITS: Exhibit[] = [
  {
    id: 'EX-Q3-GROWTH-NOTE', sourceId: 'MGMT-Q3-GROWTH-SNAPSHOT', quarter: 'Q3', asOfDate: '2026-09-30',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: Q3Q4_PENDING_LABEL, workflowIds: ['GV-WF-05'], formIds: [],
    relevance: 'conflicting', section: 'Q3 — Growth (Normalization Pending)',
    title: 'Q3 Growth Snapshot — Normalization Pending',
    summary: 'Management reports continued census growth; this has not gone through the QAPI normalization pipeline.',
    details: [
      'Management-reported active census figure of approximately 135 by Q3 close — presented verbally at the Q3 committee touch-base, not through the normalized QAPI packet process.',
      'Per QAPI_2026.quarters.Q3.normalizationStatus, Q3 remains "pending": no feeder audits, adverse events, complaints, PIP triggers, or sign-offs have been normalized for this quarter.',
      'This snapshot must be treated as management-reported, not Board-validated. It cannot be used to certify Q3 quality performance or to support any Q3-based PIP or CAP determination.',
    ],
  },
  {
    id: 'EX-Q4-CLAIMS-NOTE', sourceId: 'MGMT-Q4-CLAIMS-SNAPSHOT', quarter: 'Q4', asOfDate: '2026-12-31',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: Q3Q4_PENDING_LABEL, workflowIds: ['GV-WF-05', 'GV-WF-07'], formIds: [],
    relevance: 'conflicting', section: 'Q4 — Claims (Normalization Pending)',
    title: 'Q4 Claims Audit Snapshot — Normalization Pending',
    summary: 'Management reports a possible documentation-to-claim mismatch pattern; not yet a Board-validated finding.',
    details: [
      'Management reports that an internal billing review flagged potential documentation-to-claim mismatches for a subset of Q4 dates of service, echoing the Q1 GB-Q1-001 escalation theme.',
      'Per QAPI_2026.quarters.Q4.normalizationStatus, Q4 remains "pending": no feeder audits, PIP triggers, CAPs, or sign-offs have been normalized for this quarter.',
      'Until normalized, this cannot be treated as a closed audit finding, cannot support a PIP-closure or CAP-effectiveness determination, and cannot be represented to a surveyor as validated Q4 evidence.',
    ],
  },
  {
    id: 'EX-ANNUAL-SUMMARY', sourceId: 'QAPI-2026-ANNUAL', quarter: 'FY2026', asOfDate: '2026-12-31',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: Q3Q4_PENDING_LABEL, workflowIds: ['GV-WF-05'], formIds: [],
    relevance: 'decision_relevant', section: 'Annual Synthesis',
    title: 'FY2026 Annual Normalization Status',
    summary: 'annualReportApproved is null; normalizationStatus is pending; carry-forward risk is explicitly not zero.',
    details: [
      'Census arc: "Q1 105→120; Q2 opens 100 (unreconciled). Full arc pending Q3/Q4 normalization."',
      'annual.normalizationStatus: pending. annual.annualReportApproved: null (not yet decided, not yet approved).',
      'Explicit annual note: "Zero open PIPs must never be read as zero remaining risk while CAPs/complaints/disciplinary matters remain open." Both PIP-Q1-004 and PIP-Q1-006 remain open with closure ineligible; CAP-Q1-002/003 remain open; DISC-TRIG-Q1-004/005 remain open.',
    ],
  },
];

const DECOY_EXHIBITS: Exhibit[] = [
  {
    id: 'EX-DECOY-01', sourceId: 'POLICY-QA-PG-001-EXCERPT', quarter: 'Q1', asOfDate: '2026-01-01',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decoy', section: 'Q1 — Quality Metrics',
    title: 'QA-PG-001 Policy Excerpt — General QAPI Program Description',
    summary: 'Boilerplate program-description language; not specific to any Q1 metric decision.',
    details: ['General description of the QAPI program’s purpose and annual cycle.', 'Contains no quarter-specific data and does not, by itself, resolve any Q1 metric or PIP question.'],
  },
  {
    id: 'EX-DECOY-02', sourceId: 'FY2025-DEC-MINUTES', quarter: 'Q1', asOfDate: '2025-12-15',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: STALE_PRIOR_PERIOD_LABEL, workflowIds: ['GV-WF-05'], formIds: [],
    relevance: 'decoy', section: 'Q1 — Meeting Control',
    title: 'Prior-Year Board Minutes (Filed in Error)',
    summary: 'Dated 2025-12-15 — predates the FY2026 period entirely.',
    details: ['Appears to have been misfiled into the Q1 2026 packet.', 'The source cutoff rule applies by date, not by which folder a record was filed in — this cannot be cited as FY2026 evidence.'],
  },
  {
    id: 'EX-DECOY-03', sourceId: 'DRAFT-POLICY-SCOPE-REV', quarter: 'Q2', asOfDate: '2026-05-01',
    posture: 'unresolved', confidentiality: 'public', validationState: 'provisional',
    sourceLabel: UNADOPTED_DRAFT_LABEL, workflowIds: ['GV-WF-10'], formIds: [],
    relevance: 'decoy', section: 'Scope & Licensure',
    title: 'Draft Scope-of-Services Policy Revision (Unadopted)',
    summary: 'Draft language expanding scope categories; not yet reviewed or approved.',
    details: ['Not yet reviewed or approved by the Board.', 'Must not be treated as authorizing any operational scope change — see EX-SUP-SCOPE for the actual pending proposal.'],
  },
  {
    id: 'EX-DECOY-04', sourceId: 'INDUSTRY-BENCHMARK-2026', quarter: 'Q2', asOfDate: '2026-06-01',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: EXTERNAL_NONRECORD_LABEL, workflowIds: ['GV-WF-06'], formIds: [],
    relevance: 'decoy', section: 'Q2 — Quality Metrics',
    title: 'National Home Health Hospitalization Benchmark',
    summary: 'National average cited for context only.',
    details: ['A national average acute-care hospitalization rate cited for context.', 'Does not substitute for this agency’s own quarter-specific, stratified evidence (EX-Q2-QM-HOSP and the masked subgroup exhibits).'],
  },
  {
    id: 'EX-DECOY-05', sourceId: 'PERF-REVIEW-CLIN-0031', quarter: 'Q1', asOfDate: '2026-03-15',
    posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
    workflowIds: ['GV-WF-09'], formIds: [], relevance: 'decoy', section: 'Q1 — Restricted Personnel Matters',
    title: 'Routine Clinician Performance Review (Unrelated)',
    summary: 'A favorable, routine annual review unrelated to either restricted matter.',
    details: ['Clinician reference MOCK-CLIN-0031 — not named in DISC-TRIG-Q1-004 or DISC-TRIG-Q1-005.', 'Included to test whether an unrelated favorable record gets mistaken for evidence bearing on the two open restricted matters.'],
  },
  {
    id: 'EX-DECOY-06', sourceId: 'VENDOR-EHR-BROCHURE', quarter: 'Q2', asOfDate: '2026-05-10',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: EXTERNAL_NONRECORD_LABEL, workflowIds: ['GV-WF-07'], formIds: [],
    relevance: 'decoy', section: 'Budget & CAP Resourcing',
    title: 'EHR Vendor Marketing Brochure',
    summary: 'Promotional material; not an evaluated procurement record.',
    details: ['Promotional brochure from a documentation-audit tool vendor.', 'Not an evaluated bid, contract, or BAA record for the CAP-Q1-002/003 resourcing decision (see EX-SUP-BUDGET).'],
  },
  {
    id: 'EX-DECOY-07', sourceId: 'CHOW-INQUIRY-2025-WITHDRAWN', quarter: 'Q1', asOfDate: '2025-11-01',
    posture: 'unresolved', confidentiality: 'restricted', validationState: 'unvalidated',
    sourceLabel: STALE_PRIOR_PERIOD_LABEL, workflowIds: ['GV-WF-12'], formIds: [],
    relevance: 'decoy', section: 'Change of Ownership',
    title: 'Prior Change-of-Ownership Inquiry (Withdrawn, 2025)',
    summary: 'An unrelated, withdrawn 2025 inquiry — not the 2026 transaction.',
    details: ['An unrelated ownership inquiry from 2025 that was withdrawn before any transaction occurred.', 'Does not describe the 2026 majority-equity transaction now before the Board (EX-SUP-CHOW).'],
  },
  {
    id: 'EX-DECOY-08', sourceId: 'BOARD-SELF-EVAL-2026', quarter: 'Q1', asOfDate: '2026-02-01',
    posture: 'recovered', confidentiality: 'public', validationState: 'validated',
    workflowIds: ['GV-WF-14'], formIds: [], relevance: 'decoy', section: 'Training & Attestation',
    title: 'Board Self-Evaluation Survey Summary',
    summary: 'General self-assessment survey; not a training-attestation record.',
    details: ['General board self-assessment survey results.', 'Informational only — does not satisfy or substitute for the GV-WF-14 annual training/attestation requirement (see EX-SUP-TRAIN).'],
  },
  {
    id: 'EX-DECOY-09', sourceId: 'PT-TESTIMONIAL-LETTER', quarter: 'Q2', asOfDate: '2026-06-05',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: 'SINGLE ANECDOTAL TESTIMONIAL — NOT AGGREGATE QAPI EVIDENCE.',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decoy', section: 'Q2 — Quality Metrics',
    title: 'Patient Satisfaction Testimonial Letter',
    summary: 'One favorable letter; does not override the aggregate decline.',
    details: ['One favorable patient letter.', 'Does not represent or override the aggregate Q2 patient-satisfaction decline shown in EX-Q2-QM-SATISFACTION.'],
  },
  {
    id: 'EX-DECOY-10', sourceId: 'SOCIAL-MEDIA-SCREENSHOT', quarter: 'Q2', asOfDate: '2026-06-23',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: 'UNVERIFIED PUBLIC SOCIAL-MEDIA POST — NOT A VERIFIED MEDIA OR REGULATOR CONTACT.',
    workflowIds: ['GV-WF-13'], formIds: [], relevance: 'decoy', section: 'Media & Privacy',
    title: 'Unverified Social-Media Post Referencing the Incident',
    summary: 'An anonymous post; not a verified press or regulator inquiry.',
    details: ['A screenshot of an anonymous social-media post referencing the incident under review.', 'Not a verified press or regulator inquiry (compare EX-SUP-MEDIA) and must not drive the Board’s response.'],
  },
  {
    id: 'EX-DECOY-11', sourceId: 'BOARD-MEMBER-LINKEDIN-POST', quarter: 'Q2', asOfDate: '2026-07-01',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: 'PERSONAL SOCIAL-MEDIA POST — NOT A QAPI RECORD.',
    workflowIds: ['GV-WF-06'], formIds: [], relevance: 'decoy', section: 'Q2 — Quality Metrics',
    title: 'Director’s Personal Social-Media Post Praising Quality Results',
    summary: 'A personal post; does not reflect the stratified subgroup pattern.',
    details: ['A director’s personal post celebrating a "great quarter."', 'Does not reflect or substitute for the stratified Q2 metrics showing the aggregate-masks-subgroup pattern (EX-Q2-QM-HOSP).'],
  },
  {
    id: 'EX-DECOY-12', sourceId: 'DRAFT-CAP-EFFECTIVENESS-MEMO', quarter: 'Q2', asOfDate: '2026-06-20',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: 'UNSIGNED DRAFT — NOT A COMPLETED EFFECTIVENESS DETERMINATION.',
    workflowIds: ['GV-WF-07'], formIds: [], relevance: 'decoy', section: 'Budget & CAP Resourcing',
    title: 'Unsigned Draft CAP Effectiveness Memo',
    summary: 'Unsigned draft asserting effectiveness; not a valid determination.',
    details: ['An unsigned draft asserting CAP-Q1-002 is "effective."', 'Lacks the required sign-off and is not a completed effectiveness determination under GB-FORM-CAP-EFFECTIVENESS.'],
  },
  {
    id: 'EX-DECOY-13', sourceId: 'COMPETITOR-ACHC-SURVEY-RESULT', quarter: 'Q2', asOfDate: '2026-05-15',
    posture: 'unresolved', confidentiality: 'public', validationState: 'unvalidated',
    sourceLabel: 'THIRD-PARTY BENCHMARK — NOT THIS AGENCY’S RECORD.',
    workflowIds: ['GV-WF-11'], formIds: [], relevance: 'decoy', section: 'Scope & Licensure',
    title: 'Competitor Agency Public ACHC Survey Result',
    summary: 'An unrelated agency’s result; irrelevant to this agency’s renewal.',
    details: ['A different, unrelated agency’s public survey outcome.', 'Irrelevant to this agency’s own pending license/accreditation renewal status (EX-SUP-LIC).'],
  },
];

const EXHIBITS: Exhibit[] = [
  ...Q1_EXHIBITS,
  ...DQ_EXHIBITS,
  ...Q2_EXHIBITS,
  ...SUPPLEMENTAL_EXHIBITS,
  ...Q3Q4_ANNUAL_EXHIBITS,
  ...DECOY_EXHIBITS,
];

// ---------------------------------------------------------------------------
// Decision nodes — the facilitated rounds
// ---------------------------------------------------------------------------

const DECISION_NODES: DecisionNode[] = [
  // ---- Round 0: pre-meeting intake ----------------------------------------
  {
    id: 'DN-01', matterId: 'M-PACKET-READY', round: 0,
    title: 'Classify the FY2026 Packet’s Evidentiary Basis',
    prompt: 'The Q1 escalation record (GB-Q1-001) and the synthetic motion shell (EX-Q1-SYN-MOTION) are both in this packet. How should the Board classify EX-Q1-SYN-MOTION for purposes of tonight’s review?',
    kind: 'classify_evidence',
    competencyIds: ['evidence-integrity'],
    workflowIds: ['GV-WF-05'],
    pointsAvailable: 30,
    options: [
      { id: 'A', text: 'Treat it as the Board’s actual recorded Q1 decision on GB-Q1-001 and proceed on that basis.', criticalFailure: true },
      { id: 'B', text: 'Treat it as a labeled synthetic UAT supplement only — the Board’s actual Q1 decision on GB-Q1-001 was never recorded, and that gap (EX-DQ-003) must be addressed on its own.', correct: true },
      { id: 'C', text: 'Ignore both records since the matter is a year old.', },
      { id: 'D', text: 'Ask staff to quietly backdate a real motion record to 2026-04-09 so the packet looks complete.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-SYN-MOTION', 'EX-DQ-003', 'EX-Q1-GBESC-001'],
    modelAction: 'B — classify as synthetic-supplement-only; direct that the Q1 GB-decision gap be corrected going forward, never backfilled.',
    rationale: 'A record labeled as a UAT supplement can never be relied upon as if it were the real governance record it stands in for; the correct response treats the gap itself as the finding.',
    alternativesWhyFail: [
      'A lets a placeholder pass as history, corrupting every downstream comparison to "what the Board actually decided" in Q1.',
      'D is falsification of the governance record — an automatic critical failure regardless of intent.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Packet classification must occur before any Q1-dependent decision this meeting relies on it.',
    consequences: {
      patientSafety: 'No direct patient-safety effect, but a corrupted decision record obscures whether real oversight occurred.',
      regulatory: 'Misrepresenting synthetic content as an official record is a survey and audit-defensibility failure.',
      financial: 'None directly.',
      privacy: 'None.',
      recordIntegrity: 'Central — this is the record-integrity gate for every other Q1 citation this meeting.',
    },
  },
  {
    id: 'DN-02', matterId: 'M-SOURCE-CUTOFF', round: 0,
    title: 'Set the Evidentiary Posture for Q3/Q4',
    prompt: 'EX-Q3-GROWTH-NOTE and EX-Q4-CLAIMS-NOTE both describe events in Q3/Q4, which QAPI_2026 marks normalizationStatus: "pending." What posture should the Board give this material tonight?',
    kind: 'multiple_choice',
    competencyIds: ['evidence-integrity', 'record-integrity'],
    workflowIds: ['GV-WF-05'],
    pointsAvailable: 30,
    options: [
      { id: 'A', text: 'Treat Q3/Q4 narrative as equivalent in strength to the recovered, normalized Q1/Q2 record because it is the most recent information available.', criticalFailure: true },
      { id: 'B', text: 'Treat Q3/Q4 narrative as management-reported and unvalidated; use it for situational awareness only, and direct that Q3/Q4 normalization be completed before any Q3/Q4-based closure or certification decision is made.', correct: true },
      { id: 'C', text: 'Disregard Q3/Q4 entirely and make no note of it in the record.', },
    ],
    requiredEvidenceIds: ['EX-Q3-GROWTH-NOTE', 'EX-Q4-CLAIMS-NOTE', 'EX-ANNUAL-SUMMARY'],
    modelAction: 'B — situational awareness only; normalization required before any closure/certification reliance.',
    rationale: 'Recency is not the same as validation; the source pipeline itself has not normalized Q3/Q4, so no Board decision this meeting may rest on it as if it had.',
    alternativesWhyFail: [
      'A inverts the evidentiary hierarchy the whole case is built on and will corrupt every Q3/Q4-adjacent decision later in the meeting.',
      'C is also wrong — silently disregarding a known risk signal is itself a governance failure; the correct posture is "note it, do not certify on it."',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS'],
    deadlineExplanation: 'This posture must be set before Round 6’s annual-closure vote, which directly depends on it.',
    consequences: {
      patientSafety: 'Certifying on unvalidated data could mask an emerging Q3/Q4 patient-safety trend.',
      regulatory: 'A surveyor asking "show me your Q3/Q4 evidence" will find none normalized — the Board’s posture must match that reality.',
      financial: 'Certifying claims-audit findings prematurely could misstate financial exposure.',
      privacy: 'None directly.',
      recordIntegrity: 'This decision anchors the entire annual-closure record.',
    },
  },

  // ---- Round 1: board composition & continuity ----------------------------
  {
    id: 'DN-03', matterId: 'M-ROSTER', round: 1,
    title: 'Select the Workflow(s) Triggered by the Roster Change',
    prompt: 'A community-member director’s term expired and a replacement is proposed (EX-SUP-ROSTER). Which workflow(s) does this trigger?',
    kind: 'workflow_select',
    competencyIds: ['record-integrity'],
    workflowIds: ['GV-WF-01'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'GV-WF-01 — Board Roster & Composition Change', correct: true },
      { id: 'B', text: 'GV-WF-12 — Change of Ownership (CHOW) Notification' },
      { id: 'C', text: 'GV-WF-03 — Administrator Appointment or Change' },
    ],
    requiredEvidenceIds: ['EX-SUP-ROSTER'],
    modelAction: 'A only.',
    rationale: 'A director seat expiring/being replaced is squarely the roster-and-composition workflow; it is not an ownership or Administrator event.',
    alternativesWhyFail: ['B and C are unrelated workflows whose triggers are not present in this record.'],
    formsRequired: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
    deadlineExplanation: 'Composition must be settled before any vote requiring the new seat to count toward quorum.',
    consequences: {
      patientSafety: 'None directly.',
      regulatory: 'An improperly composed Board can invalidate downstream votes.',
      financial: 'None directly.',
      privacy: 'None.',
      recordIntegrity: 'The roster-attestation record must reflect the seat change accurately.',
    },
  },
  {
    id: 'DN-04', matterId: 'M-ROSTER', round: 1,
    title: 'Select the Required Forms for the Roster Change',
    prompt: 'Which form(s) does the roster-and-composition workflow require here?',
    kind: 'forms_select',
    competencyIds: ['record-integrity'],
    workflowIds: ['GV-WF-01'],
    pointsAvailable: 20,
    options: [
      { id: 'A', text: 'GB-FORM-ROSTER-ATTEST', correct: true },
      { id: 'B', text: 'GB-FORM-DIRECTOR-APPOINTMENT', correct: true },
      { id: 'C', text: 'GB-FORM-CHOW-NOTIFICATION' },
    ],
    requiredEvidenceIds: ['EX-SUP-ROSTER'],
    modelAction: 'A and B.',
    rationale: 'Both the attestation of composition compliance and the new director’s appointment record are required.',
    alternativesWhyFail: ['C belongs to the unrelated CHOW workflow.'],
    formsRequired: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
    deadlineExplanation: 'Forms should be completed at the same meeting the seat change is approved.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'Missing appointment documentation is a survey finding.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'Appointment record must exist contemporaneously with the vote.',
    },
  },
  {
    id: 'DN-05', matterId: 'M-IDENTITY-TRAP', round: 1,
    title: 'Reconcile the Clinician-ID Identity Collision',
    prompt: 'EX-DQ-001 shows MOCK-CLIN-0028 = the Q1 Administrator and MOCK-CLIN-0029 = the Q2 Administrator. Before approving the Administrator-change motion (EX-SUP-ADM), how should the Board treat these IDs?',
    kind: 'reconcile_conflict',
    competencyIds: ['record-integrity', 'evidence-integrity'],
    workflowIds: ['GV-WF-03', 'GV-WF-04'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Treat MOCK-CLIN-0028 and MOCK-CLIN-0029 as the same individual since both hold the Administrator title, and proceed without further reconciliation.', criticalFailure: true },
      { id: 'B', text: 'Recognize these as different individuals (per DQ-2026-001), require a versioned alias/reconciliation table, and proceed with the Administrator-change motion on that corrected basis.', correct: true },
      { id: 'C', text: 'Refuse to consider the Administrator change at all until the entire prior-year clinician roster is re-audited.' },
    ],
    requiredEvidenceIds: ['EX-DQ-001', 'EX-SUP-ADM', 'EX-SUP-CM'],
    modelAction: 'B — different individuals; reconciliation table required before any cross-quarter merge; proceed on corrected basis.',
    rationale: 'The finding is explicit that raw IDs are reused for different people; merging on raw ID would misattribute Q1 performance/accountability to the wrong individual.',
    alternativesWhyFail: [
      'A directly contradicts the recovered finding and would misattribute Q1 conduct/performance to the wrong person going forward.',
      'C is disproportionate — the finding requires a reconciliation control, not a full work stoppage on an otherwise-routine leadership transition.',
    ],
    formsRequired: ['GB-FORM-ADMINISTRATOR-CHANGE', 'GB-FORM-CLINICAL-MANAGER-CHANGE'],
    deadlineExplanation: 'Must be resolved before the Board relies on any cross-quarter clinician-linked record this meeting.',
    consequences: {
      patientSafety: 'Misattributing accountability delays correcting the actual escalation-chain failure (DISC-TRIG-Q1-005).',
      regulatory: 'A surveyor tracing accountability by clinician ID would be misled without the reconciliation table.',
      financial: 'None directly.', privacy: 'Clinician-identity handling is a records-integrity concern, not a PHI concern here.',
      recordIntegrity: 'This is the central record-integrity trap of the case.',
    },
  },
  {
    id: 'DN-06', matterId: 'M-ADMIN-CHANGE', round: 1,
    title: 'Build the Administrator-Change Motion',
    prompt: 'Draft the motion the Board should adopt for the Administrator transition described in EX-SUP-ADM, consistent with the reconciliation finding in DN-05.',
    kind: 'motion_builder',
    competencyIds: ['record-integrity'],
    workflowIds: ['GV-WF-03'],
    pointsAvailable: 30,
    requiredEvidenceIds: ['EX-SUP-ADM', 'EX-DQ-001'],
    modelAction: 'Move to accept the incumbent Administrator’s resignation effective 2026-06-30 and approve the proposed interim Administrator, contingent on completed qualification verification and the required state licensure administrator-of-record update.',
    rationale: 'The motion must name the effective date, the contingency (qualification + licensure update), and the specific successor — a vague "approve the change" motion does not meet the form’s requirements.',
    alternativesWhyFail: [
      'A motion that omits the licensure administrator-of-record update leaves a regulatory gap unaddressed.',
      'A motion that treats the change as already complete before the state update is filed overstates what has actually occurred.',
    ],
    formsRequired: ['GB-FORM-ADMINISTRATOR-CHANGE'],
    deadlineExplanation: 'Should be adopted before the incumbent’s effective resignation date of 2026-06-30.',
    consequences: {
      patientSafety: 'An unfilled Administrator role risks operational oversight gaps.',
      regulatory: 'State licensure requires a current administrator-of-record on file.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'The motion is the governance record of this leadership transition.',
    },
  },
  {
    id: 'DN-07', matterId: 'M-CM-CHANGE', round: 1,
    title: 'Assign the Owner for the Clinical Manager Coverage Gap',
    prompt: 'EX-SUP-CM proposes a coverage-gap plan during the Clinical Manager transition. Who should the Board assign as owner of executing that plan?',
    kind: 'owner_assign',
    competencyIds: ['board-vs-management'],
    workflowIds: ['GV-WF-04'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'The incoming Clinical Manager, once seated, with the Administrator accountable for oversight of the transition.', correct: true },
      { id: 'B', text: 'A named individual Board director, who will personally manage day-to-day clinical coverage during the gap.', overreach: true },
      { id: 'C', text: 'No owner is needed — the coverage gap plan is self-executing.' },
    ],
    requiredEvidenceIds: ['EX-SUP-CM'],
    modelAction: 'A.',
    rationale: 'Execution of a coverage plan is a management function the Board holds management accountable for, not something the Board itself executes.',
    alternativesWhyFail: [
      'B has the Board directing day-to-day operations directly, which is outside its governance role.',
      'C leaves a known clinical-coverage risk with no accountable owner.',
    ],
    formsRequired: ['GB-FORM-CLINICAL-MANAGER-CHANGE'],
    deadlineExplanation: 'Owner should be named before the incumbent’s transfer effective date of 2026-06-15.',
    consequences: {
      patientSafety: 'An unowned coverage gap directly risks clinical oversight during the transition.',
      regulatory: 'A vacant, unmanaged Clinical Manager role is a licensure/staffing compliance risk.',
      financial: 'None directly.', privacy: 'None.',
      recordIntegrity: 'Ownership assignment must be recorded in the minutes.',
    },
  },
  {
    id: 'DN-08', matterId: 'M-CM-CHANGE', round: 1,
    title: 'Board Disposition on the Clinical Manager Change',
    prompt: 'What is the Board’s correct disposition on the Clinical Manager change proposal?',
    kind: 'disposition',
    competencyIds: ['board-vs-management'],
    workflowIds: ['GV-WF-04'],
    pointsAvailable: 20,
    options: [
      { id: 'A', text: 'Approve, contingent on the successor’s license/qualification being confirmed on file and the coverage-gap plan owner being named (DN-07).', correct: true },
      { id: 'B', text: 'Approve unconditionally without confirming license/qualification.' },
      { id: 'C', text: 'Table indefinitely with no interim coverage plan.' },
    ],
    requiredEvidenceIds: ['EX-SUP-CM'],
    modelAction: 'A.',
    rationale: 'The proposed successor’s qualification is stated as on file per the exhibit; approval should be conditioned on that being confirmed, not assumed or ignored.',
    alternativesWhyFail: ['B skips a required verification step.', 'C leaves the coverage gap unaddressed with no plan in place.'],
    formsRequired: ['GB-FORM-CLINICAL-MANAGER-CHANGE'],
    deadlineExplanation: 'Should be decided this meeting given the 2026-06-15 transfer date has already passed by the time of a later meeting.',
    consequences: {
      patientSafety: 'An unqualified or unverified Clinical Manager risks clinical oversight quality.',
      regulatory: 'Clinical Manager qualification is a licensure requirement.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'Conditional approval must be documented as such, not as unconditional.',
    },
  },
  {
    id: 'DN-09', matterId: 'M-COI-VENDOR', round: 1,
    title: 'Compute Quorum for the Conflicted Vendor Vote',
    prompt: 'The Board has 9 seated directors (per EX-SUP-ROSTER’s composition context). One director has disclosed a financial interest in the vendor whose contract renewal is before the Board (EX-SUP-COI) and must be recused from both deliberation and the vote. What is the correct eligible-voter base and quorum threshold for this specific matter, and is quorum met with 7 of the remaining 8 eligible directors present?',
    kind: 'quorum_calc',
    competencyIds: ['quorum-recusal'],
    workflowIds: ['GV-WF-02'],
    pointsAvailable: 35,
    requiredEvidenceIds: ['EX-SUP-COI', 'EX-SUP-ROSTER'],
    modelAction: { totalSeated: 9, recusedForThisMatter: 1, eligibleBase: 8, quorumThreshold: 5, presentEligible: 7, quorumMet: true },
    rationale: 'The conflicted director is excluded from both the vote and the eligible-voter denominator for this matter; quorum is judged against the reduced 8-member base, not the full 9, and a simple majority of 8 is 5 — 7 present clears that threshold.',
    alternativesWhyFail: [
      'Counting the conflicted director toward the quorum denominator while barring their vote would let their mere presence help manufacture a quorum they are not entitled to help form.',
      'Requiring a majority of the full 9-seat roster (5 of 9, ignoring the recusal) misapplies the matter-specific recusal rule.',
    ],
    formsRequired: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
    deadlineExplanation: 'Quorum must be established before any vote on the vendor matter is taken.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'A vote taken without a properly computed quorum is not a valid governance action.',
      financial: 'A vendor contract renewal carries direct financial exposure.', privacy: 'None.',
      recordIntegrity: 'The recusal log and quorum computation must both be documented.',
    },
  },
  {
    id: 'DN-10', matterId: 'M-COI-VENDOR', round: 1,
    title: 'Disposition of the Vendor Contract Renewal',
    prompt: 'With quorum properly established (DN-09), what should the Board do with the vendor contract renewal vote?',
    kind: 'disposition',
    competencyIds: ['quorum-recusal'],
    workflowIds: ['GV-WF-02'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'Proceed to a vote among the 8 non-conflicted, present-and-eligible directors, with the conflicted director’s recusal logged.', correct: true },
      { id: 'B', text: 'Allow the conflicted director to remain in the room, participate in deliberation, and be counted for quorum, as long as their vote itself is recorded as recused.', criticalFailure: true },
      { id: 'C', text: 'Cancel the vendor matter entirely rather than address the conflict.' },
    ],
    requiredEvidenceIds: ['EX-SUP-COI'],
    modelAction: 'A.',
    rationale: 'Recusal sufficiency depends on the conflict-of-interest policy; where deliberation participation itself is barred, recording only the vote-recusal is not sufficient — the correct path fully excludes the conflicted director from deliberation, vote, and the quorum count.',
    alternativesWhyFail: [
      'B is the exact quorum-manufacturing failure pattern this matter is designed to test.',
      'C is a disproportionate response to a properly manageable conflict.',
    ],
    formsRequired: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
    deadlineExplanation: 'Decision should be made this meeting; the vendor contract renewal is time-sensitive.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'An improperly conducted conflicted vote can void the decision on review.',
      financial: 'Direct — the vendor contract value is at stake.', privacy: 'None.',
      recordIntegrity: 'The recusal log is the durable record of how the conflict was handled.',
    },
  },

  // ---- Round 2: QAPI packet & PIP judgment (Q1/Q2) ------------------------
  {
    id: 'DN-11', matterId: 'M-CENSUS-TRAP', round: 2,
    title: 'Reconcile the Q1→Q2 Census Denominator',
    prompt: 'Q1 closes at 120 active patients (EX-Q1-POPULATION); Q2 opens at 100 (EX-Q2-POPULATION). What is the correct denominator treatment for any rate comparison spanning this boundary?',
    kind: 'denominator',
    competencyIds: ['evidence-integrity', 'record-integrity'],
    workflowIds: ['GV-WF-05'],
    pointsAvailable: 35,
    requiredEvidenceIds: ['EX-Q1-POPULATION', 'EX-Q2-POPULATION', 'EX-DQ-002'],
    modelAction: { reconciled: false, correctAction: 'Do not merge or average the Q1 close (120) and Q2 open (100) figures as if reconciled; flag DQ-2026-002 and require the true opening census be confirmed before computing any cross-boundary population-based rate change.' },
    rationale: 'A 20-patient gap unexplained by recorded discharges/transfers is a live data-quality defect, not a rounding difference the Board may silently resolve.',
    alternativesWhyFail: [
      'Silently using either number as if reconciled (or averaging them) manufactures a denominator that does not exist in the record.',
      'Ignoring the discrepancy entirely leaves the packet-readiness gate falsely satisfied.',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS'],
    deadlineExplanation: 'Must be resolved before any Q1→Q2 population-based trend is presented as fact this meeting.',
    consequences: {
      patientSafety: 'An unreconciled census could mask an unreported discharge or transfer pattern.',
      regulatory: 'Denominator integrity underlies every quality-rate calculation a surveyor will test.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'This is one of the case’s core cross-quarter traps.',
    },
  },
  {
    id: 'DN-12', matterId: 'M-MEDREC-PIP', round: 2,
    title: 'PIP-Q1-004 Closure Eligibility',
    prompt: 'Is PIP-Q1-004 (medication reconciliation) eligible for closure at Q2 close?',
    kind: 'eligibility',
    competencyIds: ['pip-closure-sustainability'],
    workflowIds: ['GV-WF-06'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Yes — authorize closure of PIP-Q1-004 now.', criticalFailure: true },
      { id: 'B', text: 'No — the sustainability criterion (two consecutive quarters ≥ 95%) has not been met; Q2 shows a third consecutive quarter below target and worsening (70.6% in June). Keep the PIP open and reset the return date.', correct: true },
      { id: 'C', text: 'Undecided — take no action and carry the PIP forward with no return date.' },
    ],
    requiredEvidenceIds: ['EX-Q1-PIP-004', 'EX-Q2-PIP-004-STATUS', 'EX-Q2-QM-MEDREC'],
    modelAction: 'B — closure ineligible; keep open with a confirmed return date.',
    rationale: 'The approved sustainability criterion requires two consecutive qualifying quarters; Q2 is worse than Q1, not better, so the criterion cannot have been met.',
    alternativesWhyFail: [
      'A directly contradicts the recovered Q2 evidence and is the sustainability bright-line failure this case is built to catch.',
      'C fails to set a return date, letting a known critical metric drift without a re-review commitment.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'Must be decided at Q2 close per the PIP’s own return-date cadence.',
    consequences: {
      patientSafety: 'Medication reconciliation failures at SOC/ROC are a direct patient-safety risk.',
      regulatory: 'Closing a PIP against its own sustainability criterion is indefensible on survey.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'The closure decision and its basis must be documented.',
    },
  },
  {
    id: 'DN-13', matterId: 'M-MEDREC-PIP', round: 2,
    title: 'Reconcile the Early-Closure Claim',
    prompt: 'A colleague suggests: "Med rec has stabilized enough this year to close the PIP." How should the Board reconcile that claim against the record?',
    kind: 'reconcile_conflict',
    competencyIds: ['pip-closure-sustainability', 'evidence-integrity'],
    workflowIds: ['GV-WF-06'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'Reject the claim — Q1 (72.7–79.2%) and Q2 (77.8–70.6%) both remain critically below the 95% target, with Q2 worsening month over month; there is no basis in the record for "stabilized."', correct: true },
      { id: 'B', text: 'Accept the claim because the Q2 average is numerically close to the Q1 average.' },
    ],
    requiredEvidenceIds: ['EX-Q1-QM-MEDREC', 'EX-Q2-QM-MEDREC'],
    modelAction: 'A.',
    rationale: 'Averaging two critically-below-target quarters and calling the result "stable" ignores the deteriorating monthly trend inside Q2 itself.',
    alternativesWhyFail: ['B substitutes a surface-level average for the deteriorating month-over-month pattern that is the actual controlling fact.'],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'Should be addressed alongside DN-12 in the same round.',
    consequences: {
      patientSafety: 'Same as DN-12.', regulatory: 'Same as DN-12.', financial: 'None directly.', privacy: 'None.',
      recordIntegrity: 'The rejection and its evidentiary basis must be recorded.',
    },
  },
  {
    id: 'DN-14', matterId: 'M-WOUND-PIP', round: 2,
    title: 'Rank the Open PIP/CAP Risk Portfolio',
    prompt: 'Rank PIP-Q1-004 (med rec), PIP-Q1-006 (wound infection), and PIP-Q1-007’s underlying complaint trend by urgency for continued Board oversight, given the sepsis linkage.',
    kind: 'risk_rank',
    competencyIds: ['pip-closure-sustainability'],
    workflowIds: ['GV-WF-06', 'GV-WF-08'],
    pointsAvailable: 30,
    requiredEvidenceIds: ['EX-Q1-PIP-006', 'EX-Q1-TRIG-006', 'EX-Q1-AE-004', 'EX-Q1-PIP-004', 'EX-Q1-TRIG-007'],
    modelAction: ['PIP-Q1-006 (wound infection — directly linked to a Critical-severity sepsis hospitalization and an active RCA)', 'PIP-Q1-004 (medication reconciliation — critical and worsening, but no linked hospitalization yet on record)', 'PIP-Q1-007 (complaint/grievance communication trend — Critical severity but no clinical-harm linkage on record)'],
    rationale: 'Direct linkage to an actual Critical-severity adverse event and an open RCA elevates the wound-infection PIP above the other two, even though all three are independently critical.',
    alternativesWhyFail: [
      'Ranking purely by metric percentage without accounting for the sepsis linkage under-weights the wound PIP’s real-world severity.',
      'Ranking the complaint trend first ignores that it has no recorded clinical-harm linkage, unlike the wound PIP.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Informs how the Board allocates its limited oversight/resourcing attention this meeting.',
    consequences: {
      patientSafety: 'Misranking risk could under-resource the highest-severity open item.',
      regulatory: 'Demonstrates risk-based prioritization to a surveyor.',
      financial: 'Resourcing decisions (DN-16/17) depend on this ranking.', privacy: 'None.',
      recordIntegrity: 'The ranking and its rationale should be minuted.',
    },
  },
  {
    id: 'DN-15', matterId: 'M-AGGREGATE-MASK', round: 2,
    title: 'The Masked Aggregate',
    prompt: 'Q2’s hospitalization rate is within target (EX-Q2-QM-HOSP), flagged aggregateMasksSubgroup: true. What is the correct board posture?',
    kind: 'reconcile_conflict',
    competencyIds: ['aggregate-vs-subgroup'],
    workflowIds: ['GV-WF-06'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Accept closure/no-action on quality oversight this quarter since the headline hospitalization metric is within target.', criticalFailure: true },
      { id: 'B', text: 'Hold closure on any related PIP and direct further review of the masked subgroup (OASIS accuracy, medication reconciliation, POC documentation, and missed visits — all below target and worsening in Q2).', correct: true },
      { id: 'C', text: 'Report only the aggregate hospitalization figure to the Board’s public minutes and omit the masked subgroup finding.' },
    ],
    requiredEvidenceIds: ['EX-Q2-QM-HOSP', 'EX-Q2-QM-OASIS', 'EX-Q2-QM-MEDREC', 'EX-Q2-QM-POC', 'EX-Q2-QM-MISSEDVISIT'],
    modelAction: 'B — hold closure, direct further subgroup review.',
    rationale: 'A favorable aggregate that is explicitly flagged as masking a worsening subgroup is precisely the pattern QAPI oversight exists to catch; the Board’s duty runs to the subgroup.',
    alternativesWhyFail: [
      'A is the aggregate-vs-subgroup bright-line failure — accepting a masked aggregate as sufficient defeats the purpose of subgroup surveillance.',
      'C would suppress a known adverse signal from the public record.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Must be addressed before any Q2 PIP-closure decision this meeting.',
    consequences: {
      patientSafety: 'The masked subgroup (med rec, OASIS, missed visits) is exactly where the next adverse event is most likely.',
      regulatory: 'A surveyor reviewing only the headline metric would be misled without this finding on record.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'This is one of the case’s core cross-quarter traps.',
    },
  },

  // ---- Round 3: CAP/budget, RCA, executive session ------------------------
  {
    id: 'DN-16', matterId: 'M-CAP-BUDGET', round: 3,
    title: 'CAP-Q1-002/003 Effectiveness Determination',
    prompt: 'Management asks the Board to mark CAP-Q1-002 (med rec re-education) and CAP-Q1-003 (wound protocol) as effective. The budget request for the resources both CAPs assumed (0.5 FTE + audit tool license) was only filed 2026-05-20 (EX-SUP-BUDGET) and has not yet been authorized. Is effectiveness demonstrated?',
    kind: 'effectiveness',
    competencyIds: ['budget-cap-resources'],
    workflowIds: ['GV-WF-07'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Yes — mark both CAPs effective; the corrective activity itself has occurred.', criticalFailure: true },
      { id: 'B', text: 'No — effectiveness requires the resources each CAP’s own design identified as necessary to actually be in place; authorize the budget request first, then re-assess effectiveness after a full quarter with those resources active.', correct: true },
    ],
    requiredEvidenceIds: ['EX-Q1-CAP-002', 'EX-Q1-CAP-003', 'EX-SUP-BUDGET'],
    modelAction: 'B — not yet effective; authorize resourcing first, then re-assess.',
    rationale: 'A CAP that is not resourced as its own plan requires will not sustain; marking it effective before the resourcing exists misrepresents the record.',
    alternativesWhyFail: ['A ignores the CAP’s own stated resourcing precondition and will let the underlying risk recur once the one-time corrective activity fades.'],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    deadlineExplanation: 'The budget authorization decision (DN-17) must precede any effectiveness re-assessment.',
    consequences: {
      patientSafety: 'An unresourced CAP will not sustainably fix the medication-reconciliation or wound-infection risk.',
      regulatory: 'Marking a CAP effective without its stated resources in place fails RTF-BC-01-type scrutiny on survey.',
      financial: 'Direct — the budget authorization itself is the decision at hand.', privacy: 'None.',
      recordIntegrity: 'The effectiveness determination and its basis must be documented together.',
    },
  },
  {
    id: 'DN-17', matterId: 'M-CAP-BUDGET', round: 3,
    title: 'Confirm the CAP Effectiveness Checkpoint Date',
    prompt: 'Given DN-16, what is the earliest defensible date the Board should set to re-assess CAP-Q1-002/003 effectiveness, consistent with PIP-Q1-004’s own reset return date?',
    kind: 'due_date',
    competencyIds: ['budget-cap-resources'],
    workflowIds: ['GV-WF-07'],
    pointsAvailable: 25,
    requiredEvidenceIds: ['EX-SUP-BUDGET', 'EX-Q2-PIP-004-STATUS'],
    modelAction: '2026-10-09',
    rationale: 'Aligning the CAP effectiveness checkpoint to the already-established PIP-Q1-004 return date (2026-10-09) keeps the resourcing-dependent CAPs and their parent PIP on one coherent oversight cadence.',
    alternativesWhyFail: ['Keeping the original April due dates as the effectiveness checkpoint ignores that the resourcing gap was only identified in May — those dates predate the resources even existing.'],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    deadlineExplanation: 'Sets the next formal effectiveness review point.',
    consequences: {
      patientSafety: 'Same as DN-16.', regulatory: 'Same as DN-16.', financial: 'Same as DN-16.', privacy: 'None.',
      recordIntegrity: 'The revised checkpoint date must be minuted alongside the reason for the change.',
    },
  },
  {
    id: 'DN-18', matterId: 'M-CAP-BUDGET', round: 3,
    title: 'Confirm PIP-Q1-006’s Return Date',
    prompt: 'PIP-Q1-006 (wound infection) has no Q2 status update in the recovered source at all — unlike PIP-Q1-004, which has an explicit Q2 carry-forward record. What is the correct return date to carry forward for PIP-Q1-006 tonight?',
    kind: 'return_date',
    competencyIds: ['pip-closure-sustainability', 'record-integrity'],
    workflowIds: ['GV-WF-06', 'GV-WF-07'],
    pointsAvailable: 25,
    requiredEvidenceIds: ['EX-Q1-PIP-006'],
    modelAction: '2026-07-10 (unchanged) — and the Board must separately flag that no Q2 status update exists for PIP-Q1-006, rather than silently inventing a new date or assuming silence means the criterion was met.',
    rationale: 'Absence of a Q2 update is itself a finding — silence is a missing-evidence problem, not evidence the wound-infection metric improved.',
    alternativesWhyFail: ['Assuming silence means the sustainability criterion was quietly satisfied would let a real, untracked risk drop off the Board’s radar.'],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'The missing-update flag must be raised at this meeting so it is tracked before the next quarter closes.',
    consequences: {
      patientSafety: 'The wound-infection/sepsis-linked risk cannot be assumed resolved on silence alone.',
      regulatory: 'A surveyor will expect an explanation for the missing Q2 update, not a fabricated one.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'Flagging the gap, rather than filling it, preserves record integrity.',
    },
  },
  {
    id: 'DN-19', matterId: 'M-RCA-SEPSIS', round: 3,
    title: 'Trace the Sepsis Evidence Chain',
    prompt: 'Trace the full evidentiary chain connecting the Q1 wound-infection metric spike to the disciplinary matter, in the order the record supports.',
    kind: 'evidence_chain',
    competencyIds: ['evidence-integrity'],
    workflowIds: ['GV-WF-08'],
    pointsAvailable: 30,
    requiredEvidenceIds: ['EX-Q1-QM-WOUND', 'EX-Q1-AUD-CL008', 'EX-Q1-INF-005', 'EX-Q1-TRIG-006', 'EX-Q1-AE-004', 'EX-Q1-CAP-003', 'EX-Q1-DISC-005'],
    modelAction: ['EX-Q1-QM-WOUND', 'EX-Q1-AUD-CL008', 'EX-Q1-INF-005', 'EX-Q1-TRIG-006', 'EX-Q1-AE-004', 'EX-Q1-CAP-003', 'EX-Q1-DISC-005'],
    rationale: 'The metric spike (QM-WOUND) is corroborated by the feeder audit’s cluster finding (AUD-CL008), materializes as a specific infection (INF-005), formally triggers the PIP (TRIG-006), escalates into the sepsis adverse event (AE-004), drives the corrective action (CAP-003), and separately surfaces the escalation-chain personnel matter (DISC-005).',
    alternativesWhyFail: ['Skipping the feeder-audit or infection-level exhibits and jumping straight from the metric to the adverse event omits the corroborating steps a surveyor would expect the Board to be able to produce.'],
    formsRequired: ['GB-FORM-RCA-ESCALATION'],
    deadlineExplanation: 'Establishes the factual chain before the executive-session discussion (DN-20–DN-23).',
    consequences: {
      patientSafety: 'Central — this is the chain behind a Critical-severity sepsis event.',
      regulatory: 'A surveyor will expect the Board to be able to produce this exact chain on request (see SQ-06).',
      financial: 'None directly.', privacy: 'Restricted-level exhibits in this chain must stay off the public record.',
      recordIntegrity: 'The chain itself is the evidentiary backbone of the RCA escalation.',
    },
  },
  {
    id: 'DN-20', matterId: 'M-RCA-SEPSIS', round: 3,
    title: 'Classify Which Parts of This Matter Require Executive Session',
    prompt: 'Given the evidence chain (DN-19), which discussion(s) require executive session versus open session?',
    kind: 'session_classification',
    competencyIds: ['executive-session'],
    workflowIds: ['GV-WF-08', 'GV-WF-09'],
    pointsAvailable: 30,
    options: [
      { id: 'A', text: 'The systemic RCA findings and CAP (EX-Q1-AE-004, EX-Q1-CAP-003) may be discussed in open session as a systemic quality matter; the individual personnel matter (EX-Q1-DISC-005) must move to executive session.', correct: true },
      { id: 'B', text: 'The entire matter, including the systemic RCA and CAP, must be discussed only in executive session.' },
      { id: 'C', text: 'The personnel matter (EX-Q1-DISC-005) may be discussed in open session since it stems from a patient-safety event.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-AE-004', 'EX-Q1-CAP-003', 'EX-Q1-DISC-005'],
    modelAction: 'A.',
    rationale: 'The source itself keeps the systemic RCA and the personnel matter "separated" (personnelMatterSeparated: true) — systemic quality discussion belongs in open session, while the individual restricted personnel matter requires executive-session confidentiality.',
    alternativesWhyFail: [
      'B unnecessarily conceals the systemic quality findings the public record should reflect.',
      'C exposes a restricted personnel matter in open session, defeating the confidentiality protection the record itself establishes.',
    ],
    formsRequired: ['GB-FORM-RESTRICTED-MATTER'],
    deadlineExplanation: 'Must be classified before the discussion begins, not after.',
    consequences: {
      patientSafety: 'None directly beyond DN-19.', regulatory: 'Improper session classification is itself a governance-process defect.',
      financial: 'None directly.', privacy: 'Central — this protects the restricted personnel matter.',
      recordIntegrity: 'Session classification must be minuted.',
    },
  },
  {
    id: 'DN-21', matterId: 'M-EXEC-SESSION', round: 3,
    title: 'Board Direction on the Restricted Personnel Matters',
    prompt: 'In executive session, what may the Board properly direct regarding DISC-TRIG-Q1-004 and DISC-TRIG-Q1-005?',
    kind: 'board_vs_management',
    competencyIds: ['board-vs-management'],
    workflowIds: ['GV-WF-09'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Direct management to complete the investigations, apply progressive discipline per policy, and report back on systemic accountability measures (e.g., escalation-chain training).', correct: true },
      { id: 'B', text: 'Direct that the specific clinicians (MOCK-CLIN-0003, MOCK-CLIN-0004) be terminated, naming the individual disciplinary outcome itself.', criticalFailure: true },
      { id: 'C', text: 'Take no position and leave both matters entirely unaddressed.' },
    ],
    requiredEvidenceIds: ['EX-Q1-DISC-004', 'EX-Q1-DISC-005'],
    modelAction: 'A.',
    rationale: 'The Board directs systemic accountability and holds management to it; directing a specific individual’s termination is management’s function, not the Board’s.',
    alternativesWhyFail: [
      'B is the board-vs-management overreach bright line — a Board that directs individual personnel action is acting outside its authority and outside the record it can defend.',
      'C leaves two Critical-severity restricted matters with no Board-level accountability direction at all.',
    ],
    formsRequired: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'Direction should be given this meeting given both matters’ Critical severity.',
    consequences: {
      patientSafety: 'Systemic accountability measures (escalation training) directly address the sepsis root cause.',
      regulatory: 'A Board overreaching into individual personnel decisions creates its own compliance exposure.',
      financial: 'Potential wrongful-termination exposure if the Board directs an individual outcome outside due process.',
      privacy: 'Restricted-session content must stay confidential.', recordIntegrity: 'Executive-session minutes must reflect the systemic direction given, not the individual outcome.',
    },
  },
  {
    id: 'DN-22', matterId: 'M-EXEC-SESSION', round: 3,
    title: 'Draft the Confidential Executive-Session Minutes Boundary',
    prompt: 'What must the confidential executive-session minutes contain, and what must they exclude?',
    kind: 'confidential_minutes',
    competencyIds: ['executive-session'],
    workflowIds: ['GV-WF-09'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'Include the restricted findings, the Board’s systemic-accountability direction to management, and the vote; exclude nothing the Board actually discussed or directed.', correct: true },
      { id: 'B', text: 'Include only a note that "a personnel matter was discussed" with no further detail on what was directed.' },
    ],
    requiredEvidenceIds: ['EX-Q1-DISC-004', 'EX-Q1-DISC-005'],
    modelAction: 'A.',
    rationale: 'Confidentiality governs who may see the executive-session minutes, not whether the substance of the Board’s own direction is recorded at all.',
    alternativesWhyFail: ['B under-documents the Board’s own action, making it impossible to later verify what the Board actually directed.'],
    formsRequired: ['GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'Minutes should be finalized promptly after the session per the agency’s minutes-due policy.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'Under-documented executive-session minutes cannot demonstrate the Board actually acted.',
      financial: 'None directly.', privacy: 'The minutes themselves remain restricted-access.', recordIntegrity: 'This is the durable record of the Board’s actual direction.',
    },
  },
  {
    id: 'DN-23', matterId: 'M-EXEC-SESSION', round: 3,
    title: 'Draft the Public Minutes Entry for the Executive Session',
    prompt: 'What must the public minutes reflect about this executive session?',
    kind: 'public_minutes',
    competencyIds: ['executive-session'],
    workflowIds: ['GV-WF-09'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'That an executive session occurred to discuss restricted personnel matters, and the authorized public-facing outcome (e.g., "the Board directed management to complete the pending investigations and report on systemic accountability measures").', correct: true },
      { id: 'B', text: 'No mention of the executive session at all, to preserve confidentiality.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q1-DISC-004', 'EX-Q1-DISC-005'],
    modelAction: 'A.',
    rationale: 'Confidentiality protects the substance of the restricted deliberation, not the fact that governance occurred; the public record must show that an executive session took place and its authorized public outcome.',
    alternativesWhyFail: ['B omits the fact of governance action entirely, breaking the public accountability record — a record-integrity critical failure.'],
    formsRequired: ['GB-FORM-PUBLIC-MINUTES'],
    deadlineExplanation: 'Public minutes should be finalized per the minutes-due deadline alongside the confidential minutes.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'A public record with silent gaps where governance decisions should appear is itself a defect.',
      financial: 'None directly.', privacy: 'Substance stays confidential; only the fact and authorized outcome are public.',
      recordIntegrity: 'Central — this closes the public-accountability loop for the executive session.',
    },
  },

  // ---- Round 4: scope, licensure, CHOW -------------------------------------
  {
    id: 'DN-24', matterId: 'M-SCOPE-CHANGE', round: 4,
    title: 'Proceed Decision — Scope-of-Services Change',
    prompt: 'Management proposes adding a therapy service line not on the current license (EX-SUP-SCOPE). How should the Board proceed?',
    kind: 'proceed_decision',
    competencyIds: ['scope-license'],
    workflowIds: ['GV-WF-10'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Approve the scope change contingent on the state licensure amendment and accreditation notification being completed first; no operational start date may precede both.', correct: true },
      { id: 'B', text: 'Approve the scope change and authorize an immediate operational start date, with the licensure amendment to follow afterward.', criticalFailure: true },
      { id: 'C', text: 'Decline to consider the proposal at all.' },
    ],
    requiredEvidenceIds: ['EX-SUP-SCOPE'],
    modelAction: 'A.',
    rationale: 'Scope-of-services changes require prior Board approval and prior licensure amendment; notification or approval after the fact is not a substitute for approval before operational change.',
    alternativesWhyFail: [
      'B is the scope-license bright-line failure — operating outside an approved and licensed scope of services is a direct survey and licensure risk.',
      'C is disproportionate to a routine, properly-sequenced scope-change request.',
    ],
    formsRequired: ['GB-FORM-SCOPE-CHANGE'],
    deadlineExplanation: 'No operational date may be set until the licensure amendment is filed and approved.',
    consequences: {
      patientSafety: 'Operating an unlicensed service line risks unqualified or unauthorized care delivery.',
      regulatory: 'Direct licensure and accreditation exposure if sequencing is violated.',
      financial: 'Premature investment in an unlicensed line risks unrecoverable cost.', privacy: 'None.',
      recordIntegrity: 'The contingency must be explicit in the motion, not implied.',
    },
  },
  {
    id: 'DN-25', matterId: 'M-LICENSURE', round: 4,
    title: 'Classify the Licensure Renewal Risk',
    prompt: 'The state license renewal application is submitted, decision pending (EX-SUP-LIC). How should the Board classify this risk?',
    kind: 'classify_evidence',
    competencyIds: ['scope-license'],
    workflowIds: ['GV-WF-11'],
    pointsAvailable: 25,
    options: [
      { id: 'A', text: 'No lapse has occurred; classify as an active, tracked risk requiring continued Board visibility until the renewal decision is received — not a closed item.', correct: true },
      { id: 'B', text: 'Classify as resolved since the application has been submitted.' },
    ],
    requiredEvidenceIds: ['EX-SUP-LIC'],
    modelAction: 'A.',
    rationale: 'A renewal "in process" is a standing operational risk regardless of submission status until the decision is actually received; it requires continued Board-level tracking, not closure.',
    alternativesWhyFail: ['B treats submission as equivalent to approval, which understates the risk while the decision remains pending.'],
    formsRequired: ['GB-FORM-LICENSURE-RENEWAL'],
    deadlineExplanation: 'Should remain on the Board’s tracked-risk list until the state’s decision is received.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'A lapsed license/accreditation exposes the agency to closure or exclusion risk.',
      financial: 'A lapse would threaten payer enrollment continuity.', privacy: 'None.',
      recordIntegrity: 'Tracked-risk status must be reflected accurately in the minutes.',
    },
  },
  {
    id: 'DN-26', matterId: 'M-CHOW', round: 4,
    title: 'Required Sequence for the Proposed Change of Ownership',
    prompt: 'A majority-equity transaction is proposed (EX-SUP-CHOW). What is the legally required sequence?',
    kind: 'multiple_choice',
    competencyIds: ['chow'],
    workflowIds: ['GV-WF-12'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Board review and approval first, then file the required regulatory notifications (state licensure, CMS-855A, accreditation body) as part of the transaction process.', correct: true },
      { id: 'B', text: 'File CMS-855A and complete the transaction operationally first, then bring it to the Board for review afterward.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-SUP-CHOW'],
    modelAction: 'A.',
    rationale: 'A change of ownership requires Board review and the associated regulatory notifications as part of, not after, the transaction process.',
    alternativesWhyFail: ['B is the CHOW bright-line failure — finalizing operationally before Board review and required notifications can jeopardize licensure, accreditation, and payer enrollment.'],
    formsRequired: ['GB-FORM-CHOW-NOTIFICATION'],
    deadlineExplanation: 'Board review must precede any regulatory filing on the transaction.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'Direct — late or missing CHOW notifications can jeopardize licensure, accreditation, and Medicare enrollment.',
      financial: 'A transaction completed out of sequence risks having to be unwound.', privacy: 'None.',
      recordIntegrity: 'The Board’s review must be documented as preceding, not following, any filing.',
    },
  },
  {
    id: 'DN-27', matterId: 'M-CHOW', round: 4,
    title: 'Select Workflows Implicated by the CHOW',
    prompt: 'Beyond GV-WF-12, does the proposed change of ownership implicate any other workflow this Board must also track?',
    kind: 'workflow_select',
    competencyIds: ['chow'],
    workflowIds: ['GV-WF-12'],
    pointsAvailable: 20,
    options: [
      { id: 'A', text: 'GV-WF-12 — Change of Ownership (CHOW) Notification', correct: true },
      { id: 'B', text: 'GV-WF-11 — Licensure & Accreditation Renewal, since a new parent entity may require its own licensure notification alongside the pending renewal (EX-SUP-LIC)', correct: true },
      { id: 'C', text: 'GV-WF-14 — Annual Governance Training, unrelated to this transaction' },
    ],
    requiredEvidenceIds: ['EX-SUP-CHOW', 'EX-SUP-LIC'],
    modelAction: 'A and B.',
    rationale: 'A change of ownership can interact with a concurrently pending licensure renewal; both should be tracked together, not treated as unrelated.',
    alternativesWhyFail: ['C has no trigger condition present in either record.'],
    formsRequired: ['GB-FORM-CHOW-NOTIFICATION', 'GB-FORM-LICENSURE-RENEWAL'],
    deadlineExplanation: 'Both should be tracked on a coordinated timeline given they may interact.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'Coordinating CHOW and licensure renewal timing reduces the risk of conflicting regulatory positions.',
      financial: 'None directly beyond DN-26.', privacy: 'None.', recordIntegrity: 'Cross-referencing these two matters should be reflected in the minutes.',
    },
  },

  // ---- Round 5: media/privacy, training -----------------------------------
  {
    id: 'DN-28', matterId: 'M-MEDIA-PHI', round: 5,
    title: 'Respond to the Media Inquiry',
    prompt: 'A local outlet requests comment within 48 hours on a patient-care incident already under internal RCA (EX-SUP-MEDIA). How should the Board direct the response?',
    kind: 'proceed_decision',
    competencyIds: ['vendor-baa'],
    workflowIds: ['GV-WF-13'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'Direct a measured, policy-consistent response acknowledging the inquiry without confirming clinical findings, pending RCA completion and legal/PR counsel review.', correct: true },
      { id: 'B', text: 'Confirm the specific clinical findings to the reporter directly, to appear transparent.', criticalFailure: true },
      { id: 'C', text: 'Ignore the inquiry entirely with no response of any kind.' },
    ],
    requiredEvidenceIds: ['EX-SUP-MEDIA'],
    modelAction: 'A.',
    rationale: 'No confirmed clinical findings should be disclosed publicly ahead of RCA completion; the correct response is measured and counsel-reviewed, not silent and not premature.',
    alternativesWhyFail: [
      'B risks disclosing unverified or premature clinical conclusions and potential PHI exposure — a bright-line failure.',
      'C creates unnecessary reputational and regulatory risk from total non-response within the 48-hour window.',
    ],
    formsRequired: ['GB-FORM-MEDIA-INCIDENT'],
    deadlineExplanation: 'Response must be coordinated within the reporter’s 48-hour window.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'Premature public clinical disclosure can complicate the RCA and any regulatory review.',
      financial: 'Reputational/financial exposure from a mishandled media response.', privacy: 'Central — protects patient-level clinical detail from premature public disclosure.',
      recordIntegrity: 'The Board’s directed response must be documented.',
    },
  },
  {
    id: 'DN-29', matterId: 'M-MEDIA-PHI', round: 5,
    title: 'Classify and Direct the PHI Breach Notice',
    prompt: 'A vendor reported possible unauthorized access to a patient-record subset (EX-SUP-PHI). What should the Board direct?',
    kind: 'classify_evidence',
    competencyIds: ['vendor-baa'],
    workflowIds: ['GV-WF-13'],
    pointsAvailable: 30,
    options: [
      { id: 'A', text: 'Direct that the BAA audit-access terms be invoked immediately to determine scope, and that a breach-risk assessment proceed on the required timeline; do not wait for the vendor to volunteer further detail.', correct: true },
      { id: 'B', text: 'Take no action until the vendor provides a complete report, however long that takes.' },
    ],
    requiredEvidenceIds: ['EX-SUP-PHI'],
    modelAction: 'A.',
    rationale: 'A compliant BAA’s audit-access terms exist precisely so the agency is not solely dependent on the vendor’s own timeline to determine breach scope.',
    alternativesWhyFail: ['B creates uncontrolled, indefinite exposure while notification timelines (if required) continue to run regardless of the vendor’s pace.'],
    formsRequired: ['GB-FORM-BREACH-RESPONSE', 'GB-FORM-VENDOR-BAA'],
    deadlineExplanation: 'Breach-risk assessment timelines begin running from discovery, not from the vendor’s final report.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'Breach notification timelines are regulatory deadlines independent of vendor cooperation.',
      financial: 'Potential breach-notification and remediation costs.', privacy: 'Central — this is a direct PHI exposure risk.',
      recordIntegrity: 'The Board’s direction to invoke audit-access terms must be documented.',
    },
  },
  {
    id: 'DN-30', matterId: 'M-TRAINING', round: 5,
    title: 'Voting Eligibility Given Outstanding Attestations',
    prompt: 'EX-SUP-TRAIN shows all seated directors have an outstanding annual attestation, and one newly seated director additionally requires onboarding training before their first vote. May that newly seated director vote tonight?',
    kind: 'eligibility',
    competencyIds: ['quorum-recusal', 'record-integrity'],
    workflowIds: ['GV-WF-14'],
    pointsAvailable: 30,
    options: [
      { id: 'A', text: 'No — the newly seated director must complete onboarding training before casting their first vote; other seated directors’ outstanding annual attestations should be remediated promptly but do not by themselves bar an already-onboarded director from voting.', correct: true },
      { id: 'B', text: 'Yes — allow the newly seated, not-yet-onboarded director to vote in this meeting since the matter is time-sensitive.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-SUP-TRAIN'],
    modelAction: 'A.',
    rationale: 'The record explicitly states the new director additionally requires onboarding training before their first vote — that is a distinct, stricter gate than the general annual attestation cycle.',
    alternativesWhyFail: ['B lets an unonboarded new director’s vote count, undermining the specific eligibility gate the record establishes for that seat.'],
    formsRequired: ['GB-FORM-TRAINING-ATTESTATION'],
    deadlineExplanation: 'Onboarding must be completed before that director’s first vote, not retroactively cured after.',
    consequences: {
      patientSafety: 'None directly.', regulatory: 'An improperly eligible vote can be challenged on review.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'Eligibility determination must be recorded before the vote, not after.',
    },
  },

  // ---- Round 6: annual synthesis / closure --------------------------------
  {
    id: 'DN-31', matterId: 'M-ANNUAL-CLOSURE', round: 6,
    title: 'May the Board Approve the FY2026 Annual Report Tonight?',
    prompt: 'Given EX-ANNUAL-SUMMARY (Q3/Q4 normalizationStatus: pending; annualReportApproved: null) and the still-open PIP-Q1-004, PIP-Q1-006, CAP-Q1-002, CAP-Q1-003, and DISC-TRIG-Q1-004/005, may the Board approve the FY2026 annual report as complete tonight?',
    kind: 'multiple_choice',
    competencyIds: ['record-integrity', 'evidence-integrity'],
    workflowIds: ['GV-WF-05', 'GV-WF-06'],
    pointsAvailable: 35,
    options: [
      { id: 'A', text: 'No — document the annual report as not yet approvable; direct that Q3/Q4 normalization be completed and the open PIPs/CAPs/personnel matters be tracked to resolution before annual certification.', correct: true },
      { id: 'B', text: 'Yes — approve the FY2026 annual report as complete now, since Q1/Q2 are fully normalized.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-ANNUAL-SUMMARY', 'EX-Q2-PIP-004-STATUS', 'EX-Q1-PIP-006', 'EX-Q1-CAP-002', 'EX-Q1-CAP-003', 'EX-Q1-DISC-004', 'EX-Q1-DISC-005'],
    modelAction: 'A — do not approve; document as pending with explicit open-item tracking.',
    rationale: 'The annual record itself states normalization is pending and annualReportApproved is null; certifying completeness against an admittedly incomplete and still-open record is the payoff cross-quarter trap of this case.',
    alternativesWhyFail: ['B treats two normalized quarters as if they were the whole year, and ignores every open PIP, CAP, and restricted personnel matter still on the books — exactly the failure the annual note warns against ("zero open PIPs must never be read as zero remaining risk").'],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-RECORD-CORRECTION'],
    deadlineExplanation: 'This is the final substantive vote of the FY2026 review cycle.',
    consequences: {
      patientSafety: 'Premature certification could suppress visibility into the still-open sepsis-linked and medication-reconciliation risks.',
      regulatory: 'Central — this is exactly the kind of certification a surveyor will test against the underlying record.',
      financial: 'None directly.', privacy: 'None.', recordIntegrity: 'This is the case’s capstone record-integrity decision.',
    },
  },
  {
    id: 'DN-32', matterId: 'M-ANNUAL-CLOSURE', round: 6,
    title: 'Final Annual Disposition',
    prompt: 'What is the Board’s overall disposition to close tonight’s FY2026 review?',
    kind: 'disposition',
    competencyIds: ['record-integrity'],
    workflowIds: ['GV-WF-05', 'GV-WF-07', 'GV-WF-09'],
    pointsAvailable: 30,
    options: [
      { id: 'A', text: 'Hold annual report approval; direct completion of Q3/Q4 normalization; continue active oversight of PIP-Q1-004, PIP-Q1-006, CAP-Q1-002/003, and the two restricted personnel matters; set a defined return date for full annual re-review.', correct: true },
      { id: 'B', text: 'Close all open items by administrative fiat so the year can be reported as fully resolved.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-ANNUAL-SUMMARY', 'EX-Q2-PIP-004-STATUS', 'EX-Q1-PIP-006', 'EX-Q1-DISC-004', 'EX-Q1-DISC-005'],
    modelAction: 'A.',
    rationale: 'A defensible annual disposition names exactly what remains open and sets a concrete return date — it does not manufacture closure that the record does not support.',
    alternativesWhyFail: ['B is a wholesale record-integrity failure — closing items with no supporting evidence of resolution to make the year look complete.'],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PIP-CLOSURE', 'GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-RESTRICTED-MATTER'],
    deadlineExplanation: 'Sets the agenda and return date for the next full Board cycle.',
    consequences: {
      patientSafety: 'Continued oversight of the sepsis- and medication-reconciliation-linked risks is preserved.',
      regulatory: 'A defensible, evidence-matched disposition is what survives surveyor review.',
      financial: 'None directly.', privacy: 'Restricted matters remain appropriately tracked, not publicly closed.',
      recordIntegrity: 'This is the final record-integrity checkpoint of the annual cycle.',
    },
  },
];

// ---------------------------------------------------------------------------
// Injects — mid-round facts released to the Board
// ---------------------------------------------------------------------------

const INJECTS: Inject[] = [
  { id: 'INJ-01', round: 0, title: 'The Packet Convenes', body: 'The Q1/Q2 QAPI packet has cleared its readiness gates (EX-SUP-PACKET). The Board is convened to review the full FY2026 record.', workflowIds: ['GV-WF-05'], supplementalRecordId: GB_SUP_PACKET_001.id },
  { id: 'INJ-02', round: 0, releaseAfterNodeId: 'DN-02', title: 'Q3/Q4 Normalization Status Confirmed Pending', body: 'Staff confirms: Q3 and Q4 have not been normalized into the QAPI record. Any Q3/Q4 material presented tonight is management-reported only, per DN-02.', workflowIds: ['GV-WF-05'] },
  { id: 'INJ-03', round: 1, title: 'Board Roster Change Filed', body: 'A community-member director’s seat change has been filed for Board action (EX-SUP-ROSTER).', workflowIds: ['GV-WF-01'], supplementalRecordId: GB_SUP_ROSTER_2026.id },
  { id: 'INJ-04', round: 1, releaseAfterNodeId: 'DN-05', title: 'Records Confirms Distinct Incumbents', body: 'The records office confirms: the Q1 and Q2 Administrator IDs (and the Q1/Q2 Clinical Manager IDs) refer to different individuals sharing a recycled ID slot in the source fixture, consistent with DQ-2026-001.', workflowIds: ['GV-WF-03', 'GV-WF-04'] },
  { id: 'INJ-05', round: 1, title: 'Conflict of Interest Disclosed', body: 'A director has disclosed a financial interest in the vendor whose contract renewal is on tonight’s agenda (EX-SUP-COI).', workflowIds: ['GV-WF-02'], supplementalRecordId: GB_SUP_COI_001.id },
  { id: 'INJ-06', round: 2, title: 'Census Discrepancy Flagged by Compliance', body: 'Compliance flags that Q2’s opening census (100) does not reconcile with Q1’s closing census (120) — see EX-DQ-002.', workflowIds: ['GV-WF-05'] },
  { id: 'INJ-07', round: 2, releaseAfterNodeId: 'DN-12', title: 'Management Requests Early PIP Closure', body: 'Management asks the Board to consider closing PIP-Q1-004 early, citing "meaningful progress" this quarter.', workflowIds: ['GV-WF-06'] },
  { id: 'INJ-08', round: 3, title: 'Budget Request Filed', body: 'Management has filed a budget authorization request for the resources both open CAPs assume are in place (EX-SUP-BUDGET).', workflowIds: ['GV-WF-07'], supplementalRecordId: GB_SUP_BUDGET_001.id },
  { id: 'INJ-09', round: 3, releaseAfterNodeId: 'DN-20', title: 'Personnel Investigation Status Update', body: 'Both restricted personnel matters (EX-Q1-DISC-004, EX-Q1-DISC-005) remain under active investigation; no findings are final tonight.', workflowIds: ['GV-WF-09'] },
  { id: 'INJ-10', round: 4, title: 'CHOW Proposal Filed', body: 'A proposed majority-equity change of ownership has been filed for Board review (EX-SUP-CHOW).', workflowIds: ['GV-WF-12'], supplementalRecordId: GB_SUP_CHOW_001.id },
  { id: 'INJ-11', round: 5, title: 'Media Inquiry Received', body: 'A local outlet has requested comment within 48 hours (EX-SUP-MEDIA); separately, a vendor has reported a possible PHI access incident (EX-SUP-PHI).', workflowIds: ['GV-WF-13'], supplementalRecordId: GB_SUP_MEDIA_001.id },
  { id: 'INJ-12', round: 6, title: 'Annual Attestation Cycle Status', body: 'The annual training/attestation cycle status is on the table (EX-SUP-TRAIN), alongside the still-pending Q3/Q4 normalization status, ahead of the annual-closure vote.', workflowIds: ['GV-WF-14', 'GV-WF-05'], supplementalRecordId: GB_SUP_TRAIN_001.id },
];

// ---------------------------------------------------------------------------
// Surveyor interview — hostile but fair
// ---------------------------------------------------------------------------

const SURVEYOR: SurveyorQuestion[] = [
  {
    id: 'SQ-01',
    prompt: 'Show me the record proving your Administrator seat is currently filled by a qualified individual, and explain why your clinician-ID system doesn’t already tell me that directly.',
    options: [
      { id: 'A', text: 'EX-SUP-ADM (Administrator Change Notice) together with EX-DQ-001, which explains why the raw clinician ID alone cannot answer the question.' },
      { id: 'B', text: 'EX-Q1-SIGNOFF, since the Administrator signed the Q1 packet.' },
      { id: 'C', text: 'There is no such record.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-SUP-ADM', 'EX-DQ-001'],
  },
  {
    id: 'SQ-02',
    prompt: 'Show me where you recorded that a conflicted director was excluded from both deliberation and the vote on the vendor contract.',
    options: [
      { id: 'A', text: 'EX-SUP-COI, together with the recusal log required by GB-FORM-RECUSAL-LOG.' },
      { id: 'B', text: 'The Q1 sign-off record.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-SUP-COI'],
  },
  {
    id: 'SQ-03',
    prompt: 'Show me the record proving your Q2 opening census reconciles to your Q1 closing census.',
    options: [
      { id: 'A', text: 'EX-Q1-POPULATION and EX-Q2-POPULATION reconcile cleanly at 120 and 100.' },
      { id: 'B', text: 'No such reconciling record exists — this is an open, unresolved data-quality finding (EX-DQ-002), tracked as such.' },
    ],
    correctId: 'B',
    requiresEvidenceIds: ['EX-DQ-002', 'EX-Q1-POPULATION', 'EX-Q2-POPULATION'],
  },
  {
    id: 'SQ-04',
    prompt: 'Show me why the medication-reconciliation PIP was not closed at Q2.',
    options: [
      { id: 'A', text: 'EX-Q2-QM-MEDREC and EX-Q2-PIP-004-STATUS — a third consecutive below-target quarter, worsening, against a two-consecutive-quarter sustainability criterion.' },
      { id: 'B', text: 'It was closed; see EX-Q1-PIP-004.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-Q2-QM-MEDREC', 'EX-Q2-PIP-004-STATUS'],
  },
  {
    id: 'SQ-05',
    prompt: 'Show me the Board’s actual, real governance record of its decision on the Q1 escalations — not a placeholder.',
    options: [
      { id: 'A', text: 'EX-Q1-SYN-MOTION is the Board’s real decision record.' },
      { id: 'B', text: 'No such real record exists; the only available record (EX-Q1-SYN-MOTION) is a labeled synthetic UAT supplement, and that gap is itself tracked as EX-DQ-003.' },
    ],
    correctId: 'B',
    requiresEvidenceIds: ['EX-DQ-003', 'EX-Q1-SYN-MOTION'],
  },
  {
    id: 'SQ-06',
    prompt: 'Show me that the wound-infection RCA’s systemic root cause was addressed separately from the individual clinician’s disciplinary matter.',
    options: [
      { id: 'A', text: 'EX-Q1-CAP-003 (systemic corrective action) and EX-Q1-DISC-005 (separated personnel matter), both traceable through the evidence chain in EX-Q1-AE-004.' },
      { id: 'B', text: 'They were handled as a single combined matter.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-Q1-CAP-003', 'EX-Q1-DISC-005', 'EX-Q1-AE-004'],
  },
  {
    id: 'SQ-07',
    prompt: 'Show me evidence the proposed scope-of-services change was approved by the Board before any operational start date.',
    options: [
      { id: 'A', text: 'EX-SUP-SCOPE states the licensure amendment and Board approval are prerequisites, not follow-up items, and no operational-start record exists ahead of that approval.' },
      { id: 'B', text: 'EX-DECOY-03, the draft policy revision, shows an approved operational start date.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-SUP-SCOPE'],
  },
  {
    id: 'SQ-08',
    prompt: 'Show me the record confirming the proposed change of ownership was reviewed by the Board before any regulatory filing.',
    options: [
      { id: 'A', text: 'EX-SUP-CHOW states Board review and approval is a prerequisite to filing, not a formality after filing.' },
      { id: 'B', text: 'EX-DECOY-07, a prior 2025 CHOW inquiry.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-SUP-CHOW'],
  },
  {
    id: 'SQ-09',
    prompt: 'Your packet references Q3 growth figures. Why shouldn’t I treat those as validated evidence the same way I treat your Q1/Q2 numbers?',
    options: [
      { id: 'A', text: 'Because EX-Q3-GROWTH-NOTE is explicitly labeled management-reported and unresolved — Q3 has not gone through the same normalization pipeline as Q1/Q2.' },
      { id: 'B', text: 'They should be treated identically since both describe the same agency.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-Q3-GROWTH-NOTE', 'EX-ANNUAL-SUMMARY'],
  },
  {
    id: 'SQ-10',
    prompt: 'Show me which directors had an outstanding training attestation at the start of this cycle, and which one required onboarding before their first vote.',
    options: [
      { id: 'A', text: 'EX-SUP-TRAIN — all seated directors as of 2026-01-15 had an outstanding attestation, and one newly seated director additionally required onboarding before their first vote.' },
      { id: 'B', text: 'EX-DECOY-08, the Board self-evaluation survey.' },
    ],
    correctId: 'A',
    requiresEvidenceIds: ['EX-SUP-TRAIN'],
  },
];

// ---------------------------------------------------------------------------
// Transfer questions — same competency, changed facts
// ---------------------------------------------------------------------------

const TRANSFERS: TransferQuestion[] = [
  {
    id: 'TQ-01',
    changedFacts: ['Two different directors now both disclose a financial interest in the same vendor matter, instead of one.'],
    prompt: 'With two conflicted directors on a 9-seat Board, what is the correct eligible-voter base for computing quorum on this matter?',
    options: [
      { id: 'A', text: '9 (the full roster, since only their votes are barred)' },
      { id: 'B', text: '7 (both conflicted directors excluded from the base, per matter-specific recusal)' },
    ],
    correctId: 'B',
    rationale: 'Every conflicted director on a given matter is excluded from both the vote and the eligible-voter denominator for that matter, regardless of how many directors are conflicted.',
  },
  {
    id: 'TQ-02',
    changedFacts: ['The masked subgroup this quarter is the complaint-resolution-timeliness metric, not OASIS accuracy.'],
    prompt: 'A favorable aggregate hospitalization rate masks a worsening complaint-resolution-timeliness subgroup instead. What is the correct board posture?',
    options: [
      { id: 'A', text: 'Accept the aggregate since hospitalization, not complaints, is the flagship metric.' },
      { id: 'B', text: 'Hold closure on any related PIP and direct further review of the masked complaint-resolution subgroup, exactly as with the original subgroup.' },
    ],
    correctId: 'B',
    rationale: 'The aggregate-vs-subgroup principle does not depend on which specific metric is masked — any favorable aggregate that is flagged as masking a worsening subgroup requires holding closure and directing review.',
  },
  {
    id: 'TQ-03',
    changedFacts: ['PIP-Q1-006 (wound infection) now shows two consecutive quarters at or below 5% across every named wound stratum, with no exceptions.'],
    prompt: 'Given this changed evidence, what is the correct closure eligibility determination for PIP-Q1-006?',
    options: [
      { id: 'A', text: 'Eligible for closure — the approved sustainability criterion is now affirmatively met in every named stratum.' },
      { id: 'B', text: 'Still ineligible, regardless of the evidence, because PIP-Q1-004 remains open.' },
    ],
    correctId: 'A',
    rationale: 'The sustainability-vs-closure principle is not a blanket "never close" rule — closure is correct once the approved criterion is affirmatively demonstrated for every named stratum; each PIP is judged on its own evidence, not tied to another PIP’s status.',
  },
  {
    id: 'TQ-04',
    changedFacts: ['The restricted personnel matter now concerns a billing/coding error rather than a patient-safety escalation-chain failure.'],
    prompt: 'Does the board-vs-management boundary change because the underlying matter is billing-related rather than clinical?',
    options: [
      { id: 'A', text: 'Yes — billing matters are financial, so the Board may direct the specific individual outcome.' },
      { id: 'B', text: 'No — regardless of the underlying subject matter, the Board directs systemic accountability and holds management to it; directing an individual’s discipline remains management’s function.' },
    ],
    correctId: 'B',
    rationale: 'The board-vs-management authority boundary is about the type of decision (systemic vs. individual personnel outcome), not the subject-matter domain of the underlying issue.',
  },
  {
    id: 'TQ-05',
    changedFacts: ['The proposed change is a reduction in scope of services (dropping a service line) rather than an addition.'],
    prompt: 'Does a scope reduction require the same prior-approval sequencing as a scope addition?',
    options: [
      { id: 'A', text: 'Yes — any scope-of-services change, addition or reduction, requires prior Board approval and any required licensure amendment before operational effect.' },
      { id: 'B', text: 'No — reductions may take effect immediately since they carry less risk than additions.' },
    ],
    correctId: 'A',
    rationale: 'The scope-license principle applies to any change to the licensed scope of services; risk direction (adding vs. reducing) does not change the requirement for prior Board approval and licensure alignment.',
  },
  {
    id: 'TQ-06',
    changedFacts: ['The proposed transaction is a minority equity change rather than a majority-interest transfer.'],
    prompt: 'Does a minority equity change automatically trigger the same CHOW workflow and required notifications as the majority transaction in EX-SUP-CHOW?',
    options: [
      { id: 'A', text: 'Yes — any equity change automatically constitutes a change of ownership requiring identical notifications.' },
      { id: 'B', text: 'Not automatically — a minority change may or may not meet the regulatory definition of a change of ownership; the Board must first obtain a legal/regulatory determination of whether the CHOW threshold is met before assuming the full CHOW workflow applies.' },
    ],
    correctId: 'B',
    rationale: 'Unlike the majority-interest transaction, a minority equity change does not automatically meet the regulatory definition of a change of ownership; judgment transfers by recognizing the threshold question itself, not by mechanically re-applying the majority-transaction workflow.',
  },
];

// ---------------------------------------------------------------------------
// Cross-quarter traps — documented for reviewers/QA (not consumed by the engine)
// ---------------------------------------------------------------------------

/**
 * At least four distinct cross-quarter traps are required; this case authors
 * five, each solvable entirely from an in-case exhibit (no hidden keys):
 *  1. Identity collision (DQ-2026-001) — DN-05, INJ-04, SQ-01.
 *  2. Census discontinuity (DQ-2026-002) — DN-11, INJ-06, SQ-03.
 *  3. PIP-Q1-004 sustainability not met across Q1→Q2 — DN-12, DN-13, SQ-04.
 *  4. Q2 aggregate-masks-subgroup (hospitalization vs. med-rec/OASIS/POC/missed-visit) — DN-15.
 *  5. Q3/Q4 normalization-pending treated as if recovered — DN-02, DN-31, SQ-09.
 */
export const CROSS_QUARTER_TRAPS = [
  'DQ-2026-001 identity collision',
  'DQ-2026-002 census discontinuity',
  'PIP-Q1-004 sustainability not met (Q1→Q2)',
  'Q2 aggregate-masks-subgroup (hospitalization vs. med-rec/OASIS/POC/missed-visit)',
  'Q3/Q4 normalization-pending treated as equivalent to recovered evidence',
] as const;

// ---------------------------------------------------------------------------
// Case pack assembly
// ---------------------------------------------------------------------------

export const ANNUAL_2026_CASE: CasePack = {
  id: 'GB-FY2026-ANNUAL-CASE',
  quarter: 'FY2026',
  title: 'Annual 2026 — The Year the Board Must Defend',
  subtitle:
    'A full-year reconciliation of Q1’s baseline QAPI findings, Q2’s integrity failures, and the still-unresolved Q3/Q4 record — closing on a hostile-but-fair CMS/ACHC surveyor interview.',
  estMinutes: 195,
  sourceCutoff:
    '2026-12-31 (FY2026 close). Q1 and Q2 evidence is source-recovered and normalized. Q3 and Q4 remain normalization-pending in QAPI_2026 as of this case’s authoring (see EX-Q3-GROWTH-NOTE, EX-Q4-CLAIMS-NOTE, EX-ANNUAL-SUMMARY) and must never be treated as evidentiarily equivalent to recovered Q1/Q2 records — see DN-02 and DN-31.',
  exhibits: EXHIBITS,
  packetConflictGroups: ANNUAL_PACKET_CONFLICT_GROUPS,
  decisionNodes: DECISION_NODES,
  injects: INJECTS,
  surveyor: SURVEYOR,
  transfers: TRANSFERS,
  requiredWorkflows: requiredForAnnual(),
  passScore: ANNUAL_PASS_SCORE,
  passStandardNote:
    'The FY2026 capstone requires ≥970/1000 with zero critical failures, and every one of the 14 GV-WF workflows must be activated soundly at least once across the attempt (see engine/workflowTriggerEngine.ts).',
};
