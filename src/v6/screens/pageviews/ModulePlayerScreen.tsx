import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useJourneyStore } from "@/policy/journey/stores/journeyStore";
import { canStartModule } from "@/policy/journey/utils/gating";
import { moduleById } from "@/policy/journey/data/modules";
import { DemoOnlyBanner } from "@/policy/journey/components/DemoOnlyBanner";
import {
  ArrowLeft,
  Check,
  Clock,
  ShieldAlert,
  Award,
  CheckCircle2,
  AlertTriangle,
  BookOpenCheck,
  ListChecks,
  Lock,
  Play,
  Repeat,
  Target,
  Volume2,
  VolumeX,
  FileText,
  Pause,
  ChevronDown,
  Sparkles,
  HeartPulse,
  ShieldCheck,
  UserCheck,
  ImageIcon,
  CheckSquare,
  Square,
  Eye,
  Search,
  Unlock,
  BookOpen,
} from "lucide-react";

import { useLearner } from "@/policy/journey/lib/learnerState";
import {
  isLessonComplete,
  isModuleComplete,
} from "@/policy/journey/lib/moduleProgress";
import { useUiState, formatHoursAndMins } from "@/policy/journey/lib/uiState";
import { useActiveTime, ACTIVE_TIME } from "@/policy/journey/lib/activeTime";
import {
  courseModules,
  getModuleDef,
  getGeneratedLesson,
  getModuleAssessment,
  getModuleQuizItems,
  getModuleQuizPassPct,
  scoreModuleQuiz,
  drawAttempt,
  scoreAttempt,
  EXAM,
  appCopy
} from "@/policy/journey/data/contentV2Adapter";
import { withLessonCompleted, withModuleAssessment, moduleAssessmentPassed } from "@/policy/journey/lib/v2state";
import { buildLessonRemediation, buildModuleRemediation, buildFinalRemediation } from "@/policy/journey/data/remediation";
import type { LessonRemediation, ModuleRemediation, RemediationChallenge } from "@/policy/journey/data/remediation";
import { hasMedia, mediaAltText, mediaAssetPath } from "@/policy/journey/data/mediaManifest";
import { hasNarrationAudio, narrationAssetPath } from "@/policy/journey/data/narrationManifest";
import { getTermsForSection } from "@/policy/journey/data/advancedTraining/cms485Terminology";
import { TRAINING_CARDS } from "@/policy/journey/data/advancedTraining/cms485SourceCards";
import { isAdvancedModule, getAdvancedVariant } from "@/policy/journey/data/advancedTraining/advancedTrainingContract";
import { AdvancedTrainingPlayer } from "@/policy/journey/components/advanced/AdvancedTrainingPlayer";
import { Cms485AssessmentQuizPage } from "./Cms485AssessmentQuizPage";


/* ==========================================================================
   SHARED PRIMITIVE COMPONENTS (Light Mode adapted)
   ========================================================================== */

function BackLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-brand-teal hover:text-brand-teal-deep inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider"
    >
      <ArrowLeft size={14} /> {children}
    </Link>
  );
}

function MediaSlot({ appLocation, sceneTitle }: { appLocation: string; sceneTitle?: string }) {
  const ready = hasMedia(appLocation);
  const alt = mediaAltText(sceneTitle);
  if (ready) {
    return (
      <div className="w-full aspect-video bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-lg overflow-hidden shadow-sm mb-4">
        <img src={mediaAssetPath(appLocation)} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className="w-full aspect-video rounded-lg relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-tone-teal-bg to-tone-slate-bg border border-tone-teal-border/40"
    >
      <div className="absolute top-3 left-3 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-tone-orange-border/30 rounded px-2 py-0.5 text-[9px] font-mono text-brand-orange uppercase tracking-wider">
        Visual Aid Pending
      </div>
      <div className="w-16 h-16 rounded-full border border-tone-teal-border/30 bg-surface-glass backdrop-blur-md shadow-glass-inset flex items-center justify-center text-brand-teal shadow-sm">
        <ImageIcon size={28} />
      </div>
      {sceneTitle && (
        <div className="text-[10px] font-mono text-secondary uppercase mt-3 tracking-widest px-6 text-center max-w-md leading-relaxed">
          {sceneTitle}
        </div>
      )}
      <div className="absolute bottom-2 right-3 text-[8px] font-mono text-muted uppercase tracking-wider">
        Training Visual Placeholder · No PHI
      </div>
    </div>
  );
}

function NarrationPlayer({
  appLocation,
  transcript,
  label = "Lesson Narration",
  estSeconds,
}: {
  appLocation: string;
  transcript: string;
  label?: string;
  estSeconds?: number;
}) {
  const audioReady = hasNarrationAudio(appLocation);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
    };
  }, [appLocation, speechSupported]);

  const toggleAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const toggleSpeech = () => {
    if (!speechSupported) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    setTimeout(() => {
      const utter = new SpeechSynthesisUtterance(transcript);
      utter.rate = 0.95;
      utter.onend = () => setSpeaking(false);
      utter.onerror = (e) => {
        console.error("SpeechSynthesis error:", e);
        setSpeaking(false);
      };
      setSpeaking(true);
      window.speechSynthesis.speak(utter);
    }, 50);
  };

  return (
    <div className="px-6 py-4 bg-surface-glass backdrop-blur-md shadow-glass-inset border-t border-hairline rounded-b-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {audioReady ? (
            <button
              onClick={toggleAudio}
              className="w-10 h-10 rounded-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-tone-teal-border/40 flex items-center justify-center text-brand-teal hover:bg-surface-hover transition-colors shrink-0 shadow-sm"
              aria-label={playing ? "Pause narration" : "Play narration"}
            >
              {playing ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
            </button>
          ) : (
            <div
              className="w-10 h-10 rounded-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline flex items-center justify-center text-muted shrink-0 shadow-sm"
              title="Narration audio asset pending approval"
              aria-disabled
            >
              <Play size={16} className="ml-0.5 text-muted" />
            </div>
          )}
          <div>
            <span className="text-xs font-semibold text-brand-teal-deep block">{label}</span>
            <span className="text-[10px] text-secondary font-mono block">
              {audioReady
                ? playing
                  ? "Playing approved audio"
                  : "Approved audio ready"
                : `Audio asset pending${estSeconds ? ` · ${estSeconds}s clip` : ""}`}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!audioReady && speechSupported && !appLocation.startsWith("cms-485") && (
            <button
              onClick={toggleSpeech}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                speaking
                  ? "bg-tone-teal-bg text-brand-teal border-tone-teal-border font-bold shadow-sm"
                  : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline text-secondary hover:bg-surface-hover"
              }`}
              title="Browser preview only — not approved production audio"
            >
              {speaking ? <VolumeX size={12} /> : <Volume2 size={12} />} {speaking ? "Stop Preview" : "Browser Preview"}
            </button>
          )}
          <button
            onClick={() => setShowTranscript((t) => !t)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
              showTranscript
                ? "bg-tone-teal-bg text-brand-teal border-tone-teal-border font-bold shadow-sm"
                : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline text-secondary hover:bg-surface-hover"
            }`}
          >
            <FileText size={12} /> Transcript
          </button>
        </div>
      </div>

      {audioReady && <audio ref={audioRef} src={narrationAssetPath(appLocation)} onEnded={() => setPlaying(false)} preload="none" />}

      {!audioReady && (
        <p className="text-[10px] text-muted font-mono mt-2">
          Narration audio is not yet authorized for production. The transcript below is the accessible source of record.
        </p>
      )}

      {showTranscript && (
        <div className="mt-3 px-4 py-3 bg-surface-glass backdrop-blur-md shadow-glass-inset text-secondary text-xs italic leading-relaxed border border-hairline rounded-lg whitespace-pre-line shadow-sm">
          {transcript}
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <h4 className="text-[10px] uppercase font-bold text-muted font-mono tracking-wider flex items-center gap-1.5">
        <span className="text-brand-orange">{icon}</span>
        {title}
      </h4>
      <p className="text-xs text-secondary leading-relaxed">{children}</p>
    </div>
  );
}

