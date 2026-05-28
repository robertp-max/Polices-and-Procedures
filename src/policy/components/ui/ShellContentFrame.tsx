import React from 'react';

interface ShellContentFrameProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Whether this frame should allow scrolling */
  scrollable?: boolean;
  /**
   * Detail-mode rendering — when true the surface uses the opaque
   * `--ci-color-glass-main-detail` variant (drawer/detail page context).
   * Default false keeps the translucent canonical glass surface.
   */
  detail?: boolean;
}

/**
 * ShellContentFrame
 *
 * Inner constrained container that sits inside ShellFrame.
 * All operational page content (Dashboard, Evidence, etc.) must render inside this.
 *
 * Responsibilities:
 * - Provides the final 4-sided breathing room on desktop
 * - Acts as the scroll container for page content
 * - Owns the canonical painted glass surface via `--ci-color-glass-*` tokens
 *   (added in Phase 2 visibility-fix pass) — `background`, `backdrop-filter`,
 *   `border-color`, and `box-shadow` all resolve through CSS custom
 *   properties so theme switches (data-theme + data-ci-mode) flip the
 *   surface without any JavaScript-side branching.
 *
 * This is the component that actually delivers the "constrained page view
 * contract" AND the "painted glass contract".
 */
export const ShellContentFrame: React.FC<ShellContentFrameProps> = ({
  children,
  className = '',
  style,
  scrollable = true,
  detail = false,
}) => {
  return (
    <div
      data-shell-content-frame
      className={`
        relative z-10 flex w-full flex-1 flex-col border
        overflow-hidden rounded-[var(--v3-card-radius,24px)]
        ${scrollable ? 'overflow-y-auto' : ''}
        ${className}
      `}
      // Canonical glass surface — all values resolve through --ci-color-glass-*
      // tokens declared in src/index.css per (data-theme, data-ci-mode).
      // Consumers MAY pass `style` to add layout-only properties (e.g.
      // grid-template-rows) — but the glass contract values must not be
      // overridden in production code paths.
      style={{
        background: detail ? 'rgba(8, 10, 13, 0.98)' : 'var(--v3-glass-card)',
        backdropFilter: 'var(--v3-glass-blur)',
        WebkitBackdropFilter: 'var(--v3-glass-blur)',
        borderColor: detail ? 'var(--v3-border-subtle)' : 'transparent',
        boxShadow: 'none',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default ShellContentFrame;
