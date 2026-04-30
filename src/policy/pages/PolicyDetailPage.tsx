import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer, FileText, Book, ClipboardCheck, Shield,
  BookOpen, Settings, Archive, AlertTriangle, ArrowLeft,
} from 'lucide-react';
import { DraftBanner } from '@/policy/components/DraftBanner';
import { PolicyAppendicesPanel } from '@/policy/components/PolicyAppendicesPanel';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { useShellStore } from '@/policy/stores/uiStore';
import type { PolicyContentSection } from '@/policy/types';
import { GVGBDetailView } from '@/policy/pages/GVGBDetailView';
import { CiStatusBadge, EmptyState, PageHeader, SurfaceCard, Tabs } from '@/policy/components/ui';

// ─── TAB DEFINITIONS (same mapping as PolicyDetailModal) ────────────────────
const TABS = [
  { id: 'overview',       label: 'Overview',          Icon: Book },
  { id: 'procedures',     label: 'Procedures',         Icon: ClipboardCheck },
  { id: 'documentation',  label: 'Documentation',      Icon: FileText },
  { id: 'compliance',     label: 'Compliance & Audit', Icon: Shield },
  { id: 'references',     label: 'References',         Icon: BookOpen },
  { id: 'admin',          label: 'Training & Admin',   Icon: Settings },
  { id: 'appendices',     label: 'Appendices',         Icon: Archive },
] as const;

function getTabId(order: number): string {
  if (order === 1) return '__skip__';
  if (order >= 2 && order <= 6) return 'overview';
  if (order >= 7 && order <= 18) return 'procedures';
  if (order === 19) return 'documentation';
  if (order >= 20 && order <= 23) return 'compliance';
  if (order >= 24 && order <= 28) return 'references';
  if (order >= 29 && order <= 30) return 'admin';
  return 'appendices';
}

