const { chromium } = require('playwright');
const path = require('path');
const outDir = path.join(process.cwd(), 'LVN_PORT_EVIDENCE');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mods = ['LVN-001','LVN-002','LVN-003','LVN-004','LVN-005','LVN-006','LVN-007','LVN-008','LVN-009','LVN-010','LVN-011','LVN-012','LVN-SUP'];
  for (const id of mods) {
    await page.goto(`http://localhost:5180/journey/module/${id}`, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, `${id}-landing.png`), fullPage: false });
    console.log('shot', id);
  }
  // Academy path
  await page.goto('http://localhost:5180/journey?tab=onboarding', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(outDir, 'journey-onboarding.png'), fullPage: false });
  // Compliance / packets smoke if routes exist
  for (const [name, url] of [['home','http://localhost:5180/'], ['journey-home','http://localhost:5180/journey?tab=home']]) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
      console.log('shot', name);
    } catch (e) { console.log('skip', name, e.message); }
  }
  // Quiz: try click Start Quiz if present on LVN-001
  await page.goto('http://localhost:5180/journey/module/LVN-001', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(1000);
  const quizBtn = page.getByRole('button', { name: /quiz|assessment|start/i }).first();
  if (await quizBtn.count()) {
    try {
      await quizBtn.click({ timeout: 3000 });
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(outDir, 'LVN-001-quiz-attempt.png'), fullPage: false });
      console.log('shot quiz');
    } catch (e) { console.log('quiz click fail', e.message); }
  }
  await browser.close();
  console.log('DONE');
})().catch((e) => { console.error(e); process.exit(1); });
