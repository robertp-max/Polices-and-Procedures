/**
 * Prominent, non-dismissible DEMO banner for all Journey / onboarding surfaces.
 * Must remain until real backend + immutable server audit exists.
 */
export function DemoOnlyBanner() {
  return (
    <div
      role="status"
      className="w-full rounded-md border border-amber-500 bg-amber-50 px-4 py-2 text-[11px] font-mono text-amber-800 mb-3"
    >
      DEMO MODE — training records are browser-local only and are not suitable for personnel files, ACHC/CMS survey evidence, or production compliance use.
      All completion, Appendix F, supervised visits, and clearance state live in localStorage only.
    </div>
  );
}

export default DemoOnlyBanner;
