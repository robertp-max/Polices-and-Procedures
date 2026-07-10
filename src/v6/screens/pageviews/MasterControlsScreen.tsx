import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ChevronDown, ChevronLeft, ChevronRight, ClipboardCheck, FileSignature, FolderOpen, History, Search, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { DataTable, ToneTag, type DataTableColumn, type MetricTileData } from '../../components';
import { hasRequiredDocumentationBody, loadMasterControlInventorySeed } from '@/policy/data/masterControlInventory';
import {
  getMasterControlDocumentation,
} from '@/policy/data/masterControlDocumentation.generated';
import type { MasterControlDocumentationRecord, MasterControlDocumentationSection, MasterControlDocumentRef, MasterControlItem, MasterControlReadinessStatus } from '@/policy/types/masterControlInventory';
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabClass,
  workspaceTabInactiveClass,
  workspaceTabNavClass,
} from './workspaceTabChrome';

type MasterControlRow = Record<string, string>;
type DossierTab = 'summary' | 'documents' | 'evidence' | 'workflow' | 'signoff' | 'audit' | 'documentation';
type DossierMotion = 'idle' | 'exit-left' | 'exit-right' | 'enter-left' | 'enter-right';

const tabs: readonly { id: DossierTab; label: string }[] = [
  { id: 'summary', label: 'Summary' },
  { id: 'documents', label: 'Required Documents' },
  { id: 'evidence', label: 'Evidence Requirements' },
  { id: 'workflow', label: 'Workflow & Tasks' },
  { id: 'signoff', label: 'Sign-Off' },
  { id: 'audit', label: 'Audit Trail' },
  { id: 'documentation', label: 'Documentation' },
];

const complianceTabs = [
  { id: 'home', label: 'Sprint Home', to: '/compliance' },
  { id: 'workspace', label: 'DefenCIble', to: '/evidence' },
  { id: 'calendar', label: 'CES Calendar', to: '/ces/calendar' },
  { id: 'controls', label: 'Control Register', to: '/compliance/master-controls' },
] as const;

const masterControlColumns: readonly DataTableColumn<MasterControlRow>[] = [
  { key: 'controlId', label: 'Control ID' },
  { key: 'controlName', label: 'Control name' },
  { key: 'category', label: 'Category' },
  { key: 'domain', label: 'Domain' },
  { key: 'riskTier', label: 'Risk tier' },
  { key: 'sourceStatus', label: 'Source status' },
  { key: 'readiness', label: 'Readiness', status: true },
  { key: 'linkedPolicies', label: 'Linked Policies' },
];

const controlCards: readonly {
  body: string;
  icon: LucideIcon;
  status: string;
  title: string;
  tone: 'orange' | 'teal';
}[] = [
  {
    body: 'Rows open survey-ready dossiers with source documents, evidence criteria, verification rules, and sign-off obligations.',
    icon: ShieldCheck,
    status: 'Validated',
    title: 'Control dossiers',
    tone: 'teal',
  },
  {
    body: 'Admission packet documents are represented as templates only. Completed patient packets attach at runtime under PHI-safe authorization.',
    icon: FolderOpen,
    status: 'Ready',
    title: 'Document-backed',
    tone: 'teal',
  },
  {
    body: 'Readiness is computed from configuration, required evidence, sign-off requirements, and source posture. Seed data alone cannot mark OK.',
    icon: ClipboardCheck,
    status: 'Review',
    title: 'Readiness gates',
    tone: 'orange',
  },
] as const;

function readinessLabel(status: MasterControlReadinessStatus): string {
  if (status === 'OK') return 'ok';
  if (status === 'BLOCKED') return 'blocked';
  if (status === 'DOCUMENTATION_MISSING') return 'documentation-missing';
  if (status === 'NOT_CONFIGURED') return 'not-configured';
  return 'needs-attention';
}

function toRow(item: MasterControlItem): MasterControlRow {
  return {
    controlId: item.id,
    controlName: item.name,
    category: item.category,
    domain: item.domain,
    riskTier: item.riskTier,
    sourceStatus: item.sourceStatus,
    readiness: readinessLabel(item.readinessStatus),
    linkedPolicies: item.sourcePolicyIds.join(', '),
  };
}

function buildMetrics(items: readonly MasterControlItem[]): readonly MetricTileData[] {
  const total = items.length;
  const high = items.filter((item) => item.riskTier === 'HIGH').length;
  const configured = items.filter((item) => item.readinessStatus !== 'NOT_CONFIGURED').length;
  const blocked = items.filter((item) => item.readinessStatus === 'BLOCKED').length;
  return [
    { label: 'Controls', value: String(total), helper: 'Dossier inventory', tone: 'teal' },
    { label: 'High', value: String(high), helper: 'High-risk controls', tone: 'orange' },
    { label: 'Configured', value: String(configured), helper: 'Docs + evidence + signoff', tone: 'green' },
    { label: 'Blocked', value: String(blocked), helper: 'Runtime evidence/signoff needed', tone: 'orange' },
  ];
}

