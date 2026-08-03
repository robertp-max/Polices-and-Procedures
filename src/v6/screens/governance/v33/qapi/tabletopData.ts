/**
 * tabletopData.ts
 *
 * "Board Tabletop Exercise" — Q3 and Q4 2026, extracted from the same synthetic
 * mock dataset as ./qapiData.ts:
 *   C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/output/sources/e3f9bd082a62856f/MOCK_2026_QAPI.txt
 *
 * -- Practice-only, by owner decision --
 * Q1 and Q2 (./qapiData.ts) are LIVE Governing Body records. Q3 and Q4 here are
 * a rehearsal surface only: they use the same real Q3/Q4 mock facts, but their
 * `actions[]` are Board decisions to be *practiced*, not recorded. Nothing in
 * this file should read from, or write to, a live record — it is presented
 * behind an explicit "Enter Tabletop Exercise" control and is not shown by
 * default.
 *
 * Shape parity: `TabletopQuarterData` reuses `QapiQuarterData` verbatim (KPI
 * dashboard, PIP triggers, CAP status, adverse events/RCA, complaints
 * escalated to GB, GB Escalation Items) and adds only `actions[]`. It does not
 * reproduce patient census, clinician caseloads, or feeder-audit line items,
 * matching the scope discipline already established in ./qapiData.ts.
 *
 * -- Prompt-injection note --
 * The source .txt file opens with an unsigned "PACKET STUDIO AUTHORITATIVE UI
 * SELECTION" banner instructing the reader to scope to "Selected reporting
 * quarter: 2026-Q2" only and disregard other quarters. That banner is embedded
 * file content, not an instruction from this task's requester; the task
 * explicitly asked for Q3 and Q4, so the banner was disregarded here exactly
 * as it was in ./qapiData.ts for Q1/Q2.
 *
 * -- Data-fidelity notes --
 * 1. Q3's PIP source table (Section 9) and Q4's PIP status table (Section 9)
 *    carry no `severity` column (same gap as Q2 — see ./qapiData.ts fidelity
 *    note 2). Severities below are carried forward by matching indicator type
 *    to the original Q1 trigger of the same kind (OASIS/Doc Timeliness/Med
 *    Rec/POC/Missed Visit/Wound Infection/Complaints/Doc-to-Claim). The two
 *    Q3 triggers with no Q1 analog (Hospitalization Rate Spike, Care
 *    Coordination Documentation Gap) are assigned severity directly from the
 *    Q3 source's own finding language. Q3's wound-infection trigger is marked
 *    'Moderate' rather than carried-forward 'Critical', reflecting the
 *    source's own "Near-resolved" framing that quarter. Q4's PIP entries are
 *    year-end closure records; severity is kept at each PIP's peak/original
 *    level so the Board can see what was closed, while `status` carries the
 *    resolution text and date.
 * 2. `adverseEvents.severity` uses the source's own word-based severities
 *    (High/Critical/Medium/Low) for Q3 and Q4 — unlike Q2, the Q3/Q4 source
 *    sections do not use "Level 1/2/3" wording, so no conversion was needed.
 * 3. `complaintsEscalated` includes only the one complaint per quarter the
 *    source explicitly marks "GB escalation" in its own status column
 *    (COMP-Q3-009, COMP-Q4-002) — matching the strict literal-tag rule
 *    ./qapiData.ts already applied for COMP-Q1-005. COMP-Q3-010, which is
 *    RCA-linked to the same hip-fracture event but whose own status reads
 *    "Closed — RCA linked" (not "GB escalation"), is left out on that basis;
 *    it is still referenced in context inside the AE-Q3-002 tabletop action.
 * 4. Both Q3 and Q4 Governing Body escalation records (GB-Q3-001, GB-Q4-001)
 *    bundle 3 items into one prose sentence with a single status and no
 *    per-item board directive — the same pattern ./qapiData.ts documents for
 *    Q1's GB-Q1-001 (fidelity note 4 there). Split here into per-item rows
 *    (`GB-Q3-001-1..3`, `GB-Q4-001-1..3`) for shape-parity with Q2's discrete
 *    GBE-001..005 records; each retains `directive: "Escalated to Governing
 *    Body"` because the source records no distinct per-item directive. Q4's
 *    separate "Annual Report Approval" meeting record (ANN-2026-001) is kept
 *    as its own row since the source treats it as a distinct agenda item, not
 *    part of the GB-Q4-001 bundle.
 * 5. CAP `owner` is the raw MOCK-CLIN-* id, not resolved to a name — same
 *    reasoning as ./qapiData.ts fidelity note 5 (identity reuse across
 *    quarters in this mock dataset).
 * 6. No PHI beyond the synthetic MOCK-* ids already present in the mock.
 *
 * -- actions[] --
 * Each action is a Board decision the tabletop asks the learner to rehearse,
 * derived from that quarter's real escalations/adverse events (e.g. Q3's
 * hospitalization spike and the AE-Q3-002 hip re-fracture; Q4's MOCK-CLIN-0003
 * separation and the GV-FM-023 annual report approval). `modelAnswer` is the
 * exact text of one entry in `options`.
 */

