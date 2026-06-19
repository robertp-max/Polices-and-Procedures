import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNavStore } from '@/policy/stores/navStore';
import { useShellStore } from '@/policy/stores/uiStore';

/**
 * Universal shell Back / Forward navigation controls.
 *
 * Rendered in the CommandCenterLayout header, to the right of the hamburger
 * menu.  Buttons are disabled (visually muted, pointer-events off) when the
 * corresponding stack is empty.
 *
 * Styling intentionally mirrors the existing shell chrome:
 *  - Same `glass-interactive` rounded pill border used by the search bar
 *  - Same icon sizes and opacity tokens as the help / account buttons
 *  - Inherits light/dark theme from useShellStore
 */
export function UniversalNavControls() {
  const navigate = useNavigate();
  const backStack    = useNavStore(s => s.backStack);
  const forwardStack = useNavStore(s => s.forwardStack);
  const initiateBack    = useNavStore(s => s.initiateBack);
  const initiateForward = useNavStore(s => s.initiateForward);
  const isLight = useShellStore(s => s.theme === 'care-indeed-light');

  const canGoBack    = backStack.length > 0;
  const canGoForward = forwardStack.length > 0;

  const handleBack = () => {
    const target = initiateBack();
    if (target) navigate(target);
  };

  const handleForward = () => {
    const target = initiateForward();
    if (target) navigate(target);
  };

  const pillBorder  = isLight ? '1px solid #E5E4E3'              : '1px solid rgba(255,255,255,0.09)';
  const activeColor = isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/70 hover:text-white';
  const hoverBg     = isLight ? 'hover:bg-slate-100'             : 'hover:bg-white/10';
  const disabledColor = isLight ? 'text-slate-300'               : 'text-white/20';

  return (
    <div
      className="flex items-center"
      style={{ border: pillBorder, borderRadius: 24, padding: 2, gap: 2 }}
      aria-label="Shell navigation"
      role="group"
    >
      <button
        type="button"
        aria-label="Go back"
        title="Go back"
        disabled={!canGoBack}
        onClick={handleBack}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          canGoBack
            ? `${activeColor} ${hoverBg} cursor-pointer`
            : `${disabledColor} cursor-not-allowed`
        }`}
      >
        <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
      </button>

      <button
        type="button"
        aria-label="Go forward"
        title="Go forward"
        disabled={!canGoForward}
        onClick={handleForward}
        className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
          canGoForward
            ? `${activeColor} ${hoverBg} cursor-pointer`
            : `${disabledColor} cursor-not-allowed`
        }`}
      >
        <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
      </button>
    </div>
  );
}
