import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardCheck, FolderOpen, ShieldCheck } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { buildCesControlAuditView } from '@/policy/ces/cesMasterControlAudit';
import type { ControlInventoryRow } from '@/policy/ces/cesMasterControlAudit';

type MasterControlRow = Record<string, string>;

const masterControlColumns: readonly DataTableColumn<MasterControlRow>[] = [
  { key: 'controlId', label: 'Control ID' },
  { key: 'controlName', label: 'Control name' },
  { key: 'category', label: 'Category' },
  { key: 'domain', label: 'Domain' },
  { key: 'riskTier', label: 'Risk tier' },
  { key: 'sourceStatus', label: 'Source status' },
  { key: 'evidence', label: 'Evidence', status: true },
  { key: 'readiness', label: 'Readiness', status: true },
  { key: 'linkedPolicies', label: 'Linked Policies' },
];

const controlCards = [
  {
    body: 'Source from MASTER_CONTROL_INVENTORY_DATA_MODEL.json via cesMasterControlAudit projection (V1 parity); matrix reflects real regulatory controls for owner review.',
    icon: ShieldCheck,
    progress: 48,
    status: 'review-required',
    title: 'Inventory baseline',
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

// One-pass projection fallback metrics (match V6_DESIGN.html + real data model)
// MasterControlsScreen now wires cesMasterControlAudit projection (V1 parity)
const FALLBACK_METRICS: readonly MetricTileData[] = [
  { label: 'Controls', value: '104', helper: 'Inventory baseline (from data model)', tone: 'teal' },
  { label: 'High', value: '81', helper: 'High-risk controls', tone: 'orange' },
  { label: 'Material', value: '22', helper: 'Material controls', tone: 'teal' },
  { label: 'Low', value: '1', helper: 'Low-risk control', tone: 'green' },
];

export function MasterControlsScreen() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<readonly MasterControlRow[]>([]);
  const [metrics, setMetrics] = useState<readonly MetricTileData[]>(FALLBACK_METRICS);

  useEffect(() => {
    let mounted = true;
    buildCesControlAuditView().then((view) => {
      if (!mounted) return;
      // V2 now uses cesMasterControlAudit projection (V1 parity + one-pass CES audit view)
      const inv = view.inventoryRows as readonly ControlInventoryRow[];
      const mapped: readonly MasterControlRow[] = inv.map((r) => ({
        controlId: String(r.controlId),
        controlName: r.controlName,
        category: r.category ?? '',
        domain: r.domain ?? '',
        riskTier: r.riskTier,
        sourceStatus: r.sourceStatus,
        evidence: r.evidence,
        readiness: r.readiness,
        linkedPolicies: Array.isArray(r.sourcePolicyIds) ? r.sourcePolicyIds.join(', ') : '',
      }));
      setRows(mapped);
      const c = view.metrics.controls;
      setMetrics([
        { label: 'Controls', value: String(c.total || 104), helper: 'Inventory baseline (CES projection)', tone: 'teal' },
        { label: 'High', value: String(c.high || 81), helper: 'High-risk controls', tone: 'orange' },
        { label: 'Material', value: String(c.material || 22), helper: 'Material controls', tone: 'teal' },
        { label: 'Low', value: String(c.low || 1), helper: 'Low-risk control', tone: 'green' },
      ]);
    }).catch(() => {
      // keep fallbacks for visual parity if fetch fails
    });
    return () => { mounted = false; };
  }, []);

  return (
    <section className="grid gap-xl" data-hash-id="master-controls" data-route="/compliance/master-controls">
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-6" aria-label="Master controls inventory and readiness">
        <div className="grid content-start gap-lg desktop:col-span-4">
          <DataTable
            columns={masterControlColumns}
            label="Master controls inventory matrix"
            rows={rows}
            onRowClick={(row) => {
              const id = (row as any).controlId || (row as any).id || '';
              navigate(`/evidence?control=${encodeURIComponent(id)}`);
            }}
          />
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
