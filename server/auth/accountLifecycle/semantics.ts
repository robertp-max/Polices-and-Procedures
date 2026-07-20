/**
 * Pure lifecycle semantic core (ADR-0002 Phase 2B closure, commit 1A).
 *
 * The single policy authority for account-lifecycle mutations. It is PURE: no
 * reads, no writes, no AWS, no env, no clock. Each planner accepts already-
 * validated current state + an intent and returns an immutable, persistence-
 * neutral `LifecycleMutationPlan` (expectations the persistence op must prove +
 * the resulting writes). Adapters translate plans into their own mechanics; they
 * never re-decide policy. It emits NO DynamoDB expressions.
 *
 * This commit intentionally does not rewire adapters, change the persisted
 * schema, or add codecs — those are later coordinated commits. The core defines
 * its own ordered step vocabulary (`SemanticLifecycleStep`, incl.
 * `transition_ready_audited`) so it does not yet depend on the shared
 * `LifecycleStep` type (which still carries the pre-rename `completion_audited`).
 */
import { ApiError } from '../../errors.js';
import type { AccountLifecycleStatus, LifecycleAction, LifecycleOperationStatus } from './types.js';

/* ── vocabulary ───────────────────────────────────────────────────────────── */

export type SemanticLifecycleStep =
  | 'intent_recorded'
  | 'global_deny_committed'
  | 'canonical_transition_projected'
  | 'provider_disabled'
  | 'provider_sessions_revoked'
  | 'provider_enabled'
  | 'registration_projected'
  | 'canonical_final_projected'
  | 'transition_ready_audited'
  | 'final_state_committed';

/** Exact ordered step sequence per action (index = dependency order). Runtime-
 *  frozen so the central policy order cannot be mutated through a cast. */
export const SUSPEND_STEP_ORDER: readonly SemanticLifecycleStep[] = Object.freeze([
  'intent_recorded', 'global_deny_committed', 'canonical_transition_projected',
  'provider_disabled', 'provider_sessions_revoked', 'registration_projected',
  'canonical_final_projected', 'transition_ready_audited', 'final_state_committed',
] as SemanticLifecycleStep[]);
export const REACTIVATE_STEP_ORDER: readonly SemanticLifecycleStep[] = Object.freeze([
  'intent_recorded', 'global_deny_committed', 'canonical_transition_projected',
  'provider_enabled', 'registration_projected', 'canonical_final_projected',
  'transition_ready_audited', 'final_state_committed',
] as SemanticLifecycleStep[]);
/** Steps the store commits itself (begin / complete), never advanced manually. */
const BOUNDARY_STEPS: ReadonlySet<SemanticLifecycleStep> = new Set(['intent_recorded', 'global_deny_committed', 'final_state_committed']);
/** Steps committed atomically by beginTransition — never eligible as a failedStep. */
const BEGIN_STEPS: ReadonlySet<SemanticLifecycleStep> = new Set(['intent_recorded', 'global_deny_committed']);

export function stepOrderForAction(action: LifecycleAction): readonly SemanticLifecycleStep[] {
  return action === 'suspend' ? SUSPEND_STEP_ORDER : REACTIVATE_STEP_ORDER;
}

const ADVANCE_STATUSES: ReadonlySet<LifecycleOperationStatus> = new Set(['intent_recorded', 'running', 'reconciliation_required']);
const RECONCILE_STATUSES: ReadonlySet<LifecycleOperationStatus> = new Set(['intent_recorded', 'running', 'reconciliation_required']);
const COMPLETE_STATUSES: ReadonlySet<LifecycleOperationStatus> = new Set(['running', 'reconciliation_required']);

/* ── errors ───────────────────────────────────────────────────────────────── */

export function planError(code: string, message: string, status = 400): ApiError {
  return new ApiError(code, message, status);
}

/* ── field mutation + plan shape ──────────────────────────────────────────── */

export type FieldMutation<T> =
  | { action: 'set'; value: T }
  | { action: 'remove' }
  | { action: 'preserve' };

export type PlanEffect = 'begin' | 'advance' | 'advance_noop' | 'reconcile' | 'complete';

export interface LifecycleExpectation {
  lifecycleVersion: number;
  lifecycleStatusIn: AccountLifecycleStatus[];
  reservation: { action: 'absent' } | { action: 'equals'; operationId: string };
  idempotencyClaim?: 'absent';
  operationVersion?: number;
  operationStatusIn?: LifecycleOperationStatus[];
}

