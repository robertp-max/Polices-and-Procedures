import { useEffect, useState } from 'react';
import { ClipboardCheck, FolderOpen, ShieldCheck } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { buildCesControlAuditView, FALLBACK_CONTROL_INVENTORY_ROWS, type ControlInventoryRow as _ControlInventoryRow } from '@/policy/ces/cesMasterControlAudit';

type MasterControlRow = Record<string, string>;

const masterControlColumns: readonly DataTableColumn<MasterControlRow>[] = [
  { key: 'controlId', label: 'Control ID' },
  { key: 'controlName', label: 'Control name' },
  { key: 'riskTier', label: 'Risk tier' },
  { key: 'sourceStatus', label: 'Source status' },
  { key: 'evidence', label: 'Evidence', status: true },
  { key: 'readiness', label: 'Readiness', status: true },
];

const controlCards = [
  {
    body: 'Source status is UNKNOWN in the inventory baseline; the matrix highlights high-risk operating examples for owner review.',
    icon: ShieldCheck,
    progress: 48,
    status: 'review-required',
    title: 'Synthetic overlay',
    tone: 'orange',
  },
  {
    body: 'Locked artifacts carry source policy, owner, timestamp, hash, and retention window before audit packet release.',
    icon: FolderOpen,
    progress: 88,
    status: 'validated',
    title: 'Evidence retention',
    tone: 'teal',
  },
  {
    body: 'After-hours, OASIS, orders, infection prevention, emergency prep, and OSHA controls are visible in one matrix.',
    icon: ClipboardCheck,
    progress: 74,
    status: 'ready',
    title: 'Control domains',
    tone: 'teal',
  },
] satisfies readonly SurfaceCardData[];

// One-pass projection fallback metrics (match V6_DESIGN.html)
const FALLBACK_METRICS: readonly MetricTileData[] = [
  { label: 'Controls', value: '104', helper: 'Inventory baseline', tone: 'teal' },
  { label: 'High', value: '81', helper: 'High-risk controls', tone: 'orange' },
  { label: 'Material', value: '22', helper: 'Material controls', tone: 'teal' },
  { label: 'Low', value: '1', helper: 'Low-risk control', tone: 'green' },
];

export function MasterControlsScreen() {
  const [rows, setRows] = useState<readonly MasterControlRow[]>(FALLBACK_CONTROL_INVENTORY_ROWS as unknown as readonly MasterControlRow[]);
  const [metrics, setMetrics] = useState<readonly MetricTileData[]>(FALLBACK_METRICS);

  useEffect(() => {
    let mounted = true;
    buildCesControlAuditView().then((view) => {
      if (!mounted) return;
      const mapped: readonly MasterControlRow[] = view.inventoryRows.map(r => ({
        controlId: r.controlId,
        controlName: r.controlName,
        riskTier: r.riskTier,
        sourceStatus: r.sourceStatus,
        evidence: r.evidence,
        readiness: r.readiness,
      }));
      setRows(mapped);
      setMetrics([
        { label: 'Controls', value: String(view.metrics.controls.total), helper: 'Inventory baseline', tone: 'teal' },
        { label: 'High', value: String(view.metrics.controls.high), helper: 'High-risk controls', tone: 'orange' },
        { label: 'Material', value: String(view.metrics.controls.material), helper: 'Material controls', tone: 'teal' },
        { label: 'Low', value: String(view.metrics.controls.low), helper: 'Low-risk control', tone: 'green' },
      ]);
    }).catch(() => {
      // keep fallbacks for visual parity
    });
    return () => { mounted = false; };
  }, []);

  return (
    <section className="grid gap-xl" data-hash-id="master-controls" data-route="/compliance/master-controls">
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-6" aria-label="Master controls inventory and readiness">
        <div className="grid content-start gap-lg desktop:col-span-4">
          <DataTable columns={masterControlColumns} label="Master controls inventory matrix" rows={rows} />
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-2" aria-label="Master controls context cards">
          {controlCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}

export default MasterControlsScreen;
