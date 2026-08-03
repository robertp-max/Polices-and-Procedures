// Right "Decision & Record" rail — workflow stepper, disposition chips, the
// structured-answer widget for the current DecisionNode (quorum calculator /
// MotionBuilder / MinutesComposer, chosen by node.kind), a running Action
// Register, and — for option-based and quorum kinds, which have no
// self-committing widget of their own — the "Save to Decision Record"
// button that locks the node and hands control back to TabletopSession.
//
// Cross-imports the real, already-landed "matter-work" widgets (group U3):
// MotionBuilder, MinutesComposer, ActionRegister — see each file for its
// authoritative prop contract; this rail adapts DecisionNode content into
// the shapes those widgets expect.
//
// Ground-up build for tabletop2026/ — does not reuse ../tabletop/* markup.

import { useMemo } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { DecisionNode, DecisionOption, InteractionKind, NodeSelection } from './engine/caseTypes';
import MotionBuilder, { type MotionDraft } from './MotionBuilder';
import MinutesComposer, { type MinutesRequirementItem } from './MinutesComposer';
import ActionRegister, { type ActionRegisterItem } from './ActionRegister';

export type SessionStage = 'validate' | 'deliberate' | 'decide' | 'document' | 'monitor';

const STAGE_ORDER: SessionStage[] = ['validate', 'deliberate', 'decide', 'document', 'monitor'];
const STAGE_LABEL: Record<SessionStage, string> = {
  validate: 'Validate',
  deliberate: 'Deliberate',
  decide: 'Decide',
  document: 'Document',
  monitor: 'Monitor',
};

/** Every InteractionKind maps to exactly one stage of the stepper. */
export function stageForKind(kind: InteractionKind): SessionStage {
  switch (kind) {
    case 'classify_evidence':
    case 'evidence_chain':
    case 'reconcile_conflict':
    case 'quorum_calc':
    case 'session_classification':
      return 'validate';
    case 'workflow_select':
    case 'forms_select':
    case 'risk_rank':
    case 'board_vs_management':
      return 'deliberate';
    case 'denominator':
    case 'eligibility':
    case 'proceed_decision':
    case 'disposition':
    case 'motion_builder':
    case 'owner_assign':
    case 'due_date':
    case 'effectiveness':
    case 'return_date':
      return 'decide';
    case 'public_minutes':
    case 'confidential_minutes':
      return 'document';
    case 'surveyor':
    case 'transfer':
    case 'multiple_choice':
      return 'monitor';
    default:
      return 'decide';
  }
}

export interface QuorumDraft {
  seatedDirectors: number;
  present: number;
}

export function emptyQuorumDraft(): QuorumDraft {
  return { seatedDirectors: 0, present: 0 };
}

