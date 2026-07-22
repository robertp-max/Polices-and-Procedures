/**
 * COG-2 — server-authoritative user-status control.
 *
 * This is the ONLY suspend/reactivate control that reflects real access: it
 * reads the canonical server registry (GET /api/admin/user-access) and mutates
 * it through the authoritative endpoints (POST …/suspend, …/reactivate). The
 * server verifies the Cognito actor, enforces the unified user-status authority
 * (approved-admin email OR canonical admin group), performs the registry
 * mutation, and appends an audit event. No client identity, localStorage row,
 * or demo directory participates in the decision.
 *
 * The sibling demo directory (localStorage `ci.identityRegistry.v1`) is a
 * mockup only; its "Deactivate" does NOT suspend a real login. Real suspension
 * happens here.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, LoaderCircle, RefreshCcw, Search, ShieldAlert, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthApi, AuthApiError, type UserAccessStateRow } from './api';
import { useAuth } from './AuthProvider';

type LoadState = 'idle' | 'loading' | 'ready' | 'error';

function statusTone(status: UserAccessStateRow['status']): string {
  if (status === 'suspended') return 'border-tone-orange-border bg-tone-orange-bg text-tone-orange-text';
  if (status === 'pending') return 'border-amber-300/70 bg-amber-50/80 text-amber-900';
  return 'border-tone-green-border bg-tone-green-bg text-tone-green-text';
}

/** Map an API error to a safe, non-leaking message. */
function safeError(e: unknown, fallback: string): string {
  if (e instanceof AuthApiError) {
    if (e.status === 401 || e.status === 403) return 'You do not have permission to manage user status.';
    if (e.message && !/token|secret|password|bearer/i.test(e.message)) return e.message;
  }
  return fallback;
}

