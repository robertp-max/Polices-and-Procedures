import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Button, type ButtonVariant } from './Button';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string;
  icon: ReactNode;
  loading?: boolean;
  selected?: boolean;
  variant?: ButtonVariant;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, variant = 'tertiary', className, ...props }, ref) => (
    <Button
      {...props}
      ref={ref}
      className={className}
      iconLeft={icon}
      size="sm"
      variant={variant}
    />
  ),
);

IconButton.displayName = 'IconButton';
