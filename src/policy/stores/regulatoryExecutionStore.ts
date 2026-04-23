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

/* ─── Notes ───────────────────────────────────────────────
   Free-form, author-attributed notes attached to a workflow
   instance. Used by operators to record context during execution
   and by audit reviewers to explain deviations.
   ──────────────────────────────────────────────────────── */
export interface InstanceNote {
  id: string;
  eventId: string;
  author: string;
  authorRole?: string;
  body: string;
  createdAt: string;
}

/* ─── Certification Record ────────────────────────────────
   Formal, immutable audit receipt produced when an operator
   invokes CERTIFY EVENT COMPLETE. Captures a snapshot of the
   runtime state that passed validation, so survey reviewers can
   see exactly what was in evidence at the moment of closure.
   ──────────────────────────────────────────────────────── */
export interface CertificationSnapshot {
  stepsComplete: number;
  stepsTotal: number;
  formsComplete: number;
  formsTotal: number;
  minutesRequired: boolean;
  minutesFinalized: boolean;
  approvalsRequired: number;
  approvalsApproved: number;
  evidenceCount: number;
  notesCount: number;
  slaDaysPastDue: number;
}

export type CertificationDisposition =
  | 'standard'
  | 'certified-with-exception';

export interface CertificationRecord {
  eventId: string;
  certifiedAt: string;
  certifiedBy: string;
  certifierRole?: string;
  certifierNote?: string;
  snapshot: CertificationSnapshot;
  auditPacketRef?: string;
  /**
   * How this certification was recorded:
   *   'standard'                 — certified within SLA, no exceptions
   *   'certified-with-exception' — certified past SLA within the grace window
   */
  disposition?: CertificationDisposition;
  /**
   * Reason the exception was granted (always set when
   * disposition === 'certified-with-exception'). Surfaces in the
   * audit export + governance review packet.
   */
  exceptionReason?: string;
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
  notes:            Record<string, InstanceNote[]>;
  certifications:   Record<string, CertificationRecord>;
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

  /* ── notes ── */
  addNote:    (eventId: string, body: string, author?: string, authorRole?: string) => string;
  removeNote: (eventId: string, noteId: string) => void;

  /* ── completion + certification ── */
  validateEvent:        (event: RegulatoryEvent) => ValidationReport;
  markEventComplete:    (event: RegulatoryEvent) => { ok: boolean; message: string };
  certifyEventComplete: (event: RegulatoryEvent, certifier?: string, certifierRole?: string, note?: string) => { ok: boolean; message: string; record?: CertificationRecord };
  revokeCertification:  (eventId: string, reason: string, actor?: string) => { ok: boolean; message: string };
  reopenEvent:          (eventId: string) => void;

  /* ── selectors (return effective status blending seed + store) ── */
  effectiveStepStatus:    (event: RegulatoryEvent, stepId: string) => StepStatus;
  effectiveFormStatus:    (event: RegulatoryEvent, formId: string) => FormStatus;
  effectiveMinutesStatus: (event: RegulatoryEvent) => MinutesStatus | null;
  effectiveUrgency:       (event: RegulatoryEvent) => UrgencyLevel;
  isEventComplete:        (eventId: string) => boolean;
  isCertified:            (eventId: string) => boolean;
  getCertification:       (eventId: string) => CertificationRecord | undefined;

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
      notes:         {},
      certifications:{},
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

