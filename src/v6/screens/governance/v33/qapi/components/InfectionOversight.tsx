// §4 depth — Infection prevention & control oversight panel.
//
// Drives entirely from QAPI_2026.quarters[*].infections. Q1 has one
// normalized infection record; Q2 has none (a real, normalized zero); Q3/Q4
// are not yet normalized (an honest "pending" state, never rendered as a
// zero). Cross-references linked adverse events (RCA) and corrective action
// plans already normalized in the same quarter for a true closure-criteria
// picture instead of a fabricated one.

import { useMemo } from 'react';
import { Activity, AlertTriangle, CheckCircle2, FileWarning, Link2 } from 'lucide-react';
import { QAPI_2026 } from '../data/qapi2026.normalized';
import type {
  AdverseEventSummary,
  CorrectiveActionRecord,
  InfectionSummary,
  QapiQuarter,
  QuarterKey,
} from '../model/qapi2026.types';

export interface InfectionOversightProps {
  quarter: QuarterKey;
}

const QUARTER_KEYS: QuarterKey[] = ['Q1', 'Q2', 'Q3', 'Q4'];

function findLinkedEvent(q: QapiQuarter, eventId?: string): AdverseEventSummary | undefined {
  if (!eventId) return undefined;
  return q.adverseEvents.find((ae) => ae.eventId === eventId);
}

function findLinkedCaps(q: QapiQuarter, eventId?: string): CorrectiveActionRecord[] {
  if (!eventId) return [];
  return q.caps.filter((c) => c.sourceTrigger.includes(eventId));
}

function InfectionRecordCard({ quarter, infx }: { quarter: QapiQuarter; infx: InfectionSummary }) {
  const linkedEvent = findLinkedEvent(quarter, infx.linkedEventId);
  const linkedCaps = findLinkedCaps(quarter, infx.linkedEventId);
  const open = !infx.resolutionDate;
  return (
    <article className={`qd-infx-card ${open ? 'open' : 'closed'}`}>
      <header>
        <span>{infx.infxId}</span>
        <strong>{infx.caseLabel}</strong>
        <i className={open ? 'qd-hold' : 'qd-ok'}>{open ? 'Open' : 'Resolved'}</i>
      </header>
      <dl>
        <div><dt>Type</dt><dd>{infx.infectionType}</dd></div>
        <div><dt>Onset</dt><dd>{infx.onsetDate}</dd></div>
        <div><dt>Resolution</dt><dd>{infx.resolutionDate ?? 'Not yet recorded'}</dd></div>
        <div><dt>Intervention</dt><dd>{infx.intervention}</dd></div>
        <div><dt>Closure status (source)</dt><dd>{infx.status}</dd></div>
      </dl>
      <div className="qd-infx-links">
        <span className="qd-link-label"><Link2 size={12} aria-hidden="true" /> Linked RCA / adverse event</span>
        {linkedEvent ? (
          <p>
            {linkedEvent.eventId} · {linkedEvent.rcaId ?? 'no RCA id recorded'} —{' '}
            {linkedEvent.rcaFindings ?? 'findings not yet recorded'}{' '}
            <i className={linkedEvent.status.toLowerCase().includes('complete') ? 'qd-ok' : 'qd-hold'}>{linkedEvent.status}</i>
          </p>
        ) : (
          <p className="qd-empty">
            No adverse-event cross-reference found for {infx.linkedEventId ?? 'this case'} in this quarter's normalized data.
          </p>
        )}
        <span className="qd-link-label"><Link2 size={12} aria-hidden="true" /> Linked corrective action / PIP</span>
        {linkedCaps.length ? (
          <ul>
            {linkedCaps.map((c) => (
              <li key={c.capId}>
                {c.capId} — {c.description}{' '}
                <i className={c.effectivenessDemonstrated ? 'qd-ok' : 'qd-hold'}>
                  {c.status}{c.effectivenessDemonstrated ? ' · effectiveness demonstrated' : ' · effectiveness not yet demonstrated'}
                </i>
              </li>
            ))}
          </ul>
        ) : (
          <p className="qd-empty">No corrective action plan cross-referenced to this case yet.</p>
        )}
      </div>
    </article>
  );
}

export default function InfectionOversight({ quarter }: InfectionOversightProps) {
  const q = QAPI_2026.quarters[quarter];

  const trend = useMemo(
    () =>
      QUARTER_KEYS.map((k) => {
        const qq = QAPI_2026.quarters[k];
        return {
          key: k,
          normalized: qq.normalizationStatus === 'normalized',
          count: qq.infections.length,
          openCount: qq.infections.filter((i) => !i.resolutionDate).length,
        };
      }),
    [],
  );

  const repeatTypes = useMemo(() => {
    const counts = new Map<string, number>();
    QUARTER_KEYS.forEach((k) =>
      QAPI_2026.quarters[k].infections.forEach((i) => counts.set(i.infectionType, (counts.get(i.infectionType) ?? 0) + 1)),
    );
    return [...counts.entries()].filter(([, n]) => n > 1);
  }, []);

  return (
    <section className="qd-panel" aria-labelledby={`qd-infx-${quarter}`}>
      <header className="qd-panel-head">
        <Activity size={16} aria-hidden="true" />
        <div>
          <span>INFECTION OVERSIGHT</span>
          <h3 id={`qd-infx-${quarter}`}>{quarter} infection prevention &amp; control</h3>
        </div>
      </header>

      <div className="qd-trend-row" role="list" aria-label="2026 infection trend by quarter">
        {trend.map((t) => (
          <div key={t.key} role="listitem" className={`qd-trend-cell ${t.normalized ? '' : 'pending'}`}>
            <span>{t.key}</span>
            <strong>{t.normalized ? t.count : '—'}</strong>
            <small>{t.normalized ? `${t.openCount} open` : 'normalization pending'}</small>
          </div>
        ))}
      </div>

      {repeatTypes.length > 0 ? (
        <p className="qd-flag-row">
          <AlertTriangle size={13} aria-hidden="true" />
          Repeat infection type(s) across normalized quarters: {repeatTypes.map(([t, n]) => `${t} (${n})`).join(', ')}{' '}
          — review for a cluster or systemic pattern.
        </p>
      ) : (
        <p className="qd-empty">No repeat infection type recorded across normalized quarters yet.</p>
      )}

      {q.normalizationStatus === 'pending' ? (
        <div className="qd-pending-card">
          <FileWarning size={22} aria-hidden="true" />
          <h3>{quarter} normalization pending</h3>
          <p>
            No infection surveillance record has been normalized for {quarter} yet. No case count is shown — an
            unlabeled zero would misrepresent whether infections occurred.
          </p>
        </div>
      ) : q.infections.length ? (
        <div className="qd-list">
          {q.infections.map((i) => <InfectionRecordCard key={i.infxId} quarter={q} infx={i} />)}
        </div>
      ) : (
        <p className="qd-empty"><CheckCircle2 size={14} aria-hidden="true" /> No infection events normalized for {quarter}.</p>
      )}
    </section>
  );
}
