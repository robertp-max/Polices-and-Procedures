import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Printer, FileText, Book, ClipboardCheck, Shield,
  BookOpen, Settings, Archive, AlertTriangle, ArrowLeft,
} from 'lucide-react';
import { DraftBanner } from '@/policy/components/DraftBanner';
import { StatusBadge } from '@/policy/components/StatusBadge';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { usePolicyStore } from '@/policy/stores/policyStore';
import { useShellStore } from '@/policy/stores/uiStore';
import type { PolicyContentSection } from '@/policy/types';
import { GVGBDetailView } from '@/policy/pages/GVGBDetailView';
import { GVPolicyDetailView, GV_POLICY_IDS } from '@/policy/pages/GVPolicyDetailView';
import { CLPolicyDetailView, CL_POLICY_IDS } from '@/policy/pages/CLPolicyDetailView';

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

// ─── MARKDOWN RENDERER ──────────────────────────────────────────────────────
function GfmTable({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines[0]?.startsWith('|')) return null;
  const parseRow = (line: string) =>
    line.split('|').map(c => c.trim().replace(/\\_/g, '_')).filter((_, i, a) => i > 0 && i < a.length - 1);
  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2);
  return (
    <div className="overflow-x-auto mb-5 rounded-lg border border-ci-border shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-ci-teal text-white">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 font-montserrat font-bold border-r border-[#005c55] last:border-r-0 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ci-border font-roboto">
          {dataLines.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-ci-surface'}>
              {parseRow(row).map((cell, j) => (
                <td key={j} className="px-3 py-2 text-ci-ink border-r border-ci-border last:border-r-0 align-top leading-snug">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownBody({ text }: { text: string }) {
  if (!text || text.trim() === '---') return null;
  return (
    <div className="space-y-2">
      {text.split(/\n\n+/).map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed === '---') return null;
        if (trimmed.startsWith('|') && trimmed.includes('\n')) return <GfmTable key={i} text={trimmed} />;
        if (/^[*\-] /m.test(trimmed)) {
          const items = trimmed.split('\n').map(l => l.replace(/^[*\-]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={i} className="list-disc pl-5 mb-3 space-y-1.5">
              {items.map((item, j) => <li key={j} className="font-roboto text-sm text-ci-ink leading-relaxed">{item}</li>)}
            </ul>
          );
        }
        return <p key={i} className="font-roboto text-sm leading-relaxed text-ci-ink mb-2">{trimmed}</p>;
      })}
    </div>
  );
}

function SectionPanel({ section }: { section: PolicyContentSection }) {
  const cleanTitle = section.title.replace(/\\\./g, '.').replace(/\\/g, '');
  const isEmpty = !section.body || section.body.trim() === '' || section.body.trim() === '---';
  return (
    <div className={`mb-6 ${section.level >= 3 ? 'pl-4 border-l-2 border-ci-border' : ''}`}>
      {section.level > 1 && (
        <h3 className={`font-montserrat font-bold mb-3 ${
          section.level === 2 ? 'text-base text-ci-ink border-b border-ci-border pb-2 mt-2'
          : section.level === 3 ? 'text-sm text-ci-teal'
          : 'text-xs font-bold uppercase tracking-wide text-ci-body'
        }`}>{cleanTitle}</h3>
      )}
      {!isEmpty && <MarkdownBody text={section.body} />}
    </div>
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
      <div className="rounded-xl border border-[#D70101]/30 bg-[#D70101]/5 p-6 text-sm text-[#D70101] font-roboto">
        Policy not found.
      </div>
    );
  }

  // ── Specialized view for GV-GB-001 ──────────────────────────────────────
  if (policy.id === 'GV-GB-001') {
    return <GVGBDetailView />;
  }

  // ── Specialized views for remaining GV domain policies ──────────────────
  if (GV_POLICY_IDS.includes(policy.id)) {
    return <GVPolicyDetailView />;
  }

  // ── Specialized views for CL domain policies ────────────────────────────
  if (CL_POLICY_IDS.includes(policy.id)) {
    return <CLPolicyDetailView />;
  }

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
    content ? (tabSections[t.id]?.length ?? 0) > 0 : t.id === 'overview'
  );

  const activeSections = tabSections[activeTab] ?? [];

  return (
    <div className="space-y-0 overflow-hidden rounded-xl border border-ci-border bg-white shadow-sm">

      {/* COVER BLOCK */}
      <div className="bg-ci-teal p-8 text-white">
        <div className="flex items-start justify-between gap-4 mb-4">
          <Link
            to="/library"
            className="flex items-center gap-1.5 text-xs font-montserrat font-bold text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={13} /> Return to Policy Library
          </Link>
          {isOfficialVersion && (
            <Link
              to={`/print/${policy.id}`}
              className="flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-montserrat font-bold text-white hover:bg-white/20 transition-colors"
            >
              <Printer size={13} /> Print / Export PDF
            </Link>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-montserrat font-bold">{policy.id}</span>
          <StatusBadge status={policy.lifecycleStatus} />
        </div>

        <h2 className="font-montserrat text-2xl font-extrabold leading-tight tracking-tight mb-3">
          {policy.title}
        </h2>
        {policy.description && (
          <p className="font-roboto text-sm leading-relaxed text-white/80 mb-4">{policy.description}</p>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-roboto text-white/70">
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Domain</span> {policy.domainCode}</span>
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Subdomain</span> {policy.subdomainCode}</span>
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Version</span> {policy.currentVersion}</span>
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Owner</span> {policy.ownerSteward}</span>
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Tier</span> {policy.tier}</span>
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Access</span> {policy.accessTier}</span>
          <span><span className="text-white/50 font-bold uppercase tracking-wider">Review</span> {policy.reviewCycle}</span>
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
        <div className="border-b border-ci-border bg-ci-surface overflow-x-auto">
          <div className="flex min-w-max">
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-xs font-montserrat font-bold whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-ci-teal text-ci-teal bg-white'
                    : 'border-transparent text-ci-body hover:text-ci-ink hover:bg-white'
                }`}
              >
                <tab.Icon size={12} /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-b border-ci-border bg-ci-surface px-6 py-3">
          <p className="text-xs font-montserrat font-bold uppercase tracking-widest text-ci-body">Policy Body</p>
        </div>
      )}

      {/* CONTENT AREA */}
      <div className="p-8">
        {!content ? (
          <div className="rounded-xl border border-dashed border-ci-border bg-ci-surface p-10 text-center">
            <AlertTriangle size={28} className="mx-auto mb-3 text-ci-border" />
            <p className="font-montserrat font-bold text-ci-body mb-1">Content Pending</p>
            <p className="font-roboto text-sm text-ci-body max-w-sm mx-auto">
              Canonical metadata is loaded. Full document content has not yet been provisioned for this policy.
            </p>
          </div>
        ) : activeSections.length === 0 ? (
          <p className="font-roboto text-sm text-ci-body py-4">No content for this section.</p>
        ) : (
          <div>
            {activeSections.map(section => (
              <SectionPanel key={section.id} section={section} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

