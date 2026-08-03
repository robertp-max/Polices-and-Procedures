/**
 * Governing Body curriculum and release-readiness registry.
 *
 * Generated from the supplied Governing Body Academy RC1 package and the
 * Policies and Procedures LMS Assignment Matrix reviewed 2026-07-20.
 * This file records source content and required completion gates. It is not
 * evidence that a learner completed, passed, attested, signed, or certified.
 *
 * Important: GB-001...GB-CAPSTONE are Academy module identifiers. GB-01...GB-13
 * are policy-bundle identifiers. The two namespaces must not be treated as a
 * one-to-one mapping without an approved crosswalk.
 */

export type GbAcademyModuleId =
  | 'GB-001'
  | 'GB-002'
  | 'GB-003'
  | 'GB-004'
  | 'GB-005'
  | 'GB-006'
  | 'GB-007'
  | 'GB-008'
  | 'GB-009'
  | 'GB-010'
  | 'GB-011'
  | 'GB-012'
  | 'GB-CAPSTONE';

export type GbPolicyBundleId =
  | 'GB-01'
  | 'GB-02'
  | 'GB-03'
  | 'GB-04'
  | 'GB-05'
  | 'GB-06'
  | 'GB-07'
  | 'GB-08'
  | 'GB-09'
  | 'GB-10'
  | 'GB-11'
  | 'GB-12'
  | 'GB-13';

export type GbReleaseState = 'blocked' | 'provisional';
export type GbSourcePosture = 'gated' | 'provisional';

export interface GbChapterMetadata {
  readonly sequence: number;
  readonly eyebrow: string;
  readonly title: string;
  readonly reasoningStages: ReadonlyArray<
    | 'Observe'
    | 'Interrogate'
    | 'Classify'
    | 'Decide'
    | 'Draft'
    | 'Defend'
    | 'Remediate'
  >;
}

export interface GbAssessmentProfile {
  readonly id: 'executive-case-standard' | 'gb-003-meeting-slice';
  readonly passPercent: 92;
  readonly zeroCriticalErrorsRequired: true;
  readonly oneShotTransferRequired: true;
  readonly answerOrderDeterministicShuffle: true;
  readonly dimensions: ReadonlyArray<{
    readonly name: string;
    readonly points: number;
  }>;
  readonly sourceImplementationPersistence: 'browser-local-only';
  readonly serverAttemptEnforcement: 'not_implemented';
  readonly completionEvidenceSupplied: false;
}

export interface GbAcademyModule {
  readonly id: GbAcademyModuleId;
  readonly sequence: number;
  readonly title: string;
  readonly shortTitle: string;
  readonly domain: string;
  readonly durationMinutes: {
    readonly minimum: number;
    readonly maximum: number;
  };
  readonly difficulty: 'Expert' | 'Capstone';
  readonly sourcePosture: GbSourcePosture;
  readonly postureLabel: string;
  readonly executableSourcePresent: true;
  readonly releaseState: GbReleaseState;
  readonly lede: string;
  readonly lesson: {
    readonly caseTitle: string | null;
    readonly caseDate: string | null;
    readonly decisiveDuty: string;
    readonly chapterProfile: 'executive-case-standard' | 'gb-003-meeting-slice';
    readonly visibleChapterCount: 6;
    readonly doctrineTitles: readonly string[];
  };
  readonly assessment: {
    readonly profile: 'executive-case-standard' | 'gb-003-meeting-slice';
    readonly evidenceArtifactCount: number;
    readonly findingOrDefectCount: number;
    readonly decisionCount: 4;
    readonly recordClauseCount: number;
    readonly requiredCorrectClauseCount: 5;
    readonly defenseQuestionCount: 3;
    readonly transferCheckCount: 1;
  };
  readonly remediation: {
    readonly decisiveDuty: string;
    readonly whyTrapWorked: string;
    readonly evidenceRepair: string;
    readonly transferRule: string;
  };
  readonly sourceAnchors: readonly string[];
  readonly achcCrosswalkIdentifiers: readonly string[];
}

export interface GbPolicyCompletionItem {
  readonly policyId: string;
  readonly title: string;
  readonly generatedBodyState:
    | 'present_unapproved'
    | 'missing_raw_body_present_identity_unreconciled';
  readonly controlledReadRequired: true;
  readonly identityBoundAttestationRequired: true;
  readonly completionEvidenceSupplied: false;
}

export interface GbPolicyCompletionBundle {
  readonly id: GbPolicyBundleId;
  readonly sequence: number;
  readonly title: string;
  readonly assignmentType: 'Core' | 'Hold';
  /** Matrix label only. It is not approval or integrated runtime readiness. */
  readonly matrixReleaseLabel: 'Ready' | 'Hold';
  readonly integratedCompletionState: 'blocked';
  readonly policies: readonly GbPolicyCompletionItem[];
  readonly quiz: {
    readonly required: true;
    readonly scope: 'course-level-bundle';
    readonly passPercent: 80;
    readonly workbookLabel: string;
    readonly approvedQuestionBankState: 'not_supplied';
    readonly identityBoundOutcomeEvidenceSupplied: false;
  };
  readonly separateValidations: ReadonlyArray<{
    readonly kind:
      | 'conflict-disclosure'
      | 'governance-self-assessment'
      | 'emergency-exercise-participation';
    readonly timing: string;
    readonly evidenceState: 'not_supplied';
  }>;
  readonly initialDue: string;
  readonly recurrence: string;
}

export const GB_CURRICULUM_METADATA = {
  roleCode: 'GB',
  sourceReviewDate: '2026-07-20',
  sourceContentState: 'all_13_academy_modules_have_executable_source',
  runtimeIntegrationState: 'not_asserted_by_this_registry',
  policyCompletionState: 'blocked',
  certificationState: 'locked',
  completionEvidenceSupplied: false,
  academyModuleCount: 13,
  policyBundleCount: 13,
  assignedPolicyCount: 42,
  generatedPolicyBodyCount: 41,
  rawOnlyUnreconciledPolicyCount: 1,
  durationMinutes: { minimum: 622, maximum: 844 },
  durationHoursRounded: { minimum: 10.4, maximum: 14.1 },
  identifierNamespaces: {
    academy: 'GB-001...GB-012 and GB-CAPSTONE',
    policyBundles: 'GB-01...GB-13',
    approvedOneToOneCrosswalkSupplied: false,
  },
  matrixLabelsAreApproval: false,
  learnerStatusMayBeDerivedFromThisFile: false,
} as const;

