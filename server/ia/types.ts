/* ═══════════════════════════════════════════════════════════════
   Compliance Intelligence (iAdministrator) — shared types.

   This is the single source of truth for:
     - corpus doc / chunk shape used by ingestion + index
     - structured response contract returned over the API

   Frontend mirrors the response contract in
   `src/policy/pages/iAdministrator/lib/responseTypes.ts`.
   ═══════════════════════════════════════════════════════════════ */

export type DocumentType = 'policy' | 'form' | 'appendix' | 'workflow';

export type AccessTier =
  | 'Tier 1 - Public'
  | 'Tier 2 - Restricted'
  | 'Tier 3 - Confidential'
  | 'Tier 4 - Privileged';

export type RiskLevel = 'none' | 'low' | 'moderate' | 'high' | 'critical';
export type Confidence = 'high' | 'medium' | 'low';

export type IntentKind =
  | 'question'
  | 'pre_survey_audit'
  | 'action_plan'
  | 'governing_body_brief'
  | 'qapi_digest'
  | 'knowledge_article'
  | 'artifact_lookup'
  | 'missing_items';

/** Canonical document record produced by ingestion. */
export interface CorpusDoc {
  /** Stable corpus ID (policy ID, form ID, appendix code, etc.). */
  id: string;
  title: string;
  type: DocumentType;
  domain: string;        // e.g., "GV", "CO", "QA", "HR", "CL", "FN", "IT", "OP", "RM", "EN"
  subdomain: string;     // e.g., "GB" (governing body), "BC" (billing & claims)
  ownerSteward: string;
  reviewCycle: string;
  accessTier: string;
  regulatoryTags: string[];
  sourcePath: string;    // absolute path on disk (server-side only)
  sourceHash: string;    // content hash to detect changes
  /** Normalized plain-text content (headings preserved). */
  content: string;
  sections: SectionRef[];
  /** Linked references harvested from the document body (other policy/form IDs). */
  linkedIds: string[];
  /** Optional full description / purpose summary extracted from header. */
  description?: string;
  version?: string;
  effectiveDate?: string;
  nextReviewDate?: string;
}

export interface SectionRef {
  id: string;           // e.g., "3" or "3.2" or "section-scope"
  title: string;
  level: number;        // 1 = top-level, 2 = subsection, ...
  start: number;        // char offset within CorpusDoc.content
  end: number;          // exclusive end offset
}

/** A retrievable unit. Keeps enough metadata to render citations / previews. */
export interface CorpusChunk {
  id: string;                 // `${docId}#${sectionId}#${ordinal}`
  docId: string;
  title: string;
  type: DocumentType;
  domain: string;
  subdomain: string;
  accessTier: string;
  regulatoryTags: string[];
  sectionId: string;
  sectionTitle: string;
  ordinal: number;            // position within section
  text: string;               // chunk text
  embedding?: number[];       // may be absent if embeddings disabled
  /** Upper-cased token array for BM25 / lexical fallback. */
  tokens?: string[];
}

export interface IndexManifest {
  builtAt: string;
  embedModel: string;
  embedDim: number;
  corpusRoot: string;
  docCount: number;
  chunkCount: number;
  // Map from sourcePath -> content hash captured at index time.
  sources: Record<string, string>;
}

/* ─────────────────────────────────────────────────────────────
   Structured response contract (must match the product spec).
   ───────────────────────────────────────────────────────────── */

export type ResponseType = 'compliance_answer';

export type StudioOutputType =
  | 'summary'
  | 'action_plan'
  | 'audit_checklist'
  | 'governing_body_brief'
  | 'qapi_digest'
  | 'knowledge_article';

export type RequirementStatus = 'required' | 'recommended' | 'warning';

export type ReferenceIntent =
  | 'required'
  | 'recommended'
  | 'supporting'
  | 'related'
  | 'required_for_completion'
  | 'required_for_review'
  | 'required_for_audit';

export type CitationRelevance = 'primary' | 'secondary';

