/**
 * LoadingState — canonical loading-state primitive replacing scattered
 * `Loader2` + `animate-spin` ad-hoc patterns across the codebase.
 *
 * Exists alongside lucide-react Loader2 because it provides a11y wrapper
 * (role/status + aria-live), consistent variant layouts (inline/block/overlay/fullscreen),
 * size scale, and reduced-motion fallback (pulsing dot instead of spin).
 *
 * Adoption strategy: per-page replacement is a separate ticket (U-17).
 * Out of scope: no Skeleton variant (separate primitive if needed later).
 */

import type { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  /** Layout variant. Default 'inline'. */
  variant?: 'inline' | 'block' | 'overlay' | 'fullscreen';
  /** Spinner size. Default 'md'. */
  size?: 'sm' | 'md' | 'lg';
  /** Optional visible + aria label. Default 'Loading…' */
  label?: string;
  /** Hide the spinner icon (label-only mode). Default false. */
  hideSpinner?: boolean;
  /** Override the default spinner icon. Default Loader2. */
  icon?: ReactNode;
  className?: string;
}

const SIZE_MAP = {
  sm: { icon: 14, text: 'text-xs' },
  md: { icon: 18, text: 'text-sm' },
  lg: { icon: 24, text: 'text-base' },
} as const;

function getReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LoadingState({
  variant = 'inline',
  size = 'md',
  label = 'Loading…',
  hideSpinner = false,
  icon,
  className,
}: LoadingStateProps) {
  const reduced = getReducedMotion();
  const { icon: iconSize, text: textClass } = SIZE_MAP[size];
  const spinnerColor =
    variant === 'overlay' || variant === 'fullscreen'
      ? 'var(--ci-accent)'
      : 'var(--ci-text-primary)';
  const labelColor =
    variant === 'overlay' || variant === 'fullscreen'
      ? 'var(--ci-text-primary)'
      : 'var(--ci-text-muted)';

  const spinner = icon ?? (
    <Loader2
      size={iconSize}
      className={reduced ? 'animate-pulse' : 'animate-spin'}
      style={{ color: spinnerColor }}
      aria-hidden
    />
  );

  const showSpinner = !hideSpinner;
  const hasVisibleLabel = Boolean(label);

  const rootClass =
    variant === 'inline'
      ? 'inline-flex items-center gap-2'
      : variant === 'block'
      ? 'flex flex-col items-center justify-center py-8 gap-2 text-center'
      : 'flex flex-col items-center justify-center gap-2 text-center';

  const scrimStyle =
    variant === 'overlay' || variant === 'fullscreen'
      ? { backgroundColor: 'rgba(15,23,28,0.45)' }
      : undefined;

  const wrapperClass =
    variant === 'overlay'
      ? 'absolute inset-0 z-10'
      : variant === 'fullscreen'
      ? 'fixed inset-0 z-[70]'
      : '';

  const content = (
    <>
      {showSpinner && <div style={{ color: spinnerColor }}>{spinner}</div>}
      {hasVisibleLabel ? (
        <span className={textClass} style={{ color: labelColor }}>
          {label}
        </span>
      ) : (
        <span className="sr-only">{label || 'Loading'}</span>
      )}
    </>
  );

  if (variant === 'overlay' || variant === 'fullscreen') {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`${wrapperClass} ${rootClass} ${className ?? ''}`}
        style={scrimStyle}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${rootClass} ${className ?? ''}`}
    >
      {content}
    </div>
  );
}
