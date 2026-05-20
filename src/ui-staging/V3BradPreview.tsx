import { useState } from 'react'

// V3PageWrapper + canvas removed from root (prevents nesting inside V3PagePreview veil card; Brad chat now renders clean inner content for PDF fidelity)

// ============================================================
// V3BradPreview — Agent S11 Full Multi-Panel Restoration
// Exact visual match to the Brad AI Copilot screenshot in APP_Screenshots.pdf (page 8)
// using V3 Veil Glass reskin (vars, glass cards, v3-tab, v3-badge, teal accents).
// Restores: HealthStrip (static V3), StudioTabs (6 tabs), Command-like surface,
// ResponseStack (suggestions + structured cards + NoAnswer state), Right rail.
// Self-contained static demo with light interactivity for staging lab validation.
// ============================================================

const STUDIO_TABS = [
  { id: 'answer', label: 'Answer' },
  { id: 'audit', label: 'Pre-Survey Audit' },
  { id: 'action', label: 'Action Plan' },
  { id: 'brief', label: 'Governing Body' },
  { id: 'qapi', label: 'QAPI Digest' },
  { id: 'knowledge', label: 'Knowledge Article' },
] as const;

type StudioTabId = typeof STUDIO_TABS[number]['id'];

const DEFAULT_SUGGESTIONS = [
  'What CES items are overdue?',
  'What forms are missing for governing body?',
  'Summarize QAPI policies',
  'Show taxonomy for Clinical domain',
  'Open plan of care policy',
  'Create governing body brief for CMIA risk',
];

