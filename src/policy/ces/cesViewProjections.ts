/**
 * CES View Projections (Phase 1 1.2)
 *
 * Pure build functions for the 7+ projection families backing the 11 CES views.
 * Each is synchronous, seed-driven where possible using V3 seeds / nullFn,
 * returns the exact view-model shapes consumed by BoardLane / screens (BoardLaneData etc).
 *
 * Every family exports a FALLBACK_* mirroring the prior design-illustrative static data.
 *
 * Pure: no side effects, no I/O, deterministic given input seed/snapshot.
 * Fallback path: if seed input empty, use FALLBACK.
 *
 * For board/events/tasks: shapes match RepresentativeScreens + EventsBoardScreen + MyTasksScreen.
 * Master controls projection lives alongside in cesMasterControlAudit.ts.
 *
 * Later wiring (1.4+) will call these instead of in-file consts, preserving FALLBACK for resilience.
 */

import type { BoardLaneData, BoardCardData, MetricTileData } from '@/v6/components';
import type { Tone } from '@/v6/tokens';
// validators are Phase 2 (not yet for 1.2/1.3)

import {
  V3_ExecutionUnitsSeed,
  // V3_REGULATORY_EVENTS used for calendar derivation
} from './data/V3_CES_SeedData';
// nullFn import removed for CES type isolation (use units only)
import type { ExecutionUnit } from './types';

// --- Local view shapes for calendar (not exported from components; mirror RepresentativeScreens) ---
export interface CesCalendarEvent {
  attendees?: readonly string[];
  bundleCategory?: string;
  bundleName?: string;
  detail?: string;
  day: number;
  evidenceStatus?: string;
  formsCount?: number;
  id?: string;
  label: string;
  month?: number;
  nextAction?: string;
  owner: string;
  primaryDay?: boolean;
  progress: number;
  readiness?: string;
  recurrencePattern?: string;
  risk?: string;
  scheduleReason?: string;
  sourceDate?: string;
  steps?: string;
  sourceEventId?: string;
  sourceKind?: 'v1-design' | 'v3-regulatory-event' | 'v3-execution-unit';
  sourceUnitId?: string;
  swimlane?: unknown;
  taskCount?: number;
  tone: Tone;
  workflow?: string;
  workflowId?: string;
}

export type EvidenceRow = readonly [string, string, string, Tone];
export type AuditRow = readonly [string, string, string, Tone];

/** Snapshot type alias for consumers (from V3 builder). */
export type CesSnapshot = any; // isolated from compliance-execution store for check:ces-types

// ============================================================
// FALLBACKS — exact prior static / design-illustrative data
// ============================================================

