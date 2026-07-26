// Governing Body Boardroom Simulation (2026) — core domain contract.
//
// This is the FOUNDATION file every other tabletop2026 module builds on. It is
// intentionally data-shape-only (no React, no side effects). Keep it aligned
// with ../../qapi/model/qapi2026.types.ts (QuarterKey, provenance) and
// ../../compliance/complianceTypes.ts (evidence record shape) — both were
// read before this file was authored so the three layers compose cleanly:
//
//   qapi2026.types (source-of-record normalization)
//        -> tabletop2026/engine (case content + grading contract)
//        -> compliance (assignment + official evidence persistence)

// ---------------------------------------------------------------------------
// Identifiers
// ---------------------------------------------------------------------------

/** A quarterly case is scoped to one quarter; the capstone case is FY2026. */
export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'FY2026';

/** The 14 Governing Body workflows this simulation must exercise (see data/workflowCoverage.ts). */
export type GvWorkflowId =
  | 'GV-WF-01'
  | 'GV-WF-02'
  | 'GV-WF-03'
  | 'GV-WF-04'
  | 'GV-WF-05'
  | 'GV-WF-06'
  | 'GV-WF-07'
  | 'GV-WF-08'
  | 'GV-WF-09'
  | 'GV-WF-10'
  | 'GV-WF-11'
  | 'GV-WF-12'
  | 'GV-WF-13'
  | 'GV-WF-14';

export const ALL_GV_WORKFLOW_IDS: readonly GvWorkflowId[] = [
  'GV-WF-01', 'GV-WF-02', 'GV-WF-03', 'GV-WF-04', 'GV-WF-05', 'GV-WF-06', 'GV-WF-07',
  'GV-WF-08', 'GV-WF-09', 'GV-WF-10', 'GV-WF-11', 'GV-WF-12', 'GV-WF-13', 'GV-WF-14',
];

/** Where a piece of evidence came from. Mirrors qapi2026 SourceKind but named
 *  for the tabletop's exhibit vocabulary (never silently blended — see Exhibit.posture). */
export type SourcePosture = 'recovered' | 'supplemental_uat' | 'calculated' | 'unresolved';

export type Confidentiality = 'public' | 'restricted' | 'executive_session';

export type ValidationState = 'validated' | 'provisional' | 'conflicting' | 'unvalidated';

export type ExhibitRelevance = 'decision_relevant' | 'contextual' | 'conflicting' | 'decoy';

/** 0 = pre-meeting intake; 1–6 = the facilitated rounds of a matter. */
export type DecisionRound = 0 | 1 | 2 | 3 | 4 | 5 | 6;

// ---------------------------------------------------------------------------
// Exhibits (Board Book evidence)
// ---------------------------------------------------------------------------

export interface Exhibit {
  id: string;
  /** The upstream QAPI/normalized record id this exhibit is projected from, or a supplemental id. */
  sourceId: string;
  quarter: Quarter;
  asOfDate: string;
  posture: SourcePosture;
  /** Required whenever posture !== 'recovered' — surfaced verbatim on the exhibit face. */
  sourceLabel?: string;
  confidentiality: Confidentiality;
  validationState: ValidationState;
  workflowIds: GvWorkflowId[];
  formIds: string[];
  relevance: ExhibitRelevance;
  section: string;
  title: string;
  summary: string;
  details: string[];
}

export interface PacketConflictGroup {
  id: string;
  title: string;
  plainLanguageQuestion: string;
  exhibitIds: string[];
  conflictingFields: Array<{
    label: string;
    values: Array<{
      exhibitId: string;
      value: string;
    }>;
  }>;
  whyItMatters: string;
  affectedMatterIds: string[];
  workflowIds: GvWorkflowId[];
  formIds: string[];
  sourceCutoff: string;
}

// ---------------------------------------------------------------------------
// Decision nodes (the facilitated rounds)
// ---------------------------------------------------------------------------

/**
 * Every distinct thing a learner is asked to do in a round. Kept as one flat
 * union rather than per-kind interfaces so CasePack authors can compose a
 * matter out of any sequence of interactions; the `options` field is the
 * grading surface for choice-style kinds, `modelAction` is the comparison
 * target for structured/free-form kinds (see engine/diagnostics.ts).
 */
export type InteractionKind =
  | 'classify_evidence'
  | 'evidence_chain'
  | 'denominator'
  | 'reconcile_conflict'
  | 'proceed_decision'
  | 'quorum_calc'
  | 'eligibility'
  | 'workflow_select'
  | 'forms_select'
  | 'risk_rank'
  | 'session_classification'
  | 'motion_builder'
  | 'owner_assign'
  | 'due_date'
  | 'effectiveness'
  | 'return_date'
  | 'disposition'
  | 'board_vs_management'
  | 'public_minutes'
  | 'confidential_minutes'
  | 'surveyor'
  | 'transfer'
  | 'multiple_choice';

export interface DecisionOption {
  id: string;
  text: string;
  /** One or more correct options define full credit (see scoring rules). */
  correct?: boolean;
  /** Choosing this ends the node at result: 'critical_failure' regardless of other choices. */
  criticalFailure?: boolean;
  /** Board acting outside its authority (directing management/individual action). Capped credit. */
  overreach?: boolean;
}

export interface DecisionConsequences {
  patientSafety: string;
  regulatory: string;
  financial: string;
  privacy: string;
  recordIntegrity: string;
}

