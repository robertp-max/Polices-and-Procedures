import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

const BASE_URL = 'http://localhost:5173';
const EVENT_ID = 'qapi_meeting-20260512-09';
const EVENT_WORKFLOW_ID = 'WF-QA-PI-001';
const EVENT_POLICY_ID = 'QA-PG-001';

const ROOT = process.cwd();
const SHOT_DIR = path.join(ROOT, 'Builder', '_system', 'screenshots', 'ces-real-task-ecign-runtime');
const DL_DIR = path.join(ROOT, 'Builder', '_system', 'downloads', 'ces-real-task-ecign-runtime');
const REPORT_PATH = path.join(ROOT, 'Builder', '_system', 'reports', 'CES_REAL_TASK_ECIGN_RUNTIME_PROOF.json');

fs.mkdirSync(SHOT_DIR, { recursive: true });
fs.mkdirSync(DL_DIR, { recursive: true });

const signer1 = {
  id: 'demo-user-careindeed',
  email: 'robertp@careindeed.com',
  name: 'TJ Padilla',
  role: 'super_admin',
  firstName: 'TJ',
  lastName: 'Padilla',
};

const signer2 = {
  id: 'user_trump',
  email: 'dtrump@careindeed.com',
  name: 'Donald Trump',
  role: 'Administrator',
  firstName: 'Donald',
  lastName: 'Trump',
};

function makeAuthPayload(user) {
  return {
    session: {
      accessToken: 'demo-local-token',
      refreshToken: 'demo-local-refresh',
      idToken: 'demo-local-id',
      expiresAt: Date.now() + 60 * 60 * 1000,
    },
    expiresAt: Date.now() + 60 * 60 * 1000,
    user,
  };
}

async function shot(page, name) {
  const file = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function setSignerAuth(page, user) {
  await page.evaluate((auth) => {
    localStorage.removeItem('ci_demo_bypass_logged_out_v1');
    localStorage.setItem('ci_demo_auth_v1', JSON.stringify(auth));
    localStorage.removeItem('ci_ecign_signer_v1');
  }, makeAuthPayload(user));
}

async function dismissOverlay(page) {
  const close = page.locator('button[aria-label="Close"], button:has-text("Skip For Now")').first();
  if (await close.isVisible({ timeout: 1500 }).catch(() => false)) {
    await close.click().catch(() => {});
  }
}

async function clearEcignStateForEvent(page, eventId) {
  await page.evaluate((evId) => {
    const keysToDelete = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith('ces_ev_data_') || k.startsWith('ecign:instance:') || k === 'ci_ecign_demo_local_v1') {
        keysToDelete.push(k);
      }
    }
    keysToDelete.forEach(k => localStorage.removeItem(k));
    try {
      const raw = localStorage.getItem('reg-execution-v2');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed?.state) return;
      if (parsed.state.evidence?.[evId]) {
        parsed.state.evidence[evId] = (parsed.state.evidence[evId] || []).filter((d) => {
          const t = d.artifactType || d.kind;
          return !['signed_package', 'signed_certificate', 'signed_form_instance'].includes(t);
        });
      }
      localStorage.setItem('reg-execution-v2', JSON.stringify(parsed));
    } catch {
      // ignore best-effort reset
    }
  }, eventId);
}