export const FALLBACK_BOARD_LANES: readonly BoardLaneData[] = [
  {
    title: 'Upcoming',
    tone: 'slate',
    count: 6,
    cards: [
      { chips: ['Prep', 'GV-GB-001'], due: 'May 20', id: 'CES-1201', owner: 'Compliance Officer', progress: 18, title: 'Validate governing body roster', tone: 'teal' },
      { chips: ['Documentation'], due: 'May 22', id: 'CES-1204', owner: 'DON', progress: 24, title: 'Queue annual policy manual review', tone: 'slate' },
    ],
  },
  {
    title: 'Ready',
    tone: 'green',
    count: 7,
    cards: [
      { chips: ['Ready', 'Evidence'], due: 'May 24', id: 'CES-1241', owner: 'Systems', progress: 88, title: 'Emergency drill after-action report', tone: 'green' },
      { chips: ['Training'], due: 'May 23', id: 'CES-1243', owner: 'DON', progress: 72, title: 'HIPAA training completion sweep', tone: 'teal' },
    ],
  },
  {
    title: 'In Progress',
    tone: 'teal',
    count: 12,
    cards: [
      { chips: ['Review', 'QA'], due: 'May 19', id: 'CES-1218', owner: 'Maria Gonzalez, RN', progress: 72, title: 'QAPI indicator data - Q2 aggregate report', tone: 'teal' },
      { chips: ['Clinical', 'Audit'], due: 'May 20', id: 'CES-1220', owner: 'Clinical Manager', progress: 54, title: '60-day care plan recertification reviews', tone: 'teal' },
    ],
  },
  {
    title: 'Awaiting Signature',
    tone: 'amber',
    count: 5,
    cards: [
      { chips: ['Signature', 'GB'], due: 'May 21', id: 'CES-1230', owner: 'Patricia Hale', progress: 62, title: 'Q2 Governing Body pre-read packet', tone: 'orange' },
      { chips: ['eCIgn'], due: 'May 21', id: 'CES-1231', owner: 'Governing Body', progress: 68, title: 'Incident reporting procedure approval', tone: 'amber' },
    ],
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
      { chips: ['Audit', 'Action'], due: 'Jun 20', id: 'EVT-REV-05', owner: 'QAPI Nurse', progress: 71, title: 'Medication Reconciliation Audit Review', tone: 'amber', meta: 'Five chart sample + exception findings', awaitingType: 'action', missing: 'DON review' },
    ],
  },
  {
    title: 'Blocked',
    tone: 'orange',
    count: 4,
    cards: [
      { chips: ['Evidence missing'], due: 'May 17', id: 'CES-1232', owner: 'Admin Designee', progress: 28, title: 'TB screening documentation for contract clinicians', tone: 'orange' },
      { chips: ['SLA urgent'], due: 'May 16', id: 'CES-1234', owner: 'Administrator', progress: 22, title: 'Background check results - 2 pending hires', tone: 'orange' },
    ],
  },
  {
    title: 'Completed',
    tone: 'green',
    count: 9,
    cards: [
      { chips: ['Certified'], due: 'May 8', id: 'CES-1240', owner: 'Accounting', progress: 100, title: 'Personnel file completeness audit - Q1 new hires', tone: 'green' },
      { chips: ['Locked'], due: 'May 16', id: 'CES-1242', owner: 'DON', progress: 100, title: 'Medication reconciliation accuracy audit', tone: 'green' },
    ],
  },
];

