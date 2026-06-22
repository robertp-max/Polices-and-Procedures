import { BookOpen, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { MetricGrid, SurfaceCard, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';

const metrics = [
  { label: 'Total policies', value: '279', helper: 'Active and archived corpus', tone: 'teal' },
  { label: 'In Draft', value: '14', helper: 'Authoring or editing phase', tone: 'orange' },
  { label: 'In Review', value: '8', helper: 'Committee review queue', tone: 'amber' },
  { label: 'Approved', value: '252', helper: 'Sealed regulatory consensus', tone: 'green' },
  { label: 'Archived', value: '5', helper: 'Historical records retained', tone: 'slate' },
] satisfies readonly MetricTileData[];

const stages = [
  { label: 'Draft', count: 14, status: 'active', tone: 'orange' },
  { label: 'Review', count: 8, status: 'pending', tone: 'amber' },
  { label: 'Approved', count: 252, status: 'validated', tone: 'green' },
  { label: 'Published', count: 247, status: 'complete', tone: 'teal' },
  { label: 'Archived', count: 5, status: 'locked', tone: 'slate' },
] as const;

const actionCards = [
  {
    body: 'Three policies require annual review and signatures before the upcoming ACHC audit cycle.',
    icon: AlertTriangle,
    progress: 80,
    status: 'review-required',
    title: 'Audit Warning',
    tone: 'orange',
  },
  {
    body: 'Policy ADM-HR-004 is currently in the review stage. DON signature is pending.',
    icon: FileText,
    progress: 50,
    status: 'pending',
    title: 'Pending DON Review',
    tone: 'amber',
  },
] satisfies readonly SurfaceCardData[];

export function PolicyLifecycleScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="policy-lifecycle"
      data-route="/policy-lifecycle"
      data-template="lifecycle"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-lg">Horizontal Stage Board</h3>
            <div className="flex flex-wrap gap-md items-center justify-between">
              {stages.map((stage, index) => (
                <div className="flex items-center gap-md" key={stage.label}>
                  <div className="rounded-lg border border-card bg-tone-slate-bg p-lg min-w-[120px] text-center shadow-rest flex flex-col items-center gap-xs">
                    <span className="text-tag uppercase tracking-tag text-muted">{stage.label}</span>
                    <span className="text-h2 font-medium text-ink mt-sm">{stage.count}</span>
                    <ToneBadge size="sm" status={stage.status} />
                  </div>
                  {index < stages.length - 1 && (
                    <ArrowRight aria-hidden="true" className="h-icon-sm w-icon-sm text-muted shrink-0 hidden tablet-p:block" />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface p-lg shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md">Active Policies Checklist</h3>
            <p className="text-sm text-secondary">
              Virtualization handles the ~279 active policy lifecycle rows. Use search or filter to target specific codes.
            </p>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Action items">
          <div className="grid gap-xs mb-sm">
            <h3 className="text-h3 font-medium text-ink flex items-center gap-sm">
              <BookOpen aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Required Action Items
            </h3>
            <p className="text-sm text-muted">Staged lifecycle actions and alerts.</p>
          </div>
          {actionCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}
