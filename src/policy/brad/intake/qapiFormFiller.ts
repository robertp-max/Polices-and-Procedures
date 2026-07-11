/* ══════════════════════════════════════════════════════════════════════
   Brad — QAPI form filler.

   Reads everything Brad derived from the dumped source documents (the
   reviewed bundle, narrative aggregates, and per-record line-item segments)
   and DRAFTS each required form for the event: field values where the
   source actually stated them, real line-item rows where record segments
   were recovered, and explicit "manual entry required" markers everywhere
   else. Nothing is invented — every filled value carries its confidence and
   the form draft is labeled a Brad draft requiring human review.
   ══════════════════════════════════════════════════════════════════════ */

import { REGULATORY_EVENTS } from '@/policy/data/regulatoryEvents';
import { WORKFLOWS } from '@/policy/data/workflows.generated';
import { resolveFormTitle } from '@/policy/data/formIdAliases';
import {
  extractRecordSegments,
  extractDashboardRows,
  extractEscalationItems,
  extractSignoffRecords,
  extractPriorActionFollowUps,
  type QapiDerivedBundle,
  type QapiTextAggregates,
} from './adapters/qapiIntakeAdapter';

export interface FilledFormField {
  label: string;
  /** null → could not be derived from the dump; manual entry required. */
  value: string | null;
  confidence: 'low' | 'none';
  sourceQuote?: string;
}

export interface FilledFormLineItems {
  columns: string[];
  rows: string[][];
  note?: string;
}

export interface FilledFormDraft {
  formId: string;
  title: string;
  fields: FilledFormField[];
  lineItems?: FilledFormLineItems;
  /** How this draft was produced / what still needs a human. */
  note: string;
}

export interface QapiFormFillerInput {
  bundle: QapiDerivedBundle;
  agg: QapiTextAggregates | null;
  /** Combined text of ALL dumped source documents. */
  text: string;
  eventId: string;
  eventDateISO: string;
}

const filled = (label: string, value: string | number | null | undefined, sourceQuote?: string): FilledFormField =>
  value == null || value === ''
    ? { label, value: null, confidence: 'none' }
    : { label, value: String(value), confidence: 'low', sourceQuote };

const metricValue = (m: { value: unknown }): string | null =>
  m.value == null ? null : Array.isArray(m.value) ? m.value.join(', ') : String(m.value);

const DRAFT_NOTE = 'Brad draft from the dumped source documents — every value is low-confidence and requires human review; blank fields require manual entry.';

/** Required forms for the event (falls back to the quarterly QAPI workflow). */
export function requiredFormIdsForEvent(eventId: string): string[] {
  const ev = REGULATORY_EVENTS.find((e) => e.id === eventId);
  if (ev?.requiredForms.length) {
    const ids = ev.requiredForms.map((f) => f.formId ?? f.id.replace(/^f-/, '')).filter(Boolean) as string[];
    if (ids.length) return Array.from(new Set(ids));
  }
  const wf = WORKFLOWS['QA-WF-03']?.requiredForms;
  if (wf && wf.length) return wf;
  // Single source of truth fallback for QA-WF-03 full packet (required child forms)
  if (eventId.includes('qapi') || eventId.includes('QA-WF-03')) {
    return [
      'QA-FM-001', 'QA-FM-002', 'QA-FM-003', 'QA-FM-004', 'QA-FM-005', 'QA-FM-006',
      'QA-FM-021', 'CO-FM-024', 'EN-FM-022', 'GV-FM-023',
    ];
  }
  return [];
}

