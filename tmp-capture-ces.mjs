import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const base = 'http://localhost:5173';
const outDir = path.join(process.cwd(), 'tmp-screenshots');
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const captures = [
  { url: '/journey', name: 'journey-overview' },
  { url: '/journey/v1-journey', name: 'journey-v1-journey' },
  { url: '/ces/calendar', name: 'ces-calendar' },
];

for (const { url, name } of captures) {
  const fullUrl = base + url;
  console.log('Capturing ' + fullUrl + ' -> ' + name + '.png');
  try {
    await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 60000 });
  } catch (e) {
    await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  }
  await page.waitForTimeout(3500);  // allow rendering of subnav, lists, dynamic content
  const fp = path.join(outDir, name + '.png');
  await page.screenshot({ path: fp, fullPage: true });
  console.log('  Saved: ' + fp);
}

await browser.close();
console.log('All captures complete for journey, v1-journey, ces/calendar.');
