import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const out = path.resolve(process.cwd(), 'Builder/_system/screenshots/post-impl/canonical-id-alignment.png');
mkdirSync(path.dirname(out), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
try {
  await page.goto(`${BASE}/forms`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  const probe = await page.evaluate(async () => {
    const { REGULATORY_EVENTS } = await import('/src/policy/data/regulatoryEvents.ts');
    const { projectTasks } = await import('/src/policy/pm/taskProjectionCore.ts');
    const { useRegulatoryExecutionStore } = await import('/src/policy/stores/regulatoryExecutionStore.ts');
    const formId = 'QA-FM-021';
    const ev =
      REGULATORY_EVENTS.find(e => (e.requiredForms || []).some(rf => rf.formId === formId || rf.id === formId))
      || REGULATORY_EVENTS[0];
    const projected = projectTasks({ events: [ev], formStates: {}, overlays: {} });
    const t = projected.find(x => x.form_id === formId || x.form_ids?.includes(formId)) || projected[0];
    const store = useRegulatoryExecutionStore.getState();
    const inst = store.getOrCreateFormInstance({
      eventId: ev.id,
      formId,
      taskId: t?.task_id,
      requirementId: `${t?.task_id}::FORM_COMPLETION::${formId}`,
      policyIds: ev.policyRefs || ['QA-PG-001'],
      workflowId: ev.workflowId,
    });
    return {
      projected_first: t?.generated_form_instance_ids?.[0],
      store_id: inst?.id,
      match: t?.generated_form_instance_ids?.[0] === inst?.id,
    };
  });
  await page.evaluate((json) => {
    const pre = document.createElement('pre');
    pre.style.cssText =
      'position:fixed;bottom:16px;left:16px;right:16px;max-height:38vh;overflow:auto;z-index:99999;background:#0f172a;color:#e2e8f0;padding:14px;font:14px monospace;border:2px solid #14b8a6;border-radius:10px;';
    pre.textContent = `POST-IMPL A/B/G/E — canonical form instance alignment\n${json}`;
    document.body.appendChild(pre);
  }, JSON.stringify(probe, null, 2));
  await page.waitForTimeout(400);
  await page.screenshot({ path: out, fullPage: true });
  // eslint-disable-next-line no-console
  console.log('WROTE', out, probe);
} catch (e) {
  // eslint-disable-next-line no-console
  console.error('Screenshot skipped:', e.message);
}
await browser.close();
