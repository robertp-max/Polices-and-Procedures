import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BadgeCheck, ClipboardList, FileSignature, GraduationCap,
  KeyRound, LayoutGrid, ShieldAlert, ShieldCheck, UserRound,
} from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { AuthApi, type EffectiveAccessProjection, type PageAccessProjectionResponse, type SignatureAuthorityAssignmentRow } from '@/auth/api';
import { ToneTag } from '../../components';
import { Button, ToneBadge } from '../../primitives';
import { cx } from '../../utils/classNames';
import { workspaceCompactTabClass, workspaceTabActiveClass, workspaceTabInactiveClass } from './workspaceTabChrome';

/**
 * ADR-0002 Phase 6 — Admin control-plane USER DETAIL surface (/admin/users/:userId).
 *
 * Server-authoritative by design (ADR §10): identity, account status, and the
 * suspend/reactivate lifecycle come from the COG-2 user-access API + the Phase-2
 * durable engine — never localStorage. Domains whose server projection is a later
 * phase (effective permissions §3, page access §4, signature authority §5) render
 * as explicit "server projection pending" panels rather than fake controls, per
 * the ADR's evidence-honesty rule. IA follows ADR §F:
 *   Overview · Account & Organization · Access · Signature Authority ·
 *   Onboarding & Competency · Audit History.
 */

type AccountStatus = 'active' | 'pending' | 'suspended';

interface AccessUserRow {
  userId: string;
  email: string;
  name: string;
  status: AccountStatus;
  roles?: string[];
  privileged?: boolean;
  provider?: string;
  authSubject?: string;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: UserRound },
  { id: 'account', label: 'Account & Organization', icon: ClipboardList },
  { id: 'access', label: 'Access', icon: LayoutGrid },
  { id: 'signature', label: 'Signature Authority', icon: FileSignature },
  { id: 'onboarding', label: 'Onboarding & Competency', icon: GraduationCap },
  { id: 'audit', label: 'Audit History', icon: BadgeCheck },
] as const;
type TabId = (typeof TABS)[number]['id'];

const STATUS_TONE: Record<AccountStatus, 'active' | 'pending' | 'locked'> = {
  active: 'active',
  pending: 'pending',
  suspended: 'locked',
};

/** A domain whose server-authoritative projection ships in a later ADR phase.
 *  Shown honestly rather than backed by non-authoritative browser state. */
function PendingProjection({ phase, title, detail, state = 'pending' }: { phase: string; title: string; detail: string; state?: 'pending' | 'unavailable' }) {
  return (
    <div className="rounded-lg border border-dashed border-hairline bg-surface-glass/60 p-lg">
      <div className="flex items-center gap-sm">
        <ShieldAlert aria-hidden className="h-icon-sm w-icon-sm text-muted" />
        <p className="text-sm font-medium text-ink">{title}</p>
        <span className="rounded-full border border-hairline bg-surface px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-muted">
          {phase} · server projection {state}
        </span>
      </div>
      <p className="mt-sm text-xs text-secondary">{detail}</p>
    </div>
  );
}

