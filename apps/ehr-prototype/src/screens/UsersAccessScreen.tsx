import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './iam.css'

/** Synthetic first-pass pageview for Users & access (IAM). Design prototype only. */
const ROWS = [["Taylor Brooks","RN · case manager","Today","On","Current","Active"],["Marcus Webb","PT","Yesterday","On","Due Sep","Active"],["Billing bot","Service account","Today","N/A","Owner: Finance","Active"],["Temp contractor","Read-only QA","Jul 2","On","Expired","Disabled"]] as const

export default function UsersAccessScreen() {
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
          <div className="card-kicker">Domain IAM · first-pass prototype</div>
          <h1 className="screen-title">Users & access</h1>
          <div className="screen-sub">Workforce identity, least privilege, and break-glass — synthetic directory.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Users & access'); setDrawerOpen(true) }}>
            Invite user
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="iam-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="iam-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Active users"
          value="48"
          sub="Workforce + service"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Access reviews due"
          value="5"
          sub="Quarterly cadence"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Break-glass (30d)"
          value="1"
          sub="Reviewed"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Revocations pending"
          value="0"
          sub="Same-day target"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Users & access list">
        <div className="iam-toolbar">
          <label className="iam-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Users & access</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Break-glass log</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="iam-table-wrap">
            <table className="table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Last access</th><th>MFA</th><th>Review</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Taylor Brooks</td><td>RN · case manager</td><td>Today</td><td>On</td><td>Current</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
                  <tr key={1}><td>Marcus Webb</td><td>PT</td><td>Yesterday</td><td>On</td><td>Due Sep</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
                  <tr key={2}><td>Billing bot</td><td>Service account</td><td>Today</td><td>N/A</td><td>Owner: Finance</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
                  <tr key={3}><td>Temp contractor</td><td>Read-only QA</td><td>Jul 2</td><td>On</td><td>Expired</td><td><StatusChip tone="neutral">Disabled</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Users & access'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="iam-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Users & access</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="iam-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
