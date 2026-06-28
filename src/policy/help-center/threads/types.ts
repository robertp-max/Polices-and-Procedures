/* ═══════════════════════════════════════════════════════════════════════════
   Help Center "Threads" — data model (single source of truth).
   ----------------------------------------------------------------------------
   Threads are an OPERATIONAL / PRODUCT / HELP discussion system. They are NOT a
   patient-chart communication channel. PHI must never be stored in a thread —
   see threadPhiGuard.ts for the detection/sanitize flow that guards writes.

   Everything in this module is plain data + pure logic so it can be unit-tested
   in isolation (no React, no network). The Zustand store (threadStore.ts) is the
   only stateful surface; UI and Brad integration consume these types.
   ═══════════════════════════════════════════════════════════════════════════ */

export type HelpThreadType =
  | 'knowledge_article'
  | 'feature_request'
  | 'brad_response'
  | 'guided_tour'
  | 'workflow_help'
  | 'form_help'
  | 'evidence_help'
  | 'ecign_help'
  | 'ces_event_help'
  | 'admission_packet_help'
  | 'bug_report'
  | 'general_question';

export type HelpThreadStatus =
  | 'open'
  | 'answered'
  | 'needs_brad'
  | 'needs_human_review'
  | 'planned'
  | 'in_progress'
  | 'resolved'
  | 'closed'
  | 'duplicate'
  | 'archived';

export type HelpThreadCategory =
  | 'brad_ai'
  | 'guided_tours'
  | 'help_center'
  | 'feature_requests'
  | 'evidence_center'
  | 'ecign'
  | 'ces_events'
  | 'qapi_packets'
  | 'admission_packets'
  | 'forms'
  | 'policy_library'
  | 'onboarding_journey'
  | 'reports_dashboards'
  | 'ui_accessibility'
  | 'performance'
  | 'bug'
  | 'other';

/** Where the thread was started from. Drives default visibility + auto-linking. */
export type HelpThreadSource =
  | { kind: 'help_article'; articleId: string; title: string }
  | { kind: 'feature_request'; featureRequestId: string; title: string }
  | { kind: 'brad_response'; bradResponseId: string; threadId?: string }
  | { kind: 'guided_tour'; tourId: string; stepId?: string }
  | { kind: 'workflow'; workflowId: string; stepId?: string }
  | { kind: 'form'; formId: string; sectionId?: string }
  | { kind: 'event'; eventId: string; taskId?: string }
  | { kind: 'general' };

export type ThreadVisibility =
  | 'private_to_user'
  | 'team'
  | 'all_staff'
  | 'role_restricted'
  | 'admin_only'
  | 'hidden';

export type HelpThread = {
  id: string;
  /** Set on a duplicate stub thread; points at the surviving canonical thread. */
  canonicalThreadId?: string;
  title: string;
  normalizedTitle: string;
  topicKey: string;
  type: HelpThreadType;
  status: HelpThreadStatus;
  source: HelpThreadSource;
  category: HelpThreadCategory;
  visibility: ThreadVisibility;
  tags: string[];

  createdByUserId: string;
  createdByDisplayName?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;

  messageCount: number;
  participantCount: number;
  upvoteCount: number;
  /** User IDs who upvoted — kept so merges can de-dup votes per spec test #13. */
  upvotedByUserIds: string[];
  userHasUpvoted?: boolean;

  relatedPolicyIds?: string[];
  relatedWorkflowIds?: string[];
  relatedFormIds?: string[];
  relatedEventIds?: string[];
  relatedHelpArticleIds?: string[];
  relatedFeatureRequestIds?: string[];

  duplicateOfThreadId?: string;
  mergedThreadIds?: string[];
  adminPinned?: boolean;
  /** Curated/system threads win canonical selection over plain age. */
  curated?: boolean;
  bradSummary?: string;
  acceptedAnswerMessageId?: string;

  containsPhiWarningShown?: boolean;
  sanitized?: boolean;
  /** Threads flagged "do not merge" are excluded from auto-merge + suggest-merge. */
  doNotMerge?: boolean;
};

