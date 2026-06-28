import { GitMerge } from 'lucide-react';
import { useThreadStore } from './threadStore';

interface ThreadMergeBannerProps {
  canonicalThreadId: string;
  onOpenCanonical: (threadId: string) => void;
}

/** Redirect stub shown at the top of a thread that was merged into another. */
export function ThreadMergeBanner({ canonicalThreadId, onOpenCanonical }: ThreadMergeBannerProps) {
  const canonical = useThreadStore(s => s.threads.find(t => t.id === canonicalThreadId));
  const title = canonical?.title ?? 'the canonical thread';
  return (
    <div className="rounded-lg border border-tone-slate-border bg-tone-slate-bg p-md text-sm text-secondary">
      <div className="flex items-center gap-sm">
        <GitMerge aria-hidden="true" className="h-icon-sm w-icon-sm text-muted" />
        <span>
          This thread was merged into{' '}
          <button
            type="button"
            className="font-medium text-brand-teal hover:underline"
            onClick={() => onOpenCanonical(canonicalThreadId)}
          >
            {title}
          </button>
          .
        </span>
      </div>
    </div>
  );
}

export default ThreadMergeBanner;
