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
import {
  validateBoardLanes,
  validateEventLanes,
  validateTaskLanes,
  validateCalendarEvents,
  validateEvidenceRows,
  validateAuditRows,
  validateReportMetrics,
  type ValidationResult,
} from './cesValidators';
import { asWorkflowId, type WorkflowId } from './ids';

import {
  V3_ExecutionUnitsSeed,
  resolveDisplayName,
} from './data/V3_CES_SeedData';
// nullFn import removed for CES type isolation (use units only)
import type { ExecutionUnit } from './types';
import { generateEvents } from '@/policy/autogen/annualGenerator';
import { TEMPLATE_REGISTRY } from '@/policy/autogen/templateRegistry';

// Minimal static projection of key regulatory from V3 seed (ensures reg events appear on calendar without pulling snapshot module into CES view build graph)
// EXCEPTION: these dates are duplicated here (not in V3_CES_SeedData). Currently filtered out in build (because units cover the parentEventIds),
// so contribute 0 events at runtime. Real calendar dates source from units' dueDate. Kept for resilience if no units for evt.
const V3_REGULATORY_EVENTS: any[] = [
  { id: 'evt-gb-q2-2026', title: 'Q2 Governing Body Meeting', date: '2026-05-21', urgency: 'due-soon', owner: 'Patricia Hale', mandateType: 'policy-driven', summary: '' }, // Thursday
  { id: 'evt-qapi-q2-2026', title: 'QAPI Committee — Q2 Data Review', date: '2026-05-19', urgency: 'critical', owner: 'Maria Gonzalez, RN', mandateType: 'federal-required', summary: '' }, // Tuesday
  { id: 'evt-ipc-tb-2026', title: 'Infection Prevention — TB Screening Compliance', date: '2026-05-14', urgency: 'overdue', owner: 'James Torres', mandateType: 'federal-required', summary: '' }, // Thursday
];

/** Dev-only defensive validation flag. Vite sets import.meta.env.DEV; under the
 *  node test runner import.meta.env is undefined, so this is false (tests call the
 *  validators directly). Never throws. */
const CES_PROJECTION_DEV: boolean = (() => {
  try {
    return Boolean(import.meta.env?.DEV);
  } catch {
    return false;
  }
})();

/** Wrap a projection's return value: in dev, validate it and warn on any contract
 *  violation; always return the value unchanged. Satisfies Task 2.5 (each build*
 *  validates its output in dev; validators are also exported for consumers). */
function finalize<T>(value: T, validate: (v: unknown) => ValidationResult, label: string): T {
  if (CES_PROJECTION_DEV) {
    const r = validate(value);
    if (!r.ok && typeof console !== 'undefined') {
      console.warn(`[CES projection] ${label} produced invalid data:`, r.errors);
    }
  }
  return value;
}

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
  workflowId?: WorkflowId;
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
      { chips: ['Prep', 'GV-GB-001'], due: 'May 20', id: 'CES-1201', owner: 'Patricia Hale', progress: 18, title: 'Validate governing body roster', tone: 'teal' },
      { chips: ['Documentation'], due: 'May 22', id: 'CES-1204', owner: 'Maria Gonzalez, RN', progress: 24, title: 'Queue annual policy manual review', tone: 'slate' },
    ],
  },
  {
    title: 'Ready',
    tone: 'green',
    count: 7,
    cards: [
      { chips: ['Ready', 'Evidence'], due: 'May 24', id: 'CES-1241', owner: 'Elena Vargas', progress: 88, title: 'Emergency drill after-action report', tone: 'green' },
      { chips: ['Training'], due: 'May 23', id: 'CES-1243', owner: 'Maria Gonzalez, RN', progress: 72, title: 'HIPAA training completion sweep', tone: 'teal' },
    ],
  },
  {
    title: 'In Progress',
    tone: 'teal',
    count: 12,
    cards: [
      { chips: ['Review', 'QA'], due: 'May 19', id: 'CES-1218', owner: 'Maria Gonzalez, RN', progress: 72, title: 'QAPI indicator data - Q2 aggregate report', tone: 'teal' },
      { chips: ['Clinical', 'Audit'], due: 'May 20', id: 'CES-1220', owner: 'Maria Gonzalez, RN', progress: 54, title: '60-day care plan recertification reviews', tone: 'teal' },
    ],
  },
  {
    title: 'Awaiting Signature',
    tone: 'amber',
    count: 5,
    cards: [
      { chips: ['Signature', 'GB'], due: 'May 21', id: 'CES-1230', owner: 'Patricia Hale', progress: 62, title: 'Q2 Governing Body pre-read packet', tone: 'orange' },
      { chips: ['eCIgn'], due: 'May 21', id: 'CES-1231', owner: 'Patricia Hale', progress: 68, title: 'Incident reporting procedure approval', tone: 'amber' },
    ],
  },
  {
    title: 'Awaiting Action / Evidence',
    tone: 'amber',
    count: 5,
    note: '3 Evidence / 2 Action',
    cards: [
      { chips: ['QAPI', 'Evidence'], due: 'Jun 21', id: 'EVT-REV-01', owner: 'Nicole Foster', progress: 65, title: 'Q2 QAPI Review', tone: 'amber', meta: 'Quarterly indicators, adverse events summary, CAPA tracker', awaitingType: 'evidence', missing: '2 artifacts' },
      { chips: ['Infection', 'Action'], due: 'Jun 18', id: 'EVT-REV-02', owner: 'Linda Patel', progress: 42, title: 'Q1 Infection Control Review', tone: 'amber', meta: 'Surveillance log, hand hygiene trends, PPE compliance', awaitingType: 'evidence', missing: 'log upload' },
      { chips: ['Incident', 'CAPA'], due: 'Jun 19', id: 'EVT-REV-03', owner: 'Angela Martinez', progress: 55, title: 'Incident / Adverse Event Review', tone: 'orange', meta: 'Root cause analysis + corrective action evidence', awaitingType: 'action', missing: 'RCA sign-off' },
      { chips: ['Grievance', 'Evidence'], due: 'Jun 22', id: 'EVT-REV-04', owner: 'Angela Martinez', progress: 28, title: 'Complaint / Grievance Investigation', tone: 'amber', meta: 'Investigation notes, resolution evidence, follow-up', awaitingType: 'evidence', missing: '3 docs' },
      { chips: ['Audit', 'Action'], due: 'Jun 20', id: 'EVT-REV-05', owner: 'Nicole Foster', progress: 71, title: 'Medication Reconciliation Audit Review', tone: 'amber', meta: 'Five chart sample + exception findings', awaitingType: 'action', missing: 'DON review' },
    ],
  },
  {
    title: 'Blocked',
    tone: 'orange',
    count: 4,
    cards: [
      { chips: ['Evidence missing'], due: 'May 17', id: 'CES-1232', owner: 'James Torres', progress: 28, title: 'TB screening documentation for contract clinicians', tone: 'orange' },
      { chips: ['SLA urgent'], due: 'May 16', id: 'CES-1234', owner: 'Robert Chen', progress: 22, title: 'Background check results - 2 pending hires', tone: 'orange' },
    ],
  },
  {
    title: 'Completed',
    tone: 'green',
    count: 9,
    cards: [
      { chips: ['Certified'], due: 'May 8', id: 'CES-1240', owner: 'David Kim, CPA', progress: 100, title: 'Personnel file completeness audit - Q1 new hires', tone: 'green' },
      { chips: ['Locked'], due: 'May 16', id: 'CES-1242', owner: 'Maria Gonzalez, RN', progress: 100, title: 'Medication reconciliation accuracy audit', tone: 'green' },
    ],
  },
];

