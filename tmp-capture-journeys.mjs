import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
const base = 'http://localhost:5173';
const outDir = path.join(process.cwd(), 'tmp-screenshots');
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const pages = [
  {url: '/journey', name: 'journey-overview'},
  {url: '/journey/v1-journey', name: 'journey-v1'}
];
for (const p of pages) {
  console.log('Capturing ' + p.name);
  await page.goto(base + p.url, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(2500);
  const fp = path.join(outDir, p.name + '.png');
  await page.screenshot({ path: fp, fullPage: true });
}
await browser.close();
console.log('Journey screenshots saved.');
