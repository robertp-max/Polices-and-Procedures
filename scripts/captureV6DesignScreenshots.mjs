/**
 * Playwright script to capture screenshots of the 17 Phase 12.2.a states in docs/v6/V6_DESIGN.html.
 * Saves screenshots to REVIEW_OUTPUTS/v6-phase-12-2a-runtime-reference/
 *
 * Usage:
 *   node scripts/captureV6DesignScreenshots.mjs
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const HTML_FILE = 'file:///' + path.resolve('docs/v6/V6_DESIGN.html').replace(/\\/g, '/');
const OUT_DIR = path.resolve('REVIEW_OUTPUTS/v6-phase-12-2a-runtime-reference');

fs.mkdirSync(OUT_DIR, { recursive: true });

const VIEWPORT = { width: 1280, height: 800 };

const SCENARIOS = [
  {
    name: '01-journey-supervisor-picker',
    hash: 'supervisor',
    setup: async (page) => {
      // Close the visit logging drawer first
      await page.click('button:has-text("Cancel")');
      await page.waitForTimeout(600);
      await page.waitForSelector('text=Learner roster');
    }
  },
  {
    name: '02-journey-supervisor-drawer',
    hash: 'supervisor',
    setup: async (page) => {
      // Open by default, wait for its title
      await page.waitForSelector('text=Log supervised checkoff');
    }
  },
  {
    name: '03-journey-signature-overlay',
    hash: 'appendix-f',
    setup: async (page) => {
      // Open by default, wait for its title
      await page.waitForSelector('text=Draw Appendix F signature');
    }
  },
  {
    name: '04-journey-toc-state',
    hash: 'appendix-f',
    setup: async (page) => {
      // Close signature overlay first
      await page.click('button:has-text("Close overlay")');
      await page.waitForTimeout(600);
      await page.waitForSelector('text=Contents');
    }
  },
  {
    name: '05-module-player-failure',
    hash: 'module-player',
    setup: async (page) => {
      await page.waitForSelector('text=Remediation review required');
    }
  },
  {
    name: '06-journey-admin-builder',
    hash: 'journey-admin',
    setup: async (page) => {
      await page.waitForSelector('text=RN onboarding syllabus');
    }
  },
  {
    name: '07-workflows-detail-drawer',
    hash: 'workflows',
    setup: async (page) => {
      // Open by default
      await page.waitForSelector('text=QAPI quarterly board review');
    }
  },
  {
    name: '08-swimlane-card-modal',
    hash: 'workflow-swimlane',
    setup: async (page) => {
      // Open by default
      await page.waitForSelector('text=Route chair signature');
    }
  },
  {
    name: '09-onboarding-v2-batch-expander',
    hash: 'onboarding-v2-batch',
    setup: async (page) => {
      await page.waitForSelector('text=SystemAccessClearance checklist');
    }
  },
  {
    name: '10-onboarding-v2-batch-tabs',
    hash: 'onboarding-v2-batch',
    setup: async (page) => {
      await page.waitForSelector('text=Unit evidence detail');
    }
  },
  {
    name: '11-onboarding-v2-governance-override',
    hash: 'onboarding-v2-governance',
    setup: async (page) => {
      await page.waitForSelector('text=Request compliance override');
    }
  },
  {
    name: '12-calendar-agenda-view',
    hash: 'master-calendar',
    setup: async (page) => {
      await page.waitForSelector('text=SOC coverage review');
    }
  },
  {
    name: '13-staffing-conflict-drawer',
    hash: 'staffing-calendar',
    setup: async (page) => {
      await page.waitForSelector('text=Resolve staffing conflict');
    }
  },
  {
    name: '14-ces-calendar-flowchart',
    hash: 'ces-calendar',
    setup: async (page) => {
      // Click Q2 QAPI quarterly review event to trigger the swimlane detail
      await page.click('button[data-calendar-event="Q2 QAPI quarterly review"]');
      await page.waitForTimeout(600);
    }
  },
  {
    name: '15-document-preview-toolbar',
    hash: 'artifact-viewer',
    setup: async (page) => {
      await page.waitForSelector('text=Artifact package preview');
    }
  },
  {
    name: '16-ecign-mobile-signature',
    hash: 'ecign-workspace',
    setup: async (page) => {
      await page.waitForSelector('text=Draw eCIgn signature');
    }
  },
  {
    name: '17-admin-users-matrix',
    hash: 'admin-users',
    setup: async (page) => {
      await page.waitForSelector('text=permission overrides');
    }
  }
];

async function main() {
  console.log(`[Screenshot Tool] Opening simulator: ${HTML_FILE}`);
  console.log(`[Screenshot Tool] Output directory: ${OUT_DIR}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  for (const s of SCENARIOS) {
    const page = await context.newPage();
    const targetUrl = `${HTML_FILE}#${s.hash}`;
    console.log(`\nCapturing ${s.name} from ${targetUrl} ...`);
    
    try {
      await page.goto(targetUrl, { waitUntil: 'load', timeout: 30000 });
      await page.waitForTimeout(1000); // wait for React render
      
      // Perform scenario setup
      await s.setup(page);
      await page.waitForTimeout(500); // stability delay
      
      const fp = path.join(OUT_DIR, `${s.name}.png`);
      await page.screenshot({ path: fp });
      
      console.log(`  ✓ Wrote ${path.basename(fp)}`);
    } catch (err) {
      console.error(`  ✕ Failed to capture ${s.name}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n[Screenshot Tool] Done. All screenshots saved.');
}

main().catch((err) => {
  console.error('[Screenshot Tool] Fatal error:', err);
  process.exit(1);
});
