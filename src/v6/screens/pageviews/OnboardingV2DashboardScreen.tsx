import { ShieldCheck, UserCheck, Users, AlertTriangle, FolderSync } from 'lucide-react';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';
import { Badge } from '../../primitives';

interface QueueRow extends Record<string, string> {
  id: string;
  name: string;
  role: string;
  trigger: string;
  status: string;
  date: string;
}

const metrics = [
  { label: 'Total activations', value: '47', helper: 'Active and queued subjects', tone: 'teal' },
  { label: 'Clearance rate', value: '78%', helper: 'Overall gate passage rate', tone: 'green' },
  { label: 'Awaiting signature', value: '6', helper: 'Dual override or DON locks', tone: 'amber' },
  { label: 'Blocked activations', value: '2', helper: 'Requires immediate intervention', tone: 'orange' },
  { label: 'SLA violations', value: '0', helper: 'Within standard processing time', tone: 'teal' },
] satisfies readonly MetricTileData[];

const queueColumns: readonly DataTableColumn<QueueRow>[] = [
  { key: 'id', label: 'Subject ID' },
  { key: 'name', label: 'Subject Name' },
  { key: 'role', label: 'Assigned Role' },
  { key: 'trigger', label: 'Activation Trigger' },
  { key: 'date', label: 'Trigger Date' },
  { key: 'status', label: 'Clearance State', status: true },
];

const queueRows: readonly QueueRow[] = [
  { id: 'SUB-2001', name: 'James Carter', role: 'RN Case Manager', trigger: 'Offer Signed', date: '2026-06-20', status: 'active' },
  { id: 'SUB-2002', name: 'Sophia Martinez', role: 'Home Health Aide', trigger: 'Credential Update', date: '2026-06-20', status: 'ready' },
  { id: 'SUB-2003', name: 'Liam O\'Connor', role: 'Physical Therapist', trigger: 'Reconciliation Hold', date: '2026-06-19', status: 'review-required' },
  { id: 'SUB-2004', name: 'Emma Watson', role: 'Occupational Therapist', trigger: 'Rehire Review', date: '2026-06-18', status: 'signed' },
  { id: 'SUB-2005', name: 'Noah Miller', role: 'RN Case Manager', trigger: 'System Transition', date: '2026-06-17', status: 'blocked' },
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
  return (
    <section
      className="grid gap-xl"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-dashboard"
      data-route="/onboarding-v2/dashboard"
      data-template="dashboard"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Active Activation Queue</h3>
                <p className="mt-xs text-sm text-muted">Subjects currently in the activation process.</p>
              </div>
              <Badge variant="count">5 Subjects</Badge>
            </div>
            <DataTable columns={queueColumns} label="Activation queue" rows={queueRows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Gate clearance cards">
          <div className="grid gap-xs mb-sm">
            <h3 className="text-h3 font-medium text-ink">Clearance Gates Status</h3>
            <p className="text-sm text-muted">Activation tracking across five compliance gates.</p>
          </div>
          {gateCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}
