/**
 * DynamoDB account-lifecycle store (ADR-0002 2B, hardened).
 *
 * Durable, multi-instance-safe records as ADDITIONAL items in the existing
 * registration table. Concurrency via conditional expressions + TransactWrite.
 * The store OWNS completion invariants: journal advancement is gated on the live
 * lifecycle reservation (a transaction with a lifecycle ConditionCheck), the
 * final commit step is appended only at completion, required steps are derived
 * from the action, persisted data is validated on read (fail-closed), and
 * transaction cancellations are classified precisely.
 */
import {
  ERR, computeRequestFingerprint, hashIdempotencyKey, validateIdempotencyKey, validateReason,
  validateTransitionRequest, validateIdentifier, assertAdvanceableStep, requiredStepsForAction,
  parseLifecycleRecord, parseOperationRecord, classifyDynamoError, DYNAMO_LIFECYCLE_CAPS,
  type AccountLifecycleStore, type AccountLifecycleStoreCapabilities, type LifecycleStoreDeps,
  type InitializeLifecycleInput, type BeginLifecycleTransitionInput, type BeginLifecycleTransitionResult,
  type AdvanceLifecycleOperationInput, type MarkReconciliationRequiredInput, type CompleteLifecycleTransitionInput,
} from './store.js';
import { normalizeIdentityEmail } from './identityEmail.js';
import { LIFECYCLE_SCHEMA_VERSION } from './types.js';
import type { AccountLifecycleRecord, LifecycleOperationRecord, LifecycleStep } from './types.js';

export interface LifecycleDynamoClient {
  send(cmd: unknown): Promise<unknown>;
  cmds: {
    Get: new (input: unknown) => unknown;
    Put: new (input: unknown) => unknown;
    Update: new (input: unknown) => unknown;
    TransactWrite: new (input: unknown) => unknown;
  };
}

const pk = (id: string) => `ACCOUNT#${id}`;
const SK_LIFECYCLE = 'LIFECYCLE';
const skOp = (opId: string) => `OPERATION#${opId}`;
const skIdem = (hash: string) => `IDEMPOTENCY#${hash}`;

export class DynamoAccountLifecycleStore implements AccountLifecycleStore {
  constructor(private table: string, private client: LifecycleDynamoClient, private deps: LifecycleStoreDeps) {}

  capabilities(): AccountLifecycleStoreCapabilities { return DYNAMO_LIFECYCLE_CAPS; }

  private async getItem(sk: string, id: string): Promise<Record<string, unknown> | null> {
    const res = (await this.client.send(new this.client.cmds.Get({
      TableName: this.table, Key: { pk: pk(id), sk }, ConsistentRead: true,
    }))) as { Item?: Record<string, unknown> };
    return res.Item ?? null;
  }

  async getLifecycle(id: string): Promise<AccountLifecycleRecord | null> {
    const item = await this.getItem(SK_LIFECYCLE, id);
    return item ? parseLifecycleRecord(item.record, id) : null; // malformed → 503, never null/active
  }
  async getOperation(id: string, opId: string): Promise<LifecycleOperationRecord | null> {
    const item = await this.getItem(skOp(opId), id);
    return item ? parseOperationRecord(item.record, id, opId) : null;
  }

  async initializeLifecycle(input: InitializeLifecycleInput): Promise<AccountLifecycleRecord> {
    validateIdentifier('canonicalUserId', input.canonicalUserId);
    validateIdentifier('providerUsername', input.providerUsername);
    validateIdentifier('actorUserId', input.actorUserId);
    const now = this.deps.nowIso();
    const record: AccountLifecycleRecord = {
      schemaVersion: LIFECYCLE_SCHEMA_VERSION,
      canonicalUserId: input.canonicalUserId, provider: 'cognito',
      providerUsername: input.providerUsername, normalizedEmail: normalizeIdentityEmail(input.normalizedEmail),
      status: input.initialStatus, version: 1, initializationSource: input.initializationSource,
      createdAt: now, createdBy: input.actorUserId, updatedAt: now, updatedBy: input.actorUserId,
    };
    try {
      await this.client.send(new this.client.cmds.Put({
        TableName: this.table, Item: { pk: pk(input.canonicalUserId), sk: SK_LIFECYCLE, record },
        ConditionExpression: 'attribute_not_exists(sk)',
      }));
    } catch (e) {
      if ((e as { name?: string })?.name === 'ConditionalCheckFailedException') throw ERR.alreadyExists();
      throw classifyDynamoError(e);
    }
    return record;
  }

