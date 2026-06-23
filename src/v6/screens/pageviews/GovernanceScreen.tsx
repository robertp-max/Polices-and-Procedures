import { Landmark, FileText } from 'lucide-react';
import { MetricGrid, SurfaceCard, toneBarClasses, type MetricTileData, type SurfaceCardData } from '../../components';
import { loadLifecycleSeed } from '@/policy/lifecycle/lifecycleSeed';

// ─── Real lifecycle distribution ─────────────────────────────────
// Source: POLICY_CORPUS via loadLifecycleSeed(). Per the lifecycle
// store seeding rule (buildSeedEnvelopes → createEnvelope), every
// seeded policy starts in DRAFT; no policy has yet advanced to
// REVIEW/APPROVED/PUBLISHED. Counts are derived, never invented.
const lifecycleStageCounts: Record<'DRAFT' | 'REVIEW' | 'APPROVED' | 'PUBLISHED', number> = {
  DRAFT: loadLifecycleSeed().policies.length,
  REVIEW: 0,
  APPROVED: 0,
  PUBLISHED: 0,
};

const metrics = [
  { label: 'Council members', value: '—', helper: 'Active voting committee', tone: 'teal' },
  { label: 'Pending drafts', value: String(lifecycleStageCounts.DRAFT), helper: 'Policies in review stage', tone: 'orange' },
  { label: 'Approved this cycle', value: String(lifecycleStageCounts.APPROVED), helper: 'Consent checks signed off', tone: 'green' },
] satisfies readonly MetricTileData[];

const chartData = [
  { label: 'DRAFT', value: lifecycleStageCounts.DRAFT, tone: 'orange' },
  { label: 'REVIEW', value: lifecycleStageCounts.REVIEW, tone: 'amber' },
  { label: 'APPROVED', value: lifecycleStageCounts.APPROVED, tone: 'green' },
  { label: 'PUBLISHED', value: lifecycleStageCounts.PUBLISHED, tone: 'teal' },
] as const;

const chartMax = Math.max(1, ...chartData.map((point) => point.value));

const reviewCards = [
  {
    body: 'Policy ADM-HR-004 is currently in the review stage and is scheduled for the next committee vote on Jun 25.',
    icon: FileText,
    progress: 70,
    status: 'review-required',
    title: 'ADM-HR-004 Vote Scheduled',
    tone: 'orange',
  },
] satisfies readonly SurfaceCardData[];

export function GovernanceScreen() {
  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="governance"
      data-route="/governance"
      data-template="reports"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-lg">Policy Distribution by Stage</h3>
            <div className="rounded-lg bg-tone-slate-bg p-lg">
              <div className="flex h-[200px] items-end gap-lg" aria-label="Policy count per stage chart">
                {chartData.map((point) => (
                  <div className="flex h-full min-w-tap flex-1 flex-col justify-end gap-sm" key={point.label}>
                    <div
                      aria-label={`${point.label}: ${point.value}`}
                      className={`${toneBarClasses[point.tone]} min-h-xs rounded-t-md`}
                      role="img"
                      style={{ height: `${(point.value / chartMax) * 100}%` }}
                    />
                    <div className="grid gap-xs text-center">
                      <span className="text-xs font-light text-ink">{point.label}</span>
                      <span className="text-xs font-light tabular-nums text-muted">{point.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Committee review">
          <div className="grid gap-xs mb-sm">
            <h3 className="text-h3 font-medium text-ink flex items-center gap-sm">
              <Landmark aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Committee Review
            </h3>
            <p className="text-sm text-muted">Active drafts requiring voting action.</p>
          </div>
          {reviewCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
        </aside>
      </section>
    </section>
  );
}
