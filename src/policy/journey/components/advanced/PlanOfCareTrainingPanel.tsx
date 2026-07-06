import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Headphones,
  ListChecks,
  Microscope,
  PlayCircle,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { hasNarrationAudio, narrationAssetPath } from '../../data/narrationManifest';
import { cms485Cases, type CaseField, type ClinicalCase } from '../../data/advancedTraining/cms485PlanOfCareCases.data';
import { getTermsForSection } from '../../data/advancedTraining/cms485Terminology';
import { SECTIONS, TRAINING_CARDS, type TrainingCard } from '../../data/advancedTraining/cms485SourceCards';

interface Props {
  moduleId: string;
  onComplete?: (score: number, passed: boolean, artifact?: any) => void;
  onEvidence?: (artifact: any) => void;
}

type PanelMode = 'lessons' | 'audit-lab';
type ChallengeResult = { selectedIndex: number; correct: boolean };
type CaseAnswers = Record<string, Record<string, string[]>>;

const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

function sectionIndexForCard(card: TrainingCard): number {
  return Math.max(0, SECTIONS.indexOf(card.section as (typeof SECTIONS)[number]));
}

function appLocationForCard(cardIndex: number, stage: 'overview' | 'delivery' | 'challenge'): string {
  const card = TRAINING_CARDS[cardIndex];
  const lessonNumber = sectionIndexForCard(card) + 1;
  return `cms-485.lesson.l${lessonNumber}.s${cardIndex + 1}.${stage}`;
}

function buildCompletionArtifact(moduleId: string, score: number, details: Record<string, any> = {}) {
  return {
    policy_id: 'CL-CP-001',
    workflow_id: 'wf-rn-adv-01-poc',
    event_id: 'evt-rn-adv-01-complete',
    module_id: moduleId,
    learner_id: 'demo-learner',
    timestamp: new Date().toISOString(),
    assessment_score: score,
    completion_artifact_type: 'cms-485-plan-of-care-lms',
    noPhi: true,
    policyId: 'CL-CP-001',
    workflowId: 'wf-rn-adv-01-poc',
    eventId: 'evt-rn-adv-01-complete',
    moduleId,
    learnerId: 'demo-learner',
    score,
    passThreshold: 80,
    passed: score >= 80,
    artifactType: 'cms-485-plan-of-care-lms',
    details,
  };
}

function arraysEqual(a: string[], b: string[]) {
  return [...a].sort().join('|') === [...b].sort().join('|');
}

function getCaseScore(caseItem: ClinicalCase, caseAnswers: Record<string, string[]> = {}) {
  const total = caseItem.fields.length;
  if (total === 0) return 0;
  const correct = caseItem.fields.filter((field) => arraysEqual(caseAnswers[field.id] ?? [], field.correctAnswerIds)).length;
  return Math.round((correct / total) * 100);
}

function answeredFieldCount(caseItem: ClinicalCase, caseAnswers: Record<string, string[]> = {}) {
  return caseItem.fields.filter((field) => (caseAnswers[field.id]?.length ?? 0) > 0).length;
}

