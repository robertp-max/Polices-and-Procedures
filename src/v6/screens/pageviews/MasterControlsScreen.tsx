import { AlertTriangle, ClipboardCheck, FileCheck2, FolderOpen, ShieldCheck } from 'lucide-react';
import { DataTable, MetricGrid, SurfaceCard, type DataTableColumn, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';

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

const readinessPanels = [
  {
    detail: 'Controls feed workflow swimlanes that create evidence and packet-lock checkpoints.',
    label: 'Workflow linkage',
    status: 'ready',
  },
  {
    detail: 'High-risk controls stay elevated until owner evidence is uploaded, validated, and retained.',
    label: 'Owner readiness',
    status: 'attention',
  },
  {
    detail: 'Evidence Center and Audit Mode consume these rows for survey packet review.',
    label: 'Audit handoff',
    status: 'validated',
  },
] as const;

export function MasterControlsScreen() {
  return (
    <section className="grid gap-xl" data-hash-id="master-controls" data-route="/compliance/master-controls">
      <MetricGrid metrics={masterControlMetrics} />

      <section className="grid gap-xl desktop:grid-cols-5" aria-label="Master controls inventory and readiness">
        <div className="grid content-start gap-lg desktop:col-span-3">
          <DataTable columns={masterControlColumns} label="Master controls inventory matrix" rows={masterControlRows} />

          <section className="grid gap-md tablet-l:grid-cols-3" aria-label="Readiness status summary">
            {readinessPanels.map((panel) => (
              <article className="rounded-lg border border-card bg-tone-slate-bg p-lg" key={panel.label}>
                <div className="mb-md flex flex-wrap items-center justify-between gap-sm">
                  <h3 className="text-body font-light text-ink">{panel.label}</h3>
                  <ToneBadge size="sm" status={panel.status} />
                </div>
                <p className="text-sm text-muted">{panel.detail}</p>
              </article>
            ))}
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-2" aria-label="Master controls context cards">
          {controlCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex items-start gap-md">
              <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-orange-bg text-tone-orange-text">
                <AlertTriangle aria-hidden="true" className="h-icon-md w-icon-md" />
              </span>
              <div>
                <h2 className="text-h2 font-medium text-ink">Risk baseline</h2>
                <p className="mt-xs text-sm text-muted">81 high, 22 material, and 1 low-risk control remain visible for CES review.</p>
              </div>
            </div>
            <div className="grid gap-sm">
              {[
                ['High-risk focus', 'After-hours, OASIS, physician orders, infection prevention'],
                ['Material focus', 'Emergency preparedness and OSHA controls'],
                ['Evidence path', 'Controls to workflows to swimlanes to audit packet'],
              ].map(([label, value]) => (
                <div className="flex flex-wrap items-center justify-between gap-sm rounded-md bg-tone-slate-bg p-md" key={label}>
                  <span className="text-tag uppercase tracking-tag text-secondary">{label}</span>
                  <span className="text-sm text-ink">{value}</span>
                </div>
              ))}
            </div>
          </section>
          <SurfaceCard
            card={{
              body: 'Control posture rolls into CES reports after evidence is retained and the swimlane packet is locked.',
              icon: FileCheck2,
              progress: 82,
              status: 'ready',
              title: 'Report posture',
              tone: 'teal',
            }}
          />
        </aside>
      </section>
    </section>
  );
}

export default MasterControlsScreen;
