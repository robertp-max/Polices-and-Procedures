/**
 * Operational Assessment Service
 *
 * Provides structured read-model access to operational compliance state.
 * In Phase 1: uses seed data. In Phase 2+: replace seedSource() calls with
 * live adapter implementations.
 *
 * Architecture rule: this service NEVER interacts with the LLM.
 * It provides deterministic, structured data derived from app state.
 * The LLM receives a compact summary; the raw records are appended to
 * the StructuredResponse for UI rendering.
 */

import type {
  OperationalGap,
  LifecycleAlert,
  IntentKind,
  GapSeverity,
  LifecycleState,
} from '../types.js';
import { SEED_OPERATIONAL_GAPS, SEED_LIFECYCLE_ALERTS } from './seed.js';

/* ─── Intent → Relevant Gap Types ──────────────────────────────────── */

const INTENT_GAP_FILTER: Partial<Record<IntentKind, string[]>> = {
  pre_survey_audit: [
    'overdue_task', 'missing_artifact', 'unsigned_form', 'pending_approval',
    'incomplete_form', 'overdue_event', 'blocked_workflow',
  ],
  qapi_digest: ['overdue_task', 'missing_artifact', 'incomplete_form', 'overdue_event'],
  governing_body_brief: ['pending_approval', 'overdue_event', 'missing_artifact'],
  action_plan: [
    'overdue_task', 'missing_artifact', 'unsigned_form', 'pending_approval',
    'incomplete_form', 'overdue_event', 'blocked_workflow',
  ],
  missing_items: ['missing_artifact', 'incomplete_form', 'unsigned_form'],
  knowledge_article: [],
};

const INTENT_LIFECYCLE_FILTER: Partial<Record<IntentKind, LifecycleState[]>> = {
  pre_survey_audit: [
    'draft', 'pending_approval', 'overdue_review', 'approved_unpublished',
    'missing_linked_artifact',
  ],
  governing_body_brief: ['pending_approval', 'overdue_review', 'approved_unpublished'],
  qapi_digest: ['pending_approval', 'overdue_review'],
  action_plan: [
    'draft', 'pending_approval', 'overdue_review', 'approved_unpublished',
    'awaiting_acknowledgment', 'missing_linked_artifact',
  ],
  missing_items: ['missing_linked_artifact', 'awaiting_acknowledgment'],
};

/* ─── Query helpers ─────────────────────────────────────────────────── */

function gapMatchesQuery(gap: OperationalGap, query: string): boolean {
  const q = query.toLowerCase();
  return (
    gap.title.toLowerCase().includes(q) ||
    gap.description.toLowerCase().includes(q) ||
    (gap.linkedPolicyId?.toLowerCase().includes(q) ?? false) ||
    (gap.owner?.toLowerCase().includes(q) ?? false)
  );
}

function lifecycleMatchesQuery(alert: LifecycleAlert, query: string): boolean {
  const q = query.toLowerCase();
  return (
    alert.policyTitle.toLowerCase().includes(q) ||
    alert.policyId.toLowerCase().includes(q) ||
    alert.owner.toLowerCase().includes(q)
  );
}

/* ─── Keyword → gap relevance shortcuts ────────────────────────────── */

const KEYWORD_GAP_HINTS: Array<{ keywords: string[]; gapIds: string[] }> = [
  { keywords: ['oig', 'screening', 'exclusion'], gapIds: ['OG-001'] },
  { keywords: ['training', 'fire', 'emergency', 'preparedness'], gapIds: ['OG-002'] },
  { keywords: ['plan of care', 'physician', 'certification', 'billing', 'bill'], gapIds: ['OG-003'] },
  { keywords: ['oasis', 'assessment', 'functional'], gapIds: ['OG-004'] },
  { keywords: ['qapi', 'quality', 'meeting', 'minutes'], gapIds: ['OG-005'] },
  { keywords: ['infection control', 'covid', 'protocol'], gapIds: ['OG-006'] },
  { keywords: ['background check', 'onboarding', 'new hire'], gapIds: ['OG-007'] },
  { keywords: ['competency', 'validation', 'skills'], gapIds: ['OG-008'] },
  { keywords: ['governing body', 'board meeting', 'scheduled'], gapIds: ['OG-009'] },
  { keywords: ['health screening', 'tb test', 'immunization'], gapIds: ['OG-010'] },
];

