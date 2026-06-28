import { Calendar, User, ShieldCheck, History } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { MetricGrid, type MetricTileData } from '../../components';
import { getCorpusPolicy, POLICY_CORPUS, DOMAIN_LABEL, type CorpusPolicy } from '@/policy/data/policyCorpus';
import { usePolicyLifecycleStore } from '@/policy/lifecycle';

// The lifecycle detail route is /policy-lifecycle/:policyId. The screen resolves
// the requested REAL corpus record + its lifecycle envelope (status/owner/history/due).
// Broken before: ignored store entirely, hardcoded "Active", no due date, no review/approval data.
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
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md">
              {REPRESENTATIVE_POLICY.id} — {REPRESENTATIVE_POLICY.title}
            </h3>
            <div className="rounded-md border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg text-sm text-secondary leading-relaxed">
              <p className="mb-md"><strong>1. Objective:</strong> Establish qualifications and credential checks for home health agency field workforce members.</p>
              <p className="mb-md"><strong>2. Scope:</strong> Applies to all RN, LVN, HHA, and therapy tracks prior to independent visit clearance.</p>
              <p><strong>3. Compliance:</strong> Governed under CMS 42 CFR 484.115 and ACHC standard expectations.</p>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Version history">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Lifecycle + Audit Details
            </h3>
            <div className="grid gap-sm text-sm">
              {/* Owner from corpus mapping (fixed) */}
              <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md flex flex-col gap-xs">
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
              <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md flex flex-col gap-xs">
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
              </div>
              {/* History length for approval/review records */}
              <div className="rounded-md bg-surface-glass backdrop-blur-md shadow-glass-inset p-md text-xs text-muted">
                History events: {envelope?.history?.length ?? 1} (created + transitions). Real envelope from usePolicyLifecycleStore.
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
