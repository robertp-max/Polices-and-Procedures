// Canonical, source-backed policy journey expansion.
// This module defines requirements only; it never creates learner assignments or completions.

import {
  policyJourneyAssignmentSourceRows,
  policyJourneyCourseSourceRows,
  policyJourneyPathwaySourceRows,
  policyJourneyPolicySourceRows,
  policyJourneyReleaseBlockerSourceRows,
  policyJourneySourceManifest,
} from './policyJourney.source.generated';
import type {
  AssignmentKind,
  AssignmentKindRaw,
  ConditionalTriggerDimension,
  PolicyJourneyCourse,
  PolicyJourneyReleaseBlockerSourceRow,
  PolicyJourneyRequirement,
  PolicyJourneyRole,
  PolicyJourneyRoleCode,
  ReleaseState,
  ReleaseStatusRaw,
  ValidationModality,
  WorkbookPathway,
} from './policyJourney.types';

const PATHWAY_TO_ROLE: Readonly<Record<WorkbookPathway, PolicyJourneyRoleCode>> = {
  General: 'GEN',
  LVN: 'LVN',
  RN: 'RN',
  HHA: 'HHA',
  PT: 'PT',
  PTA: 'PTA',
  OT: 'OT',
  COTA: 'COTA',
  SLP: 'SLP',
  MSW: 'MSW',
  ADM: 'ADM',
  DON: 'DON',
  GB: 'GB',
};

const ROLE_TO_PATHWAY = Object.fromEntries(
  Object.entries(PATHWAY_TO_ROLE).map(([pathway, role]) => [role, pathway]),
) as Record<PolicyJourneyRoleCode, WorkbookPathway>;

export const POLICY_JOURNEY_ROLE_ORDER: readonly PolicyJourneyRoleCode[] = [
  'GEN', 'LVN', 'RN', 'HHA', 'PT', 'PTA', 'OT', 'COTA', 'SLP', 'MSW', 'ADM', 'DON', 'GB',
];

export const policyJourneySchedule = {
  generalOrientationMilestoneDay: 5,
  allInitialReadAttestQuizTargetDay: 14,
  roleValidationTargetDay: 30,
  onboardingCompletionNoLaterThanDay: 30,
  conditionalRule: 'Visible from pathway assignment; activate only when the documented trigger is true; complete before exposure and, when triggered during onboarding, no later than day 30.',
  heldRule: 'Visible in learner/admin reporting but unavailable until the release blocker is resolved.',
  recurrenceRule: 'Use each course recurrenceRaw value without reducing stricter agency cadence.',
} as const;

export const policyJourneyEvidenceContract = {
  mappingContainsLearnerState: false,
  requiredRuntimeEvidence: [
    'learnerId',
    'role',
    'sourceCourseId',
    'inheritedFromGeneral',
    'policyId',
    'policyVersionSnapshot',
    'policyEffectiveDateSnapshot',
    'assignmentDate',
    'readCompletedAt',
    'attestedAt',
    'quizBundleLabel',
    'quizAnswerSnapshot',
    'quizScore',
    'quizAttemptNumber',
    'remediationEvidence',
    'separateValidationEvidence',
    'completedAt',
  ],
  unsupportedClaims: [
    'quiz bank exists',
    'owner approval completed',
    'learner completed requirement',
    'held content is waived',
    'raw policy deadline is a verified legal deadline',
  ],
} as const;

function normalizeAssignmentKind(raw: AssignmentKindRaw): AssignmentKind {
  return raw === 'Core' ? 'core' : raw === 'Conditional' ? 'conditional' : 'hold';
}

function normalizeReleaseState(raw: ReleaseStatusRaw): ReleaseState {
  if (raw === 'Ready') return 'ready';
  if (raw === 'Conditional') return 'conditional';
  if (raw === 'Partial hold') return 'partial_hold';
  return 'hold';
}

