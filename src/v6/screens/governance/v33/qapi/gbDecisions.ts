/**
 * Governing Body — Decision-Side Records (Q1 & Q2 2026)
 * ---------------------------------------------------------------------------
 * SYNTHETIC DATA ONLY — Sunrise Valley Home Health Agency (SVHHA) — no PHI —
 * for UAT/demo use only, not for production. Mirrors the fictional agency and
 * quarters used in output/sources/e3f9bd082a62856f/MOCK_2026_QAPI.txt.
 *
 * That source contains the QAPI Committee's escalations *to* the Governing
 * Body (Q1 §12 "GB Escalation Items" record GB-Q1-001; Q2 §10.4 "Governing
 * Body Escalation Items" GBE-001..005). It does not contain the Board's own
 * response. This file authors the missing decision side: the Governing
 * Body meeting that reviewed each escalation package, what it voted on,
 * what it formally acknowledged, and what it directed management to do
 * next — the record a surveyor or accreditor would expect to find in GB
 * minutes under 42 CFR 484.105 / GV-GB-001.
 *
 * Scope discipline:
 *  - Q1 and Q2 keep each quarter's own operational leadership names exactly
 *    as they appear in that quarter's slice of the mock (Q1: Santos / Reeves
 *    / Holden / Kim; Q2: Nakamura / Morales / Lee). The two quarters' staff
 *    numbering is independently generated mock data — do not reconcile or
 *    cross-contaminate them (see qapi-quarter-segmentation memory note).
 *  - The five voting Board members are NOT sourced from the mock (the QAPI
 *    file never names a Governing Body roster — that gap is what this file
 *    fills) and are kept stable across both quarters, which is the more
 *    realistic choice: a community Board does not turn over between one
 *    quarterly meeting and the next the way a synthetic staff roster might.
 *  - Every motion/directive is tied to a real escalation id from the source
 *    (GB-Q1-001 for all four Q1 items; GBE-001..005 for Q2) and, where
 *    useful, to the underlying record ids (AE-, COMP-, PIP-TRIG-, CAP- …)
 *    for traceability back to MOCK_2026_QAPI.txt.
 *  - Individual disciplinary/personnel outcomes are treated as management's
 *    operational authority, not the Board's to adjudicate — consistent with
 *    this app's own GB-001/GB-002 doctrine ("retain accountability; do not
 *    confuse expertise with authority"). Where the source ties an
 *    escalation to a named clinician's discipline (e.g. DISC-TRIG-Q1-005),
 *    the Board acknowledges and directs closure/reporting, it does not vote
 *    the personnel action itself.
 *
 * Not yet wired into any screen — data authoring only.
 */

export type GbQuarterCode = 'Q1' | 'Q2';

export interface GbAttendanceRecord {
  /** Full name as it would appear in the minutes. */
  name: string;
  /** Board or staff role/title shown in the minutes. */
  role: string;
  /** True for seated voting Board members; false for staff who attend/present but do not vote. */
  votingMember: boolean;
  present: boolean;
  /** Set when a present member joined by videoconference rather than in person. */
  remote?: boolean;
  /** Set when an absent voting member's absence was formally excused. */
  excused?: boolean;
}

export interface GbQuorumRecord {
  votingSeatsFilled: number;
  votingMembersPresent: number;
  requiredForQuorum: number;
  met: boolean;
  confirmedBy: string;
  confirmedAtLocalTime: string;
  statement: string;
}

export interface GbMotion {
  id: string;
  /** The QAPI→GB escalation record this motion answers (e.g. 'GB-Q1-001', 'GBE-002'). */
  escalationId: string;
  /** Underlying source record ids for traceability (AE-, COMP-, PIP-TRIG-, CAP-, RCA-, DISC-TRIG- …). */
  sourceRecordIds: string[];
  /** Short human-readable label for the motion. */
  subject: string;
  /** The formal "Moved that…" text as it would read in the minutes. */
  motionText: string;
  mover: string;
  second: string;
  /** e.g. 'Approved 5-0', 'Approved 4-0', 'Approved 4-0-1 (one abstention)'. */
  vote: string;
  /** Plain-language description of what the passed motion actually changes. */
  outcome: string;
  /** Directive ids created as a direct result of this motion, for cross-reference. */
  relatedDirectiveIds: string[];
}