export interface LifecycleWrites {
  lifecycleStatus: AccountLifecycleStatus;
  lifecycleVersion: number;
  currentOperationId: FieldMutation<string>;
  lastCompletedOperationId: FieldMutation<string>;
  operationStatus: LifecycleOperationStatus;
  operationVersion: number;
  completedSteps: SemanticLifecycleStep[];
  failedStep: FieldMutation<SemanticLifecycleStep>;
  failureCode: FieldMutation<string>;
}

export interface LifecycleMutationPlan {
  effect: PlanEffect;
  expect: LifecycleExpectation;
  writes: LifecycleWrites;
}

/* ── input views (minimal, schema-neutral) ───────────────────────────────── */

export interface LifecycleView {
  status: AccountLifecycleStatus;
  version: number;
  currentOperationId?: string;
}
export interface OperationView {
  operationId: string;
  action: LifecycleAction;
  status: LifecycleOperationStatus;
  operationVersion: number;
  transitionalStatus: AccountLifecycleStatus;
  desiredStatus: AccountLifecycleStatus;
  completedSteps: readonly SemanticLifecycleStep[];
}

export interface BeginTransitionIntent {
  action: LifecycleAction;
  operationId: string;
  expectedFromStatus: AccountLifecycleStatus;
  transitionalStatus: AccountLifecycleStatus;
  desiredFinalStatus: AccountLifecycleStatus;
  expectedLifecycleVersion: number;
}

/* ── helpers ──────────────────────────────────────────────────────────────── */

function assertActionTriple(intent: BeginTransitionIntent): void {
  const { action, expectedFromStatus: f, transitionalStatus: t, desiredFinalStatus: d } = intent;
  if (action === 'suspend' && f === 'active' && t === 'suspending' && d === 'suspended') return;
  if (action === 'reactivate' && (f === 'suspended' || f === 'reconciliation_required') && t === 'reactivating' && d === 'active') return;
  throw planError('LIFECYCLE_TRANSITION_INVALID', `Unsupported ${action} transition ${f}→${t}→${d}.`);
}

/** Ensure a step is advanceable, action-compatible, and all prerequisites present. */
function assertAdvanceStep(action: LifecycleAction, step: SemanticLifecycleStep, completed: readonly SemanticLifecycleStep[]): void {
  if (BOUNDARY_STEPS.has(step)) throw planError('LIFECYCLE_STEP_ILLEGAL', `Step '${step}' is committed by the store, not advanced manually.`);
  const order = stepOrderForAction(action);
  const idx = order.indexOf(step);
  if (idx < 0) throw planError('LIFECYCLE_STEP_WRONG_ACTION', `Step '${step}' does not belong to action '${action}'.`);
  for (let i = 0; i < idx; i += 1) {
    if (!completed.includes(order[i])) throw planError('LIFECYCLE_STEP_OUT_OF_ORDER', `Step '${step}' requires '${order[i]}' first.`);
  }
}

function validateFailureCode(code: string): string {
  const c = String(code ?? '').trim();
  if (!c) throw planError('LIFECYCLE_FAILURE_CODE_INVALID', 'failureCode is required.');
  if (c.length > 200) throw planError('LIFECYCLE_FAILURE_CODE_INVALID', 'failureCode is too long.');
  // eslint-disable-next-line no-control-regex
  if (new RegExp('[\\u0000-\\u001f\\u007f]').test(c)) throw planError('LIFECYCLE_FAILURE_CODE_INVALID', 'failureCode has control characters.');
  return c;
}

/** Defense-in-depth: the operation's transitional/desired pair must match its action. */
function assertOperationShape(op: OperationView): void {
  const ok = op.action === 'suspend'
    ? op.transitionalStatus === 'suspending' && op.desiredStatus === 'suspended'
    : op.transitionalStatus === 'reactivating' && op.desiredStatus === 'active';
  if (!ok) throw planError('LIFECYCLE_OP_SHAPE_INVALID', `Operation shape does not match action '${op.action}'.`, 409);
}

