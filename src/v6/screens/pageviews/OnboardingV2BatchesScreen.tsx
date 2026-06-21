import { Layers, Calendar } from 'lucide-react';
import {
  MetricGrid,
  DataTable,
  SurfaceCard,
  ToneTag,
  type MetricTileData,
  type SurfaceCardData,
  type DataTableColumn,
} from '../../components';
import { Badge, ToneBadge } from '../../primitives';

interface BatchRow extends Record<string, string> {
  batchId: string;
  trigger: string;
  count: string;
  complete: string;
  status: string;
  created: string;
}

const metrics = [
  { label: 'Total Batches', value: '12', helper: 'Created since transition', tone: 'teal' },
  { label: 'Active Batches', value: '4', helper: 'Currently processing', tone: 'orange' },
  { label: 'Completed Batches', value: '8', helper: 'All subjects activated', tone: 'green' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<BatchRow>[] = [
  { key: 'batchId', label: 'Batch ID' },
  { key: 'trigger', label: 'Batch Trigger' },
  { key: 'count', label: 'Subjects count' },
  { key: 'complete', label: 'Completed gates' },
  { key: 'created', label: 'Created date' },
  { key: 'status', label: 'Batch State', status: true },
];

const rows: readonly BatchRow[] = [
  { batchId: 'BAT-001', trigger: 'June 2026 Cohort', count: '8', complete: '6/8', created: '2026-06-01', status: 'active' },
  { batchId: 'BAT-002', trigger: 'Therapy Core Roster', count: '5', complete: '5/5', created: '2026-06-05', status: 'complete' },
  { batchId: 'BAT-003', trigger: 'Rehire Reconciliation', count: '3', complete: '1/3', created: '2026-06-12', status: 'active' },
  { batchId: 'BAT-004', trigger: 'HHA Group 2', count: '10', complete: '0/10', created: '2026-06-18', status: 'pending' },
];

const statsCards = [
  {
    body: 'June Cohort batch shows high clearance velocity with Gate 1 background sweeps 100% complete.',
    icon: Layers,
    progress: 75,
    status: 'active',
    title: 'June Batch Stats',
    tone: 'teal',
  },
  {
    body: 'HHA Group 2 batch created on Jun 18 is pending primary source credential locks verification.',
    icon: Calendar,
    progress: 10,
    status: 'pending',
    title: 'HHA Batch Staging',
    tone: 'amber',
  },
] satisfies readonly SurfaceCardData[];

export function OnboardingV2BatchesScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-batches"
      data-route="/onboarding-v2/batches"
      data-template="matrix"
    >
      <section className="flex flex-wrap items-start justify-between gap-lg rounded-lg border border-card bg-surface p-lg shadow-rest">
        <div className="grid gap-sm">
          <div className="flex flex-wrap items-center gap-sm">
            <ToneTag>/onboarding-v2/batches</ToneTag>
            <ToneTag tone="slate">onboarding-v2-batches</ToneTag>
            <ToneTag tone="slate">matrix</ToneTag>
            <ToneTag tone="teal">Onboarding v2</ToneTag>
          </div>
          <div className="grid gap-xs">
            <h2 className="text-h2 font-medium text-ink">Activation Batches</h2>
            <p className="max-w-content text-sm text-secondary">
              Roster of generated activation batches, triggers, subject counts, and gate completions.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-sm">
          <ToneBadge size="sm" status="active" />
          <Badge variant="count">BAT-MATRIX</Badge>
        </div>
      </section>

      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Roster of Batches</h3>
                <p className="mt-xs text-sm text-muted">All active and historical batches.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Batches table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Batch status cards">
          <div className="grid gap-xs mb-sm">
            <h3 className="text-h3 font-medium text-ink">Batch Analytics</h3>
            <p className="text-sm text-muted">Overview of recent batch operations.</p>
          </div>
          {statsCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}
