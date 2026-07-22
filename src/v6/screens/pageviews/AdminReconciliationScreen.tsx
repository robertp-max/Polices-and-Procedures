import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, GitMerge, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/auth/AuthProvider';
import { AuthApi, type ReconciliationFindingsResponse } from '@/auth/api';
import { ToneTag } from '../../components';
import { Button } from '../../primitives';

/**
 * ADR-0002 §9 / Phase 6 — reconciliation queue. Server-detected orphan
 * identities, duplicate emails, orphan assignments, and excessive-privilege
 * holders that require manual review. Read-only projection (no auto-merge).
 */
export function AdminReconciliationScreen() {
  const { getAccessToken, isDemo, status } = useAuth();
  const canLoad = status === 'authenticated' && !isDemo;
  const [findings, setFindings] = useState<ReconciliationFindingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const token = getAccessToken();
    if (!token) {
      setError('Live reconciliation findings require an authorized administrator session.');
      setFindings(null);
      return;
    }
    try {
      const res = await AuthApi.getReconciliationFindings(token);
      setFindings(res.findings);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load reconciliation findings.');
      setFindings(null);
    }
  }, [getAccessToken]);
  useEffect(() => { void load(); }, [load]);

  const section = (title: string, count: number, children: React.ReactNode) => (
    <section className="rounded-[24px] bg-white p-lg shadow-[0_12px_34px_rgba(0,47,48,0.06)]">
      <div className="flex items-center justify-between gap-sm">
        <h2 className="text-h3 font-medium text-ink">{title}</h2>
        <ToneTag tone={count > 0 ? 'orange' : 'teal'}>{count}</ToneTag>
      </div>
      <div className="mt-md">{count > 0 ? children : <p className="text-sm text-muted">None detected.</p>}</div>
    </section>
  );

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-reconciliation" data-route="/admin/reconciliation" data-template="matrix">
      <div className="flex flex-wrap items-start justify-between gap-md rounded-2xl bg-white px-lg py-md shadow-[0_10px_30px_rgba(0,47,48,0.05)]">
        <div className="flex items-start gap-md">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tone-teal-bg text-brand-teal"><GitMerge aria-hidden className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-medium text-brand-teal-deep">Manual adjudication only</p>
            <p className="mt-xs max-w-[820px] text-xs font-light leading-relaxed text-muted">Email matches and orphan records are evidence for review, never permission to auto-merge identities.</p>
          </div>
        </div>
        <Link className="inline-flex min-h-tap items-center gap-xs rounded-xl px-md text-xs font-medium text-brand-teal hover:bg-tone-teal-bg" to="/admin/users">Open people <ArrowRight aria-hidden className="h-4 w-4" /></Link>
      </div>

      {error && (
        <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/40 p-6 text-center">
          <p className="text-sm text-secondary">{error}</p>
          {canLoad && <Button className="mt-3" size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>}
        </div>
      )}
      {!findings && !error && <div className="rounded-2xl border border-hairline bg-white p-8 text-sm text-muted">Loading…</div>}

      {findings && (
        <>
          <div className="grid gap-md tablet-l:grid-cols-4" aria-label="Reconciliation summary">
            {([
              ['Total findings', findings.summary.totalFindings, 'Manual review queue'],
              ['Duplicate emails', findings.summary.duplicateEmailGroups, 'Possible identity conflicts'],
              ['Orphan records', findings.summary.orphanAssignments + findings.summary.usersWithoutActiveGroup, 'Missing user or group link'],
              ['Excess privilege', findings.summary.excessivePrivilege, 'Multiple privileged groups'],
            ] as const).map(([label, value, detail]) => (
              <article className="rounded-[22px] bg-white p-lg shadow-[0_12px_32px_rgba(0,47,48,0.06)]" key={label}>
                <p className="text-2xl font-light text-brand-orange">{value}</p>
                <p className="mt-sm text-sm font-medium text-brand-teal-deep">{label}</p>
                <p className="mt-xs text-[11px] font-light text-muted">{detail}</p>
              </article>
            ))}
          </div>

          {findings.summary.totalFindings === 0 && (
            <div className="flex items-start gap-md rounded-[24px] bg-tone-green-bg p-lg text-tone-green-text">
              <ShieldCheck aria-hidden className="mt-[2px] h-5 w-5 shrink-0" />
              <div><p className="text-sm font-medium">No reconciliation findings</p><p className="mt-xs text-xs font-light">The current projection found no duplicate emails, orphan assignments, ungrouped active users, or excessive privileged-group membership.</p></div>
            </div>
          )}

          <div className="grid gap-md desktop:grid-cols-2">
            {section('Duplicate emails', findings.summary.duplicateEmailGroups, (
              <ul className="grid gap-sm">
                {findings.duplicateEmails.map((d) => (
                  <li key={d.normalizedEmail} className="rounded-xl bg-surface p-md text-xs">
                    <span className="font-medium text-ink">{d.normalizedEmail}</span><div className="mt-sm flex flex-wrap gap-xs">{d.userIds.map((id) => <ToneTag key={id} tone="slate">{id}</ToneTag>)}</div>
                  </li>
                ))}
              </ul>
            ))}

            {section('Orphan assignments', findings.summary.orphanAssignments, (
              <ul className="grid gap-xs text-xs">
                {findings.orphanAssignments.map((o) => <li key={o.assignmentId} className="rounded-xl bg-surface p-md text-secondary"><code>{o.assignmentId}</code><span className="mt-xs block">Missing user <code>{o.userId}</code> · group {o.groupId}</span></li>)}
              </ul>
            ))}

            {section('Active users without a group', findings.summary.usersWithoutActiveGroup, (
              <div className="flex flex-wrap gap-xs">{findings.usersWithoutActiveGroup.map((u) => <ToneTag key={u.userId} tone="slate">{u.email || u.userId}</ToneTag>)}</div>
            ))}

            {section('Excessive privilege', findings.summary.excessivePrivilege, (
              <ul className="grid gap-xs text-xs">
                {findings.excessivePrivilege.map((e) => <li key={e.userId} className="rounded-xl bg-tone-orange-bg/55 p-md text-secondary"><span className="font-medium text-ink">{e.email || e.userId}</span><span className="mt-xs block">{e.privilegedGroups.join(', ')}</span></li>)}
              </ul>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export default AdminReconciliationScreen;
