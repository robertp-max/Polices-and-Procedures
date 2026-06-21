import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cx } from '../utils/classNames';

export interface SelectOption {
  disabled?: boolean;
  label: string;
  value: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  emptyLabel?: string;
  invalid?: boolean;
  options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, disabled, emptyLabel = 'No options available', invalid = false, options, ...props }, ref) => {
    const hasOptions = options.length > 0;

    return (
      <select
        {...props}
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cx(
          'h-control w-full rounded-md border bg-surface px-md text-body font-light text-ink shadow-none',
          'transition duration-fast ease-standard',
          'hover:border-strong focus-visible:outline-none focus-visible:shadow-focus',
          'disabled:cursor-not-allowed disabled:bg-tone-slate-bg disabled:text-disabled disabled:opacity-80',
          invalid && 'border-tone-red-border text-tone-red-text',
          className,
        )}
        disabled={disabled || !hasOptions}
      >
        {hasOptions ? null : <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option disabled={option.disabled} key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  },
);

Select.displayName = 'Select';
