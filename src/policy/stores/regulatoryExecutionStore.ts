import { useMemo } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { RegulatoryEvent, UrgencyLevel } from '@/policy/data/regulatoryEvents';
import { useEnforcementStore } from '@/policy/stores/enforcementStore';
import { computeEnforcement } from '@/policy/enforcement/enforcementEngine';

/* ═══════════════════════════════════════════════════════════════
   Regulatory Execution Store
   --------------------------------------------------------------
   Layers operational state ON TOP of the seed event dataset:
     - step progress
     - form statuses (with completion metadata)
     - minutes states
     - evidence documents (uploads / generated reports)
     - approval requests + decisions
     - event completion

   Persisted to localStorage so workflow progress survives reload.
   ═══════════════════════════════════════════════════════════════ */

export type FormStatus = 'missing' | 'pending' | 'in-progress' | 'requires-review' | 'complete';
export type StepStatus = 'pending' | 'in-progress' | 'complete';
export type MinutesStatus = 'missing' | 'draft' | 'finalized';

export interface FormState {
  status: FormStatus;
  completedAt?: string;
  completedBy?: string;
  reviewer?: string;
  note?: string;
}

export interface StepState {
  status: StepStatus;
  completedAt?: string;
  completedBy?: string;
}

export interface MinutesState {
  status: MinutesStatus;
  finalizedAt?: string;
  finalizedBy?: string;
}

export type EvidenceKind = 'minutes' | 'report' | 'form' | 'attachment' | 'other';

export interface EvidenceDoc {
  id: string;
  eventId: string;
  name: string;
  kind: EvidenceKind;
  uploadedAt: string;
  uploadedBy: string;
  sizeLabel: string;      // e.g. "1.2 MB"
  linkedFormId?: string;
  note?: string;
}

export type ApprovalTargetKind = 'event' | 'form' | 'report' | 'minutes';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  eventId: string;
  targetKind: ApprovalTargetKind;
  targetId?: string;       // formId or evidenceId when applicable
  targetLabel: string;
  status: ApprovalStatus;
  requestedBy: string;
  requestedAt: string;
  approver?: string;
  decidedAt?: string;
  note?: string;
  decisionNote?: string;
}

export interface CompletionState {
  status: 'in-progress' | 'complete';
  completedAt?: string;
  completedBy?: string;
}

export interface ValidationReport {
  canComplete: boolean;
  blockers: {
    kind: 'step' | 'form' | 'minutes' | 'approval';
    label: string;
    targetId?: string;
  }[];
  progress: {
    stepsComplete: number;
    stepsTotal: number;
    formsComplete: number;
    formsTotal: number;
    minutesRequired: boolean;
    minutesFinalized: boolean;
  };
}

const CURRENT_USER = 'Current User';

/* ─── Keyers ───────────────────────────────────────────── */
const fKey = (eventId: string, formId: string) => `${eventId}::${formId}`;
const sKey = (eventId: string, stepId: string) => `${eventId}::${stepId}`;

interface RegulatoryExecutionState {
  formStates:       Record<string, FormState>;
  stepStates:       Record<string, StepState>;
  minutesStates:    Record<string, MinutesState>;
  evidence:         Record<string, EvidenceDoc[]>;
  approvals:        ApprovalRequest[];
  completions:      Record<string, CompletionState>;
  activeWorkflowEventId: string | null;

  /* ── workflow drawer ── */
  openWorkflow:  (eventId: string) => void;
  closeWorkflow: () => void;

  /* ── step / form / minutes transitions ── */
  setStepStatus:    (eventId: string, stepId: string, status: StepStatus, actor?: string) => void;
  advanceStep:      (eventId: string, stepId: string) => void;
  setFormStatus:    (eventId: string, formId: string, status: FormStatus, actor?: string, note?: string) => void;
  setMinutesStatus: (eventId: string, status: MinutesStatus, actor?: string) => void;

  /* ── evidence ── */
  uploadEvidence:    (eventId: string, doc: Omit<EvidenceDoc, 'id' | 'eventId' | 'uploadedAt' | 'uploadedBy'>, actor?: string) => string;
  generateReport:    (eventId: string, title: string, actor?: string) => string;
  removeEvidence:    (eventId: string, docId: string) => void;

  /* ── approvals ── */
  requestApproval: (eventId: string, targetKind: ApprovalTargetKind, targetLabel: string, targetId?: string, note?: string) => string;
  decideApproval:  (approvalId: string, decision: ApprovalStatus, decisionNote?: string, approver?: string) => void;

