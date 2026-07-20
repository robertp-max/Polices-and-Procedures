/**
 * Phase 2B (hardened) — DynamoDB command/condition CONTRACT tests.
 *
 * Proves conditional + transactional commands (not read-then-unconditional-write
 * / last-write-wins / whole-registry Put), reservation-gated journal advancement,
 * store-owned completion, and fail-closed record validation — via a recording
 * client. No live AWS, no JSONL, no .cache.
 */
import { describe, expect, it } from 'vitest';
import { DynamoAccountLifecycleStore, type LifecycleDynamoClient } from './dynamoStore.js';

interface Sent { __kind: string; input: Record<string, unknown> }
function recordingClient(responder: (kind: string, input: unknown) => unknown): { client: LifecycleDynamoClient; sent: Sent[] } {
  const sent: Sent[] = [];
  const mk = (kind: string) => class { __kind = kind; input: unknown; constructor(i: unknown) { this.input = i; } };
  const client: LifecycleDynamoClient = {
    async send(cmd: unknown) {
      const c = cmd as Sent;
      sent.push({ __kind: c.__kind, input: c.input as Record<string, unknown> });
      const r = responder(c.__kind, c.input);
      if (r instanceof Error) throw r;
      return r;
    },
    cmds: {
      Get: mk('Get') as unknown as new (i: unknown) => unknown,
      Put: mk('Put') as unknown as new (i: unknown) => unknown,
      Update: mk('Update') as unknown as new (i: unknown) => unknown,
      TransactWrite: mk('TransactWrite') as unknown as new (i: unknown) => unknown,
    },
  };
  return { client, sent };
}