function SectionRail({
  activeSectionIndex,
  viewedCards,
  onSelectSection,
}: {
  activeSectionIndex: number;
  viewedCards: Set<number>;
  onSelectSection: (section: string) => void;
}) {
  return (
    <aside className="rounded-lg bg-surface-glass p-md shadow-rest">
      <div className="mb-md flex items-center gap-sm text-sm font-medium text-brand-teal-deep">
        <BookOpen size={18} className="text-brand-teal" />
        Course Sections
      </div>
      <div className="grid gap-sm">
        {SECTIONS.map((section, idx) => {
          const cards = TRAINING_CARDS.filter((card) => card.section === section);
          const firstIndex = TRAINING_CARDS.findIndex((card) => card.section === section);
          const viewed = cards.filter((_, localIdx) => viewedCards.has(firstIndex + localIdx)).length;
          const isActive = idx === activeSectionIndex;

          return (
            <button
              key={section}
              type="button"
              onClick={() => onSelectSection(section)}
              className={cx(
                'grid w-full grid-cols-[24px_minmax(0,1fr)_auto] items-center gap-sm rounded-lg px-sm py-sm text-left transition duration-fast',
                isActive ? 'bg-tone-teal-bg text-brand-teal-deep shadow-glass-inset' : 'bg-transparent text-secondary hover:bg-surface-hover',
              )}
            >
              <span className={cx('flex h-6 w-6 items-center justify-center rounded-md text-[10px]', isActive ? 'bg-brand-teal text-white' : 'bg-surface-glass text-muted')}>
                {idx + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium">{section}</span>
                <span className="block text-[10px] text-muted">{viewed}/{cards.length} viewed</span>
              </span>
              {viewed === cards.length && <CheckCircle2 size={15} className="text-tone-green-text" />}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

function LessonPanel({
  card,
  cardIndex,
  challengeResult,
  onAnswerChallenge,
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
}: {
  card: TrainingCard;
  cardIndex: number;
  challengeResult?: ChallengeResult;
  onAnswerChallenge: (index: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}) {
  const deliveryLocation = appLocationForCard(cardIndex, 'delivery');
  const challengeLocation = appLocationForCard(cardIndex, 'challenge');
  const audioAvailable = hasNarrationAudio(deliveryLocation);
  const body = card.body?.length ? card.body : card.bullets;

  return (
    <article className="rounded-lg bg-surface-glass p-lg shadow-rest">
      <div className="mb-lg flex flex-wrap items-center justify-between gap-md">
        <div>
          <div className="mb-xs flex flex-wrap items-center gap-sm text-tag text-muted">
            <span className="rounded-md bg-tone-teal-bg px-sm py-xs text-brand-teal">Lesson {cardIndex + 1} of {TRAINING_CARDS.length}</span>
            <span>{card.section}</span>
          </div>
          <h2 className="text-h2 font-medium text-brand-teal-deep">{card.title}</h2>
        </div>
        <div className="flex min-h-tap items-center gap-sm rounded-lg bg-surface-glass px-md py-sm text-xs text-muted shadow-glass-inset">
          <Headphones size={16} className="text-brand-teal" />
          {audioAvailable ? 'Narration available' : 'Transcript available'}
        </div>
      </div>

      <div className="mb-lg rounded-lg bg-tone-teal-bg p-md shadow-glass-inset">
        <div className="mb-xs flex items-center gap-sm text-xs font-medium text-brand-teal-deep">
          <Target size={16} className="text-brand-teal" />
          Learning Objective
        </div>
        <p className="text-sm text-secondary">{card.objective}</p>
      </div>

      {audioAvailable && (
        <div className="mb-lg rounded-lg bg-surface-glass p-md shadow-glass-inset">
          <div className="mb-sm flex items-center gap-sm text-xs font-medium text-brand-teal-deep">
            <PlayCircle size={16} className="text-brand-orange" />
            Narration
          </div>
          <audio key={deliveryLocation} controls preload="none" className="w-full" src={narrationAssetPath(deliveryLocation)}>
            <track kind="captions" />
          </audio>
        </div>
      )}

      <div className="grid gap-lg laptop:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-md">
          {body.map((paragraph, idx) => (
            <p key={`${card.title}-body-${idx}`} className="text-sm leading-body text-secondary">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="rounded-lg bg-surface-glass p-md shadow-glass-inset">
          <div className="mb-sm flex items-center gap-sm text-xs font-medium text-brand-teal-deep">
            <ListChecks size={16} className="text-brand-teal" />
            Key Points
          </div>
          <ul className="space-y-sm">
            {card.bullets.map((bullet) => (
              <li key={bullet} className="grid grid-cols-[18px_minmax(0,1fr)] gap-sm text-xs leading-xs text-secondary">
                <Check size={15} className="mt-[1px] text-tone-green-text" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {card.auditFocus && (
            <div className="mt-md rounded-lg bg-tone-orange-bg p-sm text-xs text-tone-orange-text shadow-glass-inset">
              <span className="font-medium">Audit focus: </span>{card.auditFocus}
            </div>
          )}
        </div>
      </div>

      <div className="mt-lg rounded-lg bg-tone-slate-bg p-md shadow-glass-inset">
        <div className="mb-sm flex items-center justify-between gap-md">
          <div className="flex items-center gap-sm text-sm font-medium text-brand-teal-deep">
            <ClipboardCheck size={18} className="text-brand-orange" />
            Scenario Challenge
          </div>
          <span className="text-[10px] text-muted">{challengeLocation}</span>
        </div>
        <p className="mb-md text-xs leading-xs text-secondary">{card.challenge.scenario}</p>
        <p className="mb-md text-sm font-medium text-brand-teal-deep">{card.challenge.question}</p>
        <div className="grid gap-sm">
          {card.challenge.options.map((option, idx) => {
            const selected = challengeResult?.selectedIndex === idx;
            const answered = challengeResult !== undefined;
            const isCorrect = idx === 0;
            return (
              <button
                key={`${card.title}-${idx}`}
                type="button"
                onClick={() => onAnswerChallenge(idx)}
                className={cx(
                  'grid min-h-tap grid-cols-[28px_minmax(0,1fr)_24px] items-start gap-sm rounded-lg px-md py-sm text-left text-xs transition duration-fast',
                  selected && isCorrect && 'bg-tone-green-bg text-tone-green-text shadow-glass-inset',
                  selected && !isCorrect && 'bg-tone-orange-bg text-tone-orange-text shadow-glass-inset',
                  !selected && answered && isCorrect && 'bg-tone-teal-bg text-brand-teal-deep shadow-glass-inset',
                  !selected && !answered && 'bg-surface-glass text-secondary hover:bg-surface-hover shadow-glass-inset',
                  !selected && answered && !isCorrect && 'bg-surface-glass text-muted shadow-glass-inset',
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/60 text-[11px] font-medium">{optionLetters[idx] ?? idx + 1}</span>
                <span className="leading-xs">{option}</span>
                {answered && isCorrect && <CheckCircle2 size={16} className="mt-1 text-tone-green-text" />}
                {selected && !isCorrect && <AlertCircle size={16} className="mt-1 text-tone-orange-text" />}
              </button>
            );
          })}
        </div>
        {challengeResult && (
          <div className="mt-md rounded-lg bg-surface-glass p-md text-xs leading-xs text-secondary shadow-glass-inset">
            <span className={cx('font-medium', challengeResult.correct ? 'text-tone-green-text' : 'text-tone-orange-text')}>
              {challengeResult.correct ? 'Correct. ' : 'Review. '}
            </span>
            {card.challenge.correctLogic}
          </div>
        )}
      </div>

      <div className="mt-lg flex flex-wrap items-center justify-between gap-md">
        <button
          type="button"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-surface-glass px-md py-sm text-xs font-medium text-brand-teal shadow-glass-inset transition hover:bg-surface-hover disabled:opacity-40"
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-brand-teal px-md py-sm text-xs font-medium text-white shadow-pill-action transition hover:opacity-90 disabled:opacity-40"
        >
          Next
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

function ReferenceRail({
  activeCard,
  lessonProgress,
  challengeScore,
  answeredChallenges,
}: {
  activeCard: TrainingCard;
  lessonProgress: number;
  challengeScore: number;
  answeredChallenges: number;
}) {
  const terms = getTermsForSection(activeCard.section);
  const traceSteps = ['Assessment', 'Orders', 'Goals', 'Visit frequency', 'Signature'];

  return (
    <aside className="space-y-lg">
      <div className="rounded-lg bg-surface-glass p-md shadow-rest">
        <div className="mb-sm flex items-center gap-sm text-sm font-medium text-brand-teal-deep">
          <ShieldCheck size={18} className="text-brand-teal" />
          Progress
        </div>
        <div className="space-y-sm text-xs text-secondary">
          <div>
            <div className="mb-xs flex justify-between">
              <span>Lessons viewed</span>
              <strong className="text-brand-teal-deep">{lessonProgress}%</strong>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-glass">
              <div className="h-full rounded-full bg-brand-teal" style={{ width: `${lessonProgress}%` }} />
            </div>
          </div>
          <div className="flex justify-between rounded-lg bg-surface-glass p-sm shadow-glass-inset">
            <span>Challenges answered</span>
            <strong className="text-brand-teal-deep">{answeredChallenges}/{TRAINING_CARDS.length}</strong>
          </div>
          <div className="flex justify-between rounded-lg bg-surface-glass p-sm shadow-glass-inset">
            <span>Challenge score</span>
            <strong className="text-brand-orange">{challengeScore || 0}%</strong>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-surface-glass p-md shadow-rest">
        <div className="mb-sm flex items-center gap-sm text-sm font-medium text-brand-teal-deep">
          <FileText size={18} className="text-brand-orange" />
          Traceability
        </div>
        <div className="grid gap-sm">
          {traceSteps.map((step, idx) => (
            <div key={step} className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-sm rounded-lg bg-surface-glass p-sm text-xs text-secondary shadow-glass-inset">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-tone-teal-bg text-[10px] text-brand-teal">{idx + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-surface-glass p-md shadow-rest">
        <div className="mb-sm flex items-center gap-sm text-sm font-medium text-brand-teal-deep">
          <BookOpen size={18} className="text-brand-teal" />
          Terminology
        </div>
        <div className="grid gap-sm">
          {terms.length ? terms.map((term) => (
            <div key={`${activeCard.section}-${term.id}`} className="rounded-lg bg-surface-glass p-sm text-xs shadow-glass-inset">
              <div className="font-medium text-brand-teal-deep">{term.term}</div>
              <div className="mt-xs text-muted">{term.def}</div>
            </div>
          )) : (
            <p className="text-xs text-muted">No terms mapped for this section.</p>
          )}
        </div>
      </div>
    </aside>
  );
}

function CaseAuditLab({ moduleId, onComplete, onEvidence }: Props) {
  const [caseIndex, setCaseIndex] = useState(0);
  const [fieldIndex, setFieldIndex] = useState(0);
  const [answers, setAnswers] = useState<CaseAnswers>({});
  const [recordedCases, setRecordedCases] = useState<Set<string>>(() => new Set());

  const currentCase = cms485Cases[caseIndex];
  const field = currentCase.fields[fieldIndex];
  const caseAnswers = answers[currentCase.id] ?? {};
  const chosen = caseAnswers[field.id] ?? [];
  const completedFields = answeredFieldCount(currentCase, caseAnswers);
  const currentCaseScore = getCaseScore(currentCase, caseAnswers);
  const currentCaseComplete = completedFields === currentCase.fields.length;
  const allCasesComplete = cms485Cases.every((caseItem) => answeredFieldCount(caseItem, answers[caseItem.id]) === caseItem.fields.length);

  const setFieldAnswer = (caseItem: ClinicalCase, caseField: CaseField, optionId: string) => {
    setAnswers((prev) => {
      const existingCase = prev[caseItem.id] ?? {};
      const existingField = existingCase[caseField.id] ?? [];
      const nextField = caseField.type === 'multi-select'
        ? existingField.includes(optionId)
          ? existingField.filter((id) => id !== optionId)
          : [...existingField, optionId]
        : [optionId];

      return {
        ...prev,
        [caseItem.id]: {
          ...existingCase,
          [caseField.id]: nextField,
        },
      };
    });
  };

  const recordCurrentCase = () => {
    const artifact = buildCompletionArtifact(moduleId, currentCaseScore, {
      caseId: currentCase.id,
      caseTitle: currentCase.title,
      caseScore: currentCaseScore,
      answeredFields: completedFields,
      totalFields: currentCase.fields.length,
      type: 'cms-485-case-evidence',
    });
    setRecordedCases((prev) => new Set(prev).add(currentCase.id));
    onEvidence?.(artifact);
  };

  const completeLab = () => {
    const scores = cms485Cases.map((caseItem) => getCaseScore(caseItem, answers[caseItem.id]));
    const score = Math.round(scores.reduce((sum, item) => sum + item, 0) / Math.max(1, scores.length));
    const artifact = buildCompletionArtifact(moduleId, score, {
      type: 'cms-485-audit-lab',
      caseScores: Object.fromEntries(cms485Cases.map((caseItem, idx) => [caseItem.id, scores[idx]])),
      completedCases: cms485Cases.map((caseItem) => caseItem.id),
    });

    onEvidence?.(artifact);
    onComplete?.(score, score >= 80, artifact);
  };

  return (
    <div className="grid gap-lg laptop:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-lg">
        <div className="rounded-lg bg-surface-glass p-md shadow-rest">
          <div className="mb-sm flex items-center gap-sm text-sm font-medium text-brand-teal-deep">
            <Microscope size={18} className="text-brand-teal" />
            Case Lab
          </div>
          <div className="grid gap-sm">
            {cms485Cases.map((caseItem, idx) => {
              const caseScore = getCaseScore(caseItem, answers[caseItem.id]);
              const caseDone = answeredFieldCount(caseItem, answers[caseItem.id]) === caseItem.fields.length;
              const active = idx === caseIndex;
              return (
                <button
                  key={caseItem.id}
                  type="button"
                  onClick={() => {
                    setCaseIndex(idx);
                    setFieldIndex(0);
                  }}
                  className={cx(
                    'grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-sm rounded-lg px-sm py-sm text-left text-xs transition',
                    active ? 'bg-tone-teal-bg text-brand-teal-deep shadow-glass-inset' : 'bg-surface-glass text-secondary hover:bg-surface-hover shadow-glass-inset',
                  )}
                >
                  <span className={cx('flex h-7 w-7 items-center justify-center rounded-md text-[10px]', active ? 'bg-brand-teal text-white' : 'bg-white/60 text-muted')}>{idx + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{caseItem.subtitle}</span>
                    <span className="block text-[10px] text-muted">{answeredFieldCount(caseItem, answers[caseItem.id])}/{caseItem.fields.length} fields</span>
                  </span>
                  <span className={cx('text-[10px]', caseDone ? 'text-tone-green-text' : 'text-muted')}>{caseScore}%</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg bg-surface-glass p-md shadow-rest">
          <div className="mb-sm text-sm font-medium text-brand-teal-deep">Clinical Evidence</div>
          <div className="space-y-sm text-xs text-secondary">
            <div className="rounded-lg bg-surface-glass p-sm shadow-glass-inset">
              <div className="font-medium text-brand-teal-deep">{currentCase.evidence.patientName}, {currentCase.evidence.age}</div>
              <div className="mt-xs text-muted">SOC {currentCase.evidence.socDate} | {currentCase.evidence.certPeriod}</div>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              {currentCase.evidence.vitals.slice(0, 6).map((vital) => (
                <div key={`${currentCase.id}-${vital.label}`} className={cx('rounded-lg p-sm shadow-glass-inset', vital.alert ? 'bg-tone-orange-bg text-tone-orange-text' : 'bg-surface-glass text-secondary')}>
                  <div className="text-[10px] text-muted">{vital.label}</div>
                  <div className="font-medium">{vital.value}</div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-tone-orange-bg p-sm shadow-glass-inset">
              <div className="mb-xs font-medium text-tone-orange-text">Safety risks</div>
              <ul className="space-y-xs">
                {currentCase.evidence.safetyRisks.slice(0, 4).map((risk) => (
                  <li key={risk.description} className="text-tone-orange-text">{risk.description}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>

      <article className="rounded-lg bg-surface-glass p-lg shadow-rest">
        <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
          <div>
            <div className="mb-xs text-tag text-muted">Case {caseIndex + 1} of {cms485Cases.length}</div>
            <h2 className="text-h2 font-medium text-brand-teal-deep">{currentCase.title}</h2>
            <p className="mt-xs max-w-3xl text-sm text-secondary">{currentCase.subtitle}</p>
          </div>
          <div className="rounded-lg bg-surface-glass px-md py-sm text-xs text-secondary shadow-glass-inset">
            Score <strong className="text-brand-teal-deep">{currentCaseScore}%</strong>
          </div>
        </div>

        <div className="mb-lg rounded-lg bg-tone-slate-bg p-md text-xs leading-xs text-secondary shadow-glass-inset">
          {currentCase.evidence.physicianOrders.slice(0, 680)}
          {currentCase.evidence.physicianOrders.length > 680 ? '...' : ''}
        </div>

        <div className="mb-md flex flex-wrap items-center justify-between gap-md">
          <div>
            <div className="text-tag text-muted">Form field {fieldIndex + 1} of {currentCase.fields.length}</div>
            <h3 className="mt-xs text-h3 font-medium text-brand-teal-deep">{field.label}</h3>
            <p className="mt-xs text-xs text-muted">{field.formBoxNumber} | {field.domain}</p>
          </div>
          <div className="flex items-center gap-sm">
            <button
              type="button"
              onClick={() => setFieldIndex((idx) => Math.max(0, idx - 1))}
              disabled={fieldIndex === 0}
              className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-surface-glass px-md py-sm text-xs font-medium text-brand-teal shadow-glass-inset disabled:opacity-40"
            >
              <ArrowLeft size={16} />
              Field
            </button>
            <button
              type="button"
              onClick={() => setFieldIndex((idx) => Math.min(currentCase.fields.length - 1, idx + 1))}
              disabled={fieldIndex === currentCase.fields.length - 1}
              className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-surface-glass px-md py-sm text-xs font-medium text-brand-teal shadow-glass-inset disabled:opacity-40"
            >
              Field
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[44vh] space-y-sm overflow-auto pr-sm">
          {field.options.map((option, idx) => {
            const selected = chosen.includes(option.id);
            const fieldAnswered = chosen.length > 0;
            const reveal = fieldAnswered && selected;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setFieldAnswer(currentCase, field, option.id)}
                className={cx(
                  'grid w-full grid-cols-[30px_minmax(0,1fr)_24px] items-start gap-sm rounded-lg px-md py-sm text-left text-xs transition',
                  selected ? 'bg-tone-teal-bg text-brand-teal-deep shadow-glass-inset' : 'bg-surface-glass text-secondary hover:bg-surface-hover shadow-glass-inset',
                )}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-white/70 text-[11px] font-medium">{optionLetters[idx] ?? idx + 1}</span>
                <span className="leading-xs">
                  <span className="block">{option.label}</span>
                  {reveal && (
                    <span className={cx('mt-sm block rounded-lg p-sm', option.isCorrect ? 'bg-tone-green-bg text-tone-green-text' : 'bg-tone-orange-bg text-tone-orange-text')}>
                      {option.rationale}
                    </span>
                  )}
                </span>
                {selected && <CheckCircle2 size={16} className="mt-1 text-brand-teal" />}
              </button>
            );
          })}
        </div>

        <div className="mt-md rounded-lg bg-surface-glass p-md text-xs leading-xs text-secondary shadow-glass-inset">
          <span className="font-medium text-brand-teal-deep">Audit note: </span>{field.auditNote}
        </div>

        <div className="mt-lg flex flex-wrap items-center justify-between gap-md">
          <div className="text-xs text-muted">
            {completedFields}/{currentCase.fields.length} fields answered
            {recordedCases.has(currentCase.id) && <span className="ml-sm text-tone-green-text">Evidence recorded</span>}
          </div>
          <div className="flex flex-wrap gap-sm">
            <button
              type="button"
              onClick={recordCurrentCase}
              disabled={!currentCaseComplete}
              className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-surface-glass px-md py-sm text-xs font-medium text-brand-teal shadow-glass-inset transition hover:bg-surface-hover disabled:opacity-40"
            >
              <FileText size={16} />
              Record Case Evidence
            </button>
            {caseIndex < cms485Cases.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  setCaseIndex((idx) => Math.min(cms485Cases.length - 1, idx + 1));
                  setFieldIndex(0);
                }}
                className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-brand-teal px-md py-sm text-xs font-medium text-white shadow-pill-action transition hover:opacity-90"
              >
                Next Case
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={completeLab}
                disabled={!allCasesComplete}
                className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-brand-orange px-md py-sm text-xs font-medium text-white shadow-pill-action transition hover:opacity-90 disabled:opacity-40"
              >
                <ClipboardCheck size={16} />
                Submit Lab
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

export const PlanOfCareTrainingPanel: React.FC<Props> = ({ moduleId, onComplete, onEvidence }) => {
  const [mode, setMode] = useState<PanelMode>('lessons');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [viewedCards, setViewedCards] = useState<Set<number>>(() => new Set([0]));
  const [challengeResults, setChallengeResults] = useState<Record<number, ChallengeResult>>({});

  const activeCard = TRAINING_CARDS[activeCardIndex];
  const activeSectionIndex = sectionIndexForCard(activeCard);
  const answeredChallenges = Object.keys(challengeResults).length;
  const correctChallenges = Object.values(challengeResults).filter((result) => result.correct).length;
  const challengeScore = answeredChallenges ? Math.round((correctChallenges / answeredChallenges) * 100) : 0;
  const lessonProgress = Math.round((viewedCards.size / TRAINING_CARDS.length) * 100);
  const topLevelScore = answeredChallenges ? Math.round((lessonProgress + challengeScore) / 2) : lessonProgress;

  const sectionStarts = useMemo(() => {
    return Object.fromEntries(SECTIONS.map((section) => [section, TRAINING_CARDS.findIndex((card) => card.section === section)]));
  }, []);

  const selectCard = (index: number) => {
    const nextIndex = Math.min(Math.max(index, 0), TRAINING_CARDS.length - 1);
    setActiveCardIndex(nextIndex);
    setViewedCards((prev) => new Set(prev).add(nextIndex));
  };

  const selectSection = (section: string) => {
    const index = sectionStarts[section] ?? 0;
    selectCard(index);
  };

  const recordCourseEvidence = () => {
    const score = Math.max(80, topLevelScore);
    const artifact = buildCompletionArtifact(moduleId, score, {
      type: 'cms-485-lesson-course',
      lessonsViewed: viewedCards.size,
      totalLessons: TRAINING_CARDS.length,
      answeredChallenges,
      correctChallenges,
      challengeScore,
    });
    onEvidence?.(artifact);
    onComplete?.(score, score >= 80, artifact);
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-var(--topbar-h)-2rem)] w-full max-w-[1440px] flex-col gap-lg px-lg py-lg text-ink">
      <header className="rounded-lg bg-surface-glass p-lg shadow-rest">
        <div className="flex flex-wrap items-start justify-between gap-lg">
          <div className="max-w-3xl">
            <div className="mb-sm inline-flex items-center gap-sm rounded-md bg-tone-teal-bg px-sm py-xs text-tag text-brand-teal">
              <ShieldCheck size={14} />
              RN-ADV-01
            </div>
            <h1 className="text-display font-medium text-brand-teal-deep">CMS-485 Plan of Care and Compliance Integration</h1>
            <p className="mt-sm text-sm leading-body text-secondary">
              Advanced plan-of-care training covering establishment, order specificity, defensibility, clinical alignment, audit triggers, and completion evidence.
            </p>
          </div>

          <div className="grid min-w-[260px] gap-sm text-xs text-secondary">
            <div className="rounded-lg bg-surface-glass p-sm shadow-glass-inset">
              <span>Course score</span>
              <strong className="float-right text-brand-teal-deep">{topLevelScore}%</strong>
            </div>
            <div className="rounded-lg bg-surface-glass p-sm shadow-glass-inset">
              <span>Lessons</span>
              <strong className="float-right text-brand-teal-deep">{TRAINING_CARDS.length}</strong>
            </div>
            <div className="rounded-lg bg-surface-glass p-sm shadow-glass-inset">
              <span>Case studies</span>
              <strong className="float-right text-brand-teal-deep">{cms485Cases.length}</strong>
            </div>
          </div>
        </div>

        <div className="mt-lg flex flex-wrap items-center justify-between gap-md">
          <div className="inline-flex rounded-lg bg-surface-glass p-xs shadow-glass-inset" role="tablist" aria-label="CMS-485 training modes">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'lessons'}
              onClick={() => setMode('lessons')}
              className={cx('inline-flex min-h-tap items-center gap-sm rounded-md px-md py-sm text-xs font-medium transition', mode === 'lessons' ? 'bg-brand-teal text-white shadow-pill-action' : 'text-brand-teal hover:bg-surface-hover')}
            >
              <BookOpen size={16} />
              Lessons
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'audit-lab'}
              onClick={() => setMode('audit-lab')}
              className={cx('inline-flex min-h-tap items-center gap-sm rounded-md px-md py-sm text-xs font-medium transition', mode === 'audit-lab' ? 'bg-brand-teal text-white shadow-pill-action' : 'text-brand-teal hover:bg-surface-hover')}
            >
              <Microscope size={16} />
              Audit Lab
            </button>
          </div>

          <button
            type="button"
            onClick={recordCourseEvidence}
            className="inline-flex min-h-tap items-center gap-sm rounded-lg bg-brand-orange px-md py-sm text-xs font-medium text-white shadow-pill-action transition hover:opacity-90"
          >
            <ClipboardCheck size={16} />
            Record Lesson Evidence
          </button>
        </div>
      </header>

      {mode === 'lessons' ? (
        <div className="grid gap-lg laptop:grid-cols-[280px_minmax(0,1fr)_300px]">
          <SectionRail activeSectionIndex={activeSectionIndex} viewedCards={viewedCards} onSelectSection={selectSection} />
          <LessonPanel
            card={activeCard}
            cardIndex={activeCardIndex}
            challengeResult={challengeResults[activeCardIndex]}
            onAnswerChallenge={(selectedIndex) => {
              setChallengeResults((prev) => ({
                ...prev,
                [activeCardIndex]: { selectedIndex, correct: selectedIndex === 0 },
              }));
            }}
            onPrevious={() => selectCard(activeCardIndex - 1)}
            onNext={() => selectCard(activeCardIndex + 1)}
            canGoPrevious={activeCardIndex > 0}
            canGoNext={activeCardIndex < TRAINING_CARDS.length - 1}
          />
          <ReferenceRail
            activeCard={activeCard}
            lessonProgress={lessonProgress}
            challengeScore={challengeScore}
            answeredChallenges={answeredChallenges}
          />
        </div>
      ) : (
        <CaseAuditLab moduleId={moduleId} onComplete={onComplete} onEvidence={onEvidence} />
      )}
    </div>
  );
};
