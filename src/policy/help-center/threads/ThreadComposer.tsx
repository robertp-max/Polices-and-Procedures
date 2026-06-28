import { useState } from 'react';
import { ShieldAlert, GitMerge } from 'lucide-react';
import { Button, Input, Textarea, Select } from '@/v6/primitives';
import type { HelpThreadSource, HelpThreadType, HelpThreadCategory } from './types';
import { THREAD_CATEGORY_LABEL } from './threadView';
import { PHI_FIELD_WARNING, PHI_WARNING_MESSAGE, type PhiScanResult } from './threadPhiGuard';
import { useThreadStore, type CreateThreadInput } from './threadStore';
import { useThreadActor } from './useThreadActor';

interface ThreadComposerProps {
  source: HelpThreadSource;
  defaultType?: HelpThreadType;
  defaultCategory?: HelpThreadCategory;
  /** Prefill the title/body (e.g. from a Brad response). */
  initialTitle?: string;
  initialBody?: string;
  /** Optional explicit error signature (guided-tour failures). */
  errorSignature?: string;
  onDone: (threadId: string) => void;
  onCancel?: () => void;
}

const CATEGORY_OPTIONS = (Object.keys(THREAD_CATEGORY_LABEL) as HelpThreadCategory[]).map(c => ({
  value: c,
  label: THREAD_CATEGORY_LABEL[c],
}));

/** Form for starting a new thread, with PHI guard + duplicate suggestion UX. */
export function ThreadComposer({
  source,
  defaultType = 'general_question',
  defaultCategory = 'other',
  initialTitle = '',
  initialBody = '',
  errorSignature,
  onDone,
  onCancel,
}: ThreadComposerProps) {
  const actor = useThreadActor();
  const createThread = useThreadStore(s => s.createThread);
  const addMessage = useThreadStore(s => s.addMessage);

  const [title, setTitle] = useState(initialTitle);
  const [trying, setTrying] = useState('');
  const [happened, setHappened] = useState(initialBody);
  const [expected, setExpected] = useState('');
  const [category, setCategory] = useState<HelpThreadCategory>(defaultCategory);
  const [tags, setTags] = useState('');

  const [phi, setPhi] = useState<PhiScanResult | null>(null);
  const [suggestion, setSuggestion] = useState<{ candidateId: string; candidateTitle: string } | null>(null);

  function composeBody(): string {
    const parts: string[] = [];
    if (trying.trim()) parts.push(`What I'm trying to do: ${trying.trim()}`);
    if (happened.trim()) parts.push(`What happened: ${happened.trim()}`);
    if (expected.trim()) parts.push(`What I expected: ${expected.trim()}`);
    return parts.join('\n\n') || happened.trim();
  }

  function buildInput(): CreateThreadInput {
    return {
      title: title.trim(),
      body: composeBody(),
      type: defaultType,
      category,
      source,
      createdByUserId: actor.userId,
      createdByDisplayName: actor.displayName,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      errorSignature,
    };
  }

  function submit(opts?: { sanitize?: boolean; confirmCreateDespiteDuplicate?: boolean }) {
    const result = createThread(buildInput(), {
      sanitize: opts?.sanitize,
      confirmCreateDespiteDuplicate: opts?.confirmCreateDespiteDuplicate,
      matchContext: { isAdmin: actor.isAdmin },
    });
    if (!result.ok) {
      setPhi(result.phi);
      return;
    }
    setPhi(null);
    if (result.outcome === 'suggested') {
      setSuggestion({ candidateId: result.candidate.id, candidateTitle: result.candidate.title });
      return;
    }
    onDone(result.thread.id);
  }

  function addToExisting() {
    if (!suggestion) return;
    addMessage(
      {
        threadId: suggestion.candidateId,
        authorType: 'user',
        authorUserId: actor.userId,
        authorDisplayName: actor.displayName,
        body: composeBody(),
      },
      {},
    );
    onDone(suggestion.candidateId);
  }

  const canSubmit = title.trim().length > 0 && composeBody().length > 0;

  return (
    <div className="grid gap-md rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
      <h3 className="text-h3 font-medium text-ink">Start a thread</h3>

      <div className="rounded-md border border-tone-amber-border bg-tone-amber-bg p-sm text-xs text-tone-amber-text">
        {PHI_FIELD_WARNING}
      </div>

      <label className="grid gap-xs text-sm">
        <span className="font-medium text-ink">Title</span>
        <Input data-tour-target="thread.title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Short summary of your question" />
      </label>

      <label className="grid gap-xs text-sm">
        <span className="font-medium text-ink">What are you trying to do?</span>
        <Textarea rows={2} value={trying} onChange={e => setTrying(e.target.value)} />
      </label>

      <label className="grid gap-xs text-sm">
        <span className="font-medium text-ink">What happened? <span className="text-muted">(details)</span></span>
        <Textarea rows={3} value={happened} onChange={e => setHappened(e.target.value)} />
      </label>

      <label className="grid gap-xs text-sm">
        <span className="font-medium text-ink">What did you expect?</span>
        <Textarea rows={2} value={expected} onChange={e => setExpected(e.target.value)} />
      </label>

      <div className="grid gap-md tablet:grid-cols-2">
        <label className="grid gap-xs text-sm">
          <span className="font-medium text-ink">Category</span>
          <Select
            options={CATEGORY_OPTIONS}
            value={category}
            onChange={e => setCategory(e.target.value as HelpThreadCategory)}
          />
        </label>
        <label className="grid gap-xs text-sm">
          <span className="font-medium text-ink">Tags <span className="text-muted">(comma-separated)</span></span>
          <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. evidence, upload" />
        </label>
      </div>

      {phi && (
        <div className="rounded-md border border-tone-red-border bg-tone-red-bg p-md text-sm text-tone-red-text">
          <div className="flex items-center gap-sm font-medium">
            <ShieldAlert aria-hidden="true" className="h-icon-sm w-icon-sm" /> Possible PHI detected
          </div>
          <p className="mt-xs">{PHI_WARNING_MESSAGE}</p>
          <div className="mt-sm flex gap-sm">
            <Button size="sm" variant="secondary" onClick={() => submit({ sanitize: true })}>
              Sanitize and post
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setPhi(null)}>Edit my text</Button>
          </div>
        </div>
      )}

      {suggestion && (
        <div className="rounded-md border border-tone-slate-border bg-tone-slate-bg p-md text-sm text-secondary">
          <div className="flex items-center gap-sm font-medium text-ink">
            <GitMerge aria-hidden="true" className="h-icon-sm w-icon-sm" /> A similar thread already exists
          </div>
          <p className="mt-xs">Add your question to “{suggestion.candidateTitle}” instead?</p>
          <div className="mt-sm flex flex-wrap gap-sm">
            <Button size="sm" variant="primary" onClick={addToExisting}>Add to existing thread</Button>
            <Button size="sm" variant="secondary" onClick={() => onDone(suggestion.candidateId)}>
              View existing thread
            </Button>
            <Button
              size="sm"
              variant="tertiary"
              onClick={() => submit({ confirmCreateDespiteDuplicate: true })}
            >
              Create separate thread anyway
            </Button>
          </div>
        </div>
      )}

      {!phi && !suggestion && (
        <div className="flex gap-sm">
          <Button data-tour-target="thread.post" onClick={() => submit()} disabled={!canSubmit}>Post thread</Button>
          {onCancel && <Button variant="tertiary" onClick={onCancel}>Cancel</Button>}
        </div>
      )}
    </div>
  );
}

export default ThreadComposer;
