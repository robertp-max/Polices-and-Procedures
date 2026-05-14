/* ═══════════════════════════════════════════════════════════════
   useObligations — canonical React hook over the unified
   compliance-execution snapshot. Wraps `useComplianceExecution`
   and exposes Obligation-shaped views (SPRINT_TASK + TASK).
   No duplicate stores.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo } from 'react';
import { useComplianceExecution } from '@/policy/compliance-execution';
import {
  selectAllObligations,
  selectSprintTaskObligations,
  selectSprintTaskObligationsForSprint,
  selectTaskObligations,
  selectChildTasks,
  selectMyTaskObligations,
  selectMyOpenTaskObligations,
  selectObligationById,
  selectSprintTaskById,
  selectObligationsByRole,
  selectOpenObligationsByRole,
  resolveObligationKind,
  resolveParentObligationId,
  type SprintTaskObligation,
  type MyTaskFilter,
} from './obligationSelectors';
import type { Obligation } from '@/policy/ces/types';
import type { MergedExecutionUnit } from '@/policy/compliance-execution/complianceExecutionTypes';

export interface UseObligationsResult {
  /** All TASK + SPRINT_TASK execution-layer obligations from the store. */
  all:               readonly Obligation[];
  /** SPRINT_TASKs (calendar + sprint board container layer). */
  sprintTasks:       readonly SprintTaskObligation[];
  /** SPRINT_TASKs filtered to the active sprint window. */
  activeSprintTasks: readonly SprintTaskObligation[];
  /** TASKs (execution layer / My Tasks). */
  tasks:             readonly MergedExecutionUnit[];

  getById:           (id: string) => Obligation | undefined;
  getSprintTaskById: (id: string) => SprintTaskObligation | undefined;
  getChildTasks:     (parentObligationId: string) => MergedExecutionUnit[];
  getMyTasks:        (filter: MyTaskFilter) => MergedExecutionUnit[];
  getMyOpenTasks:    (filter: MyTaskFilter) => MergedExecutionUnit[];

  /** CES role-based filtering — used by Robert review mode only. */
  getTasksByRole:     (role: string) => MergedExecutionUnit[];
  getOpenTasksByRole: (role: string) => MergedExecutionUnit[];

  resolveKind:       typeof resolveObligationKind;
  resolveParentId:   typeof resolveParentObligationId;
}

export function useObligations(): UseObligationsResult {
  const snap = useComplianceExecution();
  return useMemo(() => ({
    all:               selectAllObligations(snap),
    sprintTasks:       selectSprintTaskObligations(snap),
    activeSprintTasks: selectSprintTaskObligationsForSprint(snap, snap.activeSprint.id),
    tasks:             selectTaskObligations(snap),

    getById:           (id) => selectObligationById(snap, id),
    getSprintTaskById: (id) => selectSprintTaskById(snap, id),
    getChildTasks:     (pid) => selectChildTasks(snap, pid),
    getMyTasks:        (f) => selectMyTaskObligations(snap, f),
    getMyOpenTasks:    (f) => selectMyOpenTaskObligations(snap, f),
    getTasksByRole:    (role) => selectObligationsByRole(snap, role),
    getOpenTasksByRole:(role) => selectOpenObligationsByRole(snap, role),

    resolveKind:       resolveObligationKind,
    resolveParentId:   resolveParentObligationId,
  }), [snap]);
}
