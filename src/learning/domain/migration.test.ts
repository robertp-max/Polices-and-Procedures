import { describe, it, expect } from 'vitest';
import { classifyBatch, classifyLegacyRecord, type LegacyRecord } from './migration';

const known = new Set(['GAO-001', 'RN-001', 'HHA-SUP']);

function rec(over: Partial<LegacyRecord> = {}): LegacyRecord {
  return { moduleId: 'GAO-001', ...over };
}

describe('legacy migration classification (§21) — no boolean-to-pass', () => {
  it('rejects CORE-*/ROLE-* aliases as non-canonical', () => {
    expect(classifyLegacyRecord(rec({ moduleId: 'CORE-1' }), known).state).toBe('REJECTED');
    expect(classifyLegacyRecord(rec({ moduleId: 'ROLE-RN' }), known).reasonCodes).toContain('ALIAS_NOT_CANONICAL');
  });

  it('quarantines unknown module ids', () => {
    expect(classifyLegacyRecord(rec({ moduleId: 'ZZZ-999' }), known).state).toBe('QUARANTINED');
  });

  it('imports in-progress SCORM as progress only (never completion)', () => {
    const d = classifyLegacyRecord(rec({ scormInProgress: true }), known);
    expect(d.state).toBe('MAPPED');
    expect(d.importAsProgressOnly).toBe(true);
    expect(d.createsGateDecision).toBe(false);
  });

  it('treats clearedForIndependentWork / appendixFCleared as historical claims, never a gate', () => {
    const d = classifyLegacyRecord(rec({ clearedForIndependentWork: true, appendixFCleared: true }), known);
    expect(d.state).toBe('AMBIGUOUS');
    expect(d.producesHistoricalClaim).toBe(true);
    expect(d.createsGateDecision).toBe(false);
    expect(d.reasonCodes).toContain('CLEARANCE_CLAIM_REQUIRES_EVIDENCE');
  });

  it('flags a local signature image as not a valid signoff', () => {
    const d = classifyLegacyRecord(rec({ localSignatureImage: true, moduleVersion: '1', scorePct: 90, hasValidatedEvidence: true }), known);
    expect(d.reasonCodes).toContain('LOCAL_SIGNATURE_NOT_VALID');
    expect(d.createsSignoff).toBe(false);
  });

  it('reconciles only with exact version + score + validated evidence (score stays data)', () => {
    expect(classifyLegacyRecord(rec({ moduleVersion: '1', scorePct: 88, hasValidatedEvidence: true }), known).state).toBe('MAPPED');
    expect(classifyLegacyRecord(rec({ moduleVersion: '1', scorePct: 88, hasValidatedEvidence: false }), known).state).toBe('AMBIGUOUS');
    expect(classifyLegacyRecord(rec({ scorePct: 88 }), known).reasonCodes).toContain('INSUFFICIENT_FOR_RECONCILIATION');
  });

  it('is idempotent — same batch input yields identical output', () => {
    const batch = [rec({ moduleId: 'CORE-1' }), rec({ moduleId: 'ZZZ' }), rec({ moduleVersion: '1', scorePct: 90, hasValidatedEvidence: true })];
    expect(classifyBatch(batch, known)).toEqual(classifyBatch(batch, known));
  });

  it('never creates a signed gate decision under any classification', () => {
    const inputs: LegacyRecord[] = [rec({ scormInProgress: true }), rec({ appendixFCleared: true }), rec({ moduleVersion: '1', scorePct: 90, hasValidatedEvidence: true })];
    for (const i of inputs) expect(classifyLegacyRecord(i, known).createsGateDecision).toBe(false);
  });
});