export interface GbAcknowledgment {
  id: string;
  escalationId?: string;
  statement: string;
}

export interface GbDirective {
  id: string;
  escalationId: string;
  directive: string;
  owner: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Closed';
  /** Optional note distinguishing a notification-acknowledgment from a corrective-action mandate. */
  note?: string;
}

export interface GbMinutesSignOff {
  role: string;
  name: string;
  signedDate?: string;
}

export interface GbMinutesStatus {
  status: 'Draft' | 'Pending Approval' | 'Approved';
  draftedBy: string;
  draftDueDate: string;
  /** Date of the subsequent GB meeting at which these minutes were (or are scheduled to be) approved. */
  approvedAtMeetingDate?: string;
  signOff: GbMinutesSignOff[];
  note: string;
}

export interface GbMeetingRecord {
  date: string;
  type: string;
  location: string;
  calledToOrderTime: string;
  calledToOrderBy: string;
  /** The QAPI Committee meeting this GB meeting is reviewing the output of. */
  relatedQapiMeetingDate: string;
  /** Escalation record id(s) this GB meeting is responding to. */
  relatedQapiEscalationRecordIds: string[];
  /** "Governing Body Package Deadline" from the source — when the Board received its pre-read package. */
  packageReceivedDate: string;
  remoteParticipants?: string[];
}

export interface GbQuarterDecisionRecord {
  quarter: GbQuarterCode;
  year: number;
  agency: string;
  gbMeeting: GbMeetingRecord;
  attendance: GbAttendanceRecord[];
  quorum: GbQuorumRecord;
  motions: GbMotion[];
  acknowledgments: GbAcknowledgment[];
  directives: GbDirective[];
  minutesStatus: GbMinutesStatus;
}

const AGENCY = 'Sunrise Valley Home Health Agency (SVHHA)';

// The five voting Board members are stable across quarters (see file banner).
// Names are chosen to be visibly distinct from any Q1/Q2 clinician or patient
// name in MOCK_2026_QAPI.txt so the two record sets are never confused.
const BOARD_CHAIR = 'Eleanor Whitfield, MBA';
const BOARD_VICE_CHAIR = 'Anthony Castellano, MD';
const BOARD_SECRETARY = 'Linda Marsh, RN, MSN';
const BOARD_TREASURER = 'Frank Pemberton';
const BOARD_MEMBER_AT_LARGE = 'Renata Alvarez, JD';

// ---------------------------------------------------------------------------
// Q1 2026
// ---------------------------------------------------------------------------

const Q1_ATTENDANCE: GbAttendanceRecord[] = [
  { name: BOARD_CHAIR, role: 'Board Chair', votingMember: true, present: true },
  { name: BOARD_VICE_CHAIR, role: 'Vice Chair / Physician Member', votingMember: true, present: true },
  { name: BOARD_SECRETARY, role: 'Board Secretary', votingMember: true, present: true },
  { name: BOARD_TREASURER, role: 'Treasurer / Community Member', votingMember: true, present: true },
  { name: BOARD_MEMBER_AT_LARGE, role: 'Member at Large', votingMember: true, present: true },
  { name: 'Maria L. Santos, RN, MSN', role: 'Administrator (ex officio, non-voting)', votingMember: false, present: true },
  { name: 'James T. Reeves, RN', role: 'Clinical Manager (presenter, non-voting)', votingMember: false, present: true },
  { name: 'Patricia G. Holden, PT', role: 'QAPI Committee Chair (presenter, non-voting)', votingMember: false, present: true },
  { name: 'David R. Kim, JD', role: 'Compliance Officer (presenter, non-voting)', votingMember: false, present: true },
];

const Q1_QUORUM: GbQuorumRecord = {
  votingSeatsFilled: 5,
  votingMembersPresent: 5,
  requiredForQuorum: 3,
  met: true,
  confirmedBy: BOARD_CHAIR,
  confirmedAtLocalTime: '9:02 AM',
  statement: '5 of 5 voting seats present; quorum (majority of seated voting members) confirmed at 9:02 AM.',
};

