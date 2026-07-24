// Q2 2026 CasePack — "The Packet Cannot Be Trusted"
//
// Grounded in the normalized 2026 QAPI fixture (QAPI_2026, via ./qapi2026Normalized)
// plus labeled supplemental records (./qapi2026Supplemental) authored only where the
// recovered source has no corresponding event for a required workflow. The PRIMARY
// data-integrity trap is the Q1-close/Q2-open census discontinuity (DQ-2026-002)
// compounded by cross-quarter clinician-ID identity collision (DQ-2026-001): the
// Board must learn to distrust a packet's surface presentation and verify against
// the underlying recovered records before deciding anything.
//
// Source cutoff = the Q2 Governing Body meeting date (2026-07-10). One exhibit
// (q2-ex-decoy-q3-leak) is dated after the cutoff and exists solely to test that
// the Board does not rely on evidence that did not yet exist at decision time.

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
  GB_SUP_COI_001,
  GB_SUP_ROSTER_2026,
  SUPPLEMENTAL_SOURCE_LABEL,
  toExhibit,
} from './qapi2026Supplemental';
import { QAPI_2026 } from './qapi2026Normalized';

const MATTER_ID = 'q2-2026-packet-trust';

const Q1 = QAPI_2026.quarters.Q1;
const Q2 = QAPI_2026.quarters.Q2;

const CALCULATED_LABEL =
  'CALCULATED — derived from recovered source figures for this exercise; not itself a source-recovered record.';
const UNVERIFIED_LABEL =
  'UNVERIFIED — origin/author not established; not a labeled recovered or supplemental record. Do not rely on this as controlling evidence.';

// ---------------------------------------------------------------------------
// Exhibits (Board Book) — 39 total, ~21% decoy
// ---------------------------------------------------------------------------

const exMeetingControl: Exhibit = {
  id: 'q2-ex-meeting-control', sourceId: 'QAPI-Q2-DS-001', quarter: 'Q2', asOfDate: Q2.meeting!.meetingDate,
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PACKET-READINESS'],
  relevance: 'decision_relevant', section: 'A. Meeting Control & Packet Readiness',
  title: 'Q2 2026 Meeting Control Record',
  summary: `${Q2.meeting!.workflow}. Meeting date ${Q2.meeting!.meetingDate}; agenda deadline ${Q2.meeting!.agendaDeadline}; feeder-audit deadline ${Q2.meeting!.feederAuditDeadline}; GB package deadline ${Q2.meeting!.gbPackageDeadline}; minutes due ${Q2.meeting!.minutesDue} (owner: ${Q2.meeting!.minutesOwner}).`,
  details: [
    `Policy basis: ${Q2.meeting!.policyBasis.join(', ')}.`,
    `Required sign-offs for convening: ${Q2.meeting!.requiredSignoffs.join(', ')}.`,
    'No sign-off records were recovered for this quarter — see q2-ex-signoff-status.',
  ],
};

const exSignoffStatus: Exhibit = {
  id: 'q2-ex-signoff-status', sourceId: 'QAPI-Q2-DS-001', quarter: 'Q2', asOfDate: '2026-07-03',
  posture: 'calculated', sourceLabel: CALCULATED_LABEL, confidentiality: 'public', validationState: 'unvalidated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-PACKET-READINESS'],
  relevance: 'decision_relevant', section: 'A. Meeting Control & Packet Readiness',
  title: 'Q2 Sign-off Status: Zero of Three Recovered',
  summary: `The Q2 quarter record recovers ${Q2.sourceSignoffs.length} of the 3 required sign-offs (Administrator, Clinical Manager, QAPI Committee Chair). The Q2 packet cover page nonetheless bears a "Reviewed" stamp.`,
  details: [
    'A "Reviewed" or "signed" stamp on a packet cover page is not evidence of the three required role sign-offs.',
    'A packet may be internally consistent and still fail the sign-off readiness gate.',
    'Compare against q2-ex-q1-signoffs, where all three Q1 roles signed on the Q1 meeting date.',
  ],
};

const exQ1Signoffs: Exhibit = {
  id: 'q2-ex-q1-signoffs', sourceId: 'QAPI-Q1-DS-001', quarter: 'Q1', asOfDate: '2026-04-09',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-PACKET-READINESS'],
  relevance: 'contextual', section: 'A. Meeting Control & Packet Readiness',
  title: 'Q1 Sign-off Bundle (for comparison)',
  summary: 'All three Q1 required sign-offs are recovered and signed on the Q1 meeting date (2026-04-09): Administrator (Q1:MOCK-CLIN-0028), Clinical Manager (Q1:MOCK-CLIN-0027), QAPI Committee Chair (Q1:MOCK-CLIN-0026).',
  details: [
    'SGN-Q1-ADM-001, SGN-Q1-CM-001, SGN-Q1-CHAIR-001 — all status "Signed."',
    'This is the readiness bar the Q2 packet must be held to, not the bar it currently meets.',
  ],
};

const exRosterBaseline: Exhibit = {
  id: 'q2-ex-roster-baseline', sourceId: 'GB-ROSTER-BASELINE-2026', quarter: 'Q2', asOfDate: '2026-07-01',
  posture: 'supplemental_uat', sourceLabel: SUPPLEMENTAL_SOURCE_LABEL, confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-01'], formIds: ['GB-FORM-ROSTER-ATTEST'],
  relevance: 'decision_relevant', section: 'A. Meeting Control & Packet Readiness',
  title: 'Board Roster & Composition Baseline — Q2',
  summary: 'Seven seats exist by bylaws; one community-member seat is currently vacant pending the replacement proposed in q2-ex-sup-roster, leaving 6 directors formally seated as of the Q2 meeting.',
  details: [
    'Seated directors as of 2026-07-10: 6 (2 clinical-professional, 3 community-member incl. 1 vacancy, 2 financial/business — composition mix compliant while vacancy is pending fill).',
    'Bylaws quorum rule (GV-GB-001): a simple majority of seated directors must be present to convene.',
    'Director designated "Director F" (community-member seat) is the individual who disclosed the vendor equity interest in q2-ex-sup-coi.',
  ],
};

const exAttendanceLog: Exhibit = {
  id: 'q2-ex-attendance-log', sourceId: 'GB-ATTENDANCE-Q2-2026', quarter: 'Q2', asOfDate: '2026-07-10',
  posture: 'supplemental_uat', sourceLabel: SUPPLEMENTAL_SOURCE_LABEL, confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-01', 'GV-WF-02'], formIds: ['GB-FORM-ROSTER-ATTEST'],
  relevance: 'decision_relevant', section: 'A. Meeting Control & Packet Readiness',
  title: 'Attendance Log — Q2 Meeting (2026-07-10)',
  summary: '5 of 6 seated directors are present. Director F (community-member seat, vendor equity interest disclosed) is present at call-to-order but is designated to step out for the vendor-contract deliberation and vote.',
  details: [
    'Present at call-to-order: Directors A, B, C, D (clinical/financial seats) and Director F.',
    'Absent: Director E.',
    'Director F leaves the room for the vendor-contract agenda item per the conflict-of-interest policy in q2-ex-sup-coi.',
  ],
};

const exPopulationQ1: Exhibit = {
  id: 'q2-ex-population-q1', sourceId: 'QAPI-Q1-DS-001', quarter: 'Q1', asOfDate: '2026-03-31',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'decision_relevant', section: 'B. Population & Census',
  title: 'Q1 Population Summary',
  summary: `Active at start ${Q1.population!.activeAtStart}; active at close ${Q1.population!.activeAtClose}; new SOC ${Q1.population!.newSoc}; discharged ${Q1.population!.discharged}; transferred ${Q1.population!.transferred}; episodes tracked ${Q1.population!.episodesTracked}; clinician count ${Q1.population!.clinicianCount}.`,
  details: [Q1.population!.note ?? ''],
};

const exPopulationQ2: Exhibit = {
  id: 'q2-ex-population-q2', sourceId: 'QAPI-Q2-DS-001', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'conflicting',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'decision_relevant', section: 'B. Population & Census',
  title: 'Q2 Population Summary',
  summary: `Active at start ${Q2.population!.activeAtStart}; active at close (recovered) null; new SOC ${Q2.population!.newSoc}; discharged ${Q2.population!.discharged}; transferred ${Q2.population!.transferred}; episodes tracked ${Q2.population!.episodesTracked}; clinician count ${Q2.population!.clinicianCount}.`,
  details: [Q2.population!.note ?? ''],
};

const exDq002Census: Exhibit = {
  id: 'q2-ex-dq-002-census', sourceId: 'DQ-2026-002', quarter: 'Q2', asOfDate: '2026-07-01',
  posture: 'recovered', confidentiality: 'public', validationState: 'conflicting',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-PACKET-READINESS', 'GB-FORM-RECORD-CORRECTION'],
  relevance: 'conflicting', section: 'B. Population & Census',
  title: 'Data-Quality Finding: Census Carry-Forward Does Not Reconcile',
  summary: 'Q1 closes at 120 active patients; Q2 opens at 100. The 20-patient difference is not explained by Q2\'s recorded discharges/transfers (18 discharged + 4 transferred against only 12 new SOC).',
  details: [
    'Severity: warning (data-quality finding, not yet resolved).',
    'Required reviewer decision: confirm the true Q2 opening census; keep both recovered values on file until reconciled — do not average, replace, or silently pick one.',
    'Any denominator built on "active census" this quarter must disclose which recovered figure it used until this is reconciled.',
  ],
};

const exMetHosp: Exhibit = {
  id: 'q2-ex-met-hosp', sourceId: 'QM-APR-001', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05', 'GV-WF-06'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'decision_relevant', section: 'C. Quality Metrics — Q2',
  title: 'Acute Care Hospitalization Rate — Q2 (aggregate masks subgroup)',
  summary: 'Apr 3.1%, May 2.0%, Jun 2.0% — status "within" target (≤4%), no PIP trigger. FLAGGED: aggregateMasksSubgroup = true.',
  details: [
    'Provenance derivation note: "Favorable aggregate hospitalization masks worsening documentation/med-rec/complaint subgroups this quarter."',
    'A metric flagged aggregateMasksSubgroup must not be accepted as sufficient grounds for closure on its own.',
  ],
};

const exMetOasis: Exhibit = {
  id: 'q2-ex-met-oasis', sourceId: 'QM-APR-002', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'contextual', section: 'C. Quality Metrics — Q2',
  title: 'OASIS Accuracy Rate — Q2',
  summary: 'Apr 84.8%, May 82.0%, Jun 84.1% — target ≥90%; status "below"; PIP trigger true.',
  details: ['Below-target across all three months; no sustained improvement trend.'],
};