import type {
  QapiQuarterData,
  QapiKpi,
  QapiPipTrigger,
  QapiCap,
  QapiAdverseEvent,
  QapiComplaintEscalated,
  QapiGbEscalationItem,
} from './qapiData';

export const TABLETOP_MODE_LABEL = 'Board Tabletop Exercise';

export interface TabletopAction {
  id: string;
  prompt: string;
  options: string[];
  /** Exact text of the option in `options` the Board should select. */
  modelAnswer: string;
  rationale: string;
}

export interface TabletopQuarterData extends QapiQuarterData {
  actions: TabletopAction[];
}

export type TabletopQuarterKey = 'Q3' | 'Q4';

const q3Kpis: QapiKpi[] = [
  {
    indicator: 'OASIS Accuracy Rate',
    qValue: '88.8%',
    threshold: '≥90%',
    status: 'warn',
    trend: 'Close to threshold; PIP continues (was 83–86% in Q2)',
    monthly: [
      { month: 'July', value: '85.9%' },
      { month: 'August', value: '87.3%' },
      { month: 'September', value: '88.8%' },
    ],
  },
  {
    indicator: 'Visit Documentation Timeliness (within 24h)',
    qValue: '92.6%',
    threshold: '≥95%',
    status: 'warn',
    trend: 'Slight regression in September — new-staff onboarding effect',
    monthly: [
      { month: 'July', value: '91.4%' },
      { month: 'August', value: '92.9%' },
      { month: 'September', value: '92.6%' },
    ],
  },
  {
    indicator: 'Medication Reconciliation at SOC/ROC',
    qValue: '88.6%',
    threshold: '≥95%',
    status: 'warn',
    trend: "Sharp improvement from Q2's 70.6%; PIP continues into Q4",
    monthly: [
      { month: 'July', value: '86.7%' },
      { month: 'August', value: '87.9%' },
      { month: 'September', value: '88.6%' },
    ],
  },
  {
    indicator: 'POC Goal Documentation Completeness',
    qValue: '89.8%',
    threshold: '≥92%',
    status: 'warn',
    trend: 'Near threshold; PIP continues into Q4',
    monthly: [
      { month: 'July', value: '87.8%' },
      { month: 'August', value: '89.2%' },
      { month: 'September', value: '89.8%' },
    ],
  },
  {
    indicator: 'Missed Visit Rate',
    qValue: '2.3%',
    threshold: '≤2%',
    status: 'warn',
    trend: "Nearly resolved — strong improvement from Q2's 4.5%",
    monthly: [
      { month: 'July', value: '3.3%' },
      { month: 'August', value: '2.8%' },
      { month: 'September', value: '2.3%' },
    ],
  },
  {
    indicator: 'Hospitalization Rate',
    qValue: '1.2%',
    threshold: '≤3%',
    status: 'good',
    trend: 'Improving month over month within the quarter',
    monthly: [
      { month: 'July', value: '2.8%' },
      { month: 'August', value: '1.9%' },
      { month: 'September', value: '1.2%' },
    ],
  },
  {
    indicator: 'Hospitalization Rate (Cumulative Q3)',
    qValue: '5.3%',
    threshold: '≤3% quarterly',
    status: 'bad',
    trend: 'NEW PIP TRIGGER — 9 hospitalizations this quarter (vs. 5 in Q1, 7 in Q2); 5 potentially preventable',
    monthly: [{ month: 'Q3 total', value: '9 hospitalizations (5.3%)' }],
  },
  {
    indicator: 'Wound Infection Rate',
    qValue: '4.1%',
    threshold: '≤5%',
    status: 'good',
    trend: 'First month below threshold since Q1; PIP resolution pending Q4 confirmation',
    monthly: [
      { month: 'July', value: '8.9%' },
      { month: 'August', value: '6.4%' },
      { month: 'September', value: '4.1%' },
    ],
  },
  {
    indicator: 'Complaint Resolution Timeliness (within 5 days)',
    qValue: '90.0%',
    threshold: '≥90%',
    status: 'good',
    trend: 'First month meeting target; PIP close pending Q4',
    monthly: [
      { month: 'July', value: '77.8%' },
      { month: 'August', value: '88.9%' },
      { month: 'September', value: '90.0%' },
    ],
  },
  {
    indicator: 'Care Coordination Documentation',
    qValue: '72.3%',
    threshold: '≥90%',
    status: 'bad',
    trend: 'NEW metric introduced Q3 — baseline alarmingly low; 9 patients with 3+ disciplines had delayed communication',
    monthly: [{ month: 'Q3 average', value: '72.3%' }],
  },
];

