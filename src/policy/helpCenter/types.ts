// Help Center Command Center — canonical data model.
//
// This is the successor to the legacy HelpArticle (src/policy/data/helpArticles.ts,
// still consumed by Brad app context — do not remove) and VisualHelpArticle
// (src/policy/data/visualHelpArticles.ts). New Help Center surfaces render ONLY
// from this model; legacy entries are retired via the retired-articles register.

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------

export type HelpBadgeGroup = 'audience' | 'feature' | 'task' | 'status' | 'safety';

export type HelpAudienceBadgeId =
  | 'office-staff'
  | 'learner'
  | 'clinician'
  | 'supervisor'
  | 'compliance'
  | 'admin'
  | 'all-staff';

export type HelpFeatureBadgeId =
  | 'brad'
  | 'nolan'
  | 'ces'
  | 'evidence'
  | 'ecign'
  | 'forms'
  | 'policies'
  | 'reports'
  | 'admission'
  | 'journey'
  | 'community';

export type HelpTaskBadgeId =
  | 'quick-start'
  | 'guided-tour'
  | 'troubleshooting'
  | 'workflow'
  | 'reference'
  | 'checklist'
  | 'decision-tree'
  | 'print'
  | 'upload'
  | 'signature';

export type HelpStatusBadgeId =
  | 'core'
  | 'basics'
  | 'required'
  | 'optional'
  | 'new'
  | 'updated'
  | 'needs-review'
  | 'retired';

export type HelpSafetyBadgeId =
  | 'no-phi'
  | 'phi-warning'
  | 'audit-support'
  | 'survey-support'
  | 'training-only'
  | 'not-attestation';

export type HelpBadgeId =
  | HelpAudienceBadgeId
  | HelpFeatureBadgeId
  | HelpTaskBadgeId
  | HelpStatusBadgeId
  | HelpSafetyBadgeId;

export type HelpBadgeTone = 'teal' | 'orange' | 'sky' | 'emerald' | 'amber' | 'slate' | 'rose';

