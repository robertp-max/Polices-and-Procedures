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
  // Extended for design parity (Awaiting Action/Evidence column)
  meta?: string;
  awaitingType?: 'evidence' | 'action';
  missing?: string;
  domain?: string;
}

export interface BoardLaneData {
  cards: readonly BoardCardData[];
  count: number;
  title: string;
  tone: Tone;
  // Optional note for special lanes like Awaiting
  note?: string;
}

export interface BoardLaneProps {
  lane: BoardLaneData;
  onCardClick?: (card: BoardCardData) => void;
}

export function BoardLane({ lane, onCardClick }: BoardLaneProps) {
  return (
    <section className="min-w-0 rounded-lg border border-hairline bg-surface-glass p-xs shadow-glass-inset backdrop-blur-md">
      <header className="mb-xs flex items-start justify-between gap-xs px-xs pt-xs">
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-ink">{lane.title}</h2>
          <p className="text-sm text-muted">{lane.count} active cards</p>
          {lane.note && <p className="text-[10px] text-muted">{lane.note}</p>}
        </div>
        <ToneTag tone={lane.tone}>{lane.count}</ToneTag>
      </header>
      <div className="grid gap-xs">
        {lane.cards.map((card) => (
          <article
            className={cx(
              'flex min-h-[132px] flex-col rounded-lg border border-hairline bg-surface-glass p-sm transition duration-fast ease-standard',
              onCardClick && 'cursor-pointer hover:bg-surface-hover'
            )}
            key={card.id}
            onClick={onCardClick ? () => onCardClick(card) : undefined}
          >
            <div className="mb-xs flex items-center justify-between gap-xs">
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
            <div className="flex flex-1 flex-col gap-xs">
              <h3 className="line-clamp-2 text-sm font-light leading-sm text-ink">{card.title}</h3>
              <div className="flex justify-between gap-sm text-xs">
                <span className="min-w-0 truncate text-brand-teal">{card.owner}</span>
                <span className="text-muted">{card.due}</span>
              </div>
              {card.domain && (
                <div className="text-[10px] text-muted truncate">{card.domain}</div>
              )}
              <div className="flex flex-wrap gap-xs overflow-hidden">
                {card.chips.slice(0, 2).map((chip) => (
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
              {card.meta && (
                <p className="text-[10px] text-muted line-clamp-1">{card.meta}</p>
              )}
              {card.awaitingType && (
                <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${card.awaitingType === 'evidence' ? 'border border-teal-200 bg-teal-50 text-teal-700' : 'border border-orange-200 bg-orange-50 text-orange-700'}`}>
                  {card.awaitingType === 'evidence' ? '⏳ Awaiting Evidence' : '📋 Awaiting Action'}
                </span>
              )}
              {card.missing && (
                <span className="text-[10px] text-orange-600">Missing: {card.missing}</span>
              )}
              <ProgressMeter className="mt-auto" tone={card.tone} value={card.progress} />
            </div>
          </article>
        ))}
      </div>
      {lane.title === 'Awaiting Action / Evidence' && (
        <div className="mt-sm flex gap-xs">
          <button className="flex-1 rounded border border-teal-200 bg-teal-50 px-2 py-1 text-[10px] text-teal-700 hover:bg-teal-100">⏳ Upload / View Evidence</button>
          <button className="flex-1 rounded border border-orange-200 bg-orange-50 px-2 py-1 text-[10px] text-orange-700 hover:bg-orange-100">📋 Assign / Review</button>
        </div>
      )}
    </section>
  );
}
