import { chromium } from "playwright";
import fs from "fs";
import path from "path";
const base = "http://localhost:5173";
const outDir = path.join(process.cwd(), "tmp-screenshots");
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const pages = [
  {url: "/", name: "root-login"},
  {url: "/ces/calendar", name: "ces-calendar-final"},
  {url: "/journey", name: "journey-overview-final"},
  {url: "/journey/v1-journey", name: "journey-v1-final"}
];
for (const p of pages) {
  console.log("Capturing " + p.url);
  await page.goto(base + p.url, { waitUntil: "domcontentloaded", timeout: 30000 }).catch(()=>{});
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, p.name + ".png"), fullPage: true });
}
await browser.close();
console.log("Done.");