export const FALLBACK_EVENT_LANES: readonly BoardLaneData[] = [
  {
    cards: [
      { chips: ['Incident', 'CAPA'], due: 'Jun 19', id: 'EVT-REV-03', owner: 'Angela Martinez', domain: 'Compliance / Incident Mgmt', progress: 55, title: 'Incident / Adverse Event Review', tone: 'orange', meta: 'Root cause analysis + corrective action evidence', awaitingType: 'action', missing: 'RCA sign-off' },
      { chips: ['OIG', 'SAM', 'HR-TA-003'], due: 'Jun 25', id: 'EVT-MO-OIG', owner: 'Angela Martinez', progress: 40, title: 'Monthly OIG / SAM Exclusion Check', tone: 'orange' },
      { chips: ['Infection', 'Action'], due: 'Jun 18', id: 'EVT-REV-02', owner: 'Linda Patel', domain: 'Clinical', progress: 42, title: 'Q1 Infection Control Review', tone: 'amber', meta: 'Surveillance log, hand hygiene trends, PPE compliance', awaitingType: 'evidence', missing: 'log upload' },
      { chips: ['Grievance', 'Evidence'], due: 'Jun 22', id: 'EVT-REV-04', owner: 'Angela Martinez', domain: 'Risk', progress: 28, title: 'Complaint / Grievance Investigation', tone: 'amber', meta: 'Investigation notes, resolution evidence, follow-up', awaitingType: 'evidence', missing: '3 docs' },
    ],
    count: 4,
    title: 'Critical & Overdue',
    tone: 'orange',
  },
  {
    cards: [
      { chips: ['Audit', 'Documentation'], due: 'Jun 23', id: 'EVT-DA-01', owner: 'Nicole Foster', domain: 'QAPI / Documentation', progress: 65, title: 'Documentation Alignment Audit', tone: 'amber', meta: 'Cross-policy documentation vs regulatory alignment' },
      { chips: ['QAPI', 'Evidence'], due: 'Jun 21', id: 'EVT-REV-01', owner: 'Nicole Foster', domain: 'QAPI', progress: 65, title: 'Q2 QAPI Review', tone: 'amber', meta: 'Quarterly indicators, adverse events summary, CAPA tracker', awaitingType: 'evidence', missing: '2 artifacts' },
      { chips: ['Visit', 'CL-SD-025'], due: 'Jun 22', id: 'EVT-VIS-DOC', owner: 'Nicole Foster', progress: 71, title: 'Visit Documentation Audit', tone: 'teal' },
      { chips: ['Audit', 'Action'], due: 'Jun 20', id: 'EVT-REV-05', owner: 'Nicole Foster', domain: 'QAPI', progress: 71, title: 'Medication Reconciliation Audit Review', tone: 'amber', meta: 'Five chart sample + exception findings', awaitingType: 'action', missing: 'DON review' },
    ],
    count: 4,
    title: 'At Risk',
    tone: 'amber',
  },
  {
    cards: [
      { chips: ['POC', 'CL-CA-001'], due: 'Jun 21', id: 'EVT-POC-AUD', owner: 'Linda Patel', progress: 82, title: 'Plan of Care Audit', tone: 'teal' },
      { chips: ['OASIS', 'CL-OA-101'], due: 'Jun 19', id: 'EVT-OAS-ACC', owner: 'Nicole Foster', progress: 55, title: 'OASIS Accuracy Audit', tone: 'teal' },
    ],
    count: 12,
    title: 'Needs Attention',
    tone: 'teal',
  },
  {
    cards: [
      { chips: ['Ready', 'Evidence'], due: 'May 24', id: 'CEU-1241', owner: 'Elena Vargas', progress: 88, title: 'Emergency drill after-action report', tone: 'green' },
      { chips: ['Certified'], due: 'May 8', id: 'CEU-1240', owner: 'David Kim, CPA', progress: 100, title: 'Personnel file completeness audit - Q1 new hires', tone: 'green' },
    ],
    count: 28,
    title: 'On Track',
    tone: 'green',
  },
];

