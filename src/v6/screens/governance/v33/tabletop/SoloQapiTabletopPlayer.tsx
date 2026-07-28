// Solo 2026 QAPI Tabletop (§5) — 11-step guided flow through the year arc.
//
// brief -> pre-read -> conflict/quorum -> Q1 -> Q2 -> Q3 -> Q4 -> directive ->
// surveyor -> transfer -> attestation+score.

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, FileSearch, FileWarning, Lock, ShieldAlert } from 'lucide-react';
import { commitEvidence } from '../compliance/complianceStore';
import { useLearnerId } from '../compliance/complianceIdentity';
import { getComplianceEvidenceService } from '../compliance/complianceEvidenceAdapter';
import { integrityHash } from '../assessments/assessmentUtils';
import {
  QAPI2026_TABLETOP,
  QAPI2026_TABLETOP_ASSIGNMENT_ID,
  QAPI2026_TABLETOP_ID,
  scoreQ26Tabletop,
  type Q26Exhibit,
  type Q26Score,
  type Q26Selections,
} from './qapi2026TabletopCase';
import { buildQ26Form, selectQ26FormIndex } from './qapi2026TabletopForms';
import {
  SOLO_STEP_LABEL,
  SOLO_STEP_ORDER,
  clearSoloState,
  createSoloState,
  loadSoloState,
  newSoloSessionId,
  saveSoloState,
  type SoloStep,
  type SoloTabletopState,
} from './TabletopSessionStore';
import './tabletop2026.css';

const c = QAPI2026_TABLETOP;