  async beginTransition(input: BeginLifecycleTransitionInput): Promise<BeginLifecycleTransitionResult> {
    validateTransitionRequest(input);
    validateIdentifier('canonicalUserId', input.canonicalUserId);
    validateIdentifier('operationId', input.operationId);
    validateIdentifier('actorUserId', input.actorUserId);
    validateIdentifier('correlationId', input.correlationId);
    validateIdempotencyKey(input.idempotencyKey);
    const reason = validateReason(input.reason);
    const idemHash = hashIdempotencyKey(input.idempotencyKey);
    const fingerprint = computeRequestFingerprint({
      action: input.action, targetUserId: input.canonicalUserId, actorUserId: input.actorUserId,
      reason, expectedFromStatus: input.expectedFromStatus, transitionalStatus: input.transitionalStatus,
    });

    const replay = await this.tryReplay(input.canonicalUserId, idemHash, fingerprint);
    if (replay) return replay;

    const now = this.deps.nowIso();
    const life = await this.getLifecycle(input.canonicalUserId);
    if (!life) throw ERR.lifecycleNotFound();
    const op: LifecycleOperationRecord = {
      schemaVersion: LIFECYCLE_SCHEMA_VERSION,
      operationId: input.operationId, idempotencyKeyHash: idemHash, requestFingerprint: fingerprint,
      action: input.action, targetUserId: input.canonicalUserId, actorUserId: input.actorUserId,
      actorEmailSnapshot: input.actorEmailSnapshot, reason, status: 'intent_recorded',
      operationVersion: 1, expectedLifecycleVersion: input.expectedLifecycleVersion,
      beforeStatus: input.expectedFromStatus, transitionalStatus: input.transitionalStatus, desiredStatus: input.desiredFinalStatus,
      completedSteps: ['intent_recorded', 'global_deny_committed'],
      postCommitAuditStatus: 'not_required_yet',
      correlationId: input.correlationId, createdAt: now, updatedAt: now,
    };
    try {
      await this.client.send(new this.client.cmds.TransactWrite({
        TransactItems: [
          { Put: { TableName: this.table, Item: { pk: pk(input.canonicalUserId), sk: skIdem(idemHash), operationId: op.operationId, requestFingerprint: fingerprint }, ConditionExpression: 'attribute_not_exists(sk)' } },
          { Put: { TableName: this.table, Item: { pk: pk(input.canonicalUserId), sk: skOp(op.operationId), record: op }, ConditionExpression: 'attribute_not_exists(sk)' } },
          { Update: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: SK_LIFECYCLE },
            ConditionExpression: 'record.version = :ev AND attribute_not_exists(record.currentOperationId) AND record.#s = :from',
            UpdateExpression: 'SET record.#s = :mid, record.currentOperationId = :opid, record.version = :nv, record.updatedAt = :now, record.updatedBy = :actor',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':ev': input.expectedLifecycleVersion, ':from': input.expectedFromStatus, ':mid': input.transitionalStatus, ':opid': op.operationId, ':nv': input.expectedLifecycleVersion + 1, ':now': now, ':actor': input.actorUserId },
          } },
        ],
      }));
    } catch (e) {
      const late = await this.tryReplay(input.canonicalUserId, idemHash, fingerprint);
      if (late) return late;
      throw classifyDynamoError(e, ['idempotency', 'operation', 'lifecycle']);
    }
    return { lifecycle: { ...life, status: input.transitionalStatus, currentOperationId: op.operationId, version: input.expectedLifecycleVersion + 1, updatedAt: now, updatedBy: input.actorUserId }, operation: op, idempotentReplay: false };
  }

  private async tryReplay(id: string, idemHash: string, fingerprint: string): Promise<BeginLifecycleTransitionResult | null> {
    const claim = await this.getItem(skIdem(idemHash), id);
    if (!claim) return null;
    if (claim.requestFingerprint !== fingerprint) throw ERR.idempotencyConflict();
    const op = await this.getOperation(id, String(claim.operationId));
    const life = await this.getLifecycle(id);
    if (!op || !life) throw ERR.operationNotFound();
    return { lifecycle: life, operation: op, idempotentReplay: true };
  }

  async advanceOperation(input: AdvanceLifecycleOperationInput): Promise<LifecycleOperationRecord> {
    const op = await this.getOperation(input.canonicalUserId, input.operationId);
    if (!op) throw ERR.operationNotFound();
    if (op.operationVersion !== input.expectedOperationVersion) throw ERR.operationVersionConflict();
    if (op.status === 'completed') throw ERR.operationVersionConflict();
    assertAdvanceableStep(op.action, input.step);
    if (op.completedSteps.includes(input.step)) return op; // idempotent no-op
    const steps = [...op.completedSteps, input.step];
    const now = this.deps.nowIso();
    try {
      await this.client.send(new this.client.cmds.TransactWrite({
        TransactItems: [
          { Update: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: skOp(input.operationId) },
            ConditionExpression: 'record.operationVersion = :ev AND record.#s <> :done',
            UpdateExpression: 'SET record.#s = :running, record.operationVersion = :nv, record.completedSteps = :steps, record.updatedAt = :now',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':ev': input.expectedOperationVersion, ':done': 'completed', ':running': 'running', ':nv': op.operationVersion + 1, ':steps': steps, ':now': now },
          } },
          { ConditionCheck: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: SK_LIFECYCLE },
            ConditionExpression: 'record.version = :elv AND record.currentOperationId = :opid AND (record.#s = :mid OR record.#s = :recon)',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':elv': input.expectedLifecycleVersion, ':opid': input.operationId, ':mid': op.transitionalStatus, ':recon': 'reconciliation_required' },
          } },
        ],
      }));
    } catch (e) {
      throw classifyDynamoError(e, ['operation', 'lifecycle']);
    }
    return { ...op, status: 'running', operationVersion: op.operationVersion + 1, completedSteps: steps, updatedAt: now };
  }

  async markReconciliationRequired(input: MarkReconciliationRequiredInput): Promise<{ lifecycle: AccountLifecycleRecord; operation: LifecycleOperationRecord }> {
    const op = await this.getOperation(input.canonicalUserId, input.operationId);
    const life = await this.getLifecycle(input.canonicalUserId);
    if (!op) throw ERR.operationNotFound();
    if (!life) throw ERR.lifecycleNotFound();
    const now = this.deps.nowIso();
    try {
      await this.client.send(new this.client.cmds.TransactWrite({
        TransactItems: [
          { Update: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: skOp(input.operationId) },
            ConditionExpression: 'record.operationVersion = :ev',
            UpdateExpression: 'SET record.#s = :st, record.failedStep = :fs, record.failureCode = :fc, record.operationVersion = :nv, record.updatedAt = :now',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':ev': input.expectedOperationVersion, ':st': 'reconciliation_required', ':fs': input.failedStep, ':fc': input.failureCode, ':nv': op.operationVersion + 1, ':now': now },
          } },
          { Update: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: SK_LIFECYCLE },
            ConditionExpression: 'record.version = :elv AND record.currentOperationId = :opid',
            UpdateExpression: 'SET record.#s = :st, record.version = :nlv, record.updatedAt = :now',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':elv': input.expectedLifecycleVersion, ':opid': input.operationId, ':st': 'reconciliation_required', ':nlv': input.expectedLifecycleVersion + 1, ':now': now },
          } },
        ],
      }));
    } catch (e) {
      throw classifyDynamoError(e, ['operation', 'lifecycle']);
    }
    return {
      lifecycle: { ...life, status: 'reconciliation_required', version: input.expectedLifecycleVersion + 1, updatedAt: now },
      operation: { ...op, status: 'reconciliation_required', failedStep: input.failedStep, failureCode: input.failureCode, operationVersion: op.operationVersion + 1, updatedAt: now },
    };
  }

  async completeTransition(input: CompleteLifecycleTransitionInput): Promise<{ lifecycle: AccountLifecycleRecord; operation: LifecycleOperationRecord }> {
    const op = await this.getOperation(input.canonicalUserId, input.operationId);
    const life = await this.getLifecycle(input.canonicalUserId);
    if (!op) throw ERR.operationNotFound();
    if (!life) throw ERR.lifecycleNotFound();
    if (op.status === 'completed') throw ERR.operationVersionConflict();
    if (input.finalStatus !== op.desiredStatus) throw ERR.invalidTransition('finalStatus does not match desiredStatus.');
    const required = requiredStepsForAction(op.action).filter((s: LifecycleStep) => s !== 'final_state_committed');
    for (const step of required) {
      if (!op.completedSteps.includes(step)) throw ERR.invalidTransition(`required step not completed: ${step}`);
    }
    const now = this.deps.nowIso();
    const finalSteps: LifecycleStep[] = op.completedSteps.includes('final_state_committed') ? op.completedSteps : [...op.completedSteps, 'final_state_committed'];
    try {
      await this.client.send(new this.client.cmds.TransactWrite({
        TransactItems: [
          { Update: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: skOp(input.operationId) },
            ConditionExpression: 'record.operationVersion = :ev AND record.#s <> :done',
            UpdateExpression: 'SET record.#s = :done, record.completedSteps = :steps, record.operationVersion = :nv, record.updatedAt = :now',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':ev': input.expectedOperationVersion, ':done': 'completed', ':steps': finalSteps, ':nv': op.operationVersion + 1, ':now': now },
          } },
          { Update: {
            TableName: this.table, Key: { pk: pk(input.canonicalUserId), sk: SK_LIFECYCLE },
            ConditionExpression: 'record.version = :elv AND record.currentOperationId = :opid AND record.#s = :mid',
            UpdateExpression: 'SET record.#s = :fin, record.lastCompletedOperationId = :opid, record.version = :nlv, record.updatedAt = :now REMOVE record.currentOperationId',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':elv': input.expectedLifecycleVersion, ':opid': input.operationId, ':mid': op.transitionalStatus, ':fin': input.finalStatus, ':nlv': input.expectedLifecycleVersion + 1, ':now': now },
          } },
        ],
      }));
    } catch (e) {
      throw classifyDynamoError(e, ['operation', 'lifecycle']);
    }
    const { currentOperationId, ...restLife } = life;
    void currentOperationId;
    return {
      lifecycle: { ...restLife, status: input.finalStatus, lastCompletedOperationId: input.operationId, version: input.expectedLifecycleVersion + 1, updatedAt: now },
      operation: { ...op, status: 'completed', completedSteps: finalSteps, operationVersion: op.operationVersion + 1, updatedAt: now },
    };
  }
}
