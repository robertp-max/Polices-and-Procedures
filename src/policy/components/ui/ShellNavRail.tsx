import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShellCommandGroup } from './ShellCommandGroup';
import { useCiModeStore } from '@/policy/stores/ciModeStore';

export interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featureId?: string;
  subItems?: Array<{ to: string; label: string }>;
}

interface ShellNavRailProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
}

/**
 * ShellNavRail
 *
 * Desktop/laptop vertical navigation rail.
 * Groups navigation into logical command clusters using ShellCommandGroup.
 *
 * Must only be rendered on >=1024px (controlled by parent).
 */
export const ShellNavRail: React.FC<ShellNavRailProps> = ({ items, onItemClick }) => {
  const location = useLocation();
  const { isLight } = useCiModeStore();

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <nav 
      className="hidden lg:flex w-64 flex-col border-r py-4 overflow-y-auto"
      style={{
        background: isLight 
          ? 'var(--ci-color-glass-light-main, rgba(255,255,255,0.85))' 
          : 'var(--ci-color-glass-dark-main, rgba(66,8,8,0.42))',
        borderColor: 'var(--ci-border, rgba(255,255,255,0.08))',
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Primary navigation"
    >
      <div className="px-3 space-y-6">
        {/* We will group items in the parent for now.
            For a full implementation, items would be passed pre-grouped. */}
        <ShellCommandGroup title="Operations">
          {items.slice(0, 5).map((item) => (
            <Link
              key={item.id}
              to={item.to}
              onClick={() => onItemClick?.(item)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive(item.to) 
                  ? 'bg-[var(--ci-accent-rgb,255,193,7)]/10 text-[var(--ci-accent)] font-medium' 
                  : 'hover:bg-white/5 text-[var(--ci-text-muted)]'}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </ShellCommandGroup>

        {/* Additional groups can be added here when we refactor the NAV_ITEMS structure */}
      </div>
    </nav>
  );
};

export default ShellNavRail;