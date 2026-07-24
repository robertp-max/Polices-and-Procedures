import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Circle,
  CircleHelp,
  CircleX,
  ClipboardCheck,
  GitCompare,
  LockKeyhole,
  Save,
  X,
} from 'lucide-react';

import EvidenceInspector from './EvidenceInspector';
import './packetReadiness.css';
import type { Exhibit, Quarter } from './engine/caseTypes';
import {
  getPacketReadinessCompletion,
  type ConflictClassification,
  type PacketDisposition,
  type PacketReadinessState,
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

export interface PacketReadinessGateProps {
  checks: ReadinessCheck[];
  exhibits: Exhibit[];
  caseQuarter: Quarter;
  value: PacketReadinessValue;
  onChange: (next: PacketReadinessValue) => void;
  onSubmit: () => void;
  onSaveDraft: () => void;
  submitted?: boolean;
  onInspectEvidence?: (exhibitId: string) => void;
}

type MobilePanel = 'task' | 'evidence' | 'decision';

const PANEL_ORDER: MobilePanel[] = ['task', 'evidence', 'decision'];

const STATUS_ICON: Record<ReadinessStatus, typeof CheckCircle2> = {
  met: CheckCircle2,
  unmet: CircleX,
  unknown: CircleHelp,
};

const DISPOSITIONS: Array<{
  id: PacketDisposition;
  label: string;
  rule: string;
  consequence: string;
}> = [
  {
    id: 'full',
    label: 'Proceed - Full Reliance',
    rule: 'All material evidence needed for Board action is verified and reconciled.',
    consequence: 'The complete packet may support the matters before the Board.',
  },
  {
    id: 'partial',
    label: 'Proceed - Partial Reliance',
    rule: 'Some matters are supportable while affected matters remain limited or held.',
    consequence: 'Only clearly identified, unaffected matters may proceed.',
  },
  {
    id: 'hold',
    label: 'Hold - Do Not Convene on This Packet',
    rule: 'Unresolved defects broadly prevent responsible reliance.',
    consequence: 'The packet returns for validation before Board action.',
  },
];

const CLASSIFICATIONS: Array<{
  id: ConflictClassification;
  label: string;
}> = [
  { id: 'reconciled', label: 'Reconciled' },
  { id: 'limited_unresolved', label: 'Unresolved but limited to one matter' },
  { id: 'material_unresolved', label: 'Unresolved and material to the whole packet' },
  { id: 'context_only', label: 'Context only' },
];

function isRationaleStarted(value: PacketReadinessValue): boolean {
  return Object.values(value.rationale).some((field) => Boolean(field?.trim()));
}

function officialRationalePreview(value: PacketReadinessValue): string {
  const parts = [
    value.rationale.verifiedEvidence &&
      `Verified evidence: ${value.rationale.verifiedEvidence.trim()}`,
    value.rationale.unresolvedEvidence &&
      `Unresolved evidence: ${value.rationale.unresolvedEvidence.trim()}`,
    value.rationale.relianceScope &&
      `Reliance scope: ${value.rationale.relianceScope.trim()}`,
    value.rationale.followUpAction &&
      `Follow-up: ${value.rationale.followUpAction.trim()}`,
    value.rationale.owner && `Owner: ${value.rationale.owner.trim()}`,
    value.rationale.dueDate && `Due: ${value.rationale.dueDate}`,
  ].filter(Boolean);
  return parts.length ? `${parts.join('. ')}.` : 'Complete the rationale fields to preview the official record.';
}

export default function PacketReadinessGate({
  checks,
  exhibits,
  caseQuarter,
  value,
  onChange,
  onSubmit,
  onSaveDraft,
  submitted = false,
  onInspectEvidence,
}: PacketReadinessGateProps) {
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('task');
  const [activeConflictId, setActiveConflictId] = useState<string | null>(null);
  const [comparisonExhibitId, setComparisonExhibitId] = useState<string | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');
  const confirmationRef = useRef<HTMLElement>(null);

  const exhibitById = useMemo(
    () => new Map(exhibits.map((exhibit) => [exhibit.id, exhibit])),
    [exhibits],
  );
  const requiredConflictIds = useMemo(
    () => Array.from(new Set(checks.flatMap((check) => check.evidenceIds))),
    [checks],
  );
  const completion = useMemo(
    () => getPacketReadinessCompletion(value, { checks, requiredConflictIds }),
    [checks, requiredConflictIds, value],
  );
  const classifiedCount = requiredConflictIds.filter(
    (id) => value.conflictDeterminations[id]?.savedAt,
  ).length;
  const reviewedCriteriaCount = checks.filter((check) =>
    value.reviewedCriterionIds.includes(check.id),
  ).length;
  const activeConflict = activeConflictId ? exhibitById.get(activeConflictId) : undefined;
  const activeDetermination = activeConflictId
    ? value.conflictDeterminations[activeConflictId]
    : undefined;

  const stepStates = [
    completion.allCriteriaReviewed,
    completion.allMaterialConflictsClassified,
    completion.dispositionSelected,
    completion.rationaleComplete && completion.followUpCompleteWhenRequired,
  ];
  const currentStep = Math.max(
    0,
    stepStates.findIndex((complete) => !complete),
  );

  function setPanel(panel: MobilePanel): void {
    setMobilePanel(panel);
    window.requestAnimationFrame(() => {
      document.getElementById(`bs-readiness-panel-${panel}`)?.focus();
    });
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, panel: MobilePanel): void {
    const currentIndex = PANEL_ORDER.indexOf(panel);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % PANEL_ORDER.length;
    if (event.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + PANEL_ORDER.length) % PANEL_ORDER.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = PANEL_ORDER.length - 1;
    if (nextIndex === currentIndex) return;
    event.preventDefault();
    setPanel(PANEL_ORDER[nextIndex]);
    document.getElementById(`bs-readiness-tab-${PANEL_ORDER[nextIndex]}`)?.focus();
  }

  function handleRadioKeyDown(event: KeyboardEvent<HTMLButtonElement>): void {
    if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      return;
    }
    const radios = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [],
    ).filter((radio) => !radio.disabled);
    if (!radios.length) return;
    const currentIndex = radios.indexOf(event.currentTarget);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (currentIndex + 1) % radios.length;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (currentIndex - 1 + radios.length) % radios.length;
    }
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = radios.length - 1;
    event.preventDefault();
    radios[nextIndex].focus();
    radios[nextIndex].click();
  }

  function toggleCriterion(checkId: string): void {
    if (submitted) return;
    const reviewed = value.reviewedCriterionIds.includes(checkId);
    onChange({
      ...value,
      reviewedCriterionIds: reviewed
        ? value.reviewedCriterionIds.filter((id) => id !== checkId)
        : [...value.reviewedCriterionIds, checkId],
    });
  }

  function openConflict(exhibitId: string): void {
    setActiveConflictId(exhibitId);
    setComparisonExhibitId(null);
    onInspectEvidence?.(exhibitId);
    setPanel('evidence');
  }

  function updateDetermination(
    patch: Partial<NonNullable<typeof activeDetermination>>,
  ): void {
    if (!activeConflictId || submitted) return;
    const current = value.conflictDeterminations[activeConflictId] ?? {
      classification: null,
      reliedUponExhibitIds: [],
      note: '',
      savedAt: null,
    };
    onChange({
      ...value,
      conflictDeterminations: {
        ...value.conflictDeterminations,
        [activeConflictId]: {
          ...current,
          ...patch,
          savedAt: null,
        },
      },
    });
  }

  function saveDetermination(): void {
    if (
      !activeConflictId ||
      !activeDetermination?.classification ||
      !activeDetermination.note.trim() ||
      submitted
    ) {
      setStatusAnnouncement('Select a classification and enter a determination note before saving.');
      return;
    }
    onChange({
      ...value,
      conflictDeterminations: {
        ...value.conflictDeterminations,
        [activeConflictId]: {
          ...activeDetermination,
          savedAt: new Date().toISOString(),
        },
      },
    });
    setStatusAnnouncement(`Conflict determination saved for ${activeConflictId}.`);
  }

  function updateRationale(
    field: keyof PacketReadinessValue['rationale'],
    nextValue: string,
  ): void {
    if (submitted) return;
    onChange({
      ...value,
      rationale: {
        ...value.rationale,
        [field]: nextValue,
      },
    });
  }

  function requestLock(): void {
    if (!completion.canLock) {
      setStatusAnnouncement(`Cannot lock Round 0. ${completion.blockers.join(' ')}`);
      return;
    }
    setConfirmationOpen(true);
  }

  function confirmLock(): void {
    onChange({
      ...value,
      lockedAt: new Date().toISOString(),
    });
    setConfirmationOpen(false);
    onSubmit();
  }

  useEffect(() => {
    if (!confirmationOpen) return;
    const dialog = confirmationRef.current;
    if (!dialog) return;
    const activeDialog = dialog;
    const selector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    function handleDialogKeyDown(event: globalThis.KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        setConfirmationOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(activeDialog.querySelectorAll<HTMLElement>(selector));
      if (!focusable.length) return;
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

    document.addEventListener('keydown', handleDialogKeyDown);
    return () => document.removeEventListener('keydown', handleDialogKeyDown);
  }, [confirmationOpen]);

  return (
    <section className="bs-readiness" aria-labelledby="bs-readiness-title">
      <header className="bs-readiness-heading">
        <div>
          <p className="bs-kicker">Round 0 of 7 - Packet Readiness Gate</p>
          <h1 id="bs-readiness-title">Decide whether this packet is fit for Board reliance</h1>
        </div>
        <p>
          Review the criteria, compare and classify every conflict, choose the permitted reliance
          scope, record why, then lock the disposition and continue.
        </p>
      </header>

      <div className="bs-session-tabs" role="tablist" aria-label="Packet readiness workspace">
        {PANEL_ORDER.map((panel) => (
          <button
            key={panel}
            id={`bs-readiness-tab-${panel}`}
            type="button"
            role="tab"
            aria-selected={mobilePanel === panel}
            aria-controls={`bs-readiness-panel-${panel}`}
            tabIndex={mobilePanel === panel ? 0 : -1}
            onClick={() => setPanel(panel)}
            onKeyDown={(event) => handleTabKeyDown(event, panel)}
          >
            {panel === 'task' ? 'Task' : panel === 'evidence' ? 'Evidence' : 'Decision'}
          </button>
        ))}
      </div>

      <div className="bs-readiness-workspace">
        <aside
          id="bs-readiness-panel-task"
          className="bs-readiness-task"
          role="tabpanel"
          aria-labelledby="bs-readiness-tab-task"
          data-mobile-active={mobilePanel === 'task'}
          tabIndex={-1}
        >
          <div className="bs-panel-heading">
            <p className="bs-kicker">Your task</p>
            <h2>Complete the gate</h2>
          </div>
          <ol className="bs-readiness-steps">
            {[
              ['Review readiness', `${reviewedCriteriaCount} of ${checks.length} criteria`],
              ['Resolve conflicts', `${classifiedCount} of ${requiredConflictIds.length} classified`],
              ['Choose reliance', value.disposition ? 'Selected' : 'Not selected'],
              ['Record rationale', isRationaleStarted(value) ? 'In progress' : 'Not started'],
            ].map(([label, detail], index) => {
              const complete = stepStates[index];
              const current = !complete && index === currentStep;
              return (
                <li
                  key={label}
                  className={complete ? 'complete' : current ? 'current' : 'not-started'}
                  aria-current={current ? 'step' : undefined}
                >
                  <span className="bs-readiness-step-icon" aria-hidden="true">
                    {complete ? <Check size={14} /> : index + 1}
                  </span>
                  <span>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                </li>
              );
            })}
          </ol>
          <details className="bs-readiness-help">
            <summary>How this round works</summary>
            <p>
              First inspect the packet. Then resolve the conflicts. Decide how much the Board may
              rely on, record why, and continue to the legal-convening round.
            </p>
          </details>
        </aside>

        <main
          id="bs-readiness-panel-evidence"
          className="bs-readiness-review"
          role="tabpanel"
          aria-labelledby="bs-readiness-tab-evidence"
          data-mobile-active={mobilePanel === 'evidence'}
          tabIndex={-1}
        >
          <div className="bs-panel-heading">
            <p className="bs-kicker">Packet readiness review</p>
            <h2>Review criteria and resolve conflicts</h2>
          </div>

          <section className="bs-readiness-section" aria-labelledby="bs-criteria-title">
            <header>
              <div>
                <h3 id="bs-criteria-title">Readiness criteria</h3>
                <p>Acknowledge each criterion after reviewing its status and supporting evidence.</p>
              </div>
              <strong>{reviewedCriteriaCount}/{checks.length}</strong>
            </header>
            <div className="bs-readiness-criteria">
              {checks.map((check) => {
                const Icon = STATUS_ICON[check.status];
                const reviewed = value.reviewedCriterionIds.includes(check.id);
                return (
                  <article key={check.id} className={`bs-readiness-criterion is-${check.status}`}>
                    <header>
                      <Icon size={18} aria-hidden="true" />
                      <div>
                        <h4>{check.label}</h4>
                        <p>{check.detail}</p>
                      </div>
                    </header>
                    {check.evidenceIds.length > 0 && (
                      <div className="bs-readiness-evidence-links">
                        {check.evidenceIds.map((id) => {
                          const exhibit = exhibitById.get(id);
                          return (
                            <button key={id} type="button" onClick={() => openConflict(id)}>
                              <GitCompare size={14} aria-hidden="true" />
                              <span>
                                <b>{id}</b>
                                {exhibit?.title ?? 'Evidence record'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                    <label className="bs-readiness-acknowledge">
                      <input
                        type="checkbox"
                        checked={reviewed}
                        onChange={() => toggleCriterion(check.id)}
                        disabled={submitted}
                      />
                      <span>I reviewed this criterion and its evidence.</span>
                    </label>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="bs-readiness-section" aria-labelledby="bs-conflicts-title">
            <header>
              <div>
                <h3 id="bs-conflicts-title">Conflict determinations</h3>
                <p>Compare the records and save one classification for every listed conflict.</p>
              </div>
              <strong>{classifiedCount}/{requiredConflictIds.length}</strong>
            </header>

            {requiredConflictIds.length === 0 ? (
              <p className="bs-readiness-empty">No packet conflicts require classification.</p>
            ) : (
              <div className="bs-conflict-list">
                {requiredConflictIds.map((id, index) => {
                  const exhibit = exhibitById.get(id);
                  const determination = value.conflictDeterminations[id];
                  return (
                    <article key={id} className={determination?.savedAt ? 'is-complete' : ''}>
                      <div>
                        <p className="bs-kicker">
                          Conflict {index + 1} of {requiredConflictIds.length}
                        </p>
                        <h4>{exhibit?.title ?? 'Evidence conflict'}</h4>
                        <dl>
                          <div>
                            <dt>Exhibit</dt>
                            <dd>{id}</dd>
                          </div>
                          <div>
                            <dt>As of</dt>
                            <dd>{exhibit?.asOfDate ?? 'Not recovered'}</dd>
                          </div>
                          <div>
                            <dt>Source posture</dt>
                            <dd>{exhibit?.posture.replace('_', ' ') ?? 'Unavailable'}</dd>
                          </div>
                          <div>
                            <dt>Validation</dt>
                            <dd>{exhibit?.validationState ?? 'Unavailable'}</dd>
                          </div>
                        </dl>
                        <p>{exhibit?.summary ?? 'The source record is unavailable.'}</p>
                      </div>
                      <button type="button" className="bs-compare-action" onClick={() => openConflict(id)}>
                        <GitCompare size={15} aria-hidden="true" />
                        Compare evidence
                      </button>
                    </article>
                  );
                })}
              </div>
            )}

            {activeConflict && activeDetermination && (
              <div className="bs-conflict-comparator">
                <header>
                  <div>
                    <p className="bs-kicker">Evidence comparator</p>
                    <h3>{activeConflict.id} - {activeConflict.title}</h3>
                  </div>
                  <button
                    type="button"
                    className="bs-icon-button"
                    aria-label="Close evidence comparator"
                    title="Close evidence comparator"
                    onClick={() => setActiveConflictId(null)}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                </header>
                <EvidenceInspector
                  exhibits={exhibits}
                  caseQuarter={caseQuarter}
                  selectedExhibitId={activeConflict.id}
                  comparisonExhibitId={comparisonExhibitId}
                  onSetComparisonExhibitId={setComparisonExhibitId}
                />
                <fieldset className="bs-conflict-classification">
                  <legend>Classify this conflict</legend>
                  <div role="radiogroup" aria-label={`Classification for ${activeConflict.id}`}>
                    {CLASSIFICATIONS.map((classification) => (
                      <button
                        key={classification.id}
                        type="button"
                        role="radio"
                        aria-checked={activeDetermination.classification === classification.id}
                        className={
                          activeDetermination.classification === classification.id ? 'is-selected' : ''
                        }
                        onKeyDown={handleRadioKeyDown}
                        onClick={() =>
                          updateDetermination({ classification: classification.id })
                        }
                        disabled={submitted}
                      >
                        <span aria-hidden="true">
                          {activeDetermination.classification === classification.id
                            ? <CheckCircle2 size={16} />
                            : <Circle size={16} />}
                        </span>
                        {classification.label}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="bs-motion-field">
                  <label htmlFor={`bs-conflict-note-${activeConflict.id}`}>Determination note</label>
                  <textarea
                    id={`bs-conflict-note-${activeConflict.id}`}
                    value={activeDetermination.note}
                    onChange={(event) => updateDetermination({ note: event.target.value })}
                    placeholder="State what the comparison establishes and how this conflict affects reliance."
                    disabled={submitted}
                  />
                </div>
                <button
                  type="button"
                  className="bs-rail-action"
                  onClick={saveDetermination}
                  disabled={
                    submitted ||
                    !activeDetermination.classification ||
                    !activeDetermination.note.trim()
                  }
                >
                  <Save size={15} aria-hidden="true" />
                  Save conflict determination
                </button>
              </div>
            )}
          </section>
        </main>

        <aside
          id="bs-readiness-panel-decision"
          className="bs-readiness-decision"
          role="tabpanel"
          aria-labelledby="bs-readiness-tab-decision"
          data-mobile-active={mobilePanel === 'decision'}
          tabIndex={-1}
        >
          <div className="bs-panel-heading">
            <p className="bs-kicker">Decision &amp; record</p>
            <h2>Choose reliance and document why</h2>
          </div>

          <fieldset className="bs-disposition-cards">
            <legend>Board disposition</legend>
            <div role="radiogroup" aria-label="Packet disposition">
              {DISPOSITIONS.map((disposition) => {
                const selected = value.disposition === disposition.id;
                return (
                  <button
                    key={disposition.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    className={selected ? 'is-selected' : ''}
                    onKeyDown={handleRadioKeyDown}
                    onClick={() => !submitted && onChange({ ...value, disposition: disposition.id })}
                    disabled={submitted}
                  >
                    <span aria-hidden="true">
                      {selected ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </span>
                    <span>
                      <strong>{disposition.label}</strong>
                      <small>{disposition.rule}</small>
                      <em>{disposition.consequence}</em>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <section className="bs-rationale-fields" aria-labelledby="bs-rationale-title">
            <h3 id="bs-rationale-title">Structured rationale</h3>
            <div className="bs-motion-field">
              <label htmlFor="bs-verified-evidence">What evidence was verified?</label>
              <textarea
                id="bs-verified-evidence"
                value={value.rationale.verifiedEvidence}
                onChange={(event) => updateRationale('verifiedEvidence', event.target.value)}
                disabled={submitted}
              />
            </div>
            <div className="bs-motion-field">
              <label htmlFor="bs-unresolved-evidence">What remains unresolved?</label>
              <textarea
                id="bs-unresolved-evidence"
                value={value.rationale.unresolvedEvidence}
                onChange={(event) => updateRationale('unresolvedEvidence', event.target.value)}
                placeholder='Enter "None" when appropriate.'
                disabled={submitted}
              />
            </div>
            <div className="bs-motion-field">
              <label htmlFor="bs-reliance-scope">Which matters may or may not be relied upon?</label>
              <textarea
                id="bs-reliance-scope"
                value={value.rationale.relianceScope}
                onChange={(event) => updateRationale('relianceScope', event.target.value)}
                disabled={submitted}
              />
            </div>
            <div className="bs-motion-field">
              <label htmlFor="bs-follow-up-action">Required validation action</label>
              <textarea
                id="bs-follow-up-action"
                value={value.rationale.followUpAction}
                onChange={(event) => updateRationale('followUpAction', event.target.value)}
                disabled={submitted}
              />
            </div>
            <div className="bs-rationale-follow-up">
              <div className="bs-motion-field">
                <label htmlFor="bs-follow-up-owner">Owner</label>
                <input
                  id="bs-follow-up-owner"
                  value={value.rationale.owner}
                  onChange={(event) => updateRationale('owner', event.target.value)}
                  disabled={submitted}
                />
              </div>
              <div className="bs-motion-field">
                <label htmlFor="bs-follow-up-due">Due date</label>
                <input
                  id="bs-follow-up-due"
                  type="date"
                  value={value.rationale.dueDate ?? ''}
                  onChange={(event) => updateRationale('dueDate', event.target.value)}
                  disabled={submitted}
                />
              </div>
            </div>
          </section>

          <section className="bs-rationale-preview" aria-labelledby="bs-preview-title">
            <h3 id="bs-preview-title">Official rationale preview</h3>
            <p>{officialRationalePreview(value)}</p>
          </section>

          <section className="bs-completion-checklist" aria-labelledby="bs-blockers-title">
            <h3 id="bs-blockers-title">Before you can continue</h3>
            <ul>
              {[
                [completion.allCriteriaReviewed, 'Readiness criteria reviewed'],
                [completion.allMaterialConflictsClassified, 'Material conflicts classified'],
                [completion.dispositionSelected, 'Board disposition selected'],
                [
                  completion.rationaleComplete && completion.followUpCompleteWhenRequired,
                  'Rationale and required follow-up completed',
                ],
              ].map(([complete, label]) => (
                <li key={String(label)} className={complete ? 'is-complete' : ''}>
                  {complete
                    ? <CheckCircle2 size={16} aria-hidden="true" />
                    : <AlertCircle size={16} aria-hidden="true" />}
                  {label}
                </li>
              ))}
            </ul>
            {completion.blockers.length > 0 && (
              <ul id="bs-readiness-blockers" className="bs-blocker-list">
                {completion.blockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>

      <footer className="bs-readiness-actions">
        <button type="button" className="bs-rail-action secondary" onClick={onSaveDraft}>
          <Save size={15} aria-hidden="true" />
          Save draft
        </button>
        <div>
          <p>This decision becomes read-only after the round is locked.</p>
          <button
            type="button"
            className="bs-rail-action"
            aria-disabled={!completion.canLock || submitted}
            aria-describedby={
              !completion.canLock && completion.blockers.length ? 'bs-readiness-blockers' : undefined
            }
            onClick={requestLock}
          >
            <LockKeyhole size={15} aria-hidden="true" />
            {submitted ? 'Disposition locked' : 'Lock disposition & continue to Round 1'}
          </button>
        </div>
      </footer>

      <p className="bs-visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {statusAnnouncement}
      </p>

      {confirmationOpen && (
        <div className="bs-confirmation-backdrop">
          <section
            ref={confirmationRef}
            className="bs-confirmation-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="bs-confirmation-title"
            aria-describedby="bs-confirmation-description"
          >
            <ClipboardCheck size={24} aria-hidden="true" />
            <h2 id="bs-confirmation-title">Lock the Round 0 disposition?</h2>
            <p id="bs-confirmation-description">
              This records the Packet Readiness decision. You may review it later, but you cannot
              edit it after the round is locked.
            </p>
            <div>
              <button
                type="button"
                className="bs-rail-action secondary"
                onClick={() => setConfirmationOpen(false)}
                autoFocus
              >
                Continue reviewing
              </button>
              <button type="button" className="bs-rail-action" onClick={confirmLock}>
                <LockKeyhole size={15} aria-hidden="true" />
                Lock and continue
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
