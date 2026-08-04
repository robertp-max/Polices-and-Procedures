import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './trc.css'

/** Synthetic first-pass pageview for Traceability (TRC). Design prototype only. */
const ROWS = [["Requirements","170 shalls","Product","Yes","0","Baseline"],["Workflows","166 IDs","Clinical ops","Partial","Step depth","In review"],["UI routes","104 targets","UX","Yes","Many planned","In prototype"],["Forms","349 sources","Forms lead","Yes","Field schemas","Gate open"]] as const

export default function TraceabilityScreen() {
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
          <div className="card-kicker">Domain TRC · first-pass prototype</div>
          <h1 className="screen-title">Semantic traceability</h1>
          <div className="screen-sub">Canonical IDs, workflow disposition, and development authorization gates.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Semantic traceability'); setDrawerOpen(true) }}>
            Open authority register
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="trc-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="trc-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Canonical namespaces"
          value="12"
          sub="Registered"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Workflow IDs"
          value="166"
          sub="Disposition in progress"
          accent="teal"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Unresolved collisions"
          value="0*"
          sub="Prototype claim"
          accent="good"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Dev authorization"
          value="Blocked"
          sub="Not build authorized"
          accent="bad"
        />
      </div>

      <section className="card" aria-label="Semantic traceability list">
        <div className="trc-toolbar">
          <label className="trc-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Semantic traceability</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Gap report</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="trc-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Object type</th><th>Count</th><th>Owner</th><th>Versioned</th><th>Gaps</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Requirements</td><td>170 shalls</td><td>Product</td><td>Yes</td><td>0</td><td><StatusChip tone="neutral">Baseline</StatusChip></td></tr>
                  <tr key={1}><td>Workflows</td><td>166 IDs</td><td>Clinical ops</td><td>Partial</td><td>Step depth</td><td><StatusChip tone="neutral">In review</StatusChip></td></tr>
                  <tr key={2}><td>UI routes</td><td>104 targets</td><td>UX</td><td>Yes</td><td>Many planned</td><td><StatusChip tone="neutral">In prototype</StatusChip></td></tr>
                  <tr key={3}><td>Forms</td><td>349 sources</td><td>Forms lead</td><td>Yes</td><td>Field schemas</td><td><StatusChip tone="neutral">Gate open</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Semantic traceability'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="trc-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Traceability</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="trc-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
