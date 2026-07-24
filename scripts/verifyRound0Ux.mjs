import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const baseUrl = process.env.ROUND0_BASE_URL ?? 'http://127.0.0.1:5178';
const artifactDir = process.env.ROUND0_ARTIFACT_DIR ?? path.resolve('test-results/round0-ux');
const executablePath = process.env.ROUND0_CHROME_PATH;
const launchOptions = executablePath ? { executablePath } : {};

await fs.mkdir(artifactDir, { recursive: true });

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function launchRound0(browser, viewport, clearDraft = true) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  await context.addInitScript(({ shouldClear }) => {
    localStorage.setItem('gb-portal-version', 'v3');
    if (shouldClear) {
      Object.keys(localStorage)
        .filter((key) => key.startsWith('care-indeed:gb:compliance:draft:gb:tabletop2026:'))
        .forEach((key) => localStorage.removeItem(key));
    }
  }, { shouldClear: clearDraft });

  const page = await context.newPage();
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto(`${baseUrl}/governance`, { waitUntil: 'networkidle' });
  const openNavigation = page.getByRole('button', { name: 'Open navigation' });
  if (await openNavigation.isVisible()) {
    await openNavigation.click();
  }
  await page.getByRole('button', { name: 'Oversight', exact: true }).click();
  await page.getByRole('button', { name: /Launch simulation/ }).click();
  await page.locator('.bs-hub-shell').waitFor();
  await page.locator('.bs-pack-card').first().getByRole('button').first().click();
  await page.locator('.bs-readiness').waitFor({ timeout: 30_000 });
  return { context, page, errors };
}

async function inspectSession(page) {
  return page.evaluate(() => {
    const session = document.querySelector('.bs-session');
    const versionSwitch = document.querySelector('.gb-portal-version-fab');
    const panels = Array.from(
      document.querySelectorAll('.bs-readiness-task, .bs-readiness-review, .bs-readiness-decision'),
    );
    const rect = session?.getBoundingClientRect();
    const beforeScroll = window.scrollY;
    window.scrollTo(0, 500);
    const afterScroll = window.scrollY;
    return {
      viewport: { width: window.innerWidth, height: window.innerHeight },
      sessionRect: rect
        ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
        : null,
      htmlOverflow: document.documentElement.style.overflow,
      bodyOverflow: document.body.style.overflow,
      bodyPosition: document.body.style.position,
      bodyLockedClass: document.body.classList.contains('gb-tabletop-viewport-lock'),
      versionSwitchDisplay: versionSwitch ? getComputedStyle(versionSwitch).display : 'missing',
      documentScrollBefore: beforeScroll,
      documentScrollAfter: afterScroll,
      documentHasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
      panels: panels.map((panel) => {
        const style = getComputedStyle(panel);
        return {
          className: panel.className,
          overflowY: style.overflowY,
          clientHeight: panel.clientHeight,
          scrollHeight: panel.scrollHeight,
        };
      }),
    };
  });
}

async function getSeriousA11yViolations(page) {
  const analysis = await new AxeBuilder({ page })
    .include('.bs-session')
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  return analysis.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  );
}

const browser = await chromium.launch({ headless: true, ...launchOptions });
const results = {};

