/**
 * Part A — Executive Narrative front-matter tests.
 * Asserts the branded cover leads, Part A is prose-first, UNKNOWN stays honest,
 * and the narrative hands off to Part B — for the §24 Q1 model.
 */
import { describe, expect, it } from 'vitest';

import { runQ1EndToEndLifecycle } from '@/policy/packets/testing/e2eHarness';
import { renderPacketModel } from '@/policy/packets/render/renderPacketModel';

async function renderQ1(): Promise<string> {
  const result = await runQ1EndToEndLifecycle();
  return renderPacketModel(result.model);
}

describe('Part A — executive narrative front matter', () => {
  it('keeps the real cover first, then Part A, then Part B appendices', async () => {
    const html = await renderQ1();
    const coverStart = html.indexOf('data-module-id="qapi-cover-page"');
    const partAStart = html.indexOf('data-part="A"');
    const dividerStart = html.indexOf('Evidence Appendices');
    const firstAppendixStart = html.indexOf('data-module-id="qapi-packet-control-source-validation-readiness"');
    expect(coverStart).toBeGreaterThan(-1);
    expect(partAStart).toBeGreaterThan(-1);
    expect(dividerStart).toBeGreaterThan(partAStart);
    expect(firstAppendixStart).toBeGreaterThan(dividerStart);
    expect(coverStart).toBeLessThan(partAStart);
    expect(countMatches(html, /data-module-id="qapi-cover-page"/gu)).toBe(1);
    expect(html).toContain('Part A — Executive Analysis');
    expect(html).toContain('Evidence Appendices');
    expect(html).toContain('class="pg pg-partB pa-divider" data-part="B"');
    expect(html).not.toContain('Analytical Report Packet');
  });

  it('renders Part A as narrative analysis with selective infographics, not a chart deck', async () => {
    const html = await renderQ1();
    const dividerStart = html.indexOf('Evidence Appendices');
    const partAHtml = html.slice(0, dividerStart);
    expect(partAHtml).toContain('Executive Summary');
    expect(partAHtml).toContain('What the Evidence Shows');
    expect(partAHtml).toContain('Connected Findings and Risk Story');
    expect(partAHtml).toContain('PIP / CAP / RCA / Workflow Determinations');
    expect(partAHtml).toContain('Evidence Limitations');
    expect(partAHtml).toContain('A trigger is not a completed PIP');
    expect(partAHtml).toContain('class="pa-infographic pa-score-infographic"');
    expect(partAHtml).toContain('KPI readiness at a glance');
    expect(partAHtml).toContain('Evidence scope snapshot');
    expect(partAHtml).toContain('Trigger-to-action map');
    expect(partAHtml).not.toContain('class="pa-chart"');
    expect(partAHtml).not.toContain('<svg class="pa-svg"');
    expect(partAHtml).not.toContain('Performance vs Targets');
  });

  it('is honest about UNKNOWN and never emits a placeholder page', async () => {
    const html = await renderQ1();
    // UNKNOWN indicators are surfaced, not zero-filled.
    expect(html).toContain('UNKNOWN');
    // no placeholder / zero-numbered page slipped in.
    expect(html).not.toContain('data-page-number="0"');
  });

  it('states the extractive, survey-safe contract on the page', async () => {
    const html = await renderQ1();
    expect(html).toContain('Narrative synthesized from Part B structured evidence');
    expect(html).toMatch(/no values were generated/i);
  });
});

function countMatches(value: string, pattern: RegExp): number {
  return [...value.matchAll(pattern)].length;
}
