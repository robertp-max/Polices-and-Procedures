/**
 * evaluateEvent
 * =============
 * Produces a structured, natural-language compliance evaluation
 * for a single event. This is what Brad answers when asked:
 *   "Is the 60-Day Episode Review overdue?"
 *   "What is missing from the QAPI meeting?"
 *   "What policy requirement is violated?"
 *
 * Input:  ComplianceObject (from complianceEngine)
 * Output: ComplianceEvaluation — machine-readable + human-readable
 */

import type { ComplianceObject, MissingItem, PolicyViolation } from './complianceEngine';

export interface ComplianceEvaluation {
  eventId: string;
  title: string;

  /** Is this event overdue? With how many days and why. */
  overdueStatus: {
    isOverdue: boolean;
    daysOverdue: number;
    reason: string;
  };

  /** Concrete list of what is missing and why it matters */
  missingItems: MissingItem[];

  /** Which forms are not complete, with policy reference */
  incompleteForms: {
    formId?: string;
    label: string;
    status: string;
    policyRef?: string;
    violation: string;
  }[];

  /** Policy requirements that are violated */
  policyViolations: PolicyViolation[];

  /** What regulatory framework governs this event */
  regulatoryBasis: string;

  /** Risk rating and plain-English explanation */
  complianceRisk: {
    level: string;
    explanation: string;
  };

  /** 0–100 survey readiness score with interpretation */
  surveyReadiness: {
    score: number;
    interpretation: string;
  };

  /** Plain-English summary Brad uses when answering a direct question */
  summary: string;
}

const READINESS_LABELS: Record<number, string> = {
  100: 'Fully audit-ready. All required items are complete.',
  80:  'Mostly ready. Minor items remain before this event is survey-defensible.',
  60:  'Partially complete. Key items are missing — this event would generate findings.',
  40:  'Significantly incomplete. Multiple required artifacts are missing or overdue.',
  0:   'Not ready. This event has critical gaps and is not survey-defensible.',
};

function readinessInterpretation(score: number): string {
  const threshold = [100, 80, 60, 40, 0].find(t => score >= t) ?? 0;
  return READINESS_LABELS[threshold];
}

export function evaluateEvent(obj: ComplianceObject): ComplianceEvaluation {
  /* ── Overdue status ── */
  const overdueStatus = {
    isOverdue: obj.isOverdue,
    daysOverdue: obj.daysOverdue,
    reason: obj.isOverdue
      ? `${obj.title} was due on ${obj.dueDate} and is ${obj.daysOverdue} day(s) past its deadline. It has not been marked complete. Per ${obj.policyId}, this is a ${obj.frequency.toLowerCase()} obligation — non-completion at this stage constitutes a potential Condition of Participation deficiency.`
      : obj.daysUntilDue <= 7
        ? `${obj.title} is not yet overdue but is due in ${obj.daysUntilDue} day(s) — action is required now to prevent a deficiency.`
        : `${obj.title} is due on ${obj.dueDate} (${obj.daysUntilDue} days away) and is currently not overdue.`,
  };

  /* ── Incomplete forms ── */
  const incompleteForms = obj.requiredForms
    .filter(f => f.status !== 'complete')
    .map(f => {
      const missing = obj.missingItems.find(m => m.formId === f.formId || m.id === `missing-form-${f.id}`);
      return {
        formId:     f.formId,
        label:      f.label,
        status:     f.status,
        policyRef:  missing?.policyRef ?? obj.policyId,
        violation:  missing?.complianceNote ?? `Form "${f.label}" is ${f.status} and must be completed before this event can close.`,
      };
    });

  /* ── Policy violations ── */
  const policyViolations = obj.policyViolations;

  /* ── Regulatory basis ── */
  const regulatoryBasis = buildRegulatoryBasis(obj);

  /* ── Compliance risk ── */
  const complianceRisk = {
    level: obj.complianceImpact,
    explanation: obj.complianceImpactReason,
  };

  /* ── Survey readiness ── */
  const surveyReadiness = {
    score: obj.surveyReadinessScore,
    interpretation: readinessInterpretation(obj.surveyReadinessScore),
  };

  /* ── Summary (Brad-style answer) ── */
  const summary = buildSummary(obj, overdueStatus, incompleteForms, policyViolations);

  return {
    eventId:           obj.id,
    title:             obj.title,
    overdueStatus,
    missingItems:      obj.missingItems,
    incompleteForms,
    policyViolations,
    regulatoryBasis,
    complianceRisk,
    surveyReadiness,
    summary,
  };
}

