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

  console.log('\n' + '='.repeat(70));
  console.log('  FULL E2E: Seed signed data → Verify signed → Reset → Verify clean');
  console.log('='.repeat(70));

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: Open app, let it hydrate, then seed signed state
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== PHASE 1: Seed realistic signed data ===');
  await page.goto('http://localhost:5173/ces/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // First, discover the correct localStorage key for the regulatory store
  const storeKey = await page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.includes('reg-execution') || key?.includes('regulatory-execution')) return key;
    }
    return null;
  });
  console.log('  Regulatory store key:', storeKey || '(not found, will use reg-execution-v2)');
  const REG_KEY = storeKey || 'reg-execution-v2';

  // Find actual Q2 event IDs from the app source
  const sourceEventIds = await page.evaluate(() => {
    const keys = [];
    const raw = localStorage.getItem('reg-execution-v2');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const s = parsed.state;
        if (s) {
          keys.push(...Object.keys(s.evidence || {}));
          keys.push(...Object.keys(s.generatedFormInstancesByEventId || {}));
          keys.push(...Object.keys(s.taskAuditByEventId || {}));
          keys.push(...Object.keys(s.taskOverridesByEventId || {}));
        }
      } catch {}
    }
    return [...new Set(keys)];
  });
  console.log('  Existing event IDs in store:', sourceEventIds);

  const seeded = await page.evaluate(({ REG_KEY }) => {
    const Q2_EVENT = 'qapi_meeting-20260507-08';
    const FORM_ID = 'QA-FM-021';
    const SIGNER_ID = 'demo-user';
    const FIELD_ID = 'sig-1';
    const TS = Date.now();

    // ── 1. Seed ci_ecign_demo_local_v1 ──
    let ecign = { instances: {}, signaturesByInstanceId: {}, consentsByUserId: {}, auditByInstanceId: {} };
    try {
      const raw = localStorage.getItem('ci_ecign_demo_local_v1');
      if (raw) ecign = JSON.parse(raw);
    } catch {}

    // Instance A: WITH event_id
    const instA = `FI-with-event-${TS}`;
    ecign.instances[instA] = {
      instance_id: instA, form_id: FORM_ID,
      document_version_id: `${FORM_ID}@1.0`, state: 'signed_locked',
      required_signers: [{ role: 'Administrator', tier: 1, user_id: SIGNER_ID, field_id: FIELD_ID }],
      event_id: Q2_EVENT,
      created_at_utc: new Date().toISOString(), locked_at_utc: new Date().toISOString(),
    };
    ecign.signaturesByInstanceId[instA] = [{
      signature_id: `sig-a-${TS}`, instance_id: instA, field_id: FIELD_ID,
      signature_hash: 'h-testA', signed_at_utc: new Date().toISOString(),
    }];
    ecign.auditByInstanceId[instA] = [{
      event_id: `AUD-${TS}`, occurred_at_utc: new Date().toISOString(), action: 'DOCUMENT_LOCKED',
      actor: { user_id: SIGNER_ID, name: 'Test', role: 'Admin', email: 'a@b.com', auth_method: 'demo' },
      subject: { kind: 'instance', id: instA },
    }];

    // Instance B: WITHOUT event_id (THE BUG scenario)
    const instB = `FI-no-event-${TS}`;
    ecign.instances[instB] = {
      instance_id: instB, form_id: FORM_ID,
      document_version_id: `${FORM_ID}@1.0`, state: 'signed_locked',
      required_signers: [{ role: 'Administrator', tier: 1, user_id: SIGNER_ID, field_id: FIELD_ID }],
      created_at_utc: new Date().toISOString(), locked_at_utc: new Date().toISOString(),
    };
    ecign.signaturesByInstanceId[instB] = [{
      signature_id: `sig-b-${TS}`, instance_id: instB, field_id: FIELD_ID,
      signature_hash: 'h-testB', signed_at_utc: new Date().toISOString(),
    }];
    ecign.auditByInstanceId[instB] = [{
      event_id: `AUD-B-${TS}`, occurred_at_utc: new Date().toISOString(), action: 'DOCUMENT_LOCKED',
      actor: { user_id: SIGNER_ID, name: 'Test', role: 'Admin', email: 'a@b.com', auth_method: 'demo' },
      subject: { kind: 'instance', id: instB },
    }];

    ecign.consentsByUserId[SIGNER_ID] = {
      consent_id: `CON-${TS}`, disclosure_version: '1.0',
      accepted_at_utc: new Date().toISOString(), user_id: SIGNER_ID,
    };
    localStorage.setItem('ci_ecign_demo_local_v1', JSON.stringify(ecign));

    // ── 2. Seed ecign:instance: pointer ──
    localStorage.setItem(`ecign:instance:${FORM_ID}:${FIELD_ID}:${SIGNER_ID}`, instB);

    // ── 3. Seed regulatory store (correct key) ──
    let reg;
    try { reg = JSON.parse(localStorage.getItem(REG_KEY) || 'null'); } catch { reg = null; }
    if (!reg) reg = { state: {}, version: 4 };
    const s = reg.state;
    s.approvals = s.approvals || [];
    s.approvals.push({
      id: `apr-${TS}`, eventId: Q2_EVENT, targetKind: 'form', targetId: FORM_ID,
      status: 'approved', requestedBy: SIGNER_ID, requestedAt: new Date().toISOString(),
      decidedBy: SIGNER_ID, decidedAt: new Date().toISOString(),
    });
    s.formStates = s.formStates || {};
    s.formStates[`${Q2_EVENT}::${FORM_ID}`] = { status: 'complete' };
    s.stepStates = s.stepStates || {};
    s.stepStates[`${Q2_EVENT}::s1`] = { status: 'complete', completedAt: new Date().toISOString() };
    s.stepStates[`${Q2_EVENT}::s2`] = { status: 'complete', completedAt: new Date().toISOString() };
    s.generatedFormInstancesByEventId = s.generatedFormInstancesByEventId || {};
    s.generatedFormInstancesByEventId[Q2_EVENT] = s.generatedFormInstancesByEventId[Q2_EVENT] || [];
    s.generatedFormInstancesByEventId[Q2_EVENT].push({
      id: `${Q2_EVENT}-${FORM_ID}-001`, eventId: Q2_EVENT, formId: FORM_ID,
      taskId: `${Q2_EVENT}-02`, status: 'SIGNED', sequence: 1,
      createdAt: new Date().toISOString(), policyIds: ['QA-PG-001'],
      workflowId: 'QA-WF-03', folderPath: '/test',
    });
    s.evidence = s.evidence || {};
    s.evidence[Q2_EVENT] = s.evidence[Q2_EVENT] || [];
    s.evidence[Q2_EVENT].push({
      id: `ev-signed-${TS}`, eventId: Q2_EVENT, name: `${FORM_ID}_signed.html`,
      mimeType: 'text/html', status: 'EVIDENCE_LOCKED', version: 1, kind: 'form',
      formIds: [FORM_ID], policyId: 'QA-PG-001', workflowId: 'QA-WF-03',
      artifactType: 'signed_package', ecignSessionId: instA,
      createdAt: new Date().toISOString(),
    });
    s.taskAuditByEventId = s.taskAuditByEventId || {};
    s.taskAuditByEventId[Q2_EVENT] = s.taskAuditByEventId[Q2_EVENT] || [];
    s.taskAuditByEventId[Q2_EVENT].push({
      auditId: `AUD-${TS}`, eventId: Q2_EVENT, entityType: 'form',
      entityId: FORM_ID, action: 'FORM_SIGNED', actorId: SIGNER_ID,
      actorRole: 'Administrator', timestamp: new Date().toISOString(),
    });
    localStorage.setItem(REG_KEY, JSON.stringify(reg));

    // ── 4. Seed form field cache ──
    localStorage.setItem(`ci_form_fields_${Q2_EVENT}-${FORM_ID}-001`, JSON.stringify({ body: 'Test data' }));

    return { instA, instB, event: Q2_EVENT, form: FORM_ID, storeKey: REG_KEY };
  }, { REG_KEY });
  console.log('  Seeded:', JSON.stringify(seeded));

  // Reload to hydrate
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: Verify the signed data actually exists
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== PHASE 2: Verify signed data exists BEFORE reset ===');
  const before = await page.evaluate(({ REG_KEY }) => {
    const ecignRaw = localStorage.getItem('ci_ecign_demo_local_v1');
    const ecign = ecignRaw ? JSON.parse(ecignRaw) : {};
    const instances = Object.entries(ecign.instances || {});
    const withoutEventId = instances.filter(([, i]) => !i.event_id).length;
    const sigs = Object.values(ecign.signaturesByInstanceId || {}).flat().length;

    let pointers = 0, formFields = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('ecign:instance:')) pointers++;
      if (k?.startsWith('ci_form_fields_')) formFields++;
    }

    const regRaw = localStorage.getItem(REG_KEY);
    const reg = regRaw ? JSON.parse(regRaw).state : {};
    return {
      ecignInstances: instances.length,
      withoutEventId,
      signatures: sigs,
      pointers,
      formFields,
      approvals: (reg.approvals || []).length,
      formStates: Object.keys(reg.formStates || {}).length,
      stepStates: Object.keys(reg.stepStates || {}).length,
      evidence: Object.values(reg.evidence || {}).flat().length,
      formInstances: Object.values(reg.generatedFormInstancesByEventId || {}).flat().length,
      audit: Object.values(reg.taskAuditByEventId || {}).flat().length,
    };
  }, { REG_KEY });
  console.log('  BEFORE:', JSON.stringify(before, null, 2));

  if (before.ecignInstances === 0) {
    console.error('ERROR: No eCIgn instances seeded!');
    await browser.close();
    process.exit(1);
  }

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: Click the ACTUAL reset button
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== PHASE 3: Click "Clear All Evidence" reset button ===');
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(3000);

  const clearBtn = page.locator('button').filter({ hasText: /Clear All Evidence/i });
  const btnCount = await clearBtn.count();
  console.log(`  Found ${btnCount} "Clear All Evidence" buttons`);

  if (btnCount === 0) {
    console.error('ERROR: Could not find reset button!');
    await browser.close();
    process.exit(1);
  }

  await clearBtn.first().click();
  console.log('  Clicked. Waiting for reset + reload...');
  await page.waitForTimeout(8000);
  try { await page.waitForLoadState('networkidle', { timeout: 10000 }); } catch {}
  await page.waitForTimeout(4000);

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: Verify EVERYTHING is cleared
  // ═══════════════════════════════════════════════════════════════
  console.log('\n=== PHASE 4: Verify AFTER reset ===');
  // Fresh navigation
  await page.goto('http://localhost:5173/evidence', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(4000);

  const after = await page.evaluate(({ REG_KEY }) => {
    const ecignRaw = localStorage.getItem('ci_ecign_demo_local_v1');
    const ecign = ecignRaw ? JSON.parse(ecignRaw) : {};
    const instances = Object.entries(ecign.instances || {});
    const sigs = Object.values(ecign.signaturesByInstanceId || {}).flat().length;
    const audits = Object.values(ecign.auditByInstanceId || {}).flat().length;
    const consents = Object.keys(ecign.consentsByUserId || {}).length;

    let pointers = 0, formFields = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith('ecign:instance:')) pointers++;
      if (k?.startsWith('ci_form_fields_')) formFields++;
    }

    const regRaw = localStorage.getItem(REG_KEY);
    let regData = { gone: true };
    if (regRaw) {
      const s = JSON.parse(regRaw).state;
      regData = {
        gone: false,
        approvals: (s.approvals || []).length,
        formStates: Object.keys(s.formStates || {}).length,
        stepStates: Object.keys(s.stepStates || {}).length,
        evidence: Object.values(s.evidence || {}).flat().length,
        formInstances: Object.values(s.generatedFormInstancesByEventId || {}).flat().length,
        audit: Object.values(s.taskAuditByEventId || {}).flat().length,
      };
    }

    return {
      ecignInstances: instances.length,
      ecignDetails: instances.map(([id, i]) => ({ id, state: i.state, event_id: i.event_id || '(none)' })),
      signatures: sigs, ecignAudits: audits, consents, pointers, formFields,
      reg: regData,
    };
  }, { REG_KEY });
  console.log('  AFTER:', JSON.stringify(after, null, 2));

  const pctVals = await page.locator('text=/\\d+%/').allTextContents();
  const nonZero = pctVals.filter(v => !v.startsWith('0%'));
  console.log(`  Completion: ${pctVals.length} values, ${nonZero.length} non-zero`);

  await page.screenshot({ path: path.join(screenshotDir, '40-after-full-reset.png') });

  // ═══════════════════════════════════════════════════════════════
  // RESULTS
  // ═══════════════════════════════════════════════════════════════
  console.log('\n' + '='.repeat(70));
  console.log('  FULL RESET VERIFICATION');
  console.log('='.repeat(70));

  const checks = [
    ['eCIgn instances cleared (was ' + before.ecignInstances + ')', after.ecignInstances === 0],
    ['eCIgn signatures cleared', after.signatures === 0],
    ['eCIgn audit events cleared', after.ecignAudits === 0],
    ['eCIgn consents cleared', after.consents === 0],
    ['ecign:instance:* pointers cleared', after.pointers === 0],
    ['Form field localStorage cleared', after.formFields === 0],
    ['Approvals cleared', after.reg.gone || after.reg.approvals === 0],
    ['Form states cleared', after.reg.gone || after.reg.formStates === 0],
    ['Step states cleared', after.reg.gone || after.reg.stepStates === 0],
    ['Evidence cleared', after.reg.gone || after.reg.evidence === 0],
    ['Form instances cleared', after.reg.gone || after.reg.formInstances === 0],
    ['Audit trail cleared', after.reg.gone || after.reg.audit === 0],
    ['All completion values 0%', nonZero.length === 0],
    ['Instance WITHOUT event_id cleared (THE BUG)', after.ecignInstances === 0],
  ];

  let allPass = true;
  for (const [label, pass] of checks) {
    console.log(`  [${pass ? 'PASS' : '*** FAIL ***'}] ${label}`);
    if (!pass) allPass = false;
  }
  const passCount = checks.filter(([,p]) => p).length;
  console.log(`\n  ${allPass ? 'ALL PASSED' : 'SOME FAILED'}: ${passCount}/${checks.length}`);
  if (after.ecignDetails.length > 0) {
    console.log('  Remaining eCIgn instances:', JSON.stringify(after.ecignDetails));
  }
  console.log('='.repeat(70));

  await browser.close();
  process.exit(allPass ? 0 : 1);
}

run().catch(err => { console.error('Error:', err); process.exit(1); });
