import { type ReactNode, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { UtilityButton } from './UtilityButton';

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
   * - 'ci-ion' (default): current production CI-ION maroon glass
   * - 'v3-veil': premium V3 dark matte slate-carbon veil glass (expensive CES drawers)
   *   Uses 0.33 borders, 32px blur, 0.7s signature cubic-bezier motion.
   */
  glassVariant?: 'ci-ion' | 'v3-veil';
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
  glassVariant = 'ci-ion',
}: RightDrawerProps) {
  // V3 expensive transition controller: keeps DOM mounted during close for 0.62s exit anim (translate+scale+blur)
  const [isVisible, setIsVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    if (!isVisible || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isVisible, onClose, inline]);

  if (!isVisible) return null;

  const isV3 = glassVariant === 'v3-veil';

  const panel = (
    <aside
      role="dialog"
      aria-modal={!inline}
      aria-label={typeof title === 'string' ? title : 'Detail panel'}
      className={
        isV3
          ? `v3-veil-glass-panel right-drawer flex flex-col ${isExiting ? 'v3-drawer-exiting' : 'v3-drawer-panel'}`
          : `ci-glass-panel flex flex-col ${isExiting ? 'v3-drawer-exiting' : ''}`
      }
      style={{
        width: inline ? '100%' : `min(calc(100vw - 16px), ${WIDTH[width]}px)`,
        maxWidth: inline ? undefined : '100vw',
        height: '100dvh',
        borderTopRightRadius: inline ? undefined : 0,
        borderBottomRightRadius: inline ? undefined : 0,
        ...(isV3 && {
          borderColor: 'var(--v3-border)',
        }),
        // V3 exit overrides — smooth expensive close (uses transition to allow bidirectional control)
        transition: isExiting || !isV3 ? 'transform 0.62s var(--v3-ease), opacity 0.62s var(--v3-ease), filter 0.5s var(--v3-ease)' : undefined,
        transform: isExiting ? 'translateX(32px) scale(0.985)' : undefined,
        opacity: isExiting ? 0 : undefined,
        filter: isExiting ? 'blur(3px)' : undefined,
      }}
    >
      {(title || eyebrow || headerActions) && (
        <header
          className={`flex items-center justify-between gap-3 shrink-0 v3-drawer-header ${isV3 ? '' : ''}`}
          style={{
            padding: 'clamp(14px, 1.6vh, 18px) clamp(14px, 1.7vw, 26px)',
            borderBottom: isV3 ? '1px solid var(--v3-border)' : '1px solid var(--ci-border)',
            background: isV3 ? 'rgba(255,255,255,0.015)' : undefined, // subtle header wash on veil
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
      <div className="flex-1 overflow-auto" style={{ padding: 'clamp(12px, 1.6vw, 24px)' }}>
        {children}
      </div>
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

  const backdropStyle = {
    ...(isV3
      ? { background: 'rgba(5, 6, 10, 0.72)', backdropFilter: 'blur(8px)' }
      : { background: 'rgba(15,23,28,0.45)' }),
    // V3 smooth expensive backdrop fade on both open and close
    transition: 'opacity 0.62s var(--v3-ease)',
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
