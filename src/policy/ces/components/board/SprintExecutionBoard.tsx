/* ═══════════════════════════════════════════════════════════════
   SprintExecutionBoard — 6 fixed columns, swimlanes by Event,
   enforcement-driven drag/drop with snap-back & inline warnings.
   ═══════════════════════════════════════════════════════════════ */

import { useMemo, useState, useCallback, useEffect } from 'react';
import { ChevronRight, AlertOctagon } from 'lucide-react';
import { CES_TOKENS } from '../../theme';
import {
  type ExecutionUnit, type ComplianceState,
  COMPLIANCE_STATE_ORDER, COMPLIANCE_STATE_LABEL, COMPLIANCE_DOMAIN_LABEL,
} from '../../types';
import { useComplianceExecution } from '@/policy/compliance-execution';
import { useExecutionEnforcement } from '../../hooks/useExecutionEnforcement';
import { ExecutionUnitCard } from './ExecutionUnitCard';
import { WorkflowDrawer } from '../details/WorkflowDrawer';

const COLUMN_TINT: Record<ComplianceState, { hd: string; hdfg: string; bg: string; bd: string }> = {
  upcoming:           { hd: CES_TOKENS.canvas,    hdfg: CES_TOKENS.muted,  bg: CES_TOKENS.canvas,    bd: CES_TOKENS.border },
  ready:              { hd: CES_TOKENS.navySoft,  hdfg: CES_TOKENS.navy,   bg: CES_TOKENS.canvas,    bd: CES_TOKENS.border },
  in_progress:        { hd: CES_TOKENS.navySoft,  hdfg: CES_TOKENS.navy,   bg: CES_TOKENS.canvas,    bd: CES_TOKENS.border },
  awaiting_signature: { hd: CES_TOKENS.orangeSoft,hdfg: CES_TOKENS.orange, bg: '#FFFAF7',           bd: CES_TOKENS.orange + '40' },
  blocked:            { hd: CES_TOKENS.redSoft,   hdfg: CES_TOKENS.red,    bg: '#FCF5F4',           bd: CES_TOKENS.red + '40' },
  completed:          { hd: CES_TOKENS.greenSoft, hdfg: CES_TOKENS.green,  bg: CES_TOKENS.canvas,    bd: CES_TOKENS.border },
};

interface DragState {
  unit: ExecutionUnit;
}

interface FlashWarning {
  id: number;
  text: string;
}

export function SprintExecutionBoard() {
  const snap = useComplianceExecution();
  const EVENTS          = snap.events;
  const EXECUTION_UNITS = snap.executionUnits;

  const [units, setUnits]     = useState<ExecutionUnit[]>(() => [...EXECUTION_UNITS]);
  const [drag, setDrag]       = useState<DragState | null>(null);
  const [overCol, setOverCol] = useState<ComplianceState | null>(null);
  const [flash, setFlash]     = useState<FlashWarning | null>(null);
  const [openUnit, setOpenUnit] = useState<ExecutionUnit | null>(null);

  /* Resync local board when engine snapshot updates. */
  useEffect(() => { setUnits([...EXECUTION_UNITS]); }, [EXECUTION_UNITS]);

  const { canTransitionState } = useExecutionEnforcement();

  /* ── Group: Event → Workflow → Units, sliced per column ── */
  const byEvent = useMemo(() => {
    return EVENTS.map(ev => {
      const evUnits = units.filter(u => u.parentEventId === ev.id);
      return { event: ev, units: evUnits };
    }).filter(g => g.units.length > 0);
  }, [units, EVENTS]);

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
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold" style={{ color: CES_TOKENS.navy }}>
            Sprint Execution Board
          </h1>
          <p className="text-[13px] mt-1" style={{ color: CES_TOKENS.muted }}>
            Event → Workflow → Execution Unit. Drag enforces state-machine rules; invalid moves snap back.
          </p>
        </div>
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5 rounded-md"
          style={{ background: CES_TOKENS.navySoft, color: CES_TOKENS.navy, border: `1px solid ${CES_TOKENS.navy}22` }}
        >
          {units.filter(u => u.complianceState !== 'completed').length} open · {units.filter(u => u.complianceState === 'completed').length} closed
        </div>
      </div>

      {/* ── Inline warning bar ─────────────────────────── */}
      {flash && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: CES_TOKENS.redSoft, border: `1px solid ${CES_TOKENS.red}55` }}
        >
          <AlertOctagon size={16} style={{ color: CES_TOKENS.red }} />
          <div className="text-[12.5px] font-semibold" style={{ color: CES_TOKENS.red }}>
            Enforcement: {flash.text}
          </div>
        </div>
      )}

      {/* ── Board (6 columns, horizontal scroll) ───────── */}
      <div className="overflow-x-auto pb-3">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(6, minmax(280px, 1fr))', minWidth: 1700 }}>
          {COMPLIANCE_STATE_ORDER.map(state => {
            const tint = COLUMN_TINT[state];
            const isOver = overCol === state;
            const colUnits = units.filter(u => u.complianceState === state);
            return (
              <div
                key={state}
                onDragOver={e => handleDragOver(e, state)}
                onDrop={() => handleDrop(state)}
                className="rounded-xl flex flex-col"
                style={{
                  background: isOver ? CES_TOKENS.navySoft : tint.bg,
                  border:    `1px solid ${isOver ? CES_TOKENS.navy : tint.bd}`,
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
                    style={{ background: 'white', color: tint.hdfg, border: `1px solid ${tint.bd}` }}
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
                              onClick={() => setOpenUnit(u)}
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
                      style={{ color: CES_TOKENS.muted }}
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

      {/* ── Drawer ─────────────────────────────────────── */}
      {openUnit && (
        <WorkflowDrawer
          unit={openUnit}
          allUnits={units}
          onClose={() => setOpenUnit(null)}
          onUpdate={updated => {
            setUnits(curr => curr.map(u => u.id === updated.id ? updated : u));
            setOpenUnit(updated);
          }}
        />
      )}
    </div>
  );
}

/* ── SwimlaneHeader ─────────────────────────────────────── */
function SwimlaneHeader({ title, domain }: { title: string; domain: string }) {
  return (
    <div
      className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] px-1"
      style={{ color: CES_TOKENS.muted }}
    >
      <ChevronRight size={10} />
      <span className="truncate">{title}</span>
      <span
        className="ml-auto text-[9px] font-semibold px-1.5 rounded"
        style={{ background: CES_TOKENS.navySoft, color: CES_TOKENS.navy }}
      >
        {domain}
      </span>
    </div>
  );
}