export const GB_LEARNING_STAGE_SEQUENCE = [
  'Observe',
  'Interrogate',
  'Classify',
  'Decide',
  'Draft',
  'Defend',
  'Remediate',
] as const;

export const GB_CHAPTER_PROFILES = {
  'executive-case-standard': [
    { sequence: 1, eyebrow: 'Brief', title: 'The decisive duty', reasoningStages: ['Observe'] },
    { sequence: 2, eyebrow: 'Doctrine', title: 'Build the control model', reasoningStages: ['Interrogate'] },
    { sequence: 3, eyebrow: 'Evidence', title: 'Interrogate the record', reasoningStages: ['Interrogate'] },
    { sequence: 4, eyebrow: 'Decide', title: 'Classify and direct', reasoningStages: ['Classify', 'Decide'] },
    { sequence: 5, eyebrow: 'Record', title: 'Create the directive', reasoningStages: ['Draft'] },
    { sequence: 6, eyebrow: 'Defend', title: 'Face the surveyor', reasoningStages: ['Defend', 'Remediate'] },
  ],
  'gb-003-meeting-slice': [
    { sequence: 1, eyebrow: 'Brief', title: 'The record is the proof', reasoningStages: ['Observe'] },
    { sequence: 2, eyebrow: 'Authority', title: 'Anatomy of valid action', reasoningStages: ['Interrogate'] },
    { sequence: 3, eyebrow: 'Packet', title: 'Interrogate the evidence', reasoningStages: ['Interrogate'] },
    { sequence: 4, eyebrow: 'Decide', title: 'Classify and direct', reasoningStages: ['Classify', 'Decide'] },
    { sequence: 5, eyebrow: 'Record', title: 'Draft defensible minutes', reasoningStages: ['Draft'] },
    { sequence: 6, eyebrow: 'Defend', title: 'Face the surveyor', reasoningStages: ['Defend', 'Remediate'] },
  ],
} as const satisfies Record<string, readonly GbChapterMetadata[]>;

export const GB_ASSESSMENT_PROFILES = {
  'executive-case-standard': {
    id: 'executive-case-standard',
    passPercent: 92,
    zeroCriticalErrorsRequired: true,
    oneShotTransferRequired: true,
    answerOrderDeterministicShuffle: true,
    dimensions: [
      { name: 'Evidence', points: 20 },
      { name: 'Analysis', points: 20 },
      { name: 'Decision', points: 25 },
      { name: 'Record', points: 20 },
      { name: 'Defense', points: 15 },
    ],
    sourceImplementationPersistence: 'browser-local-only',
    serverAttemptEnforcement: 'not_implemented',
    completionEvidenceSupplied: false,
  },
  'gb-003-meeting-slice': {
    id: 'gb-003-meeting-slice',
    passPercent: 92,
    zeroCriticalErrorsRequired: true,
    oneShotTransferRequired: true,
    answerOrderDeterministicShuffle: true,
    dimensions: [
      { name: 'Authority', points: 20 },
      { name: 'Risk', points: 15 },
      { name: 'Evidence', points: 20 },
      { name: 'Decision', points: 20 },
      { name: 'Record', points: 15 },
      { name: 'Defense', points: 10 },
    ],
    sourceImplementationPersistence: 'browser-local-only',
    serverAttemptEnforcement: 'not_implemented',
    completionEvidenceSupplied: false,
  },
} as const satisfies Record<string, GbAssessmentProfile>;

export const GB_ASSESSMENT_RELEASE_STANDARD = {
  implementedRc1Standard: {
    modulePassPercent: 92,
    capstonePassPercent: 92,
    zeroCriticalErrorsRequired: true,
    oneShotTransferRequired: true,
  },
  conflictingBlueprintStandard: {
    modulePassPercent: 90,
    capstonePassPercent: 92,
  },
  conflictResolutionState: 'unresolved',
  attemptPolicySpecifiedInBlueprint: {
    firstFailure: 'targeted remediation and a different isomorphic case',
    secondFailure: '24-hour hold and Chair/Compliance notification',
    thirdFailure: 'training hold and one-to-one review',
  },
  attemptPolicyEnforcedByRc1Source: false,
  certificateEligibleWithoutResolution: false,
} as const;

