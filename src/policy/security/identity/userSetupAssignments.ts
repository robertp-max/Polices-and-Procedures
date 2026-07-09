/**
 * User setup / onboarding assignment layer for identity `User` records.
 *
 * Demo/local-only — no backend. Phase 2A of User Setup.
 *
 * Design:
 * - Canonical person is still `User` in `./types.ts` (backed by `userAssignmentsStore`).
 * - This module attaches Journey-shaped fields (role/discipline/supervisor/firstDay/
 *   onboarding-track/modules/due dates) by `userId` reference — it does **not**
 *   invent a fourth person model or duplicate `User`.
 * - Field shapes intentionally mirror `JourneyEmployee` / `JourneyRole` from
 *   `src/policy/journey/types/journey.ts` for parity with journey screens (Phase 2C).
 * - Seed data is derived from existing `DEMO_USERS` (18 users). A subset maps to
 *   `SEED_EMPLOYEES` *concepts* via `journeyEmployeeSeedRef` for demo richness only;
 *   SEED_EMPLOYEES itself is not deleted or replaced.
 */

import type { JourneyEmployee, JourneyRole } from '@/policy/journey/types/journey';
import { modulesForRole } from '@/policy/journey/data/modules';
import { DEMO_USERS } from './demoUsers';

export type OnboardingTrackStatus =
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'deferred';

/**
 * Onboarding-track + module assignment for a single identity user.
 * Consumed by Phase 2B (admin UI) and 2C (ModulePlayer / academy filtering).
 */
export interface OnboardingTrackAssignment {
  /** Stable track key, e.g. `role-RN`, `role-DON`. */
  trackId: string;
  /** Journey role driving `modulesForRole()` catalog selection. */
  journeyRole: JourneyRole;
  /** Module ids assigned (typically from `modulesForRole`). */
  moduleIds: string[];
  /** ISO datetime when the track was assigned. */
  assignedAt: string;
  /** Overall track due date (ISO date or datetime). */
  dueDate?: string;
  /** Optional per-module due dates keyed by module id. */
  moduleDueDates?: Record<string, string>;
  status: OnboardingTrackStatus;
}

/**
 * Journey-shaped setup fields attached to an identity `User` by `userId`.
 *
 * Overlapping fields with `JourneyEmployee` (structural parity — not a second User):
 * - role ↔ JourneyEmployee.role
 * - supervisorId ↔ JourneyEmployee.supervisorId (here: identity User.id, not EMP-*)
 * - hireDate ↔ JourneyEmployee.hireDate
 * - firstDay ↔ JourneyEmployee.startDate
 * - licenseNumber / licenseType / licenseExpiry
 * - appendixFCleared / clearedForIndependentWork
 */
