import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShellCommandGroup } from './ShellCommandGroup';

export interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
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
 * Surface colors flow through `--ci-color-shell-navrail-bg` /
 * `--ci-color-border-subtle` declared per (data-theme, data-ci-mode) in
 * src/index.css — no JS-side theme branching.
 *
 * Must only be rendered on >=1024px (controlled by parent).
 */
export const ShellNavRail: React.FC<ShellNavRailProps> = ({ items, onItemClick }) => {
  const location = useLocation();

  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + '/');

  // Phase 2 §4 — three semantic command groups per
  // Phase2_Exit_Criteria_Checklist.md: Primary Operations, Compliance
  // Execution (CES), Administration / Knowledge.
  // FIXED: robust id-based grouping instead of brittle index slices (prevents duplicate/misplaced items after nav changes)
  const primaryIds = ['dashboard', 'clinician-profiles', 'patient-profiles', 'staffing-calendar', 'iadmin']
  const cesIds = ['ces', 'taxonomy', 'onboarding', 'lifecycle', 'evidence']
  const primaryItems = items.filter(i => primaryIds.includes(i.id))
  const cesItems = items.filter(i => cesIds.includes(i.id))
  const otherItems = items.filter(i => !primaryIds.includes(i.id) && !cesIds.includes(i.id))

  // Shared per-link styling. Active state uses the canonical --ci-accent
  // token (auto-resolves to brand teal in CI-light, gold in CI-ION dark)
  // via inline style rather than Tailwind arbitrary values, because
  // `bg-[var(...)]/10` cannot be parsed when the var has a comma-list
  // fallback (`--ci-accent-rgb: 255, 193, 7`).
  const linkClass = 'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors';
  const linkStyle = (active: boolean): React.CSSProperties => active
    ? { background: 'rgba(var(--ci-accent-rgb), 0.1)', color: 'var(--ci-accent)', fontWeight: 500 }
    : { color: 'var(--ci-text-muted)' };

  return (
    <nav
      data-shell-navrail
      className="hidden lg:flex flex-col border-r py-4 overflow-y-auto flex-shrink-0"
      // eslint-disable-next-line react/forbid-dom-props -- canonical shell-navrail surface; values resolve from --ci-color-* tokens
      style={{
        width: 'var(--ci-shell-navrail-width)',
        background: 'var(--ci-color-shell-navrail-bg)',
        borderColor: 'var(--ci-color-border-subtle)',
        backdropFilter: 'var(--ci-color-glass-blur)',
        WebkitBackdropFilter: 'var(--ci-color-glass-blur)',
      }}
      aria-label="Primary navigation"
    >
      <div className="px-3 space-y-4">
        <ShellCommandGroup title="Primary Operations">
          {primaryItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              onClick={() => onItemClick?.(item)}
              className={`${linkClass} hover:bg-white/5`}
              style={linkStyle(isActive(item.to))}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </ShellCommandGroup>

        {cesItems.length > 0 && (
          <ShellCommandGroup title="Compliance Execution">
            {cesItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => onItemClick?.(item)}
                className={`${linkClass} hover:bg-white/5`}
                style={linkStyle(isActive(item.to))}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </ShellCommandGroup>
        )}

        {otherItems.length > 0 && (
          <ShellCommandGroup title="Administration / Knowledge">
            {otherItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => onItemClick?.(item)}
                className={`${linkClass} hover:bg-white/5`}
                style={linkStyle(isActive(item.to))}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </ShellCommandGroup>
        )}
      </div>
    </nav>
  );
};

export default ShellNavRail;