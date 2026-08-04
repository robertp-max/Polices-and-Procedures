import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './epi.css'

/** Synthetic first-pass pageview for Episodes & certification (EPI). Design prototype only. */
const ROWS = [["Elena Martinez","EP-24081","Jul 29","6 / 60","Primary cert open","Active"],["Walter Feld","EP-24055","Jul 12","23 / 60","Recert due in 4d","At risk"],["Priya Desai","EP-24090","Aug 1","3 / 60","Primary cert open","Active"],["James Okonkwo","EP-23998","Jun 20","45 / 60","Recert signed","Active"]] as const

export default function EpisodesScreen() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ROWS
    return ROWS.filter(row => row.some(cell => cell.toLowerCase().includes(q)))
  }, [query])

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain EPI · first-pass prototype</div>
          <h1 className="screen-title">Episodes & certification</h1>
          <div className="screen-sub">Home-health episode state, certification periods, and transition readiness.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Episodes & certification'); setDrawerOpen(true) }}>
            Open episode
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="epi-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="epi-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active episodes"
          value="42"
          sub="Branch cohort"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Cert due ≤7d"
          value="5"
          sub="Physician signature windows"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="SOC this week"
          value="3"
          sub="New payment periods"
          accent="orange"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Transfers open"
          value="1"
          sub="Hospitalization handoff"
          accent="teal"
        />
      </div>

      <section className="card" aria-label="Episodes & certification list">
        <div className="epi-toolbar">
          <label className="epi-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Episodes & certification</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">New certification period</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="epi-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Episode</th><th>SOC</th><th>Day</th><th>Cert window</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Elena Martinez</td><td>EP-24081</td><td>Jul 29</td><td>6 / 60</td><td>Primary cert open</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
                  <tr key={1}><td>Walter Feld</td><td>EP-24055</td><td>Jul 12</td><td>23 / 60</td><td>Recert due in 4d</td><td><StatusChip tone="warn">At risk</StatusChip></td></tr>
                  <tr key={2}><td>Priya Desai</td><td>EP-24090</td><td>Aug 1</td><td>3 / 60</td><td>Primary cert open</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
                  <tr key={3}><td>James Okonkwo</td><td>EP-23998</td><td>Jun 20</td><td>45 / 60</td><td>Recert signed</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Episodes & certification'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="epi-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Episodes & certification</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="epi-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
