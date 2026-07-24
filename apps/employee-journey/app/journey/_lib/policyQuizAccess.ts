/* ═══════════════════════════════════════════════════════════════
   Policy quiz access layer — build/request-time only.
   Reads ONLY app/journey/_generated/** (never main-app src at runtime).
   Resolves a route param (assignmentId) against POLICY_ASSIGNMENT_MAP,
   joins it to the matching course quiz bundle in POLICY_QUIZ_MAP, and
   resolves every referenced policyId against POLICY_CATALOG so the
   client component never has to reach for canonical sources itself.
   No question content is generated here — DRAFT/MISSING banks are
   passed through exactly as authored by the generator.
   ═══════════════════════════════════════════════════════════════ */

import {
  getQuizBundle,
  type GeneratedQuizBundle,
} from "../_generated/policyQuizMap.generated";
import { getGeneratedPolicy } from "../_generated/policyCatalog.generated";
import { findAssignment } from "./policyAssignmentView";

export type QuizBankStatus = GeneratedQuizBundle["bankStatus"];

export type QuizQuestionVM = {
  id: string;
  stem: string;
  options: string[];
  correctIndex: number;
  policyId: string;
};

export type PolicyReferenceVM = {
  policyId: string;
  policyTitle: string | null;
  /** true only when the canonical resolver marked this policy 'verified' */
  resolved: boolean;
};

export type QuizViewModel =
  | { kind: "assignment_not_found"; assignmentId: string }
  | {
      kind: "ready";
      assignmentId: string;
      policyId: string;
      policyTitle: string;
      pathway: string;
      courseId: string;
      courseTitle: string;
      quizRequired: boolean;
      attestationRequired: boolean;
      bankStatus: QuizBankStatus;
      passScore: number;
      maxAttempts: number;
      requiredQuestionCount: number;
      questions: QuizQuestionVM[];
      bundleNote: string;
      bundlePolicyIds: string[];
      policyReferences: Record<string, PolicyReferenceVM>;
    };

function resolvePolicyReference(policyId: string): PolicyReferenceVM {
  const entry = getGeneratedPolicy(policyId);
  if (!entry || !entry.title) {
    return { policyId, policyTitle: null, resolved: false };
  }
  return {
    policyId,
    policyTitle: entry.title,
    resolved: entry.policyRefStatus === "verified",
  };
}

export function buildQuizViewModel(rawAssignmentId: string): QuizViewModel {
  const assignmentId = decodeURIComponent(rawAssignmentId);
  const assignment = findAssignment(assignmentId);

  if (!assignment) {
    return { kind: "assignment_not_found", assignmentId };
  }

  const bundle = getQuizBundle(assignment.courseId);
  const bankStatus: QuizBankStatus = bundle?.bankStatus ?? "MISSING";
  const questions: QuizQuestionVM[] = (bundle?.draftQuestions ?? []).map(
    (question) => ({
      id: question.id,
      stem: question.stem,
      options: question.options,
      correctIndex: question.correctIndex,
      policyId: question.policyId,
    }),
  );
  const bundlePolicyIds = bundle?.policyIds ?? [assignment.policyId];

  const referenceIds = new Set<string>([
    assignment.policyId,
    ...bundlePolicyIds,
    ...questions.map((question) => question.policyId),
  ]);
  const policyReferences: Record<string, PolicyReferenceVM> = {};
  referenceIds.forEach((policyId) => {
    policyReferences[policyId] = resolvePolicyReference(policyId);
  });

  return {
    kind: "ready",
    assignmentId: assignment.assignmentId,
    policyId: assignment.policyId,
    policyTitle: assignment.policyTitle,
    pathway: assignment.pathway,
    courseId: assignment.courseId,
    courseTitle: assignment.courseTitle,
    quizRequired: assignment.quizRequired,
    attestationRequired: assignment.attestationRequired,
    bankStatus,
    passScore: bundle?.passScore ?? 80,
    maxAttempts: bundle?.maxAttempts ?? 3,
    requiredQuestionCount: bundle?.questionCount ?? 10,
    questions,
    bundleNote:
      bundle?.note ??
      "No quiz bundle mapping exists yet for this course in the generated matrix.",
    bundlePolicyIds,
    policyReferences,
  };
}