export const GB_ACADEMY_MODULES = [
  {
    id: 'GB-001',
    sequence: 1,
    title: 'The Authority That Cannot Disappear',
    shortTitle: 'Authority',
    domain: 'Legal accountability',
    durationMinutes: { minimum: 38, maximum: 52 },
    difficulty: 'Expert',
    sourcePosture: 'gated',
    postureLabel: 'Attestation gated',
    executableSourcePresent: true,
    releaseState: 'blocked',
    lede: 'Separate retained accountability from work that may be assigned, contracted, or operationally directed.',
    lesson: {
      caseTitle: 'The management agreement',
      caseDate: 'August 4, 2026 · Special session',
      decisiveDuty: 'The Governing Body may obtain help; it cannot contract away the accountability that defines it.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Retain accountability', 'Name the operator', 'Test the boundary', 'Do not confuse expertise with authority'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Accountability survives delegation.',
      whyTrapWorked: 'The agreement used competent people and polished reporting to make abdication look efficient.',
      evidenceRepair: 'Mark every decision right, oversight input, escalation trigger, and corrective power before approving the operating model.',
      transferRule: 'Change one contractual fact at a time; do not let expertise, price, or indemnity answer the authority question.',
    },
    sourceAnchors: ['42 CFR 484.105(a)–(c)', '42 CFR 484.65(e)', 'CMS Appendix B', 'GV-GB-001 · canonical identity reconciliation required', 'GV-OG-002', 'GV-OG-003 · canonical identity reconciliation required'],
    achcCrosswalkIdentifiers: ['HH1-1A', 'HH1-5A', 'HH1-5A.01', 'HH1-6B'],
  },
  {
    id: 'GB-002',
    sequence: 2,
    title: 'Structure, Bylaws, Membership & Orientation',
    shortTitle: 'Structure',
    domain: 'Board constitution',
    durationMinutes: { minimum: 42, maximum: 58 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Prove that the people exercising authority were validly seated, oriented, and consistently reported across every controlling record.',
    lesson: {
      caseTitle: 'The invisible board change',
      caseDate: 'September 10, 2026 · Organizational action',
      decisiveDuty: 'A board roster is not self-authenticating. Authority must reconcile to bylaws, appointments, orientation, minutes, organization records, and required reporting.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Constitute authority', 'Complete and evidence orientation', 'Reconcile every record', 'Report the change'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Prove the chain from legal instrument to person to action.',
      whyTrapWorked: 'The roster and polished biographies made an unappointed nominee look fully seated.',
      evidenceRepair: 'Reconcile seat authority, appointment, term, orientation, participation, and external reporting as separate proofs.',
      transferRule: 'Do not allow one valid document to cure a different missing element.',
    },
    sourceAnchors: ['42 CFR 484.105(a)', 'CDPH HHA Change of Governing Board packet (current HS 200 and HS 215A required as applicable)', 'GV-GB-001 · canonical identity reconciliation required'],
    achcCrosswalkIdentifiers: ['HH1-1A', 'HH1-1A.01', 'HH1-1B', 'HH1-2A', 'HH1-2A.03'],
  },
  {
    id: 'GB-003',
    sequence: 3,
    title: 'Meetings That Prove Governance',
    shortTitle: 'Meetings',
    domain: 'Decision evidence',
    durationMinutes: { minimum: 48, maximum: 65 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Convene valid meetings, repair defective actions, and produce minutes that withstand evidence-level scrutiny.',
    lesson: {
      caseTitle: null,
      caseDate: null,
      decisiveDuty: 'The official record cannot preserve an action that the supplied participation, notice, conflict, and evidence rules do not support.',
      chapterProfile: 'gb-003-meeting-slice',
      visibleChapterCount: 6,
      doctrineTitles: [],
    },
    assessment: { profile: 'gb-003-meeting-slice', evidenceArtifactCount: 11, findingOrDefectCount: 9, decisionCount: 4, recordClauseCount: 8, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Accuracy before ratification',
      whyTrapWorked: 'Each weak option solved one visible problem. Abstention addressed only the vote—not prior participation. Aggregate improvement addressed only one metric—not the approved subgroup guardrail.',
      evidenceRepair: 'Cross-source verification: reconcile agenda, bylaws, time-specific attendance, conflict trail, QAPI criteria, complaints, and draft minutes before directing a cure.',
      transferRule: 'Change one fact at a time. A clean conflict process does not cure a notice defect. Continuous remote audio does not cure an unmet QAPI effectiveness criterion.',
    },
    sourceAnchors: ['42 CFR 484.105', 'CMS Appendix B', 'GV-GB-002', 'GV-GB-003'],
    achcCrosswalkIdentifiers: ['HH1-2A', 'HH1-2A.03', 'HH1-4A.01'],
  },
  {
    id: 'GB-004',
    sequence: 4,
    title: 'Appoint, Oversee, Replace',
    shortTitle: 'Leadership',
    domain: 'Executive continuity',
    durationMinutes: { minimum: 40, maximum: 55 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Protect continuous qualified leadership when the ordinary succession plan fails at the worst possible moment.',
    lesson: {
      caseTitle: 'The empty chair',
      caseDate: 'October 6, 2026 · Survey entry conference',
      decisiveDuty: 'Continuity requires a qualified, authorized person—not a familiar name on an obsolete plan.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Appoint deliberately', 'Keep the alternate current', 'Separate roles', 'Correct in real time'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Continuity is a live governance control.',
      whyTrapWorked: 'A controlled document looked authoritative even though its qualification evidence had expired.',
      evidenceRepair: 'Verify the person, authority, scope, duration, role separation, and patient-risk coverage at activation time.',
      transferRule: 'A current name, credential, or email alone is never the whole authority chain.',
    },
    sourceAnchors: ['42 CFR 484.105(b)–(c)', 'CMS Appendix B', 'GV-OG-002', 'GV-GB-004 · canonical identity reconciliation required'],
    achcCrosswalkIdentifiers: ['HH1-5A', 'HH1-5A.01', 'HH1-6B'],
  },
  {
    id: 'GB-005',
    sequence: 5,
    title: 'QAPI as an Executive Duty',
    shortTitle: 'QAPI',
    domain: 'Quality governance',
    durationMinutes: { minimum: 55, maximum: 75 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Crosswalk validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Interrogate apparently favorable data, protect high-risk subgroups, and demand proof before closing improvement work.',
    lesson: {
      caseTitle: 'The green dashboard',
      caseDate: 'Q2 2026 · Quarterly QAPI review',
      decisiveDuty: 'Aggregate improvement cannot erase a known high-risk subgroup or replace the PIP’s approved effectiveness criteria.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Interrogate the denominator', 'Use approved criteria', 'Resource the program', 'Keep federal and agency rules distinct'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 8, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Govern the signal, not the color.',
      whyTrapWorked: 'The aggregate headline, premature celebration, and policy misstatement each offered a shortcut around the underlying evidence.',
      evidenceRepair: 'Rebuild the chain from population and subgroup to intervention, threshold, sustainability, resources, and Board direction.',
      transferRule: 'A favorable aggregate never answers whether every monitored high-risk stratum met its approved criterion.',
    },
    sourceAnchors: ['42 CFR 484.65', 'CMS Appendix B', '22 CCR 74742 · validation required', 'QA-PG-001', 'QA-PG-002', 'QA-PI-001', 'QA-AE-001', 'QA-AE-002', 'QA-AE-003', 'QA-AE-004'],
    achcCrosswalkIdentifiers: ['HH6-1A', 'HH6-1C', 'HH6-1D.01', 'HH6-3A.01', 'HH6-4A.02', 'HH6-4A.04', 'HH6-4A.05', 'HH6-4A.06', 'HH6-4A.07', 'HH6-5A', 'HH6-7A.01'],
  },
  {
    id: 'GB-006',
    sequence: 6,
    title: 'Compliance Independence & Escalation',
    shortTitle: 'Compliance',
    domain: 'Integrity oversight',
    durationMinutes: { minimum: 46, maximum: 62 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Protect independent investigation and patient interests when revenue, reputation, and executive influence converge.',
    lesson: {
      caseTitle: 'The protected producer',
      caseDate: 'November 13, 2026 · Privileged special session',
      decisiveDuty: 'The Governing Body protects independence, evidence, patients, and due process before it protects revenue or reputation.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Preserve independence', 'Protect first', 'Escalate by risk', 'Record restraint'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Independence is an operational condition, not an org-chart label.',
      whyTrapWorked: 'Revenue importance and executive seniority made interference sound like coordination.',
      evidenceRepair: 'Separate safeguarding, investigation, adjudication, disclosure, and discipline; assign a conflict-free owner to each.',
      transferRule: 'Protective action may be immediate without converting allegation into guilt.',
    },
    sourceAnchors: ['42 CFR 484.105(a)', '42 CFR 484.65(e)', 'CO-CP-001', 'CO-CP-002', 'CO-CP-004', 'CO-CP-005', 'CO-CP-006', 'CO-CP-007', 'CO-CP-008', 'CO-FA-001', 'CO-FA-002', 'CO-FA-003'],
    achcCrosswalkIdentifiers: ['HH2-9A.01', 'HH2-7A.01'],
  },
  {
    id: 'GB-007',
    sequence: 7,
    title: 'Fiscal Stewardship Under Regulatory Risk',
    shortTitle: 'Fiscal stewardship',
    domain: 'Budget and viability',
    durationMinutes: { minimum: 44, maximum: 60 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Make financially viable choices without starving mandatory quality, compliance, or patient-safety controls.',
    lesson: {
      caseTitle: 'The savings plan',
      caseDate: 'December 8, 2026 · Annual budget adoption',
      decisiveDuty: 'A balanced spreadsheet is not a defensible budget if it disables the controls needed to deliver lawful, safe care.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Fund the duty', 'Read the driver', 'Model the consequence', 'Monitor the remedy'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Fiscal stewardship includes control adequacy.',
      whyTrapWorked: 'The deepest cut appeared decisive but quietly increased denial, compliance, and patient-safety exposure.',
      evidenceRepair: 'Trace each dollar decision to the operational driver, duty affected, mitigation, metric, trigger, and owner.',
      transferRule: 'Savings are not real when they merely move cost into denials, harm, repayment, or enforcement.',
    },
    sourceAnchors: ['42 CFR 484.105(a)', '42 CFR 484.105(h)', '42 CFR 484.65(e)', 'FN-FP-005', 'FN-FP-007', 'QA-PG-001', 'QA-PG-002', 'CO-CP-002', 'CO-CP-007'],
    achcCrosswalkIdentifiers: ['HH3-1A', 'HH3-1B', 'HH3-1C'],
  },
  {
    id: 'GB-008',
    sequence: 8,
    title: 'Strategy, Scope & Policy Authority',
    shortTitle: 'Strategy & policy',
    domain: 'Controlled direction',
    durationMinutes: { minimum: 42, maximum: 58 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Distinguish editorial change from substantive governance and prevent mixed-version approval from becoming policy fiction.',
    lesson: {
      caseTitle: 'The “minor” revision',
      caseDate: 'January 19, 2027 · Consent calendar',
      decisiveDuty: 'Substance is determined by operational effect—not by the label placed on a revision.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Classify effect', 'Control the version', 'Test implementation', 'Record the authority'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'The approval object must be exact.',
      whyTrapWorked: 'A clean PDF, a “minor” label, and a consent agenda concealed changes in legal and operational effect.',
      evidenceRepair: 'Identify the canonical version, classify each effect, trace implementation dependencies, and state the approval object verbatim.',
      transferRule: 'Do not infer substance from file name, page count, author confidence, or agenda placement.',
    },
    sourceAnchors: ['42 CFR 484.105(a)', '42 CFR 484.105(i)', 'CMS QSO-26-13-HHA (July 15, 2026) · G990/G992', 'GV-PM-001', 'EN-LC-001', 'GV-OG-005 · scope-policy identity reconciliation required'],
    achcCrosswalkIdentifiers: ['HH1-1A.01'],
  },
  {
    id: 'GB-009',
    sequence: 9,
    title: 'Enterprise Risk, Incidents & Emergency Governance',
    shortTitle: 'Enterprise risk',
    domain: 'Compound-event command',
    durationMinutes: { minimum: 50, maximum: 68 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Govern patient safety, continuity, privacy, claims, and public communication as one compound event without collapsing their separate decision paths.',
    lesson: {
      caseTitle: 'The forty-seven minutes',
      caseDate: 'February 3, 2027 · Emergency briefing',
      decisiveDuty: 'One event can activate several governance duties; one improvised response cannot satisfy them all.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Stabilize care', 'Preserve evidence', 'Route each duty', 'Govern recurrence'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'One event, multiple controlled responses.',
      whyTrapWorked: 'Patient stabilization made the event look complete while other obligations and recurrence signals remained open.',
      evidenceRepair: 'Create one master timeline, then branch every triggered duty to its owner, clock, evidence, decision, and closure criterion.',
      transferRule: 'Do not let one successful outcome erase a failed process or a separate legal duty.',
    },
    sourceAnchors: ['42 CFR 484.65', '42 CFR 484.102', '42 CFR 484.110', 'RM-ER-001', 'RM-EP-001', 'QA-AE-001', 'QA-AE-002', 'QA-AE-003', 'QA-AE-004', 'CO-DC-003', 'CO-HP-101', 'CO-IR-101', 'GV-EA-002 · communications-policy identity validation required'],
    achcCrosswalkIdentifiers: ['HH2-4A', 'HH6-4A.02', 'HH6-4A.05', 'HH7-2A.01', 'HH7-2B.01', 'HH7-3A', 'HH7-3B', 'HH7-3C', 'HH7-3D', 'HH7-3E'],
  },
  {
    id: 'GB-010',
    sequence: 10,
    title: 'Contracts, Referrals & External Arrangements',
    shortTitle: 'External arrangements',
    domain: 'Third-party governance',
    durationMinutes: { minimum: 46, maximum: 64 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Recognize when a small-dollar arrangement is materially large because it touches patients, PHI, clinical workflow, and referrals.',
    lesson: {
      caseTitle: 'Under the threshold',
      caseDate: 'March 15, 2027 · Contract approval',
      decisiveDuty: 'Under the supplied case rule, patient, PHI, clinical, and referral effects trigger review independently of price; the agency’s canonical below-threshold review rule remains provisional.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Map the arrangement', 'Test fair value and purpose', 'Protect care and data', 'Monitor after signature'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Assess total material effect.',
      whyTrapWorked: 'A low price and polished demo narrowed attention to procurement while referral, PHI, and clinical risks remained.',
      evidenceRepair: 'Map every flow of money, data, patients, decisions, referrals, subcontracting, monitoring, and exit before classifying the arrangement.',
      transferRule: 'Dollar thresholds do not override independent material-risk triggers.',
    },
    sourceAnchors: ['42 CFR 484.105(e)', 'GV-EA-001', 'CO-FA-001', 'CO-HP-005', 'CO-BA-101'],
    achcCrosswalkIdentifiers: ['HH1-10A', 'HH1-4A.01', 'HH2-5C.01'],
  },
  {
    id: 'GB-011',
    sequence: 11,
    title: 'Survey, Enforcement & Closure Decisions',
    shortTitle: 'Survey & enforcement',
    domain: 'Regulatory defense',
    durationMinutes: { minimum: 52, maximum: 72 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Crosswalk validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Answer precisely, produce contemporaneous evidence, correct inaccuracies, and control time-sensitive licensing or closure actions.',
    lesson: {
      caseTitle: 'The answer that outran the record',
      caseDate: 'April 21, 2027 · Survey day two',
      decisiveDuty: 'A defensible survey response is accurate, bounded, evidenced, and corrected when new facts change it.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Answer the question asked', 'Produce the chain', 'Correct promptly', 'Control the clock'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Accuracy beats confidence.',
      whyTrapWorked: 'A categorical answer and polished talking points arrived before evidence reconciliation.',
      evidenceRepair: 'For every survey answer, mark verified fact, source, limit, owner, and any correction duty before speaking.',
      transferRule: 'A corrected answer is stronger than a confidently repeated inaccuracy.',
    },
    sourceAnchors: ['CMS Appendix B', 'CO-RA-001–007', 'GV-EA-004', 'GV-EA-005', 'CDPH HHA board-change packet'],
    achcCrosswalkIdentifiers: ['HH1-1A', 'HH1-1A.01', 'HH1-1B', 'HH1-12A.01'],
  },
  {
    id: 'GB-012',
    sequence: 12,
    title: 'Conflicts, Ethics & Governance Improvement',
    shortTitle: 'Conflicts & ethics',
    domain: 'Board integrity',
    durationMinutes: { minimum: 44, maximum: 60 },
    difficulty: 'Expert',
    sourcePosture: 'provisional',
    postureLabel: 'Policy validation',
    executableSourcePresent: true,
    releaseState: 'provisional',
    lede: 'Detect indirect conflicts, repair contaminated deliberation, and convert self-assessment into measurable governance improvement.',
    lesson: {
      caseTitle: 'The conflict nobody owned',
      caseDate: 'May 18, 2027 · Annual self-assessment',
      decisiveDuty: 'A conflict can be indirect, noncash, and still contaminate information access, deliberation, and public trust.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Disclose broadly', 'Manage the process', 'Repair contamination', 'Improve the Board'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 7, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Manage influence, not just money.',
      whyTrapWorked: 'An indirect relationship and a respected member made the conflict easy to rationalize as immaterial.',
      evidenceRepair: 'Map interest, information, influence, deliberation, vote, record, underlying action, and control improvement separately.',
      transferRule: 'A late disclosure reveals a problem; it does not retroactively cure contaminated process.',
    },
    sourceAnchors: ['GV-GB-003', 'GV-GB-005', 'CO-CP-004'],
    achcCrosswalkIdentifiers: ['HH1-4A.01', 'HH2-7A.01'],
  },
  {
    id: 'GB-CAPSTONE',
    sequence: 13,
    title: 'The Governance Record Under Pressure',
    shortTitle: 'Capstone',
    domain: 'Integrated command',
    durationMinutes: { minimum: 75, maximum: 95 },
    difficulty: 'Capstone',
    sourcePosture: 'gated',
    postureLabel: 'Certification gated',
    executableSourcePresent: true,
    releaseState: 'blocked',
    lede: 'Defend two interlocked cases where authority, QAPI, fiscal pressure, conflict, survey evidence, and patient risk collide.',
    lesson: {
      caseTitle: 'The clean packet',
      caseDate: 'June 24, 2027 · Annual governance review',
      decisiveDuty: 'Executive governance is the ability to reconstruct truth across systems, then make a lawful, patient-protective, evidence-backed decision under pressure.',
      chapterProfile: 'executive-case-standard',
      visibleChapterCount: 6,
      doctrineTitles: ['Reconstruct authority', 'Interrogate performance', 'Protect the record', 'Direct the enterprise'],
    },
    assessment: { profile: 'executive-case-standard', evidenceArtifactCount: 8, findingOrDefectCount: 6, decisionCount: 4, recordClauseCount: 7, requiredCorrectClauseCount: 5, defenseQuestionCount: 3, transferCheckCount: 1 },
    remediation: {
      decisiveDuty: 'Integrate without collapsing distinctions.',
      whyTrapWorked: 'Every individual artifact looked plausible; only cross-system reconciliation exposed the shared defects.',
      evidenceRepair: 'Build one timeline and decision ledger linking person, authority, evidence, risk, decision, record, implementation, monitoring, and correction.',
      transferRule: 'Resolve each defect on its own facts, then test how its remedy changes dependent decisions.',
    },
    sourceAnchors: ['42 CFR 484.65', '42 CFR 484.105', 'CMS Appendix B', 'GB policy set · canonical identity reconciliation required for certification'],
    achcCrosswalkIdentifiers: ['HH1-1A', 'HH1-2A', 'HH1-4A.01', 'HH1-5A.01', 'HH1-10A', 'HH1-12A.01', 'HH2-5C.01', 'HH2-7A.01', 'HH2-9A.01', 'HH3-1A', 'HH3-1B', 'HH3-1C', 'HH6-1A', 'HH6-1C', 'HH6-1D.01', 'HH6-3A.01', 'HH6-4A.02', 'HH6-4A.04', 'HH6-4A.05', 'HH6-4A.06', 'HH6-4A.07', 'HH6-5A', 'HH6-7A.01'],
  },
] as const satisfies readonly GbAcademyModule[];

const policyItem = (
  policyId: string,
  title: string,
  generatedBodyState: GbPolicyCompletionItem['generatedBodyState'] = 'present_unapproved',
): GbPolicyCompletionItem => ({
  policyId,
  title,
  generatedBodyState,
  controlledReadRequired: true,
  identityBoundAttestationRequired: true,
  completionEvidenceSupplied: false,
});

export const GB_POLICY_COMPLETION_BUNDLES = [
  {
    id: 'GB-01', sequence: 1, title: 'Governing Body Authority & Responsibilities', assignmentType: 'Hold', matrixReleaseLabel: 'Hold', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-GB-001', 'Governing Body Authority & Responsibilities', 'missing_raw_body_present_identity_unreconciled')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% governance scenario quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'Before voting/acting independently', recurrence: 'At hire; then on material revision',
  },
  {
    id: 'GB-02', sequence: 2, title: 'Board Meetings, Minutes & Evidence', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-GB-002', 'Board Meeting & Minutes Requirements')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'At hire; then on material revision',
  },
  {
    id: 'GB-03', sequence: 3, title: 'Conflict of Interest, Ethics & Referral Integrity', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-GB-003', 'Conflict of Interest Disclosure'), policyItem('CO-CP-004', 'Code of Conduct & Ethics'), policyItem('CO-FA-001', 'Anti-Kickback & Stark Law Compliance')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% scenario quiz + disclosure', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [{ kind: 'conflict-disclosure', timing: 'Initial + annual disclosure', evidenceState: 'not_supplied' }], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'Initial + annual disclosure',
  },
  {
    id: 'GB-04', sequence: 4, title: 'Succession Planning & Delegation', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-GB-004', 'Succession Planning for Key Leadership'), policyItem('GV-OG-005', 'Delegation of Authority')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% continuity scenario quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'At hire; then on material revision',
  },
  {
    id: 'GB-05', sequence: 5, title: 'Annual Governance Self-Assessment', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-GB-005', 'Annual Governance Self-Assessment')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: 'Completion of assessment + knowledge check', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [{ kind: 'governance-self-assessment', timing: 'Initial + annual', evidenceState: 'not_supplied' }], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'Initial + annual',
  },
  {
    id: 'GB-06', sequence: 6, title: 'Organization, Administrator & Scope of Services', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-OG-001', 'Organizational Structure & Reporting'), policyItem('GV-OG-002', 'Administrator Qualifications & Responsibilities'), policyItem('GV-OG-003', 'Scope of Services Definition'), policyItem('HR-JD-001', 'Administrator — Job Description')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% accountability quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'At hire; then on material revision',
  },
  {
    id: 'GB-07', sequence: 7, title: 'Strategic Planning & Annual Goals', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-OG-004', 'Strategic Planning & Annual Goals')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% planning/governance quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'Initial + annual planning cycle',
  },
  {
    id: 'GB-08', sequence: 8, title: 'Policy Approval, Review & Staff Attestation Governance', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-PM-001', 'Policy Development & Approval Process'), policyItem('GV-PM-002', 'Policy Review & Revision Cycle'), policyItem('GV-PM-003', 'Policy Acknowledgment & Staff Attestation')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% policy-governance quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'At hire; then on material revision',
  },
  {
    id: 'GB-09', sequence: 9, title: 'Compliance, Reporting, Privacy & Oversight', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('CO-CP-001', 'Corporate Compliance Program'), policyItem('CO-CP-002', 'Compliance Officer Designation & Authority'), policyItem('CO-CP-003', 'Compliance Committee Structure & Function'), policyItem('CO-CP-005', 'Whistleblower Protection & Non-Retaliation'), policyItem('CO-CP-008', 'Compliance Training & Education'), policyItem('CO-FW-101', 'Fraud, Waste & Abuse Prevention'), policyItem('CO-HP-101', 'HIPAA, CMIA & Sensitive Data Privacy Management'), policyItem('IT-UP-004', 'Security Awareness Training')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% oversight scenario quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'Initial + annual',
  },
  {
    id: 'GB-10', sequence: 10, title: 'QAPI Governance & Performance Improvement', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('QA-PG-001', 'QAPI Program Establishment & Governance'), policyItem('QA-PG-002', 'QAPI Plan Development & Annual Review'), policyItem('QA-PG-003', 'QAPI Committee Structure & Meeting Requirements'), policyItem('QA-PI-001', 'Performance Improvement Project Management'), policyItem('QA-PI-002', 'Quality Indicator Monitoring & Reporting'), policyItem('QA-PI-004', 'Data-Driven Decision Making')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% QAPI governance quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'Initial + annual QAPI review',
  },
  {
    id: 'GB-11', sequence: 11, title: 'Financial Stewardship & Overpayment Controls', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('FN-FP-005', 'Annual Budget & Financial Planning'), policyItem('FN-FP-007', 'Financial Compliance & Fraud Monitoring Controls'), policyItem('FN-BC-004', 'Overpayment Identification & Refund')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% fiduciary scenario quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'At hire; then on material revision',
  },
  {
    id: 'GB-12', sequence: 12, title: 'Emergency Preparedness & Enterprise Risk Oversight', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('RM-EP-001', 'Emergency Preparedness Program'), policyItem('RM-EP-002', 'Emergency Preparedness Training & Testing Program'), policyItem('RM-ER-001', 'Enterprise Risk Management Program'), policyItem('RM-ER-003', 'Risk Assessment & Prioritization')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% risk/continuity quiz + exercise participation as assigned', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [{ kind: 'emergency-exercise-participation', timing: 'As assigned', evidenceState: 'not_supplied' }], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'Initial + annual agency governance review',
  },
  {
    id: 'GB-13', sequence: 13, title: 'Licensure, Certification, Closure & Change of Ownership', assignmentType: 'Core', matrixReleaseLabel: 'Ready', integratedCompletionState: 'blocked',
    policies: [policyItem('GV-EA-004', 'Agency Licensure & Certification Maintenance'), policyItem('GV-EA-005', 'Agency Closure or Change of Ownership'), policyItem('CO-RA-004', 'Medicare Conditions of Participation Compliance'), policyItem('CO-RA-005', 'State Licensure & Regulatory Compliance'), policyItem('CO-RA-006', 'Accreditation Standards Compliance')],
    quiz: { required: true, scope: 'course-level-bundle', passPercent: 80, workbookLabel: '80% governance decision quiz', approvedQuestionBankState: 'not_supplied', identityBoundOutcomeEvidenceSupplied: false },
    separateValidations: [], initialDue: 'By day 14; before independent duty if earlier', recurrence: 'At hire; then on material revision',
  },
] as const satisfies readonly GbPolicyCompletionBundle[];

export const GB_THIRTY_DAY_JOURNEY_CONTRACT = {
  pathway: {
    standaloneGovernanceTrack: true,
    inheritsGeneralCourses: false,
    prerequisiteAfterGeneralOrGao: false,
    dualRoleEmployee: 'Assign the employee General pathway separately; do not imply inheritance into GB.',
  },
  requiredCompletionDenominator: {
    academyModules: 13,
    policyCompletionItems: 42,
    policyBundleQuizOutcomes: 13,
    separateValidationOutcomes: 3,
    policyCompletionItemDefinition: 'Controlled policy read plus identity-bound attestation; neither event alone completes the item.',
    quizDefinition: 'Identity-bound course-bundle outcome at or above the approved 80% standard.',
    allCategoriesMustPass: true,
  },
  gates: [
    {
      checkpoint: 'Before first vote or independent Governing Body action',
      requirement: 'GB-01 controlled read, identity-bound attestation, approved bundled quiz, and reconciled GV-GB-001 source.',
      currentState: 'blocked',
    },
    {
      checkpoint: 'Day 14 or before an independent duty if earlier',
      requirement: 'All 42 assigned policies completed as first-class items, all 13 policy-bundle quizzes passed, and assigned separate validations completed.',
      currentState: 'blocked',
    },
    {
      checkpoint: 'Within the 30-day journey',
      requirement: 'Twelve Academy modules plus the integrated capstone satisfy the approved mastery, critical-error, transfer, and attempt-control standard.',
      currentState: 'blocked',
    },
    {
      checkpoint: 'Certificate issue',
      requirement: 'Every denominator item passed, all holds cleared, canonical policy/crosswalk approval recorded, and immutable evidence committed.',
      currentState: 'blocked',
    },
  ],
  evidence: {
    primaryDestination: 'governance_file',
    dualRoleEmployeeProjection: 'personnel_file_projection_only_if_required',
    oneImmutableOutcomeRecordPerEvent: true,
    identityBound: true,
    suppliedLearnerEvidenceCount: 0,
  },
  certificateLocked: true,
} as const;

export const GB_SOURCE_AND_RELEASE_GAPS = [
  {
    id: 'GB-GAP-001',
    severity: 'release-blocking',
    finding: 'The host onboarding architecture has no canonical GB role/module registry; GB-* identifiers remain package-level identifiers.',
    effect: 'Do not infer production assignment or completion state from source availability.',
    sourceRefs: ['ONBOARDINGARCH.MD', 'governing-body-lms/src/academyData.ts'],
  },
  {
    id: 'GB-GAP-002',
    severity: 'release-blocking',
    finding: 'Academy IDs GB-001...GB-CAPSTONE and policy-bundle IDs GB-01...GB-13 are different namespaces with no approved one-to-one crosswalk.',
    effect: 'Keep both registries distinct until an approved crosswalk is supplied.',
    sourceRefs: ['GOVERNING_BODY_ACADEMY_PREMIUM_RC1.zip', 'Policies_and_Procedures_LMS_Assignment_Matrix.xlsx'],
  },
  {
    id: 'GB-GAP-003',
    severity: 'release-blocking',
    finding: 'GV-GB-001 is absent from the generated policy library. A raw body exists, but its identity/version metadata conflicts with other supplied sources.',
    effect: 'GB-01 stays on hold; no independent vote/action release.',
    sourceRefs: ['project_sources/07-ALL_POLICIES.md', 'project_sources/12-allPoliciesContent.generated.ts', 'upload/Policies_and_Procedures_LMS_Assignment_Matrix.xlsx'],
  },
  {
    id: 'GB-GAP-004',
    severity: 'release-blocking',
    finding: 'No approved P&P quiz bank or identity-bound quiz outcome evidence was supplied for any of the 13 bundles.',
    effect: 'All 42 policy completion items remain incomplete even when a policy body is present.',
    sourceRefs: ['Policies_and_Procedures_LMS_Assignment_Matrix.xlsx', 'ONBOARDINGARCH.MD'],
  },
  {
    id: 'GB-GAP-005',
    severity: 'release-blocking',
    finding: 'Controlled-read, identity-bound attestation, governance-file write, and immutable completion-evidence services are not evidenced as connected.',
    effect: 'Do not issue completion, attestation, or certificate claims.',
    sourceRefs: ['ONBOARDINGARCH.MD', 'Pasted markdown(31).md'],
  },
  {
    id: 'GB-GAP-006',
    severity: 'release-blocking',
    finding: 'RC1 saves Academy attempts in browser local storage; the blueprint hold/escalation policy is not server-enforced.',
    effect: 'Attempt counts, 24-hour holds, notifications, and one-to-one review cannot be treated as authoritative.',
    sourceRefs: ['governing-body-lms/src/ExecutiveModule.tsx', 'GOVERNING_BODY_LMS_MASTER_BLUEPRINT_v1.md'],
  },
  {
    id: 'GB-GAP-007',
    severity: 'approval-blocking',
    finding: 'RC1 implements 92% for every module, while the blueprint also states 90% for modules and 92% for the capstone.',
    effect: 'Resolve the mastery rule before production scoring or certificate eligibility.',
    sourceRefs: ['governing-body-lms/src/ExecutiveModule.tsx', 'GOVERNING_BODY_LMS_MASTER_BLUEPRINT_v1.md'],
  },
  {
    id: 'GB-GAP-008',
    severity: 'approval-blocking',
    finding: 'GV-GB-002 through GV-GB-005 and GV-OG-003 through GV-OG-005 have identity or semantic conflicts across supplied policy/crosswalk sources.',
    effect: 'Policy-linked scoring stays provisional.',
    sourceRefs: ['governing-body-lms/POLICY_AND_RELEASE_GATE_REPORT.md', '13-policy_hh_section_map.csv', '11-corridorAlignment.generated.ts'],
  },
  {
    id: 'GB-GAP-009',
    severity: 'approval-blocking',
    finding: 'RM-EP-001 title/content identity is inconsistent across supplied sources.',
    effect: 'GB-12 cannot receive final policy approval from this evidence set.',
    sourceRefs: ['project_sources/12-allPoliciesContent.generated.ts', 'upload/Policies_and_Procedures_LMS_Assignment_Matrix.xlsx'],
  },
  {
    id: 'GB-GAP-010',
    severity: 'approval-blocking',
    finding: 'The licensed ACHC edition and final requirement text were not frozen or reconciled; generated HIGH-confidence mappings are not approval.',
    effect: 'ACHC identifiers remain crosswalk references, not compliance claims.',
    sourceRefs: ['project_sources/10-CA-ACHC-HH-PP-12-2025.docx.md', 'project_sources/13-policy_hh_section_map.csv'],
  },
  {
    id: 'GB-GAP-011',
    severity: 'approval-blocking',
    finding: '22 CCR 74742 requires legal/policy validation in the QAPI module source.',
    effect: 'GB-005 remains crosswalk-provisional.',
    sourceRefs: ['governing-body-lms/src/academyData.ts'],
  },
  {
    id: 'GB-GAP-012',
    severity: 'approval-blocking',
    finding: 'Some supplied policy text attributes a two-active-PIP rule to a federal minimum; the Academy itself flags the distinction.',
    effect: 'Correct the canonical policy statement before using it for scored instruction.',
    sourceRefs: ['governing-body-lms/src/academyData.ts', 'POLICY_AND_RELEASE_GATE_REPORT.md'],
  },
  {
    id: 'GB-GAP-013',
    severity: 'approval-blocking',
    finding: 'GB-003 meeting/minutes policy reconciliation and GB-011 survey/enforcement chain validation remain open.',
    effect: 'Both modules stay provisional and cannot support compliance certification.',
    sourceRefs: ['governing-body-lms/POLICY_AND_RELEASE_GATE_REPORT.md'],
  },
  {
    id: 'GB-GAP-014',
    severity: 'architecture-blocking',
    finding: 'The policy quiz model conflicts across sources: ONBOARDINGARCH proposes per-policy ten-question quizzes with 80% and three attempts; the workbook specifies course-level bundled quizzes.',
    effect: 'Do not choose or silently combine the models without an approved rule.',
    sourceRefs: ['ONBOARDINGARCH.MD', 'Policies_and_Procedures_LMS_Assignment_Matrix.xlsx'],
  },
  {
    id: 'GB-GAP-015',
    severity: 'architecture-blocking',
    finding: 'The host aggregate is marked ready, but the shared host timeline, clearance chain, and GB pathway summary still place GAO before role training; the workbook defines a standalone GB pathway with zero inherited General courses.',
    effect: 'Do not apply the shared GAO prerequisite to GB; assign General separately only for a dual-role employee.',
    sourceRefs: ['app/data.ts', 'Policies_and_Procedures_LMS_Assignment_Matrix.xlsx'],
  },
  {
    id: 'GB-GAP-016',
    severity: 'evidence-blocking',
    finding: 'No learner completion, assessment, attestation, signature, notification, governance-file, or certificate evidence was supplied.',
    effect: 'All learner status fields must begin unknown/incomplete; no completion can be backfilled.',
    sourceRefs: ['All reviewed uploads and archives'],
  },
] as const;

export const GB_READINESS_VERDICT = {
  contentCompleteness: 'content-complete-at-source-package-level',
  placeholderOnly: false,
  productionCompletionReady: false,
  complianceApproved: false,
  certificationReady: false,
  certificateMustRemainLocked: true,
  rationale: 'All 12 Academy modules and the integrated capstone have executable lesson, assessment, remediation, and transfer source. Production completion remains blocked by policy identity/crosswalk approval, missing approved P&P quiz banks, missing identity-bound evidence services, unresolved attempt enforcement, and absent learner evidence.',
} as const;
