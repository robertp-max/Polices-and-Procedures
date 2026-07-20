/**
 * Packet audit emission — FR-033 vocabulary → hash-chained ledger.
 * Stream key: `packet:{packetInstanceId}`.
 *
 * Default sink: server/audit/writer.ts `appendEvent` (production).
 * Injectable sink/path for tests — never required to touch the real ledger.
 * Do not modify the writer.
 */
import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  appendEvent,
  queryEvents as defaultQueryEvents,
  type Actor,
  type AuditEvent,
} from '../audit/writer.js';
import type {
  PacketAuditActor,
  PacketAuditEventType,
  PacketAuditResourceRef,
} from '@/policy/packets/contracts';

/** Input for a single FR-033 packet.* audit emission. */
export interface EmitPacketAuditInput {
  eventType: PacketAuditEventType;
  packetInstanceId: string;
  actor: PacketAuditActor;
  resource?: Partial<PacketAuditResourceRef> | null;
  before?: unknown | null;
  after?: unknown | null;
  reason?: string | null;
  summary?: string | null;
  correlationId?: string | null;
  idempotencyKey?: string | null;
  packetVersion?: number | null;
  revision?: number | null;
}

/** Minimal append shape accepted by the injectable ledger sink. */
export interface PacketAuditAppendInput {
  event_type: string;
  stream: string;
  actor: Actor;
  action: string;
  resource: {
    type: string;
    id: string;
    parent_ref?: { type: string; id: string };
  };
  before?: unknown;
  after?: unknown;
  correlation_id?: string;
  idempotency_key?: string;
  payload?: Record<string, unknown>;
  severity?: 'info' | 'notice' | 'warning' | 'high' | 'critical';
  retention_class?: 'standard' | 'claims' | 'phi-access' | 'legal-hold';
}

export type PacketAuditAppendFn = (input: PacketAuditAppendInput) => Promise<AuditEvent>;

export interface PacketAuditQueryFilter {
  stream?: string;
  limit?: number;
}

export type PacketAuditQueryFn = (filter: PacketAuditQueryFilter) => Promise<AuditEvent[]>;

/**
 * Injectable ledger configuration.
 * - `ledgerPath`: JSONL file under a temp (or other) directory — used by tests.
 * - `append` / `query`: full custom sink; takes precedence over `ledgerPath`.
 * When neither is set, production writer (`appendEvent` / `queryEvents`) is used.
 */
export interface PacketAuditLedgerConfig {
  ledgerPath?: string;
  append?: PacketAuditAppendFn;
  query?: PacketAuditQueryFn;
}

export interface PacketAuditEmitter {
  readonly ledgerPath: string | null;
  emit(event: EmitPacketAuditInput): Promise<AuditEvent>;
  query(filter?: PacketAuditQueryFilter): Promise<AuditEvent[]>;
}

export function createPacketAuditEmitter(
  config: PacketAuditLedgerConfig = {},
): PacketAuditEmitter {
  return new ConfiguredPacketAuditEmitter(config);
}

function mapActor(actor: PacketAuditActor): Actor {
  if (actor.kind === 'user') {
    return {
      type: 'user',
      user_id: actor.actorId,
      display_name: actor.actorRole ?? undefined,
      on_behalf_of: actor.onBehalfOf ?? undefined,
    };
  }
  if (actor.kind === 'system') {
    return {
      type: 'system',
      service_id: actor.actorId,
      on_behalf_of: actor.onBehalfOf ?? undefined,
    };
  }
  return {
    type: 'service',
    service_id: actor.actorId,
    on_behalf_of: actor.onBehalfOf ?? undefined,
  };
}

/** Build stream key for a packet instance chronology. */
export function packetAuditStreamKey(packetInstanceId: string): string {
  if (!packetInstanceId || packetInstanceId.trim().length === 0) {
    throw new Error('packetInstanceId is required for audit stream key');
  }
  return `packet:${packetInstanceId.trim()}`;
}

