import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Compass, HardHat, ListChecks } from 'lucide-react'
import { REGISTER_DOMAINS, REQUIREMENT_REGISTER } from '../data/requirementsSpec'
import { ALL_NAV_ITEMS } from '../data/navigation'
import type { NavStatus } from '../data/navigation'
import { EmptyState, StatusChip } from '../ui'
import type { StatusTone } from '../ui'
import './domain.css'

const PRIORITY_TONE: Record<string, StatusTone> = {
  MUST: 'warn',
  SHOULD: 'progress',
  CONDITIONAL: 'neutral',
  UNSET: 'neutral',
}

const NAV_STATUS: Record<NavStatus, { tone: StatusTone; label: string }> = {
  built: { tone: 'good', label: 'Built' },
  planned: { tone: 'neutral', label: 'Not built' },
  substitute: { tone: 'progress', label: 'Connected rail' },
}

/**
 * Destination for navigation areas the requirements define but the prototype
 * has not built. It never pretends to be the feature: it names the domain,
 * shows that domain's real requirement statements from the register, and states
 * plainly that this navigation destination is not implemented.
 */
export default function DomainScreen() {
  const { domainId = '' } = useParams()
  const navigate = useNavigate()
  const domain = REGISTER_DOMAINS.find(d => d.id === domainId.toUpperCase())

  if (!domain) {
    return (
      <div className="screen">
        <div className="screen-head">
          <div>
            <h1 className="screen-title">Unknown domain</h1>
            <div className="screen-sub">No requirement domain matches this route.</div>
          </div>
          <div className="screen-actions">
            <button type="button" className="btn btn-primary" onClick={() => navigate('/today')}>
              Back to Today
            </button>
          </div>
        </div>
        <div className="card">
          <EmptyState
            icon={<Compass size={28} strokeWidth={1.5} />}
            title="Unknown domain"
            sub={`No requirement domain matches "${domainId}". Planned nav always uses a registered domain id from the requirements baseline.`}
          />
        </div>
      </div>
    )
  }

  const rows = REQUIREMENT_REGISTER.filter(r => r.domainId === domain.id)
  const navAreas = ALL_NAV_ITEMS.filter(i => i.domainId === domain.id)
  const builtCount = navAreas.filter(a => a.status === 'built').length
  const plannedCount = navAreas.filter(a => a.status === 'planned').length
  const substituteCount = navAreas.filter(a => a.status === 'substitute').length

  return (
    <div className="screen">
      <div className="screen-head">
        <div>
          <div className="card-kicker">Domain {domain.num} · {domain.id}</div>
          <h1 className="screen-title">{domain.name}</h1>
          <div className="screen-sub">{domain.description}</div>
        </div>
        <div className="screen-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/requirements')}
          >
            Open requirements register
            <ArrowRight size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>
      </div>

      <section className="card dom-notice" aria-label="Implementation status">
        <span className="dom-notice-icon" aria-hidden>
          <HardHat size={17} strokeWidth={1.75} />
        </span>
        <div className="dom-notice-body">
          <div className="dom-notice-head">
            <h2 className="card-title">Not implemented in this prototype</h2>
            <StatusChip tone="neutral">Not built</StatusChip>
          </div>
          <p className="dom-notice-text">
            This navigation destination is in the requirements baseline but has no working
            screen here. The programme is at a planning baseline and is not build-authorized,
            so nothing on this page is wired to operational data or clinical actions. Related
            surfaces in the same domain may already exist — their real status is listed below.
          </p>
          {navAreas.length > 0 && (
            <div className="dom-notice-areas">
              <span className="dom-notice-areas-label">Navigation areas in this domain</span>
              <ul className="dom-area-list">
                {navAreas.map(a => {
                  const st = NAV_STATUS[a.status]
                  const isInternalBuilt = a.status === 'built' && !a.integrationId
                  return (
                    <li key={a.label + a.to} className="dom-area-row">
                      <span className="dom-area-label">
                        {isInternalBuilt ? (
                          <Link to={a.to} className="dom-area-link">
                            {a.label}
                          </Link>
                        ) : (
                          a.label
                        )}
                      </span>
                      <StatusChip tone={st.tone}>{st.label}</StatusChip>
                    </li>
                  )
                })}
              </ul>
              <div className="dom-area-summary" aria-label="Domain nav status summary">
                {builtCount > 0 && <StatusChip tone="good">{builtCount} built</StatusChip>}
                {plannedCount > 0 && <StatusChip tone="neutral">{plannedCount} not built</StatusChip>}
                {substituteCount > 0 && (
                  <StatusChip tone="progress">{substituteCount} connected rail{substituteCount === 1 ? '' : 's'}</StatusChip>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="card dom-req-card" aria-label="Requirements for this domain">
        <div className="dom-section-head">
          <div>
            <div className="card-kicker">From the register</div>
            <h2 className="card-title">Requirements in scope</h2>
          </div>
          <StatusChip tone="progress">
            {rows.length === 0
              ? 'No sampled statements'
              : `${rows.length} sampled statement${rows.length === 1 ? '' : 's'}`}
          </StatusChip>
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={<ListChecks size={26} strokeWidth={1.5} />}
            title="No statements sampled for this domain"
            sub="The register carries 170 statements in total; this prototype samples a subset. Open the register to see the full inventory and its gaps."
          />
        ) : (
          <ul className="dom-req-list">
            {rows.map(r => (
              <li className="dom-req" key={r.id}>
                <div className="dom-req-top">
                  <span className="dom-req-id">{r.id}</span>
                  <span className="dom-req-title">{r.title}</span>
                  <StatusChip tone={PRIORITY_TONE[r.priority] ?? 'neutral'}>{r.priority}</StatusChip>
                </div>
                <p className="dom-req-text">{r.text}</p>
                {r.acceptance ? (
                  <p className="dom-req-acceptance">
                    <span className="dom-req-acceptance-label">Acceptance</span>
                    {r.acceptance}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
        <p className="dom-foot">
          Statements are reproduced verbatim from the requirements baseline
          (CI-EHR-SRS-PM-001). This view samples the register rather than
          restating all 170 requirements.
        </p>
      </section>
    </div>
  )
}
