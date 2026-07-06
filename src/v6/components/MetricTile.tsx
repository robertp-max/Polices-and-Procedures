import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';


import { CareIndeedCard } from '@/components/theme/CareIndeedCard';

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
    <CareIndeedCard
      variant="grid-outline"
      className="min-h-[106px] min-w-0 p-5 flex flex-col justify-between transition-all duration-150 hover:shadow-sm"
    >
      <div>
        <div className="truncate text-[10px] font-bold uppercase tracking-wider text-brand-teal opacity-90">
          {metric.label}
        </div>
        <div className="mt-2 truncate text-2xl font-bold leading-none text-brand-teal-deep">
          {metric.value}
        </div>
      </div>
      <div className="mt-1 truncate text-xs text-muted">
        {metric.helper}
      </div>
    </CareIndeedCard>
  );
}

export function MetricGrid({ metrics, className }: { metrics: readonly MetricTileData[]; className?: string }) {
  const colCount = metrics.length;
  return (
    <section
      className={cx(
        'v6-route-metrics grid gap-md tablet-l:grid-cols-2',
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
