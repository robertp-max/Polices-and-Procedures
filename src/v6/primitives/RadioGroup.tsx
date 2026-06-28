import { type ReactNode } from 'react';
import { cx } from '../utils/classNames';

export interface RadioOption {
  disabled?: boolean;
  help?: ReactNode;
  label: ReactNode;
  value: string;
}

export interface RadioGroupProps {
  className?: string;
  disabled?: boolean;
  legend: ReactNode;
  name: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  value?: string;
}

export function RadioGroup({
  className,
  disabled = false,
  legend,
  name,
  onChange,
  options,
  value,
}: RadioGroupProps) {
  return (
    <fieldset className={cx('grid gap-sm text-body font-light text-ink', className)} disabled={disabled}>
      <legend className="mb-xs text-sm text-secondary">{legend}</legend>
      {options.map((option) => {
        const optionId = `${name}-${option.value}`;
        const optionDisabled = disabled || option.disabled;

        return (
          <label
            className={cx(
              'flex min-h-tap items-start gap-sm rounded-md border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-sm',
              'transition duration-fast ease-standard hover:bg-surface-hover',
              'focus-within:shadow-focus',
              optionDisabled && 'cursor-not-allowed opacity-60',
              value === option.value && 'border-brand-teal bg-tone-teal-bg',
            )}
            htmlFor={optionId}
            key={option.value}
          >
            <input
              checked={value === option.value}
              className="mt-xs h-icon-sm w-icon-sm accent-brand-teal focus-visible:outline-none focus-visible:shadow-focus"
              disabled={optionDisabled}
              id={optionId}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span className="grid gap-xs">
              <span>{option.label}</span>
              {option.help ? <span className="text-xs text-muted">{option.help}</span> : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
