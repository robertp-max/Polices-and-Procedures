import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, X, Check, FastForward, Compass, Sparkles } from 'lucide-react';
import { TOUR_CARDS, DECISION_INDEX, FINAL_INDEX, TOUR_STORAGE_KEYS } from './tourCards';
import { BradTourAvatar } from './BradTourAvatar';

/* ═══════════════════════════════════════════════════════════════
   GuidedTourOverlay — NON-BLOCKING floating assistant.

   - NO full-screen dim / modal overlay.
  - All cards: fixed bottom-right floating panel.
   - Spotlight: glow ring on anchor only — pointer-events: none.
   - App behind the tour is always visible and interactive.
   ═══════════════════════════════════════════════════════════════ */

export interface GuidedTourOverlayProps {
  required: boolean;
  onClose: () => void;
}

// ─── constants ──────────────────────────────────────────────────
const TRANSITION_MS        = 220;
const FLOATING_WIDTH       = 480;
const FLOATING_BOTTOM      = 24;
const FLOATING_RIGHT       = 24;

// ─── helpers ────────────────────────────────────────────────────
function setLocal(key: string, value: string): void {
  try { window.localStorage.setItem(key, value); } catch { /* noop */ }
}

function resolveAnchor(selector: string | string[] | undefined): HTMLElement | null {
  if (!selector) return null;
  const list = Array.isArray(selector) ? selector : [selector];
  for (const sel of list) {
    try {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el && el.getBoundingClientRect().width > 0) return el;
    } catch { /* invalid selector */ }
  }
  return null;
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);
  return reduced;
}

