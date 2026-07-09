import { Compass, GraduationCap, LifeBuoy, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StaticCardWatermark } from '../StaticCardWatermark';
import { HelpBadge } from './HelpBadge';

/**
 * Help Center hero — same ci-page-hero band used by Dashboard, Policy Home,
 * Compliance Home, and Training Academy (orange eyebrow, teal headline,
 * orange primary CTA, teal outline secondary CTA).
 */
export function HelpHero({ onSearchFocus }: { onSearchFocus: () => void }) {
  const navigate = useNavigate();
  return (
    <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-10 shadow-sm md:p-14">
      <StaticCardWatermark />
      <div className="relative z-10 grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:items-center">
        <div>
          <h2 className="mb-6 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#F06923]">
            Help Center Command Center
          </h2>
          <h1 className="mb-6 font-montserrat text-4xl font-bold leading-none tracking-tight text-[#007970] md:text-5xl lg:text-6xl">
            Help Center
          </h1>
          <p className="mb-10 max-w-3xl font-roboto text-lg font-light leading-relaxed text-[#52404B] md:text-xl">
            Interactive manuals, guided tours, training paths, and support for every major workspace.
          </p>
          <div className="flex flex-col gap-4 font-montserrat sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => navigate('/help/syllabus')}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] bg-[#F06923] px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_0_25px_6px_rgba(240,105,35,0.38)] focus-visible:outline-none focus-visible:shadow-focus"
            >
              <GraduationCap className="h-4 w-4" aria-hidden /> Start Office Staff Training
            </button>
            <button
              type="button"
              onClick={() => navigate('/help/category/guided-tours')}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-8 py-4 text-center text-[12px] font-bold uppercase tracking-widest text-[#007970] transition-all hover:bg-[#F7FEFF] focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Compass className="h-4 w-4" aria-hidden /> Browse Guided Tours
            </button>
            <button
              type="button"
              onClick={onSearchFocus}
              className="inline-flex items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-[#F06923] bg-[#FFF7EC] px-8 py-4 text-[12px] font-bold uppercase tracking-widest text-[#7A3B16] transition-all hover:-translate-y-0.5 hover:bg-[#FFF2EB] hover:text-[#F06923] focus-visible:outline-none focus-visible:shadow-focus"
            >
              <Search className="h-4 w-4 text-[#F06923]" aria-hidden /> Search all articles
            </button>
          </div>
        </div>

        {/* Right-side visual card, hidden on small screens */}
        <div className="hidden lg:block">
          <div className="help-hero-glass-frame">
            <div className="help-hero-glass-card rounded-[24px] border border-transparent p-8">
              <div className="help-hero-glass-content">
                <span className="help-hero-card-icon grid h-14 w-14 place-items-center rounded-[16px] bg-[#E5FEFF] text-[#007970]">
                  <LifeBuoy className="h-7 w-7" aria-hidden />
                </span>
                <p className="mt-6 font-montserrat text-lg font-bold leading-snug text-[#004142]">
                  Every workspace, one manual system.
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#52404B]">
                  Role-aware articles with quick starts, checklists, screenshots, and in-app walkthroughs — all demo data, never PHI.
                </p>
                <div className="help-hero-badge-row mt-5 flex flex-wrap gap-1.5">
                  <HelpBadge badgeId="office-staff" />
                  <HelpBadge badgeId="guided-tour" />
                  <HelpBadge badgeId="quick-start" />
                  <HelpBadge badgeId="no-phi" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
