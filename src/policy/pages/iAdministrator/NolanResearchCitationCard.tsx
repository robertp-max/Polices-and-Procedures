/* Renders Nolan's public research as an attributed "Public Regulatory Research
   Appendix" inside the Brad UI. Nolan output is ALWAYS untrusted external content
   and is labelled as such; if citations/timestamps are missing it is marked
   UNVERIFIED. It never offers an action button — Nolan research cannot trigger
   CAP/PIP/disciplinary/admin/code actions (those require Brad's internal
   validation + human approval elsewhere).

   NOTE: provided as a ready-to-mount, dependency-free unit (the interactive Brad
   UI was pruned on the `evidence` branch). */

export interface ResearchSource {
  title: string;
  publisher: string;
  url: string;
  sourceTier: 'official' | 'primary' | 'peer-reviewed' | 'vendor' | 'other';
  retrievedAt: string;
  publishedAt?: string;
}

export interface NolanResearchCitationCardProps {
  answer: string;
  sources: ResearchSource[];
  verified: boolean;
  warnings?: string[];
}

const TIER_LABEL: Record<ResearchSource['sourceTier'], string> = {
  official: 'Official', primary: 'Primary', 'peer-reviewed': 'Peer-reviewed', vendor: 'Vendor', other: 'Other',
};

export function NolanResearchCitationCard({ answer, sources, verified, warnings = [] }: NolanResearchCitationCardProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800">
      <header className="mb-2 flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Public Regulatory Research Appendix</h3>
        <span className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
          Nolan · untrusted external
        </span>
      </header>

      {!verified && (
        <p className="mb-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          UNVERIFIED — no citations/retrieval timestamps were returned. Do not rely on this without primary-source confirmation.
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="mb-2 list-disc pl-5 text-xs text-rose-700">
          {warnings.map((w, i) => <li key={i}>{w}</li>)}
        </ul>
      )}

      <p className="whitespace-pre-line text-slate-700">{answer}</p>

      {sources.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">Sources</p>
          <ul className="space-y-1.5">
            {sources.map((s, i) => (
              <li key={i} className="flex flex-wrap items-center gap-2">
                <span className="rounded border border-slate-300 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600">{TIER_LABEL[s.sourceTier]}</span>
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-teal-700 hover:underline">{s.title}</a>
                <span className="text-xs text-slate-500">— {s.publisher}</span>
                <span className="text-[11px] text-slate-400">retrieved {new Date(s.retrievedAt).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default NolanResearchCitationCard;
