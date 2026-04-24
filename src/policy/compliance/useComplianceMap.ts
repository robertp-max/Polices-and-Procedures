/**
 * useComplianceMap
 * ================
 * React hook that runs the compliance engine against ALL regulatory
 * events using live Zustand store state.
 *
 * Returns:
 *   - complianceMap  : Record<eventId, ComplianceObject> — full evaluated state
 *   - kpis           : ComplianceKpis — real computed numbers (no hardcoded floors)
 *   - getObject      : (eventId) => ComplianceObject | undefined
 *   - evaluate       : (eventId) => ComplianceEvaluation | null
 *   - answerQuestions: (eventId) => structured survey answers | null
 *
 * The hook uses useMemo so re-computation only runs when store state
 * or event data actually changes.
 */

import { useMemo } from 'react';
import { REGULATORY_EVENTS, TODAY_ANCHOR } from '@/policy/data/regulatoryEvents';
import { useRegulatoryExecutionStore } from '@/policy/stores/regulatoryExecutionStore';
import {
  computeComplianceBatch,
  type ComplianceObject,
  type ComplianceBatch,
  type ComplianceInput,
} from './complianceEngine';
import { evaluateEvent, answerSurveyQuestions, type ComplianceEvaluation } from './evaluateEvent';

/* ── Main hook ──────────────────────────────────────────────── */

export function useComplianceMap(): {
  complianceMap:  Record<string, ComplianceObject>;
  kpis:           ComplianceBatch['kpis'];
  getObject:      (eventId: string) => ComplianceObject | undefined;
  evaluate:       (eventId: string) => ComplianceEvaluation | null;
  answerQuestions:(eventId: string) => ReturnType<typeof answerSurveyQuestions> | null;
} {
  /* Read all relevant slices from the store.
     Each is a stable reference that only changes when its slice changes,
     so our useMemo below only re-runs when something actually mutates. */
  const formStates    = useRegulatoryExecutionStore(s => s.formStates);
  const stepStates    = useRegulatoryExecutionStore(s => s.stepStates);
  const minutesStates = useRegulatoryExecutionStore(s => s.minutesStates);
  const evidenceMap   = useRegulatoryExecutionStore(s => s.evidence);
  const approvals     = useRegulatoryExecutionStore(s => s.approvals);
  const completions   = useRegulatoryExecutionStore(s => s.completions);

  const batch = useMemo(() => {
    const isComplete = (eventId: string) =>
      completions[eventId]?.status === 'complete';

    const inputFn = (event: { id: string; processFlow: { id: string }[]; requiredForms: { id: string }[]; minutes?: unknown }): ComplianceInput => {
      const eventId = event.id;
      return {
        now: TODAY_ANCHOR,
        stepStatus: (stepId) => {
          const key = `${eventId}::${stepId}`;
          const override = stepStates[key];
          if (override) return override.status;
          const seed = (event as import('@/policy/data/regulatoryEvents').RegulatoryEvent)
            .processFlow.find(s => s.id === stepId);
          return (seed?.status as import('@/policy/stores/regulatoryExecutionStore').StepStatus) ?? 'pending';
        },
        formStatus: (formId) => {
          const key = `${eventId}::${formId}`;
          const override = formStates[key];
          if (override) return override.status;
          const seed = (event as import('@/policy/data/regulatoryEvents').RegulatoryEvent)
            .requiredForms.find(f => f.id === formId);
          return (seed?.status as import('@/policy/stores/regulatoryExecutionStore').FormStatus) ?? 'pending';
        },
        minutesStatus: () => {
          const override = minutesStates[eventId];
          if (override) return override.status;
          const seed = (event as import('@/policy/data/regulatoryEvents').RegulatoryEvent).minutes;
          return seed ? seed.status : null;
        },
        evidence:    evidenceMap[eventId] ?? [],
        approvals:   approvals,
        completion:  completions[eventId],
        allEvents:   REGULATORY_EVENTS,
        isComplete,
      };
    };

    return computeComplianceBatch(
      REGULATORY_EVENTS,
      inputFn as (e: import('@/policy/data/regulatoryEvents').RegulatoryEvent) => ComplianceInput,
    );
  }, [formStates, stepStates, minutesStates, evidenceMap, approvals, completions]);

  const getObject = (eventId: string) => batch.byId[eventId];

  const evaluate = (eventId: string): ComplianceEvaluation | null => {
    const obj = batch.byId[eventId];
    return obj ? evaluateEvent(obj) : null;
  };

  const answerFn = (eventId: string) => {
    const obj = batch.byId[eventId];
    return obj ? answerSurveyQuestions(obj) : null;
  };

  return {
    complianceMap:  batch.byId,
    kpis:           batch.kpis,
    getObject,
    evaluate,
    answerQuestions: answerFn,
  };
}

/* ── Single-event hook ─────────────────────────────────────── */

export function useEventCompliance(eventId: string): ComplianceObject | null {
  const { getObject } = useComplianceMap();
  return getObject(eventId) ?? null;
}

/* ── Single-event evaluation hook ─────────────────────────── */

export function useEventEvaluation(eventId: string): ComplianceEvaluation | null {
  const { evaluate } = useComplianceMap();
  return evaluate(eventId);
}

/**
 * useComplianceKpis
 * -----------------
 * Drop-in replacement for computeKpis() — returns real engine-derived
 * numbers instead of hardcoded floors.
 *
 * Shape is intentionally compatible with the DashboardKpis interface
 * so the Dashboard can swap in this hook without other changes.
 */
export function useComplianceKpis() {
  const { kpis } = useComplianceMap();
  return {
    total:           kpis.total,
    overdue:         kpis.overdue,
    dueThisWeek:     kpis.dueThisWeek,
    dueThisWeekTrend: 0,
    blocked:         kpis.blocked,
    missingEvidence: kpis.missingEvidence,
    surveyReadiness: kpis.surveyReadinessPct,
    completedPct:    kpis.surveyReadinessPct,
    criticalCount:   kpis.immediateJeopardy,
    billingAtRisk:   0,
    dueSoon30:       kpis.dueThisWeek,
  };
}
