// Unified, persisted learner state for the standalone MVP (Phase 1).
// Required Online CE and Optional Clinical Support are kept structurally separate.

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { loadJSON, saveJSON } from "./storage";

const STORAGE_KEY = "ci-cna-learner-v1";

export type LessonProgress = {
  viewed: boolean;
  checkPassed: boolean;
  completedAt?: string;
};

export type OptionalClinicalState = {
  hub: boolean;
  skills: boolean;
  confidence: boolean;
  documentation: boolean;
  help: boolean;
};

export type LearnerState = {
  // Identity (required certificate fields)
  legalFirstName: string;
  legalLastName: string;
  cnaNumber: string;

  // Module 0 acknowledgements (required)
  onlineCapAck: boolean;
  phiAck: boolean;
  orientationFinalAck: boolean;

  // Real lesson-level progress, keyed `${moduleId}:${lessonId}`
  lessonProgress: Record<string, LessonProgress>;

  // Real active-time accrual per lesson (seconds), keyed `${moduleId}:${lessonId}`
  lessonActiveSeconds: Record<string, number>;

  // Module-level quiz pass, keyed by moduleId
  moduleQuizPassed: Record<string, boolean>;

  // Remediation events (for audit preview)
  remediationEvents: { id: string; label: string; at: string }[];

  // Phase 2: retained for reviewer override of any not-yet-converted theory (unused by default)
  remainingTheorySimulated: boolean;

  // Active-time: reviewer override flag (OR-ed with the real accrual threshold)
  activeTimeMet: boolean;

  // Final exam (real preview engine)
  finalExamAttempted: boolean;
  finalExamAttempts: number;
  finalExamBestScorePct: number | null;
  finalExamPassed: boolean;
  affidavitComplete: boolean; // draft affidavit; e-sign method unresolved
  certificateFieldsPopulated: boolean;
  adminHoldClear: boolean;
  approvalMetadataPresent: boolean; // NAC#/approval metadata — false in Phase 1 (no production issuance)

  // Optional Clinical Support — NEVER affects certificate readiness
  optionalClinical: OptionalClinicalState;

  // Reviewer/demo
  unlockMode: boolean;
};

export const DEFAULT_PROFILE = {
  legalFirstName: "James",
  legalLastName: "Bond",
  cnaNumber: "CNA-DEMO-007",
};

export const initialLearnerState: LearnerState = {
  legalFirstName: DEFAULT_PROFILE.legalFirstName,
  legalLastName: DEFAULT_PROFILE.legalLastName,
  cnaNumber: DEFAULT_PROFILE.cnaNumber,
  onlineCapAck: false,
  phiAck: false,
  orientationFinalAck: false,
  lessonProgress: {},
  lessonActiveSeconds: {},
  moduleQuizPassed: {},
  remediationEvents: [],
  remainingTheorySimulated: false,
  activeTimeMet: false,
  finalExamAttempted: false,
  finalExamAttempts: 0,
  finalExamBestScorePct: null,
  finalExamPassed: false,
  affidavitComplete: false,
  certificateFieldsPopulated: true,
  adminHoldClear: true,
  approvalMetadataPresent: false,
  optionalClinical: { hub: false, skills: false, confidence: false, documentation: false, help: false },
  unlockMode: false,
};

export function passAllRequiredState(base: LearnerState): LearnerState {
  return {
    ...base,
    legalFirstName: base.legalFirstName || DEFAULT_PROFILE.legalFirstName,
    legalLastName: base.legalLastName || DEFAULT_PROFILE.legalLastName,
    cnaNumber: base.cnaNumber || DEFAULT_PROFILE.cnaNumber,
    onlineCapAck: true,
    phiAck: true,
    orientationFinalAck: true,
    remainingTheorySimulated: true,
    activeTimeMet: true,
    finalExamAttempted: true,
    finalExamPassed: true,
    affidavitComplete: true,
    certificateFieldsPopulated: true,
    adminHoldClear: true,
  };
}

