import { getCorpusPolicy } from '@/policy/data/policyCorpus';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { getFormsForPolicy } from '@/policy/utils/policyFormLinks';
import type { Policy, PolicyContentSection } from '@/policy/types';
import type { PolicyViewer32Metadata, PolicyViewer32Model, PolicyViewer32Section } from './PolicyViewer32Types';

const DOMAIN_FULLNAME: Record<string, string> = {
  GV: 'GV - Governance & Administration',
  CL: 'CL - Clinical Operations',
  QA: 'QA - Quality Assessment & Performance Improvement',
  HR: 'HR - Human Resources',
  CO: 'CO - Compliance & Regulatory',
  FN: 'FN - Finance & Revenue Cycle',
  OP: 'OP - Operations & Facilities',
  IT: 'IT - Information Technology & Security',
  RM: 'RM - Risk Management & Safety',
  EN: 'EN - Enterprise Governance & Control',
};

const HEADER_FIELD_MAP: Record<string, keyof PolicyViewer32Metadata> = {
  'policy id': 'id',
  'policy title': 'title',
  domain: 'domain',
  subdomain: 'subdomain',
  'classification tier': 'tier',
  status: 'status',
  'review cycle': 'reviewCycle',
  'policy owner / steward': 'owner',
  'effective date': 'effectiveDate',
  version: 'version',
  'approved by': 'approvedBy',
  'last reviewed': 'lastReviewed',
  'next review date': 'nextReview',
  supersedes: 'supersedes',
};

function cleanTitle(title: string): string {
  return title
    .replace(/\\\./g, '.')
    .replace(/^\d+(\.\d+)*\s*[-.)]?\s*/, '')
    .trim();
}

