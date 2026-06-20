import type { HTMLAttributes, ReactNode } from 'react';
import { ToneBadge } from './V32DesignSystem';

export interface SurfaceCardItem {
  title?: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  tone?: string;
  progress?: number;
}

export interface SurfaceCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children?: ReactNode;
  item?: SurfaceCardItem;
  tone?: string;
  title?: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  progress?: number;
}

const PAD: Record<NonNullable<SurfaceCardProps['padding']>, string> = {
  none: '0',
  sm: '12px',
  md: '16px',
  lg: '24px',
};

/** Enhanced to exact redesign structure + tone support.
 *  Prototype: icon (h-10 w-10 rounded-xl tone shell) + ToneBadge + h3 + body + optional h-2 progress.
 *  Uses .surface-card + .tone-* + hover-lift. Backward compatible wrapper.
 */
export function SurfaceCard({ padding = 'lg', className, style, children, item, tone, title, body, icon, progress, ...rest }: SurfaceCardProps) {
  const effectiveTone = (tone || item?.tone || 'teal') as string;
  const effectiveTitle = title ?? item?.title;
  const effectiveBody = body ?? item?.body;
  const effectiveIcon = icon ?? item?.icon;
  const effectiveProgress = progress ?? item?.progress;

  const isStructured = effectiveTitle != null;

  const baseClasses = 'surface-card hover-lift rounded-2xl border border-brand-neutral-200 bg-white shadow-soft transition touch-manipulation active:bg-brand-neutral-50 active:scale-[0.997]';

  if (isStructured) {
    // exact prototype structure
    return (
      <div
        {...rest}
        className={`${baseClasses} p-5 hover:-translate-y-0.5 hover:shadow-lift ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl tone-${effectiveTone}`}>
            {effectiveIcon}
          </div>
          <ToneBadge tone={effectiveTone}>{effectiveTone}</ToneBadge>
        </div>
        <h3 className="mt-4 font-heading text-sm font-extrabold text-brand-teal-600">{effectiveTitle}</h3>
        {effectiveBody && (
          <p className="mt-2 text-xs leading-relaxed text-brand-neutral-400">{effectiveBody}</p>
        )}
        {effectiveProgress != null && effectiveProgress !== undefined && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between text-[10px] font-bold uppercase tracking-wider text-brand-neutral-400">
              <span>Progress</span>
              <span>{effectiveProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-brand-neutral-100">
              <div
                className={`h-2 rounded-full tone-${effectiveTone}`}
                style={{ width: `${effectiveProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // legacy wrapper mode for existing usage (padding, children)
  return (
    <div
      {...rest}
      className={`${baseClasses} ${className ?? ''}`}
      style={{ padding: PAD[padding], ...style }}
    >
      {children}
    </div>
  );
}
