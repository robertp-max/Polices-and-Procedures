// Guided True/False remediation player (§6).
//
// LOW-friction remediation, not an adversarial capstone: one plain-language
// item per screen, immediate explanation after every answer, a link straight
// back to the controlling policy section, and the chance to correct any
// missed item in the same session. Completion requires 100% corrected
// understanding across the assigned set PLUS one final changed-facts transfer
// item. Contrast with assessments/TrueFalseForensicPlayer.tsx, which is the
// adversarial forensic path with locked answers and no in-attempt correction.

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, ExternalLink, FileWarning, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { commitEvidence } from '../compliance/complianceStore';
import { useLearnerId } from '../compliance/complianceIdentity';
import { getComplianceEvidenceService } from '../compliance/complianceEvidenceAdapter';
import { integrityHash } from '../assessments/assessmentUtils';
import { buildTargetedRemediation } from './buildTargetedRemediation';
import type { GuidedTrueFalseItem, TransferPrompt } from './guidedRemediationBank';
import type { RemediationResult } from './remediationRouting';
import './remediation.css';

export interface GuidedTrueFalsePlayerProps {
  assignmentId: string;
  sourceId: string;
  missedConceptIds: string[];
  onExit: () => void;
  /** Optional context the host screen may already have; all default sensibly. */
  learnerId?: string;
  attemptNumber?: number;
  sourceType?: 'module' | 'policy' | 'course_quiz' | 'tabletop';
  /** Score (0–100) on the primary attempt that triggered this remediation. */
  primaryAttemptScore?: number;
}

interface ItemAnswerState {
  selected: boolean | null;
  checked: boolean;
  correctNow: boolean;
  missedFirstTry: boolean;
}

type Stage = 'reviewing' | 'transfer' | 'complete';

