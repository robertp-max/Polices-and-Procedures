import { Calendar, User, ShieldCheck } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { MetricGrid, type MetricTileData } from '../../components';
import { getCorpusPolicy, POLICY_CORPUS, DOMAIN_LABEL, type CorpusPolicy } from '@/policy/data/policyCorpus';

// The lifecycle detail route is /policy-lifecycle/:policyId. The screen resolves
// the requested real corpus record from the route param, with a deterministic
// real fallback (first corpus record) when the param is empty/unknown.
const DEFAULT_POLICY: CorpusPolicy = POLICY_CORPUS[0];

export function PolicyLifecycleDetailScreen() {
  const params = useParams<{ policyId?: string }>();
  const policyId = params.policyId?.trim();

  const REPRESENTATIVE_POLICY: CorpusPolicy =
    (policyId ? getCorpusPolicy(policyId) : undefined) ?? DEFAULT_POLICY;

  const domainLabel = DOMAIN_LABEL[REPRESENTATIVE_POLICY.domainCode] ?? REPRESENTATIVE_POLICY.domainCode;

  // No per-record status in the corpus; every REQUIRED-tier policy is published/active.
  const currentPhase = REPRESENTATIVE_POLICY.tier === 'REQUIRED' ? 'Active' : 'Draft';

  const metrics = [
    { label: 'Current Phase', value: currentPhase, helper: 'Published corpus record', tone: 'green' },
    { label: 'Policy ID', value: REPRESENTATIVE_POLICY.id, helper: REPRESENTATIVE_POLICY.title, tone: 'teal' },
    { label: 'Domain', value: domainLabel, helper: 'Framework taxonomy group', tone: 'amber' },
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
            <h3 className="text-h3 font-medium text-ink mb-md">
              {REPRESENTATIVE_POLICY.id} — {REPRESENTATIVE_POLICY.title}
            </h3>
            <div className="rounded-md border border-hairline bg-tone-slate-bg p-lg text-sm text-secondary leading-relaxed">
              <p className="mb-md"><strong>1. Objective:</strong> Establish qualifications and credential checks for home health agency field workforce members.</p>
              <p className="mb-md"><strong>2. Scope:</strong> Applies to all RN, LVN, HHA, and therapy tracks prior to independent visit clearance.</p>
              <p><strong>3. Compliance:</strong> Governed under CMS 42 CFR 484.115 and ACHC standard expectations.</p>
            </div>
          </section>
        </div>

        <aside className="grid content-start gap-lg desktop:col-span-4" aria-label="Version history">
          <section className="rounded-lg border border-card bg-surface p-xl shadow-rest">
            <h3 className="text-h3 font-medium text-ink mb-md flex items-center gap-sm">
              <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" />
              Audit Log Details
            </h3>
            <div className="grid gap-sm text-sm">
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
              <div className="rounded-md bg-tone-slate-bg p-md flex flex-col gap-xs">
                <span className="font-medium text-ink flex items-center gap-xs">
                  <User aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Created by Compliance Officer
                </span>
                <span className="text-xs text-muted flex items-center gap-xs">
                  <Calendar aria-hidden="true" className="h-icon-xs w-icon-xs text-muted" />
                  Tier: {REPRESENTATIVE_POLICY.tier}
                </span>
              </div>
            </div>
          </section>
        </aside>
      </section>
    </section>
  );
}
