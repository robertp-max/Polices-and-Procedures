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
        return 'bg-white rounded-3xl shadow-[0_18px_45px_rgba(13,122,117,0.04)] p-8 border-none';
      case 'grid-outline':
        return 'bg-white rounded-xl border border-card p-6 shadow-none';
      case 'grid-tinted':
        return 'bg-surface-hover rounded-xl p-6 border-none shadow-none';
      default:
        return 'bg-white rounded-3xl shadow-none p-6';
    }
  };

  return (
    <div className={`${getVariantStyles()} ${className}`} {...props}>
      {children}
    </div>
  );
};
