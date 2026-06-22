import { BookOpen, AlertTriangle, FileText, ArrowRight } from 'lucide-react';
import { MetricGrid, SurfaceCard, type MetricTileData, type SurfaceCardData } from '../../components';
import { ToneBadge } from '../../primitives';
import { POLICY_CORPUS, LIFECYCLE_DOMAIN_ORDER, DOMAIN_LABEL } from '@/policy/data/policyCorpus';

// Real per-domain policy counts, in canonical framework display order.
const domainGroups = LIFECYCLE_DOMAIN_ORDER.map((domainCode) => ({
  code: domainCode,
  label: DOMAIN_LABEL[domainCode] ?? domainCode,
  count: POLICY_CORPUS.filter((policy) => policy.domainCode === domainCode).length,
})).filter((group) => group.count > 0);

const largestDomain = domainGroups.reduce(
  (max, group) => (group.count > max.count ? group : max),
  domainGroups[0] ?? { code: '', label: '—', count: 0 },
);

const metrics = [
  { label: 'Total policies', value: String(POLICY_CORPUS.length), helper: 'Active and archived corpus', tone: 'teal' },
  { label: 'Domains', value: String(domainGroups.length), helper: 'Framework taxonomy groups', tone: 'green' },
  { label: 'Review Cycle', value: 'Annual', helper: 'Default policy cadence', tone: 'amber' },
  { label: 'Largest domain', value: String(largestDomain.count), helper: largestDomain.label, tone: 'orange' },
] satisfies readonly MetricTileData[];

// Domain grouping board: real domains with real counts. The corpus carries no
// per-record lifecycle status, so every published domain tile reads 'active'.
const stages = domainGroups.map((group) => ({
  label: group.label,
  count: group.count,
  status: 'active',
}));

const actionCards = [
  {
    body: 'Annual policy reviews and signatures are tracked across every framework domain before the next ACHC audit cycle.',
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
            <h3 className="text-h3 font-medium text-ink mb-lg">Domain Grouping Board</h3>
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
              Virtualization handles the {POLICY_CORPUS.length} active policy lifecycle rows. Use search or filter to target specific codes.
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