const exMetMedRec: Exhibit = {
  id: 'q2-ex-met-medrec', sourceId: 'QM-APR-005', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05', 'GV-WF-06', 'GV-WF-07'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW', 'GB-FORM-PIP-CLOSURE'],
  relevance: 'decision_relevant', section: 'C. Quality Metrics — Q2',
  title: 'Medication Reconciliation at SOC/ROC — Q2 (critical, worsening)',
  summary: 'Apr 77.8%, May 73.3%, Jun 70.6% — target ≥95%; status "critical"; PIP trigger true.',
  details: [
    'Provenance derivation note: "3rd consecutive quarter below threshold; worsening."',
    'This is the metric underlying carried-forward PIP-Q1-004 — see q2-ex-pip-004-q2.',
  ],
};

const exMetPoc: Exhibit = {
  id: 'q2-ex-met-poc', sourceId: 'QM-APR-004', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'contextual', section: 'C. Quality Metrics — Q2',
  title: 'POC Documentation Completeness — Q2',
  summary: 'Apr 83.7%, May 79.4%, Jun 77.1% — target ≥90%; status "below"; deteriorating trend per provenance note.',
  details: ['Deteriorating month over month; no PIP has yet been opened on this metric specifically.'],
};

const exMetMissedVisit: Exhibit = {
  id: 'q2-ex-met-missedvisit', sourceId: 'QM-APR-006', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'decision_relevant', section: 'C. Quality Metrics — Q2',
  title: 'Missed Visit Rate — Q2 (visit-level denominator)',
  summary: 'Apr 28/876 = 3.2%; May 34/892 = 3.8%; Jun 44/979 = 4.5% — target ≤3%; status "below"; worsening trend.',
  details: [
    'The denominator here is scheduled/expected VISITS for the month (e.g. 979 in June), not active patient census.',
    'Do not substitute the active-census figure (q2-ex-population-q2) for the visit denominator when recomputing this rate.',
  ],
};

const exMetSatisfaction: Exhibit = {
  id: 'q2-ex-met-satisfaction', sourceId: 'QM-APR-008', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-QAPI-PACKET-REVIEW'],
  relevance: 'contextual', section: 'C. Quality Metrics — Q2',
  title: 'Patient Satisfaction (Overall) — Q2',
  summary: 'Apr 82%, May 80%, Jun 79% — target ≥85%; status "below"; no PIP trigger recorded this quarter.',
  details: ['Numerator/denominator not tracked for this survey-based metric in the recovered source.'],
};

const exMetWoundQ1: Exhibit = {
  id: 'q2-ex-met-wound-q1', sourceId: 'QM-Q1-019', quarter: 'Q1', asOfDate: '2026-03-31',
  posture: 'calculated',
  sourceLabel: 'CALCULATED — monthly numerator/denominator ambiguous in the concatenated source; quarter status recovered as a PIP-trigger spike per QM-Q1-020/021.',
  confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-06'], formIds: [],
  relevance: 'decoy', section: 'D. Quality Metrics — Q1 (prior-quarter context)',
  title: 'Wound Infection Rate — Q1 (not tracked in Q2 metrics)',
  summary: 'Jan 0.7%, Feb 3.3%, Mar 2.9% — target ≤5%; status "critical" in Q1; drove PIP-TRIG-Q1-006.',
  details: [
    'This series is not carried into the Q2 quality-metric set (Q2_METRICS has no WOUND_INFECTION_RATE entry).',
    'Do not import this Q1-only metric into a Q2 denominator or trend calculation as if it were a Q2 observation.',
  ],
};

const exFeederCl: Exhibit = {
  id: 'q2-ex-feeder-cl', sourceId: 'AUD-Q1-CL-008', quarter: 'Q1', asOfDate: '2026-04-02',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-06'], formIds: [],
  relevance: 'decoy', section: 'E. Feeder Audits',
  title: 'Q1 Feeder Audit — Clinical Quality (wound cluster)',
  summary: 'Signed 2026-04-02: wound infection cluster — 4 infections in February across 3 clinicians.',
  details: ['Relevant to the Q1 wound-infection PIP, not to this quarter\'s medication-reconciliation carry-forward or census matters.'],
};

const exFeederCo: Exhibit = {
  id: 'q2-ex-feeder-co', sourceId: 'AUD-Q1-CO-005', quarter: 'Q1', asOfDate: '2026-04-01',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: [], formIds: [],
  relevance: 'decoy', section: 'E. Feeder Audits',
  title: 'Q1 Feeder Audit — Compliance/Billing (overpayment)',
  summary: 'Signed 2026-04-01: overpayment check identified $1,200; voluntary refund initiated.',
  details: ['A billing/compliance matter, not a quality, census, PIP, or personnel matter — not evidence for any decision node this quarter.'],
};

const exFeederGapQ2: Exhibit = {
  id: 'q2-ex-feeder-gap-q2', sourceId: 'QAPI-Q2-DS-001', quarter: 'Q2', asOfDate: '2026-07-02',
  posture: 'calculated', sourceLabel: CALCULATED_LABEL, confidentiality: 'public', validationState: 'unvalidated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-PACKET-READINESS'],
  relevance: 'decision_relevant', section: 'E. Feeder Audits',
  title: 'Zero Feeder Audits Recovered for Q2',
  summary: 'The recovered Q2 dataset contains zero feeder-audit records, in contrast to 2 recovered for Q1.',
  details: [
    'The "feeder audits present" packet-readiness gate should not be satisfied by a zero-count quarter without an explicit exception being recorded.',
  ],
};

const exAe001: Exhibit = {
  id: 'q2-ex-ae-001', sourceId: 'AE-Q1-001', quarter: 'Q1', asOfDate: '2026-01-18',
  posture: 'recovered', confidentiality: 'restricted', validationState: 'validated',
  workflowIds: ['GV-WF-08'], formIds: ['GB-FORM-RCA-ESCALATION'],
  relevance: 'decoy', section: 'F. Adverse Events & RCA',
  title: 'AE-Q1-001 — CHF Exacerbation (RCA complete, CAP assigned)',
  summary: 'Severity High; RCA complete; root cause escalation-protocol adherence; CAP already assigned and closed out of this quarter\'s open escalation set.',
  details: ['This event\'s RCA is already complete and its CAP is not part of this quarter\'s open Board decision — do not cite it as the driver for GV-WF-08 this quarter.'],
};

const exAe004: Exhibit = {
  id: 'q2-ex-ae-004', sourceId: 'AE-Q1-004', quarter: 'Q1', asOfDate: '2026-03-03',
  posture: 'recovered', confidentiality: 'restricted', validationState: 'provisional',
  workflowIds: ['GV-WF-08', 'GV-WF-09'], formIds: ['GB-FORM-RCA-ESCALATION'],
  relevance: 'decision_relevant', section: 'F. Adverse Events & RCA',
  title: 'AE-Q1-004 — Sepsis (RCA in progress; systemic root cause; still open into Q2)',
  summary: 'Severity Critical; RCA-Q1-003 in progress (not complete); systemic root cause: escalation/reporting-chain failure; linked CAP-Q1-003; personnel matter separated (see q2-ex-disc-005).',
  details: [
    'Infection signs were documented on a prior visit note but not escalated for 36 hours.',
    'A systemic-root-cause adverse event with an RCA still in progress remains a live GV-WF-08 escalation this quarter, not a closed matter.',
    'Linked infection record: INF-Q1-005 (sepsis secondary to wound, status "Under Investigation").',
  ],
};

const exCmp005Q1: Exhibit = {
  id: 'q2-ex-cmp-005-q1', sourceId: 'COMP-Q1-005', quarter: 'Q1', asOfDate: '2026-03-07',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-05'], formIds: [],
  relevance: 'contextual', section: 'H. Complaints',
  title: 'COMP-Q1-005 — Interpreter Not Arranged (closed, escalated to GB)',
  summary: 'Closed in 12 days (outside the 5-day standard); escalated to Governing Body; status "Closed — escalated to GB."',
  details: ['Already closed — not part of the open complaint carry-forward count.'],
};

const exCmp006Q1: Exhibit = {
  id: 'q2-ex-cmp-006-q1', sourceId: 'COMP-Q1-006', quarter: 'Q1', asOfDate: '2026-03-22',
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-05'], formIds: [],
  relevance: 'decision_relevant', section: 'H. Complaints',
  title: 'COMP-Q1-006 — Scheduling/Late Arrivals (STILL OPEN)',
  summary: 'Status "Open — CAP initiated." Not resolved within Q1; days-to-resolve not recorded; not escalated to GB.',
  details: ['This complaint remains open as of the Q2 meeting and must be counted in this quarter\'s open-complaint total.'],
};

const exCmp004Q2: Exhibit = {
  id: 'q2-ex-cmp-004-q2', sourceId: 'MOCK-CMP-004', quarter: 'Q2', asOfDate: '2026-05-14',
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-05'], formIds: [],
  relevance: 'decision_relevant', section: 'H. Complaints',
  title: 'MOCK-CMP-004 — 3 Consecutive Missed HHA Visits',
  summary: 'Status "Open — under review"; not escalated to GB; not resolved within 5 days.',
  details: ['Open as of the Q2 meeting.'],
};

const exCmp007Q2: Exhibit = {
  id: 'q2-ex-cmp-007-q2', sourceId: 'MOCK-CMP-007', quarter: 'Q2', asOfDate: '2026-06-17',
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-05'], formIds: [],
  relevance: 'decision_relevant', section: 'H. Complaints',
  title: 'MOCK-CMP-007 — RN Did Not Explain Med Change at SOC',
  summary: 'Status "Open — coaching scheduled"; not escalated to GB; not resolved within 5 days.',
  details: ['Open as of the Q2 meeting.'],
};

const exDecoyCoverMemo: Exhibit = {
  id: 'q2-ex-decoy-cover-memo', sourceId: 'UNVERIFIED-COVER-MEMO-Q2', quarter: 'Q2', asOfDate: '2026-07-08',
  posture: 'unresolved', sourceLabel: UNVERIFIED_LABEL, confidentiality: 'public', validationState: 'conflicting',
  workflowIds: ['GV-WF-05'], formIds: [],
  relevance: 'conflicting', section: 'H. Complaints',
  title: 'Packet Cover Memo — "2 Complaints, Fully Resolved, 0 Carried Forward"',
  summary: 'An unsigned, unattributed cover memo attached to the front of the Q2 packet claims only 2 complaints this quarter, all resolved, with nothing carried forward from Q1.',
  details: [
    'This memo\'s claim directly conflicts with q2-ex-cmp-006-q1 (still open), q2-ex-cmp-004-q2, and q2-ex-cmp-007-q2, none of which are resolved.',
    'The memo carries no author, no sign-off, and no source-record citations — it is unverified, not a labeled supplemental record, and must not be treated as controlling.',
  ],
};

