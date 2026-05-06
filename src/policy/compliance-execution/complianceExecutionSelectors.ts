/* ═══════════════════════════════════════════════════════════════
   compliance-execution / SELECTORS
   --------------------------------------------------------------
   Pure functions that take a `ComplianceExecutionSnapshot` and
   return derived views. No React, no hooks here — selectors are
   the safe, testable read API for the merged dataset.
   ═══════════════════════════════════════════════════════════════ */

import type { ComplianceExecutionSnapshot } from './complianceExecutionStore';
import type {
  MergedComplianceEvent, MergedExecutionUnit, AuditReadinessRollup,
} from './complianceExecutionTypes';
import type {
  ComplianceState, WorkflowPhase, ComplianceDomain,
} from '@/policy/ces/types';

/* ─── Event selectors ─────────────────────────────────────── */

export function selectAllEvents(s: ComplianceExecutionSnapshot): readonly MergedComplianceEvent[] {
  return s.events;
}

export function selectEventById(
  s: ComplianceExecutionSnapshot, id: string,
): MergedComplianceEvent | undefined {
  return s.events.find(e => e.id === id);
}

export function selectEventsInRange(
  s: ComplianceExecutionSnapshot, startISO: string, endISO: string,
): MergedComplianceEvent[] {
  const a = new Date(startISO).getTime();
  const b = new Date(endISO).getTime();
  return s.events.filter(e => {
    const t = new Date(e.anchorDate).getTime();
    return t >= a && t <= b;
  });
}

export function getEventsByPolicyId(
  s: ComplianceExecutionSnapshot,
  policyId: string,
): MergedComplianceEvent[] {
  const needle = policyId.toUpperCase();
  return s.events.filter(event =>
    (event.regulatoryRef?.policyRefs ?? []).some(ref => ref.toUpperCase() === needle),
  );
}

export function getEventsByWorkflowId(
  s: ComplianceExecutionSnapshot,
  workflowId: string,
): MergedComplianceEvent[] {
  const eventIds = new Set(
    s.executionUnits
      .filter(unit => unit.workflowId === workflowId)
      .map(unit => unit.parentEventId),
  );
  return s.events.filter(event => eventIds.has(event.id));
}

export function getEventsByDateRange(
  s: ComplianceExecutionSnapshot,
  startISO: string,
  endISO: string,
): MergedComplianceEvent[] {
  return selectEventsInRange(s, startISO, endISO);
}

export function getIncompleteEvents(s: ComplianceExecutionSnapshot): MergedComplianceEvent[] {
  const incompleteIds = new Set(
    s.executionUnits
      .filter(unit => unit.complianceState !== 'completed')
      .map(unit => unit.parentEventId),
  );
  return s.events.filter(event => incompleteIds.has(event.id));
}

/* ─── Execution unit selectors ───────────────────────────── */

export function selectAllExecutionUnits(s: ComplianceExecutionSnapshot): readonly MergedExecutionUnit[] {
  return s.executionUnits;
}

export function selectUnitsForEvent(
  s: ComplianceExecutionSnapshot, eventId: string,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.parentEventId === eventId);
}

export function selectUnitsByState(
  s: ComplianceExecutionSnapshot, state: ComplianceState,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.complianceState === state);
}

export function selectUnitsByPhase(
  s: ComplianceExecutionSnapshot, phase: WorkflowPhase,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.workflowPhase === phase);
}

export function selectUnitsByDomain(
  s: ComplianceExecutionSnapshot, domain: ComplianceDomain,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.domain === domain);
}

/* ─── Risk surface selectors ─────────────────────────────── */

export function selectCriticalUnits(s: ComplianceExecutionSnapshot): MergedExecutionUnit[] {
  return s.executionUnits.filter(u =>
    (u.complianceState === 'awaiting_signature' && (u.escalationTimer ?? 0) < 0) ||
    (u.complianceState === 'blocked' && u.workflowPhase === 'audit') ||
    (u.complianceState === 'blocked' && u.auditReadiness === 'not_ready'),
  );
}

export function selectBlockedUnits(s: ComplianceExecutionSnapshot): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.complianceState === 'blocked');
}

export function selectOverdueUnits(s: ComplianceExecutionSnapshot): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => (u.escalationTimer ?? 0) < 0 && u.complianceState !== 'completed');
}

export function selectAwaitingSignatureUnits(s: ComplianceExecutionSnapshot): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.complianceState === 'awaiting_signature');
}

export function selectUpcomingDeadlines(
  s: ComplianceExecutionSnapshot, withinDays = 14, limit = 6,
): MergedExecutionUnit[] {
  const now = s.today.getTime();
  const horizon = now + withinDays * 24 * 60 * 60 * 1000;
  return s.executionUnits
    .filter(u => u.complianceState !== 'completed')
    .filter(u => {
      const t = new Date(u.dueDate).getTime();
      return t >= now && t <= horizon;
    })
    .sort((a, b) => +new Date(a.dueDate) - +new Date(b.dueDate))
    .slice(0, limit);
}

/* ─── Audit readiness rollup ─────────────────────────────── */

export function selectAuditReadinessRollup(s: ComplianceExecutionSnapshot): AuditReadinessRollup {
  let notReady = 0, partial = 0, ready = 0, certified = 0;
  for (const u of s.executionUnits) {
    if (u.complianceState === 'completed' && u.auditReadiness === 'ready') { certified += 1; continue; }
    if (u.auditReadiness === 'ready')   ready += 1;
    else if (u.auditReadiness === 'partial') partial += 1;
    else notReady += 1;
  }
  const totalOpen = s.executionUnits.filter(u => u.complianceState !== 'completed').length;
  return { notReady, partial, ready, certified, totalOpen };
}

/* ─── Master Controls / Workflow linkage ─────────────────── */

/**
 * Best-effort linkage from a Master Control id to execution units.
 * Heuristic: a control links via `policyRefs` of its source RegulatoryEvent
 * matching either the control id or its prefix. Consumers can override by
 * passing a `match` predicate.
 */
export function selectUnitsForControl(
  s: ComplianceExecutionSnapshot,
  controlId: string | number,
  match?: (u: MergedExecutionUnit) => boolean,
): MergedExecutionUnit[] {
  if (match) return s.executionUnits.filter(match);
  const needle = String(controlId).toUpperCase();
  return s.executionUnits.filter(u => {
    const refs = u.regulatoryRef?.policyRefs ?? [];
    return refs.some(r => r.toUpperCase().includes(needle));
  });
}

export function selectUnitsForWorkflow(
  s: ComplianceExecutionSnapshot, workflowId: string,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => u.workflowId === workflowId);
}

/* ─── Sprint-level rollups (pass-through but discoverable here) ─── */

export function selectSprintMetrics(s: ComplianceExecutionSnapshot) { return s.sprintMetrics; }
export function selectSprintTrends(s: ComplianceExecutionSnapshot)  { return s.sprintTrends; }
export function selectDomainRisks(s: ComplianceExecutionSnapshot)   { return s.domainRisks; }
export function selectOwnerAssignments(s: ComplianceExecutionSnapshot) { return s.ownerAssignments; }
