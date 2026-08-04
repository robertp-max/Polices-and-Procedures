import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './gov.css'

/** Synthetic first-pass pageview for Organization & master data (GOV). Design prototype only. */
const ROWS = [["Service area","Administrator","Aug 1","v4","ZIP expansion","Approved"],["Payer contracts","Finance","Pending","v7-draft","New MA plan","In review"],["Discipline matrix","DON","Jul 15","v3","OT capacity","Active"]] as const

export default function OrgMasterScreen() {
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
          <div className="card-kicker">Domain GOV · first-pass prototype</div>
          <h1 className="screen-title">Organization & master data</h1>
          <div className="screen-sub">Legal entity boundary, effective-dated configuration, and controlled change.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Organization & master data'); setDrawerOpen(true) }}>
            Propose change
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="gov-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="gov-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Legal entity"
          value="1"
          sub="Care Indeed Home Health Care, Inc."
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Pending changes"
          value="3"
          sub="Awaiting approval"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Branches"
          value="1"
          sub="Campbell"
          accent="teal"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Config versions"
          value="12"
          sub="This year"
          accent="teal"
        />
      </div>

      <section className="card" aria-label="Organization & master data list">
        <div className="gov-toolbar">
          <label className="gov-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Organization & master data</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Effective-date calendar</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="gov-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Config set</th><th>Owner</th><th>Effective</th><th>Version</th><th>Change</th><th>Status</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>Service area</td><td>Administrator</td><td>Aug 1</td><td>v4</td><td>ZIP expansion</td><td><StatusChip tone="good">Approved</StatusChip></td></tr>
                  <tr key={1}><td>Payer contracts</td><td>Finance</td><td>Pending</td><td>v7-draft</td><td>New MA plan</td><td><StatusChip tone="neutral">In review</StatusChip></td></tr>
                  <tr key={2}><td>Discipline matrix</td><td>DON</td><td>Jul 15</td><td>v3</td><td>OT capacity</td><td><StatusChip tone="good">Active</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Organization & master data'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="gov-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Organization & master data</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="gov-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