export interface DecisionNode {
  id: string;
  matterId: string;
  round: DecisionRound;
  title: string;
  prompt: string;
  kind: InteractionKind;
  competencyIds: string[];
  workflowIds: GvWorkflowId[];
  pointsAvailable: number;
  /** Present for choice-based kinds; absent for structured/free-form kinds (graded against modelAction). */
  options?: DecisionOption[];
  requiredEvidenceIds: string[];
  /** The correct structured answer for kinds without `options` (e.g. a computed quorum count, a due date). */
  modelAction: unknown;
  rationale: string;
  alternativesWhyFail: string[];
  formsRequired: string[];
  deadlineExplanation: string;
  consequences: DecisionConsequences;
}

// ---------------------------------------------------------------------------
// Injects (mid-round facts released to the board)
// ---------------------------------------------------------------------------

export interface Inject {
  id: string;
  /** Gate: only released once this node has been answered. Absent = released at round start. */
  releaseAfterNodeId?: string;
  round: DecisionRound;
  title: string;
  body: string;
  workflowIds: GvWorkflowId[];
  /** Links to a data/qapi2026Supplemental.ts record when the inject introduces supplemental evidence. */
  supplementalRecordId?: string;
}

// ---------------------------------------------------------------------------
// Surveyor / transfer mini-assessment (end of attempt)
// ---------------------------------------------------------------------------

export interface SurveyorOption {
  id: string;
  text: string;
}

/** A simulated surveyor question: "show me the record that proves X." */
export interface SurveyorQuestion {
  id: string;
  prompt: string;
  options: SurveyorOption[];
  correctId: string;
  /** Exhibit ids the learner must be able to point to (evidence-grounding, not just the right label). */
  requiresEvidenceIds: string[];
}

export interface TransferOption {
  id: string;
  text: string;
}

/** "Same competency, changed facts" — proves judgment transfers, not memorized answer position. */
export interface TransferQuestion {
  id: string;
  changedFacts: string[];
  prompt: string;
  options: TransferOption[];
  correctId: string;
  rationale: string;
}

// ---------------------------------------------------------------------------
// Case pack
// ---------------------------------------------------------------------------

export interface CasePack {
  id: string;
  quarter: Quarter;
  title: string;
  subtitle: string;
  estMinutes: number;
  /** ISO date/text: evidence dated after this cutoff must not be usable (see engine/sourceCutoff.ts). */
  sourceCutoff: string;
  exhibits: Exhibit[];
  packetConflictGroups: PacketConflictGroup[];
  decisionNodes: DecisionNode[];
  injects: Inject[];
  surveyor: SurveyorQuestion[];
  transfers: TransferQuestion[];
  requiredWorkflows: GvWorkflowId[];
  passScore: number;
  passStandardNote: string;
}

// ---------------------------------------------------------------------------
// Attempt selections — what a learner (or facilitated group) submitted
// ---------------------------------------------------------------------------

export interface NodeSelection {
  nodeId: string;
  /** For option-based kinds (node.options present). */
  selectedOptionIds?: string[];
  /** For structured/free-form kinds (node.options absent) — compared to node.modelAction. */
  action?: unknown;
  /** Exhibit ids the learner cited in support of this decision. */
  evidenceCited: string[];
  timestampIso?: string;
}

export interface AttemptSelections {
  nodeSelections: Record<string, NodeSelection>;
  /** Surveyor question id -> selected option id. */
  surveyorSelections: Record<string, string>;
  /** Transfer question id -> selected option id. */
  transferSelections: Record<string, string>;
  /** Inject ids the learner has acknowledged/opened. */
  injectsAcknowledged: string[];
}

export function emptyAttemptSelections(): AttemptSelections {
  return { nodeSelections: {}, surveyorSelections: {}, transferSelections: {}, injectsAcknowledged: [] };
}

// ---------------------------------------------------------------------------
// Diagnostics — the full "why" behind every node, pass or fail
// ---------------------------------------------------------------------------

export interface TabletopDiagnostic {
  nodeId: string;
  period: Quarter;
  competencyIds: string[];
  workflowIds: GvWorkflowId[];
  userAction: unknown;
  modelAction: unknown;
  result: 'correct' | 'partial' | 'incorrect' | 'critical_failure';
  pointsAvailable: number;
  pointsEarned: number;
  evidenceUsed: string[];
  evidenceRequired: string[];
  evidenceMissed: string[];
  evidenceMisused: string[];
  authorityExplanation: string;
  workflowExplanation: string;
  formsRequired: string[];
  deadlineExplanation: string;
  whyUserActionSucceededOrFailed: string;
  whyAlternativesFail: string[];
  consequences: DecisionConsequences;
  remediation: {
    immediate: string;
    microLessonId: string | null;
    trueFalseItemIds: string[];
    changedFactsPrompt: string | null;
  };
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

export type ScoreDimensionKey =
  | 'evidence_integrity'
  | 'meeting_legality'
  | 'qapi_judgment'
  | 'workflow_authority'
  | 'decision_proportionality'
  | 'records_forms'
  | 'surveyor_transfer';

export const SCORE_DIMENSION_WEIGHTS: Record<ScoreDimensionKey, number> = {
  evidence_integrity: 150,
  meeting_legality: 150,
  qapi_judgment: 200,
  workflow_authority: 150,
  decision_proportionality: 150,
  records_forms: 100,
  surveyor_transfer: 100,
};

export const TOTAL_POSSIBLE_SCORE = 1000;

export const QUARTERLY_PASS_SCORE = 950;
export const ANNUAL_PASS_SCORE = 970;

/** Quarterly cases require >=950 + zero critical errors; the FY2026 capstone requires >=970. */
export function passScoreForQuarter(quarter: Quarter): number {
  return quarter === 'FY2026' ? ANNUAL_PASS_SCORE : QUARTERLY_PASS_SCORE;
}

export interface AttemptScore {
  total: number;
  byDimension: Record<ScoreDimensionKey, number>;
  criticalErrors: string[];
  passed: boolean;
}