const Q1_MOTIONS: GbMotion[] = [
  {
    id: 'GB-Q1-MOT-001',
    escalationId: 'GB-Q1-001',
    sourceRecordIds: ['AE-Q1-004', 'RCA-Q1-003', 'DISC-TRIG-Q1-005', 'INF-Q1-005', 'CAP-Q1-003'],
    subject: 'Sepsis hospitalization — unescalated infection signs (AE-Q1-004)',
    motionText:
      'Moved that the Board direct management to complete RCA-Q1-003 to formal closure with documented findings, confirm execution of CAP-Q1-003 (wound/infection escalation-chain in-service for all field clinicians), and report both the root-cause findings and the resolution of the associated disciplinary hold to the Board.',
    mover: BOARD_VICE_CHAIR,
    second: BOARD_SECRETARY,
    vote: 'Approved 5-0',
    outcome:
      'Motion carries. The Board records this as a patient-safety-critical escalation-chain failure requiring closure confirmation, not a routine quality variance; the disciplinary outcome itself remains a management/HR determination.',
    relatedDirectiveIds: ['GB-Q1-DIR-001'],
  },
  {
    id: 'GB-Q1-MOT-002',
    escalationId: 'GB-Q1-001',
    sourceRecordIds: ['COMP-Q1-005', 'PIP-TRIG-Q1-007'],
    subject: 'Interpreter not arranged despite request — 12-day resolution (COMP-Q1-005)',
    motionText:
      'Moved that the Board direct management to implement a documented language-access/interpreter-request protocol with a defined turnaround target and to charter a corrective action plan under PIP-TRIG-Q1-007 addressing the interpreter-access gap specifically, reporting implementation status at the next regular meeting.',
    mover: BOARD_MEMBER_AT_LARGE,
    second: BOARD_TREASURER,
    vote: 'Approved 5-0',
    outcome:
      'Motion carries. The Board treats a 12-day delay against the 5-day complaint-resolution target as a critical communication-access failure warranting its own corrective action plan, separate from the general complaint-resolution PIP.',
    relatedDirectiveIds: ['GB-Q1-DIR-002'],
  },
  {
    id: 'GB-Q1-MOT-003',
    escalationId: 'GB-Q1-001',
    sourceRecordIds: ['PIP-TRIG-Q1-001', 'PIP-Q1-001', 'CAP-Q1-001'],
    subject: 'OASIS accuracy below threshold, 3 consecutive months (PIP-TRIG-Q1-001)',
    motionText:
      'Moved that the Board ratify PIP-Q1-001 and adopt CAP-Q1-001 (mandatory M/GG-item re-training plus weekly supervisor co-review) as the Board-directed corrective action, and require monthly OASIS-accuracy trend reporting to the Board until the rate sustains at or above 90% for two consecutive months.',
    mover: BOARD_SECRETARY,
    second: BOARD_MEMBER_AT_LARGE,
    vote: 'Approved 5-0',
    outcome:
      'Motion carries. Rate was 82.2% (Jan), 83.7% (Feb), 84.2% (Mar) against a ≥90% threshold; the Board adds a standing monthly reporting requirement on top of the QAPI Committee’s existing PIP.',
    relatedDirectiveIds: ['GB-Q1-DIR-003'],
  },
  {
    id: 'GB-Q1-MOT-004',
    escalationId: 'GB-Q1-001',
    sourceRecordIds: ['PIP-TRIG-Q1-008', 'CAP-Q1-005'],
    subject: 'Documentation-to-claim mismatch and self-identified overpayment (PIP-TRIG-Q1-008)',
    motionText:
      'Moved that the Board ratify the voluntary refund of the $1,200 identified overpayment already initiated by management, direct completion of CAP-Q1-005 (LVN/RN visit-type documentation-to-billing alignment retraining), and require written confirmation to the Board once the refund is remitted and the mismatch rate returns to zero for two consecutive audit cycles.',
    mover: BOARD_TREASURER,
    second: BOARD_VICE_CHAIR,
    vote: 'Approved 5-0',
    outcome:
      'Motion carries. The Board treats prompt voluntary self-disclosure and refund as a favorable compliance signal while still requiring documented closure of the underlying documentation-to-billing gap.',
    relatedDirectiveIds: ['GB-Q1-DIR-004'],
  },
];

