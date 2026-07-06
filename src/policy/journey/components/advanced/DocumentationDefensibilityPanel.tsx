import { useMemo, useState, type CSSProperties } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  FileText,
  GraduationCap,
  PlayCircle,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { courseMeta, modules } from '../../data/advancedTraining/documentationMatters/courseContent';
import { finalAssessment } from '../../data/advancedTraining/documentationMatters/quizContent';
import { sandboxScenarios } from '../../data/advancedTraining/documentationMatters/sandboxContent';
import { glossaryCategories, glossaryTerms } from '../../data/advancedTraining/documentationMatters/glossaryContent';
import { referenceMaterials } from '../../data/advancedTraining/documentationMatters/referenceContent';
import {
  documentationMattersAudioPath,
  hasDocumentationMattersAudio,
} from '../../data/advancedTraining/documentationMattersAudio';
import { useNarrationGate } from './useNarrationGate';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: Record<string, unknown>) => void;
  onEvidence?: (artifact: Record<string, unknown>) => void;
}

type TabKey = 'course' | 'practice' | 'assessment' | 'resources';
type AssessmentResult = { score: number; correct: number; total: number; passed: boolean };

const colors = {
  teal: '#00797D',
  tealDark: '#004142',
  tealSoft: '#E6F4F4',
  orange: '#C74601',
  orangeSoft: '#FFF4ED',
  green: '#0F8A5F',
  greenSoft: '#E8F7F0',
  red: '#B42318',
  redSoft: '#FEF3F2',
  blueSoft: '#EEF6FF',
  ink: '#1E293B',
  muted: '#64748B',
  line: '#E2E8F0',
  page: '#F7FBFB',
  white: '#FFFFFF',
};

const shadow = '0 14px 38px rgba(15, 23, 42, 0.08)';
const subtleShadow = '0 1px 3px rgba(15, 23, 42, 0.08), 0 10px 24px rgba(15, 23, 42, 0.05)';

const card: CSSProperties = {
  background: colors.white,
  borderRadius: 8,
  boxShadow: subtleShadow,
};

const tabs: { key: TabKey; label: string; sub: string; Icon: LucideIcon }[] = [
  { key: 'course', label: 'Course', sub: '8 modules', Icon: BookOpen },
  { key: 'practice', label: 'Practice Lab', sub: `${sandboxScenarios.length} cases`, Icon: FileSearch },
  { key: 'assessment', label: 'Final Assessment', sub: '80% pass', Icon: ClipboardCheck },
  { key: 'resources', label: 'Resources', sub: 'Glossary + guides', Icon: FileText },
];

function makeCompletionArtifact(
  moduleId: string,
  score: number,
  passed: boolean,
  correct: number,
  total: number,
  practiceAnswers: Record<string, string>,
) {
  const timestamp = new Date().toISOString();

  return {
    policy_id: 'CL-CD-001',
    workflow_id: 'wf-rn-adv-04-doc',
    event_id: 'evt-rn-adv-04-complete',
    module_id: moduleId,
    learner_id: 'demo-learner',
    timestamp,
    assessment_score: score,
    completion_artifact_type: 'documentation-matters-lms',
    noPhi: true,
    policyId: 'CL-CD-001',
    workflowId: 'wf-rn-adv-04-doc',
    eventId: 'evt-rn-adv-04-complete',
    moduleId,
    learnerId: 'demo-learner',
    artifactType: 'documentation-matters-lms',
    score,
    passed,
    passThreshold: 80,
    details: {
      correct,
      total,
      courseTitle: courseMeta.title,
      practiceCasesAttempted: Object.keys(practiceAnswers).length,
      resourcesAvailable: referenceMaterials.length,
      glossaryTerms: glossaryTerms.length,
    },
  };
}

function statusTone(isActive: boolean, isDone = false): CSSProperties {
  if (isActive) {
    return { background: colors.tealSoft, color: colors.tealDark, boxShadow: `inset 4px 0 0 ${colors.teal}` };
  }
  if (isDone) {
    return { background: colors.greenSoft, color: colors.tealDark, boxShadow: `inset 4px 0 0 ${colors.green}` };
  }
  return { background: '#F8FAFC', color: colors.ink, boxShadow: `inset 4px 0 0 ${colors.line}` };
}

