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

import { useEffect, useMemo, useState } from 'react';
import { Landmark, Clock, Users, Save, LogOut } from 'lucide-react';

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
  type PacketReadinessValue,
  type ReadinessCheck,
} from './PacketReadinessGate';
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
  nodeCursor: number;
  selections: AttemptSelections;
  actionRegisterItems: ActionRegisterItem[];
  recordChips: RecordChip[];
  readinessSubmitted: boolean;
  readinessValue: PacketReadinessValue;
}

function emptyReadinessValue(): PacketReadinessValue {
  return { disposition: null, rationale: '' };
}

function loadResume(assignmentId: string, casePackId: string): ResumePayload | null {
  const draft = readDraft(assignmentId);
  if (!draft) return null;
  const resume = draft.resume as unknown as Partial<ResumePayload> | undefined;
  if (!resume || resume.casePackId !== casePackId) return null;
  return {
    casePackId,
    phase: resume.phase ?? 'readiness',
    nodeCursor: resume.nodeCursor ?? 0,
    selections: resume.selections ?? emptyAttemptSelections(),
    actionRegisterItems: resume.actionRegisterItems ?? [],
    recordChips: resume.recordChips ?? [],
    readinessSubmitted: resume.readinessSubmitted ?? false,
    readinessValue: resume.readinessValue ?? emptyReadinessValue(),
  };
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export interface TabletopSessionProps {
  caseId: string;
  mode: 'solo' | 'group';
  onExit: () => void;
}

export default function TabletopSession({ caseId, mode, onExit }: TabletopSessionProps) {
  const basePack = useMemo(() => resolveCasePack(caseId), [caseId]);
  const assignmentId = useMemo(() => (basePack ? assignmentIdFor(basePack.id) : ''), [basePack]);
  const resumed = useMemo(() => (basePack ? loadResume(assignmentId, basePack.id) : null), [basePack, assignmentId]);

  const [attemptNumber, setAttemptNumber] = useState<number>(() => (assignmentId ? readDraft(assignmentId)?.attemptNumber ?? 1 : 1));
  const [failureCount, setFailureCount] = useState(0);
  const [phase, setPhase] = useState<Phase>(() => resumed?.phase ?? 'readiness');
  const [nodeCursor, setNodeCursor] = useState<number>(() => resumed?.nodeCursor ?? 0);
  const [selections, setSelections] = useState<AttemptSelections>(() => resumed?.selections ?? emptyAttemptSelections());
  const [actionRegisterItems, setActionRegisterItems] = useState<ActionRegisterItem[]>(() => resumed?.actionRegisterItems ?? []);
  const [recordChips, setRecordChips] = useState<RecordChip[]>(() => resumed?.recordChips ?? []);
  const [readinessSubmitted, setReadinessSubmitted] = useState(() => resumed?.readinessSubmitted ?? false);
  const [readinessValue, setReadinessValue] = useState<PacketReadinessValue>(() => resumed?.readinessValue ?? emptyReadinessValue());

  const [quorumDraft, setQuorumDraft] = useState<QuorumDraft>(() => emptyQuorumDraft());
  const [motionDraft, setMotionDraft] = useState<MotionDraft>(() => emptyMotionDraft(''));
  const [minutesCheckedIds, setMinutesCheckedIds] = useState<string[]>([]);
  const [minutesPublicText, setMinutesPublicText] = useState('');
  const [minutesConfidentialText, setMinutesConfidentialText] = useState('');
  const [activeExhibitId, setActiveExhibitId] = useState<string | null>(null);

  const [diagnostics, setDiagnostics] = useState<TabletopDiagnostic[] | null>(null);
  const [score, setScore] = useState<AttemptScore | null>(null);
  const [evidenceResult, setEvidenceResult] = useState<EvidenceSaveResult | null>(null);

  const [startTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const casePack = useMemo(
    () => (basePack && assignmentId ? variant(basePack, DEFAULT_LEARNER_ID, assignmentId, attemptNumber) : null),
    [basePack, assignmentId, attemptNumber],
  );

  const cutoffViolationIds = useMemo(() => {
    if (!casePack) return new Set<string>();
    return new Set(enforceCutoff(casePack.exhibits, casePack.quarter).violations.map((e) => e.id));
  }, [casePack]);

  const readinessChecks: ReadinessCheck[] = useMemo(() => {
    if (!casePack) return [];
    const cutoffIds = [...cutoffViolationIds];
    const unresolvedIds = casePack.exhibits.filter((e) => e.posture === 'unresolved').map((e) => e.id);
    const conflictingIds = casePack.exhibits.filter((e) => e.validationState === 'conflicting').map((e) => e.id);
    return [
      {
        id: 'cutoff',
        label: 'Evidence cutoff observed',
        status: cutoffIds.length ? 'unmet' : 'met',
        detail: cutoffIds.length
          ? `${cutoffIds.length} exhibit(s) are dated after this matter's source cutoff (${casePack.sourceCutoff}) and must not be relied on.`
          : 'No exhibits postdate the source cutoff.',
        evidenceIds: cutoffIds,
      },
      {
        id: 'unresolved',
        label: 'No unverified/unattributed records relied upon',
        status: unresolvedIds.length ? 'unmet' : 'met',
        detail: unresolvedIds.length
          ? `${unresolvedIds.length} exhibit(s) carry no established author or source and must not be treated as controlling.`
          : 'No unresolved records in this packet.',
        evidenceIds: unresolvedIds,
      },
      {
        id: 'validation',
        label: 'Data-quality conflicts reconciled',
        status: conflictingIds.length ? 'unknown' : 'met',
        detail: conflictingIds.length
          ? `${conflictingIds.length} exhibit(s) have conflicting recovered values that remain unreconciled as of this meeting.`
          : 'No conflicting recovered values remain open.',
        evidenceIds: conflictingIds,
      },
    ];
  }, [casePack, cutoffViolationIds]);

  const currentNode = casePack ? casePack.decisionNodes[nodeCursor] : undefined;

  // Meeting clock.
  useEffect(() => {
    const id = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => window.clearInterval(id);
  }, [startTime]);

  // Autosave draft (resume-only — never official completion).
  useEffect(() => {
    if (!casePack || !assignmentId || phase === 'results') return;
    writeDraft({
      assignmentId,
      resume: {
        casePackId: casePack.id,
        phase,
        nodeCursor,
        selections,
        actionRegisterItems,
        recordChips,
        readinessSubmitted,
        readinessValue,
      },
      attemptNumber,
      progressPercent: Math.round((nodeCursor / Math.max(casePack.decisionNodes.length, 1)) * 100),
      submittedLocally: phase === 'surveyor' || phase === 'submitting',
      updatedAt: new Date().toISOString(),
    });
    setLastSavedAt(new Date());
  }, [
    casePack,
    assignmentId,
    phase,
    nodeCursor,
    selections,
    actionRegisterItems,
    recordChips,
    readinessSubmitted,
    readinessValue,
    attemptNumber,
  ]);

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

  function handleReadinessSubmit() {
    setReadinessSubmitted(true);
    setRecordChips((prev) => [
      ...prev,
      {
        id: `readiness-${prev.length}`,
        kind: 'note',
        label: 'PACKET DISPOSITION',
        text: readinessValue.disposition ?? 'recorded',
        timestampIso: new Date().toISOString(),
      },
    ]);
    setPhase('nodes');
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
    setReadinessValue(emptyReadinessValue());
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
            <span>Governing Body Boardroom · {casePack.quarter}</span>
            <strong>{casePack.title}</strong>
          </div>
        </div>
        <div className="bs-command-meta">
          <span>
            <Clock size={12} aria-hidden="true" /> {formatClock(elapsedSeconds)}
          </span>
          <span>
            <b>{phaseLabel}</b>
          </span>
          <span>
            <Users size={12} aria-hidden="true" />{' '}
            {quorumAction
              ? `${quorumAction.present ?? 0}/${quorumAction.seatedDirectors ?? 0} ${quorumAction.quorumMet ? 'quorum met' : 'quorum not met'}`
              : 'quorum pending'}
          </span>
          <span>
            <Save size={12} aria-hidden="true" /> {lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString()}` : 'Not yet saved'}
          </span>
          <button
            type="button"
            className="bs-rail-action secondary"
            style={{ width: 'auto', padding: '8px 14px' }}
            onClick={onExit}
          >
            <LogOut size={12} style={{ marginRight: 6 }} aria-hidden="true" />
            Exit
          </button>
        </div>
      </header>

      {phase === 'readiness' ? (
        <div className="bs-boardtable" style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
          <PacketReadinessGate
            checks={readinessChecks}
            value={readinessValue}
            onChange={setReadinessValue}
            onSubmit={handleReadinessSubmit}
            submitted={readinessSubmitted}
            onInspectEvidence={setActiveExhibitId}
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
