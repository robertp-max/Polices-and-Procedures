import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } });

await page.goto('http://127.0.0.1:4176/events/oig_sam_exclusion_check-20260505-01/swimlane?workflowId=CO-WF-15', { waitUntil: 'networkidle' });
const cards = page.locator('button.swimlane-card');
await cards.first().waitFor({ state: 'visible', timeout: 20000 });
console.log('cardCount', await cards.count());
console.log('firstCard', (await cards.first().textContent())?.replace(/\s+/g, ' ').trim());
await cards.first().click();
await page.waitForTimeout(1500);
console.log('dialogCount', await page.locator('[role="dialog"]').count());
console.log('taskInstructionsVisible', await page.locator('text=Task Instructions').first().isVisible().catch(() => false));
console.log('dialogText', (await page.locator('[role="dialog"]').last().textContent())?.replace(/\s+/g, ' ').trim().slice(0, 1200));
console.log('bodyText', (await page.locator('body').textContent())?.replace(/\s+/g, ' ').trim().slice(0, 1200));
await page.screenshot({ path: 'Builder/_system/debug-swimlane-click.png', fullPage: true });
await browser.close();
