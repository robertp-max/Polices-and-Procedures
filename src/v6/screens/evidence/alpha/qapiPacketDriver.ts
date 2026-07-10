import type { ParsedFile } from '@/policy/evidence/intake/fileParsing';
import {
  deriveQapiBundle,
  reconstructClinicalDump,
  extractQapiTextAggregates,
  type QapiDerivedBundle,
  type QapiDerivedMetric,
  type QapiTextAggregates,
} from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import { buildQapiFormDrafts, type FilledFormDraft } from '@/policy/brad/intake/qapiFormFiller';
import { renderQapiPacketHtml, renderQapiPacketHtmlFromRollup, type QapiPacketOptions } from '@/policy/qapi/renderQapiPacket';
import type { QapiRollup } from '@/policy/qapi/qapiExtraction';
import { buildQapiDateWindow } from '@/policy/qapi/qapiDateWindow';
import type { AddendumReference } from '@/policy/qapi/personnelActionAddendum';
import type { ValidationFinding } from '@/policy/qapi/qapiTypes';
import type { AlphaPacketPreview, AlphaPacketPreviewPage } from './defensibleAlphaDriver';

/* ══════════════════════════════════════════════════════════════════════
   QAPI packet generation from a confirmed Brad source bundle.

   Requirement: the user dumps source data in WHATEVER format (structured
   JSON, raw narrative text, messy exports) and always receives the FULL
   survey-defensible packet — never a thin summary. Two data paths, ONE
   renderer:

     1. The upload reconstructs as a real ClinicalDump → extractQapiRollup
        provides the rollup from real per-patient math.
     2. Anything else → the reviewed QapiDerivedBundle + narrative-text
        aggregates are bridged into the SAME QapiRollup shape (every
        unknown recorded as a source-data exception, never invented), and
        the same full renderer runs with a "Brad-derived draft" notice on
        page 1, a derived marker in every page footer, and a Source
        Derivation appendix showing each value's confidence + verbatim
        source quote.

   Either way, packet generation consumes the reviewed bundle, not the raw
   upload directly. Bypasses the legacy DefenCIble Alpha iframe studio
   (care_indeed_pdf_studio.html) entirely — same precedent as admission.
   ══════════════════════════════════════════════════════════════════════ */

export { deriveQapiBundle };
export type { QapiDerivedBundle };

function splitPgPages(html: string): AlphaPacketPreviewPage[] {
  const doc = document.implementation.createHTMLDocument('qapi-preview');
  doc.body.innerHTML = html;
  const nodes = Array.from(doc.body.querySelectorAll<HTMLElement>('section.pg'));
  const styles = Array.from(doc.querySelectorAll('style')).map((s) => s.outerHTML).join('\n');
  if (!nodes.length) {
    return [{ pageNumber: 1, pageType: 'section', title: 'QAPI Packet', html: `${styles}${html}`, widthInches: 8.5, heightInches: 11 }];
  }
  return nodes.map((node, index) => ({
    pageNumber: index + 1,
    pageType: 'section',
    title: node.querySelector('h2')?.textContent?.trim() || `Page ${index + 1}`,
    html: `${styles}${node.outerHTML}`,
    widthInches: 8.5,
    heightInches: 11,
  }));
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));

/* ─── Derived rollup bridge (unstructured dump → full packet) ─────────── */

function metricNumber(m: QapiDerivedMetric): number | null {
  return typeof m.value === 'number' && Number.isFinite(m.value) ? m.value : null;
}

interface DerivedPacketInputs {
  roll: QapiRollup;
  ref: AddendumReference;
  opts: QapiPacketOptions;
}

/** Bridge the reviewed derived bundle + text aggregates into the canonical
    QapiRollup consumed by the full packet renderer. Unknowns become 0 WITH a
    recorded source-data exception — the packet stays honest and unlockable
    until a human confirms. */
