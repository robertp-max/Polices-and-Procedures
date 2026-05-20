import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import ciLogoWhite from '@/assets/ci-logo-white.png'

export type V3ShellNavItem = {
  label: string
  to: string
  icon: ReactNode
  end?: boolean
  /** Optional section/group label for rich sidebar (matches real app PDF screenshots) */
  group?: string
}

type V3CollapsibleSidebarNavProps = {
  items: readonly V3ShellNavItem[]
  collapsed: boolean
  onToggle: () => void
}

export function V3CollapsibleSidebarNav({
  items,
  collapsed,
  onToggle,
}: V3CollapsibleSidebarNavProps) {
  // Group items by their `group` field to match the rich sectional sidebar
  // from the real app PDF screenshots (PRIMARY OPERATIONS, COMPLIANCE EXECUTION, ADMINISTRATION / KNOWLEDGE)
  const grouped: Record<string, V3ShellNavItem[]> = {}
  for (const item of items) {
    const g = item.group || 'OTHER'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(item)
  }
  const groupOrder = ['PRIMARY OPERATIONS', 'COMPLIANCE EXECUTION', 'ADMINISTRATION / KNOWLEDGE', 'OTHER']

  return (
    <aside
      className={`v3-shell-sidebar ${collapsed ? 'v3-shell-sidebar--collapsed' : ''}`}
      aria-label="Workbench navigation"
      style={{ background: '#05060a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo header — matches real app sidebar from APP_Screenshots.pdf exactly (icon + "Care Indeed" + "HOME HEALTH V3") */}
      <div className="v3-nav-logo flex items-center gap-2.5 px-3 pt-3 pb-2">
        <img
          src={ciLogoWhite}
          alt="Care Indeed"
          className="h-7 w-auto opacity-95"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        {!collapsed && (
          <div className="flex flex-col leading-none">
            <span className="text-[14px] font-semibold tracking-[-0.2px] text-[#f1f3f7]">Care Indeed</span>
            <span className="text-[8.5px] text-[#64748B] tracking-[0.5px]">HOME HEALTH V3</span>
          </div>
        )}
      </div>
      <div className="v3-nav-header px-2 mb-2">
        <button
          type="button"
          className="v3-shell-hamburger"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          <span aria-hidden="true" className="v3-shell-hamburger-line" />
          <span aria-hidden="true" className="v3-shell-hamburger-line" />
          <span aria-hidden="true" className="v3-shell-hamburger-line" />
        </button>
      </div>

      {/* Sectioned navigation list — mirrors the rich grouped structure in the PDF screenshots */}
      <nav className="v3-shell-navlist flex-1 space-y-3.5 overflow-y-auto pr-1 text-[13px]">
        {groupOrder.map((groupName) => {
          const groupItems = grouped[groupName]
          if (!groupItems || groupItems.length === 0) return null
          return (
            <div key={groupName} className="v3-nav-section">
              {!collapsed && (
                <div className="v3-nav-section-title px-3 mb-1 text-[8px] font-bold uppercase tracking-[1.8px] text-[#64748B]">
                  {groupName}
                </div>
              )}
              {groupItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `v3-shell-navitem transition-all duration-300 ${isActive ? 'v3-shell-navitem--active ring-1 ring-[#007970]/30' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="v3-shell-navicon" aria-hidden="true">{item.icon}</span>
                  {!collapsed && <span className="v3-shell-navlabel">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>

      {/* User section at bottom — rich profile block matching screenshots (avatar + name + role) */}
      <div className="v3-nav-footer mt-auto pt-4 border-t border-[var(--v3-border)] border-dashed">
        <div className={`flex items-center gap-2.5 px-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#007970] to-[#E07B2C] flex items-center justify-center text-[10px] font-bold text-white shadow-inner ring-1 ring-white/20 flex-shrink-0">
            TP
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0 leading-tight">
              <span className="text-xs font-semibold text-[var(--v3-text-primary)] truncate">Taylor P.</span>
              <span className="text-[9px] text-[var(--v3-text-tertiary)] uppercase tracking-[0.3px]">Administrator • Premium</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}