const Q1_ACKNOWLEDGMENTS: GbAcknowledgment[] = [
  {
    id: 'GB-Q1-ACK-000',
    escalationId: 'GB-Q1-001',
    statement:
      'The Board received and reviewed the Q1 2026 QAPI Committee Quarterly Report and escalation package (record GB-Q1-001), presented by the QAPI Committee Chair, Clinical Manager, and Administrator, in advance of this meeting per the Governing Body package deadline of 2026-04-02.',
  },
  {
    id: 'GB-Q1-ACK-001',
    escalationId: 'GB-Q1-001',
    statement:
      'The Board acknowledges receipt of RCA-Q1-003 in its current in-progress state and notes that management has already placed the involved clinician (MOCK-CLIN-0004) on a disciplinary hold with immediate retraining and supervision pending investigation completion.',
  },
  {
    id: 'GB-Q1-ACK-002',
    escalationId: 'GB-Q1-001',
    statement:
      'The Board acknowledges that complaint COMP-Q1-005 (interpreter services not arranged despite request) was resolved prior to this meeting, but that the 12-day resolution time against a 5-day target constitutes a critical language-access failure and is one of three complaints driving PIP-TRIG-Q1-007.',
  },
  {
    id: 'GB-Q1-ACK-003',
    escalationId: 'GB-Q1-001',
    statement:
      'The Board acknowledges the QAPI Committee’s PIP-Q1-001 charter for OASIS accuracy (82.2%–84.2% against a ≥90% threshold across January–March 2026) and the associated CAP-Q1-001 corrective plan already in motion.',
  },
  {
    id: 'GB-Q1-ACK-004',
    escalationId: 'GB-Q1-001',
    statement:
      'The Board acknowledges the $1,200 self-identified overpayment across 6 mismatched claim lines and that management initiated a voluntary refund before this meeting, consistent with the agency’s compliance program.',
  },
];

const Q1_DIRECTIVES: GbDirective[] = [
  {
    id: 'GB-Q1-DIR-001',
    escalationId: 'GB-Q1-001',
    directive:
      'Close RCA-Q1-003 with documented root-cause findings; confirm CAP-Q1-003 (wound/infection escalation-chain in-service, owner Felicia Monroe, RN — Infection Control Coordinator) is fully executed; report the disciplinary hold’s resolution for MOCK-CLIN-0004 to the Board.',
    owner: 'James T. Reeves, RN — Clinical Manager',
    dueDate: '2026-04-30',
    status: 'Open',
  },
  {
    id: 'GB-Q1-DIR-002',
    escalationId: 'GB-Q1-001',
    directive:
      'Implement a documented interpreter/language-access request protocol with a defined scheduling turnaround target; charter and execute a corrective action plan for PIP-TRIG-Q1-007 covering the interpreter-access gap; report implementation status and complaint-resolution timeliness trend to the Board.',
    owner: 'James T. Reeves, RN — Clinical Manager',
    dueDate: '2026-05-15',
    status: 'Open',
  },
  {
    id: 'GB-Q1-DIR-003',
    escalationId: 'GB-Q1-001',
    directive:
      'Execute CAP-Q1-001 (OASIS M/GG-item re-training and weekly supervisor co-review); report OASIS-accuracy trend to the Board monthly until the rate sustains at or above 90% for two consecutive months.',
    owner: 'James T. Reeves, RN — Clinical Manager',
    dueDate: '2026-05-09',
    status: 'Open',
  },
  {
    id: 'GB-Q1-DIR-004',
    escalationId: 'GB-Q1-001',
    directive:
      'Complete CAP-Q1-005 billing-alignment retraining for LVN/RN visit-type documentation; provide the Board written confirmation that the $1,200 voluntary overpayment refund has been remitted and that the documentation-to-claim mismatch rate has returned to zero for two consecutive audit cycles.',
    owner: 'David R. Kim, JD — Compliance Officer',
    dueDate: '2026-04-30',
    status: 'Open',
  },
];

