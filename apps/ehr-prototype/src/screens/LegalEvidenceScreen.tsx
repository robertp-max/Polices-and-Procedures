import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './leg.css'

/** Synthetic first-pass pageview for Legal evidence (DOC). Design prototype only. */
const ROWS = [["PKG-8821","Elena Martinez · SOC","Notes, OASIS draft, orders","No","Yes","Draft"],["PKG-8790","Incident · fall","Timeline, photos, notifications","Yes","Yes","On hold"],["PKG-8755","Discharge packet","Instructions, signatures","No","Yes","Sealed"]] as const

export default function LegalEvidenceScreen() {
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
          <div className="card-kicker">Domain DOC · first-pass prototype</div>
          <h1 className="screen-title">Legal evidence packages</h1>
          <div className="screen-sub">Retention-locked packages, holds, and hash verification — design only.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Legal evidence packages'); setDrawerOpen(true) }}>
            Assemble package
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="leg-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="leg-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Packages (30d)"
          value="14"
          sub="Signed manifests"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Legal holds"
          value="2"
          sub="Disposition blocked"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Hash mismatches"
          value="0"
          sub="Last verification run"
          accent="good"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending signatures"
          value="3"
          sub="Package incomplete"
          accent="teal"
        />
      </div>

      <section className="card" aria-label="Legal evidence packages list">
        <div className="leg-toolbar">
          <label className="leg-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Legal evidence packages</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Legal hold list</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="leg-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Package</th><th>Patient / matter</th><th>Contents</th><th>Hold</th><th>Verified</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>PKG-8821</td><td>Elena Martinez · SOC</td><td>Notes, OASIS draft, orders</td><td>No</td><td>Yes</td><td><StatusChip tone="warn">Draft</StatusChip></td></tr>
                  <tr key={1}><td>PKG-8790</td><td>Incident · fall</td><td>Timeline, photos, notifications</td><td>Yes</td><td>Yes</td><td><StatusChip tone="bad">On hold</StatusChip></td></tr>
                  <tr key={2}><td>PKG-8755</td><td>Discharge packet</td><td>Instructions, signatures</td><td>No</td><td>Yes</td><td><StatusChip tone="good">Sealed</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Legal evidence packages'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="leg-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Legal evidence</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="leg-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
