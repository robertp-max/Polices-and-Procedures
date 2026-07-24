// Left "Board Book" exhibit panel — search over the CasePack's exhibits, a
// packet-readiness summary line, and a sectioned list of exhibit rows
// carrying posture/confidentiality/validation/relevance badges plus the
// evidence cutoff. Selecting a row feeds the Board Table's Evidence
// Inspector (state is lifted to TabletopSession).
//
// NOTE: the interactive Round-0 packet disposition gate itself is the real
// PacketReadinessGate component (see PacketReadinessGate.tsx) — it is a
// full decision surface (checks/value/onSubmit), not a sidebar banner, so
// TabletopSession renders it as its own session phase rather than nesting
// it in this panel. This panel only shows a passive, data-driven summary.
//
// Ground-up build for tabletop2026/ — does not reuse ../tabletop/* markup.

import { useMemo, useState } from 'react';
import { Search, FileWarning, ShieldAlert } from 'lucide-react';
import type { CasePack, Exhibit } from './engine/caseTypes';

function badgeClass(prefix: string, value: string): string {
  return `bs-badge ${prefix}-${value}`;
}

function ExhibitBadges({ exhibit, outOfCutoff }: { exhibit: Exhibit; outOfCutoff: boolean }) {
  return (
    <div className="bs-exhibit-row-badges">
      <span className={badgeClass('posture', exhibit.posture)}>{exhibit.posture.replace('_', ' ')}</span>
      <span className={badgeClass('conf', exhibit.confidentiality)}>{exhibit.confidentiality.replace('_', ' ')}</span>
      <span className={badgeClass('val', exhibit.validationState)}>{exhibit.validationState}</span>
      <span className={badgeClass('rel', exhibit.relevance)}>{exhibit.relevance.replace('_', ' ')}</span>
      {outOfCutoff ? (
        <span className="bs-badge val-conflicting">
          <FileWarning size={9} /> out of cutoff
        </span>
      ) : null}
    </div>
  );
}

export interface BoardBookPanelProps {
  casePack: CasePack;
  activeExhibitId: string | null;
  citedExhibitIds: string[];
  cutoffViolationIds: ReadonlySet<string>;
  onSelectExhibit: (exhibitId: string) => void;
}

export default function BoardBookPanel({
  casePack,
  activeExhibitId,
  citedExhibitIds,
  cutoffViolationIds,
  onSelectExhibit,
}: BoardBookPanelProps) {
  const [query, setQuery] = useState('');

  const unresolvedCount = useMemo(
    () => casePack.exhibits.filter((e) => e.posture === 'unresolved').length,
    [casePack.exhibits],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return casePack.exhibits;
    return casePack.exhibits.filter((e) =>
      [e.title, e.summary, e.section, e.sourceId, e.sourceLabel ?? ''].some((f) => f.toLowerCase().includes(q)),
    );
  }, [casePack.exhibits, query]);

  const bySection = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Exhibit[]>();
    for (const exhibit of filtered) {
      if (!map.has(exhibit.section)) {
        map.set(exhibit.section, []);
        order.push(exhibit.section);
      }
      map.get(exhibit.section)!.push(exhibit);
    }
    return order.map((section) => ({ section, exhibits: map.get(section)! }));
  }, [filtered]);

  return (
    <nav className="bs-boardbook" aria-label="Board Book exhibits">
      <header>
        <strong>Board Book</strong>
        <span className="bs-kicker">Evidence cutoff {casePack.sourceCutoff}</span>
      </header>

      {(cutoffViolationIds.size > 0 || unresolvedCount > 0) && (
        <div className="bs-supplemental-flag" style={{ margin: '10px 16px 0' }} role="status">
          <ShieldAlert size={13} aria-hidden="true" />
          <span>
            {cutoffViolationIds.size > 0 ? `${cutoffViolationIds.size} exhibit(s) postdate the cutoff. ` : ''}
            {unresolvedCount > 0 ? `${unresolvedCount} exhibit(s) are unresolved/unattributed.` : ''}
          </span>
        </div>
      )}

      <div className="bs-boardbook-search">
        <Search size={13} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search exhibits…"
          aria-label="Search Board Book exhibits"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="bs-boardbook-list">
        {bySection.length === 0 ? (
          <p style={{ color: 'var(--bs-muted)', fontSize: 11, padding: '8px 4px' }}>No exhibits match this search.</p>
        ) : (
          bySection.map(({ section, exhibits }) => (
            <div key={section}>
              <p className="bs-kicker" style={{ margin: '10px 4px 6px' }}>
                {section}
              </p>
              {exhibits.map((exhibit) => {
                const active = exhibit.id === activeExhibitId;
                const cited = citedExhibitIds.includes(exhibit.id);
                return (
                  <button
                    type="button"
                    key={exhibit.id}
                    className={`bs-exhibit-row${active ? ' active' : ''}`}
                    onClick={() => onSelectExhibit(exhibit.id)}
                    aria-pressed={active}
                  >
                    <div className="bs-exhibit-row-head">
                      <span>{exhibit.sourceId}</span>
                      {cited ? <span className="bs-kicker">cited</span> : null}
                    </div>
                    <strong>{exhibit.title}</strong>
                    <small>{exhibit.summary}</small>
                    <ExhibitBadges exhibit={exhibit} outOfCutoff={cutoffViolationIds.has(exhibit.id)} />
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>
    </nav>
  );
}