const POLICY_TRIGGER_DIMENSIONS: Readonly<Record<string, readonly ConditionalTriggerDimension[]>> = {
  'CO-AI-101': ['ai_use'],
  'IT-UP-001': ['device_or_byod_use'],
  'IT-SA-001': ['ehr_use'],
  'CL-SD-009': ['telehealth_or_remote_monitoring_assignment', 'specialty_service_assignment'],
  'CL-SD-010': ['iv_or_infusion_assignment', 'service_line_assignment'],
  'CL-SD-011': ['wound_care_assignment', 'specialty_service_assignment'],
  'CL-SD-014': ['patient_or_condition_assignment'],
  'CL-SD-015': ['patient_or_condition_assignment'],
  'CL-SD-016': ['patient_or_condition_assignment'],
  'CL-SD-017': ['patient_or_condition_assignment'],
  'CL-SD-018': ['patient_or_condition_assignment'],
  'CL-SD-019': ['patient_or_condition_assignment'],
  'CL-SD-020': ['patient_or_condition_assignment'],
  'CL-SD-021': ['pediatric_population_assignment', 'patient_population_assignment'],
  'CL-SD-022': ['behavioral_health_assignment', 'patient_population_assignment'],
  'CL-SD-023': ['palliative_or_end_of_life_assignment', 'patient_population_assignment'],
  'CL-SD-024': ['patient_or_condition_assignment'],
  'CL-SD-025': ['patient_or_condition_assignment'],
  'RM-OS-004': ['heat_exposure'],
  'RM-PS-002': ['hazardous_materials_exposure'],
  'RM-PS-003': ['equipment_use'],
  'RM-PS-005': ['high_risk_medication_assignment'],
  'RM-SS-003': ['field_driving'],
  'OP-SL-003': ['field_driving'],
};

function courseTriggerDimensions(courseId: string, raw: string): readonly ConditionalTriggerDimension[] {
  if (raw === 'Pathway assignment') return ['pathway_assignment'];
  if (raw === 'Before assignment/use') return ['before_assignment_or_use', 'specialty_service_assignment'];
  if (raw.includes('Therapy-only assessment authorization')) {
    return ['therapy_only_assessment_authorization', 'specialty_service_assignment'];
  }
  if (raw.includes('specialty/patient-population assignment')) {
    return ['specialty_service_assignment', 'patient_population_assignment'];
  }
  void courseId;
  return ['needs_owner_configuration'];
}

function validationModalities(raw: string): readonly ValidationModality[] {
  const text = raw.toLowerCase();
  const values: ValidationModality[] = [];
  const add = (value: ValidationModality) => { if (!values.includes(value)) values.push(value); };
  if (text.includes('acknowledgment')) add('attestation');
  if (text.includes('direct observation') || text.includes('observed')) add('direct_observation');
  if (text.includes('return demonstration') || text.includes('hands-on')) add('return_demonstration');
  if (text.includes('supervised')) add('supervised_practice');
  if (text.includes('simulation')) add('simulation');
  if (text.includes('drill') || text.includes('exercise participation')) add('drill_or_exercise');
  if (text.includes('coding exercise')) add('coding_exercise');
  if (text.includes('interactive') || text.includes('q&a')) add('interactive_questions_and_answers');
  if (text.includes('case review') || text.includes('project/data review')) add('case_or_data_review');
  if (text.includes('skill') || text.includes('competency') || text.includes('tool demonstration')) add('skill_or_competency_validation');
  if (text.includes('12 hour') || text.includes('12-hour') || text.includes('track ≥12')) add('hours_tracking');
  if (text.includes('disclosure') || text.includes('completion of assessment')) add('disclosure_or_assessment');
  return values;
}

function blockerAppliesToCourse(
  blocker: PolicyJourneyReleaseBlockerSourceRow,
  courseId: string,
  sourcePathway: PolicyJourneyRoleCode,
  policyIds: readonly string[],
): boolean {
  if (blocker.scope === 'specific_courses') return blocker.affectedCourseIds.includes(courseId);
  if (blocker.scope === 'job_description_courses') {
    return policyIds.some((policyId) => policyId.startsWith('HR-JD-') || policyId.startsWith('MISSING-'));
  }
  if (blocker.scope === 'all_employee_pathways') return sourcePathway !== 'GB';
  if (blocker.scope === 'all_pathways') return true;
  return false;
}

