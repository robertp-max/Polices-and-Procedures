// Pure projection: derives the "Annual Governance Forms" workspace list from
// CANONICAL data only. No new form IDs, no invented titles/content — every
// field here traces back to FORMS_DATASET / formsLibraryContent / policyCorpus.
//
// Two ways a form enters this list:
//  1. It is linked (via getFormsForPolicy) to one of the five Governing Body
//     charter policies GV-GB-001..005.
//  2. It is one of the explicitly named GB/CO/EN forms the Governing Body is
//     accountable for even though FORMS_DATASET ties them to a non-GV-GB
//     policy (e.g. the enterprise-wide compliance attestations).
//
// If a form id from either source is absent from FORMS_DATASET, it is
// dropped rather than fabricated, and callers can see that via
// buildGovernanceFormListDiagnostics().

import { FORMS_DATASET, type FormRecord } from '@/policy/data/formsLibraryDataset';
import { buildFormContent } from '@/policy/data/formsLibraryContent';
import { resolveCanonicalFormId, resolveFormTitle } from '@/policy/data/formIdAliases';
import { getFormById, getFormsForPolicy, isPolicyId } from '@/policy/utils/policyFormLinks';
import { getCorpusPolicy } from '@/policy/data/policyCorpus';

/** The five Governing Body charter policies (GV-GB domain). */
export const GB_CHARTER_POLICY_IDS = [
  'GV-GB-001',
  'GV-GB-002',
  'GV-GB-003',
  'GV-GB-004',
  'GV-GB-005',
] as const;

/**
 * Explicitly named GB/CO/EN forms the Governing Body workspace must surface
 * per the §7 spec, in addition to whatever getFormsForPolicy(GV-GB-*) already
 * returns. Every id must exist in FORMS_DATASET — verified at build time by
 * buildGovernanceFormListDiagnostics().
 */
export const KNOWN_GB_FORM_IDS = [
  'GV-FM-006', // Conflict of Interest Disclosure
  'GV-FM-008', // GB Annual Self-Assessment Tool
  'GV-FM-012', // Executive Session Confidentiality Agreement
  'GV-FM-023', // Annual Compliance Report to GB
  'GV-FM-024', // GB Training & Education Log
  'CO-FM-001', // Annual Compliance Program Attestation
  'CO-FM-010', // Anti-Kickback Attestation
  'EN-FM-001', // Universal Policy Acknowledgment
  'EN-FM-036', // Annual Department Compliance Attestation
] as const;

export interface LinkedPolicyRef {
  id: string;
  title: string;
  /** True only when `id` resolved against the real policy corpus. */
  isCorpusPolicy: boolean;
}

export interface GovernanceFormEntry {
  id: string;
  title: string;
  type: string;
  domainCode: string;
  usage: string;
  /** Real recurrence cadence from the canonical dataset (e.g. "Annual", "Triggered"). Never a fabricated due date. */
  frequency: string;
  classifications: string[];
  /** Purpose statement copied verbatim from the canonical form content — never invented. */
  whyRequired: string;
  /** Signer roles copied verbatim from the canonical form's signature block. Empty when none are defined. */
  whoSigns: string[];
  linkedPolicies: LinkedPolicyRef[];
  /** Which of the 5 GV-GB charter policies pulled this form into the list (empty if only via KNOWN_GB_FORM_IDS). */
  matchedViaGbPolicies: string[];
  /** False only if canonical form content could not be derived (surfaced honestly, never papered over). */
  mappingComplete: boolean;
}

export interface GovernanceFormGroup {
  domainCode: string;
  label: string;
  entries: GovernanceFormEntry[];
}

const DOMAIN_GROUP_LABELS: Record<string, string> = {
  GV: 'Governing Body Charter & Oversight Forms',
  CO: 'Compliance Program Attestations',
  EN: 'Enterprise-Wide Attestations',
};

function linkedPolicyRefs(policies: string[]): LinkedPolicyRef[] {
  return policies.map((p) => {
    const corpus = isPolicyId(p) ? getCorpusPolicy(p) : undefined;
    return { id: p, title: corpus?.title ?? p, isCorpusPolicy: !!corpus };
  });
}

function projectForm(rec: FormRecord, matchedViaGbPolicies: string[]): GovernanceFormEntry {
  const canonicalId = resolveCanonicalFormId(rec.id) ?? rec.id;
  const title = resolveFormTitle(canonicalId);

  let whyRequired = '';
  let whoSigns: string[] = [];
  let mappingComplete = true;
  try {
    const content = buildFormContent(rec);
    whyRequired = content.purpose;
    whoSigns = (content.signatures ?? []).map((s) => s.role);
  } catch {
    mappingComplete = false;
    whyRequired = 'Mapping unavailable — canonical form content could not be derived for this record.';
  }

  return {
    id: canonicalId,
    title,
    type: rec.type,
    domainCode: rec.domainCode,
    usage: rec.usage,
    frequency: rec.frequency,
    classifications: rec.classifications,
    whyRequired,
    whoSigns,
    linkedPolicies: linkedPolicyRefs(rec.policies),
    matchedViaGbPolicies,
    mappingComplete,
  };
}

/** Build the full, deduplicated, sorted GB form list from canonical sources only. */
export function buildGovernanceFormList(): GovernanceFormEntry[] {
  const matchedVia = new Map<string, Set<string>>();

  for (const policyId of GB_CHARTER_POLICY_IDS) {
    for (const f of getFormsForPolicy(policyId)) {
      if (!matchedVia.has(f.id)) matchedVia.set(f.id, new Set());
      matchedVia.get(f.id)!.add(policyId);
    }
  }

  for (const formId of KNOWN_GB_FORM_IDS) {
    if (!matchedVia.has(formId)) matchedVia.set(formId, new Set());
  }

  const entries: GovernanceFormEntry[] = [];
  for (const [formId, viaSet] of matchedVia) {
    const rec = getFormById(formId) ?? FORMS_DATASET.find((f) => f.id === formId);
    if (!rec) continue; // never fabricate a form that isn't in the canonical dataset
    entries.push(projectForm(rec, [...viaSet].sort()));
  }

  return entries.sort((a, b) => a.id.localeCompare(b.id));
}

/** Group the flat list into sensible sections for the workspace UI. */
export function groupGovernanceForms(entries: GovernanceFormEntry[]): GovernanceFormGroup[] {
  const byDomain = new Map<string, GovernanceFormEntry[]>();
  for (const e of entries) {
    if (!byDomain.has(e.domainCode)) byDomain.set(e.domainCode, []);
    byDomain.get(e.domainCode)!.push(e);
  }
  const domainOrder = ['GV', 'CO', 'EN'];
  const domains = [...byDomain.keys()].sort(
    (a, b) => (domainOrder.indexOf(a) === -1 ? 99 : domainOrder.indexOf(a)) - (domainOrder.indexOf(b) === -1 ? 99 : domainOrder.indexOf(b)),
  );
  return domains.map((domainCode) => ({
    domainCode,
    label: DOMAIN_GROUP_LABELS[domainCode] ?? `${domainCode} Forms`,
    entries: byDomain.get(domainCode)!,
  }));
}

/** Diagnostics: any explicitly named id that FORMS_DATASET does not actually contain. Should always be empty; kept for honest self-verification, not shown to end users. */
export function buildGovernanceFormListDiagnostics(): { missingKnownFormIds: string[] } {
  const missingKnownFormIds = KNOWN_GB_FORM_IDS.filter((id) => !getFormById(id));
  return { missingKnownFormIds };
}