const deps = { nowIso: () => '2027-01-01T00:00:00.000Z' };
const TABLE = 'demo_auth_registrations';
const UID = 'usr-1';
const lifeRec = (over = {}) => ({ canonicalUserId: UID, provider: 'cognito', providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', status: 'active', version: 1, initializationSource: 'verified_legacy_active', createdAt: 't', createdBy: 'admin', updatedAt: 't', updatedBy: 'admin', ...over });
const opRec = (over = {}) => ({ operationId: 'op-1', idempotencyKeyHash: 'h', requestFingerprint: 'fp', action: 'suspend', targetUserId: UID, actorUserId: 'admin', actorEmailSnapshot: 'a@b.com', reason: 'r', status: 'running', operationVersion: 1, expectedLifecycleVersion: 1, beforeStatus: 'active', transitionalStatus: 'suspending', desiredStatus: 'suspended', completedSteps: ['intent_recorded', 'global_deny_committed'], correlationId: 'c', createdAt: 't', updatedAt: 't', ...over });
const suspendInput = () => ({ canonicalUserId: UID, action: 'suspend' as const, expectedFromStatus: 'active' as const, transitionalStatus: 'suspending' as const, desiredFinalStatus: 'suspended' as const, expectedLifecycleVersion: 1, idempotencyKey: 'idem-1', operationId: 'op-1', actorUserId: 'admin-1', actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation', correlationId: 'corr-1' });
// LIFECYCLE / OPERATION items are stored under Item.record (the parser reads item.record).
const bySk = (input: unknown, want: (sk: string) => boolean, record: unknown) => (want((input as { Key?: { sk?: string } }).Key?.sk ?? '') ? { Item: { record } } : {});

describe('DynamoAccountLifecycleStore — capabilities + validation', () => {
  it('advertises every required durable-mutation capability incl. consistent reads', () => {
    const { client } = recordingClient(() => ({}));
    expect(new DynamoAccountLifecycleStore(TABLE, client, deps).capabilities()).toMatchObject({ provider: 'dynamodb_registration', readAfterWriteConsistent: true, productionEligible: true });
  });
  it('getLifecycle fails closed (503) on a malformed persisted record', async () => {
    const { client } = recordingClient(() => ({ Item: { record: lifeRec({ status: 'bogus' }) } }));
    await expect(new DynamoAccountLifecycleStore(TABLE, client, deps).getLifecycle(UID)).rejects.toMatchObject({ status: 503, code: 'ACCOUNT_LIFECYCLE_RECORD_INVALID' });
  });
});

describe('DynamoAccountLifecycleStore — command contracts', () => {
  it('initializeLifecycle uses a conditional Put keyed by ACCOUNT#<id>', async () => {
    const { client, sent } = recordingClient(() => ({}));
    await new DynamoAccountLifecycleStore(TABLE, client, deps).initializeLifecycle({ canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' });
    const put = sent.find((s) => s.__kind === 'Put')!;
    expect(put.input.ConditionExpression).toBe('attribute_not_exists(sk)');
    expect((put.input.Item as { pk: string; sk: string }).sk).toBe('LIFECYCLE');
  });

  it('beginTransition emits a TransactWrite reserving the lifecycle (version + no-current-op + from-status)', async () => {
    const { client, sent } = recordingClient((kind, input) => (kind === 'Get' ? bySk(input, (sk) => sk === 'LIFECYCLE', lifeRec()) : {}));
    const r = await new DynamoAccountLifecycleStore(TABLE, client, deps).beginTransition(suspendInput());
    expect(r.lifecycle.status).toBe('suspending');
    const items = (sent.find((s) => s.__kind === 'TransactWrite')!.input.TransactItems) as Array<Record<string, { ConditionExpression?: string; UpdateExpression?: string }>>;
    expect(items).toHaveLength(3);
    expect(items.filter((i) => i.Put).every((i) => i.Put!.ConditionExpression === 'attribute_not_exists(sk)')).toBe(true);
    const upd = items.find((i) => i.Update)!.Update!;
    expect(upd.ConditionExpression).toContain('record.version = :ev');
    expect(upd.ConditionExpression).toContain('attribute_not_exists(record.currentOperationId)');
    expect(upd.ConditionExpression).toContain('record.#s = :from');
  });

  it('advanceOperation uses a TransactWrite: op-version Update + lifecycle reservation ConditionCheck', async () => {
    const { client, sent } = recordingClient((kind, input) => (kind === 'Get' ? bySk(input, (sk) => sk.startsWith('OPERATION#'), opRec()) : {}));
    await new DynamoAccountLifecycleStore(TABLE, client, deps).advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, step: 'provider_disabled' });
    const items = (sent.find((s) => s.__kind === 'TransactWrite')!.input.TransactItems) as Array<Record<string, { ConditionExpression?: string }>>;
    const opUpd = items.find((i) => i.Update)!.Update!;
    expect(opUpd.ConditionExpression).toContain('record.operationVersion = :ev');
    expect(opUpd.ConditionExpression).toContain('record.#s <> :done');
    const check = items.find((i) => i.ConditionCheck)!.ConditionCheck!;
    expect(check.ConditionExpression).toContain('record.currentOperationId = :opid');
    expect(check.ConditionExpression).toContain('record.version = :elv');
  });

  it('advanceOperation rejects a boundary/wrong-action step before any write', async () => {
    const { client, sent } = recordingClient((kind, input) => (kind === 'Get' ? bySk(input, (sk) => sk.startsWith('OPERATION#'), opRec()) : {}));
    const store = new DynamoAccountLifecycleStore(TABLE, client, deps);
    await expect(store.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, expectedLifecycleVersion: 2, step: 'final_state_committed' })).rejects.toMatchObject({ status: 400 });
    expect(sent.some((s) => s.__kind === 'TransactWrite')).toBe(false);
  });

  it('completeTransition refuses before required steps, then transactionally appends final_state_committed + clears reservation', async () => {
    const allButFinal = ['intent_recorded', 'global_deny_committed', 'canonical_transition_projected', 'provider_disabled', 'provider_sessions_revoked', 'registration_projected', 'canonical_final_projected', 'completion_audited'];
    // missing steps → 400 before any write
    const missing = recordingClient((kind, input) => { if (kind === 'Get') { const sk = (input as { Key?: { sk?: string } }).Key?.sk ?? ''; if (sk.startsWith('OPERATION#')) return { Item: { record: opRec({ operationVersion: 2 }) } }; if (sk === 'LIFECYCLE') return { Item: { record: lifeRec({ status: 'suspending', currentOperationId: 'op-1', version: 2 }) } }; } return {}; });
    await expect(new DynamoAccountLifecycleStore(TABLE, missing.client, deps).completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'suspended' })).rejects.toMatchObject({ status: 400 });
    expect(missing.sent.some((s) => s.__kind === 'TransactWrite')).toBe(false);
    // all steps → transactional completion
    const ready = recordingClient((kind, input) => { if (kind === 'Get') { const sk = (input as { Key?: { sk?: string } }).Key?.sk ?? ''; if (sk.startsWith('OPERATION#')) return { Item: { record: opRec({ operationVersion: 7, completedSteps: allButFinal }) } }; if (sk === 'LIFECYCLE') return { Item: { record: lifeRec({ status: 'suspending', currentOperationId: 'op-1', version: 2 }) } }; } return {}; });
    await new DynamoAccountLifecycleStore(TABLE, ready.client, deps).completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 7, expectedLifecycleVersion: 2, finalStatus: 'suspended' });
    const items = (ready.sent.find((s) => s.__kind === 'TransactWrite')!.input.TransactItems) as Array<Record<string, { UpdateExpression?: string; ExpressionAttributeValues?: Record<string, unknown> }>>;
    const opUpd = items.map((i) => i.Update!).find((u) => u?.UpdateExpression?.includes('completedSteps'))!;
    expect((opUpd.ExpressionAttributeValues![':steps'] as string[])).toContain('final_state_committed');
    const lifeUpd = items.map((i) => i.Update!).find((u) => u?.UpdateExpression?.includes('lastCompletedOperationId'))!;
    expect(lifeUpd.UpdateExpression).toContain('REMOVE record.currentOperationId');
  });

  it('maps a conditional-check failure on initialize to 409 already-exists', async () => {
    const client = recordingClient((kind) => (kind === 'Put' ? Object.assign(new Error('cond'), { name: 'ConditionalCheckFailedException' }) : {}));
    await expect(new DynamoAccountLifecycleStore(TABLE, client.client, deps).initializeLifecycle({ canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' }))
      .rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_ALREADY_EXISTS' });
  });

  it('classifies a throttled begin TransactWrite as 503 (not a version-conflict lie)', async () => {
    const client = recordingClient((kind, input) => {
      if (kind === 'Get') return bySk(input, (sk) => sk === 'LIFECYCLE', lifeRec());
      if (kind === 'TransactWrite') return Object.assign(new Error('throttled'), { name: 'ProvisionedThroughputExceededException' });
      return {};
    });
    await expect(new DynamoAccountLifecycleStore(TABLE, client.client, deps).beginTransition(suspendInput())).rejects.toMatchObject({ status: 503 });
  });
});