export function V3BradPreview() {
  const [activeTab, setActiveTab] = useState<StudioTabId>('answer');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [showResponse, setShowResponse] = useState(false);

  const handleSuggestionClick = (s: string) => {
    setSelectedSuggestion(s);
    setShowResponse(true);
    // Simulate tab switch to 'answer' on query
    setActiveTab('answer');
  };

  const resetDemo = () => {
    setSelectedSuggestion(null);
    setShowResponse(false);
  };

  return (
    <div className="v3-no-scrollbar p-2 text-[var(--v3-text-primary)] flex flex-col h-full min-h-[520px]" style={{ minHeight: '100%' }}>
        {/* Header — V3 reskin matching screenshot */}
        <div className="flex items-center gap-3 pb-3 border-b border-[var(--v3-border)] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--v3-accent-teal)] to-[#00D1C1] flex items-center justify-center text-lg shadow">
            🤖
          </div>
          <div>
            <div className="text-[22px] font-semibold tracking-[-0.2px]">Brad AI Copilot</div>
            <div className="text-[13px] text-[var(--v3-text-secondary)] -mt-0.5">
              Query CMS guidelines and system-wide operational frameworks.
            </div>
          </div>
          <div className="flex-1" />
          <div className="text-[10px] uppercase tracking-[1.5px] px-3 py-0.5 rounded border border-[var(--v3-border)] text-[var(--v3-text-tertiary)] font-mono">
            V3 VEIL GLASS
          </div>
        </div>

        {/* HealthStrip — V3 reskin (corpus + inference status ribbon, static for preview) */}
        <div
          className="mt-3 w-full flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.09)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
          }}
        >
          <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--v3-text-secondary)' }}>
            <span className="text-[var(--v3-teal-light)]">●</span> BRAD INTERNAL CORPUS
            <span style={{ color: '#6EE7B7' }}>ready</span> — 1,842 docs / 47k chunks
          </span>
          <span className="inline-flex items-center gap-1.5" style={{ color: 'var(--v3-text-secondary)' }}>
            <span className="text-[var(--v3-teal-light)]">●</span> INFERENCE ENGINE
            <span style={{ color: '#6EE7B7' }}>ollama</span> — llama3.2 ready
          </span>
          <div className="flex-1" />
          <span
            className="text-[10px] uppercase tracking-[0.18em] px-2 py-0.5 rounded border"
            style={{ borderColor: 'rgba(255,255,255,0.12)', color: 'var(--v3-text-tertiary)' }}
          >
            Local Preview — static deploy
          </span>
        </div>

        {/* Meta bar matching screenshot (BRAD • QUERY • 142ms) */}
        <div
          className="mt-2 mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[1.5px] font-mono px-1"
          style={{ color: 'var(--v3-text-tertiary)' }}
        >
          <span className="text-[var(--v3-teal-light)] font-semibold">BRAD</span>
          <span>•</span>
          <span>QUERY</span>
          <span>•</span>
          <span>142ms</span>
          <span className="ml-2 text-[9px] normal-case tracking-normal opacity-60">(V3 reskin of real iAdministrator workspace)</span>
          {showResponse && (
            <button onClick={resetDemo} className="ml-auto text-[9px] underline hover:no-underline opacity-70">Reset demo</button>
          )}
        </div>

        {/* StudioTabs — exact 6-tab structure, V3 v3-tab styling */}
        <div className="flex gap-px border-b border-[var(--v3-border)] pb-1 flex-shrink-0 overflow-x-auto">
          {STUDIO_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="v3-tab text-xs px-3 py-1.5"
              data-active={activeTab === tab.id}
              style={{ fontSize: '11px', letterSpacing: '0.5px' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TWO-COLUMN WORKSPACE — Left: ResponseStack, Right: Rail (exact match to PDF screenshot) */}
        <div className="flex-1 flex gap-4 mt-4 overflow-hidden min-h-0">
          {/* LEFT COLUMN: Command surface + ResponseStack (suggestions + structured state) */}
          <div className="flex-1 flex flex-col min-w-0 gap-3 overflow-hidden">
            {/* CommandBar-like input (V3 glass) */}
            <div
              className="v3-input-wrapper flex items-center gap-2 px-4 py-3 rounded-2xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.025)' }}
            >
              <div className="text-[var(--v3-teal-light)]">⌘</div>
              <input
                className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-[var(--v3-text-tertiary)]"
                placeholder="Issue a compliance command or reference a policy/form ID…"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleSuggestionClick(e.currentTarget.value.trim());
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                className="v3-btn-primary px-5 py-1.5 text-xs font-bold"
                onClick={() => handleSuggestionClick(DEFAULT_SUGGESTIONS[0])}
              >
                Query
              </button>
            </div>

            {/* ResponseStack area — matches PDF screenshot content */}
            <div
              className="flex-1 overflow-y-auto pr-1 custom-scrollbar rounded-2xl p-4 flex flex-col gap-3"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid rgba(255,255,255,0.09)',
              }}
            >
              {!showResponse ? (
                <>
                  <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[var(--v3-text-tertiary)] mb-1">
                    SUGGESTED QUERIES (click to simulate)
                  </div>
                  {DEFAULT_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(s)}
                      className="text-left w-full px-4 py-3 rounded-xl text-[13px] transition-all hover:scale-[1.005] border border-[var(--v3-border)] hover:border-[var(--v3-teal-light)]"
                      style={{ background: 'rgba(255,255,255,0.02)' }}
                    >
                      {s}
                    </button>
                  ))}
                  <div className="pt-2 text-[10px] text-[var(--v3-text-tertiary)]">
                    Real ResponseStack renders: StructuredAnswer + RequirementsSnapshot + CitationChips + AvailableActions + OperationalGaps + RegulatoryAlerts
                  </div>
                </>
              ) : (
                /* Simulated ResponseStack after selection — NoAnswer + suggestions like screenshot */
                <>
                  <div
                    className="rounded-2xl p-4 border border-dashed"
                    style={{ borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.02)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-[var(--v3-orange)]">⚠</div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm tracking-tight">No Direct Corpus Match</div>
                        <div className="text-[12px] text-[var(--v3-text-secondary)] mt-1 leading-snug">
                          The corpus did not return a literal match for “{selectedSuggestion}”. Brad will not fabricate an answer.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* StructuredAnswer / Requirements snapshot mock */}
                  <div
                    className="rounded-xl p-4 text-[13px] leading-[1.4]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    <div className="uppercase text-[10px] tracking-[0.5px] text-[var(--v3-teal-light)] mb-2 font-semibold">BRAD • {activeTab.toUpperCase()} • STRUCTURED</div>
                    <div className="text-[var(--v3-text-primary)]">
                      Closest regulatory scenario applied. Review the guidance below for CES / QAPI alignment and next actions.
                    </div>
                    <div className="mt-3 pt-3 border-t border-[var(--v3-border-subtle)] text-xs text-[var(--v3-text-secondary)]">
                      Citations: 4 passages • Policy anchors: GV-GB-001, CO-CA-003, EN-TG-001
                    </div>
                  </div>

                  {/* Available actions mock (part of ResponseStack) */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['Open referenced policy', 'Create evidence task', 'Schedule QAPI review', 'Export brief'].map((a, i) => (
                      <span key={i} className="v3-badge text-xs cursor-default">{a}</span>
                    ))}
                  </div>

                  <button onClick={resetDemo} className="text-[11px] self-start mt-1 underline text-[var(--v3-text-tertiary)]">← Back to suggestions</button>
                </>
              )}
            </div>
          </div>

          {/* RIGHT RAIL — matches PDF screenshot exactly: AI • 1 of 1 + No results + query suggestions list */}
          <div
            className="hidden lg:flex w-[340px] flex-col flex-shrink-0 rounded-2xl p-4 gap-3 overflow-y-auto"
            style={{
              background: 'rgba(255,255,255,0.018)',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[1px] font-mono text-[var(--v3-text-tertiary)]">
              <span>AI • 1 of 1</span>
              <span className="text-[var(--v3-teal-light)]">Right Panel Preview</span>
            </div>

            <div
              className="rounded-xl p-4 text-[12px] leading-[1.45]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="font-semibold mb-2">No results found for this query.</div>
              <div className="text-[var(--v3-text-secondary)]">Try one of these query suggestions:</div>

              <div className="mt-3 flex flex-col gap-1.5">
                {DEFAULT_SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="text-left px-3 py-2 rounded-lg text-xs border border-transparent hover:border-[var(--v3-teal-light)] hover:bg-white/5 transition-colors"
                    style={{ color: 'var(--v3-text-secondary)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Right rail footer metadata matching real RightPanelPreview */}
            <div className="mt-auto pt-3 border-t border-[var(--v3-border-subtle)] text-[10px] text-[var(--v3-text-tertiary)] leading-tight">
              Right execution workspace.<br />
              Reference preview • Form staging • Linked policies • Print actions.
            </div>
            <div className="text-[9px] text-center text-[var(--v3-text-tertiary)] opacity-60">V3 RightPanelPreview (reskinned)</div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center text-[10px] text-[var(--v3-text-tertiary)] mt-3 flex-shrink-0">

        </div>
      </div>
  );
}
