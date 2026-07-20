/**
 * WP-1.1 registry integrity tests.
 */
import { describe, expect, it } from 'vitest';
import type { PacketModuleId } from '@/policy/packets/contracts';
import {
  ALL_ARCHETYPES,
  getArchetype,
} from './archetypeRegistry';
import {
  assertAnalysisBeforeForms,
  getModule,
  hasModule,
} from './moduleRegistry';
import {
  getRenderingProfile,
  hasRenderingProfile,
} from './renderingProfiles';

const EXPECTED_ARCHETYPE_IDS = [
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
] as const;

const ANALYTICAL_ORDER_ARCHETYPES = new Set(['analytical-report', 'meeting']);

function orderedModulesForArchetype(archetypeId: (typeof EXPECTED_ARCHETYPE_IDS)[number]): PacketModuleId[] {
  const arch = getArchetype(archetypeId);
  return [...arch.requiredModules, ...arch.optionalModules];
}

describe('WP-1.1 archetype registry', () => {
  it('registers exactly 12 archetypes', () => {
    expect(ALL_ARCHETYPES).toHaveLength(12);
    expect(ALL_ARCHETYPES.map((a) => a.archetypeId)).toEqual([...EXPECTED_ARCHETYPE_IDS]);
  });

  it('every archetype is resolvable by getArchetype', () => {
    for (const id of EXPECTED_ARCHETYPE_IDS) {
      expect(getArchetype(id).archetypeId).toBe(id);
    }
  });

  it("every archetype's modules exist in the module registry", () => {
    for (const arch of ALL_ARCHETYPES) {
      const all = [...arch.requiredModules, ...arch.optionalModules];
      for (const moduleId of all) {
        expect(hasModule(moduleId)).toBe(true);
        expect(getModule(moduleId).id).toBe(moduleId);
      }
    }
  });

  it('every analytical-report and meeting archetype passes assertAnalysisBeforeForms', () => {
    for (const arch of ALL_ARCHETYPES) {
      if (!ANALYTICAL_ORDER_ARCHETYPES.has(arch.archetypeId)) continue;
      const ordered = orderedModulesForArchetype(arch.archetypeId);
      expect(() => assertAnalysisBeforeForms(ordered)).not.toThrow();
    }
  });

  it('every archetype resolves a rendering profile', () => {
    for (const arch of ALL_ARCHETYPES) {
      expect(arch.renderingProfileId.length).toBeGreaterThan(0);
      expect(hasRenderingProfile(arch.renderingProfileId)).toBe(true);
      const profile = getRenderingProfile(arch.renderingProfileId);
      expect(profile.profileId).toBe(arch.renderingProfileId);
      expect(profile.pageSize).toBe('letter');
    }
  });

  it('all policy id fields are non-empty kebab-case stable ids', () => {
    const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const arch of ALL_ARCHETYPES) {
      expect(arch.signaturePolicyId.length).toBeGreaterThan(0);
      expect(arch.approvalPolicyId.length).toBeGreaterThan(0);
      expect(arch.lockPolicyId.length).toBeGreaterThan(0);
      expect(arch.signaturePolicyId).toMatch(kebab);
      expect(arch.approvalPolicyId).toMatch(kebab);
      expect(arch.lockPolicyId).toMatch(kebab);
    }
  });

  it('every archetype has non-empty allowedSubtypes and classification/retention', () => {
    for (const arch of ALL_ARCHETYPES) {
      expect(arch.allowedSubtypes.length).toBeGreaterThan(0);
      expect(arch.defaultClassification.length).toBeGreaterThan(0);
      expect(arch.defaultRetentionRule.length).toBeGreaterThan(0);
      expect(arch.title.length).toBeGreaterThan(0);
      expect(arch.description.length).toBeGreaterThan(0);
      expect(arch.requiredModules.length).toBeGreaterThan(0);
    }
  });
});

describe('WP-1.1 analysis-before-forms helper', () => {
  it('throws when an analysis module appears after a forms module', () => {
    const inverted: PacketModuleId[] = [
      'supporting-forms-and-evidence',
      'analytical-findings',
    ];
    expect(() => assertAnalysisBeforeForms(inverted)).toThrow(/before forms/i);
  });

  it('passes when analysis precedes forms', () => {
    const ordered: PacketModuleId[] = [
      'executive-summary-or-analysis',
      'analytical-findings',
      'supporting-forms-and-evidence',
    ];
    expect(() => assertAnalysisBeforeForms(ordered)).not.toThrow();
  });
});
