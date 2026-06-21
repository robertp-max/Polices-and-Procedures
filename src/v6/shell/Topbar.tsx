import { Bell, CalendarDays, UserRound } from 'lucide-react';
import { IconButton } from '../primitives';
import { cx } from '../utils/classNames';

export interface TopbarProps {
  className?: string;
  isPersonalOpsOpen?: boolean;
  onPersonalOpsToggle?: () => void;
}

export function Topbar({ className, isPersonalOpsOpen, onPersonalOpsToggle }: TopbarProps) {
  return (
    <div className={cx('flex items-center gap-sm text-brand-teal-deep', className)}>
      <IconButton
        aria-label="Open calendar"
        className="h-tap w-tap rounded-lg border-tone-teal-border/60 bg-white/85 p-0 shadow-rest"
        icon={<CalendarDays aria-hidden="true" className="h-icon-sm w-icon-sm" />}
        variant="tertiary"
      />
      <span className="relative">
        <IconButton
          aria-label="Open notifications"
          className="h-tap w-tap rounded-lg border-tone-teal-border/60 bg-white/85 p-0 shadow-rest"
          icon={<Bell aria-hidden="true" className="h-icon-sm w-icon-sm" />}
          variant="tertiary"
        />
        <span className="absolute right-sm top-sm h-xs w-xs rounded-sm bg-brand-orange" />
      </span>
      <div className="relative flex pointer-events-auto">
        <IconButton
          aria-label="Open user menu"
          className={cx(
            'h-tap w-tap rounded-lg border-tone-teal-border/60 p-0 shadow-rest transition-colors',
            isPersonalOpsOpen ? 'bg-brand-teal text-on-brand' : 'bg-white/85 text-brand-teal-deep',
          )}
          icon={<UserRound aria-hidden="true" className="h-icon-sm w-icon-sm" />}
          onClick={onPersonalOpsToggle}
          variant={isPersonalOpsOpen ? "primary" : "tertiary"}
        />
      </div>
    </div>
  );
}

