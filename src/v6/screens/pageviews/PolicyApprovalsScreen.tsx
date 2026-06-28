import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight, Building2, CalendarClock, CheckCircle2, Clock3, FileText,
  GitCompare, ListChecks, PencilLine, Search, ShieldCheck, UserRound,
} from 'lucide-react';
import { DOMAIN_LABEL, LIFECYCLE_DOMAIN_ORDER, POLICY_CORPUS } from '@/policy/data/policyCorpus';
import { usePolicyLifecycleStore } from '@/policy/lifecycle';
import { STATE_LABEL, type LifecycleState } from '@/policy/lifecycle/types';
import { ProgressMeter, ToneTag } from '../../components';
import { Button } from '../../primitives';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

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

  return (
    <section
      className="grid gap-lg"
      data-group="Taxonomy"
      data-hash-id="policy-approvals"
      data-route="/policy-approvals"
      data-template="board"
    >
      {/* ── Compact app toolbar (replaces the old hero slab) ── */}
      <div className="grid gap-md rounded-lg border border-hairline bg-surface-glass p-md shadow-rest backdrop-blur-md">
        <div className="flex flex-wrap items-center gap-sm">
          <span className="flex items-center gap-sm">
            <ShieldCheck className="h-icon-sm w-icon-sm text-brand-teal" aria-hidden="true" />
            <h1 className="text-h3 font-medium text-ink">Policy Approvals</h1>
          </span>
          {/* Status filter chips with live counts */}
          <div className="flex flex-wrap items-center gap-xs" role="group" aria-label="Filter by lifecycle status">
            {statusChips.map((chip) => {
              const active = status === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setStatus(chip.id)}
                  className={cx(
                    'inline-flex min-h-tap items-center gap-xs rounded-full border px-md text-sm font-medium transition duration-fast ease-standard',
                    active
                      ? 'border-brand-teal bg-tone-teal-bg text-brand-teal-deep shadow-rest'
                      : 'border-hairline bg-surface text-secondary hover:bg-surface-hover',
                  )}
                >
                  {chip.label}
                  <span className="rounded-full bg-surface-glass px-xs text-xs tabular-nums text-muted">{chip.count}</span>
                </button>
              );
            })}
          </div>
          {/* Read-only context stats */}
          <span className="ml-auto hidden items-center gap-md text-xs text-muted tablet-l:flex">
            <span className="inline-flex items-center gap-xs"><CheckCircle2 className="h-3.5 w-3.5 text-tone-green-text" /> {counts.APPROVED} approved</span>
            <span className="inline-flex items-center gap-xs"><FileText className="h-3.5 w-3.5 text-tone-blue-text" /> {counts.PUBLISHED} published</span>
          </span>
          <Link
            to="/policy-lifecycle"
            className="inline-flex min-h-tap items-center justify-center gap-sm rounded-md border border-brand-teal bg-surface-glass px-md text-sm font-light text-brand-teal shadow-glass-inset backdrop-blur-md transition duration-fast ease-standard hover:bg-surface-hover"
          >
            <FileText className="h-4 w-4" /> Open Policy Lifecycle
          </Link>
        </div>

        {/* Filters + search row — search owns its own line on mobile; selects split the row below */}
        <div className="flex flex-wrap items-center gap-sm">
          <label className="flex min-h-tap w-full min-w-0 items-center gap-xs rounded-md border border-hairline bg-surface px-sm text-sm text-secondary tablet-l:max-w-xs tablet-l:flex-1">
            <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search policy ID, title, owner…"
              aria-label="Search policy approvals"
              className="w-full min-w-0 bg-transparent py-sm text-ink outline-none placeholder:text-muted"
            />
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-xs text-xs text-muted tablet-l:flex-none">
            <span className="sr-only tablet-l:not-sr-only">Domain</span>
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              aria-label="Filter by domain"
              className="min-h-tap w-full min-w-0 rounded-md border border-hairline bg-surface px-sm text-sm text-ink outline-none focus:border-brand-teal tablet-l:w-auto"
            >
              <option value="ALL">All domains</option>
              {domainOptions.map((code) => <option key={code} value={code}>{DOMAIN_LABEL[code] ?? code}</option>)}
            </select>
          </label>
          <label className="flex min-w-0 flex-1 items-center gap-xs text-xs text-muted tablet-l:flex-none">
            <span className="sr-only tablet-l:not-sr-only">Tier</span>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              aria-label="Filter by tier"
              className="min-h-tap w-full min-w-0 rounded-md border border-hairline bg-surface px-sm text-sm text-ink outline-none focus:border-brand-teal tablet-l:w-auto"
            >
              <option value="ALL">All tiers</option>
              {tierOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
        </div>
      </div>

      {/* ── Approval card grid (balanced, multi-column, information-dense) ── */}
      {visible.length === 0 ? (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-sm rounded-lg border border-dashed border-hairline bg-surface-glass p-xl text-center">
          <ListChecks className="h-6 w-6 text-muted" aria-hidden="true" />
          <p className="text-sm font-medium text-ink">No policies match these filters.</p>
          <p className="text-xs text-muted">Adjust the status, domain, or tier filters — or clear the search — to see open approvals.</p>
        </div>
      ) : (
        <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-3">
          {visible.map(({ policy, envelope, state }) => {
            const r = readiness(state, !!envelope);
            return (
              <article
                key={policy.id}
                className="flex min-w-0 flex-col gap-md rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest backdrop-blur-md transition duration-base ease-standard hover:shadow-hover"
              >
                {/* Header: status + tier + domain + id */}
                <div className="flex flex-wrap items-center gap-xs">
                  <ToneTag tone={STATE_TONE[state] ?? 'slate'}>{STATE_LABEL[state]}</ToneTag>
                  <ToneTag tone="slate">{policy.tier || 'Unclassified'}</ToneTag>
                  <span className="ml-auto font-mono text-tag uppercase tracking-tag text-muted">{policy.id}</span>
                </div>

                {/* Title + domain */}
                <div className="grid gap-xs">
                  <h2 className="text-h3 font-medium leading-tight text-ink">{policy.title}</h2>
                  <p className="inline-flex items-center gap-xs text-xs text-muted">
                    <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                    {DOMAIN_LABEL[policy.domainCode] ?? policy.domainCode} · {policy.subdomainCode}
                  </p>
                </div>

                {/* Meta grid */}
                <dl className="grid gap-xs text-xs">
                  <div className="flex items-start justify-between gap-md">
                    <dt className="flex items-center gap-xs text-muted"><ShieldCheck className="h-3.5 w-3.5" /> Authority</dt>
                    <dd className="text-right font-medium text-ink">{approvalAuthority(policy.tier)}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-md">
                    <dt className="flex items-center gap-xs text-muted"><UserRound className="h-3.5 w-3.5" /> Owner</dt>
                    <dd className="break-words text-right text-secondary">{policy.ownerSteward || 'Compliance Officer'}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-md">
                    <dt className="flex items-center gap-xs text-muted"><CalendarClock className="h-3.5 w-3.5" /> Last activity</dt>
                    <dd className="text-right text-secondary">{formatDate(envelope?.lastTransition?.timestamp ?? envelope?.createdAt)}</dd>
                  </div>
                </dl>

                {/* Readiness */}
                <div className="grid gap-xs">
                  <ProgressMeter label="Approval readiness" tone={r.tone} value={r.percent} />
                  <p className="flex items-center gap-xs text-xs text-muted">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {r.blocking} step{r.blocking === 1 ? '' : 's'} to approval · Next: <span className="font-medium text-secondary">{r.nextAction}</span>
                  </p>
                </div>

                {/* Actions — adjacent to the content they act on */}
                <div className="mt-auto flex flex-wrap gap-xs pt-xs">
                  <Link
                    to={`/policy-lifecycle/${policy.id}`}
                    className="inline-flex min-h-tap flex-1 items-center justify-center gap-xs rounded-md border border-brand-teal bg-brand-teal px-sm text-sm font-light text-on-brand shadow-rest transition duration-fast ease-standard hover:shadow-hover"
                  >
                    <Clock3 className="h-4 w-4" /> Review
                  </Link>
                  <Link
                    to={`/library/${policy.id}`}
                    className="inline-flex min-h-tap items-center justify-center gap-xs rounded-md border border-hairline bg-surface px-sm text-sm font-light text-secondary transition duration-fast ease-standard hover:bg-surface-hover"
                    title="Open the policy record"
                  >
                    <GitCompare className="h-4 w-4" /> <span className="hidden tablet-p:inline">Compare</span>
                  </Link>
                  <Button
                    variant="tertiary"
                    size="sm"
                    disabled
                    title="Requesting changes routes through the signed lifecycle workflow on the policy record."
                  >
                    <PencilLine className="h-4 w-4" /> <span className="hidden tablet-p:inline">Request changes</span>
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled
                    title="Approval requires the signed authority workflow — open Review to route it."
                  >
                    <ShieldCheck className="h-4 w-4" /> Approve
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {truncated > 0 && (
        <p className="flex items-center justify-center gap-xs rounded-lg border border-hairline bg-surface-glass px-md py-sm text-xs text-muted">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          Showing {visible.length} of {filtered.length}. Refine the status, domain, or tier filters to narrow the queue.
        </p>
      )}

      {/* Slim governance footer (compact, not a slab) */}
      <div className="flex flex-wrap items-center gap-md rounded-lg border border-hairline bg-surface-glass px-md py-sm text-xs text-secondary shadow-glass-inset">
        <span className="inline-flex items-center gap-xs"><ShieldCheck className="h-3.5 w-3.5 text-brand-teal" /> Required-tier policies route to Governing Body approval.</span>
        <span className="inline-flex items-center gap-xs"><CheckCircle2 className="h-3.5 w-3.5 text-brand-teal" /> Human approval remains required before publication.</span>
      </div>
    </section>
  );
}