function ChallengeDebrief({
  remediation,
  selectedId,
  openedIds,
  onOpen,
}: {
  remediation: LessonRemediation;
  selectedId: string | null;
  openedIds: string[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest font-mono flex items-center gap-1.5">
          <Sparkles size={12} /> {remediation.title}
        </span>
        <p className="text-[11px] text-muted font-mono">{remediation.submittedNote}</p>
      </div>

      <div className="rounded-lg border border-tone-teal-border/30 bg-tone-teal-bg/10 p-4 space-y-4">
        <Section icon={<ShieldCheck size={12} />} title="Safety Principle">
          {remediation.safetyPrinciple}
        </Section>

        <div className="rounded-lg border border-tone-teal-border bg-tone-teal-bg/30 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal border border-tone-teal-border uppercase tracking-wider">
              Safest Response
            </span>
          </div>
          <p className="text-xs text-brand-teal-deep font-semibold leading-relaxed">{remediation.safestResponseLabel}</p>
          <div className="pt-1">
            <h5 className="text-[10px] uppercase font-bold text-brand-teal-deep/90 font-mono tracking-wider mb-1">Why This Is Safest</h5>
            <p className="text-xs text-secondary leading-relaxed">{remediation.whySafest}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset/30 p-4">
          <Section icon={<UserCheck size={12} />} title="CNA Scope Note">{remediation.cnaScopeNote}</Section>
        </div>
        <div className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset/30 p-4">
          <Section icon={<HeartPulse size={12} />} title="Resident Safety Note">{remediation.residentSafetyNote}</Section>
        </div>
      </div>

      <div className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset/30 p-4">
        <Section icon={<BookOpenCheck size={12} />} title="What to Remember">{remediation.whatToRemember}</Section>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs uppercase font-bold text-brand-teal-deep font-mono tracking-wider">Option Review</h4>
        <p className="text-[11px] text-muted leading-relaxed">
          Open the safest response and your own choice to finish the debrief. Each option is a teaching point, not a graded answer.
        </p>
        <div className="space-y-2.5">
          {remediation.options.map((opt) => {
            const open = openedIds.includes(opt.id);
            const isSafest = opt.status === "safest";
            const isYours = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onOpen(opt.id)}
                className={`w-full text-left p-4 rounded-lg border text-xs transition-all ${
                  open
                    ? isSafest
                      ? "bg-tone-teal-bg border-tone-teal-border"
                      : "bg-tone-orange-bg border-tone-orange-border"
                    : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline hover:bg-surface-hover shadow-sm"
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider shrink-0 border ${
                        isSafest
                          ? "bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-teal border-tone-teal-border"
                          : "bg-surface-glass backdrop-blur-md shadow-glass-inset text-brand-orange border-tone-orange-border"
                      }`}
                    >
                      {isSafest ? "Safest Response" : "Needs Review"}
                    </span>
                    <span className="font-semibold text-brand-teal-deep truncate">
                      {opt.id}. {opt.label}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-[10px] text-muted font-mono shrink-0">
                    {isYours && <span className="text-brand-orange font-bold">Your choice</span>}
                    <ChevronDown size={13} className={`transition-transform ${open ? "rotate-180 text-brand-teal" : ""}`} />
                  </span>
                </div>
                {open && (
                  <div className="space-y-2 pt-1.5 pl-1">
                    <p className="text-secondary leading-relaxed">{opt.why}</p>
                    <p className="text-[11px] text-muted leading-relaxed">
                      <span className="font-semibold text-secondary">Remember:</span> {opt.remember}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   QUIZ RUNNER COMPONENT
   ========================================================================== */

type QuizChoice = { id: string; label: string };
type QuizQuestion = { id: string; prompt: string; choices: QuizChoice[] };

function QuizRunner({
  questions,
  label,
  onSubmit,
}: {
  questions: QuizQuestion[];
  label: string;
  onSubmit: (answers: Record<string, string>) => void;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[currentIdx];
  const allAnswered = questions.every((item) => answers[item.id]);
  const isLast = currentIdx === questions.length - 1;

  return (
    <div className="max-w-2xl ml-0 mr-auto space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-hairline font-mono text-xs text-muted">
        <span>Question {currentIdx + 1} of {questions.length}</span>
        <span>{label}</span>
      </div>

      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl space-y-6">
        <div>
          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest font-mono">Select One Response</span>
          <h2 className="text-base font-semibold text-brand-teal-deep mt-1 leading-relaxed">{q.prompt}</h2>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {q.choices.map((opt) => {
            const selected = answers[q.id] === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt.id }))}
                className={`w-full text-left p-4 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                  selected
                    ? "bg-tone-teal-bg border-brand-teal text-brand-teal-deep font-semibold"
                    : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline hover:border-brand-teal/20 text-secondary shadow-sm"
                }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${selected ? "bg-brand-teal text-on-brand border-brand-teal" : "border-hairline text-muted"}`}>{opt.id}</div>
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline p-3 rounded-lg text-[10px] text-muted font-mono leading-relaxed">
          Compliance guardrail: responses are recorded silently. No correct-answer key is shown during or after the exam.
        </div>

        <div className="pt-4 border-t border-hairline flex justify-between">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 text-xs font-semibold text-secondary hover:text-brand-teal-deep disabled:opacity-35 uppercase tracking-wider"
          >
            Back
          </button>

          {!isLast ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              disabled={!answers[q.id]}
              className="bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal border border-tone-teal-border font-bold px-5 py-2 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => onSubmit(answers)}
              disabled={!allAnswered}
              className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40"
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MODULE REMEDIATION PANEL COMPONENT
   ========================================================================== */

function ModuleRemediationPanel({
  scorePct,
  passPct,
  remediation,
  onRetry,
  onStudyAgain,
}: {
  scorePct: number;
  passPct: number;
  remediation: ModuleRemediation;
  onRetry: () => void;
  onStudyAgain: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(remediation.retryReadiness.map(() => false));
  const ready = checked.every(Boolean);

  return (
    <div className="max-w-2xl ml-0 mr-auto space-y-5">
      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl space-y-6 text-left">
        <div className="space-y-3">
          <span className="text-[10px] uppercase font-bold text-brand-orange font-mono tracking-widest bg-tone-orange-bg px-2 py-0.5 rounded border border-tone-orange-border">
            Required Theory Remediation
          </span>
          <h1 className="text-2xl font-bold text-brand-teal-deep">Module Review Before Retry</h1>
          <div className="inline-flex items-center gap-2 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline px-4 py-1.5 rounded-lg font-mono text-xs text-secondary">
            <span>Recorded score</span>
            <strong className="text-brand-orange">{scorePct}%</strong>
            <span className="text-muted">· need {passPct}%</span>
          </div>
        </div>

        {/* Remediation Overview */}
        <div className="space-y-1.5">
          <h4 className="text-[10px] uppercase font-bold text-brand-teal-deep font-mono tracking-wider flex items-center gap-1.5">
            <Target size={12} className="text-brand-orange" /> Remediation Overview
          </h4>
          <p className="text-xs text-secondary leading-relaxed">{remediation.overview}</p>
        </div>

        {/* Missed Topic Review Cards */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] uppercase font-bold text-brand-teal-deep font-mono tracking-wider flex items-center gap-1.5">
            <BookOpenCheck size={12} className="text-brand-orange" /> Missed Topic Review
          </h4>
          <div className="grid grid-cols-1 gap-2.5">
            {remediation.missedTopics.map((topic) => (
              <div key={topic.title} className="p-4 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-sm">
                <h5 className="text-xs font-semibold text-brand-teal-deep mb-1">{topic.title}</h5>
                <p className="text-[11px] text-secondary leading-relaxed">{topic.review}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Practice Scenario */}
        <div className="rounded-lg border border-tone-orange-border/30 bg-tone-orange-bg/10 p-4 space-y-1.5">
          <h4 className="text-[10px] uppercase font-bold text-brand-orange font-mono tracking-wider">Practice Scenario</h4>
          <p className="text-xs text-brand-teal-deep font-semibold leading-relaxed">{remediation.practiceScenario.prompt}</p>
          <p className="text-[11px] text-secondary leading-relaxed">{remediation.practiceScenario.guidance}</p>
        </div>

        {/* Retry Readiness Check */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] uppercase font-bold text-brand-teal-deep font-mono tracking-wider flex items-center gap-1.5">
            <ListChecks size={12} className="text-brand-orange" /> Retry Readiness Check
          </h4>
          <div className="space-y-2">
            {remediation.retryReadiness.map((item, idx) => (
              <label key={item} className="flex items-start gap-2.5 p-3 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset cursor-pointer hover:border-brand-teal/20 shadow-sm transition-colors">
                <input
                  type="checkbox"
                  checked={checked[idx]}
                  onChange={() => setChecked((cur) => cur.map((v, i) => (i === idx ? !v : v)))}
                  className="mt-0.5 accent-brand-teal"
                />
                <span className="text-[11px] text-secondary leading-relaxed">{item}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row justify-start gap-3">
          <button
            onClick={onRetry}
            disabled={!ready}
            className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 shadow-pill-action"
          >
            <Repeat size={14} /> {remediation.retryLabel}
          </button>
          <button
            onClick={onStudyAgain}
            className="bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal border border-tone-teal-border font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
          >
            Reopen Module Lesson
          </button>
        </div>
        {!ready && (
          <p className="text-[11px] text-muted font-mono text-left">Confirm each readiness item to unlock the retry.</p>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE: MODULE 0 ORIENTATION PAGE
   ========================================================================== */

const acks0 = appCopy.module0.acknowledgements as readonly { key: "orientationFinalAck" | "phiAck" | "onlineCapAck"; text: string }[];

function Module0OrientationPage() {
  const navigate = useNavigate();
  const { state, update } = useLearner();
  const allAgreed = acks0.every((a) => state[a.key]);

  return (
    <div className="max-w-3xl ml-0 mr-auto space-y-6">
      <BackLink to="/journey">Back to Modules</BackLink>

      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-10 shadow-rest backdrop-blur-xl space-y-6">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-brand-orange font-bold mb-1 font-mono">{appCopy.module0.eyebrow}</div>
          <h1 className="text-3xl font-bold text-brand-teal-deep tracking-tight">{appCopy.module0.title}</h1>
          <p className="text-xs text-secondary leading-relaxed mt-1">{appCopy.module0.intro}</p>
        </div>

        <div className="space-y-4 pt-4 border-t border-hairline">
          <h3 className="text-xs uppercase tracking-wider font-bold text-brand-teal-deep">1. Verification of Legal CNA Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-bold text-muted mb-1 font-mono">First Name (Legal)</label>
              <input
                type="text"
                value={state.legalFirstName}
                onChange={(e) => update("legalFirstName", e.target.value)}
                className="w-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline text-secondary text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-brand-teal shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-muted mb-1 font-mono">Last Name (Legal)</label>
              <input
                type="text"
                value={state.legalLastName}
                onChange={(e) => update("legalLastName", e.target.value)}
                className="w-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline text-secondary text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-brand-teal shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-bold text-muted mb-1 font-mono">CNA Certificate Number</label>
              <input
                type="text"
                value={state.cnaNumber}
                onChange={(e) => update("cnaNumber", e.target.value)}
                className="w-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline text-secondary text-xs px-3 py-2 rounded-lg font-mono focus:outline-none focus:border-brand-teal shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-hairline">
          <h3 className="text-xs uppercase tracking-wider font-bold text-brand-teal-deep">2. Mandatory Declarations &amp; Acknowledgements</h3>
          {acks0.map((ack) => {
            const checked = state[ack.key];
            return (
              <button
                key={ack.key}
                type="button"
                onClick={() => update(ack.key, !checked)}
                aria-pressed={checked}
                className={`w-full text-left p-4 rounded-lg border flex items-start gap-3 transition-colors ${
                  checked
                    ? "bg-tone-teal-bg border-brand-teal text-brand-teal-deep font-semibold"
                    : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline hover:border-brand-teal/20 text-secondary shadow-sm"
                }`}
              >
                <div className="mt-0.5 text-brand-teal shrink-0">{checked ? <CheckSquare size={16} /> : <Square size={16} />}</div>
                <p className="text-xs leading-relaxed">{ack.text}</p>
              </button>
            );
          })}
        </div>

        <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-muted font-medium">{!allAgreed && "Select all 3 acknowledgements to proceed."}</div>
          <button
            disabled={!allAgreed}
            onClick={() => navigate("/journey")}
            className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold py-2.5 px-6 rounded-lg uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm &amp; Unlock Module 1
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE: MODULE OVERVIEW / OUTLINE PAGE (M10-M17)
   ========================================================================== */

function Module1OverviewPage() {
  const navigate = useNavigate();
  const { moduleId = "m1" } = useParams();
  const { state } = useLearner();
  const module = getModuleDef(moduleId);
  const moduleDone = module ? isModuleComplete(state, module.id) : false;
  const moduleExam = moduleAssessmentPassed(state, moduleId);

  if (!module) return null;

  return (
    <div className="max-w-3xl ml-0 mr-auto space-y-6">
      <BackLink to="/journey">Back to Modules</BackLink>

      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-hairline">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-orange font-mono">
              {module.code} - {module.time} Theory
            </span>
            <h1 className="text-2xl font-bold text-brand-teal-deep tracking-tight">{module.shortTitle}</h1>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold shadow-glass-inset ${
            moduleExam
              ? "bg-tone-green-bg text-tone-green-text"
              : module.status === "sme-review"
              ? "bg-tone-orange-bg text-brand-orange"
              : "bg-tone-teal-bg text-brand-teal"
          }`}>
            {moduleExam ? "Assessment Passed" : module.status === "sme-review" ? "SME Review Flagged" : "Not Attempted"}
          </span>
        </div>

        <div className="py-6 space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-brand-teal-deep">Lesson Objectives</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {module.learningObjectives.map((obj) => (
              <div key={obj} className="rounded-md bg-surface-glass shadow-glass-inset p-3 text-xs text-secondary leading-relaxed">
                {obj}
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-brand-teal-deep mb-3">Course Component Lessons</h3>

          {/* Grid of sub-cards (no borders, with shadows) — more like Framework inner stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {module.lessons.map((item) => {
              const complete = isLessonComplete(state, module.id, item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(`/journey/module/${module.id}/lesson/${item.id}`)}
                  className="text-left rounded-lg bg-surface-glass backdrop-blur-md shadow-glass-inset p-4 hover:shadow-hover transition-all flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-[10px] font-mono uppercase tracking-widest text-muted">Lesson {item.index}</div>
                      <h4 className="text-sm font-semibold text-brand-teal-deep mt-0.5 leading-tight">{item.title}</h4>
                    </div>
                    {complete ? (
                      <span className="text-[10px] text-brand-teal font-semibold shrink-0">Done</span>
                    ) : (
                      <span className="text-[10px] text-brand-orange font-semibold shrink-0">Play</span>
                    )}
                  </div>

                  <div className="text-[10px] text-muted">
                    {item.estMinutes} min • ACHC source-backed
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="text-xs text-muted font-medium">
            {moduleDone ? "All lessons complete. Continue to the module assessment." : "Complete each lesson to unlock the module assessment."}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            {moduleDone && (
              <button
                onClick={() => navigate(`/journey/module/${module.id}/assessment`)}
                className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
              >
                Start {appCopy.moduleAssessment.title}
              </button>
            )}
            <button
              onClick={() => navigate(`/journey/module/${module.id}/lesson/${module.lessons[0]?.id ?? "l1"}`)}
              className="w-full sm:w-auto bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
            >
              {moduleDone ? "Review Theory" : "Start Theory"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE: LESSON SLIDE PLAYER
   ========================================================================== */

function buildStepLabels(cards: readonly { card_type?: string; internal_challenge?: unknown }[]): string[] {
  const totalDelivery = cards.filter((c) => c.card_type === "delivery").length;
  let deliveryIdx = 0;
  return cards.map((card) => {
    if (card.card_type === "overview") return "Overview";
    if (card.card_type === "delivery") {
      deliveryIdx += 1;
      return totalDelivery > 1 ? `Learn Part ${deliveryIdx}` : "Learn";
    }
    if (card.internal_challenge || card.card_type === "challenge") return "Practice";
    if (card.card_type === "debrief") return "Review";
    return "Complete";
  });
}

function LessonPlayerPage() {
  const navigate = useNavigate();
  const { moduleId = "m1", lessonId = "l1" } = useParams();
  const { setState } = useLearner();
  const { demoSeconds, reviewerOpen } = useUiState();
  const lesson = getGeneratedLesson(moduleId, lessonId);
  const cards = useMemo(() => lesson?.cards ?? [], [lesson]);
  const stepLabels = useMemo(() => buildStepLabels(cards), [cards]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [openedOptions, setOpenedOptions] = useState<string[]>([]);
  const [acknowledgedTerms, setAcknowledgedTerms] = useState<Set<number>>(new Set());

  useEffect(() => {
    setAcknowledgedTerms(new Set());
    setSelectedAnswer(null);
    setSubmitted(false);
    setOpenedOptions([]);
    setCurrentIdx(0);
  }, [moduleId, lessonId]);

  const { lessonSeconds, idleWarning, resume, meetsLessonMinimum } = useActiveTime(moduleId, lessonId);

  const challengeCard = useMemo(() => cards.find((card: any) => card.internal_challenge), [cards]);
  const challenge = (challengeCard?.internal_challenge ?? null) as RemediationChallenge | null;
  const remediation = useMemo(() => (challenge ? buildLessonRemediation(challenge) : null), [challenge]);

  if (!lesson || cards.length === 0) {
    return (
      <div className="bg-surface-glass border border-hairline rounded-xl p-6 text-secondary shadow-rest backdrop-blur-xl">
        ContentV2 lesson data is unavailable for {moduleId.toUpperCase()} {lessonId.toUpperCase()}.
      </div>
    );
  }

  const currentCard = cards[currentIdx];
  const isChallengeCard = Boolean(currentCard.internal_challenge);
  const isDebriefCard = currentCard.card_type === "debrief";
  const isLast = currentIdx === cards.length - 1;

  const isCms485 = moduleId === "cms-485";
  const terms = getTermsForSection(lesson.title);
  const allTermsAcked = terms.every((t) => acknowledgedTerms.has(t.id));
  const isTerminologyCard = isCms485 && currentCard.card_type === "delivery";

  // Read-before-continue gating logic:
  const requiredReads = remediation
    ? Array.from(new Set([remediation.safestId, selectedAnswer].filter(Boolean) as string[]))
    : [];
  const debriefReadDone = requiredReads.every((id) => openedOptions.includes(id));

  const canContinue = isChallengeCard
    ? submitted
    : isDebriefCard
    ? debriefReadDone
    : isTerminologyCard
    ? allTermsAcked
    : isLast
    ? meetsLessonMinimum
    : true;

  const continueLabel = useMemo(() => {
    if (!isCms485) {
      return isLast ? "Complete Theory Lesson" : isDebriefCard ? remediation?.continueLabel ?? "Continue" : "Continue";
    }
    if (currentCard.card_type === "overview") return "Next: Terminology";
    if (currentCard.card_type === "delivery") return "Proceed to Challenge";
    if (isChallengeCard) return "Continue";
    if (isDebriefCard) return "Complete Theory Lesson";
    return "Continue";
  }, [isCms485, currentCard, isLast, isDebriefCard, isChallengeCard, remediation]);

  const handleNext = () => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((idx) => idx + 1);
      return;
    }
    setState((s) => withLessonCompleted(s, moduleId, lessonId));
    // P0-001 bridge for lesson complete
    try { const j = useJourneyStore.getState(); j.recordLearnerCompletion(j.currentEmployeeId, moduleId, true); } catch {}
    navigate(`/journey/module/${moduleId}`);
  };

  const challengeChoices = (challenge?.choices ?? []) as { id: string; label: string }[];

  return (
    <div className="space-y-6">
      {/* Idle warning overlay */}
      {idleWarning && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset rounded-xl border border-hairline shadow-glass p-6 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-tone-orange-bg border border-tone-orange-border text-brand-orange flex items-center justify-center mx-auto">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold text-brand-teal-deep">Are you still studying?</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Study time accrual has paused due to inactivity. Click below to resume your lesson progress.
            </p>
            <button
              onClick={resume}
              className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange/95 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
            >
              Resume Learning
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
        <button
          onClick={() => navigate(`/journey/module/${moduleId}`)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-teal hover:text-brand-teal-deep transition-colors"
        >
          <ArrowLeft size={14} /> Close Lesson Player
        </button>
        <div className="flex items-center gap-4 text-xs font-mono text-secondary">
          <span className="flex items-center gap-1"><Clock size={12} className="text-brand-orange" /> Lesson Session: {lesson.estMinutes}m</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-brand-teal">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-teal" /> Active study time: {formatHoursAndMins(lessonSeconds)}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-brand-orange">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange" /> Cumulative clock (demo): {formatHoursAndMins(demoSeconds)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset overflow-x-auto shadow-sm">
        {cards.map((card: any, idx: number) => (
          <div key={card.app.location} className="flex items-center gap-3 shrink-0 mx-2">
            <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold ${
              currentIdx === idx
                ? "bg-brand-orange border-brand-orange text-white"
                : currentIdx > idx
                ? "bg-tone-teal-bg text-brand-teal border-tone-teal-border"
                : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline text-muted"
            }`}>
              {currentIdx > idx ? <Check size={10} /> : idx + 1}
            </div>
            <span className={`text-[11px] font-semibold uppercase tracking-wider ${currentIdx === idx ? "text-brand-orange" : "text-muted"}`}>
              {stepLabels[idx]}
            </span>
            {idx < cards.length - 1 && <div className="w-6 h-px bg-hairline" />}
          </div>
        ))}
      </div>

      <div className="border border-hairline bg-surface-glass rounded-xl overflow-hidden flex flex-col min-h-[500px] shadow-rest backdrop-blur-xl isolate">
        <div className="p-6 md:p-8 flex-1 space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-muted">
              {stepLabels[currentIdx]} · Step {currentIdx + 1} of {cards.length}
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-1 text-brand-teal-deep">{currentCard.display_title}</h2>
            {reviewerOpen && (
              <p className="text-[11px] font-mono mt-1 text-muted">
                {currentCard.module_id} · {currentCard.lesson_id} · {currentCard.card_id} · {currentCard.app.location}
              </p>
            )}
          </div>

          <MediaSlot appLocation={currentCard.app.location} sceneTitle={currentCard.media_prompt_placeholder.scene_title} />

          {isCms485 ? (
            <>
              {currentCard.card_type === "overview" && (() => {
                const bullets = currentCard.learner_facing_content.split("\n").filter(Boolean);
                const sourceCard = TRAINING_CARDS.find((c) => c.title === lesson.title || c.title === currentCard.display_title);
                const auditFocusText = sourceCard?.auditFocus;
                return (
                  <div className="space-y-6">
                    <div className="border border-tone-teal-border/30 bg-tone-teal-bg/10 p-4 rounded-xl flex gap-3 items-start">
                      <div className="w-8 h-8 rounded bg-brand-teal/10 border border-brand-teal/20 text-brand-teal flex items-center justify-center shrink-0">
                        <Target size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-brand-teal-deep uppercase font-mono tracking-wider">Objective</h4>
                        <p className="text-xs leading-relaxed text-secondary mt-1">{currentCard.learning_goal}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-brand-teal-deep uppercase font-mono tracking-wider">Key Points</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {bullets.map((bullet: string, bIdx: number) => (
                          <div key={bIdx} className="border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-4 rounded-xl flex gap-3 hover:border-brand-teal/30 transition-all duration-300">
                            <div className="w-5 h-5 rounded-full bg-brand-teal/10 border border-brand-teal/20 text-brand-teal-deep text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                              {bIdx + 1}
                            </div>
                            <p className="text-[11px] leading-relaxed text-secondary">{bullet}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {auditFocusText && (
                      <div className="border border-tone-orange-border/30 bg-tone-orange-bg/10 p-4 rounded-xl flex gap-3 items-start">
                        <div className="w-8 h-8 rounded bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center shrink-0">
                          <Search size={18} />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-brand-orange uppercase font-mono tracking-wider">Audit Focus</h4>
                          <p className="text-xs leading-relaxed text-secondary mt-1">{auditFocusText}</p>
                        </div>
                      </div>
                    )}

                    <div className="border border-hairline bg-surface-glass/40 p-4 rounded-xl space-y-2">
                      <h5 className="text-[10px] uppercase font-bold tracking-widest font-mono text-muted">Additional Context Transcript</h5>
                      <p className="text-[11px] leading-relaxed text-secondary whitespace-pre-line">
                        {currentCard.narration_script || currentCard.transcript_text}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {currentCard.card_type === "delivery" && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-brand-teal-deep flex items-center gap-1.5">
                      <BookOpen size={16} /> Key Terminology — {lesson.title}
                    </h3>
                    <p className="text-[11px] text-muted">
                      Review each term below and confirm your understanding before proceeding.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {terms.map((t) => {
                      const isAcked = acknowledgedTerms.has(t.id);
                      return (
                        <div
                          key={t.id}
                          className={`border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between min-h-[120px] ${
                            isAcked
                              ? "bg-tone-teal-bg/20 border-brand-teal/40 shadow-sm"
                              : "bg-surface-glass border-hairline shadow-glass-inset shadow-sm"
                          }`}
                        >
                          <div>
                            <h4 className="text-xs font-bold text-brand-teal-deep">{t.term}</h4>
                            <p className="text-[11px] leading-relaxed text-secondary mt-1">{t.def}</p>
                          </div>
                          <button
                            onClick={() => {
                              setAcknowledgedTerms((prev) => {
                                const next = new Set(prev);
                                if (prev.has(t.id)) next.delete(t.id);
                                else next.add(t.id);
                                return next;
                              });
                            }}
                            className={`mt-4 self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              isAcked
                                ? "bg-brand-teal text-white animate-fade-in"
                                : "bg-brand-teal/10 text-brand-teal-deep border border-brand-teal/20 hover:bg-brand-teal/20"
                            }`}
                          >
                            {isAcked ? <Check size={10} /> : <Eye size={10} />}
                            {isAcked ? "Understood" : "I Understand"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isChallengeCard && challenge && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2">
                    <Target size={18} className="text-brand-orange" />
                    <h3 className="text-sm font-bold text-brand-teal-deep">Scenario Practice</h3>
                  </div>

                  <div className="border border-brand-orange/20 bg-tone-orange-bg/10 p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-brand-orange uppercase font-mono tracking-wider mb-1">📋 Clinical Scenario</p>
                    <p className="text-xs leading-relaxed text-secondary">{currentCard.learner_facing_content}</p>
                  </div>

                  <p className="text-xs font-semibold text-brand-teal-deep">{challenge.prompt}</p>

                  <div className="grid grid-cols-1 gap-2.5">
                    {challengeChoices.map((ans) => {
                      const isSelected = selectedAnswer === ans.id;
                      return (
                        <button
                          key={ans.id}
                          onClick={() => !submitted && setSelectedAnswer(ans.id)}
                          disabled={submitted}
                          className={`w-full text-left p-4 rounded-xl border text-xs flex items-start gap-3 transition-all duration-200 ${
                            isSelected
                              ? "bg-tone-teal-bg border-brand-teal text-brand-teal-deep font-semibold"
                              : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline hover:border-brand-teal/20 text-secondary shadow-sm"
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isSelected
                              ? "bg-brand-teal text-white border-brand-teal"
                              : "border-hairline text-muted"
                          }`}>{ans.id}</div>
                          <span className="leading-snug">{ans.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {!submitted && (
                    <button
                      onClick={() => setSubmitted(true)}
                      disabled={!selectedAnswer}
                      className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Submit Response
                    </button>
                  )}
                  {submitted && (
                    <p className="text-[11px] font-mono text-brand-teal font-bold flex items-center gap-1.5">
                      <Unlock size={12} /> Response submitted. Click "Continue" to review the explanation.
                    </p>
                  )}
                </div>
              )}

              {isDebriefCard && remediation && (
                <>
                  <ChallengeDebrief
                    remediation={remediation}
                    selectedId={selectedAnswer}
                    openedIds={openedOptions}
                    onOpen={(id) => setOpenedOptions((cur) => (cur.includes(id) ? cur : [...cur, id]))}
                  />
                  {!debriefReadDone && (
                    <p className="text-[11px] font-mono text-brand-orange font-bold">
                      Review the safest response{selectedAnswer && selectedAnswer !== remediation.safestId ? " and your own choice" : ""} in the option review to unlock lesson completion.
                    </p>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {currentCard.card_type === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-bold font-mono tracking-wider text-brand-teal-deep">Learning Goal</h4>
                    <p className="text-xs leading-relaxed text-secondary">{currentCard.learning_goal}</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-bold font-mono tracking-wider text-brand-teal-deep">Why It Matters</h4>
                    <ul className="space-y-1.5 text-xs leading-relaxed text-secondary list-disc pl-4">
                      {currentCard.why_it_matters.map((item: string) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
              )}

              {currentCard.card_type === "delivery" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-xs uppercase font-bold font-mono tracking-wider text-brand-teal-deep">Lesson Content</h4>
                    {currentCard.learner_facing_content.includes("<") && currentCard.learner_facing_content.includes(">") ? (
                      <div
                        className="text-xs leading-relaxed text-secondary space-y-2"
                        dangerouslySetInnerHTML={{ __html: currentCard.learner_facing_content }}
                      />
                    ) : (
                      <p className="text-xs leading-relaxed whitespace-pre-line text-secondary">{currentCard.learner_facing_content}</p>
                    )}
                  </div>
                  {currentCard.cna_practice_example && (
                    <div className="p-3 border border-tone-orange-border/30 bg-tone-orange-bg/10 rounded-lg">
                      <p className="text-[11px] leading-relaxed text-secondary">
                        <strong>CNA practice example:</strong> {currentCard.cna_practice_example}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isChallengeCard && challenge && (
                <div className="space-y-4">
                  <p className="text-xs leading-relaxed font-semibold text-brand-teal-deep">{challenge.prompt}</p>
                  <div className="grid grid-cols-1 gap-2.5">
                    {challengeChoices.map((ans) => (
                      <button
                        key={ans.id}
                        onClick={() => !submitted && setSelectedAnswer(ans.id)}
                        disabled={submitted}
                        className={`w-full text-left p-4 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                          selectedAnswer === ans.id
                            ? "bg-tone-teal-bg border-brand-teal text-brand-teal-deep font-semibold"
                            : "bg-surface-glass backdrop-blur-md shadow-glass-inset border-hairline hover:border-brand-teal/20 text-secondary shadow-sm"
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          selectedAnswer === ans.id
                            ? "bg-brand-teal text-white border-brand-teal"
                            : "border-hairline text-muted"
                        }`}>{ans.id}</div>
                        <span>{ans.label}</span>
                      </button>
                    ))}
                  </div>
                  {!submitted && (
                    <button
                      onClick={() => setSubmitted(true)}
                      disabled={!selectedAnswer}
                      className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Submit Response
                    </button>
                  )}
                  {submitted && (
                    <p className="text-[11px] font-mono text-brand-orange/90 font-bold">Your response has been submitted. Continue to the Challenge Debrief.</p>
                  )}
                </div>
              )}

              {isDebriefCard && remediation && (
                <>
                  <ChallengeDebrief
                    remediation={remediation}
                    selectedId={selectedAnswer}
                    openedIds={openedOptions}
                    onOpen={(id) => setOpenedOptions((cur) => (cur.includes(id) ? cur : [...cur, id]))}
                  />
                  {!debriefReadDone && (
                    <p className="text-[11px] font-mono text-brand-orange font-bold">
                      Review the safest response{selectedAnswer && selectedAnswer !== remediation.safestId ? " and your own choice" : ""} in the option review to unlock lesson completion.
                    </p>
                  )}
                </>
              )}
            </>
          )}

          {!isDebriefCard && currentCard.key_terms && currentCard.key_terms.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {currentCard.key_terms.slice(0, 3).map((term: any) => (
                <div key={term.term} className="border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-3 rounded-lg shadow-sm">
                  <h4 className="text-[10px] uppercase font-bold font-mono text-brand-orange">{term.term}</h4>
                  <p className="text-[11px] leading-relaxed mt-1 text-secondary">{term.definition}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <NarrationPlayer
          appLocation={currentCard.app.location}
          transcript={isDebriefCard && remediation ? remediation.transcript : currentCard.transcript_text}
          label={isDebriefCard ? "Challenge Debrief Narration" : "Lesson Narration"}
          estSeconds={currentCard.estimated_narration_seconds}
        />

        <div className="px-6 py-4 border-t border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset flex items-center justify-between rounded-b-xl">
          <button
            onClick={() => setCurrentIdx((idx) => Math.max(0, idx - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 text-xs font-semibold disabled:opacity-35 disabled:cursor-not-allowed uppercase tracking-wider transition-colors text-secondary hover:text-brand-teal-deep"
          >
            &larr; Previous Card
          </button>

          {!isLast || meetsLessonMinimum ? (
            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="bg-brand-orange hover:bg-brand-orange/95 text-white border border-brand-orange font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isTerminologyCard && !allTermsAcked && <Lock size={12} />}
              {continueLabel} &rarr;
            </button>
          ) : (
            <div className="flex items-center gap-2 border border-tone-orange-border/30 bg-tone-orange-bg/10 text-brand-orange px-4 py-2.5 rounded-lg text-[10px] font-mono font-bold leading-none">
              <Clock size={12} /> {ACTIVE_TIME.LESSON_MIN_SECONDS - lessonSeconds}s Active Study Time Remaining
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE: MODULE ASSESSMENT SPLASH
   ========================================================================== */

function ModuleAssessmentSplashPage() {
  const navigate = useNavigate();
  const { moduleId = "m1" } = useParams();
  const module = getModuleDef(moduleId);
  const assessment = getModuleAssessment(moduleId);
  const items = getModuleQuizItems(moduleId);
  const passPct = getModuleQuizPassPct(moduleId);

  if (!module || !assessment) return null;

  return (
    <div className="max-w-2xl ml-0 mr-auto space-y-6">
      <BackLink to={`/journey/module/${module.id}`}>Back to {module.code}</BackLink>

      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl text-left space-y-6">
        <div className="w-12 h-12 rounded bg-tone-orange-bg border border-tone-orange-border text-brand-orange flex items-center justify-center mr-auto shadow-sm">
          <ShieldAlert size={24} />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted font-mono tracking-widest">Formal Assessment Portal</span>
          <h1 className="text-2xl font-bold text-brand-teal-deep mt-1">{assessment.title || appCopy.moduleAssessment.title}</h1>
          <p className="text-xs text-secondary max-w-md leading-relaxed mt-2">
            {moduleId === "cms-485"
              ? "Advanced Training Clinical Audit Lab: Review three complex patient cases, identify Plan of Care deficiencies, and select compliant elements to align each case with CMS Conditions of Participation."
              : moduleId === "qapi"
              ? "Advanced Training Quality Exam: Complete the final 15-question multiple-choice assessment covering QAPI standards, Performance Improvement Projects (PIPs), and audit defensibility."
              : `${appCopy.moduleAssessment.summary} You must score ${passPct}% or higher to advance.`}
          </p>
        </div>

        <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset p-4 rounded-lg border border-hairline text-left max-w-md space-y-3 font-mono text-[11px] text-secondary shadow-sm">
          <div className="flex justify-between">
            <span>Structured Questions:</span>
            <span className="text-brand-teal-deep font-bold">
              {moduleId === "cms-485" ? "3 Patient Case Studies" : `${items.length} Questions`}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Target Score:</span>
            <span className="text-brand-orange font-bold">
              {moduleId === "cms-485" ? "100% Compliance Required" : `${passPct}% Minimum`}
            </span>
          </div>
          <div className="flex justify-between"><span>Remediation Rules:</span><span className="text-brand-teal-deep font-bold">Unlimited Retakes</span></div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-start gap-3">
          <button
            onClick={() => navigate(`/journey/module/${module.id}/assessment/quiz`)}
            className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
          >
            {moduleId === "cms-485" ? "Begin Clinical Audit Lab" : "Begin Assessment Exam"}
          </button>
          <button
            onClick={() => navigate(`/journey/module/${module.id}`)}
            className="bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal border border-tone-teal-border font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
          >
            Study Material Again
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE: MODULE ASSESSMENT QUIZ EXECUTION
   ========================================================================== */

function ModuleAssessmentQuizPage() {
  const navigate = useNavigate();
  const { moduleId = "m1" } = useParams();
  const { setState, recordRemediation, state: learnerState } = useLearner();
  const [result, setResult] = useState<{ pct: number; passed: boolean } | null>(null);
  const module = getModuleDef(moduleId);
  const moduleQuizItems = useMemo(() => getModuleQuizItems(moduleId), [moduleId]);
  const passPct = getModuleQuizPassPct(moduleId);

  const remediation = useMemo(() => {
    const lessonsLike = (module?.lessons ?? []).map(l => ({
      lesson_title: l.title,
      cards: l.cards ?? []
    }));
    return buildModuleRemediation(module?.title ?? moduleId.toUpperCase(), lessonsLike);
  }, [module?.title, module?.lessons, moduleId]);

  if (!module) return null;

  if (moduleId === "cms-485") {
    const isPassed = learnerState.moduleQuizPassed["cms-485"];
    if (isPassed && !result) {
      setResult({ pct: 100, passed: true });
    }
    if (!result) {
      return <Cms485AssessmentQuizPage />;
    }
  }

  if (!result) {
    return (
      <QuizRunner
        label={`${module.code} ASSESSMENT`}
        questions={moduleQuizItems}
        onSubmit={(answers) => {
          const scored = scoreModuleQuiz(answers, moduleId);
          setState((s) => withModuleAssessment(s, scored.passed, moduleId));
          if (!scored.passed) recordRemediation(`${module.code} assessment remediation (theory review)`);
          setResult(scored);
        }}
      />
    );
  }

  if (!result.passed) {
    return (
      <ModuleRemediationPanel
        scorePct={result.pct}
        passPct={passPct}
        remediation={remediation}
        onRetry={() => setResult(null)}
        onStudyAgain={() => navigate(`/journey/module/${moduleId}`)}
      />
    );
  }

  return (
    <div className="max-w-2xl ml-0 mr-auto space-y-6">
      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl text-left space-y-6">
        <div className="w-16 h-16 rounded bg-tone-teal-bg border border-tone-teal-border flex items-center justify-center mr-auto text-brand-teal shadow-sm">
          <CheckCircle2 size={32} />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-teal font-mono tracking-widest bg-tone-teal-bg px-2.5 py-0.5 rounded border border-tone-teal-border">
            {moduleId === "cms-485" || moduleId === "qapi" ? "Advanced Training Passed" : `${module.code} Passed`}
          </span>
          <h1 className="text-2xl font-bold text-brand-teal-deep mt-3">
            {moduleId === "cms-485"
              ? "CMS-485 Audit Lab Complete"
              : moduleId === "qapi"
              ? "QAPI Training Passed"
              : "Module Assessment Complete"}
          </h1>
          <p className="text-xs text-secondary mt-2">
            {moduleId === "cms-485"
              ? "You have completed the Advanced clinical audit lab. You successfully resolved all Plan of Care deficiencies for our patient cases."
              : moduleId === "qapi"
              ? "You have successfully completed the Advanced QAPI training module. You demonstrated proficiency in quality improvement and audit-readiness."
              : appCopy.moduleAssessment.summary}
          </p>
          <p className="text-xs text-secondary mt-1">
            {moduleId === "cms-485" || moduleId === "qapi"
              ? "Your progress is saved."
              : "The course-wide Final Assessment gate is now available on the Modules page."}
          </p>
        </div>
        <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset p-4 rounded-lg border border-hairline max-w-sm font-mono text-xs text-secondary flex justify-between shadow-sm">
          <span>Recorded Score:</span><strong className="text-brand-teal">{result.pct}%</strong>
        </div>
        <div className="pt-2 flex justify-start">
          <button
            onClick={() => navigate("/journey")}
            className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
          >
            Continue to Modules &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}


/* ==========================================================================
   PAGE: FINAL ASSESSMENT SPLASH
   ========================================================================== */

function FinalAssessmentSplashPage() {
  const navigate = useNavigate();
  const { demoSeconds } = useUiState();

  return (
    <div className="max-w-2xl ml-0 mr-auto space-y-6">
      <BackLink to="/journey">Back to Modules</BackLink>

      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-10 shadow-rest backdrop-blur-xl text-left space-y-6">
        <div className="w-14 h-14 rounded bg-tone-orange-bg border border-tone-orange-border text-brand-orange flex items-center justify-center mr-auto shadow-sm">
          <Award size={28} />
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-muted font-mono tracking-widest">Course-Wide Examination</span>
          <h1 className="text-3xl font-bold text-brand-teal-deep mt-1">{appCopy.final.title}</h1>
          <p className="text-xs text-secondary max-w-md leading-relaxed mt-2">
            {appCopy.final.summary}
          </p>
        </div>

        <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset p-5 rounded-lg border border-hairline text-left max-w-md space-y-3 font-mono text-[11px] text-secondary shadow-sm">
          <div className="flex justify-between"><span>Active Time Logged (demo):</span><span className="text-brand-teal-deep font-bold">{formatHoursAndMins(demoSeconds)}</span></div>
          <div className="flex justify-between"><span>Minimum Passing:</span><span className="text-brand-orange font-bold">{EXAM.PASS_PCT}% Correct</span></div>
          <div className="flex justify-between"><span>Post-Exam Track:</span><span className="text-brand-teal-deep font-bold">Affidavit Validation</span></div>
        </div>

        <div className="bg-tone-orange-bg/15 border border-tone-orange-border/30 p-4 rounded-lg text-left max-w-md">
          <p className="text-[10px] text-brand-orange leading-relaxed font-mono font-semibold">
            <strong>No Answer Key Notice:</strong> {appCopy.final.no_key_notice}
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row justify-start gap-3">
          <button
            onClick={() => navigate("/journey/final/quiz")}
            className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
          >
            Begin Course Final Exam
          </button>
          <button
            onClick={() => navigate("/journey")}
            className="bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal border border-tone-teal-border font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
          >
            Go Back &amp; Study Modules
          </button>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   PAGE: FINAL ASSESSMENT QUIZ EXECUTION
   ========================================================================== */

function FinalAssessmentQuizPage() {
  const navigate = useNavigate();
  const { recordExamAttempt } = useLearner();
  // Draw once per mount from the real preview pool (no fixed order, no key reveal).
  const [attempt] = useState(() => drawAttempt());

  const questions = attempt.map((it) => ({
    id: it.id,
    prompt: it.prompt,
    choices: it.choices,
  }));

  return (
    <QuizRunner
      label="COURSE THEORY FINAL EXAM"
      questions={questions}
      onSubmit={(answers) => {
        const scored = scoreAttempt(attempt, answers);
        recordExamAttempt(scored.pct, scored.passed);
        navigate("/journey/final/result", { state: { pct: scored.pct, passed: scored.passed } });
      }}
    />
  );
}

/* ==========================================================================
   PAGE: FINAL EXAM RESULT / GRADEOUT / REMEDIATION GATES
   ========================================================================== */

function FinalResultPage() {
  const navigate = useNavigate();
  const { state } = useLearner();
  const location = useLocation();
  const nav = location.state as { pct?: number; passed?: boolean } | null;

  const passed = nav?.passed ?? state.finalExamPassed;
  const pct = nav?.pct ?? state.finalExamBestScorePct ?? 0;
  const remediation = useMemo(() => buildFinalRemediation(courseModules), []);

  return (
    <div className="max-w-2xl ml-0 mr-auto space-y-6">
      <div className="bg-surface-glass border border-hairline rounded-xl p-6 md:p-8 shadow-rest backdrop-blur-xl text-left space-y-6">
        {passed ? (
          <>
            <div className="w-16 h-16 rounded bg-tone-teal-bg border border-tone-teal-border flex items-center justify-center mr-auto text-brand-teal shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-teal font-mono tracking-widest bg-tone-teal-bg px-2.5 py-0.5 rounded border border-tone-teal-border">Passed Course Exam</span>
              <h1 className="text-3xl font-bold text-brand-teal-deep mt-3">{appCopy.final.pass_title}</h1>
              <p className="text-xs text-secondary mt-2">{appCopy.final.pass_body}</p>
            </div>
            <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset p-4 rounded-lg border border-hairline max-w-sm ml-0 mr-auto font-mono text-xs text-secondary flex justify-between shadow-sm">
              <span>Recorded Score:</span><strong className="text-brand-teal font-bold">{pct}% Correct</strong>
            </div>
            <div className="pt-4 flex justify-start">
              <button
                onClick={() => navigate("/journey/appendix-f")}
                className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
              >
                Proceed to Certificate Gate &rarr;
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded bg-tone-orange-bg border border-tone-orange-border flex items-center justify-center mr-auto text-brand-orange shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-orange font-mono tracking-widest bg-tone-orange-bg px-2.5 py-0.5 rounded border border-tone-orange-border">Requires Remediation</span>
              <h1 className="text-3xl font-bold text-brand-teal-deep mt-3">{appCopy.final.fail_title}</h1>
              <p className="text-xs text-secondary mt-2 max-w-md leading-relaxed">{remediation.overview}</p>
            </div>
            <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset p-4 rounded-lg border border-hairline max-w-sm ml-0 mr-auto font-mono text-xs text-secondary flex justify-between shadow-sm">
              <span>Recorded Score:</span><strong className="text-brand-orange font-bold">{pct}% Correct · need {EXAM.PASS_PCT}%</strong>
            </div>

            {/* Topic areas to review (no answer keys, no rationales) */}
            <div className="text-left space-y-2.5">
              <h4 className="text-[10px] uppercase font-bold text-brand-teal-deep font-mono tracking-wider flex items-center gap-1.5">
                <BookOpenCheck size={12} className="text-brand-orange" /> Topic Areas to Review
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {remediation.topicAreas.map((topic) => (
                  <div key={topic.code} className="p-3 rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-brand-orange uppercase">{topic.code}</span>
                    </div>
                    <h5 className="text-xs font-semibold text-brand-teal-deep">{topic.title}</h5>
                    <p className="text-[11px] text-secondary leading-relaxed mt-1">{topic.revisit}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Remediation pathway */}
            <div className="text-left space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-brand-teal-deep font-mono tracking-wider flex items-center gap-1.5">
                <ListChecks size={12} className="text-brand-orange" /> Remediation Pathway
              </h4>
              <ol className="space-y-1.5 pl-4 list-decimal text-xs text-secondary">
                {remediation.pathway.map((step) => (
                  <li key={step} className="leading-relaxed">
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline p-3 rounded-lg text-left max-w-xl ml-0 mr-auto flex items-start gap-2 shadow-sm">
              <Lock size={12} className="text-muted shrink-0 mt-0.5" />
              <p className="text-[10px] text-muted leading-relaxed font-mono">{remediation.retryInstructions}</p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row justify-start gap-3">
              <button
                onClick={() => navigate("/journey/final")}
                className="bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
              >
                Retake Assessment Exam
              </button>
              <button
                onClick={() => navigate("/journey")}
                className="bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal border border-tone-teal-border font-bold px-6 py-3 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
              >
                Return to Modules
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN MODULE PLAYER SCREEN CONTAINER (Sub-route dispatcher)
   ========================================================================== */

export function ModulePlayerScreen() {
  const { pathname } = useLocation();
  const params = useParams<{ moduleId?: string; lessonId?: string }>();

  // P0-002 + P0-008 guard: use journeyStore as source of truth for employee + clearance
  const { currentEmployeeId, employees, attempts } = useJourneyStore();
  const employee = employees.find(e => e.id === currentEmployeeId);
  const rawModuleId = params.moduleId || (pathname.includes('/module/') ? pathname.split('/module/')[1]?.split('/')[0] : undefined);
  let journeyMod = rawModuleId ? moduleById(rawModuleId) : null;
  if (!journeyMod && rawModuleId && isAdvancedModule(rawModuleId)) {
    // stub for gating / checks so ADV modules are treated as valid in canonical path
    const advTitle = getModuleDef(rawModuleId)?.title || rawModuleId;
    journeyMod = { id: rawModuleId, roles: 'ALL', group: 'ADV' as any, phase: 'ANN' as any, title: advTitle } as any;
  }

  // HOIST useMemo here so it is ALWAYS called (P0-002 fix for hook order)
  const element = useMemo(() => {
    // Dispatch ADV modules to domain player for main module view (fixes runtime for RN-ADV)
    if (params.moduleId && isAdvancedModule(params.moduleId)) {
      const variant = getAdvancedVariant(params.moduleId) || 'plan_of_care';
      const title = getModuleDef(params.moduleId)?.title || params.moduleId;
      return <AdvancedTrainingPlayer moduleId={params.moduleId} moduleTitle={title} variant={variant} />;
    }
    if (pathname === "/journey/module/m0") {
      return <Module0OrientationPage />;
    }
    if (pathname === "/journey/final") {
      return <FinalAssessmentSplashPage />;
    }
    if (pathname === "/journey/final/quiz") {
      return <FinalAssessmentQuizPage />;
    }
    if (pathname === "/journey/final/result") {
      return <FinalResultPage />;
    }
    if (pathname.endsWith("/assessment")) {
      return <ModuleAssessmentSplashPage />;
    }
    if (pathname.endsWith("/assessment/quiz")) {
      return <ModuleAssessmentQuizPage />;
    }
    if (params.lessonId) {
      return <LessonPlayerPage />;
    }
    if (params.moduleId) {
      return <Module1OverviewPage />;
    }
    return (
      <div className="bg-surface-glass border border-hairline rounded-xl p-6 text-secondary shadow-rest backdrop-blur-xl">
        Route unrecognized in learning dispatcher.
      </div>
    );
  }, [pathname, params]);

  // Early guards
  if (!employee) {
    return (
      <section className="p-8">
        <div className="max-w-xl mx-auto bg-surface-glass border border-hairline rounded-xl p-6">
          <h2 className="text-xl font-bold">Select an employee to continue</h2>
          <p className="mt-2 text-sm text-secondary">No active onboarding subject is selected. Go to the Journey overview or Admin to choose an employee (e.g. Maria Santos, RN).</p>
          <Link to="/journey" className="mt-4 inline-block text-brand-teal underline">Back to Journey overview</Link>
        </div>
      </section>
    );
  }

  if (rawModuleId && !journeyMod && !isAdvancedModule(rawModuleId) && !['m0'].includes(rawModuleId)) {
    // Unknown module - bypass for RN-ADV modules (registered in adapter/courseModules)
    return (
      <section className="p-8">
        <div className="max-w-xl mx-auto bg-surface-glass border border-hairline rounded-xl p-6">
          <h2 className="text-xl font-bold">Unknown module</h2>
          <p className="mt-2 text-sm text-secondary">Module "{rawModuleId}" is not recognized in the current catalog.</p>
          <Link to="/journey" className="mt-4 inline-block text-brand-teal underline">Return to Journey overview</Link>
        </div>
      </section>
    );
  }

  // Hard gate using existing canStartModule for non-orientation modules
  const isOrientation = rawModuleId === 'm0' || pathname === '/journey/module/m0';
  if (!isOrientation && journeyMod && employee) {
    const decision = canStartModule(employee, journeyMod, attempts);
    if (!decision.unlocked) {
      return (
        <section className="p-8">
          <div className="max-w-xl mx-auto bg-surface-glass border border-amber-500/50 rounded-xl p-6">
            <h2 className="font-bold text-lg">Blocked — cannot start this module</h2>
            <p className="mt-2 text-sm">{decision.reason}</p>
            <div className="mt-4 flex gap-3">
              <Link to="/journey/appendix-f" className="text-brand-teal underline">Complete Appendix F</Link>
              <Link to="/journey" className="text-brand-teal underline">Back to overview</Link>
            </div>
            <p className="mt-3 text-[10px] text-muted font-mono">Current employee: {employee.name} ({employee.role})</p>
          </div>
        </section>
      );
    }
  }

  // element hoisted above (see top of ModulePlayerScreen) for P0-002 hook order fix

  return (
    <section
      aria-label="Onboarding course player"
      className="relative -m-xl min-h-[calc(100vh-var(--topbar-h))] bg-[linear-gradient(135deg,rgba(247,254,255,0.98),rgba(255,255,255,0.94)_48%,rgba(250,248,248,0.96))] px-lg py-lg text-ink"
      data-hash-id="module-player"
      data-route="/journey/module/:moduleId"
      data-template="module-player"
    >
      <div className="mr-auto max-w-[1320px] p-2 md:p-6">
        <DemoOnlyBanner />
        {element}
        <p className="text-left text-tag text-muted mt-8">
          No PHI. Demo training data only. Required theory modules do not access patient medical records.
        </p>
      </div>
    </section>
  );
}

export default ModulePlayerScreen;