const policySourceById = new Map(policyJourneyPolicySourceRows.map((policy) => [policy.policyId, policy]));
const assignmentRowsByCourse = new Map<string, typeof policyJourneyAssignmentSourceRows[number][]>();
for (const row of policyJourneyAssignmentSourceRows) {
  const rows = assignmentRowsByCourse.get(row[1]) ?? [];
  rows.push(row);
  assignmentRowsByCourse.set(row[1], rows);
}

export const policyJourneyCourses: readonly PolicyJourneyCourse[] = policyJourneyCourseSourceRows.map((source) => {
  const sourcePathway = PATHWAY_TO_ROLE[source.workbookPathway];
  const assignmentRows = assignmentRowsByCourse.get(source.courseId) ?? [];
  const policyIds = assignmentRows.map((row) => row[2]);
  const blockerIds = policyJourneyReleaseBlockerSourceRows
    .filter((blocker) => blockerAppliesToCourse(blocker, source.courseId, sourcePathway, policyIds))
    .map((blocker) => blocker.blockerId);
  const modalities = validationModalities(source.additionalValidationRaw);
  const releaseState = normalizeReleaseState(source.releaseStatusRaw);
  return {
    courseId: source.courseId,
    sourcePathway,
    title: source.title,
    policyRowCount: source.policyRowCount,
    assignmentModeRaw: source.assignmentModeRaw,
    activation: { raw: source.triggerRaw, dimensions: courseTriggerDimensions(source.courseId, source.triggerRaw) },
    schedule: {
      phase: sourcePathway === 'GEN' ? 'general_foundation' : sourcePathway === 'GB' ? 'governance_weeks_1_4' : 'role_weeks_1_4',
      initialDueRaw: source.initialDueRaw,
      recurrenceRaw: source.recurrenceRaw,
      generalOrientationMilestoneDay: source.courseId === 'G-01' ? 5 : null,
      readAttestQuizTargetDay: 14,
      validationTargetDay: 30,
      beforeIndependentDuty: true,
    },
    quiz: {
      bundleLabelRaw: source.quizBundleRaw,
      passScorePercent: Math.round(source.passScoreFraction * 100),
      requirementDefined: true,
      evidenceRequired: true,
      contentStatus: 'not_provided',
      questionCount: null,
      maxAttempts: null,
    },
    validation: {
      raw: source.additionalValidationRaw,
      modalities,
      separateEvidenceGateRequired: modalities.some((modality) => modality !== 'attestation'),
    },
    release: {
      raw: source.releaseStatusRaw,
      state: releaseState,
      sourceStatusRaw: source.sourceStatusRaw,
      publishableInWhole: releaseState === 'ready' || releaseState === 'conditional',
      blockerIds,
    },
    ownerApprovalRequirementRaw: source.ownerApprovalRequirementRaw,
    ownerApprovalStatus: 'not_evidenced',
    scopeRationaleRaw: source.scopeRationaleRaw,
    implementationNotesRaw: source.implementationNotesRaw,
    sourceNotesRaw: source.sourceNotesRaw,
    sourceRow: source.sourceRow,
  };
});

const courseById = new Map(policyJourneyCourses.map((course) => [course.courseId, course]));
const courseSourceById = new Map(policyJourneyCourseSourceRows.map((course) => [course.courseId, course]));

