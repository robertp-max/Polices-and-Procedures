import { BarChart3, Clock, Milestone } from 'lucide-react';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';
import { ALL_TASKS } from '@/policy/data/hubstaffTasks';

interface LogRow extends Record<string, string> {
  logId: string;
  clinician: string;
  timeLogged: string;
  mileage: string;
  timeliness: string;
  status: string;
}

const totalTasks = ALL_TASKS.length;
const scheduledTasks = ALL_TASKS.filter((task) => Boolean(task.dueDate)).length;
const unscheduledTasks = totalTasks - scheduledTasks;
const scheduledRate = totalTasks > 0 ? Math.round((scheduledTasks / totalTasks) * 100) : 0;

const metrics = [
  { label: 'Visits tracked', value: String(totalTasks), helper: 'Total tracked visits this period', tone: 'teal' },
  { label: 'Timeliness rate', value: `${scheduledRate}%`, helper: 'Visit notes entered within 48h', tone: 'green' },
  { label: 'Mileage logged', value: '—', helper: 'Total travel distance logged', tone: 'teal' },
  { label: 'Unverified logs', value: String(unscheduledTasks), helper: 'Awaiting coordinator review', tone: 'orange' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<LogRow>[] = [
  { key: 'logId', label: 'Log ID' },
  { key: 'clinician', label: 'Clinician' },
  { key: 'timeLogged', label: 'Time Tracked' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'timeliness', label: 'Timeliness' },
  { key: 'status', label: 'State', status: true },
];

const rows: readonly LogRow[] = ALL_TASKS.map((task) => ({
  logId: task.id,
  clinician: task.title,
  timeLogged: '—',
  mileage: '—',
  timeliness: task.dueDate ? `Due ${task.dueDate}` : '—',
  status: task.risk ?? '—',
}));

const cards = [
  {
    body: 'Clinician documentation entry times are automatically cross-checked against GPS-proven visit locks.',
    icon: Clock,
    progress: 95,
    status: 'active',
    title: 'Timeliness Guard',
    tone: 'teal',
  },
  {
    body: 'Four travel records contain mileage anomalies that deviate from map routing by more than 15%.',
    icon: Milestone,
    progress: 60,
    status: 'review-required',
    title: 'Mileage Audit Watch',
    tone: 'orange',
  },
] satisfies readonly SurfaceCardData[];

export function HubstaffScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="hubstaff"
      data-route="/hubstaff"
      data-template="reports"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">GPS & Shift Sync logs</h3>
                <p className="mt-xs text-sm text-muted">Daily sync logs for active clinician field routes.</p>
              </div>
            </div>
            <DataTable columns={columns} label="Hubstaff sync logs table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Integration anomalies">
          <div className="grid gap-xs mb-sm">
            <h3 className="text-h3 font-medium text-ink flex items-center gap-sm">
              <BarChart3 aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Sync Anomalies
            </h3>
            <p className="text-sm text-muted">Automatically flagged travel or documentation delay issues.</p>
          </div>
          {cards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}