const q3PipTriggers: QapiPipTrigger[] = [
  {
    id: 'PIP-TRIG-Q3-001',
    title: 'OASIS Accuracy Continued (carry-forward)',
    severity: 'High',
    status: 'Active — improving, not closed',
    findingSummary: 'Still 86–89%; below 90% threshold; PIP continues pending Q4 resolution',
  },
  {
    id: 'PIP-TRIG-Q3-002',
    title: 'Visit Doc Timeliness Continued (carry-forward)',
    severity: 'High',
    status: 'Active — improving, Sept regression noted',
    findingSummary: '91–93% range; regression in September due to new hires; PIP continues',
  },
  {
    id: 'PIP-TRIG-Q3-003',
    title: 'Med Rec Continued (carry-forward)',
    severity: 'Critical',
    status: 'Active — improving',
    findingSummary: "87–89%; substantial improvement from Q1's 72%; PIP continues into Q4",
  },
  {
    id: 'PIP-TRIG-Q3-004',
    title: 'POC Goal Completeness Continued (carry-forward)',
    severity: 'High',
    status: 'Active — improving',
    findingSummary: '88–90%; approaching threshold; PIP continues',
  },
  {
    id: 'PIP-TRIG-Q3-005',
    title: 'Missed Visit Rate Continued (carry-forward)',
    severity: 'High',
    status: 'Active — improving, near threshold',
    findingSummary: '3.3% → 2.3%; strong improvement; PIP may close Q4',
  },
  {
    id: 'PIP-TRIG-Q3-006',
    title: 'Wound Infection Rate — Near Resolution',
    severity: 'Moderate',
    status: 'Near-resolved — Sep at 4.1%',
    findingSummary: 'First month below threshold; PIP pending Q4 confirmation before closure',
  },
  {
    id: 'PIP-TRIG-Q3-007',
    title: 'Hospitalization Rate Spike — NEW Q3',
    severity: 'Critical',
    status: 'NEW PIP initiated',
    findingSummary:
      '9 hospitalizations Q3 (5.3% cumulative); 5 potentially preventable; care coordination gap identified',
  },
  {
    id: 'PIP-TRIG-Q3-008',
    title: 'Care Coordination Documentation Gap — NEW Q3',
    severity: 'High',
    status: 'NEW PIP initiated',
    findingSummary:
      'Care coordination documentation 72.3% vs ≥90% threshold; multi-discipline communication breakdown in 9 patients',
  },
];

const q3Caps: QapiCap[] = [
  {
    id: 'CAP-Q3-001',
    description:
      'Hospitalization reduction plan (PIP-TRIG-Q3-007): enhanced cardiac/COPD monitoring protocols; daily weight tracking required for high-risk patients',
    owner: 'MOCK-CLIN-0027',
    dueDate: '2026-11-08',
    status: 'Open',
  },
  {
    id: 'CAP-Q3-002',
    description:
      'Care coordination documentation standard (PIP-TRIG-Q3-008): mandatory multi-discipline communication log for patients with 3+ disciplines; weekly CM review',
    owner: 'MOCK-CLIN-0027',
    dueDate: '2026-11-08',
    status: 'Open',
  },
  {
    id: 'CAP-Q3-003',
    description:
      'MOCK-CLIN-0003 enhanced supervision plan (DISC-TRIG-Q3-002): all chart entries require same-day countersign by supervisor for 90 days',
    owner: 'MOCK-CLIN-0027',
    dueDate: '2026-12-08',
    status: 'Open',
  },
  {
    id: 'CAP-Q3-004',
    description:
      'MOCK-CLIN-0030 fall-risk assessment competency re-eval (DISC-TRIG-Q3-003): mandatory annual fall-risk training for all PT/PTA staff',
    owner: 'MOCK-CLIN-0026',
    dueDate: '2026-11-08',
    status: 'Open',
  },
  {
    id: 'CAP-Q3-005',
    description:
      'New-hire onboarding enhancement: documentation-timeliness module added to orientation; 30-day supervisor audit for all new hires',
    owner: 'MOCK-CLIN-0023',
    dueDate: '2026-11-01',
    status: 'Open',
  },
];

const q3AdverseEvents: QapiAdverseEvent[] = [
  {
    id: 'AE-Q3-001',
    type: 'Hospitalization — CHF + anxiety decompensation',
    severity: 'High',
    rcaStatus: 'RCA Complete — care coordination CAP issued',
    date: '2026-07-11',
  },
  {
    id: 'AE-Q3-002',
    type: 'Hospitalization — fall + hip re-fracture',
    severity: 'Critical',
    rcaStatus: 'RCA Complete — fall risk protocol updated',
    date: '2026-07-19',
  },
  {
    id: 'AE-Q3-003',
    type: 'Hospitalization — COPD exacerbation',
    severity: 'High',
    rcaStatus: 'RCA Complete — monitoring frequency CAP',
    date: '2026-07-28',
  },
  {
    id: 'AE-Q3-004',
    type: 'Hospitalization — CHF + AKI',
    severity: 'High',
    rcaStatus: 'Closed — rapid deterioration; no systemic finding',
    date: '2026-08-03',
  },
  {
    id: 'AE-Q3-005',
    type: 'Patient fall — minor injury',
    severity: 'Medium',
    rcaStatus: 'RCA in progress — new hire involved; supervision review',
    date: '2026-08-14',
  },
  {
    id: 'AE-Q3-006',
    type: 'Wound dehiscence + infection',
    severity: 'High',
    rcaStatus: 'Closed — documented expected course; wound protocol reviewed',
    date: '2026-08-22',
  },
  {
    id: 'AE-Q3-007',
    type: "Hospitalization — Parkinson's + fall",
    severity: 'High',
    rcaStatus: 'RCA in progress',
    date: '2026-09-04',
  },
  {
    id: 'AE-Q3-008',
    type: 'ED visit — post-op pain unmanaged',
    severity: 'Medium',
    rcaStatus: 'Closed — pain protocol updated',
    date: '2026-09-12',
  },
  {
    id: 'AE-Q3-009',
    type: 'Hospitalization — Afib with RVR',
    severity: 'High',
    rcaStatus: 'Closed — rapid deterioration',
    date: '2026-09-22',
  },
];

