// End-of-attempt surveyor mini-assessment: "show me the record that proves
// X" (5-8 items for a quarterly case, 12-16 for the annual capstone) plus
// the changed-facts transfer questions that prove judgment transfers rather
// than memorized answer position. Immediate feedback on each answer; no
// grading logic lives here (see engine/scoring.ts) — this is presentation +
// interaction only.

import { useMemo } from 'react';
import type { SurveyorQuestion, TransferQuestion } from './engine/caseTypes';
import { Check, X } from 'lucide-react';

export interface SurveyorDefenseProps {
  surveyor: SurveyorQuestion[];
  transfers: TransferQuestion[];
  surveyorSelections: Record<string, string>;
  transferSelections: Record<string, string>;
  onAnswerSurveyor: (questionId: string, optionId: string) => void;
  onAnswerTransfer: (questionId: string, optionId: string) => void;
  mode?: 'quarterly' | 'annual';
}

export default function SurveyorDefense(props: SurveyorDefenseProps) {
  const {
    surveyor,
    transfers,
    surveyorSelections,
    transferSelections,
    onAnswerSurveyor,
    onAnswerTransfer,
    mode = 'quarterly',
  } = props;

  const expectedRange = mode === 'annual' ? '12–16' : '5–8';

  const surveyorAnsweredCount = useMemo(
    () => surveyor.filter((q) => surveyorSelections[q.id]).length,
    [surveyor, surveyorSelections],
  );
  const transfersAnsweredCount = useMemo(
    () => transfers.filter((t) => transferSelections[t.id]).length,
    [transfers, transferSelections],
  );

  return (
    <div className="bs-boardtable" style={{ gap: 16 }}>
      <header>
        <p className="bs-kicker">Surveyor Defense · {expectedRange} items</p>
        <h3>Show me the record.</h3>
        <p className="bs-prompt-text">
          {surveyorAnsweredCount}/{surveyor.length} surveyor questions answered · {transfersAnsweredCount}/{transfers.length} transfer questions answered.
        </p>
      </header>

      {surveyor.map((q) => {
        const selected = surveyorSelections[q.id];
        const answered = Boolean(selected);
        const isCorrect = selected === q.correctId;
        return (
          <div key={q.id} className="bs-decision-prompt">
            <header>
              <h3 style={{ fontSize: 15 }}>{q.prompt}</h3>
            </header>
            <div className="bs-option-list" role="radiogroup" aria-label={q.prompt}>
              {q.options.map((opt) => {
                const isSelected = selected === opt.id;
                const revealCorrect = answered && opt.id === q.correctId;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`bs-option${isSelected ? ' selected' : ''}`}
                    onClick={() => onAnswerSurveyor(q.id, opt.id)}
                  >
                    <span className="bs-option-mark">
                      {isSelected && (isCorrect ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />)}
                    </span>
                    <span className="bs-option-text">
                      {opt.text}
                      {revealCorrect && !isSelected && ' (correct)'}
                    </span>
                  </button>
                );
              })}
            </div>
            {answered && (
              <div className={`bs-tf-feedback ${isCorrect ? 'correct' : 'incorrect'}`} role="status">
                <strong>{isCorrect ? 'Correctly grounded.' : 'Not the controlling record.'}</strong>
                <dl>
                  <dt>Evidence required</dt>
                  <dd>{q.requiresEvidenceIds.join(', ')}</dd>
                </dl>
              </div>
            )}
          </div>
        );
      })}

      {transfers.length > 0 && (
        <>
          <header>
            <p className="bs-kicker">Transfer — Changed Facts</p>
            <h3>Same judgment, different facts.</h3>
          </header>
          {transfers.map((t) => {
            const selected = transferSelections[t.id];
            const answered = Boolean(selected);
            const isCorrect = selected === t.correctId;
            return (
              <div key={t.id} className="bs-decision-prompt">
                <header>
                  <h3 style={{ fontSize: 15 }}>{t.prompt}</h3>
                </header>
                <ul>
                  {t.changedFacts.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <div className="bs-option-list" role="radiogroup" aria-label={t.prompt}>
                  {t.options.map((opt) => {
                    const isSelected = selected === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`bs-option${isSelected ? ' selected' : ''}`}
                        onClick={() => onAnswerTransfer(t.id, opt.id)}
                      >
                        <span className="bs-option-mark">
                          {isSelected && (isCorrect ? <Check size={12} aria-hidden="true" /> : <X size={12} aria-hidden="true" />)}
                        </span>
                        <span className="bs-option-text">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div className={`bs-tf-feedback ${isCorrect ? 'correct' : 'incorrect'}`} role="status">
                    <strong>{isCorrect ? 'Judgment transfers.' : 'Reconsider the underlying rule.'}</strong>
                    <p>{t.rationale}</p>
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