function ComplianceNavigationTabs() {
  return (
    <nav aria-label="Compliance portal sections" className={workspaceTabNavClass}>
      {complianceTabs.map((tab) => (
        <Link
          key={tab.id}
          to={tab.to}
          className={`${workspaceTabClass} ${tab.id === 'controls' ? workspaceTabActiveClass : workspaceTabInactiveClass}`}
          aria-current={tab.id === 'controls' ? 'page' : undefined}
        >
          {tab.label === 'DefenCIble' ? (
            <>
              Defen<span className="!text-brand-teal">CI</span>ble
            </>
          ) : tab.label}
        </Link>
      ))}
    </nav>
  );
}

export function MasterControlsScreen() {
  const [items, setItems] = useState<readonly MasterControlItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dossierMotion, setDossierMotion] = useState<DossierMotion>('idle');
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [readinessFilter, setReadinessFilter] = useState('ALL');
  const dossierExitTimeoutRef = useRef<number | null>(null);
  const dossierEnterTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    loadMasterControlInventorySeed().then((loaded) => {
      if (!mounted) return;
      setItems(loaded);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => () => {
    if (dossierExitTimeoutRef.current !== null) window.clearTimeout(dossierExitTimeoutRef.current);
    if (dossierEnterTimeoutRef.current !== null) window.clearTimeout(dossierEnterTimeoutRef.current);
  }, []);

  const rows = useMemo(() => items.map(toRow), [items]);
  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (riskFilter !== 'ALL' && row.riskTier !== riskFilter) return false;
      if (readinessFilter !== 'ALL' && row.readiness !== readinessFilter) return false;
      if (!query) return true;
      return (
        row.controlId.toLowerCase().includes(query) ||
        row.controlName.toLowerCase().includes(query) ||
        row.category.toLowerCase().includes(query) ||
        row.domain.toLowerCase().includes(query) ||
        row.linkedPolicies.toLowerCase().includes(query)
      );
    });
  }, [readinessFilter, riskFilter, rows, search]);
  const metrics = useMemo(() => buildMetrics(items), [items]);
  const riskOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.riskTier))).sort(), [rows]);
  const readinessOptions = useMemo(() => Array.from(new Set(rows.map((row) => row.readiness))).sort(), [rows]);
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? null, [items, selectedId]);
  const carouselIds = useMemo(() => filteredRows.map((row) => row.controlId), [filteredRows]);
  const selectedCarouselIndex = selectedId ? carouselIds.indexOf(selectedId) : -1;
  const firstBlockedControl = useMemo(() => items.find((item) => item.readinessStatus === 'BLOCKED') ?? items[0], [items]);
  const metricIcons: readonly LucideIcon[] = [ClipboardCheck, AlertTriangle, ShieldCheck, FileSignature];

  const clearDossierTimers = () => {
    if (dossierExitTimeoutRef.current !== null) window.clearTimeout(dossierExitTimeoutRef.current);
    if (dossierEnterTimeoutRef.current !== null) window.clearTimeout(dossierEnterTimeoutRef.current);
    dossierExitTimeoutRef.current = null;
    dossierEnterTimeoutRef.current = null;
  };

  const openControlDossier = (controlId: string) => {
    clearDossierTimers();
    setDossierMotion('idle');
    setSelectedId(controlId);
  };

  const closeControlDossier = () => {
    clearDossierTimers();
    setDossierMotion('idle');
    setSelectedId(null);
  };

  const moveSelectedControl = (direction: -1 | 1) => {
    if (!carouselIds.length || dossierMotion.startsWith('exit')) return;
    const nextIndex = selectedCarouselIndex >= 0
      ? (selectedCarouselIndex + direction + carouselIds.length) % carouselIds.length
      : direction === 1 ? 0 : carouselIds.length - 1;
    const nextId = carouselIds[nextIndex];
    if (!nextId || nextId === selectedId) return;

    clearDossierTimers();
    setDossierMotion(direction === 1 ? 'exit-left' : 'exit-right');
    dossierExitTimeoutRef.current = window.setTimeout(() => {
      setSelectedId(nextId);
      setDossierMotion(direction === 1 ? 'enter-right' : 'enter-left');
      dossierEnterTimeoutRef.current = window.setTimeout(() => {
        setDossierMotion('idle');
        dossierEnterTimeoutRef.current = null;
      }, 240);
      dossierExitTimeoutRef.current = null;
    }, 150);
  };

  return (
    <div className="min-h-screen bg-[#FAFBF8] px-6 pb-16 pt-4 font-roboto text-[#52404B] selection:bg-[#E5FEFF] md:px-12" data-hash-id="master-controls" data-route="/compliance/master-controls">
      <main className="mx-auto flex w-full max-w-[1400px] flex-col">
        <div className="relative z-20 flex justify-start">
          <ComplianceNavigationTabs />
        </div>

        <div className="space-y-10 pb-12">
          <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] bg-white p-10 shadow-sm md:p-14">
            <div className="relative z-10 flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="mb-6 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#F06923]">Compliance Control Register</p>
                <h1 className="mb-6 font-montserrat text-4xl font-bold leading-none tracking-tight text-[#007970] md:text-5xl lg:text-6xl">
                  Master Controls <br />
                  Command Register
                </h1>
                <p className="max-w-3xl font-roboto text-lg font-light leading-relaxed text-[#52404B] md:text-xl">
                  A survey-ready operating register for control ownership, required documentation, evidence gates, sign-off obligations, workflow tasks, and audit trail readiness.
                </p>
              </div>
              <div className="flex flex-col gap-4 font-montserrat sm:flex-row xl:pb-2">
                <button
                  type="button"
                  onClick={() => firstBlockedControl && openControlDossier(firstBlockedControl.id)}
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)]"
                >
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                  Open Control Dossier
                </button>
                <button
                  type="button"
                  onClick={() => setReadinessFilter('blocked')}
                  className="inline-flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF]"
                >
                  <AlertTriangle className="h-4 w-4" aria-hidden />
                  Review Blocked
                </button>
              </div>
            </div>
          </section>

          <div className="grid w-full grid-cols-2 gap-6 md:grid-cols-4">
            {metrics.map((metric, index) => {
              const Icon = metricIcons[index] ?? ShieldCheck;
              return (
                <div key={metric.label} className="group flex min-h-[164px] flex-col items-center justify-center rounded-[24px] bg-white p-8 text-center shadow-sm transition-colors hover:border-[#007970]">
                  <Icon className="mb-4 h-6 w-6 text-[#007970]" aria-hidden />
                  <span className="mb-3 font-montserrat text-3xl font-bold text-[#F06923] transition-transform duration-300 group-hover:scale-110 md:text-4xl">{metric.value}</span>
                  <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#747470]">{metric.label}</span>
                  <span className="mt-2 text-center text-xs leading-relaxed text-[#9A9A96]">{metric.helper}</span>
                </div>
              );
            })}
          </div>

          <section className="grid gap-8 xl:grid-cols-[1fr_360px]" aria-label="Master controls inventory and readiness">
            <div className="rounded-[24px] bg-white p-8 shadow-sm md:p-10">
              <div className="mb-8 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <h2 className="font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#007970]">Control Inventory</h2>
                  <p className="mt-2 text-sm text-[#747470]">{filteredRows.length} of {rows.length} controls shown. Select any row to open the full dossier.</p>
                </div>
                <div className="flex flex-col gap-3 lg:flex-row">
                  <label className="flex min-h-11 min-w-[260px] items-center gap-2 rounded-[12px] bg-[#FAFBF8] px-3 text-sm text-[#747470]">
                    <Search className="h-4 w-4 shrink-0" aria-hidden />
                    <input
                      type="text"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search control, domain, policy..."
                      className="w-full bg-transparent py-3 text-[#52404B] outline-none placeholder:text-[#9A9A96]"
                      aria-label="Search master controls"
                    />
                  </label>
                  <select
                    value={riskFilter}
                    onChange={(event) => setRiskFilter(event.target.value)}
                    aria-label="Filter controls by risk tier"
                    className="min-h-11 rounded-[12px] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470] outline-none focus:border-[#007970]"
                  >
                    <option value="ALL">All risk</option>
                    {riskOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select
                    value={readinessFilter}
                    onChange={(event) => setReadinessFilter(event.target.value)}
                    aria-label="Filter controls by readiness"
                    className="min-h-11 rounded-[12px] bg-[#FAFBF8] px-3 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#747470] outline-none focus:border-[#007970]"
                  >
                    <option value="ALL">All readiness</option>
                    {readinessOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              {filteredRows.length ? (
                <DataTable
                  columns={masterControlColumns}
                  label="Master controls inventory matrix"
                  rows={filteredRows}
                  onRowClick={(row) => openControlDossier(row.controlId)}
                />
              ) : (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border border-dashed border-[#E5E4E3] bg-[#FAFBF8] p-8 text-center">
                  <Search className="mb-3 h-6 w-6 text-[#747470]" aria-hidden />
                  <p className="font-montserrat text-sm font-bold text-[#007970]">No matching controls</p>
                  <p className="mt-2 max-w-sm text-sm text-[#747470]">Try a different control ID, category, domain, policy, or readiness filter.</p>
                </div>
              )}
            </div>

            <aside className="grid content-start gap-6" aria-label="Master controls context cards">
              {controlCards.map((card) => {
                const Icon = card.icon;
                const toneClass = card.tone === 'orange' ? 'bg-[#FFF2EB] text-[#F06923]' : 'bg-[#E5FEFF] text-[#007970]';
                return (
                  <article key={card.title} className="rounded-[24px] bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <span className={`grid h-11 w-11 place-items-center rounded-[16px] ${toneClass}`}>
                        <Icon className="h-5 w-5" aria-hidden />
                      </span>
                      <span className={`rounded-full px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider ${toneClass}`}>{card.status}</span>
                    </div>
                    <h3 className="font-montserrat text-lg font-bold text-[#007970]">{card.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#747470]">{card.body}</p>
                    <button
                      type="button"
                      onClick={() => {
                        if (card.tone === 'orange') setReadinessFilter('blocked');
                        else setRiskFilter('HIGH');
                      }}
                      className="mt-6 inline-flex items-center gap-2 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]"
                    >
                      Inspect controls
                      <ArrowRight className="h-4 w-4 text-[#F06923]" aria-hidden />
                    </button>
                  </article>
                );
              })}
            </aside>
          </section>
        </div>
      </main>

      {selected && (
        <ControlDossierModal
          control={selected}
          currentIndex={selectedCarouselIndex >= 0 ? selectedCarouselIndex : 0}
          motion={dossierMotion}
          totalCount={carouselIds.length}
          onClose={closeControlDossier}
          onNext={() => moveSelectedControl(1)}
          onPrevious={() => moveSelectedControl(-1)}
        />
      )}
    </div>
  );
}

function ControlDossierModal({
  control,
  currentIndex,
  motion,
  onClose,
  onNext,
  onPrevious,
  totalCount,
}: {
  control: MasterControlItem;
  currentIndex: number;
  motion: DossierMotion;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
  totalCount: number;
}) {
  const [activeTab, setActiveTab] = useState<DossierTab>('summary');
  const canCarousel = totalCount > 1;
  const motionClass = motion === 'idle' ? '' : `master-dossier-${motion}`;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (!canCarousel) return;
      if (event.key === 'ArrowLeft') onPrevious();
      if (event.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canCarousel, onClose, onNext, onPrevious]);

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center bg-ink/35 px-lg py-xl backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`${control.id} control dossier`}>
      {canCarousel && (
        <>
          <button
            type="button"
            onClick={onPrevious}
            aria-label="Previous master control dossier"
            className="fixed left-5 top-1/2 z-[1001] grid h-16 w-16 -translate-y-1/2 place-items-center rounded-full bg-[#F06923] text-white shadow-[0_18px_50px_rgba(240,105,35,0.35)] transition-all hover:-translate-x-1 hover:scale-105 hover:bg-[#D1571A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F7B08B] md:left-8"
          >
            <ChevronLeft className="h-9 w-9" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onNext}
            aria-label="Next master control dossier"
            className="fixed right-5 top-1/2 z-[1001] grid h-16 w-16 -translate-y-1/2 place-items-center rounded-full bg-[#F06923] text-white shadow-[0_18px_50px_rgba(240,105,35,0.35)] transition-all hover:translate-x-1 hover:scale-105 hover:bg-[#D1571A] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#F7B08B] md:right-8"
          >
            <ChevronRight className="h-9 w-9" aria-hidden />
          </button>
        </>
      )}
      <div
        key={control.id}
        className={`flex max-h-[92vh] w-[min(1180px,96vw)] flex-col overflow-hidden rounded-lg border border-hairline bg-white shadow-hover ${motionClass}`}
      >
        <header className="flex items-start justify-between gap-lg border-b border-hairline px-xl py-lg">
          <div className="min-w-0">
            <div className="mb-sm flex flex-wrap items-center gap-sm">
              <ToneTag tone={control.riskTier === 'HIGH' ? 'orange' : 'teal'}>{control.riskTier}</ToneTag>
              <ToneTag tone={control.readinessStatus === 'BLOCKED' ? 'orange' : 'teal'}>{control.readinessStatus}</ToneTag>
              <span className="text-xs uppercase tracking-tag text-muted">{control.id}</span>
              {canCarousel && (
                <span className="rounded-full bg-[#FFF2EB] px-3 py-1 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#F06923]">
                  {currentIndex + 1} of {totalCount}
                </span>
              )}
            </div>
            <h2 className="text-h2 font-medium text-ink">{control.name}</h2>
            <p className="mt-xs max-w-4xl text-sm text-muted">{control.modalSummary}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close dossier" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline text-muted hover:text-ink">
            <X className="h-5 w-5" aria-hidden />
          </button>
        </header>

        <nav className="flex max-w-full items-stretch overflow-x-auto border-b border-hairline px-xl pt-sm font-montserrat" aria-label="Control dossier tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`${workspaceCompactTabClass} ${activeTab === tab.id ? workspaceTabActiveClass : workspaceTabInactiveClass}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="min-h-0 flex-1 overflow-auto px-xl py-lg">
          {activeTab === 'summary' && <SummaryTab control={control} />}
          {activeTab === 'documents' && <DocumentsTab control={control} onOpenDocumentation={() => setActiveTab('documentation')} />}
          {activeTab === 'evidence' && <EvidenceTab control={control} />}
          {activeTab === 'workflow' && <WorkflowTab control={control} />}
          {activeTab === 'signoff' && <SignoffTab control={control} />}
          {activeTab === 'audit' && <AuditTab control={control} />}
          {activeTab === 'documentation' && <DocumentationTab control={control} />}
        </div>
      </div>
    </div>
  );
}

function SummaryTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-lg desktop:grid-cols-[1.3fr_0.7fr]">
      <section className="grid gap-md">
        <InfoGrid rows={[
          ['Control ID', control.id],
          ['Category', control.category],
          ['Domain', control.domain],
          ['Owner', control.requiredOwner],
          ['Source status', control.sourceStatus],
          ['Last verified', control.verification.lastVerifiedDate ?? 'No runtime verification yet'],
          ['Next due', control.verification.nextVerificationDate ?? 'Due on next scheduled verification'],
          ['Escalation owner', control.verification.escalationOwner],
        ]} />
        <DossierPanel title="Failure Risk" body={control.failureRisk} />
        <DossierPanel title="Surveyor Prompt" body={control.surveyorPrompt} />
        <DossierPanel title="Operator Instructions" body={control.operatorInstructions} />
      </section>
      <aside className="grid content-start gap-md">
        <IconPanel icon={ShieldCheck} title="Readiness Formula" body={control.verification.readinessFormula} />
        <IconPanel icon={ClipboardCheck} title="Trigger Condition" body={control.verification.triggerCondition} />
        <IconPanel icon={History} title="Overdue Rule" body={control.verification.overdueRule} />
      </aside>
    </div>
  );
}

function DocumentsTab({ control, onOpenDocumentation }: { control: MasterControlItem; onOpenDocumentation: () => void }) {
  const [expandedIds, setExpandedIds] = useState<readonly string[]>([]);
  const toggle = (documentId: string) => {
    setExpandedIds((current) =>
      current.includes(documentId) ? current.filter((id) => id !== documentId) : [...current, documentId],
    );
  };

  return (
    <div className="grid gap-md">
      {control.documentRefs.map((doc) => {
        const documentation = resolveDocumentation(control, doc.documentId);
        const expanded = expandedIds.includes(doc.documentId);
        return (
          <article key={doc.documentId} className="rounded-lg border border-hairline bg-surface-glass p-lg">
            <button
              type="button"
              onClick={() => toggle(doc.documentId)}
              aria-expanded={expanded}
              className="flex w-full flex-wrap items-start justify-between gap-md text-left focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-brand-teal"
            >
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-tag text-brand-teal">{doc.documentId}</p>
                <h3 className="mt-xs text-lg font-medium text-ink">{doc.title}</h3>
                <p className="mt-sm text-sm text-muted">{doc.evidenceUse}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-sm">
                <ToneTag>{doc.documentType}</ToneTag>
                {doc.templateOnly && <ToneTag tone="orange">Template only</ToneTag>}
                {doc.required && <ToneTag tone="teal">Required</ToneTag>}
                {!hasRequiredDocumentationBody(documentation) && <ToneTag tone="orange">Documentation Missing</ToneTag>}
                <ChevronDown className={`h-5 w-5 text-muted transition ${expanded ? 'rotate-180' : ''}`} aria-hidden />
              </div>
            </button>
            <InfoGrid compact rows={[
              ['Source location', doc.sourceLocation],
              ['Owner role', doc.ownerRole],
              ['Version', documentation?.version ?? doc.version ?? 'Version controlled at source'],
              ['Effective date', documentation?.effectiveDate ?? doc.effectiveDate ?? 'Tracked at source'],
            ]} />
            {expanded && <ExpandedDocumentCard control={control} doc={doc} documentation={documentation} onOpenFull={onOpenDocumentation} />}
          </article>
        );
      })}
    </div>
  );
}

