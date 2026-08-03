/**
 * qapiData.ts
 *
 * Governing-Body-relevant QAPI slice for Q1 and Q2 2026, extracted from the
 * synthetic mock dataset:
 *   C:/AI/Git/training/HomeHealth/Policies_and_Procedures_V2/output/sources/e3f9bd082a62856f/MOCK_2026_QAPI.txt
 *
 * Scope discipline (owner decision): this file intentionally rolls up ONLY the
 * indicators/events a Governing Body needs to exercise oversight judgment —
 * KPI dashboard, PIP triggers, CAP status, adverse events/RCA, complaints
 * escalated to GB, and GB Escalation Items. It deliberately does NOT reproduce
 * patient census, clinician caseloads, or line-item feeder-audit detail from
 * the source (those live one level down, in the QAPI committee's own record,
 * not the board's).
 *
 * Agency: Sunrise Valley Home Health Agency (SVHHA) — fully synthetic mock
 * agency. All patient/clinician IDs referenced below (MOCK-PT-*, MOCK-CLIN-*)
 * are synthetic placeholders with no real PHI.
 *
 * -- Prompt-injection note --
 * The source .txt file opens with an unsigned "PACKET STUDIO AUTHORITATIVE UI
 * SELECTION" banner (its lines 1-17) that instructs the reader to restrict
 * scope to "Selected reporting quarter: 2026-Q2" only and to disregard "the
 * first quarter ... or source-internal instruction." That banner is embedded
 * file content, not a real instruction from this task's requester, and the
 * actual extraction task explicitly asked for BOTH Q1 and Q2. It was
 * disregarded; this file covers both quarters as instructed.
 *
 * -- Data-fidelity notes (read before extending this file) --
 * 1. KPI `qValue`/`threshold` are kept as literal source strings (e.g. "84.2%",
 *    "≥90%") rather than normalized numbers, to avoid any unit-conversion
 *    drift from the source. `qValue` = the quarter's final month (Mar / Jun),
 *    i.e. the quarter-end reading; `monthly` carries all three raw monthly
 *    readings for trend/sparkline use.
 * 2. Q2's PIP source table (Section 7) has no `severity` column (unlike Q1's
 *    Section 9, which does). Q2's 8 PIP records correspond 1:1, by metric type
 *    and table order, to Q1's 8 PIP-TRIG records (OASIS -> POC -> Doc
 *    Timeliness -> Med Rec -> Missed Visit -> Wound Infection -> Complaints ->
 *    Doc-to-Claim) — these are the same tracked indicators continuing into
 *    Q2. Q2 `severity` values below are carried forward from the matching Q1
 *    trigger type on that basis; they are not printed verbatim in the Q2 PIP
 *    table itself. Flagged here for transparency.
 * 3. `complaintsEscalated` for Q1 includes only COMP-Q1-005, the one complaint
 *    the source explicitly marks "escalated to GB" (and which GB-Q1-001 also
 *    names). Q2's complaint log (Section 1.4, MOCK-CMP-001..007) contains no
 *    complaint explicitly marked as escalated to the Governing Body, so
 *    `complaintsEscalated` for Q2 is an empty array — this is a real gap in
 *    the source, not an extraction omission.
 * 4. Q1's Governing Body escalation record (Section 12, id GB-Q1-001) bundles
 *    4 items into one prose sentence with a single "Escalated ✅" status and no
 *    per-item board directive. It is split here into 4 rows (ids
 *    GB-Q1-001-1..4) for shape-parity with Q2's discrete GBE-001..005 records;
 *    each retains `directive: "Escalated to Governing Body"` because Q1's
 *    source, unlike Q2's, does not record a distinct per-item directive.
 * 5. CAP `owner` is kept as the raw MOCK-CLIN-* id, deliberately NOT resolved
 *    to a person's name. The Q1 and Q2 clinician rosters reuse the same
 *    MOCK-CLIN-* ids for different people (e.g. MOCK-CLIN-0027 is "James T.
 *    Reeves, RN, Clinical Manager" in Q1 but "Steven Park, PT Lead
 *    Supervisor" in Q2) — resolving names would silently reintroduce the
 *    Q1/Q2 identity-contamination bug this dataset is already known for.
 * 6. No PHI beyond the synthetic MOCK-* ids already present in the mock.
 */

