import { expect, test } from '@playwright/test';

const routes = [
  '/calendar',
  '/ces/board',
  '/evidence',
  '/forms/QA-FM-020',
  '/artifacts/test-missing',
];

test.describe('V3 visual smoke', () => {
  for (const route of routes) {
    test(`${route} renders without page errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('console', message => {
        if (message.type() === 'error') errors.push(message.text());
      });

      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('body')).toBeVisible();
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }
});

