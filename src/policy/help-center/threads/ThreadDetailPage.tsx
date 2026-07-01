import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, Globe, CheckCircle2, ShieldAlert, Bot, UserRound } from 'lucide-react';
import { Badge, Button, Textarea } from '@/v6/primitives';
import { cx } from '@/v6/utils/classNames';
import { useThreadStore } from './threadStore';
import { useThreadActor } from './useThreadActor';
import { awardBadge } from '@/v6/utils/communityBadges';
import { BradThreadReply } from './BradThreadReply';
import { ThreadMergeBanner } from './ThreadMergeBanner';
import { ThreadSourceBadge } from './ThreadSourceBadge';
import { ThreadAdminControls } from './ThreadAdminControls';
import {
  THREAD_STATUS_LABEL,
  THREAD_CATEGORY_LABEL,
  statusToneClass,
  relativeTime,
} from './threadView';
import { PHI_FIELD_WARNING, PHI_WARNING_MESSAGE, scanForPhi, type PhiScanResult } from './threadPhiGuard';

interface ThreadDetailPageProps {
  threadId: string;
  onBack: () => void;
  onOpenThread: (threadId: string) => void;
  onOpenRoute?: (route: string) => void;
}

export function ThreadDetailPage({ threadId, onBack, onOpenThread, onOpenRoute }: ThreadDetailPageProps) {
  const navigate = useNavigate();
  const actor = useThreadActor();
  const thread = useThreadStore(s => s.threads.find(t => t.id === threadId));
  const messages = useThreadStore(s => s.messages);
  const summary = useThreadStore(s => s.summaries[threadId]);
  const toggleUpvote = useThreadStore(s => s.toggleUpvote);
  const publish = useThreadStore(s => s.publishToHelpCenter);
  const addMessage = useThreadStore(s => s.addMessage);
  const acceptAnswer = useThreadStore(s => s.acceptAnswer);

  const [reply, setReply] = useState('');
  const [phi, setPhi] = useState<PhiScanResult | null>(null);

  if (!thread) {
    return (
      <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl">
        <Button variant="tertiary" iconLeft={<ArrowLeft className="h-icon-sm w-icon-sm" />} onClick={onBack}>
          Back to threads
        </Button>
        <p className="mt-md text-sm text-muted">This thread is no longer available.</p>
      </div>
    );
  }

  const threadMessages = messages
    .filter(m => m.threadId === threadId && !m.hiddenByAdmin)
    .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));

  function postReply(opts?: { sanitize?: boolean }) {
    const result = addMessage(
      {
        threadId,
        authorType: actor.isAdmin ? 'admin' : 'user',
        authorUserId: actor.userId,
        authorDisplayName: actor.displayName,
        body: reply,
      },
      { sanitize: opts?.sanitize },
    );
    if (!result.ok) {
      if (result.reason === 'phi') setPhi(result.phi);
      return;
    }
    setReply('');
    setPhi(null);
  }

  const hasUpvoted = thread.upvotedByUserIds.includes(actor.userId);
  const canPublish = thread.visibility === 'private_to_user' && thread.createdByUserId === actor.userId;

  return (
    <div className="grid gap-lg">
      <div className="flex items-center justify-between">
        <Button variant="tertiary" iconLeft={<ArrowLeft className="h-icon-sm w-icon-sm" />} onClick={onBack}>
          Back to threads
        </Button>
        <div className="flex items-center gap-sm">
          <Button
            size="sm"
            variant={hasUpvoted ? 'primary' : 'secondary'}
            iconLeft={<ThumbsUp className="h-icon-sm w-icon-sm" />}
            onClick={() => toggleUpvote(threadId, actor.userId)}
          >
            {thread.upvoteCount}
          </Button>
          {canPublish && (
            <Button
              size="sm"
              variant="secondary"
              iconLeft={<Globe className="h-icon-sm w-icon-sm" />}
              onClick={() => publish(threadId)}
            >
              Publish to Help Center
            </Button>
          )}
        </div>
      </div>

      {thread.canonicalThreadId && (
        <ThreadMergeBanner canonicalThreadId={thread.canonicalThreadId} onOpenCanonical={onOpenThread} />
      )}

      <header className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
        <h2 className="text-h2 font-medium text-ink">{thread.title}</h2>
        <div className="mt-sm flex flex-wrap items-center gap-xs text-xs text-muted">
          <span className={cx('font-medium', statusToneClass(thread.status))}>{THREAD_STATUS_LABEL[thread.status]}</span>
          <span aria-hidden="true">·</span>
          <span>{THREAD_CATEGORY_LABEL[thread.category]}</span>
          <ThreadSourceBadge source={thread.source} />
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className="hover:underline hover:text-brand-teal inline-flex items-center gap-1"
            onClick={() => {
              const uid = thread.createdByUserId;
              if (uid && uid !== 'brad' && !uid.startsWith('brad')) navigate(`/community/users/${uid}`);
            }}
            title={thread.createdByUserId ? 'View profile' : undefined}
          >
            Started by {thread.createdByDisplayName ?? 'a teammate'} {relativeTime(thread.createdAt)}
            {thread.createdByUserId && <UserRound className="h-3 w-3" />}
          </button>
          {thread.visibility === 'private_to_user' && <Badge size="sm">Private</Badge>}
        </div>
      </header>

      {summary && (
        <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
          <h4 className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-brand-teal">
            <Bot aria-hidden="true" className="h-icon-sm w-icon-sm" /> Brad summary
          </h4>
          <p className="mt-xs text-sm text-secondary">{summary.summary}</p>
          {summary.openQuestions.length > 0 && (
            <div className="mt-sm text-sm text-secondary">
              <span className="font-medium text-ink">Open questions:</span>
              <ul className="list-disc pl-md">{summary.openQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
            </div>
          )}
        </section>
      )}

      <section className="grid gap-md">
        {threadMessages.map(m =>
          m.authorType === 'brad' ? (
            <BradThreadReply key={m.id} message={m} onOpenReference={onOpenRoute} />
          ) : m.authorType === 'system' ? (
            <p key={m.id} className="text-center text-xs italic text-muted">{m.body}</p>
          ) : (
            <article
              key={m.id}
              className={cx(
                'rounded-lg border p-lg',
                m.id === thread.acceptedAnswerMessageId
                  ? 'border-tone-green-border bg-tone-green-bg'
                  : 'border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset',
              )}
            >
              <div className="flex items-center justify-between text-xs text-muted">
                <button
                  type="button"
                  className="font-medium text-ink inline-flex items-center gap-1 hover:underline hover:text-brand-teal"
                  onClick={() => {
                    const uid = m.authorUserId;
                    if (uid && uid !== 'brad' && !uid.startsWith('brad')) navigate(`/community/users/${uid}`);
                  }}
                  title={m.authorUserId ? 'View profile' : undefined}
                  disabled={!m.authorUserId}
                >
                  {m.authorDisplayName ?? 'Teammate'}
                  {m.authorType === 'admin' && <Badge size="sm" className="ml-xs">Admin</Badge>}
                  {m.authorUserId && <UserRound className="h-3 w-3" />}
                </button>
                <span>{relativeTime(m.createdAt)}</span>
              </div>
              {m.originLabel && <div className="mt-xs text-[10px] italic text-muted">{m.originLabel}</div>}
              <p className="mt-sm whitespace-pre-wrap text-sm text-secondary">{m.body}</p>
              {m.sanitized && <div className="mt-xs text-[10px] text-muted">Sanitized to remove possible PHI.</div>}
              {m.authorUserId && m.authorUserId !== actor.userId && (m.authorType === 'user' || m.authorType === 'admin') && (
                <button
                  type="button"
                  className="mt-2 text-xs text-brand-teal hover:underline"
                  onClick={() => {
                    if (m.authorUserId) {
                      awardBadge(m.authorUserId, { label: 'Helpful Answer', source: 'thread_helpful', detail: 'Marked in thread' });
                      alert('Thank you — Helpful Answer noted for the author.');
                    }
                  }}
                >
                  Mark as helpful
                </button>
              )}
              {m.id === thread.acceptedAnswerMessageId && (
                <div className="mt-sm flex items-center gap-xs text-xs font-medium text-tone-green-text">
                  <CheckCircle2 aria-hidden="true" className="h-icon-sm w-icon-sm" /> Accepted answer
                </div>
              )}
              {actor.isAdmin && m.id !== thread.acceptedAnswerMessageId && (
                <button
                  type="button"
                  className="mt-sm text-xs font-medium text-brand-teal hover:underline"
                  onClick={() => acceptAnswer(threadId, m.id)}
                >
                  Mark as accepted answer
                </button>
              )}
            </article>
          ),
        )}
      </section>

      {thread.status !== 'duplicate' && (
        <section className="grid gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
          <h4 className="text-sm font-medium text-ink">Reply</h4>
          <div className="rounded-md border border-tone-amber-border bg-tone-amber-bg p-sm text-xs text-tone-amber-text">
            {PHI_FIELD_WARNING}
          </div>
          <Textarea rows={3} value={reply} onChange={e => { const v = e.target.value; setReply(v); const s = scanForPhi(v); setPhi(s.hasPhi ? s : null); }} placeholder="Add to the discussion (no PHI)…" />
          {phi && (
            <div className="rounded-md border border-tone-red-border bg-tone-red-bg p-sm text-xs text-tone-red-text">
              <div className="flex items-center gap-xs font-medium">
                <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm" /> Possible PHI detected
              </div>
              <p className="mt-xs">{PHI_WARNING_MESSAGE}</p>
              <div className="mt-xs flex gap-sm">
                <Button size="sm" variant="secondary" onClick={() => postReply({ sanitize: true })}>Sanitize and post</Button>
                <Button size="sm" variant="tertiary" onClick={() => setPhi(null)}>Edit</Button>
              </div>
            </div>
          )}
          {!phi && (
            <div>
              <Button onClick={() => postReply()} disabled={reply.trim().length === 0}>Post reply</Button>
            </div>
          )}
        </section>
      )}

      {actor.isAdmin && <ThreadAdminControls thread={thread} onOpenThread={onOpenThread} />}
    </div>
  );
}

export default ThreadDetailPage;
