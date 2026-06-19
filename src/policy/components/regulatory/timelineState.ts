import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { daysUntil } from '@/policy/data/regulatoryEvents';
import type { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';

/* ═══════════════════════════════════════════════════════════════
   Execution Timeline · state model
   --------------------------------------------------------------
   A workflow instance (RegulatoryEvent + execution store overlay)
   is classified into ONE state. Color is then derived from the
   state alone — nothing else drives color on the timeline.

     red   → overdue / blocked
     amber → due soon
     teal  → on track / complete

   Orange is reserved for ACTION (buttons / CTAs). It is NOT a
   state color.
   ═══════════════════════════════════════════════════════════════ */

export type InstanceState =
  | 'overdue'
  | 'blocked'
  | 'due-soon'
  | 'on-track'
  | 'complete';

/* State palette — derived from --ci-* semantic tokens so colours
   automatically follow CI-ION dark / Care Indeed light / dark variants.
   ACTION_COLOR and TEAL_PRIMARY remain canonical accent tokens below. */
export const STATE_COLOR: Record<InstanceState, string> = {
  overdue:   'var(--ci-danger-fg)',
  blocked:   'var(--ci-danger-fg)',
  'due-soon':'var(--ci-warning-fg)',
  'on-track':'var(--ci-state-on-track, var(--ci-accent))',
  complete:  'var(--ci-state-on-track, var(--ci-accent))',
};

export const STATE_SOFT: Record<InstanceState, string> = {
  overdue:   'var(--ci-danger-bg)',
  blocked:   'var(--ci-danger-bg)',
  'due-soon':'var(--ci-warning-bg)',
  'on-track':'var(--ci-state-on-track-bg, rgba(var(--ci-accent-rgb), 0.16))',
  complete:  'var(--ci-state-on-track-bg, rgba(var(--ci-accent-rgb), 0.16))',
};

export const STATE_LABEL: Record<InstanceState, string> = {
  overdue:   'Overdue',
  blocked:   'Blocked',
  'due-soon':'Due Soon',
  'on-track':'On Track',
  complete:  'Complete',
};

/* Teal / orange primary accents — typed hex constants.
   Phase 3 NOTE: These remain hex (not CSS vars) because numerous consumers
   build alpha-variant strings via template literal (`${TEAL_PRIMARY}55`) for
   border + background tints. Hex literals are the contract those consumers
   depend on. The semantic tokens `--ci-state-on-track` and `--ci-action`
   mirror these values in src/index.css so direct-CSS authors stay in sync. */
export const TEAL_PRIMARY = '#007970';
export const ACTION_COLOR = '#E07B2C';

type ExecStore = ReturnType<typeof useRegulatoryExecutionStore.getState>;

/**
 * Classify one workflow instance for the timeline color + dashboard
 * bucketing. The order matters — blocked/overdue short-circuit so a
 * blocked event with a past due date is still rendered as blocked.
 */
export function classifyInstance(
  event: RegulatoryEvent,
  today: Date,
  store: ExecStore,
): InstanceState {
  if (store.isEventComplete(event.id)) return 'complete';

  const n = daysUntil(event.date, today);
  const urg = store.effectiveUrgency(event);

  if (urg === 'blocked') return 'blocked';

  // Unmet hard dependency → treat as blocked.
  const deps = event.dependencies?.dependsOn ?? [];
  if (deps.length) {
    const anyUnmet = deps.some(id => !store.isEventComplete(id));
    if (anyUnmet) return 'blocked';
  }

  if (urg === 'overdue' || n < 0) return 'overdue';
  if (urg === 'critical' || urg === 'due-soon' || (n >= 0 && n <= 7)) return 'due-soon';
  return 'on-track';
}

/** Does the instance have any actionable gap right now? */
export function hasMissingEvidence(event: RegulatoryEvent, store: ExecStore): boolean {
  if (event.requiredForms.some(f => store.effectiveFormStatus(event, f.id) === 'missing')) return true;
  if (event.minutes && store.effectiveMinutesStatus(event) === 'missing') return true;
  return false;
}

export function hasPendingApproval(eventId: string, store: ExecStore): boolean {
  return store.approvals.some(a => a.eventId === eventId && a.status === 'pending');
}

export function hasInProgressStep(event: RegulatoryEvent, store: ExecStore): boolean {
  return event.processFlow.some(s => store.effectiveStepStatus(event, s.id) === 'in-progress');
}
