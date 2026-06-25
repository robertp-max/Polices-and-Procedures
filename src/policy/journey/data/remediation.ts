// Course-extension remediation model.
//
// Remediation here is a *re-teaching extension of the theory lesson*, not a quiz
// answer-key reveal. We never render internal scoring language (e.g. "correct
// answer", "rationale for internal use", "answer key", "correct_id_internal").
//
// For LESSON practice challenges it is appropriate to surface the safest response
// as a teaching point. For the FINAL assessment we never expose option-level
// rationales or the answer key (see buildFinalRemediation).
//
// Authored, SME-reviewed copy can override the derived copy via
// remediationOverrides.ts keyed by the challenge app.location.

import { remediationOverrides } from "./remediationOverrides";

export type RemediationStatus = "safest" | "needs-review";

export type RemediationChoice = { id: string; label: string };

export type RemediationChallenge = {
  id?: string;
  app_location?: string;
  prompt: string;
  choices: readonly RemediationChoice[];
  correct_id_internal?: string;
  rationale_internal?: string;
};

export type OptionReview = {
  id: string;
  label: string;
  status: RemediationStatus;
  /** Why this option is safe, incomplete, unsafe, out of sequence, or outside CNA scope. */
  why: string;
  /** What the CNA should remember about this option. */
  remember: string;
};

export type LessonRemediation = {
  title: string;
  submittedNote: string;
  safetyPrinciple: string;
  /** Label text of the safest response (never the internal id). */
  safestResponseLabel: string;
  whySafest: string;
  cnaScopeNote: string;
  residentSafetyNote: string;
  whatToRemember: string;
  options: OptionReview[];
  continueLabel: string;
  /** Internal-only: which option id is safest, used to gate the read-before-continue flow. Never rendered. */
  safestId: string;
  narration: string;
  transcript: string;
  completionCondition: string;
};

const DEFAULT_SAFETY_PRINCIPLE =
  "When you are unsure, choose the action that protects the resident first, stays inside CNA scope, and keeps required observe-report-document and care-plan steps in the right order.";

const DEFAULT_SCOPE_NOTE =
  "As a CNA you observe, report, document, and follow the care plan. You do not diagnose, change orders, or perform tasks outside your training and assignment.";

const DEFAULT_RESIDENT_SAFETY_NOTE =
  "Resident safety and dignity come first. Prevent avoidable harm, protect privacy, and report any change of condition promptly to the licensed nurse.";

function sentence(text: string | undefined, fallback: string): string {
  const t = (text || "").trim();
  if (!t) return fallback;
  return /[.!?]$/.test(t) ? t : `${t}.`;
}

function lower(label: string): string {
  return label.replace(/\.$/, "").trim().toLowerCase();
}

/** Build a polished, course-extension remediation for a single lesson challenge. */
export function buildLessonRemediation(challenge: RemediationChallenge): LessonRemediation {
  const override = (challenge.id && remediationOverrides[challenge.id]) || undefined;
  const safestId = challenge.correct_id_internal ?? challenge.choices[0]?.id ?? "A";
  const safestChoice = challenge.choices.find((c) => c.id === safestId) ?? challenge.choices[0];
  const safestLabel = safestChoice?.label ?? "";

  const whySafest = sentence(
    override?.whySafest ?? challenge.rationale_internal,
    `Choosing to ${lower(safestLabel)} keeps the resident safe and stays within CNA scope, which is why it is the safest response in this situation.`,
  );

  const safetyPrinciple = override?.safetyPrinciple ?? DEFAULT_SAFETY_PRINCIPLE;
  const cnaScopeNote = override?.cnaScopeNote ?? DEFAULT_SCOPE_NOTE;
  const residentSafetyNote = override?.residentSafetyNote ?? DEFAULT_RESIDENT_SAFETY_NOTE;
  const whatToRemember = sentence(
    override?.whatToRemember,
    `Picture this scene on the floor: lead with the action that keeps the resident safest, then complete the remaining observe-report-document steps in order. ${whySafest}`,
  );

  const options: OptionReview[] = challenge.choices.map((choice) => {
    const isSafest = choice.id === safestId;
    const authored = override?.options?.[choice.id];
    if (isSafest) {
      return {
        id: choice.id,
        label: choice.label,
        status: "safest",
        why: sentence(authored?.why ?? override?.whySafest ?? challenge.rationale_internal, whySafest),
        remember: sentence(
          authored?.remember,
          "This is the response to carry into real practice. Make it your default first move whenever this situation comes up.",
        ),
      };
    }
    return {
      id: choice.id,
      label: choice.label,
      status: "needs-review",
      why: sentence(
        authored?.why,
        "This option is not the safest first response here. On its own it can skip a required step, act out of sequence, or reach past what a CNA should do alone. Read it next to the safest response above and notice what it leaves out.",
      ),
      remember: sentence(
        authored?.remember,
        "Before choosing an action, check it against CNA scope and resident safety, and confirm nothing required is being skipped.",
      ),
    };
  });

  const narration = override?.narration
    ? override.narration
    : `Challenge debrief. Your response has been submitted. ${safetyPrinciple} The safest response is to ${lower(safestLabel)}. ${whySafest} ${cnaScopeNote} ${residentSafetyNote} Before you continue, review the safest response and your own choice so the reason stays with you on the floor.`;

  return {
    title: "Challenge Debrief",
    submittedNote: "Your response has been submitted.",
    safetyPrinciple,
    safestResponseLabel: safestLabel,
    whySafest,
    cnaScopeNote,
    residentSafetyNote,
    whatToRemember,
    options,
    continueLabel: "Continue After Review",
    safestId,
    narration,
    transcript: override?.transcript ?? narration,
    completionCondition:
      "Submit your response, then open the safest response and your own choice in the option review before completing the lesson.",
  };
}

