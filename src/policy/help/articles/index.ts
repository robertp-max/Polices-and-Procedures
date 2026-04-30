/** Help Center article registry. Type-safe; consumed by HelpCenterPage. */
import { GETTING_STARTED } from './getting-started';
import { SIGNING_DOCUMENTS } from './signing-documents';
import { COMPLIANCE_AUDIT } from './compliance-audit';
import { WORKFLOWS_EVENTS } from './workflows-events';
import { FORMS_TEMPLATES } from './forms-templates';
import { DEVELOPER_ECIGN } from './developer-ecign';
import { POLICY_LIFECYCLE } from './policy-lifecycle';
import { ONBOARDING_V2 } from './onboarding-v2';
import { DASHBOARD_ARTICLES } from './dashboard';
import { CALENDAR_ARTICLES } from './calendar';
import { IADMINISTRATOR_ARTICLES } from './iadministrator';
import { EVIDENCE_CENTER_ARTICLES } from './evidence-center';
import { AUDIT_MODE_ARTICLES } from './audit-mode';
import { MASTER_CONTROLS_ARTICLES } from './master-controls';

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
  /** Audit-ready extensions — present on upgraded articles */
  complianceRequirement?: string;
  enforcementRules?: string[];
  requiredActions?: string[];
  auditLogging?: string;
  failureImpact?: string;
  traceability?: {
    policy_id?:   string;
    workflow_id?: string;
    event_id?:    string;
    form_id?:     string;
    evidence_id?: string;
    audit_id?:    string;
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
  { id: 'dashboard',          label: 'Command Center Dashboard' },
  { id: 'calendar',           label: 'Master Calendar' },
  { id: 'iadministrator',     label: 'Brad iAdministrator' },
  { id: 'evidence-center',    label: 'Evidence Center' },
  { id: 'audit-mode',         label: 'Audit Mode' },
  { id: 'master-controls',    label: 'Master Controls' },
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
  ...DASHBOARD_ARTICLES,
  ...CALENDAR_ARTICLES,
  ...IADMINISTRATOR_ARTICLES,
  ...EVIDENCE_CENTER_ARTICLES,
  ...AUDIT_MODE_ARTICLES,
  ...MASTER_CONTROLS_ARTICLES,
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