export interface HelpBadgeDef {
  id: HelpBadgeId;
  group: HelpBadgeGroup;
  label: string;
  /** Accessible long-form text (aria-label / tooltip). */
  description: string;
  tone: HelpBadgeTone;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export type HelpCenterCategoryId =
  | 'getting-started'
  | 'brad-ai'
  | 'nolan-learner'
  | 'guided-tours'
  | 'ces-events'
  | 'evidence-center'
  | 'ecign-signatures'
  | 'forms'
  | 'policies'
  | 'qapi-reports'
  | 'audit-survey'
  | 'admission-packets'
  | 'onboarding-journey'
  | 'community'
  | 'feature-requests'
  | 'threads-discussions'
  | 'notifications-personal'
  | 'troubleshooting'
  | 'admin-settings';

export interface HelpQuickAction {
  label: string;
  /** In-app route the action navigates to. */
  to: string;
}

export interface HelpCenterCategory {
  categoryId: HelpCenterCategoryId;
  title: string;
  shortDescription: string;
  /** lucide-react icon name rendered by the category card (kept as data so the model stays serializable). */
  icon: string;
  primaryBadge: HelpBadgeId;
  audienceBadges: HelpAudienceBadgeId[];
  /** Routes/components this category documents. */
  routeCoverage: string[];
  componentCoverage: string[];
  /** Guided tour ids (HelpGuidedTour.tourId) surfaced on the category page. */
  guidedTours: string[];
  /** Article ids pinned as recommended on the category page. */
  recommendedArticles: string[];
  quickActions: HelpQuickAction[];
  /** True when the category documents admin-gated surfaces; excluded from the office-staff syllabus. */
  adminOnly: boolean;
}

// ---------------------------------------------------------------------------
// Content blocks
// ---------------------------------------------------------------------------

export interface HelpImageRef {
  /** Stable id in HELP_IMAGES registry; renderer falls back to a designed placeholder when the asset is missing. */
  imageId: string;
  alt: string;
  caption?: string;
}

export interface HelpStep {
  title: string;
  body: string;
  image?: HelpImageRef;
  actionLabel?: string;
  actionTo?: string;
  warning?: string;
}

export interface HelpChecklistItem {
  label: string;
  detail?: string;
}

export interface HelpDecisionBranch {
  question: string;
  yes: { outcome: string; next?: HelpDecisionBranch };
  no: { outcome: string; next?: HelpDecisionBranch };
}

export interface HelpTroubleshootingCase {
  symptom: string;
  cause: string;
  fix: string;
}

export interface HelpRelatedLink {
  kind: 'article' | 'policy' | 'form' | 'workflow' | 'evidence' | 'tour' | 'route';
  label: string;
  /** Article id, tour id, or in-app route depending on kind. */
  ref: string;
}

export interface HelpFaqItem {
  question: string;
  answer: string;
}

export interface HelpGlossaryTerm {
  term: string;
  definition: string;
}

export type HelpContentBlock =
  | { type: 'hero'; image: HelpImageRef; headline?: string; kicker?: string }
  | { type: 'summary'; body: string }
  | { type: 'badgeRow'; badges: HelpBadgeId[] }
  | { type: 'stepList'; title?: string; steps: HelpStep[] }
  | { type: 'image'; image: HelpImageRef }
  | { type: 'callout'; tone: 'info' | 'tip' | 'important'; title: string; body: string }
  | { type: 'checklist'; title?: string; items: HelpChecklistItem[] }
  | { type: 'decisionTree'; title?: string; root: HelpDecisionBranch }
  | { type: 'troubleshootingFlow'; title?: string; cases: HelpTroubleshootingCase[] }
  | { type: 'roleNote'; role: HelpAudienceBadgeId; body: string }
  | { type: 'relatedLinks'; title?: string; links: HelpRelatedLink[] }
  | { type: 'nextActions'; title?: string; actions: HelpQuickAction[] }
  | { type: 'faq'; items: HelpFaqItem[] }
  | { type: 'glossary'; terms: HelpGlossaryTerm[] }
  | { type: 'warning'; title: string; body: string }
  | { type: 'successCriteria'; title?: string; criteria: string[] };

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export type HelpArticleTemplateId =
  | 'page-manual'
  | 'component-manual'
  | 'workflow-manual'
  | 'guided-tour-manual'
  | 'troubleshooting-manual'
  | 'admin-manual'
  | 'learner-manual'
  | 'evidence-packet-manual'
  | 'policy-form-manual'
  | 'quick-action-manual'
  | 'office-staff-lesson';

export type HelpArticleStatus = 'active' | 'draft' | 'retired';
export type HelpArticleDifficulty = 'basics' | 'standard' | 'advanced';

export interface HelpCenterArticle {
  articleId: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: HelpCenterCategoryId;
  template: HelpArticleTemplateId;
  /** Primary routes and components this article documents (used by search + coverage). */
  routes: string[];
  components: string[];
  audience: HelpAudienceBadgeId[];
  badges: HelpBadgeId[];
  difficulty: HelpArticleDifficulty;
  /** e.g. "4 min" */
  estimatedTime: string;
  lastUpdated: string;
  status: HelpArticleStatus;
  purpose: string;
  whenToUse: string[];
  prerequisites?: string[];
  /** Ordered body. The renderer draws hero/summary/badgeRow first when present. */
  blocks: HelpContentBlock[];
  /** Short imperative quick-start steps rendered as the "fast path" strip. */
  quickStart: string[];
  commonMistakes?: Array<{ mistake: string; fix: string }>;
  safetyNotes?: string[];
  relatedPolicies?: string[];
  relatedForms?: string[];
  relatedWorkflows?: string[];
  relatedTours?: string[];
  relatedArticles?: string[];
  /** Guided tour launched by the article CTA (GuidedDomain value). */
  launchTourDomain?: string;
}

// ---------------------------------------------------------------------------
// Guided tours (help-center metadata layer over src/v6/guided)
// ---------------------------------------------------------------------------

export interface HelpGuidedTour {
  tourId: string;
  /** GuidedDomain value understood by getTourBuilder(). */
  domain: string;
  title: string;
  description: string;
  badges: HelpBadgeId[];
  category: HelpCenterCategoryId;
  estimatedTime: string;
  /** Article documenting the tour. */
  articleId?: string;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------

export interface HelpImageAsset {
  imageId: string;
  /** Public path, e.g. /assets/help/help-center-home.png. */
  src: string;
  alt: string;
  /** Route + viewport used by the capture plan. */
  captureRoute: string;
  viewport: 'desktop' | 'mobile';
  status: 'captured' | 'placeholder';
}

// ---------------------------------------------------------------------------
// Office staff syllabus
// ---------------------------------------------------------------------------

export interface SyllabusLesson {
  lessonId: string;
  title: string;
  component: string;
  route?: string;
  userGoal: string;
  practiceAction: string;
  relatedArticleIds: string[];
  relatedTourIds: string[];
  badges: HelpBadgeId[];
  screenshotTargets: string[];
  knowledgeCheck: { question: string; answer: string };
  successCriteria: string[];
  adminExcluded: boolean;
}

export interface SyllabusModule {
  moduleId: string;
  order: number;
  title: string;
  description: string;
  badges: HelpBadgeId[];
  lessons: SyllabusLesson[];
}

// ---------------------------------------------------------------------------
// Retired article register
// ---------------------------------------------------------------------------

export interface RetiredArticleEntry {
  oldArticleId: string;
  /** File the legacy body lives in (kept on disk; not rendered as active help). */
  oldPath: string;
  reasonRetired: string;
  replacedByArticleId?: string;
  replacementCategory?: HelpCenterCategoryId;
  notes?: string;
}
