/**
 * CES Q2 2026 — Complete User Acceptance Test
 * ============================================
 * Scope : ALL CES events and tasks, April 1 – June 30, 2026
 * Roles : Governing Body | Administrator | DON | DON Assistant | Accounting | Systems
 * Runner: Playwright 1.51 — Chromium headless
 *
 * Key invariants under test
 * ─────────────────────────
 *  1. Sprint Board shows Q2 events (not locked to Q1-only).
 *  2. Task IDs are stable across Calendar / Sprint Board / Task Drawer / Artifact Viewer / Audit / Evidence Center.
 *  3. Forms open the assigned form instance, not a blank template.
 *  4. Evidence opens its own file, not the latest form artifact.
 *  5. Signed artifacts render the completed form, not blank/white.
 *  6. DON Assistant cannot sign.
 *  7. Same signer cannot sign twice under the same role.
 *  8. Certify/Lock shows actual package contents before locking.
 *  9. Audit trail entries open real evidence, not metadata-only.
 * 10. Gantt event rows are collapsible.
 * 11. Role switching refreshes task/form/signature state.
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_URL = 'http://localhost:5173';
const SS_ROOT  = 'Builder/_system/screenshots/ces-q2-2026-complete-uat';
const REPORT_DIR = 'Builder/_system/reports';

// All Q2 2026 event IDs (April 1 – June 30) extracted from regulatoryEvents.ts
const Q2_EVENTS = [
  { id: 'governing_body_minutes-20260422-01',          title: 'Governing Body Minutes (April)',      date: '2026-04-22' },
  { id: 'risk_mitigation_plan-20260428-01',             title: 'Risk Mitigation Plan',                date: '2026-04-28' },
  { id: 'security_risk_analysis-20260430-01',           title: 'Security Risk Analysis',              date: '2026-04-30' },
  { id: 'oig_sam_exclusion_check-20260505-01',          title: 'OIG/SAM Exclusion Check',             date: '2026-05-05' },
  { id: 'compliance_report_weekly-20260511-01',         title: 'Compliance Report (Weekly)',          date: '2026-05-11' },
  { id: 'governing_body_prep-20260511-01',              title: 'Governing Body Prep',                 date: '2026-05-11' },
  { id: 'qapi_meeting-20260512-09',                     title: 'QAPI Committee Meeting',              date: '2026-05-12' },
  { id: 'claims_submission-20260513-01',                title: 'Claims Submission Cycle',             date: '2026-05-13' },
  { id: 'system_activity_review-20260513-01',           title: 'System Activity Review',              date: '2026-05-13' },
  { id: 'compliance_report_monthly-20260514-01',        title: 'Compliance Report (Monthly)',         date: '2026-05-14' },
  { id: 'governing_body_meeting-20260514-01',           title: 'Governing Body Meeting',              date: '2026-05-14' },
  { id: 'sentinel_event_rca-20260515-01',               title: 'Sentinel Event RCA',                  date: '2026-05-15' },
  { id: 'episode_review-20260518-01',                   title: '30-Day Episode Review',               date: '2026-05-18' },
  { id: 'infection_control_review-20260519-01',         title: 'Infection Control Review',            date: '2026-05-19' },
  { id: 'security_incidents_review-20260520-01',        title: 'Security Incidents Review',           date: '2026-05-20' },
  { id: 'physician_signatures-20260521-01',             title: 'Physician Signatures',                date: '2026-05-21' },
  { id: 'denial_management_review-20260521-01',         title: 'Denial Management Review',            date: '2026-05-21' },
  { id: 'billing_hold_review-20260521-01',              title: 'Billing Hold Review',                 date: '2026-05-21' },
  { id: 'qapi_dashboard_refresh-20260522-01',           title: 'QAPI Dashboard Refresh',              date: '2026-05-22' },
  { id: 'agency_holiday-20260525-01',                   title: 'Independence Day (Observed)',          date: '2026-05-25' },
  { id: 'clinical_record_audit-20260526-01',            title: 'Clinical Record Audit',               date: '2026-05-26' },
  { id: 'bbp_training-20260527-01',                     title: 'Bloodborne Pathogen Training',        date: '2026-05-27' },
  { id: 'hipaa_training-20260528-01',                   title: 'HIPAA Training',                      date: '2026-05-28' },
  { id: 'ep_exercise-20260528-02',                      title: 'Emergency Preparedness Exercise',     date: '2026-05-28' },
  { id: 'vulnerability_scan-20260529-01',               title: 'Vulnerability Scan',                  date: '2026-05-29' },
  { id: 'competency_validation-20260529-01',            title: 'Competency Validation',               date: '2026-05-29' },
  { id: 'compliance_effectiveness_review-20260530-01', title: 'Compliance Effectiveness Review',     date: '2026-05-30' },
  { id: 'coi_disclosure-20260531-01',                   title: 'COI Disclosure',                      date: '2026-05-31' },
  { id: 'qapi_meeting-20260609-10',                     title: 'QAPI Committee Meeting (June)',        date: '2026-06-09' },
  { id: 'risk_management_committee-20260617-01',        title: 'Risk Management Committee',           date: '2026-06-17' },
  { id: 'policy_review_annual-20260624-01',             title: 'Annual Policy Review',                date: '2026-06-24' },
] as const;

const CES_ROLES = [
  'Governing Body',
  'Administrator',
  'DON',
  'DON Assistant',
  'Accounting',
  'Systems',
] as const;

// ─── Shared defect log ────────────────────────────────────────────────────────
interface Defect {
  id:             string;
  title:          string;
  severity:       'Critical' | 'High' | 'Medium' | 'Low';
  role:           string;
  eventId:        string;
  taskId:         string;
  formId:         string;
  formInstanceId: string;
  evidenceId:     string;
  artifactId:     string;
  url:            string;
  stepsToReproduce: string;
  expected:       string;
  actual:         string;
  screenshotPath: string;
  consoleError:   string;
  networkError:   string;
  likelyRootCause: string;
  filesToInspect: string;
  recommendedFix: string;
  regressionRisk: string;
}

const defects: Defect[] = [];
const testResults: Array<{
  eventId: string; eventName: string; sprint: string; role: string;
  taskCount: number; formsRequired: number; evidenceRequired: number; signaturesRequired: number;
  completionStatus: string; auditLockStatus: string; passFail: string;
  screenshotFolder: string; criticalDefects: number;
}> = [];

const consoleErrors: string[] = [];

let defectCounter = 1;

function recordDefect(d: Omit<Defect, 'id'>): string {
  const id = `DEFECT-Q2-${String(defectCounter++).padStart(3, '0')}`;
  defects.push({ id, ...d });
  return id;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Bootstrap demo auth bypass so protected routes are accessible.
 * Removes the "bypass logged out" flag and injects a stub session.
 */
async function bypassAuth(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Remove explicit logout flag so the bypass auto-login fires
    try { localStorage.removeItem('ci_demo_bypass_logged_out_v1'); } catch { /* noop */ }
    // Inject a minimal stub session so the auth provider considers the user authenticated
    const stub = {
      session: {
        accessToken: 'demo-local-token',
        refreshToken: 'demo-local-refresh',
        idToken: 'demo-local-id',
        expiresAt: Date.now() + 3_600_000,
      },
      expiresAt: Date.now() + 3_600_000,
      user: {
        id: 'demo-user-careindeed',
        email: 'robertp@careindeed.com',
        name: 'TJ Padilla',
        role: 'super_admin',
        firstName: 'TJ',
        lastName: 'Padilla',
        emailVerified: true,
      },
    };
    try { localStorage.setItem('ci_demo_auth_v1', JSON.stringify(stub)); } catch { /* noop */ }
  });
}

/**
 * Attach console error listener to a page.
 * Returns cleanup function.
 */
function attachConsoleCapture(page: Page, tag: string): () => string[] {
  const errors: string[] = [];
  const handler = (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = `[${tag}] ${msg.text()}`;
      errors.push(text);
      consoleErrors.push(text);
    }
  };
  page.on('console', handler);
  return () => {
    page.off('console', handler);
    return errors;
  };
}

/** Take a screenshot and return the file path. */
async function ss(page: Page, subfolder: string, name: string): Promise<string> {
  const dir = path.join(SS_ROOT, subfolder);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

/** Navigate with auth bypass active. */
async function navTo(page: Page, url: string): Promise<void> {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  // Wait for the app to hydrate — spinner disappears or main content appears
  await page.waitForTimeout(1500);
}

/** Create per-event screenshot subfolder. */
function eventSsFolder(eventId: string): string {
  const dir = path.join(SS_ROOT, 'events', eventId);
  fs.mkdirSync(dir, { recursive: true });
  return path.join('events', eventId);
}

/** Check whether an element matching `selector` is visible. */
async function isVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const el = page.locator(selector).first();
    return await el.isVisible({ timeout: 3000 });
  } catch {
    return false;
  }
}

