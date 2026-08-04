import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './oas.css'

/** Synthetic first-pass pageview for OASIS assessments (EPI). Design prototype only. */
const ROWS = [["Elena Martinez","SOC","OASIS-E2","Taylor Brooks, RN","82%","In progress"],["Walter Feld","Recert","OASIS-E2","Marcus Webb, PT","100%","Ready for lock"],["Priya Desai","SOC","OASIS-E2","Taylor Brooks, RN","41%","In progress"],["Rosa Alvarez","Transfer","OASIS-E2","Clinical QA","96%","Rejection repair"]] as const

export default function OasisAssessmentsScreen() {
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
          <h1 className="screen-title">OASIS assessments</h1>
          <div className="screen-sub">Time-point selection, package versioning, review, lock, and CMS file readiness — synthetic.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'OASIS assessments'); setDrawerOpen(true) }}>
            Continue assessment
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="oas-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="oas-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="In progress"
          value="7"
          sub="Field + QA review"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Ready for lock"
          value="2"
          sub="Clinical review complete"
          accent="teal"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Submission holds"
          value="1"
          sub="Rejection repair"
          accent="bad"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Accepted (30d)"
          value="28"
          sub="Reconciled responses"
          accent="good"
        />
      </div>

      <section className="card" aria-label="OASIS assessments list">
        <div className="oas-toolbar">
          <label className="oas-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search OASIS assessments</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Validation report</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="oas-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Patient</th><th>Time point</th><th>Package</th><th>Owner</th><th>Completeness</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Elena Martinez</td><td>SOC</td><td>OASIS-E2</td><td>Taylor Brooks, RN</td><td>82%</td><td><StatusChip tone="progress">In progress</StatusChip></td></tr>
                  <tr key={1}><td>Walter Feld</td><td>Recert</td><td>OASIS-E2</td><td>Marcus Webb, PT</td><td>100%</td><td><StatusChip tone="neutral">Ready for lock</StatusChip></td></tr>
                  <tr key={2}><td>Priya Desai</td><td>SOC</td><td>OASIS-E2</td><td>Taylor Brooks, RN</td><td>41%</td><td><StatusChip tone="progress">In progress</StatusChip></td></tr>
                  <tr key={3}><td>Rosa Alvarez</td><td>Transfer</td><td>OASIS-E2</td><td>Clinical QA</td><td>96%</td><td><StatusChip tone="bad">Rejection repair</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'OASIS assessments'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="oas-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> OASIS assessments</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="oas-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
