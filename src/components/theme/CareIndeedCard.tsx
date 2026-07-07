import React from 'react';

export interface CareIndeedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'container' | 'grid-outline' | 'grid-tinted';
  children: React.ReactNode;
}

export const CareIndeedCard: React.FC<CareIndeedCardProps> = ({
  variant = 'container',
  children,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'container':
        return 'bg-white rounded-3xl p-8 border-none shadow-none';
      case 'grid-outline':
        return 'bg-[var(--ci-surface-white)] rounded-xl border border-[var(--ci-border-subdued)] p-6 shadow-none';
      case 'grid-tinted':
        return 'bg-[var(--ci-surface-mint)] border border-[var(--ci-border-mint)] rounded-xl p-6 shadow-none';
      default:
        return 'bg-[var(--ci-surface-white)] rounded-xl border border-[var(--ci-border-subdued)] p-6 shadow-none';
    }
  };

  return (
    <div className={`${getVariantStyles()} ${className}`} {...props}>
      {children}
    </div>
  );
};
