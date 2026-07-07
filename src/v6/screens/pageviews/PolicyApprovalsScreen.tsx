import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Building2, CalendarClock, CheckCircle2, Clock3, FileText,
  GitCompare, ListChecks, PencilLine, Search, ShieldCheck, UserRound,
} from 'lucide-react';
import { DOMAIN_LABEL, LIFECYCLE_DOMAIN_ORDER, POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { usePolicyLifecycleStore } from '@/policy/lifecycle';
import { STATE_LABEL, type LifecycleState } from '@/policy/lifecycle/types';
import { ProgressMeter, ToneTag, type MetricTileData } from '../../components';
import { Button } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';
import {
  PolicyMetricsGrid,
  PolicyPanel,
  PolicyTinyStat,
  PolicyWorkspaceShell,
  type PolicyWorkspaceTab,
} from './PolicyWorkspace';

/* ════════════════════════════════════════════════════════════════
   Policy Approval Queue — a balanced operational worklist.
   Replaces the old hero-slab + blank full-width rows with a compact
   toolbar (status chips + domain/tier filters + search) and an
   information-dense, responsive card grid that mirrors the strongest
   Taxonomy/Journey card pattern: chips, concise meta, a readiness
   meter, and contextual actions in the card footer.

   Honesty: only DRAFT / REVIEW policies are actionable here. The
   readiness model is derived from the canonical 5-state lifecycle
   (DRAFT → REVIEW → APPROVED), never fabricated. Approve / Request
   changes stay disabled with a stated reason because applying them
   requires the signed authority workflow.
   ════════════════════════════════════════════════════════════════ */

function approvalAuthority(tier?: string): string {
  return tier === 'REQUIRED' ? 'Governing Body' : tier ? 'Administrator / Compliance Officer' : 'Compliance Officer';
}

type StatusFilter = 'ALL' | 'DRAFT' | 'REVIEW';

const STATE_TONE: Partial<Record<LifecycleState, Tone>> = {
  DRAFT: 'amber',
  REVIEW: 'orange',
  APPROVED: 'green',
  PUBLISHED: 'blue',
};

interface ReadinessStep { label: string; done: boolean }

/** Derived from the canonical pipeline position — not invented data. */
function readiness(state: LifecycleState, hasEnvelope: boolean): {
  steps: ReadinessStep[]; percent: number; blocking: number; nextAction: string; tone: Tone;
} {
  const steps: ReadinessStep[] = [
    { label: 'Draft authored', done: hasEnvelope },
    { label: 'Routed for review', done: state === 'REVIEW' },
    { label: 'Approval authority assigned', done: true },
    { label: 'Authority sign-off', done: false },
  ];
  const done = steps.filter((s) => s.done).length;
  const percent = Math.round((done / steps.length) * 100);
  const blocking = steps.filter((s) => !s.done).length;
  const nextAction = state === 'REVIEW' ? 'Authority sign-off' : 'Submit for review';
  return { steps, percent, blocking, nextAction, tone: state === 'REVIEW' ? 'orange' : 'amber' };
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const MAX_VISIBLE = 30;

export function PolicyApprovalsScreen() {
  const envelopes = usePolicyLifecycleStore((state) => state.envelopes);

  const [view, setView] = useState<'queue' | 'summary'>('queue');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [domain, setDomain] = useState<string>('ALL');
  const [tier, setTier] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  // Full actionable worklist (DRAFT / REVIEW), recomputed when the store changes.
  const rows = useMemo(() => POLICY_CORPUS.map((policy) => {
    const envelope = envelopes[policy.id];
    return { policy, envelope, state: (envelope?.state ?? 'DRAFT') as LifecycleState };
  }).filter((r) => r.state === 'DRAFT' || r.state === 'REVIEW'), [envelopes]);

  const counts = useMemo(() => {
    const c = { DRAFT: 0, REVIEW: 0, APPROVED: 0, PUBLISHED: 0, ARCHIVED: 0 } as Record<LifecycleState, number>;
    Object.values(envelopes).forEach((e) => { c[e.state] += 1; });
    return c;
  }, [envelopes]);

  const domainOptions = useMemo(() => {
    const present = new Set(rows.map((r) => r.policy.domainCode));
    return LIFECYCLE_DOMAIN_ORDER.filter((code) => present.has(code));
  }, [rows]);
  const tierOptions = useMemo(() => Array.from(new Set(rows.map((r) => r.policy.tier))).sort(), [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== 'ALL' && r.state !== status) return false;
      if (domain !== 'ALL' && r.policy.domainCode !== domain) return false;
      if (tier !== 'ALL' && r.policy.tier !== tier) return false;
      if (q) {
        const hay = `${r.policy.id} ${r.policy.title} ${DOMAIN_LABEL[r.policy.domainCode] ?? ''} ${r.policy.ownerSteward}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, status, domain, tier, query]);

  const visible = filtered.slice(0, MAX_VISIBLE);
  const truncated = filtered.length - visible.length;

  const statusChips: { id: StatusFilter; label: string; count: number; tone: Tone }[] = [
    { id: 'ALL', label: 'All open', count: rows.length, tone: 'slate' },
    { id: 'DRAFT', label: 'Draft', count: counts.DRAFT, tone: 'amber' },
    { id: 'REVIEW', label: 'In review', count: counts.REVIEW, tone: 'orange' },
  ];
  const tabs: readonly PolicyWorkspaceTab<typeof view>[] = [
    { id: 'queue', label: 'Queue', tone: 'teal' },
    { id: 'summary', label: 'Summary', tone: 'green' },
  ];
  const approvalMetrics = [
    { label: 'Open approvals', value: String(rows.length), helper: 'Draft and review policies', tone: 'teal' },
    { label: 'Draft', value: String(counts.DRAFT), helper: 'Ready to submit for review', tone: 'amber' },
    { label: 'In review', value: String(counts.REVIEW), helper: 'Awaiting authority sign-off', tone: 'orange' },
    { label: 'Published', value: String(counts.PUBLISHED), helper: 'Already live in the corpus', tone: 'green' },
  ] satisfies readonly MetricTileData[];

  return (
    <PolicyWorkspaceShell
      activeTab={view}
      dataHashId="policy-approvals"
      dataRoute="/policy-approvals"
      description="Review draft and in-review policies as a focused queue, with governance context separated from the working list."
      eyebrow="Approval Control"
      onTabChange={setView}
      tabs={tabs}
      title="Policy Approvals"
      actions={[
        { icon: FileText, label: 'Lifecycle', to: '/policy-lifecycle', variant: 'secondary' },
        { icon: ShieldCheck, label: 'Policy Library', to: '/library' },
      ]}
    >
      <PolicyMetricsGrid metrics={approvalMetrics} />

      {view === 'queue' ? (
        <PolicyPanel
          title="Approval Queue"
          description={`${filtered.length} policy records match the active status, domain, tier, and search filters.`}
          actions={
            <Link
              to="/policy-lifecycle"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#007970] bg-white px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-widest text-[#007970] transition hover:bg-[#F7FEFF]"
            >
              <FileText className="h-4 w-4" /> Open Lifecycle
            </Link>
          }
        >
          <div className="mb-6 grid gap-4">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by lifecycle status">
              {statusChips.map((chip) => {
                const active = status === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setStatus(chip.id)}
                    className={cx(
                      'inline-flex min-h-11 items-center gap-2 rounded-[12px] border px-4 font-montserrat text-[10px] font-bold uppercase tracking-wider transition',
                      active
                        ? 'border-[#007970] bg-[#007970] text-white'
                        : 'border-[#E5E4E3] bg-white text-[#747470] hover:bg-[#F7FEFF] hover:text-[#007970]',
                    )}
                  >
                    {chip.label}
                    <span className="rounded-full bg-white/70 px-2 text-xs tabular-nums text-[#52404B]">{chip.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="flex min-h-11 w-full min-w-[260px] items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 text-sm text-[#747470] tablet-l:max-w-xs">
                <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search policy ID, title, owner..."
                  aria-label="Search policy approvals"
                  className="w-full bg-transparent py-3 text-[#52404B] outline-none placeholder:text-[#9A9A96]"
                />
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                aria-label="Filter by domain"
                className="min-h-11 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470] outline-none focus:border-[#007970]"
              >
                <option value="ALL">All domains</option>
                {domainOptions.map((code) => <option key={code} value={code}>{DOMAIN_LABEL[code] ?? code}</option>)}
              </select>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                aria-label="Filter by tier"
                className="min-h-11 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470] outline-none focus:border-[#007970]"
              >
                <option value="ALL">All tiers</option>
                {tierOptions.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-[24px] border border-dashed border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
              <ListChecks className="h-6 w-6 text-[#747470]" aria-hidden="true" />
              <p className="font-montserrat text-sm font-bold text-[#007970]">No policies match these filters.</p>
              <p className="text-sm text-[#747470]">Adjust the status, domain, or tier filters to see open approvals.</p>
            </div>
          ) : (
            <div className="grid gap-5 tablet-l:grid-cols-2 desktop:grid-cols-3">
              {visible.map(({ policy, envelope, state }) => {
                const r = readiness(state, !!envelope);
                return (
                  <article
                    key={policy.id}
                    className="flex min-w-0 flex-col gap-4 rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#007970] hover:shadow-md"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <ToneTag tone={STATE_TONE[state] ?? 'slate'}>{STATE_LABEL[state]}</ToneTag>
                      <ToneTag tone="slate">{policy.tier || 'Unclassified'}</ToneTag>
                      <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-wider text-[#F06923]">{policy.id}</span>
                    </div>

                    <div className="grid gap-2">
                      <h2 className="font-montserrat text-base font-bold leading-snug text-[#007970]">{policy.title}</h2>
                      <p className="inline-flex items-center gap-2 text-xs text-[#747470]">
                        <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        {DOMAIN_LABEL[policy.domainCode] ?? policy.domainCode} - {policy.subdomainCode}
                      </p>
                    </div>

                    <dl className="grid gap-2 text-xs">
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-1.5 font-medium text-[#747470]"><ShieldCheck className="h-3.5 w-3.5" /> Authority</dt>
                        <dd className="text-right font-bold text-[#007970]">{approvalAuthority(policy.tier)}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-1.5 font-medium text-[#747470]"><UserRound className="h-3.5 w-3.5" /> Owner</dt>
                        <dd className="break-words text-right font-semibold text-[#52404B]">{policy.ownerSteward || 'Compliance Officer'}</dd>
                      </div>
                      <div className="flex items-start justify-between gap-4">
                        <dt className="flex items-center gap-1.5 font-medium text-[#747470]"><CalendarClock className="h-3.5 w-3.5" /> Last activity</dt>
                        <dd className="text-right font-semibold text-[#52404B]">{formatDate(envelope?.lastTransition?.timestamp ?? envelope?.createdAt)}</dd>
                      </div>
                    </dl>

                    <div className="grid gap-2">
                      <ProgressMeter label="Approval readiness" tone={r.tone} value={r.percent} />
                      <p className="flex items-center gap-2 text-xs text-[#747470]">
                        <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                        {r.blocking} step{r.blocking === 1 ? '' : 's'} to approval - Next: <span className="font-semibold text-[#52404B]">{r.nextAction}</span>
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      <Link
                        to={`/policy-lifecycle/${policy.id}`}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-4 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wider text-white transition hover:brightness-110 focus:outline-none"
                      >
                        <Clock3 className="h-4 w-4" /> Review
                      </Link>
                      <Link
                        to={`/library/${policy.id}`}
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-white px-3 py-2 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#007970] transition hover:bg-[#F7FEFF] focus:outline-none"
                        title="Open the policy record"
                      >
                        <GitCompare className="h-4 w-4" /> <span className="hidden tablet-p:inline">Compare</span>
                      </Link>
                      <Button variant="tertiary" size="sm" disabled title="Requesting changes routes through the signed lifecycle workflow on the policy record.">
                        <PencilLine className="h-4 w-4" /> <span className="hidden tablet-p:inline">Request changes</span>
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {truncated > 0 ? (
            <p className="mt-8 flex items-center justify-center gap-2 text-sm text-[#747470]">
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              Showing {visible.length} of {filtered.length}. Refine filters to narrow the queue.
            </p>
          ) : null}
        </PolicyPanel>
      ) : null}

      {view === 'summary' ? (
        <PolicyPanel title="Governance Summary" description="Read-only context for approval authority, publication posture, and the required human review gate.">
          <div className="grid gap-4 md:grid-cols-4">
            <PolicyTinyStat label="Approved" tone="green" value={String(counts.APPROVED)} />
            <PolicyTinyStat label="Published" tone="blue" value={String(counts.PUBLISHED)} />
            <PolicyTinyStat label="Draft" tone="amber" value={String(counts.DRAFT)} />
            <PolicyTinyStat label="Review" tone="orange" value={String(counts.REVIEW)} />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-[20px] border border-[#E5E4E3] bg-[#FAFBF8] p-5">
              <h3 className="font-montserrat text-sm font-bold text-[#007970]">Authority Routing</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#747470]">Required-tier policies route to Governing Body approval. Other policies route to administrator or compliance officer review.</p>
            </article>
            <article className="rounded-[20px] border border-[#E5E4E3] bg-[#FAFBF8] p-5">
              <h3 className="font-montserrat text-sm font-bold text-[#007970]">Publication Gate</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#747470]">Human approval remains required before publication. Disabled actions keep this prototype honest until signed lifecycle routing is connected.</p>
            </article>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#747470]">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#007970]" /> Required-tier policies route to Governing Body approval.</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#007970]" /> Human approval remains required before publication.</span>
          </div>
        </PolicyPanel>
      ) : null}
    </PolicyWorkspaceShell>
  );
}
