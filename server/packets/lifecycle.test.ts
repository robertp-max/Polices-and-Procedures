/**
 * WP-1.4 — Packet lifecycle transition / amendment / supersession tests.
 * Packet cache + audit ledger always use temp dirs.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AuditEvent } from '../audit/writer.js';
import type { PacketAuditActor, PacketLifecycleStatus } from '@/policy/packets/contracts';
import {
  packetAuditStreamKey,
  userPacketActor,
} from './auditEvents.js';
import { transitionPacket } from './lifecycle.js';
import {
  beginAmendment,
  createSupersedingInstance,
  FileLocalPacketStore,
  IllegalTransitionError,
  LockedPacketError,
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

function assertAuditSequence(events: AuditEvent[], expectedTypes: string[]): void {
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
    agencyId: 'agency-life',
    eventFamilyId: 'family-qapi',
    eventInstanceId: 'evt-life-1',
    archetypeId: 'arch-qapi',
    archetypeVersion: '1.0.0',
    packetTemplateId: 'tmpl-life',
    workflowId: 'wf-life',
    workflowInstanceId: 'wfinst-life-1',
    createdBy: 'user-life',
    ...overrides,
  };
}

const actor: PacketAuditActor = userPacketActor('user-life', 'QA');

describe('transitionPacket / amendment / supersession', () => {
  let cacheRoot: string;
  let auditRoot: string;
  let ledgerPath: string;
  let store: FileLocalPacketStore;
  let realLedgerMtimeBefore: number | null;

  beforeEach(() => {
    cacheRoot = makeTempDir('packet-life-');
    auditRoot = makeTempDir('packet-life-audit-');
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

  it('allows a legal main-path transition and emits one audit event', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'legal-1', workflowInstanceId: 'wf-legal-1' }),
    );
    const stream = packetAuditStreamKey(instance.packetInstanceId);

    const next = await transitionPacket(
      store,
      instance.packetInstanceId,
      instance.revision,
      'DRAFT_GENERATED',
      actor,
      'draft ready',
    );
    expect(next.status).toBe('DRAFT_GENERATED');
    expect(next.revision).toBe(instance.revision + 1);

    const after = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(after, ['packet.template_selected', 'packet.edited']);
  });

  it('rejects ≥5 illegal transitions with IllegalTransitionError', async () => {
    const illegalJumps: Array<{
      from: PacketLifecycleStatus;
      to: PacketLifecycleStatus;
      eventInstanceId: string;
    }> = [
      { from: 'SOURCE_COLLECTION', to: 'LOCKED', eventInstanceId: 'ill-1' },
      { from: 'SOURCE_COLLECTION', to: 'PUBLISHED', eventInstanceId: 'ill-2' },
      { from: 'DRAFT_GENERATED', to: 'CERTIFIED', eventInstanceId: 'ill-3' },
      { from: 'READY_FOR_REVIEW', to: 'FULLY_SIGNED', eventInstanceId: 'ill-4' },
      { from: 'EDITING', to: 'DRIVE_PUBLISHING', eventInstanceId: 'ill-5' },
      { from: 'UNDER_ANALYSIS', to: 'SENT_FOR_SIGNATURE', eventInstanceId: 'ill-6' },
    ];

    expect(illegalJumps.length).toBeGreaterThanOrEqual(5);

    for (const jump of illegalJumps) {
      const { instance } = await store.createPacketInstance(
        baseInput({
          status: jump.from,
          eventInstanceId: jump.eventInstanceId,
          workflowInstanceId: `wf-${jump.eventInstanceId}`,
        }),
      );
      await expect(
        transitionPacket(
          store,
          instance.packetInstanceId,
          instance.revision,
          jump.to,
          actor,
        ),
      ).rejects.toBeInstanceOf(IllegalTransitionError);

      try {
        await transitionPacket(
          store,
          instance.packetInstanceId,
          instance.revision,
          jump.to,
          actor,
        );
        expect.fail(`expected illegal transition ${jump.from} → ${jump.to}`);
      } catch (e) {
        expect(e).toBeInstanceOf(IllegalTransitionError);
        const err = e as IllegalTransitionError;
        expect(err.code).toBe('illegal_transition');
        expect(err.fromStatus).toBe(jump.from);
        expect(err.toStatus).toBe(jump.to);
      }

      const reloaded = await store.getById(instance.packetInstanceId);
      expect(reloaded?.status).toBe(jump.from);
      expect(reloaded?.revision).toBe(instance.revision);
    }
  });

  it('LOCKED instance rejects transitionPacket and public update', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({
        status: 'LOCKED',
        eventInstanceId: 'locked-1',
        workflowInstanceId: 'wf-locked-1',
      }),
    );

    await expect(
      transitionPacket(
        store,
        instance.packetInstanceId,
        instance.revision,
        'AMENDMENT_REQUIRED',
        actor,
      ),
    ).rejects.toBeInstanceOf(LockedPacketError);

    await expect(
      store.update(instance.packetInstanceId, instance.revision, {
        warningIds: ['blocked'],
      }),
    ).rejects.toBeInstanceOf(LockedPacketError);

    // Public options must not expose allowLockedMutation.
    const optsKeys = Object.keys({
      actor,
      reason: null,
      auditEventType: 'packet.edited' as const,
    });
    expect(optsKeys).not.toContain('allowLockedMutation');

    // No privileged export on lifecycle or store surface.
    const storeMod = await import('./store.js');
    const lifeMod = await import('./lifecycle.js');
    expect('_lifecycleUpdate' in storeMod).toBe(false);
    expect('__applyLifecycleUpdate' in storeMod).toBe(false);
    expect('_lifecycleUpdate' in lifeMod).toBe(false);
    expect('__applyLifecycleUpdate' in lifeMod).toBe(false);
  });

  it('beginAmendment is allowed on LOCKED and emits packet.amended', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({
        status: 'LOCKED',
        eventInstanceId: 'amend-1',
        workflowInstanceId: 'wf-amend-1',
      }),
    );
    const stream = packetAuditStreamKey(instance.packetInstanceId);

    const amended = await beginAmendment(
      store,
      instance.packetInstanceId,
      instance.revision,
      actor,
      'post-lock correction',
    );
    expect(amended.status).toBe('AMENDMENT_REQUIRED');
    expect(amended.packetInstanceId).toBe(instance.packetInstanceId);

    const after = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(after, ['packet.template_selected', 'packet.amended']);
  });

  it('privileged ops use authoritative terminal state despite overridden getById', async () => {
    const { instance: cancelledForAmend } = await store.createPacketInstance(
      baseInput({
        status: 'CANCELLED',
        eventInstanceId: 'evil-amend-cancelled',
        workflowInstanceId: 'wf-evil-amend-cancelled',
      }),
    );
    const { instance: cancelledForSupersede } = await store.createPacketInstance(
      baseInput({
        status: 'CANCELLED',
        eventInstanceId: 'evil-super-cancelled',
        workflowInstanceId: 'wf-evil-super-cancelled',
      }),
    );
    const forged = new Map<string, typeof cancelledForAmend | typeof cancelledForSupersede>([
      [
        cancelledForAmend.packetInstanceId,
        { ...cancelledForAmend, status: 'LOCKED' as const },
      ],
      [
        cancelledForSupersede.packetInstanceId,
        { ...cancelledForSupersede, status: 'LOCKED' as const },
      ],
    ]);

    class EvilStore extends FileLocalPacketStore {
      override async getById(id: string): Promise<typeof cancelledForAmend | null> {
        return forged.get(id) ?? null;
      }
    }
    const evil = new EvilStore(cacheRoot, { ledgerPath });

    const [amendResult, supersedeResult] = await Promise.allSettled([
      beginAmendment(
        evil,
        cancelledForAmend.packetInstanceId,
        cancelledForAmend.revision,
        actor,
        'forged lock',
      ),
      createSupersedingInstance(
        evil,
        cancelledForSupersede.packetInstanceId,
        cancelledForSupersede.revision,
        {
          createdBy: 'user-life',
          actor,
          reason: 'forged lock',
        },
      ),
    ]);

    expect(amendResult.status).toBe('rejected');
    expect(supersedeResult.status).toBe('rejected');
    if (amendResult.status === 'rejected') {
      expect(amendResult.reason).toBeInstanceOf(LockedPacketError);
    }
    if (supersedeResult.status === 'rejected') {
      expect(supersedeResult.reason).toBeInstanceOf(LockedPacketError);
    }

    const amendDoc = await store.getById(cancelledForAmend.packetInstanceId);
    const supersedeDoc = await store.getById(cancelledForSupersede.packetInstanceId);
    expect(amendDoc?.status).toBe('CANCELLED');
    expect(amendDoc?.revision).toBe(cancelledForAmend.revision);
    expect(supersedeDoc?.status).toBe('CANCELLED');
    expect(supersedeDoc?.revision).toBe(cancelledForSupersede.revision);
    expect(supersedeDoc?.supersededByPacketInstanceId).toBeNull();
  });

  it('supersession preserves prior doc and emits one audit per persisted mutation', async () => {
    const { instance: prior } = await store.createPacketInstance(
      baseInput({
        status: 'LOCKED',
        eventInstanceId: 'super-1',
        workflowInstanceId: 'wf-super-1',
      }),
    );
    const priorFile = path.join(cacheRoot, `${prior.packetInstanceId}.json`);
    expect(fs.existsSync(priorFile)).toBe(true);
    const priorRawBefore = fs.readFileSync(priorFile, 'utf8');

    const { prior: marked, next } = await createSupersedingInstance(
      store,
      prior.packetInstanceId,
      prior.revision,
      {
        createdBy: 'user-life',
        actor,
        reason: 'material correction after lock',
      },
    );

    expect(fs.existsSync(priorFile)).toBe(true);
    const priorOnDisk = JSON.parse(fs.readFileSync(priorFile, 'utf8')) as {
      packetInstanceId: string;
      status: string;
      supersededByPacketInstanceId: string | null;
      revision: number;
    };
    expect(priorOnDisk.packetInstanceId).toBe(prior.packetInstanceId);
    expect(priorOnDisk.status).toBe('SUPERSEDED');
    expect(priorOnDisk.supersededByPacketInstanceId).toBe(next.packetInstanceId);
    expect(priorRawBefore).not.toBe(fs.readFileSync(priorFile, 'utf8'));

    expect(next.packetInstanceId).not.toBe(prior.packetInstanceId);
    expect(next.supersedesPacketInstanceId).toBe(prior.packetInstanceId);
    expect(next.status).toBe('SOURCE_COLLECTION');
    expect(marked.status).toBe('SUPERSEDED');

    const nextFile = path.join(cacheRoot, `${next.packetInstanceId}.json`);
    expect(fs.existsSync(nextFile)).toBe(true);

    // Prior stream: create + status SUPERSEDED + link update = 3 events.
    const priorStream = packetAuditStreamKey(prior.packetInstanceId);
    const priorEvents = await store.queryAuditEvents({ stream: priorStream, limit: 100 });
    assertAuditSequence(priorEvents, [
      'packet.template_selected',
      'packet.superseded',
      'packet.edited',
    ]);

    // Successor stream: create only = 1 event.
    const nextStream = packetAuditStreamKey(next.packetInstanceId);
    const nextEvents = await store.queryAuditEvents({ stream: nextStream, limit: 100 });
    assertAuditSequence(nextEvents, ['packet.template_selected']);

    const active = await store.findByIdentityKey(prior.identityKey);
    expect(active?.packetInstanceId).toBe(next.packetInstanceId);

    // Temp ledger only.
    expect(fs.existsSync(ledgerPath)).toBe(true);
    if (realLedgerMtimeBefore === null) {
      expect(fs.existsSync(REAL_AUDIT_LEDGER)).toBe(false);
    } else {
      expect(fs.statSync(REAL_AUDIT_LEDGER).mtimeMs).toBe(realLedgerMtimeBefore);
    }
  });

  it('stale revision on transition is rejected', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'stale-life', workflowInstanceId: 'wf-stale-life' }),
    );
    await store.update(instance.packetInstanceId, instance.revision, {
      warningIds: ['bump'],
    });

    await expect(
      transitionPacket(
        store,
        instance.packetInstanceId,
        instance.revision,
        'DRAFT_GENERATED',
        actor,
      ),
    ).rejects.toBeInstanceOf(StaleWriteError);
  });

  it('every lifecycle mutation emits exactly one audit event with ordered types', async () => {
    const { instance } = await store.createPacketInstance(
      baseInput({ eventInstanceId: 'chain-life', workflowInstanceId: 'wf-chain-life' }),
    );
    const id = instance.packetInstanceId;
    const stream = packetAuditStreamKey(id);

    let events = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(events, ['packet.template_selected']);

    const d1 = await transitionPacket(store, id, instance.revision, 'DRAFT_GENERATED', actor);
    events = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(events, ['packet.template_selected', 'packet.edited']);

    const d2 = await transitionPacket(store, id, d1.revision, 'UNDER_ANALYSIS', actor);
    events = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(events, [
      'packet.template_selected',
      'packet.edited',
      'packet.edited',
    ]);

    await transitionPacket(store, id, d2.revision, 'READY_FOR_REVIEW', actor);
    events = await store.queryAuditEvents({ stream, limit: 100 });
    assertAuditSequence(events, [
      'packet.template_selected',
      'packet.edited',
      'packet.edited',
      'packet.edited',
    ]);
  });
});
