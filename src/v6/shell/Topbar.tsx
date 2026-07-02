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
        'group relative grid h-12 w-[84px] place-items-center overflow-visible rounded-xl bg-transparent text-[var(--text-primary)] transition duration-500 ease-standard hover:text-[var(--brand-teal)] focus-visible:outline-none focus-visible:shadow-focus',
        className,
      )}
    >
      <UserRound aria-hidden="true" className="h-10 w-10 transition duration-500 ease-standard group-hover:scale-75 group-hover:opacity-0 group-focus-visible:scale-75 group-focus-visible:opacity-0" />
      <span className="pointer-events-none absolute left-1/2 top-1/2 w-[84px] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-transparent px-3 py-2 text-center text-xs font-medium text-[var(--text-primary)] opacity-0 shadow-none backdrop-blur-none transition duration-500 ease-standard group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100">
        me :D
      </span>
    </button>
  );
}
