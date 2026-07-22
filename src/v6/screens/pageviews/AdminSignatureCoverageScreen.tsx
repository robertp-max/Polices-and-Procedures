import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FileSignature, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
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
  const { getAccessToken, isDemo, status } = useAuth();
  const canLoad = status === 'authenticated' && !isDemo;
  const [data, setData] = useState<SignatureCoverageResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const token = getAccessToken();
    if (!token) {
      setError('Live signature coverage requires an authorized administrator session.');
      setData(null);
      return;
    }
    try {
      setData(await AuthApi.getSignatureCoverage(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load signature coverage.');
      setData(null);
    }
  }, [getAccessToken]);

  useEffect(() => {
    const task = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(task);
  }, [load]);

  const capacityLabel = (value: string) => value
    .replace(/^sig[-_:]/i, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <section className="grid gap-xl" data-group="Admin" data-hash-id="admin-signature-coverage" data-route="/admin/signature-coverage" data-template="matrix">
      <div className="flex items-start gap-md rounded-2xl bg-white px-lg py-md shadow-[0_10px_30px_rgba(0,47,48,0.05)]">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-tone-teal-bg text-brand-teal"><FileSignature aria-hidden className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-medium text-brand-teal-deep">Capacity, not job title</p>
          <p className="mt-xs max-w-[820px] text-xs font-light leading-relaxed text-muted">Coverage is derived only from active, scoped signature-authority assignments. A role label or profile title never manufactures signing authority.</p>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-tone-orange-border bg-tone-orange-bg/40 p-6 text-center">
          <p className="text-sm text-secondary">{error}</p>
          {canLoad && <Button className="mt-3" size="sm" variant="secondary" onClick={() => void load()}>Retry</Button>}
        </div>
      )}

      {!data && !error && <div className="rounded-2xl border border-hairline bg-white p-8 text-sm text-muted">Loading…</div>}

      {data && (
        <>
          <div className="grid gap-md tablet-l:grid-cols-4" aria-label="Signature coverage summary">
            {([
              ['Acceptance capacities', data.qapiAcceptance.length, 'QAPI acceptance scenario'],
              ['Covered', data.qapiAcceptance.filter((capacity) => capacity.covered).length, 'At least one active holder'],
              ['Coverage gaps', data.qapiAcceptance.filter((capacity) => !capacity.covered).length, 'Needs an authority assignment'],
              ['Active holders', new Set(data.coverage.flatMap((capacity) => capacity.holders.map((holder) => holder.userId))).size, 'Unique assigned users'],
            ] as const).map(([label, value, detail]) => (
              <article className="rounded-[22px] bg-white p-lg shadow-[0_12px_32px_rgba(0,47,48,0.06)]" key={label}>
                <p className="text-2xl font-light text-brand-orange">{value}</p>
                <p className="mt-sm text-sm font-medium text-brand-teal-deep">{label}</p>
                <p className="mt-xs text-[11px] font-light text-muted">{detail}</p>
              </article>
            ))}
          </div>

          <section className="rounded-[28px] bg-white p-xl shadow-[0_16px_42px_rgba(0,47,48,0.07)]">
            <div className="flex flex-wrap items-end justify-between gap-md">
              <div>
                <h2 className="text-h3 font-medium text-brand-teal-deep">QAPI acceptance coverage</h2>
                <p className="mt-xs text-xs font-light text-muted">Concrete acceptance scenario only—not the universal signature catalog.</p>
              </div>
              <ToneTag tone={data.qapiAcceptance.every((capacity) => capacity.covered) ? 'teal' : 'orange'}>
                {data.qapiAcceptance.filter((capacity) => capacity.covered).length}/{data.qapiAcceptance.length} covered
              </ToneTag>
            </div>
            <div className="mt-lg grid gap-sm tablet-l:grid-cols-2">
              {data.qapiAcceptance.map((q) => (
                <div key={q.capacity} className={`flex items-center justify-between gap-md rounded-2xl p-md ${q.covered ? 'bg-tone-green-bg/65' : 'bg-tone-orange-bg/65'}`}>
                  <div className="flex items-center gap-sm">
                    {q.covered ? <ShieldCheck aria-hidden className="h-icon-sm w-icon-sm text-tone-green-text" /> : <ShieldAlert aria-hidden className="h-icon-sm w-icon-sm text-tone-orange-text" />}
                    <div><span className="text-sm font-medium text-ink">{capacityLabel(q.capacity)}</span><span className="mt-[2px] block text-[11px] font-light text-muted">{q.holders.length ? `${q.holders.length} active ${q.holders.length === 1 ? 'holder' : 'holders'}` : 'No active holder'}</span></div>
                  </div>
                  <ToneBadge size="sm" status={q.covered ? 'ready' : 'attention'} />
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[28px] bg-white p-xl shadow-[0_16px_42px_rgba(0,47,48,0.07)]">
            <h2 className="text-h3 font-medium text-brand-teal-deep">Capacity holders</h2>
            <p className="mt-xs text-xs font-light text-muted">Active assignments grouped by the business capacity used by server-side signing enforcement.</p>
            {data.coverage.length === 0 ? (
              <div className="mt-lg rounded-2xl bg-surface p-xl text-center">
                <p className="text-sm font-medium text-ink">No active signature-authority assignments</p>
                <p className="mt-xs text-xs font-light text-muted">Open a canonical user record and use its Signature Authority tab to add a scoped assignment.</p>
                <Link className="mt-md inline-flex items-center gap-xs text-xs font-medium text-brand-teal hover:text-brand-teal-deep" to="/admin/users">Open people <ArrowRight aria-hidden className="h-4 w-4" /></Link>
              </div>
            ) : (
              <div className="mt-lg overflow-x-auto rounded-2xl border border-hairline">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-glass text-tag uppercase tracking-tag text-muted">
                    <tr><th className="px-md py-sm">Capacity</th><th className="px-md py-sm">Holders</th></tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {data.coverage.map((c) => (
                      <tr key={c.capacity}>
                        <td className="px-md py-md font-medium text-ink">{capacityLabel(c.capacity)}</td>
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
