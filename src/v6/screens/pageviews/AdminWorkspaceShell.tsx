import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BadgeCheck,
  Building2,
  ChevronRight,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  UserRoundCog,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { cx } from '../../utils/classNames';
import { StaticCardWatermark } from './StaticCardWatermark';

type AdminSectionId = 'overview' | 'people' | 'access' | 'oversight' | 'community';

interface AdminSection {
  id: AdminSectionId;
  label: string;
  description: string;
  to: string;
  icon: LucideIcon;
}

interface AdminRouteMeta {
  eyebrow: string;
  title: string;
  description: string;
  section: AdminSectionId;
}

const ADMIN_SECTIONS: readonly AdminSection[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Priorities and control-plane posture',
    to: '/admin',
    icon: LayoutDashboard,
  },
  {
    id: 'people',
    label: 'People',
    description: 'Accounts, lifecycle, and user records',
    to: '/admin/users',
    icon: UsersRound,
  },
  {
    id: 'access',
    label: 'Access',
    description: 'Groups, roles, and permissions',
    to: '/admin/user-groups',
    icon: KeyRound,
  },
  {
    id: 'oversight',
    label: 'Oversight',
    description: 'Signing, reviews, and reconciliation',
    to: '/admin/signature-coverage',
    icon: ShieldCheck,
  },
  {
    id: 'community',
    label: 'Community',
    description: 'Profile visibility and moderation',
    to: '/admin/community-profiles',
    icon: Building2,
  },
];

const ACCESS_LINKS = [
  { label: 'User groups', to: '/admin/user-groups' },
  { label: 'Roles', to: '/admin/roles' },
  { label: 'Permissions', to: '/admin/permissions' },
] as const;

const OVERSIGHT_LINKS = [
  { label: 'Signature coverage', to: '/admin/signature-coverage' },
  { label: 'Access reviews', to: '/admin/access-review' },
  { label: 'Reconciliation', to: '/admin/reconciliation' },
] as const;

function routeMeta(pathname: string): AdminRouteMeta {
  if (pathname === '/admin' || pathname === '/admin/') {
    return {
      eyebrow: 'ADMIN CONTROL CENTER',
      title: 'Access, identity, and authority—at a glance',
      description: 'One focused workspace for people, effective access, signing authority, and the reviews that keep every change accountable.',
      section: 'overview',
    };
  }
  if (pathname.startsWith('/admin/users/')) {
    return {
      eyebrow: 'PEOPLE · USER RECORD',
      title: 'User control-plane record',
      description: 'Review one canonical identity across account lifecycle, effective access, page visibility, signing authority, competency, and audit history.',
      section: 'people',
    };
  }
  if (pathname.startsWith('/admin/users')) {
    return {
      eyebrow: 'PEOPLE & ACCOUNTS',
      title: 'People and account lifecycle',
      description: 'Invite users, manage real login status, and keep prototype onboarding data clearly separated from server-authoritative controls.',
      section: 'people',
    };
  }
  if (pathname.startsWith('/admin/roles')) {
    return {
      eyebrow: 'ACCESS CONTROL',
      title: 'Roles',
      description: 'Understand role intent, inherited permission posture, and the governance evidence behind privileged access.',
      section: 'access',
    };
  }
  if (pathname.startsWith('/admin/permissions')) {
    return {
      eyebrow: 'ACCESS CONTROL',
      title: 'Permissions',
      description: 'Inspect the business actions, risk levels, role usage, and control paths that shape effective access.',
      section: 'access',
    };
  }
  if (pathname.startsWith('/admin/user-groups')) {
    return {
      eyebrow: 'ACCESS CONTROL',
      title: 'User groups',
      description: 'Review governed cohorts, membership scope, permission posture, and the guardrails around privileged groups.',
      section: 'access',
    };
  }
  if (pathname.startsWith('/admin/access-review')) {
    return {
      eyebrow: 'ACCESS OVERSIGHT',
      title: 'Access review campaigns',
      description: 'Schedule and track policy-based reviews without hard-coding cadence or weakening server authorization.',
      section: 'oversight',
    };
  }
  if (pathname.startsWith('/admin/reconciliation')) {
    return {
      eyebrow: 'IDENTITY OVERSIGHT',
      title: 'Reconciliation queue',
      description: 'Resolve identity and access anomalies deliberately. Nothing is auto-merged, and email alone never becomes identity authority.',
      section: 'oversight',
    };
  }
  if (pathname.startsWith('/admin/signature-coverage')) {
    return {
      eyebrow: 'SIGNATURE OVERSIGHT',
      title: 'Signature coverage',
      description: 'See who currently holds each business signing capacity and where required coverage still needs an assignment.',
      section: 'oversight',
    };
  }
  return {
    eyebrow: 'COMMUNITY ADMINISTRATION',
    title: 'Community profiles',
    description: 'Manage internal profile visibility and moderation while keeping community content separate from access authority.',
    section: 'community',
  };
}

