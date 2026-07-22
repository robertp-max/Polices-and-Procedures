/**
 * ADR-0002 Phase 5A — signature catalog + fail-closed alias reconciliation tests.
 * The critical guarantee: an unknown label NEVER silently becomes a real
 * capacity (unlike the legacy normalizeSignerRole default of 'Assigned Owner').
 */
import { describe, expect, it } from 'vitest';
import {
  BUSINESS_SIGNATURE_CAPACITIES, QAPI_SIGNATURE_CAPACITIES, WORKFLOW_PARTICIPATION_ROLES,
  isWorkflowParticipationRole, resolveSignatureCapacity,
} from './signatureCatalog.ts';

describe('two-axis catalog', () => {
  it('workflow participation roles are the canonical seven', () => {
    expect(WORKFLOW_PARTICIPATION_ROLES).toContain('Required Signer');
    expect(WORKFLOW_PARTICIPATION_ROLES).toContain('Auditor');
    expect(isWorkflowParticipationRole('Approver')).toBe(true);
    expect(isWorkflowParticipationRole('Wizard')).toBe(false);
  });

  it('QAPI acceptance capacities are all real canonical capacities', () => {
    for (const cap of QAPI_SIGNATURE_CAPACITIES) {
      expect(BUSINESS_SIGNATURE_CAPACITIES).toContain(cap);
    }
    expect(QAPI_SIGNATURE_CAPACITIES).toEqual(['Director of Nursing', 'Administrator', 'Compliance Officer', 'Governing Body Chair']);
  });
});

describe('resolveSignatureCapacity — fail-closed', () => {
  it('accepts an exact canonical capacity', () => {
    expect(resolveSignatureCapacity('Director of Nursing')).toMatchObject({ matched: true, capacity: 'Director of Nursing', via: 'canonical' });
  });

  it('resolves a known alias to its canonical capacity', () => {
    expect(resolveSignatureCapacity('don')).toMatchObject({ matched: true, capacity: 'Director of Nursing', via: 'alias' });
    expect(resolveSignatureCapacity('compliance')).toMatchObject({ matched: true, capacity: 'Compliance Officer', via: 'alias' });
    expect(resolveSignatureCapacity('board chair')).toMatchObject({ matched: true, capacity: 'Governing Body Chair', via: 'alias' });
  });

  it('FAILS CLOSED on an unknown label (never defaults to Assigned Owner)', () => {
    const r = resolveSignatureCapacity('Supreme Wizard');
    expect(r.matched).toBe(false);
    expect(r.capacity).toBeNull();
    expect(r.via).toBe('unresolved');
  });

  it('fails closed on empty / whitespace input', () => {
    expect(resolveSignatureCapacity('')).toMatchObject({ matched: false, via: 'unresolved' });
    expect(resolveSignatureCapacity('   ')).toMatchObject({ matched: false, via: 'unresolved' });
    expect(resolveSignatureCapacity(null)).toMatchObject({ matched: false, via: 'unresolved' });
  });

  it('a legitimate alias to Assigned Owner still matches (not a false-negative)', () => {
    expect(resolveSignatureCapacity('policy owner')).toMatchObject({ matched: true, capacity: 'Assigned Owner', via: 'alias' });
  });
});
