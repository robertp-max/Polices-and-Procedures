/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   REGULATORY EVENTS â€” Domain / Policy / Deadline / Evidence model
   Drives the Regulatory Execution Center (Dashboard + Calendar).
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

import { getCaliforniaNow } from '@/policy/utils/californiaTime';

export type RegulatoryDomain =
  | 'Governance'
  | 'QAPI'
  | 'Clinical'
  | 'Finance'
  | 'IT/Security'
  | 'Operations'
  | 'Risk'
  | 'Compliance'
  | 'Holiday';

export type UrgencyLevel =
  | 'overdue'
  | 'critical'
  | 'due-soon'
  | 'on-track'
  | 'scheduled'
  | 'complete'
  | 'blocked'
  | 'missing-evidence';

export type EventCadence =
  | 'Monthly'
  | 'Quarterly'
  | 'Annual'
  | 'Semiannual'
  | 'Biennial'
  | 'Triennial'
  | 'Weekly'
  | 'Biweekly'
  | 'Ad-hoc'
  | 'Trigger-based'
  | 'Holiday';

/**
 * Mandate type â€” drives the label displayed on each event in the compliance UI.
 * IMPORTANT: policy-driven quarterly events (e.g. QAPI governance review) are
 * NOT federal-required and must be labelled 'policy-driven'.
 */
export type MandateType =
  | 'federal-required'      // CoP, HIPAA, OSHA â€” universal obligation
  | 'conditional-federal'   // federal trigger only when condition is met (e.g. low-volume HHCAHPS)
  | 'policy-driven'         // agency policy cadence, not a universal federal mandate
  | 'state-required';       // state-specific regulation

export type EventScopeType =
  | "previous_calendar_month"
  | "previous_calendar_quarter"
  | "current_calendar_month"
  | "rolling_since_last_event"
  | "custom"
  | "needs_review";

export interface EventEvidenceItem {
  id: string;
  label: string;
  formId?: string;                   // Cross-ref to Forms Library
  status: 'complete' | 'in-progress' | 'pending' | 'missing';
  dueOffsetDays?: number;            // Relative to event date (-N = N days before)
}

export interface EventProcessStep {
  id: string;
  label: string;
  description: string;
  /** Operational "what to do / fill out" guidance (multi-line supported via \n). */
  instructions?: string;
  /** Deliverable produced by this step (minutes draft, signed POC, packet, etc.). */
  expectedOutput?: string;
  /** Form IDs (match requiredForms.id) that this step produces/consumes. */
  requiredFormIds?: string[];
  /** Short system note describing what happens when step closes. */
  onCompleteText?: string;
  status: 'complete' | 'in-progress' | 'pending';
  dueOffsetDays: number;             // e.g. -7 = due 7 days before event
  /**
   * Effort estimate (Fibonacci-like). Used by CES sprint board for
   * load balancing. Always one of {1, 2, 3, 5, 8}; signature-only
   * steps default to 1, audits/reviews/coordination to 5+, the rest
   * to 2–3. Derived automatically when the event is generated from
   * a workflow (see `buildWorkflowAlignedExecution`).
   */
  storyPoints?: 1 | 2 | 3 | 5 | 8;
  /** Step provenance marker used by alignment verifier and UI telemetry. */
  sourceType?: 'workflow_derived' | 'event_authored_exception';
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   STANDARDIZED EVENT SCHEMA EXTENSIONS
   The fields below are the pre-activation audit additions that make
   every event audit-defensible, operationally executable, and
   survey-ready. They are OPTIONAL on the base interface so legacy
   events keep working while new/expanded events use the full shape.
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

/** Where the event's authoritative record lives. */
export type EventSourceOfTruth = 'app' | 'google' | 'both';

/** Structured agenda template â€” required for meeting-type events. */
export interface AgendaTopic {
  id: string;
  title: string;
  /** Bullet points the facilitator must cover. */
  discussionPoints: string[];
  /** Inputs required before the topic can be discussed (reports, dashboards, metrics). */
  requiredInputs?: string[];
  /** Who drives this topic. */
  owner?: string;
  /** Suggested duration (minutes). */
  durationMin?: number;
}

export interface AgendaTemplate {
  /** Distribution lead time (business days before the event). */
  distributeBusinessDaysBefore: number;
  /** Standing topics that run every occurrence. */
  standingTopics: AgendaTopic[];
  /** Data inputs (dashboards, reports) that must be attached to the packet. */
  dataInputs?: { label: string; formId?: string; owner?: string }[];
}

/** Approval rule for an event, report, minutes, or form artifact. */
export interface ApprovalRule {
  id: string;
  targetKind: 'event' | 'minutes' | 'report' | 'form';
  /** Label for the target artifact (e.g., "Quarterly Compliance Report"). */
  targetLabel: string;
  /** Role required to approve. */
  approverRole: string;
  /** If the approver does not act within N days, escalate. */
  escalationDays?: number;
  escalateToRole?: string;
  required: boolean;
}

/** Conditions that raise compliance / audit risk. */
export interface ComplianceFlags {
  /** Risk rating if the event is missed entirely. */
  auditRisk: 'low' | 'medium' | 'high' | 'critical';
  /** Days past due_date at which the event flips to overdue. */
  overdueAfterDays: number;
  /** Statuses that trigger a "missing evidence" compliance flag. */
  missingEvidenceIf?: Array<'pending' | 'missing' | 'in-progress'>;
  /** Free-text rationale the surveyor sees. */
  surveyorNote?: string;
  /** Specific CoP / regulation citation for surveyor traceability. */
  citation?: string;
}

/** Follow-up task generated after the event. */
export interface FollowUpSpec {
  id: string;
  label: string;
  dueOffsetDays: number;
  ownerRole: string;
  /** What counts as "complete" / "closed". */
  closureCriteria: string;
  /** If not closed in N days, escalate to this role. */
  escalationDays?: number;
  escalateToRole?: string;
}

/** How this event relates to other events (feeds, blocks, depends on). */
export interface EventDependencies {
  /** This event must finish before these downstream events can run. */
  feeds?: string[];
  /** These upstream events must finish before this one runs. */
  dependsOn?: string[];
  /** Cancelling / rescheduling this event should propagate to these. */
  propagatesTo?: string[];
}

export interface RegulatoryEvent {
  id: string;
  title: string;
  domain: RegulatoryDomain;
  /** YYYY-MM-DD */
  date: string;
  endDate?: string;
  /** HH:mm (24h); omit for all-day */
  time?: string;
  timeEnd?: string;
  allDay?: boolean;
  cadence: EventCadence;
  urgency: UrgencyLevel;
  /** Linked policy IDs â€” drives the P&P â†’ Event chain */
  policyRefs: string[];
  owner: string;
  ownerRole: string;
  location?: string;
  /** Short one-line description visible on calendar chip */
  summary?: string;
  /** Process-flow steps (e.g. pre-meeting / execution / follow-up) */
  processFlow: EventProcessStep[];
  /** Required forms / documents the event depends on */
  requiredForms: EventEvidenceItem[];
  /** Meeting minutes artifact */
  minutes?: {
    status: 'missing' | 'draft' | 'finalized';
    dueOffsetDays: number;
    finalizedOn?: string;
    assignee?: string;
    /** Required sections in the minutes template. */
    requiredSections?: string[];
    /** Roles that must sign the minutes for finalization. */
    signOffRoles?: string[];
  };
  /** Knowledge-base article the operator should consult */
  helpArticle?: {
    id: string;
    title: string;
    topics: string[];
  };
  /** Regulatory rationale (drives the "why") */
  regulatoryDriver?: string;
  /** Is this an actionable event or a context marker (holiday) */
  isContext?: boolean;

  /* â”€â”€ Standardized audit-readiness extensions (optional) â”€â”€ */
  /** Sub-category label (e.g., "Quarterly Governing Body", "Monthly Committee"). */
  category?: string;
  /** Structured agenda template. Required for meeting-type events. */
  agenda?: AgendaTemplate;
  /** Approval rules governing sign-off of the event and its artifacts. */
  approvals?: ApprovalRule[];
  /** Surveyor-facing compliance flag definitions. */
  complianceFlags?: ComplianceFlags;
  /** Follow-up tasks and closure criteria generated after the event. */
  followUps?: FollowUpSpec[];
  /** Cross-event dependencies (predecessor/successor/propagation). */
  dependencies?: EventDependencies;
  /** Which system holds the canonical record. Defaults to 'app'. */
  sourceOfTruth?: EventSourceOfTruth;
  /** IANA timezone string. Defaults to agency timezone. */
  timezone?: string;
  /** Timestamps (ISO). */
  createdAt?: string;
  updatedAt?: string;
  /**
   * Mandate classification â€” distinguishes federal-required, conditional-federal,
   * policy-driven, and state-required events. Used in the compliance UI and
   * in Google Calendar event descriptions.
   * RULE: policy-driven quarterly QAPI governance reviews are NOT federal-required.
   */
  mandateType?: MandateType;
  /**
   * Stable mandated-event sub-type key.
   * Embedded in event.id via the format {eventSubType}-{YYYYMMDD}-{YY}.
   * Used for filtering, sequencing, and QAPI dependency rules.
   * Examples: 'qapi_meeting', 'ep_exercise', 'security_risk_analysis'.
   */
  eventSubType?: string;
  /**
   * Weekend scheduling override. When `true`, the event is permitted to
   * fall on Saturday or Sunday (e.g. 24/7 on-call drills, holiday-period
   * surveys). When `false` or omitted, the scheduler treats Sat/Sun as
   * non-working days and shifts the event forward to the next business
   * day. See `shiftToBusinessDay()` in this file.
   */
  isWeekendAllowed?: boolean;
  /**
   * Source workflow ID (e.g. `QA-WF-03`). When set, the event's
   * `processFlow` and `requiredForms` are derived 1:1 from
   * `WORKFLOWS[workflowId].steps[]` via
   * `buildWorkflowAlignedExecution()`. Workflows are the single
   * source of executable steps; the event layer must not invent or
   * reword steps.
   */
  workflowId?: string;
  /** Explicitly allows non-workflow execution for documented edge cases. */
  alignmentException?: boolean;
  /** Human-readable rationale for alignmentException. */
  alignmentExceptionReason?: string;
  /** Classification from alignment audit policy. */
  alignmentClassification?:
    | 'legitimate_event_level_execution'
    | 'missing_workflow_link'
    | 'context_marker_only'
    | 'needs_manual_review';

