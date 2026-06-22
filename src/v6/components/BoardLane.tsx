import { MoreHorizontal } from 'lucide-react';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { ProgressMeter } from './ProgressMeter';
import { ToneTag } from './ToneTag';
import { toneSurfaceClasses } from './toneClasses';

export interface BoardCardData {
  chips: readonly string[];
  due: string;
  id: string;
  owner: string;
  progress: number;
  title: string;
  tone: Tone;
}

export interface BoardLaneData {
  cards: readonly BoardCardData[];
  count: number;
  title: string;
  tone: Tone;
}

export interface BoardLaneProps {
  lane: BoardLaneData;
  onCardClick?: (card: BoardCardData) => void;
}

export function BoardLane({ lane, onCardClick }: BoardLaneProps) {
  return (
    <section className="min-w-0 rounded-lg border border-card bg-white/[.58] p-sm shadow-glass-inset backdrop-blur-md">
      <header className="mb-sm flex items-start justify-between gap-sm px-xs pt-xs">
        <div className="min-w-0">
          <h2 className="text-body font-medium text-ink">{lane.title}</h2>
          <p className="text-sm text-muted">{lane.count} active cards</p>
        </div>
        <ToneTag tone={lane.tone}>{lane.count}</ToneTag>
      </header>
      <div className="grid gap-sm">
        {lane.cards.map((card) => (
          <article
            className={cx(
              'flex min-h-[148px] flex-col rounded-lg border border-card bg-white/[.72] p-sm transition-all duration-base ease-standard',
              onCardClick && 'cursor-pointer hover:bg-white hover:shadow-hover hover:-translate-y-hover-lift'
            )}
            key={card.id}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          >
            <div className="mb-sm flex items-center justify-between gap-sm">
              <ToneTag tone={card.tone}>{card.id}</ToneTag>
              <button
                aria-label={`More actions for ${card.title}`}
                className="rounded-sm p-xs text-brand-teal transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
                type="button"
                onClick={(e) => {
                  if (onCardClick) {
                    e.stopPropagation();
                    onCardClick(card);
                  }
                }}
              >
                <MoreHorizontal aria-hidden="true" className="h-icon-sm w-icon-sm" />
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-sm">
              <h3 className="line-clamp-2 text-sm font-light leading-sm text-ink">{card.title}</h3>
              <div className="flex justify-between gap-sm text-xs">
                <span className="min-w-0 truncate text-brand-teal">{card.owner}</span>
                <span className="text-muted">{card.due}</span>
              </div>
              <div className="flex flex-wrap gap-xs">
                {card.chips.map((chip) => (
                  <span
                    className={cx(
                      'max-w-full truncate rounded-sm border px-sm py-xs text-tag uppercase tracking-tag',
                      card.tone === 'orange' || card.tone === 'amber'
                        ? toneSurfaceClasses.orange
                        : 'border-tone-teal-border bg-white text-brand-teal',
                    )}
                    key={`${card.id}-${chip}`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <ProgressMeter className="mt-auto pt-xs" tone={card.tone} value={card.progress} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
