/**
 * PM Overlay Store — additive Project Management metadata.
 *
 * RULES (non-negotiable):
 *   - Never writes to CES (regulatoryExecutionStore).
 *   - Never writes to eCIgn backend.
 *   - Stores ONLY PM overlay fields keyed by canonical task_id:
 *       assignment, sprint pin, story points, labels, dependencies, due date,
 *       weekend override, weekend override reason.
 *   - Every action appends a PmAuditEntry.
 *
 * See: Builder/eCIgn-Centered-Submission/12-eCIgn-Integration-with-PM-Tasks.md
 *      Builder/Compliance-Execution-Sprints/PM-Panel-Synchronization.md
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { PmAuditEntry, TaskSource } from './types';
import { assertSchedulable } from './weekendRule';
import type { PmOverlay } from './pmOverlayStore.types';
import { CycleError, wouldCreateCycle, type PmEdge } from './scheduling/dependencyGraph';
import { pmApi, mirror, type ApiOverlay } from './api/pmApiClient';

export type { PmOverlay };

interface PmOverlayState {
  overlays: Record<string, PmOverlay>;
  audit: PmAuditEntry[];

  /* selectors */
  getOverlay: (task_id: string) => PmOverlay | undefined;

  /* mutators (each appends a PmAuditEntry) */
  assign: (task_id: string, user_id: string, actor?: string) => void;
  unassign: (task_id: string, actor?: string) => void;
  pinToSprint: (task_id: string, sprint_id: string, actor?: string) => void;
  unpinSprint: (task_id: string, actor?: string) => void;
  setStoryPoints: (task_id: string, points: number | undefined, actor?: string) => void;
  addLabel: (task_id: string, label: string, actor?: string) => void;
  removeLabel: (task_id: string, label: string, actor?: string) => void;
  addDependency: (task_id: string, depends_on: string, actor?: string) => void;
  removeDependency: (task_id: string, depends_on: string, actor?: string) => void;
  setDueDate: (
    task_id: string,
    due_date: string | undefined,
    source: TaskSource,
    opts?: { weekendOverride?: boolean; reason?: string; isWeekendOk?: boolean; actor?: string },
  ) => void;
  setWeekendOverride: (
    task_id: string,
    override: boolean,
    reason?: string,
    actor?: string,
  ) => void;

  clearOverlay: (task_id: string, actor?: string) => void;
  resetAll: () => void;
  /** Replace local cache with the canonical server snapshot (one-shot). */
  hydrateFromApi: () => Promise<void>;
}

const nowISO = () => new Date().toISOString();

