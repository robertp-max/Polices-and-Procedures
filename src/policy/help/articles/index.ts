/** Help Center article registry. Type-safe; consumed by HelpCenterPage. */
import { GETTING_STARTED } from './getting-started';
import { SIGNING_DOCUMENTS } from './signing-documents';
import { COMPLIANCE_AUDIT } from './compliance-audit';
import { WORKFLOWS_EVENTS } from './workflows-events';
import { FORMS_TEMPLATES } from './forms-templates';
import { DEVELOPER_ECIGN } from './developer-ecign';
import { POLICY_LIFECYCLE } from './policy-lifecycle';
import { ONBOARDING_V2 } from './onboarding-v2';

export interface HelpArticle {
  slug:        string;
  title:       string;
  category:    string;
  subcategory?: string;
  purpose:     string;
  whenToUse:   string;
  steps?:      string[];
  systemBehavior: string;
  complianceImpact: string;
  evidence:    string;
  related: {
    policies?:  string[];
    workflows?: string[];
    endpoints?: string[];
    components?: string[];
  };
}

export const CATEGORIES: Array<{ id: string; label: string; subcategories?: string[] }> = [
  { id: 'getting-started',    label: 'Getting Started' },
  { id: 'policy-lifecycle',   label: 'Policy Lifecycle', subcategories: ['Developer'] },
  { id: 'signing-documents',  label: 'Signing Documents' },
  { id: 'compliance-audit',   label: 'Compliance & Audit' },
  { id: 'workflows-events',   label: 'Workflows & Events' },
  { id: 'forms-templates',    label: 'Forms & Templates' },
  { id: 'developer',          label: 'Developer', subcategories: ['eCIgn'] },
  { id: 'onboarding-v2',      label: 'Onboarding v2', subcategories: ['Getting Started','Role-Based Onboarding','CES Integration','Evidence & Forms','Competency Validation','Policy Acknowledgments','eCIgn Signatures','Audit Readiness','Recurring Revalidation','Vendor & Governance','Compliance Enforcement & Overrides','Troubleshooting','Surveyor Quick Answers'] },
];

export const ARTICLES: HelpArticle[] = [
  ...GETTING_STARTED,
  ...POLICY_LIFECYCLE,
  ...SIGNING_DOCUMENTS,
  ...COMPLIANCE_AUDIT,
  ...WORKFLOWS_EVENTS,
  ...FORMS_TEMPLATES,
  ...DEVELOPER_ECIGN,
  ...ONBOARDING_V2,
];

export function findArticle(slug: string): HelpArticle | undefined {
  return ARTICLES.find(a => a.slug === slug);
}

export function articlesByCategory(catId: string): HelpArticle[] {
  return ARTICLES.filter(a => a.category === catId);
}

export function searchArticles(q: string): HelpArticle[] {
  const t = q.trim().toLowerCase();
  if (!t) return [];
  return ARTICLES.filter(a =>
    a.title.toLowerCase().includes(t) ||
    a.purpose.toLowerCase().includes(t) ||
    a.systemBehavior.toLowerCase().includes(t) ||
    a.complianceImpact.toLowerCase().includes(t),
  );
}