const KEYWORD_LIFECYCLE_HINTS: Array<{ keywords: string[]; alertIds: string[] }> = [
  { keywords: ['governing body', 'gv-gb-001'], alertIds: ['LA-001', 'LA-009'] },
  { keywords: ['plan of care', 'clinical', 'cl-ca-001'], alertIds: ['LA-002'] },
  { keywords: ['billing', 'fn-bc-001'], alertIds: ['LA-003'] },
  { keywords: ['it', 'cybersecurity', 'data security', 'hipaa'], alertIds: ['LA-004'] },
  { keywords: ['hr', 'workforce', 'acknowledgment'], alertIds: ['LA-005'] },
  { keywords: ['qapi', 'quality', 'qa-qm-001'], alertIds: ['LA-006'] },
  { keywords: ['infection control', 'covid', 'en-ic-003'], alertIds: ['LA-007'] },
  { keywords: ['risk management', 'corrective action', 'rm-cm-001'], alertIds: ['LA-008'] },
];

/* ─── Service ───────────────────────────────────────────────────────── */

export interface OperationalContext {
  gaps: OperationalGap[];
  lifecycleAlerts: LifecycleAlert[];
  /** Compact text summary for LLM context injection. */
  summaryForPrompt: string;
}

export interface OperationalSummary {
  totalGaps: number;
  critical: number;
  high: number;
  moderate: number;
  low: number;
  bySource: Record<string, number>;
  topGaps: OperationalGap[];
  lifecycleAlerts: LifecycleAlert[];
  phaseLabel: string;
  dataSource: 'live' | 'seed';
  asOf: string;
}

export class OperationalService {
  /** Phase 1: seed source. Replace with DB / API adapter for Phase 2. */
  private getGaps(): OperationalGap[] {
    return SEED_OPERATIONAL_GAPS;
  }

  private getLifecycleAlerts(): LifecycleAlert[] {
    return SEED_LIFECYCLE_ALERTS;
  }

  /** Returns operational context relevant to the given query/intent. */
  getContextForQuery(
    userInput: string,
    intent: IntentKind,
  ): OperationalContext {
    const allGaps = this.getGaps();
    const allAlerts = this.getLifecycleAlerts();

    const allowedGapTypes = INTENT_GAP_FILTER[intent];
    const allowedLifecycleStates = INTENT_LIFECYCLE_FILTER[intent];

    // For non-audit intents, return nothing (avoid injecting irrelevant state)
    const shouldIncludeOps =
      intent === 'pre_survey_audit' ||
      intent === 'qapi_digest' ||
      intent === 'governing_body_brief' ||
      intent === 'action_plan' ||
      intent === 'missing_items' ||
      intent === 'question';

    if (!shouldIncludeOps) {
      return { gaps: [], lifecycleAlerts: [], summaryForPrompt: '' };
    }

    const inputLower = userInput.toLowerCase();

    // Keyword-boosted gap selection
    const boostedGapIds = new Set<string>();
    KEYWORD_GAP_HINTS.forEach(h => {
      if (h.keywords.some(k => inputLower.includes(k))) {
        h.gapIds.forEach(id => boostedGapIds.add(id));
      }
    });
    const boostedLifecycleIds = new Set<string>();
    KEYWORD_LIFECYCLE_HINTS.forEach(h => {
      if (h.keywords.some(k => inputLower.includes(k))) {
        h.alertIds.forEach(id => boostedLifecycleIds.add(id));
      }
    });

    // Filter gaps
    let gaps = allGaps.filter(g => {
      if (!allowedGapTypes || allowedGapTypes.length === 0) {
        // question intent: boost by keyword match only
        return boostedGapIds.has(g.id) || gapMatchesQuery(g, userInput);
      }
      return (
        allowedGapTypes.includes(g.type) ||
        boostedGapIds.has(g.id) ||
        gapMatchesQuery(g, userInput)
      );
    });

    // For audit/action intents, prioritize critical/high severity
    if (intent === 'pre_survey_audit' || intent === 'action_plan') {
      const SEV_ORDER: Record<GapSeverity, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
      gaps = gaps.sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
    }
    // Cap to avoid overwhelming prompt
    const MAX_GAPS = intent === 'question' ? 3 : 7;
    gaps = gaps.slice(0, MAX_GAPS);

    // Filter lifecycle alerts
    let lifecycleAlerts = allAlerts.filter(a => {
      if (!allowedLifecycleStates || allowedLifecycleStates.length === 0) {
        return boostedLifecycleIds.has(a.id) || lifecycleMatchesQuery(a, userInput);
      }
      return (
        allowedLifecycleStates.includes(a.state) ||
        boostedLifecycleIds.has(a.id) ||
        lifecycleMatchesQuery(a, userInput)
      );
    });
    const MAX_LIFECYCLE = intent === 'question' ? 2 : 5;
    lifecycleAlerts = lifecycleAlerts
      .sort((a, b) => {
        const sev: Record<GapSeverity, number> = { critical: 0, high: 1, moderate: 2, low: 3 };
        return sev[a.severity] - sev[b.severity];
      })
      .slice(0, MAX_LIFECYCLE);

    const summaryForPrompt = buildPromptSummary(gaps, lifecycleAlerts);
    return { gaps, lifecycleAlerts, summaryForPrompt };
  }