export function ServerUserAccessPanel() {
  const { getAccessToken, isDemo, status } = useAuth();
  const navigate = useNavigate();
  const canOperate = status === 'authenticated' && !isDemo;

  const [rows, setRows] = useState<UserAccessStateRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [confirming, setConfirming] = useState<{ action: 'suspend' | 'reactivate'; userId: string } | null>(null);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) { setLoadState('error'); setError('No active session. Please sign in again.'); return; }
    setLoadState('loading');
    setError(null);
    try {
      const res = await AuthApi.listUserAccess(token);
      setRows(res.users ?? []);
      setLoadState('ready');
    } catch (e) {
      setLoadState('error');
      setError(safeError(e, 'The user-access service is temporarily unavailable. Please try again.'));
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (canOperate) void load();
  }, [canOperate, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...rows].sort((a, b) => a.name.localeCompare(b.name));
    if (!q) return sorted;
    return sorted.filter((r) => r.email.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
  }, [rows, query]);

  async function mutate(row: UserAccessStateRow, action: 'suspend' | 'reactivate') {
    const token = getAccessToken();
    if (!token) { setError('No active session. Please sign in again.'); return; }
    setBusyUserId(row.userId);
    setConfirming(null);
    setError(null);
    setNotice(null);
    try {
      const res = action === 'suspend'
        ? await AuthApi.suspendUser(token, row.userId)
        : await AuthApi.reactivateUser(token, row.userId);
      // Reflect the SERVER-returned status — never assume success client-side.
      setRows((prev) => prev.map((r) => (r.userId === row.userId ? { ...r, status: res.after.status } : r)));
      setNotice(`${row.email} is now ${res.after.status} (server registry).`);
    } catch (e) {
      setError(safeError(e, 'The action could not be completed. Please try again.'));
    } finally {
      setBusyUserId(null);
    }
  }

  const statusCounts = useMemo(() => ({
    active: rows.filter((row) => row.status === 'active').length,
    pending: rows.filter((row) => row.status === 'pending').length,
    suspended: rows.filter((row) => row.status === 'suspended').length,
  }), [rows]);

  return (
    <section
      className="overflow-hidden rounded-[28px] bg-white p-xl shadow-[0_16px_42px_rgba(0,47,48,0.07)]"
      aria-labelledby="server-user-access-title"
    >
      <div className="mb-lg flex items-start justify-between gap-md">
        <div className="grid gap-sm">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-tone-teal-bg text-tone-teal-text">
            <ShieldCheck aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
          <div>
            <h2 className="text-h2 font-medium text-brand-teal-deep" id="server-user-access-title">
              Canonical account directory
            </h2>
            <p className="mt-xs max-w-content text-sm text-muted">
              Search real account records, open a complete user view, or begin an audited lifecycle change.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={!canOperate || loadState === 'loading'}
          className="inline-flex min-h-tap items-center gap-xs rounded-md border border-hairline px-md text-xs font-medium text-brand-teal transition hover:bg-surface-hover disabled:opacity-50"
        >
          {loadState === 'loading'
            ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" />
            : <RefreshCcw aria-hidden="true" className="h-icon-sm w-icon-sm" />}
          Refresh
        </button>
      </div>

      {!canOperate && (
        <p className="rounded-md border border-amber-300/70 bg-amber-50/80 px-md py-sm text-sm text-amber-900" role="status">
          Server user-status controls require a real authenticated session. They are
          unavailable in local demo mode.
        </p>
      )}

      {canOperate && (
        <>
          {error && (
            <div className="mb-md rounded-md border border-tone-orange-border bg-tone-orange-bg px-md py-sm text-sm text-tone-orange-text" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="mb-md rounded-md border border-tone-green-border bg-tone-green-bg px-md py-sm text-sm text-tone-green-text" role="status">
              {notice}
            </div>
          )}

          <div className="mb-lg grid gap-sm tablet-l:grid-cols-3" aria-label="Account status summary">
            {([
              ['Active', statusCounts.active, 'bg-tone-green-bg text-tone-green-text'],
              ['Pending', statusCounts.pending, 'bg-amber-50 text-amber-900'],
              ['Suspended', statusCounts.suspended, 'bg-tone-orange-bg text-tone-orange-text'],
            ] as const).map(([label, value, tone]) => (
              <div className={`rounded-2xl px-md py-sm ${tone}`} key={label}>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] opacity-75">{label}</p>
                <p className="mt-xs text-lg font-light">{value}</p>
              </div>
            ))}
          </div>

          <label className="relative mb-md block">
            <span className="sr-only">Filter users by name or email</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-md top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name or email…"
              className="w-full rounded-2xl border border-hairline bg-surface py-sm pl-[42px] pr-md text-sm text-ink focus-visible:outline-none focus-visible:shadow-focus"
            />
          </label>

          {loadState === 'loading' && (
            <p className="px-md py-sm text-sm text-muted">Loading canonical registry…</p>
          )}

          {loadState === 'ready' && filtered.length === 0 && (
            <p className="px-md py-sm text-sm text-muted">No matching users in the server registry.</p>
          )}

          <ul className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-white">
            {filtered.map((row) => {
              const busy = busyUserId === row.userId;
              const suspended = row.status === 'suspended';
              const nextAction = suspended ? 'reactivate' : 'suspend';
              const awaitingConfirmation = confirming?.userId === row.userId && confirming.action === nextAction;
              const initials = (row.name.match(/\b\w/g) ?? []).join('').slice(0, 2).toUpperCase() || 'U';
              return (
                <li key={row.userId} className="flex flex-wrap items-center justify-between gap-md p-md transition-colors hover:bg-surface">
                  <button className="group flex min-w-0 flex-1 items-center gap-md text-left focus-visible:outline-none focus-visible:shadow-focus" onClick={() => navigate(`/admin/users/${row.userId}`)} type="button">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-tone-teal-bg text-xs font-medium text-brand-teal-deep">
                      {row.name ? initials : <UserRound aria-hidden className="h-4 w-4" />}
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-xs">
                        <span className="truncate text-sm font-medium text-ink group-hover:text-brand-teal-deep">{row.name || row.email}</span>
                        {row.privileged ? <span className="rounded-full bg-amber-50 px-xs py-[2px] text-[10px] font-medium text-amber-800">Privileged</span> : null}
                      </span>
                      <span className="block truncate text-xs text-muted">{row.email}</span>
                    </span>
                    <ChevronRight aria-hidden className="ml-auto h-4 w-4 shrink-0 text-disabled group-hover:text-brand-teal" />
                  </button>
                  <div className="flex flex-wrap items-center justify-end gap-sm">
                    <span className={`inline-flex items-center rounded-full border px-sm py-[2px] text-[11px] font-medium capitalize ${statusTone(row.status)}`}>
                      {row.status}
                    </span>
                    {awaitingConfirmation ? (
                      <>
                        <button
                          className="inline-flex min-h-tap items-center rounded-xl px-md text-xs font-medium text-muted transition hover:bg-surface-hover"
                          onClick={() => setConfirming(null)}
                          type="button"
                        >
                          Cancel
                        </button>
                        <button
                          className={`inline-flex min-h-tap items-center gap-xs rounded-xl px-md text-xs font-medium text-white transition disabled:opacity-50 ${suspended ? 'bg-brand-teal hover:bg-brand-teal-deep' : 'bg-brand-orange hover:bg-[#c94b13]'}`}
                          disabled={busy}
                          onClick={() => void mutate(row, nextAction)}
                          type="button"
                        >
                          {busy ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" /> : suspended ? <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm" /> : <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm" />}
                          Confirm {nextAction}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirming({ action: nextAction, userId: row.userId })}
                        disabled={busy}
                        className="inline-flex min-h-tap items-center gap-xs rounded-xl border border-hairline px-md text-xs font-medium text-ink transition hover:bg-surface-hover disabled:opacity-50"
                      >
                        {suspended
                          ? <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-green-text" />
                          : <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-orange-text" />}
                        {suspended ? 'Reactivate' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}

export default ServerUserAccessPanel;
