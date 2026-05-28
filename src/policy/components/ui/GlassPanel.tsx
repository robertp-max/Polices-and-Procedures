import type { HTMLAttributes, ReactNode } from 'react';

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const PAD: Record<NonNullable<GlassPanelProps['padding']>, string> = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};

/**
 * V3 translucent panel.
 */
export function GlassPanel({ padding = 'lg', className, style, children, ...rest }: GlassPanelProps) {
  return (
    <div
      {...rest}
      className={'v3-surface v3-surface--glass ' + (className ?? '')}
      style={{ padding: PAD[padding], ...style }}
    >
      {children}
    </div>
  );
}
