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
import { LoaderCircle, RefreshCcw, ShieldAlert, ShieldCheck } from 'lucide-react';
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
  const canOperate = status === 'authenticated' && !isDemo;

  const [rows, setRows] = useState<UserAccessStateRow[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

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

  return (
    <section
      className="rounded-lg border border-tone-teal-border bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl overflow-hidden shadow-rest"
      aria-labelledby="server-user-access-title"
    >
      <div className="mb-lg flex items-start justify-between gap-md">
        <div className="grid gap-sm">
          <span className="grid h-tap w-tap place-items-center rounded-md bg-tone-teal-bg text-tone-teal-text">
            <ShieldCheck aria-hidden="true" className="h-icon-md w-icon-md" />
          </span>
          <div>
            <h2 className="text-h2 font-medium text-ink" id="server-user-access-title">
              User status (server-authoritative)
            </h2>
            <p className="mt-xs max-w-content text-sm text-muted">
              Suspend or reactivate a real login. Actions call the audited server
              endpoint and reflect the canonical registry — not the demo directory above.
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

          <label className="mb-md block">
            <span className="sr-only">Filter users by name or email</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by name or email…"
              className="w-full rounded-md border border-hairline bg-white px-md py-sm text-sm text-ink focus-visible:outline-none focus-visible:shadow-focus"
            />
          </label>

          {loadState === 'loading' && (
            <p className="px-md py-sm text-sm text-muted">Loading canonical registry…</p>
          )}

          {loadState === 'ready' && filtered.length === 0 && (
            <p className="px-md py-sm text-sm text-muted">No matching users in the server registry.</p>
          )}

          <ul className="divide-y divide-hairline rounded-md border border-hairline bg-surface-glass">
            {filtered.map((row) => {
              const busy = busyUserId === row.userId;
              const suspended = row.status === 'suspended';
              return (
                <li key={row.userId} className="flex flex-wrap items-center justify-between gap-md p-md">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">{row.name || row.email}</p>
                    <p className="truncate text-xs text-muted">
                      {row.email}
                      {row.privileged ? <span className="ml-xs text-amber-700">· privileged</span> : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-sm">
                    <span className={`inline-flex items-center rounded-full border px-sm py-[2px] text-[11px] font-medium capitalize ${statusTone(row.status)}`}>
                      {row.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => void mutate(row, suspended ? 'reactivate' : 'suspend')}
                      disabled={busy}
                      className="inline-flex min-h-tap items-center gap-xs rounded-md border border-hairline px-md text-xs font-medium text-ink transition hover:bg-surface-hover disabled:opacity-50"
                    >
                      {busy
                        ? <LoaderCircle aria-hidden="true" className="h-icon-sm w-icon-sm animate-spin" />
                        : suspended
                          ? <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-green-text" />
                          : <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm text-tone-orange-text" />}
                      {suspended ? 'Reactivate' : 'Suspend'}
                    </button>
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
