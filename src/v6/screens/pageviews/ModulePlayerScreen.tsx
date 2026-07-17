import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useJourneyStore } from "@/policy/journey/stores/journeyStore";
import { moduleById } from "@/policy/journey/data/modules";
import {
  getAssignedModuleIdsForEmployee,
  isModuleAssignedToEmployee,
} from "@/v6/utils/journeyProfileAdapter";
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
  Play,
  Repeat,
  Target,
  Volume2,
  VolumeX,
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
  BookOpen,
} from "lucide-react";

import { useLearner } from "@/policy/journey/lib/learnerState";
import { NolanLessonCheckpoint } from "../journey/NolanLessonCheckpoint";
import { isLessonComplete } from "@/policy/journey/lib/moduleProgress";
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
import { OasisSocTrainingPanel } from "@/policy/journey/components/advanced/OasisSocTrainingPanel";
import { isOasisSocModule, OASIS_SOC_MODULE_TITLE } from "@/policy/journey/components/advanced/oasisSocModule";
import { Cms485AssessmentQuizPage } from "./Cms485AssessmentQuizPage";
import CoreValuesInteractiveViewer from "@/policy/journey/components/CoreValuesInteractiveViewer";
import GAO001Scene01WelcomeDesk from "@/policy/journey/components/GAO001Scene01WelcomeDesk";
import GAO001Scene02MissionBriefing from "@/policy/journey/components/GAO001Scene02MissionBriefing";
import GAO001Scene03VisionPillars from "@/policy/journey/components/GAO001Scene03VisionPillars";
import GAO001Scene05HomeHealthDifference from "@/policy/journey/components/GAO001Scene05HomeHealthDifference";
import GAO001Scene06ReportingEscalation from "@/policy/journey/components/GAO001Scene06ReportingEscalation";
import GAO001Scene07PatientRefusal from "@/policy/journey/components/GAO001Scene07PatientRefusal";
import GAO001Scene08EscalationPractice from "@/policy/journey/components/GAO001Scene08EscalationPractice";
import GAO001Scene09ReadinessMap from "@/policy/journey/components/GAO001Scene09ReadinessMap";
import { getLvnStandaloneModule } from "@/policy/journey/modules/lvn";
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