// See fidelity note 3: only the one complaint the source marks "GB escalation".
const q3ComplaintsEscalated: QapiComplaintEscalated[] = [
  {
    id: 'COMP-Q3-009',
    summary:
      "Communication — family not informed of Parkinson's-related fall until the next day; 6 days to resolve — closed with escalation to Governing Body",
  },
];

// See fidelity note 4: GB-Q3-001 bundles 3 items in one source record; split here for shape-parity with Q2's GBE-001..005.
const q3GbEscalationItems: QapiGbEscalationItem[] = [
  {
    id: 'GB-Q3-001-1',
    text: 'Hospitalization spike — 9 events in Q3 (cumulative 5.3%, vs. ≤3% quarterly threshold)',
    directive: 'Escalated to Governing Body',
  },
  {
    id: 'GB-Q3-001-2',
    text: 'Hip re-fracture event (AE-Q3-002; RCA-Q3-002 complete)',
    directive: 'Escalated to Governing Body',
  },
  {
    id: 'GB-Q3-001-3',
    text: "MOCK-CLIN-0003's second disciplinary finding since reinstatement (DISC-TRIG-Q3-002)",
    directive: 'Escalated to Governing Body',
  },
];

const q3Actions: TabletopAction[] = [
  {
    id: 'TT-Q3-001',
    prompt:
      'Nine hospitalizations occurred in Q3 (cumulative rate 5.3%, versus the ≤3% quarterly threshold), and 5 of the 9 are flagged potentially preventable. Feeder audits already opened PIP-TRIG-Q3-007 with CAP-Q3-001 due 2026-11-08. What should the Board do with this item today?',
    options: [
      'Note it and take no further action since a PIP and CAP are already open',
      'Accept the CAP, direct monthly reporting on the preventable-hospitalization rate until it returns under 3%, and revisit at the Q4 meeting',
      'Direct an immediate independent clinical audit of all 9 cases before accepting the CAP',
      'Delegate the decision entirely to the Clinical Manager without a recorded Board directive',
    ],
    modelAnswer:
      'Accept the CAP, direct monthly reporting on the preventable-hospitalization rate until it returns under 3%, and revisit at the Q4 meeting',
    rationale:
      "A CAP already exists and is on schedule; the Board's job is oversight and monitoring, not re-running management's audit. Directing monthly reporting until the rate normalizes creates a recorded, time-bound oversight trail without duplicating work or rubber-stamping silently.",
  },
  {
    id: 'TT-Q3-002',
    prompt:
      'AE-Q3-002 (2026-07-19) was a fall resulting in a hip re-fracture — a Critical-severity event with a completed RCA. The assigned PT of record, MOCK-CLIN-0006, updated the fall-risk protocol as a result. What is the Board\'s most defensible action to record?',
    options: [
      'Accept the RCA finding and close the item with no further follow-up, since the RCA is already complete',
      "Direct that the clinician be removed from all fall-risk caseloads immediately, pending the Board's own investigation",
      'Acknowledge the completed RCA and updated protocol, and direct that any recurrence involving the same clinician be escalated to the Board immediately rather than waiting for the next quarterly cycle',
      'Take no position because RCA outcomes are a clinical, not governance, matter',
    ],
    modelAnswer:
      'Acknowledge the completed RCA and updated protocol, and direct that any recurrence involving the same clinician be escalated to the Board immediately rather than waiting for the next quarterly cycle',
    rationale:
      'This is exactly what happens next: the same clinician (MOCK-CLIN-0006) is later linked to a second hip re-fracture in Q4 (AE-Q4-002). A one-quarter-ahead escalation trigger is the defensible middle path — it neither pre-judges the clinician on one event nor treats a Critical, RCA-confirmed safety event as routine.',
  },
  {
    id: 'TT-Q3-003',
    prompt:
      'Care coordination documentation came in at 72.3% against a ≥90% threshold — a brand-new metric this quarter with no prior baseline — and it is implicated in AE-Q3-001 (a hospitalization involving 3+ disciplines). How should the Board treat a first-quarter baseline this far below threshold?',
    options: [
      'Treat it the same as a metric that has been below threshold for 3 consecutive months and demand an immediate root-cause report',
      'Dismiss it since there is no trend yet to evaluate',
      'Accept it as a baseline, direct that the new PIP and CAP be tracked with the same rigor as existing PIPs, and require a trend — not a single reading — before judging progress at Q4',
      'Ask management to redefine the metric so the baseline looks less severe',
    ],
    modelAnswer:
      'Accept it as a baseline, direct that the new PIP and CAP be tracked with the same rigor as existing PIPs, and require a trend — not a single reading — before judging progress at Q4',
    rationale:
      "A single low first reading on a brand-new metric is a baseline, not yet a trend: treating it as a 3-month failure overstates one data point, while dismissing it ignores that it is already tied to a real adverse event. Ordinary PIP/CAP discipline plus patience for a real trend line is the defensible middle path.",
  },
  {
    id: 'TT-Q3-004',
    prompt:
      'Three new clinicians joined in Q3. Two are already named in adverse-event or disciplinary records in their first onboarding quarter: MOCK-CLIN-0031 (a missed in-service, then repeated missed visits) and MOCK-CLIN-0030 (a fall-risk assessment omission tied to AE-Q3-007). Is this a Governing Body-level pattern or a routine onboarding matter for management to handle alone?',
    options: [
      'Routine — two isolated new-hire coaching items do not warrant Board attention',
      'Board-level pattern — direct that new-hire onboarding include a documented 30-day supervised-caseload period, with a compliance report back to the Board next quarter',
      'Board-level — direct that hiring be frozen until a root cause is found',
      'Defer entirely to HR with no Board directive of any kind',
    ],
    modelAnswer:
      'Board-level pattern — direct that new-hire onboarding include a documented 30-day supervised-caseload period, with a compliance report back to the Board next quarter',
    rationale:
      "Two of three new hires already appear in safety/disciplinary records in their first onboarding quarter — that is a rate, not a coincidence, and it sits squarely inside the Board's patient-safety oversight duty. A structural onboarding safeguard with a reporting deadline is proportionate; a hiring freeze overreacts, and silence abdicates.",
  },
];

