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
 * Translucent panel.
 * - Light mode: flat solid surface, no blur.
 * - Dark modes: light backdrop blur + glass border.
 * Backed by `.ci-glass-panel` token class so behaviour switches per theme.
 */
export function GlassPanel({ padding = 'lg', className, style, children, ...rest }: GlassPanelProps) {
  return (
    <div
      {...rest}
      className={'ci-glass-panel ' + (className ?? '')}
      style={{ padding: PAD[padding], ...style }}
    >
      {children}
    </div>
  );
}
