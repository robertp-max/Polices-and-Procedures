import { Bell, CalendarDays, Menu, UserRound } from 'lucide-react';
import { IconButton } from '../primitives';

export function Topbar() {
  return (
    <div className="pointer-events-none absolute right-3xl top-2xl z-shell flex items-center gap-md text-brand-teal-deep">
      <IconButton
        aria-label="Open navigation drawer placeholder"
        className="pointer-events-auto laptop:hidden"
        icon={<Menu aria-hidden="true" className="h-icon-sm w-icon-sm" />}
        variant="secondary"
      />
      <IconButton
        aria-label="Open calendar"
        className="pointer-events-auto rounded-lg bg-surface shadow-rest"
        icon={<CalendarDays aria-hidden="true" className="h-icon-sm w-icon-sm" />}
        variant="tertiary"
      />
      <span className="relative">
        <IconButton
          aria-label="Open notifications"
          className="pointer-events-auto rounded-lg bg-surface shadow-rest"
          icon={<Bell aria-hidden="true" className="h-icon-sm w-icon-sm" />}
          variant="tertiary"
        />
        <span className="absolute right-sm top-sm h-xs w-xs rounded-sm bg-brand-orange" />
      </span>
      <IconButton
        aria-label="Open user menu"
        className="pointer-events-auto rounded-lg bg-surface shadow-rest"
        icon={<UserRound aria-hidden="true" className="h-icon-sm w-icon-sm" />}
        variant="tertiary"
      />
    </div>
  );
}
