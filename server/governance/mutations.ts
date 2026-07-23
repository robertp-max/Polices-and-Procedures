import { randomUUID } from 'node:crypto';
import type { Actor } from '../identity/session.js';
import type {
  AuditOutboxRecord,
  GovernanceMutation,
  GovernanceRecord,
  GovernanceRecordType,
  MutationContext,
  MutationWrite,
  VersionedRecord,
} from './contracts.js';
import { governanceRequestSha256 } from './repository.js';

export interface CommandContext {
  organizationId: string;
  actor: Actor;
  correlationId: string;
  idempotencyKey: string;
  now: string;
}

export function actorId(context: CommandContext): string {
  return context.actor.user_id ?? context.actor.service_id ?? 'unknown';
}

export function mutationContext(context: CommandContext): MutationContext {
  return {
    organizationId: context.organizationId,
    actorId: actorId(context),
    correlationId: context.correlationId,
    idempotencyKey: context.idempotencyKey,
    now: context.now,
  };
}
export function newRecordBase(context: CommandContext, id = randomUUID()): VersionedRecord {
  const by = actorId(context);
  return {
    id,
    organizationId: context.organizationId,
    version: 1,
    schemaVersion: 2,
    createdAt: context.now,
    createdBy: by,
    updatedAt: context.now,
    updatedBy: by,
  };
}

export function nextRecordBase<T extends VersionedRecord>(context: CommandContext, current: T): VersionedRecord {
  return {
    id: current.id,
    organizationId: current.organizationId,
    version: current.version + 1,
    schemaVersion: 2,
    createdAt: current.createdAt,
    createdBy: current.createdBy,
    updatedAt: context.now,
    updatedBy: actorId(context),
  };
}

export function write(
  type: GovernanceRecordType,
  record: GovernanceRecord,
  expectedVersion: number | null,
): MutationWrite {
  return { type, record, expectedVersion };
}

export function governanceMutation<T>(input: {
  context: CommandContext;
  scope: string;
  request: unknown;
  writes: MutationWrite[];
  response: T;
  eventType: string;
  action: string;
  resourceType: GovernanceRecordType;
  resourceId: string;
  payload?: Record<string, unknown>;
}): GovernanceMutation<T> {
  const outboxId = randomUUID();
  const mutationId = randomUUID();
  const outbox: Omit<AuditOutboxRecord, keyof VersionedRecord> & { id: string } = {
    id: outboxId,
    mutationId,
    eventType: input.eventType,
    action: input.action,
    actorId: actorId(input.context),
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    correlationId: input.context.correlationId,
    payload: input.payload ?? {},
    dispatchedAt: null,
  };
  const expires = new Date(Date.parse(input.context.now) + 24 * 60 * 60 * 1000).toISOString();
  return {
    scope: input.scope,
    requestSha256: governanceRequestSha256(input.request),
    writes: input.writes,
    response: input.response,
    outbox,
    idempotencyExpiresAt: expires,
  };
}
