/**
 * Browser check: /calendar must not emit React "duplicate key" warnings.
 * Requires a running app (e.g. `npm run dev:web` or `npm run build && npx vite preview --port 5199`).
 *
 *   BASE_URL=http://localhost:5174 node scripts/checkCalendarTaskKeys.mjs
 */
import { chromium } from 'playwright';
import path from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
/** Comma-separated paths, e.g. `/calendar,/calendar?view=sprint,/audit` */
const ROUTES = (process.env.ROUTES || '/calendar')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const root = process.cwd();
const shotsDir = path.resolve(root, 'Builder/_system/screenshots/browser-acceptance-delta');

const duplicateKeyPattern = /duplicate key|Encountered two children with the same key/i;

const run = async () => {
  mkdirSync(shotsDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const base = BASE_URL.replace(/\/$/, '');
  const routeResults = [];
  let totalDup = 0;
  const ts = Date.now();

  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push({ type: msg.type(), text: msg.text() });
    });
    page.on('pageerror', err => {
      consoleMessages.push({ type: 'pageerror', text: err.message });
    });

    const pathPart = route.startsWith('/') ? route : `/${route}`;
    await page.goto(`${base}${pathPart}`, { waitUntil: 'networkidle', timeout: 120_000 });
    await page.waitForTimeout(2500);
    /** Open Tasks tab on workflow panel if visible */
    const tasksTab = page.getByRole('button', { name: /tasks/i }).first();
    if (await tasksTab.isVisible().catch(() => false)) {
      await tasksTab.click().catch(() => {});
      await page.waitForTimeout(800);
    }

    const duplicateKeyMessages = consoleMessages.filter(
      m => duplicateKeyPattern.test(m.text),
    );
    totalDup += duplicateKeyMessages.length;

    const shot = path.join(shotsDir, `duplicate-key-check-${ts}-${safeRouteFile(pathPart)}.png`);
    await page.screenshot({ path: shot, fullPage: true }).catch(() => {});

    routeResults.push({
      route: pathPart,
      duplicateKeyCount: duplicateKeyMessages.length,
      duplicateKeySamples: duplicateKeyMessages.slice(0, 8).map(m => m.text),
      screenshot: shot,
    });
    await page.close();
  }

  await browser.close();

  const summary = {
    routes: ROUTES,
    baseUrl: BASE_URL,
    duplicateKeyCount: totalDup,
    byRoute: routeResults,
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(summary, null, 2));

  const outPath = path.resolve(root, 'Builder/_system/calendar_duplicate_key_check.json');
  writeFileSync(outPath, JSON.stringify(summary, null, 2));

  if (totalDup > 0) {
    // eslint-disable-next-line no-console
    console.error('FAIL: duplicate React key warnings on one or more routes');
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log('PASS: no duplicate key warnings on tested route(s)');
  process.exit(0);
};

function safeRouteFile(routePath) {
  return routePath.replace(/[^a-zA-Z0-9-_.]+/g, '-').slice(0, 100);
}

run().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