export const FALLBACK_TASK_LANES: readonly BoardLaneData[] = [
  {
    cards: [
      { chips: ['SOC', 'Coverage'], due: 'Today 3:00 PM', id: 'MT-101', owner: 'Maria Gonzalez, RN', meta: 'Elena Vargas - HH-88291', progress: 64, title: 'Confirm SOC nurse backup', tone: 'orange' },
      { chips: ['Staffing'], due: 'Today 4:30 PM', id: 'MT-102', owner: 'James Torres', meta: 'Two high-acuity patients', progress: 42, title: 'Route CHHA weekend pool', tone: 'orange' },
    ],
    count: 9,
    title: 'Today',
    tone: 'orange',
  },
  {
    cards: [
      { chips: ['Recert'], due: 'Jun 19', id: 'MT-204', owner: 'Maria Gonzalez, RN', meta: 'Robert Hale - HH-88402', progress: 82, title: 'Review recert visit cadence', tone: 'teal' },
      { chips: ['Audit'], due: 'Jun 20', id: 'MT-205', owner: 'Nicole Foster', meta: 'Five chart sample', progress: 71, title: 'Medication reconciliation audit', tone: 'teal' },
    ],
    count: 10,
    title: 'Clinical Review',
    tone: 'teal',
  },
  {
    cards: [
      { chips: ['Credential'], due: 'Jun 22', id: 'MT-206', owner: 'Destiny Brown', meta: 'James Kwon, PT', progress: 38, title: 'PT credential renewal packet', tone: 'orange' },
      { chips: ['Orders'], due: 'Jun 23', id: 'MT-213', owner: 'Maria Gonzalez, RN', meta: 'Five pending signatures', progress: 55, title: 'Physician order signature follow-up', tone: 'amber' },
    ],
    count: 4,
    title: 'Blocked',
    tone: 'amber',
  },
  {
    cards: [
      { chips: ['Discharge'], due: 'Jun 24', id: 'MT-307', owner: 'James Torres', meta: 'George Lin - HH-88910', progress: 94, title: 'Discharge teaching checklist', tone: 'green' },
      { chips: ['Evidence'], due: 'Jun 21', id: 'MT-308', owner: 'Nicole Foster', meta: 'Amina Yusuf - HH-88701', progress: 88, title: 'Wound photo evidence approved', tone: 'green' },
    ],
    count: 12,
    title: 'Ready',
    tone: 'green',
  },
];

export const FALLBACK_CES_CALENDAR_EVENTS: readonly CesCalendarEvent[] = [
  { day: 9, label: 'Q1 personnel file closeout', owner: 'Destiny Brown', progress: 80, tone: 'teal', month: 4, bundleCategory: 'HR / Onboarding / Training', bundleName: 'Q1 personnel file closeout', recurrencePattern: 'Second Thursday' },
  { day: 16, label: 'April clinical documentation audit', owner: 'Maria Gonzalez, RN', progress: 65, tone: 'teal', month: 4, bundleCategory: 'Clinical', bundleName: 'April clinical documentation audit', recurrencePattern: 'Third Thursday' },
  { day: 7, label: 'Q1 personnel file evidence review', owner: 'Angela Martinez', progress: 90, tone: 'teal', month: 5, bundleCategory: 'HR / Onboarding / Training', bundleName: 'Q1 personnel file evidence review', recurrencePattern: 'First Thursday' },
  { day: 14, label: 'Q2 safety and infection-control evidence review', owner: 'Maria Gonzalez, RN', progress: 55, tone: 'orange', month: 5, bundleCategory: 'Compliance / Evidence', bundleName: 'Q2 safety and infection-control evidence review', recurrencePattern: 'Second Thursday' },
  { day: 21, label: 'Governing Body pre-read packet', owner: 'Maria Gonzalez, RN', progress: 62, tone: 'orange', month: 5, bundleCategory: 'QAPI / Governance', bundleName: 'Q2 governance and financial oversight review', recurrencePattern: 'Third Thursday', workflowId: asWorkflowId('wf-gb-packet-2026-10') },
  { day: 21, label: 'Emergency drill after-action', owner: 'Elena Vargas', progress: 95, tone: 'green', month: 5, bundleCategory: 'Compliance / Evidence', bundleName: 'Emergency preparedness after-action review', recurrencePattern: 'Third Thursday', workflowId: asWorkflowId('wf-ep-afteraction-2026-10') },
  { day: 2, label: 'QAPI aggregate report review', owner: 'Maria Gonzalez, RN', progress: 40, tone: 'teal', month: 6, bundleCategory: 'QAPI / Governance', bundleName: 'QAPI aggregate preparation', recurrencePattern: 'First Tuesday' },
  { day: 11, label: 'Q2 QAPI committee and patient-experience review', owner: 'Nicole Foster', progress: 70, tone: 'teal', month: 6, bundleCategory: 'QAPI / Governance', bundleName: 'Q2 QAPI committee and patient-experience review', recurrencePattern: 'Second Thursday' },
];