function buildPacketAuditAppendInput(event: EmitPacketAuditInput): PacketAuditAppendInput {
  const packetInstanceId = event.packetInstanceId?.trim();
  if (!packetInstanceId) {
    throw new Error('emitPacketAudit requires packetInstanceId');
  }
  if (!event.eventType || !event.eventType.startsWith('packet.')) {
    throw new Error(`emitPacketAudit requires a packet.* eventType; got ${String(event.eventType)}`);
  }
  if (!event.actor?.actorId?.trim()) {
    throw new Error('emitPacketAudit requires actor.actorId');
  }

  const resourceType = event.resource?.resourceType ?? 'packet';
  const resourceId = event.resource?.resourceId ?? packetInstanceId;
  const action = event.eventType.slice('packet.'.length);

  const payload: Record<string, unknown> = {};
  if (event.reason != null) payload.reason = event.reason;
  if (event.summary != null) payload.summary = event.summary;
  if (event.packetVersion !== undefined) payload.packetVersion = event.packetVersion;
  if (event.revision !== undefined) payload.revision = event.revision;
  if (event.resource?.packetVersion != null) {
    payload.resourcePacketVersion = event.resource.packetVersion;
  }
  if (event.actor.actorRole != null) payload.actorRole = event.actor.actorRole;

  const input: PacketAuditAppendInput = {
    event_type: event.eventType,
    stream: packetAuditStreamKey(packetInstanceId),
    actor: mapActor(event.actor),
    action,
    resource: {
      type: resourceType,
      id: resourceId,
      parent_ref: event.resource?.parentResourceId
        ? { type: 'packet', id: event.resource.parentResourceId }
        : undefined,
    },
    before: event.before ?? undefined,
    after: event.after ?? undefined,
    correlation_id: event.correlationId ?? undefined,
    idempotency_key: event.idempotencyKey ?? undefined,
    payload,
    severity: 'info',
    retention_class: 'standard',
  };

  return input;
}

/**
 * Append one packet.* event to the supplied store-owned ledger.
 * Exactly one ledger row per call; callers must not double-emit.
 */
export async function emitPacketAudit(
  event: EmitPacketAuditInput,
  emitter: PacketAuditEmitter = DEFAULT_PACKET_AUDIT_EMITTER,
): Promise<AuditEvent> {
  return emitter.emit(event);
}

/** Query packet audit events from a store-owned ledger, or from production by default. */
export async function queryPacketAuditEvents(
  emitterOrFilter: PacketAuditEmitter | PacketAuditQueryFilter = {},
  filter: PacketAuditQueryFilter = {},
): Promise<AuditEvent[]> {
  if (
    emitterOrFilter &&
    typeof (emitterOrFilter as PacketAuditEmitter).emit === 'function' &&
    typeof (emitterOrFilter as PacketAuditEmitter).query === 'function'
  ) {
    return (emitterOrFilter as PacketAuditEmitter).query(filter);
  }
  return DEFAULT_PACKET_AUDIT_EMITTER.query(emitterOrFilter as PacketAuditQueryFilter);
}

/** Convenience: build a system actor for internal mutations. */
export function systemPacketActor(actorId = 'packet-store'): PacketAuditActor {
  return {
    kind: 'system',
    actorId,
    actorRole: null,
    onBehalfOf: null,
  };
}

/** Convenience: build a user actor from a user id string. */
export function userPacketActor(
  actorId: string,
  actorRole: string | null = null,
): PacketAuditActor {
  if (!actorId || actorId.trim().length === 0) {
    throw new Error('userPacketActor requires a non-empty actorId');
  }
  return {
    kind: 'user',
    actorId: actorId.trim(),
    actorRole,
    onBehalfOf: null,
  };
}

/* ─── Isolated file ledger (tests / injectable path) ───────────────── */

function ulid(): string {
  return `${Date.now().toString(36)}_${randomBytes(8).toString('hex')}`;
}

