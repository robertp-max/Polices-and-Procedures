/**
 * ContextualKnowledgeBulb
 *
 * A subtly animated light bulb icon in the app header that opens a modal
 * showing the knowledge article relevant to the current page.
 *
 * Design contract:
 * - Renders a Lightbulb icon with gentle opacity/scale pulse (no layout properties animated)
 * - Respects prefers-reduced-motion
 * - Hover tooltip: "View knowledge article"
 * - Click: opens modal with the article for the current route
 * - User can permanently disable via localStorage key
 * - No auto-open, no flicker, no layout shift
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lightbulb, X, ExternalLink, BellOff, Bell, ShieldCheck, ChevronRight } from 'lucide-react';
import { resolveContextualArticle } from '@/policy/help/contextualArticleMap';
import { findArticle, type HelpArticle } from '@/policy/help/articles';

// ── Persistence ───────────────────────────────────────────────────────────────
const STORAGE_KEY = 'careindeed.help.contextualBulb.enabled.v1';

function readEnabled(): boolean {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === null ? true : v === 'true'; // default: enabled
  } catch {
    return true;
  }
}

function writeEnabled(value: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}

// ── Reduced Motion Check ──────────────────────────────────────────────────────
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

// ── Article Modal ─────────────────────────────────────────────────────────────
interface ModalProps {
  article: HelpArticle;
  pageName: string;
  helpCenterPath: string;
  onClose: () => void;
  onDisable: () => void;
}

function KnowledgeModal({ article, pageName, helpCenterPath, onClose, onDisable }: ModalProps) {
  const navigate = useNavigate();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus modal on open
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Escape key close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Trap focus inside modal (basic: close on outside click)
  function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function openHelpCenter() {
    onClose();
    navigate(helpCenterPath);
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(31,28,27,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onBackdropClick}
      aria-label="Knowledge article backdrop"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Knowledge article: ${article.title}`}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col outline-none"
        style={{ border: '1px solid #E5E4E3' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between p-5 pb-4 border-b border-[#E5E4E3] shrink-0"
          style={{ borderRadius: '16px 16px 0 0' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(0,121,112,0.1)' }}
            >
              <Lightbulb size={18} className="text-[#007970]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-montserrat font-semibold text-[#C74601] uppercase tracking-widest mb-0.5">
                Knowledge Article · {pageName}
              </p>
              <h2 className="text-[16px] font-montserrat font-bold text-[#1F1C1B] leading-tight truncate max-w-[380px]">
                {article.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close knowledge article"
            className="ml-3 shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#52404B] hover:bg-[#F5F4F3] hover:text-[#1F1C1B] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-[14px] font-roboto">
          {/* Purpose */}
          <section>
            <h3 className="text-[10px] font-montserrat font-semibold text-[#52404B] uppercase tracking-widest mb-2">Purpose</h3>
            <p className="text-[#1F1C1B] leading-relaxed">{article.purpose}</p>
          </section>

          {/* Compliance Requirement — highlighted */}
          {article.complianceRequirement && (
            <section
              className="rounded-xl p-4"
              style={{ background: 'rgba(199,70,1,0.06)', border: '1px solid rgba(199,70,1,0.18)' }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={14} className="text-[#C74601] shrink-0" />
                <h3 className="text-[10px] font-montserrat font-semibold text-[#C74601] uppercase tracking-widest">Compliance Requirement</h3>
              </div>
              <p className="text-[#1F1C1B] leading-relaxed">{article.complianceRequirement}</p>
            </section>
          )}

          {/* Steps */}
          {!!article.steps?.length && (
            <section>
              <h3 className="text-[10px] font-montserrat font-semibold text-[#52404B] uppercase tracking-widest mb-2">Step by Step</h3>
              <ol className="space-y-1.5">
                {article.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#1F1C1B] leading-relaxed">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-white"
                      style={{ background: '#007970' }}
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Enforcement Rules */}
          {!!article.enforcementRules?.length && (
            <section>
              <h3 className="text-[10px] font-montserrat font-semibold text-[#52404B] uppercase tracking-widest mb-2">Enforcement Rules</h3>
              <ul className="space-y-1.5">
                {article.enforcementRules.map((rule, i) => (
                  <li key={i} className="flex items-start gap-2 text-[#1F1C1B] leading-relaxed">
                    <ChevronRight size={14} className="text-[#C74601] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Failure Impact */}
          {article.failureImpact && (
            <section
              className="rounded-xl p-4"
              style={{ background: '#FFF5F0', border: '1px solid #FFD5BF' }}
            >
              <h3 className="text-[10px] font-montserrat font-semibold text-[#C74601] uppercase tracking-widest mb-2">Failure Impact</h3>
              <p className="text-[#1F1C1B] leading-relaxed">{article.failureImpact}</p>
            </section>
          )}

          {/* Traceability */}
          {article.traceability && (
            <section>
              <h3 className="text-[10px] font-montserrat font-semibold text-[#52404B] uppercase tracking-widest mb-2">Traceability</h3>
              <div
                className="rounded-lg p-3 font-mono text-[12px] space-y-1"
                style={{ background: '#FAFBF8', border: '1px solid #E5E4E3' }}
              >
                {Object.entries(article.traceability).map(([key, val]) => (
                  <div key={key} className="flex gap-3">
                    <span className="text-[#007970] w-28 shrink-0">{key}:</span>
                    <span className="text-[#52404B] break-all">{val ?? 'GAP'}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Compliance Impact */}
          <section>
            <h3 className="text-[10px] font-montserrat font-semibold text-[#52404B] uppercase tracking-widest mb-2">Compliance Impact</h3>
            <p className="text-[#1F1C1B] leading-relaxed">{article.complianceImpact}</p>
          </section>

          {/* Evidence */}
          <section>
            <h3 className="text-[10px] font-montserrat font-semibold text-[#52404B] uppercase tracking-widest mb-2">Evidence Generated</h3>
            <p className="text-[#1F1C1B] leading-relaxed">{article.evidence}</p>
          </section>
        </div>

        {/* Footer */}
        <div
          className="shrink-0 flex items-center justify-between gap-3 px-5 py-4 border-t border-[#E5E4E3]"
          style={{ borderRadius: '0 0 16px 16px', background: '#FAFBF8' }}
        >
          <button
            type="button"
            onClick={onDisable}
            className="flex items-center gap-1.5 text-[11px] font-roboto text-[#52404B] hover:text-[#C74601] transition-colors"
          >
            <BellOff size={13} />
            Turn off tips
          </button>
          <button
            type="button"
            onClick={openHelpCenter}
            className="flex items-center gap-1.5 text-[12px] font-montserrat font-semibold text-[#C74601] hover:text-[#A83B00] transition-colors"
          >
            Open Help Center
            <ExternalLink size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function ContextualKnowledgeBulb() {
  const location = useLocation();
  const prefersReducedMotion = usePrefersReducedMotion();

  const [enabled, setEnabled] = useState<boolean>(readEnabled);
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Resolve article for current route — memoised; stable until pathname changes
  const contextEntry = useMemo(
    () => resolveContextualArticle(location.pathname),
    [location.pathname],
  );

  const article = useMemo(
    () => (contextEntry ? findArticle(contextEntry.slug) : undefined),
    [contextEntry],
  );

  // Sync enabled state from localStorage on mount (handles cross-tab)
  useEffect(() => {
    setEnabled(readEnabled());
  }, []);

  const handleDisable = useCallback(() => {
    writeEnabled(false);
    setEnabled(false);
    setIsOpen(false);
  }, []);

  const handleEnable = useCallback(() => {
    writeEnabled(true);
    setEnabled(true);
  }, []);

  const handleOpen = useCallback(() => {
    if (article) setIsOpen(true);
  }, [article]);

  const handleClose = useCallback(() => setIsOpen(false), []);

  // Don't render if disabled — but still expose the enable button via a small
  // indicator that appears only on /help routes so the user can re-enable.
  if (!enabled) {
    const isHelpRoute = location.pathname.startsWith('/help');
    if (!isHelpRoute) return null;
    return (
      <button
        type="button"
        onClick={handleEnable}
        aria-label="Enable contextual tips"
        title="Enable contextual tips"
        className="flex items-center gap-1.5 text-[11px] font-roboto text-[#52404B] hover:text-[#007970] transition-colors px-3 py-1.5 rounded-full border border-[#E5E4E3] bg-white hover:border-[#007970]"
      >
        <Bell size={13} />
        Enable contextual tips
      </button>
    );
  }

  // If no article is mapped for this route, render nothing
  if (!article || !contextEntry) return null;

  return (
    <>
      {/* Bulb button — fixed in header via absolute positioning within the flex row */}
      <div className="relative shrink-0">
        <button
          type="button"
          aria-label="View knowledge article"
          title=""
          onClick={handleOpen}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          className="relative flex items-center justify-center w-9 h-9 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#007970] focus-visible:outline-offset-2"
          style={{
            background: 'transparent',
            animation: prefersReducedMotion ? 'none' : 'ci-bulb-pulse 2.6s ease-in-out infinite',
          }}
        >
          <Lightbulb
            size={20}
            className="text-[#007970]"
            aria-hidden="true"
          />
          {/* Glow ring */}
          {!prefersReducedMotion && (
            <span
              aria-hidden="true"
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                animation: 'ci-bulb-ring 2.6s ease-in-out infinite',
                background: 'radial-gradient(circle, rgba(0,121,112,0.22) 0%, transparent 70%)',
              }}
            />
          )}
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            role="tooltip"
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 pointer-events-none"
          >
            <div
              className="whitespace-nowrap text-[11px] font-roboto font-medium px-2.5 py-1.5 rounded-lg shadow-lg"
              style={{
                background: '#1F1C1B',
                color: '#FFFFFF',
              }}
            >
              View knowledge article
            </div>
            {/* Tooltip arrow */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45"
              style={{ background: '#1F1C1B' }}
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Keyframe styles — injected once */}
      <style>{`
        @keyframes ci-bulb-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          45% { opacity: 0.72; transform: scale(0.93); }
          55% { opacity: 0.72; transform: scale(0.93); }
        }
        @keyframes ci-bulb-ring {
          0%, 100% { opacity: 0; transform: scale(0.8); }
          45% { opacity: 1; transform: scale(1.35); }
          55% { opacity: 1; transform: scale(1.35); }
        }
      `}</style>

      {/* Modal portal */}
      {isOpen && article && contextEntry && (
        <KnowledgeModal
          article={article}
          pageName={contextEntry.pageName}
          helpCenterPath={contextEntry.helpCenterPath ?? '/help'}
          onClose={handleClose}
          onDisable={handleDisable}
        />
      )}
    </>
  );
}