/** Recursively freeze a plan so returned plans are truly immutable. */
function freezePlan(plan: LifecycleMutationPlan): LifecycleMutationPlan {
  Object.freeze(plan.expect.lifecycleStatusIn);
  if (plan.expect.operationStatusIn) Object.freeze(plan.expect.operationStatusIn);
  Object.freeze(plan.expect.reservation);
  Object.freeze(plan.expect);
  Object.freeze(plan.writes.completedSteps);
  Object.freeze(plan.writes.currentOperationId);
  Object.freeze(plan.writes.lastCompletedOperationId);
  Object.freeze(plan.writes.failedStep);
  Object.freeze(plan.writes.failureCode);
  Object.freeze(plan.writes);
  return Object.freeze(plan);
}

/* ── planners ─────────────────────────────────────────────────────────────── */

export function planBeginTransition(intent: BeginTransitionIntent): LifecycleMutationPlan {
  assertActionTriple(intent);
  return freezePlan({
    effect: 'begin',
    expect: {
      lifecycleVersion: intent.expectedLifecycleVersion,
      lifecycleStatusIn: [intent.expectedFromStatus],
      reservation: { action: 'absent' },
      idempotencyClaim: 'absent',
    },
    writes: {
      lifecycleStatus: intent.transitionalStatus,
      lifecycleVersion: intent.expectedLifecycleVersion + 1,
      currentOperationId: { action: 'set', value: intent.operationId },
      lastCompletedOperationId: { action: 'preserve' },
      operationStatus: 'intent_recorded',
      operationVersion: 1,
      completedSteps: ['intent_recorded', 'global_deny_committed'],
      failedStep: { action: 'remove' },
      failureCode: { action: 'remove' },
    },
  });
}

export function planAdvanceOperation(life: LifecycleView, op: OperationView, step: SemanticLifecycleStep): LifecycleMutationPlan {
  assertOperationShape(op);
  if (op.status === 'completed') throw planError('LIFECYCLE_OP_TERMINAL', 'A completed operation cannot advance.', 409);
  if (!ADVANCE_STATUSES.has(op.status)) throw planError('LIFECYCLE_OP_STATUS_INVALID', `Operation status '${op.status}' cannot advance.`, 409);
  assertAdvanceStep(op.action, step, op.completedSteps);
  const reservationExpect: LifecycleExpectation = {
    lifecycleVersion: life.version,
    lifecycleStatusIn: [op.transitionalStatus, 'reconciliation_required'],
    reservation: { action: 'equals', operationId: op.operationId },
    operationVersion: op.operationVersion,
    operationStatusIn: [...ADVANCE_STATUSES],
  };
  // Duplicate valid step → no-op plan that STILL carries reservation/version proof.
  if (op.completedSteps.includes(step)) {
    return freezePlan({
      effect: 'advance_noop',
      expect: reservationExpect,
      writes: {
        lifecycleStatus: life.status, lifecycleVersion: life.version, currentOperationId: { action: 'preserve' },
        lastCompletedOperationId: { action: 'preserve' }, operationStatus: op.status, operationVersion: op.operationVersion,
        completedSteps: [...op.completedSteps], failedStep: { action: 'preserve' }, failureCode: { action: 'preserve' },
      },
    });
  }
  return freezePlan({
    effect: 'advance',
    expect: reservationExpect,
    writes: {
      lifecycleStatus: life.status, lifecycleVersion: life.version, currentOperationId: { action: 'preserve' },
      lastCompletedOperationId: { action: 'preserve' }, operationStatus: 'running', operationVersion: op.operationVersion + 1,
      completedSteps: [...op.completedSteps, step], failedStep: { action: 'preserve' }, failureCode: { action: 'preserve' },
    },
  });
}

