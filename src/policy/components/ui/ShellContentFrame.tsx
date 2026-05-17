import React from 'react';

interface ShellContentFrameProps {
  children: React.ReactNode;
  className?: string;
  /** Whether this frame should allow scrolling */
  scrollable?: boolean;
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
 * - Enforces that no child glass element goes full-bleed against the shell boundary
 *
 * This is the component that actually delivers the "constrained page view contract".
 */
export const ShellContentFrame: React.FC<ShellContentFrameProps> = ({
  children,
  className = '',
  scrollable = true,
}) => {
  return (
    <div
      className={`
        relative z-10 flex w-full flex-1 flex-col
        overflow-hidden rounded-[var(--ci-glass-layer1-border-radius-desktop,2rem)]
        ${scrollable ? 'overflow-y-auto' : ''}
        ${className}
      `}
      // The padding here + ShellFrame padding creates the full 4-sided effect
      style={{
        background: 'var(--ci-color-glass-light-main, var(--glass-main))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {children}
    </div>
  );
};

export default ShellContentFrame;