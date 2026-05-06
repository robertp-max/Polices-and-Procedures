/* ═══════════════════════════════════════════════════════════════
   compliance-execution / STORE (merged dataset hook)
   --------------------------------------------------------------
   The single React entry point that consumers use to read merged
   compliance + execution data.

   Source of truth (v2 — onboarding engine wired):
     • EXECUTION UNITS  → onboardingEngine.getExecutionUnits()
     • BATCHES          → onboardingEngine.getBatches()
     • GATE EVALUATIONS → onboardingEngine.getGateEvaluations()
     • EVENTS           → regulatory events (metadata) + synthetic
                          onboarding events from the engine
     • SPRINT METRICS   → computed from real units (no mock data)
     • SPRINT WINDOWS   → computed from TODAY_ANCHOR

   No component reads mockSprint.ts directly anymore.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import {
  REGULATORY_EVENTS, TODAY_ANCHOR, type RegulatoryEvent,
} from '@/policy/data/regulatoryEvents';
import { useAutogenStore } from '@/policy/stores/autogenStore';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { evaluateAudit, type AuditEvaluation } from '@/policy/audit/auditState';

import {
  useOnboardingEngine, type OnboardingExecutionBatch, type GateEvaluation,
  type OnboardingExecutionUnit,
} from '@/policy/onboarding/onboardingExecutionEngine';

import { regulatoryEventToComplianceEvent } from './complianceExecutionAdapters';
import { buildEventExecutionDataflow } from './useEventExecutionDataflow';
import {
  regulatoryEventOverlapsSprint,
  type SprintWindow,
} from '@/policy/pm/sprintWindows';
import type {
  MergedComplianceEvent, MergedExecutionUnit,
} from './complianceExecutionTypes';
import type {
  Sprint, Workflow, OwnerAssignment, SprintMetrics, SprintTrendPoint, DomainRisk,
  ComplianceDomain, DomainRiskLevel,
} from '@/policy/ces/types';

export interface ComplianceExecutionSnapshot {
  /** Active sprint window (computed from TODAY_ANCHOR — 14-day cycle). */
  activeSprint:    Sprint;
  sprintHistory:   readonly Sprint[];
  /** Today anchor (Command Center demo clock). */
  today:           Date;

  /** Merged compliance events (regulatory metadata + synthetic onboarding events). */
  events:          readonly MergedComplianceEvent[];
  /** All execution units — sourced from the onboarding engine. */
  executionUnits:  readonly MergedExecutionUnit[];
  /** Workflows derived from the engine's batches. */
  workflows:       readonly Workflow[];

  /** Per-event audit evaluation, indexed by RegulatoryEvent id (metadata only). */
  auditEvaluations: ReadonlyMap<string, AuditEvaluation>;

  /** Sprint-level rollups (computed from real execution units). */
  sprintMetrics:    SprintMetrics;
  sprintTrends:     readonly SprintTrendPoint[];
  domainRisks:      readonly DomainRisk[];
  ownerAssignments: readonly OwnerAssignment[];

  /** Engine outputs (passthrough for components that need batch / gate context). */
  onboardingBatches:   readonly OnboardingExecutionBatch[];
  gateEvaluations:     readonly GateEvaluation[];
}

/* ═══════════════════════════════════════════════════════════════
   Helpers — derive sprint window + metrics from real units
   ═══════════════════════════════════════════════════════════════ */

const DAY_MS = 1000 * 60 * 60 * 24;
/** Sprint = Monday of week 1 → Friday of week 2 (12 calendar days,
    10 working days). No mandated event is placed on a weekend.
    `endDate` is the inclusive Friday of week 2. */
const SPRINT_WORK_DAYS = 12;

function isoDate(d: Date): string { return d.toISOString().slice(0, 10); }

function startOfMondayUTC(date: Date): Date {
  // 0=Sun … 6=Sat. We want Monday=0.
  const day  = date.getUTCDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const m = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  m.setUTCDate(m.getUTCDate() + diff);
  return m;
}