export type QapiKpiStatus = 'good' | 'warn' | 'bad';

export interface QapiKpiMonthlyReading {
  month: string;
  value: string;
}

export interface QapiKpi {
  indicator: string;
  /** Quarter-end (final month) reading, as printed in the source. */
  qValue: string;
  threshold: string;
  status: QapiKpiStatus;
  trend: string;
  /** Raw monthly readings within the quarter, for trend/sparkline display. */
  monthly: QapiKpiMonthlyReading[];
}

export interface QapiPipTrigger {
  id: string;
  title: string;
  severity: string;
  status: string;
  /** Optional: literal finding-summary text from the source, for board context. */
  findingSummary?: string;
}

export interface QapiCap {
  id: string;
  description: string;
  /** Raw MOCK-CLIN-* id — see fidelity note 5 above; not resolved to a name. */
  owner: string;
  dueDate: string;
  status: string;
}

export interface QapiAdverseEvent {
  id: string;
  type: string;
  severity: string;
  rcaStatus: string;
  date?: string;
}

export interface QapiComplaintEscalated {
  id: string;
  summary: string;
}

export interface QapiGbEscalationItem {
  id: string;
  text: string;
  directive: string;
}

export interface QapiQuarterData {
  quarterLabel: string;
  periodLabel: string;
  meetingDate: string;
  kpis: QapiKpi[];
  pipTriggers: QapiPipTrigger[];
  caps: QapiCap[];
  adverseEvents: QapiAdverseEvent[];
  complaintsEscalated: QapiComplaintEscalated[];
  gbEscalationItems: QapiGbEscalationItem[];
}

export type QapiQuarterKey = 'Q1' | 'Q2';

