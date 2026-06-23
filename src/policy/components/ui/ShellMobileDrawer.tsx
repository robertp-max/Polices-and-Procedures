/**
 * ShellMobileDrawer — Phase 2 canonical mobile navigation surface.
 *
 * Phase2_Exit_Criteria_Checklist.md §6 (Mobile Drawer Composition):
 * a thin, nav-aware wrapper around BottomSheetDrawer that knows how
 * to render NavItem rows. CommandCenterLayout (and any future shell
 * caller) can mount this on viewports < lg to replace the bespoke
 * full-screen modal pattern without re-implementing focus, escape,
 * swipe-dismiss or backdrop semantics.
 *
 * Deliberately thin — no own focus trap, no own escape handler. We
 * inherit those from BottomSheetDrawer so the two primitives stay in
 * lockstep. If a future ticket adds a focus trap here it MUST also
 * add one to RightDrawer / BottomSheetDrawer so the contract holds.
 *
 * Token policy: this file MUST NOT introduce raw hex colours. The
 * active row uses `var(--ci-accent)` + `rgba(var(--ci-accent-rgb), …)`
 * which auto-resolves to teal / gold per brand theme.
 */
import { type ReactNode } from 'react';
import { BottomSheetDrawer } from './BottomSheetDrawer';
import type { NavItem } from './ShellNavRail';

export interface ShellMobileDrawerProps {
  /** Drawer visibility. */
  open: boolean;
  /** Close handler — fired by backdrop tap, Escape key, or swipe-dismiss. */
  onClose: () => void;
  /** Navigation items to render as rows. */
  items: NavItem[];
  /** Current pathname for active-row highlighting. */
  currentPath: string;
  /** Per-item click handler. Caller is responsible for navigation + onClose. */
  onItemClick: (item: NavItem) => void;
  /** Optional sheet eyebrow label. Default: "Navigation". */
  eyebrow?: string;
  /** Optional sheet title. Default: "Menu". */
  title?: ReactNode;
  /** Optional footer slot (e.g. logout button, theme toggle row). */
  footer?: ReactNode;
  /** Sheet max-height variant. Default 'lg' (80vh). */
  height?: 'sm' | 'md' | 'lg';
}

/**
 * Active-row predicate. Mirrors ShellNavRail's predicate so behaviour is
 * consistent across desktop rail and mobile drawer.
 */
const isActive = (currentPath: string, to: string): boolean =>
  currentPath === to || currentPath.startsWith(to + '/');

export function ShellMobileDrawer({
  open,
  onClose,
  items,
  currentPath,
  onItemClick,
  eyebrow = 'Navigation',
  title = 'Menu',
  footer,
  height = 'lg',
}: ShellMobileDrawerProps) {
  return (
    <BottomSheetDrawer
      open={open}
      onClose={onClose}
      eyebrow={eyebrow}
      title={title}
      footer={footer}
      height={height}
    >
      <nav aria-label="Mobile navigation" className="flex flex-col py-2">
        {items.map((item) => {
          const active = isActive(currentPath, item.to);
          const hasSubItems = !!item.subItems && item.subItems.length > 0;
          const visibleSubItems = item.id === 'ces'
            ? item.subItems?.filter(sub => sub.to !== '/workflows')
            : item.subItems;
          const workflowSubItem = item.id === 'ces'
            ? item.subItems?.find(sub => sub.to === '/workflows')
            : undefined;

          // Items with subItems render as a section: a non-interactive
          // group header (icon + label) followed by indented sub-rows.
          // This flattens the legacy drill-down pattern to a single-screen
          // list — better fit for narrow viewports.
          if (hasSubItems) {
            return (
              <div key={item.id} className="mt-2 first:mt-0">
                <div
                  className="flex items-center gap-3 px-4 py-2 text-[10px] font-roboto font-light uppercase tracking-[0.2em]"
                  style={{ color: 'var(--ci-text-subtle)' }}
                >
                  <item.icon size={16} aria-hidden="true" />
                  <span>{item.label.toUpperCase()}</span>
                </div>
                {visibleSubItems!.map((sub, idx) => {
                  const subActive = currentPath === sub.to || currentPath.startsWith(sub.to + '/');
                  return (
                    <button
                      key={`${item.id}-${idx}`}
                      type="button"
                      onClick={() => onItemClick({ ...item, to: sub.to, label: sub.label })}
                      className="ci-touch-target w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-[14px] text-left rounded-lg transition-colors hover:bg-white/5"
                      style={
                        subActive
                          ? {
                              background: 'rgba(var(--ci-accent-rgb), 0.12)',
                              color: 'var(--ci-accent)',
                              fontWeight: 600,
                            }
                          : { color: 'var(--ci-text)' }
                      }
                      aria-current={subActive ? 'page' : undefined}
                    >
                      <span className="flex-1">{sub.label}</span>
                    </button>
                  );
                })}
                {workflowSubItem && (
                  <button
                    type="button"
                    onClick={() => onItemClick({ ...item, to: workflowSubItem.to, label: workflowSubItem.label })}
                    className="ci-touch-target w-full flex items-center gap-3 pl-10 pr-4 py-2.5 text-[14px] text-left rounded-lg transition-colors hover:bg-white/5"
                    style={
                      isActive(currentPath, workflowSubItem.to)
                        ? {
                            background: 'rgba(var(--ci-accent-rgb), 0.12)',
                            color: 'var(--ci-accent)',
                            fontWeight: 600,
                          }
                        : { color: 'var(--ci-text)' }
                    }
                    aria-current={isActive(currentPath, workflowSubItem.to) ? 'page' : undefined}
                  >
                    <span className="flex-1">{workflowSubItem.label}</span>
                  </button>
                )}
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item)}
              className="ci-touch-target flex items-center gap-3 px-4 py-3 text-[15px] text-left rounded-lg transition-colors hover:bg-white/5"
              style={
                active
                  ? {
                      background: 'rgba(var(--ci-accent-rgb), 0.12)',
                      color: 'var(--ci-accent)',
                      fontWeight: 600,
                    }
                  : { color: 'var(--ci-text)' }
              }
              aria-current={active ? 'page' : undefined}
            >
              <item.icon size={20} aria-hidden="true" />
              <span className="flex-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </BottomSheetDrawer>
  );
}
