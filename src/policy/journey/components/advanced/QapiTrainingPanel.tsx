import { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  GraduationCap,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  Target,
  Trophy,
  TriangleAlert,
} from 'lucide-react';
import type { ModuleLesson } from '../../data/lessonModel';
import { qapiModule, qapiQuizzes } from '../../data/advancedTraining/qapi.data';
import { useNarrationGate } from './useNarrationGate';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
  onEvidence?: (artifact: any) => void;
}

type PlayerMode = 'learn' | 'challenge' | 'assessment' | 'evidence';
type QapiQuiz = (typeof qapiQuizzes)[number];
type PresentationFocus = 'framework' | 'survey' | 'field' | 'terms';

const SECTION_TITLES = [
  'QAPI Regulatory Overview',
  'Data-Driven Quality Monitoring',
  'Performance Improvement Projects',
  'ADR & Survey Readiness',
  'Defensible QAPI Binder',
] as const;

const LESSONS = qapiModule.lessons;
const PASS_THRESHOLD = 80;
const REQUIRED_FOCUS_STEPS: PresentationFocus[] = ['framework', 'survey', 'field', 'terms'];
const REQUIRED_FLOW_STEPS = ['measure', 'analyze', 'improve', 'prove'] as const;

function lessonAudioUrl(lesson: ModuleLesson): string {
  const stem = lesson.title
    .toLowerCase()
    .replace(/§/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `/advanced-training/qapi/audio/${String(lesson.index).padStart(2, '0')}-${stem}.wav`;
}

function sectionIndexForLesson(lesson: ModuleLesson): number {
  return Math.min(SECTION_TITLES.length - 1, Math.max(0, Math.floor((lesson.index - 1) / 7)));
}

function sectionTitleForLesson(lesson: ModuleLesson): string {
  return SECTION_TITLES[sectionIndexForLesson(lesson)];
}

function scoreAssessment(answers: Record<string, string>) {
  const correct = qapiQuizzes.reduce((count, question) => {
    return answers[question.id] === question.correctAnswerId ? count + 1 : count;
  }, 0);
  return {
    correct,
    total: qapiQuizzes.length,
    pct: qapiQuizzes.length ? Math.round((correct / qapiQuizzes.length) * 100) : 0,
  };
}

function buildCompletionArtifact(
  moduleId: string,
  score: number,
  passed: boolean,
  completedLessonIds: string[],
) {
  return {
    policy_id: 'QA-PG-001',
    workflow_id: 'wf-rn-adv-02-qapi',
    event_id: 'evt-rn-adv-02-complete',
    module_id: moduleId,
    learner_id: 'demo-learner',
    timestamp: new Date().toISOString(),
    assessment_score: score,
    pass_threshold: PASS_THRESHOLD,
    passed,
    completion_artifact_type: 'qapi-course-evidence',
    completed_lessons: completedLessonIds.length,
    total_lessons: LESSONS.length,
    assessment_questions: qapiQuizzes.length,
    noPhi: true,
    policyId: 'QA-PG-001',
    workflowId: 'wf-rn-adv-02-qapi',
    eventId: 'evt-rn-adv-02-complete',
    moduleId,
    learnerId: 'demo-learner',
    score,
    artifactType: 'qapi-course-evidence',
  };
}

export function QapiTrainingPanel({ moduleId, onComplete, onEvidence }: Props) {
  const [mode, setMode] = useState<PlayerMode>('learn');
  const [openSectionIndex, setOpenSectionIndex] = useState<number | null>(0);
  const [presentationFocus, setPresentationFocus] = useState<PresentationFocus>('framework');
  const [lessonClicks, setLessonClicks] = useState<Record<string, string[]>>({});
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [lessonAnswers, setLessonAnswers] = useState<Record<string, string>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<string, string>>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [completionArtifact, setCompletionArtifact] = useState<Record<string, unknown> | null>(null);

  const currentLesson = (LESSONS[activeLessonIndex] ?? LESSONS[0]) as ModuleLesson;
  const currentCheck = currentLesson.knowledgeCheck;
  const selectedLessonAnswer = lessonAnswers[currentLesson.id];
  const currentLessonComplete = completedLessons.includes(currentLesson.id);
  const completedCount = completedLessons.length;
  const progressPct = Math.round((completedCount / LESSONS.length) * 100);
  const activeSectionIndex = sectionIndexForLesson(currentLesson);
  const answeredPracticeChecks = Object.keys(lessonAnswers).length;
  const correctPracticeChecks = LESSONS.reduce((count, lesson) => {
    if (!lesson.knowledgeCheck) return count;
    return lessonAnswers[lesson.id] === lesson.knowledgeCheck.correctId ? count + 1 : count;
  }, 0);
  const practicePct = answeredPracticeChecks
    ? Math.round((correctPracticeChecks / answeredPracticeChecks) * 100)
    : 0;
  const assessmentScore = useMemo(() => scoreAssessment(examAnswers), [examAnswers]);
  const assessmentReady = Object.keys(examAnswers).length === qapiQuizzes.length;
  const assessmentPassed = examSubmitted && assessmentScore.pct >= PASS_THRESHOLD;
  const narrationUrl = lessonAudioUrl(currentLesson);
  const narrationGate = useNarrationGate({
    gateKey: currentLesson.id,
    audioSrc: narrationUrl,
    required: true,
    missingNarrationReason: `Missing QAPI narration audio for lesson ${currentLesson.index}: ${narrationUrl}`,
  });
  const narrationComplete = narrationGate.narrationCompleted;
  const clickedForLesson = new Set(lessonClicks[currentLesson.id] ?? []);
  const reviewClickKeys = [
    ...(currentLesson.scenario ? ['review:scenario'] : []),
    'review:supplemental',
    'review:trap',
    ...(currentLesson.keyTerms.length > 0 ? ['review:terms-card'] : []),
  ];
  const requiredClickKeys = [
    ...REQUIRED_FOCUS_STEPS.map((id) => `focus:${id}`),
    ...REQUIRED_FLOW_STEPS.map((id) => `flow:${id}`),
    ...reviewClickKeys,
  ];
  const challengeUnlocked = narrationComplete && requiredClickKeys.every((key) => clickedForLesson.has(key));
  const nextRequiredKey = narrationComplete
    ? requiredClickKeys.find((key) => !clickedForLesson.has(key)) ?? null
    : null;

  const sectionGroups = useMemo(() => {
    return SECTION_TITLES.map((title, index) => ({
      title,
      lessons: LESSONS.filter((lesson) => sectionIndexForLesson(lesson) === index),
    }));
  }, []);

  useEffect(() => {
    setPresentationFocus('framework');
  }, [currentLesson.id]);

  const markInteraction = (key: string) => {
    if (!narrationComplete) return;
    setLessonClicks((prev) => {
      const current = prev[currentLesson.id] ?? [];
      return current.includes(key)
        ? prev
        : { ...prev, [currentLesson.id]: [...current, key] };
    });
  };

  const requiredLabelForKey = (key: string | null): string => {
    if (!narrationComplete) return 'Play and finish the lesson narration.';
    if (!key) return 'Challenge unlocked.';
    const labels: Record<string, string> = {
      'focus:framework': 'Click Core frame.',
      'focus:survey': 'Open Survey lens.',
      'focus:field': 'Open Field application.',
      'focus:terms': 'Open Terminology.',
      'flow:measure': 'Click Measure in the QAPI Flow.',
      'flow:analyze': 'Click Analyze in the QAPI Flow.',
      'flow:improve': 'Click Improve in the QAPI Flow.',
      'flow:prove': 'Click Prove in the QAPI Flow.',
      'review:scenario': 'Review the Scenario Challenge card.',
      'review:supplemental': 'Open Supplemental Notes.',
      'review:trap': 'Open the Defensibility Trap.',
      'review:terms-card': 'Open Key Terms.',
    };
    return labels[key] ?? 'Continue the guided clicks.';
  };

  const openChallenge = () => {
    if (!challengeUnlocked) return;
    setMode('challenge');
  };

  const markLessonComplete = (lessonId = currentLesson.id) => {
    setCompletedLessons((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
  };

  const goToLesson = (index: number) => {
    const nextIndex = Math.max(0, Math.min(LESSONS.length - 1, index));
    const nextLesson = (LESSONS[nextIndex] ?? LESSONS[0]) as ModuleLesson;
    setActiveLessonIndex(nextIndex);
    setOpenSectionIndex(sectionIndexForLesson(nextLesson));
    setMode('learn');
  };

  const goPrevious = () => {
    goToLesson(activeLessonIndex - 1);
  };

  const goNext = () => {
    markLessonComplete();
    if (activeLessonIndex < LESSONS.length - 1) {
      goToLesson(activeLessonIndex + 1);
      return;
    }
    setMode('assessment');
  };

  const handleLessonAnswer = (choiceId: string) => {
    setLessonAnswers((prev) => ({ ...prev, [currentLesson.id]: choiceId }));
  };

  const handleExamAnswer = (questionId: string, choiceId: string) => {
    if (examSubmitted) return;
    setExamAnswers((prev) => ({ ...prev, [questionId]: choiceId }));
  };

  const submitAssessment = () => {
    const scored = scoreAssessment(examAnswers);
    const passed = scored.pct >= PASS_THRESHOLD;
    const completeIds = completedLessons.length === LESSONS.length
      ? completedLessons
      : Array.from(new Set([...completedLessons, ...LESSONS.map((lesson) => lesson.id)]));
    const artifact = buildCompletionArtifact(moduleId, scored.pct, passed, completeIds);

    setCompletedLessons(completeIds);
    setCompletionArtifact(artifact);
    setExamSubmitted(true);
    onEvidence?.(artifact);
    onComplete?.(scored.pct, passed, artifact);
    if (passed) setMode('evidence');
  };

  const resetAssessment = () => {
    setExamAnswers({});
    setExamSubmitted(false);
    setCompletionArtifact(null);
  };

  const renderLessonContent = () => {
    const focusPanels: Record<PresentationFocus, { title: string; kicker: string; body: string; bullets: string[] }> = {
      framework: {
        title: 'QAPI is an operating system, not a binder',
        kicker: 'Core frame',
        body: 'A compliant program converts quality signals into decisions, interventions, evidence, and sustained monitoring.',
        bullets: [
          'Define the quality signal and data source.',
          'Assign ownership for review and action.',
          'Document the improvement cycle and outcome.',
        ],
      },
      survey: {
        title: 'What surveyors trace',
        kicker: 'Survey lens',
        body: currentLesson.whyItMatters[0] ?? 'Surveyors expect operational proof, not a policy-only explanation.',
        bullets: [
          'Can the team show current data?',
          'Can the team explain why a PIP was selected?',
          'Can governance evidence show oversight?',
        ],
      },
      field: {
        title: 'How this shows up in daily work',
        kicker: 'Field application',
        body: currentLesson.practiceExample,
        bullets: [
          'Tie the issue to patient safety, compliance, or reimbursement.',
          'Write the action so another reviewer can follow the logic.',
          'Close the loop with measurable response data.',
        ],
      },
      terms: {
        title: 'Language reviewers expect',
        kicker: 'Terminology',
        body: currentLesson.keyTerms[0]?.definition ?? currentLesson.summary,
        bullets: currentLesson.keyTerms.slice(0, 3).map((term) => `${term.term}: ${term.definition}`),
      },
    };
    const activePanel = focusPanels[presentationFocus];
    const flowSteps = [
      ['measure', '1', 'Measure', 'Collect QAPI data from OASIS, incidents, audits, and patient feedback.'],
      ['analyze', '2', 'Analyze', 'Look for trends, root causes, repeat risks, and priority problems.'],
      ['improve', '3', 'Improve', 'Launch a focused PIP, assign owners, and document interventions.'],
      ['prove', '4', 'Prove', 'Show outcomes, sustainability, meeting minutes, and governance review.'],
    ] as const;
    const completedRequiredClicks = requiredClickKeys.filter((key) => clickedForLesson.has(key)).length;
    const nextInstruction = requiredLabelForKey(nextRequiredKey);

    return (
      <div className="flex h-full min-h-0 flex-col bg-[linear-gradient(180deg,var(--surface-base),var(--tone-teal-bg))]">
        <div className="border-b border-hairline bg-white px-6 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-brand-orange">
                {sectionTitleForLesson(currentLesson)} - Lesson {currentLesson.index} of {LESSONS.length}
              </div>
              <h3 className="text-2xl font-medium leading-tight text-brand-teal-deep">{currentLesson.title}</h3>
            </div>
            <div className="rounded-lg border border-tone-teal-border bg-tone-teal-bg px-4 py-3 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Progress</div>
              <div className="text-xl font-medium text-brand-teal">{progressPct}%</div>
            </div>
            </div>
            <div className="mt-4 rounded-lg border border-tone-teal-border bg-tone-teal-bg p-4">
              <audio
                ref={narrationGate.audioRef}
                key={narrationUrl}
                src={narrationUrl}
                controls
                className="mb-3 w-full"
                preload="metadata"
                onPlay={narrationGate.onPlay}
                onPause={narrationGate.onPause}
                onEnded={narrationGate.onEnded}
                onError={narrationGate.onError}
              />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={narrationGate.playbackState === 'playing' ? narrationGate.pause : narrationGate.play}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-teal-deep"
                >
                  {narrationGate.playbackState === 'playing' ? 'Pause Narration' : narrationComplete ? 'Replay Narration' : 'Play Narration'}
                </button>
                <div className="min-w-[220px] flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    {narrationGate.statusLabel}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-secondary">
                    {narrationComplete
                      ? `Next: ${nextInstruction}`
                      : narrationGate.helperText}
                  </p>
                </div>
              <div className="rounded-lg border border-hairline bg-white px-3 py-2 text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Unlock path</div>
                <div className="text-sm font-medium text-brand-teal-deep">
                  {completedRequiredClicks}/{requiredClickKeys.length} clicks
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="mx-auto grid max-w-[1500px] gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)]">
            <main className="space-y-5">
              <section className="overflow-hidden rounded-lg border border-hairline bg-white shadow-rest">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="p-6">
                    <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                      <Target size={15} />
                      Learning Goal
                    </div>
                    <p className="max-w-4xl text-xl leading-relaxed text-ink">{currentLesson.learningGoal}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(['framework', 'survey', 'field', 'terms'] as PresentationFocus[]).map((id) => {
                        const active = presentationFocus === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              if (!narrationComplete) return;
                              setPresentationFocus(id);
                              markInteraction(`focus:${id}`);
                            }}
                            disabled={!narrationComplete}
                            aria-pressed={active}
                            className={`rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                              active
                                ? 'border-brand-teal bg-brand-teal text-white'
                                : 'border-hairline bg-surface-glass text-brand-teal hover:bg-surface-hover'
                            }`}
                          >
                            {focusPanels[id].kicker}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="border-t border-hairline bg-tone-teal-bg p-6 lg:border-l lg:border-t-0">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                      {activePanel.kicker}
                    </div>
                    <h4 className="text-lg font-medium leading-tight text-brand-teal-deep">{activePanel.title}</h4>
                    <p className="mt-3 text-sm leading-relaxed text-secondary">{activePanel.body}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-hairline bg-white p-5 shadow-rest">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    <BookOpen size={15} />
                    Core Content
                  </div>
                  <span className="rounded-md bg-tone-slate-bg px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                    Source lesson
                  </span>
                </div>
                <div
                  className="space-y-3 text-base leading-relaxed text-ink [&_li]:mb-3 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: currentLesson.keyConcept }}
                />
              </section>

              <section className="rounded-lg border border-hairline bg-white p-5 shadow-rest">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  <ClipboardCheck size={15} />
                  QAPI Flow
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                  {flowSteps.map(([id, step, label, body]) => {
                    const clicked = clickedForLesson.has(`flow:${id}`);
                    return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => markInteraction(`flow:${id}`)}
                      disabled={!narrationComplete}
                      className={`rounded-lg border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                        clicked
                          ? 'border-tone-green-border bg-tone-green-bg'
                          : 'border-hairline bg-surface-glass hover:bg-surface-hover'
                      }`}
                    >
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal text-sm font-bold text-white">
                        {step}
                      </div>
                      <h5 className="text-sm font-medium text-brand-teal-deep">{label}</h5>
                      <p className="mt-2 text-xs leading-relaxed text-secondary">{body}</p>
                    </button>
                  );
                  })}
                </div>
              </section>

            </main>

            <aside className="space-y-5">
              {currentLesson.scenario && (
                <section className="rounded-lg border border-tone-amber-border bg-tone-amber-bg p-5 shadow-rest">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-tone-amber-text">
                      <ListChecks size={15} />
                      Scenario Challenge
                    </div>
                    <button
                      type="button"
                      onClick={openChallenge}
                      disabled={!challengeUnlocked}
                      className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {challengeUnlocked ? 'Open Challenge' : 'Challenge Locked'}
                      <ChevronRight size={14} />
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-ink">{currentLesson.scenario}</p>
                  <button
                    type="button"
                    onClick={() => markInteraction('review:scenario')}
                    disabled={!narrationComplete}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-tone-amber-border bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-tone-amber-text transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {clickedForLesson.has('review:scenario') ? 'Scenario Reviewed' : 'Review Scenario'}
                  </button>
                </section>
              )}

              <button
                type="button"
                onClick={() => markInteraction('review:supplemental')}
                disabled={!narrationComplete}
                className={`block w-full rounded-lg border p-5 text-left shadow-rest transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  clickedForLesson.has('review:supplemental')
                    ? 'border-tone-green-border bg-tone-green-bg'
                    : 'border-hairline bg-white hover:bg-surface-hover'
                }`}
              >
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  <ShieldCheck size={14} />
                  Supplemental Notes
                </div>
                <div className="space-y-3">
                  {activePanel.bullets.map((bullet) => (
                    <div key={bullet} className="rounded-lg border border-hairline bg-surface-glass p-3 text-sm leading-relaxed text-secondary">
                      {bullet}
                    </div>
                  ))}
                </div>
              </button>

              <button
                type="button"
                onClick={() => markInteraction('review:trap')}
                disabled={!narrationComplete}
                className={`block w-full rounded-lg border p-5 text-left shadow-rest transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                  clickedForLesson.has('review:trap')
                    ? 'border-tone-green-border bg-tone-green-bg'
                    : 'border-hairline bg-white hover:bg-surface-hover'
                }`}
              >
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  <TriangleAlert size={14} />
                  Defensibility Trap
                </div>
                <p className="text-sm leading-relaxed text-secondary">{currentLesson.commonMistake}</p>
              </button>

              {currentLesson.keyTerms.length > 0 && (
                <button
                  type="button"
                  onClick={() => markInteraction('review:terms-card')}
                  disabled={!narrationComplete}
                  className={`block w-full rounded-lg border p-5 text-left shadow-rest transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                    clickedForLesson.has('review:terms-card')
                      ? 'border-tone-green-border bg-tone-green-bg'
                      : 'border-hairline bg-white hover:bg-surface-hover'
                  }`}
                >
                  <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    <FileText size={14} />
                    Key Terms
                  </div>
                  <div className="space-y-3">
                    {currentLesson.keyTerms.slice(0, 3).map((term) => (
                      <div key={term.term}>
                        <div className="text-xs font-medium text-brand-teal-deep">{term.term}</div>
                        <p className="text-xs leading-relaxed text-secondary">{term.definition}</p>
                      </div>
                    ))}
                  </div>
                </button>
              )}
            </aside>
          </div>
        </div>

        <div className="border-t border-hairline bg-white px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={goPrevious}
              disabled={activeLessonIndex === 0 || !narrationComplete}
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
              Previous
            </button>
            <button
              type="button"
              onClick={() => markLessonComplete()}
              disabled={currentLessonComplete || !challengeUnlocked || Boolean(currentCheck && !selectedLessonAnswer)}
              className="inline-flex items-center gap-2 rounded-lg border border-tone-teal-border bg-tone-teal-bg px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 size={15} />
              {currentLessonComplete ? 'Completed' : 'Mark Complete'}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!currentLessonComplete}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-rest transition-colors hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {activeLessonIndex === LESSONS.length - 1 ? 'Assessment' : 'Next'}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderChallenge = () => {
    const isCorrect = selectedLessonAnswer && currentCheck
      ? selectedLessonAnswer === currentCheck.correctId
      : false;

    return (
      <div className="flex h-full min-h-0 flex-col">
        <div className="border-b border-hairline bg-surface-glass px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                Challenge - Lesson {currentLesson.index} of {LESSONS.length}
              </div>
              <h3 className="text-xl font-medium leading-tight text-brand-teal-deep">{currentLesson.title}</h3>
            </div>
            <div className="rounded-lg border border-tone-teal-border bg-tone-teal-bg px-3 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Practice</div>
              <div className="text-lg font-medium text-brand-teal">
                {answeredPracticeChecks ? `${practicePct}%` : '0%'}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {currentCheck ? (
            <section className="mx-auto max-w-5xl rounded-lg border border-hairline bg-white p-5 shadow-rest">
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                    <ListChecks size={14} />
                    Lesson Challenge
                  </div>
                  <p className="text-base font-medium leading-relaxed text-ink">{currentCheck.prompt}</p>
                </div>
                {selectedLessonAnswer && (
                  <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider ${
                    isCorrect
                      ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text'
                      : 'border-tone-amber-border bg-tone-amber-bg text-tone-amber-text'
                  }`}>
                    {isCorrect ? <CheckCircle2 size={15} /> : <TriangleAlert size={15} />}
                    {isCorrect ? 'Correct' : 'Review'}
                  </div>
                )}
              </div>

              {currentLesson.scenario && (
                <div className="mb-4 rounded-lg border border-tone-amber-border bg-tone-amber-bg p-4">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-tone-amber-text">
                    Scenario
                  </div>
                  <p className="text-sm leading-relaxed text-ink">{currentLesson.scenario}</p>
                </div>
              )}

              <div className="space-y-2">
                {currentCheck.choices.map((choice) => {
                  const selected = selectedLessonAnswer === choice.id;
                  const correct = choice.id === currentCheck.correctId;
                  const showResult = Boolean(selectedLessonAnswer);
                  const resultClass = showResult && selected
                    ? correct
                      ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text'
                      : 'border-tone-amber-border bg-tone-amber-bg text-tone-amber-text'
                    : selected
                      ? 'border-brand-teal bg-tone-teal-bg text-brand-teal'
                      : 'border-hairline bg-surface-glass text-ink hover:bg-surface-hover';

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => handleLessonAnswer(choice.id)}
                      className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm leading-relaxed transition-colors ${resultClass}`}
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current text-[11px] font-bold">
                        {choice.id}
                      </span>
                      <span className="flex-1">{choice.label}</span>
                      {showResult && selected && (
                        isCorrect ? <CheckCircle2 size={18} /> : <TriangleAlert size={18} />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedLessonAnswer && (
                <div className={`mt-4 rounded-lg border p-3 text-sm leading-relaxed ${
                  isCorrect
                    ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text'
                    : 'border-tone-amber-border bg-tone-amber-bg text-tone-amber-text'
                }`}>
                  {isCorrect ? currentCheck.feedbackCorrect : currentCheck.feedbackIncorrect}
                </div>
              )}
            </section>
          ) : (
            <section className="mx-auto max-w-5xl rounded-lg border border-hairline bg-white p-5 shadow-rest">
              <div className="mb-3 flex items-center gap-2 text-brand-teal">
                <ListChecks size={20} />
                <h4 className="text-lg font-medium text-brand-teal-deep">No challenge for this lesson</h4>
              </div>
              <p className="text-sm leading-relaxed text-secondary">
                Continue through the course or move to the next lesson.
              </p>
            </section>
          )}
        </div>

        <div className="border-t border-hairline bg-surface-glass px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setMode('learn')}
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal transition-colors hover:bg-surface-hover"
            >
              <BookOpen size={15} />
              Course
            </button>
            <button
              type="button"
              onClick={() => markLessonComplete()}
              disabled={currentLessonComplete || Boolean(currentCheck && !selectedLessonAnswer)}
              className="inline-flex items-center gap-2 rounded-lg border border-tone-teal-border bg-tone-teal-bg px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <CheckCircle2 size={15} />
              {currentLessonComplete ? 'Completed' : 'Mark Complete'}
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={Boolean(currentCheck && !selectedLessonAnswer)}
              className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-rest transition-colors hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {activeLessonIndex === LESSONS.length - 1 ? 'Assessment' : 'Next Lesson'}
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderAssessmentQuestion = (question: QapiQuiz, index: number) => {
    const selectedAnswer = examAnswers[question.id];

    return (
      <section key={question.id} className="rounded-lg border border-hairline bg-white p-4 shadow-rest">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-brand-teal">
            Question {index + 1} of {qapiQuizzes.length} - {question.module}
          </div>
          {examSubmitted && (
            <div className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
              selectedAnswer === question.correctAnswerId
                ? 'bg-tone-green-bg text-tone-green-text'
                : 'bg-tone-red-bg text-tone-red-text'
            }`}>
              {selectedAnswer === question.correctAnswerId ? <CheckCircle2 size={13} /> : <TriangleAlert size={13} />}
              {selectedAnswer === question.correctAnswerId ? 'Correct' : 'Review'}
            </div>
          )}
        </div>

        <p className="mb-3 text-sm leading-relaxed text-secondary">{question.scenario}</p>
        <p className="mb-3 text-sm font-medium leading-relaxed text-ink">{question.question}</p>

        <div className="space-y-2">
          {question.options.map((option) => {
            const selected = selectedAnswer === option.id;
            const correct = option.id === question.correctAnswerId;
            const resultClass = examSubmitted
              ? correct
                ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text'
                : selected
                  ? 'border-tone-red-border bg-tone-red-bg text-tone-red-text'
                  : 'border-hairline bg-surface-glass text-secondary'
              : selected
                ? 'border-brand-teal bg-tone-teal-bg text-brand-teal'
                : 'border-hairline bg-surface-glass text-ink hover:bg-surface-hover';

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleExamAnswer(question.id, option.id)}
                className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left text-sm leading-relaxed transition-colors ${resultClass}`}
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current text-[11px] font-bold">
                  {option.id.replace(/^q\d+/, '').toUpperCase() || option.id.toUpperCase()}
                </span>
                <span className="flex-1">{option.label}</span>
              </button>
            );
          })}
        </div>

        {examSubmitted && (
          <div className="mt-3 rounded-lg border border-tone-slate-border bg-tone-slate-bg p-3 text-xs leading-relaxed text-secondary">
            {question.options.find((option) => option.id === question.correctAnswerId)?.rationale}
          </div>
        )}
      </section>
    );
  };

  const renderAssessment = () => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-hairline bg-surface-glass px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
              RN-ADV-02 Assessment
            </div>
            <h3 className="text-xl font-medium text-brand-teal-deep">QAPI Final Check</h3>
          </div>
          <div className="rounded-lg border border-tone-teal-border bg-tone-teal-bg px-3 py-2 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Answered</div>
            <div className="text-lg font-medium text-brand-teal">
              {Object.keys(examAnswers).length}/{qapiQuizzes.length}
            </div>
          </div>
        </div>
        {examSubmitted && (
          <div className={`mt-3 rounded-lg border p-3 text-sm font-medium ${
            assessmentPassed
              ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text'
              : 'border-tone-amber-border bg-tone-amber-bg text-tone-amber-text'
          }`}>
            Score: {assessmentScore.pct}% ({assessmentScore.correct}/{assessmentScore.total}). Passing threshold: {PASS_THRESHOLD}%.
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        {qapiQuizzes.map(renderAssessmentQuestion)}
      </div>

      <div className="border-t border-hairline bg-surface-glass px-5 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('learn')}
            className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal transition-colors hover:bg-surface-hover"
          >
            <BookOpen size={15} />
            Return to Course
          </button>
          {examSubmitted && (
            <button
              type="button"
              onClick={resetAssessment}
              className="inline-flex items-center gap-2 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-bold uppercase tracking-wider text-brand-teal transition-colors hover:bg-surface-hover"
            >
              <RotateCcw size={15} />
              Retake
            </button>
          )}
          <button
            type="button"
            onClick={submitAssessment}
            disabled={!assessmentReady || examSubmitted}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-rest transition-colors hover:bg-brand-teal-deep disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ClipboardCheck size={15} />
            Submit Evidence
          </button>
        </div>
      </div>
    </div>
  );

  const renderEvidence = () => (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-hairline bg-surface-glass px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
              Completion Evidence
            </div>
            <h3 className="text-xl font-medium text-brand-teal-deep">QAPI Training Record</h3>
          </div>
          {completionArtifact && (
            <div className="rounded-lg border border-tone-green-border bg-tone-green-bg px-3 py-2 text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-tone-green-text">Recorded</div>
              <div className="text-lg font-medium text-tone-green-text">{String(completionArtifact.score)}%</div>
            </div>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {completionArtifact ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <section className="rounded-lg border border-tone-green-border bg-white p-5 shadow-rest">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-tone-green-bg text-tone-green-text">
                  <Trophy size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-brand-teal-deep">RN-ADV-02 complete</h4>
                  <p className="text-sm text-secondary">
                    Quality Assessment and Performance Improvement training evidence is ready.
                  </p>
                </div>
              </div>
              <dl className="grid gap-3 sm:grid-cols-2">
                {([
                  ['Policy', completionArtifact.policyId],
                  ['Workflow', completionArtifact.workflowId],
                  ['Event', completionArtifact.eventId],
                  ['Artifact', completionArtifact.artifactType],
                  ['Lessons', `${completionArtifact.completed_lessons}/${completionArtifact.total_lessons}`],
                  ['Timestamp', completionArtifact.timestamp],
                ] as Array<[string, unknown]>).map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-hairline bg-surface-glass p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</dt>
                    <dd className="mt-1 break-words text-sm font-medium text-ink">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <aside className="space-y-4">
              <section className="rounded-lg border border-hairline bg-white p-4 shadow-rest">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  <ShieldCheck size={14} />
                  No PHI
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  The record uses demo training scenarios only and attaches to Journey completion evidence.
                </p>
              </section>
              <section className="rounded-lg border border-hairline bg-white p-4 shadow-rest">
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-brand-teal">
                  <FileCheck2 size={14} />
                  Assessment
                </div>
                <p className="text-sm leading-relaxed text-secondary">
                  {assessmentScore.correct} correct out of {assessmentScore.total}; pass threshold {PASS_THRESHOLD}%.
                </p>
              </section>
            </aside>
          </div>
        ) : (
          <section className="rounded-lg border border-hairline bg-white p-5 shadow-rest">
            <div className="mb-3 flex items-center gap-2 text-brand-teal">
              <FileCheck2 size={20} />
              <h4 className="text-lg font-medium text-brand-teal-deep">Evidence pending</h4>
            </div>
            <p className="text-sm leading-relaxed text-secondary">
              Complete the assessment to generate the QAPI training evidence record.
            </p>
          </section>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex h-screen w-screen flex-col overflow-hidden bg-white">
      <header className="shrink-0 border-b border-hairline bg-[linear-gradient(135deg,var(--tone-teal-bg),var(--surface-base))] px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-white">
              <GraduationCap size={22} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand-orange">RN-ADV-02</div>
              <h2 className="truncate text-xl font-medium text-brand-teal-deep">{qapiModule.shortTitle}</h2>
              <p className="text-xs leading-relaxed text-secondary">{qapiModule.summary}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'learn' as const, label: 'Course', icon: BookOpen },
              { id: 'assessment' as const, label: 'Assessment', icon: ClipboardCheck },
              { id: 'evidence' as const, label: 'Evidence', icon: FileCheck2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = mode === tab.id;
              const locked = !narrationComplete && tab.id !== 'learn';
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setMode(tab.id)}
                  disabled={locked}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                    active
                      ? 'border-brand-teal bg-brand-teal text-white'
                      : 'border-hairline bg-white text-brand-teal hover:bg-surface-hover'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ['Lessons', `${completedCount}/${LESSONS.length}`],
            ['Challenge', answeredPracticeChecks ? `${practicePct}%` : 'Not started'],
            ['Assessment', examSubmitted ? `${assessmentScore.pct}%` : `${Object.keys(examAnswers).length}/${qapiQuizzes.length}`],
            ['Policy', 'QA-PG-001'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-hairline bg-white px-3 py-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</div>
              <div className="mt-1 text-sm font-medium text-brand-teal-deep">{value}</div>
            </div>
          ))}
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-b border-hairline bg-surface-glass p-4 lg:border-b-0 lg:border-r">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-wider text-brand-teal">Course Sections</div>
          <div className="space-y-3">
            {sectionGroups.map((section, sectionIndex) => {
              const sectionCompleted = section.lessons.filter((lesson) => completedLessons.includes(lesson.id)).length;
              const active = sectionIndex === activeSectionIndex;
              const open = openSectionIndex === sectionIndex;
              return (
                <section key={section.title} className={`overflow-hidden rounded-lg border ${active ? 'border-brand-teal bg-tone-teal-bg' : 'border-hairline bg-white'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!narrationComplete) return;
                      setOpenSectionIndex((prev) => (prev === sectionIndex ? null : sectionIndex));
                    }}
                    disabled={!narrationComplete}
                    aria-expanded={open}
                    className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <span>
                      <span className="block text-xs font-medium leading-tight text-brand-teal-deep">{section.title}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-muted">
                        {sectionCompleted}/{section.lessons.length} complete
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`shrink-0 text-brand-teal transition-transform ${open ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {open && (
                    <div className="border-t border-hairline bg-white px-2 py-2">
                      <div className="space-y-1">
                        {section.lessons.map((lesson) => {
                          const selected = lesson.id === currentLesson.id;
                          const complete = completedLessons.includes(lesson.id);
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => goToLesson(lesson.index - 1)}
                              disabled={!narrationComplete}
                              className={`flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-xs leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${
                                selected
                                  ? 'bg-brand-teal text-white'
                                  : 'text-secondary hover:bg-surface-hover'
                              }`}
                            >
                              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-[10px] ${
                                selected ? 'border-white text-white' : 'border-tone-teal-border text-brand-teal'
                              }`}>
                                {complete ? <CheckCircle2 size={13} /> : lesson.index}
                              </span>
                              <span className="line-clamp-2">{lesson.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </aside>

        <div className="min-h-0">
          {mode === 'learn' && renderLessonContent()}
          {mode === 'challenge' && renderChallenge()}
          {mode === 'assessment' && renderAssessment()}
          {mode === 'evidence' && renderEvidence()}
        </div>
      </div>
    </div>
  );
}
