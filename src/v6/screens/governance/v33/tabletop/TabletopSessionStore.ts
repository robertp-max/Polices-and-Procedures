// Typed session state for the 2026 QAPI tabletop (§5), built on the adapter
// boundary in TabletopSessionAdapter.ts. Covers BOTH Solo and Facilitated
// group sessions. Nothing in here is an authoritative compliance record —
// only a successful commitEvidence() call (see complianceStore.ts) is.

import {
  getTabletopSessionAdapter,
  type TabletopSessionRecord,
} from './TabletopSessionAdapter';
import { QAPI2026_TABLETOP_ID } from './qapi2026TabletopCase';

// ---- Shared -----------------------------------------------------------------

export type SoloStep =
  | 'brief'
  | 'pre_read'
  | 'conflict_quorum'
  | 'q1_baseline'
  | 'q2_injects'
  | 'q3_injects'
  | 'q4_closure'
  | 'directive'
  | 'surveyor'
  | 'transfer'
  | 'attestation';

export const SOLO_STEP_ORDER: SoloStep[] = [
  'brief',
  'pre_read',
  'conflict_quorum',
  'q1_baseline',
  'q2_injects',
  'q3_injects',
  'q4_closure',
  'directive',
  'surveyor',
  'transfer',
  'attestation',
];

export const SOLO_STEP_LABEL: Record<SoloStep, string> = {
  brief: 'Brief & rules',
  pre_read: 'Pre-read the packet',
  conflict_quorum: 'Conflict & quorum',
  q1_baseline: 'Q1 — Baseline',
  q2_injects: 'Q2 — Worsening injects',
  q3_injects: 'Q3 — Growth & hospitalization injects',
  q4_closure: 'Q4 — Closure claims',
  directive: 'Motion & directive drafting',
  surveyor: 'Surveyor defense',
  transfer: 'Changed-facts transfer',
  attestation: 'Attestation & score',
};

/** Same-device roster roles for a facilitated group session. */
export type TabletopParticipantRole =
  | 'chair'
  | 'recorder'
  | 'administrator_rep'
  | 'clinical_qapi_rep'
  | 'compliance_legal'
  | 'finance'
  | 'observer_surveyor';

export const PARTICIPANT_ROLE_LABEL: Record<TabletopParticipantRole, string> = {
  chair: 'Chair',
  recorder: 'Recorder',
  administrator_rep: 'Administrator rep',
  clinical_qapi_rep: 'Clinical / QAPI rep',
  compliance_legal: 'Compliance / Legal',
  finance: 'Finance',
  observer_surveyor: 'Observer / Surveyor (non-voting)',
};

export const REQUIRED_PARTICIPANT_ROLES: TabletopParticipantRole[] = [
  'chair',
  'recorder',
  'administrator_rep',
  'clinical_qapi_rep',
  'compliance_legal',
  'finance',
];

export interface TabletopParticipant {
  participantId: string;
  name: string;
  role: TabletopParticipantRole;
  hasConflict: boolean;
  conflictNote: string;
  recused: boolean;
  /** This participant's own initial position, captured BEFORE the group vote. */
  initialPositions: Record<string, string>;
  /** This participant's own changed-facts transfer answers (required individually). */
  transferAnswers: Record<string, string>;
  attestedAt: string | null;
  /** Result of THIS participant's own evidence commit attempt. Never implied by the group score. */
  evidence: { attempted: boolean; recorded: boolean; notice: string } | null;
}

export interface TabletopMotion {
  decisionId: string;
  motionText: string;
  conditions: string;
  /** The option id the recorded outcome maps to, for scoring — set once the vote is final. */
  outcomeOptionId: string | null;
  votesFor: string[];
  votesAgainst: string[];
  abstained: string[];
  /** Participants excluded from this specific vote due to conflict/recusal. */
  recusedParticipantIds: string[];
  dissent: string;
}

// ---- Solo session -------------------------------------------------------

