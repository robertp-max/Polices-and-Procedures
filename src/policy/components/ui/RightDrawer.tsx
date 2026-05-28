import { type ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  /**
   * Visual width tier. Default 'md'.
   * - sm: 420px — compact detail
   * - md: 520px — standard
   * - lg: 640px — workflow / PM panels
   * - xl: 800px — dense planner / multi-column detail (Wave 2)
   *
   * Inline mode ignores this and uses 100% of the host.
   */
  width?: 'sm' | 'md' | 'lg' | 'xl';
  eyebrow?: string;
  title?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Render inline (non-fixed) — use when host already manages positioning. */
  inline?: boolean;
  /**
   * Glass aesthetic variant.
   * V3 is the production default. The legacy value remains in the type only
   * while older call sites are migrated.
   */
  glassVariant?: 'ci-ion' | 'v3-veil';
  /** Progressive disclosure layer. Layer 1 is brief/minimal; Layer 2 is rich detail. */
  layer?: 1 | 2;
}

const WIDTH = { sm: 420, md: 520, lg: 640, xl: 800 } as const;

/** Right-side detail drawer — single primitive used by Event/Workflow/Task panels. */
export function RightDrawer({
  open,
  onClose,
  width = 'md',
  eyebrow,
  title,
  headerActions,
  footer,
  children,
  inline = false,
  glassVariant = 'v3-veil',
  layer = 2,
}: RightDrawerProps) {
  // Keep DOM mounted briefly during close for exit-right dismissal.
  const [isVisible, setIsVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!isVisible || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )).filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
      if (focusable.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    const focusTimer = window.setTimeout(() => {
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])');
      (first ?? panel)?.focus();
    }, 0);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKey);
    };
  }, [isVisible, onClose, inline]);

  if (!isVisible) return null;

  const isV3 = glassVariant === 'v3-veil';

  const panel = (
    <aside
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Detail panel'}
      data-veil-layer={layer}
      tabIndex={-1}
      className={
        `v3-veil-glass-panel right-drawer flex flex-col ${isExiting ? 'v3-drawer-exit-right' : 'v3-drawer-enter-left'}`
      }
      style={{
        width: inline ? '100%' : `min(calc(100vw - 16px), ${WIDTH[width]}px)`,
        maxWidth: inline ? undefined : '100vw',
        height: inline ? '100%' : '100dvh',
        borderTopRightRadius: inline ? undefined : 0,
        borderBottomRightRadius: inline ? undefined : 0,
        ...(isV3 && {
          borderColor: 'var(--v3-border)',
        }),
      }}
    >
      {(title || eyebrow || headerActions) && (
        <header
          className={`flex items-center justify-between gap-3 shrink-0 v3-drawer-header ${isV3 ? '' : ''}`}
          style={{
            padding: 'clamp(14px, 1.6vh, 18px) clamp(14px, 1.7vw, 26px)',
            borderBottom: '1px solid var(--v3-border-subtle)',
            background: 'transparent',
          }}
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
      <div className="v3-veil-body flex-1 overflow-auto" style={{ padding: 'clamp(12px, 1.6vw, 24px)' }}>
        {children}
      </div>
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

  const backdropStyle = {
    ...(isV3
      ? { background: 'rgba(5, 6, 10, 0.72)', backdropFilter: 'blur(8px)' }
      : { background: 'rgba(5, 6, 10, 0.72)', backdropFilter: 'blur(8px)' }),
    WebkitBackdropFilter: 'blur(8px)',
    transition: 'opacity 220ms var(--v3-ease)',
    opacity: isExiting ? 0 : 1,
  };

  return (
    <div className="fixed inset-0 z-[70] flex justify-end" role="presentation">
      <div
        className="absolute inset-0 v3-backdrop"
        style={backdropStyle}
        onClick={onClose}
      />
      <div className="relative h-full">{panel}</div>
    </div>
  );
}
