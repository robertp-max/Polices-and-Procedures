import type { ModuleDef, ModuleLesson } from "./lessonModel";
import { ALL_MODULES, type ModuleData, type LessonPage } from "./ACHC_Annual_Assembled";
import { ALL_MODULES as onboardingModulesRaw } from "../../../v6/screens/pageviews/CareIndeedOnboardingLMS";
import { cms485PlanOfCareModule } from "./advancedTraining/cms485PlanOfCare.data";
import { qapiModule, qapiQuizzes } from "./advancedTraining/qapi.data";

function appModuleId(moduleId: string): string {
  // moduleId is e.g. "ACHC-ART-M01" -> "m1"
  const match = moduleId.match(/M(\d+)/i);
  return match ? `m${Number(match[1])}` : moduleId.toLowerCase();
}

function canonicalModuleId(moduleId: string): string {
  if (moduleId.toUpperCase().startsWith("ACHC-ART-")) return moduleId.toUpperCase();
  // For ACHC modules, they are either like "m1", "m2", "m10", or "1", "2", "10"
  if (/^[mM]?\d+$/.test(moduleId)) {
    const match = moduleId.match(/(\d+)/);
    if (match) {
      return `ACHC-ART-M${match[1].padStart(2, "0")}`;
    }
  }
  return moduleId;
}

function mapPageToLesson(page: LessonPage, index: number): ModuleLesson {
  const cards: any[] = [];
  const lessonId = `l${index}`;

  // Card 1: Overview
  cards.push({
    module_id: page.moduleId,
    lesson_id: `L${String(index).padStart(2, "0")}`,
    card_id: `${page.pageId}_OVERVIEW`,
    card_type: "overview",
    app: { location: `${page.moduleId}.lesson.l${index}.overview` },
    display_title: page.title,
    learner_facing_content: page.contentHtml.replace(/<[^>]*>/g, ""), // text version
    learning_goal: page.title,
    cna_practice_example: page.challenge?.documentationPrompt || page.challenge?.teachingPoint || "Follow care plans and report status.",
    why_it_matters: [
      page.media.mediaInstruction || "Protects patient safety and dignity.",
      "Ensures compliance with care regulations.",
      "Demonstrates clinical safety principles."
    ],
    key_terms: [],
    completion_condition: "Learner views this card and continues.",
    narration_script: page.narrationText,
    transcript_text: page.narrationText,
    estimated_narration_seconds: Math.max(15, Math.round((page.narrationText.split(/\s+/).length / 140) * 60)),
    media_prompt_placeholder: {
      app_location: `${page.moduleId}.lesson.l${index}.overview`,
      scene_title: page.media.imagePrompt,
    }
  });

  // Card 2: Delivery
  cards.push({
    module_id: page.moduleId,
    lesson_id: `L${String(index).padStart(2, "0")}`,
    card_id: `${page.pageId}_DELIVERY`,
    card_type: "delivery",
    app: { location: `${page.moduleId}.lesson.l${index}.delivery` },
    display_title: page.title,
    learner_facing_content: page.contentHtml.replace(/<[^>]*>/g, ""), // text version
    cna_practice_example: page.challenge?.documentationPrompt || page.challenge?.teachingPoint || "",
    key_terms: [],
    completion_condition: "Learner views this card and continues.",
    narration_script: page.narrationText,
    transcript_text: page.narrationText,
    estimated_narration_seconds: Math.max(15, Math.round((page.narrationText.split(/\s+/).length / 140) * 60)),
    media_prompt_placeholder: {
      app_location: `${page.moduleId}.lesson.l${index}.delivery`,
      scene_title: page.media.videoPrompt,
    }
  });

  // Card 3 & 4: Challenge & Debrief (if challenge exists)
  if (page.challenge) {
    const correctOpt = page.challenge.options.find(o => o.isBestPractice) || page.challenge.options[0];
    cards.push({
      module_id: page.moduleId,
      lesson_id: `L${String(index).padStart(2, "0")}`,
      card_id: `${page.pageId}_CHALLENGE`,
      card_type: "challenge",
      app: { location: `${page.moduleId}.lesson.l${index}.challenge` },
      display_title: page.challenge.title,
      learner_facing_content: page.challenge.scenario,
      transcript_text: page.challenge.narrationText,
      estimated_narration_seconds: Math.max(20, page.challenge.estimatedInteractionMinutes * 60),
      media_prompt_placeholder: {
        app_location: `${page.moduleId}.lesson.l${index}.challenge`,
        scene_title: page.media.imagePrompt,
      },
      internal_challenge: {
        id: page.challenge.challengeId,
        prompt: page.challenge.prompt,
        choices: page.challenge.options.map(o => ({ id: o.id, label: o.text })),
        correct_id_internal: correctOpt.id,
        rationale_internal: page.challenge.teachingPoint,
      }
    });

    cards.push({
      module_id: page.moduleId,
      lesson_id: `L${String(index).padStart(2, "0")}`,
      card_id: `${page.pageId}_DEBRIEF`,
      card_type: "debrief",
      app: { location: `${page.moduleId}.lesson.l${index}.debrief` },
      display_title: "Challenge Debrief",
      learner_facing_content: page.challenge.teachingPoint,
      transcript_text: page.challenge.teachingPoint,
      estimated_narration_seconds: 20,
      media_prompt_placeholder: {
        app_location: `${page.moduleId}.lesson.l${index}.debrief`,
        scene_title: page.media.imagePrompt,
      }
    });
  }

  const correctOpt = page.challenge?.options.find(o => o.isBestPractice) || page.challenge?.options[0];

  return {
    id: lessonId,
    index,
    title: page.title,
    estMinutes: Math.max(5, Math.round(page.duration.includedRequiredMinutes)),
    learningGoal: page.title,
    scenario: page.challenge?.scenario || page.narrationText.slice(0, 200),
    keyConcept: page.contentHtml,
    whyItMatters: [page.media.mediaInstruction || "Standard clinical guideline."],
    practiceExample: page.challenge?.documentationPrompt || page.challenge?.teachingPoint || "",
    commonMistake: page.challenge?.escalationPrompt || "Out of scope action.",
    keyTerms: [],
    transcript: page.narrationText,
    summary: page.narrationText,
    cards, // Attach custom cards list dynamically
    knowledgeCheck: page.challenge ? {
      prompt: page.challenge.prompt,
      choices: page.challenge.options.map(o => ({ id: o.id, label: o.text })),
      correctId: correctOpt?.id || "A",
      feedbackCorrect: correctOpt?.feedback || "Correct.",
      feedbackIncorrect: "Please review the safest choice.",
    } : undefined,
  };
}

