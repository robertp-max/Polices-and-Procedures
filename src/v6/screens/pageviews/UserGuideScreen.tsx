import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, BadgeCheck, BookOpen, FolderOpen, GraduationCap,
  HelpCircle, Rocket, ShieldCheck, UserCheck, type LucideIcon,
} from 'lucide-react';
import { toneSurfaceClasses } from '../../components';
import { type Tone } from '../../tokens';
import { cx } from '../../utils/classNames';

/* ════════════════════════════════════════════════════════════════
   User Guide — an app guide dashboard (not a flat docs page).
   Each card states purpose, who it applies to, the key requirement,
   and a direct action into the relevant onboarding surface. Content
   mirrors the canonical onboarding gates (Appendix F hard stop, GAO
   27 modules + EXAM, supervised practice per 42 CFR 484.80, Appendix B
   clearance, escalations) — no fabricated requirements.
   ════════════════════════════════════════════════════════════════ */

interface GuideCard {
  icon: LucideIcon;
  tone: Tone;
  title: string;
  purpose: string;
  who: string;
  requirement: string;
  to: string;
  cta: string;
}

const GUIDE: GuideCard[] = [
  { icon: Rocket, tone: 'teal', title: 'Start here', purpose: 'Your onboarding path from first login to independent practice.', who: 'Every new hire', requirement: 'Begin in the New Hire Portal and clear each gate in order.', to: '/journey/new-hire', cta: 'Open New Hire Portal' },
  { icon: ShieldCheck, tone: 'orange', title: 'Before your first visit', purpose: 'Day-0 Appendix F readiness — a hard stop before any work.', who: 'All new hires (pre-Day-1)', requirement: 'All items PASS/NA + HR Director signature (HR-TA-001) before any shift.', to: '/journey/appendix-f', cta: 'Open Appendix F' },
  { icon: GraduationCap, tone: 'blue', title: 'Training requirements', purpose: 'The GAO phase — 27 modules and a final exam.', who: 'All clinical learners', requirement: 'Quizzes ≥ 80%, EXAM with dual sign-off, 3-business-day remediation window.', to: '/journey', cta: 'Open Journey' },
  { icon: UserCheck, tone: 'violet', title: 'Supervised practice', purpose: 'Role-specific modules plus supervised field visits.', who: 'Role-specific clinicians', requirement: 'Supervised visits per 42 CFR 484.80; dual sign-off for skills.', to: '/journey/supervisor', cta: 'Supervisor view' },
  { icon: BadgeCheck, tone: 'green', title: 'Clearance (Appendix B)', purpose: 'Sign-off that authorizes independent practice.', who: 'Clinicians seeking clearance', requirement: 'DON signature; GAO-EXAM and required supervised visits complete.', to: '/journey', cta: 'View clearance status' },
  { icon: AlertTriangle, tone: 'amber', title: 'Escalations & remediation', purpose: 'What happens when training or competency lapses.', who: 'Supervisors & administrators', requirement: 'Overdue training and competency fails trigger 60-day remediation plans.', to: '/journey/admin', cta: 'Open Journey Admin' },
  { icon: FolderOpen, tone: 'teal', title: 'Where to find evidence', purpose: 'Filed proof, packets, and signatures live in DefenCIble.', who: 'Everyone', requirement: 'Browse Year → Event → Documents; sign with eCIgn when permitted.', to: '/evidence', cta: 'Open DefenCIble' },
  { icon: HelpCircle, tone: 'slate', title: 'Common questions', purpose: 'Operator guides and step-by-step compliance articles.', who: 'Everyone', requirement: 'Search the Help Center for the task you are trying to complete.', to: '/help', cta: 'Open Help Center' },
];

export function UserGuideScreen() {
  return (
    <section
      className="grid gap-lg"
      data-group="Onboarding"
      data-hash-id="user-guide"
      data-route="/journey/guide"
      data-template="docs"
    >
      {/* Compact app header */}
      <div className="flex flex-wrap items-center gap-sm rounded-lg border border-hairline bg-surface-glass p-md shadow-rest backdrop-blur-md">
        <BookOpen className="h-icon-sm w-icon-sm text-brand-teal" aria-hidden="true" />
        <h1 className="text-h3 font-medium text-ink">User Guide</h1>
        <span className="text-xs text-muted">Operator reference for onboarding, training, supervision, clearance, and evidence.</span>
      </div>

      {/* Guide dashboard */}
      <div className="grid gap-md tablet-l:grid-cols-2 desktop:grid-cols-3">
        {GUIDE.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="flex min-w-0 flex-col gap-sm rounded-lg border border-hairline bg-surface-glass p-lg shadow-rest backdrop-blur-md transition duration-base ease-standard hover:shadow-hover">
              <div className="flex items-center gap-sm">
                <span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-lg border', toneSurfaceClasses[card.tone])}>
                  <Icon aria-hidden="true" className="h-icon-sm w-icon-sm" />
                </span>
                <h2 className="text-sm font-medium text-brand-teal-deep">{card.title}</h2>
              </div>
              <p className="text-xs font-light leading-sm text-secondary">{card.purpose}</p>
              <dl className="grid gap-xs text-xs">
                <div className="flex gap-sm">
                  <dt className="shrink-0 font-medium uppercase tracking-tag text-muted">Who</dt>
                  <dd className="text-right text-secondary ml-auto">{card.who}</dd>
                </div>
                <div className="flex gap-sm">
                  <dt className="shrink-0 font-medium uppercase tracking-tag text-muted">Need</dt>
                  <dd className="text-secondary">{card.requirement}</dd>
                </div>
              </dl>
              <Link
                to={card.to}
                className="mt-auto inline-flex min-h-tap items-center justify-center gap-xs rounded-md border border-brand-teal bg-surface-glass px-md text-sm font-light text-brand-teal shadow-glass-inset transition duration-fast ease-standard hover:bg-surface-hover"
              >
                {card.cta} <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default UserGuideScreen;
