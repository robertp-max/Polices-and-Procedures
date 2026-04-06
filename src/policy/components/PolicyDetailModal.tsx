import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Printer, FileText, Book, ClipboardCheck,
  Shield, BookOpen, Settings, Archive, AlertTriangle,
} from 'lucide-react';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { StatusBadge } from '@/policy/components/StatusBadge';
import type { Policy, PolicyContentSection } from '@/policy/types';

// ─── TAB DEFINITIONS ────────────────────────────────────────────────────────
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

// ─── MARKDOWN TABLE PARSER ──────────────────────────────────────────────────
function GfmTable({ text }: { text: string }) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (!lines.length || !lines[0].startsWith('|')) return null;

  const parseRow = (line: string): string[] =>
    line.split('|').map(c => c.trim().replace(/\\_/g, '_')).filter((_, i, a) => i > 0 && i < a.length - 1);

  const headers = parseRow(lines[0]);
  const dataLines = lines.slice(2); // skip separator

  return (
    <div className="overflow-x-auto mb-5 rounded-lg border border-ci-border shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-ci-teal text-white">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 font-montserrat font-bold border-r border-[#005c55] last:border-r-0 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ci-border font-roboto">
          {dataLines.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-ci-surface'}>
              {parseRow(row).map((cell, j) => (
                <td key={j} className="px-3 py-2 text-ci-ink border-r border-ci-border last:border-r-0 align-top leading-snug">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── MARKDOWN BODY RENDERER ──────────────────────────────────────────────────
function MarkdownBody({ text }: { text: string }) {
  if (!text || text.trim() === '---') return null;

  const blocks = text.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed === '---') return null;

        // GFM Table
        if (trimmed.startsWith('|') && trimmed.includes('\n')) {
          return <GfmTable key={i} text={trimmed} />;
        }

        // Bullet list
        if (/^[*\-] /m.test(trimmed)) {
          const items = trimmed.split('\n').map(l => l.replace(/^[*\-]\s+/, '').trim()).filter(Boolean);
          return (
            <ul key={i} className="list-disc pl-5 mb-3 space-y-1.5">
              {items.map((item, j) => (
                <li key={j} className="font-roboto text-sm text-ci-ink leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }

        // Plain paragraph
        return (
          <p key={i} className="font-roboto text-sm leading-relaxed text-ci-ink mb-2">{trimmed}</p>
        );
      })}
    </div>
  );
}

// ─── SECTION PANEL ──────────────────────────────────────────────────────────
function SectionPanel({ section }: { section: PolicyContentSection }) {
  const cleanTitle = section.title.replace(/\\\./g, '.').replace(/\\/g, '');
  const isSubSection = section.level >= 3;
  const isEmpty = !section.body || section.body.trim() === '' || section.body.trim() === '---';

  return (
    <div className={`mb-6 ${isSubSection ? 'pl-4 border-l-2 border-ci-border' : ''}`}>
      {section.level > 1 && (
        <h3 className={`font-montserrat font-bold mb-3 ${
          section.level === 2
            ? 'text-base text-ci-ink border-b border-ci-border pb-2 mt-2'
            : section.level === 3
            ? 'text-sm text-ci-teal'
            : 'text-xs font-bold uppercase tracking-wide text-ci-body'
        }`}>
          {cleanTitle}
        </h3>
      )}
      {!isEmpty && <MarkdownBody text={section.body} />}
    </div>
  );
}

// ─── DRAFT WARNING BANNER ───────────────────────────────────────────────────
function DraftNotice() {
  return (
    <div className="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-[#C74600]/30 bg-[#C74600]/5 px-4 py-3">
      <AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#C74600]" />
      <p className="font-roboto text-xs text-ci-ink">
        <span className="font-montserrat font-bold text-[#C74600]">Draft / Review state. </span>
        This document has not yet been approved. Content is subject to change.
      </p>
    </div>
  );
}

// ─── MAIN MODAL COMPONENT ───────────────────────────────────────────────────
interface PolicyDetailModalProps {
  policy: Policy;
  onClose: () => void;
}

export function PolicyDetailModal({ policy, onClose }: PolicyDetailModalProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const content = getPolicyContent(policy.id);

  const isOfficialVersion =
    policy.lifecycleStatus === 'Approved' || policy.lifecycleStatus === 'Published';

  // Group sections by tab
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ci-ink/60 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ── COVER HEADER ── */}
        <div className="bg-ci-teal p-6 sm:p-8 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors rounded-lg p-1 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-montserrat font-bold text-white">
              {policy.id}
            </span>
            <StatusBadge status={policy.lifecycleStatus} />
          </div>

          <h2 className="font-montserrat text-xl sm:text-2xl font-extrabold text-white leading-tight pr-10">
            {policy.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-roboto text-white/70">
            <span><span className="text-white/50 font-bold uppercase tracking-wider">Domain</span> {policy.domainCode}</span>
            <span><span className="text-white/50 font-bold uppercase tracking-wider">Sub</span> {policy.subdomainCode}</span>
            <span><span className="text-white/50 font-bold uppercase tracking-wider">Version</span> {policy.currentVersion}</span>
            <span><span className="text-white/50 font-bold uppercase tracking-wider">Owner</span> {policy.ownerSteward}</span>
            <span><span className="text-white/50 font-bold uppercase tracking-wider">Review</span> {policy.reviewCycle}</span>
            <span><span className="text-white/50 font-bold uppercase tracking-wider">Access</span> {policy.accessTier}</span>
          </div>

          {isOfficialVersion && (
            <button
              onClick={() => { onClose(); navigate(`/print/${policy.id}`); }}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs font-montserrat font-bold text-white hover:bg-white/20 transition-colors"
            >
              <Printer size={13} /> Print / Export PDF
            </button>
          )}
        </div>

        {/* ── DRAFT NOTICE ── */}
        {!isOfficialVersion && <DraftNotice />}

        {/* ── TAB BAR ── */}
        {content && (
          <div className="border-b border-ci-border bg-ci-surface shrink-0 overflow-x-auto">
            <div className="flex min-w-max">
              {availableTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-montserrat font-bold whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-ci-teal text-ci-teal bg-white'
                      : 'border-transparent text-ci-body hover:text-ci-ink hover:bg-white/60'
                  }`}
                >
                  <tab.Icon size={12} /> {tab.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB CONTENT ── */}
        <div className="overflow-y-auto flex-1 p-6 sm:p-8">
          {!content ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText size={40} className="text-ci-border mb-4" />
              <p className="font-montserrat font-bold text-ci-ink mb-1">Content Pending</p>
              <p className="font-roboto text-sm text-ci-body max-w-sm">
                Policy metadata is loaded. Full document content has not yet been provisioned for this policy.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 w-full max-w-xs text-left">
                {([
                  ['Tier', policy.tier],
                  ['Access', policy.accessTier],
                  ['Owner', policy.ownerSteward],
                  ['Cycle', policy.reviewCycle],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="rounded-lg border border-ci-border bg-ci-surface p-3">
                    <p className="text-[9px] font-montserrat font-bold uppercase tracking-widest text-ci-body">{k}</p>
                    <p className="mt-1 text-xs text-ci-ink font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : activeSections.length === 0 ? (
            <p className="font-roboto text-sm text-ci-body text-center py-8">No content for this section.</p>
          ) : (
            <div>
              {activeSections.map(section => (
                <SectionPanel key={section.id} section={section} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
