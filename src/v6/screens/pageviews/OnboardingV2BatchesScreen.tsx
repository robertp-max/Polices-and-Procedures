import { Layers, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';
import { buildSeedSnapshot } from '@/policy/onboarding-v2/store/seed';
import type { OnboardingExecutionBatch } from '@/policy/onboarding-v2';

interface BatchRow extends Record<string, string> {
  batchId: string;
  trigger: string;
  count: string;
  complete: string;
  status: string;
  created: string;
}

const snap = buildSeedSnapshot();
const totalB = snap.batches.length;
const activeB = snap.batches.filter((b: any) => !String(b.status||'').toLowerCase().includes('complete')).length;
const doneB = totalB - activeB;
const metrics = [
  { label: 'Total Batches', value: String(totalB), helper: 'Created since transition (from seed)', tone: 'teal' },
  { label: 'Active Batches', value: String(activeB), helper: 'Currently processing', tone: 'orange' },
  { label: 'Completed Batches', value: String(doneB), helper: 'All subjects activated', tone: 'green' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<BatchRow>[] = [
  { key: 'batchId', label: 'Batch ID' },
  { key: 'trigger', label: 'Batch Trigger' },
  { key: 'count', label: 'Subjects count' },
  { key: 'complete', label: 'Completed gates' },
  { key: 'created', label: 'Created date' },
  { key: 'status', label: 'Batch State', status: true },
];

// Real onboarding batch records from seed/store snapshot (buildSeedSnapshot).
// This wires the preserved logic per V6 plan (transitive from v6 screen import; no tsconfig.app change).
function mapBatchToRow(b: OnboardingExecutionBatch): BatchRow {
  const triggerType = (b.triggerType as string) || (b.triggerPayload && (b.triggerPayload as any).type) || '—';
  const units = snap.units.filter((u: any) => u.batchId === b.id);
  const completedCount = units.filter((u: any) => u.status === 'Completed').length;
  const total = units.length || 1;
  const statusRaw = (b.status || 'InProgress').toLowerCase();
  const uiStatus = statusRaw === 'inprogress' ? 'active' :
                   statusRaw === 'awaitingsignature' || statusRaw === 'awaitingevidence' ? 'review-required' :
                   statusRaw === 'completed' ? 'complete' :
                   statusRaw === 'blocked' ? 'blocked' : statusRaw;
  return {
    batchId: b.id,
    trigger: triggerType,
    count: String(total),
    complete: `${completedCount}/${total}`,
    created: (b.createdAt || '').slice(0, 10),
    status: uiStatus,
  };
}
const rows: readonly BatchRow[] = snap.batches.map(mapBatchToRow);

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
  const navigate = useNavigate();
  const handleRowClick = (row: BatchRow) => {
    const id = row.batchId;
    if (id) navigate(`/onboarding-v2/batches/${encodeURIComponent(id)}`);
  };
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
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg shadow-rest">
            <div className="mb-md flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Roster of Batches</h3>
                <p className="mt-xs text-sm text-muted">All active and historical batches.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Batches table" rows={rows} onRowClick={handleRowClick} />
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
