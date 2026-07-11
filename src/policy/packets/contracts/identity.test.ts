/**
 * WP-0.1 identity key builder unit tests.
 */
import { describe, expect, it } from 'vitest';
import {
  buildOptimisticConcurrencyStamp,
  buildPacketIdentityKey,
  buildWorkflowActivationKey,
  PACKET_KEY_SEPARATOR,
  readContentHash,
  readPacketVersion,
} from './identity';

describe('buildPacketIdentityKey (FR-004)', () => {
  it('is deterministic for the same parts', () => {
    const parts = {
      agency_id: 'agency-1',
      event_instance_id: 'evt-99',
      workflow_instance_id: 'wf-inst-3',
      packet_template_id: 'tpl-qapi-quarterly',
    };
    expect(buildPacketIdentityKey(parts)).toBe(buildPacketIdentityKey(parts));
  });

  it('joins parts in FR-004 fixed order with the canonical separator', () => {
    const key = buildPacketIdentityKey({
      agency_id: 'A',
      event_instance_id: 'E',
      workflow_instance_id: 'W',
      packet_template_id: 'T',
    });
    expect(key).toBe(['A', 'E', 'W', 'T'].join(PACKET_KEY_SEPARATOR));
  });

  it('is order-insensitive w.r.t. object property insertion order', () => {
    const a = buildPacketIdentityKey({
      agency_id: 'agency-1',
      event_instance_id: 'evt-1',
      workflow_instance_id: 'wf-1',
      packet_template_id: 'tpl-1',
    });
    const b = buildPacketIdentityKey({
      packet_template_id: 'tpl-1',
      workflow_instance_id: 'wf-1',
      event_instance_id: 'evt-1',
      agency_id: 'agency-1',
    });
    expect(a).toBe(b);
  });

  it('trims surrounding whitespace but does not invent values', () => {
    const key = buildPacketIdentityKey({
      agency_id: '  agency-1  ',
      event_instance_id: 'evt-1',
      workflow_instance_id: 'wf-1',
      packet_template_id: 'tpl-1',
    });
    expect(key.startsWith('agency-1' + PACKET_KEY_SEPARATOR)).toBe(true);
  });

  it('throws when any part is missing, empty, or whitespace-only', () => {
    expect(() =>
      buildPacketIdentityKey({
        agency_id: '',
        event_instance_id: 'e',
        workflow_instance_id: 'w',
        packet_template_id: 't',
      }),
    ).toThrow(/agency_id/);

    expect(() =>
      buildPacketIdentityKey({
        agency_id: 'a',
        event_instance_id: '   ',
        workflow_instance_id: 'w',
        packet_template_id: 't',
      }),
    ).toThrow(/event_instance_id/);

    expect(() =>
      buildPacketIdentityKey({
        agency_id: 'a',
        event_instance_id: 'e',
        workflow_instance_id: null as unknown as string,
        packet_template_id: 't',
      }),
    ).toThrow(/workflow_instance_id/);
  });

  it('never converts missing parts to zero or empty defaults', () => {
    expect(() =>
      buildPacketIdentityKey({
        agency_id: 'a',
        event_instance_id: 'e',
        workflow_instance_id: 'w',
        packet_template_id: undefined as unknown as string,
      }),
    ).toThrow(/packet_template_id/);
    // Ensure we did not silently produce a partial key
    expect(() =>
      buildPacketIdentityKey({
        agency_id: '0',
        event_instance_id: '0',
        workflow_instance_id: '0',
        packet_template_id: '',
      }),
    ).toThrow();
  });
});

describe('buildWorkflowActivationKey (FR-014)', () => {
  it('is deterministic and order-insensitive', () => {
    const a = buildWorkflowActivationKey({
      agency_id: 'agency-1',
      reporting_period: '2026-Q2',
      finding_id: 'f-10',
      trigger_rule_id: 'tr-pip-1',
      canonical_workflow_id: 'QA-WF-04',
    });
    const b = buildWorkflowActivationKey({
      canonical_workflow_id: 'QA-WF-04',
      trigger_rule_id: 'tr-pip-1',
      finding_id: 'f-10',
      reporting_period: '2026-Q2',
      agency_id: 'agency-1',
    });
    expect(a).toBe(b);
    expect(a.split(PACKET_KEY_SEPARATOR)).toEqual([
      'agency-1',
      '2026-Q2',
      'f-10',
      'tr-pip-1',
      'QA-WF-04',
    ]);
  });

  it('throws on empty finding_id rather than defaulting', () => {
    expect(() =>
      buildWorkflowActivationKey({
        agency_id: 'agency-1',
        reporting_period: '2026-Q2',
        finding_id: '',
        trigger_rule_id: 'tr-1',
        canonical_workflow_id: 'WF-1',
      }),
    ).toThrow(/finding_id/);
  });
});

describe('packet version / hash helpers', () => {
  it('reads version without defaulting missing values to zero', () => {
    expect(readPacketVersion({ packetVersion: 3, contentHash: 'abc' })).toBe(3);
    expect(() =>
      readPacketVersion({ packetVersion: Number.NaN, contentHash: null }),
    ).toThrow(/packetVersion/);
    expect(() =>
      readPacketVersion({
        packetVersion: undefined as unknown as number,
        contentHash: null,
      }),
    ).toThrow(/packetVersion/);
  });

  it('reads contentHash null as null (not empty string or zero)', () => {
    expect(readContentHash({ packetVersion: 1, contentHash: null })).toBeNull();
    expect(readContentHash({ packetVersion: 1, contentHash: 'deadbeef' })).toBe(
      'deadbeef',
    );
    expect(() =>
      readContentHash({ packetVersion: 1, contentHash: '   ' }),
    ).toThrow(/contentHash/);
  });

  it('builds optimistic concurrency stamps without inventing fields', () => {
    const stamp = buildOptimisticConcurrencyStamp({
      packetInstanceId: 'pkt-1',
      packetVersion: 4,
      contentHash: null,
      observedUpdatedAt: '2026-07-10T12:00:00.000Z',
    });
    expect(stamp).toEqual({
      packetInstanceId: 'pkt-1',
      expectedVersion: 4,
      expectedContentHash: null,
      observedUpdatedAt: '2026-07-10T12:00:00.000Z',
    });
    expect(() =>
      buildOptimisticConcurrencyStamp({
        packetInstanceId: '',
        packetVersion: 1,
        contentHash: null,
        observedUpdatedAt: '2026-07-10T12:00:00.000Z',
      }),
    ).toThrow(/packetInstanceId/);
  });
});
