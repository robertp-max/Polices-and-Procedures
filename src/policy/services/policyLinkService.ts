/* ═══════════════════════════════════════════════════════════════════
   Policy Link Service — Phase 11
   ───────────────────────────────────────────────────────────────────
   Single source of truth for the "Linked Policy / Procedure
   (Required)" contract that gates every form submit, signature,
   certificate, print, and download in the system.

   Contract (mirrored in Builder/eCIgn and the Phase 11 spec):
     • Every signed artifact MUST reference ≥ 1 Policy/Procedure.
     • Universal Acknowledgment (EN-FM-001) MUST NOT default to all
       policies — selection is always explicit.
     • Acceptable sources for the *initial* selection:
         – Policy Viewer  → pre-fill with that policy (editable)
         – Task / Obligation → inherit parent linkedPolicyIds
         – Forms Library  → no default; user must select
   ═══════════════════════════════════════════════════════════════ */

import { frameworkPolicies, frameworkPolicyVersions } from '@/policy/data/frameworkSeedData';
import { emit } from '@/policy/security/auditLog';
import { DEMO_SESSION } from '@/policy/components/FormSignatureContext';

/* ── Public types ─────────────────────────────────────────────── */

export interface PolicyLinkMeta {
  id:            string;          // e.g. 'CL-CP-001'
  title:         string;
  version:       string;          // e.g. 'v6.0'
  domainCode:    string;
  effectiveDate: string;          // ISO date (yyyy-mm-dd)
}

export interface PolicyLinkValidationResult {
  ok:    boolean;
  error: string | null;           // user-facing message (null when ok)
  code:  'OK' | 'POLICY_LINK_REQUIRED';
}

export type PolicyLinkSource =
  | 'policy_viewer'   // opened from Policy Viewer → pre-fill that policy
  | 'task'            // opened from a Task/Obligation → inherit parent links
  | 'forms_library'   // opened from Forms Library → NO default; user must pick
  | 'workflow';       // opened from a Workflow step → inherit step links

/* ── Static index, built once ─────────────────────────────────── */

interface IndexedPolicy {
  meta:           PolicyLinkMeta;
  searchHaystack: string;          // lower-cased combined search blob
}

const INDEX: IndexedPolicy[] = (() => {
  const versionByPolicy = new Map<string, { version: string; effectiveDate: string }>();
  for (const v of frameworkPolicyVersions) {
    versionByPolicy.set(v.policyId, {
      version:       v.version,
      effectiveDate: v.effectiveDate,
    });
  }
  return frameworkPolicies.map(p => {
    const v = versionByPolicy.get(p.id);
    const meta: PolicyLinkMeta = {
      id:            p.id,
      title:         p.title,
      version:       v?.version ?? p.currentVersion,
      domainCode:    p.domainCode,
      effectiveDate: v?.effectiveDate ?? '',
    };
    const haystack = [
      p.id, p.title, p.domainCode, p.subdomainCode,
      p.description ?? '',
    ].join(' ').toLowerCase();
    return { meta, searchHaystack: haystack };
  });
})();

const META_BY_ID = new Map<string, PolicyLinkMeta>(
  INDEX.map(x => [x.meta.id, x.meta]),
);

/* ── Search / lookup ──────────────────────────────────────────── */

export function getPolicyMeta(policyId: string): PolicyLinkMeta | undefined {
  return META_BY_ID.get(policyId);
}

export function resolvePolicyMetaList(policyIds: readonly string[]): PolicyLinkMeta[] {
  const out: PolicyLinkMeta[] = [];
  for (const id of policyIds) {
    const meta = META_BY_ID.get(id);
    if (meta) out.push(meta);
    else out.push({ id, title: id, version: '—', domainCode: id.slice(0, 2), effectiveDate: '' });
  }
  return out;
}

/** Typeahead — matches against policy ID, title, domain, keywords. */
export function searchPolicies(query: string, opts?: { limit?: number; exclude?: readonly string[] }): PolicyLinkMeta[] {
  const limit  = opts?.limit ?? 25;
  const exclude = new Set(opts?.exclude ?? []);
  const q = query.trim().toLowerCase();
  if (!q) {
    return INDEX
      .filter(x => !exclude.has(x.meta.id))
      .slice(0, limit)
      .map(x => x.meta);
  }
  const matches: { score: number; meta: PolicyLinkMeta }[] = [];
  for (const x of INDEX) {
    if (exclude.has(x.meta.id)) continue;
    const idMatch    = x.meta.id.toLowerCase().includes(q);
    const titleMatch = x.meta.title.toLowerCase().includes(q);
    const hayMatch   = x.searchHaystack.includes(q);
    if (!idMatch && !titleMatch && !hayMatch) continue;
    // Score: ID exact > ID prefix > title prefix > anywhere
    let score = 0;
    if (x.meta.id.toLowerCase() === q) score += 1000;
    else if (x.meta.id.toLowerCase().startsWith(q)) score += 500;
    else if (idMatch) score += 250;
    if (x.meta.title.toLowerCase().startsWith(q)) score += 100;
    else if (titleMatch) score += 50;
    if (hayMatch) score += 1;
    matches.push({ score, meta: x.meta });
  }
  matches.sort((a, b) => b.score - a.score || a.meta.id.localeCompare(b.meta.id));
  return matches.slice(0, limit).map(m => m.meta);
}

