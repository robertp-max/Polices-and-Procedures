/* ═══════════════════════════════════════════════════════════════
   eventWorkflowAlignment.ts
   ──────────────────────────────────────────────────────────────
   Single source of executable steps for any RegulatoryEvent that
   declares a `workflowId`.

   When an event is linked to a workflow (e.g. Q2 QAPI Review →
   `QA-WF-03`), its `processFlow` and `requiredForms` MUST be
   produced from `WORKFLOWS[workflowId].steps[]` — not authored by
   hand. This module is the only place that performs that mapping.

   Hard rules enforced here (mirrored by `scripts/verifyAlignment.ts`):

     1. 1 workflow.step  ⇒  1 EventProcessStep (no aggregation, no
        rewording, no reordering).
     2. Execution-unit id format:  `{event.id}-{NN}`  (NN = 01-padded
        deterministic sequence, stable across reloads).
     3. requiredForms is the deduped union of every step.formIds[]
        plus the workflow's top-level §7 requiredForms list — no
        extra forms, no missing forms.
     4. Every step carries a story-point estimate ∈ {1,2,3,5,8}.
   ═══════════════════════════════════════════════════════════════ */

import { WORKFLOWS } from './workflows.generated';
import { getFormMeta } from './formsCatalog';
import { resolveCanonicalFormId, resolveFormTitle } from './formIdAliases';
import type { EventEvidenceItem, EventProcessStep } from './regulatoryEvents';

const STORY_POINTS = new Set([1, 2, 3, 5, 8]);

export function isValidStoryPoints(value: unknown): value is 1 | 2 | 3 | 5 | 8 {
  return typeof value === 'number' && STORY_POINTS.has(value as 1 | 2 | 3 | 5 | 8);
}

/** Story-point heuristic. Effort, not importance. */
export function inferStoryPoints(
  action: string,
  role: string,
): 1 | 2 | 3 | 5 | 8 {
  const a = `${action} ${role}`.toLowerCase();
  // Signature / acknowledgment work: trivial.
  if (/\b(sign|signature|acknowledge|attest)\b/.test(a)) return 1;
  // Heavy multi-domain coordination / audit / RCA / committee work.
  if (/\b(audit|review committee|root cause|rca|committee|coordinate|aggregate|stratified|investigation)\b/.test(a)) return 5;
  // Document / compile / submit / distribute / draft.
  if (/\b(compile|distribute|submit|draft|prepare|publish|finalize|file)\b/.test(a)) return 3;
  // Decisions, validation, escalation, scoring.
  if (/\b(verify|validate|decide|escalate|score|assess|approve)\b/.test(a)) return 3;
  // Default operational step.
  return 2;
}

/** Best-effort parse of "Day N", "Within N days", etc. into a numeric offset. */
function parseDeadlineOffset(deadline: string): number {
  if (!deadline) return 0;
  const d = deadline.toLowerCase();
  const dayMatch = d.match(/day\s*([+-]?\d+)/);
  if (dayMatch) return parseInt(dayMatch[1]!, 10);
  const withinMatch = d.match(/within\s*(\d+)\s*(day|hour|week)/);
  if (withinMatch) {
    const n = parseInt(withinMatch[1]!, 10);
    const unit = withinMatch[2]!;
    if (unit === 'hour') return Math.ceil(n / 24);
    if (unit === 'week') return n * 7;
    return n;
  }
  if (/before/.test(d)) return -1;
  return 0;
}

/** Zero-pad to 2 digits ("1" → "01"). */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

/** Deterministic execution-unit id: `{event.id}-{NN}`. */
export function executionUnitId(eventId: string, order: number): string {
  return `${eventId}-${pad2(order)}`;
}

/**
 * Build the workflow-aligned execution units + required forms for an
 * event. Returns `null` when the workflow is unknown so the caller can
 * fall back to authored data.
 */
export function buildWorkflowAlignedExecution(
  eventId: string,
  workflowId: string,
): { processFlow: EventProcessStep[]; requiredForms: EventEvidenceItem[] } | null {
  const wf = WORKFLOWS[workflowId];
  if (!wf) return null;

  const processFlow: EventProcessStep[] = wf.steps.map((step) => {
    const id = executionUnitId(eventId, step.order);
    const instructions = [
      step.role && `Role: ${step.role}`,
      step.deadline && `Deadline: ${step.deadline}`,
      step.formRaw && `Form(s): ${step.formRaw}`,
    ].filter(Boolean).join(' · ');

    return {
      id,
      label: step.action,
      description: step.action,
      instructions: instructions || undefined,
      requiredFormIds: step.formIds,
      status: 'pending',
      dueOffsetDays: parseDeadlineOffset(step.deadline),
      storyPoints: inferStoryPoints(step.action, step.role),
      sourceType: 'workflow_derived',
    };
  });

  // Dedupe form IDs across every step + workflow §7 list.
  const formIdSet = new Set<string>();
  for (const s of wf.steps) for (const f of s.formIds) formIdSet.add(f);
  for (const f of wf.requiredForms) formIdSet.add(f);

  const requiredForms: EventEvidenceItem[] = Array.from(formIdSet).map((fid) => {
    const canon = resolveCanonicalFormId(fid) ?? fid;
    const meta = getFormMeta(canon) || getFormMeta(fid);
    const label = meta?.title ?? resolveFormTitle(canon) ?? resolveFormTitle(fid) ?? fid;
    return {
      id:     `f-${fid}`,
      label,
      formId: canon,
      status: 'pending',
    };
  });

  return { processFlow, requiredForms };
}

/**
 * Pipeline-friendly form: returns a NEW event with workflow-aligned
 * `processFlow` + `requiredForms` when the event declares a `workflowId`
 * that resolves in `WORKFLOWS`. Otherwise returns the event unchanged.
 *
 * Use this in `REGULATORY_EVENTS` assembly so the alignment is applied
 * uniformly without each event author having to wire it manually.
 */
export function applyWorkflowAlignment<T extends {
  id: string;
  workflowId?: string;
  processFlow: EventProcessStep[];
  requiredForms: EventEvidenceItem[];
}>(event: T): T {
  if (!event.workflowId) return event;
  const aligned = buildWorkflowAlignedExecution(event.id, event.workflowId);
  if (!aligned) return event; // unknown workflow — leave authored data
  return {
    ...event,
    processFlow:   aligned.processFlow,
    requiredForms: aligned.requiredForms,
  };
}

/**
 * Normalizes event-level exception steps to the same execution-unit
 * contract as workflow-derived steps:
 *   - deterministic id: {event.id}-{NN}
 *   - storyPoints always present and valid
 *   - source marker identifying the step provenance
 */
export function normalizeEventLevelProcessFlow(
  eventId: string,
  processFlow: EventProcessStep[],
  ownerRole: string,
): EventProcessStep[] {
  return processFlow.map((step, idx) => {
    const inferredStoryPoints = inferStoryPoints(
      step.label || step.description || 'event step',
      ownerRole,
    );
    return {
      ...step,
      id: executionUnitId(eventId, idx + 1),
      storyPoints: isValidStoryPoints(step.storyPoints)
        ? step.storyPoints
        : inferredStoryPoints,
      sourceType: 'event_authored_exception',
    };
  });
}
