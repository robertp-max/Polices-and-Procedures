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
  configurePacketAuditLedger,
  getConfiguredPacketAuditLedgerPath,
  packetAuditStreamKey,
  queryPacketAuditEvents,
  resetPacketAuditLedger,
} from './auditEvents.js';
import {
  FileLocalPacketStore,
  ForbiddenFieldError,
  ImmutableIdentityError,
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
    configurePacketAuditLedger({ ledgerPath });
    store = new FileLocalPacketStore(cacheRoot);
    realLedgerMtimeBefore = fs.existsSync(REAL_AUDIT_LEDGER)
      ? fs.statSync(REAL_AUDIT_LEDGER).mtimeMs
      : null;
  });

  afterEach(() => {
    resetPacketAuditLedger();
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
    expect(getConfiguredPacketAuditLedgerPath()).toBe(path.resolve(ledgerPath));

    const created = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'audit-mut-1', workflowInstanceId: 'wf-audit-1' }),
    );
    const id = created.instance.packetInstanceId;
    const stream = packetAuditStreamKey(id);

    const afterCreate = await queryPacketAuditEvents({ stream, limit: 100 });
    assertAuditSequence(afterCreate, ['packet.template_selected']);

    const updated = await store.update(id, created.instance.revision, {
      warningIds: ['w-audit'],
    });
    const afterUpdate = await queryPacketAuditEvents({ stream, limit: 100 });
    assertAuditSequence(afterUpdate, ['packet.template_selected', 'packet.edited']);

    await store.update(id, updated.revision, { blockerIds: ['b1'] });
    const afterSecond = await queryPacketAuditEvents({ stream, limit: 100 });
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

  it('does not export any privileged LOCKED-mutation handle', async () => {
    const storeMod = await import('./store.js');
    const lifeMod = await import('./lifecycle.js');

    // Explicit ban-list from QA: these must not appear on the public surface.
    for (const name of [
      '_lifecycleUpdate',
      '__applyLifecycleUpdate',
      'applyUpdate',
      'allowLockedMutation',
    ]) {
      expect(Object.prototype.hasOwnProperty.call(storeMod, name)).toBe(false);
      expect(Object.prototype.hasOwnProperty.call(lifeMod, name)).toBe(false);
    }

    const { instance } = await store.createPacketInstance(
      baseInput({
        status: 'LOCKED',
        eventInstanceId: 'export-lock-1',
        workflowInstanceId: 'wf-export-lock-1',
      }),
    );

    // Instance prototype / class must not expose __applyLifecycleUpdate.
    expect(
      typeof (store as unknown as { __applyLifecycleUpdate?: unknown }).__applyLifecycleUpdate,
    ).toBe('undefined');
    expect(
      typeof (FileLocalPacketStore.prototype as unknown as { __applyLifecycleUpdate?: unknown })
        .__applyLifecycleUpdate,
    ).toBe('undefined');

    /**
     * Enumerate exported values that are general-purpose mutators (not the
     * intentional amendment/supersession entry points) and assert LOCKED rejects.
     */
    const intentionalTerminalEntryPoints = new Set([
      'beginAmendment',
      'createSupersedingInstance',
    ]);

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
        { kind: 'user', actorId: 'u', actorRole: null, onBehalfOf: null },
      ),
    ).rejects.toBeInstanceOf(LockedPacketError);

    // Walk module exports: any other function that looks like a generic update
    // path with (store, id, rev, ...) must not succeed against LOCKED.
    for (const [modName, mod] of [
      ['store', storeMod],
      ['lifecycle', lifeMod],
    ] as const) {
      for (const [exportName, value] of Object.entries(mod)) {
        if (intentionalTerminalEntryPoints.has(exportName)) continue;
        if (typeof value !== 'function') continue;
        // Skip constructors / error classes / pure helpers.
        if (
          exportName.endsWith('Error') ||
          exportName.startsWith('assert') ||
          exportName === 'FileLocalPacketStore' ||
          exportName === 'userPacketActor' ||
          exportName === 'systemPacketActor'
        ) {
          continue;
        }
        // Generic mutators we already covered; ensure no surprise export named update*.
        if (/update|mutate|write|apply/i.test(exportName) && exportName !== 'beginAmendment') {
          // If someone reintroduces a privileged export, calling it must not
          // silently succeed — either it rejects LOCKED or does not exist.
          const fn = value as (...args: unknown[]) => unknown;
          try {
            const result = fn(
              store,
              instance.packetInstanceId,
              instance.revision,
              { warningIds: ['probe'] },
              {},
            );
            if (result && typeof (result as Promise<unknown>).then === 'function') {
              await expect(result as Promise<unknown>).rejects.toBeTruthy();
            }
          } catch {
            // Sync throw is also a rejection of the probe.
          }
          void modName;
        }
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
});
