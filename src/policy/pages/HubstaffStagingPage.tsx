import { useState, useEffect, useCallback, useRef } from 'react';
import { ALL_TASKS, HUBSTAFF_PROJECTS, type HubTask, type ProjectKey } from '@/policy/data/hubstaffTasks';
import { PageHeader, SurfaceCard } from '@/policy/components/ui';

/* ─── Types ──────────────────────────────────────────────────── */

type Phase = 'auth' | 'stage' | 'review' | 'pushing' | 'done';

interface AuthInfo {
  user:          { id: number; name: string; email: string };
  organizations: { id: number; name: string; status: string }[];
}

interface PushResult {
  taskId:  string;
  title:   string;
  project: ProjectKey;
  status:  'created' | 'skipped' | 'failed';
  error?:  string;
}

interface ExistingMap {
  [projectId: string]: Set<string>;
}

const RISK_COLOR: Record<string, string> = {
  critical: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  high:     'bg-amber-500/20 text-amber-300 border-amber-500/30',
  medium:   'bg-sky-500/20   text-sky-300   border-sky-500/30',
  low:      'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const PROJECT_ACCENT: Record<ProjectKey, string> = {
  main:     'border-violet-500/40 bg-violet-500/5',
  cms485:   'border-emerald-500/40 bg-emerald-500/5',
  oasis:    'border-sky-500/40 bg-sky-500/5',
  qapi:     'border-rose-500/40 bg-rose-500/5',
  versions: 'border-amber-500/40 bg-amber-500/5',
};

const PROJECT_DOT: Record<ProjectKey, string> = {
  main:     'bg-violet-400',
  cms485:   'bg-emerald-400',
  oasis:    'bg-sky-400',
  qapi:     'bg-rose-400',
  versions: 'bg-amber-400',
};

/* ─── Helpers ────────────────────────────────────────────────── */

function groupBy<T>(arr: T[], key: (t: T) => string): Record<string, T[]> {
  return arr.reduce((acc, t) => {
    const k = key(t);
    (acc[k] ??= []).push(t);
    return acc;
  }, {} as Record<string, T[]>);
}

async function apiCall<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/hubstaff${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error ?? `HTTP ${res.status}`);
  return data as T;
}

/* ─── Component ──────────────────────────────────────────────── */

