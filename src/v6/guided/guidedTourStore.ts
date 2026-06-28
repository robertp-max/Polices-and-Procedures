import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GuidedTour, GuidedTourStep, TourLockState } from './types';

/* ═══════════════════════════════════════════════════════════════════════════
   Guided tour store.
   ----------------------------------------------------------------------------
   • savedTours  — persisted to localStorage, keyed by tourKey, for reuse.
   • runtime     — active tour, current step, gating (NOT persisted).

   Strict gating is enforced here, not just in the UI: `next()` refuses to
   advance until the current step has been validated (`markStepValidated`), and
   `allowedSelectors` exposes the only interactive targets while a tour is active.
   ═══════════════════════════════════════════════════════════════════════════ */

const LOCKED_REASON = 'This part is locked during the tour. Complete the highlighted step first.';

export interface GuidedTourState {
  /** Persisted, reusable tours by tourKey. */
  savedTours: Record<string, GuidedTour>;

  /** Runtime (not persisted). */
  active: boolean;
  tour: GuidedTour | null;
  currentStepIndex: number;
  stepValidated: boolean;
  targetMissing: boolean;
  permissionBlocked: boolean;
  error: string | null;

  /** Save (create/update) a tour for reuse. */
  saveTour: (tour: GuidedTour) => void;
  /** Return a saved tour by key, or null. */
  getSavedTour: (tourKey: string) => GuidedTour | null;
  /**
   * Reuse the saved tour for this key when present AND its selectors still
   * validate; otherwise build + save a fresh one. `validateSelectors` lets the
   * caller confirm the saved tour's anchors are still resolvable.
   */
  getOrCreateTour: (
    tourKey: string,
    build: () => GuidedTour,
    validateSelectors?: (tour: GuidedTour) => boolean,
  ) => { tour: GuidedTour; reused: boolean };

  /** Launch a tour (saves it first), optionally starting at a specific step. */
  launchTour: (tour: GuidedTour, startStepId?: string | null) => void;
  /** Mark the current step's completion condition as satisfied (enables Next). */
  markStepValidated: () => void;
  /** Advance — only succeeds when the current step is validated. Returns true if advanced/completed. */
  next: () => boolean;
  /** Recovery-only escape hatch: advance past a step whose target is unavailable.
      Used solely from the recovery/hand-off UI so a missing target can never trap. */
  skipStep: () => void;
  cancelTour: () => void;
  setTargetMissing: (missing: boolean) => void;
  setPermissionBlocked: (blocked: boolean) => void;

  /** Derived helpers. */
  currentStep: () => GuidedTourStep | null;
  lockState: () => TourLockState;
}

function computeAllowedSelectors(step: GuidedTourStep | null): string[] {
  if (!step) return [];
  const out = new Set<string>([step.targetSelector]);
  for (const a of step.allowedActions) out.add(a.selector);
  // Tour controls are always interactive.
  out.add('[data-tour-control]');
  return [...out];
}

export const useGuidedTourStore = create<GuidedTourState>()(
  persist(
    (set, get) => ({
      savedTours: {},
      active: false,
      tour: null,
      currentStepIndex: 0,
      stepValidated: false,
      targetMissing: false,
      permissionBlocked: false,
      error: null,

      saveTour: (tour) =>
        set((s) => ({ savedTours: { ...s.savedTours, [tour.tourKey]: tour } })),

      getSavedTour: (tourKey) => get().savedTours[tourKey] ?? null,

      getOrCreateTour: (tourKey, build, validateSelectors) => {
        const saved = get().savedTours[tourKey];
        if (saved && (!validateSelectors || validateSelectors(saved))) {
          return { tour: saved, reused: true };
        }
        const fresh = build();
        set((s) => ({ savedTours: { ...s.savedTours, [fresh.tourKey]: fresh } }));
        return { tour: fresh, reused: false };
      },

      launchTour: (tour, startStepId) => {
        const startIndex = startStepId ? Math.max(0, tour.steps.findIndex((s) => s.id === startStepId)) : 0;
        set((s) => ({
          savedTours: { ...s.savedTours, [tour.tourKey]: tour },
          active: true,
          tour,
          currentStepIndex: startIndex < 0 ? 0 : startIndex,
          stepValidated: false,
          targetMissing: false,
          permissionBlocked: false,
          error: null,
        }));
      },

      markStepValidated: () => set({ stepValidated: true }),

      next: () => {
        const { tour, currentStepIndex, stepValidated } = get();
        if (!tour) return false;
        // STRICT GATING: cannot advance until the current step is validated.
        if (!stepValidated) return false;
        const isLast = currentStepIndex >= tour.steps.length - 1;
        if (isLast) {
          set({ active: false, stepValidated: false });
          return true;
        }
        set({
          currentStepIndex: currentStepIndex + 1,
          stepValidated: false,
          targetMissing: false,
          permissionBlocked: false,
        });
        return true;
      },

      skipStep: () => {
        const { tour, currentStepIndex } = get();
        if (!tour) return;
        const isLast = currentStepIndex >= tour.steps.length - 1;
        if (isLast) {
          set({ active: false, stepValidated: false });
          return;
        }
        set({ currentStepIndex: currentStepIndex + 1, stepValidated: false, targetMissing: false, permissionBlocked: false });
      },

      cancelTour: () =>
        set({ active: false, tour: null, currentStepIndex: 0, stepValidated: false, targetMissing: false, permissionBlocked: false, error: null }),

      setTargetMissing: (missing) => set({ targetMissing: missing }),
      setPermissionBlocked: (blocked) => set({ permissionBlocked: blocked }),

      currentStep: () => {
        const { tour, currentStepIndex } = get();
        return tour ? tour.steps[currentStepIndex] ?? null : null;
      },

      lockState: () => {
        const { active, tour } = get();
        const step = get().currentStep();
        return {
          active,
          tourId: tour?.id ?? null,
          currentStepId: step?.id ?? null,
          allowedSelectors: active ? computeAllowedSelectors(step) : [],
          lockedReason: LOCKED_REASON,
        };
      },
    }),
    {
      name: 'brad.guided-tours',
      storage: createJSONStorage(() => localStorage),
      // Persist ONLY saved tours — runtime state is ephemeral.
      partialize: (s) => ({ savedTours: s.savedTours }),
    },
  ),
);

export const TOUR_LOCKED_REASON = LOCKED_REASON;
