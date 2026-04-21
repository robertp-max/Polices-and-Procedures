/* ═══════════════════════════════════════════════════════════════
   iAdministrator — frontend response types.

   Mirrors `server/ia/types.ts` for the response contract only.
   Keep in sync when evolving either side.
   ═══════════════════════════════════════════════════════════════ */

export type DocumentType = 'policy' | 'form' | 'appendix' | 'workflow';
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

export type EnforcementLevel = 'condition_level' | 'standard_level' | 'none';

/* ── Operational intelligence types (Phase 1-3) ───────────────────── */

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

export interface PhaseStatus {
  phase1: { available: boolean; label: string; dataSource: string };
  phase2: { available: boolean; label: string; dataSource: string };
  phase3: { available: boolean; label: string; dataSource: string };
}

/* ── Structured response contract ────────────────────────────────── */

export interface StructuredResponse {
  id: string;
  responseType: 'compliance_answer';
  directAnswer: string;
  operationalRequirement: string;
  requiredArtifacts: string[];
  complianceRisk: string;
  riskLevel: RiskLevel;
  confidence: Confidence;
  systemConfidenceScore: number;
  governingPolicyId: string | null;
  enforcementLevel: EnforcementLevel;
  complianceImpact: string;
  surveyFocus: string[];
  commonFailurePoints: string[];
  requirementsSnapshot: RequirementSnapshotItem[];
  citations: Citation[];
  linkedReferences: LinkedReference[];
  availableActions: AvailableAction[];
  studioOutputType: StudioOutputType | null;
  noAnswerFound: boolean;
  noAnswerReason: string;
  operationalGaps?: OperationalGap[];
  lifecycleAlerts?: LifecycleAlert[];
  regulatoryAlerts?: RegulatoryAlert[];
  phaseStatus?: PhaseStatus;
  meta?: {
    intent: IntentKind;
    retrievedChunkIds: string[];
    model: string;
    elapsedMs: number;
  };
}

export interface QueryRequest {
  input: string;
  intent?: IntentKind;
  activeDocId?: string;
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
  sourcePath: string;
  version?: string;
  effectiveDate?: string;
  nextReviewDate?: string;
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

export interface HealthResponse {
  status: IndexStatus;
  ollama: { ok: boolean; models?: string[]; error?: string };
}
