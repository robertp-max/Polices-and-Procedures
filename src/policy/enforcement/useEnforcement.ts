import { useMemo } from 'react';
import { REGULATORY_EVENTS, TODAY_ANCHOR, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { computeEnforcement, computeBatch } from './enforcementEngine';
import { computeEscalations } from './escalationEngine';
import type { EnforcementReport } from './types';

/* ═══════════════════════════════════════════════════════════════
   React hooks that compose the enforcement engine with live store
   state. These are the consumption surface for any UI that wants
   to display blockers, risk, or the "can I complete?" gate.
   ═══════════════════════════════════════════════════════════════ */

/** Live enforcement report for a single event. Memoized on the slices it reads. */
export function useEnforcementReport(event: RegulatoryEvent, now: Date = TODAY_ANCHOR): EnforcementReport {
  const exec = useRegulatoryExecutionStore();
  const lock = useEnforcementStore(s => s.locks[event.id]);

  // We depend on root slices (stable refs in zustand) rather than derived per-event
  // snapshots, so this memoization stays cheap.
  const formStates    = useRegulatoryExecutionStore(s => s.formStates);
  const stepStates    = useRegulatoryExecutionStore(s => s.stepStates);
  const minutesStates = useRegulatoryExecutionStore(s => s.minutesStates);
  const evidence      = useRegulatoryExecutionStore(s => s.evidence);
  const approvals     = useRegulatoryExecutionStore(s => s.approvals);
  const completions   = useRegulatoryExecutionStore(s => s.completions);

  return useMemo(() => computeEnforcement({
    event,
    now,
    stepStatus:    id => exec.effectiveStepStatus(event, id),
    formStatus:    id => exec.effectiveFormStatus(event, id),
    minutesStatus: () => exec.effectiveMinutesStatus(event),
    evidence:      evidence[event.id] ?? [],
    approvals:     approvals.filter(a => a.eventId === event.id),
    completion:    completions[event.id],
    lock,
    isComplete:    id => completions[id]?.status === 'complete',
    allEvents:     REGULATORY_EVENTS,
  }),
  // Only re-run when the underlying slices (or lock) change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [event, now, formStates, stepStates, minutesStates, evidence, approvals, completions, lock]);
}

/** Live enforcement reports for a collection of events. */
export function useEnforcementBatch(events: RegulatoryEvent[], now: Date = TODAY_ANCHOR) {
  const formStates    = useRegulatoryExecutionStore(s => s.formStates);
  const stepStates    = useRegulatoryExecutionStore(s => s.stepStates);
  const minutesStates = useRegulatoryExecutionStore(s => s.minutesStates);
  const evidence      = useRegulatoryExecutionStore(s => s.evidence);
  const approvals     = useRegulatoryExecutionStore(s => s.approvals);
  const completions   = useRegulatoryExecutionStore(s => s.completions);
  const locks         = useEnforcementStore(s => s.locks);
  const exec          = useRegulatoryExecutionStore();

  return useMemo(() => computeBatch(events.map(event => ({
    event,
    now,
    stepStatus:    id => exec.effectiveStepStatus(event, id),
    formStatus:    id => exec.effectiveFormStatus(event, id),
    minutesStatus: () => exec.effectiveMinutesStatus(event),
    evidence:      evidence[event.id] ?? [],
    approvals:     approvals.filter(a => a.eventId === event.id),
    completion:    completions[event.id],
    lock:          locks[event.id],
    isComplete:    id => completions[id]?.status === 'complete',
    allEvents:     REGULATORY_EVENTS,
  }))),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [events, now, formStates, stepStates, minutesStates, evidence, approvals, completions, locks]);
}

/** Periodic escalation sweep — materializes missing escalations into the store. */
export function sweepEscalations(events: RegulatoryEvent[] = REGULATORY_EVENTS, now: Date = new Date()) {
  const exec = useRegulatoryExecutionStore.getState();
  const enf  = useEnforcementStore.getState();
  for (const event of events) {
    const report = computeEnforcement({
      event,
      now,
      stepStatus:    id => exec.effectiveStepStatus(event, id),
      formStatus:    id => exec.effectiveFormStatus(event, id),
      minutesStatus: () => exec.effectiveMinutesStatus(event),
      evidence:      exec.evidence[event.id] ?? [],
      approvals:     exec.approvals.filter(a => a.eventId === event.id),
      completion:    exec.completions[event.id],
      lock:          enf.locks[event.id],
      isComplete:    id => exec.completions[id]?.status === 'complete',
      allEvents:     events,
    });
    const desired = computeEscalations({
      event,
      report,
      approvals: exec.approvals.filter(a => a.eventId === event.id),
      now,
    });
    // Raise any desired escalation that is not already open/acknowledged for this event.
    const current = enf.escalationsForEvent(event.id);
    for (const d of desired) {
      const already = current.find(
        c => c.kind === d.kind && c.status !== 'resolved' &&
             c.targetId === d.targetId && c.reason === d.reason,
      );
      if (!already) enf.raiseEscalation(d);
    }
  }
}