const exPipTrig004: Exhibit = {
  id: 'q2-ex-piptrig-004', sourceId: 'PIP-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-04-02',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-AUTHORIZATION'],
  relevance: 'contextual', section: 'I. PIP Triggers & Lifecycle',
  title: 'PIP-TRIG-Q1-004 — Medication Reconciliation Gap Trigger',
  summary: 'Severity Critical; med rec 72–79% vs ≥95%; systemic process gap; recommended action: PIP.',
  details: ['This is the originating trigger for PIP-Q1-004, carried forward into Q2 (see q2-ex-pip-004-q2).'],
};

const exPip004Q1: Exhibit = {
  id: 'q2-ex-pip-004-q1', sourceId: 'PIP-Q1-004', quarter: 'Q1', asOfDate: '2026-04-09',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: ['GV-WF-06'], formIds: ['GB-FORM-PIP-AUTHORIZATION'],
  relevance: 'contextual', section: 'I. PIP Triggers & Lifecycle',
  title: 'PIP-Q1-004 — Medication Reconciliation Improvement (baseline)',
  summary: 'Baseline: Q1 close 79.2% (target ≥95%). Sustainability criterion: two consecutive quarters ≥95%. CAP-Q1-002 opened. Return date 2026-07-10.',
  details: ['Not closure-eligible at authorization; this is the Q1 starting point for tracking into Q2.'],
};

const exPip004Q2: Exhibit = {
  id: 'q2-ex-pip-004-q2', sourceId: 'PIP-Q1-004', quarter: 'Q2', asOfDate: '2026-06-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-06', 'GV-WF-07'], formIds: ['GB-FORM-PIP-CLOSURE', 'GB-FORM-PIP-AUTHORIZATION'],
  relevance: 'decision_relevant', section: 'I. PIP Triggers & Lifecycle',
  title: 'PIP-Q1-004 (carry-forward) — Medication Reconciliation Improvement',
  summary: 'Current-quarter evidence: Q2 med rec 70.6% in June — a 3rd consecutive quarter below the ≥95% objective and NOT improving. closureEligible: false. New return date: 2026-10-09.',
  details: [
    'Sustainability criterion (two consecutive quarters ≥95%) has not been met in any quarter to date.',
    'No gbDecision has yet been recorded for this quarter\'s review.',
  ],
};

const exCap002: Exhibit = {
  id: 'q2-ex-cap-002', sourceId: 'CAP-Q1-002', quarter: 'Q1', asOfDate: '2026-04-30',
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
  relevance: 'decision_relevant', section: 'J. Corrective Action Plans & Budget',
  title: 'CAP-Q1-002 — Med Rec Protocol Re-education + Checklist',
  summary: 'Owner Q1:MOCK-CLIN-0027 (Clinical Manager). Due 2026-04-30. Status "Open." effectivenessDemonstrated: false.',
  details: [
    'Owner ID is quarter-scoped ("Q1:MOCK-CLIN-0027") per DQ-2026-001 — the same raw ID denotes a different person in Q2.',
    'Remains open and not yet demonstrated effective as of the Q2 review.',
  ],
};

const exCap003: Exhibit = {
  id: 'q2-ex-cap-003', sourceId: 'CAP-Q1-003', quarter: 'Q1', asOfDate: '2026-04-23',
  posture: 'recovered', confidentiality: 'public', validationState: 'provisional',
  workflowIds: ['GV-WF-07'], formIds: ['GB-FORM-CAP-EFFECTIVENESS'],
  relevance: 'decoy', section: 'J. Corrective Action Plans & Budget',
  title: 'CAP-Q1-003 — Wound Infection Control Protocol Revision',
  summary: 'Owner Q1:MOCK-CLIN-0017 (feeder-audit reviewer). Due 2026-04-23. Status "Open." effectivenessDemonstrated: false.',
  details: ['Tied to the Q1 wound-infection PIP, not to this quarter\'s medication-reconciliation carry-forward decision.'],
};

const exSupBudget: Exhibit = toExhibit(GB_SUP_BUDGET_001, {
  exhibitId: 'q2-ex-sup-budget', quarter: 'Q2', section: 'J. Corrective Action Plans & Budget',
  confidentiality: 'public', validationState: 'provisional', relevance: 'decision_relevant',
  formIds: ['GB-FORM-BUDGET-AUTHORIZATION', 'GB-FORM-CAP-EFFECTIVENESS'],
});

const exDisc004: Exhibit = {
  id: 'q2-ex-disc-004', sourceId: 'DISC-TRIG-Q1-004', quarter: 'Q1', asOfDate: '2026-03-15',
  posture: 'recovered', confidentiality: 'executive_session', validationState: 'provisional',
  workflowIds: ['GV-WF-09'], formIds: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES'],
  relevance: 'decision_relevant', section: 'K. Restricted Personnel Matters (Executive Session)',
  title: 'DISC-TRIG-Q1-004 — Unauthorized Documentation Change (restricted)',
  summary: 'Clinician ref Q1:MOCK-CLIN-0003. Visit note amended 11 days after entry, no documented reason or countersignature — potential retroactive alteration. Status "Under Investigation."',
  details: ['Severity Critical. Still under investigation as of the Q2 meeting — not yet resolved.'],
};

const exDisc005: Exhibit = {
  id: 'q2-ex-disc-005', sourceId: 'DISC-TRIG-Q1-005', quarter: 'Q1', asOfDate: '2026-03-04',
  posture: 'recovered', confidentiality: 'executive_session', validationState: 'provisional',
  workflowIds: ['GV-WF-08', 'GV-WF-09'], formIds: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES'],
  relevance: 'decision_relevant', section: 'K. Restricted Personnel Matters (Executive Session)',
  title: 'DISC-TRIG-Q1-005 — Failure to Follow Escalation Chain (restricted)',
  summary: 'Clinician ref Q1:MOCK-CLIN-0004. Sepsis signs documented 2026-03-02 not escalated for 36 hours; patient hospitalized (linked AE-Q1-004). Status "RCA pending — disciplinary hold."',
  details: ['Severity Critical. Directly linked to the still-open RCA in q2-ex-ae-004 — this is a patient-safety-linked personnel matter.'],
};

const exDq001Identity: Exhibit = {
  id: 'q2-ex-dq-001-identity', sourceId: 'DQ-2026-001', quarter: 'Q2', asOfDate: '2026-07-01',
  posture: 'recovered', confidentiality: 'public', validationState: 'conflicting',
  workflowIds: ['GV-WF-05', 'GV-WF-07'], formIds: ['GB-FORM-RECORD-CORRECTION'],
  relevance: 'decision_relevant', section: 'M. Data Quality Findings',
  title: 'Data-Quality Finding: Clinician IDs Reused for Different People',
  summary: 'The MOCK-CLIN-* roster is fully reassigned between Q1 and Q2. Q1 MOCK-CLIN-0027 = James T. Reeves (Clinical Manager); Q2 MOCK-CLIN-0026 = Angela Morales (Clinical Manager/DON). Same raw IDs denote different people.',
  details: [
    'Severity: critical.',
    'Required reviewer decision: approve a versioned alias/reconciliation table before any cross-quarter person-level analysis; do NOT merge on raw ID.',
    'Directly affects CAP ownership continuity (q2-ex-cap-002) and any cross-quarter accountability tracking — always cite quarter-scoped IDs (e.g. "Q1:MOCK-CLIN-0027").',
  ],
};

const exDq003MissingDecision: Exhibit = {
  id: 'q2-ex-dq-003-missing-decision', sourceId: 'DQ-2026-003', quarter: 'Q1', asOfDate: '2026-04-09',
  posture: 'recovered', confidentiality: 'public', validationState: 'unvalidated',
  workflowIds: ['GV-WF-05'], formIds: ['GB-FORM-RECORD-CORRECTION'],
  relevance: 'contextual', section: 'M. Data Quality Findings',
  title: 'Data-Quality Finding: No GB Motion/Vote Record for Q1 Escalations',
  summary: 'GB-Q1-001 records 4 items escalated to the Board (sepsis case AE-Q1-004, interpreter complaint COMP-Q1-005, OASIS accuracy trend, doc-to-claim mismatch) but the source contains no motion/vote/directive record memorializing the Board\'s Q1 decision on them.',
  details: [
    'A labeled synthetic supplement (SUPP-GB-MOTION-Q1-001, not reproduced in this quarter\'s book) provides a motion shell for UAT workflow purposes only — it is not a real Board decision record.',
    'This is background context: it does not itself require a Q2 decision, but illustrates why this quarter\'s motions must be fully and contemporaneously documented.',
  ],
};

const exSupAdm: Exhibit = toExhibit(GB_SUP_ADM_001, {
  exhibitId: 'q2-ex-sup-adm', quarter: 'Q2', section: 'N. Governance Continuity (Administrator, COI, Roster)',
  confidentiality: 'public', validationState: 'provisional', relevance: 'decision_relevant',
  formIds: ['GB-FORM-ADMINISTRATOR-CHANGE'],
});

const exSupCoi: Exhibit = toExhibit(GB_SUP_COI_001, {
  exhibitId: 'q2-ex-sup-coi', quarter: 'Q2', section: 'N. Governance Continuity (Administrator, COI, Roster)',
  confidentiality: 'restricted', validationState: 'validated', relevance: 'decision_relevant',
  formIds: ['GB-FORM-COI-DISCLOSURE', 'GB-FORM-RECUSAL-LOG'],
});

const exSupRoster: Exhibit = toExhibit(GB_SUP_ROSTER_2026, {
  exhibitId: 'q2-ex-sup-roster', quarter: 'Q2', section: 'N. Governance Continuity (Administrator, COI, Roster)',
  confidentiality: 'public', validationState: 'provisional', relevance: 'decision_relevant',
  formIds: ['GB-FORM-ROSTER-ATTEST', 'GB-FORM-DIRECTOR-APPOINTMENT'],
});

