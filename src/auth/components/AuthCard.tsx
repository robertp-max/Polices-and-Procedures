import { type PropsWithChildren } from 'react';
import ciIonLogo from '@/assets/ci-logo-white.png';

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/**
 * Shared auth shell card. It owns the unauthenticated CI-ION dark surface
 * so stale app-shell theme preferences cannot make login flows render white.
 */
export function AuthCard({ eyebrow, title, subtitle, children }: PropsWithChildren<AuthCardProps>) {
  return (
    <div data-auth-shell className="min-h-screen w-full bg-[#061a1f] px-6 py-8 text-white md:px-12 md:py-12">
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <div data-auth-card className="relative flex w-full max-w-[460px] flex-col items-center rounded-3xl border border-white/10 bg-[#0b2a30] px-6 py-8 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.70),0_8px_24px_-16px_rgba(0,0,0,0.60)] md:px-8 md:py-10">
          <div className="rounded-2xl border border-white/10 bg-[#061a1f] px-[22px] py-[14px] shadow-[0_6px_20px_-12px_rgba(0,0,0,0.70)]">
            <img
              src={ciIonLogo}
              alt="Care Indeed"
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="mt-7 mb-6 w-full text-center">
            {eyebrow && (
              <p className="font-body mb-2 text-[10px] font-medium uppercase tracking-[0.30em] text-white/55">
                {eyebrow}
              </p>
            )}
            <h1 className="font-heading text-2xl font-semibold leading-tight text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="font-body mt-2 text-[13px] leading-[1.55] text-white/65">
                {subtitle}
              </p>
            )}
          </div>

          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

/** Token helpers for inputs/buttons inside AuthCard so each page
 *  doesn't have to hardcode theme branches. */
export function useAuthTheme() {
  return {
    isLight: false,
    inputClass: 'mt-1 w-full rounded-xl border !border-white/15 !bg-[#061a1f] px-3 py-2 !text-white outline-none focus:!border-[#63b59d]',
    labelClass: 'block text-sm text-white/70',
    primaryBtnClass: 'rounded-xl bg-[#2f8f7a] px-5 py-3 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-70',
    secondaryLinkClass: 'font-medium text-[#7fd8c4] hover:underline',
    mutedTextClass: 'text-white/60',
    errorClass: 'text-sm text-[#ffb4ab]',
    accentClass: 'text-[#7fd8c4]',
  };
}
