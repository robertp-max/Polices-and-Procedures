import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { achcSurveyRows, type AchcMappingType, type AchcSurveyMetadata } from '@/policy/data/achcSurveyProjection.generated';

type ViewMode = 'MATRIX' | 'CROSSWALK';

interface CrosswalkRow {
  achcStandard: string;
  policyProcedure: string;
  policyNumber: string;
}

const mappingBadgeClass: Record<AchcMappingType, string> = {
  DIRECT: 'bg-[#0f766e]/10 text-[#0f766e] border-[#0f766e]/30',
  PARTIAL: 'bg-[#ea580c]/10 text-[#ea580c] border-[#ea580c]/30',
  NONE: 'bg-slate-500/10 text-slate-600 border-slate-400/30',
  SME_REVIEW: 'bg-[#f59e0b]/10 text-[#b45309] border-[#f59e0b]/30',
};

function filterPrefix(values: string[], prefix: string): boolean {
  if (prefix === 'ALL') return true;
  return values.some((value) => value.startsWith(prefix));
}

function uniqueSorted(list: string[]): string[] {
  return [...new Set(list)].sort((a, b) => a.localeCompare(b));
}

function toCrosswalkRows(rows: AchcSurveyMetadata[]): CrosswalkRow[] {
  const crosswalk: CrosswalkRow[] = [];
  for (const row of rows) {
    if (row.mappingType === 'NONE' || row.mappingType === 'SME_REVIEW') continue;
    for (const standard of row.achcStandards) {
      crosswalk.push({
        achcStandard: standard,
        policyProcedure: row.policyTitle,
        policyNumber: row.policyId,
      });
    }
  }
  return crosswalk.sort((a, b) => {
    if (a.achcStandard !== b.achcStandard) return a.achcStandard.localeCompare(b.achcStandard);
    return a.policyNumber.localeCompare(b.policyNumber);
  });
}

