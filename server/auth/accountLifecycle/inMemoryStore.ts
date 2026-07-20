/**
 * In-memory account-lifecycle store — deterministic tests ONLY (ADR-0002 2B).
 *
 * Implements the full CAS / idempotency / one-active-operation semantics so the
 * decision logic can be proven without live AWS. It reports
 * `productionEligible: false`; the route-level `assertLifecycleMutationAvailable`
 * therefore rejects it for real mutation. It does NOT by itself prove DynamoDB
 * atomicity — the Dynamo command-contract tests cover that.
 */
import type {
  AccountLifecycleRecord, LifecycleOperationRecord, LifecycleStep,
} from './types.js';
import {
  ERR, IN_MEMORY_LIFECYCLE_CAPS, computeRequestFingerprint, hashIdempotencyKey,
  validateIdempotencyKey, validateReason, validateTransitionRequest,
  type AccountLifecycleStore, type AccountLifecycleStoreCapabilities, type LifecycleStoreDeps,
  type InitializeLifecycleInput, type BeginLifecycleTransitionInput, type BeginLifecycleTransitionResult,
  type AdvanceLifecycleOperationInput, type MarkReconciliationRequiredInput, type CompleteLifecycleTransitionInput,
} from './store.js';

interface Cell {
  lifecycle: AccountLifecycleRecord;
  operations: Map<string, LifecycleOperationRecord>;
  idempotency: Map<string, string>; // idempotency-hash → operationId
}

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

export class InMemoryAccountLifecycleStore implements AccountLifecycleStore {
  private cells = new Map<string, Cell>();
  constructor(private deps: LifecycleStoreDeps) {}

  capabilities(): AccountLifecycleStoreCapabilities { return IN_MEMORY_LIFECYCLE_CAPS; }

  async getLifecycle(id: string): Promise<AccountLifecycleRecord | null> {
    const c = this.cells.get(id);
    return c ? clone(c.lifecycle) : null;
  }
  async getOperation(id: string, opId: string): Promise<LifecycleOperationRecord | null> {
    const op = this.cells.get(id)?.operations.get(opId);
    return op ? clone(op) : null;
  }

  async initializeLifecycle(input: InitializeLifecycleInput): Promise<AccountLifecycleRecord> {
    if (this.cells.get(input.canonicalUserId)) throw ERR.alreadyExists(); // conditional: no overwrite
    const now = this.deps.nowIso();
    const rec: AccountLifecycleRecord = {
      canonicalUserId: input.canonicalUserId, provider: 'cognito',
      providerUsername: input.providerUsername, normalizedEmail: input.normalizedEmail,
      status: input.initialStatus, version: 1,
      initializationSource: input.initializationSource,
      createdAt: now, createdBy: input.actorUserId, updatedAt: now, updatedBy: input.actorUserId,
    };
    this.cells.set(input.canonicalUserId, { lifecycle: rec, operations: new Map(), idempotency: new Map() });
    return clone(rec);
  }

  async beginTransition(input: BeginLifecycleTransitionInput): Promise<BeginLifecycleTransitionResult> {
    validateTransitionRequest(input);
    validateIdempotencyKey(input.idempotencyKey);
    const reason = validateReason(input.reason);
    const cell = this.cells.get(input.canonicalUserId);
    if (!cell) throw ERR.lifecycleNotFound();

    const idemHash = hashIdempotencyKey(input.idempotencyKey);
    const fingerprint = computeRequestFingerprint({
      action: input.action, targetUserId: input.canonicalUserId, actorUserId: input.actorUserId,
      reason, expectedFromStatus: input.expectedFromStatus, transitionalStatus: input.transitionalStatus,
    });

    // Idempotent replay / conflict.
    const existingOpId = cell.idempotency.get(idemHash);
    if (existingOpId) {
      const existingOp = cell.operations.get(existingOpId)!;
      if (existingOp.requestFingerprint !== fingerprint) throw ERR.idempotencyConflict();
      return { lifecycle: clone(cell.lifecycle), operation: clone(existingOp), idempotentReplay: true };
    }

    // Compare-and-set preconditions (atomic in this single-threaded model).
    if (cell.lifecycle.version !== input.expectedLifecycleVersion) throw ERR.versionConflict();
    if (cell.lifecycle.currentOperationId) throw ERR.operationInProgress();
    if (cell.lifecycle.status !== input.expectedFromStatus) throw ERR.versionConflict();

    const now = this.deps.nowIso();
    const op: LifecycleOperationRecord = {
      operationId: input.operationId, idempotencyKey: '(stored as hash)', requestFingerprint: fingerprint,
      action: input.action, targetUserId: input.canonicalUserId, actorUserId: input.actorUserId,
      actorEmailSnapshot: input.actorEmailSnapshot, reason, status: 'intent_recorded',
      operationVersion: 1, expectedLifecycleVersion: input.expectedLifecycleVersion,
      beforeStatus: input.expectedFromStatus, desiredStatus: input.desiredFinalStatus,
      completedSteps: ['intent_recorded', 'global_deny_committed'],
      correlationId: input.correlationId, createdAt: now, updatedAt: now,
    };
    cell.operations.set(op.operationId, op);
    cell.idempotency.set(idemHash, op.operationId);
    cell.lifecycle = {
      ...cell.lifecycle, status: input.transitionalStatus, currentOperationId: op.operationId,
      version: cell.lifecycle.version + 1, updatedAt: now, updatedBy: input.actorUserId,
    };
    return { lifecycle: clone(cell.lifecycle), operation: clone(op), idempotentReplay: false };
  }

