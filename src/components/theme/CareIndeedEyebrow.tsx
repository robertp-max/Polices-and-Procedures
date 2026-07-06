import React from 'react';

export interface CareIndeedEyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const CareIndeedEyebrow: React.FC<CareIndeedEyebrowProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <span
      className={`block text-[11px] font-bold uppercase tracking-widest text-ci-teal ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
