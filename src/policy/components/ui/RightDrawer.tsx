import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { UtilityButton } from './UtilityButton';

export interface RightDrawerProps {
  open: boolean;
  onClose: () => void;
  width?: 'sm' | 'md' | 'lg';
  eyebrow?: string;
  title?: ReactNode;
  headerActions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Render inline (non-fixed) — use when host already manages positioning. */
  inline?: boolean;
}

const WIDTH = { sm: 420, md: 520, lg: 640 } as const;

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
}: RightDrawerProps) {
  useEffect(() => {
    if (!open || inline) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, inline]);

  if (!open) return null;

  const panel = (
    <aside
      role="dialog"
      aria-modal={!inline}
      aria-label={typeof title === 'string' ? title : 'Detail panel'}
      className="ci-glass-panel flex flex-col"
      style={{
        width: inline ? '100%' : WIDTH[width],
        height: '100%',
        borderTopRightRadius: inline ? undefined : 0,
        borderBottomRightRadius: inline ? undefined : 0,
      }}
    >
      {(title || eyebrow || headerActions) && (
        <header
          className="flex items-center justify-between gap-3 shrink-0"
          style={{ padding: '16px 24px', borderBottom: '1px solid var(--ci-border)' }}
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
      <div className="flex-1 overflow-auto" style={{ padding: 24 }}>
        {children}
      </div>
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
    <div className="fixed inset-0 z-[60] flex justify-end" role="presentation">
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(15,23,28,0.45)' }}
        onClick={onClose}
      />
      <div className="relative h-full">{panel}</div>
    </div>
  );
}
