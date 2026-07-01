import type { PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserRound, ArrowLeft } from 'lucide-react';

/**
 * Reusable standalone authenticated layout for personal workspace surfaces.
 * No standard app sidebar / top nav / CommandCenter chrome.
 * Provides a floating personal "back to app" toggle.
 * Uses the app's background and design language.
 */
export function PersonalStandaloneLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;

  const goBack = () => {
    if (from && from !== location.pathname) {
      navigate(from);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc] text-slate-900">
      {/* Fixed personal icon toggle — always visible, returns to previous route or dashboard */}
      <div className="fixed top-4 right-4 z-50">
        <button
          type="button"
          onClick={goBack}
          className="group grid h-11 w-11 place-items-center rounded-full border border-transparent bg-white/70 text-ink shadow-rest backdrop-blur-[22px] transition duration-300 ease-standard hover:-translate-y-0.5 hover:bg-white/90 hover:text-brand-teal-deep hover:shadow-hover focus-visible:outline-none focus-visible:shadow-focus"
          title="Back to app"
          aria-label="Back to app"
        >
          <UserRound className="h-5 w-5 transition group-hover:scale-95" aria-hidden />
        </button>
      </div>

      {/* Optional subtle top affordance for back (text) */}
      <div className="fixed top-4 left-4 z-50 hidden sm:block">
        <button
          type="button"
          onClick={goBack}
          className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-white/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur hover:text-ink hover:bg-white/90 transition"
          aria-label="Back to app"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to app
        </button>
      </div>

      {children}
    </div>
  );
}

export default PersonalStandaloneLayout;
