import ciLogoWhite from '@/assets/ci-logo-white.png'

type V3TopBarProps = {
  title: string
  subtitle?: string
  searchPlaceholder?: string
}

export function V3TopBar({
  title,
  subtitle,
  searchPlaceholder = 'Search content...',
}: V3TopBarProps) {
  return (
    <header className="v3-shell-topbar group bg-white/[0.02] -mx-8 px-8 py-4 mb-8 border-b border-[var(--v3-border-subtle)]">
      <div className="v3-shell-heading">
        {subtitle && <p className="v3-shell-subtitle">{subtitle}</p>}
        <h1 className="v3-shell-title text-[#f1f3f7]">{title}</h1>
      </div>

      <div className="v3-shell-topbar-right">
        <label className="v3-shell-search transition-all duration-300 focus-within:w-[320px] ring-1 ring-[var(--v3-border-subtle)] bg-black/20" aria-label="Search workbench">
          <svg className="v3-shell-search-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
            <path d="M16 16L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="v3-shell-search-input font-medium"
            type="search"
            placeholder={searchPlaceholder}
          />
        </label>

        {/* User profile block - pixel match to PDF screenshots (Dr. Marcus Sterling / Agency Director) */}
        <div className="flex items-center gap-3 pl-3 border-l border-[rgba(241,243,247,0.12)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#007970] to-[#E07B2C] flex items-center justify-center text-[10px] font-bold text-white ring-1 ring-white/20">MS</div>
          <div className="flex flex-col leading-none">
            <span className="text-[13px] font-semibold text-[#f1f3f7]">Dr. Marcus Sterling</span>
            <span className="text-[10px] text-[var(--v3-text-tertiary)] tracking-wide">Agency Director</span>
          </div>
          <span className="text-[var(--v3-text-tertiary)] text-xs">▾</span>
        </div>

        <img className="v3-shell-logo grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" src={ciLogoWhite} alt="Care Indeed" />
      </div>
    </header>
  )
}