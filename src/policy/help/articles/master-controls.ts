import type { HelpArticle } from './index';

export const MASTER_CONTROLS_ARTICLES: HelpArticle[] = [
  {
    slug: 'master-controls-overview',
    title: 'Master Controls Inventory — Overview',
    category: 'master-controls',
    purpose:
      'The Master Controls Inventory (/compliance/master-controls) provides a full catalog of all policies, workflows, and compliance controls across all 10 regulatory domains. It is the reference surface for compliance officers to verify control coverage.',
    whenToUse:
      'During compliance gap analysis. Before a CMS survey to verify all required controls are active. During policy review cycles.',
    systemBehavior:
      'Reads from policyStore (policy list, statuses, versions) and calendarStore (event coverage). Displays all policies in a sortable/filterable table by domain, status, and effective date. Links each policy to its associated workflows and calendar events.',
    complianceImpact:
      'The Master Controls Inventory is the primary surface for demonstrating to surveyors that the agency has documented controls for all required regulatory domains. Gaps in the inventory (domains without active Published policies) are direct survey findings.',
    evidence:
      'Viewing the inventory is not logged. Policy status changes (publishing, archiving) are logged in the enforcementStore audit chain.',
    related: {
      components: ['MasterControlInventory', 'SharedPolicyDetailView'],
      endpoints: ['GET /api/compliance/objects/policy/:id'],
    },
    complianceRequirement:
      'CMS CoP 42 CFR Part 484 requires home health agencies to maintain written policies and procedures for all regulatory domains. The Master Controls Inventory provides the audit-ready list of those policies, their lifecycle status, and their associated enforcement workflows.',
    enforcementRules: [
      'Only Published policies are considered active controls.',
      'Draft and Review policies are not active — they do not satisfy regulatory requirements.',
      'Archived policies are superseded — they cannot be cited as current controls.',
      'Every compliance domain (GV, CL, QA, HR, CO, FN, OP, EN, IT, RM) must have at least one Published policy.',
    ],
    requiredActions: [
      'Review the inventory before each survey to confirm all required domains have Published policies.',
      'Identify any policies in Draft or Review status that should be Published.',
      'Confirm all Published policies have an associated workflow in the Calendar.',
      'Archive superseded policies and publish updated versions.',
    ],
    auditLogging:
      'Policy status transitions (POLICY_PUBLISHED, POLICY_ARCHIVED) logged with: user_id, role, timestamp, policy_id, from_status, to_status.',
    failureImpact:
      'Missing Published policies in a domain: (1) compliance gap in that domain, (2) CMS citation during survey, (3) corrective action plan required. Policies in Draft that should be Published represent incomplete compliance program management.',
    traceability: {
      policy_id:   'per policy record (e.g., GV-GB-001)',
      workflow_id: 'linked workflow (e.g., GV-GB-001-WF)',
      audit_id:    'generated on each policy status transition',
    },
  },
  {
    slug: 'master-controls-domains',
    title: 'Compliance Domains Reference',
    category: 'master-controls',
    purpose:
      'Reference for all 10 compliance domains and their regulatory basis.',
    whenToUse:
      'When locating policies by domain, understanding regulatory requirements, or mapping controls to specific regulations.',
    systemBehavior:
      'Policy IDs follow the format {DOMAIN}-{ABBREV}-{SEQ}. Domains: GV (Governance), CL (Clinical), QA (Quality Assurance), HR (Human Resources), CO (Compliance), FN (Finance), OP (Operations), EN (Environment), IT (Information Technology), RM (Risk Management).',
    complianceImpact:
      'Each domain maps to one or more CMS CoP conditions. All 10 domains must be covered by Published policies for full regulatory compliance.',
    evidence:
      'Domain assignment is part of the policy_id and is immutable once a policy is published.',
    related: {
      policies: ['GV-GB-001', 'CL-CC-001', 'QA-QI-001', 'CO-HIPAA-001', 'RM-IR-001'],
    },
    enforcementRules: [
      'GV (Governance): Governing Body meetings, governance structure — 42 CFR § 484.105',
      'CL (Clinical): Clinical services, supervisory visits, POC — 42 CFR § 484.60, 484.80',
      'QA (Quality Assurance): QAPI program — 42 CFR § 484.65',
      'HR (Human Resources): Personnel qualifications, onboarding — 42 CFR § 484.115',
      'CO (Compliance): HIPAA, fraud/abuse, legal compliance',
      'FN (Finance): Billing controls, financial integrity',
      'OP (Operations): Day-to-day operational procedures',
      'EN (Environment): OSHA, infection control, environmental safety — OSHA 29 CFR 1910',
      'IT (Information Technology): Security controls, system access',
      'RM (Risk Management): Incident reporting, risk assessment — 42 CFR § 484.65',
    ],
  },
];
