import { describe, expect, it } from 'vitest';
import { QAPI_2026 } from './qapi2026.normalized';
import type { QapiQuarter } from '../model/qapi2026.types';
import {
  buildGbAnnualArc,
  buildGbDecisionDocket,
  buildGbQuarterPacket,
  buildPacketReadiness,
} from '../selectors/qapi2026Selectors';

const NAME_KEYS = ['firstName', 'first_name', 'lastName', 'last_name', 'patientName', 'name'];

function normalizedQuarters(): QapiQuarter[] {
  return Object.values(QAPI_2026.quarters).filter((q) => q.normalizationStatus === 'normalized');
}

describe('QAPI 2026 — structure (§11.1)', () => {
  it('has all four quarters and an annual summary', () => {
    expect(Object.keys(QAPI_2026.quarters).sort()).toEqual(['Q1', 'Q2', 'Q3', 'Q4']);
    expect(QAPI_2026.annual).toBeDefined();
    expect(QAPI_2026.year).toBe(2026);
  });

  it('every normalized record carries provenance', () => {
    for (const q of normalizedQuarters()) {
      const withProvenance = [...q.metrics, ...q.feederAudits, ...q.adverseEvents, ...q.infections, ...q.complaints, ...q.pipTriggers, ...q.pips, ...q.caps, ...q.disciplinaryMatters, ...q.gbEscalations, ...q.sourceSignoffs];
      for (const r of withProvenance) {
        expect(r.provenance).toBeDefined();
        expect(r.provenance.sourceFile).toContain('MOCK_2026_QAPI');
        expect(r.provenance.sourceRecordIds.length).toBeGreaterThan(0);
      }
    }
  });
});

describe('QAPI 2026 — preserved contradictions (§3.4)', () => {
  it('reports the cross-quarter clinician identity collision as a data-quality finding', () => {
    const f = QAPI_2026.validationFindings.find((x) => x.kind === 'identity_collision');
    expect(f).toBeDefined();
    expect(f!.severity).toBe('critical');
    expect(f!.originalValues.join(' ')).toMatch(/MOCK-CLIN/);
  });

  it('reports the Q1→Q2 census discontinuity without rewriting the numbers', () => {
    const f = QAPI_2026.validationFindings.find((x) => x.kind === 'census_discontinuity');
    expect(f).toBeDefined();
    // both recovered values preserved
    expect(QAPI_2026.quarters.Q1.population?.activeAtClose).toBe(120);
    expect(QAPI_2026.quarters.Q2.population?.activeAtStart).toBe(100);
    expect(f!.originalValues).toEqual(['Q1 active at close = 120', 'Q2 active at start = 100']);
  });
});

describe('QAPI 2026 — synthetic supplements (§3.5)', () => {
  it('labels every synthetic supplement and flags it for review', () => {
    expect(QAPI_2026.syntheticSupplements.length).toBeGreaterThanOrEqual(1);
    for (const s of QAPI_2026.syntheticSupplements) {
      expect(s.sourceKind).toBe('synthetic_supplement');
      expect(s.approvedForProduction).toBe(false);
      expect(s.reviewRequired).toBe(true);
      expect(s.supplementReason.length).toBeGreaterThan(0);
    }
  });

  it('keeps source-recovered and supplemental records distinguishable', () => {
    const kinds = new Set(normalizedQuarters().flatMap((q) => q.metrics.map((m) => m.provenance.sourceKind)));
    expect([...kinds].every((k) => ['source_recovered', 'derived_from_source', 'synthetic_supplement', 'unresolved'].includes(k))).toBe(true);
  });
});

describe('QAPI 2026 — no PHI in Board-facing records (§3.1)', () => {
  it('does not expose patient names in any normalized Board-facing record', () => {
    for (const q of normalizedQuarters()) {
      const records: unknown[] = [...q.metrics, ...q.complaints, ...q.adverseEvents, ...q.infections];
      for (const r of records) {
        for (const key of NAME_KEYS) {
          expect(Object.prototype.hasOwnProperty.call(r as object, key)).toBe(false);
        }
      }
    }
  });

  it('adverse events use de-identified case labels; patient ids only in the restricted field', () => {
    for (const q of normalizedQuarters()) {
      for (const ae of q.adverseEvents) {
        expect(ae.caseLabel.length).toBeGreaterThan(0);
        if (ae.restrictedPatientId) expect(ae.restrictedPatientId).toMatch(/^MOCK-PT-\d+$/);
      }
    }
  });
});

describe('QAPI 2026 — selectors (§11.2)', () => {
  it('Q2 favorable aggregate hospitalization is flagged as masking a subgroup → hold_closure', () => {
    const packet = buildGbQuarterPacket('Q2');
    const hosp = packet.materialSignals.find((s) => s.metricId === 'HOSPITALIZATION_RATE');
    expect(hosp).toBeDefined();
    expect(hosp!.aggregateMasksSubgroup).toBe(true);
    expect(hosp!.boardPosture).toBe('hold_closure');
  });

  it('open PIPs surface as decision matters requiring a Board decision record', () => {
    const docket = buildGbDecisionDocket(QAPI_2026.quarters.Q1);
    const pipMatter = docket.find((m) => m.kind === 'pip_closure');
    expect(pipMatter).toBeDefined();
    expect(pipMatter!.missingEvidence).toContain('Board motion/vote/directive record');
  });

  it('packet readiness fails to convene when a critical data-quality defect affects the quarter', () => {
    const r = buildPacketReadiness(QAPI_2026.quarters.Q1);
    const dqGate = r.gates.find((g) => g.id === 'dq');
    expect(dqGate!.ok).toBe(false); // DQ-2026-001 (identity collision) is critical & affects Q1
    expect(r.readyToConvene).toBe(false);
  });

  it('annual arc surfaces carry-forward risk even where PIP lists are empty', () => {
    const arc = buildGbAnnualArc();
    expect(arc.pendingQuarters).toEqual(['Q3', 'Q4']);
    expect(arc.carryForwardRisk.length).toBeGreaterThan(0);
  });
});
