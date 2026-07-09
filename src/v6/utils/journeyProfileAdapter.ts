/**
 * Journey → Profile positive-only, non-PHI achievements adapter.
 *
 * Safe for surfacing:
 * - Only completed / passed / cleared positive states.
 * - Never failures, remediation, deficiencies, incomplete, PHI, patient data, performance rankings.
 *
 * IDENTITY MAPPING (Phase 2C):
 * Journey uses SEED_EMPLOYEES (EMP-XXXX) + journeyStore.
 * Security identity uses DEMO_USERS (usr-*, demo-user-careindeed).
 * Auth / Community may use demo-user / u-*-* ids.
 * This adapter maps known overlaps; unmatched → empty achievements (no fakes).
 *
 * Usage: Call from profile screens. Opt-in via future profile setting.
 */

import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import {
  calculateAchcEmployeeStatus,
  ACHC_BUNDLE_NAME,
  isAchcModuleId,
} from '@/policy/journey/utils/achcTrainingCalculations';
import { getLiveSetupAssignment } from '@/policy/security/identity/userAssignmentsStore';
import { modulesForRole } from '@/policy/journey/data/modules';
import type { JourneyRole } from '@/policy/journey/types/journey';

export interface JourneyAchievement {
  id: string;
  label: string;
  source: 'journey_completion' | 'clearance';
  completedAt?: string;
  detail?: string;
}

/**
 * Known demo mapping: identity / auth / community userId → Journey EMP id.
 * Phase 2A seed refs + legacy community ids for prototype only.
 */
export const DEMO_JOURNEY_EMPLOYEE_MAP: Record<string, string> = {
  // Legacy auth / community demo ids
  'demo-user': 'EMP-1001',
  'u-don-01': 'EMP-1001',
  'u-admin-brad': 'EMP-2001',
  'u-compliance-tp': 'EMP-1003',
  // Phase 2A identity DEMO_USERS → SEED_EMPLOYEES concepts
  'demo-user-careindeed': 'EMP-3001',
  'usr-rn': 'EMP-1001',
  'usr-lvn': 'EMP-1003',
  'usr-chha': 'EMP-1002',
  'usr-director': 'EMP-2001',
};

/** Reverse map: Journey EMP id → primary identity userId (Phase 2A seed). */
export const JOURNEY_EMPLOYEE_TO_IDENTITY: Record<string, string> = {
  'EMP-1001': 'usr-rn',
  'EMP-1002': 'usr-chha',
  'EMP-1003': 'usr-lvn',
  'EMP-2001': 'usr-director',
  'EMP-3001': 'demo-user-careindeed',
};

/**
 * Resolve a security/auth/community userId (or raw EMP id) to a Journey employee id.
 * Prefer static map, then setup `journeyEmployeeSeedRef`, then EMP-* passthrough.
 */
