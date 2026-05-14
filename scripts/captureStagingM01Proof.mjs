import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = process.env.M01_BASE_URL || 'http://localhost:5173';
const TARGET = `${BASE_URL}/journey/staging/m01`;
const OUT_DIR = path.resolve(
  process.cwd(),
  'Builder/_system/screenshots/m01-story-continuity-proof'
);

async function exists(locator) {
  try {
    return await locator.isVisible({ timeout: 300 });
  } catch {
    return false;
  }
}

function sanitize(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

async function capture() {
  await fs.mkdir(OUT_DIR, { recursive: true });

  // Clean old screenshots
  const oldFiles = await fs.readdir(OUT_DIR);
  for (const f of oldFiles) {
    if (f.endsWith('.png')) await fs.unlink(path.join(OUT_DIR, f));
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.goto(TARGET, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  let frame = 0;
  const saveShot = async (label) => {
    frame += 1;
    const name = `${String(frame).padStart(3, '0')}--${sanitize(label)}.png`;
    await page.screenshot({ path: path.join(OUT_DIR, name) });
  };

  await saveShot('splash');

  // Click "Begin" button on splash
  const beginBtn = page.getByRole('button', { name: /^Begin$/i });
  if (await exists(beginBtn)) {
    await beginBtn.click();
    await page.waitForTimeout(600);
  }

  let prevCounter = '';
  let stuckCount = 0;
  const maxSteps = 200;

  for (let step = 0; step < maxSteps; step += 1) {
    // Read current slide counter (e.g. "05 / 74")
    const counterText = (await page.locator('header p.font-mono').first().textContent())?.trim() || '';
    const titleText =
      (await page.locator('h1, h2, h3, h4').first().textContent())?.trim() ||
      'scene';

    await saveShot(`${counterText || 'xx-xx'}-${titleText}`);

    // Detect stuck (same counter 3 times in a row → break)
    if (counterText === prevCounter) {
      stuckCount++;
      if (stuckCount >= 3) {
        console.log(`Stuck at ${counterText} for 3 iterations, stopping.`);
        break;
      }
    } else {
      stuckCount = 0;
      prevCounter = counterText;
    }

    // Certificate = done
    if (await exists(page.getByText(/Certificate of Completion/i))) {
      await saveShot('certificate-complete');
      break;
    }

    // Summary page: screenshot and stop (do NOT click retake — that loops)
    const retakeBtn = page.getByRole('button', { name: /Retake Final Assessment/i });
    if (await exists(retakeBtn)) {
      await saveShot('summary-fail-final');
      break;
    }

    // Challenge flow: select first option, click Confirm, then Continue
    const confirmBtn = page.getByRole('button', { name: /^Confirm$/i });
    if (await exists(confirmBtn)) {
      const optionBtn = page.locator('button.text-left').first();
      if (await exists(optionBtn)) {
        await optionBtn.click();
        await page.waitForTimeout(200);
      }
      await confirmBtn.click();
      await page.waitForTimeout(400);

      // After confirming, look for Continue button
      const continueBtn = page.getByRole('button', { name: /^Continue$/i });
      if (await exists(continueBtn)) {
        await saveShot(`${counterText}-answered`);
        await continueBtn.click();
        await page.waitForTimeout(500);
        continue;
      }
    }

    // Generic continue / enter story buttons
    const continueLabels = [
      /Enter Marites' Story/i,
      /Continue with Marites/i,
      /Continue Journey/i,
      /Continue →/i,
      /^Continue$/i,
      /Get Certificate/i,
    ];
    let advanced = false;
    for (const rx of continueLabels) {
      const btn = page.getByRole('button', { name: rx }).first();
      if (await exists(btn)) {
        await btn.click();
        await page.waitForTimeout(500);
        advanced = true;
        break;
      }
    }
    if (advanced) continue;

    // Default: press right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(600);
  }

  await browser.close();
  console.log(`Screenshots saved to: ${OUT_DIR}`);
  console.log(`Total frames captured: ${frame}`);
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
