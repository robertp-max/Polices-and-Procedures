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

export function BoardLane({ lane }: { lane: BoardLaneData }) {
  return (
    <section className="min-w-[232px] rounded-lg border border-card bg-surface p-lg shadow-rest">
      <header className="mb-lg flex items-start justify-between gap-md">
        <div>
          <h2 className="text-h3 font-light text-ink">{lane.title}</h2>
          <p className="text-sm text-muted">{lane.count} active cards</p>
        </div>
        <ToneTag tone={lane.tone}>{lane.count}</ToneTag>
      </header>
      <div className="grid gap-md">
        {lane.cards.map((card) => (
          <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={card.id}>
            <div className="mb-md flex items-center justify-between gap-md">
              <ToneTag tone={card.tone}>{card.id}</ToneTag>
              <button
                aria-label={`More actions for ${card.title}`}
                className="rounded-sm p-xs text-brand-teal transition duration-fast ease-standard hover:bg-surface-hover focus-visible:outline-none focus-visible:shadow-focus"
                type="button"
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
                    className={cx('rounded-sm border px-sm py-xs text-tag uppercase tracking-tag', toneSurfaceClasses.slate)}
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

