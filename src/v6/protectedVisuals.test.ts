/**
 * 🛡️ PROTECTED VISUALS — regression guard (do not delete).
 *
 * Two beloved, FRAGILE pieces of the V6 UI are pinned here. They are emergent
 * from a delicate layering of CSS (fixed-attachment watermark + backdrop blur +
 * a blurred ::before repaint of the same image) and are trivially destroyed by
 * an innocent "cleanup". If you are here because this test failed, you (or a
 * tool) removed or altered one of them — restore it, do not delete the test.
 *
 *   1. The Help Center hero "bleed": the orange angel watermark blurring through
 *      the frosted-glass card ("Every workspace, one manual system").
 *   2. The right-side Personal Operations panel (Today's Focus / My Work Queue).
 *
 * Owner intent (2026-07-20): "IM SO IN LOVE WITH IT PLEASE PROTECT."
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(resolve(process.cwd(), p), 'utf8');

describe('🛡️ PROTECTED: Help Center hero "bleeding" watermark effect', () => {
  const css = read('src/index.css');
  const hero = read('src/v6/screens/pageviews/helpcenter/HelpHero.tsx');

  it('hero keeps the static watermark + frosted-glass structure', () => {
    expect(hero).toContain('ci-page-hero');
    expect(hero).toContain('StaticCardWatermark');
    expect(hero).toContain('help-hero-glass-frame');
    expect(hero).toContain('help-hero-glass-card');
    expect(hero).toContain('help-hero-glass-content');
  });

  it('the angel watermark is painted by BOTH the hero band and the glass card', () => {
    // Two independent paints of the same image are what create the bleed.
    const uses = (css.match(/url\(['"]?\/watermark-angel\.png['"]?\)/g) || []).length;
    expect(uses).toBeGreaterThanOrEqual(2);
  });

  it('the fixed-attachment + blur that create the bleed are intact', () => {
    // Fixed attachment makes the blurred copy line up with the sharp arcs.
    expect(css).toContain('background-attachment: fixed');
    // The glass card blurs whatever is behind it...
    expect(css).toMatch(/\.help-hero-glass-card\s*\{[\s\S]*?backdrop-filter:\s*blur\(14px\)/);
    // ...and its ::before repaints the watermark, blurred — the actual "bleed".
    expect(css).toMatch(/\.help-hero-glass-card::before/);
    expect(css).toMatch(/\.help-hero-glass-card::before[\s\S]*?filter:\s*blur\(14px\)/);
  });
});

describe('🛡️ PROTECTED: right-side Personal Operations panel', () => {
  const panel = read('src/v6/shell/PersonalOpsPanel.tsx');

  it('keeps its identity + core sections', () => {
    expect(panel).toContain('personal-ops-panel');
    expect(panel).toContain('Personal Operations');
    expect(panel).toContain("Today's Focus");
    expect(panel).toContain('My Work Queue');
  });

  it('keeps the quick-nav, focus items, and work queue data', () => {
    expect(panel).toContain('activeThreadCount');
    expect(panel).toContain('focusItems');
    expect(panel).toContain('workGroups');
  });
});
