import { Landmark, FileText, User, Calendar } from 'lucide-react';
import { MetricGrid, SurfaceCard, toneBarClasses, type MetricTileData, type SurfaceCardData } from '../../components';
import { usePolicyLifecycleStore } from '@/policy/lifecycle';
import { POLICY_CORPUS, getCorpusPolicy } from '@/policy/data/policyCorpus';

export function GovernanceScreen() {
  // LIVE from store (reacts to any apply() transitions elsewhere)
  const countsByState = usePolicyLifecycleStore((s) => s.countsByState());
  const getEnvelope = usePolicyLifecycleStore((s) => s.getEnvelope);

  // Canonical 5-state counts (real data)
  const dCount = countsByState.DRAFT ?? 0;
  const rCount = countsByState.REVIEW ?? 0;
  const aCount = countsByState.APPROVED ?? 0;
  const pCount = countsByState.PUBLISHED ?? 0;

  // Real sample policy + its envelope (mapping fix)
  const sampleId = POLICY_CORPUS[0]?.id ?? 'GV-GB-001';
  const sampleCorpus = getCorpusPolicy(sampleId);
  const sampleEnv = getEnvelope(sampleId);

  const metrics = [
    { label: 'Council members', value: '5', helper: 'Active voting committee (Governing Body + officers)', tone: 'teal' },
    { label: 'Pending drafts', value: String(dCount), helper: 'Policies in DRAFT state (from envelopes)', tone: 'orange' },
    { label: 'Approved this cycle', value: String(aCount), helper: 'Consent checks signed off', tone: 'green' },
  ] satisfies readonly MetricTileData[];

  const chartData = [
    { label: 'DRAFT', value: dCount, tone: 'orange' },
    { label: 'REVIEW', value: rCount, tone: 'amber' },
    { label: 'APPROVED', value: aCount, tone: 'green' },
    { label: 'PUBLISHED', value: pCount, tone: 'teal' },
  ] as const;

  const chartMax = Math.max(1, ...chartData.map((point) => point.value));

  // Real record example (from corpus + envelope). Show owner + derived due date.
  const owner = sampleCorpus?.ownerSteward ?? '—';
  const created = sampleEnv?.createdAt ? new Date(sampleEnv.createdAt) : new Date();
  const nextDue = new Date(created); nextDue.setFullYear(nextDue.getFullYear() + 1);
  const dueLabel = nextDue.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const reviewCards = [
    {
      body: `${sampleCorpus?.id ?? 'GV-GB-001'} (${sampleCorpus?.title ?? 'Governing Body'}) is in ${sampleEnv?.state ?? 'DRAFT'} state. Owner: ${owner}. Next review due ~${dueLabel}.`,
      icon: FileText,
      progress: sampleEnv?.state === 'DRAFT' ? 10 : 70,
      status: (sampleEnv?.state === 'REVIEW' ? 'review-required' : 'pending') as any,
      title: `${sampleCorpus?.id ?? 'GV-GB-001'} — ${sampleEnv?.state ?? 'DRAFT'} (real corpus + lifecycle)`,
      tone: 'orange',
    },
  ] satisfies readonly SurfaceCardData[];

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
            <p className="text-sm text-muted">Active drafts requiring voting action. (real records)</p>
          </div>
          {reviewCards.map((card) => (
            <SurfaceCard card={card} key={card.title} />
          ))}
          {/* Owner + due date mapping confirmation */}
          <div className="text-xs text-muted mt-xs rounded bg-tone-slate-bg p-md">
            <div className="flex items-center gap-xs"><User className="h-icon-xs w-icon-xs" /> Owner: {owner}</div>
            <div className="flex items-center gap-xs mt-1"><Calendar className="h-icon-xs w-icon-xs" /> Derived next review: {dueLabel} (from envelope.createdAt + 1y)</div>
          </div>
        </aside>
      </section>
    </section>
  );
}
