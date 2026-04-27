import type { HelpArticle } from './index';

export const GETTING_STARTED: HelpArticle[] = [
  {
    slug: 'overview',
    title: 'Welcome to CI-App eCIgn',
    category: 'getting-started',
    purpose: 'CI-App eCIgn is the legally enforceable, audit-ready electronic signature subsystem of CI-App for Care Indeed Home Health Care, Inc.',
    whenToUse: 'Any time a Care Indeed document requires a signature: Plans of Care, physician orders, policy acknowledgments, QAPI minutes, HR onboarding records, or mandatory event reports.',
    systemBehavior: 'eCIgn enforces a six-step workflow (Disclosure → Identity → Review → Signature → Attestation → Lock) at the server boundary. Templates are byte-preserved; evidence is added via a footer watermark and four appended pages (Certificate, Identity & Device, Audit Trail, Hash Manifest).',
    complianceImpact: 'Aligns with ESIGN Act (15 U.S.C. §§ 7001–7031), UETA, HIPAA (45 CFR §§ 164.308 / 164.312), and CMS Home Health Conditions of Participation (42 CFR Part 484).',
    evidence: 'Every signing event produces: signed PDF (template + watermark + appended pages), audit trail report, signature certificate page, and a survey packet ZIP.',
    related: {
      policies: ['EN-CM-001', 'CO-CP-001', 'CL-CC-001'],
      components: ['CommandCenterLayout', 'FormSigningWorkspace', 'AuditModePage'],
    },
  },
  {
    slug: 'roles-and-tiers',
    title: 'Roles, Tiers & Permissions',
    category: 'getting-started',
    purpose: 'CI-App uses a four-tier role model that governs who can sign what, who can request a second signature, and who can void a signed document.',
    whenToUse: 'Before assigning an approver, requesting a second signature, or attempting to void a signed instance.',
    systemBehavior: 'Tier 1 = Administrator; Tier 2 = Administrator Designee; Tier 3 = Compliance Officer; Tier 4 = Clinical Manager / Liaison. Second-signature requests must target a tier strictly above the requester. Void operations require tier ≤ 2 (server-enforced in /api/ecign/instances/:id/void).',
    complianceImpact: 'Prevents unauthorized approvals (HIPAA 164.312(a) access control) and ensures separation of duties for CMS survey defensibility.',
    evidence: 'Every tier check generates either a successful audit event or an `access.denied` event with the offending payload.',
    related: {
      endpoints: ['POST /api/ecign/instances/:id/second-signature', 'POST /api/ecign/instances/:id/void'],
      components: ['FormSignatureFlow.SecondSignatureModal'],
    },
  },
  {
    slug: 'navigation',
    title: 'Navigation & Workspace Layout',
    category: 'getting-started',
    purpose: 'CI-App uses a single-pane shell with a left command rail and a two-panel content area: document on the left, audit/signer/workflow context on the right.',
    whenToUse: 'Always — this is the design contract. No workflow uses hidden navigation or layered cards.',
    systemBehavior: 'Routes: `/dashboard` (Command Center) · `/forms` (forms dashboard) · `/forms/:id` (signing workspace) · `/audit` (admin compliance view) · `/help` (this Help Center) · `/workflows` · `/library` · `/calendar` (Master Calendar).',
    complianceImpact: 'Visibility supports the "all critical data within 1–2 interactions" rule from §01 Design Enforcement.',
    evidence: 'No persisted artifact — UI behavior only.',
    related: { components: ['CommandCenterLayout', 'UniversalNavControls'] },
  },
];