  /* ── completion ── */
  validateEvent:     (event: RegulatoryEvent) => ValidationReport;
  markEventComplete: (event: RegulatoryEvent) => { ok: boolean; message: string };
  reopenEvent:       (eventId: string) => void;

  /* ── selectors (return effective status blending seed + store) ── */
  effectiveStepStatus:    (event: RegulatoryEvent, stepId: string) => StepStatus;
  effectiveFormStatus:    (event: RegulatoryEvent, formId: string) => FormStatus;
  effectiveMinutesStatus: (event: RegulatoryEvent) => MinutesStatus | null;
  effectiveUrgency:       (event: RegulatoryEvent) => UrgencyLevel;
  isEventComplete:        (eventId: string) => boolean;

  resetAll: () => void;
}

const nowISO = () => new Date().toISOString();

export const useRegulatoryExecutionStore = create<RegulatoryExecutionState>()(
  persist(
    (set, get) => ({
      formStates:    {},
      stepStates:    {},
      minutesStates: {},
      evidence:      {},
      approvals:     [],
      completions:   {},
      activeWorkflowEventId: null,

      /* ── workflow drawer ── */
      openWorkflow: eventId => set({ activeWorkflowEventId: eventId }),
      closeWorkflow: () => set({ activeWorkflowEventId: null }),

      /* ── step / form / minutes transitions ── */
      setStepStatus: (eventId, stepId, status, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'step', targetId: stepId, reason: `Attempt to set step status to ${status} on a locked event.` });
          return;
        }
        const before = get().stepStates[sKey(eventId, stepId)]?.status ?? 'pending';
        set(state => ({
          stepStates: {
            ...state.stepStates,
            [sKey(eventId, stepId)]: {
              status,
              completedAt: status === 'complete' ? nowISO() : undefined,
              completedBy: status === 'complete' ? actor : undefined,
            },
          },
        }));
        enf.log({ action: 'step.status.changed', eventId, targetKind: 'step', targetId: stepId, before, after: status });
      },

      advanceStep: (eventId, stepId) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'step', targetId: stepId, reason: 'advanceStep on a locked event' });
          return;
        }
        const key = sKey(eventId, stepId);
        const before = get().stepStates[key]?.status ?? 'pending';
        set(state => ({
          stepStates: {
            ...state.stepStates,
            [key]: { status: 'complete', completedAt: nowISO(), completedBy: CURRENT_USER },
          },
        }));
        enf.log({ action: 'step.status.changed', eventId, targetKind: 'step', targetId: stepId, before, after: 'complete' });
      },

      setFormStatus: (eventId, formId, status, actor = CURRENT_USER, note) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'form', targetId: formId, reason: `Attempt to set form status to ${status} on a locked event.` });
          return;
        }
        const before = get().formStates[fKey(eventId, formId)]?.status ?? 'pending';
        set(state => ({
          formStates: {
            ...state.formStates,
            [fKey(eventId, formId)]: {
              status,
              completedAt: status === 'complete' ? nowISO() : state.formStates[fKey(eventId, formId)]?.completedAt,
              completedBy: status === 'complete' ? actor : state.formStates[fKey(eventId, formId)]?.completedBy,
              reviewer:    status === 'requires-review' ? actor : state.formStates[fKey(eventId, formId)]?.reviewer,
              note: note ?? state.formStates[fKey(eventId, formId)]?.note,
            },
          },
        }));
        enf.log({ action: 'form.status.changed', eventId, targetKind: 'form', targetId: formId, before, after: status, reason: note });
      },

      setMinutesStatus: (eventId, status, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'minutes', reason: `Attempt to set minutes status to ${status} on a locked event.` });
          return;
        }
        const before = get().minutesStates[eventId]?.status;
        set(state => ({
          minutesStates: {
            ...state.minutesStates,
            [eventId]: {
              status,
              finalizedAt: status === 'finalized' ? nowISO() : undefined,
              finalizedBy: status === 'finalized' ? actor : undefined,
            },
          },
        }));
        enf.log({ action: 'minutes.status.changed', eventId, targetKind: 'minutes', before, after: status });
      },

      /* ── evidence ── */
      uploadEvidence: (eventId, doc, actor = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', reason: 'uploadEvidence on a locked event' });
          return '';
        }
        const id = `EV-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const newDoc: EvidenceDoc = {
          ...doc,
          id,
          eventId,
          uploadedAt: nowISO(),
          uploadedBy: actor,
        };
        set(state => ({
          evidence: { ...state.evidence, [eventId]: [newDoc, ...(state.evidence[eventId] || [])] },
        }));
        enf.log({ action: 'evidence.uploaded', eventId, targetKind: 'evidence', targetId: id, after: { name: doc.name, kind: doc.kind, linkedFormId: doc.linkedFormId } });
        if (doc.linkedFormId) {
          get().setFormStatus(eventId, doc.linkedFormId, 'complete', actor);
        }
        return id;
      },

      generateReport: (eventId, title, actor = CURRENT_USER) => {
        return get().uploadEvidence(eventId, {
          name: title,
          kind: 'report',
          sizeLabel: '—',
        }, actor);
      },

      removeEvidence: (eventId, docId) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: docId, reason: 'removeEvidence on a locked event' });
          return;
        }
        const prev = (get().evidence[eventId] || []).find(d => d.id === docId);
        set(state => ({
          evidence: { ...state.evidence, [eventId]: (state.evidence[eventId] || []).filter(d => d.id !== docId) },
        }));
        enf.log({ action: 'evidence.removed', eventId, targetKind: 'evidence', targetId: docId, before: prev });
      },

      /* ── approvals ── */
      requestApproval: (eventId, targetKind, targetLabel, targetId, note) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'approval', reason: 'requestApproval on a locked event' });
          return '';
        }
        const id = `AP-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const req: ApprovalRequest = {
          id,
          eventId,
          targetKind,
          targetId,
          targetLabel,
          status: 'pending',
          requestedBy: CURRENT_USER,
          requestedAt: nowISO(),
          note,
        };
        set(state => ({ approvals: [req, ...state.approvals] }));
        enf.log({ action: 'approval.requested', eventId, targetKind: 'approval', targetId: id, after: { targetKind, targetLabel, targetId } });
        return id;
      },

      decideApproval: (approvalId, decision, decisionNote, approver = CURRENT_USER) => {
        const enf = useEnforcementStore.getState();
        const prev = get().approvals.find(a => a.id === approvalId);
        if (!prev) return;
        if (enf.isLocked(prev.eventId)) {
          enf.log({ action: 'mutation.blocked', eventId: prev.eventId, targetKind: 'approval', targetId: approvalId, reason: 'decideApproval on a locked event' });
          return;
        }
        set(state => ({
          approvals: state.approvals.map(a =>
            a.id === approvalId
              ? { ...a, status: decision, decisionNote, approver, decidedAt: nowISO() }
              : a,
          ),
        }));
        enf.log({
          action: 'approval.decided',
          eventId: prev.eventId,
          targetKind: 'approval',
          targetId: approvalId,
          before: { status: prev.status },
          after: { status: decision, approver, decisionNote },
        });
      },

      /* ── selectors ── */
      effectiveStepStatus: (event, stepId) => {
        const override = get().stepStates[sKey(event.id, stepId)];
        if (override) return override.status;
        const seed = event.processFlow.find(s => s.id === stepId);
        return (seed?.status as StepStatus) || 'pending';
      },

      effectiveFormStatus: (event, formId) => {
        const override = get().formStates[fKey(event.id, formId)];
        if (override) return override.status;
        const seed = event.requiredForms.find(f => f.id === formId);
        return (seed?.status as FormStatus) || 'pending';
      },

      effectiveMinutesStatus: event => {
        if (!event.minutes) return null;
        return (get().minutesStates[event.id]?.status) || event.minutes.status;
      },

      effectiveUrgency: event => {
        const completion = get().completions[event.id];
        if (completion?.status === 'complete') return 'complete';
        return event.urgency;
      },

      isEventComplete: eventId => get().completions[eventId]?.status === 'complete',

      /* ── completion validation ── */
      validateEvent: event => {
        const s = get();
        const stepsTotal = event.processFlow.length;
        const stepsComplete = event.processFlow.filter(st => s.effectiveStepStatus(event, st.id) === 'complete').length;

        const formsTotal = event.requiredForms.length;
        const formsComplete = event.requiredForms.filter(f => s.effectiveFormStatus(event, f.id) === 'complete').length;

        const minutesRequired = !!event.minutes;
        const minutesEffective = s.effectiveMinutesStatus(event);
        const minutesFinalized = minutesRequired ? minutesEffective === 'finalized' : true;

        const blockers: ValidationReport['blockers'] = [];

        event.processFlow.forEach(st => {
          if (s.effectiveStepStatus(event, st.id) !== 'complete') {
            blockers.push({ kind: 'step', label: st.label, targetId: st.id });
          }
        });
        event.requiredForms.forEach(f => {
          if (s.effectiveFormStatus(event, f.id) !== 'complete') {
            blockers.push({ kind: 'form', label: f.label, targetId: f.id });
          }
        });
        if (minutesRequired && !minutesFinalized) {
          blockers.push({ kind: 'minutes', label: 'Meeting minutes finalization' });
        }
        const pendingApprovals = s.approvals.filter(a => a.eventId === event.id && a.status === 'pending');
        pendingApprovals.forEach(a => blockers.push({ kind: 'approval', label: a.targetLabel, targetId: a.id }));

        return {
          canComplete: blockers.length === 0 && stepsTotal > 0,
          blockers,
          progress: { stepsComplete, stepsTotal, formsComplete, formsTotal, minutesRequired, minutesFinalized },
        };
      },

      markEventComplete: event => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(event.id)) {
          return { ok: false, message: `Event is locked. Unlock (role: ${enf.getLock(event.id)?.unlockRole ?? 'Administrator'}) before completion.` };
        }
        // Delegate to the enforcement engine for the authoritative gate.
        const s = get();
        const report = computeEnforcement({
          event,
          stepStatus: id => s.effectiveStepStatus(event, id),
          formStatus: id => s.effectiveFormStatus(event, id),
          minutesStatus: () => s.effectiveMinutesStatus(event),
          evidence: s.evidence[event.id] ?? [],
          approvals: s.approvals.filter(a => a.eventId === event.id),
          completion: s.completions[event.id],
          lock: enf.getLock(event.id),
          isComplete: id => s.completions[id]?.status === 'complete',
        });
        if (!report.canComplete) {
          enf.log({
            action: 'mutation.blocked',
            eventId: event.id,
            reason: `markEventComplete refused — ${report.summary}`,
            riskLevel: report.riskLevel,
          });
          return { ok: false, message: `Cannot mark complete: ${report.summary}` };
        }
        set(state => ({
          completions: {
            ...state.completions,
            [event.id]: { status: 'complete', completedAt: nowISO(), completedBy: CURRENT_USER },
          },
          activeWorkflowEventId: null,
        }));
        enf.log({
          action: 'event.completed',
          eventId: event.id,
          after: { completedAt: nowISO(), by: CURRENT_USER },
          riskLevel: report.riskLevel,
        });

        // Auto-lock once completion is recorded AND every required approval rule is satisfied.
        const allRulesApproved = (event.approvals ?? [])
          .filter(r => r.required)
          .every(r => get().approvals.some(a =>
            a.targetKind === r.targetKind && a.targetLabel === r.targetLabel && a.status === 'approved',
          ));
        if (allRulesApproved) {
          const unlockRole = event.approvals?.find(a => a.targetKind === 'event')?.approverRole ?? 'Administrator';
          enf.lock(event.id, 'Auto-locked: completion + all required approvals captured.', unlockRole);
        }

        return { ok: true, message: 'Event marked complete.' };
      },

      reopenEvent: eventId => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          const lock = enf.getLock(eventId);
          const unlock = enf.unlock(eventId, 'Event reopened for correction.');
          if (!unlock.ok) return;
          void lock;
        }
        const prev = get().completions[eventId];
        set(state => {
          const next = { ...state.completions };
          delete next[eventId];
          return { completions: next };
        });
        enf.log({ action: 'event.reopened', eventId, before: prev });
      },

      resetAll: () => set({
        formStates: {}, stepStates: {}, minutesStates: {},
        evidence: {}, approvals: [], completions: {},
        activeWorkflowEventId: null,
      }),
    }),
    {
      name: 'reg-execution-v1',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        formStates: state.formStates,
        stepStates: state.stepStates,
        minutesStates: state.minutesStates,
        evidence: state.evidence,
        approvals: state.approvals,
        completions: state.completions,
      }),
    },
  ),
);

/* ─── Hook helpers ───────────────────────────────────────
   IMPORTANT: Selectors must return stable references.
   We select the root record/array from the store (stable between
   unrelated updates) and then derive per-event slices with useMemo,
   avoiding the "getSnapshot should be cached" infinite-loop pattern.
   ────────────────────────────────────────────────────── */

const EMPTY_EVIDENCE: EvidenceDoc[] = [];

export function useEventEvidence(eventId: string): EvidenceDoc[] {
  const byEvent = useRegulatoryExecutionStore(state => state.evidence);
  return useMemo(() => byEvent[eventId] || EMPTY_EVIDENCE, [byEvent, eventId]);
}

export function useEventApprovals(eventId: string): ApprovalRequest[] {
  const all = useRegulatoryExecutionStore(state => state.approvals);
  return useMemo(() => all.filter(a => a.eventId === eventId), [all, eventId]);
}

export function useAllPendingApprovalsCount(): number {
  const all = useRegulatoryExecutionStore(state => state.approvals);
  return useMemo(() => all.filter(a => a.status === 'pending').length, [all]);
}
