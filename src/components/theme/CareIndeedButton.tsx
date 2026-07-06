import React from 'react';

export interface CareIndeedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
  shape?: 'rounded' | 'pill';
  children: React.ReactNode;
}

export const CareIndeedButton: React.FC<CareIndeedButtonProps> = ({
  variant = 'primary',
  shape = 'rounded',
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold text-sm tracking-wider uppercase transition-all duration-150 active:scale-[0.98] select-none';
  
  const getVariantStyles = () => {
    if (disabled) {
      return 'bg-gray-200 text-disabled border border-gray-200 cursor-not-allowed';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-brand-orange text-white hover:bg-opacity-95 shadow-[0_8px_20px_rgba(242,110,54,0.15)] border-none';
      case 'outline':
        return 'bg-white text-brand-orange border border-brand-orange hover:bg-brand-orange hover:text-white';
      default:
        return 'bg-brand-orange text-white';
    }
  };

  const getShapeStyles = () => {
    switch (shape) {
      case 'rounded':
        return 'rounded-lg px-6 py-3';
      case 'pill':
        return 'rounded-full px-8 py-3';
      default:
        return 'rounded-lg px-6 py-3';
    }
  };

  return (
    <button
      className={`${baseStyles} ${getVariantStyles()} ${getShapeStyles()} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
