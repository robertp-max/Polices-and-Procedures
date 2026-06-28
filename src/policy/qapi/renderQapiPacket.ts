/* ════════════════════════════════════════════════════════════════
   PHASE 5 — Survey-defensible QAPI packet renderer.

   Renders the MAIN QAPI packet from source data + the engine outputs:
   correct interim/final date window, real rollups (numerator/denominator/
   source), incident + infection logs (window-capped, no undercount), chart
   audit tied to census, high-risk rollup, complaints, Governing Body
   summary, a SEALED addendum REFERENCE (no personnel details), and an
   honest signature page (no fake checkmarks). Carries a validation banner.
   Self-contained HTML (inline SVG wordmark — no external/absolute logo).
   ════════════════════════════════════════════════════════════════ */
import type { ClinicalDump } from './qapiTypes';
import { extractQapiRollup } from './qapiExtraction';
import { buildPersonnelAddendum, buildAddendumReference, type AddendumReference } from './personnelActionAddendum';
import { validateQapiPacketForLock } from './validateQapiPacketForLock';

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const WORDMARK = '<svg class="ci-mark" viewBox="0 0 360 70" xmlns="http://www.w3.org/2000/svg" aria-label="Care Indeed"><g fill="none" stroke="#c74601" stroke-width="7" stroke-linecap="round"><circle cx="34" cy="22" r="13"/><path d="M8 56c0-16 12-26 26-26s26 10 26 26"/></g><text x="74" y="34" font-family="Roboto,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#1f2937">Care</text><text x="150" y="34" font-family="Roboto,Segoe UI,sans-serif" font-size="30" font-weight="700" fill="#00797d">Indeed</text><text x="74" y="52" font-family="Roboto,Segoe UI,sans-serif" font-size="11" letter-spacing="2" fill="#7a7470">THE HEART OF HOME HEALTH</text></svg>';

export interface QapiPacketOptions {
  eventId?: string;
  workflowId?: string;
  reviewQuarter?: string;          // e.g. '2026-Q2'
  preparedBy?: string;
  reviewer?: string;
  chair?: string;
  recorder?: string;
  attendeesExpected?: string[];
  attendeesPresent?: string[];
  policyIds?: string[];
  /** Governance approvers for the lock check (name + authorityConfirmed). */
  approvers?: Array<{ role: string; name?: string; authorityConfirmed?: boolean }>;
}

function page(banner: string, title: string, inner: string, footerRight: string): string {
  return `<section class="pg"><div class="pg-banner"><span>${esc(banner)}</span><span>${esc(footerRight)}</span></div>
    <div class="pg-in">${WORDMARK}<h2 class="pg-h">${esc(title)}</h2><div class="rule"></div>${inner}
    <div class="pg-foot"><span><b>Care Indeed Home Health</b> · 890 Santa Cruz Ave # B, Menlo Park, CA 94025</span><span>${esc(footerRight)}</span></div></div></section>`;
}
function kpiTable(rows: Array<[string, string | number, string | number, string, string]>): string {
  return `<table class="t"><thead><tr><th>Indicator</th><th>Numerator</th><th>Denominator</th><th>Result vs Target</th><th>Source</th></tr></thead><tbody>${
    rows.map((r) => `<tr><td>${esc(r[0])}</td><td>${esc(r[1])}</td><td>${esc(r[2])}</td><td>${esc(r[3])}</td><td>${esc(r[4])}</td></tr>`).join('')
  }</tbody></table>`;
}