function choiceTone(selected: boolean, correct?: boolean): CSSProperties {
  if (!selected) return { background: colors.white };
  if (correct === true) return { background: colors.greenSoft, boxShadow: `inset 0 0 0 2px ${colors.green}` };
  if (correct === false) return { background: colors.redSoft, boxShadow: `inset 0 0 0 2px ${colors.red}` };
  return { background: colors.tealSoft, boxShadow: `inset 0 0 0 2px ${colors.teal}` };
}

export const DocumentationDefensibilityPanel = ({ moduleId, onComplete, onEvidence }: Props) => {
  const trainingModules = useMemo(() => modules.filter((module) => module.number <= 8), []);
  const flatLessons = useMemo(
    () =>
      trainingModules.flatMap((module, moduleIndex) =>
        module.lessons.map((lesson, lessonIndex) => ({ module, moduleIndex, lesson, lessonIndex })),
      ),
    [trainingModules],
  );
  const assessmentItems = useMemo(() => finalAssessment.slice(0, 13), []);

  const [activeTab, setActiveTab] = useState<TabKey>('course');
  const [activeModuleId, setActiveModuleId] = useState(trainingModules[0]?.id ?? '');
  const [activeLessonId, setActiveLessonId] = useState(trainingModules[0]?.lessons[0]?.id ?? '');
  const [reviewedLessons, setReviewedLessons] = useState<Record<string, boolean>>({});
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<string, string>>({});
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [activeGlossaryCategory, setActiveGlossaryCategory] = useState<string>('All');

  const currentModule = trainingModules.find((module) => module.id === activeModuleId) ?? trainingModules[0];
  const currentLesson =
    currentModule?.lessons.find((lesson) => lesson.id === activeLessonId) ?? currentModule?.lessons[0];
  const currentLessonKey = currentLesson?.id ?? '';
  const reviewedCount = flatLessons.filter((item) => reviewedLessons[item.lesson.id]).length;
  const courseProgress = Math.round((reviewedCount / Math.max(flatLessons.length, 1)) * 100);
  const currentPractice = sandboxScenarios[practiceIndex] ?? sandboxScenarios[0];
  const selectedPracticeAnswer = currentPractice ? practiceAnswers[currentPractice.id] : undefined;
  const practiceCorrect = selectedPracticeAnswer === currentPractice?.correctOptionId;
  const assessmentComplete = assessmentItems.every((item) => Boolean(assessmentAnswers[item.id]));
  const currentLessonNarrationKey = currentLesson
    ? `documentation-matters.lesson.${currentLesson.id.toLowerCase()}.delivery`
    : 'documentation-matters.lesson.none.delivery';
  const currentLessonNarrationSrc =
    currentLesson && hasDocumentationMattersAudio(currentLesson.id)
      ? documentationMattersAudioPath(currentLesson.id)
      : null;
  const narrationGate = useNarrationGate({
    gateKey: currentLessonNarrationKey,
    audioSrc: currentLessonNarrationSrc,
    required: activeTab === 'course' && Boolean(currentLesson),
    missingNarrationReason: `Missing Documentation Matters narration audio for ${currentLessonNarrationKey}.`,
  });
  const canLeaveCurrentLesson = activeTab !== 'course' || narrationGate.canProceed;

  const filteredGlossaryTerms = glossaryTerms.filter((term) => {
    const matchesCategory = activeGlossaryCategory === 'All' || term.category === activeGlossaryCategory;
    const query = glossarySearch.trim().toLowerCase();
    const matchesSearch =
      !query || term.term.toLowerCase().includes(query) || term.definition.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const selectModule = (targetModuleId: string) => {
    if (targetModuleId !== activeModuleId && !canLeaveCurrentLesson) return;
    const nextModule = trainingModules.find((module) => module.id === targetModuleId);
    setActiveModuleId(targetModuleId);
    setActiveLessonId(nextModule?.lessons[0]?.id ?? '');
  };

  const markLessonReviewed = () => {
    if (!narrationGate.canProceed) return;
    if (!currentLessonKey) return;
    setReviewedLessons((current) => ({ ...current, [currentLessonKey]: true }));
  };

  const goToNextLesson = () => {
    if (!narrationGate.canProceed) return;
    if (!currentLesson) return;
    const currentIndex = flatLessons.findIndex((item) => item.lesson.id === currentLesson.id);
    const next = flatLessons[currentIndex + 1];
    if (next) {
      setActiveModuleId(next.module.id);
      setActiveLessonId(next.lesson.id);
    } else {
      setActiveTab('practice');
    }
  };

  const submitAssessment = () => {
    if (!assessmentComplete) return;

    const correct = assessmentItems.filter((item) => assessmentAnswers[item.id] === item.correctOptionId).length;
    const total = assessmentItems.length;
    const score = Math.round((correct / Math.max(total, 1)) * 100);
    const passed = score >= 80;
    const artifact = makeCompletionArtifact(moduleId, score, passed, correct, total, practiceAnswers);

    setAssessmentResult({ score, correct, total, passed });
    onEvidence?.(artifact);
    onComplete?.(score, passed, artifact);
  };

  return (
    <div
      style={{
        minHeight: 720,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: colors.page,
        color: colors.ink,
        borderRadius: 8,
        boxShadow: shadow,
      }}
    >
      <header
        style={{
          background: `linear-gradient(135deg, ${colors.tealDark}, ${colors.teal})`,
          color: colors.white,
          padding: '18px 22px',
          display: 'flex',
          gap: 18,
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 860 }}>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0, textTransform: 'uppercase', opacity: 0.82 }}>
            RN-ADV-04 | Advanced Training
          </div>
          <h1 style={{ margin: '4px 0 6px', fontSize: 26, lineHeight: 1.12, fontWeight: 800, color: colors.white }}>
            CMS Documentation Matters
          </h1>
          <p style={{ margin: 0, maxWidth: 900, fontSize: 13, lineHeight: 1.5, opacity: 0.88 }}>
            {courseMeta.subtitle}. Audit-ready visit notes, skilled-need support, and documentation integrity for home
            health clinicians and reviewers.
          </p>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(88px, 1fr))',
            gap: 8,
            minWidth: 280,
          }}
        >
          {[
            ['Progress', `${courseProgress}%`],
            ['Lessons', `${reviewedCount}/${flatLessons.length}`],
            ['Final', assessmentResult ? `${assessmentResult.score}%` : '--'],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.14)', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: 10, opacity: 0.78, textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>
      </header>

      <nav
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: 10,
          padding: 12,
          background: colors.white,
          boxShadow: '0 1px 0 rgba(15, 23, 42, 0.08)',
        }}
      >
        {tabs.map(({ key, label, sub, Icon }) => {
          const active = activeTab === key;
          const locked = activeTab === 'course' && key !== 'course' && !narrationGate.canProceed;
          return (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (locked) return;
                setActiveTab(key);
              }}
              disabled={locked}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '11px 12px',
                borderRadius: 8,
                background: active ? colors.tealSoft : '#F8FAFC',
                color: active ? colors.tealDark : colors.muted,
                boxShadow: active ? `inset 0 0 0 2px ${colors.teal}` : 'none',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.45 : 1,
                textAlign: 'left',
              }}
            >
              <Icon size={18} />
              <span>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 13 }}>{label}</span>
                <span style={{ display: 'block', fontSize: 11 }}>{sub}</span>
              </span>
            </button>
          );
        })}
      </nav>

      <main style={{ flex: 1, minHeight: 0, overflow: 'auto', padding: 16 }}>
        {activeTab === 'course' && (
          <div style={{ display: 'flex', gap: 16, alignItems: 'stretch', flexWrap: 'wrap' }}>
            <aside style={{ ...card, flex: '0 1 300px', padding: 12, alignSelf: 'flex-start' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                    Course Path
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{courseMeta.estimatedTime}</div>
                </div>
                <ShieldCheck size={22} color={colors.teal} />
              </div>
              <div style={{ margin: '12px 0', height: 8, borderRadius: 999, background: '#E2E8F0', overflow: 'hidden' }}>
                <div style={{ width: `${courseProgress}%`, height: '100%', background: colors.teal }} />
              </div>
              <div style={{ display: 'grid', gap: 8 }}>
                {trainingModules.map((module) => {
                  const done = module.lessons.every((lesson) => reviewedLessons[lesson.id]);
                  const active = module.id === currentModule?.id;
                  const locked = !active && !canLeaveCurrentLesson;
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => selectModule(module.id)}
                      disabled={locked}
                      style={{
                        ...statusTone(active, done),
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: 8,
                        padding: 10,
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.45 : 1,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 800 }}>Module {module.number}</span>
                        {done ? <CheckCircle2 size={15} color={colors.green} /> : <ChevronRight size={15} />}
                      </div>
                      <div style={{ marginTop: 4, fontWeight: 800, fontSize: 13, lineHeight: 1.25 }}>{module.title}</div>
                      <div style={{ marginTop: 3, fontSize: 11, color: colors.muted }}>
                        {module.lessons.length} lessons | {module.estimatedMinutes} min
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section style={{ ...card, flex: '1 1 520px', minWidth: 320, padding: 18 }}>
              {currentModule && currentLesson && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      gap: 14,
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                        Module {currentModule.number} | Lesson {currentLesson.id}
                      </div>
                      <h2 style={{ margin: '4px 0 6px', fontSize: 22, lineHeight: 1.18 }}>{currentLesson.title}</h2>
                      <p style={{ margin: 0, color: colors.muted, lineHeight: 1.5, maxWidth: 760 }}>
                        {currentModule.description}
                      </p>
                    </div>
                    {reviewedLessons[currentLesson.id] && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          borderRadius: 999,
                          background: colors.greenSoft,
                          color: colors.green,
                          padding: '7px 10px',
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        <CheckCircle2 size={15} />
                        Reviewed
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      background: '#F8FAFC',
                      borderRadius: 8,
                      padding: 12,
                      boxShadow: `inset 0 0 0 1px ${colors.line}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        color: colors.tealDark,
                        fontSize: 12,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                      }}
                    >
                      <PlayCircle size={16} color={colors.orange} />
                      Narration
                    </div>
                    {currentLessonNarrationSrc ? (
                      <audio
                        ref={narrationGate.audioRef}
                        key={currentLessonNarrationKey}
                        controls
                        preload="metadata"
                        src={currentLessonNarrationSrc}
                        onPlay={narrationGate.onPlay}
                        onPause={narrationGate.onPause}
                        onEnded={narrationGate.onEnded}
                        onError={narrationGate.onError}
                        style={{ width: '100%', marginTop: 10 }}
                      >
                        <track kind="captions" />
                      </audio>
                    ) : (
                      <div
                        style={{
                          marginTop: 10,
                          background: colors.orangeSoft,
                          color: '#7A2E0E',
                          borderRadius: 8,
                          padding: 10,
                          fontSize: 13,
                          lineHeight: 1.45,
                        }}
                      >
                        {narrationGate.missingNarrationReason}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 10 }}>
                      <button
                        type="button"
                        onClick={narrationGate.playbackState === 'playing' ? narrationGate.pause : narrationGate.play}
                        disabled={!currentLessonNarrationSrc}
                        style={{
                          borderRadius: 8,
                          padding: '9px 12px',
                          background: colors.teal,
                          color: colors.white,
                          fontWeight: 800,
                          cursor: currentLessonNarrationSrc ? 'pointer' : 'not-allowed',
                          opacity: currentLessonNarrationSrc ? 1 : 0.45,
                        }}
                      >
                        {narrationGate.playbackState === 'playing'
                          ? 'Pause Narration'
                          : narrationGate.canProceed
                            ? 'Replay Narration'
                            : 'Play Narration'}
                      </button>
                      <div style={{ minWidth: 220, flex: 1, fontSize: 13, color: colors.muted, lineHeight: 1.45 }}>
                        <div style={{ color: colors.tealDark, fontWeight: 900 }}>{narrationGate.statusLabel}</div>
                        <div>{narrationGate.helperText}</div>
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: 10,
                      marginTop: 16,
                    }}
                  >
                    {[
                      ['Context', currentLesson.context],
                      ['Key Rule', currentLesson.keyRule],
                      ['Why It Matters', currentLesson.whyItMatters],
                      ['Example', currentLesson.example],
                    ].map(([label, body]) => (
                      <div key={label} style={{ background: '#F8FAFC', borderRadius: 8, padding: 12 }}>
                        <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                          {label}
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 13, lineHeight: 1.48, color: colors.ink }}>
                          {body}
                        </p>
                      </div>
                    ))}
                  </div>

                  {(currentLesson.auditRisk || currentLesson.clinicalRisk || currentLesson.documentationTip) && (
                    <div
                      style={{
                        marginTop: 14,
                        background: colors.orangeSoft,
                        color: '#7A2E0E',
                        borderRadius: 8,
                        padding: 12,
                        display: 'flex',
                        gap: 10,
                      }}
                    >
                      <AlertTriangle size={18} color={colors.orange} />
                      <div style={{ fontSize: 13, lineHeight: 1.45 }}>
                        {currentLesson.auditRisk ?? currentLesson.clinicalRisk ?? currentLesson.documentationTip}
                      </div>
                    </div>
                  )}

                  {currentLesson.scenario && (
                    <div style={{ marginTop: 14, background: colors.blueSoft, borderRadius: 8, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.tealDark }}>
                        <ClipboardCheck size={18} />
                        <strong>Scenario Challenge</strong>
                      </div>
                      <p style={{ margin: '8px 0 10px', lineHeight: 1.5 }}>{currentLesson.scenario.stem}</p>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {currentLesson.scenario.options.map((option) => (
                          <div
                            key={option.id}
                            style={{
                              background:
                                option.id === currentLesson.scenario?.correctOptionId ? colors.greenSoft : colors.white,
                              borderRadius: 8,
                              padding: 10,
                              boxShadow:
                                option.id === currentLesson.scenario?.correctOptionId
                                  ? `inset 0 0 0 2px ${colors.green}`
                                  : 'none',
                            }}
                          >
                            <strong>{option.id}.</strong> {option.text}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 10, fontSize: 13, color: colors.tealDark, lineHeight: 1.45 }}>
                        <strong>Auditor conclusion:</strong> {currentLesson.scenario.rationale.auditorConclusion}
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: 14, background: colors.tealSoft, borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                      Key Takeaway
                    </div>
                    <p style={{ margin: '5px 0 0', fontWeight: 700, lineHeight: 1.45 }}>{currentLesson.keyTakeaway}</p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {currentModule.lessons.map((lesson) => (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => setActiveLessonId(lesson.id)}
                          disabled={lesson.id !== currentLesson.id && !narrationGate.canProceed}
                          title={lesson.title}
                          style={{
                            width: 36,
                            height: 32,
                            borderRadius: 8,
                            background: lesson.id === currentLesson.id ? colors.teal : '#F1F5F9',
                            color: lesson.id === currentLesson.id ? colors.white : colors.muted,
                            fontSize: 11,
                            fontWeight: 800,
                            cursor:
                              lesson.id !== currentLesson.id && !narrationGate.canProceed ? 'not-allowed' : 'pointer',
                            opacity: lesson.id !== currentLesson.id && !narrationGate.canProceed ? 0.45 : 1,
                          }}
                        >
                          {lesson.id.split('-')[1]}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={markLessonReviewed}
                        disabled={!narrationGate.canProceed}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          borderRadius: 8,
                          padding: '10px 12px',
                          background: colors.tealSoft,
                          color: colors.tealDark,
                          fontWeight: 800,
                          cursor: narrationGate.canProceed ? 'pointer' : 'not-allowed',
                          opacity: narrationGate.canProceed ? 1 : 0.45,
                        }}
                      >
                        <CheckCircle2 size={16} />
                        Mark Reviewed
                      </button>
                      <button
                        type="button"
                        onClick={goToNextLesson}
                        disabled={!narrationGate.canProceed}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                          borderRadius: 8,
                          padding: '10px 14px',
                          background: colors.teal,
                          color: colors.white,
                          fontWeight: 800,
                          cursor: narrationGate.canProceed ? 'pointer' : 'not-allowed',
                          opacity: narrationGate.canProceed ? 1 : 0.45,
                        }}
                      >
                        Next
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {activeTab === 'practice' && currentPractice && (
          <section style={{ ...card, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: colors.orange, fontWeight: 800, textTransform: 'uppercase' }}>
                  Practice Case {practiceIndex + 1} of {sandboxScenarios.length}
                </div>
                <h2 style={{ margin: '4px 0', fontSize: 22 }}>{currentPractice.title}</h2>
                <p style={{ margin: 0, color: colors.muted }}>{currentPractice.difficulty} documentation review</p>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setPracticeIndex((value) => Math.max(0, value - 1))}
                  disabled={practiceIndex === 0}
                  style={{
                    borderRadius: 8,
                    padding: '9px 11px',
                    background: '#F1F5F9',
                    color: colors.muted,
                    cursor: practiceIndex === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPracticeIndex((value) => Math.min(sandboxScenarios.length - 1, value + 1))}
                  disabled={practiceIndex === sandboxScenarios.length - 1}
                  style={{
                    borderRadius: 8,
                    padding: '9px 11px',
                    background: colors.teal,
                    color: colors.white,
                    cursor: practiceIndex === sandboxScenarios.length - 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Next Case
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 16 }}>
              <div style={{ background: '#F8FAFC', borderRadius: 8, padding: 14 }}>
                <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                  Case Context
                </div>
                <p style={{ lineHeight: 1.5 }}>{currentPractice.context}</p>
                <div style={{ marginTop: 12, background: colors.white, borderRadius: 8, padding: 12, color: colors.ink }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: colors.muted, textTransform: 'uppercase' }}>
                    Note Excerpt
                  </div>
                  <p style={{ marginBottom: 0, lineHeight: 1.55 }}>{currentPractice.noteExcerpt}</p>
                </div>
              </div>

              <div>
                <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>{currentPractice.question}</h3>
                <div style={{ display: 'grid', gap: 9 }}>
                  {currentPractice.options.map((option) => {
                    const selected = selectedPracticeAnswer === option.id;
                    const answered = Boolean(selectedPracticeAnswer);
                    const isCorrect = option.id === currentPractice.correctOptionId;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() =>
                          setPracticeAnswers((current) => ({ ...current, [currentPractice.id]: option.id }))
                        }
                        style={{
                          ...choiceTone(selected, answered ? isCorrect : undefined),
                          display: 'flex',
                          gap: 9,
                          alignItems: 'flex-start',
                          width: '100%',
                          borderRadius: 8,
                          padding: 11,
                          textAlign: 'left',
                          cursor: 'pointer',
                          lineHeight: 1.42,
                        }}
                      >
                        <strong style={{ color: selected ? colors.tealDark : colors.teal }}>{option.id.toUpperCase()}.</strong>
                        <span>{option.text}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {selectedPracticeAnswer && (
              <div
                style={{
                  marginTop: 16,
                  background: practiceCorrect ? colors.greenSoft : colors.redSoft,
                  color: practiceCorrect ? colors.tealDark : colors.red,
                  borderRadius: 8,
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 800 }}>
                  {practiceCorrect ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                  {practiceCorrect ? 'Defensible answer selected' : 'Review the documentation risk'}
                </div>
                <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>{currentPractice.rationale.whyCorrect}</p>
                <p style={{ margin: '8px 0 0', lineHeight: 1.5 }}>
                  <strong>Auditor conclusion:</strong> {currentPractice.rationale.auditorConclusion}
                </p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'assessment' && (
          <section style={{ ...card, padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                  Final Assessment
                </div>
                <h2 style={{ margin: '4px 0', fontSize: 22 }}>Documentation Matters Mastery Check</h2>
                <p style={{ margin: 0, color: colors.muted }}>
                  {Object.keys(assessmentAnswers).length}/{assessmentItems.length} answered | Passing score 80%
                </p>
              </div>
              {assessmentResult && (
                <div
                  style={{
                    background: assessmentResult.passed ? colors.greenSoft : colors.redSoft,
                    color: assessmentResult.passed ? colors.green : colors.red,
                    borderRadius: 8,
                    padding: '10px 14px',
                    minWidth: 150,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 24, fontWeight: 900 }}>{assessmentResult.score}%</div>
                  <div style={{ fontSize: 12, fontWeight: 800 }}>
                    {assessmentResult.passed ? 'Passed' : 'Remediation Needed'}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: 14, marginTop: 16 }}>
              {assessmentItems.map((item, index) => {
                const selected = assessmentAnswers[item.id];
                return (
                  <div key={item.id} style={{ background: '#F8FAFC', borderRadius: 8, padding: 14 }}>
                    <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                      Question {index + 1}
                    </div>
                    <p style={{ margin: '6px 0 10px', lineHeight: 1.5, fontWeight: 700 }}>{item.stem}</p>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {item.options.map((option) => {
                        const optionSelected = selected === option.id;
                        const showCorrectness = Boolean(assessmentResult);
                        const isCorrect = option.id === item.correctOptionId;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            disabled={Boolean(assessmentResult)}
                            onClick={() =>
                              setAssessmentAnswers((current) => ({ ...current, [item.id]: option.id }))
                            }
                            style={{
                              ...choiceTone(optionSelected, showCorrectness ? isCorrect : undefined),
                              width: '100%',
                              borderRadius: 8,
                              padding: 10,
                              textAlign: 'left',
                              cursor: assessmentResult ? 'default' : 'pointer',
                              lineHeight: 1.42,
                            }}
                          >
                            <strong style={{ color: colors.teal }}>{option.id}.</strong> {option.text}
                          </button>
                        );
                      })}
                    </div>
                    {assessmentResult && (
                      <p style={{ margin: '10px 0 0', fontSize: 13, color: colors.muted, lineHeight: 1.45 }}>
                        <strong>Rationale:</strong> {item.rationale.whyCorrect}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                type="button"
                onClick={submitAssessment}
                disabled={!assessmentComplete || Boolean(assessmentResult)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 9,
                  borderRadius: 8,
                  padding: '12px 16px',
                  background: !assessmentComplete || assessmentResult ? '#CBD5E1' : colors.orange,
                  color: colors.white,
                  fontWeight: 900,
                  cursor: !assessmentComplete || assessmentResult ? 'not-allowed' : 'pointer',
                }}
              >
                <GraduationCap size={18} />
                Submit and Record Evidence
              </button>
            </div>
          </section>
        )}

        {activeTab === 'resources' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
            <section style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800, textTransform: 'uppercase' }}>
                    Glossary
                  </div>
                  <h2 style={{ margin: '4px 0', fontSize: 20 }}>Documentation Terms</h2>
                </div>
                <Search size={20} color={colors.teal} />
              </div>
              <input
                value={glossarySearch}
                onChange={(event) => setGlossarySearch(event.target.value)}
                placeholder="Search terms"
                style={{
                  width: '100%',
                  marginTop: 10,
                  borderRadius: 8,
                  padding: '10px 12px',
                  boxShadow: `inset 0 0 0 1px ${colors.line}`,
                  outline: 'none',
                  background: colors.white,
                }}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                {['All', ...glossaryCategories].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveGlossaryCategory(category)}
                    style={{
                      borderRadius: 999,
                      padding: '7px 10px',
                      background: activeGlossaryCategory === category ? colors.teal : '#F1F5F9',
                      color: activeGlossaryCategory === category ? colors.white : colors.muted,
                      fontWeight: 800,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <div style={{ display: 'grid', gap: 10, marginTop: 12, maxHeight: 520, overflow: 'auto' }}>
                {filteredGlossaryTerms.map((term) => (
                  <div key={term.term} style={{ background: '#F8FAFC', borderRadius: 8, padding: 11 }}>
                    <div style={{ fontWeight: 900 }}>{term.term}</div>
                    <div style={{ fontSize: 11, color: colors.teal, fontWeight: 800 }}>{term.category}</div>
                    <p style={{ margin: '5px 0 0', fontSize: 13, lineHeight: 1.45 }}>{term.definition}</p>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...card, padding: 16 }}>
              <div style={{ fontSize: 11, color: colors.orange, fontWeight: 800, textTransform: 'uppercase' }}>
                Job Aids
              </div>
              <h2 style={{ margin: '4px 0 10px', fontSize: 20 }}>Reference Materials</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {referenceMaterials.map((reference) => (
                  <details key={reference.id} style={{ background: '#F8FAFC', borderRadius: 8, padding: 12 }}>
                    <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                        <div>
                          <div style={{ fontWeight: 900 }}>{reference.title}</div>
                          <div style={{ fontSize: 11, color: colors.muted }}>{reference.audience}</div>
                        </div>
                        <ChevronRight size={16} color={colors.teal} />
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 13, color: colors.muted, lineHeight: 1.45 }}>
                        {reference.description}
                      </p>
                    </summary>
                    <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: colors.ink, fontSize: 13, lineHeight: 1.5 }}>
                      {reference.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <footer
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
          padding: '10px 16px',
          background: colors.white,
          boxShadow: '0 -1px 0 rgba(15, 23, 42, 0.08)',
          color: colors.muted,
          fontSize: 12,
        }}
      >
        <span>Care Indeed Journey | Documentation Matters</span>
        <span>No PHI. Training scenarios are fictional and for competency practice only.</span>
      </footer>
    </div>
  );
};
