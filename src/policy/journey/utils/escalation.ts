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

    /* 2. License expiring / expired — HR-TA-004 §6.2 */
    if (emp.licenseExpiry) {
      const exp = new Date(emp.licenseExpiry);
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

    /* 3. Annual / role module overdue — HR-TD-001 §4.6 */
    const candidateModules = modulesForRole(emp.role);
    for (const m of candidateModules) {
      if (m.group !== 'ANN' && m.group !== 'COMP' && m.group !== 'DRILL') continue;
      const a = latestAttempt(ctx.attempts, emp.id, m.id);
      if (isModulePassed(m, a)) continue;

      // For ANN/COMP/DRILL, assume Jan 1 is reference start; deadline = Dec 31
      const year = ctx.now.getFullYear();
      const deadline = new Date(`${year}-12-31`);
      const dOver = daysBetween(ctx.now, deadline);
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

/* Convenience: annual module reminder when pending but not yet overdue. */
export function moduleDeadlineStatus(module: JourneyModule, year = new Date().getFullYear()):
  | 'on-track' | 'warn' | 'critical' {
  if (module.group !== 'ANN') return 'on-track';
  const deadline = new Date(`${year}-12-31`);
  const days = Math.floor((deadline.getTime() - Date.now()) / DAY);
  if (days < 0) return 'critical';
  if (days < 30) return 'warn';
  return 'on-track';
}
