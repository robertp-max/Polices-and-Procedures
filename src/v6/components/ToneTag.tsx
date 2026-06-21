import { type HTMLAttributes } from 'react';
import { type Tone } from '../tokens';
import { cx } from '../utils/classNames';
import { toneSurfaceClasses } from './toneClasses';

export interface ToneTagProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function ToneTag({ className, tone = 'teal', ...props }: ToneTagProps) {
  return (
    <span
      {...props}
      className={cx(
        'inline-flex items-center gap-xs rounded-sm border px-sm py-xs text-tag font-light uppercase tracking-tag',
        toneSurfaceClasses[tone],
        className,
      )}
    />
  );
}

