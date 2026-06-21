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
}

export function MetricTile({ metric }: MetricTileProps) {
  return (
    <article className={cx('min-h-[124px] rounded-lg border p-xl shadow-rest', toneSurfaceClasses[metric.tone])}>
      <div className="grid h-full content-between gap-md">
        <p className="text-tag uppercase tracking-tag text-secondary">{metric.label}</p>
        <div className="grid gap-xs">
          <p className="text-[30px] leading-display text-ink">{metric.value}</p>
          <p className="text-sm text-muted">{metric.helper}</p>
        </div>
      </div>
    </article>
  );
}

export function MetricGrid({ metrics }: { metrics: readonly MetricTileData[] }) {
  return (
    <section className="grid gap-lg tablet-l:grid-cols-2 desktop:grid-cols-4" aria-label="Route metrics">
      {metrics.map((metric) => (
        <MetricTile key={`${metric.label}-${metric.value}`} metric={metric} />
      ))}
    </section>
  );
}
