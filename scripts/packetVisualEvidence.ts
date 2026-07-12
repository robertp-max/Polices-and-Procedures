import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import { buildQapiPacketModel } from '@/policy/packets/qapi/buildQapiPacketModel';
import { renderPacketModel } from '@/policy/packets/render/renderPacketModel';
import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS,
  QAPI_FIXTURE_PATHS,
} from '@/policy/packets/testing/loadQapiFixture';

const OUTPUT_DIR = resolve(process.cwd(), 'output/packets/visual-qa');

type EvidenceMode =
  | 'html-fallback'
  | 'playwright-screenshots'
  | 'playwright-unavailable-fallback';

type PageEvidence = {
  readonly pageNumber: number;
  readonly moduleId: string;
  readonly htmlFile: string;
  readonly imageFile: string | null;
};

type EvidenceManifest = {
  readonly packetId: string;
  readonly datasetId: string;
  readonly generatedAt: string;
  readonly mode: EvidenceMode;
  readonly renderEnabled: boolean;
  readonly pageCount: number;
  readonly pages: readonly PageEvidence[];
  readonly note: string | null;
};

type RenderedPage = {
  readonly pageNumber: number;
  readonly moduleId: string;
  readonly html: string;
};

async function main(): Promise<void> {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const fixtureText = loadQapiFixture(QAPI_FIXTURE_PATHS.q1);
  const model = buildQapiPacketModel({
    parsed: parseSourceFile({
      fileName: 'QAPI-Q1-DS-001.txt',
      mimeType: 'text/plain',
      byteLength: Buffer.byteLength(fixtureText, 'utf8'),
      text: fixtureText,
    }),
    eventDateISO: Q1_FIXTURE_EXPECTATIONS.meetingDate,
    targetAgency: Q1_FIXTURE_EXPECTATIONS.agency,
    targetDatasetId: Q1_FIXTURE_EXPECTATIONS.datasetId,
    targetPeriod: Q1_FIXTURE_EXPECTATIONS.quarter,
    sourceId: Q1_FIXTURE_EXPECTATIONS.datasetId,
    generatedAt: '2026-04-09T00:00:00.000Z',
  });
  const html = renderPacketModel(model);
  const pages = extractRenderedPages(html);
  const headHtml = extractHeadHtml(html);

  writeFileSync(resolve(OUTPUT_DIR, 'qapi-q1-rendered.html'), html, 'utf8');

  const pageEvidence = pages.map((page) => {
    const htmlFile = `page-${String(page.pageNumber).padStart(2, '0')}.html`;
    writeFileSync(
      resolve(OUTPUT_DIR, htmlFile),
      renderStandalonePage(headHtml, page.html),
      'utf8',
    );
    return {
      pageNumber: page.pageNumber,
      moduleId: page.moduleId,
      htmlFile,
      imageFile: null,
    } satisfies PageEvidence;
  });

  const renderEnabled = isPdfRenderEnabled();
  const screenshotResult = renderEnabled
    ? await writePlaywrightScreenshots(html, pageEvidence)
    : {
      mode: 'html-fallback' as const,
      pages: pageEvidence,
      note: 'PDF_RENDER_ENABLED is not set; wrote rendered HTML pages as fallback visual evidence.',
    };

  const manifest: EvidenceManifest = {
    packetId: model.identity.packetId,
    datasetId: Q1_FIXTURE_EXPECTATIONS.datasetId,
    generatedAt: '2026-04-09T00:00:00.000Z',
    mode: screenshotResult.mode,
    renderEnabled,
    pageCount: pages.length,
    pages: screenshotResult.pages,
    note: screenshotResult.note,
  };

  writeFileSync(
    resolve(OUTPUT_DIR, 'manifest.json'),
    `${JSON.stringify(manifest, null, 2)}\n`,
    'utf8',
  );

  console.log(
    `packetVisualEvidence: wrote ${String(pages.length)} page HTML file(s) to ${OUTPUT_DIR} (${manifest.mode})`,
  );
}

async function writePlaywrightScreenshots(
  html: string,
  pageEvidence: readonly PageEvidence[],
): Promise<{
  readonly mode: EvidenceMode;
  readonly pages: readonly PageEvidence[];
  readonly note: string | null;
}> {
  try {
    const { chromium } = await import('playwright');
    const browser = await chromium.launch({ headless: true });
    try {
      const page = await browser.newPage({
        viewport: { width: 900, height: 1200 },
        deviceScaleFactor: 1,
      });
      await page.setContent(html, { waitUntil: 'load' });
      await page.screenshot({
        path: resolve(OUTPUT_DIR, 'qapi-q1-rendered-full.png'),
        fullPage: true,
      });

      const pageLocator = page.locator('.pg');
      const pageCount = await pageLocator.count();
      const pagesWithImages: PageEvidence[] = [];
      for (let index = 0; index < pageCount; index += 1) {
        const existing = pageEvidence[index];
        if (!existing) {
          throw new Error(`Playwright rendered page ${String(index + 1)} without matching HTML evidence.`);
        }
        const imageFile = `page-${String(existing.pageNumber).padStart(2, '0')}.png`;
        await pageLocator.nth(index).screenshot({ path: resolve(OUTPUT_DIR, imageFile) });
        pagesWithImages.push({ ...existing, imageFile });
      }

      if (pagesWithImages.length !== pageEvidence.length) {
        throw new Error(
          `Playwright page count ${String(pagesWithImages.length)} did not match HTML page count ${String(pageEvidence.length)}.`,
        );
      }

      return {
        mode: 'playwright-screenshots',
        pages: pagesWithImages,
        note: null,
      };
    } finally {
      await browser.close();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      mode: 'playwright-unavailable-fallback',
      pages: pageEvidence,
      note: `Playwright screenshot capture was requested but unavailable: ${message}`,
    };
  }
}

function extractRenderedPages(html: string): RenderedPage[] {
  return [...html.matchAll(/(<section class="[^"]*" data-module-id="([^"]+)" data-page-number="(\d+)">[\s\S]*?<\/section>)/gu)]
    .map((match): RenderedPage => ({
      html: match[1] ?? '',
      moduleId: match[2] ?? 'UNKNOWN — NOT RECOVERED',
      pageNumber: Number(match[3]),
    }));
}

function extractHeadHtml(html: string): string {
  return /<head>([\s\S]*?)<\/head>/u.exec(html)?.[1] ?? '<meta charset="utf-8"><title>QAPI Visual Evidence</title>';
}

function renderStandalonePage(headHtml: string, pageHtml: string): string {
  return `<!doctype html><html><head>${headHtml}</head><body>${pageHtml}</body></html>`;
}

function isPdfRenderEnabled(): boolean {
  const raw = process.env.PDF_RENDER_ENABLED?.trim().toLowerCase();
  return raw === '1' || raw === 'true' || raw === 'yes';
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
