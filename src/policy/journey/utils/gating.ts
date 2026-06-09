/* ═══════════════════════════════════════════════════════════════
   GATING LOGIC — Enforces the CMS-aligned ordering:
     0  Pre-Day-1  (Appendix F PASS + HR Director sig)
     1  General Agency Orientation (all 27 + GAO-EXAM 80%)
     2  Role-Specific modules (per JD)
     3  Supervised Visits (min per role)
     4  Annual Competency
     → Cleared for independent practice
   ═══════════════════════════════════════════════════════════════ */

import type {
  JourneyEmployee,
  JourneyEvidence,
  JourneyModule,
  ModuleAttempt,
  SupervisedVisit,
  JourneyProgress,
} from '@/policy/journey/types/journey';
import { modulesForRole } from '@/policy/journey/data/modules';
import { calculateAchcModuleStatus, isAchcModuleId } from '@/policy/journey/utils/achcTrainingCalculations';

export interface GateDecision {
  unlocked: boolean;
  reason: string;
  blockedBy?: string[];
}

export function latestAttempt(
  attempts: ModuleAttempt[],
  employeeId: string,
  moduleId: string,
): ModuleAttempt | undefined {
  return attempts
    .filter(a => a.employeeId === employeeId && a.moduleId === moduleId)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];
}

export function isModulePassed(
  module: JourneyModule,
  attempt?: ModuleAttempt,
): boolean {
  if (!attempt) return false;
  if (attempt.status === 'failed') return false;
  if (attempt.lessonStatus === 'passed') return true;
  if (attempt.lessonStatus === 'completed' && module.method === 'None') return true;
  const threshold = (module.passThreshold ?? 0.8) * 100;
  return (attempt.scoreRaw ?? 0) >= threshold && attempt.lessonStatus !== 'failed';
}

export function canStartModule(
  employee: JourneyEmployee,
  module: JourneyModule,
  allAttempts: ModuleAttempt[],
): GateDecision {
  // Hard Stop 0: Appendix F
  if (!employee.appendixFCleared) {
    return {
      unlocked: false,
      reason:
        'BLOCKED — Pre-Employment Screening (Appendix F) is not complete & signed by HR Director. No individual performs ANY work, including orientation, until HR-TA-001 §4.3 is satisfied.',
    };
  }

  // Phase-level gate: GAO must precede ROLE
  const isRole = module.group === 'ROLE';
  if (isRole) {
    const gaoModules = modulesForRole(employee.role).filter(m => m.group === 'GAO');
    const gaoPending = gaoModules.filter(g => {
      const a = latestAttempt(allAttempts, employee.id, g.id);
      return !isModulePassed(g, a);
    });
    if (gaoPending.length) {
      return {
        unlocked: false,
        reason: 'BLOCKED — General Agency Orientation (GAO) not complete. Per HR-TA-005 §8.2, no clinical staff may be assigned until GAO is finished.',
        blockedBy: gaoPending.map(g => g.id),
      };
    }
  }

  // Explicit per-module prerequisites
  for (const prereq of module.prerequisites ?? []) {
    const prereqModule = modulesForRole(employee.role).find(m => m.id === prereq);
    if (!prereqModule) continue;
    const a = latestAttempt(allAttempts, employee.id, prereq);
    if (!isModulePassed(prereqModule, a)) {
      return {
        unlocked: false,
        reason: `BLOCKED — Prerequisite ${prereq} not passed.`,
        blockedBy: [prereq],
      };
    }
  }

  return { unlocked: true, reason: 'Unlocked.' };
}

export function canClearForIndependentWork(
  employee: JourneyEmployee,
  attempts: ModuleAttempt[],
  visits: SupervisedVisit[],
): { ok: boolean; gaps: string[] } {
  const gaps: string[] = [];
  const mods = modulesForRole(employee.role);
  const gaoExam = mods.find(m => m.id === 'GAO-EXAM');
  const gaoExamAttempt = gaoExam ? latestAttempt(attempts, employee.id, gaoExam.id) : undefined;
  if (!gaoExam || !isModulePassed(gaoExam, gaoExamAttempt)) {
    gaps.push('GAO-EXAM must be passed at ≥80% (HR-TA-005 Appendix D).');
  }
  const roleMods = mods.filter(m => m.group === 'ROLE' && m.phase !== 'SUPERVISED');
  const rolePending = roleMods.filter(r => !isModulePassed(r, latestAttempt(attempts, employee.id, r.id)));
  if (rolePending.length) {
    gaps.push(`Role modules incomplete: ${rolePending.map(m => m.id).join(', ')}.`);
  }
  const supMods = mods.filter(m => m.phase === 'SUPERVISED');
  for (const sup of supMods) {
    const required = sup.supervisedVisitsRequired ?? 0;
    const completed = visits.filter(v => v.employeeId === employee.id && v.rating === 'SATISFACTORY').length;
    if (completed < required) {
      gaps.push(`Supervised visits: ${completed}/${required} (${sup.id}).`);
    }
  }
  return { ok: gaps.length === 0, gaps };
}

export function computeProgress(
  employee: JourneyEmployee,
  attempts: ModuleAttempt[],
  visits: SupervisedVisit[],
  openEscalations: number,
  evidence: JourneyEvidence[] = [],
): JourneyProgress {
  const mods = modulesForRole(employee.role);
  const gao = mods.filter(m => m.group === 'GAO' && m.id !== 'GAO-EXAM');
  const gaoPassed = gao.filter(m => isModulePassed(m, latestAttempt(attempts, employee.id, m.id))).length;
  const role = mods.filter(m => m.group === 'ROLE' && m.phase === 'ROLE');
  const rolePassed = role.filter(m => isModulePassed(m, latestAttempt(attempts, employee.id, m.id))).length;
  const annual = mods.filter(m => m.group === 'ANN');
  const annualPassed = annual.filter(m => {
    if (isAchcModuleId(m.id)) {
      return calculateAchcModuleStatus({ employee, module: m, attempts, evidence }).compliant;
    }
    return isModulePassed(m, latestAttempt(attempts, employee.id, m.id));
  }).length;
  const supMods = mods.filter(m => m.phase === 'SUPERVISED');
  const supReq = supMods.reduce((n, m) => n + (m.supervisedVisitsRequired ?? 0), 0);
  const supDone = visits.filter(v => v.employeeId === employee.id && v.rating === 'SATISFACTORY').length;
  const gaoExam = mods.find(m => m.id === 'GAO-EXAM');
  const gaoExamPassed = gaoExam ? isModulePassed(gaoExam, latestAttempt(attempts, employee.id, gaoExam.id)) : false;
  const compAnn = mods.find(m => m.group === 'COMP' && (m.id === 'COMP-ANN-A' || m.id === 'COMP-ANN-D'));
  const compDone = compAnn ? isModulePassed(compAnn, latestAttempt(attempts, employee.id, compAnn.id)) : false;

  const eligible = canClearForIndependentWork(employee, attempts, visits).ok;

  return {
    employeeId: employee.id,
    role: employee.role,
    appendixFCleared: employee.appendixFCleared,
    gaoCompletePct: gao.length ? gaoPassed / gao.length : 0,
    gaoExamPassed,
    roleCompletePct: role.length ? rolePassed / role.length : 0,
    supervisedVisitsCompleted: Math.min(supDone, supReq),
    supervisedVisitsRequired: supReq,
    annualCompletePct: annual.length ? annualPassed / annual.length : 0,
    competencyAnnualCompleted: compDone,
    clearedForIndependentWork: employee.clearedForIndependentWork,
    eligibleForClearance: eligible,
    openEscalations,
  };
}
