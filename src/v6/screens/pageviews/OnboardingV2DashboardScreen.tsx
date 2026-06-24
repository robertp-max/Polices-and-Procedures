import { ShieldCheck, UserCheck, Users, AlertTriangle, FolderSync } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';
import { Badge } from '../../primitives';
import { useOnboardingV2Store } from '@/policy/onboarding-v2';
import type { WorkforceMember } from '@/policy/onboarding-v2';

interface QueueRow extends Record<string, string> {
  id: string;
  name: string;
  role: string;
  trigger: string;
  status: string;
  date: string;
  batchId: string;
}

const queueColumns: readonly DataTableColumn<QueueRow>[] = [
  { key: 'id', label: 'Subject ID' },
  { key: 'name', label: 'Subject Name' },
  { key: 'role', label: 'Assigned Role' },
  { key: 'trigger', label: 'Activation Trigger' },
  { key: 'date', label: 'Trigger Date' },
  { key: 'status', label: 'Clearance State', status: true },
];

const gateCards = [
  {
    body: 'HR and background clearance is validated via real-time integration hashes.',
    icon: ShieldCheck,
    progress: 100,
    status: 'validated',
    title: 'Gate 1: Background & Screening',
    tone: 'green',
  },
  {
    body: 'Professional licensure checks are pending clinical director verification.',
    icon: UserCheck,
    progress: 85,
    status: 'pending',
    title: 'Gate 2: Credentials & License',
    tone: 'amber',
  },
  {
    body: 'Exposure controls and required health screenings require subject upload.',
    icon: AlertTriangle,
    progress: 60,
    status: 'review-required',
    title: 'Gate 3: Health & Safety',
    tone: 'orange',
  },
  {
    body: 'Core orientation modules and system navigation setup are complete.',
    icon: Users,
    progress: 100,
    status: 'complete',
    title: 'Gate 4: Orientation Training',
    tone: 'teal',
  },
  {
    body: 'Final preceptor supervision visit is locked until Gate 2 resolves.',
    icon: FolderSync,
    progress: 0,
    status: 'locked',
    title: 'Gate 5: Supervised Visit',
    tone: 'slate',
  },
] satisfies readonly SurfaceCardData[];

export function OnboardingV2DashboardScreen() {
  const navigate = useNavigate();
  const snap = useOnboardingV2Store(s => s.snap);
  const workforceById = new Map(snap.workforce.map((w: WorkforceMember) => [w.id, w]));

  const realBatchCount = snap.batches.length;
  const blockedCount = snap.units.filter((u: any) => u.status === 'Blocked').length;
  const awaitingSigCount = snap.signatures.filter((s: any) => s.status === 'Sent' || s.status === 'Requested').length;
  const completedUnits = snap.units.filter((u: any) => u.status === 'Completed').length;
  const totalUnits = snap.units.length || 1;
  const clearanceRate = Math.round((completedUnits / totalUnits) * 100);
  const metrics = [
    { label: 'Total activations', value: String(realBatchCount), helper: 'Active and queued subjects (from seed)', tone: 'teal' },
    { label: 'Clearance rate', value: `${clearanceRate}%`, helper: 'Gate passage from live units', tone: 'green' },
    { label: 'Awaiting signature', value: String(awaitingSigCount), helper: 'Dual override or DON locks (from seed)', tone: 'amber' },
    { label: 'Blocked activations', value: String(blockedCount), helper: 'Requires immediate intervention (from seed)', tone: 'orange' },
    { label: 'SLA violations', value: '0', helper: 'Within standard processing time', tone: 'teal' },
  ] satisfies readonly MetricTileData[];

  // Real queue rows derived from batches + workforce seed (no placeholder subjects)
  const queueRows: readonly QueueRow[] = snap.batches.map((b: any) => {
    const subj = workforceById.get(b.subjectId) || { id: b.subjectId, legalName: b.subjectId, primaryRoleId: '—' } as any;
    const statusRaw = (b.status || 'InProgress').toLowerCase();
    const uiStatus = statusRaw.includes('complete') ? 'complete' :
                     statusRaw.includes('block') ? 'blocked' :
                     statusRaw.includes('await') ? 'review-required' : 'active';
    return {
      id: subj.id,
      name: subj.legalName || subj.id,
      role: subj.primaryRoleId || '—',
      trigger: (b.triggerType as string) || 'NEW_HIRE',
      date: (b.createdAt || '').slice(0, 10),
      status: uiStatus,
      batchId: b.id,
    };
  });

  const handleQueueRowClick = (row: QueueRow) => {
    if (row.batchId) {
      navigate(`/onboarding-v2/batches/${encodeURIComponent(row.batchId)}`);
    }
  };
  return (
    <section
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-dashboard"
      data-route="/onboarding-v2/dashboard"
      data-template="dashboard"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-lg desktop:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <div className="grid content-start gap-md">
          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <div className="mb-md flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Active Activation Queue</h3>
                <p className="mt-xs text-sm text-muted">Subjects currently in the activation process. Click row to open batch detail.</p>
              </div>
              <Badge variant="count">5 Subjects</Badge>
            </div>
            <DataTable columns={queueColumns} label="Activation queue" rows={queueRows} onRowClick={handleQueueRowClick} />
          </section>
        </div>

        <aside className="grid content-start gap-md" aria-label="Gate clearance cards">
          <div className="mb-xs grid gap-xs">
            <h3 className="text-h3 font-medium text-ink">Clearance Gates Status</h3>
            <p className="text-sm text-muted">Activation tracking across five compliance gates.</p>
          </div>
          <div className="grid gap-md tablet-p:grid-cols-2 desktop:grid-cols-1 large:grid-cols-2">
            {gateCards.map((card) => (
              <SurfaceCard card={card} key={card.title} />
            ))}
          </div>
        </aside>
      </section>
    </section>
  );
}
