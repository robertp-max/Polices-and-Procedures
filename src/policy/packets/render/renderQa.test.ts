// @vitest-environment node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { parseSourceFile } from '@/policy/evidence/intake/fileParsing';
import type { PacketClassification, PacketModel, PacketModuleId } from '@/policy/packets/contracts';
import { buildQapiPacketModel } from '@/policy/packets/qapi/buildQapiPacketModel';
import {
  loadQapiFixture,
  Q1_FIXTURE_EXPECTATIONS,
  QAPI_FIXTURE_PATHS,
} from '@/policy/packets/testing/loadQapiFixture';

import { SYNTHETIC_UAT_WATERMARK } from './chrome';
import { renderPacketModel } from './renderPacketModel';

type VisualQaBaseline = {
  readonly fixtureId: string;
  readonly approvedDesign: string;
  readonly expectedModuleOrder: readonly PacketModuleId[];
  readonly analysisModuleIds: readonly PacketModuleId[];
  readonly formModuleIds: readonly PacketModuleId[];
  readonly attachmentReferenceIds: readonly string[];
};

type RenderedSection = {
  readonly className: string;
  readonly moduleId: PacketModuleId;
  readonly pageNumber: number;
  readonly html: string;
};

const baseline = readVisualQaBaseline();

describe('WP-4.8 rendering QA structural checks', () => {
  it('renders the approved Q1 outline/bookmark hierarchy with correct page numbers and no blank pages', () => {
    const { html } = renderQ1Packet();
    const sections = extractRenderedSections(html);
    const styleText = extractStyleText(html);

    expect(baseline.fixtureId).toBe(Q1_FIXTURE_EXPECTATIONS.datasetId);
    expect(baseline.approvedDesign).toBe('care-indeed-letter-qapi-analytical-v1');
    expect(styleText).toContain('@page{size:letter;margin:0;}');
    expect(styleText).toContain('.pg-cover-head{display:flex;align-items:flex-start;justify-content:space-between;');
    expect(styleText).toContain('.cover-meta{text-align:right;');
    expect(styleText).toContain('font-family:Roboto,Arial,sans-serif;font-size:13px;font-weight:300;');
    expect(styleText).toContain('.pg-foot{margin-top:auto;border-top:0;padding-top:16px;display:flex;justify-content:space-between;gap:18px;font-family:Roboto,Arial,sans-serif;font-size:11px;font-weight:300;');
    expect(styleText).toContain('.rule{width:138px;height:4px;background:linear-gradient');
    expect(styleText).toContain('@media print{@page{size:letter;margin:.5in .72in;}');
    expect(styleText).toContain('.pg{width:auto;min-height:0;margin:0;display:block;break-after:page;page-break-after:always;overflow:visible;');
    expect(styleText).toContain('.print-running-footer{display:flex;position:fixed;bottom:.18in;');
    expect(countMatches(html, /<div class="accent-rail"><span><\/span><span><\/span><\/div>/gu)).toBe(
      0,
    );
    expect(countMatches(html, /src="\/ci-logo-packet-cover\.png"/gu)).toBe(1);
    expect(countMatches(html, /class="print-running-footer"/gu)).toBe(1);
    expect(html).toContain('QAPI Committee Packet');
    expect(html).toContain('Care Indeed Home Health Care, Inc.');
    expect(sections).toHaveLength(baseline.expectedModuleOrder.length);
    expect(sections.map((section) => section.moduleId)).toStrictEqual(baseline.expectedModuleOrder);
    expect(sections.map((section) => section.pageNumber)).toStrictEqual(
      baseline.expectedModuleOrder.map((_, index) => index + 1),
    );

    for (const section of sections) {
      expect(section.html).toContain(`Page ${String(section.pageNumber)} of ${String(sections.length)}`);
      expect(section.html).toMatch(/<h2 class="pg-h">[^<]+<\/h2>/u);
      expect(section.html).toMatch(/<(?:div class="panel|table class="data-table"|article class="kpi-card"|p class="p")/u);
      expect(stripHtml(section.html).replace(/\s+/g, ' ').trim().length).toBeGreaterThan(140);
    }

    expect(html).not.toContain('data-page-number="0"');
    expect(html).not.toMatch(/<section class="pg"[^>]*>\s*<\/section>/u);
  });

  it('preserves repeated table headers, accessible chart tables, and anti-clipping styles', () => {
    const { html } = renderQ1Packet();
    const styleText = extractStyleText(html);
    const kpiSection = findSection(extractRenderedSections(html), 'qapi-rich-kpi-dashboard');
    const tables = extractElements(html, 'table', 'data-table');
    const chartSvgMatches = [...kpiSection.html.matchAll(/<svg role="img"[\s\S]*?<\/svg>/gu)];
    const chartPanelCount = countMatches(kpiSection.html, /<div class="panel kpi-chart-(?:panel|unknown)">/gu);

    expect(styleText).toContain('.data-table thead{display:table-header-group;}');
    expect(styleText).toContain('.data-table{width:100%;border-collapse:collapse;');
    expect(styleText).toContain('break-inside:auto;page-break-inside:auto;');
    expect(styleText).toContain('.kpi-chart-panel svg{display:block;width:100%;height:auto;');
    expect(tables.length).toBeGreaterThan(20);

    for (const table of tables) {
      expect(table).toContain('<thead><tr>');
      expect(table).toContain('</thead><tbody>');
      expect(countMatches(table, /<th>/gu)).toBeGreaterThan(0);
    }

    expect(chartPanelCount).toBeGreaterThan(5);
    expect(chartSvgMatches.length).toBeGreaterThan(0);
    for (const svgMatch of chartSvgMatches) {
      expect(svgMatch[0]).toContain('viewBox="0 0 ');
      const followingPanelSlice = kpiSection.html.slice((svgMatch.index ?? 0) + svgMatch[0].length, (svgMatch.index ?? 0) + svgMatch[0].length + 5000);
      expect(followingPanelSlice).toContain('<table class="data-table">');
    }
    expect(countMatches(kpiSection.html, /<div class="panel kpi-chart-unknown">/gu)).toBeGreaterThan(0);
    expect(kpiSection.html).toContain('UNKNOWN');
  });

  it('keeps headings non-orphaned and form sections on explicit new pages', () => {
    const { html } = renderQ1Packet();
    const styleText = extractStyleText(html);
    const sections = extractRenderedSections(html);

    expect(styleText).toContain('h1,h2,h3,.no-orphan{break-after:avoid;page-break-after:avoid;}');
    expect(styleText).toContain('.form-page{break-before:page;page-break-before:always;}');

    for (const section of sections) {
      const afterHeading = section.html.split('<div class="rule"></div>')[1] ?? '';
      const beforeFooter = afterHeading.split('<div class="pg-foot">')[0] ?? '';
      expect(beforeFooter).toMatch(/<(?:div class="panel|article class="kpi-card"|table class="data-table"|p class="p"|[uo]l class="list")/u);
    }

    for (const formModuleId of baseline.formModuleIds) {
      const section = findSection(sections, formModuleId);
      expect(section.className.split(/\s+/u)).toContain('form-page');
    }
  });

  it('renders synthetic and confidential watermarks only when the packet classification requires them', () => {
    const { html: syntheticHtml, model } = renderQ1Packet();
    const confidentialHtml = renderPacketModel(withClassification(model, 'confidential'));
    const internalHtml = renderPacketModel(withClassification(model, 'internal'));

    expect(syntheticHtml).toContain(SYNTHETIC_UAT_WATERMARK);
    expect(extractElements(syntheticHtml, 'div', 'watermark').length).toBeGreaterThan(0);
    expect(extractElements(syntheticHtml, 'div', 'synthetic-banner').length).toBeGreaterThan(0);

    expect(confidentialHtml).toContain('<div class="watermark">CONFIDENTIAL</div>');
    expect(confidentialHtml).toContain('CONFIDENTIAL');
    expect(confidentialHtml).not.toContain('<div class="synthetic-banner">');

    expect(internalHtml).not.toContain('<div class="watermark">');
    expect(internalHtml).not.toContain('<div class="synthetic-banner">');
  });

  it('resolves attachment references against rendered packet pages and keeps analysis before forms', () => {
    const { html } = renderQ1Packet();
    const sections = extractRenderedSections(html);
    const moduleIndexById = new Map(sections.map((section, index) => [section.moduleId, index]));
    const firstFormIndex = Math.min(...baseline.formModuleIds.map((moduleId) => pageIndex(moduleIndexById, moduleId)));
    const lastAnalysisIndex = Math.max(...baseline.analysisModuleIds.map((moduleId) => pageIndex(moduleIndexById, moduleId)));

    expect(lastAnalysisIndex).toBeLessThan(firstFormIndex);

    const manifest = findSection(sections, 'qapi-attachment-manifest');
    for (const referenceId of baseline.attachmentReferenceIds) {
      expect(manifest.html).toContain(referenceId);
      expect(countMatches(html, new RegExp(escapeRegExp(referenceId), 'gu'))).toBeGreaterThan(1);
    }

    expect(findSection(sections, 'qapi-confidential-personnel-review-addendum-reference').html).toContain(
      'Confidential Personnel Action Addendum — REFERENCE ONLY',
    );
  });
});

function renderQ1Packet(): { html: string; model: PacketModel } {
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

  return { html: renderPacketModel(model), model };
}

function withClassification(model: PacketModel, classification: PacketClassification): PacketModel {
  return {
    ...model,
    classification,
    handlingNotice: classification === 'synthetic-uat' ? model.handlingNotice : null,
  };
}

function readVisualQaBaseline(): VisualQaBaseline {
  const json = readFileSync(
    resolve(process.cwd(), 'fixtures/packets/visual/qapi-render-qa-baseline.json'),
    'utf8',
  );
  return JSON.parse(json) as VisualQaBaseline;
}

function extractRenderedSections(html: string): RenderedSection[] {
  return [...html.matchAll(/<section class="([^"]*)" data-module-id="([^"]+)" data-page-number="(\d+)">([\s\S]*?)<\/section>/gu)]
    .map((match): RenderedSection => ({
      className: match[1] ?? '',
      moduleId: match[2] as PacketModuleId,
      pageNumber: Number(match[3]),
      html: match[4] ?? '',
    }));
}

function findSection(sections: readonly RenderedSection[], moduleId: PacketModuleId): RenderedSection {
  const section = sections.find((candidate) => candidate.moduleId === moduleId);
  if (!section) {
    throw new Error(`Expected rendered section for ${moduleId}`);
  }
  return section;
}

function pageIndex(moduleIndexById: ReadonlyMap<PacketModuleId, number>, moduleId: PacketModuleId): number {
  const index = moduleIndexById.get(moduleId);
  if (index === undefined) {
    throw new Error(`Missing module in rendered outline: ${moduleId}`);
  }
  return index;
}

function extractStyleText(html: string): string {
  return [...html.matchAll(/<style>([\s\S]*?)<\/style>/gu)]
    .map((match) => match[1] ?? '')
    .join('\n');
}

function extractElements(html: string, tagName: string, className: string): string[] {
  const pattern = new RegExp(
    `<${tagName}\\b[^>]*class="${escapeRegExp(className)}"[^>]*>[\\s\\S]*?<\\/${tagName}>`,
    'gu',
  );
  return [...html.matchAll(pattern)].map((match) => match[0] ?? '');
}

function stripHtml(html: string): string {
  return html
    .replace(/<style>[\s\S]*?<\/style>/gu, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gu, ' ')
    .replace(/<[^>]+>/gu, ' ')
    .replace(/&nbsp;/gu, ' ')
    .replace(/&amp;/gu, '&')
    .replace(/&quot;/gu, '"');
}

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
}
