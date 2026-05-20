import { useState, type ReactNode } from 'react'
import { V3CollapsibleSidebarNav, type V3ShellNavItem } from './V3CollapsibleSidebarNav'
import { V3TopBar } from './V3TopBar'
import { v3WorkbenchNavItems } from './v3WorkbenchNavItems'
import '../ui-staging.css'

type V3WorkbenchShellProps = {
  title: string
  subtitle?: string
  searchPlaceholder?: string
  navItems?: readonly V3ShellNavItem[]
  children: ReactNode
}

export function V3WorkbenchShell({
  title,
  subtitle,
  searchPlaceholder,
  navItems = v3WorkbenchNavItems,
  children,
}: V3WorkbenchShellProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <main data-v3-ui-staging-root="true" className="v3-canvas v3-no-scrollbar v3-staging-page flex min-h-screen w-full relative" style={{ background: 'transparent' }}>
      {/* Q3 Watermark 0.33 exact per ClaudeX2 Veil Glass rules — present across shell previews for PDF match */}
      <div className="v3-watermark" style={{ zIndex: 0 }} />
      {/* Full-bleed veil shell for exact PDF screenshot match (sidebar + main content glass) */}
      <section 
        data-v3-main-card="true" 
        className="v3-shell-card w-full overflow-hidden border-0 bg-transparent flex flex-col relative z-10"
      >
        <div className={`v3-shell-grid ${collapsed ? 'v3-shell-grid--collapsed' : ''}`}>
          <V3CollapsibleSidebarNav
            items={navItems}
            collapsed={collapsed}
            onToggle={() => setCollapsed(prev => !prev)}
          />

          <section className="v3-shell-main flex flex-col">
            <V3TopBar
              title={title}
              subtitle={subtitle}
              searchPlaceholder={searchPlaceholder}
            />
            <div className="v3-shell-content flex-1 overflow-auto v3-no-scrollbar">{children}</div>
          </section>
        </div>
      </section>
    </main>
  )
}