/**
 * UI Screenshot Agent 06 - Onboarding / Journey Category
 * Full page Playwright screenshots for active journey/onboarding NAV pages.
 * Dark mode (ci-ion-dark). Categorized output to Onboarding_Journey/
 *
 * Usage (dev server on 5173 with VITE_LOCAL_DEMO_AUTH_BYPASS=true):
 *   node scripts/captureOnboardingJourneyScreenshots.mjs
 *
 * Or with custom base:
 *   BASE_URL=http://localhost:5173 node scripts/captureOnboardingJourneyScreenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE = (process.env.BASE_URL || 'http://localhost:5173').replace(/\/$/, '');
const OUT_DIR = path.join(process.cwd(), 'Onboarding_Journey');
fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 1440, height: 900 };

/**
 * List of pages to capture.
 * Journey NAV: Overview (/journey), v1 (/journey/v1-journey), Appendix F, Supervisor, Admin, Guide.
 * Onboarding-v2 active subs per routes + NAV in CommandCenterLayout.
 * For batches detail, we dynamically resolve a seeded batch ID.
 */
const PAGES = [
  { slug: 'journey-overview', label: 'Journey Overview', url: '/journey' },
  { slug: 'journey-v1', label: 'Journey V1', url: '/journey/v1-journey' },
  { slug: 'journey-appendix-f', label: 'Journey Appendix F', url: '/journey/appendix-f' },
  { slug: 'journey-supervisor', label: 'Journey Supervisor', url: '/journey/supervisor' },
  { slug: 'journey-admin', label: 'Journey Admin', url: '/journey/admin' },
  { slug: 'journey-guide', label: 'Journey Guide', url: '/journey/guide' },

  { slug: 'onboarding-v2-dashboard', label: 'Onboarding v2 Dashboard', url: '/onboarding-v2/dashboard' },
  { slug: 'onboarding-v2-activate', label: 'Onboarding v2 Activate', url: '/onboarding-v2/activate' },
  { slug: 'onboarding-v2-batches', label: 'Onboarding v2 Batches', url: '/onboarding-v2/batches' },
  // batches/:batchId resolved dynamically below
  { slug: 'onboarding-v2-audit', label: 'Onboarding v2 Audit Readiness', url: '/onboarding-v2/audit' },
  { slug: 'onboarding-v2-governance', label: 'Onboarding v2 Governance', url: '/onboarding-v2/governance' },
];

async function forceDarkMode(page) {
  // Explicitly force the dark (ci-ion-dark) theme used by default in CI/demo.
  // Avoids any light bleed from prior localStorage or data-theme.
  await page.evaluate(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', 'ci-ion-dark');
    root.classList.remove('light', 'theme-light', 'care-indeed-light');
    root.classList.add('dark', 'theme-dark');
    try {
      // Match prototype + real storage keys seen in code
      localStorage.setItem('ci-prototype-theme', 'dark');
      localStorage.setItem('ci-theme', 'ci-ion-dark');
    } catch {}
  });
}

async function waitForStable(page, extraMs = 1200) {
  try {
    await page.waitForLoadState('networkidle', { timeout: 15000 });
  } catch {
    // Fallback is fine for demo content.
  }
  await page.waitForTimeout(extraMs);
}

async function capture(page, { slug, label, url }) {
  const fullUrl = `${BASE}${url}`;
  process.stdout.write(`\n[Agent06] Capturing ${label} → ${fullUrl} (dark)\n`);

  try {
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  } catch (e) {
    process.stdout.write(`  WARN goto: ${e.message}\n`);
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  }

  await forceDarkMode(page);
  await waitForStable(page, 1800);

  const fp = path.join(OUT_DIR, `${slug}__dark.png`);
  await page.screenshot({
    path: fp,
    fullPage: true,
    animations: 'disabled',
  });

  // Verify file
  const stat = fs.statSync(fp);
  process.stdout.write(`  ✓ Wrote ${slug}__dark.png (${Math.round(stat.size / 1024)} KB)\n`);
  return fp;
}

