/* ═══════════════════════════════════════════════════════════════
   JOURNEY STORE — single source of truth for onboarding progress.
   Persisted to localStorage so a surveyor-ready audit trail
   survives reload. A production build should swap the persistence
   adapter for a secure API layer — the public surface remains
   identical.
   ═══════════════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  AppendixFItem,
  JourneyEmployee,
  JourneyEscalation,
  JourneyEvidence,
  ModuleAttempt,
  RemediationPlan,
  SignatureRecord,
  SupervisedVisit,
} from '@/policy/journey/types/journey';
import type { ScormData } from '@/policy/journey/scorm/ScormRuntime';
import { moduleById } from '@/policy/journey/data/modules';
import { APPENDIX_F_TEMPLATE } from '@/policy/journey/data/appendices';
import { SEED_EMPLOYEES } from '@/policy/journey/data/employees';
import { evaluateEscalations } from '@/policy/journey/utils/escalation';
import { scormTimeToSeconds } from '@/policy/journey/scorm/ScormRuntime';
import { createAchcCompletionEvidence, isAchcModuleId } from '@/policy/journey/utils/achcTrainingCalculations';
// Phase 2E: demo user-setup audit (client-side only — not tamper-evident)
import { appendUserSetupAudit } from '@/policy/security/identity/userAssignmentsStore';

interface JourneyState {
  currentEmployeeId: string;
  employees: JourneyEmployee[];
  attempts: ModuleAttempt[];
  evidence: JourneyEvidence[];
  escalations: JourneyEscalation[];
  supervisedVisits: SupervisedVisit[];
  remediationPlans: RemediationPlan[];
  /** Appendix F per employee. */
  appendixF: Record<string, AppendixFItem[]>;
  /** Sign-off records linked to appendix F. */
  appendixFSignatures: Record<string, SignatureRecord[]>;

  setCurrentEmployee: (id: string) => void;
  updateAppendixFItem: (employeeId: string, itemId: number, status: AppendixFItem['status'], notes?: string) => void;
  signAppendixF: (employeeId: string, sig: SignatureRecord) => { ok: boolean; message: string };

  startAttempt: (employeeId: string, moduleId: string) => ModuleAttempt;
  applyScormCommit: (attemptId: string, data: ScormData) => void;
  finalizeAttempt: (attemptId: string, data: ScormData) => void;
  /** Manual pass/fail (for non-SCORM methods: return-demo, skills check-off, etc.). */
  recordManualAssessment: (
    employeeId: string,
    moduleId: string,
    result: { passed: boolean; score?: number; notes?: string },
    supervisor: SignatureRecord,
    learner?: SignatureRecord,
  ) => ModuleAttempt;

  /** Bridge from learner player (GAO/role quizzes, lessons) — self-completed without immediate supervisor sig. */
  recordLearnerCompletion: (employeeId: string, moduleId: string, passed: boolean, score?: number, notes?: string) => ModuleAttempt;

  /** Add evidence (Appendix capture). */
  addEvidence: (ev: Omit<JourneyEvidence, 'id' | 'createdAt' | 'updatedAt'>) => JourneyEvidence;

  addSupervisedVisit: (v: Omit<SupervisedVisit, 'id' | 'createdAt'>) => SupervisedVisit;

  openRemediation: (employeeId: string, moduleId: string, reason: string, actions: string[]) => RemediationPlan;
  resolveRemediation: (id: string, outcome: 'Completed' | 'Failed') => void;

  acknowledgeEscalation: (id: string, actor: string) => void;
  resolveEscalation: (id: string, actor: string) => void;

  /** Walks every employee and (re)computes escalations. */
  recomputeEscalations: () => void;

  /** Supervisor clearance — final gate before independent work. */
  clearForIndependentWork: (employeeId: string, signature: SignatureRecord) => { ok: boolean; message: string };
}

function nowIso() { return new Date().toISOString(); }

function ensureAppendixF(state: JourneyState, employeeId: string): AppendixFItem[] {
  return state.appendixF[employeeId] ?? APPENDIX_F_TEMPLATE.map(i => ({ ...i }));
}