const Q1_MINUTES_STATUS: GbMinutesStatus = {
  status: 'Approved',
  draftedBy: 'Linda Marsh, RN, MSN — Board Secretary',
  draftDueDate: '2026-04-23',
  approvedAtMeetingDate: '2026-07-17',
  signOff: [
    { role: 'Board Chair', name: BOARD_CHAIR, signedDate: '2026-07-17' },
    { role: 'Board Secretary', name: BOARD_SECRETARY, signedDate: '2026-07-17' },
  ],
  note: 'Approved without amendment as the first order of business at the 2026-07-17 regular meeting.',
};

export const GB_DECISIONS_Q1: GbQuarterDecisionRecord = {
  quarter: 'Q1',
  year: 2026,
  agency: AGENCY,
  gbMeeting: {
    date: '2026-04-16',
    type: 'Regular quarterly meeting',
    location: 'SVHHA Administrative Offices — Board Conference Room',
    calledToOrderTime: '9:00 AM',
    calledToOrderBy: BOARD_CHAIR,
    relatedQapiMeetingDate: '2026-04-09',
    relatedQapiEscalationRecordIds: ['GB-Q1-001'],
    packageReceivedDate: '2026-04-02',
  },
  attendance: Q1_ATTENDANCE,
  quorum: Q1_QUORUM,
  motions: Q1_MOTIONS,
  acknowledgments: Q1_ACKNOWLEDGMENTS,
  directives: Q1_DIRECTIVES,
  minutesStatus: Q1_MINUTES_STATUS,
};

// ---------------------------------------------------------------------------
// Q2 2026
// ---------------------------------------------------------------------------

const Q2_ATTENDANCE: GbAttendanceRecord[] = [
  { name: BOARD_CHAIR, role: 'Board Chair', votingMember: true, present: true },
  { name: BOARD_VICE_CHAIR, role: 'Vice Chair / Physician Member', votingMember: true, present: true, remote: true },
  { name: BOARD_SECRETARY, role: 'Board Secretary', votingMember: true, present: true },
  { name: BOARD_TREASURER, role: 'Treasurer / Community Member', votingMember: true, present: false, excused: true },
  { name: BOARD_MEMBER_AT_LARGE, role: 'Member at Large', votingMember: true, present: true },
  { name: 'Edward Nakamura', role: 'Administrator (ex officio, non-voting)', votingMember: false, present: true },
  { name: 'Angela Morales', role: 'Clinical Manager / DON (presenter, non-voting)', votingMember: false, present: true },
  { name: 'Christine Lee', role: 'QAPI Committee Chair / Compliance Officer (presenter, non-voting)', votingMember: false, present: true },
];

const Q2_QUORUM: GbQuorumRecord = {
  votingSeatsFilled: 5,
  votingMembersPresent: 4,
  requiredForQuorum: 3,
  met: true,
  confirmedBy: BOARD_CHAIR,
  confirmedAtLocalTime: '9:05 AM',
  statement:
    '4 of 5 voting seats present (Treasurer Frank Pemberton excused); quorum (majority of seated voting members) confirmed at 9:05 AM.',
};

