const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const outDir = path.resolve('Builder/_system/UAT_AGENT_FINDINGS');
const prefix = 'agent08-audit-mode-focused';
const baseURL = process.env.UAT_BASE_URL || 'http://localhost:5175';
function p(name){ return path.join(outDir, `${prefix}-${name}`); }
async function text(page){ return await page.locator('body').innerText({timeout:5000}).catch(()=> ''); }
async function shot(page, name, rec){ const file = p(`${name}.png`); await page.screenshot({path:file, fullPage:true}); rec.screenshots.push(file); return file; }
async function click(page, locator, label, rec, wait=700){
  const out = { label, before: page.url(), count: await locator.count().catch(()=>0) };
  if (!out.count) return out;
  try { await locator.first().click({timeout:5000}); await page.waitForTimeout(wait); out.after = page.url(); out.text = (await text(page)).slice(0,2500); out.screenshot = await shot(page, label, rec); }
  catch(e){ out.error = String(e.message || e); }
  return out;
}
(async()=>{
  const browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1000}, acceptDownloads:true});
  const page = await context.newPage();
  const rec = { baseURL, downloads: [], console: [], errors: [], steps: [], screenshots: [], linksAfterEvidenceTab: [] };
  page.on('console', m => rec.console.push({type:m.type(), text:m.text(), url:page.url()}));
  page.on('pageerror', e => rec.errors.push({message:e.message, stack:e.stack, url:page.url()}));
  page.on('download', async d => {
    const suggested = d.suggestedFilename();
    const saveAs = p(`download-${suggested}`);
    await d.saveAs(saveAs).catch(()=>{});
    rec.downloads.push({ url: d.url(), suggested, saveAs });
  });

  await page.goto(`${baseURL}/audit`, { waitUntil:'domcontentloaded', timeout:30000 });
  await page.waitForLoadState('networkidle', { timeout:10000 }).catch(()=>{});
  await page.waitForTimeout(1000);
  rec.initialText = (await text(page)).slice(0,4000);
  await shot(page, 'audit-initial', rec);

  for (const name of ['Survey Rollup', 'Bundle', 'JSON']) {
    rec.steps.push(await click(page, page.getByRole('button', { name: new RegExp(`^${name}$`, 'i') }), `audit-${name.toLowerCase().replace(/ /g,'-')}`, rec, 1200));
  }

  // Click explicit Q1 high-risk events seen in the queue, then test tabs and per-instance exports.
  const events = ['Annual Governance Packet Review', 'Quarterly QAPI Governance Review', 'Q1 Infection Control Review'];
  for (const ev of events) {
    await page.goto(`${baseURL}/audit`, { waitUntil:'domcontentloaded', timeout:30000 });
    await page.waitForTimeout(800);
    rec.steps.push(await click(page, page.getByRole('button', { name: new RegExp(ev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }), `select-${ev.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, rec, 900));
    rec.steps.push(await click(page, page.getByRole('button', { name: /^Evidence$/i }), `tab-evidence-${ev.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, rec, 800));
    const body = await text(page);
    rec.steps.push({ label:`evidence-summary-${ev}`, hasViewArtifact:/View Artifact/i.test(body), hasNoEvidence:/No evidence files uploaded/i.test(body), hasRequiredForms:/Required Forms/i.test(body), sample:body.slice(0,2200) });
    rec.linksAfterEvidenceTab.push({ event: ev, links: await page.locator('a[href]').evaluateAll(els => els.map(e => ({text:(e.innerText||e.textContent||'').trim(), href:e.getAttribute('href')})).filter(x => /artifact|evidence|forms|calendar|library|workflows/i.test(`${x.text} ${x.href}`))).catch(()=>[]) });
    rec.steps.push(await click(page, page.getByRole('button', { name: /^Missing Items$/i }), `tab-missing-${ev.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, rec, 800));
    // Per-instance exports from footer
    const printDownload = page.getByRole('button', { name: /Print\s*\/\s*PDF/i }).last();
    const markdown = page.getByRole('button', { name: /^Markdown$/i }).last();
    rec.steps.push(await click(page, printDownload, `instance-print-pdf-${ev.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, rec, 1000));
    rec.steps.push(await click(page, markdown, `instance-md-${ev.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, rec, 1000));
  }

  // Evidence Center file ledger and artifact attempts.
  await page.goto(`${baseURL}/evidence`, { waitUntil:'domcontentloaded', timeout:30000 });
  await page.waitForTimeout(1000);
  await shot(page, 'evidence-initial', rec);
  rec.steps.push(await click(page, page.getByRole('button', { name:/File ledger/i }), 'evidence-file-ledger', rec, 1000));
  rec.steps.push(await click(page, page.getByRole('button', { name:/January/i }).first(), 'evidence-january', rec, 1000));
  const evText = await text(page);
  rec.evidenceLedger = { sample: evText.slice(0,4000), viewArtifactCount: await page.getByText(/View Artifact/i).count().catch(()=>0), downloadCount: await page.getByRole('button', {name:/Download/i}).count().catch(()=>0), tableRows: await page.locator('tbody tr').count().catch(()=>0) };
  if (rec.evidenceLedger.viewArtifactCount > 0) rec.steps.push(await click(page, page.getByText(/View Artifact/i).first(), 'evidence-view-artifact', rec, 1000));
  if (rec.evidenceLedger.downloadCount > 0) rec.steps.push(await click(page, page.getByRole('button', {name:/Download/i}).first(), 'evidence-download', rec, 1000));

  const jsonPath = p('results.json');
  fs.writeFileSync(jsonPath, JSON.stringify(rec, null, 2));
  console.log(jsonPath);
  await browser.close();
})();
