/**
 * ADR-0002 Phase 5D — separation-of-duties for signing tests.
 */
import { describe, expect, it } from 'vitest';
import { checkSigningSoD, signingSoDSatisfied, type PriorSignature, type SoDRule } from './signingSoD.ts';

const rules: SoDRule[] = [
  { slotId: 'approve', mustDifferFrom: ['draft'] },
  { slotId: 'final', mustDifferFrom: ['draft', 'approve'] },
];
const prior = (over: Partial<PriorSignature>[]): PriorSignature[] => over.map((o) => ({ userId: 'x', slotId: 'draft', ...o }));

describe('checkSigningSoD', () => {
  it('allows when no rule applies to the slot', () => {
    expect(checkSigningSoD('u1', 'draft', [], rules).ok).toBe(true);
  });

  it('allows when the conflicting slot was signed by a different person', () => {
    expect(checkSigningSoD('u2', 'approve', prior([{ userId: 'u1', slotId: 'draft' }]), rules).ok).toBe(true);
  });

  it('REFUSES when the same person signed a conflicting prior slot', () => {
    const r = checkSigningSoD('u1', 'approve', prior([{ userId: 'u1', slotId: 'draft' }]), rules);
    expect(r.ok).toBe(false);
    expect(r.violation).toEqual({ conflictingSlotId: 'draft', sharedUserId: 'u1' });
  });

  it('enforces multiple mustDifferFrom slots (final ≠ draft and ≠ approve)', () => {
    expect(checkSigningSoD('u1', 'final', prior([{ userId: 'u2', slotId: 'draft' }, { userId: 'u1', slotId: 'approve' }]), rules).ok).toBe(false);
    expect(checkSigningSoD('u3', 'final', prior([{ userId: 'u2', slotId: 'draft' }, { userId: 'u1', slotId: 'approve' }]), rules).ok).toBe(true);
  });

  it('ignores prior signatures on non-conflicting slots', () => {
    expect(checkSigningSoD('u1', 'approve', prior([{ userId: 'u1', slotId: 'review' }]), rules).ok).toBe(true);
  });

  it('signingSoDSatisfied mirrors the boolean', () => {
    expect(signingSoDSatisfied('u1', 'approve', prior([{ userId: 'u1', slotId: 'draft' }]), rules)).toBe(false);
  });
});
