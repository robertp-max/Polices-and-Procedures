/**
 * Regulatory Update Matcher
 *
 * Matches regulatory updates against the internal policy corpus using:
 * 1. Direct policy ID intersection
 * 2. Topic/keyword matching
 * 3. Affected area classification
 *
 * Phase 1: operates against the seed regulatory feed.
 * Phase 2: ingests live CMS transmittals and normalizes to RegulatoryAlert shape.
 */

import type { RegulatoryAlert, IntentKind, RegulatoryAlertSeverity } from '../types.js';
import { SEED_REGULATORY_UPDATES } from './feed.js';

/* ─── Intent → regulatory relevance ────────────────────────────────── */

const REGULATORY_INTENTS = new Set<IntentKind>([
  'pre_survey_audit',
  'governing_body_brief',
  'action_plan',
  'qapi_digest',
  'question',
  'knowledge_article',
]);

/* ─── Keyword → regulatory update hints ────────────────────────────── */

const KEYWORD_REG_HINTS: Array<{ keywords: string[]; updateIds: string[] }> = [
  { keywords: ['billing', 'claims', 'reimbursement', 'payment'], updateIds: ['REG-2025-HH-001', 'REG-2026-FCA-001'] },
  { keywords: ['hipaa', 'cybersecurity', 'data security', 'it security'], updateIds: ['REG-2025-HIPAA-001'] },
  { keywords: ['oig', 'exclusion', 'fraud', 'false claims'], updateIds: ['REG-2025-OIG-001', 'REG-2026-FCA-001'] },
  { keywords: ['emergency preparedness', 'fire safety', 'disaster'], updateIds: ['REG-2026-EP-001'] },
  { keywords: ['oasis', 'assessment', 'data submission'], updateIds: ['REG-2025-OASIS-001'] },
  { keywords: ['cms update', 'final rule', 'regulation', 'regulatory'], updateIds: ['REG-2025-HH-001'] },
  { keywords: ['plan of care', 'physician certification', 'billing'], updateIds: ['REG-2026-FCA-001', 'REG-2025-HH-001'] },
  { keywords: ['cop', 'conditions of participation', 'survey'], updateIds: ['REG-2025-HH-001', 'REG-2026-EP-001'] },
];

/* ─── Severity ordering ─────────────────────────────────────────────── */

const SEV_ORDER: Record<RegulatoryAlertSeverity, number> = {
  immediate: 0, high: 1, moderate: 2, low: 3,
};

/* ─── Matcher ───────────────────────────────────────────────────────── */

export class RegulatoryMatcher {
  private getFeed(): RegulatoryAlert[] {
    return SEED_REGULATORY_UPDATES;
  }

  /** Returns regulatory updates relevant to the given query and intent. */
  getRelevantUpdates(
    userInput: string,
    intent: IntentKind,
    corpusPolicyIds?: string[],
  ): RegulatoryAlert[] {
    if (!REGULATORY_INTENTS.has(intent)) return [];

    const feed = this.getFeed();
    const inputLower = userInput.toLowerCase();

    // Keyword-boosted selection
    const boostedIds = new Set<string>();
    KEYWORD_REG_HINTS.forEach(h => {
      if (h.keywords.some(k => inputLower.includes(k))) {
        h.updateIds.forEach(id => boostedIds.add(id));
      }
    });

    const scored: Array<{ update: RegulatoryAlert; score: number }> = feed.map(u => {
      let score = 0;

      // Boosted by keyword hint
      if (boostedIds.has(u.updateId)) score += 3;

      // Boosted if any impacted policy is in the retrieved corpus chunks
      if (corpusPolicyIds && corpusPolicyIds.length > 0) {
        const overlap = u.impactedPolicies.filter(p => corpusPolicyIds.includes(p)).length;
        score += overlap * 2;
      }

      // Boost immediate/high severity
      score += (3 - SEV_ORDER[u.severity]);

      // Boost new/under_review status
      if (u.status === 'new') score += 2;
      else if (u.status === 'under_review') score += 1;

      return { update: u, score };
    });

    const MAX_REG = intent === 'question' ? 2 : 4;
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || SEV_ORDER[a.update.severity] - SEV_ORDER[b.update.severity])
      .slice(0, MAX_REG)
      .map(s => s.update);
  }

  /** Builds compact prompt summary for the regulatory context block. */
  buildPromptSummary(updates: RegulatoryAlert[]): string {
    if (updates.length === 0) return '';
    const lines: string[] = [
      'REGULATORY UPDATES (external — compare against governed corpus when answering):',
    ];
    updates.forEach((u, i) => {
      const eff = u.effectiveDate ? ` (effective ${u.effectiveDate})` : '';
      lines.push(`[R${i + 1}] ${u.severity.toUpperCase()} — ${u.title}${eff}`);
      lines.push(`     Source: ${u.source} | Topic: ${u.topic}`);
      lines.push(`     Impacts: ${u.impactedPolicies.join(', ') || 'see affected area'}`);
      lines.push(`     Action: ${u.nextAction}`);
    });
    return lines.join('\n');
  }

  /** All updates, for the /regulatory/updates endpoint. */
  getAllUpdates(): RegulatoryAlert[] {
    return this.getFeed();
  }

  /** Single update lookup. */
  getUpdate(updateId: string): RegulatoryAlert | undefined {
    return this.getFeed().find(u => u.updateId === updateId);
  }

  /** Updates impacting a specific policy ID. */
  getUpdatesForPolicy(policyId: string): RegulatoryAlert[] {
    return this.getFeed().filter(u => u.impactedPolicies.includes(policyId));
  }
}

export const regulatoryMatcher = new RegulatoryMatcher();