export function buildQapiFormDrafts(input: QapiFormFillerInput): FilledFormDraft[] {
  const { bundle, agg, text, eventDateISO } = input;
  const ae = extractRecordSegments(text, 'AE');
  const inf = extractRecordSegments(text, 'INF');
  const cmp = extractRecordSegments(text, 'CMP');
  const cap = extractRecordSegments(text, 'CAP');
  const dt = extractRecordSegments(text, 'DT');
  const dashboard = extractDashboardRows(text);
  const gbe = extractEscalationItems(text);
  const signoffs = extractSignoffRecords(text);
  const priorActions = extractPriorActionFollowUps(text);
  const quarter = agg?.reviewQuarter ?? null;

  const drafts = new Map<string, FilledFormDraft>();
  const add = (d: FilledFormDraft) => drafts.set(d.formId, d);

  // ── QA-FM-001 — QAPI Committee Meeting Minutes ──
  add({
    formId: 'QA-FM-001',
    title: resolveFormTitle('QA-FM-001'),
    note: DRAFT_NOTE,
    fields: [
      filled('Meeting date', eventDateISO),
      filled('Reporting quarter', quarter),
      filled('Quorum', metricValue(bundle.meetingDetails.quorumStatus), bundle.meetingDetails.quorumStatus.sourceQuotes[0]),
      filled('Attendance', metricValue(bundle.meetingDetails.attendeeRoster), bundle.meetingDetails.attendeeRoster.sourceQuotes[0]),
      filled('Prior-period action follow-up', priorActions.length ? priorActions.join(' | ') : null),
      filled('New PIP decisions', bundle.pipCorrectiveAction.length ? bundle.pipCorrectiveAction.map((p) => p.trigger).join('; ') : null),
      filled('Governing Body escalation items', gbe.length ? gbe.map((g) => g.id).join(', ') : null),
    ],
    lineItems: signoffs.length
      ? { columns: ['Sign-off role', 'Name', 'Date'], rows: signoffs.map((s) => [s.role, s.name, s.date]), note: 'Signatures must still be captured via eCIgn — these are the sign-off records stated in the source.' }
      : undefined,
  });

  // ── QA-FM-002 — PIP Charter ──
  add({
    formId: 'QA-FM-002',
    title: resolveFormTitle('QA-FM-002'),
    note: DRAFT_NOTE,
    fields: [filled('PIP triggers identified', agg?.pipTriggerCount?.value ?? null, agg?.pipTriggerCount?.quote)],
    lineItems: bundle.pipCorrectiveAction.length
      ? {
          columns: ['PIP trigger', 'Issue (verbatim source)', 'Severity', 'Suggested owner'],
          rows: bundle.pipCorrectiveAction.map((p) => [p.trigger, p.issueSummary.slice(0, 160), p.severity, p.ownerRoleSuggested]),
        }
      : undefined,
  });

  // ── QA-FM-003 — Quality Indicator Monthly Dashboard ──
  add({
    formId: 'QA-FM-003',
    title: resolveFormTitle('QA-FM-003'),
    note: `${DRAFT_NOTE} Rates shown only when unambiguous in the source; glued numerator/denominator cells carry the raw value for manual confirmation.`,
    fields: [filled('Rows recovered from source', dashboard.length || null)],
    lineItems: dashboard.length
      ? {
          columns: ['Metric', 'Indicator', 'Month', 'Result', 'Threshold', 'Status'],
          rows: dashboard.map((r) => [r.metricId, r.indicator, r.month ?? '—', r.rate != null ? `${r.rate}%` : (r.rawValue ?? 'confirm manually'), r.threshold ?? '—', r.status ?? '—']),
        }
      : undefined,
  });

  // ── QA-FM-004 — Adverse Event RCA Worksheet ──
  add({
    formId: 'QA-FM-004',
    title: resolveFormTitle('QA-FM-004'),
    note: DRAFT_NOTE,
    fields: [filled('Adverse events in period', agg?.adverseEventsCount?.value ?? null, agg?.adverseEventsCount?.quote)],
    lineItems: ae.length
      ? {
          columns: ['Event', 'Date', 'Type', 'Severity', 'Status'],
          rows: ae.map((s) => [s.id, s.date ?? '—', s.category ?? '—', s.severity ?? '—', s.status ?? '—']),
        }
      : undefined,
  });

  // ── QA-FM-005 — CAP Tracking Tool ──
  add({
    formId: 'QA-FM-005',
    title: resolveFormTitle('QA-FM-005'),
    note: DRAFT_NOTE,
    fields: [filled('Corrective action plans recovered', cap.length || null)],
    lineItems: cap.length
      ? {
          columns: ['CAP', 'Dates in record', 'Status', 'Source excerpt'],
          rows: cap.map((s) => [s.id, s.dates.join(', ') || '—', s.status ?? '—', s.text.slice(0, 140)]),
        }
      : undefined,
  });

  // ── QA-FM-006 — Infection Control Line List ──
  add({
    formId: 'QA-FM-006',
    title: resolveFormTitle('QA-FM-006'),
    note: DRAFT_NOTE,
    fields: [
      filled('Infections in period', metricValue(bundle.adverseEvents.infectionsTotal), bundle.adverseEvents.infectionsTotal.sourceQuotes[0]),
      filled('Healthcare-associated (HAI)', metricValue(bundle.infectionControl.healthcareAssociated), bundle.infectionControl.healthcareAssociated.sourceQuotes[0]),
    ],
    lineItems: inf.length
      ? {
          columns: ['Case', 'Onset', 'Type', 'Status'],
          rows: inf.map((s) => [s.id, s.date ?? '—', s.category ?? '—', s.status ?? '—']),
        }
      : undefined,
  });

  // ── QA-FM-021 — PIP Remeasurement & Status ──
  const remeasure = /[^\n.]{0,120}partial improvement[^\n.]{0,160}/i.exec(text)?.[0]?.trim() ?? priorActions[0] ?? null;
  add({
    formId: 'QA-FM-021',
    title: resolveFormTitle('QA-FM-021'),
    note: DRAFT_NOTE,
    fields: [
      filled('Active/identified PIP triggers', agg?.pipTriggerCount?.value ?? null, agg?.pipTriggerCount?.quote),
      filled('Prior-period remeasurement', remeasure),
    ],
  });

  // ── CO-FM-024 — Compliance Committee Meeting Minutes ──
  add({
    formId: 'CO-FM-024',
    title: resolveFormTitle('CO-FM-024'),
    note: `${DRAFT_NOTE} Compliance/billing/HR/IT feeder-audit detail must be compiled from the source audit tables manually.`,
    fields: [
      filled('Patient complaints in period', agg?.complaintsCount?.value ?? null, agg?.complaintsCount?.quote),
      filled('Disciplinary review triggers', metricValue(bundle.highRiskRollup.clinicianDisciplinaryActionCount), bundle.highRiskRollup.clinicianDisciplinaryActionCount.sourceQuotes[0]),
    ],
    lineItems: cmp.length
      ? {
          columns: ['Complaint', 'Date', 'Category', 'Status'],
          rows: cmp.map((s) => [s.id, s.date ?? '—', s.category ?? '—', s.status ?? '—']),
        }
      : undefined,
  });

  // ── EN-FM-022 — Enterprise Policy Compliance Scorecard ──
  add({
    formId: 'EN-FM-022',
    title: resolveFormTitle('EN-FM-022'),
    note: `${DRAFT_NOTE} Department-level scorecard percentages were not confidently recoverable from the glued source tables — enter from the feeder-audit records.`,
    fields: [filled('Reporting quarter', quarter)],
  });

  // ── GV-FM-023 — Governing Body report ──
  add({
    formId: 'GV-FM-023',
    title: resolveFormTitle('GV-FM-023'),
    note: DRAFT_NOTE,
    fields: [
      filled('Reporting quarter', quarter),
      filled('Active census', metricValue(bundle.censusPopulation.activeCensus), bundle.censusPopulation.activeCensus.sourceQuotes[0]),
      filled('Adverse events', agg?.adverseEventsCount?.value ?? null),
      filled('Disciplinary reviews (per GV-GB-001 §6.2.4)', dt.length || metricValue(bundle.highRiskRollup.clinicianDisciplinaryActionCount)),
    ],
    lineItems: gbe.length
      ? { columns: ['Item', 'Escalation'], rows: gbe.map((g) => [g.id, g.text]) }
      : undefined,
  });

  // ── Assemble in the event's required-form order; unknown forms get an
  //    honest "manual completion" draft rather than being dropped. ──
  const required = requiredFormIdsForEvent(input.eventId);
  const ordered: FilledFormDraft[] = [];
  for (const formId of required) {
    const draft = drafts.get(formId);
    if (draft) { ordered.push(draft); continue; }
    ordered.push({
      formId,
      title: resolveFormTitle(formId),
      note: 'No auto-derivable fields for this form in the dumped source — manual completion required.',
      fields: [],
    });
  }
  // Forms we drafted that are not in the event list still surface (never lose work).
  for (const [formId, draft] of drafts) {
    if (!required.includes(formId)) ordered.push(draft);
  }
  return ordered;
}
