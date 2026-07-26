// Governing Body Boardroom Simulation (2026) — SOLO session orchestrator.
//
// Drives one learner through: the Round-0 packet-readiness gate, the
// CasePack's decision nodes (rounds 0-6), the surveyor/transfer
// mini-assessment, official-evidence commit, results, and (on a miss)
// guided remediation / evidence review. Composes the four sibling panels
// built alongside this file (BoardBookPanel, BoardTableWorkspace,
// DecisionAndRecordRail, MeetingRecordTimeline) plus the shared matter-work
// widgets and screens landed by the parallel U3/U4 build pass
// (PacketReadinessGate, EvidenceInspector, SurveyorDefense, AttemptResults,
// RemediationCenter) — each cross-import below uses that file's actual,
// already-authored prop contract (read from disk, not guessed).
//
// Ground-up build for tabletop2026/ — does not reuse ../tabletop/* layout.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Landmark, Clock, Users, Save, LogOut, RotateCcw } from 'lucide-react';

import type {
  AttemptScore,
  AttemptSelections,
  CasePack,
  InteractionKind,
  TabletopDiagnostic,
} from './engine/caseTypes';
import { emptyAttemptSelections } from './engine/caseTypes';
import { enforceCutoff } from './engine/sourceCutoff';
import { buildDiagnostics } from './engine/diagnostics';
import { scoreAttempt } from './engine/scoring';
import { commitTabletopEvidence } from './engine/evidenceSnapshot';
import { variant } from './engine/attemptVariants';

import { Q1_CASE_PACK } from './data/q1Case';
import { Q2_2026_CASE } from './data/q2Case';
import { Q3_2026_CASE } from './data/q3Case';
import { Q4_CASE_PACK } from './data/q4Case';
import { ANNUAL_2026_CASE } from './data/annualCase';

import { readDraft, writeDraft, clearDraft } from '../compliance/complianceStore';
import type { EvidenceSaveResult } from '../compliance/complianceEvidenceAdapter';
import { DEFAULT_LEARNER_ID } from '../compliance/complianceCatalog';

import BoardBookPanel from './BoardBookPanel';
import BoardTableWorkspace from './BoardTableWorkspace';
import DecisionAndRecordRail, { emptyQuorumDraft, type QuorumDraft } from './DecisionAndRecordRail';
import MeetingRecordTimeline, { type RecordChip, type RecordChipKind } from './MeetingRecordTimeline';

import PacketReadinessGate, {
  type PacketSaveStatus,
  type PacketReadinessValue,
  type ReadinessCheck,
} from './PacketReadinessGate';
import {
  createPacketReadinessState,
  isAfterSourceCutoff,
  normalizePacketReadinessState,
  type Round0Stage,
} from './packetReadiness';
import { useActiveTime } from './useActiveTime';
import { useTabletopBodyLock } from './useTabletopBodyLock';
import EvidenceInspector from './EvidenceInspector';
import { emptyMotionDraft, type MotionDraft } from './MotionBuilder';
import type { MinutesRequirementItem } from './MinutesComposer';
import type { ActionRegisterItem } from './ActionRegister';
import SurveyorDefense from './SurveyorDefense';
import AttemptResults from './AttemptResults';
import RemediationCenter from './RemediationCenter';

const CASE_REGISTRY: Record<string, CasePack> = {
  q1: Q1_CASE_PACK,
  q2: Q2_2026_CASE,
  q3: Q3_2026_CASE,
  q4: Q4_CASE_PACK,
  annual: ANNUAL_2026_CASE,
  fy2026: ANNUAL_2026_CASE,
  [Q1_CASE_PACK.id]: Q1_CASE_PACK,
  [Q2_2026_CASE.id]: Q2_2026_CASE,
  [Q3_2026_CASE.id]: Q3_2026_CASE,
  [Q4_CASE_PACK.id]: Q4_CASE_PACK,
  [ANNUAL_2026_CASE.id]: ANNUAL_2026_CASE,
};

function resolveCasePack(caseId: string): CasePack | null {
  return CASE_REGISTRY[caseId] ?? CASE_REGISTRY[caseId.toLowerCase()] ?? null;
}