function toModuleDef(mod: ModuleData): ModuleDef {
  const instructionPages = mod.pages.filter(p =>
    ['instruction', 'scenario-challenge', 'documentation-practice'].includes(p.pageType)
  );

  return {
    id: appModuleId(mod.moduleId),
    code: mod.moduleId.replace("ACHC-ART-", ""),
    title: mod.title,
    shortTitle: mod.title,
    time: `${(mod.minimumRequiredMinutes / 60).toFixed(0)} hr`,
    summary: instructionPages.map(p => p.title).slice(0, 3).join("; ") + "...",
    kind: "lesson",
    status: "ready",
    countsTowardTheory: true,
    learningObjectives: mod.remediationObjectives.map(o => o.description),
    lessons: instructionPages.map((page, idx) => mapPageToLesson(page, idx + 1)),
  };
}

function onboardingToModuleDef(mod: any): ModuleDef {
  return {
    id: mod.id,
    code: mod.id,
    title: mod.title,
    shortTitle: mod.title,
    time: `${(mod.durationMinutes / 60).toFixed(1)} hr`,
    summary: mod.pages.map((p: any) => p.title).slice(0, 3).join("; ") + "...",
    kind: "lesson",
    status: "ready",
    countsTowardTheory: false, // Onboarding modules do not count toward ACHC theory completion
    learningObjectives: [mod.regulatoryBasis || "CMS Conditions of Participation"],
    lessons: mod.pages.map((page: any, idx: number) => {
      const index = idx + 1;
      const lessonId = `l${index}`;
      const cards: any[] = [];

      // Card 1: Overview
      cards.push({
        module_id: mod.id,
        lesson_id: `L${String(index).padStart(2, "0")}`,
        card_id: `${mod.id}_L${index}_OVERVIEW`,
        card_type: "overview",
        app: { location: `${mod.id}.lesson.l${index}.overview` },
        display_title: page.title,
        learner_facing_content: page.content.replace(/<[^>]*>/g, ""), // text version
        learning_goal: page.title,
        cna_practice_example: "Follow care plans and report status.",
        why_it_matters: [
          "Protects patient safety and dignity.",
          "Ensures compliance with care regulations.",
        ],
        key_terms: [],
        completion_condition: "Learner views this card and continues.",
        narration_script: page.narration,
        transcript_text: page.narration,
        estimated_narration_seconds: Math.max(15, Math.round((page.narration.split(/\s+/).length / 140) * 60)),
        media_prompt_placeholder: {
          app_location: `${mod.id}.lesson.l${index}.overview`,
          scene_title: page.imageAlt || page.title,
        }
      });

      // Card 2: Delivery
      cards.push({
        module_id: mod.id,
        lesson_id: `L${String(index).padStart(2, "0")}`,
        card_id: `${mod.id}_L${index}_DELIVERY`,
        card_type: "delivery",
        app: { location: `${mod.id}.lesson.l${index}.delivery` },
        display_title: page.title,
        learner_facing_content: page.content, // HTML version
        cna_practice_example: "",
        key_terms: [],
        completion_condition: "Learner views this card and continues.",
        narration_script: page.narration,
        transcript_text: page.narration,
        estimated_narration_seconds: Math.max(15, Math.round((page.narration.split(/\s+/).length / 140) * 60)),
        media_prompt_placeholder: {
          app_location: `${mod.id}.lesson.l${index}.delivery`,
          scene_title: page.imageAlt || page.title,
        }
      });

      return {
        id: lessonId,
        index,
        title: page.title,
        estMinutes: 3,
        learningGoal: page.title,
        scenario: page.narration.slice(0, 200),
        keyConcept: page.content,
        whyItMatters: ["Standard clinical guideline."],
        practiceExample: "",
        commonMistake: "",
        keyTerms: [],
        transcript: page.narration,
        summary: page.narration,
        cards,
      };
    }),
  };
}

