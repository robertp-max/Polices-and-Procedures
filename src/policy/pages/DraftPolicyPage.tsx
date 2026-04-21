import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  FileText, Edit3, ChevronDown, AlertTriangle, CheckCircle,
} from 'lucide-react';
import { getPolicyContent } from '@/policy/data/policyContentMap';
import { useAuditorModeStore } from '@/policy/stores/auditorModeStore';
import { useDraftStore } from '@/policy/stores/draftStore';
import { usePolicyStore } from '@/policy/stores/policyStore';

// ─── INLINE MARKDOWN RENDERER FOR PREVIEW PANE ───────────────────────────────
function PreviewMarkdown({ text }: { text: string }) {
  if (!text || text.trim() === '---') return null;
  return (
    <div className="space-y-2">
      {text.split(/\n\n+/).map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed || trimmed === '---') return null;
        if (trimmed.startsWith('|') && trimmed.includes('\n')) {
          const lines = trimmed.split('\n').map(l => l.trim()).filter(Boolean);
          const parseRow = (line: string) =>
            line.split('|').map(c => c.trim()).filter((_, idx, a) => idx > 0 && idx < a.length - 1);
          const headers = parseRow(lines[0]);
          const rows = lines.slice(2).map(l => parseRow(l));
          return (
            <div key={i} className="overflow-x-auto rounded border border-ci-border">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-ci-teal text-white">
                    {headers.map((h, j) => (
                      <th key={j} className="px-3 py-2 font-montserrat font-bold text-[10px] border-r border-white/20">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, j) => (
                    <tr key={j} className={j % 2 === 0 ? 'bg-white' : 'bg-ci-surface'}>
                      {row.map((cell, k) => (
                        <td key={k} className="px-3 py-1.5 border-r border-ci-border align-top font-roboto">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (/^[*\-] /m.test(trimmed)) {
          return (
            <ul key={i} className="pl-4 list-disc space-y-0.5">
              {trimmed.split('\n').map(l => l.replace(/^[*\-]\s+/, '').trim()).filter(Boolean).map((item, j) => (
                <li key={j} className="font-roboto text-xs text-ci-ink leading-relaxed">{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={i} className="font-roboto text-xs text-ci-ink leading-relaxed">{trimmed}</p>;
      })}
    </div>
  );
}

// ─── PAGE COMPONENT ───────────────────────────────────────────────────────────
export function DraftPolicyPage() {
  const params = useParams<{ policyId: string }>();
  const policy = usePolicyStore(state =>
    state.policies.find(item => item.id === params.policyId),
  );
  const beginDraftEdit = usePolicyStore(state => state.beginDraftEdit);
  const setLifecycleStatus = usePolicyStore(state => state.setLifecycleStatus);
  const initializeDraft = useDraftStore(state => state.initializeDraft);
  const updateSectionBody = useDraftStore(state => state.updateSectionBody);
  const workspace = useDraftStore(state => state.workspaces[params.policyId ?? '']);
  const isAuditorMode = useAuditorModeStore(state => state.enabled);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activePane, setActivePane] = useState<'edit' | 'preview'>('edit');

  useEffect(() => {
    if (policy && !workspace) {
      const editResult = beginDraftEdit(
        policy.id,
        'Author',
        'Draft workspace opened for editing',
      );
      if (!editResult.ok) return;

      const content = getPolicyContent(policy.id);
      const sections =
        content && content.sections.length > 0
          ? content.sections
          : [{ id: 'placeholder-section', title: 'Policy Content', level: 2, order: 1, body: '', scormChunkHint: 'general' }];

      initializeDraft(policy.id, editResult.version || policy.currentVersion, sections);
    }
  }, [beginDraftEdit, initializeDraft, policy, workspace]);

  // Find the best section to edit — skip level-1 title (body="---")
  const derivedSection = workspace
    ? (selectedSectionId
        ? (workspace.sections.find(s => s.id === selectedSectionId) ?? null)
        : (workspace.sections.find(s => s.body && s.body.trim() !== '---' && s.body.trim().length > 5) ??
           (workspace.sections.length > 1 ? workspace.sections[1] : workspace.sections[0]) ??
           null))
    : null;

  // Auto-set selectedSectionId once a good section is found
  useEffect(() => {
    if (!selectedSectionId && derivedSection) {
      setSelectedSectionId(derivedSection.id);
    }
  }, [selectedSectionId, derivedSection]);

  if (!policy) {
    return (
      <div className="rounded-xl border border-[#D70101]/30 bg-[#D70101]/5 p-4 font-roboto text-sm text-[#D70101]">
        Draft policy not found.
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="rounded-xl border border-ci-teal/30 bg-ci-teal/5 p-4 font-roboto text-sm text-ci-teal">
        Loading draft workspace…
      </div>
    );
  }

  function promote() {
    setLifecycleStatus(policy!.id, 'Under Review', 'Author', 'Promoted from draft workspace');
  }

  const editableBody = derivedSection?.body ?? '';

  function onBodyChange(value: string) {
    if (!derivedSection) return;
    updateSectionBody(policy!.id, derivedSection.id, value, 'Author');
  }

  // Sections available in the dropdown (meaningful, level > 1)
  const editableSections = workspace.sections.filter(
    s => s.level > 1 && s.body !== undefined,
  );

  // Sections to show in preview (non-empty)
  const previewSections = workspace.sections.filter(
    s => s.body && s.body.trim() !== '---' && s.body.trim().length > 0,
  );

  return (
    <div className="space-y-5">
      {/* AUDITOR MODE NOTICE */}
      {isAuditorMode && (
        <div className="flex items-center gap-3 rounded-xl border border-[#C74600]/30 bg-[#C74600]/5 px-5 py-3">
          <AlertTriangle size={16} className="shrink-0 text-[#C74600]" />
          <p className="font-montserrat text-sm font-bold text-[#C74600]">Auditor Mode — editing disabled</p>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="rounded-2xl bg-ci-teal px-6 py-5 text-white shadow">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-[10px] font-montserrat font-bold uppercase tracking-widest text-white/60">
              Draft Workspace
            </p>
            <h2 className="font-montserrat text-xl font-extrabold leading-tight">{policy.title}</h2>
            <p className="mt-1 font-mono text-xs text-white/70">{policy.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[9px] font-montserrat font-bold uppercase tracking-widest text-white/60">Version</p>
              <p className="font-mono text-base font-bold">{workspace.version}</p>
            </div>
            {workspace.unsavedChanges ? (
              <span className="rounded-lg border border-[#FFC700]/40 bg-[#FFC700]/10 px-3 py-1.5 text-xs font-montserrat font-bold text-[#FFC700]">
                Unsaved Changes
              </span>
            ) : (
              <span className="flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-montserrat font-bold text-white/80">
                <CheckCircle size={11} /> Saved
              </span>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Domain', policy.domainCode],
            ['Subdomain', policy.subdomainCode],
            ['Tier', policy.tier],
            ['Owner', policy.ownerSteward],
          ].map(([k, v]) => (
            <div key={k}>
              <p className="text-[9px] font-montserrat font-bold uppercase tracking-widest text-white/50">{k}</p>
              <p className="truncate text-xs font-semibold text-white">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PANE TOGGLE */}
      <div className="flex w-fit gap-1 rounded-xl border border-ci-border bg-white p-1">
        {(['edit', 'preview'] as const).map(pane => (
          <button
            key={pane}
            onClick={() => setActivePane(pane)}
            className={`rounded-lg px-5 py-2 text-xs font-montserrat font-bold capitalize transition-colors ${
              activePane === pane ? 'bg-ci-teal text-white shadow-sm' : 'text-ci-body hover:text-ci-ink'
            }`}
          >
            {pane === 'edit' ? 'Edit Section' : 'Document Preview'}
          </button>
        ))}
      </div>

      {/* ── EDIT PANE ── */}
      {activePane === 'edit' && (
        <section className="rounded-2xl border border-ci-border bg-white p-6 shadow-sm">
          {editableSections.length > 1 && (
            <div className="mb-5">
              <label className="mb-2 block text-[10px] font-montserrat font-bold uppercase tracking-widest text-ci-body">
                Editing Section
              </label>
              <div className="relative">
                <select
                  value={derivedSection?.id ?? ''}
                  onChange={e => setSelectedSectionId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-ci-border bg-ci-surface px-4 py-2.5 pr-9 font-roboto text-sm text-ci-ink focus:border-ci-teal focus:outline-none focus:ring-1 focus:ring-ci-teal"
                >
                  {editableSections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.title.replace(/\\/g, '')}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ci-body" />
              </div>
            </div>
          )}
          <label className="mb-2 block text-[10px] font-montserrat font-bold uppercase tracking-widest text-ci-body">
            Section Content
          </label>
          <textarea
            className="min-h-[400px] w-full rounded-xl border border-ci-border bg-ci-surface p-4 font-mono text-sm text-ci-ink focus:border-ci-teal focus:outline-none focus:ring-1 focus:ring-ci-teal disabled:opacity-60"
            value={editableBody}
            onChange={e => onBodyChange(e.target.value)}
            disabled={isAuditorMode}
            placeholder={isAuditorMode ? 'Read-only in auditor mode' : 'Enter section content…'}
          />
          <div className="mt-4 flex items-center justify-between">
            <p className={`font-roboto text-xs ${workspace.unsavedChanges ? 'text-[#FFC700]' : 'text-ci-body'}`}>
              {workspace.unsavedChanges ? '⚠ Changes not yet saved' : '✓ All changes saved'}
            </p>
            <button
              type="button"
              onClick={promote}
              disabled={isAuditorMode}
              className="flex items-center gap-2 rounded-xl bg-ci-teal px-5 py-2.5 font-montserrat text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FileText size={14} /> Promote to Review
            </button>
          </div>
        </section>
      )}

      {/* ── DOCUMENT PREVIEW PANE ── */}
      {activePane === 'preview' && (
        <section className="overflow-hidden rounded-2xl border border-ci-border bg-white shadow-sm">
          <div className="border-b border-ci-border bg-ci-surface px-6 py-3">
            <p className="text-[10px] font-montserrat font-bold uppercase tracking-widest text-ci-body">
              Document Preview — {previewSections.length} section{previewSections.length !== 1 ? 's' : ''} loaded
            </p>
          </div>
          <div className="divide-y divide-ci-border">
            {previewSections.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                <Edit3 size={28} className="mb-3 text-ci-border" />
                <p className="font-montserrat text-sm font-bold text-ci-ink">No content yet</p>
                <p className="mt-1 font-roboto text-xs text-ci-body">
                  Switch to &ldquo;Edit Section&rdquo; to add content.
                </p>
              </div>
            ) : (
              previewSections.map(section => (
                <div key={section.id} className="px-6 py-4">
                  {section.level > 1 && (
                    <h3
                      className={`mb-2 font-montserrat font-bold ${
                        section.level === 2 ? 'text-sm text-ci-ink' : 'text-xs text-ci-teal'
                      }`}
                    >
                      {section.title.replace(/\\/g, '')}
                    </h3>
                  )}
                  <PreviewMarkdown text={section.body} />
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}
