import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  AlertOctagon, AlertTriangle, BookOpen, Boxes, CheckCircle2, ClipboardList, Compass,
  FileWarning, Gauge, Layers, ListChecks, Route as RouteIcon, ScrollText, ShieldAlert,
  ShieldCheck, Sparkles, Workflow,
} from 'lucide-react'
import { Drawer, ProgressBar, StatCard, StatusChip, Tabs } from '../ui'
import {
  ADRS, ARCHITECTURE_CAVEAT, ARCHITECTURE_LAYERS, BLOCKERS, BUSINESS_TRACES,
  CHANGE_CONTROL_NOTE, CHARTER, DEVELOPMENT_SEQUENCE, DOCUMENT_CONTROL,
  ELEMENT_REGISTRY_NOTE, EPIC_CARDS, EPIC_PROGRESS_NOTE, EPIC_STORY_NOTE,
  FOOTER_SUMMARY, FORM_GATE_NOTE, GATES, GATE_STATUS_DETAIL, GATE_STATUS_LABEL,
  GOVERNANCE_RECORDS, INTERNAL_CORPUS_NOTE, INVENTORY_STATS, NAV_GROUPS, NFR_CATEGORIES,
  NFR_NOTE, PAGEVIEW_NOTE, PLANNING_BUCKETS, PLANNING_NOTE, REGISTER_DOMAINS,
  REGISTER_SHOWN, REGISTER_TOTAL, RELEASES, REQUIREMENT_REGISTER, SOURCE_CATEGORIES,
  SOURCE_EVIDENCE_BOUNDARY, SPRINT_BOARD_NOTE, SPRINT_COLUMNS, STATE_MATRIX,
  STATE_MATRIX_NOTE, STORY_SLOTS, STORY_SLOT_NOTE, TASKS_NOTE, TASKS_TOTAL,
  TRACEABILITY_CHAIN, WELLSKY_NOTE, WORKFLOW_NOTE,
} from '../data/requirementsSpec'
import type { EpicCard, ReqPriority, WorkspaceKey } from '../data/requirementsSpec'
import './req.css'

const STAT_TONE_TO_CARD: Record<string, 'teal' | 'orange' | 'good' | 'warn' | 'bad'> = {
  neutral: 'teal', good: 'good', warn: 'warn', bad: 'bad',
}

const PRIORITY_CHIP: Record<string, string> = {
  MUST: 'chip-brand', SHOULD: 'chip-teal', CONDITIONAL: 'chip-neutral', UNSET: 'chip-neutral',
}

const BLOCKER_BY_ID = Object.fromEntries(BLOCKERS.map(b => [b.id, b]))

export default function RequirementsScreen() {
  const [active, setActive] = useState<WorkspaceKey>('overview')
  const activeItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.key === active)

  return (
    <div className="req-pm">
      <RequirementsRail active={active} onSelect={setActive} />

      <div className="req-pm-main">
        <div className="screen-head req-title">
          <div>
            <h1 className="screen-title">Care Indeed Home Health EHR system requirements</h1>
            <div className="screen-sub">{CHARTER.lead}</div>
          </div>
          <div className="screen-actions req-title-chips">
            <span className="chip chip-outline">Controlled specification · planning baseline</span>
            <span className="chip chip-neutral">{DOCUMENT_CONTROL.version}</span>
            <span className="chip chip-neutral req-mono">{DOCUMENT_CONTROL.documentId}</span>
          </div>
        </div>

        <div className="req-pm-content" aria-label={activeItem?.label}>
          <WorkspaceView workspace={active} />
        </div>
      </div>
    </div>
  )
}

/* ================= Left rail ================= */