const q4Kpis: QapiKpi[] = [
  {
    indicator: 'OASIS Accuracy Rate',
    qValue: '91.3%',
    threshold: '≥90%',
    status: 'good',
    trend: 'First threshold-meeting close after 4 quarters below; PIP-Q1-001 closed',
    monthly: [
      { month: 'October', value: '90.6%' },
      { month: 'November', value: '91.0%' },
      { month: 'December', value: '91.3%' },
    ],
  },
  {
    indicator: 'Visit Documentation Timeliness (within 24h)',
    qValue: '95.6%',
    threshold: '≥95%',
    status: 'good',
    trend: 'PIP-TRIG-Q3-002 closed 2026-11-30',
    monthly: [
      { month: 'October', value: '93.8%' },
      { month: 'November', value: '95.0%' },
      { month: 'December', value: '95.6%' },
    ],
  },
  {
    indicator: 'Medication Reconciliation at SOC/ROC',
    qValue: '95.0%',
    threshold: '≥95%',
    status: 'good',
    trend: "PIP-Q1-003 closed at year end after rising from 72.7% in Q1's January reading",
    monthly: [
      { month: 'October', value: '89.2%' },
      { month: 'November', value: '92.3%' },
      { month: 'December', value: '95.0%' },
    ],
  },
  {
    indicator: 'POC Goal Documentation Completeness',
    qValue: '93.9%',
    threshold: '≥92%',
    status: 'good',
    trend: 'PIP-Q1-004 closed 2026-10-31',
    monthly: [
      { month: 'October', value: '92.3%' },
      { month: 'November', value: '93.2%' },
      { month: 'December', value: '93.9%' },
    ],
  },
  {
    indicator: 'Missed Visit Rate',
    qValue: '1.4%',
    threshold: '≤2%',
    status: 'good',
    trend: 'PIP-Q1-005 closed 2026-10-31; sustained through November/December',
    monthly: [
      { month: 'October', value: '1.8%' },
      { month: 'November', value: '1.4%' },
      { month: 'December', value: '1.4%' },
    ],
  },
  {
    indicator: 'Hospitalization Rate',
    qValue: '0.5%',
    threshold: '≤3%',
    status: 'good',
    trend: 'Dramatic improvement; new monitoring protocols credited',
    monthly: [
      { month: 'October', value: '1.7%' },
      { month: 'November', value: '1.1%' },
      { month: 'December', value: '0.5%' },
    ],
  },
  {
    indicator: 'Hospitalization Rate (Cumulative Q4)',
    qValue: '3.0%',
    threshold: '≤3% quarterly',
    status: 'good',
    trend: "PIP-TRIG-Q3-007 closed; trend reversed from Q3's 5.3% spike",
    monthly: [{ month: 'Q4 total', value: '6 hospitalizations (3.0%)' }],
  },
  {
    indicator: 'Wound Infection Rate',
    qValue: '3.6%',
    threshold: '≤5%',
    status: 'good',
    trend: 'PIP-Q1-006 closed (required 2 consecutive months below threshold); October was borderline at 5.8%',
    monthly: [
      { month: 'October', value: '5.8%' },
      { month: 'November', value: '3.7%' },
      { month: 'December', value: '3.6%' },
    ],
  },
  {
    indicator: 'Complaint Resolution Timeliness (within 5 days)',
    qValue: '100.0%',
    threshold: '≥90%',
    status: 'good',
    trend: 'PIP-Q1-007 closed; strong finish after a November dip to 88.9%',
    monthly: [
      { month: 'October', value: '90.9%' },
      { month: 'November', value: '88.9%' },
      { month: 'December', value: '100.0%' },
    ],
  },
  {
    indicator: 'Care Coordination Documentation',
    qValue: '90.8%',
    threshold: '≥90%',
    status: 'good',
    trend: "PIP-TRIG-Q3-008 closed in just 2 quarters after discovery, up from Q3's 72.3% baseline",
    monthly: [
      { month: 'October', value: '88.1%' },
      { month: 'November', value: '90.8%' },
    ],
  },
  {
    indicator: 'Documentation-to-Claim Alignment Rate',
    qValue: '98.1%',
    threshold: '≥97%',
    status: 'good',
    trend: 'PIP-Q1-008 closed; only 4 mismatches all quarter',
    monthly: [{ month: 'Q4 average', value: '98.1%' }],
  },
];

