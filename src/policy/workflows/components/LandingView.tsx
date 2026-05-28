import { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CI, DOMAIN_META } from '../brand';
import { WORKFLOW_CARDS } from '@/policy/data/workflows.generated';
import { WORKFLOW_GRAPH } from '@/policy/data/workflowGraph.generated';
import type { DomainCode, WorkflowCardProjection } from '@/policy/types/workflow';
import { WorkflowCard } from './WorkflowCard';

/* ══════════════════════════════════════════════════════════════════
   LandingView — the primary Workflow Library landing experience.

   Vertical composition (no scrolling at 1440×900):
     1. Title row              ~64px
     2. Breadcrumb + crumb     ~28px
     3. KPI band (4 tiles)     ~96px
     4. Command line           ~44px
     5. Card grid (3×3)        flexes
     6. Pager                  ~40px
   ══════════════════════════════════════════════════════════════════ */

interface LandingViewProps {
  selectedDomain: DomainCode | 'ALL';
  savedView: string | null;
}

const PAGE_SIZE = 9;

export function LandingView({ selectedDomain, savedView }: LandingViewProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(() => (typeof window === 'undefined' ? 1920 : window.innerWidth));
  const isMobile = viewportWidth < 768;
  const isTablet = viewportWidth >= 768 && viewportWidth < 1200;

  // Filter
  const filtered: WorkflowCardProjection[] = useMemo(() => {
    let list = WORKFLOW_CARDS;
    if (selectedDomain !== 'ALL') list = list.filter((c) => c.domain === selectedDomain);
    if (savedView === 'gb') list = list.filter((c) => c.requiresGoverningBody);
    if (savedView === 'highrisk') list = list.filter(
      (c) => c.declaredRisk === 'high' || c.declaredRisk === 'immediate_jeopardy',
    );
    if (savedView === 'recurring') list = list.filter((c) => c.cadence.kind === 'time_based');
    if (savedView === 'triggered') list = list.filter((c) => c.cadence.kind === 'event_based');
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((c) =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.processOverview.toLowerCase().includes(q),
      );
    }
    return list;
  }, [selectedDomain, savedView, query]);

  useEffect(() => { setPage(0); }, [selectedDomain, savedView, query]);
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const start = page * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const kpis = useMemo(() => {
    const recurring = WORKFLOW_CARDS.filter((c) => c.cadence.kind === 'time_based').length;
    const highRisk = WORKFLOW_CARDS.filter(
      (c) => c.declaredRisk === 'high' || c.declaredRisk === 'immediate_jeopardy',
    ).length;
    const gbPending = WORKFLOW_CARDS.filter((c) => c.requiresGoverningBody).length;
    return [
      { label: 'Total workflows',       value: WORKFLOW_GRAPH.kpis.total, accent: CI.ink },
      { label: 'Mandated / recurring',  value: recurring,                  accent: CI.ink },
      { label: 'High-risk open',        value: highRisk,                   accent: CI.orange },
      { label: 'GB approvals pending',  value: gbPending,                  accent: CI.deepTeal },
    ];
  }, []);

  const domainLabel =
    selectedDomain === 'ALL'
      ? 'All domains'
      : DOMAIN_META[selectedDomain].full;

  const savedViewLabel =
    savedView === 'gb' ? 'Governing Body' :
    savedView === 'highrisk' ? 'High-risk' :
    savedView === 'recurring' ? 'Recurring' :
    savedView === 'triggered' ? 'Trigger-based' :
    null;

  return (
    <div className="h-full flex flex-col" style={{ padding: isMobile ? '14px 14px 12px 14px' : '28px 32px 20px 32px' }}>
      {/* 1. Title row */}
      <div className="flex items-end justify-between" style={{ marginBottom: 8 }}>
        <div>
          <div
            style={{
              fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
              fontSize: 28, letterSpacing: -0.2, color: CI.ink, lineHeight: 1.2,
            }}
          >
            Workflows
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: 'Roboto, sans-serif', fontSize: 13,
              color: CI.inkSoft,
            }}
          >
            {WORKFLOW_GRAPH.kpis.total} operational workflows · {Object.keys(WORKFLOW_GRAPH.kpis.byDomain).length} domains
          </div>
        </div>
      </div>

      {/* 2. Breadcrumb strip */}
      <div
        className="flex items-center gap-2"
        style={{
          marginTop: 8, marginBottom: 16,
          fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.muted,
        }}
      >
        <span>Library</span>
        <span style={{ color: CI.line }}>/</span>
        <span style={{ color: selectedDomain === 'ALL' && !savedView ? CI.ink : CI.muted }}>
          {domainLabel}
        </span>
        {savedViewLabel ? (
          <>
            <span style={{ color: CI.line }}>/</span>
            <span style={{ color: CI.ink }}>{savedViewLabel}</span>
          </>
        ) : null}
      </div>

      {/* 3. KPI band */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-3`} style={{ marginBottom: 16 }}>
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{
              background: CI.paper,
              border: `1px solid ${CI.line}`,
              borderRadius: 8,
              padding: '14px 18px',
            }}
          >
            <div
              style={{
                fontFamily: 'Roboto, sans-serif', fontSize: 11,
                color: CI.muted, textTransform: 'uppercase', letterSpacing: 1,
              }}
            >
              {k.label}
            </div>
            <div
              style={{
                marginTop: 8,
                fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
                fontSize: 28, color: k.accent, lineHeight: 1,
              }}
            >
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Command line */}
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <div
          className="flex items-center gap-2 flex-1"
          style={{
            background: CI.paper,
            border: `1px solid ${CI.line}`,
            borderRadius: 8,
            padding: '8px 12px',
            height: 36,
          }}
        >
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search workflows by ID, title, process…   ⌘K"
            className="flex-1 outline-none bg-transparent"
            style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 13,
              color: CI.ink,
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{ color: CI.muted, fontSize: 12, fontFamily: 'Roboto, sans-serif' }}
            >clear</button>
          ) : null}
        </div>

        <div
          style={{
            fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.muted,
          }}
        >
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </div>
      </div>

      {/* 5. Card grid 3×3 */}
      <div className={`grid ${isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-3'} gap-4 flex-1 min-h-0`}>
        {pageItems.map((c) => (
          <WorkflowCard
            key={c.id}
            card={c}
            compact={isMobile}
            onOpen={() => navigate({ pathname: `/workflows/${c.id}`, search: location.search })}
          />
        ))}
        {pageItems.length === 0 ? (
          <div
            className="col-span-3 flex items-center justify-center"
            style={{
              fontFamily: 'Roboto, sans-serif', fontSize: 13, color: CI.muted,
              border: `1px dashed ${CI.line}`, borderRadius: 8,
            }}
          >
            No workflows match the current filters.
          </div>
        ) : null}
      </div>

      {/* 6. Pager */}
      <div
        className="flex items-center justify-between"
        style={{ marginTop: 16 }}
      >
        <div
          style={{ fontFamily: 'Roboto, sans-serif', fontSize: 12, color: CI.muted }}
        >
          Showing {filtered.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}
        </div>
        <div className="flex items-center gap-2">
          <PagerButton disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
            ← Prev
          </PagerButton>
          <div
            style={{
              fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 600,
              color: CI.ink, minWidth: 50, textAlign: 'center',
            }}
          >
            {page + 1} / {totalPages}
          </div>
          <PagerButton disabled={page >= totalPages - 1} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
            Next →
          </PagerButton>
        </div>
      </div>
    </div>
  );
}

function PagerButton({
  children, disabled, onClick,
}: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        fontFamily: 'Roboto, sans-serif', fontSize: 12,
        padding: '6px 12px', borderRadius: 6,
        border: `1px solid ${CI.line}`, background: CI.paper,
        color: disabled ? CI.muted : CI.ink,
        opacity: disabled ? 0.5 : 1, cursor: disabled ? 'default' : 'pointer',
      }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.borderColor = CI.teal; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = CI.line; }}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke={CI.muted} strokeWidth="1.5" />
      <path d="m20 20-4-4" stroke={CI.muted} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
