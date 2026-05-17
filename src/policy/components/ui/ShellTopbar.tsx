import React from 'react';
import { ThemeModeToggle } from './ThemeModeToggle';
import { SearchField } from './SearchField';
import { useCiModeStore } from '@/policy/stores/ciModeStore';

interface ShellTopbarProps {
  children?: React.ReactNode;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
}

/**
 * ShellTopbar
 *
 * Canonical top bar for the shell.
 * Contains:
 * - Brand / Logo area (left)
 * - Global search (center)
 * - Actions (right): theme toggle, help, user menu, etc.
 *
 * Must be placed inside ShellFrame.
 */
export const ShellTopbar: React.FC<ShellTopbarProps> = ({
  children,
  onMenuClick,
  showMobileMenu = false,
}) => {
  const { isLight } = useCiModeStore();

  return (
    <div 
      className="flex h-14 w-full items-center justify-between border-b px-4"
      style={{
        background: isLight 
          ? 'var(--ci-color-glass-light-main, rgba(255,255,255,0.85))' 
          : 'var(--ci-color-glass-dark-main, rgba(66,8,8,0.42))',
        borderColor: 'var(--ci-border, rgba(255,255,255,0.08))',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-3">
        {showMobileMenu && onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2"
            aria-label="Open navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        
        <div className="flex items-center gap-2 font-semibold tracking-tight text-lg">
          Care Indeed
        </div>
      </div>

      {/* Center: Global Search */}
      <div className="hidden md:block w-full max-w-md px-4">
        <SearchField 
          placeholder="Search policies, tasks, evidence..." 
          className="w-full"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {children}
        <ThemeModeToggle />
      </div>
    </div>
  );
};

export default ShellTopbar;