import { describe, it, expect } from 'vitest';
import { REGULATORY_EVENTS } from './regulatoryEvents';
import {
  BRAD_MANDATED_EVENT_INTAKES,
  EVENT_ID_TO_BRAD_INTAKE_ID,
  getBradIntakeForEvent,
  getBradIntakeById,
} from './bradMandatedEventIntakes.generated';

// Regression checks for scripts/buildBradMandatedEventIntakes.ts output — catches
// drift if REGULATORY_EVENTS/WORKFLOWS/forms change without re-running the
// generator (`npm run build:brad-intakes`).

describe('Brad mandated event intake generation', () => {
  it('accounts for every dated event occurrence — none silently dropped', () => {
    for (const event of REGULATORY_EVENTS) {
      expect(EVENT_ID_TO_BRAD_INTAKE_ID[event.id], `event ${event.id} has no intake mapping`).toBeDefined();
      expect(getBradIntakeForEvent(event.id)).not.toBeNull();
    }
  });

  it('produces one definition per recurring event family, not per dated occurrence', () => {
    expect(BRAD_MANDATED_EVENT_INTAKES.length).toBeGreaterThan(0);
    expect(BRAD_MANDATED_EVENT_INTAKES.length).toBeLessThan(REGULATORY_EVENTS.length);
  });

  it('every definition includes the 8 generic intake sections', () => {
    const expectedSections = [
      'event_control', 'source_files', 'required_forms', 'evidence_requirements',
      'extracted_field_review', 'missing_information', 'signoff_attestation', 'audit_trail',
    ];
    for (const def of BRAD_MANDATED_EVENT_INTAKES) {
      expect(def.sections.map((s) => s.sectionId)).toEqual(expectedSections);
    }
  });

  it('QAPI-domain definitions use the qapi extraction template kind', () => {
    const qapiDefs = BRAD_MANDATED_EVENT_INTAKES.filter((d) => d.eventDomain === 'QAPI');
    expect(qapiDefs.length).toBeGreaterThan(0);
    for (const def of qapiDefs) expect(def.extractionTemplateKind).toBe('qapi');
  });

  it('packetSectionMap only references real QA-FM-020..027 form IDs actually present in requiredForms', () => {
    for (const def of BRAD_MANDATED_EVENT_INTAKES) {
      const requiredFormIds = new Set(def.requiredForms.map((f) => f.formId));
      for (const mapping of def.packetSectionMap) {
        for (const formId of mapping.formIds) {
          expect(requiredFormIds.has(formId), `${def.intakeId} maps packet section to ${formId} not in its own requiredForms`).toBe(true);
        }
      }
    }
  });

  it('readinessRules only point at bundleSchema paths that actually exist', () => {
    for (const def of BRAD_MANDATED_EVENT_INTAKES) {
      const bundlePaths = new Set(def.bundleSchema.map((f) => f.path));
      for (const rule of def.readinessRules) {
        for (const path of rule.requiresPaths) {
          expect(bundlePaths.has(path), `${def.intakeId} readiness rule ${rule.ruleId} references unknown bundle path ${path}`).toBe(true);
        }
      }
    }
  });

  it('getBradIntakeById round-trips every generated intakeId', () => {
    for (const def of BRAD_MANDATED_EVENT_INTAKES) {
      expect(getBradIntakeById(def.intakeId)?.intakeId).toBe(def.intakeId);
    }
  });
});