async function resolveFirstBatchId(page) {
  // Prefer DOM link or rendered batch id on /batches list (robust to store format).
  // Fallback to known seed pattern from engine (BATCH-00000001 etc.).
  try {
    const candidates = await page.$$eval('a[href*="/onboarding-v2/batches/"]', (els) =>
      els.map((a) => a.getAttribute('href')).filter(Boolean)
    );
    for (const href of candidates) {
      const m = href.match(/\/batches\/([^/?#]+)/);
      if (m && m[1]) return m[1];
    }
  } catch {}

  // Try to pull from zustand store snapshot if importable in page context (works in dev).
  try {
    const fromStore = await page.evaluate(async () => {
      try {
        // Dynamic import in browser context (Vite serves src)
        const mod = await import('/src/policy/onboarding-v2/store/onboardingV2Store.ts');
        const snap = mod.useOnboardingV2Store?.getState?.()?.snap;
        const b = snap?.batches?.[0];
        return b?.id || null;
      } catch {
        return null;
      }
    });
    if (fromStore) return fromStore;
  } catch {}

  // Deterministic fallback from seed engine (first 6 batches created in order)
  return 'BATCH-00000001';
}

async function main() {
  console.log('[Agent06] Starting full-page dark-mode captures for Journey + Onboarding-v2 NAV surfaces.');
  console.log(`  Base: ${BASE}`);
  console.log(`  Output: ${OUT_DIR}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();

  const results = [];

  // Capture static ones first
  for (const p of PAGES) {
    if (p.url.includes(':batchId')) continue; // handled below
    const saved = await capture(page, p);
    results.push({ ...p, path: saved });
  }

  // Dynamic: Onboarding v2 Batches detail page (pick a real seeded/active batch)
  const batchesListUrl = `${BASE}/onboarding-v2/batches`;
  process.stdout.write(`\n[Agent06] Resolving active batchId from ${batchesListUrl}...\n`);
  await page.goto(batchesListUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await forceDarkMode(page);
  await waitForStable(page, 2200);

  const batchId = await resolveFirstBatchId(page);
  process.stdout.write(`  → Using batchId: ${batchId}\n`);

  const batchDetail = {
    slug: 'onboarding-v2-batch-detail',
    label: `Onboarding v2 Batch Detail (${batchId})`,
    url: `/onboarding-v2/batches/${batchId}`,
  };
  const savedDetail = await capture(page, batchDetail);
  results.push({ ...batchDetail, path: savedDetail, resolvedBatchId: batchId });

  await browser.close();

  // Summary
  console.log('\n[Agent06] =============================================');
  console.log(`[Agent06] COMPLETED ${results.length} screenshots.`);
  console.log(`[Agent06] All saved to: ${OUT_DIR}`);
  console.log('[Agent06] Files:');
  for (const r of results) {
    const rel = path.relative(process.cwd(), r.path);
    console.log(`  - ${r.slug}__dark.png  (${r.label})`);
  }
  console.log('[Agent06] Dark mode enforced via data-theme="ci-ion-dark". Full page.');
  console.log('[Agent06] =============================================\n');

  // Also write a manifest for traceability (JSON)
  const manifestPath = path.join(OUT_DIR, '_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    agent: 'UI Screenshot Agent 06 - Onboarding / Journey Category',
    timestamp: new Date().toISOString(),
    baseUrl: BASE,
    mode: 'dark',
    viewport: VIEWPORT,
    count: results.length,
    files: results.map(r => ({
      slug: r.slug,
      label: r.label,
      url: r.url,
      file: path.basename(r.path),
      resolvedBatchId: r.resolvedBatchId,
    })),
  }, null, 2));
  console.log(`[Agent06] Manifest written: ${path.relative(process.cwd(), manifestPath)}`);
}

main().catch((err) => {
  console.error('[Agent06] FATAL:', err);
  process.exit(1);
});