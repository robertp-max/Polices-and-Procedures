import type {
  RegulatoryEvent, RegulatoryDomain, EventCadence,
} from '@/policy/data/regulatoryEvents';
import { daysUntil } from '@/policy/data/regulatoryEvents';
import type { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import {
  evaluateAudit, isReadyToClose,
  type AuditState, type AuditStateCounts, emptyCounts,
  type AuditFlag, type AuditFlagCounts, emptyFlagCounts,
  type AuditEvaluation,
} from './auditState';

/* ═══════════════════════════════════════════════════════════════
   Cross-Instance Audit Aggregation
   ----------------------------------------------------------------
   Surveyors don't audit one event at a time — they audit:

     "Show me ALL QAPI events for Q2"
     "Show me ALL governing-body meetings this year"
     "Show me ALL overdue compliance items in Clinical"

   This module is the deterministic aggregation layer that backs
   those questions. Given a list of workflow instances, a filter
   spec, and a store snapshot, it returns a roll-up with:

     - the filtered instance list (ordered, stable)
     - audit-state counts
     - per-domain compliance rollup
     - per-cadence rollup (daily / weekly / monthly / quarterly …)
     - per-regulation rollup (citation string from complianceFlags
       or regulatoryDriver)
     - per-month calendar rollup (for the timeline charts)
     - a single summary header for the UI

   Everything is pure and O(events · constants). No React here —
   the hook is a thin wrapper over `buildAuditAggregate`.
   ═══════════════════════════════════════════════════════════════ */

type ExecStore = ReturnType<typeof useRegulatoryExecutionStore.getState>;

/* ─── Filter shape ────────────────────────────────────────── */

export interface AuditDateRange {
  /** YYYY-MM-DD inclusive start. Empty string = no lower bound. */
  startISO: string;
  /** YYYY-MM-DD inclusive end. Empty string = no upper bound. */
  endISO: string;
}

export interface AuditAggregateFilters {
  /** Set of domains to include. 'all' (or undefined) = no filter. */
  domains?: RegulatoryDomain[] | 'all';
  /** Set of cadences (Daily, Weekly …). 'all' = no filter. */
  cadences?: EventCadence[] | 'all';
  /** Set of audit states to include. 'all' = no filter. */
  states?: AuditState[] | 'all';
  /** Free-form category strings to include (e.g. "Quarterly Governing Body"). */
  categories?: string[] | 'all';
  /** Partial regulation citation match (case-insensitive). */
  regulation?: string;
  /** Free-text search across title, id, owner, regulatoryDriver. */
  search?: string;
  /** Date range over `event.date`. */
  dateRange?: AuditDateRange;
  /**
   * When true, strip context markers (holidays, reference pins).
   * Default: true — audit never includes context rows.
   */
  excludeContext?: boolean;
}

/* ─── Aggregate roll-up ───────────────────────────────────── */

export interface DomainRollup {
  domain: RegulatoryDomain;
  total: number;
  compliant: number;      // audit-ready + certified-locked
  noncompliant: number;   // overdue + blocked + not-certifiable + missing + pending
  inflight: number;       // in-progress
  compliancePct: number;  // 0–100
  states: AuditStateCounts;
}

export interface CadenceRollup {
  cadence: EventCadence;
  total: number;
  compliant: number;
  noncompliant: number;
  compliancePct: number;
}

export interface RegulationRollup {
  /** Citation / driver key, e.g. "42 CFR § 484.65" or "OIG CPG". */
  citation: string;
  total: number;
  compliant: number;
  noncompliant: number;
  /** Events that reference this citation. */
  eventIds: string[];
}

export interface MonthRollup {
  /** YYYY-MM key. */
  ym: string;
  total: number;
  certified: number;
  auditReady: number;
  overdueOrBlocked: number;
}

export interface AgencyReadiness {
  /** Top-line binary used in banners. */
  ready: boolean;
  /** 0-100 scorecard: compliant / total (same as summary.complianceRate). */
  score: number;
  /** Plain-English reasons the agency is / is not ready. */
  reasons: string[];
  /** Detailed counts feeding the ready/not-ready decision. */
  signals: {
    notCertifiable: number;
    missingEvidence: number;
    pendingApproval: number;
    overdue: number;
    blocked: number;
    dependencyBlocked: number;
    atRisk: number;
    graceWindow: number;
  };
}

export interface AuditAggregateSummary {
  total: number;
  certified: number;
  /** Certified instances recorded with a grace-window exception. */
  certifiedWithException: number;
  readyToCertify: number;
  readyToClose: number;
  overdue: number;
  blocked: number;
  atRisk: number;
  /** Instances currently eligible for grace-window certification. */
  graceWindow: number;
  complianceRate: number;   // 0-100 — certified + audit-ready / total
  certificationRate: number; // 0-100 — certified / total
  oldestOpenDays: number;
  /** Top failure drivers, highest count first. */
  topFailureDrivers: { flag: AuditFlag; label: string; count: number }[];
  /** Ready/Not-Ready signal surfaced in the top banner. */
  readiness: AgencyReadiness;
}

export interface AuditAggregate {
  filters: AuditAggregateFilters;
  events: RegulatoryEvent[];
  stateByEvent: Record<string, AuditState>;
  flagsByEvent: Record<string, AuditFlag[]>;
  counts: AuditStateCounts;
  flagCounts: AuditFlagCounts;
  byDomain: DomainRollup[];
  byCadence: CadenceRollup[];
  byRegulation: RegulationRollup[];
  byMonth: MonthRollup[];
  summary: AuditAggregateSummary;
}

/* ═══════════════════════════════════════════════════════════════
   Pure aggregator
   ═══════════════════════════════════════════════════════════════ */

const COMPLIANT_STATES: AuditState[] = ['audit-ready', 'certified-locked'];
const NONCOMPLIANT_STATES: AuditState[] = [
  'complete-missing-evidence',
  'complete-pending-approval',
  'blocked',
  'overdue',
  'not-certifiable',
];
const WARNING_STATES: AuditState[] = ['at-risk'];

function matchesDateRange(dateISO: string, range?: AuditDateRange): boolean {
  if (!range) return true;
  if (range.startISO && dateISO < range.startISO) return false;
  if (range.endISO   && dateISO > range.endISO)   return false;
  return true;
}

function eventCitations(e: RegulatoryEvent): string[] {
  const list: string[] = [];
  const c = e.complianceFlags?.citation;
  if (c) list.push(c);
  if (e.regulatoryDriver && !list.includes(e.regulatoryDriver)) list.push(e.regulatoryDriver);
  return list;
}

function matchesRegulation(e: RegulatoryEvent, needle: string): boolean {
  const n = needle.trim().toLowerCase();
  if (!n) return true;
  return eventCitations(e).some(c => c.toLowerCase().includes(n));
}

function matchesSearch(e: RegulatoryEvent, term: string): boolean {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return (
    e.title.toLowerCase().includes(t) ||
    e.id.toLowerCase().includes(t) ||
    e.owner.toLowerCase().includes(t) ||
    (e.regulatoryDriver?.toLowerCase().includes(t) ?? false) ||
    (e.category?.toLowerCase().includes(t) ?? false)
  );
}

export function buildAuditAggregate(
  allEvents: RegulatoryEvent[],
  today: Date,
  store: ExecStore,
  filters: AuditAggregateFilters = {},
): AuditAggregate {
  const {
    domains, cadences, states, categories, regulation, search,
    dateRange, excludeContext = true,
  } = filters;

  /* ── Filter ── */
  const stateByEvent: Record<string, AuditState> = {};
  const flagsByEvent: Record<string, AuditFlag[]> = {};
  const evaluations: Record<string, AuditEvaluation> = {};

  const filtered = allEvents.filter(e => {
    if (excludeContext && e.isContext) return false;
    if (Array.isArray(domains) && !domains.includes(e.domain)) return false;
    if (Array.isArray(cadences) && !cadences.includes(e.cadence)) return false;
    if (Array.isArray(categories) && e.category && !categories.includes(e.category)) return false;
    if (regulation && !matchesRegulation(e, regulation)) return false;
    if (search && !matchesSearch(e, search)) return false;
    if (!matchesDateRange(e.date, dateRange)) return false;
    return true;
  });

  // Classify survivors — then apply state filter (state is the most
  // expensive check, so we do it last).
  const postState: RegulatoryEvent[] = [];
  for (const e of filtered) {
    const ev = evaluateAudit(e, today, store);
    evaluations[e.id] = ev;
    stateByEvent[e.id] = ev.primary;
    flagsByEvent[e.id] = ev.flags;
    if (Array.isArray(states) && !states.includes(ev.primary)) continue;
    postState.push(e);
  }

  /* ── Counts + summary ── */
  const counts = emptyCounts();
  const flagCounts = emptyFlagCounts();
  let readyToCertify = 0;
  let readyToClose   = 0;
  let atRisk         = 0;
  let graceWindow    = 0;
  let oldestOpenDays = 0;
  let certifiedWithException = 0;

  for (const e of postState) {
    const ev = evaluations[e.id];
    const s  = ev.primary;
    counts[s] += 1;
    for (const f of ev.flags) flagCounts[f] += 1;

    const certified = s === 'certified-locked';
    const auditReady = s === 'audit-ready';
    if (auditReady) readyToCertify += 1;
    if (s === 'at-risk') atRisk += 1;
    if (ev.eligibleForGraceCertification) graceWindow += 1;
    if (!certified && !store.isEventComplete(e.id) && isReadyToClose(e, store)) readyToClose += 1;

    if (certified) {
      const rec = store.getCertification(e.id);
      if (rec?.disposition === 'certified-with-exception') certifiedWithException += 1;
    }

    if (!certified && !store.isEventComplete(e.id)) {
      const n = daysUntil(e.date, today);
      if (n < 0 && Math.abs(n) > oldestOpenDays) oldestOpenDays = Math.abs(n);
    }
  }

  const certified = counts['certified-locked'];
  const compliant = certified + counts['audit-ready'];
  const total     = postState.length;
  const complianceRate    = total ? Math.round((compliant / total) * 100) : 100;
  const certificationRate = total ? Math.round((certified / total) * 100) : 0;

  /* ── Top failure drivers (sort flags by count) ── */
  const failureFlagLabels: Partial<Record<AuditFlag, string>> = {
    'overdue':          'Overdue',
    'dependency-risk':  'Dependency blocked',
    'approval-missing': 'Approvals missing',
    'evidence-missing': 'Evidence missing',
    'minutes-missing':  'Minutes missing',
    'sla-urgent':       'SLA urgent',
    'sla-warning':      'SLA warning',
  };
  const topFailureDrivers = (Object.keys(failureFlagLabels) as AuditFlag[])
    .map(flag => ({ flag, label: failureFlagLabels[flag] || flag, count: flagCounts[flag] }))
    .filter(r => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  /* ── Agency readiness ── */
  const dependencyBlocked = flagCounts['dependency-risk'];
  const readinessSignals = {
    notCertifiable:  counts['not-certifiable'],
    missingEvidence: counts['complete-missing-evidence'],
    pendingApproval: counts['complete-pending-approval'],
    overdue:         counts['overdue'],
    blocked:         counts['blocked'],
    dependencyBlocked,
    atRisk,
    graceWindow,
  };
  const ready =
    readinessSignals.notCertifiable === 0 &&
    readinessSignals.overdue === 0 &&
    readinessSignals.blocked === 0 &&
    readinessSignals.missingEvidence === 0 &&
    readinessSignals.pendingApproval === 0;

  const readinessReasons: string[] = [];
  if (readinessSignals.notCertifiable)  readinessReasons.push(`${readinessSignals.notCertifiable} not-certifiable instance${readinessSignals.notCertifiable === 1 ? '' : 's'}`);
  if (readinessSignals.overdue)         readinessReasons.push(`${readinessSignals.overdue} overdue`);
  if (readinessSignals.blocked)         readinessReasons.push(`${readinessSignals.blocked} blocked`);
  if (readinessSignals.missingEvidence) readinessReasons.push(`${readinessSignals.missingEvidence} missing evidence`);
  if (readinessSignals.pendingApproval) readinessReasons.push(`${readinessSignals.pendingApproval} pending approval`);
  if (readinessSignals.atRisk && ready) readinessReasons.push(`Watch: ${readinessSignals.atRisk} at-risk instance${readinessSignals.atRisk === 1 ? '' : 's'}`);
  if (!readinessReasons.length) readinessReasons.push('All in-scope instances are compliant or certified.');

  const readiness: AgencyReadiness = {
    ready,
    score: complianceRate,
    reasons: readinessReasons,
    signals: readinessSignals,
  };

  const summary: AuditAggregateSummary = {
    total,
    certified,
    certifiedWithException,
    readyToCertify,
    readyToClose,
    overdue:  counts.overdue,
    blocked:  counts.blocked,
    atRisk,
    graceWindow,
    complianceRate,
    certificationRate,
    oldestOpenDays,
    topFailureDrivers,
    readiness,
  };

  /* ── Domain rollup ── */
  const byDomainMap = new Map<RegulatoryDomain, DomainRollup>();
  for (const e of postState) {
    let row = byDomainMap.get(e.domain);
    if (!row) {
      row = {
        domain: e.domain,
        total: 0, compliant: 0, noncompliant: 0, inflight: 0,
        compliancePct: 0, states: emptyCounts(),
      };
      byDomainMap.set(e.domain, row);
    }
    const s = stateByEvent[e.id];
    row.total += 1;
    row.states[s] += 1;
    if (COMPLIANT_STATES.includes(s)) row.compliant += 1;
    else if (NONCOMPLIANT_STATES.includes(s)) row.noncompliant += 1;
    else if (s === 'in-progress' || WARNING_STATES.includes(s)) row.inflight += 1;
  }
  const byDomain = [...byDomainMap.values()].map(row => ({
    ...row,
    compliancePct: row.total ? Math.round((row.compliant / row.total) * 100) : 100,
  }));

  /* ── Cadence rollup ── */
  const byCadenceMap = new Map<EventCadence, CadenceRollup>();
  for (const e of postState) {
    let row = byCadenceMap.get(e.cadence);
    if (!row) {
      row = { cadence: e.cadence, total: 0, compliant: 0, noncompliant: 0, compliancePct: 0 };
      byCadenceMap.set(e.cadence, row);
    }
    const s = stateByEvent[e.id];
    row.total += 1;
    if (COMPLIANT_STATES.includes(s)) row.compliant += 1;
    else if (NONCOMPLIANT_STATES.includes(s)) row.noncompliant += 1;
  }
  const byCadence = [...byCadenceMap.values()].map(row => ({
    ...row,
    compliancePct: row.total ? Math.round((row.compliant / row.total) * 100) : 100,
  }));

  /* ── Regulation rollup ── */
  const byRegMap = new Map<string, RegulationRollup>();
  for (const e of postState) {
    const cits = eventCitations(e);
    if (!cits.length) continue;
    const s = stateByEvent[e.id];
    const isCompliant = COMPLIANT_STATES.includes(s);
    const isNon = NONCOMPLIANT_STATES.includes(s);
    for (const c of cits) {
      let row = byRegMap.get(c);
      if (!row) {
        row = { citation: c, total: 0, compliant: 0, noncompliant: 0, eventIds: [] };
        byRegMap.set(c, row);
      }
      row.total += 1;
      if (isCompliant) row.compliant += 1;
      if (isNon)       row.noncompliant += 1;
      row.eventIds.push(e.id);
    }
  }
  const byRegulation = [...byRegMap.values()].sort((a, b) => b.noncompliant - a.noncompliant);

  /* ── Month rollup ── */
  const byMonthMap = new Map<string, MonthRollup>();
  for (const e of postState) {
    const ym = e.date.slice(0, 7);
    let row = byMonthMap.get(ym);
    if (!row) {
      row = { ym, total: 0, certified: 0, auditReady: 0, overdueOrBlocked: 0 };
      byMonthMap.set(ym, row);
    }
    const s = stateByEvent[e.id];
    row.total += 1;
    if (s === 'certified-locked') row.certified += 1;
    if (s === 'audit-ready')      row.auditReady += 1;
    if (s === 'overdue' || s === 'blocked') row.overdueOrBlocked += 1;
  }
  const byMonth = [...byMonthMap.values()].sort((a, b) => a.ym.localeCompare(b.ym));

  return {
    filters,
    events: postState.sort((a, b) => a.date.localeCompare(b.date)),
    stateByEvent,
    flagsByEvent,
    counts,
    flagCounts,
    byDomain: byDomain.sort((a, b) => a.compliancePct - b.compliancePct), // worst first
    byCadence,
    byRegulation,
    byMonth,
    summary,
  };
}

/* ─── Tiny utilities exported for the UI ─────────────────── */

export function isoMonth(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function monthBounds(ym: string): AuditDateRange {
  const [y, m] = ym.split('-').map(Number);
  const startISO = `${ym}-01`;
  const endD = new Date(y, m, 0); // last day of month `m` (1-indexed)
  const endISO =
    `${endD.getFullYear()}-${String(endD.getMonth() + 1).padStart(2, '0')}-${String(endD.getDate()).padStart(2, '0')}`;
  return { startISO, endISO };
}

/** Quick preset bounds the UI offers: last 30d, quarter, year-to-date. */
export function presetRange(
  preset: 'last-30' | 'last-90' | 'qtd' | 'ytd',
  today: Date,
): AuditDateRange {
  const iso = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const endISO = iso(today);
  switch (preset) {
    case 'last-30': {
      const d = new Date(today); d.setDate(d.getDate() - 30);
      return { startISO: iso(d), endISO };
    }
    case 'last-90': {
      const d = new Date(today); d.setDate(d.getDate() - 90);
      return { startISO: iso(d), endISO };
    }
    case 'qtd': {
      const qStartMonth = Math.floor(today.getMonth() / 3) * 3;
      const d = new Date(today.getFullYear(), qStartMonth, 1);
      return { startISO: iso(d), endISO };
    }
    case 'ytd': {
      const d = new Date(today.getFullYear(), 0, 1);
      return { startISO: iso(d), endISO };
    }
  }
}
