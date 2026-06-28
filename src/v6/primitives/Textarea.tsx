import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cx } from '../utils/classNames';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, disabled, invalid = false, rows = 4, ...props }, ref) => (
    <textarea
      {...props}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        'min-h-tap w-full resize-y rounded-md border bg-surface-glass backdrop-blur-md shadow-glass-inset px-md py-sm text-body font-light text-ink shadow-none',
        'placeholder:text-muted',
        'transition duration-fast ease-standard',
        'hover:border-strong focus-visible:outline-none focus-visible:shadow-focus',
        'disabled:cursor-not-allowed disabled:bg-tone-slate-bg disabled:text-disabled disabled:opacity-80',
        invalid && 'border-tone-red-border text-tone-red-text',
        className,
      )}
      disabled={disabled}
      rows={rows}
    />
  ),
);

Textarea.displayName = 'Textarea';
