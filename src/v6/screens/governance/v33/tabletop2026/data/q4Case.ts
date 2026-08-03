// CasePack: Q4 2026 — "Closure Is Not the Same as Control"
//
// FY2026 Q4 quarterly Governing Body boardroom simulation. Census closes the
// year at 200. Management's FY2026 Annual QAPI Self-Assessment (EX-Q4-001)
// tells a clean story: all 10 PIPs opened during the year are resolved,
// metrics broadly improved, the sepsis-linked personnel matter is "resolved
// via separation," and complaints ran 100% within policy timeframe. The
// Board's job tonight is to test that narrative against the underlying
// record — not to accept or reject it wholesale, but to sort what is
// genuinely earned (medication-reconciliation sustainability) from what is
// not (wound-infection sustainability, the personnel separation, one
// complaint) and from what the narrative omits entirely (a repeated Q4 fall
// pattern with a systemic root cause).
//
// EVIDENTIARY POSTURE — READ BEFORE AUTHORING/CHANGING EXHIBITS:
// QAPI_2026.quarters.Q4 is `normalizationStatus: 'pending'` in the checked-in
// source fixture (../../qapi/data/qapi2026.normalized.ts) — every Q4 field is
// empty. There is therefore NO recovered Q4 source data at all. Every
// Q4-dated exhibit in this pack, including the annual self-assessment itself,
// is authored case content and carries posture 'supplemental_uat' with the
// standard label — it is never presented as if it were recovered from the
// source fixture. Only the Q1/Q2-dated exhibits (EX-Q4-003..012), which
// project real QAPI_2026.Q1/Q2 records, carry posture 'recovered'. This
// distinction is itself the subject of DN-01 (classify_evidence): a Board
// that treats a self-assessment's headline claim as self-authenticating
// recovered evidence has already failed the first test of the evening.
//
// SOURCE CUTOFF: this case is scoped to Q4 close (2026-12-31). Because Q4 is
// the final quarter modeled in the `Quarter` type (see engine/caseTypes.ts —
// there is no post-2026 quarter value to violate), the cutoff discipline here
// is expressed as: nothing dated after 2026-12-31 may be treated as an
// already-settled fact. Forward dates that appear (a CAP due date, a return-
// to-Board date, "resolution expected January 2027") are directives/
// expectations the Board sets tonight, never evidence of completion. Two
// exhibits (EX-Q4-027 open complaint, EX-Q4-029 personnel status) exist
// specifically to test that a learner does not silently treat a stated future
// expectation as if it were already resolved.
//
// VOLUME NOTE: 20 decision nodes (vs. the 14-18 guideline) — see the comment
// above `decisionNodes` for why. Everything else (exhibits, injects, surveyor,
// transfer) sits within the requested ranges.

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
  GB_SUP_ADM_001,
  GB_SUP_BUDGET_001,
  GB_SUP_CHOW_001,
  GB_SUP_CM_001,
  GB_SUP_COI_001,
  GB_SUP_LIC_001,
  GB_SUP_MEDIA_001,
  GB_SUP_PACKET_001,
  GB_SUP_PHI_001,
  GB_SUP_ROSTER_2026,
  GB_SUP_SCOPE_001,
  GB_SUP_TRAIN_001,
  SUPPLEMENTAL_SOURCE_LABEL,
  toExhibit,
} from './qapi2026Supplemental';
import { Q4_PACKET_CONFLICT_GROUPS } from './packetConflictGroups';

// ---------------------------------------------------------------------------
// Exhibits — the Q4 2026 Board Book
// ---------------------------------------------------------------------------

/** Local helper for the many Q4-dated exhibits this pack must author itself
 *  because QAPI_2026.Q4 has no recovered content (see file header). Always
 *  posture 'supplemental_uat' with the standard label — never silently
 *  presented as recovered. */
function authored(input: Omit<Exhibit, 'posture' | 'sourceLabel'>): Exhibit {
  return { ...input, posture: 'supplemental_uat', sourceLabel: SUPPLEMENTAL_SOURCE_LABEL };
}

/** Local helper for exhibits projected from real QAPI_2026 Q1/Q2 records. */
function recovered(input: Omit<Exhibit, 'posture' | 'sourceLabel'>): Exhibit {
  return { ...input, posture: 'recovered' };
}

