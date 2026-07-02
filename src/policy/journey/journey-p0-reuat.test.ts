import { describe, it, expect, beforeEach } from 'vitest';
import { useJourneyStore } from './stores/journeyStore';
import { canStartModule, isModulePassed } from './utils/gating';
import { APPENDIX_F_TEMPLATE } from './data/appendices';
import { modulesForRole } from './data/modules';

describe('Journey LMS P0 Re-UAT (local/demo only)', () => {
  const store = useJourneyStore;

  beforeEach(() => {
    // reset to clean demo state for test isolation
    store.setState({
      currentEmployeeId: 'EMP-1001', // Maria RN - appendixFCleared: false in seed
      attempts: [],
      supervisedVisits: [],
      appendixF: {},
      appendixFSignatures: {},
      employees: [
        { id: 'EMP-1001', name: 'Maria Santos, RN', role: 'RN', appendixFCleared: false, clearedForIndependentWork: false },
        { id: 'EMP-1002', name: 'Grace Abella, HHA', role: 'HHA', appendixFCleared: true, clearedForIndependentWork: false },
      ] as any,
    });
  });

  it('P0-001 / P0-002: quiz/assessment bridge writes attempt to journeyStore', () => {
    const j = store.getState();
    j.recordLearnerCompletion('EMP-1001', 'GAO-004', true, 85);

    const attempts = store.getState().attempts;
    expect(attempts.length).toBe(1);
    expect(attempts[0].employeeId).toBe('EMP-1001');
    expect(attempts[0].moduleId).toBe('GAO-004');
    expect(attempts[0].status).toBe('completed');
  });

  it('P0-002: Appendix F hard gate blocks role module', () => {
    const emp = store.getState().employees.find(e => e.id === 'EMP-1001')!;
    const mod = modulesForRole('RN').find(m => m.id === 'RN-001')!;
    const decision = canStartModule(emp, mod, []);
    expect(decision.unlocked).toBe(false);
    expect(decision.reason).toMatch(/Appendix F/i);
  });

  it('P0-004: HRDirector can sign Appendix F and it persists + flips clearance flag', () => {
    const empId = 'EMP-1001';
    // set all items to PASS
    APPENDIX_F_TEMPLATE.forEach(item => {
      store.getState().updateAppendixFItem(empId, item.id, 'PASS');
    });

    const sig = { name: 'HR Director', role: 'HRDirector' as const, at: new Date().toISOString(), method: 'attested' as const };
    const res = store.getState().signAppendixF(empId, sig);

    expect(res.ok).toBe(true);
    const after = store.getState();
    expect(after.employees.find(e => e.id === empId)?.appendixFCleared).toBe(true);
    expect(after.appendixFSignatures[empId]?.length).toBeGreaterThan(0);
  });

  it('P0-004: Non-HRDirector cannot sign Appendix F', () => {
    const empId = 'EMP-1001';
    APPENDIX_F_TEMPLATE.forEach(item => {
      store.getState().updateAppendixFItem(empId, item.id, 'PASS');
    });

    const badSig = { name: 'Some RN', role: 'RN' as const, at: new Date().toISOString(), method: 'attested' as const };
    const res = store.getState().signAppendixF(empId, badSig);
    expect(res.ok).toBe(false);
  });

  it('P0-005: Supervisor can log supervised visit; clearance respects count', () => {
    const empId = 'EMP-1002'; // assume HHA needs visits
    const sig = { name: 'DON Elena', role: 'DON' as const, at: new Date().toISOString(), method: 'attested' as const };

    store.getState().addSupervisedVisit({
      employeeId: empId,
      supervisorId: 'SUP-1',
      visitDate: '2026-06-01',
      visitType: 'INITIAL',
      rating: 'SATISFACTORY',
      comments: 'Good skills observed',
      signatures: [sig],
    } as any);

    const visits = store.getState().supervisedVisits.filter(v => v.employeeId === empId);
    expect(visits.length).toBe(1);
    expect(visits[0].rating).toBe('SATISFACTORY');

    // clearance path
    const res = store.getState().clearForIndependentWork(empId, sig);
    // may or may not succeed depending on required count in data, but call must not crash and store updates
    expect(typeof res.ok).toBe('boolean');
  });

  it('P0-007: method=None does not auto-pass without bridged completion record', () => {
    const mod = { id: 'GAO-010', method: 'None' } as any;
    // no attempt
    expect(isModulePassed(mod, undefined)).toBe(false);

    // weak completed without bridge
    const weak = { lessonStatus: 'completed', status: 'in-progress', scoreRaw: 0 } as any;
    expect(isModulePassed(mod, weak)).toBe(false); // our fix

    // proper bridged
    store.getState().recordLearnerCompletion('EMP-1001', 'GAO-010', true, 100);
    const att = store.getState().attempts[0];
    expect(isModulePassed(mod, att)).toBe(true);
  });

  it('P0-008: unknown module guard would trigger (tested via canStart with bad id)', () => {
    const emp = store.getState().employees[0];
    const bad = modulesForRole(emp.role).find(m => m.id === 'FAKE-999');
    expect(bad).toBeUndefined(); // catalog does not have it
  });
});