// 1. Prepend dynamic Orientation Module (M00 / m0)
const orientationModule: ModuleDef = {
  id: "m0",
  code: "M0",
  title: "Orientation and Compliance Boundaries",
  shortTitle: "Orientation",
  time: "0.5 hr",
  summary: "Verify identity and confirm compliance boundaries",
  kind: "orientation",
  status: "ready",
  countsTowardTheory: false,
  learningObjectives: [
    "Course Purpose and Package Source Basis",
    "Learner Identity and Completion Evidence",
    "CNA Scope and No Clinical-Hour Credit",
    "No PHI and Safe Practice Scenarios",
    "Certificate Gate and Final Assessment Boundaries"
  ],
  lessons: [],
};

// 2. Load all mapped modules
const mappedACHCModules: ModuleDef[] = ALL_MODULES.map(toModuleDef);

const onboardingModulesOnly = onboardingModulesRaw.filter(m => m.track !== "ANN" && m.id !== "cms-485" && m.id !== "qapi");
const mappedOnboardingModules = onboardingModulesOnly.map(onboardingToModuleDef);

export const courseModules: ModuleDef[] = [
  orientationModule,
  ...mappedOnboardingModules,
  ...mappedACHCModules,
  cms485PlanOfCareModule,
  qapiModule,
];

export function getModuleDef(moduleId: string): ModuleDef | undefined {
  return courseModules.find((m) => m.id === moduleId);
}

export function getLessonDef(moduleId: string, lessonId: string) {
  return getModuleDef(moduleId)?.lessons.find((l) => l.id === lessonId);
}

export const requiredTheoryModuleIds = courseModules.filter((m) => m.countsTowardTheory).map((m) => m.id);
export const moduleSequence = courseModules.map((m) => m.id);

export function getGeneratedModule(moduleId: string) {
  const canonical = canonicalModuleId(moduleId);
  return ALL_MODULES.find((m) => m.moduleId === canonical);
}

export function getGeneratedLesson(moduleId: string, lessonId: string) {
  const mod = getModuleDef(moduleId);
  return mod?.lessons.find((l) => l.id === lessonId);
}

