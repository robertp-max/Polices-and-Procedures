// Canonical policy-journey schema. Generated data contains no learner completion state.

export type PolicyJourneyRoleCode =
  | 'GEN'
  | 'LVN'
  | 'RN'
  | 'HHA'
  | 'PT'
  | 'PTA'
  | 'OT'
  | 'COTA'
  | 'SLP'
  | 'MSW'
  | 'ADM'
  | 'DON'
  | 'GB';

export type WorkbookPathway =
  | 'General'
  | Exclude<PolicyJourneyRoleCode, 'GEN'>;

export type AssignmentKindRaw = 'Core' | 'Conditional' | 'Hold';
export type AssignmentKind = 'core' | 'conditional' | 'hold';
export type ReleaseStatusRaw = 'Ready' | 'Conditional' | 'Partial hold' | 'Hold';
export type ReleaseState = 'ready' | 'conditional' | 'partial_hold' | 'hold';
export type SourceAvailability = 'generated_body' | 'raw_only' | 'missing';
export type BlockerScope =
  | 'specific_courses'
  | 'job_description_courses'
  | 'all_employee_pathways'
  | 'all_pathways'
  | 'unresolved_scope';

export type ConditionalTriggerDimension =
  | 'pathway_assignment'
  | 'before_assignment_or_use'
  | 'ai_use'
  | 'device_or_byod_use'
  | 'ehr_use'
  | 'patient_or_condition_assignment'
  | 'high_risk_medication_assignment'
  | 'telehealth_or_remote_monitoring_assignment'
  | 'iv_or_infusion_assignment'
  | 'wound_care_assignment'
  | 'pediatric_population_assignment'
  | 'behavioral_health_assignment'
  | 'palliative_or_end_of_life_assignment'
  | 'heat_exposure'
  | 'hazardous_materials_exposure'
  | 'equipment_use'
  | 'field_driving'
  | 'therapy_only_assessment_authorization'
  | 'specialty_service_assignment'
  | 'patient_population_assignment'
  | 'service_line_assignment'
  | 'needs_owner_configuration';

export type ValidationModality =
  | 'attestation'
  | 'direct_observation'
  | 'return_demonstration'
  | 'supervised_practice'
  | 'simulation'
  | 'drill_or_exercise'
  | 'coding_exercise'
  | 'interactive_questions_and_answers'
  | 'case_or_data_review'
  | 'skill_or_competency_validation'
  | 'hours_tracking'
  | 'disclosure_or_assessment';

export interface PolicyJourneyPathwaySourceRow {
  sourceRow: number;
  workbookPathway: WorkbookPathway;
  typeRaw: string;
  generalInheritedCourseCount: number;
  roleSpecificCourseCount: number;
  recommendedCourseCount: number;
  coursesWithHoldCount: number;
  deployableNowCount: number;
  previewTargetCount: number;
  variance: number;
  expandedPolicyAssignmentCount: number;
  notesRaw: string | null;
}

export interface PolicyJourneyCourseSourceRow {
  sourceRow: number;
  courseId: string;
  workbookPathway: WorkbookPathway;
  title: string;
  assignmentModeRaw: string;
  triggerRaw: string;
  initialDueRaw: string;
  recurrenceRaw: string;
  passScoreFraction: number;
  additionalValidationRaw: string;
  policyRowCount: number;
  sourceStatusRaw: string;
  releaseStatusRaw: ReleaseStatusRaw;
  ownerApprovalRequirementRaw: string;
  implementationNotesRaw: string | null;
  quizBundleRaw: string;
  scopeRationaleRaw: string;
  sourceNotesRaw: string | null;
}

export interface GeneratedPolicyMetadata {
  version: string | null;
  effectiveDate: string | null;
  status: string | null;
  owner: string | null;
  approvedBy: string | null;
}

export interface ControlledPolicyContentLocator {
  kind: 'generated_policy_record' | 'raw_policy_record' | 'unresolved';
  sourceFileRaw: string | null;
  lookupPolicyId: string;
  fullTextAvailable: boolean;
  sectionedContentAvailable: boolean;
}

export interface PolicyReviewSource {
  sourceRow: number;
  classificationRaw: string | null;
  statusRaw: string | null;
  ownerRaw: string | null;
  lmsDecisionRaw: string | null;
  sourceQualityRaw: string | null;
}

export interface PolicyRoleMatrixSource {
  sourceRow: number;
  general: string | null;
  LVN: string | null;
  RN: string | null;
  HHA: string | null;
  PT: string | null;
  PTA: string | null;
  OT: string | null;
  COTA: string | null;
  SLP: string | null;
  MSW: string | null;
  ADM: string | null;
  DON: string | null;
  GB: string | null;
  sourceStatusNoteRaw: string | null;
}

export interface PolicyJourneyPolicySourceRow {
  policyId: string;
  title: string;
  sourceAvailability: SourceAvailability;
  contentLocator: ControlledPolicyContentLocator;
  generatedMetadata: GeneratedPolicyMetadata;
  review: PolicyReviewSource | null;
  roleMatrix: PolicyRoleMatrixSource | null;
  internalSourceRaw: string | null;
  externalAuthorityUrlRaw: string | null;
}

