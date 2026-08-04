import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ClipboardList, FlaskConical, Search } from 'lucide-react'
import { Drawer, EmptyState, StatCard, StatusChip } from '../ui'
import './fld.css'

/** Synthetic first-pass pageview for Field visits & EVV (FLD). Design prototype only. */
const ROWS = [["SN · Elena Martinez","Taylor Brooks","2:00–3:00 PM","N/A (Medicare)","Synced","Documentation due"],["PT · Walter Feld","Marcus Webb","10:00–11:00 AM","N/A","Synced","Completed"],["HHA · James Okonkwo","Priya Natarajan","1:00–2:00 PM","Required","Queued","In field"],["SN · Rosa Alvarez","On-call RN","Missed window","N/A","—","Exception"]] as const

export default function FieldVisitsScreen() {
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
          <div className="card-kicker">Domain FLD · first-pass prototype</div>
          <h1 className="screen-title">Field visits & EVV</h1>
          <div className="screen-sub">Point-of-care capture, offline outbox, and applicability-driven EVV — synthetic.</div>
        </div>
        <div className="screen-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/requirements')}>
            Requirements register
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { setSelected(ROWS[0]?.[0] ?? 'Field visits & EVV'); setDrawerOpen(true) }}>
            Open visit packet
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <div className="fld-banner" role="status">
        <FlaskConical size={15} strokeWidth={2} aria-hidden />
        <span>Synthetic design prototype · not build authorized · no clinical or legal action is recorded.</span>
      </div>

      <div className="fld-stats">
        <StatCard
          key={0}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Today's visits"
          value="14"
          sub="Branch field force"
          accent="teal"
        />
        <StatCard
          key={1}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Unsynced"
          value="3"
          sub="Encrypted outbox"
          accent="warn"
        />
        <StatCard
          key={2}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="EVV exceptions"
          value="1"
          sub="Applicable cohort only"
          accent="bad"
        />
        <StatCard
          key={3}
          icon={<ClipboardList size={16} strokeWidth={1.75} aria-hidden />}
          kicker="Offline ready"
          value="100%"
          sub="Device check-in OK"
          accent="good"
        />
      </div>

      <section className="card" aria-label="Field visits & EVV list">
        <div className="fld-toolbar">
          <label className="fld-search">
            <Search size={15} strokeWidth={2} aria-hidden />
            <span className="sr-only">Search Field visits & EVV</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search this workspace"
            />
          </label>
          <button type="button" className="btn btn-secondary btn-sm">Outbox status</button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={26} strokeWidth={1.5} />}
            title="No matching rows"
            sub="Adjust search or reset filters. All data on this page is synthetic."
          />
        ) : (
          <div className="fld-table-wrap">
            <table className="table">
              <thead>
                <tr><th>Visit</th><th>Clinician</th><th>Window</th><th>EVV</th><th>Sync</th><th>State</th></tr>
              </thead>
              <tbody>
                  <tr key={0}><td>SN · Elena Martinez</td><td>Taylor Brooks</td><td>2:00–3:00 PM</td><td>N/A (Medicare)</td><td>Synced</td><td><StatusChip tone="warn">Documentation due</StatusChip></td></tr>
                  <tr key={1}><td>PT · Walter Feld</td><td>Marcus Webb</td><td>10:00–11:00 AM</td><td>N/A</td><td>Synced</td><td><StatusChip tone="good">Completed</StatusChip></td></tr>
                  <tr key={2}><td>HHA · James Okonkwo</td><td>Priya Natarajan</td><td>1:00–2:00 PM</td><td>Required</td><td>Queued</td><td><StatusChip tone="neutral">In field</StatusChip></td></tr>
                  <tr key={3}><td>SN · Rosa Alvarez</td><td>On-call RN</td><td>Missed window</td><td>N/A</td><td>—</td><td><StatusChip tone="neutral">Exception</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selected ?? 'Field visits & EVV'}
        sub="Review-only drawer · nothing is filed, signed, or submitted"
      >
        <p className="fld-drawer-copy">
          This first-pass pageview demonstrates layout, status language, and navigation for
          <strong> Field visits & EVV</strong>. Production behavior requires authorized requirements,
          prototypes, and evidence gates before development.
        </p>
        <div className="fld-drawer-actions">
          <button type="button" className="btn btn-secondary" onClick={() => setDrawerOpen(false)}>Close</button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/requirements')}>Open requirements</button>
        </div>
      </Drawer>
    </div>
  )
}
