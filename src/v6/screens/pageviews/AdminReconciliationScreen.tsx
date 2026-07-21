import { useCallback, useEffect, useState } from 'react';
import { GitMerge, ShieldAlert } from 'lucide-react';
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
  const { getAccessToken } = useAuth();
  const [findings, setFindings] = useState<ReconciliationFindingsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await AuthApi.getReconciliationFindings(getAccessToken() ?? '');
      setFindings(res.findings);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load reconciliation findings.');
      setFindings(null);
    }
  }, [getAccessToken]);
  useEffect(() => { void load(); }, [load]);

  const section = (title: string, count: number, children: React.ReactNode) => (
    <section className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
      <div className="flex items-center justify-between gap-sm">
        <h2 className="text-h3 font-medium text-ink">{title}</h2>
        <ToneTag tone={count > 0 ? 'orange' : 'teal'}>{count}</ToneTag>
      </div>
      <div className="mt-md">{count > 0 ? children : <p className="text-sm text-muted">None detected.</p>}</div>
    </section>
  );

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-reconciliation" data-route="/admin/reconciliation" data-template="matrix">
      <div className="sr-only"><h1>Reconciliation</h1></div>
      <header className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
        <div className="flex items-center gap-sm">
          <GitMerge aria-hidden className="h-icon-md w-icon-md text-brand-teal" />
          <h1 className="text-xl font-medium text-brand-teal-deep">Reconciliation queue</h1>
        </div>
        <p className="mt-xs text-sm text-secondary">Server-detected identity/access anomalies requiring manual review. Nothing is auto-merged — email matches are surfaced for adjudication (ADR §B4).</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/40 p-6 text-center">
          <p className="text-sm text-secondary">{error}</p>
          <Button className="mt-3" size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>
        </div>
      )}
      {!findings && !error && <div className="rounded-2xl border border-hairline bg-white p-8 text-sm text-muted">Loading…</div>}

      {findings && (
        <>
          <div className="rounded-2xl border border-hairline bg-surface-glass p-lg">
            <div className="flex items-center gap-sm">
              <ShieldAlert aria-hidden className="h-icon-sm w-icon-sm text-tone-orange-text" />
              <p className="text-sm text-ink"><strong>{findings.summary.totalFindings}</strong> total findings requiring review.</p>
            </div>
          </div>

          {section('Duplicate emails', findings.summary.duplicateEmailGroups, (
            <ul className="grid gap-sm">
              {findings.duplicateEmails.map((d) => (
                <li key={d.normalizedEmail} className="rounded-md border border-hairline bg-surface-glass p-md text-xs">
                  <span className="text-ink">{d.normalizedEmail}</span> → {d.userIds.map((id) => <ToneTag key={id} tone="slate">{id}</ToneTag>)}
                </li>
              ))}
            </ul>
          ))}

          {section('Orphan assignments', findings.summary.orphanAssignments, (
            <ul className="grid gap-xs text-xs">
              {findings.orphanAssignments.map((o) => <li key={o.assignmentId} className="text-secondary">{o.assignmentId} → missing user <code>{o.userId}</code> ({o.groupId})</li>)}
            </ul>
          ))}

          {section('Active users without a group', findings.summary.usersWithoutActiveGroup, (
            <div className="flex flex-wrap gap-xs">{findings.usersWithoutActiveGroup.map((u) => <ToneTag key={u.userId} tone="slate">{u.email || u.userId}</ToneTag>)}</div>
          ))}

          {section('Excessive privilege (>1 privileged group)', findings.summary.excessivePrivilege, (
            <ul className="grid gap-xs text-xs">
              {findings.excessivePrivilege.map((e) => <li key={e.userId} className="text-secondary">{e.email || e.userId}: {e.privilegedGroups.join(', ')}</li>)}
            </ul>
          ))}
        </>
      )}
    </section>
  );
}

export default AdminReconciliationScreen;