export function getModuleAssessment(moduleId: string) {
  if (moduleId.toLowerCase() === "cms-485") {
    return {
      title: "CMS-485 Plan of Care Clinical Audit Lab",
      pass_percent: 100,
      questions: [
        { id: "case-1", prompt: "Henderson Case Study", choices: [], correct_id_internal: "" },
        { id: "case-2", prompt: "Alvarez Case Study", choices: [], correct_id_internal: "" },
        { id: "case-3", prompt: "Okafor Case Study", choices: [], correct_id_internal: "" },
      ],
    };
  }

  if (moduleId.toLowerCase() === "qapi") {
    return {
      title: "Quality Assessment & Performance Improvement (QAPI) Assessment",
      pass_percent: 80,
      questions: qapiQuizzes.map((q) => ({
        id: q.id,
        prompt: q.scenario ? `${q.scenario}\n\n${q.question}` : q.question,
        choices: q.options.map((o) => ({ id: o.id, label: o.label })),
        correct_id_internal: q.correctAnswerId,
      }))
    };
  }

  // Try to find in onboarding modules first
  const onboardingMod = onboardingModulesRaw.filter(m => m.track !== "ANN").find(m => m.id.toLowerCase() === moduleId.toLowerCase());
  if (onboardingMod) {
    return {
      title: onboardingMod.title,
      pass_percent: onboardingMod.passScore || 80,
      questions: onboardingMod.exam.map((q: any) => ({
        id: q.id,
        prompt: q.stem,
        choices: q.options.map((o: string, idx: number) => ({ id: String.fromCharCode(65 + idx), label: o })),
        correct_id_internal: String.fromCharCode(65 + q.correctIndex),
      }))
    };
  }


  // Otherwise check ACHC
  const canonical = canonicalModuleId(moduleId);
  const mod = ALL_MODULES.find(m => m.moduleId === canonical);
  if (!mod) return undefined;
  return {
    title: mod.title,
    pass_percent: mod.passingScore || 80,
    questions: mod.finalAssessmentQuestions.map(q => ({
      id: q.questionId,
      prompt: q.questionText,
      choices: q.options.map(o => ({ id: o.id, label: o.text })),
      correct_id_internal: q.options.find(o => o.isCorrect)?.id || q.options[0]?.id,
    }))
  };
}

export function getModuleQuizItems(moduleId = "m1") {
  const assessment = getModuleAssessment(moduleId);
  return (assessment?.questions ?? []).map((question) => ({
    id: question.id,
    prompt: question.prompt,
    choices: question.choices,
    correctId: question.correct_id_internal,
  }));
}

export function getModuleQuizPassPct(moduleId = "m1") {
  return getModuleAssessment(moduleId)?.pass_percent ?? 80;
}

export function scoreModuleQuiz(answers: Record<string, string>, moduleId = "m1"): { pct: number; passed: boolean } {
  const items = getModuleQuizItems(moduleId);
  const passPct = getModuleQuizPassPct(moduleId);
  const correct = items.filter((q) => answers[q.id] === q.correctId).length;
  const pct = items.length ? Math.round((correct / items.length) * 100) : 0;
  return { pct, passed: pct >= passPct };
}

export type ExamItem = {
  id: string;
  moduleCode: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
};

// 3. Exam Pool collected across all 12 modules
export const examPool: ExamItem[] = ALL_MODULES.flatMap((mod) =>
  mod.finalAssessmentQuestions.map((q) => ({
    id: q.questionId,
    moduleCode: mod.moduleId.replace("ACHC-ART-", ""),
    prompt: q.questionText,
    choices: q.options.map((o) => ({ id: o.id, label: o.text })),
    correctId: q.options.find((o) => o.isCorrect)?.id || q.options[0]?.id,
  }))
);

export const EXAM = {
  ATTEMPT_SIZE: 20,
  PASS_PCT: 80,
  NOTICE: "All final assessment attempts are logged. Answer choices are randomized. Rationales are hidden.",
};

export function drawAttempt(size = EXAM.ATTEMPT_SIZE, seed = Date.now()): ExamItem[] {
  const arr = [...examPool];
  let s = seed % 2147483647;
  const rand = () => (s = (s * 48271) % 2147483647) / 2147483647;
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, Math.min(size, arr.length));
}

export function scoreAttempt(items: ExamItem[], answers: Record<string, string>) {
  const correct = items.filter((it) => answers[it.id] === it.correctId).length;
  const pct = items.length ? Math.round((correct / items.length) * 100) : 0;
  return { correct, total: items.length, pct, passed: pct >= EXAM.PASS_PCT };
}

