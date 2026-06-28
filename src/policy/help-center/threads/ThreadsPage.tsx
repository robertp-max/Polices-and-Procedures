import { useMemo, useState } from 'react';
import { Search, Plus, MessagesSquare } from 'lucide-react';
import { Button, Select } from '@/v6/primitives';
import { cx } from '@/v6/utils/classNames';
import { useThreadStore } from './threadStore';
import { useThreadActor } from './useThreadActor';
import { ThreadCard } from './ThreadCard';
import {
  buildThreadList,
  THREAD_FILTERS,
  THREAD_SORTS,
  type ThreadListFilter,
  type ThreadListSort,
} from './threadView';

interface ThreadsPageProps {
  onOpenThread: (threadId: string) => void;
  onStartThread: () => void;
}

export function ThreadsPage({ onOpenThread, onStartThread }: ThreadsPageProps) {
  const actor = useThreadActor();
  const threads = useThreadStore(s => s.threads);

  const [filter, setFilter] = useState<ThreadListFilter>('all');
  const [sort, setSort] = useState<ThreadListSort>('recent');
  const [search, setSearch] = useState('');

  const list = useMemo(
    () =>
      buildThreadList(threads, {
        filter,
        sort,
        search,
        userId: actor.userId,
        isAdmin: actor.isAdmin,
        includeDuplicates: filter === 'duplicates',
      }),
    [threads, filter, sort, search, actor.userId, actor.isAdmin],
  );

  return (
    <div className="grid gap-lg">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <h2 className="flex items-center gap-sm text-h2 font-medium text-ink">
          <MessagesSquare aria-hidden="true" className="h-icon-md w-icon-md text-brand-teal" /> Threads
        </h2>
        <Button data-tour-target="thread.start" iconLeft={<Plus className="h-icon-sm w-icon-sm" />} onClick={onStartThread}>
          Start a thread
        </Button>
      </div>

      <div className="grid gap-md desktop:grid-cols-12">
        <div className="desktop:col-span-9 grid gap-md">
          <label className="flex h-control items-center gap-sm rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset px-md text-muted">
            <Search aria-hidden="true" className="h-icon-sm w-icon-sm" />
            <span className="sr-only">Search threads</span>
            <input
              className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-muted focus-visible:shadow-none"
              placeholder="Search threads…"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </label>

          {list.length === 0 ? (
            <div className="rounded-lg border border-hairline bg-surface-glass backdrop-blur-md shadow-glass-inset p-xl text-center text-sm text-muted">
              No threads match this view. Start one to get the conversation going.
            </div>
          ) : (
            <div className="grid gap-sm">
              {list.map(t => (
                <ThreadCard key={t.id} thread={t} onOpen={onOpenThread} />
              ))}
            </div>
          )}
        </div>

        <aside className="desktop:col-span-3 grid content-start gap-md">
          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
            <h3 className="mb-sm text-sm font-medium text-ink">Filter</h3>
            <div className="flex flex-wrap gap-xs">
              {THREAD_FILTERS.map(f => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cx(
                    'rounded-md border px-sm py-xs text-xs transition duration-fast',
                    filter === f.id
                      ? 'border-brand-teal bg-brand-teal text-on-brand'
                      : 'border-hairline bg-surface text-secondary hover:bg-surface-hover',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-card bg-surface-glass backdrop-blur-md shadow-glass-inset p-lg">
            <h3 className="mb-sm text-sm font-medium text-ink">Sort</h3>
            <Select
              options={THREAD_SORTS.map(s => ({ value: s.id, label: s.label }))}
              value={sort}
              onChange={e => setSort(e.target.value as ThreadListSort)}
            />
          </section>
        </aside>
      </div>
    </div>
  );
}

export default ThreadsPage;
