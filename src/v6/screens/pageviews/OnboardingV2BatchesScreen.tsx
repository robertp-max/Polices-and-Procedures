import { Layers, Calendar } from 'lucide-react';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';

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
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-batches"
      data-route="/onboarding-v2/batches"
      data-template="matrix"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-lg desktop:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="grid content-start gap-md">
          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <div className="mb-md flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Roster of Batches</h3>
                <p className="mt-xs text-sm text-muted">All active and historical batches.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Batches table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-md" aria-label="Batch status cards">
          <div className="mb-xs grid gap-xs">
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
