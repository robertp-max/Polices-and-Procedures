/**
 * Browser-safe "upload source → generate QAPI packet" bridge for Packet Studio.
 *
 * Runs the same domain pipeline the §24 e2e uses (parseSourceFile →
 * buildQapiPacketModel: segment → derive → KPIs → findings → trends → model),
 * so a pasted/uploaded QAPI source dataset produces a real analytical PacketModel
 * (KPIs, findings, workflows) rather than an empty stub. No server round-trip and
 * no Node APIs — safe to import into the client bundle.
 */
import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import { buildQapiPacketModel } from '@/policy/packets/qapi/buildQapiPacketModel';
import type { PacketModel } from '@/policy/packets/contracts';
import type { QapiPacketOptions } from '@/policy/qapi/renderQapiPacket';
import type { EventCardModel } from './eventSelector/eventCardModel';

function guessMimeType(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json')) return 'application/json';
  if (lower.endsWith('.csv')) return 'text/csv';
  if (lower.endsWith('.tsv')) return 'text/tab-separated-values';
  if (lower.endsWith('.md')) return 'text/markdown';
  return 'text/plain';
}

function qapiCadence(templateId: string): 'monthly' | 'quarterly' {
  return templateId.toLowerCase().includes('monthly') ? 'monthly' : 'quarterly';
}

export interface GenerateQapiInput {
  readonly text: string;
  readonly fileName: string;
  readonly event: EventCardModel;
  readonly templateId: string;
  readonly generatedAtISO: string;
  readonly bradExtraction?: {
    readonly engine?: string;
    readonly passes?: number;
    readonly fields?: readonly BradSourceField[];
    readonly validationSummary?: string;
  };
}

interface BradSourceField {
  readonly key: string;
  readonly value?: string | null;
  readonly sourceSnippet?: string;
  readonly group?: string;
  readonly label?: string;
}

/**
 * Generate a QAPI analytical PacketModel from raw uploaded/pasted source text.
 * Segmentation resolves the correct quarter by the selected event date and
 * fails closed on ambiguity; missing values render UNKNOWN, never false zeroes.
 */
export function generateQapiPacketModelFromText(input: GenerateQapiInput): PacketModel {
  const { text, fileName, event, templateId, generatedAtISO } = input;
  const targetPeriod = selectedEventTargetQuarter(event);
  const bradResolvedText = bradExtractionMatchesTargetPeriod(input.bradExtraction?.fields, targetPeriod)
    ? buildBradResolvedQapiSourceText(input)
    : null;
  const generationText = bradResolvedText ?? text;
  const generationFileName = bradResolvedText ? `${fileName}.brad-reviewed.txt` : fileName;
  const parsed = parseSourceFile({
    fileName: generationFileName,
    mimeType: guessMimeType(generationFileName),
    byteLength: new TextEncoder().encode(generationText).length,
    text: generationText,
  });
  const policyIds = bradResolvedText ? readPolicyIds(input.bradExtraction?.fields) : undefined;
  const options: QapiPacketOptions = {
    eventId: event.eventInstanceId,
    workflowId: event.workflowId ?? undefined,
    preparedBy: 'Packet Studio',
    reviewer: 'Compliance Officer',
    policyIds,
  };
  return buildQapiPacketModel({
    parsed,
    eventDateISO: event.eventDate,
    targetPeriod: targetPeriod ?? undefined,
    sourceId: generationFileName,
    cadence: qapiCadence(templateId),
    generatedAt: generatedAtISO,
    packetVersion: 1,
    options,
  });
}

function selectedEventTargetQuarter(event: EventCardModel): string | null {
  const fromReportingPeriod = event.reportingPeriodStart ? quarterKeyFromISODate(event.reportingPeriodStart) : null;
  if (fromReportingPeriod) return fromReportingPeriod;

  const titleMatch = /\bQ([1-4])\b.*\b(20\d{2})\b/i.exec(event.eventTitle)
    ?? /\b(20\d{2})\b.*\bQ([1-4])\b/i.exec(event.eventTitle);
  if (titleMatch) {
    return titleMatch[1]?.startsWith('20')
      ? `${titleMatch[1]}-Q${titleMatch[2]}`
      : `${titleMatch[2]}-Q${titleMatch[1]}`;
  }

  const bareQuarter = /\bQ([1-4])\b/i.exec(event.eventTitle);
  const eventYear = eventYearForQuarter(event.eventDate, bareQuarter?.[1]);
  if (bareQuarter && eventYear) return `${eventYear}-Q${bareQuarter[1]}`;

  return null;
}