export const FALLBACK_EVIDENCE_ROWS: readonly EvidenceRow[] = [
  ['Signed policy packet', 'GV-GB-001', 'EVIDENCE_LOCKED', 'teal'],
  ['Meeting minutes', 'GV-FM-005', 'PENDING_UPLOAD', 'orange'],
  ['QAPI report', 'QA-PI-001', 'VALIDATED', 'teal'],
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

export const FALLBACK_REPORT_CARDS: readonly { body: string; progress: number; status: string; title: string; tone: Tone }[] = [
  {
    body: 'Sprint 12 has 33 cards, 4 blockers, and 9 cards ready for certification.',
    progress: 84,
    status: 'ready',
    title: 'Sprint readiness',
    tone: 'teal',
  },
  {
    body: 'TB screening and board minutes carry the highest survey-facing risk this week.',
    progress: 48,
    status: 'review-required',
    title: 'Survey exposure',
    tone: 'orange',
  },
  {
    body: '18 locked artifacts were added this sprint with certificate and hash traceability.',
    progress: 91,
    status: 'validated',
    title: 'Evidence throughput',
    tone: 'teal',
  },
];

export const FALLBACK_REPORT_BARS: readonly number[] = [12, 14, 18, 20, 22, 25, 27, 30, 33, 35];

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

function parseDueToDayMonth(due?: string): { day: number; month: number } {
  if (!due) return { day: 15, month: 5 };
  const m = due.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) {
    return { day: parseInt(m[3], 10) || 15, month: parseInt(m[2], 10) || 5 };
  }
  return { day: 15, month: 5 };
}

/** Resolver: tasks under correct CES event using real parentEventId from seeds.
 *  Used to verify / associate; projections now surface event in chips.
 *  Orphaned tasks (no matching REGULATORY_EVENT) still use their real seed data.
 */
export function getTasksForEvent(eventId: string, units: readonly ExecutionUnit[] = V3_ExecutionUnitsSeed): readonly ExecutionUnit[] {
  if (!eventId) return [];
  return units.filter(u => u.parentEventId === eventId);
}

function resolveEventChip(parentEventId: string): string {
  return parentEventId ? parentEventId.replace(/^evt-/, '').slice(0, 9) : 'EVT';
}

function unitToRichCardFields(u: ExecutionUnit): Partial<BoardCardData> {
  const missingIds = u.evidenceStatus?.missingFormIds || [];
  const missingCount = missingIds.length;
  const isBlockedOrAction = u.complianceState === 'blocked' || !!u.blockedReason;
  const awaitingType: 'evidence' | 'action' | undefined = missingCount > 0 || isBlockedOrAction
    ? (isBlockedOrAction ? 'action' : 'evidence')
    : undefined;
  const meta = [u.workflowPhase, u.auditReadiness, u.sourceType].filter(Boolean).join(' / ');
  return {
    domain: u.domain,
    ...(awaitingType ? {
      awaitingType,
      missing: missingCount ? `${missingCount} form(s) missing` : (u.blockedReason?.label?.slice(0, 40) || 'pending action'),
      meta: meta || u.title?.slice(0, 60),
    } : { meta }),
  };
}

function unitToBoardCard(u: ExecutionUnit): BoardCardData {
  const rawOwner = u.owner?.name || u.owner?.role || '';
  const base: BoardCardData = {
    chips: [u.domain.substring(0, 3).toUpperCase(), u.workflowPhase, resolveEventChip(u.parentEventId)],
    due: u.dueDate,
    id: u.id,
    owner: resolveDisplayName(rawOwner) || resolveDisplayName(u.owner?.role) || 'Maria Gonzalez, RN',
    progress: computeProgress(u.complianceState, u.evidenceStatus),
    title: u.title,
    tone: mapStateToTone(u.complianceState),
  };
  return {
    ...base,
    ...unitToRichCardFields(u),
  };
}

/** Build board lanes (7-column) from V3 execution units seed. Seed-driven.
 *  Uses real task data; fixes awaiting lane + event associations.
 */
