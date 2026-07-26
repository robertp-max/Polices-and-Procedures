import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleHelp,
  CircleX,
  Clock3,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';

import './packetReadiness.css';
import type { CasePack, Exhibit } from './engine/caseTypes';
import {
  buildBoardRecordPreview,
  derivePacketMatters,
  getPacketReadinessCompletion,
  getRound0NextAction,
  isAfterSourceCutoff,
  isConflictDeterminationComplete,
  isIsoDate,
  packetRequiresFollowUp,
  type ConflictClassification,
  type ConflictReliance,
  type PacketDisposition,
  type PacketReadinessState,
  type Round0Stage,
} from './packetReadiness';

export type ReadinessStatus = 'met' | 'unmet' | 'unknown';

export interface ReadinessCheck {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  evidenceIds: string[];
}

export type PacketReadinessValue = PacketReadinessState;
export type PacketSaveStatus = 'saving' | 'saved' | 'error';

export interface PacketReadinessGateProps {
  casePack: CasePack;
  checks: ReadinessCheck[];
  value: PacketReadinessValue;
  stage: Round0Stage;
  onStageChange: (stage: Round0Stage) => void;
  onChange: (next: PacketReadinessValue) => void;
  onSubmit: (lockedValue: PacketReadinessValue) => void;
  saveStatus: PacketSaveStatus;
  lastSavedAt: string | null;
  onRetrySave: () => void;
  submitted?: boolean;
}

type MobilePanel = 'work' | 'context';

const STAGES: Array<{ id: Round0Stage; label: string }> = [
  { id: 'check', label: 'Packet Check' },
  { id: 'conflicts', label: 'Resolve Evidence Problems' },
  { id: 'decision', label: 'Board Reliance Decision' },
  { id: 'review', label: 'Review and Lock' },
];

const STAGE_CONTEXT: Record<Round0Stage, string> = {
  check: 'Confirm the packet boundaries, then move into the authored evidence problems.',
  conflicts: 'Save one answer at a time. Your choices remain private until Round 0 is locked.',
  decision: 'Choose what may proceed and record any follow-up that must return to the Board.',
  review: 'Read the generated Board record once, then lock it and continue.',
};

const CLASSIFICATIONS: Array<{
  id: ConflictClassification;
  label: string;
}> = [
  { id: 'reconciled', label: 'The records are reconciled.' },
  {
    id: 'limited_unresolved',
    label: 'The issue remains unresolved but affects only named matters.',
  },
  {
    id: 'material_unresolved',
    label: 'The issue remains unresolved and undermines the whole packet.',
  },
  {
    id: 'context_only',
    label: 'The apparent difference is context only, not a true conflict.',
  },
];

const RELIANCE_CHOICES: Array<{
  id: ConflictReliance;
  label: string;
}> = [
  { id: 'record_a', label: 'Record A' },
  { id: 'record_b', label: 'Record B' },
  { id: 'both_with_limitation', label: 'Both with a stated limitation' },
  { id: 'neither_pending_validation', label: 'Neither until validation' },
];

const DISPOSITIONS: Array<{
  id: PacketDisposition;
  label: string;
  description: string;
}> = [
  {
    id: 'full',
    label: 'Proceed on all matters — Full reliance',
    description: 'The Board may use this packet for every listed matter.',
  },
  {
    id: 'partial',
    label: 'Proceed only on unaffected matters — Partial reliance',
    description:
      'The Board may use the packet only for matters that are not affected by unresolved evidence.',
  },
  {
    id: 'hold',
    label: 'Do not use this packet — Hold',
    description: 'The Board must wait until the packet’s material problems are corrected.',
  },
];

const STATUS_ICON = {
  met: CheckCircle2,
  unmet: CircleX,
  unknown: CircleHelp,
};

const STATUS_LABEL = {
  met: 'Confirmed',
  unmet: 'Needs attention',
  unknown: 'Requires review',
};

