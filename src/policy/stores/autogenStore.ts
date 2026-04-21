import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { REGULATORY_EVENTS, type RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { TEMPLATE_REGISTRY, TRIGGER_TEMPLATES } from '@/policy/autogen/templateRegistry';
import { generateEvents } from '@/policy/autogen/annualGenerator';
import { materializeTrigger, type TriggerSignal } from '@/policy/autogen/triggerEngine';
import { useEnforcementStore } from './enforcementStore';
import { sweepEscalations } from '@/policy/enforcement/useEnforcement';
import type { GenerationResult } from '@/policy/autogen/types';

/* ═══════════════════════════════════════════════════════════════
   Autogen Store
   ----------------------------------------------------------------
   Holds:
     - generatedEvents[]  : events emitted by the annual generator
     - triggeredEvents[]  : events materialized from trigger signals
     - lastResult         : summary of the last generation run

   Consumers merge these into their own event views via
   `useMergedEvents()`.
   ═══════════════════════════════════════════════════════════════ */

interface AutogenState {
  generatedEvents: RegulatoryEvent[];
  triggeredEvents: RegulatoryEvent[];
  lastResult?: GenerationResult;
  lastGeneratedAt?: string;

  generateYear: (year: number) => GenerationResult;
  generateRange: (rangeStart: string, rangeEnd: string) => GenerationResult;
  fireTrigger: (signal: TriggerSignal) => RegulatoryEvent | null;
  clearAll: () => void;
  clearGenerated: () => void;
}

export const useAutogenStore = create<AutogenState>()(
  persist(
    (set, get) => ({
      generatedEvents: [],
      triggeredEvents: [],

      generateYear: (year) => {
        const start = `${year}-01-01`;
        const end = `${year}-12-31`;
        return get().generateRange(start, end);
      },

      generateRange: (rangeStart, rangeEnd) => {
        const existing = [...REGULATORY_EVENTS, ...get().generatedEvents, ...get().triggeredEvents];
        const result = generateEvents({
          templates: TEMPLATE_REGISTRY,
          rangeStart,
          rangeEnd,
          existingEvents: existing,
        });
        set({
          generatedEvents: [...get().generatedEvents, ...result.generated],
          lastResult: result,
          lastGeneratedAt: new Date().toISOString(),
        });
        // Audit-log the generation.
        useEnforcementStore.getState().log({
          action: 'mutation.blocked',
          eventId: '__autogen__',
          reason: `Autogen: emitted ${result.summary.totalEmitted}, skipped ${result.summary.totalSkipped}, conflicts ${result.summary.totalConflicts} (${rangeStart} → ${rangeEnd}).`,
        });
        // Run enforcement sweep across the newly-generated set so overdue /
        // escalation state is materialized immediately.
        try { sweepEscalations([...REGULATORY_EVENTS, ...get().generatedEvents, ...get().triggeredEvents]); }
        catch { /* non-fatal: sweep failure should not block generation. */ }
        return result;
      },

      fireTrigger: (signal) => {
        const ev = materializeTrigger(signal, TRIGGER_TEMPLATES);
        if (!ev) return null;
        set(s => ({ triggeredEvents: [...s.triggeredEvents, ev] }));
        useEnforcementStore.getState().log({
          action: 'mutation.blocked',
          eventId: ev.id,
          reason: `Trigger event materialized: ${signal.kind} (${signal.severity ?? 'n/a'})`,
        });
        return ev;
      },

      clearGenerated: () => set({ generatedEvents: [], lastResult: undefined }),
      clearAll:       () => set({ generatedEvents: [], triggeredEvents: [], lastResult: undefined }),
    }),
    {
      name: 'autogen-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Merge base catalog + generated + triggered for any view that wants the full set. */
export function useMergedEvents(): RegulatoryEvent[] {
  const gen = useAutogenStore(s => s.generatedEvents);
  const trg = useAutogenStore(s => s.triggeredEvents);
  return [...REGULATORY_EVENTS, ...gen, ...trg];
}