      /* ── notes ── */
      addNote: (eventId, body, author = CURRENT_USER, authorRole) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', reason: 'addNote on a locked event' });
          return '';
        }
        const trimmed = body.trim();
        if (!trimmed) return '';
        const id = `NT-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
        const note: InstanceNote = {
          id,
          eventId,
          author,
          authorRole,
          body: trimmed,
          createdAt: nowISO(),
        };
        set(state => ({
          notes: { ...state.notes, [eventId]: [note, ...(state.notes[eventId] || [])] },
        }));
        enf.log({ action: 'evidence.uploaded', eventId, targetKind: 'evidence', targetId: id, after: { kind: 'note', body: trimmed.slice(0, 80) } });
        return id;
      },

      removeNote: (eventId, noteId) => {
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          enf.log({ action: 'mutation.blocked', eventId, targetKind: 'evidence', targetId: noteId, reason: 'removeNote on a locked event' });
          return;
        }
        const prev = (get().notes[eventId] || []).find(n => n.id === noteId);
        set(state => ({
          notes: { ...state.notes, [eventId]: (state.notes[eventId] || []).filter(n => n.id !== noteId) },
        }));
        enf.log({ action: 'evidence.removed', eventId, targetKind: 'evidence', targetId: noteId, before: prev });
      },

      /* ── certification ──
         Builds on markEventComplete but enforces the stricter
         closure gate: every required approval must be recorded,
         minutes (if required) must be finalized, and validation
         must report zero blockers. Writes an immutable receipt
         and hard-locks the instance. */
      certifyEventComplete: (event, certifier = CURRENT_USER, certifierRole, note) => {
        const enf = useEnforcementStore.getState();
        const s = get();

        if (s.certifications[event.id]) {
          return { ok: false, message: 'Event is already certified. Revoke the prior certification to re-run.' };
        }

        const report = s.validateEvent(event);
        if (!report.canComplete) {
          enf.log({
            action: 'mutation.blocked',
            eventId: event.id,
            reason: `Certification refused — ${report.blockers.length} blocker(s): ${report.blockers.slice(0, 3).map(b => `${b.kind}:${b.label}`).join(', ')}`,
          });
          return {
            ok: false,
            message: `Cannot certify: ${report.blockers.length} outstanding item${report.blockers.length === 1 ? '' : 's'}.`,
          };
        }

        // Every required approval rule must be satisfied before certification.
        const requiredRules = (event.approvals ?? []).filter(r => r.required);
        const allRulesApproved = requiredRules.every(r =>
          s.approvals.some(a =>
            a.eventId === event.id &&
            a.targetKind === r.targetKind &&
            a.targetLabel === r.targetLabel &&
            a.status === 'approved',
          ),
        );
        if (!allRulesApproved) {
          return {
            ok: false,
            message: 'Cannot certify: one or more required approvals are missing or not yet approved.',
          };
        }

        // If not yet marked complete, mark complete first (uses the full enforcement gate).
        if (!s.isEventComplete(event.id)) {
          const markRes = s.markEventComplete(event);
          if (!markRes.ok) return { ok: false, message: markRes.message };
        }

        // SLA grace gate: a validation-clean instance can certify up to
        // `SLA_GRACE_DAYS` past due (recorded as an exception below). Beyond
        // that window, certification is refused — the operator must either
        // escalate/document the delay or revoke + recreate the workflow.
        {
          const eventDateMs = new Date(event.date).getTime();
          const nowMs = Date.now();
          const daysPast = Math.floor((nowMs - eventDateMs) / (24 * 60 * 60 * 1000));
          const SLA_GRACE_DAYS = 3;
          if (daysPast > SLA_GRACE_DAYS) {
            enf.log({
              action: 'mutation.blocked',
              eventId: event.id,
              reason: `Certification refused — ${daysPast} days past SLA, beyond ${SLA_GRACE_DAYS}-day grace window.`,
            });
            return {
              ok: false,
              message: `Cannot certify: ${daysPast} days past SLA (beyond the ${SLA_GRACE_DAYS}-day grace window). Revoke and reopen the workflow or escalate for an exception override.`,
            };
          }
        }

        // Build snapshot from the validation that just passed.
        const evidenceCount = (get().evidence[event.id] || []).length;
        const notesCount    = (get().notes[event.id] || []).length;
        const approvalsForEvent = get().approvals.filter(a => a.eventId === event.id);
        const approvalsApproved = approvalsForEvent.filter(a => a.status === 'approved').length;

        const eventDate = new Date(event.date);
        const today = new Date();
        const slaDaysPastDue = Math.max(
          0,
          Math.floor((today.getTime() - eventDate.getTime()) / (24 * 60 * 60 * 1000)),
        );

        const snapshot: CertificationSnapshot = {
          stepsComplete: report.progress.stepsComplete,
          stepsTotal: report.progress.stepsTotal,
          formsComplete: report.progress.formsComplete,
          formsTotal: report.progress.formsTotal,
          minutesRequired: report.progress.minutesRequired,
          minutesFinalized: report.progress.minutesFinalized,
          approvalsRequired: requiredRules.length,
          approvalsApproved,
          evidenceCount,
          notesCount,
          slaDaysPastDue,
        };

        // Certifying past SLA (but validation-clean) = grace-window exception.
        // The gate still allowed certification, but we annotate the record so
        // surveyors can see the exception when reviewing the audit export.
        const SLA_GRACE_DAYS = 3; // kept local to avoid a cross-layer import
        const disposition: CertificationDisposition =
          slaDaysPastDue > 0 && slaDaysPastDue <= SLA_GRACE_DAYS
            ? 'certified-with-exception'
            : 'standard';
        const exceptionReason = disposition === 'certified-with-exception'
          ? `Certified ${slaDaysPastDue} day${slaDaysPastDue === 1 ? '' : 's'} past SLA within the ${SLA_GRACE_DAYS}-day grace window. All required checks passed.`
          : undefined;

        const record: CertificationRecord = {
          eventId: event.id,
          certifiedAt: nowISO(),
          certifiedBy: certifier,
          certifierRole,
          certifierNote: note?.trim() || undefined,
          snapshot,
          auditPacketRef: `AP-${event.id}-${Date.now().toString(36)}`,
          disposition,
          exceptionReason,
        };

        set(state => ({
          certifications: { ...state.certifications, [event.id]: record },
        }));

        // Hard-lock the instance. Role defaults to the event-level approver if defined.
        const unlockRole = event.approvals?.find(a => a.targetKind === 'event')?.approverRole ?? certifierRole ?? 'Administrator';
        if (!enf.isLocked(event.id)) {
          enf.lock(event.id, `Certified complete by ${certifier}${certifierRole ? ` (${certifierRole})` : ''}.`, unlockRole);
        }

        enf.log({
          action: 'event.completed',
          eventId: event.id,
          targetKind: 'event',
          actorOverride: certifier,
          reason: `Event certified complete and locked${certifierRole ? ` by ${certifierRole}` : ''}.`,
          after: { certifiedAt: record.certifiedAt, auditPacketRef: record.auditPacketRef, snapshot },
        });

        return { ok: true, message: 'Event certified complete.', record };
      },

      revokeCertification: (eventId, reason, actor = CURRENT_USER) => {
        const prev = get().certifications[eventId];
        if (!prev) return { ok: false, message: 'No certification to revoke.' };
        const enf = useEnforcementStore.getState();
        if (enf.isLocked(eventId)) {
          const unlock = enf.unlock(eventId, `Certification revoked: ${reason}`);
          if (!unlock.ok) {
            return { ok: false, message: unlock.message ?? 'Unable to unlock for revocation.' };
          }
        }
        set(state => {
          const next = { ...state.certifications };
          delete next[eventId];
          return { certifications: next };
        });
        enf.log({
          action: 'event.reopened',
          eventId,
          targetKind: 'event',
          actorOverride: actor,
          reason: `Certification revoked: ${reason}`,
          before: prev,
        });
        return { ok: true, message: 'Certification revoked. Instance is reopened.' };
      },

      isCertified: eventId => !!get().certifications[eventId],
      getCertification: eventId => get().certifications[eventId],

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
        notes: {}, certifications: {},
        activeWorkflowEventId: null,
      }),
    }),
    {
      name: 'reg-execution-v2',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        formStates: state.formStates,
        stepStates: state.stepStates,
        minutesStates: state.minutesStates,
        evidence: state.evidence,
        approvals: state.approvals,
        completions: state.completions,
        notes: state.notes,
        certifications: state.certifications,
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

const EMPTY_NOTES: InstanceNote[] = [];

export function useEventNotes(eventId: string): InstanceNote[] {
  const byEvent = useRegulatoryExecutionStore(state => state.notes);
  return useMemo(() => byEvent[eventId] || EMPTY_NOTES, [byEvent, eventId]);
}

export function useEventCertification(eventId: string): CertificationRecord | undefined {
  const byEvent = useRegulatoryExecutionStore(state => state.certifications);
  return useMemo(() => byEvent[eventId], [byEvent, eventId]);
}

export function useCertifiedCount(): number {
  const certs = useRegulatoryExecutionStore(state => state.certifications);
  return useMemo(() => Object.keys(certs).length, [certs]);
}