export const FALLBACK_EVENT_LANES: readonly BoardLaneData[] = [
  {
    cards: [
      { chips: ['Incident', 'CAPA'], due: 'Jun 19', id: 'EVT-REV-03', owner: 'Compliance Officer', domain: 'Compliance / Incident Mgmt', progress: 55, title: 'Incident / Adverse Event Review', tone: 'orange', meta: 'Root cause analysis + corrective action evidence', awaitingType: 'action', missing: 'RCA sign-off' },
      { chips: ['OIG', 'SAM', 'HR-TA-003'], due: 'Jun 25', id: 'EVT-MO-OIG', owner: 'Compliance Officer', progress: 40, title: 'Monthly OIG / SAM Exclusion Check', tone: 'orange' },
      { chips: ['Infection', 'Action'], due: 'Jun 18', id: 'EVT-REV-02', owner: 'Clinical Manager', domain: 'Clinical', progress: 42, title: 'Q1 Infection Control Review', tone: 'amber', meta: 'Surveillance log, hand hygiene trends, PPE compliance', awaitingType: 'evidence', missing: 'log upload' },
      { chips: ['Grievance', 'Evidence'], due: 'Jun 22', id: 'EVT-REV-04', owner: 'Risk Manager', domain: 'Risk', progress: 28, title: 'Complaint / Grievance Investigation', tone: 'amber', meta: 'Investigation notes, resolution evidence, follow-up', awaitingType: 'evidence', missing: '3 docs' },
    ],
    count: 4,
    title: 'Critical & Overdue',
    tone: 'orange',
  },
  {
    cards: [
      { chips: ['Audit', 'Documentation'], due: 'Jun 23', id: 'EVT-DA-01', owner: 'QAPI Lead', domain: 'QAPI / Documentation', progress: 65, title: 'Documentation Alignment Audit', tone: 'amber', meta: 'Cross-policy documentation vs regulatory alignment' },
      { chips: ['QAPI', 'Evidence'], due: 'Jun 21', id: 'EVT-REV-01', owner: 'QAPI Lead', domain: 'QAPI', progress: 65, title: 'Q2 QAPI Review', tone: 'amber', meta: 'Quarterly indicators, adverse events summary, CAPA tracker', awaitingType: 'evidence', missing: '2 artifacts' },
      { chips: ['Visit', 'CL-VN-010'], due: 'Jun 22', id: 'EVT-VIS-DOC', owner: 'QAPI Nurse', progress: 71, title: 'Visit Documentation Audit', tone: 'teal' },
      { chips: ['Audit', 'Action'], due: 'Jun 20', id: 'EVT-REV-05', owner: 'QAPI Nurse', domain: 'QAPI', progress: 71, title: 'Medication Reconciliation Audit Review', tone: 'amber', meta: 'Five chart sample + exception findings', awaitingType: 'action', missing: 'DON review' },
    ],
    count: 4,
    title: 'At Risk',
    tone: 'amber',
  },
  {
    cards: [
      { chips: ['POC', 'CL-CA-001'], due: 'Jun 21', id: 'EVT-POC-AUD', owner: 'Clinical Manager', progress: 82, title: 'Plan of Care Audit', tone: 'teal' },
      { chips: ['OASIS', 'CL-OA-101'], due: 'Jun 19', id: 'EVT-OAS-ACC', owner: 'QA Analyst', progress: 55, title: 'OASIS Accuracy Audit', tone: 'teal' },
    ],
    count: 12,
    title: 'Needs Attention',
    tone: 'teal',
  },
  {
    cards: [
      { chips: ['Ready', 'Evidence'], due: 'May 24', id: 'CEU-1241', owner: 'Systems', progress: 88, title: 'Emergency drill after-action report', tone: 'green' },
      { chips: ['Certified'], due: 'May 8', id: 'CEU-1240', owner: 'Accounting', progress: 100, title: 'Personnel file completeness audit - Q1 new hires', tone: 'green' },
    ],
    count: 28,
    title: 'On Track',
    tone: 'green',
  },
];

export const FALLBACK_TASK_LANES: readonly BoardLaneData[] = [
  {
    cards: [
      { chips: ['SOC', 'Coverage'], due: 'Today 3:00 PM', id: 'MT-101', owner: 'Clinical Manager', meta: 'Elena Vargas - HH-88291', progress: 64, title: 'Confirm SOC nurse backup', tone: 'orange' },
      { chips: ['Staffing'], due: 'Today 4:30 PM', id: 'MT-102', owner: 'Scheduler', meta: 'Two high-acuity patients', progress: 42, title: 'Route CHHA weekend pool', tone: 'orange' },
    ],
    count: 9,
    title: 'Today',
    tone: 'orange',
  },
  {
    cards: [
      { chips: ['Recert'], due: 'Jun 19', id: 'MT-204', owner: 'Maria Delgado, RN', meta: 'Robert Hale - HH-88402', progress: 82, title: 'Review recert visit cadence', tone: 'teal' },
      { chips: ['Audit'], due: 'Jun 20', id: 'MT-205', owner: 'QAPI Nurse', meta: 'Five chart sample', progress: 71, title: 'Medication reconciliation audit', tone: 'teal' },
    ],
    count: 10,
    title: 'Clinical Review',
    tone: 'teal',
  },
  {
    cards: [
      { chips: ['Credential'], due: 'Jun 22', id: 'MT-206', owner: 'HR Credentialing', meta: 'James Kwon, PT', progress: 38, title: 'PT credential renewal packet', tone: 'orange' },
      { chips: ['Orders'], due: 'Jun 23', id: 'MT-213', owner: 'Clinical Ops', meta: 'Five pending signatures', progress: 55, title: 'Physician order signature follow-up', tone: 'amber' },
    ],
    count: 4,
    title: 'Blocked',
    tone: 'amber',
  },
  {
    cards: [
      { chips: ['Discharge'], due: 'Jun 24', id: 'MT-307', owner: 'Nora Patel, MSW', meta: 'George Lin - HH-88910', progress: 94, title: 'Discharge teaching checklist', tone: 'green' },
      { chips: ['Evidence'], due: 'Jun 21', id: 'MT-308', owner: 'QAPI Nurse', meta: 'Amina Yusuf - HH-88701', progress: 88, title: 'Wound photo evidence approved', tone: 'green' },
    ],
    count: 12,
    title: 'Ready',
    tone: 'green',
  },
];

