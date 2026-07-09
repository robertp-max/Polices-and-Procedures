import { Bot, Compass, GraduationCap, MessagesSquare, Plus, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HELP_CENTER_ARTICLES } from '@/policy/helpCenter/data/helpArticles';
import { HELP_TOURS } from '@/policy/helpCenter/data/helpTours';
import { recentlyUpdated } from '@/policy/helpCenter/utils/filters';
import { HelpSearch } from './HelpSearch';

const BASELINE_NOTES = [
  'Help Center rebuilt as a standalone command center with badges, search, and an office-staff syllabus.',
  'All articles use demo data only — never enter PHI in help surfaces.',
  'Legacy knowledge-base articles are retired with tracked replacements.',
] as const;

function RailSection({ title, icon, children, id }: { title: string; icon: React.ReactNode; children: React.ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-8 rounded-[24px] border border-[#E5E4E3] bg-white p-6 shadow-sm">
      <h3 className="mb-4 flex items-center gap-2 font-montserrat text-[12px] font-bold uppercase tracking-widest text-[#007970]">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

/**
 * Desktop right-side command rail: search, direct support, guided tours,
 * office-staff training, threads/community, recently updated, baseline notes.
 */
export function HelpCommandRail({
  searchRef,
  onLaunchTour,
}: {
  searchRef: React.RefObject<HTMLInputElement | null>;
  onLaunchTour: (domain: string) => void;
}) {
  const navigate = useNavigate();
  const recent = recentlyUpdated(HELP_CENTER_ARTICLES, 4);

  return (
    <aside aria-label="Help command rail" className="grid content-start gap-6">
      <RailSection title="Search help" icon={<span aria-hidden />}>
        <HelpSearch ref={searchRef} />
      </RailSection>

      <RailSection id="direct-support" title="Direct Support" icon={<Bot className="h-4 w-4 text-[#F06923]" aria-hidden />}>
        <p className="text-sm leading-relaxed text-[#747470]">
          Can't find the right guide? Ask Brad in plain language, or start a help thread for the team.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/iadministrator')}
            className="inline-flex items-center gap-2 rounded-[12px] bg-[#F06923] px-4 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-wider text-white transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Bot className="h-3.5 w-3.5" aria-hidden /> Ask Brad
          </button>
          <button
            type="button"
            onClick={() => navigate('/help/threads/new')}
            className="inline-flex items-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-4 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970] transition-colors hover:bg-[#F7FEFF] focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden /> New thread
          </button>
        </div>
      </RailSection>

      <RailSection title="Guided Tours" icon={<Compass className="h-4 w-4 text-[#F06923]" aria-hidden />}>
        <div className="grid gap-2">
          {HELP_TOURS.map((tour) => (
            <button
              key={tour.tourId}
              type="button"
              onClick={() => onLaunchTour(tour.domain)}
              className="rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-3 text-left transition-colors hover:border-[#C4F4F5] hover:bg-[#E5FEFF] focus-visible:outline-none focus-visible:shadow-focus"
            >
              <span className="block text-sm font-medium text-[#52404B]">{tour.title}</span>
              <span className="mt-0.5 block font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                {tour.estimatedTime} · launches in-app
              </span>
            </button>
          ))}
        </div>
      </RailSection>

      <RailSection title="Office Staff Training" icon={<GraduationCap className="h-4 w-4 text-[#F06923]" aria-hidden />}>
        <p className="text-sm leading-relaxed text-[#747470]">
          The end-user syllabus walks every non-admin workspace with practice actions and knowledge checks.
        </p>
        <button
          type="button"
          onClick={() => navigate('/help/syllabus')}
          className="mt-4 inline-flex items-center gap-2 rounded-[12px] border-[1.5px] border-[#007970] bg-white px-4 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970] transition-colors hover:bg-[#F7FEFF] focus-visible:outline-none focus-visible:shadow-focus"
        >
          Open syllabus
        </button>
      </RailSection>

      <RailSection title="Threads & Community" icon={<MessagesSquare className="h-4 w-4 text-[#F06923]" aria-hidden />}>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => navigate('/help/threads')}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#52404B] transition-colors hover:border-[#C4F4F5] hover:bg-[#E5FEFF] hover:text-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
          >
            <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> Threads
          </button>
          <button
            type="button"
            onClick={() => navigate('/community')}
            className="inline-flex items-center gap-2 rounded-[12px] border border-[#E5E4E3] bg-[#FAFBF8] px-4 py-2.5 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#52404B] transition-colors hover:border-[#C4F4F5] hover:bg-[#E5FEFF] hover:text-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
          >
            <Users className="h-3.5 w-3.5" aria-hidden /> Community
          </button>
        </div>
      </RailSection>

      <RailSection title="Recently Updated" icon={<span aria-hidden />}>
        <ol className="grid gap-2">
          {recent.map((article, i) => (
            <li key={article.articleId}>
              <Link to={`/help/${article.slug}`} className="group flex items-start gap-3 rounded-[12px] focus-visible:outline-none focus-visible:shadow-focus">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] bg-[#E5FEFF] font-montserrat text-xs font-bold text-[#007970]">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-[#52404B] group-hover:text-[#007970]">{article.title}</span>
                  <span className="block font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#A0A0A0]">
                    {article.lastUpdated} · {article.estimatedTime}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </RailSection>

      <RailSection title="Baseline Notes" icon={<span aria-hidden />}>
        <ul className="grid list-disc gap-2 pl-4 text-sm leading-relaxed text-[#747470]">
          {BASELINE_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </RailSection>
    </aside>
  );
}
