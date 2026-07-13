/**
 * WP-5.2 — §25.6 behavioral architecture invariants (runtime, pure-domain).
 *
 * Complements the static scan in architecture.test.ts with the §25.6 conditions
 * that are enforced by contract/registry semantics rather than by file scanning:
 * locked immutability (recurring occurrence cannot overwrite), packet↔workflow-
 * instance linkage, and every mandated-event family mapped-or-explicit-gap.
 */
import { describe, expect, it } from 'vitest';
import {
  PACKET_LIFECYCLE_TRANSITIONS,
  isAllowedTransition,
  buildPacketIdentityKey,
  type PacketLifecycleStatus,
} from '@/policy/packets/contracts';
import {
  collectDistinctEventFamilies,
  getEventPacketDefinition,
  listUnresolvedOrGapEntries,
} from '@/policy/packets/registries/eventPacketMap';

describe('§25.6 invariant: locked / terminal states are immutable', () => {
  const TERMINALS: readonly PacketLifecycleStatus[] = ['LOCKED', 'CANCELLED', 'SUPERSEDED'];

  it.each(TERMINALS)('%s has no outgoing lifecycle transitions', (state) => {
    expect(PACKET_LIFECYCLE_TRANSITIONS[state]).toEqual([]);
  });

  it('a locked packet cannot transition to any other status (no overwrite)', () => {
    const everyStatus = Object.keys(PACKET_LIFECYCLE_TRANSITIONS) as PacketLifecycleStatus[];
    for (const to of everyStatus) {
      expect(isAllowedTransition('packet', 'LOCKED', to)).toBe(false);
    }
  });
});

describe('§25.6 invariant: a packet cannot be identified without workflow-instance linkage', () => {
  const base = {
    agency_id: 'agency-x',
    event_instance_id: 'evt-1',
    packet_template_id: 'qapi-quarterly',
  };

  it('builds a stable key when workflow-instance linkage is present', () => {
    const key = buildPacketIdentityKey({ ...base, workflow_instance_id: 'wf-inst-1' });
    expect(key).toContain('wf-inst-1');
  });

  it.each(['', '   ', undefined as unknown as string])(
    'rejects an identity key with missing workflow-instance linkage (%p)',
    (bad) => {
      expect(() => buildPacketIdentityKey({ ...base, workflow_instance_id: bad })).toThrow();
    },
  );
});

describe('§25.6 invariant: every mandated-event family is mapped or an explicit gap', () => {
  it('no distinct event family is silently unmapped', () => {
    const families = collectDistinctEventFamilies();
    const missing: string[] = [];
    for (const familyId of families.keys()) {
      if (getEventPacketDefinition(familyId) === null) missing.push(familyId);
    }
    expect(missing, `unmapped families: ${missing.join(', ')}`).toEqual([]);
  });

  it('unresolved/gap entries are explicitly marked (never a silent resolved)', () => {
    for (const entry of listUnresolvedOrGapEntries()) {
      expect(['needs-review', 'gap']).toContain(entry.status);
    }
  });
});