export interface UserSetupAssignment {
  userId: string;
  /** CMS/ops role — same vocabulary as JourneyEmployee.role / JourneyRole. */
  role: JourneyRole | null;
  /** Free-text discipline label (often mirrors role, e.g. "Registered Nurse"). */
  discipline?: string;
  /**
   * Identity `User.id` of the supervisor (not Journey `EMP-*` id).
   * Phase 2C SupervisorScreen filters by this field.
   */
  supervisorId: string | null;
  /** ISO hire date — parity with JourneyEmployee.hireDate. */
  hireDate?: string;
  /**
   * First day of work. Plan language: "firstDay".
   * Maps to JourneyEmployee.startDate in journey adapters (Phase 2C).
   */
  firstDay?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  appendixFCleared?: boolean;
  clearedForIndependentWork?: boolean;
  /** Active onboarding track + modules/due dates (null = unassigned). */
  onboarding: OnboardingTrackAssignment | null;
  /**
   * Optional conceptual link to `SEED_EMPLOYEES` ids (e.g. EMP-1001) for demo
   * richness. Does not create a parallel person; identity User remains canonical.
   */
  journeyEmployeeSeedRef?: string;
  /** When false, treated as deactivated for setup/roster active views. */
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Alias used in the implementation plan. */
export type UserAssignment = UserSetupAssignment;

/** Optional journey/setup fields accepted on add/edit user payloads. */
export interface UserSetupFieldsPayload {
  role?: JourneyRole | null;
  discipline?: string;
  supervisorId?: string | null;
  hireDate?: string;
  firstDay?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  appendixFCleared?: boolean;
  clearedForIndependentWork?: boolean;
  onboarding?: OnboardingTrackAssignment | null;
  journeyEmployeeSeedRef?: string;
  active?: boolean;
}

const SEED_CREATED_AT = '2026-01-01T00:00:00.000Z';

/** Demo supervisor anchors among DEMO_USERS (not a new cast). */
const SUP_DIRECTOR = 'usr-director';
const SUP_EXECUTIVE = 'usr-executive';
const SUP_SUPER_ADMIN = 'demo-user-careindeed';

interface SeedSetupMeta {
  role: JourneyRole | null;
  discipline?: string;
  supervisorId: string | null;
  hireDate?: string;
  firstDay?: string;
  journeyEmployeeSeedRef?: string;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: string;
  appendixFCleared?: boolean;
  clearedForIndependentWork?: boolean;
  /** When true and role is set, seed a default onboarding track via modulesForRole. */
  withOnboarding?: boolean;
  active?: boolean;
}

/**
 * Subset of DEMO_USERS mapped to Journey roles / SEED_EMPLOYEES concepts.
 * Everyone else still gets a setup record (role null, no track) so the map is complete.
 */
const SEED_SETUP_META: Partial<Record<string, SeedSetupMeta>> = {
  // Maps conceptually to EMP-3001 (Administrator) without inventing a new person.
  'demo-user-careindeed': {
    role: 'ADM',
    discipline: 'Administrator',
    supervisorId: null,
    hireDate: '2022-06-01',
    firstDay: '2022-06-01',
    journeyEmployeeSeedRef: 'EMP-3001',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-marites': {
    role: 'ADM',
    discipline: 'Administrator',
    supervisorId: SUP_SUPER_ADMIN,
    hireDate: '2023-03-01',
    firstDay: '2023-03-06',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-admin': {
    role: 'ADM',
    discipline: 'Administrator',
    supervisorId: SUP_SUPER_ADMIN,
    hireDate: '2024-01-08',
    firstDay: '2024-01-15',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-deeb-admin': {
    role: 'ADM',
    discipline: 'Administrator',
    supervisorId: SUP_SUPER_ADMIN,
    hireDate: '2024-02-01',
    firstDay: '2024-02-05',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-dagny': {
    role: null,
    discipline: 'Office Staff',
    supervisorId: 'usr-admin',
    hireDate: '2024-06-01',
    firstDay: '2024-06-10',
  },
  'usr-janine': {
    role: null,
    discipline: 'Office Staff',
    supervisorId: 'usr-admin',
    hireDate: '2024-07-15',
    firstDay: '2024-07-22',
  },
  'usr-reden': {
    role: null,
    discipline: 'Operations',
    supervisorId: SUP_EXECUTIVE,
    hireDate: '2023-11-01',
    firstDay: '2023-11-06',
  },
  'usr-monserat': {
    role: null,
    discipline: 'Operations',
    supervisorId: SUP_EXECUTIVE,
    hireDate: '2024-03-01',
    firstDay: '2024-03-04',
  },
  // Maps conceptually to EMP-1001 (RN under DON).
  'usr-rn': {
    role: 'RN',
    discipline: 'Registered Nurse',
    supervisorId: SUP_DIRECTOR,
    hireDate: '2026-04-14',
    firstDay: '2026-04-20',
    journeyEmployeeSeedRef: 'EMP-1001',
    licenseNumber: 'RN-00123456',
    licenseType: 'CA BRN Registered Nurse',
    licenseExpiry: '2027-09-30',
    appendixFCleared: false,
    clearedForIndependentWork: false,
    withOnboarding: true,
  },
  // Maps conceptually to EMP-1003 (LVN under DON).
  'usr-lvn': {
    role: 'LVN',
    discipline: 'Licensed Vocational Nurse',
    supervisorId: SUP_DIRECTOR,
    hireDate: '2026-03-30',
    firstDay: '2026-04-06',
    journeyEmployeeSeedRef: 'EMP-1003',
    licenseNumber: 'LVN-0088771',
    licenseType: 'CA BVNPT',
    licenseExpiry: '2026-05-18',
    appendixFCleared: true,
    clearedForIndependentWork: false,
    withOnboarding: true,
  },
  // Maps conceptually to EMP-1002 (HHA under DON).
  'usr-chha': {
    role: 'HHA',
    discipline: 'Home Health Aide / CHHA',
    supervisorId: SUP_DIRECTOR,
    hireDate: '2026-04-10',
    firstDay: '2026-04-20',
    journeyEmployeeSeedRef: 'EMP-1002',
    appendixFCleared: true,
    clearedForIndependentWork: false,
    withOnboarding: true,
  },
  'usr-compliance': {
    role: 'ADM',
    discipline: 'Compliance',
    supervisorId: SUP_EXECUTIVE,
    hireDate: '2023-05-01',
    firstDay: '2023-05-08',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-auditor': {
    role: null,
    discipline: 'Auditor',
    supervisorId: 'usr-compliance',
    hireDate: '2024-09-01',
    firstDay: '2024-09-09',
  },
  'usr-onboarding': {
    role: null,
    discipline: 'Onboarding / HR',
    supervisorId: 'usr-admin',
    hireDate: '2024-04-01',
    firstDay: '2024-04-08',
  },
  'usr-billing': {
    role: null,
    discipline: 'Billing',
    supervisorId: 'usr-admin',
    hireDate: '2024-05-01',
    firstDay: '2024-05-06',
  },
  // Maps conceptually to EMP-2001 (DON).
  'usr-director': {
    role: 'DON',
    discipline: 'Director of Nursing',
    supervisorId: SUP_EXECUTIVE,
    hireDate: '2023-01-15',
    firstDay: '2023-01-15',
    journeyEmployeeSeedRef: 'EMP-2001',
    licenseNumber: 'RN-00098321',
    licenseType: 'CA BRN Registered Nurse',
    licenseExpiry: '2027-01-15',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-executive': {
    role: 'ADM',
    discipline: 'Executive',
    supervisorId: null,
    hireDate: '2021-01-01',
    firstDay: '2021-01-01',
    appendixFCleared: true,
    clearedForIndependentWork: true,
    withOnboarding: true,
  },
  'usr-suspended': {
    role: 'RN',
    discipline: 'Registered Nurse',
    supervisorId: SUP_DIRECTOR,
    hireDate: '2025-01-01',
    firstDay: '2025-01-15',
    withOnboarding: false,
    active: false,
  },
};

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Build a default onboarding track from the journey module catalog for a role. */
export function buildOnboardingTrackForRole(
  role: JourneyRole,
  options?: { firstDay?: string; assignedAt?: string; status?: OnboardingTrackStatus },
): OnboardingTrackAssignment {
  const assignedAt = options?.assignedAt ?? new Date().toISOString();
  const moduleIds = modulesForRole(role).map(m => m.id);
  const anchor = options?.firstDay ?? assignedAt.slice(0, 10);
  return {
    trackId: `role-${role}`,
    journeyRole: role,
    moduleIds,
    assignedAt,
    dueDate: addDaysIso(anchor, 60),
    status: options?.status ?? 'not_started',
  };
}

export function createDefaultSetupAssignment(
  userId: string,
  partial?: UserSetupFieldsPayload,
  nowIso: string = new Date().toISOString(),
): UserSetupAssignment {
  const role = partial?.role ?? null;
  // Prefer explicit onboarding; otherwise auto-build from role via modulesForRole.
  const onboarding =
    partial?.onboarding !== undefined
      ? partial.onboarding
      : role
        ? buildOnboardingTrackForRole(role, {
            firstDay: partial?.firstDay,
            assignedAt: nowIso,
          })
        : null;

  return {
    userId,
    role,
    discipline: partial?.discipline,
    supervisorId: partial?.supervisorId ?? null,
    hireDate: partial?.hireDate,
    firstDay: partial?.firstDay,
    licenseNumber: partial?.licenseNumber,
    licenseType: partial?.licenseType,
    licenseExpiry: partial?.licenseExpiry,
    appendixFCleared: partial?.appendixFCleared,
    clearedForIndependentWork: partial?.clearedForIndependentWork,
    onboarding,
    journeyEmployeeSeedRef: partial?.journeyEmployeeSeedRef,
    active: partial?.active ?? true,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

export function normalizeSetupAssignment(input: UserSetupAssignment): UserSetupAssignment {
  return {
    ...input,
    userId: String(input.userId || '').trim(),
    role: input.role ?? null,
    supervisorId: input.supervisorId ?? null,
    onboarding: input.onboarding
      ? {
          ...input.onboarding,
          moduleIds: Array.isArray(input.onboarding.moduleIds) ? [...input.onboarding.moduleIds] : [],
          moduleDueDates: input.onboarding.moduleDueDates
            ? { ...input.onboarding.moduleDueDates }
            : undefined,
          status: input.onboarding.status ?? 'not_started',
        }
      : null,
    active: input.active !== false,
    createdAt: input.createdAt || SEED_CREATED_AT,
    updatedAt: input.updatedAt || input.createdAt || SEED_CREATED_AT,
  };
}

export function mergeSetupAssignment(
  existing: UserSetupAssignment | undefined,
  userId: string,
  patch: UserSetupFieldsPayload,
  nowIso: string = new Date().toISOString(),
): UserSetupAssignment {
  const base = existing
    ? normalizeSetupAssignment(existing)
    : createDefaultSetupAssignment(userId, undefined, nowIso);

  const nextRole = patch.role !== undefined ? patch.role : base.role;
  let nextOnboarding = base.onboarding;
  if (patch.onboarding !== undefined) {
    nextOnboarding = patch.onboarding;
  } else if (
    patch.role !== undefined
    && patch.role
    && patch.role !== base.role
    && base.onboarding?.journeyRole !== patch.role
  ) {
    // Role changed without explicit onboarding — refresh track from catalog.
    nextOnboarding = buildOnboardingTrackForRole(patch.role, {
      firstDay: patch.firstDay ?? base.firstDay,
      assignedAt: nowIso,
      status: 'not_started',
    });
  }

  return normalizeSetupAssignment({
    ...base,
    userId,
    role: nextRole,
    ...(patch.discipline !== undefined ? { discipline: patch.discipline } : {}),
    ...(patch.supervisorId !== undefined ? { supervisorId: patch.supervisorId } : {}),
    ...(patch.hireDate !== undefined ? { hireDate: patch.hireDate } : {}),
    ...(patch.firstDay !== undefined ? { firstDay: patch.firstDay } : {}),
    ...(patch.licenseNumber !== undefined ? { licenseNumber: patch.licenseNumber } : {}),
    ...(patch.licenseType !== undefined ? { licenseType: patch.licenseType } : {}),
    ...(patch.licenseExpiry !== undefined ? { licenseExpiry: patch.licenseExpiry } : {}),
    ...(patch.appendixFCleared !== undefined ? { appendixFCleared: patch.appendixFCleared } : {}),
    ...(patch.clearedForIndependentWork !== undefined
      ? { clearedForIndependentWork: patch.clearedForIndependentWork }
      : {}),
    ...(patch.journeyEmployeeSeedRef !== undefined
      ? { journeyEmployeeSeedRef: patch.journeyEmployeeSeedRef }
      : {}),
    ...(patch.active !== undefined ? { active: patch.active } : {}),
    onboarding: nextOnboarding,
    updatedAt: nowIso,
  });
}

/** Seed setup assignments for all DEMO_USERS (demo/local-only). */
export function buildSeedSetupAssignments(
  nowIso: string = SEED_CREATED_AT,
): Record<string, UserSetupAssignment> {
  const out: Record<string, UserSetupAssignment> = {};
  for (const user of DEMO_USERS) {
    const meta = SEED_SETUP_META[user.id];
    const active = meta?.active ?? user.status !== 'suspended';
    let onboarding: OnboardingTrackAssignment | null = null;
    if (meta?.withOnboarding && meta.role) {
      onboarding = buildOnboardingTrackForRole(meta.role, {
        firstDay: meta.firstDay,
        assignedAt: nowIso,
        status: meta.clearedForIndependentWork ? 'completed' : 'not_started',
      });
    }
    out[user.id] = normalizeSetupAssignment({
      userId: user.id,
      role: meta?.role ?? null,
      discipline: meta?.discipline,
      supervisorId: meta?.supervisorId ?? null,
      hireDate: meta?.hireDate,
      firstDay: meta?.firstDay,
      licenseNumber: meta?.licenseNumber,
      licenseType: meta?.licenseType,
      licenseExpiry: meta?.licenseExpiry,
      appendixFCleared: meta?.appendixFCleared,
      clearedForIndependentWork: meta?.clearedForIndependentWork,
      onboarding,
      journeyEmployeeSeedRef: meta?.journeyEmployeeSeedRef,
      active,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }
  return out;
}

/**
 * Structural bridge: project identity User + setup assignment into the
 * JourneyEmployee-overlapping field set (for Phase 2C adapters / type tests).
 * Does not replace JourneyEmployee seed data.
 */
export function toJourneyEmployeeOverlap(
  user: { id: string; name: string; email: string },
  setup: UserSetupAssignment,
): Pick<
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
> {
  return {
    id: user.id,
    name: user.name,
    role: (setup.role ?? 'RN') as JourneyRole,
    email: user.email,
    hireDate: setup.hireDate ?? setup.firstDay ?? '',
    startDate: setup.firstDay ?? null,
    supervisorId: setup.supervisorId,
    licenseNumber: setup.licenseNumber,
    licenseType: setup.licenseType,
    licenseExpiry: setup.licenseExpiry,
    appendixFCleared: setup.appendixFCleared ?? false,
    clearedForIndependentWork: setup.clearedForIndependentWork ?? false,
    terminated: !setup.active,
  };
}

/** List identity user ids reporting to a given supervisor (setup layer). */
export function getDirectReportUserIds(
  setupAssignments: Record<string, UserSetupAssignment>,
  supervisorUserId: string,
): string[] {
  return Object.values(setupAssignments)
    .filter(a => a.active && a.supervisorId === supervisorUserId)
    .map(a => a.userId);
}
