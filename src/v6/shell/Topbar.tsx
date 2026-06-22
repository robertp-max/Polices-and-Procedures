import { useRef, useState } from 'react';
import { Bot, Search, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '../primitives';
import { cx } from '../utils/classNames';

export interface TopbarProps {
  className?: string;
  isPersonalOpsOpen?: boolean;
  onPersonalOpsToggle?: () => void;
}

export function Topbar({ className, isPersonalOpsOpen, onPersonalOpsToggle }: TopbarProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const retractTimer = useRef<number | undefined>(undefined);

  const clearRetractTimer = () => {
    if (retractTimer.current) {
      window.clearTimeout(retractTimer.current);
      retractTimer.current = undefined;
    }
  };

  const expandDock = () => {
    clearRetractTimer();
    setIsExpanded(true);
  };

  const scheduleRetract = () => {
    clearRetractTimer();
    retractTimer.current = window.setTimeout(() => {
      setIsExpanded(false);
    }, 1500);
  };

  const selectAction = (action: () => void) => {
    clearRetractTimer();
    action();
    setIsExpanded(false);
  };

  const dockButtonClass =
    'h-9 w-9 rounded-full border-transparent bg-transparent p-0 !text-brand-orange shadow-none transition duration-fast hover:bg-tone-orange-bg hover:!text-brand-orange focus-visible:shadow-focus';

  return (
    <div
      className={cx(
        'flex h-12 items-center justify-end overflow-hidden rounded-full border border-tone-orange-border/70 p-1 shadow-shell-dock backdrop-blur-xl transition-[width,transform,box-shadow,background-color] duration-base ease-standard',
        isExpanded ? 'w-[136px] bg-white/[0.94]' : 'w-12 bg-brand-orange',
        className,
      )}
      onFocus={expandDock}
      onMouseEnter={expandDock}
      onMouseLeave={scheduleRetract}
    >
      <div className="flex items-center gap-1">
        <IconButton
          aria-label="Open search"
          className={cx(dockButtonClass, !isExpanded && 'pointer-events-none opacity-0')}
          icon={<Search aria-hidden="true" className="h-icon-md w-icon-md" />}
          onClick={() => selectAction(() => navigate('/help'))}
          tabIndex={isExpanded ? 0 : -1}
          variant="tertiary"
        />
        <IconButton
          aria-label="Open Brad"
          className={cx(dockButtonClass, !isExpanded && 'pointer-events-none opacity-0')}
          icon={<Bot aria-hidden="true" className="h-icon-md w-icon-md" />}
          onClick={() => selectAction(() => navigate('/iadministrator'))}
          tabIndex={isExpanded ? 0 : -1}
          variant="tertiary"
        />
        <IconButton
          aria-label="Open personal operations"
          className={cx(
            'h-10 w-10 rounded-full border border-orange-200/70 bg-brand-orange p-0 text-white shadow-dock-action transition duration-fast hover:bg-brand-orange hover:text-white',
            isPersonalOpsOpen && 'text-white shadow-personal-active',
          )}
          icon={<UserRound aria-hidden="true" className="h-icon-md w-icon-md" />}
          onClick={() => selectAction(() => onPersonalOpsToggle?.())}
          variant="tertiary"
        />
      </div>
    </div>
  );
}
