export type HelpCategoryId =
  | 'getting-started'
  | 'brad-ai'
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

export interface VisualHelpHero {
  type: 'screenshot' | 'illustration' | 'diagram';
  src: string; // e.g. '/assets/media/hero-brad.jpg' or public path
  alt: string;
  caption?: string;
  annotation?: string; // e.g. "Click Ask Brad here"
}

export interface VisualHelpStep {
  id: string;
  number?: number;
  title: string;
  body: string; // short, <25 words preferred
  image?: VisualHelpHero;
  actionLabel?: string;
  actionHref?: string; // e.g. for guided tour or link
  warning?: string;
}

export interface HelpMistake {
  mistake: string;
  fix: string;
}

export interface HelpScreenshot {
  src: string;
  alt: string;
  caption: string;
  annotations?: Array<{ x: number; y: number; label: string }>; // % coords for annotated
}

export interface VisualHelpArticle {
  id: string;
  slug: string;
  title: string;
  shortTitle?: string;
  category: HelpCategoryId;
  subcategory?: string;
  summary: string; // max ~60 words
  audience: Array<'all_staff' | 'admin' | 'clinician' | 'qapi' | 'compliance' | 'hr' | 'auditor' | 'demo'>;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'live' | 'draft' | 'needs_screenshot' | 'needs_review' | 'stale' | 'planned';
  lastUpdated: string; // ISO
  appVersion?: string;
  sourceRoutes: string[];
  sourceComponents: string[];
  featureFlags?: string[];
  tags: string[];

  hero: VisualHelpHero;

  useWhen: string[]; // short bullets
  beforeYouStart?: string[];
  steps: VisualHelpStep[];
  commonMistakes?: HelpMistake[];
  relatedArticles?: string[]; // slugs
  relatedTours?: string[];
  relatedFeatureRequests?: string[];
  relatedThreads?: string[];
  screenshots: HelpScreenshot[]; // additional
  nonPhiReminder: boolean;
  reviewedBy?: string;

  // For UI actions
  launchTourId?: string;
  createFeatureRequestCategory?: string;
}