import { ClipboardCheck, FolderOpen, ShieldCheck } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';

type MasterControlRow = Record<string, string>;

const masterControlMetrics = [
  { label: 'Controls', value: '104', helper: 'Inventory baseline', tone: 'teal' },
  { label: 'High', value: '81', helper: 'High-risk controls', tone: 'orange' },
  { label: 'Material', value: '22', helper: 'Material controls', tone: 'teal' },
  { label: 'Low', value: '1', helper: 'Low-risk control', tone: 'green' },
] satisfies readonly MetricTileData[];

const masterControlRows: readonly MasterControlRow[] = [
  {
    controlId: 'MC-AH-001',
    controlName: 'After-hours on-call coverage',
    evidence: 'missing-evidence',
    readiness: 'review-required',
    riskTier: 'High',
    sourceStatus: 'UNKNOWN',
  },
  {
    controlId: 'MC-OA-014',
    controlName: 'OASIS QA and transmission control',
    evidence: 'uploaded',
    readiness: 'ready',
    riskTier: 'High',
    sourceStatus: 'UNKNOWN',
  },
  {
    controlId: 'MC-PO-022',
    controlName: 'Physician orders signature control',
    evidence: 'pending',
    readiness: 'awaiting',
    riskTier: 'High',
    sourceStatus: 'UNKNOWN',
  },
  {
    controlId: 'MC-IP-040',
    controlName: 'Infection prevention surveillance',
    evidence: 'validated',
    readiness: 'certified',
    riskTier: 'High',
    sourceStatus: 'UNKNOWN',
  },
  {
    controlId: 'MC-EP-057',
    controlName: 'Emergency preparedness annual review',
    evidence: 'uploaded',
    readiness: 'ready',
    riskTier: 'Material',
    sourceStatus: 'UNKNOWN',
  },
  {
    controlId: 'MC-OS-063',
    controlName: 'OSHA logs and workplace violence control',
    evidence: 'review-required',
    readiness: 'attention',
    riskTier: 'Material',
    sourceStatus: 'UNKNOWN',
  },
  {
    controlId: 'MC-AD-104',
    controlName: 'Administrative posting and notice inventory',
    evidence: 'complete',
    readiness: 'ready',
    riskTier: 'Low',
    sourceStatus: 'UNKNOWN',
  },
];

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

export function MasterControlsScreen() {
  return (
    <section className="grid gap-xl" data-hash-id="master-controls" data-route="/compliance/master-controls">
      <MetricGrid metrics={masterControlMetrics} />

      <section className="grid gap-xl desktop:grid-cols-6" aria-label="Master controls inventory and readiness">
        <div className="grid content-start gap-lg desktop:col-span-4">
          <DataTable columns={masterControlColumns} label="Master controls inventory matrix" rows={masterControlRows} />
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
