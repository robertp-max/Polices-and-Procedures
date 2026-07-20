/**
 * Phase 2B closure — pure lifecycle semantic core (commit 1A).
 * Planners are pure policy: no reads/writes/AWS/clock. These tests prove legal
 * transitions, exact step ordering, reservation expectations, reconciliation
 * completability, duplicate no-op, terminal-status rejection, explicit field
 * removal, input immutability, and determinism. No adapter parity is claimed.
 */
import { describe, expect, it } from 'vitest';
import {
  planBeginTransition, planAdvanceOperation, planMarkReconciliationRequired, planCompleteTransition,
  SUSPEND_STEP_ORDER, REACTIVATE_STEP_ORDER,
  type LifecycleView, type OperationView, type SemanticLifecycleStep, type BeginTransitionIntent,
} from './semantics.js';
import type { LifecycleOperationStatus } from './types.js';

/** Assert a synchronous throw whose ApiError `.code` matches (messages are human text). */
function throwsCode(fn: () => unknown, re: RegExp): void {
  let code: string | undefined;
  try { fn(); } catch (e) { code = (e as { code?: string }).code; }
  expect(code).toMatch(re);
}

const beginSuspend: BeginTransitionIntent = { action: 'suspend', operationId: 'op-1', expectedFromStatus: 'active', transitionalStatus: 'suspending', desiredFinalStatus: 'suspended', expectedLifecycleVersion: 1 };
const beginReactivate: BeginTransitionIntent = { action: 'reactivate', operationId: 'op-2', expectedFromStatus: 'suspended', transitionalStatus: 'reactivating', desiredFinalStatus: 'active', expectedLifecycleVersion: 3 };

const life = (over: Partial<LifecycleView> = {}): LifecycleView => ({ status: 'suspending', version: 2, currentOperationId: 'op-1', ...over });
const op = (over: Partial<OperationView> = {}): OperationView => ({
  operationId: 'op-1', action: 'suspend', status: 'running', operationVersion: 1,
  transitionalStatus: 'suspending', desiredStatus: 'suspended', completedSteps: ['intent_recorded', 'global_deny_committed'], ...over,
});
const suspendBeforeFinal = SUSPEND_STEP_ORDER.filter((s) => s !== 'final_state_committed') as SemanticLifecycleStep[];
const reactBeforeFinal = REACTIVATE_STEP_ORDER.filter((s) => s !== 'final_state_committed') as SemanticLifecycleStep[];

describe('planBeginTransition', () => {
  it('valid suspension begin plan', () => {
    const p = planBeginTransition(beginSuspend);
    expect(p.effect).toBe('begin');
    expect(p.writes.lifecycleStatus).toBe('suspending');
    expect(p.writes.lifecycleVersion).toBe(2);
    expect(p.writes.currentOperationId).toEqual({ action: 'set', value: 'op-1' });
    expect(p.writes.completedSteps).toEqual(['intent_recorded', 'global_deny_committed']);
    expect(p.expect.reservation).toEqual({ action: 'absent' });
    expect(p.expect.idempotencyClaim).toBe('absent');
  });
  it('valid reactivation begin plan', () => {
    const p = planBeginTransition(beginReactivate);
    expect(p.writes.lifecycleStatus).toBe('reactivating');
    expect(p.expect.lifecycleStatusIn).toEqual(['suspended']);
  });
  it('invalid transition rejected', () => {
    throwsCode(() => planBeginTransition({ ...beginSuspend, expectedFromStatus: 'suspended' }), /TRANSITION_INVALID/);
  });
});

describe('planAdvanceOperation — ordering & status', () => {
  it('enforces step order (prerequisite missing)', () => {
    throwsCode(() => planAdvanceOperation(life(), op(), 'provider_sessions_revoked'), /OUT_OF_ORDER/);
  });
  it('rejects an opposite-action step', () => {
    throwsCode(() => planAdvanceOperation(life(), op(), 'provider_enabled'), /WRONG_ACTION/);
  });
  it.each(['intent_recorded', 'global_deny_committed', 'final_state_committed'] as SemanticLifecycleStep[])('rejects manually advancing boundary step %s', (step) => {
    throwsCode(() => planAdvanceOperation(life(), op(), step), /STEP_ILLEGAL/);
  });
  it('valid next step → advance plan carrying reservation + version expectations', () => {
    const p = planAdvanceOperation(life(), op(), 'canonical_transition_projected');
    expect(p.effect).toBe('advance');
    expect(p.writes.operationVersion).toBe(2);
    expect(p.writes.completedSteps).toContain('canonical_transition_projected');
    expect(p.expect.reservation).toEqual({ action: 'equals', operationId: 'op-1' });
    expect(p.expect.lifecycleStatusIn).toEqual(['suspending', 'reconciliation_required']);
    expect(p.expect.operationVersion).toBe(1);
  });
  it('duplicate valid step → no-op plan, no version bump, still carries reservation proof', () => {
    const p = planAdvanceOperation(life(), op({ completedSteps: ['intent_recorded', 'global_deny_committed', 'canonical_transition_projected'] }), 'canonical_transition_projected');
    expect(p.effect).toBe('advance_noop');
    expect(p.writes.operationVersion).toBe(1); // unchanged
    expect(p.expect.reservation).toEqual({ action: 'equals', operationId: 'op-1' });
    expect(p.expect.operationVersion).toBe(1);
  });
  it('failed_without_mutation (legacy terminal) cannot advance', () => {
    throwsCode(() => planAdvanceOperation(life(), op({ status: 'failed_without_mutation' as LifecycleOperationStatus }), 'canonical_transition_projected'), /OP_STATUS_INVALID/);
  });
  it('a completed operation cannot advance', () => {
    throwsCode(() => planAdvanceOperation(life(), op({ status: 'completed' }), 'canonical_transition_projected'), /OP_TERMINAL/);
  });
});