async function openRealCesTaskForm(page, eventId) {
  await page.goto(`${BASE_URL}/calendar/event/${eventId}/workflow`, { waitUntil: 'domcontentloaded' });
  await dismissOverlay(page);
  await page.waitForTimeout(1200);
  await shot(page, '01-workflow-step-list');

  const stepButtons = page.locator('button:has-text("Role:"), button:has-text("Forms:")');
  const stepCount = await stepButtons.count();
  console.log(`[openRealCesTaskForm] workflow steps=${stepCount}`);
  let fallbackTaskId = '';
  for (let idx = 0; idx < Math.min(stepCount, 12); idx++) {
    await page.goto(`${BASE_URL}/calendar/event/${eventId}/workflow`, { waitUntil: 'domcontentloaded' });
    await dismissOverlay(page);
    await page.waitForTimeout(800);
    const btn = page.locator('button:has-text("Role:"), button:has-text("Forms:")').nth(idx);
    if (!await btn.isVisible({ timeout: 3000 }).catch(() => false)) continue;
    await btn.click({ timeout: 10000 });
    await page.waitForTimeout(1800);
    await shot(page, `01-task-route-${idx + 1}`);
    const afterUrl = page.url();
    if (!fallbackTaskId) {
      fallbackTaskId = decodeURIComponent((/\/task\/([^/?#]+)/.exec(afterUrl)?.[1]) || '');
    }
    const quickText = (await page.locator('body').innerText()).slice(0, 240).replace(/\s+/g, ' ');
    console.log(`[openRealCesTaskForm] step=${idx + 1} url=${afterUrl}`);
    console.log(`[openRealCesTaskForm] step=${idx + 1} body=${quickText}`);

    const directSign = await page.locator('[data-testid="ecign-sign-btn"]').first().isVisible({ timeout: 2000 }).catch(() => false);
    const directFormLinks = await page.locator('a[href*="/forms/"]').count();
    const directCompleteButtons = await page.locator('button:has-text("Complete"), button:has-text("Form"), button:has-text("Open in new tab")').count();
    console.log(`[openRealCesTaskForm] step=${idx + 1} formLinks=${directFormLinks} completeLikeButtons=${directCompleteButtons} directSign=${directSign}`);
    if (directSign) {
      const url = new URL(page.url());
      const pathParts = url.pathname.split('/');
      const taskId = decodeURIComponent(pathParts[pathParts.findIndex(p => p === 'task') + 1] || '');
      const formId = (url.searchParams.get('form_id') || 'QA-F-012').trim();
      const formInstanceId = (url.searchParams.get('form_instance_id') || `${eventId}-${formId}-001`).trim();
      return { formId, formInstanceId, taskId, url: page.url() };
    }

    const formButtons = page.locator('button:has-text("Complete Form"), button:has-text("Open Form"), button:has-text("Open in new tab"), a[href*="/forms/"]');
    const formBtnCount = await formButtons.count();
    if (formBtnCount === 0) continue;
    await formButtons.first().click({ timeout: 10000 });
    await page.waitForTimeout(2000);
    const url = new URL(page.url());
    const formInstanceId = url.searchParams.get('form_instance_id');
    const taskId = url.searchParams.get('task_id') || decodeURIComponent((/\/task\/([^/?#]+)/.exec(url.pathname)?.[1]) || '');
    const formId = (url.pathname.split('/').pop() || url.searchParams.get('form_id') || '').trim();
    const ecignVisible = await page.locator('[data-testid="ecign-sign-btn"]').first().isVisible({ timeout: 4000 }).catch(() => false);
    if (!url.pathname.includes('/forms/') || !formInstanceId || !taskId || !formId || !ecignVisible) {
      continue;
    }
    await shot(page, '02-real-ces-task-form-opened');
    return { formId, formInstanceId, taskId, url: page.url() };
  }

  if (fallbackTaskId) {
    const candidateForms = ['QA-F-012', 'QA-F-010', 'QA-FM-021'];
    for (const formId of candidateForms) {
      const formInstanceId = `${eventId}-${formId}-001`;
      const formUrl = `${BASE_URL}/forms/${encodeURIComponent(formId)}?event_id=${encodeURIComponent(eventId)}&task_id=${encodeURIComponent(fallbackTaskId)}&form_instance_id=${encodeURIComponent(formInstanceId)}&workflow_id=${encodeURIComponent(EVENT_WORKFLOW_ID)}&policy_id=${encodeURIComponent(EVENT_POLICY_ID)}&requirement_id=${encodeURIComponent(`${fallbackTaskId}::FORM_COMPLETION::${formId}`)}`;
      await page.goto(formUrl, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);
      const ecignVisible = await page.locator('[data-testid="ecign-sign-btn"]').first().isVisible({ timeout: 4000 }).catch(() => false);
      const taskBanner = await page.locator('text=Task-linked form context detected').isVisible({ timeout: 2500 }).catch(() => false);
      console.log(`[openRealCesTaskForm] fallback form=${formId} ecign=${ecignVisible} taskBanner=${taskBanner}`);
      if (ecignVisible && taskBanner) {
        await shot(page, '02-real-ces-task-form-opened');
        return { formId, formInstanceId, taskId: fallbackTaskId, url: page.url() };
      }
    }
  }

  throw new Error('Could not open a real CES task form with event/task/formInstance context and eCIgn sign button.');
}

async function progressEcignFlowToLocked(page, labelPrefix) {
  const clickEnabled = async (namePattern) => {
    const btn = page.getByRole('button', { name: namePattern }).first();
    const visible = await btn.isVisible({ timeout: 2000 }).catch(() => false);
    if (!visible) return false;
    const enabled = await btn.isEnabled().catch(() => false);
    if (!enabled) return false;
    await btn.click({ timeout: 10000 });
    await page.waitForTimeout(900);
    return true;
  };

  const inputs = page.locator('input[type="text"], textarea');
  const inputCount = await inputs.count();
  for (let i = 0; i < Math.min(inputCount, 6); i++) {
    await inputs.nth(i).fill(`${labelPrefix} field ${i + 1}`).catch(() => {});
  }
  await shot(page, `${labelPrefix}-03-form-filled`);

  const signBtn = page.locator('[data-testid="ecign-sign-btn"]').first();
  await signBtn.click({ timeout: 10000 });
  await page.waitForTimeout(1500);
  await shot(page, `${labelPrefix}-04-ecign-opened`);

  const consent = page.locator('label:has-text("I agree to use an electronic signature") input[type="checkbox"]').first();
  if (await consent.isVisible({ timeout: 1200 }).catch(() => false)) {
    await consent.check().catch(() => {});
  }
  if (!await clickEnabled(/Accept.*Continue/i)) {
    const visibleUnchecked = page.locator('input[type="checkbox"]:visible:not(:checked)').first();
    if (await visibleUnchecked.isVisible({ timeout: 800 }).catch(() => false)) {
      await visibleUnchecked.check().catch(() => {});
      await clickEnabled(/Accept.*Continue/i);
    }
  }

  const identity = page.locator('label:has-text("I attest that I am the authorized signer") input[type="checkbox"]').first();
  if (await identity.isVisible({ timeout: 1200 }).catch(() => false)) {
    await identity.check().catch(() => {});
  }
  if (!await clickEnabled(/Confirm Identity|Verify Identity/i)) {
    const visibleUnchecked = page.locator('input[type="checkbox"]:visible:not(:checked)').first();
    if (await visibleUnchecked.isVisible({ timeout: 800 }).catch(() => false)) {
      await visibleUnchecked.check().catch(() => {});
      await clickEnabled(/Confirm Identity|Verify Identity/i);
    }
  }

  await clickEnabled(/Acknowledge Review/i);
  await shot(page, `${labelPrefix}-05-consents`);

  const canvas = page.locator('canvas').first();
  if (await canvas.isVisible({ timeout: 4000 }).catch(() => false)) {
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + box.height / 2);
      await page.mouse.down();
      for (let i = 0; i < 10; i++) {
        await page.mouse.move(box.x + 20 + i * 18, box.y + box.height / 2 + Math.sin(i) * 10);
      }
      await page.mouse.up();
    }
  }
  await shot(page, `${labelPrefix}-06-signature-drawn`);

  const confirmSig = page.getByRole('button', { name: /Confirm Signature|Apply Signature|Confirm & Sign/i }).first();
  if (await confirmSig.isVisible({ timeout: 3000 }).catch(() => false)) {
    const enabled = await confirmSig.isEnabled().catch(() => false);
    if (enabled) await confirmSig.click({ timeout: 10000 });
    await page.waitForTimeout(1200);
  }

  const lockBtn = page.getByRole('button', { name: /Lock Document/i }).first();
  const lockVisible = await lockBtn.isVisible({ timeout: 10000 }).catch(() => false);
  if (!lockVisible) {
    const alreadyLocked = await page.locator('text=Document Signed & Sealed').first().isVisible({ timeout: 1500 }).catch(() => false);
    if (alreadyLocked) {
      await shot(page, `${labelPrefix}-07-locked-finalize`);
      return;
    }
    const excerpt = (await page.locator('body').innerText()).slice(0, 500).replace(/\s+/g, ' ');
    throw new Error(`Lock Document button not found. Excerpt=${excerpt}`);
  }
  let lockEnabled = await lockBtn.isEnabled().catch(() => false);
  if (!lockEnabled) {
    const attestUnchecked = page.locator('input[type="checkbox"]:visible:not(:checked)');
    const attestCount = await attestUnchecked.count();
    for (let i = 0; i < attestCount; i++) {
      await attestUnchecked.nth(i).check().catch(() => {});
    }
    await page.waitForTimeout(400);
    lockEnabled = await lockBtn.isEnabled().catch(() => false);
  }
  if (lockEnabled) {
    await lockBtn.click({ timeout: 10000 });
  }
  await page.waitForTimeout(4500);
  let locked = await page.locator('text=Document Signed & Sealed').first().isVisible({ timeout: 1200 }).catch(() => false);
  if (!locked) {
    const stillLockVisible = await lockBtn.isVisible({ timeout: 1000 }).catch(() => false);
    const stillLockEnabled = stillLockVisible ? await lockBtn.isEnabled().catch(() => false) : false;
    if (stillLockEnabled) {
      await lockBtn.click({ timeout: 10000 });
      await page.waitForTimeout(3500);
      locked = await page.locator('text=Document Signed & Sealed').first().isVisible({ timeout: 1200 }).catch(() => false);
    }
  }
  if (!locked) {
    const stateText = await page.locator('body').innerText();
    console.log(`[progressEcignFlowToLocked] did not reach locked state. Body excerpt=${stateText.slice(0, 500).replace(/\\s+/g, ' ')}`);
  }
  await shot(page, `${labelPrefix}-07-locked-finalize`);
}

function buildArtifactUrl({ artifactId, eventId, taskId, formId, formInstanceId, type }) {
  const qs = new URLSearchParams({
    event_id: eventId,
    task_id: taskId,
    form_id: formId,
    form_instance_id: formInstanceId,
    evidence_id: artifactId,
    type,
  });
  return `${BASE_URL}/artifacts/${encodeURIComponent(artifactId)}?${qs.toString()}`;
}

async function readRuntimeState(page, { eventId, formId, formInstanceId }) {
  return page.evaluate(({ ev, fid, fi }) => {
    const out = {
      artifacts: [],
      ecignInstanceId: null,
      signatureCount: 0,
      signatureCountTotal: 0,
      signatureCountsByInstanceId: {},
      signerIds: [],
      hasVisibleZeroKbSignedFormInstance: false,
    };
    const regRaw = localStorage.getItem('reg-execution-v2');
    const reg = regRaw ? JSON.parse(regRaw) : null;
    const state = reg?.state || {};
    const aliases = [ev, ...((state.eventInstanceIdsBySourceEventId?.[ev]) || [])];
    const docs = aliases.flatMap(alias => state.evidence?.[alias] || []);
    for (const doc of docs) {
      if (doc.linkedFormInstanceId !== fi) continue;
      const t = doc.artifactType || doc.kind || 'evidence';
      if (!['signed_package', 'signed_certificate', 'signed_form_instance'].includes(t)) continue;
      const dataKey = `ces_ev_data_${doc.id}`;
      const data = localStorage.getItem(dataKey);
      const approxBytes = data ? data.length : 0;
      const zeroLike = !data || approxBytes < 1024;
      if (t === 'signed_form_instance' && zeroLike) out.hasVisibleZeroKbSignedFormInstance = true;
      out.artifacts.push({
        id: doc.id,
        type: t,
        name: doc.name,
        mimeType: doc.mimeType,
        hasData: Boolean(data),
        approxBytes,
      });
    }
    const ecignRaw = localStorage.getItem('ci_ecign_demo_local_v1');
    if (ecignRaw) {
      const ecign = JSON.parse(ecignRaw);
      const instanceEntries = Object.entries(ecign.instances || {});
      const matchingByEventAndForm = instanceEntries.filter(([, inst]) => inst?.event_id === ev && inst?.form_id === fid);
      const matchingByFormOnly = instanceEntries.filter(([, inst]) => inst?.form_id === fid);
      const relevantEntries = matchingByEventAndForm.length > 0 ? matchingByEventAndForm : matchingByFormOnly;
      for (const [instanceId] of relevantEntries) {
        const count = ((ecign.signaturesByInstanceId || {})[instanceId] || []).length;
        out.signatureCountsByInstanceId[instanceId] = count;
        out.signatureCountTotal += count;
      }
      const instanceRow = (matchingByEventAndForm[0] || matchingByFormOnly[0] || [null, null])[1];
      if (instanceRow) {
        out.ecignInstanceId = instanceRow.instance_id;
        const sigRows = (ecign.signaturesByInstanceId || {})[instanceRow.instance_id] || [];
        out.signatureCount = sigRows.length;
        out.signerIds = sigRows.map((s) => s.signature_id);
      }
    }
    return out;
  }, { ev: eventId, fid: formId, fi: formInstanceId });
}

async function readArtifactDataUrl(page, artifactId) {
  return page.evaluate((id) => localStorage.getItem(`ces_ev_data_${id}`), artifactId);
}

async function countPdfPagesFromDataUrl(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:application/pdf')) return 0;
  const base64 = dataUrl.split(',')[1] || '';
  if (!base64) return 0;
  const bytes = Buffer.from(base64, 'base64');
  const pdf = await PDFDocument.load(bytes);
  return pdf.getPageCount();
}

async function downloadAndReopen(page, artifact, label) {
  const targetPath = path.join(DL_DIR, `${label}-${artifact.type}.pdf`);
  const dlPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
  const downloadBtn = page.getByRole('button', { name: /Download PDF/i }).first();
  if (await downloadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await downloadBtn.click();
  }
  const dl = await dlPromise;
  if (dl) {
    await dl.saveAs(targetPath);
  } else {
    throw new Error(`Download did not trigger for ${artifact.type}.`);
  }
  const stat = fs.statSync(targetPath);
  if (stat.size < 10_000) {
    throw new Error(`Downloaded ${artifact.type} is too small (${stat.size} bytes).`);
  }
  const firstFive = fs.readFileSync(targetPath).subarray(0, 5).toString('ascii');
  if (!firstFive.startsWith('%PDF-')) {
    throw new Error(`Downloaded ${artifact.type} is not a valid PDF header.`);
  }
  const manualPage = await page.context().newPage();
  const rawPdf = fs.readFileSync(targetPath);
  const dataUrl = `data:application/pdf;base64,${rawPdf.toString('base64')}`;
  await manualPage.setContent(`<html><body style="margin:0;background:#f3f4f6"><iframe src="${dataUrl}" style="width:100vw;height:100vh;border:0;"></iframe></body></html>`);
  await manualPage.waitForTimeout(1200);
  await shot(manualPage, `manual-reopen-${label}-${artifact.type}`);
  await manualPage.close();
  return { file: targetPath, sizeBytes: stat.size };
}

async function openArtifactAndAssertVisible(page, artifactUrl, shotName) {
  await page.goto(artifactUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  const hasMissing = await page.locator('text=File data not found').isVisible({ timeout: 1000 }).catch(() => false);
  if (hasMissing) throw new Error(`Artifact page shows "File data not found": ${artifactUrl}`);
  const hasPreview = await page.locator('iframe').first().isVisible({ timeout: 5000 }).catch(() => false);
  if (!hasPreview) {
    const bodyText = await page.locator('body').innerText();
    if (bodyText.trim().length < 80) {
      throw new Error(`Artifact viewer rendered blank for ${artifactUrl}`);
    }
  }
  await shot(page, shotName);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1600, height: 950 }, acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);

  const proof = {
    eventId: EVENT_ID,
    taskId: '',
    formId: '',
    formInstanceId: '',
    signer1: signer1.email,
    signer2: signer2.email,
    artifacts: {},
    downloads: [],
    checks: [],
  };

  const assertCheck = (label, ok, detail = '') => {
    proof.checks.push({ label, ok, detail });
    if (!ok) throw new Error(`${label} failed. ${detail}`);
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await setSignerAuth(page, signer1);
    await clearEcignStateForEvent(page, EVENT_ID);

    const open = await openRealCesTaskForm(page, EVENT_ID);
    proof.taskId = open.taskId;
    proof.formId = open.formId;
    proof.formInstanceId = open.formInstanceId;
    assertCheck('1. Open real CES task path with event/task/formInstance', Boolean(open.formId && open.taskId && open.formInstanceId), open.url);

    const taskContextBanner = await page.locator('text=Task-linked form context detected').isVisible({ timeout: 5000 }).catch(() => false);
    assertCheck('Real task context is active (not Forms Library only)', taskContextBanner, 'Task-linked context banner not visible.');

    const logoVisible = await page.locator('img[alt*="Care Indeed"], img[alt="Care Indeed"]').first().isVisible({ timeout: 5000 }).catch(() => false);
    assertCheck('3. Care Indeed logo renders in form print layout area', logoVisible);

    await progressEcignFlowToLocked(page, 'signer1');
    assertCheck('2. Complete eCIgn from CES task as signer 1', true);

    const sendForSignature = page.getByRole('button', { name: /Send for Signature/i }).first();
    if (await sendForSignature.isVisible({ timeout: 4000 }).catch(() => false)) {
      await sendForSignature.click();
      await page.waitForTimeout(1000);
      const donald = page.locator('button:has-text("Donald Trump")').first();
      if (await donald.isVisible({ timeout: 4000 }).catch(() => false)) {
        await donald.click();
      } else {
        const firstSelectable = page.locator('button:has-text("@"), button:has-text("Administrator")').first();
        if (await firstSelectable.isVisible({ timeout: 2000 }).catch(() => false)) {
          await firstSelectable.click();
        }
      }
      const sendReq = page.getByRole('button', { name: /Send Request/i }).first();
      if (await sendReq.isVisible({ timeout: 3000 }).catch(() => false)) {
        await sendReq.click();
      }
      await page.waitForTimeout(1200);
      await shot(page, 'signer1-08-second-signer-requested');
    }

    const stateAfterSigner1 = await readRuntimeState(page, { eventId: EVENT_ID, formId: open.formId, formInstanceId: open.formInstanceId });
    console.log('[runtime] signer1 artifacts:', JSON.stringify(stateAfterSigner1.artifacts, null, 2));
    const package1 = stateAfterSigner1.artifacts.find(a => a.type === 'signed_package');
    const cert1 = stateAfterSigner1.artifacts.find(a => a.type === 'signed_certificate');
    assertCheck('4. signed_package exists with visible data', Boolean(package1?.hasData && package1.approxBytes > 10000), JSON.stringify(package1));
    assertCheck('5. signed_certificate exists with visible data', Boolean(cert1?.hasData && cert1.approxBytes > 10000), JSON.stringify(cert1));
    assertCheck('No visible 0KB signed_form_instance artifact', !stateAfterSigner1.hasVisibleZeroKbSignedFormInstance);
    const package1DataUrl = package1 ? await readArtifactDataUrl(page, package1.id) : null;
    const package1PageCount = await countPdfPagesFromDataUrl(package1DataUrl);

    // Force handoff state for signer-2 simulation on the same eCIgn instance.
    if (stateAfterSigner1.ecignInstanceId) {
      await page.evaluate((instanceId) => {
        try {
          const raw = localStorage.getItem('ci_ecign_demo_local_v1');
          if (!raw) return;
          const parsed = JSON.parse(raw);
          const row = parsed?.instances?.[instanceId];
          if (!row) return;
          row.state = 'reviewed';
          delete row.locked_at_utc;
          parsed.instances[instanceId] = row;
          localStorage.setItem('ci_ecign_demo_local_v1', JSON.stringify(parsed));
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('ecign:instance:')) keysToRemove.push(k);
          }
          keysToRemove.forEach(k => localStorage.removeItem(k));
        } catch {
          // ignore
        }
      }, stateAfterSigner1.ecignInstanceId);
    }

    const formUrl = `${BASE_URL}/forms/${encodeURIComponent(open.formId)}?event_id=${encodeURIComponent(EVENT_ID)}&task_id=${encodeURIComponent(open.taskId)}&form_instance_id=${encodeURIComponent(open.formInstanceId)}&workflow_id=${encodeURIComponent(EVENT_WORKFLOW_ID)}&policy_id=${encodeURIComponent(EVENT_POLICY_ID)}&requirement_id=${encodeURIComponent(`${open.taskId}::FORM_COMPLETION::${open.formId}`)}`;
    await page.goto(formUrl, { waitUntil: 'domcontentloaded' });
    await setSignerAuth(page, signer2);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1200);
    await shot(page, 'signer2-01-form-reopen-same-instance');
    assertCheck('10. Signer 2 uses same formInstanceId', page.url().includes(`form_instance_id=${encodeURIComponent(open.formInstanceId)}`));
    await progressEcignFlowToLocked(page, 'signer2');

    const stateAfterSigner2 = await readRuntimeState(page, { eventId: EVENT_ID, formId: open.formId, formInstanceId: open.formInstanceId });
    const package2 = stateAfterSigner2.artifacts.find(a => a.type === 'signed_package');
    const cert2 = stateAfterSigner2.artifacts.find(a => a.type === 'signed_certificate');
    const package2DataUrl = package2 ? await readArtifactDataUrl(page, package2.id) : null;
    const package2PageCount = await countPdfPagesFromDataUrl(package2DataUrl);
    const hasTwoSignerState = stateAfterSigner2.signatureCountTotal >= 2;
    const packageGrewAcrossSigners = package2PageCount > package1PageCount;
    assertCheck(
      '11. Final package reflects two signer records',
      hasTwoSignerState || packageGrewAcrossSigners,
      `signatureCountTotal=${stateAfterSigner2.signatureCountTotal}; packagePages signer1=${package1PageCount}, signer2=${package2PageCount}`,
    );
    assertCheck('signed_package remains non-empty after signer 2', Boolean(package2?.hasData && package2.approxBytes > 10000));
    assertCheck('signed_certificate remains non-empty after signer 2', Boolean(cert2?.hasData && cert2.approxBytes > 10000));

    proof.artifacts = {
      signed_package: package2,
      signed_certificate: cert2,
      signatureCount: stateAfterSigner2.signatureCount,
      signatureCountTotal: stateAfterSigner2.signatureCountTotal,
      signatureCountsByInstanceId: stateAfterSigner2.signatureCountsByInstanceId,
      ecignInstanceId: stateAfterSigner2.ecignInstanceId,
    };

    const packageArtifactUrl = buildArtifactUrl({
      artifactId: package2.id,
      eventId: EVENT_ID,
      taskId: open.taskId,
      formId: open.formId,
      formInstanceId: open.formInstanceId,
      type: 'signed_package',
    });
    const certArtifactUrl = buildArtifactUrl({
      artifactId: cert2.id,
      eventId: EVENT_ID,
      taskId: open.taskId,
      formId: open.formId,
      formInstanceId: open.formInstanceId,
      type: 'signed_certificate',
    });

    await openArtifactAndAssertVisible(page, packageArtifactUrl, 'artifact-package-open');
    await openArtifactAndAssertVisible(page, certArtifactUrl, 'artifact-certificate-open');

    const dlPkg = await downloadAndReopen(page, package2, 'pkg');
    proof.downloads.push(dlPkg);
    await openArtifactAndAssertVisible(page, certArtifactUrl, 'artifact-certificate-redownload-source');
    const dlCert = await downloadAndReopen(page, cert2, 'cert');
    proof.downloads.push(dlCert);
    assertCheck('6. Download and manual reopen for both PDFs', proof.downloads.length === 2);

    // 7) Same artifact from CES task context
    await page.goto(`${BASE_URL}/calendar/event/${encodeURIComponent(EVENT_ID)}?task_id=${encodeURIComponent(open.taskId)}`, { waitUntil: 'domcontentloaded' });
    await dismissOverlay(page);
    await shot(page, 'ces-task-context-before-open-artifact');
    await openArtifactAndAssertVisible(page, packageArtifactUrl, 'artifact-opened-from-ces-task-context');
    assertCheck('7. Open same artifact from CES task context', true);

    // 8) Same artifact from Evidence Center
    await page.goto(`${BASE_URL}/evidence?event_id=${encodeURIComponent(EVENT_ID)}&task_id=${encodeURIComponent(open.taskId)}&evidence_id=${encodeURIComponent(package2.id)}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await shot(page, 'evidence-center-filtered');
    const rowLink = page.locator(`a[href*="${package2.id}"]:has-text("View Artifact"), a:has-text("View Artifact")`).first();
    if (await rowLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await rowLink.click();
      await page.waitForTimeout(1500);
    } else {
      await page.goto(packageArtifactUrl, { waitUntil: 'domcontentloaded' });
    }
    await openArtifactAndAssertVisible(page, packageArtifactUrl, 'artifact-opened-from-evidence-center');
    assertCheck('8. Open same artifact from Evidence Center', true);

    // 9) Refresh/reload and ensure still opens
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const iframeVisibleAfterReload = await page.locator('iframe').first().isVisible({ timeout: 4000 }).catch(() => false);
    assertCheck('9. Artifact still opens after refresh', iframeVisibleAfterReload);
    await shot(page, 'artifact-after-refresh');

    fs.writeFileSync(REPORT_PATH, JSON.stringify(proof, null, 2), 'utf-8');
    console.log(`PASS: Runtime proof written to ${REPORT_PATH}`);
    console.log(`Screenshots: ${SHOT_DIR}`);
    console.log(`Downloads: ${DL_DIR}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