function RequirementsRail({ active, onSelect }: { active: WorkspaceKey; onSelect: (k: WorkspaceKey) => void }) {
  return (
    <>
      <nav className="req-rail" aria-label="Requirements workspaces">
        <div className="req-rail-gate">
          <ShieldAlert size={14} strokeWidth={2} aria-hidden />
          <div>
            <div className="req-rail-gate-title">{GATE_STATUS_LABEL}</div>
            <StatusChip tone="bad">Not build authorized</StatusChip>
          </div>
        </div>
        <div className="req-rail-scroll">
          {NAV_GROUPS.map((g, gi) => {
            const groupId = `req-rail-group-${gi}`
            return (
              <div className="req-rail-group" key={g.group} role="group" aria-labelledby={groupId}>
                <div className="req-rail-label" id={groupId}>{g.group}</div>
                {g.items.map(item => (
                  <button
                    key={item.key}
                    type="button"
                    className={'req-rail-item' + (active === item.key ? ' is-active' : '')}
                    onClick={() => onSelect(item.key)}
                    aria-current={active === item.key ? true : undefined}
                    aria-label={item.count != null ? `${item.label}, ${item.count.toLocaleString()}` : item.label}
                  >
                    <span className="req-rail-item-text">
                      <span className="req-rail-item-label" aria-hidden="true">{item.label}</span>
                      <span className="req-rail-item-sub" aria-hidden="true">{item.sublabel}</span>
                    </span>
                    {item.count != null ? (
                      <span className="req-rail-badge req-mono" aria-hidden="true">{item.count.toLocaleString()}</span>
                    ) : null}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Collapsed strip for narrow viewports — same nav pattern as the rail (not incomplete tabs) */}
      <nav className="req-chip-strip" aria-label="Requirements workspaces">
        {NAV_GROUPS.flatMap(g => g.items).map(item => (
          <button
            key={item.key}
            type="button"
            aria-current={active === item.key ? true : undefined}
            aria-label={item.count != null ? `${item.label}, ${item.count.toLocaleString()}` : item.label}
            className={'req-chip-strip-item' + (active === item.key ? ' is-active' : '')}
            onClick={() => onSelect(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </>
  )
}

/* ================= Workspace router ================= */

function WorkspaceView({ workspace }: { workspace: WorkspaceKey }) {
  switch (workspace) {
    case 'overview': return <OverviewWorkspace />
    case 'charter': return <CharterWorkspace />
    case 'architecture': return <ArchitectureWorkspace />
    case 'releases': return <ReleasesWorkspace />
    case 'epics': return <EpicsWorkspace />
    case 'stories': return <StoriesWorkspace />
    case 'uiux': return <UiuxWorkspace />
    case 'tasks': return <TasksWorkspace />
    case 'sprint': return <SprintWorkspace />
    case 'register': return <RegisterWorkspace />
    case 'forms': return <FormsWorkspace />
    case 'workflows': return <WorkflowsWorkspace />
    case 'traceability': return <TraceabilityWorkspace />
    case 'testing': return <TestingWorkspace />
    case 'risks': return <RisksWorkspace />
    case 'decisions': return <DecisionsWorkspace />
    case 'gates': return <GatesWorkspace />
    case 'sources': return <SourcesWorkspace />
    default: return null
  }
}

function WsHead({ icon, title, note }: { icon: ReactNode; title: string; note?: string }) {
  return (
    <div className="req-ws-head">
      <h2 className="req-section-title">{icon} {title}</h2>
      {note ? <span className="req-section-note">{note}</span> : null}
    </div>
  )
}

/* ================= Document overview ================= */

function OverviewWorkspace() {
  return (
    <div className="req-section">
      <section className="card req-gate-callout" aria-label="Gate status">
        <div className="req-gate-callout-head">
          <span className="req-gate-icon" aria-hidden><ShieldAlert size={20} strokeWidth={2} /></span>
          <div>
            <div className="card-kicker">Gate status</div>
            <h2 className="card-title" style={{ fontSize: 19 }}>{GATE_STATUS_LABEL}</h2>
          </div>
          <StatusChip tone="bad">Not build authorized</StatusChip>
        </div>
        <p className="req-gate-callout-body">{GATE_STATUS_DETAIL}</p>
        <p className="req-gate-callout-note">
          <Sparkles size={13} strokeWidth={2} aria-hidden /> Complete planning inventory — not build authorization.
        </p>
      </section>

      <WsHead icon={<ListChecks size={16} strokeWidth={2} aria-hidden />} title="Planning inventory" />
      <div className="req-stat-grid">
        {INVENTORY_STATS.map(s => (
          <StatCard
            key={s.key}
            icon={<span className="req-stat-icon" aria-hidden><Gauge size={14} strokeWidth={2} /></span>}
            kicker={s.label}
            value={<span className="req-mono">{s.value}</span>}
            sub={s.sub}
            accent={STAT_TONE_TO_CARD[s.tone]}
          />
        ))}
      </div>

      <WsHead icon={<RouteIcon size={16} strokeWidth={2} aria-hidden />} title="Required development sequence" />
      <ol className="req-stepper">
        {DEVELOPMENT_SEQUENCE.map(step => (
          <li key={step.n} className="req-step">
            <span className="req-step-num">{step.n}</span>
            <div>
              <div className="req-step-title">{step.title}</div>
              <p className="req-step-detail">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <BlockerList />

      <div className="card card-pad req-doc-control">
        <div className="req-doc-control-grid">
          <div><div className="req-doc-control-label">Document ID</div><div className="req-mono">{DOCUMENT_CONTROL.documentId}</div></div>
          <div><div className="req-doc-control-label">Version</div><div>{DOCUMENT_CONTROL.version}</div></div>
          <div><div className="req-doc-control-label">Baseline</div><div>{DOCUMENT_CONTROL.subtitle}</div></div>
          <div><div className="req-doc-control-label">Owner</div><div>{DOCUMENT_CONTROL.owner}</div></div>
          <div><div className="req-doc-control-label">Approvers</div><div>{DOCUMENT_CONTROL.approvers}</div></div>
          <div><div className="req-doc-control-label">Status</div><div>{DOCUMENT_CONTROL.status}</div></div>
          <div><div className="req-doc-control-label">Delivery status</div><div>{DOCUMENT_CONTROL.deliveryStatus}</div></div>
        </div>
        <div className="req-doc-control-rule"><strong>Change rule:</strong> {DOCUMENT_CONTROL.changeRule}</div>
      </div>
      <footer className="req-footer req-mono">{FOOTER_SUMMARY}</footer>
    </div>
  )
}

function BlockerList() {
  return (
    <section className="card req-blockers" aria-label="Authorization blockers">
      <div className="req-domain-head">
        <div className="req-domain-title-wrap">
          <span className="req-domain-icon req-domain-icon-bad" aria-hidden><AlertOctagon size={16} strokeWidth={1.75} /></span>
          <div>
            <div className="card-kicker">30 blockers flagged</div>
            <h2 className="card-title" style={{ fontSize: 16 }}>Authorization blockers</h2>
          </div>
        </div>
      </div>
      <div className="req-blocker-list">
        {BLOCKERS.map(b => (
          <div key={b.id} className="req-blocker-row">
            <div className="req-blocker-head">
              <span className="req-mono req-blocker-id">{b.id}</span>
              <StatusChip tone={b.tone}>{b.tone === 'bad' ? 'Blocking' : 'At risk'}</StatusChip>
            </div>
            <div className="req-blocker-title">{b.title}</div>
            <p className="req-blocker-detail">{b.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ================= Charter & scope ================= */

function CharterWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<Compass size={16} strokeWidth={2} aria-hidden />} title="Charter & scope" />
      <div className="card card-pad">
        <div className="card-kicker">Charter</div>
        <h3 className="card-title" style={{ fontSize: 17 }}>One legal entity. One production system.</h3>
        <p className="req-body">{CHARTER.scopeStatement}</p>
        <div className="req-charter-grid">
          <div>
            <div className="req-charter-label">In-scope production system</div>
            <p className="req-body">{CHARTER.inScope}</p>
          </div>
          <div>
            <div className="req-charter-label">Primary users & care settings</div>
            <p className="req-body">{CHARTER.users}</p>
          </div>
        </div>
        <div className="req-charter-flags">
          <div className="req-charter-flag"><span className="chip chip-outline">Separate entity</span><p>{CHARTER.separateEntity}</p></div>
          <div className="req-charter-flag"><span className="chip chip-neutral">Conditional modules</span><p>{CHARTER.conditionalModules}</p></div>
          <div className="req-charter-flag"><span className="chip chip-teal">Buy as rails</span><p>{CHARTER.buyAsRails}</p></div>
        </div>
      </div>
    </div>
  )
}

/* ================= Architecture ================= */

function ArchitectureWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<Layers size={16} strokeWidth={2} aria-hidden />} title="Architecture position" />
      <p className="req-lead">{ARCHITECTURE_CAVEAT}</p>
      <div className="req-arch-grid">
        {ARCHITECTURE_LAYERS.map(layer => (
          <div key={layer.n} className="card card-pad req-arch-card">
            <div className="card-kicker">{layer.n}</div>
            <h3 className="card-title" style={{ fontSize: 15 }}>{layer.title}</h3>
            <p className="req-arch-detail">{layer.detail}</p>
            <ul className="req-arch-points">{layer.points.map(p => <li key={p}>{p}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="req-note-card"><ShieldCheck size={14} strokeWidth={2} aria-hidden /><span>{WELLSKY_NOTE}</span></div>
    </div>
  )
}

/* ================= Releases & planning ================= */

function ReleasesWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<Compass size={16} strokeWidth={2} aria-hidden />} title="Releases & planning" />
      <div className="req-release-timeline">
        {RELEASES.map((r, i) => (
          <div key={r.id} className="req-release-card">
            <div className="req-release-card-num">{i + 1}</div>
            <div>
              <div className="req-mono req-release-card-id">{r.id}</div>
              <div className="req-release-card-name">{r.name}</div>
            </div>
          </div>
        ))}
      </div>
      <p className="req-body">{PLANNING_NOTE}</p>
    </div>
  )
}

/* ================= Epics ================= */

function EpicsWorkspace() {
  const [selected, setSelected] = useState<EpicCard | null>(null)
  return (
    <div className="req-section">
      <WsHead icon={<Boxes size={16} strokeWidth={2} aria-hidden />} title="Epics" note={`${EPIC_CARDS.length} delivery outcomes`} />
      <div className="req-epic-card-grid">
        {EPIC_CARDS.map(e => {
          const domain = REGISTER_DOMAINS.find(d => d.id === e.domainId)
          return (
            <button key={e.id} type="button" className="req-epic-pm-card" onClick={() => setSelected(e)}>
              <div className="req-epic-pm-head">
                <span className="req-mono req-epic-pm-id">{e.id}</span>
                <StatusChip tone="neutral">Planning</StatusChip>
              </div>
              <div className="req-epic-pm-name">{e.name}</div>
              {domain ? <div className="req-epic-pm-domain">Domain {domain.num} · {domain.id}</div> : null}
              <div className="req-epic-pm-meta">
                <span>{e.storyCount} stories</span>
                <span className="req-mono">{e.planningPct}%</span>
              </div>
              <ProgressBar
                pct={e.planningPct}
                color="var(--teal-400)"
                label={`${e.id} ${e.name} planning ${e.planningPct}% complete`}
              />
            </button>
          )
        })}
      </div>
      <p className="req-body-sub">{EPIC_PROGRESS_NOTE} {EPIC_STORY_NOTE}</p>

      <Drawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.id} · ${selected.name}` : ''}
        sub={selected ? `${selected.storyCount} stories · domain ${selected.domainId}` : ''}
      >
        {selected ? (
          <div className="req-drawer-body">
            <div className="req-drawer-row">
              <span className="card-kicker">Planning progress</span>
              <ProgressBar
                pct={selected.planningPct}
                color="var(--teal-400)"
                label={`${selected.id} ${selected.name} planning ${selected.planningPct}% complete`}
              />
              <p className="req-body">{EPIC_PROGRESS_NOTE}</p>
            </div>
            <div className="req-drawer-row">
              <span className="card-kicker">Story slots</span>
              <ul className="req-drawer-list">
                {Array.from({ length: selected.storyCount }, (_, i) => (
                  <li key={i}><span className="req-mono">{selected.id}-S{i + 1}</span> <StatusChip tone="neutral">Unauthored</StatusChip></li>
                ))}
              </ul>
            </div>
            <div className="req-drawer-row">
              <span className="card-kicker">Acceptance framing</span>
              <p className="req-body">Per the 170-item master register: every story must trace to a "system shall" statement, an acceptance contract, and — before development — an approved prototype frame or documented non-UI rationale (UXP-007, TRC-008). No story text is authored for this epic yet.</p>
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  )
}

/* ================= User stories ================= */

function StoriesWorkspace() {
  const [query, setQuery] = useState('')
  const [epicFilter, setEpicFilter] = useState('ALL')
  const filtered = useMemo(() => STORY_SLOTS.filter(s => {
    if (epicFilter !== 'ALL' && s.epicId !== epicFilter) return false
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      return s.id.toLowerCase().includes(q) || s.epicName.toLowerCase().includes(q)
    }
    return true
  }), [query, epicFilter])

  return (
    <div className="req-section">
      <WsHead icon={<ClipboardList size={16} strokeWidth={2} aria-hidden />} title="User stories" note={`Showing ${filtered.length} of ${STORY_SLOTS.length}`} />
      <div className="req-note-card req-note-card-warn"><AlertTriangle size={14} strokeWidth={2} aria-hidden /><span>{STORY_SLOT_NOTE}</span></div>
      <div className="req-register-controls">
        <input type="search" className="req-search" placeholder="Search story ID or epic…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search user stories" />
        <select className="req-select" value={epicFilter} onChange={e => setEpicFilter(e.target.value)} aria-label="Filter by epic">
          <option value="ALL">All epics</option>
          {EPIC_CARDS.map(e => <option key={e.id} value={e.id}>{e.id} — {e.name}</option>)}
        </select>
      </div>
      <div className="req-table-wrap">
        <table className="table">
          <thead><tr><th style={{ width: 120 }}>Story ID</th><th>Parent epic</th><th style={{ width: 110 }}>Priority</th><th style={{ width: 140 }}>Status</th></tr></thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id}>
                <td><span className="req-id req-mono">{s.id}</span></td>
                <td>{s.epicName}</td>
                <td><span className="chip chip-neutral">Unset</span></td>
                <td><StatusChip tone="neutral">Unauthored</StatusChip></td>
              </tr>
            ))}
            {filtered.length === 0 ? <tr><td colSpan={4} className="req-register-empty">No stories match this filter.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= UI/UX inventory ================= */

function UiuxWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<RouteIcon size={16} strokeWidth={2} aria-hidden />} title="UI/UX inventory" />
      <div className="req-uiux-grid">
        <div className="card card-pad">
          <div className="card-kicker">Pageviews</div>
          <div className="req-uiux-value req-mono">104</div>
          <p className="req-body">{PAGEVIEW_NOTE}</p>
        </div>
        <div className="card card-pad">
          <div className="card-kicker">Component & element registry</div>
          <div className="req-uiux-value req-mono">192 <small>elements · 16 families</small></div>
          <p className="req-body">{ELEMENT_REGISTRY_NOTE}</p>
        </div>
      </div>
      <div className="card card-pad">
        <div className="card-kicker">Universal state & interaction matrix</div>
        <h3 className="card-title" style={{ fontSize: 15 }}>20 required state classes</h3>
        <div className="req-state-grid">
          {STATE_MATRIX.map(s => (
            <div key={s.group} className="req-state-cell">
              <div className="req-state-group">{s.group}</div>
              <div className="req-state-states">{s.states}</div>
              <p className="req-state-detail">{s.detail}</p>
            </div>
          ))}
        </div>
        <p className="req-body">{STATE_MATRIX_NOTE}</p>
      </div>
    </div>
  )
}

/* ================= Tasks & backlog ================= */

function TasksWorkspace() {
  const [bucketFilter, setBucketFilter] = useState('ALL')
  const buckets = bucketFilter === 'ALL' ? PLANNING_BUCKETS : PLANNING_BUCKETS.filter(b => b.id === bucketFilter)
  return (
    <div className="req-section">
      <WsHead icon={<ClipboardList size={16} strokeWidth={2} aria-hidden />} title="Tasks & backlog" note={`${TASKS_TOTAL.toLocaleString()} planning tasks · 15 buckets`} />
      <div className="req-note-card req-note-card-warn"><AlertTriangle size={14} strokeWidth={2} aria-hidden /><span>{TASKS_NOTE}</span></div>
      <div className="req-register-controls">
        <select className="req-select" value={bucketFilter} onChange={e => setBucketFilter(e.target.value)} aria-label="Filter by planning bucket">
          <option value="ALL">All buckets (15)</option>
          {PLANNING_BUCKETS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>
      <div className="req-table-wrap">
        <table className="table">
          <thead><tr><th style={{ width: 130 }}>Bucket ID</th><th>Bucket</th><th style={{ width: 150 }}>Kind</th><th style={{ width: 200 }}>Task count</th></tr></thead>
          <tbody>
            {buckets.map(b => (
              <tr key={b.id}>
                <td><span className="req-id req-mono">{b.id}</span></td>
                <td>{b.name}</td>
                <td><span className={'chip ' + (b.kind === 'backlog' ? 'chip-outline' : 'chip-teal')}>{b.kind === 'backlog' ? 'Unscheduled backlog' : 'Increment'}</span></td>
                <td className="req-body-sub">Not decomposed per bucket in this baseline</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= Sprint board ================= */

function SprintWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<Workflow size={16} strokeWidth={2} aria-hidden />} title="Sprint board" />
      <div className="req-note-card req-note-card-warn"><AlertTriangle size={14} strokeWidth={2} aria-hidden /><span>{SPRINT_BOARD_NOTE}</span></div>
      <div className="req-kanban">
        {SPRINT_COLUMNS.map(col => (
          <div key={col.step} className="req-kanban-col">
            <div className="req-kanban-col-head">
              <span className="req-kanban-col-num">{col.step}</span>
              <span className="req-kanban-col-title">{col.title}</span>
            </div>
            <p className="req-kanban-col-detail">{col.detail}</p>
            <div className="req-kanban-cards">
              {col.step === 1 ? (
                <div className="req-kanban-card">
                  <div className="req-kanban-card-title">All 27 epics</div>
                  <p className="req-kanban-card-sub">Queued — none have passed Gate 0</p>
                  <StatusChip tone="neutral">Not started</StatusChip>
                </div>
              ) : null}
              {col.blockerIds.map(id => {
                const b = BLOCKER_BY_ID[id]
                if (!b) return null
                return (
                  <div key={id} className="req-kanban-card req-kanban-card-blocker">
                    <div className="req-kanban-card-title req-mono">{b.id}</div>
                    <p className="req-kanban-card-sub">{b.title}</p>
                    <StatusChip tone={b.tone}>{b.tone === 'bad' ? 'Blocking' : 'At risk'}</StatusChip>
                  </div>
                )
              })}
              {col.step !== 1 && col.blockerIds.length === 0 ? (
                <div className="req-kanban-empty">No items enter this column until step {col.step - 1} clears its gate.</div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= Requirements register ================= */

function RegisterWorkspace() {
  const [domainFilter, setDomainFilter] = useState<string>('ALL')
  const [query, setQuery] = useState('')
  const filteredRows = useMemo(() => REQUIREMENT_REGISTER.filter(r => {
    if (domainFilter !== 'ALL' && r.domainId !== domainFilter) return false
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      return r.id.toLowerCase().includes(q) || r.title.toLowerCase().includes(q) || r.text.toLowerCase().includes(q)
    }
    return true
  }), [domainFilter, query])

  const domainTabs = [{ key: 'ALL', label: 'All domains', count: REGISTER_SHOWN }].concat(
    REGISTER_DOMAINS.filter(d => REQUIREMENT_REGISTER.some(r => r.domainId === d.id))
      .map(d => ({ key: d.id, label: d.id, count: REQUIREMENT_REGISTER.filter(r => r.domainId === d.id).length }))
  )

  return (
    <div className="req-section">
      <WsHead icon={<BookOpen size={16} strokeWidth={2} aria-hidden />} title="Master requirements register" note={`Showing ${filteredRows.length} of ${REGISTER_TOTAL}`} />
      <p className="req-body-sub">A labeled sample, one or more per domain, drawn verbatim from source — never a substitute for the full 170-item register.</p>
      <div className="req-register-controls">
        <input type="search" className="req-search" placeholder="Search ID, title, or requirement text…" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search requirements register" />
        <div className="req-register-tabs"><Tabs items={domainTabs} active={domainFilter} onChange={setDomainFilter} /></div>
      </div>
      <div className="req-table-wrap">
        <table className="table">
          <thead><tr><th style={{ width: 100 }}>ID</th><th>Requirement</th><th style={{ width: 150 }}>Domain</th><th style={{ width: 110 }}>Priority</th></tr></thead>
          <tbody>
            {filteredRows.map(r => {
              const domain = REGISTER_DOMAINS.find(d => d.id === r.domainId)
              return (
                <tr key={r.id}>
                  <td><span className="req-id req-mono">{r.id}</span></td>
                  <td>
                    <div className="req-register-title">{r.title}</div>
                    <div className="req-register-text">{r.text}</div>
                    <div className="req-register-acceptance"><strong>Acceptance:</strong> {r.acceptance}</div>
                  </td>
                  <td>{domain ? domain.name : r.domainId}</td>
                  <td><span className={'chip ' + PRIORITY_CHIP[r.priority as ReqPriority]}>{r.priority}</span></td>
                </tr>
              )
            })}
            {filteredRows.length === 0 ? <tr><td colSpan={4} className="req-register-empty">No requirements match this filter.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ================= Forms & fields ================= */

function FormsWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<FileWarning size={16} strokeWidth={2} aria-hidden />} title="Forms & fields" />
      <div className="card card-pad req-form-gate">
        <div className="req-domain-head">
          <div className="req-domain-title-wrap">
            <span className="req-domain-icon req-domain-icon-bad" aria-hidden><FileWarning size={16} strokeWidth={1.75} /></span>
            <div>
              <div className="card-kicker">0 blockers permitted at Design Gate D0</div>
              <h3 className="card-title" style={{ fontSize: 16 }}>Form field schemas: <span className="req-mono">0 / 349</span></h3>
            </div>
          </div>
          <StatusChip tone="bad">Critical gate</StatusChip>
        </div>
        <p className="req-body">{FORM_GATE_NOTE.headline}</p>
        <div className="req-form-gate-rows">
          {FORM_GATE_NOTE.rows.map(row => (
            <div key={row.label} className="req-form-gate-row">
              <span className="req-mono req-form-gate-value">{row.value}</span>
              <div><div className="req-form-gate-label">{row.label}</div><p className="req-form-gate-detail">{row.detail}</p></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ================= Workflows ================= */

function WorkflowsWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<Workflow size={16} strokeWidth={2} aria-hidden />} title="Workflows" note="166 / 166 IDs inventoried" />
      <div className="req-note-card req-note-card-warn"><FileWarning size={14} strokeWidth={2} aria-hidden /><span>{WORKFLOW_NOTE}</span></div>
    </div>
  )
}

/* ================= Traceability ================= */

function TraceabilityWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<ScrollText size={16} strokeWidth={2} aria-hidden />} title="Traceability" />
      <div className="req-trace-chain req-mono">{TRACEABILITY_CHAIN}</div>
      <div className="req-trace-grid">
        {BUSINESS_TRACES.map(t => (
          <div key={t.id} className="card card-pad req-trace-card">
            <div className="card-kicker req-mono">{t.id}</div>
            <h3 className="card-title" style={{ fontSize: 15 }}>{t.title}</h3>
            <ol className="req-trace-steps">{t.steps.map(s => <li key={s}>{s}</li>)}</ol>
            <p className="req-trace-proof"><CheckCircle2 size={13} strokeWidth={2} aria-hidden /> {t.proof}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= Testing & evidence ================= */

function TestingWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<ClipboardList size={16} strokeWidth={2} aria-hidden />} title="Testing & evidence" />
      <div className="req-governance-grid">
        {GOVERNANCE_RECORDS.filter(r => r.title === 'TEST' || r.title === 'EVIDENCE').map(r => (
          <div key={r.n} className="req-governance-cell">
            <span className="req-mono">{r.n}</span>
            <div><div className="req-governance-title">{r.title}</div><div className="req-governance-detail">{r.detail}</div></div>
          </div>
        ))}
      </div>
      <div className="req-nfr-row">{NFR_CATEGORIES.map(c => <span key={c} className="chip chip-outline">{c}</span>)}</div>
      <p className="req-body">{NFR_NOTE}</p>
      <div className="req-trace-grid">
        {BUSINESS_TRACES.map(t => (
          <div key={t.id} className="card card-pad req-trace-card">
            <div className="card-kicker req-mono">{t.id}</div>
            <p className="req-trace-proof"><CheckCircle2 size={13} strokeWidth={2} aria-hidden /> {t.proof}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= Risks & issues ================= */

function RisksWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<AlertOctagon size={16} strokeWidth={2} aria-hidden />} title="Risks & issues" />
      <BlockerList />
    </div>
  )
}

/* ================= Decisions / ADRs ================= */

function DecisionsWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<Layers size={16} strokeWidth={2} aria-hidden />} title="Decisions & ADRs" />
      <div className="req-adr-grid">
        {ADRS.map(a => (
          <div key={a.id} className="req-adr-card">
            <div className="card-kicker req-mono">{a.id}</div>
            <div className="req-adr-title">{a.title}</div>
            <p className="req-adr-detail">{a.detail}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ================= Gates & approvals ================= */

function GatesWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<ShieldCheck size={16} strokeWidth={2} aria-hidden />} title="Design & production authorization gates" />
      <p className="req-lead">No story, schedule date, or attractive prototype authorizes development or clinical use. Each gate requires retained evidence, independent review where specified, an approved residual-risk decision, and a rollback path.</p>
      <div className="req-gate-list">
        {GATES.map(g => (
          <div key={g.id} className="card card-pad req-gate-card">
            <div className="req-gate-card-head"><span className="req-mono req-gate-id">{g.id}</span><h3 className="card-title" style={{ fontSize: 15 }}>{g.title}</h3></div>
            <p className="req-body">{g.detail}</p>
            <ul className="req-gate-criteria">{g.criteria.map(c => <li key={c}>{c}</li>)}</ul>
            <div className="req-gate-decision"><strong>Decision:</strong> {g.decision}</div>
          </div>
        ))}
      </div>
      <div className="card card-pad req-governance">
        <div className="card-kicker">Requirements governance</div>
        <h3 className="card-title" style={{ fontSize: 15 }}>A requirement is not complete until its evidence is retained.</h3>
        <div className="req-governance-grid">
          {GOVERNANCE_RECORDS.map(r => (
            <div key={r.n} className="req-governance-cell">
              <span className="req-mono">{r.n}</span>
              <div><div className="req-governance-title">{r.title}</div><div className="req-governance-detail">{r.detail}</div></div>
            </div>
          ))}
        </div>
        <p className="req-body">{CHANGE_CONTROL_NOTE}</p>
      </div>
    </div>
  )
}

/* ================= Sources & changes ================= */

function SourcesWorkspace() {
  return (
    <div className="req-section">
      <WsHead icon={<BookOpen size={16} strokeWidth={2} aria-hidden />} title="Sources & changes" />
      <div className="req-source-groups">
        {SOURCE_CATEGORIES.map(group => (
          <div key={group.group} className="req-source-group">
            <div className="req-source-group-title">{group.group}</div>
            <ul className="req-source-list">{group.items.map(i => <li key={i}>{i}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="req-note-card"><ShieldCheck size={14} strokeWidth={2} aria-hidden /><span>{SOURCE_EVIDENCE_BOUNDARY}</span></div>
      <p className="req-body-sub">{INTERNAL_CORPUS_NOTE}</p>
    </div>
  )
}
