import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';

export interface ProgressMeterProps {
  className?: string;
  label?: string;
  tone?: Tone;
  value: number;
}

export function ProgressMeter({ className, label = 'Progress', tone = 'teal', value }: ProgressMeterProps) {
  const boundedValue = Math.max(0, Math.min(100, value));
  const isOrange = tone === 'orange' || tone === 'amber';
  const barColor = isOrange ? 'bg-ci-orange' : 'bg-ci-teal';

  return (
    <div className={cx('grid gap-xs', className)}>
      <div className="flex items-center justify-between gap-sm text-[10px] font-bold uppercase tracking-wider text-gray-500">
        <span>{label}</span>
        <span className="tabular-nums font-semibold text-ci-teal-deep">{boundedValue}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={boundedValue}
        className="h-2 overflow-hidden rounded-full bg-gray-200"
        role="progressbar"
      >
        <div className={cx('h-full rounded-full transition-all duration-300', barColor)} style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  );
}