const exDecoyQ3Leak: Exhibit = {
  id: 'q2-ex-decoy-q3-leak', sourceId: 'QAPI-Q3-DS-001', quarter: 'Q3', asOfDate: '2026-08-04',
  posture: 'unresolved', sourceLabel: UNVERIFIED_LABEL, confidentiality: 'public', validationState: 'unvalidated',
  workflowIds: [], formIds: [],
  relevance: 'decoy', section: 'P. Out-of-Cutoff / Decoy',
  title: 'Preliminary Q3 Metric Snippet (dated after the Q2 meeting)',
  summary: 'A preliminary figure purporting to show improved medication-reconciliation performance in early Q3, dated 2026-08-04 — after this quarter\'s meeting (2026-07-10) and Q3 source normalization is still pending.',
  details: [
    'This exhibit postdates the Q2 source cutoff (2026-07-10) and must not be cited to justify any Q2 decision, however reassuring it looks.',
    'Q3 is not yet normalized in the source (normalizationStatus: "pending") — treat as unresolved regardless of date.',
  ],
};

const exDecoyAccreditation: Exhibit = {
  id: 'q2-ex-decoy-accreditation', sourceId: 'SVHHA-001', quarter: 'Q2', asOfDate: '2026-07-01',
  posture: 'recovered', confidentiality: 'public', validationState: 'validated',
  workflowIds: [], formIds: [],
  relevance: 'decoy', section: 'P. Out-of-Cutoff / Decoy',
  title: 'Agency Accreditation Status (not at issue this quarter)',
  summary: `${QAPI_2026.agency.agencyName} — ACHC accreditation active, expires 2027-06-30.`,
  details: ['Not due or at risk this quarter — do not select GV-WF-11 (Licensure & Accreditation Renewal) on the strength of this exhibit alone.'],
};

const EXHIBITS: Exhibit[] = [
  exMeetingControl, exSignoffStatus, exQ1Signoffs, exRosterBaseline, exAttendanceLog,
  exPopulationQ1, exPopulationQ2, exDq002Census,
  exMetHosp, exMetOasis, exMetMedRec, exMetPoc, exMetMissedVisit, exMetSatisfaction,
  exMetWoundQ1,
  exFeederCl, exFeederCo, exFeederGapQ2,
  exAe001, exAe004,
  exCmp005Q1, exCmp006Q1, exCmp004Q2, exCmp007Q2, exDecoyCoverMemo,
  exPipTrig004, exPip004Q1, exPip004Q2,
  exCap002, exCap003, exSupBudget,
  exDisc004, exDisc005,
  exDq001Identity, exDq003MissingDecision,
  exSupAdm, exSupCoi, exSupRoster,
  exDecoyQ3Leak, exDecoyAccreditation,
];

// ---------------------------------------------------------------------------
// Injects
// ---------------------------------------------------------------------------

const INJECTS: Inject[] = [
  {
    id: 'q2-inj-01-convene', round: 0,
    title: 'Convening Note',
    body: 'The Clinical Manager\'s office has assembled the Q2 packet and marked it "Reviewed." Before the Board relies on anything in it, verify what that stamp does and does not establish.',
    workflowIds: ['GV-WF-05'],
  },
  {
    id: 'q2-inj-02-coi', round: 1, releaseAfterNodeId: 'q2-n04',
    title: 'Conflict of Interest Disclosed',
    body: 'Immediately after quorum is established, Director F discloses an equity interest in the vendor whose contract renewal is on today\'s agenda.',
    workflowIds: ['GV-WF-02'], supplementalRecordId: 'GB-SUP-COI-001',
  },
  {
    id: 'q2-inj-03-admin', round: 1,
    title: 'Administrator Resignation Notice',
    body: 'The Administrator has submitted a resignation effective 2026-06-30 and proposed an interim successor for the Board\'s consideration this meeting.',
    workflowIds: ['GV-WF-03'], supplementalRecordId: 'GB-SUP-ADM-001',
  },
  {
    id: 'q2-inj-04-complaint-memo', round: 2, releaseAfterNodeId: 'q2-n08',
    title: 'Cover Memo Author Unknown',
    body: 'When asked who prepared the packet cover memo claiming "2 complaints, fully resolved," neither the Administrator\'s nor the Clinical Manager\'s office can identify an author.',
    workflowIds: ['GV-WF-05'],
  },
  {
    id: 'q2-inj-05-budget', round: 3, releaseAfterNodeId: 'q2-n11',
    title: 'Budget Authorization Requested',
    body: 'Management formally requests Board authorization of 0.5 FTE quality-review staffing and a documentation-audit tool license to sustain the medication-reconciliation CAP.',
    workflowIds: ['GV-WF-07'], supplementalRecordId: 'GB-SUP-BUDGET-001',
  },
  {
    id: 'q2-inj-06-restricted-context', round: 4,
    title: 'Executive Session Called',
    body: 'The Chair calls executive session to review the two open restricted personnel matters, both patient-safety-linked and both still open from Q1.',
    workflowIds: ['GV-WF-09'],
  },
  {
    id: 'q2-inj-07-recusal-request', round: 6,
    title: 'Recused Director Asks to Remain',
    body: 'Director F asks to remain in the room for the vendor-contract deliberation, stating they will still abstain from the vote.',
    workflowIds: ['GV-WF-02'],
  },
];

// ---------------------------------------------------------------------------
// Decision nodes — 18 total across rounds 0-6
// ---------------------------------------------------------------------------

const CONSEQ = (
  patientSafety: string, regulatory: string, financial: string, privacy: string, recordIntegrity: string,
) => ({ patientSafety, regulatory, financial, privacy, recordIntegrity });

