/**
 * Brad Context Envelope — Pre-LLM Synthesis Step
 *
 * The core problem this solves:
 *   Before: sessionContext + operationalContext + regulatoryContext
 *           → 3 separate blobs → LLM reconciles them → DRIFT
 *   After:  ONE unified envelope → deterministically prioritized
 *           → LLM sees a single coherent context block → NO DRIFT
 *
 * The envelope builder is deterministic. It never calls the LLM.
 * It assembles, deduplicates, and prioritizes all context signals
 * before any model inference occurs.
 */

import type { BradSessionState, BradMode, BradUrgency, IncidentType } from './types.js';
import type { OperationalGap, LifecycleAlert, RegulatoryAlert } from '../types.js';

export interface BradContextEnvelope {
  /** Case continuity context */
  caseContext: string | null;
  /** Operational gap summary */
  operationalSummary: string | null;
  /** Regulatory alert summary */
  regulatorySummary: string | null;
  /** Policy lifecycle summary */
  lifecycleSummary: string | null;
  /** EHR state (placeholder until Phase 3) */
  ehrSummary: string | null;
  /** High-priority signals that MUST be reflected in the response */
  prioritySignals: string[];
  /** Enforced directives (deterministic — NOT suggestions to the LLM) */
  enforcedDirectives: string[];
  /** Compiled single string block for prompt injection */
  compiled: string;
  /** Whether life safety is active — used for deterministic enforcement */
  lifeSafetyActive: boolean;
  /** Data quality metadata */
  dataQuality: {
    hasLiveOperational: boolean;
    hasLiveRegulatory: boolean;
    hasEhrData: boolean;
    allSeedData: boolean;
    note: string;
  };
}

/* ── Helpers ─────────────────────────────────────────────────────── */

const URGENCY_PREFIX: Record<BradUrgency, string> = {
  low: '',
  moderate: 'MODERATE RISK',
  high: '⚠ HIGH RISK',
  critical: '🚨 CRITICAL',
};

const MODE_DESCRIPTIONS: Record<BradMode, string> = {
  general: 'General Query',
  emergency_response: 'EMERGENCY RESPONSE — Life-threatening event in progress',
  clinical_protocol: 'Clinical Protocol — Step-by-step clinical guidance',
  policy_interpretation: 'Policy Interpretation — Regulatory and policy authority',
  action_plan: 'Action Plan — Prioritized corrective steps',
  form_completion: 'Form Completion — Required forms and documentation',
  incident_reporting: 'Incident Reporting — Documentation and notification requirements',
  qapi_followup: 'QAPI Follow-Up — Quality review and oversight triggers',
  survey_readiness: 'Survey Readiness — CMS surveyor simulation',
  compliance_investigation: 'Compliance Investigation — Deficiency analysis',
  context_assist: 'Context Assist — Step-by-step workflow guidance',
};

function formatOperationalGaps(gaps: OperationalGap[]): string {
  if (gaps.length === 0) return '';
  const lines = ['Operational Gaps (Phase 1):'];
  gaps.slice(0, 5).forEach((g, i) => {
    const overdue = g.overdueDays ? ` [${g.overdueDays}d overdue]` : '';
    const owner = g.owner ? ` — Owner: ${g.owner}` : '';
    const policy = g.linkedPolicyId ? ` — Policy: ${g.linkedPolicyId}` : '';
    lines.push(`  [O${i + 1}] ${g.severity.toUpperCase()} ${g.type.replace(/_/g, ' ')}: ${g.title}${overdue}${owner}${policy}`);
    lines.push(`        Impact: ${g.complianceImpact}`);
    lines.push(`        Action: ${g.nextAction}`);
  });
  return lines.join('\n');
}

