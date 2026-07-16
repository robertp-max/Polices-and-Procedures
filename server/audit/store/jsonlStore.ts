/**
 * JsonlAuditEventStore — the current default backend (byte-compatible with the
 * original writer): append-only JSONL, per-stream hash chain, idempotency,
 * PHI guard, single-process write serialization.
 *
 * NOTE: durable only on a single persistent filesystem. Not multi-instance
 * safe on Cloud Run — this is why the Firestore backend exists (see ADR-0001).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AuditEventStore } from './auditEventStore.js';
import {
  assertNoPhi, constructEvent, defaultGenerators, filterEvents, verifyChainList,
  GENESIS_HEAD,
  type AuditEvent, type AuditEventInput, type ChainHead, type ChainVerifyResult,
  type EventGenerators, type QueryFilter,
} from './eventModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Canonical ledger path (unchanged from the original writer). */
export const DEFAULT_EVENTS_FILE = path.resolve(__dirname, '..', 'data', 'audit_events.jsonl');

export class JsonlAuditEventStore implements AuditEventStore {
  private readonly eventsFile: string;
  private readonly gen: EventGenerators;
  private readonly chainHeads = new Map<string, ChainHead>();
  private readonly idempotencyIndex = new Set<string>();
  private cacheLoaded = false;
  private writeQueue: Promise<unknown> = Promise.resolve();

  constructor(opts: { eventsFile?: string; generators?: EventGenerators } = {}) {
    this.eventsFile = opts.eventsFile ?? DEFAULT_EVENTS_FILE;
    this.gen = opts.generators ?? defaultGenerators();
  }

  private serialize<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.writeQueue.then(fn, fn);
    this.writeQueue = next.catch(() => undefined);
    return next;
  }

  private async ensureCacheLoaded(): Promise<void> {
    if (this.cacheLoaded) return;
    try {
      const txt = await fs.readFile(this.eventsFile, 'utf8');
      for (const line of txt.split('\n')) {
        if (!line) continue;
        const evt = JSON.parse(line) as AuditEvent;
        this.chainHeads.set(evt.stream, { last_hash: evt.event_hash, sequence: evt.sequence });
        if (evt.idempotency_key) this.idempotencyIndex.add(`${evt.stream}::${evt.idempotency_key}`);
      }
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }
    this.cacheLoaded = true;
  }

  async append(input: AuditEventInput): Promise<AuditEvent> {
    assertNoPhi(input);
    return this.serialize(async () => {
      await this.ensureCacheLoaded();
      if (input.idempotency_key) {
        const key = `${input.stream}::${input.idempotency_key}`;
        if (this.idempotencyIndex.has(key)) {
          const prior = await this.findByIdempotency(input.stream, input.idempotency_key);
          if (prior) return prior;
        }
      }
      const head = this.chainHeads.get(input.stream) ?? GENESIS_HEAD;
      const event = constructEvent(input, head, this.gen);
      await fs.mkdir(path.dirname(this.eventsFile), { recursive: true });
      await fs.appendFile(this.eventsFile, JSON.stringify(event) + '\n', 'utf8');
      this.chainHeads.set(input.stream, { last_hash: event.event_hash, sequence: event.sequence });
      if (input.idempotency_key) this.idempotencyIndex.add(`${input.stream}::${input.idempotency_key}`);
      return event;
    });
  }

  private async findByIdempotency(stream: string, key: string): Promise<AuditEvent | null> {
    const all = await this.readAll();
    for (let i = all.length - 1; i >= 0; i--) {
      if (all[i].stream === stream && all[i].idempotency_key === key) return all[i];
    }
    return null;
  }

  async readAll(): Promise<AuditEvent[]> {
    try {
      const txt = await fs.readFile(this.eventsFile, 'utf8');
      return txt.split('\n').filter(Boolean).map(l => JSON.parse(l) as AuditEvent);
    } catch (e: unknown) {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') return [];
      throw e;
    }
  }

  async queryEvents(filter: QueryFilter): Promise<AuditEvent[]> {
    return filterEvents(await this.readAll(), filter);
  }

  async getEvent(eventId: string): Promise<AuditEvent | null> {
    return (await this.readAll()).find(e => e.event_id === eventId) ?? null;
  }

  async verifyChains(stream?: string): Promise<ChainVerifyResult> {
    return verifyChainList(await this.readAll(), stream);
  }
}