export function HubstaffStagingPage() {
  const [phase,       setPhase]       = useState<Phase>('auth');
  const [authInfo,    setAuthInfo]    = useState<AuthInfo | null>(null);
  const [authError,   setAuthError]   = useState('');
  const [orgId,       setOrgId]       = useState('');
  const [selected,    setSelected]    = useState<Set<string>>(new Set(ALL_TASKS.map(t => t.id)));
  const [existing,    setExisting]    = useState<ExistingMap>({});
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [activeProject, setActiveProject]    = useState<ProjectKey>('main');
  const [expandedTask,  setExpandedTask]      = useState<string | null>(null);
  const [results,     setResults]     = useState<PushResult[]>([]);
  const [pushing,     setPushing]     = useState(false);
  const [pushProgress, setPushProgress] = useState(0);
  const [projectIds,  setProjectIds]  = useState<Partial<Record<ProjectKey, string>>>({
    main: '3988878',
  });
  const abortRef = useRef(false);

  /* ── Auth check ─────────────────────────────────────────── */
  useEffect(() => {
    apiCall<AuthInfo & { ok: boolean; error?: string }>('GET', '/auth')
      .then(d => {
        if (!d.ok) { setAuthError(d.error ?? 'Auth failed'); return; }
        setAuthInfo(d);
        if (d.organizations?.[0]) setOrgId(String(d.organizations[0].id));
        setPhase('stage');
      })
      .catch(e => setAuthError(e.message));
  }, []);

  /* ── Load existing tasks for all projects that have an ID ── */
  const loadExisting = useCallback(async (ids: Partial<Record<ProjectKey, string>>) => {
    setLoadingExisting(true);
    const map: ExistingMap = {};
    for (const [, pid] of Object.entries(ids)) {
      if (!pid) continue;
      try {
        const d = await apiCall<{ existingIds: string[] }>('GET', `/projects/${pid}/tasks`);
        map[pid] = new Set(d.existingIds);
      } catch { /* project may not exist yet */ }
    }
    setExisting(map);
    setLoadingExisting(false);
  }, []);

  useEffect(() => {
    if (phase === 'stage') loadExisting(projectIds);
  }, [phase, projectIds, loadExisting]);

  /* ── Selection helpers ──────────────────────────────────── */

  function toggleTask(id: string) {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function selectAllProject(key: ProjectKey, on: boolean) {
    const ids = ALL_TASKS.filter(t => t.project === key).map(t => t.id);
    setSelected(s => {
      const n = new Set(s);
      ids.forEach(id => on ? n.add(id) : n.delete(id));
      return n;
    });
  }

  function isSkipped(task: HubTask): boolean {
    const pid = projectIds[task.project];
    if (!pid) return false;
    return !!existing[pid]?.has(task.id);
  }

  /* ── Push ───────────────────────────────────────────────── */

  async function runPush() {
    abortRef.current = false;
    setPushing(true);
    setPhase('pushing');
    const selectedTasks = ALL_TASKS.filter(t => selected.has(t.id) && !isSkipped(t));
    const res: PushResult[] = [];
    let done = 0;

    for (const task of selectedTasks) {
      if (abortRef.current) break;

      let pid = projectIds[task.project];

      // Auto-create project if no ID yet
      if (!pid) {
        try {
          const proj = HUBSTAFF_PROJECTS.find(p => p.key === task.project)!;
          const d = await apiCall<{ project: { id: number } }>('POST', '/projects', {
            orgId, name: proj.label, description: proj.description,
          });
          pid = String(d.project.id);
          setProjectIds(prev => ({ ...prev, [task.project]: pid }));
        } catch (e) {
          res.push({ taskId: task.id, title: task.title, project: task.project, status: 'failed', error: (e as Error).message });
          done++; setPushProgress(Math.round(done / selectedTasks.length * 100));
          continue;
        }
      }

      try {
        await apiCall('POST', `/projects/${pid}/tasks`, {
          taskId: task.id, title: task.title,
          description: `${task.description}${task.cfr ? `\n\nRegulatory: ${task.cfr}` : ''}`,
          dueDate: task.dueDate,
        });
        res.push({ taskId: task.id, title: task.title, project: task.project, status: 'created' });
      } catch (e) {
        res.push({ taskId: task.id, title: task.title, project: task.project, status: 'failed', error: (e as Error).message });
      }

      done++;
      setPushProgress(Math.round(done / selectedTasks.length * 100));
      // polite delay
      await new Promise(r => setTimeout(r, 150));
    }

    // Skipped tasks
    ALL_TASKS.filter(t => selected.has(t.id) && isSkipped(t)).forEach(t => {
      res.push({ taskId: t.id, title: t.title, project: t.project, status: 'skipped' });
    });

    setResults(res);
    setPushing(false);
    setPhase('done');
  }

  /* ── Stats ──────────────────────────────────────────────── */

  const selectedCount  = selected.size;
  const skippedCount   = ALL_TASKS.filter(t => selected.has(t.id) && isSkipped(t)).length;
  const toCreateCount  = selectedCount - skippedCount;
  const projectTasks   = ALL_TASKS.filter(t => t.project === activeProject);
  const projSelected   = projectTasks.filter(t => selected.has(t.id)).length;
  const projSkipped    = projectTasks.filter(t => isSkipped(t)).length;

  /* ── Render helpers ─────────────────────────────────────── */

  function renderTaskRow(task: HubTask) {
    const skipped  = isSkipped(task);
    const checked  = selected.has(task.id);
    const expanded = expandedTask === task.id;

    return (
      <div
        key={task.id}
        className={`border rounded-lg transition-all ${
          skipped    ? 'border-white/5 opacity-50' :
          checked    ? 'border-white/10 bg-white/[0.02]' :
                       'border-white/5 opacity-60'
        }`}
      >
        <div
          className="flex items-start gap-3 px-3 py-2.5 cursor-pointer select-none"
          onClick={() => !skipped && toggleTask(task.id)}
        >
          {/* Checkbox */}
          <div className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all ${
            skipped   ? 'border-white/10 bg-white/5' :
            checked   ? 'border-[#FFC107] bg-[#FFC107]/20' :
                        'border-white/20'
          }`}>
            {(checked || skipped) && (
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                <polyline points="1.5,5 4,7.5 8.5,2.5" stroke={skipped ? '#666' : '#FFC107'} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-white/30">{task.id}</span>
              {task.risk && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium ${RISK_COLOR[task.risk] ?? RISK_COLOR.low}`}>
                  {task.risk.toUpperCase()}
                </span>
              )}
              {skipped && <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-white/30">ALREADY EXISTS</span>}
            </div>
            <p className={`text-sm mt-0.5 leading-snug ${checked && !skipped ? 'text-white/90' : 'text-white/40'}`}>
              {task.title}
            </p>
            {task.dueDate && <p className="text-[11px] text-white/30 mt-0.5">{task.dueDate}</p>}
          </div>

          {/* Expand toggle */}
          <button
            onClick={e => { e.stopPropagation(); setExpandedTask(expanded ? null : task.id); }}
            className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
          >
            <svg viewBox="0 0 16 16" className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}>
              <polyline points="4,6 8,10 12,6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-10 pb-3 text-xs text-white/40 whitespace-pre-wrap leading-relaxed border-t border-white/5">
            <div className="pt-2">{task.description}</div>
            {task.cfr && <div className="mt-1.5 text-[#FFC107]/50 font-mono">{task.cfr}</div>}
          </div>
        )}
      </div>
    );
  }

  /* ═══ RENDER — Auth error ══════════════════════════════════ */
  if (phase === 'auth' || authError) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-white/70">
        {authError ? (
          <>
            <div className="w-12 h-12 rounded-full bg-rose-500/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-white/90 font-medium mb-1">Hubstaff not connected</p>
              <p className="text-sm text-white/40 max-w-xs">{authError}</p>
              <p className="text-xs text-white/30 mt-3 font-mono">Add HUBSTAFF_PAT to .env and restart the server</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-white/10 border-t-[#FFC107] animate-spin" />
            <span className="text-sm">Connecting to Hubstaff…</span>
          </div>
        )}
      </div>
    );
  }

  /* ═══ RENDER — Done ════════════════════════════════════════ */
  if (phase === 'done') {
    const created = results.filter(r => r.status === 'created').length;
    const skipped = results.filter(r => r.status === 'skipped').length;
    const failed  = results.filter(r => r.status === 'failed').length;

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${failed > 0 ? 'bg-amber-500/20' : 'bg-emerald-500/20'}`}>
              <svg viewBox="0 0 24 24" className={`w-5 h-5 ${failed > 0 ? 'text-amber-400' : 'text-emerald-400'}`} fill="none" stroke="currentColor" strokeWidth={2}>
                {failed > 0
                  ? <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
                  : <><circle cx="12" cy="12" r="10"/><polyline points="9,12 11.5,14.5 15,9.5"/></>
                }
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Push Complete</h2>
              <p className="text-sm text-white/40">
                {created} created · {skipped} skipped · {failed} failed
              </p>
            </div>
          </div>

          {/* Project IDs for saving */}
          {Object.entries(projectIds).filter(([k]) => k !== 'main').length > 0 && (
            <div className="rounded-xl border border-[#FFC107]/20 bg-[#FFC107]/5 p-4">
              <p className="text-xs font-medium text-[#FFC107]/80 mb-2">Save these Project IDs to your .env files:</p>
              {Object.entries(projectIds).filter(([k]) => k !== 'main').map(([k, v]) => (
                <p key={k} className="text-xs font-mono text-white/50">HUBSTAFF_PROJECT_{k.toUpperCase()}={v}</p>
              ))}
            </div>
          )}

          {/* Results by status */}
          {(['created','skipped','failed'] as const).map(status => {
            const statusResults = results.filter(r => r.status === status);
            if (!statusResults.length) return null;
            const label = status === 'created' ? 'Created' : status === 'skipped' ? 'Skipped (already existed)' : 'Failed';
            const color = status === 'created' ? 'text-emerald-400' : status === 'skipped' ? 'text-white/30' : 'text-rose-400';
            return (
              <div key={status}>
                <p className={`text-xs font-medium mb-2 ${color}`}>{label} ({statusResults.length})</p>
                <div className="space-y-1">
                  {statusResults.map(r => (
                    <div key={r.taskId} className="flex items-start gap-2 text-xs">
                      <span className="font-mono text-white/20 flex-shrink-0 w-8">{status === 'created' ? '+' : status === 'skipped' ? '=' : '✗'}</span>
                      <span className="text-white/50 font-mono flex-shrink-0">[{r.taskId}]</span>
                      <span className={status === 'created' ? 'text-white/70' : 'text-white/30'}>{r.title}</span>
                      {r.error && <span className="text-rose-400 ml-1">{r.error}</span>}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-white/5 px-6 py-4">
          <button
            onClick={() => { setPhase('stage'); setResults([]); setPushProgress(0); loadExisting(projectIds); }}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Back to Staging
          </button>
        </div>
      </div>
    );
  }

  /* ═══ RENDER — Pushing ═════════════════════════════════════ */
  if (phase === 'pushing') {
    const done    = results.length;
    const created = results.filter(r => r.status === 'created').length;
    const failed  = results.filter(r => r.status === 'failed').length;
    const last    = results[results.length - 1];

    return (
      <div className="flex flex-col h-full items-center justify-center gap-8 p-8">
        <div className="text-center space-y-2">
          <div className="text-4xl font-light text-white/90">{pushProgress}%</div>
          <p className="text-sm text-white/40">{done} tasks processed</p>
        </div>

        {/* Progress bar */}
        <div className="w-full max-w-md h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#FFC107] transition-all duration-300"
            style={{ width: `${pushProgress}%` }}
          />
        </div>

        {/* Live stats */}
        <div className="flex gap-8 text-center">
          <div><p className="text-xl font-light text-emerald-400">{created}</p><p className="text-xs text-white/30">Created</p></div>
          <div><p className="text-xl font-light text-rose-400">{failed}</p><p className="text-xs text-white/30">Failed</p></div>
        </div>

        {last && (
          <p className="text-xs text-white/30 max-w-sm text-center truncate">
            [{last.project.toUpperCase()}] {last.title}
          </p>
        )}

        <button
          onClick={() => { abortRef.current = true; }}
          className="px-4 py-1.5 rounded-lg text-xs text-rose-400/60 border border-rose-500/20 hover:bg-rose-500/10 transition-all"
        >
          Abort
        </button>
      </div>
    );
  }

  /* ═══ RENDER — Review ══════════════════════════════════════ */
  if (phase === 'review') {
    const toCreate = ALL_TASKS.filter(t => selected.has(t.id) && !isSkipped(t));
    const toSkip   = ALL_TASKS.filter(t => selected.has(t.id) && isSkipped(t));
    const byProj   = groupBy(toCreate, t => t.project);

    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Confirm Push</h2>
            <p className="text-sm text-white/40 mt-1">
              {toCreate.length} tasks will be created · {toSkip.length} already exist and will be skipped
            </p>
          </div>

          {/* Org ID input */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3">
            <p className="text-xs font-medium text-white/50">Organization ID (required for new projects)</p>
            <input
              value={orgId}
              onChange={e => setOrgId(e.target.value)}
              placeholder="Your Hubstaff Org ID"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-[#FFC107]/40 placeholder-white/20"
            />
            {authInfo?.organizations?.map(o => (
              <button key={o.id} onClick={() => setOrgId(String(o.id))}
                className={`text-xs px-3 py-1 rounded-full border transition-all ${orgId === String(o.id) ? 'border-[#FFC107]/40 text-[#FFC107]/80 bg-[#FFC107]/10' : 'border-white/10 text-white/40 hover:border-white/20'}`}>
                {o.name} ({o.id})
              </button>
            ))}
          </div>

          {/* By project */}
          {(Object.entries(byProj) as [ProjectKey, HubTask[]][]).map(([key, tasks]) => {
            const proj = HUBSTAFF_PROJECTS.find(p => p.key === key)!;
            const pid  = projectIds[key];
            return (
              <div key={key} className={`rounded-xl border p-4 ${PROJECT_ACCENT[key]}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${PROJECT_DOT[key]}`} />
                    <span className="text-sm font-medium text-white/80">{proj.label}</span>
                  </div>
                  <span className="text-xs text-white/40">{tasks.length} tasks · {pid ? `#${pid}` : 'auto-create'}</span>
                </div>
                <div className="space-y-1">
                  {tasks.slice(0, 5).map(t => (
                    <p key={t.id} className="text-xs text-white/40 flex gap-2">
                      <span className="font-mono w-44 flex-shrink-0 truncate text-white/20">{t.id}</span>
                      <span>{t.title}</span>
                    </p>
                  ))}
                  {tasks.length > 5 && <p className="text-xs text-white/20">…and {tasks.length - 5} more</p>}
                </div>
              </div>
            );
          })}

          {toSkip.length > 0 && (
            <p className="text-xs text-white/30">{toSkip.length} tasks already exist in Hubstaff and will be skipped (no duplicates created)</p>
          )}
        </div>

        <div className="border-t border-white/5 px-6 py-4 flex items-center justify-between gap-4">
          <button
            onClick={() => setPhase('stage')}
            className="px-5 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
          >
            Back
          </button>
          <button
            onClick={runPush}
            disabled={toCreate.length === 0 || pushing || !orgId.trim()}
            className="px-6 py-2 rounded-lg text-sm font-semibold bg-[#FFC107] text-[#1a0a00] hover:bg-[#ffcd38] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Push {toCreate.length} Tasks
          </button>
        </div>
      </div>
    );
  }

  /* ═══ RENDER — Stage ═══════════════════════════════════════ */

  const categories = HUBSTAFF_PROJECTS.find(p => p.key === activeProject)!.categories;
  const byCategory = groupBy(projectTasks, t => t.category);

  return (
    <div className="flex flex-col h-full p-6" style={{ background: 'transparent' }}>
      <PageHeader
        eyebrow="INTEGRATIONS"
        title="Hubstaff Staging"
        description={`${selectedCount} selected · ${toCreateCount} will create · ${skippedCount} skipped`}
      />

      {/* ── Top bar controls in SurfaceCard */}
      <SurfaceCard padding="md" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="text-xs text-[var(--v3-text-secondary)]">
            {authInfo && <><span className="text-emerald-400">●</span> {authInfo.user.name} · </>}
            {loadingExisting && <span className="ml-2 text-[var(--v3-text-tertiary)]">checking existing…</span>}
          </div>
          <button
            onClick={() => setPhase('review')}
            disabled={toCreateCount === 0}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-[#FFC107] text-[#1a0a00] hover:bg-[#ffcd38] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            Review & Push →
          </button>
        </div>
      </SurfaceCard>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: project tabs ─────────────────────────── */}
        <div className="w-44 flex-shrink-0 border-r border-white/5 py-4 space-y-0.5 overflow-y-auto">
          {HUBSTAFF_PROJECTS.map(proj => {
            const tasks   = ALL_TASKS.filter(t => t.project === proj.key);
            const sel     = tasks.filter(t => selected.has(t.id)).length;
            const skp     = tasks.filter(t => isSkipped(t)).length;
            const active  = activeProject === proj.key;
            return (
              <button
                key={proj.key}
                onClick={() => setActiveProject(proj.key)}
                className={`w-full text-left px-4 py-2.5 transition-all ${active ? 'bg-white/5 text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${PROJECT_DOT[proj.key]}`} />
                  <span className="text-xs font-medium truncate">{proj.shortLabel}</span>
                </div>
                <p className="text-[10px] text-white/25 ml-3.5">{sel}/{tasks.length} sel{skp > 0 ? ` · ${skp} exist` : ''}</p>
              </button>
            );
          })}
        </div>

        {/* ── Right: task list ───────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Project header */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${PROJECT_DOT[activeProject]}`} />
                <span className="text-sm font-medium text-white/80">
                  {HUBSTAFF_PROJECTS.find(p => p.key === activeProject)!.label}
                </span>
                {projectIds[activeProject]
                  ? <span className="text-[10px] text-white/25 font-mono">#{projectIds[activeProject]}</span>
                  : <span className="text-[10px] text-amber-400/60 border border-amber-500/20 rounded px-1">auto-create</span>
                }
              </div>
              <p className="text-xs text-white/30 mt-0.5 ml-4">{projSelected}/{projectTasks.length} selected · {projSkipped} already exist</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => selectAllProject(activeProject, true)}
                className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                Select all
              </button>
              <button onClick={() => selectAllProject(activeProject, false)}
                className="text-xs px-3 py-1 rounded-lg border border-white/10 text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
                None
              </button>
            </div>
          </div>

          {/* Tasks by category */}
          <div className="p-4 space-y-6">
            {categories.map(cat => {
              const catTasks = byCategory[cat];
              if (!catTasks?.length) return null;
              const catSel = catTasks.filter(t => selected.has(t.id)).length;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{cat}</span>
                    <span className="text-[10px] text-white/20">({catSel}/{catTasks.length})</span>
                    <div className="flex-1 h-px bg-white/5" />
                  </div>
                  <div className="space-y-1.5">
                    {catTasks.map(renderTaskRow)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
