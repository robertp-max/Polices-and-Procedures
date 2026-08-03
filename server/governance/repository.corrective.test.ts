import { describe, expect, it } from 'vitest';
import type { SourceAuthorityMetadata } from './contracts.js';
import { governanceMutation, mutationContext, write } from './mutations.js';
import {
  GovernanceItemSizeError,
  GovernanceRepositoryError,
  GovernanceVersionConflictError,
  InMemoryGovernanceRepository,
} from './repository.js';
import { TEST_LIVE_SOURCE, testContext } from './testFixtures.js';

function sourceMutation(
  repositoryRecord: SourceAuthorityMetadata,
  input: { contextKey: string; scope?: string; expectedVersion: number | null; sourceVersion?: string },
) {
  const context = testContext('person-chair', input.contextKey);
  const record: SourceAuthorityMetadata = {
    ...repositoryRecord,
    version: input.expectedVersion === null ? 1 : input.expectedVersion + 1,
    sourceVersion: input.sourceVersion ?? repositoryRecord.sourceVersion,
    updatedAt: context.now,
    updatedBy: 'person-chair',
  };
  return {
    context,
    mutation: governanceMutation({
      context,
      scope: input.scope ?? `source.update:${record.id}`,
      request: { sourceVersion: record.sourceVersion },
      writes: [write('source_metadata', record, input.expectedVersion)],
      response: record,
      eventType: 'governance.source.updated',
      action: 'source.update',
      resourceType: 'source_metadata',
      resourceId: record.id,
    }),
  };
}

describe('Per-record governance persistence', () => {
  it('rejects stale concurrent writers with one deterministic winner', async () => {
    const repository = new InMemoryGovernanceRepository();
    const initial = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'create', expectedVersion: null });
    await repository.transact(mutationContext(initial.context), initial.mutation);
    const a = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'writer-a', expectedVersion: 1, sourceVersion: 'final.2-a' });
    const b = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'writer-b', expectedVersion: 1, sourceVersion: 'final.2-b' });
    const results = await Promise.allSettled([
      repository.transact(mutationContext(a.context), a.mutation),
      repository.transact(mutationContext(b.context), b.mutation),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const rejection = results.find((result) => result.status === 'rejected');
    expect(rejection).toMatchObject({ status: 'rejected' });
    if (rejection?.status === 'rejected') expect(rejection.reason).toBeInstanceOf(GovernanceVersionConflictError);
    const saved = await repository.get<SourceAuthorityMetadata>(TEST_LIVE_SOURCE.organizationId, 'source_metadata', TEST_LIVE_SOURCE.id);
    expect(saved?.version).toBe(2);
  });

  it('replays the same response for an identical idempotent request without a duplicate outbox event', async () => {
    const repository = new InMemoryGovernanceRepository();
    const operation = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'same-key', expectedVersion: null, scope: 'source.create' });
    const first = await repository.transact(mutationContext(operation.context), operation.mutation);
    const replay = await repository.transact(mutationContext(operation.context), operation.mutation);
    expect(replay).toEqual(first);
    expect(await repository.list(TEST_LIVE_SOURCE.organizationId, 'source_metadata')).toHaveLength(1);
    expect(await repository.list(TEST_LIVE_SOURCE.organizationId, 'audit_outbox')).toHaveLength(1);
  });

  it('rejects reuse of an idempotency key for a different request', async () => {
    const repository = new InMemoryGovernanceRepository();
    const first = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'collision', expectedVersion: null, scope: 'source.create' });
    await repository.transact(mutationContext(first.context), first.mutation);
    const different = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'collision', expectedVersion: null, scope: 'source.create', sourceVersion: 'different' });
    await expect(repository.transact(mutationContext(different.context), different.mutation))
      .rejects.toMatchObject<Partial<GovernanceRepositoryError>>({ code: 'idempotency_conflict' });
  });

  it('rolls back the domain record, audit outbox, and idempotency record on atomic failure', async () => {
    const repository = new InMemoryGovernanceRepository();
    const operation = sourceMutation(TEST_LIVE_SOURCE, { contextKey: 'atomic-failure', expectedVersion: null });
    repository.injectAtomicFailureOnce();
    await expect(repository.transact(mutationContext(operation.context), operation.mutation))
      .rejects.toMatchObject<Partial<GovernanceRepositoryError>>({ code: 'atomic_write_failed' });
    expect(await repository.list(TEST_LIVE_SOURCE.organizationId, 'source_metadata')).toEqual([]);
    expect(await repository.list(TEST_LIVE_SOURCE.organizationId, 'audit_outbox')).toEqual([]);
    expect(await repository.list(TEST_LIVE_SOURCE.organizationId, 'idempotency')).toEqual([]);
  });

  it('enforces the item-size boundary before persistence', async () => {
    const repository = new InMemoryGovernanceRepository();
    const oversized = { ...TEST_LIVE_SOURCE, holdReason: 'x'.repeat(360 * 1024) };
    const operation = sourceMutation(oversized, { contextKey: 'oversized', expectedVersion: null });
    await expect(repository.transact(mutationContext(operation.context), operation.mutation))
      .rejects.toBeInstanceOf(GovernanceItemSizeError);
    expect(await repository.list(TEST_LIVE_SOURCE.organizationId, 'source_metadata')).toEqual([]);
  });
});
