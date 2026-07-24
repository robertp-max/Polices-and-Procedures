// Guided True/False remediation (mockup 3, right rail pattern) — one
// statement at a time, large True/False controls, immediate feedback with
// the controlling workflow, required forms, and why it matters. Every
// missed statement is requeued until answered correctly, so the learner
// must correct every miss to reach 100% before completion fires. This does
// NOT itself pass the primary Board case — completion only unlocks a new
// alternate form (see engine/attemptVariants.ts `variant`), which the
// caller (RemediationCenter / TabletopSession) is responsible for offering.
//
// Ground-up build for tabletop2026/ — reuses tabletop2026.css .bs-tf-* only.

import { useEffect, useRef, useState } from 'react';
import type { RemediationTrueFalseItem } from './data/remediationBank';

export interface GuidedTrueFalseRemediationProps {
  /** Pre-selected items, typically from buildTargetedRemediation(missedCompetencyIds). */
  items: RemediationTrueFalseItem[];
  /** Fires exactly once, after every item has been answered correctly at least once. */
  onComplete: () => void;
  /** Optional escape hatch back to the choice/results screen. */
  onExit?: () => void;
}

export default function GuidedTrueFalseRemediation({ items, onComplete, onExit }: GuidedTrueFalseRemediationProps) {
  const [queue, setQueue] = useState<string[]>(() => items.map((i) => i.id));
  const [mastered, setMastered] = useState<Set<string>>(new Set());
  const [missedOnce, setMissedOnce] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<boolean | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const doneFiredRef = useRef(false);
  const feedbackRef = useRef<HTMLDivElement>(null);

  const itemsById = new Map(items.map((i) => [i.id, i]));
  const currentId = queue[0];
  const current = currentId ? itemsById.get(currentId) : undefined;
  const totalUnique = items.length;

  useEffect(() => {
    if (totalUnique > 0 && queue.length === 0 && !doneFiredRef.current) {
      doneFiredRef.current = true;
      onComplete();
    }
  }, [queue, totalUnique, onComplete]);

  useEffect(() => {
    if (submitted) feedbackRef.current?.focus();
  }, [submitted]);

  if (totalUnique === 0) {
    return (
      <div className="bs-tf">
        <span className="bs-tf-kicker">Guided Remediation</span>
        <p className="bs-tf-statement" style={{ fontSize: 16 }}>
          No remediation statements were required for what you missed.
        </p>
        <button type="button" className="bs-rail-action" onClick={onComplete}>
          Continue
        </button>
      </div>
    );
  }

  if (!current) {
    // Effect above already fired onComplete; render a stable end-state as a fallback
    // in case the caller doesn't immediately unmount this component.
    return (
      <div className="bs-tf">
        <span className="bs-tf-kicker">Guided Remediation Complete</span>
        <p className="bs-tf-statement" style={{ fontSize: 16 }}>
          Every statement was answered correctly. A new alternate form has been unlocked.
        </p>
      </div>
    );
  }

  function handleAnswer(value: boolean) {
    if (submitted) return;
    setSelected(value);
    setSubmitted(true);
  }

  function handleNext() {
    if (!current || selected === null) return;
    const correct = selected === current.answer;
    setQueue((q) => {
      const rest = q.slice(1);
      return correct ? rest : [...rest, current.id];
    });
    if (correct) setMastered((m) => new Set(m).add(current.id));
    else setMissedOnce((m) => new Set(m).add(current.id));
    setSelected(null);
    setSubmitted(false);
  }

  const correct = submitted && selected !== null && selected === current.answer;

  return (
    <div className="bs-tf">
      <span className="bs-tf-kicker">
        Guided Remediation — Statement {mastered.size + 1} of {totalUnique}
        {missedOnce.has(current.id) ? ' (retry)' : ''}
      </span>
      <h3 className="bs-tf-statement">{current.statement}</h3>

      <div className="bs-tf-buttons" role="group" aria-label="Answer">
        <button
          type="button"
          className={`true${selected === true ? ' selected' : ''}`}
          aria-pressed={selected === true}
          disabled={submitted}
          onClick={() => handleAnswer(true)}
        >
          True
        </button>
        <button
          type="button"
          className={`false${selected === false ? ' selected' : ''}`}
          aria-pressed={selected === false}
          disabled={submitted}
          onClick={() => handleAnswer(false)}
        >
          False
        </button>
      </div>

      {submitted && selected !== null && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="status"
          aria-live="polite"
          className={`bs-tf-feedback ${correct ? 'correct' : 'incorrect'}`}
        >
          <strong>{correct ? 'Correct.' : 'Not quite — this statement will come back around.'}</strong>
          <p>{current.explanation}</p>
          <dl>
            <dt>Controlling Workflow</dt>
            <dd>{current.workflowId}</dd>
            <dt>Required Forms</dt>
            <dd>{current.formIds.length ? current.formIds.join(', ') : 'None'}</dd>
            <dt>Why It Matters</dt>
            <dd>{current.whyItMatters}</dd>
          </dl>
          <button type="button" className="bs-rail-action" style={{ marginTop: 12 }} onClick={handleNext}>
            {correct ? 'Continue' : 'Try This Statement Again'}
          </button>
        </div>
      )}

      {onExit && (
        <button type="button" className="bs-rail-action secondary" onClick={onExit}>
          Exit Guided Remediation
        </button>
      )}
    </div>
  );
}
