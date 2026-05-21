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
import { type ReactNode, useEffect, useRef, useState } from 'react';
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
  /**
   * Glass aesthetic variant.
   * - 'ci-ion' (default): current production CI-ION maroon glass
   * - 'v3-veil': premium V3 dark matte slate-carbon veil glass (expensive CES drawers)
   *   Uses 0.33 borders, 32px blur, 0.7s signature cubic-bezier motion.
   */
  glassVariant?: 'ci-ion' | 'v3-veil';
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
  glassVariant = 'ci-ion',
}: BottomSheetDrawerProps) {
  const sheetRef = useRef<HTMLElement>(null);
  // V3 expensive transition controller — smooth close for bottom sheets too
  const [isVisible, setIsVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  // ── Escape key dismiss (mirrors RightDrawer) — active while visible (incl. during V3 exit) ──────────────────────────────
  useEffect(() => {
    if (!isVisible || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isVisible, onClose, inline]);

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

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    } else if (isVisible && !isExiting) {
      setIsExiting(true);
      closeTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
        closeTimerRef.current = null;
      }, 680);
    }
  }, [open, isVisible, isExiting]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  if (!isVisible) return null;

  const isV3 = glassVariant === 'v3-veil';
  const ariaLabel = typeof title === 'string' ? title : 'Bottom sheet';

  const panel = (
    <aside
      ref={sheetRef}
      role="dialog"
      aria-modal={!inline}
      aria-label={ariaLabel}
      className={
        isV3
          ? `v3-veil-glass-panel bottom-sheet flex flex-col ${isExiting ? 'v3-drawer-exiting' : 'v3-drawer-panel'}`
          : `ci-glass-panel flex flex-col ${isExiting ? 'v3-drawer-exiting' : ''}`
      }
      style={{
        width: '100%',
        maxHeight: inline ? undefined : MAX_HEIGHT[height],
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: inline ? undefined : 'env(safe-area-inset-bottom)',
        ...(isV3 && { borderColor: 'var(--v3-border)' }),
        // V3 expensive-feeling close (translateY + scale + blur, 0.62s)
        transition: 'transform 0.62s var(--v3-ease), opacity 0.62s var(--v3-ease), filter 0.5s var(--v3-ease)',
        transform: isExiting ? 'translateY(60px) scale(0.985)' : 'translateY(0)',
        opacity: isExiting ? 0 : 1,
        filter: isExiting ? 'blur(3px)' : 'none',
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
              background: isV3 ? 'var(--v3-border)' : 'var(--ci-border-strong)',
              opacity: isV3 ? 0.7 : 1,
            }}
          />
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────────────────── */}
      {(title || eyebrow || headerActions) && (
        <header
          className="flex items-center justify-between gap-3 shrink-0 v3-drawer-header"
          style={{
            padding: 'clamp(14px, 1.6vh, 18px) clamp(14px, 1.7vw, 26px)',
            borderBottom: isV3 ? '1px solid var(--v3-border)' : '1px solid var(--ci-border)',
            background: isV3 ? 'rgba(255,255,255,0.015)' : undefined,
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
                  color: isV3 ? 'var(--v3-text-tertiary)' : 'var(--ci-text-subtle)',
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div
                className="font-montserrat truncate"
                style={{ 
                  color: isV3 ? 'var(--v3-text-primary)' : 'var(--ci-text-primary)', 
                  fontSize: 18, 
                  fontWeight: 600,
                  letterSpacing: '-0.01em'
                }}
              >
                {title}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {headerActions}
            {isV3 ? (
              <button
                type="button"
                onClick={onClose}
                className="v3-veil-close p-1.5 text-[var(--v3-text-secondary)] hover:text-[var(--v3-teal-light)] v3-micro"
                aria-label="Close panel"
              >
                <X size={18} aria-hidden="true" />
              </button>
            ) : (
              <UtilityButton ariaLabel="Close panel" onClick={onClose}>
                <X size={18} aria-hidden="true" />
              </UtilityButton>
            )}
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
          style={{ padding: 16, borderTop: isV3 ? '1px solid var(--v3-border)' : '1px solid var(--ci-border)' }}
        >
          {footer}
        </footer>
      )}
    </aside>
  );

  if (inline) return panel;

  return (
    <>
      <div
        className="fixed inset-0 z-[70] flex flex-col justify-end"
        role="presentation"
      >
        {/* Scrim — premium V3 veil or legacy */}
        <div
          className="absolute inset-0"
          style={{
            ...(isV3 
              ? { background: 'rgba(5, 6, 10, 0.72)', backdropFilter: 'blur(8px)' } 
              : { background: 'rgba(15,23,28,0.45)' }),
            transition: 'opacity 0.62s var(--v3-ease)',
            opacity: isExiting ? 0 : 1,
          }}
          onClick={onClose}
        />
        <div className="relative w-full">{panel}</div>
      </div>
    </>
  );
}
