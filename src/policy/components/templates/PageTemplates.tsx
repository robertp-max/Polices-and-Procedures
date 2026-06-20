/**
 * Premium Page Template Components — Care Indeed V3
 *
 * High-fidelity, composable templates that map cleanly from PAGE_REGISTRY
 * (use page.label / page.pageId to select and title these at call sites).
 *
 * Design goals:
 * - Native Care Indeed brand in BOTH themes (v3-veil dark + care-indeed-light)
 * - Composition-first: built exclusively from primitives (SpotlightCard,
 *   GlassPanel / SurfaceCard, DataGrid, RightDrawer, SearchField, PageHeader,
 *   ActionButton, CiStatusBadge, etc.)
 * - Real mouse-tracking radial glow + subtle 2px lift on spotlight KPI cards
 * - Delightful, intuitive interactions: card→drawer, filter chips, mock drag,
 *   live local state updates, contextual drawer content
 * - Strictly generic / placeholder sample data (no PHI, no real identifiers)
 * - Expensive, modern, clean, premium command-center aesthetic
 *
 * Usage example:
 *   import { PAGE_BY_ID } from '@/policy/security/identity/pageRegistry';
 *   import { DashboardTemplate, BoardTemplate, ... } from './PageTemplates';
 *
 *   const page = PAGE_BY_ID['page.dashboard'];
 *   <DashboardTemplate title={page.label} />
 *
 *   // Or for CES board:
 *   <BoardTemplate title={PAGE_BY_ID['page.ces-board'].label} />
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  ArrowRight, Download, Edit3, Play, RefreshCw, Users, FolderOpen,
} from 'lucide-react';

import {
  PageHeader,
  SurfaceCard, // legacy container usages here; prototype exact structure enforced for dashboard/CES/other card usages
  SearchField,
  DataGrid,
  RightDrawer,
  CiStatusBadge,
  ActionButton,
  SpotlightCard,
  EmptyState,
} from '@/policy/components/ui';

import {
  PAGE_REGISTRY,
  COMPONENT_GROUPS,
  getPagesForComponent,
} from '@/policy/security/identity/pageRegistry';

import type { PageRegistryEntry, ComponentId } from '@/policy/security/identity/pageAccessTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Shared Types & Tiny Utilities (max reuse inside this module)
// ─────────────────────────────────────────────────────────────────────────────

type Tone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

interface DrawerState<T = any> {
  open: boolean;
  data: T | null;
  title?: string;
  eyebrow?: string;
}

function useDrawer<T>() {
  const [state, setState] = useState<DrawerState<T>>({ open: false, data: null });
  const open = useCallback((data: T, meta?: { title?: string; eyebrow?: string }) => {
    setState({ open: true, data, title: meta?.title, eyebrow: meta?.eyebrow });
  }, []);
  const close = useCallback(() => setState(s => ({ ...s, open: false })), []);
  return { state, open, close };
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.08em] transition-all border ${
        active
          ? 'bg-[var(--ci-accent)] text-white border-[var(--ci-accent)] shadow-sm'
          : 'border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)] hover:border-[var(--v3-border-hover)] hover:text-[var(--v3-text-primary)]'
      }`}
    >
      {children}
    </button>
  );
}

function KpiValue({ value, trend }: { value: string; trend?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <div className="font-montserrat text-[28px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--v3-text-primary)]">
        {value}
      </div>
      {trend && (
        <div className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-emerald-400' : 'text-amber-400'}`}>
          {trend}
        </div>
      )}
    </div>
  );
}

// Generic status pill using existing primitive where possible
function StatusPill({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const map: Record<Tone, string> = {
    neutral: 'bg-[var(--v3-surface-subtle)] text-[var(--v3-text-secondary)]',
    success: 'bg-emerald-500/15 text-emerald-400',
    warning: 'bg-amber-500/15 text-amber-400',
    danger: 'bg-rose-500/15 text-rose-400',
    info: 'bg-sky-500/15 text-sky-400',
  };
  return (
    <span className={`inline-flex items-center rounded px-2 py-px text-[10px] font-semibold uppercase tracking-[0.12em] ${map[tone]}`}>
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD TEMPLATE — Premium Command Center
// Maps to: page.dashboard + similar operator landing surfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface DashboardTemplateProps {
  title?: string;
  eyebrow?: string;
}

export function DashboardTemplate({ title = 'Dashboard', eyebrow = 'COMMAND CENTER' }: DashboardTemplateProps) {
  const drawer = useDrawer<any>();
  const [activityFilter, setActivityFilter] = useState<'all' | 'alerts' | 'complete'>('all');

  // Hero readiness bar data (generic)
  const readiness = { pct: 94, label: 'Agency Readiness', onTrack: 18, total: 22 };

  // 6 Spotlight KPI cards — real mouse tracking + 2px lift via SpotlightCard + group lift
  const kpis = [
    { id: 'k1', label: 'Compliance Readiness', value: '94%', trend: '+3%', tone: 'success' as const, detail: '18 of 22 events on track. 3 nearing due.' },
    { id: 'k2', label: 'Pending Signatures', value: '7', trend: '-2', tone: 'warning' as const, detail: '4 clinician forms, 3 supervisor attestations.' },
    { id: 'k3', label: 'Evidence Items', value: '142', trend: '+19', tone: 'info' as const, detail: 'This month. 11 new since last sprint.' },
    { id: 'k4', label: 'Active Clinicians', value: '31', trend: '+1', tone: 'success' as const, detail: '28 field-ready. 3 on PTO.' },
    { id: 'k5', label: 'Open Tasks', value: '19', trend: '-4', tone: 'warning' as const, detail: '6 high priority. Avg age 2.8 days.' },
    { id: 'k6', label: 'Audit Score', value: '97', trend: '+1', tone: 'success' as const, detail: 'Last external review. Zero findings.' },
  ];

  // Quick actions (delightful — clicking populates contextual drawer)
  const quickActions = [
    { id: 'qa1', label: 'Start New Sprint', icon: Play, ctx: 'sprint' },
    { id: 'qa2', label: 'Review Evidence Queue', icon: FolderOpen, ctx: 'evidence' },
    { id: 'qa3', label: 'Export Audit Packet', icon: Download, ctx: 'audit' },
    { id: 'qa4', label: 'Assign Clinician', icon: Users, ctx: 'staffing' },
  ];

  // Recent activity (mini table + list)
  const activities = [
    { id: 'a1', time: '14m ago', actor: 'M. Rivera', action: 'Signed quarterly assessment', status: 'complete' as const },
    { id: 'a2', time: '51m ago', actor: 'System', action: 'CES Sprint #Q3-07 auto-advanced 4 units', status: 'complete' as const },
    { id: 'a3', time: '2h ago', actor: 'J. Patel', action: 'Uploaded wound photo evidence — EV-4491', status: 'alert' as const },
    { id: 'a4', time: 'Yesterday', actor: 'L. Torres', action: 'Completed compliance module — Appendix F', status: 'complete' as const },
    { id: 'a5', time: 'Yesterday', actor: 'System', action: 'Policy GV-GB-003 superseded — v4 published', status: 'alert' as const },
  ];

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return activities;
    return activities.filter(a => (activityFilter === 'alerts' ? a.status === 'alert' : a.status === 'complete'));
  }, [activityFilter]);

  const openKpi = (kpi: any) => drawer.open(kpi, { title: kpi.label, eyebrow: 'KPI DETAIL' });
  const openQuick = (qa: any) => drawer.open(qa, { title: qa.label, eyebrow: 'QUICK ACTION' });
  const openActivity = (act: any) => drawer.open(act, { title: 'Activity Detail', eyebrow: act.time.toUpperCase() });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        description="Real-time visibility across compliance, staffing, and execution."
        actions={
          <ActionButton variant="secondary" size="sm" leftIcon={<RefreshCw size={15} />} onClick={() => window.location.reload()}>
            Refresh
          </ActionButton>
        }
      />

      {/* Hero Readiness Bar — premium, expensive command-center bar */}
      <SurfaceCard padding="lg" className="relative overflow-hidden border border-[var(--v3-border-subtle)]">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          <div>
            <div className="uppercase tracking-[0.2em] text-[10px] text-[var(--v3-text-tertiary)] font-semibold">AGENCY-WIDE</div>
            <div className="font-montserrat text-3xl font-semibold tracking-[-0.025em] text-[var(--v3-text-primary)] mt-0.5">
              {readiness.label} <span className="text-[var(--ci-accent)]">{readiness.pct}%</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="h-2.5 w-full rounded-full bg-[var(--v3-border-subtle)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${readiness.pct}%`,
                  background: 'linear-gradient(90deg, var(--ci-accent), #00D1C1)',
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-[var(--v3-text-tertiary)]">
              <div>{readiness.onTrack} on track</div>
              <div>{readiness.total - readiness.onTrack} attention needed</div>
            </div>
          </div>
          <ActionButton variant="cta" size="sm" onClick={() => drawer.open({ type: 'readiness' }, { title: 'Readiness Breakdown', eyebrow: 'LIVE' })}>
            View Full Report
          </ActionButton>
        </div>
      </SurfaceCard>

      {/* Spotlight KPI Cards — 4-6 interactive, real radial mouse glow + 2px lift */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="uppercase text-[10px] tracking-[0.18em] text-[var(--v3-text-tertiary)] font-semibold">KEY PERFORMANCE INDICATORS</div>
          <button onClick={() => drawer.open({ type: 'all-kpis' }, { title: 'All Metrics', eyebrow: 'DETAILED VIEW' })} className="text-[11px] text-[var(--ci-accent)] flex items-center gap-1 hover:underline">
            See all <ArrowRight size={13} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {kpis.map((kpi) => (
            <SpotlightCard
              key={kpi.id}
              onClick={() => openKpi(kpi)}
              className="group cursor-pointer min-h-[136px] flex flex-col justify-between p-5 transition-transform duration-200 hover:-translate-y-[2px] active:scale-[0.985]"
              spotlightColor={kpi.tone === 'success' ? 'rgba(16,185,129,0.18)' : kpi.tone === 'warning' ? 'rgba(245,158,11,0.18)' : 'rgba(0, 121, 112, 0.18)'}
            >
              <div className="flex items-start justify-between">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--v3-text-tertiary)] pr-3">{kpi.label}</div>
                <StatusPill tone={kpi.tone === 'success' ? 'success' : kpi.tone === 'warning' ? 'warning' : 'info'}>{kpi.tone}</StatusPill>
              </div>
              <KpiValue value={kpi.value} trend={kpi.trend} />
              <div className="text-[12px] text-[var(--v3-text-secondary)] leading-snug line-clamp-2 mt-1 pr-1">{kpi.detail}</div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid + Recent Activity (side-by-side premium layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="uppercase text-[10px] tracking-[0.18em] text-[var(--v3-text-tertiary)] mb-3 px-1 font-semibold">QUICK ACTIONS</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.id}
                  onClick={() => openQuick(qa)}
                  className="group flex items-center gap-3 rounded-2xl border border-[var(--v3-border-subtle)] bg-[var(--v3-glass-card)] px-5 py-4 text-left transition-all hover:border-[var(--v3-border-hover)] hover:-translate-y-px active:scale-[0.985]"
                >
                  <div className="shrink-0 rounded-xl p-2.5 bg-[var(--v3-surface-subtle)] group-hover:bg-[var(--ci-accent)]/10 transition-colors">
                    <Icon size={18} className="text-[var(--ci-accent)]" />
                  </div>
                  <div className="font-medium text-[var(--v3-text-primary)] pr-1">{qa.label}</div>
                  <ArrowRight size={15} className="ml-auto opacity-40 group-hover:opacity-100 transition" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Recent Activity — mini table + filter chips */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="uppercase text-[10px] tracking-[0.18em] text-[var(--v3-text-tertiary)] font-semibold">RECENT ACTIVITY</div>
            <div className="flex items-center gap-1.5">
              {(['all', 'alerts', 'complete'] as const).map(f => (
                <FilterChip key={f} active={activityFilter === f} onClick={() => setActivityFilter(f)}>
                  {f}
                </FilterChip>
              ))}
            </div>
          </div>

          <SurfaceCard padding="none" className="overflow-hidden border border-[var(--v3-border-subtle)]">
            <DataGrid>
              <DataGrid.Head>
                <DataGrid.HeaderRow>
                  <DataGrid.HeaderCell>Time</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Actor</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell>Action</DataGrid.HeaderCell>
                  <DataGrid.HeaderCell align="right">Status</DataGrid.HeaderCell>
                </DataGrid.HeaderRow>
              </DataGrid.Head>
              <DataGrid.Body>
                {filteredActivities.map((act) => (
                  <DataGrid.Row key={act.id} onClick={() => openActivity(act)} className="cursor-pointer hover:bg-[var(--v3-surface-subtle)]/60">
                    <DataGrid.Cell className="font-mono text-xs text-[var(--v3-text-tertiary)]">{act.time}</DataGrid.Cell>
                    <DataGrid.Cell>{act.actor}</DataGrid.Cell>
                    <DataGrid.Cell className="text-[var(--v3-text-primary)]">{act.action}</DataGrid.Cell>
                    <DataGrid.Cell align="right">
                      <StatusPill tone={act.status === 'complete' ? 'success' : 'warning'}>{act.status}</StatusPill>
                    </DataGrid.Cell>
                  </DataGrid.Row>
                ))}
              </DataGrid.Body>
            </DataGrid>
          </SurfaceCard>
        </div>
      </div>

      {/* Contextual Right Drawer — re-used for KPI, quick actions, activity */}
      <RightDrawer
        open={drawer.state.open}
        onClose={drawer.close}
        width="md"
        eyebrow={drawer.state.eyebrow}
        title={drawer.state.title}
        footer={
          <div className="flex justify-end gap-2">
            <ActionButton variant="ghost" onClick={drawer.close}>Close</ActionButton>
            <ActionButton variant="cta" onClick={() => { /* mock primary action */ drawer.close(); }}>Take Action</ActionButton>
          </div>
        }
      >
        {drawer.state.data && (
          <div className="space-y-6 py-2 text-sm">
            {drawer.state.data.type === 'readiness' && (
              <>
                <div>Agency readiness computed from live regulatory events, evidence completeness, and certification status.</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-[var(--v3-border-subtle)]">On Track: 18</div>
                  <div className="p-3 rounded-xl border border-[var(--v3-border-subtle)]">At Risk: 3</div>
                  <div className="p-3 rounded-xl border border-[var(--v3-border-subtle)]">Blocked: 1</div>
                  <div className="p-3 rounded-xl border border-[var(--v3-border-subtle)]">Cert Due: 4</div>
                </div>
              </>
            )}
            {drawer.state.data.label && drawer.state.data.value && (
              <div>
                <div className="text-[var(--v3-text-tertiary)] text-xs tracking-widest mb-1">CURRENT VALUE</div>
                <div className="text-5xl font-semibold tabular-nums">{drawer.state.data.value}</div>
                <div className="mt-4 text-[var(--v3-text-secondary)] leading-relaxed">{drawer.state.data.detail}</div>
              </div>
            )}
            {drawer.state.data.ctx && (
              <div className="text-[var(--v3-text-secondary)]">This action would navigate to the appropriate surface or launch a guided flow. All data here is simulated for demonstration.</div>
            )}
            {drawer.state.data.action && (
              <div className="rounded-xl border p-4 text-[var(--v3-text-secondary)] bg-[var(--v3-surface-subtle)]/40">
                Full audit trail and related artifacts are available in the Evidence Center and Audit Mode.
              </div>
            )}
          </div>
        )}
      </RightDrawer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BOARD TEMPLATE (Kanban) + CALENDAR TEMPLATE
// For: CES Sprint Board, CES Calendar, Master Calendar, PM views
// ─────────────────────────────────────────────────────────────────────────────

export interface BoardCalendarTemplateProps {
  title?: string;
  mode?: 'board' | 'calendar';
}

export function BoardTemplate(props: BoardCalendarTemplateProps) {
  return <BoardCalendarTemplate {...props} mode="board" />;
}

export function CalendarTemplate(props: BoardCalendarTemplateProps) {
  return <BoardCalendarTemplate {...props} mode="calendar" />;
}

function BoardCalendarTemplate({ title = 'Board', mode = 'board' }: BoardCalendarTemplateProps) {
  const drawer = useDrawer<any>();
  const [view, setView] = useState<'board' | 'calendar'>(mode);
  const [items, setItems] = useState(() => [
    { id: 't1', title: 'Wound Care Re-assessment', status: 'in_progress', owner: 'A. Okonkwo, RN', due: 'Jun 18', priority: 'high' },
    { id: 't2', title: 'OASIS-C2 Documentation Review', status: 'ready', owner: 'J. Patel, RN', due: 'Jun 19', priority: 'med' },
    { id: 't3', title: 'Supervisor Sign-off — Episode 4492', status: 'awaiting_signature', owner: 'L. Torres', due: 'Jun 17', priority: 'high' },
    { id: 't4', title: 'Safety Incident Follow-up', status: 'in_progress', owner: 'M. Rivera', due: 'Jun 20', priority: 'med' },
    { id: 't5', title: 'Annual Competency — IV Therapy', status: 'completed', owner: 'S. Kim, PT', due: 'Jun 12', priority: 'low' },
    { id: 't6', title: 'Patient Intake — New Admission', status: 'ready', owner: 'Team Alpha', due: 'Jun 21', priority: 'high' },
  ]);

  const columns = [
    { key: 'ready', label: 'Ready', tone: 'info' as const },
    { key: 'in_progress', label: 'In Progress', tone: 'warning' as const },
    { key: 'awaiting_signature', label: 'Awaiting Signature', tone: 'warning' as const },
    { key: 'completed', label: 'Completed', tone: 'success' as const },
  ];

  const filteredByCol = (colKey: string) => items.filter(i => i.status === colKey);

  // Mock drag (HTML5). Updates local state — delightful snap feedback
  const handleDragStart = (e: React.DragEvent, item: any) => {
    e.dataTransfer.setData('text/plain', item.id);
  };
  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    setItems(prev => prev.map(it => it.id === id ? { ...it, status: newStatus } : it));
    // flash success in drawer context later
  };

  // Calendar mock — simple 7-col grid for current "week"
  const weekDays = ['Mon 16', 'Tue 17', 'Wed 18', 'Thu 19', 'Fri 20', 'Sat 21', 'Sun 22'];
  const eventsByDay: Record<number, any[]> = {
    1: [{ id: 't3', title: 'Sign-off due' }],
    2: [{ id: 't1', title: 'Re-assessment' }, { id: 't6', title: 'New admission' }],
    4: [{ id: 't2', title: 'OASIS Review' }],
  };

  const openItem = (item: any) => drawer.open(item, { title: item.title, eyebrow: 'TASK / EVENT' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <PageHeader eyebrow="CES EXECUTION" title={title} className="pb-0" />
        <div className="flex gap-2">
          <ActionButton variant={view === 'board' ? 'cta' : 'secondary'} size="sm" onClick={() => setView('board')}>Board</ActionButton>
          <ActionButton variant={view === 'calendar' ? 'cta' : 'secondary'} size="sm" onClick={() => setView('calendar')}>Calendar</ActionButton>
        </div>
      </div>

      {view === 'board' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => (
            <div
              key={col.key}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.key)}
              className="rounded-3xl border border-[var(--v3-border-subtle)] bg-[var(--v3-glass-card)] p-3 min-h-[460px] flex flex-col"
            >
              <div className="flex items-center justify-between px-2 py-2">
                <div className="uppercase text-xs tracking-[0.16em] font-semibold text-[var(--v3-text-tertiary)]">{col.label}</div>
                <StatusPill tone={col.tone}>{filteredByCol(col.key).length}</StatusPill>
              </div>
              <div className="space-y-3 mt-1 flex-1">
                {filteredByCol(col.key).map(item => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onClick={() => openItem(item)}
                    className="group cursor-grab active:cursor-grabbing rounded-2xl border border-[var(--v3-border-subtle)] bg-[var(--v3-surface-subtle)] p-4 hover:border-[var(--v3-border-hover)] transition-all active:scale-[0.985]"
                  >
                    <div className="font-semibold text-[var(--v3-text-primary)] leading-tight pr-6">{item.title}</div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <div className="text-[var(--v3-text-secondary)]">{item.owner}</div>
                      <div className="font-mono text-[var(--v3-text-tertiary)]">{item.due}</div>
                    </div>
                    {item.priority === 'high' && <div className="mt-2 text-[10px] text-rose-400 font-semibold tracking-wider">HIGH PRIORITY</div>}
                  </div>
                ))}
                {filteredByCol(col.key).length === 0 && <div className="text-[11px] text-center py-8 text-[var(--v3-text-tertiary)]">Drop items here</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Calendar grid view */
        <div className="rounded-3xl border border-[var(--v3-border-subtle)] p-4 bg-[var(--v3-glass-card)]">
          <div className="grid grid-cols-7 gap-px bg-[var(--v3-border-subtle)] rounded-2xl overflow-hidden">
            {weekDays.map((day, idx) => (
              <div key={idx} className="bg-[var(--v3-glass-card)] min-h-[168px] p-3">
                <div className="font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--v3-text-tertiary)] mb-2">{day}</div>
                {(eventsByDay[idx] || []).map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => openItem(items.find(i => i.id === ev.id) || ev)}
                    className="mb-1.5 w-full text-left text-xs rounded-xl border border-[var(--v3-border-subtle)] px-3 py-2 hover:bg-[var(--v3-surface-subtle)] transition"
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <div className="text-center text-[10px] mt-3 text-[var(--v3-text-tertiary)]">Click any event card to open detail drawer. Drag simulation available in Board mode.</div>
        </div>
      )}

      <RightDrawer open={drawer.state.open} onClose={drawer.close} width="lg" title={drawer.state.title} eyebrow={drawer.state.eyebrow}>
        {drawer.state.data && (
          <div className="space-y-5 text-sm">
            <div className="flex gap-3">
              <CiStatusBadge tone={drawer.state.data.priority === 'high' ? 'danger' : 'info'}>{drawer.state.data.status?.replace('_', ' ')}</CiStatusBadge>
              <div>Due {drawer.state.data.due}</div>
            </div>
            <div>Owner: <strong>{drawer.state.data.owner}</strong></div>
            <SurfaceCard padding="sm">
              <div className="text-xs uppercase tracking-widest mb-1 text-[var(--v3-text-tertiary)]">RELATED ARTIFACTS</div>
              <div className="space-y-1 text-[var(--v3-text-secondary)]">• Assessment form (v3)<br />• Evidence folder (12 items)<br />• Prior notes — 3 attachments</div>
            </SurfaceCard>
            <div className="flex gap-2">
              <ActionButton variant="cta" leftIcon={<Edit3 size={15} />}>Open in Task Workspace</ActionButton>
              <ActionButton variant="secondary" onClick={drawer.close}>Mark Complete (mock)</ActionButton>
            </div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVIDENCE TEMPLATE
// Directory + detail cards, filter tray, DataTable backing
// ─────────────────────────────────────────────────────────────────────────────

export interface EvidenceTemplateProps {
  title?: string;
}

export function EvidenceTemplate({ title = 'Evidence Center' }: EvidenceTemplateProps) {
  const drawer = useDrawer<any>();
  const [search, setSearch] = useState('');
  const [activeTypes, setActiveTypes] = useState<string[]>(['All']);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const evidenceTypes = ['All', 'Assessment', 'Photo', 'Incident', 'Form', 'Note'];

  const sampleEvidence = useMemo(() => [
    { id: 'E-3921', title: 'Wound assessment — 06/11', type: 'Assessment', status: 'verified', date: 'Jun 11', owner: 'Field RN' },
    { id: 'E-3920', title: 'Site photo — left heel', type: 'Photo', status: 'verified', date: 'Jun 11', owner: 'A. Okonkwo' },
    { id: 'E-3918', title: 'Safety incident report #SI-77', type: 'Incident', status: 'review', date: 'Jun 10', owner: 'M. Rivera' },
    { id: 'E-3914', title: 'OASIS admission packet', type: 'Form', status: 'verified', date: 'Jun 9', owner: 'System' },
    { id: 'E-3909', title: 'Care plan update note', type: 'Note', status: 'review', date: 'Jun 8', owner: 'J. Patel' },
  ], []);

  const filtered = useMemo(() => {
    return sampleEvidence.filter(e => {
      const matchesSearch = !search || [e.title, e.id, e.owner].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesType = activeTypes.includes('All') || activeTypes.includes(e.type);
      return matchesSearch && matchesType;
    });
  }, [search, activeTypes, sampleEvidence]);

  const toggleType = (t: string) => {
    if (t === 'All') { setActiveTypes(['All']); return; }
    setActiveTypes(prev => {
      const withoutAll = prev.filter(x => x !== 'All');
      if (withoutAll.includes(t)) return withoutAll.filter(x => x !== t).length ? withoutAll.filter(x => x !== t) : ['All'];
      return [...withoutAll, t];
    });
  };

  const openEvidence = (ev: any) => drawer.open(ev, { title: ev.title, eyebrow: ev.id });

  return (
    <div>
      <PageHeader eyebrow="COMPLIANCE ARTIFACTS" title={title} actions={<ActionButton variant="secondary" size="sm" leftIcon={<Download size={15} />}>Export Bundle</ActionButton>} />

      {/* Filter Tray */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="text-xs uppercase tracking-[0.14em] text-[var(--v3-text-tertiary)] mr-1">FILTER</div>
        {evidenceTypes.map(t => (
          <FilterChip key={t} active={activeTypes.includes(t)} onClick={() => toggleType(t)}>{t}</FilterChip>
        ))}
        <div className="ml-auto flex items-center gap-3">
          <SearchField value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search evidence..." className="w-72" />
          <ActionButton variant="ghost" size="sm" onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}>
            {viewMode === 'cards' ? 'Table View' : 'Card View'}
          </ActionButton>
        </div>
      </div>

      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ev => (
            <button key={ev.id} onClick={() => openEvidence(ev)} className="text-left rounded-2xl border border-[var(--v3-border-subtle)] p-5 hover:border-[var(--v3-border-hover)] transition bg-[var(--v3-glass-card)] group">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-[var(--v3-text-tertiary)]">
                <span>{ev.id}</span><span>{ev.date}</span>
              </div>
              <div className="mt-3 font-semibold text-[var(--v3-text-primary)] text-[15px] leading-snug group-hover:text-[var(--ci-accent)] transition">{ev.title}</div>
              <div className="mt-4 flex items-center justify-between">
                <CiStatusBadge tone={ev.status === 'verified' ? 'success' : 'warning'}>{ev.status}</CiStatusBadge>
                <div className="text-xs text-[var(--v3-text-secondary)]">{ev.type} · {ev.owner}</div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <EmptyState title="No matches" description="Try broadening your filters." />}
        </div>
      ) : (
        <SurfaceCard padding="none" className="border border-[var(--v3-border-subtle)] overflow-hidden">
          <DataGrid>
            <DataGrid.Head>
              <DataGrid.HeaderRow>
                <DataGrid.HeaderCell>ID</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Title</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Type</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Status</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Date</DataGrid.HeaderCell>
                <DataGrid.HeaderCell>Owner</DataGrid.HeaderCell>
              </DataGrid.HeaderRow>
            </DataGrid.Head>
            <DataGrid.Body>
              {filtered.map(ev => (
                <DataGrid.Row key={ev.id} onClick={() => openEvidence(ev)} className="cursor-pointer hover:bg-[var(--v3-surface-subtle)]">
                  <DataGrid.Cell className="font-mono text-xs">{ev.id}</DataGrid.Cell>
                  <DataGrid.Cell>{ev.title}</DataGrid.Cell>
                  <DataGrid.Cell><StatusPill tone="neutral">{ev.type}</StatusPill></DataGrid.Cell>
                  <DataGrid.Cell><CiStatusBadge tone={ev.status === 'verified' ? 'success' : 'warning'}>{ev.status}</CiStatusBadge></DataGrid.Cell>
                  <DataGrid.Cell>{ev.date}</DataGrid.Cell>
                  <DataGrid.Cell>{ev.owner}</DataGrid.Cell>
                </DataGrid.Row>
              ))}
            </DataGrid.Body>
          </DataGrid>
        </SurfaceCard>
      )}

      <RightDrawer open={drawer.state.open} onClose={drawer.close} width="md" title={drawer.state.title} eyebrow={drawer.state.eyebrow} footer={<ActionButton variant="cta" leftIcon={<Download size={15} />}>Download Original</ActionButton>}>
        {drawer.state.data && (
          <div className="space-y-5 text-sm">
            <div>Chain-of-custody verified. Linked to regulatory event EVT-4491 and policy GV-GB-019.</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
              <div>Uploaded: Jun 11 2026 09:41 PDT</div>
              <div>Version: 3</div>
              <div>Size: 1.8 MB</div>
              <div>Hash: SHA-256 verified</div>
            </div>
            <div className="pt-2 border-t border-[var(--v3-border-subtle)] text-[var(--v3-text-secondary)]">No PHI stored in preview metadata. Full document accessible via signed URL to authorized roles only.</div>
          </div>
        )}
      </RightDrawer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE DIRECTORY TEMPLATE + DETAIL PAGE TEMPLATE
// Staffing (Clinicians, Patients) — clean, no PHI. Click opens drawer or switches view.
// DetailPageTemplate is also the generic rich viewer (Policy Detail, Form Viewer, etc.)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileDirectoryTemplateProps {
  title?: string;
  persona?: 'clinician' | 'patient';
}

export function ProfileDirectoryTemplate({ title = 'Profiles', persona = 'clinician' }: ProfileDirectoryTemplateProps) {
  const drawer = useDrawer<any>();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'review'>('all');

  const profiles = useMemo(() => [
    { id: 'p-001', name: 'Amara Okonkwo, RN', role: 'Registered Nurse', area: 'North Bay', status: 'active', metric: 'Caseload: 9', sub: 'BLS • Wound • 42 days to license renewal' },
    { id: 'p-002', name: 'Jordan Hale, PT', role: 'Physical Therapist', area: 'Marin', status: 'active', metric: 'Caseload: 7', sub: 'Ortho • Home safety certified' },
    { id: 'p-003', name: 'Priya Singh, LVN', role: 'Licensed Vocational Nurse', area: 'East Bay', status: 'review', metric: 'Caseload: 11', sub: 'IV certified • Annual due Jul 02' },
    { id: 'p-004', name: 'Marcus Bell, RN', role: 'Registered Nurse', area: 'Peninsula', status: 'active', metric: 'Caseload: 5', sub: 'Hospice • Preceptor' },
  ], []);

  const filtered = profiles.filter(p => {
    const q = search.toLowerCase();
    const match = p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q) || p.area.toLowerCase().includes(q);
    const statusOk = statusFilter === 'all' || p.status === statusFilter;
    return match && statusOk;
  });

  const openProfile = (p: any) => drawer.open(p, { title: p.name, eyebrow: 'PROFILE' });

  return (
    <div>
      <PageHeader eyebrow={persona.toUpperCase() + ' DIRECTORY'} title={title} />

      <div className="flex flex-wrap gap-2 mb-4">
        <SearchField value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, role, area..." />
        {['all', 'active', 'review'].map(s => <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s as any)}>{s}</FilterChip>)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(p => (
          <button key={p.id} onClick={() => openProfile(p)} className="group text-left rounded-3xl border border-[var(--v3-border-subtle)] p-6 bg-[var(--v3-glass-card)] hover:-translate-y-px hover:border-[var(--v3-border-hover)] transition-all">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-2xl bg-[var(--ci-accent)]/10 text-[var(--ci-accent)] flex items-center justify-center font-montserrat font-semibold text-xl tracking-tight">{p.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}</div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-[var(--v3-text-primary)] text-[15px]">{p.name}</div>
                <div className="text-xs text-[var(--v3-text-secondary)]">{p.role} · {p.area}</div>
              </div>
              <CiStatusBadge tone={p.status === 'active' ? 'success' : 'warning'}>{p.status}</CiStatusBadge>
            </div>
            <div className="mt-5 pl-1 text-sm font-medium text-[var(--v3-text-primary)]">{p.metric}</div>
            <div className="pl-1 mt-0.5 text-xs text-[var(--v3-text-secondary)] leading-snug">{p.sub}</div>
          </button>
        ))}
      </div>

      <RightDrawer open={drawer.state.open} onClose={drawer.close} width="lg" title={drawer.state.title} eyebrow={drawer.state.eyebrow}>
        {drawer.state.data && <ProfileDetailContent profile={drawer.state.data} onAction={() => drawer.close()} />}
      </RightDrawer>
    </div>
  );
}

// Reusable clean profile detail block (no PHI)
function ProfileDetailContent({ profile, onAction }: { profile: any; onAction?: () => void }) {
  return (
    <div className="space-y-6 py-1">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-[var(--ci-accent)]/10 flex items-center justify-center text-3xl font-semibold text-[var(--ci-accent)]">{profile.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}</div>
        <div>
          <div className="font-montserrat text-xl font-semibold">{profile.name}</div>
          <div className="text-sm">{profile.role} — {profile.area}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <SurfaceCard padding="sm"><div className="text-xs text-[var(--v3-text-tertiary)]">STATUS</div><div className="mt-1 font-medium">{profile.status.toUpperCase()}</div></SurfaceCard>
        <SurfaceCard padding="sm"><div className="text-xs text-[var(--v3-text-tertiary)]">METRIC</div><div className="mt-1 font-medium">{profile.metric}</div></SurfaceCard>
      </div>

      <div>
        <div className="uppercase tracking-[0.14em] text-xs mb-2 text-[var(--v3-text-tertiary)]">COMPLIANCE &amp; CREDENTIALS</div>
        <ul className="space-y-1 text-sm text-[var(--v3-text-secondary)]">
          <li>• All required licenses current</li>
          <li>• Annual training complete (Appendix F attached)</li>
          <li>• BLS / ACLS verified — expires in 11 months</li>
        </ul>
      </div>

      <div className="flex gap-2 pt-1">
        <ActionButton variant="cta" onClick={onAction}>Open Full Detail (mock)</ActionButton>
        <ActionButton variant="secondary">Schedule Shift</ActionButton>
      </div>
    </div>
  );
}

// Generic rich Detail Page Template — Policy Detail, Form Viewer, Clinician Detail, etc.
export interface DetailPageTemplateProps {
  title: string;
  eyebrow?: string;
  meta?: Array<{ label: string; value: string }>;
  sections?: Array<{ heading: string; body: React.ReactNode }>;
  onOpenDrawerAction?: (action: string) => void;
}

export function DetailPageTemplate({ title, eyebrow = 'DETAIL VIEW', meta = [], sections = [], onOpenDrawerAction }: DetailPageTemplateProps) {
  const drawer = useDrawer<string>();

  const defaultSections = sections.length ? sections : [
    { heading: 'Overview', body: 'This surface renders rich structured policy or form content using canonical section renderers. All formatting is token-driven and theme-aware.' },
    { heading: 'Requirements', body: 'Evidence, signatures, and attestations are tracked via the compliance execution engine.' },
  ];

  const defaultMeta = meta.length ? meta : [
    { label: 'Version', value: 'v4.1' },
    { label: 'Effective', value: '2026-02-14' },
    { label: 'Owner', value: 'Compliance' },
  ];

  return (
    <div className="max-w-3xl">
      <PageHeader
        eyebrow={eyebrow}
        title={title}
        actions={
          <>
            <ActionButton variant="secondary" size="sm" onClick={() => { onOpenDrawerAction?.('history'); drawer.open('history', { title: 'Version History', eyebrow: 'AUDIT' }); }}>History</ActionButton>
            <ActionButton variant="cta" size="sm" onClick={() => { onOpenDrawerAction?.('sign'); drawer.open('sign', { title: 'Sign / Attest', eyebrow: 'SECURE' }); }}>Sign</ActionButton>
          </>
        }
      />

      <div className="flex gap-2 flex-wrap mb-8">
        {defaultMeta.map((m, i) => (
          <div key={i} className="rounded-full border border-[var(--v3-border-subtle)] px-3.5 py-1 text-xs text-[var(--v3-text-secondary)]">{m.label}: <span className="font-medium text-[var(--v3-text-primary)]">{m.value}</span></div>
        ))}
      </div>

      <div className="space-y-8">
        {defaultSections.map((sec, idx) => (
          <div key={idx}>
            <div className="font-semibold tracking-tight mb-3 text-lg">{sec.heading}</div>
            <div className="prose prose-sm max-w-none text-[var(--v3-text-secondary)] leading-relaxed">{sec.body}</div>
          </div>
        ))}
      </div>

      <RightDrawer open={drawer.state.open} onClose={drawer.close} title={drawer.state.title} eyebrow={drawer.state.eyebrow}>
        <div className="py-4 text-sm text-[var(--v3-text-secondary)]">
          {drawer.state.data === 'sign' && 'Signature pad + attestation controls would mount here. All signatures are captured with full cryptographic audit trail.'}
          {drawer.state.data === 'history' && 'Full immutable revision log. Click any prior version to compare diff or restore (admin only).'}
          {!['sign', 'history'].includes(drawer.state.data || '') && 'Contextual action panel. Drawer content is fully composable per template usage.'}
        </div>
      </RightDrawer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN MATRIX TEMPLATE
// For User Assignments, Page View Access, Roles — clean matrix / grouped toggles
// Uses live registry groups + pages for realism. Fully interactive mock toggles.
// ─────────────────────────────────────────────────────────────────────────────

export interface AdminMatrixTemplateProps {
  title?: string;
}

type AccessLevel = 'none' | 'read' | 'write';

export function AdminMatrixTemplate({ title = 'Page View Access Matrix' }: AdminMatrixTemplateProps) {
  const [matrix, setMatrix] = useState<Record<string, AccessLevel>>(() => {
    const seed: Record<string, AccessLevel> = {};
    PAGE_REGISTRY.forEach(p => { seed[p.pageId] = p.defaultAccess === 'none' ? 'none' : 'read'; });
    return seed;
  });
  const [message, setMessage] = useState('');

  const setLevel = (pageId: string, level: AccessLevel) => {
    setMatrix(m => ({ ...m, [pageId]: level }));
    setMessage('Local mock state updated. (Persist via real pageAccessStore in production.)');
    setTimeout(() => setMessage(''), 1600);
  };

  const bulkSet = (componentId: ComponentId, level: AccessLevel) => {
    const pages = getPagesForComponent(componentId);
    setMatrix(m => {
      const next = { ...m };
      pages.forEach(p => { next[p.pageId] = level; });
      return next;
    });
    setMessage(`Bulk ${level.toUpperCase()} applied to group.`);
    setTimeout(() => setMessage(''), 1600);
  };

  return (
    <div>
      <PageHeader eyebrow="IDENTITY &amp; ACCESS" title={title} description="Interactive simulation. Uses exact PAGE_REGISTRY + COMPONENT_GROUPS." />

      {message && <div className="mb-4 text-xs px-3 py-1 rounded bg-emerald-500/10 text-emerald-400">{message}</div>}

      <div className="space-y-8">
        {COMPONENT_GROUPS.map(group => {
          const pages = getPagesForComponent(group.componentId);
          return (
            <SurfaceCard key={group.componentId} padding="lg" className="border border-[var(--v3-border-subtle)]">
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mb-4">
                <div>
                  <div className="font-semibold text-[var(--v3-text-primary)]">{group.label}</div>
                  <div className="text-xs text-[var(--v3-text-secondary)]">{group.description}</div>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[var(--v3-text-tertiary)] mr-1">BULK:</span>
                  {(['none', 'read', 'write'] as const).map(l => (
                    <button key={l} onClick={() => bulkSet(group.componentId, l)} className="rounded border px-2.5 py-px hover:bg-[var(--v3-surface-subtle)] border-[var(--v3-border-subtle)]">{l}</button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[var(--v3-border-subtle)]">
                {pages.map(page => {
                  const current = matrix[page.pageId] || 'none';
                  return (
                    <div key={page.pageId} className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm">
                      <div className="min-w-[220px]">
                        <div>{page.label}</div>
                        <div className="text-[10px] font-mono text-[var(--v3-text-tertiary)]">{page.pageId}</div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {(['none', 'read', 'write'] as const).map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setLevel(page.pageId, lvl)}
                            className={`rounded-full px-3 py-1 border transition-all ${current === lvl ? 'bg-[var(--ci-accent)] text-white border-[var(--ci-accent)]' : 'border-[var(--v3-border-subtle)] hover:bg-[var(--v3-surface-subtle)]'}`}
                          >
                            {lvl === 'write' ? 'Read + Write' : lvl === 'read' ? 'Read' : 'None'}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// REGISTRY TABLE TEMPLATE + DOCUMENTATION TEMPLATE
// Searchable/filterable master table of pages or documentation content
// ─────────────────────────────────────────────────────────────────────────────

export interface RegistryTableTemplateProps {
  title?: string;
  kind?: 'pages' | 'docs';
}

export function RegistryTableTemplate({ title = 'Registry', kind = 'pages' }: RegistryTableTemplateProps) {
  const [q, setQ] = useState('');
  const drawer = useDrawer<PageRegistryEntry>();

  const rows = useMemo(() => {
    if (kind === 'docs') {
      // Generic documentation placeholder entries derived from groups
      return COMPONENT_GROUPS.slice(0, 7).map((g, idx) => ({
        pageId: `doc-${idx}`,
        label: `${g.label} — Reference Guide`,
        routePattern: `/system-documentation/${g.componentId}`,
        componentGroup: g.componentId,
        defaultAccess: 'read' as const,
        description: g.description,
      }));
    }
    return PAGE_REGISTRY;
  }, [kind]);

  const filtered = rows.filter(r =>
    [r.label, r.pageId, r.routePattern, r.componentGroup].some(v => v.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <PageHeader eyebrow="SYSTEM" title={title} />
      <div className="mb-4">
        <SearchField value={q} onChange={e => setQ(e.target.value)} placeholder="Search pages, routes, groups..." className="w-full max-w-md" />
      </div>

      <SurfaceCard padding="none" className="overflow-hidden border border-[var(--v3-border-subtle)]">
        <DataGrid>
          <DataGrid.Head>
            <DataGrid.HeaderRow>
              <DataGrid.HeaderCell>Label</DataGrid.HeaderCell>
              <DataGrid.HeaderCell>Page ID</DataGrid.HeaderCell>
              <DataGrid.HeaderCell>Route</DataGrid.HeaderCell>
              <DataGrid.HeaderCell>Group</DataGrid.HeaderCell>
              <DataGrid.HeaderCell>Default</DataGrid.HeaderCell>
            </DataGrid.HeaderRow>
          </DataGrid.Head>
          <DataGrid.Body>
            {filtered.map((row: any) => (
              <DataGrid.Row key={row.pageId} onClick={() => drawer.open(row, { title: row.label, eyebrow: 'REGISTRY ENTRY' })} className="cursor-pointer hover:bg-[var(--v3-surface-subtle)]">
                <DataGrid.Cell>{row.label}</DataGrid.Cell>
                <DataGrid.Cell className="font-mono text-xs text-[var(--v3-text-tertiary)]">{row.pageId}</DataGrid.Cell>
                <DataGrid.Cell className="font-mono text-xs">{row.routePattern}</DataGrid.Cell>
                <DataGrid.Cell><StatusPill tone="neutral">{row.componentGroup}</StatusPill></DataGrid.Cell>
                <DataGrid.Cell><CiStatusBadge tone={row.defaultAccess === 'none' ? 'danger' : 'success'}>{row.defaultAccess}</CiStatusBadge></DataGrid.Cell>
              </DataGrid.Row>
            ))}
          </DataGrid.Body>
        </DataGrid>
      </SurfaceCard>

      <RightDrawer open={drawer.state.open} onClose={drawer.close} title={drawer.state.title} eyebrow={drawer.state.eyebrow}>
        {drawer.state.data && (
          <pre className="text-xs bg-[var(--v3-surface-subtle)] p-4 rounded-xl overflow-auto border border-[var(--v3-border-subtle)]">{JSON.stringify(drawer.state.data, null, 2)}</pre>
        )}
      </RightDrawer>
    </div>
  );
}

export const DocumentationTemplate = RegistryTableTemplate;

// ─────────────────────────────────────────────────────────────────────────────
// JOURNEY TEMPLATE
// Progress steps + module cards. For all Journey / Onboarding surfaces.
// ─────────────────────────────────────────────────────────────────────────────

export interface JourneyTemplateProps {
  title?: string;
}

export function JourneyTemplate({ title = 'Onboarding Journey' }: JourneyTemplateProps) {
  const drawer = useDrawer<any>();
  const [currentStep, setCurrentStep] = useState(2);

  const steps = ['Account Setup', 'Core Compliance', 'Role Training', 'Competency Sign-off', 'Go-Live'];

  const modules = [
    { id: 'M01', title: 'HIPAA & Privacy Foundations', progress: 100, status: 'complete' },
    { id: 'M02', title: 'Infection Control & Safety', progress: 80, status: 'in-progress' },
    { id: 'M03', title: 'Documentation Standards (OASIS)', progress: 0, status: 'locked' },
    { id: 'M04', title: 'Emergency Preparedness', progress: 40, status: 'in-progress' },
  ];

  return (
    <div>
      <PageHeader eyebrow="TRAINING &amp; COMPETENCY" title={title} />

      {/* Progress Steps — horizontal premium stepper */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-[var(--v3-text-tertiary)]">PROGRESS</div>
        <div className="flex items-center">
          {steps.map((step, idx) => {
            const done = idx < currentStep;
            const active = idx === currentStep;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => setCurrentStep(idx)}
                  className={`flex flex-col items-center text-center min-w-[68px] ${active ? 'text-[var(--ci-accent)]' : done ? 'text-[var(--v3-text-primary)]' : 'text-[var(--v3-text-tertiary)]'}`}
                >
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center border text-xs font-mono ${done || active ? 'border-[var(--ci-accent)] bg-[var(--ci-accent)]/10' : 'border-[var(--v3-border-subtle)]'}`}>
                    {idx + 1}
                  </div>
                  <div className="text-[10px] mt-1.5 leading-tight max-w-[68px]">{step}</div>
                </button>
                {idx < steps.length - 1 && <div className={`flex-1 h-px mx-1 ${idx < currentStep - 1 ? 'bg-[var(--ci-accent)]' : 'bg-[var(--v3-border-subtle)]'}`} />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modules.map(mod => (
          <button
            key={mod.id}
            onClick={() => drawer.open(mod, { title: mod.title, eyebrow: 'MODULE' })}
            className="text-left rounded-3xl border border-[var(--v3-border-subtle)] p-6 hover:border-[var(--v3-border-hover)] bg-[var(--v3-glass-card)] group transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-mono text-xs tracking-widest text-[var(--ci-accent)]">{mod.id}</div>
                <div className="mt-1 font-semibold text-lg leading-tight text-[var(--v3-text-primary)] group-hover:text-[var(--ci-accent)]">{mod.title}</div>
              </div>
              <StatusPill tone={mod.status === 'complete' ? 'success' : mod.status === 'in-progress' ? 'warning' : 'neutral'}>{mod.status}</StatusPill>
            </div>

            <div className="mt-6 h-1.5 rounded bg-[var(--v3-border-subtle)] overflow-hidden">
              <div className="h-1.5 bg-[var(--ci-accent)] transition-all" style={{ width: `${mod.progress}%` }} />
            </div>
            <div className="text-right text-xs tabular-nums mt-1 text-[var(--v3-text-tertiary)]">{mod.progress}% complete</div>
          </button>
        ))}
      </div>

      <RightDrawer open={drawer.state.open} onClose={drawer.close} title={drawer.state.title} eyebrow={drawer.state.eyebrow}>
        <div className="text-sm space-y-4">
          <p>Module player content, quiz interface, or evidence upload surface would render here.</p>
          <ActionButton variant="cta" onClick={drawer.close}>Launch Module (mock)</ActionButton>
        </div>
      </RightDrawer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// End of Page Templates — all are self-contained, delightful, and registry-aligned.
// To wire: import specific template inside the actual page component for that route
// and pass title = PAGE_BY_ID[pageId].label
// ─────────────────────────────────────────────────────────────────────────────
