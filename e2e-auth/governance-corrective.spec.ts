import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const SESSION_KEY = 'ci.authSession.v1';
const TOKEN = 'e2e-governance-chair';
const envelope = () => JSON.stringify({ accessToken: TOKEN, expiresAt: Date.now() + 86_400_000, issuedAt: Date.now() });

const office = {
  generatedAt: '2026-07-22T18:00:00.000Z',
  organizationId: 'e2e-governance',
  sourcePosture: 'live',
  authorityProfile: {
    id: 'authority-profile-e2e', sourceBylawVersion: '2026.1', effectiveAt: '2026-01-01T00:00:00.000Z',
    approvalStatus: 'approved', authorizedSeatIds: ['seat-chair', 'seat-secretary', 'seat-director'],
  },
  readinessBlockers: [],
  assignments: [{ type: 'academy', id: 'assignment-gb-001', title: 'Authority & Fiduciary Duty', dueAt: '2026-08-15T17:00:00.000Z', status: 'assigned' }],
  meetings: [{
    id: 'meeting-qapi-q3', version: 7, title: 'Q3 Governing Body Meeting', meetingType: 'regular',
    scheduledStart: '2026-10-15T17:00:00.000Z', timezone: 'America/Los_Angeles', status: 'board_book_locked',
    noticeVersion: 2, agendaId: 'agenda-q3-v2', boardBookId: 'book-q3-v2', minutesId: null,
  }],
  boardBooks: [{ id: 'book-q3-v2', meetingId: 'meeting-qapi-q3', status: 'locked', sectionIds: ['section-qapi'], manifestId: 'manifest-q3-v2', lockedAt: '2026-10-10T17:00:00.000Z' }],
  decisions: [{ id: 'decision-qapi-pip', title: 'QAPI PIP authorization', question: 'Authorize the source-certified improvement project?', status: 'deliberation', origin: 'meeting', sourceMetadataIds: ['source-qapi-live'], conditions: [] }],
  actions: [{ id: 'action-qapi-owner', title: 'Implement approved QAPI PIP', ownerId: 'person-qapi-owner', status: 'in_progress', dueAt: '2026-11-15T17:00:00.000Z', evidenceArtifactIds: [], effectivenessDisposition: null }],
  academyAssignments: [{ id: 'assignment-gb-001', memberId: 'member-chair', moduleId: 'GB-001', contentVersion: '2026.07.2', dueAt: '2026-08-15T17:00:00.000Z', status: 'assigned' }],
} as const;

const catalog = Array.from({ length: 13 }, (_, index) => ({
  id: index === 12 ? 'GB-CAPSTONE' : `GB-${String(index + 1).padStart(3, '0')}`,
  sequence: index + 1,
  title: index === 12 ? 'Governance Under Pressure' : `Governing Body Case ${index + 1}`,
  shortTitle: index === 12 ? 'Capstone' : `Case ${index + 1}`,
  domain: index === 0 ? 'Authority and fiduciary duty' : 'Executive governance',
  durationMinutes: 35,
  contentVersion: '2026.07.2',
  sceneCount: 5,
  executableTaskCount: index === 2 ? 9 : 0,
}));

const module = {
  ...catalog[0],
  policyVersionIds: ['GV-GB-001@controlled-2026.07'],
  requiredStageIds: ['briefing', 'doctrine', 'case', 'decision', 'assessment'],
  minimumActiveSeconds: 900,
  sceneBriefs: [
    { id: 'briefing', title: 'The authority record', body: 'Establish the controlled basis of Governing Body authority.' },
    { id: 'doctrine', title: 'Fiduciary doctrine', body: 'Separate oversight authority from technical access.' },
    { id: 'case', title: 'The appointment defect', body: 'A technical administrator requests a Board vote without an active appointment.' },
    { id: 'decision', title: 'Apply the authority gate', body: 'Deny the vote and preserve the record.' },
    { id: 'assessment', title: 'Decision-grade assessment', body: 'Demonstrate the governing standard.' },
  ],
  questions: [{ id: 'q-gb001', stageId: 'assessment', prompt: 'What establishes voting authority?', answers: [
    { id: 'a', text: 'An active appointment, term, controlled bylaws, and applicable restrictions.' },
    { id: 'b', text: 'A technical super-administrator role.' },
  ] }],
  executableTaskIds: [],
};