// ---------------------------------------------------------------------------
// Module assessment remediation (required theory extension — NOT clinical support)
// ---------------------------------------------------------------------------

export type MissedTopicCard = { title: string; review: string };

export type ModuleRemediation = {
  overview: string;
  missedTopics: MissedTopicCard[];
  practiceScenario: { prompt: string; guidance: string };
  retryReadiness: string[];
  retryLabel: string;
};

type GenCardLike = {
  readonly card_type: string;
  readonly learning_goal?: string;
  readonly learner_facing_content?: string;
  readonly cna_practice_example?: string;
};

type GenLessonLike = {
  readonly lesson_title: string;
  readonly cards: readonly GenCardLike[];
};

/**
 * Topic-level (and optionally item-level) remediation for a failed module
 * assessment. This is a required theory review extension. It is NOT clinical
 * support, NOT a clinical hour, NOT competency validation, and never exposes a
 * final-assessment answer key.
 */
export function buildModuleRemediation(moduleTitle: string, lessons: readonly GenLessonLike[]): ModuleRemediation {
  const missedTopics: MissedTopicCard[] = lessons.slice(0, 6).map((lesson) => {
    const overview = lesson.cards.find((c) => c.card_type === "overview");
    const delivery = lesson.cards.find((c) => c.card_type === "delivery");
    const review =
      overview?.learning_goal?.trim() ||
      delivery?.learner_facing_content?.slice(0, 200).trim() ||
      "Re-read this topic's lesson cards and the key terms before retrying.";
    return { title: lesson.lesson_title, review: sentence(review, review) };
  });

  const scenarioSource = lessons
    .flatMap((l) => l.cards)
    .find((c) => c.cna_practice_example && c.cna_practice_example.trim());

  return {
    overview: `This is a focused theory review for ${moduleTitle}. Work through the missed-topic cards and the practice scenario below, confirm you are ready, then retry the assessment. This review counts only as online theory review time — it is not a clinical hour, simulation, competency check, or optional clinical-support activity.`,
    missedTopics,
    practiceScenario: {
      prompt: sentence(
        scenarioSource?.cna_practice_example,
        "On your shift, walk through the safest first action for this module's core skill: observe, keep the resident safe, then report and document within CNA scope.",
      ),
      guidance:
        "Talk yourself through the safest in-scope action step by step. Name what you would observe, what you would do first to keep the resident safe, and who you would report to.",
    },
    retryReadiness: [
      "I re-read each missed-topic review card above.",
      "I can describe the safest in-scope CNA action for this module's core skills.",
      "I know what to observe, report, and document, and who to report to.",
    ],
    retryLabel: "Retry Assessment",
  };
}

// ---------------------------------------------------------------------------
// Final assessment remediation (NEVER exposes correct answers or rationales)
// ---------------------------------------------------------------------------

export type FinalTopicArea = { code: string; title: string; revisit: string };

export type FinalRemediation = {
  overview: string;
  topicAreas: FinalTopicArea[];
  pathway: string[];
  retryInstructions: string;
};

type FinalModuleLike = { code: string; shortTitle: string; countsTowardTheory: boolean; kind: string };

/**
 * Final-assessment remediation shows ONLY: a study direction, the topic areas to
 * review, the recommended modules/cards to revisit, the remediation pathway, and
 * retry instructions. It NEVER shows final-exam correct answers, option-level
 * rationales, the answer key, or internal scoring fields.
 */
export function buildFinalRemediation(modules: FinalModuleLike[]): FinalRemediation {
  const topicAreas: FinalTopicArea[] = modules
    .filter((m) => m.countsTowardTheory && m.kind === "lesson")
    .map((m) => ({
      code: m.code,
      title: m.shortTitle,
      revisit: `Revisit the ${m.shortTitle} lesson cards and key terms, then redo the in-lesson practice challenge.`,
    }));

  return {
    overview:
      "Your score was below the required threshold. Review the topic areas below, then retake the assessment when you are ready. To protect assessment integrity, the final exam never reveals correct answers, rationales, or an answer key.",
    topicAreas,
    pathway: [
      "Reopen the recommended modules and re-read the lesson cards and key terms.",
      "Redo each in-lesson practice challenge and read the Challenge Debrief.",
      "Confirm you can describe the safest in-scope CNA action for each topic.",
      "Return here and retake the final assessment.",
    ],
    retryInstructions:
      "When you are ready, restart the final assessment from the splash screen. A fresh set of questions is drawn each attempt; your best passing score is recorded.",
  };
}