function buildDirectRequirement(row: typeof policyJourneyAssignmentSourceRows[number]): PolicyJourneyRequirement {
  const [workbookAssignmentRow, courseId, policyId, assignmentKindRaw, releaseStatusRaw] = row;
  const course = courseById.get(courseId);
  const courseSource = courseSourceById.get(courseId);
  const policy = policySourceById.get(policyId);
  if (!course || !courseSource || !policy) throw new Error(`Unresolved policy assignment: ${courseId} / ${policyId}`);
  const assignmentKind = normalizeAssignmentKind(assignmentKindRaw);
  const releaseState = normalizeReleaseState(releaseStatusRaw);
  const conditionDimensions = assignmentKind === 'conditional'
    ? (POLICY_TRIGGER_DIMENSIONS[policyId] ?? ['needs_owner_configuration'])
    : course.activation.dimensions;
  const publishable = releaseState === 'ready' || releaseState === 'conditional';
  return {
    requirementId: `PP:${course.sourcePathway}:${courseId}:${policyId}`,
    role: course.sourcePathway,
    inheritedFromGeneral: false,
    sourcePathway: course.sourcePathway,
    courseId,
    courseTitle: course.title,
    policyId,
    policyTitle: policy.title,
    policyVersion: policy.generatedMetadata.version,
    policyEffectiveDate: policy.generatedMetadata.effectiveDate,
    policySourceAvailability: policy.sourceAvailability,
    activityLaunch: {
      presentation: 'full_page_controlled_policy_activity',
      contentLocator: policy.contentLocator,
      controlledMetadataRequired: true,
      sectionNavigationRequired: true,
      readProgressRequired: true,
      bundledQuizRequired: true,
      attestationRequired: true,
    },
    assignmentKind,
    assignmentKindRaw,
    visibleInJourney: true,
    activation: {
      mode: assignmentKind === 'hold' || !publishable ? 'blocked' : assignmentKind === 'conditional' ? 'when_triggered' : 'automatic',
      dimensions: conditionDimensions,
      sourceText: [course.assignmentModeRaw, course.activation.raw, course.scopeRationaleRaw],
      beforeTriggerExposure: assignmentKind === 'conditional',
      ownerConfigurationRequired: conditionDimensions.includes('needs_owner_configuration'),
    },
    evidenceRequirements: {
      fullControlledPolicyRead: true,
      policyVersionSnapshot: true,
      attestation: true,
      scoredCourseQuiz: true,
      quizEvidence: true,
      quizBundleLabelRaw: course.quiz.bundleLabelRaw,
      quizContentStatus: 'not_provided',
      passScorePercent: course.quiz.passScorePercent,
      separateValidationGate: course.validation.separateEvidenceGateRequired,
      validationModalities: course.validation.modalities,
      validationRaw: course.validation.raw,
    },
    schedule: {
      initialDueRaw: course.schedule.initialDueRaw,
      recurrenceRaw: course.schedule.recurrenceRaw,
      readAttestQuizTargetDay: 14,
      validationTargetDay: 30,
      onboardingCompletionNoLaterThanDay: 30,
      beforeIndependentDuty: true,
      conditionalIfTriggeredDuringOnboarding: 'before_exposure_and_no_later_than_day_30',
      heldItemRule: 'visible_but_unavailable_until_release',
    },
    release: {
      raw: releaseStatusRaw,
      state: releaseState,
      publishable,
      blockerIds: publishable ? [] : course.release.blockerIds,
    },
    source: {
      workbookAssignmentRow,
      workbookCourseRow: course.sourceRow,
      internalSourceRaw: policy.internalSourceRaw,
      externalAuthorityUrlRaw: policy.externalAuthorityUrlRaw,
      sourceStatusRaw: course.release.sourceStatusRaw,
      sourceNotesRaw: course.sourceNotesRaw,
    },
  };
}

export const policyJourneyDirectRequirements: readonly PolicyJourneyRequirement[] =
  policyJourneyAssignmentSourceRows.map(buildDirectRequirement);

const directRequirementsByRole = new Map<PolicyJourneyRoleCode, PolicyJourneyRequirement[]>();
for (const role of POLICY_JOURNEY_ROLE_ORDER) directRequirementsByRole.set(role, []);
for (const requirement of policyJourneyDirectRequirements) {
  directRequirementsByRole.get(requirement.role)?.push(requirement);
}

