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

/** Flat solid card on `--ci-surface`. Use everywhere except the one-glass canvas. */
export function SurfaceCard({ padding = 'lg', className, style, children, ...rest }: SurfaceCardProps) {
  return (
    <div
      {...rest}
      className={'ci-card ' + (className ?? '')}
      style={{ padding: PAD[padding], ...style }}
    >
      {children}
    </div>
  );
}
