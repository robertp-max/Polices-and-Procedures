/* ══════════════════════════════════════════════════════════════════════
   Brad — Workflow Runtime Adapter.

   Bridges the compiled workflow corpus (static) with the live
   regulatoryExecutionStore state (dynamic). Used by Brad's workflow
   answerer to produce state-aware guidance without duplicating the
   runtime store. No parallel workflow runtime store — this file is
   strictly read-only over what already exists.
   ══════════════════════════════════════════════════════════════════════ */

import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import type { FormStatus } from '@/policy/stores/regulatoryExecutionStore';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import type { RuntimeState } from './workflowKnowledge';

/**
 * Build a RuntimeState slice for Brad from an active RegulatoryEvent
 * instance. The instanceId is the RegulatoryEvent.id already used by the
 * execution store.
 */
export function buildWorkflowRuntimeState(
  workflowId: string,
  instanceId: string,
): RuntimeState {
  const wf = WORKFLOWS[workflowId];
  if (!wf) return { instanceId };

  // Read directly from the store to avoid hook overhead in non-React callers.
  const state = useRegulatoryExecutionStore.getState();

  // Step progress — map authored step order → store keys if the caller
  // has registered step IDs in the canonical RegulatoryEvent seed. We
  // fall back to "count consecutive completed steps from the top".
  let currentStep = 0;
  for (const s of wf.steps) {
    const stepKey = `${instanceId}::${s.order}`;
    const entry = state.stepStates[stepKey];
    if (entry?.status === 'complete') currentStep = s.order;
    else break;
  }

  // Missing forms.
  const missingForms: string[] = [];
  for (const f of wf.requiredForms) {
    const fkey = `${instanceId}::${f}`;
    const entry = state.formStates[fkey];
    const status: FormStatus | undefined = entry?.status;
    if (!status || status === 'missing' || status === 'pending') missingForms.push(f);
  }

  // Pending approvals (store exposes a flat array named `approvals`).
  const pendingApprovals = (state.approvals ?? [])
    .filter((r) => r.eventId === instanceId && r.status === 'pending')
    .map((r) => r.targetLabel);

  return {
    instanceId,
    currentStep,
    missingForms,
    pendingApprovals,
    overdue: false, // caller should set based on event SLA if known
  };
}