describe('planMarkReconciliationRequired', () => {
  it('keeps reservation, sets failedStep/failureCode, bumps versions', () => {
    const p = planMarkReconciliationRequired(life(), op(), 'provider_disabled', 'COGNITO_DISABLE_FAILED');
    expect(p.effect).toBe('reconcile');
    expect(p.writes.lifecycleStatus).toBe('reconciliation_required');
    expect(p.writes.currentOperationId).toEqual({ action: 'preserve' }); // stays reserved
    expect(p.writes.failedStep).toEqual({ action: 'set', value: 'provider_disabled' });
    expect(p.writes.failureCode).toEqual({ action: 'set', value: 'COGNITO_DISABLE_FAILED' });
  });
  it('rejects a wrong-action failedStep', () => {
    throwsCode(() => planMarkReconciliationRequired(life(), op(), 'provider_enabled', 'X'), /FAILED_STEP_WRONG_ACTION/);
  });
  it('rejects an empty/control-char failure code', () => {
    throwsCode(() => planMarkReconciliationRequired(life(), op(), 'provider_disabled', '   '), /FAILURE_CODE_INVALID/);
  });
});

describe('planCompleteTransition', () => {
  it('accepts the transitional lifecycle state, appends final once, clears failure markers', () => {
    const p = planCompleteTransition(life(), op({ completedSteps: suspendBeforeFinal }));
    expect(p.effect).toBe('complete');
    expect(p.writes.lifecycleStatus).toBe('suspended');
    expect(p.writes.completedSteps.filter((s) => s === 'final_state_committed')).toHaveLength(1);
    expect(p.writes.currentOperationId).toEqual({ action: 'remove' }); // explicit remove, never null
    expect(p.writes.lastCompletedOperationId).toEqual({ action: 'set', value: 'op-1' });
    // FIX 1: a completed op must not retain unresolved reconciliation markers.
    expect(p.writes.failedStep).toEqual({ action: 'remove' });
    expect(p.writes.failureCode).toEqual({ action: 'remove' });
  });
  it('clears failure markers when completing a reconciliation-required op', () => {
    const p = planCompleteTransition(life({ status: 'reconciliation_required' }), op({ status: 'reconciliation_required', completedSteps: suspendBeforeFinal }));
    expect(p.writes.failedStep).toEqual({ action: 'remove' });
    expect(p.writes.failureCode).toEqual({ action: 'remove' });
  });
  it('accepts a reconciliation-required lifecycle + operation state', () => {
    const p = planCompleteTransition(life({ status: 'reconciliation_required' }), op({ status: 'reconciliation_required', completedSteps: suspendBeforeFinal }));
    expect(p.effect).toBe('complete');
    expect(p.expect.lifecycleStatusIn).toContain('reconciliation_required');
    expect(p.expect.operationStatusIn).toContain('reconciliation_required');
  });
  it('rejects completion when a required step is missing', () => {
    throwsCode(() => planCompleteTransition(life(), op({ completedSteps: ['intent_recorded', 'global_deny_committed', 'provider_disabled'] })), /COMPLETION_INCOMPLETE/);
  });
  it('FIX 2: rejects a not-yet-completed op that already carries final_state_committed', () => {
    throwsCode(() => planCompleteTransition(life(), op({ status: 'running', completedSteps: [...suspendBeforeFinal, 'final_state_committed'] })), /FINAL_STEP_ALREADY_COMMITTED/);
    throwsCode(() => planCompleteTransition(life({ status: 'reconciliation_required' }), op({ status: 'reconciliation_required', completedSteps: [...suspendBeforeFinal, 'final_state_committed'] })), /FINAL_STEP_ALREADY_COMMITTED/);
  });
});

