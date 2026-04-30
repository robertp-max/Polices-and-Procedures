import type { ReactNode } from 'react';

export type CiBadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export interface CiStatusBadgeProps {
  tone?: CiBadgeTone;
  className?: string;
  children: ReactNode;
}

/**
 * Token-driven status pill. Use for ANY new badge surface.
 * The legacy `StatusBadge` (lifecycle-specific) is preserved for backward
 * compat; new code should prefer `CiStatusBadge` with an explicit tone.
 */
export function CiStatusBadge({ tone = 'neutral', className, children }: CiStatusBadgeProps) {
  return (
    <span className={`ci-badge ci-badge--${tone} ${className ?? ''}`}>
      {children}
    </span>
  );
}
