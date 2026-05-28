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
  const workflowLinkClass = (active: boolean) =>
    `ml-8 mt-1 flex items-center gap-3 rounded-lg px-3 py-2 font-montserrat text-[11px] font-semibold transition-colors ${
      active
        ? 'bg-brand-teal/10 text-brand-teal'
        : 'text-text-muted hover:bg-border hover:text-text-primary'
    }`;

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
  const linkClass = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 font-montserrat text-xs font-semibold transition-colors ${
      active
        ? 'bg-brand-teal/10 text-brand-teal'
        : 'text-text-muted hover:bg-border hover:text-text-primary'
    }`;

  return (
    <nav
      data-shell-navrail
      className="custom-scrollbar hidden w-[var(--ci-shell-navrail-width)] flex-shrink-0 flex-col overflow-y-auto border-r border-border bg-surface py-5 lg:flex"
      aria-label="Primary navigation"
    >
      <div className="px-4 space-y-7">
        <ShellCommandGroup title="Primary Operations">
          {primaryItems.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              onClick={() => onItemClick?.(item)}
              className={linkClass(isActive(item.to))}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          ))}
        </ShellCommandGroup>

        {cesItems.length > 0 && (
          <ShellCommandGroup title="Compliance Execution">
            {cesItems.map((item) => {
              const workflowSubItem = item.id === 'ces'
                ? item.subItems?.find(sub => sub.to === '/workflows')
                : undefined;

              return (
                <div key={item.id}>
                  <Link
                    to={item.to}
                    onClick={() => onItemClick?.(item)}
                    className={linkClass(isActive(item.to))}
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                  {workflowSubItem && (
                    <Link
                      to={workflowSubItem.to}
                      onClick={() => onItemClick?.({ ...item, to: workflowSubItem.to, label: workflowSubItem.label })}
                      className={workflowLinkClass(isActive(workflowSubItem.to))}
                    >
                      <span>{workflowSubItem.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}
          </ShellCommandGroup>
        )}

        {otherItems.length > 0 && (
          <ShellCommandGroup title="Administration / Knowledge">
            {otherItems.map((item) => (
              <Link
                key={item.id}
                to={item.to}
                onClick={() => onItemClick?.(item)}
                className={linkClass(isActive(item.to))}
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
