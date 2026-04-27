/**
 * PolicyLibraryDocumentView.tsx
 * Shared, reusable embed of the /library policy detail rendering.
 *
 * Wraps SharedPolicyDetailView (the same component /library uses) and
 * accepts a policyId; constructs a SharedPolicy view-model from the
 * authoritative policy corpus and renders the full multi-tab document
 * inside any host container.
 *
 * Used by:
 *   - /library policy detail (via the LibraryPage adapter — unchanged)
 *   - /policy-lifecycle View mode (this is the canonical embed)
 */

import { SharedPolicyDetailView, type SharedPolicy } from '@/policy/components/SharedPolicyDetailView';
import { getCorpusPolicy } from '@/policy/data/policyCorpus';

// ── Domain → human-readable label (mirrors LibraryPage DOMAINS table) ──────
const DOMAIN_FULLNAME: Record<string, string> = {
  GV: 'GV — Governance & Administration',
  CL: 'CL — Clinical Operations',
  QA: 'QA — Quality Assessment & Performance Improvement',
  HR: 'HR — Human Resources',
  CO: 'CO — Compliance & Regulatory',
  FN: 'FN — Finance & Revenue Cycle',
  OP: 'OP — Operations & Facilities',
  IT: 'IT — Information Technology & Security',
  RM: 'RM — Risk Management & Safety',
  EN: 'EN — Enterprise Governance & Control',
};

// ── Tag mapping (mirrors LibraryPage.getTagsForPolicy) ─────────────────────
function matchesPattern(policyId: string, patterns: string[]): boolean {
  return patterns.some(p => p.endsWith('*') ? policyId.startsWith(p.slice(0, -1)) : policyId === p);
}

function getTagsForPolicy(policyId: string): string[] {
  const u = policyId.toUpperCase();
  const tags: string[] = [];
  if (matchesPattern(u, ['GV-EA-004','GV-OG-002','GV-OG-003','HR-TA-001','HR-TA-004','HR-EH-101','RM-OS-101','RM-EP-001','RM-EP-002','FN-BC-001','FN-FP-005'])) tags.push('title22');
  if (matchesPattern(u, ['CO-HP-*','CO-BA-101','CO-IR-101','CO-DG-101','CO-DC-001'])) {
    if (!matchesPattern(u, ['CO-FW-101','CO-AI-101','HR-TR-101','HR-EH-101'])) tags.push('hipaa');
  }
  if (matchesPattern(u, ['FN-BC-001','FN-CM-003','CL-CD-001','QA-PI-002','CO-CP-005','CO-FW-101'])) tags.push('fca');
  if (matchesPattern(u, ['CL-SD-001','CL-SD-002','CL-SD-012','CL-SD-016','CL-SD-017','CL-CD-001','QA-*','HR-TR-101'])) tags.push('cms');
  if (matchesPattern(u, ['CO-*','FN-BC-001','FN-CM-003','CL-CD-001','CL-SD-001','CL-SD-002','QA-*','HR-TA-002','HR-TA-003'])) tags.push('oig');
  if (matchesPattern(u, ['RM-SS-*','RM-OS-101','HR-EH-101'])) tags.push('osha');
  if (matchesPattern(u, ['GV-*','CL-*','QA-*','OP-*'])) tags.push('42cfr');
  return [...new Set(tags)];
}

/**
 * Build the SharedPolicy view-model the same way LibraryPage does, so the
 * lifecycle View renders identical content to /library.
 */
export function buildSharedPolicy(policyId: string): SharedPolicy | null {
  const p = getCorpusPolicy(policyId);
  if (!p) return null;
  const domainName = DOMAIN_FULLNAME[p.domainCode] ?? p.domainCode;
  return {
    id: p.id.toLowerCase(),
    policyId: p.id,
    title: p.title,
    domain: domainName,
    domainCode: p.domainCode,
    subdomain: p.subdomainCode,
    subdomainCode: p.subdomainCode,
    classificationTier: p.tier || 'REQUIRED',
    status: 'ACTIVE',
    version: '6.0',
    effectiveDate: '2025-07-10',
    nextReviewDate: '2026-07-10',
    policyOwner: p.ownerSteward,
    approvedBy: 'Governing Body Chair',
    purpose: `This policy establishes standards for ${p.title} to ensure compliance with enterprise and regulatory requirements.`,
    scope: ['All applicable personnel', 'Management'],
    regulatoryTags: getTagsForPolicy(p.id),
  };
}

export interface PolicyLibraryDocumentViewProps {
  policyId: string;
  /** Render in embedded mode (no "Return to Library" button). */
  embedded?: boolean;
  /** Reserved for future use — currently the component always renders the
   *  same actions (print, download) as /library. */
  showActions?: boolean;
  /** Reserved for future use — appendices tab is always shown. */
  showAppendices?: boolean;
  /** Optional callback invoked when the embedded back button is clicked. */
  onBack?: () => void;
}

export function PolicyLibraryDocumentView({
  policyId,
  embedded = true,
  onBack,
}: PolicyLibraryDocumentViewProps) {
  const shared = buildSharedPolicy(policyId);

  if (!shared) {
    return (
      <div className="px-6 py-8 text-[12px] text-gray-500 bg-white rounded-md border border-gray-200">
        Policy <code className="font-mono">{policyId}</code> is not present in the corpus.
      </div>
    );
  }

  return (
    <SharedPolicyDetailView
      policy={shared}
      embedded={embedded}
      onBack={onBack}
    />
  );
}
