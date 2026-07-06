import type { ParsedFile } from '@/policy/evidence/intake/fileParsing';
import { deriveQapiBundle, reconstructClinicalDump, type QapiDerivedBundle, type QapiDerivedMetric } from '@/policy/brad/intake/adapters/qapiIntakeAdapter';
import { renderQapiPacketHtml } from '@/policy/qapi/renderQapiPacket';
import type { AlphaPacketPreview, AlphaPacketPreviewPage } from './defensibleAlphaDriver';

/* ══════════════════════════════════════════════════════════════════════
   QAPI packet generation from a confirmed Brad source bundle.

   Bypasses the legacy DefenCIble Alpha iframe studio (care_indeed_pdf_
   studio.html) entirely for QAPI — the same way the admission flow already
   bypasses it via renderAdmissionPdf for reliability. Two render paths:

     1. The upload reconstructs as a real ClinicalDump -> renderQapiPacketHtml
        (the existing, fully-built System A renderer) produces the full
        survey-defensible packet HTML from real rollup math.
     2. The upload is unstructured/messy (the real-world "shell packet" bug
        case) -> a lighter "Brad Draft — Needs Review" HTML is built directly
        from the heuristic QapiDerivedBundle, so a reviewed but low-confidence
        upload still produces real, populated packet content — never a blank
        shell.

   Either way, packet generation consumes the reviewed bundle, not the raw
   upload directly.
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

/** Builds a real, populated (never blank) draft HTML packet from the heuristic bundle. */
function buildDraftQapiPacketHtml(bundle: QapiDerivedBundle, eventTitle: string): string {
  const pipRows = bundle.pipCorrectiveAction.length
    ? bundle.pipCorrectiveAction.map((p) => `<tr>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(p.trigger)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(p.issueSummary)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;text-transform:uppercase;font-size:10px;font-weight:700;color:#C74601;">${esc(p.severity)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #EAE4E3;">${esc(p.ownerRoleSuggested)}</td>
      </tr>`).join('')
    : '<tr><td colspan="4" style="padding:10px;color:#A8A29E;">No PIP/corrective-action triggers derived from this source.</td></tr>';

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(eventTitle)} — Brad Draft QAPI Packet</title></head>
  <body style="margin:0;padding:0;background:#fff;">
    <section class="pg" style="width:8.5in;min-height:11in;box-sizing:border-box;padding:0.6in;font-family:Roboto,sans-serif;color:#1F1C1B;">
      <div style="border:1px solid #F6C99A;background:#FFF7EF;border-radius:12px;padding:12px 16px;margin-bottom:16px;">
        <strong style="color:#C74601;">DRAFT — BRAD GENERATED — REQUIRES HUMAN REVIEW</strong>
        <p style="margin:6px 0 0;font-size:12px;color:#524D4B;">${esc(bundle.overallNote)}</p>
      </div>
      <h2 style="font-family:Montserrat,sans-serif;">${esc(eventTitle)}</h2>
      ${section('Meeting Details', metricRow('Attendee roster', bundle.meetingDetails.attendeeRoster) + metricRow('Quorum status', bundle.meetingDetails.quorumStatus))}
      ${section('Census / Population', Object.entries(bundle.censusPopulation).map(([k, v]) => metricRow(k, v)).join(''))}
      ${section('High-Risk Rollup', Object.entries(bundle.highRiskRollup).map(([k, v]) => metricRow(k, v)).join(''))}
      ${section('Adverse Events', Object.entries(bundle.adverseEvents).map(([k, v]) => metricRow(k, v)).join(''))}
      <h3 style="margin:24px 0 8px;font-family:Montserrat,sans-serif;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#007970;">PIP / Corrective Action Candidates</h3>
      <table style="width:100%;border-collapse:collapse;font-family:Roboto,sans-serif;font-size:13px;">
        <thead><tr style="text-align:left;font-size:10px;text-transform:uppercase;color:#747470;"><th style="padding:6px 10px;">Trigger</th><th style="padding:6px 10px;">Issue</th><th style="padding:6px 10px;">Severity</th><th style="padding:6px 10px;">Owner</th></tr></thead>
        <tbody>${pipRows}</tbody>
      </table>
      ${section('Chart Audit / Documentation Integrity', Object.entries(bundle.chartAuditDocumentationIntegrity).map(([k, v]) => metricRow(k, v)).join(''))}
      ${section('Infection Control', Object.entries(bundle.infectionControl).map(([k, v]) => metricRow(k, v)).join(''))}
      ${section('Medication Safety', metricRow('Medication event line list', bundle.medicationSafety.medicationEventLineList))}
    </section>
  </body></html>`;
}

export type QapiPacketGenerationInput = {
  parsed: ParsedFile;
  bundle: QapiDerivedBundle;
  eventId: string;
  eventTitle: string;
  eventDateISO: string;
};

/**
 * Generate the QAPI packet preview from the confirmed bundle. Never returns a
 * blank/shell packet when the source parsed to at least one record — the
 * draft path always renders the derived metrics, flagged for review.
 */
export async function generateQapiPacketPreview(input: QapiPacketGenerationInput): Promise<AlphaPacketPreview> {
  const dump = reconstructClinicalDump(input.parsed);
  const html = dump
    ? renderQapiPacketHtml(dump, input.eventDateISO)
    : buildDraftQapiPacketHtml(input.bundle, input.eventTitle);
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
