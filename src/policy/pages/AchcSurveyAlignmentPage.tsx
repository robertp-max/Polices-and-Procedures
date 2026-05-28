import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, ShieldCheck, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import {
  achcSurveyByPolicyId,
  achcSurveyRows,
  type AchcMappingType,
  type AchcSurveyMetadata,
} from '@/policy/data/achcSurveyProjection.generated';
import { corridorAlignment } from '@/policy/data/corridorAlignment.generated';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { PolicyViewer32 } from '@/policy/components/policy-viewer/PolicyViewer32';
import {
  formatAnchorRefsForDisplay,
  toAnchoredAchcMapping,
  type AchcSupportRef,
} from '@/policy/data/achcSupportAnchors';
import { canResolveAchcStandardTarget, splitAchcStandards } from '@/policy/data/achcStandardTargetResolver';
import {
  hhEvidenceRows,
  type HhEvidenceConfidence,
  type HhEvidenceMatchType,
  type HhEvidenceRow,
} from '@/policy/data/achcHhEvidenceMap';

type ViewMode = 'EVIDENCE' | 'MATRIX' | 'CROSSWALK';

interface CrosswalkRow {
  achcStandard: string;
  policyId: string;
  policyProcedure: string;
  policyNumber: string;
  hasPendingPageAnchor: boolean;
  supportRefs: AchcSupportRef[];
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

/** Citations shown in UI — only strings present in repo data or policy section text (no fabrication). */
interface EvidenceRegulatoryCitations {
  title22: string[];
  medicareCop: string[];
  /** Where the row’s citation lists came from (for technical details only). */
  sources: string[];
}

function classifyCitationLine(s: string): 'TITLE22' | 'FEDERAL' | null {
  const u = s.toUpperCase();
  if (u.includes('22 CCR') || u.includes('TITLE 22')) return 'TITLE22';
  if (u.includes('42 CFR') || /\b1904\.|1910\./.test(s)) return 'FEDERAL';
  return null;
}

/** Pull markdown link labels and table-like citation cells from a single section body. */
function extractCitationsFromSectionBody(body: string): { title22: string[]; medicareCop: string[] } {
  const title22: string[] = [];
  const medicareCop: string[] = [];

  for (const line of body.split('\n')) {
    const trimmed = line.trim();
    const md = trimmed.match(/^-\s*\[([^\]]+)\]\([^)]*\)\s*$/);
    if (md) {
      const label = md[1].trim();
      const kind = classifyCitationLine(label);
      if (kind === 'TITLE22') title22.push(label);
      else if (kind === 'FEDERAL') medicareCop.push(label);
      continue;
    }
    if (trimmed.startsWith('|') && trimmed.includes('|')) {
      const parts = trimmed.split('|').map((p) => p.trim());
      for (const cell of parts) {
        if (!cell || cell === ':----' || /^:?-+:?$/.test(cell)) continue;
        const kind = classifyCitationLine(cell);
        if (kind === 'TITLE22') title22.push(cell);
        else if (kind === 'FEDERAL') medicareCop.push(cell);
      }
    }
  }

  return { title22: uniqueSorted(title22), medicareCop: uniqueSorted(medicareCop) };
}

function getEvidenceRegulatoryCitations(row: HhEvidenceRow): EvidenceRegulatoryCitations {
  const sources: string[] = [];
  const corridor = corridorAlignment[row.policyId];
  const achcMeta = achcSurveyByPolicyId[row.policyId];

  const t22FromCorridor = corridor?.crosswalk?.title22?.filter(Boolean) ?? [];
  const copFromCorridor = corridor?.crosswalk?.cop?.filter(Boolean) ?? [];

  if (t22FromCorridor.length || copFromCorridor.length) {
    sources.push('corridorAlignment.crosswalk');
    return {
      title22: uniqueSorted(t22FromCorridor),
      medicareCop: uniqueSorted(copFromCorridor),
      sources,
    };
  }

  const t22FromAchc = achcMeta?.title22?.filter(Boolean) ?? [];
  const copFromAchc = achcMeta?.medicareCop?.filter(Boolean) ?? [];
  if (t22FromAchc.length || copFromAchc.length) {
    sources.push('achcSurveyProjection');
    return {
      title22: uniqueSorted(t22FromAchc),
      medicareCop: uniqueSorted(copFromAchc),
      sources,
    };
  }

  const content = getPolicyContent(row.policyId);
  const section = content?.sections?.find((s) => s.id === row.sectionId);
  if (section?.body) {
    const extracted = extractCitationsFromSectionBody(section.body);
    if (extracted.title22.length || extracted.medicareCop.length) {
      sources.push(`policySection:${row.sectionId}`);
      return { ...extracted, sources };
    }
  }

  return { title22: [], medicareCop: [], sources: [] };
}