type LearnerContextValue = {
  state: LearnerState;
  setState: React.Dispatch<React.SetStateAction<LearnerState>>;
  update: <K extends keyof LearnerState>(key: K, value: LearnerState[K]) => void;
  setLessonProgress: (moduleId: string, lessonId: string, patch: Partial<LessonProgress>) => void;
  setOptionalClinical: (key: keyof OptionalClinicalState, value: boolean) => void;
  addActiveSeconds: (moduleId: string, lessonId: string, seconds: number) => void;
  recordRemediation: (label: string) => void;
  recordExamAttempt: (scorePct: number, passed: boolean) => void;
  resetDemo: () => void;
};

const LearnerContext = createContext<LearnerContextValue | null>(null);

export function LearnerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearnerState>(() => loadJSON(STORAGE_KEY, initialLearnerState));

  useEffect(() => {
    saveJSON(STORAGE_KEY, state);
  }, [state]);

  const update = useCallback(<K extends keyof LearnerState>(key: K, value: LearnerState[K]) => {
    setState((current) => ({ ...current, [key]: value }));
  }, []);

  const setLessonProgress = useCallback(
    (moduleId: string, lessonId: string, patch: Partial<LessonProgress>) => {
      const compositeKey = `${moduleId}:${lessonId}`;
      setState((current) => {
        const existing = current.lessonProgress[compositeKey] || { viewed: false, checkPassed: false };
        const next = { ...existing, ...patch };
        if ((patch.viewed || existing.viewed) && (patch.checkPassed ?? existing.checkPassed) && !next.completedAt) {
          next.completedAt = new Date().toISOString();
        }
        return { ...current, lessonProgress: { ...current.lessonProgress, [compositeKey]: next } };
      });
    },
    [],
  );

  const setOptionalClinical = useCallback((key: keyof OptionalClinicalState, value: boolean) => {
    setState((current) => ({ ...current, optionalClinical: { ...current.optionalClinical, [key]: value } }));
  }, []);

  const addActiveSeconds = useCallback((moduleId: string, lessonId: string, seconds: number) => {
    if (seconds <= 0) return;
    const key = `${moduleId}:${lessonId}`;
    setState((current) => ({
      ...current,
      lessonActiveSeconds: { ...current.lessonActiveSeconds, [key]: (current.lessonActiveSeconds[key] || 0) + seconds },
    }));
  }, []);

  const recordRemediation = useCallback((label: string) => {
    setState((current) => {
      // Avoid spamming identical consecutive events.
      const last = current.remediationEvents[current.remediationEvents.length - 1];
      if (last && last.label === label && Date.now() - new Date(last.at).getTime() < 4000) return current;
      const event = { id: `${Date.now()}`, label, at: new Date().toISOString() };
      return { ...current, remediationEvents: [...current.remediationEvents.slice(-24), event] };
    });
  }, []);

  const recordExamAttempt = useCallback((scorePct: number, passed: boolean) => {
    setState((current) => ({
      ...current,
      finalExamAttempted: true,
      finalExamAttempts: current.finalExamAttempts + 1,
      finalExamBestScorePct: Math.max(current.finalExamBestScorePct ?? 0, scorePct),
      finalExamPassed: current.finalExamPassed || passed,
    }));
  }, []);

  const resetDemo = useCallback(() => setState(initialLearnerState), []);

  const value = useMemo<LearnerContextValue>(
    () => ({ state, setState, update, setLessonProgress, setOptionalClinical, addActiveSeconds, recordRemediation, recordExamAttempt, resetDemo }),
    [state, update, setLessonProgress, setOptionalClinical, addActiveSeconds, recordRemediation, recordExamAttempt, resetDemo],
  );

  return React.createElement(LearnerContext.Provider, { value }, children);
}

export function useLearner(): LearnerContextValue {
  const ctx = useContext(LearnerContext);
  if (!ctx) throw new Error("useLearner must be used within LearnerProvider");
  return ctx;
}

export function hasLegalName(state: LearnerState): boolean {
  return Boolean(state.legalFirstName.trim() && state.legalLastName.trim());
}
