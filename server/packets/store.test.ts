/**
 * WP-1.4 — PacketMetadataStore / FileLocalPacketStore tests.
 * Packet cache + audit ledger always use temp dirs — never the repo audit path.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuditEvent } from '../audit/writer.js';
import {
  packetAuditStreamKey,
  userPacketActor,
  type PacketAuditAppendInput,
} from './auditEvents.js';
import { transitionPacket } from './lifecycle.js';
import {
  FileLocalPacketStore,
  ForbiddenFieldError,
  ImmutableIdentityError,
  LifecycleOwnedFieldError,
  LockedPacketError,
  PHI_FREE_TEXT_LENGTH_THRESHOLD,
  StaleWriteError,
  type CreatePacketInstanceInput,
} from './store.js';

const REAL_AUDIT_LEDGER = path.resolve(
  process.cwd(),
  'server',
  'audit',
  'data',
  'audit_events.jsonl',
);

function makeTempDir(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

/**
 * Assert chain linkage + exact count + ordered event types.
 */
function assertAuditSequence(
  events: AuditEvent[],
  expectedTypes: string[],
): void {
  expect(events).toHaveLength(expectedTypes.length);
  const sorted = [...events].sort((a, b) => a.sequence - b.sequence);
  let prev = 'GENESIS';
  for (let i = 0; i < sorted.length; i++) {
    const evt = sorted[i]!;
    expect(evt.sequence).toBe(i + 1);
    expect(evt.prev_hash).toBe(prev);
    expect(evt.event_type).toBe(expectedTypes[i]);
    expect(typeof evt.event_hash).toBe('string');
    expect(evt.event_hash.length).toBeGreaterThan(0);
    prev = evt.event_hash;
  }
}

function fakeAuditEvent(input: PacketAuditAppendInput, sequence: number): AuditEvent {
  return {
    event_id: `evt-${sequence}`,
    event_type: input.event_type,
    event_version: 1,
    occurred_at_utc: new Date().toISOString(),
    stream: input.stream,
    sequence,
    prev_hash: sequence === 1 ? 'GENESIS' : `hash-${sequence - 1}`,
    event_hash: `hash-${sequence}`,
    actor: input.actor,
    action: input.action,
    resource: input.resource,
    before: input.before,
    after: input.after,
    correlation_id: input.correlation_id ?? `corr-${sequence}`,
    environment: {},
    severity: input.severity ?? 'info',
    phi_flag: false,
    pii_flag: false,
    retention_class: input.retention_class ?? 'standard',
    payload: input.payload ?? {},
    schema_version: 1,
    idempotency_key: input.idempotency_key,
  } as AuditEvent;
}

function baseInput(overrides: Partial<CreatePacketInstanceInput> = {}): CreatePacketInstanceInput {
  return {
    agencyId: 'agency-a',
    eventFamilyId: 'family-qapi',
    eventInstanceId: 'evt-occ-1',
    archetypeId: 'arch-qapi',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'tmpl-qapi-q1',
    workflowId: 'wf-qapi',
    workflowInstanceId: 'wfinst-1',
    createdBy: 'user-tester',
    reportingPeriodStart: '2026-01-01',
    reportingPeriodEnd: '2026-03-31',
    ...overrides,
  };
}

