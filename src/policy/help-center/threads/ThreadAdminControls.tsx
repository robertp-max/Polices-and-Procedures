import { useState } from 'react';
import { ShieldCheck, Pin, Archive, GitMerge, Undo2 } from 'lucide-react';
import { Button, Select } from '@/v6/primitives';
import type { HelpThread, HelpThreadStatus } from './types';
import { THREAD_STATUS_LABEL } from './threadView';
import { useThreadStore } from './threadStore';

const STATUS_OPTIONS = (Object.keys(THREAD_STATUS_LABEL) as HelpThreadStatus[]).map(s => ({
  value: s,
  label: THREAD_STATUS_LABEL[s],
}));

interface ThreadAdminControlsProps {
  thread: HelpThread;
  onOpenThread: (threadId: string) => void;
}

/** Moderation panel — only rendered for admins. */
export function ThreadAdminControls({ thread, onOpenThread }: ThreadAdminControlsProps) {
  const setStatus = useThreadStore(s => s.setStatus);
  const pinThread = useThreadStore(s => s.pinThread);
  const archiveThread = useThreadStore(s => s.archiveThread);
  const setDoNotMerge = useThreadStore(s => s.setDoNotMerge);
  const mergeThreads = useThreadStore(s => s.mergeThreads);
  const unmergeThread = useThreadStore(s => s.unmergeThread);
  const allThreads = useThreadStore(s => s.threads);
  const mergeRecords = useThreadStore(s => s.mergeRecords);

  const [mergeTarget, setMergeTarget] = useState('');

  const isStub = Boolean(thread.canonicalThreadId) || mergeRecords.some(r => r.sourceThreadId === thread.id);

  const mergeCandidates = allThreads
    .filter(t => t.id !== thread.id && !t.canonicalThreadId && t.status !== 'duplicate' && t.status !== 'archived')
    .map(t => ({ value: t.id, label: t.title }));

  return (
    <section className="grid gap-md rounded-lg border border-tone-slate-border bg-tone-slate-bg p-lg">
      <h4 className="flex items-center gap-xs text-sm font-medium text-ink">
        <ShieldCheck aria-hidden="true" className="h-icon-sm w-icon-sm text-brand-teal" /> Admin controls
      </h4>

      <div className="grid gap-md tablet:grid-cols-2">
        <label className="grid gap-xs text-sm">
          <span className="text-muted">Status</span>
          <Select
            options={STATUS_OPTIONS}
            value={thread.status}
            onChange={e => setStatus(thread.id, e.target.value as HelpThreadStatus)}
          />
        </label>

        <div className="grid gap-xs text-sm">
          <span className="text-muted">Moderation</span>
          <div className="flex flex-wrap gap-sm">
            <Button
              size="sm"
              variant={thread.adminPinned ? 'primary' : 'secondary'}
              iconLeft={<Pin className="h-icon-sm w-icon-sm" />}
              onClick={() => pinThread(thread.id, !thread.adminPinned)}
            >
              {thread.adminPinned ? 'Pinned' : 'Pin'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              iconLeft={<Archive className="h-icon-sm w-icon-sm" />}
              onClick={() => archiveThread(thread.id)}
            >
              Archive
            </Button>
            <Button
              size="sm"
              variant={thread.doNotMerge ? 'primary' : 'secondary'}
              onClick={() => setDoNotMerge(thread.id, !thread.doNotMerge)}
            >
              {thread.doNotMerge ? 'Do-not-merge on' : 'Do not merge'}
            </Button>
          </div>
        </div>
      </div>

      {isStub ? (
        <div className="flex items-center justify-between rounded-md border border-hairline bg-surface p-sm text-sm">
          <span className="text-muted">This thread was merged into another.</span>
          <Button
            size="sm"
            variant="secondary"
            iconLeft={<Undo2 className="h-icon-sm w-icon-sm" />}
            onClick={() => unmergeThread(thread.id)}
          >
            Unmerge
          </Button>
        </div>
      ) : (
        <div className="grid gap-xs text-sm">
          <span className="text-muted">Merge this thread into…</span>
          <div className="flex gap-sm">
            <Select
              className="flex-1"
              emptyLabel="No other threads"
              options={mergeCandidates}
              value={mergeTarget}
              onChange={e => setMergeTarget(e.target.value)}
            />
            <Button
              size="sm"
              variant="secondary"
              iconLeft={<GitMerge className="h-icon-sm w-icon-sm" />}
              disabled={!mergeTarget}
              onClick={() => {
                if (!mergeTarget) return;
                mergeThreads(thread.id, mergeTarget, 'admin', 'Admin manual merge.', 1);
                onOpenThread(mergeTarget);
              }}
            >
              Merge
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

export default ThreadAdminControls;