try {
  const desktop = await launchRound0(browser, { width: 1440, height: 900 });
  const desktopPage = desktop.page;
  const bodyText = await desktopPage.locator('body').innerText();
  const dispositionRadios = desktopPage.locator(
    '.bs-disposition-cards [role="radio"][aria-checked="true"]',
  );
  const blockers = await desktopPage.locator('.bs-blocker-list li').allTextContents();
  const session = await inspectSession(desktopPage);
  const desktopA11y = await getSeriousA11yViolations(desktopPage);

  assert(
    desktopA11y.length === 0,
    `Desktop WCAG violations: ${desktopA11y.flatMap((violation) => violation.nodes.map((node) => `${node.target.join(' ')}: ${node.failureSummary}`)).join(' | ')}`,
  );
  assert(!bodyText.includes('System-suggested posture'), 'Answer-leakage text is visible.');
  assert(await dispositionRadios.count() === 0, 'A disposition is preselected.');
  assert(
    bodyText.includes('Lock disposition & continue to Round 1'),
    'The required lock CTA is missing.',
  );
  assert(blockers.length >= 6, 'The initial blocker list is incomplete.');
  assert(session.bodyLockedClass, 'The body-lock class is missing.');
  assert(session.htmlOverflow === 'hidden', 'HTML scrolling is not locked.');
  assert(session.bodyOverflow === 'hidden', 'Body scrolling is not locked.');
  assert(session.bodyPosition === 'fixed', 'Body position is not fixed during the session.');
  assert(session.documentScrollAfter === session.documentScrollBefore, 'The document scrolled.');
  assert(session.versionSwitchDisplay === 'none', 'The V1/V2/V3 switch remains visible.');
  assert(!session.documentHasHorizontalOverflow, 'Desktop has horizontal viewport overflow.');
  assert(session.sessionRect?.width === 1440, 'The session does not fill desktop width.');
  assert(session.sessionRect?.height === 900, 'The session does not fill desktop height.');
  assert(
    session.panels.every((panel) => ['auto', 'scroll'].includes(panel.overflowY)),
    'A designated workspace panel is not independently scrollable.',
  );
  assert(
    session.panels.some((panel) => panel.scrollHeight > panel.clientHeight),
    'No internal panel has a usable scroll range.',
  );
  assert(desktop.errors.length === 0, `Desktop console errors: ${desktop.errors.join(' | ')}`);

  const firstEvidenceLink = desktopPage.locator('.bs-readiness-evidence-links button').first();
  const evidenceLinkText = await firstEvidenceLink.innerText();
  assert(/EX-Q1-\d+/.test(evidenceLinkText), 'Evidence link does not show the exhibit ID.');
  assert(evidenceLinkText.split('\n').length >= 2, 'Evidence link does not include a title.');

  await desktopPage.locator('.bs-conflict-list .bs-compare-action').first().click();
  await desktopPage.locator('.bs-conflict-comparator').waitFor();
  assert(
    await desktopPage.locator('.bs-conflict-classification [role="radio"]').count() === 4,
    'The comparator does not expose all four conflict classifications.',
  );

  await desktopPage.locator('.bs-readiness-acknowledge input').first().check();
  await desktopPage.waitForTimeout(100);
  await desktopPage.getByRole('button', { name: 'Back to Tabletop Hub' }).click();
  await desktopPage.getByRole('heading', { name: 'Tabletop Hub', exact: true }).first().waitFor();
  const restored = await desktopPage.evaluate(() => ({
    bodyLockedClass: document.body.classList.contains('gb-tabletop-viewport-lock'),
    bodyPosition: document.body.style.position,
    bodyOverflow: document.body.style.overflow,
  }));
  assert(!restored.bodyLockedClass, 'Body-lock class was not removed on exit.');
  assert(restored.bodyPosition === '', 'Body position was not restored on exit.');
  assert(restored.bodyOverflow === '', 'Body overflow was not restored on exit.');

  await desktopPage.locator('.bs-pack-card').first().getByRole('button').first().click();
  await desktopPage.locator('.bs-readiness').waitFor();
  assert(
    await desktopPage.locator('.bs-readiness-acknowledge input').first().isChecked(),
    'The autosaved criterion acknowledgment did not survive exit and resume.',
  );
  await desktopPage.screenshot({
    path: path.join(artifactDir, 'round0-desktop-1440x900.png'),
    fullPage: false,
  });

  results.desktop = {
    status: 'passed',
    blockers,
    seriousA11yViolations: desktopA11y.map((violation) => violation.id),
    evidenceLinkText,
    session,
    bodyRestoration: restored,
  };
  await desktop.context.close();

  const mobile = await launchRound0(browser, { width: 390, height: 844 });
  const mobilePage = mobile.page;
  const mobileSession = await inspectSession(mobilePage);
  const mobileA11y = await getSeriousA11yViolations(mobilePage);
  const visibleTabs = await mobilePage.locator('.bs-session-tabs [role="tab"]:visible').allTextContents();
  const visiblePanels = await mobilePage.locator(
    '.bs-readiness-workspace > [role="tabpanel"]:visible',
  ).count();

  assert(
    mobileA11y.length === 0,
    `Mobile WCAG violations: ${mobileA11y.flatMap((violation) => violation.nodes.map((node) => `${node.target.join(' ')}: ${node.failureSummary}`)).join(' | ')}`,
  );

  assert(
    JSON.stringify(visibleTabs) === JSON.stringify(['Task', 'Evidence', 'Decision']),
    'Mobile persistent tabs are missing or out of order.',
  );
  assert(visiblePanels === 1, 'Mobile must show exactly one active panel.');
  assert(!mobileSession.documentHasHorizontalOverflow, 'Mobile has horizontal viewport overflow.');
  assert(mobileSession.sessionRect?.width === 390, 'The session does not fill mobile width.');
  assert(mobileSession.sessionRect?.height === 844, 'The session does not fill mobile height.');
  assert(mobile.errors.length === 0, `Mobile console errors: ${mobile.errors.join(' | ')}`);

  await mobilePage.getByRole('tab', { name: 'Evidence' }).click();
  assert(
    await mobilePage.locator('#bs-readiness-panel-evidence').isVisible(),
    'Evidence tab did not reveal the evidence panel.',
  );
  await mobilePage.getByRole('tab', { name: 'Decision' }).click();
  assert(
    await mobilePage.locator('#bs-readiness-panel-decision').isVisible(),
    'Decision tab did not reveal the decision panel.',
  );
  await mobilePage.screenshot({
    path: path.join(artifactDir, 'round0-mobile-390x844.png'),
    fullPage: false,
  });

  results.mobile = {
    status: 'passed',
    seriousA11yViolations: mobileA11y.map((violation) => violation.id),
    visibleTabs,
    visiblePanels,
    session: mobileSession,
  };
  await mobile.context.close();
} finally {
  await browser.close();
}

await fs.writeFile(
  path.join(artifactDir, 'results.json'),
  JSON.stringify(results, null, 2),
  'utf8',
);

console.log(JSON.stringify(results, null, 2));
