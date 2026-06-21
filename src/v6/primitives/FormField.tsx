import { type ReactNode, useId } from 'react';
import { cx } from '../utils/classNames';

export interface FormFieldRenderProps {
  describedBy?: string;
  id: string;
  invalid: boolean;
}

export interface FormFieldProps {
  children: (props: FormFieldRenderProps) => ReactNode;
  className?: string;
  error?: ReactNode;
  help?: ReactNode;
  id?: string;
  label: ReactNode;
  required?: boolean;
}

export function FormField({
  children,
  className,
  error,
  help,
  id,
  label,
  required = false,
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const helpId = help ? `${fieldId}-help` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(' ') || undefined;
  const invalid = Boolean(error);

  return (
    <div className={cx('grid gap-xs text-body font-light text-ink', className)}>
      <label className="text-sm text-secondary" htmlFor={fieldId}>
        {label}
        {required ? <span className="ml-xs text-tone-orange-text">Required</span> : null}
      </label>
      {children({ describedBy, id: fieldId, invalid })}
      {help ? (
        <p className="text-xs text-muted" id={helpId}>
          {help}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-tone-red-text" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