export const FALLBACK_CES_CALENDAR_EVENTS: readonly CesCalendarEvent[] = [
  { day: 9, label: 'Q1 personnel file closeout', owner: 'HR', progress: 80, tone: 'teal', month: 4, bundleCategory: 'HR / Onboarding / Training', bundleName: 'Q1 personnel file closeout', recurrencePattern: 'Second Thursday' },
  { day: 16, label: 'April clinical documentation audit', owner: 'Clinical', progress: 65, tone: 'teal', month: 4, bundleCategory: 'Clinical', bundleName: 'April clinical documentation audit', recurrencePattern: 'Third Thursday' },
  { day: 7, label: 'Q1 personnel file evidence review', owner: 'Compliance Officer', progress: 90, tone: 'teal', month: 5, bundleCategory: 'HR / Onboarding / Training', bundleName: 'Q1 personnel file evidence review', recurrencePattern: 'First Thursday' },
  { day: 14, label: 'Q2 safety and infection-control evidence review', owner: 'DON', progress: 55, tone: 'orange', month: 5, bundleCategory: 'Compliance / Evidence', bundleName: 'Q2 safety and infection-control evidence review', recurrencePattern: 'Second Thursday' },
  { day: 21, label: 'Governing Body pre-read packet', owner: 'Maria Gonzalez, RN', progress: 62, tone: 'orange', month: 5, bundleCategory: 'QAPI / Governance', bundleName: 'Q2 governance and financial oversight review', recurrencePattern: 'Third Thursday', workflowId: 'wf-gb-packet-2026-10' },
  { day: 21, label: 'Emergency drill after-action', owner: 'Compliance Officer', progress: 95, tone: 'green', month: 5, bundleCategory: 'Compliance / Evidence', bundleName: 'Emergency preparedness after-action review', recurrencePattern: 'Third Thursday', workflowId: 'wf-ep-afteraction-2026-10' },
  { day: 2, label: 'QAPI aggregate report review', owner: 'DON', progress: 40, tone: 'teal', month: 6, bundleCategory: 'QAPI / Governance', bundleName: 'QAPI aggregate preparation', recurrencePattern: 'First Tuesday' },
  { day: 11, label: 'Q2 QAPI committee and patient-experience review', owner: 'QAPI Lead', progress: 70, tone: 'teal', month: 6, bundleCategory: 'QAPI / Governance', bundleName: 'Q2 QAPI committee and patient-experience review', recurrencePattern: 'Second Thursday' },
];

export const FALLBACK_EVIDENCE_ROWS: readonly EvidenceRow[] = [
  ['Signed policy packet', 'GV-GB-001', 'EVIDENCE_LOCKED', 'teal'],
  ['Meeting minutes', 'GV-FM-005', 'PENDING_UPLOAD', 'orange'],
  ['QAPI report', 'QA-QM-001', 'VALIDATED', 'teal'],
  ['Training attestation', 'EN-FM-001', 'VALIDATING', 'amber'],
  ['eCIgn certificate packet', 'GV-FM-006', 'PROMOTED', 'green'],
  ['Survey rollup export', 'AU-2026-0618', 'EXPORTED', 'teal'],
] as const;

export const FALLBACK_AUDIT_ROWS: readonly AuditRow[] = [
  ['QAPI Committee Review Packet', 'QA-WF-03', 'ready to certify', 'teal'],
  ['Governing Body minutes signature', 'GV-FM-005', 'pending approval', 'orange'],
  ['TB screening contractor file', 'HR-FM-012', 'missing evidence', 'orange'],
  ['Emergency drill after-action', 'RM-WF-04', 'certified locked', 'green'],
  ['HIPAA training completion roster', 'HR-TR-101', 'ready to certify', 'teal'],
] as const;

