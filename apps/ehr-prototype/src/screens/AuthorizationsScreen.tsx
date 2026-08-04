import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './authz.css'

/** Synthetic first-pass pageview for Authorizations (RCM). Design prototype only. */
const ROWS = [["Elena Martinez","Medicare","SN visits","Unlimited*","Payment period","Open"],["Walter Feld","Medicare Adv.","PT","4 / 20","Ends Aug 20","Near limit"],["Priya Desai","Commercial","SN","0 / 12","Ends Aug 5","Hold"]] as const

export default function AuthorizationsScreen() {
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
          <div className="card-kicker">Domain RCM · first-pass prototype</div>
          <h1 className="screen-title">Authorizations</h1>
          <div className="screen-sub">Payer units, windows, and utilization — separate from clinical necessity.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Authorizations'); setDrawerOpen(true) }}>
            Request authorization
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="authz-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="authz-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active auths"
          value="31"
          sub="Branch"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Units ≤10%"
          value="4"
          sub="Near exhaustion"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Expiring ≤14d"
          value="3"
          sub="Renewal work"
          accent="orange"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Holds"
          value="2"
          sub="Claim readiness"
          accent="bad"
        />
      </div>

      <section className="card" aria-label="Authorizations list">
        <div className="authz-toolbar">
          <label className="authz-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Authorizations</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Utilization ledger</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="authz-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Payer</th><th>Service</th><th>Units left</th><th>Window</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Elena Martinez</td><td>Medicare</td><td>SN visits</td><td>Unlimited*</td><td>Payment period</td><td><StatusChip tone="neutral">Open</StatusChip></td></tr>
                  <tr key={1}><td>Walter Feld</td><td>Medicare Adv.</td><td>PT</td><td>4 / 20</td><td>Ends Aug 20</td><td><StatusChip tone="warn">Near limit</StatusChip></td></tr>
                  <tr key={2}><td>Priya Desai</td><td>Commercial</td><td>SN</td><td>0 / 12</td><td>Ends Aug 5</td><td><StatusChip tone="bad">Hold</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Authorizations'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="authz-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Authorizations</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="authz-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
