/* ═══════════════════════════════════════════════════════════════
   SprintExecutionBoard — 6 fixed columns, swimlanes by Event,
   enforcement-driven drag/drop with snap-back & inline warnings.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { AlertOctagon } from 'lucide-react';
import {
  type ExecutionUnit, type ComplianceState,
  COMPLIANCE_STATE_ORDER, COMPLIANCE_STATE_LABEL, COMPLIANCE_DOMAIN_LABEL,
} from '../../types';
import { useComplianceExecution } from '@/policy/compliance-execution';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { useExecutionEnforcement } from '../../hooks/useExecutionEnforcement';
import { ExecutionUnitCard } from './ExecutionUnitCard';
import { AriaLiveRegion, ToneBadge, BorderGlow } from '@/policy/components/ui';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';
import { useShellStore } from '@/policy/stores/uiStore';

interface DragState {
  unit: ExecutionUnit;
}

interface FlashWarning {
  id: number;
  text: string;
}

export function SprintExecutionBoard() {
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const snap = useComplianceExecution({ mode: 'sprint', window: sprintWindow });
  const projectedTasks = useProjectedTasks('sprint');
  const openTask = useSelectedTaskStore(s => s.openTask);
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');
  const EVENTS          = snap.events;
  const EXECUTION_UNITS = snap.executionUnits;

  const [units, setUnits]     = useState<ExecutionUnit[]>(() => [...EXECUTION_UNITS]);
  const [drag, setDrag]       = useState<DragState | null>(null);
  const [overCol, setOverCol] = useState<ComplianceState | null>(null);
  const [flash, setFlash]     = useState<FlashWarning | null>(null);

  /* Resync local board when engine snapshot updates. */
  useEffect(() => { setUnits([...EXECUTION_UNITS]); }, [EXECUTION_UNITS]);

  const { canTransitionState } = useExecutionEnforcement();

  /* Use actual live app data for tasks: prefer exact projected PM task ids (from taskProjection + regulatory store + autogen) */
  const taskIdByUnitId = useMemo(() => {
    const map = new Map<string, string>();
    for (const unit of units) {
      const eventTasks = projectedTasks.filter(task => task.event_id === unit.parentEventId);
      const sourceForms = new Set(unit.sourceFormIds ?? []);
      const matched = eventTasks.find(task => task.task_id === unit.id)
        ?? eventTasks.find(task => task.task_id === unit.id.replace(/^ceu-/, ''))
        ?? eventTasks.find((task: any) => 'step_id' in task && task.step_id && (unit.id.includes(task.step_id) || (task.step_id && unit.id.endsWith(task.step_id))))
        ?? eventTasks.find(task => task.form_refs?.some(formId => sourceForms.has(formId)))
        ?? eventTasks.find(task => (task.generated_form_instance_ids || []).some(f => (unit.sourceFormIds || []).includes(f)))
        ?? eventTasks.find(task => {
          const unitTitle = unit.title.toLowerCase();
          const taskTitle = task.title.toLowerCase();
          return unitTitle.includes(taskTitle) || taskTitle.includes(unitTitle);
        })
        ?? eventTasks[0];
      if (matched) map.set(unit.id, matched.task_id);
      else map.set(unit.id, unit.id); // fallback to live unit id itself for canonical open
    }
    return map;
  }, [projectedTasks, units]);

  const openCanonicalTask = useCallback((unit: ExecutionUnit) => {
    openTask(taskIdByUnitId.get(unit.id) ?? unit.id, 'sprint');
  }, [openTask, taskIdByUnitId]);

  /* ── Group: Event → Workflow → Units, sliced per column ── */
  const byEvent = useMemo(() => {
    return EVENTS.map(ev => {
      const evUnits = units.filter(u => u.parentEventId === ev.id);
      return { event: ev, units: evUnits };
    }).filter(g => g.units.length > 0);
  }, [units, EVENTS]);

  // Clean corporate V3 tokens — subtle glass, no bleeding, matching app palette (teal primary). Uses isLight + v3 instead of raw darks.
  const columnTint: Record<ComplianceState, { hd: string; hdfg: string; bg: string; bd: string; accent: string }> = useMemo(() => {
    const subtle = isLight ? 'rgba(0,0,0,0.015)' : 'rgba(255,255,255,0.005)';
    const glass = isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.008)';
    const tealGlass = isLight ? 'rgba(0,121,112,0.06)' : 'rgba(0,209,193,0.06)';
    const tealGlass2 = isLight ? 'rgba(0,121,112,0.08)' : 'rgba(0,209,193,0.08)';
    const orangeGlass = isLight ? 'rgba(224,123,44,0.06)' : 'rgba(224,123,44,0.08)';
    const redGlass = isLight ? 'rgba(215,1,1,0.06)' : 'rgba(239,68,68,0.08)';
    const greenGlass = isLight ? 'rgba(0,133,64,0.05)' : 'rgba(16,185,129,0.06)';
    const tealFg = 'var(--v3-teal-light)';
    const orangeFg = 'var(--v3-orange-light)';
    const textSec = 'var(--v3-text-secondary)';
    const borderSub = 'var(--v3-border-subtle)';
    const border = 'var(--v3-border)';
    return {
      upcoming:           { hd: subtle, hdfg: textSec, bg: subtle, bd: borderSub, accent: borderSub },
      ready:              { hd: tealGlass,    hdfg: tealFg,     bg: glass, bd: borderSub, accent: tealFg },
      in_progress:        { hd: tealGlass2,   hdfg: tealFg,     bg: glass, bd: border, accent: tealFg },
      awaiting_signature: { hd: orangeGlass,  hdfg: orangeFg,   bg: glass, bd: isLight ? '#E5E4E3' : 'rgba(224,123,44,0.25)', accent: orangeFg },
      blocked:            { hd: redGlass,     hdfg: isLight ? '#D70101' : '#fca5a5', bg: subtle, bd: isLight ? '#F49E9E' : 'rgba(239,68,68,0.25)', accent: isLight ? '#D70101' : '#fca5a5' },
      completed:          { hd: greenGlass,   hdfg: isLight ? '#008540' : '#4ade80', bg: subtle, bd: borderSub, accent: isLight ? '#008540' : '#4ade80' },
    };
  }, [isLight]);

  const flashWarn = useCallback((text: string) => {
    setFlash({ id: Date.now(), text });
    setTimeout(() => setFlash(f => (f && Date.now() - f.id >= 2800 ? null : f)), 3000);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, unit: ExecutionUnit) => {
    setDrag({ unit });
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDrag(null);
    setOverCol(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, col: ComplianceState) => {
    if (!drag) return;
    e.preventDefault();
    setOverCol(col);
  }, [drag]);

  const handleDrop = useCallback((target: ComplianceState) => {
    if (!drag) return;
    const verdict = canTransitionState(drag.unit, target);
    if (!verdict.allowed) {
      flashWarn(verdict.reason);   // snap-back: do not mutate state
      setDrag(null);
      setOverCol(null);
      return;
    }
    setUnits(curr =>
      curr.map(u => u.id === drag.unit.id ? { ...u, complianceState: target } : u),
    );
    setDrag(null);
    setOverCol(null);
  }, [drag, canTransitionState, flashWarn]);

  return (
    <div className="space-y-4 ces-sprint-board w-full" data-ces-board data-full-bleed>
      {/* Clean corporate summary — matches V3 header language, no heavy CES navy. Full bleed friendly, isLight v3 tokens. */}
      <BorderGlow borderRadius={8} glowIntensity={0.6} className="inline-block">
        <div
          className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] px-3 py-1 rounded-md"
          style={{
            background: isLight ? '#F1F5F4' : 'rgba(255,255,255,0.02)',
            color: 'var(--v3-text-secondary)',
            border: 'none',
          }}
        >
          {units.filter(u => u.complianceState !== 'completed').length} open · {units.filter(u => u.complianceState === 'completed').length} closed
        </div>
      </BorderGlow>

      {/* ── Inline warning bar — clean corporate red soft. isLight + v3 tokens, no raw dark bleed. */}
      {flash && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{
            background: isLight ? '#FEF2F2' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${isLight ? '#FECACA' : 'rgba(239,68,68,0.25)'}`,
          }}
        >
          <AlertOctagon size={16} style={{ color: isLight ? '#D70101' : '#fca5a5' }} />
          <div className="text-[12.5px] font-semibold" style={{ color: isLight ? '#B91C1C' : '#fecaca' }}>
            Enforcement: {flash.text}
          </div>
        </div>
      )}
      <AriaLiveRegion politeness="assertive" message={flash ? `Enforcement: ${flash.text}` : ''} />

      {/* ── Board (6 columns, horizontal scroll) — full bleed container, clean subtle glass, v3 tokens, no bleed ───────── */}
      <div className="overflow-x-auto -mx-1 pb-1 w-full">
        <div key={units.length + (overCol || 'none')} className="grid gap-4 v3-subview-animate" style={{ gridTemplateColumns: 'repeat(6, minmax(260px, 1fr))', minWidth: 1650, width: '100%' }}>
          {COMPLIANCE_STATE_ORDER.map(state => {
            const tint = columnTint[state];
            const isOver = overCol === state;
            const colUnits = units.filter(u => u.complianceState === state);
            return (
              <div
                key={state}
                onDragOver={e => handleDragOver(e, state)}
                onDrop={() => handleDrop(state)}
                className="rounded-xl flex flex-col w-full"
                style={{
                  background: isOver ? (isLight ? 'rgba(0,121,112,0.05)' : 'rgba(0,209,193,0.06)') : tint.bg,
                  border: `1px solid ${isOver ? 'var(--v3-teal-light)' : tint.bd}`,
                  minHeight: 560,
                }}
              >
                {/* Column header — clean, matching corporate. Pill count per #4 style */}
                <div
                  className="px-3 py-2 rounded-t-xl flex items-center justify-between"
                  style={{ background: tint.hd, borderBottom: `1px solid ${tint.bd}` }}
                >
                  <ToneBadge tone={state === 'blocked' ? 'danger' : state === 'awaiting_signature' ? 'orange' : state === 'completed' ? 'success' : 'teal'}>
                    {COMPLIANCE_STATE_LABEL[state]}
                  </ToneBadge>
                  <span
                    className="text-[10px] font-semibold rounded-full px-2 py-px"
                    style={{ background: isLight ? 'rgba(0,121,112,0.08)' : 'rgba(255,255,255,0.06)', color: tint.hdfg, border: 'none' }}
                  >
                    {colUnits.length}
                  </span>
                </div>

                {/* Event groups cleaned — full bleed container, pill headers (no swimlane bleed) */}
                <div className="p-2 space-y-2 flex-1">
                  {byEvent.map(grp => {
                    const grpUnits = grp.units.filter(u => u.complianceState === state);
                    if (grpUnits.length === 0) return null;
                    return (
                      <div key={grp.event.id} className="relative">
                        <SwimlaneHeader title={grp.event.title} domain={COMPLIANCE_DOMAIN_LABEL[grp.event.domain]} count={grpUnits.length} isLight={isLight} />
                        <div className="space-y-1.5 mt-1">
                          {grpUnits.map(u => (
                            <ExecutionUnitCard
                              key={u.id}
                              unit={u}
                              draggable={state !== 'completed'}
                              onClick={() => openCanonicalTask(u)}
                              onDragStart={handleDragStart}
                              onDragEnd={handleDragEnd}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {colUnits.length === 0 && (
                    <div
                      className="text-[10px] text-center py-6 italic rounded-md"
                      style={{ color: 'var(--v3-text-tertiary)', background: isLight ? 'rgba(0,0,0,0.01)' : 'rgba(255,255,255,0.01)', border: '1px dashed var(--v3-border-subtle)' }}
                    >
                      No tasks in {COMPLIANCE_STATE_LABEL[state].toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── SwimlaneHeader — #4 exact pill style (rounded-full 999px, clean corporate, isLight + v3, no left-border swimlane bleed) ─────────────────────────────────────── */
function SwimlaneHeader({ title, domain, count, isLight }: { title: string; domain: string; count?: number; isLight: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.11em] px-2.5 py-0.5 rounded-full"
      style={{
        background: isLight ? '#F1F5F4' : 'rgba(255,255,255,0.02)',
        border: 'none',
        color: 'var(--v3-text-secondary)',
      }}
      aria-label={`Event: ${title}`}
    >
      <span className="truncate font-medium" style={{ color: 'var(--v3-text-primary)' }}>{title}</span>
      <span
        className="ml-auto text-[8px] font-bold px-1.5 py-px rounded-full"
        style={{ background: isLight ? 'rgba(0,121,112,0.08)' : 'rgba(0,209,193,0.12)', color: isLight ? '#007970' : 'var(--v3-teal-light)', border: 'none' }}
      >
        {domain}
      </span>
      {count != null && (
        <span className="text-[8px] font-mono opacity-60">{count}</span>
      )}
    </div>
  );
}