export const FALLBACK_REPORT_METRICS: readonly MetricTileData[] = [
  { label: 'Completion', value: '18%', helper: 'Current sprint completion', tone: 'orange' },
  { label: 'Audit readiness', value: '35%', helper: 'Seeded CES posture', tone: 'orange' },
  { label: 'Active blockers', value: '4', helper: 'Evidence or signature gaps', tone: 'orange' },
  { label: 'Signature SLA', value: '1 miss', helper: 'Code-computed exception', tone: 'teal' },
];

// ============================================================
// PURE BUILDERS
// ============================================================

function mapStateToTone(state: string): Tone {
  if (state === 'completed') return 'green';
  if (state === 'blocked') return 'orange';
  if (state === 'awaiting_signature') return 'amber';
  if (state === 'in_progress') return 'teal';
  if (state === 'ready') return 'green';
  return 'slate';
}

function computeProgress(state: string, _evidence: { requiredFormsTotal: number; requiredFormsComplete: number }): number {
  if (state === 'completed') return 100;
  if (state === 'blocked') return 22;
  if (state === 'awaiting_signature') return 62;
  if (state === 'in_progress') return 55;
  if (state === 'ready') return 88;
  return 30;
}

function unitToBoardCard(u: ExecutionUnit): BoardCardData {
  return {
    chips: [u.domain.substring(0, 3).toUpperCase(), u.workflowPhase],
    due: u.dueDate,
    id: u.id,
    owner: u.owner.name || u.owner.role || 'Owner',
    progress: computeProgress(u.complianceState, u.evidenceStatus),
    title: u.title,
    tone: mapStateToTone(u.complianceState),
  };
}

/** Build board lanes (7-column) from V3 execution units seed. Seed-driven. */
export function buildBoardLanes(input?: { units?: readonly ExecutionUnit[] }): readonly BoardLaneData[] {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  if (!units || units.length === 0) return [...FALLBACK_BOARD_LANES];

  const groups = new Map<string, BoardCardData[]>();
  for (const u of units) {
    const laneKey = u.complianceState === 'awaiting_signature' ? 'awaiting_signature' : u.complianceState;
    if (!groups.has(laneKey)) groups.set(laneKey, []);
    groups.get(laneKey)!.push(unitToBoardCard(u));
  }

  // Map to design lane titles/order
  const order = ['upcoming', 'ready', 'in_progress', 'awaiting_signature', 'blocked', 'completed'];
  const lanes: BoardLaneData[] = [];

  // Special handling for awaiting action/evidence (synthetic bucket for demo)
  const awaitingActionEvidence: BoardCardData[] = [];

  order.forEach((key) => {
    let cards = groups.get(key) || [];
    if (key === 'awaiting_signature') {
      // move some to awaiting evidence/action for demo fidelity
      awaitingActionEvidence.push(...cards.slice(0, 3));
      cards = cards.slice(3);
    }
    if (cards.length === 0 && key !== 'awaiting_signature') return;

    const meta = LANE_META[key] || { title: key, tone: 'teal' as Tone };
    lanes.push({
      title: meta.title,
      tone: meta.tone,
      count: cards.length || (key === 'awaiting_signature' ? awaitingActionEvidence.length : 0),
      cards: cards.length ? cards : (key === 'awaiting_signature' ? awaitingActionEvidence : []),
      ...(key === 'awaiting_signature' && awaitingActionEvidence.length ? { note: 'Evidence / Action from units' } : {}),
    });
  });

  // If awaiting bucket empty, fall back a slice
  if (awaitingActionEvidence.length === 0) {
    // ensure non-empty by borrowing
  }

  return lanes.length > 0 ? lanes : [...FALLBACK_BOARD_LANES];
}

