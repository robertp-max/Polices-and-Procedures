import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, ClipboardCheck, FileWarning, Lock, ShieldAlert } from 'lucide-react';
import { getPolicyJourney } from '../generated/policyJourney.generated';
import { commitEvidence } from '../compliance/complianceStore';
import { useLearnerId } from '../compliance/complianceIdentity';
import { getComplianceEvidenceService } from '../compliance/complianceEvidenceAdapter';
import { deterministicShuffle, integrityHash } from './assessmentUtils';
import { getCourseQuestions } from './courseAssessmentBank';
import RemediationChoiceModal from '../remediation/RemediationChoiceModal';
import GuidedTrueFalsePlayer from '../remediation/GuidedTrueFalsePlayer';

const PASS_STANDARD = 80;
const ACTIVE_TIME_FLOOR_SECONDS = 30; // scaled to item count below

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

type Phase = 'attempt' | 'scored';

export default function CourseAssessmentPlayer({ courseId, onExit }: { courseId: string; onExit: () => void }) {
  const journey = useMemo(() => getPolicyJourney('GB'), []);
  const course = journey.courses.find((c) => c.courseId === courseId);
  const learnerId = useLearnerId();
  const attemptNumber = 1;
  const questions = useMemo(() => {
    const raw = getCourseQuestions(courseId);
    // Variant seeds are per-learner: a different authenticated user gets a
    // different question/option order for the same course and attempt.
    return deterministicShuffle(raw, `${learnerId}:${courseId}:${attemptNumber}`).map((q) => ({
      q,
      order: deterministicShuffle(q.options.map((_, i) => i), `${learnerId}:${q.id}:${attemptNumber}`),
    }));
  }, [courseId, learnerId]);

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>('attempt');
  const [attested, setAttested] = useState(false);
  const [result, setResult] = useState<{ score: number; criticalErrors: string[]; passed: boolean; recorded: boolean; notice: string } | null>(null);
  const [showChoice, setShowChoice] = useState(false);
  const [guided, setGuided] = useState(false);
  const getActive = useActiveTime();

  const missedCompetencies = questions.filter(({ q }) => answers[q.id] !== q.correctIndex).map(({ q }) => q.competency);

  useEffect(() => {
    if (phase === 'scored' && result && !result.passed) setShowChoice(true);
  }, [phase, result]);

  if (guided) {
    return (
      <GuidedTrueFalsePlayer
        assignmentId={`gb:course-assessment:${courseId}`}
        sourceId={courseId}
        sourceType="course_quiz"
        missedConceptIds={missedCompetencies}
        primaryAttemptScore={result?.score ?? 0}
        attemptNumber={attemptNumber + 1}
        onExit={onExit}
      />
    );
  }

  if (!questions.length) {
    return (
      <div className="assessment-shell">
        <AssessmentBar title={course?.title ?? courseId} onExit={onExit} />
        <div className="assessment-canvas">
          <div className="assessment-pending" role="status">
            <FileWarning size={28} />
            <h2>Course assessment bank pending review</h2>
            <p>The reviewed, source-linked question bank for {course?.title ?? courseId} has not been published yet. No provisional or auto-generated quiz is shown — an official assessment must use reviewed items traceable to the controlled policy version.</p>
            <button className="assessment-primary" onClick={onExit}>Return to My Compliance</button>
          </div>
        </div>
      </div>
    );
  }

  const allAnswered = questions.every(({ q }) => answers[q.id] !== undefined);
  const floor = Math.max(ACTIVE_TIME_FLOOR_SECONDS, questions.length * 20);

  const submit = async () => {
    const critical: string[] = [];
    let correct = 0;
    for (const { q } of questions) {
      const ok = answers[q.id] === q.correctIndex;
      if (ok) correct += 1;
      else if (q.critical) critical.push(q.competency);
    }
    const score = Math.round((correct / questions.length) * 100);
    const passed = score >= PASS_STANDARD && critical.length === 0 && getActive() >= floor;

    const payload = {
      assignmentId: `gb:course-assessment:${courseId}`,
      learnerId,
      role: 'GB' as const,
      sourceId: courseId,
      sourceType: 'course_quiz' as const,
      sourceVersion: 'controlled-v6.0',
      effectiveDate: null,
      readCompletedAt: new Date().toISOString(),
      attestedAt: attested ? new Date().toISOString() : null,
      answersSnapshot: answers,
      score,
      outcome: passed ? ('passed' as const) : ('failed' as const),
      criticalErrors: critical,
      attemptNumber,
      remediationPath: 'none' as const,
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
    setResult({ score, criticalErrors: critical, passed, recorded, notice });
    setPhase('scored');
  };

  return (
    <div className="assessment-shell">
      <AssessmentBar title={course?.title ?? courseId} onExit={onExit} />
      <div className="assessment-canvas">
        <header className="assessment-head">
          <span className="assessment-kicker"><ClipboardCheck size={15} /> COURSE ASSESSMENT · {courseId}</span>
          <h1>{course?.title}</h1>
          <ul className="assessment-standard">
            <li><strong>What you must do:</strong> answer every question using the controlled policy sources for this course.</li>
            <li><strong>What counts as complete:</strong> score ≥ {PASS_STANDARD}%, zero critical errors, attestation, and an official evidence save.</li>
            <li><strong>What can cause automatic failure:</strong> any critical item answered incorrectly.</li>
          </ul>
        </header>

        {phase === 'attempt' && (
          <form
            onSubmit={(e) => { e.preventDefault(); void submit(); }}
            className="assessment-form"
          >
            {questions.map(({ q, order }, index) => (
              <fieldset key={q.id} className="assessment-question">
                <legend><span>{index + 1}</span> {q.prompt}{q.critical && <em className="assessment-critical" title="Critical item"> · critical</em>}</legend>
                {order.map((optIndex) => (
                  <label key={optIndex} className="assessment-option">
                    <input
                      type="radio"
                      name={q.id}
                      checked={answers[q.id] === optIndex}
                      onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: optIndex }))}
                    />
                    <span>{q.options[optIndex]}</span>
                  </label>
                ))}
              </fieldset>
            ))}
            <div className="assessment-attest">
              <label>
                <input type="checkbox" checked={attested} onChange={(e) => setAttested(e.target.checked)} />
                <span>I attest that I completed this assessment myself using the controlled policy sources. Completion records my identity, assignment, controlled source version, score, attempt, attestation, and completion time.</span>
              </label>
            </div>
            <div className="assessment-actions">
              <p className="assessment-lock-note"><Lock size={13} /> Answers are not revealed and cannot be changed once submitted.</p>
              <button type="submit" className="assessment-primary" disabled={!allAnswered || !attested}>
                Submit assessment
              </button>
            </div>
          </form>
        )}

        {phase === 'scored' && result && (
          <div className={`assessment-result ${result.passed ? 'pass' : 'fail'}`}>
            <div className="assessment-result-head">
              {result.passed ? <CheckCircle2 size={30} /> : <ShieldAlert size={30} />}
              <div>
                <strong>{result.score}%</strong>
                <span>{result.passed ? 'Meets the pass standard' : result.criticalErrors.length ? 'Failed — critical error' : 'Below the pass standard'}</span>
              </div>
            </div>
            {result.criticalErrors.length > 0 && (
              <p className="assessment-critical-note">Critical competency missed: {result.criticalErrors.join(', ')}. A critical error fails the attempt regardless of numeric score.</p>
            )}
            {result.passed && !result.recorded && (
              <p className="assessment-preview-note"><FileWarning size={15} /> {result.notice} This attempt is <strong>not</strong> recorded as official completion.</p>
            )}
            <div className="assessment-rationales">
              {questions.map(({ q }) => (
                <article key={q.id} className={answers[q.id] === q.correctIndex ? 'correct' : 'incorrect'}>
                  <strong>{q.prompt}</strong>
                  <p><b>Controlling rationale:</b> {q.rationale}</p>
                  <small>Source: {q.sourceIds.join(', ')} · {q.remediation}</small>
                </article>
              ))}
            </div>
            <div className="assessment-actions">
              <button className="assessment-primary" onClick={onExit}>Return to My Compliance</button>
              {!result.passed && <button className="assessment-secondary" onClick={() => setShowChoice(true)}>Remediation options</button>}
            </div>
          </div>
        )}
        <RemediationChoiceModal
          open={showChoice}
          missedConcepts={missedCompetencies}
          onTryAgain={() => { setShowChoice(false); setGuided(false); setAnswers({}); setAttested(false); setResult(null); setPhase('attempt'); }}
          onGuided={() => { setShowChoice(false); setGuided(true); }}
          onReview={onExit}
          onClose={() => setShowChoice(false)}
        />
      </div>
    </div>
  );
}

function AssessmentBar({ title, onExit }: { title: string; onExit: () => void }) {
  return (
    <header className="assessment-bar">
      <button className="assessment-back" onClick={onExit} aria-label="Save & exit to My Compliance"><ArrowLeft size={17} /> Save &amp; exit</button>
      <div className="assessment-bar-title"><span>GOVERNING BODY · CONTROLLED ASSESSMENT</span><strong>{title}</strong></div>
    </header>
  );
}
