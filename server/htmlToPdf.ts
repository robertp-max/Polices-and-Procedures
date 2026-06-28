import { log } from './logger.js';

/**
 * Render a standalone HTML document to a Letter-size PDF buffer using Playwright.
 *
 * IMPORTANT: PDF rendering is OPT-IN (env PDF_RENDER_ENABLED=true). When off — the
 * default — this returns null immediately and callers save HTML. This keeps the
 * Drive save path reliable: a missing/slow headless browser can NEVER hang or
 * break a save. Even when enabled, the whole attempt is time-boxed and any
 * failure falls back to null (→ HTML).
 */
const ENABLED = () => process.env.PDF_RENDER_ENABLED === 'true';
const BUDGET_MS = Number(process.env.PDF_RENDER_TIMEOUT_MS || 12000);

export function pdfRenderEnabled(): boolean { return ENABLED(); }

export async function htmlToPdf(html: string): Promise<Buffer | null> {
  if (!ENABLED()) return null; // default: callers save HTML — save path never blocks on a browser
  return Promise.race([
    renderOnce(html),
    new Promise<null>((res) => setTimeout(() => { log.warn('pdf.render.timeout', { budgetMs: BUDGET_MS }); res(null); }, BUDGET_MS)),
  ]);
}

async function renderOnce(html: string): Promise<Buffer | null> {
  let browser: import('playwright').Browser | null = null;
  try {
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], timeout: 8000 });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 8000 });
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(200);
    const pdf = await page.pdf({ printBackground: true, preferCSSPageSize: true, format: 'Letter' });
    return Buffer.from(pdf);
  } catch (e) {
    log.warn('pdf.render.unavailable', { error: e instanceof Error ? e.message : String(e) });
    return null;
  } finally {
    if (browser) { try { await browser.close(); } catch { /* ignore */ } }
  }
}