const EXHIBITS: Exhibit[] = [
  // --- Group A: the annual narrative under test (authored; this is the document the Board is testing) ---
  authored({
    id: 'EX-Q4-001', sourceId: 'GB-SUP-Q4-ANNUAL-001', quarter: 'Q4', asOfDate: '2026-12-28',
    confidentiality: 'public', validationState: 'unvalidated',
    workflowIds: ['GV-WF-05', 'GV-WF-06'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    relevance: 'decision_relevant', section: 'FY2026 Annual Self-Assessment',
    title: 'FY2026 Annual QAPI Self-Assessment — Executive Summary',
    summary: 'Management\'s year-end narrative: all 10 FY2026 PIPs resolved, broad metric improvement, the Q1 sepsis-linked personnel matter "resolved via separation," and complaints 100% within policy timeframe.',
    details: [
      'Claims: "All 10 performance-improvement projects opened in FY2026 have been resolved and may be closed."',
      'Claims: "The personnel matter arising from the Q1 sepsis escalation failure has been resolved via separation."',
      'Claims: "100% of FY2026 complaints were resolved within the policy timeframe."',
      'Recommends the Board formally close QAPI oversight of the medication-reconciliation and wound-infection workstreams this meeting.',
      'Authored for this case because QAPI_2026.Q4 is not yet normalized in the source fixture — not a recovered management document.',
    ],
  }),
  authored({
    id: 'EX-Q4-002', sourceId: 'GB-SUP-Q4-PIPLOG-001', quarter: 'Q4', asOfDate: '2026-12-28',
    confidentiality: 'public', validationState: 'unvalidated',
    workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-CLOSURE'],
    relevance: 'decision_relevant', section: 'FY2026 Annual Self-Assessment',
    title: 'Annual PIP Closure Log — 10 of 10 Reported Resolved',
    summary: 'Tabular log listing 10 FY2026 PIPs, each marked "Resolved," with no stratum-level sustainability detail attached in the log itself.',
    details: [
      'Includes PIP-Q1-004 (Medication Reconciliation) — marked Resolved.',
      'Includes PIP-Q1-006 (Wound Infection Control) — marked Resolved.',
      '8 additional FY2026 PIPs listed by id/title only, each marked Resolved, with no evidence attached in this log.',
      'The log itself is not evidence of sustainability — it asserts a conclusion; the Board must trace each claim to its supporting record.',
    ],
  }),

  // --- Group B: recovered Q1/Q2 history (real QAPI_2026 projections) ---
  recovered({
    id: 'EX-Q4-003', sourceId: 'PIP-Q1-004', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'contextual', section: 'Prior-Quarter Recovered History',
    title: 'PIP-Q1-004 Baseline & Objective — Medication Reconciliation',
    summary: 'Baseline 79.2% at Q1 close against a ≥95% objective; approved sustainability criterion is two consecutive quarters ≥95%.',
    details: [
      'Baseline: Q1 close 79.2% (target ≥95%).',
      'Approved objective: ≥95% medication reconciliation at SOC/ROC.',
      'Sustainability criterion approved by the Board: two consecutive quarters at or above 95%.',
    ],
  }),
  recovered({
    id: 'EX-Q4-004', sourceId: 'CAP-Q1-002', quarter: 'Q1', asOfDate: '2026-04-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'contextual', section: 'Prior-Quarter Recovered History',
    title: 'CAP-Q1-002 — Medication Reconciliation Corrective Action',
    summary: 'Protocol re-education plus a SOC/ROC checklist, owned by the Clinical Manager, due 2026-04-30.',
    details: ['Description: med-rec protocol re-education + checklist at SOC/ROC.', 'Owner: Clinical Manager (Q1 role holder). Due date: 2026-04-30.'],
  }),
  recovered({
    id: 'EX-Q4-005', sourceId: 'PIP-Q1-006', quarter: 'Q1', asOfDate: '2026-04-09',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-AUTHORIZATION'],
    relevance: 'contextual', section: 'Prior-Quarter Recovered History',
    title: 'PIP-Q1-006 Baseline & Objective — Wound Infection Control',
    summary: 'Baseline spike to 10-13% against a ≤5% objective; approved sustainability criterion is two consecutive quarters ≤5% in every named wound stratum.',
    details: [
      'Baseline: Q1 spike to 10-13% (target ≤5%).',
      'Approved objective: ≤5% wound infection rate.',
      'Sustainability criterion approved by the Board: two consecutive quarters ≤5% in all named wound strata — not a quarter-close snapshot.',
    ],
  }),
  recovered({
    id: 'EX-Q4-006', sourceId: 'CAP-Q1-003', quarter: 'Q1', asOfDate: '2026-04-23',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'contextual', section: 'Prior-Quarter Recovered History',
    title: 'CAP-Q1-003 — Wound Infection Protocol Revision + Mandatory In-Service',
    summary: 'Protocol revision plus a mandatory in-service for all clinicians, owned by the Clinical Manager, due 2026-04-23.',
    details: ['Description: wound-infection control protocol revision; mandatory in-service.', 'Owner: Clinical Manager (Q1 role holder). Due date: 2026-04-23.'],
  }),
  recovered({
    id: 'EX-Q4-007', sourceId: 'MOCK-AUD-QA-005', quarter: 'Q2', asOfDate: '2026-07-10',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: [],
    relevance: 'contextual', section: 'Prior-Quarter Recovered History',
    title: 'Q2 Medication-Reconciliation Carry-Forward — Still Below Threshold',
    summary: 'As of Q2 close, medication reconciliation was 70.6% (June) — a third consecutive quarter below threshold, not yet improving.',
    details: ['Q2 evidence: 70.6% (June) — third consecutive quarter below the ≥95% objective.', 'PIP-Q1-004 return date set to 2026-10-09 pending further evidence.'],
  }),
  recovered({
    id: 'EX-Q4-008', sourceId: 'DISC-TRIG-Q1-005', quarter: 'Q1', asOfDate: '2026-03-15',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-09'], formIds: ['GB-FORM-RESTRICTED-MATTER'],
    relevance: 'decision_relevant', section: 'Prior-Quarter Recovered History',
    title: 'Disciplinary Matter — Failure to Follow Escalation Chain (Patient Safety)',
    summary: 'Sepsis signs documented on 2026-03-02 were not escalated for 36 hours; the patient was hospitalized. Status at the time: RCA pending, disciplinary hold.',
    details: [
      'Clinician reference: MOCK-CLIN-0004 (Q1-scoped id; see DQ-2026-001 — do not merge across quarters on raw id).',
      'Finding: sepsis signs present on a prior visit note but not escalated for 36 hours.',
      'Recommended action on file: immediate retraining + supervision. Status on file: RCA pending — disciplinary hold.',
      'This is the matter EX-Q4-029/030 report on as of Q4 — track by triggerId, not by clinician id.',
    ],
  }),
  recovered({
    id: 'EX-Q4-009', sourceId: 'AE-Q1-004', quarter: 'Q1', asOfDate: '2026-03-03',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08', 'GV-WF-09'], formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'contextual', section: 'Prior-Quarter Recovered History',
    title: 'Adverse Event — Sepsis Hospitalization (RCA In Progress)',
    summary: 'Critical-severity sepsis hospitalization; RCA found infection signs present on a prior visit note but not escalated for 36 hours. Linked to CAP-Q1-003 and to DISC-TRIG-Q1-005.',
    details: ['Severity: Critical. RCA required: yes. Systemic root cause: escalation/reporting chain failure.', 'Linked CAP: CAP-Q1-003. Status as of Q2: RCA In Progress.'],
  }),
  recovered({
    id: 'EX-Q4-010', sourceId: 'DQ-2026-002', quarter: 'Q2', asOfDate: '2026-07-10',
    confidentiality: 'public', validationState: 'conflicting', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Prior-Quarter Recovered History',
    title: 'Data-Quality Finding — Census Carry-Forward Does Not Reconcile Q1→Q2',
    summary: 'Q1 closed at 120 active patients; Q2 opened at 100. The 20-patient gap is not explained by recorded Q2 discharges/transfers.',
    details: ['Warning-severity finding, unresolved as of Q2.', 'Not itself a required citation for any Q4 decision this meeting — no Q4 decision turns on the Q1→Q2 boundary.'],
  }),
  recovered({
    id: 'EX-Q4-011', sourceId: 'DQ-2026-001', quarter: 'Q2', asOfDate: '2026-07-10',
    confidentiality: 'public', validationState: 'conflicting', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Prior-Quarter Recovered History',
    title: 'Data-Quality Finding — Clinician IDs Reused for Different People Across Quarters',
    summary: 'The MOCK-CLIN-* roster is fully reassigned between Q1 and Q2; the same raw id denotes different people quarter to quarter.',
    details: ['Critical-severity finding: cross-quarter person-level analysis must not merge on raw clinician id.', 'Relevant to how EX-Q4-008 is read, but does not itself resolve or control any Q4 decision.'],
  }),
  recovered({
    id: 'EX-Q4-012', sourceId: 'DISC-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-01-25',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decoy', section: 'Prior-Quarter Recovered History',
    title: 'Disciplinary Matter — Unauthorized Documentation Change After Chart Review (Different Matter)',
    summary: 'A separate Q1 disciplinary matter: a visit note amended 11 days after entry without documented reason. This is NOT the matter reported on in EX-Q4-029/030.',
    details: ['Clinician reference: MOCK-CLIN-0003 — a different individual and a different triggerId than DISC-TRIG-Q1-005.', 'Included to test whether the Board conflates the two open Q1 disciplinary matters.'],
  }),

  // --- Group C: Q4 quality metrics and PIP sustainability (authored) ---
  authored({
    id: 'EX-Q4-013', sourceId: 'GB-SUP-Q4-METRIC-WOUND', quarter: 'Q4', asOfDate: '2026-12-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'Q4 Monthly Wound-Infection Rate — October / November / December',
    summary: 'Oct 8.1% (above the ≤5% threshold), Nov 4.2% (within), Dec 3.6% (within). The quarter-close snapshot alone reads favorable.',
    details: [
      'October: 8.1% — critical, above the ≤5% threshold.',
      'November: 4.2% — within threshold.',
      'December: 3.6% — within threshold.',
      'A reviewer looking only at the December (quarter-end) figure would see a passing rate; the October month is the one that breaks the quarter.',
    ],
  }),
  authored({
    id: 'EX-Q4-014', sourceId: 'GB-SUP-Q4-POPULATION', quarter: 'Q4', asOfDate: '2026-12-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'contextual', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'Q4 Population & Census Summary',
    summary: 'Active at Q4 start: 168. Active at Q4 close: 200. Clinician count: 34. Census grew for a third consecutive quarter.',
    details: ['activeAtStart 168, activeAtClose 200, clinicianCount 34.', 'Census-at-close (200) is a snapshot count, not a monthly at-risk denominator — see EX-Q4-017.'],
  }),
  authored({
    id: 'EX-Q4-015', sourceId: 'GB-SUP-Q4-PIP004-EVID', quarter: 'Q4', asOfDate: '2026-12-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-CLOSURE'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'PIP-Q1-004 Q4 Sustainability Evidence — Medication Reconciliation',
    summary: 'Oct 95.2%, Nov 96.1%, Dec 96.8% — every Q4 month at or above the 95% objective.',
    details: ['All three Q4 months individually meet or exceed the ≥95% objective.', 'Paired with EX-Q4-016 (Q3), this is the second of two consecutive qualifying quarters.'],
  }),
  authored({
    id: 'EX-Q4-016', sourceId: 'GB-SUP-Q3-PIP004-EVID', quarter: 'Q3', asOfDate: '2026-09-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-CLOSURE'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'PIP-Q1-004 Q3 Sustainability Addendum — Medication Reconciliation',
    summary: 'Q3 quarter average 95.5% — the first of the two consecutive qualifying quarters required for closure.',
    details: ['Q3 average 95.5%, at or above the ≥95% objective in every Q3 month.', 'Authored to carry the Q3 evidence forward since QAPI_2026.Q3 is also not yet normalized in the source fixture.'],
  }),
  authored({
    id: 'EX-Q4-017', sourceId: 'GB-SUP-Q4-PIP006-TEST', quarter: 'Q4', asOfDate: '2026-12-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-CLOSURE'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'Wound-Infection Sustainability Test — Monthly-Stratum Explainer',
    summary: 'The Board-approved criterion (EX-Q4-005) requires ≤5% in every named month/stratum across two consecutive qualifying quarters. October\'s 8.1% breaches the criterion within Q4 itself.',
    details: [
      'Because the criterion is evaluated per named stratum (here: per month), a single above-threshold month disqualifies the whole quarter as a "qualifying quarter" — regardless of how the other months or the quarter average look.',
      'Q4 cannot count as a qualifying quarter for PIP-Q1-006. Two consecutive qualifying quarters have not yet been demonstrated.',
      'This is the direct rebuttal to EX-Q4-001/002\'s claim that PIP-Q1-006 is resolved.',
    ],
  }),
  authored({
    id: 'EX-Q4-018', sourceId: 'GB-SUP-Q4-CAP003-ATTEST', quarter: 'Q4', asOfDate: '2026-12-15',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'CAP-Q1-003 Effectiveness Attestation — Q4',
    summary: '27 of 28 required clinicians completed the mandatory wound-infection in-service; 1 remains outstanding.',
    details: ['Completion: 27/28 (96.4%). One clinician outstanding — see EX-Q4-019.', 'The CAP\'s own design requires full completion, not a completion rate, before effectiveness is attested.'],
  }),
  authored({
    id: 'EX-Q4-019', sourceId: 'GB-SUP-Q4-TRAINEXC-001', quarter: 'Q4', asOfDate: '2026-12-10',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'Training Exception Notice — Clinician Non-Completion',
    summary: 'One clinician has been overdue for the CAP-Q1-003 mandatory wound-infection in-service since Q3; a second overdue notice was reissued 2026-12-10; not yet completed as of packet close.',
    details: ['Overdue since Q3. Overdue notice reissued 2026-12-10. Not completed as of 2026-12-31.', 'Until completed, CAP-Q1-003 effectiveness cannot be fully attested — see RTF-BC-01 principle.'],
  }),
  authored({
    id: 'EX-Q4-020', sourceId: 'GB-SUP-Q4-CAP002-ATTEST', quarter: 'Q4', asOfDate: '2026-12-15',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'CAP-Q1-002 Effectiveness Attestation — Complete',
    summary: '100% completion of the medication-reconciliation re-education and checklist rollout; effectiveness demonstrated.',
    details: ['Completion: 28/28 (100%).', 'Effectiveness demonstrated — this supports (does not by itself decide) PIP-Q1-004 closure eligibility alongside EX-Q4-015/016.'],
  }),
  authored({
    id: 'EX-Q4-021', sourceId: 'GB-SUP-Q4-CAPCARRY-001', quarter: 'Q4', asOfDate: '2026-12-30',
    confidentiality: 'public', validationState: 'validated', workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
    relevance: 'decision_relevant', section: 'Q4 Quality Metrics & PIP Sustainability',
    title: 'Open CAP Carry-Forward Log — Into 2027',
    summary: 'Two CAPs remain open past year-end: CAP-Q1-003 (wound infection, pending the training exception) and a new fall-prevention CAP opened in Q4, due Q1 2027.',
    details: ['CAP-Q1-003: open, pending EX-Q4-019 resolution.', 'New fall-prevention CAP (see EX-Q4-025): opened Q4, due date to be set by the Board tonight (DN-12).', 'This log is itself the direct rebuttal to any reading of EX-Q4-001/002 as "zero open corrective actions."'],
  }),

  // --- Group D: the Q4 fall pattern the annual narrative omits (authored) ---
  authored({
    id: 'EX-Q4-022', sourceId: 'GB-SUP-Q4-FALL-OCT', quarter: 'Q4', asOfDate: '2026-10-24',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08'], formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'decision_relevant', section: 'Fall Pattern',
    title: 'Adverse Event Log — Falls, October',
    summary: 'Two falls in October, one with minor injury; both occurred within days of a medication change with no repeat fall-risk reassessment documented.',
    details: ['2 falls. 1 with minor injury (bruising, no fracture).', 'Both preceded by a medication change in the prior 5 days; no repeat fall-risk reassessment on file for either.'],
  }),
  authored({
    id: 'EX-Q4-023', sourceId: 'GB-SUP-Q4-FALL-NOV', quarter: 'Q4', asOfDate: '2026-11-21',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08'], formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'decision_relevant', section: 'Fall Pattern',
    title: 'Adverse Event Log — Falls, November',
    summary: 'Two more falls in November, same pattern: recent medication change, no repeat fall-risk reassessment. Different patients and clinicians, same care team.',
    details: ['2 falls, no injury reported.', 'Same pattern as October: recent medication change, no repeat fall-risk reassessment.', 'Different clinicians than October — rules out a single-clinician explanation.'],
  }),
  authored({
    id: 'EX-Q4-024', sourceId: 'GB-SUP-Q4-FALL-DEC', quarter: 'Q4', asOfDate: '2026-12-18',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08'], formIds: ['GB-FORM-RCA-ESCALATION'],
    relevance: 'decision_relevant', section: 'Fall Pattern',
    title: 'Adverse Event Log — Falls, December',
    summary: 'Two more falls in December; an RCA is opened given the third consecutive month of the same pattern.',
    details: ['2 falls. RCA required: yes.', 'Preliminary finding flags a common gap: fall-risk reassessment is not being repeated after medication changes agency-wide.'],
  }),
  authored({
    id: 'EX-Q4-025', sourceId: 'GB-SUP-Q4-FALL-RCA', quarter: 'Q4', asOfDate: '2026-12-20',
    confidentiality: 'restricted', validationState: 'validated', workflowIds: ['GV-WF-08', 'GV-WF-07'], formIds: ['GB-FORM-RCA-ESCALATION', 'GB-FORM-BUDGET-AUTHORIZATION'],
    relevance: 'decision_relevant', section: 'Fall Pattern',
    title: 'Fall Pattern RCA Summary — Q4',
    summary: 'Six falls across October-December share a systemic root cause: fall-risk reassessment is not being repeated after medication changes. Recommends a new PIP and CAP, and flags the resourcing already requested in EX-Q4-042 as the mechanism to sustain it.',
    details: [
      '6 falls, October-December, across multiple patients and clinicians.',
      'Systemic root cause: fall-risk reassessment protocol not triggered after medication changes.',
      'Recommendation: open a new PIP + CAP; resourcing (0.5 FTE quality-review time) already requested in EX-Q4-042 would sustain the fix.',
      'This finding does not appear anywhere in EX-Q4-001 (see EX-Q4-026).',
    ],
  }),
  authored({
    id: 'EX-Q4-026', sourceId: 'GB-SUP-Q4-ANNUAL-AE-SECTION', quarter: 'Q4', asOfDate: '2026-12-28',
    confidentiality: 'public', validationState: 'unvalidated', workflowIds: ['GV-WF-08'], formIds: [],
    relevance: 'conflicting', section: 'Fall Pattern',
    title: 'Annual Self-Assessment — Adverse Event Section (Falls Omitted)',
    summary: 'The annual self-assessment\'s adverse-event section states "no new systemic adverse-event findings this year" — it does not mention the Q4 fall cluster or RCA at all.',
    details: ['Verbatim posture of the section: "no new systemic adverse-event findings this year."', 'Directly conflicts with EX-Q4-022 through EX-Q4-025.'],
  }),

  // --- Group E: complaints ---
  authored({
    id: 'EX-Q4-027', sourceId: 'GB-SUP-Q4-COMPLAINTS', quarter: 'Q4', asOfDate: '2026-12-31',
    confidentiality: 'public', validationState: 'validated', workflowIds: [], formIds: [],
    relevance: 'decision_relevant', section: 'Complaints',
    title: 'Complaint Log — Q4 New Intake',
    summary: 'Three Q4 complaints: two resolved within 5 days; one — care-coordination, opened 2026-12-18 — remains open at year-end with resolution expected January 2027.',
    details: [
      '2 complaints resolved within 5 days (policy timeframe met).',
      '1 complaint open: category "care coordination — medication change not communicated to family," opened 2026-12-18, status open as of 2026-12-31, resolution expected January 2027.',
      'A resolution "expected" in January 2027 is a plan, not a completed fact — do not treat it as already resolved.',
    ],
  }),
  authored({
    id: 'EX-Q4-028', sourceId: 'GB-SUP-Q4-ANNUAL-COMPLAINT-CLAIM', quarter: 'Q4', asOfDate: '2026-12-28',
    confidentiality: 'public', validationState: 'unvalidated', workflowIds: [], formIds: [],
    relevance: 'conflicting', section: 'Complaints',
    title: 'Annual Self-Assessment — Complaint Resolution Claim',
    summary: 'The self-assessment states "100% of FY2026 complaints were resolved within the policy timeframe" — contradicted by the complaint still open in EX-Q4-027.',
    details: ['Verbatim claim: "100% of FY2026 complaints were resolved within the policy timeframe."', 'Directly conflicts with EX-Q4-027, which shows one complaint open at year-end.'],
  }),

  // --- Group F: restricted personnel matter (separation in process) ---
  authored({
    id: 'EX-Q4-029', sourceId: 'GB-SUP-Q4-PERSONNEL-STATUS', quarter: 'Q4', asOfDate: '2026-12-22',
    confidentiality: 'executive_session', validationState: 'validated', workflowIds: ['GV-WF-09'], formIds: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES'],
    relevance: 'decision_relevant', section: 'Restricted Personnel Matter',
    title: 'Restricted Personnel Matter Status Update — Q4 (Executive Session)',
    summary: 'The separation process tied to DISC-TRIG-Q1-005 has been initiated but is not finalized; an interim supervision plan is in place; no final separation date is set.',
    details: [
      'Status: separation in process, not finalized. Interim supervision plan in effect since Q3.',
      'No final separation date has been set as of 2026-12-22.',
      'Restricted to executive session — the individual\'s identity and clinical detail are not for the public record.',
    ],
  }),
  authored({
    id: 'EX-Q4-030', sourceId: 'GB-SUP-Q4-ANNUAL-PERSONNEL-CLAIM', quarter: 'Q4', asOfDate: '2026-12-28',
    confidentiality: 'restricted', validationState: 'unvalidated', workflowIds: ['GV-WF-09'], formIds: [],
    relevance: 'conflicting', section: 'Restricted Personnel Matter',
    title: 'Annual Self-Assessment — Personnel/Accountability Claim',
    summary: 'The self-assessment states the matter is "resolved via separation" — contradicted by EX-Q4-029, which shows the separation still in process.',
    details: ['Verbatim claim: "resolved via separation."', 'Directly conflicts with EX-Q4-029\'s "in process, not finalized" status.'],
  }),

  // --- Group G: governance items required this quarter (reuse qapi2026Supplemental.ts records) ---
  toExhibit(GB_SUP_ROSTER_2026, {
    exhibitId: 'EX-Q4-031', quarter: 'Q4', section: 'Governance — Roster & Attestation',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
  }),
  toExhibit(GB_SUP_COI_001, {
    exhibitId: 'EX-Q4-032', quarter: 'Q4', section: 'Governance — Conflicts & Recusals',
    confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
  }),
  toExhibit(GB_SUP_LIC_001, {
    exhibitId: 'EX-Q4-033', quarter: 'Q4', section: 'Governance — Licensure & Accreditation',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-LICENSURE-RENEWAL'],
  }),
  toExhibit(GB_SUP_TRAIN_001, {
    exhibitId: 'EX-Q4-034', quarter: 'Q4', section: 'Governance — Roster & Attestation',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-TRAINING-ATTESTATION'],
  }),
  toExhibit(GB_SUP_PACKET_001, {
    exhibitId: 'EX-Q4-035', quarter: 'Q4', section: 'Governance — Packet Readiness',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-PACKET-READINESS'],
  }),
  toExhibit(GB_SUP_BUDGET_001, {
    exhibitId: 'EX-Q4-042', quarter: 'Q4', section: 'Governance — CAP Resourcing',
    confidentiality: 'public', validationState: 'validated', relevance: 'decision_relevant',
    formIds: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
  }),

  // --- Decoy governance items (present in the packet; not decision-relevant this quarter) ---
  toExhibit(GB_SUP_ADM_001, {
    exhibitId: 'EX-Q4-036', quarter: 'Q4', section: 'Governance — Roster & Attestation',
    confidentiality: 'public', validationState: 'unvalidated', relevance: 'decoy',
  }),
  toExhibit(GB_SUP_CM_001, {
    exhibitId: 'EX-Q4-037', quarter: 'Q4', section: 'Governance — Roster & Attestation',
    confidentiality: 'public', validationState: 'unvalidated', relevance: 'decoy',
  }),
  toExhibit(GB_SUP_SCOPE_001, {
    exhibitId: 'EX-Q4-038', quarter: 'Q4', section: 'Governance — Scope of Services',
    confidentiality: 'public', validationState: 'unvalidated', relevance: 'decoy',
  }),
  toExhibit(GB_SUP_CHOW_001, {
    exhibitId: 'EX-Q4-039', quarter: 'Q4', section: 'Governance — Change of Ownership',
    confidentiality: 'public', validationState: 'unvalidated', relevance: 'decoy',
  }),
  toExhibit(GB_SUP_MEDIA_001, {
    exhibitId: 'EX-Q4-040', quarter: 'Q4', section: 'Governance — Media & Privacy',
    confidentiality: 'restricted', validationState: 'unvalidated', relevance: 'decoy',
  }),
  toExhibit(GB_SUP_PHI_001, {
    exhibitId: 'EX-Q4-041', quarter: 'Q4', section: 'Governance — Media & Privacy',
    confidentiality: 'restricted', validationState: 'unvalidated', relevance: 'decoy',
  }),
];

// ---------------------------------------------------------------------------
// Decision nodes
// ---------------------------------------------------------------------------
//
// 20 nodes, not 14-18. Every InteractionKind maps to exactly one
// ScoreDimensionKey (engine/scoring.ts dimensionForKind) and each dimension's
// weight (caseTypes.SCORE_DIMENSION_WEIGHTS) is fixed. To keep the case
// actually passable at its 950/1000 standard, each dimension's authored
// pointsAvailable must SUM to its full weight (workflow_authority=150 and
// decision_proportionality=150 in particular need more than one or two thin
// nodes to reach that sum without inflating any single node past a
// defensible point value). Extending to 20 nodes — all genuine, distinct
// matters, no duplicates — was the more honest fix vs. capping at 18 and
// leaving the case mathematically unpassable. See the per-dimension tally:
//   evidence_integrity   (150): DN-01, DN-04, DN-10, DN-13  = 40+40+40+30
//   meeting_legality      (150): DN-02, DN-03, DN-14        = 50+50+50
//   qapi_judgment         (200): DN-05, DN-06, DN-11, DN-18, DN-19 = 40*5
//   workflow_authority    (150): DN-07, DN-08              = 75+75
//   decision_proportionality (150): DN-09, DN-12, DN-17, DN-20 = 40+40+40+30
//   records_forms         (100): DN-15, DN-16              = 50+50
//   surveyor_transfer     (100): automatic from 6 surveyor + 4 transfer items

const DECISION_NODES: DecisionNode[] = [
  // ===================== ROUND 0 — Pre-meeting intake =====================
  {
    id: 'DN-01', matterId: 'M-INTAKE', round: 0, kind: 'classify_evidence',
    title: 'Sort the Packet by Evidentiary Posture',
    prompt: 'Before convening, classify EX-Q4-001 (Annual Self-Assessment) and EX-Q4-002 (PIP Closure Log) by evidentiary posture and decide how much weight they carry on their own.',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-05'], pointsAvailable: 40,
    options: [
      { id: 'DN-01-A', text: 'Treat EX-Q4-001/002 as posture "recovered" — they are the agency\'s official annual report and speak for themselves.' },
      { id: 'DN-01-B', text: 'Treat EX-Q4-001/002 as posture "supplemental_uat": QAPI_2026 Q4 is not yet normalized in the source of record, so nothing Q4-dated is recovered evidence; only EX-Q4-003 through EX-Q4-012 (Q1/Q2-dated) are recovered. The self-assessment\'s claims must each be traced to a supporting record before the Board relies on them.', correct: true },
      { id: 'DN-01-C', text: 'Refuse to open the packet at all until Q4 is formally normalized in the source system.' },
      { id: 'DN-01-D', text: 'Approve the annual report as the official year-end record tonight without further evidence tracing.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q4-001', 'EX-Q4-002'],
    modelAction: null,
    rationale: 'Posture is a fact about the record, not about how confidently it is written. EX-Q4-001/002 are authored Q4 narrative content — they are not recovered evidence and cannot substitute for the underlying quarter/CAP/adverse-event records that would actually prove or disprove their claims.',
    alternativesWhyFail: [
      'Treating the self-assessment as recovered lets a confidently-written conclusion stand in for evidence — exactly the failure mode this case is built to test.',
      'Refusing to open the packet at all is an overreaction that blocks the Board from doing the evidence-tracing work it actually needs to do.',
      'Approving the report as final without tracing its claims adopts an unverified narrative as the official record.',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS', 'GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Packet readiness (source integrity, feeder audits, sign-offs, no unresolved critical data-quality defect) must be checked before the Board convenes on the substance of any matter.',
    consequences: {
      patientSafety: 'Accepting an unverified favorable narrative delays the Board from directing action on real, unresolved risk.',
      regulatory: 'A survey review would treat an adopted-but-untraced annual claim as a records-integrity defect.',
      financial: 'No direct cost; misallocated oversight attention is the real cost.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The Board\'s minutes must reflect that claims were traced to evidence, not adopted on their face.',
    },
  },
  {
    id: 'DN-02', matterId: 'M-INTAKE', round: 0, kind: 'quorum_calc',
    title: 'Quorum Check — General Session and the Vendor Matter',
    prompt: 'Compute quorum for tonight\'s general session and separately for the vendor conflict-of-interest matter (EX-Q4-032), where the disclosing director must recuse.',
    competencyIds: ['quorum-recusal'], workflowIds: ['GV-WF-02'], pointsAvailable: 50,
    requiredEvidenceIds: ['EX-Q4-031', 'EX-Q4-032'],
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
    rationale: 'One seat is vacant (the outgoing community-member director\'s term expired 2026-01-31, replacement not yet seated), leaving 6 eligible directors; a majority of 6 is 4, and all 6 are present, so general quorum is met. For the vendor matter, the disclosing director recuses, dropping the eligible-voter pool to 5; a majority of 5 is 3, and 5 remain present and eligible, so quorum is still met for that specific vote.',
    alternativesWhyFail: [
      'Counting the vacant seat toward the eligible total overstates the quorum base.',
      'Counting the recused director toward the vendor-matter quorum (rather than removing them from that denominator) would let a conflicted member\'s mere presence help manufacture the quorum they are not entitled to help form.',
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
    id: 'DN-03', matterId: 'M-INTAKE', round: 0, kind: 'session_classification',
    title: 'Classify Tonight\'s Session Structure',
    prompt: 'Given the restricted personnel matter on tonight\'s agenda (EX-Q4-029), how should the meeting be structured between public and executive session?',
    competencyIds: ['executive-session'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-03-A', text: 'Open in public session; move to executive session by recorded motion for the restricted personnel matter only; return to public session by recorded motion to close with any authorized public action.', correct: true },
      { id: 'DN-03-B', text: 'Discuss the personnel matter\'s clinical and identifying detail in public session so all stakeholders are informed.', criticalFailure: true },
      { id: 'DN-03-C', text: 'Hold the entire meeting in executive session with no public record at all.', criticalFailure: true },
      { id: 'DN-03-D', text: 'Skip executive session and handle the personnel matter entirely by email between meetings.' },
    ],
    requiredEvidenceIds: ['EX-Q4-029'],
    modelAction: null,
    rationale: 'Confidentiality protects the substance of a restricted personnel deliberation, not the fact that governance occurred. The correct structure isolates the restricted matter in a properly gated executive session while keeping the rest of the meeting, and the fact/outcome of the executive session itself, on the public record.',
    alternativesWhyFail: [
      'Discussing identifying/clinical personnel detail in public session is a privacy failure with no policy basis.',
      'Holding the whole meeting in executive session with no public record breaks public accountability for every other matter decided that night.',
      'Handling the matter by email outside a recorded session leaves no defensible governance record at all.',
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

  // ===================== ROUND 1 — Annual narrative & PIP portfolio =====================
  {
    id: 'DN-04', matterId: 'M-PIP-PORTFOLIO', round: 1, kind: 'reconcile_conflict',
    title: 'Reconcile the Annual Claim Against the Q4 Wound-Infection Detail',
    prompt: 'EX-Q4-001/002 report PIP-Q1-006 (wound infection) as resolved. EX-Q4-013 and EX-Q4-017 show an October spike to 8.1%. Reconcile the conflict.',
    competencyIds: ['pip-closure-sustainability', 'aggregate-vs-subgroup'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    options: [
      { id: 'DN-04-A', text: 'Hold closure on PIP-Q1-006. The approved sustainability criterion requires ≤5% in every named month across two consecutive qualifying quarters; October\'s 8.1% breaches that criterion within Q4 itself, regardless of the favorable November/December snapshot.', correct: true },
      { id: 'DN-04-B', text: 'Accept the self-assessment\'s claim because December, the quarter-end figure, is within threshold.' },
      { id: 'DN-04-C', text: 'Reject all 10 claimed PIP closures outright without reviewing each one individually.' },
      { id: 'DN-04-D', text: 'Approve the annual self-assessment as submitted, including the wound-infection closure claim, without further review.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q4-001', 'EX-Q4-013', 'EX-Q4-017'],
    modelAction: null,
    rationale: 'Sustainability is tested per named stratum (here, per month) across two full qualifying quarters, not by the quarter-end snapshot. October alone breaks Q4 as a qualifying quarter for PIP-Q1-006.',
    alternativesWhyFail: [
      'Anchoring on the December figure is the exact aggregate-masks-subgroup pattern the Board exists to catch.',
      'Rejecting every claimed closure without individual review would also wrongly sweep in PIP-Q1-004, which does genuinely qualify (see DN-05).',
      'Approving the report as submitted adopts a claim the Board\'s own evidence directly contradicts.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'PIP closure/hold decisions are made at the quarterly review; a hold decision returns the PIP to the next quarter\'s packet.',
    consequences: {
      patientSafety: 'Prematurely closing wound-infection oversight during an unresolved spike risks a repeat or worsening cluster going unmonitored.',
      regulatory: 'A closure decision inconsistent with the Board\'s own approved sustainability criterion is not defensible on survey.',
      financial: 'Continued CAP/PIP oversight carries the resourcing cost already requested in EX-Q4-042.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The annual report cannot be adopted with an uncorrected wound-infection closure claim.',
    },
  },
  {
    id: 'DN-05', matterId: 'M-PIP-PORTFOLIO', round: 1, kind: 'eligibility',
    title: 'PIP-Q1-004 (Medication Reconciliation) Closure Eligibility',
    prompt: 'Is PIP-Q1-004 genuinely eligible for closure this quarter?',
    competencyIds: ['pip-closure-sustainability'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    options: [
      { id: 'DN-05-A', text: 'Yes — authorize closure. Q3 (EX-Q4-016) and Q4 (EX-Q4-015) each independently meet the ≥95% objective in every month, satisfying the two-consecutive-quarter sustainability criterion, and CAP-Q1-002 effectiveness is fully attested (EX-Q4-020).', correct: true },
      { id: 'DN-05-B', text: 'No — hold closure because the PIP was still failing as recently as Q2 (EX-Q4-007).' },
      { id: 'DN-05-C', text: 'Yes — the self-assessment says it is resolved, and no further evidence review is required.', criticalFailure: true },
      { id: 'DN-05-D', text: 'Defer the decision indefinitely pending Q1 2027 data.' },
    ],
    requiredEvidenceIds: ['EX-Q4-003', 'EX-Q4-015', 'EX-Q4-016', 'EX-Q4-020'],
    modelAction: null,
    rationale: 'Unlike wound infection, medication reconciliation genuinely earned closure: two full consecutive qualifying quarters (Q3 and Q4) at or above the 95% objective in every month, with CAP effectiveness fully attested. The Board\'s duty to challenge the annual narrative cuts both ways — a correct claim should be authorized, not held out of reflexive skepticism.',
    alternativesWhyFail: [
      'Holding closure based on Q2\'s still-failing evidence ignores that the sustainability criterion is about the two most recent qualifying quarters, which Q2 is not.',
      'Approving solely because the self-assessment says so skips the evidence-tracing step this whole case is testing, even though the underlying conclusion happens to be right here.',
      'Indefinite deferral without a stated reason is not a defensible governance action.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE', 'GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: 'Closure decisions are made at the quarterly review once the current quarter\'s evidence is available.',
    consequences: {
      patientSafety: 'Correctly closing a genuinely resolved PIP frees oversight capacity for the matters that still need it (wound infection, falls).',
      regulatory: 'A closure decision fully supported by evidence and CAP effectiveness is defensible on survey.',
      financial: 'CAP-Q1-002 resourcing may be released once closure is authorized.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The closure record must cite both quarters\' evidence and the effectiveness attestation, not the self-assessment alone.',
    },
  },
  {
    id: 'DN-06', matterId: 'M-PIP-PORTFOLIO', round: 1, kind: 'disposition',
    title: 'PIP-Q1-006 (Wound Infection) Formal Disposition',
    prompt: 'Given DN-04\'s reconciliation, formally dispose of PIP-Q1-006 for the record.',
    competencyIds: ['pip-closure-sustainability', 'aggregate-vs-subgroup'], workflowIds: ['GV-WF-06'], pointsAvailable: 40,
    options: [
      { id: 'DN-06-A', text: 'Do not close. Direct continued monitoring into Q1 2027; require the CAP-Q1-003 training exception (EX-Q4-019) resolved before re-assessment; return to the Board next quarter with a full two-quarter monthly-stratum test.', correct: true },
      { id: 'DN-06-B', text: 'Approve full closure of PIP-Q1-006 as claimed in the self-assessment.', criticalFailure: true },
      { id: 'DN-06-C', text: 'Close the PIP but keep the CAP open indefinitely with no return date.' },
      { id: 'DN-06-D', text: 'Downgrade the PIP to informal monitoring outside the formal QAPI packet process.' },
    ],
    requiredEvidenceIds: ['EX-Q4-013', 'EX-Q4-017', 'EX-Q4-018', 'EX-Q4-019', 'EX-Q4-021'],
    modelAction: null,
    rationale: 'The disposition must match the sustainability finding: hold, not close, with a concrete condition (the training exception) and a concrete return point (next quarter), not an open-ended or informal downgrade.',
    alternativesWhyFail: [
      'Closing as claimed adopts a conclusion the Board\'s own evidence disproves — the exact critical failure this matter is built to catch.',
      'Closing the PIP while leaving the CAP open with no return date creates an oversight gap: the underlying risk (untrained clinician, unresolved October spike) has no forcing function to come back to the Board.',
      'Moving to informal monitoring removes the matter from the formal packet process the Board itself approved as controlling.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE', 'GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'A held (non-closed) PIP returns to the Board at the next quarterly meeting with updated evidence.',
    consequences: {
      patientSafety: 'Continued monitoring keeps a real, unresolved infection-control gap on the Board\'s radar.',
      regulatory: 'A hold decision grounded in the approved criterion is defensible; a closure that ignores it is not.',
      financial: 'Continued CAP oversight carries the resourcing already requested (EX-Q4-042).',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The packet-review record must reflect the hold and its specific condition, not a silent closure.',
    },
  },
  {
    id: 'DN-07', matterId: 'M-PIP-PORTFOLIO', round: 1, kind: 'workflow_select',
    title: 'Which Workflow Governs Tonight\'s Wound-Infection Decision?',
    prompt: 'Select the Governing Body workflow that is authoritative for the PIP-Q1-006 hold decision made in DN-06.',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-06'], pointsAvailable: 75,
    options: [
      { id: 'DN-07-A', text: 'GV-WF-06 — PIP Authorization, Sustainability Review & Closure', correct: true },
      { id: 'DN-07-B', text: 'GV-WF-08 — Adverse Event Root-Cause Escalation' },
      { id: 'DN-07-C', text: 'GV-WF-05 — Quarterly QAPI Packet Review & Decision' },
      { id: 'DN-07-D', text: 'GV-WF-07 — Corrective Action Plan & Budget/Resource Authorization' },
    ],
    requiredEvidenceIds: ['EX-Q4-013', 'EX-Q4-017'],
    modelAction: null,
    rationale: 'A PIP sustainability/closure decision is authoritative under GV-WF-06, distinct from the CAP-effectiveness workflow (GV-WF-07) it depends on and from the general packet-review workflow (GV-WF-05) that convenes the meeting itself.',
    alternativesWhyFail: [
      'GV-WF-08 governs adverse-event RCA escalation (the separate fall matter), not a PIP sustainability decision.',
      'GV-WF-05 is the packet-convening workflow, not the specific decision workflow for a named PIP.',
      'GV-WF-07 governs the CAP\'s own effectiveness/resourcing, which is a related but distinct decision from the PIP disposition itself.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'Workflow classification determines which forms and authority chain apply and must be settled before the vote is recorded.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'Misclassifying the governing workflow can misdirect the required forms and authority chain.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The minutes must cite the correct workflow so the decision\'s authority is traceable.',
    },
  },
  {
    id: 'DN-08', matterId: 'M-PIP-PORTFOLIO', round: 1, kind: 'forms_select',
    title: 'Forms Required to Document Tonight\'s PIP Decisions',
    prompt: 'Select every form required to document tonight\'s PIP-Q1-004 closure and PIP-Q1-006 hold decisions.',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-06'], pointsAvailable: 75,
    options: [
      { id: 'DN-08-A', text: 'GB-FORM-PIP-CLOSURE (for both the PIP-Q1-004 closure and the PIP-Q1-006 hold-decision record)', correct: true },
      { id: 'DN-08-B', text: 'GB-FORM-QAPI-PACKET-REVIEW (records the packet-level review both decisions were made within)', correct: true },
      { id: 'DN-08-C', text: 'GB-FORM-CAP-EFFECTIVENESS (records the CAP-Q1-002 and CAP-Q1-003 effectiveness attestations underlying both decisions)', correct: true },
      { id: 'DN-08-D', text: 'GB-FORM-CHOW-NOTIFICATION' },
      { id: 'DN-08-E', text: 'GB-FORM-SCOPE-CHANGE' },
    ],
    requiredEvidenceIds: ['EX-Q4-015', 'EX-Q4-016', 'EX-Q4-017', 'EX-Q4-018', 'EX-Q4-020'],
    modelAction: null,
    rationale: 'GB-FORM-PIP-CLOSURE is used both to formally close PIP-Q1-004 and to formally record the hold decision on PIP-Q1-006; the packet-review form documents the meeting-level review; the CAP-effectiveness form documents the attestations both PIP decisions rest on.',
    alternativesWhyFail: [
      'GB-FORM-CHOW-NOTIFICATION is unrelated to a PIP decision — it belongs to a change-of-ownership matter, which is a decoy item in this packet (EX-Q4-039).',
      'GB-FORM-SCOPE-CHANGE is unrelated to a PIP decision — it belongs to a scope-of-services matter, also a decoy item (EX-Q4-038).',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE', 'GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: 'Forms must be executed contemporaneously with the vote they document, not reconstructed afterward.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'Missing or wrong-form documentation is itself a records-integrity defect on survey.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'Correct form selection is what makes the decision auditable after the fact.',
    },
  },
  {
    id: 'DN-09', matterId: 'M-PIP-PORTFOLIO', round: 1, kind: 'effectiveness',
    title: 'Is CAP-Q1-003 Effective Given the Training Exception?',
    prompt: 'CAP-Q1-003 required a mandatory in-service. EX-Q4-018 shows 27 of 28 completed; EX-Q4-019 shows one clinician still outstanding. Assess CAP effectiveness.',
    competencyIds: ['budget-cap-resources'], workflowIds: ['GV-WF-07'], pointsAvailable: 40,
    options: [
      { id: 'DN-09-A', text: 'Not yet effective — the CAP\'s own design requires full completion of the mandatory in-service, not a completion rate; require the outstanding clinician\'s completion and re-attest before deeming the CAP effective.', correct: true },
      { id: 'DN-09-B', text: 'Effective — 96.4% completion is a reasonable and acceptable rate.' },
      { id: 'DN-09-C', text: 'Effective, per the annual self-assessment\'s claim that all corrective actions were completed.', criticalFailure: true },
      { id: 'DN-09-D', text: 'Not effective, and close the CAP as failed rather than tracking the single outstanding item.' },
    ],
    requiredEvidenceIds: ['EX-Q4-018', 'EX-Q4-019'],
    modelAction: null,
    rationale: 'A CAP may not be marked effective without the resources or completion the plan itself identified as required to sustain the fix. One outstanding clinician on a mandatory in-service means the CAP\'s own design condition is not yet met.',
    alternativesWhyFail: [
      'Treating 96.4% as "close enough" substitutes a convenient threshold for the CAP\'s own stated completion requirement.',
      'Relying on the self-assessment\'s blanket claim repeats the evidence-tracing failure this case is built to catch.',
      'Closing the CAP as failed over one outstanding item is disproportionate — the correct action is to hold effectiveness pending completion, not to abandon the CAP.',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: 'CAP effectiveness is attested once the completion evidence is in hand, then reviewed at the next quarterly cycle if not yet met.',
    consequences: {
      patientSafety: 'An untrained clinician on the wound-infection protocol is a live gap in the very control the CAP was meant to close.',
      regulatory: 'Attesting effectiveness without full completion is not defensible on survey.',
      financial: 'No completion means the training investment has not yet delivered its full intended coverage.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The effectiveness record must show the specific outstanding item, not an aggregate rate.',
    },
  },

  // ===================== ROUND 2 — Fall pattern RCA =====================
  {
    id: 'DN-10', matterId: 'M-FALL-RCA', round: 2, kind: 'evidence_chain',
    title: 'Build the Systemic-Causation Evidence Chain',
    prompt: 'Select every exhibit that supports a systemic (not isolated) root cause for the Q4 fall pattern, sufficient to require GV-WF-08 escalation.',
    competencyIds: ['evidence-integrity'], workflowIds: ['GV-WF-08'], pointsAvailable: 40,
    options: [
      { id: 'DN-10-A', text: 'EX-Q4-022 — October fall log', correct: true },
      { id: 'DN-10-B', text: 'EX-Q4-023 — November fall log', correct: true },
      { id: 'DN-10-C', text: 'EX-Q4-024 — December fall log', correct: true },
      { id: 'DN-10-D', text: 'EX-Q4-025 — RCA summary identifying the systemic root cause', correct: true },
      { id: 'DN-10-E', text: 'EX-Q4-012 — Q1 documentation-alteration disciplinary matter (unrelated event type, different quarter)' },
      { id: 'DN-10-F', text: 'EX-Q4-009 — Q1 sepsis adverse event (different event type, prior quarter)' },
    ],
    requiredEvidenceIds: ['EX-Q4-022', 'EX-Q4-023', 'EX-Q4-024', 'EX-Q4-025'],
    modelAction: null,
    rationale: 'The systemic-causation case rests on three consecutive months of the same fall pattern across different patients and clinicians (EX-Q4-022/023/024), formally confirmed by the RCA (EX-Q4-025). Neither decoy shares the event type, the quarter, or the causal pattern.',
    alternativesWhyFail: [
      'EX-Q4-012 is a documentation-integrity matter from a different quarter — a different disciplinary category entirely, included to test whether the Board conflates unrelated restricted matters.',
      'EX-Q4-009 is a sepsis/hospitalization event, not a fall, and it predates this quarter — it does not support a Q4 fall-pattern finding.',
    ],
    formsRequired: ['GB-FORM-RCA-ESCALATION'],
    deadlineExplanation: 'RCA escalation to the Board occurs once a systemic root cause is identified, not after each individual event.',
    consequences: {
      patientSafety: 'A confirmed systemic cause left unaddressed will keep producing falls.',
      regulatory: 'Failing to escalate a systemic finding to the Board is itself a governance gap.',
      financial: 'Not implicated at this node.',
      privacy: 'Fall logs are restricted; case-label-only presentation protects patient identity at the Board level.',
      recordIntegrity: 'The evidence chain supporting the escalation must be citable, not asserted.',
    },
  },
  {
    id: 'DN-11', matterId: 'M-FALL-RCA', round: 2, kind: 'proceed_decision',
    title: 'Board Direction on the Fall Pattern RCA',
    prompt: 'Given the RCA\'s systemic-cause finding, what should the Board direct?',
    competencyIds: ['board-vs-management'], workflowIds: ['GV-WF-08', 'GV-WF-06', 'GV-WF-07'], pointsAvailable: 40,
    options: [
      { id: 'DN-11-A', text: 'Direct management to open a new PIP and CAP for fall-risk reassessment after medication changes, and authorize the resourcing requested in EX-Q4-042.', correct: true },
      { id: 'DN-11-B', text: 'Accept the pattern as three isolated incidents requiring no further action.', criticalFailure: true },
      { id: 'DN-11-C', text: 'Direct that the specific clinicians involved in each fall be individually disciplined.', overreach: true },
      { id: 'DN-11-D', text: 'Table the matter until a fourth fall occurs to confirm the pattern.' },
    ],
    requiredEvidenceIds: ['EX-Q4-025', 'EX-Q4-042'],
    modelAction: null,
    rationale: 'The Board directs system-level correction (a new PIP/CAP, resourced) and holds management accountable for execution; it does not manage the corrective activity\'s operational detail or discipline individuals directly.',
    alternativesWhyFail: [
      'Dismissing a confirmed systemic RCA finding as isolated incidents ignores the Board\'s own evidence and leaves a known patient-safety gap unaddressed.',
      'Directing individual discipline is management\'s function, not the Board\'s — the Board acting outside its authority is a governance overreach even when well-intentioned.',
      'Waiting for a fourth event before acting on a confirmed systemic finding is an unjustified delay given the evidence already in hand.',
    ],
    formsRequired: ['GB-FORM-PIP-AUTHORIZATION', 'GB-FORM-BUDGET-AUTHORIZATION', 'GB-FORM-RCA-ESCALATION'],
    deadlineExplanation: 'System-level direction is recorded at the meeting where the RCA is presented, not deferred to a future cycle.',
    consequences: {
      patientSafety: 'Directing a resourced fall-prevention PIP/CAP is the action that actually reduces recurrence risk.',
      regulatory: 'Board-directed systemic action on a confirmed RCA finding is the defensible posture on survey.',
      financial: 'Authorizing the 0.5 FTE resourcing has a real budget cost the Board must approve, not assume.',
      privacy: 'Individual clinician identities are not for Board-level directive language.',
      recordIntegrity: 'The motion must name the system-level directive, not an individual personnel outcome.',
    },
  },
  {
    id: 'DN-12', matterId: 'M-FALL-RCA', round: 2, kind: 'due_date',
    title: 'Set the New Fall-Prevention CAP\'s Due Date',
    prompt: 'The RCA (EX-Q4-025, dated 2026-12-20) recommends a 45-day corrective-action cycle, consistent with the agency\'s standard CAP cadence. Set the due date.',
    competencyIds: ['budget-cap-resources'], workflowIds: ['GV-WF-07'], pointsAvailable: 40,
    requiredEvidenceIds: ['EX-Q4-025', 'EX-Q4-021'],
    modelAction: '2027-02-03',
    rationale: 'Forty-five days from the RCA date (2026-12-20) is 2027-02-03, consistent with the standard CAP cadence applied elsewhere in this record (e.g., the Q1 CAPs\' roughly 2-3 week to 45-day windows). This due date is a directive the Board sets tonight, not a fact already accomplished — it falls in 2027 and must not be recorded as if the CAP were already complete.',
    alternativesWhyFail: [
      'Setting no due date, or an open-ended one, leaves the new CAP without a forcing function, which is the same gap identified in EX-Q4-021 for the carry-forward CAPs.',
      'Backdating the due date into 2026 misstates when the corrective action can realistically be completed.',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS'],
    deadlineExplanation: '45 days from RCA completion is the standard corrective-action cadence this agency applies.',
    consequences: {
      patientSafety: 'A concrete due date is what keeps the fall-prevention fix on a tracked timeline.',
      regulatory: 'An undated corrective action is a documentation gap on survey.',
      financial: 'The due date anchors when the authorized resourcing must be in place.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The due date must be recorded as a forward directive, consistent with the source-cutoff discipline for this case.',
    },
  },

  // ===================== ROUND 3 — Complaint & annual report accuracy =====================
  {
    id: 'DN-13', matterId: 'M-COMPLAINT', round: 3, kind: 'reconcile_conflict',
    title: 'Reconcile the "100% Resolved" Claim Against the Open December Complaint',
    prompt: 'EX-Q4-028 claims 100% of FY2026 complaints were resolved within the policy timeframe. EX-Q4-027 shows one complaint still open at year-end, expected to resolve in January 2027. Reconcile.',
    competencyIds: ['record-integrity'], workflowIds: [], pointsAvailable: 30,
    options: [
      { id: 'DN-13-A', text: 'Correct the annual report before adoption — one Q4 complaint (EX-Q4-027) remains open into 2027; do not adopt a self-assessment containing a known factual misstatement.', correct: true },
      { id: 'DN-13-B', text: 'Approve the report as submitted and correct the complaint claim later, informally.' },
      { id: 'DN-13-C', text: 'Table the entire annual report indefinitely over this one item.' },
      { id: 'DN-13-D', text: 'Adopt the report as the official annual record without correction, since one open complaint is immaterial.', criticalFailure: true },
    ],
    requiredEvidenceIds: ['EX-Q4-027', 'EX-Q4-028'],
    modelAction: null,
    rationale: 'A known factual misstatement in a document the Board is about to adopt must be corrected before adoption, not adopted and quietly fixed later, and not used as a reason to indefinitely stall the entire report.',
    alternativesWhyFail: [
      'Approving now and correcting later still results in an official record that was, at the moment of adoption, known to be false.',
      'Tabling the entire annual report over one line item is a disproportionate response when a targeted correction is available.',
      'Treating a known misstatement as immaterial ignores that the Board\'s own duty is to the accuracy of the record it adopts, not to the size of the error.',
    ],
    formsRequired: ['GB-FORM-RECORD-CORRECTION', 'GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Corrections to a document must be made before the vote to adopt it, not after.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'An adopted annual report containing a known misstatement is a records-integrity defect.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The adopted record must state the true complaint-resolution status, including the one item carrying into 2027.',
    },
  },

  // ===================== ROUND 4 — Restricted personnel matter =====================
  {
    id: 'DN-14', matterId: 'M-PERSONNEL', round: 4, kind: 'board_vs_management',
    title: 'Board\'s Role on the Separation-in-Process Matter',
    prompt: 'EX-Q4-029 shows the separation tied to DISC-TRIG-Q1-005 is in process, not finalized. EX-Q4-030 (the annual claim) calls it "resolved via separation." What is the Board\'s role tonight?',
    competencyIds: ['board-vs-management', 'executive-session'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-14-A', text: 'Direct system-level accountability — continue the interim supervision plan and direct agency-wide escalation-protocol retraining — and hold management accountable for completing the separation process; do not direct the specific personnel outcome.', correct: true },
      { id: 'DN-14-B', text: 'Direct management to finalize the termination on a specific date set by the Board.', overreach: true },
      { id: 'DN-14-C', text: 'Publicly name the employee and disclose the clinical findings in open session so the community is informed.', criticalFailure: true },
      { id: 'DN-14-D', text: 'Take no action since management already reported the matter as resolved.' },
    ],
    requiredEvidenceIds: ['EX-Q4-008', 'EX-Q4-029', 'EX-Q4-030'],
    modelAction: null,
    rationale: 'The Board directs and holds management accountable for systemic response (interim supervision, agency-wide retraining) — it does not set the specific personnel outcome or timeline, and it does not disclose restricted personnel/clinical detail publicly. It also cannot rely on the annual claim\'s "resolved" characterization when the underlying record shows the matter still in process.',
    alternativesWhyFail: [
      'Directing a specific termination date is management\'s function; the Board setting it is a direct overreach into personnel administration.',
      'Public disclosure of employee identity and clinical findings is a privacy failure with no governance justification.',
      'Taking no action accepts the annual claim\'s characterization over the Board\'s own restricted-session evidence showing the matter unresolved.',
    ],
    formsRequired: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'System-level direction on an open restricted matter is recorded at the meeting where its status is reviewed, in executive session.',
    consequences: {
      patientSafety: 'Sustained interim supervision protects patients until the underlying escalation-chain gap is fully closed agency-wide.',
      regulatory: 'A Board directing individual personnel outcomes is acting outside defensible governance authority.',
      financial: 'Not implicated at this node.',
      privacy: 'Public disclosure of the individual\'s identity or clinical detail would be a direct privacy violation.',
      recordIntegrity: 'The executive-session minutes must reflect the true "in process" status, not the annual report\'s "resolved" claim.',
    },
  },
  {
    id: 'DN-15', matterId: 'M-PERSONNEL', round: 4, kind: 'confidential_minutes',
    title: 'Executive-Session Minute Content',
    prompt: 'Select what the confidential (executive-session) minutes must capture for the personnel matter.',
    competencyIds: ['executive-session'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-15-A', text: 'The restricted deliberation substance and the evidence considered (DISC-TRIG-Q1-005, EX-Q4-029 status)', correct: true },
      { id: 'DN-15-B', text: 'The system-level directive given to management (continued interim supervision, agency-wide retraining)', correct: true },
      { id: 'DN-15-C', text: 'The employee\'s home address and other personal contact information' },
      { id: 'DN-15-D', text: 'The vote/consensus reached and by whom', correct: true },
    ],
    requiredEvidenceIds: ['EX-Q4-029'],
    modelAction: null,
    rationale: 'Confidential minutes must fully capture the restricted deliberation, the evidence relied on, the system-level directive, and the vote — this is the complete governance record, kept confidential precisely because it contains restricted detail. It should not additionally include personal contact information that has no governance relevance.',
    alternativesWhyFail: [
      'Home address/personal contact information is not governance content and has no place in the minutes regardless of confidentiality level.',
    ],
    formsRequired: ['GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'Confidential minutes are drafted contemporaneously with the executive session and finalized per policy.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'Incomplete confidential minutes undermine the Board\'s ability to demonstrate it actually deliberated.',
      financial: 'Not implicated at this node.',
      privacy: 'Confidential minutes still should not carry irrelevant personal information beyond what governance requires.',
      recordIntegrity: 'This is the authoritative internal record of what the Board actually considered and decided.',
    },
  },
  {
    id: 'DN-16', matterId: 'M-PERSONNEL', round: 4, kind: 'public_minutes',
    title: 'Public Minute Content for This Matter',
    prompt: 'Select what the PUBLIC minutes must reflect about tonight\'s executive session on the personnel matter.',
    competencyIds: ['executive-session', 'record-integrity'], workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    options: [
      { id: 'DN-16-A', text: 'That an executive session occurred on tonight\'s date regarding a restricted personnel matter, and that the Board directed management to continue system-level corrective action — without naming the individual or disclosing clinical detail.', correct: true },
      { id: 'DN-16-B', text: 'Nothing — confidentiality means omitting any reference to the executive session entirely.' },
      { id: 'DN-16-C', text: 'The employee\'s name and the clinical findings from the RCA.', criticalFailure: true },
      { id: 'DN-16-D', text: 'A general statement that "personnel matters were discussed" with no reference to Board action.' },
    ],
    requiredEvidenceIds: ['EX-Q4-029'],
    modelAction: null,
    rationale: 'Confidentiality protects the substance of the deliberation, not the fact that governance occurred. The public record must show that an executive session took place and what authorized public-facing action resulted, without restricted detail.',
    alternativesWhyFail: [
      'Omitting the executive session entirely breaks the public accountability record — a reader could not tell governance occurred at all.',
      'Naming the employee or disclosing clinical findings publicly is a direct privacy failure.',
      'A vague statement with no reference to the Board\'s directive fails to show that any governance action actually resulted.',
    ],
    formsRequired: ['GB-FORM-PUBLIC-MINUTES'],
    deadlineExplanation: 'Public minutes are finalized on the same cycle as the meeting they document.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'A public record with silent gaps where governance action should appear is itself a record-integrity defect.',
      financial: 'Not implicated at this node.',
      privacy: 'Naming the individual or disclosing clinical findings publicly would violate the confidentiality this matter requires.',
      recordIntegrity: 'The public minutes are the only record most stakeholders will ever see of this matter.',
    },
  },

  // ===================== ROUND 5 — Governance housekeeping =====================
  {
    id: 'DN-17', matterId: 'M-GOVERNANCE', round: 5, kind: 'motion_builder',
    title: 'Seat the New Community-Member Director',
    prompt: 'Build the Board\'s motion to seat the proposed community-member director (EX-Q4-031), including the training-attestation prerequisite noted in EX-Q4-034 before the new member\'s first vote.',
    competencyIds: ['quorum-recusal'], workflowIds: ['GV-WF-01', 'GV-WF-14'], pointsAvailable: 40,
    requiredEvidenceIds: ['EX-Q4-031', 'EX-Q4-034'],
    modelAction: {
      action: 'seat_director',
      seatCategory: 'community_member',
      priorSeatVacatedDate: '2026-01-31',
      compositionMixConfirmed: true,
      onboardingTrainingRequiredBeforeFirstVote: true,
    },
    rationale: 'Seating the proposed director fills the vacancy left by the expired term and restores the approved composition mix. The record on file (EX-Q4-034) shows onboarding training is an explicit prerequisite for a newly seated director\'s first vote, so the motion must condition the seating on that requirement, not treat seating and voting eligibility as the same moment.',
    alternativesWhyFail: [
      'Seating the director without confirming the composition-mix requirement risks an unnoticed composition defect.',
      'Allowing the new director to vote immediately without confirming onboarding training skips a documented prerequisite.',
    ],
    formsRequired: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT', 'GB-FORM-TRAINING-ATTESTATION'],
    deadlineExplanation: 'Seating is effective on the meeting date the motion carries; voting eligibility is effective once onboarding training is attested.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'An unaddressed composition-mix gap or a vote cast before required onboarding training is a governance-process defect.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The appointment record must capture both the seating action and the training prerequisite as separate, tracked facts.',
    },
  },
  {
    id: 'DN-18', matterId: 'M-GOVERNANCE', round: 5, kind: 'proceed_decision',
    title: 'Handle the Vendor Conflict-of-Interest Matter',
    prompt: 'Given the disclosed conflict (EX-Q4-032), how should tonight\'s vendor contract renewal proceed?',
    competencyIds: ['quorum-recusal'], workflowIds: ['GV-WF-02'], pointsAvailable: 40,
    options: [
      { id: 'DN-18-A', text: 'The disclosing director recuses from deliberation and the vote (per DN-02\'s recusal-adjusted quorum); the remaining eligible directors deliberate and vote on management\'s presented terms; the recusal is logged.', correct: true },
      { id: 'DN-18-B', text: 'Allow the disclosing director to vote since the disclosure alone satisfies the conflict-of-interest policy.', criticalFailure: true },
      { id: 'DN-18-C', text: 'Have Board members personally renegotiate specific contract pricing terms directly with the vendor.', overreach: true },
      { id: 'DN-18-D', text: 'Postpone the vendor matter indefinitely to avoid any conflict question.' },
    ],
    requiredEvidenceIds: ['EX-Q4-032'],
    modelAction: null,
    rationale: 'Disclosure alone is not sufficient — the agency\'s conflict-of-interest policy requires recusal from both deliberation and the vote, which is exactly what DN-02\'s quorum computation already accounted for.',
    alternativesWhyFail: [
      'Letting the disclosing director vote because disclosure occurred defeats the purpose of the recusal requirement.',
      'Board members personally negotiating contract terms is management\'s function, not the Board\'s.',
      'Indefinite postponement over a properly disclosed and manageable conflict is an unnecessary operational delay.',
    ],
    formsRequired: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
    deadlineExplanation: 'Recusal must be recorded before deliberation begins on the matter, not after the vote.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'A vote including a conflicted, non-recused member is not a valid governance action.',
      financial: 'The vendor contract carries direct budget exposure the Board must decide on clean terms.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The recusal log and vote record must match the quorum computation in DN-02.',
    },
  },
  {
    id: 'DN-19', matterId: 'M-GOVERNANCE', round: 5, kind: 'eligibility',
    title: 'Licensure Renewal — Does It Require Board Action Tonight?',
    prompt: 'EX-Q4-033 shows the state license renewal application is submitted, decision pending, with no lapse yet. Does this require Board-level action tonight, and what?',
    competencyIds: ['scope-license'], workflowIds: ['GV-WF-11'], pointsAvailable: 40,
    options: [
      { id: 'DN-19-A', text: 'Yes — direct management to report renewal-decision status at every meeting until resolved. No lapse has occurred, but standing Board visibility is required for a pending renewal, not just for one that is overdue.', correct: true },
      { id: 'DN-19-B', text: 'No — since the renewal has not lapsed, remove it from the Board\'s tracking until further notice.' },
      { id: 'DN-19-C', text: 'Escalate immediately as a licensure emergency, as if the license had already lapsed.' },
      { id: 'DN-19-D', text: 'Delegate all further tracking to the Administrator with no further Board visibility required.' },
    ],
    requiredEvidenceIds: ['EX-Q4-033'],
    modelAction: null,
    rationale: 'A pending renewal is a standing operational risk that warrants ongoing Board visibility even before it becomes overdue or lapsed — waiting for a lapse before acting is the wrong threshold.',
    alternativesWhyFail: [
      'Removing it from tracking treats "not yet lapsed" as "no longer a Board concern," which is the same error the remediation bank flags for a past-due renewal, just earlier in the timeline.',
      'Treating a pending-but-not-overdue renewal as an emergency overstates the current risk and could misdirect resources.',
      'Fully delegating tracking away from the Board removes the visibility the matter actually requires.',
    ],
    formsRequired: ['GB-FORM-LICENSURE-RENEWAL'],
    deadlineExplanation: 'Renewal status is a standing agenda item until the state decision is received.',
    consequences: {
      patientSafety: 'Not implicated at this node.',
      regulatory: 'Losing Board visibility on a pending renewal risks a lapse going unnoticed until it becomes a crisis.',
      financial: 'A lapsed license would halt billing and operations entirely.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'Standing agenda tracking must be recorded meeting to meeting, not treated as closed prematurely.',
    },
  },

  // ===================== ROUND 6 — Monitor =====================
  {
    id: 'DN-20', matterId: 'M-PIP-PORTFOLIO', round: 6, kind: 'return_date',
    title: 'Set PIP-Q1-006 Return-to-Board Date',
    prompt: 'Given the DN-06 hold decision, set the date PIP-Q1-006 returns to the Board with a full two-quarter monthly-stratum test.',
    competencyIds: ['pip-closure-sustainability'], workflowIds: ['GV-WF-06'], pointsAvailable: 30,
    requiredEvidenceIds: ['EX-Q4-006', 'EX-Q4-021'],
    modelAction: '2027-04-14',
    rationale: 'Consistent with this agency\'s quarterly meeting cadence (roughly the second week of the month following quarter close, as seen in the Q1/Q2 meeting dates), the Q1 2027 quarterly meeting — and therefore PIP-Q1-006\'s return date — falls on 2027-04-14, once Q1 2027\'s monthly wound-infection data is available.',
    alternativesWhyFail: [
      'Leaving the return date open-ended repeats the same forcing-function gap flagged in EX-Q4-021 for the carry-forward CAPs.',
      'Setting a return date before a full quarter\'s monthly data would exist defeats the purpose of the two-consecutive-quarter test.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'The return date must fall after a full subsequent quarter\'s monthly data is available, consistent with the approved sustainability criterion.',
    consequences: {
      patientSafety: 'A concrete return date keeps wound-infection oversight active rather than letting it lapse silently.',
      regulatory: 'An open-ended hold with no return date is not a defensible monitoring posture.',
      financial: 'Not implicated at this node.',
      privacy: 'Not implicated at this node.',
      recordIntegrity: 'The return date must be recorded as a forward commitment, not a completed fact, consistent with this case\'s source-cutoff discipline.',
    },
  },
];

// ---------------------------------------------------------------------------
// Injects
// ---------------------------------------------------------------------------

const INJECTS: Inject[] = [
  {
    id: 'INJ-01', round: 0, title: 'Packet Note — Q4 Source Normalization Status',
    body: 'The Compliance Officer notes for the record: QAPI_2026\'s Q4 quarter has not yet been formally normalized in the system of record. Every Q4-dated item in tonight\'s packet, including the annual self-assessment, is authored/compiled content pending that normalization — it is not yet "recovered" evidence in the same sense as the Q1/Q2 history.',
    workflowIds: ['GV-WF-05'],
  },
  {
    id: 'INJ-02', round: 1, releaseAfterNodeId: 'DN-04',
    title: 'Late Inject — Updated In-Service Completion Roster',
    body: 'After the Board begins deliberating PIP-Q1-006, the Clinical Manager submits an updated in-service completion roster: 27 of 28 required staff completed as of this morning; the one outstanding clinician\'s overdue notice was reissued today.',
    workflowIds: ['GV-WF-07'],
  },
  {
    id: 'INJ-03', round: 2, releaseAfterNodeId: 'DN-10',
    title: 'Late Inject — Corporate Quality Alert',
    body: 'A corporate quality alert circulated after the Board began reviewing the fall pattern notes that a sister agency under the same parent organization observed a similar fall/medication-change pattern this year, reinforcing that the root cause may be a shared protocol gap rather than a facility-specific anomaly.',
    workflowIds: ['GV-WF-08'],
  },
  {
    id: 'INJ-04', round: 3, title: 'Complaint Escalation Note',
    body: 'The open December complaint (EX-Q4-027) has now passed both the 5-day and 30-day internal resolution checkpoints without resolution; the family has requested a written response before year-end.',
    workflowIds: [],
  },
  {
    id: 'INJ-05', round: 4, releaseAfterNodeId: 'DN-14',
    title: 'Executive-Session Inject — Interim Supervision Plan Detail',
    body: 'The Administrator confirms the interim supervision plan requires bi-weekly supervisory review meetings, documented in the personnel file, until the separation process is finalized.',
    workflowIds: ['GV-WF-09'],
  },
  {
    id: 'INJ-06', round: 5, title: 'Governance Inject — Composition-Mix Re-Verification',
    body: 'The Compliance Officer flags that once the new community-member director is seated, the clinical/community/financial composition-mix requirement must be re-verified against the full seated roster, not assumed from the single seat change alone.',
    workflowIds: ['GV-WF-01'],
  },
  {
    id: 'INJ-07', round: 6, title: 'Monitor Inject — Q1 2027 Meeting Calendar Confirmed',
    body: 'The Board Secretary confirms the Q1 2027 quarterly meeting date is 2027-04-14. Every return-to-Board item set tonight (PIP-Q1-006, the fall-prevention CAP, the licensure status check) will be due at that meeting.',
    workflowIds: [],
  },
];

// ---------------------------------------------------------------------------
// Surveyor & transfer mini-assessment
// ---------------------------------------------------------------------------

const SURVEYOR: SurveyorQuestion[] = [
  {
    id: 'SQ-01',
    prompt: 'A surveyor asks: "Show me the record demonstrating the Board did not simply accept the annual claim that the wound-infection PIP is resolved."',
    options: [
      { id: 'SQ-01-A', text: 'EX-Q4-001 — the annual self-assessment itself' },
      { id: 'SQ-01-B', text: 'EX-Q4-013/EX-Q4-017 — the Q4 monthly wound-infection detail and sustainability-test explainer showing the October breach' },
      { id: 'SQ-01-C', text: 'EX-Q4-009 — the Q1 sepsis adverse event' },
      { id: 'SQ-01-D', text: 'EX-Q4-020 — the CAP-Q1-002 effectiveness attestation' },
    ],
    correctId: 'SQ-01-B',
    requiresEvidenceIds: ['EX-Q4-013', 'EX-Q4-017'],
  },
  {
    id: 'SQ-02',
    prompt: 'A surveyor asks: "Show me the record establishing the Q4 fall pattern was treated as systemic, not isolated."',
    options: [
      { id: 'SQ-02-A', text: 'EX-Q4-022 — the October fall log alone' },
      { id: 'SQ-02-B', text: 'EX-Q4-025 — the RCA summary identifying the systemic root cause across all three months' },
      { id: 'SQ-02-C', text: 'EX-Q4-026 — the annual self-assessment\'s adverse-event section' },
      { id: 'SQ-02-D', text: 'EX-Q4-012 — the Q1 documentation-alteration matter' },
    ],
    correctId: 'SQ-02-B',
    requiresEvidenceIds: ['EX-Q4-025'],
  },
  {
    id: 'SQ-03',
    prompt: 'A surveyor asks: "Show me the record showing the personnel matter tied to the sepsis escalation failure is not yet closed."',
    options: [
      { id: 'SQ-03-A', text: 'EX-Q4-030 — the annual self-assessment\'s "resolved via separation" claim' },
      { id: 'SQ-03-B', text: 'EX-Q4-029 — the Q4 restricted personnel status update showing separation in process, not finalized' },
      { id: 'SQ-03-C', text: 'EX-Q4-012 — the unrelated documentation-alteration matter' },
      { id: 'SQ-03-D', text: 'EX-Q4-008 — the original Q1 disciplinary trigger record alone' },
    ],
    correctId: 'SQ-03-B',
    requiresEvidenceIds: ['EX-Q4-029'],
  },
  {
    id: 'SQ-04',
    prompt: 'A surveyor asks: "Show me the record of a complaint carrying open into the next calendar year."',
    options: [
      { id: 'SQ-04-A', text: 'EX-Q4-028 — the annual self-assessment\'s "100% resolved" claim' },
      { id: 'SQ-04-B', text: 'EX-Q4-027 — the Q4 complaint log showing one complaint open at year-end, expected resolution January 2027' },
      { id: 'SQ-04-C', text: 'EX-Q4-010 — the census-discontinuity data-quality finding' },
      { id: 'SQ-04-D', text: 'EX-Q4-002 — the annual PIP closure log' },
    ],
    correctId: 'SQ-04-B',
    requiresEvidenceIds: ['EX-Q4-027'],
  },
  {
    id: 'SQ-05',
    prompt: 'A surveyor asks: "Show me the record supporting that the medication-reconciliation PIP legitimately met its sustainability criterion."',
    options: [
      { id: 'SQ-05-A', text: 'EX-Q4-002 — the annual PIP closure log alone' },
      { id: 'SQ-05-B', text: 'EX-Q4-015 and EX-Q4-016 together — the Q4 and Q3 sustainability evidence showing two consecutive qualifying quarters' },
      { id: 'SQ-05-C', text: 'EX-Q4-007 — the Q2 carry-forward record showing the PIP still failing' },
      { id: 'SQ-05-D', text: 'EX-Q4-001 — the annual self-assessment\'s narrative claim' },
    ],
    correctId: 'SQ-05-B',
    requiresEvidenceIds: ['EX-Q4-015', 'EX-Q4-016'],
  },
  {
    id: 'SQ-06',
    prompt: 'A surveyor asks: "Show me the record showing the licensure renewal decision is still pending, not lapsed."',
    options: [
      { id: 'SQ-06-A', text: 'EX-Q4-033 — the licensure renewal status record (submitted, decision pending, no lapse)' },
      { id: 'SQ-06-B', text: 'EX-Q4-038 — the proposed scope-of-services change' },
      { id: 'SQ-06-C', text: 'EX-Q4-039 — the proposed change of ownership' },
      { id: 'SQ-06-D', text: 'EX-Q4-001 — the annual self-assessment' },
    ],
    correctId: 'SQ-06-A',
    requiresEvidenceIds: ['EX-Q4-033'],
  },
];

const TRANSFERS: TransferQuestion[] = [
  {
    id: 'TQ-01',
    changedFacts: [
      'Suppose the wound-infection spike had instead occurred in December (the last month of the quarter), with October and November within threshold.',
    ],
    prompt: 'Would PIP-Q1-006 be eligible for closure this quarter under those changed facts?',
    options: [
      { id: 'TQ-01-A', text: 'Yes — as long as the quarter-end month is checked, the position of an earlier breach does not matter.' },
      { id: 'TQ-01-B', text: 'No — the sustainability criterion requires every named month to be within threshold across the qualifying quarters; a December breach still fails the test regardless of which month it lands in.' },
    ],
    correctId: 'TQ-01-B',
    rationale: 'The controlling principle is per-stratum evaluation across the full quarter, not a check limited to whichever month happens to be quarter-end. Moving the breach to December does not change the outcome.',
  },
  {
    id: 'TQ-02',
    changedFacts: [
      'Suppose it was the clinical-member Board seat that had expired, not the community-member seat, and no replacement had been proposed at all.',
    ],
    prompt: 'What must the Board do differently in that scenario?',
    options: [
      { id: 'TQ-02-A', text: 'Confirm whether the clinical/community/financial composition-mix requirement is still met with the vacancy; if it is at risk, the Board must act to fill the seat, not merely note the vacancy and move on.' },
      { id: 'TQ-02-B', text: 'Nothing different — a vacancy in any seat category is handled the same way regardless of composition-mix impact.' },
    ],
    correctId: 'TQ-02-A',
    rationale: 'The transfer tests whether the learner understood the underlying principle (composition-mix risk from a vacancy) rather than memorizing "community-member seat expired" as the fact pattern.',
  },
  {
    id: 'TQ-03',
    changedFacts: [
      'Suppose the personnel matter under executive-session review were a documentation-integrity finding (like the unrelated Q1 matter in EX-Q4-012) rather than a patient-safety escalation failure.',
    ],
    prompt: 'Does the change in the underlying finding change whether the deliberation belongs in executive session, or what the public minutes must show?',
    options: [
      { id: 'TQ-03-A', text: 'No — the same executive-session and public-minutes framework applies regardless of the specific personnel finding; only the underlying finding\'s substance differs, not the confidentiality and record-integrity rules that govern it.' },
      { id: 'TQ-03-B', text: 'Yes — a documentation-integrity finding is less sensitive and can be discussed in public session.' },
    ],
    correctId: 'TQ-03-A',
    rationale: 'Executive-session and public/confidential-minutes rules attach to the restricted-personnel-matter category, not to which specific finding triggered it.',
  },
  {
    id: 'TQ-04',
    changedFacts: [
      'Suppose the Q4 fall cluster had been a single isolated fall in December with no repeat pattern and no common root cause identified.',
    ],
    prompt: 'Would GV-WF-08 still require the same Board-directed systemic corrective action?',
    options: [
      { id: 'TQ-04-A', text: 'No — a single isolated event without a systemic root-cause finding does not require the same Board-directed systemic action; the Board\'s role scales to what the RCA actually finds (systemic vs. isolated), not to the mere existence of an adverse event.' },
      { id: 'TQ-04-B', text: 'Yes — any adverse event, isolated or systemic, automatically requires the same Board-directed PIP/CAP response.' },
    ],
    correctId: 'TQ-04-A',
    rationale: 'The transfer tests whether the learner generalized "systemic RCA finding triggers Board-directed system correction" or over-generalized to "any adverse event does," which would misapply Board authority to routine, non-systemic events.',
  },
];

// ---------------------------------------------------------------------------
// CasePack
// ---------------------------------------------------------------------------

const REQUIRED_WORKFLOWS: GvWorkflowId[] = [
  'GV-WF-01', 'GV-WF-02', 'GV-WF-05', 'GV-WF-06', 'GV-WF-07', 'GV-WF-08', 'GV-WF-09', 'GV-WF-11', 'GV-WF-14',
];

export const Q4_CASE_PACK: CasePack = {
  id: 'tabletop2026-q4',
  quarter: 'Q4',
  title: 'Q4 2026 — Closure Is Not the Same as Control',
  subtitle: 'The annual narrative says resolved. The record says: some of it, not all of it, and not the part you\'d assume.',
  estMinutes: 105,
  sourceCutoff: '2026-12-31',
  exhibits: EXHIBITS,
  packetConflictGroups: Q4_PACKET_CONFLICT_GROUPS,
  decisionNodes: DECISION_NODES,
  injects: INJECTS,
  surveyor: SURVEYOR,
  transfers: TRANSFERS,
  requiredWorkflows: REQUIRED_WORKFLOWS,
  passScore: 950,
  passStandardNote: 'Quarterly pass requires ≥950/1000 with zero critical errors. Critical failures in this case include: adopting the annual self-assessment\'s PIP-closure, adverse-event, or complaint-resolution claims without tracing them to evidence; disclosing restricted personnel or clinical detail in public session; and letting a disclosed conflict-of-interest vote proceed without recusal. Because Q4 is the final quarter modeled this year, "no later-quarter evidence" is enforced as: nothing dated after 2026-12-31 (a forward due date, a return-to-Board date, an "expected" resolution) may be treated as an already-settled fact.',
};

export default Q4_CASE_PACK;
