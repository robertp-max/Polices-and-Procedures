import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const Q1_TITLE = 'Q1 2026 — Baseline Under Pressure';
const LAUNCH_TABLETOP = /2026 QAPI Boardroom Tabletop/;

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '820x1180', width: 820, height: 1180 },
  { name: '390x844', width: 390, height: 844 },
  { name: '320x700', width: 320, height: 700 },
];

async function openFreshQ1(page: Page): Promise<void> {
  await page.goto('/governance#oversight');
  await page.getByRole('button', { name: LAUNCH_TABLETOP }).click();
  await expect(page.getByRole('heading', { name: 'Tabletop Hub' })).toBeVisible();
  await page
    .getByRole('button', { name: `Start ${Q1_TITLE} as a solo attempt` })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Can the Board rely on this packet?' }),
  ).toBeVisible();
}

async function expectNoSeriousAxeViolations(page: Page, stage: string): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const blockers = results.violations
    .filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
    .map((violation) => ({
      id: violation.id,
      impact: violation.impact,
      targets: violation.nodes.map((node) => node.target),
    }));

  expect(blockers, `${stage} serious/critical axe violations`).toEqual([]);
}

async function answerAllEvidenceProblems(page: Page): Promise<void> {
  for (let index = 0; index < 4; index += 1) {
    await page.getByLabel('The records are reconciled.').check();
    await page.getByLabel('Record A', { exact: true }).check();
    await page
      .getByRole('textbox', { name: /^Why\?/ })
      .fill(`Record A reconciles evidence problem ${index + 1}.`);
    await page
      .getByRole('button', {
        name: index === 3 ? 'Save and continue' : 'Save and review next problem',
      })
      .click();
  }
}

async function chooseFullReliance(page: Page): Promise<void> {
  await page.getByLabel('Proceed on all matters — Full reliance').check();
  await page
    .getByLabel(/Board rationale/)
    .fill('The reconciled source record supports each matter allowed to proceed.');
  await page.getByRole('button', { name: 'Review Board record' }).click();
  await expect(page.getByRole('heading', { name: 'Review and Lock' })).toBeVisible();
}

