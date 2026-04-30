import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ActionButtonVariant = 'cta' | 'secondary' | 'ghost' | 'danger';
export type ActionButtonSize = 'sm' | 'md' | 'lg';

export interface ActionButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

/** CTA / Secondary / Ghost / Danger button — token-driven. */
export function ActionButton({
  variant = 'secondary',
  size = 'md',
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ActionButtonProps) {
  const variantClass =
    variant === 'cta'
      ? 'ci-btn--cta'
      : variant === 'ghost'
        ? 'ci-btn--ghost'
        : variant === 'danger'
          ? ''
          : 'ci-btn--secondary';
  const sizeClass = size === 'sm' ? 'ci-btn--sm' : size === 'lg' ? 'ci-btn--lg' : '';
  const dangerStyle =
    variant === 'danger'
      ? {
          background: 'var(--ci-danger-fg)',
          color: '#FFFFFF',
          border: '1px solid var(--ci-danger-fg)',
        }
      : undefined;
  return (
    <button
      {...rest}
      className={['ci-btn', variantClass, sizeClass, className].filter(Boolean).join(' ')}
      style={{ ...dangerStyle, ...rest.style }}
    >
      {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
      <span>{children}</span>
      {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
