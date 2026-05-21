/**
 * VeilModal — Premium centered modal primitive for V3 dark glass aesthetic.
 *
 * Expensive, luxurious feel matching the V3 Veil Glass spec:
 * - Exact matte slate-carbon glass gradient + 32px blur + saturate(140%)
 * - Sacred 0.33 border contract with hover elevation to 0.45
 * - Signature 0.7s cubic-bezier(0.16, 1, 0.3, 1) enter animation (scale + lift)
 * - Luminous catchlight edge
 * - Refined teal micro-interactions on close
 * - Generous breathing room, premium typography
 *
 * Designed for CES workflows, evidence approvals, task confirmations,
 * form signing overlays, and future decluttering of legacy modals (e.g. ModalShell).
 *
 * Usage (V3):
 *   <VeilModal open={open} onClose={close} glassVariant="v3-veil" title="..." size="lg">
 *     ...
 *   </VeilModal>
 *
 * Backward compatible with CI-ION glass too.
 */

import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

export interface VeilModalProps {
  open: boolean;
  onClose: () => void;
  /** Modal content width tier */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Optional small uppercase label above title (JetBrains Mono) */
  eyebrow?: string;
  /** Primary title */
  title?: ReactNode;
  /** Optional right-side actions in header */
  headerActions?: ReactNode;
  /** Sticky footer (actions, etc.) */
  footer?: ReactNode;
  /** Main content */
  children: ReactNode;
  /**
   * Glass variant — defaults to premium V3 veil for new expensive surfaces.
   * Use 'ci-ion' only for transitional legacy contexts.
   */
  glassVariant?: 'v3-veil' | 'ci-ion';
  /** Disable Escape-to-close (rare) */
  disableEscape?: boolean;
  /** Hide the close button (controlled externally via headerActions) */
  hideClose?: boolean;
}

const SIZE_WIDTH: Record<NonNullable<VeilModalProps['size']>, string> = {
  sm: '420px',
  md: '560px',
  lg: '720px',
  xl: '880px',
};

/**
 * VeilModal — the expensive, high-end V3 modal.
 * Renders via fixed portal overlay. Respects reduced motion.
 */
export function VeilModal({
  open,
  onClose,
  size = 'md',
  eyebrow,
  title,
  headerActions,
  footer,
  children,
  glassVariant = 'v3-veil',
  disableEscape = false,
  hideClose = false,
}: VeilModalProps) {
  const isV3 = glassVariant === 'v3-veil';

  // Escape handler
  useEffect(() => {
    if (!open || disableEscape) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, disableEscape]);

  if (!open) return null;

  const width = SIZE_WIDTH[size];

  const panelClass = isV3
    ? 'v3-veil-glass-panel relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden'
    : 'ci-glass-panel relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden';

  const borderStyle = isV3 ? 'var(--v3-border)' : 'var(--ci-border)';

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={typeof title === 'string' ? title : 'Modal dialog'}
    >
      {/* Premium backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background: isV3 ? 'rgba(5, 6, 10, 0.78)' : 'rgba(10, 2, 2, 0.72)',
          backdropFilter: isV3 ? 'blur(10px)' : 'blur(6px)',
          WebkitBackdropFilter: isV3 ? 'blur(10px)' : 'blur(6px)',
        }}
        onClick={onClose}
      />

      {/* The glass panel */}
      <div
        className={panelClass}
        style={{
          width: `min(${width}, calc(100vw - 32px))`,
          maxWidth: '100%',
          animation: 'v3-modal-enter 620ms var(--v3-ease) both',
          borderColor: borderStyle,
          boxShadow: isV3
            ? '0 40px 120px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.06) inset'
            : undefined,
        }}
      >
        {/* Luminous edge already provided by .v3-veil-glass-panel::before */}

        {/* Header */}
        {(title || eyebrow || headerActions || !hideClose) && (
          <header
            className="flex shrink-0 items-center justify-between gap-3"
            style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${borderStyle}`,
              background: isV3 ? 'rgba(255,255,255,0.012)' : undefined,
            }}
          >
            <div className="min-w-0">
              {eyebrow && (
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: isV3 ? 'var(--v3-text-tertiary)' : 'var(--ci-text-subtle)',
                    marginBottom: title ? 2 : 0,
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
                    fontSize: 19,
                    fontWeight: 600,
                    letterSpacing: '-0.012em',
                  }}
                >
                  {title}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              {!hideClose && (
                isV3 ? (
                  <button
                    type="button"
                    onClick={onClose}
                    className="v3-veil-close p-2 text-[var(--v3-text-secondary)] hover:text-[var(--v3-teal-light)]"
                    aria-label="Close modal"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-2 text-[var(--ci-text-muted)] hover:bg-white/5 hover:text-[var(--ci-text-primary)]"
                    aria-label="Close modal"
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )
              )}
            </div>
          </header>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto" style={{ padding: '24px 28px' }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer
            className="shrink-0"
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${borderStyle}`,
              background: isV3 ? 'rgba(255,255,255,0.01)' : undefined,
            }}
          >
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

export default VeilModal;
