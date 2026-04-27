/* ═══════════════════════════════════════════════════════════════
   Obligation selectors — canonical CES read API.
   --------------------------------------------------------------
   Single source of truth: `ComplianceExecutionSnapshot`.
   Two logical layers via discriminator:
     • SPRINT_TASK — derived from MergedComplianceEvent (calendar +
                     sprint board container).
     • TASK        — derived from MergedExecutionUnit (execution
                     children of a SPRINT_TASK).
   No duplicate stores. No parallel task system.
   ═══════════════════════════════════════════════════════════════ */

import type { ComplianceExecutionSnapshot } from '@/policy/compliance-execution/complianceExecutionStore';
import type {
  MergedExecutionUnit, MergedComplianceEvent,
} from '@/policy/compliance-execution/complianceExecutionTypes';
import type {
  Obligation, ObligationKind, ComplianceState, ComplianceDomain,
} from '@/policy/ces/types';

/* ─── Resolution helpers ─────────────────────────────────────── */

export function resolveObligationKind(u: MergedExecutionUnit): ObligationKind {
  return u.obligationKind ?? 'TASK';
}

export function resolveParentObligationId(u: MergedExecutionUnit): string {
  return u.parentObligationId ?? u.parentEventId;
}

/* ─── SPRINT_TASK obligations (calendar + sprint board) ─────── */

/** SPRINT_TASK obligations are mandated events. We project the
    canonical compliance event metadata into Obligation shape so the
    calendar/board can iterate one type. */
export interface SprintTaskObligation {
  id:         string;
  kind:       'SPRINT_TASK';
  title:      string;
  domain:     ComplianceDomain;
  /** ISO due/anchor date. */
  dueDate:    string;
  /** Source category from the regulatory event. */
  category:   string;
  /** Underlying merged event (preserved for detail rendering). */
  event:      MergedComplianceEvent;
  /** Aggregated state derived from child TASKs. */
  rolledState: ComplianceState;
  /** Total / completed / blocked child TASK counts. */
  childCounts: { total: number; completed: number; blocked: number; awaitingSignature: number };
}

function rollupChildState(children: readonly MergedExecutionUnit[]): ComplianceState {
  if (children.length === 0)                                              return 'upcoming';
  if (children.every(c => c.complianceState === 'completed'))             return 'completed';
  if (children.some(c  => c.complianceState === 'blocked'))               return 'blocked';
  if (children.some(c  => c.complianceState === 'awaiting_signature'))    return 'awaiting_signature';
  if (children.some(c  => c.complianceState === 'in_progress'))           return 'in_progress';
  if (children.every(c => c.complianceState === 'upcoming'))              return 'upcoming';
  return 'ready';
}

export function selectSprintTaskObligations(
  s: ComplianceExecutionSnapshot,
): SprintTaskObligation[] {
  return s.events.map(ev => {
    const children = s.executionUnits.filter(
      u => resolveParentObligationId(u) === ev.id,
    );
    return {
      id:        ev.id,
      kind:      'SPRINT_TASK' as const,
      title:     ev.title,
      domain:    ev.domain,
      dueDate:   ev.anchorDate,
      category:  ev.category,
      event:     ev,
      rolledState: rollupChildState(children),
      childCounts: {
        total:              children.length,
        completed:          children.filter(c => c.complianceState === 'completed').length,
        blocked:            children.filter(c => c.complianceState === 'blocked').length,
        awaitingSignature:  children.filter(c => c.complianceState === 'awaiting_signature').length,
      },
    };
  });
}

export function selectSprintTaskById(
  s: ComplianceExecutionSnapshot, id: string,
): SprintTaskObligation | undefined {
  return selectSprintTaskObligations(s).find(t => t.id === id);
}

/** Sprint Board view — SPRINT_TASKs filtered to the active sprint
    window (anchorDate within sprint dates). */
export function selectSprintTaskObligationsForSprint(
  s: ComplianceExecutionSnapshot, sprintId?: string,
): SprintTaskObligation[] {
  const sprint = sprintId
    ? s.sprintHistory.find(sp => sp.id === sprintId) ?? s.activeSprint
    : s.activeSprint;
  const start = new Date(sprint.startDate).getTime();
  const end   = new Date(sprint.endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
  return selectSprintTaskObligations(s).filter(t => {
    const due = new Date(t.dueDate).getTime();
    return due >= start && due <= end;
  });
}

/* ─── TASK obligations (execution layer / My Tasks) ──────────── */

export function selectAllObligations(s: ComplianceExecutionSnapshot): readonly Obligation[] {
  return s.executionUnits;
}

export function selectTaskObligations(s: ComplianceExecutionSnapshot): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => resolveObligationKind(u) === 'TASK');
}

export function selectChildTasks(
  s: ComplianceExecutionSnapshot, parentObligationId: string,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(
    u => resolveParentObligationId(u) === parentObligationId,
  );
}

export function selectObligationById(
  s: ComplianceExecutionSnapshot, id: string,
): MergedExecutionUnit | undefined {
  return s.executionUnits.find(u => u.id === id);
}

/* ─── Role / committee / assignment filters ─────────────────── */

export interface MyTaskFilter {
  userId:        string;
  roleIds?:      readonly string[];
  committeeIds?: readonly string[];
  groupIds?:     readonly string[];
}

function unitMatchesUser(u: MergedExecutionUnit, f: MyTaskFilter): boolean {
  if (u.owner?.userId === f.userId)                                            return true;
  if (u.approver?.userId === f.userId)                                         return true;
  if (u.signatureOwner?.userId === f.userId)                                   return true;
  if (u.requiredSigners?.some(s => s.userId === f.userId))                     return true;
  if (u.ownership?.primaryOwnerUserId === f.userId)                            return true;
  if (u.ownership?.secondaryOwnerUserId === f.userId)                          return true;
  if (u.ownership?.assignedUserIds?.includes(f.userId))                        return true;
  if (f.roleIds?.length     && u.ownership?.assignedRoleIds?.some(r => f.roleIds!.includes(r)))     return true;
  if (f.committeeIds?.length && u.ownership?.committeeOwnerId
        && f.committeeIds.includes(u.ownership.committeeOwnerId))              return true;
  if (f.groupIds?.length    && u.ownership?.assignedGroupIds?.some(g => f.groupIds!.includes(g)))   return true;
  return false;
}

export function selectMyTaskObligations(
  s: ComplianceExecutionSnapshot, filter: MyTaskFilter,
): MergedExecutionUnit[] {
  return s.executionUnits.filter(u => unitMatchesUser(u, filter));
}

export function selectMyOpenTaskObligations(
  s: ComplianceExecutionSnapshot, filter: MyTaskFilter,
): MergedExecutionUnit[] {
  return selectMyTaskObligations(s, filter).filter(
    u => u.complianceState !== 'completed',
  );
}