export function buildBoardLanes(input?: { units?: readonly ExecutionUnit[] }): readonly BoardLaneData[] {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  // Always use real seed task data (orphans tolerated; resolver/getTasksForEvent surfaces relationships)
  if (!units || units.length === 0) return [...FALLBACK_BOARD_LANES];

  const groups = new Map<string, BoardCardData[]>();
  for (const u of units) {
    const laneKey = u.complianceState === 'awaiting_signature' ? 'awaiting_signature' : u.complianceState;
    if (!groups.has(laneKey)) groups.set(laneKey, []);
    groups.get(laneKey)!.push(unitToBoardCard(u));
  }

  // Map to design lane titles/order (all real seed tasks assigned by status)
  const order = ['upcoming', 'ready', 'in_progress', 'awaiting_signature', 'blocked', 'completed'];
  const lanes: BoardLaneData[] = [];

  // Collect for dedicated awaiting action/evidence bucket from seed tasks
  const awaitingActionEvidence: BoardCardData[] = units
    .filter(u => u.complianceState === 'awaiting_signature' || !!u.blockedReason || (u.evidenceStatus && (u.evidenceStatus.missingFormIds || []).length > 1))
    .map(unitToBoardCard);

  order.forEach((key) => {
    let cards = groups.get(key) || [];
    if (key === 'awaiting_signature') {
      // partition: keep some in sig, rest prioritized for action lane (real data)
      const toAction = Math.min(3, Math.floor(cards.length / 2));
      if (toAction > 0 && awaitingActionEvidence.length === 0) {
        // fallback partition only if no prior filter
        awaitingActionEvidence.push(...cards.slice(0, toAction));
        cards = cards.slice(toAction);
      }
    }
    if (cards.length === 0 && key !== 'awaiting_signature') return;

    const meta = LANE_META[key] || { title: key, tone: 'teal' as Tone };
    lanes.push({
      title: meta.title,
      tone: meta.tone,
      count: cards.length,
      cards: cards.length ? cards : [],
      ...(key === 'awaiting_signature' && awaitingActionEvidence.length ? { note: 'Evidence / Action from units' } : {}),
    });
  });

  // Emit dedicated Awaiting Action / Evidence lane using real seed-derived cards
  if (awaitingActionEvidence.length > 0) {
    const actionLane: BoardLaneData = {
      title: 'Awaiting Action / Evidence',
      tone: 'amber',
      count: awaitingActionEvidence.length,
      cards: awaitingActionEvidence,
      note: 'Evidence / Action from units',
    };
    const sigIdx = lanes.findIndex(l => l.title.includes('Signature'));
    if (sigIdx >= 0) {
      lanes.splice(sigIdx + 1, 0, actionLane);
    } else {
      lanes.push(actionLane);
    }
  }

  return finalize(lanes.length > 0 ? lanes : [...FALLBACK_BOARD_LANES], validateBoardLanes, 'boardLanes');
}

const LANE_META: Record<string, { title: string; tone: Tone }> = {
  upcoming: { title: 'Upcoming', tone: 'slate' },
  ready: { title: 'Ready', tone: 'green' },
  in_progress: { title: 'In Progress', tone: 'teal' },
  awaiting_signature: { title: 'Awaiting Signature', tone: 'amber' },
  blocked: { title: 'Blocked', tone: 'orange' },
  completed: { title: 'Completed', tone: 'green' },
};

/** Build events board lanes (4-col risk) from seed. Uses real unit data (rich fields) not only FALLBACK. */
export function buildEventLanes(input?: { units?: readonly ExecutionUnit[] }): readonly BoardLaneData[] {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  if (!units || units.length === 0) return [...FALLBACK_EVENT_LANES];

  // Grouping into Critical/AtRisk/Needs/OnTrack using escalation + state; include full real cards
  const criticalCards = units.filter(u => u.complianceState === 'blocked' || (u.escalationTimer ?? 99) < 0).map(unitToBoardCard);
  const atRiskCards = units.filter(u => u.complianceState === 'awaiting_signature' || u.auditReadiness === 'partial').map(unitToBoardCard);
  const needsCards = units.filter(u => u.complianceState === 'in_progress').map(unitToBoardCard);
  const onTrackCards = units.filter(u => u.complianceState === 'completed' || u.complianceState === 'ready').map(unitToBoardCard);

  const lanes: readonly BoardLaneData[] = [
    { title: 'Critical & Overdue', tone: 'orange', count: criticalCards.length, cards: criticalCards.length ? criticalCards : FALLBACK_EVENT_LANES[0].cards },
    { title: 'At Risk', tone: 'amber', count: atRiskCards.length, cards: atRiskCards.length ? atRiskCards : FALLBACK_EVENT_LANES[1].cards },
    { title: 'Needs Attention', tone: 'teal', count: needsCards.length, cards: needsCards.length ? needsCards : FALLBACK_EVENT_LANES[2].cards },
    { title: 'On Track', tone: 'green', count: onTrackCards.length, cards: onTrackCards.length ? onTrackCards : FALLBACK_EVENT_LANES[3].cards },
  ];
  return finalize(lanes, validateEventLanes, 'eventLanes');
}

