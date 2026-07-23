import { createHash, randomUUID } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
  TransactWriteCommand,
} from '@aws-sdk/lib-dynamodb';
import type {
  AuditOutboxRecord,
  GovernanceMutation,
  GovernanceRecord,
  GovernanceRecordType,
  IdempotencyRecord,
  MutationContext,
  MutationWrite,
} from './contracts.js';

const MAX_RECORD_BYTES = 350 * 1024;
const MAX_TRANSACTION_WRITES = 80;

export class GovernanceRepositoryError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = 'GovernanceRepositoryError';
  }
}

export class GovernanceVersionConflictError extends GovernanceRepositoryError {
  constructor(
    public readonly recordType: GovernanceRecordType,
    public readonly recordId: string,
    public readonly expectedVersion: number | null,
    public readonly actualVersion: number | null,
  ) {
    super('version_conflict', 'The governance record changed before this operation completed.');
  }
}

export class GovernanceItemSizeError extends GovernanceRepositoryError {
  constructor(public readonly recordType: GovernanceRecordType, public readonly bytes: number) {
    super('item_too_large', `Governance ${recordType} item exceeds the ${MAX_RECORD_BYTES}-byte boundary.`);
  }
}

export interface GovernanceRepository {
  readonly provider: 'memory' | 'file_journal' | 'dynamodb';
  get<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType, id: string): Promise<T | null>;
  list<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType): Promise<T[]>;
  transact<T>(context: MutationContext, mutation: GovernanceMutation<T>): Promise<T>;
}

function key(organizationId: string, type: GovernanceRecordType, id: string): string {
  return `${organizationId}\u0000${type}\u0000${id}`;
}

function jsonBytes(value: unknown): number {
  return Buffer.byteLength(JSON.stringify(value), 'utf8');
}

