import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './aig.css'

/** Synthetic first-pass pageview for AI governance (AIG). Design prototype only. */
const ROWS = [["Brad draft assist","Visit note draft","Required","Live monitor","Armed","Approved"],["Med list extract","Proposal only","Required","Shadow","Armed","Evaluation"],["OASIS suggestion","Not authorized","Hard deny","Blocked","N/A","Prohibited"]] as const

export default function AiGovernanceScreen() {
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
          <div className="card-kicker">Domain AIG · first-pass prototype</div>
          <h1 className="screen-title">AI governance</h1>
          <div className="screen-sub">Approved intended uses, human control, evaluation, and kill switch — Brad remains assistive only.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'AI governance'); setDrawerOpen(true) }}>
            Review proposal
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="aig-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="aig-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Approved uses"
          value="4"
          sub="Documented intents"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending eval"
          value="1"
          sub="Shadow mode"
          accent="teal"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Overrides (7d)"
          value="23"
          sub="Human edits"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Prohibited blocks"
          value="0"
          sub="Auto-action denied"
          accent="good"
        />
      </div>

      <section className="card" aria-label="AI governance list">
        <div className="aig-toolbar">
          <label className="aig-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search AI governance</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Kill-switch drill</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="aig-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Capability</th><th>Intended use</th><th>Human gate</th><th>Eval status</th><th>Kill switch</th><th>State</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Brad draft assist</td><td>Visit note draft</td><td>Required</td><td>Live monitor</td><td>Armed</td><td><StatusChip tone="good">Approved</StatusChip></td></tr>
                  <tr key={1}><td>Med list extract</td><td>Proposal only</td><td>Required</td><td>Shadow</td><td>Armed</td><td><StatusChip tone="progress">Evaluation</StatusChip></td></tr>
                  <tr key={2}><td>OASIS suggestion</td><td>Not authorized</td><td>Hard deny</td><td>Blocked</td><td>N/A</td><td><StatusChip tone="bad">Prohibited</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'AI governance'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="aig-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> AI governance</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="aig-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