  private requireOp(id: string, opId: string, expectedOperationVersion: number): { cell: Cell; op: LifecycleOperationRecord } {
    const cell = this.cells.get(id);
    if (!cell) throw ERR.lifecycleNotFound();
    const op = cell.operations.get(opId);
    if (!op) throw ERR.operationNotFound();
    if (op.operationVersion !== expectedOperationVersion) throw ERR.operationVersionConflict();
    return { cell, op };
  }

  async advanceOperation(input: AdvanceLifecycleOperationInput): Promise<LifecycleOperationRecord> {
    const { op } = this.requireOp(input.canonicalUserId, input.operationId, input.expectedOperationVersion);
    if (op.status === 'completed') throw ERR.operationVersionConflict(); // completed journal is never reopened
    appendStep(op, input.step);
    op.operationVersion += 1;
    op.status = input.nextStatus ?? 'running';
    op.updatedAt = this.deps.nowIso();
    return clone(op);
  }

  async markReconciliationRequired(input: MarkReconciliationRequiredInput) {
    const { cell, op } = this.requireOp(input.canonicalUserId, input.operationId, input.expectedOperationVersion);
    if (cell.lifecycle.version !== input.expectedLifecycleVersion || cell.lifecycle.currentOperationId !== op.operationId) throw ERR.versionConflict();
    const now = this.deps.nowIso();
    op.status = 'reconciliation_required'; op.failedStep = input.failedStep; op.failureCode = input.failureCode;
    op.operationVersion += 1; op.updatedAt = now; // completedSteps retained
    // Account stays reserved + denied for idempotent retry.
    cell.lifecycle = { ...cell.lifecycle, status: 'reconciliation_required', version: cell.lifecycle.version + 1, updatedAt: now };
    return { lifecycle: clone(cell.lifecycle), operation: clone(op) };
  }

  async completeTransition(input: CompleteLifecycleTransitionInput) {
    const { cell, op } = this.requireOp(input.canonicalUserId, input.operationId, input.expectedOperationVersion);
    if (cell.lifecycle.version !== input.expectedLifecycleVersion || cell.lifecycle.currentOperationId !== op.operationId) throw ERR.versionConflict();
    if (input.finalStatus !== op.desiredStatus) throw ERR.invalidTransition('finalStatus does not match the operation desiredStatus.');
    for (const step of input.requiredSteps) {
      if (!op.completedSteps.includes(step)) throw ERR.invalidTransition(`required step not completed: ${step}`);
    }
    const now = this.deps.nowIso();
    op.status = 'completed'; op.operationVersion += 1; op.updatedAt = now;
    cell.lifecycle = {
      ...cell.lifecycle, status: input.finalStatus, currentOperationId: undefined,
      lastCompletedOperationId: op.operationId, version: cell.lifecycle.version + 1, updatedAt: now,
    };
    return { lifecycle: clone(cell.lifecycle), operation: clone(op) };
  }
}

/** Append a typed step, append-only + de-duplicated. */
function appendStep(op: LifecycleOperationRecord, step: LifecycleStep): void {
  if (!op.completedSteps.includes(step)) op.completedSteps.push(step);
}
