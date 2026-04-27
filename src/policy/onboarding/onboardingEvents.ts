/* ═══════════════════════════════════════════════════════════════
   ONBOARDING EVENT LOG
   --------------------------------------------------------------
   Event-sourced state transitions for OnboardingExecutionUnit
   and OnboardingExecutionBatch.

   No engine code mutates unit state directly.  Every state
   change MUST originate from an event appended to this log.

   Event kinds:
     • UNIT_STARTED          unit moves InProgress
     • EVIDENCE_CAPTURED     evidence artefact attached
     • EVIDENCE_REJECTED     reverts to AwaitingEvidence
     • SIGNATURE_REQUESTED   moves AwaitingSignature
     • SIGNATURE_COMPLETED   eCIgn signed -> may complete
     • GATE_EVALUATED        gate result attached
     • UNIT_BLOCKED          gate failed / dependency missing
     • UNIT_UNBLOCKED        previously-blocking condition cleared
     • UNIT_COMPLETED        terminal state (only via signature path)
     • BATCH_COMPLETED       all units complete + all gates pass
   ═══════════════════════════════════════════════════════════════ */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/* ── Operational state (event-driven). Independent of CES UI tags. ── */
export type OperationalState =
  | 'NotStarted'
  | 'InProgress'
  | 'AwaitingEvidence'
  | 'AwaitingSignature'
  | 'Blocked'
  | 'Completed';

export type OnboardingEventKind =
  | 'UNIT_STARTED'
  | 'EVIDENCE_CAPTURED'
  | 'EVIDENCE_REJECTED'
  | 'SIGNATURE_REQUESTED'
  | 'SIGNATURE_COMPLETED'
  | 'GATE_EVALUATED'
  | 'UNIT_BLOCKED'
  | 'UNIT_UNBLOCKED'
  | 'UNIT_COMPLETED'
  | 'BATCH_COMPLETED';

/** Signature artefact attached by SIGNATURE_COMPLETED. */
export interface SignatureArtifact {
  signerUserId: string;
  signerRole:   string;
  signerName:   string;
  signedAt:     string;       // ISO
  /** eCIgn instance / envelope identifier. */
  signatureId:  string;
  /** Hash of the signed payload (audit chain). */
  payloadHash?: string;
}

/** Evidence artefact attached by EVIDENCE_CAPTURED. */
export interface EvidenceArtifact {
  formId:      string;
  uploadedBy:  string;
  uploadedAt:  string;        // ISO
  artifactRef?: string;       // eCIgn / object-store reference
}

export interface OnboardingEvent {
  id:        string;
  kind:      OnboardingEventKind;
  unitId?:   string;          // present on unit-scoped events
  batchId?:  string;          // present on batch-scoped events
  subjectEmployeeId?: string;
  occurredAt: string;         // ISO
  /** Free-form correlation payload — depends on `kind`. */
  payload:   Record<string, unknown>;
}

/* ═══════════════════════════════════════════════════════════════
   PROJECTION — derive operational state for ONE unit from log
   ═══════════════════════════════════════════════════════════════ */

export interface UnitProjection {
  state:        OperationalState;
  signatures:   readonly SignatureArtifact[];
  evidence:     readonly EvidenceArtifact[];
  blockedReason?: string;
  completedAt?: string;
}

/** Pure reducer — apply one event to a unit's projection. */
export function applyEvent(prev: UnitProjection, ev: OnboardingEvent): UnitProjection {
  switch (ev.kind) {
    case 'UNIT_STARTED':
      return prev.state === 'Completed' ? prev : { ...prev, state: 'InProgress' };

    case 'EVIDENCE_CAPTURED': {
      const art = ev.payload.artifact as EvidenceArtifact | undefined;
      if (!art) return prev;
      const evidence = [...prev.evidence, art];
      const next: OperationalState =
        prev.state === 'AwaitingEvidence' ? 'InProgress' : prev.state;
      return { ...prev, evidence, state: next };
    }

    case 'EVIDENCE_REJECTED':
      return prev.state === 'Completed' ? prev : { ...prev, state: 'AwaitingEvidence' };

    case 'SIGNATURE_REQUESTED':
      return prev.state === 'Completed' ? prev : { ...prev, state: 'AwaitingSignature' };

    case 'SIGNATURE_COMPLETED': {
      const art = ev.payload.signature as SignatureArtifact | undefined;
      if (!art) return prev;
      const signatures = [...prev.signatures, art];
      // Completion is decided by handleSignatureCompleted (see engine), which
      // emits UNIT_COMPLETED only when ALL required signers have signed AND
      // all required evidence is present. The reducer only stores the
      // signature artefact here — it does not unilaterally complete the unit.
      return { ...prev, signatures };
    }

    case 'UNIT_BLOCKED':
      return {
        ...prev,
        state: 'Blocked',
        blockedReason: (ev.payload.reason as string | undefined) ?? prev.blockedReason,
      };

    case 'UNIT_UNBLOCKED':
      if (prev.state !== 'Blocked') return prev;
      return { ...prev, state: 'InProgress', blockedReason: undefined };

    case 'UNIT_COMPLETED':
      return { ...prev, state: 'Completed', completedAt: ev.occurredAt };

    case 'GATE_EVALUATED':
    case 'BATCH_COMPLETED':
    default:
      return prev;
  }
}

export const EMPTY_PROJECTION: UnitProjection = {
  state:      'NotStarted',
  signatures: [],
  evidence:   [],
};

/** Replay a full log restricted to one unit. */
export function projectUnit(
  unitId: string, log: readonly OnboardingEvent[],
): UnitProjection {
  let p = EMPTY_PROJECTION;
  for (const ev of log) {
    if (ev.unitId !== unitId) continue;
    p = applyEvent(p, ev);
  }
  return p;
}

/* ═══════════════════════════════════════════════════════════════
   EVENT STORE (zustand, persisted)
   ═══════════════════════════════════════════════════════════════ */

interface EventStoreState {
  log: OnboardingEvent[];
  /** Append a single event. */
  append:    (ev: Omit<OnboardingEvent, 'id' | 'occurredAt'> & Partial<Pick<OnboardingEvent, 'occurredAt'>>) => OnboardingEvent;
  /** Append many events atomically. */
  appendMany:(evs: Array<Omit<OnboardingEvent, 'id' | 'occurredAt'> & Partial<Pick<OnboardingEvent, 'occurredAt'>>>) => OnboardingEvent[];
  /** Clear the entire event log (test/admin only). */
  reset:     () => void;
}

let _seq = 0;
function nextId(): string {
  _seq += 1;
  return `oe-${Date.now().toString(36)}-${_seq.toString(36)}`;
}

export const useOnboardingEventStore = create<EventStoreState>()(
  persist(
    (set, get) => ({
      log: [],
      append: (ev) => {
        const full: OnboardingEvent = {
          id:         nextId(),
          occurredAt: ev.occurredAt ?? new Date().toISOString(),
          ...ev,
        } as OnboardingEvent;
        set({ log: [...get().log, full] });
        return full;
      },
      appendMany: (evs) => {
        const stamped = evs.map(e => ({
          id:         nextId(),
          occurredAt: e.occurredAt ?? new Date().toISOString(),
          ...e,
        } as OnboardingEvent));
        set({ log: [...get().log, ...stamped] });
        return stamped;
      },
      reset: () => set({ log: [] }),
    }),
    {
      name:    'onboarding-event-log-v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/** Helper for non-React code. */
export function getOnboardingEventLog(): readonly OnboardingEvent[] {
  return useOnboardingEventStore.getState().log;
}
