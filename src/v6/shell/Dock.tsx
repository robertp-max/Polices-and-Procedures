import type { ReactNode } from 'react';

interface DockItemConfig {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  badgeCount?: number;
  isActive?: boolean;
  /** Stable anchor for Brad guided tours (data-tour-target). */
  tourTarget?: string;
}

interface DockProps {
  items: DockItemConfig[];
  className?: string;
}

function DockItem({ icon, label, onClick, badgeCount, isActive, tourTarget }: DockItemConfig) {
  return (
    <button
      type="button"
      data-tour-target={tourTarget}
      onClick={onClick}
      className={`v6-dock-item relative inline-flex h-11 w-11 items-center justify-center overflow-visible rounded-full text-ink transition duration-300 ease-standard hover:bg-black/[0.04] hover:text-brand-teal-deep ${
        isActive ? 'v6-dock-item-active bg-black/[0.06] text-brand-teal' : ''
      }`}
      aria-label={label}
    >
      <span
        className="v6-dock-item__icon flex shrink-0 items-center justify-center"
      >
        {icon}
      </span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-medium text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
      {isActive && <span className="absolute -bottom-1.5 h-1.5 w-1.5 rounded-full bg-brand-teal" />}
    </button>
  );
}

export default function Dock({ items, className = '' }: DockProps) {
  return (
    <div
      className={`flex w-fit items-center gap-4 bg-transparent p-0 ${className}`}
      role="toolbar"
      aria-label="Application dock"
    >
      {items.map((item) => (
        <DockItem key={item.label} {...item} />
      ))}
    </div>
  );
}
