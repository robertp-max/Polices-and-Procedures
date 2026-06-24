import { Calendar, User, ShieldCheck, History } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { MetricGrid, type MetricTileData } from '../../components';
import { getCorpusPolicy, POLICY_CORPUS, DOMAIN_LABEL, type CorpusPolicy } from '@/policy/data/policyCorpus';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { usePolicyLifecycleStore } from '@/policy/lifecycle';
import { PolicySections } from './PolicyDetailScreen';

// The lifecycle detail route is /policy-lifecycle/:policyId. The screen resolves
// the requested REAL corpus record + its lifecycle envelope (status/owner/history/due)
// + identical policy document content via shared PolicySections from PolicyDetailScreen.
// Ensures "detail and lifecycle match".
const DEFAULT_POLICY: CorpusPolicy = POLICY_CORPUS[0];

function computeNextReview(createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

export function PolicyLifecycleDetailScreen() {
  const params = useParams<{ policyId?: string }>();
  const policyId = params.policyId?.trim();

  const REPRESENTATIVE_POLICY: CorpusPolicy =
    (policyId ? getCorpusPolicy(policyId) : undefined) ?? DEFAULT_POLICY;

  const domainLabel = DOMAIN_LABEL[REPRESENTATIVE_POLICY.domainCode] ?? REPRESENTATIVE_POLICY.domainCode;

  // FIXED: resolve real lifecycle state + data
  const getEnvelope = usePolicyLifecycleStore((s) => s.getEnvelope);
  const envelope = getEnvelope(REPRESENTATIVE_POLICY.id);
  const lifecycleStatus = envelope?.state ?? 'DRAFT';
  const lastTrans = envelope?.lastTransition;
  const dueDate = computeNextReview(envelope?.createdAt);

  // Phase now comes from envelope (correct state); fallback only if no envelope
  const currentPhase = lifecycleStatus;

  // Real content from same sources as PolicyDetailScreen, to ensure detail and lifecycle match.
  const content = getPolicyContent(REPRESENTATIVE_POLICY.id);
  const sections = content ? [...content.sections].sort((a, b) => a.order - b.order) : [];

  const metrics = [
    { label: 'Current Phase', value: currentPhase, helper: envelope ? 'From PolicyLifecycleEnvelope.state' : 'No envelope', tone: 'green' },
    { label: 'Policy ID', value: REPRESENTATIVE_POLICY.id, helper: REPRESENTATIVE_POLICY.title, tone: 'teal' },
    { label: 'Domain', value: domainLabel, helper: 'Framework taxonomy group', tone: 'amber' },
    { label: 'Next Review Due', value: dueDate, helper: 'Derived from envelope.createdAt + 1yr', tone: 'orange' },
  ] satisfies readonly MetricTileData[];

  return (
    <section
      className="grid gap-xl"
      data-group="System"
      data-hash-id="policy-lifecycle-detail"
      data-route="/policy-lifecycle/:policyId"
      data-template="lifecycle"
    >
      <MetricGrid metrics={metrics} />

      <section className="grid gap-xl desktop:grid-cols-12">
        <div className="grid content-start gap-lg desktop:col-span-8">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <div className="flex items-start justify-between gap-md mb-md">
              <h3 className="text-h3 font-medium text-ink">
                {REPRESENTATIVE_POLICY.id} — {REPRESENTATIVE_POLICY.title}
              </h3>
              <Link
                to={`/library/${encodeURIComponent(REPRESENTATIVE_POLICY.id)}`}
                className="text-xs px-3 py-1 rounded border border-hairline hover:bg-surface shrink-0"
              >
                View full policy detail →
              </Link>
            </div>
            {/* Real policy document sections rendered identically to PolicyDetailScreen via shared PolicySections */}
            {sections.length > 0 ? (
              <PolicySections sections={sections} />
            ) : (
              <div className="rounded-md border border-hairline bg-tone-slate-bg p-lg text-sm text-secondary">
                No content sections in source for this policy. (Matches detail view behavior.)
              </div>
            )}
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Version history">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Lifecycle + Audit Details
            </h3>
            <div className="grid gap-sm text-sm">
              {/* Owner from corpus mapping (fixed) */}
              <div className="rounded-md bg-tone-slate-bg p-md flex flex-col gap-xs">
                <span className="font-medium text-ink flex items-center gap-xs">
                  <User aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Owner steward: {REPRESENTATIVE_POLICY.ownerSteward}
                </span>
                <span className="text-xs text-muted flex items-center gap-xs">
                  <Calendar aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  {domainLabel} domain
                </span>
              </div>
              {/* Real lifecycle status + due + last transition */}
              <div className="rounded-md bg-tone-slate-bg p-md flex flex-col gap-xs">
                <span className="font-medium text-ink flex items-center gap-xs">
                  <History aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Lifecycle State: {lifecycleStatus}
                </span>
                <span className="text-xs text-muted flex items-center gap-xs">
                  <Calendar aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Next Review Due: {dueDate}
                </span>
                {lastTrans && (
                  <span className="text-[11px] text-muted mt-1 border-t border-hairline pt-1">
                    Last: {lastTrans.intent} → {lastTrans.toState} by {lastTrans.actor.name} @ {lastTrans.timestamp.slice(0,10)}
                  </span>
                )}
                <span className="text-xs text-muted">Tier: {REPRESENTATIVE_POLICY.tier} (corpus)</span>
                <div className="text-[10px] text-muted pt-1 border-t border-hairline">Content sections rendered via shared PolicySections (exact match to Policy Detail).</div>
              </div>
              {/* History length for approval/review records */}
              <div className="rounded-md bg-tone-slate-bg p-md text-xs text-muted">
                History events: {envelope?.history?.length ?? 1} (created + transitions). Real envelope from usePolicyLifecycleStore.
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
