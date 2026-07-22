import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  FileSignature,
  GitMerge,
  KeyRound,
  RefreshCcw,
  ShieldCheck,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import {
  AuthApi,
  type AccessReviewCampaignRow,
  type ReconciliationFindingsResponse,
  type SignatureCoverageResponse,
  type UserAccessStateRow,
} from '@/auth/api';
import { Button } from '../../primitives';
import { cx } from '../../utils/classNames';

interface AdminSnapshot {
  capturedAt: number;
  campaigns?: AccessReviewCampaignRow[];
  reconciliation?: ReconciliationFindingsResponse;
  signature?: SignatureCoverageResponse;
  users?: UserAccessStateRow[];
  unavailable: number;
}

interface SnapshotCard {
  detail: string;
  icon: LucideIcon;
  label: string;
  tone: 'teal' | 'orange' | 'green' | 'slate';
  to: string;
  value: string;
}

const CARD_TONES = {
  teal: 'bg-tone-teal-bg text-tone-teal-text',
  orange: 'bg-tone-orange-bg text-tone-orange-text',
  green: 'bg-tone-green-bg text-tone-green-text',
  slate: 'bg-surface text-secondary',
} as const;

function settledValue<T>(result: PromiseSettledResult<T>): T | undefined {
  return result.status === 'fulfilled' ? result.value : undefined;
}