function buildSprintWindow(today: Date, offsetSprints: number): Sprint {
  // Two-week cadence anchored to the Monday of the week containing
  // an absolute epoch Monday (2026-01-05 = Mon). Each sprint is
  // Mon → Fri of the following week (12 cal days inclusive).
  const epochMon       = new Date(Date.UTC(2026, 0, 5));               // Mon 2026-01-05
  const todayMon       = startOfMondayUTC(today);
  const weeksFromEpoch = Math.floor((todayMon.getTime() - epochMon.getTime()) / (7 * DAY_MS));
  const sprintsSince   = Math.floor(weeksFromEpoch / 2);
  const sprintNum      = sprintsSince + 1 + offsetSprints;
  const start          = new Date(epochMon.getTime() + (sprintsSince + offsetSprints) * 2 * 7 * DAY_MS);
  const end            = new Date(start.getTime() + (SPRINT_WORK_DAYS - 1) * DAY_MS); // Fri of week 2
  return {
    id:        `sprint-${sprintNum}`,
    number:    sprintNum,
    startDate: isoDate(start),
    endDate:   isoDate(end),
    label:     `Sprint ${sprintNum}`,
  };
}

function computeSprintMetrics(
  units: readonly OnboardingExecutionUnit[], _today: Date,
): SprintMetrics {
  const total = units.length || 1;
  const completed = units.filter(u => u.complianceState === 'completed').length;
  const blocked   = units.filter(u => u.complianceState === 'blocked').length;
  const ready     = units.filter(u => u.auditReadiness === 'ready').length;
  const sigMissed = units.filter(u =>
    u.complianceState === 'awaiting_signature' && (u.escalationTimer ?? 0) < 0,
  ).length;
  const upcoming48 = units.filter(u => {
    if (u.complianceState === 'completed') return false;
    const h = u.escalationTimer ?? 9999;
    return h >= 0 && h <= 48;
  }).length;
  return {
    completionRatePct:        Math.round((completed / total) * 100),
    auditReadinessScore:      Math.round((ready     / total) * 100),
    activeBlockerCount:       blocked,
    signatureSlasMissed:      sigMissed,
    upcomingDeadlines48hCount: upcoming48,
  };
}

function computeDomainRisks(
  units: readonly OnboardingExecutionUnit[],
): DomainRisk[] {
  const domains: ComplianceDomain[] = ['clinical', 'compliance', 'hr', 'governance'];
  return domains.map(domain => {
    const inDomain = units.filter(u => u.domain === domain);
    const open     = inDomain.filter(u => u.complianceState !== 'completed').length;
    const blocked  = inDomain.filter(u => u.complianceState === 'blocked').length;
    const total    = inDomain.length || 1;
    const pct      = blocked / total;
    const level: DomainRiskLevel = pct >= 0.25 ? 'red' : pct >= 0.10 ? 'yellow' : 'green';
    const reason =
      blocked === 0 && open === 0 ? 'No active units in this domain.' :
      blocked === 0               ? `${open} open execution unit${open === 1 ? '' : 's'} in flight.` :
                                    `${blocked} blocker${blocked === 1 ? '' : 's'} across ${open} active unit${open === 1 ? '' : 's'}.`;
    return {
      domain,
      level,
      openUnits:    open,
      blockedCount: blocked,
      reason,
    };
  });
}

function computeOwnerAssignments(
  units: readonly OnboardingExecutionUnit[],
): OwnerAssignment[] {
  const byUser = new Map<string, OwnerAssignment>();
  for (const u of units) {
    const key = u.owner.userId;
    let a = byUser.get(key);
    if (!a) {
      a = {
        owner: u.owner,
        allocatedUnitCount: 0,
        overdueUnitCount:   0,
        pendingSignatureCount: 0,
        capacityRisk: 'green',
      };
      byUser.set(key, a);
    }
    a.allocatedUnitCount += 1;
    if (u.complianceState === 'blocked' && (u.escalationTimer ?? 0) < 0) a.overdueUnitCount += 1;
    if (u.complianceState === 'awaiting_signature') a.pendingSignatureCount += 1;
  }
  for (const a of byUser.values()) {
    const ratio = (a.overdueUnitCount + a.pendingSignatureCount) / Math.max(1, a.allocatedUnitCount);
    a.capacityRisk = ratio >= 0.4 ? 'red' : ratio >= 0.2 ? 'yellow' : 'green';
  }
  return Array.from(byUser.values());
}