async function authenticate(page: Page) {
  await page.addInitScript(([key, value]) => sessionStorage.setItem(key, value), [SESSION_KEY, envelope()] as const);
}

async function mockGovernanceReads(page: Page) {
  await page.route('**/api/governance/office', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 2, correlationId: 'e2e-office', data: office }),
  }));
  await page.route('**/api/governance/academy/catalog', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 2, correlationId: 'e2e-catalog', data: catalog }),
  }));
  await page.route('**/api/governance/academy/modules/GB-001', (route) => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify({ schemaVersion: 2, correlationId: 'e2e-module', data: module }),
  }));
}

async function settle(page: Page) {
  await page.waitForLoadState('load');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20_000 });
}

test.describe('authenticated Governing Body corrective UI', () => {
  test.beforeEach(async ({ page }) => {
    await authenticate(page);
    await mockGovernanceReads(page);
  });

  test('uses the strict governance actor and renders only the private office', async ({ page }) => {
    const health = await page.request.get('/api/governance/health', { headers: { Authorization: `Bearer ${TOKEN}` } });
    expect(health.status()).toBe(200);
    await page.goto('/governance');
    await settle(page);
    await expect(page.getByRole('heading', { name: 'Govern with evidence, not inference.' })).toBeVisible();
    await expect(page.getByText('Governing Body', { exact: true })).toBeVisible();
    await expect(page.getByText(/Maya|Licensed Vocational Nurse|GAO-001/)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('has no serious or critical axe violations on the executive brief', async ({ page }) => {
    await page.goto('/governance');
    await settle(page);
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  });

  for (const width of [320, 375, 768, 1024, 1440]) {
    test(`remains usable without horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 812 : 900 });
      await page.goto('/governance');
      await settle(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(2);
    });
  }

  test('remains usable at 200% zoom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/governance');
    await settle(page);
    await page.evaluate(() => { document.documentElement.style.zoom = '2'; });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('exposes named landmarks and controls for a screen-reader smoke check', async ({ page }) => {
    await page.goto('/governance');
    await settle(page);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('complementary', { name: 'Governing Body Office' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Search records' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('preserves readable controls in forced-colors mode', async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/governance');
    await settle(page);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).not.toHaveCount(0);
  });

  test('honors reduced-motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/governance');
    await settle(page);
    const duration = await page.locator('.gb-office-nav').evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(duration).toMatch(/0\.00001s|0s/);
  });

  test('supports keyboard command search and Escape dismissal', async ({ page }) => {
    await page.goto('/governance');
    await settle(page);
    await page.keyboard.press('Control+k');
    await expect(page.getByRole('dialog', { name: 'Search authorized records' })).toBeVisible();
    await expect(page.getByPlaceholder('Decision, meeting, action, source…')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('renders all thirteen Institute cases and removes office chrome inside a module', async ({ page }) => {
    await page.goto('/governance/academy');
    await settle(page);
    await expect(page.locator('.gb-academy-card')).toHaveCount(13);
    await page.goto('/governance/academy/modules/GB-001');
    await settle(page);
    await expect(page.locator('.gb-player')).toBeVisible();
    await expect(page.locator('.gb-office-nav')).toHaveCount(0);
    await expect(page.getByText('Private Office', { exact: true })).toHaveCount(0);
    await expect(page.locator('.gb-player-rail li')).toHaveCount(5);
  });

  test('preserves authenticated governance identity across refresh and Back/Forward', async ({ page }) => {
    await page.goto('/governance');
    await settle(page);
    await page.getByRole('button', { name: /Meetings/ }).click();
    await expect(page).toHaveURL(/\/governance\/meetings$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/governance$/);
    await page.goForward();
    await expect(page).toHaveURL(/\/governance\/meetings$/);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Meetings' })).toBeVisible();
  });

  test('denies a standard learner at the governance API boundary', async ({ page }) => {
    const response = await page.request.get('/api/governance/health', {
      headers: { Authorization: 'Bearer e2e-active-learner' },
    });
    expect(response.status()).toBe(403);
  });
});
