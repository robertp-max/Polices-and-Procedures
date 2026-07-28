import { describe, it, expect } from 'vitest';
import {
  buildTranscript,
  computeCycleKey,
  cycleUniqueKey,
  deriveCycleStatus,
  hhaInserviceHours,
  lapseImpact,
  subtractMonths,
  sumAcceptedCredit,
} from './recurrence';
import type { CreditLedgerEntry } from './types';

const now = new Date('2026-07-27T00:00:00.000Z');

describe('recurrence cycle keys (deterministic, dedupe)', () => {
  it('produces stable keys per anchor', () => {
    expect(computeCycleKey({ kind: 'CALENDAR_YEAR' }, now)).toBe('CY-2026');
    expect(computeCycleKey({ kind: 'QUARTER' }, now)).toBe('Q3-2026');
    expect(computeCycleKey({ kind: 'ROLLING_12_MONTHS' }, now)).toBe('ROLL-2026-07');
  });
  it('hire anniversary picks the correct window year', () => {
    expect(computeCycleKey({ kind: 'HIRE_ANNIVERSARY', hireDate: '2020-03-01' }, now)).toBe('HIRE-2026');
    expect(computeCycleKey({ kind: 'HIRE_ANNIVERSARY', hireDate: '2020-12-01' }, now)).toBe('HIRE-2025');
  });
  it('unique key binds subject + requirement rev + rule rev + cycle', () => {
    const k = cycleUniqueKey('s1', { id: 'REQ', version: 2 }, { id: 'RULE', version: 1 }, 'CY-2026');
    expect(k).toBe('s1#REQ:REQv2#RULE:RULEv1#CY-2026');
  });
});

describe('cycle status derivation', () => {
  const base = { availableAt: '2026-01-01T00:00:00.000Z', dueAt: '2026-06-01T00:00:00.000Z', windowEnd: '2026-12-31T00:00:00.000Z' };
  it('SATISFIED short-circuits', () => {
    expect(deriveCycleStatus({ ...base, satisfied: true, now })).toBe('SATISFIED');
  });
  it('SCHEDULED / OPEN / DUE / OVERDUE by time', () => {
    expect(deriveCycleStatus({ ...base, satisfied: false, now: new Date('2025-06-01T00:00:00.000Z') })).toBe('SCHEDULED');
    expect(deriveCycleStatus({ ...base, satisfied: false, now: new Date('2026-03-01T00:00:00.000Z') })).toBe('OPEN');
    expect(deriveCycleStatus({ ...base, satisfied: false, now: new Date('2026-07-01T00:00:00.000Z') })).toBe('DUE');
    expect(deriveCycleStatus({ ...base, satisfied: false, now: new Date('2027-01-01T00:00:00.000Z') })).toBe('OVERDUE');
  });
});

function credit(over: Partial<CreditLedgerEntry>): CreditLedgerEntry {
  return {
    id: 'l1',
    subjectId: 's1',
    evidenceId: 'e1',
    creditType: 'HHA_INSERVICE_HOUR',
    value: 4,
    occurredAt: '2026-06-01T00:00:00.000Z',
    acceptedAt: '2026-06-02T00:00:00.000Z',
    acceptedBy: 'r1',
    cycleIds: [],
    status: 'ACCEPTED',
    ...over,
  };
}

describe('credit ledger + HHA rolling 12 hours', () => {
  it('sums only ACCEPTED entries of the type within the window', () => {
    const entries = [
      credit({ id: 'a', value: 4 }),
      credit({ id: 'b', value: 5, status: 'REJECTED' }),
      credit({ id: 'c', value: 3, creditType: 'CEU' }),
      credit({ id: 'd', value: 6, occurredAt: '2024-01-01T00:00:00.000Z' }), // outside window
    ];
    expect(sumAcceptedCredit(entries, 'HHA_INSERVICE_HOUR', subtractMonths(now, 12), now)).toBe(4);
  });
  it('meets 12h only when accepted rolling hours reach 12 (not one boolean)', () => {
    const enough = [credit({ id: 'a', value: 8 }), credit({ id: 'b', value: 4, occurredAt: '2026-07-01T00:00:00.000Z' })];
    expect(hhaInserviceHours(enough, now)).toEqual({ total: 12, meets12: true });
    expect(hhaInserviceHours([credit({ value: 6 })], now).meets12).toBe(false);
  });
});

describe('lapse impact + transcript', () => {
  it('a lapse affects readiness but preserves history', () => {
    const l = lapseImpact();
    expect(l.affects).toContain('FIELD_CLEARANCE');
    expect(l.preserves).toContain('HISTORICAL_ONBOARDING_COMPLETION');
  });
  it('transcript projects completed + current + hours', () => {
    const t = buildTranscript({
      completed: [{ assignmentId: 'a1', requirementCode: 'GAO-001', status: 'COMPLETED', certificatePublicId: 'PUB-1' }],
      current: [{ assignmentId: 'a2', requirementCode: 'ANN-01', status: 'IN_PROGRESS' }],
      hoursLedger: [{ creditType: 'HHA_INSERVICE_HOUR', total: 12 }],
    });
    expect(t.completedCount).toBe(1);
    expect(t.currentCount).toBe(1);
    expect(t.hours[0].total).toBe(12);
  });
});