const DECISION_NODES: DecisionNode[] = [
  {
    id: 'q2-n01', matterId: MATTER_ID, round: 0, kind: 'reconcile_conflict',
    title: 'Reconcile the Census Discontinuity',
    prompt: 'Q1 closed at 120 active patients. Q2 opens at 100. Before this packet is used for any denominator-based decision this quarter, resolve how the Board should treat this discontinuity.',
    competencyIds: ['evidence-integrity', 'census-denominator-integrity'],
    workflowIds: ['GV-WF-05'], pointsAvailable: 40,
    requiredEvidenceIds: ['q2-ex-population-q1', 'q2-ex-population-q2', 'q2-ex-dq-002-census'],
    options: [
      { id: 'o1', text: 'Flag DQ-2026-002 as an unresolved data-quality defect, preserve both recovered census figures, and direct management to reconcile the true opening census before it is used for any denominator-based decision.', correct: true },
      { id: 'o2', text: 'Accept 120 (Q1 close) as authoritative because it is the higher, more recently-confirmed figure, and proceed.' },
      { id: 'o3', text: 'Accept 100 (Q2 open) as authoritative because it is what Q2 itself reports, and proceed.' },
      { id: 'o4', text: 'Average the two figures (110) into a single reconciled number for this quarter\'s packet without further review.', criticalFailure: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'A 20-patient discontinuity that is not explained by recorded discharges/transfers is a data-quality defect, not a rounding question. The Board\'s duty is to require reconciliation, not to pick a convenient number.',
    alternativesWhyFail: [
      'Picking either recovered figure without reconciliation silently endorses one unexplained number over another.',
      'Averaging invents a third number with no evidentiary basis and would misrepresent the record if relied upon downstream — a record-integrity failure in its own right.',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS'],
    deadlineExplanation: 'The GB package deadline (2026-07-03) has passed with this defect unresolved; reconciliation must be directed at this meeting, not deferred past the 2026-07-17 minutes-due date.',
    consequences: CONSEQ(
      'Downstream rate calculations built on an unreconciled census could misstate risk to the Board.',
      'An accreditor reviewing this packet would flag reliance on an unreconciled denominator as a governance control failure.',
      'Miscounted census can distort billing/enrollment reconciliation exposure.',
      'None directly — this is an aggregate count, not patient-identified data.',
      'Silently choosing a number contaminates every metric computed from it for the rest of the record.',
    ),
  },
  {
    id: 'q2-n02', matterId: MATTER_ID, round: 0, kind: 'classify_evidence',
    title: 'Screen the Book Before Convening',
    prompt: 'Before the meeting opens, identify every exhibit in this packet that is a labeled supplemental synthetic UAT record — content authored only to complete workflow coverage, never source-recovered — so it can be disclosed as such if relied upon.',
    competencyIds: ['evidence-integrity'],
    workflowIds: ['GV-WF-05'], pointsAvailable: 30,
    requiredEvidenceIds: ['q2-ex-sup-adm', 'q2-ex-sup-coi', 'q2-ex-sup-roster', 'q2-ex-sup-budget'],
    options: [
      { id: 'o1', text: 'q2-ex-sup-adm — Administrator Change Notice', correct: true },
      { id: 'o2', text: 'q2-ex-sup-coi — Conflict of Interest Disclosure', correct: true },
      { id: 'o3', text: 'q2-ex-sup-roster — Board Roster Change', correct: true },
      { id: 'o4', text: 'q2-ex-sup-budget — Budget Authorization Request', correct: true },
      { id: 'o5', text: 'q2-ex-decoy-cover-memo — Packet Cover Memo (this is unverified/unattributed, not a labeled supplemental record)' },
      { id: 'o6', text: 'q2-ex-feeder-gap-q2 — Zero Feeder Audits Recovered (this is a calculated gap flag, not a supplemental record)' },
    ],
    modelAction: { correctOptionIds: ['o1', 'o2', 'o3', 'o4'] },
    rationale: 'Only the four exhibits carrying the exact SUPPLEMENTAL SYNTHETIC UAT RECORD label are supplemental. The cover memo is worse than supplemental — it is unverified and unattributed. The feeder-audit gap flag is a calculated observation about an absence of records, not itself an authored supplement.',
    alternativesWhyFail: [
      'Treating the unverified cover memo as merely "supplemental" understates the problem — it has no established author or source at all.',
      'Missing any of the four true supplements risks the Board relying on authored content without disclosing that it is not source-recovered.',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS'],
    deadlineExplanation: 'This screening belongs to pre-meeting packet intake, before the agenda opens.',
    consequences: CONSEQ(
      'None directly at this screening step.',
      'Failing to disclose supplemental content as such misrepresents the evidentiary basis of every decision built on it.',
      'None directly.',
      'None directly.',
      'Misclassifying unverified content as merely supplemental erodes the reliability of the record-classification system itself.',
    ),
  },
  {
    id: 'q2-n03', matterId: MATTER_ID, round: 1, kind: 'session_classification',
    title: 'Classify This Quarter\'s Docket',
    prompt: 'Classify today\'s matters as Public Session or Executive Session before the agenda proceeds.',
    competencyIds: ['executive-session', 'board-vs-management'],
    workflowIds: ['GV-WF-09'], pointsAvailable: 40,
    requiredEvidenceIds: ['q2-ex-disc-004', 'q2-ex-disc-005', 'q2-ex-sup-adm'],
    options: [
      { id: 'o1', text: 'Executive Session: the two restricted personnel matters (DISC-TRIG-Q1-004, DISC-TRIG-Q1-005). Public Session (with recusal as required): census/metrics/PIP/CAP review, the administrator change, and the vendor-contract vote.', correct: true },
      { id: 'o2', text: 'All matters, including the restricted personnel matters, should be handled in public session for transparency.' },
      { id: 'o3', text: 'The administrator change should also be handled in executive session since it involves a personnel change.' },
      { id: 'o4', text: 'Resolve both restricted personnel matters in executive session by directing specific termination decisions to be announced publicly.', overreach: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'Patient-safety-linked personnel matters under investigation belong in executive session; an administrator succession is a governance appointment properly handled in public session with the required forms.',
    alternativesWhyFail: [
      'Discussing active, unresolved disciplinary investigations in public session risks disclosure harms and undermines the investigations themselves.',
      'The administrator change is a governance appointment action, not a confidential personnel investigation, and belongs in public session.',
    ],
    formsRequired: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-ADMINISTRATOR-CHANGE'],
    deadlineExplanation: 'Session classification must be settled before deliberation begins, not retroactively.',
    consequences: CONSEQ(
      'Improper public disclosure of an active patient-safety investigation can chill reporting and complicate the RCA.',
      'Misclassifying a restricted matter as public session is itself a governance-process defect.',
      'None directly.',
      'Public disclosure of clinician-identifying investigative detail is a privacy failure.',
      'The session-type designation must be documented correctly before the meeting record is finalized.',
    ),
  },
  {
    id: 'q2-n04', matterId: MATTER_ID, round: 1, kind: 'quorum_calc',
    title: 'Compute Baseline Quorum to Convene',
    prompt: 'Using the roster baseline and the attendance log, compute whether quorum is met to convene the general session.',
    competencyIds: ['quorum-recusal'],
    workflowIds: ['GV-WF-01'], pointsAvailable: 35,
    requiredEvidenceIds: ['q2-ex-roster-baseline', 'q2-ex-attendance-log'],
    modelAction: { seatedDirectors: 6, quorumThreshold: 4, present: 5, quorumMet: true },
    rationale: 'With one seat vacant, 6 directors are formally seated; a simple majority (4) is required; 5 are present at call-to-order, so quorum is met to convene.',
    alternativesWhyFail: [
      'Using 7 (the full bylaws seat count) ignores the currently-vacant seat and would misstate both the seated total and the quorum threshold.',
      'Treating the pending roster replacement as already seated before the Board has acted on q2-ex-sup-roster overstates the roster.',
    ],
    formsRequired: ['GB-FORM-ROSTER-ATTEST'],
    deadlineExplanation: 'Quorum must be established at call-to-order before any matter is deliberated.',
    consequences: CONSEQ(
      'None directly.',
      'A vote taken without a properly computed quorum is not a valid governance action and would not withstand review.',
      'None directly.',
      'None directly.',
      'An incorrect quorum count invalidates the legal basis of every decision recorded at this meeting.',
    ),
  },
  {
    id: 'q2-n05', matterId: MATTER_ID, round: 1, kind: 'workflow_select',
    title: 'Select This Quarter\'s Applicable Workflows',
    prompt: 'Select every Governing Body workflow this quarter\'s packet properly activates.',
    competencyIds: ['evidence-integrity', 'record-integrity'],
    workflowIds: ['GV-WF-01', 'GV-WF-02', 'GV-WF-03', 'GV-WF-05', 'GV-WF-06', 'GV-WF-07', 'GV-WF-08', 'GV-WF-09'], pointsAvailable: 80,
    requiredEvidenceIds: [
      'q2-ex-meeting-control', 'q2-ex-sup-roster', 'q2-ex-sup-coi', 'q2-ex-sup-adm',
      'q2-ex-pip-004-q2', 'q2-ex-sup-budget', 'q2-ex-ae-004', 'q2-ex-disc-005',
    ],
    options: [
      { id: 'wf01', text: 'GV-WF-01 — Board Roster & Composition Change', correct: true },
      { id: 'wf02', text: 'GV-WF-02 — Conflict of Interest Disclosure & Recusal', correct: true },
      { id: 'wf03', text: 'GV-WF-03 — Administrator Appointment or Change', correct: true },
      { id: 'wf05', text: 'GV-WF-05 — Quarterly QAPI Packet Review & Decision', correct: true },
      { id: 'wf06', text: 'GV-WF-06 — PIP Authorization, Sustainability Review & Closure', correct: true },
      { id: 'wf07', text: 'GV-WF-07 — CAP & Budget/Resource Authorization', correct: true },
      { id: 'wf08', text: 'GV-WF-08 — Adverse Event Root-Cause Escalation', correct: true },
      { id: 'wf09', text: 'GV-WF-09 — Restricted Personnel Matter (Executive Session)', correct: true },
      { id: 'wf10', text: 'GV-WF-10 — Scope of Services Change (no scope change is before the Board this quarter)' },
      { id: 'wf11', text: 'GV-WF-11 — Licensure & Accreditation Renewal (accreditation is not due or at risk this quarter)' },
      { id: 'wf12', text: 'GV-WF-12 — Change of Ownership Notification (no CHOW transaction is before the Board)' },
      { id: 'wf13', text: 'GV-WF-13 — Media/Public Incident & Privacy Breach Response (no such incident this quarter)' },
    ],
    modelAction: { correctOptionIds: ['wf01', 'wf02', 'wf03', 'wf05', 'wf06', 'wf07', 'wf08', 'wf09'] },
    rationale: 'Eight workflows are genuinely triggered this quarter: the roster vacancy/replacement, the vendor COI disclosure, the administrator succession, the quarterly packet review itself, the carried-forward PIP, the CAP budget request, the still-open sepsis RCA, and the two restricted personnel matters.',
    alternativesWhyFail: [
      'Selecting GV-WF-10/11/12/13 fires a workflow without a genuine trigger present in this quarter\'s record — an unsupported activation.',
      'Omitting GV-WF-01 ignores that a seat vacancy and proposed replacement is itself a composition-change event requiring the roster-attestation workflow.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Workflow selection frames which forms and decisions the rest of the meeting must produce.',
    consequences: CONSEQ(
      'Missing GV-WF-08/09 leaves patient-safety-linked matters untracked at the governance level.',
      'Firing workflows without triggers, or omitting triggered ones, misstates the Board\'s actual oversight activity for survey purposes.',
      'Unsupported budget/CHOW-type workflow activation could misdirect resources or filings.',
      'None directly.',
      'An incorrect workflow map corrupts the coverage record for the whole quarter.',
    ),
  },
  {
    id: 'q2-n06', matterId: MATTER_ID, round: 1, kind: 'forms_select',
    title: 'Select the Required Forms Bundle',
    prompt: 'Select every form this quarter\'s activated workflows require.',
    competencyIds: ['record-integrity'],
    workflowIds: ['GV-WF-01', 'GV-WF-02', 'GV-WF-03', 'GV-WF-05', 'GV-WF-06', 'GV-WF-07', 'GV-WF-08', 'GV-WF-09'], pointsAvailable: 70,
    requiredEvidenceIds: ['q2-ex-sup-roster', 'q2-ex-sup-coi', 'q2-ex-sup-adm', 'q2-ex-pip-004-q2', 'q2-ex-sup-budget', 'q2-ex-ae-004', 'q2-ex-disc-005'],
    options: [
      { id: 'f1', text: 'GB-FORM-ROSTER-ATTEST + GB-FORM-DIRECTOR-APPOINTMENT', correct: true },
      { id: 'f2', text: 'GB-FORM-COI-DISCLOSURE + GB-FORM-RECUSAL-LOG', correct: true },
      { id: 'f3', text: 'GB-FORM-ADMINISTRATOR-CHANGE', correct: true },
      { id: 'f4', text: 'GB-FORM-QAPI-PACKET-REVIEW + GB-FORM-PACKET-READINESS', correct: true },
      { id: 'f5', text: 'GB-FORM-PIP-AUTHORIZATION + GB-FORM-PIP-CLOSURE', correct: true },
      { id: 'f6', text: 'GB-FORM-CAP-EFFECTIVENESS + GB-FORM-BUDGET-AUTHORIZATION', correct: true },
      { id: 'f7', text: 'GB-FORM-RCA-ESCALATION', correct: true },
      { id: 'f8', text: 'GB-FORM-RESTRICTED-MATTER + GB-FORM-EXEC-SESSION-MINUTES + GB-FORM-PUBLIC-MINUTES', correct: true },
      { id: 'f9', text: 'GB-FORM-SCOPE-CHANGE (no scope-of-services change is before the Board)' },
      { id: 'f10', text: 'GB-FORM-CHOW-NOTIFICATION (no change-of-ownership transaction this quarter)' },
      { id: 'f11', text: 'GB-FORM-LICENSURE-RENEWAL (accreditation is not due or at risk this quarter)' },
      { id: 'f12', text: 'GB-FORM-TRAINING-ATTESTATION (not this quarter\'s triggered matter)' },
    ],
    modelAction: { correctOptionIds: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'] },
    rationale: 'Each of the eight activated workflows carries its own required form set; the untriggered workflows\' forms (scope, CHOW, licensure, training) do not apply this quarter.',
    alternativesWhyFail: [
      'Including forms for untriggered workflows creates paperwork with no underlying authorized matter.',
      'Omitting any of the eight required bundles leaves an activated workflow without its documentation.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'Forms must be identified before the meeting record is finalized and minutes are due (2026-07-17).',
    consequences: CONSEQ(
      'None directly.',
      'Missing required forms is itself a documentation defect an accreditor would cite.',
      'None directly.',
      'None directly.',
      'A workflow without its paired form leaves an incomplete governance record.',
    ),
  },
  {
    id: 'q2-n07', matterId: MATTER_ID, round: 2, kind: 'evidence_chain',
    title: 'Verify Clinician Identity Before Assigning Accountability',
    prompt: 'Before relying on "MOCK-CLIN-0027" to track CAP ownership across quarters, build the evidence chain proving the ID does not denote the same person in Q1 and Q2.',
    competencyIds: ['evidence-integrity', 'record-integrity'],
    workflowIds: ['GV-WF-07'], pointsAvailable: 40,
    requiredEvidenceIds: ['q2-ex-dq-001-identity', 'q2-ex-cap-002'],
    options: [
      { id: 'o1', text: 'Cite DQ-2026-001 (identity collision finding) together with CAP-Q1-002\'s owner record, and reference the owner only as the quarter-scoped ID "Q1:MOCK-CLIN-0027."', correct: true },
      { id: 'o2', text: 'Cite CAP-Q1-002 alone; the owner field is self-explanatory.' },
      { id: 'o3', text: 'Assume the Q2 roster\'s "MOCK-CLIN-0027" (if referenced elsewhere) is the same accountable person without checking DQ-2026-001.' },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'DQ-2026-001 establishes that raw MOCK-CLIN IDs are reused for different people across quarters; any cross-quarter accountability statement must cite the finding and use the quarter-scoped ID.',
    alternativesWhyFail: [
      'Citing the CAP record alone omits the finding that makes the raw ID unsafe to reuse across quarters.',
      'Assuming identity without checking the finding risks holding the wrong person accountable, or exonerating the right one by mistake.',
    ],
    formsRequired: ['GB-FORM-RECORD-CORRECTION'],
    deadlineExplanation: 'Identity verification must precede any motion that assigns or reassigns ownership this quarter (see q2-n13).',
    consequences: CONSEQ(
      'None directly.',
      'Misattributed accountability across quarters would not withstand a compliance or legal review of the record.',
      'None directly.',
      'None directly.',
      'This is the canonical record-integrity failure mode this case is built to test.',
    ),
  },
  {
    id: 'q2-n08', matterId: MATTER_ID, round: 2, kind: 'reconcile_conflict',
    title: 'Reconcile the True Open-Complaint Count',
    prompt: 'The packet cover memo claims 2 complaints this quarter, fully resolved, with nothing carried forward. Determine the true number of open complaints the Board must track.',
    competencyIds: ['evidence-integrity'],
    workflowIds: ['GV-WF-05'], pointsAvailable: 40,
    requiredEvidenceIds: ['q2-ex-cmp-006-q1', 'q2-ex-cmp-004-q2', 'q2-ex-cmp-007-q2', 'q2-ex-decoy-cover-memo'],
    options: [
      { id: 'o1', text: '3 open complaints carry into this review: COMP-Q1-006 (still open from Q1), MOCK-CMP-004, and MOCK-CMP-007 — the unverified cover memo\'s claim of 2 total, fully resolved, is incorrect and must be corrected before use.', correct: true },
      { id: 'o2', text: '2 open complaints, per the packet cover memo; COMP-Q1-006 was already closed in Q1.' },
      { id: 'o3', text: '1 open complaint; only the most recent complaint counts since older ones roll off automatically.' },
      { id: 'o4', text: 'Rely on the cover memo\'s total and close the complaint-trend PIP trigger as resolved.', criticalFailure: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'The underlying records show COMP-Q1-006 still open, plus two open Q2 complaints — three total, not the two the unverified memo claims.',
    alternativesWhyFail: [
      'The memo\'s claim is contradicted by the status field on COMP-Q1-006 itself ("Open — CAP initiated").',
      'Complaints do not expire by age; each is tracked until closed.',
    ],
    formsRequired: ['GB-FORM-PACKET-READINESS'],
    deadlineExplanation: 'This reconciliation must occur before any complaint-trend disposition is recorded this meeting.',
    consequences: CONSEQ(
      'An undercounted open-complaint total can mask a developing pattern before it becomes a safety event.',
      'Relying on an unverified memo instead of source records is a data-integrity failure an accreditor would cite.',
      'None directly.',
      'None directly.',
      'Closing a trigger on a false premise falsifies the resulting record.',
    ),
  },
  {
    id: 'q2-n09', matterId: MATTER_ID, round: 2, kind: 'denominator',
    title: 'Compute the June Missed-Visit Rate',
    prompt: 'Compute June\'s Missed Visit Rate and state which denominator is correct.',
    competencyIds: ['census-denominator-integrity', 'evidence-integrity'],
    workflowIds: ['GV-WF-05'], pointsAvailable: 50,
    requiredEvidenceIds: ['q2-ex-met-missedvisit'],
    modelAction: { denominatorType: 'scheduled_visits', numerator: 44, denominator: 979, ratePercent: 4.5 },
    rationale: 'The Missed Visit Rate is computed against scheduled/expected visits for the month (979 in June), not active patient census — 44/979 = 4.5%, above the ≤3% target.',
    alternativesWhyFail: [
      'Substituting the active-census figure (unreconciled at that) for the visit denominator produces a meaningless rate for this metric.',
      'Using a prior month\'s visit denominator understates the worsening June trend.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'This computation supports this quarter\'s missed-visit trend review.',
    consequences: CONSEQ(
      'A miscomputed missed-visit rate could understate a worsening pattern tied to care-delivery gaps.',
      'An incorrectly computed metric undermines the reliability of the packet.',
      'None directly.',
      'None directly.',
      'Denominator confusion between census, episodes, and visits is a recurring integrity risk across this packet.',
    ),
  },
  {
    id: 'q2-n10', matterId: MATTER_ID, round: 2, kind: 'proceed_decision',
    title: 'Decide the Hospitalization-Rate Posture',
    prompt: 'The aggregate Hospitalization Rate is within target but flagged as masking a worsening subgroup. Decide the Board\'s posture.',
    competencyIds: ['aggregate-vs-subgroup'],
    workflowIds: ['GV-WF-05', 'GV-WF-06'], pointsAvailable: 50,
    requiredEvidenceIds: ['q2-ex-met-hosp'],
    options: [
      { id: 'o1', text: 'Hold closure on this metric and direct management to produce the subgroup-level breakdown before the favorable aggregate is accepted, per the aggregate-masks-subgroup flag.', correct: true },
      { id: 'o2', text: 'Accept closure since the aggregate rate (2.0% in June) is within the ≤4% target.' },
      { id: 'o3', text: 'Take no action since the metric carries no PIP trigger this quarter.' },
      { id: 'o4', text: 'Direct the Clinical Manager to personally discipline the clinicians tied to the masked subgroup before the subgroup data is even produced.', overreach: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'A metric explicitly flagged as masking a worsening subgroup requires the Board to hold judgment and direct further review, not accept the topline number.',
    alternativesWhyFail: [
      'Accepting a flagged aggregate defeats the purpose of subgroup-level surveillance.',
      'Directing individual discipline before any subgroup data exists is both premature and outside the Board\'s role.',
    ],
    formsRequired: ['GB-FORM-QAPI-PACKET-REVIEW'],
    deadlineExplanation: 'This posture must be set at this meeting so management can report subgroup data before the next quarterly review.',
    consequences: CONSEQ(
      'A hidden, worsening subgroup is where the next adverse event is most likely to occur.',
      'Accepting a masked aggregate as sufficient would not withstand a surveyor\'s or accreditor\'s review of the underlying data.',
      'None directly.',
      'None directly.',
      'A closure decision built on a masked aggregate misstates the true state of the risk in the record.',
    ),
  },
  {
    id: 'q2-n11', matterId: MATTER_ID, round: 3, kind: 'disposition',
    title: 'Decide PIP-Q1-004 Closure',
    prompt: 'Decide whether PIP-Q1-004 (Medication Reconciliation Improvement) may be closed this quarter.',
    competencyIds: ['pip-closure-sustainability'],
    workflowIds: ['GV-WF-06'], pointsAvailable: 50,
    requiredEvidenceIds: ['q2-ex-pip-004-q1', 'q2-ex-pip-004-q2'],
    options: [
      { id: 'o1', text: 'Do not authorize closure. Q2 evidence (70.6% in June) is a third consecutive quarter below the ≥95% objective, and the sustainability criterion (two consecutive quarters ≥95%) has never been met.', correct: true },
      { id: 'o2', text: 'Authorize closure since a CAP was completed and an in-service was conducted.' },
      { id: 'o3', text: 'Authorize partial closure for the SOC/ROC sub-process only.' },
      { id: 'o4', text: 'Authorize closure and remove the item from Board tracking to reduce the reported open-PIP count.', criticalFailure: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'Closure requires the approved sustainability criterion to actually be demonstrated; activity (a completed CAP task) is not the same as the outcome the criterion requires.',
    alternativesWhyFail: [
      'Completing a corrective activity once does not establish the two-consecutive-quarter sustainability the PIP itself requires.',
      'There is no partial-closure mechanism recognized by the approved objective — the criterion applies to the whole measure.',
    ],
    formsRequired: ['GB-FORM-PIP-CLOSURE'],
    deadlineExplanation: 'The PIP\'s existing return date was 2026-07-10 (this meeting); a new return date must be set if not closed.',
    consequences: CONSEQ(
      'Closing an unresolved medication-reconciliation gap leaves a real patient-safety risk unmonitored.',
      'Closing a PIP without meeting its own criterion is a defensibility failure under survey.',
      'None directly.',
      'None directly.',
      'Removing an open item from tracking to improve appearances falsifies the governance record.',
    ),
  },
  {
    id: 'q2-n12', matterId: MATTER_ID, round: 3, kind: 'effectiveness',
    title: 'Determine CAP-Q1-002 Effectiveness',
    prompt: 'Determine whether CAP-Q1-002 (medication-reconciliation protocol re-education) has been demonstrated effective.',
    competencyIds: ['budget-cap-resources'],
    workflowIds: ['GV-WF-07'], pointsAvailable: 70,
    requiredEvidenceIds: ['q2-ex-cap-002', 'q2-ex-sup-budget', 'q2-ex-pip-004-q2'],
    modelAction: {
      effectivenessDemonstrated: false,
      reason: 'The measured rate continued to decline through Q2 (77.8% Apr to 70.6% Jun) and the CAP\'s own required resourcing (0.5 FTE quality-review staffing plus a documentation-audit tool) has not yet been authorized.',
    },
    rationale: 'Effectiveness requires the CAP\'s own stated resource commitments to actually be in place, not just the corrective activity to have occurred once; the rate is still worsening.',
    alternativesWhyFail: [
      'Marking a CAP effective while its own required resources remain unauthorized and the metric is worsening ignores the CAP\'s own design.',
      'Treating "re-education occurred" as sufficient conflates activity with outcome.',
    ],
    formsRequired: ['GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    deadlineExplanation: 'CAP-Q1-002 was due 2026-04-30; its effectiveness must be assessed against current-quarter evidence now, not against the original due date alone.',
    consequences: CONSEQ(
      'An unresourced, ineffective CAP leaves the underlying medication-reconciliation risk to recur.',
      'Marking an unresourced CAP "effective" would not withstand review against its own stated criteria.',
      'Failing to authorize the requested resourcing when the CAP\'s own design requires it undermines the fix\'s stated basis.',
      'None directly.',
      'The effectiveness record must match the CAP\'s own stated resourcing requirement, not a lower bar.',
    ),
  },
  {
    id: 'q2-n13', matterId: MATTER_ID, round: 3, kind: 'motion_builder',
    title: 'Build the PIP Continuation & CAP Resourcing Motion',
    prompt: 'Build the motion to continue PIP-Q1-004 and authorize CAP-Q1-002\'s requested resourcing.',
    competencyIds: ['pip-closure-sustainability', 'budget-cap-resources', 'record-integrity'],
    workflowIds: ['GV-WF-06', 'GV-WF-07'], pointsAvailable: 80,
    requiredEvidenceIds: ['q2-ex-pip-004-q2', 'q2-ex-cap-002', 'q2-ex-sup-budget', 'q2-ex-dq-001-identity'],
    modelAction: {
      matter: 'Continue PIP-Q1-004 and authorize CAP-Q1-002 resourcing',
      ownerClinId: 'Q1:MOCK-CLIN-0027',
      dueDate: '2026-10-09',
      effectivenessCriteria: 'Two consecutive quarters at or above 95% medication reconciliation at SOC/ROC across all named strata, sustained after the requested resourcing is in place.',
      returnDate: '2026-10-09',
      budgetAuthorized: true,
      resources: '0.5 FTE quality-review staffing plus a documentation-audit tool license',
    },
    rationale: 'The motion must continue the PIP with its recorded return date, authorize the specific resourcing the CAP itself identified as required, and reference the CAP owner by quarter-scoped ID to avoid the identity-collision defect.',
    alternativesWhyFail: [
      'Referencing the owner by the bare ID "MOCK-CLIN-0027" without the quarter scope repeats the identity-collision defect this record has already flagged.',
      'Setting a due/return date other than 2026-10-09 does not match the record\'s own carry-forward return date.',
      'Approving continuation without authorizing the requested resources leaves the CAP\'s own stated precondition for effectiveness unmet.',
    ],
    formsRequired: ['GB-FORM-PIP-AUTHORIZATION', 'GB-FORM-CAP-EFFECTIVENESS', 'GB-FORM-BUDGET-AUTHORIZATION'],
    deadlineExplanation: 'The motion must be recorded at this meeting so the CAP\'s effectiveness can be judged against the resourced state at the 2026-10-09 return date.',
    consequences: CONSEQ(
      'Continuing the PIP without resourcing it repeats the same unsustained pattern into a fourth quarter.',
      'A motion with an ambiguous owner reference is not defensible on cross-quarter review.',
      'Authorizing the specific requested resources commits a defined, bounded cost rather than an open-ended one.',
      'None directly.',
      'This motion is the governance record\'s primary defense against both the identity-collision and the sustainability-criterion defects surfaced this quarter.',
    ),
  },
  {
    id: 'q2-n14', matterId: MATTER_ID, round: 4, kind: 'board_vs_management',
    title: 'Direct the Restricted Personnel Matters',
    prompt: 'In executive session, decide the Board\'s action on the two still-open restricted personnel matters.',
    competencyIds: ['board-vs-management', 'executive-session'],
    workflowIds: ['GV-WF-09'], pointsAvailable: 40,
    requiredEvidenceIds: ['q2-ex-disc-004', 'q2-ex-disc-005'],
    options: [
      { id: 'o1', text: 'Direct management to complete both investigations and report systemic findings and accountability actions back to the Board; document Board oversight in executive-session minutes. The Board does not itself select or direct the individual disciplinary outcome.', correct: true },
      { id: 'o2', text: 'Take no action since both matters are still "Under Investigation" / "RCA pending."' },
      { id: 'o3', text: 'Direct that both clinicians (Q1:MOCK-CLIN-0003, Q1:MOCK-CLIN-0004) be terminated effective immediately.', overreach: true },
      { id: 'o4', text: 'Disclose the clinicians\' identities and investigative detail in the public-session minutes for transparency.', criticalFailure: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'The Board directs systemic accountability and holds management to it; both matters remaining open past a full quarter still requires Board-level oversight and a directive that management report back, without the Board itself directing the individual personnel outcome.',
    alternativesWhyFail: [
      'Two quarters open on a patient-safety-linked matter is itself something the Board must act on, not merely note.',
      'Directing a specific individual outcome is management\'s function, not the Board\'s, and is not a record the Board can defend as within its authority.',
    ],
    formsRequired: ['GB-FORM-RESTRICTED-MATTER', 'GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'These matters have remained open since Q1; the Board must direct a reporting timeline at this meeting.',
    consequences: CONSEQ(
      'An unresolved escalation-chain failure linked to a sepsis hospitalization remains a live patient-safety risk until closed.',
      'A Board that directs individual personnel outcomes acts outside its authority and outside a record it can defend.',
      'None directly.',
      'Naming clinicians or disclosing investigative detail publicly is a privacy and personnel-law exposure.',
      'The executive-session record must show Board direction without crossing into management\'s function.',
    ),
  },
  {
    id: 'q2-n15', matterId: MATTER_ID, round: 4, kind: 'confidential_minutes',
    title: 'Record the Executive-Session Minutes',
    prompt: 'Decide what belongs in the confidential executive-session minutes for the two restricted matters.',
    competencyIds: ['executive-session'],
    workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    requiredEvidenceIds: ['q2-ex-disc-004', 'q2-ex-disc-005'],
    options: [
      { id: 'o1', text: 'Full substantive detail of both restricted matters — findings, clinician references, recommended actions, and current status — recorded in the confidential executive-session minutes only.', correct: true },
      { id: 'o2', text: 'A brief mention only, deferring full detail to the next public session.' },
      { id: 'o3', text: 'Omit both matters from any minutes since they remain under investigation.', criticalFailure: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'Executive-session minutes exist precisely to hold the confidential substance the public record must not disclose; omitting the matters entirely would leave no governance record of Board oversight at all.',
    alternativesWhyFail: [
      'Deferring detail risks losing contemporaneous accuracy and leaves no confidential record if the next session slips.',
      'Omitting the matters entirely erases the record that the Board exercised oversight over a live patient-safety issue.',
    ],
    formsRequired: ['GB-FORM-EXEC-SESSION-MINUTES'],
    deadlineExplanation: 'Minutes are due 2026-07-17; the confidential record must be contemporaneous with this meeting.',
    consequences: CONSEQ(
      'None directly.',
      'A missing confidential record of oversight is itself a documentation defect.',
      'None directly.',
      'Confidential minutes are the correct, restricted place for clinician-identifying detail — not the public minutes.',
      'This is the record that proves the Board actually reviewed the matter, distinct from what the public record may show.',
    ),
  },
  {
    id: 'q2-n16', matterId: MATTER_ID, round: 4, kind: 'public_minutes',
    title: 'Record the Public Minutes',
    prompt: 'Decide what the public minutes must show regarding the executive session just concluded.',
    competencyIds: ['executive-session', 'record-integrity'],
    workflowIds: ['GV-WF-09'], pointsAvailable: 50,
    requiredEvidenceIds: ['q2-ex-disc-004', 'q2-ex-disc-005'],
    options: [
      { id: 'o1', text: 'The public minutes record the fact that an executive session occurred, its general subject (restricted personnel/patient-safety matters), and any Board-authorized public-facing directive to management — without clinician identities or investigative detail.', correct: true },
      { id: 'o2', text: 'The public minutes omit any reference to the executive session having occurred.', criticalFailure: true },
      { id: 'o3', text: 'The public minutes name the clinicians and summarize the confidential findings.', criticalFailure: true },
    ],
    modelAction: { correctOptionIds: ['o1'] },
    rationale: 'Confidentiality protects the substance of the deliberation, not the fact that governance occurred; the public record must show that an executive session took place and its authorized public outcome.',
    alternativesWhyFail: [
      'Omitting the fact of governance action entirely breaks the public accountability record.',
      'Naming clinicians or summarizing confidential findings publicly defeats the purpose of executive session and creates privacy exposure.',
    ],
    formsRequired: ['GB-FORM-PUBLIC-MINUTES'],
    deadlineExplanation: 'Minutes are due 2026-07-17.',
    consequences: CONSEQ(
      'None directly.',
      'A public record with silent gaps where governance action occurred is itself a record-integrity defect.',
      'None directly.',
      'Public disclosure of confidential investigative detail is a privacy exposure this record must avoid.',
      'The public minutes are the accountability record the public and surveyors can rely on without needing confidential access.',
    ),
  },
  {
    id: 'q2-n17', matterId: MATTER_ID, round: 5, kind: 'eligibility',
    title: 'Assess the Proposed Interim Administrator',
    prompt: 'Assess whether the proposed interim Administrator may be seated, and identify what remains outstanding.',
    competencyIds: ['administrator-continuity', 'board-vs-management'],
    workflowIds: ['GV-WF-03'], pointsAvailable: 50,
    requiredEvidenceIds: ['q2-ex-sup-adm'],
    modelAction: {
      proposedAdministratorEligible: true,
      priorityActions: [
        'State licensure administrator-of-record update filing',
        'Regulatory/accreditation notification of the Administrator change',
        'Board vote to formally approve the interim appointment before the incumbent\'s 2026-06-30 departure',
      ],
      gap: 'Board approval and the state notification are still pending as of this meeting — the Board must act now to avoid an unfilled-Administrator gap.',
    },
    rationale: 'The proposed successor meets the qualification requirements on file, but eligibility alone does not complete the workflow — Board approval and the regulatory notifications are still outstanding and time-sensitive given the incumbent\'s departure date.',
    alternativesWhyFail: [
      'Treating the resignation notice alone as sufficient to seat the successor skips the Board\'s own required approval action.',
      'Deferring the vote past this meeting risks an unfilled-Administrator gap after 2026-06-30, a date that has already passed.',
    ],
    formsRequired: ['GB-FORM-ADMINISTRATOR-CHANGE'],
    deadlineExplanation: 'The incumbent\'s resignation was effective 2026-06-30 — before this meeting — making same-meeting Board action time-sensitive.',
    consequences: CONSEQ(
      'None directly.',
      'An unfilled or unapproved Administrator-of-record position is a licensure and regulatory-notification risk.',
      'None directly.',
      'None directly.',
      'The approval vote and notification filings must be documented at this meeting to close the gap already open since 2026-06-30.',
    ),
  },
  {
    id: 'q2-n18', matterId: MATTER_ID, round: 6, kind: 'quorum_calc',
    title: 'Recompute Quorum for the Vendor-Contract Vote',
    prompt: 'Director F has disclosed a conflict of interest and must recuse from the vendor-contract deliberation and vote. Recompute quorum for that specific matter.',
    competencyIds: ['quorum-recusal'],
    workflowIds: ['GV-WF-02'], pointsAvailable: 35,
    requiredEvidenceIds: ['q2-ex-sup-coi', 'q2-ex-roster-baseline', 'q2-ex-attendance-log'],
    modelAction: {
      matter: 'vendor contract renewal vote',
      seatedEligibleForMatter: 5,
      quorumThresholdForMatter: 3,
      presentEligible: 4,
      recusedDirectorRemainedInRoom: false,
      quorumMet: true,
    },
    rationale: 'A director with a declared conflict on this specific matter is excluded from both the vote and the eligible-voter denominator used to judge quorum for that matter: 6 seated less the 1 recused leaves 5 eligible, a majority of which is 3; with the recused director stepping out, 4 of the remaining 5 are present and eligible, so quorum is met for this matter.',
    alternativesWhyFail: [
      'Using the general 6-seated/4-threshold quorum for this specific matter ignores that the conflicted director must be excluded from the matter-specific denominator, not just the vote.',
      'Counting the recused director as present-and-eligible because they remain in the room contradicts the policy requirement that recusal include stepping out of deliberation.',
    ],
    formsRequired: ['GB-FORM-RECUSAL-LOG'],
    deadlineExplanation: 'Quorum for this matter must be established before the vendor-contract vote is taken, not after.',
    consequences: CONSEQ(
      'None directly.',
      'A vote taken on a miscalculated matter-specific quorum, or with a recused director still present, is not a valid governance action.',
      'An improperly quorate vendor-contract vote exposes the resulting contract to challenge.',
      'None directly.',
      'This is the case\'s explicit test of recomputing quorum after a mid-meeting recusal, distinct from the baseline quorum in q2-n04.',
    ),
  },
];

// ---------------------------------------------------------------------------
// Surveyor questions
// ---------------------------------------------------------------------------

const SURVEYOR: SurveyorQuestion[] = [
  {
    id: 'q2-surv-01',
    prompt: 'Show me the record proving this quarter\'s opening census does not reconcile with last quarter\'s closing census.',
    options: [
      { id: 'a', text: 'q2-ex-dq-002-census' },
      { id: 'b', text: 'q2-ex-population-q2 alone' },
      { id: 'c', text: 'q2-ex-met-hosp' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-population-q1', 'q2-ex-population-q2', 'q2-ex-dq-002-census'],
  },
  {
    id: 'q2-surv-02',
    prompt: 'Show me the record proving the medication-reconciliation PIP is not eligible for closure this quarter.',
    options: [
      { id: 'a', text: 'q2-ex-pip-004-q2' },
      { id: 'b', text: 'q2-ex-cap-002' },
      { id: 'c', text: 'q2-ex-piptrig-004' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-pip-004-q2'],
  },
  {
    id: 'q2-surv-03',
    prompt: 'Show me the records proving the two restricted personnel matters remain open and are patient-safety linked.',
    options: [
      { id: 'a', text: 'q2-ex-disc-004 and q2-ex-disc-005' },
      { id: 'b', text: 'q2-ex-ae-001' },
      { id: 'c', text: 'q2-ex-feeder-cl' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-disc-004', 'q2-ex-disc-005'],
  },
  {
    id: 'q2-surv-04',
    prompt: 'Show me the record proving this quarter\'s packet contains zero recovered feeder audits.',
    options: [
      { id: 'a', text: 'q2-ex-feeder-gap-q2' },
      { id: 'b', text: 'q2-ex-feeder-cl' },
      { id: 'c', text: 'q2-ex-meeting-control' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-feeder-gap-q2'],
  },
  {
    id: 'q2-surv-05',
    prompt: 'Show me the record proving a Board member disclosed a financial conflict of interest on the vendor-contract matter.',
    options: [
      { id: 'a', text: 'q2-ex-sup-coi' },
      { id: 'b', text: 'q2-ex-roster-baseline' },
      { id: 'c', text: 'q2-ex-attendance-log' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-sup-coi'],
  },
  {
    id: 'q2-surv-06',
    prompt: 'Show me the record proving the incumbent Administrator resigned and a successor was proposed for Board review.',
    options: [
      { id: 'a', text: 'q2-ex-sup-adm' },
      { id: 'b', text: 'q2-ex-dq-001-identity' },
      { id: 'c', text: 'q2-ex-q1-signoffs' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-sup-adm'],
  },
  {
    id: 'q2-surv-07',
    prompt: 'Show me the record proving one complaint from last quarter is still open and must be counted this quarter.',
    options: [
      { id: 'a', text: 'q2-ex-cmp-006-q1' },
      { id: 'b', text: 'q2-ex-cmp-005-q1' },
      { id: 'c', text: 'q2-ex-decoy-cover-memo' },
    ],
    correctId: 'a', requiresEvidenceIds: ['q2-ex-cmp-006-q1'],
  },
];

// ---------------------------------------------------------------------------
// Transfer questions
// ---------------------------------------------------------------------------

const TRANSFERS: TransferQuestion[] = [
  {
    id: 'q2-transfer-01',
    changedFacts: [
      'Instead of a vendor-contract equity interest, a director discloses a family relationship with the candidate proposed to succeed the outgoing Administrator.',
    ],
    prompt: 'What must happen before the Board votes on the Administrator appointment?',
    options: [
      { id: 'a', text: 'The disclosing director must recuse from deliberation and the vote on the appointment; quorum for that matter must be recomputed excluding them.' },
      { id: 'b', text: 'No recusal is needed since family relationships are not financial conflicts.' },
      { id: 'c', text: 'The director may vote as long as they disclose the relationship out loud first.' },
    ],
    correctId: 'a',
    rationale: 'A personal-relationship conflict of interest requires the same recusal-and-recompute-quorum treatment as a financial one — the conflict-of-interest policy is not limited to financial interests.',
  },
  {
    id: 'q2-transfer-02',
    changedFacts: [
      'Instead of Hospitalization Rate, OASIS Accuracy is favorable in aggregate but is flagged as masking a subgroup with a much higher error rate.',
    ],
    prompt: 'What is the Board\'s correct posture on the OASIS Accuracy metric?',
    options: [
      { id: 'a', text: 'Hold closure and direct management to produce the subgroup breakdown before accepting the aggregate as sufficient.' },
      { id: 'b', text: 'Accept closure since the aggregate is favorable.' },
      { id: 'c', text: 'Take no action since the metric is not this quarter\'s focus.' },
    ],
    correctId: 'a',
    rationale: 'The aggregate-masks-subgroup rule applies to any metric carrying that flag, not only hospitalization — the Board\'s duty runs to the subgroup regardless of which indicator is involved.',
  },
  {
    id: 'q2-transfer-03',
    changedFacts: [
      'A different PIP has met its sustainability criterion in aggregate for two consecutive quarters, but the current quarter\'s evidence is silent on one named stratum.',
    ],
    prompt: 'May the Board authorize closure of this PIP?',
    options: [
      { id: 'a', text: 'No — silence on a named stratum is a missing-evidence problem, not a passing result; closure requires affirmative evidence for every named stratum.' },
      { id: 'b', text: 'Yes — two consecutive quarters at the aggregate level is sufficient regardless of stratum-level silence.' },
      { id: 'c', text: 'Yes, with a note that the silent stratum will be monitored informally going forward.' },
    ],
    correctId: 'a',
    rationale: 'The same PIP-closure standard tested in q2-n11 applies here: the approved criterion must hold for every named stratum, and missing evidence for one is not evidence that the criterion is met.',
  },
  {
    id: 'q2-transfer-04',
    changedFacts: [
      'Instead of a restricted personnel matter, a single director attempts to unilaterally direct a vendor-selection decision outside of a convened, quorate Board meeting.',
    ],
    prompt: 'Is the director\'s individual direction a valid Board action?',
    options: [
      { id: 'a', text: 'No — Board authority is exercised collectively at a properly convened, quorate meeting; an individual director cannot direct a management decision on the Board\'s behalf.' },
      { id: 'b', text: 'Yes, as long as the director later reports the decision to the full Board.' },
      { id: 'c', text: 'Yes, if the director is the Board Chair.' },
    ],
    correctId: 'a',
    rationale: 'The same board-vs-management boundary tested in q2-n14 applies here in reverse: even a properly authorized subject matter requires collective Board action at a quorate meeting, not one director acting alone.',
  },
];

// ---------------------------------------------------------------------------
// Case pack
// ---------------------------------------------------------------------------

const REQUIRED_WORKFLOWS: GvWorkflowId[] = [
  'GV-WF-01', 'GV-WF-02', 'GV-WF-03', 'GV-WF-05', 'GV-WF-06', 'GV-WF-07', 'GV-WF-08', 'GV-WF-09',
];

export const Q2_2026_CASE: CasePack = {
  id: 'gb-tabletop-2026-q2',
  quarter: 'Q2',
  title: 'Q2 2026 — The Packet Cannot Be Trusted',
  subtitle: `${QAPI_2026.agency.agencyName} Governing Body Quarterly Review — a packet that looks complete on its cover and is not: an unreconciled census, reused clinician identities, an unverified complaint summary, a signed-vs-validated gap, a still-open patient-safety escalation, and three governance-continuity matters (roster, conflict of interest, Administrator succession) arriving in the same meeting.`,
  estMinutes: 105,
  sourceCutoff: '2026-07-10',
  exhibits: EXHIBITS,
  decisionNodes: DECISION_NODES,
  injects: INJECTS,
  surveyor: SURVEYOR,
  transfers: TRANSFERS,
  requiredWorkflows: REQUIRED_WORKFLOWS,
  passScore: 950,
  passStandardNote:
    'Passing this quarter\'s matter requires a total score of at least 950 of 1000 AND zero critical-failure results across the 18 scored decision nodes. A single critical failure (fabricating a reconciled census figure, closing a PIP to manage appearances, or disclosing restricted personnel detail publicly) fails the attempt regardless of total score, consistent with QUARTERLY_PASS_SCORE.',
};

export default Q2_2026_CASE;