function requestDigest(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function assertMutation<T>(context: MutationContext, mutation: GovernanceMutation<T>): void {
  if (!context.idempotencyKey.trim()) throw new GovernanceRepositoryError('idempotency_required', 'Idempotency key is required.');
  if (mutation.writes.length === 0) throw new GovernanceRepositoryError('empty_mutation', 'A mutation must write at least one record.');
  if (mutation.writes.length > MAX_TRANSACTION_WRITES) {
    throw new GovernanceRepositoryError('transaction_too_large', `A mutation may write at most ${MAX_TRANSACTION_WRITES} records.`);
  }
  for (const write of mutation.writes) {
    if (write.record.organizationId !== context.organizationId) {
      throw new GovernanceRepositoryError('organization_mismatch', 'Cross-organization governance mutations are forbidden.');
    }
    const bytes = jsonBytes(write.record);
    if (bytes > MAX_RECORD_BYTES) throw new GovernanceItemSizeError(write.type, bytes);
  }
  if (jsonBytes(mutation.outbox) > MAX_RECORD_BYTES) throw new GovernanceItemSizeError('audit_outbox', jsonBytes(mutation.outbox));
}

function makeIdempotencyRecord<T>(context: MutationContext, mutation: GovernanceMutation<T>): IdempotencyRecord {
  return {
    id: `${mutation.scope}:${context.idempotencyKey}`,
    organizationId: context.organizationId,
    version: 1,
    schemaVersion: 2,
    createdAt: context.now,
    createdBy: context.actorId,
    updatedAt: context.now,
    updatedBy: context.actorId,
    key: context.idempotencyKey,
    scope: mutation.scope,
    requestSha256: mutation.requestSha256,
    response: mutation.response,
    mutationRecordIds: mutation.writes.map((write) => write.record.id),
    expiresAt: mutation.idempotencyExpiresAt,
  };
}

function makeOutboxRecord<T>(context: MutationContext, mutation: GovernanceMutation<T>): AuditOutboxRecord {
  return {
    ...mutation.outbox,
    organizationId: context.organizationId,
    version: 1,
    schemaVersion: 2,
    createdAt: context.now,
    createdBy: context.actorId,
    updatedAt: context.now,
    updatedBy: context.actorId,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export class InMemoryGovernanceRepository implements GovernanceRepository {
  readonly provider = 'memory' as const;
  private records = new Map<string, GovernanceRecord>();
  private serial: Promise<void> = Promise.resolve();
  private failNextAtomicWrite = false;

  /** Test-only failure injection proving the mutation and outbox roll back together. */
  injectAtomicFailureOnce(): void {
    this.failNextAtomicWrite = true;
  }

  async get<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType, id: string): Promise<T | null> {
    const value = this.records.get(key(organizationId, type, id));
    return value ? clone(value as T) : null;
  }

  async list<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType): Promise<T[]> {
    const prefix = `${organizationId}\u0000${type}\u0000`;
    return [...this.records.entries()]
      .filter(([recordKey]) => recordKey.startsWith(prefix))
      .map(([, value]) => clone(value as T))
      .sort((a, b) => a.id.localeCompare(b.id));
  }

  async transact<T>(context: MutationContext, mutation: GovernanceMutation<T>): Promise<T> {
    assertMutation(context, mutation);
    let release!: () => void;
    const predecessor = this.serial;
    this.serial = new Promise<void>((resolve) => { release = resolve; });
    await predecessor;
    try {
      const idempotencyId = `${mutation.scope}:${context.idempotencyKey}`;
      const existing = this.records.get(key(context.organizationId, 'idempotency', idempotencyId)) as IdempotencyRecord | undefined;
      if (existing) {
        if (existing.requestSha256 !== mutation.requestSha256) {
          throw new GovernanceRepositoryError('idempotency_conflict', 'The idempotency key was already used for a different request.');
        }
        return clone(existing.response as T);
      }

      for (const write of mutation.writes) {
        const current = this.records.get(key(context.organizationId, write.type, write.record.id));
        const actual = current?.version ?? null;
        if (actual !== write.expectedVersion) {
          throw new GovernanceVersionConflictError(write.type, write.record.id, write.expectedVersion, actual);
        }
      }

      const next = new Map(this.records);
      for (const write of mutation.writes) {
        next.set(key(context.organizationId, write.type, write.record.id), clone(write.record));
      }
      const outbox = makeOutboxRecord(context, mutation);
      const idempotency = makeIdempotencyRecord(context, mutation);
      next.set(key(context.organizationId, 'audit_outbox', outbox.id), outbox);
      next.set(key(context.organizationId, 'idempotency', idempotency.id), idempotency);
      if (this.failNextAtomicWrite) {
        this.failNextAtomicWrite = false;
        throw new GovernanceRepositoryError('atomic_write_failed', 'Injected atomic transaction failure.');
      }
      this.records = next;
      return clone(mutation.response);
    } finally {
      release();
    }
  }
}

interface JournalRecord {
  transactionId: string;
  state: 'prepared' | 'committed';
  organizationId: string;
  preparedAt: string;
  writes: Array<{ type: GovernanceRecordType; record: GovernanceRecord; before: GovernanceRecord | null }>;
  outbox: AuditOutboxRecord;
  idempotency: IdempotencyRecord;
}

/**
 * Development adapter. Every domain record is a separate file and mutations
 * use a write-ahead journal so a crash can be replayed. It is deliberately
 * reported as file_journal and is not represented as production durability.
 */
export class FileGovernanceRepository implements GovernanceRepository {
  readonly provider = 'file_journal' as const;
  private serial: Promise<void> = Promise.resolve();
  private recovered = false;

  constructor(private readonly root: string) {}

  private recordPath(organizationId: string, type: GovernanceRecordType, id: string): string {
    const safe = (value: string) => value.replace(/[^a-zA-Z0-9._-]/g, '_');
    return path.join(this.root, safe(organizationId), type, `${safe(id)}.json`);
  }

  private journalPath(transactionId: string): string {
    return path.join(this.root, '_transactions', `${transactionId}.json`);
  }

  private async atomicJson(filePath: string, value: unknown): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const temporary = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
    await fs.writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 });
    await fs.rename(temporary, filePath);
  }

  private async readRecord<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType, id: string): Promise<T | null> {
    try {
      return JSON.parse(await fs.readFile(this.recordPath(organizationId, type, id), 'utf8')) as T;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
      throw error;
    }
  }

  private async ensureRecovered(): Promise<void> {
    if (this.recovered) return;
    this.recovered = true;
    const directory = path.join(this.root, '_transactions');
    let names: string[] = [];
    try {
      names = await fs.readdir(directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    for (const name of names.filter((candidate) => candidate.endsWith('.json')).sort()) {
      const journal = JSON.parse(await fs.readFile(path.join(directory, name), 'utf8')) as JournalRecord;
      if (journal.state !== 'prepared') continue;
      for (const write of journal.writes) {
        await this.atomicJson(this.recordPath(journal.organizationId, write.type, write.record.id), write.record);
      }
      await this.atomicJson(this.recordPath(journal.organizationId, 'audit_outbox', journal.outbox.id), journal.outbox);
      await this.atomicJson(this.recordPath(journal.organizationId, 'idempotency', journal.idempotency.id), journal.idempotency);
      journal.state = 'committed';
      await this.atomicJson(path.join(directory, name), journal);
    }
  }

  async get<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType, id: string): Promise<T | null> {
    await this.ensureRecovered();
    return this.readRecord<T>(organizationId, type, id);
  }

  async list<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType): Promise<T[]> {
    await this.ensureRecovered();
    const directory = path.dirname(this.recordPath(organizationId, type, '_'));
    let names: string[] = [];
    try {
      names = await fs.readdir(directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw error;
    }
    const records = await Promise.all(names.filter((name) => name.endsWith('.json')).map(async (name) =>
      JSON.parse(await fs.readFile(path.join(directory, name), 'utf8')) as T,
    ));
    return records.sort((a, b) => a.id.localeCompare(b.id));
  }

  async transact<T>(context: MutationContext, mutation: GovernanceMutation<T>): Promise<T> {
    assertMutation(context, mutation);
    let release!: () => void;
    const predecessor = this.serial;
    this.serial = new Promise<void>((resolve) => { release = resolve; });
    await predecessor;
    try {
      await this.ensureRecovered();
      const idempotencyId = `${mutation.scope}:${context.idempotencyKey}`;
      const existing = await this.readRecord<IdempotencyRecord>(context.organizationId, 'idempotency', idempotencyId);
      if (existing) {
        if (existing.requestSha256 !== mutation.requestSha256) {
          throw new GovernanceRepositoryError('idempotency_conflict', 'The idempotency key was already used for a different request.');
        }
        return clone(existing.response as T);
      }

      const journalWrites: JournalRecord['writes'] = [];
      for (const write of mutation.writes) {
        const before = await this.readRecord(context.organizationId, write.type, write.record.id);
        const actual = before?.version ?? null;
        if (actual !== write.expectedVersion) {
          throw new GovernanceVersionConflictError(write.type, write.record.id, write.expectedVersion, actual);
        }
        journalWrites.push({ ...write, before });
      }
      const journal: JournalRecord = {
        transactionId: randomUUID(),
        state: 'prepared',
        organizationId: context.organizationId,
        preparedAt: context.now,
        writes: journalWrites,
        outbox: makeOutboxRecord(context, mutation),
        idempotency: makeIdempotencyRecord(context, mutation),
      };
      const journalFile = this.journalPath(journal.transactionId);
      await this.atomicJson(journalFile, journal);
      for (const write of journal.writes) {
        await this.atomicJson(this.recordPath(context.organizationId, write.type, write.record.id), write.record);
      }
      await this.atomicJson(this.recordPath(context.organizationId, 'audit_outbox', journal.outbox.id), journal.outbox);
      await this.atomicJson(this.recordPath(context.organizationId, 'idempotency', journal.idempotency.id), journal.idempotency);
      journal.state = 'committed';
      await this.atomicJson(journalFile, journal);
      return clone(mutation.response);
    } finally {
      release();
    }
  }
}