/** Matches TabletopHub's own convention exactly (see TabletopHub.tsx assignmentIdFor)
 *  so draft/attempt state and official-evidence lookups line up across screens. */
function assignmentIdFor(packId: string): string {
  return `gb:tabletop2026:${packId}`;
}

const MULTI_SELECT_KINDS = new Set<InteractionKind>(['classify_evidence', 'workflow_select', 'forms_select', 'risk_rank']);

type Phase = 'readiness' | 'nodes' | 'surveyor' | 'submitting' | 'results' | 'remediation' | 'review';

interface ResumePayload {
  casePackId: string;
  phase: Phase;
  readinessStage: Round0Stage;
  nodeCursor: number;
  selections: AttemptSelections;
  actionRegisterItems: ActionRegisterItem[];
  recordChips: RecordChip[];
  readinessSubmitted: boolean;
  readinessValue: PacketReadinessValue;
}

function emptyReadinessValue(casePack?: CasePack): PacketReadinessValue {
  return createPacketReadinessState(casePack?.packetConflictGroups ?? []);
}

function loadResume(assignmentId: string, casePack: CasePack): ResumePayload | null {
  const draft = readDraft(assignmentId);
  if (!draft) return null;
  const resume = draft.resume as unknown as Partial<ResumePayload> | undefined;
  if (!resume || resume.casePackId !== casePack.id) return null;
  return {
    casePackId: casePack.id,
    phase: resume.phase ?? 'readiness',
    readinessStage: resume.readinessStage ?? 'check',
    nodeCursor: resume.nodeCursor ?? 0,
    selections: resume.selections ?? emptyAttemptSelections(),
    actionRegisterItems: resume.actionRegisterItems ?? [],
    recordChips: resume.recordChips ?? [],
    readinessSubmitted: resume.readinessSubmitted ?? false,
    readinessValue: normalizePacketReadinessState(
      resume.readinessValue,
      casePack.packetConflictGroups,
      casePack,
    ),
  };
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatSavedAt(value: string | null): string {
  if (!value) return 'Saved just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || Date.now() - date.getTime() < 60_000) {
    return 'Saved just now';
  }
  return `Saved at ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export interface TabletopSessionProps {
  caseId: string;
  mode: 'solo' | 'group';
  onExit: () => void;
}

export default function TabletopSession({ caseId, mode, onExit }: TabletopSessionProps) {
  useTabletopBodyLock(true);
  const elapsedSeconds = useActiveTime();

  const basePack = useMemo(() => resolveCasePack(caseId), [caseId]);
  const assignmentId = useMemo(() => (basePack ? assignmentIdFor(basePack.id) : ''), [basePack]);
  const resumed = useMemo(
    () => (basePack ? loadResume(assignmentId, basePack) : null),
    [basePack, assignmentId],
  );

  const [attemptNumber, setAttemptNumber] = useState<number>(() => (assignmentId ? readDraft(assignmentId)?.attemptNumber ?? 1 : 1));
  const [failureCount, setFailureCount] = useState(0);
  const [phase, setPhase] = useState<Phase>(() => resumed?.phase ?? 'readiness');
  const [readinessStage, setReadinessStage] = useState<Round0Stage>(
    () => resumed?.readinessStage ?? 'check',
  );
  const [nodeCursor, setNodeCursor] = useState<number>(() => resumed?.nodeCursor ?? 0);
  const [selections, setSelections] = useState<AttemptSelections>(() => resumed?.selections ?? emptyAttemptSelections());
  const [actionRegisterItems, setActionRegisterItems] = useState<ActionRegisterItem[]>(() => resumed?.actionRegisterItems ?? []);
  const [recordChips, setRecordChips] = useState<RecordChip[]>(() => resumed?.recordChips ?? []);
  const [readinessSubmitted, setReadinessSubmitted] = useState(() => resumed?.readinessSubmitted ?? false);
  const [readinessValue, setReadinessValue] = useState<PacketReadinessValue>(
    () => resumed?.readinessValue ?? emptyReadinessValue(basePack ?? undefined),
  );

  const [quorumDraft, setQuorumDraft] = useState<QuorumDraft>(() => emptyQuorumDraft());
  const [motionDraft, setMotionDraft] = useState<MotionDraft>(() => emptyMotionDraft(''));
  const [minutesCheckedIds, setMinutesCheckedIds] = useState<string[]>([]);
  const [minutesPublicText, setMinutesPublicText] = useState('');
  const [minutesConfidentialText, setMinutesConfidentialText] = useState('');
  const [activeExhibitId, setActiveExhibitId] = useState<string | null>(null);

  const [diagnostics, setDiagnostics] = useState<TabletopDiagnostic[] | null>(null);
  const [score, setScore] = useState<AttemptScore | null>(null);
  const [evidenceResult, setEvidenceResult] = useState<EvidenceSaveResult | null>(null);

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<PacketSaveStatus>('saving');
  const [saveRetryVersion, setSaveRetryVersion] = useState(0);

  const casePack = useMemo(
    () => (basePack && assignmentId ? variant(basePack, DEFAULT_LEARNER_ID, assignmentId, attemptNumber) : null),
    [basePack, assignmentId, attemptNumber],
  );

  const cutoffViolationIds = useMemo(() => {
    if (!casePack) return new Set<string>();
    return new Set(enforceCutoff(casePack.exhibits, casePack.quarter).violations.map((e) => e.id));
  }, [casePack]);

  const readinessCutoffViolationIds = useMemo(() => {
    if (!casePack) return new Set<string>();
    return new Set(
      casePack.exhibits
        .filter((exhibit) =>
          isAfterSourceCutoff(exhibit.asOfDate, casePack.sourceCutoff),
        )
        .map((exhibit) => exhibit.id),
    );
  }, [casePack]);

  const readinessChecks: ReadinessCheck[] = useMemo(() => {
    if (!casePack) return [];
    const cutoffIds = [...readinessCutoffViolationIds];
    const unresolvedIds = casePack.exhibits
      .filter((exhibit) => exhibit.posture === 'unresolved')
      .map((exhibit) => exhibit.id);
    const conflictingIds = casePack.packetConflictGroups.flatMap(
      (group) => group.exhibitIds,
    );
    return [
      {
        id: 'cutoff',
        label: 'Evidence is within the allowed date range',
        status: cutoffIds.length ? 'unmet' : 'met',
        detail: cutoffIds.length
          ? `${cutoffIds.length} record(s) fall after the packet cutoff of ${casePack.sourceCutoff}.`
          : `Every record is on or before the packet cutoff of ${casePack.sourceCutoff}.`,
        evidenceIds: cutoffIds,
      },
      {
        id: 'unresolved',
        label: 'Every record has an identifiable source',
        status: unresolvedIds.length ? 'unmet' : 'met',
        detail: unresolvedIds.length
          ? `${unresolvedIds.length} record(s) still need source validation.`
          : 'Every record identifies its source or supplemental posture.',
        evidenceIds: unresolvedIds,
      },
      {
        id: 'validation',
        label: 'Conflicting values have been identified',
        status: conflictingIds.length ? 'unknown' : 'met',
        detail: conflictingIds.length
          ? `${casePack.packetConflictGroups.length} evidence problem${
              casePack.packetConflictGroups.length === 1 ? '' : 's'
            } need a Board reliance determination.`
          : 'This case pack has no authored evidence problems.',
        evidenceIds: conflictingIds,
      },
    ];
  }, [casePack, readinessCutoffViolationIds]);

  useEffect(() => {
    setReadinessValue((current) =>
      normalizePacketReadinessState(
        current,
        casePack?.packetConflictGroups ?? [],
        casePack ?? undefined,
      ),
    );
  }, [casePack]);

  const currentNode = casePack ? casePack.decisionNodes[nodeCursor] : undefined;

  const persistDraft = useCallback((): boolean => {
    if (!casePack || !assignmentId || phase === 'results') return false;
    const savedAt = new Date().toISOString();
    const saved = writeDraft({
      assignmentId,
      resume: {
        casePackId: casePack.id,
        phase,
        readinessStage,
        nodeCursor,
        selections,
        actionRegisterItems,
        recordChips,
        readinessSubmitted,
        readinessValue,
      },
      attemptNumber,
      progressPercent: Math.round(
        (nodeCursor / Math.max(casePack.decisionNodes.length, 1)) * 100,
      ),
      submittedLocally: phase === 'surveyor' || phase === 'submitting',
      updatedAt: savedAt,
    });
    if (saved) {
      setLastSavedAt(savedAt);
      setSaveStatus('saved');
    } else {
      setSaveStatus('error');
    }
    return saved;
  }, [
    casePack,
    assignmentId,
    phase,
    readinessStage,
    nodeCursor,
    selections,
    actionRegisterItems,
    recordChips,
    readinessSubmitted,
    readinessValue,
    attemptNumber,
  ]);

  // Autosave draft (resume-only — never official completion).
  useEffect(() => {
    if (!casePack || !assignmentId || phase === 'results') return;
    setSaveStatus('saving');
    const saveTimer = window.setTimeout(persistDraft, 250);
    return () => window.clearTimeout(saveTimer);
  }, [assignmentId, casePack, persistDraft, phase, saveRetryVersion]);

  useEffect(() => {
    if (!casePack || !assignmentId || phase === 'results') return;
    const saveBeforeLeave = () => {
      persistDraft();
    };
    window.addEventListener('pagehide', saveBeforeLeave);
    return () => window.removeEventListener('pagehide', saveBeforeLeave);
  }, [assignmentId, casePack, persistDraft, phase]);

  // Score + commit official evidence once the surveyor/transfer phase is submitted.
  useEffect(() => {
    if (phase !== 'submitting' || !casePack || !assignmentId) return;
    let cancelled = false;
    (async () => {
      const diag = buildDiagnostics(casePack, selections);
      const sc = scoreAttempt(casePack, selections, diag);
      const result = await commitTabletopEvidence({
        learnerId: DEFAULT_LEARNER_ID,
        assignmentId,
        role: 'GB',
        casePack,
        attemptNumber,
        selections,
        score: sc,
        activeTimeSeconds: elapsedSeconds,
        attestedAt: new Date().toISOString(),
        remediationPath: sc.passed ? 'none' : 'primary_retry',
      });
      if (cancelled) return;
      setDiagnostics(diag);
      setScore(sc);
      setEvidenceResult(result);
      if (!sc.passed) setFailureCount((n) => n + 1);
      clearDraft(assignmentId);
      setPhase('results');
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function handleReadinessSubmit(lockedValue: PacketReadinessValue) {
    setReadinessValue(lockedValue);
    setReadinessSubmitted(true);
    setRecordChips((prev) => [
      ...prev,
      {
        id: `readiness-${prev.length}`,
        kind: 'note',
        label: 'PACKET DISPOSITION',
        text: lockedValue.disposition ?? 'recorded',
        timestampIso: new Date().toISOString(),
      },
    ]);
    setPhase('nodes');
  }

  function handleReadinessChange(next: PacketReadinessValue) {
    setSaveStatus('saving');
    setReadinessValue(next);
  }

  function handleToggleOption(optionId: string) {
    if (!currentNode) return;
    const multi = MULTI_SELECT_KINDS.has(currentNode.kind);
    setSelections((prev) => {
      const existing = prev.nodeSelections[currentNode.id];
      const existingIds = existing?.selectedOptionIds ?? [];
      const nextIds = multi
        ? existingIds.includes(optionId)
          ? existingIds.filter((id) => id !== optionId)
          : [...existingIds, optionId]
        : existingIds.includes(optionId)
          ? []
          : [optionId];
      return {
        ...prev,
        nodeSelections: {
          ...prev.nodeSelections,
          [currentNode.id]: {
            nodeId: currentNode.id,
            selectedOptionIds: nextIds,
            action: existing?.action,
            evidenceCited: existing?.evidenceCited ?? [],
          },
        },
      };
    });
  }

  function handleCiteEvidence(exhibitId: string) {
    if (!currentNode) return;
    setSelections((prev) => {
      const existing = prev.nodeSelections[currentNode.id];
      const cited = existing?.evidenceCited ?? [];
      if (cited.includes(exhibitId)) return prev;
      return {
        ...prev,
        nodeSelections: {
          ...prev.nodeSelections,
          [currentNode.id]: {
            nodeId: currentNode.id,
            selectedOptionIds: existing?.selectedOptionIds,
            action: existing?.action,
            evidenceCited: [...cited, exhibitId],
          },
        },
      };
    });
  }

  function handleRemoveCitedEvidence(exhibitId: string) {
    if (!currentNode) return;
    setSelections((prev) => {
      const existing = prev.nodeSelections[currentNode.id];
      const cited = existing?.evidenceCited ?? [];
      return {
        ...prev,
        nodeSelections: {
          ...prev.nodeSelections,
          [currentNode.id]: {
            nodeId: currentNode.id,
            selectedOptionIds: existing?.selectedOptionIds,
            action: existing?.action,
            evidenceCited: cited.filter((id) => id !== exhibitId),
          },
        },
      };
    });
  }

  /** Shared tail of every "answer this node" path: records the action, appends
   *  a meeting-record chip, resets the per-node drafts, and advances the cursor
   *  (or moves on to the surveyor phase once the last node is answered). */
  function commitSelectionAndAdvance(action: unknown, chipKind: RecordChipKind) {
    if (!casePack || !currentNode) return;
    const existing = selections.nodeSelections[currentNode.id];
    setSelections((prev) => ({
      ...prev,
      nodeSelections: {
        ...prev.nodeSelections,
        [currentNode.id]: {
          nodeId: currentNode.id,
          selectedOptionIds: existing?.selectedOptionIds,
          action,
          evidenceCited: existing?.evidenceCited ?? [],
          timestampIso: new Date().toISOString(),
        },
      },
    }));
    setRecordChips((prev) => [
      ...prev,
      {
        id: `${currentNode.id}-${prev.length}`,
        kind: chipKind,
        label: chipKind.toUpperCase(),
        text: currentNode.title,
        timestampIso: new Date().toISOString(),
      },
    ]);

    setQuorumDraft(emptyQuorumDraft());
    setMotionDraft(emptyMotionDraft(''));
    setMinutesCheckedIds([]);
    setMinutesPublicText('');
    setMinutesConfidentialText('');
    setActiveExhibitId(null);

    if (nodeCursor + 1 >= casePack.decisionNodes.length) {
      setPhase('surveyor');
    } else {
      setNodeCursor((c) => c + 1);
    }
  }

  const canManualSave = useMemo(() => {
    if (!currentNode) return false;
    if (currentNode.options && currentNode.options.length > 0) {
      return (selections.nodeSelections[currentNode.id]?.selectedOptionIds?.length ?? 0) > 0;
    }
    if (currentNode.kind === 'quorum_calc') return quorumDraft.seatedDirectors > 0;
    return false;
  }, [currentNode, selections, quorumDraft]);

  function handleManualSave() {
    if (!currentNode) return;
    if (currentNode.options && currentNode.options.length > 0) {
      const existing = selections.nodeSelections[currentNode.id];
      commitSelectionAndAdvance(existing?.action, 'vote');
      return;
    }
    if (currentNode.kind === 'quorum_calc') {
      const threshold = quorumDraft.seatedDirectors > 0 ? Math.floor(quorumDraft.seatedDirectors / 2) + 1 : 0;
      commitSelectionAndAdvance(
        {
          seatedDirectors: quorumDraft.seatedDirectors,
          quorumThreshold: threshold,
          present: quorumDraft.present,
          quorumMet: quorumDraft.seatedDirectors > 0 && quorumDraft.present >= threshold,
        },
        'note',
      );
    }
  }

  function handleMotionCommit(motion: MotionDraft) {
    if (!currentNode) return;
    const citedIds = selections.nodeSelections[currentNode.id]?.evidenceCited ?? [];
    setActionRegisterItems((prev) => [
      ...prev,
      {
        id: `${currentNode.id}-action`,
        title: motion.matter || currentNode.title,
        ownerId: motion.ownerId,
        dueDate: motion.dueDate,
        status: 'open',
        effectivenessDemonstrated: null,
        returnDate: motion.returnDate || null,
        resources: motion.resources,
        formIds: motion.formIds,
        sourceExhibitIds: citedIds,
      },
    ]);
    commitSelectionAndAdvance(motion, 'motion');
  }

  function handleMinutesCommit() {
    commitSelectionAndAdvance(
      { checkedIds: minutesCheckedIds, publicText: minutesPublicText, confidentialText: minutesConfidentialText },
      'note',
    );
  }

  function handleAnswerSurveyor(questionId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, surveyorSelections: { ...prev.surveyorSelections, [questionId]: optionId } }));
  }

  function handleAnswerTransfer(questionId: string, optionId: string) {
    setSelections((prev) => ({ ...prev, transferSelections: { ...prev.transferSelections, [questionId]: optionId } }));
  }

  function resetForNewAttempt() {
    setPhase('readiness');
    setNodeCursor(0);
    setSelections(emptyAttemptSelections());
    setActionRegisterItems([]);
    setRecordChips([]);
    setReadinessSubmitted(false);
    setReadinessStage('check');
    setReadinessValue(emptyReadinessValue(casePack ?? undefined));
    setDiagnostics(null);
    setScore(null);
    setEvidenceResult(null);
    setQuorumDraft(emptyQuorumDraft());
    setMotionDraft(emptyMotionDraft(''));
    setMinutesCheckedIds([]);
    setMinutesPublicText('');
    setMinutesConfidentialText('');
    setActiveExhibitId(null);
  }

  function handleRetry() {
    setAttemptNumber((n) => n + 1);
    resetForNewAttempt();
  }

  function handleSaveRetry() {
    setSaveStatus('saving');
    setSaveRetryVersion((version) => version + 1);
  }

  function handleSessionExit() {
    if (phase !== 'results') persistDraft();
    onExit();
  }

  const missedCompetencyIds = useMemo(() => {
    if (!diagnostics) return [];
    const set = new Set<string>();
    diagnostics.forEach((d) => {
      if (d.result !== 'correct') d.competencyIds.forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [diagnostics]);

  const missedExhibitIds = useMemo(() => {
    if (!diagnostics) return [];
    const set = new Set<string>();
    diagnostics.forEach((d) => {
      d.evidenceMissed.forEach((id) => set.add(id));
      d.evidenceMisused.forEach((id) => set.add(id));
    });
    return Array.from(set);
  }, [diagnostics]);

  if (!basePack) {
    return (
      <div className="bs-root bs-session">
        <p style={{ padding: 32 }}>Unknown tabletop case &quot;{caseId}&quot;.</p>
        <button type="button" className="bs-rail-action secondary" onClick={onExit}>
          Exit
        </button>
      </div>
    );
  }

  if (mode !== 'solo') {
    return (
      <div className="bs-root bs-session">
        <p style={{ padding: 32 }}>
          This is the solo boardroom simulation. Facilitated-group sessions are launched from the Group Session screen.
        </p>
        <button type="button" className="bs-rail-action secondary" onClick={onExit}>
          Exit
        </button>
      </div>
    );
  }

  if (!casePack) return null;

  const roundLabel = currentNode ? (currentNode.round === 0 ? 'PRE-MEETING INTAKE' : `ROUND ${currentNode.round} OF 6`) : 'SESSION';

  const quorumNode = casePack.decisionNodes.find((n) => n.kind === 'quorum_calc');
  const quorumAction = quorumNode
    ? (selections.nodeSelections[quorumNode.id]?.action as
        | { quorumMet?: boolean; present?: number; seatedDirectors?: number }
        | undefined)
    : undefined;

  const readinessStep =
    { check: 1, conflicts: 2, decision: 3, review: 4 }[readinessStage];

  const phaseLabel =
    phase === 'readiness'
      ? 'PACKET READINESS'
      : phase === 'nodes'
        ? roundLabel
        : phase === 'surveyor'
          ? 'SURVEYOR DEFENSE'
          : phase === 'submitting'
            ? 'RECORDING'
            : phase === 'remediation'
              ? 'REMEDIATION'
              : phase === 'review'
                ? 'EVIDENCE REVIEW'
                : 'RESULTS';

  const allSurveyorAnswered =
    casePack.surveyor.every((q) => selections.surveyorSelections[q.id]) &&
    casePack.transfers.every((t) => selections.transferSelections[t.id]);

  const availableForms = currentNode ? currentNode.formsRequired.map((id) => ({ id, label: id })) : [];
  const minutesItems: MinutesRequirementItem[] = currentNode
    ? currentNode.formsRequired.map((id) => ({
        id,
        text: `Include ${id}`,
        required: true,
        confidential: currentNode.kind === 'confidential_minutes',
      }))
    : [];

  return (
    <div className="bs-root bs-session">
      <header className="bs-command-bar">
        <div className="bs-command-identity">
          <span className="bs-command-crest" aria-hidden="true">
            <Landmark size={16} />
          </span>
          <div>
            <span>
              {phase === 'readiness'
                ? 'Governing Body Tabletop'
                : `${casePack.quarter} 2026 · Governing Body Boardroom`}
            </span>
            <strong>{casePack.title}</strong>
          </div>
        </div>
        <div className="bs-command-meta">
          {phase === 'readiness' ? (
            <>
              <span>
                <b>Round 0 · Packet Readiness</b>
              </span>
              <span>Step {readinessStep} of 4</span>
              <span>
                <Clock size={12} aria-hidden="true" /> Active time ·{' '}
                {formatClock(elapsedSeconds)}
              </span>
              <span>
                {saveStatus === 'error' ? (
                  <button
                    className="bs-command-save-retry"
                    type="button"
                    onClick={handleSaveRetry}
                  >
                    <RotateCcw size={12} aria-hidden="true" />
                    Draft not saved — Retry
                  </button>
                ) : (
                  <>
                    <Save size={12} aria-hidden="true" />{' '}
                    {saveStatus === 'saving' ? 'Saving…' : formatSavedAt(lastSavedAt)}
                  </>
                )}
              </span>
            </>
          ) : (
            <>
              <span>
                <Clock size={12} aria-hidden="true" /> {formatClock(elapsedSeconds)}
              </span>
              <span>
                <b>{phaseLabel}</b>
              </span>
              <span>
                <Users size={12} aria-hidden="true" />{' '}
                {quorumAction
                  ? `${quorumAction.present ?? 0}/${quorumAction.seatedDirectors ?? 0} ${
                      quorumAction.quorumMet ? 'quorum met' : 'quorum not met'
                    }`
                  : 'Quorum: not yet evaluated'}
              </span>
              <span>
                <Save size={12} aria-hidden="true" />{' '}
                {saveStatus === 'saving' ? 'Saving…' : formatSavedAt(lastSavedAt)}
              </span>
            </>
          )}
          <button
            type="button"
            className="bs-rail-action secondary"
            style={{ width: 'auto', padding: '8px 14px' }}
            onClick={handleSessionExit}
          >
            <LogOut size={12} style={{ marginRight: 6 }} aria-hidden="true" />
            {phase === 'readiness' ? 'Exit' : 'Back to Tabletop Hub'}
          </button>
        </div>
      </header>

      {phase === 'readiness' ? (
        <div className="bs-readiness-stage">
          <PacketReadinessGate
            casePack={casePack}
            checks={readinessChecks}
            value={readinessValue}
            stage={readinessStage}
            onStageChange={setReadinessStage}
            onChange={handleReadinessChange}
            onSubmit={handleReadinessSubmit}
            saveStatus={saveStatus}
            lastSavedAt={lastSavedAt}
            onRetrySave={handleSaveRetry}
            submitted={readinessSubmitted}
          />
        </div>
      ) : phase === 'nodes' && currentNode ? (
        <>
          <div className="bs-layout">
            <BoardBookPanel
              casePack={casePack}
              activeExhibitId={activeExhibitId}
              citedExhibitIds={selections.nodeSelections[currentNode.id]?.evidenceCited ?? []}
              cutoffViolationIds={cutoffViolationIds}
              onSelectExhibit={setActiveExhibitId}
            />
            <BoardTableWorkspace
              casePack={casePack}
              node={currentNode}
              roundLabel={roundLabel}
              selection={selections.nodeSelections[currentNode.id]}
              activeExhibitId={activeExhibitId}
              onSelectExhibit={setActiveExhibitId}
              onToggleOption={handleToggleOption}
              onCiteEvidence={handleCiteEvidence}
              onRemoveCitedEvidence={handleRemoveCitedEvidence}
              locked={false}
            />
            <DecisionAndRecordRail
              node={currentNode}
              meetingDate={casePack.sourceCutoff}
              selection={selections.nodeSelections[currentNode.id]}
              onToggleOption={handleToggleOption}
              quorumDraft={quorumDraft}
              onQuorumChange={setQuorumDraft}
              motionDraft={motionDraft}
              onMotionChange={setMotionDraft}
              onMotionCommit={handleMotionCommit}
              availableForms={availableForms}
              minutesItems={minutesItems}
              minutesCheckedIds={minutesCheckedIds}
              onMinutesToggle={(id) =>
                setMinutesCheckedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
              }
              minutesPublicText={minutesPublicText}
              onMinutesPublicTextChange={setMinutesPublicText}
              minutesConfidentialText={minutesConfidentialText}
              onMinutesConfidentialTextChange={setMinutesConfidentialText}
              onMinutesCommit={handleMinutesCommit}
              actionRegisterItems={actionRegisterItems}
              onInspectEvidence={setActiveExhibitId}
              onManualSave={handleManualSave}
              canManualSave={canManualSave}
              locked={false}
            />
          </div>
          <MeetingRecordTimeline entries={recordChips} />
        </>
      ) : phase === 'surveyor' ? (
        <div className="bs-boardtable" style={{ gap: 16 }}>
          <SurveyorDefense
            surveyor={casePack.surveyor}
            transfers={casePack.transfers}
            surveyorSelections={selections.surveyorSelections}
            transferSelections={selections.transferSelections}
            onAnswerSurveyor={handleAnswerSurveyor}
            onAnswerTransfer={handleAnswerTransfer}
            mode={casePack.quarter === 'FY2026' ? 'annual' : 'quarterly'}
          />
          <button
            type="button"
            className="bs-rail-action"
            style={{ maxWidth: 360, margin: '0 auto' }}
            disabled={!allSurveyorAnswered}
            onClick={() => setPhase('submitting')}
          >
            Submit for Official Record
          </button>
        </div>
      ) : phase === 'submitting' ? (
        <p style={{ padding: 32, textAlign: 'center', color: 'var(--bs-muted)' }} role="status">
          Recording the meeting record…
        </p>
      ) : phase === 'remediation' ? (
        <RemediationCenter
          casePack={casePack}
          failureCount={failureCount}
          missedCompetencyIds={missedCompetencyIds}
          missedExhibitIds={missedExhibitIds}
          onExit={() => setPhase('results')}
          onRetryFullCase={handleRetry}
        />
      ) : phase === 'review' ? (
        <div className="bs-layout" style={{ gridTemplateColumns: '268px minmax(0, 1fr)' }}>
          <BoardBookPanel
            casePack={casePack}
            activeExhibitId={activeExhibitId}
            citedExhibitIds={[]}
            cutoffViolationIds={cutoffViolationIds}
            onSelectExhibit={setActiveExhibitId}
          />
          <div className="bs-boardtable">
            <button
              type="button"
              className="bs-rail-action secondary"
              style={{ width: 'auto', alignSelf: 'flex-start' }}
              onClick={() => setPhase('results')}
            >
              Back to Results
            </button>
            <EvidenceInspector exhibits={casePack.exhibits} caseQuarter={casePack.quarter} selectedExhibitId={activeExhibitId} onSelectExhibit={setActiveExhibitId} />
          </div>
        </div>
      ) : score && diagnostics ? (
        <>
          {evidenceResult && !evidenceResult.ok && (
            <p className="bs-supplemental-flag" role="status">
              {evidenceResult.message}
            </p>
          )}
          <AttemptResults
            casePack={casePack}
            score={score}
            diagnostics={diagnostics}
            attemptNumber={attemptNumber}
            failureCount={failureCount}
            onRetryFullCase={handleRetry}
            onStartGuidedRemediation={() => setPhase('remediation')}
            onReviewEvidence={(exhibitId) => {
              if (exhibitId) setActiveExhibitId(exhibitId);
              setPhase('review');
            }}
            onContinue={score.passed ? onExit : undefined}
          />
        </>
      ) : null}
    </div>
  );
}
