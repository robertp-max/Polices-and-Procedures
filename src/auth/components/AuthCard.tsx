import { type PropsWithChildren } from 'react';
import ciIonLogo from '@/assets/ci-logo-white.png';

interface AuthCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}

/**
 * Shared V3 auth shell card.
 */
export function AuthCard({ eyebrow, title, subtitle, children }: PropsWithChildren<AuthCardProps>) {
  return (
    <div className="min-h-screen w-full bg-[var(--v3-base-bg)] px-6 py-8 md:px-12 md:py-12">
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center">
      <div className="v3-veil-glass-panel relative flex w-full max-w-[460px] flex-col items-center rounded-3xl px-6 py-8 md:px-8 md:py-10">
        <div className="px-[22px] py-[14px]">
          <img
            src={ciIonLogo}
            alt="Care Indeed"
            className="h-12 w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.95 }}
          />
        </div>

        {/* Header */}
        <div className="text-center mt-7 mb-6 w-full">
          {eyebrow && (
            <p className="font-body mb-2 text-[10px] font-medium uppercase tracking-[0.30em] text-[var(--v3-text-tertiary)]">
              {eyebrow}
            </p>
          )}
          <h1 className="font-heading text-2xl font-semibold leading-tight text-[var(--v3-text-primary)]">
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
      </div>
    </div>
  );
}

/** Token helpers for inputs/buttons inside AuthCard so each page
 *  doesn't have to hardcode theme branches. */
export function useAuthTheme() {
  return {
    isLight: false,
    inputClass: 'mt-1 w-full rounded-xl border border-[var(--v3-border-subtle)] bg-transparent px-3 py-2 text-[var(--v3-text-primary)] outline-none focus:border-[var(--v3-teal-light)]',
    labelClass: 'block text-sm text-[var(--v3-text-secondary)]',
    primaryBtnClass: 'rounded-xl bg-[var(--v3-teal)] px-5 py-3 text-[0.78rem] font-semibold tracking-[0.12em] uppercase text-white disabled:opacity-70',
    secondaryLinkClass: 'font-medium text-[var(--v3-teal-light)] hover:underline',
    mutedTextClass: 'text-[var(--v3-text-secondary)]',
    errorClass: 'text-sm text-[var(--v3-orange-light)]',
    accentClass: 'text-[var(--v3-teal-light)]',
  };
}