function buildRegulatoryBasis(obj: ComplianceObject): string {
  const parts: string[] = [`Policy: ${obj.policyId}`];
  if (obj.mandateType) {
    const labels: Record<string, string> = {
      'federal-required':    'Federal CoP requirement',
      'conditional-federal': 'Conditional federal requirement',
      'policy-driven':       'Agency policy-driven obligation',
      'state-required':      'State regulatory requirement',
    };
    parts.push(labels[obj.mandateType] ?? obj.mandateType);
  }
  parts.push(`Frequency: ${obj.frequency}`);
  parts.push(`Domain: ${obj.domain}`);
  return parts.join(' · ');
}

function buildSummary(
  obj: ComplianceObject,
  overdueStatus: ComplianceEvaluation['overdueStatus'],
  incompleteForms: ComplianceEvaluation['incompleteForms'],
  violations: PolicyViolation[],
): string {
  const lines: string[] = [];

  /* Opening line */
  if (obj.completionStatus === 'complete') {
    lines.push(`${obj.title} is COMPLETE and survey-ready (score: ${obj.surveyReadinessScore}/100).`);
    return lines.join(' ');
  }

  if (overdueStatus.isOverdue) {
    lines.push(
      `${obj.title} is OVERDUE by ${overdueStatus.daysOverdue} day(s) (due: ${obj.dueDate}).`,
    );
  } else if (obj.isAtRisk) {
    lines.push(`${obj.title} is AT RISK — due in ${obj.daysUntilDue} day(s).`);
  } else {
    lines.push(`${obj.title} is ${obj.completionStatus.toUpperCase()} — due ${obj.dueDate}.`);
  }

  /* Missing forms */
  if (incompleteForms.length > 0) {
    lines.push(
      `Missing or incomplete forms: ${incompleteForms.map(f => f.label + (f.formId ? ` (${f.formId})` : '')).join(', ')}.`,
    );
  }

  /* Other missing items (steps, minutes, approvals) */
  const otherMissing = obj.missingItems.filter(m => m.kind !== 'form' && m.kind !== 'evidence');
  if (otherMissing.length > 0) {
    lines.push(
      `Also incomplete: ${otherMissing.map(m => m.label).join('; ')}.`,
    );
  }

  /* Policy violations */
  if (violations.length > 0) {
    lines.push(
      `Policy requirements violated: ${violations.map(v => v.policyRef + (v.citation ? ` (${v.citation})` : '')).join(', ')}.`,
    );
  }

  /* Impact */
  lines.push(`Compliance impact: ${obj.complianceImpact}.`);
  lines.push(obj.complianceImpactReason);

  return lines.join(' ');
}

/* ── Test-case helper (mirrors the required test from the spec) ── */

/**
 * Given a ComplianceObject, answers the four mandatory survey questions
 * for a 60-Day Episode Review (or any event):
 *  1. Is it overdue?
 *  2. What is missing?
 *  3. What forms are incomplete?
 *  4. What policy requirement is violated?
 *  5. What is the compliance risk?
 */
export function answerSurveyQuestions(obj: ComplianceObject): {
  isOverdue:          string;
  whatIsMissing:      string;
  incompleteForms:    string;
  policyViolation:    string;
  complianceRisk:     string;
} {
  const ev = evaluateEvent(obj);

  return {
    isOverdue: ev.overdueStatus.isOverdue
      ? `YES — ${obj.daysOverdue} day(s) overdue. ${ev.overdueStatus.reason}`
      : `NO — ${ev.overdueStatus.reason}`,

    whatIsMissing: ev.missingItems.length === 0
      ? 'Nothing. All required items are complete.'
      : ev.missingItems.map(m => `[${m.kind.toUpperCase()}] ${m.label}: ${m.complianceNote}`).join('\n'),

    incompleteForms: ev.incompleteForms.length === 0
      ? 'All required forms are complete.'
      : ev.incompleteForms.map(f =>
          `${f.label}${f.formId ? ` (${f.formId})` : ''} — status: ${f.status}. ${f.violation}`,
        ).join('\n'),

    policyViolation: ev.policyViolations.length === 0
      ? `No policy violations. Event is compliant with ${obj.policyId}.`
      : ev.policyViolations.map(v =>
          `${v.policyRef}${v.citation ? ` (${v.citation})` : ''} [${v.severity.toUpperCase()}]: ${v.description}`,
        ).join('\n'),

    complianceRisk: `${ev.complianceRisk.level} — ${ev.complianceRisk.explanation}`,
  };
}
