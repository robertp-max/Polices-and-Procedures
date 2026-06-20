import React from 'react';

interface ShellCommandGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * ShellCommandGroup
 *
 * Semantic grouping component for navigation items or action clusters.
 * Used inside ShellNavRail and ShellTopbar.
 *
 * Example:
 * <ShellCommandGroup title="Primary Operations">
 *   <NavItem ... />
 * </ShellCommandGroup>
 */
export const ShellCommandGroup: React.FC<ShellCommandGroupProps> = ({
  title,
  children,
  className = '',
}) => {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {title && (
        <div
          className="px-2 py-1.5 font-roboto text-[10px] font-light uppercase tracking-[0.24em] text-[var(--v3-text-tertiary)]"
          style={{ fontSize: 'var(--ci-font-size-eyebrow, 10px)' }}
        >
          {title}
        </div>
      )}
      <div className="flex flex-col gap-0.5">
        {children}
      </div>
    </div>
  );
};

export default ShellCommandGroup;