describe('FIX 3 — reconciliation failedStep restrictions', () => {
  it.each(['intent_recorded', 'global_deny_committed'] as SemanticLifecycleStep[])('rejects a store-owned begin step %s as failedStep', (step) => {
    throwsCode(() => planMarkReconciliationRequired(life(), op(), step, 'X'), /FAILED_STEP_ILLEGAL/);
  });
  it('rejects an opposite-action failedStep (suspend + provider_enabled)', () => {
    throwsCode(() => planMarkReconciliationRequired(life(), op(), 'provider_enabled', 'X'), /FAILED_STEP_WRONG_ACTION/);
  });
  it('rejects reactivate + provider_disabled', () => {
    throwsCode(() => planMarkReconciliationRequired(life({ status: 'reactivating' }), op({ action: 'reactivate', transitionalStatus: 'reactivating', desiredStatus: 'active' }), 'provider_disabled', 'X'), /FAILED_STEP_WRONG_ACTION/);
  });
  it('permits final_state_committed as a failed final durable transaction', () => {
    const p = planMarkReconciliationRequired(life(), op(), 'final_state_committed', 'FINAL_COMMIT_FAILED');
    expect(p.writes.failedStep).toEqual({ action: 'set', value: 'final_state_committed' });
  });
});

describe('FIX 4 — contradictory operation shape rejected', () => {
  const badShape = op({ transitionalStatus: 'reactivating', desiredStatus: 'active' }); // action=suspend, mismatched
  it('advance rejects a mismatched op shape', () => { throwsCode(() => planAdvanceOperation(life(), badShape, 'canonical_transition_projected'), /OP_SHAPE_INVALID/); });
  it('reconcile rejects a mismatched op shape', () => { throwsCode(() => planMarkReconciliationRequired(life(), badShape, 'provider_disabled', 'X'), /OP_SHAPE_INVALID/); });
  it('complete rejects a mismatched op shape', () => { throwsCode(() => planCompleteTransition(life(), op({ transitionalStatus: 'reactivating', desiredStatus: 'active', completedSteps: suspendBeforeFinal })), /OP_SHAPE_INVALID/); });
});

describe('FIX 5 — plans are immutable', () => {
  it('freezes the plan, its writes, expectations, and nested arrays', () => {
    const p = planCompleteTransition(life(), op({ completedSteps: suspendBeforeFinal }));
    expect(Object.isFrozen(p)).toBe(true);
    expect(Object.isFrozen(p.writes)).toBe(true);
    expect(Object.isFrozen(p.expect)).toBe(true);
    expect(Object.isFrozen(p.writes.completedSteps)).toBe(true);
    expect(Object.isFrozen(p.expect.lifecycleStatusIn)).toBe(true);
    expect(() => { (p.writes.completedSteps as SemanticLifecycleStep[]).push('final_state_committed'); }).toThrow();
    expect(() => { (p.writes as { operationVersion: number }).operationVersion = 99; }).toThrow();
  });
});

describe('reconciliation round trip finishes (suspend + reactivate)', () => {
  it('suspend: reconciliation-required op can advance remaining steps then complete', () => {
    // reconciled after provider_disabled; advance the rest, then complete
    let steps: SemanticLifecycleStep[] = ['intent_recorded', 'global_deny_committed', 'canonical_transition_projected', 'provider_disabled'];
    const remaining: SemanticLifecycleStep[] = ['provider_sessions_revoked', 'registration_projected', 'canonical_final_projected', 'transition_ready_audited'];
    let opv = 5;
    for (const step of remaining) {
      const p = planAdvanceOperation(life({ status: 'reconciliation_required' }), op({ status: 'reconciliation_required', operationVersion: opv, completedSteps: steps }), step);
      expect(p.effect).toBe('advance');
      steps = p.writes.completedSteps; opv = p.writes.operationVersion;
    }
    const done = planCompleteTransition(life({ status: 'reconciliation_required' }), op({ status: 'reconciliation_required', operationVersion: opv, completedSteps: steps }));
    expect(done.writes.lifecycleStatus).toBe('suspended');
  });
  it('reactivate: reconciliation-required op can complete after remaining steps', () => {
    const done = planCompleteTransition(
      life({ status: 'reconciliation_required' }),
      op({ action: 'reactivate', transitionalStatus: 'reactivating', desiredStatus: 'active', status: 'reconciliation_required', completedSteps: reactBeforeFinal }),
    );
    expect(done.writes.lifecycleStatus).toBe('active');
  });
});

describe('purity', () => {
  it('does not mutate its input objects', () => {
    const steps: SemanticLifecycleStep[] = ['intent_recorded', 'global_deny_committed'];
    const frozenOp = Object.freeze(op({ completedSteps: Object.freeze([...steps]) as SemanticLifecycleStep[] }));
    const frozenLife = Object.freeze(life());
    planAdvanceOperation(frozenLife, frozenOp, 'canonical_transition_projected');
    expect(frozenOp.completedSteps).toEqual(steps); // unchanged
  });
  it('is deterministic for identical inputs', () => {
    const a = planCompleteTransition(life(), op({ completedSteps: suspendBeforeFinal }));
    const b = planCompleteTransition(life(), op({ completedSteps: suspendBeforeFinal }));
    expect(a).toEqual(b);
  });
});