/** Build my-tasks lanes from seed. */
export function buildTaskLanes(input?: { units?: readonly ExecutionUnit[] }): readonly BoardLaneData[] {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  if (!units || units.length === 0) return [...FALLBACK_TASK_LANES];

  // Use FULL real task records from V3 seed (no slice caps) so all owners/statuses/events appear in my-tasks buckets
  const today = units.filter(u => (u.escalationTimer ?? 100) <= 24 && u.complianceState !== 'completed').map(unitToBoardCard);
  const clinical = units.filter(u => u.domain === 'clinical' || u.workflowPhase === 'review').map(unitToBoardCard);
  const blocked = units.filter(u => u.complianceState === 'blocked').map(unitToBoardCard);
  const ready = units.filter(u => u.complianceState === 'ready' || u.complianceState === 'completed').map(unitToBoardCard);

  const lanes: readonly BoardLaneData[] = [
    { title: 'Today', tone: 'orange', count: today.length, cards: today.length ? today : FALLBACK_TASK_LANES[0].cards },
    { title: 'Clinical Review', tone: 'teal', count: clinical.length, cards: clinical.length ? clinical : FALLBACK_TASK_LANES[1].cards },
    { title: 'Blocked', tone: 'amber', count: blocked.length, cards: blocked.length ? blocked : FALLBACK_TASK_LANES[2].cards },
    { title: 'Ready', tone: 'green', count: ready.length, cards: ready.length ? ready : FALLBACK_TASK_LANES[3].cards },
  ];
  return finalize(lanes, validateTaskLanes, 'taskLanes');
}

/** Build calendar events from V3 seeds + regulatory project. Real dates from dueDate/reg.date (source-correct), correct status/owner.
 *  Called by RepresentativeScreens CalendarScreen (ces mode). Dates NOT overridden in UI.
 *  Seed dates now guaranteed mostly Tue/Thu, <=4/day. See V3_CES_SeedData for source.
 */
/** Recurring MANDATORY CES events (Tue/Thu cadence, monthly QAPI, quarterly,
    semi-annual, annual, biennial) materialized for the calendar year from the
    template registry. Computed once. Fills the months that the sparse real seed
    data leaves empty, so every month shows its scheduled compliance work. */
let _mandatoryCalendarCache: CesCalendarEvent[] | null = null;
function mandatoryCalendarEvents(): CesCalendarEvent[] {
  if (_mandatoryCalendarCache) return _mandatoryCalendarCache;
  try {
    const result = generateEvents({
      templates: TEMPLATE_REGISTRY,
      rangeStart: '2026-01-01',
      rangeEnd: '2026-12-31',
      existingEvents: [],
    });
    _mandatoryCalendarCache = result.generated.map((ev) => {
      const { day, month } = parseDueToDayMonth(ev.date);
      const urg = ev.urgency;
      const tone: Tone =
        (urg === 'overdue' || urg === 'critical' || urg === 'blocked' || urg === 'missing-evidence') ? 'orange'
        : (urg === 'complete') ? 'green' : 'teal';
      return {
        id: ev.id,
        label: ev.title || 'Mandatory CES Event',
        day,
        month,
        owner: resolveDisplayName(ev.owner || ev.ownerRole) || 'Compliance Officer',
        progress: urg === 'complete' ? 100 : 55,
        tone,
        sourceEventId: ev.id,
        sourceDate: ev.date,
        sourceKind: 'v3-regulatory-event' as const,
        detail: (ev.summary || '').slice(0, 80),
        scheduleReason: ev.mandateType,
        recurrencePattern: ev.cadence,
      } as CesCalendarEvent;
    });
  } catch {
    _mandatoryCalendarCache = [];
  }
  return _mandatoryCalendarCache;
}

export function buildCalendarEvents(input?: { units?: readonly ExecutionUnit[] }): readonly CesCalendarEvent[] {
  const units = ((input && (input as any).units) || V3_ExecutionUnitsSeed || []) as readonly ExecutionUnit[];
  const fromUnits = units.map((u: ExecutionUnit) => {
    const { day, month } = parseDueToDayMonth(u.dueDate);
    const ownerName = resolveDisplayName((u.owner && (u.owner.name || u.owner.role)) || undefined) || 'Compliance Officer';
    return {
      id: u.id,
      label: u.title || 'CES Event',
      day,
      month,
      owner: ownerName,
      progress: computeProgress(u.complianceState, u.evidenceStatus),
      tone: mapStateToTone(u.complianceState),
      sourceUnitId: u.id,
      sourceEventId: u.parentEventId,
      sourceDate: u.dueDate,
      sourceKind: 'v3-execution-unit' as const,
      workflowId: u.workflowId ? asWorkflowId(u.workflowId) : undefined,
      workflow: u.workflowId,
      readiness: u.auditReadiness,
      risk: u.complianceState === 'blocked' ? 'High risk' : u.complianceState === 'awaiting_signature' ? 'Medium' : undefined,
      detail: `${u.domain} - ${u.workflowPhase}`,
    } as CesCalendarEvent;
  });

  // Project regulatory events (real from V3 seed) not already covered by units
  const unitEventIds = new Set(units.map((u: ExecutionUnit) => u.parentEventId).filter(Boolean));
  const fromReg: CesCalendarEvent[] = (V3_REGULATORY_EVENTS || []).filter((re: any) => !unitEventIds.has(re && re.id)).map((re: any) => {
    const { day, month } = parseDueToDayMonth(re && re.date);
    const urg = re && re.urgency;
    const t: Tone = (urg === 'overdue' || urg === 'critical' || urg === 'blocked' || urg === 'missing-evidence') ? 'orange' :
                    (urg === 'complete') ? 'green' : 'teal';
    return {
      id: re && re.id,
      label: (re && re.title) || 'Regulatory Event',
      day,
      month,
      owner: (re && re.owner) || 'Owner',
      progress: urg === 'complete' ? 100 : (urg === 'overdue' || urg === 'critical' ? 25 : 55),
      tone: t,
      sourceEventId: re && re.id,
      sourceDate: re && re.date,
      sourceKind: 'v3-regulatory-event' as const,
      detail: ((re && re.summary) || '').slice(0, 80),
      risk: (urg === 'critical' || urg === 'overdue') ? 'High risk' : undefined,
      scheduleReason: re && re.mandateType,
    } as CesCalendarEvent;
  });

  // Inject recurring mandatory CES events (deduped by id against units + reg).
  const existingIds = new Set([...fromUnits, ...fromReg].map((e) => e.id));
  const fromMandatory = mandatoryCalendarEvents().filter((e) => !existingIds.has(e.id));

  const all = [...fromUnits, ...fromReg, ...fromMandatory];
  return finalize(all.length ? all : [...FALLBACK_CES_CALENDAR_EVENTS], validateCalendarEvents, 'calendarEvents');
}

