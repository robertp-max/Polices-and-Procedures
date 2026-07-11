/**
 * WP-1.3 mandated-event packet map + template registry tests.
 * Acceptance §23.1.3 — all known mandated events mapped or explicit gap.
 */

import { describe, expect, it } from 'vitest';

import type { RegulatoryEvent } from '@/policy/data/regulatoryEvents';
import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { MANDATED_EVENTS_EXPANDED } from '@/policy/data/mandatedEventsExpanded';
import { MULTI_YEAR_EVENTS } from '@/policy/data/multiYearEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';

import type { PacketArchetypeId } from '../contracts';
import {
  EVENT_PACKET_MAP,
  getEventPacketDefinition,
  isKnownWorkflowId,
} from './eventPacketMap';
import {
  getTemplate,
  PACKET_TEMPLATES,
  templateArchetypeIds,
  templatesForEventFamily,
} from './templateRegistry';

const VALID_ARCHETYPES: ReadonlySet<PacketArchetypeId> = new Set([
  'meeting',
  'analytical-report',
  'pip-capa',
  'incident-investigation',
  'survey-response',
  'employee-competency',
  'policy-lifecycle',
  'privacy-breach',
  'emergency-drill',
  'program-surveillance',
  'audit',
  'contract-vendor',
]);

function distinctFamiliesFromSources(): Set<string> {
  const families = new Set<string>();
  const sources: readonly (readonly RegulatoryEvent[])[] = [
    REGULATORY_EVENTS,
    MANDATED_EVENTS_EXPANDED,
    MULTI_YEAR_EVENTS,
  ];
  for (const src of sources) {
    for (const e of src) {
      if (e.eventSubType) families.add(e.eventSubType);
    }
  }
  return families;
}

describe('eventPacketMap — §23.1.3 coverage', () => {
  it('has a map entry for every distinct event family across the three sources (mapped or explicit gap)', () => {
    const families = distinctFamiliesFromSources();
    expect(families.size).toBeGreaterThan(0);

    const mapped = new Set(EVENT_PACKET_MAP.map((d) => d.eventFamilyId));
    const missing: string[] = [];
    for (const id of families) {
      if (!mapped.has(id)) missing.push(id);
    }
    expect(missing, `Unmapped families: ${missing.join(', ')}`).toEqual([]);
    expect(EVENT_PACKET_MAP.length).toBe(families.size);
  });

  it("every resolved entry's canonicalWorkflowId exists in WORKFLOWS", () => {
    const resolved = EVENT_PACKET_MAP.filter((d) => d.status === 'resolved');
    expect(resolved.length).toBeGreaterThan(0);
    for (const d of resolved) {
      expect(
        d.canonicalWorkflowId,
        `${d.eventFamilyId} resolved but missing canonicalWorkflowId`,
      ).toBeTruthy();
      expect(
        WORKFLOWS[d.canonicalWorkflowId],
        `${d.eventFamilyId} resolved workflow ${d.canonicalWorkflowId} not in WORKFLOWS`,
      ).toBeDefined();
      expect(isKnownWorkflowId(d.canonicalWorkflowId)).toBe(true);
    }
  });

  it('QAPI quarterly family resolves to qapi-quarterly template and analytical-report archetype', () => {
    const def = getEventPacketDefinition('qapi_meeting');
    expect(def).toBeDefined();
    expect(def!.archetypeId).toBe('analytical-report');

    const templates = templatesForEventFamily('qapi_meeting');
    const ids = templates.map((t) => t.packet_template_id);
    expect(ids).toContain('qapi-quarterly');

    const quarterly = getTemplate('qapi-quarterly');
    expect(quarterly).toBeDefined();
    expect(quarterly!.packet_archetype_id).toBe('analytical-report');
    expect(quarterly!.availability).toBe('Available');
    expect(quarterly!.compatible_event_family_ids).toContain('qapi_meeting');
  });

  it('no template references a non-existent archetype id', () => {
    for (const archetypeId of templateArchetypeIds()) {
      expect(VALID_ARCHETYPES.has(archetypeId), `Unknown archetype: ${archetypeId}`).toBe(
        true,
      );
    }
    for (const t of PACKET_TEMPLATES) {
      expect(VALID_ARCHETYPES.has(t.packet_archetype_id)).toBe(true);
    }
    for (const d of EVENT_PACKET_MAP) {
      expect(VALID_ARCHETYPES.has(d.archetypeId), d.eventFamilyId).toBe(true);
    }
  });

  it('Available QAPI templates expose full FR-001 selection output fields', () => {
    for (const id of ['qapi-quarterly', 'qapi-monthly'] as const) {
      const t = getTemplate(id);
      expect(t).toBeDefined();
      expect(t!.packet_archetype_id).toBe('analytical-report');
      expect(t!.packet_template_id).toBe(id);
      expect(t!.compatible_event_family_ids.length).toBeGreaterThan(0);
      expect(t!.compatible_workflow_ids.length).toBeGreaterThan(0);
      expect(t!.required_modules.length).toBeGreaterThan(0);
      expect(t!.required_analyses.length).toBeGreaterThan(0);
      expect(t!.required_forms.length).toBeGreaterThan(0);
      expect(t!.required_approvers.length).toBeGreaterThan(0);
      expect(t!.required_signers.length).toBeGreaterThan(0);
      expect(t!.completion_gates.length).toBeGreaterThan(0);
      expect(t!.retention_rule.length).toBeGreaterThan(0);
      expect(t!.confidentiality_rule.length).toBeGreaterThan(0);
      expect(t!.Drive_destination_pattern.length).toBeGreaterThan(0);
      expect(t!.availability).toBe('Available');
    }
  });

  it('§7.2 P0 templates exist with Planned or Needs configuration status', () => {
    const p0Ids = [
      'governing-body-meeting',
      'annual-qapi',
      'pip-capa',
      'incident-rca',
      'survey-poc',
      'onboarding-competency',
    ] as const;
    for (const id of p0Ids) {
      const t = getTemplate(id);
      expect(t, id).toBeDefined();
      expect(['Planned', 'Needs configuration']).toContain(t!.availability);
      expect(t!.rolloutTier).toBe('P0');
      expect(VALID_ARCHETYPES.has(t!.packet_archetype_id)).toBe(true);
    }
  });

  it('gap and needs-review entries always carry a gapReason', () => {
    for (const d of EVENT_PACKET_MAP) {
      if (d.status === 'gap' || d.status === 'needs-review') {
        expect(
          d.gapReason && d.gapReason.length > 0,
          `${d.eventFamilyId} ${d.status} missing gapReason`,
        ).toBeTruthy();
      }
    }
  });
});