export function buildDerivedRollup(
  bundle: QapiDerivedBundle,
  agg: QapiTextAggregates | null,
  eventDateISO: string,
): DerivedPacketInputs {
  const window = buildQapiDateWindow(eventDateISO, { reviewQuarter: agg?.reviewQuarter ?? undefined });
  const exceptions: ValidationFinding[] = [{
    pass: false,
    severity: 'high',
    path: 'source',
    reason: 'Packet derived from an unstructured source dump (no structured ClinicalDump schema). All values were recovered deterministically from the source and are flagged for human review.',
    remediation: 'Review each value against the Source Derivation appendix; upload a structured export for full per-patient math.',
  }];
  const gap = (path: string, reason: string): 0 => {
    exceptions.push({
      pass: false,
      severity: 'medium',
      path,
      reason,
      remediation: 'Confirm manually from the source records before final lock.',
    });
    return 0;
  };
  const pull = (m: QapiDerivedMetric, path: string): number => {
    const v = metricNumber(m);
    return v ?? gap(path, m.note ?? 'No source evidence recognized in this upload.');
  };

  const activeCensus = pull(bundle.censusPopulation.activeCensus, 'census.activeCensus');
  const discharged = pull(bundle.censusPopulation.dischargedCount, 'census.discharged');
  const patientsInScope = agg?.episodesTotal?.value ?? (activeCensus + discharged);
  const infectionsTotal = pull(bundle.adverseEvents.infectionsTotal, 'infections.total');
  const hai = pull(bundle.infectionControl.healthcareAssociated, 'infections.healthcareAssociated');
  if (infectionsTotal > 0 && hai > 0 && infectionsTotal >= hai) {
    exceptions.push({
      pass: false, severity: 'low', path: 'infections.communityAcquired',
      reason: `Community-acquired count inferred as total (${infectionsTotal}) minus healthcare-associated (${hai}).`,
      remediation: 'Confirm the community/HAI split against the infection line list.',
    });
  }

  const incidentsTotal = agg?.adverseEventsCount?.value ?? pull(bundle.adverseEvents.hospitalizationsTotal, 'incidents.total');
  const byCategory: Record<string, number> = {};
  const hosp = metricNumber(bundle.adverseEvents.hospitalizationsTotal);
  const falls = metricNumber(bundle.adverseEvents.fallsTotal);
  if (hosp != null) byCategory['unplanned hospitalization'] = hosp;
  if (falls != null && falls > 0) byCategory['falls (keyword match)'] = falls;

  const roll: QapiRollup = {
    window,
    census: {
      patientsInScope,
      activeCensus,
      discharged,
      recertDue: pull(bundle.censusPopulation.recertificationCount, 'census.recertDue'),
      highAcuity: pull(bundle.censusPopulation.highAcuityCount, 'census.highAcuity'),
      uniquePatients: patientsInScope,
      duplicateClientIds: [],
    },
    highRisk: {
      immediateActionCases: pull(bundle.highRiskRollup.immediateActionCases, 'highRisk.immediateActionCases'),
      qapiRequiredCases: pull(bundle.highRiskRollup.clinicianPipOrLicenseFlagCount, 'highRisk.qapiRequiredCases'),
      topFlags: [],
      systemicThemes: bundle.pipCorrectiveAction.map((p) => p.trigger),
    },
    incidents: {
      total: incidentsTotal,
      byCategory,
      openRca: gap('incidents.openRca', 'Open-RCA status not recovered from the source dump.'),
      unreported: 0,
      excludedFutureDated: 0,
    },
    infections: {
      total: infectionsTotal,
      healthcareAssociated: hai,
      communityAcquired: infectionsTotal >= hai ? infectionsTotal - hai : 0,
      unreportedToState: gap('infections.unreportedToState', 'State-reporting status not recovered from the source dump.'),
      excludedFutureDated: 0,
    },
    labs: {
      criticalTotal: 0,
      criticalUnreported: gap('labs.criticalUnreported', 'No lab records recognized in the source dump.'),
    },
    documentation: {
      oasisLateSoc: pull(bundle.chartAuditDocumentationIntegrity.oasisLateSoc, 'documentation.oasisLateSoc'),
      pocMissingF2F: pull(bundle.chartAuditDocumentationIntegrity.pocMissingF2F, 'documentation.pocMissingF2F'),
      pocUnsignedOrMissingSignature: pull(bundle.chartAuditDocumentationIntegrity.pocUnsignedOrMissingSignature, 'documentation.pocUnsigned'),
      homeboundNotJustified: gap('documentation.homeboundNotJustified', 'Homebound-justification findings not recovered from the source dump.'),
      medReconMismatch: pull(bundle.chartAuditDocumentationIntegrity.medReconciliationMismatch, 'documentation.medReconMismatch'),
      pressureInjuryNoWoundOrders: gap('documentation.pressureInjury', 'Wound-order findings not recovered from the source dump.'),
      therapyNeedNoOrder: gap('documentation.therapyNeed', 'Therapy-order findings not recovered from the source dump.'),
    },
    exceptions,
  };

  const disciplinary = metricNumber(bundle.highRiskRollup.clinicianDisciplinaryActionCount) ?? 0;
  const ref: AddendumReference = {
    addendumId: `ADD-DERIVED-${window.quarterLabel.replace(/\s+/g, '-')}`,
    hash: 'derived source — sealed addendum not generated from an unstructured dump',
    personnelActionReviewsOpened: disciplinary,
    countByCategory: disciplinary > 0 ? { disciplinary_review: disciplinary } : {},
    statusSummary: disciplinary > 0
      ? `${disciplinary} disciplinary review trigger(s) recovered from the source dump — restricted HR review required.`
      : 'No personnel-action reviews recovered from the source dump.',
    confidentialityStatement: 'Personnel details are intentionally excluded from this derived packet. Review the source disciplinary records under restricted access.',
  };

  const quorumValue = typeof bundle.meetingDetails.quorumStatus.value === 'string' ? bundle.meetingDetails.quorumStatus.value : null;
  const rosterValue = typeof bundle.meetingDetails.attendeeRoster.value === 'string' ? bundle.meetingDetails.attendeeRoster.value : null;
  const opts: QapiPacketOptions = {
    derivedNotice: bundle.overallNote,
    quorumOverride: quorumValue ?? undefined,
    attendanceNote: rosterValue
      ? `${rosterValue} (recovered from the source attendance record — individual names/roles require confirmation against the source).`
      : undefined,
    approvers: agg?.signoffRoles.length ? agg.signoffRoles.map((role) => ({ role })) : undefined,
  };

  return { roll, ref, opts };
}

