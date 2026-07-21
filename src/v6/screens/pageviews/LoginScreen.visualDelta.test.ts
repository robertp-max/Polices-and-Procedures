/**
 * Login visual-delta guard (separate from the Brad/Nolan work).
 *
 * Pins the two approved visual changes without touching auth behavior:
 *   1. the pre-login "Back to Dashboard" escape control is gone;
 *   2. the orange watermark is still rendered but completely STATIC — no
 *      mouse-follow / parallax state, handler, or transition.
 * Pixel-level static proof (pointer moves → transform unchanged) is covered by
 * the Playwright login QA; this fast source guard prevents silent regression.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const SRC = readFileSync(path.resolve(__dirname, 'LoginScreen.tsx'), 'utf8');

describe('LoginScreen visual delta', () => {
  it('no longer renders a "Back to Dashboard" control', () => {
    expect(SRC).not.toContain('Back to Dashboard');
    expect(SRC).not.toContain('BRAD_DEFAULT_ROUTE');
    expect(SRC).not.toContain('ArrowLeft');
  });

  it('still renders the orange watermark', () => {
    expect(SRC).toContain('/watermark-angel.png');
  });

  it('freezes the watermark: no mouse-follow state/handler/parallax', () => {
    expect(SRC).not.toContain('mouseOffset');
    expect(SRC).not.toContain('handleMouseMove');
    expect(SRC).not.toContain('onMouseMove');
    // The transform is a fixed value, not a template computed from pointer state.
    expect(SRC).toContain("transform: 'translate(-30%, -65%)'");
    expect(SRC).not.toContain('transition-transform');
  });

  it('preserves the post-login safe redirect', () => {
    expect(SRC).toContain('safeReturnTo');
  });
});
