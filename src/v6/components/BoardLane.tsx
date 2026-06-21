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
    <section className="min-w-[224px] rounded-lg border border-card bg-surface-glass p-md shadow-rest">
      <header className="mb-md flex items-start justify-between gap-md">
        <div>
          <h2 className="text-body font-medium text-ink">{lane.title}</h2>
          <p className="text-sm text-muted">{lane.count} active cards</p>
        </div>
        <ToneTag tone={lane.tone}>{lane.count}</ToneTag>
      </header>
      <div className="grid gap-md">
        {lane.cards.map((card) => (
          <article
            className={cx(
              'rounded-lg border border-hairline bg-white/[.42] p-md shadow-none backdrop-blur-sm transition duration-fast ease-standard',
              onCardClick && 'cursor-pointer hover:bg-white/[.58]'
            )}
            key={card.id}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          >
            <div className="mb-md flex items-center justify-between gap-md">
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
            <div className="grid gap-md">
              <h3 className="text-body font-light text-ink">{card.title}</h3>
              <div className="flex justify-between gap-md text-xs">
                <span className="text-brand-teal">{card.owner}</span>
                <span className="text-muted">{card.due}</span>
              </div>
              <div className="flex flex-wrap gap-xs">
                {card.chips.map((chip) => (
                  <span
                    className={cx(
                      'rounded-sm border px-sm py-xs text-tag uppercase tracking-tag',
                      card.tone === 'orange' || card.tone === 'amber'
                        ? toneSurfaceClasses.orange
                        : 'border-tone-teal-border bg-white/[.45] text-brand-teal',
                    )}
                    key={`${card.id}-${chip}`}
                  >
                    {chip}
                  </span>
                ))}
              </div>
              <ProgressMeter tone={card.tone} value={card.progress} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
