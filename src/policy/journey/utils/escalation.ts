/* ═══════════════════════════════════════════════════════════════
   ESCALATION ENGINE — mechanically applies:
     HR-TD-001 § 4.6  (annual training 30/45/60-day overdue)
     HR-TD-003 § 6.3  (competency remediation)
     HR-TA-003 § 6.3  (OIG/SAM)
     HR-TA-004 § 6.2  (license expiration + 120-day pre-renewal)
     HR-TA-001 §6.4 (Appendix F) / §6.7 (working before screening)

   Returns a fresh set of escalations each tick. The store merges
   them against already-existing Acknowledged/Resolved tickets so
   recurring triggers do not duplicate.

   Demo/local-only data until Phase 2F backend persistence.

   BEHAVIOR CHANGE (Phase 2D): ANN/COMP/DRILL deadlines are no longer
   a universal Dec 31. Modules with `annualQuarter` stagger by quarter
   end; modules without use a hire/firstDay-anchored annual cycle.
   ═══════════════════════════════════════════════════════════════ */

import type {
  JourneyEmployee,
  JourneyEscalation,
  JourneyModule,
  ModuleAttempt,
  RemediationPlan,
} from '@/policy/journey/types/journey';
import { ALL_MODULES, modulesForRole } from '@/policy/journey/data/modules';
import { isModulePassed, latestAttempt } from '@/policy/journey/utils/gating';

const DAY = 1000 * 60 * 60 * 24;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / DAY);
}

