import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto("http://localhost:5173/dashboard", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  console.log("=== BODY CLASS ===");
  console.log(await page.locator("body").getAttribute("class"));
  console.log("=== DASHBOARD WHITE CONTAINERS ===");
  const whites = await page.locator("div[class*=\"bg-white\"][class*=\"rounded\"]").all();
  console.log("Found " + whites.length + " potential containers");
  for (let i = 0; i < Math.min(2, whites.length); i++) {
    const cls = await whites[i].getAttribute("class");
    console.log("Container " + i + " class: " + cls);
    const html = await whites[i].innerHTML();
    console.log("HTML snippet: " + html.substring(0, 3000));
  }
  await page.screenshot({ path: "current-dashboard.png" });
  console.log("Screenshot saved to current-dashboard.png");
  await browser.close();
})().catch(console.error);