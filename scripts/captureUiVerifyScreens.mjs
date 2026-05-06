/**
 * One-off UI verification screenshots (Playwright).
 * Expects VITE_LOCAL_DEMO_AUTH_BYPASS=true dev server.
 * Usage: BASE_URL=http://localhost:5175 node scripts/captureUiVerifyScreens.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = process.env.BASE_URL?.replace(/\/$/, '') || 'http://localhost:5175';
const outDir = path.join(process.cwd(), 'tmp-ui-verify-screenshots');
fs.mkdirSync(outDir, { recursive: true });

const shots = [
  { name: '01-dashboard', url: '/dashboard', waitMs: 2000 },
  { name: '02-calendar', url: '/calendar', waitMs: 2500 },
  { name: '03-calendar-sprint', url: '/calendar?view=sprint', waitMs: 4000 },
  /** Gantt builds a large DOM; wait for pipeline chrome before screenshot. */
  { name: '04-calendar-gantt', url: '/calendar?view=gantt', waitMs: 2000, waitForText: 'Event Pipeline', viewportOnly: true },
  { name: '05-my-tasks', url: '/my-tasks', waitMs: 2000 },
  { name: '06-workflows', url: '/workflows', waitMs: 2500 },
  { name: '07-library', url: '/library', waitMs: 2500 },
  { name: '08-policy-detail', url: '/library/GV-GB-001', waitMs: 2500 },
  { name: '09-help', url: '/help', waitMs: 2000 },
  { name: '10-framework', url: '/framework', waitMs: 2000 },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

for (const shot of shots) {
  const { name, url, waitMs, waitForText, viewportOnly } = shot;
  const full = `${base}${url}`;
  process.stdout.write(`Capturing ${name} ${full} ...\n`);
  try {
    await page.goto(full, { waitUntil: 'networkidle', timeout: 60000 });
  } catch {
    await page.goto(full, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  if (waitForText) {
    await page.getByText(waitForText, { exact: false }).first().waitFor({ state: 'visible', timeout: 90000 });
  }
  await page.waitForTimeout(waitMs);
  const fp = path.join(outDir, `${name}.png`);
  await page.screenshot({
    path: fp,
    fullPage: !viewportOnly,
    timeout: viewportOnly ? 60_000 : 180_000,
  });
}

await browser.close();
process.stdout.write(`Done. Wrote ${shots.length} files to ${outDir}\n`);