export interface SoloTabletopState {
  sessionId: string;
  learnerId: string;
  attemptNumber: number;
  formIndex: number;
  step: SoloStep;
  inspectedExhibitIds: string[];
  decisions: Record<string, string>;
  surveyor: Record<string, string>;
  transferAnswers: Record<string, string>;
  attested: boolean;
  startedAt: string;
}

export function newSoloSessionId(learnerId: string, attemptNumber: number): string {
  return `solo:${learnerId}:${attemptNumber}`;
}

export function createSoloState(learnerId: string, attemptNumber: number, formIndex: number): SoloTabletopState {
  return {
    sessionId: newSoloSessionId(learnerId, attemptNumber),
    learnerId,
    attemptNumber,
    formIndex,
    step: 'brief',
    inspectedExhibitIds: [],
    decisions: {},
    surveyor: {},
    transferAnswers: {},
    attested: false,
    startedAt: new Date().toISOString(),
  };
}

export function loadSoloState(sessionId: string): SoloTabletopState | null {
  return getTabletopSessionAdapter().load<SoloTabletopState>(sessionId)?.state ?? null;
}

export function saveSoloState(state: SoloTabletopState): void {
  const record: TabletopSessionRecord<SoloTabletopState> = {
    sessionId: state.sessionId,
    mode: 'solo',
    caseId: QAPI2026_TABLETOP_ID,
    updatedAt: new Date().toISOString(),
    state,
  };
  getTabletopSessionAdapter().save(record);
}

export function clearSoloState(sessionId: string): void {
  getTabletopSessionAdapter().remove(sessionId);
}

// ---- Facilitated group session --------------------------------------------

export type FacilitatedPhase = SoloStep; // same round/step vocabulary, group-paced

export interface FacilitatedTabletopState {
  sessionId: string;
  formIndex: number;
  title: string;
  sessionDate: string;
  facilitatorName: string;
  quorumRule: string;
  roster: TabletopParticipant[];
  /** The step the facilitator has advanced the ROOM to. Participants cannot get ahead of this. */
  currentStep: FacilitatedPhase;
  /** Steps the facilitator has explicitly unlocked so far, in order. */
  unlockedSteps: FacilitatedPhase[];
  inspectedExhibitIds: string[];
  motions: Record<string, TabletopMotion>;
  /** Shared group answer for surveyor questions (the room answers together). */
  groupSurveyor: Record<string, string>;
  startedAt: string;
}

export function newFacilitatedSessionId(seed: string): string {
  return `facilitated:${seed}`;
}

export function createFacilitatedState(opts: {
  sessionId: string;
  formIndex: number;
  title: string;
  sessionDate: string;
  facilitatorName: string;
  quorumRule: string;
  roster: TabletopParticipant[];
}): FacilitatedTabletopState {
  return {
    sessionId: opts.sessionId,
    formIndex: opts.formIndex,
    title: opts.title,
    sessionDate: opts.sessionDate,
    facilitatorName: opts.facilitatorName,
    quorumRule: opts.quorumRule,
    roster: opts.roster,
    currentStep: 'brief',
    unlockedSteps: ['brief'],
    inspectedExhibitIds: [],
    motions: {},
    groupSurveyor: {},
    startedAt: new Date().toISOString(),
  };
}

export function loadFacilitatedState(sessionId: string): FacilitatedTabletopState | null {
  return getTabletopSessionAdapter().load<FacilitatedTabletopState>(sessionId)?.state ?? null;
}

export function saveFacilitatedState(state: FacilitatedTabletopState): void {
  const record: TabletopSessionRecord<FacilitatedTabletopState> = {
    sessionId: state.sessionId,
    mode: 'facilitated',
    caseId: QAPI2026_TABLETOP_ID,
    updatedAt: new Date().toISOString(),
    state,
  };
  getTabletopSessionAdapter().save(record);
}

export function clearFacilitatedState(sessionId: string): void {
  getTabletopSessionAdapter().remove(sessionId);
}

export function makeParticipantId(name: string, role: TabletopParticipantRole): string {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'participant';
  return `${role}:${slug}`;
}
