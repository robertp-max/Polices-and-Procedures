/**
 * Part A — Executive Narrative front-matter tests.
 * Asserts the narrative leads the document, carries varied charts, stays honest
 * about UNKNOWN, and hands off to Part B — for the §24 Q1 model.
 */
import { describe, expect, it } from 'vitest';

import { runQ1EndToEndLifecycle } from '@/policy/packets/testing/e2eHarness';
import { renderPacketModel } from '@/policy/packets/render/renderPacketModel';

async function renderQ1(): Promise<string> {
  const result = await runQ1EndToEndLifecycle();
  return renderPacketModel(result.model);
}

describe('Part A — executive narrative front matter', () => {
  it('leads the document and hands off to Part B', async () => {
    const html = await renderQ1();
    const partAStart = html.indexOf('data-part="A"');
    const partBCover = html.indexOf('data-module-id="qapi-cover-page"');
    expect(partAStart).toBeGreaterThan(-1);
    expect(partBCover).toBeGreaterThan(-1);
    // Part A pages appear before the first Part B module page.
    expect(partAStart).toBeLessThan(partBCover);
    expect(html).toContain('Part A · Executive Briefing');
    expect(html).toContain('Evidence Appendices');
  });

  it('renders a varied, labeled chart set (not just bars)', async () => {
    const html = await renderQ1();
    // scorecard heatmap, bullet, gauge, and at least one domain chart figure.
    expect(html).toContain('Indicator scorecard');
    expect(html).toContain('Indicators vs target');
    expect(html).toContain('Evidence coverage');
    expect(html).toContain('Adverse events by category');
    // charts are inline SVG figures, self-contained (no external chart lib).
    expect(html).toContain('class="pa-chart"');
    expect(html).toContain('<svg class="pa-svg"');
    expect(html).not.toContain('<script');
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
    expect(html).toContain('Narrative synthesized from Part B evidence');
    expect(html).toMatch(/no values were generated/i);
  });
});