/* ─── Source Derivation appendix (confidence + verbatim quotes) ───────── */

function metricRow(label: string, m: QapiDerivedMetric): string {
  const confColor = m.confidence === 'high' ? '#008540' : m.confidence === 'low' ? '#B45309' : '#747470';
  const valueText = Array.isArray(m.value) ? m.value.join(', ') : m.value == null ? '—' : String(m.value);
  const quotes = m.sourceQuotes.slice(0, 2).map((q) => `<div style="font-style:italic;color:#747470;font-size:11px;margin-top:2px;">&ldquo;${esc(q)}&rdquo;</div>`).join('');
  return `<tr>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(label)}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;font-weight:600;">${esc(valueText)}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;color:${confColor};text-transform:uppercase;font-size:10px;font-weight:700;">${m.confidence}${m.needsReview ? ' · needs review' : ''}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${m.note ? `<div style="font-size:11px;color:#747470;">${esc(m.note)}</div>` : ''}${quotes}</td>
  </tr>`;
}

function section(title: string, rows: string): string {
  return `<h3 style="margin:24px 0 8px;font-family:Montserrat,sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#007970;">${esc(title)}</h3>
  <table style="width:100%;border-collapse:collapse;font-family:Roboto,sans-serif;font-size:13px;">
    <thead><tr style="text-align:left;font-size:10px;text-transform:uppercase;color:#747470;"><th style="padding:6px 10px;">Metric</th><th style="padding:6px 10px;">Value</th><th style="padding:6px 10px;">Confidence</th><th style="padding:6px 10px;">Notes / source</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

const PG_STYLE = 'width:8.5in;min-height:11in;box-sizing:border-box;padding:0.6in;font-family:Roboto,sans-serif;color:#1F1C1B;background:#fff;page-break-after:always;';

function appendixPage(eventTitle: string, pageTitle: string, body: string, banner = ''): string {
  return `<section class="pg" style="${PG_STYLE}">
    ${banner}
    <h2 style="font-family:Montserrat,sans-serif;margin:${banner ? '0' : '0 0 4px'};">${esc(pageTitle)}</h2>
    <div style="font-size:11px;color:#747470;margin-bottom:12px;">${esc(eventTitle)} — every derived value with its confidence and verbatim source quote · requires human review</div>
    ${body}
  </section>`;
}

/** Appendix pages proving where every derived number came from. */
export function buildDerivationAppendixHtml(bundle: QapiDerivedBundle, eventTitle: string): string {
  const pipRows = bundle.pipCorrectiveAction.length
    ? bundle.pipCorrectiveAction.map((p) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(p.trigger)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(p.issueSummary)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;text-transform:uppercase;font-size:10px;font-weight:700;color:#C74601;">${esc(p.severity)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(p.ownerRoleSuggested)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" style="padding:10px;color:#A8A29E;">No PIP/corrective-action triggers derived from this source.</td></tr>';

  const banner = `<div style="border:1px solid #F6C99A;background:#FFF7EF;border-radius:12px;padding:12px 16px;margin-bottom:16px;">
    <strong style="color:#C74601;">SOURCE DERIVATION APPENDIX — BRAD GENERATED — REQUIRES HUMAN REVIEW</strong>
    <p style="margin:6px 0 0;font-size:12px;color:#524D4B;">${esc(bundle.overallNote)}</p>
  </div>`;

  const page1 = appendixPage(eventTitle, 'Source Derivation — Meeting, Census & High-Risk',
    section('Meeting Details', metricRow('Attendee roster', bundle.meetingDetails.attendeeRoster) + metricRow('Quorum status', bundle.meetingDetails.quorumStatus))
    + section('Census / Population', Object.entries(bundle.censusPopulation).map(([k, v]) => metricRow(k, v)).join(''))
    + section('High-Risk Rollup', Object.entries(bundle.highRiskRollup).map(([k, v]) => metricRow(k, v)).join('')),
    banner);

  const page2 = appendixPage(eventTitle, 'Source Derivation — Adverse Events & PIP / Corrective Action',
    section('Adverse Events', Object.entries(bundle.adverseEvents).map(([k, v]) => metricRow(k, v)).join(''))
    + `<h3 style="margin:24px 0 8px;font-family:Montserrat,sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#007970;">PIP / Corrective Action Candidates</h3>
      <table style="width:100%;border-collapse:collapse;font-family:Roboto,sans-serif;font-size:13px;">
        <thead><tr style="text-align:left;font-size:10px;text-transform:uppercase;color:#747470;"><th style="padding:6px 10px;">Trigger</th><th style="padding:6px 10px;">Issue</th><th style="padding:6px 10px;">Severity</th><th style="padding:6px 10px;">Owner</th></tr></thead>
        <tbody>${pipRows}</tbody>
      </table>`);

  const page3 = appendixPage(eventTitle, 'Source Derivation — Documentation, Infection Control & Medication Safety',
    section('Chart Audit / Documentation Integrity', Object.entries(bundle.chartAuditDocumentationIntegrity).map(([k, v]) => metricRow(k, v)).join(''))
    + section('Infection Control', Object.entries(bundle.infectionControl).map(([k, v]) => metricRow(k, v)).join(''))
    + section('Medication Safety', metricRow('Medication event line list', bundle.medicationSafety.medicationEventLineList)));

  return `${page1}${page2}${page3}`;
}

/* ─── Filled form draft pages ─────────────────────────────────────────── */

function formFieldRow(label: string, value: string | null, confidence: string, sourceQuote?: string): string {
  const valHtml = value == null
    ? '<span style="color:#B45309;font-weight:600;">— manual entry required —</span>'
    : esc(value);
  const quote = sourceQuote ? `<div style="font-style:italic;color:#747470;font-size:10.5px;margin-top:2px;">&ldquo;${esc(sourceQuote.slice(0, 160))}&rdquo;</div>` : '';
  return `<tr>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;width:34%;color:#007970;font-weight:600;">${esc(label)}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${valHtml}${quote}</td>
    <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;text-transform:uppercase;font-size:10px;font-weight:700;color:${value == null ? '#747470' : '#B45309'};">${value == null ? 'none' : confidence} · needs review</td>
  </tr>`;
}

function formLineItemsTable(items: NonNullable<FilledFormDraft['lineItems']>): string {
  return `<table style="width:100%;border-collapse:collapse;font-family:Roboto,sans-serif;font-size:12px;margin-top:12px;">
    <thead><tr style="text-align:left;font-size:10px;text-transform:uppercase;color:#747470;">${items.columns.map((c) => `<th style="padding:6px 10px;">${esc(c)}</th>`).join('')}</tr></thead>
    <tbody>${items.rows.map((r) => `<tr>${r.map((cell) => `<td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;vertical-align:top;">${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table>${items.note ? `<p style="font-size:10.5px;color:#747470;margin-top:6px;">${esc(items.note)}</p>` : ''}`;
}

/** One draft page per required form — Brad's filled-out starting point. */
export function buildFormDraftPagesHtml(drafts: FilledFormDraft[], eventTitle: string): string {
  return drafts.map((d) => {
    const banner = `<div style="border:1px solid #F6C99A;background:#FFF7EF;border-radius:12px;padding:10px 16px;margin-bottom:14px;">
      <strong style="color:#C74601;">FORM DRAFT — BRAD FILLED FROM SOURCE DUMP — REQUIRES HUMAN REVIEW</strong>
      <p style="margin:4px 0 0;font-size:11.5px;color:#524D4B;">${esc(d.note)}</p>
    </div>`;
    const fieldsTable = d.fields.length
      ? `<table style="width:100%;border-collapse:collapse;font-family:Roboto,sans-serif;font-size:12.5px;">
          <tbody>${d.fields.map((f) => formFieldRow(f.label, f.value, f.confidence, f.sourceQuote)).join('')}</tbody>
        </table>`
      : '<p style="color:#747470;font-size:12px;">No auto-derivable fields — complete this form manually from the source records.</p>';
    return appendixPage(eventTitle, `Form Draft — ${d.formId} · ${d.title}`, `${fieldsTable}${d.lineItems ? formLineItemsTable(d.lineItems) : ''}`, banner);
  }).join('');
}

/* ─── Public driver ───────────────────────────────────────────────────── */

export type QapiPacketGenerationInput = {
  parsed: ParsedFile;
  bundle: QapiDerivedBundle;
  eventId: string;
  eventTitle: string;
  eventDateISO: string;
};

/**
 * Generate the FULL QAPI packet preview from the confirmed bundle — for
 * every source format. Structured dumps use real per-patient math; anything
 * else renders the same packet from the derived rollup with review flags and
 * the Source Derivation appendix. Never a blank/thin shell.
 */
export async function generateQapiPacketPreview(input: QapiPacketGenerationInput): Promise<AlphaPacketPreview> {
  const dump = reconstructClinicalDump(input.parsed);
  let html: string;
  if (dump) {
    html = renderQapiPacketHtml(dump, input.eventDateISO, { eventId: input.eventId });
  } else {
    const fullText = input.parsed.records.map((r) => r.text ?? '').join('\n');
    const agg = fullText.trim().length >= 200 ? extractQapiTextAggregates(fullText) : null;
    const { roll, ref, opts } = buildDerivedRollup(input.bundle, agg, input.eventDateISO);
    const full = renderQapiPacketHtmlFromRollup(roll, ref, { ...opts, eventId: input.eventId });
    // Full packet + derivation appendix + a Brad-filled draft of EVERY
    // required form for this event, all from the dumped documents.
    const formDrafts = buildQapiFormDrafts({ bundle: input.bundle, agg, text: fullText, eventId: input.eventId, eventDateISO: input.eventDateISO });
    html = full.replace('</body>', `${buildDerivationAppendixHtml(input.bundle, input.eventTitle)}${buildFormDraftPagesHtml(formDrafts, input.eventTitle)}</body>`);
  }
  const pages = splitPgPages(html);
  return {
    packetId: `qapi-${input.eventId}-${input.eventDateISO}`,
    templateId: 'qapi_quarterly',
    title: `${input.eventTitle} — QAPI Packet`,
    pageCount: pages.length,
    source: 'defensible-alpha',
    pages,
    generatedAt: new Date().toISOString(),
    status: pages.length ? 'generated' : 'failed',
  };
}