  /** Full operational summary for the /operational/summary endpoint. */
  getSummary(): OperationalSummary {
    const gaps = this.getGaps();
    const lifecycleAlerts = this.getLifecycleAlerts();

    const countBySev = (sev: GapSeverity) => gaps.filter(g => g.severity === sev).length;
    const bySource = gaps.reduce<Record<string, number>>((acc, g) => {
      acc[g.source] = (acc[g.source] ?? 0) + 1;
      return acc;
    }, {});

    return {
      totalGaps: gaps.length,
      critical: countBySev('critical'),
      high: countBySev('high'),
      moderate: countBySev('moderate'),
      low: countBySev('low'),
      bySource,
      topGaps: gaps
        .filter(g => g.severity === 'critical' || g.severity === 'high')
        .slice(0, 5),
      lifecycleAlerts,
      phaseLabel: 'Phase 1 — Operational Assessment (Seed Data)',
      dataSource: 'seed',
      asOf: new Date().toISOString(),
    };
  }

  /** All gaps, optionally filtered by severity/source/type. */
  getGapsFiltered(params: {
    severity?: GapSeverity;
    source?: string;
    type?: string;
  }): OperationalGap[] {
    let gaps = this.getGaps();
    if (params.severity) gaps = gaps.filter(g => g.severity === params.severity);
    if (params.source) gaps = gaps.filter(g => g.source === params.source);
    if (params.type) gaps = gaps.filter(g => g.type === params.type);
    return gaps;
  }

  /** All lifecycle alerts, optionally filtered by state. */
  getLifecycleFiltered(state?: string): LifecycleAlert[] {
    const alerts = this.getLifecycleAlerts();
    if (!state) return alerts;
    return alerts.filter(a => a.state === state);
  }
}

/* ─── Prompt summary builder ────────────────────────────────────────── */

function buildPromptSummary(
  gaps: OperationalGap[],
  lifecycleAlerts: LifecycleAlert[],
): string {
  if (gaps.length === 0 && lifecycleAlerts.length === 0) return '';

  const lines: string[] = [
    'OPERATIONAL STATE (live app data — Phase 1 seed — treat as factual current compliance state):',
  ];

  gaps.forEach((g, i) => {
    const overdue = g.overdueDays ? ` — ${g.overdueDays} days overdue` : '';
    const owner = g.owner ? ` — Owner: ${g.owner}` : '';
    const policy = g.linkedPolicyId ? ` — Policy: ${g.linkedPolicyId}` : '';
    lines.push(
      `[O${i + 1}] ${g.severity.toUpperCase()} ${g.type.replace(/_/g, ' ')}: ${g.title}${overdue}${owner}${policy}`,
    );
    lines.push(`     Impact: ${g.complianceImpact}`);
    lines.push(`     Next Action: ${g.nextAction}`);
  });

  if (lifecycleAlerts.length > 0) {
    lines.push('POLICY LIFECYCLE (governance state):');
    lifecycleAlerts.forEach((a, i) => {
      const overdue = a.overdueDays ? ` — ${a.overdueDays} days overdue` : '';
      lines.push(
        `[L${i + 1}] ${a.severity.toUpperCase()} ${a.state.replace(/_/g, ' ')}: ${a.policyId} — ${a.policyTitle}${overdue}`,
      );
      lines.push(`     Owner: ${a.owner}. Next Action: ${a.nextAction}`);
      if (a.blockedBy) lines.push(`     Blocked by: ${a.blockedBy}`);
    });
  }

  return lines.join('\n');
}

export const operationalService = new OperationalService();
