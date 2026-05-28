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
   * V3 is the production default. The legacy value remains in the type only
   * while older call sites are migrated.
   */
  glassVariant?: 'ci-ion' | 'v3-veil';
  /** Progressive disclosure layer. Layer 1 is brief/minimal; Layer 2 is rich detail. */
  layer?: 1 | 2;
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
  glassVariant = 'v3-veil',
  layer = 2,
}: BottomSheetDrawerProps) {
  const sheetRef = useRef<HTMLElement>(null);
  // Keep DOM mounted briefly during close for exit-down dismissal.
  const [isVisible, setIsVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

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
      if (!isVisible && typeof document !== 'undefined') {
        openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      }
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
        openerRef.current?.focus();
        openerRef.current = null;
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
      aria-modal="true"
      aria-label={ariaLabel}
      data-veil-layer={layer}
      className={
        `v3-veil-glass-panel bottom-sheet flex flex-col ${isExiting ? 'v3-drawer-exit-down' : 'v3-drawer-enter-up'}`
      }
      style={{
        width: '100%',
        maxHeight: inline ? undefined : MAX_HEIGHT[height],
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingBottom: inline ? undefined : 'env(safe-area-inset-bottom)',
        ...(isV3 && { borderColor: 'var(--v3-border)' }),
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
              background: 'var(--v3-border)',
              opacity: 0.7,
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
            borderBottom: '1px solid var(--v3-border-subtle)',
            background: 'transparent',
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
                  color: 'var(--v3-text-tertiary)',
                }}
              >
                {eyebrow}
              </div>
            )}
            {title && (
              <div
                className="font-montserrat truncate"
                style={{
                  color: 'var(--v3-text-primary)',
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
            <button
              type="button"
              onClick={onClose}
              className="v3-veil-close p-1.5 text-[var(--v3-text-secondary)] hover:text-[var(--v3-teal-light)]"
              aria-label="Close panel"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </header>
      )}

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <div className="v3-veil-body flex-1 overflow-auto" style={{ padding: 'clamp(12px, 1.6vw, 24px)' }}>
        {children}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      {footer && (
        <footer
          className="shrink-0"
          style={{ padding: 16, borderTop: '1px solid var(--v3-border-subtle)' }}
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
            background: 'rgba(5, 6, 10, 0.72)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'opacity 220ms var(--v3-ease)',
            opacity: isExiting ? 0 : 1,
          }}
          onClick={onClose}
        />
        <div className="relative w-full">{panel}</div>
      </div>
    </>
  );
}