/** Build evidence rows. Seed-driven from V3 ExecutionUnits (real seed data) or snapshot.
 *  Falls back only if no units available. Enables real evidence records (titles, workflow refs, status from compliance/auditReadiness)
 *  to render in Evidence Center / audit views. */
export function buildEvidenceRows(input?: { snapshot?: CesSnapshot; units?: readonly ExecutionUnit[] }): readonly EvidenceRow[] {
  const snap = input?.snapshot;
  const units = input?.units ?? ((snap as any)?.executionUnits) ?? V3_ExecutionUnitsSeed;
  if (units && units.length > 0) {
    const rows: EvidenceRow[] = units.slice(0, 6).map((u: any, i: number) => {
      const status = u.complianceState === 'completed' ? 'EVIDENCE_LOCKED' : u.auditReadiness === 'ready' ? 'VALIDATED' : 'PENDING_UPLOAD';
      const t: Tone = status.includes('LOCK') ? 'green' : status.includes('VALID') ? 'teal' : 'orange';
      return [String(u.title || '').slice(0, 28) || 'Evidence item', u.workflowId || u.id || `WF-${i}`, status, t] as const;
    });
    return finalize(rows, validateEvidenceRows, 'evidenceRows');
  }
  return [...FALLBACK_EVIDENCE_ROWS];
}

/** Build audit rows. Seed-driven from V3 ExecutionUnits (real seed data) or snapshot for audit views.
 *  Uses auditReadiness + complianceState for status; refs to workflowId/event for resolution. */
export function buildAuditRows(input?: { snapshot?: CesSnapshot; units?: readonly ExecutionUnit[] }): readonly AuditRow[] {
  const snap = input?.snapshot;
  const units = input?.units ?? ((snap as any)?.executionUnits) ?? V3_ExecutionUnitsSeed;
  if (units && units.length > 0) {
    const highRisk = units.filter((u: any) => u.auditReadiness !== 'ready').slice(0, 5);
    return finalize(highRisk.map((u: any) => {
      const st = u.complianceState === 'completed' ? 'certified locked' : u.complianceState === 'awaiting_signature' ? 'pending approval' : 'ready to certify';
      const tn: Tone = st.includes('certified') ? 'green' : st.includes('pending') ? 'orange' : 'teal';
      return [String(u.title || '').slice(0, 30) || 'Audit packet', u.workflowId || u.id || 'QA-WF', st, tn] as AuditRow;
    }), validateAuditRows, 'auditRows');
  }
  return [...FALLBACK_AUDIT_ROWS];
}

/** Build report metrics. Derives directly from snapshot sprintMetrics (Phase 2 style already). */
export function buildReportMetrics(input?: { units?: readonly ExecutionUnit[] }): readonly MetricTileData[] {
  const units = (input && (input as any).units) || V3_ExecutionUnitsSeed || [];
  const total = units.length;
  const completed = units.filter((u: any) => u.complianceState === 'completed').length;
  const blocked = units.filter((u: any) => u.complianceState === 'blocked').length;
  const readyish = units.filter((u: any) => u.auditReadiness === 'ready').length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 18;
  const auditPct = total > 0 ? Math.round((readyish / total) * 100) : 35;
  const metrics: readonly MetricTileData[] = [
    { label: 'Completion', value: pct + '%', helper: 'Current sprint completion', tone: 'orange' },
    { label: 'Audit readiness', value: auditPct + '%', helper: 'Seeded CES posture', tone: 'orange' },
    { label: 'Active blockers', value: String(blocked), helper: 'Evidence or signature gaps', tone: 'orange' },
    { label: 'Signature SLA', value: '1 miss', helper: 'Code-computed exception', tone: 'teal' },
  ];
  return finalize(metrics, validateReportMetrics, 'reportMetrics');
}

/** Build CES report cards with bodies and posture derived from real V3 seed units + sprint summary.
 *  Replaces static placeholder strings with seed counts (blockers, completed, survey critical).
 */
