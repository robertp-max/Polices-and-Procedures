import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquarePlus, MessagesSquare, Lightbulb, Compass, ThumbsUp, ThumbsDown } from 'lucide-react';
import type { BradReference } from '@/v6/screens/brad/bradApi';
import { ThreadComposer } from './ThreadComposer';
import { useThreadStore } from './threadStore';
import type { ThreadSourceReference } from './types';

interface BradResponseThreadActionsProps {
  /** Stable id of the Brad response (e.g. the chat message id). */
  responseId: string;
  /** The user's prompt that produced this response. */
  userPrompt: string;
  /** Brad's answer text. */
  responseText: string;
  references?: BradReference[];
}

/** Map a v6 BradReference to a thread source reference (no fabrication). */
function toThreadSource(ref: BradReference): ThreadSourceReference {
  const map: Record<BradReference['type'], ThreadSourceReference['sourceType']> = {
    policy: 'policy',
    workflow: 'workflow',
    form: 'form',
    event: 'event',
    help: 'help_article',
  };
  return {
    id: `${ref.type}:${ref.id}`,
    sourceType: map[ref.type] ?? 'system_doc',
    sourceId: ref.id,
    title: ref.title,
    sectionId: ref.section,
  };
}

const actionBtn =
  'inline-flex items-center gap-1.5 rounded-full border border-[var(--brad-border)] bg-[var(--brad-surface-2)] px-3 py-1 text-xs font-medium text-[#00797D] transition hover:border-[#00797D] hover:bg-[var(--brad-surface)]';

/**
 * Action row rendered under every Brad response: start a thread from the
 * answer, add to an existing thread, create a feature request, start a guided
 * tour, or rate the answer (a low rating offers an improvement thread).
 */
export function BradResponseThreadActions({
  responseId,
  userPrompt,
  responseText,
  references,
}: BradResponseThreadActionsProps) {
  const navigate = useNavigate();
  const addMessage = useThreadStore(s => s.addMessage);
  const [mode, setMode] = useState<null | 'thread' | 'feature'>(null);
  const [rated, setRated] = useState<null | 'up' | 'down'>(null);

  const titleSeed = userPrompt.trim().slice(0, 80) || 'Brad answer';

  function finishThread(threadId: string) {
    // Preserve Brad's answer + citations inside the new thread.
    addMessage(
      {
        threadId,
        authorType: 'brad',
        authorDisplayName: 'Brad',
        body: responseText,
        bradResponseMeta: {
          responseId,
          sourceReferences: (references ?? []).map(toThreadSource),
          confidence: (references?.length ?? 0) >= 2 ? 'high' : 'medium',
        },
      },
      { forceUnsafe: true }, // Brad-authored content is trusted; not re-scanned
    );
    setMode(null);
    navigate(`/help/threads/${threadId}`);
  }

  if (mode === 'thread' || mode === 'feature') {
    const isFeature = mode === 'feature';
    return (
      <div className="mt-2">
        <ThreadComposer
          source={
            isFeature
              ? { kind: 'feature_request', featureRequestId: `fr-${responseId}`, title: titleSeed }
              : { kind: 'brad_response', bradResponseId: responseId }
          }
          defaultType={isFeature ? 'feature_request' : 'brad_response'}
          defaultCategory={isFeature ? 'feature_requests' : 'brad_ai'}
          initialTitle={titleSeed}
          initialBody={userPrompt}
          onDone={finishThread}
          onCancel={() => setMode(null)}
        />
      </div>
    );
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <button type="button" className={actionBtn} onClick={() => setMode('thread')}>
        <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden /> Start thread
      </button>
      <button type="button" className={actionBtn} onClick={() => navigate('/help/threads')}>
        <MessagesSquare className="h-3.5 w-3.5" aria-hidden /> Add to thread
      </button>
      <button type="button" className={actionBtn} onClick={() => setMode('feature')}>
        <Lightbulb className="h-3.5 w-3.5" aria-hidden /> Create feature request
      </button>
      <button type="button" className={actionBtn} onClick={() => navigate('/help/category/guided-tours')}>
        <Compass className="h-3.5 w-3.5" aria-hidden /> Start guided tour
      </button>

      <span className="ml-auto inline-flex items-center gap-1">
        <button
          type="button"
          aria-label="Rate answer helpful"
          aria-pressed={rated === 'up'}
          className={actionBtn}
          onClick={() => setRated('up')}
        >
          <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Rate answer not helpful"
          aria-pressed={rated === 'down'}
          className={actionBtn}
          onClick={() => setRated('down')}
        >
          <ThumbsDown className="h-3.5 w-3.5" aria-hidden />
        </button>
      </span>

      {rated === 'down' && (
        <div className="w-full text-xs text-[var(--brad-muted)]">
          Want to start a thread about what Brad should improve?{' '}
          <button type="button" className="font-medium text-[#00797D] hover:underline" onClick={() => setMode('thread')}>
            Start improvement thread
          </button>
        </div>
      )}
      {rated === 'up' && (
        <div className="w-full text-xs text-[var(--brad-muted)]">Thanks — glad that helped.</div>
      )}
    </div>
  );
}

export default BradResponseThreadActions;
