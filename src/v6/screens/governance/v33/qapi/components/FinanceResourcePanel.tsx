// §4 depth — Finance & resource adequacy panel.
//
// The normalized 2026 QAPI source (qapi2026.normalized.ts) carries no budget,
// staffing-adequacy, or cost data anywhere in QapiYear2026. This panel never
// invents a favorable resource conclusion to fill that gap — it always shows
// an EVIDENCE HOLD, and instead surfaces the quarter's own open PIP/CAP
// records as resource-dependent Board decision inputs (owner, description,
// due date) since those already exist as real, normalized data.

import { AlertOctagon, Banknote, Users2 } from 'lucide-react';
import { QAPI_2026 } from '../data/qapi2026.normalized';
import type { QuarterKey } from '../model/qapi2026.types';

export interface FinanceResourcePanelProps {
  quarter: QuarterKey;
}

export default function FinanceResourcePanel({ quarter }: FinanceResourcePanelProps) {
  const q = QAPI_2026.quarters[quarter];
  const openCaps = q.caps.filter((c) => c.status !== 'Closed' || !c.effectivenessDemonstrated);
  const openPips = q.pips.filter((p) => !p.closureEligible);
  const hasOpenItems = openCaps.length > 0 || openPips.length > 0;

  return (
    <section className="qd-panel" aria-labelledby={`qd-fin-${quarter}`}>
      <header className="qd-panel-head">
        <Banknote size={16} aria-hidden="true" />
        <div>
          <span>FINANCE &amp; RESOURCE ADEQUACY</span>
          <h3 id={`qd-fin-${quarter}`}>{quarter} resource dependencies for quality interventions</h3>
        </div>
      </header>

      <div className="qd-evidence-hold" role="status">
        <AlertOctagon size={20} aria-hidden="true" />
        <div>
          <strong>Evidence hold</strong>
          <p>
            No budget, staffing-adequacy, or cost data has been normalized into the QAPI source for {quarter}. This
            workspace does not estimate, infer, or present a favorable resource conclusion in the absence of that
            evidence. Do not read "no finance data shown" as "resources are adequate" — treat resourcing as an open
            question for the Board.
          </p>
        </div>
      </div>

      <div className="qd-resource-deps">
        <h4><Users2 size={14} aria-hidden="true" /> Resource-dependent open items (from this quarter's own PIP/CAP records)</h4>
        {q.normalizationStatus === 'pending' ? (
          <p className="qd-empty">No PIP or CAP record has been normalized for {quarter} yet.</p>
        ) : hasOpenItems ? (
          <ul>
            {openPips.map((p) => (
              <li key={p.pipId}>
                <strong>{p.pipId}</strong> — {p.title}
                <small>Requires ongoing staff/supervisory time; sustainability criterion: {p.sustainabilityCriterion ?? 'not stated'}</small>
              </li>
            ))}
            {openCaps.map((c) => (
              <li key={c.capId}>
                <strong>{c.capId}</strong> — {c.description}
                <small>Owner {c.ownerClinId} · due {c.dueDate} · resource commitment not separately quantified in source</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="qd-empty">No open PIP or CAP recorded for {quarter} requiring a resource decision.</p>
        )}
        <p className="qd-deident-note">
          Treat resourcing for the items above as a Board decision input — confirm staffing/training time and budget
          authority are actually available before accepting "in progress" as adequate.
        </p>
      </div>
    </section>
  );
}