function sha256(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

function canonical(v: unknown): string {
  if (v === null || v === undefined) return 'null';
  if (typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  return '{' + keys.map((k) => JSON.stringify(k) + ':' + canonical(obj[k])).join(',') + '}';
}

/**
 * Minimal append-only JSONL + per-stream hash chain.
 * Writes only to the configured path — never to server/audit/data.
 */
class IsolatedFileLedger {
  private readonly filePath: string;
  private readonly chainHeads = new Map<string, { last_hash: string; sequence: number }>();
  private writeQueue: Promise<unknown> = Promise.resolve();
  private cacheLoaded = false;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  private ensureDir(): void {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadCache(): void {
    if (this.cacheLoaded) return;
    this.ensureDir();
    if (!fs.existsSync(this.filePath)) {
      this.cacheLoaded = true;
      return;
    }
    const txt = fs.readFileSync(this.filePath, 'utf8');
    for (const line of txt.split('\n')) {
      if (!line) continue;
      try {
        const evt = JSON.parse(line) as AuditEvent;
        this.chainHeads.set(evt.stream, { last_hash: evt.event_hash, sequence: evt.sequence });
      } catch {
        // Skip corrupt lines.
      }
    }
    this.cacheLoaded = true;
  }

  private serialize<T>(fn: () => T): Promise<T> {
    const next = this.writeQueue.then(fn, fn);
    this.writeQueue = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  async append(input: PacketAuditAppendInput): Promise<AuditEvent> {
    return this.serialize(() => {
      this.loadCache();
      const head = this.chainHeads.get(input.stream) ?? { last_hash: 'GENESIS', sequence: 0 };
      const event_id = ulid();
      const occurred_at_utc = new Date().toISOString();
      const sequence = head.sequence + 1;
      const prev_hash = head.last_hash;

      const candidate: Omit<AuditEvent, 'event_hash'> = {
        event_id,
        event_type: input.event_type,
        event_version: 1,
        occurred_at_utc,
        stream: input.stream,
        sequence,
        prev_hash,
        actor: input.actor,
        action: input.action,
        resource: input.resource,
        before: input.before,
        after: input.after,
        correlation_id: input.correlation_id ?? ulid(),
        environment: {},
        severity: input.severity ?? 'info',
        phi_flag: false,
        pii_flag: false,
        retention_class: input.retention_class ?? 'standard',
        payload: input.payload ?? {},
        schema_version: 1,
        idempotency_key: input.idempotency_key,
      };

      const event_hash = sha256(prev_hash + '|' + canonical(candidate));
      const event: AuditEvent = { ...candidate, event_hash };

      this.ensureDir();
      fs.appendFileSync(this.filePath, JSON.stringify(event) + '\n', 'utf8');
      this.chainHeads.set(input.stream, { last_hash: event_hash, sequence });
      return event;
    });
  }

  async query(filter: PacketAuditQueryFilter): Promise<AuditEvent[]> {
    this.loadCache();
    if (!fs.existsSync(this.filePath)) return [];
    const txt = fs.readFileSync(this.filePath, 'utf8');
    const all: AuditEvent[] = [];
    for (const line of txt.split('\n')) {
      if (!line) continue;
      try {
        all.push(JSON.parse(line) as AuditEvent);
      } catch {
        // skip
      }
    }
    let rows = all;
    if (filter.stream) {
      rows = rows.filter((e) => e.stream === filter.stream);
    }
    rows.sort((a, b) => a.sequence - b.sequence);
    const limit = filter.limit ?? 200;
    return rows.slice(0, limit);
  }
}

class ConfiguredPacketAuditEmitter implements PacketAuditEmitter {
  readonly ledgerPath: string | null;
  private readonly appendFn: PacketAuditAppendFn | null;
  private readonly queryFn: PacketAuditQueryFn | null;
  private readonly fileLedger: IsolatedFileLedger | null;

  constructor(config: PacketAuditLedgerConfig) {
    this.ledgerPath =
      config.ledgerPath && config.ledgerPath.trim().length > 0
        ? path.resolve(config.ledgerPath)
        : null;
    this.appendFn = config.append ?? null;
    this.queryFn = config.query ?? null;
    this.fileLedger =
      this.appendFn || !this.ledgerPath ? null : new IsolatedFileLedger(this.ledgerPath);
  }

  async emit(event: EmitPacketAuditInput): Promise<AuditEvent> {
    const input = buildPacketAuditAppendInput(event);
    if (this.appendFn) {
      return this.appendFn(input);
    }
    if (this.fileLedger) {
      return this.fileLedger.append(input);
    }
    return appendEvent(input);
  }

  async query(filter: PacketAuditQueryFilter = {}): Promise<AuditEvent[]> {
    if (this.queryFn) {
      return this.queryFn(filter);
    }
    if (this.fileLedger) {
      return this.fileLedger.query(filter);
    }
    return defaultQueryEvents({
      stream: filter.stream,
      limit: filter.limit ?? 200,
    });
  }
}

const DEFAULT_PACKET_AUDIT_EMITTER = new ConfiguredPacketAuditEmitter({});