export const useJourneyStore = create<JourneyState>()(
  persist(
    (set, get) => ({
      currentEmployeeId: SEED_EMPLOYEES[0].id,
      employees: SEED_EMPLOYEES,
      attempts: [],
      evidence: [],
      escalations: [],
      supervisedVisits: [],
      remediationPlans: [],
      appendixF: {},
      appendixFSignatures: {},

      setCurrentEmployee(id) { set({ currentEmployeeId: id }); },

      updateAppendixFItem(employeeId, itemId, status, notes) {
        set(state => {
          const current = ensureAppendixF(state, employeeId);
          const updated = current.map(it =>
            it.id === itemId ? { ...it, status, notes, completedAt: nowIso() } : it,
          );
          return { appendixF: { ...state.appendixF, [employeeId]: updated } };
        });
      },

      signAppendixF(employeeId, sig) {
        const state = get();
        const items = ensureAppendixF(state, employeeId);
        const incomplete = items.filter(i => i.status !== 'PASS' && i.status !== 'NA');
        if (incomplete.length) {
          return {
            ok: false,
            message: `Cannot sign: ${incomplete.length} item(s) still PENDING/FAIL (e.g., item ${incomplete[0].id} — ${incomplete[0].label}). HR-TA-001 §6.4.4 requires every line PASS/NA.`,
          };
        }
        if (sig.role !== 'HRDirector') {
          return { ok: false, message: 'Appendix F must be signed by the HR Director.' };
        }
        set(s => {
          const sigs = s.appendixFSignatures[employeeId] ?? [];
          return {
            appendixFSignatures: { ...s.appendixFSignatures, [employeeId]: [...sigs, sig] },
            employees: s.employees.map(e => (e.id === employeeId ? { ...e, appendixFCleared: true } : e)),
          };
        });
        get().recomputeEscalations();
        // Demo audit trail — not tamper-evident
        appendUserSetupAudit({
          actorUserId: sig.name || sig.role || 'unknown-signer',
          action: 'appendixFSign',
          targetUserId: employeeId,
          detail: `Appendix F signed as ${sig.role}`,
        });
        return { ok: true, message: 'Appendix F signed. Employee cleared to begin orientation.' };
      },

      startAttempt(employeeId, moduleId) {
        const module = moduleById(moduleId);
        if (!module) throw new Error(`Unknown module ${moduleId}`);
        const existing = get().attempts
          .filter(a => a.employeeId === employeeId && a.moduleId === moduleId)
          .sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0];

        if (existing && existing.status === 'in-progress') {
          return existing;
        }

        const attempt: ModuleAttempt = {
          id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          employeeId,
          moduleId,
          attemptNumber: (existing?.attemptNumber ?? 0) + 1,
          startedAt: nowIso(),
          completedAt: null,
          lessonStatus: existing?.suspendData ? 'incomplete' : 'not attempted',
          scoreRaw: null,
          scoreMin: 0,
          scoreMax: 100,
          timeSpentSec: existing?.timeSpentSec ?? 0,
          suspendData: existing?.suspendData ?? '',
          lessonLocation: existing?.lessonLocation ?? '',
          exit: '',
          status: 'in-progress',
        };
        set(s => ({ attempts: [attempt, ...s.attempts] }));
        return attempt;
      },

      applyScormCommit(attemptId, data) {
        set(s => ({
          attempts: s.attempts.map(a =>
            a.id !== attemptId
              ? a
              : {
                  ...a,
                  lessonStatus: data.lesson_status,
                  scoreRaw: data.score_raw ? Number(data.score_raw) : a.scoreRaw,
                  scoreMin: data.score_min ? Number(data.score_min) : a.scoreMin,
                  scoreMax: data.score_max ? Number(data.score_max) : a.scoreMax,
                  suspendData: data.suspend_data,
                  lessonLocation: data.lesson_location,
                  exit: data.exit,
                  timeSpentSec: a.timeSpentSec + scormTimeToSeconds(data.session_time),
                },
          ),
        }));
      },

      finalizeAttempt(attemptId, data) {
        set(s => ({
          attempts: s.attempts.map(a => {
            if (a.id !== attemptId) return a;
            const module = moduleById(a.moduleId);
            const threshold = (module?.passThreshold ?? 0.8) * 100;
            const score = data.score_raw ? Number(data.score_raw) : a.scoreRaw ?? 0;
            const passed =
              data.lesson_status === 'passed' ||
              (data.lesson_status === 'completed' && (module?.method === 'None' || score >= threshold));
            return {
              ...a,
              completedAt: nowIso(),
              lessonStatus: passed ? 'passed' : (data.lesson_status === 'failed' ? 'failed' : data.lesson_status),
              scoreRaw: score,
              suspendData: data.suspend_data,
              lessonLocation: data.lesson_location,
              exit: data.exit || 'normal',
              timeSpentSec: a.timeSpentSec + scormTimeToSeconds(data.session_time),
              status: passed ? 'completed' : (score > 0 ? 'failed' : 'in-progress'),
            };
          }),
        }));
        const s = get();
        const attempt = s.attempts.find(a => a.id === attemptId);
        const module = attempt ? moduleById(attempt.moduleId) : undefined;
        const employee = attempt ? s.employees.find(e => e.id === attempt.employeeId) : undefined;
        if (
          attempt &&
          module &&
          employee &&
          attempt.status === 'completed' &&
          isAchcModuleId(module.id) &&
          !s.evidence.some(ev =>
            ev.employeeId === employee.id &&
            ev.moduleId === module.id &&
            ev.data.bundle_id === 'ACHC_ANNUAL_FIELD_WORKER_TRAINING' &&
            ev.data.attempt_count === attempt.attemptNumber
          )
        ) {
          const completedAt = attempt.completedAt ?? nowIso();
          const evidence = createAchcCompletionEvidence(employee, module, attempt, completedAt);
          const row: JourneyEvidence = {
            ...evidence,
            id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            createdAt: completedAt,
            updatedAt: completedAt,
          };
          set(current => ({ evidence: [row, ...current.evidence] }));
        }
        get().recomputeEscalations();
      },

      recordManualAssessment(employeeId, moduleId, result, supervisor, learner) {
        const module = moduleById(moduleId);
        if (!module) throw new Error(`Unknown module ${moduleId}`);
        const existing = get().attempts.filter(a => a.employeeId === employeeId && a.moduleId === moduleId);
        const attemptNumber = existing.length + 1;

        const attempt: ModuleAttempt = {
          id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          employeeId,
          moduleId,
          attemptNumber,
          startedAt: nowIso(),
          completedAt: nowIso(),
          lessonStatus: result.passed ? 'passed' : 'failed',
          scoreRaw: result.score ?? (result.passed ? 100 : 0),
          scoreMin: 0,
          scoreMax: 100,
          timeSpentSec: 0,
          suspendData: '',
          lessonLocation: '',
          exit: 'normal',
          status: result.passed ? 'completed' : 'failed',
        };
        const signatures: SignatureRecord[] = [supervisor];
        if (learner) signatures.push(learner);
        const evidence: JourneyEvidence = {
          id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          employeeId,
          moduleId,
          appendix: module.evidenceAppendix ?? 'NONE',
          data: { method: module.method, score: attempt.scoreRaw, notes: result.notes ?? '' },
          signatures,
          attachments: [],
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set(s => ({ attempts: [attempt, ...s.attempts], evidence: [evidence, ...s.evidence] }));
        get().recomputeEscalations();
        return attempt;
      },

      recordLearnerCompletion(employeeId, moduleId, passed, score, _notes) {
        const module = moduleById(moduleId);
        if (!module) throw new Error(`Unknown module ${moduleId}`);
        const existing = get().attempts.filter(a => a.employeeId === employeeId && a.moduleId === moduleId);
        const attemptNumber = existing.length + 1;
        const now = nowIso();
        const finalScore = score ?? (passed ? 100 : 0);
        const lessonStatus = passed ? 'passed' : 'failed';
        const attempt: ModuleAttempt = {
          id: `ATT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          employeeId,
          moduleId,
          attemptNumber,
          startedAt: now,
          completedAt: now,
          lessonStatus,
          scoreRaw: finalScore,
          scoreMin: 0,
          scoreMax: 100,
          timeSpentSec: 0,
          suspendData: '',
          lessonLocation: '',
          exit: 'normal',
          status: passed ? 'completed' : 'failed',
        };
        set(s => ({ attempts: [attempt, ...s.attempts] }));
        get().recomputeEscalations();
        return attempt;
      },

      addEvidence(ev) {
        const row: JourneyEvidence = {
          ...ev,
          id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: nowIso(),
          updatedAt: nowIso(),
        };
        set(s => ({ evidence: [row, ...s.evidence] }));
        return row;
      },

      addSupervisedVisit(v) {
        const row: SupervisedVisit = {
          ...v,
          id: `SV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          createdAt: nowIso(),
        };
        set(s => ({ supervisedVisits: [row, ...s.supervisedVisits] }));
        // Demo audit trail — not tamper-evident
        appendUserSetupAudit({
          actorUserId: v.supervisorId || 'unknown-supervisor',
          action: 'supervisedVisitSave',
          targetUserId: v.employeeId,
          detail: `Supervised visit ${row.id}`,
        });
        return row;
      },

      openRemediation(employeeId, moduleId, reason, actions) {
        const due = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
        const r: RemediationPlan = {
          id: `REM-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          employeeId, moduleId, reason, actions,
          createdAt: nowIso(),
          dueBy: due,
          status: 'Open',
        };
        set(s => ({ remediationPlans: [r, ...s.remediationPlans] }));
        return r;
      },

      resolveRemediation(id, outcome) {
        set(s => ({
          remediationPlans: s.remediationPlans.map(r =>
            r.id === id ? { ...r, status: outcome, resolvedAt: nowIso() } : r,
          ),
        }));
        get().recomputeEscalations();
      },

      acknowledgeEscalation(id, actor = 'unknown') {
        const esc = get().escalations.find(e => e.id === id);
        set(s => ({
          escalations: s.escalations.map(e => (e.id === id ? { ...e, status: 'Acknowledged' } : e)),
        }));
        // Demo audit trail — not tamper-evident
        appendUserSetupAudit({
          actorUserId: actor,
          action: 'acknowledgeEscalation',
          targetUserId: esc?.employeeId,
          detail: `Escalation ${id}${esc?.type ? ` (${esc.type})` : ''}`,
        });
      },
      resolveEscalation(id, actor) {
        const esc = get().escalations.find(e => e.id === id);
        set(s => ({
          escalations: s.escalations.map(e =>
            e.id === id ? { ...e, status: 'Resolved', resolvedAt: nowIso(), resolvedBy: actor } : e,
          ),
        }));
        // Demo audit trail — not tamper-evident
        appendUserSetupAudit({
          actorUserId: actor,
          action: 'resolveEscalation',
          targetUserId: esc?.employeeId,
          detail: `Escalation ${id}${esc?.type ? ` (${esc.type})` : ''}`,
        });
      },

      recomputeEscalations() {
        const s = get();
        const fresh = evaluateEscalations({
          now: new Date(),
          employees: s.employees,
          attempts: s.attempts,
          remediations: s.remediationPlans,
        });
        const existing = new Map(s.escalations.map(e => [e.id, e]));
        for (const e of fresh) {
          const prior = existing.get(e.id);
          if (prior) continue; // keep prior status (Ack/Resolved)
          existing.set(e.id, e);
        }
        set({ escalations: Array.from(existing.values()) });
      },

      clearForIndependentWork(employeeId, signature) {
        if (signature.role !== 'DON' && signature.role !== 'Supervisor') {
          return { ok: false, message: 'Clearance must be signed by the DON (HR-TA-005 Appendix B).' };
        }
        set(s => ({
          employees: s.employees.map(e =>
            e.id === employeeId ? { ...e, clearedForIndependentWork: true } : e,
          ),
          evidence: [
            {
              id: `EV-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              employeeId,
              appendix: 'HRTA005_B',
              data: { decision: 'SATISFACTORY', policy: 'HR-TA-005 §6.1' },
              signatures: [signature],
              attachments: [],
              createdAt: nowIso(),
              updatedAt: nowIso(),
            },
            ...s.evidence,
          ],
        }));
        return { ok: true, message: 'Employee cleared for independent practice.' };
      },
    }),
    {
      name: 'ci-journey-v1',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        currentEmployeeId: s.currentEmployeeId,
        employees: s.employees,
        attempts: s.attempts,
        evidence: s.evidence,
        escalations: s.escalations,
        supervisedVisits: s.supervisedVisits,
        remediationPlans: s.remediationPlans,
        appendixF: s.appendixF,
        appendixFSignatures: s.appendixFSignatures,
      }),
      /**
       * Defensive rehydration: if a previous build persisted an employee
       * roster that no longer contains `currentEmployeeId`, the page would
       * crash because every component dereferences employee!.role. Clamp
       * to the first seeded employee and ensure every employee has an
       * Appendix F bag initialized (templated from HR-TA-001 §6.4).
       */
      merge: (persisted, current) => {
        const merged = { ...current, ...(persisted as Partial<JourneyState>) };
        const emps = merged.employees?.length ? merged.employees : SEED_EMPLOYEES;
        const stillThere = emps.find(e => e.id === merged.currentEmployeeId);
        if (!stillThere) merged.currentEmployeeId = emps[0].id;
        merged.employees = emps;
        const apx = { ...(merged.appendixF ?? {}) };
        for (const e of emps) {
          if (!apx[e.id]) apx[e.id] = APPENDIX_F_TEMPLATE.map(i => ({ ...i }));
        }
        merged.appendixF = apx;
        merged.appendixFSignatures = merged.appendixFSignatures ?? {};
        return merged;
      },
    },
  ),
);

/* Auto-seed Appendix F from template on first read for each employee. */
export function getAppendixFFor(employeeId: string): AppendixFItem[] {
  const s = useJourneyStore.getState();
  return s.appendixF[employeeId] ?? APPENDIX_F_TEMPLATE.map(i => ({ ...i }));
}
