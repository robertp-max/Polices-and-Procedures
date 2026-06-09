/* ═══════════════════════════════════════════════════════════════
   SCORM PLAYER — hosts the SCORM 1.2 runtime and the module shell.
   In production, src/scorm/<courseId>/index.html loads via iframe.
   Here, for demo without real SCORM packages, we provide a built-in
   quiz/acknowledge shell that SETS the same cmi.* values a real
   SCORM package would set via LMSSetValue/LMSCommit.
   ═══════════════════════════════════════════════════════════════ */

import { useEffect, useMemo, useRef, useState } from 'react';
import type { JourneyModule, ModuleAttempt } from '@/policy/journey/types/journey';
import { installScorm12API, secondsToScormTime } from '@/policy/journey/scorm/ScormRuntime';
import { useJourneyStore } from '@/policy/journey/stores/journeyStore';
import { GAO_EXAM_ITEMS } from '@/policy/journey/data/appendices';
import {
  CARE_INDEED_PASSING_STANDARD_PERCENT,
  ACHC_MINIMUM_PASSING_PERCENT,
  getAchcLessons,
  getAchcRequiredScreenIds,
  getAchcTest,
  gradeAchcQuiz,
  isAchcModuleId,
} from '@/policy/journey/utils/achcTrainingCalculations';
import { CheckCircle2, XCircle, Save, BookOpen, Play } from 'lucide-react';

interface Props {
  module: JourneyModule;
  employeeId: string;
  attempt: ModuleAttempt;
  onExit: (passed: boolean) => void;
}

export function ScormPlayer({ module, employeeId, attempt, onExit }: Props) {
  const applyScormCommit = useJourneyStore(s => s.applyScormCommit);
  const finalizeAttempt = useJourneyStore(s => s.finalizeAttempt);

  const [iframeMode] = useState(!!module.scormCourseId);

  const handlersRef = useRef({
    onCommit: (d: import('@/policy/journey/scorm/ScormRuntime').ScormData) => applyScormCommit(attempt.id, d),
    onFinish: (d: import('@/policy/journey/scorm/ScormRuntime').ScormData) => {
      finalizeAttempt(attempt.id, d);
      onExit(d.lesson_status === 'passed');
    },
    getInitial: () => ({
      student_id: employeeId,
      student_name: employeeId,
      suspend_data: attempt.suspendData,
      lesson_location: attempt.lessonLocation,
    }),
  });

  useEffect(() => {
    const uninstall = installScorm12API(handlersRef.current);
    return uninstall;
  }, []);

  if (iframeMode) {
    return (
      <iframe
        title={`${module.id} SCORM content`}
        src={`/scorm/${module.scormCourseId}/index.html`}
        className="w-full h-full rounded-xl border border-white/10 bg-black"
      />
    );
  }

  // Fallback — built-in shell that calls window.API exactly as a SCORM package would.
  if (module.method === 'Quiz' || module.method === 'CodingExercise' || module.method === 'PhishingSim') {
    return <BuiltInQuiz module={module} attemptNumber={attempt.attemptNumber} />;
  }
  return <BuiltInAcknowledge module={module} />;
}

/* ─────────────────────────────────────────────────────────────
   Built-in quiz shell — talks to window.API exactly like SCORM.
   ───────────────────────────────────────────────────────────── */
