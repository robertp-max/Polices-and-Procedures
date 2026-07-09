/**
 * Phase 2D — deadline engine unit tests.
 * Covers quarterly annualQuarter due dates, hire-anchored cycles,
 * OVERDUE 30/45/60 tiers, and LICENSE_EXPIRING_120 / LICENSE_EXPIRED.
 */
import { describe, expect, it } from 'vitest';
import type { JourneyEmployee, JourneyModule, ModuleAttempt } from '@/policy/journey/types/journey';
import {
  daysPastModuleDeadline,
  evaluateEscalations,
  formatModuleDeadline,
  moduleDeadlineStatus,
  quarterEndDate,
  resolveModuleDeadline,
} from './escalation';

const baseEmployee: JourneyEmployee = {
  id: 'EMP-TEST',
  name: 'Test Clinician, RN',
  role: 'RN',
  email: 'test@example.invalid',
  hireDate: '2024-06-15',
  startDate: '2024-06-20',
  supervisorId: 'SUP-1',
  appendixFCleared: true,
  clearedForIndependentWork: true,
};

function annModule(quarter: NonNullable<JourneyModule['annualQuarter']>, id = `ANN-${quarter}`): JourneyModule {
  return {
    id,
    group: 'ANN',
    phase: 'ANN',
    title: `Annual ${quarter}`,
    roles: 'ALL',
    policyRefs: [],
    cmsRefs: [],
    method: 'Quiz',
    passThreshold: 0.8,
    annualQuarter: quarter,
  };
}

function hireAnchoredComp(): JourneyModule {
  return {
    id: 'COMP-ANN-A',
    group: 'COMP',
    phase: 'ANN',
    title: 'Annual Competency Evaluation',
    roles: ['RN'],
    policyRefs: ['HR-TD-003'],
    cmsRefs: [],
    method: 'SkillsCheckoff',
  };
}

describe('quarterEndDate / annualQuarter deadlines', () => {
  it('maps Q1–Q4 to Mar 31 / Jun 30 / Sep 30 / Dec 31', () => {
    expect(formatModuleDeadline(annModule('Q1'), baseEmployee, new Date(2026, 6, 15))).toBe('2026-03-31');
    expect(formatModuleDeadline(annModule('Q2'), baseEmployee, new Date(2026, 6, 15))).toBe('2026-06-30');
    expect(formatModuleDeadline(annModule('Q3'), baseEmployee, new Date(2026, 6, 15))).toBe('2026-09-30');
    expect(formatModuleDeadline(annModule('Q4'), baseEmployee, new Date(2026, 6, 15))).toBe('2026-12-31');
  });

  it('staggers due dates so Q1 is earlier than Q4 in the same year', () => {
    const now = new Date(2026, 6, 15, 12); // mid-year
    const q1 = resolveModuleDeadline(annModule('Q1'), baseEmployee, now);
    const q4 = resolveModuleDeadline(annModule('Q4'), baseEmployee, now);
    expect(q1.getTime()).toBeLessThan(q4.getTime());
    expect(daysPastModuleDeadline(annModule('Q1'), baseEmployee, now)).toBeGreaterThan(0);
    expect(daysPastModuleDeadline(annModule('Q4'), baseEmployee, now)).toBeLessThan(0);
  });

  it('quarterEndDate is local calendar end-of-quarter', () => {
    const d = quarterEndDate(2026, 'Q2');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(30);
  });
});

describe('hire / firstDay-anchored annual cycle', () => {
  it('uses first anniversary when still within first year of service', () => {
    const emp: JourneyEmployee = {
      ...baseEmployee,
      hireDate: '2025-08-01',
      startDate: '2025-08-10',
    };
    const now = new Date(2026, 2, 1, 12); // before first anniversary (2026-08-10)
    const deadline = resolveModuleDeadline(hireAnchoredComp(), emp, now);
    expect(formatModuleDeadline(hireAnchoredComp(), emp, now)).toBe('2026-08-10');
    expect(daysPastModuleDeadline(hireAnchoredComp(), emp, now)).toBeLessThan(0);
  });

  it('uses most recent anniversary once past first year', () => {
    const emp: JourneyEmployee = {
      ...baseEmployee,
      hireDate: '2023-03-10',
      startDate: '2023-03-10',
    };
    // After 2026-03-10 anniversary → deadline is that anniversary
    const now = new Date(2026, 5, 1, 12);
    expect(formatModuleDeadline(hireAnchoredComp(), emp, now)).toBe('2026-03-10');
    expect(daysPastModuleDeadline(hireAnchoredComp(), emp, now)).toBeGreaterThan(0);
  });

  it('COMP-90DAY is anchor + 90 days', () => {
    const mod: JourneyModule = {
      id: 'COMP-90DAY',
      group: 'COMP',
      phase: 'ROLE',
      title: '90-Day Introductory Evaluation',
      roles: 'ALL',
      policyRefs: [],
      cmsRefs: [],
      method: 'Observation',
    };
    const emp: JourneyEmployee = {
      ...baseEmployee,
      hireDate: '2026-01-01',
      startDate: '2026-01-01',
    };
    expect(formatModuleDeadline(mod, emp, new Date(2026, 3, 1))).toBe('2026-04-01');
  });
});

