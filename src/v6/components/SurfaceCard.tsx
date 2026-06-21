import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { ToneBadge } from '../primitives';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { ProgressMeter } from './ProgressMeter';
import { toneSoftTileClasses } from './toneClasses';

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
    <article className={cx('rounded-lg border border-card bg-surface p-xl shadow-rest', className)}>
      <div className="mb-lg flex items-start justify-between gap-md">
        {Icon ? (
          <span className={cx('grid h-tap w-tap place-items-center rounded-md', toneSoftTileClasses[card.tone])}>
            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
        ) : (
          <span />
        )}
        {card.status ? <ToneBadge size="sm" status={card.status} /> : null}
      </div>
      <div className="grid gap-md">
        <div className="grid gap-sm">
          <h2 className="text-h3 font-light text-ink">{card.title}</h2>
          <p className="text-sm text-muted">{card.body}</p>
        </div>
        {typeof card.progress === 'number' ? <ProgressMeter tone={card.tone} value={card.progress} /> : null}
        {children}
      </div>
    </article>
  );
}

