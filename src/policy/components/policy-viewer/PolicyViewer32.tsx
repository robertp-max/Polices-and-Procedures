import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  Download,
  FileText,
  History,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Search,
  ShieldCheck,
} from 'lucide-react';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { buildPolicyViewer32Model } from './PolicyViewer32Adapters';
import type { PolicyViewer32Section } from './PolicyViewer32Types';
import {
  PolicyViewer32EmptyState,
  PolicyViewer32Markdown,
} from './PolicyViewer32SectionRenderer';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { openPolicyPrintRoute } from '@/policy/utils/openPolicyPrintRoute';

export interface PolicyViewer32Props {
  policyId?: string;
  embedded?: boolean;
  onBack?: () => void;
}

interface PolicySectionGroup {
  id: string;
  label: string;
  badge: string;
  sections: PolicyViewer32Section[];
}

function sectionMatches(section: PolicyViewer32Section, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return section.title.toLowerCase().includes(q) || section.body.toLowerCase().includes(q);
}

function sectionAnchor(groupId: string, section: PolicyViewer32Section): string {
  return `${groupId}-${section.id}`.replace(/[^a-zA-Z0-9_-]+/g, '-');
}

function StatusPill({ children, tone = 'teal' }: { children: string; tone?: 'teal' | 'orange' | 'green' | 'neutral' }) {
  const toneClass = {
    teal: 'border-[#B8E9E7] bg-[#F0FBFB] text-[#007970]',
    orange: 'border-[#FFD8C6] bg-[#FFF6F1] text-[#C74601]',
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    neutral: 'border-[#DDEBEB] bg-white text-[#426768]',
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${toneClass}`}>
      {children}
    </span>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[12px] border border-[#E2EEEE] bg-white/78 px-3 py-3 shadow-[0_12px_28px_-24px_rgba(0,65,66,0.35)]">
      <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#668183]">{label}</div>
      <div className="mt-1 text-[13px] font-semibold leading-snug text-[#004142]">{value || 'Unavailable'}</div>
    </div>
  );
}

export function PolicyViewer32({ policyId: propPolicyId, embedded = false, onBack }: PolicyViewer32Props) {
  const params = useParams<{ policyId?: string }>();
  const navigate = useNavigate();
  const policyId = propPolicyId ?? params.policyId ?? '';
  const storePolicy = usePolicyStore(state => state.policies.find(item => item.id === decodeURIComponent(policyId).toUpperCase()));
  const [searchQuery, setSearchQuery] = useState('');
  const [tocCollapsed, setTocCollapsed] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('');
  const [readingProgress, setReadingProgress] = useState(0);
  const [selectedAppendixId, setSelectedAppendixId] = useState<string | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const model = useMemo(
    () => (policyId ? buildPolicyViewer32Model(policyId, storePolicy) : null),
    [policyId, storePolicy],
  );

  const metadata = model?.metadata;

  const sectionGroups = useMemo<PolicySectionGroup[]>(() => {
    if (!model) return [];
    const groups: PolicySectionGroup[] = [
      { id: 'purpose', label: 'Purpose', badge: '2', sections: model.purpose },
      { id: 'scope', label: 'Scope', badge: '3', sections: model.scope },
      { id: 'definitions', label: 'Definitions', badge: '5', sections: model.definitions },
      { id: 'statements', label: 'Policy Statement', badge: '4', sections: model.statements },
      { id: 'procedures', label: 'Procedures', badge: '6', sections: model.procedures },
      { id: 'documentation', label: 'Documentation', badge: '7', sections: model.documentation },
      { id: 'compliance', label: 'Compliance & Audit', badge: '8', sections: model.compliance },
      { id: 'references', label: 'References & Administration', badge: '9', sections: model.references },
    ];
    return groups
      .map(group => ({
        ...group,
        sections: group.sections.filter(section => sectionMatches(section, searchQuery)),
      }))
      .filter(group => group.sections.length > 0);
  }, [model, searchQuery]);

  const flatSections = useMemo(
    () => sectionGroups.flatMap(group => group.sections.map(section => ({ group, section, anchor: sectionAnchor(group.id, section) }))),
    [sectionGroups],
  );

  const scrollKey = metadata ? `ci-policy-reader-scroll:${metadata.id}` : '';
  const printPath = metadata ? `/print/${encodeURIComponent(metadata.id)}` : '';

  const handlePrint = () => {
    if (printPath) openPolicyPrintRoute(`${printPath}?autoprint=1`);
  };

  const handleDownload = () => {
    if (printPath) openPolicyPrintRoute(printPath);
  };

  const scrollToSection = useCallback((anchor: string) => {
    const target = document.getElementById(anchor);
    if (!target) return;
    target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    setActiveSectionId(anchor);
  }, []);

  useEffect(() => {
    setSearchQuery('');
    setSelectedAppendixId(null);
  }, [policyId]);

  useEffect(() => {
    if (!metadata || !flatSections.length) return;
    setActiveSectionId(flatSections[0].anchor);
  }, [metadata?.id, flatSections]);

  useEffect(() => {
    if (!scrollKey) return;
    const container = workspaceRef.current;
    if (!container) return;
    const raw = localStorage.getItem(scrollKey);
    if (!raw) return;
    const saved = Number(raw);
    if (!Number.isFinite(saved)) return;
    window.requestAnimationFrame(() => {
      container.scrollTop = saved;
    });
  }, [scrollKey]);

  useEffect(() => {
    const container = workspaceRef.current;
    if (!container || !scrollKey) return;
    const onScroll = () => {
      const max = container.scrollHeight - container.clientHeight;
      setReadingProgress(max <= 0 ? 0 : Math.min(100, Math.round((container.scrollTop / max) * 100)));
      localStorage.setItem(scrollKey, String(container.scrollTop));
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => container.removeEventListener('scroll', onScroll);
  }, [scrollKey]);

  useEffect(() => {
    const container = workspaceRef.current;
    if (!container || flatSections.length === 0) return;
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSectionId(visible.target.id);
      },
      { root: container, threshold: [0.28, 0.5, 0.72], rootMargin: '-72px 0px -45% 0px' },
    );
    flatSections.forEach(({ anchor }) => {
      const node = document.getElementById(anchor);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, [flatSections]);

  if (!model || !metadata) {
    return (
      <div className="flex h-full min-h-[520px] items-center justify-center bg-[#EEF9F9] text-[#315B5C]">
        <PolicyViewer32EmptyState title="Policy not found" />
      </div>
    );
  }

  const statusTone: 'green' | 'neutral' = metadata.status.toLowerCase().includes('active') ? 'green' : 'neutral';
  const requiredTone: 'orange' | 'neutral' = metadata.tier.toLowerCase().includes('required') ? 'orange' : 'neutral';

  return (
    <div
      className={`${embedded ? 'h-full min-h-[680px]' : 'h-screen min-h-screen'} w-full overflow-hidden bg-[#EEF9F9] font-roboto text-[#263C3D] selection:bg-[#B8E9E7] selection:text-[#004142]`}
    >
      <style>{`
        .policy-reader-shell {
          background:
            radial-gradient(circle at 74% -8%, rgba(255,255,255,0.95), transparent 26%),
            radial-gradient(circle at 12% 8%, rgba(0,121,112,0.08), transparent 32%),
            linear-gradient(135deg, #EEF9F9 0%, #F8FFFF 52%, #F2FAFA 100%);
        }
        .policy-glass {
          background: rgba(255, 255, 255, 0.82);
          border: 1px solid rgba(184, 220, 220, 0.72);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.94), 0 18px 42px -34px rgba(0,65,66,0.42);
          backdrop-filter: blur(18px) saturate(1.08);
        }
        .policy-paper {
          box-shadow: 0 30px 80px -52px rgba(0,65,66,0.52), 0 1px 0 rgba(255,255,255,0.9);
        }
        .policy-enter {
          animation: policyEnter 220ms cubic-bezier(.22,1,.36,1) both;
        }
        .policy-card-motion {
          transition: transform 180ms cubic-bezier(.22,1,.36,1), box-shadow 180ms cubic-bezier(.22,1,.36,1), border-color 180ms cubic-bezier(.22,1,.36,1), background-color 180ms cubic-bezier(.22,1,.36,1);
        }
        .policy-card-motion:hover {
          transform: translateY(-1px);
          box-shadow: 0 18px 42px -30px rgba(0,65,66,0.42);
        }
        .policy-card-motion:active { transform: scale(.985); }
        @keyframes policyEnter {
          from { opacity: 0; transform: translateY(7px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .policy-enter,
          .policy-card-motion,
          .policy-card-motion:hover,
          .policy-card-motion:active {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="policy-reader-shell flex h-full min-h-0 flex-col">
        <header className="policy-glass z-20 border-x-0 border-t-0 px-5 py-4 md:px-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                {onBack ? (
                  <button
                    type="button"
                    onClick={onBack}
                    className="text-[#607C7D] transition-colors hover:text-[#004142] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
                  >
                    Library
                  </button>
                ) : (
                  <span className="text-[#607C7D]">Library</span>
                )}
                <ChevronRight size={14} className="text-[#8AA0A1]" aria-hidden="true" />
                <span className="font-mono text-[#007970]">{metadata.id}</span>
              </div>
              <h1 className="mt-2 truncate font-montserrat text-2xl font-semibold tracking-tight text-[#004142] md:text-3xl">
                {metadata.title}
              </h1>
              <p className="mt-1 max-w-4xl text-sm leading-6 text-[#426768]">
                Current policy document with appendix access and complete packet export.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => navigate('/policy-lifecycle')}
                className="policy-card-motion inline-flex items-center gap-2 rounded-full border border-[#DDEBEB] bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#426768] hover:border-[#B8E9E7] hover:text-[#004142] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
              >
                <History size={14} aria-hidden="true" /> Versions
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="policy-card-motion inline-flex items-center gap-2 rounded-full border border-[#DDEBEB] bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#426768] hover:border-[#B8E9E7] hover:text-[#004142] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970]"
              >
                <Download size={14} aria-hidden="true" /> Download Packet
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="policy-card-motion inline-flex items-center gap-2 rounded-full bg-[#C74601] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-[0_14px_28px_-18px_rgba(199,70,1,0.78)] hover:bg-[#B43F00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#004142]"
              >
                <Printer size={14} aria-hidden="true" /> Print
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 px-5 py-5 xl:grid-cols-[auto_minmax(0,1fr)_320px] md:px-8">
          <aside className={`policy-glass hidden min-h-0 rounded-[20px] p-4 xl:block ${tocCollapsed ? 'w-[82px]' : 'w-[272px]'}`}>
            <div className={`flex items-center gap-2 ${tocCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!tocCollapsed && <h2 className="text-sm font-semibold text-[#004142]">Contents</h2>}
              <button
                type="button"
                onClick={() => setTocCollapsed(value => !value)}
                title={tocCollapsed ? 'Expand contents' : 'Collapse contents'}
                aria-label={tocCollapsed ? 'Expand contents' : 'Collapse contents'}
                className="policy-card-motion flex h-9 w-9 items-center justify-center rounded-full border border-[#DDEBEB] bg-white/78 text-[#007970]"
              >
                {tocCollapsed ? <PanelLeftOpen size={15} /> : <PanelLeftClose size={15} />}
              </button>
            </div>

            {!tocCollapsed && (
              <>
                <div className="mt-4 rounded-[14px] border border-[#DDEBEB] bg-white/72 p-3">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607C7D]">
                    <span>Reading</span>
                    <span>{readingProgress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DDEBEB]">
                    <div className="h-full rounded-full bg-[#007970] transition-[width] duration-[520ms]" style={{ width: `${readingProgress}%` }} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <StatusPill tone={statusTone}>{metadata.status}</StatusPill>
                    <StatusPill tone={requiredTone}>{metadata.tier}</StatusPill>
                  </div>
                </div>

                <div className="relative mt-4">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E8888]" aria-hidden="true" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={event => setSearchQuery(event.target.value)}
                    placeholder="Search within policy..."
                    aria-label="Search within policy"
                    className="w-full rounded-[12px] border border-[#DDEBEB] bg-white/82 py-2.5 pl-9 pr-3 text-sm text-[#263C3D] placeholder:text-[#8AA0A1] shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] outline-none transition focus:border-[#007970] focus:ring-2 focus:ring-[#B8E9E7]"
                  />
                </div>
              </>
            )}

            <nav className={`mt-4 min-h-0 overflow-y-auto ${tocCollapsed ? 'space-y-2' : 'space-y-1.5'}`} aria-label="Policy sections">
              {flatSections.map(({ group, section, anchor }) => {
                const active = activeSectionId === anchor;
                return (
                  <button
                    key={anchor}
                    type="button"
                    onClick={() => scrollToSection(anchor)}
                    title={section.title}
                    className={`policy-card-motion flex w-full items-center gap-3 rounded-[12px] border text-left text-xs font-semibold ${
                      tocCollapsed ? 'h-11 justify-center px-0' : 'px-3 py-2.5'
                    } ${
                      active
                        ? 'border-[#B8E9E7] bg-[#F0FBFB] text-[#004142] shadow-[inset_3px_0_0_#007970]'
                        : 'border-transparent text-[#426768] hover:border-[#DDEBEB] hover:bg-white/72 hover:text-[#004142]'
                    }`}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-mono text-[#007970] shadow-[0_6px_14px_-12px_rgba(0,65,66,0.55)]">
                      {group.badge}
                    </span>
                    {!tocCollapsed && <span className="min-w-0 truncate">{section.title}</span>}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main ref={workspaceRef} className="min-h-0 overflow-y-auto rounded-[24px] scroll-smooth">
            {model.missingContent && (
              <div className="mb-5 rounded-[16px] border border-[#FFD8C6] bg-[#FFF6F1] px-4 py-3 text-sm text-[#C74601]">
                This policy exists in the registry, but no rendered policy body is available in the content corpus.
              </div>
            )}

            <article className="policy-paper policy-enter mx-auto min-h-[11in] max-w-[8.5in] rounded-[4px] border border-[#D7E0E0] bg-white px-9 py-10 text-[#263C3D] md:px-14 md:py-14">
              <header className="border-b border-[#DDE5E5] pb-8">
                <div className="flex items-start justify-between gap-6">
                  <img src={ciLogoGray} alt="Care Indeed" className="h-12 w-auto object-contain" />
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#607C7D]">Corporate Policy Document</div>
                    <div className="mt-1 text-sm font-semibold text-[#004142]">{metadata.id}</div>
                  </div>
                </div>
                <div className="mt-8 flex flex-wrap gap-2">
                  <StatusPill>{metadata.id}</StatusPill>
                  <StatusPill tone={statusTone}>{metadata.status}</StatusPill>
                  <StatusPill tone={requiredTone}>{metadata.tier}</StatusPill>
                </div>
                <h2 className="mt-6 font-roboto text-3xl font-semibold leading-tight tracking-tight text-[#004142] md:text-[34px]">
                  {metadata.title}
                </h2>
                <dl className="mt-7 grid grid-cols-2 gap-x-10 gap-y-5 border-t border-[#E6EEEE] pt-6 md:grid-cols-4">
                  {[
                    ['Version', metadata.version],
                    ['Effective', metadata.effectiveDate],
                    ['Last Reviewed', metadata.lastReviewed],
                    ['Next Review', metadata.nextReview],
                    ['Policy Owner', metadata.owner],
                    ['Subdomain', metadata.subdomain],
                    ['Domain', metadata.domain],
                    ['Approved By', metadata.approvedBy],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#607C7D]">{label}</dt>
                      <dd className="mt-1 text-sm font-semibold leading-snug text-[#1F2F31]">{value || 'Unavailable'}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-8 h-[3px] w-full rounded-full bg-[#007970]" />
              </header>

              <div className="pt-9">
                {sectionGroups.length === 0 ? (
                  <PolicyViewer32EmptyState title="No matching policy sections" />
                ) : (
                  <div className="space-y-10">
                    {sectionGroups.map(group => (
                      <section key={group.id} aria-labelledby={`group-${group.id}`} className="space-y-7">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#DDEBEB] bg-[#F0FBFB] font-mono text-[11px] font-semibold text-[#007970]">
                            {group.badge}
                          </span>
                          <h3 id={`group-${group.id}`} className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#426768]">
                            {group.label}
                          </h3>
                        </div>
                        {group.sections.map(section => (
                          <section key={section.id} id={sectionAnchor(group.id, section)} className="scroll-mt-8 space-y-3">
                            {group.sections.length > 1 && (
                              <h4 className="border-b border-[#007970] pb-2 text-[17px] font-semibold tracking-tight text-[#1F2F31]">
                                {section.title}
                              </h4>
                            )}
                            <PolicyViewer32Markdown body={section.body} />
                          </section>
                        ))}
                      </section>
                    ))}
                  </div>
                )}
              </div>
            </article>
          </main>

          <aside className="policy-glass hidden min-h-0 overflow-y-auto rounded-[20px] p-5 xl:block">
            <div className="space-y-5">
              <section>
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-[#007970]" aria-hidden="true" />
                  <h2 className="text-sm font-semibold text-[#004142]">Policy Metadata</h2>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <InfoTile label="Owner" value={metadata.owner} />
                  <InfoTile label="Review" value={metadata.reviewCycle} />
                  <InfoTile label="Effective" value={metadata.effectiveDate} />
                  <InfoTile label="Next Review" value={metadata.nextReview} />
                </div>
              </section>

              <section className="rounded-[16px] border border-[#DDEBEB] bg-white/76 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.94)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#007970]" aria-hidden="true" />
                  <h3 className="text-sm font-semibold text-[#004142]">Next Required Action</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#426768]">
                  Current version is available for review. The complete packet includes all linked appendices when printed or exported.
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="policy-card-motion mt-3 inline-flex items-center gap-2 rounded-full bg-[#007970] px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white"
                >
                  <Download size={13} /> Complete Packet
                </button>
              </section>

              <section>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="text-[#007970]" aria-hidden="true" />
                    <h3 className="text-sm font-semibold text-[#004142]">Appendices & Linked Forms</h3>
                  </div>
                  <StatusPill tone="neutral">{`${model.forms.length} Forms`}</StatusPill>
                </div>
                <div className="mt-3 space-y-2">
                  {model.forms.length > 0 ? (
                    model.forms.map((form, index) => {
                      const selected = selectedAppendixId === form.id;
                      const appendixLabel = `Appendix ${String.fromCharCode(65 + index)}`;
                      return (
                        <button
                          key={form.id}
                          type="button"
                          onClick={() => {
                            setSelectedAppendixId(form.id);
                            navigate(`/forms/${encodeURIComponent(form.id)}`);
                          }}
                          className={`policy-card-motion w-full rounded-[14px] border px-3 py-3 text-left ${
                            selected
                              ? 'border-[#B8E9E7] bg-[#F0FBFB] shadow-[0_0_0_3px_rgba(0,121,112,0.08)]'
                              : 'border-[#E2EEEE] bg-white/76 hover:border-[#B8E9E7]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="rounded-full border border-[#B8E9E7] bg-[#F0FBFB] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#007970]">
                                  {appendixLabel}
                                </span>
                                <span className="font-mono text-[11px] font-semibold text-[#007970]">{form.id}</span>
                              </div>
                              <div className="mt-1 text-sm font-semibold leading-snug text-[#004142]">{form.name}</div>
                              <div className="mt-1 text-xs text-[#426768]">{form.type} · Included in full packet</div>
                            </div>
                            <FileText size={15} className="mt-0.5 shrink-0 text-[#C74601]" aria-hidden="true" />
                          </div>
                          <p className="mt-2 text-[11px] leading-5 text-[#607C7D]">
                            View form · Canonical appendix document
                          </p>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-[14px] border border-[#E2EEEE] bg-white/72 px-3 py-3 text-sm text-[#607C7D]">
                      No linked forms are registered for this policy.
                    </div>
                  )}
                </div>
                {model.appendices.length > 0 && (
                  <p className="mt-3 text-[11px] leading-5 text-[#607C7D]">
                    {model.appendices.length} text appendix section{model.appendices.length === 1 ? '' : 's'} available in the complete printed or exported packet.
                  </p>
                )}
              </section>

              <section className="rounded-[16px] border border-[#DDEBEB] bg-white/76 p-4">
                <h3 className="text-sm font-semibold text-[#004142]">Audit Readiness</h3>
                <div className="mt-3 space-y-2 text-sm text-[#426768]">
                  <div className="flex items-center justify-between gap-3">
                    <span>Version status</span>
                    <span className="font-semibold text-[#007970]">{metadata.status}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Linked forms</span>
                    <span className="font-semibold text-[#004142]">{model.forms.length}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Print packet</span>
                    <span className="font-semibold text-[#007970]">Complete</span>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default PolicyViewer32;