/* ── Validation (HARD GATE) ───────────────────────────────────── */

export function validatePolicyLinks(
  linkedPolicyIds: readonly string[] | undefined | null,
): PolicyLinkValidationResult {
  const list = (linkedPolicyIds ?? []).filter(Boolean);
  if (list.length === 0) {
    return {
      ok:    false,
      error: 'Policy/Procedure link is required before submission.',
      code:  'POLICY_LINK_REQUIRED',
    };
  }
  return { ok: true, error: null, code: 'OK' };
}

/** Acknowledgment-flavoured error copy (per spec). */
export function validateAcknowledgmentLinks(
  linkedPolicyIds: readonly string[] | undefined | null,
): PolicyLinkValidationResult {
  const result = validatePolicyLinks(linkedPolicyIds);
  if (!result.ok) {
    return { ...result, error: 'Select at least one Policy/Procedure to acknowledge.' };
  }
  return result;
}

/* ── Auto-link defaults per source ────────────────────────────── */

export interface AutoLinkContext {
  source:               PolicyLinkSource;
  /** Policy currently being viewed (Policy Viewer). */
  viewerPolicyId?:      string;
  /** linkedPolicyIds carried by the parent task/obligation. */
  inheritedPolicyIds?:  readonly string[];
  /** Policy IDs hard-coded on a workflow step. */
  workflowPolicyIds?:   readonly string[];
  /**
   * Forms whose default-policies set should ALWAYS be ignored — e.g.
   * the Universal Acknowledgment form (EN-FM-001) which must never
   * default to "ALL (270 Policies)". List is intentionally minimal;
   * extend as required.
   */
  formId?:              string;
}

const BLOCKED_DEFAULT_FORM_IDS = new Set<string>([
  'EN-FM-001', // Universal Policy Acknowledgment Form
]);

export function isUniversalAcknowledgmentForm(formId: string | undefined): boolean {
  return !!formId && BLOCKED_DEFAULT_FORM_IDS.has(formId);
}

export function computeDefaultLinkedPolicyIds(ctx: AutoLinkContext): string[] {
  // Universal acknowledgment NEVER defaults to anything regardless of source.
  if (isUniversalAcknowledgmentForm(ctx.formId)) return [];
  switch (ctx.source) {
    case 'policy_viewer':
      return ctx.viewerPolicyId ? [ctx.viewerPolicyId] : [];
    case 'task':
      return [...(ctx.inheritedPolicyIds ?? [])].filter(Boolean);
    case 'workflow':
      return [...(ctx.workflowPolicyIds ?? [])].filter(Boolean);
    case 'forms_library':
    default:
      return [];
  }
}

/* ── Audit emission ───────────────────────────────────────────── */

export type PolicyLinkAuditAction =
  | 'POLICY_LINK_ADDED'
  | 'POLICY_LINK_REMOVED'
  | 'POLICY_LINK_VALIDATED';

export interface PolicyLinkAuditTarget {
  /** Form / artifact / acknowledgment instance ID. */
  artifactId:   string;
  artifactKind: 'form' | 'signature' | 'acknowledgment' | 'task';
  /** Optional parent (task ID, workflow instance ID). */
  parentId?:    string;
}

export interface PolicyLinkAuditPayload {
  action:           PolicyLinkAuditAction;
  target:           PolicyLinkAuditTarget;
  policyIds:        readonly string[];
  source?:          PolicyLinkSource;
  validationResult?: PolicyLinkValidationResult;
}

/** Fire-and-forget audit emission — never throws (logged on error). */
export function emitPolicyLinkAudit(p: PolicyLinkAuditPayload): void {
  void (async () => {
    try {
      await emit({
        actor: {
          kind:   'user',
          userId: DEMO_SESSION.id,
        },
        action:   p.action,
        category: 'policy',
        target: {
          kind:     p.target.artifactKind === 'form' ? 'form'
                  : p.target.artifactKind === 'signature' ? 'signature'
                  : p.target.artifactKind === 'task' ? 'system'
                  : 'form',
          id:       p.target.artifactId,
          parentId: p.target.parentId,
        },
        after: {
          policyIds: [...p.policyIds],
          source:    p.source,
          validation: p.validationResult ? {
            ok:   p.validationResult.ok,
            code: p.validationResult.code,
          } : undefined,
        },
        context: {
          requestId:     `req_${Date.now().toString(36)}`,
          correlationId: p.target.artifactId,
          phi:           false,
        },
      });
    } catch (err) {
      // Audit emission failures must not break the UI flow; surface to console only.
      // eslint-disable-next-line no-console
      console.warn('[policyLink] audit emission failed', err);
    }
  })();
}