const Q2_MOTIONS: GbMotion[] = [
  {
    id: 'GB-Q2-MOT-001',
    escalationId: 'GBE-001',
    sourceRecordIds: ['QM-APR-002', 'QM-MAY-002', 'QM-JUN-002', 'MOCK-PIP-T-001', 'CAP-001'],
    subject: 'OASIS accuracy below threshold, 3rd consecutive month (GBE-001)',
    motionText:
      'Moved that the Board direct enhanced intervention beyond the existing CAP-001: engagement of a qualified external OASIS-accuracy reviewer for a focused M/GG scoring audit and an increase in supervisor co-review cadence from monthly to bi-weekly, with monthly trend reporting to the Board until the rate sustains at or above 90% for two consecutive months.',
    mover: BOARD_VICE_CHAIR,
    second: BOARD_MEMBER_AT_LARGE,
    vote: 'Approved 4-0',
    outcome:
      'Motion carries. OASIS accuracy has now been below threshold for six straight months across two quarters (84.8% Apr, 82.0% May, 84.1% Jun); the Board treats CAP-001 alone as insufficient and adds an external-review requirement ahead of CAP-001’s existing 2026-09-30 target date.',
    relatedDirectiveIds: ['GB-Q2-DIR-001'],
  },
  {
    id: 'GB-Q2-MOT-002',
    escalationId: 'GBE-002',
    sourceRecordIds: ['QM-APR-005', 'QM-MAY-005', 'QM-JUN-005', 'MOCK-AE-006', 'MOCK-PIP-T-004'],
    subject: 'Medication reconciliation below threshold, worsening trend, linked adverse event (GBE-002)',
    motionText:
      'Moved that the Board direct a formal PIP charter for medication reconciliation at SOC/ROC be executed within 14 days of this meeting, with root-cause analysis of its link to adverse drug event MOCK-AE-006 and interim compliance reporting to the Board at 30 and 60 days.',
    mover: BOARD_SECRETARY,
    second: BOARD_CHAIR,
    vote: 'Approved 4-0',
    outcome:
      'Motion carries. Rate worsened each month of Q2 (77.8% Apr, 73.3% May, 70.6% Jun against ≥95%) and is directly linked to a patient adverse drug event, which the Board treats as requiring a hard 14-day charter deadline rather than routine PIP timing.',
    relatedDirectiveIds: ['GB-Q2-DIR-002'],
  },
  {
    id: 'GB-Q2-MOT-003',
    escalationId: 'GBE-003',
    sourceRecordIds: ['QM-APR-006', 'QM-MAY-006', 'QM-JUN-006', 'MOCK-AUD-CL-008', 'MOCK-PIP-T-005', 'CAP-004'],
    subject: 'Missed visit rate, worsening trend (GBE-003)',
    motionText:
      'Moved that the Board direct execution of CAP-004 with monthly — not quarterly — reporting of the missed-visit rate and physician-notification compliance to the Board until the rate sustains at or below 3.0% for two consecutive months.',
    mover: BOARD_MEMBER_AT_LARGE,
    second: BOARD_SECRETARY,
    vote: 'Approved 4-0',
    outcome:
      'Motion carries. 106 missed visits in Q2 (3.7% quarterly rate, worsening from 3.2% in April to 4.5% in June) with 44 cases lacking timely MD notification; the Board sets a monthly reporting cadence in place of the standard quarterly QAPI cycle until resolved.',
    relatedDirectiveIds: ['GB-Q2-DIR-003'],
  },
  {
    id: 'GB-Q2-MOT-004',
    escalationId: 'GBE-004',
    sourceRecordIds: ['QM-APR-007', 'QM-MAY-007', 'QM-JUN-007'],
    subject: 'Discharge documentation completeness, deteriorating trend (GBE-004)',
    motionText:
      'Moved that the Board direct the Clinical Manager to conduct a full discharge-documentation process redesign review — workflow, EHR template, and discharge checklist — and present findings with a corrective action plan and target compliance date to the Board.',
    mover: BOARD_CHAIR,
    second: BOARD_VICE_CHAIR,
    vote: 'Approved 4-0',
    outcome:
      'Motion carries. Compliance fell from 78.6% (Apr) to 62.5% (May) to 61.5% (Jun) against a ≥90% target — the sharpest deterioration of any Q2 indicator and the only one with no corrective action plan already in place — so the Board directs a structural redesign review rather than an incremental retraining CAP.',
    relatedDirectiveIds: ['GB-Q2-DIR-004'],
  },
  {
    id: 'GB-Q2-MOT-005',
    escalationId: 'GBE-005',
    sourceRecordIds: ['MOCK-DT-001', 'MOCK-DT-002', 'MOCK-DT-003', 'MOCK-DT-004', 'MOCK-DT-005'],
    subject: 'Five disciplinary review triggers, Q2 2026 (GBE-005)',
    motionText:
      'Moved that the Board receive and file the Compliance Officer’s summary of five Q2 disciplinary review triggers into the record per GV-GB-001 §6.2.4, and request an aggregate — not individually identifying — status confirmation once HR review of all five is complete, with any trigger resulting in termination, licensure referral, or a repeat patient-safety finding to be escalated to the Board immediately.',
    mover: BOARD_SECRETARY,
    second: BOARD_MEMBER_AT_LARGE,
    vote: 'Approved 4-0',
    outcome:
      'Motion carries. The Board treats this as a notification item under its oversight duty, not a personnel-adjudication item; individual disciplinary outcomes remain management/HR authority consistent with GV-GB-001.',
    relatedDirectiveIds: ['GB-Q2-DIR-005'],
  },
];