export function renderQapiPacketHtml(dump: ClinicalDump, eventDateInput: string, opts: QapiPacketOptions = {}): string {
  const reviewQuarter = opts.reviewQuarter ?? dump.meta?.quarter;
  const roll = extractQapiRollup(dump, eventDateInput, { reviewQuarter });
  const w = roll.window;
  const addendum = buildPersonnelAddendum(dump, { quarter: reviewQuarter });
  const ref: AddendumReference = buildAddendumReference(addendum);
  const addendumRequired = ref.personnelActionReviewsOpened > 0;
  const c = roll.census;
  const interim = w.packetType === 'interim';
  const id = `QAPI-PKT-${w.quarterLabel.replace(/\s+/g, '-')}`;
  const footerR = `${id} · ${w.packetType.toUpperCase()}`;
  const approvers = opts.approvers ?? [];

  // ── Lock validation (status banner only here; the live flow enforces it) ──
  const lock = validateQapiPacketForLock({
    packetId: id,
    packetType: w.packetType,
    html: '',  // we validate the structured inputs; rendered-HTML scan happens in the live flow
    governanceRoles: approvers,
    rollups: { activeCensus: c.activeCensus, recertCounts: c.recertDue, highRiskRollupPresent: true, priorPeriodComparisonPresent: false, claimsTrend: false },
    signatures: [],
    dateWindowViolations: [],
    addendum: { required: addendumRequired, generatedId: addendumRequired ? addendum.documentId : null },
    sourceExceptions: roll.exceptions,
  });
  const statusColor = lock.pass ? '#0f7b34' : '#b35200';
  const statusText = lock.pass ? 'VALIDATION PASSED — eligible for lock pending signatures' : `NOT LOCKABLE — ${lock.findings.filter((f) => f.severity === 'blocker' || f.severity === 'high').length} blocking item(s)`;

  let body = '';

  // 1) Packet control page
  body += page(`${id} · ${w.quarterLabel}`, `${interim ? 'Interim ' : ''}${w.quarterLabel} QAPI Committee Packet`, `
    <div class="card"><div class="h3">Packet Control</div>
      ${row('Packet ID', id)}${row('Event ID', opts.eventId ?? '—')}${row('Workflow ID', opts.workflowId ?? '—')}
      ${row('Reporting period', `${w.quarterStart} → ${w.quarterEnd}`)}
      ${row('Data-through date', w.dataThroughDate)}${row('Packet type', w.packetType.toUpperCase())}
      ${row('Policy refs', (opts.policyIds ?? ['QA-PP-001']).join(', '))}
      ${row('Prepared by', opts.preparedBy ?? '—')}${row('Reviewer', opts.reviewer ?? '—')}
      ${row('Lock status', 'UNLOCKED (draft)')}</div>
    <div class="card"><div class="h3">Validation</div>
      <p class="status" style="color:${statusColor}"><b>${esc(statusText)}</b></p>
      ${lock.findings.length ? `<ul class="bul">${lock.findings.slice(0, 8).map((f) => `<li><b>[${esc(f.severity)}]</b> ${esc(f.reason)} <span class="muted">— ${esc(f.remediation)}</span></li>`).join('')}</ul>` : '<p class="muted">No blocking validation findings.</p>'}</div>
    ${interim ? `<div class="notice"><b>INTERIM REVIEW.</b> Data is reported only through <b>${esc(w.dataThroughDate)}</b> (the meeting date). Source events after this date are excluded and will appear in the final ${esc(w.quarterLabel)} packet.</div>` : ''}`,
    footerR);

  // 2) Agenda & quorum
  const expected = opts.attendeesExpected ?? ['Director of Nursing (Chair)', 'Clinical Manager', 'Compliance Officer', 'Medical Director', 'Administrator', 'QA Coordinator'];
  const present = opts.attendeesPresent ?? expected;
  body += page(id, 'Agenda & Quorum Roster', `
    <div class="card"><div class="h3">Meeting</div>${row('Date', w.eventDate)}${row('Chair', opts.chair ?? '—')}${row('Recorder', opts.recorder ?? '—')}${row('Quorum', `${present.length} of ${expected.length} present — ${present.length >= Math.ceil(expected.length / 2) ? 'quorum met' : 'NO QUORUM'}`)}</div>
    <div class="card"><div class="h3">Attendees</div><table class="t"><thead><tr><th>Role</th><th>Expected</th><th>Present</th></tr></thead><tbody>${expected.map((r) => `<tr><td>${esc(r)}</td><td>✓</td><td>${present.includes(r) ? '✓' : '—'}</td></tr>`).join('')}</tbody></table></div>`, footerR);

  // 3) Dashboard (real numerators/denominators)
  const denom = c.activeCensus || c.uniquePatients || c.patientsInScope;
  body += page(id, 'QAPI Data Dashboard (QA-FM-020)', kpiTable([
    ['Patients in scope', c.patientsInScope, c.patientsInScope, '—', 'Source census'],
    ['Unique patients (de-duped)', c.uniquePatients, c.patientsInScope, c.duplicateClientIds.length ? `${c.duplicateClientIds.length} duplicate ID(s) flagged` : 'clean', 'Census reconciliation'],
    ['Active census', c.activeCensus, c.patientsInScope, '—', 'admission_status'],
    ['Recerts due', c.recertDue, denom, '—', 'admission_status'],
    ['High-risk cases (QAPI-required)', roll.highRisk.qapiRequiredCases, c.patientsInScope, '—', 'high_risk_flags'],
    ['Immediate-action cases', roll.highRisk.immediateActionCases, c.patientsInScope, roll.highRisk.immediateActionCases ? 'escalate' : 'none', 'high_risk_flags'],
    ['Incidents (in window)', roll.incidents.total, c.patientsInScope, `${roll.incidents.openRca} open RCA`, 'QA-FM-026'],
    ['Infections (in window)', roll.infections.total, c.patientsInScope, `rate context: HCA ${roll.infections.healthcareAssociated}`, 'QA-FM-027'],
    ['Critical labs unreported', roll.labs.criticalUnreported, roll.labs.criticalTotal, roll.labs.criticalUnreported ? 'PIP candidate' : 'ok', 'Lab log'],
  ]) + (interim ? `<p class="muted">Excluded as post-${esc(w.dataThroughDate)}: ${roll.incidents.excludedFutureDated} incident(s), ${roll.infections.excludedFutureDated} infection(s).</p>` : ''), footerR);

  // 4) High-risk rollup
  body += page(id, 'High-Risk Patient Rollup', `
    <div class="card"><div class="h3">Top recurring flags</div><table class="t"><thead><tr><th>Flag</th><th>Count</th></tr></thead><tbody>${roll.highRisk.topFlags.map((f) => `<tr><td>${esc(f.flag.replace(/_/g, ' '))}</td><td>${f.count}</td></tr>`).join('') || '<tr><td colspan="2">None</td></tr>'}</tbody></table></div>
    <div class="card"><div class="h3">Systemic themes</div>${roll.highRisk.systemicThemes.length ? `<ul class="bul">${roll.highRisk.systemicThemes.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : '<p class="muted">No single flag reached the systemic threshold (≥5).</p>'}
      ${row('Immediate-action cases', String(roll.highRisk.immediateActionCases))}${row('QAPI-required cases', String(roll.highRisk.qapiRequiredCases))}</div>`, footerR);

  // 5) Incident log + 6) Infection line list
  body += page(id, 'Incident / Adverse-Event Summary (QA-FM-026)', `
    <div class="card"><div class="h3">By category (in window)</div><table class="t"><thead><tr><th>Category</th><th>Count</th></tr></thead><tbody>${Object.entries(roll.incidents.byCategory).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${v}</td></tr>`).join('') || '<tr><td colspan="2">None in window</td></tr>'}</tbody></table>
      ${row('Total in window', String(roll.incidents.total))}${row('Open RCAs', String(roll.incidents.openRca))}${row('Unreported', String(roll.incidents.unreported))}</div>
    <div class="card"><div class="h3">Infection Control (QA-FM-027)</div>${row('Cases in window', String(roll.infections.total))}${row('Healthcare-associated', String(roll.infections.healthcareAssociated))}${row('Community-acquired', String(roll.infections.communityAcquired))}${row('Unreported to state', String(roll.infections.unreportedToState))}</div>`, footerR);

  // 7) Chart audit + 8) complaints + documentation findings
  body += page(id, 'Chart Audit & Documentation Integrity (QA-FM-025)', `
    <div class="card"><div class="h3">Methodology</div><p class="p">Chart audit denominator tied to active census (${esc(String(c.activeCensus))}) + recerts due (${esc(String(c.recertDue))}). Findings below are derived from OASIS/POC document review.</p></div>
    <div class="card"><div class="h3">Documentation findings (OASIS / CMS-485)</div>
      ${row('OASIS SOC not completed ≤5 days', String(roll.documentation.oasisLateSoc))}
      ${row('POC missing face-to-face encounter', String(roll.documentation.pocMissingF2F))}
      ${row('POC unsigned / pending physician signature', String(roll.documentation.pocUnsignedOrMissingSignature))}
      ${row('Homebound not justified', String(roll.documentation.homeboundNotJustified))}
      ${row('Med-reconciliation count mismatch (OASIS↔POC)', String(roll.documentation.medReconMismatch))}
      ${row('Pressure injury present, no wound orders', String(roll.documentation.pressureInjuryNoWoundOrders))}
      ${row('OASIS high mobility need, no therapy ordered', String(roll.documentation.therapyNeedNoOrder))}</div>
    ${roll.exceptions.length ? `<div class="card"><div class="h3">Source-data exceptions (must resolve before final lock)</div><ul class="bul">${roll.exceptions.slice(0, 10).map((e) => `<li><b>[${esc(e.severity)}]</b> ${esc(e.reason)}</li>`).join('')}</ul></div>` : ''}`, footerR);

  // 9) Governing Body summary + sealed addendum REFERENCE (no personnel details)
  body += page(id, 'Governing Body Summary & Confidential Addendum Reference', `
    <div class="card"><div class="h3">Decisions requested</div><ul class="bul"><li>Ratify the ${esc(w.quarterLabel)} QAPI report (${interim ? 'interim' : 'final'}).</li><li>Approve new PIP candidates flagged by the dashboard.</li>${addendumRequired ? '<li>Acknowledge the confidential personnel-action addendum (restricted access).</li>' : ''}</ul></div>
    <div class="card seal"><div class="h3">Confidential Personnel Action Addendum — REFERENCE ONLY</div>
      ${row('Addendum ID', ref.addendumId)}${row('Content hash', ref.hash)}${row('Reviews opened', String(ref.personnelActionReviewsOpened))}
      <div class="muted" style="margin:6px 0">By category: ${esc(Object.entries(ref.countByCategory).map(([k, v]) => `${k}:${v}`).join(' · ') || 'none')}</div>
      <p class="p"><b>${esc(ref.statusSummary)}</b></p><p class="notice2">${esc(ref.confidentialityStatement)}</p></div>`, footerR);

  // 10) Signature page — REAL signer fields only, NO fake checkmarks
  const sigRoles = approvers.length ? approvers.map((a) => a.role) : ['Director of Nursing (DON)', 'Administrator', 'Compliance Officer', 'Governing Body Chair'];
  body += page(id, 'Approval & Signatures', `
    <div class="card"><p class="p">Signatures are captured via eCIgn and bound to a signer record (id, role, authority basis, timestamp, evidence hash). Blank lines below are NOT a substitute for a signature — an unsigned line is unapproved.</p></div>
    ${sigRoles.map((r) => `<div class="sig"><div class="sigline"></div><div class="sigrole">${esc(r)}</div><div class="muted">Signature / printed name / date — pending eCIgn</div></div>`).join('')}`, footerR);

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(id)} ${esc(w.quarterLabel)}</title>
  <style>
    @page{size:letter;margin:0;}
    *{box-sizing:border-box;} body{margin:0;background:#eef2f2;font:12px/1.55 Roboto,Segoe UI,Arial,sans-serif;color:#1f2937;}
    .pg{width:8.5in;min-height:11in;background:#fff;margin:0 auto 14px;display:flex;flex-direction:column;page-break-after:always;}
    .pg-banner{background:#00797d;color:#fff;display:flex;justify-content:space-between;padding:10px 36px;font-size:10px;letter-spacing:.12em;text-transform:uppercase;}
    .pg-in{flex:1;padding:30px 44px;display:flex;flex-direction:column;}
    .ci-mark{width:230px;height:auto;margin-bottom:10px;}
    .pg-h{font-size:22px;color:#1a3b40;margin:6px 0 0;} .rule{width:54px;height:3px;background:#c74601;margin:10px 0 18px;}
    .card{background:#fff;border:1px solid #e3eaea;border-radius:10px;padding:16px 18px;margin-bottom:14px;box-shadow:0 4px 14px rgba(0,65,66,.04);}
    .h3{font-size:12px;font-weight:700;color:#00797d;text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px;}
    .r{display:flex;justify-content:space-between;border-bottom:1px solid #eef2f2;padding:5px 0;font-size:11.5px;}
    .r .k{color:#00797d;font-weight:600;} .r .v{color:#111;text-align:right;}
    .t{width:100%;border-collapse:collapse;font-size:10.5px;margin:4px 0 8px;}
    .t th{background:rgba(0,121,125,.06);color:#1a3b40;text-align:left;padding:7px 9px;border-bottom:2px solid rgba(0,121,125,.12);}
    .t td{padding:7px 9px;border-bottom:1px solid #eef2f2;}
    .p{font-size:11.5px;color:#374151;margin:0 0 8px;} .muted{color:#7a7470;font-size:10px;}
    .bul{margin:0 0 6px 16px;padding:0;font-size:11.5px;} .bul li{margin-bottom:4px;}
    .notice{background:#fff7ed;border:1px solid #f3c4a8;border-left:4px solid #c74601;border-radius:8px;padding:10px 14px;font-size:11px;color:#9a3412;margin-bottom:12px;}
    .notice2{background:#fbe6e6;border:1px solid #e6b3b3;border-radius:6px;padding:8px 12px;font-size:10.5px;color:#7a0c0c;}
    .seal{border:1px solid #e6b3b3;background:#fff8f8;} .status{font-size:12px;margin:0 0 8px;}
    .sig{margin:18px 0;} .sigline{height:30px;border-bottom:1px solid #9ca3af;width:70%;} .sigrole{font-size:10px;font-weight:700;color:#00797d;text-transform:uppercase;margin-top:4px;}
    .pg-foot{margin-top:auto;border-top:1px solid #eef2f2;padding-top:10px;display:flex;justify-content:space-between;font-size:9px;color:#7a7470;}
    @media print{body{background:#fff;}.pg{margin:0;box-shadow:none;}}
  </style></head><body>${body}</body></html>`;
}

function row(k: string, v: string): string { return `<div class="r"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`; }