interface DynamoEnvelope {
  pk: string;
  sk: string;
  gsi1pk: string;
  gsi1sk: string;
  organizationId: string;
  recordType: GovernanceRecordType;
  recordId: string;
  version: number;
  body: GovernanceRecord;
  updatedAt: string;
}

/** Production adapter: one DynamoDB item per domain record. */
export class DynamoGovernanceRepository implements GovernanceRepository {
  readonly provider = 'dynamodb' as const;
  private readonly document: DynamoDBDocumentClient;

  constructor(
    private readonly tableName: string,
    client = new DynamoDBClient({}),
  ) {
    this.document = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });
  }

  private envelope(organizationId: string, type: GovernanceRecordType, record: GovernanceRecord): DynamoEnvelope {
    return {
      pk: `ORG#${organizationId}#TYPE#${type}`,
      sk: `RECORD#${record.id}`,
      gsi1pk: `ORG#${organizationId}#UPDATED`,
      gsi1sk: `${record.updatedAt}#${type}#${record.id}`,
      organizationId,
      recordType: type,
      recordId: record.id,
      version: record.version,
      body: record,
      updatedAt: record.updatedAt,
    };
  }

  async get<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType, id: string): Promise<T | null> {
    const result = await this.document.send(new GetCommand({
      TableName: this.tableName,
      Key: { pk: `ORG#${organizationId}#TYPE#${type}`, sk: `RECORD#${id}` },
      ConsistentRead: true,
    }));
    return result.Item ? clone((result.Item as DynamoEnvelope).body as T) : null;
  }

  async list<T extends GovernanceRecord>(organizationId: string, type: GovernanceRecordType): Promise<T[]> {
    const records: T[] = [];
    let lastKey: Record<string, unknown> | undefined;
    do {
      const result = await this.document.send(new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :prefix)',
        ExpressionAttributeValues: { ':pk': `ORG#${organizationId}#TYPE#${type}`, ':prefix': 'RECORD#' },
        ExclusiveStartKey: lastKey,
        ConsistentRead: true,
      }));
      records.push(...(result.Items ?? []).map((item) => clone((item as DynamoEnvelope).body as T)));
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);
    return records.sort((a, b) => a.id.localeCompare(b.id));
  }

  async transact<T>(context: MutationContext, mutation: GovernanceMutation<T>): Promise<T> {
    assertMutation(context, mutation);
    const idempotency = makeIdempotencyRecord(context, mutation);
    const idempotencyKey = { pk: `ORG#${context.organizationId}#TYPE#idempotency`, sk: `RECORD#${idempotency.id}` };
    const existing = await this.document.send(new GetCommand({
      TableName: this.tableName,
      Key: idempotencyKey,
      ConsistentRead: true,
    }));
    if (existing.Item) {
      const prior = (existing.Item as DynamoEnvelope).body as IdempotencyRecord;
      if (prior.requestSha256 !== mutation.requestSha256) {
        throw new GovernanceRepositoryError('idempotency_conflict', 'The idempotency key was already used for a different request.');
      }
      return clone(prior.response as T);
    }

    const outbox = makeOutboxRecord(context, mutation);
    const allWrites: MutationWrite[] = [
      ...mutation.writes,
      { type: 'audit_outbox', record: outbox, expectedVersion: null },
      { type: 'idempotency', record: idempotency, expectedVersion: null },
    ];
    try {
      await this.document.send(new TransactWriteCommand({
        ClientRequestToken: requestDigest(`${context.organizationId}:${mutation.scope}:${context.idempotencyKey}`).slice(0, 36),
        TransactItems: allWrites.map((write) => {
          const envelope = this.envelope(context.organizationId, write.type, write.record);
          if (write.expectedVersion === null) {
            return {
              Put: {
                TableName: this.tableName,
                Item: envelope,
                ConditionExpression: 'attribute_not_exists(pk)',
              },
            };
          }
          return {
            Put: {
              TableName: this.tableName,
              Item: envelope,
              ConditionExpression: '#version = :expected',
              ExpressionAttributeNames: { '#version': 'version' },
              ExpressionAttributeValues: { ':expected': write.expectedVersion },
            },
          };
        }),
      }));
      return clone(mutation.response);
    } catch (error) {
      const name = (error as { name?: string }).name;
      if (name === 'TransactionCanceledException' || name === 'ConditionalCheckFailedException') {
        const replay = await this.get<IdempotencyRecord>(context.organizationId, 'idempotency', idempotency.id);
        if (replay?.requestSha256 === mutation.requestSha256) return clone(replay.response as T);
        throw new GovernanceRepositoryError('transaction_conflict', 'The governance transaction conflicted with a newer record version.');
      }
      throw error;
    }
  }
}

export function governanceRequestSha256(value: unknown): string {
  return requestDigest(value);
}

export function createGovernanceRepository(): GovernanceRepository {
  const table = process.env.GOVERNANCE_DYNAMO_TABLE?.trim();
  if (table) return new DynamoGovernanceRepository(table);
  const root = process.env.GOVERNANCE_FILE_STORE?.trim()
    || path.resolve(process.cwd(), '.cache', 'governance-records');
  return new FileGovernanceRepository(root);
}

export { MAX_RECORD_BYTES, MAX_TRANSACTION_WRITES };
