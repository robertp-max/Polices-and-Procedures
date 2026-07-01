import { MessageSquare, ThumbsUp, CheckCircle2, GitMerge, Pin, Users, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useThreadActor } from './useThreadActor';
import { getUserBadges, getCommendations } from '@/v6/utils/communityBadges';

interface ThreadCardProps {
  thread: HelpThread;
  onOpen: (threadId: string) => void;
}

/** A single thread row/card in a list or panel. */
export function ThreadCard({ thread, onOpen }: ThreadCardProps) {
  const navigate = useNavigate();
  const actor = useThreadActor();
  return (
    <button
      type="button"
      onClick={() => onOpen(thread.id)}
      className="w-full text-left rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg hover:bg-surface-hover transition duration-fast"
    >
      <div className="flex flex-wrap items-start justify-between gap-xs sm:gap-md">
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
        <div className="flex shrink-0 flex-wrap items-center gap-xs sm:gap-md text-xs text-muted">
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
      <div className="mt-sm flex flex-wrap items-center justify-between gap-xs text-xs text-muted">
        <span>Last activity {relativeTime(thread.lastActivityAt)}</span>
        {thread.tags.length > 0 && (
          <span className="flex flex-wrap gap-xs">
            {thread.tags.slice(0, 3).map(tag => (
              <Badge key={tag} size="sm">{tag}</Badge>
            ))}
          </span>
        )}
      </div>

      {/* PART2: Author link to profile (if userId present). Does not affect thread visibility. */}
      {(thread.createdByUserId || thread.createdByDisplayName) && (
        <div className="mt-2 text-[11px] flex items-center gap-1 flex-wrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const uid = thread.createdByUserId;
              if (uid && uid !== 'brad' && !uid.startsWith('brad')) {
                navigate(`/community/users/${uid}`);
              }
            }}
            className="inline-flex items-center gap-1 text-muted hover:text-brand-teal hover:underline"
            title={thread.createdByUserId ? 'View profile' : undefined}
          >
            Started by {thread.createdByDisplayName ?? 'a teammate'}
            {thread.createdByUserId && <UserRound className="h-3 w-3" />}
          </button>
          {/* Real badges on ThreadCard author row (subtle chips or count). Use getUserBadges + getCommendations. Respect visibility. */}
          {(() => {
            const uid = thread.createdByUserId;
            if (!uid) return null;
            const isOwnerOrAdmin = uid === actor.userId || actor.isAdmin;
            const bs = getUserBadges(uid, isOwnerOrAdmin);
            const csCount = getCommendations(uid, isOwnerOrAdmin).filter((c: any) => c.status === 'approved').length;
            if (bs.length === 0 && csCount === 0) return null;
            return (
              <span className="inline-flex items-center gap-1 ml-1">
                {bs.slice(0, 1).map((b: any) => (
                  <Badge key={b.id} size="sm">{b.label}</Badge>
                ))}
                {bs.length > 1 && <Badge size="sm" variant="count">+{bs.length - 1}</Badge>}
                {csCount > 0 && <Badge size="sm" variant="count" title="approved commendations">{csCount}</Badge>}
              </span>
            );
          })()}
        </div>
      )}
    </button>
  );
}

export default ThreadCard;