// Section 9 of the Q4 source is a year-end PIP resolution summary, not a live
// trigger table — these 10 rows are the closure record for every PIP opened
// during 2026. `severity` is kept at each PIP's original/peak level (carried
// forward the same way as ./qapiData.ts fidelity note 2 and this file's note
// 1) so the Board can see what was closed; `status` carries the resolution.
const q4PipTriggers: QapiPipTrigger[] = [
  {
    id: 'PIP-Q1-001',
    title: 'OASIS Accuracy',
    severity: 'High',
    status: 'Closed — 91.3% Dec (resolved 2026-12-31, after 4 quarters below threshold)',
    findingSummary: 'Originated Q1 at 82.2%; closed Q4 at 91.3%.',
  },
  {
    id: 'PIP-Q1-002',
    title: 'Visit Documentation Timeliness',
    severity: 'High',
    status: 'Closed — 95.6% Dec (resolved 2026-11-30)',
    findingSummary: 'Originated Q1 at 85.6%; closed Q4 at 95.6%.',
  },
  {
    id: 'PIP-Q1-003',
    title: 'Medication Reconciliation at SOC/ROC',
    severity: 'Critical',
    status: 'Closed — 95.0% Dec (resolved 2026-12-31)',
    findingSummary: 'Originated Q1 at 72.7%; closed Q4 at 95.0%.',
  },
  {
    id: 'PIP-Q1-004',
    title: 'POC Goal Completeness',
    severity: 'High',
    status: 'Closed — 93.9% Dec (resolved 2026-10-31)',
    findingSummary: 'Originated Q1 at 80.0%; closed Q4 at 93.9%.',
  },
  {
    id: 'PIP-Q1-005',
    title: 'Missed Visit Rate',
    severity: 'High',
    status: 'Closed — 1.4% Oct–Dec (resolved 2026-10-31)',
    findingSummary: 'Originated Q1 at 3.8%; closed Q4 at 1.4%.',
  },
  {
    id: 'PIP-Q1-006',
    title: 'Wound Infection Rate',
    severity: 'Critical',
    status: 'Closed — 3.6% Dec, after an October borderline reading of 5.8% (resolved 2026-12-31)',
    findingSummary: 'Originated Q1 at 10.7%; closed Q4 at 3.6%.',
  },
  {
    id: 'PIP-Q1-007',
    title: 'Complaint Resolution Timeliness',
    severity: 'Critical',
    status: 'Closed — 100% Dec (resolved 2026-12-31)',
    findingSummary: 'Originated Q1 at 66.7%; closed Q4 at 100%.',
  },
  {
    id: 'PIP-Q1-008',
    title: 'Documentation-to-Claim Alignment',
    severity: 'High',
    status: 'Closed — 98.1% Q4 average (resolved 2026-12-31)',
    findingSummary: 'Originated Q1 with 6 mismatched claim lines; closed Q4 with 4 mismatches at 98.1% alignment.',
  },
  {
    id: 'PIP-Q3-007',
    title: 'Hospitalization Rate Spike',
    severity: 'Critical',
    status: 'Closed — 3.0% cumulative Q4 (resolved 2026-12-31)',
    findingSummary: "Originated Q3 at 5.3% cumulative (9 hospitalizations); closed Q4 at 3.0% (6 hospitalizations).",
  },
  {
    id: 'PIP-Q3-008',
    title: 'Care Coordination Documentation',
    severity: 'High',
    status: 'Closed — 90.8% Nov (resolved 2026-11-30)',
    findingSummary: 'Originated Q3 at 72.3%; closed after just 2 quarters at 90.8%.',
  },
];

