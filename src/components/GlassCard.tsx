import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export default function GlassCard({ children, className = '', onClick, hover }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={[
        'relative rounded-xl overflow-hidden',
        'bg-white',
        'border border-[#E5E4E3]',
        'shadow-sm',
        hover ? 'cursor-pointer transition-all duration-200 hover:border-[#007970] hover:shadow-md' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
