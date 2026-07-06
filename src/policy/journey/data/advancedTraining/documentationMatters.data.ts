import type { ModuleDef, ModuleLesson } from "../lessonModel";
import { courseMeta, modules as documentationCourseModules } from "./documentationMatters/courseContent";
import { knowledgeCheckQuiz } from "./documentationMatters/quizContent";

type DocumentationModule = (typeof documentationCourseModules)[number];
type DocumentationLesson = DocumentationModule["lessons"][number];

const knowledgeCheckByModuleId = new Map(knowledgeCheckQuiz.map((item) => [item.moduleId, item]));

function toJourneyLesson(
  module: DocumentationModule,
  lesson: DocumentationLesson,
  moduleLessonIndex: number,
  globalIndex: number,
): ModuleLesson {
  const moduleQuiz = moduleLessonIndex === 0 ? knowledgeCheckByModuleId.get(module.id) : undefined;
  const lessonId = lesson.id.toLowerCase();
  const transcript = [lesson.context, lesson.keyRule, lesson.whyItMatters, lesson.example, lesson.keyTakeaway]
    .filter(Boolean)
    .join("\n\n");

  return {
    id: lessonId,
    index: globalIndex,
    title: `${module.number}.${moduleLessonIndex + 1} ${lesson.title}`,
    estMinutes: Math.max(5, Math.round(module.estimatedMinutes / Math.max(module.lessons.length, 1))),
    learningGoal: module.learningObjectives[0] ?? lesson.title,
    scenario: lesson.scenario?.stem ?? lesson.context,
    keyConcept: lesson.keyRule,
    whyItMatters: [lesson.whyItMatters],
    practiceExample: lesson.example,
    commonMistake:
      lesson.auditRisk ??
      lesson.clinicalRisk ??
      lesson.documentationTip ??
      "Documentation that cannot independently support skilled need, medical necessity, or patient response.",
    knowledgeCheck: moduleQuiz
      ? {
          prompt: moduleQuiz.stem,
          choices: moduleQuiz.options.map((option) => ({ id: option.id, label: option.text })),
          correctId: moduleQuiz.correctOptionId,
          feedbackCorrect: moduleQuiz.rationale.whyCorrect,
          feedbackIncorrect: "Review the documentation risk, auditor conclusion, and required support elements.",
          remediation: moduleQuiz.rationale.whatDocumentationShouldShow,
        }
      : undefined,
    keyTerms: [],
    transcript,
    summary: lesson.keyTakeaway,
    cards: [
      {
        module_id: "documentation-matters",
        lesson_id: lessonId,
        card_id: `${lessonId}_delivery`,
        card_type: "delivery",
        app: { location: `documentation-matters.lesson.${lessonId}.delivery` },
        display_title: lesson.title,
        learner_facing_content: transcript,
        cna_practice_example: lesson.example,
        key_terms: [],
        completion_condition: "Learner reviews the documentation integrity lesson and continues.",
        narration_script: transcript,
        transcript_text: transcript,
        estimated_narration_seconds: Math.max(30, Math.round((transcript.split(/\s+/).length / 140) * 60)),
        media_prompt_placeholder: {
          app_location: `documentation-matters.lesson.${lessonId}.delivery`,
          scene_title: `${lesson.title} documentation integrity review`,
        },
      },
    ],
  };
}

let nextLessonIndex = 0;

const documentationLessons: ModuleLesson[] = documentationCourseModules
  .filter((module) => module.number <= 8)
  .flatMap((module) =>
    module.lessons.map((lesson, moduleLessonIndex) =>
      toJourneyLesson(module, lesson, moduleLessonIndex, (nextLessonIndex += 1)),
    ),
  );

export const documentationMattersModule: ModuleDef = {
  id: "documentation-matters",
  code: "RN-ADV-04",
  title: "CMS Documentation Matters",
  shortTitle: "Documentation Matters",
  time: "4-6 hr",
  summary: courseMeta.description,
  kind: "lesson",
  status: "ready",
  countsTowardTheory: true,
  policyRefs: ["CL-CD-001", "CL-CD-002", "CL-CD-003", "CL-CD-004"],
  learningObjectives: courseMeta.learningObjectives,
  lessons: documentationLessons,
  reviewerNote: "Rendered from the recreated Documentation Matters LMS content under Journey advanced training.",
};