export type ActionType =
  | 'open_reference'
  | 'open_form'
  | 'open_policy'
  | 'open_appendix'
  | 'open_workflow'
  | 'generate_summary'
  | 'generate_action_plan'
  | 'generate_audit_checklist'
  | 'generate_governing_body_brief'
  | 'generate_qapi_digest'
  | 'generate_knowledge_article'
  | 'print_form'
  | 'download_pdf'
  | 'attach_to_event'
  | 'mark_complete';

export interface RequirementSnapshotItem {
  label: string;
  status: RequirementStatus;
  sourcePolicyId: string;
  sourceSection: string;
}

export interface Citation {
  id: string;
  policyId: string;
  title: string;
  section: string;
  excerpt: string;
  relevance: CitationRelevance;
}

export interface LinkedReference {
  id: string;
  type: DocumentType;
  title: string;
  intent: ReferenceIntent;
  required: boolean;
  description: string;
  policyId: string;
  section: string;
  accessTier: string;
  domain: string;
  subdomain: string;
  previewMode: 'document' | 'form' | 'workflow';
}

export interface AvailableAction {
  id: string;
  type: ActionType;
  label: string;
  targetId: string;
  targetType: DocumentType;
  studioOutputType: StudioOutputType | null;
  priority: 'primary' | 'secondary';
}

/** CMS enforcement tier derived from riskLevel + regulatory tags. */
export type EnforcementLevel = 'condition_level' | 'standard_level' | 'none';

export interface StructuredResponse {
  id: string;
  responseType: ResponseType;
  directAnswer: string;
  operationalRequirement: string;
  requiredArtifacts: string[];
  complianceRisk: string;
  riskLevel: RiskLevel;
  confidence: Confidence;

  /** 0–100 score derived from retrieval quality, citation count, and governing
   *  policy presence. Drives the credibility meter in the UI. */
  systemConfidenceScore: number;

  /** The primary governing policy ID that establishes authority for this answer.
   *  Null when no specific policy could be pinned. */
  governingPolicyId: string | null;

  /** CMS enforcement tier — 'condition_level' for CoP deficiencies,
   *  'standard_level' for minor regulatory gaps. */
  enforcementLevel: EnforcementLevel;

  /** What happens if this requirement is not met: survey deficiency,
   *  claim denial, CoP violation, license risk. */
  complianceImpact: string;

  /** What a CMS surveyor specifically looks for during inspection. */
  surveyFocus: string[];

  /** Documented failure patterns from the corpus that trigger deficiencies. */
  commonFailurePoints: string[];

  requirementsSnapshot: RequirementSnapshotItem[];
  citations: Citation[];
  linkedReferences: LinkedReference[];
  availableActions: AvailableAction[];
  studioOutputType: StudioOutputType | null;
  noAnswerFound: boolean;
  noAnswerReason: string;

  /* ── Operational intelligence extensions (Phase 1-3) ──────────
     All fields below are computed server-side from structured data.
     Never generated by the LLM — cannot be hallucinated.
     ───────────────────────────────────────────────────────────── */

  /** Live operational compliance gaps (overdue tasks, unsigned forms,
   *  blocked workflows). Phase 1 = seed data. */
  operationalGaps?: OperationalGap[];

  /** Policy lifecycle issues (draft/pending approval/overdue review).
   *  Phase 1 = seed data from governance tracker. */
  lifecycleAlerts?: LifecycleAlert[];

  /** External regulatory update alerts with impact mapping to corpus.
   *  Phase 2 = CMS update feed. Phase 1 = curated seed entries. */
  regulatoryAlerts?: RegulatoryAlert[];

  /** Honest reporting of which phases are supplying live data. */
  phaseStatus?: PhaseStatus;

  /** Debug / observability fields (never sensitive). */
  meta?: {
    intent: IntentKind;
    retrievedChunkIds: string[];
    model: string;
    elapsedMs: number;
  };
}

