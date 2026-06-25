// Adapters that map the V2 prototype's simplified state concepts onto the
// canonical, persisted LearnerState (single source of truth). No new gating
// state is introduced — these are derived getters plus typed mutators that
// write into LearnerState via the existing reducer helpers.

import type { LearnerState } from "./learnerState";
import { passAllRequiredState } from "./learnerState";
import { completeAllRequiredLessons, lessonKey } from "./moduleProgress";

/** Module 0 orientation complete (identity + all three acknowledgements). */
export function module0Complete(state: LearnerState): boolean {
  return Boolean(
    state.legalFirstName.trim() &&
      state.legalLastName.trim() &&
      state.cnaNumber.trim() &&
      state.orientationFinalAck &&
      state.phiAck &&
      state.onlineCapAck,
  );
}

/** Generated lesson viewed + practice challenge submitted. */
export function lessonCompleted(state: LearnerState, moduleId = "m10", lessonId = "l1"): boolean {
  const p = state.lessonProgress[lessonKey(moduleId, lessonId)];
  return Boolean(p?.viewed && p?.checkPassed);
}

export function moduleAssessmentPassed(state: LearnerState, moduleId = "m10"): boolean {
  return state.moduleQuizPassed[moduleId] === true;
}

/** Mark a generated lesson complete and write real active-time for that lesson. */
export function withLessonCompleted(state: LearnerState, moduleId = "m10", lessonId = "l1"): LearnerState {
  const now = new Date().toISOString();
  const key = lessonKey(moduleId, lessonId);
  return {
    ...state,
    lessonProgress: {
      ...state.lessonProgress,
      [key]: { viewed: true, checkPassed: true, completedAt: now },
    },
    lessonActiveSeconds: {
      ...state.lessonActiveSeconds,
      [key]: Math.max(state.lessonActiveSeconds[key] || 0, 20),
    },
  };
}

export function withLessonReset(state: LearnerState, moduleId = "m10", lessonId = "l1"): LearnerState {
  const lessonProgress = { ...state.lessonProgress };
  delete lessonProgress[lessonKey(moduleId, lessonId)];
  return { ...state, lessonProgress };
}

export function withModuleAssessment(state: LearnerState, passed: boolean, moduleId = "m10"): LearnerState {
  return { ...state, moduleQuizPassed: { ...state.moduleQuizPassed, [moduleId]: passed } };
}

/** Reviewer "Unlock All": drive every certificate gate + V2 milestone to ready. */
export function withEverythingUnlocked(state: LearnerState): LearnerState {
  const base = completeAllRequiredLessons(passAllRequiredState(state));
  const moduleQuizPassed = { ...base.moduleQuizPassed };
  for (const key of Object.keys(moduleQuizPassed)) moduleQuizPassed[key] = true;
  return { ...base, moduleQuizPassed };
}
