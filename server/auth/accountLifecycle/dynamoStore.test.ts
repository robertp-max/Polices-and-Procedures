/**
 * Phase 2B — DynamoDB command/condition CONTRACT tests.
 *
 * Proves the adapter emits conditional + transactional commands (not
 * read-then-unconditional-write / last-write-wins / whole-registry Put), using a
 * recording client. No live AWS, no JSONL, no .cache. The in-memory suite proves
 * behavioral semantics; this proves the DynamoDB command shapes.
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
const lifeItem = (over = {}) => ({ record: { canonicalUserId: UID, provider: 'cognito', providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', status: 'active', version: 1, initializationSource: 'verified_legacy_active', createdAt: 't', createdBy: 'admin', updatedAt: 't', updatedBy: 'admin', ...over } });
const suspendInput = () => ({
  canonicalUserId: UID, action: 'suspend' as const, expectedFromStatus: 'active' as const, transitionalStatus: 'suspending' as const,
  desiredFinalStatus: 'suspended' as const, expectedLifecycleVersion: 1, idempotencyKey: 'idem-1', operationId: 'op-1',
  actorUserId: 'admin-1', actorEmailSnapshot: 'admin@careindeed.com', reason: 'policy violation', correlationId: 'corr-1',
});

describe('DynamoAccountLifecycleStore — capabilities', () => {
  it('advertises every required durable-mutation capability', () => {
    const { client } = recordingClient(() => ({}));
    const caps = new DynamoAccountLifecycleStore(TABLE, client, deps).capabilities();
    expect(caps).toMatchObject({
      provider: 'dynamodb_registration', multiInstanceShared: true, compareAndSet: true,
      transactionalWrite: true, durableMutationIntent: true, idempotentMutations: true,
      oneActiveOperationPerTarget: true, productionEligible: true,
    });
  });
});

describe('DynamoAccountLifecycleStore — command contracts', () => {
  it('initializeLifecycle uses a conditional Put (no overwrite) keyed by ACCOUNT#<id>', async () => {
    const { client, sent } = recordingClient(() => ({}));
    const store = new DynamoAccountLifecycleStore(TABLE, client, deps);
    await store.initializeLifecycle({ canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' });
    const put = sent.find((s) => s.__kind === 'Put')!;
    expect(put.input.ConditionExpression).toBe('attribute_not_exists(sk)');
    expect((put.input.Item as { pk: string; sk: string }).pk).toBe(`ACCOUNT#${UID}`);
    expect((put.input.Item as { sk: string }).sk).toBe('LIFECYCLE');
  });

  it('beginTransition emits a TransactWrite reserving the lifecycle with version + no-current-operation + from-status conditions', async () => {
    const responder = (kind: string, input: unknown) => {
      if (kind === 'Get') {
        const sk = (input as { Key?: { sk?: string } }).Key?.sk;
        if (sk === 'LIFECYCLE') return { Item: lifeItem() };
        return {}; // idempotency Get → no existing claim
      }
      return {};
    };
    const { client, sent } = recordingClient(responder);
    const store = new DynamoAccountLifecycleStore(TABLE, client, deps);
    const r = await store.beginTransition(suspendInput());
    expect(r.lifecycle.status).toBe('suspending');
    const tx = sent.find((s) => s.__kind === 'TransactWrite')!;
    const items = tx.input.TransactItems as Array<Record<string, { ConditionExpression?: string; UpdateExpression?: string }>>;
    expect(items).toHaveLength(3);
    // idempotency claim + operation intent are conditional creates
    const puts = items.filter((i) => i.Put).map((i) => i.Put!);
    expect(puts.every((p) => p.ConditionExpression === 'attribute_not_exists(sk)')).toBe(true);
    // lifecycle reservation is a conditional update
    const upd = items.find((i) => i.Update)!.Update!;
    expect(upd.ConditionExpression).toContain('record.version = :ev');
    expect(upd.ConditionExpression).toContain('attribute_not_exists(record.currentOperationId)');
    expect(upd.ConditionExpression).toContain('record.#s = :from');
    expect(upd.UpdateExpression).toContain('record.currentOperationId = :opid');
  });

  it('beginTransition replays on a matching idempotency claim (no TransactWrite)', async () => {
    // Precompute the fingerprint the store will store by running once against a fresh store.
    const first = recordingClient((kind, input) => {
      if (kind === 'Get') { const sk = (input as { Key?: { sk?: string } }).Key?.sk; return sk === 'LIFECYCLE' ? { Item: lifeItem() } : {}; }
      return {};
    });
    const s1 = new DynamoAccountLifecycleStore(TABLE, first.client, deps);
    const r1 = await s1.beginTransition(suspendInput());
    const fp = r1.operation.requestFingerprint;

    const replay = recordingClient((kind, input) => {
      if (kind === 'Get') {
        const sk = (input as { Key?: { sk?: string } }).Key?.sk ?? '';
        if (sk.startsWith('IDEMPOTENCY#')) return { Item: { operationId: 'op-1', requestFingerprint: fp } };
        if (sk === 'LIFECYCLE') return { Item: lifeItem({ status: 'suspending', currentOperationId: 'op-1', version: 2 }) };
        if (sk.startsWith('OPERATION#')) return { Item: { record: r1.operation } };
      }
      return {};
    });
    const s2 = new DynamoAccountLifecycleStore(TABLE, replay.client, deps);
    const r2 = await s2.beginTransition(suspendInput());
    expect(r2.idempotentReplay).toBe(true);
    expect(replay.sent.some((s) => s.__kind === 'TransactWrite')).toBe(false);
  });

  it('beginTransition rejects a matching key with a different fingerprint (409)', async () => {
    const client = recordingClient((kind, input) => {
      if (kind === 'Get') {
        const sk = (input as { Key?: { sk?: string } }).Key?.sk ?? '';
        if (sk.startsWith('IDEMPOTENCY#')) return { Item: { operationId: 'op-1', requestFingerprint: 'DIFFERENT' } };
        if (sk === 'LIFECYCLE') return { Item: lifeItem() };
      }
      return {};
    });
    const store = new DynamoAccountLifecycleStore(TABLE, client.client, deps);
    await expect(store.beginTransition(suspendInput())).rejects.toMatchObject({ status: 409, code: 'IDEMPOTENCY_KEY_CONFLICT' });
  });

  it('advanceOperation uses an operationVersion-conditional Update', async () => {
    const client = recordingClient((kind) => (kind === 'Get' ? { Item: { record: { operationVersion: 1, status: 'running', completedSteps: ['intent_recorded'] } } } : {}));
    const store = new DynamoAccountLifecycleStore(TABLE, client.client, deps);
    await store.advanceOperation({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 1, step: 'provider_disabled' });
    const upd = client.sent.find((s) => s.__kind === 'Update')!;
    expect(upd.input.ConditionExpression).toBe('record.operationVersion = :ev');
  });

  it('completeTransition transactionally finalizes the op and clears the lifecycle reservation', async () => {
    const client = recordingClient((kind, input) => {
      if (kind === 'Get') {
        const sk = (input as { Key?: { sk?: string } }).Key?.sk ?? '';
        if (sk.startsWith('OPERATION#')) return { Item: { record: { operationVersion: 2, status: 'running', desiredStatus: 'suspended', completedSteps: ['global_deny_committed', 'final_state_committed'] } } };
        if (sk === 'LIFECYCLE') return { Item: lifeItem({ status: 'suspending', currentOperationId: 'op-1', version: 2 }) };
      }
      return {};
    });
    const store = new DynamoAccountLifecycleStore(TABLE, client.client, deps);
    await store.completeTransition({ canonicalUserId: UID, operationId: 'op-1', expectedOperationVersion: 2, expectedLifecycleVersion: 2, finalStatus: 'suspended', requiredSteps: ['global_deny_committed'] });
    const tx = client.sent.find((s) => s.__kind === 'TransactWrite')!;
    const items = tx.input.TransactItems as Array<Record<string, { ConditionExpression?: string; UpdateExpression?: string }>>;
    const lifeUpd = items.map((i) => i.Update!).find((u) => u?.UpdateExpression?.includes('lastCompletedOperationId'))!;
    expect(lifeUpd.ConditionExpression).toContain('record.currentOperationId = :opid');
    expect(lifeUpd.UpdateExpression).toContain('REMOVE record.currentOperationId');
  });

  it('maps a conditional-check failure on initialize to 409 already-exists', async () => {
    const client = recordingClient((kind) => (kind === 'Put' ? Object.assign(new Error('cond'), { name: 'ConditionalCheckFailedException' }) : {}));
    const store = new DynamoAccountLifecycleStore(TABLE, client.client, deps);
    await expect(store.initializeLifecycle({ canonicalUserId: UID, providerUsername: 'c1', normalizedEmail: 'a@careindeed.com', initialStatus: 'active', initializationSource: 'verified_legacy_active', actorUserId: 'admin-1' }))
      .rejects.toMatchObject({ status: 409, code: 'ACCOUNT_LIFECYCLE_ALREADY_EXISTS' });
  });
});
