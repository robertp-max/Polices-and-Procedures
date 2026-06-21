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
      'rounded-lg border border-hairline bg-white/[.45] p-xl shadow-none backdrop-blur-md transition duration-base ease-standard hover:bg-white/[.60] hover:shadow-rest active:scale-[0.997]',
      className
    )}>
      <div className="mb-lg flex items-start justify-between gap-md">
        {Icon ? (
          <span className={cx('grid h-10 w-10 place-items-center rounded-xl border', toneSurfaceClasses[card.tone])}>
            <Icon aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
        ) : (
          <span />
        )}
        {card.status ? <ToneBadge size="sm" status={card.status} /> : null}
      </div>
      <div className="grid gap-md">
        <div className="grid gap-sm">
          <h3 className="text-sm font-medium text-brand-teal-deep">{card.title}</h3>
          <p className="text-xs font-light leading-relaxed text-muted">{card.body}</p>
        </div>
        {typeof card.progress === 'number' ? <ProgressMeter tone={card.tone} value={card.progress} /> : null}
        {children}
      </div>
    </article>
  );
}
