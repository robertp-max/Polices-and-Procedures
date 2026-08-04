import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import './doc-shell.css'

const MODES = [
  { to: '/business-plan', label: 'Business Plan' },
  { to: '/requirements', label: 'Requirements' },
  { to: '/mvp-policy', label: 'MVP Policy' },
  { to: '/today', label: 'Prototype' },
]

export function DocShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const active = location.pathname.startsWith('/requirements')
    ? '/requirements'
    : location.pathname.startsWith('/mvp-policy')
      ? '/mvp-policy'
      : '/business-plan'

  return (
    <div className="doc-shell">
      <header className="doc-topbar">
        <div className="doc-brand">
          <img src="/logomark-orange.png" alt="" aria-hidden />
          <div className="doc-brand-text">
            <span className="doc-brand-name">Care Indeed</span>
            <span className="doc-brand-sub">Home Health EHR</span>
          </div>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Workspace mode">
          {MODES.map(m => (
            <button
              key={m.to}
              role="tab"
              aria-selected={active === m.to}
              className={'mode-switch-item' + (active === m.to ? ' is-active' : '')}
              onClick={() => navigate(m.to)}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="doc-topbar-right">
          <span className="chip chip-outline doc-synthetic">
            <ShieldCheck size={12} strokeWidth={2} aria-hidden />
            Synthetic · design prototype
          </span>
          <button className="btn btn-teal btn-sm" onClick={() => navigate('/today')}>
            <ArrowLeft size={14} strokeWidth={2.25} aria-hidden />
            Back to the EHR
          </button>
        </div>
      </header>

      <main className="doc-content">
        <Outlet />
      </main>
    </div>
  )
}
