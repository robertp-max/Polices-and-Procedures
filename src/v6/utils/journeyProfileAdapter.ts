/**
 * Journey → Profile positive-only, non-PHI achievements adapter.
 *
 * Safe for surfacing:
 * - Only completed / passed / cleared positive states.
 * - Never failures, remediation, deficiencies, incomplete, PHI, patient data, performance rankings.
 *
 * IDENTITY MAPPING GAP (documented):
 * Journey uses its own SEED_EMPLOYEES (EMP-XXXX ids) + separate learnerState / journeyStore.
 * Auth / Community uses demo-user / u-*-* ids from AuthProvider + communityProfileAdapter.
 * No unified mapping exists yet. This adapter returns data only for explicitly known demo overlaps or current journey employee.
 * If no match, returns empty array (no fakes).
 *
 * Usage: Call from profile screens. Opt-in via future profile setting.
 */

import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import {
  calculateAchcEmployeeStatus,
  ACHC_BUNDLE_NAME,
  isAchcModuleId,
} from '@/policy/journey/utils/achcTrainingCalculations';

export interface JourneyAchievement {
  id: string;
  label: string;
  source: 'journey_completion' | 'clearance';
  completedAt?: string;
  detail?: string;
}

/** Known demo mapping (only for prototype). Real systems must unify user <-> employee ids. */
const DEMO_JOURNEY_EMPLOYEE_MAP: Record<string, string> = {
  'demo-user': 'EMP-1001', // Maria Santos, RN example
  'u-don-01': 'EMP-1001',
  'u-admin-brad': 'EMP-2001',
  'u-compliance-tp': 'EMP-1003',
};

export function getJourneyProfileAchievements(userId: string): JourneyAchievement[] {
  // Access zustand state via api (works outside React components)
  const api = useJourneyStore as unknown as { getState: () => any };
  const state = api.getState ? api.getState() : {};
  const employees: any[] = state.employees || [];
  const attempts: any[] = state.attempts || [];
  const evidence: any[] = state.evidence || [];
  const currentEmployeeId: string | null = state.currentEmployeeId || null;

  const employeeId = DEMO_JOURNEY_EMPLOYEE_MAP[userId] || (userId === currentEmployeeId ? currentEmployeeId : null);
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
