import { ArrowRight, BarChart3, Bell, BookOpen, Bot, Calendar, ClipboardCheck, FileText, FolderOpen, GraduationCap, HelpCircle, Home, Lightbulb, Map, MessagesSquare, PenTool, Settings, UserPlus, Users, Wrench, type LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { HelpCenterCategory } from '@/policy/helpCenter/types';
import { HelpBadge } from './HelpBadge';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Home,
  Bot,
  GraduationCap,
  Map,
  Calendar,
  FolderOpen,
  PenTool,
  FileText,
  BookOpen,
  BarChart3,
  ClipboardCheck,
  UserPlus,
  Users,
  Lightbulb,
  MessagesSquare,
  Bell,
  Wrench,
  Settings,
};

export function categoryIcon(name: string): LucideIcon {
  return CATEGORY_ICONS[name] ?? HelpCircle;
}

/**
 * Workspace-style category card matching the Dashboard "Today's Focus" /
 * Journey ModuleCard pattern: icon tile + status pill, orange eyebrow, teal
 * title, muted body, uppercase "Browse articles" footer link.
 */
export function HelpCategoryCard({
  category,
  articleCount,
  index,
}: {
  category: HelpCenterCategory;
  articleCount: number;
  index: number;
}) {
  const navigate = useNavigate();
  const Icon = categoryIcon(category.icon);
  return (
    <button
      type="button"
      onClick={() => navigate(`/help/category/${category.categoryId}`)}
      style={{ animationDelay: `${index * 60}ms` }}
      className="ci-stagger-card group flex min-h-[220px] flex-col justify-between rounded-[24px] border border-[#E5E4E3] bg-white p-7 text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#007970] hover:shadow-md focus-visible:outline-none focus-visible:shadow-focus"
    >
      <span>
        <span className="mb-5 flex items-center justify-between gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[#E5FEFF] text-[#007970]">
            <Icon className="h-6 w-6" aria-hidden />
          </span>
          <HelpBadge badgeId={category.primaryBadge} />
        </span>
        <span className="block font-montserrat text-lg font-bold text-[#007970] transition-colors group-hover:text-[#C2410C]">
          {category.title}
        </span>
        <span className="mt-2 block text-sm leading-relaxed text-[#3D3D3A]">{category.shortDescription}</span>
      </span>
      <span className="mt-6 inline-flex items-center gap-2 font-montserrat text-[11px] font-bold uppercase tracking-widest text-[#007970]">
        Browse {articleCount} {articleCount === 1 ? 'article' : 'articles'}
        <ArrowRight className="h-4 w-4 text-[#C2410C] transition-transform group-hover:translate-x-1" aria-hidden />
      </span>
    </button>
  );
}