export function AdminOverviewScreen() {
  const { getAccessToken } = useAuth();
  const [snapshot, setSnapshot] = useState<AdminSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const token = getAccessToken();
    if (!token) {
      setSnapshot({ capturedAt: Date.now(), unavailable: 4 });
      setLoading(false);
      return;
    }
    const results = await Promise.allSettled([
      AuthApi.listUserAccess(token),
      AuthApi.getSignatureCoverage(token),
      AuthApi.listAccessReviewCampaigns(token),
      AuthApi.getReconciliationFindings(token),
    ] as const);

    const usersResult = settledValue(results[0]);
    const signatureResult = settledValue(results[1]);
    const campaignsResult = settledValue(results[2]);
    const reconciliationResult = settledValue(results[3]);

    setSnapshot({
      capturedAt: Date.now(),
      users: usersResult?.users,
      signature: signatureResult,
      campaigns: campaignsResult?.campaigns,
      reconciliation: reconciliationResult?.findings,
      unavailable: results.filter((result) => result.status === 'rejected').length,
    });
    setLoading(false);
  }, [getAccessToken]);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const cards = useMemo((): SnapshotCard[] => {
    const users = snapshot?.users;
    const signature = snapshot?.signature;
    const campaigns = snapshot?.campaigns;
    const reconciliation = snapshot?.reconciliation;
    const activeUsers = users?.filter((user) => user.status === 'active').length;
    const suspendedUsers = users?.filter((user) => user.status === 'suspended').length;
    const uncovered = signature?.qapiAcceptance.filter((capacity) => !capacity.covered).length;
    const totalFindings = reconciliation?.summary.totalFindings;

    return [
      {
        label: 'Canonical people',
        value: users ? String(users.length) : '—',
        detail: users ? `${activeUsers} active · ${suspendedUsers} suspended` : 'Server directory unavailable',
        icon: UsersRound,
        tone: 'teal',
        to: '/admin/users',
      },
      {
        label: 'Signature gaps',
        value: signature ? String(uncovered) : '—',
        detail: signature ? `${signature.qapiAcceptance.length} acceptance capacities checked` : 'Coverage projection unavailable',
        icon: FileSignature,
        tone: signature ? (uncovered ? 'orange' : 'green') : 'slate',
        to: '/admin/signature-coverage',
      },
      {
        label: 'Access reviews',
        value: campaigns ? String(campaigns.length) : '—',
        detail: campaigns ? 'Policy-basis campaigns scheduled' : 'Campaign service unavailable',
        icon: CalendarClock,
        tone: 'slate',
        to: '/admin/access-review',
      },
      {
        label: 'Reconciliation',
        value: reconciliation ? String(totalFindings) : '—',
        detail: reconciliation ? 'Identity or access findings to adjudicate' : 'Findings projection unavailable',
        icon: GitMerge,
        tone: reconciliation ? (totalFindings ? 'orange' : 'green') : 'slate',
        to: '/admin/reconciliation',
      },
    ];
  }, [snapshot]);

  const attentionItems = useMemo(() => {
    if (!snapshot) return [];
    const items: Array<{ detail: string; label: string; to: string }> = [];
    const suspended = snapshot.users?.filter((user) => user.status === 'suspended').length ?? 0;
    const signatureGaps = snapshot.signature?.qapiAcceptance.filter((capacity) => !capacity.covered).length ?? 0;
    const findings = snapshot.reconciliation?.summary.totalFindings ?? 0;
    const overdue = snapshot.campaigns?.filter((campaign) => new Date(campaign.dueAt).getTime() < snapshot.capturedAt).length ?? 0;

    if (findings > 0) items.push({ label: `${findings} reconciliation ${findings === 1 ? 'finding' : 'findings'}`, detail: 'Review before changing identity bindings or privileged access.', to: '/admin/reconciliation' });
    if (signatureGaps > 0) items.push({ label: `${signatureGaps} signature coverage ${signatureGaps === 1 ? 'gap' : 'gaps'}`, detail: 'Assign authority from the appropriate user record; job title alone never grants capacity.', to: '/admin/signature-coverage' });
    if (overdue > 0) items.push({ label: `${overdue} overdue access ${overdue === 1 ? 'review' : 'reviews'}`, detail: 'Complete or reschedule using the campaign’s named policy basis.', to: '/admin/access-review' });
    if (suspended > 0) items.push({ label: `${suspended} suspended ${suspended === 1 ? 'account' : 'accounts'}`, detail: 'Suspension remains a global deny; review only when reactivation evidence is complete.', to: '/admin/users' });
    return items;
  }, [snapshot]);

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-overview" data-route="/admin" data-template="dashboard">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <p className="font-montserrat text-[11px] font-medium uppercase tracking-[0.16em] text-brand-teal">Control-plane snapshot</p>
          <p className="mt-xs text-sm font-light text-muted">Live values come from server projections. Unavailable services stay visibly unavailable.</p>
        </div>
        <Button size="sm" variant="secondary" disabled={loading} onClick={() => void load()}>
          <span className="inline-flex items-center gap-xs">
            <RefreshCcw aria-hidden className={cx('h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </span>
        </Button>
      </div>

      {snapshot?.unavailable ? (
        <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/55 px-lg py-md text-sm text-tone-orange-text" role="status">
          {snapshot.unavailable} of 4 server projections are unavailable in this session. No value below is inferred from browser storage.
        </div>
      ) : null}

      <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-4" aria-label="Admin control-plane metrics">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              className="group rounded-[24px] bg-white p-lg shadow-[0_14px_38px_rgba(0,47,48,0.07)] transition-shadow hover:shadow-[0_20px_48px_rgba(0,47,48,0.11)] focus-visible:outline-none focus-visible:shadow-focus"
              key={card.label}
              to={card.to}
            >
              <div className="flex items-start justify-between gap-md">
                <span className={cx('grid h-10 w-10 place-items-center rounded-xl', CARD_TONES[card.tone])}>
                  <Icon aria-hidden className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <ArrowRight aria-hidden className="h-4 w-4 text-disabled transition-colors group-hover:text-brand-teal" />
              </div>
              <p className="mt-xl text-[2rem] font-light leading-none text-brand-orange">{loading ? '…' : card.value}</p>
              <p className="mt-sm text-sm font-medium text-brand-teal-deep">{card.label}</p>
              <p className="mt-xs text-xs font-light leading-relaxed text-muted">{card.detail}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-xl desktop:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-[28px] bg-white p-xl shadow-[0_16px_42px_rgba(0,47,48,0.07)]" aria-labelledby="admin-attention-title">
          <div className="flex items-center justify-between gap-md">
            <div>
              <p className="font-montserrat text-[10px] font-medium uppercase tracking-[0.16em] text-tone-orange-text">PRIORITY QUEUE</p>
              <h2 className="mt-xs text-xl font-light text-brand-teal-deep" id="admin-attention-title">What needs attention</h2>
            </div>
            <ShieldCheck aria-hidden className="h-6 w-6 text-brand-teal" strokeWidth={1.5} />
          </div>

          <div className="mt-lg grid gap-sm">
            {!loading && attentionItems.length === 0 && snapshot?.unavailable === 0 ? (
              <div className="flex items-start gap-md rounded-2xl bg-tone-green-bg p-lg">
                <BadgeCheck aria-hidden className="mt-[2px] h-5 w-5 shrink-0 text-tone-green-text" />
                <div>
                  <p className="text-sm font-medium text-ink">No projected control-plane exceptions</p>
                  <p className="mt-xs text-xs font-light text-secondary">Current server projections show no signature gaps, reconciliation findings, overdue reviews, or suspended accounts.</p>
                </div>
              </div>
            ) : null}
            {!loading && attentionItems.length === 0 && Boolean(snapshot?.unavailable) ? (
              <div className="flex items-start gap-md rounded-2xl bg-surface p-lg">
                <ShieldCheck aria-hidden className="mt-[2px] h-5 w-5 shrink-0 text-muted" />
                <div>
                  <p className="text-sm font-medium text-ink">Priority queue unavailable</p>
                  <p className="mt-xs text-xs font-light text-secondary">Sign in with an authorized administrator account, then refresh to load live exceptions. Nothing is inferred from local prototype data.</p>
                </div>
              </div>
            ) : null}
            {attentionItems.map((item) => (
              <Link className="group flex items-center justify-between gap-md rounded-2xl bg-surface px-lg py-md hover:bg-tone-orange-bg/45" key={item.label} to={item.to}>
                <div>
                  <p className="text-sm font-medium text-ink">{item.label}</p>
                  <p className="mt-xs text-xs font-light text-muted">{item.detail}</p>
                </div>
                <ArrowRight aria-hidden className="h-4 w-4 shrink-0 text-disabled group-hover:text-brand-orange" />
              </Link>
            ))}
            {loading && <p className="rounded-2xl bg-surface p-lg text-sm text-muted">Loading priority queue…</p>}
          </div>
        </section>

        <section className="rounded-[28px] bg-brand-teal-deep p-xl text-white shadow-[0_18px_46px_rgba(0,47,48,0.16)]" aria-labelledby="admin-quick-actions-title">
          <p className="font-montserrat text-[10px] font-medium uppercase tracking-[0.16em] text-[#79D2CA]">QUICK ACTIONS</p>
          <h2 className="mt-xs text-xl font-light" id="admin-quick-actions-title">Start common work</h2>
          <div className="mt-lg grid gap-sm">
            {[
              { label: 'Invite a user', to: '/admin/users?mode=provisioning', icon: UserPlus },
              { label: 'Review people', to: '/admin/users', icon: UsersRound },
              { label: 'Inspect access model', to: '/admin/user-groups', icon: KeyRound },
              { label: 'Verify signing coverage', to: '/admin/signature-coverage', icon: FileSignature },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link className="flex min-h-tap items-center justify-between gap-md rounded-2xl bg-white/10 px-md py-sm text-sm font-light transition-colors hover:bg-white/16 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60" key={action.to} to={action.to}>
                  <span className="inline-flex items-center gap-sm"><Icon aria-hidden className="h-4 w-4 text-[#79D2CA]" /> {action.label}</span>
                  <ArrowRight aria-hidden className="h-4 w-4 text-white/55" />
                </Link>
              );
            })}
          </div>
          <p className="mt-lg border-t border-white/15 pt-md text-[11px] font-light leading-relaxed text-white/65">
            High-risk mutations remain server-authorized, version-aware, and audited. This page never grants access by itself.
          </p>
        </section>
      </div>
    </section>
  );
}

export default AdminOverviewScreen;
