import {
  ArrowUpRight,
  CheckCircle2,
  FileSignature,
  FileStack,
  Handshake,
  MessagesSquare,
  Network,
  ShieldCheck,
} from 'lucide-react'
import {
  INTEGRATION_TARGETS,
  getIntegrationHref,
  type IntegrationTargetId,
} from '../data/integrationTargets'
import './mvp-policy.css'

const TARGET_ICONS = {
  ecign: FileSignature,
  forms: FileStack,
  connect: MessagesSquare,
  vendorBaaControl: Handshake,
} satisfies Record<IntegrationTargetId, typeof FileSignature>

const HANDOFF_RULES = [
  ['Context', 'The EHR identifies the patient, episode, task, and accountable operator.'],
  ['Execution', 'The delegated rail performs the form, signature, message, or control work.'],
  ['Evidence', 'The delegated rail remains the source of truth for its record and audit history.'],
  ['Return', 'The EHR may retain only the external record ID, status, timestamp, and approved summary.'],
] as const

export default function MvpPolicyScreen() {
  return (
    <div className="screen mvp-policy">
      <header className="mvp-policy-head">
        <div>
          <div className="card-kicker">EHR-MVP-POL-001 · Wizard-of-Oz operating policy</div>
          <h1 className="mvp-policy-title">Use proven rails before building replacements.</h1>
          <p className="mvp-policy-lead">
            The EHR prototype coordinates clinical context and human decisions. Forms, signatures,
            internal messages, and vendor BAA controls stay in the Care Indeed systems that already
            own their records, permissions, and evidence.
          </p>
        </div>
        <span className="chip chip-brand mvp-policy-status">
          <Network size={13} strokeWidth={2} aria-hidden />
          Wizard-of-Oz MVP
        </span>
      </header>

      <section className="mvp-policy-meta" aria-label="Policy metadata">
        <div><span>Owner</span><strong>EHR product owner</strong></div>
        <div><span>Scope</span><strong>Synthetic prototype only</strong></div>
        <div><span>Authority</span><strong>Human review required</strong></div>
        <div><span>Release gate</span><strong>No production PHI</strong></div>
      </section>

      <section aria-labelledby="substitution-heading">
        <div className="mvp-policy-section-head">
          <div>
            <div className="card-kicker">Substitution register</div>
            <h2 id="substitution-heading">Authoritative component handoffs</h2>
          </div>
          <span className="chip chip-teal">4 connected rails</span>
        </div>

        <div className="mvp-rail-list">
          {INTEGRATION_TARGETS.map((target, index) => {
            const Icon = TARGET_ICONS[target.id]
            return (
              <article className="mvp-rail" key={target.id} id={target.id}>
                <span className="mvp-rail-number">{String(index + 1).padStart(2, '0')}</span>
                <span className="mvp-rail-icon"><Icon size={18} strokeWidth={1.8} aria-hidden /></span>
                <div className="mvp-rail-copy">
                  <div className="mvp-rail-title-row">
                    <h3>{target.name}</h3>
                    <span>{target.owner}</span>
                  </div>
                  <p>{target.purpose}</p>
                  <small>{target.evidence}</small>
                </div>
                <a
                  className="btn btn-secondary btn-sm"
                  href={getIntegrationHref(target.id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open rail
                  <ArrowUpRight size={14} strokeWidth={2} aria-hidden />
                </a>
              </article>
            )
          })}
        </div>
      </section>

      <section className="mvp-policy-lower" aria-label="Handoff contract and boundaries">
        <div className="mvp-handoff">
          <div className="card-kicker">Handoff contract</div>
          <h2>One context, one owner, one return reference.</h2>
          <ol>
            {HANDOFF_RULES.map(([label, body], index) => (
              <li key={label}>
                <span>{index + 1}</span>
                <div><strong>{label}</strong><p>{body}</p></div>
              </li>
            ))}
          </ol>
        </div>

        <aside className="mvp-boundary">
          <ShieldCheck size={22} strokeWidth={1.7} aria-hidden />
          <div className="card-kicker">MVP boundary</div>
          <h2>Do not simulate completion.</h2>
          <p>
            A launched rail is not proof that work is complete. The EHR may display completion only
            after the owning system returns an accepted status and durable record identifier.
          </p>
          <ul>
            <li><CheckCircle2 size={14} aria-hidden />No copied signature state</li>
            <li><CheckCircle2 size={14} aria-hidden />No duplicate form versions</li>
            <li><CheckCircle2 size={14} aria-hidden />No message body stored in the EHR</li>
            <li><CheckCircle2 size={14} aria-hidden />No vendor PHI access without CTRL-042</li>
          </ul>
        </aside>
      </section>
    </div>
  )
}
