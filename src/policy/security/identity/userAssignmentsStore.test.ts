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