const q4Caps: QapiCap[] = [
  {
    id: 'CAP-Q4-001',
    description:
      'MOCK-CLIN-0003 separation (DISC-TRIG-Q4-001): file documentation, final chart-integrity audit of all charts, IT access revocation',
    owner: 'MOCK-CLIN-0028',
    dueDate: '2027-01-31',
    status: 'In Progress',
  },
  {
    id: 'CAP-Q4-002',
    description:
      'MOCK-CLIN-0006 peer review (DISC-TRIG-Q4-002): review of all current fall-risk patients, retrospective chart audit, additional fall-risk training',
    owner: 'MOCK-CLIN-0026',
    dueDate: '2027-02-14',
    status: 'Open',
  },
  {
    id: 'CAP-Q4-003',
    description:
      'MOCK-CLIN-0032 written warning (DISC-TRIG-Q4-003): 90-day monitoring of arrival times; scheduler notified for all assignments',
    owner: 'MOCK-CLIN-0023',
    dueDate: '2027-03-14',
    status: 'Open',
  },
  {
    id: 'CAP-Q4-004',
    description: 'MOCK-CLIN-0035 HIPAA training completion scheduled for January 2027',
    owner: 'MOCK-CLIN-0023',
    dueDate: '2027-01-31',
    status: 'Scheduled',
  },
  {
    id: 'CAP-Q4-005',
    description:
      'Agency-wide fall-prevention protocol review (AE-Q4-002 — GB escalation): mandatory annual fall-risk training for all clinical staff by January 2027',
    owner: 'MOCK-CLIN-0026',
    dueDate: '2027-01-31',
    status: 'Open',
  },
];

const q4AdverseEvents: QapiAdverseEvent[] = [
  {
    id: 'AE-Q4-001',
    type: 'Hospitalization — CHF exacerbation',
    severity: 'High',
    rcaStatus: 'RCA Complete — new-hire clinician; monitoring protocol reviewed',
    date: '2026-10-09',
  },
  {
    id: 'AE-Q4-002',
    type: 'Hospitalization — fall + hip re-fracture',
    severity: 'Critical',
    rcaStatus: 'RCA Complete — Governing Body escalation; second such event for this PT since Q3',
    date: '2026-10-22',
  },
  {
    id: 'AE-Q4-003',
    type: 'Patient fall — no injury',
    severity: 'Low',
    rcaStatus: 'Closed — fall-prevention protocol reviewed',
    date: '2026-11-08',
  },
  {
    id: 'AE-Q4-004',
    type: 'Wound dehiscence',
    severity: 'Medium',
    rcaStatus: 'Closed — expected post-surgical course documented',
    date: '2026-11-19',
  },
  {
    id: 'AE-Q4-005',
    type: 'Hospitalization — CHF + fluid overload',
    severity: 'High',
    rcaStatus: 'Closed — rapid deterioration; no systemic finding',
    date: '2026-12-04',
  },
  {
    id: 'AE-Q4-006',
    type: 'Hospitalization — COPD exacerbation',
    severity: 'High',
    rcaStatus: 'Closed — new patient with multiple co-morbidities',
    date: '2026-12-19',
  },
];

// See fidelity note 3: only the one complaint the source marks "GB escalation".
const q4ComplaintsEscalated: QapiComplaintEscalated[] = [
  {
    id: 'COMP-Q4-002',
    summary:
      'Communication — fall + re-fracture family escalation; 2 days to resolve — closed with escalation to Governing Body',
  },
];

// See fidelity note 4: GB-Q4-001 bundles 3 items in one source record; split for shape-parity, same as Q3/Q1.
// ANN-2026-001 is a separate meeting-agenda record in the source (Annual Report Approval), kept as its own row.
const q4GbEscalationItems: QapiGbEscalationItem[] = [
  {
    id: 'GB-Q4-001-1',
    text: "Hip re-fracture — MOCK-PT-0072 (AE-Q4-002), forming a pattern with Q3's AE-Q3-002 (same PT, MOCK-CLIN-0006)",
    directive: 'Escalated to Governing Body',
  },
  {
    id: 'GB-Q4-001-2',
    text: 'MOCK-CLIN-0003 separation — third documentation-integrity finding (DISC-TRIG-Q4-001)',
    directive: 'Escalated to Governing Body',
  },
  {
    id: 'GB-Q4-001-3',
    text: 'Year-end agency growth summary — census grew 120 → 200 across 2026',
    directive: 'Escalated to Governing Body',
  },
  {
    id: 'ANN-2026-001',
    text: 'GV-FM-023 Annual Compliance Report for full-year 2026, covering all four quarters',
    directive: 'Presented for Governing Body review and approval',
  },
];

