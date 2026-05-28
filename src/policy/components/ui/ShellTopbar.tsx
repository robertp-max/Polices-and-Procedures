import React from 'react';
import { SearchField } from './SearchField';

interface ShellTopbarProps {
  children?: React.ReactNode;
  onMenuClick?: () => void;
  showMobileMenu?: boolean;
  logo?: React.ReactNode;
}

/**
 * ShellTopbar - Canonical top bar for the shell.
 *
 * Surface colors flow through the app-wide V3 token contract.
 */
export const ShellTopbar: React.FC<ShellTopbarProps> = ({
  children,
  onMenuClick,
  showMobileMenu = false,
  logo,
}) => {
  return (
    <div
      role="banner"
      aria-label="Application topbar"
      data-shell-topbar
      className="flex h-14 w-full items-center justify-between border-b px-4 flex-shrink-0"
      style={{
        background: 'transparent',
        borderColor: 'var(--v3-border-subtle)',
        backdropFilter: 'var(--v3-glass-blur)',
        WebkitBackdropFilter: 'var(--v3-glass-blur)',
      }}
    >
      {/* Left: Mobile menu + Logo */}
      <div className="flex items-center gap-3">
        {showMobileMenu && onMenuClick && (
          <button
            onClick={onMenuClick}
            type="button"
            className="lg:hidden p-2 -ml-2 text-[var(--v3-text-secondary)] hover:text-[var(--v3-text-primary)]"
            aria-label="Open navigation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="flex items-center gap-2 font-semibold tracking-tight text-[var(--v3-text-primary)]" style={{ fontSize: 'var(--ci-font-size-body-md, 15px)' }}>
          {logo || 'Care Indeed'}
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
      </div>
    </div>
  );
};

export default ShellTopbar;