// ─── MARKDOWN RENDERER (brand-aligned, matches SharedPolicyDetailView) ──────
function GfmTable({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0]?.startsWith('|')) return null;
  const parseRow = (line: string) =>
    line.split('|').map(c => c.trim().replace(/\\_/g, '_')).filter((_, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2);
  return (
    <div className="w-full mb-6 break-inside-avoid shadow-sm rounded-lg overflow-hidden border border-ci-border bg-ci-surface">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="py-4 px-3 font-montserrat font-semibold text-[11px] tracking-[0.12em] uppercase text-ci-text-subtle border-b border-ci-border bg-ci-surface-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ci-border">
            {dataLines.map((row, i) => (
              <tr key={i} className="hover:bg-ci-surface-muted transition-colors">
                {parseRow(row).map((cell, j) => (
                  <td key={j} className={`py-4 px-3 text-ci-text-primary font-roboto text-[14px] align-top leading-relaxed break-words whitespace-normal ${j === 0 ? 'font-medium' : ''}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MarkdownBody({ text }: { text: string }) {
  if (!text || text.trim() === '---') return null;
  return (
    <div className="space-y-3">
      {text.split(/\n\n+/).map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed === '---') return null;
        if (trimmed.startsWith('|') && trimmed.includes('\n')) return <GfmTable key={i} text={trimmed} />;
        // Sub-heading inside a body block (e.g., "#### 6.4.1 — Quorum Verification")
        if (/^#{3,6}\s/.test(trimmed)) {
          const heading = trimmed.replace(/^#+\s+/, '').replace(/\\\./g, '.').replace(/\\/g, '');
          return (
            <h4 key={i} className="font-montserrat font-semibold text-[14px] text-ci-text-primary mt-6 mb-3">{heading}</h4>
          );
        }
        if (/^[*\-] /m.test(trimmed)) {
          const items = trimmed.split('\n').map(l => l.replace(/^[*\-]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={i} className="list-disc pl-6 space-y-2">
              {items.map((item, j) => <li key={j} className="font-roboto text-[15px] text-ci-text-primary leading-relaxed">{item}</li>)}
            </ul>
          );
        }
        return <p key={i} className="font-roboto text-[15px] leading-relaxed text-ci-text-primary">{trimmed}</p>;
      })}
    </div>
  );
}

function cleanSectionTitle(raw: string): string {
  return raw.replace(/\\\./g, '.').replace(/\\/g, '').trim();
}

/** Each section / subsection rendered as its own brand card. */
function SectionPanel({ section }: { section: PolicyContentSection }) {
  const cleanTitle = cleanSectionTitle(section.title);
  const isEmpty = !section.body || section.body.trim() === '' || section.body.trim() === '---';

  // Title styling varies by level (matches DSectionTitle pattern in SharedPolicyDetailView)
  const titleNode = (() => {
    if (section.level <= 2) {
      return (
        <h2 className="font-montserrat font-semibold text-[13px] tracking-[0.22em] uppercase mb-8 flex items-center gap-4 w-full text-ci-text-primary">
          <span className="shrink-0">{cleanTitle}</span>
          <span className="flex-grow h-px bg-ci-accent" />
        </h2>
      );
    }
    if (section.level === 3) {
      return (
        <h3 className="font-montserrat font-semibold text-[15px] text-ci-text-primary mb-6 flex items-center gap-3">
          <span className="inline-block w-1 h-5 bg-ci-accent rounded-sm" />
          {cleanTitle}
        </h3>
      );
    }
    return (
      <h4 className="font-montserrat font-semibold text-[12px] tracking-[0.12em] uppercase text-ci-text-subtle mb-4">
        {cleanTitle}
      </h4>
    );
  })();

  // Indent depth visually for deep subsections, but keep the card chrome consistent.
  const indentClass = section.level >= 4 ? 'ml-6' : '';

  return (
    <section
      className={`break-inside-avoid bg-ci-surface rounded-2xl border border-ci-border shadow-sm p-6 md:p-8 ${indentClass}`}
    >
      {titleNode}
      {isEmpty
        ? <p className="font-roboto text-[13px] italic text-ci-text-subtle">No additional detail in this section.</p>
        : <MarkdownBody text={section.body} />}
    </section>
  );
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────
export function PolicyDetailPage() {
  const params = useParams<{ policyId: string }>();
  const [activeTab, setActiveTab] = useState('overview');
  const setDetailMode = useShellStore(s => s.setDetailMode);

  useEffect(() => {
    const prev = document.title;
    document.title = 'Care Indeed Home Health Care, Inc. - Policies and Procedures';
    setDetailMode(true);
    return () => {
      document.title = prev;
      setDetailMode(false);
    };
  }, [setDetailMode]);

  const policy = usePolicyStore(state =>
    state.policies.find(item => item.id === params.policyId),
  );

  if (!policy) {
    return (
      <div className="rounded-xl border border-rose-400/40 bg-rose-50 p-6 text-sm text-rose-700 font-roboto">
        Policy not found.
      </div>
    );
  }

  // ── Specialized view for GV-GB-001 ──────────────────────────────────────
  if (policy.id === 'GV-GB-001') {
    return <GVGBDetailView />;
  }

  // ── All other policies: use generated content from extracted_full sources ─
  // GVPolicyDetailView and CLPolicyDetailView both used stubs/limited data;
  // generated content from real docx extractions is now the canonical source.

  const content = getPolicyContent(policy.id);
  const isOfficialVersion =
    policy.lifecycleStatus === 'Approved' || policy.lifecycleStatus === 'Published';

  const tabSections = React.useMemo<Record<string, PolicyContentSection[]>>(() => {
    if (!content) return {};
    const groups: Record<string, PolicyContentSection[]> = {};
    for (const s of content.sections) {
      const tabId = getTabId(s.order);
      if (tabId === '__skip__') continue;
      if (!groups[tabId]) groups[tabId] = [];
      groups[tabId].push(s);
    }
    return groups;
  }, [content]);

  const availableTabs = TABS.filter(t =>
    t.id === 'appendices'
      ? true
      : content
        ? (tabSections[t.id]?.length ?? 0) > 0
        : t.id === 'overview'
  );

  const activeSections = tabSections[activeTab] ?? [];

  const statusTone =
    policy.lifecycleStatus === 'Approved' || policy.lifecycleStatus === 'Published'
      ? 'success'
      : policy.lifecycleStatus === 'Draft' || policy.lifecycleStatus === 'Under Review'
        ? 'warning'
        : policy.lifecycleStatus === 'Rejected'
          ? 'danger'
          : 'neutral';

  return (
    <SurfaceCard className="space-y-0 overflow-hidden" padding="none">

      {/* COVER BLOCK */}
      <div className="ci-glass-panel relative p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Link
            to="/library"
            className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-ci-link hover:text-ci-link-hover transition-colors"
          >
            <ArrowLeft size={13} /> Return to Policy Library
          </Link>
          {isOfficialVersion && (
            <Link to={`/print/${policy.id}`} className="ci-btn ci-btn--secondary ci-btn--sm flex items-center gap-2">
              <Printer size={16} /> Print / Export PDF
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <CiStatusBadge>{policy.id}</CiStatusBadge>
          <CiStatusBadge tone={statusTone as any}>{policy.lifecycleStatus}</CiStatusBadge>
          <CiStatusBadge>{policy.tier}</CiStatusBadge>
        </div>

        <PageHeader
          title={policy.title}
          description={policy.description ?? undefined}
          className="pb-4"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-3 text-sm mt-2 border-t border-ci-border pt-4">
          {[
            ['Domain', policy.domainCode],
            ['Subdomain', policy.subdomainCode],
            ['Owner / Steward', policy.ownerSteward],
            ['Status', policy.lifecycleStatus],
            ['Version', policy.currentVersion],
            ['Tier', policy.tier],
            ['Access', policy.accessTier],
            ['Review Cycle', policy.reviewCycle],
          ].map(([label, value]) => (
            <div key={label}>
              <span className="text-ci-text-subtle block text-xs uppercase tracking-wider font-bold">{label}</span>
              <strong className="text-ci-text-primary text-sm">{value}</strong>
            </div>
          ))}
        </div>
      </div>

      {/* DRAFT BANNER */}
      {(policy.lifecycleStatus === 'Draft' ||
        policy.lifecycleStatus === 'Under Review' ||
        policy.lifecycleStatus === 'Revision Requested') && (
        <DraftBanner />
      )}

      {/* TAB BAR */}
      {content ? (
        <div className="border-b border-ci-border bg-ci-surface overflow-x-auto px-6">
          <Tabs
            ariaLabel="Policy sections"
            value={activeTab}
            onChange={setActiveTab}
            items={availableTabs.map(tab => ({
              id: tab.id,
              label: (
                <span className="flex items-center gap-1.5 text-xs font-montserrat font-bold whitespace-nowrap">
                  <tab.Icon size={12} /> {tab.label}
                </span>
              ),
            }))}
          />
        </div>
      ) : (
        <div className="border-b border-ci-border bg-ci-surface px-6 py-3">
          <p className="text-xs font-montserrat font-bold uppercase tracking-widest text-ci-body">Policy Body</p>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-6 lg:p-8 bg-ci-bg">
        {activeTab === 'appendices' ? (
          <PolicyAppendicesPanel policyId={policy.id} />
        ) : !content ? (
          <EmptyState
            icon={<AlertTriangle size={28} />}
            title="Content Pending"
            description="Canonical metadata is loaded. Full document content has not yet been provisioned for this policy."
          />
        ) : activeSections.length === 0 ? (
          <p className="font-roboto text-sm text-ci-text-subtle py-4">No content for this section.</p>
        ) : (
          <div className="space-y-6 max-w-[1100px] mx-auto">
            {activeSections.map(section => (
              <SectionPanel key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>

    </SurfaceCard>
  );
}

