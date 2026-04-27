/**
 * Contextual link to a Help Center article. Use from signing pages, audit
 * pages, dashboards, or anywhere a workflow needs an inline help reference.
 */
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface Props {
  slug: string;
  label?: string;
  variant?: 'inline' | 'pill';
}

export function HelpContextLink({ slug, label, variant = 'inline' }: Props) {
  const text = label ?? 'Help';
  if (variant === 'pill') {
    return (
      <Link
        to={`/help/${slug}`}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EEF1FA] text-[#122555] text-[11px] font-medium border border-[#DDE3F2] hover:bg-[#DDE3F2]"
      >
        <HelpCircle size={12} />
        {text}
      </Link>
    );
  }
  return (
    <Link
      to={`/help/${slug}`}
      className="inline-flex items-center gap-1 text-[12px] text-[#1A3778] hover:text-[#F04B22] hover:underline"
    >
      <HelpCircle size={12} />
      {text}
    </Link>
  );
}
