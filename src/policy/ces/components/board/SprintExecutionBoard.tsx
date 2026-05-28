/* ═══════════════════════════════════════════════════════════════
   SprintExecutionBoard — 6 fixed columns, swimlanes by Event,
   enforcement-driven drag/drop with snap-back & inline warnings.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { ChevronRight, AlertOctagon } from 'lucide-react';
import { useCesTokens } from '../../theme';
import {
  type ExecutionUnit, type ComplianceState,
  COMPLIANCE_STATE_ORDER, COMPLIANCE_STATE_LABEL, COMPLIANCE_DOMAIN_LABEL,
} from '../../types';
import { useComplianceExecution } from '@/policy/compliance-execution';
import { usePmViewSprintStore } from '@/policy/pm/pmViewSprintStore';
import { SprintScopeToolbar } from '@/policy/components/pm/SprintScopeToolbar';
import { useExecutionEnforcement } from '../../hooks/useExecutionEnforcement';
import { ExecutionUnitCard } from './ExecutionUnitCard';
import { AriaLiveRegion } from '@/policy/components/ui';
import { useProjectedTasks } from '@/policy/pm/taskProjection';
import { useSelectedTaskStore } from '@/policy/pm/selectedTaskStore';

interface DragState {
  unit: ExecutionUnit;
}

interface FlashWarning {
  id: number;
  text: string;
}

export function SprintExecutionBoard() {
  const t = useCesTokens();
  const sprintWindow = usePmViewSprintStore(s => s.window);
  const snap = useComplianceExecution({ mode: 'sprint', window: sprintWindow });
  const projectedTasks = useProjectedTasks('sprint');
  const openTask = useSelectedTaskStore(s => s.openTask);
  const EVENTS          = snap.events;
  const EXECUTION_UNITS = snap.executionUnits;

  const [units, setUnits]     = useState<ExecutionUnit[]>(() => [...EXECUTION_UNITS]);
  const [drag, setDrag]       = useState<DragState | null>(null);
  const [overCol, setOverCol] = useState<ComplianceState | null>(null);
  const [flash, setFlash]     = useState<FlashWarning | null>(null);

  /* Resync local board when engine snapshot updates. */
  useEffect(() => { setUnits([...EXECUTION_UNITS]); }, [EXECUTION_UNITS]);

  const { canTransitionState } = useExecutionEnforcement();

  const taskIdByUnitId = useMemo(() => {
    const map = new Map<string, string>();
    for (const unit of units) {
      const eventTasks = projectedTasks.filter(task => task.event_id === unit.parentEventId);
      const sourceForms = new Set(unit.sourceFormIds ?? []);
      const matched = eventTasks.find(task => task.task_id === unit.id)
        ?? eventTasks.find(task => 'step_id' in task && task.step_id && unit.id.includes(task.step_id))
        ?? eventTasks.find(task => task.form_refs?.some(formId => sourceForms.has(formId)))
        ?? eventTasks.find(task => {
          const unitTitle = unit.title.toLowerCase();
          const taskTitle = task.title.toLowerCase();
          return unitTitle.includes(taskTitle) || taskTitle.includes(unitTitle);
        })
        ?? eventTasks[0];
      if (matched) map.set(unit.id, matched.task_id);
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

  const columnTint: Record<ComplianceState, { hd: string; hdfg: string; bg: string; bd: string }> = useMemo(() => ({
    upcoming:           { hd: t.canvas,     hdfg: t.muted,  bg: t.canvas,     bd: t.border },
    ready:              { hd: t.navySoft,   hdfg: t.navy,   bg: t.canvas,     bd: t.border },
    in_progress:        { hd: t.navySoft,   hdfg: t.navy,   bg: t.canvas,     bd: t.border },
    awaiting_signature: { hd: t.orangeSoft, hdfg: t.orange, bg: t.orangeSoft, bd: t.orange + '55' },
    blocked:            { hd: t.redSoft,    hdfg: t.red,    bg: t.redSoft,    bd: t.red + '55' },
    completed:          { hd: t.greenSoft,  hdfg: t.green,  bg: t.canvas,     bd: t.border },
  }), [t]);

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
    <div className="space-y-5">
      <SprintScopeToolbar className="max-w-3xl" />
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: t.navy }}>
            Sprint Execution Board
          </h1>
          <p className="text-[13px] mt-1" style={{ color: t.muted }}>
            Event → Workflow → Execution Unit. Drag enforces state-machine rules; invalid moves snap back.
          </p>
        </div>
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md"
          style={{ background: t.navySoft, color: t.navy, border: `1px solid ${t.navy}33` }}
        >
          {units.filter(u => u.complianceState !== 'completed').length} open · {units.filter(u => u.complianceState === 'completed').length} closed
        </div>
      </div>

      {/* ── Inline warning bar ─────────────────────────── */}
      {flash && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: t.redSoft, border: `1px solid ${t.red}55` }}
        >
          <AlertOctagon size={16} style={{ color: t.red }} />
          <div className="text-[12.5px] font-semibold" style={{ color: t.red }}>
            Enforcement: {flash.text}
          </div>
        </div>
      )}
      <AriaLiveRegion politeness="assertive" message={flash ? `Enforcement: ${flash.text}` : ''} />

      {/* ── Board (6 columns, horizontal scroll) ───────── */}
      <div className="overflow-x-auto pb-3">
        <div key={units.length + (overCol || 'none')} className="grid gap-4 v3-subview-animate" style={{ gridTemplateColumns: 'repeat(6, minmax(280px, 1fr))', minWidth: 1700 }}>
          {COMPLIANCE_STATE_ORDER.map(state => {
            const tint = columnTint[state];
            const isOver = overCol === state;
            const colUnits = units.filter(u => u.complianceState === state);
            return (
              <div
                key={state}
                onDragOver={e => handleDragOver(e, state)}
                onDrop={() => handleDrop(state)}
                className="rounded-xl flex flex-col"
                style={{
                  background: isOver ? t.navySoft : tint.bg,
                  border:    `1px solid ${isOver ? t.navy : tint.bd}`,
                  minHeight: 600,
                }}
              >
                {/* Column header */}
                <div
                  className="px-3 py-2.5 rounded-t-xl flex items-center justify-between"
                  style={{ background: tint.hd, borderBottom: `1px solid ${tint.bd}` }}
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: tint.hdfg }}>
                    {COMPLIANCE_STATE_LABEL[state]}
                  </span>
                  <span
                    className="text-[10.5px] font-semibold rounded-full px-2 py-0.5"
                    style={{ background: t.white, color: tint.hdfg, border: `1px solid ${tint.bd}` }}
                  >
                    {colUnits.length}
                  </span>
                </div>

                {/* Swimlanes (Event groups) */}
                <div className="p-2 space-y-3 flex-1">
                  {byEvent.map(grp => {
                    const grpUnits = grp.units.filter(u => u.complianceState === state);
                    if (grpUnits.length === 0) return null;
                    return (
                      <div key={grp.event.id}>
                        <SwimlaneHeader title={grp.event.title} domain={COMPLIANCE_DOMAIN_LABEL[grp.event.domain]} />
                        <div className="space-y-2 mt-1.5">
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
                      className="text-[11px] text-center py-8 italic"
                      style={{ color: t.muted }}
                    >
                      No execution units in {COMPLIANCE_STATE_LABEL[state]}
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

/* ── SwimlaneHeader ─────────────────────────────────────── */
function SwimlaneHeader({ title, domain }: { title: string; domain: string }) {
  const t = useCesTokens();
  return (
    <div
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] px-1"
      style={{ color: t.muted }}
    >
      <ChevronRight size={10} />
      <span className="truncate">{title}</span>
      <span
        className="ml-auto text-[9px] font-semibold px-1.5 rounded"
        style={{ background: t.navySoft, color: t.navy }}
      >
        {domain}
      </span>
    </div>
  );
}
