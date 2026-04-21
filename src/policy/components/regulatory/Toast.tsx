import { create } from 'zustand';
import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Lightweight toast system for action feedback
   (workflow step completed, form marked, approval decided, etc.)
   ═══════════════════════════════════════════════════════════════ */

export type ToastTone = 'success' | 'warn' | 'error' | 'info';

export interface Toast {
  id: string;
  tone: ToastTone;
  title: string;
  detail?: string;
  createdAt: number;
}

interface ToastStore {
  items: Toast[];
  push:  (tone: ToastTone, title: string, detail?: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  items: [],
  push: (tone, title, detail) => {
    const id = `T-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set(state => ({ items: [...state.items, { id, tone, title, detail, createdAt: Date.now() }] }));
    window.setTimeout(() => set(state => ({ items: state.items.filter(t => t.id !== id) })), 4200);
  },
  dismiss: id => set(state => ({ items: state.items.filter(t => t.id !== id) })),
}));

/* ─── Toast host (render once in app shell — we embed in pages) ─── */
export function ToastHost() {
  const items = useToastStore(s => s.items);
  const dismiss = useToastStore(s => s.dismiss);

  useEffect(() => { /* placeholder — reserved for global keybindings */ }, []);

  return (
    <div
      className="fixed z-[90] bottom-6 right-6 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
    >
      {items.map(t => {
        // Light-mode palette — legible text against white/cream surfaces,
        // accent bar in tone color (no dark-on-dark).
        const tone =
          t.tone === 'success' ? { accent: '#007970', tint: '#E5FEFF', icon: <CheckCircle2 size={14} /> } :
          t.tone === 'warn'    ? { accent: '#C74601', tint: '#FFF1E5', icon: <AlertTriangle size={14} /> } :
          t.tone === 'error'   ? { accent: '#B42318', tint: '#FEE4E2', icon: <AlertTriangle size={14} /> } :
                                 { accent: '#524048', tint: '#FAFBF8', icon: <Info size={14} /> };
        return (
          <div
            key={t.id}
            className="pointer-events-auto rounded-lg overflow-hidden animate-in fade-in duration-200 bg-white"
            style={{
              minWidth: 280,
              maxWidth: 380,
              border: `1px solid ${tone.accent}33`,
              boxShadow: `0 18px 36px -18px rgba(31,28,27,0.22), 0 2px 6px rgba(31,28,27,0.06)`,
            }}
          >
            {/* tone rail at top — flattened accent, no gradient fade */}
            <div className="h-[3px]" style={{ background: tone.accent }} />
            <div className="flex items-start gap-2.5 px-3.5 py-3" style={{ background: tone.tint }}>
              <span className="mt-0.5 shrink-0" style={{ color: tone.accent }}>{tone.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="font-montserrat font-bold text-[#1F1C1B] text-[12px] leading-tight">{t.title}</div>
                {t.detail && <div className="text-[10.5px] font-roboto text-[#524048] leading-snug mt-0.5">{t.detail}</div>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[#524048]/70 hover:text-[#1F1C1B] hover:bg-black/[0.05]"
                aria-label="Dismiss notification"
              >
                <X size={11} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