function quarterKeyFromISODate(value: string): string | null {
  const match = /^(20\d{2})-(\d{2})-\d{2}/.exec(value);
  if (!match) return null;
  const month = Number(match[2]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return null;
  return `${match[1]}-Q${Math.floor((month - 1) / 3) + 1}`;
}

function eventYearForQuarter(eventDate: string, quarter: string | undefined): string | null {
  const match = /^(20\d{2})-(\d{2})-\d{2}/.exec(eventDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  if (quarter === '4' && month === 1) return String(year - 1);
  return String(year);
}

function bradExtractionMatchesTargetPeriod(
  fields: readonly BradSourceField[] | undefined,
  targetPeriod: string | null,
): boolean {
  if (!targetPeriod) return true;
  const reportingPeriod = readBradValue(fields, 'reporting_period');
  if (!reportingPeriod) return true;
  const explicitQuarter = quarterKeyFromText(reportingPeriod);
  if (explicitQuarter) return explicitQuarter === targetPeriod;
  const periodDates = [...reportingPeriod.matchAll(/20\d{2}-\d{2}-\d{2}/g)].map((m) => m[0]);
  const startQuarter = periodDates[0] ? quarterKeyFromISODate(periodDates[0]) : null;
  return startQuarter ? startQuarter === targetPeriod : true;
}

function quarterKeyFromText(value: string): string | null {
  const qThenYear = /\bQ([1-4])\s*(20\d{2})\b/i.exec(value);
  if (qThenYear) return `${qThenYear[2]}-Q${qThenYear[1]}`;
  const yearThenQ = /\b(20\d{2})\s*[- ]?Q([1-4])\b/i.exec(value);
  if (yearThenQ) return `${yearThenQ[1]}-Q${yearThenQ[2]}`;
  return null;
}

function buildBradResolvedQapiSourceText(input: GenerateQapiInput): string | null {
  const extraction = input.bradExtraction;
  if (extraction?.engine !== 'brad' || !extraction.passes || !extraction.fields?.length) {
    return null;
  }
  const value = (key: string) => readBradValue(extraction.fields, key);
  const reportingPeriod = value('reporting_period');
  const periodDates = reportingPeriod ? [...reportingPeriod.matchAll(/20\d{2}-\d{2}-\d{2}/g)].map((m) => m[0]) : [];
  const periodStart = periodDates[0] ?? '';
  const periodEnd = periodDates[1] ?? '';
  const quarter = periodStart ? quarterLabel(periodStart) : '';
  const lines: string[] = [
    'QAPI BRAD-REVIEWED SOURCE RECORD',
    'Synthetic UAT Data — No Real PHI — Not For Production',
    value('organization_name') || 'Care Indeed Home Health Care, Inc.',
    reportingPeriod ? `${quarter} (${reportingPeriod})` : '',
    periodStart && periodEnd ? `${periodStart} through ${periodEnd}` : '',
    value('data_through_date') ? `Data through ${value('data_through_date')}` : '',
    value('policy_refs') ? `Policy Refs ${value('policy_refs')}` : '',
    value('packet_status_source') ? `Source packet status: ${value('packet_status_source')}` : '',
    value('source_classification') ? `Source classification: ${value('source_classification')}` : '',
    '',
    'SECTION 0 — MEETING DETAILS',
    value('event_title') ? `QAPI Meeting Title ${value('event_title')}` : '',
    value('event_date') ? `QAPI Meeting Date: ${value('event_date')}` : '',
    value('chair') ? `Chair ${value('chair')}` : '',
    value('attendees') ? `Attendees ${value('attendees')}` : '',
    value('quorum_status') ? `Quorum: ${value('quorum_status')}` : '',
    value('signoff_records') ? normalizeSignoffRecords(value('signoff_records')) : '',
    '',
    'SECTION 1 — CENSUS AND SCOPE',
    value('active_census') ? `Active Census ${integerLike(value('active_census')) ?? value('active_census')}` : '',
    value('episodes_total') ? `Patients/Episodes in Scope (Reviewed) ${integerLike(value('episodes_total')) ?? value('episodes_total')}` : '',
    value('admissions_count') ? `New SOC Admissions ${integerLike(value('admissions_count')) ?? value('admissions_count')}` : '',
    value('discharged_count') ? `Discharges ${integerLike(value('discharged_count')) ?? value('discharged_count')}` : '',
    value('recert_count') ? `Recertifications ${integerLike(value('recert_count')) ?? value('recert_count')}` : '',
    value('high_acuity_count') ? `High-Acuity Patients ${integerLike(value('high_acuity_count')) ?? value('high_acuity_count')}` : '',
    '',
    'SECTION 2 — ADVERSE EVENTS',
    adverseEventSummary(value),
    value('infections_total') ? `Summary: Total infections = ${integerLike(value('infections_total')) ?? value('infections_total')}` : '',
    value('complaints') ? `Complaints: ${value('complaints')}` : '',
    '',
    'SECTION 3 — PIP SOURCE RECORDS',
    value('pip_trigger_count') ? `${integerLike(value('pip_trigger_count')) ?? value('pip_trigger_count')} PIP triggers` : '',
    value('pip_source_record_count') ? `${integerLike(value('pip_source_record_count')) ?? value('pip_source_record_count')} PIP source records` : '',
    value('active_pip_count') ? `Active PIPs (${integerLike(value('active_pip_count')) ?? value('active_pip_count')})` : '',
    normalizePipRecords(value('pip_trigger_records') || value('pips')),
    '',
    'SECTION 4 — DECISIONS AND ACTION ITEMS',
    normalizeActionItems(value('action_items') || value('corrective_actions')),
    '',
    'SECTION 5 — PART A NARRATIVE',
    value('part_a_narrative') || '',
    '',
    'SECTION 6 — VALIDATION AND PRESENTATION NOTES',
    value('data_integrity_verdict') ? `Data integrity verdict: ${value('data_integrity_verdict')}` : '',
    value('validation_concerns') ? `Validation concerns: ${value('validation_concerns')}` : '',
    value('presentation_notes') ? `Presentation notes: ${value('presentation_notes')}` : '',
    extraction.validationSummary ? `Brad review summary: ${extraction.validationSummary}` : '',
    '',
    'SOURCE EVIDENCE MAP',
    ...extraction.fields
      .filter((field) => field.value)
      .map((field) => `${field.group ?? 'Source'} / ${field.label ?? field.key}: ${field.value} Evidence: ${field.sourceSnippet ?? ''}`),
  ];
  return lines.filter((line) => line !== '').join('\n');
}

function readBradValue(fields: readonly BradSourceField[] | undefined, key: string): string | null {
  const value = fields?.find((field) => field.key === key && field.value != null)?.value;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readPolicyIds(fields: readonly BradSourceField[] | undefined): string[] | undefined {
  const raw = readBradValue(fields, 'policy_refs');
  if (!raw) return undefined;
  const ids = [...raw.matchAll(/\b[A-Z]{2}-[A-Z]{2}-\d{3}\b/g)].map((match) => match[0]);
  return ids.length ? [...new Set(ids)] : undefined;
}

function integerLike(value: string | null): string | null {
  if (!value) return null;
  const match = /\b\d+\b/.exec(value.replace(/MOCK-[A-Z]+-\d+/g, ''));
  return match?.[0] ?? null;
}

function quarterLabel(isoDate: string): string {
  const [year, month] = isoDate.split('-');
  const q = Math.floor((Number(month) - 1) / 3) + 1;
  return Number.isFinite(q) ? `Q${q} ${year}` : '';
}

function adverseEventSummary(value: (key: string) => string | null): string {
  const hospitalizations = integerLike(value('hospitalizations'));
  const ed = integerLike(value('ed_visits_without_hospitalization'));
  const total = integerLike(value('adverse_events_total'));
  const open = integerLike(value('open_rca_count'));
  const completed = integerLike(value('completed_rca_count'));
  if (!hospitalizations && !ed && !total && !open && !completed) return '';
  return [
    `Summary: ${hospitalizations ?? 'UNKNOWN'} hospitalizations`,
    `${ed ?? 'UNKNOWN'} ED without hospitalization`,
    `Total adverse events = ${total ?? 'UNKNOWN'}`,
    `Open RCAs = ${open ?? 'UNKNOWN'}`,
    `Completed RCAs = ${completed ?? 'UNKNOWN'}`,
  ].join(' | ');
}

function normalizePipRecords(value: string | null): string {
  if (!value) return '';
  const chunks = value
    .split(/\n|;|(?=\b(?:MOCK-)?PIP[- ][A-Z0-9-]*\d{2,})/i)
    .map((line) => line.trim())
    .filter(Boolean);
  return chunks.map((line, index) => {
    const id = /\b(?:MOCK-)?PIP[- ][A-Z0-9-]*\d{2,}\b/i.exec(line)?.[0] ?? `PIP-T-${String(index + 1).padStart(3, '0')}`;
    return `${id} | ${line}`;
  }).join('\n');
}

function normalizeActionItems(value: string | null): string {
  if (!value) return '';
  return value
    .split(/\n|;|(?=\b(?:GBE|CAP|PIP|RCA)-\d{2,})/i)
    .map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      const id = /\b(?:GBE|CAP|PIP|RCA)-\d{2,}\b/i.exec(trimmed)?.[0] ?? `GBE-${String(index + 1).padStart(3, '0')}`;
      return `${id}: ${trimmed}`;
    })
    .filter(Boolean)
    .join('\n');
}

function normalizeSignoffRecords(value: string | null): string {
  if (!value) return '';
  const chunks = value
    .split(/\n|;|(?=\b(?:Administrator|Clinical Manager|QAPI Committee Chair|Committee Chair|Chair)\b)/i)
    .map((line) => line.trim())
    .filter(Boolean);
  return chunks.map((line) => {
    if (/sign-?off:/i.test(line)) return line;
    const role = /^(Administrator|Clinical Manager|QAPI Committee Chair|Committee Chair|Chair)\b/i.exec(line)?.[0] ?? 'Source';
    return `${role} Sign-off: ${line}`;
  }).join('\n');
}
