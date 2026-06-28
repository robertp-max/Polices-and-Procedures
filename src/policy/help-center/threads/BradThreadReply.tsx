import { Bot, BookOpen, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/v6/primitives';
import type { HelpThreadMessage, BradThreadResponseMeta } from './types';

const CONFIDENCE_LABEL: Record<BradThreadResponseMeta['confidence'], string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

interface BradThreadReplyProps {
  message: HelpThreadMessage;
  onOpenReference?: (route: string) => void;
  onRunAction?: (actionId: string) => void;
}

/** Renders a Brad-authored thread message with citations + suggested actions. */
export function BradThreadReply({ message, onOpenReference, onRunAction }: BradThreadReplyProps) {
  const meta = message.bradResponseMeta;
  return (
    <div className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
      <div className="flex items-center gap-sm">
        <span className="inline-flex h-icon-md w-icon-md items-center justify-center rounded-full bg-brand-teal text-on-brand">
          <Bot aria-hidden="true" className="h-icon-sm w-icon-sm" />
        </span>
        <span className="font-medium text-ink">Brad</span>
        {meta && <Badge size="sm">{CONFIDENCE_LABEL[meta.confidence]}</Badge>}
      </div>

      <p className="mt-sm whitespace-pre-wrap text-sm text-secondary">{message.body}</p>

      {meta && meta.sourceReferences.length > 0 && (
        <div className="mt-md">
          <h5 className="mb-xs flex items-center gap-xs text-xs font-semibold uppercase tracking-wider text-brand-teal">
            <BookOpen aria-hidden="true" className="h-icon-sm w-icon-sm" /> Sources
          </h5>
          <ul className="grid gap-xs">
            {meta.sourceReferences.map(ref => (
              <li key={ref.id}>
                <button
                  type="button"
                  disabled={!ref.route}
                  onClick={() => ref.route && onOpenReference?.(ref.route)}
                  className="w-full text-left rounded-md border border-hairline bg-surface px-sm py-xs text-sm text-ink hover:bg-surface-hover disabled:cursor-default disabled:opacity-80"
                >
                  <span className="font-medium">{ref.title}</span>
                  {ref.quoteOrSummary && (
                    <span className="block text-xs text-muted">{ref.quoteOrSummary}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {meta && meta.limitations && meta.limitations.length > 0 && (
        <div className="mt-md rounded-md border border-tone-amber-border bg-tone-amber-bg p-sm text-xs text-tone-amber-text">
          <span className="flex items-center gap-xs font-medium">
            <AlertTriangle aria-hidden="true" className="h-icon-sm w-icon-sm" /> Limitations
          </span>
          <ul className="mt-xs list-disc pl-md">
            {meta.limitations.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
        </div>
      )}

      {meta && meta.suggestedActions && meta.suggestedActions.length > 0 && (
        <div className="mt-md flex flex-wrap gap-xs">
          {meta.suggestedActions.map(a => (
            <button
              key={a.id}
              type="button"
              onClick={() => onRunAction?.(a.id)}
              className="inline-flex items-center gap-xs rounded-md border border-brand-teal bg-surface-glass backdrop-blur-md shadow-glass-inset px-sm py-xs text-sm text-brand-teal hover:bg-surface-hover"
            >
              {a.label}
              <ArrowRight aria-hidden="true" className="h-icon-sm w-icon-sm" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default BradThreadReply;
