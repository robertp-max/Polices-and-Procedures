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

/* Flat palette — dark shell readable, light shell acceptable. */
export const STATE_COLOR: Record<InstanceState, string> = {
  overdue:   '#EF4444',
  blocked:   '#EF4444',
  'due-soon':'#F59E0B',
  'on-track':'#14B8A6',
  complete:  '#14B8A6',
};

export const STATE_SOFT: Record<InstanceState, string> = {
  overdue:   'rgba(239,68,68,0.16)',
  blocked:   'rgba(239,68,68,0.16)',
  'due-soon':'rgba(245,158,11,0.18)',
  'on-track':'rgba(20,184,166,0.16)',
  complete:  'rgba(20,184,166,0.16)',
};

export const STATE_LABEL: Record<InstanceState, string> = {
  overdue:   'Overdue',
  blocked:   'Blocked',
  'due-soon':'Due Soon',
  'on-track':'On Track',
  complete:  'Complete',
};

/* Teal / orange primary tokens — local to the redesign so we are
   not bound to the legacy gold ci.teal/ci.orange aliases. */
export const TEAL_PRIMARY = '#14B8A6';
export const ACTION_COLOR = '#F97316';

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
