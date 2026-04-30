import { Sun, Moon } from 'lucide-react';
import { useCiModeStore } from '@/policy/stores/ciModeStore';

/**
 * ThemeModeToggle — Care Indeed Light/Dark switch.
 *
 * Independent from the CI-ION ↔ Care Indeed BRAND toggle (logo click).
 * Renders a single sun/moon utility button that flips
 * `useCiModeStore.mode` and is reflected in <html data-ci-mode>.
 *
 * Caller decides whether to render this (we hide it under CI-ION
 * because mode has no effect in that brand).
 */
export function ThemeModeToggle({ className }: { className?: string }) {
  const mode = useCiModeStore(s => s.mode);
  const toggle = useCiModeStore(s => s.toggleMode);
  const isDark = mode === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Care Indeed — switch to ${isDark ? 'Light' : 'Dark'} mode`}
      className={
        'ci-util-btn ' +
        (className ?? '')
      }
      data-testid="ci-mode-toggle"
    >
      {isDark ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
    </button>
  );
}
