/**
 * BottomSheetDrawer — mobile-first bottom-sheet drawer primitive.
 *
 * MVP §C4 / Lead 16 C4: bottom sheet on viewports < 1024 px.
 * Mirrors RightDrawer's prop API exactly so callers can swap between the
 * two based on breakpoint without learning a new interface.
 *
 * Why this exists alongside RightDrawer:
 *   RightDrawer slides in from the right edge — ideal for wide viewports
 *   where the side panel doesn't consume the full screen. BottomSheetDrawer
 *   rises from the bottom — the standard mobile pattern where horizontal
 *   space is constrained. Both share the same logical prop surface so a
 *   single responsive wrapper can conditionally render one or the other.
 *
 * Deliberately out of scope (parity with RightDrawer, separate tickets):
 *   - Focus trap (RightDrawer also omits this per MVP plan)
 *   - IndexedDB / session persistence of open state
 */
import { type ReactNode, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { UtilityButton } from './UtilityButton';

export interface BottomSheetDrawerProps {
  open: boolean;
  onClose: () => void;
  /** Max height as viewport-relative cap. Default 'lg' = min(80vh, 80% safe viewport). */
  height?: 'sm' | 'md' | 'lg';
  eyebrow?: string;
  title?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Render inline (non-fixed) — host manages positioning. Same as RightDrawer. */
  inline?: boolean;
  /** Disable swipe-to-dismiss gesture. Default false. */
  disableSwipeDismiss?: boolean;
}

/** maxHeight CSS value per height variant. */
const MAX_HEIGHT: Record<NonNullable<BottomSheetDrawerProps['height']>, string> = {
  sm: 'min(40vh, 40%)',
  md: 'min(60vh, 60%)',
  lg: 'min(80vh, 80%)',
};

/**
 * BottomSheetDrawer — slides up from the bottom of the viewport.
 * Slide-up entrance, swipe-down dismiss, backdrop-tap close, Escape key.
 */
export function BottomSheetDrawer({
  open,
  onClose,
  height = 'lg',
  eyebrow,
  title,
  headerActions,
  footer,
  children,
  inline = false,
  disableSwipeDismiss = false,
}: BottomSheetDrawerProps) {
  const sheetRef = useRef<HTMLElement>(null);

  // ── Escape key dismiss (mirrors RightDrawer) ──────────────────────────────
  useEffect(() => {
    if (!open || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, inline]);

  // ── Swipe-to-dismiss gesture ──────────────────────────────────────────────
  const swipeState = useRef<{
    startY: number;
    startTime: number;
    active: boolean;
  } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disableSwipeDismiss) return;
    swipeState.current = {
      startY: e.touches[0].clientY,
      startTime: Date.now(),
      active: true,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disableSwipeDismiss || !swipeState.current?.active) return;
    const deltaY = e.changedTouches[0].clientY - swipeState.current.startY;
    const elapsed = Date.now() - swipeState.current.startTime;
    const velocity = elapsed > 0 ? deltaY / elapsed : 0;
    swipeState.current = null;
    if (deltaY > 80 || velocity > 0.5) onClose();
  };

  if (!open) return null;

  const ariaLabel = typeof title === 'string' ? title : 'Bottom sheet';

  const panel = (
    <aside
      ref={sheetRef}
      role="dialog"
      aria-modal={!inline}
      aria-label={ariaLabel}
      className="ci-glass-panel flex flex-col"
      style={{
        width: '100%',
        maxHeight: inline ? undefined : MAX_HEIGHT[height],
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: inline ? undefined : 'env(safe-area-inset-bottom)',
        animation: inline ? undefined : 'ci-sheet-slide-up 260ms var(--ease-standard) both',
      }}
    >
      {/* ── Drag handle ─────────────────────────────────────────────────── */}
      {!inline && (
        <div
          role="presentation"
          aria-hidden
          className="flex shrink-0 justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="rounded-full"
            style={{
              width: 44,
              height: 4,
              background: 'var(--ci-border-strong)',
            }}
          />
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      {(title || eyebrow || headerActions) && (
        <header
          className="flex items-center justify-between gap-3 shrink-0"
          style={{
            padding: 'clamp(12px, 1.5vh, 16px) clamp(12px, 1.6vw, 24px)',
            borderBottom: '1px solid var(--ci-border)',
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="min-w-0">
            {eyebrow && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--ci-text-subtle)',
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div
                className="font-montserrat truncate"
                style={{ color: 'var(--ci-text-primary)', fontSize: 18, fontWeight: 600 }}
              >
                {title}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {headerActions}
            <UtilityButton ariaLabel="Close panel" onClick={onClose}>
              <X size={18} aria-hidden="true" />
            </UtilityButton>
          </div>
        </header>
      )}

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto" style={{ padding: 'clamp(12px, 1.6vw, 24px)' }}>
        {children}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      {footer && (
        <footer
          className="shrink-0"
          style={{ padding: 16, borderTop: '1px solid var(--ci-border)' }}
        >
          {footer}
        </footer>
      )}
    </aside>
  );

  if (inline) return panel;

  return (
    <>
      {/* Keyframe injected once per mount; harmless if already in sheet */}
      <style>{`
        @keyframes ci-sheet-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes ci-sheet-slide-up {
            from { opacity: 0; }
            to   { opacity: 1; }
          }
        }
      `}</style>

      <div
        className="fixed inset-0 z-[60] flex flex-col justify-end"
        role="presentation"
      >
        {/* Scrim — same rgba as RightDrawer */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(15,23,28,0.45)' }}
          onClick={onClose}
        />
        <div className="relative w-full">{panel}</div>
      </div>
    </>
  );
}
