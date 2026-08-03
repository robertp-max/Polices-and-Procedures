/**
 * ADR-0002 Phase 5A — server-authoritative signature-role catalog + fail-closed
 * alias reconciliation.
 *
 * Two INDEPENDENT axes (ADR §B7), never collapsed:
 *   A. Workflow participation role — the role a principal plays in a workflow
 *      instance (Assignee / Required Signer / Approver / Reviewer / Watcher /
 *      Administrator / Auditor). No single enum existed in the codebase; this is
 *      the canonical one.
 *   B. Business/legal signature capacity — the authority under which a signature
 *      is made (Director of Nursing, Administrator, Compliance Officer, …). Drawn
 *      from the canonical eCIgn SignerRole vocabulary.
 *
 * Alias reconciliation is FAIL-CLOSED. The legacy `normalizeSignerRole` silently
 * defaults any unknown label to 'Assigned Owner'; that is unsafe for authority
 * decisions. Here an unknown label resolves to `matched: false` and the caller
 * MUST reject it. We reuse `normalizeSignerRole` (the single alias source) via a
 * sentinel fallback so there is no duplicated alias table.
 */
import { normalizeSignerRole } from '@/policy/ecign/signerHierarchy';
import type { SignerRole } from '@/policy/ecign/types';

/** Axis A — workflow participation role. */
export const WORKFLOW_PARTICIPATION_ROLES = [
  'Assignee', 'Required Signer', 'Approver', 'Reviewer', 'Watcher', 'Administrator', 'Auditor',
] as const;
export type WorkflowParticipationRole = (typeof WORKFLOW_PARTICIPATION_ROLES)[number];

export function isWorkflowParticipationRole(x: string): x is WorkflowParticipationRole {
  return (WORKFLOW_PARTICIPATION_ROLES as readonly string[]).includes(x);
}

/** Axis B — business/legal signature capacity (the canonical SignerRole set). */
export type BusinessSignatureCapacity = SignerRole;

export const BUSINESS_SIGNATURE_CAPACITIES: readonly SignerRole[] = [
  'Assigned Owner', 'Scribe', 'Data Analyst / Quality Source', 'Clinical Manager',
  'Clinical Reviewer', 'Director of Nursing', 'QAPI Lead / Chair', 'Compliance Officer',
  'Infection Preventionist', 'Committee / Voting Members', 'Administrator', 'Administrator Designee',
  'Governing Body', 'Governing Body Chair', 'Board Chair', 'HR', 'Supervisor', 'Employee',
  'Workforce Member', 'Finance', 'Finance / CFO', 'Operations', 'Operations Director',
  'IT / Security', 'IT Director / CISO', 'Risk Manager', 'Domain Owner', 'Requester',
  'Evidence / eCIgn System',
];

const CAPACITY_SET: ReadonlySet<string> = new Set(BUSINESS_SIGNATURE_CAPACITIES);

/** QAPI acceptance-case capacities (ADR §5 — a concrete test case, not the
 *  universal catalog). */
export const QAPI_SIGNATURE_CAPACITIES: readonly SignerRole[] = [
  'Director of Nursing', 'Administrator', 'Compliance Officer', 'Governing Body Chair',
];

/** Sentinel that is deliberately NOT a valid capacity, used to detect an
 *  unresolved label without inheriting the legacy 'Assigned Owner' default. */
const UNRESOLVED_SENTINEL = '__ci_unresolved_capacity__';

export interface CapacityResolution {
  matched: boolean;
  capacity: SignerRole | null;
  via: 'canonical' | 'alias' | 'unresolved';
  raw: string;
}

/**
 * Reconcile an arbitrary signer label to a canonical business capacity.
 * FAIL-CLOSED: an unknown label yields `{ matched: false, via: 'unresolved' }`.
 */
export function resolveSignatureCapacity(raw: string | undefined | null): CapacityResolution {
  const input = String(raw ?? '').trim();
  if (!input) return { matched: false, capacity: null, via: 'unresolved', raw: input };
  if (CAPACITY_SET.has(input)) return { matched: true, capacity: input as SignerRole, via: 'canonical', raw: input };
  const norm = normalizeSignerRole(input, UNRESOLVED_SENTINEL as SignerRole);
  if ((norm as string) === UNRESOLVED_SENTINEL) {
    return { matched: false, capacity: null, via: 'unresolved', raw: input };
  }
  return { matched: true, capacity: norm, via: 'alias', raw: input };
}