function isExactOrNested(pathname: string, to: string) {
  if (to === '/admin') return pathname === '/admin' || pathname === '/admin/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

function ContextNav({ links, pathname }: { links: readonly { label: string; to: string }[]; pathname: string }) {
  return (
    <nav aria-label="Admin section pages" className="flex max-w-full gap-xs overflow-x-auto rounded-2xl bg-white p-xs shadow-[0_10px_30px_rgba(0,47,48,0.06)]">
      {links.map((link) => {
        const active = isExactOrNested(pathname, link.to);
        return (
          <Link
            aria-current={active ? 'page' : undefined}
            className={cx(
              'min-h-tap whitespace-nowrap rounded-xl px-lg py-sm font-montserrat text-[11px] font-medium uppercase tracking-[0.14em] transition-colors focus-visible:outline-none focus-visible:shadow-focus',
              active
                ? 'bg-tone-teal-bg text-brand-teal-deep shadow-sm'
                : 'text-muted hover:bg-surface-hover hover:text-brand-teal-deep',
            )}
            key={link.to}
            to={link.to}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminWorkspaceShell({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const meta = routeMeta(pathname);
  const isOverview = meta.section === 'overview';
  const contextLinks = meta.section === 'access'
    ? ACCESS_LINKS
    : meta.section === 'oversight'
      ? OVERSIGHT_LINKS
      : null;

  return (
    <div className="mx-auto grid w-full max-w-[1400px] gap-lg pb-2xl" data-admin-workspace>
      <header
        aria-labelledby="admin-workspace-title"
        className={cx(
          'ci-page-hero overflow-hidden rounded-[28px] bg-white shadow-[0_18px_48px_rgba(0,47,48,0.08)]',
          isOverview ? 'min-h-[270px] px-xl py-2xl tablet-l:px-2xl' : 'min-h-[190px] px-xl py-xl tablet-l:px-2xl',
        )}
      >
        <StaticCardWatermark />
        <div className="flex h-full max-w-[790px] flex-col justify-center">
          <p className="font-montserrat text-[11px] font-medium uppercase tracking-[0.18em] text-brand-orange">
            {meta.eyebrow}
          </p>
          <h1
            className={cx(
              'mt-sm max-w-[760px] font-roboto font-light leading-[1.04] tracking-[-0.035em] text-brand-teal-deep',
              isOverview ? 'text-[clamp(2.25rem,4vw,3.7rem)]' : 'text-[clamp(2rem,3vw,3rem)]',
            )}
            id="admin-workspace-title"
          >
            {meta.title}
          </h1>
          <p className="mt-md max-w-[720px] text-sm font-light leading-relaxed text-secondary tablet-l:text-base">
            {meta.description}
          </p>
          <div className="mt-lg flex flex-wrap gap-sm">
            <span className="inline-flex items-center gap-xs rounded-full bg-tone-teal-bg px-md py-xs text-[11px] font-medium text-tone-teal-text">
              <BadgeCheck aria-hidden className="h-3.5 w-3.5" /> Server-authoritative decisions
            </span>
            <span className="inline-flex items-center gap-xs rounded-full bg-tone-orange-bg px-md py-xs text-[11px] font-medium text-tone-orange-text">
              <UserRoundCog aria-hidden className="h-3.5 w-3.5" /> Privileged workspace
            </span>
          </div>
        </div>
      </header>

      <nav aria-label="Admin Control Center" className="flex max-w-full gap-sm overflow-x-auto rounded-[24px] bg-white p-sm shadow-[0_14px_38px_rgba(0,47,48,0.07)] tablet-p:grid tablet-p:grid-cols-5">
        {ADMIN_SECTIONS.map((section) => {
          const active = meta.section === section.id;
          const Icon = section.icon;
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              className={cx(
                'group flex min-h-[76px] min-w-[220px] items-center gap-md rounded-[18px] px-md py-sm transition-colors focus-visible:outline-none focus-visible:shadow-focus tablet-p:min-w-0',
                active ? 'bg-tone-teal-bg text-brand-teal-deep' : 'text-secondary hover:bg-surface-hover hover:text-brand-teal-deep',
              )}
              key={section.id}
              to={section.to}
            >
              <span className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', active ? 'bg-white text-brand-teal' : 'bg-surface text-muted group-hover:text-brand-teal')}>
                <Icon aria-hidden className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-xs text-sm font-medium text-ink">
                  {section.label}
                  {active && <ChevronRight aria-hidden className="h-3.5 w-3.5 text-brand-teal" />}
                </span>
                <span className="mt-[2px] block text-[11px] font-light leading-snug text-muted">{section.description}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {contextLinks && <ContextNav links={contextLinks} pathname={pathname} />}

      <section aria-label={`${meta.title} workspace`} className="min-w-0">
        {children}
      </section>
    </div>
  );
}

export default AdminWorkspaceShell;