export function planMarkReconciliationRequired(life: LifecycleView, op: OperationView, failedStep: SemanticLifecycleStep, failureCode: string): LifecycleMutationPlan {
  assertOperationShape(op);
  if (op.status === 'completed') throw planError('LIFECYCLE_OP_TERMINAL', 'A completed operation cannot be reconciled.', 409);
  if (!RECONCILE_STATUSES.has(op.status)) throw planError('LIFECYCLE_OP_STATUS_INVALID', `Operation status '${op.status}' cannot enter reconciliation.`, 409);
  const order = stepOrderForAction(op.action);
  if (!order.includes(failedStep)) throw planError('LIFECYCLE_FAILED_STEP_WRONG_ACTION', `failedStep '${failedStep}' does not belong to action '${op.action}'.`);
  // The atomic beginning steps are committed by beginTransition; they can never be
  // an unresolved downstream failure. (final_state_committed IS eligible — it
  // represents a failed final durable transaction, once all prior steps are done.)
  if (BEGIN_STEPS.has(failedStep)) throw planError('LIFECYCLE_FAILED_STEP_ILLEGAL', `failedStep '${failedStep}' is committed by beginTransition and cannot fail downstream.`);
  // The failed step must be the NEXT uncompleted step: not already completed, all
  // prerequisites completed, and no later step completed. This keeps the journal
  // truthful and stops reconciliation from skipping never-done work.
  const failedIdx = order.indexOf(failedStep);
  if (op.completedSteps.includes(failedStep)) throw planError('LIFECYCLE_FAILED_STEP_ALREADY_COMPLETED', `failedStep '${failedStep}' is already completed.`, 409);
  for (let i = 0; i < failedIdx; i += 1) {
    if (!op.completedSteps.includes(order[i])) throw planError('LIFECYCLE_FAILED_STEP_OUT_OF_ORDER', `failedStep '${failedStep}' requires '${order[i]}' first.`, 409);
  }
  for (let i = failedIdx + 1; i < order.length; i += 1) {
    if (op.completedSteps.includes(order[i])) throw planError('LIFECYCLE_FAILED_STEP_SEQUENCE_INVALID', `A later step '${order[i]}' is already completed.`, 409);
  }
  const code = validateFailureCode(failureCode);
  return freezePlan({
    effect: 'reconcile',
    expect: {
      lifecycleVersion: life.version,
      lifecycleStatusIn: [op.transitionalStatus, 'reconciliation_required'],
      reservation: { action: 'equals', operationId: op.operationId },
      operationVersion: op.operationVersion,
      operationStatusIn: [...RECONCILE_STATUSES],
    },
    writes: {
      lifecycleStatus: 'reconciliation_required', lifecycleVersion: life.version + 1,
      currentOperationId: { action: 'preserve' }, // stays reserved for retry
      lastCompletedOperationId: { action: 'preserve' },
      operationStatus: 'reconciliation_required', operationVersion: op.operationVersion + 1,
      completedSteps: [...op.completedSteps], // retained
      failedStep: { action: 'set', value: failedStep }, failureCode: { action: 'set', value: code },
    },
  });
}

export function planCompleteTransition(life: LifecycleView, op: OperationView): LifecycleMutationPlan {
  assertOperationShape(op);
  if (op.status === 'completed') throw planError('LIFECYCLE_OP_TERMINAL', 'Operation already completed.', 409);
  if (!COMPLETE_STATUSES.has(op.status)) throw planError('LIFECYCLE_OP_STATUS_INVALID', `Operation status '${op.status}' cannot complete.`, 409);
  // A not-yet-completed op containing the store-owned final step is contradictory:
  // the final durable transaction is what creates it. Only completeTransition may.
  if (op.completedSteps.includes('final_state_committed')) {
    throw planError('LIFECYCLE_FINAL_STEP_ALREADY_COMMITTED', 'Operation already carries final_state_committed but is not completed.', 409);
  }
  const required = stepOrderForAction(op.action).filter((s) => s !== 'final_state_committed');
  for (const step of required) {
    if (!op.completedSteps.includes(step)) throw planError('LIFECYCLE_COMPLETION_INCOMPLETE', `Cannot complete: missing step '${step}'.`, 409);
  }
  return freezePlan({
    effect: 'complete',
    expect: {
      lifecycleVersion: life.version,
      lifecycleStatusIn: [op.transitionalStatus, 'reconciliation_required'],
      reservation: { action: 'equals', operationId: op.operationId },
      operationVersion: op.operationVersion,
      operationStatusIn: [...COMPLETE_STATUSES],
    },
    writes: {
      lifecycleStatus: op.desiredStatus, lifecycleVersion: life.version + 1,
      currentOperationId: { action: 'remove' }, // reservation cleared via explicit remove, never null
      lastCompletedOperationId: { action: 'set', value: op.operationId },
      operationStatus: 'completed', operationVersion: op.operationVersion + 1,
      completedSteps: [...op.completedSteps, 'final_state_committed'], // appended exactly once
      // A completed op must not retain unresolved reconciliation markers.
      failedStep: { action: 'remove' }, failureCode: { action: 'remove' },
    },
  });
}
