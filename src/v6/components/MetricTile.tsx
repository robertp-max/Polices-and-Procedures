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
    <article className={cx(
      'min-h-[125px] rounded-lg border p-4 shadow-rest transition duration-base ease-standard hover:translate-y-[-2px] hover:shadow-hover active:scale-[0.997] sm:p-5',
      toneSurfaceClasses[metric.tone]
    )}>
      <div className="text-[10px] font-medium uppercase tracking-[0.18em] opacity-75">
        {metric.label}
      </div>
      <div className="mt-3 text-3xl font-medium tracking-tight">
        {metric.value}
      </div>
      <div className="mt-1 text-xs font-light opacity-75">
        {metric.helper}
      </div>
    </article>
  );
}

export function MetricGrid({ metrics, className }: { metrics: readonly MetricTileData[]; className?: string }) {
  const colCount = metrics.length;
  return (
    <section
      className={cx(
        'grid gap-lg tablet-l:grid-cols-2',
        colCount === 5 ? 'desktop:grid-cols-5' : 'desktop:grid-cols-4',
        className
      )}
      aria-label="Route metrics"
    >
      {metrics.map((metric) => (
        <MetricTile key={`${metric.label}-${metric.value}`} metric={metric} />
      ))}
    </section>
  );
}