/* ─────────────────────────────────────────────────────────────
   Operational intelligence types — Phase 1/2/3 extensions.
   These are computed server-side from structured data, NOT from
   the LLM, ensuring accuracy for operational gap reporting.
   ───────────────────────────────────────────────────────────── */

export type GapSeverity = 'critical' | 'high' | 'moderate' | 'low';
export type GapSource = 'operational' | 'lifecycle' | 'ehr' | 'regulatory';
export type GapPhase = 1 | 2 | 3;

export type OperationalGapType =
  | 'overdue_task'
  | 'missing_artifact'
  | 'unsigned_form'
  | 'pending_approval'
  | 'blocked_workflow'
  | 'incomplete_form'
  | 'overdue_event'
  | 'ehr_gap';

/** A live operational compliance gap detected from structured app state. */
export interface OperationalGap {
  id: string;
  type: OperationalGapType;
  title: string;
  description: string;
  owner?: string;
  dueDate?: string;
  overdueDays?: number;
  linkedPolicyId?: string;
  linkedFormId?: string;
  severity: GapSeverity;
  source: GapSource;
  complianceImpact: string;
  nextAction: string;
  phase: GapPhase;
}

export type LifecycleState =
  | 'draft'
  | 'under_review'
  | 'pending_approval'
  | 'overdue_review'
  | 'approved_unpublished'
  | 'awaiting_acknowledgment'
  | 'missing_linked_artifact';

/** A policy lifecycle issue surfaced from the governance system. */
export interface LifecycleAlert {
  id: string;
  policyId: string;
  policyTitle: string;
  state: LifecycleState;
  owner: string;
  approver?: string;
  requestedDate?: string;
  dueDate?: string;
  overdueDays?: number;
  severity: GapSeverity;
  nextAction: string;
  blockedBy?: string;
}

export type RegulatoryAlertStatus = 'new' | 'under_review' | 'reviewed' | 'action_taken';
export type RegulatoryAlertSeverity = 'immediate' | 'high' | 'moderate' | 'low';

/** An external regulatory update with assessed impact on the internal corpus. */
export interface RegulatoryAlert {
  updateId: string;
  title: string;
  source: string;
  publishedDate: string;
  effectiveDate?: string;
  topic: string;
  severity: RegulatoryAlertSeverity;
  affectedArea: string;
  impactedPolicies: string[];
  impactedForms: string[];
  impactedAreas: string[];
  reviewRecommendation: string;
  nextAction: string;
  status: RegulatoryAlertStatus;
  sourceUrl?: string;
}

/** Phase availability flags — honest about what data is live vs stubbed. */
export interface PhaseStatus {
  phase1: { available: boolean; label: string; dataSource: string };
  phase2: { available: boolean; label: string; dataSource: string };
  phase3: { available: boolean; label: string; dataSource: string };
}

/* ─────────────────────────────────────────────────────────────
   API request / response envelopes.
   ───────────────────────────────────────────────────────────── */

export interface QueryRequest {
  /** Raw command / question text from the compliance command bar. */
  input: string;
  /** Optional explicit intent override (triggered by a studio tab / action). */
  intent?: IntentKind;
  /** Optional: if the UI already has a doc open, bias retrieval toward it. */
  activeDocId?: string;
  /** How many chunks to retrieve (defaults provided server-side). */
  k?: number;
}

export interface ReferencePreview {
  id: string;
  type: DocumentType;
  title: string;
  domain: string;
  subdomain: string;
  accessTier: string;
  regulatoryTags: string[];
  sections: Array<{ id: string; title: string; level: number; body: string }>;
  linkedIds: string[];
  sourcePath: string;  // shown as a relative hint to the user, not a browsable link
  version?: string;
  effectiveDate?: string;
  nextReviewDate?: string;
  /** Optional purpose / description surfaced from the document header. */
  description?: string;
}

export interface IndexStatus {
  ready: boolean;
  builtAt: string | null;
  embedModel: string | null;
  embedDim: number | null;
  docCount: number;
  chunkCount: number;
  corpusRoot: string;
  missing: string[];
}
