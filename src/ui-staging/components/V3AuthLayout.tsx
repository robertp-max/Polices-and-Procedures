import React from 'react'

// ============================================================
// V3AuthLayout — Staging adaptation of ClaudeX2 FILE 3
// Full-bleed auth canvas for Login / Register / Forgot previews
// Provides: v3-canvas + watermark + centered v3-auth-card with page-animate
// Visual reference only — matches the reworked honest V3 auth treatment
// ============================================================

interface V3AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export function V3AuthLayout({ children, title, subtitle }: V3AuthLayoutProps) {
  return (
    <div className="v3-staging-page v3-canvas v3-no-scrollbar min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Q3 Watermark — exact 0.33 opacity per spec */}
      <div
        className="v3-watermark"
        style={{
          backgroundImage: "url('/ci-angel.webp')",
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'bottom left',
        }}
      />

      {/* Centered auth card */}
      <div className="v3-auth-card v3-page-animate relative z-10">
        {/* Optional header branding (used in previews) */}
        {(title || subtitle) && (
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--v3-accent-teal)] to-[#00D1C1] flex items-center justify-center text-xl font-bold text-black mx-auto mb-4">
              CI
            </div>
            {title && (
              <h1 className="text-[22px] font-semibold tracking-[-0.5px] bg-gradient-to-b from-white to-[#A8B0C0] bg-clip-text text-transparent">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-[var(--v3-text-tertiary)] mt-1">{subtitle}</p>
            )}
          </div>
        )}

        {children}
      </div>
      {/* Debug footer removed for exact pixel-match to PDF Login screenshot reference (ClaudeX2 V3 reskin) */}
    </div>
  )
}