function evidenceRowKey(row: HhEvidenceRow): string {
  return `${row.hhStandard}::${row.policyId}::${row.sectionId}`;
}

function toCrosswalkRows(rows: AchcSurveyMetadata[]): CrosswalkRow[] {
  const crosswalk: CrosswalkRow[] = [];
  for (const row of rows) {
    const anchored = toAnchoredAchcMapping(row);
    if (anchored.mappingType === 'NONE' || anchored.mappingType === 'SME_REVIEW') continue;
    for (const standard of anchored.achcStandard) {
      crosswalk.push({
        achcStandard: standard,
        policyId: anchored.policyId,
        policyProcedure: anchored.policyTitle,
        policyNumber: formatAnchorRefsForDisplay(
          anchored.supportRefs.filter((ref) => ref.status === 'VALIDATED' && ref.pageRef !== 'ANCHOR_REVIEW_REQUIRED'),
        ),
        hasPendingPageAnchor: anchored.supportRefs.some(
          (ref) => ref.status === 'ANCHOR_REVIEW_REQUIRED' || ref.pageRef === 'ANCHOR_REVIEW_REQUIRED',
        ),
        supportRefs: anchored.supportRefs,
      });
    }
  }
  return crosswalk.sort((a, b) => {
    if (a.achcStandard !== b.achcStandard) return a.achcStandard.localeCompare(b.achcStandard);
    return a.policyNumber.localeCompare(b.policyNumber);
  });
}

