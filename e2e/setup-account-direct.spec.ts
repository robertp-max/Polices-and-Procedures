import { test, expect, type ConsoleMessage } from '@playwright/test';

/**
 * Phase 7 — real responsive + accessibility automation for /setup-account-direct.
 * The screen renders its verify step without any API call, so these specs need
 * only the SPA (no backend / no DIRECT_SETUP_MODE).
 */
const VIEWPORTS = [
  { name: '320x568', width: 320, height: 568 },
  { name: '375x667', width: 375, height: 667 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
];

for (const vp of VIEWPORTS) {
  test(`renders cleanly with no horizontal overflow at ${vp.name}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m: ConsoleMessage) => { if (m.type() === 'error') errors.push(m.text()); });

    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/setup-account-direct');

    await expect(page.getByRole('heading', { name: 'Set Up Your Account' })).toBeVisible();

    // No horizontal overflow at any viewport.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, `horizontal overflow ${overflow}px`).toBeLessThanOrEqual(0);

    // Email present; activation code masked; submit reachable with a 44px target.
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Activation code')).toHaveAttribute('type', 'password');
    const submit = page.getByRole('button', { name: /verify eligibility/i });
    await expect(submit).toBeVisible();
    const box = await submit.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);

    // Non-admin notice is shown.
    await expect(page.getByText(/grant administrator access/i)).toBeVisible();

    expect(errors, `console errors:\n${errors.join('\n')}`).toHaveLength(0);
  });
}

test('keyboard: focus moves email → activation code, which stays masked', async ({ page }) => {
  await page.goto('/setup-account-direct');
  await page.getByLabel('Email').focus();
  await expect(page.getByLabel('Email')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Activation code')).toBeFocused();
  await expect(page.getByLabel('Activation code')).toHaveAttribute('type', 'password');
});

test('enlarged text (browser zoom) keeps the submit control reachable', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/setup-account-direct');
  // Simulate ~150% text zoom via root font-size; submit must remain visible/clickable.
  await page.evaluate(() => { document.documentElement.style.fontSize = '24px'; });
  const submit = page.getByRole('button', { name: /verify eligibility/i });
  await expect(submit).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