function normalize(value: string): string {
  return cleanTitle(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripMarkdownNoise(body: string): string {
  return body
    .split('\n')
    .filter(line => line.trim() !== '---')
    .join('\n')
    .trim();
}

function parseHeaderFields(sections: PolicyContentSection[]): Partial<PolicyViewer32Metadata> {
  const header = sections.find(section => normalize(section.title).includes('policy header'));
  if (!header) return {};

  return header.body.split('\n').reduce<Partial<PolicyViewer32Metadata>>((acc, line) => {
    const cells = line
      .split('|')
      .map(cell => cell.trim())
      .filter(Boolean);
    if (cells.length < 2 || cells[0].toLowerCase() === 'field' || cells[0].startsWith(':')) {
      return acc;
    }
    const key = HEADER_FIELD_MAP[cells[0].toLowerCase()];
    if (key) acc[key] = cells.slice(1).join(' | ');
    return acc;
  }, {});
}

function toViewerSection(section: PolicyContentSection): PolicyViewer32Section {
  return {
    id: section.id,
    title: cleanTitle(section.title),
    body: stripMarkdownNoise(section.body),
    order: section.order,
  };
}

function byOrder(a: PolicyViewer32Section, b: PolicyViewer32Section): number {
  return a.order - b.order;
}

function includesAny(value: string, fragments: string[]): boolean {
  return fragments.some(fragment => value.includes(fragment));
}

function classifySections(sections: PolicyViewer32Section[]) {
  const buckets = {
    purpose: [] as PolicyViewer32Section[],
    scope: [] as PolicyViewer32Section[],
    definitions: [] as PolicyViewer32Section[],
    statements: [] as PolicyViewer32Section[],
    procedures: [] as PolicyViewer32Section[],
    documentation: [] as PolicyViewer32Section[],
    compliance: [] as PolicyViewer32Section[],
    references: [] as PolicyViewer32Section[],
    appendices: [] as PolicyViewer32Section[],
  };

  const referenceKeywords = [
    'reference',
    'admin',
    'training',
    'version control',
    'review cycle',
    'cross reference',
    'revision',
    'reaffirmation',
    'change log',
    'version history',
    'scheduled review',
    'document control',
    'policy review',
    'faq',
    'frequently asked',
    'common question',
    'q and a',
    'notes',
    'note to',
  ];

  const documentationKeywords = ['documentation', 'required record', 'record requirement'];
  const complianceKeywords = ['compliance', 'audit', 'surveyor', 'failure point', 'monitoring', 'measurement'];
  const appendixKeywords = ['appendix', 'appendices', 'attachment', 'attachments', 'exhibit']; // 'form' removed — handled by exact token only below (prevents performance/information/informed/confirmation pollution)

  sections.forEach(section => {
    const title = normalize(section.title);
    if (title.includes('policy header')) return;
    if (title.includes('purpose')) buckets.purpose.push(section);
    else if (title.includes('scope')) buckets.scope.push(section);
    else if (title.includes('definition')) buckets.definitions.push(section);
    else if (title.includes('policy statement')) buckets.statements.push(section);
    else if (title.includes('procedure')) buckets.procedures.push(section);
    else if (includesAny(title, referenceKeywords)) buckets.references.push(section);
    else if (includesAny(title, documentationKeywords)) buckets.documentation.push(section);
    else if (includesAny(title, complianceKeywords)) buckets.compliance.push(section);
    else if (includesAny(title, appendixKeywords) || isExactAppendixFormToken(title)) {
      buckets.appendices.push(section);
    }
    else buckets.documentation.push(section);
  });

  Object.values(buckets).forEach(bucket => bucket.sort(byOrder));
  return buckets;
}

// Surgical word-boundary safe helper (exact tokens post-normalize).
// Deprioritizes 'form'/'forms' to standalone only. Prevents "performance", "information", "informed", "confirmation" etc. pollution into Appendices.
// Real appendices (e.g. "APPENDICES", "31-appendices") continue to match via 'appendix'/'appendices' tokens.
// Unknown sections still land in visible Documentation bucket.
function isExactAppendixFormToken(title: string): boolean {
  const tokens = title.split(/\s+/).filter(Boolean);
  if (tokens.includes('form') || tokens.includes('forms')) return true;
  return false;
}

export function buildPolicyViewer32Model(policyId: string, storePolicy?: Policy): PolicyViewer32Model | null {
  const normalizedPolicyId = decodeURIComponent(policyId).toUpperCase();
  const corpusPolicy = getCorpusPolicy(normalizedPolicyId);
  const content = getPolicyContent(normalizedPolicyId);

  if (!corpusPolicy && !storePolicy && !content) return null;

  const contentSections = content?.sections ?? [];
  const headerFields = parseHeaderFields(contentSections);
  const domainCode = storePolicy?.domainCode ?? corpusPolicy?.domainCode ?? normalizedPolicyId.split('-')[0] ?? '';
  const subdomainCode = storePolicy?.subdomainCode ?? corpusPolicy?.subdomainCode ?? normalizedPolicyId.split('-')[1] ?? '';
  const currentVersion = storePolicy?.currentVersion ?? headerFields.version ?? '1.0';
  const createdDate = storePolicy?.createdAt?.slice(0, 10) ?? '';
  const updatedDate = storePolicy?.updatedAt?.slice(0, 10) ?? '';

  const metadata: PolicyViewer32Metadata = {
    id: headerFields.id ?? storePolicy?.id ?? corpusPolicy?.id ?? normalizedPolicyId,
    title: headerFields.title ?? storePolicy?.title ?? corpusPolicy?.title ?? normalizedPolicyId,
    domain: headerFields.domain ?? DOMAIN_FULLNAME[domainCode] ?? domainCode,
    subdomain: headerFields.subdomain ?? subdomainCode,
    tier: headerFields.tier ?? storePolicy?.tier ?? corpusPolicy?.tier ?? 'Unavailable',
    status: headerFields.status ?? storePolicy?.lifecycleStatus ?? 'Unavailable',
    approvedBy: headerFields.approvedBy ?? 'Unavailable',
    supersedes: headerFields.supersedes ?? 'Unavailable',
    effectiveDate: headerFields.effectiveDate ?? createdDate,
    lastReviewed: headerFields.lastReviewed ?? updatedDate,
    nextReview: headerFields.nextReview ?? '',
    version: currentVersion.startsWith('v') ? currentVersion : `v${currentVersion}`,
    owner: headerFields.owner ?? storePolicy?.ownerSteward ?? corpusPolicy?.ownerSteward ?? 'Unavailable',
    reviewCycle: headerFields.reviewCycle ?? storePolicy?.reviewCycle ?? 'Unavailable',
  };

  const allSections = contentSections.map(toViewerSection).sort(byOrder);
  const buckets = classifySections(allSections);

  return {
    metadata,
    ...buckets,
    forms: getFormsForPolicy(metadata.id),
    allSections,
    missingContent: !content,
  };
}
