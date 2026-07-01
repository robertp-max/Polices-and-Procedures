import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PDFDocument } from 'pdf-lib';
import { log } from './logger.js';
import {
  getAdmissionBillingRouteBehavior,
  getAdvanceDirectiveSummary,
  mapAdmissionOrderedServices,
} from './admissionBillingRouteBehavior.js';

/* ═══════════════════════════════════════════════════════════════════════════
   Admission packet PDF — server-side render of the 63-page FORM template.

   The studio (browser) cannot paginate the form template on-screen (browsers
   only paginate in print) and its wrapper collapses the template's @page rules
   to ~2 pages. So we render the RAW form template server-side with Playwright
   (preferCSSPageSize honours the template's own @page cover/toc/content rules →
   full page count), filling the cover + body from verified fields here — one
   source of truth, deterministic, testable. No invention: blank/underscore
   values are never written.
   ═══════════════════════════════════════════════════════════════════════════ */

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FORM_TEMPLATE = path.join(REPO_ROOT, 'public', 'templates', 'CareIndeed_Patient_Admission_Packet_Letter_Form_Logo.html');
const BUDGET_MS = Number(process.env.PDF_RENDER_TIMEOUT_MS || 60000);

export type AdmissionFields = Record<string, string | undefined | null>;

export async function renderAdmissionPdf(fields: AdmissionFields): Promise<{ pdfBase64: string; pageCount: number; filled: number } | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((res) => { timer = setTimeout(() => { log.warn('admission.pdf.timeout', { budgetMs: BUDGET_MS }); res(null); }, BUDGET_MS); });
  try {
    return await Promise.race([renderOnce(fields), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function renderOnce(fields: AdmissionFields): Promise<{ pdfBase64: string; pageCount: number; filled: number } | null> {
  let browser: import('playwright').Browser | null = null;
  try {
    if (!fs.existsSync(FORM_TEMPLATE)) { log.warn('admission.pdf.template.missing', { path: FORM_TEMPLATE }); return null; }
    const html = fs.readFileSync(FORM_TEMPLATE, 'utf8');
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], timeout: 15000 });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 15000 });
    // tsx/esbuild wraps evaluated functions with a __name() helper that does not
    // exist in the browser context — define a no-op shim (as a string so esbuild
    // does not rewrite it) so the fill function below runs. Without this, evaluate
    // throws "ReferenceError: __name is not defined".
    await page.evaluate('globalThis.__name = globalThis.__name || function (v) { return v; };');

    const behavior = getAdmissionBillingRouteBehavior(fields.route, fields.payer, fields as Record<string, string | undefined | null>, /^true$/i.test(String(fields.explicitPrivatePayAddendum || '')));
    const orderedServices = mapAdmissionOrderedServices(fields.services_ordered);
    const advanceDirective = getAdvanceDirectiveSummary(fields.advance_directive_status, fields.legal_authority, fields.representative_name);

    const filled = await page.evaluate((payload: {
      f: Record<string, string>;
      behavior: ReturnType<typeof getAdmissionBillingRouteBehavior>;
      orderedServices: ReturnType<typeof mapAdmissionOrderedServices>;
      advanceDirective: ReturnType<typeof getAdvanceDirectiveSummary>;
    }) => {
      const { f, behavior, orderedServices, advanceDirective } = payload;
      const isF = (v: unknown) => v != null && String(v).trim() !== '' && !/^_+$/.test(String(v).trim());
      const checkGlyph = (text: string) => text.replace('☐', '☑');
      const norm = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();
      let n = 0;
      // Cover fields (.cover-field label → span)
      document.querySelectorAll('.cover-field').forEach((cf) => {
        const l = (cf.querySelector('label')?.textContent || '').trim().toLowerCase();
        const s = cf.querySelector('span'); if (!s) return;
        const m: Record<string, string> = { 'patient name': f.name, 'medical record': f.mr, 'date of birth': f.dob, 'start of care': f.soc, 'primary physician': f.physician, 'admitting clinician': f.admitting_clinician };
        for (const k in m) { if (l.indexOf(k) !== -1 && isF(m[k])) { s.textContent = m[k]; n++; break; } }
      });
      // Body data-tables — patient identifiers fill anywhere; ambiguous address/phone
      // fill ONLY inside a table that also identifies the patient (no agency bleed).
      const idMap: Record<string, string> = { 'patient name': f.name, 'date of birth': f.dob, 'medical record number': f.mr, 'medical record': f.mr, 'mrn': f.mr, 'diagnosis (primary)': f.dx, 'diagnosis': f.dx, 'primary diagnosis': f.dx, 'start of care date': f.soc, 'start of care': f.soc, 'primary physician': f.physician, 'ordering physician': f.physician, 'physician': f.physician, 'physician phone': f.physician_phone, 'physician fax': f.physician_fax, 'admitting clinician': f.admitting_clinician, 'county': f.county, 'f2f encounter date': f.f2f_date, 'face-to-face encounter date': f.f2f_date, 'f2f performed by': f.f2f_performed_by || f.physician, 'certifying physician': f.f2f_performed_by || f.physician };
      const patMap: Record<string, string> = { 'address of service': f.address, 'address': f.address, 'phone': f.phone, 'primary phone': f.phone, 'cell phone': f.phone, 'primary emergency contact': (f.emergency_contact_name || '') + (f.emergency_contact_phone ? ' — ' + f.emergency_contact_phone : '') };
      document.querySelectorAll('table.data-table').forEach((t) => {
        const rows = Array.from(t.querySelectorAll('tbody tr'));
        const isPat = rows.some((tr) => { const c = tr.querySelectorAll('td'); return c.length > 0 && ['patient name', 'date of birth', 'medical record number', 'medical record', 'mrn'].includes((c[0].textContent || '').trim().toLowerCase()); });
        rows.forEach((tr) => {
          const c = tr.querySelectorAll('td'); if (c.length < 2) return;
          const lbl = (c[0].textContent || '').trim().toLowerCase();
          let v: string | undefined;
          if (Object.prototype.hasOwnProperty.call(idMap, lbl)) v = idMap[lbl];
          else if (isPat && Object.prototype.hasOwnProperty.call(patMap, lbl)) v = patMap[lbl];
          else return;
          if (!isF(v)) return; c[c.length - 1].textContent = v as string; n++;
        });
      });
      // Payer checkbox + policy id (§7 / financial). Use confirmed route only.
      const payerRows: Record<string, string[]> = {
        privatePay: ['private pay'],
        medicareAdvantage: ['medicare advantage'],
        privateInsurance: ['private insurance'],
        medicareTraditional: ['medicare part a', 'traditional'],
        mediCalFfs: ['medi-cal (fee'],
        mediCalManagedCare: ['medi-cal managed care'],
        vaWorkersCompContract: ['workers', 'va / champva', 'tricare'],
      };
      document.querySelectorAll('table.data-table tbody tr').forEach((tr) => {
        const txt = norm(tr.textContent || '');
        const tds = Array.from(tr.querySelectorAll('td'));
        const routeKey = behavior.section7.checkedPayers.find((key) => (payerRows[key] || []).some((needle) => txt.includes(needle)));
        if (!routeKey || !txt.includes('☐')) return;
        if (tds[0] && ['Primary', 'Secondary', 'Tertiary', 'N/A'].includes((tds[0].textContent || '').trim())) {
          tds[0].textContent = behavior.section7.payerPriority;
        }
        let checkedCell = -1;
        tds.forEach((td, i) => {
          if ((td.textContent || '').includes('☐')) {
            td.textContent = checkGlyph(td.textContent || '');
            checkedCell = i;
            if (behavior.section7.payerName && /_{3,}|:/.test(td.textContent || '')) {
              td.textContent = (td.textContent || '').replace(/_{3,}/g, behavior.section7.payerName).replace(/:\s*$/, `: ${behavior.section7.payerName}`);
            }
          }
        });
        if (checkedCell >= 0 && isF(behavior.section7.payerId) && tds[checkedCell + 1]) tds[checkedCell + 1].textContent = behavior.section7.payerId;
        n++;
      });
      if (behavior.section7.checkedPayers.includes('pendingVerification') || behavior.section7.checkedPayers.includes('noBillableServices') || behavior.section7.checkedPayers.includes('longTermCareInsurance')) {
        const section7 = document.querySelector('#section-07') || Array.from(document.querySelectorAll('h1')).find((h) => /financial agreement/i.test(h.textContent || ''))?.parentElement;
        if (section7) {
          const note = document.createElement('div');
          note.className = 'standalone-note';
          note.textContent = behavior.section7.checkedPayers.includes('pendingVerification')
            ? 'Pending Verification: coverage is not final. Billing team must verify coverage before packet finalization or service billing.'
            : behavior.section7.checkedPayers.includes('noBillableServices')
              ? 'No Billable Services: no billable services are admitted under this packet.'
              : `Long-Term Care Insurance: ${behavior.section7.payerName || 'carrier'} is the confirmed payer route.`;
          section7.appendChild(note);
          n++;
        }
      }
      // Ordered services (§4): fill the existing "B. SERVICES AUTHORIZED" table in place.
      if (orderedServices.length) {
        const serviceNeedles: Record<string, string[]> = {
          sn_rn: ['skilled nursing (rn)'],
          pt: ['physical therapy (pt)'],
          ot: ['occupational therapy (ot)'],
          slp: ['speech-language pathology (slp)', 'speech language pathology (slp)'],
          msw: ['medical social work (msw)'],
          hha: ['home health aide (hha)'],
          dietitian: ['dietitian / nutritional counseling', 'dietitian', 'nutritional counseling'],
          other: ['other:'],
        };
        const servicesHeading = Array.from(document.querySelectorAll('h2')).find((h) => /services authorized/i.test(h.textContent || ''));
        const servicesTable = servicesHeading?.nextElementSibling?.querySelector('table') || servicesHeading?.parentElement?.querySelector('table.data-table');
        if (servicesTable) {
          const rows = Array.from(servicesTable.querySelectorAll('tbody tr'));
          orderedServices.forEach((service) => {
            const row = rows.find((tr) => {
              const label = norm(tr.querySelector('td')?.textContent || '');
              return (serviceNeedles[service.key] || []).some((needle) => label.includes(needle));
            });
            if (!row) return;
            const cells = row.querySelectorAll('td');
            if (cells.length < 3) return;
            if (service.key === 'other') cells[0].textContent = `Other: ${service.label}`;
            cells[1].textContent = '☑';
            cells[2].textContent = service.frequency;
            n++;
          });
        }
      }
      // Advance directives (§6): check only source-supported rows; never infer DNR.
      document.querySelectorAll('.check-row').forEach((row) => {
        const text = norm(row.textContent || '');
        const box = row.querySelector('.box');
        if (!box) return;
        if ((advanceDirective.ahcdPresent && text.includes('advance health care directive')) || (advanceDirective.polstPresent && text.includes('polst'))) {
          box.textContent = '☑';
          n++;
        }
      });
      if (advanceDirective.note) {
        const section6 = document.querySelector('#section-06') || Array.from(document.querySelectorAll('h1')).find((h) => /advance directive/i.test(h.textContent || ''))?.parentElement;
        if (section6) {
          const note = document.createElement('div');
          note.className = 'standalone-note';
          note.textContent = `Source directive status: ${advanceDirective.note}${advanceDirective.fullTreatment ? ' | POLST indicates Full Treatment.' : ''}`;
          section6.appendChild(note);
          n++;
        }
      }
      // Section 8 is independent: N/A unless private pay route/addendum is confirmed.
      if (!behavior.section8.active) {
        const section8 = document.querySelector('#section-08') || Array.from(document.querySelectorAll('h1')).find((h) => /private-pay service agreement/i.test(h.textContent || ''))?.parentElement;
        if (section8) {
          section8.innerHTML = '<h1>Private-Pay Service Agreement</h1><div class="standalone-note"><strong>Section 8 Not Applicable</strong><br>Confirmed payer route: ' +
            (behavior.section7.payerName || behavior.section7.payerNoticeVariant) +
            '. Private-pay rates, deposits, late fees, collection terms, and private-pay signature obligations do not apply unless a separate private-pay addendum is confirmed.</div>';
          n++;
        }
      }
      document.querySelectorAll('table.data-table tbody tr').forEach((tr) => {
        const txt = norm(tr.textContent || '');
        if (!txt.includes('private-pay service agreement')) return;
        const cells = Array.from(tr.querySelectorAll('td'));
        const last = cells[cells.length - 1];
        if (last) {
          last.textContent = behavior.section8.checklistStatus === 'required' ? '☐ Required' : 'N/A';
          n++;
        }
      });
      // Form-line labelled fields (§18 language, §20 relationship/legal authority)
      const flMap: Record<string, string> = { 'primary language': f.primary_language, 'language interpreted': f.primary_language, 'relationship to patient (if representative)': f.representative_relationship, 'relationship to patient (if responsible party is not the patient)': f.representative_relationship, 'legal authority (e.g., poa, conservator, court order)': f.legal_authority, 'legal authority (if applicable)': f.legal_authority };
      document.querySelectorAll('.form-line').forEach((fl) => {
        const l = (fl.querySelector('.form-label-inline')?.textContent || '').trim().toLowerCase();
        if (!Object.prototype.hasOwnProperty.call(flMap, l)) return;
        const fill = fl.querySelector('.form-fill'); if (fill && isF(flMap[l])) { fill.textContent = flMap[l]; n++; }
      });
      return n;
    }, {
      f: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, v ?? ''])) as Record<string, string>,
      behavior,
      orderedServices,
      advanceDirective,
    });

    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(200);
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true, format: 'Letter' });
    const buf = Buffer.from(pdf);
    const pageCount = (await PDFDocument.load(buf)).getPageCount();
    log.info('admission.pdf.ok', { pageCount, filled });
    return { pdfBase64: buf.toString('base64'), pageCount, filled };
  } catch (e) {
    log.warn('admission.pdf.fail', { error: e instanceof Error ? e.message : String(e) });
    return null;
  } finally {
    if (browser) { try { await browser.close(); } catch { /* ignore */ } }
  }
}
