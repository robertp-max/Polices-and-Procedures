import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { toneBarClasses } from './toneClasses';

export interface ProgressMeterProps {
  className?: string;
  label?: string;
  tone?: Tone;
  value: number;
}

export function ProgressMeter({ className, label = 'Progress', tone = 'teal', value }: ProgressMeterProps) {
  const boundedValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cx('grid gap-xs', className)}>
      <div className="flex items-center justify-between gap-sm text-[10px] font-light uppercase tracking-wider text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{boundedValue}%</span>
      </div>
      <div
        aria-label={label}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={boundedValue}
        className="h-2 overflow-hidden rounded-full bg-tone-slate-bg"
        role="progressbar"
      >
        <div className={cx('h-full rounded-full', toneBarClasses[tone])} style={{ width: `${boundedValue}%` }} />
      </div>
    </div>
  );
}
