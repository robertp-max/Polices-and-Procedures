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
      className={`inline-flex items-center px-3 py-1 rounded-full bg-surface-hover border border-brand-teal/20 text-brand-teal text-[11px] font-bold uppercase tracking-wider ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
