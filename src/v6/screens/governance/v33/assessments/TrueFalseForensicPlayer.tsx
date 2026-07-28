import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, FileWarning, Lock, ShieldAlert } from 'lucide-react';
import { commitEvidence } from '../compliance/complianceStore';
import { useLearnerId } from '../compliance/complianceIdentity';
import { getComplianceEvidenceService } from '../compliance/complianceEvidenceAdapter';
import { deterministicShuffle, integrityHash, pickForm } from './assessmentUtils';
import { getForensicBank } from './forensicBank';

const SUPERVISED_AFTER_ATTEMPT = 3;

function useActiveTime(): () => number {
  const s = useRef(0);
  useEffect(() => {
    const id = window.setInterval(() => { s.current += 1; }, 1000);
    return () => window.clearInterval(id);
  }, []);
  return () => s.current;
}

interface Answer { binary: boolean | null; source: string | null; }

export default function TrueFalseForensicPlayer({ moduleId, attemptNumber = 1, onExit }: { moduleId: string; attemptNumber?: number; onExit: () => void }) {
  const bank = getForensicBank(moduleId);
  const learnerId = useLearnerId();
  const getActive = useActiveTime();
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [attested, setAttested] = useState(false);
  const [result, setResult] = useState<{ scorePercent: number; criticalMisses: string[]; passed: boolean; recorded: boolean; notice: string } | null>(null);

  const form = useMemo(() => {
    if (!bank) return null;
    // Per-learner variant selection: forms and item order differ by user.
    const idx = pickForm(bank.forms.length, `${learnerId}:${moduleId}:${attemptNumber}`);
    const chosen = bank.forms[idx];
    return {
      formId: chosen.formId,
      items: deterministicShuffle(chosen.items, `${learnerId}:${moduleId}:${attemptNumber}:${chosen.formId}`),
    };
  }, [bank, moduleId, attemptNumber, learnerId]);

  if (!bank || !form) {
    return (
      <div className="assessment-shell">
        <header className="assessment-bar"><button className="assessment-back" onClick={onExit}><ArrowLeft size={17} /> Save &amp; exit</button><div className="assessment-bar-title"><span>FORENSIC REMEDIATION</span><strong>{moduleId}</strong></div></header>
        <div className="assessment-canvas"><div className="assessment-pending"><FileWarning size={28} /><h2>Forensic bank pending</h2><p>The reviewed True/False forensic bank for {moduleId} has not been published yet.</p><button className="assessment-primary" onClick={onExit}>Return</button></div></div>
      </div>
    );
  }

  if (attemptNumber >= SUPERVISED_AFTER_ATTEMPT) {
    return (
      <div className="assessment-shell">
        <header className="assessment-bar"><button className="assessment-back" onClick={onExit}><ArrowLeft size={17} /> Save &amp; exit</button><div className="assessment-bar-title"><span>FORENSIC REMEDIATION · {moduleId}</span><strong>Supervised remediation required</strong></div></header>
        <div className="assessment-canvas"><div className="assessment-pending"><ShieldAlert size={28} /><h2>Routed to supervised remediation</h2><p>After repeated unsuccessful attempts, this requirement is routed to supervised remediation rather than allowing further brute-force retries. Your compliance owner will schedule the session.</p><button className="assessment-primary" onClick={onExit}>Return to My Compliance</button></div></div>
      </div>
    );
  }

  const floor = form.items.length * 25;
  const allAnswered = form.items.every((i) => answers[i.id]?.binary !== undefined && answers[i.id]?.binary !== null && answers[i.id]?.source);

  const submit = async () => {
    let fullyCorrect = 0;
    const criticalMisses: string[] = [];
    for (const item of form.items) {
      const a = answers[item.id];
      const binaryOk = a?.binary === item.answer;
      const sourceOk = a?.source === item.controllingSourceId;
      const full = binaryOk && sourceOk;
      if (full) fullyCorrect += 1;
      if (item.critical && !full) criticalMisses.push(`${item.competency}`);
    }
    const scorePercent = Math.round((fullyCorrect / form.items.length) * 100);
    const passed = scorePercent >= bank.passPercent && criticalMisses.length === 0 && getActive() >= floor;

    const payload = {
      assignmentId: `gb:module:${moduleId}`,
      learnerId,
      role: 'GB' as const,
      sourceId: moduleId,
      sourceType: 'module' as const,
      sourceVersion: 'controlled-v6.0',
      effectiveDate: null,
      readCompletedAt: new Date().toISOString(),
      attestedAt: attested ? new Date().toISOString() : null,
      answersSnapshot: { formId: form.formId, answers },
      score: scorePercent,
      outcome: passed ? ('passed' as const) : ('failed' as const),
      criticalErrors: criticalMisses,
      attemptNumber,
      remediationPath: 'true_false_forensic' as const,
      activeTimeSeconds: getActive(),
      completedAt: passed ? new Date().toISOString() : null,
    };
    let recorded = false;
    let notice = getComplianceEvidenceService().disconnectedNotice;
    if (passed) {
      const saved = await commitEvidence(payload.assignmentId, { ...payload, integrityHash: integrityHash(payload) } as never);
      recorded = saved.ok;
      if (!saved.ok) notice = saved.message;
    }
    setResult({ scorePercent, criticalMisses, passed, recorded, notice });
  };

  return (
    <div className="assessment-shell">
      <header className="assessment-bar">
        <button className="assessment-back" onClick={onExit}><ArrowLeft size={17} /> Save &amp; exit</button>
        <div className="assessment-bar-title"><span>TRUE / FALSE FORENSIC REMEDIATION · {moduleId} · FORM {form.formId}</span><strong>Inspect the controlling fact</strong></div>
      </header>
      <div className="assessment-canvas">
        {!result && (
          <>
            <header className="assessment-head">
              <span className="assessment-kicker"><Lock size={15} /> NO FEEDBACK IS SHOWN UNTIL YOU SUBMIT</span>
              <h1>True / False forensic remediation</h1>
              <ul className="assessment-standard">
                <li><strong>What you must do:</strong> judge each statement True or False and select the controlling source for your judgment.</li>
                <li><strong>What counts as complete:</strong> ≥ {bank.passPercent}% fully correct (binary <em>and</em> source), every critical item fully correct, and an official evidence save.</li>
                <li><strong>What can auto-fail:</strong> any critical item where the binary judgment or the controlling source is wrong. A statement is false if any material clause is false.</li>
              </ul>
            </header>
            <form className="assessment-form" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
              {form.items.map((item, index) => (
                <fieldset key={item.id} className="assessment-question">
                  <legend><span>{index + 1}</span> {item.statement}{item.critical && <em className="assessment-critical"> · critical</em>}</legend>
                  <div className="forensic-binary">
                    {[true, false].map((val) => (
                      <label key={String(val)} className="assessment-option">
                        <input type="radio" name={`${item.id}-b`} checked={answers[item.id]?.binary === val} onChange={() => setAnswers((p) => ({ ...p, [item.id]: { binary: val, source: p[item.id]?.source ?? null } }))} />
                        <span>{val ? 'True' : 'False'}</span>
                      </label>
                    ))}
                  </div>
                  <label className="forensic-source">
                    <span>Controlling source</span>
                    <select
                      value={answers[item.id]?.source ?? ''}
                      onChange={(e) => setAnswers((p) => ({ ...p, [item.id]: { binary: p[item.id]?.binary ?? null, source: e.target.value } }))}
                    >
                      <option value="" disabled>Select the controlling source…</option>
                      {deterministicShuffle(item.sourceOptions, `${item.id}:src`).map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </fieldset>
              ))}
              <div className="assessment-attest">
                <label><input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} /><span>I attest that these are my own judgments. Completion records my identity, assignment, controlled source version, score, attempt, attestation, and completion time.</span></label>
              </div>
              <div className="assessment-actions">
                <p className="assessment-lock-note"><Lock size={13} /> Answers lock at submission and cannot be changed.</p>
                <button type="submit" className="assessment-primary" disabled={!allAnswered || !attested}>Submit forensic form</button>
              </div>
            </form>
          </>
        )}
        {result && (
          <div className={`assessment-result ${result.passed ? 'pass' : 'fail'}`}>
            <div className="assessment-result-head">{result.passed ? <CheckCircle2 size={30} /> : <ShieldAlert size={30} />}<div><strong>{result.scorePercent}%</strong><span>{result.passed ? 'Meets the forensic standard' : 'Did not meet the standard'}</span></div></div>
            {result.criticalMisses.length > 0 && <p className="assessment-critical-note">Missed competency categories: {[...new Set(result.criticalMisses)].join(', ')}. Review the controlling source sections; the next attempt uses a different form.</p>}
            {result.passed && !result.recorded && <p className="assessment-preview-note"><FileWarning size={15} /> {result.notice} This attempt is <strong>not</strong> recorded as official completion.</p>}
            <button className="assessment-primary" onClick={onExit}>Return to My Compliance</button>
          </div>
        )}
      </div>
    </div>
  );
}
