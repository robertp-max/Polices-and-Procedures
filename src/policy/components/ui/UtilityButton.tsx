import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface UtilityButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  ariaLabel: string;
  children: ReactNode;
}

/** Square 36×36 icon utility button — used in headers, drawers, toolbars. */
export function UtilityButton({ ariaLabel, className, children, ...rest }: UtilityButtonProps) {
  return (
    <button
      {...rest}
      aria-label={ariaLabel}
      title={rest.title ?? ariaLabel}
      className={'ci-util-btn ' + (className ?? '')}
    >
      {children}
    </button>
  );
}