// ─── component ──────────────────────────────────────────────────
export function GuidedTourOverlay({ required, onClose }: GuidedTourOverlayProps) {
  void required;
  const [index, setIndex]   = useState(0);
  const [phase, setPhase]   = useState<'in' | 'out'>('in');
  const reducedMotion        = usePrefersReducedMotion();
  const navigate             = useNavigate();
  const total                = TOUR_CARDS.length;
  const card                 = TOUR_CARDS[index];
  const isFirst              = index === 0;
  const isDecision           = card.kind === 'decision';
  const isFinal              = card.kind === 'final';
  const pendingDir           = useRef<1 | -1>(1);
  const [isMobile, setIsMobile] = useState(() => (typeof window === 'undefined' ? false : window.innerWidth < 768));
  const transDur             = reducedMotion ? 0 : TRANSITION_MS;

  // ── single-mount instrumentation ───────────────────────────────
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[GuidedTourOverlay] MOUNT');
    return () => {
      // eslint-disable-next-line no-console
      console.log('[GuidedTourOverlay] UNMOUNT');
    };
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const warnedAnchorsRef = useRef<Set<string>>(new Set());


  // Navigate to card route (deduped + checks current pathname to avoid loops).
  const lastRoute = useRef<string | null>(null);
  useEffect(() => {
    if (phase !== 'in') return;
    if (!card.route) return;
    if (lastRoute.current === card.route) return;
    if (typeof window !== 'undefined' && window.location.pathname === card.route) {
      lastRoute.current = card.route;
      return;
    }
    lastRoute.current = card.route;
    navigate(card.route);
  }, [card.route, phase, navigate]);

  // Stability mode: no anchor-driven card movement.
  // Keep a single warning per card when anchor is not found.
  useEffect(() => {
    if (!card.anchorSelector) return;
    const t = window.setTimeout(() => {
      const el = resolveAnchor(card.anchorSelector);
      if (!el && !warnedAnchorsRef.current.has(card.id)) {
        warnedAnchorsRef.current.add(card.id);
        // eslint-disable-next-line no-console
        console.warn(`[GuidedTourOverlay] anchor not found for "${card.id}".`);
      }
    }, 150);
    return () => window.clearTimeout(t);
  }, [card.anchorSelector, card.id]);

  // Card transition.
  const advance = useCallback((dir: 1 | -1) => {
    if (reducedMotion) {
      setIndex((i) => Math.max(0, Math.min(total - 1, i + dir)));
      return;
    }
    pendingDir.current = dir;
    setPhase('out');
  }, [reducedMotion, total]);

  useEffect(() => {
    if (phase !== 'out') return;
    const t = window.setTimeout(() => {
      setIndex((i) => Math.max(0, Math.min(total - 1, i + pendingDir.current)));
      setPhase('in');
    }, transDur);
    return () => window.clearTimeout(t);
  }, [phase, transDur, total]);

  // Action handlers.
  const handleSkip        = useCallback(() => { setLocal(TOUR_STORAGE_KEYS.skipped, 'true'); onClose(); }, [onClose]);
  const handleFinishBasic = useCallback(() => { setLocal(TOUR_STORAGE_KEYS.completedBasic, 'true'); onClose(); }, [onClose]);
  const handleContinueFull = useCallback(() => { setLocal(TOUR_STORAGE_KEYS.completedBasic, 'true'); advance(1); }, [advance]);
  const handleFinishFull  = useCallback(() => {
    setLocal(TOUR_STORAGE_KEYS.completedBasic, 'true');
    setLocal(TOUR_STORAGE_KEYS.completedFull, 'true');
    setLocal(TOUR_STORAGE_KEYS.completed, 'true');
    onClose();
  }, [onClose]);
  const handleAskBrad = useCallback(() => {
    setLocal(TOUR_STORAGE_KEYS.completedBasic, 'true');
    setLocal(TOUR_STORAGE_KEYS.completedFull, 'true');
    setLocal(TOUR_STORAGE_KEYS.completed, 'true');
    onClose();
    navigate('/iadministrator');
  }, [onClose, navigate]);
  const handleNext = useCallback(() => { if (isFinal) { handleFinishFull(); return; } advance(1); }, [advance, isFinal, handleFinishFull]);
  const handleBack = useCallback(() => { if (isFirst) return; advance(-1); }, [advance, isFirst]);

  const canSkip = true;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canSkip) handleSkip();
      else if (e.key === 'ArrowRight' && !isDecision) handleNext();
      else if (e.key === 'ArrowLeft' && !isFirst) handleBack();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handleBack, canSkip, handleSkip, isFirst, isDecision]);

  const visible = phase === 'in';

  const wrapStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: isMobile ? 8 : FLOATING_BOTTOM,
    right: isMobile ? 8 : FLOATING_RIGHT,
    left: isMobile ? 8 : undefined,
    width: isMobile ? undefined : FLOATING_WIDTH,
    maxWidth: isMobile ? undefined : 'calc(100vw - 32px)',
    maxHeight: isMobile ? '58vh' : 'calc(100vh - 32px)',
    zIndex: 1000,
    pointerEvents: 'auto',
    transform: 'translateZ(0)',
    contain: 'layout paint',
    willChange: 'transform, opacity',
  };

  return (
    <>
      {/* Tour card — no dim layer, no blocking */}
      <div style={wrapStyle}>
        <div
          style={{
            overflowY: 'auto',
            overflowX: 'hidden',
            borderRadius: 18,
            background: '#FFFFFF',
            color: '#1F1C1B',
            border: '1px solid #E5E4E3',
            boxShadow: '0 14px 38px rgba(15,23,42,0.14)',
            fontFamily: "'Roboto', 'Inter', system-ui, sans-serif",
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100vh - 32px)',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(10px)',
            transition: `opacity ${transDur}ms ease, transform ${transDur}ms ease`,
            willChange: 'opacity, transform',
            contain: 'layout paint',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Skip button */}
          {canSkip && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                zIndex: 2,
              }}
            >
              <button
                type="button"
                onClick={handleSkip}
                aria-label="Skip tour"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: '#F8FAFC',
                  color: '#334155',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                }}
              >
                <FastForward size={11} /> Skip
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Exit tour"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '5px 10px',
                  borderRadius: 999,
                  background: '#FFFFFF',
                  color: '#334155',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  border: '1px solid #CBD5E1',
                  cursor: 'pointer',
                }}
              >
                <X size={11} /> Exit
              </button>
            </div>
          )}

          {/* Body */}
          <div
            style={{
              padding: '20px 22px 14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <BradTourAvatar size={38} variant="circle" />
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#64748B',
                  fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                }}
              >
                Brad · Step {index + 1}/{total}
              </span>
            </div>

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h2
                style={{
                  fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
                  fontSize: 16,
                  lineHeight: 1.25,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {card.title}
              </h2>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: '#334155',
                  margin: 0,
                }}
              >
                {card.body}
              </p>

              {/* Decision buttons */}
              {isDecision && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  <button type="button" onClick={handleFinishBasic} style={btnSecondaryFilled}>
                    <Check size={14} /> Finish Basic Tour
                  </button>
                  <button type="button" onClick={handleContinueFull} style={btnPrimary}>
                    <Compass size={14} /> Continue Full Tour
                  </button>
                  <button type="button" onClick={handleSkip} style={btnGhost}>
                    <FastForward size={13} /> Skip
                  </button>
                </div>
              )}

              {/* Final buttons */}
              {isFinal && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  <button type="button" onClick={handleFinishFull} style={btnPrimary}>
                    <Check size={14} /> Finish Tour
                  </button>
                  <button type="button" onClick={handleAskBrad} style={btnSecondaryFilled}>
                    <Sparkles size={14} /> Ask Brad
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Progress dots */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 4,
              padding: '2px 16px 8px',
            }}
          >
            {TOUR_CARDS.map((c, i) => (
              <span
                key={c.id}
                aria-hidden="true"
                style={{
                  width: i === index ? 16 : 5,
                  height: 4,
                  borderRadius: 2,
                  flexShrink: 0,
                    background:
                    i === index
                      ? '#007970'
                      : i === DECISION_INDEX
                        ? 'rgba(255,193,7,0.50)'
                        : i === FINAL_INDEX
                          ? 'rgba(199,70,0,0.50)'
                          : '#CBD5E1',
                  transition: 'width 140ms ease',
                }}
              />
            ))}
          </div>

          {/* Footer nav — Back / Next (decision & final have inline buttons) */}
          {!isDecision && !isFinal && (
            <div
              style={{
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                padding: '9px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              {!isFirst && (
                <button type="button" onClick={handleBack} style={btnSecondary}>
                  <ArrowLeft size={13} /> Back
                </button>
              )}
              <button type="button" onClick={handleNext} style={btnPrimary}>
                Next <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── button style constants ──────────────────────────────────────
const btnPrimary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '9px 16px',
  borderRadius: 8,
  background: '#C74600',
  color: '#FFFFFF',
  fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
  fontWeight: 700,
  fontSize: 13,
  border: 'none',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(199,70,0,0.22)',
};

const btnSecondary: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 13px',
  borderRadius: 8,
  background: '#FFFFFF',
  color: '#334155',
  fontFamily: "'Montserrat', 'Inter', system-ui, sans-serif",
  fontWeight: 600,
  fontSize: 13,
  border: '1px solid #CBD5E1',
  cursor: 'pointer',
};

const btnSecondaryFilled: React.CSSProperties = {
  ...btnSecondary,
  background: '#F8FAFC',
  padding: '9px 15px',
};

const btnGhost: React.CSSProperties = {
  ...btnSecondary,
  background: 'transparent',
  padding: '9px 15px',
};
