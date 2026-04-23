import { Fragment, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  SlidersHorizontal,
  ShieldCheck,
  ShieldX,
  X,
} from 'lucide-react';
import { useShellStore } from '@/policy/stores/uiStore';
import { remapForLight } from '@/policy/utils/lightColorRemap';
import {
  loadMasterControlInventorySeed,
  MASTER_CONTROL_CATEGORIES,
} from '@/policy/data/masterControlInventory';
import type {
  ControlRisk,
  ControlStatus,
  MasterControlCategory,
  MasterControlItem,
} from '@/policy/types/masterControlInventory';

type RiskFilter = 'ALL' | ControlRisk;
type StatusFilter = 'ALL' | ControlStatus;
type SortField = 'id' | 'controlName' | 'category' | 'domain' | 'requiredOwner' | 'riskLevel' | 'status';
type SortDirection = 'asc' | 'desc';

const RISK_ORDER: Record<ControlRisk, number> = { HIGH: 3, MATERIAL: 2, LOW: 1 };
const STATUS_ORDER: Record<ControlStatus, number> = { deficient: 3, unknown: 2, active: 1 };

function formatControlCode(id: number): string {
  return `CTRL-${String(id).padStart(3, '0')}`;
}

function riskTone(risk: ControlRisk, isLight: boolean) {
  if (risk === 'HIGH') {
    const c = remapForLight('#EF4444', isLight);
    return { color: c, background: `${c}1A`, border: `1px solid ${c}44` };
  }
  if (risk === 'MATERIAL') {
    const c = remapForLight('#F59E0B', isLight);
    return { color: c, background: `${c}1A`, border: `1px solid ${c}44` };
  }
  const c = remapForLight('#06B6D4', isLight);
  return { color: c, background: `${c}18`, border: `1px solid ${c}44` };
}

function statusTone(status: ControlStatus, isLight: boolean) {
  if (status === 'deficient') {
    const c = remapForLight('#EF4444', isLight);
    return { color: c, background: `${c}1A`, border: `1px solid ${c}44` };
  }
  if (status === 'active') {
    const c = remapForLight('#10B981', isLight);
    return { color: c, background: `${c}1A`, border: `1px solid ${c}44` };
  }
  const c = remapForLight('#F59E0B', isLight);
  return { color: c, background: `${c}18`, border: `1px solid ${c}44` };
}

function StatCard({
  label,
  value,
  hint,
  color,
  isLight,
}: {
  label: string;
  value: number;
  hint?: string;
  color: string;
  isLight: boolean;
}) {
  const tone = remapForLight(color, isLight);
  return (
    <div
      className="rounded-xl border px-3 py-2.5"
      style={{
        borderColor: `${tone}44`,
        background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)',
      }}
    >
      <p className="text-[9px] font-montserrat font-bold uppercase tracking-[0.14em]" style={{ color: tone }}>
        {label}
      </p>
      <p className="mt-1 font-outfit text-[24px] leading-none" style={{ color: tone }}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-[10px] font-roboto opacity-70">{hint}</p> : null}
    </div>
  );
}

function ControlBadge({
  value,
  type,
  isLight,
}: {
  value: ControlRisk | ControlStatus;
  type: 'risk' | 'status';
  isLight: boolean;
}) {
  const tone = type === 'risk' ? riskTone(value as ControlRisk, isLight) : statusTone(value as ControlStatus, isLight);
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-montserrat font-bold uppercase tracking-[0.1em]"
      style={tone}
    >
      {value}
    </span>
  );
}

function sortControls(items: MasterControlItem[], field: SortField, direction: SortDirection): MasterControlItem[] {
  const sorted = [...items].sort((a, b) => {
    if (field === 'id') return a.id - b.id;
    if (field === 'riskLevel') return RISK_ORDER[a.riskLevel] - RISK_ORDER[b.riskLevel];
    if (field === 'status') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    return a[field].localeCompare(b[field]);
  });
  return direction === 'asc' ? sorted : sorted.reverse();
}

