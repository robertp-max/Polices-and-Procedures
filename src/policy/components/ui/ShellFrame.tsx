import React from 'react';

interface ShellFrameProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * ShellFrame
 *
 * Root layout component for the canonical shell.
 * Enforces the 4-sided constrained page-view contract on desktop/laptop (>=1024px)
 * using the locked token --ci-glass-layer1-inset-desktop.
 *
 * This is the single source of truth for:
 * - V3 slate backdrop
 * - Global 4-sided breathing room
 * - Layer 0/1 glass foundation
 *
 * All operational pages must render their content inside ShellContentFrame,
 * which sits inside this component.
 */
export const ShellFrame: React.FC<ShellFrameProps> = ({ children, className = '' }) => {
  return (
    <div className={`v32-command-center-app v3-app-shell-base relative h-screen w-full overflow-hidden bg-[var(--v3-base-bg)] text-[var(--v3-text-primary)] ${className}`}>
      {/* Main content area with full screen main card (0 inset, no framing) — full occupy per design #4 */}
      <div className="v3-shell-frame-inset relative z-10 flex h-full w-full flex-col">
        {children}
      </div>
    </div>
  );
};

export default ShellFrame;