const Q2_ACKNOWLEDGMENTS: GbAcknowledgment[] = [
  {
    id: 'GB-Q2-ACK-000',
    statement:
      'The Board received and reviewed the Q2 2026 QAPI Committee Quarterly Report and escalation package (records GBE-001 through GBE-005), presented by the QAPI Committee Chair/Compliance Officer, Clinical Manager, and Administrator, in advance of this meeting per the Governing Body package deadline of 2026-07-03.',
  },
  {
    id: 'GB-Q2-ACK-001',
    escalationId: 'GBE-001',
    statement:
      'The Board acknowledges OASIS accuracy has remained below the 90% threshold for three consecutive months in Q2 (84.8% Apr, 82.0% May, 84.1% Jun), continuing a shortfall first escalated in Q1 despite CAP-Q1-001.',
  },
  {
    id: 'GB-Q2-ACK-002',
    escalationId: 'GBE-002',
    statement:
      'The Board acknowledges medication reconciliation at SOC/ROC fell every month of Q2 (77.8% to 73.3% to 70.6% against ≥95%) and is directly linked to adverse drug event MOCK-AE-006.',
  },
  {
    id: 'GB-Q2-ACK-003',
    escalationId: 'GBE-003',
    statement:
      'The Board acknowledges 106 missed visits in Q2 (3.7% of 2,847 ordered visits), with 44 not timely reported to the physician, and a worsening month-over-month trend.',
  },
  {
    id: 'GB-Q2-ACK-004',
    escalationId: 'GBE-004',
    statement:
      'The Board acknowledges discharge documentation completeness deteriorated from 78.6% to 61.5% across Q2 against a ≥90% target, with no corrective action plan yet in place.',
  },
  {
    id: 'GB-Q2-ACK-005',
    escalationId: 'GBE-005',
    statement:
      'The Board acknowledges notification, per GV-GB-001 §6.2.4, that five disciplinary review triggers (MOCK-DT-001 through MOCK-DT-005) were identified in Q2 2026 and are pending HR review, and that no further Board action is required absent a subsequent adverse finding.',
  },
  {
    id: 'GB-Q2-ACK-006',
    statement:
      'The Board acknowledges management’s follow-up on Q1 Board directives: the Q1 documentation-timeliness PIP shows partial improvement (78% to 86% against a 95% goal, continuing into Q3) and the post-discharge complaint-response call log directed in Q1 is now active and operating.',
  },
];

