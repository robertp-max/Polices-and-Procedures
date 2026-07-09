/**
 * Phase 2A unit tests — identity registry CRUD + setup assignment get/set.
 * Demo/local-only store; localStorage is mocked by jsdom.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import type { JourneyEmployee } from '@/policy/journey/types/journey';
import { DEMO_USERS } from './demoUsers';
import {
  IDENTITY_REGISTRY_STORAGE_KEY,
  IDENTITY_REGISTRY_VERSION,
  appendUserSetupAudit,
  rehydrateIdentityRegistryFromStorage,
  useUserAssignmentsStore,
} from './userAssignmentsStore';
import {
  buildOnboardingTrackForRole,
  buildSeedSetupAssignments,
  toJourneyEmployeeOverlap,
  type UserSetupAssignment,
} from './userSetupAssignments';

beforeEach(() => {
  localStorage.clear();
  rehydrateIdentityRegistryFromStorage();
});

describe('userAssignmentsStore — seed + setup assignments (Phase 2A)', () => {
  it('seeds setup assignments for every DEMO_USERS id', () => {
    const setup = useUserAssignmentsStore.getState().setupAssignments;
    for (const user of DEMO_USERS) {
      expect(setup[user.id], `missing setup for ${user.id}`).toBeDefined();
      expect(setup[user.id].userId).toBe(user.id);
    }
    expect(Object.keys(setup).length).toBeGreaterThanOrEqual(DEMO_USERS.length);
  });

  it('maps clinical demo users to Journey roles + supervisors from DEMO_USERS only', () => {
    const { getSetupAssignment } = useUserAssignmentsStore.getState();
    const rn = getSetupAssignment('usr-rn');
    expect(rn?.role).toBe('RN');
    expect(rn?.supervisorId).toBe('usr-director');
    expect(rn?.firstDay).toBe('2026-04-20');
    expect(rn?.journeyEmployeeSeedRef).toBe('EMP-1001');
    expect(rn?.onboarding?.journeyRole).toBe('RN');
    expect(rn?.onboarding?.moduleIds.length).toBeGreaterThan(0);

    const director = getSetupAssignment('usr-director');
    expect(director?.role).toBe('DON');
    expect(director?.supervisorId).toBe('usr-executive');
  });

  it('persists setup assignment changes across rehydrate (localStorage round-trip)', () => {
    const result = useUserAssignmentsStore.getState().setSetupAssignment('usr-rn', {
      role: 'RN',
      supervisorId: 'usr-director',
      firstDay: '2026-05-01',
      discipline: 'RN — West Branch',
    });
    expect(result.ok).toBe(true);

    const raw = localStorage.getItem(IDENTITY_REGISTRY_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw!);
    expect(parsed.version).toBe(IDENTITY_REGISTRY_VERSION);
    expect(parsed.setupAssignments['usr-rn'].firstDay).toBe('2026-05-01');
    expect(parsed.setupAssignments['usr-rn'].discipline).toBe('RN — West Branch');

    rehydrateIdentityRegistryFromStorage();
    const again = useUserAssignmentsStore.getState().getSetupAssignment('usr-rn');
    expect(again?.firstDay).toBe('2026-05-01');
    expect(again?.discipline).toBe('RN — West Branch');
  });

  it('migrates v1 localStorage blobs (no setupAssignments) by seeding defaults', () => {
    const users = useUserAssignmentsStore.getState().users;
    const assignments = useUserAssignmentsStore.getState().assignments;
    localStorage.setItem(
      IDENTITY_REGISTRY_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        updatedAt: new Date().toISOString(),
        users,
        assignments,
        // intentionally omit setupAssignments (v1 shape)
      }),
    );
    rehydrateIdentityRegistryFromStorage();
    const rn = useUserAssignmentsStore.getState().getSetupAssignment('usr-rn');
    expect(rn?.role).toBe('RN');
    expect(useUserAssignmentsStore.getState().getAllSetupAssignments().length)
      .toBeGreaterThanOrEqual(DEMO_USERS.length);
  });
});

describe('userAssignmentsStore — create / edit / deactivate', () => {
  it('addUser creates user + default setup assignment', () => {
    const before = useUserAssignmentsStore.getState().users.length;
    const result = useUserAssignmentsStore.getState().addUser({
      name: 'New Clinician',
      email: 'new.clinician@careindeed.com',
      groupId: 'grp-clinician-rn',
      status: 'pending',
      setup: {
        role: 'RN',
        supervisorId: 'usr-director',
        firstDay: '2026-06-01',
        hireDate: '2026-05-20',
      },
    });
    expect(result.ok).toBe(true);
    expect(useUserAssignmentsStore.getState().users.length).toBe(before + 1);

    const created = useUserAssignmentsStore.getState().users.find(
      u => u.email === 'new.clinician@careindeed.com',
    );
    expect(created).toBeDefined();
    const setup = useUserAssignmentsStore.getState().getSetupAssignment(created!.id);
    expect(setup?.role).toBe('RN');
    expect(setup?.supervisorId).toBe('usr-director');
    expect(setup?.firstDay).toBe('2026-06-01');
    expect(setup?.onboarding?.moduleIds.length).toBeGreaterThan(0);
    expect(setup?.active).toBe(true);
  });

  it('editUser updates identity fields and setup payload', () => {
    const result = useUserAssignmentsStore.getState().editUser('usr-lvn', 'demo-user-careindeed', {
      name: 'Logan LVN Updated',
      setup: {
        firstDay: '2026-04-10',
        discipline: 'LVN — South',
      },
    });
    expect(result.ok).toBe(true);
    const user = useUserAssignmentsStore.getState().getUserById('usr-lvn');
    expect(user?.name).toBe('Logan LVN Updated');
    const setup = useUserAssignmentsStore.getState().getSetupAssignment('usr-lvn');
    expect(setup?.firstDay).toBe('2026-04-10');
    expect(setup?.discipline).toBe('LVN — South');
  });

  it('deleteUser deactivates (suspends) user and marks setup inactive', () => {
    const result = useUserAssignmentsStore.getState().deleteUser('usr-chha', 'demo-user-careindeed');
    expect(result.ok).toBe(true);
    const user = useUserAssignmentsStore.getState().getUserById('usr-chha');
    expect(user?.status).toBe('suspended');
    const setup = useUserAssignmentsStore.getState().getSetupAssignment('usr-chha');
    expect(setup?.active).toBe(false);

    // Still present in registry (soft-delete), persists after rehydrate
    rehydrateIdentityRegistryFromStorage();
    expect(useUserAssignmentsStore.getState().getUserById('usr-chha')?.status).toBe('suspended');
    expect(useUserAssignmentsStore.getState().getSetupAssignment('usr-chha')?.active).toBe(false);
  });

  it('rejects addUser with non-careindeed email', () => {
    const result = useUserAssignmentsStore.getState().addUser({
      name: 'Bad Email',
      email: 'someone@example.com',
      groupId: 'grp-clinician-rn',
      status: 'pending',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/careindeed/i);
  });
});

describe('userAssignmentsStore — Phase 2E demo audit trail', () => {
  /**
   * Demo audit trail — not tamper-evident.
   * Field name discipline: always `createdAt` (never `at`).
   */
  it('addUser / editUser / deleteUser / setSetupAssignment each append one audit entry with createdAt', () => {
    const store = useUserAssignmentsStore.getState();
    const before = store.auditLog.length;

    const add = store.addUser({
      name: 'Audit Clinician',
      email: 'audit.clinician@careindeed.com',
      groupId: 'grp-clinician-rn',
      status: 'pending',
      setup: { role: 'RN', supervisorId: 'usr-director' },
    });
    expect(add.ok).toBe(true);

    const created = useUserAssignmentsStore
      .getState()
      .users.find(u => u.email === 'audit.clinician@careindeed.com');
    expect(created).toBeDefined();

    const edit = useUserAssignmentsStore.getState().editUser(created!.id, 'demo-user-careindeed', {
      name: 'Audit Clinician Edited',
      setup: { firstDay: '2026-07-01' },
    });
    expect(edit.ok).toBe(true);

    const setup = useUserAssignmentsStore.getState().setSetupAssignment(created!.id, {
      discipline: 'RN — Audit lane',
    }, 'demo-user-careindeed');
    expect(setup.ok).toBe(true);

    const del = useUserAssignmentsStore.getState().deleteUser(created!.id, 'demo-user-careindeed');
    expect(del.ok).toBe(true);

    const log = useUserAssignmentsStore.getState().auditLog;
    expect(log.length).toBe(before + 4);

    const lastFour = log.slice(-4);
    expect(lastFour.map(e => e.action)).toEqual([
      'addUser',
      'editUser',
      'setSetupAssignment',
      'deleteUser',
    ]);

    for (const entry of lastFour) {
      expect(entry.createdAt, `missing createdAt on ${entry.action}`).toBeTruthy();
      expect(typeof entry.createdAt).toBe('string');
      expect(entry.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      // onboarding-v2 bug regression guard: consumers must not use `at`
      expect('at' in entry).toBe(false);
      expect(entry.actorUserId).toBeTruthy();
      expect(entry.targetUserId).toBe(created!.id);
    }
  });

  it('failed mutations do not append audit entries', () => {
    const before = useUserAssignmentsStore.getState().auditLog.length;
    const result = useUserAssignmentsStore.getState().addUser({
      name: 'Bad',
      email: 'not-careindeed@example.com',
      groupId: 'grp-clinician-rn',
      status: 'pending',
    });
    expect(result.ok).toBe(false);
    expect(useUserAssignmentsStore.getState().auditLog.length).toBe(before);
  });

  it('persists audit entries across rehydrate (localStorage) and exposes createdAt on getRecentAudit', () => {
    useUserAssignmentsStore.getState().addUser({
      name: 'Persist Audit',
      email: 'persist.audit@careindeed.com',
      groupId: 'grp-pending-user',
      status: 'pending',
    });

    rehydrateIdentityRegistryFromStorage();
    const recent = useUserAssignmentsStore.getState().getRecentAudit(10);
    expect(recent.length).toBeGreaterThan(0);
    const addEntry = recent.find(e => e.action === 'addUser' && e.detail?.includes('persist.audit'));
    expect(addEntry).toBeDefined();
    expect(addEntry!.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Object.prototype.hasOwnProperty.call(addEntry, 'createdAt')).toBe(true);
  });

  it('appendAudit free function is available for journey callers', () => {
    const before = useUserAssignmentsStore.getState().auditLog.length;
    const entry = appendUserSetupAudit({
      actorUserId: 'journey-actor',
      action: 'supervisedVisitSave',
      targetUserId: 'EMP-1001',
      detail: 'test visit',
    });
    expect(entry.action).toBe('supervisedVisitSave');
    expect(entry.createdAt).toBeTruthy();
    expect(useUserAssignmentsStore.getState().auditLog.length).toBe(before + 1);
  });
});

