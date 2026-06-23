/* ═══════════════════════════════════════════════════════════════
   CES — Branded identifier types (Phase 2 — Task 2.1)
   ═══════════════════════════════════════════════════════════════
   Opaque string brands so a ControlId can't be passed where an EventId
   is expected, and vice-versa. Brands are purely type-level and fully
   ERASABLE (compatible with the app's `erasableSyntaxOnly`). Construct
   with the `as*` helpers; a branded id remains assignable TO `string`
   for rendering, URL building, and comparison.

   IMPORTANT: defined locally on purpose. Do NOT import id types from
   eCIgn or any other module (hard rule — CES owns its own id vocabulary).
   ═══════════════════════════════════════════════════════════════ */

declare const brand: unique symbol;

export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type ControlId = Brand<string, 'ControlId'>;
export type EventId = Brand<string, 'EventId'>;
export type WorkflowId = Brand<string, 'WorkflowId'>;
export type EvidenceRefId = Brand<string, 'EvidenceRefId'>;
export type TaskId = Brand<string, 'TaskId'>;

export const asControlId = (v: string): ControlId => v as ControlId;
export const asEventId = (v: string): EventId => v as EventId;
export const asWorkflowId = (v: string): WorkflowId => v as WorkflowId;
export const asEvidenceRefId = (v: string): EvidenceRefId => v as EvidenceRefId;
export const asTaskId = (v: string): TaskId => v as TaskId;

/** Structural guard usable by validators / runtime checks. */
export const isNonEmptyId = (v: unknown): v is string =>
  typeof v === 'string' && v.length > 0;
