import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DOMAIN_META } from '../brand';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import type { DomainCode } from '@/policy/types/workflow';

/* ═══════════════════════════════════════════════════════════════════
   BrandRail — left internal navigation inside the Workflow Library.

   - 240px desktop, collapses to 64px at narrow widths via `compact`.
   - Separated from workspace by a 1px hairline (#E5E4E3) on the right.
   - No top logo, no bottom actor chip, no internal hairlines — the
     app shell (CommandCenterLayout) owns the Care Indeed logo, the
     hamburger menu, and the user avatar in the top bar above.
   ═══════════════════════════════════════════════════════════════════ */

interface BrandRailProps {
  selectedDomain: DomainCode | 'ALL';
  onSelectDomain: (domain: DomainCode | 'ALL') => void;
  savedView: string | null;
  onSelectSavedView: (id: string | null) => void;
  compact?: boolean;
  surface?: 'sidebar' | 'panel';
}

const SAVED_VIEWS: Array<{ id: string; label: string; hint: string }> = [
  { id: 'gb',       label: 'Governing Body',        hint: 'Approvals pending' },
  { id: 'highrisk', label: 'High-risk',              hint: 'Declared risk ≥ high' },
  { id: 'recurring',label: 'Recurring',              hint: 'Time-based cadence' },
  { id: 'triggered',label: 'Trigger-based',          hint: 'Event-based cadence' },
];

const DOMAIN_ORDER: DomainCode[] = ['GV', 'CL', 'QA', 'HR', 'CO', 'FN', 'OP', 'EN', 'IT', 'RM'];

export function BrandRail({
  selectedDomain, onSelectDomain, savedView, onSelectSavedView, compact, surface = 'sidebar',
}: BrandRailProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const domainCounts = useMemo(() => WORKFLOW_GRAPH.kpis.byDomain as Record<string, number>, []);
  const total = WORKFLOW_GRAPH.kpis.total;

  const atRoot = /^\/workflows\/?$/.test(location.pathname);

  return (
    <nav
      aria-label="Workflow navigation"
      className="flex-none flex flex-col overflow-y-auto"
      style={{
        width: compact ? 64 : surface === 'panel' ? '100%' : 268,
        borderRight: surface === 'sidebar' ? '1px solid var(--ci-overlay-border-strong)' : 'none',
        background: 'var(--ci-color-shell-navrail-bg)',
      }}
    >
      {/* WORKFLOWS header */}
      {!compact && (
        <div className="px-5 pt-5 pb-2">
          <div
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.22em',
              color: 'var(--ci-text-subtle)',
              textTransform: 'uppercase',
            }}
          >
            Workflows
          </div>
        </div>
      )}

      {/* All workflows */}
      <RailButton
        compact={compact}
        active={atRoot && selectedDomain === 'ALL' && !savedView}
        label="All workflows"
        count={total}
        onClick={() => { onSelectDomain('ALL'); onSelectSavedView(null); navigate('/workflows'); }}
      />

      {/* Domains */}
      {!compact && (
        <div className="px-5 pt-5 pb-2">
          <div
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600,
              fontSize: 11,
              letterSpacing: '0.22em',
              color: 'var(--ci-text-subtle)',
              textTransform: 'uppercase',
            }}
          >
            Domains
          </div>
        </div>
      )}
      <div className="flex flex-col">
        {DOMAIN_ORDER.map((d) => (
          <RailButton
            key={d}
            compact={compact}
            active={atRoot && selectedDomain === d && !savedView}
            label={DOMAIN_META[d].name}
            sublabel={compact ? undefined : d}
            count={domainCounts[d] ?? 0}
            onClick={() => { onSelectDomain(d); onSelectSavedView(null); navigate('/workflows'); }}
          />
        ))}
      </div>

      {/* Saved views */}
      {!compact && (
        <>
          <div className="px-5 pt-6 pb-2">
            <div
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: 11,
                letterSpacing: '0.22em',
                color: 'var(--ci-text-subtle)',
                textTransform: 'uppercase',
              }}
            >
              Saved views
            </div>
          </div>
          {SAVED_VIEWS.map((v) => (
            <RailButton
              key={v.id}
              compact={false}
              active={savedView === v.id}
              label={v.label}
              hint={v.hint}
              onClick={() => { onSelectSavedView(v.id === savedView ? null : v.id); navigate('/workflows'); }}
            />
          ))}
        </>
      )}

      <div className="flex-1" />
    </nav>
  );
}

/* ── Internal: a single row in the rail ─────────────────────────── */
function RailButton({
  compact, active, label, sublabel, count, hint, onClick,
}: {
  compact?: boolean;
  active?: boolean;
  label: string;
  sublabel?: string;
  count?: number;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-colors"
      style={{
        padding: compact ? '10px 8px' : '10px 18px',
        fontFamily: 'Roboto, sans-serif',
        fontSize: 13,
        color: active ? 'var(--ci-accent)' : 'var(--ci-text)',
        background: active ? 'rgba(var(--ci-accent-rgb), 0.14)' : 'transparent',
        borderLeft: `3px solid ${active ? 'var(--ci-accent)' : 'transparent'}`,
        fontWeight: active ? 500 : 400,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent';
      }}
    >
      {compact ? (
        <div
          className="flex items-center justify-center"
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: active ? 'var(--ci-accent)' : 'var(--ci-text-subtle)',
          }}
        >
          {sublabel ?? label.slice(0, 2).toUpperCase()}
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate">{label}</div>
            {hint ? (
              <div style={{ fontSize: 11, color: 'var(--ci-text-subtle)', marginTop: 2 }}>{hint}</div>
            ) : null}
          </div>
          {typeof count === 'number' ? (
            <div
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 11,
                fontWeight: 600,
                color: active ? 'var(--ci-accent)' : 'var(--ci-text-subtle)',
                minWidth: 20,
                textAlign: 'right',
              }}
            >
              {count}
            </div>
          ) : null}
        </div>
      )}
    </button>
  );
}
