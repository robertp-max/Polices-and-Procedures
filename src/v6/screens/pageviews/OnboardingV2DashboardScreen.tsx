import { Link } from 'react-router-dom';
import { ArrowRight, ClipboardList, ShieldCheck, UserCheck, Users, AlertTriangle, FolderSync } from 'lucide-react';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';
import { Badge } from '../../primitives';
import { buildSeedSnapshot } from '@/policy/onboarding-v2/store/seed';
import type { Vendor, WorkforceMember } from '@/policy/onboarding-v2';

interface QueueRow extends Record<string, string> {
  id: string;
  name: string;
  role: string;
  trigger: string;
  status: string;
  date: string;
}

const snap = buildSeedSnapshot();
const subjectById = new Map<string, Vendor | WorkforceMember>();
snap.workforce.forEach((subject) => subjectById.set(subject.id, subject));
snap.vendors.forEach((subject) => subjectById.set(subject.id, subject));

const realBatchCount = snap.batches.length;
const blockedCount = snap.units.filter((unit) => unit.status === 'Blocked').length;
const awaitingSigCount = snap.signatures.filter((signature) => signature.status === 'Sent' || signature.status === 'Requested').length;
const completedUnits = snap.units.filter((unit) => unit.status === 'Completed').length;
const totalUnits = snap.units.length || 1;
const clearanceRate = Math.round((completedUnits / totalUnits) * 100);
const metrics = [
  { label: 'Total activations', value: String(realBatchCount), helper: 'Active and queued subjects (from seed)', tone: 'teal' },
  { label: 'Clearance rate', value: `${clearanceRate}%`, helper: 'Gate passage from live units', tone: 'green' },
  { label: 'Awaiting signature', value: String(awaitingSigCount), helper: 'Dual override or DON locks (from seed)', tone: 'amber' },
  { label: 'Blocked activations', value: String(blockedCount), helper: 'Requires immediate intervention (from seed)', tone: 'orange' },
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

// Real queue rows derived from batches + subject seed (no placeholder subjects)
const queueRows: readonly QueueRow[] = snap.batches.map((batch) => {
  const subject = subjectById.get(batch.subjectId);
  const role = subject && 'primaryRoleId' in subject ? subject.primaryRoleId : subject?.vendorType ?? '—';
  const statusRaw = batch.status.toLowerCase();
  const uiStatus = statusRaw.includes('complete') ? 'complete' :
                   statusRaw.includes('block') ? 'blocked' :
                   statusRaw.includes('await') ? 'review-required' : 'active';
  return {
    id: subject?.id ?? batch.subjectId,
    name: subject?.legalName ?? batch.subjectId,
    role,
    trigger: batch.triggerType,
    date: batch.createdAt.slice(0, 10),
    status: uiStatus,
  };
});

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
      className="grid gap-lg"
      data-group="Onboarding v2"
      data-hash-id="onboarding-v2-dashboard"
      data-route="/onboarding-v2/dashboard"
      data-template="dashboard"
    >
      <MetricGrid metrics={metrics} />

      <section className="rounded-lg border border-card bg-surface-glass p-lg shadow-rest shadow-glass-inset backdrop-blur-md">
        <div className="flex flex-col gap-md desktop:flex-row desktop:items-center desktop:justify-between">
          <div className="flex items-start gap-md">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-tone-teal-bg text-brand-teal">
              <ClipboardList className="h-icon-sm w-icon-sm" aria-hidden />
            </span>
            <div>
              <h3 className="text-h3 font-medium text-ink">Appendix F Clearance</h3>
              <p className="mt-xs max-w-2xl text-sm text-muted">
                Open the required onboarding checklist, HR Director signature gate, and personnel-file clearance record.
              </p>
            </div>
          </div>
          <Link
            to="/journey/appendix-f"
            className="inline-flex min-h-tap items-center justify-center gap-sm rounded-md border border-brand-teal bg-brand-teal px-md text-sm font-medium text-on-brand transition hover:bg-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus"
          >
            Open Appendix F
            <ArrowRight className="h-icon-sm w-icon-sm" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="grid gap-lg desktop:grid-cols-1">
        <div className="grid content-start gap-md">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg overflow-hidden shadow-rest">
            <div className="mb-md flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Active Activation Queue</h3>
                <p className="mt-xs text-sm text-muted">Subjects currently in the activation process.</p>
              </div>
              <Badge variant="count">5 Subjects</Badge>
            </div>
            <DataTable columns={queueColumns} label="Activation queue" rows={queueRows} />
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
