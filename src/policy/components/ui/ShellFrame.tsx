import React from 'react';
import TravelightBG from '@/components/TravelightBG';
import { useCiModeStore } from '@/policy/stores/ciModeStore';

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
 * - Backdrop (TravelightBG in dark, subtle gutter in light)
 * - Global 4-sided breathing room
 * - Layer 0/1 glass foundation
 *
 * All operational pages must render their content inside ShellContentFrame,
 * which sits inside this component.
 */
export const ShellFrame: React.FC<ShellFrameProps> = ({ children, className = '' }) => {
  const { isLight } = useCiModeStore();

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      {/* Layer 0 - Atmospheric Backdrop */}
      <div className="fixed inset-0 z-0">
        <TravelightBG />
        {/* Light mode subtle gutter for glassmorphism magnification */}
        {isLight && (
          <div 
            className="absolute inset-0" 
            style={{ 
              background: 'linear-gradient(to bottom, rgba(248,250,252,0.6) 0%, rgba(241,245,249,0.4) 100%)' 
            }} 
          />
        )}
      </div>

      {/* Main content area with constrained framing on desktop */}
      <div 
        className="relative z-10 flex h-full w-full flex-col"
        style={{
          // 4-sided constrained page view - locked token from Phase 1/2
          // This is the non-negotiable mechanism that magnifies glassmorphism
          padding: 'var(--ci-glass-layer1-inset-desktop, clamp(16px, 1.6vw, 28px))',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ShellFrame;