export function AdminUserDetailScreen() {
  const { userId = '' } = useParams();
  const navigate = useNavigate();
  const { getAccessToken } = useAuth();

  const [tab, setTab] = useState<TabId>('overview');
  const [rows, setRows] = useState<AccessUserRow[] | null>(null);
  const [effAccess, setEffAccess] = useState<EffectiveAccessProjection | null>(null);
  const [pageAccess, setPageAccess] = useState<PageAccessProjectionResponse | null>(null);
  const [sigAuthority, setSigAuthority] = useState<SignatureAuthorityAssignmentRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionNote, setActionNote] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [confirming, setConfirming] = useState<null | 'suspend' | 'reactivate'>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const token = getAccessToken() ?? '';
      const res = await AuthApi.listUserAccess(token);
      setRows((res as { users: AccessUserRow[] }).users ?? []);
      // Phase 3/4: server-computed effective access for this target (best-effort;
      // a failure here must not blank the whole detail page).
      try {
        const ea = await AuthApi.getUserEffectiveAccess(token, userId);
        setEffAccess(ea.effectiveAccess);
      } catch {
        setEffAccess(null);
      }
      try {
        const pa = await AuthApi.getUserPageAccess(token, userId);
        setPageAccess(pa.pageAccess);
      } catch {
        setPageAccess(null);
      }
      try {
        const sa = await AuthApi.getUserSignatureAuthority(token, userId);
        setSigAuthority(sa.assignments);
      } catch {
        setSigAuthority(null);
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Unable to load the server user directory.');
      setRows([]);
    }
  }, [getAccessToken, userId]);

  useEffect(() => { void load(); }, [load]);

  const user = useMemo(() => rows?.find((r) => r.userId === userId) ?? null, [rows, userId]);

  const runLifecycle = useCallback(async (action: 'suspend' | 'reactivate') => {
    setConfirming(null);
    setBusy(true);
    setActionNote(null);
    try {
      const token = getAccessToken() ?? '';
      if (action === 'suspend') await AuthApi.suspendUser(token, userId);
      else await AuthApi.reactivateUser(token, userId);
      setActionNote({ kind: 'ok', text: `Server-authoritative ${action} committed. Global deny is now enforced across login, refresh, routes, and signing.` });
      await load();
    } catch (e) {
      // Hard-cut design: if the durable lifecycle store is not provisioned the
      // server returns 503 and NEVER falls back to a canonical-only mutation.
      const msg = e instanceof Error ? e.message : `${action} failed.`;
      const code = (e as { code?: string })?.code;
      const hardCut = code === 'ACCOUNT_LIFECYCLE_MUTATION_UNAVAILABLE';
      setActionNote({
        kind: 'err',
        text: hardCut
          ? 'Durable lifecycle store is not provisioned in this environment. Suspension is unavailable by design (hard cut) — it will not silently fall back to the broken canonical-only path. Provision the durable store to enable it.'
          : msg,
      });
    } finally {
      setBusy(false);
    }
  }, [getAccessToken, userId, load]);

  const shell = (children: React.ReactNode) => (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-user-detail" data-route="/admin/users/:userId" data-template="detail">
      <button
        type="button"
        onClick={() => navigate('/admin/users')}
        className="inline-flex w-fit items-center gap-xs text-sm font-medium text-brand-teal transition hover:text-brand-teal-deep focus-visible:outline-none focus-visible:shadow-focus"
      >
        <ArrowLeft aria-hidden className="h-icon-sm w-icon-sm" /> Back to Users
      </button>
      {children}
    </section>
  );

  if (loadError && !user) {
    return shell(
      <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/40 p-8 text-center">
        <h2 className="text-lg font-medium text-ink">Couldn't load this user</h2>
        <p className="mt-2 text-sm text-secondary">{loadError}</p>
        <Button className="mt-4" size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>
      </div>,
    );
  }

  if (!rows) {
    return shell(<div className="rounded-2xl border border-hairline bg-white p-8 text-sm text-muted">Loading server user directory…</div>);
  }

  if (!user) {
    return shell(
      <div className="rounded-2xl border border-hairline bg-white p-8 text-center">
        <h2 className="text-lg font-medium text-ink">User not found</h2>
        <p className="mt-2 text-sm text-secondary">No canonical user <code className="text-xs">{userId}</code> in the server registry.</p>
      </div>,
    );
  }

  const initials = (user.name.match(/\b\w/g) || []).join('').slice(0, 2).toUpperCase() || 'U';
  const roles = user.roles ?? [];

  return shell(
    <>
      {/* Identity header */}
      <header className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-lg">
          <div className="flex items-center gap-md">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand-teal/10 text-lg font-medium text-brand-teal-deep ring-1 ring-inset ring-brand-teal/20">
              {initials}
            </div>
            <div>
              <h2 className="text-xl font-medium text-brand-teal-deep">{user.name}</h2>
              <p className="text-sm text-secondary">{user.email}</p>
              <p className="mt-xs text-[11px] text-muted">canonical id <code className="text-[11px]">{user.userId}</code></p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-sm">
            <ToneBadge size="sm" status={STATUS_TONE[user.status]} />
            {user.privileged && <ToneTag tone="amber">Privileged</ToneTag>}
            <span className="rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-tone-teal-text">
              Server-authoritative
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav aria-label="User detail sections" className="flex max-w-full items-stretch overflow-x-auto font-montserrat">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cx(workspaceCompactTabClass, tab === t.id ? workspaceTabActiveClass : workspaceTabInactiveClass, 'inline-flex items-center gap-xs')}
          >
            <t.icon aria-hidden className="h-icon-xs w-icon-xs" /> {t.label}
          </button>
        ))}
      </nav>

      {/* Panels */}
      {tab === 'overview' && (
        <div className="grid gap-lg">
          <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-4" aria-label="User control-plane summary">
            {[
              {
                label: 'Account status',
                value: user.status[0].toUpperCase() + user.status.slice(1),
                detail: 'Global lifecycle authority',
                icon: user.status === 'active' ? ShieldCheck : ShieldAlert,
                tone: user.status === 'suspended' ? 'bg-tone-orange-bg text-tone-orange-text' : 'bg-tone-green-bg text-tone-green-text',
              },
              {
                label: 'Effective permissions',
                value: effAccess ? String(effAccess.permissions.length) : '—',
                detail: effAccess ? effAccess.policyVersion : 'Projection unavailable',
                icon: KeyRound,
                tone: 'bg-tone-teal-bg text-tone-teal-text',
              },
              {
                label: 'Visible pages',
                value: pageAccess ? `${pageAccess.pages.filter((page) => page.visible).length}/${pageAccess.pages.length}` : '—',
                detail: 'Non-authorizing visibility',
                icon: LayoutGrid,
                tone: 'bg-surface text-secondary',
              },
              {
                label: 'Signing capacities',
                value: sigAuthority ? String(sigAuthority.filter((assignment) => assignment.status === 'active').length) : '—',
                detail: 'Active scoped assignments',
                icon: FileSignature,
                tone: 'bg-tone-orange-bg text-tone-orange-text',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article className="rounded-[22px] bg-white p-lg shadow-[0_12px_32px_rgba(0,47,48,0.06)]" key={item.label}>
                  <span className={cx('grid h-9 w-9 place-items-center rounded-xl', item.tone)}><Icon aria-hidden className="h-4 w-4" /></span>
                  <p className="mt-lg text-2xl font-light text-brand-orange">{item.value}</p>
                  <p className="mt-sm text-sm font-medium text-brand-teal-deep">{item.label}</p>
                  <p className="mt-xs text-[11px] font-light text-muted">{item.detail}</p>
                </article>
              );
            })}
          </div>
          {(!effAccess || !pageAccess || !sigAuthority) && (
            <div className="rounded-2xl border border-hairline bg-surface px-lg py-md text-xs font-light text-secondary" role="status">
              One or more server projections could not be loaded. Available values remain authoritative; unavailable values stay marked with an em dash.
            </div>
          )}
        </div>
      )}

      {tab === 'account' && (
        <div className="grid gap-lg">
          <div className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
            <h2 className="text-h3 font-medium text-ink">Account &amp; Organization</h2>
            <dl className="mt-md grid gap-md tablet-l:grid-cols-2">
              {[
                ['Canonical user id', user.userId],
                ['Email (mutable alias)', user.email],
                ['Provider', user.provider ?? 'cognito'],
                ['Account status', user.status],
                ['Security groups', roles.length ? roles.join(', ') : '—'],
                ['Privileged', user.privileged ? 'Yes' : 'No'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-lg border border-hairline bg-surface-glass p-md">
                  <dt className="text-tag uppercase tracking-tag text-muted">{k}</dt>
                  <dd className="mt-xs text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Server-authoritative lifecycle actions */}
          <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/30 p-lg">
            <div className="flex items-center gap-sm">
              <ShieldAlert aria-hidden className="h-icon-sm w-icon-sm text-tone-orange-text" />
              <h2 className="text-h3 font-medium text-ink">Account lifecycle</h2>
            </div>
            <p className="mt-sm text-sm text-secondary">
              Suspend/reactivate are <strong>server-authoritative</strong> and orchestrate the durable global deny
              (canonical → Cognito disable + session revoke → registration). Canonical-only suspension is not suspension.
            </p>
            {actionNote && (
              <div className={cx('mt-md rounded-md border px-md py-sm text-sm', actionNote.kind === 'ok' ? 'border-tone-green-border bg-tone-green-bg text-tone-green-text' : 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text')} role="status">
                {actionNote.text}
              </div>
            )}
            {confirming ? (
              <div className="mt-md rounded-md border border-hairline bg-white p-md">
                <p className="text-sm text-ink">
                  Confirm <strong>{confirming}</strong> for {user.name}? This is a server-authorized, audited action.
                </p>
                <div className="mt-sm flex flex-wrap gap-sm">
                  <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirming(null)}>Cancel</Button>
                  <Button size="sm" className="border-brand-orange bg-brand-orange text-on-brand hover:bg-brand-orange/95" disabled={busy} onClick={() => void runLifecycle(confirming)}>
                    {busy ? 'Working…' : `Confirm ${confirming}`}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-md flex flex-wrap gap-sm">
                <Button size="sm" variant="secondary" disabled={busy || user.status === 'suspended'} onClick={() => setConfirming('suspend')}>Suspend</Button>
                <Button size="sm" variant="secondary" disabled={busy || user.status === 'active'} onClick={() => setConfirming('reactivate')}>Reactivate</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'access' && (
        <div className="grid gap-lg">
          <div className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
            <h2 className="text-h3 font-medium text-ink">Security groups</h2>
            <p className="mt-sm text-xs text-muted">Group membership from the canonical registry projection.</p>
            <div className="mt-md flex flex-wrap gap-sm">
              {roles.length ? roles.map((r) => <ToneTag key={r} tone={user.privileged ? 'amber' : 'slate'}>{r}</ToneTag>) : <span className="text-sm text-muted">No active group assignments.</span>}
            </div>
          </div>
          {effAccess ? (
            <div className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <h2 className="text-h3 font-medium text-ink">Effective permissions</h2>
                <span className="rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-tone-teal-text">
                  server-computed · {effAccess.policyVersion}
                </span>
              </div>
              <p className="mt-xs text-xs text-muted">
                Expanded from active security groups by the server evaluator (ADR §B5).
                {effAccess.accountActive ? '' : ' Account not active — all permissions withheld (fail-closed).'}
              </p>
              <div className="mt-md flex flex-wrap gap-sm">
                {effAccess.permissions.length
                  ? effAccess.permissions.map((p) => <ToneTag key={p} tone="teal">{p}</ToneTag>)
                  : <span className="text-sm text-muted">No effective permissions.</span>}
              </div>
            </div>
          ) : (
            <PendingProjection phase="Phase 3" state="unavailable" title="Effective permissions" detail="Server evaluator projection is unavailable (not loaded)." />
          )}
          {pageAccess ? (
            <div className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <h2 className="text-h3 font-medium text-ink">Page access <span className="text-sm font-normal text-muted">(visibility projection)</span></h2>
                <span className="rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-tone-teal-text">
                  server-derived · non-authorizing · {pageAccess.pages.filter((p) => p.visible).length}/{pageAccess.pages.length} visible
                </span>
              </div>
              <p className="mt-xs text-xs text-muted">
                Hiding a page is never security — every API authorizes independently (ADR §B6).
              </p>
              <div className="mt-md max-h-80 overflow-y-auto rounded-lg border border-hairline">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-surface-glass text-tag uppercase tracking-tag text-muted">
                    <tr><th className="px-md py-sm">Page</th><th className="px-md py-sm">Access</th><th className="px-md py-sm">Reason</th></tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {pageAccess.pages.map((p) => (
                      <tr key={p.pageId} className={p.visible ? '' : 'opacity-55'}>
                        <td className="px-md py-sm text-ink">{p.label}</td>
                        <td className="px-md py-sm"><ToneTag tone={p.access === 'write' ? 'teal' : p.access === 'read' ? 'slate' : 'orange'}>{p.access}</ToneTag></td>
                        <td className="px-md py-sm font-mono text-[10px] text-secondary">{p.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <PendingProjection phase="Phase 4" state="unavailable" title="Page access (visibility projection)" detail="Server-generated, non-authorizing page projection with deny reasons. Hiding a page is never security; every API authorizes independently." />
          )}
          <PendingProjection phase="Phase 3" title="Administrator capabilities" detail="Granular admin capabilities evaluated server-side, distinct from business permissions and page visibility." />
        </div>
      )}

      {tab === 'signature' && (
        <div className="grid gap-lg">
          <div className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
            <h2 className="text-h3 font-medium text-ink">Signature authority</h2>
            <p className="mt-sm text-sm text-secondary">Two independent axes (ADR §B7):</p>
            <ul className="mt-sm grid gap-xs text-sm text-ink">
              <li><strong>Workflow participation</strong> — Assignee · Required Signer · Approver · Reviewer · Watcher · Administrator · Auditor</li>
              <li><strong>Business capacity</strong> — DON · Administrator · Compliance Officer · Governing Body Chair · Supervisor · clinician · witness</li>
            </ul>
          </div>
          {sigAuthority ? (
            <div className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <h2 className="text-h3 font-medium text-ink">Signature capacities</h2>
                <span className="rounded-full border border-tone-teal-border bg-tone-teal-bg px-sm py-[2px] text-[10px] font-medium uppercase tracking-wider text-tone-teal-text">
                  server-authoritative · {sigAuthority.filter((a) => a.status === 'active').length} active
                </span>
              </div>
              {sigAuthority.length === 0 ? (
                <p className="mt-sm text-sm text-muted">
                  No signature-authority assignments. This user is least-privilege and cannot sign until an active
                  assignment is granted (fail-closed). eCIgn enforcement is keyed to the verified actor, never client input.
                </p>
              ) : (
                <div className="mt-md overflow-x-auto rounded-lg border border-hairline">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-glass text-tag uppercase tracking-tag text-muted">
                      <tr><th className="px-md py-sm">Capacity</th><th className="px-md py-sm">Basis</th><th className="px-md py-sm">Scope</th><th className="px-md py-sm">Effective</th><th className="px-md py-sm">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {sigAuthority.map((a) => (
                        <tr key={a.assignmentId} className={a.status === 'active' ? '' : 'opacity-55'}>
                          <td className="px-md py-sm text-ink">{a.signatureRoleId}</td>
                          <td className="px-md py-sm text-secondary">{a.authorityBasis}</td>
                          <td className="px-md py-sm text-secondary">{a.scope.organizationId}{a.scope.branchId ? ` / ${a.scope.branchId}` : ''}</td>
                          <td className="px-md py-sm text-secondary">{a.effectiveFrom.slice(0, 10)}{a.effectiveUntil ? ` → ${a.effectiveUntil.slice(0, 10)}` : ''}</td>
                          <td className="px-md py-sm"><ToneTag tone={a.status === 'active' ? 'teal' : a.status === 'revoked' ? 'orange' : 'slate'}>{a.status}</ToneTag></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <p className="mt-md text-xs text-muted">
                Capacities are derived from forms/workflows/policies/eCIgn (never job titles); unknown labels fail closed.
                Enforcement for delegation, prerequisites, and separation of duties remains fail-closed; remaining direct-path wiring is tracked separately.
              </p>
            </div>
          ) : (
            <PendingProjection phase="Phase 5" state="unavailable" title="Signature capacities, scope & delegation" detail="Server signature-authority assignments unavailable (not loaded)." />
          )}
        </div>
      )}

      {tab === 'onboarding' && (
        <PendingProjection phase="Phase 6/7" title="Onboarding & competency" detail="Onboarding track and competency/license clearance as domain profiles keyed to the canonical user — surfaced read-only here and used as signing prerequisites in Phase 5." />
      )}

      {tab === 'audit' && (
        <PendingProjection phase="Phase 6" title="Audit history" detail="Per-user enterprise audit timeline (lifecycle transitions, access changes, signature actions) via the audit read endpoint, referencing the eCIgn hash chain where applicable." />
      )}
    </>,
  );
}

export default AdminUserDetailScreen;
