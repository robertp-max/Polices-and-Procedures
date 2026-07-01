// One-time build: render the admission FORM template to a base PDF, then add
// named AcroForm text fields over the 6 cover fields. Runtime fill (pdf-lib) is
// then instant — no headless browser per packet.
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'node:fs';

const BASE = 'http://localhost:5173';
const URL = `${BASE}/templates/CareIndeed_Patient_Admission_Packet_Letter_Form_Logo.html`;
const OUT = 'public/templates/CareIndeed_Patient_Admission_Packet_Fillable.pdf';
const SAMPLE = 'C:/Users/razer/AppData/Local/Temp/claude/c--AI-Git-training-HomeHealth-Policies-and-Procedures-V2/a52702b8-913d-4315-8d08-447e926dffae/scratchpad/fillable_sample.pdf';

const FIELD_FOR = (label) => {
  const l = label.toLowerCase();
  if (l.includes('patient name')) return 'patient_name';
  if (l.includes('medical record')) return 'medical_record';
  if (l.includes('date of birth')) return 'date_of_birth';
  if (l.includes('start of care')) return 'start_of_care';
  if (l.includes('primary physician')) return 'primary_physician';
  if (l.includes('admitting clinician')) return 'admitting_clinician';
  return null;
};

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

// Measure each cover field's value-line as a FRACTION of the cover page box.
const fields = await page.evaluate(() => {
  const cov = document.querySelector('.cover-page').getBoundingClientRect();
  return Array.from(document.querySelectorAll('.cover-field')).map((f) => {
    const label = (f.querySelector('label')?.textContent || '').trim();
    const span = f.querySelector('span').getBoundingClientRect();
    return { label, fx: (span.left - cov.left) / cov.width, fy: (span.top - cov.top) / cov.height, fw: span.width / cov.width, fh: span.height / cov.height };
  });
});

// Render base PDF. Force the cover content inset in print so it matches screen
// layout (the form only sets .cover-page padding under @media screen).
await page.addStyleTag({ content: '@media print{.cover-page{padding:0.65in 0.72in 0.58in !important;}}' });
await page.emulateMedia({ media: 'print' });
const basePdf = await page.pdf({ printBackground: true, preferCSSPageSize: true, format: 'Letter' });
await browser.close();

// Add AcroForm fields on the cover (page 0).
const pdf = await PDFDocument.load(basePdf);
const form = pdf.getForm();
const cover = pdf.getPages()[0];
const { width: W, height: H } = cover.getSize();
const placed = [];
for (const f of fields) {
  const name = FIELD_FOR(f.label); if (!name) continue;
  const h = Math.max(f.fh * H, 13);
  const x = f.fx * W, w = f.fw * W;
  const y = H - (f.fy * H) - h;          // pdf-lib origin = bottom-left
  const tf = form.createTextField('cover.' + name);
  tf.setText('');
  tf.addToPage(cover, { x, y: y + 1, width: w, height: h - 1, borderWidth: 0 });
  tf.setFontSize(10.5);
  placed.push({ name, x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) });
}
const bytes = await pdf.save();
writeFileSync(OUT, bytes);
console.log('PAGE pt:', Math.round(W), 'x', Math.round(H), '· pages:', pdf.getPageCount());
console.log('FIELDS placed:', JSON.stringify(placed, null, 0));
console.log('saved', OUT, (bytes.length / 1024).toFixed(0) + 'KB');

// Prove runtime fill works (instant, no browser).
const pdf2 = await PDFDocument.load(bytes);
const form2 = pdf2.getForm();
const sample = { patient_name: 'Amara Blessing Eze-Chakraborty', date_of_birth: 'August 22, 2005', primary_physician: 'Dr. Catherine Hargrove' };
for (const [k, val] of Object.entries(sample)) { const fld = form2.getTextField('cover.' + k); fld.setText(val); }
const filled = await pdf2.save();
writeFileSync(SAMPLE, filled);
console.log('sample filled →', SAMPLE, (filled.length / 1024).toFixed(0) + 'KB');