describe('OVERDUE_30 / 45 / 60 tiers', () => {
  const q1 = annModule('Q1', 'ANN-TEST-Q1');

  function runAt(now: Date) {
    // Force a module only we control via injecting through evaluateEscalations
    // by using a real catalog module: ANN-001 is Q1 for ALL roles.
    return evaluateEscalations({
      now,
      employees: [baseEmployee],
      attempts: [],
      remediations: [],
    });
  }

  it('does not fire OVERDUE_* before the quarter deadline', () => {
    // Mar 1 2026 — Q1 due Mar 31, not yet past
    const list = runAt(new Date(2026, 2, 1, 12));
    const overdue = list.filter(
      (e) =>
        e.employeeId === baseEmployee.id
        && (e.type === 'OVERDUE_30' || e.type === 'OVERDUE_45' || e.type === 'OVERDUE_60')
        && e.moduleId?.startsWith('ANN-')
        && e.moduleId && ['ANN-001', 'ANN-002', 'ANN-003', 'ANN-004', 'ANN-005'].includes(e.moduleId),
    );
    expect(overdue).toHaveLength(0);
  });

  it('fires OVERDUE_30 at ≥30 days past Q1 (Mar 31)', () => {
    // Apr 30 2026 = 30 days past Mar 31
    const list = runAt(new Date(2026, 3, 30, 12));
    const o30 = list.filter((e) => e.type === 'OVERDUE_30' && e.moduleId === 'ANN-001');
    const o45 = list.filter((e) => e.type === 'OVERDUE_45' && e.moduleId === 'ANN-001');
    const o60 = list.filter((e) => e.type === 'OVERDUE_60' && e.moduleId === 'ANN-001');
    expect(o30.length).toBe(1);
    expect(o45.length).toBe(0);
    expect(o60.length).toBe(0);
    expect(o30[0]?.severity).toBe('INFO');
  });

  it('fires OVERDUE_45 at ≥45 days past Q1', () => {
    // May 15 2026 = 45 days past Mar 31
    const list = runAt(new Date(2026, 4, 15, 12));
    const o45 = list.filter((e) => e.type === 'OVERDUE_45' && e.moduleId === 'ANN-001');
    const o60 = list.filter((e) => e.type === 'OVERDUE_60' && e.moduleId === 'ANN-001');
    expect(o45.length).toBe(1);
    expect(o60.length).toBe(0);
    expect(o45[0]?.severity).toBe('WARN');
  });

  it('fires OVERDUE_60 at ≥60 days past Q1', () => {
    // May 30 2026 = 60 days past Mar 31
    const list = runAt(new Date(2026, 4, 30, 12));
    const o60 = list.filter((e) => e.type === 'OVERDUE_60' && e.moduleId === 'ANN-001');
    expect(o60.length).toBe(1);
    expect(o60[0]?.severity).toBe('CRITICAL');
  });

  it('skips overdue when latest attempt passed the module', () => {
    const attempt: ModuleAttempt = {
      id: 'ATT-1',
      employeeId: baseEmployee.id,
      moduleId: 'ANN-001',
      attemptNumber: 1,
      startedAt: '2026-03-01T00:00:00.000Z',
      completedAt: '2026-03-01T00:00:00.000Z',
      lessonStatus: 'passed',
      scoreRaw: 90,
      scoreMin: 0,
      scoreMax: 100,
      timeSpentSec: 600,
      suspendData: '',
      lessonLocation: '',
      exit: 'normal',
      status: 'completed',
    };
    const list = evaluateEscalations({
      now: new Date(2026, 4, 30, 12),
      employees: [baseEmployee],
      attempts: [attempt],
      remediations: [],
    });
    expect(list.filter((e) => e.moduleId === 'ANN-001' && e.type.startsWith('OVERDUE'))).toHaveLength(0);
  });

  it('daysPastModuleDeadline matches tier boundaries for isolated module', () => {
    const mod = q1;
    // Mar 31 + 30 = Apr 30
    expect(daysPastModuleDeadline(mod, baseEmployee, new Date(2026, 3, 30, 12))).toBeGreaterThanOrEqual(30);
    expect(daysPastModuleDeadline(mod, baseEmployee, new Date(2026, 3, 30, 12))).toBeLessThan(45);
    expect(daysPastModuleDeadline(mod, baseEmployee, new Date(2026, 4, 15, 12))).toBeGreaterThanOrEqual(45);
    expect(daysPastModuleDeadline(mod, baseEmployee, new Date(2026, 4, 30, 12))).toBeGreaterThanOrEqual(60);
  });
});

