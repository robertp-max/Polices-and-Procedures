import { chromium } from 'playwright';
const MOCK = 'C:/Users/razer/Documents/clients.q1q2-2026.mock.txt';
const OUT = 'C:/Users/razer/AppData/Local/Temp/claude/c--AI-Git-training-HomeHealth-Policies-and-Procedures-V2/4330d59b-fa21-4f30-b479-d8fe56a3deac/scratchpad';
import fs from 'node:fs';
const b = await chromium.launch();
const pg = await b.newPage({ viewport: { width: 1500, height: 1000 } });
const errs = []; pg.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
// EMBED MODE (as used inside the app iframe)
await pg.goto('http://localhost:5173/care_indeed_pdf_studio.html?embed=1', { waitUntil: 'networkidle' });
const embedClass = await pg.evaluate(() => document.documentElement.classList.contains('embed'));
await pg.locator('.meeting-card').first().click();
await pg.waitForTimeout(300);
await pg.getByText(/Continue|Next/i).first().click().catch(()=>{});
await pg.waitForTimeout(500);
await pg.setInputFiles('#fileInput', MOCK);
await pg.waitForTimeout(3000);
const gen = pg.getByText(/Generate Packet/i).first();
if (await gen.count()) await gen.click(); else await pg.getByText(/Continue/i).first().click();
await pg.waitForTimeout(8000);
await pg.waitForSelector('.rendered-page', { timeout: 15000 }).catch(()=>{});
await pg.waitForTimeout(800);
const m = await pg.evaluate(() => ({
  embed: document.documentElement.classList.contains('embed'),
  pages: document.querySelectorAll('.rendered-page').length,
  docScroll: document.documentElement.scrollHeight,
  previewCapped: getComputedStyle(document.querySelector('.preview-main')).maxHeight,
}));
console.log('EMBED_MODE_ON:', embedClass, '| after-gen:', JSON.stringify(m));
// PDF EXPORT (render print output to a real PDF)
await pg.emulateMedia({ media: 'print' });
const pdfPath = OUT + '/studio-export.pdf';
await pg.pdf({ path: pdfPath, format: 'Letter', printBackground: true });
const buf = fs.readFileSync(pdfPath);
const pageCount = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
console.log('PDF_BYTES:', buf.length, '| PDF_PAGES:', pageCount);
console.log('ERRORS:', errs.slice(0, 5));
await b.close();