export type PolicyJourneyAssignmentSourceTuple = readonly [
  sourceRow: number,
  courseId: string,
  policyId: string,
  assignmentKindRaw: AssignmentKindRaw,
  releaseStatusRaw: ReleaseStatusRaw,
];

export interface PolicyJourneyReleaseBlockerSourceRow {
  blockerId: string;
  sourceRow: number;
  severityRaw: string;
  issue: string;
  evidenceRaw: string;
  affectedCoursesRaw: string;
  affectedCourseIds: readonly string[];
  scope: BlockerScope;
  requiredActionRaw: string;
  ownerRaw: string;
  releaseAcceptanceRaw: string;
  authorityOrSourceRaw: string;
}

export interface PolicyJourneyCourse {
  courseId: string;
  sourcePathway: PolicyJourneyRoleCode;
  title: string;
  policyRowCount: number;
  assignmentModeRaw: string;
  activation: { raw: string; dimensions: readonly ConditionalTriggerDimension[] };
  schedule: {
    phase: 'general_foundation' | 'role_weeks_1_4' | 'governance_weeks_1_4';
    initialDueRaw: string;
    recurrenceRaw: string;
    generalOrientationMilestoneDay: 5 | null;
    readAttestQuizTargetDay: 14;
    validationTargetDay: 30;
    beforeIndependentDuty: true;
  };
  quiz: {
    bundleLabelRaw: string;
    passScorePercent: number;
    requirementDefined: true;
    evidenceRequired: true;
    contentStatus: 'not_provided';
    questionCount: null;
    maxAttempts: null;
  };
  validation: {
    raw: string;
    modalities: readonly ValidationModality[];
    separateEvidenceGateRequired: boolean;
  };
  release: {
    raw: ReleaseStatusRaw;
    state: ReleaseState;
    sourceStatusRaw: string;
    publishableInWhole: boolean;
    blockerIds: readonly string[];
  };
  ownerApprovalRequirementRaw: string;
  ownerApprovalStatus: 'not_evidenced';
  scopeRationaleRaw: string;
  implementationNotesRaw: string | null;
  sourceNotesRaw: string | null;
  sourceRow: number;
}

export interface PolicyJourneyRequirement {
  requirementId: string;
  role: PolicyJourneyRoleCode;
  inheritedFromGeneral: boolean;
  sourcePathway: PolicyJourneyRoleCode;
  courseId: string;
  courseTitle: string;
  policyId: string;
  policyTitle: string;
  policyVersion: string | null;
  policyEffectiveDate: string | null;
  policySourceAvailability: SourceAvailability;
  activityLaunch: {
    presentation: 'full_page_controlled_policy_activity';
    contentLocator: ControlledPolicyContentLocator;
    controlledMetadataRequired: true;
    sectionNavigationRequired: true;
    readProgressRequired: true;
    bundledQuizRequired: true;
    attestationRequired: true;
  };
  assignmentKind: AssignmentKind;
  assignmentKindRaw: AssignmentKindRaw;
  visibleInJourney: true;
  activation: {
    mode: 'automatic' | 'when_triggered' | 'blocked';
    dimensions: readonly ConditionalTriggerDimension[];
    sourceText: readonly string[];
    beforeTriggerExposure: boolean;
    ownerConfigurationRequired: boolean;
  };
  evidenceRequirements: {
    fullControlledPolicyRead: true;
    policyVersionSnapshot: true;
    attestation: true;
    scoredCourseQuiz: true;
    quizEvidence: true;
    quizBundleLabelRaw: string;
    quizContentStatus: 'not_provided';
    passScorePercent: number;
    separateValidationGate: boolean;
    validationModalities: readonly ValidationModality[];
    validationRaw: string;
  };
  schedule: {
    initialDueRaw: string;
    recurrenceRaw: string;
    readAttestQuizTargetDay: 14;
    validationTargetDay: 30;
    onboardingCompletionNoLaterThanDay: 30;
    beforeIndependentDuty: true;
    conditionalIfTriggeredDuringOnboarding: 'before_exposure_and_no_later_than_day_30';
    heldItemRule: 'visible_but_unavailable_until_release';
  };
  release: {
    raw: ReleaseStatusRaw;
    state: ReleaseState;
    publishable: boolean;
    blockerIds: readonly string[];
  };
  source: {
    workbookAssignmentRow: number;
    workbookCourseRow: number;
    internalSourceRaw: string | null;
    externalAuthorityUrlRaw: string | null;
    sourceStatusRaw: string;
    sourceNotesRaw: string | null;
  };
}

export interface PolicyJourneyRole {
  role: PolicyJourneyRoleCode;
  workbookPathway: WorkbookPathway;
  generalInherited: boolean;
  courseIds: readonly string[];
  directCourseIds: readonly string[];
  inheritedGeneralCourseIds: readonly string[];
  courses: readonly PolicyJourneyCourse[];
  requirements: readonly PolicyJourneyRequirement[];
  expectedCourseCount: number;
  expectedPolicyAssignmentCount: number;
  heldCourseCount: number;
}

