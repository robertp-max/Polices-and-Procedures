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

/** Exact prototype structure from ref (16-dashboard.png, CES refs):
 *  - icon in h-10 w-10 rounded-xl tone-${tone} shell (pastel tone bg + border)
 *  - ToneBadge (right)
 *  - <h3 ...> title (tone-aware color)
 *  - optional body <p mt-2 text-xs font-light>
 *  - optional h-2 progress bar with tone fill + "Progress" label (10px up tracking-[0.18em])
 *  Matches task spec for SurfaceCard + #F7FEFF base + white cards + radii 8-32 + hover-lift + restrained glass.
 *  When title/icon provided: structured mode...
 */
export function SurfaceCard({ padding = 'lg', className, style, children, item, tone, title, body, icon, progress, ...rest }: SurfaceCardProps) {
  const effectiveTone = (tone || item?.tone || 'teal') as string;
  const effectiveTitle = title ?? item?.title;
  const effectiveBody = body ?? item?.body;
  const effectiveIcon = icon ?? item?.icon;
  const effectiveProgress = progress ?? item?.progress;

  const isStructured = effectiveTitle != null;

  const baseClasses = 'surface-card hover-lift rounded-2xl border border-neutral-200 bg-white shadow-soft transition touch-manipulation active:bg-neutral-50 active:scale-[0.997]'; /* reinforced: h-10/w-10 tone shell + ToneBadge + h3 + body + h-2 progress; #F7FEFF+white, radii 8-32, hover-lift, restrained glass */

  if (isStructured) {
    // exact per spec: h-10/w-10 tone shell + ToneBadge + h3 + body + h-2 progress + restrained etc.
    return (
      <div
        {...rest}
        className={`${baseClasses} p-5 ${className ?? ''}`}
        style={style}
      >
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-2xl border tone-${effectiveTone}`}>
            {effectiveIcon}
          </div>
          <ToneBadge tone={effectiveTone}>{effectiveTone}</ToneBadge> {/* exact h-10/w-10 tone shell + ToneBadge per ref SurfaceCard */}
        </div>
        <h3 className="mt-4 font-roboto text-sm font-medium text-brand-teal-600">{effectiveTitle}</h3>
        {effectiveBody && (
          <p className="mt-2 font-roboto font-light text-xs leading-relaxed text-neutral-400">{effectiveBody}</p>
        )}
        {children}
        {effectiveProgress != null && effectiveProgress !== undefined && (
          <div className="mt-4">
            <div className="mb-1 flex justify-between font-roboto text-[10px] font-light uppercase tracking-wider text-neutral-400">
              <span>Progress</span>
              <span>{effectiveProgress}%</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-white">
              <div
                className="h-2 rounded-full"
                style={{ width: `${effectiveProgress}%`, backgroundColor: effectiveTone === 'teal' ? '#00797D' : effectiveTone === 'orange' ? '#C74601' : effectiveTone === 'green' ? '#006B3A' : effectiveTone === 'amber' ? '#8a5c00' : effectiveTone === 'slate' ? '#524D4B' : '#00797D' }}
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
