import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotDir = path.resolve(__dirname, '../screenshots/reset-verify');
const Q2_EVENT_ID = 'oig_sam_exclusion_check-20260505-01';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', async d => { console.log(`  [dialog] accept`); await d.accept(); });

  // ── STEP 1: Navigate → let zustand hydrate → inject sandbox data ──
  console.log('\n=== STEP 1: Boot app, inject Q2 sandbox activity ===');
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Inject data via the live zustand store (not just localStorage)
  const injected = await page.evaluate((eventId) => {
    // Access the zustand store through window.__zustand (if exposed)
    // or manipulate the persist key directly then force rehydration
    const raw = localStorage.getItem('regulatory-execution-v1');
    if (!raw) return { error: 'store not hydrated yet' };
    const parsed = JSON.parse(raw);
    const s = parsed.state;

    // Step completion
    s.stepStates = s.stepStates || {};
    s.stepStates[`${eventId}::s1`] = { status: 'complete', completedAt: '2026-05-11T12:00:00Z', completedBy: 'UAT Tester' };

    // Form state
    s.formStates = s.formStates || {};
    s.formStates[`${eventId}::CO-F-015`] = { status: 'complete' };

    // Evidence
    s.evidence = s.evidence || {};
    s.evidence[eventId] = s.evidence[eventId] || [];
    s.evidence[eventId].push({
      id: 'ev-uat-001', eventId, name: 'UAT-Evidence.pdf', mimeType: 'application/pdf',
      status: 'VALIDATED', version: 1, kind: 'attachment', formIds: [],
      policyId: 'HR-TA-003', workflowId: 'CO-WF-15', createdAt: '2026-05-11T12:00:00Z',
    });

    // Form instance (naming: {eventId}-{formId}-001)
    s.generatedFormInstancesByEventId = s.generatedFormInstancesByEventId || {};
    s.generatedFormInstancesByEventId[eventId] = s.generatedFormInstancesByEventId[eventId] || [];
    s.generatedFormInstancesByEventId[eventId].push({
      id: `${eventId}-CO-F-015-001`, eventId, formId: 'CO-F-015',
      taskId: `${eventId}-02`, status: 'COMPLETED', sequence: 1,
      createdAt: '2026-05-11T12:00:00Z', policyIds: ['HR-TA-003'],
      workflowId: 'CO-WF-15', folderPath: '/uat',
    });

    // Audit trail
    s.taskAuditByEventId = s.taskAuditByEventId || {};
    s.taskAuditByEventId[eventId] = s.taskAuditByEventId[eventId] || [];
    s.taskAuditByEventId[eventId].push(
      { auditId: 'AUD-uat-001', eventId, entityType: 'step', entityId: 's1', action: 'step.complete', actorId: 'uat', actorRole: 'Admin', timestamp: '2026-05-11T12:00:00Z' },
      { auditId: 'AUD-uat-002', eventId, entityType: 'form', entityId: 'CO-F-015', action: 'form.save', actorId: 'uat', actorRole: 'Admin', timestamp: '2026-05-11T12:01:00Z' },
    );

    // Simulate saved form fields in localStorage
    localStorage.setItem(`ci_form_fields_${eventId}-CO-F-015-001`, JSON.stringify({ field1: 'Test UAT Value', field2: 'Second field' }));

    // Write back
    localStorage.setItem('regulatory-execution-v1', JSON.stringify(parsed));
    return {
      evidence: s.evidence[eventId].length,
      formInstances: s.generatedFormInstancesByEventId[eventId].length,
      audit: s.taskAuditByEventId[eventId].length,
      stepKeys: Object.keys(s.stepStates).filter(k => k.startsWith(eventId)),
      formKeys: Object.keys(s.formStates).filter(k => k.startsWith(eventId)),
      formFieldLS: localStorage.getItem(`ci_form_fields_${eventId}-CO-F-015-001`) !== null,
    };
  }, Q2_EVENT_ID);
  console.log('  Injected:', JSON.stringify(injected));

  // Reload so zustand picks up the seeded data
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  // ── STEP 2: Verify data exists (non-zero completion) ──
  console.log('\n=== STEP 2: Verify data exists BEFORE reset ===');
  const beforeVals = await page.locator('text=/\\d+% complete/i').allTextContents();
  const beforeNonZero = beforeVals.filter(v => !v.startsWith('0%'));
  console.log(`  Completion values: ${beforeVals.length} total, ${beforeNonZero.length} non-zero`);
  if (beforeNonZero.length > 0) console.log('  Non-zero:', beforeNonZero.slice(0, 5));

  const beforeData = await page.evaluate((eventId) => {
    const raw = localStorage.getItem('regulatory-execution-v1');
    if (!raw) return { error: 'no store' };
    const s = JSON.parse(raw).state;
    return {
      evidence: (s.evidence?.[eventId] ?? []).length,
      formInstances: (s.generatedFormInstancesByEventId?.[eventId] ?? []).length,
      audit: (s.taskAuditByEventId?.[eventId] ?? []).length,
      stepStates: Object.keys(s.stepStates || {}).filter(k => k.startsWith(eventId)).length,
      formStates: Object.keys(s.formStates || {}).filter(k => k.startsWith(eventId)).length,
      formFieldLS: localStorage.getItem(`ci_form_fields_${eventId}-CO-F-015-001`) !== null,
    };
  }, Q2_EVENT_ID);
  console.log('  Store data:', JSON.stringify(beforeData));
  await page.screenshot({ path: path.join(screenshotDir, '02-before-reset-with-data.png'), fullPage: false });

  // ── STEP 3: Click the ACTUAL "Clear All Evidence" button ──
  console.log('\n=== STEP 3: Click the ACTUAL "Clear All Evidence" button ===');
  const clearBtn = page.locator('button').filter({ hasText: /Clear All Evidence/i });
  const btnCount = await clearBtn.count();
  console.log(`  Found ${btnCount} "Clear All Evidence" button(s)`);

  if (btnCount === 0) {
    console.log('  FATAL: No reset button found!');
    await browser.close();
    process.exit(1);
  }

  await clearBtn.first().click();
  console.log('  Button clicked. Waiting for reload...');
  await page.waitForTimeout(6000);
  try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch {}
  await page.waitForTimeout(3000);

  // ── STEP 4: Verify everything cleared ──
  console.log('\n=== STEP 4: Verify AFTER reset ===');
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(screenshotDir, '03-after-reset-button.png'), fullPage: false });

  const afterVals = await page.locator('text=/\\d+%/').allTextContents();
  const afterNonZero = afterVals.filter(v => !v.startsWith('0%'));
  console.log(`  Completion % values: ${afterVals.length} total, ${afterNonZero.length} non-zero`);
  if (afterNonZero.length > 0) console.log('  Non-zero:', afterNonZero);

  const afterData = await page.evaluate((eventId) => {
    const raw = localStorage.getItem('regulatory-execution-v1');
    if (!raw) return { storeCleared: true, formFieldLS: localStorage.getItem(`ci_form_fields_${eventId}-CO-F-015-001`) !== null };
    const s = JSON.parse(raw).state;
    return {
      evidence: (s.evidence?.[eventId] ?? []).length,
      formInstances: (s.generatedFormInstancesByEventId?.[eventId] ?? []).length,
      formInstanceIds: (s.generatedFormInstancesByEventId?.[eventId] ?? []).map(i => i.id),
      audit: (s.taskAuditByEventId?.[eventId] ?? []).length,
      stepStates: Object.keys(s.stepStates || {}).filter(k => k.startsWith(eventId)).length,
      formStates: Object.keys(s.formStates || {}).filter(k => k.startsWith(eventId)).length,
      formFieldLS: localStorage.getItem(`ci_form_fields_${eventId}-CO-F-015-001`) !== null,
      anyEvDataKeys: (() => { let c = 0; for (let i = 0; i < localStorage.length; i++) { if (localStorage.key(i)?.startsWith('ces_ev_data_')) c++; } return c; })(),
    };
  }, Q2_EVENT_ID);
  console.log('  Store data AFTER reset:', JSON.stringify(afterData, null, 2));

  // ── SUMMARY ──
  console.log('\n' + '='.repeat(60));
  console.log('VERIFICATION RESULTS');
  console.log('='.repeat(60));

  const p1 = afterNonZero.length === 0;
  console.log(`[${p1 ? 'PASS' : 'FAIL'}] 1. ALL completion values are 0% after reset`);

  const p2 = afterData.storeCleared || afterData.evidence === 0;
  console.log(`[${p2 ? 'PASS' : 'FAIL'}] 2. Evidence removed`);

  const p3 = afterData.storeCleared || afterData.formInstances === 0;
  console.log(`[${p3 ? 'PASS' : 'FAIL'}] 3. Form instances removed (sequence resets to 001)`);

  const p4 = afterData.storeCleared || afterData.audit === 0;
  console.log(`[${p4 ? 'PASS' : 'FAIL'}] 4. Audit trail cleared`);

  const p5 = afterData.storeCleared || afterData.stepStates === 0;
  console.log(`[${p5 ? 'PASS' : 'FAIL'}] 5. Step states cleared`);

  const p6 = afterData.storeCleared || afterData.formStates === 0;
  console.log(`[${p6 ? 'PASS' : 'FAIL'}] 6. Form states cleared`);

  const p7 = !afterData.formFieldLS;
  console.log(`[${p7 ? 'PASS' : 'FAIL'}] 7. localStorage ci_form_fields_ cleared`);

  console.log(`[PASS] 8. Used ACTUAL "Clear All Evidence" button (${btnCount} found, clicked)`);

  // Scoping check: the sandbox date range
  console.log(`[INFO] 9. Sandbox scope: Jan 1 – Jun 30 2026 (Q1/Q2) per cesExecutionMode.ts`);
  console.log(`         isCesSandboxDate() checks: SANDBOX_START_MS=2026-01-01, SANDBOX_END_MS=2026-06-30`);
  console.log(`         resetAllSandboxQ1Q2 filters: REGULATORY_EVENTS.filter(e => isCesSandboxDate(e.date))`);

  console.log('='.repeat(60));
  await browser.close();
  console.log('\nScreenshots saved to:', screenshotDir);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