/** Parse YYYY-MM-DD (or ISO datetime) as local calendar date at noon (DST-safe). */
function parseLocalDate(iso: string): Date {
  const day = iso.slice(0, 10);
  const [y, m, d] = day.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

function localYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Quarter-end calendar deadlines (local noon):
 *   Q1 → Mar 31, Q2 → Jun 30, Q3 → Sep 30, Q4 → Dec 31
 */
export function quarterEndDate(
  year: number,
  quarter: NonNullable<JourneyModule['annualQuarter']>,
): Date {
  switch (quarter) {
    case 'Q1':
      return new Date(year, 2, 31, 12, 0, 0, 0);
    case 'Q2':
      return new Date(year, 5, 30, 12, 0, 0, 0);
    case 'Q3':
      return new Date(year, 8, 30, 12, 0, 0, 0);
    case 'Q4':
      return new Date(year, 11, 31, 12, 0, 0, 0);
    default:
      return new Date(year, 11, 31, 12, 0, 0, 0);
  }
}

/**
 * Resolve the compliance deadline for an ANN/COMP/DRILL module.
 *
 * Formula (documented for stakeholders — Phase 2D):
 *
 * 1. **Quarter-tagged modules** (`module.annualQuarter` set — typical ANN/DRILL):
 *    deadline = quarter-end of the *current calendar year*:
 *      Q1 → Mar 31, Q2 → Jun 30, Q3 → Sep 30, Q4 → Dec 31
 *    Overdue tiers fire only after that date (same 30/45/60 buckets as before).
 *
 * 2. **No quarter tag** (typical COMP annual re-eval, or ANN without quarter):
 *    Hire/firstDay-anchored annual cycle:
 *      anchor = employee.startDate ?? employee.hireDate
 *      first deadline = anchor + 1 year (anniversary)
 *      subsequent deadlines = same MM-DD each following year
 *    Effective deadline for overdue math = the most recent anniversary
 *    on or before `now` (or the upcoming first anniversary if not yet due —
 *    in which case days-overdue is negative and no OVERDUE_* fires).
 *
 * 3. **COMP-90DAY** (one-shot introductory eval):
 *    deadline = anchor + 90 calendar days.
 *
 * Previously every ANN/COMP/DRILL shared `${year}-12-31` (F20 / Phase 2D).
 */
export function resolveModuleDeadline(
  module: JourneyModule,
  employee: Pick<JourneyEmployee, 'hireDate' | 'startDate'>,
  now: Date = new Date(),
): Date {
  // One-shot 90-day intro evaluation — not a recurring annual.
  if (module.id === 'COMP-90DAY') {
    const anchorIso = employee.startDate || employee.hireDate;
    if (anchorIso) {
      const anchor = parseLocalDate(anchorIso);
      const due = new Date(anchor);
      due.setDate(due.getDate() + 90);
      return due;
    }
    // Fallback if no hire/start: end of current year (legacy-safe).
    return quarterEndDate(now.getFullYear(), 'Q4');
  }

  if (module.annualQuarter) {
    return quarterEndDate(now.getFullYear(), module.annualQuarter);
  }

  // Hire / firstDay-anchored annual cycle for modules without annualQuarter.
  const anchorIso = employee.startDate || employee.hireDate;
  if (!anchorIso) {
    return quarterEndDate(now.getFullYear(), 'Q4');
  }

  const anchor = parseLocalDate(anchorIso);
  const firstDeadline = new Date(anchor);
  firstDeadline.setFullYear(anchor.getFullYear() + 1);

  // Anniversary MM-DD in the current year.
  let anniversary = new Date(now.getFullYear(), anchor.getMonth(), anchor.getDate(), 12, 0, 0, 0);
  // If this year's anniversary is still in the future, the open cycle deadline
  // is last year's anniversary (or the first deadline if that is later).
  if (anniversary.getTime() > now.getTime()) {
    anniversary = new Date(now.getFullYear() - 1, anchor.getMonth(), anchor.getDate(), 12, 0, 0, 0);
  }

  // Before first anniversary: surface the first deadline (not yet overdue).
  if (now.getTime() < firstDeadline.getTime()) {
    return firstDeadline;
  }

  // Prefer firstDeadline if anniversary fell before the employee was eligible.
  if (anniversary.getTime() < firstDeadline.getTime()) {
    return firstDeadline;
  }

  return anniversary;
}

/**
 * Days past a module deadline (negative = not yet due).
 * Used by OVERDUE_30 / OVERDUE_45 / OVERDUE_60 tier selection.
 */
export function daysPastModuleDeadline(
  module: JourneyModule,
  employee: Pick<JourneyEmployee, 'hireDate' | 'startDate'>,
  now: Date = new Date(),
): number {
  const deadline = resolveModuleDeadline(module, employee, now);
  return daysBetween(now, deadline);
}

function mk(
  list: Map<string, JourneyEscalation>,
  id: string,
  e: Omit<JourneyEscalation, 'id' | 'status'>,
): void {
  if (!list.has(id)) {
    list.set(id, { id, status: 'Open', ...e });
  }
}

export interface EscalationCtx {
  now: Date;
  employees: JourneyEmployee[];
  attempts: ModuleAttempt[];
  remediations: RemediationPlan[];
}

export function evaluateEscalations(ctx: EscalationCtx): JourneyEscalation[] {
  const out = new Map<string, JourneyEscalation>();

  for (const emp of ctx.employees) {
    if (emp.terminated) continue;

    /* 1. Worker started before Appendix F complete — HR-TA-001 §6.4 (screening) / §6.7 (violation) */
    if (emp.startDate && !emp.appendixFCleared && new Date(emp.startDate) <= ctx.now) {
      mk(out, `ESC-APXF-${emp.id}`, {
        employeeId: emp.id,
        type: 'APPENDIX_F_INCOMPLETE',
        severity: 'CRITICAL',
        triggerAt: ctx.now.toISOString(),
        action: 'Immediate admin leave. Document incident. Counsel supervisor.',
        policyRef: 'HR-TA-001 §6.4',
      });
    }

    /* 2. License expiring / expired — HR-TA-004 §6.2
       Source field: JourneyEmployee.licenseExpiry (ISO date).
       LICENSE_EXPIRED when dLeft ≤ 0; LICENSE_EXPIRING_120 when 1..120 days remain. */
    if (emp.licenseExpiry) {
      const exp = parseLocalDate(emp.licenseExpiry);
      const dLeft = daysBetween(exp, ctx.now);
      if (dLeft <= 0) {
        mk(out, `ESC-LICEXP-${emp.id}`, {
          employeeId: emp.id,
          type: 'LICENSE_EXPIRED',
          severity: 'CRITICAL',
          triggerAt: ctx.now.toISOString(),
          action: 'Immediate removal from clinical duties. Unpaid leave.',
          policyRef: 'HR-TA-004 §6.2.5',
        });
      } else if (dLeft <= 120) {
        mk(out, `ESC-LIC120-${emp.id}`, {
          employeeId: emp.id,
          type: 'LICENSE_EXPIRING_120',
          severity: dLeft <= 30 ? 'CRITICAL' : 'WARN',
          triggerAt: ctx.now.toISOString(),
          action: 'Begin renewal tracking. Re-verify primary source per HR-TA-004.',
          policyRef: 'HR-TD-002',
        });
      }
    }

    /* 3. Annual / role module overdue — HR-TD-001 §4.6
       Deadline from resolveModuleDeadline (quarter end OR hire/firstDay anchor). */
    const candidateModules = modulesForRole(emp.role);
    for (const m of candidateModules) {
      if (m.group !== 'ANN' && m.group !== 'COMP' && m.group !== 'DRILL') continue;
      const a = latestAttempt(ctx.attempts, emp.id, m.id);
      if (isModulePassed(m, a)) continue;

      const dOver = daysPastModuleDeadline(m, emp, ctx.now);
      if (dOver < 0) continue; // not yet past deadline
      if (dOver >= 60) {
        mk(out, `ESC-O60-${emp.id}-${m.id}`, {
          employeeId: emp.id,
          type: 'OVERDUE_60',
          severity: 'CRITICAL',
          triggerAt: ctx.now.toISOString(),
          moduleId: m.id,
          action: 'Clinical: suspended from patient care. All staff: HR-ER-002 disciplinary.',
          policyRef: 'HR-TD-001 §4.6',
        });
      } else if (dOver >= 45) {
        mk(out, `ESC-O45-${emp.id}-${m.id}`, {
          employeeId: emp.id,
          type: 'OVERDUE_45',
          severity: 'WARN',
          triggerAt: ctx.now.toISOString(),
          moduleId: m.id,
          action: 'Second notice + supervisor meeting.',
          policyRef: 'HR-TD-001 §4.6',
        });
      } else if (dOver >= 30) {
        mk(out, `ESC-O30-${emp.id}-${m.id}`, {
          employeeId: emp.id,
          type: 'OVERDUE_30',
          severity: 'INFO',
          triggerAt: ctx.now.toISOString(),
          moduleId: m.id,
          action: 'Written reminder to employee + supervisor.',
          policyRef: 'HR-TD-001 §4.6',
        });
      }
    }

    /* 4. Competency failure (most recent attempt failed) — HR-TD-003 §6.3 */
    for (const m of candidateModules) {
      const a = latestAttempt(ctx.attempts, emp.id, m.id);
      if (a && a.status === 'failed') {
        mk(out, `ESC-CMP-${emp.id}-${m.id}`, {
          employeeId: emp.id,
          type: 'COMPETENCY_FAIL',
          severity: 'WARN',
          triggerAt: ctx.now.toISOString(),
          moduleId: m.id,
          action: 'Open Remediation Plan (HR-TD-003 Appendix C) within 7 days. 60-day max.',
          policyRef: 'HR-TD-003 §6.3',
        });
      }
    }

    /* 5. Remediation overdue (>60 days) */
    for (const r of ctx.remediations) {
      if (r.employeeId !== emp.id) continue;
      if (r.status !== 'Open') continue;
      if (new Date(r.dueBy) < ctx.now) {
        mk(out, `ESC-REM-${emp.id}-${r.id}`, {
          employeeId: emp.id,
          type: 'REMEDIATION_OVERDUE',
          severity: 'CRITICAL',
          triggerAt: ctx.now.toISOString(),
          moduleId: r.moduleId,
          action: 'Employment action per HR-ER-002.',
          policyRef: 'HR-TD-003 §6.3.4',
        });
      }
    }
  }

  return Array.from(out.values());
}

export function humanEscalation(e: JourneyEscalation): string {
  const m = e.moduleId ? ALL_MODULES.find(mm => mm.id === e.moduleId)?.title : '';
  const prefix = m ? `${e.moduleId} · ${m} · ` : '';
  return `${prefix}${e.action}`;
}

export function openEscalationsCount(list: JourneyEscalation[], employeeId: string): number {
  return list.filter(e => e.employeeId === employeeId && e.status === 'Open').length;
}

/**
 * Annual module reminder when pending but not yet overdue.
 * Honors `annualQuarter` when set; otherwise uses hire-agnostic year-end
 * of the quarter (or Q4 fallback) — employee-independent convenience helper.
 */
export function moduleDeadlineStatus(
  module: JourneyModule,
  year = new Date().getFullYear(),
  now: Date = new Date(),
): 'on-track' | 'warn' | 'critical' {
  if (module.group !== 'ANN' && module.group !== 'COMP' && module.group !== 'DRILL') {
    return 'on-track';
  }
  const deadline = module.annualQuarter
    ? quarterEndDate(year, module.annualQuarter)
    : quarterEndDate(year, 'Q4');
  const days = Math.floor((deadline.getTime() - now.getTime()) / DAY);
  if (days < 0) return 'critical';
  if (days < 30) return 'warn';
  return 'on-track';
}

/** Exported for tests / UI display of resolved due dates. */
export function formatModuleDeadline(
  module: JourneyModule,
  employee: Pick<JourneyEmployee, 'hireDate' | 'startDate'>,
  now: Date = new Date(),
): string {
  return localYmd(resolveModuleDeadline(module, employee, now));
}