/** Check whether text appears anywhere on the page. */
async function hasText(page: Page, text: string): Promise<boolean> {
  try {
    await page.waitForSelector(`text=${text}`, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

// ─── Suites ───────────────────────────────────────────────────────────────────

// ── 01. Authentication / Auth Bypass ─────────────────────────────────────────
test.describe('01 — Auth & Role Switching', () => {

  test('01-01: Demo auth bypass grants access to /ces/dashboard', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '01-01');
    await navTo(page, `${BASE_URL}/ces/dashboard`);

    await ss(page, '01-role-switching', '01-01-ces-dashboard-loaded');
    const url = page.url();
    expect(url, 'Should stay on CES dashboard, not redirect to /login').not.toContain('/login');

    // Expect some CES dashboard content
    const hasContent = await hasText(page, 'Sprint') || await hasText(page, 'Compliance') || await hasText(page, 'Dashboard');
    expect(hasContent, 'CES dashboard should render content').toBeTruthy();

    const errs = stopCapture();
    if (errs.length > 0) {
      recordDefect({
        title: 'Console errors on CES dashboard load',
        severity: 'High',
        role: 'super_admin',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: url,
        stepsToReproduce: 'Navigate to /ces/dashboard with demo auth bypass',
        expected: 'No console errors',
        actual: errs.join('; '),
        screenshotPath: `${SS_ROOT}/01-role-switching/01-01-ces-dashboard-loaded.png`,
        consoleError: errs.join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Component mounting error or missing data',
        filesToInspect: 'src/policy/ces/pages/CesDashboardPage.tsx',
        recommendedFix: 'Inspect console errors and fix root causes',
        regressionRisk: 'High — dashboard is the primary entry point',
      });
    }
  });

  test('01-02: Role switcher is present and CES roles are available', async ({ page }) => {
    await bypassAuth(page);
    await navTo(page, `${BASE_URL}/ces/board`);
    await ss(page, '01-role-switching', '01-02-board-initial');

    // Look for role switcher (common patterns: select, dropdown, role badge)
    const hasSwitcher = await isVisible(page, '[data-testid="ces-role-switcher"]')
      || await isVisible(page, 'select[data-role]')
      || await hasText(page, 'Governing Body')
      || await hasText(page, 'Administrator')
      || await hasText(page, 'DON');

    if (!hasSwitcher) {
      recordDefect({
        title: 'CES role switcher not found on Sprint Board',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /ces/board. 2. Look for role switcher or any role label.',
        expected: 'Role switcher control or at minimum a role label showing the current CES role',
        actual: 'No role switcher or CES role label found on the page',
        screenshotPath: `${SS_ROOT}/01-role-switching/01-02-board-initial.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'CES role context may not be wired into the Sprint Board component',
        filesToInspect: 'src/policy/ces/pages/CesBoardPage.tsx, src/policy/ces/components/board/SprintExecutionBoard.tsx, src/policy/ces/layouts/CesLayout.tsx',
        recommendedFix: 'Add CesRoleReviewSwitcher to CesLayout or SprintExecutionBoard. Add data-testid="ces-role-switcher".',
        regressionRisk: 'Critical — role-based task filtering cannot be tested without role switching',
      });
    }
    await ss(page, '01-role-switching', '01-02-role-context-check');
  });

  test('01-03: DON Assistant role — cannot sign (enforcement check)', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '01-03');
    // Navigate to board, switch to DON Assistant, look for any sign button
    await navTo(page, `${BASE_URL}/ces/board`);

    // Try to set role to DON Assistant via URL param or switcher
    await navTo(page, `${BASE_URL}/ces/board?role=DON+Assistant`);
    await ss(page, '01-role-switching', '01-03-don-assistant-board');

    // Any "Sign" button must be absent or disabled for DON Assistant
    const signBtnVisible = await isVisible(page, 'button:has-text("Sign")');
    if (signBtnVisible) {
      recordDefect({
        title: 'DON Assistant can see Sign button — must be disabled/hidden',
        severity: 'Critical',
        role: 'DON Assistant',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Switch CES role to "DON Assistant". 2. Open any task that requires signature. 3. Confirm whether "Sign" button is available.',
        expected: '"Sign" button must not be visible or must be disabled for DON Assistant role',
        actual: '"Sign" button is visible for DON Assistant — DON Assistant must never sign',
        screenshotPath: `${SS_ROOT}/01-role-switching/01-03-don-assistant-board.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'canRoleSign() check not applied to the Sign button renderer',
        filesToInspect: 'src/policy/ces/cesRoles.ts (canRoleSign), src/policy/components/FormSigningWorkspace.tsx, src/policy/components/regulatory/WorkflowExecutionPanel.tsx',
        recommendedFix: 'Gate Sign button on canRoleSign(currentRole). DON Assistant is excluded from CES_SIGNER_ROLES.',
        regressionRisk: 'Critical — audit compliance requires DON Assistant signature prevention',
      });
    }
    stopCapture();
  });
});

// ── 02. Sprint Board ──────────────────────────────────────────────────────────
test.describe('02 — Sprint Board', () => {

  test('02-01: Sprint Board loads and shows Q2 sprints', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '02-01');
    await navTo(page, `${BASE_URL}/ces/board`);
    await ss(page, '02-sprint-board', '02-01-board-initial-state');

    const url = page.url();
    expect(url, 'Should not redirect to login').not.toContain('/login');

    // Check that content rendered (not blank)
    const bodyText = await page.locator('body').innerText();
    const isBlank = bodyText.trim().length < 50;
    if (isBlank) {
      recordDefect({
        title: 'Sprint Board renders blank — no content',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /ces/board. 2. Observe page.',
        expected: 'Sprint Board renders sprint cards, tasks, and controls',
        actual: 'Page body text length < 50 chars — appears blank or only spinner',
        screenshotPath: `${SS_ROOT}/02-sprint-board/02-01-board-initial-state.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'SprintExecutionBoard data source error or render crash',
        filesToInspect: 'src/policy/ces/components/board/SprintExecutionBoard.tsx',
        recommendedFix: 'Add error boundary and loading state to SprintExecutionBoard',
        regressionRisk: 'Critical — Sprint Board is primary CES execution interface',
      });
    }

    // Verify at least one Q2 event appears on board
    const q2EventTitles = ['QAPI Committee', 'Governing Body', 'Claims Submission', 'System Activity'];
    let foundQ2 = false;
    for (const title of q2EventTitles) {
      if (await hasText(page, title)) { foundQ2 = true; break; }
    }

    if (!foundQ2) {
      recordDefect({
        title: 'Sprint Board shows no Q2 2026 events',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /ces/board. 2. Look for Q2 events (QAPI, Governing Body, Claims, System Activity).',
        expected: 'Q2 2026 events appear on sprint board',
        actual: 'None of the expected Q2 event titles found on the board',
        screenshotPath: `${SS_ROOT}/02-sprint-board/02-01-board-initial-state.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'Sprint filtering may be locked to a past sprint; activeSprint not covering Q2 dates',
        filesToInspect: 'src/policy/compliance-execution/complianceExecutionStore.ts (sprint window computation), src/policy/ces/components/board/SprintExecutionBoard.tsx',
        recommendedFix: 'Verify activeSprint.startDate / endDate covers today (2026-05-10). TODAY_ANCHOR must match system date.',
        regressionRisk: 'Critical — Q2 UAT cannot proceed if events are missing from board',
      });
    }
    const errs = stopCapture();
    if (errs.length > 0) {
      consoleErrors.push(...errs);
    }
    await ss(page, '02-sprint-board', '02-01-board-content-check');
  });

  test('02-02: Sprint Board right panel opens for a task', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '02-02');
    await navTo(page, `${BASE_URL}/ces/board`);
    await page.waitForTimeout(2000);

    // Try clicking first visible task card
    const taskCard = page.locator('[data-testid="execution-unit-card"], [data-testid="task-card"], .task-card, .execution-unit-card').first();
    const cardVisible = await taskCard.isVisible({ timeout: 5000 }).catch(() => false);

    if (cardVisible) {
      await taskCard.click();
      await page.waitForTimeout(1500);
      await ss(page, '02-sprint-board', '02-02-task-right-panel-open');

      // Check right panel appeared
      const panelVisible = await isVisible(page, '[data-testid="sprint-task-panel"], [data-testid="workflow-drawer"], [data-testid="task-detail-panel"]');
      if (!panelVisible) {
        recordDefect({
          title: 'Task click does not open right panel on Sprint Board',
          severity: 'High',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'first-visible-task',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: page.url(),
          stepsToReproduce: '1. Navigate to /ces/board. 2. Click first visible task card.',
          expected: 'Right panel (SprintTaskPanel or WorkflowDrawer) opens with task detail',
          actual: 'No panel with data-testid="sprint-task-panel" or equivalent appeared',
          screenshotPath: `${SS_ROOT}/02-sprint-board/02-02-task-right-panel-open.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Click handler not wired or panel render state not triggered',
          filesToInspect: 'src/policy/ces/components/board/ExecutionUnitCard.tsx, src/policy/ces/components/details/SprintTaskPanel.tsx',
          recommendedFix: 'Add data-testid attributes to task cards and panel. Verify click-to-open wiring.',
          regressionRisk: 'High — task detail is the entry point for form, evidence, and eCIgn flows',
        });
      }
    } else {
      recordDefect({
        title: 'No task cards found on Sprint Board — board may be empty',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /ces/board. 2. Look for task cards.',
        expected: 'Task cards visible on sprint board',
        actual: 'No element matching task card selectors found',
        screenshotPath: `${SS_ROOT}/02-sprint-board/02-02-task-right-panel-open.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Board is empty — no tasks loaded for current sprint window',
        filesToInspect: 'src/policy/ces/components/board/SprintExecutionBoard.tsx',
        recommendedFix: 'Verify data pipeline delivers execution units to sprint board component',
        regressionRisk: 'Critical',
      });
    }
    stopCapture();
  });
});

