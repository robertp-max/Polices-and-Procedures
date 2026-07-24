import { useState } from 'react';
import { CheckCircle2, ChevronDown, GraduationCap, Route, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { SyllabusLesson, SyllabusModule } from '@/policy/helpCenter/types';
import { OFFICE_STAFF_SYLLABUS } from '@/policy/helpCenter/data/officeStaffSyllabus';
import { getArticleById } from '@/policy/helpCenter/data/helpArticles';
import { StaticCardWatermark } from '../StaticCardWatermark';
import { HelpBadgeRow } from './HelpBadge';

export function HelpSyllabusLessonCard({ lesson }: { lesson: SyllabusLesson }) {
  const [revealed, setRevealed] = useState(false);
  const articles = lesson.relatedArticleIds
    .map((id) => getArticleById(id))
    .filter((a): a is NonNullable<ReturnType<typeof getArticleById>> => Boolean(a));

  return (
    <div className="rounded-[16px] border border-[#E5E4E3] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742]">{lesson.lessonId}</p>
          <h4 className="mt-1 font-montserrat text-base font-bold text-[#004142]">{lesson.title}</h4>
        </div>
        <HelpBadgeRow badges={lesson.badges} size="sm" max={4} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-[12px] bg-[#FAFBF8] p-4">
          <p className="mb-1 flex items-center gap-1.5 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#007970]">
            <Target className="h-3.5 w-3.5" aria-hidden /> Your goal
          </p>
          <p className="text-sm leading-relaxed text-[#52404B]">{lesson.userGoal}</p>
          {lesson.route ? (
            <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-[#474742]">
              <Route className="h-3.5 w-3.5" aria-hidden /> {lesson.route}
            </p>
          ) : null}
        </div>
        <div className="rounded-[12px] bg-[#F7FEFF] p-4">
          <p className="mb-1 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#007970]">Practice this (demo data)</p>
          <p className="text-sm leading-relaxed text-[#52404B]">{lesson.practiceAction}</p>
        </div>
      </div>

      {lesson.successCriteria.length > 0 ? (
        <ul className="mt-4 grid gap-1.5 md:grid-cols-2">
          {lesson.successCriteria.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm leading-relaxed text-[#52404B]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#008540]" aria-hidden /> {c}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 rounded-[12px] border border-[#E5E4E3] p-4">
        <p className="font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#9A6700]">Knowledge check</p>
        <p className="mt-1 text-sm font-medium text-[#52404B]">{lesson.knowledgeCheck.question}</p>
        <button
          type="button"
          onClick={() => setRevealed((v) => !v)}
          aria-expanded={revealed}
          className="mt-2 inline-flex items-center gap-1.5 rounded-[8px] font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970] hover:text-[#C2410C] focus-visible:outline-none focus-visible:shadow-focus"
        >
          {revealed ? 'Hide answer' : 'Reveal answer'}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${revealed ? 'rotate-180' : ''}`} aria-hidden />
        </button>
        {revealed ? <p className="mt-2 text-sm leading-relaxed text-[#3D3D3A]">{lesson.knowledgeCheck.answer}</p> : null}
      </div>

      {articles.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {articles.map((a) => (
            <Link
              key={a.articleId}
              to={`/help/${a.slug}`}
              className="rounded-full border border-[#E5E4E3] bg-white px-3 py-1.5 font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#52404B] transition-colors hover:border-[#007970] hover:text-[#007970] focus-visible:outline-none focus-visible:shadow-focus"
            >
              {a.title}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SyllabusModuleCard({ module, index }: { module: SyllabusModule; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <section className="overflow-hidden rounded-[24px] border border-[#E5E4E3] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-6 text-left transition-colors hover:bg-[#FAFBF8] focus-visible:outline-none focus-visible:shadow-focus md:p-8"
      >
        <span className="flex min-w-0 items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#E5FEFF] font-montserrat text-sm font-bold text-[#007970]">
            {module.order}
          </span>
          <span className="min-w-0">
            <span className="block font-montserrat text-lg font-bold text-[#007970]">{module.title}</span>
            <span className="mt-1 block text-sm leading-relaxed text-[#3D3D3A]">{module.description}</span>
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          <span className="hidden font-montserrat text-[10px] font-bold uppercase tracking-wider text-[#474742] md:block">
            {module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}
          </span>
          <ChevronDown className={`h-5 w-5 text-[#474742] transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden />
        </span>
      </button>
      {open ? (
        <div className="space-y-4 border-t border-[#E5E4E3] p-6 md:p-8">
          <HelpBadgeRow badges={module.badges} size="sm" />
          {module.lessons.map((lesson) => (
            <HelpSyllabusLessonCard key={lesson.lessonId} lesson={lesson} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/**
 * Office Staff End User Training Syllabus landing (/help/syllabus).
 * Progress-ready layout: module list renders sequentially with per-module
 * lesson cards; progress persistence is a future enhancement.
 */
export function HelpSyllabusLanding() {
  const lessonCount = OFFICE_STAFF_SYLLABUS.reduce((n, m) => n + m.lessons.length, 0);
  return (
    <div className="space-y-8">
      <section className="ci-page-hero relative overflow-hidden rounded-b-[24px] rounded-tr-[24px] border border-[#E5E4E3] bg-white p-10 shadow-sm md:p-14">
        <StaticCardWatermark />
        <div className="relative z-10">
          <h2 className="mb-6 font-montserrat text-[13px] font-bold uppercase tracking-wider text-[#C2410C]">
            Office Staff End User Training
          </h2>
          <h1 className="mb-6 max-w-3xl font-montserrat text-4xl font-bold leading-tight tracking-tight text-[#007970] md:text-5xl">
            Learn the whole app, one workspace at a time
          </h1>
          <p className="mb-8 max-w-3xl font-roboto text-lg font-light leading-relaxed text-[#52404B]">
            {OFFICE_STAFF_SYLLABUS.length} modules and {lessonCount} hands-on lessons cover every non-admin workspace —
            with practice actions, knowledge checks, and success criteria. Demo data only; admin configuration is excluded.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-2 rounded-[12px] bg-[#E5FEFF] px-5 py-3 font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#007970]">
              <GraduationCap className="h-4 w-4" aria-hidden /> {OFFICE_STAFF_SYLLABUS.length} modules
            </span>
            <span className="font-montserrat text-[11px] font-bold uppercase tracking-wider text-[#474742]">
              Progress-ready path — work top to bottom; completion status can attach to each lesson
            </span>
          </div>
        </div>
      </section>

      {OFFICE_STAFF_SYLLABUS.map((module, i) => (
        <SyllabusModuleCard key={module.moduleId} module={module} index={i} />
      ))}
    </div>
  );
}
