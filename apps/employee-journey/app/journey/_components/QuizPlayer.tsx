"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Flag,
  Info,
  ListChecks,
  Lock,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { usePreview } from "./PreviewContext";
import { Modal } from "./ui";
import type { QuizViewModel } from "../_lib/policyQuizAccess";

type ReadyModel = Extract<QuizViewModel, { kind: "ready" }>;

type AttemptRecord = {
  scorePercent: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: string;
};

type StoredQuizState = {
  attempts: AttemptRecord[];
  attestedAt: string | null;
};

type Phase =
  | "locked-missing"
  | "already-passed"
  | "attempts-exhausted"
  | "intro"
  | "question"
  | "review"
  | "results"
  | "attest"
  | "attested";

const EMPTY_STATE: StoredQuizState = { attempts: [], attestedAt: null };

function storageKey(personaId: string, courseId: string) {
  return `journey-quiz::${personaId}::${courseId}`;
}

function loadState(personaId: string, courseId: string): StoredQuizState {
  if (typeof window === "undefined") return EMPTY_STATE;
  try {
    const raw = window.sessionStorage.getItem(storageKey(personaId, courseId));
    if (!raw) return EMPTY_STATE;
    const parsed = JSON.parse(raw) as Partial<StoredQuizState>;
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts : [],
      attestedAt: parsed.attestedAt ?? null,
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveState(personaId: string, courseId: string, state: StoredQuizState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(storageKey(personaId, courseId), JSON.stringify(state));
}

export function QuizPlayer({ model }: { model: ReadyModel }) {
  const { persona, withPersona, announce } = usePreview();

  const [hydrated, setHydrated] = useState(false);
  const [stored, setStored] = useState<StoredQuizState>(EMPTY_STATE);
  const [activePhase, setActivePhase] = useState<Phase | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [lastAttempt, setLastAttempt] = useState<AttemptRecord | null>(null);
  const [attestChecked, setAttestChecked] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setStored(loadState(persona.id, model.courseId));
    setHydrated(true);
    setActivePhase(null);
  }, [persona.id, model.courseId]);

  const attemptsUsed = stored.attempts.length;
  const everPassed = stored.attempts.some((attempt) => attempt.passed);
  const isOfficial = model.bankStatus === "APPROVED";
  const attemptsExhausted = attemptsUsed >= model.maxAttempts && !everPassed;
  const total = model.questions.length;

  const gatePhase: Phase = useMemo(() => {
    if (!hydrated) return "intro";
    if (model.bankStatus === "MISSING" || total === 0) return "locked-missing";
    if (isOfficial && everPassed) {
      if (stored.attestedAt) return "attested";
      if (model.attestationRequired) return "attest";
      return "already-passed";
    }
    if (attemptsExhausted) return "attempts-exhausted";
    return "intro";
  }, [
    hydrated,
    model.bankStatus,
    model.attestationRequired,
    total,
    isOfficial,
    everPassed,
    stored.attestedAt,
    attemptsExhausted,
  ]);

  const phase = activePhase ?? gatePhase;
  const currentQuestion = model.questions[currentIndex];

  function handleBegin() {
    const resetAnswers: Record<string, number | null> = {};
    model.questions.forEach((question) => {
      resetAnswers[question.id] = null;
    });
    setAnswers(resetAnswers);
    setFlagged({});
    setCurrentIndex(0);
    setLastAttempt(null);
    setActivePhase("question");
    announce("Quiz started. No official score has been recorded yet.");
  }

  function handleSelect(questionId: string, optionIndex: number) {
    setAnswers((previous) => ({ ...previous, [questionId]: optionIndex }));
  }

  function toggleFlag(questionId: string) {
    setFlagged((previous) => ({ ...previous, [questionId]: !previous[questionId] }));
  }

  function goTo(index: number) {
    setCurrentIndex(Math.max(0, Math.min(total - 1, index)));
    setActivePhase("question");
  }

  function computeAttempt(): AttemptRecord {
    const correctCount = model.questions.filter(
      (question) => answers[question.id] === question.correctIndex,
    ).length;
    const scorePercent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    return {
      scorePercent,
      correctCount,
      totalQuestions: total,
      passed: scorePercent >= model.passScore,
      completedAt: new Date().toISOString(),
    };
  }

  function handleConfirmSubmit() {
    const attempt = computeAttempt();
    const nextStored: StoredQuizState = {
      attempts: [...stored.attempts, attempt],
      attestedAt: stored.attestedAt,
    };
    setStored(nextStored);
    saveState(persona.id, model.courseId, nextStored);
    setLastAttempt(attempt);
    setConfirmOpen(false);
    setActivePhase("results");
    announce(
      attempt.passed
        ? `Quiz submitted. Score ${attempt.scorePercent}%. This attempt passed.`
        : `Quiz submitted. Score ${attempt.scorePercent}%. This attempt did not pass.`,
    );
  }

  function handleAttest() {
    const nextStored: StoredQuizState = {
      ...stored,
      attestedAt: new Date().toISOString(),
    };
    setStored(nextStored);
    saveState(persona.id, model.courseId, nextStored);
    setActivePhase(null);
    announce("Attestation recorded for this preview session.");
  }

  const answeredCount = model.questions.filter(
    (question) => answers[question.id] !== null && answers[question.id] !== undefined,
  ).length;
  const flaggedCount = model.questions.filter((question) => flagged[question.id]).length;

  const missed = useMemo(
    () =>
      lastAttempt
        ? model.questions.filter((question) => answers[question.id] !== question.correctIndex)
        : [],
    [lastAttempt, model.questions, answers],
  );

  const remainingAttempts = Math.max(0, model.maxAttempts - attemptsUsed);

  return (
    <div className="workspace quiz-workspace">
      <header className="page-header">
        <div>
          <p className="eyebrow">POLICY QUIZ</p>
          <h1>{model.courseTitle}</h1>
          <p>
            {model.pathway} pathway · {model.courseId} · Primary policy:{" "}
            {model.policyId} — {model.policyTitle}
          </p>
        </div>
        <div className="page-header-action">
          <Link className="text-link" href={withPersona("/journey/policies")}>
            <ArrowLeft aria-hidden="true" />
            Back to policy actions
          </Link>
        </div>
      </header>

      <div className="truth-note" role="note">
        <Info aria-hidden="true" />
        <p>
          This is a synthetic preview. No score, attempt, or attestation made
          here is transmitted to an official learning management or HR
          record system.
        </p>
      </div>

      {!model.quizRequired ? (
        <div className="quiz-optional-banner" role="note">
          <Info aria-hidden="true" />
          <p>
            This assignment does not require a scored quiz to complete. What
            follows is optional reinforcement, not a completion gate.
          </p>
        </div>
      ) : null}

      {phase === "locked-missing" ? (
        <section className="quiz-card quiz-locked" aria-live="polite">
          <Lock aria-hidden="true" />
          <div>
            <h2>Quiz not yet published</h2>
            <p>
              No approved question bank exists yet for {model.courseId} —{" "}
              {model.courseTitle}. Reading the assigned policy text remains
              available.{" "}
              {model.quizRequired
                ? "Completion of this assignment is blocked until an approved bank is published, because a quiz is required."
                : "This assignment does not require a quiz, so no completion is blocked by this status."}
            </p>
            <Link className="button button-secondary" href={withPersona("/journey/policies")}>
              Go to policy reading
            </Link>
          </div>
        </section>
      ) : null}

      {phase === "attempts-exhausted" ? (
        <section className="quiz-card quiz-locked" aria-live="polite">
          <AlertTriangle aria-hidden="true" />
          <div>
            <h2>Attempts exhausted for this session</h2>
            <p>
              All {model.maxAttempts} allowed attempts have been used without
              a passing score. No further quiz action is available in this
              preview — escalation to a supervisor or HR reviewer happens
              outside this UI.
            </p>
            <ul className="quiz-attempt-history">
              {stored.attempts.map((attempt, index) => (
                <li key={attempt.completedAt}>
                  Attempt {index + 1}: {attempt.scorePercent}% (
                  {attempt.correctCount}/{attempt.totalQuestions}) — needed{" "}
                  {model.passScore}%
                </li>
              ))}
            </ul>
            <Link className="button button-secondary" href={withPersona("/journey/policies")}>
              Return to policy actions
            </Link>
          </div>
        </section>
      ) : null}

      {phase === "already-passed" ? (
        <section className="quiz-card quiz-pass" aria-live="polite">
          <CheckCircle2 aria-hidden="true" />
          <div>
            <h2>Already passed</h2>
            <p>
              A previous attempt in this session passed with{" "}
              {stored.attempts.filter((a) => a.passed).slice(-1)[0]?.scorePercent}%.
              No attestation is required for this course.
            </p>
            <Link className="button button-secondary" href={withPersona("/journey/policies")}>
              Return to policy actions
            </Link>
          </div>
        </section>
      ) : null}

      {phase === "attested" ? (
        <section className="quiz-card quiz-pass" aria-live="polite">
          <ShieldCheck aria-hidden="true" />
          <div>
            <h2>Attestation recorded</h2>
            <p>
              Recorded for this preview session on{" "}
              {stored.attestedAt ? new Date(stored.attestedAt).toLocaleString() : ""}.
              No official record was written outside this session.
            </p>
            <Link className="button button-secondary" href={withPersona("/journey/policies")}>
              Return to policy actions
            </Link>
          </div>
        </section>
      ) : null}

      {phase === "intro" ? (
        <section className="quiz-card">
          <ListChecks aria-hidden="true" />
          <div>
            <h2>
              {model.bankStatus === "DRAFT_REVIEW_REQUIRED"
                ? "DRAFT KNOWLEDGE CHECK — no official score recorded"
                : "Ready to begin"}
            </h2>
            <p>{model.bundleNote}</p>
            <dl className="quiz-meta-grid">
              <div>
                <dt>Questions available</dt>
                <dd>
                  {total} of {model.requiredQuestionCount} required
                </dd>
              </div>
              <div>
                <dt>Pass score</dt>
                <dd>{model.passScore}%</dd>
              </div>
              <div>
                <dt>Attempts remaining</dt>
                <dd>
                  {remainingAttempts} of {model.maxAttempts}
                </dd>
              </div>
              <div>
                <dt>Policies covered</dt>
                <dd>{model.bundlePolicyIds.join(", ")}</dd>
              </div>
            </dl>
            {attemptsUsed > 0 ? (
              <ul className="quiz-attempt-history">
                {stored.attempts.map((attempt, index) => (
                  <li key={attempt.completedAt}>
                    Attempt {index + 1}: {attempt.scorePercent}% (
                    {attempt.correctCount}/{attempt.totalQuestions})
                  </li>
                ))}
              </ul>
            ) : null}
            <button className="button button-primary" type="button" onClick={handleBegin}>
              Begin quiz
            </button>
          </div>
        </section>
      ) : null}

      {phase === "question" && currentQuestion ? (
        <section className="quiz-shell">
          {model.bankStatus === "DRAFT_REVIEW_REQUIRED" ? (
            <p className="quiz-draft-flag">
              DRAFT KNOWLEDGE CHECK — no official score recorded
            </p>
          ) : null}
          <div
            className="quiz-progress-bar"
            role="progressbar"
            aria-valuenow={currentIndex + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label={`Question ${currentIndex + 1} of ${total}`}
          >
            <div style={{ width: `${((currentIndex + 1) / total) * 100}%` }} />
          </div>
          <p className="quiz-progress-label">
            Question {currentIndex + 1} of {total} · {answeredCount} answered ·{" "}
            {flaggedCount} flagged
          </p>

          <QuestionNavMap
            questions={model.questions}
            answers={answers}
            flagged={flagged}
            currentIndex={currentIndex}
            onSelect={goTo}
          />

          <fieldset className="quiz-question-card">
            <legend>{currentQuestion.stem}</legend>
            <div className="quiz-options" role="radiogroup" aria-label={`Answer options for question ${currentIndex + 1}`}>
              {currentQuestion.options.map((option, index) => (
                <label key={option} className="quiz-option">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={index}
                    checked={answers[currentQuestion.id] === index}
                    onChange={() => handleSelect(currentQuestion.id, index)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="quiz-nav-buttons">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ArrowLeft aria-hidden="true" />
              Back
            </button>
            <button
              className="button button-secondary quiz-flag-button"
              type="button"
              aria-pressed={Boolean(flagged[currentQuestion.id])}
              onClick={() => toggleFlag(currentQuestion.id)}
            >
              <Flag aria-hidden="true" />
              {flagged[currentQuestion.id] ? "Unflag" : "Flag for review"}
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => setActivePhase("review")}
            >
              Review answers
            </button>
            {currentIndex < total - 1 ? (
              <button
                className="button button-primary"
                type="button"
                onClick={() => goTo(currentIndex + 1)}
              >
                Next
                <ArrowRight aria-hidden="true" />
              </button>
            ) : (
              <button
                className="button button-primary"
                type="button"
                onClick={() => setActivePhase("review")}
              >
                Review answers
                <ArrowRight aria-hidden="true" />
              </button>
            )}
          </div>
        </section>
      ) : null}

      {phase === "review" ? (
        <section className="quiz-shell">
          <h2>Review your answers</h2>
          <p>
            {answeredCount} of {total} answered · {flaggedCount} flagged for
            review. Submitting will use one of your remaining attempts (
            {remainingAttempts} of {model.maxAttempts} left).
          </p>
          <ol className="quiz-review-list">
            {model.questions.map((question, index) => (
              <li key={question.id}>
                <div>
                  <span className="quiz-review-index">{index + 1}</span>
                  <p>{question.stem}</p>
                  <p className="quiz-review-answer">
                    {answers[question.id] !== null && answers[question.id] !== undefined
                      ? `Your answer: ${question.options[answers[question.id] as number]}`
                      : "Not answered"}
                  </p>
                  {flagged[question.id] ? (
                    <span className="quiz-review-flag">
                      <Flag aria-hidden="true" /> Flagged
                    </span>
                  ) : null}
                </div>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => goTo(index)}
                >
                  Edit
                </button>
              </li>
            ))}
          </ol>
          <div className="quiz-nav-buttons">
            <button
              className="button button-secondary"
              type="button"
              onClick={() => goTo(currentIndex)}
            >
              <ArrowLeft aria-hidden="true" />
              Back to questions
            </button>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setConfirmOpen(true)}
            >
              Submit quiz
            </button>
          </div>
        </section>
      ) : null}

      {phase === "results" && lastAttempt ? (
        <section className="quiz-shell">
          <div
            className={`quiz-result-banner ${lastAttempt.passed ? "is-pass" : "is-fail"}`}
          >
            {lastAttempt.passed ? (
              <CheckCircle2 aria-hidden="true" />
            ) : (
              <XCircle aria-hidden="true" />
            )}
            <div>
              <h2>{lastAttempt.passed ? "Passed" : "Not yet passing"}</h2>
              <p>
                Score: {lastAttempt.scorePercent}% ({lastAttempt.correctCount}{" "}
                of {lastAttempt.totalQuestions} correct) · Pass score:{" "}
                {model.passScore}%
              </p>
              {!isOfficial ? (
                <p className="quiz-draft-flag">
                  DRAFT KNOWLEDGE CHECK — no official score recorded
                </p>
              ) : null}
            </div>
          </div>

          {missed.length > 0 ? (
            <div className="quiz-missed">
              <h3>Missed concepts</h3>
              <ul>
                {missed.map((question) => {
                  const ref = model.policyReferences[question.policyId];
                  return (
                    <li key={question.id}>
                      <p>{question.stem}</p>
                      <p className="quiz-missed-ref">
                        Related policy:{" "}
                        {ref?.policyTitle ? (
                          <Link href={withPersona(`/journey/policies?ref=${encodeURIComponent(question.policyId)}`)}>
                            {question.policyId} — {ref.policyTitle}
                          </Link>
                        ) : (
                          `${question.policyId} (reference not yet available)`
                        )}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}

          <div className="quiz-next-action">
            <h3>Next permitted action</h3>
            {lastAttempt.passed ? (
              isOfficial && model.attestationRequired ? (
                <button className="button button-primary" type="button" onClick={() => setActivePhase("attest")}>
                  <ClipboardCheck aria-hidden="true" />
                  Continue to attestation
                </button>
              ) : (
                <>
                  <p>
                    {isOfficial
                      ? "This course does not require a separate attestation step."
                      : "Practice complete. An approved question bank must be published before this course can produce an official completion."}
                  </p>
                  <Link className="button button-secondary" href={withPersona("/journey/policies")}>
                    Return to policy actions
                  </Link>
                </>
              )
            ) : remainingAttempts > 0 ? (
              <>
                <p>
                  Attempt {attemptsUsed} of {model.maxAttempts} used. Review
                  the missed concepts above, then try again.
                </p>
                <button className="button button-primary" type="button" onClick={handleBegin}>
                  <RotateCcw aria-hidden="true" />
                  Try again
                </button>
              </>
            ) : (
              <>
                <p>
                  All {model.maxAttempts} attempts have been used without a
                  passing score. No further quiz action is available in this
                  preview.
                </p>
                <Link className="button button-secondary" href={withPersona("/journey/policies")}>
                  Return to policy actions
                </Link>
              </>
            )}
          </div>
        </section>
      ) : null}

      {phase === "attest" ? (
        <section className="quiz-card quiz-pass">
          <ClipboardCheck aria-hidden="true" />
          <div>
            <h2>Attestation</h2>
            <p>
              You passed the {model.courseTitle} knowledge check. Confirm the
              attestation below to continue.
            </p>
            <label className="quiz-attest-checkbox">
              <input
                type="checkbox"
                checked={attestChecked}
                onChange={(event) => setAttestChecked(event.target.checked)}
              />
              <span>
                I attest that I have read and understood {model.policyTitle}{" "}
                ({model.policyId}) and the other policies covered by this
                course, and that I understand my responsibilities under them.
              </span>
            </label>
            <button
              className="button button-primary"
              type="button"
              disabled={!attestChecked}
              onClick={handleAttest}
            >
              Submit attestation
            </button>
          </div>
        </section>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Submit this quiz?"
        description="This will use one of your remaining attempts."
      >
        <p>
          {answeredCount} of {total} questions answered
          {total - answeredCount > 0 ? ` (${total - answeredCount} unanswered)` : ""}
          . {flaggedCount > 0 ? `${flaggedCount} flagged for review. ` : ""}
          Submitting counts as attempt {attemptsUsed + 1} of {model.maxAttempts}.
        </p>
        <div className="quiz-nav-buttons">
          <button className="button button-secondary" type="button" onClick={() => setConfirmOpen(false)}>
            Keep reviewing
          </button>
          <button className="button button-primary" type="button" onClick={handleConfirmSubmit}>
            Submit quiz
          </button>
        </div>
      </Modal>
    </div>
  );
}

function QuestionNavMap({
  questions,
  answers,
  flagged,
  currentIndex,
  onSelect,
}: {
  questions: ReadyModel["questions"];
  answers: Record<string, number | null>;
  flagged: Record<string, boolean>;
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav className="quiz-nav-map" aria-label="Question navigation">
      {questions.map((question, index) => {
        const isAnswered =
          answers[question.id] !== null && answers[question.id] !== undefined;
        const isCurrent = index === currentIndex;
        const isFlagged = Boolean(flagged[question.id]);
        const classes = [
          "quiz-nav-dot",
          isAnswered ? "is-answered" : "is-unanswered",
          isFlagged ? "is-flagged" : "",
          isCurrent ? "is-current" : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <button
            key={question.id}
            type="button"
            className={classes}
            aria-current={isCurrent ? "step" : undefined}
            aria-label={`Question ${index + 1}${isAnswered ? ", answered" : ", not answered"}${isFlagged ? ", flagged" : ""}`}
            onClick={() => onSelect(index)}
          >
            {index + 1}
          </button>
        );
      })}
    </nav>
  );
}
