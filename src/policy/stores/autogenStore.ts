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

/**
 * Pre-flight summary used to sanity-check a scheduling range BEFORE
 * any events are persisted. Produced by `previewRange`.
 */
export interface SchedulingPreview {
  rangeStart: string;
  rangeEnd: string;
  totals: {
    totalTemplates: number;
    totalEmitted: number;
    totalSkipped: number;
    totalConflicts: number;
  };
  byDomain: Record<string, number>;
  byCadence: Record<string, number>;
  /** Domain × cadence matrix for the user to eyeball before committing. */
  matrix: Array<{ domain: string; cadence: string; count: number }>;
  /** Excluded trigger-only templates so the operator can see what is NOT being scheduled. */
  triggerOnlyTemplates: Array<{ id: string; title: string; domain: string; triggerKinds: string[] }>;
}

interface AutogenState {
  generatedEvents: RegulatoryEvent[];
  triggeredEvents: RegulatoryEvent[];
  lastResult?: GenerationResult;
  lastGeneratedAt?: string;
  lastPreview?: SchedulingPreview;

  generateYear: (year: number) => GenerationResult;
  generateRange: (rangeStart: string, rangeEnd: string) => GenerationResult;
  /**
   * Dry-run: compute what `generateRange` would emit without touching
   * persisted state. Safe to call repeatedly.
   */
  previewRange: (rangeStart: string, rangeEnd: string) => SchedulingPreview;
  /**
   * Convenience: preview the July readiness rollout (readiness date →
   * +12 months). Non-triggered workflows only; triggered workflows are
   * always excluded by construction (TEMPLATE_REGISTRY ∩ TRIGGER_TEMPLATES = ∅).
   */
  previewJulyReadiness: (readinessYear?: number) => SchedulingPreview;
  /**
   * Commit the July readiness schedule. Generates a full 12-month
   * calendar starting on the readiness anchor. Triggered workflows
   * are excluded — they materialize only when their trigger fires.
   */
  generateJulyReadiness: (readinessYear?: number) => GenerationResult;
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

      previewRange: (rangeStart, rangeEnd) => {
        const existing = [...REGULATORY_EVENTS, ...get().generatedEvents, ...get().triggeredEvents];
        const result = generateEvents({
          templates: TEMPLATE_REGISTRY,
          rangeStart,
          rangeEnd,
          existingEvents: existing,
        });

        const byCadence: Record<string, number> = {};
        const matrixMap = new Map<string, { domain: string; cadence: string; count: number }>();
        for (const ev of result.generated) {
          const cad = ev.cadence ?? 'ad-hoc';
          byCadence[cad] = (byCadence[cad] ?? 0) + 1;
          const key = `${ev.domain}::${cad}`;
          const prev = matrixMap.get(key);
          if (prev) prev.count += 1;
          else matrixMap.set(key, { domain: ev.domain, cadence: cad, count: 1 });
        }
        const matrix = Array.from(matrixMap.values()).sort((a, b) =>
          a.domain === b.domain ? b.count - a.count : a.domain.localeCompare(b.domain),
        );

        const preview: SchedulingPreview = {
          rangeStart,
          rangeEnd,
          totals: {
            totalTemplates: result.summary.totalTemplates,
            totalEmitted: result.summary.totalEmitted,
            totalSkipped: result.summary.totalSkipped,
            totalConflicts: result.summary.totalConflicts,
          },
          byDomain: result.summary.byDomain,
          byCadence,
          matrix,
          triggerOnlyTemplates: TRIGGER_TEMPLATES.map(t => ({
            id: t.id,
            title: t.title,
            domain: t.domain,
            triggerKinds: t.trigger ? [t.trigger.kind] : [],
          })),
        };

        set({ lastPreview: preview });
        return preview;
      },

      previewJulyReadiness: (readinessYear) => {
        const year = readinessYear ?? new Date().getFullYear();
        const start = `${year}-07-01`;
        const end = `${year + 1}-06-30`;
        return get().previewRange(start, end);
      },

      generateJulyReadiness: (readinessYear) => {
        const year = readinessYear ?? new Date().getFullYear();
        const start = `${year}-07-01`;
        const end = `${year + 1}-06-30`;
        return get().generateRange(start, end);
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
