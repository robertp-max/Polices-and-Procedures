// DEPRECATED LEGACY PLAYER — superseded by tabletop2026/ (the only tabletop
// wired into V3). This player scores in PERCENT, while the registered 2026
// tabletop assignments use the 1000-point engine standard (950/970). Do NOT
// re-wire it against the 2026 assignment ids without normalizing the scale.
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSearch, FileWarning, Lock, ShieldAlert } from 'lucide-react';
import { commitEvidence } from '../compliance/complianceStore';
import { TABLETOP_ASSIGNMENT_ID } from '../compliance/complianceCatalog';
import { useLearnerId } from '../compliance/complianceIdentity';
import { getComplianceEvidenceService } from '../compliance/complianceEvidenceAdapter';
import { integrityHash } from '../assessments/assessmentUtils';
import { FINAL_TABLETOP } from './tabletopCase';
import { scoreTabletop, type TabletopScore, type TabletopSelections } from './tabletopScoring';

type Step = 'brief' | 'r1' | 'r2' | 'r3' | 'review' | 'scored';
const STEP_ORDER: Step[] = ['brief', 'r1', 'r2', 'r3', 'review'];

export default function TabletopPlayer({ onExit, onForensicCapstone }: { onExit: () => void; onForensicCapstone?: () => void }) {
  const c = FINAL_TABLETOP;
  const learnerId = useLearnerId();
  const [step, setStep] = useState<Step>('brief');
  const [inspected, setInspected] = useState<string[]>([]);
  const [decisions, setDecisions] = useState<Record<string, string>>({});
  const [surveyor, setSurveyor] = useState<Record<string, string>>({});
  const [transferOptionId, setTransfer] = useState<string | null>(null);
  const [attested, setAttested] = useState(false);
  const [result, setResult] = useState<{ score: TabletopScore; recorded: boolean; notice: string } | null>(null);

  const inspect = (id: string) => setInspected((prev) => (prev.includes(id) ? prev : [...prev, id]));
  const roundDecisions = (r: 1 | 2 | 3) => c.decisions.filter((d) => d.round === r);
  const criticalExhibits = c.exhibits.filter((e) => e.critical);
  const allCriticalOpen = criticalExhibits.every((e) => inspected.includes(e.id));

  const selections: TabletopSelections = useMemo(
    () => ({ decisions, surveyor, transferOptionId, inspectedExhibitIds: inspected, attested }),
    [decisions, surveyor, transferOptionId, inspected, attested],
  );

  const allAnswered =
    c.decisions.every((d) => decisions[d.id]) && c.surveyor.every((q) => surveyor[q.id]) && Boolean(transferOptionId);

  const submit = async () => {
    const score = scoreTabletop(selections, c);
    const payload = {
      assignmentId: TABLETOP_ASSIGNMENT_ID,
      learnerId,
      role: 'GB' as const,
      sourceId: c.id,
      sourceType: 'tabletop' as const,
      sourceVersion: 'controlled-v6.0',
      effectiveDate: null,
      readCompletedAt: new Date().toISOString(),
      attestedAt: attested ? new Date().toISOString() : null,
      answersSnapshot: selections,
      score: score.scorePercent,
      outcome: score.passed ? ('passed' as const) : ('failed' as const),
      criticalErrors: score.criticalReasons,
      attemptNumber: 1,
      remediationPath: 'none' as const,
      activeTimeSeconds: 0,
      completedAt: score.passed ? new Date().toISOString() : null,
    };
    let recorded = false;
    let notice = getComplianceEvidenceService().disconnectedNotice;
    if (score.passed) {
      const saved = await commitEvidence(TABLETOP_ASSIGNMENT_ID, { ...payload, integrityHash: integrityHash(payload) } as never);
      recorded = saved.ok;
      if (!saved.ok) notice = saved.message;
    }
    setResult({ score, recorded, notice });
    setStep('scored');
  };

  const goNext = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i < STEP_ORDER.length - 1) setStep(STEP_ORDER[i + 1]);
  };
  const goBack = () => {
    const i = STEP_ORDER.indexOf(step);
    if (i > 0) setStep(STEP_ORDER[i - 1]);
  };

  return (
    <div className="tabletop-shell">
      <header className="assessment-bar">
        <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance"><ArrowLeft size={17} /> Save &amp; exit</button>
        <div className="assessment-bar-title"><span>FINAL GOVERNING BODY TABLETOP · {c.minutes} MIN</span><strong>{c.title}</strong></div>
      </header>

      <div className="tabletop-layout">
        <aside className="tabletop-exhibits" aria-label="Case exhibits">
          <h2><FileSearch size={16} /> Exhibits</h2>
          <p className="tabletop-exhibit-note">Open every critical exhibit. Some exhibits are relevant-looking decoys — do not treat them as decisive.</p>
          <ul>
            {c.exhibits.map((e) => (
              <li key={e.id}>
                <button className={inspected.includes(e.id) ? 'opened' : ''} onClick={() => inspect(e.id)}>
                  <span className="tabletop-exhibit-code">{e.code}{e.critical && <em title="Critical exhibit"> ●</em>}</span>
                  <strong>{e.title}</strong>
                  {inspected.includes(e.id) && <small>{e.summary}</small>}
                </button>
              </li>
            ))}
          </ul>
          <div className="tabletop-exhibit-progress">{inspected.filter((id) => criticalExhibits.some((e) => e.id === id)).length}/{criticalExhibits.length} critical exhibits opened</div>
        </aside>

        <main className="tabletop-canvas">
          {step === 'brief' && (
            <section className="tabletop-brief">
              <span className="assessment-kicker"><ShieldAlert size={15} /> ASSESSMENT — NO ANSWERS ARE REVEALED UNTIL SCORING</span>
              <h1>{c.title}</h1>
              <p>{c.context}</p>
              <div className="tabletop-standard">
                <h3>What counts as complete</h3>
                <ul>
                  <li>Total score ≥ {c.passScore}% AND zero critical errors (the critical-error gate overrides the score).</li>
                  <li>All critical exhibits inspected and all required decisions made.</li>
                  <li>Changed-facts transfer passed, attestation completed, and an official evidence save.</li>
                </ul>
                <h3>Automatic critical failures</h3>
                <ul className="tabletop-critical-list">{c.automaticCriticalFailures.map((f) => <li key={f}>{f}</li>)}</ul>
              </div>
              <button className="assessment-primary" onClick={goNext}>Begin Round 1 <ArrowRight size={15} /></button>
            </section>
          )}

          {(step === 'r1' || step === 'r2' || step === 'r3') && (
            <section className="tabletop-round">
              <RoundHeader step={step} />
              {(step === 'r1' ? roundDecisions(1) : step === 'r2' ? roundDecisions(2) : roundDecisions(3)).map((dec) => (
                <fieldset key={dec.id} className="assessment-question">
                  <legend>{dec.prompt}</legend>
                  {dec.options.map((o) => (
                    <label key={o.id} className="assessment-option">
                      <input type="radio" name={dec.id} checked={decisions[dec.id] === o.id} onChange={() => setDecisions((p) => ({ ...p, [dec.id]: o.id }))} />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </fieldset>
              ))}

              {step === 'r3' && <>
                <h3 className="tabletop-subhead">Surveyor defense</h3>
                {c.surveyor.map((q) => (
                  <fieldset key={q.id} className="assessment-question">
                    <legend>{q.prompt}</legend>
                    {q.options.map((o) => (
                      <label key={o.id} className="assessment-option">
                        <input type="radio" name={q.id} checked={surveyor[q.id] === o.id} onChange={() => setSurveyor((p) => ({ ...p, [q.id]: o.id }))} />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
                <h3 className="tabletop-subhead">Changed-facts transfer</h3>
                <p className="tabletop-transfer-facts">{c.transfer.changedFacts}</p>
                <fieldset className="assessment-question">
                  <legend>{c.transfer.prompt}</legend>
                  {c.transfer.options.map((o) => (
                    <label key={o.id} className="assessment-option">
                      <input type="radio" name="transfer" checked={transferOptionId === o.id} onChange={() => setTransfer(o.id)} />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </fieldset>
              </>}

              <div className="tabletop-nav">
                <button className="assessment-secondary" onClick={goBack}>Back</button>
                <button className="assessment-primary" onClick={goNext}>Continue <ArrowRight size={15} /></button>
              </div>
            </section>
          )}

          {step === 'review' && (
            <section className="tabletop-review">
              <h2>Review &amp; lock</h2>
              {!allCriticalOpen && <p className="assessment-critical-note">You must open all critical exhibits before locking the attempt.</p>}
              {!allAnswered && <p className="assessment-critical-note">Every decision, surveyor question, and the transfer must be answered.</p>}
              <div className="assessment-attest">
                <label>
                  <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
                  <span>I attest that these are my own governance decisions on this case. Completion records my identity, assignment, controlled source version, score, attempt, attestation, and completion time.</span>
                </label>
              </div>
              <p className="assessment-lock-note"><Lock size={13} /> Locking submits the attempt. Answers cannot be changed and no rationale is shown until scoring completes.</p>
              <div className="tabletop-nav">
                <button className="assessment-secondary" onClick={goBack}>Back</button>
                <button className="assessment-primary" disabled={!allCriticalOpen || !allAnswered || !attested} onClick={() => void submit()}>Lock &amp; submit</button>
              </div>
            </section>
          )}

          {step === 'scored' && result && (
            <section className={`assessment-result ${result.score.passed ? 'pass' : 'fail'}`}>
              <div className="assessment-result-head">
                {result.score.passed ? <CheckCircle2 size={30} /> : <ShieldAlert size={30} />}
                <div><strong>{result.score.scorePercent}%</strong><span>{result.score.passed ? 'Passed the final tabletop' : result.score.criticalFailure ? 'Failed — critical error' : 'Did not meet the standard'}</span></div>
              </div>
              {result.score.criticalFailure && <p className="assessment-critical-note">Automatic critical failure: {result.score.criticalReasons.join(', ')}. This overrides the numeric score.</p>}
              {!result.score.transferPassed && <p className="assessment-critical-note">Transfer gate not passed — the changed-facts answer must reapply the governing rule.</p>}
              {result.score.passed && !result.recorded && <p className="assessment-preview-note"><FileWarning size={15} /> {result.notice} This attempt is <strong>not</strong> recorded as official completion.</p>}
              {!result.score.passed && (
                <div className="tabletop-remediation">
                  <h3>Remediation options</h3>
                  <p>Choose one path:</p>
                  <div className="tabletop-nav">
                    <button className="assessment-secondary" onClick={onExit}>Reconstruct &amp; retry a new primary case form</button>
                    <button className="assessment-primary" onClick={() => (onForensicCapstone ? onForensicCapstone() : onExit())}>Take the True/False forensic capstone</button>
                  </div>
                </div>
              )}
              <button className="assessment-primary" onClick={onExit}>Return to My Compliance</button>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function RoundHeader({ step }: { step: Step }) {
  const map: Record<string, { n: string; title: string; body: string }> = {
    r1: { n: 'ROUND 1', title: 'Pre-meeting packet', body: 'Reconstruct valid composition, authority, quorum, conflicts, and which matters may proceed.' },
    r2: { n: 'ROUND 2', title: 'Live meeting injects', body: 'New facts arrive. Decide what to continue, hold, recuse, direct, or preserve.' },
    r3: { n: 'ROUND 3', title: 'Record, surveyor & transfer', body: 'Assemble the official record, defend it under questioning, and reapply the rule to changed facts.' },
  };
  const info = map[step];
  if (!info) return null;
  return <header className="tabletop-round-head"><span>{info.n}</span><h2>{info.title}</h2><p>{info.body}</p></header>;
}
