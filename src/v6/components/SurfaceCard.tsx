import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';
import { ToneBadge } from '../primitives';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { ProgressMeter } from './ProgressMeter';
import { CareIndeedCard } from '@/components/theme/CareIndeedCard';

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
    <CareIndeedCard
      variant="container"
      className={cx('p-5 transition duration-150 hover:shadow-sm', className)}
    >
      <div className="mb-4 flex min-h-tap items-start justify-between gap-md">
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-ci-mint/10 text-ci-teal">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : (
          <span />
        )}
        {card.status ? <ToneBadge size="sm" status={card.status} /> : null}
      </div>
      <div className="grid gap-sm">
        <div className="grid gap-xs">
          <h3 className="text-sm font-bold text-ci-teal-deep">{card.title}</h3>
          <p className="text-xs text-gray-500 leading-normal">{card.body}</p>
        </div>
        {typeof card.progress === 'number' ? <ProgressMeter className="mt-2" tone={card.tone} value={card.progress} /> : null}
        {children}
      </div>
    </CareIndeedCard>
  );
}