function useActiveTime(): () => number {
  const seconds = useRef(0);
  useEffect(() => {
    let visible = typeof document === 'undefined' ? true : document.visibilityState === 'visible';
    const onVis = () => { visible = document.visibilityState === 'visible'; };
    const id = window.setInterval(() => { if (visible) seconds.current += 1; }, 1000);
    document.addEventListener('visibilitychange', onVis);
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, []);
  return () => seconds.current;
}

function sourceHref(ref: string): string | null {
  return /^[A-Z]{2}-[A-Z]{2,3}-\d{3}$/.test(ref) ? `/library/${ref}` : null;
}

function ControllingSourceLink({ sourceRef }: { sourceRef: string }) {
  const href = sourceHref(sourceRef);
  if (!href) return <span className="remediation-source-ref">{sourceRef}</span>;
  return (
    <a className="remediation-source-link" href={href} target="_blank" rel="noreferrer">
      {sourceRef} <ExternalLink size={13} />
    </a>
  );
}

export default function GuidedTrueFalsePlayer({
  assignmentId,
  sourceId,
  missedConceptIds,
  onExit,
  learnerId: learnerIdProp,
  attemptNumber = 1,
  sourceType = 'module',
  primaryAttemptScore = 0,
}: GuidedTrueFalsePlayerProps) {
  // Default identity is the authenticated user; an explicit prop (e.g. from a
  // facilitated session) may override it.
  const authLearnerId = useLearnerId();
  const learnerId = learnerIdProp ?? authLearnerId;
  const getActive = useActiveTime();

  const { items, transferPrompt }: { items: GuidedTrueFalseItem[]; transferPrompt: TransferPrompt } = useMemo(
    () => buildTargetedRemediation(missedConceptIds, `${learnerId}:${assignmentId}:${attemptNumber}`),
    [missedConceptIds, learnerId, assignmentId, attemptNumber],
  );

  const [answers, setAnswers] = useState<Record<string, ItemAnswerState>>(() =>
    Object.fromEntries(items.map((item) => [item.id, { selected: null, checked: false, correctNow: false, missedFirstTry: false }])),
  );
  const [queue, setQueue] = useState<string[]>(items.map((item) => item.id));
  const [posInQueue, setPosInQueue] = useState(0);
  const [round, setRound] = useState<'primary' | 'correcting'>('primary');
  const [stage, setStage] = useState<Stage>('reviewing');

  const [transferSelected, setTransferSelected] = useState<boolean | null>(null);
  const [transferChecked, setTransferChecked] = useState(false);
  const [transferCorrect, setTransferCorrect] = useState(false);
  const [attested, setAttested] = useState(false);

  const [result, setResult] = useState<{ recorded: boolean; notice: string } | null>(null);

  if (!items.length) {
    return (
      <div className="assessment-shell">
        <RemediationBar onExit={onExit} label="Guided remediation" />
        <div className="assessment-canvas">
          <div className="assessment-pending" role="status">
            <FileWarning size={28} />
            <h2>Guided remediation bank pending</h2>
            <p>No guided items are published for this concept set yet.</p>
            <button className="assessment-primary" onClick={onExit}>Return</button>
          </div>
        </div>
      </div>
    );
  }

  const currentId = queue[posInQueue];
  const currentItem: GuidedTrueFalseItem | undefined = items.find((i) => i.id === currentId);
  const currentAnswer = currentId ? answers[currentId] : undefined;

  const totalAssigned = items.length;
  const correctedCount = Object.values(answers).filter((a) => a.correctNow).length;

  function checkCurrent(choice: boolean) {
    if (!currentId) return;
    setAnswers((prev) => {
      const prior = prev[currentId];
      const correctNow = choice === currentItem?.answer;
      return {
        ...prev,
        [currentId]: {
          selected: choice,
          checked: true,
          correctNow,
          missedFirstTry: prior.missedFirstTry || (round === 'primary' && !correctNow),
        },
      };
    });
  }

  // Every item in a pass gets exactly one attempt with immediate feedback; a
  // missed item is not corrected in place, it comes back in the next pass —
  // this keeps "one item, one clean judgment" true on every screen.
  function advance() {
    if (posInQueue < queue.length - 1) {
      setPosInQueue((p) => p + 1);
      return;
    }
    // End of this pass — anything still wrong comes back for another pass,
    // repeating until every assigned item is confirmed correct.
    const stillMissed = queue.filter((id) => !answers[id]?.correctNow);
    if (stillMissed.length > 0) {
      setQueue(stillMissed);
      setPosInQueue(0);
      setRound('correcting');
    } else {
      setStage('transfer');
    }
  }

  async function finishTransfer() {
    if (!attested) return;
    const passed = transferSelected === transferPrompt.answer;
    setTransferCorrect(passed);
    setTransferChecked(true);
    if (!passed) return; // stay on screen; learner may retry via retryTransfer()

    const remediationRecord: RemediationResult = {
      remediationPath: 'guided_true_false',
      primaryAttemptScore,
      remediationItemsAssigned: items.map((item) => item.id),
      remediationItemsCorrected: items.filter((item) => answers[item.id]?.missedFirstTry).map((item) => item.id),
      transferPassed: true,
    };

    const nowIso = new Date().toISOString();
    const payload = {
      assignmentId,
      learnerId,
      role: 'GB' as const,
      sourceId,
      sourceType,
      sourceVersion: 'controlled-v6.0',
      effectiveDate: null,
      readCompletedAt: nowIso,
      attestedAt: nowIso,
      answersSnapshot: {
        itemsAssigned: remediationRecord.remediationItemsAssigned,
        itemsCorrected: remediationRecord.remediationItemsCorrected,
        transferPromptId: transferPrompt.id,
        transferPassed: true,
      },
      score: 100,
      // The guided path commits only after every remediation item is corrected
      // and the transfer prompt passes — the outcome is therefore 'passed'.
      outcome: 'passed' as const,
      criticalErrors: [] as string[],
      attemptNumber,
      remediationPath: 'guided_true_false' as const,
      activeTimeSeconds: getActive(),
      completedAt: nowIso,
    };

    let recorded = false;
    let notice = getComplianceEvidenceService().disconnectedNotice;
    const saved = await commitEvidence(assignmentId, { ...payload, integrityHash: integrityHash(payload) } as never);
    recorded = saved.ok;
    if (!saved.ok) notice = saved.message;

    setResult({ recorded, notice });
    setStage('complete');
  }

  function retryTransfer() {
    setTransferSelected(null);
    setTransferChecked(false);
  }

  return (
    <div className="assessment-shell">
      <RemediationBar onExit={onExit} label={`Guided remediation · ${sourceId}`} />
      <div className="assessment-canvas remediation-canvas">
        {stage === 'reviewing' && currentItem && (
          <>
            <header className="assessment-head">
              <span className="assessment-kicker"><ShieldCheck size={15} /> GUIDED TRUE / FALSE REVIEW</span>
              <h1>{round === 'primary' ? 'Let’s review what you missed' : 'Revisit what’s still off'}</h1>
              <ul className="assessment-standard">
                <li><strong>What this is:</strong> a short, plain-language review — not a re-test. Every answer gets an explanation right away.</li>
                <li><strong>What counts as complete:</strong> get all {totalAssigned} items right (correcting any you miss is expected), plus one final check that uses changed facts.</li>
                <li><strong>Progress:</strong> {correctedCount} of {totalAssigned} confirmed correct so far.</li>
              </ul>
            </header>

            <div className="remediation-progress" role="status">
              Item {posInQueue + 1} of {queue.length} in this {round === 'primary' ? 'pass' : 'correction round'}
            </div>

            <fieldset className="assessment-question remediation-item">
              <legend>{currentItem.statement}</legend>

              {!currentAnswer?.checked && (
                <div className="remediation-binary">
                  {[true, false].map((val) => (
                    <label key={String(val)} className="assessment-option">
                      <input
                        type="radio"
                        name={`${currentItem.id}-tf`}
                        checked={currentAnswer?.selected === val}
                        onChange={() => setAnswers((prev) => ({ ...prev, [currentItem.id]: { ...prev[currentItem.id], selected: val } }))}
                      />
                      <span>{val ? 'True' : 'False'}</span>
                    </label>
                  ))}
                </div>
              )}

              {!currentAnswer?.checked && (
                <div className="assessment-actions">
                  <button
                    type="button"
                    className="assessment-primary"
                    disabled={currentAnswer?.selected === null || currentAnswer?.selected === undefined}
                    onClick={() => currentAnswer?.selected !== null && currentAnswer?.selected !== undefined && checkCurrent(currentAnswer.selected)}
                  >
                    Check my answer
                  </button>
                </div>
              )}

              {currentAnswer?.checked && (
                <div className={`remediation-feedback ${currentAnswer.correctNow ? 'correct' : 'incorrect'}`}>
                  <div className="remediation-feedback-head">
                    {currentAnswer.correctNow ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <strong>{currentAnswer.correctNow ? 'Correct' : 'Not quite'}</strong>
                  </div>
                  <p>{currentItem.plainExplanation}</p>
                  <p className="remediation-source-line">
                    Controlling section: <ControllingSourceLink sourceRef={currentItem.controllingSourceRef} />
                  </p>
                  {!currentAnswer.correctNow && (
                    <p className="remediation-recheck-note">
                      <RotateCcw size={13} /> This one will come back around for you to confirm once you’ve seen the others.
                    </p>
                  )}
                  <div className="assessment-actions">
                    <button type="button" className="assessment-primary" onClick={advance}>
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </fieldset>
          </>
        )}

        {stage === 'transfer' && (
          <>
            <header className="assessment-head">
              <span className="assessment-kicker"><ShieldCheck size={15} /> FINAL CHECK</span>
              <h1>One last check — with the facts changed</h1>
              <ul className="assessment-standard">
                <li><strong>Why:</strong> confirming the idea transfers, not just the original wording.</li>
                <li><strong>What counts as complete:</strong> answer correctly, then attest and finish.</li>
              </ul>
            </header>

            <fieldset className="assessment-question remediation-item">
              <legend>{transferPrompt.statement}</legend>

              {!transferChecked && (
                <div className="remediation-binary">
                  {[true, false].map((val) => (
                    <label key={String(val)} className="assessment-option">
                      <input
                        type="radio"
                        name="transfer-tf"
                        checked={transferSelected === val}
                        onChange={() => setTransferSelected(val)}
                      />
                      <span>{val ? 'True' : 'False'}</span>
                    </label>
                  ))}
                </div>
              )}

              {!transferChecked && (
                <div className="assessment-attest">
                  <label>
                    <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
                    <span>I completed this review myself. Completion records my identity, assignment, controlled source version, the guided remediation path, and completion time.</span>
                  </label>
                </div>
              )}

              {!transferChecked && (
                <div className="assessment-actions">
                  <button
                    type="button"
                    className="assessment-primary"
                    disabled={transferSelected === null || !attested}
                    onClick={() => void finishTransfer()}
                  >
                    Submit final check
                  </button>
                </div>
              )}

              {transferChecked && (
                <div className={`remediation-feedback ${transferCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="remediation-feedback-head">
                    {transferCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    <strong>{transferCorrect ? 'Correct — that’s the transfer' : 'Not quite — let’s look again'}</strong>
                  </div>
                  <p>{transferPrompt.plainExplanation}</p>
                  <p className="remediation-source-line">
                    Controlling section: <ControllingSourceLink sourceRef={transferPrompt.controllingSourceRef} />
                  </p>
                  {!transferCorrect && (
                    <div className="assessment-actions">
                      <button type="button" className="remediation-choice-secondary remediation-retry-button" onClick={retryTransfer}>
                        <RotateCcw size={14} /> Try the final check again
                      </button>
                    </div>
                  )}
                </div>
              )}
            </fieldset>
          </>
        )}

        {stage === 'complete' && result && (
          <div className="assessment-result pass">
            <div className="assessment-result-head">
              <CheckCircle2 size={30} />
              <div>
                <strong>Guided remediation complete</strong>
                <span>Every item confirmed correct, including the final transfer check.</span>
              </div>
            </div>
            {!result.recorded && (
              <p className="assessment-preview-note">
                <FileWarning size={15} /> {result.notice} This session is <strong>not</strong> recorded as official completion.
              </p>
            )}
            <button className="assessment-primary" onClick={onExit}>Return to My Compliance</button>
          </div>
        )}
      </div>
    </div>
  );
}

function RemediationBar({ label, onExit }: { label: string; onExit: () => void }) {
  return (
    <header className="assessment-bar">
      <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance">
        <ArrowLeft size={17} /> Save &amp; exit
      </button>
      <div className="assessment-bar-title">
        <span>GOVERNING BODY · {label.toUpperCase()}</span>
        <strong>Concept-targeted review</strong>
      </div>
    </header>
  );
}
