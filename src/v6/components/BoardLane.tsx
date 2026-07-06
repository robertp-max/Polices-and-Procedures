import { MoreHorizontal } from 'lucide-react';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { ProgressMeter } from './ProgressMeter';
import { ToneTag } from './ToneTag';

export interface BoardCardData {
  chips: readonly string[];
  due: string;
  id: string;
  owner: string;
  progress: number;
  title: string;
  tone: Tone;
  // CES real-record rich fields (added for seed-driven projections)
  meta?: string;
  domain?: string;
  awaitingType?: 'evidence' | 'action';
  note?: string;
  missing?: string;
}

export interface BoardLaneData {
  cards: readonly BoardCardData[];
  count: number;
  title: string;
  tone: Tone;
  // CES real-record rich fields
  note?: string;
}

export interface BoardLaneProps {
  lane: BoardLaneData;
  onCardClick?: (card: BoardCardData) => void;
}

export function BoardLane({ lane, onCardClick }: BoardLaneProps) {
  return (
    <section className="min-w-0 rounded-3xl border border-card bg-surface-hover p-4 shadow-sm">
      <header className="mb-3 flex items-start justify-between gap-xs px-1">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-bold text-brand-teal-deep">{lane.title}</h2>
          <p className="text-xs text-muted">{lane.count} active cards</p>
        </div>
        <ToneTag tone={lane.tone}>{lane.count}</ToneTag>
      </header>
      <div className="grid gap-3">
        {lane.cards.map((card) => (
          <article
            className={cx(
              'flex min-h-[132px] flex-col rounded-2xl border border-card bg-white p-4 shadow-sm hover:shadow-md transition duration-150',
              onCardClick && 'cursor-pointer'
            )}
            key={card.id}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          >
            <div className="mb-2 flex items-center justify-between gap-xs">
              <ToneTag tone={card.tone}>{card.id}</ToneTag>
              <button
                aria-label={`More actions for ${card.title}`}
                className="rounded-lg p-1 text-brand-teal transition duration-150 hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
                type="button"
                onClick={(e) => {
                  if (onCardClick) {
                    e.stopPropagation();
                    onCardClick(card);
                  }
                }}
              >
                <MoreHorizontal aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <h3 className="line-clamp-2 text-xs font-bold leading-normal text-brand-teal-deep">{card.title}</h3>
              <div className="flex justify-between gap-sm text-xs">
                <span className="min-w-0 truncate text-xs font-semibold text-brand-teal">{card.owner}</span>
                <span className="text-disabled text-xs">{card.due}</span>
              </div>
              <div className="flex flex-wrap gap-1 overflow-hidden">
                {card.chips.slice(0, 2).map((chip) => (
                  <span
                    className="max-w-full truncate rounded-lg border border-card bg-surface-hover px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-brand-teal"
                    key={`${card.id}-${chip}`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <ProgressMeter className="mt-auto" tone={card.tone} value={card.progress} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