function resolveDocumentation(control: MasterControlItem, documentId: string): MasterControlDocumentationRecord | undefined {
  return control.documentationRecords.find((record) => record.documentId === documentId) ?? getMasterControlDocumentation(documentId);
}

function ExpandedDocumentCard({
  control,
  doc,
  documentation,
  onOpenFull,
}: {
  control: MasterControlItem;
  doc: MasterControlDocumentRef;
  documentation?: MasterControlDocumentationRecord;
  onOpenFull: () => void;
}) {
  const latestLog = control.verificationLogs[0];
  return (
    <div className="mt-lg grid gap-md border-t border-hairline pt-lg">
      {doc.templateOnly && (
        <div className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
          Template/control documentation only. Do not store PHI in seed documentation.
        </div>
      )}
      {hasRequiredDocumentationBody(documentation) ? (
        <>
          <DocumentationBody sections={documentation.body} />
          <InfoGrid compact rows={[
            ['Linked policies', documentation.linkedPolicyIds.join(', ') || 'None'],
            ['Linked controls', documentation.linkedControlIds.join(', ') || control.id],
            ['Evidence requirements', documentation.evidenceRequirementIds.join(', ') || 'None'],
            ['Required signoffs', documentation.requiredSignoffIds.join(', ') || 'None'],
          ]} />
        </>
      ) : (
        <MissingDocumentationPanel documentId={doc.documentId} title={doc.title} ownerRole={doc.ownerRole} />
      )}
      <section className="rounded-md bg-white/70 p-md">
        <h4 className="text-xs font-medium uppercase tracking-tag text-muted">Verification Status</h4>
        <InfoGrid compact rows={[
          ['Current period', latestLog ? `${latestLog.verificationPeriodStart} to ${latestLog.verificationPeriodEnd}` : 'No runtime verification yet'],
          ['Last checked by', latestLog?.performedByName ?? 'No runtime verification yet'],
          ['Last checked date', latestLog?.performedAt ?? 'No runtime verification yet'],
          ['Signature status', latestLog?.signatureStatus ?? 'pending'],
          ['Open deficiencies', String(latestLog?.deficienciesFound.length ?? 0)],
          ['Next due date', latestLog?.nextDueDate ?? control.verification.nextVerificationDate ?? 'Next scheduled verification'],
        ]} />
      </section>
      <div className="flex flex-wrap justify-end gap-sm">
        <button type="button" onClick={onOpenFull} className="rounded-md border border-brand-teal px-md py-sm text-xs font-medium uppercase tracking-tag text-brand-teal hover:bg-tone-teal-bg">
          View Full Documentation
        </button>
      </div>
    </div>
  );
}