function MediaSlot({ appLocation, sceneTitle, className = '' }: { appLocation: string; sceneTitle?: string; className?: string }) {
  const ready = hasMedia(appLocation);
  const alt = mediaAltText(sceneTitle);
  const isFullHeight = className.includes('h-full');
  const assetPath = mediaAssetPath(appLocation);
  const isVideo = /\.(mp4|webm|mov)$/i.test(assetPath);
  if (ready) {
    const wrapperBase = isFullHeight
      ? `w-full h-full min-h-full overflow-hidden ${className}`
      : `w-full aspect-video bg-surface-glass backdrop-blur-md shadow-glass-inset border border-hairline rounded-lg overflow-hidden shadow-sm mb-4 ${className}`;
    return (
      <div className={wrapperBase}>
        {isVideo ? (
          <video
            src={assetPath}
            aria-label={alt}
            className="block h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            controls
          />
        ) : (
          <img src={assetPath} alt={alt} className="block w-full h-full object-cover" />
        )}
      </div>
    );
  }
  return (
    <div
      role="img"
      aria-label={alt}
      className={`w-full ${isFullHeight ? 'h-full' : 'aspect-video'} ${isFullHeight ? '' : 'rounded-lg border border-tone-teal-border/40'} relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-br from-tone-teal-bg to-tone-slate-bg ${className}`}
    >
      <div className={`absolute top-3 left-3 bg-surface-glass backdrop-blur-md shadow-glass-inset border border-tone-orange-border/30 rounded px-2 py-0.5 ${isFullHeight ? 'text-xs' : 'text-[9px]'} font-mono text-brand-orange uppercase tracking-wider`}>
        Visual Aid Pending
      </div>
      {isFullHeight ? (
        <div className="w-full h-full flex items-center justify-center bg-surface-glass border border-tone-teal-border/30 rounded-xl">
          <div className="text-center">
            <ImageIcon size={120} className="mx-auto text-brand-teal" />
            {sceneTitle && (
              <div className="mt-4 text-xl font-mono text-secondary uppercase tracking-widest">
                {sceneTitle}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full border border-tone-teal-border/30 bg-surface-glass backdrop-blur-md shadow-glass-inset flex items-center justify-center text-brand-teal shadow-sm">
            <ImageIcon size={28} />
          </div>
          {sceneTitle && (
            <div className="text-[10px] font-mono text-secondary uppercase mt-3 tracking-widest px-6 text-center max-w-md leading-relaxed">
              {sceneTitle}
            </div>
          )}
        </>
      )}
      <div className={`absolute bottom-2 right-3 ${isFullHeight ? 'text-[10px]' : 'text-[8px]'} font-mono text-muted uppercase tracking-wider`}>
        Training Visual Placeholder · No PHI
      </div>
    </div>
  );
}

function isCareIndeedOnboardingModule(moduleId?: string): boolean {
  if (!moduleId) return false;
  const id = moduleId.toUpperCase();
  if (id.startsWith("ACHC-ART-") || isAdvancedModule(moduleId) || isOasisSocModule(moduleId)) return false;
  // Support CAO-xxx (CareIndeed Onboarding modules) + standard role prefixes
  if (id.startsWith("CAO-")) return true;
  return /^(GAO|ADM|DON|RN|LVN|PT|PTA|OT|COTA|SLP|MSW|HHA)-/.test(id);
}


function isGAOTextFirstModule(moduleId?: string): boolean {
  const match = moduleId?.match(/^GAO-(\d{3})$/i);
  if (!match) return false;
  const numericId = Number(match[1]);
  return numericId >= 2 && numericId <= 27;
}

function LvnStandaloneHost({ moduleId }: { moduleId: string }) {
  const LvnStandaloneModule = getLvnStandaloneModule(moduleId);
  if (!LvnStandaloneModule) {
    return (
      <div className="p-6 text-sm text-secondary">
        LVN module &quot;{moduleId}&quot; is registered but failed to load. Check src/policy/journey/modules/lvn.
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-white" data-lvn-standalone={moduleId}>
      <LvnStandaloneModule />
    </div>
  );
}

const onboardingDotBg = {
  backgroundColor: "#FAFBF8",
} as React.CSSProperties;

const onboardingValueCards = [
  { title: "Integrity", icon: ShieldCheck, tone: "teal", body: "Do the right thing even when no one is watching. Document truthfully. Report honestly." },
  { title: "Compassion", icon: HeartPulse, tone: "orange", body: "Treat every patient as you would your own family member. Respect their dignity always." },
  { title: "Excellence", icon: Sparkles, tone: "teal", body: "Never settle for \"good enough\". Pursue continuous improvement in every task." },
  { title: "Teamwork", icon: UserCheck, tone: "orange", body: "Home health is interdisciplinary. Communicate, coordinate, collaborate." },
  { title: "Accountability", icon: CheckSquare, tone: "teal", body: "Own your responsibilities. Follow through on commitments. Accept feedback." },
  { title: "Compliance", icon: ShieldAlert, tone: "orange", body: "Regulatory adherence protects patients. Never cut corners on safety or documentation." },
];

function OnboardingCoreValuesContent() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-[28px] font-medium text-[#1F1C1B] leading-tight">Our Core Values</h1>
        <p className="mt-2 text-sm text-[#524C4B] font-light leading-relaxed">
          These values are not wall decorations. They are behavioral expectations that shape how you interact with patients, families, physicians, and each other.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {onboardingValueCards.map((value) => {
          const Icon = value.icon;
          const isOrange = value.tone === "orange";
          return (
            <div
              key={value.title}
              className="bg-white border border-[#E5E4E3] rounded-[12px] p-5 hover:border-[#007970] hover:shadow-[0_4px_20px_rgba(0,65,66,0.05)] transition-all group"
            >
              <div className="flex items-center gap-3 mb-3 text-[#007970] font-semibold text-sm">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOrange ? "bg-[#FFF0E5] text-[#C74601] group-hover:bg-[#FFFAF7] group-hover:text-[#C74601]" : "bg-[#E5FEFF] text-[#007970] group-hover:bg-[#FFF0E5] group-hover:text-[#C74601]"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {value.title}
              </div>
              <p className="text-xs text-[#524C4B] font-light leading-relaxed">{value.body}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OnboardingLessonHtml({ card }: { card: any }) {
  const title = String(card?.display_title || "");
  const html = String(card?.learner_facing_content || "");
  if (/core values/i.test(title) || /Our Core Values/i.test(html)) {
    return <OnboardingCoreValuesContent />;
  }
  return (
    <div
      className="mx-auto max-w-[880px] space-y-5 text-[16px] leading-[1.62] text-[#423D3B] [&_h2]:text-[28px] [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-[#004142] [&_h3]:mt-6 [&_h3]:text-[18px] [&_h3]:font-bold [&_h3]:text-[#004142] [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-2 [&_strong]:font-bold [&_strong]:text-[#1F1C1B] [&_table]:my-5 [&_table]:w-full [&_table]:border-collapse [&_td]:border-b [&_td]:border-[#E5E4E3] [&_td]:p-3 [&_th]:p-3"
      dangerouslySetInnerHTML={{ __html: html }}
    />
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
          <p className="text-[11px] text-muted font-mono text-left">Confirm each readiness item to retry.</p>
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
            Confirm &amp; Continue
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
  const moduleExam = moduleAssessmentPassed(state, moduleId);

  if (!module) {
    return (
      <section className="p-8">
        <div className="max-w-xl rounded-xl border border-hairline bg-surface-glass p-6 shadow-rest backdrop-blur-xl">
          <h2 className="text-xl font-bold text-brand-teal-deep">Module content unavailable</h2>
          <p className="mt-2 text-sm text-secondary">Module "{moduleId}" does not have playable training content yet.</p>
          <Link to="/journey?tab=achc" className="mt-4 inline-block text-brand-teal underline">Return to ACHC annual training</Link>
        </div>
      </section>
    );
  }

  if (isCareIndeedOnboardingModule(module.id)) {
    const cleanObjectives = module.learningObjectives.filter((obj: string) => !/using None|Retain evidence for EN-CM-001/i.test(obj));
    const objectiveItems = [
      ...cleanObjectives,
      ...module.lessons.slice(0, Math.max(0, 4 - cleanObjectives.length)).map((item: any) => item.title),
    ].slice(0, 6);
    const completedLessons = module.lessons.filter((item: any) => isLessonComplete(state, module.id, item.id)).length;
    const progressPct = module.lessons.length ? Math.round((completedLessons / module.lessons.length) * 100) : 0;
    const moduleListRoute = module.id.startsWith('GAO-') ? '/journey?tab=onboarding&path=gao' : '/journey?tab=onboarding';

    return (
      <div className="min-h-[calc(100vh-var(--topbar-h)-2rem)] px-4 py-8 md:px-8" style={onboardingDotBg}>
        <div className="mx-auto max-w-5xl space-y-5">
          <BackLink to={moduleListRoute}>Back to Modules</BackLink>

          <section className="rounded-[22px] border border-[#E5E4E3] bg-white p-6 shadow-[0_24px_70px_rgba(31,28,27,0.10)] md:p-8">
            <div className="flex flex-col gap-4 border-b border-[#E5E4E3] pb-5 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C74601]">
                  {module.code} - {module.time.toUpperCase()} Theory
                </div>
                <h1 className="mt-2 text-3xl font-bold leading-tight text-[#004142] md:text-4xl">
                  {module.shortTitle}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#524C4B]">
                  {module.summary}
                </p>
              </div>
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${
                moduleExam ? "bg-[#E8F7EF] text-[#15803D]" : "bg-[#FFF0E5] text-[#C74601]"
              }`}>
                <span className={`h-2 w-2 rounded-full ${moduleExam ? "bg-[#15803D]" : "bg-[#C74601]"}`} />
                {moduleExam ? "Assessment Passed" : "Not Attempted"}
              </span>
            </div>

            <div className="grid gap-5 py-6 lg:grid-cols-[1fr_260px]">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-[#007970]">Lesson Objectives</h2>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {objectiveItems.map((obj: string) => (
                    <div key={obj} className="rounded-lg border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-3 text-xs leading-relaxed text-[#524C4B]">
                      {obj}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-[#C4F4F5] bg-[#E5FEFF] p-4">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.16em] text-[#007970]">
                  Progress <span>{progressPct}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-[#007970]" style={{ width: `${progressPct}%` }} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-lg bg-white p-3">
                    <div className="text-xl font-bold text-[#004142]">{completedLessons}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#747470]">Done</div>
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    <div className="text-xl font-bold text-[#004142]">{module.lessons.length}</div>
                    <div className="text-[10px] uppercase tracking-wider text-[#747470]">Lessons</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#007970]">Course Component Lessons</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {module.lessons.map((item: any) => {
                  const complete = isLessonComplete(state, module.id, item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(`/journey/module/${module.id}/lesson/${item.id}`)}
                      className="group min-h-[124px] rounded-xl border border-[#E5E4E3] bg-white p-4 text-left shadow-[0_10px_28px_rgba(31,28,27,0.06)] transition hover:-translate-y-0.5 hover:border-[#C4F4F5] hover:shadow-[0_16px_40px_rgba(0,121,112,0.10)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#C74601]">Lesson {item.index}</div>
                          <h3 className="mt-1 text-sm font-bold leading-snug text-[#004142] group-hover:text-[#007970]">{item.title}</h3>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${complete ? "bg-[#E8F7EF] text-[#15803D]" : "bg-[#FFF0E5] text-[#C74601]"}`}>
                          {complete ? "Done" : "Play"}
                        </span>
                      </div>
                      <div className="mt-4 text-[11px] text-[#747470]">{item.estMinutes} min - narrated theory</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-7 flex flex-col items-stretch gap-3 border-t border-[#E5E4E3] pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs font-medium text-[#747470]">Module assessment available after theory review.</div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => navigate(`/journey/module/${module.id}/assessment`)}
                  className="rounded-lg bg-[#C74601] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(199,70,1,0.20)] transition hover:bg-[#A63A01]"
                >
                  Start Module Knowledge Check
                </button>
                <button
                  onClick={() => navigate(`/journey/module/${module.id}/lesson/${module.lessons[0]?.id ?? "l1"}`)}
                  className="rounded-lg border border-[#007970] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#007970] transition hover:bg-[#E5FEFF]"
                >
                  Start / Review Theory
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

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
            Module assessment available.
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={() => navigate(`/journey/module/${module.id}/assessment`)}
              className="w-full sm:w-auto bg-brand-orange hover:bg-brand-orange/95 text-white font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
            >
              Start {appCopy.moduleAssessment.title}
            </button>
            <button
              onClick={() => navigate(`/journey/module/${module.id}/lesson/${module.lessons[0]?.id ?? "l1"}`)}
              className="w-full sm:w-auto bg-surface-glass backdrop-blur-md shadow-glass-inset hover:bg-surface-hover text-brand-teal font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action"
            >
              Start / Review Theory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMmSs(totalSecs: number): string {
  const m = Math.floor(totalSecs / 60);
  const s = Math.floor(totalSecs % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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
  const { state: learnerState, setState } = useLearner();
  const { demoSeconds, reviewerOpen } = useUiState();
  const lesson = getGeneratedLesson(moduleId, lessonId);
  const cards = useMemo(() => lesson?.cards ?? [], [lesson]);
  const stepLabels = useMemo(() => buildStepLabels(cards), [cards]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [openedOptions, setOpenedOptions] = useState<string[]>([]);
  const [acknowledgedTerms, setAcknowledgedTerms] = useState<Set<number>>(new Set());
  const [narrationPlaying, setNarrationPlaying] = useState(false);
  const narrationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [narrationSpeaking, setNarrationSpeaking] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'narration'>('content');
  const speechSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    setAcknowledgedTerms(new Set());
    setSelectedAnswer(null);
    setSubmitted(false);
    setOpenedOptions([]);
    setCurrentIdx(0);
    setNarrationPlaying(false);
    setNarrationSpeaking(false);
    if (speechSupported) window.speechSynthesis.cancel();
    const el = narrationAudioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [moduleId, lessonId, speechSupported]);

  // Stop both real audio and browser TTS when the card changes
  useEffect(() => {
    if (speechSupported) window.speechSynthesis.cancel();
    setNarrationSpeaking(false);
    setNarrationPlaying(false);
    const el = narrationAudioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }, [currentIdx, speechSupported]);

  useEffect(() => {
    return () => {
      if (speechSupported) window.speechSynthesis.cancel();
    };
  }, [speechSupported]);

  const stopNarrationSpeech = () => {
    if (speechSupported) window.speechSynthesis.cancel();
    setNarrationSpeaking(false);
  };

  const stopNarrationAudio = () => {
    const el = narrationAudioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setNarrationPlaying(false);
  };

  const toggleNarrationAudio = () => {
    const el = narrationAudioRef.current;
    if (!el) return;
    // Real file always wins — never mix with browser TTS
    stopNarrationSpeech();
    if (el.paused) {
      void el.play().then(() => setNarrationPlaying(true)).catch(() => setNarrationPlaying(false));
    } else {
      el.pause();
      setNarrationPlaying(false);
    }
  };

  const toggleNarrationSpeech = () => {
    // Only when no registered narration file exists for this card
    if (!speechSupported) return;
    if (hasNarrationAudio(currentCard.app.location)) {
      // Prefer the real asset if it became available
      toggleNarrationAudio();
      return;
    }
    if (narrationSpeaking) {
      stopNarrationSpeech();
      return;
    }
    stopNarrationAudio();
    window.speechSynthesis.cancel();
    setTimeout(() => {
      // Use the content tab text as the main narration, falling back to transcript/script
      let contentText = '';
      if (currentCard.content || currentCard.html_content) {
        try {
          const html = currentCard.content || currentCard.html_content || '';
          const doc = new DOMParser().parseFromString(html, 'text/html');
          contentText = doc.body.textContent || '';
        } catch (e) {
          console.error('Failed to parse HTML for narration', e);
        }
      }
      const text = contentText || currentCard.transcript_text || currentCard.narration_script || '';

      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      utter.onend = () => setNarrationSpeaking(false);
      utter.onerror = () => setNarrationSpeaking(false);
      setNarrationSpeaking(true);
      window.speechSynthesis.speak(utter);
    }, 50);
  };

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

  // Lesson flow: previous / next lesson for connected experience
  const moduleDef = getModuleDef(moduleId);
  const allLessons = moduleDef?.lessons ?? [];
  const currentLessonIdx = allLessons.findIndex((l: any) => l.id === lessonId);
  const prevLesson = currentLessonIdx > 0 ? allLessons[currentLessonIdx - 1] : null;
  const nextLesson = currentLessonIdx < allLessons.length - 1 ? allLessons[currentLessonIdx + 1] : null;

  const currentCard = cards[currentIdx];
  const isChallengeCard = Boolean(currentCard.internal_challenge);
  const isDebriefCard = currentCard.card_type === "debrief";
  const isLast = currentIdx === cards.length - 1;
  const narrationAudioReady = hasNarrationAudio(currentCard.app.location);

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
      if (isLast) {
        return nextLesson ? "Next Lesson" : "Complete Theory Lesson";
      }
      return isDebriefCard ? remediation?.continueLabel ?? "Continue" : "Continue";
    }
    if (currentCard.card_type === "overview") return "Next: Terminology";
    if (currentCard.card_type === "delivery") return "Proceed to Challenge";
    if (isChallengeCard) return "Continue";
    if (isDebriefCard) return "Complete Theory Lesson";
    return "Continue";
  }, [isCms485, currentCard, isLast, isDebriefCard, isChallengeCard, remediation, nextLesson]);

  const handleNext = () => {
    if (currentIdx < cards.length - 1) {
      setCurrentIdx((idx) => idx + 1);
      return;
    }
    setState((s) => withLessonCompleted(s, moduleId, lessonId));
    // P0-001 bridge for lesson complete
    try { const j = useJourneyStore.getState(); j.recordLearnerCompletion(j.currentEmployeeId, moduleId, true); } catch {}
    if (nextLesson) {
      navigate(`/journey/module/${moduleId}/lesson/${nextLesson.id}`);
    } else {
      navigate(`/journey/module/${moduleId}`);
    }
  };

  const challengeChoices = (challenge?.choices ?? []) as { id: string; label: string }[];

  if (isCareIndeedOnboardingModule(moduleId)) {
    const currentLessonNumber = currentLessonIdx >= 0 ? currentLessonIdx + 1 : 1;
    const totalNarrationSeconds = currentCard.estimated_narration_seconds ?? Math.max(30, lesson.estMinutes * 60);
    const mediaTitle = currentCard.media_prompt_placeholder?.scene_title || currentCard.display_title || lesson.title;
    const canMovePrevious = currentIdx > 0 || Boolean(prevLesson);
    const textFirstGaoModule = isGAOTextFirstModule(moduleId);

    return (
      <div className="fixed inset-0 z-[9998] flex flex-col text-[#1F1C1B]" style={onboardingDotBg}>
        {idleWarning && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#E5E4E3] bg-white p-6 text-center shadow-2xl">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#FFF0E5] text-[#C74601]">
                <Clock size={23} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#004142]">Are you still studying?</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#524C4B]">
                Active study time paused due to inactivity. Resume to continue tracking this lesson.
              </p>
              <button
                onClick={resume}
                className="mt-5 w-full rounded-lg bg-[#C74601] px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white"
              >
                Resume Learning
              </button>
            </div>
          </div>
        )}

        <header className="shrink-0 border-b border-[#E5E4E3] bg-white/96 px-4 py-3 shadow-[0_8px_28px_rgba(31,28,27,0.05)] md:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {textFirstGaoModule && (
              <div className="min-w-[260px]">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#007970]">{moduleId}</div>
                <h1 className="truncate text-lg font-bold leading-tight text-[#004142]">{moduleDef?.title || lesson.title}</h1>
                <div className="mt-0.5 text-xs text-[#747470]">Lesson {currentLessonNumber} of {allLessons.length || 1}</div>
              </div>
            )}
            <div className="min-w-0 flex-1 overflow-x-auto">
              <div className="flex min-w-max items-center gap-2">
                {allLessons.map((lessonItem: any, index: number) => {
                  const active = lessonItem.id === lessonId;
                  const complete = isLessonComplete(learnerState, moduleId, lessonItem.id);
                  return (
                    <button
                      key={lessonItem.id}
                      type="button"
                      onClick={() => navigate(`/journey/module/${moduleId}/lesson/${lessonItem.id}`)}
                      className={`inline-flex max-w-[220px] items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold transition ${
                        active
                          ? "border-[#007970] bg-[#007970] text-white shadow-[0_8px_18px_rgba(0,121,112,0.18)]"
                          : "border-[#E5E4E3] bg-white text-[#524C4B] hover:border-[#C4F4F5] hover:text-[#007970]"
                      }`}
                      title={lessonItem.title}
                    >
                      <span className={`h-2 w-2 shrink-0 rounded-full ${active ? "bg-[#FA7A33]" : complete ? "bg-[#007970]" : "bg-[#C9C6C5]"}`} />
                      <span className="truncate">{index + 1}. {lessonItem.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              onClick={() => navigate(`/journey/module/${moduleId}`)}
              className="shrink-0 rounded-full border border-[#E5E4E3] bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#C74601] transition hover:bg-[#FFF0E5]"
            >
              Save &amp; Exit
            </button>
          </div>
        </header>

        {/* GAO-002+ keeps the same right-side visual workspace while using the markdown lesson copy. */}
        <main
          className="flex min-h-0 flex-1 flex-col gap-[20px] p-0 lg:flex-row lg:items-stretch"
        >
          <aside
            className={`flex min-h-0 min-w-0 flex-1 flex-col border border-[#E5E4E3] bg-white shadow-[0_18px_50px_rgba(31,28,27,0.08)] ${
              textFirstGaoModule ? 'rounded-none p-7 md:p-9' : 'rounded-[22px] p-[20px]'
            }`}
            style={
              textFirstGaoModule
                ? { minWidth: 0, flex: '1 1 0%' }
                : { minWidth: 'calc(420px * 1.0777)', flex: '1 1 auto' }
            }
          >
            {/* Narration tab removed for all onboarding scenes — main audio is the footer play button only */}
            <div className="mb-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#007970]">
                Content
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto pr-1">
              <OnboardingLessonHtml card={currentCard} />
            </div>
          </aside>

          <section
            className={`flex min-h-0 flex-col bg-white ${
              /^GAO-001_L\d+_DELIVERY$/.test(currentCard.card_id)
                ? 'rounded-none border-0 p-0 shadow-none overflow-hidden'
                : 'rounded-[24px] border border-[#E5E4E3] p-[20px] shadow-[0_18px_50px_rgba(31,28,27,0.08)]'
            }`}
            style={
              textFirstGaoModule
                ? {
                    flex: '0 0 auto',
                    alignSelf: 'stretch',
                    height: '100%',
                    aspectRatio: '16 / 13',
                    width: 'auto',
                    maxWidth: '100%',
                    minWidth: 0,
                  }
                : {
                    flex: '0 0 auto',
                    alignSelf: 'stretch',
                    height: '100%',
                    aspectRatio: '16 / 13',
                    width: 'auto',
                    maxWidth: '100%',
                    minWidth: 0,
                  }
            }
          >
            <div
              className={`flex min-h-0 h-full w-full flex-1 flex-col overflow-hidden ${
                /^GAO-001_L\d+_DELIVERY$/.test(currentCard.card_id)
                  ? 'rounded-none border-0 bg-black'
                  : 'rounded-[18px] border border-[#E5E4E3] bg-[#FAFBF8]'
              }`}
            >
              {currentCard.card_id === 'GAO-001_L1_DELIVERY' ? (
                <GAO001Scene01WelcomeDesk
                  onComplete={() => console.info('[GAO-001 Scene 1] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L2_DELIVERY' ? (
                <GAO001Scene02MissionBriefing
                  onComplete={() => console.info('[GAO-001 Scene 2] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L3_DELIVERY' ? (
                <GAO001Scene03VisionPillars
                  onComplete={() => console.info('[GAO-001 Scene 3] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L4_DELIVERY' ? (
                <CoreValuesInteractiveViewer
                  onComplete={() => {
                    console.info('[GAO Core Values] Interactive scene completed');
                  }}
                />
              ) : currentCard.card_id === 'GAO-001_L5_DELIVERY' ? (
                <GAO001Scene05HomeHealthDifference
                  onComplete={() => console.info('[GAO-001 Scene 5] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L6_DELIVERY' ? (
                <GAO001Scene06ReportingEscalation
                  onComplete={() => console.info('[GAO-001 Scene 6] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L7_DELIVERY' ? (
                <GAO001Scene07PatientRefusal
                  onComplete={() => console.info('[GAO-001 Scene 7] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L8_DELIVERY' ? (
                <GAO001Scene08EscalationPractice
                  onComplete={() => console.info('[GAO-001 Scene 8] completed')}
                />
              ) : currentCard.card_id === 'GAO-001_L9_DELIVERY' ? (
                <GAO001Scene09ReadinessMap
                  onComplete={() => console.info('[GAO-001 Scene 9] completed')}
                />
              ) : hasMedia(currentCard.app.location) ? (
                <MediaSlot
                  appLocation={currentCard.app.location}
                  sceneTitle={mediaTitle}
                  className="h-full"
                />
              ) : (
                <>
                  {/* Main visual stage - polished placeholder matching brand spec */}
                  <div className="flex-1 flex items-center justify-center w-full p-6">
                    <div className="text-center z-10 flex flex-col items-center">
                      {/* Custom image-placeholder icon (styled to match provided LMS player HTML) */}
                      <svg className="w-20 h-20 text-[#007970] mb-6" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                        <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3ZM5 5H19V19H5V5Z" fill="currentColor"/>
                        <path d="M8.5 11.5C9.88071 11.5 11 10.3807 11 9C11 7.61929 9.88071 6.5 8.5 6.5C7.11929 6.5 6 7.61929 6 9C6 10.3807 7.11929 11.5 8.5 11.5Z" fill="currentColor"/>
                        <path d="M5.5 18L10.5 12L13 14.5L16 11L18.5 14V18H5.5Z" fill="currentColor"/>
                      </svg>
                      <h2 className="text-xl font-semibold tracking-[0.08em] text-[#007970] uppercase">{mediaTitle}</h2>
                    </div>
                  </div>

                  {/* Subtle footer label inside stage */}
                  <div className="bg-[#E5FEFF] w-full py-2.5 text-center border-t border-[#C4F4F5]">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#747470]">
                      Training Visual • No PHI
                    </div>
                  </div>
                </>
              )}
            </div>
          </section>
        </main>

        <footer className="shrink-0 border-t border-[#E5E4E3] bg-white px-4 py-4 shadow-[0_-8px_28px_rgba(31,28,27,0.05)] md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <button
              onClick={() => {
                if (currentIdx > 0) {
                  setCurrentIdx((idx) => Math.max(0, idx - 1));
                } else if (prevLesson) {
                  navigate(`/journey/module/${moduleId}/lesson/${prevLesson.id}`);
                }
              }}
              disabled={!canMovePrevious}
              className="rounded-lg border border-[#E5E4E3] bg-white px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#524C4B] transition hover:bg-[#FAFBF8] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous Lesson
            </button>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={narrationAudioReady ? toggleNarrationAudio : toggleNarrationSpeech}
                disabled={!narrationAudioReady && !speechSupported}
                className={`grid h-11 w-11 place-items-center rounded-full border text-white shadow-[0_10px_24px_rgba(0,121,112,0.18)] transition disabled:opacity-40 ${
                  narrationPlaying || narrationSpeaking ? "border-[#004142] bg-[#004142]" : "border-[#007970] bg-[#007970]"
                }`}
                aria-label={narrationPlaying || narrationSpeaking ? "Pause narration" : "Play narration"}
              >
                {narrationPlaying || narrationSpeaking ? <Pause size={16} className="fill-current" /> : <Play size={16} className="ml-0.5 fill-current" />}
              </button>
              <div className="rounded-full border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-2 text-xs font-bold text-[#524C4B]">
                {formatMmSs(lessonSeconds)} / {formatMmSs(totalNarrationSeconds)}
              </div>
              <div className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[#747470] sm:block">
                Lesson {currentLessonNumber} of {allLessons.length}
              </div>
            </div>

            <button
              onClick={handleNext}
              className="rounded-lg bg-[#C74601] px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-white shadow-[0_10px_24px_rgba(199,70,1,0.20)] transition hover:bg-[#A63A01]"
            >
              {nextLesson || currentIdx < cards.length - 1 ? "Next Lesson" : "Complete Theory"} →
            </button>
          </div>
        </footer>

        <audio
          key={currentCard.app.location}
          ref={narrationAudioRef}
          src={narrationAudioReady ? narrationAssetPath(currentCard.app.location) : undefined}
          onEnded={() => setNarrationPlaying(false)}
          onError={() => setNarrationPlaying(false)}
          preload={narrationAudioReady ? "metadata" : "none"}
        />
      </div>
    );
  }

  return (
    <div className="h-full">
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

      <div className="border border-hairline bg-surface-glass rounded-xl overflow-hidden flex flex-col shadow-rest backdrop-blur-xl isolate h-full w-full">
        {/* Invisible dock: lesson flow (centered) + Quit Lesson top right. No extra rows or "Learn" text. */}
        <div className="relative px-2 py-0.5 bg-transparent text-[10px] font-mono">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1 overflow-x-auto">
              {allLessons.map((lessonItem: any, index: number) => {
                const isActive = lessonItem.id === lessonId;
                return (
                  <div
                    key={lessonItem.id}
                    onClick={() => navigate(`/journey/module/${moduleId}/lesson/${lessonItem.id}`)}
                    className={`px-1.5 py-0.5 rounded border cursor-pointer flex-shrink-0 text-[9px] ${isActive ? 'bg-brand-orange text-white border-brand-orange font-bold' : 'bg-white border-hairline hover:bg-gray-100'}`}
                  >
                    {lessonItem.title ? lessonItem.title.substring(0, 10) + (lessonItem.title.length > 10 ? '..' : '') : `L${index + 1}`}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quit Lesson on top right */}
          <button
            onClick={() => navigate(`/journey/module/${moduleId}`)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-wider text-red-600 hover:text-red-700 px-1 py-0.5 rounded transition-colors"
            title="Quit Lesson"
          >
            Quit Lesson
          </button>
        </div>

        <div className="p-2 md:p-3 flex flex-col flex-1 space-y-1 pt-1">
          {/* Timers + Close kept invisible (zero space) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline text-xs font-mono text-secondary opacity-0 p-0 m-0 h-0 overflow-hidden border-none">
            <button
              onClick={() => navigate(`/journey/module/${moduleId}`)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-teal hover:text-brand-teal-deep transition-colors self-start"
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

          <div className="opacity-0 p-0 m-0 h-0 overflow-hidden">
            <span className="text-[10px] font-bold uppercase tracking-widest font-mono text-muted">
              {stepLabels[currentIdx]} · Step {currentIdx + 1} of {cards.length}
            </span>
            {reviewerOpen && (
              <p className="text-[11px] font-mono mt-1 text-muted">
                {currentCard.module_id} · {currentCard.lesson_id} · {currentCard.card_id} · {currentCard.app.location}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] xl:grid-cols-[440px,1fr] grid-rows-[1fr] gap-2 w-full flex-1 min-h-0 h-full">
            <div className="border border-[#E5E4E3] bg-white rounded-xl p-[20px] shadow-md text-xs flex flex-col overflow-hidden h-full">
              {/* Content / Narration tabs */}
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-1 text-xs font-semibold ${activeTab === 'content' ? 'border-b-2 border-brand-teal text-brand-teal' : 'text-muted'}`}
                >
                  Content
                </button>
                {/* Narration tab hidden as per request */}
              </div>
              <div id="lesson-content-container" className="flex-1 min-h-0 overflow-auto text-[10px] leading-tight">
                {activeTab === 'content' ? (
                  <>
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
                      <CheckCircle2 size={12} /> Response submitted. Click "Continue" to review the explanation.
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
                      Review the safest response{selectedAnswer && selectedAnswer !== remediation.safestId ? " and your own choice" : ""} in the option review to complete the lesson.
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
                  {currentCard.learner_facing_content.includes("<") && currentCard.learner_facing_content.includes(">") ? (
                    <div
                      className="text-xs leading-relaxed text-secondary space-y-2 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-brand-teal-deep [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-brand-teal-deep [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1 [&_strong]:text-brand-teal-deep"
                      dangerouslySetInnerHTML={{ __html: currentCard.learner_facing_content }}
                    />
                  ) : (
                    <p className="text-xs leading-relaxed whitespace-pre-line text-secondary">{currentCard.learner_facing_content}</p>
                  )}
                  {currentCard.cna_practice_example && (
                    <div className="p-3 border border-tone-orange-border/30 bg-tone-orange-bg/10 rounded-lg">
                      <p className="text-[11px] leading-relaxed text-secondary">
                        <strong>Practice example:</strong> {currentCard.cna_practice_example}
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
                      Review the safest response{selectedAnswer && selectedAnswer !== remediation.safestId ? " and your own choice" : ""} in the option review to complete the lesson.
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
                  </>
                ) : (
                  <div className="whitespace-pre-line text-secondary">
                    {currentCard.narration_script || currentCard.transcript_text || 'No narration text available.'}
                  </div>
                )}
            </div>
            </div>
            <div className="h-full shadow-md overflow-hidden rounded-xl p-[20px]">
              <MediaSlot
                appLocation={currentCard.app.location}
                sceneTitle={currentCard.media_prompt_placeholder?.scene_title}
                className="h-full w-full !mb-0"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset flex items-center justify-between rounded-b-xl">
          <button
            onClick={() => {
              if (currentIdx > 0) {
                setCurrentIdx((idx) => Math.max(0, idx - 1));
              } else if (prevLesson) {
                navigate(`/journey/module/${moduleId}/lesson/${prevLesson.id}`);
              }
            }}
            disabled={currentIdx === 0 && !prevLesson}
            className="px-4 py-2 text-xs font-semibold disabled:opacity-35 disabled:cursor-not-allowed uppercase tracking-wider transition-colors text-secondary hover:text-brand-teal-deep"
          >
            &larr; {currentIdx > 0 ? "Previous Card" : "Previous Lesson"}
          </button>

          {/* Narration controls between prev and next (only relevant for narration) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleNarrationAudio}
              className="w-8 h-8 rounded-full bg-surface-glass backdrop-blur-md shadow-glass-inset border border-tone-teal-border/40 flex items-center justify-center text-brand-teal hover:bg-surface-hover transition-colors text-xs"
              aria-label={narrationPlaying ? "Pause" : "Play"}
            >
              {narrationPlaying ? <Pause size={12} className="fill-current" /> : <Play size={12} className="fill-current ml-0.5" />}
            </button>
            {!narrationAudioReady && speechSupported && (
              <button
                onClick={toggleNarrationSpeech}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded border text-[9px] font-mono transition-all ${narrationSpeaking ? "bg-tone-teal-bg text-brand-teal border-tone-teal-border" : "bg-surface-glass border-hairline text-secondary hover:bg-surface-hover"}`}
                title="Browser preview"
              >
                {narrationSpeaking ? <VolumeX size={10} /> : <Volume2 size={10} />} Preview
              </button>
            )}
          </div>

          {!isLast || meetsLessonMinimum ? (
            <button
              onClick={handleNext}
              disabled={!canContinue}
              className="bg-brand-orange hover:bg-brand-orange/95 text-white border border-brand-orange font-bold px-6 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-pill-action disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isTerminologyCard && !allTermsAcked && <AlertTriangle size={12} />}
              {continueLabel} &rarr;
            </button>
          ) : (
            <div className="flex items-center gap-2 border border-tone-orange-border/30 bg-tone-orange-bg/10 text-brand-orange px-4 py-2.5 rounded-lg text-[10px] font-mono font-bold leading-none">
              <Clock size={12} /> {ACTIVE_TIME.LESSON_MIN_SECONDS - lessonSeconds}s Active Study Time Remaining
            </div>
          )}
        </div>

        {/* Nolan lesson checkpoint — clarifying-questions moment, keyed per lesson
            so it reappears fresh on every lesson; NEVER gates Next. */}
        <NolanLessonCheckpoint
          key={`nolan-${moduleId}-${lessonId}`}
          moduleId={moduleId}
          lessonTitle={lesson?.title ?? "this lesson"}
          cards={cards}
        />

        {/* Hidden audio for narration controls — real file when registered; no browser TTS mix-in */}
        <audio
          key={currentCard.app.location}
          ref={narrationAudioRef}
          src={narrationAudioReady ? narrationAssetPath(currentCard.app.location) : undefined}
          onEnded={() => setNarrationPlaying(false)}
          onError={() => setNarrationPlaying(false)}
          preload={narrationAudioReady ? "metadata" : "none"}
        />
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
              : "The final assessment is now available on the Modules page."}
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
   PAGE: FINAL EXAM RESULT / GRADEOUT / REMEDIATION
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
                Proceed to Certificate &rarr;
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded bg-tone-orange-bg border border-tone-orange-border flex items-center justify-center mr-auto text-brand-orange shadow-sm">
              <AlertTriangle size={32} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-brand-orange font-mono tracking-widest bg-tone-orange-bg px-2.5 py-0.5 rounded border border-tone-orange-border">Review Needed</span>
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
              <AlertTriangle size={12} className="text-muted shrink-0 mt-0.5" />
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
  // Phase 2C: subscribe to current learner for assignment banner + completion employeeId
  const learnerEmpId = useJourneyStore((s) => s.currentEmployeeId);
  const learnerEmployees = useJourneyStore((s) => s.employees);
  const learnerEmp = learnerEmployees.find((e) => e.id === learnerEmpId);

  // Gating removed - always proceed (no employee/GAO/Appendix F blocks)
  const rawModuleId = params.moduleId || (pathname.includes('/module/') ? pathname.split('/module/')[1]?.split('/')[0] : undefined);
  let journeyMod = rawModuleId ? moduleById(rawModuleId) : null;
  if (!journeyMod && rawModuleId && isOasisSocModule(rawModuleId)) {
    journeyMod = { id: rawModuleId, roles: 'ALL', group: 'ADV' as any, phase: 'ANN' as any, title: OASIS_SOC_MODULE_TITLE } as any;
  }
  if (!journeyMod && rawModuleId && isAdvancedModule(rawModuleId)) {
    // stub for gating / checks so ADV modules are treated as valid in canonical path
    const advTitle = getModuleDef(rawModuleId)?.title || rawModuleId;
    journeyMod = { id: rawModuleId, roles: 'ALL', group: 'ADV' as any, phase: 'ANN' as any, title: advTitle } as any;
  }
  if (!journeyMod && rawModuleId) {
    const playableModule = getModuleDef(rawModuleId);
    if (playableModule) {
      journeyMod = { id: playableModule.id, roles: 'ALL', group: 'ANN' as any, phase: 'ANN' as any, title: playableModule.title } as any;
    }
  }

  // HOIST useMemo here so it is ALWAYS called (P0-002 fix for hook order)
  const element = useMemo(() => {
    // Dispatch ADV modules to domain player for main module view (fixes runtime for RN-ADV)
    // OASIS-E2 SOC renders its own self-contained panel — resolved FIRST and
    // independently of the shared advanced-training contract (see oasisSocModule.ts).
    if (isOasisSocModule(params.moduleId)) {
      return <OasisSocTrainingPanel moduleId={params.moduleId!} />;
    }
    if (params.moduleId && isAdvancedModule(params.moduleId)) {
      const variant = getAdvancedVariant(params.moduleId) || 'plan_of_care';
      const title = getModuleDef(params.moduleId)?.title || params.moduleId;
      return <AdvancedTrainingPlayer moduleId={params.moduleId} moduleTitle={title} variant={variant} />;
    }
    if (params.moduleId && getLvnStandaloneModule(params.moduleId)) {
      return <LvnStandaloneHost moduleId={params.moduleId} />;
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

  if (rawModuleId && !journeyMod && !isOasisSocModule(rawModuleId) && !isAdvancedModule(rawModuleId) && !['m0'].includes(rawModuleId)) {
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

  // Gating removed per request (no more idiotic module start blocks for GAO/Appendix F/etc.)
  // Phase 2C: do NOT re-enable canStartModule here — only surface assignment context.
  // Completions already write via recordLearnerCompletion(j.currentEmployeeId, …).
  const assignedIds = getAssignedModuleIdsForEmployee(learnerEmpId, learnerEmp?.role);
  const moduleInAssignment =
    !rawModuleId
    || assignedIds.length === 0
    || isModuleAssignedToEmployee(learnerEmpId, rawModuleId, learnerEmp?.role);
  const assignmentBanner =
    rawModuleId && assignedIds.length > 0 ? (
      <div
        className={`no-print mx-4 mb-2 rounded-lg border px-3 py-2 text-[11px] font-mono ${
          moduleInAssignment
            ? 'border-tone-teal-border/40 bg-tone-teal-bg/20 text-brand-teal-deep'
            : 'border-amber-300 bg-amber-50 text-amber-950'
        }`}
        role="status"
      >
        {moduleInAssignment ? (
          <>
            Learner assignment ({learnerEmp?.name || learnerEmpId}): module{' '}
            <strong>{rawModuleId}</strong> is on this track ({assignedIds.length} modules).
          </>
        ) : (
          <>
            <strong>Not on this learner&apos;s assignment track</strong> ({learnerEmp?.name || learnerEmpId}).
            Module <strong>{rawModuleId}</strong> is still playable (demo); completions still attach to{' '}
            <code className="text-[10px]">{learnerEmpId}</code>. Prefer Academy for the assigned catalog.
          </>
        )}
      </div>
    ) : null;

  // The OASIS-E2 SOC simulator IS the page: cover the full viewport, above
  // the topbar and floating shell controls, so only the workspace is visible.
  if (isOasisSocModule(params.moduleId) || getLvnStandaloneModule(params.moduleId ?? '')) {
    return (
      <section
        aria-label={getLvnStandaloneModule(params.moduleId ?? '') ? 'LVN Module simulator' : 'OASIS-E2 SOC simulator'}
        className="fixed inset-0 z-[9999] overflow-hidden bg-white"
        data-hash-id="module-player"
        data-route="/journey/module/:moduleId"
      >
        {element}
      </section>
    );
  }

  // element hoisted above (see top of ModulePlayerScreen) for P0-002 hook order fix

  return (
    <section
      aria-label="Onboarding course player"
      className="relative -m-xl min-h-[calc(100vh-var(--topbar-h))] bg-[linear-gradient(135deg,rgba(247,254,255,0.98),rgba(255,255,255,0.94)_48%,rgba(250,248,248,0.96))] px-0 py-lg text-ink"
      data-hash-id="module-player"
      data-route="/journey/module/:moduleId"
      data-template="module-player"
    >
      <div className="w-full p-0 md:p-0 flex flex-col h-full" style={{ minHeight: 'calc(100vh - var(--topbar-h) - 2rem)' }}>
        {assignmentBanner}
        <div className="flex-1">
          {element}
        </div>
      </div>
    </section>
  );
}

export default ModulePlayerScreen;