function computeWorkflows(batches: readonly OnboardingExecutionBatch[]): Workflow[] {
  const wfMap = new Map<string, Workflow>();
  for (const b of batches) {
    for (const u of b.units) {
      if (wfMap.has(u.workflowId)) continue;
      wfMap.set(u.workflowId, {
        id:        u.workflowId,
        eventId:   u.parentEventId,
        title:     u.workflowId.replace(/^wf-/, '').replace(/-/g, ' ').toUpperCase(),
        requiredFormIds: [],
      });
    }
  }
  return Array.from(wfMap.values());
}

function computeSprintTrends(metrics: SprintMetrics, sprints: readonly Sprint[]): SprintTrendPoint[] {
  return sprints.map(s => ({
    sprintNumber:           s.number,
    completionRatePct:      metrics.completionRatePct,
    onTimeRatePct:          Math.max(0, 100 - metrics.signatureSlasMissed * 5),
    blockedResolutionHours: metrics.activeBlockerCount * 8,
    auditReadinessScore:    metrics.auditReadinessScore,
    signatureSlaPct:        Math.max(0, 100 - metrics.signatureSlasMissed * 10),
    carryOverCount:         metrics.activeBlockerCount,
  }));
}

/** Limits expensive `buildEventExecutionDataflow` work to a month or PM sprint window. */
export type ComplianceExecutionScope =
  | { mode: 'all' }
  | { mode: 'month'; year: number; monthIndex: number }
  | { mode: 'sprint'; window: SprintWindow };

const DEFAULT_COMPLIANCE_SCOPE: ComplianceExecutionScope = { mode: 'all' };

function filterRegulatoryEventsForScope(
  regEvents: RegulatoryEvent[],
  scope: ComplianceExecutionScope,
): RegulatoryEvent[] {
  if (scope.mode === 'all') return regEvents;
  if (scope.mode === 'month') {
    return regEvents.filter(e => {
      const d = new Date(e.date + 'T00:00:00');
      return d.getFullYear() === scope.year && d.getMonth() === scope.monthIndex;
    });
  }
  return regEvents.filter(e => regulatoryEventOverlapsSprint(e, scope.window));
}

/* ═══════════════════════════════════════════════════════════════
   useComplianceExecution
   ═══════════════════════════════════════════════════════════════ */
