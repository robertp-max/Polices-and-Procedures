import React from 'react';

export interface CareIndeedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const CareIndeedBadge: React.FC<CareIndeedBadgeProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`inline-flex items-center px-4 py-1.5 rounded-full bg-[var(--ci-surface-mint)] border border-[var(--ci-border-mint)] text-[var(--ci-text-teal-accent)] text-[12px] font-semibold uppercase tracking-widest ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