const Q2_DIRECTIVES: GbDirective[] = [
  {
    id: 'GB-Q2-DIR-001',
    escalationId: 'GBE-001',
    directive:
      'Engage a qualified external OASIS-accuracy reviewer for a focused audit of M/GG item scoring; increase supervisor co-review cadence to bi-weekly; report the accuracy trend to the Board monthly. CAP-001’s existing full-closure target of 2026-09-30 remains in effect.',
    owner: 'Christine Lee — QAPI Committee Chair / Compliance Officer',
    dueDate: '2026-08-14',
    status: 'Open',
  },
  {
    id: 'GB-Q2-DIR-002',
    escalationId: 'GBE-002',
    directive:
      'Execute a formal PIP charter for medication reconciliation at SOC/ROC; complete root-cause analysis of the link to MOCK-AE-006; report interim compliance rate to the Board at the 30- and 60-day marks.',
    owner: 'Angela Morales — Clinical Manager / DON',
    dueDate: '2026-07-31',
    status: 'Open',
    note: 'Due date reflects the Board’s "within 14 days" directive from GBE-005 (calendar 2026-07-17 + 14 days).',
  },
  {
    id: 'GB-Q2-DIR-003',
    escalationId: 'GBE-003',
    directive:
      'Complete CAP-004 (scheduling-system MD-notification workflow, field-staff re-training, weekly supervisor report); provide the Board a monthly missed-visit-rate and notification-compliance report beginning August 2026 until the rate sustains at or below 3.0% for two consecutive months.',
    owner: 'Donna Reid — Scheduler/Intake (CAP-004 owner)',
    dueDate: '2026-08-15',
    status: 'Open',
  },
  {
    id: 'GB-Q2-DIR-004',
    escalationId: 'GBE-004',
    directive:
      'Conduct a full discharge-documentation process redesign review (workflow, EHR template, discharge checklist); present findings and a corrective action plan with a target compliance date to the Board.',
    owner: 'Angela Morales — Clinical Manager / DON',
    dueDate: '2026-08-31',
    status: 'Open',
  },
  {
    id: 'GB-Q2-DIR-005',
    escalationId: 'GBE-005',
    directive:
      'Provide the Board an aggregate confirmation, without individually identifying personnel, once HR review of all five Q2 disciplinary review triggers (MOCK-DT-001 through MOCK-DT-005) is complete; escalate immediately to the Board any trigger resulting in termination, licensure referral, or a repeat patient-safety finding.',
    owner: 'Christine Lee — QAPI Committee Chair / Compliance Officer',
    dueDate: '2026-08-31',
    status: 'Open',
    note: 'Notification-acknowledgment item under GV-GB-001 §6.2.4, not a corrective-action mandate — the Board is not directing individual disciplinary outcomes.',
  },
];

const Q2_MINUTES_STATUS: GbMinutesStatus = {
  status: 'Draft',
  draftedBy: 'Linda Marsh, RN, MSN — Board Secretary',
  draftDueDate: '2026-07-24',
  signOff: [],
  note: 'Draft circulating for Board review; scheduled for approval as the first order of business at the next regular meeting (Q3, on or around 2026-10-15).',
};

export const GB_DECISIONS_Q2: GbQuarterDecisionRecord = {
  quarter: 'Q2',
  year: 2026,
  agency: AGENCY,
  gbMeeting: {
    date: '2026-07-17',
    type: 'Regular quarterly meeting',
    location: 'SVHHA Administrative Offices — Board Conference Room',
    calledToOrderTime: '9:05 AM',
    calledToOrderBy: BOARD_CHAIR,
    relatedQapiMeetingDate: '2026-07-10',
    relatedQapiEscalationRecordIds: ['GBE-001', 'GBE-002', 'GBE-003', 'GBE-004', 'GBE-005'],
    packageReceivedDate: '2026-07-03',
    remoteParticipants: ['Anthony Castellano, MD (videoconference, real-time two-way audio/video per bylaws)'],
  },
  attendance: Q2_ATTENDANCE,
  quorum: Q2_QUORUM,
  motions: Q2_MOTIONS,
  acknowledgments: Q2_ACKNOWLEDGMENTS,
  directives: Q2_DIRECTIVES,
  minutesStatus: Q2_MINUTES_STATUS,
};

// ---------------------------------------------------------------------------
// Convenience exports
// ---------------------------------------------------------------------------

export const GB_DECISIONS_BY_QUARTER: Record<GbQuarterCode, GbQuarterDecisionRecord> = {
  Q1: GB_DECISIONS_Q1,
  Q2: GB_DECISIONS_Q2,
};

export const GB_DECISIONS_LIST: GbQuarterDecisionRecord[] = [GB_DECISIONS_Q1, GB_DECISIONS_Q2];

export function getGbDecisionsForQuarter(quarter: GbQuarterCode): GbQuarterDecisionRecord {
  return GB_DECISIONS_BY_QUARTER[quarter];
}
