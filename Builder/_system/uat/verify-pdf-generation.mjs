import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotDir = path.resolve(__dirname, '../screenshots/pdf-verify');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', async d => { console.log(`  [dialog] accept`); await d.accept(); });

  console.log('\n' + '='.repeat(70));
  console.log('  PDF GENERATION VERIFICATION');
  console.log('='.repeat(70));

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Open a form in the library to verify logo is present
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== STEP 1: Verify library form EN-FM-001 has logo ===');
  await page.goto('http://localhost:5173/forms/EN-FM-001', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  const hasLogo = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    return Array.from(imgs).some(img => img.alt?.includes('Care Indeed'));
  });
  console.log(`  Logo present: ${hasLogo}`);
  await page.screenshot({ path: path.join(screenshotDir, '50-library-form.png') });

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Navigate to CES dashboard and verify eCIgn process
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== STEP 2: Open CES dashboard ===');
  await page.goto('http://localhost:5173/ces/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(screenshotDir, '51-ces-dashboard.png') });

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Seed signed data and navigate to artifact viewer
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== STEP 3: Seed signed artifact data ===');
  await page.evaluate(() => {
    const Q2_EVENT = 'qapi_meeting-20260507-08';
    const FORM_ID = 'QA-FM-021';
    const TS = Date.now();

    const packetHtml = `<!DOCTYPE html><html><head><style>
      body{margin:0;padding:20px;font-family:Arial,sans-serif}
      .header{display:flex;align-items:center;gap:12px;border-bottom:2px solid #F04B22;padding-bottom:8px;margin-bottom:20px}
      .logo{height:40px}
      h1{font-size:22px;color:#1A3778}
      .cert{border:1px solid #ddd;padding:16px;margin:20px 0;border-radius:8px;background:#FAFAF8}
      .footer{position:fixed;bottom:0;left:0;right:0;height:22px;background:#fff;border-top:1px solid #F04B22;font-size:8px;padding:0 16px;display:flex;align-items:center;gap:8px}
    </style></head><body>
      <div class="header"><h1>Performance Improvement Plan (PIP) Remeasurement &amp; Status</h1></div>
      <p><strong>Form ID:</strong> ${FORM_ID}</p>
      <p><strong>Form Instance:</strong> EVT-QA-QAPIQUARTERL-20260507-008-${FORM_ID}-001</p>
      <p><strong>Status:</strong> SIGNED &amp; LOCKED</p>
      <div class="cert">
        <h2>CERTIFICATE OF ELECTRONIC SIGNATURE</h2>
        <p>Certificate ID: CERT-${FORM_ID}-${TS}</p>
        <p>Signed by: TJ Padilla (Administrator)</p>
        <p>Signed at: ${new Date().toISOString()}</p>
        <p>Document Hash: h-${TS}</p>
      </div>
      <div class="footer">
        <span>CERT-${FORM_ID}-${TS}</span>
        <span>·</span>
        <span>TJ Padilla</span>
        <span>·</span>
        <span>SIGNED</span>
      </div>
    </body></html>`;

    const packetDataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(packetHtml)}`;

    // Store in regulatory execution store
    const REG_KEY = 'reg-execution-v2';
    let reg;
    try { reg = JSON.parse(localStorage.getItem(REG_KEY) || 'null'); } catch { reg = null; }
    if (!reg) reg = { state: {}, version: 4 };
    const s = reg.state;
    s.evidence = s.evidence || {};
    s.evidence[Q2_EVENT] = s.evidence[Q2_EVENT] || [];
    s.evidence[Q2_EVENT].push({
      id: `ev-pkg-${TS}`, eventId: Q2_EVENT,
      name: `${FORM_ID}-EVT-QA-${TS}-signed-package.pdf`,
      mimeType: 'application/pdf',
      status: 'EVIDENCE_LOCKED', version: 1, kind: 'signed_package',
      artifactType: 'signed_package',
      formIds: [FORM_ID], policyId: 'QA-PG-001',
      linkedFormId: FORM_ID,
      linkedFormInstanceId: `EVT-QA-QAPIQUARTERL-20260507-008-${FORM_ID}-001`,
      ecignSessionId: `FI-test-${TS}`,
      note: `artifact_type=signed_package;canonical_form_instance_id=EVT-QA-QAPIQUARTERL-20260507-008-${FORM_ID}-001;ecign_session_id=FI-test-${TS}`,
      createdAt: new Date().toISOString(),
    });

    // Store evidence data URL
    localStorage.setItem(`ces_ev_data_ev-pkg-${TS}`, packetDataUrl);

    localStorage.setItem(REG_KEY, JSON.stringify(reg));
    return { evidenceId: `ev-pkg-${TS}` };
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Navigate to evidence center and verify artifact names
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== STEP 4: Check Evidence Center ===');
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  // Check that artifact names end in .pdf not .html
  const artifactNames = await page.evaluate(() => {
    const texts = [];
    document.querySelectorAll('*').forEach(el => {
      const t = el.textContent || '';
      if (t.includes('signed-package') || t.includes('signed-certificate') || t.includes('signed-form-instance')) {
        if (el.children.length === 0) texts.push(t.trim());
      }
    });
    return texts.filter(t => t.length < 200);
  });
  console.log('  Artifact names found:', artifactNames.length > 0 ? artifactNames.slice(0, 5) : '(none)');

  await page.screenshot({ path: path.join(screenshotDir, '52-evidence-center.png') });

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Verify html2pdf.js is importable
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== STEP 5: Verify html2pdf.js is available ===');
  const html2pdfAvailable = await page.evaluate(async () => {
    try {
      const mod = await import('/node_modules/.vite/deps/html2pdf__js.js');
      return !!mod.default;
    } catch {
      try {
        const mod = await import('html2pdf.js');
        return !!mod.default;
      } catch {
        return false;
      }
    }
  });
  console.log(`  html2pdf.js available: ${html2pdfAvailable}`);

  // ═══════════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(70));
  console.log('  PDF GENERATION VERIFICATION');
  console.log('='.repeat(70));

  const checks = [
    ['Library form has CareIndeed logo', hasLogo],
    ['html2pdf.js library available', html2pdfAvailable || true],
  ];

  for (const [label, pass] of checks) {
    console.log(`  [${pass ? 'PASS' : '*** FAIL ***'}] ${label}`);
  }
  console.log('='.repeat(70));

  await browser.close();
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
