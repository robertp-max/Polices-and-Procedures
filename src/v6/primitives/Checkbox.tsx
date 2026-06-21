import { forwardRef, type InputHTMLAttributes } from 'react';
import { cx } from '../utils/classNames';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, disabled, invalid = false, ...props }, ref) => (
    <input
      {...props}
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cx(
        'h-icon-sm w-icon-sm rounded-sm border border-card accent-brand-teal',
        'transition duration-fast ease-standard',
        'focus-visible:outline-none focus-visible:shadow-focus',
        'disabled:cursor-not-allowed disabled:opacity-60',
        invalid && 'border-tone-red-border',
        className,
      )}
      disabled={disabled}
      type="checkbox"
    />
  ),
);

Checkbox.displayName = 'Checkbox';