function BuiltInQuiz({ module, attemptNumber }: { module: JourneyModule; attemptNumber: number }) {
  const achcTest = useMemo(() => isAchcModuleId(module.id) ? getAchcTest(module.id) : undefined, [module.id]);
  const achcLessons = useMemo(() => isAchcModuleId(module.id) ? getAchcLessons(module.id) : [], [module.id]);
  const requiredScreenIds = useMemo(() => isAchcModuleId(module.id) ? getAchcRequiredScreenIds(module.id) : [], [module.id]);
  const bank = useMemo(() => {
    if (achcTest) {
      return achcTest.questions.map(q => ({
        id: q.question_id,
        q: q.prompt,
        options: q.choices,
        correct: q.correct_answer,
        policyRef: module.policyRefs.join(' · ') || module.id,
      }));
    }
    return GAO_EXAM_ITEMS.slice(0, 5).map((q, index) => ({ id: `gao-${index}`, ...q }));
  }, [achcTest, module.id, module.policyRefs]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [lessonsViewed, setLessonsViewed] = useState(!achcTest);
  const [submitted, setSubmitted] = useState(false);
  const startedAt = useRef(0);

  const api = (): Record<string, (k: string, v?: string) => string> | null =>
    (window as unknown as { API?: Record<string, (k: string, v?: string) => string> }).API ?? null;

  useEffect(() => {
    startedAt.current = Date.now();
    const a = api();
    if (!a) return;
    a.LMSInitialize('');
    a.LMSSetValue('cmi.core.lesson_status', 'incomplete');
    a.LMSCommit('');
  }, []);

  const save = () => {
    const a = api();
    if (!a) return;
    a.LMSSetValue('cmi.suspend_data', JSON.stringify({
      answers,
      lesson_screen_ids: lessonsViewed ? requiredScreenIds : [],
      required_lesson_screen_ids: requiredScreenIds,
    }));
    a.LMSSetValue('cmi.core.lesson_location', String(Object.keys(answers).length));
    const sessionSec = Math.floor((Date.now() - (startedAt.current || Date.now())) / 1000);
    a.LMSSetValue('cmi.core.session_time', secondsToScormTime(sessionSec));
    a.LMSCommit('');
  };

  const submit = () => {
    const a = api();
    if (!a) return;
    if (!lessonsViewed) return;
    const answerByQuestionId = Object.fromEntries(bank.map((q, i) => [q.id, answers[i]]));
    const grade = achcTest
      ? gradeAchcQuiz(achcTest, answerByQuestionId, attemptNumber, new Date().toISOString(), CARE_INDEED_PASSING_STANDARD_PERCENT)
      : null;
    const correct = grade?.correct_answers ?? bank.filter((q, i) => answers[i] === q.correct).length;
    const score = grade?.score_percent ?? Math.round((correct / bank.length) * 100);
    const threshold = (module.passThreshold ?? 0.8) * 100;
    const passed = score >= threshold;

    a.LMSSetValue('cmi.core.score.raw', String(score));
    a.LMSSetValue('cmi.core.score.min', '0');
    a.LMSSetValue('cmi.core.score.max', '100');
    a.LMSSetValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');
    a.LMSSetValue('cmi.suspend_data', JSON.stringify({
      answers,
      grade,
      lesson_screen_ids: requiredScreenIds,
      required_lesson_screen_ids: requiredScreenIds,
      achc_minimum_passing_score: ACHC_MINIMUM_PASSING_PERCENT,
      care_indeed_passing_standard: CARE_INDEED_PASSING_STANDARD_PERCENT,
    }));
    a.LMSSetValue('cmi.core.exit', 'normal');
    const sessionSec = Math.floor((Date.now() - (startedAt.current || Date.now())) / 1000);
    a.LMSSetValue('cmi.core.session_time', secondsToScormTime(sessionSec));
    a.LMSCommit('');
    a.LMSFinish('');
    setSubmitted(true);
  };

  const correctCount = bank.filter((q, i) => answers[i] === q.correct).length;
  const score = Math.round((correctCount / bank.length) * 100);
  const threshold = (module.passThreshold ?? 0.8) * 100;
  const passed = score >= threshold;
  const allAnswered = Object.keys(answers).length === bank.length;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-5 ci-text">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={20} className="ci-text-gold" />
        <div className="text-xs font-montserrat font-bold uppercase tracking-widest ci-text-gold">
          {module.id} · {module.method}
        </div>
      </div>
      <h2 className="text-xl font-montserrat font-bold ci-text">{module.title}</h2>

      {achcTest && (
        <div className="rounded-xl p-4 ci-bg-overlay-faint ci-border-overlay border space-y-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold uppercase tracking-widest ci-text-surface-soft">
            <span>ACHC minimum: {ACHC_MINIMUM_PASSING_PERCENT}%</span>
            <span>Care Indeed passing standard: {CARE_INDEED_PASSING_STANDARD_PERCENT}%</span>
          </div>
          <div className="text-[12px] ci-text-muted">
            Care Indeed standard, stricter than ACHC packet minimum. Completion also requires required lesson screens, post-test submission, certificate generation, personnel-file evidence, and annual due date creation.
          </div>
          <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-3 pr-1">
            {achcLessons.map(lesson => (
              <section key={lesson.lesson_id} className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider ci-text-gold">{lesson.title}</div>
                {lesson.cards.filter(card => card.completion_required).map(card => (
                  <article key={card.card_id} className="rounded-lg border ci-border-overlay px-3 py-2">
                    <div className="text-[12px] font-semibold ci-text">{card.title}</div>
                    <p className="mt-1 whitespace-pre-line text-[11px] leading-relaxed ci-text-muted">{card.content}</p>
                  </article>
                ))}
              </section>
            ))}
          </div>
          <label className="flex items-start gap-2 text-[12px] ci-text-surface-soft">
            <input
              type="checkbox"
              checked={lessonsViewed}
              onChange={event => setLessonsViewed(event.target.checked)}
              className="mt-0.5"
            />
            I confirm all {requiredScreenIds.length} required lesson screens for {module.id} have been viewed before submitting the post-test.
          </label>
        </div>
      )}

      {bank.map((q, i) => (
        <div key={q.id} className="border ci-border-overlay rounded-xl p-4 ci-bg-overlay-faint">
          <div className="text-sm ci-text-surface-strong mb-3">
            <span className="font-bold ci-text-gold mr-2">{i + 1}.</span>{q.q}
          </div>
          <div className="space-y-2">
            {q.options.map((opt, k) => {
              const selected = answers[i] === k;
              const isCorrect = submitted && k === q.correct;
              const isWrong = submitted && selected && k !== q.correct;
              return (
                <button
                  key={k}
                  disabled={submitted}
                  onClick={() => setAnswers(a => ({ ...a, [i]: k }))}
                  className={`glass-interactive w-full text-left rounded-lg px-3 py-2 border text-sm transition-all ${
                    isCorrect ? 'ci-border-success ci-bg-success-soft ci-text-success' :
                    isWrong ? 'border-[var(--ci-danger-bdr)] ci-bg-danger-soft ci-text-danger' :
                    selected ? 'ci-border-overlay-strong ci-bg-gold-soft ci-text' :
                    'ci-border-overlay ci-text-surface-soft ci-border-overlay-hover'
                  }`}
                >{opt}</button>
              );
            })}
          </div>
          <div className="text-[10px] uppercase tracking-widest ci-text-surface-ghost mt-2">Policy ref: {q.policyRef}</div>
        </div>
      ))}

      <div className="flex items-center gap-3 sticky bottom-0 pt-4 border-t ci-border-overlay ci-bg-overlay-soft">
        <button onClick={save}
          className="glass-interactive flex items-center gap-2 border ci-border-overlay rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest ci-text-surface-soft">
          <Save size={14} /> Save & Resume Later
        </button>
        {!submitted ? (
          <button onClick={submit}
            disabled={!allAnswered || !lessonsViewed}
            className="gradient-gold rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            <Play size={14} /> Submit Attempt
          </button>
        ) : (
          <div className={`flex items-center gap-2 text-sm font-bold ${passed ? 'ci-text-success' : 'ci-text-danger'}`}>
            {passed ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
            {passed ? `PASSED · ${score}%` : `FAILED · ${score}% (need ${threshold}%)`}
          </div>
        )}
      </div>
    </div>
  );
}

function BuiltInAcknowledge({ module }: { module: JourneyModule }) {
  const [acknowledged, setAcknowledged] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const submit = () => {
    const a = (window as unknown as { API?: Record<string, (k: string, v?: string) => string> }).API;
    if (!a) return;
    a.LMSInitialize('');
    a.LMSSetValue('cmi.core.lesson_status', 'completed');
    a.LMSSetValue('cmi.core.exit', 'normal');
    const sec = Math.floor((Date.now() - (startedAt.current || Date.now())) / 1000);
    a.LMSSetValue('cmi.core.session_time', secondsToScormTime(sec));
    a.LMSCommit('');
    a.LMSFinish('');
    setAcknowledged(true);
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={20} className="text-[#FFC107]" />
        <div className="text-xs font-montserrat font-bold uppercase tracking-widest text-[#FFC107]">
          {module.id} · Acknowledge & Attest
        </div>
      </div>
      <h2 className="text-xl font-montserrat font-bold text-white">{module.title}</h2>

      <div className="border border-white/10 rounded-xl p-4 bg-black/15 text-sm text-white/75 leading-relaxed space-y-3">
        <p>You have reviewed the training content for this module.</p>
        <p>Policy references: <span className="text-[#FFC107]">{module.policyRefs.join(', ') || '—'}</span></p>
        {module.cmsRefs.length > 0 && (
          <p>Regulatory references: <span className="text-[#FFC107]">{module.cmsRefs.join(', ')}</span></p>
        )}
        <p className="text-white/55 italic">
          By acknowledging, I attest that I have read and understand the policy, and I agree to comply with its
          provisions as a condition of employment.
        </p>
      </div>

      {!acknowledged ? (
        <button onClick={submit} className="gradient-gold rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest">
          Acknowledge & Submit
        </button>
      ) : (
        <div className="flex items-center gap-2 text-sm font-bold text-[#34D399]">
          <CheckCircle2 size={18} /> COMPLETED
        </div>
      )}
    </div>
  );
}