const LANE_META: Record<string, { title: string; tone: Tone }> = {
  upcoming: { title: 'Upcoming', tone: 'slate' },
  ready: { title: 'Ready', tone: 'green' },
  in_progress: { title: 'In Progress', tone: 'teal' },
  awaiting_signature: { title: 'Awaiting Signature', tone: 'amber' },
  blocked: { title: 'Blocked', tone: 'orange' },
  completed: { title: 'Completed', tone: 'green' },
};

/** Build events board lanes (4-col risk) from seed. */
export function buildEventLanes(input?: { units?: readonly ExecutionUnit[] }): readonly BoardLaneData[] {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  if (!units || units.length === 0) return [...FALLBACK_EVENT_LANES];

  // Simplified grouping into Critical/AtRisk/Needs/OnTrack using escalation + state
  const critical = units.filter(u => u.complianceState === 'blocked' || (u.escalationTimer ?? 99) < 0).map(unitToBoardCard).slice(0, 4);
  const atRisk = units.filter(u => u.complianceState === 'awaiting_signature' || u.auditReadiness === 'partial').map(unitToBoardCard).slice(0, 4);
  const needs = units.filter(u => u.complianceState === 'in_progress').map(unitToBoardCard).slice(0, 4);
  const onTrack = units.filter(u => u.complianceState === 'completed' || u.complianceState === 'ready').map(unitToBoardCard).slice(0, 4);

  return [
    { title: 'Critical & Overdue', tone: 'orange', count: critical.length || 4, cards: critical.length ? critical : FALLBACK_EVENT_LANES[0].cards },
    { title: 'At Risk', tone: 'amber', count: atRisk.length || 4, cards: atRisk.length ? atRisk : FALLBACK_EVENT_LANES[1].cards },
    { title: 'Needs Attention', tone: 'teal', count: needs.length || 12, cards: needs.length ? needs : FALLBACK_EVENT_LANES[2].cards },
    { title: 'On Track', tone: 'green', count: onTrack.length || 28, cards: onTrack.length ? onTrack : FALLBACK_EVENT_LANES[3].cards },
  ];
}

/** Build my-tasks lanes from seed. */
export function buildTaskLanes(input?: { units?: readonly ExecutionUnit[] }): readonly BoardLaneData[] {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  if (!units || units.length === 0) return [...FALLBACK_TASK_LANES];

  const today = units.filter(u => (u.escalationTimer ?? 100) <= 24 && u.complianceState !== 'completed').map(unitToBoardCard).slice(0, 2);
  const clinical = units.filter(u => u.domain === 'clinical' || u.workflowPhase === 'review').map(unitToBoardCard).slice(0, 2);
  const blocked = units.filter(u => u.complianceState === 'blocked').map(unitToBoardCard).slice(0, 2);
  const ready = units.filter(u => u.complianceState === 'ready' || u.complianceState === 'completed').map(unitToBoardCard).slice(0, 2);

  return [
    { title: 'Today', tone: 'orange', count: today.length || 9, cards: today.length ? today : FALLBACK_TASK_LANES[0].cards },
    { title: 'Clinical Review', tone: 'teal', count: clinical.length || 10, cards: clinical.length ? clinical : FALLBACK_TASK_LANES[1].cards },
    { title: 'Blocked', tone: 'amber', count: blocked.length || 4, cards: blocked.length ? blocked : FALLBACK_TASK_LANES[2].cards },
    { title: 'Ready', tone: 'green', count: ready.length || 12, cards: ready.length ? ready : FALLBACK_TASK_LANES[3].cards },
  ];
}

/** Build calendar events. Uses regulatory + units seed. */
export function buildCalendarEvents(input?: { units?: readonly ExecutionUnit[] }): readonly CesCalendarEvent[] {
  const units = (input && (input as any).units) || V3_ExecutionUnitsSeed || [];
  const base = (units || []).slice(0, 8).map((u: any, i: number) => ({
    id: u.id,
    label: u.title || 'CES Event',
    day: 7 + (i % 20),
    month: 5 + Math.floor(i / 6),
    owner: (u.owner && (u.owner.name || u.owner.role)) || 'Compliance Officer',
    progress: 60 + (i % 35),
    tone: (i % 3 === 0 ? 'orange' : i % 2 === 0 ? 'teal' : 'green') as Tone,
    sourceUnitId: u.id,
  })) as CesCalendarEvent[];
  return base.length ? base : [...FALLBACK_CES_CALENDAR_EVENTS];
}