function formatLifecycleAlerts(alerts: LifecycleAlert[]): string {
  if (alerts.length === 0) return '';
  const lines = ['Policy Lifecycle Alerts:'];
  alerts.slice(0, 4).forEach((a, i) => {
    const overdue = a.overdueDays ? ` [${a.overdueDays}d overdue]` : '';
    lines.push(`  [L${i + 1}] ${a.severity.toUpperCase()} ${a.state.replace(/_/g, ' ')}: ${a.policyId} — ${a.policyTitle}${overdue}`);
    lines.push(`        Owner: ${a.owner}. Action: ${a.nextAction}`);
    if (a.blockedBy) lines.push(`        Blocked by: ${a.blockedBy}`);
  });
  return lines.join('\n');
}

function formatRegulatoryAlerts(alerts: RegulatoryAlert[]): string {
  if (alerts.length === 0) return '';
  const lines = ['Regulatory Updates (Phase 2):'];
  alerts.slice(0, 3).forEach((u, i) => {
    lines.push(`  [R${i + 1}] ${u.severity.toUpperCase()} [${u.status}]: ${u.title}`);
    lines.push(`        Source: ${u.source}. Effective: ${u.effectiveDate ?? 'TBD'}`);
    if (u.impactedPolicies.length > 0) {
      lines.push(`        Impacts: ${u.impactedPolicies.join(', ')}`);
    }
    lines.push(`        Action: ${u.nextAction}`);
  });
  return lines.join('\n');
}

function buildDataQuality(
  operationalGaps: OperationalGap[],
  regulatoryAlerts: RegulatoryAlert[],
): BradContextEnvelope['dataQuality'] {
  // For MVP with seed data, all operational/regulatory is seed
  // Phase 3 (EHR) not integrated
  const allSeedData = operationalGaps.length > 0 || regulatoryAlerts.length > 0;
  return {
    hasLiveOperational: false,   // Phase 1 seed only
    hasLiveRegulatory: false,    // Phase 2 seed only
    hasEhrData: false,           // Phase 3 not integrated
    allSeedData,
    note: allSeedData
      ? 'Operational and regulatory data is Phase 1-2 seed data (pre-production). Reflects representative compliance patterns, not live system state.'
      : 'Policy corpus is the only grounded source. No operational or EHR data available for this query.',
  };
}

/* ── Main export ─────────────────────────────────────────────────── */