export function MasterControlInventory() {
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';

  const [controls, setControls] = useState<MasterControlItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<'ALL' | MasterControlCategory>('ALL');
  const [domain, setDomain] = useState('ALL');
  const [risk, setRisk] = useState<RiskFilter>('ALL');
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [highRiskOnly, setHighRiskOnly] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);
  const [sortField, setSortField] = useState<SortField>('riskLevel');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedControl, setSelectedControl] = useState<MasterControlItem | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      setLoading(true);
      const seed = await loadMasterControlInventorySeed();
      if (!mounted) return;
      if (!seed.length) {
        setError('Control inventory source is unavailable. Verify the seed dataset path.');
      }
      setControls(seed);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const domainOptions = useMemo(
    () => ['ALL', ...Array.from(new Set(controls.map(item => item.domain))).sort()],
    [controls],
  );

  const filteredSortedControls = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = controls.filter(item => {
      if (category !== 'ALL' && item.category !== category) return false;
      if (domain !== 'ALL' && item.domain !== domain) return false;
      if (risk !== 'ALL' && item.riskLevel !== risk) return false;
      if (status !== 'ALL' && item.status !== status) return false;
      if (highRiskOnly && !item.highRiskIfMissing) return false;
      if (!term) return true;
      const blob = [
        item.controlName,
        item.description,
        item.domain,
        item.requiredOwner,
        item.regulatoryBasis,
        item.sourcePolicyIds.join(' '),
      ]
        .join(' ')
        .toLowerCase();
      return blob.includes(term);
    });
    return sortControls(filtered, sortField, sortDirection);
  }, [category, controls, domain, highRiskOnly, risk, search, sortDirection, sortField, status]);

  const groupedControls = useMemo(() => {
    if (!groupByCategory) return [];
    return MASTER_CONTROL_CATEGORIES.map(group => ({
      group,
      items: filteredSortedControls.filter(control => control.category === group),
    })).filter(section => section.items.length > 0);
  }, [filteredSortedControls, groupByCategory]);

  const summary = useMemo(() => {
    const source = filteredSortedControls;
    return {
      total: source.length,
      high: source.filter(x => x.riskLevel === 'HIGH').length,
      material: source.filter(x => x.riskLevel === 'MATERIAL').length,
      low: source.filter(x => x.riskLevel === 'LOW').length,
      active: source.filter(x => x.status === 'active').length,
      deficient: source.filter(x => x.status === 'deficient').length,
      unknown: source.filter(x => x.status === 'unknown').length,
    };
  }, [filteredSortedControls]);

  const toggleExpand = (id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortField(field);
    setSortDirection(field === 'id' ? 'asc' : 'desc');
  };

  const panelSurface = isLight ? '#FFFFFF' : 'rgba(255,255,255,0.03)';
  const bodyText = isLight ? 'text-slate-700' : 'text-white/75';
  const mutedText = isLight ? 'text-slate-500' : 'text-white/45';

  return (
    <div className={`h-full w-full overflow-hidden px-6 md:px-10 py-5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
      <div className="h-full flex flex-col gap-4 min-h-0">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex h-1.5 w-1.5 rounded-full" style={{ background: remapForLight('#007970', isLight) }} />
              <span
                className="text-[10px] font-montserrat font-bold uppercase tracking-[0.24em]"
                style={{ color: remapForLight('#007970', isLight) }}
              >
                Compliance Command Center
              </span>
            </div>
            <h1 className="font-outfit text-[24px] leading-tight">
              Master control inventory
            </h1>
            <p className={`text-[11px] font-roboto mt-1 ${mutedText}`}>
              Structured, auditable registry of required-at-all-times controls.
            </p>
          </div>
          <div className={`text-right text-[10px] font-montserrat uppercase tracking-[0.14em] ${mutedText}`}>
            {summary.total} controls in view
          </div>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-2.5">
          <StatCard label="Total Controls" value={summary.total} color="#007970" isLight={isLight} />
          <StatCard label="High Risk" value={summary.high} color="#EF4444" isLight={isLight} />
          <StatCard label="Material Risk" value={summary.material} color="#F59E0B" isLight={isLight} />
          <StatCard label="Low Risk" value={summary.low} color="#06B6D4" isLight={isLight} />
          <StatCard label="Active" value={summary.active} color="#10B981" isLight={isLight} />
          <StatCard label="Deficient" value={summary.deficient} color="#EF4444" isLight={isLight} />
          <StatCard label="Unknown" value={summary.unknown} color="#F59E0B" isLight={isLight} />
        </section>

        <section
          className="rounded-xl border p-3"
          style={{
            borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.10)',
            background: panelSurface,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-8 gap-2.5">
            <div
              className="xl:col-span-2 flex items-center rounded-lg border px-2.5"
              style={{
                borderColor: isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)',
                background: isLight ? '#FAFBF8' : 'rgba(255,255,255,0.02)',
              }}
            >
              <Search size={13} className={mutedText} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search controls, owner, citation, policy…"
                className={`w-full bg-transparent px-2 py-2 text-[11px] font-roboto outline-none ${bodyText} placeholder:opacity-60`}
              />
            </div>

            <select
              value={category}
              onChange={event => setCategory(event.target.value as 'ALL' | MasterControlCategory)}
              className="rounded-lg border px-2.5 py-2 text-[11px] bg-transparent"
              style={{ borderColor: isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)' }}
            >
              <option value="ALL">All categories</option>
              {MASTER_CONTROL_CATEGORIES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>

            <select
              value={domain}
              onChange={event => setDomain(event.target.value)}
              className="rounded-lg border px-2.5 py-2 text-[11px] bg-transparent"
              style={{ borderColor: isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)' }}
            >
              {domainOptions.map(opt => <option key={opt} value={opt}>{opt === 'ALL' ? 'All domains' : opt}</option>)}
            </select>

            <select
              value={risk}
              onChange={event => setRisk(event.target.value as RiskFilter)}
              className="rounded-lg border px-2.5 py-2 text-[11px] bg-transparent"
              style={{ borderColor: isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)' }}
            >
              <option value="ALL">All risk levels</option>
              <option value="HIGH">High</option>
              <option value="MATERIAL">Material</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={status}
              onChange={event => setStatus(event.target.value as StatusFilter)}
              className="rounded-lg border px-2.5 py-2 text-[11px] bg-transparent"
              style={{ borderColor: isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)' }}
            >
              <option value="ALL">All statuses</option>
              <option value="active">Active</option>
              <option value="deficient">Deficient</option>
              <option value="unknown">Unknown</option>
            </select>

            <button
              type="button"
              onClick={() => setHighRiskOnly(prev => !prev)}
              className="rounded-lg border px-2.5 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em]"
              style={{
                borderColor: highRiskOnly ? remapForLight('#EF4444', isLight) : isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)',
                background: highRiskOnly ? `${remapForLight('#EF4444', isLight)}18` : 'transparent',
                color: highRiskOnly ? remapForLight('#EF4444', isLight) : undefined,
              }}
            >
              High Risk Only
            </button>

            <button
              type="button"
              onClick={() => setGroupByCategory(prev => !prev)}
              className="rounded-lg border px-2.5 py-2 text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] inline-flex items-center justify-center gap-1.5"
              style={{
                borderColor: groupByCategory ? remapForLight('#007970', isLight) : isLight ? '#D9D9D9' : 'rgba(255,255,255,0.14)',
                background: groupByCategory ? `${remapForLight('#007970', isLight)}15` : 'transparent',
                color: groupByCategory ? remapForLight('#007970', isLight) : undefined,
              }}
            >
              <SlidersHorizontal size={12} />
              Group by Category
            </button>
          </div>
        </section>

        <section
          className="flex-1 min-h-0 rounded-xl border overflow-hidden relative"
          style={{
            borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.10)',
            background: panelSurface,
          }}
        >
          {loading ? (
            <div className={`h-full w-full flex items-center justify-center text-[12px] ${mutedText}`}>
              Loading master control inventory…
            </div>
          ) : error ? (
            <div className="h-full w-full flex items-center justify-center px-6">
              <div className="rounded-xl border p-5 text-center max-w-xl" style={{ borderColor: remapForLight('#EF4444', isLight) }}>
                <AlertTriangle size={20} className="mx-auto mb-2" style={{ color: remapForLight('#EF4444', isLight) }} />
                <p className={`text-[12px] ${bodyText}`}>{error}</p>
                <p className={`text-[10px] mt-1 ${mutedText}`}>
                  Expected dataset at <span className="font-mono">{'/Builder/Documentations/MASTER_CONTROL_INVENTORY_DATA_MODEL.json'}</span>
                </p>
              </div>
            </div>
          ) : filteredSortedControls.length === 0 ? (
            <div className="h-full w-full flex items-center justify-center px-6">
              <div className="rounded-xl border p-5 text-center max-w-xl" style={{ borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.14)' }}>
                <ShieldCheck size={20} className="mx-auto mb-2 opacity-60" />
                <p className={`text-[12px] ${bodyText}`}>No controls match the current filter criteria.</p>
                <p className={`text-[10px] mt-1 ${mutedText}`}>Clear or adjust filters to restore the inventory view.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden lg:block h-full overflow-auto custom-scrollbar">
                {groupByCategory
                  ? groupedControls.map(section => (
                      <div key={section.group} className="border-b last:border-b-0" style={{ borderColor: isLight ? '#EDEDED' : 'rgba(255,255,255,0.06)' }}>
                        <div className={`sticky top-0 z-10 px-4 py-2 border-b ${isLight ? 'bg-[#FAFBF8]' : 'bg-[#0D1117]'}`} style={{ borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.08)' }}>
                          <p className="text-[10px] font-montserrat font-bold uppercase tracking-[0.14em]">{section.group}</p>
                          <p className={`text-[10px] ${mutedText}`}>{section.items.length} controls</p>
                        </div>
                        <ControlTable
                          controls={section.items}
                          expandedRows={expandedRows}
                          isLight={isLight}
                          onRowExpand={toggleExpand}
                          onRowSelect={setSelectedControl}
                          onSort={toggleSort}
                          sortDirection={sortDirection}
                          sortField={sortField}
                        />
                      </div>
                    ))
                  : (
                    <ControlTable
                      controls={filteredSortedControls}
                      expandedRows={expandedRows}
                      isLight={isLight}
                      onRowExpand={toggleExpand}
                      onRowSelect={setSelectedControl}
                      onSort={toggleSort}
                      sortDirection={sortDirection}
                      sortField={sortField}
                    />
                  )}
              </div>

              <div className="lg:hidden h-full overflow-y-auto custom-scrollbar p-3 space-y-2.5">
                {filteredSortedControls.map(item => {
                  const expanded = expandedRows.has(item.id);
                  return (
                    <article
                      key={item.id}
                      className="rounded-lg border p-3"
                      style={{ borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.12)', background: isLight ? '#FFFFFF' : 'rgba(255,255,255,0.02)' }}
                    >
                      <button type="button" className="w-full text-left" onClick={() => setSelectedControl(item)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className={`text-[10px] font-mono ${mutedText}`}>{formatControlCode(item.id)}</p>
                            <p className="text-[12px] font-montserrat font-bold leading-snug mt-0.5">{item.controlName}</p>
                            <p className={`text-[10px] mt-1 ${mutedText}`}>{item.category} · {item.domain}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <ControlBadge value={item.riskLevel} type="risk" isLight={isLight} />
                            <ControlBadge value={item.status} type="status" isLight={isLight} />
                          </div>
                        </div>
                      </button>
                      <div className="mt-2 flex items-center justify-between">
                        <p className={`text-[10px] ${mutedText}`}>Owner: {item.requiredOwner}</p>
                        <button type="button" onClick={() => toggleExpand(item.id)} className={`text-[10px] inline-flex items-center gap-1 ${mutedText}`}>
                          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          Details
                        </button>
                      </div>
                      {expanded ? (
                        <div className={`mt-2 border-t pt-2 space-y-1.5 text-[10px] ${bodyText}`} style={{ borderColor: isLight ? '#EAEAEA' : 'rgba(255,255,255,0.08)' }}>
                          <p><span className={mutedText}>Description:</span> {item.description}</p>
                          <p><span className={mutedText}>Source Policy IDs:</span> {item.sourcePolicyIds.join(', ')}</p>
                          <p><span className={mutedText}>Regulatory Basis:</span> {item.regulatoryBasis}</p>
                          <p><span className={mutedText}>Evidence Required:</span> {item.evidenceRequired}</p>
                          <p><span className={mutedText}>Failure Risk:</span> {item.failureRisk}</p>
                          {item.notes ? <p><span className={mutedText}>Notes:</span> {item.notes}</p> : null}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </>
          )}

          {selectedControl ? (
            <>
              <button
                type="button"
                className="absolute inset-0 bg-black/30 z-20"
                onClick={() => setSelectedControl(null)}
                aria-label="Close control details"
              />
              <aside
                className="absolute right-0 top-0 h-full w-full sm:w-[460px] border-l z-30 overflow-y-auto custom-scrollbar"
                style={{
                  borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.12)',
                  background: isLight ? '#FFFFFF' : '#101418',
                }}
              >
                <div className="p-4 flex items-start justify-between gap-3 border-b" style={{ borderColor: isLight ? '#ECECEC' : 'rgba(255,255,255,0.08)' }}>
                  <div className="min-w-0">
                    <p className={`text-[10px] font-mono ${mutedText}`}>{formatControlCode(selectedControl.id)}</p>
                    <h2 className="text-[16px] font-outfit leading-tight mt-1">{selectedControl.controlName}</h2>
                    <div className="mt-2 flex items-center gap-2">
                      <ControlBadge value={selectedControl.riskLevel} type="risk" isLight={isLight} />
                      <ControlBadge value={selectedControl.status} type="status" isLight={isLight} />
                    </div>
                  </div>
                  <button type="button" onClick={() => setSelectedControl(null)} className={`rounded-md border p-1.5 ${mutedText}`} style={{ borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.12)' }}>
                    <X size={14} />
                  </button>
                </div>
                <div className={`p-4 space-y-3 text-[11px] ${bodyText}`}>
                  <DetailRow label="Description" value={selectedControl.description} mutedClass={mutedText} />
                  <DetailRow label="Category" value={selectedControl.category} mutedClass={mutedText} />
                  <DetailRow label="Domain" value={selectedControl.domain} mutedClass={mutedText} />
                  <DetailRow label="Required Owner" value={selectedControl.requiredOwner} mutedClass={mutedText} />
                  <DetailRow label="Source Policies" value={selectedControl.sourcePolicyIds.join(', ')} mutedClass={mutedText} />
                  <DetailRow label="Regulatory Basis" value={selectedControl.regulatoryBasis} mutedClass={mutedText} />
                  <DetailRow label="Evidence Required" value={selectedControl.evidenceRequired} mutedClass={mutedText} />
                  <DetailRow label="Failure Risk" value={selectedControl.failureRisk} mutedClass={mutedText} />
                  <DetailRow label="Notes" value={selectedControl.notes ?? 'No notes provided'} mutedClass={mutedText} />
                </div>
              </aside>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function DetailRow({ label, value, mutedClass }: { label: string; value: string; mutedClass: string }) {
  return (
    <div className="space-y-1">
      <p className={`text-[10px] font-montserrat font-bold uppercase tracking-[0.12em] ${mutedClass}`}>
        {label}
      </p>
      <p className="leading-relaxed">{value}</p>
    </div>
  );
}

function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  isLight,
}: {
  label: string;
  field: SortField;
  currentField: SortField;
  direction: SortDirection;
  onSort: (field: SortField) => void;
  isLight: boolean;
}) {
  const active = currentField === field;
  return (
    <th className="px-2.5 py-2 text-left">
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 text-[9px] font-montserrat font-bold uppercase tracking-[0.13em]"
        style={{ color: active ? remapForLight('#007970', isLight) : undefined }}
      >
        {label}
        {active ? (direction === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />) : null}
      </button>
    </th>
  );
}

function ControlTable({
  controls,
  expandedRows,
  isLight,
  onRowExpand,
  onRowSelect,
  onSort,
  sortDirection,
  sortField,
}: {
  controls: MasterControlItem[];
  expandedRows: Set<number>;
  isLight: boolean;
  onRowExpand: (id: number) => void;
  onRowSelect: (control: MasterControlItem) => void;
  onSort: (field: SortField) => void;
  sortDirection: SortDirection;
  sortField: SortField;
}) {
  const mutedText = isLight ? 'text-slate-500' : 'text-white/45';
  return (
    <table className="w-full text-[11px]">
      <thead className={`sticky top-0 z-[5] ${isLight ? 'bg-[#FAFBF8]' : 'bg-[#0D1117]'}`}>
        <tr className="border-b" style={{ borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.08)' }}>
          <th className="w-8 px-1.5 py-2" />
          <SortHeader label="ID" field="id" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
          <SortHeader label="Control Name" field="controlName" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
          <SortHeader label="Category" field="category" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
          <SortHeader label="Domain" field="domain" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
          <SortHeader label="Required Owner" field="requiredOwner" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
          <SortHeader label="Risk" field="riskLevel" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
          <SortHeader label="Status" field="status" currentField={sortField} direction={sortDirection} onSort={onSort} isLight={isLight} />
        </tr>
      </thead>
      <tbody>
        {controls.map(control => {
          const expanded = expandedRows.has(control.id);
          const rowBorder = isLight ? '#EFEFEF' : 'rgba(255,255,255,0.06)';
          const highRiskTint = control.highRiskIfMissing ? (isLight ? '#FFF4F2' : 'rgba(239,68,68,0.08)') : 'transparent';
          return (
            <Fragment key={control.id}>
              <tr
                className="border-b cursor-pointer transition-colors hover:bg-black/5"
                style={{ borderColor: rowBorder, background: highRiskTint }}
                onClick={() => onRowSelect(control)}
              >
                <td className="px-1.5 py-2.5 text-center">
                  <button
                    type="button"
                    onClick={event => {
                      event.stopPropagation();
                      onRowExpand(control.id);
                    }}
                    className={`rounded-md border p-1 ${mutedText}`}
                    style={{ borderColor: isLight ? '#E5E4E3' : 'rgba(255,255,255,0.12)' }}
                  >
                    {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </td>
                <td className="px-2.5 py-2.5 font-mono">{formatControlCode(control.id)}</td>
                <td className="px-2.5 py-2.5">
                  <div className="font-montserrat font-semibold leading-snug">
                    {control.controlName}
                    {control.highRiskIfMissing ? (
                      <span className="ml-2 inline-flex items-center gap-1 text-[9px] font-montserrat font-bold uppercase tracking-[0.1em]" style={{ color: remapForLight('#EF4444', isLight) }}>
                        <ShieldX size={10} /> High impact
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-2.5 py-2.5">{control.category}</td>
                <td className="px-2.5 py-2.5">{control.domain}</td>
                <td className="px-2.5 py-2.5">{control.requiredOwner}</td>
                <td className="px-2.5 py-2.5"><ControlBadge value={control.riskLevel} type="risk" isLight={isLight} /></td>
                <td className="px-2.5 py-2.5"><ControlBadge value={control.status} type="status" isLight={isLight} /></td>
              </tr>
              {expanded ? (
                <tr className="border-b" style={{ borderColor: rowBorder }}>
                  <td />
                  <td colSpan={7} className="px-2.5 py-2.5">
                    <div
                      className="rounded-lg border p-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-[10px]"
                      style={{
                        borderColor: isLight ? '#E8E8E8' : 'rgba(255,255,255,0.10)',
                        background: isLight ? '#FAFBF8' : 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <p className="col-span-2"><strong>Description:</strong> {control.description}</p>
                      <p><strong>Source Policy IDs:</strong> {control.sourcePolicyIds.join(', ')}</p>
                      <p><strong>Regulatory Basis:</strong> {control.regulatoryBasis}</p>
                      <p><strong>Evidence Required:</strong> {control.evidenceRequired}</p>
                      <p><strong>Failure Risk:</strong> {control.failureRisk}</p>
                      {control.notes ? <p className="col-span-2"><strong>Notes:</strong> {control.notes}</p> : null}
                    </div>
                  </td>
                </tr>
              ) : null}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

