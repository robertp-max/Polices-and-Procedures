// Derived module/lesson completion - real per-module progress.
// M0 = orientation acknowledgements; M10-M17 = CCCCO ContentV2 lesson flows.

import { hasLegalName, type LearnerState } from "./learnerState";
import { ACTIVE_TIME } from "./activeTime";
import { courseModules, getModuleDef, moduleSequence, requiredTheoryModuleIds } from "../data/courseModules";
import type { ModuleDef } from "../data/lessonModel";

export function pct(parts: boolean[]): number {
  if (parts.length === 0) return 0;
  return Math.round((parts.filter(Boolean).length / parts.length) * 100);
}

export function lessonKey(moduleId: string, lessonId: string): string {
  return `${moduleId}:${lessonId}`;
}

export function lessonActiveSeconds(state: LearnerState, moduleId: string, lessonId: string): number {
  return state.lessonActiveSeconds[lessonKey(moduleId, lessonId)] || 0;
}

// A lesson is complete when viewed + knowledge check passed (if any) + active-time minimum met.
export function isLessonComplete(state: LearnerState, moduleId: string, lessonId: string): boolean {
  const def = getModuleDef(moduleId);
  const lesson = def?.lessons.find((l) => l.id === lessonId);
  if (!lesson) return false;
  const progress = state.lessonProgress[lessonKey(moduleId, lessonId)];
  if (!progress?.viewed) return false;
  const checkOk = lesson.knowledgeCheck ? Boolean(progress.checkPassed) : true;
  const timeOk = state.activeTimeMet || lessonActiveSeconds(state, moduleId, lessonId) >= ACTIVE_TIME.LESSON_MIN_SECONDS;
  return checkOk && timeOk;
}

export function isModule0Complete(state: LearnerState): boolean {
  return (
    hasLegalName(state) &&
    Boolean(state.cnaNumber.trim()) &&
    state.onlineCapAck &&
    state.phiAck &&
    state.orientationFinalAck
  );
}

export function completedLessonCount(state: LearnerState, def: ModuleDef): number {
  return def.lessons.filter((l) => isLessonComplete(state, def.id, l.id)).length;
}

export function isModuleComplete(state: LearnerState, moduleId: string): boolean {
  const def = getModuleDef(moduleId);
  if (!def) return false;
  if (def.kind === "orientation") return isModule0Complete(state);
  if (def.kind === "locked") return false; // source repair required
  if (def.kind === "final") return state.finalExamPassed && state.affidavitComplete;
  return def.lessons.length > 0 && completedLessonCount(state, def) === def.lessons.length;
}

export function moduleProgressPct(state: LearnerState, moduleId: string): number {
  const def = getModuleDef(moduleId);
  if (!def) return 0;
  if (def.kind === "orientation") {
    return isModule0Complete(state)
      ? 100
      : pct([
          hasLegalName(state),
          Boolean(state.cnaNumber.trim()),
          state.onlineCapAck,
          state.phiAck,
          state.orientationFinalAck,
        ]);
  }
  if (def.kind === "locked") return 0;
  if (def.kind === "final") return pct([state.finalExamPassed, state.affidavitComplete]);
  if (def.lessons.length === 0) return 0;
  return Math.round((completedLessonCount(state, def) / def.lessons.length) * 100);
}

// Sequential unlock order follows the generated ContentV2 module sequence.
const unlockChain = moduleSequence;

export function isModuleUnlocked(state: LearnerState, moduleId: string): boolean {
  if (state.unlockMode) return true;
  const def = getModuleDef(moduleId);
  if (def?.kind === "locked") return false;
  const idx = unlockChain.indexOf(moduleId);
  if (idx <= 0) return true;
  const prev = unlockChain[idx - 1];
  return isModuleComplete(state, prev);
}

export function requiredTheoryComplete(state: LearnerState): boolean {
  return requiredTheoryModuleIds.every((id) => isModuleComplete(state, id));
}

// ---- Active-time evidence (real engine, demo thresholds) ----
export function totalRequiredActiveSeconds(state: LearnerState): number {
  let total = 0;
  for (const def of courseModules) {
    if (!def.countsTowardTheory) continue;
    for (const lesson of def.lessons) {
      total += lessonActiveSeconds(state, def.id, lesson.id);
    }
  }
  return total;
}

export function activeTimeMet(state: LearnerState): boolean {
  return state.activeTimeMet || totalRequiredActiveSeconds(state) >= ACTIVE_TIME.CERT_GATE_SECONDS;
}

export function requiredInteractionComplete(state: LearnerState): boolean {
  // No-PHI ack + first required CCCCO theory module interactions complete.
  return state.phiAck && isModuleComplete(state, requiredTheoryModuleIds[0]);
}

// Reviewer/demo helper: mark every build-ready lesson viewed + checked + over the
// per-lesson active-time minimum (real accrual values are written, not faked flags).
export function completeAllRequiredLessons(state: LearnerState): LearnerState {
  const lessonProgress = { ...state.lessonProgress };
  const lessonActiveSeconds = { ...state.lessonActiveSeconds };
  const now = new Date().toISOString();
  for (const def of courseModules) {
    if (def.kind !== "lesson" || !def.countsTowardTheory) continue;
    for (const lesson of def.lessons) {
      const key = lessonKey(def.id, lesson.id);
      lessonProgress[key] = { viewed: true, checkPassed: Boolean(lesson.knowledgeCheck), completedAt: now };
      lessonActiveSeconds[key] = Math.max(lessonActiveSeconds[key] || 0, ACTIVE_TIME.LESSON_MIN_SECONDS);
    }
  }
  return { ...state, lessonProgress, lessonActiveSeconds };
}