export function buildContextEnvelope(args: {
  sessionState: BradSessionState | null;
  operationalGaps: OperationalGap[];
  lifecycleAlerts: LifecycleAlert[];
  regulatoryAlerts: RegulatoryAlert[];
}): BradContextEnvelope {
  const { sessionState, operationalGaps, lifecycleAlerts, regulatoryAlerts } = args;

  const lifeSafetyActive = sessionState?.lifeSafetyFlag ?? false;
  const mode = sessionState?.mode ?? 'general';
  const urgency = sessionState?.urgency ?? 'low';

  // ── Case context block ─────────────────────────────────────────
  let caseContext: string | null = null;
  if (sessionState && (sessionState.mode !== 'general' || sessionState.detectedIncidentType)) {
    const lines: string[] = [
      `Active Mode: ${MODE_DESCRIPTIONS[mode]}`,
      `Urgency: ${URGENCY_PREFIX[urgency] || urgency.toUpperCase()}`,
    ];
    if (sessionState.caseTitle) lines.push(`Case: ${sessionState.caseTitle}`);
    if (sessionState.detectedIncidentType) {
      lines.push(`Incident: ${sessionState.detectedIncidentType.replace(/_/g, ' ')}`);
    }
    if (sessionState.caseSummary) lines.push(`Context: ${sessionState.caseSummary}`);
    if (sessionState.recentMessages.length > 0) {
      const last = sessionState.recentMessages.slice(-3);
      lines.push('Recent exchange:');
      last.forEach(m => lines.push(`  ${m.role === 'user' ? 'User' : 'Brad'}: ${m.content.slice(0, 150)}`));
    }
    caseContext = lines.join('\n');
  }

  // ── Operational summary ────────────────────────────────────────
  const opStr = formatOperationalGaps(operationalGaps);
  const lifecycleStr = formatLifecycleAlerts(lifecycleAlerts);
  const operationalSummary = [opStr, lifecycleStr].filter(Boolean).join('\n\n') || null;

  // ── Lifecycle summary (separate for clarity) ───────────────────
  const lifecycleSummary = lifecycleStr || null;

  // ── Regulatory summary ─────────────────────────────────────────
  const regulatorySummary = formatRegulatoryAlerts(regulatoryAlerts) || null;

  // ── EHR summary (Phase 3 pending) ─────────────────────────────
  const ehrSummary = 'EHR State: Phase 3 not integrated. No EHR data available.';

  // ── Priority signals ───────────────────────────────────────────
  const prioritySignals: string[] = [];
  if (lifeSafetyActive) {
    prioritySignals.push('⚠ LIFE SAFETY FLAG ACTIVE — directAnswer MUST begin with immediate emergency action');
  }
  if (sessionState?.escalationRequired) {
    prioritySignals.push('⚠ ESCALATION REQUIRED — include notification chain in response');
  }
  if (sessionState?.qapiTriggerPossible) {
    prioritySignals.push('⚠ QAPI TRIGGER POSSIBLE — mention QAPI follow-up requirement');
  }
  const criticalGaps = operationalGaps.filter(g => g.severity === 'critical');
  if (criticalGaps.length > 0) {
    prioritySignals.push(`⚠ ${criticalGaps.length} CRITICAL operational gap(s) detected — must be reflected in complianceRisk`);
  }

  // ── Enforced directives ────────────────────────────────────────
  const enforcedDirectives: string[] = [];
  if (lifeSafetyActive) {
    enforcedDirectives.push('directAnswer MUST begin with: "EMERGENCY — Call 911 immediately."');
    enforcedDirectives.push('riskLevel MUST be "critical"');
    enforcedDirectives.push('enforcementLevel MUST be "condition_level"');
  }
  if (sessionState?.mode !== 'general' && sessionState) {
    enforcedDirectives.push('This is a continuation — do NOT start from scratch. Answer relative to active case.');
  }

  // ── Data quality ───────────────────────────────────────────────
  const dataQuality = buildDataQuality(operationalGaps, regulatoryAlerts);

  // ── Compile into single block ──────────────────────────────────
  const sections: string[] = ['═══ BRAD CONTEXT ENVELOPE ═══'];

  if (caseContext) {
    sections.push('── Case State ──');
    sections.push(caseContext);
  }

  if (operationalSummary) {
    sections.push('── Operational Intelligence ──');
    sections.push(operationalSummary);
  }

  if (regulatorySummary) {
    sections.push('── Regulatory Intelligence ──');
    sections.push(regulatorySummary);
  }

  sections.push('── EHR State ──');
  sections.push(ehrSummary);

  if (prioritySignals.length > 0) {
    sections.push('── Priority Signals ──');
    prioritySignals.forEach(s => sections.push(s));
  }

  if (enforcedDirectives.length > 0) {
    sections.push('── Enforced Directives ──');
    enforcedDirectives.forEach(d => sections.push('→ ' + d));
  }

  sections.push(`── Data Quality ──`);
  sections.push(dataQuality.note);

  sections.push('═══ END CONTEXT ENVELOPE ═══');
  sections.push('CONTEXT RULE: Use the envelope above to frame your answer. The envelope is factual system state — not corpus content. Do NOT cite envelope sections as [P#] passages. Do NOT contradict enforced directives above.');

  const compiled = sections.join('\n');

  return {
    caseContext,
    operationalSummary,
    regulatorySummary,
    lifecycleSummary,
    ehrSummary,
    prioritySignals,
    enforcedDirectives,
    compiled,
    lifeSafetyActive,
    dataQuality,
  };
}
