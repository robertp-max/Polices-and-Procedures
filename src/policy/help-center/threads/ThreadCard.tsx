import { MessageSquare, ThumbsUp, CheckCircle2, GitMerge, Pin, Users } from 'lucide-react';
import { Badge } from '@/v6/primitives';
import { cx } from '@/v6/utils/classNames';
import type { HelpThread } from './types';
import {
  THREAD_STATUS_LABEL,
  THREAD_CATEGORY_LABEL,
  statusToneClass,
  relativeTime,
} from './threadView';
import { ThreadSourceBadge } from './ThreadSourceBadge';

interface ThreadCardProps {
  thread: HelpThread;
  onOpen: (threadId: string) => void;
}

/** A single thread row/card in a list or panel. */
export function ThreadCard({ thread, onOpen }: ThreadCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(thread.id)}
      className="w-full text-left rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg hover:bg-surface-hover transition duration-fast"
    >
      <div className="flex items-start justify-between gap-md">
        <div className="min-w-0">
          <div className="flex items-center gap-sm">
            {thread.adminPinned && <Pin aria-label="Pinned" className="h-icon-sm w-icon-sm text-brand-teal" />}
            <span className="font-medium text-ink truncate">{thread.title}</span>
            {thread.acceptedAnswerMessageId && (
              <CheckCircle2 aria-label="Has accepted answer" className="h-icon-sm w-icon-sm text-tone-green-text" />
            )}
            {(thread.status === 'duplicate' || thread.canonicalThreadId) && (
              <GitMerge aria-label="Merged duplicate" className="h-icon-sm w-icon-sm text-muted" />
            )}
          </div>
          <div className="mt-xs flex flex-wrap items-center gap-xs text-xs text-muted">
            <span className={cx('font-medium', statusToneClass(thread.status))}>
              {THREAD_STATUS_LABEL[thread.status]}
            </span>
            <span aria-hidden="true">·</span>
            <span>{THREAD_CATEGORY_LABEL[thread.category]}</span>
            <ThreadSourceBadge source={thread.source} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-md text-xs text-muted">
          <span className="inline-flex items-center gap-xs" title="Upvotes">
            <ThumbsUp aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="tabular-nums">{thread.upvoteCount}</span>
          </span>
          <span className="inline-flex items-center gap-xs" title="Replies">
            <MessageSquare aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="tabular-nums">{thread.messageCount}</span>
          </span>
          <span className="inline-flex items-center gap-xs" title="Participants">
            <Users aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="tabular-nums">{thread.participantCount}</span>
          </span>
        </div>
      </div>
      <div className="mt-sm flex items-center justify-between text-xs text-muted">
        <span>Last activity {relativeTime(thread.lastActivityAt)}</span>
        {thread.tags.length > 0 && (
          <span className="flex flex-wrap gap-xs">
            {thread.tags.slice(0, 3).map(tag => (
              <Badge key={tag} size="sm">{tag}</Badge>
            ))}
          </span>
        )}
      </div>
    </button>
  );
}

export default ThreadCard;
