import { UserRound } from 'lucide-react';
import { cx } from '../utils/classNames';

export interface TopbarProps {
  className?: string;
  isPersonalOpsOpen?: boolean;
  onPersonalOpsToggle?: () => void;
}

/* Floating dock = a single clean personal-operations toggle. No expand, no
   stagger, no theme/logout here — those live inside the Personal Operations
   panel. (Static button → no icon jump on toggle.) */
export function Topbar({ className, isPersonalOpsOpen, onPersonalOpsToggle }: TopbarProps) {
  return (
    <button
      type="button"
      onClick={() => onPersonalOpsToggle?.()}
      aria-label="Personal operations"
      aria-pressed={!!isPersonalOpsOpen}
      title="Personal operations"
      className={cx(
        'grid h-11 w-11 place-items-center rounded-full bg-brand-orange text-white shadow-shell-dock transition-colors duration-fast hover:bg-brand-orange-deep focus-visible:outline-none focus-visible:shadow-focus',
        className,
      )}
    >
      <UserRound aria-hidden="true" className="h-icon-md w-icon-md" />
    </button>
  );
}