function DocumentationBody({ sections }: { sections: readonly MasterControlDocumentationSection[] }) {
  return (
    <div className="grid gap-md">
      {sections.map((section) => (
        <section key={section.sectionId} className="rounded-md bg-white/70 p-md">
          <h4 className="text-sm font-medium text-ink">{section.heading}</h4>
          {section.body && <p className="mt-sm text-sm leading-relaxed text-secondary">{section.body}</p>}
          {section.bullets && (
            <ul className="mt-sm grid gap-xs pl-md text-sm text-secondary">
              {section.bullets.map((bullet) => <li className="list-disc" key={bullet}>{bullet}</li>)}
            </ul>
          )}
          {section.table && <DocumentationTable rows={section.table} />}
        </section>
      ))}
    </div>
  );
}

function DocumentationTable({ rows }: { rows: readonly Record<string, string>[] }) {
  const columns = Object.keys(rows[0] ?? {});
  if (columns.length === 0) return null;
  return (
    <div className="mt-md overflow-x-auto rounded-md border border-hairline">
      <table className="min-w-full text-left text-xs">
        <thead className="bg-surface-glass uppercase tracking-tag text-muted">
          <tr>{columns.map((column) => <th className="px-md py-sm" key={column}>{column}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-hairline">
              {columns.map((column) => <td className="px-md py-sm text-secondary" key={column}>{row[column]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MissingDocumentationPanel({ documentId, title, ownerRole }: { documentId: string; title: string; ownerRole: string }) {
  return (
    <section className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-tone-orange-text">
      <h4 className="text-sm font-medium uppercase tracking-tag">DOCUMENTATION MISSING</h4>
      <p className="mt-sm text-sm">This required document has metadata but no rendered documentation body.</p>
      <InfoGrid compact rows={[
        ['Recommended document ID', documentId],
        ['Recommended title', title],
        ['Owner role', ownerRole],
        ['Draft status', 'Needs Claude draft'],
      ]} />
    </section>
  );
}

function EvidenceTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md">
      {control.evidenceRequirements.map((evidence) => (
        <article key={evidence.evidenceId} className="rounded-lg border border-hairline bg-surface-glass p-lg">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <p className="text-xs uppercase tracking-tag text-brand-teal">{evidence.evidenceId}</p>
              <h3 className="mt-xs text-lg font-medium text-ink">{evidence.label}</h3>
              <p className="mt-sm text-sm text-muted">{evidence.description}</p>
            </div>
            <button type="button" className="rounded-md border border-hairline px-md py-sm text-xs font-medium uppercase tracking-tag text-secondary hover:bg-surface-hover">
              Attach Evidence
            </button>
          </div>
          <div className="mt-md grid gap-md desktop:grid-cols-2">
            <ListPanel title="Acceptable Evidence" items={evidence.acceptableEvidence} />
            <ListPanel title="Not Acceptable" items={evidence.unacceptableEvidence} />
          </div>
          <InfoGrid compact rows={[
            ['Cadence', evidence.cadence],
            ['Responsible role', evidence.responsibleRole],
            ['Due rule', evidence.dueRule],
            ['Retention', evidence.retentionRule],
            ['Runtime status', 'Missing until attached and reviewed'],
          ]} />
        </article>
      ))}
    </div>
  );
}

function WorkflowTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md desktop:grid-cols-2">
      <IconPanel icon={ClipboardCheck} title="Recurring Tasks" body={`${control.verification.frequency} verification, evidence review, deficiency correction, and owner attestation.`} />
      <IconPanel icon={FolderOpen} title="Triggered Tasks" body={control.triggerCondition} />
      <IconPanel icon={FileSignature} title="Linked Workflows" body={control.linkedWorkflowIds.length ? control.linkedWorkflowIds.join(', ') : 'No workflow linked'} />
      <IconPanel icon={History} title="Escalation" body={`${control.escalationOwner}. Due rule: ${control.verification.overdueRule}`} />
    </div>
  );
}

function SignoffTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md">
      {control.signoffRequirements.map((signoff) => (
        <article key={signoff.signoffId} className="rounded-lg border border-hairline bg-surface-glass p-lg">
          <div className="flex flex-wrap items-start justify-between gap-md">
            <div>
              <p className="text-xs uppercase tracking-tag text-brand-teal">{signoff.signoffId}</p>
              <h3 className="mt-xs text-lg font-medium text-ink">{signoff.signerLabel}</h3>
              <p className="mt-sm text-sm text-muted">{signoff.attestationText}</p>
            </div>
            <button type="button" className="rounded-md border border-brand-teal px-md py-sm text-xs font-medium uppercase tracking-tag text-brand-teal hover:bg-tone-teal-bg">
              Sign
            </button>
          </div>
          <InfoGrid compact rows={[
            ['Role', signoff.role],
            ['Cadence', signoff.cadence],
            ['Required for readiness', signoff.requiredForReadiness ? 'Yes' : 'No'],
            ['Runtime status', 'Missing until signed'],
          ]} />
        </article>
      ))}
      <VerificationLogPanel control={control} />
    </div>
  );
}

function AuditTab({ control }: { control: MasterControlItem }) {
  return (
    <div className="grid gap-md">
      {control.auditTrail.map((entry) => (
        <article key={entry.id} className="rounded-lg border border-hairline bg-surface-glass p-lg">
          <p className="text-xs uppercase tracking-tag text-brand-teal">{entry.eventType}</p>
          <h3 className="mt-xs text-base font-medium text-ink">{entry.summary}</h3>
          <p className="mt-sm text-sm text-muted">{entry.actorRole}{entry.occurredAt ? ` · ${entry.occurredAt}` : ''}</p>
        </article>
      ))}
      <VerificationLogPanel control={control} />
      <DossierPanel title="Runtime audit events" body="Evidence added, sign-off completed, status changed, verification completed, and export generated events append here when users operate the dossier." />
    </div>
  );
}

function DocumentationTab({ control }: { control: MasterControlItem }) {
  const documentationOptions = useMemo(
    () => control.documentRefs.map((ref) => ({ ref, record: resolveDocumentation(control, ref.documentId) })),
    [control],
  );
  const [selectedDocId, setSelectedDocId] = useState(control.documentRefs[0]?.documentId ?? '');
  const selected = documentationOptions.find((entry) => entry.ref.documentId === selectedDocId) ?? documentationOptions[0];

  return (
    <div className="grid gap-lg desktop:grid-cols-1">
      <aside className="grid content-start gap-sm">
        {documentationOptions.map(({ ref, record }) => {
          const missing = !hasRequiredDocumentationBody(record);
          return (
            <button
              key={ref.documentId}
              type="button"
              onClick={() => setSelectedDocId(ref.documentId)}
              className={`rounded-lg border p-md text-left transition ${selectedDocId === ref.documentId ? 'border-brand-teal bg-tone-teal-bg' : 'border-hairline bg-white/70 hover:bg-surface-hover'}`}
            >
              <p className="text-[10px] uppercase tracking-tag text-brand-teal">{ref.documentId}</p>
              <p className="mt-xs text-sm font-medium text-ink">{ref.title}</p>
              <div className="mt-sm flex flex-wrap gap-xs">
                {ref.templateOnly && <ToneTag tone="orange">Template Only</ToneTag>}
                {missing ? <ToneTag tone="orange">Missing</ToneTag> : <ToneTag tone="teal">Approved</ToneTag>}
              </div>
            </button>
          );
        })}
      </aside>
      <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
        {selected?.record ? (
          <DocumentationReader record={selected.record} fallbackRef={selected.ref} />
        ) : (
          <MissingDocumentationPanel documentId={selectedDocId || 'MCDOC-TBD'} title={selected?.ref.title ?? 'Documentation record'} ownerRole={selected?.ref.ownerRole ?? control.requiredOwner} />
        )}
      </section>
    </div>
  );
}

function DocumentationReader({ record, fallbackRef }: { record: MasterControlDocumentationRecord; fallbackRef: MasterControlDocumentRef }) {
  const hasBody = hasRequiredDocumentationBody(record);
  return (
    <div className="grid gap-md">
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div>
          <p className="text-xs uppercase tracking-tag text-brand-teal">{record.documentId}</p>
          <h3 className="mt-xs text-xl font-medium text-ink">{record.title}</h3>
          <p className="mt-sm text-sm text-muted">{record.sourceLocation}</p>
        </div>
        <div className="flex flex-wrap gap-sm">
          <ToneTag>{record.documentType}</ToneTag>
          {record.templateOnly && <ToneTag tone="orange">Template Only</ToneTag>}
          {hasBody ? <ToneTag tone="teal">Documentation Ready</ToneTag> : <ToneTag tone="orange">Documentation Missing</ToneTag>}
        </div>
      </div>
      <div className="rounded-md border border-tone-orange-border bg-tone-orange-bg p-md text-sm text-tone-orange-text">
        Template/control documentation only. Do not store PHI in seed data. Completed patient copies attach later as runtime evidence only.
      </div>
      <InfoGrid compact rows={[
        ['Control ID', record.controlId],
        ['Owner role', record.ownerRole],
        ['Approver', record.approverRole ?? 'Not configured'],
        ['Version', record.version],
        ['Effective date', record.effectiveDate],
        ['Last reviewed', record.lastReviewedDate ?? 'No runtime review yet'],
        ['Next review', record.nextReviewDate ?? 'Next scheduled review'],
        ['Linked policies', record.linkedPolicyIds.join(', ')],
        ['Linked controls', record.linkedControlIds.join(', ')],
        ['Evidence requirements', record.evidenceRequirementIds.join(', ')],
        ['Required signoffs', record.requiredSignoffIds.join(', ')],
      ]} />
      {hasBody ? (
        <DocumentationBody sections={record.body} />
      ) : (
        <MissingDocumentationPanel documentId={fallbackRef.documentId} title={fallbackRef.title} ownerRole={fallbackRef.ownerRole} />
      )}
      <div className="flex flex-wrap justify-end gap-sm">
        <button type="button" className="rounded-md border border-hairline px-md py-sm text-xs font-medium uppercase tracking-tag text-secondary hover:bg-surface-hover">
          Open Source
        </button>
        <button type="button" className="rounded-md border border-hairline px-md py-sm text-xs font-medium uppercase tracking-tag text-secondary hover:bg-surface-hover">
          Export
        </button>
      </div>
    </div>
  );
}

function VerificationLogPanel({ control }: { control: MasterControlItem }) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <div>
          <h3 className="text-sm font-medium uppercase tracking-tag text-brand-teal">Verification / Sign-Off Log</h3>
          <p className="mt-xs text-sm text-muted">Shows verifier name, role/title, verification period, evidence reviewed, findings, deficiencies, corrective action, next due date, signature/eCIgn status, and audit ID.</p>
        </div>
        <button type="button" className="rounded-md border border-brand-teal px-md py-sm text-xs font-medium uppercase tracking-tag text-brand-teal hover:bg-tone-teal-bg">
          Add Verification Entry
        </button>
      </div>
      <div className="mt-md grid gap-md">
        {control.verificationLogs.map((log) => {
          const correctiveActionRequired = log.deficienciesFound.some((item) => item.correctiveActionRequired);
          return (
            <article key={log.logId} className="rounded-md bg-white/70 p-md">
              <div className="flex flex-wrap items-start justify-between gap-md">
                <div>
                  <p className="text-xs uppercase tracking-tag text-brand-teal">{log.logId}</p>
                  <h4 className="mt-xs text-base font-medium text-ink">{log.performedByName} - {log.performedByRole}</h4>
                  <p className="mt-xs text-sm text-muted">{log.findingsSummary}</p>
                </div>
                <ToneTag tone={log.signatureStatus === 'signed' ? 'teal' : 'orange'}>{log.signatureStatus}</ToneTag>
              </div>
              <InfoGrid compact rows={[
                ['Verifier name', log.performedByName],
                ['Role / title', log.performedByRole],
                ['Verification period', `${log.verificationPeriodStart} to ${log.verificationPeriodEnd}`],
                ['Performed date/time', log.performedAt],
                ['Evidence reviewed', `${log.evidenceReviewed.length} item(s)`],
                ['Findings', log.findingsSummary],
                ['Deficiencies', `${log.deficienciesFound.length} item(s)`],
                ['Corrective action required', correctiveActionRequired ? 'Yes' : 'No'],
                ['Next due date', log.nextDueDate],
                ['Signature/eCIgn status', log.signatureStatus],
                ['Signed by', log.signedByName ? `${log.signedByName} (${log.signedByRole ?? 'role not recorded'})` : 'No completed sign-off seeded'],
                ['Signed date/time', log.signedAt ?? 'No completed sign-off seeded'],
                ['Audit trail ID', log.auditTrailId],
                ['Readiness', `${log.readinessBefore} -> ${log.readinessAfter}`],
              ]} />
              <ListPanel title="Evidence Reviewed" items={log.evidenceReviewed.map((item) => `${item.title}: ${item.status}${item.notes ? ` - ${item.notes}` : ''}`)} />
              {log.deficienciesFound.length > 0 && (
                <ListPanel
                  title="Deficiencies"
                  items={log.deficienciesFound.map((item) => {
                    const action = item.correctiveActionRequired ? 'corrective action required' : 'no corrective action required';
                    const due = item.dueDate ? `; due ${item.dueDate}` : '';
                    const actionId = item.correctiveActionId ? `; action ${item.correctiveActionId}` : '';
                    return `${item.severity}: ${item.description} (${action}${due}${actionId})`;
                  })}
                />
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function InfoGrid({ rows, compact = false }: { rows: readonly (readonly [string, string])[]; compact?: boolean }) {
  return (
    <dl className={`mt-md grid gap-sm ${compact ? 'desktop:grid-cols-2' : 'desktop:grid-cols-3'}`}>
      {rows.map(([label, value]) => (
        <div key={`${label}-${value}`} className="rounded-md bg-white/70 p-md">
          <dt className="text-[10px] uppercase tracking-tag text-muted">{label}</dt>
          <dd className="mt-xs text-sm text-ink">{value || 'Not configured'}</dd>
        </div>
      ))}
    </dl>
  );
}

function DossierPanel({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <h3 className="text-sm font-medium uppercase tracking-tag text-brand-teal">{title}</h3>
      <p className="mt-sm text-sm leading-relaxed text-secondary">{body}</p>
    </section>
  );
}

function IconPanel({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <section className="rounded-lg border border-hairline bg-surface-glass p-lg">
      <Icon className="h-5 w-5 text-brand-teal" aria-hidden />
      <h3 className="mt-md text-sm font-medium uppercase tracking-tag text-brand-teal">{title}</h3>
      <p className="mt-sm text-sm leading-relaxed text-secondary">{body}</p>
    </section>
  );
}

function ListPanel({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <section className="rounded-md bg-white/70 p-md">
      <h4 className="text-xs font-medium uppercase tracking-tag text-muted">{title}</h4>
      <ul className="mt-sm grid gap-xs text-sm text-secondary">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </section>
  );
}

export default MasterControlsScreen;
