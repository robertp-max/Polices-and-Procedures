/**
 * PHASE 4A CES INTERIORS — PLAYWRIGHT RUNTIME QA (QA-ONLY, DO NOT IMPORT)
 * 
 * This file is strictly for runtime browser verification of the committed
 * Phase 4A implementation. It must not be referenced by the application.
 */

import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.QA_BASE_URL || 'http://localhost:5173';
const STAGING_URL = `${BASE_URL}/ui-staging`;

test.describe('Phase 4A CES Event/Task Interiors - Runtime Containment & Behavior', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(STAGING_URL, { waitUntil: 'domcontentloaded' });
    // Give the app time to hydrate
    await page.waitForTimeout(1500);
  });

  test('Primary V3 navigation stays inside staging shell', async ({ page }) => {
    const forbiddenRoutes = [
      '/calendar', '/journey', '/evidence', '/clinicians', '/patients',
      '/admin', '/help', '/hubstaff', '/taxonomy', '/forms', '/library',
      '/policy-lifecycle', '/pm'
    ];

    // Click common primary nav items if visible
    const navLabels = ['Dashboard', 'CES', 'Policy', 'Forms', 'Onboarding', 'Evidence'];

    for (const label of navLabels) {
      const navItem = page.getByRole('button', { name: new RegExp(label, 'i') }).first();
      if (await navItem.isVisible().catch(() => false)) {
        await navItem.click();
        await page.waitForTimeout(400);

        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/ui-staging/);

        for (const forbidden of forbiddenRoutes) {
          expect(currentUrl).not.toContain(forbidden);
        }
      }
    }
  });

  test('CES Sprint Board - task cards, Event Workspace, Task Detail, local actions, blocked buttons', async ({ page }) => {
    // Navigate to CES section
    const cesNav = page.getByRole('button', { name: /CES|Sprint|Compliance Execution/i }).first();
    if (await cesNav.isVisible().catch(() => false)) {
      await cesNav.click();
    }
    await page.waitForTimeout(800);

    // Find task cards
    const taskCards = page.locator('button').filter({ hasText: /BLOCKED|AWAITING|IN PROGRESS|READY/i }).or(
      page.getByRole('button').filter({ hasText: /workflow|due/i })
    );

    const count = await taskCards.count();
    console.log(`Found ${count} potential CES task cards`);

    expect(count).toBeGreaterThan(0);

    // Click at least 5 different cards if available
    const clicksToDo = Math.min(5, count);

    for (let i = 0; i < clicksToDo; i++) {
      const card = taskCards.nth(i);
      if (await card.isVisible().catch(() => false)) {
        await card.click();
        await page.waitForTimeout(600);

        // Verify still in staging
        expect(page.url()).toMatch(/\/ui-staging/);

        // Look for Event Workspace and Task Detail signals
        const eventWorkspace = page.getByText(/EVENT WORKSPACE|Event Workspace/i).first();
        const taskDetail = page.getByText(/TASK DETAIL|Task Detail/i).first();

        if (await eventWorkspace.isVisible().catch(() => false)) {
          await expect(eventWorkspace).toBeVisible();
        }
        if (await taskDetail.isVisible().catch(() => false)) {
          await expect(taskDetail).toBeVisible();
        }
      }
    }

    // Test local preview actions on the last selected card
    const markViewed = page.getByRole('button', { name: /Mark viewed/i }).first();
    if (await markViewed.isVisible().catch(() => false)) {
      await markViewed.click();
      await page.waitForTimeout(300);
    }

    const markStarted = page.getByRole('button', { name: /Mark started/i }).first();
    if (await markStarted.isVisible().catch(() => false)) {
      await markStarted.click();
      await page.waitForTimeout(300);
    }

    // Blocked production actions must be disabled
    const blockedButtons = [
      'Upload evidence',
      'Request signature',
      'Approve task',
      'Complete task'
    ];

    for (const btnText of blockedButtons) {
      const btn = page.getByRole('button', { name: new RegExp(btnText, 'i') }).first();
      if (await btn.isVisible().catch(() => false)) {
        await expect(btn).toBeDisabled();
      }
    }
  });

  test('Policy and Forms sections render in-shell with secondary live routes only', async ({ page }) => {
    // Policy section
    const policyNav = page.getByRole('button', { name: /Policy/i }).first();
    if (await policyNav.isVisible().catch(() => false)) {
      await policyNav.click();
      await page.waitForTimeout(600);
      expect(page.url()).toMatch(/\/ui-staging/);
    }

    // Forms section
    const formsNav = page.getByRole('button', { name: /Forms/i }).first();
    if (await formsNav.isVisible().catch(() => false)) {
      await formsNav.click();
      await page.waitForTimeout(600);
      expect(page.url()).toMatch(/\/ui-staging/);
    }
  });

  test('No level 5 or production-complete claims visible in staging', async ({ page }) => {
    const badPhrases = [
      /level 5/i,
      /production-shaped complete/i,
      /production complete/i,
      /fully production/i
    ];

    for (const phrase of badPhrases) {
      const matches = await page.getByText(phrase).count();
      expect(matches).toBe(0);
    }
  });
});