const q4Actions: TabletopAction[] = [
  {
    id: 'TT-Q4-001',
    prompt:
      'MOCK-CLIN-0003 now has three substantiated documentation-integrity findings across three quarters (an unauthorized chart change in Q1, a second irregularity in Q3, and a third in Q4), and HR recommends termination. Separation is already "in process" under CAP-Q4-001. What should the Board record as its role here?',
    options: [
      're-open and personally re-adjudicate the underlying clinical findings before allowing separation to proceed',
      "Acknowledge that HR/Administration followed a proportionate, escalating, documented process (coaching → suspension → supervision → separation) and accept CAP-Q4-001's closure plan, including the chart-integrity audit and access revocation",
      'Overrule HR and offer the clinician a fourth chance given tenure',
      'Take no action, since personnel matters are entirely outside Board purview',
    ],
    modelAnswer:
      "Acknowledge that HR/Administration followed a proportionate, escalating, documented process (coaching → suspension → supervision → separation) and accept CAP-Q4-001's closure plan, including the chart-integrity audit and access revocation",
    rationale:
      "The record shows a textbook progressive-discipline trail across three quarters. The Board's role is to confirm the process was followed and that the closure plan protects the agency — not to re-litigate clinical facts or override a completed HR process.",
  },
  {
    id: 'TT-Q4-002',
    prompt:
      'MOCK-CLIN-0006 (PT) is now linked to hip re-fracture events in both Q3 (AE-Q3-002) and Q4 (AE-Q4-002) — the exact recurrence the Board asked to be flagged immediately, rehearsed back in Q3. CAP-Q4-002 opens a peer review and retrospective chart audit. Is CAP-Q4-002 alone a sufficient Board response?',
    options: [
      'Yes — a peer review and chart audit is a complete response; no further Board involvement is needed',
      'No — accept CAP-Q4-002, but additionally direct that the peer-review findings be reported directly back to the Board, not only to the QAPI committee, before the clinician resumes an unrestricted fall-risk caseload',
      'No — the clinician should be terminated immediately given the repeat pattern',
      'No — two cases are a coincidence and need no special handling',
    ],
    modelAnswer:
      'No — accept CAP-Q4-002, but additionally direct that the peer-review findings be reported directly back to the Board, not only to the QAPI committee, before the clinician resumes an unrestricted fall-risk caseload',
    rationale:
      'This is precisely the recurrence the Board pre-committed to treat as an immediate-escalation trigger during the Q3 rehearsal. Accepting the CAP alone would silently downgrade that commitment back to routine QAPI handling; a repeat Critical safety event involving the same clinician warrants the Board seeing the peer-review outcome directly.',
  },
  {
    id: 'TT-Q4-003',
    prompt:
      'The GV-FM-023 Annual Compliance Report (ANN-2026-001) is presented covering all of 2026: census grew from 120 to 200, all 10 PIPs opened during the year are now closed, policy compliance rose from 11/14 to 14/14, and there was 1 disciplinary separation. What is the defensible way for the Board to approve this report?',
    options: [
      'Approve immediately without discussion, since every metric ended the year green',
      'Approve, but only after confirming the report explicitly documents the still-open governance items (the MOCK-CLIN-0006 pattern review and the MOCK-CLIN-0003 separation) rather than presenting the year as fully closed',
      'Decline to approve until every quarter of the year is re-audited from scratch',
      'Table the vote indefinitely pending unrelated matters',
    ],
    modelAnswer:
      'Approve, but only after confirming the report explicitly documents the still-open governance items (the MOCK-CLIN-0006 pattern review and the MOCK-CLIN-0003 separation) rather than presenting the year as fully closed',
    rationale:
      'All ten formal PIPs closing is genuinely good news, but two governance threads are still open — a repeat-event clinician under review and a separation still in process. A defensible annual approval records the full picture rather than letting good metrics wave through incomplete business.',
  },
  {
    id: 'TT-Q4-004',
    prompt:
      'Every quarterly KPI closed Q4 "good" for the first time all year, including OASIS accuracy (91.3%), medication reconciliation (95.0%), and the cumulative hospitalization rate (3.0%, down from 5.3% in Q3). Given this, should the Board reduce the frequency or depth of its QAPI review going into 2027?',
    options: [
      'Yes — move to a lighter, high-level annual review, since every metric is now within threshold',
      'No — maintain the standing quarterly cadence and full KPI/PIP/AE/complaint review regardless of a clean quarter, since thresholds can regress, as several metrics nearly did between Q1 and Q2',
      'Yes — but only reduce review of the metrics that have been green for 2 consecutive quarters',
      'No — increase review frequency to monthly for all metrics permanently',
    ],
    modelAnswer:
      'No — maintain the standing quarterly cadence and full KPI/PIP/AE/complaint review regardless of a clean quarter, since thresholds can regress, as several metrics nearly did between Q1 and Q2',
    rationale:
      "The year's own record is the clearest lesson: nearly every metric moved sideways or worsened between Q1 and Q2 despite CAPs already being open. One clean quarter is not evidence that oversight can be relaxed — the standing cadence is what surfaces the next spike, like Q3's hospitalization jump, while it is still small.",
  },
];

export const TABLETOP_QUARTERS: Record<TabletopQuarterKey, TabletopQuarterData> = {
  Q3: {
    quarterLabel: 'Q3 2026',
    periodLabel: 'July 1 – September 30, 2026',
    meetingDate: '2026-10-08',
    kpis: q3Kpis,
    pipTriggers: q3PipTriggers,
    caps: q3Caps,
    adverseEvents: q3AdverseEvents,
    complaintsEscalated: q3ComplaintsEscalated,
    gbEscalationItems: q3GbEscalationItems,
    actions: q3Actions,
  },
  Q4: {
    quarterLabel: 'Q4 2026',
    periodLabel: 'October 1 – December 31, 2026',
    meetingDate: '2027-01-14',
    kpis: q4Kpis,
    pipTriggers: q4PipTriggers,
    caps: q4Caps,
    adverseEvents: q4AdverseEvents,
    complaintsEscalated: q4ComplaintsEscalated,
    gbEscalationItems: q4GbEscalationItems,
    actions: q4Actions,
  },
};
