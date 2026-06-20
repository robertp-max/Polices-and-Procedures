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
 * Restrained panel. ALWAYS clean white #FFFFFF for content (or pale tones via parent .tone-*).
 * Glass (blur) restrained ONLY for shells/overlays (not cards/tiles).
 * Scope: cards/tiles flat #FFFFFF + pale #F7FEFF tones, exact radii 8-32, no heavy blur on content.
 * Matches refs (16-dashboard.png, 40-onboarding...) + CareIndeed spec.
 */
export function GlassPanel({ padding = 'lg', className, style, children, ...rest }: GlassPanelProps) {
  const padStyle = { padding: PAD[padding], ...style };
  // Tightened: flat white, surface-card, rounded-2xl (16px in 8-32 scale), no blur via CSS cascade.
  const cls = `surface-card hover-lift shadow-soft rounded-2xl border border-[var(--border-card,#E9E5E3)] bg-[#FFFFFF] text-[var(--text-primary,#063F43)] ${className ?? ''}`;
  return (
    <div
      {...rest}
      className={cls}
      style={padStyle}
    >
      {children}
    </div>
  );
}
