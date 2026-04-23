/* ══════════════════════════════════════════════════════════════════════
   Brad — Workflow Schedule Awareness.

   Read-only projections over the autogen + execution + audit stores
   so Brad can answer scheduling and readiness questions grounded in
   the SAME state the operator sees in the UI. No parallel truth.

   Canonical questions supported:
     - what events are scheduled (optionally in a date range)
     - what is due in July (or any month)
     - what non-triggered workflows are active
     - which instances are blocked / overdue / incomplete
     - what evidence is missing before certification
     - what is audit-ready / certified
   ══════════════════════════════════════════════════════════════════════ */

import {
  REGULATORY_EVENTS, TODAY_ANCHOR, daysUntil,
  type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import {
  useRegulatoryExecutionStore,
} from '@/policy/stores/regulatoryExecutionStore';
import {
  classifyAuditState, buildCompletionChecklist,
  type AuditState,
} from '@/policy/audit/auditState';

export interface ScheduleEntry {
  id: string;
  title: string;
  domain: string;
  date: string;
  owner: string;
  auditState: AuditState;
  daysUntil: number;
  overdue: boolean;
  missingEvidence: string[];
  pendingApprovals: string[];
  certified: boolean;
}

function allInstances(): RegulatoryEvent[] {
  const autogen = useAutogenStore.getState();
  return [
    ...REGULATORY_EVENTS,
    ...autogen.generatedEvents,
    ...autogen.triggeredEvents,
  ].filter(e => !e.isContext);
}

function toEntry(ev: RegulatoryEvent, today: Date = TODAY_ANCHOR): ScheduleEntry {
  const store = useRegulatoryExecutionStore.getState();
  const auditState = classifyAuditState(ev, today, store);
  const checklist = buildCompletionChecklist(ev, today, store);
  const n = daysUntil(ev.date, today);
  const approvals = store.approvals.filter(a => a.eventId === ev.id && a.status === 'pending');

  return {
    id: ev.id,
    title: ev.title,
    domain: ev.domain,
    date: ev.date,
    owner: ev.owner,
    auditState,
    daysUntil: n,
    overdue: n < 0 && !store.isEventComplete(ev.id),
    missingEvidence: checklist.items.filter(i => !i.passed && (i.id === 'forms' || i.id === 'minutes' || i.id === 'evidence')).map(i => i.label),
    pendingApprovals: approvals.map(a => a.targetLabel),
    certified: store.isCertified(ev.id),
  };
}

/** Every scheduled instance, optionally clamped to a date window. */
export function listScheduledInstances(
  opts: { rangeStart?: string; rangeEnd?: string; today?: Date } = {},
): ScheduleEntry[] {
  const today = opts.today ?? TODAY_ANCHOR;
  return allInstances()
    .filter(e => !opts.rangeStart || e.date >= opts.rangeStart)
    .filter(e => !opts.rangeEnd || e.date <= opts.rangeEnd)
    .map(e => toEntry(e, today))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Everything due in the given month (YYYY-MM). Defaults to July of TODAY_ANCHOR year. */
export function listDueInMonth(yyyyMm?: string, today: Date = TODAY_ANCHOR): ScheduleEntry[] {
  const stamp = yyyyMm ?? `${today.getFullYear()}-07`;
  return listScheduledInstances({
    rangeStart: `${stamp}-01`,
    rangeEnd: `${stamp}-31`,
    today,
  });
}

/** All instances currently in a given audit state. */
export function listByAuditState(state: AuditState, today: Date = TODAY_ANCHOR): ScheduleEntry[] {
  return allInstances()
    .map(e => toEntry(e, today))
    .filter(e => e.auditState === state)
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Blocked / overdue roll-up for Brad. */
export function listBlockedOrOverdue(today: Date = TODAY_ANCHOR): ScheduleEntry[] {
  return allInstances()
    .map(e => toEntry(e, today))
    .filter(e => e.auditState === 'blocked' || e.auditState === 'overdue')
    .sort((a, b) => a.daysUntil - b.daysUntil);
}

/** Instances that have open evidence gaps before certification. */
export function listIncompleteEvidence(today: Date = TODAY_ANCHOR): ScheduleEntry[] {
  return allInstances()
    .map(e => toEntry(e, today))
    .filter(e =>
      e.auditState === 'complete-missing-evidence' ||
      e.auditState === 'complete-pending-approval' ||
      e.auditState === 'not-certifiable',
    )
    .sort((a, b) => b.missingEvidence.length - a.missingEvidence.length);
}

/** Ready for certification — everything operators can close today. */
export function listAuditReady(today: Date = TODAY_ANCHOR): ScheduleEntry[] {
  return listByAuditState('audit-ready', today);
}

/** Certified + locked records for survey export. */
export function listCertified(today: Date = TODAY_ANCHOR): ScheduleEntry[] {
  return listByAuditState('certified-locked', today);
}

/* ══════════════════════════════════════════════════════════════════════
   Brad readiness query answerer.

   Detects natural-language questions about the scheduled workflow
   calendar + audit readiness ("what's due in July", "what's blocked",
   "what's audit-ready", "what's missing evidence", etc.) and produces a
   grounded markdown answer drawn from the live stores. Returns null when
   the query doesn't look like a readiness question, so the caller can
   fall through to the deterministic workflow answerer or the LLM path.
   ═══════════════════════════════════════════════════════════════════════ */

const MONTH_NAMES = [
  'january','february','march','april','may','june',
  'july','august','september','october','november','december',
] as const;

function monthFromQuery(q: string, today: Date): string | null {
  const lower = q.toLowerCase();
  for (let i = 0; i < MONTH_NAMES.length; i++) {
    if (new RegExp(`\\b${MONTH_NAMES[i]}\\b`).test(lower)) {
      const mm = String(i + 1).padStart(2, '0');
      return `${today.getFullYear()}-${mm}`;
    }
  }
  return null;
}

export interface ReadinessAnswer {
  markdown: string;
  kind: 'schedule' | 'blocked' | 'overdue' | 'audit-ready' | 'missing-evidence' | 'certified' | 'summary';
  entries: ScheduleEntry[];
}

function formatRow(e: ScheduleEntry): string {
  const due = e.overdue
    ? ` · **${Math.abs(e.daysUntil)}d overdue**`
    : e.daysUntil === 0 ? ' · due today'
    : e.daysUntil > 0 ? ` · in ${e.daysUntil}d` : '';
  const gaps: string[] = [];
  if (e.missingEvidence.length) gaps.push(`${e.missingEvidence.length} evidence gap${e.missingEvidence.length === 1 ? '' : 's'}`);
  if (e.pendingApprovals.length) gaps.push(`${e.pendingApprovals.length} approval${e.pendingApprovals.length === 1 ? '' : 's'} pending`);
  const tail = gaps.length ? ` — ${gaps.join(', ')}` : '';
  return `- **${e.id}** — ${e.title} · _${e.domain}_ · owner: ${e.owner} · ${e.date}${due}${tail}`;
}

function section(title: string, rows: ScheduleEntry[], emptyHint: string): string {
  if (rows.length === 0) return `**${title}**\n\n_${emptyHint}_`;
  return `**${title}** _(${rows.length})_\n\n${rows.slice(0, 20).map(formatRow).join('\n')}${
    rows.length > 20 ? `\n\n_…and ${rows.length - 20} more. Open the Audit view to see the full queue._` : ''
  }`;
}

/**
 * Try to answer a readiness / scheduling question. Returns null when the
 * query does not look like one of the supported categories.
 */
export function answerReadinessQuery(
  query: string,
  today: Date = TODAY_ANCHOR,
): ReadinessAnswer | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const wantsBlocked = /\b(blocked|blockers?|stuck)\b/.test(q);
  const wantsOverdue = /\b(overdue|past due|late)\b/.test(q);
  const wantsReady   = /\b(audit[- ]?ready|ready (?:to|for) certif|ready to close|can (?:i|we) certif)\b/.test(q);
  const wantsMissing = /\b(missing evidence|missing forms?|evidence (?:missing|gap)|what('?s| is) missing)\b/.test(q);
  const wantsCertified = /\b(certif(?:ied|ication)(?: complete| record)?|locked (?:records?|events?))\b/.test(q);
  const wantsMonth   = monthFromQuery(q, today);
  const wantsSchedule = /\b(scheduled|schedule|what (?:events|workflows)|due (?:in|this)|what('?s| is) (?:coming up|on deck)|readiness)\b/.test(q);
  const wantsSummary = /\b(readiness (?:status|posture|summary)|compliance (?:posture|summary)|how are we doing)\b/.test(q);

  if (!wantsBlocked && !wantsOverdue && !wantsReady && !wantsMissing && !wantsCertified
      && !wantsMonth && !wantsSchedule && !wantsSummary) {
    return null;
  }

  if (wantsSummary) {
    const s = summarizeReadiness(today);
    return {
      kind: 'summary',
      entries: [],
      markdown: [
        '**Readiness posture**',
        `- Scheduled instances: **${s.total}**`,
        `- Audit-ready: **${s.auditReady}**`,
        `- Incomplete (evidence / approval / not certifiable): **${s.incomplete}**`,
        `- Blocked or overdue: **${s.blockedOrOverdue}**`,
        `- Certified & locked: **${s.certified}**`,
        `- Due in next 30 days: **${s.dueNext30Days}**`,
      ].join('\n'),
    };
  }

  if (wantsMonth) {
    const rows = listDueInMonth(wantsMonth, today);
    const monthLabel = new Date(wantsMonth + '-01T00:00:00').toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return {
      kind: 'schedule',
      entries: rows,
      markdown: section(`Workflow instances due in ${monthLabel}`, rows, 'Nothing scheduled for that month.'),
    };
  }

  if (wantsBlocked && !wantsOverdue) {
    const rows = listByAuditState('blocked', today);
    return { kind: 'blocked', entries: rows, markdown: section('Blocked workflow instances', rows, 'Nothing is currently blocked.') };
  }
  if (wantsOverdue && !wantsBlocked) {
    const rows = listByAuditState('overdue', today);
    return { kind: 'overdue', entries: rows, markdown: section('Overdue workflow instances', rows, 'Nothing is overdue.') };
  }
  if (wantsBlocked && wantsOverdue) {
    const rows = listBlockedOrOverdue(today);
    return { kind: 'blocked', entries: rows, markdown: section('Blocked or overdue workflow instances', rows, 'Nothing blocked or overdue.') };
  }
  if (wantsReady) {
    const rows = listAuditReady(today);
    return { kind: 'audit-ready', entries: rows, markdown: section('Instances ready for certification', rows, 'Nothing is audit-ready right now.') };
  }
  if (wantsMissing) {
    const rows = listIncompleteEvidence(today);
    return { kind: 'missing-evidence', entries: rows, markdown: section('Instances with evidence or approval gaps', rows, 'No open evidence or approval gaps.') };
  }
  if (wantsCertified) {
    const rows = listCertified(today);
    return { kind: 'certified', entries: rows, markdown: section('Certified & locked records', rows, 'No certified records yet.') };
  }

  if (wantsSchedule) {
    const rows = listScheduledInstances({ today, rangeStart: today.toISOString().slice(0, 10) }).slice(0, 30);
    return {
      kind: 'schedule',
      entries: rows,
      markdown: section('Upcoming scheduled workflow instances', rows, 'Nothing scheduled.'),
    };
  }

  return null;
}

/** Quick boolean for Brad's router. */
export function isReadinessQuery(query: string, today: Date = TODAY_ANCHOR): boolean {
  return answerReadinessQuery(query, today) !== null;
}

/** Compact summary of the readiness calendar for dashboard/Brad greetings. */
export function summarizeReadiness(today: Date = TODAY_ANCHOR): {
  total: number;
  auditReady: number;
  incomplete: number;
  blockedOrOverdue: number;
  certified: number;
  dueNext30Days: number;
} {
  const all = listScheduledInstances({ today });
  const in30 = today.getTime() + 30 * 86_400_000;
  return {
    total: all.length,
    auditReady: all.filter(e => e.auditState === 'audit-ready').length,
    incomplete: all.filter(e =>
      e.auditState === 'complete-missing-evidence' ||
      e.auditState === 'complete-pending-approval' ||
      e.auditState === 'not-certifiable',
    ).length,
    blockedOrOverdue: all.filter(e => e.auditState === 'blocked' || e.auditState === 'overdue').length,
    certified: all.filter(e => e.auditState === 'certified-locked').length,
    dueNext30Days: all.filter(e => {
      const t = new Date(e.date + 'T00:00:00').getTime();
      return t >= today.getTime() && t <= in30;
    }).length,
  };
}
