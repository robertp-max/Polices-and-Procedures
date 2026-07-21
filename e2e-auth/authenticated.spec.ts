import { test, expect, type Page } from '@playwright/test';

/**
 * Authenticated learner QA for the unified integration branch, using the
 * strict test-only auth harness (server/auth/e2eTestAuth.ts). Seeds the
 * sessionStorage session envelope the SPA restores on boot, so protected
 * learner routes are reachable without a live Cognito pool.
 */

const SESSION_KEY = 'ci.authSession.v1';
const seedEnvelope = (token: string) =>
  JSON.stringify({ accessToken: token, expiresAt: Date.now() + 86_400_000, issuedAt: Date.now() });

async function loginAs(page: Page, token: 'e2e-active-learner' | 'e2e-suspended-learner') {
  await page.addInitScript(
    ([key, env]) => window.sessionStorage.setItem(key as string, env as string),
    [SESSION_KEY, seedEnvelope(token)] as const,
  );
}

/** Collect client console errors + failed responses for a page. */
function trackFailures(page: Page) {
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('response', (r) => {
    const s = r.status();
    // Ignore expected non-learner failures: Calendar/Drive without creds, and
    // 401/403 from admin-only probes the learner is correctly denied.
    const url = r.url();
    const expected = /\/api\/(calendar|drive)/.test(url) || ([401, 403].includes(s) && /\/api\/(admin|audit|user-access)/.test(url));
    if (s >= 400 && !expected) failedRequests.push(`${s} ${url}`);
  });
  return { consoleErrors, failedRequests };
}

const onLogin = (page: Page) => /\/login/.test(new URL(page.url()).pathname);

/**
 * Deterministic settle: wait for full load, then until the SPA has rendered real
 * content OR the async /me bootstrap has redirected to /login. Avoids both
 * networkidle (fragile/crashes on this polling SPA) and premature assertions.
 */
async function settle(page: Page) {
  await page.waitForLoadState('load').catch(() => {});
  await page.waitForFunction(
    () => (document.body?.innerText?.trim().length ?? 0) > 30 || location.pathname.includes('/login'),
    undefined,
    { timeout: 20_000 },
  ).catch(() => {});
}

test.describe('active learner — protected surfaces', () => {
  test.beforeEach(async ({ page }) => { await loginAs(page, 'e2e-active-learner'); });

  test('reaches the Learning catalog (not redirected to /login)', async ({ page }) => {
    const t = trackFailures(page);
    await page.goto('/journey');
    await settle(page);
    expect(onLogin(page), 'should not be bounced to /login').toBe(false);
    expect((await page.locator('body').innerText()).length).toBeGreaterThan(50);
    expect(t.consoleErrors, `console errors: ${t.consoleErrors.join(' | ')}`).toHaveLength(0);
    expect(t.failedRequests, `failed requests: ${t.failedRequests.join(' | ')}`).toHaveLength(0);
  });

  for (const id of ['GAO-001', 'ACHC-ART-M01', 'RN-001', 'ADM-001', 'DON-001', 'DON-013', 'LVN-001', 'GB-001']) {
    test(`launches module ${id} without crash or auth bounce`, async ({ page }) => {
      const t = trackFailures(page);
      await page.goto(`/journey/module/${id}`);
      await settle(page);
      expect(onLogin(page), `${id} should be reachable`).toBe(false);
      // No React error boundary / blank crash — the shell rendered real content.
      const body = await page.locator('body').innerText();
      expect(body.toLowerCase()).not.toContain('something went wrong');
      expect(body.length, `${id} rendered content`).toBeGreaterThan(50);
      expect(t.consoleErrors, `${id} console: ${t.consoleErrors.join(' | ')}`).toHaveLength(0);
    });
  }

  test('DON-014 (catalog entry without a standalone player) is handled truthfully — no crash', async ({ page }) => {
    const t = trackFailures(page);
    await page.goto('/journey/module/DON-014');
    await settle(page);
    expect(onLogin(page)).toBe(false);
    const body = (await page.locator('body').innerText()).toLowerCase();
    expect(body).not.toContain('something went wrong');
    expect(body.length).toBeGreaterThan(50); // falls through to the default lesson/module shell, not a blank/crash
    expect(t.consoleErrors, t.consoleErrors.join(' | ')).toHaveLength(0);
  });

  test('reaches the policy/P&P lifecycle viewer', async ({ page }) => {
    await page.goto('/policy-lifecycle');
    await settle(page);
    expect(onLogin(page)).toBe(false);
  });

  test('reaches Brad (iAdministrator/compliance)', async ({ page }) => {
    const t = trackFailures(page);
    await page.goto('/compliance');
    await settle(page);
    expect(onLogin(page)).toBe(false);
    expect(t.consoleErrors, t.consoleErrors.join(' | ')).toHaveLength(0);
  });

  test('session persists across a reload (refresh/resume)', async ({ page }) => {
    await page.goto('/journey');
    await settle(page);
    expect(onLogin(page)).toBe(false);
    await page.reload();
    await settle(page);
    expect(onLogin(page), 'session should survive F5').toBe(false);
  });

  test('back/forward navigation keeps route identity', async ({ page }) => {
    await page.goto('/journey');
    await settle(page);
    await page.goto('/journey/module/RN-001');
    await settle(page);
    await page.goBack();
    await settle(page);
    expect(new URL(page.url()).pathname.replace(/\/$/, '')).toBe('/journey');
    await page.goForward();
    await settle(page);
    expect(new URL(page.url()).pathname).toContain('/journey/module/RN-001');
  });

  test('catalog has no horizontal overflow on mobile (375px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/journey');
    await settle(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'no horizontal overflow at 375px').toBeLessThanOrEqual(2);
  });

  test('catalog stays usable at ~200% zoom (narrow effective width)', async ({ page }) => {
    await page.setViewportSize({ width: 640, height: 480 });
    await page.goto('/journey');
    await settle(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'no horizontal overflow when zoomed/narrow').toBeLessThanOrEqual(2);
  });

  test('keyboard navigation moves focus into the page (not stuck on body)', async ({ page }) => {
    await page.goto('/journey');
    await settle(page);
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() => document.activeElement?.tagName ?? 'BODY');
    expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'], `focused: ${tag}`).toContain(tag);
  });
});

test.describe('suspended learner — denial', () => {
  test.beforeEach(async ({ page }) => { await loginAs(page, 'e2e-suspended-learner'); });

  test('is denied and bounced to /login (cannot reach the catalog)', async ({ page }) => {
    await page.goto('/journey');
    await settle(page);
    expect(onLogin(page), 'suspended user must not reach protected routes').toBe(true);
  });

  test('forged localStorage role cannot restore access', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('tampered-role', 'Administrator'));
    await page.goto('/journey');
    await settle(page);
    expect(onLogin(page), 'client-side role tampering must not authenticate').toBe(true);
  });
});