export type ThreadSourceReference = {
  id: string;
  sourceType:
    | 'policy'
    | 'workflow'
    | 'form'
    | 'event'
    | 'help_article'
    | 'feature_request'
    | 'guided_tour'
    | 'system_doc';
  sourceId: string;
  title: string;
  sectionId?: string;
  route?: string;
  quoteOrSummary?: string;
};

export type ThreadSuggestedAction = {
  id: string;
  type:
    | 'start_guided_tour'
    | 'create_feature_request'
    | 'open_reference'
    | 'escalate_admin'
    | 'add_to_faq'
    | 'create_bug_report';
  label: string;
  targetId?: string;
  route?: string;
};

export type ThreadAttachment = {
  id: string;
  name: string;
  kind: 'image' | 'log' | 'file' | 'tour_diagnostic';
  /** Data URL or app route. Never a PHI-bearing payload. */
  href?: string;
  sizeBytes?: number;
  sanitized?: boolean;
};

export type BradThreadResponseMeta = {
  responseId: string;
  modelVersion?: string;
  sourceReferences: ThreadSourceReference[];
  confidence: 'high' | 'medium' | 'low';
  limitations?: string[];
  suggestedActions?: ThreadSuggestedAction[];
};

export type HelpThreadMessage = {
  id: string;
  threadId: string;
  authorType: 'user' | 'brad' | 'admin' | 'system';
  authorUserId?: string;
  authorDisplayName?: string;
  body: string;
  createdAt: string;
  updatedAt?: string;

  bradResponseMeta?: BradThreadResponseMeta;

  attachments?: ThreadAttachment[];
  containsPhiWarningShown?: boolean;
  sanitized?: boolean;
  edited?: boolean;
  hiddenByAdmin?: boolean;

  /** Provenance label preserved across merges, e.g. "Brad Response", "Help Article". */
  originLabel?: string;
};

export type ThreadMatchReason =
  | 'same_source_same_title'
  | 'same_topic_key'
  | 'same_feature_request'
  | 'same_brad_response_topic'
  | 'same_error_signature'
  | 'semantic_similarity'
  | 'admin_defined_duplicate_rule';

export type ThreadMatchResult = {
  candidateThreadId: string;
  confidence: number;
  reason: ThreadMatchReason;
  shouldAutoMerge: boolean;
  shouldSuggestMerge: boolean;
};

export type HelpThreadMergeRecord = {
  id: string;
  sourceThreadId: string;
  targetCanonicalThreadId: string;
  mergedBy: 'system' | 'brad' | 'admin' | 'user_confirmed';
  mergeReason: string;
  confidence: number;
  createdAt: string;
  preservedMessageIds: string[];
  redirectStubCreated: boolean;
};

export type BradThreadSummary = {
  threadId: string;
  summary: string;
  openQuestions: string[];
  decisions: string[];
  relatedSources: ThreadSourceReference[];
  lastSummarizedAt: string;
  summarizedThroughMessageId: string;
};

/* ── Default visibility by source kind ─────────────────────────────────────
   Brad-response threads are PRIVATE by default; the user must explicitly
   publish them to the Help Center. Workflow/event threads are role-restricted.
   ────────────────────────────────────────────────────────────────────────── */
export function defaultVisibilityForSource(source: HelpThreadSource): ThreadVisibility {
  switch (source.kind) {
    case 'brad_response':
      return 'private_to_user';
    case 'help_article':
    case 'feature_request':
      return 'all_staff';
    case 'guided_tour':
      return 'team';
    case 'workflow':
    case 'event':
    case 'form':
      return 'role_restricted';
    case 'general':
    default:
      return 'all_staff';
  }
}

/** The canonical statuses Brad/admin treat as "this thread already has an answer". */
export const ANSWERED_STATUSES: readonly HelpThreadStatus[] = ['answered', 'resolved'];

/** Statuses that must never be auto-merged (admin/legal/safety-protected). */
export const PROTECTED_FROM_AUTOMERGE_STATUSES: readonly HelpThreadStatus[] = [
  'needs_human_review',
];