function QuorumCalculator({
  draft,
  onChange,
  disabled,
}: {
  draft: QuorumDraft;
  onChange: (d: QuorumDraft) => void;
  disabled: boolean;
}) {
  const threshold = draft.seatedDirectors > 0 ? Math.floor(draft.seatedDirectors / 2) + 1 : 0;
  const met = draft.seatedDirectors > 0 && draft.present >= threshold;
  return (
    <div className="bs-motion-builder">
      <div className="bs-motion-field">
        <label htmlFor="bs-quorum-seated">Seated directors</label>
        <input
          id="bs-quorum-seated"
          type="number"
          min={0}
          disabled={disabled}
          value={draft.seatedDirectors || ''}
          onChange={(e) => onChange({ ...draft, seatedDirectors: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="bs-motion-field">
        <label htmlFor="bs-quorum-present">Present at call-to-order</label>
        <input
          id="bs-quorum-present"
          type="number"
          min={0}
          disabled={disabled}
          value={draft.present || ''}
          onChange={(e) => onChange({ ...draft, present: Number(e.target.value) || 0 })}
        />
      </div>
      <div className={`bs-quorum-band${met ? '' : ' not-met'}`}>
        <strong>{threshold || '—'}</strong>
        <span>votes required to convene{draft.seatedDirectors > 0 ? (met ? ' — quorum met' : ' — quorum NOT met') : ''}</span>
      </div>
    </div>
  );
}

export interface DecisionAndRecordRailProps {
  node: DecisionNode;
  meetingDate: string;
  selection: NodeSelection | undefined;
  onToggleOption: (optionId: string) => void;

  quorumDraft: QuorumDraft;
  onQuorumChange: (draft: QuorumDraft) => void;

  motionDraft: MotionDraft;
  onMotionChange: (draft: MotionDraft) => void;
  onMotionCommit: (motion: MotionDraft) => void;
  availableForms: { id: string; label: string }[];

  minutesItems: MinutesRequirementItem[];
  minutesCheckedIds: string[];
  onMinutesToggle: (id: string) => void;
  minutesPublicText: string;
  onMinutesPublicTextChange: (v: string) => void;
  minutesConfidentialText: string;
  onMinutesConfidentialTextChange: (v: string) => void;
  onMinutesCommit: () => void;

  actionRegisterItems: ActionRegisterItem[];
  onInspectEvidence: (exhibitId: string) => void;

  /** Fires only for option-based / quorum_calc kinds — the other widgets self-commit. */
  onManualSave: () => void;
  canManualSave: boolean;
  locked: boolean;
}

export default function DecisionAndRecordRail({
  node,
  meetingDate,
  selection,
  onToggleOption,
  quorumDraft,
  onQuorumChange,
  motionDraft,
  onMotionChange,
  onMotionCommit,
  availableForms,
  minutesItems,
  minutesCheckedIds,
  onMinutesToggle,
  minutesPublicText,
  onMinutesPublicTextChange,
  minutesConfidentialText,
  onMinutesConfidentialTextChange,
  onMinutesCommit,
  actionRegisterItems,
  onInspectEvidence,
  onManualSave,
  canManualSave,
  locked,
}: DecisionAndRecordRailProps) {
  const stage = stageForKind(node.kind);
  const stageIndex = STAGE_ORDER.indexOf(stage);
  const selectedOptionIds = selection?.selectedOptionIds ?? [];
  const isMinutesKind = node.kind === 'public_minutes' || node.kind === 'confidential_minutes';
  const isQuorumKind = node.kind === 'quorum_calc';
  const isMotionKind = !node.options && !isMinutesKind && !isQuorumKind;

  const structuredWidget = useMemo(() => {
    if (isQuorumKind) {
      return <QuorumCalculator draft={quorumDraft} onChange={onQuorumChange} disabled={locked} />;
    }
    if (isMinutesKind) {
      return (
        <MinutesComposer
          matterTitle={node.title}
          meetingDate={meetingDate}
          items={minutesItems}
          checkedIds={minutesCheckedIds}
          onToggle={onMinutesToggle}
          publicFreeText={minutesPublicText}
          onPublicFreeTextChange={onMinutesPublicTextChange}
          confidentialFreeText={minutesConfidentialText}
          onConfidentialFreeTextChange={onMinutesConfidentialTextChange}
          onCommit={onMinutesCommit}
          committed={locked}
        />
      );
    }
    if (isMotionKind) {
      return (
        <MotionBuilder
          matterTitle={node.title}
          availableForms={availableForms}
          value={motionDraft}
          onChange={onMotionChange}
          onCommit={onMotionCommit}
          committed={locked}
        />
      );
    }
    return null;
  }, [
    isQuorumKind,
    isMinutesKind,
    isMotionKind,
    quorumDraft,
    onQuorumChange,
    node.title,
    meetingDate,
    minutesItems,
    minutesCheckedIds,
    onMinutesToggle,
    minutesPublicText,
    onMinutesPublicTextChange,
    minutesConfidentialText,
    onMinutesConfidentialTextChange,
    onMinutesCommit,
    availableForms,
    motionDraft,
    onMotionChange,
    onMotionCommit,
    locked,
  ]);

  return (
    <aside className="bs-decision-rail" aria-label="Decision and record">
      <div className="bs-rail-card">
        <header>
          <strong>Workflow Stage</strong>
        </header>
        <ol className="bs-stepper" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {STAGE_ORDER.map((s, i) => (
            <li key={s} className={`bs-stepper-item${i < stageIndex ? ' done' : ''}${i === stageIndex ? ' current' : ''}`}>
              <span className="bs-stepper-dot" aria-hidden="true">
                {i < stageIndex ? <CheckCircle2 size={12} /> : i === stageIndex ? i + 1 : <Circle size={10} />}
              </span>
              <span>{STAGE_LABEL[s]}</span>
            </li>
          ))}
        </ol>
      </div>

      {node.options && node.options.length > 0 ? (
        <div className="bs-rail-card">
          <header>
            <strong>Disposition</strong>
          </header>
          <div className="bs-disposition-chips">
            {node.options.map((opt: DecisionOption) => (
              <button
                key={opt.id}
                type="button"
                className={`bs-chip${selectedOptionIds.includes(opt.id) ? ' selected' : ''}${opt.criticalFailure ? ' warn' : ''}`}
                onClick={() => onToggleOption(opt.id)}
                disabled={locked}
                aria-pressed={selectedOptionIds.includes(opt.id)}
              >
                {opt.id.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {structuredWidget ? (
        isMinutesKind || isMotionKind ? (
          structuredWidget
        ) : (
          <div className="bs-rail-card">
            <header>
              <strong>Quorum</strong>
            </header>
            {structuredWidget}
          </div>
        )
      ) : null}

      <div className="bs-rail-card">
        <header>
          <strong>Action Register</strong>
        </header>
        <ActionRegister items={actionRegisterItems} readOnly onInspectEvidence={onInspectEvidence} />
      </div>

      {(node.options && node.options.length > 0) || isQuorumKind ? (
        <button type="button" className="bs-rail-action" onClick={onManualSave} disabled={!canManualSave || locked}>
          Save to Decision Record
        </button>
      ) : null}
    </aside>
  );
}
