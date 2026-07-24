/**
 * Build-time/server-side view-model assembly for the Policy Learning Player.
 *
 * Pulls exclusively from app/journey/_generated/** (never main-app src at runtime).
 * Kept as a plain function (no React) so it can run inside the server component
 * for the [assignmentId] route without shipping the multi-megabyte generated
 * registries to the client bundle — only the resolved, per-assignment slice is
 * serialized to the client.
 */
import {
  POLICY_ASSIGNMENT_MAP,
  type GeneratedPolicyAssignment,
} from "../_generated/policyAssignmentMap.generated";
import {
  getGeneratedPolicy,
  type GeneratedPolicy,
} from "../_generated/policyCatalog.generated";
import { getQuizBundle } from "../_generated/policyQuizMap.generated";
import { getGeneratedModule } from "../_generated/moduleCatalog.generated";
import { getModulePlayerEntry } from "../_generated/modulePlayerMap.generated";
import {
  getAppendixCrosswalk,
  type AppendixClassification,
} from "../_generated/appendixFormCrosswalk.generated";
import { getAppendixForm } from "../_generated/appendixForms.generated";

export interface PolicyPlayerRelatedModule {
  id: string;
  title: string | null;
  playerAvailable: boolean;
  launchRef: string | null;
  evidenceAppendix: string | null;
}

export interface PolicyPlayerRelatedFormGroup {
  appendixKey: string;
  label: string;
  classification: AppendixClassification;
  note: string;
  sourceModuleIds: string[];
  forms: { id: string; title: string; type: string }[];
}

export interface PolicyPlayerQuiz {
  bundleId: string;
  courseId: string;
  title: string;
  passScore: number;
  maxAttempts: number;
  questionCount: number;
  bankStatus: "APPROVED" | "DRAFT_REVIEW_REQUIRED" | "MISSING";
  note: string;
  policyIds: string[];
}

export interface PolicyPlayerViewModel {
  assignmentId: string;
  pathway: string;
  policyId: string;
  policyTitle: string;
  courseId: string;
  courseTitle: string;
  assignmentType: string;
  tier: string;
  required: boolean;
  awarenessReferenceOnly: boolean;
  quizRequired: boolean;
  attestationRequired: boolean;
  initialDue: string;
  recurrence: string;
  releaseStatus: string;
  releaseBlocked: boolean;
  inherited: boolean;
  scopeRationale: string;
  internalSource: string;
  externalAuthorityUrl: string;
  sourceNotes: string;
  policy: GeneratedPolicy | null;
  unlocked: boolean;
  lockReason: string | null;
  quiz: PolicyPlayerQuiz | null;
  relatedModules: PolicyPlayerRelatedModule[];
  relatedForms: PolicyPlayerRelatedFormGroup[];
}

export function findAssignment(
  assignmentId: string,
): GeneratedPolicyAssignment | undefined {
  return POLICY_ASSIGNMENT_MAP.find((a) => a.assignmentId === assignmentId);
}

export function buildPolicyPlayerViewModel(
  assignment: GeneratedPolicyAssignment,
): PolicyPlayerViewModel {
  const policy = getGeneratedPolicy(assignment.policyId) ?? null;
  const hasText = Boolean(
    policy && policy.fullTextAvailable && policy.sections.length > 0,
  );
  const unlocked = Boolean(
    policy && policy.policyRefStatus === "verified" && hasText,
  );

  let lockReason: string | null = null;
  if (!policy) {
    lockReason = `Policy ${assignment.policyId} was not found in the baked policy catalog.`;
  } else if (policy.policyRefStatus === "invalid") {
    lockReason = `Policy reference ${assignment.policyId} is marked invalid in the canonical source and cannot be presented as an official policy.`;
  } else if (policy.policyRefStatus === "needs_review") {
    lockReason = `Policy reference ${assignment.policyId} needs review before its text can be presented as verified.`;
  } else if (!hasText) {
    lockReason = `No baked policy text is available for ${assignment.policyId} yet.`;
  }

  let quiz: PolicyPlayerQuiz | null = null;
  if (assignment.quizRequired) {
    const bundle = getQuizBundle(assignment.courseId);
    if (bundle) {
      quiz = {
        bundleId: bundle.bundleId,
        courseId: bundle.courseId,
        title: bundle.title,
        passScore: bundle.passScore,
        maxAttempts: bundle.maxAttempts,
        questionCount: bundle.questionCount,
        bankStatus: bundle.bankStatus,
        note: bundle.note,
        policyIds: bundle.policyIds,
      };
    }
  }

  const relatedModules: PolicyPlayerRelatedModule[] =
    assignment.relatedModuleIds.map((id) => {
      const mod = getGeneratedModule(id);
      const player = getModulePlayerEntry(id);
      return {
        id,
        title: mod?.title ?? null,
        playerAvailable: player?.playerAvailable ?? false,
        launchRef: player?.launchRef ?? null,
        evidenceAppendix: mod?.evidenceAppendix ?? null,
      };
    });

  const relatedForms: PolicyPlayerRelatedFormGroup[] = [];
  const seenAppendixKeys = new Set<string>();
  for (const mod of relatedModules) {
    if (!mod.evidenceAppendix) continue;
    if (seenAppendixKeys.has(mod.evidenceAppendix)) {
      const existing = relatedForms.find(
        (g) => g.appendixKey === mod.evidenceAppendix,
      );
      if (existing && !existing.sourceModuleIds.includes(mod.id)) {
        existing.sourceModuleIds.push(mod.id);
      }
      continue;
    }
    const crosswalk = getAppendixCrosswalk(mod.evidenceAppendix);
    if (!crosswalk) continue;
    seenAppendixKeys.add(mod.evidenceAppendix);
    const forms = crosswalk.formIds
      .map((formId) => {
        const form = getAppendixForm(formId);
        return form ? { id: form.id, title: form.title, type: form.type } : null;
      })
      .filter((f): f is { id: string; title: string; type: string } => Boolean(f));
    relatedForms.push({
      appendixKey: crosswalk.appendixKey,
      label: crosswalk.label,
      classification: crosswalk.classification,
      note: crosswalk.note,
      sourceModuleIds: [mod.id],
      forms,
    });
  }

  return {
    assignmentId: assignment.assignmentId,
    pathway: assignment.pathway,
    policyId: assignment.policyId,
    policyTitle: assignment.policyTitle,
    courseId: assignment.courseId,
    courseTitle: assignment.courseTitle,
    assignmentType: assignment.assignmentType,
    tier: assignment.tier,
    required: assignment.required,
    awarenessReferenceOnly: assignment.awarenessReferenceOnly,
    quizRequired: assignment.quizRequired,
    attestationRequired: assignment.attestationRequired,
    initialDue: assignment.initialDue,
    recurrence: assignment.recurrence,
    releaseStatus: assignment.releaseStatus,
    releaseBlocked: assignment.blocked,
    inherited: assignment.inherited,
    scopeRationale: assignment.scopeRationale,
    internalSource: assignment.internalSource,
    externalAuthorityUrl: assignment.externalAuthorityUrl,
    sourceNotes: assignment.sourceNotes,
    policy,
    unlocked,
    lockReason,
    quiz,
    relatedModules,
    relatedForms,
  };
}