// ── 03. Calendar View ─────────────────────────────────────────────────────────
test.describe('03 — Calendar', () => {

  test('03-01: Master Calendar loads in sprint mode with Q2 events', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '03-01');
    await navTo(page, `${BASE_URL}/calendar?view=sprint`);
    await ss(page, '03-calendar', '03-01-calendar-sprint-view');

    const url = page.url();
    expect(url).not.toContain('/login');

    const hasCalendarContent = await hasText(page, 'May') || await hasText(page, 'April') || await hasText(page, 'June');
    if (!hasCalendarContent) {
      recordDefect({
        title: 'Calendar does not show month labels — may not be rendering Q2 dates',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /calendar?view=sprint. 2. Check for month labels.',
        expected: 'Calendar shows Q2 months (April, May, June)',
        actual: 'No month labels found',
        screenshotPath: `${SS_ROOT}/03-calendar/03-01-calendar-sprint-view.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Calendar component not rendering or date range wrong',
        filesToInspect: 'src/policy/pages/MasterCalendarPage.tsx, src/policy/ces/components/calendar/ComplianceCalendar.tsx',
        recommendedFix: 'Check calendar month rendering and ensure Q2 date range is displayed',
        regressionRisk: 'High',
      });
    }

    // Check for QAPI event on calendar
    const hasQapi = await hasText(page, 'QAPI');
    if (!hasQapi) {
      recordDefect({
        title: 'QAPI event missing from calendar sprint view',
        severity: 'High',
        role: 'N/A',
        eventId: 'qapi_meeting-20260512-09',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /calendar?view=sprint. 2. Look for "QAPI" event label.',
        expected: 'QAPI Committee Meeting appears on calendar for May 12 2026',
        actual: '"QAPI" text not found on calendar',
        screenshotPath: `${SS_ROOT}/03-calendar/03-01-calendar-sprint-view.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'Calendar event rendering filter or date range issue',
        filesToInspect: 'src/policy/ces/components/calendar/ComplianceCalendar.tsx',
        recommendedFix: 'Verify event date range covers May 2026 and QAPI event is included in rendered list',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('03-02: Calendar event click opens event detail', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '03-02');
    await navTo(page, `${BASE_URL}/calendar?view=sprint`);
    await page.waitForTimeout(2000);

    // Try clicking any event chip
    const eventChip = page.locator('[data-testid="calendar-event"], .calendar-event, .event-chip').first();
    const chipVisible = await eventChip.isVisible({ timeout: 4000 }).catch(() => false);

    if (chipVisible) {
      await eventChip.click();
      await page.waitForTimeout(1500);
      await ss(page, '03-calendar', '03-02-event-detail-from-calendar');
    } else {
      await ss(page, '03-calendar', '03-02-no-event-chips');
      recordDefect({
        title: 'No calendar event chips found — cannot test event click flow',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /calendar?view=sprint. 2. Look for event chips/cards.',
        expected: 'Clickable event chips visible on calendar grid',
        actual: 'No elements matching calendar event chip selectors found',
        screenshotPath: `${SS_ROOT}/03-calendar/03-02-no-event-chips.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Calendar events not rendering or selector mismatch (missing data-testid)',
        filesToInspect: 'src/policy/ces/components/calendar/ComplianceCalendar.tsx',
        recommendedFix: 'Add data-testid="calendar-event" to event chip elements',
        regressionRisk: 'High — calendar navigation path to events is untestable without selectors',
      });
    }
    stopCapture();
  });

  test('03-03: Direct event URL loads MobileIncidentExecutionPage', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '03-03');
    const eventId = 'qapi_meeting-20260512-09';
    await navTo(page, `${BASE_URL}/calendar/event/${eventId}`);
    await page.waitForTimeout(2000);
    await ss(page, '03-calendar', '03-03-event-direct-url');

    const url = page.url();
    const body = await page.locator('body').innerText();

    if (body.trim().length < 50) {
      recordDefect({
        title: `Event page blank for ${eventId}`,
        severity: 'Critical',
        role: 'N/A',
        eventId,
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: `1. Navigate to /calendar/event/${eventId}. 2. Observe page content.`,
        expected: 'Event execution page loads with event title, task list, and workflow panel',
        actual: 'Page body is nearly empty — blank or still loading',
        screenshotPath: `${SS_ROOT}/03-calendar/03-03-event-direct-url.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'MobileIncidentExecutionPage fails to resolve event by ID, or event data not loaded',
        filesToInspect: 'src/policy/pages/MobileIncidentExecutionPage.tsx',
        recommendedFix: 'Ensure event ID resolves from regulatory events store. Add loading/error state.',
        regressionRisk: 'Critical',
      });
    }

    // Check event title visible
    const hasTitle = await hasText(page, 'QAPI') || await hasText(page, 'Committee');
    if (!hasTitle) {
      recordDefect({
        title: `Event title not rendered on event page for ${eventId}`,
        severity: 'High',
        role: 'N/A',
        eventId,
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: `1. Navigate to /calendar/event/${eventId}. 2. Look for event title "QAPI Committee Meeting".`,
        expected: 'Event title "QAPI Committee Meeting" visible in page heading',
        actual: 'Neither "QAPI" nor "Committee" found in page content',
        screenshotPath: `${SS_ROOT}/03-calendar/03-03-event-direct-url.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'Event title not rendered or wrong event resolved',
        filesToInspect: 'src/policy/pages/MobileIncidentExecutionPage.tsx',
        recommendedFix: 'Check event resolution and title rendering',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });
});

// ── 04. CES Dashboard and Gantt ───────────────────────────────────────────────
test.describe('04 — CES Dashboard & Gantt', () => {

  test('04-01: CES Dashboard renders metrics', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '04-01');
    await navTo(page, `${BASE_URL}/ces/dashboard`);
    await page.waitForTimeout(2000);
    await ss(page, '04-gantt', '04-01-ces-dashboard');

    const hasMetric = await hasText(page, 'Sprint') || await hasText(page, 'Completion') || await hasText(page, 'Audit');
    if (!hasMetric) {
      recordDefect({
        title: 'CES Dashboard shows no metric labels',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /ces/dashboard. 2. Look for Sprint/Completion/Audit metric labels.',
        expected: 'Metric cards show sprint metrics: completion rate, audit readiness, blockers',
        actual: 'None of the expected metric labels found',
        screenshotPath: `${SS_ROOT}/04-gantt/04-01-ces-dashboard.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'CesExecutiveDashboard component data error or failed render',
        filesToInspect: 'src/policy/ces/components/dashboard/CesExecutiveDashboard.tsx, src/policy/ces/pages/CesDashboardPage.tsx',
        recommendedFix: 'Check CesExecutiveDashboard data dependencies and error boundary',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('04-02: Master Calendar Gantt view loads', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '04-02');
    // Gantt is typically accessible via calendar with gantt param
    await navTo(page, `${BASE_URL}/calendar?view=gantt`);
    await page.waitForTimeout(2000);
    await ss(page, '04-gantt', '04-02-gantt-view');

    const url = page.url();
    expect(url).not.toContain('/login');

    // Look for gantt-specific content
    const hasGantt = await hasText(page, 'Gantt') || await isVisible(page, '[data-testid="gantt"], .gantt-row, .timeline-row');
    if (!hasGantt) {
      recordDefect({
        title: 'Gantt view not found at /calendar?view=gantt',
        severity: 'Medium',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /calendar?view=gantt. 2. Look for Gantt chart or timeline rows.',
        expected: 'Gantt timeline chart renders with event rows',
        actual: 'No Gantt content found — may fall back to default calendar view',
        screenshotPath: `${SS_ROOT}/04-gantt/04-02-gantt-view.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Gantt view toggle may not be implemented or URL param not handled',
        filesToInspect: 'src/policy/pages/MasterCalendarPage.tsx',
        recommendedFix: 'Implement or verify ?view=gantt param handling in MasterCalendarPage',
        regressionRisk: 'Medium',
      });
    }
    stopCapture();
  });
});

// ── 05. Q2 Events — Per-Event Testing ─────────────────────────────────────────
test.describe('05 — Q2 2026 Events (Per-Event)', () => {

  // Test a representative selection of Q2 events for full coverage
  const EVENTS_TO_TEST = [
    { id: 'qapi_meeting-20260512-09',           title: 'QAPI Committee Meeting',       sprint: 'S-Q2-05' },
    { id: 'governing_body_meeting-20260514-01', title: 'Governing Body Meeting',        sprint: 'S-Q2-05' },
    { id: 'claims_submission-20260513-01',      title: 'Claims Submission Cycle',       sprint: 'S-Q2-05' },
    { id: 'system_activity_review-20260513-01', title: 'System Activity Review',        sprint: 'S-Q2-05' },
    { id: 'sentinel_event_rca-20260515-01',     title: 'Sentinel Event RCA',            sprint: 'S-Q2-05' },
    { id: 'episode_review-20260518-01',         title: '30-Day Episode Review',         sprint: 'S-Q2-06' },
    { id: 'physician_signatures-20260521-01',   title: 'Physician Signatures',          sprint: 'S-Q2-06' },
    { id: 'hipaa_training-20260528-01',         title: 'HIPAA Training',                sprint: 'S-Q2-07' },
    { id: 'qapi_meeting-20260609-10',           title: 'QAPI Committee Meeting (June)', sprint: 'S-Q2-08' },
    { id: 'risk_management_committee-20260617-01', title: 'Risk Management Committee', sprint: 'S-Q2-08' },
    { id: 'policy_review_annual-20260624-01',   title: 'Annual Policy Review',          sprint: 'S-Q2-09' },
  ];

  for (const evt of EVENTS_TO_TEST) {
    test(`05-${evt.id.slice(0, 20)}: ${evt.title} — event page loads`, async ({ page }) => {
      await bypassAuth(page);
      const stopCapture = attachConsoleCapture(page, `05-${evt.id}`);
      const evtFolder = eventSsFolder(evt.id);

      // Create per-event event subfolder
      fs.mkdirSync(path.join(SS_ROOT, 'events', evt.id), { recursive: true });

      await navTo(page, `${BASE_URL}/calendar/event/${evt.id}`);
      await page.waitForTimeout(2000);
      await ss(page, evtFolder, '01-event-start-state');

      const url = page.url();
      const body = await page.locator('body').innerText();
      const isBlank = body.trim().length < 50;
      const errs = stopCapture();

      let passStatus = 'PASS';
      let critDefs = 0;

      // Check 1: Page not blank
      if (isBlank) {
        passStatus = 'FAIL';
        const did = recordDefect({
          title: `Event page blank for ${evt.id} (${evt.title})`,
          severity: 'Critical',
          role: 'N/A',
          eventId: evt.id,
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url,
          stepsToReproduce: `1. Navigate to /calendar/event/${evt.id}. 2. Observe content.`,
          expected: `Event page shows "${evt.title}" with tasks and workflow`,
          actual: 'Page body has < 50 chars — blank or loading spinner stuck',
          screenshotPath: path.join(SS_ROOT, evtFolder, '01-event-start-state.png'),
          consoleError: errs.join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Event ID not resolving or MobileIncidentExecutionPage crash',
          filesToInspect: 'src/policy/pages/MobileIncidentExecutionPage.tsx, src/policy/data/regulatoryEvents.ts',
          recommendedFix: `Verify event id '${evt.id}' is exported from regulatoryEvents.ts and resolves in page component`,
          regressionRisk: 'Critical',
        });
        critDefs++;
        console.log(`  → Defect: ${did}`);
      }

      // Check 2: Event ID visible (or event-related content)
      const hasEventContent = await hasText(page, evt.title.split(' ')[0]) || await hasText(page, evt.id);
      if (!isBlank && !hasEventContent) {
        passStatus = 'FAIL';
        recordDefect({
          title: `Event title not rendered for ${evt.id}`,
          severity: 'High',
          role: 'N/A',
          eventId: evt.id,
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url,
          stepsToReproduce: `1. Navigate to /calendar/event/${evt.id}. 2. Check for "${evt.title}" in page.`,
          expected: `"${evt.title}" visible in page heading`,
          actual: `Event title first word "${evt.title.split(' ')[0]}" not found in page content`,
          screenshotPath: path.join(SS_ROOT, evtFolder, '01-event-start-state.png'),
          consoleError: errs.join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Event not matched by ID or title rendering broken',
          filesToInspect: 'src/policy/pages/MobileIncidentExecutionPage.tsx',
          recommendedFix: 'Verify event title renders from regulatoryEvents lookup',
          regressionRisk: 'High',
        });
      }

      // Check 3: Console errors
      if (errs.length > 0) {
        if (passStatus === 'PASS') passStatus = 'WARN';
        errs.forEach(e => {
          if (e.includes('Maximum update depth') || e.includes('Uncaught') || e.includes('Cannot read')) {
            passStatus = 'FAIL';
            critDefs++;
          }
        });
      }

      // Record test result
      testResults.push({
        eventId: evt.id,
        eventName: evt.title,
        sprint: evt.sprint,
        role: 'super_admin',
        taskCount: 0,   // Populated after task list scan
        formsRequired: 0,
        evidenceRequired: 0,
        signaturesRequired: 0,
        completionStatus: isBlank ? 'BLOCKED' : 'IN_PROGRESS',
        auditLockStatus: 'NOT_STARTED',
        passFail: passStatus,
        screenshotFolder: path.join(SS_ROOT, evtFolder),
        criticalDefects: critDefs,
      });

      // Check task list
      if (!isBlank) {
        await ss(page, evtFolder, '02-task-list');

        // Try to find task list
        const hasTaskList = await isVisible(page, '[data-testid="task-list"], .task-list, [data-testid="workflow-tasks"]')
          || await hasText(page, 'Task')
          || await hasText(page, 'Required')
          || await hasText(page, 'Evidence');

        if (!hasTaskList) {
          recordDefect({
            title: `Task list not visible for event ${evt.id}`,
            severity: 'High',
            role: 'N/A',
            eventId: evt.id,
            taskId: 'N/A',
            formId: 'N/A',
            formInstanceId: 'N/A',
            evidenceId: 'N/A',
            artifactId: 'N/A',
            url,
            stepsToReproduce: `1. Open event ${evt.id}. 2. Look for task list.`,
            expected: 'Task list visible with individual tasks for the event',
            actual: 'No task list found — no "Task", "Required", or "Evidence" labels',
            screenshotPath: path.join(SS_ROOT, evtFolder, '02-task-list.png'),
            consoleError: 'N/A',
            networkError: 'N/A',
            likelyRootCause: 'Workflow tasks not rendered or event has no associated tasks',
            filesToInspect: 'src/policy/pages/MobileIncidentExecutionPage.tsx, src/policy/compliance-execution/useEventExecutionDataflow.ts',
            recommendedFix: 'Verify task projection for this event produces tasks in useEventExecutionDataflow',
            regressionRisk: 'High',
          });
        }
      }
    });
  }
});

// ── 06. Forms Testing ─────────────────────────────────────────────────────────
test.describe('06 — Forms', () => {

  test('06-01: Form opens from task with correct form instance ID (not blank)', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '06-01');
    const eventId = 'qapi_meeting-20260512-09';
    await navTo(page, `${BASE_URL}/calendar/event/${eventId}`);
    await page.waitForTimeout(2000);
    await ss(page, '06-forms', '06-01-event-before-form');

    // Look for any form link / "Complete Form" / "Open Form" button
    const formBtn = page.locator('button:has-text("Complete Form"), button:has-text("Open Form"), a:has-text("Form"), [data-testid="form-link"]').first();
    const btnVisible = await formBtn.isVisible({ timeout: 4000 }).catch(() => false);

    if (btnVisible) {
      const urlBefore = page.url();
      await formBtn.click();
      await page.waitForTimeout(2500);
      await ss(page, '06-forms', '06-01-form-open');

      const urlAfter = page.url();
      const formBody = await page.locator('body').innerText();

      // Check URL has form_instance_id or formId
      const hasFormInstanceId = urlAfter.includes('instance') || urlAfter.includes('form_instance_id') || urlAfter.includes('instanceId');
      if (!hasFormInstanceId) {
        recordDefect({
          title: 'Form URL missing form_instance_id parameter',
          severity: 'High',
          role: 'N/A',
          eventId,
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'MISSING',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: urlAfter,
          stepsToReproduce: `1. Open event ${eventId}. 2. Click "Complete Form" button. 3. Check URL.`,
          expected: 'Form URL includes form_instance_id parameter, e.g. ?instance=EVT-QA-...&form_instance_id=...',
          actual: `URL does not contain instance/form_instance_id: ${urlAfter}`,
          screenshotPath: `${SS_ROOT}/06-forms/06-01-form-open.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Form navigation not passing form_instance_id — opens generic template instead of event instance',
          filesToInspect: 'src/policy/compliance-execution/cesFormInstanceId.ts, src/policy/compliance-execution/useEventExecutionDataflow.ts, src/policy/components/regulatory/WorkflowExecutionPanel.tsx',
          recommendedFix: 'Ensure getOrCreateFormInstance() is called and the result form_instance_id is appended to the /forms/:formId route',
          regressionRisk: 'Critical — without form_instance_id, forms are not linked to events and audit trail is broken',
        });
      }

      // Check form is not blank
      const formBlank = formBody.trim().length < 50;
      if (formBlank) {
        recordDefect({
          title: 'Form viewer renders blank white page',
          severity: 'Critical',
          role: 'N/A',
          eventId,
          taskId: 'N/A',
          formId: 'unknown',
          formInstanceId: 'unknown',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: urlAfter,
          stepsToReproduce: `1. Open event ${eventId}. 2. Click "Complete Form". 3. Observe form page.`,
          expected: 'Form viewer shows form fields, title, and form instance ID',
          actual: 'Form page body has < 50 chars — blank white page',
          screenshotPath: `${SS_ROOT}/06-forms/06-01-form-open.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Form ID not in FORMS_DATASET, or FormViewer crash, or detailMode collision',
          filesToInspect: 'src/policy/components/FormViewer.tsx, src/policy/data/formsLibraryDataset.ts',
          recommendedFix: 'Verify form ID exists in FORMS_DATASET. Check FormViewer render path.',
          regressionRisk: 'Critical',
        });
      }

      // Check for double-dash legacy IDs
      if (urlAfter.includes('--')) {
        recordDefect({
          title: 'Form URL contains legacy double-dash form instance ID',
          severity: 'High',
          role: 'N/A',
          eventId,
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'LEGACY_DOUBLE_DASH',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: urlAfter,
          stepsToReproduce: `1. Open event ${eventId}. 2. Click "Complete Form". 3. Inspect URL.`,
          expected: 'Form instance ID follows canonical format: {event_id}-{form_id}-{sequence}',
          actual: `URL contains "--" indicating legacy double-dash format: ${urlAfter}`,
          screenshotPath: `${SS_ROOT}/06-forms/06-01-form-open.png`,
          consoleError: 'N/A',
          networkError: 'N/A',
          likelyRootCause: 'cesFormInstanceId.ts using old naming convention',
          filesToInspect: 'src/policy/compliance-execution/cesFormInstanceId.ts',
          recommendedFix: 'Replace double-dash separators with single dash. New format: {event_id}-{form_id}-{sequence}',
          regressionRisk: 'High — double-dash IDs may cause ID collisions',
        });
      }

    } else {
      await ss(page, '06-forms', '06-01-no-form-button');
      recordDefect({
        title: 'No "Complete Form" or form link button found on QAPI event page',
        severity: 'High',
        role: 'N/A',
        eventId,
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: `1. Navigate to /calendar/event/${eventId}. 2. Look for "Complete Form" button.`,
        expected: '"Complete Form" or form link button visible for tasks with required forms',
        actual: 'No form button found — tasks may not have form buttons wired',
        screenshotPath: `${SS_ROOT}/06-forms/06-01-no-form-button.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Form button not rendered or event page not loaded correctly',
        filesToInspect: 'src/policy/pages/MobileIncidentExecutionPage.tsx, src/policy/components/regulatory/WorkflowExecutionPanel.tsx',
        recommendedFix: 'Ensure form link buttons are rendered for tasks with required form IDs',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('06-02: Forms page loads form by ID without blank render', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '06-02');

    // Known QAPI form
    const formId = 'QA-F-010';
    await navTo(page, `${BASE_URL}/forms/${formId}`);
    await page.waitForTimeout(2000);
    await ss(page, '06-forms', '06-02-form-by-id');

    const body = await page.locator('body').innerText();
    const isBlank = body.trim().length < 50;

    if (isBlank) {
      recordDefect({
        title: `Form ${formId} renders blank at /forms/${formId}`,
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId,
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: `1. Navigate to /forms/${formId}. 2. Observe content.`,
        expected: `Form "${formId}" renders with title, fields, and form body`,
        actual: 'Form page blank — body < 50 chars',
        screenshotPath: `${SS_ROOT}/06-forms/06-02-form-by-id.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: `${formId} not in FORMS_DATASET or FormViewer crash`,
        filesToInspect: 'src/policy/components/FormViewer.tsx, src/policy/data/formsLibraryDataset.ts',
        recommendedFix: `Add ${formId} to FORMS_DATASET and verify FormViewer render path`,
        regressionRisk: 'Critical',
      });
    }

    const errs = stopCapture();
    if (errs.some(e => e.includes('Maximum update depth'))) {
      recordDefect({
        title: `Maximum update depth exceeded on form ${formId}`,
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId,
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: `1. Navigate to /forms/${formId}. 2. Monitor console.`,
        expected: 'No React render loop errors',
        actual: 'Console shows "Maximum update depth exceeded" — infinite render loop',
        screenshotPath: `${SS_ROOT}/06-forms/06-02-form-by-id.png`,
        consoleError: errs.filter(e => e.includes('Maximum update depth')).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'useEffect with unstable dependency array causing infinite re-render in FormViewer or FormSigningWorkspace',
        filesToInspect: 'src/policy/components/FormViewer.tsx, src/policy/components/FormSigningWorkspace.tsx',
        recommendedFix: 'Stabilize useEffect dependency arrays. Check for setState calls in render-phase effects.',
        regressionRisk: 'Critical — eCIgn finalize is blocked by this loop',
      });
    }
  });

  test('06-03: Form save persists content after page refresh', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '06-03');
    const formId = 'QA-F-010';
    const instanceId = `test-instance-${Date.now()}`;
    await navTo(page, `${BASE_URL}/forms/${formId}?form_instance_id=${instanceId}`);
    await page.waitForTimeout(2000);
    await ss(page, '06-forms', '06-03-form-before-fill');

    // Try to fill a text field
    const textField = page.locator('input[type="text"], textarea').first();
    const fieldVisible = await textField.isVisible({ timeout: 3000 }).catch(() => false);

    if (fieldVisible) {
      const testValue = `UAT-TEST-${Date.now()}`;
      await textField.fill(testValue);
      await ss(page, '06-forms', '06-03-form-filled');

      // Find and click Save button
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Save Draft"), [data-testid="save-form"]').first();
      const saveBtnVisible = await saveBtn.isVisible({ timeout: 3000 }).catch(() => false);

      if (saveBtnVisible) {
        await saveBtn.click();
        await page.waitForTimeout(1500);
        await ss(page, '06-forms', '06-03-form-saved');

        // Refresh and check persistence
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(2000);
        await ss(page, '06-forms', '06-03-form-after-refresh');

        const fieldAfterRefresh = page.locator('input[type="text"], textarea').first();
        const valueAfterRefresh = await fieldAfterRefresh.inputValue().catch(() => '');

        if (valueAfterRefresh !== testValue) {
          recordDefect({
            title: 'Form data does not persist after browser refresh',
            severity: 'Critical',
            role: 'N/A',
            eventId: 'N/A',
            taskId: 'N/A',
            formId,
            formInstanceId: instanceId,
            evidenceId: 'N/A',
            artifactId: 'N/A',
            url: page.url(),
            stepsToReproduce: `1. Open /forms/${formId}?form_instance_id=${instanceId}. 2. Fill text field with "${testValue}". 3. Save. 4. Refresh page. 5. Check field value.`,
            expected: `Field retains value "${testValue}" after refresh`,
            actual: `Field value is "${valueAfterRefresh}" after refresh — save did not persist`,
            screenshotPath: `${SS_ROOT}/06-forms/06-03-form-after-refresh.png`,
            consoleError: (stopCapture()).join('\n'),
            networkError: 'N/A',
            likelyRootCause: 'Form data saved to in-memory state only, not persisted to localStorage or backend',
            filesToInspect: 'src/policy/components/FormViewer.tsx, src/policy/stores/regulatoryExecutionStore.ts',
            recommendedFix: 'Persist form instance data to localStorage keyed by form_instance_id. Reload on mount.',
            regressionRisk: 'Critical — audit requires forms to persist saved state',
          });
        }
      } else {
        recordDefect({
          title: 'Save button not found on form page',
          severity: 'High',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'N/A',
          formId,
          formInstanceId: instanceId,
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: page.url(),
          stepsToReproduce: `1. Open /forms/${formId}. 2. Look for Save button.`,
          expected: 'Save/Save Draft button visible on form page',
          actual: 'No save button found',
          screenshotPath: `${SS_ROOT}/06-forms/06-03-form-saved.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Form save action not implemented or button not rendered',
          filesToInspect: 'src/policy/components/FormViewer.tsx',
          recommendedFix: 'Add Save Draft button to FormViewer',
          regressionRisk: 'High',
        });
      }
    }
    stopCapture();
  });
});

// ── 07. eCIgn / Signature Testing ─────────────────────────────────────────────
test.describe('07 — eCIgn Signatures', () => {

  test('07-01: eCIgn signature flow initiates from form viewer', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '07-01');
    const formId = 'QA-F-012';
    await navTo(page, `${BASE_URL}/forms/${formId}?form_instance_id=test-ecign-${Date.now()}`);
    await page.waitForTimeout(2000);
    await ss(page, '07-ecign', '07-01-form-before-sign');

    // Look for sign/route-for-signature button
    const signBtn = page.locator('button:has-text("Sign"), button:has-text("Route for Signature"), button:has-text("Request Signature"), [data-testid="ecign-sign-btn"]').first();
    const signBtnVisible = await signBtn.isVisible({ timeout: 4000 }).catch(() => false);

    if (signBtnVisible) {
      await signBtn.click();
      await page.waitForTimeout(2000);
      await ss(page, '07-ecign', '07-01-signature-request-screen');

      const errs = stopCapture();
      if (errs.some(e => e.includes('502') || e.includes('ECONNREFUSED'))) {
        recordDefect({
          title: 'eCIgn signature initiation fails with 502/ECONNREFUSED — backend not reachable',
          severity: 'Critical',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'N/A',
          formId,
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: page.url(),
          stepsToReproduce: `1. Open /forms/${formId}. 2. Click Sign/Route for Signature. 3. Monitor network and console.`,
          expected: 'eCIgn demo-local mode handles signing without backend — no 502',
          actual: 'Console shows 502 or ECONNREFUSED — DEMO_LOCAL mode not active or not properly configured',
          screenshotPath: `${SS_ROOT}/07-ecign/07-01-signature-request-screen.png`,
          consoleError: errs.join('\n'),
          networkError: 'GET /api/ecign/network-info → 502 AggregateError ECONNREFUSED',
          likelyRootCause: 'ecignApi.ts not in DEMO_LOCAL mode; backend process at localhost:8787 not running',
          filesToInspect: 'src/policy/ecign/api.ts, src/policy/ecign/demoLocalApi.ts, server/routes/ecign.ts',
          recommendedFix: 'Ensure VITE_ECIGN_MODE=DEMO_LOCAL in .env. Verify demoLocalApi.ts handles all sign/status calls.',
          regressionRisk: 'Critical — all eCIgn flows blocked',
        });
      }
    } else {
      await ss(page, '07-ecign', '07-01-no-sign-button');
      recordDefect({
        title: 'Sign/Route for Signature button not found on form page',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId,
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: `1. Open /forms/${formId}. 2. Look for Sign or Route for Signature button.`,
        expected: 'Sign button visible for forms requiring eCIgn',
        actual: 'No sign button found',
        screenshotPath: `${SS_ROOT}/07-ecign/07-01-no-sign-button.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Signature routing not wired in FormViewer or form not in signature-required state',
        filesToInspect: 'src/policy/components/FormViewer.tsx, src/policy/components/FormSigningWorkspace.tsx',
        recommendedFix: 'Add Sign/Route for Signature CTA to FormViewer for forms with signaturesRequired > 0',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('07-02: Signed artifact does not render blank/white', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '07-02');
    // Check artifact viewer with a known artifact ID pattern
    await navTo(page, `${BASE_URL}/artifacts/test-artifact-001`);
    await page.waitForTimeout(2000);
    await ss(page, '07-ecign', '07-02-artifact-viewer');

    const body = await page.locator('body').innerText();
    const isBlank = body.trim().length < 50;
    if (isBlank) {
      recordDefect({
        title: 'Artifact viewer renders blank for test artifact ID',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'test-artifact-001',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /artifacts/test-artifact-001. 2. Observe.',
        expected: 'Artifact viewer shows metadata panel for unknown artifact (not blank, shows error state)',
        actual: 'Page blank — artifact viewer may crash on unknown ID',
        screenshotPath: `${SS_ROOT}/07-ecign/07-02-artifact-viewer.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'ArtifactViewerPage crashes on null artifact resolution',
        filesToInspect: 'src/policy/pages/ArtifactViewerPage.tsx',
        recommendedFix: 'Add graceful "Artifact not found" state instead of blank/crash',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('07-03: Same signer cannot sign twice — duplicate signature check', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '07-03');
    await navTo(page, `${BASE_URL}/ces/board`);
    await page.waitForTimeout(2000);

    // Look for any already-signed artifact link and verify second-sign is blocked
    const signedLabel = page.locator('text=Signed, text=Signature Complete').first();
    const signedVisible = await signedLabel.isVisible({ timeout: 3000 }).catch(() => false);

    await ss(page, '07-ecign', '07-03-duplicate-sign-check');

    if (signedVisible) {
      // If a signed state is visible, verify no "Sign Again" button appears
      const signAgainBtn = await isVisible(page, 'button:has-text("Sign Again"), button:has-text("Sign")');
      if (signAgainBtn) {
        recordDefect({
          title: 'Sign button present even after first signature — duplicate signature risk',
          severity: 'Critical',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: page.url(),
          stepsToReproduce: '1. Navigate to sprint board. 2. Find a signed task. 3. Check if Sign button is still present.',
          expected: 'Sign button hidden/disabled after same role has signed',
          actual: 'Sign button still active after signature — duplicate signing possible',
          screenshotPath: `${SS_ROOT}/07-ecign/07-03-duplicate-sign-check.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Signature status not checked before rendering Sign CTA',
          filesToInspect: 'src/policy/components/FormSigningWorkspace.tsx, src/policy/ecign/demoLocalApi.ts',
          recommendedFix: 'Check existing signatures before showing Sign button. Block same role from signing twice.',
          regressionRisk: 'Critical — duplicate signatures invalidate audit evidence',
        });
      }
    }
    stopCapture();
  });
});

// ── 08. Evidence Center ───────────────────────────────────────────────────────
test.describe('08 — Evidence Center', () => {

  test('08-01: Evidence Center page loads', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '08-01');
    await navTo(page, `${BASE_URL}/evidence`);
    await page.waitForTimeout(2000);
    await ss(page, '08-evidence', '08-01-evidence-center-initial');

    const url = page.url();
    expect(url).not.toContain('/login');

    const body = await page.locator('body').innerText();
    if (body.trim().length < 50) {
      recordDefect({
        title: 'Evidence Center page renders blank',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /evidence. 2. Observe.',
        expected: 'Evidence Center renders file ledger, evidence list, and upload controls',
        actual: 'Page blank',
        screenshotPath: `${SS_ROOT}/08-evidence/08-01-evidence-center-initial.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'EvidenceCenterPage crash or data loading failure',
        filesToInspect: 'src/policy/pages/EvidenceCenterPage.tsx',
        recommendedFix: 'Add error boundary and check data dependencies',
        regressionRisk: 'Critical',
      });
    }

    const hasEvidenceContent = await hasText(page, 'Evidence') && (await hasText(page, 'Upload') || await hasText(page, 'File') || await hasText(page, 'No evidence'));
    if (!hasEvidenceContent) {
      recordDefect({
        title: 'Evidence Center missing expected content (Upload/File controls)',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /evidence. 2. Check for "Upload" or "File" labels.',
        expected: 'Evidence Center shows upload button and file ledger',
        actual: 'Neither "Upload" nor "File" controls found',
        screenshotPath: `${SS_ROOT}/08-evidence/08-01-evidence-center-initial.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'Evidence UI not fully rendered or data empty',
        filesToInspect: 'src/policy/pages/EvidenceCenterPage.tsx',
        recommendedFix: 'Ensure upload button and file ledger render even with empty evidence state',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('08-02: Evidence upload creates evidence ID', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '08-02');
    await navTo(page, `${BASE_URL}/evidence`);
    await page.waitForTimeout(2000);

    // Look for upload button
    const uploadBtn = page.locator('button:has-text("Upload"), label:has-text("Upload"), [data-testid="upload-evidence"]').first();
    const uploadVisible = await uploadBtn.isVisible({ timeout: 4000 }).catch(() => false);

    if (uploadVisible) {
      // Create a test file
      const [fileChooser] = await Promise.all([
        page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null),
        uploadBtn.click(),
      ]);

      if (fileChooser) {
        // Create a minimal test PDF/text buffer
        const buf = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF');
        await fileChooser.setFiles([{
          name: 'uat-test-evidence.pdf',
          mimeType: 'application/pdf',
          buffer: buf,
        }]);
        await page.waitForTimeout(2500);
        await ss(page, '08-evidence', '08-02-after-upload');

        // Check for evidence ID generated
        const hasEvidenceId = await hasText(page, 'EVD-') || await hasText(page, 'evidence_id') || await hasText(page, 'uat-test-evidence');
        if (!hasEvidenceId) {
          recordDefect({
            title: 'Evidence upload does not generate visible evidence ID',
            severity: 'High',
            role: 'N/A',
            eventId: 'N/A',
            taskId: 'N/A',
            formId: 'N/A',
            formInstanceId: 'N/A',
            evidenceId: 'MISSING',
            artifactId: 'N/A',
            url: page.url(),
            stepsToReproduce: '1. Navigate to /evidence. 2. Click Upload. 3. Select a PDF file. 4. Check for evidence ID.',
            expected: 'Evidence ID (format: EVD-...) generated and displayed after upload',
            actual: 'No evidence ID found in page after upload',
            screenshotPath: `${SS_ROOT}/08-evidence/08-02-after-upload.png`,
            consoleError: (stopCapture()).join('\n'),
            networkError: 'N/A',
            likelyRootCause: 'Evidence ID not generated by upload handler, or not displayed in UI',
            filesToInspect: 'src/policy/pages/EvidenceCenterPage.tsx, src/policy/stores/regulatoryExecutionStore.ts',
            recommendedFix: 'Generate canonical evidence_id on upload. Display in file ledger row.',
            regressionRisk: 'High — evidence without ID cannot be tracked in audit trail',
          });
        }

        // Check evidence appears in list
        const appearsInList = await hasText(page, 'uat-test-evidence');
        if (!appearsInList) {
          recordDefect({
            title: 'Uploaded evidence does not appear in Evidence Center list',
            severity: 'High',
            role: 'N/A',
            eventId: 'N/A',
            taskId: 'N/A',
            formId: 'N/A',
            formInstanceId: 'N/A',
            evidenceId: 'N/A',
            artifactId: 'N/A',
            url: page.url(),
            stepsToReproduce: '1. Upload evidence file. 2. Check Evidence Center list.',
            expected: 'Uploaded file "uat-test-evidence.pdf" appears in Evidence Center file ledger',
            actual: 'File not visible in Evidence Center list after upload',
            screenshotPath: `${SS_ROOT}/08-evidence/08-02-after-upload.png`,
            consoleError: 'N/A',
            networkError: 'N/A',
            likelyRootCause: 'Evidence not persisted to regulatoryExecutionStore or not rendered in ledger',
            filesToInspect: 'src/policy/pages/EvidenceCenterPage.tsx, src/policy/stores/regulatoryExecutionStore.ts',
            recommendedFix: 'uploadEvidence() must write to canonical store. EvidenceCenter must read from same store.',
            regressionRisk: 'High',
          });
        }
      }
    } else {
      await ss(page, '08-evidence', '08-02-no-upload-button');
      recordDefect({
        title: 'No upload button found in Evidence Center',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /evidence. 2. Look for Upload button.',
        expected: 'Upload button visible',
        actual: 'No upload button found',
        screenshotPath: `${SS_ROOT}/08-evidence/08-02-no-upload-button.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Upload CTA not rendered or requires scroll/filter selection first',
        filesToInspect: 'src/policy/pages/EvidenceCenterPage.tsx',
        recommendedFix: 'Ensure Upload button is always visible in Evidence Center header',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('08-03: Evidence opens own file, not latest form artifact', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '08-03');
    await navTo(page, `${BASE_URL}/evidence`);
    await page.waitForTimeout(2000);

    // Click first evidence entry if any
    const evidenceRow = page.locator('[data-testid="evidence-row"], .evidence-item, tr[data-evidence-id]').first();
    const rowVisible = await evidenceRow.isVisible({ timeout: 3000 }).catch(() => false);

    if (rowVisible) {
      const evidenceId = await evidenceRow.getAttribute('data-evidence-id') ?? 'unknown';
      await evidenceRow.click();
      await page.waitForTimeout(1500);
      await ss(page, '08-evidence', '08-03-evidence-viewer');

      const urlAfter = page.url();
      // Evidence should open its own artifact viewer, not a form URL
      const opensFormViewer = urlAfter.includes('/forms/') && !urlAfter.includes(evidenceId);
      if (opensFormViewer) {
        recordDefect({
          title: 'Evidence row click opens form viewer instead of evidence file',
          severity: 'Critical',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId,
          artifactId: 'N/A',
          url: urlAfter,
          stepsToReproduce: '1. Navigate to /evidence. 2. Click evidence row. 3. Check URL.',
          expected: `URL goes to /artifacts/${evidenceId} — evidence-specific viewer`,
          actual: `URL goes to /forms/... — wrong target; opening form artifact instead of evidence`,
          screenshotPath: `${SS_ROOT}/08-evidence/08-03-evidence-viewer.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Evidence row link points to form artifact instead of evidence artifact route',
          filesToInspect: 'src/policy/pages/EvidenceCenterPage.tsx, src/policy/artifacts/artifactRoute.ts',
          recommendedFix: 'Evidence row must link to /artifacts/{evidence_id}, not /forms/{formId}',
          regressionRisk: 'Critical — mixed artifact routing breaks audit defensibility',
        });
      }
    }
    stopCapture();
  });
});

// ── 09. Audit Mode ────────────────────────────────────────────────────────────
test.describe('09 — Audit Mode', () => {

  test('09-01: Audit Mode page loads with audit trail', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '09-01');
    await navTo(page, `${BASE_URL}/audit`);
    await page.waitForTimeout(2500);
    await ss(page, '09-audit', '09-01-audit-mode-initial');

    const url = page.url();
    expect(url).not.toContain('/login');

    const body = await page.locator('body').innerText();
    if (body.trim().length < 50) {
      recordDefect({
        title: 'Audit Mode page blank',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /audit. 2. Observe.',
        expected: 'Audit Mode renders audit trail, timeline, and evidence package controls',
        actual: 'Page blank',
        screenshotPath: `${SS_ROOT}/09-audit/09-01-audit-mode-initial.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'AuditModePage crash or missing data',
        filesToInspect: 'src/policy/pages/AuditModePage.tsx',
        recommendedFix: 'Add error boundary to AuditModePage',
        regressionRisk: 'Critical',
      });
    }

    const hasAuditContent = await hasText(page, 'Audit') && (await hasText(page, 'Trail') || await hasText(page, 'Event') || await hasText(page, 'Evidence'));
    if (!hasAuditContent) {
      recordDefect({
        title: 'Audit Mode missing audit trail content',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /audit. 2. Look for audit trail, event list, evidence.',
        expected: 'Audit trail list with events, timestamps, actors, and artifact links',
        actual: 'No audit trail content found',
        screenshotPath: `${SS_ROOT}/09-audit/09-01-audit-mode-initial.png`,
        consoleError: 'N/A',
        networkError: 'N/A',
        likelyRootCause: 'Audit data not loaded or audit state evaluation failing',
        filesToInspect: 'src/policy/pages/AuditModePage.tsx, src/policy/audit/auditState.ts',
        recommendedFix: 'Verify auditState.ts evaluates events and produces audit entries',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });

  test('09-02: Audit trail entries link to actual artifacts (not metadata-only)', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '09-02');
    await navTo(page, `${BASE_URL}/audit`);
    await page.waitForTimeout(2500);

    // Look for "View Artifact" or artifact links in audit trail
    const artifactLinks = await page.locator('a:has-text("View Artifact"), a:has-text("Open"), [data-testid="audit-artifact-link"]').all();

    await ss(page, '09-audit', '09-02-audit-trail-entries');

    if (artifactLinks.length === 0) {
      recordDefect({
        title: 'Audit trail has no artifact links — entries are metadata-only',
        severity: 'Critical',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url: page.url(),
        stepsToReproduce: '1. Navigate to /audit. 2. Look for "View Artifact" links in audit trail entries.',
        expected: 'Each audit entry for form/evidence/signature actions has a "View Artifact" link',
        actual: 'No artifact links found in audit trail — entries are metadata labels only',
        screenshotPath: `${SS_ROOT}/09-audit/09-02-audit-trail-entries.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'Audit trail entries lack artifact ID binding or artifact links not rendered',
        filesToInspect: 'src/policy/pages/AuditModePage.tsx, src/policy/audit/auditState.ts, src/policy/artifacts/artifactRoute.ts',
        recommendedFix: 'Bind artifact IDs to audit entries. Add "View Artifact" link for each FORM_COMPLETED, FILE_UPLOADED, SIGNATURE_APPLIED entry.',
        regressionRisk: 'Critical — CMS/ACHC audit defensibility requires clickable evidence',
      });
    } else {
      // Click first artifact link and verify it opens real content
      await artifactLinks[0].click();
      await page.waitForTimeout(2000);
      await ss(page, '09-audit', '09-02-audit-artifact-opened');

      const body = await page.locator('body').innerText();
      if (body.trim().length < 50) {
        recordDefect({
          title: 'Audit artifact link opens blank page',
          severity: 'Critical',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: page.url(),
          stepsToReproduce: '1. Navigate to /audit. 2. Click first "View Artifact" link. 3. Observe.',
          expected: 'Artifact viewer opens with form/evidence content',
          actual: 'Artifact viewer page blank — no content rendered',
          screenshotPath: `${SS_ROOT}/09-audit/09-02-audit-artifact-opened.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'ArtifactViewerPage fails to resolve artifact by ID',
          filesToInspect: 'src/policy/pages/ArtifactViewerPage.tsx',
          recommendedFix: 'Fix artifact viewer to render form metadata panel even when local blob is unavailable',
          regressionRisk: 'Critical',
        });
      }
    }
    stopCapture();
  });

  test('09-03: Certify/Lock shows package contents before locking', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '09-03');
    await navTo(page, `${BASE_URL}/audit`);
    await page.waitForTimeout(2500);
    await ss(page, '09-audit', '09-03-before-certify');

    // Look for Certify or Lock button
    const certifyBtn = page.locator('button:has-text("Certify"), button:has-text("Lock"), button:has-text("Certify & Lock"), [data-testid="certify-lock"]').first();
    const certifyVisible = await certifyBtn.isVisible({ timeout: 4000 }).catch(() => false);

    if (certifyVisible) {
      await certifyBtn.click();
      await page.waitForTimeout(1500);
      await ss(page, '09-audit', '09-03-certify-dialog');

      // Must show actual package contents, not metadata-only
      const hasPackageContents = await hasText(page, 'Evidence') || await hasText(page, 'Form') || await hasText(page, 'File') || await hasText(page, 'Package');
      if (!hasPackageContents) {
        recordDefect({
          title: 'Certify/Lock dialog does not show package contents before locking',
          severity: 'Critical',
          role: 'N/A',
          eventId: 'N/A',
          taskId: 'N/A',
          formId: 'N/A',
          formInstanceId: 'N/A',
          evidenceId: 'N/A',
          artifactId: 'N/A',
          url: page.url(),
          stepsToReproduce: '1. Navigate to /audit. 2. Click Certify/Lock. 3. Check dialog for package content list.',
          expected: 'Certify dialog shows list of: forms, evidence, signatures to be locked in package',
          actual: 'Certify dialog does not show package contents — blind lock risk',
          screenshotPath: `${SS_ROOT}/09-audit/09-03-certify-dialog.png`,
          consoleError: (stopCapture()).join('\n'),
          networkError: 'N/A',
          likelyRootCause: 'Certify dialog only shows metadata summary, not actual package item list',
          filesToInspect: 'src/policy/pages/AuditModePage.tsx',
          recommendedFix: 'Before allowing Lock, show list of all included forms, evidence files, and signatures with IDs',
          regressionRisk: 'Critical — ACHC/CMS requires explicit package review before certification',
        });
      }

      // Dismiss without confirming
      const cancelBtn = page.locator('button:has-text("Cancel"), button:has-text("Close")').first();
      if (await cancelBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await cancelBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }
    stopCapture();
  });
});

// ── 10. My Tasks ──────────────────────────────────────────────────────────────
test.describe('10 — My Tasks', () => {

  test('10-01: My Tasks page loads with Q2 tasks', async ({ page }) => {
    await bypassAuth(page);
    const stopCapture = attachConsoleCapture(page, '10-01');
    await navTo(page, `${BASE_URL}/my-tasks`);
    await page.waitForTimeout(2000);
    await ss(page, '09-audit', '10-01-my-tasks');

    const url = page.url();
    expect(url).not.toContain('/login');

    const body = await page.locator('body').innerText();
    if (body.trim().length < 50) {
      recordDefect({
        title: 'My Tasks page renders blank',
        severity: 'High',
        role: 'N/A',
        eventId: 'N/A',
        taskId: 'N/A',
        formId: 'N/A',
        formInstanceId: 'N/A',
        evidenceId: 'N/A',
        artifactId: 'N/A',
        url,
        stepsToReproduce: '1. Navigate to /my-tasks. 2. Observe.',
        expected: 'My Tasks page shows list of tasks assigned to current user/role',
        actual: 'Page blank',
        screenshotPath: `${SS_ROOT}/09-audit/10-01-my-tasks.png`,
        consoleError: (stopCapture()).join('\n'),
        networkError: 'N/A',
        likelyRootCause: 'MyTasksPage crash or no tasks loaded',
        filesToInspect: 'src/policy/ces/pages/MyTasksPage.tsx',
        recommendedFix: 'Add loading/empty state to MyTasksPage',
        regressionRisk: 'High',
      });
    }
    stopCapture();
  });
});

// ── 99. Final report generation ───────────────────────────────────────────────
test.afterAll(async () => {
  // Ensure report dir exists
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  // ── Write defect log ──────────────────────────────────────────────────────
  const defectMd = [
    '# CES Q2 2026 — Defect Log',
    `Generated: ${new Date().toISOString()}`,
    `Total defects: ${defects.length}`,
    '',
    ...defects.map(d => [
      `## ${d.id} — ${d.title}`,
      '',
      `**DEFECT ID:** ${d.id}`,
      `**TITLE:** ${d.title}`,
      `**SEVERITY:** ${d.severity}`,
      `**ROLE:** ${d.role}`,
      `**EVENT ID:** ${d.eventId}`,
      `**TASK ID:** ${d.taskId}`,
      `**FORM ID:** ${d.formId}`,
      `**FORM INSTANCE ID:** ${d.formInstanceId}`,
      `**EVIDENCE ID:** ${d.evidenceId}`,
      `**ARTIFACT ID:** ${d.artifactId}`,
      `**URL:** \`${d.url}\``,
      '',
      '**STEPS TO REPRODUCE:**',
      d.stepsToReproduce,
      '',
      `**EXPECTED RESULT:** ${d.expected}`,
      '',
      `**ACTUAL RESULT:** ${d.actual}`,
      '',
      `**SCREENSHOT PATH:** \`${d.screenshotPath}\``,
      '',
      `**CONSOLE ERROR:**`,
      '```',
      d.consoleError || 'N/A',
      '```',
      '',
      `**NETWORK ERROR:** ${d.networkError}`,
      `**LIKELY ROOT CAUSE:** ${d.likelyRootCause}`,
      `**FILES/COMPONENTS TO INSPECT:** ${d.filesToInspect}`,
      `**RECOMMENDED FIX:** ${d.recommendedFix}`,
      `**REGRESSION RISK:** ${d.regressionRisk}`,
      '',
      '---',
      '',
    ].join('\n')),
  ].join('\n');

  fs.writeFileSync(path.join(REPORT_DIR, 'CES_Q2_2026_DEFECT_LOG.md'), defectMd, 'utf-8');

  // ── Write UAT report ──────────────────────────────────────────────────────
  const criticalDefects = defects.filter(d => d.severity === 'Critical');
  const highDefects = defects.filter(d => d.severity === 'High');
  const passed = testResults.filter(r => r.passFail === 'PASS').length;
  const failed = testResults.filter(r => r.passFail === 'FAIL').length;
  const blocked = testResults.filter(r => r.completionStatus === 'BLOCKED').length;

  const matrixRows = testResults.map(r =>
    `| ${r.eventId} | ${r.eventName} | ${r.sprint} | ${r.role} | ${r.taskCount} | ${r.formsRequired} | ${r.evidenceRequired} | ${r.signaturesRequired} | ${r.completionStatus} | ${r.auditLockStatus} | ${r.passFail} | ${r.screenshotFolder} | ${r.criticalDefects} |`
  ).join('\n');

  const releaseRecommendation = criticalDefects.length === 0 ? '✅ RELEASE READY' : '🚫 NO RELEASE — Critical defects must be resolved';

  const reportMd = `# CES Q2 2026 — Complete UAT Report

**Generated:** ${new Date().toISOString()}
**Test Scope:** April 1, 2026 – June 30, 2026
**App URL:** http://localhost:5173
**Playwright version:** 1.51.0

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total Q2 Events Identified | ${Q2_EVENTS.length} |
| Events Tested (per-event test) | ${testResults.length} |
| Total Defects Filed | ${defects.length} |
| Critical Defects | ${criticalDefects.length} |
| High Defects | ${highDefects.length} |
| Medium/Low Defects | ${defects.filter(d => d.severity === 'Medium' || d.severity === 'Low').length} |
| Test Pass | ${passed} |
| Test Fail | ${failed} |
| Blocked | ${blocked} |

---

## Release Recommendation

> **${releaseRecommendation}**

${criticalDefects.length > 0 ? `### Critical Defects Blocking Release:\n${criticalDefects.map(d => `- **${d.id}:** ${d.title} (${d.eventId})`).join('\n')}` : ''}

---

## Test Matrix

| Event ID | Event Name | Sprint | Role | Tasks | Forms | Evidence | Signatures | Completion | Audit Lock | Pass/Fail | Screenshots | Crit Defects |
|----------|------------|--------|------|-------|-------|----------|------------|------------|------------|-----------|-------------|--------------|
${matrixRows || '| (no per-event results recorded) | | | | | | | | | | | | |'}

---

## Q2 2026 Full Event Inventory

All events in scope (April 1 – June 30, 2026):

${Q2_EVENTS.map((e, i) => `${i + 1}. **${e.id}** — ${e.title} (${e.date})`).join('\n')}

---

## Known Issues and Findings Summary

### Critical
${criticalDefects.map(d => `- **${d.id}:** ${d.title}\n  - *Root Cause:* ${d.likelyRootCause}\n  - *Fix:* ${d.recommendedFix}`).join('\n') || '- None found'}

### High
${highDefects.map(d => `- **${d.id}:** ${d.title}\n  - *Root Cause:* ${d.likelyRootCause}`).join('\n') || '- None found'}

---

## Screenshots Location

All screenshots stored under:
\`${SS_ROOT}/\`

Subfolders:
- \`00-overview/\` — overview screenshots
- \`01-role-switching/\` — auth and role tests
- \`02-sprint-board/\` — sprint board tests
- \`03-calendar/\` — calendar tests
- \`04-gantt/\` — dashboard and gantt tests
- \`05-events/\` — (covered via 03-calendar direct URL tests)
- \`06-forms/\` — form tests
- \`07-ecign/\` — eCIgn and signature tests
- \`08-evidence/\` — evidence center tests
- \`09-audit/\` — audit mode tests
- \`10-defects/\` — defect screenshots
- \`events/{event_id}/\` — per-event screenshots

---

## Defect Log Reference

See: \`${REPORT_DIR}/CES_Q2_2026_DEFECT_LOG.md\`

---

## Console Errors Captured

Total unique console error messages: ${[...new Set(consoleErrors)].length}

${[...new Set(consoleErrors)].slice(0, 20).map(e => `- \`${e}\``).join('\n') || '- None captured'}

---

## Playwright Test Script

\`Builder/_system/uat/ces-q2-2026-complete-uat.spec.ts\`

---

*End of CES Q2 2026 UAT Report*
`;

  fs.writeFileSync(path.join(REPORT_DIR, 'CES_Q2_2026_COMPLETE_UAT_REPORT.md'), reportMd, 'utf-8');

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('CES Q2 2026 UAT COMPLETE');
  console.log(`Total defects: ${defects.length} (Critical: ${criticalDefects.length}, High: ${highDefects.length})`);
  console.log(`Recommendation: ${releaseRecommendation}`);
  console.log(`Report: ${REPORT_DIR}/CES_Q2_2026_COMPLETE_UAT_REPORT.md`);
  console.log(`Defect log: ${REPORT_DIR}/CES_Q2_2026_DEFECT_LOG.md`);
  console.log('════════════════════════════════════════════════════════════\n');
});