const directCoursesByRole = new Map<PolicyJourneyRoleCode, PolicyJourneyCourse[]>();
for (const role of POLICY_JOURNEY_ROLE_ORDER) {
  directCoursesByRole.set(role, policyJourneyCourses.filter((course) => course.sourcePathway === role));
}

export const policyJourneysByRole: Readonly<Record<PolicyJourneyRoleCode, PolicyJourneyRole>> = Object.fromEntries(
  POLICY_JOURNEY_ROLE_ORDER.map((role) => {
    const pathway = ROLE_TO_PATHWAY[role];
    const summary = policyJourneyPathwaySourceRows.find((row) => row.workbookPathway === pathway);
    if (!summary) throw new Error(`Missing pathway summary for ${role}`);
    const generalInherited = role !== 'GEN' && role !== 'GB';
    const inheritedCourses = generalInherited ? (directCoursesByRole.get('GEN') ?? []) : [];
    const directCourses = directCoursesByRole.get(role) ?? [];
    const courses = [...inheritedCourses, ...directCourses];
    const inheritedRequirements = generalInherited
      ? (directRequirementsByRole.get('GEN') ?? []).map((requirement) => ({
          ...requirement,
          requirementId: `PP:${role}:${requirement.courseId}:${requirement.policyId}`,
          role,
          inheritedFromGeneral: true,
        }))
      : [];
    const requirements = [...inheritedRequirements, ...(directRequirementsByRole.get(role) ?? [])];
    return [role, {
      role,
      workbookPathway: pathway,
      generalInherited,
      courseIds: courses.map((course) => course.courseId),
      directCourseIds: directCourses.map((course) => course.courseId),
      inheritedGeneralCourseIds: inheritedCourses.map((course) => course.courseId),
      courses,
      requirements,
      expectedCourseCount: summary.recommendedCourseCount,
      expectedPolicyAssignmentCount: summary.expandedPolicyAssignmentCount,
      heldCourseCount: summary.coursesWithHoldCount,
    } satisfies PolicyJourneyRole];
  }),
) as unknown as Record<PolicyJourneyRoleCode, PolicyJourneyRole>;

export const policyJourneyExpandedRequirements: readonly PolicyJourneyRequirement[] =
  POLICY_JOURNEY_ROLE_ORDER.flatMap((role) => policyJourneysByRole[role].requirements);

export function getPolicyJourney(role: PolicyJourneyRoleCode): PolicyJourneyRole {
  return policyJourneysByRole[role];
}

export const policyJourneyReconciliation = {
  directAssignmentCount: policyJourneyDirectRequirements.length,
  expandedAssignmentCount: policyJourneyExpandedRequirements.length,
  sourceExpectedDirectAssignmentCount: policyJourneySourceManifest.directAssignmentCount,
  sourceExpectedExpandedAssignmentCount: policyJourneySourceManifest.expandedAssignmentCount,
  roleTotals: Object.fromEntries(POLICY_JOURNEY_ROLE_ORDER.map((role) => [role, {
    courseCount: policyJourneysByRole[role].courses.length,
    expectedCourseCount: policyJourneysByRole[role].expectedCourseCount,
    policyAssignmentCount: policyJourneysByRole[role].requirements.length,
    expectedPolicyAssignmentCount: policyJourneysByRole[role].expectedPolicyAssignmentCount,
  }])),
  missingGeneratedPolicyBodies: policyJourneyPolicySourceRows
    .filter((policy) => policy.sourceAvailability === 'missing')
    .map((policy) => policy.policyId),
  rawOnlyPolicyBodies: policyJourneyPolicySourceRows
    .filter((policy) => policy.sourceAvailability === 'raw_only')
    .map((policy) => policy.policyId),
  quizContentStatus: 'not_provided',
  ownerApprovalStatus: 'not_evidenced',
} as const;

