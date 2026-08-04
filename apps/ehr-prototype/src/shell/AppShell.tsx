import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, MessagesSquare, Plus, Search, ShieldCheck, BadgeCheck, ExternalLink } from 'lucide-react'
import { notifications } from '../data/clinical'
import { NAV_COUNTS, NAV_GROUPS } from '../data/navigation'
import { getIntegrationHref } from '../data/integrationTargets'
import { CommandPalette } from './CommandPalette'
import './shell.css'

/* Navigation is derived from the requirements register — see data/navigation.ts. */

const MODES = [
  { to: '/business-plan', label: 'Business Plan' },
  { to: '/requirements', label: 'Requirements' },
  { to: '/mvp-policy', label: 'MVP Policy' },
  { to: '/today', label: 'Prototype' },
]

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const [bellOpen, setBellOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const activeMode = location.pathname.startsWith('/business-plan')
    ? '/business-plan'
    : location.pathname.startsWith('/requirements')
      ? '/requirements'
      : location.pathname.startsWith('/mvp-policy')
        ? '/mvp-policy'
      : '/today'

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  useEffect(() => { setBellOpen(false) }, [location.pathname])

  const unread = notifications.filter(n => n.unread).length

  return (
    <div className="shell">
      <aside className="shell-sidebar">
        <div className="shell-logo">
          <img src="/ci-logo-white.png" alt="Care Indeed — The Heart of Home Health" />
        </div>

        <button className="btn btn-primary shell-new-referral" onClick={() => navigate('/intake')}>
          <Plus size={16} strokeWidth={2.25} aria-hidden />
          New referral
        </button>

        <nav className="shell-nav" aria-label="Primary">
          {NAV_GROUPS.map(group => (
            <div className="shell-nav-group" key={group.label}>
              <div className="shell-nav-label">{group.label}</div>
              {group.items.map(item => {
                const content = (
                  <>
                    <item.icon size={17} strokeWidth={1.75} aria-hidden />
                    <span className="shell-nav-text">{item.label}</span>
                    {item.badge ? <span className="shell-nav-badge">{item.badge}</span> : null}
                    {item.status === 'planned' && (
                      <span className="shell-nav-planned" aria-label="planned, not built">planned</span>
                    )}
                    {item.status === 'substitute' && (
                      <span className="shell-nav-planned shell-nav-rail" aria-label="connected MVP rail">rail</span>
                    )}
                    {item.integrationId ? <ExternalLink size={12} strokeWidth={2} aria-hidden /> : null}
                  </>
                )

                if (item.integrationId) {
                  return (
                    <a
                      key={item.label + item.to}
                      href={getIntegrationHref(item.integrationId)}
                      className="shell-nav-item is-substitute"
                      title={`${item.label} — opens ${item.integrationId === 'connect' ? 'Connect' : 'the Policy Suite'} in a new tab`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content}
                    </a>
                  )
                }

                return (
                  <NavLink
                    key={item.label + item.to}
                    to={item.to}
                    end={item.to.startsWith('/domain/')}
                    className={({ isActive }) =>
                      'shell-nav-item'
                      + (isActive ? ' is-active' : '')
                      + (item.status === 'planned' ? ' is-planned' : '')
                    }
                    title={item.status === 'planned' ? `${item.label} — planned, not built` : item.label}
                  >
                    {content}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="shell-sidebar-foot">
          <div className="shell-env-card">
            <BadgeCheck size={15} strokeWidth={1.75} aria-hidden />
            <div>
              <div className="shell-env-title">Design prototype</div>
              <div className="shell-env-sub">
                Synthetic data only · no PHI<br />
                {NAV_COUNTS.built} built · {NAV_COUNTS.planned} planned
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="shell-main">
        <header className="shell-topbar">
          <div className="shell-product">
            <span className="shell-product-name">Home Health EHR</span>
            <span className="chip chip-outline">Prototype</span>
          </div>

          <button className="shell-search" onClick={() => setPaletteOpen(true)} aria-label="Search — opens command palette">
            <Search size={15} strokeWidth={1.75} aria-hidden />
            <span className="shell-search-placeholder">Search patients, tasks, records…</span>
            <kbd>⌘K</kbd>
          </button>

          <div className="shell-topbar-right">
            <div className="mode-switch" role="tablist" aria-label="Workspace mode">
              {MODES.map(m => (
                <button
                  key={m.to}
                  role="tab"
                  aria-selected={activeMode === m.to}
                  className={'mode-switch-item' + (activeMode === m.to ? ' is-active' : '')}
                  onClick={() => navigate(m.to)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="icon-btn"
              aria-label="Messages — open in-app message threads"
              title="Open messages"
              onClick={() => navigate('/messages')}
            >
              <MessagesSquare size={18} strokeWidth={1.75} />
            </button>

            <div className="shell-bell" ref={bellRef}>
              <button
                className="icon-btn"
                aria-label={`Notifications — ${unread} unread`}
                onClick={() => setBellOpen(o => !o)}
              >
                <Bell size={18} strokeWidth={1.75} />
                {unread > 0 && <span className="icon-btn-badge">{unread}</span>}
              </button>
              {bellOpen && (
                <div className="popover" role="dialog" aria-label="Notifications">
                  <div className="popover-head">Notifications</div>
                  {notifications.map(n => (
                    <div className={'popover-row' + (n.unread ? ' is-unread' : '')} key={n.id}>
                      <div className="popover-row-title">{n.title}</div>
                      <div className="popover-row-detail">{n.detail}</div>
                      <div className="popover-row-when">{n.when}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="shell-user" aria-label="Account — Taylor Brooks, RN">
              <span className="avatar avatar-teal">TB</span>
              <span className="shell-user-meta">
                <span className="shell-user-name">Taylor Brooks, RN</span>
                <span className="shell-user-role">Case manager · South Bay</span>
              </span>
            </button>
          </div>
        </header>

        <div className="shell-ribbon" role="note">
          <ShieldCheck size={13} strokeWidth={2} aria-hidden />
          Synthetic patient data · design prototype only · not approved for clinical use or PHI
        </div>

        <main className="shell-content">
          <Outlet />
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}
