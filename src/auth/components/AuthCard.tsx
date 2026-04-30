import { type PropsWithChildren } from 'react';
import ciIonLogo from '@/assets/ci-ion-logo.png';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { useShellStore } from '@/policy/stores/uiStore';

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/**
 * Shared auth shell card. Mirrors the splash design:
 *   • White page background (light) / CI-ION maroon glass (dark)
 *   • White main card containing
 *   • White smaller (inner) card with the Care Indeed logo
 *     that toggles to CI-ION branding on click.
 */
export function AuthCard({ eyebrow, title, subtitle, children }: PropsWithChildren<AuthCardProps>) {
  const theme = useShellStore(s => s.theme);
  const toggleTheme = useShellStore(s => s.toggleTheme);
  const isLight = theme === 'care-indeed-light';
  const logo = isLight ? ciLogoGray : ciIonLogo;

  return (
    <div className="min-h-screen w-full bg-transparent px-6 py-8 md:px-12 md:py-12">
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
      {/* Outer (main) card */}
      <div className={`relative w-full max-w-[460px] px-6 md:px-8 py-8 md:py-10 rounded-3xl flex flex-col items-center ${isLight ? 'bg-white border border-[#E5E4E3] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.18),0_8px_24px_-16px_rgba(0,0,0,0.10)]' : 'bg-white/90 border border-slate-200 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.16),0_8px_24px_-16px_rgba(15,23,42,0.10)]'}`}>
        {/* Inner (smaller) white card with logo */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${isLight ? 'CI-ION dark' : 'Care Indeed light'} branding`}
          title={`Switch to ${isLight ? 'CI-ION dark' : 'Care Indeed light'} branding`}
          className={`group cursor-pointer focus-visible:outline-offset-4 transition-transform hover:scale-[1.03] px-[22px] py-[14px] rounded-2xl ${isLight ? 'bg-white border border-[#ECEAE8] shadow-[0_6px_20px_-12px_rgba(0,0,0,0.18)]' : 'bg-white border border-slate-200 shadow-[0_6px_20px_-12px_rgba(15,23,42,0.16)]'}`}
        >
          <img
            src={logo}
            alt="Care Indeed — click to switch branding"
            className="h-12 w-auto object-contain"
          />
        </button>

        {/* Header */}
        <div className="text-center mt-7 mb-6 w-full">
          {eyebrow && (
            <p className={`font-body uppercase mb-2 text-[10px] tracking-[0.30em] font-medium ${isLight ? 'text-[#747474]' : 'text-white/55'}`}>
              {eyebrow}
            </p>
          )}
          <h1 className={`font-heading text-2xl font-semibold leading-tight ${isLight ? 'text-[#1F1C1B]' : 'text-white'}`}>
            {title}
          </h1>
          {subtitle && (
            <p className={`mt-2 font-body text-[13px] leading-[1.55] ${isLight ? 'text-[#52404B]' : 'text-white/65'}`}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="w-full">{children}</div>
      </div>
      </div>
    </div>
  );
}

/** Token helpers for inputs/buttons inside AuthCard so each page
 *  doesn't have to hardcode theme branches. */
export function useAuthTheme() {
  const theme = useShellStore(s => s.theme);
  const isLight = theme === 'care-indeed-light';
  return {
    isLight,
    inputClass: isLight
      ? 'mt-1 w-full rounded-xl border border-[#E5E4E3] bg-white px-3 py-2 text-[#1F1C1B] outline-none focus:border-[#C74601]'
      : 'mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-[#C74601]',
    labelClass: isLight ? 'block text-sm text-[#52404B]' : 'block text-sm text-slate-700',
    primaryBtnClass: isLight
      ? 'rounded-xl bg-[#C74601] px-5 py-3 text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-70'
      : 'rounded-xl bg-[#C74601] px-5 py-3 text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-70',
    secondaryLinkClass: isLight
      ? 'text-[#C74601] hover:underline font-medium'
      : 'text-[#C74601] hover:underline font-medium',
    mutedTextClass: isLight ? 'text-[#52404B]' : 'text-slate-500',
    errorClass: isLight ? 'text-sm text-[#B3261E]' : 'text-sm text-[#B3261E]',
    accentClass: isLight ? 'text-[#C74601]' : 'text-[#C74601]',
  };
}
