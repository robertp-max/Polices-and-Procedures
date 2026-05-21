import { useEffect, useRef, useState, type PropsWithChildren, type ReactNode } from 'react';
import { X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Modal + Drawer shells — consistent surface for workflow
   drawer, form execution, upload, approvals, help article.
   ═══════════════════════════════════════════════════════════════ */

export interface ModalShellProps extends PropsWithChildren {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  width?: number | string;
  footer?: ReactNode;
  accent?: string;
}

export function ModalShell({
  open, onClose, title, subtitle, icon, width = 620, footer, accent = '#FFC107', children,
}: ModalShellProps) {
  // V3 expensive modal transitions (enter + smooth close via delayed unmount)
  const [isVisible, setIsVisible] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const closeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsExiting(false);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    } else if (isVisible && !isExiting) {
      setIsExiting(true);
      closeTimerRef.current = window.setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
      }, 620);
    }
  }, [open, isVisible, isExiting]);

  useEffect(() => () => { if (closeTimerRef.current) clearTimeout(closeTimerRef.current); }, []);

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const modalStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    maxWidth: 'calc(100vw - 32px)',
    background: 'linear-gradient(160deg, rgba(66,8,8,0.82) 0%, rgba(15,3,3,0.88) 100%)',
    border: '1px solid rgba(255,255,255,0.12)',
    boxShadow: '0 80px 160px -40px rgba(0,0,0,0.9), 0 30px 60px -15px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)',
    transition: 'transform 0.58s var(--v3-ease), opacity 0.58s var(--v3-ease), filter 0.5s var(--v3-ease)',
    transform: isExiting ? 'scale(0.96) translateY(14px)' : 'scale(1) translateY(0)',
    opacity: isExiting ? 0 : 1,
    filter: isExiting ? 'blur(3px)' : 'none',
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      style={{ transition: 'opacity 0.58s var(--v3-ease)', opacity: isExiting ? 0 : 1 }}
    >
      <div
        className="absolute inset-0 v3-backdrop"
        onClick={onClose}
        style={{ 
          background: 'rgba(10,2,2,0.75)', 
          backdropFilter: 'blur(10px)', 
          WebkitBackdropFilter: 'blur(10px)',
          transition: 'opacity 0.58s var(--v3-ease)',
          opacity: isExiting ? 0 : 1,
        }}
      />
      <div
        className="relative z-10 rounded-2xl overflow-hidden flex flex-col max-h-[86vh] v3-modal-panel"
        style={modalStyle}
      >
        <span aria-hidden className="absolute inset-x-0 top-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          {icon && (
            <span
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: `${accent}1f`,
                border: `1px solid ${accent}55`,
                color: accent,
              }}
            >
              {icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-montserrat font-bold text-white text-[14px] uppercase tracking-[0.12em] leading-tight">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-[11px] font-roboto text-white/55 truncate mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] v3-micro"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </header>
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
        {footer && (
          <footer className="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 bg-black/20">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/* ─── Drawer shell — right-side slide-in ─────────────────── */
export function DrawerShell({
  open, onClose, title, subtitle, icon, width = 520, footer, accent = '#FFC107', children,
}: ModalShellProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // V3 expensive drawer shell: always apply transition for buttery close (0.62s)
  const drawerTransition = 'transform 0.62s var(--v3-ease), opacity 0.62s var(--v3-ease), filter 0.52s var(--v3-ease)';

  return (
    <div
      className={`fixed inset-0 z-[75] pointer-events-none ${open ? '' : 'invisible'}`}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 pointer-events-auto v3-backdrop"
        onClick={onClose}
        style={{
          background: 'rgba(10,2,2,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          opacity: open ? 1 : 0,
          transition: drawerTransition,
        }}
      />
      <aside
        className="absolute top-0 right-0 h-full pointer-events-auto flex flex-col v3-drawer-panel"
        role="dialog"
        aria-modal="true"
        style={{
          width: typeof width === 'number' ? `${width}px` : width,
          maxWidth: 'calc(100vw - 16px)',
          transform: open ? 'translateX(0) scale(1)' : 'translateX(100%) scale(0.985)',
          opacity: open ? 1 : 0,
          filter: open ? 'none' : 'blur(3px)',
          transition: drawerTransition,
          background: 'linear-gradient(160deg, rgba(66,8,8,0.85) 0%, rgba(15,3,3,0.92) 100%)',
          borderLeft: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '-40px 0 120px -40px rgba(0,0,0,0.9)',
        }}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-[2px]" style={{ background: `linear-gradient(180deg, transparent, ${accent}, transparent)` }} />
        <header className="flex items-center gap-3 px-5 py-4 border-b border-white/10 shrink-0">
          {icon && (
            <span
              className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: `${accent}1f`, border: `1px solid ${accent}55`, color: accent }}
            >
              {icon}
            </span>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-montserrat font-bold text-white text-[13.5px] uppercase tracking-[0.14em] leading-tight">
                {title}
              </h3>
            )}
            {subtitle && <p className="text-[11px] font-roboto text-white/55 truncate mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] v3-micro"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </header>
        <div className="overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
        {footer && (
          <footer className="px-5 py-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0 bg-black/20">
            {footer}
          </footer>
        )}
      </aside>
    </div>
  );
}
