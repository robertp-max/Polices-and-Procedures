import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotDir = path.resolve(__dirname, '../screenshots/reset-verify');

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('dialog', async d => { console.log(`  [dialog] accept`); await d.accept(); });

  // ── STEP 1: Boot app and seed eCIgn signed data ──
  console.log('\n=== STEP 1: Boot app, seed eCIgn signing data ===');
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Seed eCIgn demo backend with a signed instance for a Q2 event
  const seedResult = await page.evaluate(() => {
    const Q2_EVENT = 'oig_sam_exclusion_check-20260505-01';
    const FORM_ID = 'CO-F-015';
    const INSTANCE_ID = 'ecign-test-instance-001';
    
    // Seed the eCIgn demo backend (ci_ecign_demo_local_v1)
    const ecignState = {
      instances: {
        [INSTANCE_ID]: {
          instance_id: INSTANCE_ID,
          form_id: FORM_ID,
          document_version_id: `${FORM_ID}@1.0`,
          state: 'signed_locked',
          required_signers: [{ role: 'Administrator', tier: 1, user_id: 'demo-user', field_id: 'sig-1' }],
          event_id: Q2_EVENT,
          created_at_utc: '2026-05-11T12:00:00Z',
          locked_at_utc: '2026-05-11T12:05:00Z',
        },
      },
      signaturesByInstanceId: {
        [INSTANCE_ID]: [{
          signature_id: 'sig-test-001',
          instance_id: INSTANCE_ID,
          field_id: 'sig-1',
          signature_hash: 'h-abc123',
          signed_at_utc: '2026-05-11T12:03:00Z',
        }],
      },
      consentsByUserId: {},
      auditByInstanceId: {
        [INSTANCE_ID]: [{
          event_id: 'evt-test-001',
          occurred_at_utc: '2026-05-11T12:00:00Z',
          action: 'INSTANCE_CREATED',
          actor: { user_id: 'demo-user', name: 'Test User', role: 'Admin', email: 'test@test.com', auth_method: 'demo' },
          subject: { kind: 'instance', id: INSTANCE_ID },
        }],
      },
    };
    localStorage.setItem('ci_ecign_demo_local_v1', JSON.stringify(ecignState));

    // Seed the instance pointer
    localStorage.setItem(`ecign:instance:${FORM_ID}:sig-1:demo-user`, INSTANCE_ID);

    // Also seed the regulatory execution store with matching data
    const raw = localStorage.getItem('regulatory-execution-v1');
    if (raw) {
      const parsed = JSON.parse(raw);
      const s = parsed.state;

      // Add approval
      s.approvals = s.approvals || [];
      s.approvals.push({
        id: 'apr-test-001',
        eventId: Q2_EVENT,
        targetKind: 'form',
        targetId: FORM_ID,
        status: 'approved',
        requestedBy: 'demo-user',
        requestedAt: '2026-05-11T12:00:00Z',
        decidedBy: 'demo-user',
        decidedAt: '2026-05-11T12:03:00Z',
      });

      // Add form state as complete
      s.formStates = s.formStates || {};
      s.formStates[`${Q2_EVENT}::${FORM_ID}`] = { status: 'complete' };

      // Add form instance as SIGNED
      s.generatedFormInstancesByEventId = s.generatedFormInstancesByEventId || {};
      s.generatedFormInstancesByEventId[Q2_EVENT] = s.generatedFormInstancesByEventId[Q2_EVENT] || [];
      s.generatedFormInstancesByEventId[Q2_EVENT].push({
        id: `${Q2_EVENT}-${FORM_ID}-001`,
        eventId: Q2_EVENT,
        formId: FORM_ID,
        taskId: `${Q2_EVENT}-02`,
        status: 'SIGNED',
        sequence: 1,
        createdAt: '2026-05-11T12:00:00Z',
        policyIds: ['HR-TA-003'],
        workflowId: 'CO-WF-15',
        folderPath: '/test',
      });

      // Add evidence (signed artifact)
      s.evidence = s.evidence || {};
      s.evidence[Q2_EVENT] = s.evidence[Q2_EVENT] || [];
      s.evidence[Q2_EVENT].push({
        id: 'ev-signed-001',
        eventId: Q2_EVENT,
        name: 'CO-F-015_eCIgn_signed.html',
        mimeType: 'text/html',
        status: 'EVIDENCE_LOCKED',
        version: 1,
        kind: 'form',
        formIds: [FORM_ID],
        policyId: 'HR-TA-003',
        workflowId: 'CO-WF-15',
        artifactType: 'signed_package',
        ecignSessionId: INSTANCE_ID,
        createdAt: '2026-05-11T12:05:00Z',
      });

      localStorage.setItem('regulatory-execution-v1', JSON.stringify(parsed));
    }

    return {
      ecignInstances: Object.keys(ecignState.instances).length,
      ecignPointerKey: `ecign:instance:${FORM_ID}:sig-1:demo-user`,
      ecignPointerExists: localStorage.getItem(`ecign:instance:${FORM_ID}:sig-1:demo-user`) !== null,
    };
  });
  console.log('  Seeded:', JSON.stringify(seedResult));

  // Reload
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // ── STEP 2: Verify eCIgn data exists ──
  console.log('\n=== STEP 2: Verify eCIgn data exists BEFORE reset ===');
  const beforeEcign = await page.evaluate(() => {
    const ecignRaw = localStorage.getItem('ci_ecign_demo_local_v1');
    const ecign = ecignRaw ? JSON.parse(ecignRaw) : null;
    const instanceCount = ecign ? Object.keys(ecign.instances || {}).length : 0;
    const sigCount = ecign ? Object.values(ecign.signaturesByInstanceId || {}).flat().length : 0;

    let pointerCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('ecign:instance:')) pointerCount++;
    }

    const regRaw = localStorage.getItem('regulatory-execution-v1');
    const reg = regRaw ? JSON.parse(regRaw).state : null;
    const approvalCount = reg?.approvals?.length ?? 0;

    return { instanceCount, sigCount, pointerCount, approvalCount };
  });
  console.log('  BEFORE reset:', JSON.stringify(beforeEcign));
  await page.screenshot({ path: path.join(screenshotDir, '04-ecign-before-reset.png'), fullPage: false });

  // ── STEP 3: Click "Clear All Evidence" ──
  console.log('\n=== STEP 3: Click "Clear All Evidence" button ===');
  const clearBtn = page.locator('button').filter({ hasText: /Clear All Evidence/i });
  const btnCount = await clearBtn.count();
  if (btnCount > 0) {
    await clearBtn.first().click();
    console.log('  Button clicked. Waiting for reload...');
    await page.waitForTimeout(6000);
    try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch {}
    await page.waitForTimeout(3000);
  } else {
    console.log('  ERROR: No button found');
    await browser.close();
    process.exit(1);
  }

  // ── STEP 4: Verify EVERYTHING cleared ──
  console.log('\n=== STEP 4: Verify AFTER reset ===');
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(4000);

  const afterEcign = await page.evaluate(() => {
    const ecignRaw = localStorage.getItem('ci_ecign_demo_local_v1');
    const ecign = ecignRaw ? JSON.parse(ecignRaw) : null;
    const instanceCount = ecign ? Object.keys(ecign.instances || {}).length : 0;
    const sigCount = ecign ? Object.values(ecign.signaturesByInstanceId || {}).flat().length : 0;
    const auditCount = ecign ? Object.values(ecign.auditByInstanceId || {}).flat().length : 0;

    let pointerCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith('ecign:instance:')) pointerCount++;
    }

    const regRaw = localStorage.getItem('regulatory-execution-v1');
    const reg = regRaw ? JSON.parse(regRaw).state : null;
    const approvalCount = reg?.approvals?.length ?? 0;
    const formInstanceCount = Object.values(reg?.generatedFormInstancesByEventId ?? {}).flat().length;
    const evidenceCount = Object.values(reg?.evidence ?? {}).flat().length;

    return { instanceCount, sigCount, auditCount, pointerCount, approvalCount, formInstanceCount, evidenceCount };
  });
  console.log('  AFTER reset:', JSON.stringify(afterEcign));

  const pctVals = await page.locator('text=/\\d+%/').allTextContents();
  const nonZero = pctVals.filter(v => !v.startsWith('0%'));
  console.log(`  Completion % values: ${pctVals.length} total, ${nonZero.length} non-zero`);

  await page.screenshot({ path: path.join(screenshotDir, '05-ecign-after-reset.png'), fullPage: false });

  // ── SUMMARY ──
  console.log('\n' + '='.repeat(60));
  console.log('eCIgn RESET VERIFICATION');
  console.log('='.repeat(60));

  console.log(`[${afterEcign.instanceCount === 0 ? 'PASS' : 'FAIL'}] eCIgn instances cleared (was ${beforeEcign.instanceCount} → ${afterEcign.instanceCount})`);
  console.log(`[${afterEcign.sigCount === 0 ? 'PASS' : 'FAIL'}] eCIgn signatures cleared (was ${beforeEcign.sigCount} → ${afterEcign.sigCount})`);
  console.log(`[${afterEcign.pointerCount === 0 ? 'PASS' : 'FAIL'}] eCIgn localStorage pointers cleared (was ${beforeEcign.pointerCount} → ${afterEcign.pointerCount})`);
  console.log(`[${afterEcign.approvalCount === 0 ? 'PASS' : 'FAIL'}] Approval requests cleared (was ${beforeEcign.approvalCount} → ${afterEcign.approvalCount})`);
  console.log(`[${afterEcign.formInstanceCount === 0 ? 'PASS' : 'FAIL'}] Form instances cleared (${afterEcign.formInstanceCount})`);
  console.log(`[${afterEcign.evidenceCount === 0 ? 'PASS' : 'FAIL'}] Evidence cleared (${afterEcign.evidenceCount})`);
  console.log(`[${nonZero.length === 0 ? 'PASS' : 'FAIL'}] All completion values 0%`);
  console.log(`[PASS] Used actual "Clear All Evidence" button`);
  console.log('='.repeat(60));

  await browser.close();
  console.log('\nScreenshots saved to:', screenshotDir);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