export function resolveJourneyEmployeeId(userId: string | null | undefined): string | null {
  if (!userId) return null;
  const trimmed = String(userId).trim();
  if (!trimmed) return null;

  if (DEMO_JOURNEY_EMPLOYEE_MAP[trimmed]) {
    return DEMO_JOURNEY_EMPLOYEE_MAP[trimmed];
  }

  try {
    const setup = getLiveSetupAssignment(trimmed);
    if (setup?.journeyEmployeeSeedRef) {
      return setup.journeyEmployeeSeedRef;
    }
  } catch {
    // store unavailable outside app — ignore
  }

  if (/^EMP-\d+/i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/** Resolve Journey EMP id → identity userId when known. */
export function resolveIdentityUserIdFromEmployee(employeeId: string | null | undefined): string | null {
  if (!employeeId) return null;
  if (JOURNEY_EMPLOYEE_TO_IDENTITY[employeeId]) {
    return JOURNEY_EMPLOYEE_TO_IDENTITY[employeeId];
  }
  // Identity user ids used as EMP bridge via toJourneyEmployeeOverlap keep usr-* form
  if (employeeId.startsWith('usr-') || employeeId === 'demo-user-careindeed') {
    return employeeId;
  }
  return null;
}

/**
 * Module ids assigned to a learner EMP via Phase 2A setup onboarding track.
 * Falls back to `modulesForRole(role)` when no setup track is present.
 */
export function getAssignedModuleIdsForEmployee(
  employeeId: string,
  role?: JourneyRole | null,
): string[] {
  const identityId = resolveIdentityUserIdFromEmployee(employeeId);
  if (identityId) {
    try {
      const setup = getLiveSetupAssignment(identityId);
      const ids = setup?.onboarding?.moduleIds;
      if (ids && ids.length > 0) {
        return [...ids];
      }
      if (!role && setup?.role) {
        return modulesForRole(setup.role).map((m) => m.id);
      }
    } catch {
      // ignore
    }
  }
  if (role) {
    return modulesForRole(role).map((m) => m.id);
  }
  return [];
}

/** Whether a module is in the learner's assignment (or unassigned catalog when empty). */
export function isModuleAssignedToEmployee(
  employeeId: string,
  moduleId: string,
  role?: JourneyRole | null,
): boolean {
  const assigned = getAssignedModuleIdsForEmployee(employeeId, role);
  if (assigned.length === 0) return true; // no assignment data → do not hard-block
  return assigned.includes(moduleId);
}

export function getJourneyProfileAchievements(userId: string): JourneyAchievement[] {
  // Access zustand state via api (works outside React components)
  const api = useJourneyStore as unknown as { getState: () => any };
  const state = api.getState ? api.getState() : {};
  const employees: any[] = state.employees || [];
  const attempts: any[] = state.attempts || [];
  const evidence: any[] = state.evidence || [];
  const currentEmployeeId: string | null = state.currentEmployeeId || null;

  const employeeId =
    resolveJourneyEmployeeId(userId)
    || (userId === currentEmployeeId ? currentEmployeeId : null);
  if (!employeeId) {
    // No reliable mapping for this userId → return empty. Do not fabricate.
    return [];
  }

  const employee = employees.find((e: any) => e.id === employeeId);
  if (!employee) return [];

  const achievements: JourneyAchievement[] = [];

  // ACHC bundle complete (positive only) - use actual shape
  try {
    const calc: any = calculateAchcEmployeeStatus({ employee, attempts, evidence });
    const passed = calc.bundle_status === 'passed' || (calc.completed ?? 0) >= (calc.assigned ?? 0);
    if (passed) {
      const latest = attempts
        .filter((a: any) => a.employeeId === employeeId && isAchcModuleId(a.moduleId || ''))
        .sort((a: any, b: any) => ((b.completedAt || '') as string).localeCompare((a.completedAt || '') as string))[0];
      achievements.push({
        id: 'achc-annual-complete',
        label: ACHC_BUNDLE_NAME || 'ACHC Annual Training Complete',
        source: 'journey_completion',
        completedAt: latest?.completedAt,
        detail: 'All required ACHC modules passed',
      });
    }
  } catch {
    // ignore calc errors; never surface partial
  }

  // Onboarding / clearance (positive gates only)
  if (employee.clearedForIndependentWork) {
    achievements.push({
      id: 'onboarding-cleared',
      label: 'Onboarding Cleared',
      source: 'clearance',
      detail: 'Cleared for independent work',
    });
  }

  // Generic completion count (positive)
  const completedCount = attempts.filter(
    (a: any) => a.employeeId === employeeId && (a.status === 'passed' || a.status === 'completed'),
  ).length;

  if (completedCount >= 5) {
    achievements.push({
      id: 'journey-champion',
      label: 'Journey Champion',
      source: 'journey_completion',
      detail: `${completedCount}+ modules completed`,
    });
  }

  return achievements;
}

/** React hook wrapper for components. */
export function useJourneyProfileAchievements(userId: string): JourneyAchievement[] {
  // Force re-compute on store changes (lightweight)
  useJourneyStore((s) => s.employees.length + s.attempts.length);
  return getJourneyProfileAchievements(userId);
}
