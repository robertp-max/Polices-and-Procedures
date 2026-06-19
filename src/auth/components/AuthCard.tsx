import { type PropsWithChildren } from 'react';
import ciLogoWhite from '@/assets/ci-logo-white.png';
import ciLogoGray from '@/assets/ci-logo-gray.png';
import { SpotlightCard } from '@/components/ui/SpotlightCard';

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  variant?: 'dark' | 'light';
}

/**
 * Shared V3 auth shell card.
 * Supports light variant for cohesive light command center (teal headings, gray logo).
 * Dark remains default/locked for auth routes (visual state preserved).
 */
export function AuthCard({ eyebrow, title, subtitle, children, variant = 'dark' }: PropsWithChildren<AuthCardProps>) {
  const isLight = variant === 'light';
  const logo = isLight ? ciLogoGray : ciLogoWhite;
  const titleColor = isLight ? 'var(--brand-primary, #00797D)' : 'var(--v3-text-primary)';

  return (
    <div className="min-h-screen w-full px-6 py-8 md:px-12 md:py-12">
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
        <SpotlightCard
          className="auth-spotlight-card w-full max-w-[460px]"
          spotlightColor={isLight ? 'rgba(0, 121, 125, 0.18)' : 'rgba(0, 209, 193, 0.22)'}
          style={{
            borderRadius: 24,
            border: isLight ? '1px solid rgba(0,0,0,0.08)' : '1px solid rgba(0, 209, 193, 0.18)',
            background: isLight ? '#FFFFFF' : undefined,
          }}
        >
          <div className="flex w-full flex-col items-center px-6 py-8 md:px-8 md:py-10">
            <div className="px-[22px] py-[14px]">
              <img
                src={logo}
                alt="Care Indeed"
                className="h-12 w-auto object-contain"
                style={{ opacity: 0.95 }}
              />
            </div>

            {/* Header */}
            <div className="text-center mt-7 mb-6 w-full">
              {eyebrow && (
                <p className="font-body mb-2 text-[10px] font-medium uppercase tracking-[0.30em] text-[var(--v3-text-tertiary)]">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-heading text-2xl font-semibold leading-tight" style={{ color: titleColor }}>
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 font-body text-[13px] leading-[1.55] text-[var(--v3-text-secondary)]">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Body */}
            <div className="w-full">{children}</div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}

/** Token helpers for inputs/buttons inside AuthCard so each page
 *  doesn't have to hardcode theme branches. */
export function useAuthTheme(variant: 'dark' | 'light' = 'dark') {
  const isLight = variant === 'light';
  if (isLight) {
    return {
      isLight: true,
      inputClass: 'relative z-30 mt-1 w-full rounded-xl border border-[rgba(0,0,0,0.12)] bg-white px-3 py-2 text-[#1F1C1B] outline-none focus:border-[var(--brand-primary,#00797D)]',
      labelClass: 'relative z-30 block text-sm text-[var(--ci-neutral-500,#52404B)]',
      primaryBtnClass: 'relative z-30 rounded-xl bg-[var(--brand-primary,#00797D)] px-5 py-3 text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-70',
      secondaryLinkClass: 'relative z-30 font-medium text-[var(--brand-primary,#00797D)] hover:underline',
      mutedTextClass: 'text-[var(--ci-neutral-500,#52404B)]',
      errorClass: 'text-sm text-[var(--brand-accent,#C74601)]',
      accentClass: 'text-[var(--brand-primary,#00797D)]',
    };
  }
  return {
    isLight: false,
    inputClass: 'relative z-30 mt-1 w-full rounded-xl border border-[var(--v3-border-subtle)] bg-[#0d131b] px-3 py-2 text-[var(--v3-text-primary)] outline-none focus:border-[var(--v3-teal-light)]',
    labelClass: 'relative z-30 block text-sm text-[var(--v3-text-secondary)]',
    primaryBtnClass: 'relative z-30 rounded-xl bg-[var(--v3-teal)] px-5 py-3 text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-70',
    secondaryLinkClass: 'relative z-30 font-medium text-[var(--v3-teal-light)] hover:underline',
    mutedTextClass: 'text-[var(--v3-text-secondary)]',
    errorClass: 'text-sm text-[var(--v3-orange-light)]',
    accentClass: 'text-[var(--v3-teal-light)]',
  };
}
