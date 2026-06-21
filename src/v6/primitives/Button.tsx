import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cx } from '../utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  selected?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-brand-teal bg-brand-teal text-on-brand shadow-rest hover:shadow-hover',
  secondary: 'border-brand-teal bg-surface text-brand-teal hover:bg-surface-hover',
  tertiary: 'border-transparent bg-transparent text-ink hover:bg-surface-hover',
  destructive: 'border-tone-red-border bg-tone-red-bg text-tone-red-text hover:border-tone-red-text',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-tap px-sm text-sm',
  md: 'min-h-tap px-md text-body',
  lg: 'min-h-tap px-lg text-body',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      iconLeft,
      iconRight,
      loading = false,
      selected = false,
      size = 'md',
      type = 'button',
      variant = 'primary',
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        {...props}
        ref={ref}
        aria-busy={loading || undefined}
        aria-pressed={selected || undefined}
        className={cx(
          'inline-flex items-center justify-center gap-sm rounded-md border font-light tracking-normal',
          'transition duration-fast ease-standard',
          'focus-visible:outline-none focus-visible:shadow-focus',
          'active:scale-press disabled:cursor-not-allowed disabled:opacity-60',
          selected && 'shadow-focus',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        disabled={isDisabled}
        type={type}
      >
        {loading ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : iconLeft}
        {children}
        {iconRight}
      </button>
    );
  },
);

Button.displayName = 'Button';