for (const viewport of VIEWPORTS) {
  test(`Round 0 has no horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await openFreshQ1(page);

    const measurements = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(measurements.scrollWidth).toBeLessThanOrEqual(measurements.clientWidth);
    await expect(
      page.getByRole('button', { name: 'Review 4 evidence problems' }),
    ).toBeVisible();
  });
}

test('writes the nine exact-size Round 0 review captures', async ({ browser }) => {
  const artifactDirectory =
    'GOVERNANCE_V3_HARDENING/round0-review-artifacts';
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const desktopPage = await desktopContext.newPage();
  await openFreshQ1(desktopPage);
  await desktopPage.screenshot({
    path: `${artifactDirectory}/01-stage1-desktop-1440x900.png`,
  });
  await desktopPage
    .getByRole('button', { name: 'Review 4 evidence problems' })
    .click();
  await desktopPage.screenshot({
    path: `${artifactDirectory}/02-stage2-desktop-1440x900.png`,
  });
  await answerAllEvidenceProblems(desktopPage);
  await desktopPage.screenshot({
    path: `${artifactDirectory}/03-stage3-desktop-1440x900.png`,
  });
  await chooseFullReliance(desktopPage);
  await desktopPage.screenshot({
    path: `${artifactDirectory}/04-stage4-desktop-1440x900.png`,
  });
  await desktopPage.setViewportSize({ width: 320, height: 700 });
  await desktopPage.screenshot({
    path: `${artifactDirectory}/07-stage4-mobile-320x700.png`,
  });
  await desktopPage.setViewportSize({ width: 1024, height: 768 });
  await desktopPage
    .getByRole('button', { name: 'Return to Board decision' })
    .click();
  await desktopPage
    .getByLabel('Proceed only on unaffected matters — Partial reliance')
    .check();
  await desktopPage.getByLabel('Due date').fill('2026-02-30');
  const dateError = desktopPage.getByText(
    'Enter a real calendar date as YYYY-MM-DD.',
  );
  await expect(dateError).toBeVisible();
  await dateError.scrollIntoViewIfNeeded();
  await desktopPage.screenshot({
    path: `${artifactDirectory}/08-validation-error-1024x768.png`,
  });
  await desktopContext.close();

  const tabletContext = await browser.newContext({
    viewport: { width: 820, height: 1180 },
  });
  const tabletPage = await tabletContext.newPage();
  await openFreshQ1(tabletPage);
  await tabletPage.getByRole('button', { name: 'Review 4 evidence problems' }).click();
  await tabletPage.screenshot({
    path: `${artifactDirectory}/05-stage2-tablet-820x1180.png`,
  });
  await tabletContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const mobilePage = await mobileContext.newPage();
  await openFreshQ1(mobilePage);
  await mobilePage.screenshot({
    path: `${artifactDirectory}/06-stage1-mobile-390x844.png`,
  });
  await mobileContext.close();

  const resumeContext = await browser.newContext({
    viewport: { width: 1024, height: 768 },
  });
  const resumePage = await resumeContext.newPage();
  await openFreshQ1(resumePage);
  await resumePage
    .getByRole('button', { name: 'Review 4 evidence problems' })
    .click();
  await resumePage
    .getByLabel('The issue remains unresolved but affects only named matters.')
    .check();
  await resumePage.getByLabel('Record A', { exact: true }).check();
  await resumePage
    .getByRole('textbox', { name: /^Why\?/ })
    .fill('The first source supports only the named matter.');
  await resumePage
    .getByRole('button', { name: 'Save and review next problem' })
    .click();
  await resumePage.reload();
  await resumePage.getByRole('button', { name: LAUNCH_TABLETOP }).click();
  await resumePage
    .getByRole('button', { name: `Resume ${Q1_TITLE} solo draft` })
    .click();
  await expect(resumePage.getByText('Evidence Problem 2 of 4')).toBeVisible();
  await resumePage.screenshot({
    path: `${artifactDirectory}/09-resumed-draft-1024x768.png`,
  });
  await resumeContext.close();
});

test('all four stages pass axe and the lock dialog restores keyboard focus', async ({
  page,
}) => {
  await openFreshQ1(page);
  await expectNoSeriousAxeViolations(page, 'Stage 1');

  const firstAction = page.getByRole('button', {
    name: 'Review 4 evidence problems',
  });
  await firstAction.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Evidence Problem 1 of 4')).toBeVisible();
  await expectNoSeriousAxeViolations(page, 'Stage 2');

  await answerAllEvidenceProblems(page);

  await expect(
    page.getByLabel('Proceed on all matters — Full reliance'),
  ).toBeVisible();
  await expect(
    page.getByLabel('Proceed only on unaffected matters — Partial reliance'),
  ).toBeVisible();
  await expect(page.getByLabel('Do not use this packet — Hold')).toBeVisible();
  await expectNoSeriousAxeViolations(page, 'Stage 3');

  await chooseFullReliance(page);
  await expectNoSeriousAxeViolations(page, 'Stage 4');

  const lockButton = page.getByRole('button', {
    name: 'Lock Round 0 and continue',
  });
  await lockButton.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Lock the Board record?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(lockButton).toBeFocused();
});

test('a saved evidence answer resumes after refresh without losing content', async ({
  page,
}) => {
  await openFreshQ1(page);
  await page.getByRole('button', { name: 'Review 4 evidence problems' }).click();
  await page
    .getByLabel('The issue remains unresolved but affects only named matters.')
    .check();
  await page.getByLabel('Record A', { exact: true }).check();
  await page
    .getByRole('textbox', { name: /^Why\?/ })
    .fill('The first source supports only the named matter.');
  await page.getByRole('button', { name: 'Save and review next problem' }).click();
  await expect(page.getByText('Evidence Problem 2 of 4')).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: LAUNCH_TABLETOP }).click();
  await page
    .getByRole('button', { name: `Resume ${Q1_TITLE} solo draft` })
    .click();

  await expect(page.getByText('Evidence Problem 2 of 4')).toBeVisible();
  await page.getByRole('button', { name: 'Evidence problem 1, saved' }).click();
  await expect(page.getByRole('textbox', { name: /^Why\?/ })).toHaveValue(
    'The first source supports only the named matter.',
  );
});
