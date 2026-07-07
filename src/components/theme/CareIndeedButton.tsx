import React from 'react';

export interface CareIndeedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  shape?: 'rounded' | 'pill';
  leftIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const CareIndeedButton: React.FC<CareIndeedButtonProps> = ({
  variant = 'primary',
  shape = 'rounded',
  leftIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold text-[14px] tracking-wider uppercase transition-all duration-150 active:scale-[0.98] select-none';
  
  const getVariantStyles = () => {
    if (disabled) {
      return 'bg-gray-200 text-disabled border border-gray-200 cursor-not-allowed';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-[var(--ci-brand-orange)] text-white hover:bg-opacity-95 shadow-[0_4px_14px_rgba(242,110,54,0.35)] border-none';
      case 'outline':
        return 'bg-white text-[var(--ci-brand-orange)] border border-[var(--ci-brand-orange)] hover:bg-[var(--ci-brand-orange)] hover:text-white shadow-none';
      default:
        return 'bg-[var(--ci-brand-orange)] text-white';
    }
  };

  const getShapeStyles = () => {
    switch (shape) {
      case 'rounded':
        return 'rounded-xl px-8 py-3.5';
      case 'pill':
        return 'rounded-full px-8 py-3.5';
      default:
        return 'rounded-xl px-8 py-3.5';
    }
  };

  return (
    <button
      className={`${baseStyles} ${getVariantStyles()} ${getShapeStyles()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
      {children}
    </button>
  );
};
