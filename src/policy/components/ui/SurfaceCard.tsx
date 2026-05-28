import type { HTMLAttributes, ReactNode } from 'react';

export interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const PAD: Record<NonNullable<SurfaceCardProps['padding']>, string> = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};

/** V3 flat content grouping. Use only when a structural boundary is needed. */
export function SurfaceCard({ padding = 'lg', className, style, children, ...rest }: SurfaceCardProps) {
  return (
    <div
      {...rest}
      className={'v3-surface ' + (className ?? '')}
      style={{ padding: PAD[padding], ...style }}
    >
      {children}
    </div>
  );
}
