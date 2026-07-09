/**
 * Demo-only journey learner / employee switcher (Phase 2C).
 *
 * Bridges identity setup users (usr-*) and SEED journey employees (EMP-*)
 * into `journeyStore.currentEmployeeId` via setCurrentEmployee.
 * Not a real session / IdP impersonation — label is always visible.
 */

import { useMemo } from 'react';
import { UserCircle2 } from 'lucide-react';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { useUserAssignmentsStore } from '@/policy/security/identity/userAssignmentsStore';
import {
  DEMO_JOURNEY_EMPLOYEE_MAP,
  JOURNEY_EMPLOYEE_TO_IDENTITY,
  resolveJourneyEmployeeId,
} from '@/v6/utils/journeyProfileAdapter';

export const DEMO_IMPERSONATION_LABEL = 'Demo impersonation — not a real session';

export interface DemoImpersonationOption {
  /** Value written to journeyStore.currentEmployeeId (always EMP-* when available). */
  employeeId: string;
  /** Display label. */
  label: string;
  /** Optional identity user id that maps to this EMP. */
  identityUserId?: string;
}

/** Build selectable EMP options from journey roster + Phase 2A seed refs. */
export function buildDemoImpersonationOptions(
  employees: Array<{ id: string; name: string; role: string }>,
  setupAssignments?: Record<string, { journeyEmployeeSeedRef?: string; role?: string | null; active?: boolean }>,
): DemoImpersonationOption[] {
  const byEmp = new Map<string, DemoImpersonationOption>();

  for (const emp of employees) {
    const identityUserId = JOURNEY_EMPLOYEE_TO_IDENTITY[emp.id];
    byEmp.set(emp.id, {
      employeeId: emp.id,
      label: `${emp.name} (${emp.role}${identityUserId ? ` · ${identityUserId}` : ''})`,
      identityUserId,
    });
  }

  // Include setup rows that have journeyEmployeeSeedRef even if already present (enrich labels)
  if (setupAssignments) {
    for (const [userId, setup] of Object.entries(setupAssignments)) {
      if (setup.active === false) continue;
      const empId = setup.journeyEmployeeSeedRef || DEMO_JOURNEY_EMPLOYEE_MAP[userId];
      if (!empId) continue;
      if (!byEmp.has(empId)) {
        byEmp.set(empId, {
          employeeId: empId,
          label: `${userId} → ${empId}${setup.role ? ` (${setup.role})` : ''}`,
          identityUserId: userId,
        });
      }
    }
  }

  return Array.from(byEmp.values()).sort((a, b) => a.employeeId.localeCompare(b.employeeId));
}

/**
 * Compact demo control: pick current journey employee (impersonation until Phase 2F).
 * Place on SupervisorScreen, JourneyAcademyScreen, or shared shell.
 */
export function DemoImpersonationBar({ className = '' }: { className?: string }) {
  const currentEmployeeId = useJourneyStore((s) => s.currentEmployeeId);
  const employees = useJourneyStore((s) => s.employees);
  const setCurrentEmployee = useJourneyStore((s) => s.setCurrentEmployee);
  const setupAssignments = useUserAssignmentsStore((s) => s.setupAssignments);
  const users = useUserAssignmentsStore((s) => s.users);

  const options = useMemo(
    () => buildDemoImpersonationOptions(employees, setupAssignments),
    [employees, setupAssignments],
  );

  const currentEmp = employees.find((e) => e.id === currentEmployeeId);
  const identityHint = JOURNEY_EMPLOYEE_TO_IDENTITY[currentEmployeeId];

  const onSelect = (value: string) => {
    // Accept EMP id or identity user id; always resolve to EMP for the store.
    const empId = resolveJourneyEmployeeId(value) || value;
    if (employees.some((e) => e.id === empId) || options.some((o) => o.employeeId === empId)) {
      setCurrentEmployee(empId);
    }
  };

  // Extra identity-only picks (no EMP roster row) — rare; still try seed ref resolution
  const identityOnly = useMemo(() => {
    return users
      .filter((u) => {
        const setup = setupAssignments[u.id];
        if (setup?.active === false) return false;
        const empId = setup?.journeyEmployeeSeedRef || DEMO_JOURNEY_EMPLOYEE_MAP[u.id];
        return !!empId && !employees.some((e) => e.id === empId);
      })
      .map((u) => {
        const empId = setupAssignments[u.id]?.journeyEmployeeSeedRef || DEMO_JOURNEY_EMPLOYEE_MAP[u.id]!;
        return { userId: u.id, empId, name: u.name };
      });
  }, [users, setupAssignments, employees]);

  return (
    <div
      className={`rounded-lg border border-amber-300/70 bg-amber-50/90 px-3 py-2 text-xs text-amber-950 shadow-sm ${className}`}
      role="region"
      aria-label={DEMO_IMPERSONATION_LABEL}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-2 min-w-0">
          <UserCircle2 size={16} className="shrink-0 mt-0.5 text-amber-700" aria-hidden />
          <div className="min-w-0">
            <div className="font-bold uppercase tracking-wider text-[10px] text-amber-800">
              {DEMO_IMPERSONATION_LABEL}
            </div>
            <div className="text-[11px] text-amber-900/90 truncate">
              Current learner:{' '}
              <strong>{currentEmp?.name ?? currentEmployeeId}</strong>
              {identityHint ? (
                <span className="text-amber-800/80"> · identity {identityHint}</span>
              ) : null}
            </div>
          </div>
        </div>
        <label className="flex items-center gap-2 shrink-0">
          <span className="font-semibold text-[10px] uppercase tracking-wide text-amber-800 whitespace-nowrap">
            View as
          </span>
          <select
            value={currentEmployeeId}
            onChange={(e) => onSelect(e.target.value)}
            className="max-w-[min(100vw-4rem,22rem)] border border-amber-300 rounded-md bg-white px-2 py-1.5 text-[11px] text-secondary"
            aria-label="Demo learner or employee to impersonate"
          >
            {options.map((opt) => (
              <option key={opt.employeeId} value={opt.employeeId}>
                {opt.label}
              </option>
            ))}
            {identityOnly.map((row) => (
              <option key={row.userId} value={row.empId}>
                {row.name} ({row.userId} → {row.empId})
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export default DemoImpersonationBar;
