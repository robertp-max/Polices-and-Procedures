import type { SignerHierarchyRule, SignerRole } from './types';

const ROLE_ALIASES: Record<string, SignerRole> = {
  'administrator': 'Administrator',
  'administrator designee': 'Administrator Designee',
  'assigned owner': 'Assigned Owner',
  'board chair': 'Governing Body Chair',
  'chair': 'QAPI Lead / Chair',
  'chief financial officer': 'Finance / CFO',
  'cfo': 'Finance / CFO',
  'clinical manager': 'Clinical Manager',
  'clinical reviewer': 'Clinical Reviewer',
  'compliance': 'Compliance Officer',
  'compliance officer': 'Compliance Officer',
  'committee': 'Committee / Voting Members',
  'committee members': 'Committee / Voting Members',
  'committee / voting members': 'Committee / Voting Members',
  'completed by': 'Assigned Owner',
  'data analyst': 'Data Analyst / Quality Source',
  'data analyst / quality source': 'Data Analyst / Quality Source',
  'director of nursing': 'Director of Nursing',
  'domain owner': 'Domain Owner',
  'don': 'Director of Nursing',
  'employee': 'Employee',
  'evidence / ecign system': 'Evidence / eCIgn System',
  'finance': 'Finance',
  'finance / cfo': 'Finance / CFO',
  'governing body': 'Governing Body',
  'governing body chair': 'Governing Body Chair',
  'hr': 'HR',
  'infection preventionist': 'Infection Preventionist',
  'information security officer': 'IT / Security',
  'it / security': 'IT / Security',
  'it director / ciso': 'IT Director / CISO',
  'medical director': 'Clinical Reviewer',
  'operations': 'Operations',
  'operations director': 'Operations Director',
  'policy owner': 'Assigned Owner',
  'qapi chair': 'QAPI Lead / Chair',
  'qapi committee chair': 'QAPI Lead / Chair',
  'qapi lead': 'QAPI Lead / Chair',
  'qapi lead / chair': 'QAPI Lead / Chair',
  'requester': 'Requester',
  'reviewer': 'Clinical Reviewer',
  'risk manager': 'Risk Manager',
  'scribe': 'Scribe',
  'self': 'Assigned Owner',
  'staff rn': 'Assigned Owner',
  'supervisor': 'Supervisor',
  'witness / administrator': 'Administrator',
  'workforce member': 'Workforce Member',
};

export const SIGNER_HIERARCHY_RULES: SignerHierarchyRule[] = [
  {
    domain: 'Governance',
    ownerRole: 'Administrator',
    reviewerRoles: ['Administrator'],
    signerRoles: ['Governing Body Chair'],
    finalApproverRoles: ['Governing Body'],
    governingBodyRequired: true,
  },
  {
    domain: 'Clinical',
    ownerRole: 'Assigned Owner',
    reviewerRoles: ['Clinical Manager'],
    signerRoles: ['Clinical Manager', 'Director of Nursing'],
    finalApproverRoles: ['Administrator'],
  },
  {
    domain: 'QAPI',
    ownerRole: 'QAPI Lead / Chair',
    reviewerRoles: [
      'Clinical Manager',
      'Compliance Officer',
      'Infection Preventionist',
      'Data Analyst / Quality Source',
    ],
    signerRoles: ['QAPI Lead / Chair'],
    finalApproverRoles: ['Governing Body'],
  },
  {
    domain: 'Compliance',
    ownerRole: 'Compliance Officer',
    reviewerRoles: ['Administrator'],
    signerRoles: ['Compliance Officer'],
    finalApproverRoles: ['Administrator', 'Governing Body'],
  },
  {
    domain: 'HR',
    ownerRole: 'HR',
    reviewerRoles: ['Administrator', 'Supervisor'],
    signerRoles: ['Employee', 'Supervisor', 'HR', 'Administrator'],
    finalApproverRoles: ['Administrator'],
  },
  {
    domain: 'Finance',
    ownerRole: 'Finance',
    reviewerRoles: ['Finance / CFO'],
    signerRoles: ['Finance / CFO', 'Administrator'],
    finalApproverRoles: ['Governing Body'],
  },
  {
    domain: 'Operations',
    ownerRole: 'Operations',
    reviewerRoles: ['Administrator', 'Operations Director'],
    signerRoles: ['Operations Director', 'Administrator'],
    finalApproverRoles: ['Administrator'],
  },
  {
    domain: 'IT / Security',
    ownerRole: 'IT / Security',
    reviewerRoles: ['IT Director / CISO', 'Compliance Officer'],
    signerRoles: ['IT / Security', 'Compliance Officer'],
    finalApproverRoles: ['Administrator', 'Governing Body'],
  },
  {
    domain: 'Risk',
    ownerRole: 'Risk Manager',
    reviewerRoles: ['Compliance Officer', 'Administrator'],
    signerRoles: ['Risk Manager', 'Administrator'],
    finalApproverRoles: ['Governing Body'],
  },
  {
    domain: 'Enterprise',
    ownerRole: 'Administrator',
    reviewerRoles: ['Compliance Officer'],
    signerRoles: ['Administrator'],
    finalApproverRoles: ['Governing Body'],
  },
];

function normalizeLookup(value: string) {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

export function normalizeSignerRole(input?: string, fallback: SignerRole = 'Assigned Owner'): SignerRole {
  const normalized = normalizeLookup(String(input ?? ''));
  if (!normalized) return fallback;
  return ROLE_ALIASES[normalized] ?? fallback;
}

export function signerRoleSlug(role: string) {
  return role
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'unspecified';
}

export function normalizeSignerDomain(input?: string) {
  const normalized = normalizeLookup(String(input ?? ''));
  if (!normalized) return 'Enterprise';
  if (normalized === 'gv' || normalized === 'governance') return 'Governance';
  if (normalized === 'cl' || normalized === 'clinical') return 'Clinical';
  if (normalized === 'qa' || normalized === 'qapi') return 'QAPI';
  if (normalized === 'co' || normalized === 'compliance') return 'Compliance';
  if (normalized === 'hr') return 'HR';
  if (normalized === 'fn' || normalized === 'finance') return 'Finance';
  if (normalized === 'op' || normalized === 'operations') return 'Operations';
  if (normalized === 'it' || normalized === 'is' || normalized === 'it/security' || normalized === 'it / security') return 'IT / Security';
  if (normalized === 'rm' || normalized === 'risk') return 'Risk';
  if (normalized === 'en' || normalized === 'enterprise') return 'Enterprise';
  return input ?? 'Enterprise';
}

export function resolveSignerHierarchyRule(input?: string): SignerHierarchyRule {
  const domain = normalizeSignerDomain(input);
  return SIGNER_HIERARCHY_RULES.find(rule => rule.domain === domain) ?? SIGNER_HIERARCHY_RULES[SIGNER_HIERARCHY_RULES.length - 1];
}

export function uniqueSignerRoles(roles: Array<SignerRole | undefined>) {
  const seen = new Set<string>();
  const values: SignerRole[] = [];
  roles.forEach(role => {
    if (!role) return;
    const key = role.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    values.push(role);
  });
  return values;
}