describe('FileLocalPacketStore', () => {
  let cacheRoot: string;
  let auditRoot: string;
  let ledgerPath: string;
  let store: FileLocalPacketStore;
  let realLedgerMtimeBefore: number | null;

  beforeEach(() => {
    cacheRoot = makeTempDir('packet-store-');
    auditRoot = makeTempDir('packet-audit-');
    ledgerPath = path.join(auditRoot, 'audit_events.jsonl');
    store = new FileLocalPacketStore(cacheRoot, { ledgerPath });
    realLedgerMtimeBefore = fs.existsSync(REAL_AUDIT_LEDGER)
      ? fs.statSync(REAL_AUDIT_LEDGER).mtimeMs
      : null;
  });

  afterEach(() => {
    fs.rmSync(cacheRoot, { recursive: true, force: true });
    fs.rmSync(auditRoot, { recursive: true, force: true });
  });

  it('creates a packet instance document under the injected cache root', async () => {
    const result = await store.createPacketInstance(baseInput());
    expect(result.created).toBe(true);
    expect(result.instance.packetInstanceId).toBeTruthy();
    expect(result.instance.revision).toBe(1);
    expect(result.instance.packetVersion).toBe(1);
    expect(result.instance.status).toBe('SOURCE_COLLECTION');

    const file = path.join(cacheRoot, `${result.instance.packetInstanceId}.json`);
    expect(fs.existsSync(file)).toBe(true);
    expect(file.startsWith(cacheRoot)).toBe(true);
  });

  it('duplicate create returns existing with created:false and same id (FR-004)', async () => {
    const first = await store.createPacketInstance(baseInput());
    expect(first.created).toBe(true);

    const second = await store.createPacketInstance(
      baseInput({ createdBy: 'another-user' }),
    );
    expect(second.created).toBe(false);
    expect(second.instance.packetInstanceId).toBe(first.instance.packetInstanceId);
    expect(second.instance.identityKey).toBe(first.instance.identityKey);

    const listed = await store.list({ agencyId: 'agency-a' });
    expect(listed).toHaveLength(1);
  });

  it('serializes concurrent createPacketInstance calls for one FR-004 identity key', async () => {
    const N = 24;
    const input = baseInput({
      eventInstanceId: 'evt-create-race',
      workflowInstanceId: 'wf-create-race',
    });

    const results = await Promise.all(
      Array.from({ length: N }, () => store.createPacketInstance(input)),
    );

    expect(results.filter((r) => r.created)).toHaveLength(1);
    expect(new Set(results.map((r) => r.instance.packetInstanceId)).size).toBe(1);
    const identityKey = results[0]!.instance.identityKey;
    const active = await store.findByIdentityKey(identityKey);
    expect(active?.packetInstanceId).toBe(results[0]!.instance.packetInstanceId);

    const listed = await store.list({ agencyId: 'agency-a' });
    const activeMatches = listed.filter(
      (doc) => doc.identityKey === identityKey && doc.status !== 'SUPERSEDED',
    );
    expect(activeMatches).toHaveLength(1);
  });

  it('uses an authoritative identity lookup during create even if findByIdentityKey is overridden', async () => {
    const input = baseInput({
      eventInstanceId: 'evt-create-authoritative',
      workflowInstanceId: 'wf-create-authoritative',
    });
    const first = await store.createPacketInstance(input);

    class SpoofingStore extends FileLocalPacketStore {
      override async findByIdentityKey(_key: string): Promise<null> {
        return null;
      }
    }
    const evil = new SpoofingStore(cacheRoot, { ledgerPath });
    const second = await evil.createPacketInstance(
      baseInput({
        eventInstanceId: 'evt-create-authoritative',
        workflowInstanceId: 'wf-create-authoritative',
        createdBy: 'spoofing-user',
      }),
    );

    expect(second.created).toBe(false);
    expect(second.instance.packetInstanceId).toBe(first.instance.packetInstanceId);

    const listed = await store.list({ agencyId: 'agency-a' });
    const activeMatches = listed.filter(
      (doc) => doc.identityKey === first.instance.identityKey && doc.status !== 'SUPERSEDED',
    );
    expect(activeMatches).toHaveLength(1);
  });

  it('distinct occurrence (event_instance_id) yields distinct instances (FR-005)', async () => {
    const a = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'evt-occ-A', workflowInstanceId: 'wfinst-A' }),
    );
    const b = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'evt-occ-B', workflowInstanceId: 'wfinst-B' }),
    );
    expect(a.created).toBe(true);
    expect(b.created).toBe(true);
    expect(a.instance.packetInstanceId).not.toBe(b.instance.packetInstanceId);
    expect(a.instance.identityKey).not.toBe(b.instance.identityKey);
  });

  it('rejects stale revision writes with StaleWriteError (§18.9)', async () => {
    const { instance } = await store.createPacketInstance(baseInput());
    await store.update(instance.packetInstanceId, instance.revision, {
      warningIds: ['w1'],
    });

    await expect(
      store.update(instance.packetInstanceId, instance.revision, {
        warningIds: ['stale'],
      }),
    ).rejects.toBeInstanceOf(StaleWriteError);

    try {
      await store.update(instance.packetInstanceId, instance.revision, {
        warningIds: ['stale-again'],
      });
      expect.fail('expected StaleWriteError');
    } catch (e) {
      expect(e).toBeInstanceOf(StaleWriteError);
      const err = e as StaleWriteError;
      expect(err.code).toBe('stale_write');
      expect(err.expectedRevision).toBe(instance.revision);
      expect(err.actualRevision).toBe(instance.revision + 1);
    }
  });

  it('LOCKED instance rejects public update', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ status: 'LOCKED' }),
    );
    await expect(
      store.update(instance.packetInstanceId, instance.revision, {
        warningIds: ['nope'],
      }),
    ).rejects.toBeInstanceOf(LockedPacketError);
  });

  it('public update rejects lifecycle-owned fields while transitionPacket still changes status', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'life-owned-1', workflowInstanceId: 'wf-life-owned-1' }),
    );

    for (const patch of [
      { status: 'SUPERSEDED' },
      { lockedAt: new Date().toISOString() },
      { certifiedAt: new Date().toISOString() },
    ] satisfies Array<Record<string, unknown>>) {
      await expect(
        store.update(instance.packetInstanceId, instance.revision, patch as never),
      ).rejects.toBeInstanceOf(LifecycleOwnedFieldError);
    }

    const unchanged = await store.getById(instance.packetInstanceId);
    expect(unchanged?.status).toBe('SOURCE_COLLECTION');
    expect(unchanged?.revision).toBe(instance.revision);

    const actor = userPacketActor('life-owner');
    const transitioned = await transitionPacket(
      store,
      instance.packetInstanceId,
      instance.revision,
      'DRAFT_GENERATED',
      actor,
      'draft generated',
    );
    expect(transitioned.status).toBe('DRAFT_GENERATED');

    const stream = packetAuditStreamKey(instance.packetInstanceId);
    const events = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(events, ['packet.template_selected', 'packet.edited']);
  });

  it('rejects patches to identity-key / packetId family fields (ImmutableIdentityError)', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'id-imm-1', workflowInstanceId: 'wf-imm-1' }),
    );

    const forbiddenPatches: Array<Record<string, unknown>> = [
      { agencyId: 'other-agency' },
      { eventInstanceId: 'other-evt' },
      { workflowInstanceId: 'other-wf' },
      { packetTemplateId: 'other-tmpl' },
      { packetId: 'other-packet-id' },
      { packetInstanceId: 'other-instance-id' },
      { identityKey: 'forged-key' },
    ];

    for (const patch of forbiddenPatches) {
      await expect(
        store.update(
          instance.packetInstanceId,
          instance.revision,
          patch as never,
        ),
      ).rejects.toBeInstanceOf(ImmutableIdentityError);
    }

    // Still at original revision — no identity write succeeded.
    const reloaded = await store.getById(instance.packetInstanceId);
    expect(reloaded?.revision).toBe(instance.revision);
    expect(reloaded?.agencyId).toBe(instance.agencyId);
    expect(reloaded?.identityKey).toBe(instance.identityKey);
  });

  it('rejects forbidden-field writes (blobs / PHI keys / personnel-confidential / free text)', async () => {
    await expect(
      store.createPacketInstance(
        baseInput({
          moduleInstances: [
            {
              moduleInstanceId: 'm1',
              moduleId: 'cover' as never,
              status: 'not_started',
              payload: { base64: 'AAAA' },
              contentHash: null,
              order: 0,
              updatedAt: new Date().toISOString(),
              updatedBy: null,
            },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);

    await expect(
      store.createPacketInstance(
        baseInput({
          eventInstanceId: 'evt-personnel',
          moduleInstances: [
            {
              moduleInstanceId: 'm-hr',
              moduleId: 'cover' as never,
              status: 'not_started',
              payload: { allegation: 'serious misconduct claim' },
              contentHash: null,
              order: 0,
              updatedAt: new Date().toISOString(),
              updatedBy: null,
            },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);

    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'evt-clean' }),
    );
    await expect(
      store.update(instance.packetInstanceId, instance.revision, {
        moduleInstances: [
          {
            moduleInstanceId: 'm2',
            moduleId: 'cover' as never,
            status: 'not_started',
            payload: { patient_name: 'Jane Doe' },
            contentHash: null,
            order: 0,
            updatedAt: new Date().toISOString(),
            updatedBy: null,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);

    // Value-level free-text guard (over threshold narrative).
    const longNarrative = `Clinical narrative free text ${'word '.repeat(PHI_FREE_TEXT_LENGTH_THRESHOLD)}`;
    await expect(
      store.update(instance.packetInstanceId, instance.revision, {
        moduleInstances: [
          {
            moduleInstanceId: 'm3',
            moduleId: 'cover' as never,
            status: 'not_started',
            payload: { summary: longNarrative },
            contentHash: null,
            order: 0,
            updatedAt: new Date().toISOString(),
            updatedBy: null,
          },
        ],
      }),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);
  });

  it('rejects custom-toJSON metadata smuggling before persistence', async () => {
    const smuggler = {
      toJSON() {
        return { patient_name: 'Jane Doe' };
      },
    };
    const packetInstanceId = 'tojson-smuggle-1';

    await expect(
      store.createPacketInstance(
        baseInput({
          packetInstanceId,
          eventInstanceId: 'evt-tojson',
          workflowInstanceId: 'wf-tojson',
          moduleInstances: [
            {
              moduleInstanceId: 'm-tojson',
              moduleId: 'cover' as never,
              status: 'not_started',
              payload: smuggler as never,
              contentHash: null,
              order: 0,
              updatedAt: new Date().toISOString(),
              updatedBy: null,
            },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);

    expect(await store.getById(packetInstanceId)).toBeNull();
    expect(fs.existsSync(path.join(cacheRoot, `${packetInstanceId}.json`))).toBe(false);

    const arraySmuggler: unknown[] & { toJSON?: () => unknown } = [];
    Object.defineProperty(arraySmuggler, 'toJSON', {
      value() {
        return [{ patient_name: 'Jane Doe' }];
      },
      enumerable: false,
    });
    const arrayPacketInstanceId = 'array-tojson-smuggle-1';

    await expect(
      store.createPacketInstance(
        baseInput({
          packetInstanceId: arrayPacketInstanceId,
          eventInstanceId: 'evt-array-tojson',
          workflowInstanceId: 'wf-array-tojson',
          moduleInstances: [
            {
              moduleInstanceId: 'm-array-tojson',
              moduleId: 'cover' as never,
              status: 'not_started',
              payload: arraySmuggler as never,
              contentHash: null,
              order: 0,
              updatedAt: new Date().toISOString(),
              updatedBy: null,
            },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);

    expect(await store.getById(arrayPacketInstanceId)).toBeNull();
    expect(fs.existsSync(path.join(cacheRoot, `${arrayPacketInstanceId}.json`))).toBe(false);
  });

  it('rejects accessor-backed metadata before it can change during serialization', async () => {
    let accessCount = 0;
    const accessorSmuggler: Record<string, unknown> = {};
    Object.defineProperty(accessorSmuggler, 'summary', {
      enumerable: true,
      get() {
        accessCount += 1;
        return accessCount < 3
          ? 'safe-token'
          : `Clinical narrative free text ${'word '.repeat(PHI_FREE_TEXT_LENGTH_THRESHOLD)}`;
      },
    });
    const packetInstanceId = 'accessor-smuggle-1';

    await expect(
      store.createPacketInstance(
        baseInput({
          packetInstanceId,
          eventInstanceId: 'evt-accessor-smuggle',
          workflowInstanceId: 'wf-accessor-smuggle',
          moduleInstances: [
            {
              moduleInstanceId: 'm-accessor',
              moduleId: 'cover' as never,
              status: 'not_started',
              payload: accessorSmuggler as never,
              contentHash: null,
              order: 0,
              updatedAt: new Date().toISOString(),
              updatedBy: null,
            },
          ],
        }),
      ),
    ).rejects.toBeInstanceOf(ForbiddenFieldError);

    expect(accessCount).toBe(0);
    expect(await store.getById(packetInstanceId)).toBeNull();
    expect(fs.existsSync(path.join(cacheRoot, `${packetInstanceId}.json`))).toBe(false);
  });

  it('getById, findByIdentityKey, and list filter correctly', async () => {
    const a = await store.createPacketInstance(
      baseInput({
        eventInstanceId: 'list-a',
        workflowInstanceId: 'wf-list-a',
        reportingPeriodStart: '2026-01-01',
        reportingPeriodEnd: '2026-03-31',
      }),
    );
    await store.createPacketInstance(
      baseInput({
        agencyId: 'agency-b',
        eventInstanceId: 'list-b',
        workflowInstanceId: 'wf-list-b',
        eventFamilyId: 'family-other',
      }),
    );

    const byId = await store.getById(a.instance.packetInstanceId);
    expect(byId?.packetInstanceId).toBe(a.instance.packetInstanceId);

    const byKey = await store.findByIdentityKey(a.instance.identityKey);
    expect(byKey?.packetInstanceId).toBe(a.instance.packetInstanceId);

    const byAgency = await store.list({ agencyId: 'agency-a' });
    expect(byAgency).toHaveLength(1);
    expect(byAgency[0]?.packetInstanceId).toBe(a.instance.packetInstanceId);

    const byPeriod = await store.list({
      agencyId: 'agency-a',
      reportingPeriodStart: '2026-01-01',
      reportingPeriodEnd: '2026-03-31',
    });
    expect(byPeriod).toHaveLength(1);
  });

  it('every mutation emits exactly one audit event on the temp ledger with verified chain', async () => {
    expect(store.getAuditLedgerPath()).toBe(path.resolve(ledgerPath));

    const created = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'audit-mut-1', workflowInstanceId: 'wf-audit-1' }),
    );
    const id = created.instance.packetInstanceId;
    const stream = packetAuditStreamKey(id);

    const afterCreate = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(afterCreate, ['packet.template_selected']);

    const updated = await store.update(id, created.instance.revision, {
      warningIds: ['w-audit'],
    });
    const afterUpdate = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(afterUpdate, ['packet.template_selected', 'packet.edited']);

    await store.update(id, updated.revision, { blockerIds: ['b1'] });
    const afterSecond = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(afterSecond, [
      'packet.template_selected',
      'packet.edited',
      'packet.edited',
    ]);

    // Ledger is under temp dir only.
    expect(fs.existsSync(ledgerPath)).toBe(true);
    expect(ledgerPath.startsWith(auditRoot)).toBe(true);

    // Must not have touched the real production ledger path during this test.
    if (realLedgerMtimeBefore === null) {
      expect(fs.existsSync(REAL_AUDIT_LEDGER)).toBe(false);
    } else {
      expect(fs.statSync(REAL_AUDIT_LEDGER).mtimeMs).toBe(realLedgerMtimeBefore);
    }
  });

  it('keeps audit sinks store-scoped with no importable global redirect hook', async () => {
    const rootA = makeTempDir('packet-audit-scope-a-');
    const rootB = makeTempDir('packet-audit-scope-b-');
    const eventsA: PacketAuditAppendInput[] = [];
    const eventsB: PacketAuditAppendInput[] = [];
    const scopedA = new FileLocalPacketStore(rootA, {
      append: async (input) => {
        eventsA.push(input);
        return fakeAuditEvent(input, eventsA.length);
      },
      query: async () => [],
    });
    const scopedB = new FileLocalPacketStore(rootB, {
      append: async (input) => {
        eventsB.push(input);
        return fakeAuditEvent(input, eventsB.length);
      },
      query: async () => [],
    });

    try {
      await scopedA.createPacketInstance(
        baseInput({
          agencyId: 'agency-audit-a',
          eventInstanceId: 'evt-audit-a',
          workflowInstanceId: 'wf-audit-a',
        }),
      );
      await scopedB.createPacketInstance(
        baseInput({
          agencyId: 'agency-audit-b',
          eventInstanceId: 'evt-audit-b',
          workflowInstanceId: 'wf-audit-b',
        }),
      );

      expect(eventsA).toHaveLength(1);
      expect(eventsB).toHaveLength(1);
      expect(eventsA[0]!.resource.id).not.toBe(eventsB[0]!.resource.id);
      expect(eventsA[0]!.stream).toContain(eventsA[0]!.resource.id);
      expect(eventsB[0]!.stream).toContain(eventsB[0]!.resource.id);

      const auditMod = await import('./auditEvents.js');
      expect(Object.prototype.hasOwnProperty.call(auditMod, 'configurePacketAuditLedger')).toBe(
        false,
      );
    } finally {
      fs.rmSync(rootA, { recursive: true, force: true });
      fs.rmSync(rootB, { recursive: true, force: true });
    }
  });

  it('atomic write leaves a readable JSON document (tmp+rename)', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'atomic-1', workflowInstanceId: 'wf-atomic-1' }),
    );
    const file = path.join(cacheRoot, `${instance.packetInstanceId}.json`);
    const tmp = `${file}.tmp`;
    expect(fs.existsSync(file)).toBe(true);
    expect(fs.existsSync(tmp)).toBe(false);
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { packetInstanceId: string };
    expect(parsed.packetInstanceId).toBe(instance.packetInstanceId);
  });

  it('does not expose create or update mutations when audit append fails', async () => {
    const failingCreateStore = new FileLocalPacketStore(cacheRoot, {
      append: async () => {
        throw new Error('ledger unavailable');
      },
      query: async () => [],
    });
    const createId = 'audit-fail-create';

    await expect(
      failingCreateStore.createPacketInstance(
        baseInput({
          packetInstanceId: createId,
          eventInstanceId: 'audit-fail-create',
          workflowInstanceId: 'wf-audit-fail-create',
        }),
      ),
    ).rejects.toThrow('ledger unavailable');
    expect(await failingCreateStore.getById(createId)).toBeNull();
    expect(fs.existsSync(path.join(cacheRoot, `${createId}.json`))).toBe(false);

    const { instance } = await store.createPacketInstance(
      baseInput({
        packetInstanceId: 'audit-fail-update',
        eventInstanceId: 'audit-fail-update',
        workflowInstanceId: 'wf-audit-fail-update',
      }),
    );
    const failingUpdateStore = new FileLocalPacketStore(cacheRoot, {
      append: async () => {
        throw new Error('ledger unavailable');
      },
      query: async () => [],
    });

    await expect(
      failingUpdateStore.update(instance.packetInstanceId, instance.revision, {
        warningIds: ['should-not-stick'],
      }),
    ).rejects.toThrow('ledger unavailable');

    const reloaded = await store.getById(instance.packetInstanceId);
    expect(reloaded?.revision).toBe(instance.revision);
    expect(reloaded?.warningIds).toEqual([]);
    expect(fs.readdirSync(cacheRoot).some((name) => name.endsWith('.tmp'))).toBe(false);
  });

  it('does not export any privileged LOCKED-mutation handle', async () => {
    const storeMod = await import('./store.js');
    const lifeMod = await import('./lifecycle.js');

    const exportedNames = [
      ...Object.keys(storeMod).map((name) => `store.${name}`),
      ...Object.keys(lifeMod).map((name) => `lifecycle.${name}`),
    ];
    expect(
      exportedNames.some((name) =>
        /(^|\.)(__.*|_.*|apply.*update|.*allow.*terminal|.*allow.*locked)/i.test(name),
      ),
    ).toBe(false);

    const { instance } = await store.createPacketInstance(
      baseInput({
        status: 'LOCKED',
        eventInstanceId: 'export-lock-1',
        workflowInstanceId: 'wf-export-lock-1',
      }),
    );
    const actor = userPacketActor('u');

    // Instance prototype / class must not expose privileged-looking handles.
    expect(
      Object.getOwnPropertyNames(store).some((name) => /apply|allow.*locked/i.test(name)),
    ).toBe(false);
    expect(
      Object.getOwnPropertyNames(FileLocalPacketStore.prototype).some((name) =>
        /apply|allow.*locked/i.test(name),
      ),
    ).toBe(false);

    // store.update — public mutator
    await expect(
      store.update(instance.packetInstanceId, instance.revision, { warningIds: ['x'] }),
    ).rejects.toBeInstanceOf(LockedPacketError);

    // lifecycle.transitionPacket — public mutator
    await expect(
      lifeMod.transitionPacket(
        store,
        instance.packetInstanceId,
        instance.revision,
        'AMENDMENT_REQUIRED',
        actor,
      ),
    ).rejects.toBeInstanceOf(LockedPacketError);

    const forged = {
      ...(await store.getById(instance.packetInstanceId))!,
      status: 'DRAFT_GENERATED' as const,
    };
    class SpoofingStore extends FileLocalPacketStore {
      override async getById(): Promise<typeof forged> {
        return forged;
      }
    }
    const evil = new SpoofingStore(cacheRoot, { ledgerPath });
    await expect(
      evil.update(instance.packetInstanceId, instance.revision, { warningIds: ['evil'] }),
    ).rejects.toBeInstanceOf(LockedPacketError);
    await expect(
      FileLocalPacketStore.prototype.update.call(
        evil,
        instance.packetInstanceId,
        instance.revision,
        { warningIds: ['prototype-evil'] },
      ),
    ).rejects.toBeInstanceOf(LockedPacketError);

    type CallableExport = (...args: unknown[]) => unknown;
    const isClassLike = (value: CallableExport): boolean =>
      /^class\s/.test(Function.prototype.toString.call(value));
    const mutatorExports = ([
      ['store', storeMod],
      ['lifecycle', lifeMod],
    ] as const).flatMap(([modName, mod]) =>
      Object.entries(mod)
        .filter(([, value]) => typeof value === 'function')
        .filter(([, value]) => !isClassLike(value as CallableExport))
        .filter(([exportName, value]) => {
          const fn = value as CallableExport;
          return /update|mutate|write|apply|transition/i.test(exportName) && fn.length >= 3;
        })
        .map(([exportName, value]) => ({ exportName, modName, value })),
    );
    expect(mutatorExports.map((entry) => `${entry.modName}.${entry.exportName}`)).toContain(
      'lifecycle.transitionPacket',
    );

    for (const { exportName, value } of mutatorExports) {
      const fn = value as (...args: unknown[]) => unknown;
      try {
        const result = /transition/i.test(exportName)
          ? fn(evil, instance.packetInstanceId, instance.revision, 'AMENDMENT_REQUIRED', actor)
          : fn(evil, instance.packetInstanceId, instance.revision, { warningIds: ['probe'] }, {});
        if (result && typeof (result as Promise<unknown>).then === 'function') {
          await expect(result as Promise<unknown>).rejects.toBeTruthy();
        }
      } catch {
        // Sync throw is also a rejection of the probe.
      }
    }

    // Still LOCKED after all probes.
    const reloaded = await store.getById(instance.packetInstanceId);
    expect(reloaded?.status).toBe('LOCKED');
    expect(reloaded?.revision).toBe(instance.revision);
  });

  it('serializes concurrent update() calls: exactly one succeeds for the same expectedRevision', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'concurrent-1', workflowInstanceId: 'wf-concurrent-1' }),
    );
    const N = 12;
    const expectedRevision = instance.revision;

    const results = await Promise.allSettled(
      Array.from({ length: N }, (_, i) =>
        store.update(instance.packetInstanceId, expectedRevision, {
          warningIds: [`w-${i}`],
        }),
      ),
    );

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(N - 1);

    for (const r of rejected) {
      expect(r.status).toBe('rejected');
      if (r.status === 'rejected') {
        expect(r.reason).toBeInstanceOf(StaleWriteError);
      }
    }

    const finalDoc = await store.getById(instance.packetInstanceId);
    expect(finalDoc?.revision).toBe(expectedRevision + 1);
    // Winner wrote exactly one warning id.
    expect(finalDoc?.warningIds).toHaveLength(1);
  });

  it('drains the per-packet update-chain map after writers settle (no unbounded growth)', async () => {
    const { getActiveUpdateChainCount } = await import('./store.js');
    const { instance } = await store.createPacketInstance(baseInput());
    let doc = await store.getById(instance.packetInstanceId);
    for (let i = 0; i < 3; i++) {
      const updated = await store.update(instance.packetInstanceId, doc!.revision, {
        warningIds: [`w-${i}`],
      });
      doc = updated;
    }
    // Failed writers must also drain.
    await expect(
      store.update(instance.packetInstanceId, -999, { warningIds: ['stale'] }),
    ).rejects.toBeInstanceOf(StaleWriteError);
    // Cleanup runs on a microtask after the settled promise; flush it.
    await new Promise((r) => setTimeout(r, 0));
    expect(getActiveUpdateChainCount()).toBe(0);
  });

  it('a subclass overriding getById/readDoc cannot spoof the LOCKED check (authoritative read)', async () => {
    const { instance } = await store.createPacketInstance(baseInput({ status: 'LOCKED' }));
    const forged = { ...(await store.getById(instance.packetInstanceId))!, status: 'DRAFT_GENERATED' };

    class SpoofingStore extends FileLocalPacketStore {
      override async getById(): Promise<typeof forged> {
        return forged; // lies: reports the LOCKED packet as an unlocked draft
      }
    }
    const evil = new SpoofingStore(cacheRoot);
    await expect(
      evil.update(instance.packetInstanceId, instance.revision, { warningIds: ['x'] }),
    ).rejects.toBeInstanceOf(LockedPacketError);

    // And a store object that never ran the constructor registration must be refused outright.
    const unregistered = Object.create(FileLocalPacketStore.prototype) as FileLocalPacketStore;
    await expect(
      FileLocalPacketStore.prototype.update.call(
        unregistered,
        instance.packetInstanceId,
        instance.revision,
        { warningIds: ['x'] },
      ),
    ).rejects.toThrow(/Unrecognized store instance/);
  });

  it('uses the constructor-registered directory even if a dir property is mutated', async () => {
    const otherRoot = makeTempDir('packet-dir-poison-');
    try {
      const { instance } = await store.createPacketInstance(
        baseInput({
          packetInstanceId: 'dir-poison-1',
          eventInstanceId: 'dir-poison-1',
          workflowInstanceId: 'wf-dir-poison-1',
        }),
      );
      (store as unknown as { dir: string }).dir = otherRoot;

      const updated = await store.update(instance.packetInstanceId, instance.revision, {
        warningIds: ['still-original-root'],
      });

      const originalFile = path.join(cacheRoot, `${instance.packetInstanceId}.json`);
      const redirectedFile = path.join(otherRoot, `${instance.packetInstanceId}.json`);
      expect(fs.existsSync(originalFile)).toBe(true);
      expect(fs.existsSync(redirectedFile)).toBe(false);

      const originalDoc = JSON.parse(fs.readFileSync(originalFile, 'utf8')) as {
        revision: number;
        warningIds: string[];
      };
      expect(originalDoc.revision).toBe(updated.revision);
      expect(originalDoc.warningIds).toEqual(['still-original-root']);
    } finally {
      fs.rmSync(otherRoot, { recursive: true, force: true });
    }
  });
});
