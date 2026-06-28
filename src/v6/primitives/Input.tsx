import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../utils/classNames';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, disabled, invalid = false, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        'h-control w-full rounded-md border bg-surface-glass backdrop-blur-md shadow-glass-inset px-md text-body font-light text-ink shadow-none',
        'placeholder:text-muted',
        'transition duration-fast ease-standard',
        'hover:border-strong focus-visible:outline-none focus-visible:shadow-focus',
        'disabled:cursor-not-allowed disabled:bg-tone-slate-bg disabled:text-disabled disabled:opacity-80',
        invalid && 'border-tone-red-border text-tone-red-text',
        className,
      )}
      disabled={disabled}
    />
  ),
);

Input.displayName = 'Input';