export function AchcSurveyAlignmentPage() {
  const [mode, setMode] = useState<ViewMode>('MATRIX');
  const [search, setSearch] = useState('');
  const [governanceFilter, setGovernanceFilter] = useState('ALL');
  const [mappingFilter, setMappingFilter] = useState<'ALL' | AchcMappingType>('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'P' | 'D' | 'I' | 'O' | 'S'>('ALL');
  const [title22Filter, setTitle22Filter] = useState('ALL');
  const [achcFilter, setAchcFilter] = useState('ALL');
  const [copFilter, setCopFilter] = useState('ALL');

  const domainOptions = useMemo(() => uniqueSorted(achcSurveyRows.map((r) => r.domain)), []);
  const title22Prefixes = useMemo(() => {
    return uniqueSorted(
      achcSurveyRows
        .flatMap((r) => r.title22)
        .map((ref) => {
          const match = ref.match(/(\d{3})/);
          return match ? match[1] : '';
        })
        .filter(Boolean),
    );
  }, []);
  const achcPrefixes = useMemo(() => {
    return uniqueSorted(
      achcSurveyRows
        .flatMap((r) => r.achcStandards)
        .map((s) => s.slice(0, 3))
        .filter(Boolean),
    );
  }, []);
  const copPrefixes = useMemo(() => {
    return uniqueSorted(
      achcSurveyRows
        .flatMap((r) => r.medicareCop)
        .map((value) => {
          const match = value.match(/(\d{3})/);
          return match ? match[1] : '';
        })
        .filter(Boolean),
    );
  }, []);

  const filteredMatrixRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return achcSurveyRows.filter((row) => {
      if (governanceFilter !== 'ALL' && row.domain !== governanceFilter) return false;
      if (mappingFilter !== 'ALL' && row.mappingType !== mappingFilter) return false;
      if (evidenceFilter !== 'ALL' && !row.evidenceCodes.includes(evidenceFilter)) return false;
      if (title22Filter !== 'ALL') {
        const matches = row.title22.some((ref) => ref.includes(title22Filter));
        if (!matches) return false;
      }
      if (!filterPrefix(row.achcStandards, achcFilter)) return false;
      if (copFilter !== 'ALL') {
        const matches = row.medicareCop.some((ref) => ref.includes(copFilter));
        if (!matches) return false;
      }
      if (!q) return true;
      const haystack = [
        row.policyId,
        row.policyTitle,
        row.corridorPolicyNo,
        row.corridorPolicyTitle,
        ...row.achcStandards,
        ...row.title22,
        ...row.medicareCop,
        row.surveyNotes,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [search, governanceFilter, mappingFilter, evidenceFilter, title22Filter, achcFilter, copFilter]);

  const filteredCrosswalkRows = useMemo(() => toCrosswalkRows(filteredMatrixRows), [filteredMatrixRows]);

  return (
    <div className="flex h-full flex-col bg-white text-[#1f2937]">
      <div className="border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-[#0f766e]" />
          <h1 className="text-xl font-semibold">ACHC Survey Alignment</h1>
          <span className="text-xs text-slate-500">Manual tagging source locked</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Toggle between the validated Phase A ACHC matrix and the Phase B ACHC crosswalk derived from it.
        </p>
      </div>

      <div className="border-b border-[#e2e8f0] px-6 py-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-[#99f6e4] bg-[#f0fdfa]">
          <button
            type="button"
            onClick={() => setMode('MATRIX')}
            className={`px-3 py-1.5 text-xs font-semibold ${mode === 'MATRIX' ? 'bg-[#0f766e] text-white' : 'text-[#0f766e]'}`}
          >
            ACHC Standard Matrix
          </button>
          <button
            type="button"
            onClick={() => setMode('CROSSWALK')}
            className={`px-3 py-1.5 text-xs font-semibold ${mode === 'CROSSWALK' ? 'bg-[#ea580c] text-white' : 'text-[#ea580c]'}`}
          >
            ACHC Crosswalk
          </button>
        </div>
      </div>

      <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-3">
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6">
          <select value={governanceFilter} onChange={(e) => setGovernanceFilter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
            <option value="ALL">Governance: ALL</option>
            {domainOptions.map((domain) => <option key={domain} value={domain}>{domain}</option>)}
          </select>
          <select value={mappingFilter} onChange={(e) => setMappingFilter(e.target.value as 'ALL' | AchcMappingType)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
            <option value="ALL">ALL Mapping Status</option>
            <option value="DIRECT">DIRECT</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="NONE">NONE</option>
            <option value="SME_REVIEW">SME_REVIEW</option>
          </select>
          <select value={evidenceFilter} onChange={(e) => setEvidenceFilter(e.target.value as 'ALL' | 'P' | 'D' | 'I' | 'O' | 'S')} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
            <option value="ALL">Evidence: ALL</option>
            <option value="P">P</option>
            <option value="D">D</option>
            <option value="I">I</option>
            <option value="O">O</option>
            <option value="S">S</option>
          </select>
          <select value={title22Filter} onChange={(e) => setTitle22Filter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
            <option value="ALL">CA Title 22: ALL</option>
            {title22Prefixes.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
          </select>
          <select value={achcFilter} onChange={(e) => setAchcFilter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
            <option value="ALL">ACHC HH Standards: ALL</option>
            {achcPrefixes.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
          </select>
          <select value={copFilter} onChange={(e) => setCopFilter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
            <option value="ALL">Medicare CoP: ALL</option>
            {copPrefixes.map((prefix) => <option key={prefix} value={prefix}>{prefix}</option>)}
          </select>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policy, corridor row, ACHC standard, citation..."
          className="mt-2 w-full rounded border border-[#cbd5e1] px-3 py-1.5 text-sm focus:border-[#0f766e] focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
        {mode === 'MATRIX' ? (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#cbd5e1] text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Policy/Procedure</th>
                <th className="px-2 py-2">Evidence</th>
                <th className="px-2 py-2">California Title 22</th>
                <th className="px-2 py-2">ACHC Standard</th>
                <th className="px-2 py-2">Medicare CoP</th>
                <th className="px-2 py-2">Mapping Status</th>
                <th className="px-2 py-2">View Policy</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrixRows.map((row) => (
                <tr key={row.policyId} className="border-b border-[#e2e8f0] align-top">
                  <td className="px-2 py-2">
                    <div className="font-mono text-[11px] text-slate-500">{row.policyId}</div>
                    <div className="font-medium text-slate-800">{row.policyTitle}</div>
                  </td>
                  <td className="px-2 py-2">{row.evidenceCodes.join(', ') || '—'}</td>
                  <td className="px-2 py-2">{row.title22.join('; ') || '—'}</td>
                  <td className="px-2 py-2">{row.achcStandards.join('; ') || '—'}</td>
                  <td className="px-2 py-2">{row.medicareCop.join('; ') || '—'}</td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold ${mappingBadgeClass[row.mappingType]}`}>
                      {row.mappingType}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <Link to={`/surveyor/policy/${encodeURIComponent(row.policyId)}`} className="rounded bg-[#0f766e] px-2 py-1 text-[11px] font-semibold text-white hover:bg-[#115e59]">
                      View Policy
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#cbd5e1] text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">ACHC Standard</th>
                <th className="px-2 py-2">Policy/Procedure</th>
                <th className="px-2 py-2">Policy #</th>
              </tr>
            </thead>
            <tbody>
              {filteredCrosswalkRows.map((row, index) => (
                <tr key={`${row.achcStandard}-${row.policyNumber}-${index}`} className="border-b border-[#e2e8f0]">
                  <td className="px-2 py-2 font-semibold text-[#0f766e]">{row.achcStandard}</td>
                  <td className="px-2 py-2 text-slate-800">{row.policyProcedure}</td>
                  <td className="px-2 py-2 font-mono text-slate-600">{row.policyNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AchcSurveyAlignmentPage;
