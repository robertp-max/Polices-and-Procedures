import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/auth/AuthProvider';
import { AuthApi, type SignatureCoverageResponse } from '@/auth/api';
import { ToneTag } from '../../components';
import { Button, ToneBadge } from '../../primitives';

/**
 * ADR-0002 §9 / Phase 6 — enterprise signature-coverage view.
 *
 * Server-authoritative: which users hold each business signature capacity, and
 * whether the QAPI acceptance set (DON / Administrator / Compliance Officer /
 * Governing Body Chair) is covered. Renders server data; never reconstructs it.
 */
export function AdminSignatureCoverageScreen() {
  const { getAccessToken } = useAuth();
  const [data, setData] = useState<SignatureCoverageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await AuthApi.getSignatureCoverage(getAccessToken() ?? ''));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load signature coverage.');
      setData(null);
    }
  }, [getAccessToken]);

  useEffect(() => { void load(); }, [load]);

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-signature-coverage" data-route="/admin/signature-coverage" data-template="matrix">
      <div className="sr-only"><h1>Signature Coverage</h1></div>
      <header className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
        <h1 className="text-xl font-medium text-brand-teal-deep">Signature coverage</h1>
        <p className="mt-xs text-sm text-secondary">Server-authoritative view of who holds each business signature capacity. Coverage is derived from active signature-authority assignments only.</p>
      </header>

      {error && (
        <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/40 p-6 text-center">
          <p className="text-sm text-secondary">{error}</p>
          <Button className="mt-3" size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>
        </div>
      )}

      {!data && !error && <div className="rounded-2xl border border-hairline bg-white p-8 text-sm text-muted">Loading…</div>}

      {data && (
        <>
          <section className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
            <h2 className="text-h3 font-medium text-ink">QAPI acceptance set</h2>
            <p className="mt-xs text-xs text-muted">The ADR §5 concrete acceptance case (not the universal catalog).</p>
            <div className="mt-md grid gap-sm tablet-l:grid-cols-2">
              {data.qapiAcceptance.map((q) => (
                <div key={q.capacity} className="flex items-center justify-between gap-md rounded-lg border border-hairline bg-surface-glass p-md">
                  <div className="flex items-center gap-sm">
                    {q.covered ? <ShieldCheck aria-hidden className="h-icon-sm w-icon-sm text-tone-green-text" /> : <ShieldAlert aria-hidden className="h-icon-sm w-icon-sm text-tone-orange-text" />}
                    <span className="text-sm text-ink">{q.capacity}</span>
                  </div>
                  <ToneBadge size="sm" status={q.covered ? 'ready' : 'attention'} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-hairline bg-white p-lg shadow-sm">
            <h2 className="text-h3 font-medium text-ink">Capacity holders</h2>
            {data.coverage.length === 0 ? (
              <p className="mt-sm text-sm text-muted">No active signature-authority assignments yet. Grant assignments from a user's Signature Authority tab.</p>
            ) : (
              <div className="mt-md overflow-x-auto rounded-lg border border-hairline">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-glass text-tag uppercase tracking-tag text-muted">
                    <tr><th className="px-md py-sm">Capacity</th><th className="px-md py-sm">Holders</th></tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {data.coverage.map((c) => (
                      <tr key={c.capacity}>
                        <td className="px-md py-sm text-ink">{c.capacity}</td>
                        <td className="px-md py-sm">
                          <div className="flex flex-wrap gap-xs">
                            {c.holders.map((h) => <ToneTag key={h.userId} tone="slate">{h.userId}</ToneTag>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </section>
  );
}

export default AdminSignatureCoverageScreen;
