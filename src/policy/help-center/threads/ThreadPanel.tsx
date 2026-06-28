import { useMemo, useState } from 'react';
import { MessagesSquare, Plus } from 'lucide-react';
import { Button } from '@/v6/primitives';
import { useThreadStore } from './threadStore';
import { useThreadActor } from './useThreadActor';
import { ThreadCard } from './ThreadCard';
import { ThreadComposer } from './ThreadComposer';
import { sourceObjectKey } from './threadTopicKey';
import { canViewThread } from './threadView';
import type { HelpThreadSource, HelpThreadType, HelpThreadCategory } from './types';

/** Sensible thread type + category defaults for a given source surface. */
function defaultsForSource(source: HelpThreadSource): { type: HelpThreadType; category: HelpThreadCategory } {
  switch (source.kind) {
    case 'help_article': return { type: 'knowledge_article', category: 'help_center' };
    case 'feature_request': return { type: 'feature_request', category: 'feature_requests' };
    case 'brad_response': return { type: 'brad_response', category: 'brad_ai' };
    case 'guided_tour': return { type: 'guided_tour', category: 'guided_tours' };
    case 'workflow': return { type: 'workflow_help', category: 'ces_events' };
    case 'form': return { type: 'form_help', category: 'forms' };
    case 'event': return { type: 'ces_event_help', category: 'ces_events' };
    case 'general':
    default:
      return { type: 'general_question', category: 'other' };
  }
}

interface ThreadPanelProps {
  /** The object this panel hangs off (article, form, workflow, event, tour…). */
  source: HelpThreadSource;
  heading?: string;
  onOpenThread: (threadId: string) => void;
  /** Optional external override for the start action; defaults to inline composer. */
  onStartThread?: () => void;
}

/**
 * "Threads about this …" panel embedded on any source surface (Help Center
 * article, knowledge item, form/workflow/event help, guided tour, etc.).
 */
export function ThreadPanel({ source, heading = 'Threads about this', onOpenThread, onStartThread }: ThreadPanelProps) {
  const actor = useThreadActor();
  const threads = useThreadStore(s => s.threads);
  const key = sourceObjectKey(source);
  const [composing, setComposing] = useState(false);
  const defaults = defaultsForSource(source);

  const handleStart = () => {
    if (onStartThread) onStartThread();
    else setComposing(true);
  };

  const related = useMemo(
    () =>
      threads
        .filter(t => sourceObjectKey(t.source) === key && key !== 'general')
        .filter(t => t.status !== 'duplicate' && t.status !== 'archived')
        .filter(t => canViewThread(t, actor.userId, actor.isAdmin))
        .sort((a, b) => {
          // Answered/accepted first, then most recent activity.
          const ay = a.acceptedAnswerMessageId ? 1 : 0;
          const by = b.acceptedAnswerMessageId ? 1 : 0;
          if (ay !== by) return by - ay;
          return a.lastActivityAt < b.lastActivityAt ? 1 : -1;
        }),
    [threads, key, actor.userId, actor.isAdmin],
  );

  const topAnswered = related.find(t => t.acceptedAnswerMessageId || t.status === 'answered' || t.status === 'resolved');
  const open = related.filter(t => t.id !== topAnswered?.id);

  return (
    <section className="grid gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
      <div className="flex items-center justify-between gap-md">
        <h3 className="flex items-center gap-sm text-h3 font-medium text-ink">
          <MessagesSquare aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" /> {heading}
        </h3>
        <Button size="sm" variant="secondary" iconLeft={<Plus className="h-icon-sm w-icon-sm" />} onClick={handleStart}>
          Start a thread
        </Button>
      </div>

      {composing && (
        <ThreadComposer
          source={source}
          defaultType={defaults.type}
          defaultCategory={defaults.category}
          onDone={id => {
            setComposing(false);
            onOpenThread(id);
          }}
          onCancel={() => setComposing(false)}
        />
      )}

      {related.length === 0 ? (
        <p className="text-sm text-muted">No threads yet. Be the first to ask Brad or your team about this.</p>
      ) : (
        <div className="grid gap-sm">
          {topAnswered && (
            <div className="grid gap-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-teal">Top answered</span>
              <ThreadCard thread={topAnswered} onOpen={onOpenThread} />
            </div>
          )}
          {open.length > 0 && (
            <div className="grid gap-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">Open questions</span>
              {open.slice(0, 5).map(t => (
                <ThreadCard key={t.id} thread={t} onOpen={onOpenThread} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default ThreadPanel;
