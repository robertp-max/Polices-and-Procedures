// Generalized, scalable lesson/module data model (Phase 2).
// Structurally compatible with the Phase 1 Module 1 lesson shape.

export type KnowledgeCheckChoice = { id: string; label: string };

export type KnowledgeCheck = {
  prompt: string;
  choices: KnowledgeCheckChoice[];
  correctId: string;
  feedbackCorrect: string;
  feedbackIncorrect: string;
  /** Plain-language pointer used by remediation. */
  remediation?: string;
};

export type ModuleLesson = {
  id: string;
  index: number;
  title: string;
  estMinutes: number;
  learningGoal: string;
  scenario: string;
  keyConcept: string;
  whyItMatters: string[];
  practiceExample: string;
  commonMistake: string;
  knowledgeCheck?: KnowledgeCheck; // some lessons are read-only
  keyTerms: { term: string; definition: string }[];
  transcript: string;
  summary: string;
  smeFlag?: string; // surfaced to reviewers only
  cards?: any[];
};

export type ModuleStatus = "ready" | "sme-review" | "source-repair";
export type ModuleKind = "orientation" | "lesson" | "locked" | "final";

export type ModuleDef = {
  id: string;
  code: string;
  title: string;
  shortTitle: string;
  time: string;
  summary: string;
  kind: ModuleKind;
  status: ModuleStatus;
  lessons: ModuleLesson[];
  learningObjectives: string[];
  policyRefs?: string[];
  reviewerNote?: string;
  /** Whether this module counts toward required-theory completion in Phase 2. */
  countsTowardTheory: boolean;
};

export function lessonsRequiringCheck(def: ModuleDef): ModuleLesson[] {
  return def.lessons.filter((l) => Boolean(l.knowledgeCheck));
}