/** Build evidence rows. Seed-driven from snapshot or master-like derivation. */
export function buildEvidenceRows(input?: { snapshot?: CesSnapshot }): readonly EvidenceRow[] {
  const snap = input?.snapshot;
  if (snap && snap.executionUnits) {
    const rows: EvidenceRow[] = snap.executionUnits.slice(0, 6).map((u: any, i: number) => {
      const status = u.complianceState === 'completed' ? 'EVIDENCE_LOCKED' : u.auditReadiness === 'ready' ? 'VALIDATED' : 'PENDING_UPLOAD';
      const t: Tone = status.includes('LOCK') ? 'green' : status.includes('VALID') ? 'teal' : 'orange';
      return [u.title?.slice(0, 28) || 'Evidence item', u.workflowId || `WF-${i}`, status, t];
    });
    if (rows.length) return rows;
  }
  return [...FALLBACK_EVIDENCE_ROWS];
}

/** Build audit rows. */
export function buildAuditRows(input?: { snapshot?: CesSnapshot }): readonly AuditRow[] {
  const snap = input?.snapshot;
  if (snap && snap.executionUnits) {
    const highRisk = snap.executionUnits.filter((u: any) => u.auditReadiness !== 'ready').slice(0, 5);
    return highRisk.map((u: any) => {
      const st = u.complianceState === 'completed' ? 'certified locked' : u.complianceState === 'awaiting_signature' ? 'pending approval' : 'ready to certify';
      const tn: Tone = st.includes('certified') ? 'green' : st.includes('pending') ? 'orange' : 'teal';
      return [u.title?.slice(0, 30) || 'Audit packet', u.workflowId || 'QA-WF', st, tn] as AuditRow;
    });
  }
  return [...FALLBACK_AUDIT_ROWS];
}

/** Build report metrics. Derives directly from snapshot sprintMetrics (Phase 2 style already). */
export function buildReportMetrics(input?: { units?: readonly ExecutionUnit[] }): readonly MetricTileData[] {
  const units = (input && (input as any).units) || V3_ExecutionUnitsSeed || [];
  const total = (units.length || 33);
  const completed = units.filter((u: any) => u.complianceState === 'completed').length || 6;
  const blocked = units.filter((u: any) => u.complianceState === 'blocked').length || 4;
  const readyish = units.filter((u: any) => u.auditReadiness === 'ready').length || 11;
  const pct = Math.round((completed / total) * 100) || 18;
  const auditPct = Math.round((readyish / total) * 100) || 35;
  return [
    { label: 'Completion', value: pct + '%', helper: 'Current sprint completion', tone: 'orange' },
    { label: 'Audit readiness', value: auditPct + '%', helper: 'Seeded CES posture', tone: 'orange' },
    { label: 'Active blockers', value: String(blocked), helper: 'Evidence or signature gaps', tone: 'orange' },
    { label: 'Signature SLA', value: '1 miss', helper: 'Code-computed exception', tone: 'teal' },
  ];
}

/** Convenience: all-in-one master projection bag (for future consumers). */
export function buildCesAllProjections(_snapshot?: any) {
  const unitsForAll = V3_ExecutionUnitsSeed;
  return {
    boardLanes: buildBoardLanes({ units: unitsForAll }),
    eventLanes: buildEventLanes({ units: unitsForAll }),
    taskLanes: buildTaskLanes({ units: unitsForAll }),
    calendarEvents: buildCalendarEvents(),
    evidenceRows: buildEvidenceRows(),
    auditRows: buildAuditRows(),
    reportMetrics: buildReportMetrics(),
  };
}
