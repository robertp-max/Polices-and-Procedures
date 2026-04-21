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
    return <BuiltInQuiz module={module} />;
  }
  return <BuiltInAcknowledge module={module} />;
}

/* ─────────────────────────────────────────────────────────────
   Built-in quiz shell — talks to window.API exactly like SCORM.
   ───────────────────────────────────────────────────────────── */
function BuiltInQuiz({ module }: { module: JourneyModule }) {
  const bank = useMemo(() => GAO_EXAM_ITEMS.slice(0, 5), []);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const startedAt = useRef(Date.now());

  const api = (): Record<string, (k: string, v?: string) => string> | null =>
    (window as unknown as { API?: Record<string, (k: string, v?: string) => string> }).API ?? null;

  useEffect(() => {
    const a = api();
    if (!a) return;
    a.LMSInitialize('');
    a.LMSSetValue('cmi.core.lesson_status', 'incomplete');
    a.LMSCommit('');
  }, []);

  const save = () => {
    const a = api();
    if (!a) return;
    a.LMSSetValue('cmi.suspend_data', JSON.stringify(answers));
    a.LMSSetValue('cmi.core.lesson_location', String(Object.keys(answers).length));
    const sessionSec = Math.floor((Date.now() - startedAt.current) / 1000);
    a.LMSSetValue('cmi.core.session_time', secondsToScormTime(sessionSec));
    a.LMSCommit('');
  };

  const submit = () => {
    const a = api();
    if (!a) return;
    const correct = bank.filter((q, i) => answers[i] === q.correct).length;
    const score = Math.round((correct / bank.length) * 100);
    const threshold = (module.passThreshold ?? 0.8) * 100;
    const passed = score >= threshold;

    a.LMSSetValue('cmi.core.score.raw', String(score));
    a.LMSSetValue('cmi.core.score.min', '0');
    a.LMSSetValue('cmi.core.score.max', '100');
    a.LMSSetValue('cmi.core.lesson_status', passed ? 'passed' : 'failed');
    a.LMSSetValue('cmi.core.exit', 'normal');
    const sessionSec = Math.floor((Date.now() - startedAt.current) / 1000);
    a.LMSSetValue('cmi.core.session_time', secondsToScormTime(sessionSec));
    a.LMSCommit('');
    a.LMSFinish('');
    setSubmitted(true);
  };

  const correctCount = bank.filter((q, i) => answers[i] === q.correct).length;
  const score = Math.round((correctCount / bank.length) * 100);
  const threshold = (module.passThreshold ?? 0.8) * 100;
  const passed = score >= threshold;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <BookOpen size={20} className="text-[#FFC107]" />
        <div className="text-xs font-montserrat font-bold uppercase tracking-widest text-[#FFC107]">
          {module.id} · {module.method}
        </div>
      </div>
      <h2 className="text-xl font-montserrat font-bold text-white">{module.title}</h2>

      {bank.map((q, i) => (
        <div key={i} className="border border-white/10 rounded-xl p-4 bg-black/15">
          <div className="text-sm text-white/80 mb-3">
            <span className="font-bold text-[#FFC107] mr-2">{i + 1}.</span>{q.q}
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
                    isCorrect ? 'border-[#34D399] bg-[#34D399]/10 text-[#34D399]' :
                    isWrong ? 'border-[#DC2626] bg-[#DC2626]/10 text-[#DC2626]' :
                    selected ? 'border-[#FFC107] bg-[#FFC107]/5 text-white' :
                    'border-white/10 text-white/70 hover:border-white/25'
                  }`}
                >{opt}</button>
              );
            })}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-white/35 mt-2">Policy ref: {q.policyRef}</div>
        </div>
      ))}

      <div className="flex items-center gap-3 sticky bottom-0 pt-4 border-t border-white/10 bg-gradient-to-t from-black/60 to-transparent">
        <button onClick={save}
          className="glass-interactive flex items-center gap-2 border border-white/15 rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/70">
          <Save size={14} /> Save & Resume Later
        </button>
        {!submitted ? (
          <button onClick={submit}
            disabled={Object.keys(answers).length !== bank.length}
            className="gradient-gold rounded-lg px-5 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2">
            <Play size={14} /> Submit Attempt
          </button>
        ) : (
          <div className={`flex items-center gap-2 text-sm font-bold ${passed ? 'text-[#34D399]' : 'text-[#DC2626]'}`}>
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
  const startedAt = useRef(Date.now());

  const submit = () => {
    const a = (window as unknown as { API?: Record<string, (k: string, v?: string) => string> }).API;
    if (!a) return;
    a.LMSInitialize('');
    a.LMSSetValue('cmi.core.lesson_status', 'completed');
    a.LMSSetValue('cmi.core.exit', 'normal');
    const sec = Math.floor((Date.now() - startedAt.current) / 1000);
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