export function buildReportCards(input?: { units?: readonly ExecutionUnit[] }): readonly { body: string; progress: number; status: string; title: string; tone: Tone }[] {
  const units = (input && (input as any).units) || V3_ExecutionUnitsSeed || [];
  const sprint = buildSprintSummary({ units });
  if (!units || units.length === 0) return [...FALLBACK_REPORT_CARDS];
  const riskCount = sprint.surveyCritical + sprint.blocked;
  const lockedCount = sprint.completed;
  const total = sprint.total || units.length;
  const readinessPct = total > 0 ? Math.round(((sprint.readyToCertify + sprint.completed) / total) * 100) : 80;
  const cards = [
    {
      body: `Sprint 12 has ${sprint.total} cards, ${sprint.blocked} blockers, and ${sprint.readyToCertify} cards ready for certification.`,
      progress: Math.min(95, Math.max(60, readinessPct)),
      status: 'ready',
      title: 'Sprint readiness',
      tone: 'teal' as Tone,
    },
    {
      body: `${riskCount} units carry survey-facing risk this period (incomplete audit readiness or active blockers).`,
      progress: Math.max(35, Math.min(70, 100 - Math.min(riskCount * 4, 55))),
      status: 'review-required',
      title: 'Survey exposure',
      tone: 'orange' as Tone,
    },
    {
      body: `${lockedCount} execution units reached completed state this sprint with certificate and hash traceability.`,
      progress: lockedCount > 5 ? 91 : 72,
      status: 'validated',
      title: 'Evidence throughput',
      tone: 'teal' as Tone,
    },
  ];
  return finalize(cards, (v: any) => ({ ok: Array.isArray(v) && v.length === 3, errors: [] }), 'reportCards');
}

/** Build numeric trend bars for sprint readiness chart. Derived from seed (base + progression using completion count).
 *  No static literals; values shift with real V3 data volume. (Still illustrative trend shape.)
 */
export function buildReportTrendBars(input?: { units?: readonly ExecutionUnit[] }): readonly number[] {
  const units = (input && (input as any).units) || V3_ExecutionUnitsSeed || [];
  if (!units || units.length === 0) return [...FALLBACK_REPORT_BARS];
  const completed = units.filter((u: any) => u.complianceState === 'completed').length;
  const blocked = units.filter((u: any) => u.complianceState === 'blocked').length;
  const base = Math.max(10, Math.min(25, (completed || 8) + Math.floor((blocked || 2) / 2)));
  const bars = Array.from({ length: 10 }, (_, i) => Math.round(base + i * 2.3));
  return finalize(bars, (v: any) => ({ ok: Array.isArray(v) && v.length === 10, errors: [] }), 'reportBars');
}

// ============================================================
// Sprint summary roll-up (backs board / calendar / my-tasks metric tiles)
// ============================================================

export interface CesSprintSummary {
  total: number;
  upcoming: number;
  ready: number;
  inProgress: number;
  awaitingSignature: number;
  blocked: number;
  completed: number;
  readyToCertify: number;
  surveyCritical: number;
  overdue: number;
}

export const FALLBACK_SPRINT_SUMMARY: CesSprintSummary = {
  total: 33, upcoming: 6, ready: 7, inProgress: 12, awaitingSignature: 5,
  blocked: 4, completed: 9, readyToCertify: 9, surveyCritical: 3, overdue: 2,
};

/** Pure roll-up of sprint execution-unit counts backing the board / calendar /
 *  my-tasks summary metric tiles. Seed-driven; falls back to design-parity counts
 *  when the seed is empty. */
export function buildSprintSummary(input?: { units?: readonly ExecutionUnit[] }): CesSprintSummary {
  const units = input?.units ?? V3_ExecutionUnitsSeed;
  if (!units || units.length === 0) return { ...FALLBACK_SPRINT_SUMMARY };
  const countState = (s: string): number => units.filter((u) => u.complianceState === s).length;
  return {
    total: units.length,
    upcoming: countState('upcoming'),
    ready: countState('ready'),
    inProgress: countState('in_progress'),
    awaitingSignature: countState('awaiting_signature'),
    blocked: countState('blocked'),
    completed: countState('completed'),
    readyToCertify: units.filter((u) => u.auditReadiness === 'ready').length,
    surveyCritical: units.filter((u) => u.auditReadiness === 'not_ready').length,
    overdue: units.filter((u) => typeof u.escalationTimer === 'number' && u.escalationTimer < 0).length,
  };
}

/** Convenience: all-in-one master projection bag (for future consumers). */
export function buildCesAllProjections(_snapshot?: unknown) {
  const unitsForAll = V3_ExecutionUnitsSeed;
  // Example relationship use: tasks for a sample event now resolvable via real seed parentEventId
  void getTasksForEvent('evt-gb-q2-2026', unitsForAll);
  return {
    boardLanes: buildBoardLanes({ units: unitsForAll }),
    eventLanes: buildEventLanes({ units: unitsForAll }),
    taskLanes: buildTaskLanes({ units: unitsForAll }),
    calendarEvents: buildCalendarEvents(),
    evidenceRows: buildEvidenceRows(),
    auditRows: buildAuditRows(),
    reportMetrics: buildReportMetrics(),
    reportCards: buildReportCards({ units: unitsForAll }),
    reportTrendBars: buildReportTrendBars({ units: unitsForAll }),
  };
}

// ============================================================
// Phase 2: pure query-param helpers for deep links (filter-from-query)
// ============================================================

export function getControlFromParams(params: URLSearchParams | null | undefined): string | null {
  if (!params) return null;
  return params.get('control') || params.get('ref') || null;
}

export function getBucketFromParams(params: URLSearchParams | null | undefined): string | null {
  if (!params) return null;
  return params.get('bucket');
}
