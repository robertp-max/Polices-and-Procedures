import React from 'react';

export interface CareIndeedDataBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string;
}

export const CareIndeedDataBlock: React.FC<CareIndeedDataBlockProps> = ({
  label,
  value,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col justify-between ${className}`}
      {...props}
    >
      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal mb-1">
        {label}
      </span>
      <span className="text-sm font-semibold text-brand-teal-deep break-words">
        {value}
      </span>
    </div>
  );
};
