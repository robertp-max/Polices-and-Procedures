import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import type { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { classifyAuditState, type AuditState } from './auditState';

/* ═══════════════════════════════════════════════════════════════
   Cross-Workflow Dependency Check
   ----------------------------------------------------------------
   A workflow instance is NEVER compliant in isolation. Many events
   (e.g. a Governing Body meeting) depend on upstream instances
   (QAPI report, Compliance committee minutes, Risk review) being
   complete — and ideally certified — before they can close.

   This module formalizes that graph in one pure function that:
     1. Walks `event.dependencies.dependsOn` to build the upstream
        list with current audit state.
     2. Reverse-indexes `event.dependencies.feeds` / `dependsOn`
        across the catalog to surface downstream impact — events
        that WILL be blocked if this one slips.
     3. Classifies the overall dependency posture into one of:
          'clear' | 'soft-gap' | 'hard-block'
        where 'hard-block' means at least one REQUIRED upstream is
        not yet complete. 'soft-gap' means upstream complete but
        not certified — survey-acceptable in most cases, but the
        reviewer is flagged.
     4. Returns machine-readable blockers the certification gate
        can use to refuse `CERTIFY EVENT COMPLETE`.
   ═══════════════════════════════════════════════════════════════ */

type ExecStore = ReturnType<typeof useRegulatoryExecutionStore.getState>;

/** Upstream dependency row. */
export interface UpstreamDependency {
  eventId: string;
  title: string;
  domain: string;
  date: string;
  /** Current audit state of the upstream instance. */
  auditState: AuditState | 'unknown';
  isComplete:  boolean;
  isCertified: boolean;
  /** Upstream considered REQUIRED when declared in `dependsOn`. */
  required: boolean;
  /** Why this upstream is blocking (plain-English). */
  reason?: string;
}

/** Downstream reference — an event that will be impacted if this one slips. */
export interface DownstreamDependency {
  eventId: string;
  title: string;
  domain: string;
  date: string;
  /** How this event references the current one: 'feeds' or 'dependsOn' or 'propagatesTo'. */
  relation: 'feeds' | 'dependsOn' | 'propagatesTo';
}

export type DependencyPosture = 'clear' | 'soft-gap' | 'hard-block';

export interface DependencyCheck {
  eventId: string;
  upstream:   UpstreamDependency[];
  downstream: DownstreamDependency[];

  /** All declared upstream dependencies are marked complete. */
  allUpstreamComplete:  boolean;
  /** All declared upstream dependencies are certified & locked. */
  allUpstreamCertified: boolean;

  /** Hard-blocking upstream issues — certification MUST refuse. */
  blockers: string[];
  /** Soft warnings — certification can proceed but the reviewer is flagged. */
  warnings: string[];

  /** One-word posture used by the UI + enforcement. */
  posture: DependencyPosture;
  /** Short human summary for headers / banners. */
  summary: string;
}

/* ═══════════════════════════════════════════════════════════════
   Pure check — no hooks, no I/O.
   ═══════════════════════════════════════════════════════════════ */
export function checkDependencies(
  event:     RegulatoryEvent,
  allEvents: RegulatoryEvent[],
  today:     Date,
  store:     ExecStore,
): DependencyCheck {
  const declaredUpstream = event.dependencies?.dependsOn ?? [];
  const upstream: UpstreamDependency[] = [];

  for (const depId of declaredUpstream) {
    const dep = allEvents.find(e => e.id === depId);
    if (!dep) {
      upstream.push({
        eventId: depId,
        title: `Unknown upstream ${depId}`,
        domain: '—',
        date:   '—',
        auditState:  'unknown',
        isComplete:  false,
        isCertified: false,
        required: true,
        reason:   'Upstream event id not found in the catalog',
      });
      continue;
    }

    const isComplete  = store.isEventComplete(dep.id);
    const isCertified = store.isCertified(dep.id);
    const auditState  = classifyAuditState(dep, today, store);

    let reason: string | undefined;
    if (!isComplete) {
      reason = `Upstream not complete — state: ${auditState}`;
    } else if (!isCertified) {
      reason = 'Upstream complete but not certified (reviewer flag)';
    }

    upstream.push({
      eventId:     dep.id,
      title:       dep.title,
      domain:      dep.domain,
      date:        dep.date,
      auditState,
      isComplete,
      isCertified,
      required:    true,
      reason,
    });
  }

  /* ── Downstream: any event that references this one ── */
  const downstream: DownstreamDependency[] = [];
  for (const other of allEvents) {
    if (other.id === event.id) continue;
    const deps = other.dependencies;
    if (!deps) continue;
    if (deps.dependsOn?.includes(event.id)) {
      downstream.push({ eventId: other.id, title: other.title, domain: other.domain, date: other.date, relation: 'dependsOn' });
    } else if (deps.feeds?.includes(event.id)) {
      downstream.push({ eventId: other.id, title: other.title, domain: other.domain, date: other.date, relation: 'feeds' });
    } else if (deps.propagatesTo?.includes(event.id)) {
      downstream.push({ eventId: other.id, title: other.title, domain: other.domain, date: other.date, relation: 'propagatesTo' });
    }
  }
  // Also surface this event's own `feeds` list as downstream impact —
  // those are events the current one is declared to feed.
  for (const feedId of event.dependencies?.feeds ?? []) {
    if (downstream.some(d => d.eventId === feedId)) continue;
    const target = allEvents.find(e => e.id === feedId);
    if (!target) continue;
    downstream.push({
      eventId: target.id,
      title:   target.title,
      domain:  target.domain,
      date:    target.date,
      relation: 'feeds',
    });
  }

  const allUpstreamComplete  = upstream.every(u => u.isComplete);
  const allUpstreamCertified = upstream.every(u => u.isCertified);

  /* ── Posture + blocker/warning list ── */
  const blockers: string[] = [];
  const warnings: string[] = [];

  for (const u of upstream) {
    if (u.required && !u.isComplete) {
      blockers.push(`Upstream not complete: ${u.title} (${u.eventId}) — ${u.auditState}`);
    } else if (u.required && !u.isCertified) {
      warnings.push(`Upstream not certified: ${u.title} (${u.eventId})`);
    }
  }

  const posture: DependencyPosture =
    blockers.length ? 'hard-block' :
    warnings.length ? 'soft-gap'   :
    'clear';

  const summary =
    upstream.length === 0
      ? 'No cross-workflow dependencies'
      : posture === 'clear'
        ? `All ${upstream.length} upstream dependenc${upstream.length === 1 ? 'y' : 'ies'} certified`
        : posture === 'soft-gap'
          ? `${upstream.filter(u => u.isComplete && !u.isCertified).length} upstream complete but not certified`
          : `${blockers.length} upstream blocker${blockers.length === 1 ? '' : 's'}`;

  return {
    eventId: event.id,
    upstream,
    downstream,
    allUpstreamComplete,
    allUpstreamCertified,
    blockers,
    warnings,
    posture,
    summary,
  };
}

/* ═══════════════════════════════════════════════════════════════
   Roll-up helpers
   ═══════════════════════════════════════════════════════════════ */

/**
 * True if certification should be refused based on dependency state.
 * The hard rule is: every REQUIRED upstream dependency must be
 * complete. Certification of upstream is strongly recommended but
 * not hard-gated (that would produce a chicken-and-egg deadlock
 * when an agency first onboards).
 */
export function dependencyGateAllowsCertification(check: DependencyCheck): boolean {
  return check.posture !== 'hard-block';
}

/**
 * Build a map of downstream impact for an entire catalog in one pass.
 * Use when rendering the Audit Mode dependency matrix so we don't
 * O(N²) on every render.
 */
export function buildDependencyIndex(
  allEvents: RegulatoryEvent[],
): Record<string, { downstream: DownstreamDependency[]; upstream: string[] }> {
  const index: Record<string, { downstream: DownstreamDependency[]; upstream: string[] }> = {};
  for (const e of allEvents) index[e.id] = { downstream: [], upstream: e.dependencies?.dependsOn ?? [] };

  for (const e of allEvents) {
    const deps = e.dependencies;
    if (!deps) continue;
    (deps.dependsOn ?? []).forEach(id => {
      if (!index[id]) index[id] = { downstream: [], upstream: [] };
      index[id].downstream.push({ eventId: e.id, title: e.title, domain: e.domain, date: e.date, relation: 'dependsOn' });
    });
    (deps.feeds ?? []).forEach(id => {
      if (!index[id]) index[id] = { downstream: [], upstream: [] };
      index[id].downstream.push({ eventId: e.id, title: e.title, domain: e.domain, date: e.date, relation: 'feeds' });
    });
    (deps.propagatesTo ?? []).forEach(id => {
      if (!index[id]) index[id] = { downstream: [], upstream: [] };
      index[id].downstream.push({ eventId: e.id, title: e.title, domain: e.domain, date: e.date, relation: 'propagatesTo' });
    });
  }
  return index;
}
