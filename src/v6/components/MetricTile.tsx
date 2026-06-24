import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { toneSurfaceClasses } from './toneClasses';


export interface MetricTileData {
  helper: string;
  label: string;
  tone: Tone;
  value: string;
}

export interface MetricTileProps {
  metric: MetricTileData;
  onClick?: () => void;
}

export function MetricTile({ metric, onClick }: MetricTileProps) {
  const interactive = Boolean(onClick);
  return (
    <article
      className={cx(
        'min-h-[106px] min-w-0 rounded-lg border p-lg shadow-rest transition duration-base ease-standard hover:translate-y-hover-lift hover:shadow-hover active:scale-press',
        toneSurfaceClasses[metric.tone],
        interactive && 'cursor-pointer focus-visible:outline-none focus-visible:shadow-focus hover:brightness-[0.985]'
      )}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick!();
        }
      } : undefined}
    >
      <div className="truncate text-tag font-medium uppercase tracking-tag opacity-75">
        {metric.label}
      </div>
      <div className="mt-sm truncate text-[28px] font-medium leading-none tracking-normal">
        {metric.value}
      </div>
      <div className="mt-xs truncate text-xs font-light opacity-75">
        {metric.helper}
      </div>
    </article>
  );
}

export function MetricGrid({ metrics, className }: { metrics: readonly (MetricTileData & { onClick?: () => void })[]; className?: string }) {
  const colCount = metrics.length;
  return (
    <section
      className={cx(
        'grid gap-md tablet-l:grid-cols-2',
        colCount === 5 ? 'desktop:grid-cols-5' : 'desktop:grid-cols-4',
        className
      )}
      aria-label="Route metrics"
    >
      {metrics.map((m) => (
        <MetricTile key={`${m.label}-${m.value}`} metric={m} onClick={m.onClick} />
      ))}
    </section>
  );
}
