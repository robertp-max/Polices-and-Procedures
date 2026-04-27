/* ═══════════════════════════════════════════════════════════════
   Policy Lifecycle Store (Zustand)
   Holds one PolicyLifecycleEnvelope per policy id and exposes
   thin action wrappers that route every mutation through the pure
   state machine. Selectors are role-/state-aware.

   Seeding rule: every policy in the framework seed is created in
   DRAFT by TJ Padilla (AI Researcher), per project requirement.
   ═══════════════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { loadLifecycleSeed } from './lifecycleSeed';
import {
  createEnvelope,
  transition as smTransition,
} from './stateMachine';
import type {
  LifecycleActor,
  LifecycleIntent,
  LifecycleState,
  LifecycleTransitionResult,
  PolicyLifecycleEnvelope,
} from './types';
import { STATE_ORDER } from './types';

/** Canonical creator/owner for the seeded corpus. */
export const TJ_PADILLA: LifecycleActor = {
  userId: 'usr-tj-padilla',
  name:   'TJ Padilla',
  email:  'robertp@careindeed.com',
  role:   'AI Researcher',
};

interface LifecycleStoreState {
  /** Map keyed by policyId. */
  envelopes: Record<string, PolicyLifecycleEnvelope>;

  /** Read helpers. */
  getEnvelope:   (policyId: string) => PolicyLifecycleEnvelope | undefined;
  byState:       (state: LifecycleState) => PolicyLifecycleEnvelope[];
  countsByState: () => Record<LifecycleState, number>;

  /** Mutation: route the intent through the state machine. */
  apply: (
    policyId: string,
    intent:   LifecycleIntent,
    actor:    LifecycleActor,
    rationale?: string,
    signatureRef?: string | null,
  ) => LifecycleTransitionResult;

  /** Used by the workspace to add a brand-new policy (rare). */
  registerPolicy: (policyId: string, createdBy?: LifecycleActor) => PolicyLifecycleEnvelope;

  /** Reset to seed (test helper, not exposed in UI). */
  __resetToSeed: () => void;
}

function buildSeedEnvelopes(): Record<string, PolicyLifecycleEnvelope> {
  const { policies } = loadLifecycleSeed();
  const out: Record<string, PolicyLifecycleEnvelope> = {};
  policies.forEach(p => {
    out[p.id] = createEnvelope(p.id, TJ_PADILLA);
  });
  return out;
}

export const usePolicyLifecycleStore = create<LifecycleStoreState>((set, get) => ({
  envelopes: buildSeedEnvelopes(),

  getEnvelope: (policyId) => get().envelopes[policyId],

  byState: (state) =>
    Object.values(get().envelopes)
      .filter(e => e.state === state)
      .sort((a, b) => a.policyId.localeCompare(b.policyId)),

  countsByState: () => {
    const counts: Record<LifecycleState, number> = {
      DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 0, ARCHIVED: 0,
    };
    Object.values(get().envelopes).forEach(e => { counts[e.state]++; });
    return counts;
  },

  apply: (policyId, intent, actor, rationale, signatureRef) => {
    const envelope = get().envelopes[policyId];
    if (!envelope) {
      return { ok: false, code: 'NOT_FOUND', message: `Policy ${policyId} has no lifecycle envelope.` };
    }

    const result = smTransition(envelope, {
      intent,
      actor,
      rationale,
      signatureRef,
      auditorMode: useAuditorModeStore.getState().enabled,
    });

    if (!result.ok) {
      return result;
    }

    set(state => ({
      envelopes: { ...state.envelopes, [policyId]: result.next },
    }));
    return result;
  },

  registerPolicy: (policyId, createdBy = TJ_PADILLA) => {
    const env = createEnvelope(policyId, createdBy);
    set(state => ({ envelopes: { ...state.envelopes, [policyId]: env } }));
    return env;
  },

  __resetToSeed: () => set({ envelopes: buildSeedEnvelopes() }),
}));

/** Convenience selector: ordered queues for the workspace left rail. */
export function selectQueues(envelopes: Record<string, PolicyLifecycleEnvelope>) {
  return STATE_ORDER.map(state => ({
    state,
    items: Object.values(envelopes)
      .filter(e => e.state === state)
      .sort((a, b) => a.policyId.localeCompare(b.policyId)),
  }));
}
