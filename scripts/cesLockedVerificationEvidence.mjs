/**
 * Captures UI screenshots for CES/eCIgn locked-mode verification (todo evidence).
 * Requires: BASE_URL reachable (e.g. Vite with VITE_LOCAL_DEMO_AUTH_BYPASS=true).
 */
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://localhost:5173';
const outDir = path.resolve(
  process.cwd(),
  'Builder/_system/screenshots/ces-locked-verify',
);
mkdirSync(outDir, { recursive: true });

const shot = async (page, name) => {
  const fp = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: fp, fullPage: true });
  return fp.replace(/\\/g, '/');
};

const run = async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 960 } });
  const page = await ctx.newPage();

  const log = [];
  const capture = async (name, url) => {
    await page.goto(`${BASE}${url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForTimeout(1200);
    const p = await shot(page, name);
    log.push({ name, url: `${BASE}${url}`, screenshot: p });
  };

  try {
    await capture('F-obsolete-policies-route', '/policies/QA-PG-001');
    await capture('G-calendar-sprint-view-default', '/calendar?view=sprint');
    const sprintSelect = page.locator('label.min-w-0').locator('select').first();
    await sprintSelect.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
    if ((await sprintSelect.count()) > 0) {
      await sprintSelect.selectOption('2026-09');
      await page.waitForTimeout(800);
      await shot(page, 'G-calendar-sprint-board-sprint-09');
      await sprintSelect.selectOption('2026-10');
      await page.waitForTimeout(800);
      await shot(page, 'G-calendar-sprint-board-sprint-10');
    }
    await capture('G-ces-execution-board', '/ces/board');
    await capture('H-gantt-expanded-rows', '/calendar?view=gantt');
    await capture('verify-id-mismatch-eval', '/forms');
    const idProbe = await page.evaluate(async () => {
      const { REGULATORY_EVENTS } = await import('/src/policy/data/regulatoryEvents.ts');
      const { projectTasks } = await import('/src/policy/pm/taskProjectionCore.ts');
      const { useRegulatoryExecutionStore } = await import('/src/policy/stores/regulatoryExecutionStore.ts');
      const formId = 'QA-FM-021';
      const ev =
        REGULATORY_EVENTS.find(e => (e.requiredForms || []).some(rf => rf.formId === formId || rf.id === formId)) ||
        REGULATORY_EVENTS[0];
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
        eventId: ev.id,
        projectedFormInstanceIds: t?.generated_form_instance_ids ?? [],
        storeFormInstanceId: inst?.id ?? null,
        taskId: t?.task_id ?? null,
      };
    });
    await page.evaluate((probe) => {
      const pre = document.createElement('pre');
      pre.id = 'id-probe-overlay';
      pre.style.cssText =
        'position:fixed;bottom:8px;left:8px;right:8px;max-height:40vh;overflow:auto;z-index:99999;background:#0f172a;color:#e2e8f0;padding:12px;font:12px monospace;border:2px solid #14b8a6;border-radius:8px;';
      pre.textContent = JSON.stringify(probe, null, 2);
      document.body.appendChild(pre);
    }, idProbe);
    await shot(page, 'A-id-mismatch-projected-vs-store');

    console.log(JSON.stringify({ base: BASE, shots: log, idProbe }, null, 2));
  } finally {
    await browser.close();
  }
};

run().catch(e => {
  console.error(e);
  process.exit(1);
});