describe('LICENSE_EXPIRING_120 / LICENSE_EXPIRED', () => {
  it('fires LICENSE_EXPIRED when licenseExpiry is in the past', () => {
    const emp: JourneyEmployee = {
      ...baseEmployee,
      licenseNumber: 'RN-1',
      licenseType: 'CA BRN',
      licenseExpiry: '2026-01-01',
    };
    const list = evaluateEscalations({
      now: new Date(2026, 2, 1, 12),
      employees: [emp],
      attempts: [],
      remediations: [],
    });
    const expired = list.filter((e) => e.type === 'LICENSE_EXPIRED');
    expect(expired).toHaveLength(1);
    expect(expired[0]?.severity).toBe('CRITICAL');
    expect(list.some((e) => e.type === 'LICENSE_EXPIRING_120')).toBe(false);
  });

  it('fires LICENSE_EXPIRING_120 within 120 days (WARN > 30d)', () => {
    const emp: JourneyEmployee = {
      ...baseEmployee,
      licenseNumber: 'RN-1',
      licenseType: 'CA BRN',
      licenseExpiry: '2026-06-01',
    };
    // 60 days before expiry
    const list = evaluateEscalations({
      now: new Date(2026, 3, 2, 12),
      employees: [emp],
      attempts: [],
      remediations: [],
    });
    const expiring = list.filter((e) => e.type === 'LICENSE_EXPIRING_120');
    expect(expiring).toHaveLength(1);
    expect(expiring[0]?.severity).toBe('WARN');
  });

  it('fires LICENSE_EXPIRING_120 as CRITICAL when ≤30 days remain', () => {
    const emp: JourneyEmployee = {
      ...baseEmployee,
      licenseNumber: 'RN-1',
      licenseType: 'CA BRN',
      licenseExpiry: '2026-05-18', // EMP-1003 seed-like
    };
    const list = evaluateEscalations({
      now: new Date(2026, 4, 1, 12), // ~17 days left
      employees: [emp],
      attempts: [],
      remediations: [],
    });
    const expiring = list.filter((e) => e.type === 'LICENSE_EXPIRING_120');
    expect(expiring).toHaveLength(1);
    expect(expiring[0]?.severity).toBe('CRITICAL');
  });

  it('does not fire license escalations when expiry is >120 days away', () => {
    const emp: JourneyEmployee = {
      ...baseEmployee,
      licenseExpiry: '2027-09-30',
    };
    const list = evaluateEscalations({
      now: new Date(2026, 6, 9, 12),
      employees: [emp],
      attempts: [],
      remediations: [],
    });
    expect(list.some((e) => e.type === 'LICENSE_EXPIRED' || e.type === 'LICENSE_EXPIRING_120')).toBe(
      false,
    );
  });
});

describe('moduleDeadlineStatus', () => {
  it('returns critical when past quarter end, warn within 30 days', () => {
    const q4 = annModule('Q4');
    expect(moduleDeadlineStatus(q4, 2026, new Date(2027, 0, 5))).toBe('critical');
    expect(moduleDeadlineStatus(q4, 2026, new Date(2026, 11, 15))).toBe('warn');
    expect(moduleDeadlineStatus(q4, 2026, new Date(2026, 5, 1))).toBe('on-track');
  });
});