// 4. Mapped appCopy values to describe the ACHC mandatory curriculum.
export const appCopy = {
  dashboard: {
    badge: "ACHC Required Training Pathway",
    title: "ACHC Annual Required In-Services",
    summary: "A structured 12-hour mandatory training program covering the 12 ACHC required topics for all home health agency staff.",
    compliance_notice: "This portal verifies compliance with the 12 ACHC mandatory training sections. Completing all modules and passing assessments is required for everyone. Optional Clinical Support is separate and non-gating.",
    theory_card: "Required theory modules total 720 minutes / 12 hours: Cultural Awareness, Emergency Preparedness, Complaints/Grievances, HIPAA Privacy/Security, Infection Control, Communication Barriers, Workplace/Patient Safety (OSHA), Patient Rights, Corporate Compliance, Ethics, TB/Blood Borne Pathogens, and Medical Device Act.",
    clinical_card: "Optional Clinical Scenario Support is for clinical confidence. It is non-credit, non-gating, and does not affect your certificate status.",
    audit_card: "No PHI may be entered in course activities. Active-time and certificate surfaces are tracked dynamically to ensure survey readiness."
  },
  module0: {
    eyebrow: "Required Step - Module 0",
    title: "Identity and Compliance Orientation",
    intro: "Review the mandatory course boundaries before starting required theory. This orientation records identity, online-cap, no-PHI, and final readiness acknowledgements.",
    acknowledgements: [
      {
        key: "orientationFinalAck",
        text: "I certify that my legal identity matches the credential entered above, and that I alone will complete this mandatory training program."
      },
      {
        key: "phiAck",
        text: "No-PHI Safeguards Active: I will not enter real Protected Health Information (PHI), patient records, facility identifiers, or actual patient identifiers anywhere in this portal."
      },
      {
        key: "onlineCapAck",
        text: "I understand this course provides mandatory theory training only. It does not replace required practical credentials or hands-on checks."
      }
    ]
  },
  moduleAssessment: {
    title: "Module Knowledge Check",
    summary: "Each ACHC module knowledge check verifies source-backed theory understanding without exposing answer keys.",
    remediation: "Review module source cards and principles before retaking the quiz."
  },
  final: {
    title: "Course Final Assessment",
    summary: "A course-wide cumulative assessment covering the 12 required ACHC topics. Correct answers and rationales are scored internally and are not revealed in learner-facing results.",
    no_key_notice: "To preserve assessment integrity, the final exam does not reveal correct answers during or after submission. Active-time remains demo/MVP unless the validated engine is implemented.",
    pass_title: "Final Assessment Passed",
    pass_body: "You met the final assessment threshold. Continue to the certificate gate status page. Production certificate issuance remains disabled pending required approvals.",
    fail_title: "Remediation Required",
    fail_body: "Your score was below the required threshold. Review the related module topics and retake when ready. Correct answer keys remain locked."
  },
  certificate: {
    checklist_title: "Required Audit Checklist",
    intro: "Certificate surfaces remain locked unless required gates are complete. Production issuance stays disabled at all times in this preview.",
    affidavit_text: "I attest that I personally completed the required online theory activities in this portal. Draft wording only; e-signature method and legal language require approval.",
    ready_body: "All required learner steps are complete. Production certificate issuance remains disabled until approval metadata, NAC#, approved wording, affidavit method, and active-time validation are configured.",
    locked_body: "Complete legal verification, required theory study, final assessment, active-time, and the draft affidavit to unlock the mock certificate preview.",
    restriction: "Official certificate downloading is disabled in preview environments. Real validation files may only be generated after approval metadata, provider identification, certificate wording, affidavit method, and all gates are complete."
  },
  clinicalHub: {
    title: "Clinical Scenario Support Hub",
    eyebrow: "Optional Practical Enrichment",
    badge: "OPTIONAL - NON-GATING - NON-CREDIT",
    warning: "Optional clinical support is disabled/non-credit in this rebuild and never counts toward required theory.",
    scenarios: [
      {
        title: "Skills Refresh Menu",
        body: "Review optional skill-reference topics tied to theory modules. These resources are not graded and are not certificate gates.",
        action: "Open Optional Review"
      },
      {
        title: "Optional Confidence Checks",
        body: "Use low-stakes self-ratings to identify topics for personal review. These checks are not competency validation and are not stored as CE evidence.",
        action: "Start Optional Check"
      }
    ],
    documentation_title: "Documentation support (practice)",
    documentation_warning: "STOP: Do not enter PHI, real resident names, room numbers, facility data, medical record numbers, dates of birth, or actual case details. Use fictional practice notes only."
  }
};

export const contentV2 = {
  clinical_support: {
    units: [] as any[],
    confidence_checks: [] as any[],
  }
};

