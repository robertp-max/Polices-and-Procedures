import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import {
  audio,
  CompletionBanner,
  FieldNoteCard,
  ReferenceRibbon,
  SafeTrainingNote,
} from './gao001-shared';
import type { SceneProps } from './gao001-shared';

interface LessonCheckOption {
  id: string;
  text: string;
  isCorrect: boolean;
  feedback: string;
}

interface LessonScenario {
  title: string;
  text: string;
  question: string;
  options: LessonCheckOption[];
  correctSummary?: string;
}

interface LessonFieldNote {
  title: string;
  text: string;
  reference?: string;
}

interface LessonReference {
  citation: string;
  text?: string;
}

interface SimpleLessonSceneProps extends SceneProps {
  eyebrow: string;
  title: string;
  lede: string;
  learningPoints: string[];
  practiceKey: string;
  completionLabel: string;
  scenario?: LessonScenario;
  fieldNote?: LessonFieldNote;
  reference?: LessonReference;
  primaryActionLabel?: string;
}

function getInitialResolved(initialProgress: unknown, practiceKey: string) {
  if (!initialProgress || typeof initialProgress !== 'object') return false;
  const progress = initialProgress as any;
  return Boolean(
    progress?.resolved?.[practiceKey]?.resolved ||
      progress?.[practiceKey]?.resolved ||
      progress?.resolved === true,
  );
}

export default function SimpleLessonScene({
  onComplete,
  initialProgress,
  onProgressChange,
  eyebrow,
  title,
  lede,
  learningPoints,
  practiceKey,
  completionLabel,
  scenario,
  fieldNote,
  reference,
  primaryActionLabel = 'Mark lesson complete',
}: SimpleLessonSceneProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isComplete, setIsComplete] = useState(() => getInitialResolved(initialProgress, practiceKey));

  const selectedOption = useMemo(
    () => scenario?.options.find((option) => option.id === selectedOptionId),
    [scenario, selectedOptionId],
  );

  useEffect(() => {
    setIsComplete(getInitialResolved(initialProgress, practiceKey));
  }, [initialProgress, practiceKey]);

  const completeLesson = (nextAttempts: number) => {
    if (isComplete) return;
    setIsComplete(true);
    onProgressChange?.({
      resolved: {
        [practiceKey]: {
          resolved: true,
          attempts: nextAttempts,
        },
      },
    });
    audio.play('correct');
    window.setTimeout(onComplete, 220);
  };

  const handleOption = (option: LessonCheckOption) => {
    if (isComplete) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    setSelectedOptionId(option.id);
    setFeedback(option.feedback);

    if (option.isCorrect) {
      completeLesson(nextAttempts);
    } else {
      audio.play('error');
    }
  };

  return (
    <section className="p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C74601]">{eyebrow}</div>
          <h2 className="mt-2 text-2xl font-semibold text-[#0F5B54]">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#475569]">{lede}</p>
          {reference && (
            <div className="mt-4">
              <ReferenceRibbon citation={reference.citation} text={reference.text} />
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_1.05fr]">
          <div className="rounded-xl border border-[#E5E4E3] bg-[#FDF8F3] p-5">
            <div className="mb-3 text-sm font-semibold text-[#1E3A3A]">What to remember</div>
            <div className="space-y-3">
              {learningPoints.map((point) => (
                <div key={point} className="flex gap-3 text-sm leading-5 text-[#1E3A3A]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#007970]" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {scenario ? (
            <div className="rounded-xl border border-[#E5E4E3] bg-white p-5">
              <div className="text-sm font-semibold text-[#0F5B54]">{scenario.title}</div>
              <p className="mt-2 text-sm leading-6 text-[#475569]">{scenario.text}</p>
              <div className="mt-4 text-sm font-semibold text-[#1E3A3A]">{scenario.question}</div>
              <div className="mt-3 space-y-2">
                {scenario.options.map((option) => {
                  const selected = selectedOptionId === option.id;
                  const selectedCorrect = selected && option.isCorrect;
                  const selectedWrong = selected && !option.isCorrect;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => handleOption(option)}
                      disabled={isComplete}
                      className={`flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm leading-5 transition ${
                        selectedCorrect
                          ? 'border-[#006B3A] bg-[#E6F4E9] text-[#006B3A]'
                          : selectedWrong
                            ? 'border-[#8B2C2C] bg-[#F8E8E8] text-[#8B2C2C]'
                            : 'border-[#E5E4E3] bg-white text-[#1E3A3A] hover:border-[#0F5B54] hover:bg-[#EEF4F3]'
                      } ${isComplete && !selected ? 'opacity-60' : ''}`}
                    >
                      {selectedCorrect ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : selectedWrong ? (
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[#94A3B8]" />
                      )}
                      <span>{option.text}</span>
                    </button>
                  );
                })}
              </div>

              {feedback && (
                <div
                  className={`mt-4 rounded-lg border px-4 py-3 text-sm leading-5 ${
                    selectedOption?.isCorrect
                      ? 'border-[#006B3A] bg-[#E6F4E9] text-[#006B3A]'
                      : 'border-[#8B2C2C] bg-[#F8E8E8] text-[#8B2C2C]'
                  }`}
                >
                  {feedback}
                </div>
              )}

              {isComplete && scenario.correctSummary && (
                <div className="mt-4 text-sm leading-5 text-[#475569]">{scenario.correctSummary}</div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-[#E5E4E3] bg-white p-5">
              <div className="text-sm font-semibold text-[#0F5B54]">Ready check</div>
              <p className="mt-2 text-sm leading-6 text-[#475569]">
                This step confirms the module frame before the next lesson.
              </p>
              <button
                type="button"
                onClick={() => completeLesson(attempts + 1)}
                disabled={isComplete}
                className="mt-4 rounded-lg bg-[#0F5B54] px-4 py-2 text-sm font-semibold text-white hover:bg-[#007970] disabled:cursor-default disabled:opacity-60"
              >
                {isComplete ? 'Completed' : primaryActionLabel}
              </button>
            </div>
          )}
        </div>

        {fieldNote && (
          <div className="mt-5">
            <FieldNoteCard title={fieldNote.title} text={fieldNote.text} reference={fieldNote.reference} />
          </div>
        )}

        {isComplete && (
          <div className="mt-5">
            <CompletionBanner label={completionLabel} />
          </div>
        )}

        <SafeTrainingNote />
      </div>
    </section>
  );
}
