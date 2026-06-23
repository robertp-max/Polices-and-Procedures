import { BarChart3, Clock, Milestone } from 'lucide-react';
import { MetricGrid, DataTable, SurfaceCard, type MetricTileData, type SurfaceCardData, type DataTableColumn } from '../../components';

interface ProjectRow extends Record<string, string> {
  project: string;
  tasks: string;
  critical: string;
  high: string;
  source: string;
  status: string;
}

const projectRows = [
  { project: 'Reg. Calendar', tasks: '89', critical: '56', high: '20', source: 'Local task catalogue', status: 'validated' },
  { project: 'CMS-485', tasks: '22', critical: '21', high: '0', source: 'Local task catalogue', status: 'pending' },
  { project: 'OASIS', tasks: '20', critical: '10', high: '8', source: 'Local task catalogue', status: 'pending' },
  { project: 'QAPI', tasks: '25', critical: '19', high: '6', source: 'Local task catalogue', status: 'pending' },
  { project: 'Versions', tasks: '33', critical: '3', high: '7', source: 'Local task catalogue', status: 'pending' },
] satisfies readonly ProjectRow[];

const totalTasks = 189;
const datedTasks = 125;
const projectCount = projectRows.length;
const liveProjectCount = projectRows.filter((project) => project.status === 'validated').length;
const reviewTaskCount = 150;

const metrics = [
  { label: 'Catalogue tasks', value: String(totalTasks), helper: 'Client-side Hubstaff task records', tone: 'teal' },
  { label: 'Dated tasks', value: String(datedTasks), helper: 'Records with target dates', tone: 'green' },
  { label: 'Projects listed', value: String(projectCount), helper: 'Configured staging buckets', tone: 'slate' },
  { label: 'Needs review', value: String(reviewTaskCount), helper: 'Critical or high risk records', tone: 'orange' },
] satisfies readonly MetricTileData[];

const columns: readonly DataTableColumn<ProjectRow>[] = [
  { key: 'project', label: 'Project' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High' },
  { key: 'source', label: 'Source' },
  { key: 'status', label: 'State', status: true },
];

const rows: readonly ProjectRow[] = projectRows;
const riskSummary = 'critical: 109 / high: 41 / medium: 31 / low: 8';

const cards = [
  {
    body: `One project has a saved external ID; the remaining ${projectCount - liveProjectCount} are staged for owner verification before any push job runs.`,
    icon: Clock,
    progress: Math.round((liveProjectCount / projectCount) * 100),
    status: 'review-required',
    title: 'Live sync not wired',
    tone: 'orange',
  },
  {
    body: `Risk mix from the local task catalogue: ${riskSummary}. These counts are reference data, not a live time-tracking feed.`,
    icon: Milestone,
    progress: Math.round((reviewTaskCount / totalTasks) * 100),
    status: 'info',
    title: 'Catalogue risk profile',
    tone: 'teal',
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
      <div className="rounded-lg border border-tone-amber-border bg-tone-amber-bg p-lg text-tone-amber-text shadow-rest">
        <div className="flex flex-wrap items-start justify-between gap-md">
          <div className="grid gap-xs">
            <p className="text-tag font-medium uppercase tracking-tag">Static reference mode</p>
            <h2 className="text-h2 font-medium text-ink">Hubstaff staging catalogue</h2>
            <p className="max-w-3xl text-sm font-light leading-sm">
              This V6 page reads the local task catalogue used by Hubstaff push tooling. It does not call the Hubstaff API,
              does not confirm live time entries, and does not represent active GPS or mileage synchronization.
            </p>
          </div>
          <span className="rounded-sm border border-tone-amber-border bg-surface px-sm py-xs text-tag font-medium uppercase tracking-tag text-tone-amber-text">
            Demo / reference
          </span>
        </div>
      </div>

      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="mb-lg flex flex-wrap items-start justify-between gap-md">
              <div>
                <h3 className="text-h3 font-medium text-ink">Hubstaff project staging</h3>
                <p className="mt-xs text-sm text-muted">
                  Counts are derived from <span className="font-medium text-brand-teal">src/policy/data/hubstaffTasks.ts</span>.
                </p>
              </div>
            </div>
            <DataTable columns={columns} label="Hubstaff staging project table" rows={rows} />
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Hubstaff staging notes">
          <div className="mb-sm grid gap-xs">
            <h3 className="flex items-center gap-sm text-h3 font-medium text-ink">
              <BarChart3 aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Integration Readiness
            </h3>
            <p className="text-sm text-muted">Client-side view of staged task records and owner-review needs.</p>
          </div>
          {cards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}
