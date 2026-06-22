import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { ToneBadge } from '../primitives';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { ProgressMeter } from './ProgressMeter';
import { toneSurfaceClasses } from './toneClasses';

export interface SurfaceCardData {
  body: string;
  icon?: LucideIcon;
  progress?: number;
  status?: string;
  title: string;
  tone: Tone;
}

export interface SurfaceCardProps {
  card: SurfaceCardData;
  children?: ReactNode;
  className?: string;
}

export function SurfaceCard({ card, children, className }: SurfaceCardProps) {
  const Icon = card.icon;

  return (
    <article className={cx(
      'rounded-lg border border-card bg-white/[.54] p-lg shadow-glass-inset backdrop-blur-xl transition-all duration-base ease-standard hover:bg-white/[.68] hover:shadow-hover hover:-translate-y-hover-lift active:scale-press',
      className
    )}>
      <div className="mb-md flex min-h-tap items-start justify-between gap-md">
        {Icon ? (
          <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg border', toneSurfaceClasses[card.tone])}>
            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
        ) : (
          <span />
        )}
        {card.status ? <ToneBadge size="sm" status={card.status} /> : null}
      </div>
      <div className="grid gap-sm">
        <div className="grid gap-xs">
          <h3 className="text-sm font-medium text-brand-teal-deep">{card.title}</h3>
          <p className="text-xs font-light leading-sm text-muted">{card.body}</p>
        </div>
        {typeof card.progress === 'number' ? <ProgressMeter className="mt-xs" tone={card.tone} value={card.progress} /> : null}
        {children}
      </div>
    </article>
  );
}