const newAuditId = () =>
  `pm-audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const baseOverlay = (task_id: string): PmOverlay => ({
  task_id,
  labels: [],
  dependencies: [],
});

export const usePmOverlayStore = create<PmOverlayState>()(
  persist(
    (set, get) => {
      const audit = (
        task_id: string,
        actor: string | undefined,
        action: string,
        before: unknown,
        after: unknown,
        reason?: string,
      ) => {
        const entry: PmAuditEntry = {
          id: newAuditId(),
          actor_user_id: actor ?? 'system',
          task_id,
          action,
          before,
          after,
          reason,
          ts: nowISO(),
        };
        set(s => ({ audit: [...s.audit, entry].slice(-1000) }));
      };

      const upsert = (
        task_id: string,
        patch: Partial<PmOverlay>,
        action: string,
        actor: string | undefined,
        reason?: string,
      ) => {
        const before = get().overlays[task_id];
        const next: PmOverlay = {
          ...(before ?? baseOverlay(task_id)),
          ...patch,
          task_id,
          updated_at: nowISO(),
        };
        set(s => ({ overlays: { ...s.overlays, [task_id]: next } }));
        audit(task_id, actor, action, before ?? null, next, reason);
        // Mirror to backend (fire-and-forget; local is optimistic).
        mirror(pmApi.putOverlay(task_id, {
          assigned_user_id: next.assigned_user_id ?? null,
          sprint_id:        next.sprint_id        ?? null,
          story_points:     next.story_points     ?? null,
          labels:           next.labels           ?? [],
          due_date:         next.due_date         ?? null,
          weekend_override: next.weekend_override ?? null,
          weekend_override_reason: next.weekend_override_reason ?? null,
          reason,
        }));
      };

      return {
        overlays: {},
        audit: [],

        getOverlay: id => get().overlays[id],

        assign: (task_id, user_id, actor) =>
          upsert(task_id, { assigned_user_id: user_id }, 'assign', actor),

        unassign: (task_id, actor) =>
          upsert(task_id, { assigned_user_id: undefined }, 'unassign', actor),

        pinToSprint: (task_id, sprint_id, actor) =>
          upsert(task_id, { sprint_id }, 'pinToSprint', actor),

        unpinSprint: (task_id, actor) =>
          upsert(task_id, { sprint_id: undefined }, 'unpinSprint', actor),

        setStoryPoints: (task_id, points, actor) =>
          upsert(task_id, { story_points: points }, 'setStoryPoints', actor),

        addLabel: (task_id, label, actor) => {
          const cur = get().overlays[task_id]?.labels ?? [];
          if (cur.includes(label)) return;
          upsert(task_id, { labels: [...cur, label] }, 'addLabel', actor);
        },

        removeLabel: (task_id, label, actor) => {
          const cur = get().overlays[task_id]?.labels ?? [];
          if (!cur.includes(label)) return;
          upsert(
            task_id,
            { labels: cur.filter(l => l !== label) },
            'removeLabel',
            actor,
          );
        },

        addDependency: (task_id, depends_on, actor) => {
          if (depends_on === task_id) return; // no self-deps
          const cur = get().overlays[task_id]?.dependencies ?? [];
          if (cur.includes(depends_on)) return;
          // Cycle detection across the entire overlay graph.
          // Edge model: depends_on (predecessor) → task_id (successor).
          const edges: PmEdge[] = [];
          for (const ov of Object.values(get().overlays)) {
            for (const dep of ov.dependencies ?? []) {
              edges.push({ from: dep, to: ov.task_id });
            }
          }
          const cyc = wouldCreateCycle(edges, depends_on, task_id);
          if (cyc.cycle) {
            throw new CycleError(cyc.path);
          }
          upsert(
            task_id,
            { dependencies: [...cur, depends_on] },
            'addDependency',
            actor,
          );
          // Mirror dep edge to backend (predecessor → successor).
          mirror(pmApi.addDependency(depends_on, task_id));
        },

        removeDependency: (task_id, depends_on, actor) => {
          const cur = get().overlays[task_id]?.dependencies ?? [];
          if (!cur.includes(depends_on)) return;
          upsert(
            task_id,
            { dependencies: cur.filter(d => d !== depends_on) },
            'removeDependency',
            actor,
          );
          mirror(pmApi.removeDependency(depends_on, task_id));
        },

        setDueDate: (task_id, due_date, source, opts) => {
          // Throws on weekend without override.
          assertSchedulable(due_date, {
            source,
            weekendOverride: opts?.weekendOverride,
            isWeekendOk: opts?.isWeekendOk,
          });
          upsert(
            task_id,
            {
              due_date,
              weekend_override: opts?.weekendOverride,
              weekend_override_reason: opts?.reason,
            },
            'setDueDate',
            opts?.actor,
            opts?.reason,
          );
        },

        setWeekendOverride: (task_id, override, reason, actor) => {
          upsert(
            task_id,
            { weekend_override: override, weekend_override_reason: reason },
            'setWeekendOverride',
            actor,
            reason,
          );
        },

        clearOverlay: (task_id, actor) => {
          const before = get().overlays[task_id];
          if (!before) return;
          set(s => {
            const next = { ...s.overlays };
            delete next[task_id];
            return { overlays: next };
          });
          audit(task_id, actor, 'clearOverlay', before, null);
          mirror(pmApi.deleteOverlay(task_id));
        },

        resetAll: () => set({ overlays: {}, audit: [] }),

        hydrateFromApi: async () => {
          try {
            const [{ overlays }, edgesResp] = await Promise.all([
              pmApi.listOverlays(),
              pmApi.listEdges(),
            ]);
            // Build dep map from edges: successor task_id → list of predecessors.
            const depMap: Record<string, string[]> = {};
            for (const e of (edgesResp.edges ?? [])) {
              if (!depMap[e.to]) depMap[e.to] = [];
              depMap[e.to].push(e.from);
            }
            const next: Record<string, PmOverlay> = {};
            for (const o of overlays) {
              const apiOverlay = o as ApiOverlay;
              next[apiOverlay.task_id] = {
                task_id: apiOverlay.task_id,
                assigned_user_id: apiOverlay.assigned_user_id ?? undefined,
                sprint_id:        apiOverlay.sprint_id        ?? undefined,
                story_points:     apiOverlay.story_points     ?? undefined,
                labels:           apiOverlay.labels           ?? [],
                due_date:         apiOverlay.due_date         ?? undefined,
                weekend_override: apiOverlay.weekend_override ?? undefined,
                weekend_override_reason: apiOverlay.weekend_override_reason ?? undefined,
                dependencies:    depMap[apiOverlay.task_id] ?? [],
                updated_at:       apiOverlay.updated_at,
              };
            }
            // Also surface edges that don't have an overlay row (pure dep-only tasks).
            for (const successor of Object.keys(depMap)) {
              if (!next[successor]) {
                next[successor] = { ...baseOverlay(successor), dependencies: depMap[successor] };
              }
            }
            set({ overlays: next });
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn('[pmOverlayStore.hydrateFromApi] failed; keeping local cache.', err);
          }
        },
      };
    },
    {
      name: 'pm-overlay-v1',
      storage: createJSONStorage(() =>
        typeof window === 'undefined'
          ? ({
              length: 0,
              clear: () => {},
              key: () => null,
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            } satisfies Storage)
          : window.localStorage,
      ),
      version: 1,
    },
  ),
);
