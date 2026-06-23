import type { BoardLaneData } from '../v6/components';

export const FALLBACK_BOARD_LANES: readonly BoardLaneData[] = [
  {
    title: 'Upcoming',
    tone: 'slate',
    count: 6,
    cards: [
      { chips: ['Prep', 'GV-GB-001'], due: 'May 20', id: 'CES-1201', owner: 'Compliance Officer', progress: 18, title: 'Validate governing body roster', tone: 'teal' },
      { chips: ['Documentation'], due: 'May 22', id: 'CES-1204', owner: 'DON', progress: 24, title: 'Queue annual policy manual review', tone: 'slate' }
    ]
  },
  {
    title: 'Ready',
    tone: 'green',
    count: 7,
    cards: [
      { chips: ['Ready', 'Evidence'], due: 'May 24', id: 'CES-1241', owner: 'Systems', progress: 88, title: 'Emergency drill after-action report', tone: 'green' },
      { chips: ['Training'], due: 'May 23', id: 'CES-1243', owner: 'DON', progress: 72, title: 'HIPAA training completion sweep', tone: 'teal' }
    ]
  },
  {
    title: 'In Progress',
    tone: 'teal',
    count: 12,
    cards: [
      { chips: ['Review', 'QA'], due: 'May 19', id: 'CES-1218', owner: 'Maria Gonzalez, RN', progress: 72, title: 'QAPI indicator data - Q2 aggregate report', tone: 'teal' },
      { chips: ['Clinical', 'Audit'], due: 'May 20', id: 'CES-1220', owner: 'Clinical Manager', progress: 54, title: '60-day care plan recertification reviews', tone: 'teal' }
    ]
  },
  {
    title: 'Awaiting Signature',
    tone: 'amber',
    count: 5,
    cards: [
      { chips: ['Signature', 'GB'], due: 'May 21', id: 'CES-1230', owner: 'Patricia Hale', progress: 62, title: 'Q2 Governing Body pre-read packet', tone: 'orange' },
      { chips: ['eCIgn'], due: 'May 21', id: 'CES-1231', owner: 'Governing Body', progress: 68, title: 'Incident reporting procedure approval', tone: 'amber' }
    ]
  },
  {
    title: 'Awaiting Action / Evidence',
    tone: 'amber',
    count: 5,
    note: '3 Evidence / 2 Action',
    cards: [
      { chips: ['QAPI', 'Evidence'], due: 'Jun 21', id: 'EVT-REV-01', owner: 'QAPI Lead', progress: 65, title: 'Q2 QAPI Review', tone: 'amber', meta: 'Quarterly indicators, adverse events summary, CAPA tracker', awaitingType: 'evidence', missing: '2 artifacts' },
      { chips: ['Infection', 'Action'], due: 'Jun 18', id: 'EVT-REV-02', owner: 'Clinical Manager', progress: 42, title: 'Q1 Infection Control Review', tone: 'amber', meta: 'Surveillance log, hand hygiene trends, PPE compliance', awaitingType: 'evidence', missing: 'log upload' },
      { chips: ['Incident', 'CAPA'], due: 'Jun 19', id: 'EVT-REV-03', owner: 'Compliance Officer', progress: 55, title: 'Incident / Adverse Event Review', tone: 'orange', meta: 'Root cause analysis + corrective action evidence', awaitingType: 'action', missing: 'RCA sign-off' },
      { chips: ['Grievance', 'Evidence'], due: 'Jun 22', id: 'EVT-REV-04', owner: 'Risk Manager', progress: 28, title: 'Complaint / Grievance Investigation', tone: 'amber', meta: 'Investigation notes, resolution evidence, follow-up', awaitingType: 'evidence', missing: '3 docs' },
      { chips: ['Audit', 'Action'], due: 'Jun 20', id: 'EVT-REV-05', owner: 'QAPI Nurse', progress: 71, title: 'Medication Reconciliation Audit Review', tone: 'amber', meta: 'Five chart sample + exception findings', awaitingType: 'action', missing: 'DON review' }
    ]
  },
  {
    title: 'Blocked',
    tone: 'orange',
    count: 4,
    cards: [
      { chips: ['Evidence missing'], due: 'May 17', id: 'CES-1232', owner: 'Admin Designee', progress: 28, title: 'TB screening documentation for contract clinicians', tone: 'orange' },
      { chips: ['SLA urgent'], due: 'May 16', id: 'CES-1234', owner: 'Administrator', progress: 22, title: 'Background check results - 2 pending hires', tone: 'orange' }
    ]
  },
  {
    title: 'Certified',
    tone: 'green',
    count: 9,
    cards: []
  }
];

export function buildBoardLanes(snapshot?: any): readonly BoardLaneData[] {
  return FALLBACK_BOARD_LANES;
}

export const FALLBACK_EVENT_LANES: any[] = [];
export function buildEventLanes(snapshot?: any): any[] { return FALLBACK_EVENT_LANES; }

export const FALLBACK_TASK_LANES: any[] = [];
export function buildTaskLanes(snapshot?: any): any[] { return FALLBACK_TASK_LANES; }

export const FALLBACK_CALENDAR_EVENTS: any[] = [];
export function buildCalendarEvents(snapshot?: any): any[] { return FALLBACK_CALENDAR_EVENTS; }

export const FALLBACK_EVIDENCE_ROWS: any[] = [];
export function buildEvidenceRows(snapshot?: any): any[] { return FALLBACK_EVIDENCE_ROWS; }

export const FALLBACK_AUDIT_ROWS: any[] = [];
export function buildAuditRows(snapshot?: any): any[] { return FALLBACK_AUDIT_ROWS; }

export const FALLBACK_REPORT_METRICS: any = { bars: [12,14,18,20,22,25,27,30,33,35], metrics: {} };
export function buildReportMetrics(snapshot?: any): any { return FALLBACK_REPORT_METRICS; }