describe('UserSetupAssignment structural compatibility with JourneyEmployee', () => {
  it('toJourneyEmployeeOverlap produces JourneyEmployee-compatible field set', () => {
    const seed = buildSeedSetupAssignments();
    const setup = seed['usr-rn'] as UserSetupAssignment;
    const user = DEMO_USERS.find(u => u.id === 'usr-rn')!;
    const overlap = toJourneyEmployeeOverlap(user, setup);

    // Assignability check: object must satisfy Pick<JourneyEmployee, ...>
    const asEmployee: Pick<
      JourneyEmployee,
      | 'id'
      | 'name'
      | 'role'
      | 'email'
      | 'hireDate'
      | 'startDate'
      | 'supervisorId'
      | 'licenseNumber'
      | 'licenseType'
      | 'licenseExpiry'
      | 'appendixFCleared'
      | 'clearedForIndependentWork'
      | 'terminated'
    > = overlap;

    expect(asEmployee.role).toBe('RN');
    expect(asEmployee.startDate).toBe(setup.firstDay);
    expect(asEmployee.hireDate).toBe(setup.hireDate);
    expect(asEmployee.supervisorId).toBe(setup.supervisorId);
    expect(asEmployee.appendixFCleared).toBe(false);
    expect(typeof asEmployee.terminated).toBe('boolean');
  });

  it('buildOnboardingTrackForRole uses modulesForRole catalog', () => {
    const track = buildOnboardingTrackForRole('HHA', {
      firstDay: '2026-04-20',
      assignedAt: '2026-04-20T00:00:00.000Z',
    });
    expect(track.trackId).toBe('role-HHA');
    expect(track.journeyRole).toBe('HHA');
    expect(track.moduleIds).toContain('GAO-001');
    expect(track.dueDate).toBeTruthy();
  });
});