export default function SoloQapiTabletopPlayer({ onExit }: { onExit: () => void }) {
  // Authenticated identity (local-demo fallback is write-rejected downstream).
  const learnerId = useLearnerId();

  const [state, setState] = useState<SoloTabletopState>(() => {
    const sessionId = newSoloSessionId(learnerId, 1);
    return loadSoloState(sessionId) ?? createSoloState(learnerId, 1, selectQ26FormIndex(learnerId, 1));
  });
  const [result, setResult] = useState<{ score: Q26Score; recorded: boolean; notice: string } | null>(null);

  useEffect(() => {
    saveSoloState(state);
  }, [state]);

  const form = useMemo(() => buildQ26Form(state.formIndex), [state.formIndex]);
  const exhibitsById = useMemo(() => new Map(c.exhibits.map((e) => [e.id, e])), []);
  const exhibitsInOrder = useMemo(
    () => form.exhibitOrder.map((id) => exhibitsById.get(id)).filter((e): e is Q26Exhibit => Boolean(e)),
    [form, exhibitsById],
  );

  const conflictDecisions = useMemo(() => form.decisions.filter((d) => d.round === 'Q1' && d.dimension === 'authority_quorum_conflict'), [form]);
  const q1Decisions = useMemo(() => form.decisions.filter((d) => d.round === 'Q1' && d.dimension !== 'authority_quorum_conflict'), [form]);
  const q2Decisions = useMemo(() => form.decisions.filter((d) => d.round === 'Q2'), [form]);
  const q3Decisions = useMemo(() => form.decisions.filter((d) => d.round === 'Q3'), [form]);
  const q4Decisions = useMemo(() => form.decisions.filter((d) => d.round === 'Q4'), [form]);
  const directiveDecisions = useMemo(() => form.decisions.filter((d) => d.round === 'YEAR_END'), [form]);

  const criticalExhibits = useMemo(() => c.exhibits.filter((e) => e.critical), []);
  const allCriticalOpen = criticalExhibits.every((e) => state.inspectedExhibitIds.includes(e.id));

  const inspect = (id: string) =>
    setState((s) => (s.inspectedExhibitIds.includes(id) ? s : { ...s, inspectedExhibitIds: [...s.inspectedExhibitIds, id] }));

  const setDecision = (id: string, optionId: string) => setState((s) => ({ ...s, decisions: { ...s.decisions, [id]: optionId } }));
  const setSurveyor = (id: string, optionId: string) => setState((s) => ({ ...s, surveyor: { ...s.surveyor, [id]: optionId } }));
  const setTransfer = (id: string, optionId: string) => setState((s) => ({ ...s, transferAnswers: { ...s.transferAnswers, [id]: optionId } }));

  function isStepComplete(step: SoloStep): boolean {
    switch (step) {
      case 'brief': return true;
      case 'pre_read': return allCriticalOpen;
      case 'conflict_quorum': return conflictDecisions.every((d) => Boolean(state.decisions[d.id]));
      case 'q1_baseline': return q1Decisions.every((d) => Boolean(state.decisions[d.id]));
      case 'q2_injects': return q2Decisions.every((d) => Boolean(state.decisions[d.id]));
      case 'q3_injects': return q3Decisions.every((d) => Boolean(state.decisions[d.id]));
      case 'q4_closure': return q4Decisions.every((d) => Boolean(state.decisions[d.id]));
      case 'directive': return directiveDecisions.every((d) => Boolean(state.decisions[d.id]));
      case 'surveyor': return c.surveyor.every((q) => Boolean(state.surveyor[q.id]));
      case 'transfer': return c.transfer.every((t) => Boolean(state.transferAnswers[t.id]));
      case 'attestation': return state.attested;
      default: return true;
    }
  }

  const stepIndex = SOLO_STEP_ORDER.indexOf(state.step);
  const canAdvance = isStepComplete(state.step);

  const goNext = () => {
    if (!canAdvance) return;
    const i = SOLO_STEP_ORDER.indexOf(state.step);
    if (i < SOLO_STEP_ORDER.length - 1) setState((s) => ({ ...s, step: SOLO_STEP_ORDER[i + 1] }));
  };
  const goBack = () => {
    const i = SOLO_STEP_ORDER.indexOf(state.step);
    if (i > 0) setState((s) => ({ ...s, step: SOLO_STEP_ORDER[i - 1] }));
  };

  const submit = async () => {
    const selections: Q26Selections = {
      decisions: state.decisions,
      surveyor: state.surveyor,
      transferAnswers: state.transferAnswers,
      inspectedExhibitIds: state.inspectedExhibitIds,
      attested: state.attested,
    };
    const score = scoreQ26Tabletop(selections);
    const activeTimeSeconds = Math.max(0, Math.round((Date.now() - Date.parse(state.startedAt)) / 1000));
    const payload = {
      schemaVersion: 2,
      assignmentId: QAPI2026_TABLETOP_ASSIGNMENT_ID,
      learnerId,
      role: 'GB' as const,
      sourceId: QAPI2026_TABLETOP_ID,
      sourceType: 'tabletop' as const,
      sourceVersion: `form-${form.formIndex}`,
      effectiveDate: null,
      readCompletedAt: new Date().toISOString(),
      attestedAt: state.attested ? new Date().toISOString() : null,
      answersSnapshot: selections,
      score: score.scorePercent,
      scoreMaximum: 100,
      passThreshold: QAPI2026_TABLETOP.passScore,
      scoreScale: 'percentage_100' as const,
      outcome: score.passed ? ('passed' as const) : ('failed' as const),
      criticalErrors: score.criticalReasons,
      attemptNumber: state.attemptNumber,
      remediationPath: 'none' as const,
      activeTimeSeconds,
      completedAt: score.passed ? new Date().toISOString() : null,
    };
    let recorded = false;
    let notice = getComplianceEvidenceService().disconnectedNotice;
    if (score.passed) {
      const saved = await commitEvidence(QAPI2026_TABLETOP_ASSIGNMENT_ID, { ...payload, integrityHash: integrityHash(payload) } as never, { authenticatedSubjectId: learnerId });
      recorded = saved.ok;
      if (!saved.ok) notice = saved.message;
      clearSoloState(state.sessionId);
    }
    setResult({ score, recorded, notice });
    setState((s) => ({ ...s, step: 'attestation' }));
  };

  const retryNewForm = () => {
    const nextAttempt = state.attemptNumber + 1;
    const nextFormIndex = selectQ26FormIndex(learnerId, nextAttempt);
    clearSoloState(state.sessionId);
    setResult(null);
    setState(createSoloState(learnerId, nextAttempt, nextFormIndex));
  };

  const scored = Boolean(result);

  return (
    <div className="tabletop-shell">
      <header className="assessment-bar">
        <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance"><ArrowLeft size={17} /> Save &amp; exit</button>
        <div className="assessment-bar-title"><span>2026 QAPI TABLETOP · SOLO · {c.minutes} MIN · ATTEMPT {state.attemptNumber}</span><strong>{c.title}</strong></div>
      </header>

      <div className="tabletop-layout">
        <aside className="tabletop-exhibits" aria-label="Case exhibits">
          <h2><FileSearch size={16} /> Exhibits</h2>
          <p className="tabletop-exhibit-note">Open every critical exhibit. Decoys look relevant but are immaterial — some are marked as exercise injects, never real source data.</p>
          <ul>
            {exhibitsInOrder.map((e) => (
              <li key={e.id}>
                <button className={state.inspectedExhibitIds.includes(e.id) ? 'opened' : ''} onClick={() => inspect(e.id)}>
                  <span className="tabletop-exhibit-code">{e.quarter} · {e.code}{e.critical && <em title="Critical exhibit"> ●</em>}</span>
                  <strong>{e.title}</strong>
                  <span className="q26tt-badge-row">
                    {e.decoy && <span className="q26tt-badge q26tt-badge-decoy">Decoy</span>}
                    {e.isInject && <span className="q26tt-badge q26tt-badge-inject">Exercise inject</span>}
                  </span>
                  {state.inspectedExhibitIds.includes(e.id) && <small>{e.summary}</small>}
                  {state.inspectedExhibitIds.includes(e.id) && e.isInject && e.injectNote && <p className="q26tt-inject-note">{e.injectNote}</p>}
                </button>
              </li>
            ))}
          </ul>
          <div className="tabletop-exhibit-progress">{state.inspectedExhibitIds.filter((id) => criticalExhibits.some((e) => e.id === id)).length}/{criticalExhibits.length} critical exhibits opened</div>
        </aside>

        <main className="tabletop-canvas">
          <ol className="q26tt-round-rail">
            {SOLO_STEP_ORDER.map((step, i) => (
              <li key={step} className={step === state.step ? 'active' : i < stepIndex || scored ? 'done' : ''}>
                <span>{i + 1}</span>{SOLO_STEP_LABEL[step]}
              </li>
            ))}
          </ol>

          {state.step === 'brief' && (
            <section className="tabletop-brief">
              <span className="assessment-kicker"><ShieldAlert size={15} /> ASSESSMENT — NO ANSWERS ARE REVEALED UNTIL SCORING</span>
              <h1>{c.title}</h1>
              <p>{c.context}</p>
              <div className="tabletop-standard">
                <h3>What counts as complete</h3>
                <ul>
                  <li>Total score ≥ {c.passScore}% AND zero critical errors (the critical-error gate overrides the score).</li>
                  <li>All critical exhibits inspected and every required decision, surveyor answer, and transfer answered.</li>
                  <li>Both changed-facts transfers passed, attestation completed, and an official evidence save.</li>
                </ul>
                <h3>Automatic critical failures</h3>
                <ul className="tabletop-critical-list">{c.automaticCriticalFailures.map((f) => <li key={f}>{f}</li>)}</ul>
              </div>
              <button className="assessment-primary" onClick={goNext}>Begin pre-read <ArrowRight size={15} /></button>
            </section>
          )}

          {state.step === 'pre_read' && (
            <section className="tabletop-round">
              <header className="tabletop-round-head"><span>PRE-READ</span><h2>Reconstruct the packet</h2><p>Open every critical exhibit before you can proceed. These material contradictions are what you must reconcile — none of them tell you the right decision.</p></header>
              <ul className="q26tt-contradictions">
                {c.contradictions.map((ct) => (<li key={ct.id}><strong>{ct.title}</strong><span>{ct.detail}</span></li>))}
              </ul>
              {!allCriticalOpen && <p className="assessment-critical-note">Open all critical exhibits in the left rail to continue.</p>}
              <div className="tabletop-nav">
                <button className="assessment-secondary" onClick={goBack}>Back</button>
                <button className="assessment-primary" disabled={!canAdvance} onClick={goNext}>Continue <ArrowRight size={15} /></button>
              </div>
            </section>
          )}

          {state.step === 'conflict_quorum' && (
            <DecisionStep title="Conflict & quorum" body="A disclosed director conflict intersects the very CAP under review. Decide how the Board is properly seated before any vote." decisions={conflictDecisions} answers={state.decisions} onAnswer={setDecision} canAdvance={canAdvance} onBack={goBack} onNext={goNext} />
          )}
          {state.step === 'q1_baseline' && (
            <DecisionStep title="Q1 — Baseline" body="Separate decisive evidence from decoys for the Q1 PIP triggers, then decide the proportionate direction on the restricted personnel matters." decisions={q1Decisions} answers={state.decisions} onAnswer={setDecision} canAdvance={canAdvance} onBack={goBack} onNext={goNext} />
          )}
          {state.step === 'q2_injects' && (
            <DecisionStep title="Q2 — Worsening injects" body="A favorable aggregate arrives beside worsening subgroups, an unreconciled census, and a clinician-ID identity collision." decisions={q2Decisions} answers={state.decisions} onAnswer={setDecision} canAdvance={canAdvance} onBack={goBack} onNext={goNext} />
          )}
          {state.step === 'q3_injects' && (
            <DecisionStep title="Q3 — Growth & hospitalization injects" body="Q3 is unnormalized in the source; the growth and vendor scenarios here are exercise injects layered on that gap." decisions={q3Decisions} answers={state.decisions} onAnswer={setDecision} canAdvance={canAdvance} onBack={goBack} onNext={goNext} />
          )}
          {state.step === 'q4_closure' && (
            <DecisionStep title="Q4 — Closure claims" body="Management treats two PIPs' silence in the record as closure. Decide what the record actually supports." decisions={q4Decisions} answers={state.decisions} onAnswer={setDecision} canAdvance={canAdvance} onBack={goBack} onNext={goNext} />
          )}
          {state.step === 'directive' && (
            <DecisionStep title="Motion & directive drafting" body="Draft the year-end directive. A material directive without an owner, due date, effectiveness measure, and return date is a critical failure, no matter how sound the underlying judgment." decisions={directiveDecisions} answers={state.decisions} onAnswer={setDecision} canAdvance={canAdvance} onBack={goBack} onNext={goNext} />
          )}

          {state.step === 'surveyor' && (
            <section className="tabletop-round">
              <header className="tabletop-round-head"><span>SURVEYOR DEFENSE</span><h2>Defend the record</h2><p>Answer as the record supports — not as you wish it read.</p></header>
              {c.surveyor.map((q) => {
                const options = form.surveyor.find((s) => s.id === q.id)?.options ?? q.options;
                return (
                  <fieldset key={q.id} className="assessment-question">
                    <legend>{q.prompt}</legend>
                    {options.map((o) => (
                      <label key={o.id} className="assessment-option">
                        <input type="radio" name={q.id} checked={state.surveyor[q.id] === o.id} onChange={() => setSurveyor(q.id, o.id)} />
                        <span>{o.text}</span>
                      </label>
                    ))}
                  </fieldset>
                );
              })}
              <div className="tabletop-nav">
                <button className="assessment-secondary" onClick={goBack}>Back</button>
                <button className="assessment-primary" disabled={!canAdvance} onClick={goNext}>Continue <ArrowRight size={15} /></button>
              </div>
            </section>
          )}

          {state.step === 'transfer' && (
            <section className="tabletop-round">
              <header className="tabletop-round-head"><span>CHANGED-FACTS TRANSFER</span><h2>Reapply the rule</h2><p>Two scenarios, same governing rules — no rationale shown until scoring.</p></header>
              {c.transfer.map((t) => (
                <fieldset key={t.id} className="assessment-question">
                  <legend>
                    <span className="tabletop-transfer-facts">{t.changedFacts}</span>
                    <br />{t.prompt}
                  </legend>
                  {t.options.map((o) => (
                    <label key={o.id} className="assessment-option">
                      <input type="radio" name={t.id} checked={state.transferAnswers[t.id] === o.id} onChange={() => setTransfer(t.id, o.id)} />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
              <div className="tabletop-nav">
                <button className="assessment-secondary" onClick={goBack}>Back</button>
                <button className="assessment-primary" disabled={!canAdvance} onClick={goNext}>Continue to attestation <ArrowRight size={15} /></button>
              </div>
            </section>
          )}

          {state.step === 'attestation' && !result && (
            <section className="tabletop-review">
              <h2>Review &amp; lock</h2>
              <div className="assessment-attest">
                <label>
                  <input type="checkbox" checked={state.attested} onChange={(e) => setState((s) => ({ ...s, attested: e.target.checked }))} />
                  <span>I attest that these are my own governance decisions on this case. Completion records my identity, assignment, controlled source version, score, attempt, attestation, and completion time.</span>
                </label>
              </div>
              <p className="assessment-lock-note"><Lock size={13} /> Locking submits the attempt. Answers cannot be changed and no rationale is shown until scoring completes.</p>
              <div className="tabletop-nav">
                <button className="assessment-secondary" onClick={goBack}>Back</button>
                <button className="assessment-primary" disabled={!state.attested} onClick={() => void submit()}>Lock &amp; submit</button>
              </div>
            </section>
          )}

          {state.step === 'attestation' && result && (
            <section className={`assessment-result ${result.score.passed ? 'pass' : 'fail'}`}>
              <div className="assessment-result-head">
                {result.score.passed ? <CheckCircle2 size={30} /> : <ShieldAlert size={30} />}
                <div><strong>{result.score.scorePercent}%</strong><span>{result.score.passed ? 'Passed the 2026 QAPI tabletop' : result.score.criticalFailure ? 'Failed — critical error' : 'Did not meet the standard'}</span></div>
              </div>
              {result.score.criticalFailure && <p className="assessment-critical-note">Automatic critical failure: {result.score.criticalReasons.join(', ')}. This overrides the numeric score.</p>}
              {!result.score.transferPassed && <p className="assessment-critical-note">Transfer gate not passed — both changed-facts answers must correctly reapply the governing rule.</p>}
              {result.score.passed && !result.recorded && <p className="assessment-preview-note"><FileWarning size={15} /> {result.notice} This attempt is <strong>not</strong> recorded as official completion.</p>}
              {!result.score.passed && (
                <div className="tabletop-remediation">
                  <h3>Remediation</h3>
                  <p>Retry with a new alternate form — the facts stay grounded in the same normalized source, but option order and inject sequence differ.</p>
                  <div className="tabletop-nav">
                    <button className="assessment-secondary" onClick={retryNewForm}>Reconstruct &amp; retry a new form</button>
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

function DecisionStep({
  title, body, decisions, answers, onAnswer, canAdvance, onBack, onNext,
}: {
  title: string;
  body: string;
  decisions: { id: string; prompt: string; options: { id: string; text: string }[] }[];
  answers: Record<string, string>;
  onAnswer: (id: string, optionId: string) => void;
  canAdvance: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <section className="tabletop-round">
      <header className="tabletop-round-head"><span>REQUIRED DECISIONS</span><h2>{title}</h2><p>{body}</p></header>
      {decisions.map((dec) => (
        <fieldset key={dec.id} className="assessment-question">
          <legend>{dec.prompt}</legend>
          {dec.options.map((o) => (
            <label key={o.id} className="assessment-option">
              <input type="radio" name={dec.id} checked={answers[dec.id] === o.id} onChange={() => onAnswer(dec.id, o.id)} />
              <span>{o.text}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <div className="tabletop-nav">
        <button className="assessment-secondary" onClick={onBack}>Back</button>
        <button className="assessment-primary" disabled={!canAdvance} onClick={onNext}>Continue <ArrowRight size={15} /></button>
      </div>
    </section>
  );
}