function formatSavedAt(value: string | null): string {
  if (!value) return 'Saved just now';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Saved just now';
  if (Date.now() - date.getTime() < 60_000) return 'Saved just now';
  return `Saved at ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

function recordLabel(index: number): string {
  return index === 0 ? 'Record A' : 'Record B';
}

function findRecord(casePack: CasePack, exhibitId: string): Exhibit | undefined {
  return casePack.exhibits.find((exhibit) => exhibit.id === exhibitId);
}

function sourceStatusLabel(exhibit: Exhibit | undefined, sourceCutoff: string): string {
  if (!exhibit) return 'Source unavailable';
  if (isAfterSourceCutoff(exhibit.asOfDate, sourceCutoff)) {
    return `After packet cutoff (${sourceCutoff})`;
  }

  const posture =
    exhibit.posture === 'recovered'
      ? 'Recovered source'
      : exhibit.posture === 'supplemental_uat'
        ? 'Supplemental training record'
        : exhibit.posture === 'calculated'
          ? 'Calculated from source records'
          : 'Source not verified';
  const validation =
    exhibit.validationState === 'validated'
      ? 'verified'
      : exhibit.validationState === 'provisional'
        ? 'provisional'
        : exhibit.validationState === 'conflicting'
          ? 'contains conflicting values'
          : 'not validated';
  return `${posture} · ${validation}`;
}

function focusTarget(targetId?: string): void {
  if (!targetId) return;
  window.requestAnimationFrame(() => {
    const target = document.getElementById(targetId);
    target?.focus();
    target?.scrollIntoView?.({
      block: target.classList.contains('pd-stage') ? 'start' : 'center',
      behavior: 'smooth',
    });
  });
}

export default function PacketReadinessGate({
  casePack,
  checks,
  value,
  stage,
  onStageChange,
  onChange,
  onSubmit,
  saveStatus,
  lastSavedAt,
  onRetrySave,
  submitted = false,
}: PacketReadinessGateProps) {
  const groups = casePack.packetConflictGroups;
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('work');
  const [activeConflictIndex, setActiveConflictIndex] = useState(() => {
    const targetId = getRound0NextAction(value, casePack).targetId;
    const targetIndex = groups.findIndex((group) => group.id === targetId);
    return targetIndex >= 0 ? targetIndex : 0;
  });
  const [conflictError, setConflictError] = useState('');
  const [matterSearch, setMatterSearch] = useState('');
  const [showLockDialog, setShowLockDialog] = useState(false);
  const stageHeadingRef = useRef<HTMLHeadingElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogTriggerRef = useRef<HTMLElement | null>(null);

  const matters = useMemo(() => derivePacketMatters(casePack), [casePack]);
  const completion = useMemo(
    () => getPacketReadinessCompletion(value, casePack),
    [casePack, value],
  );
  const nextAction = useMemo(
    () => getRound0NextAction(value, casePack),
    [casePack, value],
  );
  const preview = useMemo(
    () => buildBoardRecordPreview(value, casePack),
    [casePack, value],
  );
  const stageIndex = STAGES.findIndex((item) => item.id === stage);
  const activeGroup = groups[activeConflictIndex];
  const activeDetermination = activeGroup
    ? value.conflictDeterminations[activeGroup.id]
    : undefined;
  const activeComplete = isConflictDeterminationComplete(activeDetermination);
  const dueDateInvalid = Boolean(
    value.followUp.dueDate && !isIsoDate(value.followUp.dueDate),
  );
  const returnDateInvalid = Boolean(
    value.followUp.returnDate && !isIsoDate(value.followUp.returnDate),
  );
  const filteredMatters = matters.filter((matter) =>
    matter.label.toLowerCase().includes(matterSearch.trim().toLowerCase()),
  );

  useEffect(() => {
    stageHeadingRef.current?.focus();
  }, [stage]);

  useEffect(() => {
    if (!showLockDialog) return;
    const cancel = dialogRef.current?.querySelector<HTMLButtonElement>(
      '[data-lock-cancel="true"]',
    );
    cancel?.focus();
  }, [showLockDialog]);

  function closeLockDialog(): void {
    setShowLockDialog(false);
    window.requestAnimationFrame(() => dialogTriggerRef.current?.focus());
  }

  function changeStage(nextStage: Round0Stage): void {
    setConflictError('');
    setMobilePanel('work');
    onStageChange(nextStage);
  }

  function updateDetermination(
    patch: Partial<NonNullable<typeof activeDetermination>>,
  ): void {
    if (!activeGroup || !activeDetermination || value.lockedAt) return;
    onChange({
      ...value,
      conflictDeterminations: {
        ...value.conflictDeterminations,
        [activeGroup.id]: {
          ...activeDetermination,
          ...patch,
          completedAt: null,
        },
      },
    });
    setConflictError('');
  }

  function saveConflictAndContinue(): void {
    if (!activeGroup || !activeDetermination) return;
    if (
      !activeDetermination.classification ||
      !activeDetermination.reliance ||
      !activeDetermination.note.trim()
    ) {
      setConflictError('Choose both answers and add a short reason before continuing.');
      return;
    }

    const nextValue: PacketReadinessValue = {
      ...value,
      conflictDeterminations: {
        ...value.conflictDeterminations,
        [activeGroup.id]: {
          ...activeDetermination,
          note: activeDetermination.note.trim(),
          completedAt: new Date().toISOString(),
        },
      },
    };
    onChange(nextValue);
    setConflictError('');

    const nextIncompleteIndex = groups.findIndex(
      (group, index) =>
        index > activeConflictIndex &&
        !isConflictDeterminationComplete(nextValue.conflictDeterminations[group.id]),
    );
    if (nextIncompleteIndex >= 0) {
      setActiveConflictIndex(nextIncompleteIndex);
      focusTarget(groups[nextIncompleteIndex].id);
      return;
    }

    const earlierIncompleteIndex = groups.findIndex(
      (group) =>
        !isConflictDeterminationComplete(nextValue.conflictDeterminations[group.id]),
    );
    if (earlierIncompleteIndex >= 0) {
      setActiveConflictIndex(earlierIncompleteIndex);
      focusTarget(groups[earlierIncompleteIndex].id);
      return;
    }

    changeStage('decision');
  }

  function selectDisposition(disposition: PacketDisposition): void {
    if (value.lockedAt) return;
    const allMatterIds = matters.map((matter) => matter.id);
    onChange({
      ...value,
      disposition,
      mattersProceeding: disposition === 'full' ? allMatterIds : [],
      mattersHeld: disposition === 'hold' ? allMatterIds : [],
    });
  }

  function setMatterChecked(
    matterId: string,
    destination: 'proceeding' | 'held',
    checked: boolean,
  ): void {
    if (value.lockedAt || value.disposition !== 'partial') return;
    const proceeding = new Set(value.mattersProceeding);
    const held = new Set(value.mattersHeld);
    const selected = destination === 'proceeding' ? proceeding : held;
    const other = destination === 'proceeding' ? held : proceeding;
    if (checked) {
      selected.add(matterId);
      other.delete(matterId);
    } else {
      selected.delete(matterId);
    }
    onChange({
      ...value,
      mattersProceeding: [...proceeding],
      mattersHeld: [...held],
    });
  }

  function updateFollowUp(
    field: keyof PacketReadinessValue['followUp'],
    next: string,
  ): void {
    if (value.lockedAt) return;
    onChange({
      ...value,
      followUp: {
        ...value.followUp,
        [field]: next || null,
      },
    });
  }

  function handlePrimaryAction(): void {
    if (stage === 'check' && nextAction.stage === 'check') {
      const targetIndex = groups.findIndex(
        (group) => group.id === nextAction.targetId,
      );
      if (targetIndex >= 0) setActiveConflictIndex(targetIndex);
      changeStage('conflicts');
      focusTarget(nextAction.targetId);
      return;
    }
    if (nextAction.stage === 'review') {
      changeStage('review');
      return;
    }
    if (nextAction.stage !== stage) {
      changeStage(nextAction.stage);
      if (nextAction.stage === 'conflicts') {
        const targetIndex = groups.findIndex((group) => group.id === nextAction.targetId);
        if (targetIndex >= 0) setActiveConflictIndex(targetIndex);
      }
      focusTarget(nextAction.targetId);
      return;
    }
    focusTarget(nextAction.targetId);
  }

  function handleReviewAction(): void {
    if (completion.canLock) {
      dialogTriggerRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setShowLockDialog(true);
      return;
    }
    if (completion.firstIncomplete) {
      changeStage(completion.firstIncomplete.stage);
      focusTarget(completion.firstIncomplete.targetId);
    }
  }

  function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeLockDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    if (!focusable?.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function lockRound0(): void {
    if (!completion.canLock || submitted) return;
    const lockedValue = {
      ...value,
      lockedAt: new Date().toISOString(),
    };
    onChange(lockedValue);
    setShowLockDialog(false);
    onSubmit(lockedValue);
  }

  const unresolvedMatterCount = new Set(
    groups.flatMap((group) => {
      const classification = value.conflictDeterminations[group.id]?.classification;
      return classification === 'limited_unresolved' ? group.affectedMatterIds : [];
    }),
  ).size;
  const materialConflictCount = groups.filter(
    (group) =>
      value.conflictDeterminations[group.id]?.classification === 'material_unresolved',
  ).length;

  return (
    <section className="pd-round0" aria-labelledby="round0-title">
      <header className="pd-stage-header">
        <div>
          <p className="pd-eyebrow">Round 0 · Packet Readiness</p>
          <h1 id="round0-title">Can the Board rely on this packet?</h1>
        </div>
        <div className="pd-mobile-tabs" role="tablist" aria-label="Round 0 panels">
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === 'work'}
            onClick={() => setMobilePanel('work')}
          >
            Work
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mobilePanel === 'context'}
            onClick={() => setMobilePanel('context')}
          >
            Context
          </button>
        </div>
      </header>

      <div className="pd-layout">
        <main
          className="pd-main"
          data-mobile-visible={mobilePanel === 'work'}
          aria-label="Round 0 work"
        >
          {stage === 'check' && (
            <div className="pd-stage" data-testid="packet-check-stage">
              <div className="pd-section-heading">
                <p>Step 1 of 4</p>
                <h2 ref={stageHeadingRef} tabIndex={-1}>
                  Packet Check
                </h2>
                <span>
                  These checks describe the packet as loaded. There is nothing to attest or
                  sign here.
                </span>
              </div>

              <div className="pd-check-list" aria-label="Packet checks">
                {checks.map((check) => {
                  const StatusIcon = STATUS_ICON[check.status];
                  return (
                    <article className="pd-check-row" key={check.id}>
                      <StatusIcon aria-hidden="true" />
                      <div>
                        <h3>{check.label}</h3>
                        <p>{check.detail}</p>
                      </div>
                      <span className={`pd-status pd-status--${check.status}`}>
                        {STATUS_LABEL[check.status]}
                      </span>
                    </article>
                  );
                })}
              </div>

              <div className="pd-action-row">
                <button
                  className="pd-button pd-button--primary"
                  type="button"
                  onClick={handlePrimaryAction}
                >
                  {nextAction.label}
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {stage === 'conflicts' && activeGroup && activeDetermination && (
            <div
              className="pd-stage"
              id={activeGroup.id}
              tabIndex={-1}
              data-testid="conflict-stage"
            >
              <div className="pd-section-heading">
                <p>
                  Evidence Problem {activeConflictIndex + 1} of {groups.length}
                </p>
                <h2 ref={stageHeadingRef} tabIndex={-1}>
                  {activeGroup.title}
                </h2>
                <span>{activeGroup.plainLanguageQuestion}</span>
              </div>

              <nav className="pd-conflict-progress" aria-label="Evidence problem progress">
                {groups.map((group, index) => {
                  const complete = isConflictDeterminationComplete(
                    value.conflictDeterminations[group.id],
                  );
                  return (
                    <button
                      type="button"
                      key={group.id}
                      aria-label={`Evidence problem ${index + 1}${
                        complete ? ', saved' : ''
                      }`}
                      aria-current={index === activeConflictIndex ? 'step' : undefined}
                      data-complete={complete}
                      onClick={() => {
                        setActiveConflictIndex(index);
                        setConflictError('');
                      }}
                    >
                      {complete ? <Check aria-hidden="true" /> : index + 1}
                    </button>
                  );
                })}
              </nav>

              <div className="pd-record-comparison" aria-label="Paired evidence records">
                {activeGroup.exhibitIds.slice(0, 2).map((exhibitId, index) => {
                  const exhibit = findRecord(casePack, exhibitId);
                  return (
                    <article className="pd-record" key={exhibitId}>
                      <p className="pd-record-label">{recordLabel(index)}</p>
                      <h3>{exhibit?.title ?? exhibitId}</h3>
                      <dl className="pd-record-meta">
                        <div>
                          <dt>Record ID</dt>
                          <dd>{exhibit?.sourceId ?? exhibitId}</dd>
                        </div>
                        <div>
                          <dt>As of</dt>
                          <dd>{exhibit?.asOfDate ?? activeGroup.sourceCutoff}</dd>
                        </div>
                        <div className="pd-record-source-status">
                          <dt>Source status</dt>
                          <dd>{sourceStatusLabel(exhibit, activeGroup.sourceCutoff)}</dd>
                        </div>
                      </dl>
                      <div className="pd-conflicting-fields">
                        {activeGroup.conflictingFields.map((field) => {
                          const fieldValue = field.values.find(
                            (item) => item.exhibitId === exhibitId,
                          );
                          return (
                            <div className="pd-conflicting-field" key={field.label}>
                              <span>{field.label}</span>
                              <strong>{fieldValue?.value ?? 'Not stated'}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </article>
                  );
                })}
              </div>

              <p className="pd-why-it-matters">
                <strong>Why this matters:</strong> {activeGroup.whyItMatters}
              </p>

              <fieldset className="pd-choice-group">
                <legend>What does this conflict mean?</legend>
                {CLASSIFICATIONS.map((choice) => (
                  <label key={choice.id}>
                    <input
                      type="radio"
                      name={`classification-${activeGroup.id}`}
                      value={choice.id}
                      checked={activeDetermination.classification === choice.id}
                      onChange={() => updateDetermination({ classification: choice.id })}
                    />
                    <span>{choice.label}</span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="pd-choice-group">
                <legend>Which information may the Board use?</legend>
                {RELIANCE_CHOICES.map((choice) => (
                  <label key={choice.id}>
                    <input
                      type="radio"
                      name={`reliance-${activeGroup.id}`}
                      value={choice.id}
                      checked={activeDetermination.reliance === choice.id}
                      onChange={() => updateDetermination({ reliance: choice.id })}
                    />
                    <span>{choice.label}</span>
                  </label>
                ))}
              </fieldset>

              <label className="pd-field" htmlFor={`conflict-note-${activeGroup.id}`}>
                <span>Why?</span>
                <textarea
                  id={`conflict-note-${activeGroup.id}`}
                  maxLength={400}
                  rows={4}
                  value={activeDetermination.note}
                  onChange={(event) => updateDetermination({ note: event.target.value })}
                  placeholder="Explain the limitation the Board should preserve."
                />
                <small>{activeDetermination.note.length}/400 characters</small>
              </label>

              {conflictError && (
                <p className="pd-inline-error" role="alert">
                  <AlertTriangle aria-hidden="true" />
                  {conflictError}
                </p>
              )}

              <div className="pd-action-row pd-action-row--split">
                <button
                  className="pd-button pd-button--quiet"
                  type="button"
                  onClick={() => changeStage('check')}
                >
                  <ArrowLeft aria-hidden="true" />
                  Return to packet check
                </button>
                <div>
                  <button
                    className="pd-icon-button"
                    type="button"
                    aria-label="Previous evidence problem"
                    title="Previous evidence problem"
                    disabled={activeConflictIndex === 0}
                    onClick={() => {
                      setActiveConflictIndex((index) => Math.max(0, index - 1));
                      setConflictError('');
                    }}
                  >
                    <ArrowLeft aria-hidden="true" />
                  </button>
                  <button
                    className="pd-button pd-button--primary"
                    type="button"
                    onClick={saveConflictAndContinue}
                  >
                    {activeConflictIndex === groups.length - 1
                      ? 'Save and continue'
                      : 'Save and review next problem'}
                    <ArrowRight aria-hidden="true" />
                  </button>
                  <button
                    className="pd-icon-button"
                    type="button"
                    aria-label="Next evidence problem"
                    title="Next evidence problem"
                    disabled={
                      activeConflictIndex === groups.length - 1 || !activeComplete
                    }
                    onClick={() => {
                      setActiveConflictIndex((index) =>
                        Math.min(groups.length - 1, index + 1),
                      );
                      setConflictError('');
                    }}
                  >
                    <ArrowRight aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {stage === 'conflicts' && groups.length === 0 && (
            <div className="pd-stage pd-empty-stage">
              <ShieldCheck aria-hidden="true" />
              <h2 ref={stageHeadingRef} tabIndex={-1}>
                No authored evidence problems
              </h2>
              <p>This packet can move directly to the Board reliance decision.</p>
              <button
                className="pd-button pd-button--primary"
                type="button"
                onClick={() => changeStage('decision')}
              >
                Continue to Board decision
                <ArrowRight aria-hidden="true" />
              </button>
            </div>
          )}

          {stage === 'decision' && (
            <div className="pd-stage" data-testid="decision-stage">
              <div className="pd-section-heading">
                <p>Step 3 of 4</p>
                <h2 ref={stageHeadingRef} tabIndex={-1}>
                  Board Reliance Decision
                </h2>
                <span>
                  Choose what may proceed based on the answers you saved.
                </span>
              </div>

              <section className="pd-neutral-summary" aria-labelledby="review-summary-title">
                <h3 id="review-summary-title">Your packet review</h3>
                <ul>
                  <li>
                    <strong>{checks.length}</strong> checks reviewed
                  </li>
                  <li>
                    <strong>{groups.length}</strong> evidence problems classified
                  </li>
                  <li>
                    <strong>{unresolvedMatterCount}</strong> matters contain unresolved
                    evidence
                  </li>
                  <li>
                    <strong>{materialConflictCount}</strong>{' '}
                    {materialConflictCount === 1 ? 'problem may' : 'problems may'} affect the
                    full packet
                  </li>
                </ul>
              </section>

              <fieldset className="pd-dispositions" id="round0-disposition" tabIndex={-1}>
                <legend>Choose what the Board may do</legend>
                <div>
                  {DISPOSITIONS.map((option) => (
                    <label
                      className="pd-disposition"
                      data-selected={value.disposition === option.id}
                      key={option.id}
                    >
                      <input
                        type="radio"
                        name="packet-disposition"
                        value={option.id}
                        checked={value.disposition === option.id}
                        onChange={() => selectDisposition(option.id)}
                      />
                      <strong>{option.label}</strong>
                      <span>{option.description}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <section
                className="pd-matter-builder"
                id="round0-matter-scope"
                tabIndex={-1}
                aria-labelledby="matter-scope-title"
              >
                <div className="pd-subsection-heading">
                  <h3 id="matter-scope-title">Which matters may proceed?</h3>
                  <p>
                    {value.disposition === 'partial'
                      ? 'Assign every matter to one list.'
                      : 'The all-matters and hold choices assign the full matter list automatically.'}
                  </p>
                </div>
                <label className="pd-search-field">
                  <span>Search matters</span>
                  <input
                    type="search"
                    value={matterSearch}
                    onChange={(event) => setMatterSearch(event.target.value)}
                    placeholder="Find a matter"
                  />
                </label>

                <div className="pd-matter-columns">
                  <fieldset>
                    <legend>Matters allowed to proceed</legend>
                    {filteredMatters.map((matter) => (
                      <label key={matter.id}>
                        <input
                          type="checkbox"
                          checked={value.mattersProceeding.includes(matter.id)}
                          disabled={value.disposition !== 'partial'}
                          onChange={(event) =>
                            setMatterChecked(matter.id, 'proceeding', event.target.checked)
                          }
                        />
                        <span>{matter.label}</span>
                      </label>
                    ))}
                  </fieldset>
                  <fieldset>
                    <legend>Matters held or limited</legend>
                    {filteredMatters.map((matter) => (
                      <label key={matter.id}>
                        <input
                          type="checkbox"
                          checked={value.mattersHeld.includes(matter.id)}
                          disabled={value.disposition !== 'partial'}
                          onChange={(event) =>
                            setMatterChecked(matter.id, 'held', event.target.checked)
                          }
                        />
                        <span>{matter.label}</span>
                      </label>
                    ))}
                  </fieldset>
                </div>
              </section>

              {packetRequiresFollowUp(value) && (
                <section className="pd-follow-up" aria-labelledby="follow-up-title">
                  <div className="pd-subsection-heading">
                    <h3 id="follow-up-title">Required follow-up</h3>
                    <p>Assign the work and identify when it returns to the Board.</p>
                  </div>
                  <div className="pd-field-grid">
                    <label className="pd-field" htmlFor="round0-follow-up-action">
                      <span>Action</span>
                      <input
                        id="round0-follow-up-action"
                        value={value.followUp.action}
                        onChange={(event) =>
                          updateFollowUp('action', event.target.value)
                        }
                      />
                    </label>
                    <label className="pd-field" htmlFor="round0-follow-up-owner">
                      <span>Owner</span>
                      <input
                        id="round0-follow-up-owner"
                        value={value.followUp.owner}
                        onChange={(event) =>
                          updateFollowUp('owner', event.target.value)
                        }
                      />
                    </label>
                    <label className="pd-field" htmlFor="round0-follow-up-due">
                      <span>Due date</span>
                      <input
                        id="round0-follow-up-due"
                        type="text"
                        aria-label="Due date"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="YYYY-MM-DD"
                        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                        maxLength={10}
                        value={value.followUp.dueDate ?? ''}
                        aria-invalid={dueDateInvalid || undefined}
                        aria-describedby={
                          dueDateInvalid ? 'round0-follow-up-due-error' : undefined
                        }
                        onChange={(event) =>
                          updateFollowUp('dueDate', event.target.value)
                        }
                      />
                      {dueDateInvalid && (
                        <small
                          className="pd-field-error"
                          id="round0-follow-up-due-error"
                          role="alert"
                        >
                          Enter a real calendar date as YYYY-MM-DD.
                        </small>
                      )}
                    </label>
                    <label className="pd-field" htmlFor="round0-follow-up-return">
                      <span>Return-to-Board date</span>
                      <input
                        id="round0-follow-up-return"
                        type="text"
                        aria-label="Return-to-Board date"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="YYYY-MM-DD"
                        pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                        maxLength={10}
                        value={value.followUp.returnDate ?? ''}
                        aria-invalid={returnDateInvalid || undefined}
                        aria-describedby={
                          returnDateInvalid
                            ? 'round0-follow-up-return-error'
                            : undefined
                        }
                        onChange={(event) =>
                          updateFollowUp('returnDate', event.target.value)
                        }
                      />
                      {returnDateInvalid && (
                        <small
                          className="pd-field-error"
                          id="round0-follow-up-return-error"
                          role="alert"
                        >
                          Enter a real calendar date as YYYY-MM-DD.
                        </small>
                      )}
                    </label>
                  </div>
                </section>
              )}

              <label className="pd-field pd-rationale" htmlFor="round0-board-rationale">
                <span>Board rationale</span>
                <em>In your own words, why is this Board decision defensible?</em>
                <textarea
                  id="round0-board-rationale"
                  rows={6}
                  maxLength={600}
                  value={value.boardRationale}
                  onChange={(event) =>
                    onChange({ ...value, boardRationale: event.target.value })
                  }
                />
                <small>{value.boardRationale.length}/600 characters</small>
              </label>

              <BoardRecord value={preview} compact />

              <div className="pd-action-row pd-action-row--split">
                <button
                  className="pd-button pd-button--quiet"
                  type="button"
                  onClick={() => changeStage('conflicts')}
                >
                  <ArrowLeft aria-hidden="true" />
                  Return to evidence problems
                </button>
                <button
                  className="pd-button pd-button--primary"
                  type="button"
                  onClick={handlePrimaryAction}
                >
                  {completion.canLock ? 'Review Board record' : nextAction.label}
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {stage === 'review' && (
            <div className="pd-stage" data-testid="review-stage">
              <div className="pd-section-heading">
                <p>Step 4 of 4</p>
                <h2 ref={stageHeadingRef} tabIndex={-1}>
                  Review and Lock
                </h2>
                <span>Read the Board record exactly as it will be preserved.</span>
              </div>

              <BoardRecord value={preview} />

              <section className="pd-readiness" aria-labelledby="readiness-title">
                <h3 id="readiness-title">Ready to lock</h3>
                <ul>
                  <ReadinessItem complete={completion.packetCheckComplete}>
                    Packet checks reviewed
                  </ReadinessItem>
                  <ReadinessItem complete={completion.conflictsComplete}>
                    Evidence problems classified
                  </ReadinessItem>
                  <ReadinessItem complete={completion.dispositionSelected}>
                    Board decision selected
                  </ReadinessItem>
                  <ReadinessItem complete={completion.matterScopeComplete}>
                    Proceeding and held matters identified
                  </ReadinessItem>
                  <ReadinessItem complete={completion.followUpCompleteWhenRequired}>
                    Follow-up assigned when required
                  </ReadinessItem>
                  <ReadinessItem complete={completion.boardRationaleComplete}>
                    Board rationale completed
                  </ReadinessItem>
                </ul>
              </section>

              {completion.firstIncomplete && (
                <div className="pd-one-action" role="status">
                  <AlertTriangle aria-hidden="true" />
                  <p>One item remains: {completion.firstIncomplete.label.toLowerCase()}.</p>
                  <button
                    className="pd-button pd-button--quiet"
                    type="button"
                    onClick={handleReviewAction}
                  >
                    {completion.firstIncomplete.label}
                  </button>
                </div>
              )}

              <div className="pd-action-row pd-action-row--split">
                <button
                  className="pd-button pd-button--quiet"
                  type="button"
                  onClick={() => changeStage('decision')}
                >
                  <ArrowLeft aria-hidden="true" />
                  Return to Board decision
                </button>
                <button
                  className="pd-button pd-button--primary"
                  id="round0-lock"
                  type="button"
                  disabled={!completion.canLock || submitted}
                  onClick={handleReviewAction}
                >
                  <LockKeyhole aria-hidden="true" />
                  Lock Round 0 and continue
                </button>
              </div>
            </div>
          )}
        </main>

        <aside
          className="pd-context"
          data-mobile-visible={mobilePanel === 'context'}
          aria-label="Round 0 context"
        >
          <div className="pd-context-step">
            <span>Step {stageIndex + 1} of 4</span>
            <strong>{STAGES[stageIndex].label}</strong>
          </div>
          <ol className="pd-step-list" aria-label="Round 0 stages">
            {STAGES.map((item, index) => (
              <li
                key={item.id}
                aria-current={item.id === stage ? 'step' : undefined}
                data-complete={index < stageIndex}
              >
                <span>{index < stageIndex ? <Check aria-hidden="true" /> : index + 1}</span>
                {item.label}
              </li>
            ))}
          </ol>
          <div className="pd-context-copy">
            <h3>What happens next</h3>
            <p>{STAGE_CONTEXT[stage]}</p>
          </div>
          <div className={`pd-save-state pd-save-state--${saveStatus}`} role="status">
            <Clock3 aria-hidden="true" />
            {saveStatus !== 'error' && (
              <span>
                {saveStatus === 'saving' && 'Saving…'}
                {saveStatus === 'saved' && formatSavedAt(lastSavedAt)}
              </span>
            )}
            {saveStatus === 'error' && (
              <button type="button" onClick={onRetrySave}>
                <RotateCcw aria-hidden="true" />
                Draft not saved — Retry
              </button>
            )}
          </div>
        </aside>
      </div>

      {showLockDialog && (
        <div className="pd-dialog-backdrop">
          <div
            className="pd-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="lock-dialog-title"
            aria-describedby="lock-dialog-description"
            ref={dialogRef}
            onKeyDown={handleDialogKeyDown}
          >
            <button
              className="pd-dialog-close"
              type="button"
              aria-label="Close"
              title="Close"
              onClick={closeLockDialog}
            >
              <X aria-hidden="true" />
            </button>
            <LockKeyhole className="pd-dialog-icon" aria-hidden="true" />
            <h2 id="lock-dialog-title">Lock the Board record?</h2>
            <p id="lock-dialog-description">
              This will preserve the Round 0 Board record as read-only and continue to
              the next round.
            </p>
            <div className="pd-dialog-actions">
              <button
                className="pd-button pd-button--quiet"
                type="button"
                data-lock-cancel="true"
                onClick={closeLockDialog}
              >
                Cancel
              </button>
              <button
                className="pd-button pd-button--primary"
                type="button"
                data-lock-primary="true"
                onClick={lockRound0}
              >
                <LockKeyhole aria-hidden="true" />
                Lock and continue
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReadinessItem({
  complete,
  children,
}: {
  complete: boolean;
  children: string;
}) {
  return (
    <li data-complete={complete}>
      {complete ? <CheckCircle2 aria-hidden="true" /> : <CircleHelp aria-hidden="true" />}
      {children}
    </li>
  );
}

function BoardRecord({
  value,
  compact = false,
}: {
  value: ReturnType<typeof buildBoardRecordPreview>;
  compact?: boolean;
}) {
  return (
    <section
      className="pd-board-record"
      data-compact={compact}
      aria-labelledby={compact ? 'record-preview-title' : 'official-record-title'}
    >
      <p>Round 0 Board Record</p>
      <h3 id={compact ? 'record-preview-title' : 'official-record-title'}>
        {compact ? 'Board record preview' : 'Board record'}
      </h3>
      <dl>
        <div>
          <dt>Board decision</dt>
          <dd>{value.disposition}</dd>
        </div>
        <div>
          <dt>Matters proceeding</dt>
          <dd><RecordValueList values={value.mattersProceeding} /></dd>
        </div>
        <div>
          <dt>Matters held</dt>
          <dd><RecordValueList values={value.mattersHeld} /></dd>
        </div>
        <div>
          <dt>Unresolved evidence</dt>
          <dd>
            {value.unresolvedEvidence.length ? (
              <ul className="pd-record-evidence-list">
                {value.unresolvedEvidence.map((issue) => (
                  <li key={issue.id}>
                    <strong>{issue.title}</strong>
                    <span>
                      Records: {issue.recordIds.join('; ')} · Packet cutoff:{' '}
                      {issue.sourceCutoff}
                    </span>
                    <span>
                      {issue.classification}. {issue.boardDecision}.
                    </span>
                    <span>
                      Affected matters:{' '}
                      {issue.affectedMatters.length
                        ? issue.affectedMatters.join('; ')
                        : 'None identified'}
                    </span>
                    <span>Board note: {issue.note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              'No unresolved evidence'
            )}
          </dd>
        </div>
        <div>
          <dt>Required follow-up</dt>
          <dd>{value.followUp ?? 'No follow-up required'}</dd>
        </div>
        <div>
          <dt>Board rationale</dt>
          <dd>{value.rationale || 'Not yet recorded'}</dd>
        </div>
      </dl>
    </section>
  );
}

function RecordValueList({ values }: { values: string[] }) {
  if (!values.length) return <>None identified</>;
  return (
    <ul className="pd-record-value-list">
      {values.map((value) => (
        <li key={value}>{value}</li>
      ))}
    </ul>
  );
}
