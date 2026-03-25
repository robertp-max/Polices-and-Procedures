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
        'bg-gradient-to-br from-white/[0.06] to-white/[0.02]',
        'border border-white/10',
        'backdrop-blur-2xl',
        'shadow-[0_4px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)]',
        hover ? 'cursor-pointer transition-all duration-200 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-[0_8px_40px_rgba(0,240,255,0.08)]' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  );
}