export function AchcSurveyAlignmentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewerPolicyId, setViewerPolicyId] = useState<string | null>(null);
  const [, setViewerSource] = useState<'ACHC_MATRIX' | 'ACHC_CROSSWALK' | 'ACHC_LIBRARY'>('ACHC_LIBRARY');
  const [, setActiveHhGroup] = useState<string>('ALL');
  const [, setHighlightedAnchorRef] = useState<string | undefined>(undefined);
  const [, setSelectedAchcStandard] = useState<string | undefined>(undefined);
  const [anchorNotice, setAnchorNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>('EVIDENCE');
  const [search, setSearch] = useState('');
  const [governanceFilter, setGovernanceFilter] = useState('ALL');
  const [mappingFilter, setMappingFilter] = useState<'ALL' | AchcMappingType>('ALL');
  const [evidenceFilter, setEvidenceFilter] = useState<'ALL' | 'P' | 'D' | 'I' | 'O' | 'S'>('ALL');
  const [title22Filter, setTitle22Filter] = useState('ALL');
  const [achcFilter, setAchcFilter] = useState('ALL');
  const [copFilter, setCopFilter] = useState('ALL');
  const [evidenceHhFilter, setEvidenceHhFilter] = useState('ALL');
  const [evidencePolicyFilter, setEvidencePolicyFilter] = useState('ALL');
  const [evidenceConfidenceFilter, setEvidenceConfidenceFilter] = useState<'ALL' | HhEvidenceConfidence>('ALL');
  const [evidenceMatchTypeFilter, setEvidenceMatchTypeFilter] = useState<'ALL' | HhEvidenceMatchType>('ALL');
  const [evidenceGovernanceFilter, setEvidenceGovernanceFilter] = useState('ALL');
  const [evidenceSearch, setEvidenceSearch] = useState('');
  /** HH standard group key → collapsed (rows hidden). */
  const [evidenceHhCollapsed, setEvidenceHhCollapsed] = useState<Record<string, boolean>>({});
  /** Per-row technical details expanded. */
  const [evidenceTechOpen, setEvidenceTechOpen] = useState<Record<string, boolean>>({});

  const evidenceMatchTypeOptions: HhEvidenceMatchType[] = ['EXACT_HH_TEXT', 'ACHC_CONTEXT', 'CORRIDOR_CONTEXT', 'POLICY_CONTEXT'];
  const evidenceConfidenceOptions: HhEvidenceConfidence[] = ['HIGH', 'MEDIUM', 'LOW'];

  const modeFromQuery = (value: string | null): ViewMode => {
    if (value === 'matrix') return 'MATRIX';
    if (value === 'crosswalk') return 'CROSSWALK';
    return 'EVIDENCE';
  };
  const modeToQuery = (value: ViewMode): string => {
    if (value === 'MATRIX') return 'matrix';
    if (value === 'CROSSWALK') return 'crosswalk';
    return 'hh-evidence';
  };

  useEffect(() => {
    const targetMode = modeFromQuery(searchParams.get('view'));
    if (targetMode !== mode) {
      setMode(targetMode);
    }
  }, [mode, searchParams]);

  useEffect(() => {
    const current = searchParams.get('view');
    if (!current) {
      const next = new URLSearchParams(searchParams);
      next.set('view', 'hh-evidence');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const setModeWithQuery = (nextMode: ViewMode) => {
    setMode(nextMode);
    const next = new URLSearchParams(searchParams);
    next.set('view', modeToQuery(nextMode));
    setSearchParams(next, { replace: true });
  };

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
  const evidenceHhOptions = useMemo(() => uniqueSorted(hhEvidenceRows.map((row) => row.hhStandard)), []);
  const evidencePolicyOptions = useMemo(() => uniqueSorted(hhEvidenceRows.map((row) => row.policyId)), []);
  const evidenceGovernanceOptions = useMemo(() => uniqueSorted(hhEvidenceRows.map((row) => row.governanceDomain)), []);

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
  const filteredEvidenceRows = useMemo(() => {
    const q = evidenceSearch.trim().toLowerCase();
    return hhEvidenceRows.filter((row) => {
      if (evidenceHhFilter !== 'ALL' && row.hhStandard !== evidenceHhFilter) return false;
      if (evidencePolicyFilter !== 'ALL' && row.policyId !== evidencePolicyFilter) return false;
      if (evidenceConfidenceFilter !== 'ALL' && row.confidence !== evidenceConfidenceFilter) return false;
      if (evidenceMatchTypeFilter !== 'ALL' && row.matchType !== evidenceMatchTypeFilter) return false;
      if (evidenceGovernanceFilter !== 'ALL' && row.governanceDomain !== evidenceGovernanceFilter) return false;
      if (!q) return true;
      const haystack = [row.hhStandard, row.policyId, row.policyTitle, row.sectionTitle, row.supportingContent]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [
    evidenceSearch,
    evidenceHhFilter,
    evidencePolicyFilter,
    evidenceConfidenceFilter,
    evidenceMatchTypeFilter,
    evidenceGovernanceFilter,
  ]);
  const evidenceGroups = useMemo(() => {
    const grouped = new Map<string, HhEvidenceRow[]>();
    for (const row of filteredEvidenceRows) {
      if (!grouped.has(row.hhStandard)) grouped.set(row.hhStandard, []);
      grouped.get(row.hhStandard)!.push(row);
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hhStandard, rows]) => ({
        hhStandard,
        rows: rows.sort((a, b) => {
          if (a.policyId !== b.policyId) return a.policyId.localeCompare(b.policyId);
          return a.sectionTitle.localeCompare(b.sectionTitle);
        }),
      }));
  }, [filteredEvidenceRows]);
  const openViewerFromRecord = (
    record: AchcSurveyMetadata,
    source: 'ACHC_MATRIX' | 'ACHC_CROSSWALK',
    anchorRef?: string,
    standard?: string,
  ) => {
    setViewerPolicyId(record.policyId);
    setViewerSource(source);
    setActiveHhGroup('ALL');
    setHighlightedAnchorRef(anchorRef);
    setSelectedAchcStandard(standard);
  };
  const openViewerFromEvidence = (row: HhEvidenceRow) => {
    setViewerPolicyId(row.policyId);
    setViewerSource('ACHC_LIBRARY');
    setActiveHhGroup('ALL');
    setHighlightedAnchorRef(undefined);
    setSelectedAchcStandard(undefined);
    setAnchorNotice('Anchor wiring pending');
    window.setTimeout(() => setAnchorNotice(null), 2200);
  };

  function getPolicyNumberMeta(supportRefs: AchcSupportRef[]) {
    const validated = supportRefs.filter((ref) => ref.status === 'VALIDATED' && ref.pageRef !== 'ANCHOR_REVIEW_REQUIRED');
    return {
      jumpRef: validated[0]?.pageRef,
      label: validated.length ? formatAnchorRefsForDisplay(validated) : '—',
      hasPendingPageAnchor: supportRefs.some(
        (ref) => ref.status === 'ANCHOR_REVIEW_REQUIRED' || ref.pageRef === 'ANCHOR_REVIEW_REQUIRED',
      ),
    };
  }
  const confidenceClass: Record<HhEvidenceConfidence, string> = {
    HIGH: 'border-[#0f766e]/30 bg-[#0f766e]/10 text-[#0f766e]',
    MEDIUM: 'border-[#ea580c]/35 bg-[#ea580c]/10 text-[#ea580c]',
    LOW: 'border-red-500/35 bg-red-500/10 text-red-700',
  };
  const matchTypeClass: Record<HhEvidenceMatchType, string> = {
    EXACT_HH_TEXT: 'border-[#0f766e]/25 bg-[#0f766e]/5 text-[#0f766e]',
    ACHC_CONTEXT: 'border-[#2563eb]/25 bg-[#2563eb]/5 text-[#1d4ed8]',
    CORRIDOR_CONTEXT: 'border-[#7c3aed]/25 bg-[#7c3aed]/5 text-[#6d28d9]',
    POLICY_CONTEXT: 'border-[#0f766e]/25 bg-[#14b8a6]/10 text-[#0f766e]',
    REVIEW_REQUIRED: 'border-red-500/30 bg-red-500/10 text-red-700',
  };

  return (
    <div className="relative flex h-full flex-col bg-white text-[#1f2937]">
      <div className="border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex items-center gap-3">
          <ShieldCheck size={22} className="text-[#0f766e]" />
          <h1 className="text-xl font-semibold">ACHC Survey Alignment</h1>
          <span className="text-xs text-slate-500">Manual tagging source locked</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Surveyor evidence explorer for HH standard support, with matrix and crosswalk retained as secondary views.
        </p>
      </div>

      <div className="border-b border-[#e2e8f0] px-6 py-3">
        <div className="inline-flex overflow-hidden rounded-lg border border-[#99f6e4] bg-[#f0fdfa]">
          <button
            type="button"
            onClick={() => setModeWithQuery('EVIDENCE')}
            className={`px-3 py-1.5 text-xs font-semibold ${mode === 'EVIDENCE' ? 'bg-[#0f766e] text-white' : 'text-[#0f766e]'}`}
          >
            ACHC HH Evidence
          </button>
          <button
            type="button"
            onClick={() => setModeWithQuery('MATRIX')}
            className={`px-3 py-1.5 text-xs font-semibold ${mode === 'MATRIX' ? 'bg-[#0f766e] text-white' : 'text-[#0f766e]'}`}
          >
            ACHC Standard Matrix
          </button>
          <button
            type="button"
            onClick={() => setModeWithQuery('CROSSWALK')}
            className={`px-3 py-1.5 text-xs font-semibold ${mode === 'CROSSWALK' ? 'bg-[#ea580c] text-white' : 'text-[#ea580c]'}`}
          >
            ACHC Crosswalk
          </button>
        </div>
      </div>

      {mode === 'EVIDENCE' ? (
        <div className="border-b border-[#e2e8f0] bg-[#f8fafc] px-6 py-3">
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3 xl:grid-cols-6">
            <select value={evidenceHhFilter} onChange={(e) => setEvidenceHhFilter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
              <option value="ALL">HH Standard: ALL</option>
              {evidenceHhOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={evidencePolicyFilter} onChange={(e) => setEvidencePolicyFilter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
              <option value="ALL">Policy ID: ALL</option>
              {evidencePolicyOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={evidenceConfidenceFilter} onChange={(e) => setEvidenceConfidenceFilter(e.target.value as 'ALL' | HhEvidenceConfidence)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
              <option value="ALL">Confidence: ALL</option>
              {evidenceConfidenceOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={evidenceMatchTypeFilter} onChange={(e) => setEvidenceMatchTypeFilter(e.target.value as 'ALL' | HhEvidenceMatchType)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
              <option value="ALL">Match Type: ALL</option>
              {evidenceMatchTypeOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <select value={evidenceGovernanceFilter} onChange={(e) => setEvidenceGovernanceFilter(e.target.value)} className="rounded border border-[#cbd5e1] px-2 py-1.5 text-xs">
              <option value="ALL">Governance Domain: ALL</option>
              {evidenceGovernanceOptions.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            <div className="rounded border border-[#cbd5e1] bg-white px-2 py-1.5 text-[11px] text-slate-600">
              Rows: <span className="font-semibold text-slate-800">{filteredEvidenceRows.length}</span>
            </div>
          </div>
          <input
            value={evidenceSearch}
            onChange={(e) => setEvidenceSearch(e.target.value)}
            placeholder="Search HH standard, policy ID, section title, supporting content..."
            className="mt-2 w-full rounded border border-[#cbd5e1] px-3 py-1.5 text-sm focus:border-[#0f766e] focus:outline-none"
          />
        </div>
      ) : (
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
      )}

      <div className="flex-1 overflow-auto px-6 py-4">
        {mode === 'EVIDENCE' ? (
          /* MVP-P1-A11Y-004 (Wave 4) — tree ARIA on the ACHC evidence hierarchy.
             Outer container = role="tree". Each HH-standard section is a
             level-1 treeitem with aria-expanded; its rows are level-2
             treeitems inside a role="group". aria-level / aria-posinset /
             aria-setsize provide positional context for screen readers
             without changing visible layout or keyboard focus model.
             Full roving-tabindex keyboard nav is tracked separately (A11Y-006
             targets PolicyLinkSelector first; tree-roving is a follow-on). */
          <div
            className="space-y-4"
            role="tree"
            aria-label="ACHC evidence hierarchy by HH standard"
            aria-orientation="vertical"
          >
            {evidenceGroups.map((group, groupIdx) => {
              const groupCollapsed = !!evidenceHhCollapsed[group.hhStandard];
              return (
              <section
                key={group.hhStandard}
                className="rounded-xl border border-[#bae6fd] bg-white shadow-sm"
                role="treeitem"
                aria-expanded={!groupCollapsed}
                aria-level={1}
                aria-posinset={groupIdx + 1}
                aria-setsize={evidenceGroups.length}
                aria-label={`HH standard ${group.hhStandard}, ${group.rows.length} mapped section${group.rows.length === 1 ? '' : 's'}`}
              >
                <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-[#e2e8f0] bg-[#ecfeff] px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() =>
                      setEvidenceHhCollapsed((prev) => ({
                        ...prev,
                        [group.hhStandard]: !prev[group.hhStandard],
                      }))
                    }
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                    aria-expanded={!groupCollapsed}
                  >
                    {groupCollapsed ? (
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-[#0f766e]" aria-hidden />
                    )}
                    <span className="inline-flex items-center rounded-full border border-[#0f766e]/40 bg-[#0f766e]/15 px-2.5 py-1 text-xs font-bold tracking-tight text-[#0f766e]">
                      {group.hhStandard}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600">
                      {group.rows.length} mapped section{group.rows.length === 1 ? '' : 's'}
                    </span>
                  </button>
                </div>
                {!groupCollapsed && (
                <div className="divide-y divide-[#e2e8f0]" role="group">
                  {group.rows.map((row, rowIdx) => {
                    const rowKey = evidenceRowKey(row);
                    const techOpen = !!evidenceTechOpen[rowKey];
                    const cites = getEvidenceRegulatoryCitations(row);
                    const surveyMeta = achcSurveyByPolicyId[row.policyId];
                    const matrixTagsThisHh = surveyMeta?.achcStandards?.includes(row.hhStandard) ?? false;
                    const chipLimit = 5;
                    const fedShown = cites.medicareCop.slice(0, chipLimit);
                    const t22Shown = cites.title22.slice(0, chipLimit);
                    const fedExtra = cites.medicareCop.length - fedShown.length;
                    const t22Extra = cites.title22.length - t22Shown.length;

                    return (
                    <div
                      key={rowKey}
                      className="border-l-2 border-transparent px-3 py-3 transition-colors hover:border-[#0f766e]/40 hover:bg-[#f8fafc]"
                      role="treeitem"
                      aria-level={2}
                      aria-posinset={rowIdx + 1}
                      aria-setsize={group.rows.length}
                      aria-expanded={techOpen}
                      aria-label={`${row.policyId} — ${row.sectionTitle}`}
                    >
                    <button
                      type="button"
                      onClick={() => openViewerFromEvidence(row)}
                      className="w-full rounded-lg border border-transparent text-left outline-none ring-[#0f766e]/20 hover:border-[#99f6e4] hover:bg-white focus-visible:ring-2"
                      title="Open policy in viewer (section anchor wiring pending)"
                    >
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[200px_minmax(280px,1fr)_minmax(220px,0.9fr)_minmax(200px,1fr)]">
                        <div className="space-y-1.5">
                          <div>
                            <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold ${confidenceClass[row.confidence]}`}>
                              {row.confidence}
                            </span>
                          </div>
                          <div>
                            <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold ${matchTypeClass[row.matchType]}`}>
                              {row.matchType}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-mono text-[11px] font-semibold text-[#0f766e]">{row.policyId}</div>
                          <div className="text-sm font-semibold leading-snug text-slate-800">{row.policyTitle}</div>
                          <div className="text-xs font-medium leading-snug text-slate-700">{row.sectionTitle}</div>
                          {matrixTagsThisHh ? (
                            <p className="text-[10px] leading-normal text-slate-500">
                              ACHC matrix row includes this HH standard for this policy.
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col gap-1.5 lg:items-end lg:text-right">
                          <div className="flex w-full flex-wrap justify-start gap-1 lg:justify-end">
                            {fedShown.map((c) => (
                              <span
                                key={`fed-${rowKey}-${c}`}
                                className="inline-block max-w-full truncate rounded-full border border-[#0d9488]/35 bg-[#ccfbf1] px-2 py-0.5 text-[10px] font-medium text-[#0f766e]"
                                title={c}
                              >
                                {c}
                              </span>
                            ))}
                            {t22Shown.map((c) => (
                              <span
                                key={`t22-${rowKey}-${c}`}
                                className="inline-block max-w-full truncate rounded-full border border-[#ea580c]/40 bg-[#ffedd5] px-2 py-0.5 text-[10px] font-medium text-[#c2410c]"
                                title={c}
                              >
                                {c}
                              </span>
                            ))}
                            {!fedShown.length && !t22Shown.length ? (
                              <span className="text-[10px] text-slate-400">No Title 22 / 42 CFR strings in mapped sources.</span>
                            ) : null}
                          </div>
                          {(fedExtra > 0 || t22Extra > 0) && (
                            <span className="text-[10px] text-slate-500">
                              {fedExtra > 0 ? `+${fedExtra} Medicare CoP / 42 CFR` : ''}
                              {fedExtra > 0 && t22Extra > 0 ? ' · ' : ''}
                              {t22Extra > 0 ? `+${t22Extra} Title 22` : ''}
                              {' '}
                              (expand technical details)
                            </span>
                          )}
                        </div>
                        <div className="min-h-[3.25rem]">
                          <p className="line-clamp-4 whitespace-pre-wrap break-words text-xs leading-relaxed text-slate-700">
                            {row.supportingContent}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 border-t border-dashed border-[#e2e8f0] pt-2">
                        <span className="text-[10px] font-medium text-[#0f766e]/80">Click row to open supporting section in policy viewer</span>
                        <span className="text-[10px] text-slate-400" aria-hidden>→</span>
                      </div>
                    </button>
                    <div className="mt-1 border-t border-[#f1f5f9] pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEvidenceTechOpen((prev) => ({ ...prev, [rowKey]: !prev[rowKey] }));
                        }}
                        className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                        aria-expanded={techOpen}
                      >
                        {techOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />}
                        Technical details
                      </button>
                      {techOpen ? (
                        <div className="mt-1 space-y-1.5 rounded border border-[#e2e8f0] bg-[#f8fafc] px-2 py-2 font-mono text-[10px] leading-relaxed text-slate-600">
                          <div>
                            <span className="font-semibold text-slate-500">section_id</span>{' '}
                            <span className="break-all text-slate-800">{row.sectionId}</span>
                          </div>
                          {row.notes?.trim() ? (
                            <div>
                              <span className="font-semibold text-slate-500">notes</span>
                              <div className="mt-0.5 whitespace-pre-wrap break-words text-slate-700">{row.notes}</div>
                            </div>
                          ) : null}
                          {cites.sources.length ? (
                            <div>
                              <span className="font-semibold text-slate-500">citation_source</span>{' '}
                              <span className="break-all">{cites.sources.join(' → ')}</span>
                            </div>
                          ) : null}
                          {cites.medicareCop.length ? (
                            <div>
                              <span className="font-semibold text-slate-500">Medicare CoP / 42 CFR (from sources)</span>
                              <ul className="mt-0.5 list-inside list-disc">
                                {cites.medicareCop.map((c) => (
                                  <li key={c} className="break-words">{c}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                          {cites.title22.length ? (
                            <div>
                              <span className="font-semibold text-slate-500">California Title 22 (from sources)</span>
                              <ul className="mt-0.5 list-inside list-disc">
                                {cites.title22.map((c) => (
                                  <li key={c} className="break-words">{c}</li>
                                ))}
                              </ul>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    </div>
                    );
                  })}
                </div>
                )}
              </section>
              );
            })}
            {!evidenceGroups.length && (
              <div className="rounded border border-[#e2e8f0] bg-white px-4 py-8 text-center text-sm text-slate-500">
                No evidence rows match the current filters.
              </div>
            )}
          </div>
        ) : mode === 'MATRIX' ? (
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#cbd5e1] text-left text-[11px] uppercase tracking-wide text-slate-500">
                <th className="px-2 py-2">Policy/Procedure</th>
                <th className="px-2 py-2">Policy #</th>
                <th className="px-2 py-2">Evidence</th>
                <th className="px-2 py-2">California Title 22</th>
                <th className="px-2 py-2">ACHC Standard</th>
                <th className="px-2 py-2">Medicare CoP</th>
                <th className="px-2 py-2">Mapping Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatrixRows.map((row) => (
                <tr key={row.policyId} className="border-b border-[#e2e8f0] align-top">
                  <td className="px-2 py-2">
                    <button
                      type="button"
                      onClick={() => openViewerFromRecord(row, 'ACHC_MATRIX')}
                      className="block text-left hover:underline"
                    >
                      <div className="font-mono text-[11px] text-[#0f766e]">{row.policyId}</div>
                      <div className="font-medium text-slate-800">{row.policyTitle}</div>
                    </button>
                  </td>
                  <td className="px-2 py-2 font-mono text-[11px] text-[#0f766e]">
                    {(() => {
                      const anchored = toAnchoredAchcMapping(row);
                      const policyNumberMeta = getPolicyNumberMeta(anchored.supportRefs);
                      return (
                        <div className="flex flex-col gap-0.5">
                          {policyNumberMeta.jumpRef ? (
                            <button
                              type="button"
                              onClick={() => openViewerFromRecord(row, 'ACHC_MATRIX', policyNumberMeta.jumpRef)}
                              className="text-left hover:underline"
                            >
                              {policyNumberMeta.label}
                            </button>
                          ) : (
                            <span className="text-slate-500">{policyNumberMeta.label}</span>
                          )}
                          {policyNumberMeta.hasPendingPageAnchor && (
                            <span className="font-roboto text-[10px] text-slate-500">Page anchor pending</span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-2 py-2">{row.evidenceCodes.join(', ') || '—'}</td>
                  <td className="px-2 py-2">{row.title22.join('; ') || '—'}</td>
                  <td className="px-2 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      {splitAchcStandards(row.achcStandards).map((standard) => {
                        const canJump = canResolveAchcStandardTarget(row.policyId, standard, row.surveyNotes);
                        if (!canJump) {
                          return (
                            <span
                              key={standard}
                              title="Anchor pending"
                              className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                            >
                              {standard}
                            </span>
                          );
                        }
                        return (
                          <button
                            key={standard}
                            type="button"
                            onClick={() => openViewerFromRecord(row, 'ACHC_MATRIX', undefined, standard)}
                            className="inline-flex items-center rounded-full border border-[#ea580c]/35 bg-[#ea580c]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ea580c] hover:bg-[#ea580c]/20"
                            title={`Open ${row.policyId} and jump to ${standard}`}
                          >
                            {standard}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-2 py-2">{row.medicareCop.join('; ') || '—'}</td>
                  <td className="px-2 py-2">
                    <span className={`inline-flex rounded border px-2 py-0.5 text-[10px] font-semibold ${mappingBadgeClass[row.mappingType]}`}>
                      {row.mappingType}
                    </span>
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
                  <td className="px-2 py-2">
                    {(() => {
                      const policy = achcSurveyRows.find((entry) => entry.policyId === row.policyId);
                      const canJump = policy
                        ? canResolveAchcStandardTarget(policy.policyId, row.achcStandard, policy.surveyNotes)
                        : false;
                      if (!policy || !canJump) {
                        return (
                          <span
                            title="Anchor pending"
                            className="inline-flex items-center rounded-full border border-slate-300 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                          >
                            {row.achcStandard}
                          </span>
                        );
                      }
                      return (
                        <button
                          type="button"
                          onClick={() => openViewerFromRecord(policy, 'ACHC_CROSSWALK', undefined, row.achcStandard)}
                          className="inline-flex items-center rounded-full border border-[#ea580c]/35 bg-[#ea580c]/10 px-2 py-0.5 text-[10px] font-semibold text-[#ea580c] hover:bg-[#ea580c]/20"
                          title={`Open ${row.policyId} and jump to ${row.achcStandard}`}
                        >
                          {row.achcStandard}
                        </button>
                      );
                    })()}
                  </td>
                  <td className="px-2 py-2 text-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        const policy = achcSurveyRows.find((entry) => entry.policyId === row.policyId);
                        if (!policy) return;
                        const jumpRef = row.supportRefs.find((ref) => ref.status === 'VALIDATED')?.pageRef;
                        openViewerFromRecord(policy, 'ACHC_CROSSWALK', jumpRef);
                      }}
                      className="text-left hover:underline"
                    >
                      {row.policyProcedure}
                    </button>
                  </td>
                  <td className="px-2 py-2 font-mono text-[#0f766e]">
                    <div className="flex flex-col gap-0.5">
                      {(() => {
                        const policy = achcSurveyRows.find((entry) => entry.policyId === row.policyId);
                        const policyNumberMeta = getPolicyNumberMeta(row.supportRefs);
                        if (!policy) return null;
                        if (!policyNumberMeta.jumpRef) {
                          return <span className="text-slate-500">{policyNumberMeta.label}</span>;
                        }
                        return (
                          <button
                            type="button"
                            onClick={() => openViewerFromRecord(policy, 'ACHC_CROSSWALK', policyNumberMeta.jumpRef)}
                            className="text-left hover:underline"
                          >
                            {policyNumberMeta.label}
                          </button>
                        );
                      })()}
                      {row.hasPendingPageAnchor && (
                        <span className="font-roboto text-[10px] text-slate-500">Page anchor pending</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewerPolicyId && (
        <div className="absolute inset-0 z-[120] bg-black/35 backdrop-blur-[1px] p-2 md:p-4">
          <div className="relative mx-auto h-full w-full rounded-2xl bg-white shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setViewerPolicyId(null);
                setHighlightedAnchorRef(undefined);
                setSelectedAchcStandard(undefined);
              }}
              className="absolute left-3 top-3 z-[130] inline-flex items-center gap-1 rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <X size={14} /> Close
            </button>
            {anchorNotice && (
              <div className="absolute right-3 top-3 z-[130] rounded-full border border-[#ea580c]/35 bg-[#fff7ed] px-3 py-1.5 text-[11px] font-semibold text-[#c2410c]">
                {anchorNotice}
              </div>
            )}

            <div className="h-full overflow-hidden rounded-2xl">
              <PolicyViewer32
                policyId={viewerPolicyId}
                embedded
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AchcSurveyAlignmentPage;