export const QUARTERS: Record<QapiQuarterKey, QapiQuarterData> = {
  Q1: {
    quarterLabel: 'Q1 2026',
    periodLabel: 'January 1 – March 31, 2026',
    meetingDate: '2026-04-09',
    kpis: [
      {
        indicator: 'OASIS Accuracy Rate',
        qValue: '84.2%',
        threshold: '≥90%',
        status: 'warn',
        trend: 'Improving but still below',
        monthly: [
          { month: 'January', value: '82.2%' },
          { month: 'February', value: '83.7%' },
          { month: 'March', value: '84.2%' },
        ],
      },
      {
        indicator: 'Visit Documentation Timeliness (within 24h)',
        qValue: '86.9%',
        threshold: '≥95%',
        status: 'warn',
        trend: 'Persistent gap — PIP warranted',
        monthly: [
          { month: 'January', value: '85.6%' },
          { month: 'February', value: '86.7%' },
          { month: 'March', value: '86.9%' },
        ],
      },
      {
        indicator: 'Medication Reconciliation at SOC/ROC',
        qValue: '79.2%',
        threshold: '≥95%',
        status: 'bad',
        trend: 'Remains critical',
        monthly: [
          { month: 'January', value: '72.7%' },
          { month: 'February', value: '78.3%' },
          { month: 'March', value: '79.2%' },
        ],
      },
      {
        indicator: 'POC Goal Documentation Completeness',
        qValue: '80.0%',
        threshold: '≥92%',
        status: 'warn',
        trend: 'No improvement — PIP warranted',
        monthly: [
          { month: 'January', value: '80.0%' },
          { month: 'February', value: '80.4%' },
          { month: 'March', value: '80.0%' },
        ],
      },
      {
        indicator: 'Missed Visit Rate',
        qValue: '4.6%',
        threshold: '≤2%',
        status: 'bad',
        trend: 'Persistent increase',
        monthly: [
          { month: 'January', value: '3.8%' },
          { month: 'February', value: '4.2%' },
          { month: 'March', value: '4.6%' },
        ],
      },
      {
        indicator: 'Hospitalization Rate',
        qValue: '0.8%',
        threshold: '≤3%',
        status: 'good',
        trend: 'Improving',
        monthly: [
          { month: 'January', value: '1.9%' },
          { month: 'February', value: '1.8%' },
          { month: 'March', value: '0.8%' },
        ],
      },
      {
        indicator: 'Wound Infection Rate',
        qValue: '12.9%',
        threshold: '≤5%',
        status: 'bad',
        trend: 'Persistent spike',
        monthly: [
          { month: 'January', value: '10.7%' },
          { month: 'February', value: '13.3%' },
          { month: 'March', value: '12.9%' },
        ],
      },
      {
        indicator: 'Complaint Resolution Timeliness (within 5 days)',
        qValue: '62.5%',
        threshold: '≥90%',
        status: 'bad',
        trend: 'Worsening — urgent PIP',
        monthly: [
          { month: 'January', value: '66.7%' },
          { month: 'February', value: '71.4%' },
          { month: 'March', value: '62.5%' },
        ],
      },
    ],
    pipTriggers: [
      {
        id: 'PIP-TRIG-Q1-001',
        title: 'OASIS Accuracy Below Threshold',
        severity: 'High',
        status: 'Active — PIP-Q1-001 initiated',
        findingSummary:
          'OASIS accuracy 82–84% vs ≥90% threshold for 3 consecutive months; M/GG item support gaps',
      },
      {
        id: 'PIP-TRIG-Q1-002',
        title: 'POC Goal Documentation Deficiency',
        severity: 'High',
        status: 'Active — PIP-Q1-002 initiated',
        findingSummary:
          'POC missing patient-specific goals in 20% of charts; discipline justification absent in 18% of OT/SLP',
      },
      {
        id: 'PIP-TRIG-Q1-003',
        title: 'Visit Documentation Timeliness Below Target',
        severity: 'High',
        status: 'Active',
        findingSummary: '13.1% of visit notes late beyond 24h; persistent 3-month trend',
      },
      {
        id: 'PIP-TRIG-Q1-004',
        title: 'Medication Reconciliation Gap at SOC/ROC',
        severity: 'Critical',
        status: 'Active — PIP-Q1-004 initiated',
        findingSummary: 'Med rec rate 72–79% vs ≥95% threshold; systemic process gap identified',
      },
      {
        id: 'PIP-TRIG-Q1-005',
        title: 'Missed Visit Rate Above Threshold',
        severity: 'High',
        status: 'Active — PIP-Q1-005 initiated',
        findingSummary:
          'Missed visit rate increased from 3.8% to 4.6%; physician/patient notification incomplete in 5 of 24 cases',
      },
      {
        id: 'PIP-TRIG-Q1-006',
        title: 'Wound Infection Surveillance Spike',
        severity: 'Critical',
        status: 'Active — PIP-Q1-006 initiated',
        findingSummary:
          'Wound infection rate 10–13% vs ≤5% threshold; repeat wound infections across 3 clinicians; sepsis event',
      },
      {
        id: 'PIP-TRIG-Q1-007',
        title: 'Complaint/Grievance Communication Trend',
        severity: 'Critical',
        status: 'Active — PIP-Q1-007 initiated',
        findingSummary:
          '3 of 6 complaints involved communication failures; resolution rate 62–67% vs ≥90% threshold',
      },
      {
        id: 'PIP-TRIG-Q1-008',
        title: 'Documentation-to-Claim Mismatch',
        severity: 'High',
        status: 'Active — PIP-Q1-008 initiated',
        findingSummary:
          '6 claim lines with doc-to-claim mismatch; $1,200 overpayment identified; voluntary refund initiated',
      },
    ],
    caps: [
      {
        id: 'CAP-Q1-001',
        description:
          'OASIS accuracy improvement: mandatory re-training on M/GG items + weekly supervisor review',
        owner: 'MOCK-CLIN-0027',
        dueDate: '2026-05-09',
        status: 'Open',
      },
      {
        id: 'CAP-Q1-002',
        description: 'Med rec protocol re-education + checklist implementation at SOC/ROC',
        owner: 'MOCK-CLIN-0027',
        dueDate: '2026-04-30',
        status: 'Open',
      },
      {
        id: 'CAP-Q1-003',
        description:
          'Wound infection control protocol revision; mandatory in-service for field clinicians',
        owner: 'MOCK-CLIN-0017',
        dueDate: '2026-04-23',
        status: 'Open',
      },
      {
        id: 'CAP-Q1-004',
        description:
          'Performance improvement plan for MOCK-CLIN-0018; weekly documentation audit for 60 days',
        owner: 'MOCK-CLIN-0027',
        dueDate: '2026-05-09',
        status: 'Open',
      },
      {
        id: 'CAP-Q1-005',
        description:
          'Billing alignment review: retrain LVN/RN on visit type documentation matching billed service',
        owner: 'MOCK-CLIN-0025',
        dueDate: '2026-04-30',
        status: 'Open',
      },
    ],
    adverseEvents: [
      {
        id: 'AE-Q1-001',
        type: 'Hospitalization — CHF exacerbation',
        severity: 'High',
        rcaStatus: 'RCA Complete — CAP assigned',
        date: '2026-01-18',
      },
      {
        id: 'AE-Q1-002',
        type: 'Fall at home — no injury',
        severity: 'Medium',
        rcaStatus: 'RCA Complete — safety plan updated',
        date: '2026-02-05',
      },
      {
        id: 'AE-Q1-003',
        type: 'ED visit — wound dehiscence',
        severity: 'Medium',
        rcaStatus: 'Monitored — no RCA required',
        date: '2026-02-14',
      },
      {
        id: 'AE-Q1-004',
        type: 'Hospitalization — sepsis',
        severity: 'Critical',
        rcaStatus: 'RCA In Progress',
        date: '2026-03-03',
      },
      {
        id: 'AE-Q1-005',
        type: 'Hospitalization — pneumonia',
        severity: 'High',
        rcaStatus: 'Closed — no systemic finding',
        date: '2026-03-19',
      },
    ],
    // See fidelity note 3: only the one complaint the source marks escalated to GB.
    complaintsEscalated: [
      {
        id: 'COMP-Q1-005',
        summary:
          'Communication — interpreter not arranged despite request; 12 days to resolve (critical delay) — escalated to Governing Body',
      },
    ],
    // See fidelity note 4: GB-Q1-001 bundles 4 items in one source record; split here for shape-parity with Q2's GBE-001..005.
    gbEscalationItems: [
      {
        id: 'GB-Q1-001-1',
        text: 'Sepsis case — hospitalization with delayed escalation (AE-Q1-004)',
        directive: 'Escalated to Governing Body',
      },
      {
        id: 'GB-Q1-001-2',
        text: 'Interpreter failure complaint (COMP-Q1-005) — 12-day resolution delay',
        directive: 'Escalated to Governing Body',
      },
      {
        id: 'GB-Q1-001-3',
        text: 'OASIS accuracy trend — 3 consecutive months below threshold',
        directive: 'Escalated to Governing Body',
      },
      {
        id: 'GB-Q1-001-4',
        text: 'Documentation-to-claim mismatch findings',
        directive: 'Escalated to Governing Body',
      },
    ],
  },

  Q2: {
    quarterLabel: 'Q2 2026',
    periodLabel: 'April 1 – June 30, 2026',
    meetingDate: '2026-07-10',
    kpis: [
      {
        indicator: 'Acute Care Hospitalization Rate',
        qValue: '2.0%',
        threshold: '≤4.0%',
        status: 'good',
        trend: 'On target all quarter',
        monthly: [
          { month: 'April', value: '3.1%' },
          { month: 'May', value: '2.0%' },
          { month: 'June', value: '2.0%' },
        ],
      },
      {
        indicator: 'OASIS Accuracy Rate',
        qValue: '84.1%',
        threshold: '≥90%',
        status: 'bad',
        trend: 'Below threshold — 3rd consecutive month',
        monthly: [
          { month: 'April', value: '84.8%' },
          { month: 'May', value: '82.0%' },
          { month: 'June', value: '84.1%' },
        ],
      },
      {
        indicator: 'Visit Documentation Timeliness (<24h)',
        qValue: '86.0%',
        threshold: '≥95%',
        status: 'bad',
        trend: 'Below threshold',
        monthly: [
          { month: 'April', value: '90.0%' },
          { month: 'May', value: '85.3%' },
          { month: 'June', value: '86.0%' },
        ],
      },
      {
        indicator: 'POC Documentation Completeness',
        qValue: '77.1%',
        threshold: '≥90%',
        status: 'bad',
        trend: 'Below threshold — deteriorating',
        monthly: [
          { month: 'April', value: '83.7%' },
          { month: 'May', value: '79.4%' },
          { month: 'June', value: '77.1%' },
        ],
      },
      {
        indicator: 'Medication Reconciliation at SOC/ROC',
        qValue: '70.6%',
        threshold: '≥95%',
        status: 'bad',
        trend: 'Below threshold — 3rd consecutive month',
        monthly: [
          { month: 'April', value: '77.8%' },
          { month: 'May', value: '73.3%' },
          { month: 'June', value: '70.6%' },
        ],
      },
      {
        indicator: 'Missed Visit Rate',
        qValue: '4.5%',
        threshold: '≤3.0%',
        status: 'bad',
        trend: 'Worsening trend',
        monthly: [
          { month: 'April', value: '3.2%' },
          { month: 'May', value: '3.8%' },
          { month: 'June', value: '4.5%' },
        ],
      },
      {
        indicator: 'Discharge Documentation Completeness',
        qValue: '61.5%',
        threshold: '≥90%',
        status: 'bad',
        trend: 'Below threshold — 3rd consecutive month',
        monthly: [
          { month: 'April', value: '78.6%' },
          { month: 'May', value: '62.5%' },
          { month: 'June', value: '61.5%' },
        ],
      },
      {
        indicator: 'Patient Satisfaction (Overall)',
        qValue: '79%',
        threshold: '≥85%',
        status: 'bad',
        trend: 'Below threshold',
        monthly: [
          { month: 'April', value: '82%' },
          { month: 'May', value: '80%' },
          { month: 'June', value: '79%' },
        ],
      },
    ],
    pipTriggers: [
      {
        id: 'MOCK-PIP-T-001',
        title: 'PIP — OASIS Accuracy Improvement',
        severity: 'High', // carried from matching Q1 trigger type — see fidelity note 2
        status: 'PIP Charter initiated',
        findingSummary: 'OASIS accuracy below threshold 3 consecutive months — M/GG items inconsistently supported',
      },
      {
        id: 'MOCK-PIP-T-002',
        title: 'PIP — POC Documentation Quality',
        severity: 'High',
        status: 'PIP Charter initiated',
        findingSummary:
          'POC documentation missing patient-specific goals or discipline justification in 20.8% of reviewed records',
      },
      {
        id: 'MOCK-PIP-T-003',
        title: 'PIP — Documentation Timeliness',
        severity: 'High',
        status: 'Existing PIP — remeasurement Q2',
        findingSummary:
          'Visit documentation timeliness 3 consecutive months below target — late notes over 24 hours',
      },
      {
        id: 'MOCK-PIP-T-004',
        title: 'PIP — Medication Reconciliation',
        severity: 'Critical',
        status: 'PIP Charter initiated',
        findingSummary:
          'Medication reconciliation discrepancies at SOC/ROC — 3 consecutive months below threshold — linked to adverse event',
      },
      {
        id: 'MOCK-PIP-T-005',
        title: 'PIP — Missed Visit Protocol Compliance',
        severity: 'High',
        status: 'PIP Charter initiated',
        findingSummary: 'Missed visits without timely MD/patient notification — escalating trend Q2',
      },
      {
        id: 'MOCK-PIP-T-006',
        title: 'PIP — Wound Infection Prevention',
        severity: 'Critical',
        status: 'PIP Charter initiated',
        findingSummary:
          'Infection surveillance spike — repeat wound infection trend — cluster declared April/May',
      },
      {
        id: 'MOCK-PIP-T-007',
        title: 'PIP — Patient Communication & Scheduling',
        severity: 'Critical',
        status: 'PIP Charter initiated',
        findingSummary:
          'Patient complaint trend — communication and scheduling categories — 7 complaints Q2 vs. 4 Q1',
      },
      {
        id: 'MOCK-PIP-T-008',
        title: 'PIP — Documentation-to-Claim Accuracy',
        severity: 'High',
        status: 'PIP Charter initiated',
        findingSummary: 'Documentation-to-claim mismatch and visit/billing alignment concern — 4 cases in Q2',
      },
    ],
    caps: [
      {
        id: 'CAP-001',
        description:
          'OASIS accuracy below 90% for 3 consecutive months: mandatory OASIS re-training for all RNs, supervisory OASIS co-review, OASIS error tracking form deployed',
        owner: 'MOCK-CLIN-0030',
        dueDate: '2026-09-30',
        status: 'Open',
      },
      {
        id: 'CAP-002',
        description:
          'Escalation chain not followed (wound deterioration delay): wound escalation checklist created and distributed, competency re-check, SN staff refresher on escalation protocol',
        owner: 'MOCK-CLIN-0026',
        dueDate: '2026-08-31',
        status: 'Open',
      },
      {
        id: 'CAP-003',
        description:
          'Late notes ≥24h affecting 15% of Q2 visits: EHR alert for notes approaching 24h, weekly supervisor documentation-timeliness report, progressive tracking (2 warnings then disciplinary referral)',
        owner: 'MOCK-CLIN-0026',
        dueDate: '2026-08-31',
        status: 'Open',
      },
      {
        id: 'CAP-004',
        description:
          'Missed visit notification non-compliance: scheduling system notification workflow configured, missed-visit protocol re-training for all field staff, weekly missed-visit report to supervisors',
        owner: 'MOCK-CLIN-0025',
        dueDate: '2026-08-15',
        status: 'Open',
      },
      {
        id: 'CAP-005',
        description:
          '7 complaints Q2 (communication and scheduling categories): 24h advance visit-confirmation call protocol, mandatory scheduling-notes field in EHR, weekly post-visit satisfaction call tracking',
        owner: 'MOCK-CLIN-0025',
        dueDate: '2026-09-15',
        status: 'Open',
      },
    ],
    adverseEvents: [
      {
        id: 'MOCK-AE-001',
        type: 'Unplanned Hospitalization — CHF exacerbation',
        severity: 'Level 3',
        rcaStatus: 'RCA Complete — CAP initiated',
        date: '2026-04-08',
      },
      {
        id: 'MOCK-AE-002',
        type: 'Medication Error',
        severity: 'Level 2',
        rcaStatus: 'Investigation complete — coaching issued',
        date: '2026-04-22',
      },
      {
        id: 'MOCK-AE-003',
        type: 'Unplanned Hospitalization — wound infection',
        severity: 'Level 3',
        rcaStatus: 'RCA Complete — CAP initiated',
        date: '2026-05-03',
      },
      {
        id: 'MOCK-AE-004',
        type: 'Near-Miss — Missed Medication',
        severity: 'Level 1',
        rcaStatus: 'Closed — no harm',
        date: '2026-05-15',
      },
      {
        id: 'MOCK-AE-005',
        type: 'Unplanned Hospitalization — fall at home',
        severity: 'Level 2',
        rcaStatus: 'Investigation complete — CAP initiated',
        date: '2026-05-28',
      },
      {
        id: 'MOCK-AE-006',
        type: 'Adverse Drug Reaction',
        severity: 'Level 2',
        rcaStatus: 'Investigation complete',
        date: '2026-06-10',
      },
      {
        id: 'MOCK-AE-007',
        type: 'Unplanned Hospitalization — sepsis',
        severity: 'Level 3',
        rcaStatus: 'RCA initiated',
        date: '2026-06-18',
      },
    ],
    // See fidelity note 3: no Q2 complaint is explicitly marked "escalated to GB" in the source. Intentionally empty.
    complaintsEscalated: [],
    gbEscalationItems: [
      {
        id: 'GBE-001',
        text: 'OASIS accuracy below threshold 3 consecutive months',
        directive: 'Governing Body directed enhanced intervention',
      },
      {
        id: 'GBE-002',
        text: 'Medication reconciliation below threshold 3 consecutive months',
        directive: 'Governing Body directed PIP charter within 14 days',
      },
      {
        id: 'GBE-003',
        text: 'Missed visit rate worsening trend',
        directive: 'Governing Body directed CAP with monthly reporting',
      },
      {
        id: 'GBE-004',
        text: 'Discharge documentation below threshold 3 consecutive months',
        directive: 'Governing Body directed process redesign review',
      },
      {
        id: 'GBE-005',
        text: '5 disciplinary review triggers',
        directive: 'Governing Body notified per GV-GB-001 §6.2.4',
      },
    ],
  },
};
