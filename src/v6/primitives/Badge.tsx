import { type HTMLAttributes } from 'react';
import { cx } from '../utils/classNames';

export type BadgeSize = 'sm' | 'md';
export type BadgeVariant = 'count' | 'label';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  size?: BadgeSize;
  variant?: BadgeVariant;
}

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-xs py-xs text-xs',
  md: 'px-sm py-xs text-sm',
};

export function Badge({ className, size = 'md', variant = 'label', ...props }: BadgeProps) {
  return (
    <span
      {...props}
      className={cx(
        'inline-flex items-center rounded-sm border border-hairline bg-tone-slate-bg font-light text-muted',
        variant === 'count' && 'tabular-nums',
        sizeClasses[size],
        className,
      )}
    />
  );
}