export function useComplianceExecution(
  scope: ComplianceExecutionScope = DEFAULT_COMPLIANCE_SCOPE,
): ComplianceExecutionSnapshot {
  const today = TODAY_ANCHOR;

  const generated = useAutogenStore(s => s.generatedEvents);
  const triggered = useAutogenStore(s => s.triggeredEvents);
  const store     = useRegulatoryExecutionStore();
  const engine    = useOnboardingEngine();

  const scopeKey =
    scope.mode === 'all'
      ? 'all'
      : scope.mode === 'month'
        ? `m:${scope.year}-${scope.monthIndex}`
        : `s:${scope.window.id}`;

  return useMemo(() => {
    /* ── Regulatory events kept ONLY as event-layer metadata ── */
    const regEventsAll: RegulatoryEvent[] = [
      ...REGULATORY_EVENTS, ...generated, ...triggered,
    ].filter(e => !e.isContext);

    const regEvents = filterRegulatoryEventsForScope(regEventsAll, scope);

    const auditEvaluations = new Map<string, AuditEvaluation>();
    for (const e of regEvents) {
      auditEvaluations.set(e.id, evaluateAudit(e, today, store));
    }

    const hasDatasetRegulatory = regEventsAll.length > 0;
    const hasRegulatoryEvents = hasDatasetRegulatory;
    const eventPackages = hasRegulatoryEvents
      ? regEvents.map(event => buildEventExecutionDataflow(event, store))
      : [];
    const regulatoryEventTiles: MergedComplianceEvent[] = regEvents.map(regulatoryEventToComplianceEvent);

    /* ── Synthetic onboarding events from the engine ── */
    const onboardingEventTiles: MergedComplianceEvent[] = engine.events.map(e => ({
      id:          e.id,
      title:       e.title,
      category:    'recurring',
      domain:      e.domain,
      anchorDate:  e.anchorDate,
      source:      'autogen',
    }));

    /* ── Execution units come ENTIRELY from the engine ── */
    const engineUnits = engine.getExecutionUnits();
    const activeSprintForUnits  = buildSprintWindow(today, 0);
    const sprintStartMs = new Date(activeSprintForUnits.startDate).getTime();
    const sprintEndMs   = new Date(activeSprintForUnits.endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
    const executionUnits: MergedExecutionUnit[] = hasRegulatoryEvents
      ? eventPackages.flatMap(pkg =>
          pkg.cesExecutionUnits.map(unit => ({
            ...unit,
            parentObligationId: unit.parentObligationId ?? unit.parentEventId,
            obligationKind: 'TASK' as const,
            sourceType: unit.sourceType ?? 'REGULATORY_EVENT',
          })),
        )
      : engineUnits.map(u => {
          const dueMs = new Date(u.dueDate).getTime();
          const inActiveSprint = dueMs >= sprintStartMs && dueMs <= sprintEndMs;
          return {
            ...u,
            source: 'autogen' as const,
            obligationKind: 'TASK' as const,
            parentObligationId: u.parentObligationId ?? u.parentEventId,
            sourceType: u.sourceType ?? 'ONBOARDING',
            sprintId: u.sprintId ?? (inActiveSprint ? activeSprintForUnits.id : undefined),
          };
        });

    /* ── Sprint windows ── */
    const activeSprint  = buildSprintWindow(today,  0);
    const sprintHistory = [
      buildSprintWindow(today, -2),
      buildSprintWindow(today, -1),
      activeSprint,
    ];

    /* ── Metrics & rollups computed from real units ── */
    const sprintMetrics    = computeSprintMetrics(engineUnits, today);
    const domainRisks      = computeDomainRisks(engineUnits);
    const ownerAssignments = computeOwnerAssignments(engineUnits);
    const workflows = hasRegulatoryEvents
      ? eventPackages
        .flatMap(pkg => pkg.workflows.map(wf => ({ id: wf.id, eventId: pkg.event.id, title: wf.title, requiredFormIds: [] as string[] })))
        .filter((wf, idx, arr) => arr.findIndex(other => other.id === wf.id && other.eventId === wf.eventId) === idx)
      : computeWorkflows(engine.getBatches());
    const sprintTrends     = computeSprintTrends(sprintMetrics, sprintHistory);

    return {
      activeSprint,
      sprintHistory,
      today,
      events:           hasRegulatoryEvents ? regulatoryEventTiles : onboardingEventTiles,
      executionUnits,
      workflows,
      auditEvaluations,
      sprintMetrics,
      sprintTrends,
      domainRisks,
      ownerAssignments,
      onboardingBatches: engine.getBatches(),
      gateEvaluations:   engine.getGateEvaluations(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    scopeKey,
    today, generated, triggered, engine,
    store.formStates, store.stepStates, store.minutesStates,
    store.approvals, store.completions, store.certifications,
    store.taskOverridesByEventId, store.taskAuditByEventId,
    store.generatedFormInstancesByEventId, store.evidence,
    store.eventInstancesById, store.eventInstanceIdsBySourceEventId,
  ]);
}
