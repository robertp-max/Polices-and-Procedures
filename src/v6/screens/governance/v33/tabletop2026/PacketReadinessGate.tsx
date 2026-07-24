// Round 0 gate: before any matter is deliberated, the Board must decide
// whether this quarter's packet may be relied on in full, only in part, or
// must be held pending correction. Driven entirely by caller-supplied
// checks (each case pack's own readiness criteria — sign-offs, feeder
// audits, census reconciliation, etc.) so this component carries no
// case-specific knowledge of its own.

import { AlertTriangle, CircleHelp, CircleCheck, CircleX } from 'lucide-react';

export type ReadinessStatus = 'met' | 'unmet' | 'unknown';

export interface ReadinessCheck {
  id: string;
  label: string;
  status: ReadinessStatus;
  detail: string;
  evidenceIds: string[];
}

export type PacketDisposition = 'full' | 'partial' | 'hold';

export interface PacketReadinessValue {
  disposition: PacketDisposition | null;
  rationale: string;
}

export interface PacketReadinessGateProps {
  checks: ReadinessCheck[];
  value: PacketReadinessValue;
  onChange: (next: PacketReadinessValue) => void;
  onSubmit: () => void;
  submitted?: boolean;
  onInspectEvidence?: (exhibitId: string) => void;
}

const STATUS_ICON: Record<ReadinessStatus, typeof CircleCheck> = {
  met: CircleCheck,
  unmet: CircleX,
  unknown: CircleHelp,
};

const DISPOSITIONS: { id: PacketDisposition; label: string }[] = [
  { id: 'full', label: 'Proceed — Full Reliance' },
  { id: 'partial', label: 'Proceed — Partial Reliance' },
  { id: 'hold', label: 'Hold — Do Not Convene on This Packet' },
];

function suggestedDisposition(checks: ReadinessCheck[]): PacketDisposition {
  if (checks.some((c) => c.status === 'unmet')) return 'hold';
  if (checks.some((c) => c.status === 'unknown')) return 'partial';
  return 'full';
}

export default function PacketReadinessGate(props: PacketReadinessGateProps) {
  const { checks, value, onChange, onSubmit, submitted = false, onInspectEvidence } = props;
  const unmetCount = checks.filter((c) => c.status === 'unmet').length;
  const suggestion = suggestedDisposition(checks);
  const overOptimistic = value.disposition === 'full' && unmetCount > 0;

  return (
    <div className="bs-decision-prompt">
      <header>
        <p className="bs-kicker">Round 0 · Packet Readiness Gate</p>
        <h3>Is this packet fit to convene on?</h3>
        <p className="bs-prompt-text">
          Review every readiness criterion below before relying on this packet for any decision this
          quarter.
        </p>
      </header>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, margin: 0, padding: 0 }}>
        {checks.map((check) => {
          const Icon = STATUS_ICON[check.status];
          return (
            <li key={check.id} className={`bs-kpi ${check.status === 'unmet' ? 'critical' : check.status === 'unknown' ? 'below' : 'within'}`}>
              <header>
                <span>{check.label}</span>
                <Icon size={16} aria-hidden="true" />
              </header>
              <p style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--bs-ink)' }}>{check.detail}</p>
              {check.evidenceIds.length > 0 && (
                <footer className={check.status === 'unmet' ? 'critical' : check.status === 'unknown' ? 'below' : undefined}>
                  Evidence:{' '}
                  {check.evidenceIds.map((id, i) => (
                    <span key={id}>
                      {onInspectEvidence ? (
                        <button
                          type="button"
                          onClick={() => onInspectEvidence(id)}
                          style={{ background: 'none', border: 0, padding: 0, font: 'inherit', color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          {id}
                        </button>
                      ) : (
                        id
                      )}
                      {i < check.evidenceIds.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </footer>
              )}
            </li>
          );
        })}
      </ul>

      <div className="bs-inspector-source-note" role="status">
        <span>
          System-suggested posture based on the checks above: <strong>{DISPOSITIONS.find((d) => d.id === suggestion)?.label}</strong>.
          The Board's recorded decision is yours to make and defend.
        </span>
      </div>

      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <legend className="bs-kicker" style={{ marginBottom: 6 }}>Board disposition</legend>
        <div className="bs-disposition-chips" role="radiogroup" aria-label="Packet disposition">
          {DISPOSITIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={value.disposition === d.id}
              className={`bs-chip${value.disposition === d.id ? ' selected' : ''}${value.disposition === d.id && d.id === 'hold' ? ' warn' : ''}`}
              onClick={() => onChange({ ...value, disposition: d.id })}
              disabled={submitted}
            >
              {d.label}
            </button>
          ))}
        </div>
      </fieldset>

      {overOptimistic && (
        <div className="bs-contradiction" role="alert">
          <AlertTriangle size={16} aria-hidden="true" />
          <div>
            <strong>Unmet criteria remain</strong>
            <p>
              {unmetCount} readiness {unmetCount === 1 ? 'criterion is' : 'criteria are'} still unmet. Proceeding
              on full reliance while a criterion is unmet should be explained in the rationale below or
              reconsidered.
            </p>
          </div>
        </div>
      )}

      <div className="bs-motion-field">
        <label htmlFor="bs-readiness-rationale">Rationale for the record</label>
        <textarea
          id="bs-readiness-rationale"
          value={value.rationale}
          onChange={(e) => onChange({ ...value, rationale: e.target.value })}
          placeholder="State what was verified, what remains outstanding, and why this disposition is defensible…"
          disabled={submitted}
        />
      </div>

      <button
        type="button"
        className="bs-rail-action"
        onClick={onSubmit}
        disabled={submitted || !value.disposition || value.rationale.trim().length === 0}
      >
        {submitted ? 'Disposition Recorded' : 'Record Packet Disposition'}
      </button>
    </div>
  );
}