  /* â”€â”€ Reporting scope alignment (added for 2026 schedule update) â”€â”€ */
  scopeType?: EventScopeType;
  reportingPeriodStart?: string;
  reportingPeriodEnd?: string;
  executionWindowStart?: string;
  executionWindowEnd?: string;
  scheduledDate?: string;
  preferredScheduleRule?: string;
  rescheduleRule?: string;
  lateRule?: string;
  scopeLabel?: string;
  /** Tue/Thu scheduling-rule note or exception rationale (set by enforceTuesdayThursday). */
  scheduleNote?: string;
}

/* â”€â”€â”€ Domain visual palette (maroon-safe â€” NO blue) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export const DOMAIN_PALETTE: Record<RegulatoryDomain, {
  color: string;
  soft: string;
  border: string;
  label: string;
}> = {
  Governance:   { color: '#F97316', soft: 'rgba(249,115,22,0.16)',  border: 'rgba(249,115,22,0.45)',  label: 'Governance' },
  QAPI:         { color: '#FFC107', soft: 'rgba(255,193,7,0.18)',   border: 'rgba(255,193,7,0.50)',   label: 'QAPI' },
  Clinical:     { color: '#34D399', soft: 'rgba(52,211,153,0.16)',  border: 'rgba(52,211,153,0.45)',  label: 'Clinical' },
  Finance:      { color: '#F5A524', soft: 'rgba(245,165,36,0.16)',  border: 'rgba(245,165,36,0.45)',  label: 'Finance' },
  'IT/Security':{ color: '#A78BFA', soft: 'rgba(167,139,250,0.16)', border: 'rgba(167,139,250,0.45)', label: 'IT / Security' },
  Operations:   { color: '#F472B6', soft: 'rgba(244,114,182,0.16)', border: 'rgba(244,114,182,0.45)', label: 'Operations' },
  Risk:         { color: '#EF4444', soft: 'rgba(239,68,68,0.18)',   border: 'rgba(239,68,68,0.45)',   label: 'Risk' },
  Compliance:   { color: '#C084FC', soft: 'rgba(192,132,252,0.16)', border: 'rgba(192,132,252,0.45)', label: 'Compliance' },
  Holiday:      { color: '#94A3B8', soft: 'rgba(148,163,184,0.14)', border: 'rgba(148,163,184,0.35)', label: 'Holiday' },
};

/* â”€â”€â”€ Urgency palette â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export const URGENCY_PALETTE: Record<UrgencyLevel, {
  color: string; soft: string; label: string;
}> = {
  overdue:           { color: '#EF4444', soft: 'rgba(239,68,68,0.18)',  label: 'Overdue' },
  critical:          { color: '#DC2626', soft: 'rgba(220,38,38,0.18)',  label: 'Critical' },
  'due-soon':        { color: '#FBBF24', soft: 'rgba(251,191,36,0.18)', label: 'Due Soon' },
  'on-track':        { color: '#FFC107', soft: 'rgba(255,193,7,0.18)',  label: 'On Track' },
  scheduled:         { color: '#94A3B8', soft: 'rgba(148,163,184,0.18)', label: 'Scheduled' },
  complete:          { color: '#10B981', soft: 'rgba(16,185,129,0.18)', label: 'Complete' },
  blocked:           { color: '#F97316', soft: 'rgba(249,115,22,0.18)', label: 'Blocked' },
  'missing-evidence':{ color: '#F97316', soft: 'rgba(249,115,22,0.18)', label: 'Missing Evidence' },
};

/* Anchor "today" to California business time for dashboard, audit, and calendar urgency. */
export const TODAY_ANCHOR = getCaliforniaNow();

/* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function daysUntil(dateISO: string, today: Date = TODAY_ANCHOR): number {
  const d = new Date(dateISO + 'T00:00:00');
  const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((d.getTime() - t.getTime()) / 86_400_000);
}

export function relativeLabel(dateISO: string, today: Date = TODAY_ANCHOR): string {
  const n = daysUntil(dateISO, today);
  if (n === 0) return 'Today';
  if (n === 1) return 'Tomorrow';
  if (n === -1) return 'Yesterday';
  if (n > 1 && n <= 14) return `In ${n} days`;
  if (n < -1 && n >= -14) return `${Math.abs(n)} days ago`;
  const d = new Date(dateISO + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatEventDate(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Weekend / business-day scheduling guard ─────────────────────────
   Hard rule (per CES scheduling constraints):
     • Saturday + Sunday = NON-WORKING DAYS
     • QAPI / audits / policy reviews / compliance validations: weekdays only
     • Override only when event.isWeekendAllowed === true
     • Falls forward (never backwards) so compliance deadlines are preserved.
   ──────────────────────────────────────────────────────────────────── */

/** Returns true when the YYYY-MM-DD ISO date lands on Sat or Sun. */
export function isWeekend(dateISO: string): boolean {
  const day = new Date(dateISO + 'T00:00:00').getDay();
  return day === 0 || day === 6;
}

/**
 * Shift a YYYY-MM-DD date forward to the next Mon–Fri. Returns the
 * input date unchanged if it is already a weekday. Never moves backwards.
 */
export function shiftToBusinessDay(dateISO: string): string {
  let d = new Date(dateISO + 'T00:00:00');
  while (d.getDay() === 0 || d.getDay() === 6) {
    d = new Date(d.getTime() + 86_400_000);
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Apply the weekend-blocking rule to a `RegulatoryEvent`.
 * - Returns the event unchanged when `isWeekendAllowed === true` or the
 *   date is already a weekday.
 * - Otherwise returns a new event with `date` (and `endDate` if present)
 *   shifted forward, and the canonical event ID re-stamped if the ID
 *   embeds the YYYYMMDD date segment.
 */
export function enforceBusinessDay(event: RegulatoryEvent): RegulatoryEvent {
  if (event.isWeekendAllowed) return event;
  if (!isWeekend(event.date)) return event;

  const shifted = shiftToBusinessDay(event.date);
  const next: RegulatoryEvent = { ...event, date: shifted };

  if (event.endDate && isWeekend(event.endDate)) {
    next.endDate = shiftToBusinessDay(event.endDate);
  }

  // If the ID encodes the original date segment, restamp it.
  if (event.eventSubType) {
    const oldYmd = event.date.replace(/-/g, '');
    const newYmd = shifted.replace(/-/g, '');
    if (event.id.includes(oldYmd)) {
      next.id = event.id.replace(oldYmd, newYmd);
    }
  }
  return next;
}

import { MANDATED_EVENTS_EXPANDED } from './mandatedEventsExpanded';
import { applyWorkflowAlignment } from './eventWorkflowAlignment';
import { applyEventAlignmentPolicy } from './eventAlignmentPolicy';
import { enforceTuesdayThursday } from './tuesdayThursdayPolicy';
import { deriveScope } from './scopeDerivationPolicy';

/* â”€â”€â”€ Event dataset â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
/**
 * Internal raw dataset. The exported `REGULATORY_EVENTS` is produced by
 * mapping every entry through `enforceBusinessDay()` so that no recurring
 * mandated event ever lands on Sat/Sun unless it explicitly opts in via
 * `isWeekendAllowed: true`. This is the single source-of-truth guard.
 */
const REGULATORY_EVENTS_RAW: RegulatoryEvent[] = [
  ...MANDATED_EVENTS_EXPANDED,
  /* â•â•â•â•â•â•â•â•â•â• MAY 2026 â€” the "now" window â•â•â•â•â•â•â•â•â•â• */

  {
    id: 'qapi_meeting-20260512-09',
    eventSubType: 'qapi_meeting',
    title: 'QAPI Committee Meeting',
    domain: 'QAPI',
    date: '2026-05-19',  // Tuesday (CES committee meetings mostly Tue/Thu)
    time: '10:00',
    timeEnd: '12:00',
    cadence: 'Monthly',
    urgency: 'due-soon',
    policyRefs: ['QA-PG-001', 'QA-PG-002'],
    owner: 'M. Chen',
    ownerRole: 'QAPI Coordinator',
    location: 'Main Office / Conference Room A',
    summary: 'Monthly QAPI Committee meeting: review quality indicator performance, close prior-month corrective actions, open new actions where thresholds were breached, and update the committee record.',
    regulatoryDriver: 'QAPI policy (QA-PG-001) requires Committee meetings at least monthly. Agendas distributed 5 business days prior. Minutes drafted within 7 calendar days. Quarterly rollup to the Governing Body.',
    processFlow: [
      {
        id: 's1',
        label: 'Prepare QAPI agenda and compile dashboard metrics',
        description: 'Refresh the indicator dashboard and distribute the agenda 5 business days before the meeting.',
        instructions:
          '1. Pull rolling 3-month and YTD values for every agency QAPI indicator.\n2. Highlight any threshold breach in red on the dashboard (QA-F-014).\n3. Build the agenda (QA-F-010) with standing items: prior minutes approval, indicator review, open action items, new business.\n4. Distribute via a tracked channel 5 business days prior; capture distribution evidence.',
        expectedOutput: 'Distributed QAPI agenda (QA-F-010) with attached refreshed Data Dashboard (QA-F-014).',
        requiredFormIds: ['QA-F-010', 'QA-F-014'],
        onCompleteText: 'Agenda on file. Committee members have had the full 5-business-day review window.',
        status: 'complete',
        dueOffsetDays: -7,
      },
      {
        id: 's2',
        label: 'Run the Committee meeting and record quorum',
        description: 'Conduct the meeting per agenda. Capture attendance, discussion, and decisions.',
        instructions:
          '1. Call the meeting to order and confirm quorum.\n2. Record attendance in the Attendance Log (QA-F-011) â€” present / absent / excused for each member.\n3. Approve prior-month minutes. Walk through indicator performance. Review open action items.\n4. Identify any threshold breach that requires a new corrective action.',
        expectedOutput: 'Completed Attendance Log with quorum confirmed. Draft meeting notes ready for minutes.',
        requiredFormIds: ['QA-F-011'],
        onCompleteText: 'Meeting is on the record. Move to action assignment while discussion is fresh.',
        status: 'in-progress',
        dueOffsetDays: 0,
      },
      {
        id: 's3',
        label: 'Record committee decisions and assign corrective action owners',
        description: 'Every new action has an owner, a due date, and success criteria. Nothing closes without them.',
        instructions:
          '1. For each new corrective action, add a row to the Action Item Tracker (QA-F-013) with:\n   â€¢ owner, due date, linked indicator, and success criteria.\n2. Update status on any action that closed in the meeting with closure evidence.\n3. Flag any action that will be escalated to the Governing Body.',
        expectedOutput: 'Updated Action Item Tracker (QA-F-013) with every decision captured.',
        requiredFormIds: ['QA-F-013'],
        onCompleteText: 'Every decision has an owner. No action leaves the room without one.',
        status: 'pending',
        dueOffsetDays: 1,
      },
      {
        id: 's4',
        label: 'Draft, finalize, and file meeting minutes',
        description: 'Draft minutes within 7 calendar days; finalize at the next meeting approval.',
        instructions:
          '1. Populate the Minutes Template (QA-F-012) with discussion, decisions, and votes.\n2. For each corrective action, cross-reference the tracker row.\n3. Route to the Committee Chair for review.\n4. File signed minutes with attendance log + dashboard as the month\'s evidence bundle.',
        expectedOutput: 'Finalized minutes (QA-F-012) stored in the audit-ready location.',
        requiredFormIds: ['QA-F-012'],
        onCompleteText: 'Month is audit-ready. Evidence bundle feeds the quarterly Governing Body rollup.',
        status: 'pending',
        dueOffsetDays: 7,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'QAPI Meeting Agenda',       formId: 'QA-F-010', status: 'complete',    dueOffsetDays: -5 },
      { id: 'ev2', label: 'QAPI Attendance Log',       formId: 'QA-F-011', status: 'complete',    dueOffsetDays: 0 },
      { id: 'ev3', label: 'QAPI Minutes Template',     formId: 'QA-F-012', status: 'in-progress', dueOffsetDays: 7 },
      { id: 'ev4', label: 'QAPI Action Item Tracker',  formId: 'QA-F-013', status: 'pending',     dueOffsetDays: 7 },
      { id: 'ev5', label: 'QAPI Data Dashboard',       formId: 'QA-F-014', status: 'pending',     dueOffsetDays: 0 },
    ],
    minutes: {
      status: 'draft',
      dueOffsetDays: 7,
      assignee: 'M. Chen',
      requiredSections: [
        'Attendance & quorum',
        'Approval of prior minutes',
        'Quality indicator review (every tracked measure)',
        'Open corrective actions â€” status & evidence',
        'New corrective actions â€” owner, due date, success criteria',
        'Escalations to Governing Body',
        'Adjournment & next meeting date',
      ],
      signOffRoles: ['QAPI Committee Chair', 'QAPI Coordinator'],
    },
    category: 'Monthly QAPI Committee',
    scopeType: 'previous_calendar_month',
    reportingPeriodStart: '2026-04-01',
    reportingPeriodEnd: '2026-04-30',
    executionWindowStart: '2026-05-01',
    executionWindowEnd: '2026-05-01',
    scheduledDate: '2026-05-01',
    preferredScheduleRule: 'first Friday of the month at 10:00 AM',
    scopeLabel: 'Previous calendar month (Apr 2026)',
    agenda: {
      distributeBusinessDaysBefore: 5,
      standingTopics: [
        { id: 't1', title: 'Call to order & quorum', discussionPoints: ['Confirm quorum per charter', 'Disclose conflicts of interest'], durationMin: 5 },
        { id: 't2', title: 'Approval of prior minutes', discussionPoints: ['Motion to approve', 'Corrections on the record'], durationMin: 5 },
        { id: 't3', title: 'Indicator performance review', discussionPoints: ['Rolling 3-month trend', 'YTD vs threshold', 'Outliers requiring action'], requiredInputs: ['QA-F-014 Dashboard refreshed â‰¤ 48h prior'], durationMin: 30 },
        { id: 't4', title: 'Open corrective actions', discussionPoints: ['Status update per owner', 'Close with evidence or extend with rationale'], requiredInputs: ['QA-F-013 Action Tracker'], durationMin: 25 },
        { id: 't5', title: 'New corrective actions', discussionPoints: ['Root cause summary', 'Owner, due date, success criteria'], durationMin: 20 },
        { id: 't6', title: 'Escalations to Governing Body', discussionPoints: ['Identify items requiring board awareness'], durationMin: 10 },
        { id: 't7', title: 'Adjournment', discussionPoints: ['Confirm next meeting date'], durationMin: 5 },
      ],
      dataInputs: [
        { label: 'QAPI Data Dashboard', formId: 'QA-F-014', owner: 'QAPI Coordinator' },
        { label: 'Action Item Tracker', formId: 'QA-F-013', owner: 'QAPI Coordinator' },
      ],
    },
    approvals: [
      { id: 'ap-min', targetKind: 'minutes', targetLabel: 'QAPI Minutes', approverRole: 'QAPI Committee Chair', required: true, escalationDays: 10, escalateToRole: 'Administrator' },
      { id: 'ap-act', targetKind: 'report', targetLabel: 'New Corrective Actions', approverRole: 'QAPI Coordinator', required: true },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 0,
      missingEvidenceIf: ['missing', 'pending'],
      surveyorNote: 'QAPI committee must meet at least monthly; missing minutes or attendance are top survey findings.',
      citation: '42 CFR Â§ 484.65 (QAPI Condition of Participation)',
    },
    followUps: [
      { id: 'fu1', label: 'File finalized minutes + attendance + dashboard bundle', dueOffsetDays: 7, ownerRole: 'QAPI Coordinator', closureCriteria: 'Signed minutes (QA-F-012) in audit-ready location with attached attendance log and dashboard.' },
      { id: 'fu2', label: 'Weekly action-item follow-through until closure', dueOffsetDays: 14, ownerRole: 'QAPI Coordinator', closureCriteria: 'Each open action has an updated status note within 7 days.', escalationDays: 14, escalateToRole: 'Administrator' },
    ],
    dependencies: {
      feeds: ['governing_body_meeting-20260514-01'],
    },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
    helpArticle: {
      id: 'KB-QAPI-001',
      title: 'How to Conduct a QAPI Committee Meeting',
      topics: ['Pre-meeting preparation', 'Data analysis and discussion', 'Action item development', 'Documentation requirements', 'Common pitfalls to avoid'],
    },
  },

  {
    id: 'governing_body_meeting-20260514-01',
    eventSubType: 'governing_body_meeting',
    title: 'Governing Body Meeting',
    domain: 'Governance',
    date: '2026-05-14',
    time: '14:00',
    timeEnd: '16:00',
    cadence: 'Quarterly',
    urgency: 'critical',
    policyRefs: ['GV-GB-001', 'GV-GB-002'],
    owner: 'D. Alvarez',
    ownerRole: 'Administrator',
    location: 'Main Office / Board Room',
    summary: 'Quarterly Governing Body meeting. Full packet, QAPI / Compliance / Risk reports, and agenda must reach members 7 calendar days prior. Minutes finalized within 7 calendar days after.',
    regulatoryDriver: 'Governing Body Charter (GV-GB-001) requires quarterly meetings with 7-day packet distribution and quarterly compliance, QAPI, and risk reports submitted 7 days prior to the meeting.',
    processFlow: [
      {
        id: 's1',
        label: 'Assemble Governing Body packet',
        description: 'Collect prior-meeting minutes, all quarterly reports, financial summary, and escalations.',
        instructions:
          '1. Gather prior-quarter approved minutes (for ratification).\n2. Confirm the Quarterly Compliance Report (CO-F-004), QAPI Report (QA-F-020), and Risk Report (RM-F-010) are signed by their owners.\n3. Include the financial summary and any escalations requiring board awareness.\n4. Verify every packet item is finalized â€” no drafts distributed.',
        expectedOutput: 'Assembled packet ready for distribution (agenda + all quarterly reports + supporting materials).',
        requiredFormIds: ['GV-F-001', 'CO-F-004', 'QA-F-020', 'RM-F-010'],
        onCompleteText: 'Packet is complete and traceable to each owner\'s sign-off.',
        status: 'pending',
        dueOffsetDays: -10,
      },
      {
        id: 's2',
        label: 'Distribute packet with agenda (T-7 days)',
        description: 'Release the packet to all members at least 7 calendar days before the meeting. Capture distribution evidence.',
        instructions:
          '1. Send the packet via the audit-tracked channel used by the board.\n2. Retain send timestamps and read receipts as distribution evidence.\n3. Confirm every member received the packet; re-route manually if any delivery fails.',
        expectedOutput: 'Distribution record retained with the packet.',
        requiredFormIds: ['GV-F-001'],
        onCompleteText: 'Packet distribution meets the 7-day rule. Ready for pre-meeting confirmations.',
        status: 'pending',
        dueOffsetDays: -7,
      },
      {
        id: 's3',
        label: 'Deliver quarterly Compliance, QAPI, and Risk reports',
        description: 'Each report is a Governing Body packet requirement and is drafted by its owner.',
        instructions:
          '1. Compliance Officer delivers Quarterly Compliance Report (CO-F-004).\n2. QAPI Coordinator delivers Quarterly QAPI Report (QA-F-020) with rollup of the quarter\'s action items.\n3. Risk Manager delivers Quarterly Risk Report (RM-F-010) with severity breakdown and any 72-hour escalations.',
        expectedOutput: 'All three signed quarterly reports attached to the packet.',
        requiredFormIds: ['CO-F-004', 'QA-F-020', 'RM-F-010'],
        onCompleteText: 'Full governance packet in hand. Meeting can proceed with complete evidence base.',
        status: 'in-progress',
        dueOffsetDays: -7,
      },
      {
        id: 's4',
        label: 'Conduct the Governing Body meeting',
        description: 'Approve prior minutes, receive reports, record decisions and delegated actions.',
        instructions:
          '1. Approve prior-quarter minutes.\n2. Receive each quarterly report with brief discussion.\n3. Take votes on approvals and delegations. Record vote counts.\n4. Acknowledge escalations and assign follow-up owners.',
        expectedOutput: 'Meeting conducted with all packet items received and decisions captured.',
        requiredFormIds: ['GV-F-002'],
        onCompleteText: 'Meeting is on the record. Draft minutes move to the Board Secretary.',
        status: 'pending',
        dueOffsetDays: 0,
      },
      {
        id: 's5',
        label: 'Finalize and file Governing Body minutes',
        description: 'Draft minutes within 7 calendar days; finalize at the next meeting approval.',
        instructions:
          '1. Draft minutes (GV-F-002) capturing attendance, quorum, every motion and vote, and all delegated actions.\n2. Bind minutes + packet + attendance + distribution evidence as the quarter\'s audit bundle.\n3. Route for Chair / Secretary signature at the following meeting.',
        expectedOutput: 'Signed Governing Body minutes bound with the full quarterly audit bundle.',
        requiredFormIds: ['GV-F-002'],
        onCompleteText: 'Quarter is survey-ready. Minutes join the evidence repository.',
        status: 'pending',
        dueOffsetDays: 7,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Governing Body Agenda',      formId: 'GV-F-001', status: 'missing',     dueOffsetDays: -7 },
      { id: 'ev2', label: 'Quarterly Compliance Report',formId: 'CO-F-004', status: 'missing',     dueOffsetDays: -7 },
      { id: 'ev3', label: 'Quarterly QAPI Report',      formId: 'QA-F-020', status: 'in-progress', dueOffsetDays: -7 },
      { id: 'ev4', label: 'Quarterly Risk Report',      formId: 'RM-F-010', status: 'pending',     dueOffsetDays: -7 },
      { id: 'ev5', label: 'Governing Body Minutes',     formId: 'GV-F-002', status: 'pending',     dueOffsetDays: 7 },
    ],
    minutes: {
      status: 'missing',
      dueOffsetDays: 7,
      assignee: 'Board Secretary',
      requiredSections: [
        'Attendance, quorum, and conflict-of-interest disclosures',
        'Approval of prior-quarter minutes',
        'Quarterly Compliance Report receipt & discussion',
        'Quarterly QAPI Report receipt & discussion',
        'Quarterly Risk Report receipt & discussion',
        'Financial summary',
        'Policy ratifications & delegations',
        'Motions, votes, and delegated follow-ups',
        'Adjournment & next meeting date',
      ],
      signOffRoles: ['Board Chair', 'Board Secretary'],
    },
    category: 'Quarterly Governing Body',
    agenda: {
      distributeBusinessDaysBefore: 5,
      standingTopics: [
        { id: 't1', title: 'Call to order, attendance, conflicts', discussionPoints: ['Confirm quorum', 'Disclose COI'], durationMin: 5 },
        { id: 't2', title: 'Approve prior-quarter minutes', discussionPoints: ['Motion to approve', 'Corrections on the record'], durationMin: 5 },
        { id: 't3', title: 'Compliance Report', discussionPoints: ['Hotline / complaints', 'Investigations', 'Audit findings', 'Training completion'], requiredInputs: ['CO-F-004 Quarterly Compliance Report'], owner: 'Compliance Officer', durationMin: 20 },
        { id: 't4', title: 'QAPI Report', discussionPoints: ['Indicators vs threshold', 'Closed / open actions', 'Escalated actions'], requiredInputs: ['QA-F-020 Quarterly QAPI Report'], owner: 'QAPI Coordinator', durationMin: 20 },
        { id: 't5', title: 'Risk Report', discussionPoints: ['Severity breakdown', 'Sentinel events', '72-hour escalations'], requiredInputs: ['RM-F-010 Quarterly Risk Report'], owner: 'Risk Manager', durationMin: 20 },
        { id: 't6', title: 'Financial summary', discussionPoints: ['Revenue cycle', 'Billing at risk', 'Denial trend'], owner: 'Revenue Cycle Director', durationMin: 15 },
        { id: 't7', title: 'Policy ratifications & delegations', discussionPoints: ['New/updated policies requiring approval'], durationMin: 10 },
        { id: 't8', title: 'New business & adjournment', discussionPoints: ['Escalations from committees', 'Confirm next meeting'], durationMin: 10 },
      ],
      dataInputs: [
        { label: 'Quarterly Compliance Report', formId: 'CO-F-004', owner: 'Compliance Officer' },
        { label: 'Quarterly QAPI Report',       formId: 'QA-F-020', owner: 'QAPI Coordinator' },
        { label: 'Quarterly Risk Report',       formId: 'RM-F-010', owner: 'Risk Manager' },
      ],
    },
    approvals: [
      { id: 'ap-gb-min', targetKind: 'minutes', targetLabel: 'Governing Body Minutes', approverRole: 'Board Chair',    required: true, escalationDays: 14, escalateToRole: 'Administrator' },
      { id: 'ap-gb-co',  targetKind: 'report',  targetLabel: 'Quarterly Compliance Report', approverRole: 'Administrator', required: true, escalationDays: 3, escalateToRole: 'Board Chair' },
      { id: 'ap-gb-qa',  targetKind: 'report',  targetLabel: 'Quarterly QAPI Report',       approverRole: 'Administrator', required: true, escalationDays: 3, escalateToRole: 'Board Chair' },
      { id: 'ap-gb-rm',  targetKind: 'report',  targetLabel: 'Quarterly Risk Report',       approverRole: 'Administrator', required: true, escalationDays: 3, escalateToRole: 'Board Chair' },
    ],
    complianceFlags: {
      auditRisk: 'critical',
      overdueAfterDays: 0,
      missingEvidenceIf: ['missing', 'pending'],
      surveyorNote: 'Failure to hold a quarterly governing body meeting or to retain signed minutes is a Condition-level deficiency.',
      citation: '42 CFR Â§ 484.105 (Administration / Governing Body CoP)',
    },
    followUps: [
      { id: 'fu1', label: 'File signed minutes + packet + distribution evidence bundle', dueOffsetDays: 14, ownerRole: 'Board Secretary', closureCriteria: 'Signed minutes (GV-F-002) filed with full quarterly bundle in audit repository.' },
      { id: 'fu2', label: 'Distribute delegated action list to owners', dueOffsetDays: 2, ownerRole: 'Administrator', closureCriteria: 'Every delegated action has an assigned owner and due date tracked in executive log.', escalationDays: 5, escalateToRole: 'Board Chair' },
    ],
    dependencies: {
      dependsOn: ['qapi_meeting-20260512-09', 'compliance_report_monthly-20260514-01', 'risk_management_committee-20260617-01'],
    },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
    helpArticle: {
      id: 'KB-GV-001',
      title: 'Governing Body Meeting Preparation Checklist',
      topics: ['Packet assembly', 'Compliance report structure', 'QAPI quarterly summary', 'Minutes and approvals', 'Survey-ready file storage'],
    },
  },

  {
    id: 'claims_submission-20260513-01',
    eventSubType: 'claims_submission',
    title: 'Claims Submission Cycle',
    domain: 'Finance',
    date: '2026-05-13',
    allDay: true,
    cadence: 'Biweekly',
    urgency: 'due-soon',
    policyRefs: ['FN-BC-001', 'FN-BC-003'],
    owner: 'R. Patel',
    ownerRole: 'Revenue Cycle Director',
    summary: 'Biweekly claims batch: every claim runs through pre-bill verification, hold resolution, submission, and post-submit reconciliation. No undocumented claim is released.',
    regulatoryDriver: 'Billing & Claims Policy (FN-BC-001) blocks release of documentation-deficient claims. Timely filing must be monitored at the 90 / 180 / 300 day windows.',
    processFlow: [
      {
        id: 's1',
        label: 'Complete pre-billing verification on every claim',
        description: 'Signed POC, locked OASIS, visit documentation, and coder review â€” all present before release.',
        instructions:
          '1. For each claim in the batch, complete the Pre-Billing Verification Checklist (FN-F-001).\n2. Confirm: physician signature on POC, OASIS lock date, visit documentation, coder review, supporting orders.\n3. If any item fails, do not release â€” route to the Hold Register (FN-F-002).',
        expectedOutput: 'Completed Pre-Billing Verification Checklist per claim, signed by the RC Specialist.',
        requiredFormIds: ['FN-F-001'],
        onCompleteText: 'Only claims with complete documentation continue to batch submission.',
        status: 'in-progress',
        dueOffsetDays: -2,
      },
      {
        id: 's2',
        label: 'Resolve held claims and escalate aged items',
        description: 'Work the Hold Register. Clear holds where evidence is now in place. Escalate aged items.',
        instructions:
          '1. Open the Hold Register (FN-F-002) and group holds by reason.\n2. For each cleared hold, record evidence reviewed and approver on release.\n3. Escalate holds aged 14+ days to the owning domain lead; 21+ days to the Administrator.\n4. Confirm no claim is released without the missing artifact actually on file.',
        expectedOutput: 'Updated Hold Register with release decisions and escalations recorded.',
        requiredFormIds: ['FN-F-002'],
        onCompleteText: 'Claims cleared for release join the batch; held claims have named owners and escalation evidence.',
        status: 'in-progress',
        dueOffsetDays: -1,
      },
      {
        id: 's3',
        label: 'Submit the verified claims batch',
        description: 'Transmit the batch and record it in the Batch Log.',
        instructions:
          '1. Transmit the batch through the clearinghouse.\n2. Record batch number, submission date, payor, and claim count in the Batch Log (FN-F-003).\n3. Confirm acceptance message; file the acknowledgment.',
        expectedOutput: 'Batch Log updated with submission metadata and acknowledgment reference.',
        requiredFormIds: ['FN-F-003'],
        onCompleteText: 'Batch is in flight. Reconciliation starts within 48 hours.',
        status: 'pending',
        dueOffsetDays: 0,
      },
      {
        id: 's4',
        label: 'Reconcile post-submission and route rejects',
        description: 'Confirm acceptance for every claim; route any rejections within 48 hours.',
        instructions:
          '1. Within 48 hours of transmission, reconcile every claim against acceptance or reject messages.\n2. Route rejected claims back to clinical or coding with the reject reason.\n3. Update the Batch Log (FN-F-003) with reject detail and resolution owner.\n4. Refresh the aged-claims view and flag anything approaching the 300-day timely-filing limit.',
        expectedOutput: 'Reconciled Batch Log with full acceptance / reject disposition.',
        requiredFormIds: ['FN-F-003'],
        onCompleteText: 'Batch fully reconciled. Revenue is captured and timely-filing risks are visible.',
        status: 'pending',
        dueOffsetDays: 2,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Pre-Billing Verification Checklist', formId: 'FN-F-001', status: 'in-progress', dueOffsetDays: -2 },
      { id: 'ev2', label: 'Billing Hold Register',              formId: 'FN-F-002', status: 'in-progress', dueOffsetDays: -1 },
      { id: 'ev3', label: 'Claims Batch Log',                   formId: 'FN-F-003', status: 'pending',     dueOffsetDays: 0 },
      { id: 'ev4', label: 'Aged Unsigned POC Report',           formId: 'FN-F-004', status: 'pending',     dueOffsetDays: -3 },
    ],
    helpArticle: {
      id: 'KB-FN-001',
      title: 'Pre-Billing & Timely Filing Workflow',
      topics: ['POC signature verification', 'Episode documentation gates', '90/180/300-day filing watch', 'Hold escalation protocol'],
    },
  },

  {
    id: 'system_activity_review-20260513-01',
    eventSubType: 'system_activity_review',
    title: 'System Activity Review',
    domain: 'IT/Security',
    date: '2026-05-13',
    allDay: true,
    cadence: 'Monthly',
    urgency: 'due-soon',
    policyRefs: ['IT-DR-003'],
    owner: 'T. Nguyen',
    ownerRole: 'Information Security Officer',
    summary: 'Monthly review of EHR and network audit logs: identify access anomalies, confirm role-based access is still correct, and open remediation for any finding.',
    regulatoryDriver: 'Information Security policy (IT-DR-003) requires monthly system activity review with documented anomalies and remediation status. Feeds quarterly security reporting and the annual risk analysis.',
    processFlow: [
      {
        id: 's1',
        label: 'Extract audit logs for the review period',
        description: 'Pull EHR and network audit logs; stage them on the review worksheet.',
        instructions:
          '1. Pull EHR audit logs covering the full calendar month.\n2. Pull network / VPN / privileged-access logs for the same window.\n3. Load into the System Activity Review Worksheet (IS-F-001).',
        expectedOutput: 'Staged review worksheet with complete logs for the period.',
        requiredFormIds: ['IS-F-001'],
        onCompleteText: 'Logs are on the worksheet and ready for anomaly review.',
        status: 'complete',
        dueOffsetDays: -3,
      },
      {
        id: 's2',
        label: 'Review anomalies and excess-privilege findings',
        description: 'Flag access anomalies, privilege gaps, and failed-authentication spikes. Triage each finding.',
        instructions:
          '1. Compare access events against role-based entitlements.\n2. Flag every anomaly: unusual after-hours access, excess privilege, repeated failed logins.\n3. For each finding, decide: close (false positive), correct (revise access), escalate (incident triage).\n4. Document the decision on the worksheet.',
        expectedOutput: 'Worksheet annotated with anomalies and disposition for each.',
        requiredFormIds: ['IS-F-001'],
        onCompleteText: 'Access posture for the period has been actively reviewed.',
        status: 'in-progress',
        dueOffsetDays: 0,
      },
      {
        id: 's3',
        label: 'Open remediation items and track to closure',
        description: 'Every finding either closes this month or moves onto the Remediation Tracker with owner and target date.',
        instructions:
          '1. For each finding requiring work, add to the Remediation Tracker (IS-F-002).\n2. Record owner, severity, target date, and verification evidence needed for close.\n3. File the signed worksheet with the month\'s evidence bundle.',
        expectedOutput: 'Updated Remediation Tracker; signed monthly review worksheet filed.',
        requiredFormIds: ['IS-F-002'],
        onCompleteText: 'Month is closed and evidence is survey-ready. Findings carry forward with owners.',
        status: 'pending',
        dueOffsetDays: 7,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'System Activity Review Worksheet', formId: 'IS-F-001', status: 'in-progress', dueOffsetDays: 0 },
      { id: 'ev2', label: 'Remediation Tracker',              formId: 'IS-F-002', status: 'pending',     dueOffsetDays: 7 },
    ],
    helpArticle: {
      id: 'KB-IS-001',
      title: 'Information Security Review',
      topics: ['Monthly activity review', 'Anomaly triage', 'Remediation tracking', 'Quarterly reporting rollup'],
    },
  },

  {
    id: 'agency_holiday-20260525-01',
    eventSubType: 'agency_holiday',
    title: 'Independence Day (Observed)',
    domain: 'Holiday',
    date: '2026-05-25',
    allDay: true,
    cadence: 'Holiday',
    urgency: 'scheduled',
    policyRefs: [],
    owner: 'â€”',
    ownerRole: 'Observed',
    summary: 'Agency observed holiday.',
    isContext: true,
    processFlow: [],
    requiredForms: [],
  },

  {
    id: 'episode_review-20260518-01',
    eventSubType: 'episode_review',
    title: '30-Day Episode Review',
    domain: 'Clinical',
    date: '2026-05-18',
    allDay: true,
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['CL-CP-002'],
    owner: 'S. Ahmed',
    ownerRole: 'Director of Nursing',
    summary: 'Review 30-day episodes for recertification triggers and POC updates.',
    processFlow: [
      { id: 's1', label: 'Episode Pull',      description: 'Extract episodes approaching day 30.',      status: 'complete',    dueOffsetDays: -3 },
      { id: 's2', label: 'Clinical Review',   description: 'Review goals, unsigned orders, recert triggers.', status: 'in-progress', dueOffsetDays: 0 },
      { id: 's3', label: 'Recert Decisions',  description: 'Document recertification or discharge.',     status: 'pending',     dueOffsetDays: 2 },
    ],
    requiredForms: [
      { id: 'ev1', label: '30-Day Episode Summary', formId: 'CL-F-030', status: 'in-progress', dueOffsetDays: 0 },
      { id: 'ev2', label: 'Recert Decision Log',    formId: 'CL-F-031', status: 'pending',     dueOffsetDays: 2 },
    ],
  },

  {
    id: 'compliance_report_monthly-20260514-01',
    eventSubType: 'compliance_report_monthly',
    title: 'Compliance Report (Monthly Draft)',
    domain: 'Compliance',
    date: '2026-05-14',
    allDay: true,
    cadence: 'Monthly',
    urgency: 'critical',
    policyRefs: ['CO-RA-002'],
    owner: 'L. Washington',
    ownerRole: 'Compliance Officer',
    summary: 'Monthly draft of compliance activity. Rolls up into the Quarterly Compliance Report delivered in the Governing Body packet.',
    regulatoryDriver: 'Compliance Reporting Program (CO-RA-002) requires quarterly reports delivered 7 calendar days before each Governing Body meeting, and investigations initiated within 7 calendar days of report receipt.',
    processFlow: [
      {
        id: 's1',
        label: 'Pull compliance indicators for the period',
        description: 'Pull hotline volume, complaints, investigations, audit findings, and training completion.',
        instructions:
          '1. Export hotline and complaint data for the period.\n2. Pull open and closed investigation records.\n3. Pull audit finding status and training completion rates.\n4. Stage in the indicators workbook.',
        expectedOutput: 'Current-period workbook with full indicator set.',
        requiredFormIds: ['CO-F-004'],
        onCompleteText: 'Data is staged. Trend analysis can begin.',
        status: 'in-progress',
        dueOffsetDays: -3,
      },
      {
        id: 's2',
        label: 'Analyze trends and update corrective actions',
        description: 'Identify emerging themes; update corrective actions; assign any new investigations.',
        instructions:
          '1. Review category and time-based trends.\n2. Update each corrective action with current status, evidence, and closure notes.\n3. Assign any new investigations that emerge from the data; ensure 7-day initiation compliance.\n4. Draft the narrative for the monthly roll-up.',
        expectedOutput: 'Narrative draft of the month\'s compliance summary plus updated corrective action log.',
        requiredFormIds: ['CO-F-004'],
        onCompleteText: 'Monthly trends are visible to leadership. Quarterly report gains another data point.',
        status: 'pending',
        dueOffsetDays: -1,
      },
      {
        id: 's3',
        label: 'Distribute draft for administrator review',
        description: 'Route the draft to the Administrator and Governing Body chair.',
        instructions:
          '1. Send the draft to the Administrator and board chair.\n2. Capture feedback and finalize the month\'s rollup.\n3. Store the final monthly snapshot in the quarterly report build folder.',
        expectedOutput: 'Signed monthly compliance rollup in the quarterly build folder.',
        requiredFormIds: ['CO-F-004'],
        onCompleteText: 'Month is closed. Ready for the quarterly consolidation step.',
        status: 'pending',
        dueOffsetDays: 0,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Quarterly Compliance Report', formId: 'CO-F-004', status: 'in-progress', dueOffsetDays: 0 },
    ],
    helpArticle: {
      id: 'KB-CO-001',
      title: 'Compliance Report Review â€” Quarterly Preparation',
      topics: ['Indicator pull', 'Trend analysis', 'Corrective action tracking', 'Quarterly Governing Body submission'],
    },
  },

  {
    id: 'governing_body_prep-20260511-01',
    eventSubType: 'governing_body_prep',
    title: 'Governing Body Mtg (Prep - Owner Brief)',
    domain: 'Governance',
    date: '2026-05-12',  // Tuesday (CES committee meetings mostly Tue/Thu)
    time: '14:00',
    timeEnd: '15:00',
    cadence: 'Ad-hoc',
    urgency: 'due-soon',
    policyRefs: ['GV-GB-001'],
    owner: 'D. Alvarez',
    ownerRole: 'Administrator',
    summary: 'Owner brief: walk through packet gaps before distribution.',
    processFlow: [
      { id: 's1', label: 'Gap Brief', description: 'Walk through packet gaps and ownership.', status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [],
  },

  {
    id: 'compliance_report_weekly-20260511-01',
    eventSubType: 'compliance_report_weekly',
    title: 'Compliance Report (Weekly Snapshot)',
    domain: 'Compliance',
    date: '2026-05-12',  // Tuesday (CES committee meetings mostly Tue/Thu)
    allDay: true,
    cadence: 'Weekly',
    urgency: 'on-track',
    policyRefs: ['CO-RA-002'],
    owner: 'L. Washington',
    ownerRole: 'Compliance Officer',
    summary: 'Rolling weekly snapshot feeding monthly draft.',
    processFlow: [],
    requiredForms: [],
  },

  {
    id: 'security_incidents_review-20260520-01',
    eventSubType: 'security_incidents_review',
    title: 'Security Incidents Review',
    domain: 'IT/Security',
    date: '2026-05-19',  // Tuesday (CES committee meetings mostly Tue/Thu)
    time: '13:00',
    timeEnd: '14:00',
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['IT-DR-005'],
    owner: 'T. Nguyen',
    ownerRole: 'Information Security Officer',
    summary: 'Review of security incidents, access issues, and remediation status.',
    processFlow: [
      { id: 's1', label: 'Incident Roll-Up',  description: 'Consolidate incidents since last review.',  status: 'pending', dueOffsetDays: 0 },
      { id: 's2', label: 'Remediation Check', description: 'Confirm remediation completion.',           status: 'pending', dueOffsetDays: 0 },
    ],
    requiredForms: [],
  },

  {
    id: 'physician_signatures-20260521-01',
    eventSubType: 'physician_signatures',
    title: 'Physician Signatures Due',
    domain: 'Clinical',
    date: '2026-05-21',
    allDay: true,
    cadence: 'Weekly',
    urgency: 'critical',
    policyRefs: ['CL-CP-009', 'FN-BC-003'],
    owner: 'S. Ahmed',
    ownerRole: 'Director of Nursing',
    summary: 'POC signature follow-up across the 7 / 14 / 21-day escalation gates. Claims cannot be released until the signature lands.',
    regulatoryDriver: 'Clinical policy (CL-CP-009) and Billing Hold & Release (FN-BC-003) require Plan of Care signatures tracked at 7 / 14 / 21 day intervals. Unsigned POC episodes stay on billing hold.',
    processFlow: [
      {
        id: 's1',
        label: '7-day follow-up: first physician outreach',
        description: 'Standardized reminder to the physician office for unsigned POCs at the 7-day gate.',
        instructions:
          '1. Pull all episodes with unsigned POC older than 7 days.\n2. Execute first outreach to each physician office (preferred channel).\n3. Log each contact on the Signature Tracker (CL-F-001) with method, contact person, and outcome.',
        expectedOutput: 'Updated Signature Tracker with 7-day outreach logged for every aged episode.',
        requiredFormIds: ['CL-F-001'],
        onCompleteText: 'First outreach is on record. Aged episodes remain visible for 14-day escalation.',
        status: 'in-progress',
        dueOffsetDays: 0,
      },
      {
        id: 's2',
        label: '14-day escalation to physician office manager',
        description: 'Escalate unsigned episodes to the office manager with clear resolution request.',
        instructions:
          '1. Identify episodes still unsigned at 14 days.\n2. Escalate to the office manager with episode summary and outreach history.\n3. Record escalation and response on the Signature Tracker (CL-F-001).\n4. Add to the Aged Unsigned POC Report (FN-F-004).',
        expectedOutput: 'Escalation evidence in the Signature Tracker; 14+ day items visible on the aged report.',
        requiredFormIds: ['CL-F-001', 'FN-F-004'],
        onCompleteText: 'Escalation chain is documented. Next gate is the 21-day billing hold.',
        status: 'pending',
        dueOffsetDays: 7,
      },
      {
        id: 's3',
        label: '21-day billing hold and Clinical Director escalation',
        description: 'Claim stays on hold; Clinical Director owns physician-level resolution.',
        instructions:
          '1. Confirm every 21+ day episode is on the Billing Hold Register (FN-F-002).\n2. Escalate to the Clinical Director. Consider alternate signature channel per clinical policy.\n3. Attach full outreach history so the escalation is actionable.',
        expectedOutput: 'Billing holds confirmed; Clinical Director escalation evidence filed.',
        requiredFormIds: ['FN-F-002', 'CL-F-001'],
        onCompleteText: 'Aged episodes have physician-level accountability. No claim released on unsigned POC.',
        status: 'pending',
        dueOffsetDays: 14,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Plan of Care Signature Tracker', formId: 'CL-F-001', status: 'in-progress', dueOffsetDays: 0 },
      { id: 'ev2', label: 'Aged Unsigned POC Report',       formId: 'FN-F-004', status: 'missing',    dueOffsetDays: 0 },
    ],
    helpArticle: {
      id: 'KB-CL-001',
      title: 'Physician Signature Follow-Up',
      topics: ['7-day outreach', '14-day escalation', '21-day billing hold', 'Alternate signature channels'],
    },
  },

  {
    id: 'denial_management_review-20260521-01',
    eventSubType: 'denial_management_review',
    title: 'Denial Management Review',
    domain: 'Finance',
    date: '2026-05-21',
    time: '10:00',
    timeEnd: '11:00',
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['FN-BC-002'],
    owner: 'R. Patel',
    ownerRole: 'Revenue Cycle Director',
    summary: 'Review denial trends, root causes, and appeal outcomes.',
    processFlow: [],
    requiredForms: [],
  },

  {
    id: 'billing_hold_review-20260521-01',
    eventSubType: 'billing_hold_review',
    title: 'Billing Hold Review',
    domain: 'Finance',
    date: '2026-05-21',
    time: '13:00',
    timeEnd: '14:00',
    cadence: 'Weekly',
    urgency: 'critical',
    policyRefs: ['FN-BC-003'],
    owner: 'R. Patel',
    ownerRole: 'Revenue Cycle Director',
    summary: 'Weekly Hold Register review: surface aged holds, confirm named owners, and release only where documentation evidence is genuinely on file.',
    regulatoryDriver: 'Billing Hold & Release policy (FN-BC-003) blocks release of claims with missing documentation and requires escalation of aged holds at 14 and 21 days.',
    processFlow: [
      {
        id: 's1',
        label: 'Compile the Hold Register and group by reason',
        description: 'Segment holds by root cause â€” missing POC, missing OASIS, coding, clinical.',
        instructions:
          '1. Pull the Hold Register (FN-F-002) for all active holds.\n2. Group by reason. Age each hold in days.\n3. Flag holds where ownership has lapsed.',
        expectedOutput: 'Grouped register ready for triage.',
        requiredFormIds: ['FN-F-002'],
        onCompleteText: 'Visibility on every held claim.',
        status: 'in-progress',
        dueOffsetDays: -1,
      },
      {
        id: 's2',
        label: 'Confirm resolution owners and target release dates',
        description: 'Every hold has a named owner working a specific resolution.',
        instructions:
          '1. Verify the assigned owner is still the right role.\n2. Re-assign stale ownership to the correct function.\n3. Update target release date based on current evidence.',
        expectedOutput: 'Register with fresh owner + target release per hold.',
        onCompleteText: 'Accountability is current.',
        status: 'pending',
        dueOffsetDays: 0,
      },
      {
        id: 's3',
        label: 'Escalate aged holds and authorize releases',
        description: 'Escalate at 14 and 21 days. Release only when evidence is actually on file.',
        instructions:
          '1. Escalate any 14+ day hold to the owning domain lead.\n2. Escalate any 21+ day hold to the Administrator.\n3. For each release, verify the missing artifact is on file; record approver and evidence reviewed on the register.',
        expectedOutput: 'Documented escalations and release approvals per claim.',
        requiredFormIds: ['FN-F-002'],
        onCompleteText: 'Held revenue is either released on evidence or escalated with named accountability.',
        status: 'pending',
        dueOffsetDays: 0,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Billing Hold Register', formId: 'FN-F-002', status: 'in-progress', dueOffsetDays: 0 },
    ],
    helpArticle: {
      id: 'KB-FN-002',
      title: 'Billing Hold Review',
      topics: ['Hold triage', 'Owner confirmation', 'Aged-hold escalation', 'Release discipline'],
    },
  },

  {
    id: 'qapi_dashboard_refresh-20260522-01',
    eventSubType: 'qapi_dashboard_refresh',
    title: 'QAPI Data Dashboard Refresh',
    domain: 'QAPI',
    date: '2026-05-21',  // Thursday (CES committee meetings mostly Tue/Thu)
    allDay: true,
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['QA-PG-003'],
    owner: 'M. Chen',
    ownerRole: 'QAPI Coordinator',
    summary: 'Monthly refresh of QAPI indicator dashboard.',
    processFlow: [],
    requiredForms: [
      { id: 'ev1', label: 'QAPI Data Dashboard', formId: 'QA-F-014', status: 'pending', dueOffsetDays: 0 },
    ],
  },

  {
    id: 'infection_control_review-20260519-01',
    eventSubType: 'infection_control_review',
    title: 'Infection Control Review',
    domain: 'Clinical',
    date: '2026-05-19',
    time: '14:00',
    timeEnd: '15:00',
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['CL-SD-016'],
    owner: 'S. Ahmed',
    ownerRole: 'Director of Nursing',
    summary: 'Review infection trends, exposure reports, and PPE status.',
    processFlow: [],
    requiredForms: [],
  },

  /* â•â•â•â•â•â•â•â•â•â• JUNE 2026 â€” upcoming window â•â•â•â•â•â•â•â•â•â• */

  {
    id: 'qapi_meeting-20260609-10',
    eventSubType: 'qapi_meeting',
    title: 'QAPI Committee Meeting',
    domain: 'QAPI',
    date: '2026-06-04',  // Thursday (CES committee meetings mostly Tue/Thu)
    time: '10:00',
    timeEnd: '12:00',
    cadence: 'Monthly',
    urgency: 'scheduled',
    policyRefs: ['QA-PG-001'],
    owner: 'M. Chen',
    ownerRole: 'QAPI Coordinator',
    location: 'Main Office / Conference Room A',
    workflowId: 'QA-WF-03',
    category: 'committee',
    scopeType: 'previous_calendar_month',
    reportingPeriodStart: '2026-05-01',
    reportingPeriodEnd: '2026-05-31',
    executionWindowStart: '2026-06-05',
    executionWindowEnd: '2026-06-05',
    scheduledDate: '2026-06-05',
    preferredScheduleRule: 'first Friday of the month at 10:00 AM',
    scopeLabel: 'Previous calendar month (May 2026)',
    summary: 'Monthly QAPI review.',
    regulatoryDriver: 'CoP §484.65 QAPI',
    processFlow: [],
    requiredForms: [],
  },

  {
    id: 'risk_management_committee-20260617-01',
    eventSubType: 'risk_management_committee',
    title: 'Risk Management Committee',
    domain: 'Risk',
    date: '2026-06-18',  // Thursday (CES committee meetings mostly Tue/Thu)
    time: '13:00',
    timeEnd: '15:00',
    cadence: 'Quarterly',
    urgency: 'scheduled',
    policyRefs: ['RM-ER-001', 'RM-ER-002'],
    owner: 'J. Okafor',
    ownerRole: 'Risk Manager',
    location: 'Main Office / Conference Room B',
    summary: 'Quarterly Risk Management Committee: review active risks and mitigation plans, confirm 72-hour escalations, and produce the Quarterly Risk Report for the Governing Body.',
    regulatoryDriver: 'Risk Management policy (RM-EM-001) requires quarterly committee meetings with agendas 5 calendar days prior and minutes within 7 calendar days. Sentinel events escalate within 72 hours (RM-ER-002).',
    processFlow: [
      {
        id: 's1',
        label: 'Refresh the enterprise risk register',
        description: 'Update the risk register with new, changed, and closed risks since last quarter.',
        instructions:
          '1. Add new risks identified in the quarter.\n2. Update status on active mitigations.\n3. Close any risk that has met its closure criteria with evidence.',
        expectedOutput: 'Current risk register with severity breakdown.',
        onCompleteText: 'Register reflects current posture.',
        status: 'pending',
        dueOffsetDays: -10,
      },
      {
        id: 's2',
        label: 'Review mitigation plans with risk owners',
        description: 'Each owner reports progress, blockers, and revised closure dates.',
        instructions:
          '1. Walk through each active Mitigation Plan (RM-F-011).\n2. Record status and any revised closure date.\n3. Flag items requiring board awareness.',
        expectedOutput: 'Updated mitigation plans with closure evidence where applicable.',
        requiredFormIds: ['RM-F-011'],
        onCompleteText: 'Mitigations are current and owner-accountable.',
        status: 'pending',
        dueOffsetDays: -7,
      },
      {
        id: 's3',
        label: 'Confirm 72-hour escalations for critical events',
        description: 'Every sentinel / critical event in the quarter has a documented 72-hour escalation.',
        instructions:
          '1. Pull sentinel and critical events for the period.\n2. Confirm each has a timestamped 72-hour escalation record.\n3. Capture any gap as a new action item.',
        expectedOutput: 'Escalation log verified for the quarter.',
        onCompleteText: 'Critical-event discipline is confirmed.',
        status: 'pending',
        dueOffsetDays: -5,
      },
      {
        id: 's4',
        label: 'Produce the Quarterly Risk Report',
        description: 'Finalize the Quarterly Risk Report for the Governing Body packet.',
        instructions:
          '1. Populate RM-F-010 with severity breakdown, mitigation status, and critical events.\n2. Include forward-looking risks for the next quarter.\n3. Route for Administrator review.',
        expectedOutput: 'Signed Quarterly Risk Report attached to the Governing Body packet.',
        requiredFormIds: ['RM-F-010'],
        onCompleteText: 'Risk posture is visible to governance on time.',
        status: 'pending',
        dueOffsetDays: -5,
      },
      {
        id: 's5',
        label: 'Finalize committee minutes',
        description: 'Draft minutes within 7 calendar days of the meeting.',
        instructions:
          '1. Capture attendance and discussion.\n2. Record decisions and delegated follow-up.\n3. File as the quarter\'s committee evidence.',
        expectedOutput: 'Finalized minutes filed with the Quarterly Risk Report.',
        onCompleteText: 'Risk committee quarter is audit-ready.',
        status: 'pending',
        dueOffsetDays: 7,
      },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Quarterly Risk Report',     formId: 'RM-F-010', status: 'pending', dueOffsetDays: -5 },
      { id: 'ev2', label: 'Risk Mitigation Plan',      formId: 'RM-F-011', status: 'pending', dueOffsetDays: -5 },
    ],
    helpArticle: {
      id: 'KB-RM-001',
      title: 'Risk Management Committee Review',
      topics: ['Risk register refresh', 'Mitigation review', 'Critical-event escalation', 'Quarterly Governing Body submission'],
    },
  },

  {
    id: 'policy_review_annual-20260624-01',
    eventSubType: 'policy_review_annual',
    title: 'Policy Review (Annual) â€” IT-SC-001',
    domain: 'Governance',
    date: '2026-06-24',
    allDay: true,
    cadence: 'Annual',
    urgency: 'scheduled',
    policyRefs: ['IT-SC-001'],
    owner: 'D. Alvarez',
    ownerRole: 'Administrator',
    summary: 'Annual lifecycle review cycle.',
    processFlow: [],
    requiredForms: [],
  },

  /* â•â•â•â•â•â•â•â•â•â• APRIL 2026 â€” past / in-window overdue â•â•â•â•â•â•â•â•â•â• */

  {
    id: 'risk_mitigation_plan-20260428-01',
    eventSubType: 'risk_mitigation_plan',
    title: 'Risk Mitigation Plan â€” Infection Control',
    domain: 'Risk',
    date: '2026-04-28',
    allDay: true,
    cadence: 'Ad-hoc',
    urgency: 'overdue',
    policyRefs: ['RM-ER-002', 'CL-SD-016'],
    owner: 'J. Okafor',
    ownerRole: 'Risk Manager',
    summary: 'Mitigation plan past due 12 days â€” blocks QAPI corrective action sign-off.',
    regulatoryDriver: 'Critical risks escalate immediately / within 72 hours depending on severity.',
    processFlow: [],
    requiredForms: [
      { id: 'ev1', label: 'Mitigation Plan', formId: 'RM-F-020', status: 'missing', dueOffsetDays: 0 },
    ],
  },

  {
    id: 'governing_body_minutes-20260422-01',
    eventSubType: 'governing_body_minutes',
    title: 'Q1 Governing Body Minutes Finalize',
    domain: 'Governance',
    date: '2026-04-22',
    allDay: true,
    cadence: 'Quarterly',
    urgency: 'overdue',
    policyRefs: ['GV-GB-001'],
    owner: 'Board Secretary',
    ownerRole: 'Board Secretary',
    summary: 'Q1 minutes draft overdue 18 days â€” survey risk.',
    processFlow: [],
    requiredForms: [
      { id: 'ev1', label: 'Q1 GB Minutes', formId: 'GV-F-002', status: 'missing', dueOffsetDays: 0 },
    ],
  },

  {
    id: 'security_risk_analysis-20260430-01',
    eventSubType: 'security_risk_analysis',
    title: 'Annual Security Risk Analysis',
    domain: 'IT/Security',
    date: '2026-04-30',
    allDay: true,
    cadence: 'Annual',
    urgency: 'overdue',
    policyRefs: ['IT-SC-001'],
    owner: 'T. Nguyen',
    ownerRole: 'Information Security Officer',
    summary: 'Annual security risk analysis not completed â€” HIPAA exposure.',
    processFlow: [],
    requiredForms: [
      { id: 'ev1', label: 'Security Risk Analysis Report', formId: 'IS-F-001', status: 'missing', dueOffsetDays: 0 },
    ],
    complianceFlags: {
      auditRisk: 'critical',
      overdueAfterDays: 0,
      citation: '45 CFR Â§ 164.308(a)(1)(ii)(A) â€” HIPAA Security Rule Risk Analysis',
      surveyorNote: 'Missing annual risk analysis is a top OCR enforcement finding.',
    },
  },

  /* â•â•â•â•â•â•â•â•â•â• AUDIT-DRIVEN ADDITIONS (pre-activation enhancement) â•â•â•â•â•â•â•â•â•â•
     These events were missing from the catalog but are required or strongly
     expected by Medicare CoPs, HIPAA, OSHA, OIG compliance guidance, and
     state home health licensure. Keeping them here establishes the system
     as the complete regulatory execution record. */

  {
    id: 'bbp_training-20260527-01',
    eventSubType: 'bbp_training',
    title: 'Annual OSHA Bloodborne Pathogen Training',
    domain: 'Operations',
    category: 'Annual Staff Training',
    date: '2026-05-27',
    allDay: true,
    cadence: 'Annual',
    urgency: 'due-soon',
    policyRefs: ['RM-OS-003'],
    owner: 'K. Reyes',
    ownerRole: 'HR Training Coordinator',
    summary: 'Annual OSHA bloodborne pathogen exposure control training for all clinical staff. Completion tracked per employee with signed attestation.',
    regulatoryDriver: 'OSHA 29 CFR 1910.1030 requires annual bloodborne pathogen training for all employees with reasonably anticipated occupational exposure. Evidence of completion retained for 3 years.',
    processFlow: [
      { id: 's1', label: 'Publish training roster',      description: 'Pull roster of clinical staff requiring training.', status: 'pending', dueOffsetDays: -14 },
      { id: 's2', label: 'Deliver training sessions',    description: 'Run live or self-paced modules.',                   status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'Collect signed attestations',  description: 'Every participant signs completion attestation.',    status: 'pending', dueOffsetDays: 3 },
      { id: 's4', label: 'File evidence & remediate',    description: 'File signed records; remediate non-completers.',     status: 'pending', dueOffsetDays: 14 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'BBP Training Attestation', formId: 'HR-F-003', status: 'pending', dueOffsetDays: 3 },
      { id: 'ev2', label: 'Training Roster',           formId: 'HR-F-004', status: 'pending', dueOffsetDays: -14 },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 0,
      citation: '29 CFR Â§ 1910.1030(g)(2) â€” Bloodborne Pathogens Training',
      surveyorNote: 'Staff without current BBP training cannot deliver care â€” licensing implication.',
    },
    followUps: [
      { id: 'fu1', label: 'Remediation for non-completers', dueOffsetDays: 30, ownerRole: 'HR Training Coordinator', closureCriteria: '100% of in-scope staff have a signed attestation on file.', escalationDays: 14, escalateToRole: 'Administrator' },
    ],
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'hipaa_training-20260528-01',
    eventSubType: 'hipaa_training',
    title: 'Annual HIPAA Workforce Training',
    domain: 'IT/Security',
    category: 'Annual Staff Training',
    date: '2026-05-28',
    allDay: true,
    cadence: 'Annual',
    urgency: 'due-soon',
    policyRefs: ['IT-UP-004', 'CO-HP-001'],
    owner: 'T. Nguyen',
    ownerRole: 'Information Security Officer',
    summary: 'HIPAA Privacy & Security workforce training for all staff with access to PHI.',
    regulatoryDriver: '45 CFR Â§ 164.530(b) (Privacy) and Â§ 164.308(a)(5) (Security) require workforce training on policies and procedures. Retain evidence for 6 years.',
    processFlow: [
      { id: 's1', label: 'Refresh training content',     description: 'Update per current policy and incidents.', status: 'pending', dueOffsetDays: -30 },
      { id: 's2', label: 'Deliver and record completion', description: 'Deploy module; track completion.',        status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'File attestations',             description: 'Retain 6-year attestation set.',          status: 'pending', dueOffsetDays: 7 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'HIPAA Training Attestation', formId: 'IS-F-010', status: 'pending', dueOffsetDays: 0 },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 0,
      citation: '45 CFR Â§ 164.530(b)(2)(ii) / Â§ 164.308(a)(5)',
      surveyorNote: 'HHS OCR treats missing workforce training evidence as a per-employee violation.',
    },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'ep_exercise-20260528-02',
    eventSubType: 'ep_exercise',
    title: 'Annual Emergency Preparedness Full-Scale Exercise',
    domain: 'Operations',
    category: 'Emergency Preparedness',
    date: '2026-05-28',
    allDay: true,
    cadence: 'Annual',
    urgency: 'due-soon',
    policyRefs: ['RM-EP-001', 'OP-FM-005'],
    owner: 'D. Alvarez',
    ownerRole: 'Administrator',
    summary: 'Annual full-scale or tabletop emergency preparedness exercise. All-hazards; community-based where available.',
    regulatoryDriver: '42 CFR Â§ 484.102 (Emergency Preparedness CoP) requires at least one full-scale (or community-based) exercise and one additional exercise per 12-month cycle. After-action review documented.',
    processFlow: [
      { id: 's1', label: 'Select scenario',        description: 'Scenario informed by risk analysis.',        status: 'pending', dueOffsetDays: -30 },
      { id: 's2', label: 'Execute exercise',       description: 'Run scenario with staff & partners.',        status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'After-action review',    description: 'Document strengths, gaps, decisions.',        status: 'pending', dueOffsetDays: 14 },
      { id: 's4', label: 'Update plan & re-train', description: 'Revise EP plan and re-train on changes.',     status: 'pending', dueOffsetDays: 45 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Emergency Preparedness Exercise Record', formId: 'OP-F-001', status: 'pending', dueOffsetDays: 14 },
    ],
    complianceFlags: {
      auditRisk: 'critical',
      overdueAfterDays: 0,
      citation: '42 CFR Â§ 484.102(d)(2) â€” Emergency Preparedness Testing',
      surveyorNote: 'Missing annual exercise is a Condition-level deficiency.',
    },
    helpArticle: {
      id: 'KB-RM-EP-001',
      title: 'Emergency Preparedness Exercise',
      topics: ['Scenario selection', 'Execution', 'After-action review', 'Plan revision'],
    },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'oig_sam_exclusion_check-20260505-01',
    eventSubType: 'oig_sam_exclusion_check',
    title: 'Monthly OIG/SAM Exclusion Check',
    domain: 'Compliance',
    category: 'Exclusion Screening',
    date: '2026-05-05',
    allDay: true,
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['HR-TA-003'],
    owner: 'L. Washington',
    ownerRole: 'Compliance Officer',
    summary: 'Monthly screening of all employees, contractors, and vendors against OIG LEIE and SAM exclusion lists.',
    regulatoryDriver: 'OIG guidance recommends monthly exclusion screening. Excluded individual payment recovery and CMP exposure per 42 CFR Â§ 1001.1901.',
    processFlow: [
      { id: 's1', label: 'Pull current roster',      description: 'Employees, contractors, vendors with billing/care impact.', status: 'pending', dueOffsetDays: -1 },
      { id: 's2', label: 'Run OIG LEIE + SAM check', description: 'Screen each name; capture screenshots.',                     status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'Disposition any hit',      description: 'Immediate suspension pending verification.',                 status: 'pending', dueOffsetDays: 1 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'OIG/SAM Screening Log', formId: 'CO-F-010', status: 'pending', dueOffsetDays: 0 },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 5,
      citation: '42 CFR Â§ 1001.1901 â€” Payments Based on Excluded Person',
      surveyorNote: 'Missing exclusion screening is a direct False Claims Act exposure.',
    },
    followUps: [
      { id: 'fu1', label: 'Immediate suspension if hit confirmed', dueOffsetDays: 0, ownerRole: 'Administrator', closureCriteria: 'Excluded individual removed from payroll/assignment with documented timeline.' },
    ],
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'clinical_record_audit-20260526-01',
    eventSubType: 'clinical_record_audit',
    title: 'Monthly Clinical Record Audit',
    domain: 'Clinical',
    category: 'Clinical Record QA',
    date: '2026-05-26',
    allDay: true,
    cadence: 'Monthly',
    urgency: 'on-track',
    policyRefs: ['CO-DC-002', 'CL-CP-001'],
    owner: 'S. Ahmed',
    ownerRole: 'Director of Nursing',
    summary: 'Random sample audit of clinical records: POC completeness, visit frequency adherence, OASIS accuracy, orders, coordination-of-care notes.',
    regulatoryDriver: '42 CFR Â§ 484.110 (Clinical records). Findings feed QAPI indicators.',
    processFlow: [
      { id: 's1', label: 'Select statistically valid sample', description: 'Minimum 10% of active episodes or 20 records.', status: 'pending', dueOffsetDays: -5 },
      { id: 's2', label: 'Audit against checklist',            description: 'Use CL-F-020 record audit tool.',              status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'Open corrective actions',            description: 'For each deficiency, open action in QAPI tracker.', status: 'pending', dueOffsetDays: 3 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Clinical Record Audit Tool',    formId: 'CL-F-020', status: 'pending', dueOffsetDays: 0 },
      { id: 'ev2', label: 'Clinical Audit Findings Log',   formId: 'CL-F-021', status: 'pending', dueOffsetDays: 3 },
    ],
    complianceFlags: {
      auditRisk: 'medium',
      overdueAfterDays: 7,
      citation: '42 CFR Â§ 484.110',
    },
    dependencies: { feeds: ['qapi_meeting-20260512-09'] },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'vulnerability_scan-20260529-01',
    eventSubType: 'vulnerability_scan',
    title: 'Quarterly Vulnerability Scan',
    domain: 'IT/Security',
    category: 'Security Testing',
    date: '2026-05-29',
    allDay: true,
    cadence: 'Quarterly',
    urgency: 'on-track',
    policyRefs: ['IT-SC-001'],
    owner: 'T. Nguyen',
    ownerRole: 'Information Security Officer',
    summary: 'Quarterly external and internal vulnerability scan. Critical findings remediated within 30 days.',
    regulatoryDriver: 'HIPAA Security Rule Â§ 164.308(a)(1)(ii)(B) Risk Management â€” periodic technical evaluation.',
    processFlow: [
      { id: 's1', label: 'Run scans',                 description: 'External & internal scans against in-scope systems.', status: 'pending', dueOffsetDays: 0 },
      { id: 's2', label: 'Triage critical findings',  description: 'Rate CVSS; assign owners.',                            status: 'pending', dueOffsetDays: 3 },
      { id: 's3', label: 'Remediate & re-scan',       description: 'Close or document compensating controls.',             status: 'pending', dueOffsetDays: 30 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Vulnerability Scan Report', formId: 'IS-F-020', status: 'pending', dueOffsetDays: 0 },
      { id: 'ev2', label: 'Remediation Tracker',       formId: 'IS-F-002', status: 'pending', dueOffsetDays: 30 },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 7,
      citation: '45 CFR Â§ 164.308(a)(1)(ii)(B)',
    },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'compliance_effectiveness_review-20260530-01',
    eventSubType: 'compliance_effectiveness_review',
    title: 'Annual Compliance Program Effectiveness Review',
    domain: 'Compliance',
    category: 'Compliance Program',
    date: '2026-05-30',
    allDay: true,
    cadence: 'Annual',
    urgency: 'on-track',
    policyRefs: ['CO-CP-001'],
    owner: 'L. Washington',
    ownerRole: 'Compliance Officer',
    summary: 'Annual evaluation of the 7 elements of an effective compliance program (OIG). Findings reported to Governing Body.',
    regulatoryDriver: 'OIG Compliance Program Guidance for Home Health Agencies. Governing-body visibility per Â§ 484.105.',
    processFlow: [
      { id: 's1', label: 'Self-assess 7 OIG elements',  description: 'Against current state + evidence.',            status: 'pending', dueOffsetDays: -30 },
      { id: 's2', label: 'Independent review (annual)', description: 'Committee or independent reviewer sign-off.',  status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'Board report & workplan',     description: 'Present to Governing Body with gap closure workplan.', status: 'pending', dueOffsetDays: 21 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Compliance Program Effectiveness Report', formId: 'CO-F-020', status: 'pending', dueOffsetDays: 0 },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 0,
      citation: 'OIG CPG for Home Health (7 Elements)',
    },
    dependencies: { feeds: ['governing_body_meeting-20260514-01'] },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'coi_disclosure-20260531-01',
    eventSubType: 'coi_disclosure',
    title: 'Annual Conflict of Interest Disclosure Cycle',
    domain: 'Governance',
    category: 'Governance Certifications',
    date: '2026-05-31',
    allDay: true,
    cadence: 'Annual',
    urgency: 'on-track',
    policyRefs: ['GV-GB-003'],
    owner: 'D. Alvarez',
    ownerRole: 'Administrator',
    summary: 'Annual COI disclosure from board members and officers. Tracked conflicts added to governance log.',
    regulatoryDriver: 'Corporate governance best practice; relevant to OIG independence expectations and CMS ownership disclosure.',
    processFlow: [
      { id: 's1', label: 'Distribute COI form', description: 'Send to all board members and officers.', status: 'pending', dueOffsetDays: -30 },
      { id: 's2', label: 'Collect disclosures', description: 'Track 100% receipt.',                      status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'Review & log',        description: 'Flag active conflicts; apply recusal.',    status: 'pending', dueOffsetDays: 14 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Conflict of Interest Disclosure', formId: 'GV-F-010', status: 'pending', dueOffsetDays: 0 },
    ],
    complianceFlags: { auditRisk: 'medium', overdueAfterDays: 14 },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'sentinel_event_rca-20260515-01',
    eventSubType: 'sentinel_event_rca',
    title: 'Sentinel Event Root Cause Analysis (Trigger)',
    domain: 'Risk',
    category: 'Sentinel Event',
    date: '2026-05-15',
    allDay: true,
    cadence: 'Trigger-based',
    urgency: 'critical',
    policyRefs: ['RM-ER-002'],
    owner: 'J. Okafor',
    ownerRole: 'Risk Manager',
    summary: 'Triggered when a sentinel event is reported. 72-hour initial escalation; RCA completed within 30 days.',
    regulatoryDriver: 'State sentinel event reporting and internal policy RM-ER-002. Feeds QAPI and Governing Body.',
    processFlow: [
      { id: 's1', label: '72-hour escalation',    description: 'Notify Administrator and Risk Committee chair.',     status: 'pending', dueOffsetDays: 0 },
      { id: 's2', label: 'Assemble RCA team',     description: 'Cross-functional team convenes within 7 days.',       status: 'pending', dueOffsetDays: 3 },
      { id: 's3', label: 'Complete RCA',          description: 'Root causes identified; corrective actions drafted.', status: 'pending', dueOffsetDays: 30 },
      { id: 's4', label: 'Implement & verify',    description: 'Actions implemented; effectiveness verified.',         status: 'pending', dueOffsetDays: 90 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Sentinel Event Report', formId: 'RM-F-030', status: 'pending', dueOffsetDays: 0 },
      { id: 'ev2', label: 'RCA Report',            formId: 'RM-F-031', status: 'pending', dueOffsetDays: 30 },
    ],
    complianceFlags: {
      auditRisk: 'critical',
      overdueAfterDays: 0,
      citation: 'State sentinel event reporting; internal RM-ER-002.',
      surveyorNote: 'Missing 72-hour escalation evidence is a red-flag finding.',
    },
    dependencies: { feeds: ['qapi_meeting-20260512-09', 'governing_body_meeting-20260514-01'] },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  {
    id: 'competency_validation-20260529-01',
    eventSubType: 'competency_validation',
    title: 'Quarterly Competency Validation Cycle',
    domain: 'Operations',
    category: 'Clinical Competency',
    date: '2026-05-29',
    allDay: true,
    cadence: 'Quarterly',
    urgency: 'on-track',
    policyRefs: ['HR-TD-003'],
    owner: 'K. Reyes',
    ownerRole: 'HR Training Coordinator',
    summary: 'Quarterly validation of clinical competencies per role (skills fair / direct observation / return demonstration).',
    regulatoryDriver: '42 CFR Â§ 484.80 (Personnel Qualifications / Home Health Aide competency). State clinical licensure ongoing-competency expectations.',
    processFlow: [
      { id: 's1', label: 'Schedule validations', description: 'By role / skill area.',                      status: 'pending', dueOffsetDays: -21 },
      { id: 's2', label: 'Execute sessions',     description: 'Direct observation / return demonstration.', status: 'pending', dueOffsetDays: 0 },
      { id: 's3', label: 'Remediation plans',    description: 'For any failed competency.',                  status: 'pending', dueOffsetDays: 21 },
    ],
    requiredForms: [
      { id: 'ev1', label: 'Competency Validation Record', formId: 'HR-F-020', status: 'pending', dueOffsetDays: 0 },
      { id: 'ev2', label: 'Remediation Plan',             formId: 'HR-F-021', status: 'pending', dueOffsetDays: 21 },
    ],
    complianceFlags: {
      auditRisk: 'high',
      overdueAfterDays: 0,
      citation: '42 CFR Â§ 484.80(h) â€” HHA Competency',
    },
    sourceOfTruth: 'app',
    timezone: 'America/Los_Angeles',
  },

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     Q1 2026 BLUEPRINT EVENT SET
     These events align to the mandated-events blueprint schedule.
     Workflow steps are post-event start â€” forms/evidence are completed
     DURING the workflow, not before the event is scheduled.
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

  {
    id: 'governance_packet_review-20260108-01',
    eventSubType: 'governance_packet_review',
    title: 'Annual Governance Packet Review',
    domain: 'Governance',
    date: '2026-01-08',
    time: '09:00',
    timeEnd: '11:00',
    cadence: 'Annual',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['GV-GB-001', 'GV-GB-002'],
    owner: 'Administrator',
    ownerRole: 'Administrator',
    summary: 'Annual board review of the institutional plan, budget, acceptance-to-service criteria, and public-facing service information.',
    regulatoryDriver: '42 CFR Â§484.105(b) â€” Governing Body CoP. The Governing Body must annually review and approve the agency institutional plan, budget, acceptance-to-service criteria, patient rights, and public-facing program information.',
    category: 'board-annual',
    processFlow: [
      {
        id: 'gvpkt-assemble', label: 'Assemble governance packet',
        description: 'Compile: annual budget, institutional plan, acceptance-to-service criteria, patient rights notice, public-facing service information. Verify all documents are current-year versions.',
        instructions: 'Pull documents from policy management system. Flag any that have not been updated within the past 12 months for review.',
        expectedOutput: 'Draft governance packet (all 4 documents + cover sheet)',
        dueOffsetDays: -14, status: 'pending',
      },
      {
        id: 'gvpkt-admin-review', label: 'Administrator pre-review',
        description: 'Administrator reviews packet for accuracy and regulatory alignment. Annotates any changes required.',
        dueOffsetDays: -7, status: 'pending',
      },
      {
        id: 'gvpkt-board-review', label: 'Governing Body review and vote',
        description: 'Board reviews each document. Motions to approve are recorded. Any revisions noted before re-vote.',
        instructions: 'Quorum required. Record votes in minutes. Attach approved versions to the packet.',
        dueOffsetDays: 0, status: 'pending',
        onCompleteText: 'Governing Body approval recorded.',
      },
      {
        id: 'gvpkt-minutes', label: 'Draft and circulate minutes',
        description: 'Record all motions, approvals, and action items from the review session.',
        dueOffsetDays: 5, status: 'pending',
      },
      {
        id: 'gvpkt-file', label: 'File approved packet',
        description: 'File signed/approved packet with dated version stamps in the governance record.',
        dueOffsetDays: 7, status: 'pending',
        onCompleteText: 'Packet archived; next annual review due Jan 2027.',
      },
    ],
    requiredForms: [
      { id: 'gvpkt-budget',      label: 'Annual Budget (approved)',               formId: 'GV-FM-010', status: 'missing', dueOffsetDays: 0 },
      { id: 'gvpkt-instplan',    label: 'Institutional Plan (current year)',       formId: 'GV-FM-011', status: 'missing', dueOffsetDays: 0 },
      { id: 'gvpkt-acceptance',  label: 'Acceptance-to-Service Criteria',         formId: 'GV-FM-012', status: 'missing', dueOffsetDays: 0 },
      { id: 'gvpkt-rights',      label: 'Patient Rights Notice (public-facing)',  formId: 'GV-FM-013', status: 'missing', dueOffsetDays: 0 },
      { id: 'gvpkt-minutes-doc', label: 'Governing Body Approval Minutes',        formId: 'GV-FM-002', status: 'missing', dueOffsetDays: 7 },
    ],
    minutes: {
      status: 'missing', dueOffsetDays: 7,
      requiredSections: ['Attendance & Quorum', 'Annual Budget Review', 'Institutional Plan Approval', 'Acceptance-to-Service Review', 'Patient Rights & Public Information', 'Resolutions & Approvals', 'Adjournment'],
      signOffRoles: ['Board Chair', 'Board Secretary'],
    },
    approvals: [
      { id: 'gvpkt-rule-budget', targetKind: 'form', targetLabel: 'Annual Budget', approverRole: 'Board Chair', required: true, escalationDays: 7 },
      { id: 'gvpkt-rule-event',  targetKind: 'event', targetLabel: 'Annual Governance Packet', approverRole: 'Board Chair', required: true, escalationDays: 10 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.105(b) â€” Governing Body Condition of Participation',
      surveyorNote: 'Missing or undated institutional plan or budget is a direct CoP deficiency. All 4 packet elements must be present with approval dates.',
    },
    followUps: [
      { id: 'gvpkt-fu-policy', label: 'Update any policies flagged during review', ownerRole: 'Administrator', dueOffsetDays: 60, closureCriteria: 'Updated policies approved and filed', escalationDays: 14 },
    ],
    dependencies: { feeds: ['governing_body_meeting-20260514-01'] },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'ep_plan_review-20260115-01',
    eventSubType: 'ep_plan_review',
    title: 'Biennial Emergency Preparedness Plan Review & Update',
    domain: 'Operations',
    date: '2026-01-15',
    time: '09:00',
    timeEnd: '12:00',
    cadence: 'Biennial',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['RM-EP-001', 'OP-FM-005'],
    owner: 'Administrator',
    ownerRole: 'Administrator',
    summary: 'Full biennial review and update of all four EP plan elements: risk assessment, EP plan, policies/procedures, and communication plan.',
    regulatoryDriver: '42 CFR Â§484.102 â€” Emergency Preparedness CoP. HHAs must review and update their EP plan every two years. All four elements (risk assessment, EP plan, policies/procedures, communication plan) must be reviewed and re-approved.',
    category: 'ep-biennial-review',
    processFlow: [
      {
        id: 'ep-rev-assemble', label: 'Assemble current EP plan for review',
        description: 'Pull current EP plan with all four elements. Flag elements last updated > 2 years ago as mandatory update targets.',
        dueOffsetDays: -14, status: 'pending',
      },
      {
        id: 'ep-rev-riskassess', label: 'Review and update risk assessment',
        description: 'Reassess hazard vulnerability analysis (HVA). Update probabilities and impact scores. Document rationale for changes.',
        instructions: 'Use CMS-approved HVA template. Compare against prior version. All material changes must be noted.',
        expectedOutput: 'Updated HVA with comparison notes',
        dueOffsetDays: -7, status: 'pending',
      },
      {
        id: 'ep-rev-plan', label: 'Review and update EP plan (all elements)',
        description: 'Review all four plan elements against current HVA findings. Update continuity-of-operations procedures, evacuation plans, shelter-in-place, communication trees.',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'ep-rev-approve', label: 'Administrator approval + version stamp',
        description: 'Administrator signs version-stamped EP plan. All four elements must be signed and dated.',
        dueOffsetDays: 5, status: 'pending',
        onCompleteText: 'EP plan approved; next biennial review due Jan 2028.',
      },
      {
        id: 'ep-rev-file', label: 'Archive versioned plan',
        description: 'File approved EP plan with version number and approval date. Distribute to all staff.',
        dueOffsetDays: 7, status: 'pending',
      },
    ],
    requiredForms: [
      { id: 'ep-rev-hva',    label: 'Hazard Vulnerability Analysis (updated)',  formId: 'RM-FM-001', status: 'missing', dueOffsetDays: 0 },
      { id: 'ep-rev-plan-f', label: 'Emergency Preparedness Plan (all 4 elements)', formId: 'RM-F-020', status: 'missing', dueOffsetDays: 5 },
      { id: 'ep-rev-polpro', label: 'EP Policies & Procedures',                formId: 'CL-FM-043', status: 'missing', dueOffsetDays: 5 },
      { id: 'ep-rev-comm',   label: 'Communication Plan',                       formId: 'RM-FM-002', status: 'missing', dueOffsetDays: 5 },
      { id: 'ep-rev-sig',    label: 'EP Plan Approval Signature Page',          formId: 'EN-FM-008', status: 'missing', dueOffsetDays: 7 },
    ],
    approvals: [
      { id: 'ep-rev-rule-plan', targetKind: 'form', targetLabel: 'EP Plan (all 4 elements)', approverRole: 'Administrator', required: true, escalationDays: 7 },
      { id: 'ep-rev-rule-event', targetKind: 'event', targetLabel: 'Biennial EP Plan Review', approverRole: 'Administrator', required: true, escalationDays: 10 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.102(a)â€“(b) â€” Emergency Preparedness Plan & Policies',
      surveyorNote: 'Missing or undated EP plan is a direct CoP deficiency. All four elements must have a current review date. Version stamps required.',
    },
    followUps: [
      { id: 'ep-rev-fu-train', label: 'Initiate EP training if plan materially changed', ownerRole: 'Administrator', dueOffsetDays: 30, closureCriteria: 'Training completed or change deemed non-material', escalationDays: 14 },
    ],
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'ep_staff_training-20260122-01',
    eventSubType: 'ep_staff_training',
    title: 'Biennial Emergency Preparedness Staff Training',
    domain: 'Operations',
    date: '2026-01-22',
    time: '08:00',
    timeEnd: '12:00',
    cadence: 'Biennial',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['RM-EP-001'],
    owner: 'Administrator',
    ownerRole: 'Administrator',
    summary: 'Biennial staff training on emergency preparedness policies and procedures. Also triggered when the EP plan has materially changed.',
    regulatoryDriver: '42 CFR Â§484.102(c) â€” Emergency Preparedness Training. All HHA staff must be trained on EP policies and procedures every two years and whenever the EP plan is materially updated.',
    category: 'ep-biennial-training',
    processFlow: [
      {
        id: 'ep-trn-curriculum', label: 'Develop / update training curriculum',
        description: 'Update training slides and materials to reflect any EP plan changes since last training cycle.',
        dueOffsetDays: -14, status: 'pending',
      },
      {
        id: 'ep-trn-schedule', label: 'Schedule sessions and notify staff',
        description: 'Schedule all-staff training sessions; notify staff of mandatory attendance requirements.',
        dueOffsetDays: -7, status: 'pending',
      },
      {
        id: 'ep-trn-deliver', label: 'Deliver training to all staff',
        description: 'Deliver EP training to 100% of staff. Capture attendance roster with dates and signatures.',
        instructions: 'Separate in-person and remote attendance rosters. Any staff who miss primary session must attend make-up. Document no-shows for follow-up.',
        expectedOutput: 'Signed attendance rosters covering all staff',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'ep-trn-verify', label: 'Verify 100% completion and file evidence',
        description: 'Cross-reference roster against active staff list. Chase outstanding completions. File signed rosters.',
        dueOffsetDays: 7, status: 'pending',
        onCompleteText: 'Training cycle closed; next biennial training due Jan 2028.',
      },
    ],
    requiredForms: [
      { id: 'ep-trn-roster',      label: 'Training Attendance Roster (all sessions)', formId: 'OP-FM-040', status: 'missing', dueOffsetDays: 7 },
      { id: 'ep-trn-curriculum-f',label: 'Training Curriculum / Agenda',              formId: 'OP-FM-041', status: 'missing', dueOffsetDays: -7 },
      { id: 'ep-trn-trainer',     label: 'Trainer Credentials / Role Verification',   formId: 'OP-FM-042', status: 'missing', dueOffsetDays: 0 },
    ],
    approvals: [
      { id: 'ep-trn-rule-event', targetKind: 'event', targetLabel: 'EP Training Cycle', approverRole: 'Administrator', required: true, escalationDays: 14 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.102(c) â€” Emergency Preparedness Training & Testing',
      surveyorNote: 'Training rosters must account for 100% of staff. Undocumented staff are treated as untrained by surveyors.',
    },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'qapi_meeting-20260205-04',
    eventSubType: 'qapi_meeting',
    title: 'Quarterly QAPI Governance Review & Annual PIP Kickoff',
    domain: 'QAPI',
    date: '2026-02-05',
    time: '13:00',
    timeEnd: '15:00',
    cadence: 'Quarterly',
    mandateType: 'policy-driven',
    urgency: 'scheduled',
    policyRefs: ['QA-PI-001', 'QA-PI-002'],
    owner: 'QAPI Coordinator',
    ownerRole: 'QAPI Coordinator',
    summary: 'Policy-driven quarterly QAPI governance review: dashboard, action log, escalation. Q1 occurrence also kicks off the annual PIP with baseline and improvement target.',
    regulatoryDriver: '42 CFR Â§484.65 â€” QAPI CoP requires at least one agency-wide PIP per calendar year. The quarterly governance review cadence is agency policy-driven (NOT a universal federal quarterly mandate). Annual PIP must include baseline measurement, target, intervention, remeasurement, and sustainment evidence.',
    category: 'qapi-quarterly-governance',
    processFlow: [
      { id: 'qapi-gov-dashboard', label: 'Compile Q1 QAPI data dashboard', description: 'Pull OASIS outcome reports, HHVBP metrics, adverse events, hotline activity, and infection surveillance data.', instructions: '1. Pull Q1 OASIS quality metrics\n2. Pull infection event log from IC coordinator\n3. Pull complaint/grievance log\n4. Pull HHCAHPS data if available\n5. Set annual baselines for all tracked indicators\n6. Complete QA-FM-020', expectedOutput: 'Q1 Data Dashboard (QA-FM-020) with baselines for all tracked indicators', requiredFormIds: ['QA-FM-020'], onCompleteText: 'Q1 dashboard compiled with annual baselines set.', status: 'pending', dueOffsetDays: -7 },
      { id: 'qapi-gov-chart-audit', label: 'Complete Q1 chart audits', description: 'Minimum 10% stratified sample chart audit.', instructions: '1. Select 10% sample of active records\n2. Audit: OASIS completeness, POC currency, physician signatures, timeliness, medication reconciliation\n3. Complete QA-FM-025 Audit Summary', expectedOutput: 'Q1 Chart Audit Summary (QA-FM-025)', requiredFormIds: ['QA-FM-025'], onCompleteText: 'Q1 chart audits complete.', status: 'pending', dueOffsetDays: -5 },
      { id: 'qapi-gov-pip-baseline', label: 'Establish annual PIP baseline and charter', description: 'Select PIP topic from Q1 QAPI data. Establish baseline measure, improvement target, and intervention plan for the calendar year.', instructions: '1. Review Q1 dashboard for high-risk, high-volume, or problem-prone indicators\n2. Select PIP topic based on data and Governing Body priorities\n3. Establish baseline measurement (Q1 rate)\n4. Set annual target with rationale\n5. Define intervention plan with owner, timeline, and measurement frequency\n6. Complete PIP Charter (QA-FM-021) with all required fields\n7. At least one PIP required per calendar year per 42 CFR Â§484.65(d)', expectedOutput: 'Signed PIP Charter (QA-FM-021) with baseline, target, intervention plan, and remeasurement schedule', requiredFormIds: ['QA-FM-021'], onCompleteText: 'Annual PIP charter complete with baseline. Intervention begins per charter schedule.', status: 'pending', dueOffsetDays: 0 },
      { id: 'qapi-gov-review', label: 'Conduct Q1 QAPI governance review session', description: 'Full Q1 QAPI review per structured agenda.', instructions: '1. Confirm quorum: Administrator, DON, Clinical Manager, QA/Compliance, IC Lead\n2. Walk through Q1 dashboard\n3. Review Q1 incident summary\n4. IC presents Q1 data\n5. Present and ratify PIP charter\n6. Assign corrective actions\n7. Identify GB escalation items\n8. Attestation and sign-off', expectedOutput: 'Q1 QAPI review complete with PIP charter ratified and actions assigned', requiredFormIds: ['QA-FM-024'], onCompleteText: 'Q1 QAPI governance review complete.', status: 'pending', dueOffsetDays: 0 },
      { id: 'qapi-gov-minutes', label: 'Finalize Q1 meeting minutes within 7 days', description: 'Draft, sign, and file within 7 calendar days.', instructions: '1. Complete QA-FM-024 with Q1 discussion\n2. Include PIP charter ratification vote\n3. Obtain signatures: Administrator, Clinical Manager, QAPI Committee Chair', expectedOutput: 'Signed Q1 QAPI Minutes (QA-FM-024) filed in audit repository', requiredFormIds: ['QA-FM-024'], onCompleteText: 'Q1 minutes filed.', status: 'pending', dueOffsetDays: 7 },
      { id: 'qapi-gov-govbody', label: 'Submit Q1 QAPI Report to Governing Body', description: 'Deliver quarterly QAPI report with PIP charter to Governing Body 7 days before board meeting.', instructions: '1. Complete QA-FM-023 Q1 report\n2. Include PIP charter summary\n3. Administrator signs off\n4. Submit 7 days before Q1 Governing Body meeting', expectedOutput: 'Signed Q1 QAPI Governance Report to GB with submission record', requiredFormIds: ['QA-FM-023'], onCompleteText: 'Q1 QAPI report delivered to Governing Body.', status: 'pending', dueOffsetDays: 7 },
    ],
    requiredForms: [
      { id: 'qapi-gov-dashboard-f',  label: 'Q1 QAPI Data Dashboard',         formId: 'QA-FM-020', status: 'missing', dueOffsetDays: -7 },
      { id: 'qapi-gov-pip-charter',  label: 'Annual PIP Charter',              formId: 'QA-FM-021', status: 'missing', dueOffsetDays:  0 },
      { id: 'qapi-gov-action-log',   label: 'QAPI Action Item Log',            formId: 'QA-FM-022', status: 'missing', dueOffsetDays:  3 },
      { id: 'qapi-gov-report-f',     label: 'Quarterly QAPI Governance Report',formId: 'QA-FM-023', status: 'missing', dueOffsetDays:  7 },
      { id: 'qapi-gov-minutes-f',    label: 'QAPI Meeting Minutes Q1',         formId: 'QA-FM-024', status: 'missing', dueOffsetDays:  7 },
      { id: 'qapi-gov-audit-f',      label: 'Chart Audit Summary Q1',          formId: 'QA-FM-025', status: 'missing', dueOffsetDays: -5 },
    ],
    minutes: {
      status: 'missing', dueOffsetDays: 7, assignee: 'QAPI Coordinator',
      requiredSections: ['Attendance & quorum confirmation', 'Q1 dashboard review â€” all indicators with annual baselines set', 'Q1 incident analysis', 'Q1 IC data integration', 'Annual PIP charter ratification vote and outcome', 'New corrective actions with owners', 'GB escalation items', 'Attestation', 'Next meeting date'],
      signOffRoles: ['Administrator', 'Clinical Manager', 'QAPI Committee Chair'],
    },
    agenda: {
      distributeBusinessDaysBefore: 5,
      standingTopics: [
        { id: 'q1-t1', title: 'Opening & Compliance Validation', discussionPoints: ['Confirm quorum', 'Disclose COI', 'This is the Q1 kick-off â€” annual PIP charter will be established today'], durationMin: 10 },
        { id: 'q1-t2', title: 'Q1 Dashboard Review â€” Annual Baseline Setting', discussionPoints: ['Q1 indicator results become annual baselines for all tracked measures', 'Identify high-risk, high-volume, or problem-prone indicators', 'Select annual PIP topic from Q1 data'], requiredInputs: ['QA-FM-020 Q1 Dashboard', 'QA-FM-025 Chart Audit'], owner: 'QAPI Lead', durationMin: 30 },
        { id: 'q1-t3', title: 'Annual PIP Charter Ratification', discussionPoints: ['Present selected PIP topic with baseline data', 'Committee confirms: indicator, baseline rate, annual target, intervention plan, measurement schedule', 'Vote to ratify PIP charter'], requiredInputs: ['QA-FM-021 PIP Charter draft'], owner: 'QAPI Lead', durationMin: 25 },
        { id: 'q1-t4', title: 'Q1 Incident & IC Analysis', discussionPoints: ['Q1 incidents by category', 'IC Q1 data â€” any QAPI-actionable trends?'], requiredInputs: ['QA-FM-026 Incident Log', 'QA-FM-027 IC Log'], owner: 'Clinical Manager', durationMin: 20 },
        { id: 'q1-t5', title: 'Q1 Corrective Actions & GB Escalation', discussionPoints: ['Assign Q1 corrective actions with owners', 'Identify items for GB report'], durationMin: 20 },
        { id: 'q1-t6', title: 'Closing & Attestation', discussionPoints: ['Confirm all actions assigned', 'All present attest', 'Q2 review date confirmed'], durationMin: 10 },
      ],
      dataInputs: [
        { label: 'Q1 QAPI Data Dashboard', formId: 'QA-FM-020', owner: 'QAPI Lead' },
        { label: 'Q1 Chart Audit Summary', formId: 'QA-FM-025', owner: 'Clinical Manager' },
        { label: 'PIP Charter Draft', formId: 'QA-FM-021', owner: 'QAPI Lead' },
      ],
    },
    approvals: [
      { id: 'qapi-gov-rule-pip',   targetKind: 'form',    targetLabel: 'Annual PIP Charter',                   approverRole: 'QAPI Committee Chair', required: true, escalationDays: 7 },
      { id: 'qapi-gov-rule-min',   targetKind: 'minutes', targetLabel: 'Q1 QAPI Meeting Minutes',              approverRole: 'QAPI Committee Chair', required: true, escalationDays: 7, escalateToRole: 'Administrator' },
      { id: 'qapi-gov-rule-event', targetKind: 'report',  targetLabel: 'Q1 QAPI Governance Report to GB',      approverRole: 'Administrator',        required: true, escalationDays: 5 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.65 â€” QAPI CoP; Â§484.65(d) â€” Annual PIP requirement',
      surveyorNote: 'Q1 is the PIP initiation point. If a PIP charter with documented baseline and target cannot be produced, the annual PIP requirement is unfulfilled. This is a direct Â§484.65(d) deficiency.',
      missingEvidenceIf: ['missing', 'pending'],
    },
    followUps: [
      { id: 'qapi-gov-fu-pip',    label: 'Execute PIP interventions per charter schedule',     ownerRole: 'QAPI Coordinator', dueOffsetDays: 30, closureCriteria: 'First intervention steps documented in QA-FM-021.', escalationDays: 14, escalateToRole: 'Administrator' },
      { id: 'qapi-gov-fu-gb',     label: 'Submit Q1 QAPI report to Governing Body',           ownerRole: 'QAPI Coordinator', dueOffsetDays: 7,  closureCriteria: 'QA-FM-023 submitted with GB receipt.', escalationDays: 3, escalateToRole: 'Administrator' },
    ],
    dependencies: { feeds: ['governing_body_meeting-20260514-01', 'qapi_meeting-20260507-08'], dependsOn: [] },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'hha_aide_inservice-20260209-01',
    eventSubType: 'hha_aide_inservice',
    title: 'Annual Aide In-Service Training Campaign',
    domain: 'Clinical',
    date: '2026-02-09',
    endDate: '2026-02-20',
    allDay: true,
    cadence: 'Annual',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-006'],
    owner: 'Director of Nursing',
    ownerRole: 'Director of Nursing',
    summary: 'Annual in-service training for home health aides. Minimum 12 hours required per aide per calendar year. RN supervision and educator documentation required.',
    regulatoryDriver: '42 CFR Â§484.80(b)(3) â€” Home Health Aide Services. Each aide must receive at least 12 hours of in-service training annually. Training must be supervised by an RN.',
    category: 'hha-annual-inservice',
    processFlow: [
      {
        id: 'hha-inserv-plan', label: 'Develop in-service curriculum (â‰¥12 hrs)',
        description: 'Design training schedule covering at least 12 hours. Topics must address QAPI-identified care concerns, infection control, patient rights, and competency gaps from prior year.',
        instructions: 'Curriculum must include: infection control update, patient rights, medication safety, and at least one topic from QAPI corrective actions. RN must be listed as educator.',
        dueOffsetDays: -14, status: 'pending',
      },
      {
        id: 'hha-inserv-roster', label: 'Build aide roster and schedule',
        description: 'Roster all active aides. Schedule sessions to achieve 100% attendance by campaign end date.',
        dueOffsetDays: -7, status: 'pending',
      },
      {
        id: 'hha-inserv-deliver', label: 'Deliver all training sessions',
        description: 'Conduct all scheduled sessions. Capture signed attendance for each session.',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'hha-inserv-verify', label: 'Verify 12-hr minimum per aide',
        description: 'Tally hours per aide against roster. Identify any aides below 12-hour minimum and schedule make-up.',
        dueOffsetDays: 5, status: 'pending',
      },
      {
        id: 'hha-inserv-file', label: 'File evidence and attest RN supervision',
        description: "File signed rosters, curriculum, RN educator attestation. Archive in each aide's personnel record.",
        dueOffsetDays: 7, status: 'pending',
        onCompleteText: 'Annual in-service closed; next annual cycle due Feb 2027.',
      },
    ],
    requiredForms: [
      { id: 'hha-inserv-curriculum-f', label: 'In-Service Curriculum (â‰¥12 hrs)',              formId: 'CL-FM-040', status: 'missing', dueOffsetDays: -7 },
      { id: 'hha-inserv-roster-f',     label: 'Aide Attendance Roster (all sessions)',        formId: 'CL-FM-041', status: 'missing', dueOffsetDays: 7 },
      { id: 'hha-inserv-hours-f',      label: 'Hours Tally per Aide (â‰¥12 hrs verified)',      formId: 'CL-FM-042', status: 'missing', dueOffsetDays: 7 },
      { id: 'hha-inserv-rn-attest',    label: 'RN Educator Attestation',                      formId: 'CL-FM-043', status: 'missing', dueOffsetDays: 7 },
    ],
    approvals: [
      { id: 'hha-inserv-rule-rn', targetKind: 'form', targetLabel: 'RN Educator Attestation', approverRole: 'Director of Nursing', required: true, escalationDays: 7 },
      { id: 'hha-inserv-rule-event', targetKind: 'event', targetLabel: 'Annual Aide In-Service', approverRole: 'Director of Nursing', required: true, escalationDays: 10 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.80(b)(3) â€” Home Health Aide Annual In-Service Training',
      surveyorNote: 'Surveyors will review aide files for documented 12-hr minimum. Missing or untotaled hours = deficiency. RN educator documentation is required.',
    },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'hha_skill_observation-20260225-01',
    eventSubType: 'hha_skill_observation',
    title: 'Annual Skilled-Patient Aide Observation',
    domain: 'Clinical',
    date: '2026-02-25',
    time: '09:00',
    timeEnd: '12:00',
    cadence: 'Annual',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-007'],
    owner: 'Director of Nursing',
    ownerRole: 'Director of Nursing',
    summary: 'Annual observation of home health aides serving patients who also receive skilled nursing or therapy services. Competency and deficiency tracking required.',
    regulatoryDriver: '42 CFR Â§484.80(h)(1) â€” When a patient receives skilled services, the aide must be observed in the home at least every 12 months. Observation must assess aide competency against the plan of care.',
    category: 'hha-annual-skilled-obs',
    processFlow: [
      {
        id: 'hha-skillobs-identify', label: 'Identify patients receiving skilled + aide services',
        description: 'Pull active patient list; flag all patients receiving both skilled nursing/therapy AND aide services. These are the patients requiring this observation type.',
        dueOffsetDays: -7, status: 'pending',
      },
      {
        id: 'hha-skillobs-schedule', label: 'Schedule and assign observations',
        description: 'Assign RN observer to each aide-patient pair. Coordinate with field schedule for home observation windows.',
        dueOffsetDays: -3, status: 'pending',
      },
      {
        id: 'hha-skillobs-observe', label: 'Conduct in-home observations',
        description: 'RN observes aide in the home. Completes observation form per patient. Notes deficiencies or competency concerns.',
        instructions: 'Use the aide observation form. Score all elements. Document specific behaviors observed, not just pass/fail. All deficiencies require a corrective action entry.',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'hha-skillobs-deficiency', label: 'Track deficiencies and corrective actions',
        description: 'Log any deficiency with corrective action plan. Re-observation required if competency not met.',
        dueOffsetDays: 3, status: 'pending',
      },
      {
        id: 'hha-skillobs-file', label: 'File observation records per aide',
        description: "Archive observation forms and corrective action records in each aide's personnel file and patient chart.",
        dueOffsetDays: 7, status: 'pending',
        onCompleteText: 'Annual skilled-patient observations closed.',
      },
    ],
    requiredForms: [
      { id: 'hha-skillobs-obs-form', label: 'Aide Observation Form (skilled-patient)', formId: 'CL-FM-050', status: 'missing', dueOffsetDays: 0 },
      { id: 'hha-skillobs-deflog',   label: 'Deficiency & Corrective Action Log',      formId: 'CL-FM-051', status: 'missing', dueOffsetDays: 3 },
      { id: 'hha-skillobs-summary',  label: 'Observation Summary (all aides)',         formId: 'CL-FM-052', status: 'missing', dueOffsetDays: 7 },
    ],
    approvals: [
      { id: 'hha-skillobs-rule-event', targetKind: 'event', targetLabel: 'Skilled-Patient Aide Observation Cycle', approverRole: 'Director of Nursing', required: true, escalationDays: 10 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.80(h)(1) â€” Skilled-Patient In-Home Aide Observation',
      surveyorNote: 'Each aide serving a skilled-patient must be observed annually. Missing observation forms are a direct CoP deficiency. Corrective action must be documented for any deficiency.',
    },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'hha_aide_observation-20260311-01',
    eventSubType: 'hha_aide_observation',
    title: 'Semiannual Aide-Only Patient Observation',
    domain: 'Clinical',
    date: '2026-03-11',
    time: '09:00',
    timeEnd: '12:00',
    cadence: 'Semiannual',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['CL-SD-007'],
    owner: 'Director of Nursing',
    ownerRole: 'Director of Nursing',
    summary: 'Semiannual observation of aides serving patients who do NOT concurrently receive skilled services. Distinct from the annual skilled-patient observation.',
    regulatoryDriver: '42 CFR Â§484.80(h)(2) â€” When a patient receives ONLY aide services (no concurrent skilled nursing or therapy), the aide must be observed at least every six months. This observation type is distinct from the annual skilled-patient observation (Â§484.80(h)(1)).',
    category: 'hha-semiannual-aideonly-obs',
    processFlow: [
      {
        id: 'hha-aideobs-identify', label: 'Identify aide-only patient assignments',
        description: 'Pull active patient list; flag patients receiving aide services with NO concurrent skilled nursing or therapy. These patients trigger the semiannual (not annual) observation requirement.',
        instructions: 'Cross-reference with skilled episode data. Any patient receiving active skilled care at time of observation defaults to Â§484.80(h)(1) annual process â€” do not double-count.',
        dueOffsetDays: -7, status: 'pending',
      },
      {
        id: 'hha-aideobs-schedule', label: 'Schedule observations',
        description: 'Assign RN observer to each aide-only patient pair. Target 100% completion within the semiannual window.',
        dueOffsetDays: -3, status: 'pending',
      },
      {
        id: 'hha-aideobs-observe', label: 'Conduct in-home observations',
        description: 'RN observes aide in the home using the standard observation form. Notes and scores all competency elements.',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'hha-aideobs-deficiency', label: 'Track deficiencies and corrective actions',
        description: 'Document any deficiency with corrective action and re-observation timeline.',
        dueOffsetDays: 3, status: 'pending',
      },
      {
        id: 'hha-aideobs-file', label: 'File records',
        description: 'Archive observation forms in aide personnel files. Next semiannual observation due Sep 2026.',
        dueOffsetDays: 7, status: 'pending',
      },
    ],
    requiredForms: [
      { id: 'hha-aideobs-obs-form', label: 'Aide Observation Form (aide-only)',      formId: 'CL-FM-060', status: 'missing', dueOffsetDays: 0 },
      { id: 'hha-aideobs-deflog',   label: 'Deficiency & Corrective Action Log',     formId: 'CL-FM-061', status: 'missing', dueOffsetDays: 3 },
      { id: 'hha-aideobs-summary',  label: 'Observation Summary (aide-only cohort)', formId: 'CL-FM-062', status: 'missing', dueOffsetDays: 7 },
    ],
    approvals: [
      { id: 'hha-aideobs-rule-event', targetKind: 'event', targetLabel: 'Semiannual Aide-Only Observation Cycle', approverRole: 'Director of Nursing', required: true, escalationDays: 10 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.80(h)(2) â€” Aide-Only Patient Semiannual Observation',
      surveyorNote: 'Semiannual observation for aide-only patients is a separate and distinct CoP requirement from the annual skilled-patient observation. Both must be documented. Missing a semiannual cycle is a direct deficiency.',
    },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'ep_exercise-20260318-01',
    eventSubType: 'ep_exercise',
    title: 'Annual Emergency Preparedness Exercise',
    domain: 'Operations',
    date: '2026-03-18',
    time: '08:00',
    timeEnd: '13:00',
    cadence: 'Annual',
    mandateType: 'federal-required',
    urgency: 'scheduled',
    policyRefs: ['RM-EP-001'],
    owner: 'Administrator',
    ownerRole: 'Administrator',
    summary: 'Annual EP exercise: full-scale (or community-based substitute) + functional tabletop. Scenario, attendance, debrief, after-action report, improvement plan, and corrective action tracking required.',
    regulatoryDriver: '42 CFR Â§484.102(d) â€” HHAs must conduct at least two EP exercises annually: one full-scale (or community-based equivalent) and one additional exercise of a different type. After-action review and improvement plan required.',
    category: 'ep-annual-exercise',
    processFlow: [
      {
        id: 'ep-exc-scenario', label: 'Select and design exercise scenario',
        description: 'Choose scenario type (mass casualty, loss of power, cybersecurity, severe weather). Define objectives, participants, evaluator roles, and success criteria.',
        dueOffsetDays: -30, status: 'pending',
      },
      {
        id: 'ep-exc-invite', label: 'Invite community partners and evaluators',
        description: 'Invite public health, EMS, hospital, and community partners as applicable. Assign evaluator roles.',
        dueOffsetDays: -21, status: 'pending',
      },
      {
        id: 'ep-exc-conduct', label: 'Conduct exercise',
        description: 'Execute exercise per scenario design. Evaluators observe and score. Capture real-time observations.',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'ep-exc-debrief', label: 'Hot-wash debrief',
        description: 'Conduct immediate debrief (hot-wash) within 24 hours. Capture strengths, areas for improvement, and immediate corrective actions.',
        dueOffsetDays: 1, status: 'pending',
      },
      {
        id: 'ep-exc-aar', label: 'Produce after-action report (AAR)',
        description: 'Produce written AAR: scenario summary, performance against objectives, findings, improvement plan, and corrective action assignments.',
        dueOffsetDays: 7, status: 'pending',
      },
      {
        id: 'ep-exc-update', label: 'Update EP plan based on exercise findings',
        description: 'Incorporate AAR improvement plan findings into the EP plan. Document plan update with version stamp.',
        dueOffsetDays: 30, status: 'pending',
        onCompleteText: 'Annual EP exercise closed. Next annual exercise due Mar 2027.',
      },
    ],
    requiredForms: [
      { id: 'ep-exc-scenario-f', label: 'Exercise Scenario & Design Document',          formId: 'OP-FM-050', status: 'missing', dueOffsetDays: -21 },
      { id: 'ep-exc-roster',     label: 'Exercise Attendance Roster',                    formId: 'OP-FM-051', status: 'missing', dueOffsetDays: 0 },
      { id: 'ep-exc-debrief-f',  label: 'Hot-Wash Debrief Notes',                       formId: 'OP-FM-052', status: 'missing', dueOffsetDays: 1 },
      { id: 'ep-exc-aar-f',      label: 'After-Action Report (AAR)',                    formId: 'OP-FM-053', status: 'missing', dueOffsetDays: 7 },
      { id: 'ep-exc-improve',    label: 'Improvement Plan & Corrective Actions',         formId: 'OP-FM-054', status: 'missing', dueOffsetDays: 14 },
    ],
    approvals: [
      { id: 'ep-exc-rule-aar', targetKind: 'form', targetLabel: 'After-Action Report', approverRole: 'Administrator', required: true, escalationDays: 10 },
      { id: 'ep-exc-rule-event', targetKind: 'event', targetLabel: 'Annual EP Exercise', approverRole: 'Administrator', required: true, escalationDays: 14 },
    ],
    complianceFlags: {
      auditRisk: 'critical', overdueAfterDays: 0,
      citation: '42 CFR Â§484.102(d) â€” Emergency Preparedness Testing & Exercises',
      surveyorNote: 'HHA must conduct at least two exercises annually. The AAR and improvement plan are required evidence. Failure to conduct or document = direct CoP deficiency.',
    },
    followUps: [
      { id: 'ep-exc-fu-correct', label: 'Close all AAR corrective actions', ownerRole: 'Administrator', dueOffsetDays: 90, closureCriteria: 'All corrective action items signed off', escalationDays: 21 },
    ],
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },

  {
    id: 'hhcahps_filing-20260331-01',
    eventSubType: 'hhcahps_filing',
    title: 'HHCAHPS Participation Decision & Annual Filing',
    domain: 'Compliance',
    date: '2026-03-31',
    time: '09:00',
    timeEnd: '10:30',
    cadence: 'Annual',
    mandateType: 'conditional-federal',
    urgency: 'scheduled',
    policyRefs: ['QA-SM-003'],
    owner: 'Administrator',
    ownerRole: 'Administrator',
    summary: 'Annual HHCAHPS participation decision: either file low-volume exemption with CMS, or document vendor oversight and submission tracking. Conditional federal requirement.',
    regulatoryDriver: '42 CFR Â§484.250 / Â§484.245 â€” Home Health CAHPS (HHCAHPS) participation is required for agencies meeting the volume threshold. Agencies with fewer than 60 completed surveys annually may apply for a low-volume exemption. The participation decision and evidence must be documented annually.',
    category: 'hhcahps-annual',
    processFlow: [
      {
        id: 'hhcahps-volume', label: 'Determine survey volume and exemption eligibility',
        description: 'Pull prior-year discharge count. If fewer than 60 completed surveys projected, agency is eligible for the low-volume exemption. Document volume determination.',
        instructions: 'Use CMS HHCAHPS volume threshold documentation. Compare against prior 12-month discharge/episode data. Decision must be documented before March 31 deadline.',
        dueOffsetDays: -14, status: 'pending',
      },
      {
        id: 'hhcahps-branch', label: 'Execute exemption OR vendor oversight branch',
        description: 'BRANCH A (Exemption): Complete and submit the CMS low-volume exemption form before the annual deadline. File confirmation. BRANCH B (Participation): Confirm vendor contract is active. Review prior-year submission rates and response rates. Resolve any submission gaps.',
        instructions: 'Only one branch applies per year. Document which branch was executed and why.',
        dueOffsetDays: 0, status: 'pending',
      },
      {
        id: 'hhcahps-packet', label: 'Compile annual participation packet',
        description: 'File: volume determination, exemption letter OR vendor contract, submission tracking, and compliance confirmation.',
        dueOffsetDays: 3, status: 'pending',
        onCompleteText: 'Annual HHCAHPS decision filed.',
      },
    ],
    requiredForms: [
      { id: 'hhcahps-volume-f',    label: 'Survey Volume Determination',                  formId: 'CO-FM-030', status: 'missing', dueOffsetDays: -7 },
      { id: 'hhcahps-exempt-or-v', label: 'CMS Exemption Letter OR Vendor Contract',      formId: 'CO-FM-031', status: 'missing', dueOffsetDays: 0 },
      { id: 'hhcahps-track',       label: 'Submission / Response Rate Tracking (if participating)', formId: 'CO-FM-032', status: 'missing', dueOffsetDays: 3 },
    ],
    approvals: [
      { id: 'hhcahps-rule-event', targetKind: 'event', targetLabel: 'HHCAHPS Annual Filing', approverRole: 'Administrator', required: true, escalationDays: 7 },
    ],
    complianceFlags: {
      auditRisk: 'high', overdueAfterDays: 0,
      citation: '42 CFR Â§484.250 â€” HHCAHPS Participation',
      surveyorNote: 'Conditional federal requirement. Agency must have documented either the exemption filing or active vendor participation. Missing documentation is a survey finding.',
      missingEvidenceIf: ['missing'],
    },
    sourceOfTruth: 'app', timezone: 'America/Los_Angeles',
  },
];

/**
 * Canonical regulatory event dataset.
 *
 * Every entry from `REGULATORY_EVENTS_RAW` passes through
 * `enforceBusinessDay()` so any recurring/mandated event whose anchor
 * date falls on Saturday or Sunday is shifted forward to the next
 * Monday. The only escape hatch is `event.isWeekendAllowed === true`,
 * reserved for true 24/7 obligations (on-call drills, holiday-period
 * surveys, etc.). This guarantees CES will never schedule a recurring
 * mandated event on a weekend.
 */
export const REGULATORY_EVENTS: RegulatoryEvent[] =
  REGULATORY_EVENTS_RAW
    .map((event) => enforceBusinessDay(event))
    .map((event) => enforceTuesdayThursday(event))
    .map((event) => deriveScope(event))
    .map((event) => applyEventAlignmentPolicy(event))
    .map((event) => applyWorkflowAlignment(event));

/* â”€â”€â”€ Derived KPIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export interface DashboardKpis {
  total: number;
  dueThisWeek: number;
  dueThisWeekTrend: number;
  overdue: number;
  completedPct: number;
  missingEvidence: number;
  criticalCount: number;
  billingAtRisk: number;
  /** Events blocked by incomplete upstream dependencies */
  blocked: number;
  /** Events due within 30 days (for broader planning horizon) */
  dueSoon30: number;
}

/**
 * computeKpis â€” seed-data KPIs derived from static event urgency.
 *
 * IMPORTANT: This function only sees static seed-data urgency flags.
 * For KPIs that reflect live form/step/approval completion state,
 * use `useComplianceKpis()` from @/policy/compliance instead.
 * That hook runs the full enforcement engine against the Zustand store.
 */
export function computeKpis(events: RegulatoryEvent[] = REGULATORY_EVENTS, today: Date = TODAY_ANCHOR): DashboardKpis {
  const actionable = events.filter(e => !e.isContext);

  const dueThisWeek = actionable.filter(e => {
    const n = daysUntil(e.date, today);
    return n >= 0 && n <= 7 && e.urgency !== 'complete';
  }).length;

  const dueSoon30 = actionable.filter(e => {
    const n = daysUntil(e.date, today);
    return n >= 0 && n <= 30 && e.urgency !== 'complete' && e.urgency !== 'overdue';
  }).length;

  const overdue = actionable.filter(e => e.urgency === 'overdue').length;
  const critical = actionable.filter(e => e.urgency === 'critical' || e.urgency === 'overdue').length;

  const missing = actionable.filter(e =>
    e.requiredForms.some(f => f.status === 'missing') || e.minutes?.status === 'missing',
  ).length;

  const blocked = actionable.filter(e => {
    if (e.urgency === 'blocked') return true;
    const deps = e.dependencies?.dependsOn ?? [];
    if (!deps.length) return false;
    return deps.some(depId => {
      const dep = events.find(r => r.id === depId);
      return dep && dep.urgency !== 'complete';
    });
  }).length;

  const completed    = actionable.filter(e => e.urgency === 'complete').length;
  const completedPct = actionable.length > 0
    ? Math.round((completed / actionable.length) * 100)
    : 0;

  const billingAtRisk = actionable.filter(
    e => e.domain === 'Finance' || e.policyRefs.some(p => p.startsWith('FN-') || p.startsWith('CL-POC')),
  ).length;

  return {
    total:            actionable.length,
    dueThisWeek,
    dueThisWeekTrend: 0,
    overdue,
    completedPct,
    missingEvidence:  missing,
    criticalCount:    critical,
    billingAtRisk,
    blocked,
    dueSoon30,
  };
}

/* â”€â”€â”€ Domain summary (for dashboard slices) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export function domainSummary(events: RegulatoryEvent[] = REGULATORY_EVENTS) {
  const out: Record<string, { total: number; overdue: number; dueSoon: number; missing: number; color: string; label: string }> = {};
  (Object.keys(DOMAIN_PALETTE) as RegulatoryDomain[]).forEach(d => {
    if (d === 'Holiday') return;
    const list = events.filter(e => e.domain === d && !e.isContext);
    out[d] = {
      total: list.length,
      overdue: list.filter(e => e.urgency === 'overdue').length,
      dueSoon: list.filter(e => e.urgency === 'due-soon' || e.urgency === 'critical').length,
      missing: list.filter(e => e.requiredForms.some(f => f.status === 'missing')).length,
      color: DOMAIN_PALETTE[d].color,
      label: DOMAIN_PALETTE[d].label,
    };
  });
  return out;
}
